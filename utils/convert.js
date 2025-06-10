const { exec } = require('child_process');
const path = require('path');
const fs = require('fs');

const convertToMp3 = (inputPath) => {
  return new Promise((resolve, reject) => {
    const mp3Path = path.join('uploads', `${Date.now()}.mp3`);
    const command = `ffmpeg -y -i ${inputPath} -vn -ar 44100 -ac 2 -b:a 192k ${mp3Path}`;

    exec(command, (error) => {
      if (error) {
        reject(error);
      } else {
        // Optionally delete original
        fs.unlinkSync(inputPath);
        resolve(mp3Path);
      }
    });
  });
};

module.exports = { convertToMp3 };
