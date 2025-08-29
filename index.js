const express = require("express");
const cors = require("cors");
const helmet = require("helmet");

const app = express();
app.use(helmet());
app.use(cors());
app.use(express.json({ limit: "512kb" }));

// ----- Identity (change these to your values before deployment) -----
const FULL_NAME = "john_doe";      // lowercase full name
const DOB_DDMMYYYY = "17091999";   // ddmmyyyy format
const EMAIL = "john@xyz.com";
const ROLL_NUMBER = "ABCD123";

// ----- Helpers -----
const isIntegerString = (s) => /^-?\d+$/.test(s);
const isAlphabetic = (s) => /^[A-Za-z]+$/.test(s);
const isSpecialOnly = (s) => s.length > 0 && /^[^A-Za-z0-9]+$/.test(s);

function buildConcatString(tokens) {
  const letters = [];
  for (const t of tokens) {
    const matches = String(t).match(/[A-Za-z]/g);
    if (matches) letters.push(...matches);
  }
  letters.reverse();
  return letters
    .map((ch, i) => (i % 2 === 0 ? ch.toUpperCase() : ch.toLowerCase()))
    .join("");
}

function classify(tokens) {
  const even_numbers = [];
  const odd_numbers = [];
  const alphabets = [];
  const special_characters = [];
  let sum = 0n;

  for (const raw of tokens) {
    const t = String(raw);

    if (isIntegerString(t)) {
      const n = BigInt(t);
      sum += n;
      if (n % 2n === 0n) even_numbers.push(t);
      else odd_numbers.push(t);
      continue;
    }

    if (isAlphabetic(t)) {
      alphabets.push(t.toUpperCase());
      continue;
    }

    if (isSpecialOnly(t)) {
      special_characters.push(t);
      continue;
    }
    // mixed tokens ignored in arrays, but letters still counted in concat_string
  }

  return {
    even_numbers,
    odd_numbers,
    alphabets,
    special_characters,
    sum: sum.toString(),
    concat_string: buildConcatString(tokens),
  };
}

// ----- API -----
app.post("/bfhl", (req, res) => {
  try {
    if (!req.body || !Array.isArray(req.body.data)) {
      return res.status(400).json({
        is_success: false,
        error: 'Invalid payload: expected { "data": [...] }',
      });
    }

    const result = classify(req.body.data);

    const payload = {
      is_success: true,
      user_id: `${FULL_NAME}_${DOB_DDMMYYYY}`,
      email: EMAIL,
      roll_number: ROLL_NUMBER,
      odd_numbers: result.odd_numbers,
      even_numbers: result.even_numbers,
      alphabets: result.alphabets,
      special_characters: result.special_characters,
      sum: result.sum,
      concat_string: result.concat_string,
    };

    return res.status(200).json(payload);
  } catch (err) {
    return res.status(500).json({
      is_success: false,
      error: "Internal Server Error",
      detail: String(err),
    });
  }
});

// Health check (optional)
app.get("/", (_req, res) => {
  res.json({ status: "ok", message: "BFHL backend is running" });
});

// Start server locally
const PORT = process.env.PORT || 3000;
app.listen(PORT, () =>
  console.log(`🚀 BFHL API running at http://localhost:${PORT}`)
);

module.exports = app; // for Vercel
