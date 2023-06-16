The `replaceFilesToSubfolders.js` script is a Node.js script that allows you to **move files from a source folder to subfolders in a destination folder.**

The script creates subfolders in the destination folder and moves the files from the source folder to the subfolders based on the number of files per subfolder or the number of subfolders you specify. The script uses the `fs`, `path`, `mkdirp`, and `ProgressBar` Node.js modules to create the subfolders, move the files, and display a progress bar. 

To use the script, you need to provide the following parameters:

- `folderPath`: The path to the folder containing the files you want to move.
- `subfolderPath`: The path to the folder where the subfolders will be created.
- `subfolderName`: The base name for the subfolders. The script will append a number to the end of the name for each subfolder.
- `numSubfolders` **(select one)**: The number of subfolders to create. If this parameter is set to 0, the script will calculate the number of subfolders based on the `numFilesPerSubfolder` parameter.
- `numFilesPerSubfolder` **(select one)**: The number of files to put in each subfolder. If this parameter is set to 0, the script will calculate the number of files per subfolder based on the `numSubfolders` parameter.

Here's an example of how to use the script:

```javascript
const folderPath = "C:/Files_To_Sort"; // folder with files to be moved
const subfolderPath = "C:/Sorted_Files"; // folder where subfolders will be created (Must exist before running script)
const subfolderName = "folder"; // name will be appended with a number: folder-0, folder-1, etc.

// use numSubFolders if you want to create a specific number of subfolders
const numSubfolders = 0; // 0 = disabled

// use numFilesPerSubfolder if you want to create a dynamic number of subfolders
const numFilesPerSubfolder = 10; // 0 = disabled

moveFilesToSubfolders(
  folderPath,
  subfolderPath,
  subfolderName,
  numSubfolders,
  numFilesPerSubfolder
);
```

