// hooks/useFileHandler.js
import { useState } from "react";
import { isFileNameExists, renameFile, generateUniqueFilename } from "../utils/fileUtils";
import { runGemini } from "../components/RunGemini";

export const useFileHandler = () => {
  const [files, setFiles] = useState([]);
  const [selectedFile, setSelectedFile] = useState(null);
  const [inputKey, setInputKey] = useState(Date.now());
  const [summaries, setSummaries] = useState({});
  const [renameDialog, setRenameDialog] = useState({
    isOpen: false,
    currentFile: null,
    newFileName: "",
    pendingFiles: [],
    processedFiles: []
  });

  // Handle renaming duplicates step by step
  const processNextDuplicate = (pendingFiles, processedFiles) => {
    if (pendingFiles.length === 0) {
      finalizeFileProcessing(processedFiles);
      return;
    }

    const currentFile = pendingFiles[0];
    const remainingFiles = pendingFiles.slice(1);
    const suggestedName = generateUniqueFilename(currentFile.name, files, processedFiles);

    setRenameDialog({
      isOpen: true,
      currentFile,
      newFileName: suggestedName,
      pendingFiles: remainingFiles,
      processedFiles
    });
  };

  const handleRenameSubmit = () => {
    const { currentFile, newFileName, pendingFiles, processedFiles } = renameDialog;

    if (!newFileName.trim()) {
      alert("Please enter a valid filename.");
      return;
    }

    if (isFileNameExists(newFileName, files, processedFiles)) {
      alert("A file with this name already exists.");
      return;
    }

    const renamedFile = renameFile(currentFile, newFileName.trim());
    const updatedProcessedFiles = [...processedFiles, renamedFile];

    setRenameDialog({ isOpen: false, currentFile: null, newFileName: "", pendingFiles: [], processedFiles: [] });
    processNextDuplicate(pendingFiles, updatedProcessedFiles);
  };

  const handleRenameCancel = () => {
    const { pendingFiles, processedFiles } = renameDialog;
    setRenameDialog({ isOpen: false, currentFile: null, newFileName: "", pendingFiles: [], processedFiles: [] });
    processNextDuplicate(pendingFiles, processedFiles);
  };

  const finalizeFileProcessing = async (processedFiles) => {
    if (processedFiles.length === 0) return;

    setFiles(current => [...current, ...processedFiles]);

    if (processedFiles.length === 1) {
      setSelectedFile(processedFiles[0]);
    } else {
      setSelectedFile(null);
    }

    for (const file of processedFiles) {
      try {
        const summary = await runGemini({ file });
        setSummaries(prev => ({ ...prev, [file.name]: summary }));
      } catch (err) {
        console.error("Error generating summary:", err);
      }
    }
  };

  const handleFileChange = (e) => {
    setInputKey(Date.now());
    const selectedFiles = Array.from(e.target.files);

    const duplicates = [];
    const nonDuplicates = [];

    selectedFiles.forEach(file => {
      if (isFileNameExists(file.name, files)) {
        duplicates.push(file);
      } else {
        nonDuplicates.push(file);
      }
    });

    if (duplicates.length > 0) {
      processNextDuplicate(duplicates, nonDuplicates);
    } else {
      finalizeFileProcessing(nonDuplicates);
    }
  };

  const handleShowDetails = (file) => setSelectedFile(file);

  const handleDelete = (fileToDelete) => {
    setFiles(files.filter(item => item.name !== fileToDelete.name));
    if (selectedFile?.name === fileToDelete.name) setSelectedFile(null);
    setInputKey(Date.now());
  };

  return {
    files,
    selectedFile,
    inputKey,
    summaries,
    renameDialog,
    setRenameDialog,
    handleFileChange,
    handleShowDetails,
    handleDelete,
    handleRenameSubmit,
    handleRenameCancel
  };
};
