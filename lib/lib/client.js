const path = require('path');
const fs = require('fs');

let string = null;
module.exports = function client() {
  if (string) return string;
  string = fs.readFileSync(path.join(__dirname, '..', 'client.js'), 'utf8');
  return string;
};
