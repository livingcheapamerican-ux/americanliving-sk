import fs from 'fs';
import path from 'path';

const file1 = 'src/components/KonfiguratorTicabhouse.jsx';
const file2 = 'src/components/KonfiguratorLyon.jsx';
const file3 = 'src/components/konfigurator/ProstoHouseKonfigurator.jsx';

const ticabReplacement = fs.readFileSync('scratch/ticab-replacement.txt', 'utf8').trim();
const prostoReplacement = fs.readFileSync('scratch/prosto-replacement.txt', 'utf8').trim();

function processFile(filePath, replacementText) {
  console.log(`Processing file: ${filePath}`);
  const content = fs.readFileSync(filePath, 'utf8');
  
  const startIndex = content.indexOf('const ConfiguratorRow = ({');
  if (startIndex === -1) {
    console.error(`Could not find const ConfiguratorRow in ${filePath}`);
    return;
  }
  
  // Find where it ends by looking for OptionCard
  let endIndex = content.indexOf('const OptionCard = ({');
  if (endIndex === -1) {
    endIndex = content.indexOf('// Kompatibilný starý OptionCard');
  }
  
  if (endIndex === -1) {
    console.error(`Could not find end marker (OptionCard) in ${filePath}`);
    return;
  }
  
  // Perform the replacement
  const newContent = content.substring(0, startIndex) + replacementText + '\n\n' + content.substring(endIndex);
  fs.writeFileSync(filePath, newContent, 'utf8');
  console.log(`Successfully replaced ConfiguratorRow in ${filePath}`);
}

processFile(file1, ticabReplacement);
processFile(file2, ticabReplacement);
processFile(file3, prostoReplacement);
