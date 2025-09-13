import { useState } from "react";
import Header from "./components/Header.js";
import { runGemini } from "./components/RunGemini";
import FileManagement from "./components/FileManagement.js";
import ReportLayout from "./components/ReportLayout.js";

function App() {
  const [files, setFiles] = useState([]);
  const [selectedFile, setSelectedFile] = useState(null);
  const [inputKey, setInputKey] = useState(Date.now());
  const [summaries, setSummaries] = useState({});

  const handleFileChange = async (e) => {
    const selectedFiles = Array.from(e.target.files);
    setFiles((currentFiles) => [...currentFiles, ...selectedFiles]);

    // Select the first file if only one was uploaded
    if (e.target?.files?.length === 1) {
      setSelectedFile(e.target.files[0]);
    } else {
      setSelectedFile(null);
    }

    for (const file of selectedFiles) {
      // runGemini for each new file
      try {
        console.log("Running Gemini API from App for file {file.name}");
        const summary = await runGemini({ file });
        setSummaries((prev) => ({ ...prev, [file.name]: summary }));
        console.log(summaries);
      } catch (err) {
        console.error("Error generating summary:", err);
      }
    }

  };

  const handleShowDetails = (file) => {
    setSelectedFile(file);
  };

  const handleDelete = (fileToDelete) => {
    const updatedFiles = files.filter(
      (item) => item.name !== fileToDelete.name
    );
    setFiles(updatedFiles);
    if (selectedFile === fileToDelete) setSelectedFile(null);
    setInputKey(Date.now());
  };

  return (
    <div className="flex flex-col min-h-screen font-sans mx-auto max-w-7xl">
      <Header />
      <div className="flex w-full max-w-7xl bg-white rounded-xl border border-gray-300 overflow-hidden mt-6 max-auto">
        {/* Left Pane: File Management */}
        <FileManagement
          inputKey={inputKey}
          handleFileChange={handleFileChange}
          files={files}
          selectedFile={selectedFile}
          handleShowDetails={handleShowDetails}
          handleDelete={handleDelete}
        />
        {/* Right Pane: Report Summary */}
        <ReportLayout 
					selectedFile={selectedFile}
					summaries={summaries}
				/>
      </div>
    </div>
  );
}

export default App;
