const fs = require('fs-extra');

const clearFile = (file) => fs.unlink(file);

const clearFiles = (files) => Promise.all(files.map((file) => clearFile(file)));

const readDir = (path) => fs.readdir(path);

module.exports = { clearFile, clearFiles, readDir };
