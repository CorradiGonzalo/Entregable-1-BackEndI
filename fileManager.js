const fs = require('fs');

// Utilidades
const readFile = (path) => {
  if (!fs.existsSync(path)) return [];
  const data = fs.readFileSync(path, 'utf-8');
  return data ? JSON.parse(data) : [];
};

const writeFile = (path, data) => {
  fs.writeFileSync(path, JSON.stringify(data, null, 2));
};

module.exports = {readFile, writeFile};