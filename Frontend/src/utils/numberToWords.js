// Utility to convert numbers to words in Indian/International numbering system

const ones = [
  "", "One", "Two", "Three", "Four", "Five", "Six", "Seven", "Eight", "Nine",
  "Ten", "Eleven", "Twelve", "Thirteen", "Fourteen", "Fifteen", "Sixteen",
  "Seventeen", "Eighteen", "Nineteen"
];

const tens = [
  "", "", "Twenty", "Thirty", "Forty", "Fifty", "Sixty", "Seventy", "Eighty", "Ninety"
];

function convertLessThanThousand(num) {
  let str = "";
  if (num >= 100) {
    str += ones[Math.floor(num / 100)] + " Hundred ";
    num %= 100;
  }
  if (num >= 20) {
    str += tens[Math.floor(num / 10)] + " ";
    num %= 10;
  }
  if (num > 0) {
    str += ones[num] + " ";
  }
  return str.trim();
}

/**
 * Converts a number to words (Indian numbering: Crore, Lakh, Thousand, Hundred)
 */
export function numberToWordsINR(amount) {
  const num = Math.floor(Math.abs(Number(amount) || 0));
  const decimal = Math.round((Math.abs(Number(amount) || 0) - num) * 100);

  if (num === 0 && decimal === 0) return "Zero Rupees Only";

  let words = "";

  const crore = Math.floor(num / 10000000);
  let remainder = num % 10000000;

  const lakh = Math.floor(remainder / 100000);
  remainder = remainder % 100000;

  const thousand = Math.floor(remainder / 1000);
  remainder = remainder % 1000;

  const hundred = remainder;

  if (crore > 0) {
    words += convertLessThanThousand(crore) + " Crore ";
  }
  if (lakh > 0) {
    words += convertLessThanThousand(lakh) + " Lakh ";
  }
  if (thousand > 0) {
    words += convertLessThanThousand(thousand) + " Thousand ";
  }
  if (hundred > 0) {
    words += convertLessThanThousand(hundred) + " ";
  }

  words = words.trim();

  let result = words ? `${words} Rupees` : "";

  if (decimal > 0) {
    const decimalWords = convertLessThanThousand(decimal);
    result = result ? `${result} and ${decimalWords} Paise` : `${decimalWords} Paise`;
  }

  return `${result} Only`.trim();
}

/**
 * General amount to words supporting multiple currencies
 */
export function amountToWords(amount, currency = "INR") {
  const curr = (currency || "INR").toUpperCase();
  if (curr === "INR") {
    return numberToWordsINR(amount);
  }

  // Western numbering for USD/EUR/GBP
  const num = Math.floor(Math.abs(Number(amount) || 0));
  const decimal = Math.round((Math.abs(Number(amount) || 0) - num) * 100);
  
  const units = ["", "Thousand", "Million", "Billion"];
  let words = "";
  let temp = num;
  let unitIdx = 0;

  while (temp > 0) {
    const chunk = temp % 1000;
    if (chunk > 0) {
      const chunkWords = convertLessThanThousand(chunk);
      words = `${chunkWords} ${units[unitIdx]} ${words}`.trim();
    }
    temp = Math.floor(temp / 1000);
    unitIdx++;
  }

  const currencyName = curr === "USD" ? "Dollars" : curr === "EUR" ? "Euros" : curr === "GBP" ? "Pounds" : curr;
  const decimalName = curr === "USD" ? "Cents" : curr === "EUR" ? "Cents" : curr === "GBP" ? "Pence" : "Cents";

  let result = words ? `${words} ${currencyName}` : `Zero ${currencyName}`;
  if (decimal > 0) {
    result += ` and ${convertLessThanThousand(decimal)} ${decimalName}`;
  }

  return `${result} Only`.trim();
}

export default amountToWords;
