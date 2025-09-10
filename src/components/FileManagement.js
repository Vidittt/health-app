export default function FileManagement({
	inputKey,
	handleFileChange,		
	files,
	selectedFile,
	handleShowDetails,
	handleDelete
}) {
  return (
    <div className="w-1/3 p-8 border-r border-gray-200">
      <div className="flex items-center space-x-2 bg-gray-100 rounded-xl px-4 py-2 mb-6">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-5 w-5 text-gray-400"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
          />
        </svg>
        <input
						type="text"
						placeholder="Search files..."
						className="bg-transparent outline-none flex-1 text-gray-600"
						id="search-file"
					/>
      </div>

      <input
        key={inputKey}
        type="file"
        onChange={handleFileChange}
        multiple
        className="hidden"
        id="file-upload"
      />
      <label
        htmlFor="file-upload"
        className="bottom-6 right-6 px-6 py-3 bg-blue-600 text-white font-medium rounded-lg shadow-md hover:bg-blue-700 transition-colors cursor-pointer"
      >
        Add Reports
      </label>

      <br />
      <br />
      <h2 className="text-xl font-bold mb-4 text-gray-800">Uploaded Files</h2>

      <div className="flex flex-col space-y-4">
        {files.length > 0 ? (
          files.map((file, index) => (
            <div
              key={index}
              className={`flex items-center space-x-2 p-4 rounded-xl cursor-pointer transition-colors duration-200 overflow-hidden ${
                selectedFile && selectedFile.name === file.name
                  ? "bg-blue-50 border border-blue-200"
                  : "hover:bg-gray-50"
              }`}
              onClick={() => handleShowDetails(file)}
            >
              <div className="flex-1 flex flex-col min-w-0">
                <span className="text-sm font-medium text-gray-800 truncate">
                  {file.name}
                </span>
                <span className="text-xs text-gray-500">
                  {new Date().toLocaleDateString("en-US", {
                    year: "numeric",
                    month: "2-digit",
                    day: "2-digit",
                  })}
                </span>
              </div>
              <div className="flex space-x-2 text-gray-400">
                <button className="hover:text-blue-500">
                  {/* <svg
								xmlns="http://www.w3.org/2000/svg"
								className="h-5 w-5"
								viewBox="0 0 20 20"
								fill="currentColor"
								>
								<path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
								<path
									fillRule="evenodd"
									d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z"
									clipRule="evenodd"
								/>
								</svg> */}
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDelete(file);
                  }}
                  className="hover:text-red-500"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm4 0a1 1 0 012 0v6a1 1 0 11-2 0V8z"
                      clipRule="evenodd"
                    />
                  </svg>
                </button>
              </div>
            </div>
          ))
        ) : (
          <p className="text-center text-gray-400 ">
            Please add your latest reports to view the details.
          </p>
        )}
      </div>
    </div>
  );
}
