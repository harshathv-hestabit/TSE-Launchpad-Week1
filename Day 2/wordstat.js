const { program } = require('commander');
const {performance} = require('perf_hooks'); 
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

async function processFile(filePath, minLen = 0, unique = false, topN = 0, concurrency = 1) {
  const metrics = { concurrency, totalWords: 0, longestWord: '', shortestWord: null, uniqueWords: 0, topWords: [], timeMs: 0 };
  const startTime = performance.now();

  try {
    const chunks = await readFileInChunks(filePath);

    let totalWords = 0;
    let longestWord = '';
    let shortestWord = null;
    let wordFreq = {};
    let uniqueWords = null;
    if(unique) uniqueWords = new Set();

    async function processChunksConcurrently(chunks, concurrency) {
      let index = 0;

      async function worker() {
        while (index < chunks.length) {
          const currentIndex = index++;
          const result = processChunk(chunks[currentIndex], minLen);

          totalWords += result.totalWords;
          if (result.longestWord.length > longestWord.length) longestWord = result.longestWord;
          if (result.shortestWord && (!shortestWord || result.shortestWord.length < shortestWord.length)) {
            shortestWord = result.shortestWord;
          }

          if(unique){
            result.uniqueWords.forEach(word => {
              uniqueWords.add(word);
              wordFreq[word] = (wordFreq[word] || 0) + 1;
            });
          }
          
        }
      }

      const workers = [];
      for (let i = 0; i < concurrency; i++) {
        workers.push(worker());
      }

      await Promise.all(workers);
    }

    await processChunksConcurrently(chunks, concurrency);

    metrics.totalWords = totalWords;
    metrics.longestWord = longestWord;
    metrics.shortestWord = shortestWord;
    metrics.uniqueWords = uniqueWords.size;

    console.log(`Total words processed: ${metrics.totalWords}`);
    if(unique) console.log(`Unique words: ${metrics.uniqueWords}`);
    console.log(`Longest word: ${metrics.longestWord}`);
    console.log(`Shortest word: ${metrics.shortestWord}`);

    if (topN > 0) {
      const sortedWords = Object.entries(wordFreq)
        .sort((a, b) => b[1] - a[1])
        .slice(0, topN);

      metrics.topWords = sortedWords.map(([word, freq]) => ({ word, freq }));

      console.log(`Top ${topN} words: `);
      sortedWords.forEach(([word,freq],idx)=>{
        console.log(`${idx+1}. ${word} : ${freq}`)
      })
    }


  } catch (err) {
    console.error('Error processing file:', err);
  } finally {
    const endTime = performance.now();
    metrics.timeMs = endTime - startTime;
    return metrics;
  }
}

program
  .option('--file <file>', 'Path to the text file to process')
  .option('--minLen <number>', 'Minimum word length to process', parseInt)
  .option('--unique', 'Count unique words')
  .option('--top <number>', 'Show top N words by frequency', parseInt, 10);
program.parse(process.argv);

const options = program.opts();

(async () => {
  if (!options.file) {
    console.error('Please specify a file using --file option');
    return;
  }

  const concurrencyLevels = [8];
  const allMetrics = [];

  for (const level of concurrencyLevels) {
    const metrics = await processFile(options.file, options.minLen || 0, options.unique, options.top, level);
    allMetrics.push(metrics);
    console.log(`Finished processing with concurrency ${level}: ${metrics.timeMs.toFixed(2)}ms`);
  }

})();