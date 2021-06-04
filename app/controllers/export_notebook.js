const exporter = require('../services/exporter');
const utils = require('../services/utils');
const uuid = require('uuid');
const fs = require('fs-extra');
const path = require('path');

async function exportNotebook(config, uid, nbid) {
  try {
    const outDir = utils.resolveAsset(config.outDir);
    const outputDirectoryName = uuid.v4();
    const exported = await exporter.writeNotebook(config.key, outDir, uid, nbid, outputDirectoryName);
    if (exported.exporting) {
      return {error: false, outputDirectoryName: outputDirectoryName};
    } else {
      return {error: true, outputDirectoryName: outputDirectoryName};
    }
  } catch (e) {
    throw new Error(e);
  }
}

function zipExportedNotebook(config, notebookId) {
  try {
    const outDir = utils.resolveAsset(config.outDir);
    const zipLocation = path.join(outDir, `${notebookId}.zip`);
    if (fs.existsSync(zipLocation)) {
      return {exists: false};
    } else {
      const zip = exporter.zip(outDir, notebookId);
      zip.then(() => {
        console.log('zip');
      }).catch((err) => {
        console.log(err)
      });
      return {error: false, exists: true, location: zip.location};
    }
  } catch (e) {
    throw new Error(e);
  }
}

function returnNotebook(config, notebookId) {

  //ZIP: with outDir, and zip service create a zip file
  //With zip then get and download
  const outDir = utils.resolveAsset(config.outDir);
  const filePath = path.resolve(outDir, `${notebookId}.zip`);
  if (fs.existsSync(filePath)) {
    return {exists: true, fileName: `${notebookId}.zip`, filePath: filePath};
  } else {
    return {exists: false};
  }
}


module.exports = {exportNotebook, zipExportedNotebook, returnNotebook};
