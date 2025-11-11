const fs = require('fs');
const readline = require('readline');

function readFileInChunks(filePath, chunkSize = 1000) {
  return new Promise((resolve, reject) => {
    const stream = readline.createInterface({
      input: fs.createReadStream(filePath),
      output: process.stdout,
      terminal: false
    });

    let chunk = [];
    const chunks = [];

    stream.on('line', (line) => {
      chunk.push(...line.split(/\s+/));
      if (chunk.length >= chunkSize) {
        chunks.push(chunk);
        chunk = [];
      }
    });

    stream.on('close', () => {
      if (chunk.length > 0) {
        chunks.push(chunk);
      }
      resolve(chunks);
    });

    stream.on('error', reject);
  });
}
function getLongestWord(chunk) {
  return chunk.reduce((longest, word) => word.length > longest.length ? word : longest, '');
}
function getShortestWord(chunk) {
  if (chunk.length === 0) return null;

  let shortest = chunk[0];
  for (let i = 1; i < chunk.length; i++) {
    if (chunk[i].length < shortest.length) {
      shortest = chunk[i];
    }
  }
  return shortest;
}

function processChunk(chunk, minLen){
  let wordFreq = {};
  chunk = chunk.filter(word => word.length >= minLen);

  chunk.forEach(word => {
    word = word.toLowerCase();
    wordFreq[word] = (wordFreq[word] || 0) + 1;
  });

  return { totalWords: chunk.length, longestWord: getLongestWord(chunk), shortestWord: getShortestWord(chunk), uniqueWords: Object.keys(wordFreq) };
}
