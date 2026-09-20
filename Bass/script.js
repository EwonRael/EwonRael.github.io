// Song list, in playing order (easiest -> hardest)
const songs = [
  { file: "01 The Beatles - Come Together.ogg", title: "Come Together", artist: "The Beatles" },
  { file: "02 Michael Jackson - Beat It.ogg", title: "Beat It", artist: "Michael Jackson" },
  { file: "03 Lonesone Pie - Monkey.ogg", title: "Monkey", artist: "Lonesome Pie" },
  { file: "04 Oingo Boingo - Weird Science Bass.ogg", title: "Weird Science", artist: "Oingo Boingo" },
  { file: "05 Fountains Of Wayne - Denise.ogg", title: "Denise", artist: "Fountains of Wayne" },
  { file: "06 They Might Be Giants - Dont Lets Start.ogg", title: "Don't Let's Start", artist: "They Might Be Giants" },
  { file: "07 Roxy Music - Oh yeah.ogg", title: "Oh Yeah", artist: "Roxy Music" },
  { file: "08 Owen Earl - Patrick.ogg", title: "Patrick", artist: "Owen Earl" },
  { file: "09 XTC - The Smartest Monkeys.ogg", title: "The Smartest Monkeys", artist: "XTC" },
  { file: "10 Radiohead - Planet Telex.ogg", title: "Planet Telex", artist: "Radiohead" },
];

let current = 0;
let score = 0;
let solved = false;

const player = document.getElementById("player");
const guessInput = document.getElementById("guess");
const submitBtn = document.getElementById("submitBtn");
const hintBtn = document.getElementById("hintBtn");
const skipBtn = document.getElementById("skipBtn");
const nextBtn = document.getElementById("nextBtn");
const feedback = document.getElementById("feedback");
const hint = document.getElementById("hint");
const progress = document.getElementById("progress");
const finalEl = document.getElementById("final");

// Normalize a string for comparison: lowercase, strip punctuation, collapse whitespace.
function normalize(str) {
  return str
    .toLowerCase()
    .replace(/['’"()\-.,!?]/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

// Standard Levenshtein edit distance, used to tolerate typos in guesses.
function levenshtein(a, b) {
  const m = a.length, n = b.length;
  const d = Array.from({ length: m + 1 }, () => new Array(n + 1).fill(0));
  for (let i = 0; i <= m; i++) d[i][0] = i;
  for (let j = 0; j <= n; j++) d[0][j] = j;
  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      d[i][j] = Math.min(
        d[i - 1][j] + 1,
        d[i][j - 1] + 1,
        d[i - 1][j - 1] + cost
      );
    }
  }
  return d[m][n];
}

function isCorrect(guess, answer) {
  const g = normalize(guess);
  const a = normalize(answer);
  if (!g) return false;
  if (g === a) return true;
  if (a.includes(g) && g.length >= 3) return true;
  const dist = levenshtein(g, a);
  const threshold = Math.max(1, Math.floor(a.length * 0.25));
  return dist <= threshold;
}

function loadSong(index) {
  solved = false;
  const song = songs[index];
  player.src = encodeURI(song.file);
  guessInput.value = "";
  feedback.textContent = "";
  hint.textContent = "";
  nextBtn.style.display = "none";
  guessInput.disabled = false;
  submitBtn.disabled = false;
  hintBtn.disabled = false;
  skipBtn.disabled = false;
  progress.textContent = `Song ${index + 1} of ${songs.length} — Score: ${score}`;
  guessInput.focus();
}

function lockSong(message) {
  solved = true;
  feedback.textContent = message;
  guessInput.disabled = true;
  submitBtn.disabled = true;
  hintBtn.disabled = true;
  skipBtn.disabled = true;
  if (current < songs.length - 1) {
    nextBtn.style.display = "inline";
  } else {
    finalEl.style.display = "block";
    finalEl.textContent = `Done! Final score: ${score} / ${songs.length}`;
  }
}

function submitGuess() {
  if (solved) return;
  const song = songs[current];
  if (isCorrect(guessInput.value, song.title)) {
    score++;
    lockSong(`Correct! It was "${song.title}" by ${song.artist}.`);
  } else {
    feedback.textContent = "Not quite, try again (or use a hint / skip).";
  }
}

function showHint() {
  const song = songs[current];
  hint.textContent = `Artist: ${song.artist}`;
}

function skipSong() {
  const song = songs[current];
  lockSong(`Skipped. It was "${song.title}" by ${song.artist}.`);
}

function nextSong() {
  current++;
  loadSong(current);
}

submitBtn.addEventListener("click", submitGuess);
hintBtn.addEventListener("click", showHint);
skipBtn.addEventListener("click", skipSong);
nextBtn.addEventListener("click", nextSong);
guessInput.addEventListener("keydown", (e) => {
  if (e.key === "Enter") submitGuess();
});

loadSong(current);
