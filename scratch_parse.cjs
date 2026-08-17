const fs = require('fs');
const path = require('path');
const pdfParse = require('pdf-parse');

async function parse() {
  let dataBuffer = fs.readFileSync(path.join(process.cwd(), 'public', 'WORD.pdf'));
  const data = await pdfParse(dataBuffer);
  console.log(data.text);
}

parse().catch(console.error);
