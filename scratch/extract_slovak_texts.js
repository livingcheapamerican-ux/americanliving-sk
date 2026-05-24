import fs from 'fs';
import path from 'path';

const files = [
  'src/pages/Domov.jsx',
  'src/pages/AkoToFunguje.jsx',
  'src/pages/KatalogModularneDomy.jsx',
  'src/pages/KatalogMobilneDomy.jsx',
  'src/pages/KatalogMontovaneDomy.jsx',
  'src/pages/DotaciaAmericana.jsx'
];

let output = '';

function extractTexts(filePath) {
  const content = fs.readFileSync(filePath, 'utf8');
  output += `\n=== File: ${filePath} ===\n`;
  
  // Find all text inside tags, e.g., >some text<, or "some text", or 'some text'
  const textInTagRegex = />([^<>\n\r{}]*[áéíóúýčďľňšťžô][^<>\n\r{}]*)</g;
  const stringRegex = /"([^"\n\r{}]*[áéíóúýčďľňšťžô][^"\n\r{}]*)"|'([^'\n\r{}]*[áéíóúýčďľňšťžô][^'\n\r{}]*)'/g;
  
  let match;
  const found = new Set();
  
  while ((match = textInTagRegex.exec(content)) !== null) {
    const text = match[1].trim();
    if (text) found.add(text);
  }
  
  while ((match = stringRegex.exec(content)) !== null) {
    const text = (match[1] || match[2]).trim();
    if (text) found.add(text);
  }
  
  found.forEach(t => {
    output += `- "${t}"\n`;
  });
}

files.forEach(f => {
  const fullPath = path.resolve(f);
  if (fs.existsSync(fullPath)) {
    extractTexts(fullPath);
  } else {
    output += `File not found: ${f}\n`;
  }
});

fs.writeFileSync('scratch/extracted_slovak_texts.txt', output, 'utf8');
console.log('Saved to scratch/extracted_slovak_texts.txt');
