import React, { useState, useEffect, useMemo, useCallback } from "react";
import { supabase } from "./supabase";


/* ─── COMPANY LOGO (embedded) ─── */
const LOGO_SRC="data:image/jpeg;base64,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";
const LogoImg=()=>(<img src={LOGO_SRC} alt="ENEVO Group" style={{width:64,height:64,borderRadius:12,objectFit:"contain",background:"transparent"}}/>);

/* ─── STATIC DATA ─── */
/* TASK_CATEGORIES defined below after TAXONOMY_GROUPS — see line ~1590 */
const LEAVE_TYPES  = ["Annual Leave","Sick Leave","Public Holiday","Business Travel","Training External","Unpaid Leave"];
const FUNCTION_CATS = [
  "Internal Training — Given",
  "Internal Training — Received",
  "Tendering Support — Local",
  "Tendering Support — International",
  "Mentoring & Coaching",
  "R&D & Innovation",
  "Client Meetings",
  "Documentation & Reporting",
  "Proposal Writing & BD",
  "Other Function",
];
const FUNC_COLORS = {
  "Internal Training — Given":        "#a78bfa",
  "Internal Training — Received":     "#818cf8",
  "Tendering Support — Local":        "#38bdf8",
  "Tendering Support — International":"#0ea5e9",
  "Mentoring & Coaching":             "#34d399",
  "R&D & Innovation":                 "#10b981",
  "Client Meetings":                  "#fb923c",
  "Documentation & Reporting":        "#f59e0b",
  "Proposal Writing & BD":            "#ec4899",
  "Other Function":                   "#6b7280",
};
const MONTHS       = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
const PHASES       = ["Design","Basic Engineering","Detailed Engineering","Software","FAT","Commissioning","Closed"];
const LEVELS       = ["Junior","Mid","Senior"];
const ROLES_LIST   = ["Electrical Engineer","Automation Engineer","PLC Programmer","SCADA Engineer","Commissioning Engineer","Renewable Energy Specialist","Instrumentation Engineer","Control Systems Engineer","Project Engineer","Engineering Manager"];
// role_type hierarchy: engineer < lead < accountant < admin
// engineer: post own hours only, no reports
// lead: post own hours, edit any engineer hours, export individual timesheet PDF
// accountant: read-only, export invoices + reports, no editing
// admin: full access
const ROLE_TYPES   = ["engineer","lead","accountant","admin"];
const ROLE_LABELS  = {engineer:"Engineer",lead:"Lead Engineer",accountant:"Accountant",admin:"Admin"};
const ROLE_COLORS  = {engineer:"#4e6479",lead:"#38bdf8",accountant:"#a78bfa",admin:"#34d399"};

const fmt          = d => d.toISOString().slice(0,10);
const today        = new Date();
const fmtCurrency  = n => `$${(n||0).toLocaleString(undefined,{minimumFractionDigits:0})}`;
const fmtPct       = n => `${Math.round(n||0)}%`;
const DAY_NAMES    = ["Sun","Mon","Tue","Wed","Thu","Fri","Sat"];
const DEFAULT_WEEKEND = [5,6];

const getWeekDays7 = date => {
  const d=new Date(date), day=d.getDay();
  const sun=new Date(d); sun.setDate(d.getDate()-day);
  return Array.from({length:7},(_,i)=>{const x=new Date(sun);x.setDate(sun.getDate()+i);return fmt(x);});
};
const getWorkDaysInMonth = (y,m,wd=[5,6]) => {
  const days=[]; const total=new Date(y,m+1,0).getDate();
  for(let d=1;d<=total;d++){const dt=new Date(y,m,d);if(!wd.includes(dt.getDay()))days.push(fmt(dt));}
  return days;
};
const getTargetHrs = (y,m,wd=[5,6]) => getWorkDaysInMonth(y,m,wd).length*8;

// Posting limit: 1 month past to 1 month future
const minPostDate = () => { const d=new Date(today); d.setMonth(d.getMonth()-1); d.setDate(1); return fmt(d); };
const maxPostDate = () => { const d=new Date(today); d.setMonth(d.getMonth()+2); d.setDate(0); return fmt(d); };
const isDateAllowed = date => date >= minPostDate() && date <= maxPostDate();

/* ─── PDF HELPERS ─── */
const PDF_STYLE = `
  @import url('https://fonts.googleapis.com/css2?family=IBM+Plex+Sans:wght@300;400;600;700&family=IBM+Plex+Mono:wght@400;600&display=swap');
  *{margin:0;padding:0;box-sizing:border-box}
  body{font-family:'IBM Plex Sans',sans-serif;color:#1a2332;font-size:11px}
  /* ── Fixed header repeats on every page ── */
  .pdf-hdr{
    position:fixed;top:0;left:0;right:0;height:38px;z-index:1000;
    background:#0a1628;
    border-bottom:2px solid #0ea5e9;
    display:flex;align-items:center;justify-content:space-between;
    padding:0 28px;
  }
  .pdf-hdr-left{display:flex;align-items:center;gap:10px}
  .pdf-hdr-logo{width:26px;height:26px;border-radius:5px;object-fit:contain}
  .pdf-hdr-brand{font-family:'IBM Plex Mono',monospace;font-size:9px;letter-spacing:.15em;color:#38bdf8;font-weight:600}
  .pdf-hdr-title{font-size:10px;color:#94a3b8}
  .pdf-hdr-right{font-family:'IBM Plex Mono',monospace;font-size:9px;color:#475569}
  /* ── Fixed footer repeats on every page ── */
  .pdf-ftr{
    position:fixed;bottom:0;left:0;right:0;height:28px;z-index:1000;
    background:#f8fafc;
    border-top:1px solid #e2e8f0;
    display:flex;align-items:center;justify-content:space-between;
    padding:0 28px;
    font-size:8px;color:#94a3b8;
  }
  .pdf-ftr-left{display:flex;align-items:center;gap:8px}
  .pdf-ftr-dot{width:4px;height:4px;border-radius:50%;background:#0ea5e9}
  /* ── Content area (pushed below header, above footer) ── */
  .pdf-body{padding-top:50px;padding-bottom:38px}
  .cover{background:linear-gradient(135deg,#0a1628,#0f2a50 60%,#153d6e);color:#fff;padding:44px 44px 44px;position:relative;overflow:hidden;margin-top:38px}
  .cover::before{content:'';position:absolute;right:-60px;top:-60px;width:280px;height:280px;border:2px solid rgba(56,189,248,0.15);border-radius:50%}
  .cl{font-family:'IBM Plex Mono',monospace;font-size:9px;letter-spacing:.2em;color:#38bdf8;text-transform:uppercase;margin-bottom:8px}
  .ct{font-size:22px;font-weight:700;line-height:1.2;margin-bottom:6px}.cs{font-size:11px;color:#94a3b8}
  .cm{display:flex;gap:36px;margin-top:14px}.cm label{font-size:9px;color:#64748b;letter-spacing:.1em;text-transform:uppercase;display:block}
  .cm span{font-family:'IBM Plex Mono',monospace;font-size:11px;color:#e2e8f0}
  .body{padding:24px 32px}.section{margin-bottom:22px;page-break-inside:avoid}
  .st{font-size:11px;font-weight:700;color:#0f2a50;text-transform:uppercase;letter-spacing:.08em;padding-bottom:6px;border-bottom:2px solid #0ea5e9;margin-bottom:10px}
  .kg{display:grid;grid-template-columns:repeat(4,1fr);gap:10px;margin-bottom:4px}
  .kp{background:#f0f7ff;border:1px solid #bfdbfe;border-radius:6px;padding:10px}
  .kv{font-family:'IBM Plex Mono',monospace;font-size:20px;font-weight:700;color:#0ea5e9;line-height:1}
  .kl{font-size:9px;color:#64748b;text-transform:uppercase;letter-spacing:.08em;margin-top:4px}
  table{width:100%;border-collapse:collapse;font-size:10px}
  th{background:#0f2a50;color:#fff;padding:6px 8px;text-align:left;font-weight:600;font-size:9px;letter-spacing:.05em;text-transform:uppercase}
  td{padding:5px 8px;border-bottom:1px solid #e2e8f0;vertical-align:top}tr:nth-child(even) td{background:#f8fafc}
  .footer{display:none}
  @media print{
    body{-webkit-print-color-adjust:exact;print-color-adjust:exact}
    @page{margin:38px 0 28px 0}
    .pdf-hdr{position:running(header)}
    .pdf-ftr{position:running(footer)}
  }`;

/* Shared logo base64 ref for PDFs */
function pdfHeader(titleText, subtitleText, now){
  return `<div class="pdf-hdr">
    <div class="pdf-hdr-left">
      <img src="${LOGO_SRC}" class="pdf-hdr-logo" alt="ENEVO"/>
      <span class="pdf-hdr-brand">ENEVO-ERP</span>
      <span style="color:#192d47;font-size:10px">|</span>
      <span class="pdf-hdr-title">${titleText}</span>
    </div>
    <div class="pdf-hdr-right">${subtitleText || now}</div>
  </div>`;
}

function pdfFooter(leftText, now){
  return `<div class="pdf-ftr">
    <div class="pdf-ftr-left">
      <div class="pdf-ftr-dot"></div>
      <span>ENEVO Group · Industrial &amp; Renewable Energy Automation</span>
      <span style="color:#cbd5e1">·</span>
      <span>${leftText||""}</span>
    </div>
    <span>CONFIDENTIAL · ${now}</span>
  </div>`;
}

function generatePDF(title, sections, subtitle="ENEVO Group"){
  const win=window.open("","_blank");
  const now=new Date().toLocaleDateString("en-GB",{day:"2-digit",month:"short",year:"numeric"});
  let html=`<!DOCTYPE html><html><head><meta charset="utf-8"><title>${title}</title><style>${PDF_STYLE}</style></head><body>
  ${pdfHeader(title, subtitle, now)}
  ${pdfFooter(subtitle, now)}
  <div class="cover">
  <div style="display:flex;align-items:center;gap:14px;margin-bottom:16px">
    <img src="data:image/jpeg;base64,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" alt="ENEVO Group" style="width:52px;height:52px;border-radius:10px;object-fit:contain;flex-shrink:0"/>
    <div>
      <div class="cl" style="margin-bottom:2px">ENEVO GROUP · ERP System</div>
      <div style="font-size:11px;color:#94a3b8">Industrial & Renewable Energy Automation</div>
    </div>
  </div>
  <div class="ct">${title}</div><div class="cs">${subtitle}</div>
  <div class="cm"><div><label>Generated</label><span>${now}</span></div><div><label>System</label><span>ENEVO GROUP</span></div><div><label>Status</label><span>Confidential</span></div></div>
  </div><div class="body">`;
  sections.forEach(s=>{html+=s;});
  html+=`</div>
  <script>window.onload=()=>window.print()<\/script></body></html>`;
  win.document.write(html); win.document.close();
}

/* ─── VACATION / LEAVE REPORT PDF ─── */
function buildVacationPDF(engineers, allEntries, leaveEntries, projects, m, y){
  const MONTHS_=["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
  const leaveTypes=["Annual Leave","Sick Leave","Public Holiday","Business Travel","Training External","Unpaid Leave"];
  const typeColors={"Annual Leave":"#0ea5e9","Sick Leave":"#ef4444","Public Holiday":"#f97316","Business Travel":"#8b5cf6","Training External":"#10b981","Unpaid Leave":"#6b7280"};

  // Monthly data
  const leaveByEng=engineers.map(eng=>{
    const engLeave=leaveEntries.filter(e=>String(e.engineer_id)===String(eng.id));
    const byType={};
    engLeave.forEach(e=>{const lt=e.leave_type||"Annual Leave";byType[lt]=(byType[lt]||0)+1;});
    return{...eng,totalDays:engLeave.length,byType,entries:engLeave.sort((a,b)=>a.date.localeCompare(b.date))};
  }).filter(e=>e.totalDays>0);

  // YTD data
  const ytdByEng=engineers.map(eng=>{
    const all=allEntries.filter(e=>String(e.engineer_id)===String(eng.id)&&e.entry_type==="leave"&&new Date(e.date).getFullYear()===y);
    const byType={};
    all.forEach(e=>{const lt=e.leave_type||"Annual Leave";byType[lt]=(byType[lt]||0)+1;});
    return{...eng,total:all.length,byType};
  }).filter(e=>e.total>0);

  const thStyle=`style="background:#f0f7ff;color:#0f2a50;font-size:9px;padding:6px 8px;text-align:center;border-bottom:2px solid #e2e8f0"`;
  const tdStyle=`style="font-size:9px;padding:5px 8px;text-align:center;border-bottom:1px solid #f1f5f9"`;
  const nameTd=`style="font-size:9px;padding:5px 8px;font-weight:600;border-bottom:1px solid #f1f5f9"`;

  const monthlyRows=leaveByEng.map(eng=>{
    const cells=leaveTypes.map(lt=>{
      const n=eng.byType[lt]||0;
      return`<td ${tdStyle} style="font-size:9px;padding:5px 8px;text-align:center;border-bottom:1px solid #f1f5f9;color:${n>0?typeColors[lt]:"#94a3b8"};font-weight:${n>0?700:400}">${n||"—"}</td>`;
    }).join("");
    return`<tr><td ${nameTd}>${eng.name}<br><span style="font-weight:400;color:#64748b;font-size:8px">${eng.role||""}</span></td>${cells}<td ${tdStyle} style="font-size:9px;padding:5px 8px;text-align:center;border-bottom:1px solid #f1f5f9;font-weight:700;color:#0f2a50">${eng.totalDays}d</td></tr>`;
  }).join("");

  const ytdRows=ytdByEng.map(eng=>{
    const cells=leaveTypes.map(lt=>{
      const n=eng.byType[lt]||0;
      return`<td ${tdStyle} style="font-size:9px;padding:5px 8px;text-align:center;border-bottom:1px solid #f1f5f9;color:${n>0?typeColors[lt]:"#94a3b8"};font-weight:${n>0?700:400}">${n||"—"}</td>`;
    }).join("");
    return`<tr><td ${nameTd}>${eng.name}</td>${cells}<td ${tdStyle} style="font-size:9px;padding:5px 8px;text-align:center;border-bottom:1px solid #f1f5f9;font-weight:700;color:#0f2a50">${eng.total}d</td></tr>`;
  }).join("");

  const detailRows=leaveByEng.map(eng=>{
    const chips=eng.entries.map(e=>`<span style="display:inline-block;margin:2px;padding:2px 7px;border-radius:3px;font-size:8px;background:${typeColors[e.leave_type||"Annual Leave"]}20;color:${typeColors[e.leave_type||"Annual Leave"]};border:1px solid ${typeColors[e.leave_type||"Annual Leave"]}40;font-family:'IBM Plex Mono',monospace">${e.date} · ${e.leave_type||"Annual Leave"}</span>`).join("");
    return`<tr><td style="padding:8px;border-bottom:1px solid #f1f5f9;vertical-align:top;width:120px;font-size:9px;font-weight:600">${eng.name}</td><td style="padding:8px;border-bottom:1px solid #f1f5f9">${chips}</td></tr>`;
  }).join("");

  const thCols=leaveTypes.map(lt=>`<th ${thStyle} style="background:#f0f7ff;color:${typeColors[lt]};font-size:9px;padding:6px 8px;text-align:center;border-bottom:2px solid #e2e8f0">${lt}</th>`).join("");

  generatePDF(
    `Vacation & Leave Report — ${MONTHS_[m]} ${y}`,
    [
      `<div class="section"><div class="st">${MONTHS_[m]} ${y} — Leave Summary</div>
      ${leaveByEng.length===0?`<p style="color:#94a3b8;font-size:11px;text-align:center;padding:20px">No leave recorded for ${MONTHS_[m]} ${y}.</p>`:`
      <table><thead><tr><th style="background:#f0f7ff;color:#0f2a50;font-size:9px;padding:6px 8px;border-bottom:2px solid #e2e8f0">Engineer</th>${thCols}<th ${thStyle} style="background:#f0f7ff;color:#0f2a50;font-size:9px;padding:6px 8px;text-align:center;border-bottom:2px solid #e2e8f0">Total</th></tr></thead>
      <tbody>${monthlyRows}</tbody></table>`}
      </div>`,
      `<div class="section"><div class="st">Year-to-Date ${y} — All Leave</div>
      ${ytdByEng.length===0?`<p style="color:#94a3b8;font-size:11px;text-align:center;padding:20px">No leave recorded for ${y}.</p>`:`
      <table><thead><tr><th style="background:#f0f7ff;color:#0f2a50;font-size:9px;padding:6px 8px;border-bottom:2px solid #e2e8f0">Engineer</th>${thCols}<th ${thStyle} style="background:#f0f7ff;color:#0f2a50;font-size:9px;padding:6px 8px;text-align:center;border-bottom:2px solid #e2e8f0">YTD Total</th></tr></thead>
      <tbody>${ytdRows}</tbody></table>`}
      </div>`,
      leaveByEng.length>0?`<div class="section"><div class="st">Leave Detail — ${MONTHS_[m]} ${y}</div>
      <table><thead><tr><th style="background:#f0f7ff;font-size:9px;padding:6px 8px;border-bottom:2px solid #e2e8f0;width:120px">Engineer</th><th style="background:#f0f7ff;font-size:9px;padding:6px 8px;border-bottom:2px solid #e2e8f0">Leave Days</th></tr></thead>
      <tbody>${detailRows}</tbody></table></div>`:""
    ],
    `Leave & Vacation Report · ${MONTHS_[m]} ${y}`
  );
}

/* ─── INDIVIDUAL TIMESHEET PDF ─── */
function buildTimesheetPDF(eng, monthEntries, projects, m, y){
  const workE = monthEntries.filter(e=>String(e.engineer_id)===String(eng.id)&&e.entry_type==="work").sort((a,b)=>a.date.localeCompare(b.date));
  const leaveE= monthEntries.filter(e=>String(e.engineer_id)===String(eng.id)&&e.entry_type==="leave").sort((a,b)=>a.date.localeCompare(b.date));
  const totalW= workE.reduce((s,e)=>s+e.hours,0);
  const totalL= leaveE.length;
  const projMap={};
  workE.forEach(e=>{
    const p=projects.find(x=>x.id===e.project_id);
    if(!projMap[e.project_id]) projMap[e.project_id]={id:e.project_id,name:p?.name||"Unknown",hours:0};
    projMap[e.project_id].hours+=e.hours;
  });
  const projRows=Object.values(projMap).sort((a,b)=>b.hours-a.hours).map(p=>`<tr>
    <td style="font-family:'IBM Plex Mono',monospace;color:#0ea5e9">${p.id}</td>
    <td>${p.name}</td>
    <td style="font-family:'IBM Plex Mono',monospace;font-weight:700;color:#0ea5e9">${p.hours}h</td>
    <td>${totalW?Math.round(p.hours/totalW*100):0}%</td></tr>`).join("");
  const entryRows=workE.map(e=>{
    const p=projects.find(x=>x.id===e.project_id);
    return`<tr>
      <td style="font-family:'IBM Plex Mono',monospace;font-size:9px">${e.date}</td>
      <td style="font-family:'IBM Plex Mono',monospace;font-size:9px;color:#0ea5e9">${e.project_id||""}</td>
      <td style="font-size:9px">${p?.name||""}</td>
      <td style="font-size:9px">${e.task_category||""}</td>
      <td style="font-size:9px">${e.task_type||""}</td>
      <td style="font-style:italic;font-size:9px;max-width:200px">${e.activity||""}</td>
      <td style="font-family:'IBM Plex Mono',monospace;font-weight:700;color:#0ea5e9">${e.hours}h</td></tr>`;}).join("");
  const leaveRows=leaveE.map(e=>`<tr>
    <td style="font-family:'IBM Plex Mono',monospace;font-size:9px">${e.date}</td>
    <td style="color:#fb923c;font-size:9px">${e.leave_type}</td>
    <td>8h</td></tr>`).join("");

  generatePDF(
    `Monthly Timesheet — ${eng.name}`,
    [
      `<div class="section"><div class="st">Engineer Information</div>
      <div class="kg" style="grid-template-columns:repeat(3,1fr)">
        <div class="kp"><div class="kv">${totalW}h</div><div class="kl">Work Hours</div></div>
        <div class="kp"><div class="kv">${totalL}d</div><div class="kl">Leave Days</div></div>
        <div class="kp"><div class="kv">${Object.keys(projMap).length}</div><div class="kl">Projects</div></div>
      </div></div>`,
      `<div class="section"><div class="st">Project Summary</div>
      <table><thead><tr><th>Project No.</th><th>Project Name</th><th>Hours</th><th>Share %</th></tr></thead>
      <tbody>${projRows||`<tr><td colspan="4" style="color:#94a3b8;text-align:center;padding:12px">No work entries for ${MONTHS[m]} ${y}</td></tr>`}</tbody></table></div>`,
      `<div class="section"><div class="st">Daily Work Log — ${MONTHS[m]} ${y}</div>
      <table><thead><tr><th>Date</th><th>Project No.</th><th>Project Name</th><th>Category</th><th>Task</th><th>Activity Description</th><th>Hours</th></tr></thead>
      <tbody>${entryRows||`<tr><td colspan="7" style="color:#94a3b8;text-align:center;padding:12px">No entries</td></tr>`}</tbody></table></div>`,
      leaveE.length>0?`<div class="section"><div class="st">Leave / Absence Log</div>
      <table><thead><tr><th>Date</th><th>Leave Type</th><th>Duration</th></tr></thead>
      <tbody>${leaveRows}</tbody></table></div>`:"",
      `<div class="section" style="margin-top:40px">
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:40px;margin-top:20px">
        <div style="border-top:1px solid #e2e8f0;padding-top:8px"><div style="font-size:9px;color:#64748b;text-transform:uppercase;letter-spacing:.08em">Engineer Signature</div><div style="margin-top:4px;font-size:11px;color:#0f2a50;font-weight:600">${eng.name}</div><div style="font-size:9px;color:#94a3b8">${eng.role||""}</div></div>
        <div style="border-top:1px solid #e2e8f0;padding-top:8px"><div style="font-size:9px;color:#64748b;text-transform:uppercase;letter-spacing:.08em">Approved By</div><div style="margin-top:20px;border-bottom:1px solid #e2e8f0;width:200px"></div></div>
      </div></div>`
    ],
    `${eng.role||"Engineer"} · ${MONTHS[m]} ${y}`
  );
}

/* ─── INVOICE PDF ─── */
// filterId: undefined = all projects, or a specific project id
function buildInvoicePDF(projects, entries, engineers, m, y, filterId){
  // Include all billable projects (filter by id if specified)
  const billableProjs=projects.filter(p=>p.billable&&(!filterId||p.id===filterId));
  // Derive billability from CURRENT project flag, not stale entry.billable
  // Use UTC+12h shift to match the import date parsing
  const monthE=entries.filter(e=>{
    const d=new Date(new Date(e.date+"T12:00:00").getTime());
    return d.getFullYear()===y&&d.getMonth()===m&&e.entry_type==="work"
      &&projects.find(p=>p.id===e.project_id&&p.billable);
  });
  const now=new Date().toLocaleDateString("en-GB",{day:"2-digit",month:"short",year:"numeric"});
  const invoiceNo=filterId?`INV-${y}-${String(m+1).padStart(2,"0")}-${filterId}`:`INV-${y}-${String(m+1).padStart(2,"0")}`;

  const projInvoice=billableProjs.map(p=>{
    const pe=monthE.filter(e=>e.project_id===p.id);
    if(!pe.length) return null;
    const hrs=pe.reduce((s,e)=>s+e.hours,0);
    const rev=hrs*p.rate_per_hour;
    const engBreak=[...new Set(pe.map(e=>e.engineer_id))].map(eid=>{
      const eng=engineers.find(x=>x.id===eid);
      const eh=pe.filter(e=>e.engineer_id===eid).reduce((s,e)=>s+e.hours,0);
      return`<tr style="background:#f8fafc"><td style="padding-left:20px;font-size:9px;color:#64748b">↳ ${eng?.name||"Unknown"}</td><td></td><td style="font-size:9px;color:#64748b">${eh}h</td><td></td></tr>`;
    }).join("");
    return{p,hrs,rev,rows:`<tr style="background:#f0f7ff">
      <td style="font-family:'IBM Plex Mono',monospace;color:#0ea5e9;font-weight:700">${p.id}</td>
      <td style="font-weight:600">${p.name}<br><span style="font-size:9px;color:#64748b">${p.client||""}</span></td>
      <td style="font-family:'IBM Plex Mono',monospace;font-weight:700">${hrs}h</td>
      <td style="font-family:'IBM Plex Mono',monospace">$${p.rate_per_hour}/h</td>
      <td style="font-family:'IBM Plex Mono',monospace;font-weight:700;color:#0ea5e9">${fmtCurrency(rev)}</td></tr>${engBreak}`};
  }).filter(Boolean);

  const totalRev=projInvoice.reduce((s,x)=>s+x.rev,0);
  const totalHrs=projInvoice.reduce((s,x)=>s+x.hrs,0);

  generatePDF(
    `Invoice — ${MONTHS[m]} ${y}`,
    [
      `<div class="section">
      <div style="display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:18px">
        <div>
          <div style="font-size:9px;color:#64748b;text-transform:uppercase;letter-spacing:.1em">Invoice From</div>
          <div style="display:flex;align-items:center;gap:10px;margin-top:4px">
            <img src="data:image/jpeg;base64,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" style="width:36px;height:36px;border-radius:6px;object-fit:contain"/>
            <div style="font-size:14px;font-weight:700;color:#0f2a50">ENEVO Group</div>
          </div>
          <div style="font-size:11px;color:#64748b;margin-top:2px">ENEVO Group</div>
          <div style="font-size:11px;color:#64748b">Industrial & Renewable Energy Automation</div>
        </div>
        <div style="text-align:right">
          <div style="font-family:'IBM Plex Mono',monospace;font-size:18px;font-weight:700;color:#0ea5e9">${invoiceNo}</div>
          <div style="font-size:10px;color:#64748b;margin-top:2px">Period: ${MONTHS[m]} ${y}</div>
          <div style="font-size:10px;color:#64748b">Date: ${now}</div>
        </div>
      </div>
      <div class="kg" style="grid-template-columns:repeat(3,1fr)">
        <div class="kp"><div class="kv">${fmtCurrency(totalRev)}</div><div class="kl">Total Billable</div></div>
        <div class="kp"><div class="kv">${totalHrs}h</div><div class="kl">Billable Hours</div></div>
        <div class="kp"><div class="kv">${projInvoice.length}</div><div class="kl">Projects Billed</div></div>
      </div></div>`,
      `<div class="section"><div class="st">Billable Services Detail</div>
      <table><thead><tr><th>Project No.</th><th>Project / Client</th><th>Hours</th><th>Rate</th><th>Amount</th></tr></thead>
      <tbody>${projInvoice.map(x=>x.rows).join("")}
      <tr style="background:#0f2a50;color:#fff"><td colspan="2" style="font-weight:700;font-size:11px">TOTAL</td>
      <td style="font-family:'IBM Plex Mono',monospace;font-weight:700">${totalHrs}h</td><td></td>
      <td style="font-family:'IBM Plex Mono',monospace;font-weight:700;font-size:13px">${fmtCurrency(totalRev)}</td></tr>
      </tbody></table></div>`,
      `<div class="section" style="margin-top:30px">
      <div style="background:#f0f7ff;border:1px solid #bfdbfe;border-radius:8px;padding:16px">
        <div style="font-size:10px;font-weight:700;color:#0f2a50;text-transform:uppercase;letter-spacing:.06em;margin-bottom:8px">Payment Terms</div>
        <div style="font-size:10px;color:#64748b;line-height:1.7">
          Payment due within 30 days of invoice date.<br>
          Please reference invoice number <strong>${invoiceNo}</strong> in all correspondence.<br>
          For queries contact: ENEVO Group Management
        </div>
      </div></div>`
    ],
    `Invoice No. ${invoiceNo} · For Finance & Management`
  );
}

/* ─── SIGNUP SCREEN ─── */
function SignupScreen({onBack}){
  const [form,setForm]=useState({email:"",password:"",name:"",role:ROLES_LIST[0],level:"Mid"});
  const [err,setErr]=useState(""); const [loading,setLoading]=useState(false);
  const handle=async e=>{
    e.preventDefault(); setErr(""); setLoading(true);
    if(!form.name.trim()){setErr("Please enter your full name.");setLoading(false);return;}
    const {data,error}=await supabase.auth.signUp({email:form.email,password:form.password});
    if(error){setErr(error.message);setLoading(false);return;}
    if(data.user){
      // New accounts always get 'engineer' — only admin can upgrade later
      await supabase.from("engineers").insert({
        user_id:data.user.id,name:form.name.trim(),role:form.role,
        level:form.level,email:form.email,role_type:"engineer",
        weekend_days:JSON.stringify(DEFAULT_WEEKEND)
      });
      await supabase.from("notifications").insert({
        type:"new_signup",message:`New engineer signed up: ${form.name} (${form.role})`,
        meta:JSON.stringify({email:form.email,role:form.role,level:form.level}),read:false
      });
    }
    setErr("✓ Account created! Check your email to confirm, then sign in.");
    setLoading(false);
  };
  return(
    <div style={{display:"grid",gap:11}}>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}>
        <div><Lbl>Full Name</Lbl><input value={form.name} onChange={e=>setForm(p=>({...p,name:e.target.value}))} placeholder="Ahmed Hassan"/></div>
        <div><Lbl>Level</Lbl><select value={form.level} onChange={e=>setForm(p=>({...p,level:e.target.value}))}>{LEVELS.map(l=><option key={l}>{l}</option>)}</select></div>
      </div>
      <div><Lbl>Job Role</Lbl><select value={form.role} onChange={e=>setForm(p=>({...p,role:e.target.value}))}>{ROLES_LIST.map(r=><option key={r}>{r}</option>)}</select></div>
      <div><Lbl>Email</Lbl><input type="email" value={form.email} onChange={e=>setForm(p=>({...p,email:e.target.value}))} placeholder="you@company.com"/></div>
      <div><Lbl>Password</Lbl><input type="password" value={form.password} onChange={e=>setForm(p=>({...p,password:e.target.value}))} placeholder="Min 6 characters"/></div>
      <div style={{background:"#0c2b4e",border:"1px solid #0ea5e930",borderRadius:6,padding:"8px 12px",fontSize:11,color:"#38bdf8"}}>
        ℹ Account role is set to <strong>Engineer</strong> by default. Your admin can upgrade your access level after registration.
      </div>
      {err&&<div style={{padding:"8px 12px",borderRadius:6,fontSize:12,background:err.startsWith("✓")?"#022c22":"#450a0a",color:err.startsWith("✓")?"#34d399":"#f87171",border:`1px solid ${err.startsWith("✓")?"#34d399":"#f87171"}`}}>{err}</div>}
      <button className="bp" onClick={handle} disabled={loading} style={{width:"100%",justifyContent:"center",padding:11}}>{loading?"Creating…":"Create Account"}</button>
      <div style={{textAlign:"center",fontSize:12,color:"#2e4a66",cursor:"pointer"}} onClick={onBack}>← Back to Sign In</div>
    </div>
  );
}

const Lbl=({children})=><div style={{fontSize:11,color:"#4e6479",marginBottom:4}}>{children}</div>;

/* ════════════════════════════════════════════
   MAIN APP
════════════════════════════════════════════ */

/* ── Projects Page Component (extracted to avoid IIFE hook issues) ── */
function ProjectsView({projects,projSearch,setProjSearch,projStatusFilter,setProjStatusFilter,
  monthEntries,projStats,isAdmin,isAcct,setShowProjModal,setEditProjModal,deleteProject,fmtCurrency}){
  const filteredProjects=projects.filter(p=>{
    const ms=projStatusFilter==="ALL"||p.status===projStatusFilter;
    const mq=!projSearch||p.name.toLowerCase().includes(projSearch.toLowerCase())||
      p.id.toLowerCase().includes(projSearch.toLowerCase())||
      (p.client||"").toLowerCase().includes(projSearch.toLowerCase());
    return ms&&mq;
  });
  return(
    <div>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-end",marginBottom:18}}>
        <div>
          <h1 style={{fontSize:21,fontWeight:700,color:"#f0f6ff"}}>Projects</h1>
          <p style={{color:"#2e4a66",fontSize:12,marginTop:3}}>{filteredProjects.length} of {projects.length} projects</p>
        </div>
        <div style={{display:"flex",gap:8,alignItems:"flex-end"}}>
          <div>
            <div style={{fontSize:10,color:"#2e4a66",fontWeight:600,marginBottom:4}}>SEARCH</div>
            <input value={projSearch} onChange={e=>setProjSearch(e.target.value)}
              placeholder="Name, ID, client…" style={{width:180,background:"#060e1c",border:"1px solid #192d47",borderRadius:6,padding:"7px 10px",color:"#f0f6ff",fontSize:12,fontFamily:"'IBM Plex Sans',sans-serif"}}/>
          </div>
          <div>
            <div style={{fontSize:10,color:"#2e4a66",fontWeight:600,marginBottom:4}}>STATUS</div>
            <select value={projStatusFilter} onChange={e=>setProjStatusFilter(e.target.value)}
              style={{width:130,background:"#060e1c",border:"1px solid #192d47",borderRadius:6,padding:"7px 10px",color:"#f0f6ff",fontSize:12,fontFamily:"'IBM Plex Sans',sans-serif"}}>
              <option value="ALL">All Statuses</option>
              {["Active","On Hold","Completed"].map(s=><option key={s}>{s}</option>)}
            </select>
          </div>
          {isAdmin&&<button style={{background:"#0ea5e9",border:"none",borderRadius:6,padding:"8px 14px",color:"#fff",fontSize:12,fontWeight:600,cursor:"pointer",fontFamily:"'IBM Plex Sans',sans-serif"}} onClick={()=>setShowProjModal(true)}>+ New Project</button>}
        </div>
      </div>
      {filteredProjects.length===0&&<div style={{textAlign:"center",padding:60,color:"#253a52",fontSize:13}}>No projects match your filter.</div>}
      <div style={{display:"grid",gridTemplateColumns:"repeat(2,1fr)",gap:12}}>
        {filteredProjects.map(p=>{
          const ps=projStats.find(x=>x.id===p.id);
          const topTasks=Object.entries(
            monthEntries.filter(e=>e.project_id===p.id&&e.entry_type==="work")
              .reduce((acc,e)=>{acc[e.task_type||"Other"]=(acc[e.task_type||"Other"]||0)+e.hours;return acc;},{})
          ).sort((a,b)=>b[1]-a[1]).slice(0,3);
          return(
            <div key={p.id} style={{background:"#0b1526",border:"1px solid #192d47",borderRadius:10,padding:16,borderLeft:`3px solid ${p.type==="Renewable Energy"?"#34d399":"#818cf8"}`}}>
              <div style={{display:"flex",justifyContent:"space-between",marginBottom:8}}>
                <div>
                  <div style={{fontFamily:"'IBM Plex Mono',monospace",fontSize:11,color:"#38bdf8"}}>{p.id}</div>
                  <div style={{fontSize:13,fontWeight:600,marginTop:2,lineHeight:1.3,color:"#f0f6ff"}}>{p.name}</div>
                </div>
                <div style={{display:"flex",gap:5,alignItems:"flex-start"}}>
                  <span style={{fontSize:9,padding:"2px 7px",borderRadius:3,fontFamily:"'IBM Plex Mono',monospace",fontWeight:700,
                    background:p.status==="Active"?"#024b36":p.status==="On Hold"?"#7c2d1230":"#1e3a5f",
                    color:p.status==="Active"?"#34d399":p.status==="On Hold"?"#fb923c":"#60a5fa"}}>{p.status}</span>
                  {isAdmin&&<>
                    <button style={{background:"#0ea5e9",border:"none",borderRadius:4,padding:"2px 6px",color:"#fff",fontSize:10,cursor:"pointer"}} onClick={()=>setEditProjModal({...p})}>✎</button>
                    <button style={{background:"#ef4444",border:"none",borderRadius:4,padding:"2px 6px",color:"#fff",fontSize:10,cursor:"pointer"}} onClick={()=>deleteProject(p.id)}>✕</button>
                  </>}
                </div>
              </div>
              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:5,fontSize:11,marginBottom:10,color:"#dde3ef"}}>
                {p.client&&<div><span style={{color:"#2e4a66"}}>Client: </span>{p.client}</div>}
                {p.origin&&<div><span style={{color:"#2e4a66"}}>Origin: </span>{p.origin}</div>}
                <div><span style={{color:"#2e4a66"}}>Phase: </span><span style={{color:"#60a5fa"}}>{p.phase||"—"}</span></div>
                {(isAdmin||isAcct)&&<div><span style={{color:"#2e4a66"}}>Rate: </span>
                  <span style={{fontFamily:"'IBM Plex Mono',monospace",color:p.billable?"#a78bfa":"#253a52"}}>
                    {p.billable?`$${p.rate_per_hour}/h`:"Non-Billable"}
                  </span>
                </div>}
              </div>
              {topTasks.length>0&&<div style={{background:"#060e1c",borderRadius:5,padding:"6px 9px",marginBottom:10}}>
                {topTasks.map(([task,hrs])=>(
                  <div key={task} style={{display:"flex",justifyContent:"space-between",fontSize:10,marginBottom:2}}>
                    <span style={{color:"#7a8faa"}}>{task}</span>
                    <span style={{fontFamily:"'IBM Plex Mono',monospace",color:"#38bdf8"}}>{hrs}h</span>
                  </div>
                ))}
              </div>}
              <div style={{paddingTop:9,borderTop:"1px solid #192d47"}}>
                <div style={{fontFamily:"'IBM Plex Mono',monospace",fontSize:18,fontWeight:700,color:"#38bdf8"}}>{ps?.hours||0}h</div>
                {(isAdmin||isAcct)&&p.billable&&<div style={{fontSize:10,color:"#a78bfa"}}>{fmtCurrency(ps?.revenue||0)}</div>}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}


/* ─── PROJECT TASKS ANALYSIS PDF ─── */
function buildProjectTasksPDF(pm, grandTotal, month, year, MONTHS_ARR, fmtCurrency, isAdmin, isAcct, periodLabel){
  const now=new Date().toLocaleDateString("en-GB",{day:"2-digit",month:"short",year:"numeric"});
  const p=pm.proj;
  const pct=grandTotal?Math.round(pm.totalHrs/grandTotal*100):100;
  const billPct=pm.totalHrs?Math.round(pm.billableHrs/pm.totalHrs*100):0;
  const tasksSorted=Object.entries(pm.tasks).sort((a,b)=>b[1].hrs-a[1].hrs);
  const engList=Object.values(pm.engineers).sort((a,b)=>b.hrs-a.hrs);
  const avgDay=pm.days?Math.round(pm.totalHrs/pm.days*10)/10:0;

  const TASK_COLORS=["#0ea5e9","#a78bfa","#34d399","#fb923c","#f87171","#e879f9","#facc15","#4ade80","#f472b6","#60a5fa"];
  const taskColorMap={};let ci=0;
  tasksSorted.forEach(([t])=>{if(!taskColorMap[t])taskColorMap[t]=TASK_COLORS[ci++%TASK_COLORS.length];});

  // KPI cards
  const kpis=`
    <div style="display:grid;grid-template-columns:repeat(4,1fr);gap:10px;margin-bottom:20px">
      ${[
        {l:"Total Hours",   v:pm.totalHrs+"h",  c:"#0ea5e9"},
        {l:"Engineers",     v:Object.keys(pm.engineers).length, c:"#a78bfa"},
        {l:"Work Days",     v:pm.days,           c:"#34d399"},
        {l:"Avg Hrs/Day",   v:avgDay+"h",        c:"#fb923c"},
      ].map(k=>`
        <div style="background:#f0f7ff;border:1px solid #bfdbfe;border-radius:8px;padding:12px">
          <div style="font-family:'IBM Plex Mono',monospace;font-size:22px;font-weight:700;color:${k.c};line-height:1">${k.v}</div>
          <div style="font-size:9px;color:#64748b;text-transform:uppercase;letter-spacing:.08em;margin-top:4px">${k.l}</div>
        </div>`).join("")}
    </div>`;

  // Project info table
  const infoRows=[
    ["Project ID",p.id],
    ["Project Name",p.name],
    ["Client",p.client||"—"],
    ["Phase",p.phase||"—"],
    ["Status",p.status||"—"],
    ["Type",p.type||"—"],
    ...(isAdmin||isAcct?[
      ["Billing",p.billable?"Billable at $"+p.rate_per_hour+"/h":"Non-Billable"],
      ...(p.billable&&p.rate_per_hour>0?[["Revenue",fmtCurrency(pm.totalHrs*p.rate_per_hour)]]:[] ),
    ]:[]),
    ["Share of Month",pct+"% of total hours"],
  ];
  const infoTable=`
    <div class="section">
      <div class="st">Project Information</div>
      <table><tbody>
        ${infoRows.map(([k,v],i)=>`<tr><td style="width:160px;font-weight:600;color:#334155;background:${i%2===0?"#f8fafc":"#fff"}">${k}</td><td style="background:${i%2===0?"#f8fafc":"#fff"}">${v}</td></tr>`).join("")}
      </tbody></table>
    </div>`;

  // Task breakdown — bars + table
  const taskBars=tasksSorted.map(([task,data])=>{
    const tpct=pm.totalHrs?Math.round(data.hrs/pm.totalHrs*100):0;
    const col=taskColorMap[task]||"#0ea5e9";
    return`<div style="margin-bottom:10px">
      <div style="display:flex;justify-content:space-between;margin-bottom:3px;font-size:10px">
        <div style="display:flex;align-items:center;gap:6px">
          <div style="width:8px;height:8px;border-radius:2px;background:${col};flex-shrink:0"></div>
          <span style="font-weight:600;color:#1e293b">${task}</span>
        </div>
        <div style="display:flex;gap:16px;font-family:'IBM Plex Mono',monospace">
          <span style="color:${col};font-weight:700">${data.hrs}h</span>
          <span style="color:#64748b">${tpct}%</span>
          <span style="color:#94a3b8">${data.engs} engineer${data.engs!==1?"s":""}</span>
        </div>
      </div>
      <div style="background:#e2e8f0;height:7px;border-radius:4px;overflow:hidden">
        <div style="height:100%;width:${tpct}%;background:${col};border-radius:4px"></div>
      </div>
    </div>`;
  }).join("");

  const taskSection=`
    <div class="section">
      <div class="st">Task Breakdown — ${tasksSorted.length} Task Types</div>
      ${taskBars}
      <table style="margin-top:14px">
        <thead><tr><th>Task Type</th><th style="text-align:right">Hours</th><th style="text-align:right">Share</th><th style="text-align:right">Engineers</th></tr></thead>
        <tbody>${tasksSorted.map(([task,data],i)=>{
          const tpct=pm.totalHrs?Math.round(data.hrs/pm.totalHrs*100):0;
          const col=taskColorMap[task]||"#0ea5e9";
          return`<tr><td><span style="display:inline-block;width:8px;height:8px;border-radius:2px;background:${col};margin-right:6px"></span>${task}</td>
            <td style="text-align:right;font-family:'IBM Plex Mono',monospace;color:${col};font-weight:700">${data.hrs}h</td>
            <td style="text-align:right;font-family:'IBM Plex Mono',monospace">${tpct}%</td>
            <td style="text-align:right">${data.engs}</td></tr>`;
        }).join("")}</tbody>
      </table>
    </div>`;

  // Engineer contribution
  const engSection=`
    <div class="section">
      <div class="st">Engineer Contributions — ${engList.length} Engineers</div>
      ${engList.map(eng=>{
        const epct=pm.totalHrs?Math.round(eng.hrs/pm.totalHrs*100):0;
        const topTask=Object.entries(eng.tasks).sort((a,b)=>b[1]-a[1])[0];
        return`<div style="margin-bottom:10px">
          <div style="display:flex;justify-content:space-between;margin-bottom:3px;font-size:10px">
            <div style="display:flex;align-items:center;gap:8px">
              <div style="width:24px;height:24px;border-radius:50%;background:linear-gradient(135deg,#0ea5e9,#0369a1);display:flex;align-items:center;justify-content:center;font-size:8px;font-weight:700;color:#fff;flex-shrink:0">${(eng.name||"?").slice(0,2).toUpperCase()}</div>
              <div>
                <div style="font-weight:600;color:#1e293b">${eng.name}</div>
                ${topTask?`<div style="font-size:9px;color:#64748b">Top task: ${topTask[0]} (${topTask[1]}h)</div>`:""}
              </div>
            </div>
            <div style="display:flex;gap:16px;align-items:center;font-family:'IBM Plex Mono',monospace">
              <span style="color:#0ea5e9;font-weight:700">${eng.hrs}h</span>
              <span style="color:#64748b">${epct}%</span>
            </div>
          </div>
          <div style="background:#e2e8f0;height:7px;border-radius:4px;overflow:hidden">
            <div style="height:100%;width:${epct}%;background:linear-gradient(90deg,#0ea5e9,#38bdf8);border-radius:4px"></div>
          </div>
        </div>`;
      }).join("")}
      <table style="margin-top:14px">
        <thead><tr><th>Engineer</th><th style="text-align:right">Hours</th><th style="text-align:right">Share</th><th>Top Task</th></tr></thead>
        <tbody>${engList.map((eng,i)=>{
          const epct=pm.totalHrs?Math.round(eng.hrs/pm.totalHrs*100):0;
          const topTask=Object.entries(eng.tasks).sort((a,b)=>b[1]-a[1])[0];
          return`<tr>
            <td style="font-weight:500">${eng.name}</td>
            <td style="text-align:right;font-family:'IBM Plex Mono',monospace;color:#0ea5e9;font-weight:700">${eng.hrs}h</td>
            <td style="text-align:right;font-family:'IBM Plex Mono',monospace">${epct}%</td>
            <td style="color:#64748b;font-size:10px">${topTask?topTask[0]+" ("+topTask[1]+"h)":"—"}</td></tr>`;
        }).join("")}</tbody>
      </table>
    </div>`;

  // Billability section
  const billSection=(isAdmin||isAcct)&&p.billable?`
    <div class="section">
      <div class="st">Billability Summary</div>
      <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:10px;margin-bottom:14px">
        ${[
          {l:"Billable Hours",  v:pm.billableHrs+"h",  c:"#34d399"},
          {l:"Bill %",          v:billPct+"%",          c:"#0ea5e9"},
          ...(p.rate_per_hour>0?[{l:"Revenue",v:fmtCurrency(pm.totalHrs*p.rate_per_hour),c:"#a78bfa"}]:[]),
        ].map(k=>`
          <div style="background:#f0fdf4;border:1px solid #bbf7d0;border-radius:8px;padding:12px">
            <div style="font-family:'IBM Plex Mono',monospace;font-size:20px;font-weight:700;color:${k.c};line-height:1">${k.v}</div>
            <div style="font-size:9px;color:#64748b;text-transform:uppercase;letter-spacing:.08em;margin-top:4px">${k.l}</div>
          </div>`).join("")}
      </div>
      <div style="background:#e2e8f0;height:10px;border-radius:5px;overflow:hidden;margin-bottom:6px">
        <div style="height:100%;width:${billPct}%;background:linear-gradient(90deg,#34d399,#10b981);border-radius:5px"></div>
      </div>
      <div style="font-size:10px;color:#64748b;text-align:right">${billPct}% of hours are billable</div>
    </div>`:"";

  // Build full PDF using shared PDF_STYLE + fixed header/footer
  const win=window.open("","_blank");
  const html=`<!DOCTYPE html><html><head><meta charset="utf-8"><title>Project Report — ${p.id}</title><style>${PDF_STYLE}</style></head><body>
  ${pdfHeader(`Project Analysis · ${p.id}`, `${periodLabel||'All Time'}`, now)}
  ${pdfFooter(`${p.id} — ${p.name}`, now)}
  <div class="cover">
    <div style="display:flex;align-items:center;gap:14px;margin-bottom:16px">
      <img src="${LOGO_B64}" alt="ENEVO Group" style="width:52px;height:52px;border-radius:10px;object-fit:contain;flex-shrink:0"/>
      <div>
        <div class="cl" style="margin-bottom:2px">ENEVO GROUP · Project Tasks Analysis</div>
        <div style="font-size:11px;color:#94a3b8">Industrial & Renewable Energy Automation</div>
      </div>
    </div>
    <div class="ct">${p.name}</div>
    <div class="cs">Project ID: ${p.id} · ${periodLabel||'All Time'}</div>
    <div class="cm">
      <div><label>Generated</label><span>${now}</span></div>
      <div><label>Total Hours</label><span>${pm.totalHrs}h</span></div>
      <div><label>Engineers</label><span>${Object.keys(pm.engineers).length}</span></div>
      <div><label>Status</label><span>${p.status||"Active"}</span></div>
    </div>
  </div>
  <div class="body">
    ${kpis}
    ${infoTable}
    ${taskSection}
    ${engSection}
    ${billSection}
  </div>
  <script>window.onload=()=>window.print()<\/script>
  </body></html>`;
  if(win){win.document.write(html);win.document.close();}
  else{alert("Please allow popups for this site to export PDFs.");}
}


/* ─── FINANCE P&L PDF ─── */
function buildFinancePDF({finMonth,finYear,MONTHS_,monthRevUSD,totalPayrollUSDeff,totalPayrollEGP,totalExpUSD,totalExpEGP,totalCostUSD,netPL,netColor,activeStaff,monthExp,deptList,projProfit,ytdData,ytdRev,ytdCost,ytdNet,fmtCurrency,isAdmin,egpRate}){
  const totalPayrollUSD=totalPayrollUSDeff; // alias for PDF use
  const now=new Date().toLocaleDateString("en-GB",{day:"2-digit",month:"short",year:"numeric"});
  const period=`${MONTHS_[finMonth]} ${finYear}`;
  const netSign=netPL>=0?"▲ PROFIT":"▼ LOSS";
  const marginPct=monthRevUSD>0?Math.round(netPL/monthRevUSD*100):0;

  const kpiCards=(items)=>items.map(k=>`
    <div style="background:#f0f7ff;border:1px solid #bfdbfe;border-radius:8px;padding:12px;text-align:center">
      <div style="font-family:'IBM Plex Mono',monospace;font-size:18px;font-weight:700;color:${k.c};line-height:1">${k.v}</div>
      <div style="font-size:8px;color:#64748b;text-transform:uppercase;letter-spacing:.08em;margin-top:4px">${k.l}</div>
    </div>`).join("");

  const coverSection=`
  <div class="cover">
    <div style="display:flex;align-items:center;gap:14px;margin-bottom:20px">
      <img src="${LOGO_SRC}" style="width:52px;height:52px;border-radius:10px;object-fit:contain"/>
      <div>
        <div class="cl">ENEVO GROUP · Financial Report</div>
        <div style="font-size:11px;color:#94a3b8">Profit & Loss Statement</div>
      </div>
    </div>
    <div class="ct">P&L Report — ${period}</div>
    <div class="cs">Generated: ${now} · CONFIDENTIAL</div>
    <div class="cm">
      <div><label>Revenue</label><span>$${monthRevUSD.toLocaleString()}</span></div>
      <div><label>Total Cost</label><span>$${totalCostUSD.toLocaleString()}</span></div>
      <div><label>EGP Rate</label><span>${egpRate} EGP/$</span></div>
      <div><label>Net P&L</label><span style="color:${netColor}">${netSign} $${Math.abs(netPL).toLocaleString()}</span></div>
      <div><label>Margin</label><span style="color:${netColor}">${marginPct}%</span></div>
    </div>
  </div>`;

  const plSection=`
  <div class="section">
    <div class="st">Profit & Loss Summary — ${period}</div>
    <div style="display:grid;grid-template-columns:repeat(4,1fr);gap:10px;margin-bottom:16px">
      ${kpiCards([
        {l:"Revenue",     v:fmtCurrency(monthRevUSD),   c:"#16a34a"},
        {l:"Payroll",     v:fmtCurrency(totalPayrollUSD),c:"#dc2626"},
        {l:"Expenses",    v:fmtCurrency(totalExpUSD),   c:"#ea580c"},
        {l:"Net P&L",     v:fmtCurrency(netPL),         c:netColor},
      ])}
    </div>
    <table>
      <thead><tr><th>Item</th><th style="text-align:right">USD</th><th style="text-align:right">EGP</th><th style="text-align:right">Notes</th></tr></thead>
      <tbody>
        <tr style="background:#f0fdf4"><td style="font-weight:700;color:#16a34a">Revenue — Billable Projects</td><td style="text-align:right;font-family:'IBM Plex Mono',monospace;font-weight:700;color:#16a34a">${fmtCurrency(monthRevUSD)}</td><td style="text-align:right">—</td><td style="font-size:9px;color:#64748b">Derived from project billing rates × hours</td></tr>
        <tr><td style="font-weight:600;color:#dc2626">Total Payroll</td><td style="text-align:right;font-family:'IBM Plex Mono',monospace;color:#dc2626;font-weight:700">${fmtCurrency(totalPayrollUSD)}</td><td style="text-align:right;font-family:'IBM Plex Mono',monospace;color:#ea580c">EGP ${totalPayrollEGP.toLocaleString()}</td><td style="font-size:9px;color:#64748b">${activeStaff.length} active staff</td></tr>
        <tr><td style="font-weight:600;color:#ea580c">Office & Other Expenses</td><td style="text-align:right;font-family:'IBM Plex Mono',monospace;color:#ea580c;font-weight:700">${fmtCurrency(totalExpUSD)}</td><td style="text-align:right;font-family:'IBM Plex Mono',monospace;color:#a78bfa">EGP ${totalExpEGP.toLocaleString()}</td><td style="font-size:9px;color:#64748b">${monthExp.length} expense entries</td></tr>
        <tr style="background:#0f2a50;color:#fff"><td style="font-weight:700">NET PROFIT / LOSS</td><td style="text-align:right;font-family:'IBM Plex Mono',monospace;font-weight:700;font-size:14px;color:${netColor}">${netPL>=0?"+":""}${fmtCurrency(netPL)}</td><td style="text-align:right;color:#94a3b8">—</td><td style="text-align:right;font-family:'IBM Plex Mono',monospace;color:${netColor}">${marginPct}% margin</td></tr>
      </tbody>
    </table>
  </div>`;

  const deptSection=`
  <div class="section">
    <div class="st">Salary by Department</div>
    <table>
      <thead><tr><th>Department</th><th style="text-align:right">Headcount</th><th style="text-align:right">Monthly USD</th><th style="text-align:right">Monthly EGP</th><th style="text-align:right">% of Payroll</th></tr></thead>
      <tbody>${deptList.map(d=>`<tr>
        <td style="font-weight:600">${d.dept}</td>
        <td style="text-align:right">${d.count}</td>
        <td style="text-align:right;font-family:'IBM Plex Mono',monospace;color:#dc2626;font-weight:700">${fmtCurrency(d.usd)}</td>
        <td style="text-align:right;font-family:'IBM Plex Mono',monospace;color:#ea580c">EGP ${d.egp.toLocaleString()}</td>
        <td style="text-align:right;font-family:'IBM Plex Mono',monospace">${totalPayrollUSD?Math.round(d.usd/totalPayrollUSD*100):0}%</td>
      </tr>`).join("")}</tbody>
    </table>
  </div>`;

  const staffSection=`
  <div class="section">
    <div class="st">Staff Salary Breakdown (${activeStaff.length} Active)</div>
    <table>
      <thead><tr><th>Name</th><th>Department</th><th>Role</th><th>Type</th><th style="text-align:right">USD/mo</th><th style="text-align:right">EGP/mo</th><th>Joined</th><th>Left</th></tr></thead>
      <tbody>${activeStaff.map(s=>`<tr>
        <td style="font-weight:600">${s.name}</td>
        <td style="color:#0ea5e9;font-size:9px">${s.department}</td>
        <td style="color:#64748b;font-size:9px">${s.role}</td>
        <td style="font-size:8px"><span style="padding:2px 5px;border-radius:3px;background:#dbeafe;color:#1e40af">${(s.type||"full_time").replace("_"," ")}</span></td>
        <td style="text-align:right;font-family:'IBM Plex Mono',monospace;font-weight:700;color:#dc2626">${fmtCurrency(s.salary_usd||0)}</td>
        <td style="text-align:right;font-family:'IBM Plex Mono',monospace;color:#ea580c">EGP ${(s.salary_egp||0).toLocaleString()}</td>
        <td style="font-family:'IBM Plex Mono',monospace;font-size:9px;color:#0ea5e9">${s.join_date||'—'}</td>
        <td style="font-family:'IBM Plex Mono',monospace;font-size:9px;color:${s.termination_date?'#dc2626':'#94a3b8'}">${s.termination_date||'—'}</td>
      </tr>`).join("")}</tbody>
    </table>
  </div>`;

  const expSection=`
  <div class="section">
    <div class="st">Expense Detail — ${period} (${monthExp.length} entries)</div>
    ${monthExp.length===0?`<p style="color:#94a3b8;font-size:10px;padding:10px 0">No expenses recorded for ${period}.</p>`:`
    <table>
      <thead><tr><th>Category</th><th>Description</th><th style="text-align:right">USD</th><th style="text-align:right">EGP</th><th>Notes</th></tr></thead>
      <tbody>${monthExp.map(e=>`<tr>
        <td><span style="font-size:8px;padding:2px 5px;border-radius:3px;background:#dbeafe;color:#1e40af">${e.category}</span></td>
        <td>${e.description}</td>
        <td style="text-align:right;font-family:'IBM Plex Mono',monospace;font-weight:700;color:#ea580c">${e.amount_usd?fmtCurrency(e.amount_usd):"-"}</td>
        <td style="text-align:right;font-family:'IBM Plex Mono',monospace;color:#7c3aed">EGP ${(e.amount_egp||0).toLocaleString()}</td>
        <td style="font-size:9px;color:#64748b;font-style:italic">${e.notes||""}</td>
      </tr>`).join("")}</tbody>
    </table>`}
  </div>`;

  const projSection=projProfit.length>0?`
  <div class="section">
    <div class="st">Per-Project Profitability — ${period}</div>
    <div style="font-size:9px;color:#64748b;margin-bottom:8px">Cost allocated proportionally by hours worked on each billable project.</div>
    <table>
      <thead><tr><th>Project</th><th style="text-align:right">Revenue</th><th style="text-align:right">Alloc. Cost</th><th style="text-align:right">Net P&L</th><th style="text-align:right">Margin</th><th style="text-align:right">Hours</th></tr></thead>
      <tbody>${projProfit.map(p=>{
        const margin=p.rev>0?Math.round(p.net/p.rev*100):0;
        const c=p.net>=0?"#16a34a":"#dc2626";
        return`<tr>
          <td style="font-weight:600">${p.id} — ${p.name}</td>
          <td style="text-align:right;font-family:'IBM Plex Mono',monospace;color:#16a34a;font-weight:700">${fmtCurrency(p.rev)}</td>
          <td style="text-align:right;font-family:'IBM Plex Mono',monospace;color:#dc2626">${fmtCurrency(Math.round(p.allocatedCost))}</td>
          <td style="text-align:right;font-family:'IBM Plex Mono',monospace;font-weight:700;color:${c}">${p.net>=0?"+":""}${fmtCurrency(Math.round(p.net))}</td>
          <td style="text-align:right;font-family:'IBM Plex Mono',monospace;color:${c}">${margin}%</td>
          <td style="text-align:right;font-family:'IBM Plex Mono',monospace;color:#64748b">${p.hrs}h</td>
        </tr>`;
      }).join("")}</tbody>
    </table>
  </div>`:"";

  const ytdSection=`
  <div class="section">
    <div class="st">Year-to-Date ${finYear} Summary</div>
    <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:10px;margin-bottom:14px">
      ${kpiCards([
        {l:"YTD Revenue",v:fmtCurrency(ytdRev), c:"#16a34a"},
        {l:"YTD Costs",  v:fmtCurrency(ytdCost),c:"#dc2626"},
        {l:"YTD Net",    v:fmtCurrency(ytdNet), c:ytdNet>=0?"#16a34a":"#dc2626"},
      ])}
    </div>
    <table>
      <thead><tr><th>Month</th><th style="text-align:right">Revenue</th><th style="text-align:right">Cost</th><th style="text-align:right">Net P&L</th><th style="text-align:right">Margin</th></tr></thead>
      <tbody>${ytdData.map(row=>{
        const margin=row.rev>0?Math.round(row.net/row.rev*100):0;
        const c=row.net>=0?"#16a34a":"#dc2626";
        return`<tr>
          <td style="font-weight:600">${MONTHS_[row.m]} ${finYear}</td>
          <td style="text-align:right;font-family:'IBM Plex Mono',monospace;color:#16a34a;font-weight:700">${fmtCurrency(row.rev)}</td>
          <td style="text-align:right;font-family:'IBM Plex Mono',monospace;color:#dc2626">${fmtCurrency(row.cost)}</td>
          <td style="text-align:right;font-family:'IBM Plex Mono',monospace;font-weight:700;color:${c}">${row.net>=0?"+":""}${fmtCurrency(row.net)}</td>
          <td style="text-align:right;font-family:'IBM Plex Mono',monospace;color:${c}">${margin}%</td>
        </tr>`;
      }).join("")}</tbody>
    </table>
  </div>`;

  generatePDF(
    `P&L Report — ${period}`,
    [plSection, deptSection, staffSection, expSection, projSection, ytdSection],
    `Financial Statement · ${period} · CONFIDENTIAL`
  );
}

/* ─── ALL PROJECTS COMBINED PDF ─── */
function buildAllProjectsPDF(projList, grandTotal, MONTHS_ARR, fmtCurrency, isAdmin, isAcct, periodLabel){
  const now=new Date().toLocaleDateString("en-GB",{day:"2-digit",month:"short",year:"numeric"});
  const TASK_COLORS=["#0ea5e9","#a78bfa","#34d399","#fb923c","#f87171","#e879f9","#facc15","#4ade80","#f472b6","#60a5fa"];
  const totalBillable=projList.reduce((s,pm)=>s+pm.billableHrs,0);
  const allEngs=new Set(projList.flatMap(pm=>Object.keys(pm.engineers)));

  // Build one HTML block per project
  function buildProjectBlock(pm, idx){
    const p=pm.proj;
    const pct=grandTotal?Math.round(pm.totalHrs/grandTotal*100):0;
    const billPct=pm.totalHrs?Math.round(pm.billableHrs/pm.totalHrs*100):0;
    const avgDay=pm.days?Math.round(pm.totalHrs/pm.days*10)/10:0;
    const tasksSorted=Object.entries(pm.tasks).sort((a,b)=>b[1].hrs-a[1].hrs);
    const engList=Object.values(pm.engineers).sort((a,b)=>b.hrs-a.hrs);
    const tcm={};let ci=0;
    tasksSorted.forEach(([t])=>{if(!tcm[t])tcm[t]=TASK_COLORS[ci++%TASK_COLORS.length];});

    const taskBars=tasksSorted.map(([task,data])=>{
      const tpct=pm.totalHrs?Math.round(data.hrs/pm.totalHrs*100):0;
      const col=tcm[task]||"#0ea5e9";
      return`<div style="margin-bottom:8px">
        <div style="display:flex;justify-content:space-between;margin-bottom:2px;font-size:10px">
          <div style="display:flex;align-items:center;gap:5px">
            <div style="width:7px;height:7px;border-radius:2px;background:${col};flex-shrink:0"></div>
            <span style="font-weight:600;color:#1e293b">${task}</span>
          </div>
          <div style="display:flex;gap:12px;font-family:'IBM Plex Mono',monospace">
            <span style="color:${col};font-weight:700">${data.hrs}h</span>
            <span style="color:#64748b">${tpct}%</span>
            <span style="color:#94a3b8">${data.engs} eng</span>
          </div>
        </div>
        <div style="background:#e2e8f0;height:5px;border-radius:3px;overflow:hidden">
          <div style="height:100%;width:${tpct}%;background:${col};border-radius:3px"></div>
        </div>
      </div>`;
    }).join("");

    const engRows=engList.map(eng=>{
      const epct=pm.totalHrs?Math.round(eng.hrs/pm.totalHrs*100):0;
      const top=Object.entries(eng.tasks).sort((a,b)=>b[1]-a[1])[0];
      return`<tr>
        <td style="font-weight:500">${eng.name}</td>
        <td style="text-align:right;font-family:'IBM Plex Mono',monospace;color:#0ea5e9;font-weight:700">${eng.hrs}h</td>
        <td style="text-align:right;font-family:'IBM Plex Mono',monospace">${epct}%</td>
        <td style="color:#64748b;font-size:9px">${top?top[0]+" ("+top[1]+"h)":"—"}</td>
      </tr>`;
    }).join("");

    const billBar=(isAdmin||isAcct)&&p.billable?`
      <div style="margin-top:10px;padding-top:8px;border-top:1px solid #e2e8f0">
        <div style="display:flex;justify-content:space-between;font-size:9px;margin-bottom:3px">
          <span style="color:#64748b">Billable coverage</span>
          <span style="font-family:'IBM Plex Mono',monospace;color:#10b981;font-weight:700">${billPct}%${p.rate_per_hour>0?" · "+fmtCurrency(pm.totalHrs*p.rate_per_hour):""}</span>
        </div>
        <div style="background:#e2e8f0;height:6px;border-radius:3px;overflow:hidden">
          <div style="height:100%;width:${billPct}%;background:linear-gradient(90deg,#34d399,#10b981);border-radius:3px"></div>
        </div>
      </div>`:"";

    return`
    <div style="page-break-before:${idx===0?"avoid":"always"};padding:28px 32px 0">
      <!-- Project header banner -->
      <div style="background:linear-gradient(135deg,#0a1628,#0f2a50);border-radius:10px;padding:18px 22px;margin-bottom:16px;display:flex;justify-content:space-between;align-items:flex-start">
        <div>
          <div style="font-family:'IBM Plex Mono',monospace;font-size:9px;letter-spacing:.2em;color:#38bdf8;margin-bottom:4px">${idx+1} OF ${projList.length} · ${p.id}</div>
          <div style="font-size:18px;font-weight:700;color:#f0f6ff;margin-bottom:3px">${p.name}</div>
          <div style="font-size:10px;color:#64748b">${p.client?"Client: "+p.client+" · ":""} Phase: ${p.phase||"—"} · ${p.type||"—"}</div>
        </div>
        <div style="text-align:right">
          <div style="font-family:'IBM Plex Mono',monospace;font-size:28px;font-weight:700;color:#38bdf8;line-height:1">${pm.totalHrs}h</div>
          <div style="font-size:9px;color:#64748b;margin-top:2px">${pct}% of total · ${pm.days} days</div>
          <div style="display:flex;gap:5px;margin-top:5px;justify-content:flex-end">
            <span style="font-size:8px;padding:2px 6px;border-radius:3px;background:${p.status==="Active"?"#024b36":"#1e3a5f"};color:${p.status==="Active"?"#34d399":"#60a5fa"}">${p.status||"Active"}</span>
            ${p.billable?`<span style="font-size:8px;padding:2px 6px;border-radius:3px;background:#0c2b4e;color:#38bdf8">BILLABLE</span>`:""}
          </div>
        </div>
      </div>

      <!-- KPI row -->
      <div style="display:grid;grid-template-columns:repeat(4,1fr);gap:8px;margin-bottom:14px">
        ${[
          {l:"Total Hours",v:pm.totalHrs+"h",c:"#0ea5e9"},
          {l:"Engineers",  v:Object.keys(pm.engineers).length,c:"#a78bfa"},
          {l:"Work Days",  v:pm.days,c:"#34d399"},
          {l:"Avg/Day",    v:avgDay+"h",c:"#fb923c"},
        ].map(k=>`<div style="background:#f0f7ff;border:1px solid #bfdbfe;border-radius:6px;padding:9px">
          <div style="font-family:'IBM Plex Mono',monospace;font-size:18px;font-weight:700;color:${k.c};line-height:1">${k.v}</div>
          <div style="font-size:8px;color:#64748b;text-transform:uppercase;letter-spacing:.06em;margin-top:3px">${k.l}</div>
        </div>`).join("")}
      </div>

      <!-- Two columns: task breakdown + engineer contribution -->
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:14px;margin-bottom:10px">
        <div>
          <div style="font-size:9px;font-weight:700;color:#0f2a50;text-transform:uppercase;letter-spacing:.08em;padding-bottom:5px;border-bottom:2px solid #0ea5e9;margin-bottom:8px">Task Breakdown (${tasksSorted.length} types)</div>
          ${taskBars||"<div style='color:#94a3b8;font-size:10px'>No task data</div>"}
        </div>
        <div>
          <div style="font-size:9px;font-weight:700;color:#0f2a50;text-transform:uppercase;letter-spacing:.08em;padding-bottom:5px;border-bottom:2px solid #a78bfa;margin-bottom:8px">Engineer Contributions</div>
          <table style="font-size:9px">
            <thead><tr>
              <th style="background:#0f2a50;color:#fff;padding:4px 6px">Engineer</th>
              <th style="background:#0f2a50;color:#fff;padding:4px 6px;text-align:right">Hours</th>
              <th style="background:#0f2a50;color:#fff;padding:4px 6px;text-align:right">%</th>
              <th style="background:#0f2a50;color:#fff;padding:4px 6px">Top Task</th>
            </tr></thead>
            <tbody>${engRows}</tbody>
          </table>
        </div>
      </div>
      ${billBar}
      <div style="border-top:1px solid #e2e8f0;margin-top:14px;padding-top:6px;font-size:8px;color:#94a3b8;display:flex;justify-content:space-between">
        <span>ENEVO Group · Project Tasks Analysis · ${periodLabel||"All Time"}</span>
        <span>Page ${idx+1} of ${projList.length}</span>
      </div>
    </div>`;
  }

  // Cover page summary table
  const summaryRows=projList.map((pm,i)=>{
    const pct=grandTotal?Math.round(pm.totalHrs/grandTotal*100):0;
    const billPct=pm.totalHrs?Math.round(pm.billableHrs/pm.totalHrs*100):0;
    return`<tr>
      <td style="font-family:'IBM Plex Mono',monospace;font-size:9px;color:#0ea5e9;font-weight:700">${pm.proj.id}</td>
      <td style="font-weight:500">${pm.proj.name}</td>
      <td style="text-align:right;font-family:'IBM Plex Mono',monospace;font-weight:700;color:#0ea5e9">${pm.totalHrs}h</td>
      <td style="text-align:right;font-family:'IBM Plex Mono',monospace">${pct}%</td>
      <td style="text-align:right;font-family:'IBM Plex Mono',monospace;color:#10b981">${billPct}%</td>
      <td style="text-align:right">${Object.keys(pm.engineers).length}</td>
      <td><span style="font-size:8px;padding:2px 5px;border-radius:3px;background:${pm.proj.status==="Active"?"#024b36":"#1e3a5f"};color:${pm.proj.status==="Active"?"#34d399":"#60a5fa"}">${pm.proj.status||"Active"}</span></td>
    </tr>`;
  }).join("");

  const coverHTML=`
  <div style="background:linear-gradient(135deg,#0a1628,#0f2a50 60%,#153d6e);color:#fff;padding:44px;min-height:100vh;position:relative;overflow:hidden;box-sizing:border-box">
    <div style="position:absolute;right:-60px;top:-60px;width:280px;height:280px;border:2px solid rgba(56,189,248,0.15);border-radius:50%"></div>
    <div style="display:flex;align-items:center;gap:14px;margin-bottom:28px">
      <img src="${LOGO_SRC}" alt="ENEVO Group" style="width:56px;height:56px;border-radius:10px;object-fit:contain;flex-shrink:0"/>
      <div>
        <div style="font-family:'IBM Plex Mono',monospace;font-size:9px;letter-spacing:.2em;color:#38bdf8;margin-bottom:4px">ENEVO GROUP · PROJECT TASKS ANALYSIS</div>
        <div style="font-size:11px;color:#94a3b8">Industrial & Renewable Energy Automation</div>
      </div>
    </div>
    <div style="font-size:28px;font-weight:700;margin-bottom:6px">All Projects Report</div>
    <div style="font-size:13px;color:#94a3b8;margin-bottom:24px">Period: ${periodLabel||"All Time"}</div>
    <div style="display:grid;grid-template-columns:repeat(4,1fr);gap:12px;margin-bottom:28px">
      ${[
        {l:"Total Hours",   v:grandTotal+"h",           c:"#38bdf8"},
        {l:"Projects",      v:projList.length,           c:"#a78bfa"},
        {l:"Billable Hours",v:totalBillable+"h",         c:"#34d399"},
        {l:"Engineers",     v:allEngs.size,              c:"#fb923c"},
      ].map(k=>`<div style="background:rgba(255,255,255,0.07);border:1px solid rgba(56,189,248,0.15);border-radius:8px;padding:14px">
        <div style="font-family:'IBM Plex Mono',monospace;font-size:24px;font-weight:700;color:${k.c};line-height:1">${k.v}</div>
        <div style="font-size:9px;color:#64748b;text-transform:uppercase;letter-spacing:.08em;margin-top:5px">${k.l}</div>
      </div>`).join("")}
    </div>
    <div style="font-size:10px;font-weight:700;color:#38bdf8;text-transform:uppercase;letter-spacing:.1em;margin-bottom:10px">Project Summary</div>
    <table style="font-size:10px">
      <thead><tr>
        <th style="color:#94a3b8;padding:5px 8px;border-bottom:1px solid rgba(255,255,255,0.1)">ID</th>
        <th style="color:#94a3b8;padding:5px 8px;border-bottom:1px solid rgba(255,255,255,0.1)">Project Name</th>
        <th style="color:#94a3b8;padding:5px 8px;border-bottom:1px solid rgba(255,255,255,0.1);text-align:right">Hours</th>
        <th style="color:#94a3b8;padding:5px 8px;border-bottom:1px solid rgba(255,255,255,0.1);text-align:right">Share</th>
        <th style="color:#94a3b8;padding:5px 8px;border-bottom:1px solid rgba(255,255,255,0.1);text-align:right">Billable%</th>
        <th style="color:#94a3b8;padding:5px 8px;border-bottom:1px solid rgba(255,255,255,0.1);text-align:right">Engs</th>
        <th style="color:#94a3b8;padding:5px 8px;border-bottom:1px solid rgba(255,255,255,0.1)">Status</th>
      </tr></thead>
      <tbody style="color:#e2e8f0">${summaryRows}</tbody>
    </table>
    <div style="position:absolute;bottom:24px;left:44px;right:44px;display:flex;justify-content:space-between;font-size:9px;color:#475569">
      <span>ENEVO Group · Industrial & Renewable Energy Automation</span>
      <span>CONFIDENTIAL — ${now}</span>
    </div>
  </div>`;

  const projectPages=projList.map((pm,i)=>buildProjectBlock(pm,i)).join("");

  const html=`<!DOCTYPE html><html><head><meta charset="utf-8">
    <title>All Projects Report — ${periodLabel||"All Time"}</title>
    <style>${PDF_STYLE}</style>
  </head><body>
    ${pdfHeader("Project Tasks Analysis · All Projects", periodLabel||"All Time", now)}
    ${pdfFooter("All Projects Report", now)}
    ${coverHTML}
    ${projectPages}
    <script>window.onload=()=>window.print()<\/script>
  </body></html>`;

  const win=window.open("","_blank");
  if(win){win.document.write(html);win.document.close();}
  else{alert("Please allow popups for this site to export PDFs.");}
}

/* ── ProjectTasksReport Component ── */
function ProjectTasksReport({allEntries,projects,engineers,MONTHS,fmtCurrency,fmtPct,isAdmin,isAcct}){
  const [selProj,setSelProj]=useState("ALL");
  // "ALL" means all-time, otherwise "YYYY-MM"
  const [filterMonth,setFilterMonth]=useState("ALL");

  const TASK_COLORS=["#38bdf8","#a78bfa","#34d399","#fb923c","#f87171","#e879f9","#facc15","#4ade80","#f472b6","#60a5fa"];
  const PROJ_COLORS=["#0ea5e9","#a78bfa","#34d399","#fb923c","#f87171","#e879f9","#facc15","#38bdf8"];

  // Derive available months from allEntries
  const availableMonths=useMemo(()=>{
    const s=new Set(allEntries.map(e=>e.date.slice(0,7)));
    return Array.from(s).sort().reverse(); // "2026-02", "2026-01", ...
  },[allEntries]);

  // Memoize so Sets are stable and don't cause render loops
  const {projList,taskColorMap,grandTotal}=useMemo(()=>{
    const filtered=filterMonth==="ALL"
      ? allEntries
      : allEntries.filter(e=>e.date.slice(0,7)===filterMonth);
    const ptEntries=filtered.filter(e=>e.entry_type==="work");
    const projMap={};
    ptEntries.forEach(e=>{
      const p=projects.find(x=>x.id===e.project_id);
      if(!p) return;
      if(!projMap[p.id]) projMap[p.id]={proj:p,totalHrs:0,billableHrs:0,tasks:{},engineers:{},daySet:new Set()};
      const pm=projMap[p.id];
      pm.totalHrs+=e.hours;
      if(p.billable) pm.billableHrs+=e.hours;
      pm.daySet.add(e.date);
      const tk=e.task_category||e.task_type||"Other";
      const tkDetail=e.task_type||"Other";
      if(!pm.tasks[tk]) pm.tasks[tk]={hrs:0,engSet:new Set(),details:{}};
      pm.tasks[tk].hrs+=e.hours;
      pm.tasks[tk].engSet.add(e.engineer_id);
      pm.tasks[tk].details[tkDetail]=(pm.tasks[tk].details[tkDetail]||0)+e.hours;
      const eid=e.engineer_id;
      const eng=engineers.find(x=>x.id===eid);
      if(!pm.engineers[eid]) pm.engineers[eid]={name:eng?.name||"Unknown",hrs:0,tasks:{}};
      pm.engineers[eid].hrs+=e.hours;
      pm.engineers[eid].tasks[tk]=(pm.engineers[eid].tasks[tk]||0)+e.hours;
    });
    // Convert Sets to plain numbers for safe rendering
    Object.values(projMap).forEach(pm=>{
      pm.days=pm.daySet.size;
      delete pm.daySet;
      Object.values(pm.tasks).forEach(t=>{t.engs=t.engSet.size; delete t.engSet;});
    });
    const list=Object.values(projMap).sort((a,b)=>b.totalHrs-a.totalHrs);
    const tcm={};let ci=0;
    list.forEach(pm=>Object.keys(pm.tasks).forEach(t=>{if(!tcm[t])tcm[t]=TASK_COLORS[ci++%TASK_COLORS.length];}));
    const total=list.reduce((s,p)=>s+p.totalHrs,0);
    return{projList:list,taskColorMap:tcm,grandTotal:total};
  },[allEntries,filterMonth,projects,engineers]);

  const displayList=selProj==="ALL"?projList:projList.filter(x=>x.proj.id===selProj);

  return(
    <div>
      {/* Header */}
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-end",marginBottom:16}}>
        <div>
          <h2 style={{fontSize:18,fontWeight:700,color:"#f0f6ff",margin:0}}>◈ Project Tasks Analysis</h2>
          <p style={{fontSize:12,color:"#2e4a66",marginTop:4}}>
            {filterMonth==="ALL"?"All Time":filterMonth} · {projList.length} projects · {grandTotal}h total
          </p>
        </div>
        <div style={{display:"flex",gap:8,alignItems:"center",flexWrap:"wrap",justifyContent:"flex-end"}}>
          {/* Month filter */}
          <select value={filterMonth} onChange={e=>{setFilterMonth(e.target.value);setSelProj("ALL");}}
            style={{background:"#0b1526",border:"1px solid #38bdf840",borderRadius:6,padding:"6px 10px",color:"#38bdf8",fontSize:12,fontFamily:"'IBM Plex Sans',sans-serif",fontWeight:600}}>
            <option value="ALL">📅 All Time</option>
            {availableMonths.map(m=>{
              const [y,mo]=m.split("-");
              return <option key={m} value={m}>{MONTHS[parseInt(mo)-1]} {y}</option>;
            })}
          </select>
          {/* Project filter */}
          <select value={selProj} onChange={e=>setSelProj(e.target.value)}
            style={{background:"#0b1526",border:"1px solid #192d47",borderRadius:6,padding:"6px 10px",color:"#f0f6ff",fontSize:12,fontFamily:"'IBM Plex Sans',sans-serif"}}>
            <option value="ALL">All Projects</option>
            {projList.map(x=><option key={x.proj.id} value={x.proj.id}>{x.proj.id} — {x.proj.name} ({x.totalHrs}h)</option>)}
          </select>
          {/* Export buttons */}
          {selProj==="ALL"
            ? <button className="bp" style={{whiteSpace:"nowrap"}} onClick={()=>{
                const label=filterMonth==="ALL"?"All Time":filterMonth;
                buildAllProjectsPDF(displayList,grandTotal,MONTHS,fmtCurrency,isAdmin,isAcct,label);
              }}>
                ⬇ Export All ({projList.length})
              </button>
            : <button className="bp" onClick={()=>{
                const label=filterMonth==="ALL"?"All Time":filterMonth;
                const [fy,fm]=filterMonth!=="ALL"?filterMonth.split("-").map(Number):[null,null];
                const pm=displayList[0];
                if(pm) buildProjectTasksPDF(pm,grandTotal,fm?fm-1:null,fy,MONTHS,fmtCurrency,isAdmin,isAcct,label);
              }}>
                ⬇ Export PDF
              </button>
          }
        </div>
      </div>

      {projList.length===0&&<div className="card" style={{textAlign:"center",padding:40,color:"#253a52"}}>No hours logged for {MONTHS[month]} {year}. Import timesheets first.</div>}

      {/* KPI strip */}
      {projList.length>0&&(
        <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:10,marginBottom:18}}>
          {[
            {l:"Total Hours",     v:grandTotal+"h",                                          c:"#f0f6ff"},
            {l:"Active Projects", v:projList.length,                                         c:"#38bdf8"},
            {l:"Billable Hours",  v:projList.reduce((s,p)=>s+p.billableHrs,0)+"h",          c:"#34d399"},
            {l:"Unique Tasks",    v:Object.keys(taskColorMap).length,                        c:"#a78bfa"},
          ].map((m,i)=>(
            <div key={i} className="metric">
              <div style={{fontSize:9,color:"#2e4a66",fontWeight:700,textTransform:"uppercase",letterSpacing:".06em"}}>{m.l}</div>
              <div style={{fontFamily:"'IBM Plex Mono',monospace",fontSize:22,fontWeight:700,color:m.c,marginTop:8,lineHeight:1}}>{m.v}</div>
            </div>
          ))}
        </div>
      )}

      {/* Stacked hours bar */}
      {projList.length>1&&selProj==="ALL"&&(
        <div className="card" style={{marginBottom:14}}>
          <h3 style={{fontSize:12,fontWeight:600,color:"#7a8faa",marginBottom:12}}>Hours Distribution Across Projects</h3>
          <div style={{display:"flex",height:28,borderRadius:6,overflow:"hidden",marginBottom:10}}>
            {projList.map((pm,i)=>{
              const pct=grandTotal?pm.totalHrs/grandTotal*100:0;
              return pct>0&&<div key={pm.proj.id} title={`${pm.proj.id}: ${pm.totalHrs}h (${Math.round(pct)}%)`}
                style={{width:`${pct}%`,background:PROJ_COLORS[i%PROJ_COLORS.length],display:"flex",alignItems:"center",justifyContent:"center",fontSize:9,fontWeight:700,color:"#fff",overflow:"hidden",whiteSpace:"nowrap",padding:"0 4px"}}>
                {pct>4?pm.proj.id:""}
              </div>;
            })}
          </div>
          <div style={{display:"flex",flexWrap:"wrap",gap:8}}>
            {projList.map((pm,i)=>{
              const pct=grandTotal?Math.round(pm.totalHrs/grandTotal*100):0;
              return<div key={pm.proj.id} style={{display:"flex",alignItems:"center",gap:5,fontSize:10}}>
                <div style={{width:8,height:8,borderRadius:2,background:PROJ_COLORS[i%PROJ_COLORS.length],flexShrink:0}}/>
                <span style={{color:"#7a8faa"}}>{pm.proj.id}</span>
                <span style={{fontFamily:"'IBM Plex Mono',monospace",color:"#f0f6ff",fontWeight:600}}>{pm.totalHrs}h</span>
                <span style={{color:"#253a52"}}>({pct}%)</span>
              </div>;
            })}
          </div>
        </div>
      )}

      {/* Per-project cards */}
      {displayList.map(pm=>{
        const pct=grandTotal?Math.round(pm.totalHrs/grandTotal*100):100;
        const billPct=pm.totalHrs?Math.round(pm.billableHrs/pm.totalHrs*100):0;
        const tasksSorted=Object.entries(pm.tasks).sort((a,b)=>b[1].hrs-a[1].hrs);
        const engList=Object.values(pm.engineers).sort((a,b)=>b.hrs-a.hrs);
        return(
          <div key={pm.proj.id} className="card" style={{marginBottom:14,borderLeft:`3px solid ${pm.proj.type==="Renewable Energy"?"#34d399":"#818cf8"}`}}>
            {/* Project header */}
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:14}}>
              <div>
                <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:4}}>
                  <span style={{fontFamily:"'IBM Plex Mono',monospace",fontSize:11,color:"#38bdf8",fontWeight:700}}>{pm.proj.id}</span>
                  <span style={{fontSize:9,padding:"2px 6px",borderRadius:3,background:pm.proj.status==="Active"?"#024b36":"#192d47",color:pm.proj.status==="Active"?"#34d399":"#7a8faa"}}>{pm.proj.status}</span>
                  {pm.proj.billable&&<span style={{fontSize:9,padding:"2px 6px",borderRadius:3,background:"#0c2b4e",color:"#38bdf8"}}>BILLABLE</span>}
                </div>
                <div style={{fontSize:15,fontWeight:700,color:"#f0f6ff"}}>{pm.proj.name}</div>
                {pm.proj.client&&<div style={{fontSize:11,color:"#2e4a66",marginTop:2}}>Client: {pm.proj.client} · Phase: {pm.proj.phase||"—"}</div>}
              </div>
              <div style={{textAlign:"right",display:"flex",flexDirection:"column",alignItems:"flex-end",gap:6}}>
                <button className="bp" style={{fontSize:10,padding:"5px 10px"}}
                  onClick={()=>{const label=filterMonth==="ALL"?"All Time":filterMonth;const [fy,fm]=filterMonth!=="ALL"?filterMonth.split("-").map(Number):[null,null];buildProjectTasksPDF(pm,grandTotal,fm?fm-1:null,fy,MONTHS,fmtCurrency,isAdmin,isAcct,label);}}>
                  ⬇ PDF
                </button>
                <div style={{fontFamily:"'IBM Plex Mono',monospace",fontSize:26,fontWeight:700,color:"#38bdf8",lineHeight:1}}>{pm.totalHrs}h</div>
                <div style={{fontSize:10,color:"#253a52"}}>{pct}% of month total</div>
                {(isAdmin||isAcct)&&pm.proj.billable&&pm.proj.rate_per_hour>0&&<div style={{fontSize:11,color:"#a78bfa",fontFamily:"'IBM Plex Mono',monospace"}}>{fmtCurrency(pm.totalHrs*pm.proj.rate_per_hour)}</div>}
              </div>
            </div>

            {/* Stats row */}
            <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:8,marginBottom:14}}>
              {[
                {l:"Engineers", v:Object.keys(pm.engineers).length, c:"#38bdf8"},
                {l:"Task Types",v:tasksSorted.length,               c:"#a78bfa"},
                {l:"Work Days", v:pm.days,                     c:"#34d399"},
                {l:"Avg/Day",   v:pm.days?Math.round(pm.totalHrs/pm.days*10)/10+"h":"—", c:"#fb923c"},
              ].map((s,i)=>(
                <div key={i} style={{background:"#060e1c",borderRadius:6,padding:"8px 10px"}}>
                  <div style={{fontSize:9,color:"#253a52",fontWeight:700,textTransform:"uppercase",letterSpacing:".05em"}}>{s.l}</div>
                  <div style={{fontFamily:"'IBM Plex Mono',monospace",fontSize:16,fontWeight:700,color:s.c,marginTop:4}}>{s.v}</div>
                </div>
              ))}
            </div>

            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12}}>
              {/* Task breakdown */}
              <div>
                <div style={{fontSize:10,fontWeight:700,color:"#4e6479",textTransform:"uppercase",letterSpacing:".06em",marginBottom:8}}>Task Breakdown</div>
                {tasksSorted.map(([task,data])=>{
                  const tpct=pm.totalHrs?Math.round(data.hrs/pm.totalHrs*100):0;
                  const col=taskColorMap[task]||"#38bdf8";
                  return(
                    <div key={task} style={{marginBottom:7}}>
                      <div style={{display:"flex",justifyContent:"space-between",marginBottom:2}}>
                        <div style={{display:"flex",alignItems:"center",gap:5}}>
                          <div style={{width:6,height:6,borderRadius:1,background:col,flexShrink:0}}/>
                          <span style={{fontSize:11,color:"#dde3ef"}}>{task}</span>
                        </div>
                        <div style={{display:"flex",gap:10,fontSize:10}}>
                          <span style={{fontFamily:"'IBM Plex Mono',monospace",color:col,fontWeight:700}}>{data.hrs}h</span>
                          <span style={{color:"#253a52"}}>{tpct}%</span>
                          <span style={{color:"#4e6479"}}>{data.engs.size} eng</span>
                        </div>
                      </div>
                      <div style={{background:"#060e1c",height:5,borderRadius:3,overflow:"hidden"}}>
                        <div style={{height:"100%",width:`${tpct}%`,background:col,borderRadius:3,opacity:0.85}}/>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Engineer contribution */}
              <div>
                <div style={{fontSize:10,fontWeight:700,color:"#4e6479",textTransform:"uppercase",letterSpacing:".06em",marginBottom:8}}>Engineer Contribution</div>
                {engList.map(eng=>{
                  const epct=pm.totalHrs?Math.round(eng.hrs/pm.totalHrs*100):0;
                  const topEngTask=Object.entries(eng.tasks).sort((a,b)=>b[1]-a[1])[0];
                  return(
                    <div key={eng.name} style={{marginBottom:7}}>
                      <div style={{display:"flex",justifyContent:"space-between",marginBottom:2}}>
                        <div style={{display:"flex",alignItems:"center",gap:6}}>
                          <div className="av" style={{width:20,height:20,fontSize:8,flexShrink:0}}>{eng.name.slice(0,2).toUpperCase()}</div>
                          <span style={{fontSize:11,color:"#dde3ef"}}>{eng.name}</span>
                        </div>
                        <div style={{display:"flex",gap:10,fontSize:10}}>
                          <span style={{fontFamily:"'IBM Plex Mono',monospace",color:"#38bdf8",fontWeight:700}}>{eng.hrs}h</span>
                          <span style={{color:"#253a52"}}>{epct}%</span>
                        </div>
                      </div>
                      <div style={{background:"#060e1c",height:5,borderRadius:3,overflow:"hidden"}}>
                        <div style={{height:"100%",width:`${epct}%`,background:"linear-gradient(90deg,#0ea5e9,#38bdf8)",borderRadius:3}}/>
                      </div>
                      {topEngTask&&<div style={{fontSize:9,color:"#2e4a66",marginTop:1}}>Top: {topEngTask[0]} ({topEngTask[1]}h)</div>}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Billability bar */}
            {pm.proj.billable&&(
              <div style={{marginTop:12,paddingTop:10,borderTop:"1px solid #0d1a2d"}}>
                <div style={{display:"flex",justifyContent:"space-between",marginBottom:4,fontSize:10}}>
                  <span style={{color:"#4e6479"}}>Billable coverage</span>
                  <span style={{fontFamily:"'IBM Plex Mono',monospace",color:"#34d399",fontWeight:700}}>{billPct}%</span>
                </div>
                <div style={{background:"#060e1c",height:6,borderRadius:3,overflow:"hidden"}}>
                  <div style={{height:"100%",width:`${billPct}%`,background:"linear-gradient(90deg,#34d399,#10b981)",borderRadius:3}}/>
                </div>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

/* ── VacationReport Component ── */
function VacationReport({engineers,leaveEntries,allEntries,month,year,MONTHS,onExport}){
  const leaveTypes=["Annual Leave","Sick Leave","Public Holiday","Business Travel","Training External","Unpaid Leave"];
  const typeColors={"Annual Leave":"#38bdf8","Sick Leave":"#f87171","Public Holiday":"#fb923c","Business Travel":"#a78bfa","Training External":"#34d399","Unpaid Leave":"#6b7280"};

  // Monthly breakdown
  const monthly=engineers.map(eng=>{
    const el=leaveEntries.filter(e=>String(e.engineer_id)===String(eng.id));
    const byType={};
    el.forEach(e=>{const lt=e.leave_type||"Annual Leave";byType[lt]=(byType[lt]||0)+1;});
    return{...eng,total:el.length,byType,days:el.sort((a,b)=>a.date.localeCompare(b.date))};
  }).filter(e=>e.total>0);

  // Year-to-date
  const ytd=engineers.map(eng=>{
    const el=allEntries.filter(e=>String(e.engineer_id)===String(eng.id)&&e.entry_type==="leave"&&new Date(e.date).getFullYear()===year);
    const byType={};
    el.forEach(e=>{const lt=e.leave_type||"Annual Leave";byType[lt]=(byType[lt]||0)+1;});
    return{...eng,total:el.length,byType};
  }).filter(e=>e.total>0);

  return(
    <div>
      {/* Header */}
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:18}}>
        <div>
          <h2 style={{fontSize:18,fontWeight:700,color:"#f0f6ff",margin:0}}>✈ Vacation & Leave Report</h2>
          <p style={{fontSize:12,color:"#2e4a66",marginTop:4}}>{MONTHS[month]} {year} · {monthly.length} engineers with leave recorded</p>
        </div>
        <button style={{background:"#0ea5e9",border:"none",borderRadius:6,padding:"8px 16px",color:"#fff",fontSize:12,fontWeight:600,cursor:"pointer",fontFamily:"'IBM Plex Sans',sans-serif"}} onClick={onExport}>⬇ Export PDF</button>
      </div>

      {/* Leave type legend */}
      <div style={{display:"flex",gap:8,flexWrap:"wrap",marginBottom:16}}>
        {leaveTypes.map(lt=>(
          <span key={lt} style={{fontSize:10,padding:"3px 10px",borderRadius:12,border:`1px solid ${typeColors[lt]}50`,color:typeColors[lt],fontWeight:600,background:typeColors[lt]+"15"}}>{lt}</span>
        ))}
      </div>

      {/* Monthly summary */}
      <div className="card" style={{marginBottom:14,overflowX:"auto"}}>
        <h4 style={{fontSize:12,fontWeight:600,color:"#7a8faa",marginBottom:12}}>📅 {MONTHS[month]} {year} — Monthly Summary</h4>
        {monthly.length===0
          ? <p style={{color:"#253a52",fontSize:12,textAlign:"center",padding:20}}>No leave recorded for {MONTHS[month]} {year}. Import timesheets first.</p>
          : <table style={{minWidth:600}}>
              <thead><tr>
                <th style={{textAlign:"left"}}>Engineer</th>
                {leaveTypes.map(lt=><th key={lt} style={{textAlign:"center",color:typeColors[lt],fontSize:10,minWidth:60}}>{lt}</th>)}
                <th style={{textAlign:"center"}}>Total</th>
              </tr></thead>
              <tbody>{monthly.map(eng=>(
                <tr key={eng.id}>
                  <td>
                    <div style={{display:"flex",alignItems:"center",gap:8}}>
                      <div style={{width:28,height:28,borderRadius:"50%",background:"#0d1e34",display:"flex",alignItems:"center",justifyContent:"center",fontSize:9,fontWeight:700,color:"#38bdf8",flexShrink:0}}>{(eng.name||"?").slice(0,2).toUpperCase()}</div>
                      <div>
                        <div style={{fontSize:12,fontWeight:600}}>{eng.name}</div>
                        <div style={{fontSize:10,color:"#2e4a66"}}>{eng.role}</div>
                      </div>
                    </div>
                  </td>
                  {leaveTypes.map(lt=>(
                    <td key={lt} style={{textAlign:"center",fontFamily:"'IBM Plex Mono',monospace",color:eng.byType[lt]?typeColors[lt]:"#253a52",fontWeight:eng.byType[lt]?700:400}}>
                      {eng.byType[lt]||"—"}
                    </td>
                  ))}
                  <td style={{textAlign:"center",fontFamily:"'IBM Plex Mono',monospace",fontWeight:700,color:"#f0f6ff"}}>{eng.total}d</td>
                </tr>
              ))}</tbody>
            </table>
        }
      </div>

      {/* YTD summary */}
      <div className="card" style={{marginBottom:14,overflowX:"auto"}}>
        <h4 style={{fontSize:12,fontWeight:600,color:"#7a8faa",marginBottom:12}}>📊 Year-to-Date {year} — All Leave</h4>
        {ytd.length===0
          ? <p style={{color:"#253a52",fontSize:12,textAlign:"center",padding:20}}>No leave recorded for {year}.</p>
          : <table style={{minWidth:600}}>
              <thead><tr>
                <th style={{textAlign:"left"}}>Engineer</th>
                {leaveTypes.map(lt=><th key={lt} style={{textAlign:"center",color:typeColors[lt],fontSize:10,minWidth:60}}>{lt}</th>)}
                <th style={{textAlign:"center"}}>YTD Total</th>
              </tr></thead>
              <tbody>{ytd.map(eng=>(
                <tr key={eng.id}>
                  <td style={{fontSize:12,fontWeight:600}}>{eng.name}</td>
                  {leaveTypes.map(lt=>(
                    <td key={lt} style={{textAlign:"center",fontFamily:"'IBM Plex Mono',monospace",color:eng.byType[lt]?typeColors[lt]:"#253a52",fontWeight:eng.byType[lt]?700:400}}>
                      {eng.byType[lt]||"—"}
                    </td>
                  ))}
                  <td style={{textAlign:"center",fontFamily:"'IBM Plex Mono',monospace",fontWeight:700,color:"#f0f6ff"}}>{eng.total}d</td>
                </tr>
              ))}</tbody>
            </table>
        }
      </div>

      {/* Per-engineer day detail */}
      {monthly.length>0&&<div>
        <h4 style={{fontSize:12,fontWeight:600,color:"#7a8faa",marginBottom:10}}>📋 Detail — Leave Days {MONTHS[month]} {year}</h4>
        {monthly.map(eng=>(
          <div key={eng.id} className="card" style={{marginBottom:8}}>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:8}}>
              <div style={{display:"flex",alignItems:"center",gap:10}}>
                <div style={{width:32,height:32,borderRadius:"50%",background:"#0d1e34",display:"flex",alignItems:"center",justifyContent:"center",fontSize:10,fontWeight:700,color:"#38bdf8"}}>{(eng.name||"?").slice(0,2).toUpperCase()}</div>
                <div>
                  <div style={{fontSize:13,fontWeight:600}}>{eng.name}</div>
                  <div style={{fontSize:10,color:"#2e4a66"}}>{eng.total} day{eng.total!==1?"s":""} of leave</div>
                </div>
              </div>
              <div style={{display:"flex",gap:6,flexWrap:"wrap",justifyContent:"flex-end"}}>
                {Object.entries(eng.byType).map(([lt,n])=>(
                  <span key={lt} style={{fontSize:10,padding:"2px 8px",borderRadius:3,background:typeColors[lt]+"25",color:typeColors[lt],fontWeight:600}}>{lt}: {n}d</span>
                ))}
              </div>
            </div>
            <div style={{display:"flex",flexWrap:"wrap",gap:5}}>
              {eng.days.map(e=>(
                <span key={e.id} style={{fontSize:10,padding:"3px 9px",borderRadius:4,background:"#060e1c",border:`1px solid ${typeColors[e.leave_type||"Annual Leave"]}40`,color:typeColors[e.leave_type||"Annual Leave"],fontFamily:"'IBM Plex Mono',monospace"}}>
                  {e.date}
                </span>
              ))}
            </div>
          </div>
        ))}
      </div>}
    </div>
  );
}



/* ════════════════════════════════════════════════════════
   PROJECT ACTIVITY TAXONOMY
   ════════════════════════════════════════════════════════ */
const ACTIVITY_TAXONOMY = {
  /* ── SCADA ── */
  "Templates": [
    "Block Template","Turbine Template","ESS Template",
    "Inverter MA Template","Inverter MB Template","Inverter ME Template",
    "Network Analyzer Template","PACK Template",
    "Circuit Breaker Template","Circuit Breaker With Command Template",
    "110 kV Template","20 kV Template","33 kV Template",
    "PTs Template","Weather Station Template","Other Template",
  ],
  "Database": [
    "Common Station Database","Block Database","Turbine Database",
    "BESS Database","Inverter MA Database","Inverter MB Database","Inverter ME Database",
    "Network Analyzer Database","PACK Database",
    "Circuit Breaker Database","Circuit Breaker With Command Database",
    "110 kV Database","20 kV Database","33 kV Database",
    "PTs Database","Weather Station Database","Internal Services Database","Other Database",
  ],
  "Displays": [
    "General Overview Display","Control Display","SLD Display",
    "Alarms Display","Trend Display","List Display",
    "110 kV Display","20 kV Display","33 kV Display","0.4 kV Display","220 Vcc Display",
    "BESS Display","Dashboard Display","Joint Control Display",
    "Hydroaggregate Display","Sequence Control Display","VIR Display",
    "Oil System Display","Water Cooling Display","Other Display",
  ],
  "Reports": [
    "Operational Reports","Event Reports","Energy Reports",
    "Performance Reports","Custom Reports","Other Reports",
  ],
  "Dashboard": [
    "SCADA Dashboard","Local App Dashboard","Dispatch Dashboard","Custom Dashboard",
  ],
  "GIS": [
    "GIS Layer Configuration","GIS Substation Layout","GIS Line Routing",
    "GIS Asset Tagging","GIS Network Topology","GIS Feeder Diagram",
    "GIS Integration with SCADA","GIS Background Map Setup",
    "GIS Coordinate System Setup","GIS Export / Report","Other GIS",
  ],
  "Symbols": [
    "Circuit Breaker Symbol","Disconnector Symbol","Earth Switch Symbol",
    "Transformer Symbol","Busbar Symbol","Cable / Line Symbol",
    "Inverter Symbol","Generator Symbol","BESS Symbol",
    "Weather Station Symbol","Measurement Symbol","Protection Relay Symbol",
    "PLC / RTU Symbol","Motor Symbol","Pump Symbol","Valve Symbol",
    "Capacitor Bank Symbol","Surge Arrester Symbol",
    "110 kV Equipment Symbol","33 kV Equipment Symbol","20 kV Equipment Symbol","0.4 kV Equipment Symbol",
    "Animated Status Symbol","Alarm Indicator Symbol","Custom Symbol","Other Symbol",
  ],
  /* ── RTU-PLC ── */
  "RTU Configuration": [
    "Hardware Configuration","Communication Configuration",
    "Application & Protocol Configuration","RTU Settings",
    "DI/DO Signals","Modbus Signals","DNP3 Signals",
    "IEC-61850 Data Import","Logics (CFC Editor)","Signal List Creation","Other RTU",
  ],
  "PLC Programming": [
    "PLC Hardware Setup","PLC I/O Configuration","PLC Network Configuration",
    "Ladder Logic Programming","Function Block Diagram (FBD)","Structured Text (ST)",
    "Sequential Function Chart (SFC)","Instruction List (IL)",
    "PLC Analog Signal Scaling","PLC Digital I/O Mapping",
    "PLC Communication (Modbus TCP)","PLC Communication (Profibus)","PLC Communication (Profinet)",
    "PLC Communication (EtherNet/IP)","PLC Communication (IEC-61850)",
    "HMI Integration","PLC Alarm Configuration","PLC Data Logging",
    "PLC Control Logic — Inverter","PLC Control Logic — Transformer",
    "PLC Control Logic — Generator","PLC Control Logic — Feeder",
    "PLC Control Logic — BESS","PLC Control Logic — Weather Station",
    "PLC Interlock Logic","PLC Sequence Logic","PLC FAT Testing","PLC SAT Testing",
    "PLC Factory Acceptance Test","PLC Site Acceptance Test",
    "PLC Backup & Version Control","Other PLC",
  ],
  "PPC": [
    "PPC Integration","IOA Configuration","Outstation Configuration",
    "PPC Testing","PPC Documentation","Other PPC",
  ],
  "Commissioning": [
    "FAT Preparation","FAT Execution","SAT Preparation","SAT Execution",
    "Site Support","Remote Commissioning","Loop Check","Punch List Resolution","Other Commissioning",
  ],
  /* ── Protection ── */
  "Protection Relays": [
    "Siemens 7SJ82 Configuration","Siemens 7SJ82 IEC 61850 SCD",
    "Siemens 7SJ82 Protection Functions","Siemens 7SJ82 Protection Settings",
    "ABB REX615 Configuration","ABB REX615 IEC 61850 SCD",
    "ABB REX615 Protection Functions","ABB REX615 Protection Settings",
    "Schneider Sepam Configuration","Schneider Sepam Settings",
    "GE Multilin Configuration","GE Multilin Settings",
    "Protection Coordination Study","Protection Settings Verification",
    "Distance Protection","Differential Protection","Overcurrent Protection",
    "Earth Fault Protection","Busbar Protection",
    "Schematic Revision","IEC 61850 SCD Engineering","Other Protection",
  ],
  "Protection Testing": [
    "Relay Test Plan Preparation","Primary Injection Testing","Secondary Injection Testing",
    "End-to-End Testing","Trip Circuit Verification","Protection Commissioning",
    "COMTRADE Analysis","Other Protection Testing",
  ],
  /* ── General ── */
  "Documentation": [
    "TQ Register","Operating Manual","As-Built Documentation",
    "Test Procedures","Project Handover","Lessons Learned","Other Documentation",
  ],
  "Project Management": [
    "Kick-off Meeting","Progress Meeting","Client Communication",
    "Schedule Update","Risk Register","Change Order Management",
    "Subcontractor Coordination","Other PM",
  ],
};
const TAXONOMY_CATS = Object.keys(ACTIVITY_TAXONOMY);

/* ── Category Groups ── */
const TAXONOMY_GROUPS = {
  "SCADA":      ["Templates","Database","Displays","Reports","Dashboard","GIS","Symbols"],
  "RTU-PLC":    ["RTU Configuration","PLC Programming","PPC","Commissioning"],
  "Protection": ["Protection Relays","Protection Testing"],
  "General":    ["Documentation","Project Management"],
};
const TAXONOMY_GROUP_NAMES = Object.keys(TAXONOMY_GROUPS);
/* TASK_CATEGORIES = alias for TAXONOMY_GROUPS (used in Post Hours & reports) */
const TASK_CATEGORIES = TAXONOMY_GROUPS;
const TASK_TYPES = ACTIVITY_TAXONOMY;
const CAT_TO_GROUP = {};
Object.entries(TAXONOMY_GROUPS).forEach(([g,cats])=>cats.forEach(c=>{CAT_TO_GROUP[c]=g;}));

/* ════════════════════════════════════════════════════════
   PROJECT TRACKER — standalone component (no IIFE, no re-render loops)
   ════════════════════════════════════════════════════════ */
const STATUS_COLOR={"Completed":"#34d399","In Progress":"#38bdf8","Not Started":"#4e6479","On Hold":"#fb923c"};
const STATUS_BG={"Completed":"#002414","In Progress":"#001a2c","Not Started":"#0a0f18","On Hold":"#1c0f00"};

/* ── Inline category/activity editor modal ── */
function ActivityEditModal({act, onSave, onClose, engineers}){
  const initGroup = CAT_TO_GROUP[act.category]||TAXONOMY_GROUP_NAMES[0];
  const [draft, setDraft] = useState({...act});
  const [group, setGroup] = useState(initGroup);
  const catActs = ACTIVITY_TAXONOMY[draft.category]||[];
  const INP = {width:"100%",background:"#060e1c",border:"1px solid #192d47",borderRadius:4,color:"#f0f6ff",padding:"6px 8px",fontSize:11,boxSizing:"border-box"};
  const LBL = {fontSize:10,color:"#7a8faa",fontWeight:600,display:"block",marginBottom:4};
  const GROUP_COLORS = {"SCADA":"#38bdf8","RTU-PLC":"#a78bfa","Protection":"#f87171","General":"#34d399"};

  const handleGroupChange = g => {
    setGroup(g);
    const firstCat = TAXONOMY_GROUPS[g][0];
    setDraft(p=>({...p, category:firstCat, activity_name:ACTIVITY_TAXONOMY[firstCat]?.[0]||p.activity_name}));
  };

  return(
  <div className="modal-ov" onClick={onClose}>
    <div className="modal" style={{maxWidth:500}} onClick={e=>e.stopPropagation()}>
      <h3 style={{fontSize:13,fontWeight:700,color:"#f0f6ff",marginBottom:14}}>Edit Activity</h3>
      <div style={{display:"grid",gap:10}}>

        {/* Group */}
        <div>
          <label style={LBL}>GROUP</label>
          <div style={{display:"flex",gap:6}}>
            {TAXONOMY_GROUP_NAMES.map(g=>(
              <button key={g} onClick={()=>handleGroupChange(g)}
                style={{flex:1,padding:"6px 8px",borderRadius:6,border:`1px solid ${group===g?(GROUP_COLORS[g]||"#38bdf8")+"60":"#192d47"}`,
                  background:group===g?(GROUP_COLORS[g]||"#38bdf8")+"15":"#060e1c",
                  color:group===g?(GROUP_COLORS[g]||"#38bdf8"):"#4e6479",
                  fontSize:11,fontWeight:700,cursor:"pointer",transition:"all .15s"}}>
                {g}
              </button>
            ))}
          </div>
        </div>

        {/* Category */}
        <div>
          <label style={LBL}>CATEGORY</label>
          <select value={draft.category||""} onChange={e=>setDraft(p=>({...p,category:e.target.value,activity_name:ACTIVITY_TAXONOMY[e.target.value]?.[0]||p.activity_name}))}
            style={INP}>
            {(TAXONOMY_GROUPS[group]||TAXONOMY_CATS).map(c=><option key={c}>{c}</option>)}
          </select>
        </div>

        {/* Activity name */}
        <div>
          <label style={LBL}>ACTIVITY NAME</label>
          {catActs.length>0?(
            <select value={draft.activity_name||""} onChange={e=>setDraft(p=>({...p,activity_name:e.target.value}))} style={INP}>
              {catActs.map(a=><option key={a}>{a}</option>)}
              <option value="Custom…">Custom…</option>
            </select>
          ):(
            <input value={draft.activity_name||""} onChange={e=>setDraft(p=>({...p,activity_name:e.target.value}))} style={INP}/>
          )}
          {draft.activity_name==="Custom…"&&(
            <input placeholder="Type custom activity name…" onChange={e=>setDraft(p=>({...p,activity_name:e.target.value}))}
              style={{...INP,marginTop:6,border:"1px solid #38bdf8"}}/>
          )}
        </div>

        {/* Status + Progress */}
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}>
          <div>
            <label style={LBL}>STATUS</label>
            <select value={draft.status||"Not Started"} onChange={e=>setDraft(p=>({...p,status:e.target.value}))} style={INP}>
              {["Not Started","In Progress","Completed","On Hold"].map(s=><option key={s}>{s}</option>)}
            </select>
          </div>
          <div>
            <label style={LBL}>PROGRESS %</label>
            <input type="number" min="0" max="100" step="5" value={Math.round((draft.progress||0)*100)}
              onChange={e=>setDraft(p=>({...p,progress:Math.min(1,Math.max(0,+e.target.value/100))}))}
              style={{...INP,color:"#38bdf8",fontFamily:"'IBM Plex Mono',monospace"}}/>
          </div>
        </div>

        {/* Dates */}
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}>
          <div>
            <label style={LBL}>START DATE</label>
            <input type="date" value={draft.start_date||""} onChange={e=>setDraft(p=>({...p,start_date:e.target.value||null}))}
              style={{...INP,colorScheme:"dark"}}/>
          </div>
          <div>
            <label style={LBL}>END DATE <span style={{color:"#4e6479",fontWeight:400}}>(deadline)</span></label>
            <input type="date" value={draft.end_date||""} onChange={e=>setDraft(p=>({...p,end_date:e.target.value||null}))}
              style={{...INP,colorScheme:"dark",color:draft.end_date&&new Date(draft.end_date)<new Date()&&draft.status!=="Completed"?"#f87171":"#f0f6ff"}}/>
          </div>
        </div>

        {/* Assigned to */}
        <div>
          <label style={LBL}>ASSIGNED TO</label>
          {engineers&&engineers.length>0?(
            <select value={draft.assigned_to||""} onChange={e=>setDraft(p=>({...p,assigned_to:e.target.value}))} style={INP}>
              <option value="">— Unassigned —</option>
              {engineers.filter(e=>e.role_type!=="accountant").map(e=><option key={e.id} value={e.name}>{e.name} — {e.role}</option>)}
            </select>
          ):(
            <input value={draft.assigned_to||""} onChange={e=>setDraft(p=>({...p,assigned_to:e.target.value}))}
              placeholder="Engineer name…" style={INP}/>
          )}
        </div>

        {/* Remarks */}
        <div>
          <label style={LBL}>REMARKS / BLOCKERS</label>
          <textarea value={draft.remarks||""} onChange={e=>setDraft(p=>({...p,remarks:e.target.value}))} rows={2}
            placeholder="e.g. Waiting for IOA addresses…"
            style={{...INP,color:"#7a8faa",resize:"vertical"}}/>
        </div>
      </div>
      <div style={{display:"flex",gap:10,marginTop:16,justifyContent:"flex-end"}}>
        <button className="bg" onClick={onClose}>Cancel</button>
        <button className="bp" onClick={()=>onSave(draft)}>Save Activity</button>
      </div>
    </div>
  </div>);
}

/* ── Add Activity modal ── */
/* ── Add Activity modal ── */
function AddActivityModal({projId, subId, defaultCat, onSave, onClose, engineers}){
  // Determine initial group from defaultCat
  const initGroup = defaultCat ? (CAT_TO_GROUP[defaultCat]||TAXONOMY_GROUP_NAMES[0]) : TAXONOMY_GROUP_NAMES[0];
  const initCat   = defaultCat || TAXONOMY_GROUPS[initGroup][0];
  const [group,     setGroup]    = useState(initGroup);
  const [cat,       setCat]      = useState(initCat);
  const [actName,   setActName]  = useState(ACTIVITY_TAXONOMY[initCat]?.[0]||"");
  const [custom,    setCustom]   = useState("");
  const [startDate, setStartDate]= useState("");
  const [endDate,   setEndDate]  = useState("");
  const [assignedTo,setAssignedTo]=useState("");

  const groupCats = TAXONOMY_GROUPS[group]||[];
  const catActs   = ACTIVITY_TAXONOMY[cat]||[];
  const finalName = actName==="Custom…" ? custom : actName;

  const handleGroupChange = g => {
    setGroup(g);
    const firstCat = TAXONOMY_GROUPS[g][0];
    setCat(firstCat);
    setActName(ACTIVITY_TAXONOMY[firstCat]?.[0]||"");
  };
  const handleCatChange = c => {
    setCat(c);
    setActName(ACTIVITY_TAXONOMY[c]?.[0]||"");
  };

  const INP = {width:"100%",background:"#060e1c",border:"1px solid #192d47",borderRadius:4,color:"#f0f6ff",padding:"6px 8px",fontSize:11,boxSizing:"border-box"};
  const LBL = {fontSize:10,color:"#7a8faa",fontWeight:600,display:"block",marginBottom:4};
  const GROUP_COLORS = {"SCADA":"#38bdf8","RTU-PLC":"#a78bfa","Protection":"#f87171","General":"#34d399"};

  return(
  <div className="modal-ov" onClick={onClose}>
    <div className="modal" style={{maxWidth:460}} onClick={e=>e.stopPropagation()}>
      <h3 style={{fontSize:13,fontWeight:700,color:"#f0f6ff",marginBottom:14}}>Add Activity</h3>
      <div style={{display:"grid",gap:10}}>

        {/* Group selector (SCADA / Field / General) */}
        <div>
          <label style={LBL}>GROUP</label>
          <div style={{display:"flex",gap:6}}>
            {TAXONOMY_GROUP_NAMES.map(g=>(
              <button key={g} onClick={()=>handleGroupChange(g)}
                style={{flex:1,padding:"6px 8px",borderRadius:6,border:`1px solid ${group===g?(GROUP_COLORS[g]||"#38bdf8")+"60":"#192d47"}`,
                  background:group===g?(GROUP_COLORS[g]||"#38bdf8")+"15":"#060e1c",
                  color:group===g?(GROUP_COLORS[g]||"#38bdf8"):"#4e6479",
                  fontSize:11,fontWeight:700,cursor:"pointer",transition:"all .15s"}}>
                {g}
              </button>
            ))}
          </div>
        </div>

        {/* Category (filtered by group) */}
        <div>
          <label style={LBL}>CATEGORY</label>
          <select value={cat} onChange={e=>handleCatChange(e.target.value)} style={INP}>
            {groupCats.map(c=><option key={c}>{c}</option>)}
          </select>
        </div>

        {/* Activity name */}
        <div>
          <label style={LBL}>ACTIVITY</label>
          {catActs.length>0?(
            <select value={actName} onChange={e=>setActName(e.target.value)} style={INP}>
              {catActs.map(a=><option key={a}>{a}</option>)}
              <option value="Custom…">Custom…</option>
            </select>
          ):(
            <input value={actName} onChange={e=>setActName(e.target.value)} placeholder="Activity name…" style={INP}/>
          )}
          {actName==="Custom…"&&(
            <input value={custom} onChange={e=>setCustom(e.target.value)} placeholder="Type custom activity name…"
              style={{...INP,marginTop:6,border:"1px solid #38bdf8"}}/>
          )}
        </div>

        {/* Dates */}
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}>
          <div>
            <label style={LBL}>START DATE</label>
            <input type="date" value={startDate} onChange={e=>setStartDate(e.target.value)}
              style={{...INP,colorScheme:"dark"}}/>
          </div>
          <div>
            <label style={LBL}>END DATE <span style={{color:"#4e6479",fontWeight:400}}>(deadline)</span></label>
            <input type="date" value={endDate} onChange={e=>setEndDate(e.target.value)}
              style={{...INP,colorScheme:"dark"}}/>
          </div>
        </div>

        {/* Assigned to */}
        {engineers&&engineers.length>0&&(
        <div>
          <label style={LBL}>ASSIGNED TO <span style={{color:"#4e6479",fontWeight:400}}>(optional)</span></label>
          <select value={assignedTo} onChange={e=>setAssignedTo(e.target.value)} style={INP}>
            <option value="">— Unassigned —</option>
            {engineers.filter(e=>e.role_type!=="accountant").map(e=><option key={e.id} value={e.name}>{e.name} — {e.role}</option>)}
          </select>
        </div>)}
      </div>
      <div style={{display:"flex",gap:10,marginTop:16,justifyContent:"flex-end"}}>
        <button className="bg" onClick={onClose}>Cancel</button>
        <button className="bp" disabled={!finalName.trim()} onClick={()=>onSave({
          category:cat||null,
          activity_name:finalName.trim(),
          start_date:startDate||null,
          end_date:endDate||null,
          assigned_to:assignedTo||null,
        })}>Add Activity</button>
      </div>
    </div>
  </div>);
}

/* ── Single activity row ── */
function ActivityRow({a, actHrs, isAdmin, onEdit, onDelete}){
  const pct      = Math.round(a.progress*100);
  const sc       = STATUS_COLOR[a.status]||"#4e6479";
  const today    = new Date(); today.setHours(0,0,0,0);
  const endDt    = a.end_date ? new Date(a.end_date) : null;
  const isOverdue= endDt && endDt < today && a.status!=="Completed";
  const fmtDate  = d => d ? new Date(d).toLocaleDateString("en-GB",{day:"2-digit",month:"short"}) : null;
  return(
  <tr style={{cursor:"pointer"}} onClick={()=>onEdit(a)}>
    <td style={{maxWidth:200}}>
      <div style={{fontWeight:600,fontSize:11}}>{a.activity_name}</div>
      {a.remarks&&<div style={{fontSize:9,color:"#f87171",fontStyle:"italic",marginTop:1,maxWidth:190,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{a.remarks}</div>}
    </td>
    <td><span style={{fontSize:9,padding:"2px 7px",borderRadius:3,background:STATUS_BG[a.status]||"#0a0f18",color:sc,fontWeight:700,whiteSpace:"nowrap"}}>{a.status}</span></td>
    <td>
      <div style={{display:"flex",alignItems:"center",gap:7}}>
        <div style={{width:52,height:5,background:"#0b1526",borderRadius:3,overflow:"hidden",flexShrink:0}}>
          <div style={{height:"100%",width:`${pct}%`,background:sc,borderRadius:3}}/>
        </div>
        <span style={{fontFamily:"'IBM Plex Mono',monospace",fontSize:10,fontWeight:700,color:sc}}>{pct}%</span>
      </div>
    </td>
    <td style={{fontSize:10,color:"#7a8faa",whiteSpace:"nowrap"}}>{a.assigned_to||"—"}</td>
    <td style={{fontSize:9,whiteSpace:"nowrap"}}>
      {(a.start_date||a.end_date)?(
        <div style={{display:"flex",flexDirection:"column",gap:1}}>
          {a.start_date&&<span style={{color:"#4e6479"}}>▶ {fmtDate(a.start_date)}</span>}
          {a.end_date&&<span style={{color:isOverdue?"#f87171":"#fb923c",fontWeight:isOverdue?700:400}}>
            {isOverdue?"⚠ ":"■ "}{fmtDate(a.end_date)}
          </span>}
        </div>
      ):<span style={{color:"#1a2d3f"}}>—</span>}
    </td>
    <td style={{fontFamily:"'IBM Plex Mono',monospace",fontSize:10,color:actHrs>0?"#38bdf8":"#1a2d3f"}}>{actHrs>0?actHrs+"h":"—"}</td>
    {isAdmin&&<td onClick={e=>e.stopPropagation()}><button className="bd" style={{fontSize:10,padding:"1px 5px"}} onClick={()=>onDelete(a.id)}>✕</button></td>}
  </tr>);
}

/* ════════════════════════════════════════════════════════
   PROJECT TRACKER — standalone component
   ════════════════════════════════════════════════════════ */
function ProjectTracker({projects, activities, subprojects, entries, engineers, isAdmin, isLead, activitiesLoaded, setActivities, showToast}){
  const canEdit = isAdmin || isLead;
  const [trackerProj,  setTrackerProj]  = useState(null);
  const [trackerSub,   setTrackerSub]   = useState(null);
  const [editActivity, setEditActivity] = useState(null);  // activity being edited (modal)
  const [addModal,     setAddModal]     = useState(null);  // {projId, subId} for add modal
  const [expandedCats, setExpandedCats] = useState({});    // {catName: bool}

  // ── Memoised lookups ──
  const activityHrsMap = useMemo(()=>{
    const m={};
    for(const e of entries){
      if(e.entry_type!=="work"||!e.activity_id) continue;
      const k=String(e.activity_id);
      m[k]=(m[k]||0)+e.hours;
    }
    return m;
  },[entries]);

  const projectHrsMap = useMemo(()=>{
    const m={};
    for(const e of entries){
      if(e.entry_type!=="work"||!e.project_id) continue;
      m[e.project_id]=(m[e.project_id]||0)+e.hours;
    }
    return m;
  },[entries]);

  const actsByProj = useMemo(()=>{
    const m={};
    for(const a of activities){
      if(!m[a.project_id]) m[a.project_id]=[];
      m[a.project_id].push(a);
    }
    return m;
  },[activities]);

  const getHrs     = useCallback((actId)=>activityHrsMap[String(actId)]||0, [activityHrsMap]);
  const getProjHrs = useCallback((pid)=>projectHrsMap[pid]||0,              [projectHrsMap]);
  const toggleCat  = useCallback((cat)=>setExpandedCats(p=>({...p,[cat]:!p[cat]})),[]);

  // ── Callbacks ──
  const saveActivity = useCallback(async(draft)=>{
    const {id,...fields}=draft;
    // map category → group_name for DB compatibility
    const payload={...fields, group_name: fields.category||fields.group_name, updated_at:new Date().toISOString()};
    const {data,error}=await supabase.from("project_activities").update(payload).eq("id",id).select().single();
    if(error){showToast("Error: "+error.message,false);return;}
    setActivities(prev=>prev.map(a=>a.id===data.id?data:a));
    setEditActivity(null);
    showToast("Activity saved ✓");
  },[setActivities,showToast]);

  const confirmAdd = useCallback(async({category,activity_name,start_date,end_date,assigned_to})=>{
    if(!addModal) return;
    const {projId,subId}=addModal;
    const {data,error}=await supabase.from("project_activities").insert({
      project_id:projId, subproject_id:subId||null,
      group_name:category||null,
      category:category||null,
      activity_name,
      status:"Not Started", progress:0,
      start_date:start_date||null,
      end_date:end_date||null,
      assigned_to:assigned_to||null,
      sort_order:(actsByProj[projId]||[]).length
    }).select().single();
    if(error){showToast("Error: "+error.message,false);return;}
    setActivities(prev=>[...prev,data]);
    setAddModal(null);
    showToast("Activity added ✓");
    if(category) setExpandedCats(p=>({...p,[category]:true}));
  },[addModal,actsByProj,setActivities,showToast]);

  const deleteActivity = useCallback(async(id)=>{
    if(!window.confirm("Delete this activity?")) return;
    await supabase.from("project_activities").delete().eq("id",id);
    setActivities(prev=>prev.filter(a=>a.id!==id));
  },[setActivities]);

  // ── Loading ──
  if(!activitiesLoaded) return(
    <div style={{padding:32,textAlign:"center",color:"#2e4a66",fontSize:13}}>Loading project tracker…</div>
  );

  // ── OVERVIEW ──
  if(!trackerProj){
    const allTrackerProjects=canEdit
      ? projects.filter(p=>p.status!=="Completed")
      : projects.filter(p=>(actsByProj[p.id]||[]).length>0);
    return(<>
    <div style={{display:"grid",gap:14}}>
      <div style={{display:"flex",gap:8,alignItems:"center"}}>
        <span style={{fontSize:13,fontWeight:700,color:"#f0f6ff"}}>Project Tracker</span>
        <span style={{fontSize:11,color:"#2e4a66"}}>{activities.length} activities · {Object.keys(actsByProj).length} projects</span>
      </div>
      <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(280px,1fr))",gap:10}}>
        {allTrackerProjects.map(p=>{
          const projActs=actsByProj[p.id]||[];
          const hasSubs=subprojects.some(s=>s.project_id===p.id);
          const totalHrs=getProjHrs(p.id);
          const overallPct=projActs.length>0?Math.round(projActs.reduce((s,a)=>s+a.progress,0)/projActs.length*100):0;
          const barColor=overallPct>=90?"#34d399":overallPct>=60?"#38bdf8":overallPct>=30?"#fb923c":"#f87171";
          const done=projActs.filter(a=>a.status==="Completed").length;
          const active=projActs.filter(a=>a.status==="In Progress").length;
          const pending=projActs.filter(a=>a.status==="Not Started").length;
          return(
          <div key={p.id} onClick={()=>setTrackerProj(p.id)}
            style={{background:"#060e1c",border:"1px solid #192d47",borderRadius:10,padding:"14px 16px",cursor:"pointer"}}
            onMouseEnter={e=>e.currentTarget.style.borderColor="#38bdf8"}
            onMouseLeave={e=>e.currentTarget.style.borderColor="#192d47"}>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:8}}>
              <div>
                <div style={{fontSize:12,fontWeight:700,color:"#f0f6ff"}}>{p.name||p.id}</div>
                <div style={{fontSize:10,color:"#2e4a66",fontFamily:"'IBM Plex Mono',monospace"}}>{p.id}</div>
              </div>
              <div style={{textAlign:"right"}}>
                <div style={{fontFamily:"'IBM Plex Mono',monospace",fontSize:18,fontWeight:700,color:barColor}}>{overallPct}%</div>
                <div style={{fontSize:9,color:"#2e4a66"}}>{totalHrs}h logged</div>
              </div>
            </div>
            <div style={{background:"#0b1526",borderRadius:4,height:6,overflow:"hidden",marginBottom:8}}>
              <div style={{height:"100%",width:`${overallPct}%`,background:barColor,borderRadius:4}}/>
            </div>
            <div style={{display:"flex",gap:6,flexWrap:"wrap"}}>
              {done>0&&<span style={{fontSize:9,padding:"2px 6px",borderRadius:3,background:"#002414",color:"#34d399",fontWeight:700}}>{done} Done</span>}
              {active>0&&<span style={{fontSize:9,padding:"2px 6px",borderRadius:3,background:"#001a2c",color:"#38bdf8",fontWeight:700}}>{active} Active</span>}
              {pending>0&&<span style={{fontSize:9,padding:"2px 6px",borderRadius:3,background:"#0a0f18",color:"#4e6479",fontWeight:700}}>{pending} Pending</span>}
              {hasSubs&&<span style={{fontSize:9,padding:"2px 6px",borderRadius:3,background:"#1a0a30",color:"#a78bfa",fontWeight:700}}>{subprojects.filter(s=>s.project_id===p.id).length} sub-sites</span>}
              {projActs.length===0&&canEdit&&(
                <span style={{fontSize:9,padding:"2px 8px",borderRadius:3,background:"#0a0f18",color:"#38bdf8",border:"1px dashed #192d47",cursor:"pointer"}}
                  onClick={e=>{e.stopPropagation();setTrackerProj(p.id);}}>
                  + Add activities
                </span>
              )}
              {projActs.length===0&&!canEdit&&<span style={{fontSize:9,color:"#2e4a66",fontStyle:"italic"}}>No activities yet</span>}
            </div>
          </div>);
        })}
      </div>
    </div>
    {addModal&&<AddActivityModal projId={addModal.projId} subId={addModal.subId} defaultCat={addModal.defaultCat} engineers={engineers} onSave={confirmAdd} onClose={()=>setAddModal(null)}/>}
    </>);
  }

  // ── PROJECT DETAIL ──
  const selProj=projects.find(p=>p.id===trackerProj);
  if(!selProj) return null;
  const projSubs=subprojects.filter(s=>s.project_id===trackerProj);
  const hasSubs=projSubs.length>0;
  const projActs=actsByProj[trackerProj]||[];
  const visActs=trackerSub
    ? projActs.filter(a=>String(a.subproject_id)===String(trackerSub))
    : projActs;

  // Group by category (group_name in DB)
  const catNames=[...new Set(visActs.map(a=>a.group_name||a.category).filter(Boolean))];
  const uncategorised=visActs.filter(a=>!a.group_name&&!a.category);

  const overallPct=projActs.length>0?Math.round(projActs.reduce((s,a)=>s+a.progress,0)/projActs.length*100):0;
  const barColor=overallPct>=90?"#34d399":overallPct>=60?"#38bdf8":overallPct>=30?"#fb923c":"#f87171";
  const totalHrs=getProjHrs(trackerProj);

  return(<>
  <div style={{display:"grid",gap:14}}>
    {/* Breadcrumb */}
    <div style={{display:"flex",alignItems:"center",gap:10,flexWrap:"wrap"}}>
      <button className="bg" style={{fontSize:11}} onClick={()=>{setTrackerProj(null);setTrackerSub(null);setExpandedCats({});}}>← All Projects</button>
      <span style={{color:"#2e4a66"}}>/</span>
      <span style={{fontSize:13,fontWeight:700,color:"#f0f6ff"}}>{selProj.name||trackerProj}</span>
      <span style={{fontFamily:"'IBM Plex Mono',monospace",fontSize:10,color:"#38bdf8"}}>{trackerProj}</span>
      {hasSubs&&trackerSub&&(
        <><span style={{color:"#2e4a66"}}>/</span>
        <span style={{fontSize:12,color:"#a78bfa"}}>{projSubs.find(s=>String(s.id)===String(trackerSub))?.name}</span>
        <button className="bg" style={{fontSize:10}} onClick={()=>setTrackerSub(null)}>All Sites</button></>
      )}
      <div style={{marginLeft:"auto",display:"flex",gap:8,alignItems:"center"}}>
        <div style={{fontFamily:"'IBM Plex Mono',monospace",fontSize:20,fontWeight:700,color:barColor}}>{overallPct}%</div>
        <div style={{fontSize:10,color:"#2e4a66"}}>{totalHrs}h logged</div>
        {canEdit&&<button className="bp" style={{fontSize:10}} onClick={()=>setAddModal({projId:trackerProj,subId:trackerSub||null})}>+ Add Activity</button>}
      </div>
    </div>

    {/* Progress bar */}
    <div style={{background:"#060e1c",borderRadius:4,height:8,overflow:"hidden"}}>
      <div style={{height:"100%",width:`${overallPct}%`,background:barColor,borderRadius:4,transition:"width .5s"}}/>
    </div>

    {/* Sub-site tabs */}
    {hasSubs&&(
    <div style={{display:"flex",gap:6,flexWrap:"wrap"}}>
      <button onClick={()=>{setTrackerSub(null);setExpandedCats({});}}
        style={{fontSize:10,padding:"4px 12px",borderRadius:5,border:`1px solid ${!trackerSub?"#38bdf8":"#192d47"}`,background:!trackerSub?"#001a2c":"transparent",color:!trackerSub?"#38bdf8":"#4e6479",cursor:"pointer"}}>
        All Sites
      </button>
      {projSubs.map(sp=>{
        const spActs=projActs.filter(a=>String(a.subproject_id)===String(sp.id));
        const spPct=spActs.length>0?Math.round(spActs.reduce((s,a)=>s+a.progress,0)/spActs.length*100):0;
        const isSel=String(trackerSub)===String(sp.id);
        const sc=spPct>=90?"#34d399":spPct>=60?"#38bdf8":spPct>=30?"#fb923c":"#f87171";
        return(
        <button key={sp.id} onClick={()=>{setTrackerSub(sp.id);setExpandedCats({});}}
          style={{fontSize:10,padding:"4px 10px",borderRadius:5,border:`1px solid ${isSel?sc:"#192d47"}`,background:isSel?sc+"20":"transparent",color:isSel?sc:"#4e6479",cursor:"pointer"}}>
          {sp.name} <span style={{fontFamily:"'IBM Plex Mono',monospace",fontWeight:700}}>{spPct}%</span>
        </button>);
      })}
    </div>)}

    {/* Category accordion sections */}
    <div style={{display:"grid",gap:8}}>
      {catNames.map(cat=>{
        const catActs=visActs.filter(a=>(a.group_name||a.category)===cat);
        const catPct=Math.round(catActs.reduce((s,a)=>s+a.progress,0)/catActs.length*100);
        const catDone=catActs.filter(a=>a.status==="Completed").length;
        const isOpen=expandedCats[cat]!==false; // default open
        const catColor=catPct>=90?"#34d399":catPct>=60?"#38bdf8":catPct>=30?"#fb923c":"#f87171";
        return(
        <div key={cat} style={{background:"#060e1c",border:"1px solid #192d47",borderRadius:8,overflow:"hidden"}}>
          {/* Category header — clickable to collapse */}
          <div onClick={()=>toggleCat(cat)}
            style={{display:"flex",alignItems:"center",gap:10,padding:"10px 14px",cursor:"pointer",background:"#080f1e"}}
            onMouseEnter={e=>e.currentTarget.style.background="#0c1a30"}
            onMouseLeave={e=>e.currentTarget.style.background="#080f1e"}>
            <span style={{fontSize:11,color:"#2e4a66",transition:"transform .2s",display:"inline-block",transform:isOpen?"rotate(90deg)":"rotate(0deg)"}}>▶</span>
            <span style={{fontSize:11,fontWeight:700,color:"#a78bfa",flex:1}}>{cat}</span>
            {/* Mini progress bar */}
            <div style={{width:80,height:5,background:"#0b1526",borderRadius:3,overflow:"hidden"}}>
              <div style={{height:"100%",width:`${catPct}%`,background:catColor,borderRadius:3}}/>
            </div>
            <span style={{fontFamily:"'IBM Plex Mono',monospace",fontSize:10,fontWeight:700,color:catColor,width:32,textAlign:"right"}}>{catPct}%</span>
            <span style={{fontSize:9,color:"#2e4a66",width:60,textAlign:"right"}}>{catDone}/{catActs.length} done</span>
            {canEdit&&<button className="bp" style={{fontSize:9,padding:"1px 7px",marginLeft:4}}
              onClick={e=>{e.stopPropagation();setAddModal({projId:trackerProj,subId:trackerSub||null,defaultCat:cat});}}>+</button>}
          </div>
          {/* Activity rows */}
          {isOpen&&(
          <table style={{margin:0}}>
            <thead><tr>
              <th>Activity</th><th>Status</th><th>Progress</th>
              <th>Assigned</th><th>Dates</th><th>Hours</th>
              {canEdit&&<th style={{width:36}}></th>}
            </tr></thead>
            <tbody>
              {catActs.map(a=>(
                <ActivityRow key={a.id} a={a} actHrs={getHrs(a.id)}
                  isAdmin={canEdit} onEdit={setEditActivity} onDelete={deleteActivity}/>
              ))}
            </tbody>
          </table>)}
        </div>);
      })}

      {/* Uncategorised activities */}
      {uncategorised.length>0&&(
      <div style={{background:"#060e1c",border:"1px solid #192d47",borderRadius:8,overflow:"hidden"}}>
        <div style={{padding:"8px 14px",background:"#080f1e",fontSize:10,color:"#4e6479",fontWeight:700}}>UNCATEGORISED</div>
        <table style={{margin:0}}>
          <thead><tr>
            <th>Activity</th><th>Status</th><th>Progress</th>
            <th>Assigned</th><th>Dates</th><th>Hours</th>
            {canEdit&&<th style={{width:36}}></th>}
          </tr></thead>
          <tbody>
            {uncategorised.map(a=>(
              <ActivityRow key={a.id} a={a} actHrs={getHrs(a.id)}
                isAdmin={canEdit} onEdit={setEditActivity} onDelete={deleteActivity}/>
            ))}
          </tbody>
        </table>
      </div>)}

      {visActs.length===0&&(
        <div style={{textAlign:"center",padding:"40px 24px",background:"#060e1c",borderRadius:8,border:"1px dashed #192d47"}}>
          <div style={{fontSize:28,marginBottom:10}}>📋</div>
          <div style={{fontSize:13,fontWeight:600,color:"#f0f6ff",marginBottom:6}}>No activities yet</div>
          <div style={{fontSize:11,color:"#2e4a66",marginBottom:canEdit?18:0}}>
            {trackerSub
              ? "No activities have been added to this sub-site yet."
              : "This project has no tracker activities."}
          </div>
          {canEdit&&(
            <button className="bp" style={{fontSize:11,padding:"7px 18px"}}
              onClick={()=>setAddModal({projId:trackerProj,subId:trackerSub||null})}>
              + Add First Activity
            </button>
          )}
        </div>
      )}
    </div>

    {/* Summary strip */}
    <div style={{display:"flex",gap:10,flexWrap:"wrap",alignItems:"center"}}>
      {[
        {label:"Completed",  count:visActs.filter(a=>a.status==="Completed").length,  color:"#34d399",bg:"#002414"},
        {label:"In Progress",count:visActs.filter(a=>a.status==="In Progress").length, color:"#38bdf8",bg:"#001a2c"},
        {label:"Not Started",count:visActs.filter(a=>a.status==="Not Started").length, color:"#4e6479",bg:"#0a0f18"},
        {label:"On Hold",    count:visActs.filter(a=>a.status==="On Hold").length,     color:"#fb923c",bg:"#1c0f00"},
      ].filter(s=>s.count>0).map(s=>(
        <div key={s.label} style={{display:"flex",gap:6,alignItems:"center",background:s.bg,border:`1px solid ${s.color}25`,borderRadius:6,padding:"5px 10px"}}>
          <span style={{fontFamily:"'IBM Plex Mono',monospace",fontSize:14,fontWeight:700,color:s.color}}>{s.count}</span>
          <span style={{fontSize:10,color:"#4e6479"}}>{s.label}</span>
        </div>
      ))}
      <div style={{marginLeft:"auto",fontSize:10,color:"#2e4a66"}}>Click row to edit · Click category header to collapse</div>
    </div>
  </div>

  {/* Edit modal */}
  {editActivity&&(
    <ActivityEditModal
      act={{...editActivity, category: editActivity.group_name||editActivity.category||""}}
      onSave={saveActivity}
      onClose={()=>setEditActivity(null)}
      engineers={engineers}/>
  )}

  {/* Add modal */}
  {addModal&&(
    <AddActivityModal
      projId={addModal.projId} subId={addModal.subId}
      defaultCat={addModal.defaultCat}
      onSave={confirmAdd}
      onClose={()=>setAddModal(null)}/>
  )}
  </>);
}



/* ════════════════════════════════════════════════════════
   SUB-PROJECT MODAL (add / edit)
   ════════════════════════════════════════════════════════ */
function SubProjectModal({projectId, sub, engineers, onSave, onClose}){
  const isEdit = !!sub;
  const [draft, setDraft] = useState(sub
    ? {...sub}
    : {project_id:projectId, name:"", pm_name:"", pm_comments:"", pendings:""}
  );
  const engList = engineers.filter(e=>e.role_type!=="accountant");
  return(
  <div className="modal-ov" onClick={onClose}>
    <div className="modal" style={{maxWidth:440}} onClick={e=>e.stopPropagation()}>
      <h3 style={{fontSize:14,fontWeight:700,color:"#f0f6ff",marginBottom:16}}>
        {isEdit?"Edit Sub-site":"Add Sub-site"}
        <span style={{fontSize:10,color:"#a78bfa",marginLeft:8,fontWeight:400}}>Project: {projectId}</span>
      </h3>
      <div style={{display:"grid",gap:10}}>
        <div>
          <label style={{fontSize:10,color:"#7a8faa",fontWeight:600,display:"block",marginBottom:4}}>SUB-SITE NAME <span style={{color:"#f87171"}}>*</span></label>
          <input value={draft.name} onChange={e=>setDraft(p=>({...p,name:e.target.value}))}
            placeholder="e.g. Ipotesti, Craiova, Bradu…"
            style={{width:"100%",background:"#060e1c",border:"1px solid #192d47",borderRadius:4,color:"#f0f6ff",padding:"6px 8px",fontSize:11,boxSizing:"border-box"}}/>
        </div>
        <div>
          <label style={{fontSize:10,color:"#7a8faa",fontWeight:600,display:"block",marginBottom:4}}>BU ROMANIA PM</label>
          <input value={draft.pm_name||""} onChange={e=>setDraft(p=>({...p,pm_name:e.target.value}))}
            placeholder="e.g. Cosmin, Irena, Alexanda…"
            style={{width:"100%",background:"#060e1c",border:"1px solid #192d47",borderRadius:4,color:"#f0f6ff",padding:"6px 8px",fontSize:11,boxSizing:"border-box"}}/>
        </div>
        <div>
          <label style={{fontSize:10,color:"#7a8faa",fontWeight:600,display:"block",marginBottom:4}}>ASSIGNED ENGINEERS</label>
          <div style={{background:"#060e1c",border:"1px solid #192d47",borderRadius:6,padding:"8px 10px",display:"grid",gridTemplateColumns:"1fr 1fr",gap:5,maxHeight:140,overflowY:"auto"}}>
            {engList.map(e=>{
              const assignedArr = (draft.assigned_engineers||[]).map(String);
              const sel = assignedArr.includes(String(e.id));
              return(
              <label key={e.id} style={{display:"flex",alignItems:"center",gap:6,cursor:"pointer",padding:"2px 4px",borderRadius:3,background:sel?"#001a2c":"transparent"}}>
                <input type="checkbox" checked={sel} onChange={()=>setDraft(p=>{
                  const cur=(p.assigned_engineers||[]).map(String);
                  return {...p, assigned_engineers: sel ? cur.filter(x=>x!==String(e.id)) : [...cur,String(e.id)]};
                })} style={{accentColor:"#38bdf8"}}/>
                <span style={{fontSize:10,color:sel?"#38bdf8":"#7a8faa"}}>{e.name}</span>
              </label>);
            })}
          </div>
        </div>
        <div>
          <label style={{fontSize:10,color:"#7a8faa",fontWeight:600,display:"block",marginBottom:4}}>PM COMMENTS</label>
          <textarea value={draft.pm_comments||""} onChange={e=>setDraft(p=>({...p,pm_comments:e.target.value}))} rows={2}
            placeholder="Comments from BU Romania PM…"
            style={{width:"100%",background:"#060e1c",border:"1px solid #192d47",borderRadius:4,color:"#7a8faa",padding:"6px 8px",fontSize:10,resize:"vertical",boxSizing:"border-box"}}/>
        </div>
        <div>
          <label style={{fontSize:10,color:"#7a8faa",fontWeight:600,display:"block",marginBottom:4}}>PENDING ITEMS</label>
          <textarea value={draft.pendings||""} onChange={e=>setDraft(p=>({...p,pendings:e.target.value}))} rows={2}
            placeholder="e.g. Waiting for IP list, IOA addresses…"
            style={{width:"100%",background:"#060e1c",border:"1px solid #192d47",borderRadius:4,color:"#f87171",padding:"6px 8px",fontSize:10,resize:"vertical",boxSizing:"border-box"}}/>
        </div>
      </div>
      <div style={{display:"flex",gap:10,marginTop:16,justifyContent:"flex-end"}}>
        <button className="bg" onClick={onClose}>Cancel</button>
        <button className="bp" disabled={!draft.name.trim()} onClick={()=>onSave(draft)}>
          {isEdit?"Save Changes":"Add Sub-site"}
        </button>
      </div>
    </div>
  </div>);
}

/* ════════════════════════════════════════════════════════
   PROJECTS TAB — standalone component (prevents hang)
   ════════════════════════════════════════════════════════ */
function ProjectsTab({projects, subprojects, entries, engineers, expandedProj, setExpandedProj,
  setShowProjModal, setEditProjModal, setSubProjModal, deleteProject, deleteSubProject}){

  const projHrsMap = useMemo(()=>{
    const m={};
    for(const e of entries){ if(e.entry_type==="work"&&e.project_id) m[e.project_id]=(m[e.project_id]||0)+e.hours; }
    return m;
  },[entries]);

  return(
  <div style={{display:"grid",gap:12}}>
    <div className="card" style={{padding:"12px 16px"}}>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:14}}>
        <h3 style={{fontSize:13,fontWeight:600,color:"#7a8faa"}}>Projects ({projects.length})</h3>
        <button className="bp" onClick={()=>setShowProjModal(true)}>+ New Project</button>
      </div>
      <table>
        <thead><tr>
          <th style={{width:28}}></th>
          <th>ID</th><th>Name</th><th>Client</th><th>Phase</th>
          <th>Status</th><th>Billing</th><th>Hours</th>
          <th>Sub-sites</th>
          <th style={{width:110}}>Actions</th>
        </tr></thead>
        <tbody>{projects.map(p=>{
          const pSubs = subprojects.filter(s=>s.project_id===p.id);
          const isExp = expandedProj[p.id];
          const hrs   = projHrsMap[p.id]||0;
          return(<React.Fragment key={p.id}>
            <tr>
              <td style={{textAlign:"center"}}>
                {pSubs.length>0&&(
                  <button onClick={()=>setExpandedProj(prev=>({...prev,[p.id]:!prev[p.id]}))}
                    style={{background:"none",border:"none",color:"#a78bfa",cursor:"pointer",fontSize:11,padding:0,
                      transition:"transform .2s",display:"inline-block",transform:isExp?"rotate(90deg)":"rotate(0deg)"}}>▶</button>
                )}
              </td>
              <td style={{fontFamily:"'IBM Plex Mono',monospace",fontSize:11,color:"#38bdf8"}}>{p.id}</td>
              <td style={{fontSize:11,fontWeight:500}}>{p.name}</td>
              <td style={{color:"#7a8faa",fontSize:11}}>{p.client}</td>
              <td style={{color:"#60a5fa",fontSize:11}}>{p.phase}</td>
              <td><span style={{fontSize:9,padding:"2px 6px",borderRadius:3,fontWeight:700,
                background:p.status==="Active"?"#024b36":p.status==="On Hold"?"#7c2d1230":"#1e3a5f",
                color:p.status==="Active"?"#34d399":p.status==="On Hold"?"#fb923c":"#60a5fa"}}>{p.status}</span></td>
              <td><span style={{fontSize:9,padding:"2px 6px",borderRadius:3,fontWeight:700,
                background:p.billable?"#0c2b4e":"#1a0a00",color:p.billable?"#38bdf8":"#fb923c"}}>
                {p.billable?"Billable":"Non-Bill"}</span></td>
              <td style={{fontFamily:"'IBM Plex Mono',monospace",color:"#38bdf8",fontWeight:700}}>{hrs}h</td>
              <td>
                {pSubs.length>0
                  ? <span style={{fontSize:9,padding:"2px 6px",borderRadius:3,background:"#1a0a30",color:"#a78bfa",
                      fontWeight:700,cursor:"pointer"}}
                      onClick={()=>setExpandedProj(prev=>({...prev,[p.id]:!prev[p.id]}))}>
                      {pSubs.length} sub-site{pSubs.length>1?"s":""}
                    </span>
                  : <span style={{fontSize:9,color:"#1a2d3f"}}>—</span>
                }
              </td>
              <td><div style={{display:"flex",gap:4}}>
                <button className="be" title="Edit project" onClick={()=>setEditProjModal({...p})}>✎</button>
                <button style={{fontSize:10,padding:"2px 7px",borderRadius:4,background:"#1a0a30",
                  border:"1px solid #a78bfa30",color:"#a78bfa",cursor:"pointer"}}
                  title="Add sub-site" onClick={()=>setSubProjModal({projectId:p.id,sub:null})}>+⊕</button>
                <button className="bd" title="Delete project" onClick={()=>deleteProject(p.id)}>✕</button>
              </div></td>
            </tr>
            {/* Sub-project rows */}
            {isExp&&pSubs.map(sp=>(
              <tr key={sp.id} style={{background:"#06111f"}}>
                <td></td>
                <td colSpan={2} style={{paddingLeft:24}}>
                  <div style={{display:"flex",alignItems:"center",gap:6}}>
                    <span style={{color:"#2e4a66",fontSize:10}}>└</span>
                    <span style={{fontSize:11,color:"#a78bfa",fontWeight:600}}>{sp.name}</span>
                  </div>
                </td>
                <td style={{fontSize:10,color:"#7a8faa"}}>{sp.pm_name||"—"}</td>
                <td colSpan={2} style={{fontSize:10,color:"#38bdf8"}}>
                  {(sp.assigned_engineers||[]).map(eid=>engineers.find(e=>String(e.id)===String(eid))?.name).filter(Boolean).join(", ")||"—"}
                </td>
                <td colSpan={2} style={{fontSize:10,color:"#4e6479",fontStyle:"italic",
                  maxWidth:200,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{sp.pendings||""}</td>
                <td></td>
                <td><div style={{display:"flex",gap:4}}>
                  <button className="be" style={{fontSize:10}} onClick={()=>setSubProjModal({projectId:p.id,sub:sp})}>✎</button>
                  <button className="bd" style={{fontSize:10}} onClick={()=>deleteSubProject(sp.id)}>✕</button>
                </div></td>
              </tr>
            ))}
          </React.Fragment>);
        })}</tbody>
      </table>
    </div>
  </div>);
}


/* ════════════════════════════════════════════════════════
   FINANCE TAB — standalone component
   ════════════════════════════════════════════════════════ */
function FinanceTab({staff, entries, expenses, projects, engineers, egpRate, setEgpRate,
  finTab, setFinTab, finMonth, setFinMonth, finYear, setFinYear,
  setEditStaff, setShowStaffModal, setEditExp, setNewExp, setShowExpModal,
  deleteStaff, deleteExpense, fmtCurrency, buildFinancePDF, isAdmin}){

  const derived = useMemo(()=>{
    const activeStaff=staff.filter(s=>s.active!==false);
const totalPayrollUSD=activeStaff.reduce((s,x)=>s+(x.salary_usd||0),0);
const totalPayrollEGP=activeStaff.reduce((s,x)=>s+(x.salary_egp||0),0);

// Exchange rate helper
const toUSD=(usd,egp)=>(usd&&usd>0)?usd:((egp||0)/egpRate);

// Company start date = earliest join_date across all staff (fallback: no limit)
const allJoinDates=activeStaff.map(s=>s.join_date).filter(Boolean).map(d=>new Date(d));
const companyStart=allJoinDates.length>0?new Date(Math.min(...allJoinDates)):null;

// Was this staff member employed during year/month?
// If no join_date on the individual, use companyStart as their implied join date
const wasEmployed=(s,y,m)=>{
  const monthStart=new Date(y,m,1);
  const monthEnd=new Date(y,m+1,0);
  const effectiveJoin=s.join_date?new Date(s.join_date):companyStart;
  if(effectiveJoin&&effectiveJoin>monthEnd) return false;
  if(s.termination_date&&new Date(s.termination_date)<monthStart) return false;
  return true;
};

// Month expenses
const monthExp=expenses.filter(e=>e.month===finMonth&&e.year===finYear);
const monthExpNonSalary=monthExp.filter(e=>e.category!=="Salaries");
const totalExpUSD=monthExpNonSalary.reduce((s,e)=>s+toUSD(e.amount_usd,e.amount_egp),0);
const totalExpEGP=monthExpNonSalary.reduce((s,e)=>s+(e.amount_egp||0),0);
const salaryCatUSD=monthExp.filter(e=>e.category==="Salaries").reduce((s,e)=>s+toUSD(e.amount_usd,e.amount_egp),0);
// Only count staff employed this specific month
const staffThisMonth=activeStaff.filter(s=>wasEmployed(s,finYear,finMonth));
const totalPayrollUSDeff=staffThisMonth.reduce((s,x)=>s+toUSD(x.salary_usd,x.salary_egp),0);
const totalCostUSD=totalPayrollUSDeff+salaryCatUSD+totalExpUSD;

// Revenue from billing (all entries this month)
const mRevEntries=entries.filter(e=>{
  const d=new Date(e.date+"T12:00:00");
  return d.getFullYear()===finYear&&d.getMonth()===finMonth&&e.entry_type==="work";
});
const monthRevUSD=mRevEntries.reduce((s,e)=>{
  const p=projects.find(x=>x.id===e.project_id);
  return s+(p&&p.billable?p.rate_per_hour*e.hours:0);
},0);
const netPL=monthRevUSD-totalCostUSD;

// YTD P&L
const ytdMonths=Array.from({length:finMonth+1},(_,i)=>i);
const ytdData=ytdMonths.map(m=>{
  const mE=entries.filter(e=>{const d=new Date(e.date+"T12:00:00");return d.getFullYear()===finYear&&d.getMonth()===m&&e.entry_type==="work";});
  const rev=mE.reduce((s,e)=>{const p=projects.find(x=>x.id===e.project_id);return s+(p&&p.billable?p.rate_per_hour*e.hours:0);},0);
  const mMonthExp=expenses.filter(e=>e.month===m&&e.year===finYear);
  const mExpUSD=mMonthExp.filter(e=>e.category!=="Salaries").reduce((s,e)=>s+toUSD(e.amount_usd,e.amount_egp),0);
  const mSalaryCat=mMonthExp.filter(e=>e.category==="Salaries").reduce((s,e)=>s+toUSD(e.amount_usd,e.amount_egp),0);
  const mPayroll=activeStaff.filter(s=>wasEmployed(s,finYear,m)).reduce((s,x)=>s+toUSD(x.salary_usd,x.salary_egp),0);
  const cost=mPayroll+mSalaryCat+mExpUSD;
  return{m,rev,cost,net:rev-cost};
});
const ytdRev=ytdData.reduce((s,x)=>s+x.rev,0);
const ytdCost=ytdData.reduce((s,x)=>s+x.cost,0);
const ytdNet=ytdRev-ytdCost;

// Per-project profitability
const projProfit=projects.filter(p=>p.billable).map(p=>{
  const pe=mRevEntries.filter(e=>e.project_id===p.id);
  const rev=pe.reduce((s,e)=>s+(p.rate_per_hour*e.hours),0);
  const hrs=pe.reduce((s,e)=>s+e.hours,0);
  const engsOnProj=[...new Set(pe.map(e=>e.engineer_id))];
  // Allocate cost: proportional to hrs worked on this project vs total billable hrs
  const allBillHrs=mRevEntries.reduce((s,e)=>s+e.hours,0)||1;
  const allocatedCost=totalCostUSD*(hrs/allBillHrs);
  return{id:p.id,name:p.name,rev,hrs,engs:engsOnProj.length,allocatedCost,net:rev-allocatedCost};
}).filter(p=>p.hrs>0).sort((a,b)=>b.net-a.net);

// Dept salary breakdown
const deptMap={};
activeStaff.forEach(s=>{
  const d=s.department||"Other";
  if(!deptMap[d]) deptMap[d]={dept:d,count:0,usd:0,egp:0};
  deptMap[d].count++;
  deptMap[d].usd+=toUSD(s.salary_usd,s.salary_egp);
  deptMap[d].egp+=s.salary_egp||0;
});
const deptList=Object.values(deptMap).sort((a,b)=>b.usd-a.usd);

const netColor=netPL>=0?"#34d399":"#f87171";
const MONTHS_=["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
    return {activeStaff,totalPayrollUSD,totalPayrollEGP,toUSD,companyStart,wasEmployed,
      monthExp,monthExpNonSalary,totalExpUSD,totalExpEGP,salaryCatUSD,
      staffThisMonth,totalPayrollUSDeff,totalCostUSD,
      monthRevUSD,netPL,ytdData,ytdRev,ytdCost,ytdNet,
      projProfit,deptList,netColor};
  },[staff,entries,expenses,projects,egpRate,finMonth,finYear]);

  const {activeStaff,totalPayrollUSD,totalPayrollEGP,toUSD,
    monthExp,monthExpNonSalary,totalExpUSD,totalExpEGP,salaryCatUSD,
    staffThisMonth,totalPayrollUSDeff,totalCostUSD,
    monthRevUSD,netPL,ytdData,ytdRev,ytdCost,ytdNet,
    projProfit,deptList,netColor} = derived;

  const MONTHS_ = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];

  return(
<div>
  {/* Finance sub-tabs */}
  <div style={{display:"flex",gap:4,marginBottom:16,background:"#060e1c",borderRadius:8,padding:4,width:"fit-content"}}>
    {[{id:"pl",label:"📊 P&L"},{id:"salaries",label:"👤 Salaries"},{id:"expenses",label:"🧾 Expenses"}].map(t=>(
      <button key={t.id} className={`atab ${finTab===t.id?"a":""}`} onClick={()=>setFinTab(t.id)}>{t.label}</button>
    ))}
  </div>

  {/* Month/Year picker */}
  <div style={{display:"flex",gap:8,alignItems:"center",marginBottom:16}}>
    <select value={finMonth} onChange={e=>setFinMonth(+e.target.value)}
      style={{background:"#0b1526",border:"1px solid #192d47",borderRadius:6,padding:"6px 10px",color:"#f0f6ff",fontSize:12}}>
      {MONTHS_.map((m,i)=><option key={i} value={i}>{m}</option>)}
    </select>
    <select value={finYear} onChange={e=>setFinYear(+e.target.value)}
      style={{background:"#0b1526",border:"1px solid #192d47",borderRadius:6,padding:"6px 10px",color:"#f0f6ff",fontSize:12}}>
      {[2024,2025,2026,2027].map(y=><option key={y}>{y}</option>)}
    </select>
    {/* EGP/USD Rate box */}
    <div style={{display:"flex",alignItems:"center",gap:6,background:"#060e1c",border:"1px solid #38bdf840",borderRadius:6,padding:"5px 10px"}}>
      <span style={{fontSize:9,color:"#2e4a66",textTransform:"uppercase",letterSpacing:".05em"}}>EGP/USD</span>
      <input type="number" value={egpRate} onChange={e=>setEgpRate(Math.max(1,+e.target.value))}
        style={{width:55,background:"transparent",border:"none",color:"#38bdf8",fontSize:13,fontFamily:"'IBM Plex Mono',monospace",fontWeight:700,textAlign:"center",outline:"none"}}
        min="1" step="0.5"/>
      <span style={{fontSize:9,color:"#2e4a66"}}>per $1</span>
    </div>
    <span style={{fontSize:11,color:"#2e4a66"}}>Viewing: {MONTHS_[finMonth]} {finYear}</span>
    <button className="bp" style={{marginLeft:"auto"}} onClick={()=>{
      const now=new Date().toLocaleDateString("en-GB",{day:"2-digit",month:"short",year:"numeric"});
      buildFinancePDF({finMonth,finYear,MONTHS_,monthRevUSD,totalPayrollUSDeff,totalPayrollEGP,totalExpUSD,totalExpEGP,totalCostUSD,netPL,netColor,activeStaff,monthExp,deptList,projProfit,ytdData,ytdRev,ytdCost,ytdNet,fmtCurrency,isAdmin,egpRate});
    }}>⬇ Export P&L PDF</button>
  </div>

  {/* ── P&L TAB ── */}
  {finTab==="pl"&&(
    <div style={{display:"grid",gap:14}}>
      {/* KPI strip */}
      <div style={{display:"grid",gridTemplateColumns:"repeat(5,1fr)",gap:10}}>
        {[
          {l:"Revenue",      v:fmtCurrency(monthRevUSD),  c:"#34d399"},
          {l:"Payroll Cost", v:fmtCurrency(totalPayrollUSDeff),c:"#f87171"},
          {l:"Other Costs",  v:fmtCurrency(totalExpUSD),  c:"#fb923c"},
          {l:"Total Cost",   v:fmtCurrency(totalCostUSD), c:"#f87171"},
          {l:"Net P&L",      v:fmtCurrency(netPL),        c:netColor},
        ].map((k,i)=>(
          <div key={i} className="card" style={{textAlign:"center",padding:"12px 8px"}}>
            <div style={{fontFamily:"'IBM Plex Mono',monospace",fontSize:18,fontWeight:700,color:k.c}}>{k.v}</div>
            <div style={{fontSize:9,color:"#2e4a66",textTransform:"uppercase",letterSpacing:".08em",marginTop:4}}>{k.l}</div>
          </div>
        ))}
      </div>

      {/* Visual P&L bar */}
      <div className="card">
        <div style={{fontSize:11,fontWeight:700,color:"#7a8faa",marginBottom:10}}>MONTHLY BREAKDOWN — {MONTHS_[finMonth]} {finYear}</div>
        {monthRevUSD>0||totalCostUSD>0?(()=>{
          const max=Math.max(monthRevUSD,totalCostUSD)||1;
          return(
          <div style={{display:"grid",gap:8}}>
            {[
              {l:"Revenue",    v:monthRevUSD,    c:"#34d399"},
              {l:"Payroll",    v:totalPayrollUSDeff+salaryCatUSD,c:"#f87171"},
              {l:"Expenses",   v:totalExpUSD,    c:"#fb923c"},
              {l:"Total Cost", v:totalCostUSD,   c:"#ef4444"},
            ].map((r,i)=>(
              <div key={i} style={{display:"grid",gridTemplateColumns:"120px 1fr 80px",alignItems:"center",gap:10}}>
                <div style={{fontSize:10,color:"#7a8faa"}}>{r.l}</div>
                <div style={{background:"#060e1c",borderRadius:4,height:18,overflow:"hidden"}}>
                  <div style={{height:"100%",width:`${Math.round(r.v/max*100)}%`,background:r.c,borderRadius:4,minWidth:r.v>0?4:0}}/>
                </div>
                <div style={{fontFamily:"'IBM Plex Mono',monospace",fontSize:11,color:r.c,fontWeight:700,textAlign:"right"}}>{fmtCurrency(r.v)}</div>
              </div>
            ))}
            <div style={{borderTop:"1px solid #0ea5e930",paddingTop:8,display:"flex",justifyContent:"space-between",alignItems:"center"}}>
              <span style={{fontSize:11,color:"#7a8faa"}}>Net Profit / Loss</span>
              <span style={{fontFamily:"'IBM Plex Mono',monospace",fontSize:20,fontWeight:700,color:netColor}}>{netPL>=0?"▲":"▼"} {fmtCurrency(Math.abs(netPL))}</span>
            </div>
          </div>);
        })():<div style={{color:"#2e4a66",fontSize:11,textAlign:"center",padding:20}}>No data for {MONTHS_[finMonth]} {finYear}</div>}
      </div>

      {/* YTD Summary */}
      <div className="card">
        <div style={{fontSize:11,fontWeight:700,color:"#7a8faa",marginBottom:10}}>YEAR-TO-DATE {finYear} SUMMARY (Jan–{MONTHS_[finMonth]})</div>
        <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:10,marginBottom:14}}>
          {[
            {l:"YTD Revenue",v:fmtCurrency(ytdRev),c:"#34d399"},
            {l:"YTD Costs",  v:fmtCurrency(ytdCost),c:"#f87171"},
            {l:"YTD Net",    v:fmtCurrency(ytdNet), c:ytdNet>=0?"#34d399":"#f87171"},
          ].map((k,i)=>(
            <div key={i} style={{background:"#060e1c",borderRadius:6,padding:"10px 12px"}}>
              <div style={{fontFamily:"'IBM Plex Mono',monospace",fontSize:16,fontWeight:700,color:k.c}}>{k.v}</div>
              <div style={{fontSize:9,color:"#2e4a66",textTransform:"uppercase",letterSpacing:".07em",marginTop:3}}>{k.l}</div>
            </div>
          ))}
        </div>
        <table>
          <thead><tr><th>Month</th><th style={{textAlign:"right"}}>Revenue</th><th style={{textAlign:"right"}}>Cost</th><th style={{textAlign:"right"}}>Net P&L</th><th style={{textAlign:"right"}}>Margin</th></tr></thead>
          <tbody>{ytdData.map(row=>{
            const margin=row.rev>0?Math.round(row.net/row.rev*100):0;
            const c=row.net>=0?"#34d399":"#f87171";
            return(<tr key={row.m}>
              <td style={{fontWeight:600}}>{MONTHS_[row.m]} {finYear}</td>
              <td style={{textAlign:"right",fontFamily:"'IBM Plex Mono',monospace",color:"#34d399"}}>{fmtCurrency(row.rev)}</td>
              <td style={{textAlign:"right",fontFamily:"'IBM Plex Mono',monospace",color:"#f87171"}}>{fmtCurrency(row.cost)}</td>
              <td style={{textAlign:"right",fontFamily:"'IBM Plex Mono',monospace",fontWeight:700,color:c}}>{row.net>=0?"+":""}{fmtCurrency(row.net)}</td>
              <td style={{textAlign:"right",fontFamily:"'IBM Plex Mono',monospace",color:c}}>{margin}%</td>
            </tr>);
          })}</tbody>
        </table>
      </div>

      {/* Per-project profitability */}
      {projProfit.length>0&&(
      <div className="card">
        <div style={{fontSize:11,fontWeight:700,color:"#7a8faa",marginBottom:10}}>PER-PROJECT PROFITABILITY — {MONTHS_[finMonth]} {finYear}</div>
        <div style={{fontSize:10,color:"#2e4a66",marginBottom:10}}>Cost allocated proportionally by hours worked on each billable project</div>
        <table>
          <thead><tr><th>Project</th><th style={{textAlign:"right"}}>Revenue</th><th style={{textAlign:"right"}}>Alloc. Cost</th><th style={{textAlign:"right"}}>Net</th><th style={{textAlign:"right"}}>Margin</th><th style={{textAlign:"right"}}>Hours</th></tr></thead>
          <tbody>{projProfit.map(p=>{
            const margin=p.rev>0?Math.round(p.net/p.rev*100):0;
            const c=p.net>=0?"#34d399":"#f87171";
            return(<tr key={p.id}>
              <td><span style={{fontFamily:"'IBM Plex Mono',monospace",fontSize:10,color:"#38bdf8"}}>{p.id}</span> <span style={{fontSize:10}}>{p.name}</span></td>
              <td style={{textAlign:"right",fontFamily:"'IBM Plex Mono',monospace",color:"#34d399"}}>{fmtCurrency(p.rev)}</td>
              <td style={{textAlign:"right",fontFamily:"'IBM Plex Mono',monospace",color:"#f87171"}}>{fmtCurrency(Math.round(p.allocatedCost))}</td>
              <td style={{textAlign:"right",fontFamily:"'IBM Plex Mono',monospace",fontWeight:700,color:c}}>{p.net>=0?"+":""}{fmtCurrency(Math.round(p.net))}</td>
              <td style={{textAlign:"right",fontFamily:"'IBM Plex Mono',monospace",color:c}}>{margin}%</td>
              <td style={{textAlign:"right",fontFamily:"'IBM Plex Mono',monospace",color:"#7a8faa"}}>{p.hrs}h</td>
            </tr>);
          })}</tbody>
        </table>
      </div>)}
    </div>
  )}

  {/* ── SALARIES TAB ── */}
  {finTab==="salaries"&&(
    <div style={{display:"grid",gap:14}}>
      {/* Payroll KPIs */}
      <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:10}}>
        {[
          {l:"Total Staff",      v:activeStaff.length,                c:"#38bdf8"},
          {l:"Monthly USD",      v:fmtCurrency(totalPayrollUSD),       c:"#f87171"},
          {l:"Monthly EGP",      v:`EGP ${totalPayrollEGP.toLocaleString()}`, c:"#fb923c"},
          {l:"Departments",      v:deptList.length,                   c:"#a78bfa"},
        ].map((k,i)=>(
          <div key={i} className="card" style={{textAlign:"center",padding:"12px 8px"}}>
            <div style={{fontFamily:"'IBM Plex Mono',monospace",fontSize:16,fontWeight:700,color:k.c}}>{k.v}</div>
            <div style={{fontSize:9,color:"#2e4a66",textTransform:"uppercase",letterSpacing:".08em",marginTop:4}}>{k.l}</div>
          </div>
        ))}
      </div>

      {/* Dept breakdown */}
      <div className="card">
        <div style={{fontSize:11,fontWeight:700,color:"#7a8faa",marginBottom:10}}>SALARY BY DEPARTMENT</div>
        <table>
          <thead><tr><th>Department</th><th style={{textAlign:"right"}}>Headcount</th><th style={{textAlign:"right"}}>Monthly USD</th><th style={{textAlign:"right"}}>Monthly EGP</th><th style={{textAlign:"right"}}>% of Payroll</th></tr></thead>
          <tbody>{deptList.map((d,i)=>(
            <tr key={i}>
              <td style={{fontWeight:600}}>{d.dept}</td>
              <td style={{textAlign:"right"}}>{d.count}</td>
              <td style={{textAlign:"right",fontFamily:"'IBM Plex Mono',monospace",color:"#f87171",fontWeight:700}}>{fmtCurrency(d.usd)}</td>
              <td style={{textAlign:"right",fontFamily:"'IBM Plex Mono',monospace",color:"#fb923c"}}>EGP {d.egp.toLocaleString()}</td>
              <td style={{textAlign:"right",fontFamily:"'IBM Plex Mono',monospace",color:"#7a8faa"}}>{totalPayrollUSD?Math.round(d.usd/totalPayrollUSD*100):0}%</td>
            </tr>
          ))}</tbody>
        </table>
      </div>

      {/* Staff table */}
      <div className="card">
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:12}}>
          <div style={{fontSize:11,fontWeight:700,color:"#7a8faa"}}>ALL STAFF ({staff.length})</div>
          <button className="bp" onClick={()=>{setEditStaff(null);setShowStaffModal(true)}}>+ Add Staff</button>
        </div>
        <table>
          <thead><tr><th>Name</th><th>Dept</th><th>Role</th><th>Type</th><th style={{textAlign:"right"}}>USD/mo</th><th style={{textAlign:"right"}}>EGP/mo</th><th>Joined</th><th>Left</th><th>Status</th><th>Actions</th></tr></thead>
          <tbody>{staff.map(s=>(
            <tr key={s.id}>
              <td style={{fontWeight:600}}>{s.name}</td>
              <td style={{fontSize:10,color:"#38bdf8"}}>{s.department}</td>
              <td style={{fontSize:10,color:"#7a8faa"}}>{s.role}</td>
              <td style={{fontSize:9}}><span style={{padding:"2px 6px",borderRadius:3,background:"#0c2b4e",color:"#38bdf8",fontWeight:700}}>{s.type?.replace("_"," ")}</span></td>
              <td style={{textAlign:"right",fontFamily:"'IBM Plex Mono',monospace",color:"#f87171",fontWeight:700}}>{fmtCurrency(s.salary_usd||0)}</td>
              <td style={{textAlign:"right",fontFamily:"'IBM Plex Mono',monospace",color:"#fb923c"}}>EGP {(s.salary_egp||0).toLocaleString()}</td>
              <td style={{fontFamily:"'IBM Plex Mono',monospace",fontSize:10,color:"#38bdf8"}}>{s.join_date||"—"}</td>
              <td style={{fontFamily:"'IBM Plex Mono',monospace",fontSize:10,color:s.termination_date?"#f87171":"#2e4a66"}}>{s.termination_date||"—"}</td>
              <td><span style={{fontSize:9,padding:"2px 5px",borderRadius:3,background:s.active!==false?"#024b36":"#1a0a00",color:s.active!==false?"#34d399":"#f87171"}}>{s.active!==false?"Active":"Inactive"}</span></td>
              <td><div style={{display:"flex",gap:4}}>
                <button className="be" onClick={()=>{setEditStaff({...s});setShowStaffModal(true)}}>✎</button>
                <button className="bd" onClick={()=>deleteStaff(s.id)}>✕</button>
              </div></td>
            </tr>
          ))}</tbody>
        </table>
      </div>
    </div>
  )}

  {/* ── EXPENSES TAB ── */}
  {finTab==="expenses"&&(
    <div style={{display:"grid",gap:14}}>
      {/* Expense KPIs */}
      <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:10}}>
        {[
          {l:"Entries",     v:monthExp.length,              c:"#38bdf8"},
          {l:"Total USD",   v:fmtCurrency(totalExpUSD),      c:"#fb923c"},
          {l:"Total EGP",   v:`EGP ${totalExpEGP.toLocaleString()}`,c:"#a78bfa"},
          {l:"Categories",  v:[...new Set(monthExp.map(e=>e.category))].length, c:"#34d399"},
        ].map((k,i)=>(
          <div key={i} className="card" style={{textAlign:"center",padding:"12px 8px"}}>
            <div style={{fontFamily:"'IBM Plex Mono',monospace",fontSize:16,fontWeight:700,color:k.c}}>{k.v}</div>
            <div style={{fontSize:9,color:"#2e4a66",textTransform:"uppercase",letterSpacing:".08em",marginTop:4}}>{k.l}</div>
          </div>
        ))}
      </div>

      {/* Expenses table */}
      <div className="card">
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:12}}>
          <div style={{fontSize:11,fontWeight:700,color:"#7a8faa"}}>EXPENSES — {MONTHS_[finMonth]} {finYear} ({monthExp.length})</div>
          <button className="bp" onClick={()=>{setEditExp(null);setNewExp(p=>({...p,month:finMonth,year:finYear}));setShowExpModal(true)}}>+ Add Expense</button>
        </div>
        {monthExp.length===0?<div style={{color:"#2e4a66",fontSize:11,textAlign:"center",padding:20}}>No expenses posted for {MONTHS_[finMonth]} {finYear}</div>:(
        <table>
          <thead><tr><th>Category</th><th>Description</th><th style={{textAlign:"right"}}>USD</th><th style={{textAlign:"right"}}>EGP</th><th>Notes</th><th>Actions</th></tr></thead>
          <tbody>{monthExp.map(e=>(
            <tr key={e.id}>
              <td><span style={{fontSize:9,padding:"2px 6px",borderRadius:3,background:"#0c2b4e",color:"#38bdf8",fontWeight:700}}>{e.category}</span></td>
              <td style={{fontWeight:500}}>{e.description}</td>
              <td style={{textAlign:"right",fontFamily:"'IBM Plex Mono',monospace",color:"#fb923c",fontWeight:700}}>
                {e.amount_usd>0?fmtCurrency(e.amount_usd):<span style={{color:"#38bdf8",fontSize:10}}>{"≈"}{fmtCurrency(Math.round((e.amount_egp||0)/egpRate))}</span>}
              </td>
              <td style={{textAlign:"right",fontFamily:"'IBM Plex Mono',monospace",color:"#a78bfa"}}>{e.amount_egp?`EGP ${e.amount_egp.toLocaleString()}`:"-"}</td>
              <td style={{fontSize:10,color:"#4e6479",fontStyle:"italic"}}>{e.notes||""}</td>
              <td><div style={{display:"flex",gap:4}}>
                <button className="be" onClick={()=>{setEditExp({...e});setShowExpModal(true)}}>✎</button>
                <button className="bd" onClick={()=>deleteExpense(e.id)}>✕</button>
              </div></td>
            </tr>
          ))}</tbody>
        </table>)}
      </div>
    </div>
  )}
</div>
  );
}

/* ════════════════════════════════════════════════════════
   FUNCTIONS TAB — standalone component
   ════════════════════════════════════════════════════════ */
function FunctionsTab({entries, engineers, funcYear, setFuncYear, funcEngId, setFuncEngId, deleteEntry, isAdmin, year, setShowFuncModal}){

  const {funcEntries, yearFuncs, totalFuncHrs, catTotals, maxCat, engFuncMap} = useMemo(()=>{
    const funcEntries=entries.filter(e=>
  e.entry_type==="function"||
  (e.task_category&&e.task_category.toLowerCase()==="function")
);
const yearFuncs=funcEntries.filter(e=>{
  const d=new Date(e.date+"T12:00:00");
  return d.getFullYear()===funcYear&&(funcEngId==="all"||String(e.engineer_id)===String(funcEngId));
});
const totalFuncHrs=yearFuncs.reduce((s,e)=>s+e.hours,0);
const catTotals={};
FUNCTION_CATS.forEach(c=>{catTotals[c]=yearFuncs.filter(e=>(e.function_category||e.task_type)===c).reduce((s,e)=>s+e.hours,0);});
const maxCat=Math.max(...Object.values(catTotals),1);
const engFuncMap={};
engineers.forEach(eng=>{
  const eh=funcEntries.filter(e=>String(e.engineer_id)===String(eng.id)&&new Date(e.date+"T12:00:00").getFullYear()===funcYear);
  engFuncMap[eng.id]={total:eh.reduce((s,e)=>s+e.hours,0),cats:{}};
  FUNCTION_CATS.forEach(c=>{engFuncMap[eng.id].cats[c]=eh.filter(e=>(e.function_category||e.task_type)===c).reduce((s,e)=>s+e.hours,0);});
});
    return {funcEntries, yearFuncs, totalFuncHrs, catTotals, maxCat, engFuncMap};
  }, [entries, engineers, funcYear, funcEngId]);

  return(
<div style={{display:"grid",gap:14}}>
  <div style={{display:"flex",gap:8,alignItems:"center",flexWrap:"wrap"}}>
    <select value={funcYear} onChange={e=>setFuncYear(+e.target.value)}
      style={{background:"#0b1526",border:"1px solid #192d47",borderRadius:6,padding:"6px 10px",color:"#f0f6ff",fontSize:12}}>
      {[2024,2025,2026,2027].map(y=><option key={y}>{y}</option>)}
    </select>
    <select value={funcEngId} onChange={e=>setFuncEngId(e.target.value)}
      style={{background:"#0b1526",border:"1px solid #192d47",borderRadius:6,padding:"6px 10px",color:"#f0f6ff",fontSize:12}}>
      <option value="all">All Engineers</option>
      {engineers.map(e=><option key={e.id} value={e.id}>{e.name}</option>)}
    </select>
    <span style={{fontSize:11,color:"#2e4a66"}}>{yearFuncs.length} entries · {totalFuncHrs}h total</span>
    <button className="bp" style={{marginLeft:"auto"}} onClick={()=>setShowFuncModal(true)}>+ Log Function Hours</button>
  </div>
  <div className="card">
    <div style={{fontSize:11,fontWeight:700,color:"#7a8faa",marginBottom:12}}>FUNCTION HOURS BY CATEGORY — {funcYear}{funcEngId!=="all"?" · "+engineers.find(e=>String(e.id)===String(funcEngId))?.name:""}</div>
    <div style={{display:"grid",gap:7}}>
      {FUNCTION_CATS.map(cat=>{
        const hrs=catTotals[cat]||0;
        return(
        <div key={cat} style={{display:"grid",gridTemplateColumns:"240px 1fr 50px",alignItems:"center",gap:10}}>
          <div style={{fontSize:10,color:FUNC_COLORS[cat]||"#7a8faa",fontWeight:600}}>{cat}</div>
          <div style={{background:"#060e1c",borderRadius:4,height:16,overflow:"hidden"}}>
            <div style={{height:"100%",width:`${Math.round(hrs/maxCat*100)}%`,background:FUNC_COLORS[cat]||"#38bdf8",borderRadius:4,minWidth:hrs>0?4:0}}/>
          </div>
          <div style={{fontFamily:"'IBM Plex Mono',monospace",fontSize:11,color:hrs>0?(FUNC_COLORS[cat]||"#38bdf8"):"#2e4a66",fontWeight:700,textAlign:"right"}}>{hrs}h</div>
        </div>);
      })}
    </div>
  </div>
  <div className="card">
    <div style={{fontSize:11,fontWeight:700,color:"#7a8faa",marginBottom:12}}>ENGINEER FUNCTION MATRIX — {funcYear}</div>
    <div style={{overflowX:"auto"}}>
    <table style={{minWidth:700}}>
      <thead><tr>
        <th>Engineer</th>
        <th style={{textAlign:"right"}}>Total</th>
        {FUNCTION_CATS.map(c=><th key={c} style={{textAlign:"right",fontSize:8,maxWidth:70,whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis",color:FUNC_COLORS[c]}} title={c}>{c.split("—")[0].split("&")[0].trim().slice(0,11)}</th>)}
      </tr></thead>
      <tbody>{engineers.map(eng=>{
        const em=engFuncMap[eng.id]||{total:0,cats:{}};
        return(<tr key={eng.id}>
          <td style={{fontWeight:600,minWidth:120}}>{eng.name}<br/><span style={{fontSize:9,color:"#2e4a66"}}>{eng.role}</span></td>
          <td style={{textAlign:"right",fontFamily:"'IBM Plex Mono',monospace",fontWeight:700,color:"#a78bfa"}}>{em.total||"—"}</td>
          {FUNCTION_CATS.map(c=>(
            <td key={c} style={{textAlign:"right",fontFamily:"'IBM Plex Mono',monospace",fontSize:10,color:em.cats[c]>0?(FUNC_COLORS[c]||"#38bdf8"):"#1a2d3f"}}>{em.cats[c]||"—"}</td>
          ))}
        </tr>);
      })}</tbody>
    </table>
    </div>
  </div>
  <div className="card">
    <div style={{fontSize:11,fontWeight:700,color:"#7a8faa",marginBottom:10}}>ALL FUNCTION ENTRIES — {funcYear}</div>
    <table>
      <thead><tr><th>Date</th><th>Engineer</th><th>Category</th><th>Hours</th><th>Description</th><th>Actions</th></tr></thead>
      <tbody>{yearFuncs.sort((a,b)=>b.date.localeCompare(a.date)).map(e=>{
        const eng=engineers.find(x=>x.id===e.engineer_id);
        const cat=e.function_category||e.task_type||"Other Function";
        return(<tr key={e.id}>
          <td style={{fontFamily:"'IBM Plex Mono',monospace",fontSize:10}}>{e.date}</td>
          <td style={{fontWeight:600,fontSize:10}}>{eng?.name||"?"}</td>
          <td><span style={{fontSize:9,padding:"2px 6px",borderRadius:3,background:(FUNC_COLORS[cat]||"#6b7280")+"20",color:FUNC_COLORS[cat]||"#6b7280",fontWeight:700}}>{cat}</span></td>
          <td style={{fontFamily:"'IBM Plex Mono',monospace",fontWeight:700,color:"#a78bfa"}}>{e.hours}h</td>
          <td style={{fontSize:10,color:"#4e6479",fontStyle:"italic",maxWidth:220}}>{e.activity||"—"}</td>
          <td>{isAdmin&&<button className="bd" style={{fontSize:10}} onClick={()=>deleteEntry(e.id,e.engineer_id)}>✕</button>}</td>
        </tr>);
      })}</tbody>
    </table>
  </div>
</div>
  );
}

/* ════════════════════════════════════════════════════════
   KPIs TAB — standalone component
   ════════════════════════════════════════════════════════ */
/* ── KPI rating helpers — module-level so JSX render can access them ── */
const kpiRatingLabel=s=>s<=40?"Under Performer":s<=75?"Competent":s<=95?"Performer":"High Performer";
const kpiRatingColor=s=>s<=40?"#f87171":s<=75?"#fb923c":s<=95?"#38bdf8":"#34d399";
const kpiRatingBg=   s=>s<=40?"#1a0808":s<=75?"#1c0f00":s<=95?"#001a2c":"#002414";

function KPIsTab({entries, engineers, projects, kpiYear, setKpiYear, kpiEngId, setKpiEngId, kpiNotes, setKpiNotes, isAdmin, year, notifications, alertDay, setAlertDay}){
  const yearEntries = useMemo(()=>entries.filter(e=>{const d=new Date(e.date+"T12:00:00");return d.getFullYear()===kpiYear;}),[entries,kpiYear]);
  const engKPIs = useMemo(()=>{
/* ── KPI CALCULATION GUIDE (shown in tooltips and detail view) ──
   A. UTILIZATION/EFFICIENCY 30%
      • Billable %   = hours on billable projects ÷ total hours × 100
      • BD/Sales     = Tender+Proposal+BD function hours (tracked, not scored separately)
      • Knowledge %  = Training+R&D function hours ÷ total hours × 100 (target ~10%)
      • Score formula: bill%×0.70 + (knowledge%/10×100)×0.20 + min(BD%×3,100)×0.10
   B. PROJECT PERFORMANCE 30%
      • Description rate = entries with activity notes ÷ total work entries × 100
      • Projects count   = distinct billable projects worked on
      • Doc hours        = Documentation & Reporting function hours
      • Score formula: descRate×0.50 + min(projects×10,100)×0.30 + min(docHrs×5,100)×0.20
   C. DEVELOPMENT GOAL 20%
      • Training given/received, Mentoring, R&D hours
      • Score formula: (trainRcv/8×100)×0.30 + (trainGiven/4×100)×0.25 + (mentoring/4×100)×0.25 + (rnd/4×100)×0.20
   D. COMPLIANCE GOAL 20%
      • Weekly submission rate = distinct weeks with entries ÷ weeks elapsed × 100
   TOTAL = A×0.30 + B×0.30 + C×0.20 + D×0.20
   BANDS: 0-40 Under Performer | 41-75 Competent | 76-95 Performer | 96-120 High Performer
*/

const computeKPI=eng=>{
  const myE=yearEntries.filter(e=>String(e.engineer_id)===String(eng.id));
  const workE=myE.filter(e=>e.entry_type==="work");
  const funcE=myE.filter(e=>(e.entry_type==="function"||e.task_category==="Function"));
  const leaveE=myE.filter(e=>e.entry_type==="leave");
  const totalWork=workE.reduce((s,e)=>s+e.hours,0);
  const totalFuncHrs=funcE.reduce((s,e)=>s+e.hours,0);
  const totalLeave=leaveE.length;
  const billWork=workE.filter(e=>{const p=projects.find(x=>x.id===e.project_id);return p&&p.billable;}).reduce((s,e)=>s+e.hours,0);
  const salesBD=funcE.filter(e=>(e.function_category||e.task_type||"").match(/Tender|Proposal|BD|Business/i)).reduce((s,e)=>s+e.hours,0);
  const knowledgeHrs=funcE.filter(e=>(e.function_category||e.task_type||"").match(/Training|Knowledge|R&D|Innovation/i)).reduce((s,e)=>s+e.hours,0);
  const totalHrs=(totalWork+totalFuncHrs)||1;
  const billPct=Math.round(billWork/totalHrs*100);
  const bdPct=Math.round(salesBD/totalHrs*100);
  const knowledgePct=Math.round(knowledgeHrs/totalHrs*100);
  const utilScore=Math.min(100,Math.round(Math.min(100,billPct)*0.70+Math.min(100,(knowledgePct/10)*100)*0.20+Math.min(100,bdPct*3)*0.10));
  const projsWorked=[...new Set(workE.map(e=>e.project_id).filter(Boolean))];
  const entriesWithDesc=workE.filter(e=>e.activity&&e.activity.trim().length>5).length;
  const descRate=workE.length>0?Math.round(entriesWithDesc/workE.length*100):0;
  const docHrs=funcE.filter(e=>(e.function_category||e.task_type||"").match(/Doc|Report/i)).reduce((s,e)=>s+e.hours,0);
  const projScore=Math.min(100,Math.round(descRate*0.50+Math.min(100,projsWorked.length*10)*0.30+Math.min(100,docHrs*5)*0.20));
  const trainingGiven=funcE.filter(e=>(e.function_category||e.task_type||"").includes("Given")).reduce((s,e)=>s+e.hours,0);
  const trainingReceived=funcE.filter(e=>(e.function_category||e.task_type||"").includes("Received")).reduce((s,e)=>s+e.hours,0);
  const mentoring=funcE.filter(e=>(e.function_category||e.task_type||"").match(/Mentor|Coach/i)).reduce((s,e)=>s+e.hours,0);
  const rnd=funcE.filter(e=>(e.function_category||e.task_type||"").match(/R&D|Innovation/i)).reduce((s,e)=>s+e.hours,0);
  const devScore=Math.min(100,Math.round(Math.min(100,(trainingReceived/8)*100)*0.30+Math.min(100,(trainingGiven/4)*100)*0.25+Math.min(100,(mentoring/4)*100)*0.25+Math.min(100,(rnd/4)*100)*0.20));
  const weeks=new Set(myE.filter(e=>e.entry_type==="work"||(e.entry_type==="function"||e.task_category==="Function")).map(e=>{
    const d=new Date(e.date+"T12:00:00");const dow=d.getDay();
    const mon=new Date(d);mon.setDate(d.getDate()-(dow===0?6:dow-1));
    return mon.toISOString().slice(0,10);
  }));
  const now2=new Date();const yearStart=new Date(kpiYear,0,1);
  const weeksElapsed=Math.max(1,Math.ceil((Math.min(now2,new Date(kpiYear,11,31))-yearStart)/(7*24*3600*1000)));
  const submissionRate=Math.min(100,Math.round(weeks.size/weeksElapsed*100));
  const complianceScore=submissionRate;
  const totalScore=Math.round(utilScore*0.30+projScore*0.30+devScore*0.20+complianceScore*0.20);
  return{eng,totalWork,billWork,billPct,bdPct,knowledgePct,totalLeave,totalFuncHrs,
    utilScore,projScore,devScore,complianceScore,totalScore,
    submissionRate,trainingGiven,trainingReceived,mentoring,rnd,salesBD,
    projsWorked:projsWorked.length,descRate,docHrs,
    weeks:weeks.size,weeksElapsed,funcE,workE,totalHrs};
};

const engKPIs=engineers.map(computeKPI).sort((a,b)=>b.totalScore-a.totalScore);

// Selected engineer for detail view
    return engKPIs;
  }, [entries, engineers, projects, kpiYear, yearEntries]);

  // Derived in component body so JSX render can access them
  const selKPI = kpiEngId ? engKPIs.find(k=>String(k.eng.id)===String(kpiEngId)) : null;


  const alertNotifs = (notifications||[]).filter(n=>n.type==="timesheet_alert"&&!n.read);

  return(
<div style={{display:"grid",gap:14}}>

  {/* Controls */}
  <div style={{display:"flex",gap:8,alignItems:"center",flexWrap:"wrap"}}>
    <select value={kpiYear} onChange={e=>setKpiYear(+e.target.value)}
      style={{background:"#0b1526",border:"1px solid #192d47",borderRadius:6,padding:"6px 10px",color:"#f0f6ff",fontSize:12}}>
      {[2024,2025,2026,2027].map(y=><option key={y}>{y}</option>)}
    </select>
    <select value={kpiEngId||""} onChange={e=>setKpiEngId(e.target.value||null)}
      style={{background:"#0b1526",border:"1px solid #192d47",borderRadius:6,padding:"6px 10px",color:"#f0f6ff",fontSize:12}}>
      <option value="">All Engineers (overview)</option>
      {engineers.map(e=><option key={e.id} value={e.id}>{e.name}</option>)}
    </select>
    <div style={{display:"flex",alignItems:"center",gap:6,background:"#060e1c",border:"1px solid #38bdf840",borderRadius:6,padding:"5px 10px"}}>
      <span style={{fontSize:9,color:"#2e4a66",textTransform:"uppercase"}}>Alert from</span>
      <select value={alertDay} onChange={e=>setAlertDay(+e.target.value)}
        style={{background:"transparent",border:"none",color:"#38bdf8",fontSize:12,fontFamily:"'IBM Plex Mono',monospace",fontWeight:700,outline:"none",cursor:"pointer"}}>
        {[["1","Monday"],["2","Tuesday"],["3","Wednesday"],["4","Thursday"],["5","Friday"]].map(([v,l])=><option key={v} value={+v}>{l}</option>)}
      </select>
    </div>
    {alertNotifs.length>0&&<span style={{background:"#450a0a",border:"1px solid #f87171",color:"#f87171",fontSize:10,fontWeight:700,padding:"4px 10px",borderRadius:6}}>⏰ {alertNotifs.length} alert{alertNotifs.length>1?"s":""}</span>}
  </div>

  {/* Rating legend */}
  <div style={{display:"flex",gap:8,flexWrap:"wrap",alignItems:"center"}}>
    {[["0–40","Under Performer","#f87171","#1a0808"],["41–75","Competent","#fb923c","#1c0f00"],["76–95","Performer","#38bdf8","#001a2c"],["96–120","High Performer","#34d399","#002414"]].map(([r,l,c,bg])=>(
      <div key={r} style={{display:"flex",alignItems:"center",gap:5,background:bg,border:`1px solid ${c}25`,borderRadius:6,padding:"4px 9px"}}>
        <div style={{width:7,height:7,borderRadius:2,background:c}}/>
        <span style={{fontSize:10,color:c,fontWeight:700}}>{r}</span>
        <span style={{fontSize:10,color:"#4e6479"}}>{l}</span>
      </div>
    ))}
    <span style={{fontSize:9,color:"#2e4a66"}}>Weights: Utilization 30% · Project Perf 30% · Development 20% · Compliance 20%</span>
  </div>

  {/* Delay alerts */}
  {alertNotifs.length>0&&(
  <div className="card" style={{borderColor:"#f8717130"}}>
    <div style={{fontSize:11,fontWeight:700,color:"#f87171",marginBottom:10}}>⏰ TIMESHEET DELAY ALERTS</div>
    <div style={{display:"grid",gap:6}}>
      {alertNotifs.map(n=>(
        <div key={n.id} style={{display:"flex",alignItems:"center",gap:10,background:"#1a0808",borderRadius:6,padding:"8px 12px"}}>
          <span style={{fontSize:10,color:"#f87171",flex:1}}>{n.message}</span>
          <span style={{fontSize:9,color:"#4e6479"}}>{new Date(n.created_at).toLocaleDateString("en-GB")}</span>
          <button className="bg" style={{fontSize:9,padding:"2px 6px"}} onClick={async()=>{
            await supabase.from("notifications").update({read:true}).eq("id",n.id);
            setNotifications(prev=>prev.map(x=>x.id===n.id?{...x,read:true}:x));
          }}>Dismiss</button>
        </div>
      ))}
    </div>
  </div>)}

  {/* ── Overview table (shown when no engineer selected) ── */}
  {!kpiEngId&&(
  <div className="card">
    <div style={{fontSize:11,fontWeight:700,color:"#7a8faa",marginBottom:12}}>ENGINEER KPI SCORECARD — {kpiYear}</div>
    <div style={{overflowX:"auto"}}>
    <table style={{minWidth:820}}>
      <thead>
        <tr style={{background:"#060e1c"}}>
          <th rowSpan={2}>Engineer</th>
          <th colSpan={3} style={{textAlign:"center",color:"#38bdf8",fontSize:9,borderBottom:"1px solid #0ea5e920"}}>A. Utilization 30%</th>
          <th colSpan={2} style={{textAlign:"center",color:"#a78bfa",fontSize:9,borderBottom:"1px solid #0ea5e920"}}>B. Project 30%</th>
          <th colSpan={2} style={{textAlign:"center",color:"#34d399",fontSize:9,borderBottom:"1px solid #0ea5e920"}}>C. Development 20%</th>
          <th style={{textAlign:"center",color:"#fb923c",fontSize:9,borderBottom:"1px solid #0ea5e920"}}>D. Compliance 20%</th>
          <th rowSpan={2} style={{textAlign:"center"}}>Score</th>
          <th rowSpan={2} style={{textAlign:"center"}}>Rating</th>
        </tr>
        <tr style={{background:"#060e1c"}}>
          <th style={{textAlign:"right",fontSize:8,color:"#2e4a66"}}>Bill%</th>
          <th style={{textAlign:"right",fontSize:8,color:"#2e4a66"}}>Know%</th>
          <th style={{textAlign:"right",fontSize:8,color:"#2e4a66"}}>Score</th>
          <th style={{textAlign:"right",fontSize:8,color:"#2e4a66"}}>Desc%</th>
          <th style={{textAlign:"right",fontSize:8,color:"#2e4a66"}}>Score</th>
          <th style={{textAlign:"right",fontSize:8,color:"#2e4a66"}}>Train↑</th>
          <th style={{textAlign:"right",fontSize:8,color:"#2e4a66"}}>Score</th>
          <th style={{textAlign:"right",fontSize:8,color:"#2e4a66"}}>Submit%</th>
        </tr>
      </thead>
      <tbody>{engKPIs.map((k,i)=>(
        <tr key={k.eng.id} onClick={()=>setKpiEngId(String(k.eng.id))} style={{cursor:"pointer"}}>
          <td><div style={{display:"flex",alignItems:"center",gap:6}}>
            <span style={{fontSize:10,fontWeight:700,color:"#2e4a66",minWidth:16}}>{i+1}</span>
            <div><div style={{fontWeight:700,fontSize:11}}>{k.eng.name}</div><div style={{fontSize:9,color:"#2e4a66"}}>{k.eng.role}</div></div>
          </div></td>
          <td style={{textAlign:"right",fontFamily:"'IBM Plex Mono',monospace",color:"#38bdf8",fontSize:10}}>{k.billPct}%</td>
          <td style={{textAlign:"right",fontFamily:"'IBM Plex Mono',monospace",color:k.knowledgePct>=8&&k.knowledgePct<=12?"#34d399":"#fb923c",fontSize:10}}>{k.knowledgePct}%</td>
          <td style={{textAlign:"right",fontFamily:"'IBM Plex Mono',monospace",fontWeight:700,color:kpiRatingColor(k.utilScore)}}>{k.utilScore}</td>
          <td style={{textAlign:"right",fontFamily:"'IBM Plex Mono',monospace",color:"#a78bfa",fontSize:10}}>{k.descRate}%</td>
          <td style={{textAlign:"right",fontFamily:"'IBM Plex Mono',monospace",fontWeight:700,color:kpiRatingColor(k.projScore)}}>{k.projScore}</td>
          <td style={{textAlign:"right",fontFamily:"'IBM Plex Mono',monospace",color:"#34d399",fontSize:10}}>{k.trainingGiven}h</td>
          <td style={{textAlign:"right",fontFamily:"'IBM Plex Mono',monospace",fontWeight:700,color:kpiRatingColor(k.devScore)}}>{k.devScore}</td>
          <td style={{textAlign:"right",fontFamily:"'IBM Plex Mono',monospace",fontWeight:700,color:k.submissionRate>=80?"#34d399":k.submissionRate>=60?"#fb923c":"#f87171"}}>{k.submissionRate}%</td>
          <td style={{textAlign:"center"}}>
            <div style={{display:"inline-flex",alignItems:"center",gap:5}}>
              <div style={{width:34,height:5,background:"#060e1c",borderRadius:3,overflow:"hidden"}}>
                <div style={{height:"100%",width:`${Math.min(100,k.totalScore)}%`,background:kpiRatingColor(k.totalScore),borderRadius:3}}/>
              </div>
              <span style={{fontFamily:"'IBM Plex Mono',monospace",fontWeight:700,color:kpiRatingColor(k.totalScore),fontSize:12}}>{k.totalScore}</span>
            </div>
          </td>
          <td><span style={{fontSize:9,padding:"2px 6px",borderRadius:4,background:kpiRatingBg(k.totalScore),color:kpiRatingColor(k.totalScore),fontWeight:700,whiteSpace:"nowrap"}}>{kpiRatingLabel(k.totalScore)}</span></td>
        </tr>
      ))}</tbody>
    </table>
    </div>
    <div style={{fontSize:9,color:"#2e4a66",marginTop:8}}>Click any row for full detail · Know% target is 8–12% (green)</div>
  </div>)}

  {/* ── Individual detail view ── */}
  {selKPI&&(()=>{
    const k=selKPI;
    const {eng}=k;
    const engNotes=kpiNotes[eng.id]||{A:"",B:"",C:"",D:"",general:""};
    const setNote=(field,val)=>setKpiNotes(prev=>({...prev,[eng.id]:{...(prev[eng.id]||{}),general:"",A:"",B:"",C:"",D:"",...(prev[eng.id]||{}),[field]:val}}));

    const monthlyData=["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"].map((mn,m)=>{
      const mWork=k.workE.filter(e=>new Date(e.date+"T12:00:00").getMonth()===m);
      const mFunc=k.funcE.filter(e=>new Date(e.date+"T12:00:00").getMonth()===m);
      const mLeave=yearEntries.filter(e=>String(e.engineer_id)===String(eng.id)&&e.entry_type==="leave"&&new Date(e.date+"T12:00:00").getMonth()===m);
      const wh=mWork.reduce((s,e)=>s+e.hours,0);
      const bh=mWork.filter(e=>{const p=projects.find(x=>x.id===e.project_id);return p&&p.billable;}).reduce((s,e)=>s+e.hours,0);
      const fh=mFunc.reduce((s,e)=>s+e.hours,0);
      const util=wh>0?Math.round(bh/(wh+fh||1)*100):0;
      return{mn,m,wh,bh,fh,util,leave:mLeave.length};
    });

    const criteria=[
      {id:"A",label:"Utilization / Efficiency",weight:"30%",score:k.utilScore,color:"#38bdf8",
       howCalc:"Score = Billable%×70% + (Knowledge%÷10×100)×20% + min(BD%×3,100)×10%",
       items:[
         {l:"Billable Utilization %",v:`${k.billPct}%`,calc:`${k.billWork}h billable ÷ ${k.totalHrs}h total`,target:"Maximize — hours on invoiced/contractual projects",color:"#38bdf8"},
         {l:"Sales Support / BD hours",v:`${k.salesBD}h`,calc:"Tender+Proposal+BD function entries",target:"Tracked only — proposals, BD & leadership meetings",color:"#0ea5e9"},
         {l:"Knowledge Capture %",v:`${k.knowledgePct}%`,calc:`${Math.round(k.knowledgePct/100*k.totalHrs)}h training+R&D ÷ ${k.totalHrs}h total`,target:"~10% — pre-planned, manager pre-approved",color:k.knowledgePct>=8&&k.knowledgePct<=12?"#34d399":"#fb923c"},
       ]},
      {id:"B",label:"Project Performance",weight:"30%",score:k.projScore,color:"#a78bfa",
       howCalc:"Score = DescriptionRate×50% + min(Projects×10,100)×30% + min(DocHours×5,100)×20%",
       items:[
         {l:"Entry Description Rate",v:`${k.descRate}%`,calc:`${Math.round(k.descRate/100*k.workE.length)} of ${k.workE.length} entries have activity notes`,target:"≥80% — quality of output & discipline indicator",color:k.descRate>=80?"#34d399":"#fb923c"},
         {l:"Projects worked on",v:k.projsWorked,calc:"Distinct billable projects this year",target:"Active across multiple projects",color:"#a78bfa"},
         {l:"Documentation hours",v:`${k.docHrs}h`,calc:"Documentation & Reporting function entries",target:"Lesson learned, closure docs, progress reports",color:"#f59e0b"},
       ]},
      {id:"C",label:"Development Goal",weight:"20%",score:k.devScore,color:"#34d399",
       howCalc:"Score = (TrainRcv÷8×100)×30% + (TrainGiven÷4×100)×25% + (Mentoring÷4×100)×25% + (R&D÷4×100)×20%",
       items:[
         {l:"Training received",v:`${k.trainingReceived}h`,calc:"Internal Training — Received function entries",target:"Personal development — certificates, skills",color:"#818cf8"},
         {l:"Training given (knowledge sharing)",v:`${k.trainingGiven}h`,calc:"Internal Training — Given function entries",target:"Leaders: contribution to team knowledge — target ≥4h",color:"#a78bfa"},
         {l:"Mentoring & coaching",v:`${k.mentoring}h`,calc:"Mentoring & Coaching function entries",target:"Leaders: people empowerment & delegation",color:"#34d399"},
         {l:"R&D & Innovation",v:`${k.rnd}h`,calc:"R&D & Innovation function entries",target:"Library of tools, models, work instructions",color:"#10b981"},
       ]},
      {id:"D",label:"Compliance Goal",weight:"20%",score:k.complianceScore,color:"#fb923c",
       howCalc:"Score = Weeks with entries ÷ Weeks elapsed in year × 100",
       items:[
         {l:"Weekly timesheet submission",v:`${k.submissionRate}%`,calc:`${k.weeks} weeks posted out of ${k.weeksElapsed} elapsed`,target:"100% — weekly entry is a core compliance KPI",color:k.submissionRate>=80?"#34d399":k.submissionRate>=60?"#fb923c":"#f87171"},
         {l:"Total work hours logged",v:`${k.totalWork}h`,calc:"All work-type entries this year",target:"Reflects activity & availability",color:"#7a8faa"},
         {l:"Leave days",v:`${k.totalLeave}d`,calc:"All leave-type entries this year",target:"Tracked — advance submission & approval expected",color:"#fb923c"},
       ]},
    ];

    return(
    <div className="card" style={{borderColor:"#0ea5e930"}}>
      {/* Header row */}
      <div style={{display:"flex",alignItems:"flex-start",gap:14,marginBottom:16,flexWrap:"wrap"}}>
        <div style={{flex:1}}>
          <div style={{fontSize:14,fontWeight:700,color:"#f0f6ff"}}>{eng.name}</div>
          <div style={{fontSize:10,color:"#2e4a66"}}>{eng.role} · KPI Year {kpiYear}</div>
        </div>
        <div style={{display:"flex",gap:10,alignItems:"center"}}>
          <div style={{textAlign:"center",background:kpiRatingBg(k.totalScore),border:`1px solid ${kpiRatingColor(k.totalScore)}30`,borderRadius:8,padding:"10px 18px"}}>
            <div style={{fontFamily:"'IBM Plex Mono',monospace",fontSize:32,fontWeight:700,color:kpiRatingColor(k.totalScore),lineHeight:1}}>{k.totalScore}</div>
            <div style={{fontSize:9,color:kpiRatingColor(k.totalScore),textTransform:"uppercase",letterSpacing:".06em",marginTop:4}}>{kpiRatingLabel(k.totalScore)}</div>
          </div>
          <button className="bg" style={{fontSize:10}} onClick={()=>setKpiEngId(null)}>✕ Back</button>
        </div>
      </div>

      {/* 4 criteria cards */}
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10,marginBottom:14}}>
        {criteria.map(c=>(
          <div key={c.id} style={{background:"#060e1c",borderRadius:8,padding:"12px 14px",border:`1px solid ${c.color}20`}}>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:4}}>
              <div><span style={{fontSize:9,fontWeight:700,color:c.color,background:c.color+"20",padding:"1px 6px",borderRadius:3,marginRight:5}}>{c.id} · {c.weight}</span><span style={{fontSize:10,fontWeight:700,color:"#f0f6ff"}}>{c.label}</span></div>
              <div style={{fontFamily:"'IBM Plex Mono',monospace",fontSize:18,fontWeight:700,color:kpiRatingColor(c.score)}}>{c.score}</div>
            </div>
            {/* How calculated */}
            <div style={{fontSize:9,color:"#2e4a66",fontStyle:"italic",marginBottom:6,padding:"3px 6px",background:"#0a1628",borderRadius:3}}>{c.howCalc}</div>
            <div style={{background:"#0b1526",borderRadius:3,height:5,overflow:"hidden",marginBottom:10}}>
              <div style={{height:"100%",width:`${Math.min(100,c.score)}%`,background:c.color,borderRadius:3}}/>
            </div>
            <div style={{display:"grid",gap:7}}>
              {c.items.map((item,ii)=>(
                <div key={ii} style={{borderTop:ii>0?"1px solid #0d1a2d":"none",paddingTop:ii>0?6:0}}>
                  <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",gap:6}}>
                    <div style={{flex:1}}>
                      <div style={{fontSize:10,color:"#7a8faa",fontWeight:600}}>{item.l}</div>
                      <div style={{fontSize:9,color:"#2e4a66",marginTop:1}}>{item.calc}</div>
                    </div>
                    <div style={{textAlign:"right",flexShrink:0}}>
                      <div style={{fontFamily:"'IBM Plex Mono',monospace",fontSize:12,fontWeight:700,color:item.color}}>{item.v}</div>
                    </div>
                  </div>
                  <div style={{fontSize:9,color:"#1e3a52",marginTop:2,fontStyle:"italic"}}>→ {item.target}</div>
                </div>
              ))}
            </div>
            {/* Manager note per criterion */}
            <div style={{marginTop:10,borderTop:"1px solid #0d1a2d",paddingTop:8}}>
              <div style={{fontSize:9,color:"#2e4a66",marginBottom:3}}>Manager note for {c.id}:</div>
              <textarea value={engNotes[c.id]||""} onChange={e=>setNote(c.id,e.target.value)}
                rows={2} placeholder={`Add note for ${c.label}…`}
                style={{width:"100%",background:"#0a1628",border:"1px solid #192d47",borderRadius:4,color:"#7a8faa",fontSize:10,padding:"4px 6px",resize:"vertical",fontFamily:"inherit",boxSizing:"border-box"}}/>
            </div>
          </div>
        ))}
      </div>

      {/* Monthly table */}
      <div style={{fontSize:11,fontWeight:700,color:"#7a8faa",marginBottom:8}}>MONTHLY ACTIVITY — {kpiYear}</div>
      <table style={{marginBottom:14}}>
        <thead><tr><th>Month</th><th style={{textAlign:"right"}}>Work Hrs</th><th style={{textAlign:"right"}}>Billable</th><th style={{textAlign:"right"}}>Util%</th><th style={{textAlign:"right"}}>Func Hrs</th><th style={{textAlign:"right"}}>Leave</th></tr></thead>
        <tbody>{monthlyData.map(row=>(
          <tr key={row.m}>
            <td style={{fontWeight:600}}>{row.mn} {kpiYear}</td>
            <td style={{textAlign:"right",fontFamily:"'IBM Plex Mono',monospace"}}>{row.wh||"—"}</td>
            <td style={{textAlign:"right",fontFamily:"'IBM Plex Mono',monospace",color:"#a78bfa"}}>{row.bh||"—"}</td>
            <td style={{textAlign:"right",fontFamily:"'IBM Plex Mono',monospace",color:row.util>=70?"#34d399":row.util>=50?"#fb923c":"#7a8faa"}}>{row.wh?row.util+"%":"—"}</td>
            <td style={{textAlign:"right",fontFamily:"'IBM Plex Mono',monospace",color:"#38bdf8"}}>{row.fh||"—"}</td>
            <td style={{textAlign:"right",fontFamily:"'IBM Plex Mono',monospace",color:"#fb923c"}}>{row.leave||"—"}</td>
          </tr>
        ))}</tbody>
      </table>

      {/* General manager note */}
      <div style={{marginBottom:14}}>
        <div style={{fontSize:11,fontWeight:700,color:"#7a8faa",marginBottom:6}}>GENERAL MANAGER NOTES / YEAR-END SUMMARY</div>
        <textarea value={engNotes.general||""} onChange={e=>setNote("general",e.target.value)}
          rows={4} placeholder="Overall performance summary, key achievements, areas for improvement, next year goals…"
          style={{width:"100%",background:"#060e1c",border:"1px solid #192d47",borderRadius:6,color:"#a0b4c8",fontSize:11,padding:"8px 10px",resize:"vertical",fontFamily:"inherit",boxSizing:"border-box"}}/>
        <div style={{fontSize:9,color:"#2e4a66",marginTop:4}}>Notes saved in-session — to persist, copy to the head office review form.</div>
      </div>

      {/* Improvement actions checklist */}
      <div style={{padding:"10px 12px",background:"#060e1c",borderRadius:6,border:"1px solid #192d47"}}>
        <div style={{fontSize:10,fontWeight:700,color:"#7a8faa",marginBottom:8}}>HEAD OFFICE IMPROVEMENT ACTIONS (Annual Form)</div>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:5}}>
          {["Process optimization","Training recommendation","Daily project monitoring","Regular one-to-one discussions","Other corrective measures"].map((a,i)=>(
            <div key={i} style={{display:"flex",gap:6,alignItems:"center",fontSize:10,color:"#4e6479"}}>
              <div style={{width:6,height:6,borderRadius:1,background:"#192d47",flexShrink:0}}/>
              {a}
            </div>
          ))}
        </div>
        <div style={{fontSize:9,color:"#2e4a66",marginTop:8,fontStyle:"italic"}}>📋 Use this data to fill the annual head office review form — scores, hours, and notes above feed directly into the 4 criteria.</div>
      </div>
    </div>);
  })()}
</div>
  );
}

export default function App(){
  const [session,setSession]         = useState(null);
  const [authLoading,setAuthLoading] = useState(true);
  const [authEmail,setAuthEmail]     = useState("");
  const [authPwd,setAuthPwd]         = useState("");
  const [authErr,setAuthErr]         = useState("");
  const [authMode,setAuthMode]       = useState("login");

  const [engineers,setEngineers]     = useState([]);
  const [projects,setProjects]       = useState([]);
  const [entries,setEntries]         = useState([]);
  const [notifications,setNotifications] = useState([]);
  const [myProfile,setMyProfile]     = useState(null);
  const [loading,setLoading]         = useState(false);

  const [view,setView]               = useState("dashboard");
  const [browseEngId,setBrowseEngId] = useState(null);
  const [weekOf,setWeekOf]           = useState(fmt(today));
  const [month,setMonth]             = useState(today.getMonth());
  const [year,setYear]               = useState(today.getFullYear());
  const [toast,setToast]             = useState(null);
  const [modalDate,setModalDate]     = useState(null);
  const [editEntry,setEditEntry]     = useState(null);
  const [clipboard,setClipboard]     = useState(null); // {date, entries:[]} for copy/paste
  const [activeRpt,setActiveRpt]     = useState("utilization");
  const [rptEngId,setRptEngId]       = useState(null); // for individual timesheet export
  const [invoiceProjId,setInvoiceProjId] = useState("ALL"); // ALL or specific project id
  const [pendingRoles,setPendingRoles]     = useState({}); // eng.id -> role_type pending save
  // Filters (shared across pages)
  const [filterEngineer,setFilterEngineer] = useState("ALL");
  const [filterProject,setFilterProject]   = useState("ALL");
  const [projSearch,setProjSearch]         = useState("");
  const [projStatusFilter,setProjStatusFilter] = useState("ALL");
  // Dashboard filters
  const [dashProjFilter,setDashProjFilter] = useState("ALL");
  // Multi-select for bulk delete
  const [selectedEntries,setSelectedEntries] = useState(new Set());
  // Import modal
  const [showImport,setShowImport]         = useState(false);
  const [importFiles,setImportFiles]       = useState([]);
  const [importLog,setImportLog]           = useState([]);
  const [importing,setImporting]           = useState(false);
  const [xlsxReady,setXlsxReady]           = useState(!!window.XLSX);
  const [showProjModal,setShowProjModal]   = useState(false);
  const [editProjModal,setEditProjModal]   = useState(null);
  const [subProjModal,setSubProjModal]     = useState(null);  // {projectId, sub?} — add/edit sub-project
  const [expandedProj,setExpandedProj]     = useState({});    // {projId: bool} — show sub-projects in table
  const [showEngModal,setShowEngModal]     = useState(false);
  const [editEngModal,setEditEngModal]     = useState(null);
  const [adminTab,setAdminTab]             = useState("engineers");
  const [kpiYear,setKpiYear]               = useState(new Date().getFullYear());
  const [alertDay,setAlertDay]             = useState(5); // 1=Mon,2=Tue,3=Wed,4=Thu,5=Fri
  const [funcYear,setFuncYear]             = useState(new Date().getFullYear());
  const [funcEngId,setFuncEngId]           = useState("all");
  const [kpiEngId,setKpiEngId]            = useState(null);
  const [kpiNotes,setKpiNotes]             = useState({}); // {engId: {A:"",B:"",C:"",D:"",general:""}}
  const [activities,setActivities]         = useState([]);
  const [subprojects,setSubprojects]       = useState([]);
  const [activitiesLoaded,setActivitiesLoaded] = useState(false);

  const [showFuncModal,setShowFuncModal]   = useState(false);
  const [newFunc,setNewFunc]               = useState({engineer_id:"",date:new Date().toISOString().slice(0,10),function_category:FUNCTION_CATS[0],hours:2,activity:""});

  // ── Finance Module State ──
  const [staff,setStaff]                   = useState([]);
  const [expenses,setExpenses]             = useState([]);
  const [finTab,setFinTab]                 = useState("pl");        // pl | salaries | expenses
  const [egpRate,setEgpRate]               = useState(50);          // EGP per 1 USD exchange rate
  const [finMonth,setFinMonth]             = useState(new Date().getMonth());
  const [finYear,setFinYear]               = useState(new Date().getFullYear());
  const [showStaffModal,setShowStaffModal] = useState(false);
  const [editStaff,setEditStaff]           = useState(null);
  const [showExpModal,setShowExpModal]     = useState(false);
  const [editExp,setEditExp]               = useState(null);
  const [newStaff,setNewStaff]             = useState({name:"",department:"Engineering",role:"Engineering Manager",salary_usd:0,salary_egp:0,type:"full_time",active:true,join_date:"",termination_date:"",notes:""});
  const [newExp,setNewExp]                 = useState({category:"Office Rent & Utilities",description:"",amount_usd:0,amount_egp:0,month:new Date().getMonth(),year:new Date().getFullYear(),notes:""});
  const [entryFilter,setEntryFilter]       = useState({engineer:"ALL",project:"ALL",month:today.getMonth(),year:today.getFullYear()});
  const [newEntry,setNewEntry]   = useState({projectId:"",_group:"SCADA",taskCategory:"Templates",taskType:"Block Template",hours:8,activity:"",type:"work",leaveType:LEAVE_TYPES[0],activityId:null,_actCat:null,_actSub:null,_step:1});
  const [newProj,setNewProj]     = useState({id:"",name:"",type:"Renewable Energy",client:"",origin:"Romania HQ",phase:"Design",billable:true,rate_per_hour:85,status:"Active"});
  const [newEng,setNewEng]       = useState({name:"",role:ROLES_LIST[0],level:"Mid",email:"",role_type:"engineer",weekend_days:JSON.stringify(DEFAULT_WEEKEND)});

  const showToast=(msg,ok=true)=>{setToast({msg,ok});setTimeout(()=>setToast(null),3500);};

  // My personal weekend setting (from my engineer profile, falls back to default)
  const myWeekend = useMemo(()=>{
    try{ return myProfile?.weekend_days?JSON.parse(myProfile.weekend_days):DEFAULT_WEEKEND; }
    catch{ return DEFAULT_WEEKEND; }
  },[myProfile]);

  const weekDays   = useMemo(()=>getWeekDays7(weekOf),[weekOf]);
  const targetHrs  = useMemo(()=>getTargetHrs(year,month,myWeekend),[year,month,myWeekend]);

  // Role helpers
  const role      = myProfile?.role_type||"engineer";
  const isAdmin   = role==="admin";
  const isLead    = role==="lead"||role==="admin";
  const isAcct    = role==="accountant"||role==="admin";
  const canEditAny= isLead; // admin + lead can edit any engineer's entries
  const canEdit   = true;   // everyone can edit/delete their own entries
  const canReport = isLead||isAcct; // admin + lead + accountant can see reports
  const canInvoice= isAcct; // admin + accountant can see invoices

  const viewEngId = canEditAny ? (browseEngId||myProfile?.id) : myProfile?.id;
  const viewEng   = engineers.find(e=>e.id===viewEngId);

  /* ── AUTH ── */
  useEffect(()=>{
    supabase.auth.getSession().then(({data:{session}})=>{setSession(session);setAuthLoading(false);});
    const {data:{subscription}}=supabase.auth.onAuthStateChange((_,s)=>setSession(s));
    return ()=>subscription.unsubscribe();
  },[]);
  useEffect(()=>{if(session)loadAll();},[session]);
  // Load SheetJS once on mount
  useEffect(()=>{
    if(window.XLSX){setXlsxReady(true);return;}
    const s=document.createElement("script");
    s.src="https://cdnjs.cloudflare.com/ajax/libs/xlsx/0.18.5/xlsx.full.min.js";
    s.onload=()=>{setXlsxReady(true);};
    s.onerror=()=>console.error("Failed to load SheetJS");
    document.head.appendChild(s);
  },[]);

  const loadAll=useCallback(async()=>{
    setLoading(true);
    try{
      const [engsR,projR,entrR,profR,notifR]=await Promise.all([
        supabase.from("engineers").select("*").order("name"),
        supabase.from("projects").select("*").order("id"),
        supabase.from("time_entries").select("*").order("date",{ascending:false}),
        supabase.from("engineers").select("*").eq("user_id",session.user.id).single(),
        supabase.from("notifications").select("*").order("created_at",{ascending:false}).limit(50),
        supabase.from("staff").select("*").order("name"),
        supabase.from("expenses").select("*").order("year",{ascending:false}).order("month",{ascending:false}),
      ]);
      if(engsR.data) setEngineers(engsR.data);
      if(projR.data) setProjects(projR.data);
      if(entrR.data) setEntries(entrR.data);
      // Load finance tables
      const [staffRes,expRes]=await Promise.all([
        supabase.from("staff").select("*").order("name"),
        supabase.from("expenses").select("*").order("year",{ascending:false}),
      ]);
      if(staffRes.data) setStaff(staffRes.data);
      if(expRes.data)   setExpenses(expRes.data);
      if(profR.data){ setMyProfile(profR.data); setBrowseEngId(profR.data.id); }
      if(notifR.data) setNotifications(notifR.data);
      // Trigger timesheet delay alerts after data loads
      if(engsR.data&&entrR.data) setTimeout(()=>checkTimesheetAlerts(engsR.data,entrR.data),1500);
    }catch(e){showToast("Error loading data",false);}
    setLoading(false);
  },[session]);

  // Load activities + subprojects lazily when tracker tab is first visited
  const loadTrackerData=useCallback(async()=>{
    if(activitiesLoaded) return;
    try{
      const [spRes,actRes]=await Promise.all([
        supabase.from("project_subprojects").select("*").order("name"),
        supabase.from("project_activities").select("*").order("sort_order"),
      ]);
      if(spRes.data)  setSubprojects(spRes.data);
      if(actRes.data) setActivities(actRes.data);
      setActivitiesLoaded(true);
    }catch(e){ showToast("Tracker tables not yet migrated — run SQL from Settings",false); }
  },[activitiesLoaded,showToast]);

  const handleLogin=async e=>{
    e.preventDefault(); setAuthErr("");
    const {error}=await supabase.auth.signInWithPassword({email:authEmail,password:authPwd});
    if(error) setAuthErr(error.message);
  };
  const handleLogout=async()=>{
    await supabase.auth.signOut();
    setSession(null);setEngineers([]);setProjects([]);setEntries([]);setMyProfile(null);setStaff([]);setExpenses([]);
  };

  // Load tracker data once when tracker tab is first opened
  useEffect(()=>{
    if(adminTab==="tracker"&&session&&!activitiesLoaded){ loadTrackerData(); }
  },[adminTab,session,activitiesLoaded,loadTrackerData]);

  const unreadCount=notifications.filter(n=>!n.read).length;
  const markAllRead=async()=>{
    await supabase.from("notifications").update({read:true}).eq("read",false);
    setNotifications(prev=>prev.map(n=>({...n,read:true})));
  };

  /* ── WEEKEND SAVE (per user) ── */
  const saveMyWeekend=async days=>{
    await supabase.from("engineers").update({weekend_days:JSON.stringify(days)}).eq("id",myProfile.id);
    setMyProfile(p=>({...p,weekend_days:JSON.stringify(days)}));
    showToast("Weekend preference saved ✓");
  };

  /* ── ADD ENTRY ── */
  const addEntry=async date=>{
    if(!isDateAllowed(date)){showToast("Cannot post hours outside the allowed date range",false);return;}
    const proj=projects.find(p=>p.id===newEntry.projectId);
    const engId=canEditAny?viewEngId:myProfile.id;
    const isFunc=newEntry.type==="function";
    const isLeave=newEntry.type==="leave";
    const funcCat=isFunc?(newEntry.taskType||newEntry.function_category||FUNCTION_CATS[0]):null;
    const basePayload={
      engineer_id:engId,
      project_id: (isLeave||isFunc)?null:newEntry.projectId,
      date,
      task_category:(isLeave)?null:isFunc?"Function":(newEntry._group||newEntry.taskCategory),
      task_type:   (isLeave)?null:isFunc?funcCat:(newEntry.taskCategory||newEntry.taskType),
      hours:       isLeave?8:+newEntry.hours,
      activity:    newEntry.activity,
      entry_type:  (newEntry.type==="function")?"work":newEntry.type,
      leave_type:  isLeave?newEntry.leaveType:null,
      billable:    !isLeave&&!isFunc&&(projects.find(p=>p.id===newEntry.projectId)?.billable||false),
      activity_id: actId,
    };
    const actId=(!isLeave&&!isFunc&&newEntry.activityId)?newEntry.activityId:null;
    // Try with function_category col; auto-fallback if migration not yet run
    let {data,error}=await supabase.from("time_entries")
      .insert(isFunc?{...basePayload,function_category:funcCat}:basePayload)
      .select().single();
    if(error&&error.message?.includes("function_category")){
      const res=await supabase.from("time_entries").insert(basePayload).select().single();
      data=res.data; error=res.error;
    }
    if(error){showToast("Error: "+error.message,false);return;}
    if(data) setEntries(prev=>[data,...prev]);
    setModalDate(null);
    setNewEntry({projectId:"",_group:"SCADA",taskCategory:"Templates",taskType:"Block Template",hours:8,activity:"",type:"work",leaveType:LEAVE_TYPES[0],activityId:null,_actCat:null,_actSub:null,_step:1});
    showToast("Hours posted ✓");
  };


  /* ── Copy a day's entries to clipboard ── */
  const copyDay = date => {
    const dayEntries = entries.filter(e=>e.date===date&&e.engineer_id===(canEditAny?viewEngId:myProfile.id));
    if(!dayEntries.length){showToast("No entries to copy",false);return;}
    setClipboard({date, entries:dayEntries});
    showToast(`Copied ${dayEntries.length} entr${dayEntries.length===1?"y":"ies"} from ${date} ✓`);
  };

  /* ── Paste clipboard entries to target date ── */
  const pasteDay = async targetDate => {
    if(!clipboard||!clipboard.entries.length){showToast("Nothing in clipboard",false);return;}
    if(!isDateAllowed(targetDate)){showToast("Cannot post to locked date",false);return;}
    const engId = canEditAny?viewEngId:myProfile.id;
    const inserts = clipboard.entries.map(e=>({
      engineer_id: engId,
      project_id:  e.project_id,
      date:        targetDate,
      task_category: e.task_category,
      task_type:   e.task_type,
      hours:       e.hours,
      activity:    e.activity,
      entry_type:  e.entry_type,
      leave_type:  e.leave_type||null,
      billable:    e.billable||false,
      activity_id: e.activity_id||null,
      function_category: e.function_category||null,
    }));
    const {data,error}=await supabase.from("time_entries").insert(inserts).select();
    if(error){showToast("Paste error: "+error.message,false);return;}
    if(data) setEntries(prev=>[...data,...prev]);
    showToast(`Pasted ${inserts.length} entr${inserts.length===1?"y":"ies"} to ${targetDate} ✓`);
  };

  const saveEditEntry=async()=>{
    if(!editEntry) return;
    if(!canEditAny && String(editEntry.engineer_id)!==String(myProfile?.id)) { showToast("You can only edit your own entries",false); return; }
    const proj=projects.find(p=>p.id===editEntry.projectId);
    // Support both camelCase (from modal) and snake_case (from DB) field names
    const taskCat = editEntry.taskCategory || editEntry.task_category || "Engineering";
    const taskTyp = editEntry.taskType || editEntry.task_type || "Basic Engineering";
    const lvType  = editEntry.leaveType || editEntry.leave_type || "Annual Leave";
    const payload={
      project_id:   editEntry.type==="leave"?null:editEntry.projectId,
      task_category:editEntry.type==="leave"?null:taskCat,
      task_type:    editEntry.type==="leave"?null:taskTyp,
      hours:        +editEntry.hours,
      activity:     editEntry.activity||"",
      entry_type:   (editEntry.type==="function")?"work":editEntry.type,
      leave_type:   editEntry.type==="leave"?lvType:null,
      billable:     editEntry.type==="leave"?false:(proj?.billable||false),
      date:         editEntry.date,
    };
    const {data:updArr,error}=await supabase.from("time_entries").update(payload).eq("id",editEntry.id).select();
    if(error){showToast("Error: "+error.message,false);return;}
    const upd=Array.isArray(updArr)?updArr[0]:updArr;
    if(upd) setEntries(prev=>prev.map(e=>e.id===upd.id?upd:e));
    else setEntries(prev=>prev.map(e=>e.id===editEntry.id?{...e,...payload}:e));
    setEditEntry(null); showToast("Entry updated ✓");
  };

  const deleteEntry=async(id, engineerId)=>{
    if(!canEditAny && String(engineerId)!==String(myProfile?.id)) { showToast("You can only delete your own entries",false); return; }
    if(!window.confirm("Delete this entry?")) return;
    const {error}=await supabase.from("time_entries").delete().eq("id",id);
    if(error){showToast("Error",false);return;}
    setEntries(prev=>prev.filter(e=>e.id!==id));
    showToast("Deleted",false);
  };

  /* ── FUNCTION ENTRIES & KPI ALERTS ── */
  const addFunctionEntry=useCallback(async()=>{
    if(!newFunc.engineer_id){showToast("Select an engineer",false);return;}
    if(!newFunc.hours||newFunc.hours<=0){showToast("Enter hours > 0",false);return;}
    // function_category column requires SQL migration — try with it, fallback without
    const basePayload={
      engineer_id:newFunc.engineer_id,
      project_id:null,
      date:newFunc.date,
      task_category:"Function",
      task_type:newFunc.function_category,
      hours:+newFunc.hours,
      activity:newFunc.activity,
      entry_type:"work", // stored as work; identified by task_category="Function"
      leave_type:null,
      billable:false,
    };
    // Try with function_category column; auto-fallback if column not yet migrated
    let {data,error}=await supabase.from("time_entries")
      .insert({...basePayload,function_category:newFunc.function_category})
      .select().single();
    if(error&&error.message&&error.message.includes("function_category")){
      const res=await supabase.from("time_entries").insert(basePayload).select().single();
      data=res.data; error=res.error;
    }
    if(error){showToast("Error: "+error.message,false);return;}
    if(data) setEntries(prev=>[data,...prev]);
    showToast("Function hours posted ✓");
    setShowFuncModal(false);
    setNewFunc({engineer_id:"",date:new Date().toISOString().slice(0,10),function_category:FUNCTION_CATS[0],hours:2,activity:""});
  },[newFunc,showToast]);

  // Check for engineers who haven't posted hours by Friday — only alerts on Fri/Sat/Sun
  const checkTimesheetAlerts=useCallback(async(engs,allE)=>{
    if(!isAdmin&&!isLead) return;
    const today=new Date();
    const dayOfWeek=today.getDay(); // 0=Sun,1=Mon,...,5=Fri,6=Sat
    // Only alert from the configured alertDay onwards through Sunday
    const isEndOfWeek=dayOfWeek===0||(dayOfWeek>=alertDay&&dayOfWeek<=6);
    if(!isEndOfWeek) return;
    // Get Monday of current week
    const mondayOffset=dayOfWeek===0?-6:1-dayOfWeek;
    const weekStart=new Date(today);weekStart.setDate(today.getDate()+mondayOffset);weekStart.setHours(0,0,0,0);
    // Friday of current week
    const friday=new Date(weekStart);friday.setDate(weekStart.getDate()+4);
    const weekStartStr=weekStart.toISOString().slice(0,10);
    const fridayStr=friday.toISOString().slice(0,10);
    const todayStr=today.toISOString().slice(0,10);

    const laggards=[];
    engs.forEach(eng=>{
      if(eng.role_type==="accountant") return; // skip non-engineers
      // Any work or function entry Mon→Fri this week?
      const hasWeekHours=allE.some(e=>String(e.engineer_id)===String(eng.id)&&e.date>=weekStartStr&&e.date<=fridayStr&&(e.entry_type==="work"||(e.entry_type==="function"||e.task_category==="Function")));
      if(!hasWeekHours) laggards.push({eng,type:"weekly",label:`No hours posted this week (Mon ${weekStartStr} → Fri ${fridayStr})`});
    });

    // Post notifications for new alerts
    for(const{eng,type,label}of laggards){
      const key=`timesheet_alert_${eng.id}_${type}_${weekStartStr}`;
      const exists=await supabase.from("notifications").select("id").eq("meta->>alert_key",key).single();
      if(exists.error){ // doesn't exist yet
        await supabase.from("notifications").insert({
          type:"timesheet_alert",
          message:`⏰ ${eng.name}: ${label}`,
          meta:JSON.stringify({engineer_id:eng.id,alert_key:key,alert_type:type}),
          read:false
        });
      }
    }
  },[isAdmin,isLead,alertDay]);

  /* ── FINANCE CRUD ── */
  const STAFF_DEPTS=["Engineering","Management","Finance","Operations","IT","Administration","Other"];
  const STAFF_TYPES=["full_time","part_time","contractor","intern"];
  const EXP_CATS=["Office Rent & Utilities","Salaries","Software & Subscriptions","Travel & Transportation","Equipment & Supplies","Other"];

  const saveStaff=useCallback(async()=>{
    const raw=editStaff?{...editStaff}:{...newStaff};
    if(!raw.name.trim()){showToast("Name required",false);return;}
    // Postgres rejects empty string for date columns — convert to null
    const payload={...raw,
      join_date:        raw.join_date||null,
      termination_date: raw.termination_date||null,
    };
    if(editStaff){
      const{data,error}=await supabase.from("staff").update(payload).eq("id",editStaff.id).select().single();
      if(!error&&data){setStaff(prev=>prev.map(s=>s.id===data.id?data:s));showToast("Staff updated");setEditStaff(null);setShowStaffModal(false);}
      else showToast(error?.message||"Error",false);
    } else {
      const{data,error}=await supabase.from("staff").insert(payload).select().single();
      if(!error&&data){setStaff(prev=>[...prev,data].sort((a,b)=>a.name.localeCompare(b.name)));showToast("Staff added");setShowStaffModal(false);setNewStaff({name:"",department:"Engineering",role:"Engineering Manager",salary_usd:0,salary_egp:0,type:"full_time",active:true,join_date:"",termination_date:"",notes:""});}
      else showToast(error?.message||"Error",false);
    }
  },[editStaff,newStaff,showToast]);

  const deleteStaff=useCallback(async(id)=>{
    if(!window.confirm("Delete this staff member?")) return;
    await supabase.from("staff").delete().eq("id",id);
    setStaff(prev=>prev.filter(s=>s.id!==id));
  },[]);

  const saveExpense=useCallback(async()=>{
    const payload=editExp?{...editExp}:{...newExp};
    if(!payload.description.trim()){showToast("Description required",false);return;}
    if(editExp){
      const{data,error}=await supabase.from("expenses").update(payload).eq("id",editExp.id).select().single();
      if(!error&&data){setExpenses(prev=>prev.map(e=>e.id===data.id?data:e));showToast("Expense updated");setEditExp(null);setShowExpModal(false);}
      else showToast(error?.message||"Error",false);
    } else {
      const{data,error}=await supabase.from("expenses").insert(payload).select().single();
      if(!error&&data){setExpenses(prev=>[data,...prev]);showToast("Expense added");setShowExpModal(false);setNewExp({category:"Office Rent & Utilities",description:"",amount_usd:0,amount_egp:0,month:new Date().getMonth(),year:new Date().getFullYear(),notes:""});}
      else showToast(error?.message||"Error",false);
    }
  },[editExp,newExp,showToast]);

  const deleteExpense=useCallback(async(id)=>{
    if(!window.confirm("Delete this expense?")) return;
    await supabase.from("expenses").delete().eq("id",id);
    setExpenses(prev=>prev.filter(e=>e.id!==id));
  },[]);

  /* ── EXCEL IMPORT ── */
  const importTimesheets=async files=>{
    setImporting(true);
    setImportLog([]);
    const log=[];
    const addLog=(type,msg)=>{log.push({type,msg});setImportLog([...log]);};

    // Working copies of projects/engineers (updated during import as new ones are created)
    let localProjects=[...projects];
    let localEngineers=[...engineers];

    // Cache of name→project to avoid duplicate inserts across rows
    const projCache={};
    const findOrCreateProject=async(rawName)=>{
      const clean=rawName.trim().replace(/\s+/g," ");
      const cleanLower=clean.toLowerCase();
      // Return from cache first (handles failed inserts too)
      if(projCache[cleanLower]!==undefined) return projCache[cleanLower];
      // Match against existing DB projects
      let proj=localProjects.find(p=>
        p.name.toLowerCase()===cleanLower||
        p.id.toLowerCase()===cleanLower||
        p.name.toLowerCase().replace(/\s+/g," ")===cleanLower||
        cleanLower.includes(p.name.toLowerCase().replace(/\s+/g," "))
      );
      if(proj){ projCache[cleanLower]=proj; return proj; }
      // Auto-create — use "Industrial" type (matches DB constraint)
      // Make a safe ID: alphanumeric + hyphens only, max 30 chars
      const projId=clean.replace(/[^a-zA-Z0-9]/g,"-").replace(/-+/g,"-").replace(/^-|-$/g,"").substring(0,30);
      addLog("info",`    📁 Creating project: ${clean}`);
      const {data:newPArr,error:pErr}=await supabase.from("projects").insert({
        id:projId, name:clean, client:"(imported)", type:"Industrial",
        status:"Active", phase:"Design", billable:true, rate_per_hour:0,
      }).select();
      if(pErr){
        addLog("warn",`    ⚠ Project failed: ${pErr.message}`);
        projCache[cleanLower]=null; // cache failure to avoid retrying every row
        return null;
      }
      const newP=Array.isArray(newPArr)?newPArr[0]:newPArr;
      if(!newP){ projCache[cleanLower]=null; return null; }
      localProjects=[...localProjects,newP];
      setProjects(prev=>[...prev,newP].sort((a,b)=>a.id.localeCompare(b.id)));
      addLog("ok",`    ✓ Project created: ${clean} (${projId})`);
      projCache[cleanLower]=newP;
      return newP;
    };

    for(const file of files){
      addLog("info",`📂 Processing: ${file.name}`);
      try{
        const buf=await file.arrayBuffer();
        const XLSX=window.XLSX;
        if(!XLSX){addLog("error","SheetJS not loaded — go back and wait for ✓ XLSX READY, then try again");break;}
        const wb=XLSX.read(new Uint8Array(buf),{type:"array",cellDates:true});
        const ws=wb.Sheets[wb.SheetNames[0]];
        const rows=XLSX.utils.sheet_to_json(ws,{header:1,defval:"",raw:true});


        // ── FIX: Detect column layout — standard (col 0) vs shifted (col 4, Shehab-style) ──
        // Standard: row[0]=Date/Name, row[1]=email value, row[2]=task...
        // Shifted:  row[4]=Name label, row[5]=Name value, row[6]=task...
        let colOffset=0;
        const r0=String(rows[0]?.[0]||"").trim().toLowerCase();
        const r0c4=String(rows[0]?.[4]||"").trim().toLowerCase();
        if(!r0&&r0c4==="name"){ colOffset=4; addLog("info","  ℹ Shifted column layout detected (offset +4)"); }

        // Parse header (row 0=Name, row 1=Email, row 2=Month)
        const engName=String(rows[0]?.[colOffset+1]||"").trim();
        const engEmail=String(rows[1]?.[colOffset+1]||"").trim().toLowerCase();
        const engRole=String(rows[0]?.[colOffset+4]||"").trim();

        if(!engName||!engEmail){addLog("error","  ✕ Missing name/email in header rows");continue;}
        addLog("info",`  👤 ${engName} <${engEmail}>`);

        // Find or create engineer
        let eng=localEngineers.find(e=>(e.email||"").toLowerCase()===engEmail);
        if(!eng){
          const {data:eArr,error:eErr}=await supabase.from("engineers").insert({
            name:engName,email:engEmail,
            role:engRole||"Automation Engineer",
            level:"Mid",role_type:"engineer",
            weekend_days:JSON.stringify([5,6])
          }).select();
          if(eErr){addLog("error",`  ✕ Engineer failed: ${eErr.message}`);continue;}
          eng=Array.isArray(eArr)?eArr[0]:eArr;
          if(!eng){addLog("error","  ✕ Engineer insert returned no data");continue;}
          localEngineers=[...localEngineers,eng];
          setEngineers(prev=>[...prev,eng].sort((a,b)=>a.name.localeCompare(b.name)));
          addLog("ok",`  ✓ Created engineer: ${engName}`);
        } else {
          addLog("info",`  → Existing engineer: ${eng.name}`);
        }

        // ── LOCAL DATE HELPER: always use local year/month/day, never toISOString() ──
        // SheetJS cellDates:true returns Date at local midnight — toISOString() shifts in UTC+ zones
        const localDateStr=(d)=>{
          // Add 12 hours then use UTC methods — handles SheetJS storing local midnight as UTC
          // e.g. Egypt UTC+2: "2026-02-01 local" stored as "2026-01-31T22:00Z"
          // +12h → "2026-02-01T10:00Z" → getUTCFullYear/Month/Date = 2026/1/1 = Feb 1 ✓
          const shifted=new Date(d.getTime()+12*3600*1000);
          const yy=shifted.getUTCFullYear();
          const mm=String(shifted.getUTCMonth()+1).padStart(2,"0");
          const dd=String(shifted.getUTCDate()).padStart(2,"0");
          return `${yy}-${mm}-${dd}`;
        };
        const parseCellDate=(raw)=>{
          // Use duck typing for Date (instanceof fails cross-frame in some browsers)
          if(raw&&typeof raw==="object"&&typeof raw.getFullYear==="function") return localDateStr(raw);
          if(typeof raw==="number"&&raw>40000) return localDateStr(new Date(Math.round((raw-25569)*86400*1000)));
          if(typeof raw==="string"){
            const m=raw.match(/(\d{4})-(\d{2})-(\d{2})/);
            if(m) return raw.slice(0,10);
            const parts=raw.split(/[/\-]/);
            if(parts.length===3){
              const y=parts[0].length===4?parts[0]:parts[2];
              const mo=parts[0].length===4?parts[1]:parts[1];
              const da=parts[0].length===4?parts[2]:parts[0];
              return `${y}-${mo.padStart(2,"0")}-${da.padStart(2,"0")}`;
            }
          }
          return "";
        };

        // ── DETECT IMPORT MONTH ──
        // SheetJS with cellDates:true + raw:true returns date cells as Date objects OR serial numbers
        // depending on browser/version. Handle all cases explicitly.
        // Strategy: try every possible representation of the Month cell and all early data rows.
        let importYear=year, importMonth=month;

        const extractYearMonth=(raw)=>{
          if(!raw) return null;
          // SheetJS stores date cells as UTC midnight of the LOCAL date
          // e.g. Egypt UTC+2: Feb 1 00:00 local = Jan 31 22:00 UTC
          // getMonth() on this UTC date returns January — WRONG
          // Fix: add 12 hours before reading so we safely land in the correct UTC day
          if(typeof raw==="object"&&raw!==null&&typeof raw.getFullYear==="function"){
            const shifted=new Date(raw.getTime()+12*3600*1000);
            const y=shifted.getUTCFullYear(), m=shifted.getUTCMonth();
            if(y>2000&&y<2100&&m>=0&&m<=11) return {y,m};
          }
          // Excel serial number
          if(typeof raw==="number"&&raw>40000&&raw<100000){
            const d=new Date(Math.round((raw-25569)*86400*1000)+12*3600*1000);
            const y=d.getUTCFullYear(), m=d.getUTCMonth();
            if(y>2000&&y<2100&&m>=0&&m<=11) return {y,m};
          }
          // ISO string "2026-02-01"
          if(typeof raw==="string"){
            const match=raw.match(/(\d{4})-(\d{2})/);
            if(match){const y=+match[1],m=+match[2]-1;if(y>2000&&y<2100&&m>=0&&m<=11)return{y,m};}
          }
          return null;
        };

        // Try Month cell first (rows[2] col B for standard, col F for shifted)
        const monthCellResult=extractYearMonth(rows[2]?.[colOffset+1]);
        if(monthCellResult){ importYear=monthCellResult.y; importMonth=monthCellResult.m; }
        else {
          // Fallback: scan data rows 4-11
          for(let ri=4;ri<Math.min(rows.length,12);ri++){
            const r=extractYearMonth(rows[ri]?.[colOffset]);
            if(r){ importYear=r.y; importMonth=r.m; break; }
          }
        }
        const yrStr=String(importYear);
        const moStr=String(importMonth+1).padStart(2,"0");
        const monthStart=`${yrStr}-${moStr}-01`;
        const lastDay=new Date(importYear,importMonth+1,0).getDate();
        const monthEnd=`${yrStr}-${moStr}-${String(lastDay).padStart(2,"0")}`;
        addLog("info",`  📅 Month: ${moStr}/${yrStr} (${monthStart} → ${monthEnd})`);

        // Delete existing entries for this engineer+month
        const {data:existingRows,error:fetchErr}=await supabase
          .from("time_entries").select("id")
          .eq("engineer_id",eng.id).gte("date",monthStart).lte("date",monthEnd);
        if(fetchErr){
          addLog("warn",`  ⚠ Fetch error: ${fetchErr.message}`);
        } else {
          addLog("info",`  🔍 Found ${existingRows?.length||0} existing entries`);
          if(existingRows&&existingRows.length>0){
            const ids=existingRows.map(r=>r.id);
            const {error:delErr}=await supabase.from("time_entries").delete().in("id",ids);
            if(delErr) addLog("warn",`  ⚠ Delete failed: ${delErr.message}`);
            else{ setEntries(prev=>prev.filter(e=>!ids.includes(e.id))); addLog("ok",`  ✓ Cleared ${ids.length} old entries`); }
          } else { addLog("ok","  ✓ No existing entries — fresh import"); }
        }

        // ── PARSE DATA ROWS ──
        let inserted=0, skipped=0, leaveCnt=0;
        let firstDaySeen=false; // track when engineer's first working day appears

        for(let i=4;i<rows.length;i++){
          const row=rows[i];
          if(!row) continue;

          // Stop at subtotal/signature rows
          const sentinelVal=String(row[colOffset]||row[0]||"").trim().toLowerCase();
          if(sentinelVal.includes("subtotal")||sentinelVal.includes("signature")) break;

          // Parse the date cell (use colOffset for shifted layouts)
          const rawD=row[colOffset];
          if(!rawD) continue;
          const dateStr=parseCellDate(rawD);
          if(!dateStr||dateStr==="NaN-NaN-NaN") continue;

          // ── STOP: skip rows outside the import month (e.g. Mar rows in a Feb sheet) ──
          if(dateStr<monthStart||dateStr>monthEnd){ skipped++; continue; }

          // Read task/hours/project/details — use colOffset for shifted layouts
          const task       =String(row[colOffset+2]||"").trim();
          const hoursRaw   =row[colOffset+3];
          const projName   =String(row[colOffset+4]||"").trim();
          const taskDetails=String(row[colOffset+5]||"").trim();

          const projLower   =projName.toLowerCase();
          const taskLower   =task.toLowerCase();
          const detailsLower=taskDetails.toLowerCase();
          const hours=typeof hoursRaw==="number"?hoursRaw:(hoursRaw?parseFloat(String(hoursRaw)):0);

          // ── WEEKEND: day-of-week check (local noon to avoid UTC shift) ──
          const dow=new Date(dateStr+"T12:00:00").getDay(); // 0=Sun…5=Fri,6=Sat
          let engWeekend=[5,6];
          try{ engWeekend=eng.weekend_days?JSON.parse(eng.weekend_days):[5,6]; }catch(_){}

          // Skip if weekend keyword in task OR project column
          const weekendKeyword=projLower==="weekend"||taskLower==="weekend"
            ||projLower==="week end"||taskLower==="week end";
          if(weekendKeyword) continue;

          // All-empty: no task, no project, no hours, no details
          const allEmpty=!task&&!projName&&(!hoursRaw||hours===0)&&!taskDetails;

          // Skip empty weekend rows
          if(allEmpty&&engWeekend.includes(dow)) continue;

          // ── VACATION: explicit vacation keyword in task, regardless of project column ──
          // (some engineers put "Vacation" in both task AND project — detect by task only)
          const isVacationTask=taskLower==="vacation"||taskLower==="annual leave"
            ||taskLower==="sick leave"||taskLower==="unpaid leave";
          const isVacationDetail=detailsLower.includes("vacation");

          // ── PUBLIC HOLIDAY / NATIONAL DAY ──
          const isHoliday=(taskLower.includes("holiday")||taskLower.includes("national day")
            ||detailsLower.includes("holiday"))&&!projName;

          // ── TRAINING with no project → Training External leave ──
          const isTrainingNoProj=(taskLower==="training"||taskLower.includes("training"))
            &&!projName&&hours>0;

          // ── FIRST DAY marker → skip it as a plain note (no leave, no work) ──
          const isFirstDayMarker=taskLower.includes("first day")||taskLower.includes("(first day)");

          // ── IMPLICIT ABSENCE: empty workday row ──
          // Only count as absence if we've seen at least one working day (avoids pre-employment period)
          const isImplicitAbsence=allEmpty&&!engWeekend.includes(dow)&&firstDaySeen;

          // ── CLASSIFY ──
          if(isHoliday){
            const {error:lErr}=await supabase.from("time_entries").upsert({
              engineer_id:eng.id,date:dateStr,hours:8,
              entry_type:"leave",leave_type:"Public Holiday",billable:false
            },{onConflict:"engineer_id,date,entry_type,leave_type",ignoreDuplicates:false});
            if(!lErr){inserted++;leaveCnt++; firstDaySeen=true;}
            else addLog("warn",`  ⚠ Holiday ${dateStr}: ${lErr.message}`);
            continue;
          }

          if(isVacationTask||isVacationDetail){
            const lvType=taskLower.includes("sick")||detailsLower.includes("sick")?"Sick Leave":"Annual Leave";
            const leaveHours=(hours>0&&hours<=24)?hours:8;
            const {error:lErr}=await supabase.from("time_entries").upsert({
              engineer_id:eng.id,date:dateStr,hours:leaveHours,
              entry_type:"leave",leave_type:lvType,billable:false
            },{onConflict:"engineer_id,date,entry_type,leave_type",ignoreDuplicates:false});
            if(!lErr){inserted++;leaveCnt++; firstDaySeen=true;}
            else addLog("warn",`  ⚠ Leave(${lvType}) ${dateStr}: ${lErr.message}`);
            continue;
          }

          if(isTrainingNoProj){
            const {error:lErr}=await supabase.from("time_entries").upsert({
              engineer_id:eng.id,date:dateStr,hours,
              entry_type:"leave",leave_type:"Training External",billable:false
            },{onConflict:"engineer_id,date,entry_type,leave_type",ignoreDuplicates:false});
            if(!lErr){inserted++;leaveCnt++; firstDaySeen=true;}
            else addLog("warn",`  ⚠ Training ${dateStr}: ${lErr.message}`);
            continue;
          }

          if(isFirstDayMarker){
            // First day orientation — log as Training External, mark employment start
            const leaveHours=(hours>0&&hours<=24)?hours:8;
            const {error:lErr}=await supabase.from("time_entries").upsert({
              engineer_id:eng.id,date:dateStr,hours:leaveHours,
              entry_type:"leave",leave_type:"Training External",billable:false
            },{onConflict:"engineer_id,date,entry_type,leave_type",ignoreDuplicates:false});
            if(!lErr){inserted++;leaveCnt++;}
            firstDaySeen=true;
            continue;
          }

          if(isImplicitAbsence){
            const {error:lErr}=await supabase.from("time_entries").upsert({
              engineer_id:eng.id,date:dateStr,hours:8,
              entry_type:"leave",leave_type:"Annual Leave",billable:false
            },{onConflict:"engineer_id,date,entry_type,leave_type",ignoreDuplicates:false});
            if(!lErr){inserted++;leaveCnt++;}
            else addLog("warn",`  ⚠ Absence ${dateStr}: ${lErr.message}`);
            continue;
          }

          // ── WORK ENTRY: must have task + hours + project ──
          if(!task||isNaN(hours)||hours<=0||!projName) continue;
          firstDaySeen=true;

          const proj=await findOrCreateProject(projName);

          // Map task → category/type
          let cat="Software", typ="SCADA Development";
          const tl=task.toLowerCase();
          if(tl.includes("hmi"))                         {cat="Software";typ="HMI Development";}
          else if(tl.includes("scada"))                  {cat="Software";typ="SCADA Development";}
          else if(tl.includes("display"))                {cat="Software";typ="HMI Development";}
          else if(tl.includes("database")||tl.includes("symbol")){cat="Software";typ="OPC Configuration";}
          else if(tl.includes("plc")||tl.includes("program")||tl.includes("control logic")){cat="Software";typ="PLC Programming";}
          else if(tl.includes("ppc"))                    {cat="Software";typ="PPC Configuration";}
          else if(tl.includes("relay")||tl.includes("config")){cat="Engineering";typ="Control Logic";}
          else if(tl.includes("fds")||tl.includes("document")||tl.includes("schematic")){cat="Documentation";typ="Technical Writing";}
          else if(tl.includes("commission"))             {cat="Commissioning";typ="System Integration Test";}
          else if(tl.includes("engineer")||tl.includes("design")){cat="Engineering";typ="Detailed Engineering";}
          else if(tl.includes("training"))               {cat="Training";typ="Internal Training";}
          else if(tl.includes("meeting"))                {cat="Project Mgmt";typ="Client Meeting";}
          else if(tl.includes("review")||tl.includes("revision")){cat="Engineering";typ="Detailed Engineering";}
          else if(tl.includes("site")||tl.includes("support")){cat="Commissioning";typ="Site Support";}
          else if(tl.includes("bess")||tl.includes("a8000")||tl.includes("a 8000")){cat="Software";typ="PLC Programming";}

          const activity=taskDetails||(task+(projName?` — ${projName}`:""));

          const {error:eErr}=await supabase.from("time_entries").upsert({
            engineer_id:eng.id,
            project_id:proj?.id||null,
            date:dateStr,hours,
            task_category:cat,task_type:typ,
            activity,entry_type:"work",
            billable:proj?.billable||false,
          },{onConflict:"engineer_id,date,project_id,task_type",ignoreDuplicates:false});
          if(!eErr) inserted++;
          else{addLog("warn",`  ⚠ Entry ${dateStr} failed: ${eErr.message}`);skipped++;}
        }
        addLog("ok",`  ✓ Done: ${inserted} entries (${leaveCnt} leave, ${skipped} skipped)`);
      }catch(err){
        addLog("error",`  ✕ Parse error: ${err.message}`);
      }
    }
    addLog("info","✅ All files processed — refreshing...");
    await loadAll();
    setImporting(false);
  };

  const bulkDeleteEntries=async()=>{
    if(selectedEntries.size===0) return;
    if(!window.confirm(`Delete ${selectedEntries.size} selected entries?`)) return;
    const ids=[...selectedEntries];
    const {error}=await supabase.from("time_entries").delete().in("id",ids);
    if(error){showToast("Error: "+error.message,false);return;}
    setEntries(prev=>prev.filter(e=>!selectedEntries.has(e.id)));
    setSelectedEntries(new Set());
    showToast(`Deleted ${ids.length} entries`);
  };

  /* ── PROJECT CRUD ── */
  const addProject=async()=>{
    if(!newProj.id||!newProj.name){showToast("Number and name required",false);return;}
    const {data,error}=await supabase.from("projects").insert(newProj).select().single();
    if(error){showToast("Error: "+error.message,false);return;}
    setProjects(prev=>[...prev,data].sort((a,b)=>a.id.localeCompare(b.id)));
    setShowProjModal(false);
    setNewProj({id:"",name:"",type:"Renewable Energy",client:"",origin:"Romania HQ",phase:"Design",billable:true,rate_per_hour:85,status:"Active"});
    showToast("Project created ✓");
  };
  const saveEditProject=async()=>{
    if(!editProjModal) return;
    const {_origId,...rest}=editProjModal;
    const origId=_origId||rest.id;
    const newId=rest.id;
    const idChanged=_origId&&_origId!==newId;
    if(idChanged){
      // Rename project ID: insert new, re-link entries, delete old
      const{error:e1}=await supabase.from("projects").insert({...rest});
      if(e1){showToast("Error renaming: "+e1.message,false);return;}
      await supabase.from("time_entries").update({project_id:newId}).eq("project_id",origId);
      await supabase.from("projects").delete().eq("id",origId);
      setProjects(prev=>prev.map(p=>p.id===origId?{...rest}:p));
      setEntries(prev=>prev.map(e=>e.project_id===origId?{...e,project_id:newId}:e));
      setEditProjModal(null); showToast("Project ID renamed & entries re-linked ✓");
    } else {
      const{id,...fields}=rest;
      const{data,error}=await supabase.from("projects").update(fields).eq("id",id).select().single();
      if(error){showToast("Error: "+error.message,false);return;}
      setProjects(prev=>prev.map(p=>p.id===data.id?data:p));
      setEditProjModal(null); showToast("Project updated ✓");
    }
  };
  const deleteProject=async id=>{
    if(!window.confirm(`Delete ${id} and all its entries?`)) return;
    await supabase.from("time_entries").delete().eq("project_id",id);
    await supabase.from("projects").delete().eq("id",id);
    setProjects(prev=>prev.filter(p=>p.id!==id));
    setEntries(prev=>prev.filter(e=>e.project_id!==id));
    showToast("Project deleted",false);
  };

  /* ── SUB-PROJECT CRUD ── */
  const addSubProject=async(draft)=>{
    const pid=draft.project_id||draft.projectId;
    const{name,pm_name,pm_comments,pendings,assigned_engineers}=draft;
    if(!name||!name.trim()){showToast("Sub-project name required",false);return;}
    if(!pid){showToast("Error: missing project",false);return;}
    const{data,error}=await supabase.from("project_subprojects")
      .insert({project_id:pid,name:name.trim(),pm_name,pm_comments,pendings,assigned_engineers:assigned_engineers||[]})
      .select().single();
    if(error){showToast("Error: "+error.message,false);return;}
    setSubprojects(prev=>[...prev,data]);
    setSubProjModal(null); showToast("Sub-project added ✓");
  };
  const saveSubProject=async(sub)=>{
    const{id,...fields}=sub;
    const{data,error}=await supabase.from("project_subprojects")
      .update(fields).eq("id",id).select().single();
    if(error){showToast("Error: "+error.message,false);return;}
    setSubprojects(prev=>prev.map(s=>s.id===data.id?data:s));
    setSubProjModal(null); showToast("Sub-project saved ✓");
  };
  const deleteSubProject=async(id)=>{
    if(!window.confirm("Delete this sub-project and unlink its activities?")) return;
    // Unlink activities (set subproject_id to null)
    await supabase.from("project_activities").update({subproject_id:null}).eq("subproject_id",id);
    await supabase.from("project_subprojects").delete().eq("id",id);
    setSubprojects(prev=>prev.filter(s=>s.id!==id));
    setActivities(prev=>prev.map(a=>String(a.subproject_id)===String(id)?{...a,subproject_id:null}:a));
    showToast("Sub-project deleted",false);
  };

  /* ── ENGINEER CRUD ── */
  const addEngineer=async()=>{
    if(!newEng.name){showToast("Name required",false);return;}
    const {data,error}=await supabase.from("engineers").insert(newEng).select().single();
    if(error){showToast("Error: "+error.message,false);return;}
    setEngineers(prev=>[...prev,data].sort((a,b)=>a.name.localeCompare(b.name)));
    setShowEngModal(false);
    setNewEng({name:"",role:ROLES_LIST[0],level:"Mid",email:"",role_type:"engineer",weekend_days:JSON.stringify(DEFAULT_WEEKEND)});
    showToast("Engineer added ✓");
  };
  const saveEditEngineer=async()=>{
    if(!editEngModal) return;
    const {id,...rest}=editEngModal;
    const {data,error}=await supabase.from("engineers").update(rest).eq("id",id).select().single();
    if(error){showToast("Error: "+error.message,false);return;}
    setEngineers(prev=>prev.map(e=>e.id===data.id?data:e));
    // Update my own profile if I edited myself
    if(data.id===myProfile?.id) setMyProfile(data);
    setEditEngModal(null); showToast("Updated ✓");
  };
  const deleteEngineer=async id=>{
    if(!window.confirm("Delete this engineer and all their entries?")) return;
    await supabase.from("time_entries").delete().eq("engineer_id",id);
    await supabase.from("engineers").delete().eq("id",id);
    setEngineers(prev=>prev.filter(e=>e.id!==id));
    setEntries(prev=>prev.filter(e=>e.engineer_id!==id));
    showToast("Removed",false);
  };

  /* ── DERIVED STATS ── */
  const monthEntries=useMemo(()=>entries.filter(e=>{
    // Parse as local noon to avoid UTC midnight shifting month/year in UTC+ timezones
    const d=new Date(e.date+"T12:00:00");
    return d.getFullYear()===year&&d.getMonth()===month;
  }),[entries,year,month]);

  // Helper: is an entry billable? Always derive from CURRENT project status, not stale e.billable
  const isEntryBillable=useCallback((e)=>{
    const p=projects.find(x=>x.id===e.project_id);
    return !!(p&&p.billable);
  },[projects]);

  const workEntries   = monthEntries.filter(e=>e.entry_type==="work");
  const leaveEntries  = monthEntries.filter(e=>e.entry_type==="leave");
  const totalWorkHrs  = workEntries.reduce((s,e)=>s+e.hours,0);
  const totalBillable = workEntries.filter(e=>isEntryBillable(e)).reduce((s,e)=>s+e.hours,0);
  const totalRevenue  = workEntries.filter(e=>isEntryBillable(e)).reduce((s,e)=>{
    const p=projects.find(x=>x.id===e.project_id);return s+(p?p.rate_per_hour*e.hours:0);},0);
  const billabilityPct= totalWorkHrs?Math.round(totalBillable/totalWorkHrs*100):0;
  const overallUtil   = engineers.length?Math.min(100,Math.round(totalWorkHrs/(engineers.length*targetHrs)*100)):0;

  const engStats=useMemo(()=>engineers.map(eng=>{
    const we=monthEntries.filter(e=>String(e.engineer_id)===String(eng.id));
    const wh=we.filter(e=>e.entry_type==="work").reduce((s,e)=>s+e.hours,0);
    // Billable hours derived from CURRENT project billable flag
    const bh=we.filter(e=>e.entry_type==="work").reduce((s,e)=>{
      const p=projects.find(x=>x.id===e.project_id);
      return s+(p&&p.billable?e.hours:0);},0);
    const ld=we.filter(e=>e.entry_type==="leave").length;
    const rev=we.filter(e=>e.entry_type==="work").reduce((s,e)=>{
      const p=projects.find(x=>x.id===e.project_id);return s+(p&&p.billable?p.rate_per_hour*e.hours:0);},0);
    const engWd=()=>{try{return eng.weekend_days?JSON.parse(eng.weekend_days):DEFAULT_WEEKEND;}catch{return DEFAULT_WEEKEND;}};
    const engTarget=getTargetHrs(year,month,engWd());
    return{...eng,workHrs:wh,billableHrs:bh,leaveDays:ld,revenue:rev,
      utilization:Math.min(100,Math.round(wh/engTarget*100)),
      billability:wh?Math.round(bh/wh*100):0};
  }),[engineers,monthEntries,projects,year,month]);

  const projStats=useMemo(()=>projects.map(p=>{
    const pe=monthEntries.filter(e=>e.project_id===p.id&&e.entry_type==="work");
    const hrs=pe.reduce((s,e)=>s+e.hours,0);
    const rev=p.billable?pe.reduce((s,e)=>s+p.rate_per_hour*e.hours,0):0;
    return{...p,hours:hrs,revenue:rev,engCount:[...new Set(pe.map(e=>e.engineer_id))].length};
  }),[projects,monthEntries]);

  const taskStats=useMemo(()=>{
    const map={};
    workEntries.forEach(e=>{
      const grp = e.task_category||CAT_TO_GROUP[e.task_type]||"General";
      if(!map[grp]) map[grp]={category:grp,hours:0,billable:0,tasks:{}};
      map[grp].hours+=e.hours;
      const p=projects.find(x=>x.id===e.project_id);
      if(p&&p.billable) map[grp].billable+=e.hours;
      // task_type = category (e.g. "Templates"), nested under group
      const cat = e.task_type||"Other";
      if(!map[grp].tasks[cat]) map[grp].tasks[cat]={hrs:0,activities:{}};
      map[grp].tasks[cat].hrs+=e.hours;
      // activity = sub-item
      if(e.activity) map[grp].tasks[cat].activities[e.activity]=(map[grp].tasks[cat].activities[e.activity]||0)+e.hours;
    });
    return Object.values(map).sort((a,b)=>b.hours-a.hours);
  },[workEntries,projects]);

  const adminBrowseEntries=useMemo(()=>entries.filter(e=>{
    const d=new Date(e.date+"T12:00:00"); // noon avoids UTC midnight date shift in UTC+ timezones
    return (entryFilter.engineer==="ALL"||e.engineer_id===+entryFilter.engineer)
      &&(entryFilter.project==="ALL"||e.project_id===entryFilter.project)
      &&d.getMonth()===entryFilter.month&&d.getFullYear()===entryFilter.year;
  }),[entries,entryFilter]);

  /* ── PDF builds ── */
  const buildUtilizationPDF=()=>{
    generatePDF(`Team Utilization — ${MONTHS[month]} ${year}`,[
      `<div class="section"><div class="st">KPIs</div><div class="kg">
        <div class="kp"><div class="kv">${fmtPct(overallUtil)}</div><div class="kl">Utilization</div></div>
        <div class="kp"><div class="kv">${fmtPct(billabilityPct)}</div><div class="kl">Billability</div></div>
        <div class="kp"><div class="kv">${totalWorkHrs}h</div><div class="kl">Work Hours</div></div>
        <div class="kp"><div class="kv">${fmtCurrency(totalRevenue)}</div><div class="kl">Revenue</div></div>
      </div></div>`,
      `<div class="section"><div class="st">Individual Breakdown</div>
      <table><thead><tr><th>Engineer</th><th>Level</th><th>Work Hrs</th><th>Billable Hrs</th><th>Leave</th><th>Utilization</th><th>Billability</th><th>Revenue</th></tr></thead>
      <tbody>${engStats.map(e=>`<tr>
        <td><strong>${e.name}</strong><br><span style="color:#64748b;font-size:9px">${e.role||""}</span></td>
        <td>${e.level||""}</td><td>${e.workHrs}h</td><td style="color:#0ea5e9">${e.billableHrs}h</td>
        <td>${e.leaveDays}d</td><td>${fmtPct(e.utilization)}</td><td>${fmtPct(e.billability)}</td>
        <td style="color:#0ea5e9;font-weight:700">${fmtCurrency(e.revenue)}</td></tr>`).join("")}
      </tbody></table></div>`]);
  };
  const buildTaskPDF=()=>{
    const actRows=entries.filter(e=>e.entry_type==="work"&&e.activity&&new Date(e.date).getMonth()===month&&new Date(e.date).getFullYear()===year).slice(0,30).map(e=>{
      const eng=engineers.find(x=>x.id===e.engineer_id);const proj=projects.find(x=>x.id===e.project_id);
      return`<tr><td style="font-size:9px">${e.date}</td><td>${eng?.name||""}</td>
      <td style="color:#0ea5e9;font-size:9px">${proj?.id||""}</td>
      <td style="font-size:9px">${e.task_type||""}</td><td style="font-style:italic">${e.activity||""}</td><td>${e.hours}h</td></tr>`;}).join("");
    generatePDF(`Task Analysis — ${MONTHS[month]} ${year}`,[
      `<div class="section"><div class="st">Categories</div><table><thead><tr><th>Category</th><th>Hrs</th><th>Billable Hrs</th><th>Share</th><th>Tasks</th></tr></thead>
      <tbody>${taskStats.map(cat=>{const pct=totalWorkHrs?Math.round(cat.hours/totalWorkHrs*100):0;
        return`<tr><td><strong>${cat.category}</strong></td><td>${cat.hours}h</td><td>${cat.billable}h</td><td>${pct}%</td>
        <td style="font-size:9px">${Object.keys(cat.tasks).join(", ")}</td></tr>`;}).join("")}</tbody></table></div>`,
      `<div class="section"><div class="st">Activity Log</div><table><thead><tr><th>Date</th><th>Engineer</th><th>Project</th><th>Task</th><th>Activity</th><th>Hrs</th></tr></thead>
      <tbody>${actRows}</tbody></table></div>`]);
  };
  const buildMonthlyPDF=()=>{
    generatePDF(`Monthly Management Report — ${MONTHS[month]} ${year}`,[
      `<div class="section"><div class="st">Summary</div><div class="kg">
        <div class="kp"><div class="kv">${fmtPct(overallUtil)}</div><div class="kl">Team Utilization</div></div>
        <div class="kp"><div class="kv">${fmtPct(billabilityPct)}</div><div class="kl">Billability</div></div>
        <div class="kp"><div class="kv">${fmtCurrency(totalRevenue)}</div><div class="kl">Revenue</div></div>
        <div class="kp"><div class="kv">${leaveEntries.length}</div><div class="kl">Absences</div></div>
      </div></div>`,
      `<div class="section"><div class="st">Engineer Performance</div><table><thead><tr><th>Engineer</th><th>Util.</th><th>Bill.</th><th>Work Hrs</th><th>Revenue</th><th>Leave</th></tr></thead>
      <tbody>${engStats.map(e=>`<tr><td><strong>${e.name}</strong><br><span style="font-size:9px;color:#64748b">${e.role||""}</span></td>
        <td>${fmtPct(e.utilization)}</td><td>${fmtPct(e.billability)}</td><td>${e.workHrs}h</td>
        <td style="color:#0ea5e9">${fmtCurrency(e.revenue)}</td><td>${e.leaveDays}d</td></tr>`).join("")}</tbody></table></div>`,
      `<div class="section"><div class="st">Projects</div><table><thead><tr><th>No.</th><th>Project</th><th>Phase</th><th>Hours</th><th>Revenue</th></tr></thead>
      <tbody>${projStats.filter(p=>p.hours>0).map(p=>`<tr>
        <td style="color:#0ea5e9;font-size:9px">${p.id}</td><td>${p.name}</td><td>${p.phase||""}</td>
        <td>${p.hours}h</td><td>${p.billable?fmtCurrency(p.revenue):"—"}</td></tr>`).join("")}</tbody></table></div>`],
      "Prepared for Senior Management");
  };

  /* ── LOADING ── */
  if(authLoading) return(
    <div style={{display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",minHeight:"100vh",background:"#080d1a",gap:16}}>
      <img src={LOGO_SRC} alt="ENEVO Group" style={{width:110,height:110,borderRadius:18,opacity:0.9}}/>
      <div style={{fontFamily:"'IBM Plex Mono',monospace",color:"#38bdf8",fontSize:13,letterSpacing:".1em"}}>Loading ENEVO GROUP…</div>
    </div>
  );

  /* ── AUTH SCREEN ── */
  if(!session) return(
    <div style={{minHeight:"100vh",background:"#080d1a",display:"flex",alignItems:"center",justifyContent:"center",fontFamily:"'IBM Plex Sans',sans-serif"}}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=IBM+Plex+Sans:wght@400;600;700&family=IBM+Plex+Mono:wght@400;600&display=swap');*{box-sizing:border-box;margin:0;padding:0}input,select{background:#060e1c;border:1px solid #192d47;color:#dde3ef;padding:10px 14px;border-radius:7px;font-family:'IBM Plex Sans',sans-serif;font-size:13px;outline:none;width:100%;transition:border-color .2s}input:focus,select:focus{border-color:#38bdf8}select option{background:#060e1c}.bp{background:linear-gradient(135deg,#0ea5e9,#0369a1);border:none;color:#fff;padding:11px;border-radius:7px;cursor:pointer;font-family:'IBM Plex Sans',sans-serif;font-size:14px;font-weight:700;display:flex;align-items:center;justify-content:center}.bp:hover{opacity:.85}`}</style>
      <div style={{background:"#0b1526",border:"1px solid #192d47",borderRadius:14,padding:"36px",width:430,maxWidth:"95vw",boxShadow:"0 24px 60px #00000080"}}>
        <div style={{textAlign:"center",marginBottom:24}}>
          <div style={{display:"flex",justifyContent:"center",marginBottom:12}}>
            <img src={LOGO_SRC} alt="ENEVO Group" style={{width:130,height:130,borderRadius:22,objectFit:"contain"}}/>
          </div>
          <div style={{fontFamily:"'IBM Plex Mono',monospace",fontSize:10,color:"#38bdf8",letterSpacing:".18em",marginBottom:6}}>ENEVO GROUP</div>
          <div style={{fontSize:22,fontWeight:700,color:"#f0f6ff"}}>ENEVO GROUP</div>
          <div style={{fontSize:12,color:"#2e4a66",marginTop:4}}>Industrial & Renewable Energy Automation</div>
        </div>
        {authMode==="login"?(
          <div style={{display:"grid",gap:12}}>
            {authErr&&<div style={{padding:"8px 12px",borderRadius:6,fontSize:12,background:"#450a0a",color:"#f87171",border:"1px solid #f87171"}}>{authErr}</div>}
            <div><Lbl>Email</Lbl><input type="email" value={authEmail} onChange={e=>setAuthEmail(e.target.value)} placeholder="you@company.com"/></div>
            <div><Lbl>Password</Lbl><input type="password" value={authPwd} onChange={e=>setAuthPwd(e.target.value)} onKeyDown={e=>e.key==="Enter"&&handleLogin(e)}/></div>
            <button className="bp" onClick={handleLogin}>Sign In</button>
            <div style={{textAlign:"center",fontSize:12,color:"#2e4a66"}}>New engineer? <span style={{color:"#38bdf8",cursor:"pointer"}} onClick={()=>setAuthMode("signup")}>Create Account</span></div>
          </div>
        ):<SignupScreen onBack={()=>setAuthMode("login")}/>}
      </div>
    </div>
  );

  /* ════════════════════════
     MAIN LAYOUT
  ════════════════════════ */
  const navItems = [
    {id:"dashboard",icon:"▦",label:"Dashboard"},
    {id:"timesheet",icon:"⏱",label:"Post Hours"},
    {id:"projects", icon:"◈",label:"Projects"},
    {id:"team",     icon:"◉",label:"Team"},
    ...(canReport?[{id:"reports",icon:"⊞",label:"Reports & PDF"}]:[]),
    ...(isAdmin||role==="lead"?[{id:"admin",icon:"⚙",label:isAdmin?"Admin Panel":"Lead Panel"}]:[]),
    {id:"mysettings",icon:"☰",label:"My Settings"},
    ...(isAdmin?[{id:"import",icon:"⬆",label:"Import Excel"}]:[]),
  ];

  return(
    <div style={{fontFamily:"'IBM Plex Sans',sans-serif",background:"#080d1a",minHeight:"100vh",color:"#dde3ef"}}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=IBM+Plex+Sans:wght@300;400;500;600;700&family=IBM+Plex+Mono:wght@400;500;600&display=swap');
        *{box-sizing:border-box;margin:0;padding:0}
        ::-webkit-scrollbar{width:5px}::-webkit-scrollbar-track{background:#080d1a}::-webkit-scrollbar-thumb{background:#1a3354;border-radius:3px}
        .nb{background:none;border:none;cursor:pointer;padding:9px 14px;border-radius:6px;font-family:'IBM Plex Sans',sans-serif;font-size:13px;font-weight:500;color:#7a8faa;display:flex;align-items:center;gap:8px;transition:all .2s;width:100%;text-align:left}
        .nb:hover{background:#0d1a2d;color:#38bdf8}.nb.a{background:#0d1a2d;color:#38bdf8;border-left:2px solid #38bdf8}
        .card{background:#0b1526;border:1px solid #192d47;border-radius:10px;padding:18px}
        .bp{background:linear-gradient(135deg,#0ea5e9,#0369a1);border:none;color:#fff;padding:8px 16px;border-radius:6px;cursor:pointer;font-family:'IBM Plex Sans',sans-serif;font-size:13px;font-weight:600;transition:opacity .2s;display:inline-flex;align-items:center;gap:6px}
        .bp:hover{opacity:.85}
        .bg{background:transparent;border:1px solid #192d47;color:#7a8faa;padding:6px 12px;border-radius:6px;cursor:pointer;font-family:'IBM Plex Sans',sans-serif;font-size:12px;transition:all .2s}
        .bg:hover{border-color:#38bdf8;color:#38bdf8}
        .be{background:transparent;border:1px solid #0ea5e930;color:#38bdf8;padding:4px 9px;border-radius:4px;cursor:pointer;font-size:11px;font-family:'IBM Plex Sans',sans-serif}
        .be:hover{background:#0ea5e920}
        .bd{background:transparent;border:1px solid #7f1d1d;color:#f87171;padding:4px 9px;border-radius:4px;cursor:pointer;font-size:11px;font-family:'IBM Plex Sans',sans-serif}
        .bd:hover{background:#7f1d1d30}
        input,select,textarea{background:#060e1c;border:1px solid #192d47;color:#dde3ef;padding:8px 12px;border-radius:6px;font-family:'IBM Plex Sans',sans-serif;font-size:13px;outline:none;width:100%;transition:border-color .2s}
        input:focus,select:focus,textarea:focus{border-color:#38bdf8}select option{background:#060e1c}
        table{width:100%;border-collapse:collapse}
        th{color:#4e6479;font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:.05em;padding:9px 12px;border-bottom:1px solid #192d47;text-align:left}
        td{padding:8px 12px;border-bottom:1px solid #0d1a2d;font-size:12px}tr:hover td{background:#0d1a2d}
        .av{width:32px;height:32px;border-radius:50%;background:linear-gradient(135deg,#0ea5e9,#0369a1);display:flex;align-items:center;justify-content:center;font-size:10px;font-weight:700;color:#fff;flex-shrink:0}
        .bar{height:5px;border-radius:3px;background:linear-gradient(90deg,#0ea5e9,#38bdf8)}
        .modal-ov{position:fixed;inset:0;background:#00000099;backdrop-filter:blur(6px);z-index:100;display:flex;align-items:center;justify-content:center}
        .modal{background:#0b1526;border:1px solid #192d47;border-radius:12px;padding:24px;width:530px;max-width:95vw;max-height:90vh;overflow-y:auto}
        .toast{position:fixed;bottom:28px;right:28px;padding:11px 18px;border-radius:8px;font-size:12px;font-weight:700;z-index:200;animation:su .3s ease}
        @keyframes su{from{transform:translateY(12px);opacity:0}to{transform:translateY(0);opacity:1}}
        .metric{background:linear-gradient(135deg,#0b1526,#0d1e34);border:1px solid #192d47;border-radius:10px;padding:16px}
        .wc{background:#060e1c;border:1px solid #152639;border-radius:8px;min-height:110px;padding:8px}
        .atab{background:none;border:none;cursor:pointer;padding:7px 13px;border-radius:6px;font-family:'IBM Plex Sans',sans-serif;font-size:12px;font-weight:600;color:#4e6479;transition:all .2s}
        .atab:hover{color:#38bdf8}.atab.a{background:#0d1a2d;color:#38bdf8}
        .rpt-card{background:#0b1526;border:1px solid #192d47;border-radius:8px;padding:14px;cursor:pointer;transition:all .2s}
        .rpt-card:hover,.rpt-card.sel{border-color:#38bdf8;background:#0d1e34}
        .role-badge{display:inline-block;padding:2px 7px;border-radius:3px;font-size:9px;font-weight:700;font-family:'IBM Plex Mono',monospace}
      `}</style>

      <div style={{display:"flex"}}>
        {/* ── Sidebar ── */}
        <div style={{width:215,background:"#060c18",borderRight:"1px solid #192d47",minHeight:"100vh",padding:"20px 10px",position:"fixed",top:0,left:0,bottom:0,overflowY:"auto",zIndex:50}}>
          <div style={{marginBottom:20,paddingLeft:6}}>
            <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:8}}>
              <LogoImg/>
              <div>
                <div style={{fontFamily:"'IBM Plex Mono',monospace",fontSize:9,color:"#38bdf8",letterSpacing:".15em",fontWeight:600}}>ENEVO-ERP</div>
                <div style={{fontSize:13,fontWeight:700,color:"#f0f6ff",lineHeight:1.1}}>ENEVO GROUP</div>
              </div>
            </div>
            <div style={{fontSize:10,color:"#2e4a66",fontFamily:"'IBM Plex Mono',monospace"}}>ENEVO Group</div>
          </div>
          {navItems.map(n=>(
            <button key={n.id} className={`nb ${view===n.id?"a":""}`} onClick={()=>setView(n.id)}>
              <span style={{fontFamily:"'IBM Plex Mono',monospace",fontSize:14}}>{n.icon}</span>{n.label}
              {n.id==="admin"&&unreadCount>0&&<span style={{marginLeft:"auto",background:"#ef4444",color:"#fff",fontSize:9,fontWeight:700,padding:"1px 5px",borderRadius:10}}>{unreadCount}</span>}
            </button>
          ))}
          <div style={{marginTop:14,borderTop:"1px solid #192d47",paddingTop:12,paddingLeft:6,paddingRight:6}}>
            <div style={{fontSize:9,color:"#253a52",fontWeight:700,letterSpacing:".1em",marginBottom:8}}>PERIOD</div>
            <div style={{marginBottom:8}}><Lbl>Month</Lbl>
              <select value={month} onChange={e=>setMonth(+e.target.value)} style={{fontSize:11,padding:"5px 8px"}}>
                {MONTHS.map((m,i)=><option key={i} value={i}>{m}</option>)}
              </select>
            </div>
            <div><Lbl>Year</Lbl>
              <select value={year} onChange={e=>setYear(+e.target.value)} style={{fontSize:11,padding:"5px 8px"}}>
                {[year-2,year-1,year,year+1].map(y=><option key={y}>{y}</option>)}
              </select>
            </div>
          </div>
          <div style={{position:"absolute",bottom:16,left:10,right:10}}>
            <div style={{background:"#0b1526",border:"1px solid #192d47",borderRadius:8,padding:"9px 10px"}}>
              <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:8}}>
                <div className="av" style={{width:26,height:26,fontSize:8}}>{myProfile?.name?.slice(0,2).toUpperCase()||"?"}</div>
                <div style={{minWidth:0}}>
                  <div style={{fontSize:11,fontWeight:600,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{myProfile?.name||session.user.email}</div>
                  <div style={{fontSize:9,color:ROLE_COLORS[role]||"#2e4a66",fontWeight:600}}>{ROLE_LABELS[role]||role}</div>
                </div>
              </div>
              <button onClick={handleLogout} style={{width:"100%",background:"transparent",border:"1px solid #192d47",color:"#4e6479",padding:"5px",borderRadius:5,cursor:"pointer",fontSize:11,fontFamily:"'IBM Plex Sans',sans-serif"}}>Sign Out</button>
            </div>
          </div>
        </div>

        {/* ── Main Content ── */}
        <div style={{marginLeft:215,flex:1,padding:"24px 28px",maxWidth:"calc(100vw - 215px)"}}>
          {loading&&<div style={{textAlign:"center",padding:60,color:"#2e4a66",fontFamily:"'IBM Plex Mono',monospace"}}>Loading…</div>}
          {!loading&&<>

          {/* ════ DASHBOARD ════ */}
          {view==="dashboard"&&(
            <div>
              <div style={{marginBottom:20}}>
                <h1 style={{fontSize:21,fontWeight:700,color:"#f0f6ff"}}>{isAdmin||isAcct||isLead?"Team Dashboard":"My Summary"}</h1>
                <p style={{color:"#2e4a66",fontSize:12,marginTop:3,fontFamily:"'IBM Plex Mono',monospace"}}>{MONTHS[month]} {year} · {isAdmin||isAcct||isLead?"Live Overview":"Your personal stats"}</p>
              </div>
              {/* Engineers only see their own summary */}
              {!isAdmin&&!isAcct&&!isLead&&(()=>{
                const myE=monthEntries.filter(e=>String(e.engineer_id)===String(myProfile?.id));
                const myWork=myE.filter(e=>e.entry_type==="work").reduce((s,e)=>s+e.hours,0);
                const myLeave=myE.filter(e=>e.entry_type==="leave").length;
                const myProjs=[...new Set(myE.filter(e=>e.entry_type==="work").map(e=>e.project_id).filter(Boolean))].length;
                const myTarget=getTargetHrs(year,month,myWeekend);
                const myUtil=myTarget>0?Math.round(myWork/myTarget*100):0;
                return<>
                  <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:11,marginBottom:18}}>
                    {[{l:"My Work Hours",v:myWork+"h",c:"#38bdf8"},{l:"Utilization",v:fmtPct(myUtil),c:myUtil>=80?"#34d399":myUtil>=60?"#fb923c":"#f87171"},{l:"Leave Days",v:myLeave+"d",c:"#fb923c"},{l:"Projects",v:myProjs,c:"#a78bfa"}].map((s,i)=>(
                      <div key={i} className="metric"><div style={{fontSize:9,color:"#2e4a66",fontWeight:700,textTransform:"uppercase",letterSpacing:".06em"}}>{s.l}</div><div style={{fontFamily:"'IBM Plex Mono',monospace",fontSize:22,fontWeight:700,color:s.c,marginTop:8,lineHeight:1}}>{s.v}</div></div>
                    ))}
                  </div>
                  <div className="card"><h3 style={{fontSize:12,fontWeight:600,color:"#7a8faa",marginBottom:10}}>My {MONTHS[month]} Work Log</h3>
                    <table><thead><tr><th>Date</th><th>Project</th><th>Task</th><th>Activity</th><th>Hrs</th></tr></thead>
                    <tbody>{myE.filter(e=>e.entry_type==="work").sort((a,b)=>a.date.localeCompare(b.date)).map(e=>{
                      const p=projects.find(x=>x.id===e.project_id);
                      return<tr key={e.id}><td style={{fontFamily:"'IBM Plex Mono',monospace",fontSize:11}}>{e.date}</td><td style={{color:"#38bdf8",fontSize:11}}>{p?.id||"—"}</td><td style={{fontSize:11,color:"#7a8faa"}}>{e.task_type||"—"}</td><td style={{fontSize:11,color:"#4e6479",fontStyle:"italic",maxWidth:180,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{e.activity||"—"}</td><td style={{fontFamily:"'IBM Plex Mono',monospace",fontWeight:700,color:"#38bdf8"}}>{e.hours}h</td></tr>;
                    })}{myE.length===0&&<tr><td colSpan={5} style={{textAlign:"center",color:"#253a52",padding:16}}>No entries for {MONTHS[month]} {year}. Go to Post Hours to log time.</td></tr>}
                    </tbody></table>
                  </div>
                </>;
              })()}
              {/* Admin/Lead/Accountant see full team dashboard */}
              {(isAdmin||isAcct||isLead)&&(()=>{
                // Filtered entries for dashboard
                const dEntries=dashProjFilter==="ALL"?monthEntries:monthEntries.filter(e=>e.project_id===dashProjFilter);
                const dWork=dEntries.filter(e=>e.entry_type==="work");
                const dWorkHrs=dWork.reduce((s,e)=>s+e.hours,0);
                // Always derive billable from current project status
                const dBillHrs=dWork.reduce((s,e)=>{const p=projects.find(x=>x.id===e.project_id);return s+(p&&p.billable?e.hours:0);},0);
                const dNonHrs=dWorkHrs-dBillHrs;
                const dRevenue=dWork.reduce((s,e)=>{const p=projects.find(x=>x.id===e.project_id);return s+(p&&p.billable?p.rate_per_hour*e.hours:0);},0);
                const dBillPct=dWorkHrs?Math.round(dBillHrs/dWorkHrs*100):0;
                const dLeave=dEntries.filter(e=>e.entry_type==="leave").length;
                return<>
              {/* Month + Project filter bar */}
              <div style={{display:"flex",gap:10,alignItems:"flex-end",marginBottom:16,background:"#060e1c",borderRadius:8,padding:"10px 14px",border:"1px solid #192d47"}}>
                <div style={{marginRight:"auto"}}>
                  <div style={{fontSize:10,color:"#2e4a66",fontWeight:700,marginBottom:4}}>MONTH</div>
                  <div style={{display:"flex",gap:6,alignItems:"center"}}>
                    <button style={{background:"#0b1526",border:"1px solid #192d47",borderRadius:5,padding:"4px 8px",color:"#dde3ef",cursor:"pointer",fontSize:11}} onClick={()=>{if(month===0){setMonth(11);setYear(y=>y-1);}else setMonth(m=>m-1);}}>←</button>
                    <select value={month} onChange={e=>setMonth(+e.target.value)} style={{background:"#0b1526",border:"1px solid #192d47",borderRadius:5,padding:"4px 8px",color:"#f0f6ff",fontSize:12,fontFamily:"'IBM Plex Sans',sans-serif"}}>
                      {MONTHS.map((m,i)=><option key={i} value={i}>{m}</option>)}
                    </select>
                    <select value={year} onChange={e=>setYear(+e.target.value)} style={{background:"#0b1526",border:"1px solid #192d47",borderRadius:5,padding:"4px 8px",color:"#f0f6ff",fontSize:12,fontFamily:"'IBM Plex Sans',sans-serif"}}>
                      {[2024,2025,2026,2027].map(y=><option key={y}>{y}</option>)}
                    </select>
                    <button style={{background:"#0b1526",border:"1px solid #192d47",borderRadius:5,padding:"4px 8px",color:"#dde3ef",cursor:"pointer",fontSize:11}} onClick={()=>{if(month===11){setMonth(0);setYear(y=>y+1);}else setMonth(m=>m+1);}}>→</button>
                  </div>
                </div>
                <div>
                  <div style={{fontSize:10,color:"#2e4a66",fontWeight:700,marginBottom:4}}>PROJECT FILTER</div>
                  <select value={dashProjFilter} onChange={e=>setDashProjFilter(e.target.value)} style={{background:"#0b1526",border:"1px solid #192d47",borderRadius:5,padding:"4px 10px",color:"#f0f6ff",fontSize:12,fontFamily:"'IBM Plex Sans',sans-serif",width:220}}>
                    <option value="ALL">All Projects</option>
                    {projects.filter(p=>p.status==="Active").map(p=><option key={p.id} value={p.id}>{p.id} — {p.name}</option>)}
                  </select>
                </div>
                {dashProjFilter!=="ALL"&&<button style={{background:"transparent",border:"1px solid #192d47",borderRadius:5,padding:"4px 8px",color:"#7a8faa",cursor:"pointer",fontSize:10}} onClick={()=>setDashProjFilter("ALL")}>✕ All</button>}
              </div>
              {/* Warn if all projects are non-billable — guide admin to fix */}
              {(isAdmin||isAcct)&&dWorkHrs>0&&dBillHrs===0&&(
                <div style={{background:"#1a0f00",border:"1px solid #fb923c40",borderRadius:6,padding:"8px 14px",marginBottom:12,display:"flex",alignItems:"center",justifyContent:"space-between",gap:12}}>
                  <span style={{fontSize:11,color:"#fb923c"}}>⚠ All hours showing as non-billable — projects may need billable flag set. Go to Reports → Invoice Export to fix.</span>
                  <button className="bg" style={{fontSize:11,borderColor:"#fb923c",color:"#fb923c",whiteSpace:"nowrap",flexShrink:0}} onClick={()=>setView("reports")}>Fix now →</button>
                </div>
              )}
              <div style={{display:"grid",gridTemplateColumns:"repeat(6,1fr)",gap:11,marginBottom:18}}>
                {[
                  {l:"Total Work Hrs",v:dWorkHrs+"h",c:"#f0f6ff",show:true},
                  {l:"Billable Hrs",v:dBillHrs+"h",c:"#34d399",show:isAdmin||isAcct},
                  {l:"Non-Billable",v:dNonHrs+"h",c:"#fb923c",show:isAdmin||isAcct},
                  {l:"Billability",v:fmtPct(dBillPct),c:"#38bdf8",show:isAdmin||isAcct},
                  {l:"Revenue Billed",v:fmtCurrency(dRevenue),c:"#a78bfa",show:isAdmin||isAcct},
                  {l:"Absence Days",v:dLeave+"d",c:"#f472b6",show:true},
                ].filter(m=>m.show).map((m,i)=>(
                  <div key={i} className="metric">
                    <div style={{fontSize:9,color:"#2e4a66",fontWeight:700,textTransform:"uppercase",letterSpacing:".06em"}}>{m.l}</div>
                    <div style={{fontFamily:"'IBM Plex Mono',monospace",fontSize:22,fontWeight:700,color:m.c,marginTop:8,lineHeight:1}}>{m.v}</div>
                  </div>
                ))}
              </div>
              <div style={{display:"grid",gridTemplateColumns:"1.5fr 1fr",gap:14,marginBottom:14}}>
                <div className="card">
                  <h3 style={{fontSize:12,fontWeight:600,color:"#7a8faa",marginBottom:12}}>Team Utilization — {MONTHS[month]}</h3>
                  {engStats.length===0&&<p style={{color:"#253a52",fontSize:12}}>No hours logged yet.</p>}
                  {engStats.map(eng=>(
                    <div key={eng.id} style={{display:"flex",alignItems:"center",gap:8,marginBottom:8}}>
                      <div className="av" style={{fontSize:9,width:26,height:26}}>{eng.name?.slice(0,2).toUpperCase()}</div>
                      <div style={{flex:1,minWidth:0}}>
                        <div style={{display:"flex",justifyContent:"space-between",marginBottom:2}}>
                          <span style={{fontSize:11,fontWeight:500}}>{eng.name}</span>
                          <span style={{fontFamily:"'IBM Plex Mono',monospace",fontSize:10,color:"#38bdf8"}}>{eng.workHrs}h · {fmtPct(eng.utilization)}</span>
                        </div>
                        <div style={{background:"#060e1c",height:4,borderRadius:3,overflow:"hidden"}}>
                          <div style={{height:"100%",width:`${eng.utilization}%`,borderRadius:3,background:eng.utilization>=80?"linear-gradient(90deg,#34d399,#10b981)":eng.utilization>=60?"linear-gradient(90deg,#fb923c,#f59e0b)":"linear-gradient(90deg,#f87171,#ef4444)"}}/>
                        </div>
                      </div>
                      {(isAdmin||isAcct)&&<span style={{fontFamily:"'IBM Plex Mono',monospace",fontSize:9,color:"#a78bfa",width:32,textAlign:"right"}}>{fmtPct(eng.billability)}</span>}
                    </div>
                  ))}
                </div>
                <div className="card">
                  <h3 style={{fontSize:12,fontWeight:600,color:"#7a8faa",marginBottom:12}}>Task Distribution</h3>
                  {taskStats.length===0&&<p style={{color:"#253a52",fontSize:12}}>No tasks logged.</p>}
                  {taskStats.map(cat=>{const pct=totalWorkHrs?Math.round(cat.hours/totalWorkHrs*100):0;return(
                    <div key={cat.category} style={{marginBottom:9}}>
                      <div style={{display:"flex",justifyContent:"space-between",marginBottom:2}}>
                        <span style={{fontSize:11}}>{cat.category}</span>
                        <span style={{fontFamily:"'IBM Plex Mono',monospace",fontSize:10,color:"#38bdf8"}}>{cat.hours}h · {pct}%</span>
                      </div>
                      <div style={{background:"#060e1c",height:4,borderRadius:3,overflow:"hidden"}}>
                        <div className="bar" style={{width:`${pct}%`}}/>
                      </div>
                    </div>);})}
                </div>
              </div>
              <div className="card">
                <h3 style={{fontSize:12,fontWeight:600,color:"#7a8faa",marginBottom:12}}>Projects — {MONTHS[month]} {year}{dashProjFilter!=="ALL"&&` · Filtered`}</h3>
                <table>
                  <thead><tr><th>No.</th><th>Name</th><th>Phase</th><th>Hours</th>{(isAdmin||isAcct)&&<><th>Billing</th><th>Revenue</th></>}</tr></thead>
                  <tbody>{projStats.filter(p=>p.hours>0&&(dashProjFilter==="ALL"||p.id===dashProjFilter)).map(p=>(
                    <tr key={p.id}>
                      <td style={{fontFamily:"'IBM Plex Mono',monospace",fontSize:11,color:"#38bdf8"}}>{p.id}</td>
                      <td style={{fontSize:11}}>{p.name}</td>
                      <td style={{color:"#7a8faa",fontSize:11}}>{p.phase}</td>
                      <td style={{fontFamily:"'IBM Plex Mono',monospace"}}>{p.hours}h</td>
                      {(isAdmin||isAcct)&&<><td><span style={{fontSize:9,padding:"2px 6px",borderRadius:3,fontFamily:"'IBM Plex Mono',monospace",fontWeight:700,background:p.billable?"#0c2b4e":"#1a0a00",color:p.billable?"#38bdf8":"#fb923c"}}>{p.billable?"BILLABLE":"NON-BILL"}</span></td>
                      <td style={{fontFamily:"'IBM Plex Mono',monospace",color:"#a78bfa"}}>{p.billable?fmtCurrency(p.revenue):"—"}</td></>}
                    </tr>
                  ))}</tbody>
                </table>
              </div>
              </>;})()}
            </div>
          )}

          {/* ════ TIMESHEET ════ */}
          {view==="timesheet"&&(
            <div>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-end",marginBottom:16}}>
                <div>
                  <h1 style={{fontSize:21,fontWeight:700,color:"#f0f6ff"}}>Post Hours</h1>
                  <p style={{color:"#2e4a66",fontSize:12,marginTop:3}}>
                    Allowed: {minPostDate()} → {maxPostDate()}
                    {canEdit&&" · Lead/Admin can browse all engineers"}
                  </p>
                </div>
                <div style={{display:"flex",gap:12,alignItems:"flex-end"}}>
                  {canEditAny&&(
                    <div><Lbl>Browse Engineer</Lbl>
                      <select style={{width:190}} value={viewEngId||""} onChange={e=>setBrowseEngId(+e.target.value)}>
                        {engineers.map(eng=><option key={eng.id} value={eng.id}>{eng.name}</option>)}
                      </select>
                    </div>
                  )}
                  <div><Lbl>Week</Lbl>
                    <div style={{display:"flex",alignItems:"center",gap:6}}>
                      <button className="bg" style={{padding:"7px 10px"}} onClick={()=>{const d=new Date(weekOf);d.setDate(d.getDate()-7);setWeekOf(fmt(d));}}>←</button>
                      <input type="date" style={{width:140}} value={weekOf} onChange={e=>setWeekOf(e.target.value)}
                        min={minPostDate()} max={maxPostDate()}/>
                      <button className="bg" style={{padding:"7px 10px"}} onClick={()=>{const d=new Date(weekOf);d.setDate(d.getDate()+7);setWeekOf(fmt(d));}}>→</button>
                      <button className="bg" style={{fontSize:11}} onClick={()=>setWeekOf(fmt(today))}>Today</button>
                    </div>
                  </div>
                </div>
              </div>

              {viewEng&&<div style={{display:"flex",alignItems:"center",gap:14,marginBottom:14,background:"#0b1526",border:"1px solid #192d47",borderRadius:10,padding:"12px 16px"}}>
                <div className="av" style={{width:42,height:42,fontSize:13}}>{viewEng.name?.slice(0,2).toUpperCase()}</div>
                <div>
                  <div style={{fontSize:14,fontWeight:600}}>{viewEng.name}</div>
                  <div style={{fontSize:11,color:"#2e4a66"}}>{viewEng.role} · {viewEng.level}</div>
                </div>
                <div style={{marginLeft:"auto",display:"flex",gap:20}}>
                  {[
                    {l:"Week Hrs",v:weekDays.reduce((s,d)=>s+entries.filter(e=>e.date===d&&e.engineer_id===viewEngId).reduce((ss,e)=>ss+e.hours,0),0)+"h",c:"#38bdf8"},
                    {l:"Month Hrs",v:monthEntries.filter(e=>e.engineer_id===viewEngId&&e.entry_type==="work").reduce((s,e)=>s+e.hours,0)+"h",c:"#34d399"},
                    {l:"Utilization",v:fmtPct(Math.min(100,Math.round(monthEntries.filter(e=>e.engineer_id===viewEngId&&e.entry_type==="work").reduce((s,e)=>s+e.hours,0)/targetHrs*100))),c:"#a78bfa"},
                  ].map((s,i)=><div key={i} style={{textAlign:"center"}}>
                    <div style={{fontFamily:"'IBM Plex Mono',monospace",fontSize:17,fontWeight:700,color:s.c}}>{s.v}</div>
                    <div style={{fontSize:10,color:"#253a52"}}>{s.l}</div>
                  </div>)}
                </div>
              </div>}

              {/* Clipboard banner */}
              {clipboard&&(
                <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",
                  background:"#a78bfa18",border:"1px solid #a78bfa60",borderRadius:8,
                  padding:"8px 14px",marginBottom:10,fontSize:11}}>
                  <span style={{color:"#a78bfa",fontWeight:700}}>
                    ⎘ Clipboard: {clipboard.entries.length} entr{clipboard.entries.length===1?"y":"ies"} from {clipboard.date}
                    <span style={{color:"#7a8faa",fontWeight:400,marginLeft:6}}>
                      — click ⎙ Paste on any allowed day to copy
                    </span>
                  </span>
                  <button onClick={()=>setClipboard(null)}
                    style={{background:"none",border:"none",color:"#4e6479",cursor:"pointer",fontSize:13}}>✕</button>
                </div>
              )}
              {/* 7-day week grid */}
              <div style={{display:"grid",gridTemplateColumns:"repeat(7,1fr)",gap:7}}>
                {weekDays.map(day=>{
                  const dow=new Date(day).getDay();
                  const isWE=myWeekend.includes(dow);
                  const allowed=isDateAllowed(day);
                  const de=entries.filter(e=>e.date===day&&e.engineer_id===viewEngId);
                  const dh=de.reduce((s,e)=>s+e.hours,0);
                  const isToday=day===fmt(today);
                  const isFuture=day>fmt(today);
                  return(
                    <div key={day} className="wc" style={
                      isToday?{borderColor:"#0ea5e9"}:
                      isWE?{borderColor:"#f4721830",background:"#0f0a06",opacity:0.8}:
                      !allowed?{opacity:0.4,borderColor:"#0d1a2d"}:
                      isFuture?{borderColor:"#a78bfa40",background:"#0a0e1f"}:{}
                    }>
                      <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:6}}>
                        <div>
                          <div style={{fontSize:10,fontWeight:700,color:isToday?"#38bdf8":isWE?"#f47218":isFuture?"#a78bfa":"#7a8faa"}}>
                            {DAY_NAMES[dow]}{isWE&&<span style={{fontSize:7,marginLeft:2,color:"#f47218"}}> WE</span>}
                          </div>
                          <div style={{fontSize:9,color:"#253a52"}}>{new Date(day).toLocaleDateString("en-US",{month:"short",day:"numeric"})}</div>
                          {dh>0&&<div style={{fontFamily:"'IBM Plex Mono',monospace",fontSize:9,color:"#38bdf8",marginTop:1}}>{dh}h</div>}
                        </div>
                        <div style={{display:"flex",flexDirection:"column",gap:2,alignItems:"flex-end"}}>
                          {allowed&&<button className="bp" style={{padding:"2px 5px",fontSize:10,
                            background:isWE?"linear-gradient(135deg,#b45309,#92400e)":isFuture?"linear-gradient(135deg,#7c3aed,#6d28d9)":undefined
                          }} onClick={()=>setModalDate(day)}>+</button>}
                          {de.length>0&&allowed&&(
                            <button title="Copy this day" onClick={()=>copyDay(day)}
                              style={{padding:"2px 5px",fontSize:9,borderRadius:4,border:"1px solid #192d47",
                                background:clipboard?.date===day?"#38bdf818":"#060e1c",
                                color:clipboard?.date===day?"#38bdf8":"#4e6479",cursor:"pointer",lineHeight:1}}>
                              {clipboard?.date===day?"✓ Copied":"⎘ Copy"}
                            </button>
                          )}
                          {clipboard&&allowed&&clipboard.date!==day&&(
                            <button title={`Paste ${clipboard.entries.length} entr${clipboard.entries.length===1?"y":"ies"} from ${clipboard.date}`}
                              onClick={()=>pasteDay(day)}
                              style={{padding:"2px 5px",fontSize:9,borderRadius:4,border:"1px solid #a78bfa60",
                                background:"#a78bfa18",color:"#a78bfa",cursor:"pointer",lineHeight:1}}>
                              ⎙ Paste
                            </button>
                          )}
                          {!allowed&&<span style={{fontSize:8,color:"#2e4a66",fontFamily:"'IBM Plex Mono',monospace"}}>LOCKED</span>}
                        </div>
                      </div>
                      {de.map(e=>{
                        const proj=projects.find(p=>p.id===e.project_id);
                        return(
                          <div key={e.id} style={{background:"#08111e",border:`1px solid ${e.billable?"#0c2b4e":"#152535"}`,borderRadius:4,padding:"5px 6px",marginBottom:3,fontSize:9}}>
                            <div style={{display:"flex",justifyContent:"space-between",gap:2}}>
                              <div style={{flex:1,minWidth:0}}>
                                {e.entry_type==="leave"
                                  ?<span style={{color:"#fb923c",fontWeight:600}}>✈ {e.leave_type}</span>
                                  :<><span style={{fontFamily:"'IBM Plex Mono',monospace",color:"#0ea5e9",fontSize:8}}>{proj?.id}</span>
                                    <div style={{color:"#7a8faa",fontSize:8,marginTop:1}}>{e.task_type}</div>
                                    {e.activity&&<div style={{color:"#4e6479",fontSize:8,marginTop:1,fontStyle:"italic",lineHeight:1.3}}>{e.activity.substring(0,35)}{e.activity.length>35?"…":""}</div>}
                                  </>}
                              </div>
                              {canEdit&&<div style={{display:"flex",flexDirection:"column",gap:2}}>
                                <button className="be" style={{padding:"1px 4px",fontSize:9}} onClick={()=>setEditEntry({...e,projectId:e.project_id,type:e.entry_type,taskCategory:e.task_category||"Engineering",taskType:e.task_type||"Basic Engineering",leaveType:e.leave_type||"Annual Leave"})}>✎</button>
                                <button className="bd" style={{padding:"1px 4px",fontSize:9}} onClick={()=>deleteEntry(e.id,e.engineer_id)}>✕</button>
                              </div>}
                            </div>
                            <div style={{display:"flex",justifyContent:"space-between",marginTop:3}}>
                              <span style={{fontFamily:"'IBM Plex Mono',monospace",color:"#38bdf8",fontWeight:700,fontSize:11}}>{e.hours}h</span>
                              {e.billable&&<span style={{fontSize:7,color:"#34d399",fontWeight:700}}>BILL</span>}
                            </div>
                          </div>
                        );
                      })}
                      {de.length===0&&<div style={{color:"#152639",fontSize:9,textAlign:"center",marginTop:16}}>{allowed?"No entries":"—"}</div>}
                    </div>
                  );
                })}
              </div>

              {/* Full month table */}
              <div style={{marginTop:22}}>
                {(()=>{
                  const visEntries=monthEntries.filter(e=>e.engineer_id===viewEngId&&(filterProject==="ALL"||e.project_id===filterProject)).sort((a,b)=>a.date.localeCompare(b.date));
                  const visIds=new Set(visEntries.map(e=>e.id));
                  const allChecked=visIds.size>0&&[...visIds].every(id=>selectedEntries.has(id));
                  const toggleAll=()=>{
                    if(allChecked) setSelectedEntries(prev=>{const n=new Set(prev);visIds.forEach(id=>n.delete(id));return n;});
                    else setSelectedEntries(prev=>{const n=new Set(prev);visIds.forEach(id=>n.add(id));return n;});
                  };
                  return<>
                <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:10}}>
                  <h3 style={{fontSize:13,fontWeight:600,color:"#7a8faa"}}>Full Month — {MONTHS[month]} {year}</h3>
                  <div style={{display:"flex",gap:8,alignItems:"center"}}>
                    {selectedEntries.size>0&&<button style={{background:"#ef4444",border:"none",borderRadius:5,padding:"4px 10px",color:"#fff",fontSize:11,fontWeight:600,cursor:"pointer"}} onClick={bulkDeleteEntries}>🗑 Delete {selectedEntries.size} selected</button>}
                    <select style={{fontSize:11,padding:"4px 8px",width:"auto",background:"#060e1c",border:"1px solid #192d47",borderRadius:5,color:"#f0f6ff",fontFamily:"'IBM Plex Sans',sans-serif"}} value={filterProject} onChange={e=>setFilterProject(e.target.value)}>
                      <option value="ALL">All Projects</option>
                      {projects.map(p=><option key={p.id} value={p.id}>{p.id} — {p.name}</option>)}
                    </select>
                    {filterProject!=="ALL"&&<button style={{background:"transparent",border:"1px solid #192d47",borderRadius:5,padding:"4px 8px",color:"#7a8faa",cursor:"pointer",fontSize:10}} onClick={()=>setFilterProject("ALL")}>✕</button>}
                    <span style={{fontSize:10,color:"#253a52",fontFamily:"'IBM Plex Mono',monospace"}}>{visEntries.reduce((s,e)=>s+e.hours,0)}h</span>
                  </div>
                </div>
                <div className="card">
                  <table>
                    <thead><tr>
                      <th style={{width:28}}><input type="checkbox" checked={allChecked} onChange={toggleAll} style={{cursor:"pointer"}}/></th>
                      <th>Date</th><th>Project</th><th>Task</th><th>Activity</th><th>Hrs</th><th>Type</th><th style={{width:80}}>Actions</th>
                    </tr></thead>
                    <tbody>
                      {visEntries.length===0&&<tr><td colSpan={8} style={{textAlign:"center",color:"#253a52",padding:20}}>No entries for {MONTHS[month]} {year}</td></tr>}
                      {visEntries.map(e=>{
                        const proj=projects.find(p=>p.id===e.project_id);
                        const checked=selectedEntries.has(e.id);
                        return(
                          <tr key={e.id} style={{background:checked?"#0d1e3440":"transparent"}}>
                            <td><input type="checkbox" checked={checked} onChange={()=>setSelectedEntries(prev=>{const n=new Set(prev);checked?n.delete(e.id):n.add(e.id);return n;})} style={{cursor:"pointer"}}/></td>
                            <td style={{fontFamily:"'IBM Plex Mono',monospace",fontSize:11}}>{e.date}</td>
                            <td style={{fontSize:11,color:"#38bdf8"}}>{proj?.id||<span style={{color:"#fb923c"}}>{e.leave_type}</span>}</td>
                            <td style={{fontSize:11,color:"#7a8faa"}}>{e.task_type||"—"}</td>
                            <td style={{fontSize:11,color:"#4e6479",fontStyle:"italic",maxWidth:160,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{e.activity||"—"}</td>
                            <td style={{fontFamily:"'IBM Plex Mono',monospace",color:"#38bdf8",fontWeight:700}}>{e.hours}h</td>
                            <td><span style={{fontSize:9,padding:"2px 5px",borderRadius:3,background:e.entry_type==="leave"?"#7c2d1230":"#022c2230",color:e.entry_type==="leave"?"#fb923c":"#34d399",fontWeight:700}}>{e.entry_type}</span></td>
                            <td><div style={{display:"flex",gap:5}}>
                              <button className="be" onClick={()=>setEditEntry({...e,projectId:e.project_id,type:e.entry_type,taskCategory:e.task_category||"Engineering",taskType:e.task_type||"Basic Engineering",leaveType:e.leave_type||"Annual Leave"})}>✎</button>
                              <button className="bd" onClick={()=>deleteEntry(e.id,e.engineer_id)}>✕</button>
                            </div></td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
                </>;
                })()}
              </div>
            </div>
          )}

          {/* ════ PROJECTS ════ */}
          {view==="projects"&&<ProjectsView
            projects={projects} projSearch={projSearch} setProjSearch={setProjSearch}
            projStatusFilter={projStatusFilter} setProjStatusFilter={setProjStatusFilter}
            monthEntries={monthEntries} projStats={projStats}
            isAdmin={isAdmin} isAcct={isAcct}
            setShowProjModal={setShowProjModal} setEditProjModal={setEditProjModal} deleteProject={deleteProject}
            fmtCurrency={fmtCurrency}
          />}

          {/* ════ TEAM ════ */}
          {view==="team"&&(()=>{
            const filteredTeam=filterEngineer==="ALL"?engStats:engStats.filter(e=>e.id===+filterEngineer);
            const teamMonthEntries=monthEntries.filter(e=>filterProject==="ALL"||e.project_id===filterProject);
            const selectedEng=filterEngineer!=="ALL"?engStats.find(e=>e.id===+filterEngineer):null;
            return(
            <div>
              {/* Filter bar */}
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-end",marginBottom:12}}>
                <div>
                  <h1 style={{fontSize:21,fontWeight:700,color:"#f0f6ff"}}>Team</h1>
                  <p style={{color:"#2e4a66",fontSize:12,marginTop:3}}>{engineers.length} members · {MONTHS[month]} {year}</p>
                </div>
                <div style={{display:"flex",gap:8,alignItems:"flex-end"}}>
                  <div><Lbl>Engineer</Lbl>
                    <select style={{width:160}} value={filterEngineer} onChange={e=>setFilterEngineer(e.target.value)}>
                      <option value="ALL">All Engineers</option>
                      {engineers.map(e=><option key={e.id} value={e.id}>{e.name}</option>)}
                    </select>
                  </div>
                  <div><Lbl>Project</Lbl>
                    <select style={{width:160}} value={filterProject} onChange={e=>setFilterProject(e.target.value)}>
                      <option value="ALL">All Projects</option>
                      {projects.map(p=><option key={p.id} value={p.id}>{p.id} — {p.name}</option>)}
                    </select>
                  </div>
                  {(filterEngineer!=="ALL"||filterProject!=="ALL")&&
                    <button className="bg" style={{fontSize:11}} onClick={()=>{setFilterEngineer("ALL");setFilterProject("ALL");}}>✕ Clear</button>}
                </div>
              </div>

              {/* ── TOTAL HOURS SUMMARY BOX (shows when any filter active) ── */}
              {(()=>{
                // Entries matching both filters
                const fEntries=monthEntries.filter(e=>
                  (filterEngineer==="ALL"||e.engineer_id===+filterEngineer)&&
                  (filterProject==="ALL"||e.project_id===filterProject)
                );
                const fWork=fEntries.filter(e=>e.entry_type==="work");
                const fLeave=fEntries.filter(e=>e.entry_type==="leave");
                const totalW=fWork.reduce((s,e)=>s+e.hours,0);
                const totalB=fWork.reduce((s,e)=>{const p=projects.find(x=>x.id===e.project_id);return s+(p&&p.billable?e.hours:0);},0);
                const totalNB=totalW-totalB;
                const totalL=fLeave.length;
                // Target hours based on filtered engineers
                const filtEngs=filterEngineer==="ALL"?engineers:engineers.filter(e=>e.id===+filterEngineer);
                const targetW=filtEngs.reduce((s,eng)=>{
                  try{const wd=eng.weekend_days?JSON.parse(eng.weekend_days):DEFAULT_WEEKEND;return s+getTargetHrs(year,month,wd);}catch{return s+getTargetHrs(year,month,DEFAULT_WEEKEND);}
                },0);
                const util=targetW?Math.round(totalW/targetW*100):0;
                const selProjName=filterProject!=="ALL"?projects.find(p=>p.id===filterProject)?.name:"";
                const selEngName=filterEngineer!=="ALL"?engineers.find(e=>e.id===+filterEngineer)?.name:"";
                const label=[selEngName,selProjName].filter(Boolean).join(" · ")||"All";
                return(
                  <div style={{background:"#060e1c",border:"1px solid #192d47",borderRadius:8,padding:"12px 16px",marginBottom:16,display:"flex",gap:0,alignItems:"center"}}>
                    <div style={{marginRight:20,minWidth:120}}>
                      <div style={{fontSize:10,color:"#2e4a66",fontWeight:700,textTransform:"uppercase",letterSpacing:".06em",marginBottom:2}}>Filter Summary</div>
                      <div style={{fontSize:12,color:"#7a8faa",fontWeight:600}}>{label}</div>
                      <div style={{fontSize:10,color:"#253a52"}}>{MONTHS[month]} {year}</div>
                    </div>
                    <div style={{flex:1,display:"grid",gridTemplateColumns:"repeat(5,1fr)",gap:8}}>
                      {[
                        {l:"Total Work",v:totalW+"h",c:"#f0f6ff"},
                        {l:"Billable",v:totalB+"h",c:"#34d399",show:isAdmin||isAcct},
                        {l:"Non-Billable",v:totalNB+"h",c:"#fb923c",show:isAdmin||isAcct},
                        {l:"Leave Days",v:totalL+"d",c:"#f472b6"},
                        {l:"Utilization",v:util+"%",c:util>=80?"#34d399":util>=60?"#fb923c":"#f87171"},
                      ].filter(m=>m.show!==false).map((m,i)=>(
                        <div key={i} style={{background:"#0b1526",borderRadius:6,padding:"8px 10px",textAlign:"center",border:"1px solid #192d47"}}>
                          <div style={{fontFamily:"'IBM Plex Mono',monospace",fontSize:18,fontWeight:700,color:m.c,lineHeight:1}}>{m.v}</div>
                          <div style={{fontSize:9,color:"#2e4a66",marginTop:4,textTransform:"uppercase",letterSpacing:".05em"}}>{m.l}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })()}

              {/* Individual detail view when one engineer selected */}
              {selectedEng&&(
                <div className="card" style={{marginBottom:16}}>
                  <div style={{display:"flex",alignItems:"center",gap:16,marginBottom:14}}>
                    <div className="av" style={{width:50,height:50,fontSize:15}}>{selectedEng.name?.slice(0,2).toUpperCase()}</div>
                    <div style={{flex:1}}>
                      <div style={{fontSize:17,fontWeight:700}}>{selectedEng.name}</div>
                      <div style={{fontSize:12,color:"#2e4a66"}}>{selectedEng.role} · {selectedEng.level}</div>
                      <span className="role-badge" style={{background:ROLE_COLORS[selectedEng.role_type]+"20",color:ROLE_COLORS[selectedEng.role_type]||"#4e6479",marginTop:4,display:"inline-block"}}>{ROLE_LABELS[selectedEng.role_type]}</span>
                    </div>
                    <div style={{display:"flex",gap:20,textAlign:"center"}}>
                      {[
                        {l:"Work Hrs",v:selectedEng.workHrs+"h",c:"#38bdf8"},
                        {l:"Utilization",v:fmtPct(selectedEng.utilization),c:selectedEng.utilization>=80?"#34d399":selectedEng.utilization>=60?"#fb923c":"#f87171"},
                        {l:"Leave Days",v:selectedEng.leaveDays+"d",c:"#fb923c"},
                        ...(isAdmin||isAcct?[{l:"Revenue",v:fmtCurrency(selectedEng.revenue),c:"#a78bfa"}]:[]),
                      ].map((s,i)=>(
                        <div key={i} style={{background:"#060e1c",borderRadius:6,padding:"8px 16px"}}>
                          <div style={{fontFamily:"'IBM Plex Mono',monospace",fontSize:18,fontWeight:700,color:s.c}}>{s.v}</div>
                          <div style={{fontSize:9,color:"#253a52"}}>{s.l}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                  {/* Project breakdown for selected engineer */}
                  <table>
                    <thead><tr><th>Date</th><th>Project</th><th>Task</th><th>Activity</th><th>Hrs</th></tr></thead>
                    <tbody>
                      {teamMonthEntries.filter(e=>e.engineer_id===selectedEng.id&&e.entry_type==="work").sort((a,b)=>a.date.localeCompare(b.date)).map(e=>{
                        const p=projects.find(x=>x.id===e.project_id);
                        return<tr key={e.id}>
                          <td style={{fontFamily:"'IBM Plex Mono',monospace",fontSize:11}}>{e.date}</td>
                          <td style={{fontSize:11,color:"#38bdf8"}}>{p?.id||<span style={{color:"#7a8faa"}}>—</span>}</td>
                          <td style={{fontSize:11,color:"#7a8faa"}}>{e.task_type||"—"}</td>
                          <td style={{fontSize:11,color:"#4e6479",fontStyle:"italic",maxWidth:200,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{e.activity||"—"}</td>
                          <td style={{fontFamily:"'IBM Plex Mono',monospace",fontWeight:700,color:"#38bdf8"}}>{e.hours}h</td>
                        </tr>;
                      })}
                      {teamMonthEntries.filter(e=>e.engineer_id===selectedEng.id&&e.entry_type==="work").length===0&&
                        <tr><td colSpan={5} style={{textAlign:"center",color:"#253a52",padding:16}}>No work entries</td></tr>}
                    </tbody>
                  </table>
                </div>
              )}

              {/* Cards grid */}
              <div style={{display:"grid",gridTemplateColumns:"repeat(5,1fr)",gap:11}}>
                {filteredTeam.map(eng=>(
                  <div key={eng.id} className="card" style={{textAlign:"center",cursor:"pointer",border:filterEngineer===String(eng.id)?"1px solid #38bdf8":"1px solid #192d47"}}
                    onClick={()=>setFilterEngineer(filterEngineer===String(eng.id)?"ALL":String(eng.id))}>
                    <div className="av" style={{width:44,height:44,fontSize:13,margin:"0 auto 8px"}}>{eng.name?.slice(0,2).toUpperCase()}</div>
                    <div style={{fontSize:13,fontWeight:600}}>{eng.name}</div>
                    <div style={{fontSize:10,color:"#2e4a66",marginBottom:4}}>{eng.role}</div>
                    <div style={{marginBottom:8}}><span className="role-badge" style={{background:ROLE_COLORS[eng.role_type]+"20",color:ROLE_COLORS[eng.role_type]||"#4e6479"}}>{ROLE_LABELS[eng.role_type]||eng.role_type}</span></div>
                    <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:5,marginBottom:7}}>
                      <div style={{background:"#060e1c",borderRadius:5,padding:"6px 4px"}}>
                        <div style={{fontFamily:"'IBM Plex Mono',monospace",fontSize:14,fontWeight:700,color:"#38bdf8"}}>{(filterProject==="ALL"?eng.workHrs:teamMonthEntries.filter(e=>String(e.engineer_id)===String(eng.id)&&e.entry_type==="work").reduce((s,e)=>s+e.hours,0))}h</div>
                        <div style={{fontSize:9,color:"#253a52"}}>work hrs</div>
                      </div>
                      <div style={{background:"#060e1c",borderRadius:5,padding:"6px 4px"}}>
                        <div style={{fontFamily:"'IBM Plex Mono',monospace",fontSize:14,fontWeight:700,color:eng.utilization>=80?"#34d399":eng.utilization>=60?"#fb923c":"#f87171"}}>{fmtPct(eng.utilization)}</div>
                        <div style={{fontSize:9,color:"#253a52"}}>util.</div>
                      </div>
                    </div>
                    <div style={{fontSize:10,display:"flex",justifyContent:"space-between",color:"#4e6479",paddingBottom:6}}>
                      {(isAdmin||isAcct)&&<span>Bill: <span style={{color:"#a78bfa",fontWeight:600}}>{fmtPct(eng.billability)}</span></span>}
                      {eng.leaveDays>0&&<span style={{color:"#fb923c"}}>✈{eng.leaveDays}d</span>}
                    </div>
                    {(isAdmin||isAcct)&&<div style={{fontSize:11,fontFamily:"'IBM Plex Mono',monospace",color:"#34d399",marginBottom:5}}>{fmtCurrency(eng.revenue)}</div>}
                    <div style={{fontSize:9,padding:"1px 6px",borderRadius:3,background:"#152639",color:"#4e6479",display:"inline-block"}}>{eng.level}</div>
                  </div>
                ))}
              </div>
            </div>
          );})()}

          {/* ════ REPORTS ════ */}
          {view==="reports"&&canReport&&(
            <div>
              <div style={{marginBottom:20}}>
                <h1 style={{fontSize:21,fontWeight:700,color:"#f0f6ff"}}>Reports & PDF Export</h1>
                <p style={{color:"#2e4a66",fontSize:12,marginTop:3}}>{MONTHS[month]} {year}</p>
              </div>

              {/* Report type cards */}
              <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:10,marginBottom:18}}>
                {[
                  {id:"utilization",icon:"◉",label:"Team Utilization",desc:"All engineers utilization & billability",show:isAdmin||isAcct},
                  {id:"individual",icon:"👤",label:"Individual Timesheet",desc:"One engineer — full monthly timesheet PDF",show:true},
                  {id:"task",icon:"⊟",label:"Task Analysis",desc:"Task categories & activity log",show:true},
                  {id:"projtasks",icon:"◈",label:"Project Analysis",desc:"Per-project hours, tasks & engineer breakdown",show:isAdmin||isAcct||isLead},
                  {id:"vacation",icon:"✈",label:"Vacation Report",desc:"Leave & absence summary per engineer",show:true},
                  {id:"monthly",icon:"⊞",label:"Monthly Mgmt",desc:"Full executive summary",show:isAdmin||isAcct},
                  {id:"invoice",icon:"🧾",label:"Invoice Export",desc:"Billable invoice per month",show:canInvoice},
                ].filter(r=>r.show).map(r=>(
                  <div key={r.id} className={`rpt-card ${activeRpt===r.id?"sel":""}`} onClick={()=>setActiveRpt(r.id)}>
                    <div style={{fontSize:18,marginBottom:5}}>{r.icon}</div>
                    <div style={{fontSize:12,fontWeight:700,marginBottom:3}}>{r.label}</div>
                    <div style={{fontSize:10,color:"#2e4a66",lineHeight:1.4}}>{r.desc}</div>
                  </div>
                ))}
              </div>

              {/* Individual timesheet export */}
              {activeRpt==="individual"&&(
                <div>
                  <div className="card" style={{marginBottom:14}}>
                    <h3 style={{fontSize:13,fontWeight:600,color:"#f0f6ff",marginBottom:14}}>👤 Timesheet Export — {MONTHS[month]} {year}</h3>
                    <div style={{display:"grid",gridTemplateColumns:"1fr auto auto",gap:12,alignItems:"flex-end",marginBottom:6}}>
                      <div><Lbl>Select Engineer (or export all)</Lbl>
                        <select value={rptEngId||"ALL"} onChange={e=>setRptEngId(e.target.value==="ALL"?null:+e.target.value)}>
                          <option value="ALL">📋 All Engineers (separate PDFs)</option>
                          {engineers.map(e=><option key={e.id} value={e.id}>{e.name} · {e.role}</option>)}
                        </select>
                      </div>
                      <button className="bp" onClick={()=>{
                        if(!rptEngId){
                          // Export all engineers one by one
                          engineers.forEach((eng,i)=>setTimeout(()=>buildTimesheetPDF(eng,monthEntries,projects,month,year),i*600));
                          showToast(`Exporting ${engineers.length} timesheets — check your browser tabs`);
                        } else {
                          const eng=engineers.find(e=>e.id===rptEngId);
                          if(eng) buildTimesheetPDF(eng,monthEntries,projects,month,year);
                        }
                      }}>⬇ Export PDF{!rptEngId?" (All)":""}</button>
                    </div>
                    <div style={{fontSize:11,color:"#2e4a66"}}>
                      {!rptEngId?"Will open one PDF per engineer in separate browser tabs — allow popups if prompted":"Select an engineer above to preview their timesheet"}
                    </div>
                  </div>
                  <div className="card">
                  <h3 style={{fontSize:12,fontWeight:600,color:"#7a8faa",marginBottom:14}}>{rptEngId?"Timesheet Preview":"All Engineers Summary"}</h3>
                  {!rptEngId&&(
                    <table>
                      <thead><tr><th>Engineer</th><th>Role</th><th>Work Hrs</th><th>Projects</th><th>Leave Days</th><th>Quick Export</th></tr></thead>
                      <tbody>{engineers.map(eng=>{
                        const ee=monthEntries.filter(e=>String(e.engineer_id)===String(eng.id));
                        const wh=ee.filter(e=>e.entry_type==="work").reduce((s,e)=>s+e.hours,0);
                        const ld=ee.filter(e=>e.entry_type==="leave").length;
                        const prjs=[...new Set(ee.filter(e=>e.entry_type==="work").map(e=>e.project_id))].length;
                        return<tr key={eng.id}>
                          <td><div style={{display:"flex",alignItems:"center",gap:7}}><div className="av" style={{fontSize:9,width:24,height:24}}>{eng.name?.slice(0,2).toUpperCase()}</div><span style={{fontWeight:500}}>{eng.name}</span></div></td>
                          <td style={{fontSize:11,color:"#7a8faa"}}>{eng.role}</td>
                          <td style={{fontFamily:"'IBM Plex Mono',monospace",color:"#38bdf8",fontWeight:700}}>{wh}h</td>
                          <td style={{fontFamily:"'IBM Plex Mono',monospace"}}>{prjs}</td>
                          <td style={{color:ld>0?"#fb923c":"#253a52"}}>{ld}</td>
                          <td><button className="be" style={{fontSize:11}} onClick={()=>buildTimesheetPDF(eng,monthEntries,projects,month,year)}>⬇ PDF</button></td>
                        </tr>;
                      })}</tbody>
                    </table>
                  )}
                  {rptEngId&&(()=>{
                    const eng=engineers.find(e=>e.id===rptEngId);
                    const engEntries=monthEntries.filter(e=>e.engineer_id===rptEngId);
                    const wh=engEntries.filter(e=>e.entry_type==="work").reduce((s,e)=>s+e.hours,0);
                    const ld=engEntries.filter(e=>e.entry_type==="leave").length;
                    const projs=[...new Set(engEntries.filter(e=>e.entry_type==="work").map(e=>e.project_id))];
                    return(
                      <div style={{background:"#060e1c",borderRadius:8,padding:"14px 16px"}}>
                        <div style={{display:"flex",alignItems:"center",gap:12,marginBottom:12}}>
                          <div className="av" style={{width:40,height:40,fontSize:13}}>{eng?.name?.slice(0,2).toUpperCase()}</div>
                          <div><div style={{fontSize:14,fontWeight:600}}>{eng?.name}</div><div style={{fontSize:11,color:"#2e4a66"}}>{eng?.role} · {eng?.level}</div></div>
                          <div style={{marginLeft:"auto",display:"flex",gap:20,textAlign:"center"}}>
                            {[{l:"Work Hrs",v:wh+"h",c:"#38bdf8"},{l:"Leave Days",v:ld+"d",c:"#fb923c"},{l:"Projects",v:projs.length,c:"#a78bfa"}].map((s,i)=>(
                              <div key={i}><div style={{fontFamily:"'IBM Plex Mono',monospace",fontSize:17,fontWeight:700,color:s.c}}>{s.v}</div><div style={{fontSize:9,color:"#253a52"}}>{s.l}</div></div>
                            ))}
                          </div>
                        </div>
                        <table>
                          <thead><tr><th>Date</th><th>Project</th><th>Task</th><th>Activity</th><th>Hrs</th></tr></thead>
                          <tbody>{engEntries.filter(e=>e.entry_type==="work").sort((a,b)=>a.date.localeCompare(b.date)).map(e=>{
                            const proj=projects.find(p=>p.id===e.project_id);
                            return<tr key={e.id}>
                              <td style={{fontFamily:"'IBM Plex Mono',monospace",fontSize:11}}>{e.date}</td>
                              <td style={{fontSize:11,color:"#38bdf8"}}>{proj?.id}</td>
                              <td style={{fontSize:11,color:"#7a8faa"}}>{e.task_type}</td>
                              <td style={{fontSize:11,color:"#4e6479",fontStyle:"italic",maxWidth:200,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{e.activity||"—"}</td>
                              <td style={{fontFamily:"'IBM Plex Mono',monospace",color:"#38bdf8",fontWeight:700}}>{e.hours}h</td>
                            </tr>;})}
                          </tbody>
                        </table>
                      </div>
                    );
                  })()}
                  </div>
                </div>
              )}

              {/* Utilization preview */}
              {activeRpt==="utilization"&&(
                <div className="card">
                  <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:12}}>
                    <h3 style={{fontSize:12,fontWeight:600,color:"#7a8faa"}}>Team Utilization Preview</h3>
                    <button className="bp" onClick={buildUtilizationPDF}>⬇ Export PDF</button>
                  </div>
                  <table>
                    <thead><tr><th>Engineer</th><th>Level</th><th>Work Hrs</th><th>Billable</th><th>Leave</th><th>Utilization</th><th>Billability</th><th>Revenue</th></tr></thead>
                    <tbody>{engStats.map(e=>(
                      <tr key={e.id}>
                        <td><div style={{display:"flex",alignItems:"center",gap:7}}><div className="av" style={{fontSize:9,width:24,height:24}}>{e.name?.slice(0,2).toUpperCase()}</div><div><div style={{fontWeight:500,fontSize:12}}>{e.name}</div><div style={{fontSize:9,color:"#2e4a66"}}>{e.role}</div></div></div></td>
                        <td><span style={{fontSize:9,padding:"1px 5px",borderRadius:3,background:"#152639",color:"#4e6479"}}>{e.level}</span></td>
                        <td style={{fontFamily:"'IBM Plex Mono',monospace"}}>{e.workHrs}h</td>
                        <td style={{fontFamily:"'IBM Plex Mono',monospace",color:"#38bdf8"}}>{e.billableHrs}h</td>
                        <td style={{color:e.leaveDays>0?"#fb923c":"#253a52"}}>{e.leaveDays}</td>
                        <td><div style={{display:"flex",alignItems:"center",gap:5}}><div style={{background:"#060e1c",height:4,borderRadius:3,width:60,overflow:"hidden"}}><div style={{height:"100%",width:`${e.utilization}%`,background:e.utilization>=80?"linear-gradient(90deg,#34d399,#10b981)":e.utilization>=60?"linear-gradient(90deg,#fb923c,#f59e0b)":"linear-gradient(90deg,#f87171,#ef4444)",borderRadius:3}}/></div><span style={{fontFamily:"'IBM Plex Mono',monospace",fontSize:10}}>{fmtPct(e.utilization)}</span></div></td>
                        <td><div style={{display:"flex",alignItems:"center",gap:5}}><div style={{background:"#060e1c",height:4,borderRadius:3,width:50,overflow:"hidden"}}><div style={{height:"100%",width:`${e.billability}%`,background:"linear-gradient(90deg,#a78bfa,#7c3aed)",borderRadius:3}}/></div><span style={{fontFamily:"'IBM Plex Mono',monospace",fontSize:10}}>{fmtPct(e.billability)}</span></div></td>
                        <td style={{fontFamily:"'IBM Plex Mono',monospace",color:"#a78bfa"}}>{fmtCurrency(e.revenue)}</td>
                      </tr>
                    ))}</tbody>
                  </table>
                </div>
              )}

              {/* Task analysis */}
              {activeRpt==="task"&&(()=>{
                const GC={"SCADA":"#38bdf8","RTU-PLC":"#a78bfa","Protection":"#f87171","General":"#34d399"};
                return(
                <div className="card">
                  <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:16}}>
                    <div>
                      <h3 style={{fontSize:13,fontWeight:700,color:"#f0f6ff",margin:0}}>Task Analysis</h3>
                      <p style={{fontSize:11,color:"#2e4a66",marginTop:2,marginBottom:0}}>{MONTHS[month]} {year} · {totalWorkHrs}h work logged</p>
                    </div>
                    <button className="bp" onClick={buildTaskPDF}>⬇ Export PDF</button>
                  </div>

                  {taskStats.length===0&&<p style={{color:"#253a52",fontSize:12}}>No work hours logged for this period.</p>}

                  {taskStats.map(grp=>{
                    const pct=totalWorkHrs?Math.round(grp.hours/totalWorkHrs*100):0;
                    const gc=GC[grp.category]||"#38bdf8";
                    return(
                    <div key={grp.category} style={{marginBottom:18,paddingBottom:18,borderBottom:"1px solid #0d1a2d"}}>
                      {/* Group header + bar */}
                      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:6}}>
                        <div style={{display:"flex",alignItems:"center",gap:8}}>
                          <div style={{width:10,height:10,borderRadius:3,background:gc,flexShrink:0}}/>
                          <span style={{fontWeight:700,fontSize:13,color:gc}}>{grp.category}</span>
                        </div>
                        <div style={{display:"flex",gap:14,fontSize:11}}>
                          <span style={{fontFamily:"'IBM Plex Mono',monospace",color:gc,fontWeight:700}}>{grp.hours}h</span>
                          <span style={{color:"#4e6479"}}>{pct}%</span>
                          <span style={{color:"#34d399"}}>{grp.hours?Math.round(grp.billable/grp.hours*100):0}% billable</span>
                        </div>
                      </div>
                      {/* Group progress bar */}
                      <div style={{background:"#060e1c",height:6,borderRadius:4,overflow:"hidden",marginBottom:10}}>
                        <div style={{height:"100%",width:`${pct}%`,background:gc,borderRadius:4,transition:"width .4s"}}/>
                      </div>
                      {/* Category pills with activity drill-down */}
                      <div style={{display:"grid",gap:6}}>
                        {Object.entries(grp.tasks).sort((a,b)=>b[1].hrs-a[1].hrs).map(([cat,catData])=>{
                          const catPct=grp.hours?Math.round(catData.hrs/grp.hours*100):0;
                          const topActs=Object.entries(catData.activities||{}).sort((a,b)=>b[1]-a[1]).slice(0,4);
                          return(
                          <div key={cat} style={{background:"#060e1c",border:"1px solid #192d47",borderRadius:6,padding:"8px 10px"}}>
                            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:topActs.length?4:0}}>
                              <span style={{fontSize:11,fontWeight:600,color:"#7a8faa"}}>{cat}</span>
                              <div style={{display:"flex",gap:8,alignItems:"center"}}>
                                <div style={{background:"#0d1a2d",height:4,borderRadius:3,width:50,overflow:"hidden"}}>
                                  <div style={{height:"100%",width:`${catPct}%`,background:gc+"80",borderRadius:3}}/>
                                </div>
                                <span style={{fontFamily:"'IBM Plex Mono',monospace",fontSize:10,color:gc}}>{catData.hrs}h</span>
                                <span style={{fontSize:9,color:"#2e4a66"}}>{catPct}%</span>
                              </div>
                            </div>
                            {topActs.length>0&&(
                              <div style={{display:"flex",flexWrap:"wrap",gap:4,marginTop:4}}>
                                {topActs.map(([act,hrs])=>(
                                  <span key={act} style={{background:"#080f1e",border:"1px solid #0d1a2d",borderRadius:4,
                                    padding:"2px 6px",fontSize:9,color:"#4e6479"}}>
                                    {act.length>30?act.slice(0,28)+"…":act}
                                    <span style={{color:"#38bdf8",fontFamily:"'IBM Plex Mono',monospace",marginLeft:4}}>{hrs}h</span>
                                  </span>
                                ))}
                                {Object.keys(catData.activities||{}).length>4&&(
                                  <span style={{fontSize:9,color:"#2e4a66",padding:"2px 4px"}}>
                                    +{Object.keys(catData.activities).length-4} more
                                  </span>
                                )}
                              </div>
                            )}
                          </div>);
                        })}
                      </div>
                    </div>
                  );})}
                </div>);
              })()}

              {/* ════ PROJECT TASKS ANALYSIS ════ */}
              {activeRpt==="projtasks"&&<ProjectTasksReport allEntries={entries} projects={projects} engineers={engineers} MONTHS={MONTHS} fmtCurrency={fmtCurrency} fmtPct={fmtPct} isAdmin={isAdmin} isAcct={isAcct}/>}

           {/* Vacation Report */}
              {activeRpt==="vacation"&&<VacationReport
                engineers={engineers} leaveEntries={leaveEntries} allEntries={entries}
                month={month} year={year} MONTHS={MONTHS}
                onExport={()=>buildVacationPDF(engineers,entries,leaveEntries,projects,month,year)}
              />}

              {/* Monthly mgmt */}
              {activeRpt==="monthly"&&(
                <div className="card" style={{textAlign:"center",padding:40}}>
                  <div style={{fontSize:36,marginBottom:10}}>📊</div>
                  <div style={{fontSize:14,fontWeight:700,marginBottom:6}}>Monthly Management Report</div>
                  <div style={{fontSize:12,color:"#2e4a66",marginBottom:18}}>Full executive summary for {MONTHS[month]} {year}</div>
                  <button className="bp" onClick={buildMonthlyPDF}>⬇ Export PDF</button>
                </div>
              )}

              {/* Invoice */}
              {activeRpt==="invoice"&&canInvoice&&(()=>{
                // All projects with hours — billable ones count toward invoice total
                const allWithHours=projStats.filter(p=>p.hours>0);
                const billableActive=allWithHours.filter(p=>p.billable);
                const filteredProjs=invoiceProjId==="ALL"?allWithHours:allWithHours.filter(p=>p.id===invoiceProjId);
                const invTotal=filteredProjs.filter(p=>p.billable).reduce((s,p)=>s+p.revenue,0);
                const invHrs=filteredProjs.filter(p=>p.billable).reduce((s,p)=>s+p.hours,0);
                return(
                <div>
                  {/* Invoice selector */}
                  <div className="card" style={{marginBottom:14}}>
                    <h3 style={{fontSize:13,fontWeight:600,color:"#f0f6ff",marginBottom:14}}>🧾 Invoice Export — {MONTHS[month]} {year}</h3>
                    {/* Quick-fix: bulk mark all active projects as billable */}
                    {allWithHours.some(p=>!p.billable)&&(
                      <div style={{background:"#1a0f00",border:"1px solid #fb923c40",borderRadius:6,padding:"8px 12px",marginBottom:12,display:"flex",alignItems:"center",justifyContent:"space-between"}}>
                        <span style={{fontSize:11,color:"#fb923c"}}>
                          ⚠ {allWithHours.filter(p=>!p.billable).length} project(s) marked as non-billable — excluded from invoice
                        </span>
                        <button className="bg" style={{fontSize:11,borderColor:"#fb923c",color:"#fb923c",whiteSpace:"nowrap"}} onClick={async()=>{
                          const ids=allWithHours.filter(p=>!p.billable).map(p=>p.id);
                          for(const id of ids){
                            await supabase.from("projects").update({billable:true}).eq("id",id);
                          }
                          await loadAll();
                          showToast(`Marked ${ids.length} project(s) as billable ✓`);
                        }}>Mark all as billable</button>
                      </div>
                    )}
                    <div style={{display:"grid",gridTemplateColumns:"1fr auto",gap:12,alignItems:"flex-end",marginBottom:16}}>
                      <div><Lbl>Invoice Scope</Lbl>
                        <select value={invoiceProjId} onChange={e=>setInvoiceProjId(e.target.value)}>
                          <option value="ALL">📋 All Billable Projects (Combined Invoice)</option>
                          {allWithHours.filter(p=>p.billable).map(p=><option key={p.id} value={p.id}>{p.id} — {p.name} · {p.hours}h · {fmtCurrency(p.revenue)}</option>)}
                        </select>
                      </div>
                      <button className="bp" style={{background:"linear-gradient(135deg,#a78bfa,#7c3aed)",whiteSpace:"nowrap"}}
                        onClick={()=>buildInvoicePDF(projects,entries,engineers,month,year,invoiceProjId==="ALL"?undefined:invoiceProjId)}>
                        🧾 Export PDF
                      </button>
                    </div>
                    {/* KPI strip */}
                    <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:10}}>
                      {[
                        {l:invoiceProjId==="ALL"?"Total Billable":"Project Total",v:fmtCurrency(invTotal),c:"#a78bfa"},
                        {l:"Billable Hours",v:invHrs+"h",c:"#38bdf8"},
                        {l:invoiceProjId==="ALL"?"Projects":"Engineers",v:invoiceProjId==="ALL"?filteredProjs.length:[...new Set(entries.filter(e=>e.project_id===invoiceProjId&&new Date(e.date).getMonth()===month&&new Date(e.date).getFullYear()===year).map(e=>e.engineer_id))].length,c:"#34d399"},
                      ].map((s,i)=><div key={i} className="metric" style={{textAlign:"center"}}>
                        <div style={{fontFamily:"'IBM Plex Mono',monospace",fontSize:22,fontWeight:700,color:s.c}}>{s.v}</div>
                        <div style={{fontSize:10,color:"#2e4a66",marginTop:4}}>{s.l}</div>
                      </div>)}
                    </div>
                  </div>
                  {/* Preview table */}
                  <div className="card">
                    <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:12}}>
                      <h3 style={{fontSize:12,fontWeight:600,color:"#7a8faa",margin:0}}>
                        {invoiceProjId==="ALL"?"All Projects — Feb "+year+" (billable highlighted)":"Project Invoice Preview"}
                      </h3>
                      {allWithHours.filter(p=>!p.billable||p.rate_per_hour===0).length>0&&(
                        <span style={{fontSize:10,color:"#fb923c",background:"#2a1a0a",border:"1px solid #fb923c40",borderRadius:4,padding:"2px 8px"}}>
                          ⚠ {allWithHours.filter(p=>!p.billable||p.rate_per_hour===0).length} projects need rate set — go to Projects page to edit
                        </span>
                      )}
                    </div>
                    <table>
                      <thead><tr><th>Project No.</th><th>Name</th><th>Client</th><th>Hours</th><th>Rate</th><th>Amount</th><th>Status</th></tr></thead>
                      <tbody>
                        {filteredProjs.map(p=>{
                          const needsRate=p.billable&&p.rate_per_hour===0;
                          const notBillable=!p.billable;
                          const rowStyle={cursor:"pointer",opacity:notBillable?0.45:1,background:notBillable?"#07101e":"inherit"};
                          return(
                          <tr key={p.id} style={rowStyle} onClick={()=>setInvoiceProjId(p.id)}>
                            <td style={{fontFamily:"'IBM Plex Mono',monospace",fontSize:11,color:notBillable?"#4e6479":"#38bdf8"}}>{p.id}</td>
                            <td style={{fontSize:11,fontWeight:500,color:notBillable?"#4e6479":"#f0f6ff"}}>{p.name}</td>
                            <td style={{fontSize:11,color:"#7a8faa"}}>{p.client}</td>
                            <td style={{fontFamily:"'IBM Plex Mono',monospace",color:notBillable?"#4e6479":"#f0f6ff"}}>{p.hours}h</td>
                            <td style={{fontFamily:"'IBM Plex Mono',monospace",color:needsRate?"#fb923c":notBillable?"#4e6479":"#7a8faa"}}>
                              {notBillable?"—":`$${p.rate_per_hour}/h`}
                            </td>
                            <td style={{fontFamily:"'IBM Plex Mono',monospace",color:notBillable?"#4e6479":"#a78bfa",fontWeight:700}}>
                              {notBillable?"—":fmtCurrency(p.revenue)}
                            </td>
                            <td style={{fontSize:10}}>
                              {notBillable&&<span style={{color:"#4e6479",background:"#192d47",borderRadius:3,padding:"1px 5px"}}>not billable</span>}
                              {needsRate&&<span style={{color:"#fb923c",background:"#2a1a0a",borderRadius:3,padding:"1px 5px"}}>set rate ⚠</span>}
                              {p.billable&&p.rate_per_hour>0&&<span style={{color:"#34d399",background:"#0a2a1a",borderRadius:3,padding:"1px 5px"}}>✓ billable</span>}
                            </td>
                          </tr>
                          );
                        })}
                        {filteredProjs.filter(p=>p.billable).length>0&&(
                          <tr style={{background:"#0d1e34"}}>
                            <td colSpan={3} style={{fontWeight:700,color:"#f0f6ff"}}>BILLABLE TOTAL</td>
                            <td style={{fontFamily:"'IBM Plex Mono',monospace",fontWeight:700,color:"#38bdf8"}}>{invHrs}h</td>
                            <td></td>
                            <td style={{fontFamily:"'IBM Plex Mono',monospace",fontWeight:700,color:"#a78bfa",fontSize:13}}>{fmtCurrency(invTotal)}</td>
                            <td></td>
                          </tr>
                        )}
                        {filteredProjs.length===0&&<tr><td colSpan={7} style={{textAlign:"center",color:"#253a52",padding:20}}>No hours logged for {MONTHS[month]} {year}</td></tr>}
                      </tbody>
                    </table>
                    {invoiceProjId!=="ALL"&&allWithHours.length>1&&(
                      <div style={{marginTop:10,textAlign:"right"}}>
                        <button className="bg" style={{fontSize:11}} onClick={()=>setInvoiceProjId("ALL")}>← Back to All Projects</button>
                      </div>
                    )}
                  </div>
                </div>
              );})()}
            </div>
          )}

          {/* ════ ADMIN / LEAD PANEL ════ */}
          {view==="admin"&&(isAdmin||role==="lead")&&(
            <div>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:20}}>
                <div>
                  <h1 style={{fontSize:21,fontWeight:700,color:"#f0f6ff"}}>{isAdmin?"Admin Panel":"Lead Panel"}</h1>
                  <p style={{color:"#2e4a66",fontSize:12,marginTop:3}}>
                    {isAdmin?"Full control: engineers, projects, entries, settings":"Edit engineer entries · Export individual timesheets"}
                  </p>
                </div>
                {unreadCount>0&&isAdmin&&<button className="bg" onClick={markAllRead}>Mark {unreadCount} notifications read</button>}
              </div>

              {/* Notifications (admin only) */}
              {isAdmin&&notifications.filter(n=>!n.read).length>0&&(
                <div style={{marginBottom:18}}>
                  <h3 style={{fontSize:12,fontWeight:700,color:"#fb923c",marginBottom:10}}>🔔 New Signups ({unreadCount})</h3>
                  {notifications.filter(n=>!n.read).map(n=>(
                    <div key={n.id} style={{background:"#1a0a00",border:"1px solid #fb923c40",borderRadius:8,padding:"10px 14px",marginBottom:8,display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                      <div>
                        <div style={{fontSize:12,fontWeight:600,color:"#fb923c"}}>{n.message}</div>
                        <div style={{fontSize:10,color:"#2e4a66",marginTop:3}}>{new Date(n.created_at).toLocaleString()} · <span style={{color:"#38bdf8"}}>Go to Engineers tab → find them → set their role</span></div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Tabs */}
              <div style={{display:"flex",gap:4,marginBottom:18,background:"#060e1c",borderRadius:8,padding:4,width:"fit-content"}}>
                {[
                  {id:"engineers",label:"👥 Engineers",show:isAdmin},
                  {id:"projects", label:"◈ Projects",  show:isAdmin},
                  {id:"entries",  label:"⏱ All Entries",show:true},
                  {id:"settings", label:"⚙ Settings",   show:isAdmin},
                  {id:"finance",  label:"💰 Finance",   show:isAdmin||isAcct},
                  {id:"functions",label:"⚡ Functions",  show:isAdmin||isLead},
                  {id:"kpis",     label:"📈 KPIs",       show:isAdmin||isLead},
                  {id:"tracker",  label:"📊 Tracker",    show:isAdmin||isLead},
                ].filter(t=>t.show).map(t=>(
                  <button key={t.id} className={`atab ${adminTab===t.id?"a":""}`} onClick={()=>setAdminTab(t.id)}>{t.label}</button>
                ))}
              </div>

              {/* ENGINEERS */}
              {adminTab==="engineers"&&isAdmin&&(
                <div className="card">
                  <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:14}}>
                    <h3 style={{fontSize:13,fontWeight:600,color:"#7a8faa"}}>Engineers & Access Control ({engineers.length})</h3>
                    <button className="bp" onClick={()=>setShowEngModal(true)}>+ Add Member</button>
                  </div>
                  <div style={{background:"#060e1c",border:"1px solid #0ea5e930",borderRadius:6,padding:"8px 12px",fontSize:11,color:"#38bdf8",marginBottom:12}}>
                    ℹ New registrations default to <strong>Engineer</strong> role. Update their role here after they sign up.
                  </div>
                  <table>
                    <thead><tr><th>Name</th><th>Job Role</th><th>Level</th><th>Email</th><th>Access Role</th><th>Weekend</th><th>Month Hrs</th><th style={{width:110}}>Actions</th></tr></thead>
                    <tbody>{engineers.map(eng=>{
                      const es=engStats.find(e=>e.id===eng.id);
                      const engWd=()=>{try{return eng.weekend_days?JSON.parse(eng.weekend_days):DEFAULT_WEEKEND;}catch{return DEFAULT_WEEKEND;}};
                      const wdStr=engWd().map(d=>["Su","Mo","Tu","We","Th","Fr","Sa"][d]).join("+");
                      return(
                        <tr key={eng.id}>
                          <td><div style={{display:"flex",alignItems:"center",gap:8}}><div className="av" style={{fontSize:9,width:26,height:26}}>{eng.name?.slice(0,2).toUpperCase()}</div><span style={{fontWeight:500}}>{eng.name}</span></div></td>
                          <td style={{color:"#7a8faa",fontSize:11}}>{eng.role}</td>
                          <td><span style={{fontSize:9,padding:"2px 6px",borderRadius:3,background:"#152639",color:"#4e6479"}}>{eng.level}</span></td>
                          <td style={{color:"#4e6479",fontSize:11}}>{eng.email||"—"}</td>
                          <td>
                            <div style={{display:"flex",gap:5,alignItems:"center"}}>
                              <select value={pendingRoles[eng.id]??eng.role_type??"engineer"}
                                style={{padding:"3px 6px",fontSize:11,width:"auto",background:"#060e1c",border:"1px solid #192d47",color:"#dde3ef",borderRadius:4,outline:"none"}}
                                onChange={e=>setPendingRoles(p=>({...p,[eng.id]:e.target.value}))}>
                                {ROLE_TYPES.map(r=><option key={r} value={r}>{ROLE_LABELS[r]}</option>)}
                              </select>
                              {pendingRoles[eng.id]&&pendingRoles[eng.id]!==eng.role_type&&(
                                <button className="be" style={{fontSize:10,padding:"3px 8px"}} onClick={async()=>{
                                  const newRole=pendingRoles[eng.id];
                                  const {data,error}=await supabase.from("engineers").update({role_type:newRole}).eq("id",eng.id).select().single();
                                  if(error){showToast("RLS error — run fix_rls_roles.sql in Supabase first",false);return;}
                                  if(data) setEngineers(prev=>prev.map(x=>x.id===data.id?data:x));
                                  setPendingRoles(p=>{const n={...p};delete n[eng.id];return n;});
                                  showToast(`${eng.name} → ${ROLE_LABELS[newRole]} ✓`);
                                }}>Save</button>
                              )}
                            </div>
                          </td>
                          <td style={{fontFamily:"'IBM Plex Mono',monospace",fontSize:10,color:"#f47218"}}>{wdStr||"—"}</td>
                          <td style={{fontFamily:"'IBM Plex Mono',monospace",color:"#38bdf8"}}>{es?.workHrs||0}h</td>
                          <td><div style={{display:"flex",gap:5}}>
                            <button className="be" onClick={()=>setEditEngModal({...eng})}>✎</button>
                            <button className="bd" onClick={()=>deleteEngineer(eng.id)}>✕</button>
                          </div></td>
                        </tr>
                      );
                    })}</tbody>
                  </table>
                </div>
              )}

              {/* PROJECTS */}
              {adminTab==="projects"&&isAdmin&&(
                <ProjectsTab
                  projects={projects}
                  subprojects={subprojects}
                  entries={entries}
                  engineers={engineers}
                  expandedProj={expandedProj}
                  setExpandedProj={setExpandedProj}
                  setShowProjModal={setShowProjModal}
                  setEditProjModal={setEditProjModal}
                  setSubProjModal={setSubProjModal}
                  deleteProject={deleteProject}
                  deleteSubProject={deleteSubProject}
                />
              )}

              {/* ALL ENTRIES */}
              {adminTab==="entries"&&(
                <div>
                  <div className="card" style={{marginBottom:12}}>
                    <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:10}}>
                      <div><Lbl>Engineer</Lbl>
                        <select value={entryFilter.engineer} onChange={e=>setEntryFilter(p=>({...p,engineer:e.target.value}))}>
                          <option value="ALL">All Engineers</option>
                          {engineers.map(e=><option key={e.id} value={e.id}>{e.name}</option>)}
                        </select>
                      </div>
                      <div><Lbl>Project</Lbl>
                        <select value={entryFilter.project} onChange={e=>setEntryFilter(p=>({...p,project:e.target.value}))}>
                          <option value="ALL">All Projects</option>
                          {projects.map(p=><option key={p.id} value={p.id}>{p.id} — {p.name}</option>)}
                        </select>
                      </div>
                      <div><Lbl>Month</Lbl>
                        <select value={entryFilter.month} onChange={e=>setEntryFilter(p=>({...p,month:+e.target.value}))}>
                          {MONTHS.map((m,i)=><option key={i} value={i}>{m}</option>)}
                        </select>
                      </div>
                      <div><Lbl>Year</Lbl>
                        <select value={entryFilter.year} onChange={e=>setEntryFilter(p=>({...p,year:+e.target.value}))}>
                          {[year-2,year-1,year,year+1].map(y=><option key={y}>{y}</option>)}
                        </select>
                      </div>
                    </div>
                  </div>
                  <div className="card">
                    {(()=>{
                      const workE=adminBrowseEntries.filter(e=>e.entry_type==="work");
                      const leaveE=adminBrowseEntries.filter(e=>e.entry_type==="leave");
                      const totalWH=workE.reduce((s,e)=>s+e.hours,0);
                      const billH=workE.filter(e=>{const p=projects.find(x=>x.id===e.project_id);return p&&p.billable;}).reduce((s,e)=>s+e.hours,0);
                      const nonBillH=totalWH-billH;
                      const uniqEngs=[...new Set(workE.map(e=>e.engineer_id))].length;
                      const uniqProjs=[...new Set(workE.map(e=>e.project_id).filter(Boolean))].length;
                      return(
                    <div style={{marginBottom:14}}>
                      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:10}}>
                        <h3 style={{fontSize:13,fontWeight:600,color:"#7a8faa"}}>Entries ({adminBrowseEntries.length})</h3>
                        <span style={{fontFamily:"'IBM Plex Mono',monospace",fontSize:11,color:"#34d399",fontWeight:700}}>{totalWH}h work · <span style={{color:"#fb923c"}}>{leaveE.length}d leave</span></span>
                      </div>
                      <div style={{display:"grid",gridTemplateColumns:"repeat(5,1fr)",gap:8}}>
                        {[
                          {l:"Work Hours",  v:totalWH+"h",       c:"#38bdf8"},
                          {l:"Billable",    v:billH+"h",         c:"#34d399"},
                          {l:"Non-Billable",v:nonBillH+"h",      c:"#fb923c"},
                          {l:"Engineers",   v:uniqEngs,          c:"#a78bfa"},
                          {l:"Projects",    v:uniqProjs,         c:"#60a5fa"},
                        ].map((s,i)=>(
                          <div key={i} style={{background:"#060e1c",borderRadius:6,padding:"8px 10px"}}>
                            <div style={{fontSize:9,color:"#253a52",fontWeight:700,textTransform:"uppercase",letterSpacing:".05em"}}>{s.l}</div>
                            <div style={{fontFamily:"'IBM Plex Mono',monospace",fontSize:15,fontWeight:700,color:s.c,marginTop:4}}>{s.v}</div>
                          </div>
                        ))}
                      </div>
                    </div>
                      );
                    })()}
                    <div style={{maxHeight:500,overflowY:"auto"}}>
                      <table>
                        <thead><tr><th>Date</th><th>Engineer</th><th>Project</th><th>Task</th><th>Activity</th><th>Hrs</th><th>Type</th><th style={{width:90}}>Actions</th></tr></thead>
                        <tbody>
                          {adminBrowseEntries.length===0&&<tr><td colSpan={8} style={{textAlign:"center",color:"#253a52",padding:20}}>No entries</td></tr>}
                          {adminBrowseEntries.map(e=>{
                            const eng=engineers.find(x=>x.id===e.engineer_id);
                            const proj=projects.find(x=>x.id===e.project_id);
                            return(
                              <tr key={e.id}>
                                <td style={{fontFamily:"'IBM Plex Mono',monospace",fontSize:11}}>{e.date}</td>
                                <td style={{fontSize:11}}>{eng?.name||"—"}</td>
                                <td style={{fontFamily:"'IBM Plex Mono',monospace",fontSize:11,color:"#38bdf8"}}>{proj?.id||<span style={{color:"#fb923c"}}>{e.leave_type}</span>}</td>
                                <td style={{fontSize:10,color:"#7a8faa"}}>{e.task_type||"—"}</td>
                                <td style={{fontSize:10,color:"#4e6479",fontStyle:"italic",maxWidth:140,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{e.activity||"—"}</td>
                                <td style={{fontFamily:"'IBM Plex Mono',monospace",color:"#38bdf8",fontWeight:700}}>{e.hours}h</td>
                                <td><span style={{fontSize:9,padding:"2px 5px",borderRadius:3,background:e.entry_type==="leave"?"#7c2d1230":"#022c2230",color:e.entry_type==="leave"?"#fb923c":"#34d399",fontWeight:700}}>{e.entry_type}</span></td>
                                {canEditAny&&<td><div style={{display:"flex",gap:4}}>
                                  <button className="be" style={{fontSize:10}} onClick={()=>setEditEntry({...e,projectId:e.project_id,type:e.entry_type,taskCategory:e.task_category||"Engineering",taskType:e.task_type||"Basic Engineering",leaveType:e.leave_type||"Annual Leave"})}>✎</button>
                                  <button className="bd" style={{fontSize:10}} onClick={()=>deleteEntry(e.id,e.engineer_id)}>✕</button>
                                </div></td>}
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              )}


              {/* ══ FINANCE MODULE ══ */}
              {adminTab==="finance"&&(isAdmin||isAcct)&&(
                <FinanceTab
                  staff={staff} entries={entries} expenses={expenses}
                  projects={projects} engineers={engineers}
                  egpRate={egpRate} setEgpRate={setEgpRate}
                  finTab={finTab} setFinTab={setFinTab}
                  finMonth={finMonth} setFinMonth={setFinMonth}
                  finYear={finYear} setFinYear={setFinYear}
                  setEditStaff={setEditStaff} setShowStaffModal={setShowStaffModal}
                  setEditExp={setEditExp} setNewExp={setNewExp} setShowExpModal={setShowExpModal}
                  deleteStaff={deleteStaff} deleteExpense={deleteExpense}
                  fmtCurrency={fmtCurrency} buildFinancePDF={buildFinancePDF}
                  isAdmin={isAdmin}
                />
              )}

              {/* ══ FUNCTIONS / ACTIVITIES ══ */}
              {adminTab==="functions"&&(isAdmin||isLead)&&(
                <FunctionsTab
                  entries={entries} engineers={engineers}
                  funcYear={funcYear} setFuncYear={setFuncYear}
                  funcEngId={funcEngId} setFuncEngId={setFuncEngId}
                  deleteEntry={deleteEntry} isAdmin={isAdmin} year={year}
                  setShowFuncModal={setShowFuncModal}
                />
              )}

              {/* ══ KPI DASHBOARD ══ */}
              {adminTab==="kpis"&&(isAdmin||isLead)&&(
                <KPIsTab
                  entries={entries} engineers={engineers} projects={projects}
                  kpiYear={kpiYear} setKpiYear={setKpiYear}
                  kpiEngId={kpiEngId} setKpiEngId={setKpiEngId}
                  kpiNotes={kpiNotes} setKpiNotes={setKpiNotes}
                  isAdmin={isAdmin} year={year}
                  notifications={notifications}
                  alertDay={alertDay} setAlertDay={setAlertDay}
                />
              )}


              {/* ══ PROJECT TRACKER ══ */}
              {adminTab==="tracker"&&(isAdmin||isLead)&&(
                <ProjectTracker
                  projects={projects}
                  activities={activities}
                  subprojects={subprojects}
                  entries={entries}
                  engineers={engineers}
                  isAdmin={isAdmin}
                  isLead={isLead}
                  activitiesLoaded={activitiesLoaded}
                  setActivities={setActivities}
                  showToast={showToast}
                />
              )}

              {/* SETTINGS */}
              {adminTab==="settings"&&isAdmin&&(
                <div style={{maxWidth:600,display:"grid",gap:14}}>
                  <div className="card">
                    <h3 style={{fontSize:13,fontWeight:700,color:"#f0f6ff",marginBottom:4}}>Access Role Descriptions</h3>
                    <p style={{fontSize:11,color:"#2e4a66",marginBottom:14,lineHeight:1.6}}>Each role controls what features are visible and accessible.</p>
                    <div style={{display:"grid",gap:8}}>
                      {[
                        {role:"engineer",label:"Engineer",color:"#4e6479",perms:"Post own hours · View dashboard, projects, team · No reports"},
                        {role:"lead",    label:"Lead Engineer",color:"#38bdf8",perms:"All Engineer permissions + Edit any engineer's hours · Export individual timesheet PDF · View reports"},
                        {role:"accountant",label:"Accountant",color:"#a78bfa",perms:"Read-only access · Export all reports + invoices · See rates & revenue · Cannot edit entries"},
                        {role:"admin",   label:"Admin",color:"#34d399",perms:"Full access · Manage engineers/projects · All reports & invoices · Configure settings"},
                      ].map(r=>(
                        <div key={r.role} style={{background:"#060e1c",border:`1px solid ${r.color}30`,borderRadius:8,padding:"10px 14px"}}>
                          <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:4}}>
                            <span className="role-badge" style={{background:r.color+"20",color:r.color}}>{r.label}</span>
                          </div>
                          <div style={{fontSize:11,color:"#4e6479",lineHeight:1.5}}>{r.perms}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className="card" style={{borderColor:"#f59e0b30"}}>
                    <h3 style={{fontSize:13,fontWeight:700,color:"#f59e0b",marginBottom:6}}>⚙️ Required Supabase SQL Migrations</h3>
                    <p style={{fontSize:11,color:"#2e4a66",marginBottom:12,lineHeight:1.6}}>Run these once in your Supabase SQL editor to enable all features. The app works without them but falls back gracefully.</p>
                    {[
                      {label:"Function Category column (enables KPI function tracking)",sql:`ALTER TABLE time_entries ADD COLUMN IF NOT EXISTS function_category text;`},
                      {label:"Staff table (Finance › Salaries)",sql:`CREATE TABLE IF NOT EXISTS staff (\n  id bigserial PRIMARY KEY, name text NOT NULL, department text DEFAULT 'Engineering',\n  role text, type text DEFAULT 'full_time', salary_usd numeric DEFAULT 0,\n  salary_egp numeric DEFAULT 0, active boolean DEFAULT true,\n  join_date date, termination_date date, notes text, created_at timestamptz DEFAULT now()\n);\nALTER TABLE staff ENABLE ROW LEVEL SECURITY;\nCREATE POLICY "auth_all" ON staff FOR ALL USING (auth.role()='authenticated');`},
                      {label:"Expenses table (Finance › Expenses)",sql:`CREATE TABLE IF NOT EXISTS expenses (\n  id bigserial PRIMARY KEY, category text NOT NULL, description text NOT NULL,\n  amount_usd numeric DEFAULT 0, amount_egp numeric DEFAULT 0,\n  month int NOT NULL, year int NOT NULL, notes text, created_at timestamptz DEFAULT now()\n);\nALTER TABLE expenses ENABLE ROW LEVEL SECURITY;\nCREATE POLICY "auth_all" ON expenses FOR ALL USING (auth.role()='authenticated');`},
                      {label:"Project Tracker — sub-projects + activities (Tracker tab)",sql:`-- Step 1: Sub-projects (for SCADA Olt sites, Transelectrica sites)\nCREATE TABLE IF NOT EXISTS project_subprojects (\n  id bigserial PRIMARY KEY,\n  project_id text NOT NULL REFERENCES projects(id) ON DELETE CASCADE,\n  name text NOT NULL, pm_name text, pm_comments text, pendings text,\n  created_at timestamptz DEFAULT now()\n);\n-- Step 2: Activities per project/sub-project\nCREATE TABLE IF NOT EXISTS project_activities (\n  id bigserial PRIMARY KEY,\n  project_id text NOT NULL REFERENCES projects(id) ON DELETE CASCADE,\n  subproject_id bigint REFERENCES project_subprojects(id) ON DELETE CASCADE,\n  group_name text, activity_name text NOT NULL,\n  status text DEFAULT 'Not Started', progress numeric DEFAULT 0,\n  assigned_to text, start_date date, end_date date, remarks text,\n  sort_order int DEFAULT 0,\n  created_at timestamptz DEFAULT now(), updated_at timestamptz DEFAULT now()\n);\n-- Step 3: Link time entries to activities\nALTER TABLE time_entries ADD COLUMN IF NOT EXISTS activity_id bigint REFERENCES project_activities(id) ON DELETE SET NULL;\nALTER TABLE project_subprojects ADD COLUMN IF NOT EXISTS assigned_engineers jsonb DEFAULT '[]';\n-- Step 4: RLS\nALTER TABLE project_subprojects ENABLE ROW LEVEL SECURITY;\nALTER TABLE project_activities ENABLE ROW LEVEL SECURITY;\nDO $$ BEGIN\n  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='project_subprojects' AND policyname='auth_all') THEN\n    CREATE POLICY "auth_all" ON project_subprojects FOR ALL USING (auth.role()='authenticated');\n  END IF;\n  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='project_activities' AND policyname='auth_all') THEN\n    CREATE POLICY "auth_all" ON project_activities FOR ALL USING (auth.role()='authenticated');\n  END IF;\nEND $$;\nCREATE INDEX IF NOT EXISTS idx_activities_project ON project_activities(project_id);\nCREATE INDEX IF NOT EXISTS idx_activities_subproject ON project_activities(subproject_id);\nCREATE INDEX IF NOT EXISTS idx_entries_activity ON time_entries(activity_id);`},
                    ].map((m,i)=>(
                      <div key={i} style={{marginBottom:12,background:"#060e1c",borderRadius:6,padding:"10px 12px",border:"1px solid #192d47"}}>
                        <div style={{fontSize:10,fontWeight:700,color:"#f59e0b",marginBottom:6}}>{i+1}. {m.label}</div>
                        <pre style={{fontFamily:"'IBM Plex Mono',monospace",fontSize:10,color:"#38bdf8",whiteSpace:"pre-wrap",wordBreak:"break-all",margin:0,lineHeight:1.6}}>{m.sql}</pre>
                        <button className="bg" style={{fontSize:10,marginTop:8}} onClick={()=>{navigator.clipboard.writeText(m.sql);showToast("SQL copied ✓");}}>📋 Copy SQL</button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ════ MY SETTINGS (engineer only) ════ */}
          {view==="mysettings"&&(
            <div>
              <h1 style={{fontSize:21,fontWeight:700,color:"#f0f6ff",marginBottom:20}}>My Settings</h1>
              <div className="card" style={{maxWidth:480}}>
                <h3 style={{fontSize:13,fontWeight:700,color:"#f0f6ff",marginBottom:4}}>My Weekend Days</h3>
                <p style={{fontSize:11,color:"#2e4a66",marginBottom:16,lineHeight:1.6}}>
                  Select your personal weekend days. This affects how your timesheet looks and your utilization target calculation. Engineers on site in Romania can set Sat+Sun, those in Egypt set Fri+Sat.
                </p>
                <div style={{display:"grid",gridTemplateColumns:"repeat(7,1fr)",gap:8,marginBottom:16}}>
                  {["Sun","Mon","Tue","Wed","Thu","Fri","Sat"].map((name,i)=>{
                    const isWe=myWeekend.includes(i);
                    return(
                      <button key={i} onClick={()=>{
                        const next=isWe?myWeekend.filter(d=>d!==i):[...myWeekend,i];
                        saveMyWeekend(next);
                      }} style={{
                        padding:"10px 4px",borderRadius:7,border:`2px solid ${isWe?"#f47218":"#192d47"}`,
                        background:isWe?"#1a0a00":"#060e1c",color:isWe?"#f47218":"#4e6479",
                        cursor:"pointer",fontSize:12,fontWeight:700,fontFamily:"'IBM Plex Sans',sans-serif",transition:"all .2s"
                      }}>
                        {name}
                        {isWe&&<div style={{fontSize:9,marginTop:3,color:"#f47218"}}>OFF</div>}
                      </button>
                    );
                  })}
                </div>
                <div style={{display:"grid",gap:6,marginBottom:14}}>
                  {[
                    {label:"🇪🇬 Egypt / Middle East",days:[5,6],desc:"Fri + Sat"},
                    {label:"🇷🇴 Romania / Europe",days:[0,6],desc:"Sat + Sun"},
                    {label:"No Weekend",days:[],desc:"All 7 days"},
                  ].map(p=>(
                    <button key={p.label} onClick={()=>saveMyWeekend(p.days)} style={{display:"flex",justifyContent:"space-between",alignItems:"center",background:"transparent",border:"1px solid #192d47",borderRadius:6,padding:"8px 12px",cursor:"pointer",fontFamily:"'IBM Plex Sans',sans-serif",color:"#dde3ef",transition:"border-color .2s"}}
                    onMouseEnter={e=>e.currentTarget.style.borderColor="#38bdf8"}
                    onMouseLeave={e=>e.currentTarget.style.borderColor="#192d47"}>
                      <span style={{fontSize:12,fontWeight:600}}>{p.label}</span>
                      <span style={{fontSize:10,color:"#4e6479",fontFamily:"'IBM Plex Mono',monospace"}}>{p.desc}</span>
                    </button>
                  ))}
                </div>
                <div style={{padding:"9px 12px",background:"#022c22",border:"1px solid #34d399",borderRadius:6,fontSize:11,color:"#34d399"}}>
                  ✓ Your weekend: {myWeekend.length===0?"None (all days)":myWeekend.map(d=>["Sun","Mon","Tue","Wed","Thu","Fri","Sat"][d]).join(" + ")}
                  {" "}· Working days this month: {getWorkDaysInMonth(year,month,myWeekend).length} · Target: {getTargetHrs(year,month,myWeekend)}h
                </div>
              </div>
            </div>
          )}


          {/* ════ IMPORT EXCEL ════ */}
          {view==="import"&&isAdmin&&(
            <div>
              <div style={{marginBottom:20}}>
                <h1 style={{fontSize:21,fontWeight:700,color:"#f0f6ff"}}>Import Excel Timesheets</h1>
                <div style={{display:"flex",alignItems:"center",gap:10,marginTop:4}}>
                  <p style={{color:"#2e4a66",fontSize:12}}>Upload ENEVOEGY timesheet files · Engineers &amp; projects created automatically</p>
                  <span style={{fontSize:10,padding:"2px 8px",borderRadius:3,background:xlsxReady?"#024b36":"#1a0a00",color:xlsxReady?"#34d399":"#fb923c",fontWeight:700,fontFamily:"'IBM Plex Mono',monospace"}}>
                    {xlsxReady?"✓ XLSX READY":"⏳ LOADING XLSX..."}
                  </span>
                </div>
              </div>
              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:16}}>
                {/* Upload panel */}
                <div>
                  <div className="card" style={{marginBottom:14}}>
                    <h3 style={{fontSize:13,fontWeight:700,color:"#f0f6ff",marginBottom:12}}>📂 Upload Timesheet Files</h3>
                    <div style={{border:"2px dashed #192d47",borderRadius:8,padding:"28px",textAlign:"center",marginBottom:14,cursor:"pointer",transition:"border-color .2s"}}
                      onDragOver={e=>{e.preventDefault();e.currentTarget.style.borderColor="#38bdf8";}}
                      onDragLeave={e=>{e.currentTarget.style.borderColor="#192d47";}}
                      onDrop={e=>{e.preventDefault();e.currentTarget.style.borderColor="#192d47";const f=[...e.dataTransfer.files].filter(f=>f.name.endsWith(".xlsx")||f.name.endsWith(".xls"));setImportFiles(prev=>[...prev,...f]);}}
                      onClick={()=>document.getElementById("xlsxInput").click()}>
                      <div style={{fontSize:32,marginBottom:8}}>📊</div>
                      <div style={{fontSize:13,fontWeight:600,color:"#f0f6ff",marginBottom:4}}>Drop .xlsx files here or click to browse</div>
                      <div style={{fontSize:11,color:"#2e4a66"}}>Supports ENEVOEGY timesheet format · Multiple files at once</div>
                      <input id="xlsxInput" type="file" accept=".xlsx,.xls" multiple style={{display:"none"}}
                        onChange={e=>setImportFiles(prev=>[...prev,...Array.from(e.target.files)])}/>
                    </div>
                    {importFiles.length>0&&(
                      <div>
                        <div style={{fontSize:11,color:"#7a8faa",marginBottom:8,fontWeight:700}}>{importFiles.length} FILE{importFiles.length>1?"S":""} QUEUED:</div>
                        {importFiles.map((f,i)=>(
                          <div key={i} style={{display:"flex",alignItems:"center",justifyContent:"space-between",background:"#060e1c",borderRadius:5,padding:"7px 10px",marginBottom:5}}>
                            <div>
                              <div style={{fontSize:12,fontWeight:600}}>{f.name}</div>
                              <div style={{fontSize:10,color:"#2e4a66"}}>{(f.size/1024).toFixed(1)} KB</div>
                            </div>
                            <button className="bd" style={{fontSize:10}} onClick={()=>setImportFiles(prev=>prev.filter((_,j)=>j!==i))}>✕</button>
                          </div>
                        ))}
                        {!xlsxReady&&<div style={{background:"#1a0a00",border:"1px solid #fb923c30",borderRadius:6,padding:"8px 12px",fontSize:11,color:"#fb923c",marginBottom:8}}>⏳ XLSX library loading... wait a moment then try again.</div>}
                        <div style={{display:"flex",gap:10,marginTop:12}}>
                          <button className="bp" style={{flex:1,justifyContent:"center"}} disabled={importing||!xlsxReady} onClick={()=>importTimesheets(importFiles)}>
                            {importing?"⏳ Importing...":!xlsxReady?"⏳ Loading XLSX...":"⬆ Import All Files"}
                          </button>
                          <button className="bg" onClick={()=>{setImportFiles([]);setImportLog([]);}}>Clear</button>
                        </div>
                      </div>
                    )}
                  </div>
                  <div className="card">
                    <h3 style={{fontSize:12,fontWeight:700,color:"#f0f6ff",marginBottom:10}}>📋 What Gets Imported</h3>
                    {[
                      ["👤","Engineer","Created automatically from Name + Email in the sheet header"],
                      ["⏱","Work Hours","Daily task + hours + project mapped to entries"],
                      ["✈","Leave Days","Public holidays and leave days detected automatically"],
                      ["◈","Projects","Matched by project name — assign missing ones after import"],
                      ["🔤","Task Types","Auto-detected from task description (SCADA, HMI, PLC, etc.)"],
                    ].map(([icon,label,desc])=>(
                      <div key={label} style={{display:"flex",gap:10,marginBottom:10}}>
                        <div style={{fontSize:16,width:24,flexShrink:0}}>{icon}</div>
                        <div><div style={{fontSize:12,fontWeight:600}}>{label}</div><div style={{fontSize:11,color:"#2e4a66",lineHeight:1.5}}>{desc}</div></div>
                      </div>
                    ))}
                    <div style={{background:"#1a0a00",border:"1px solid #fb923c30",borderRadius:6,padding:"9px 12px",fontSize:11,color:"#fb923c",marginTop:8}}>
                      ⚠ After importing, go to Admin → All Entries to review and assign project numbers to any unmatched entries.
                    </div>
                  </div>
                </div>
                {/* Log panel */}
                <div className="card" style={{maxHeight:600,overflowY:"auto"}}>
                  <h3 style={{fontSize:12,fontWeight:700,color:"#f0f6ff",marginBottom:12}}>📋 Import Log</h3>
                  {importLog.length===0&&<div style={{color:"#253a52",fontSize:12,textAlign:"center",padding:30}}>No import started yet</div>}
                  {importLog.map((entry,i)=>(
                    <div key={i} style={{display:"flex",gap:8,marginBottom:5,fontSize:11,padding:"4px 0",borderBottom:"1px solid #0d1a2d"}}>
                      <span style={{width:8,height:8,borderRadius:"50%",marginTop:4,flexShrink:0,background:entry.type==="ok"?"#34d399":entry.type==="error"?"#f87171":entry.type==="warn"?"#fb923c":"#38bdf8"}}/>
                      <span style={{color:entry.type==="ok"?"#34d399":entry.type==="error"?"#f87171":entry.type==="warn"?"#fb923c":"#7a8faa",lineHeight:1.4}}>{entry.msg}</span>
                    </div>
                  ))}
                  {importing&&<div style={{textAlign:"center",padding:10,color:"#38bdf8",fontFamily:"'IBM Plex Mono',monospace",fontSize:11}}>Processing…</div>}
                </div>
              </div>
            </div>
          )}

          </>}
        </div>
      </div>

      {/* ════ MODALS ════ */}

      {/* Add Entry */}
      {modalDate&&(()=>{
        const step = newEntry._step||1;
        const isWork = newEntry.type==="work";
        const isLeave = newEntry.type==="leave";
        const isFunc = newEntry.type==="function";
        const groupCats = TAXONOMY_GROUPS[newEntry._group]||[];
        const catActs = ACTIVITY_TAXONOMY[newEntry.taskCategory]||[];
        const projActs = isWork&&newEntry.projectId
          ? activities.filter(a=>a.project_id===newEntry.projectId&&a.status!=="Completed")
          : [];
        const projSubList=[...new Set(projActs.map(a=>a.subproject_id).filter(Boolean))];
        const filteredActs = projActs.filter(a=>{
          const matchSub = !newEntry._actSub || String(a.subproject_id)===String(newEntry._actSub);
          const matchCat = !newEntry._actCat || a.category===newEntry._actCat || a.group_name===newEntry._actCat;
          return matchSub && matchCat;
        });

        const INP={width:"100%",background:"#060e1c",border:"1px solid #192d47",borderRadius:5,color:"#f0f6ff",padding:"7px 10px",fontSize:12,boxSizing:"border-box"};
        const LBL={fontSize:10,color:"#7a8faa",fontWeight:700,display:"block",marginBottom:4,letterSpacing:".05em"};
        const GC={"SCADA":"#38bdf8","RTU-PLC":"#a78bfa","Protection":"#f87171","General":"#34d399"};

        // Step pill indicator
        const totalSteps = isLeave?2:isFunc?3:4;
        const StepBar=()=>(
          <div style={{display:"flex",gap:4,marginBottom:16}}>
            {Array.from({length:totalSteps},(_,i)=>(
              <div key={i} style={{flex:1,height:3,borderRadius:99,
                background:i<step?"#38bdf8":"#192d47",
                transition:"background .2s"}}/>
            ))}
          </div>
        );

        const Btn=({children,onClick,disabled,primary})=>(
          <button onClick={onClick} disabled={disabled}
            style={{padding:"8px 18px",borderRadius:6,border:"none",cursor:disabled?"not-allowed":"pointer",
              background:primary?"#1d4ed8":"#0f1f35",color:disabled?"#2e4a66":"#f0f6ff",
              fontSize:12,fontWeight:700,opacity:disabled?.5:1,transition:"all .15s"}}>
            {children}
          </button>
        );

        return(
        <div className="modal-ov" onClick={()=>setModalDate(null)}>
          <div className="modal" style={{maxWidth:420}} onClick={e=>e.stopPropagation()}>

            {/* Header */}
            <div style={{marginBottom:14}}>
              <h3 style={{fontSize:14,fontWeight:700,color:"#f0f6ff",marginBottom:2}}>Post Hours</h3>
              <p style={{fontSize:10,color:"#2e4a66",fontFamily:"'IBM Plex Mono',monospace",margin:0}}>
                {new Date(modalDate).toLocaleDateString("en-US",{weekday:"long",month:"short",day:"numeric"})}
                {canEdit&&viewEng&&<span> · {viewEng.name}</span>}
              </p>
            </div>

            <StepBar/>

            <div style={{display:"grid",gap:12}}>

              {/* ── STEP 1: Entry type ── */}
              {step===1&&(
                <div>
                  <label style={LBL}>WHAT ARE YOU LOGGING?</label>
                  <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:8,marginTop:4}}>
                    {[
                      {v:"work",   icon:"🔧", label:"Work"},
                      {v:"function",icon:"📋",label:"Function"},
                      {v:"leave",  icon:"🌴", label:"Leave"},
                    ].map(({v,icon,label})=>(
                      <button key={v} onClick={()=>setNewEntry(p=>({...p,type:v,_step:2}))}
                        style={{padding:"14px 8px",borderRadius:8,border:`2px solid ${newEntry.type===v?"#38bdf8":"#192d47"}`,
                          background:newEntry.type===v?"#38bdf8"+"18":"#060e1c",
                          color:newEntry.type===v?"#38bdf8":"#4e6479",
                          fontSize:12,fontWeight:700,cursor:"pointer",display:"flex",
                          flexDirection:"column",alignItems:"center",gap:4}}>
                        <span style={{fontSize:20}}>{icon}</span>{label}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* ── STEP 2 for LEAVE: type + hours ── */}
              {step===2&&isLeave&&(
                <div style={{display:"grid",gap:12}}>
                  <div>
                    <label style={LBL}>LEAVE TYPE</label>
                    <select value={newEntry.leaveType} onChange={e=>setNewEntry(p=>({...p,leaveType:e.target.value}))} style={INP}>
                      {LEAVE_TYPES.map(t=><option key={t}>{t}</option>)}
                    </select>
                  </div>
                  <div style={{padding:"10px 12px",background:"#080f1e",borderRadius:6,border:"1px solid #192d47",fontSize:11,color:"#4e6479"}}>
                    ℹ️ Leave entries are logged as a full 8-hour day automatically.
                  </div>
                </div>
              )}

              {/* ── STEP 2 for FUNCTION: category ── */}
              {step===2&&isFunc&&(
                <div style={{display:"grid",gap:12}}>
                  <div>
                    <label style={LBL}>FUNCTION CATEGORY</label>
                    <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:6}}>
                      {FUNCTION_CATS.map(c=>(
                        <button key={c} onClick={()=>setNewEntry(p=>({...p,taskType:c,function_category:c}))}
                          style={{padding:"7px 8px",borderRadius:6,border:`1px solid ${newEntry.taskType===c?"#38bdf8":"#192d47"}`,
                            background:newEntry.taskType===c?"#38bdf8"+"18":"#060e1c",
                            color:newEntry.taskType===c?"#38bdf8":"#4e6479",
                            fontSize:10,fontWeight:700,cursor:"pointer",textAlign:"left"}}>
                          {c}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* ── STEP 3 for FUNCTION: hours + description ── */}
              {step===3&&isFunc&&(
                <div style={{display:"grid",gap:12}}>
                  <div style={{padding:"8px 12px",background:"#38bdf8"+"12",borderRadius:6,border:"1px solid #38bdf8"+"40",fontSize:11,color:"#38bdf8",fontWeight:700}}>
                    {newEntry.taskType||FUNCTION_CATS[0]}
                  </div>
                  <div style={{display:"grid",gridTemplateColumns:"100px 1fr",gap:10,alignItems:"start"}}>
                    <div>
                      <label style={LBL}>HOURS</label>
                      <input type="number" min=".5" max="12" step=".5" value={newEntry.hours}
                        onChange={e=>setNewEntry(p=>({...p,hours:+e.target.value}))} style={INP}/>
                    </div>
                    <div>
                      <label style={LBL}>DESCRIPTION</label>
                      <textarea rows={2} value={newEntry.activity}
                        onChange={e=>setNewEntry(p=>({...p,activity:e.target.value}))}
                        placeholder="Describe the activity…" style={{...INP,resize:"vertical"}}/>
                    </div>
                  </div>
                </div>
              )}

              {/* ── STEP 2 for WORK: project + sub-site ── */}
              {step===2&&isWork&&(
                <div style={{display:"grid",gap:12}}>
                  <div>
                    <label style={LBL}>PROJECT</label>
                    <select value={newEntry.projectId}
                      onChange={e=>setNewEntry(p=>({...p,projectId:e.target.value,activityId:null,_actCat:null,_actSub:null}))}
                      style={INP}>
                      <option value="">— Select Project —</option>
                      {projects.filter(p=>p.status==="Active").map(p=>(
                        <option key={p.id} value={p.id}>{p.id} — {p.name}</option>
                      ))}
                    </select>
                  </div>
                  {/* Sub-site if available */}
                  {newEntry.projectId&&projSubList.length>0&&(
                    <div>
                      <label style={LBL}>SUB-SITE <span style={{color:"#4e6479",fontWeight:400}}>(optional)</span></label>
                      <select value={newEntry._actSub||""}
                        onChange={e=>setNewEntry(p=>({...p,_actSub:e.target.value||null,activityId:null}))}
                        style={INP}>
                        <option value="">— All sub-sites —</option>
                        {projSubList.map(sid=>{
                          const sp=subprojects.find(s=>String(s.id)===String(sid));
                          return sp?<option key={sid} value={sid}>{sp.name}</option>:null;
                        })}
                      </select>
                    </div>
                  )}
                </div>
              )}

              {/* ── STEP 3 for WORK: group + category + activity ── */}
              {step===3&&isWork&&(
                <div style={{display:"grid",gap:12}}>

                  {/* Group pills */}
                  <div>
                    <label style={LBL}>WORK GROUP</label>
                    <div style={{display:"flex",gap:6}}>
                      {TAXONOMY_GROUP_NAMES.map(g=>(
                        <button key={g} onClick={()=>setNewEntry(p=>({
                            ...p,_group:g,
                            taskCategory:TAXONOMY_GROUPS[g][0],
                            taskType:ACTIVITY_TAXONOMY[TAXONOMY_GROUPS[g][0]]?.[0]||"",
                            activityId:null
                          }))}
                          style={{flex:1,padding:"6px 4px",borderRadius:6,
                            border:`1px solid ${newEntry._group===g?(GC[g]||"#38bdf8")+"80":"#192d47"}`,
                            background:newEntry._group===g?(GC[g]||"#38bdf8")+"15":"#060e1c",
                            color:newEntry._group===g?(GC[g]||"#38bdf8"):"#4e6479",
                            fontSize:10,fontWeight:700,cursor:"pointer"}}>
                          {g}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Category dropdown */}
                  <div>
                    <label style={LBL}>CATEGORY</label>
                    <select value={newEntry.taskCategory}
                      onChange={e=>setNewEntry(p=>({...p,taskCategory:e.target.value,taskType:ACTIVITY_TAXONOMY[e.target.value]?.[0]||"",activityId:null}))}
                      style={INP}>
                      {groupCats.map(c=><option key={c}>{c}</option>)}
                    </select>
                  </div>

                  {/* Activity — from tracker if available, else from taxonomy */}
                  <div>
                    <label style={LBL}>ACTIVITY</label>
                    {filteredActs.length>0?(
                      <select value={newEntry.activityId||""}
                        onChange={e=>setNewEntry(p=>({...p,activityId:e.target.value||null,
                          taskType:filteredActs.find(a=>String(a.id)===e.target.value)?.activity_name||p.taskType}))}
                        style={{...INP,borderColor:"#38bdf8"+"60"}}>
                        <option value="">— General (no specific activity) —</option>
                        {filteredActs
                          .filter(a=>!newEntry.taskCategory||a.category===newEntry.taskCategory)
                          .map(a=>(
                          <option key={a.id} value={a.id}>
                            {a.activity_name} · {Math.round((a.progress||0)*100)}%
                          </option>
                        ))}
                      </select>
                    ):(
                      <select value={newEntry.taskType}
                        onChange={e=>setNewEntry(p=>({...p,taskType:e.target.value}))}
                        style={INP}>
                        {catActs.map(t=><option key={t}>{t}</option>)}
                        <option value="Other">Other…</option>
                      </select>
                    )}
                    {filteredActs.length>0&&(
                      <div style={{fontSize:9,color:"#38bdf8",marginTop:3,paddingLeft:2}}>
                        ✓ Linked to project tracker activities
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* ── STEP 4 for WORK: hours + description ── */}
              {step===4&&isWork&&(
                <div style={{display:"grid",gap:12}}>
                  {/* Summary badge */}
                  <div style={{display:"flex",gap:6,flexWrap:"wrap"}}>
                    <span style={{padding:"3px 8px",borderRadius:99,background:(GC[newEntry._group]||"#38bdf8")+"18",
                      color:GC[newEntry._group]||"#38bdf8",fontSize:10,fontWeight:700}}>
                      {newEntry._group}
                    </span>
                    <span style={{padding:"3px 8px",borderRadius:99,background:"#192d47",color:"#7a8faa",fontSize:10}}>
                      {newEntry.taskCategory}
                    </span>
                    {newEntry.taskType&&(
                      <span style={{padding:"3px 8px",borderRadius:99,background:"#192d47",color:"#7a8faa",fontSize:10}}>
                        {newEntry.taskType.length>30?newEntry.taskType.slice(0,28)+"…":newEntry.taskType}
                      </span>
                    )}
                  </div>

                  <div style={{display:"grid",gridTemplateColumns:"100px 1fr",gap:10,alignItems:"start"}}>
                    <div>
                      <label style={LBL}>HOURS</label>
                      <input type="number" min=".5" max="12" step=".5" value={newEntry.hours}
                        onChange={e=>setNewEntry(p=>({...p,hours:+e.target.value}))} style={INP}/>
                    </div>
                    <div>
                      <label style={LBL}>NOTES <span style={{color:"#4e6479",fontWeight:400}}>(optional)</span></label>
                      <textarea rows={2} value={newEntry.activity}
                        onChange={e=>setNewEntry(p=>({...p,activity:e.target.value}))}
                        placeholder="e.g. Completed BESS display animations…"
                        style={{...INP,resize:"vertical"}}/>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Navigation */}
            <div style={{display:"flex",justifyContent:"space-between",marginTop:18,gap:10}}>
              <div>
                {step>1&&(
                  <Btn onClick={()=>setNewEntry(p=>({...p,_step:p._step-1}))}>← Back</Btn>
                )}
              </div>
              <div style={{display:"flex",gap:8}}>
                <Btn onClick={()=>setModalDate(null)}>Cancel</Btn>
                {step<totalSteps?(
                  <Btn primary
                    disabled={
                      (step===2&&isWork&&!newEntry.projectId)||
                      (step===2&&isFunc&&!newEntry.taskType)
                    }
                    onClick={()=>setNewEntry(p=>({...p,_step:p._step+1}))}>
                    Next →
                  </Btn>
                ):(
                  <Btn primary
                    disabled={!newEntry.hours||(isWork&&!newEntry.projectId)}
                    onClick={()=>addEntry(modalDate)}>
                    ✓ Post Hours
                  </Btn>
                )}
              </div>
            </div>

          </div>
        </div>);
      })()}

      {editEntry&&(
        <div className="modal-ov" onClick={()=>setEditEntry(null)}>
          <div className="modal" onClick={e=>e.stopPropagation()}>
            <h3 style={{fontSize:15,fontWeight:700,marginBottom:18}}>Edit Entry</h3>
            <div style={{display:"grid",gap:11}}>
              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}>
                <div><Lbl>Date</Lbl><input type="date" value={editEntry.date} onChange={e=>setEditEntry(p=>({...p,date:e.target.value}))}/></div>
                <div><Lbl>Entry Type</Lbl>
                  <select value={editEntry.type} onChange={e=>setEditEntry(p=>({...p,type:e.target.value}))}>
                    <option value="work">Work</option><option value="leave">Leave</option>
                  </select>
                </div>
              </div>
              {editEntry.type==="work"?<>
                <div><Lbl>Project</Lbl>
                  <select value={editEntry.projectId||""} onChange={e=>setEditEntry(p=>({...p,projectId:e.target.value}))}>
                    <option value="">— Select —</option>
                    {projects.map(p=><option key={p.id} value={p.id}>{p.id} — {p.name}</option>)}
                  </select>
                </div>
                <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}>
                  <div><Lbl>Task Category</Lbl>
                    <select value={editEntry.taskCategory||editEntry.task_category||"SCADA"} onChange={e=>setEditEntry(p=>({...p,taskCategory:e.target.value,taskType:(TASK_CATEGORIES[e.target.value]||[])[0]||""}))}>
                      {Object.keys(TASK_CATEGORIES).map(c=><option key={c}>{c}</option>)}
                    </select>
                  </div>
                  <div><Lbl>Task Type</Lbl>
                    <select value={editEntry.taskType||editEntry.task_type||""} onChange={e=>setEditEntry(p=>({...p,taskType:e.target.value}))}>
                      {(TASK_CATEGORIES[editEntry.taskCategory||editEntry.task_category||"SCADA"]||[]).map(t=><option key={t}>{t}</option>)}
                    </select>
                  </div>
                </div>
                <div><Lbl>Hours</Lbl><input type="number" min=".5" max="12" step=".5" value={editEntry.hours} onChange={e=>setEditEntry(p=>({...p,hours:+e.target.value}))}/></div>
                <div><Lbl>Activity Description</Lbl>
                  <textarea rows={3} value={editEntry.activity||""} onChange={e=>setEditEntry(p=>({...p,activity:e.target.value}))} style={{resize:"vertical"}}/>
                </div>
              </>:(
                <div><Lbl>Leave Type</Lbl>
                  <select value={editEntry.leaveType||editEntry.leave_type||LEAVE_TYPES[0]} onChange={e=>setEditEntry(p=>({...p,leaveType:e.target.value}))}>
                    {LEAVE_TYPES.map(t=><option key={t}>{t}</option>)}
                  </select>
                </div>
              )}
            </div>
            <div style={{display:"flex",gap:10,marginTop:18,justifyContent:"flex-end"}}>
              <button className="bg" onClick={()=>setEditEntry(null)}>Cancel</button>
              <button className="bp" onClick={saveEditEntry}>Save Changes</button>
            </div>
          </div>
        </div>
      )}

      {/* New Project */}
      {showProjModal&&(
        <div className="modal-ov" onClick={()=>setShowProjModal(false)}>
          <div className="modal" style={{maxWidth:520}} onClick={e=>e.stopPropagation()}>
            <h3 style={{fontSize:15,fontWeight:700,marginBottom:18}}>New Project</h3>
            <div style={{display:"grid",gap:11}}>
              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}>
                <div><Lbl>Project Number (e.g. EC-2025-009)</Lbl><input value={newProj.id} onChange={e=>setNewProj(p=>({...p,id:e.target.value}))} placeholder="EC-2025-009"/></div>
                <div><Lbl>Status</Lbl><select value={newProj.status} onChange={e=>setNewProj(p=>({...p,status:e.target.value}))}>{["Active","On Hold","Completed"].map(s=><option key={s}>{s}</option>)}</select></div>
              </div>
              <div><Lbl>Project Name</Lbl><input value={newProj.name} onChange={e=>setNewProj(p=>({...p,name:e.target.value}))}/></div>
              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}>
                <div><Lbl>Type</Lbl><select value={newProj.type} onChange={e=>setNewProj(p=>({...p,type:e.target.value}))}><option>Renewable Energy</option><option>Industrial</option></select></div>
                <div><Lbl>Phase</Lbl><select value={newProj.phase} onChange={e=>setNewProj(p=>({...p,phase:e.target.value}))}>{PHASES.map(ph=><option key={ph}>{ph}</option>)}</select></div>
              </div>
              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}>
                <div><Lbl>Client</Lbl><input value={newProj.client} onChange={e=>setNewProj(p=>({...p,client:e.target.value}))}/></div>
                <div><Lbl>Origin (HQ / BU)</Lbl><input value={newProj.origin} onChange={e=>setNewProj(p=>({...p,origin:e.target.value}))}/></div>
              </div>
              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}>
                <div><Lbl>Billable?</Lbl><select value={newProj.billable?"yes":"no"} onChange={e=>setNewProj(p=>({...p,billable:e.target.value==="yes"}))}><option value="yes">Yes</option><option value="no">No — Internal</option></select></div>
                <div><Lbl>Rate per Hour ($)</Lbl><input type="number" value={newProj.rate_per_hour} onChange={e=>setNewProj(p=>({...p,rate_per_hour:+e.target.value}))}/></div>
              </div>
              {/* Team assignment */}
              <div>
                <Lbl>Assigned Team Members</Lbl>
                <div style={{background:"#060e1c",border:"1px solid #192d47",borderRadius:6,padding:"8px 10px",display:"grid",gridTemplateColumns:"1fr 1fr",gap:6,maxHeight:160,overflowY:"auto"}}>
                  {engineers.filter(e=>e.role_type!=="accountant").map(e=>{
                    const sel=(newProj.assigned_engineers||[]).includes(String(e.id));
                    return(
                    <label key={e.id} style={{display:"flex",alignItems:"center",gap:6,cursor:"pointer",padding:"3px 4px",borderRadius:4,background:sel?"#001a2c":"transparent"}}>
                      <input type="checkbox" checked={sel} onChange={()=>setNewProj(p=>{
                        const cur=p.assigned_engineers||[];
                        return {...p,assigned_engineers:sel?cur.filter(x=>x!==String(e.id)):[...cur,String(e.id)]};
                      })} style={{accentColor:"#38bdf8"}}/>
                      <span style={{fontSize:10,color:sel?"#38bdf8":"#7a8faa"}}>{e.name}</span>
                      <span style={{fontSize:9,color:"#2e4a66",marginLeft:"auto"}}>{e.role}</span>
                    </label>);
                  })}
                </div>
              </div>
            </div>
            <div style={{display:"flex",gap:10,marginTop:18,justifyContent:"flex-end"}}>
              <button className="bg" onClick={()=>setShowProjModal(false)}>Cancel</button>
              <button className="bp" onClick={addProject}>Create Project</button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Project */}
      {editProjModal&&(
        <div className="modal-ov" onClick={()=>setEditProjModal(null)}>
          <div className="modal" style={{maxWidth:520}} onClick={e=>e.stopPropagation()}>
            <h3 style={{fontSize:15,fontWeight:700,marginBottom:18}}>Edit Project — {editProjModal._origId||editProjModal.id}</h3>
            <div style={{display:"grid",gap:11}}>
              <div style={{display:"grid",gridTemplateColumns:"1fr 2fr",gap:10}}>
                <div><Lbl>Project No. <span style={{color:"#f87171",fontSize:9}}>(rename re-links all entries)</span></Lbl><input value={editProjModal.id||""} onChange={e=>setEditProjModal(p=>({...p,id:e.target.value.toUpperCase(),_origId:p._origId||p.id}))}/></div>
                <div><Lbl>Project Name</Lbl><input value={editProjModal.name} onChange={e=>setEditProjModal(p=>({...p,name:e.target.value}))}/></div>
              </div>
              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}>
                <div><Lbl>Status</Lbl><select value={editProjModal.status} onChange={e=>setEditProjModal(p=>({...p,status:e.target.value}))}>{["Active","On Hold","Completed"].map(s=><option key={s}>{s}</option>)}</select></div>
                <div><Lbl>Phase</Lbl><select value={editProjModal.phase} onChange={e=>setEditProjModal(p=>({...p,phase:e.target.value}))}>{PHASES.map(ph=><option key={ph}>{ph}</option>)}</select></div>
              </div>
              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}>
                <div><Lbl>Client</Lbl><input value={editProjModal.client||""} onChange={e=>setEditProjModal(p=>({...p,client:e.target.value}))}/></div>
                <div><Lbl>Origin</Lbl><input value={editProjModal.origin||""} onChange={e=>setEditProjModal(p=>({...p,origin:e.target.value}))}/></div>
              </div>
              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}>
                <div><Lbl>Billable?</Lbl><select value={editProjModal.billable?"yes":"no"} onChange={e=>setEditProjModal(p=>({...p,billable:e.target.value==="yes"}))}><option value="yes">Yes</option><option value="no">No</option></select></div>
                <div><Lbl>Rate per Hour ($)</Lbl><input type="number" value={editProjModal.rate_per_hour} onChange={e=>setEditProjModal(p=>({...p,rate_per_hour:+e.target.value}))}/></div>
              </div>
              {/* Team assignment */}
              <div>
                <Lbl>Assigned Team Members</Lbl>
                <div style={{background:"#060e1c",border:"1px solid #192d47",borderRadius:6,padding:"8px 10px",display:"grid",gridTemplateColumns:"1fr 1fr",gap:6,maxHeight:160,overflowY:"auto"}}>
                  {engineers.filter(e=>e.role_type!=="accountant").map(e=>{
                    const sel=(editProjModal.assigned_engineers||[]).includes(String(e.id));
                    return(
                    <label key={e.id} style={{display:"flex",alignItems:"center",gap:6,cursor:"pointer",padding:"3px 4px",borderRadius:4,background:sel?"#001a2c":"transparent"}}>
                      <input type="checkbox" checked={sel} onChange={()=>setEditProjModal(p=>{
                        const cur=p.assigned_engineers||[];
                        return {...p,assigned_engineers:sel?cur.filter(x=>x!==String(e.id)):[...cur,String(e.id)]};
                      })} style={{accentColor:"#38bdf8"}}/>
                      <span style={{fontSize:10,color:sel?"#38bdf8":"#7a8faa"}}>{e.name}</span>
                      <span style={{fontSize:9,color:"#2e4a66",marginLeft:"auto"}}>{e.role}</span>
                    </label>);
                  })}
                </div>
              </div>
            </div>
            <div style={{display:"flex",gap:10,marginTop:18,justifyContent:"flex-end"}}>
              <button className="bg" onClick={()=>setEditProjModal(null)}>Cancel</button>
              <button className="bp" onClick={saveEditProject}>Save Changes</button>
            </div>
          </div>
        </div>
      )}

      {/* Sub-Project Add/Edit */}
      {subProjModal&&(
        <SubProjectModal
          key={subProjModal.sub?.id||"new"}
          projectId={subProjModal.projectId}
          sub={subProjModal.sub||null}
          engineers={engineers}
          onSave={subProjModal.sub?saveSubProject:addSubProject}
          onClose={()=>setSubProjModal(null)}
        />
      )}

      {/* Add Engineer */}
      {showEngModal&&(
        <div className="modal-ov" onClick={()=>setShowEngModal(false)}>
          <div className="modal" onClick={e=>e.stopPropagation()}>
            <h3 style={{fontSize:15,fontWeight:700,marginBottom:18}}>Add Member</h3>
            <div style={{display:"grid",gap:11}}>
              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}>
                <div><Lbl>Full Name</Lbl><input value={newEng.name} onChange={e=>setNewEng(p=>({...p,name:e.target.value}))}/></div>
                <div><Lbl>Level</Lbl><select value={newEng.level} onChange={e=>setNewEng(p=>({...p,level:e.target.value}))}>{LEVELS.map(l=><option key={l}>{l}</option>)}</select></div>
              </div>
              <div><Lbl>Job Title</Lbl><input value={newEng.role} onChange={e=>setNewEng(p=>({...p,role:e.target.value}))} placeholder="e.g. Accountant, CTO, HR Manager, Automation Engineer"/></div>
              <div><Lbl>Email (must match their signup email)</Lbl><input type="email" value={newEng.email} onChange={e=>setNewEng(p=>({...p,email:e.target.value}))}/></div>
              <div>
                <Lbl>Access Role</Lbl>
                <select value={newEng.role_type} onChange={e=>setNewEng(p=>({...p,role_type:e.target.value}))}>
                  {ROLE_TYPES.map(r=><option key={r} value={r}>{ROLE_LABELS[r]}</option>)}
                </select>
                <div style={{fontSize:10,color:"#2e4a66",marginTop:4}}>
                  {newEng.role_type==="engineer"&&"Can log hours & view own timesheets"}
                  {newEng.role_type==="lead"&&"Engineer + can view all team timesheets"}
                  {newEng.role_type==="accountant"&&"Full access to Finance tab, invoices & reports — no timesheet editing"}
                  {newEng.role_type==="admin"&&"Full access to everything including settings"}
                </div>
              </div>
            </div>
            <div style={{display:"flex",gap:10,marginTop:18,justifyContent:"flex-end"}}>
              <button className="bg" onClick={()=>setShowEngModal(false)}>Cancel</button>
              <button className="bp" onClick={addEngineer}>Add Member</button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Engineer */}
      {editEngModal&&(
        <div className="modal-ov" onClick={()=>setEditEngModal(null)}>
          <div className="modal" onClick={e=>e.stopPropagation()}>
            <h3 style={{fontSize:15,fontWeight:700,marginBottom:18}}>Edit — {editEngModal.name}</h3>
            <div style={{display:"grid",gap:11}}>
              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}>
                <div><Lbl>Full Name</Lbl><input value={editEngModal.name||""} onChange={e=>setEditEngModal(p=>({...p,name:e.target.value}))}/></div>
                <div><Lbl>Level</Lbl><select value={editEngModal.level||"Mid"} onChange={e=>setEditEngModal(p=>({...p,level:e.target.value}))}>{LEVELS.map(l=><option key={l}>{l}</option>)}</select></div>
              </div>
              <div><Lbl>Job Role</Lbl><select value={editEngModal.role||""} onChange={e=>setEditEngModal(p=>({...p,role:e.target.value}))}>{ROLES_LIST.map(r=><option key={r}>{r}</option>)}</select></div>
              <div><Lbl>Email</Lbl><input type="email" value={editEngModal.email||""} onChange={e=>setEditEngModal(p=>({...p,email:e.target.value}))}/></div>
              <div><Lbl>Access Role</Lbl><select value={editEngModal.role_type||"engineer"} onChange={e=>setEditEngModal(p=>({...p,role_type:e.target.value}))}>{ROLE_TYPES.map(r=><option key={r} value={r}>{ROLE_LABELS[r]}</option>)}</select></div>
            </div>
            <div style={{display:"flex",gap:10,marginTop:18,justifyContent:"flex-end"}}>
              <button className="bg" onClick={()=>setEditEngModal(null)}>Cancel</button>
              <button className="bp" onClick={saveEditEngineer}>Save</button>
            </div>
          </div>
        </div>
      )}


      {/* ── STAFF MODAL ── */}
      {showStaffModal&&(
        <div className="modal-ov" onClick={()=>{setShowStaffModal(false);setEditStaff(null);}}>
          <div className="modal" style={{maxWidth:480}} onClick={e=>e.stopPropagation()}>
            <h3 style={{fontSize:15,fontWeight:700,marginBottom:18}}>{editStaff?"Edit Staff":"Add Staff Member"}</h3>
            <div style={{display:"grid",gap:11}}>
              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}>
                <div><Lbl>Full Name</Lbl><input value={(editStaff||newStaff).name} onChange={e=>editStaff?setEditStaff(p=>({...p,name:e.target.value})):setNewStaff(p=>({...p,name:e.target.value}))}/></div>
                <div><Lbl>Type</Lbl>
                  <select value={(editStaff||newStaff).type} onChange={e=>editStaff?setEditStaff(p=>({...p,type:e.target.value})):setNewStaff(p=>({...p,type:e.target.value}))}>
                    {["full_time","part_time","contractor","intern"].map(t=><option key={t} value={t}>{t.replace("_"," ")}</option>)}
                  </select>
                </div>
              </div>
              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}>
                <div><Lbl>Department</Lbl>
                  <select value={(editStaff||newStaff).department} onChange={e=>editStaff?setEditStaff(p=>({...p,department:e.target.value})):setNewStaff(p=>({...p,department:e.target.value}))}>
                    {["Engineering","Management","Finance","Operations","IT","Administration","Other"].map(d=><option key={d}>{d}</option>)}
                  </select>
                </div>
                <div><Lbl>Role / Title</Lbl><input value={(editStaff||newStaff).role} onChange={e=>editStaff?setEditStaff(p=>({...p,role:e.target.value})):setNewStaff(p=>({...p,role:e.target.value}))} placeholder="e.g. CTO, Accountant"/></div>
              </div>
              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}>
                <div><Lbl>Monthly Salary (USD)</Lbl><input type="number" value={(editStaff||newStaff).salary_usd||""} onChange={e=>editStaff?setEditStaff(p=>({...p,salary_usd:+e.target.value})):setNewStaff(p=>({...p,salary_usd:+e.target.value}))} placeholder="0"/></div>
                <div><Lbl>Monthly Salary (EGP)</Lbl><input type="number" value={(editStaff||newStaff).salary_egp||""} onChange={e=>editStaff?setEditStaff(p=>({...p,salary_egp:+e.target.value})):setNewStaff(p=>({...p,salary_egp:+e.target.value}))} placeholder="0"/></div>
              </div>
              <div style={{display:"flex",alignItems:"center",gap:8}}>
                <input type="checkbox" id="staffActive" checked={(editStaff||newStaff).active!==false} onChange={e=>editStaff?setEditStaff(p=>({...p,active:e.target.checked})):setNewStaff(p=>({...p,active:e.target.checked}))}/>
                <label htmlFor="staffActive" style={{fontSize:11,color:"#7a8faa"}}>Active employee</label>
              </div>
              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}>
                <div><Lbl>Join / Start Date</Lbl><input type="date" value={(editStaff||newStaff).join_date||""} onChange={e=>editStaff?setEditStaff(p=>({...p,join_date:e.target.value})):setNewStaff(p=>({...p,join_date:e.target.value}))}/></div>
                <div><Lbl>Termination Date</Lbl><input type="date" value={(editStaff||newStaff).termination_date||""} onChange={e=>editStaff?setEditStaff(p=>({...p,termination_date:e.target.value})):setNewStaff(p=>({...p,termination_date:e.target.value}))} placeholder="Leave blank if active"/></div>
              </div>
              <div><Lbl>Notes</Lbl><input value={(editStaff||newStaff).notes||""} onChange={e=>editStaff?setEditStaff(p=>({...p,notes:e.target.value})):setNewStaff(p=>({...p,notes:e.target.value}))} placeholder="Optional notes"/></div>
            </div>
            <div style={{display:"flex",gap:10,marginTop:18,justifyContent:"flex-end"}}>
              <button className="bg" onClick={()=>{setShowStaffModal(false);setEditStaff(null);}}>Cancel</button>
              <button className="bp" onClick={saveStaff}>{editStaff?"Save Changes":"Add Staff"}</button>
            </div>
          </div>
        </div>
      )}

      {/* ── EXPENSE MODAL ── */}
      {showExpModal&&(
        <div className="modal-ov" onClick={()=>{setShowExpModal(false);setEditExp(null);}}>
          <div className="modal" style={{maxWidth:480}} onClick={e=>e.stopPropagation()}>
            <h3 style={{fontSize:15,fontWeight:700,marginBottom:18}}>{editExp?"Edit Expense":"Add Expense"}</h3>
            <div style={{display:"grid",gap:11}}>
              <div><Lbl>Category</Lbl>
                <select value={(editExp||newExp).category} onChange={e=>editExp?setEditExp(p=>({...p,category:e.target.value})):setNewExp(p=>({...p,category:e.target.value}))}>
                  {["Office Rent & Utilities","Salaries","Software & Subscriptions","Travel & Transportation","Equipment & Supplies","Other"].map(c=><option key={c}>{c}</option>)}
                </select>
              </div>
              <div><Lbl>Description</Lbl><input value={(editExp||newExp).description} onChange={e=>editExp?setEditExp(p=>({...p,description:e.target.value})):setNewExp(p=>({...p,description:e.target.value}))} placeholder="e.g. Office Rent — Cairo HQ"/></div>
              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}>
                <div><Lbl>Amount (USD)</Lbl><input type="number" value={(editExp||newExp).amount_usd||""} onChange={e=>editExp?setEditExp(p=>({...p,amount_usd:+e.target.value})):setNewExp(p=>({...p,amount_usd:+e.target.value}))} placeholder="0"/></div>
                <div><Lbl>Amount (EGP)</Lbl><input type="number" value={(editExp||newExp).amount_egp||""} onChange={e=>editExp?setEditExp(p=>({...p,amount_egp:+e.target.value})):setNewExp(p=>({...p,amount_egp:+e.target.value}))} placeholder="0"/></div>
              </div>
              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}>
                <div><Lbl>Month</Lbl>
                  <select value={(editExp||newExp).month} onChange={e=>editExp?setEditExp(p=>({...p,month:+e.target.value})):setNewExp(p=>({...p,month:+e.target.value}))}>
                    {["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"].map((m,i)=><option key={i} value={i}>{m}</option>)}
                  </select>
                </div>
                <div><Lbl>Year</Lbl>
                  <select value={(editExp||newExp).year} onChange={e=>editExp?setEditExp(p=>({...p,year:+e.target.value})):setNewExp(p=>({...p,year:+e.target.value}))}>
                    {[2024,2025,2026,2027].map(y=><option key={y}>{y}</option>)}
                  </select>
                </div>
              </div>
              <div><Lbl>Notes</Lbl><input value={(editExp||newExp).notes||""} onChange={e=>editExp?setEditExp(p=>({...p,notes:e.target.value})):setNewExp(p=>({...p,notes:e.target.value}))} placeholder="Optional notes"/></div>
            </div>
            <div style={{display:"flex",gap:10,marginTop:18,justifyContent:"flex-end"}}>
              <button className="bg" onClick={()=>{setShowExpModal(false);setEditExp(null);}}>Cancel</button>
              <button className="bp" onClick={saveExpense}>{editExp?"Save Changes":"Add Expense"}</button>
            </div>
          </div>
        </div>
      )}


      {/* ── FUNCTION HOURS MODAL ── */}
      {showFuncModal&&(
        <div className="modal-ov" onClick={()=>setShowFuncModal(false)}>
          <div className="modal" style={{maxWidth:460}} onClick={e=>e.stopPropagation()}>
            <h3 style={{fontSize:15,fontWeight:700,marginBottom:4}}>⚡ Log Function Hours</h3>
            <p style={{fontSize:10,color:"#2e4a66",marginBottom:16}}>Post non-billable activity hours for an engineer — visible in KPI reports.</p>
            <div style={{display:"grid",gap:11}}>
              <div><Lbl>Engineer</Lbl>
                <select value={newFunc.engineer_id} onChange={e=>setNewFunc(p=>({...p,engineer_id:e.target.value}))}
                  style={{borderColor:!newFunc.engineer_id?"#f87171":""}}>
                  <option value="">— Select Engineer —</option>
                  {engineers.map(e=><option key={e.id} value={e.id}>{e.name} · {e.role}</option>)}
                </select>
              </div>
              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}>
                <div><Lbl>Date</Lbl><input type="date" value={newFunc.date} onChange={e=>setNewFunc(p=>({...p,date:e.target.value}))}/></div>
                <div><Lbl>Hours</Lbl><input type="number" min=".5" max="12" step=".5" value={newFunc.hours} onChange={e=>setNewFunc(p=>({...p,hours:+e.target.value}))}/></div>
              </div>
              <div><Lbl>Function Category</Lbl>
                <select value={newFunc.function_category} onChange={e=>setNewFunc(p=>({...p,function_category:e.target.value}))}>
                  {FUNCTION_CATS.map(c=><option key={c}>{c}</option>)}
                </select>
                <div style={{display:"flex",alignItems:"center",gap:6,marginTop:6}}>
                  <div style={{width:10,height:10,borderRadius:2,background:FUNC_COLORS[newFunc.function_category]||"#6b7280",flexShrink:0}}/>
                  <span style={{fontSize:10,color:FUNC_COLORS[newFunc.function_category]||"#6b7280"}}>{newFunc.function_category}</span>
                </div>
              </div>
              <div><Lbl>Description <span style={{color:"#38bdf8"}}>(used in KPI reports)</span></Lbl>
                <textarea rows={3} value={newFunc.activity} onChange={e=>setNewFunc(p=>({...p,activity:e.target.value}))}
                  placeholder="e.g. Delivered PLC basics session to 3 junior engineers…" style={{resize:"vertical"}}/>
              </div>
            </div>
            <div style={{display:"flex",gap:10,marginTop:18,justifyContent:"flex-end"}}>
              <button className="bg" onClick={()=>setShowFuncModal(false)}>Cancel</button>
              <button className="bp" onClick={addFunctionEntry}>Post Function Hours</button>
            </div>
          </div>
        </div>
      )}

      {/* Toast */}
      {toast&&(
        <div className="toast" style={{background:toast.ok?"#022c22":"#450a0a",color:toast.ok?"#34d399":"#f87171",border:`1px solid ${toast.ok?"#34d399":"#f87171"}`}}>
          {toast.ok?"✓":"✕"} {toast.msg}
        </div>
      )}
    </div>
  );
}
