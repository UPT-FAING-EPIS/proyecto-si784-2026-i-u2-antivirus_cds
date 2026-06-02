import fs from 'fs';
import path from 'path';

const samplePath = 'C:\\Program Files\\ClamAV\\conf_examples\\freshclam.conf.sample';
const targetPath = 'C:\\Program Files\\ClamAV\\freshclam.conf';

try {
  let content = fs.readFileSync(samplePath, 'utf8');
  content = content.replace(/^Example$/gm, '#Example');
  fs.writeFileSync(targetPath, content, 'utf8');
  console.log('SUCCESS');
} catch (err) {
  console.error('ERROR: ' + err.message);
}
