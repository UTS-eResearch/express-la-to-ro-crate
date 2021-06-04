const path = require('path');
const fs = require('fs-extra');
const la = require('@uts-eresearch/provision-labarchives');
const {LaToRoCrate} = require('labarchives-to-ro-crate');
const archiver = require('archiver');

async function writeNotebook(key, outDir, uid, nbid, outputDirectoryName, cratescript, metadataTemplate) {

  const laToRoCrate = new LaToRoCrate(key, outDir, "ro-crate-metadata.json", true);
  const pageMetaDescription = "JSON Metadata from the LabArchives API as retrieved";
  //TODO: Ability to describe each page of the notebook
  //TODO: Create an exportNotebook (async)
  const nb = await la.getNotebookInfo(key, uid, nbid);
  const rootDatasetName = nb.notebooks.notebook["name"];
  //This next line is in case you want to use another name to
  // store it in your system like an ID
  //console.log(util.inspect(nb, false, null));

  // Hey dont await for me, its ok...
  const laExport = laToRoCrate.exportNotebookSync(uid, nbid, rootDatasetName, outputDirectoryName, cratescript, metadataTemplate, pageMetaDescription);
  //Since dont await for it. but catch any errors and log them

  laExport.then(() => {
      console.log('wrote notebook');
    })
    .catch((err) => {
      console.error(err);
    });
  return {exporting: true}
}

async function zip(outDir, notebookId) {
  try {
    const zipPath = path.join(outDir, notebookId);
    const zipLocation = `${zipPath}.zip`;
    const output = fs.createWriteStream(zipLocation);
    const archive = archiver('zip', {
      zlib: {level: 9} // Sets the compression level.
    });
    return new Promise((resolve, reject) => {
      archive.on('error', err => reject({error: true, errorMessage: err}));
      archive.pipe(output);
      // append files from a sub-directory, putting its contents at the root of archive
      archive.directory(zipPath, false);
      output.on('close', () => resolve({error: false, location: zipLocation}));
      archive.finalize();
    });
  } catch (e) {
    throw new Error(e);
  }
}

module.exports = {writeNotebook, zip};
