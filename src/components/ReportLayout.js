import ReportSummary from "./ReportSummary";

export default function ReportLayout({
    selectedFile,
    summaries
}){
    return (
        <div className="flex-1 bg-white">
          {selectedFile ? (
            <ReportSummary
              file={selectedFile}
              reportData={summaries[selectedFile.name]}
            />
          ) : (
            <div className="flex items-center justify-center h-full text-center text-gray-400">
              <p>Select a file from the list to view its details.</p>
            </div>
          )}
        </div>
    );
}