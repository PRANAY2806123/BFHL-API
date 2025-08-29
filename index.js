const express = require('express');
const app = express();
require('dotenv').config();

app.use(express.json());

const PORT = 3000;

app.post('/bfhl', (req, res) => {
  try {
    const inputArray = req.body.data;
    if (!Array.isArray(inputArray)) {
      return res.status(400).json({ is_success: false, error: "Invalid input" });
    }

    const numbers = [];
    const alphabets = [];
    const specialChars = [];

    inputArray.forEach(el => {
      if (/^-?\d+$/.test(el)) {
        numbers.push(el);
      } else if (/^[a-zA-Z]+$/.test(el)) {
        alphabets.push(el.toUpperCase());
      } else {
        specialChars.push(el);
      }
    });

    const evenNumbers = numbers.filter(n => parseInt(n) % 2 === 0);
    const oddNumbers = numbers.filter(n => parseInt(n) % 2 !== 0);
    const sum = numbers.reduce((acc, cur) => acc + parseInt(cur), 0).toString();

    const concatString = alphabets.join('').split('').reverse().map((ch, i) =>
      i % 2 === 0 ? ch.toUpperCase() : ch.toLowerCase()
    ).join('');

    const response = {
      is_success: true,
      user_id: "Naga_Pranay_Kadiyala_28062004",
      email: "knpranay2806@gmail.com",
      roll_number: "22BCE2482",
      even_numbers: evenNumbers,
      odd_numbers: oddNumbers,
      alphabets: alphabets,
      special_characters: specialChars,
      sum: sum,
      concat_string: concatString
    };

    return res.status(200).json(response);
  } catch (err) {
    return res.status(500).json({ is_success: false, error: err.message });
  }
});

app.listen(PORT, () => {
  console.log("Server is running on port ${PORT}");
});