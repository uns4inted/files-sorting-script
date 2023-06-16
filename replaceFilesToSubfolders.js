const fs = require('fs');
const path = require('path');
const { promisify } = require('util');
const mkdirp = promisify(require('mkdirp'));

function moveFilesToSubfolders(folderPath, subfolderPath, subfolderName, numSubfolders, numFilesPerSubfolder) {
  // Create subfolders
  let numFiles = 0;
  let numFolders = 0;

  // Validate input
  if (numSubfolders === 0 && numFilesPerSubfolder === 0) {
    throw new Error('Please specify either numSubfolders or numFilesPerSubfolder');
  }
  if (numSubfolders > 0 && numFilesPerSubfolder > 0) {
    throw new Error('Please specify either numSubfolders or numFilesPerSubfolder, not both');
  }
  

  if (numFilesPerSubfolder === 0) {
    // Calculate number of subfolders needed to distribute files evenly
    fs.readdir(folderPath, (err, filenames) => {
      if (err) throw err;
      numFiles = filenames.length;
      numFolders = Math.ceil(numFiles / numSubfolders);
      for (let i = 0; i < numFolders; i++) {
        const folderName = `${subfolderName}-${i}`;
        const folderFullPath = path.join(subfolderPath, folderName);
        mkdirp(folderFullPath, {});
      }

      // Change permissions of subfolderPath to 777 (write, read, execute)
      setFullPremissionsToSubfolders(subfolderPath);
      distributeFilesPerSubfoldersEvenly(folderPath, subfolderPath, subfolderName, numFolders);
    });
  } else if (numSubfolders === 0) {
    // Calculate number of files per subfolder and create subfolders dynamically
    fs.readdir(folderPath, (err, filenames) => {
      if (err) throw err;
      numFiles = filenames.length;
      numFolders = Math.ceil(numFiles / numFilesPerSubfolder);
      for (let i = 0; i < numFolders; i++) {
        const folderName = `${subfolderName}-${i}`;
        const folderFullPath = path.join(subfolderPath, folderName);
        mkdirp(folderFullPath, {});
      }
      // Change permissions of subfolderPath to 777 (write, read, execute)
      setFullPremissionsToSubfolders(subfolderPath);
      distributeFilesWithNumFilesPerSubfolder(folderPath, subfolderPath, subfolderName, numFolders, numFilesPerSubfolder);
    });
  }
}

function distributeFilesPerSubfoldersEvenly(folderPath, subfolderPath, subfolderName, numFolders) {
  const chunkSize = 1024 * 1024; // 1MB
  fs.readdir(folderPath, (err, filenames) => {
    if (err) throw err;
    const totalFiles = filenames.length;
    let filesMoved = 0;
    filenames.forEach((filename, i) => {
      const folderNum = Math.floor(i / numFolders);
      const folderName = `${subfolderName}-${folderNum}`;
      const folderFullPath = path.join(subfolderPath, folderName);
      const fileSrcPath = path.join(folderPath, filename);
      const fileDestPath = path.join(folderFullPath, filename);
      const readStream = fs.createReadStream(fileSrcPath, { highWaterMark: chunkSize });
      const writeStream = fs.createWriteStream(fileDestPath);
      readStream.pipe(writeStream);
      readStream.on('end', () => {
        fs.unlink(fileSrcPath, (err) => {
          if (err) throw err;
          filesMoved++;
          console.log(`Moved file ${filename} to ${folderFullPath} (${filesMoved}/${totalFiles})`);
        });
      });
    });
  });
}

function distributeFilesWithNumFilesPerSubfolder(folderPath, subfolderPath, subfolderName, numFolders, numFilesPerSubfolder) {
  const chunkSize = 1024 * 1024; // 1MB
  fs.readdir(folderPath, (err, filenames) => {
    if (err) throw err;
    const totalFiles = filenames.length;
    let folderNum = 0;
    let fileCount = 0;
    let folderFullPath = path.join(subfolderPath, `${subfolderName}-${folderNum}`);
    mkdirp(folderFullPath, {});
    filenames.forEach((filename, i) => {
      if (fileCount >= numFilesPerSubfolder) {
        folderNum++;
        folderFullPath = path.join(subfolderPath, `${subfolderName}-${folderNum}`);
        mkdirp(folderFullPath, {});
        fileCount = 0;
      }
      const fileSrcPath = path.join(folderPath, filename);
      const fileDestPath = path.join(folderFullPath, filename);
      const readStream = fs.createReadStream(fileSrcPath, { highWaterMark: chunkSize });
      const writeStream = fs.createWriteStream(fileDestPath);
      readStream.pipe(writeStream);
      readStream.on('end', () => {
        fs.unlink(fileSrcPath, (err) => {
          if (err) throw err;
          console.log(`Moved file ${filename} to ${folderFullPath} (${i + 1}/${totalFiles})`);
        });
      });
      fileCount++;
    });
  });
}

function setFullPremissionsToSubfolders(subfolderPath) {
  fs.chmod(subfolderPath, 0o777, (err) => {
    if (err) throw err;
    console.log(`Changed permissions of ${subfolderPath} to 777 (Full access))`);
  });
}

// Using the function
const folderPath = 'C:/Files_To_Sort'; // folder with files to be moved
const subfolderPath = 'C:/Sorted_Files'; // folder where subfolders will be created (Must exist before running script)
const subfolderName = 'folder'; // name will be appended with a number: folder-0, folder-1, etc.

// use numSubFolders if you want to create a specific number of subfolders
// with a calculated number of files per subfolder evenly distributed.
const numSubfolders = 0; // 0 = disabled

// use numFilesPerSubfolder if you want to create a dynamic number of subfolders
// with a specific number of files per subfolder.
const numFilesPerSubfolder = 10; // 0 = disabled


moveFilesToSubfolders(folderPath, subfolderPath, subfolderName,  numSubfolders, numFilesPerSubfolder);