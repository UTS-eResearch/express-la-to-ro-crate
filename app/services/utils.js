const fs = require('fs-extra');
const path = require('path');

function resolveAsset(location) {
  try {
    if (path.isAbsolute(location)) {
      if (fs.existsSync(location)) {
        return location;
      }
    } else {
      return path.resolve(process.cwd(), location);
    }
  } catch (err) {
    console.error(`check location == ${location} == it should be relative to this folder or absolute`);
    throw new Error(err);
  }
}

module.exports = {resolveAsset}
