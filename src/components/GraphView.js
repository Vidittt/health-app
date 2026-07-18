// Clean GraphView implementation: aggregates summaries and renders per-patient mini SVG charts
import React, { useMemo } from "react";

export default function GraphView({ summaries = {}, files = [] }) {
  const patientsList = useMemo(() => {
    const map = {};
    const available = new Set((files || []).map((f) => f?.name).filter(Boolean));
    console.log("summaries:", summaries);
    Object.entries(summaries).forEach(([fileName, value]) => {
      // if files are provided, only include summaries for files currently present
      if (available.size > 0 && !available.has(fileName)) return;
      if (Array.isArray(value)) {
        value.forEach((entry) => {
          if (!entry) return;
          const details = entry.patientDetails || {};
          const name = (details.patientName || "").trim() || "Unknown";
          const age = details.age || "";
          const reportData = entry.reportData || {};
          const reportEntry = { sourceFile: fileName, year: "", month: "", timeOfReport: "", reportData };
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
        const name = (details.patientName || "").trim() || "Unknown";
        const age = details.age || "";
        const reportData = entry.reportDetails && typeof entry.reportDetails === "object" ? entry.reportDetails : { ...details };
        const reportEntry = { sourceFile: file, year, month, timeOfReport: reportDate ? reportDate.toISOString() : "", reportData };
        if (!map[name]) map[name] = { patientName: name, age, reports: [reportEntry] };
        else map[name].reports.push(reportEntry);
      });
    });
    return Object.values(map);
  }, [summaries]);

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
  const { xLabels, series } = useMemo(() => {
    const xLabels = reports.map((r, i) => (r.year || r.timeOfReport ? (r.year || new Date(r.timeOfReport).getFullYear()) : String(i + 1)));
    const keys = new Set();
    reports.forEach((r) => Object.keys(r.reportData || {}).forEach((k) => keys.add(k)));
    const series = Array.from(keys).map((key) => ({ key, points: reports.map((r) => {
      const v = (r.reportData || {})[key];
      let num = null;
      if (v && typeof v === 'object') num = parseFloat(String(v.result ?? v.value ?? '').replace(/[^0-9.-]+/g, ''));
      else if (typeof v === 'string') num = parseFloat(v.replace(/[^0-9.-]+/g, ''));
      else if (typeof v === 'number') num = v;
      return { x: r.year || '', y: Number.isFinite(num) ? num : null };
    }) }));
    return { xLabels, series };
  }, [reports]);

  return (
    <div className="p-3 border rounded-lg">
      <div className="flex items-center justify-between mb-2">
        <div>
          <div className="font-medium">{patientName}</div>
          {age && <div className="text-sm text-gray-500">Age: {age}</div>}
        </div>
        <div className="text-sm text-gray-600">Reports: {reports.length}</div>
      </div>
      <MiniLineChart xLabels={xLabels} series={series} />
    </div>
  );
}

function MiniLineChart({ xLabels, series }) {
  const all = [];
  series.forEach(s => s.points.forEach(p => { if (p.y !== null && p.y !== undefined) all.push(p.y); }));
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
        {xLabels.map((lab,i) => (<text key={i} x={xFor(i)} y={h - 6} fontSize={11} textAnchor="middle" fill="#6b7280">{lab || i+1}</text>))}

        {/* grid */}
        {[0,0.25,0.5,0.75,1].map((t,idx)=>{const y=pad.t+(1-t)*innerH; const val=(minY+t*(maxY-minY)).toFixed(0); return (<g key={idx}><line x1={pad.l} x2={w-pad.r} y1={y} y2={y} stroke="#eef2f7"/><text x={6} y={y+4} fontSize={11} fill="#6b7280">{val}</text></g>);})}

        {/* series */}
        {series.map((s,si)=>{
          const pts = s.points.map((p,i)=>({x:xFor(i), y: p.y!==null? yFor(p.y): null}));
          let d=''; pts.forEach((pt,i)=>{ if(pt.y===null) return; d += (i===0||pts[i-1].y===null)?`M ${pt.x} ${pt.y}`:` L ${pt.x} ${pt.y}`; });
          const color = colors[si%colors.length];
          return (<g key={s.key}><path d={d} fill="none" stroke={color} strokeWidth={2}/>{pts.map((pt,i)=>pt.y!==null && <circle key={i} cx={pt.x} cy={pt.y} r={3} fill={color}/>)}</g>);
        })}
      </svg>
      <div className="flex flex-wrap gap-3 mt-2">
        {series.map((s,i)=> (<div key={s.key} className="flex items-center text-sm text-gray-700"><span style={{background:colors[i%colors.length]}} className="w-3 h-3 inline-block mr-2 rounded-sm"/> <span>{s.key}</span></div>))}
      </div>
    </div>
  );
}