const fs = require('fs');
const path = require('path');
const { promisify } = require('util');
const mkdirp = promisify(require('mkdirp'));

const folderPath = 'C:/Files_To_Sort';
const subfolderPath = 'C:/Sorted_Files';

// Створюємо 150 підпапок
for (let i = 0; i < 150; i++) {
  const folderName = `folder_${i}`;
  const folderFullPath = path.join(subfolderPath, folderName);
  mkdirp(folderFullPath, {});
}

// Перебираємо всі файли у папці
fs.readdir(folderPath, (err, filenames) => {
  if (err) throw err;
  filenames.forEach((filename, i) => {
    // Розподіляємо файли відповідно до номера підпапки
    const folderNum = Math.floor(i / 1000);
    const folderName = `folder_${folderNum}`;
    const folderFullPath = path.join(subfolderPath, folderName);
    const fileSrcPath = path.join(folderPath, filename);
    const fileDestPath = path.join(folderFullPath, filename);
    // Переміщуємо файл у відповідну підпапку
    fs.rename(fileSrcPath, fileDestPath, (err) => {
      if (err) throw err;
    });
  });
});