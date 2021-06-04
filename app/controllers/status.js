const package = require('../../package.json');

function check() {
  //TODO: check memcached status
  return {version: package.version};
}

module.exports = {check};
