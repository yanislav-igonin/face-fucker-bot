const path = require('path');
const fs = require('fs-extra');
const imageParser = require('./imageParser');

const uploadsDir = path.join(__dirname, '../images/uploaded');

describe('LiquidRescale', () => {
  test('process image', async () => {
    const processedImage = await imageParser(path.join(uploadsDir, './test_image.jpg'));
    const isProcessedImageExist = await fs.ensureFile(processedImage);

    expect(isProcessedImageExist).toBeTruthy();
  });
});
