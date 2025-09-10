import ReportTable from "./ReportTable.js";

export default function ShowDetails({ reportDetails, lipidProfileData }) {
  return (
    <div>
      <div className="bg-white rounded-xl shadow-lg p-6 w-full max-w-2xl">
        {/* Patient Details */}
        <div className="bg-gray-50 rounded-lg p-4 mb-4">
          <h3 className="text-xl font-semibold text-gray-700 mb-2">
            Patient Details
          </h3>
          <div className="grid grid-cols-2 gap-2 text-sm text-gray-600">
            {reportDetails.patientName && (
              <p>
                Name : <strong>{reportDetails.patientName}</strong>
              </p>
            )}
            {reportDetails.referringDoctor &&
              <p>
                Ref. By: <strong>{reportDetails.referringDoctor}</strong>
              </p>
            }
            {reportDetails.caseId && (
              <p>
                Case ID : <strong>{reportDetails.caseId}</strong>
              </p>
            )}
            {reportDetails.patientId &&
              <p>
                Patient ID : <strong> {reportDetails.patientId}</strong>
              </p>
            }
            {reportDetails.sex &&
              <p>
                Sex : <strong> {reportDetails.sex}</strong>
              </p>
            }
            {reportDetails.age &&
              <p>
                Age : <strong> {reportDetails.age}</strong>
              </p>
            }
          </div>
        </div>

        {/* Table */}
        <h2 className="text-2xl font-semibold text-gray-700 mb-4">
          Lipid Profile
        </h2>
        <ReportTable data={lipidProfileData} />
      </div>
    </div>
  );
}
