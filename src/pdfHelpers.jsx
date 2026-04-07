import { MONTHS, fmtCurrency } from './constants.js';


/* ------ COMPANY LOGO (embedded) ------ */
const LOGO_SRC="data:image/jpeg;base64,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";
const LogoImg=()=>(<img src={LOGO_SRC} alt="ENEVO Group" style={{width:64,height:64,borderRadius:12,objectFit:"contain",background:"transparent"}}/>);

/* ------ PDF HELPERS ------ */
const PDF_STYLE = `
  @import url('https://fonts.googleapis.com/css2?family=IBM+Plex+Sans:wght@300;400;600;700&family=IBM+Plex+Mono:wght@400;600&display=swap');
  *{margin:0;padding:0;box-sizing:border-box}
  body{font-family:'IBM Plex Sans',sans-serif;color:#1a2332;font-size:13px}
  /* ---- Fixed header repeats on every page ---- */
  .pdf-hdr{
    position:fixed;top:0;left:0;right:0;height:38px;z-index:1000;
    background:#0a1628;
    border-bottom:2px solid #0ea5e9;
    display:flex;align-items:center;justify-content:space-between;
    padding:0 28px;
  }
  .pdf-hdr-left{display:flex;align-items:center;gap:10px}
  .pdf-hdr-logo{width:26px;height:26px;border-radius:5px;object-fit:contain}
  .pdf-hdr-brand{font-family:'IBM Plex Mono',monospace;font-size:11px;letter-spacing:.15em;color:#38bdf8;font-weight:600}
  .pdf-hdr-title{font-size:12px;color:#94a3b8}
  .pdf-hdr-right{font-family:'IBM Plex Mono',monospace;font-size:11px;color:#475569}
  /* ---- Fixed footer repeats on every page ---- */
  .pdf-ftr{
    position:fixed;bottom:0;left:0;right:0;height:28px;z-index:1000;
    background:#f8fafc;
    border-top:1px solid #e2e8f0;
    display:flex;align-items:center;justify-content:space-between;
    padding:0 28px;
    font-size:10px;color:#94a3b8;
  }
  .pdf-ftr-left{display:flex;align-items:center;gap:8px}
  .pdf-ftr-dot{width:4px;height:4px;border-radius:50%;background:#0ea5e9}
  /* ---- Content area (pushed below header, above footer) ---- */
  .pdf-body{padding-top:50px;padding-bottom:38px}
  .cover{background:linear-gradient(135deg,#0a1628,#0f2a50 60%,#153d6e);color:#fff;padding:44px 44px 44px;position:relative;overflow:hidden;margin-top:38px;page-break-after:always}
  .cover::before{content:'';position:absolute;right:-60px;top:-60px;width:280px;height:280px;border:2px solid rgba(56,189,248,0.15);border-radius:50%}
  .cl{font-family:'IBM Plex Mono',monospace;font-size:11px;letter-spacing:.2em;color:#38bdf8;text-transform:uppercase;margin-bottom:8px}
  .ct{font-size:22px;font-weight:700;line-height:1.2;margin-bottom:6px}.cs{font-size:13px;color:#94a3b8}
  .cm{display:flex;gap:36px;margin-top:14px}.cm label{font-size:11px;color:#64748b;letter-spacing:.1em;text-transform:uppercase;display:block}
  .cm span{font-family:'IBM Plex Mono',monospace;font-size:13px;color:#e2e8f0}
  .body{padding:24px 32px;padding-top:28px}.section{margin-bottom:22px;page-break-inside:avoid}
  .st{font-size:13px;font-weight:700;color:#0f2a50;text-transform:uppercase;letter-spacing:.08em;padding-bottom:6px;border-bottom:2px solid #0ea5e9;margin-bottom:10px}
  .kg{display:grid;grid-template-columns:repeat(4,1fr);gap:10px;margin-bottom:4px}
  .kp{background:#f0f7ff;border:1px solid #bfdbfe;border-radius:6px;padding:10px}
  .kv{font-family:'IBM Plex Mono',monospace;font-size:20px;font-weight:700;color:#0ea5e9;line-height:1}
  .kl{font-size:11px;color:#64748b;text-transform:uppercase;letter-spacing:.08em;margin-top:4px}
  table{width:100%;border-collapse:collapse;font-size:12px}
  th{background:#0f2a50;color:#fff;padding:6px 8px;text-align:left;font-weight:600;font-size:11px;letter-spacing:.05em;text-transform:uppercase}
  td{padding:5px 8px;border-bottom:1px solid #e2e8f0;vertical-align:top}tr:nth-child(even) td{background:#f8fafc}
  .cover-page td{vertical-align:middle !important;padding:0 !important}
  .cover-page th{vertical-align:middle !important;padding:0 !important}
  .cover-page tr:nth-child(even) td{background:transparent !important}
  .cover-page table td,.cover-page table th{border:none !important}
  .footer{display:none}
  @media print{
    body{-webkit-print-color-adjust:exact;print-color-adjust:exact}
    @page{margin:14mm}
    .pdf-hdr{display:none !important}
    .pdf-ftr{display:none !important}
    .pdf-body{padding-top:0 !important;padding-bottom:0 !important}
    .cover{margin-top:0 !important}
    .body{padding-top:16px}
    .section{page-break-inside:auto}
    table{page-break-inside:auto}
    tr{page-break-inside:avoid;page-break-after:auto}
  }`;

/* Shared logo base64 ref for PDFs */
function pdfHeader(titleText, subtitleText, now){
  return `<div class="pdf-hdr">
    <div class="pdf-hdr-left">
      <img src="${LOGO_SRC}" class="pdf-hdr-logo" alt="ENEVO"/>
      <span class="pdf-hdr-brand">ENEVO-ERP</span>
      <span style="color:#192d47;font-size:12px">|</span>
      <span class="pdf-hdr-title">${titleText}</span>
    </div>
    <div class="pdf-hdr-right">${subtitleText || now}</div>
  </div>`;
}

function pdfFooter(leftText, now){
  return `<div class="pdf-ftr">
    <div class="pdf-ftr-left">
      <div class="pdf-ftr-dot"></div>
      <span>ENEVO Group آ· Industrial &amp; Renewable Energy Automation</span>
      <span style="color:#cbd5e1">آ·</span>
      <span>${leftText||""}</span>
    </div>
    <span>CONFIDENTIAL آ· ${now}</span>
  </div>`;
}

function generatePDF(title, sections, subtitle="ENEVO Group"){
  const win=window.open("","pdf_"+Date.now()+"_"+Math.random().toString(36).slice(2));
  const now=new Date().toLocaleDateString("en-GB",{day:"2-digit",month:"short",year:"numeric"});
  let html=`<!DOCTYPE html><html><head><meta charset="utf-8"><title>${title}</title><style>${PDF_STYLE}</style></head><body>
  ${pdfHeader(title, subtitle, now)}
  ${pdfFooter(subtitle, now)}
  <div class="cover">
  <div style="display:flex;align-items:center;gap:14px;margin-bottom:16px">
    <img src="data:image/jpeg;base64,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" alt="ENEVO Group" style="width:52px;height:52px;border-radius:10px;object-fit:contain;flex-shrink:0"/>
    <div>
      <div class="cl" style="margin-bottom:2px">ENEVO GROUP آ· ERP System</div>
      <div style="font-size:13px;color:#94a3b8">Industrial & Renewable Energy Automation</div>
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

/* ------ VACATION / LEAVE REPORT PDF ------ */
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

  const thStyle=`style="background:#f0f7ff;color:#0f2a50;font-size:11px;padding:6px 8px;text-align:center;border-bottom:2px solid #e2e8f0"`;
  const tdStyle=`style="font-size:11px;padding:5px 8px;text-align:center;border-bottom:1px solid #f1f5f9"`;
  const nameTd=`style="font-size:11px;padding:5px 8px;font-weight:600;border-bottom:1px solid #f1f5f9"`;

  const monthlyRows=leaveByEng.map(eng=>{
    const cells=leaveTypes.map(lt=>{
      const n=eng.byType[lt]||0;
      return`<td ${tdStyle} style="font-size:11px;padding:5px 8px;text-align:center;border-bottom:1px solid #f1f5f9;color:${n>0?typeColors[lt]:"#94a3b8"};font-weight:${n>0?700:400}">${n||"—"}</td>`;
    }).join("");
    return`<tr><td ${nameTd}>${eng.name}<br><span style="font-weight:400;color:#64748b;font-size:10px">${eng.role||""}</span></td>${cells}<td ${tdStyle} style="font-size:11px;padding:5px 8px;text-align:center;border-bottom:1px solid #f1f5f9;font-weight:700;color:#0f2a50">${eng.totalDays}d</td></tr>`;
  }).join("");

  const ytdRows=ytdByEng.map(eng=>{
    const cells=leaveTypes.map(lt=>{
      const n=eng.byType[lt]||0;
      return`<td ${tdStyle} style="font-size:11px;padding:5px 8px;text-align:center;border-bottom:1px solid #f1f5f9;color:${n>0?typeColors[lt]:"#94a3b8"};font-weight:${n>0?700:400}">${n||"—"}</td>`;
    }).join("");
    return`<tr><td ${nameTd}>${eng.name}</td>${cells}<td ${tdStyle} style="font-size:11px;padding:5px 8px;text-align:center;border-bottom:1px solid #f1f5f9;font-weight:700;color:#0f2a50">${eng.total}d</td></tr>`;
  }).join("");

  const detailRows=leaveByEng.map(eng=>{
    const chips=eng.entries.map(e=>`<span style="display:inline-block;margin:2px;padding:2px 7px;border-radius:3px;font-size:10px;background:${typeColors[e.leave_type||"Annual Leave"]}20;color:${typeColors[e.leave_type||"Annual Leave"]};border:1px solid ${typeColors[e.leave_type||"Annual Leave"]}40;font-family:'IBM Plex Mono',monospace">${e.date} آ· ${e.leave_type||"Annual Leave"}</span>`).join("");
    return`<tr><td style="padding:8px;border-bottom:1px solid #f1f5f9;vertical-align:top;width:120px;font-size:11px;font-weight:600">${eng.name}</td><td style="padding:8px;border-bottom:1px solid #f1f5f9">${chips}</td></tr>`;
  }).join("");

  const thCols=leaveTypes.map(lt=>`<th ${thStyle} style="background:#f0f7ff;color:${typeColors[lt]};font-size:11px;padding:6px 8px;text-align:center;border-bottom:2px solid #e2e8f0">${lt}</th>`).join("");

  generatePDF(
    `Vacation & Leave Report — ${MONTHS_[m]} ${y}`,
    [
      `<div class="section"><div class="st">${MONTHS_[m]} ${y} — Leave Summary</div>
      ${leaveByEng.length===0?`<p style="color:#94a3b8;font-size:13px;text-align:center;padding:20px">No leave recorded for ${MONTHS_[m]} ${y}.</p>`:`
      <table><thead><tr><th style="background:#f0f7ff;color:#0f2a50;font-size:11px;padding:6px 8px;border-bottom:2px solid #e2e8f0">Engineer</th>${thCols}<th ${thStyle} style="background:#f0f7ff;color:#0f2a50;font-size:11px;padding:6px 8px;text-align:center;border-bottom:2px solid #e2e8f0">Total</th></tr></thead>
      <tbody>${monthlyRows}</tbody></table>`}
      </div>`,
      `<div class="section"><div class="st">Year-to-Date ${y} — All Leave</div>
      ${ytdByEng.length===0?`<p style="color:#94a3b8;font-size:13px;text-align:center;padding:20px">No leave recorded for ${y}.</p>`:`
      <table><thead><tr><th style="background:#f0f7ff;color:#0f2a50;font-size:11px;padding:6px 8px;border-bottom:2px solid #e2e8f0">Engineer</th>${thCols}<th ${thStyle} style="background:#f0f7ff;color:#0f2a50;font-size:11px;padding:6px 8px;text-align:center;border-bottom:2px solid #e2e8f0">YTD Total</th></tr></thead>
      <tbody>${ytdRows}</tbody></table>`}
      </div>`,
      leaveByEng.length>0?`<div class="section"><div class="st">Leave Detail — ${MONTHS_[m]} ${y}</div>
      <table><thead><tr><th style="background:#f0f7ff;font-size:11px;padding:6px 8px;border-bottom:2px solid #e2e8f0;width:120px">Engineer</th><th style="background:#f0f7ff;font-size:11px;padding:6px 8px;border-bottom:2px solid #e2e8f0">Leave Days</th></tr></thead>
      <tbody>${detailRows}</tbody></table></div>`:""
    ],
    `Leave & Vacation Report آ· ${MONTHS_[m]} ${y}`
  );
}

/* ------ INDIVIDUAL TIMESHEET PDF ------ */
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
    <td style="font-weight:600">${p.name||p.id}${p.pm?"<br><span style='font-size:10px;color:#8b5cf6'>PM: "+p.pm+"</span>":""}</td>
    <td style="font-family:'IBM Plex Mono',monospace;color:#0ea5e9;font-size:11px">${p.id}</td>
    <td style="font-family:'IBM Plex Mono',monospace;font-weight:700;color:#0ea5e9">${p.hours}h</td>
    <td>${totalW?Math.round(p.hours/totalW*100):0}%</td></tr>`).join("");
  const entryRows=workE.map(e=>{
    const p=projects.find(x=>x.id===e.project_id);
    return`<tr>
      <td style="font-family:'IBM Plex Mono',monospace;font-size:11px">${e.date}</td>
      <td style="font-family:'IBM Plex Mono',monospace;font-size:11px;color:#0ea5e9">${e.project_id||""}</td>
      <td style="font-size:11px">${p?.name||""}</td>
      <td style="font-size:11px">${e.task_category||""}</td>
      <td style="font-size:11px">${e.task_type||""}</td>
      <td style="font-style:italic;font-size:11px;max-width:200px">${e.activity||""}</td>
      <td style="font-family:'IBM Plex Mono',monospace;font-weight:700;color:#0ea5e9">${e.hours}h</td></tr>`;}).join("");
  const leaveRows=leaveE.map(e=>`<tr>
    <td style="font-family:'IBM Plex Mono',monospace;font-size:11px">${e.date}</td>
    <td style="color:#fb923c;font-size:11px">${e.leave_type}</td>
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
        <div style="border-top:1px solid #e2e8f0;padding-top:8px"><div style="font-size:11px;color:#64748b;text-transform:uppercase;letter-spacing:.08em">Engineer Signature</div><div style="margin-top:4px;font-size:13px;color:#0f2a50;font-weight:600">${eng.name}</div><div style="font-size:11px;color:#94a3b8">${eng.role||""}</div></div>
        <div style="border-top:1px solid #e2e8f0;padding-top:8px"><div style="font-size:11px;color:#64748b;text-transform:uppercase;letter-spacing:.08em">Approved By</div><div style="margin-top:20px;border-bottom:1px solid #e2e8f0;width:200px"></div></div>
      </div></div>`
    ],
    `${eng.role||"Engineer"} آ· ${MONTHS[m]} ${y}`
  );
}

/* ------ INVOICE PDF ------ */
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
      return`<tr style="background:#f8fafc"><td style="padding-left:20px;font-size:11px;color:#64748b">â†³ ${eng?.name||"Unknown"}</td><td></td><td style="font-size:11px;color:#64748b">${eh}h</td><td></td></tr>`;
    }).join("");
    return{p,hrs,rev,rows:`<tr style="background:#f0f7ff">
      <td style="font-weight:600">${p.name||p.id}<br>${p.pm?"<span style='font-size:10px;color:#8b5cf6'>PM: "+p.pm+"</span><br>":""}<span style="font-size:11px;color:#64748b">${p.client||""}</span></td>
      <td style="font-family:'IBM Plex Mono',monospace;color:#0ea5e9;font-weight:700;font-size:11px">${p.id}</td>
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
          <div style="font-size:11px;color:#64748b;text-transform:uppercase;letter-spacing:.1em">Invoice From</div>
          <div style="display:flex;align-items:center;gap:10px;margin-top:4px">
            <img src="data:image/jpeg;base64,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" style="width:36px;height:36px;border-radius:6px;object-fit:contain"/>
            <div style="font-size:16px;font-weight:700;color:#0f2a50">ENEVO Group</div>
          </div>
          <div style="font-size:13px;color:#64748b;margin-top:2px">ENEVO Group</div>
          <div style="font-size:13px;color:#64748b">Industrial & Renewable Energy Automation</div>
        </div>
        <div style="text-align:right">
          <div style="font-family:'IBM Plex Mono',monospace;font-size:18px;font-weight:700;color:#0ea5e9">${invoiceNo}</div>
          <div style="font-size:12px;color:#64748b;margin-top:2px">Period: ${MONTHS[m]} ${y}</div>
          <div style="font-size:12px;color:#64748b">Date: ${now}</div>
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
      <tr style="background:#0f2a50;color:#fff"><td colspan="2" style="font-weight:700;font-size:13px">TOTAL</td>
      <td style="font-family:'IBM Plex Mono',monospace;font-weight:700">${totalHrs}h</td><td></td>
      <td style="font-family:'IBM Plex Mono',monospace;font-weight:700;font-size:15px">${fmtCurrency(totalRev)}</td></tr>
      </tbody></table></div>`,
      `<div class="section" style="margin-top:30px">
      <div style="background:#f0f7ff;border:1px solid #bfdbfe;border-radius:8px;padding:16px">
        <div style="font-size:12px;font-weight:700;color:#0f2a50;text-transform:uppercase;letter-spacing:.06em;margin-bottom:8px">Payment Terms</div>
        <div style="font-size:12px;color:#64748b;line-height:1.7">
          Payment due within 30 days of invoice date.<br>
          Please reference invoice number <strong>${invoiceNo}</strong> in all correspondence.<br>
          For queries contact: ENEVO Group Management
        </div>
      </div></div>`
    ],
    `Invoice No. ${invoiceNo} آ· For Finance & Management`
  );
}


/* ------ PROJECT TASKS ANALYSIS PDF ------ */
function buildProjectTasksPDF(pm, grandTotal, month, year, MONTHS_ARR, fmtCurrency, isAdmin, isAcct, periodLabel){
  try{
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
          <div style="font-size:11px;color:#64748b;text-transform:uppercase;letter-spacing:.08em;margin-top:4px">${k.l}</div>
        </div>`).join("")}
    </div>`;

  // Project info table
  const infoRows=[
    ["Project ID",p.id],
    ["Project Name",p.name],
    ["Client",p.client||"—"],
    ["Project Manager",p.pm||"—"],
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
      <div style="display:flex;justify-content:space-between;margin-bottom:3px;font-size:12px">
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
          <div style="display:flex;justify-content:space-between;margin-bottom:3px;font-size:12px">
            <div style="display:flex;align-items:center;gap:8px">
              <div style="width:24px;height:24px;border-radius:50%;background:linear-gradient(135deg,#0ea5e9,#0369a1);display:flex;align-items:center;justify-content:center;font-size:10px;font-weight:700;color:#fff;flex-shrink:0">${(eng.name||"?").slice(0,2).toUpperCase()}</div>
              <div>
                <div style="font-weight:600;color:#1e293b">${eng.name}</div>
                ${topTask?`<div style="font-size:11px;color:#64748b">Top task: ${topTask[0]} (${topTask[1]}h)</div>`:""}
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
            <td style="color:#64748b;font-size:12px">${topTask?topTask[0]+" ("+topTask[1]+"h)":"—"}</td></tr>`;
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
            <div style="font-size:11px;color:#64748b;text-transform:uppercase;letter-spacing:.08em;margin-top:4px">${k.l}</div>
          </div>`).join("")}
      </div>
      <div style="background:#e2e8f0;height:10px;border-radius:5px;overflow:hidden;margin-bottom:6px">
        <div style="height:100%;width:${billPct}%;background:linear-gradient(90deg,#34d399,#10b981);border-radius:5px"></div>
      </div>
      <div style="font-size:12px;color:#64748b;text-align:right">${billPct}% of hours are billable</div>
    </div>`:"";

  // Build full PDF using shared PDF_STYLE + fixed header/footer
  const html=`<!DOCTYPE html><html><head><meta charset="utf-8"><title>Project Report — ${p.id}</title><style>${PDF_STYLE}</style></head><body>
  ${pdfHeader(`Project Analysis آ· ${p.id}`, `${periodLabel||'All Time'}`, now)}
  ${pdfFooter(`${p.name} — ${p.id}`, now)}
  <div class="cover">
    <div style="display:flex;align-items:center;gap:14px;margin-bottom:16px">
      <img src="${LOGO_SRC}" alt="ENEVO Group" style="width:52px;height:52px;border-radius:10px;object-fit:contain;flex-shrink:0"/>
      <div>
        <div class="cl" style="margin-bottom:2px">ENEVO GROUP آ· Project Tasks Analysis</div>
        <div style="font-size:13px;color:#94a3b8">Industrial & Renewable Energy Automation</div>
      </div>
    </div>
    <div class="ct">${p.name}</div>
    <div class="cs">Project ID: ${p.id} آ· ${periodLabel||'All Time'}</div>
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
  const w=window.open("","pdf_"+Date.now()+"_"+Math.random().toString(36).slice(2));
  if(w){w.document.write(html);w.document.close();w.focus();setTimeout(()=>w.print(),600);}
  else{alert("Please allow popups to export PDFs.");}
  }catch(err){ alert("Export error: "+err.message); console.error(err); }
}


/* ------ FINANCE P&L PDF ------ */
function buildFinancePDF({finMonth,finYear,MONTHS_,monthRevUSD,totalPayrollUSDeff,totalPayrollEGP,totalExpUSD,totalExpEGP,totalCostUSD,netPL,netColor,activeStaff,monthExp,deptList,projProfit,ytdData,ytdRev,ytdCost,ytdNet,fmtCurrency,isAdmin,egpRate}){
  const totalPayrollUSD=totalPayrollUSDeff; // alias for PDF use
  const now=new Date().toLocaleDateString("en-GB",{day:"2-digit",month:"short",year:"numeric"});
  const period=`${MONTHS_[finMonth]} ${finYear}`;
  const netSign=netPL>=0?"▲ PROFIT":"▼ LOSS";
  const marginPct=monthRevUSD>0?Math.round(netPL/monthRevUSD*100):0;

  const kpiCards=(items)=>items.map(k=>`
    <div style="background:#f0f7ff;border:1px solid #bfdbfe;border-radius:8px;padding:12px;text-align:center">
      <div style="font-family:'IBM Plex Mono',monospace;font-size:18px;font-weight:700;color:${k.c};line-height:1">${k.v}</div>
      <div style="font-size:10px;color:#64748b;text-transform:uppercase;letter-spacing:.08em;margin-top:4px">${k.l}</div>
    </div>`).join("");

  const coverSection=`
  <div class="cover">
    <div style="display:flex;align-items:center;gap:14px;margin-bottom:20px">
      <img src="${LOGO_SRC}" style="width:52px;height:52px;border-radius:10px;object-fit:contain"/>
      <div>
        <div class="cl">ENEVO GROUP آ· Financial Report</div>
        <div style="font-size:13px;color:#94a3b8">Profit & Loss Statement</div>
      </div>
    </div>
    <div class="ct">P&L Report — ${period}</div>
    <div class="cs">Generated: ${now} آ· CONFIDENTIAL</div>
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
        <tr style="background:#f0fdf4"><td style="font-weight:700;color:#16a34a">Revenue — Billable Projects</td><td style="text-align:right;font-family:'IBM Plex Mono',monospace;font-weight:700;color:#16a34a">${fmtCurrency(monthRevUSD)}</td><td style="text-align:right">—</td><td style="font-size:11px;color:#64748b">Derived from project billing rates أ— hours</td></tr>
        <tr><td style="font-weight:600;color:#dc2626">Total Payroll</td><td style="text-align:right;font-family:'IBM Plex Mono',monospace;color:#dc2626;font-weight:700">${fmtCurrency(totalPayrollUSD)}</td><td style="text-align:right;font-family:'IBM Plex Mono',monospace;color:#ea580c">EGP ${totalPayrollEGP.toLocaleString()}</td><td style="font-size:11px;color:#64748b">${activeStaff.length} active staff</td></tr>
        <tr><td style="font-weight:600;color:#ea580c">Office & Other Expenses</td><td style="text-align:right;font-family:'IBM Plex Mono',monospace;color:#ea580c;font-weight:700">${fmtCurrency(totalExpUSD)}</td><td style="text-align:right;font-family:'IBM Plex Mono',monospace;color:#a78bfa">EGP ${totalExpEGP.toLocaleString()}</td><td style="font-size:11px;color:#64748b">${monthExp.length} expense entries</td></tr>
        <tr style="background:#0f2a50;color:#fff"><td style="font-weight:700">NET PROFIT / LOSS</td><td style="text-align:right;font-family:'IBM Plex Mono',monospace;font-weight:700;font-size:16px;color:${netColor}">${netPL>=0?"+":""}${fmtCurrency(netPL)}</td><td style="text-align:right;color:#94a3b8">—</td><td style="text-align:right;font-family:'IBM Plex Mono',monospace;color:${netColor}">${marginPct}% margin</td></tr>
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
        <td style="color:#0ea5e9;font-size:11px">${s.department}</td>
        <td style="color:#64748b;font-size:11px">${s.role}</td>
        <td style="font-size:10px"><span style="padding:2px 5px;border-radius:3px;background:#dbeafe;color:#1e40af">${(s.type||"full_time").replace("_"," ")}</span></td>
        <td style="text-align:right;font-family:'IBM Plex Mono',monospace;font-weight:700;color:#dc2626">${fmtCurrency(s.salary_usd||0)}</td>
        <td style="text-align:right;font-family:'IBM Plex Mono',monospace;color:#ea580c">EGP ${(s.salary_egp||0).toLocaleString()}</td>
        <td style="font-family:'IBM Plex Mono',monospace;font-size:11px;color:#0ea5e9">${s.join_date||'—'}</td>
        <td style="font-family:'IBM Plex Mono',monospace;font-size:11px;color:${s.termination_date?'#dc2626':'#94a3b8'}">${s.termination_date||'—'}</td>
      </tr>`).join("")}</tbody>
    </table>
  </div>`;

  const expSection=`
  <div class="section">
    <div class="st">Expense Detail — ${period} (${monthExp.length} entries)</div>
    ${monthExp.length===0?`<p style="color:#94a3b8;font-size:12px;padding:10px 0">No expenses recorded for ${period}.</p>`:`
    <table>
      <thead><tr><th>Category</th><th>Description</th><th style="text-align:right">USD</th><th style="text-align:right">EGP</th><th>Notes</th></tr></thead>
      <tbody>${monthExp.map(e=>`<tr>
        <td><span style="font-size:10px;padding:2px 5px;border-radius:3px;background:#dbeafe;color:#1e40af">${e.category}</span></td>
        <td>${e.description}</td>
        <td style="text-align:right;font-family:'IBM Plex Mono',monospace;font-weight:700;color:#ea580c">${e.amount_usd?fmtCurrency(e.amount_usd):"-"}</td>
        <td style="text-align:right;font-family:'IBM Plex Mono',monospace;color:#7c3aed">EGP ${(e.amount_egp||0).toLocaleString()}</td>
        <td style="font-size:11px;color:#64748b;font-style:italic">${e.notes||""}</td>
      </tr>`).join("")}</tbody>
    </table>`}
  </div>`;

  const projSection=projProfit.length>0?`
  <div class="section">
    <div class="st">Per-Project Profitability — ${period}</div>
    <div style="font-size:11px;color:#64748b;margin-bottom:8px">Cost allocated proportionally by hours worked on each billable project.</div>
    <table>
      <thead><tr><th>Project</th><th style="text-align:right">Revenue</th><th style="text-align:right">Alloc. Cost</th><th style="text-align:right">Net P&L</th><th style="text-align:right">Margin</th><th style="text-align:right">Hours</th></tr></thead>
      <tbody>${projProfit.map(p=>{
        const margin=p.rev>0?Math.round(p.net/p.rev*100):0;
        const c=p.net>=0?"#16a34a":"#dc2626";
        return`<tr>
          <td style="font-weight:600">${p.name} — ${p.id}</td>
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
    `Financial Statement آ· ${period} آ· CONFIDENTIAL`
  );
}

/* ------ ALL PROJECTS COMBINED PDF ------ */
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
      return`<div style="margin-bottom:10px">
        <div style="display:flex;justify-content:space-between;margin-bottom:3px;font-size:12px">
          <div style="display:flex;align-items:center;gap:6px">
            <div style="width:8px;height:8px;border-radius:2px;background:${col};flex-shrink:0"></div>
            <span style="font-weight:700;color:#0f172a;font-size:12px">${task}</span>
          </div>
          <div style="display:flex;gap:14px;font-family:'IBM Plex Mono',monospace">
            <span style="color:${col};font-weight:700;font-size:12px">${data.hrs}h</span>
            <span style="color:#334155;font-weight:600;font-size:12px">${tpct}%</span>
            <span style="color:#64748b;font-size:11px">${data.engs} eng</span>
          </div>
        </div>
        <div style="background:#cbd5e1;height:6px;border-radius:3px;overflow:hidden">
          <div style="height:100%;width:${tpct}%;background:${col};border-radius:3px"></div>
        </div>
      </div>`;
    }).join("");

    const engRows=engList.map((eng,ri)=>{
      const epct=pm.totalHrs?Math.round(eng.hrs/pm.totalHrs*100):0;
      const top=Object.entries(eng.tasks).sort((a,b)=>b[1]-a[1])[0];
      const rowBg=ri%2===0?"#f8fafc":"#fff";
      return`<tr style="background:${rowBg}">
        <td style="font-weight:600;color:#0f172a;padding:5px 8px">${eng.name}</td>
        <td style="text-align:right;font-family:'IBM Plex Mono',monospace;color:#0ea5e9;font-weight:700;padding:5px 8px">${eng.hrs}h</td>
        <td style="text-align:right;font-family:'IBM Plex Mono',monospace;color:#334155;font-weight:600;padding:5px 8px">${epct}%</td>
        <td style="color:#475569;font-size:11px;padding:5px 8px">${top?top[0]+" ("+top[1]+"h)":"—"}</td>
      </tr>`;
    }).join("");

    const billBar=(isAdmin||isAcct)&&p.billable?`
      <div style="margin-top:10px;padding-top:8px;border-top:1px solid #e2e8f0">
        <div style="display:flex;justify-content:space-between;font-size:11px;margin-bottom:3px">
          <span style="color:#64748b">Billable coverage</span>
          <span style="font-family:'IBM Plex Mono',monospace;color:#10b981;font-weight:700">${billPct}%${p.rate_per_hour>0?" آ· "+fmtCurrency(pm.totalHrs*p.rate_per_hour):""}</span>
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
          <div style="font-family:'IBM Plex Mono',monospace;font-size:11px;letter-spacing:.18em;color:#38bdf8;margin-bottom:5px;font-weight:700">${idx+1} of ${projList.length}  آ·  ${p.id}</div>
          <div style="font-size:20px;font-weight:700;color:#ffffff;margin-bottom:4px;letter-spacing:-.01em">${p.name||p.id}</div>
          <div style="font-size:12px;color:#94a3b8;margin-top:2px;font-weight:500">${p.client?"Client: "+p.client+"  آ·  ":""} Phase: ${p.phase||"—"}${p.type?"  آ·  "+p.type:""}${p.pm?"  آ·  PM: "+p.pm:""}</div>
        </div>
        <div style="text-align:right">
          <div style="font-family:'IBM Plex Mono',monospace;font-size:28px;font-weight:700;color:#38bdf8;line-height:1">${pm.totalHrs}h</div>
          <div style="font-size:11px;color:#94a3b8;margin-top:3px;font-weight:500">${pct}% of total  آ·  ${pm.days} days active</div>
          <div style="display:flex;gap:5px;margin-top:5px;justify-content:flex-end">
            <span style="font-size:10px;padding:2px 6px;border-radius:3px;background:${p.status==="Active"?"#024b36":"#1e3a5f"};color:${p.status==="Active"?"#34d399":"#60a5fa"}">${p.status||"Active"}</span>
            ${p.billable?`<span style="font-size:10px;padding:2px 6px;border-radius:3px;background:#0c2b4e;color:#38bdf8">BILLABLE</span>`:""}
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
        ].map(k=>`<div style="background:#f0f7ff;border:1px solid #bfdbfe;border-radius:8px;padding:12px">
          <div style="font-family:'IBM Plex Mono',monospace;font-size:20px;font-weight:700;color:${k.c};line-height:1">${k.v}</div>
          <div style="font-size:11px;color:#334155;text-transform:uppercase;letter-spacing:.08em;margin-top:5px;font-weight:600">${k.l}</div>
        </div>`).join("")}
      </div>

      <!-- Two columns: task breakdown + engineer contribution -->
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:14px;margin-bottom:10px">
        <div>
          <div style="font-size:11px;font-weight:700;color:#0e4880;text-transform:uppercase;letter-spacing:.1em;padding-bottom:6px;border-bottom:2px solid #0ea5e9;margin-bottom:10px">Task Breakdown آ· ${tasksSorted.length} types</div>
          ${taskBars||"<div style='color:#94a3b8;font-size:12px'>No task data</div>"}
        </div>
        <div>
          <div style="font-size:11px;font-weight:700;color:#4c1d95;text-transform:uppercase;letter-spacing:.1em;padding-bottom:6px;border-bottom:2px solid #a78bfa;margin-bottom:10px">Engineer Contributions</div>
          <table style="font-size:11px">
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
      <div style="border-top:1px solid #e2e8f0;margin-top:16px;padding-top:7px;font-size:10px;color:#64748b;display:flex;justify-content:space-between;font-weight:500">
        <span>ENEVO Group  آ·  Project Tasks Analysis  آ·  ${periodLabel||"All Time"}</span>
        <span>Project ${idx+1} of ${projList.length}</span>
      </div>
    </div>`;
  }

  // Cover page summary table
  const summaryRows=projList.map((pm,i)=>{
    const pct=grandTotal?Math.round(pm.totalHrs/grandTotal*100):0;
    const billPct=pm.totalHrs?Math.round(pm.billableHrs/pm.totalHrs*100):0;
    const rowBg=i%2===0?"rgba(255,255,255,0.04)":"rgba(255,255,255,0.00)";
    return`<tr style="background:${rowBg}">
      <td style="font-family:'IBM Plex Mono',monospace;font-size:11px;color:#38bdf8;font-weight:700;padding:7px 10px">${pm.proj.id}</td>
      <td style="font-weight:600;color:#f0f6ff;font-size:12px;padding:7px 10px">${pm.proj.name||pm.proj.id}</td>
      <td style="text-align:right;font-family:'IBM Plex Mono',monospace;font-weight:700;color:#38bdf8;padding:7px 10px">${pm.totalHrs}h</td>
      <td style="text-align:right;font-family:'IBM Plex Mono',monospace;color:#94a3b8;padding:7px 10px">${pct}%</td>
      <td style="text-align:right;font-family:'IBM Plex Mono',monospace;color:#10b981;font-weight:700;padding:7px 10px">${billPct}%</td>
      <td style="text-align:right;color:#e2e8f0;padding:7px 10px">${Object.keys(pm.engineers).length}</td>
      <td style="padding:7px 10px"><span style="font-size:10px;padding:3px 7px;border-radius:3px;font-weight:700;background:${pm.proj.status==="Active"?"#024b36":pm.proj.status==="Completed"?"#0f2a50":"#2d1a00"};color:${pm.proj.status==="Active"?"#34d399":pm.proj.status==="Completed"?"#60a5fa":"#fb923c"}">${pm.proj.status||"Active"}</span></td>
    </tr>`;
  }).join("");

  // Build summary rows — 100% explicit inline styles, zero inheritance
  const coverSummaryRows = projList.map((pm,i)=>{
    const pct   = grandTotal ? Math.round(pm.totalHrs/grandTotal*100) : 0;
    const bPct  = pm.totalHrs ? Math.round(pm.billableHrs/pm.totalHrs*100) : 0;
    const rowBg = i%2===0 ? "#0f2845" : "#0c1e36";
    const stBg  = pm.proj.status==="Active" ? "#064e3b" : pm.proj.status==="Completed" ? "#1e3a5f" : "#431407";
    const stCol = pm.proj.status==="Active" ? "#6ee7b7" : pm.proj.status==="Completed" ? "#93c5fd" : "#fdba74";
    // Hours bar — visual width relative to max
    const barW  = grandTotal ? Math.max(4, Math.round(pm.totalHrs/grandTotal*120)) : 4;
    const displayName = (pm.proj.name && pm.proj.name.trim()) ? pm.proj.name : pm.proj.id;
    return `<tr>
      <td style="padding:8px 12px;background:${rowBg};font-family:'IBM Plex Mono',monospace;font-size:11px;color:#38bdf8;font-weight:700;white-space:nowrap;border-bottom:1px solid #0a1e38">${pm.proj.id}</td>
      <td style="padding:8px 12px;background:${rowBg};font-size:12px;font-weight:600;color:#e2eaf4;border-bottom:1px solid #0a1e38">${displayName}</td>
      <td style="padding:8px 12px;background:${rowBg};border-bottom:1px solid #0a1e38">
        <div style="display:flex;align-items:center;gap:8px">
          <div style="flex:0 0 auto;width:${barW}px;height:5px;background:#1d6fa8;border-radius:3px"></div>
          <span style="font-family:'IBM Plex Mono',monospace;font-size:12px;font-weight:700;color:#7dd3fc">${pm.totalHrs}h</span>
        </div>
      </td>
      <td style="padding:8px 12px;background:${rowBg};text-align:center;font-family:'IBM Plex Mono',monospace;font-size:12px;color:#94a3b8;border-bottom:1px solid #0a1e38">${pct}%</td>
      <td style="padding:8px 12px;background:${rowBg};text-align:center;font-family:'IBM Plex Mono',monospace;font-size:12px;font-weight:700;color:#6ee7b7;border-bottom:1px solid #0a1e38">${bPct}%</td>
      <td style="padding:8px 12px;background:${rowBg};text-align:center;font-family:'IBM Plex Mono',monospace;font-size:12px;color:#c4b5fd;border-bottom:1px solid #0a1e38">${Object.keys(pm.engineers).length}</td>
      <td style="padding:8px 12px;background:${rowBg};border-bottom:1px solid #0a1e38"><span style="display:inline-block;padding:3px 9px;border-radius:20px;font-size:10px;font-weight:700;letter-spacing:.05em;background:${stBg};color:${stCol}">${pm.proj.status||"Active"}</span></td>
    </tr>`;
  }).join("");

  const coverHTML=`
  <div style="background:#060e1c;font-family:'IBM Plex Sans',Arial,sans-serif;box-sizing:border-box;min-height:100vh" class="cover-page">

    <!-- TOP HEADER STRIP -->
    <div style="background:linear-gradient(120deg,#071428 0%,#0e2748 50%,#071428 100%);padding:36px 52px 30px;border-bottom:2px solid #0ea5e920">
      <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:20px">
        <div style="display:flex;align-items:center;gap:14px">
          <img src="${LOGO_SRC}" style="width:48px;height:48px;border-radius:10px;object-fit:contain"/>
          <div>
            <div style="font-family:'IBM Plex Mono',monospace;font-size:10px;letter-spacing:.2em;color:#38bdf8;font-weight:700">ENEVO GROUP</div>
            <div style="font-size:12px;color:#475569;margin-top:2px">Industrial & Renewable Energy Automation</div>
          </div>
        </div>
        <div style="text-align:right">
          <div style="font-size:11px;color:#334155;font-family:'IBM Plex Mono',monospace">${now}</div>
          <div style="font-size:11px;color:#334155;font-family:'IBM Plex Mono',monospace;margin-top:2px">CONFIDENTIAL</div>
        </div>
      </div>

      <div style="margin-bottom:24px">
        <div style="font-size:11px;font-family:'IBM Plex Mono',monospace;letter-spacing:.18em;color:#0ea5e9;font-weight:700;margin-bottom:8px;text-transform:uppercase">Project Tasks Analysis Report</div>
        <div style="font-size:34px;font-weight:700;color:#f0f6ff;letter-spacing:-.025em;line-height:1.1;margin-bottom:6px">All Projects</div>
        <div style="font-size:15px;color:#4a6580;font-weight:500">Period: ${periodLabel||"All Time"}</div>
      </div>

      <!-- KPI CARDS — 4 columns -->
      <div style="display:grid;grid-template-columns:repeat(4,1fr);gap:10px">
        ${[
          {l:"Total Hours",   v:grandTotal+"h",   c:"var(--info)", border:"#1d4e6a"},
          {l:"Projects",      v:projList.length,   c:"#a78bfa", border:"#3d2d6a"},
          {l:"Billable Hours",v:totalBillable+"h", c:"#34d399", border:"#0d4a34"},
          {l:"Engineers",     v:allEngs.size,      c:"#fbbf24", border:"#5a3e00"},
        ].map(k=>`
          <div style="background:#071428;border:1px solid ${k.border};border-radius:10px;padding:14px 18px;border-top:3px solid ${k.c}">
            <div style="font-family:'IBM Plex Mono',monospace;font-size:30px;font-weight:800;color:${k.c};line-height:1">${k.v}</div>
            <div style="font-size:11px;color:#4a6580;text-transform:uppercase;letter-spacing:.1em;margin-top:7px;font-weight:600">${k.l}</div>
          </div>
        `).join("")}
      </div>
    </div>

    <!-- SUMMARY TABLE -->
    <div style="padding:28px 52px 44px;background:#060e1c">
      <div style="display:flex;align-items:center;gap:10px;margin-bottom:14px">
        <div style="width:3px;height:16px;background:#0ea5e9;border-radius:2px"></div>
        <div style="font-size:11px;font-weight:700;color:#0ea5e9;text-transform:uppercase;letter-spacing:.18em">Project Summary — ${projList.length} Projects</div>
      </div>
      <table style="width:100%;border-collapse:collapse">
        <thead>
          <tr style="background:#071428;border-bottom:1px solid #0ea5e930">
            <th style="padding:10px 12px;text-align:left;font-family:'IBM Plex Mono',monospace;font-size:8.5px;font-weight:700;letter-spacing:.12em;color:#0ea5e9;text-transform:uppercase;border-bottom:2px solid #0ea5e940">ID</th>
            <th style="padding:10px 12px;text-align:left;font-family:'IBM Plex Mono',monospace;font-size:8.5px;font-weight:700;letter-spacing:.12em;color:#0ea5e9;text-transform:uppercase;border-bottom:2px solid #0ea5e940">Project Name</th>
            <th style="padding:10px 12px;text-align:left;font-family:'IBM Plex Mono',monospace;font-size:8.5px;font-weight:700;letter-spacing:.12em;color:#0ea5e9;text-transform:uppercase;border-bottom:2px solid #0ea5e940">Hours</th>
            <th style="padding:10px 12px;text-align:center;font-family:'IBM Plex Mono',monospace;font-size:8.5px;font-weight:700;letter-spacing:.12em;color:#0ea5e9;text-transform:uppercase;border-bottom:2px solid #0ea5e940">Share</th>
            <th style="padding:10px 12px;text-align:center;font-family:'IBM Plex Mono',monospace;font-size:8.5px;font-weight:700;letter-spacing:.12em;color:#0ea5e9;text-transform:uppercase;border-bottom:2px solid #0ea5e940">Billable</th>
            <th style="padding:10px 12px;text-align:center;font-family:'IBM Plex Mono',monospace;font-size:8.5px;font-weight:700;letter-spacing:.12em;color:#0ea5e9;text-transform:uppercase;border-bottom:2px solid #0ea5e940">Engs</th>
            <th style="padding:10px 12px;text-align:center;font-family:'IBM Plex Mono',monospace;font-size:8.5px;font-weight:700;letter-spacing:.12em;color:#0ea5e9;text-transform:uppercase;border-bottom:2px solid #0ea5e940">Status</th>
          </tr>
        </thead>
        <tbody>${coverSummaryRows}</tbody>
      </table>

      <!-- Bottom branding line -->
      <div style="margin-top:28px;padding-top:14px;border-top:1px solid #0d1e30;display:flex;align-items:center;justify-content:space-between">
        <div style="display:flex;align-items:center;gap:8px">
          <img src="${LOGO_SRC}" style="width:20px;height:20px;border-radius:4px;object-fit:contain;opacity:.5"/>
          <span style="font-size:10px;color:#1e3a52;font-family:'IBM Plex Mono',monospace">ENEVO Group EC-ERP آ· Confidential</span>
        </div>
        <span style="font-size:10px;color:#1e3a52;font-family:'IBM Plex Mono',monospace">${now}</span>
      </div>
    </div>
  </div>`;

  const projectPages=projList.map((pm,i)=>buildProjectBlock(pm,i)).join("");

  const html=`<!DOCTYPE html><html><head><meta charset="utf-8">
    <title>All Projects Report — ${periodLabel||"All Time"}</title>
    <style>${PDF_STYLE}</style>
  </head><body>
    ${pdfHeader("Project Tasks Analysis آ· All Projects", periodLabel||"All Time", now)}
    ${pdfFooter("All Projects Report", now)}
    ${coverHTML}
    ${projectPages}
    <script>window.onload=()=>window.print()<\/script>
  </body></html>`;

  const win=window.open("","pdf_"+Date.now()+"_"+Math.random().toString(36).slice(2));
  if(win){win.document.write(html);win.document.close();win.focus();setTimeout(()=>win.print(),600);}
  else{alert("Please allow popups for this site to export PDFs.");}
}

export { LOGO_SRC, LogoImg, PDF_STYLE, pdfHeader, pdfFooter, generatePDF, buildVacationPDF, buildTimesheetPDF, buildInvoicePDF, buildProjectTasksPDF, buildFinancePDF, buildAllProjectsPDF };
