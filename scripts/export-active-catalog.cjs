// Read the same registry used by the application, including customer revisions.
const fs = require('node:fs');
const path = require('node:path');
const ts = require('typescript');
require.extensions['.ts'] = (module, file) => module._compile(ts.transpileModule(fs.readFileSync(file, 'utf8'), {
  compilerOptions: { module: ts.ModuleKind.CommonJS, esModuleInterop: true, target: ts.ScriptTarget.ES2022 }
}).outputText, file);
const { products, retiredProducts } = require('../src/data/catalog.ts');
const destination = path.join(__dirname, '../research/active-catalog.json');
fs.writeFileSync(destination, JSON.stringify({ products, retiredProducts }, null, 2) + '\n');
console.log(`Active: ${products.length}; retired: ${retiredProducts.length}`);
