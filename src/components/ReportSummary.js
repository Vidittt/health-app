import ShowDetails from "./ShowDetails";
import LoadingGif from "../assets/loading_icon.gif";

export default function ReportSummary({ file, reportData }) {
  return (
    <div className="p-6 max-w-3xl mx-auto space-y-6">
      <h1 className="text-4xl font-bold text-center">Laboratory Report</h1>
      <h2 className="text-2xl text-center">{file.name}</h2>

      {reportData ? (
        <div>
          <ShowDetails
            reportDetails={reportData.patientDetails}
            lipidProfileData={reportData.lipidProfileData}
          />
        </div>
      ) : (
        <div className="flex justify-center items-center">
          <img src={LoadingGif} alt="loading..." />
        </div>
      )}
    </div>
  );
}
