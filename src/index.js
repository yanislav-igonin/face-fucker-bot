const path = require('path')
const dist = require('./dist');

dist(path.join(__dirname, './source.jpg'))
.then(target => console.log(target))
.catch(err => console.log(err))