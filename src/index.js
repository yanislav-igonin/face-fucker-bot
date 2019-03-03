const path = require('path');
const lqr = require('./lqr');

const uploadsDir = path.join(__dirname, '../images/uploaded');

lqr(path.join(uploadsDir, './source.jpg'))
  .then((target) => console.log(target))
  .catch((err) => console.log(err));
