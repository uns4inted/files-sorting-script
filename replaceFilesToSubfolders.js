const fs = require("fs");
const path = require("path");
const mkdirp = require("mkdirp");
const ProgressBar = require("progress");

function moveFilesToSubfolders(
  folderPath,
  subfolderPath,
  subfolderName,
  numSubfolders,
  numFilesPerSubfolder
) {
  // Validate input
  if (numSubfolders === 0 && numFilesPerSubfolder === 0) {
    throw new Error(
      "Please specify either numSubfolders or numFilesPerSubfolder!"
    );
  }
  if (numSubfolders > 0 && numFilesPerSubfolder > 0) {
    throw new Error(
      "Please specify either numSubfolders or numFilesPerSubfolder, not both!"
    );
  }

  // Create subfolders
  let numFiles = 0;
  let numFolders = 0;

  fs.readdir(folderPath, (err, filenames) => {
    if (err) throw err;

    numFiles = filenames.length;
    if (numFilesPerSubfolder === 0) {
      numFolders = numSubfolders;
      // Calculate number of files per subfolder to distribute files evenly
      numFilesPerSubfolder = Math.ceil(numFiles / numFolders);
    } else {
      numFolders = Math.ceil(numFiles / numFilesPerSubfolder);
    }

    console.log(`File replacement instructions: new folder structure will have ${numFilesPerSubfolder} files per ${numFolders} subfolders.`, '\n')

    // Add progress bar for creating subfolders
    console.log(`Creating ${numFolders} subfolders, for total ${numFiles} files.`);
    const createFoldersBar = new ProgressBar("[:bar] :percent :etas", {
      complete: "=",
      incomplete: " ",
      width: 50,
      total: numFolders,
    });

    const subfolderPromises = []; // array of promises for created subfolders
    for (let i = 0; i < numFolders; i++) {
      const folderName = `${subfolderName}-${i}`;
      const folderFullPath = path.join(subfolderPath, folderName);
      subfolderPromises.push(mkdirp(folderFullPath, {}));
      createFoldersBar.tick();
    }

    // Wait for all subfolders to be created
    Promise.all(subfolderPromises)
      .then(() => {
        console.log("All subfolders created.");
        // Change permissions of subfolderPath to 777 (write, read, execute)
        setFullPremissionsToSubfolders(subfolderPath);
        distributeFiles(folderPath, subfolderPath, subfolderName, numFilesPerSubfolder);
      })
      .catch((err) => {
        console.error(err);
      });
  });
}

function distributeFiles(
  folderPath,
  subfolderPath,
  subfolderName,
  numFilesPerSubfolder = 0
) {
  const chunkSize = 1024 * 1024; // 1MB
  fs.readdir(folderPath, (err, filenames) => {
    if (err) throw err;
    const totalFiles = filenames.length;
    let filesMoved = 0;
    let folderNum = 0;
    let fileCount = 0;
    let destFolderFullPath = path.join(
      subfolderPath,
      `${subfolderName}-${folderNum}`
    );
    const bar = new ProgressBar("[:bar] :percent :etas", {
      complete: "=",
      incomplete: " ",
      width: 50,
      total: totalFiles,
      callback: () => {
        console.log(`Completed. Moved ${filesMoved} of ${totalFiles} files.`, '\n');
        console.log(`Files are now located in ${subfolderPath}.`);
      }
    });

    // Move files to subfolders
    console.log(`Starting to move ${totalFiles} files to subfolders.`);
    filenames.forEach((filename, i) => {
      if (fileCount >= numFilesPerSubfolder) {
        folderNum++;
        destFolderFullPath = path.join(
          subfolderPath,
          `${subfolderName}-${folderNum}`
        );
        fileCount = 0;
      }
      const fileSrcPath = path.join(folderPath, filename);
      const fileDestPath = path.join(destFolderFullPath, filename);
      const readStream = fs.createReadStream(fileSrcPath, {
        highWaterMark: chunkSize,
      });
      const writeStream = fs.createWriteStream(fileDestPath);
      readStream.pipe(writeStream);
      readStream.on("end", () => {
        fs.unlink(fileSrcPath, (err) => {
          if (err) throw err;
          filesMoved++;
          bar.tick();
        });
      });
      fileCount++;
    });
  });
}

function setFullPremissionsToSubfolders(subfolderPath) {
  fs.chmod(subfolderPath, 0o777, (err) => {
    if (err) throw err;
    console.log(
      `Changed permissions of ${subfolderPath} to Full Access (Read, Write, Execute).`,
      '\n'
    );
  });
}

// Using the function
const folderPath = "C:/Files_To_Sort"; // folder with files to be moved
const subfolderPath = "C:/Sorted_Files"; // folder where subfolders will be created (Must exist before running script)
const subfolderName = "folder"; // name will be appended with a number: folder-0, folder-1, etc.

// use numSubFolders if you want to create a specific number of subfolders
// with a calculated number of files per subfolder evenly distributed.
const numSubfolders = 0; // 0 = disabled

// use numFilesPerSubfolder if you want to create a dynamic number of subfolders
// with a specific number of files per subfolder.
const numFilesPerSubfolder = 10; // 0 = disabled

moveFilesToSubfolders(
  folderPath,
  subfolderPath,
  subfolderName,
  numSubfolders,
  numFilesPerSubfolder
);
