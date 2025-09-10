import React from "react";

export default function ReportTable({ data }) {
  const isAbnormal = (result, referenceRange) => {
    if (!result || !referenceRange) {
      return false;
    }
    const [min, max] = referenceRange.split("-").map(parseFloat);
    const resultValue = parseFloat(result);

    if (isNaN(min) || isNaN(max) || isNaN(resultValue)) {
      return false;
    }

    return resultValue < min || resultValue > max;
  };

  console.log(data);

  return (
    <table className="min-w-full rounded-lg overflow-hidden">
      <thead>
        <tr className="bg-blue-600 text-white">
          <th className="py-3 px-4 text-left font-medium">Test Name</th>
          <th className="py-3 px-4 text-left font-medium">Result Value</th>
          <th className="py-3 px-4 text-left font-medium">Unit</th>
          <th className="py-3 px-4 text-left font-medium">Reference Range</th>
        </tr>
      </thead>
      <tbody className="bg-white divide-y divide-gray-200">
        {Object.entries(data)
          .filter(([testName, rowData]) => rowData.result )
          .map(([testName, rowData]) => (
            <tr
              key={testName}
              className={`${
                isAbnormal(rowData.result, rowData.referenceRange)
                  ? "bg-red-100"
                  : ""
              }`}
            >
              <td className="py-3 px-4 text-gray-700 font-medium">
                {testName}
              </td>
              <td className="py-3 px-4 text-gray-700">{rowData.result}</td>
              <td className="py-3 px-4 text-gray-700">{rowData.unit}</td>
              <td className="py-3 px-4 text-gray-700">
                {rowData.referenceRange}
              </td>
            </tr>
          ))}
      </tbody>
    </table>
  );
}
