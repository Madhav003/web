const fs = require('fs');

const dataFilePath = 'example.json';

fs.readFile(dataFilePath, 'utf8', (err, data) => {
  if (err) {
    console.error('Error reading the file:', err);
    return;
  }
  console.log('File content:', data);
});
