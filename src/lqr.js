const { spawn } = require('child_process')
const random = require('random-int')
const path = require('path')

const processedDir = path.join(__dirname, '../images/processed')

module.exports = (sourceImg) => {
  return new Promise((resolve, reject) => {
    const distortedImg = path.join(processedDir, path.basename(sourceImg))

    const factorX = random(25, 60)
    const factorY = random(25, 60)

    console.log(factorX, factorY)

    const magick = spawn('convert', [
      sourceImg,
      '-liquid-rescale', `${factorX}x${factorY}%`,
      '-resize', `${10000 / factorX}x${10000 / factorY}%`,
      distortedImg
    ])

    magick.stderr.on('data', (data) => {
      reject(new Error(`magick error: ${data}`))
    })

    magick.on('close', () => resolve(distortedImg))
  })
}