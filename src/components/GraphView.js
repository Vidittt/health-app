// Clean GraphView implementation: aggregates summaries and renders per-patient mini SVG charts
import React, { useEffect, useMemo, useState } from "react";
import { cleansePatientName, formatYAxisValue } from "../utils/stringUtils";

function formatReportDateLabel(value) {
  if (!value) return "";
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return "";
  return `${parsed.getFullYear()}-${String(parsed.getMonth() + 1).padStart(2, "0")}-${String(parsed.getDate()).padStart(2, "0")}`;
}

export default function GraphView({ summaries = {}, files = [] }) {
  const patientsList = useMemo(() => {
    const map = {};
    const available = new Set((files || []).map((f) => f?.name).filter(Boolean));
    Object.entries(summaries).forEach(([fileName, value]) => {
      // if files are provided, only include summaries for files currently present
      if (available.size > 0 && !available.has(fileName)) return;
      if (Array.isArray(value)) {
        value.forEach((entry) => {
          if (!entry) return;
          const details = entry.patientDetails || {};
          const name = cleansePatientName(details.patientName) || "Unknown";
          const age = details.age || "";
          const reportDateRaw = entry.reportDate || entry.report_date || "";
          const reportDate = reportDateRaw ? new Date(reportDateRaw) : null;
          const year = reportDate ? String(reportDate.getFullYear()) : "";
          const month = reportDate ? String(reportDate.getMonth() + 1).padStart(2, "0") : "";
          const reportData = entry.reportData || {};
          const reportEntry = { sourceFile: fileName, year, month, timeOfReport: reportDate ? reportDate.toISOString() : "", reportData };
          if (!map[name]) map[name] = { patientName: name, age, reports: [reportEntry] };
          else map[name].reports.push(reportEntry);
        });
        return;
      }

      // legacy shape
      const s = value || {};
      const file = s.fileName || fileName;
      const reportDateRaw = s.reportDate || s.report_date || "";
      const reportDate = reportDateRaw ? new Date(reportDateRaw) : null;
      const year = reportDate ? String(reportDate.getFullYear()) : "";
      const month = reportDate ? String(reportDate.getMonth() + 1).padStart(2, "0") : "";
      const patientsInReport = s.patientsInReport ? (Array.isArray(s.patientsInReport) ? s.patientsInReport : [s.patientsInReport]) : [];
      patientsInReport.forEach((entry) => {
        if (!entry) return;
        const details = entry.patientDetails || {};
        const name = cleansePatientName(details.patientName) || "Unknown";
        const age = details.age || "";
        const reportData = entry.reportDetails && typeof entry.reportDetails === "object" ? entry.reportDetails : { ...details };
        const reportEntry = { sourceFile: file, year, month, timeOfReport: reportDate ? reportDate.toISOString() : "", reportData };
        if (!map[name]) map[name] = { patientName: name, age, reports: [reportEntry] };
        else map[name].reports.push(reportEntry);
      });
    });
    return Object.values(map);
  }, [summaries, files]);

  return (
    <div className="flex-1 bg-white p-6">
      {patientsList.length === 0 ? (
        <p className="text-center text-gray-400">Graph view is under construction.</p>
      ) : (
        <div>
          <h3 className="text-lg font-semibold mb-4">Patients ({patientsList.length})</h3>
          <div className="space-y-4">
            {patientsList.map((p) => (
              <PatientCard key={p.patientName} patient={p} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function PatientCard({ patient }) {
  const { patientName, age, reports } = patient;
  const [selectedMetric, setSelectedMetric] = useState("");
  const { xLabels, series } = useMemo(() => {
    const orderedReports = [...reports].sort((a, b) => {
      const aTime = a.timeOfReport ? new Date(a.timeOfReport).getTime() : Number.MAX_SAFE_INTEGER;
      const bTime = b.timeOfReport ? new Date(b.timeOfReport).getTime() : Number.MAX_SAFE_INTEGER;
      return aTime - bTime;
    });

    const xLabels = orderedReports.map((report, index) => {
      const label = formatReportDateLabel(report.timeOfReport || report.reportDate || report.report_date || "");
      return label || report.year || String(index + 1);
    });

    const keys = new Set();
    orderedReports.forEach((report) => Object.keys(report.reportData || {}).forEach((key) => keys.add(key)));
    const series = Array.from(keys).map((key) => ({ key, points: orderedReports.map((report) => {
      const value = (report.reportData || {})[key];
      let num = null;
      if (value && typeof value === "object") num = parseFloat(String(value.result ?? value.value ?? "").replace(/[^0-9.-]+/g, ""));
      else if (typeof value === "string") num = parseFloat(value.replace(/[^0-9.-]+/g, ""));
      else if (typeof value === "number") num = value;
      return { x: formatReportDateLabel(report.timeOfReport || report.reportDate || report.report_date || ""), y: Number.isFinite(num) ? num : null };
    }) }));
    return { xLabels, series };
  }, [reports]);

  useEffect(() => {
    if (!series.length) {
      setSelectedMetric("");
      return;
    }

    setSelectedMetric((current) => {
      if (current && series.some((item) => item.key === current)) return current;
      return series[0].key;
    });
  }, [series]);

  return (
    <div className="p-3 border rounded-lg">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between mb-2">
        <div>
          <div className="font-medium">{patientName}</div>
          {age && <div className="text-sm text-gray-500">Age: {age}</div>}
        </div>
        <div className="w-full sm:w-48">
          <label htmlFor={`metric-${patientName}`} className="block text-sm font-medium text-gray-700 mb-1">Select item</label>
          <select
            id={`metric-${patientName}`}
            value={selectedMetric}
            onChange={(event) => setSelectedMetric(event.target.value)}
            className="w-full border rounded-md px-2 py-1 text-sm"
          >
            {series.length > 0 ? (
              series.map((item) => (
                <option key={item.key} value={item.key}>{item.key}</option>
              ))
            ) : (
              <option value="">No data</option>
            )}
          </select>
        </div>
      </div>
      <MiniLineChart xLabels={xLabels} series={series} selectedMetric={selectedMetric} />
    </div>
  );
}

function MiniLineChart({ xLabels, series, selectedMetric }) {
  const visibleSeries = useMemo(() => {
    if (!selectedMetric) return series;
    return series.filter((item) => item.key === selectedMetric);
  }, [selectedMetric, series]);

  const all = [];
  visibleSeries.forEach((item) => item.points.forEach((point) => {
    if (point.y !== null && point.y !== undefined) all.push(point.y);
  }));
  if (all.length === 0) return <div className="text-sm text-gray-500">No numeric data to plot.</div>;
  const minY = Math.min(...all), maxY = Math.max(...all);
  const w = 600, h = 200, pad = { l: 36, r: 12, t: 8, b: 28 };
  const innerW = w - pad.l - pad.r, innerH = h - pad.t - pad.b;
  const xFor = (i) => pad.l + (i / Math.max(1, xLabels.length - 1)) * innerW;
  const yFor = (v) => pad.t + (1 - (v - minY) / Math.max(1e-6, maxY - minY)) * innerH;
  const colors = ['#2563eb','#16a34a','#f59e0b','#ef4444','#7c3aed','#0ea5a4'];

  return (
    <div className="overflow-x-auto">
      <svg width={w} height={h}>
        {/* x labels */}
        {xLabels.map((lab, i) => (<text key={i} x={xFor(i)} y={h - 6} fontSize={11} textAnchor="middle" fill="#6b7280">{lab || i + 1}</text>))}

        {/* background gradient for Y-axis area */}
        <defs>
          <linearGradient id="yGrad" x1="0" x2="0" y1="0" y2="1">
            <stop offset="0%" stopColor="#ffffff" stopOpacity="0" />
            <stop offset="100%" stopColor="#f8fafc" stopOpacity="1" />
          </linearGradient>
        </defs>
        <rect x={pad.l} y={pad.t} width={innerW} height={innerH} fill="url(#yGrad)" />

        {/* grid */}
        {[0,0.25,0.5,0.75,1].map((t, idx) => {
          const y = pad.t + (1 - t) * innerH;
          const val = formatYAxisValue(minY + t * (maxY - minY));
          return (
            <g key={idx}>
              <line x1={pad.l} x2={w - pad.r} y1={y} y2={y} stroke="#eef2f7" />
              <text x={6} y={y + 4} fontSize={11} fill="#6b7280">{val}</text>
            </g>
          );
        })}

        {/* series */}
        {visibleSeries.map((item, si) => {
          const pts = item.points.map((p, i) => ({ x: xFor(i), y: p.y !== null ? yFor(p.y) : null }));
          let d = '';
          pts.forEach((pt, i) => { if (pt.y === null) return; d += (i === 0 || pts[i - 1].y === null) ? `M ${pt.x} ${pt.y}` : ` L ${pt.x} ${pt.y}`; });
          const color = colors[si % colors.length];
          return (
            <g key={item.key}>
              <path d={d} fill="none" stroke={color} strokeWidth={2} />
              {pts.map((pt, i) => pt.y !== null && (
                <circle key={i} cx={pt.x} cy={pt.y} r={4} fill={color} stroke="#fff" strokeWidth={1} />
              ))}
            </g>
          );
        })}
      </svg>
      <div className="flex flex-wrap gap-3 mt-2">
        {visibleSeries.map((item, i) => (<div key={item.key} className="flex items-center text-sm text-gray-700"><span style={{ background: colors[i % colors.length] }} className="w-3 h-3 inline-block mr-2 rounded-sm" /> <span>{item.key}</span></div>))}
      </div>
    </div>
  );
}