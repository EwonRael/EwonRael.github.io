"""Build intact specimen shortlists. Requires fontTools, uharfbuzz, woff2_decompress."""
import io
import json
import re
import shutil
import subprocess
import tempfile
from pathlib import Path

import uharfbuzz as hb
from fontTools.ttLib import TTFont

ROOT = Path(__file__).resolve().parent
FONTS = {
    'HoboATR': 'Hobo/HoboATR-Regular.woff2',
    'HoboATR-300': 'Hobo/HoboATR-Light.woff2',
    'NewsGothic': 'News Gothic/NewsGothic-Regular.woff2',
    'TiffanyGothicATR': 'Tiffany Gothic/TiffanyGothicATR-Regular.woff2',
}
bank = json.loads((ROOT / 'specimen-words.json').read_text())
for source in sorted(Path('/tmp/atf_books').glob('*.txt')):
    bank.extend(' '.join(line.split()) for line in source.read_text(errors='replace').splitlines()
                if len(' '.join(line.split())) > 45)
# Preserve source entries; never concatenate fragments to fill a line.
bank = [s for s in dict.fromkeys(bank)
        if re.fullmatch(r"[A-Z][A-Za-z ,&'’.-]+", s)
        and not re.search(r'\b(Point|Series|fonts?|Ty|pe|Ap)\b', s, re.I)
        and not re.search(r'\b(and|or|the|of|to|in|by|with|for|a|an)$', s, re.I)]
shortlists, selected = {}, {}
choices = json.loads((ROOT / 'specimen-selection.json').read_text())
for key, path in FONTS.items():
    with tempfile.TemporaryDirectory(prefix='specimen-font-') as folder:
        source = Path(folder) / 'font.woff2'
        shutil.copyfile(ROOT / path, source)
        subprocess.run(['woff2_decompress', str(source)], check=True, capture_output=True)
        face = hb.Face(source.with_suffix('.ttf').read_bytes())
    font = hb.Font(face)
    def measure(text):
        buf = hb.Buffer()
        buf.add_str(text)
        buf.guess_segment_properties()
        hb.shape(font, buf)
        return sum(p.x_advance for p in buf.glyph_positions) / face.upem
    measured = [(s, measure(s)) for s in bank]
    shortlists[key], selected[key] = {}, {}
    for size in [96, 72, 60, 48, 36, 30, 24, 18, 14, 12]:
        fitting = sorted([(s, w * size) for s, w in measured if 278 <= w * size <= 295.5],
                         key=lambda item: -item[1])[:40]
        if len(fitting) < 40:
            raise ValueError(f'{key} {size}: only {len(fitting)} candidates')
        shortlists[key][size] = [s for s, w in fitting]
        indices = choices.get(key, {}).get(str(size), list(range(10)))
        selected[key][size] = [fitting[i][0] for i in indices]
        print(key, size, ' | '.join(selected[key][size]))
(ROOT / 'specimen-candidates.json').write_text(json.dumps(shortlists, indent=1) + '\n')
(ROOT / 'specimen-lines.json').write_text(json.dumps(selected, indent=1) + '\n')
