import Header from "./components/Header.js";
import FileManagement from "./components/FileManagement.js";
import ReportLayout from "./components/ReportLayout.js";
import RenameDialog from "./components/RenameDialog.js";
import { useFileHandler } from "./hooks/useFileHandler";

function App() {
  const {
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
  } = useFileHandler();

  return (
    <div className="flex flex-col min-h-screen font-sans mx-auto max-w-7xl">
      <Header />
      <div className="flex w-full max-w-7xl bg-white rounded-xl border border-gray-300 overflow-hidden mt-6 max-auto">
        <FileManagement
          inputKey={inputKey}
          handleFileChange={handleFileChange}
          files={files}
          selectedFile={selectedFile}
          handleShowDetails={handleShowDetails}
          handleDelete={handleDelete}
        />
        <ReportLayout selectedFile={selectedFile} summaries={summaries} />
      </div>

      <RenameDialog
        isOpen={renameDialog.isOpen}
        value={renameDialog.newFileName}
        onChange={(value) => setRenameDialog(prev => ({ ...prev, newFileName: value }))}
        onCancel={handleRenameCancel}
        onSubmit={handleRenameSubmit}
      />
    </div>
  );
}

export default App;
