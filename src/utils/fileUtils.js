
// Check if filename already exists
export const isFileNameExists = (filename, existingFiles, processedFiles = []) => {
  const allFiles = [...existingFiles, ...processedFiles];
  return allFiles.some(file => file.name === filename);
};

// Rename a file
export const renameFile = (file, newName) => {
  return new File([file], newName, { type: file.type });
};

// Generate unique filename
export const generateUniqueFilename = (filename, existingFiles, processedFiles = []) => {
  if (!isFileNameExists(filename, existingFiles, processedFiles)) {
    return filename;
  }

  const lastDotIndex = filename.lastIndexOf('.');
  const baseName = lastDotIndex > 0 ? filename.substring(0, lastDotIndex) : filename;
  const extension = lastDotIndex > 0 ? filename.substring(lastDotIndex) : '';

  let counter = 1;
  let newFilename;

  do {
    newFilename = `${baseName} (${counter})${extension}`;
    counter++;
  } while (isFileNameExists(newFilename, existingFiles, processedFiles));

  return newFilename;
};
