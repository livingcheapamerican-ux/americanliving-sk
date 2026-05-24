const fs = require('fs');
const path = './src/pages/MojaPonuka.jsx';
let content = fs.readFileSync(path, 'utf8');
content = content.replace(
  /name: \`Asistent pre ponuku: \$\{quote.dom_data\?\.nazov \|\| 'Neznámy'\}\`,\n\s*quote_id: quote.id/,
  'user_id: user?.id, saved_quote_id: id, dom_nazov: quote?.dom_nazov'
);
fs.writeFileSync(path, content);
