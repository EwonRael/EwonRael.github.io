#!/usr/bin/env python3
"""Regenerates table.odt and table.pdf (the printable host answer-key) from
questions.md, via an intermediate HTML table converted with headless LibreOffice.

Run with: python3 generate_table.py
"""

import os
import shutil
import subprocess
import sys
import tempfile

from generate import parse_questions, escape_html

DIR = os.path.dirname(os.path.abspath(__file__))


def build_table_html(categories):
    header_cells = "".join(f"<th>{escape_html(c['name'])}</th>" for c in categories)

    rows = []
    num_values = len(categories[0]["clues"])
    for i in range(num_values):
        cells = []
        for c in categories:
            clue = c["clues"][i]
            cells.append(
                f"<td><i>{escape_html(clue['clue'])}</i><br>{escape_html(clue['question'])}</td>"
            )
        rows.append("<tr>" + "".join(cells) + "</tr>")

    return f"""<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<style>
@page {{ size: landscape; margin: 1cm; }}
body {{ font-family: "FreeSerif", serif; }}
table {{ border-collapse: collapse; width: 100%; table-layout: fixed; }}
th, td {{ border: 1px solid black; padding: 5px; text-align: left; vertical-align: top; font-size: 10pt; word-wrap: break-word; }}
th {{ font-weight: bold; text-align: center; }}
</style>
</head>
<body>
<table>
<tr>{header_cells}</tr>
{''.join(rows)}
</table>
</body>
</html>
"""


def convert(src_path, target_format, outdir):
    result = subprocess.run(
        [
            "soffice",
            "--headless",
            "--convert-to",
            target_format,
            "--outdir",
            outdir,
            src_path,
        ],
        capture_output=True,
        text=True,
        timeout=120,
    )
    if result.returncode != 0:
        print(result.stdout)
        print(result.stderr, file=sys.stderr)
        raise RuntimeError(f"soffice conversion to {target_format} failed")


def main():
    with open(os.path.join(DIR, "questions.md")) as f:
        raw = f.read()
    categories = parse_questions(raw)
    html = build_table_html(categories)

    with tempfile.TemporaryDirectory() as tmp:
        html_path = os.path.join(tmp, "table.html")
        with open(html_path, "w") as f:
            f.write(html)

        convert(html_path, "odt", tmp)
        odt_path = os.path.join(tmp, "table.odt")
        convert(odt_path, "pdf", tmp)
        pdf_path = os.path.join(tmp, "table.pdf")

        shutil.copyfile(odt_path, os.path.join(DIR, "table.odt"))
        shutil.copyfile(pdf_path, os.path.join(DIR, "table.pdf"))

    print("Generated table.odt and table.pdf from questions.md.")


if __name__ == "__main__":
    main()
