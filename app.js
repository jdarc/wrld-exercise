const fs = require("fs");
const kdTree = require("kd-tree-javascript").kdTree;

function log(message) {
  console.log(message);
}

function findFurthest(features) {
  features.sort((a, b) => b.nearest - a.nearest);
  return features[0];
}

function computeNearest(features) {
  const distanceFn = (a, b) => Math.pow(a.x - b.x, 2) + Math.pow(a.y - b.y, 2);
  const tree = new kdTree(features.slice(), distanceFn, ["x", "y"]);
  return features.map(feature => Object.assign({ nearest: tree.nearest(feature, 2)[0][1] }, feature));
}

function extractFeatures(lines) {
  return lines.map(line => {
    const elements = /(.+?) ([0-9]+?) ([0-9]+)/g.exec(line);
    try {
      return { name: elements[1], x: Number(elements[2]), y: Number(elements[3]) };
    } catch (ex) {
      throw Error(`Specified file contains invalid or missing data: '${line}'`);
    }
  });
}

function processFile(file, callback) {
  fs.readFile(file, "utf8", (err, data) => {
    if (!err) {
      callback(data.trim().replace(/\r\n/g, "\n").split("\n"));
    } else {
      log(`Error processing specified file: ${err}`);
    }
  });
}

const EXPECTED_ARGUMENTS = 3;

if (process.argv.length === EXPECTED_ARGUMENTS) {
  const filename = process.argv[2];
  fs.exists(filename, exists => {
    if (exists) {
      processFile(filename, lines => log(findFurthest(computeNearest(extractFeatures(lines))).name));
    } else {
      log(`Specified file does not exist!`);
    }
  });
} else {
  log("usage: node app file");
}
