import { MONTHS, fmtCurrency } from './constants.js';


/* â”€â”€â”€ COMPANY LOGO (embedded) â”€â”€â”€ */
const LOGO_SRC="data:image/jpeg;base64,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";
const LogoImg=()=>(<img src={LOGO_SRC} alt="ENEVO Group" style={{width:64,height:64,borderRadius:12,objectFit:"contain",background:"transparent"}}/>);

/* â”€â”€â”€ PDF HELPERS â”€â”€â”€ */
const PDF_STYLE = `
  @import url('https://fonts.googleapis.com/css2?family=IBM+Plex+Sans:wght@300;400;600;700&family=IBM+Plex+Mono:wght@400;600&display=swap');
  *{margin:0;padding:0;box-sizing:border-box}
  body{font-family:'IBM Plex Sans',sans-serif;color:#1a2332;font-size:13px}
  /* â”€â”€ Fixed header repeats on every page â”€â”€ */
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
  /* â”€â”€ Fixed footer repeats on every page â”€â”€ */
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
  /* â”€â”€ Content area (pushed below header, above footer) â”€â”€ */
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

/* â”€â”€â”€ VACATION / LEAVE REPORT PDF â”€â”€â”€ */
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
      return`<td ${tdStyle} style="font-size:11px;padding:5px 8px;text-align:center;border-bottom:1px solid #f1f5f9;color:${n>0?typeColors[lt]:"#94a3b8"};font-weight:${n>0?700:400}">${n||"â€”"}</td>`;
    }).join("");
    return`<tr><td ${nameTd}>${eng.name}<br><span style="font-weight:400;color:#64748b;font-size:10px">${eng.role||""}</span></td>${cells}<td ${tdStyle} style="font-size:11px;padding:5px 8px;text-align:center;border-bottom:1px solid #f1f5f9;font-weight:700;color:#0f2a50">${eng.totalDays}d</td></tr>`;
  }).join("");

  const ytdRows=ytdByEng.map(eng=>{
    const cells=leaveTypes.map(lt=>{
      const n=eng.byType[lt]||0;
      return`<td ${tdStyle} style="font-size:11px;padding:5px 8px;text-align:center;border-bottom:1px solid #f1f5f9;color:${n>0?typeColors[lt]:"#94a3b8"};font-weight:${n>0?700:400}">${n||"â€”"}</td>`;
    }).join("");
    return`<tr><td ${nameTd}>${eng.name}</td>${cells}<td ${tdStyle} style="font-size:11px;padding:5px 8px;text-align:center;border-bottom:1px solid #f1f5f9;font-weight:700;color:#0f2a50">${eng.total}d</td></tr>`;
  }).join("");

  const detailRows=leaveByEng.map(eng=>{
    const chips=eng.entries.map(e=>`<span style="display:inline-block;margin:2px;padding:2px 7px;border-radius:3px;font-size:10px;background:${typeColors[e.leave_type||"Annual Leave"]}20;color:${typeColors[e.leave_type||"Annual Leave"]};border:1px solid ${typeColors[e.leave_type||"Annual Leave"]}40;font-family:'IBM Plex Mono',monospace">${e.date} آ· ${e.leave_type||"Annual Leave"}</span>`).join("");
    return`<tr><td style="padding:8px;border-bottom:1px solid #f1f5f9;vertical-align:top;width:120px;font-size:11px;font-weight:600">${eng.name}</td><td style="padding:8px;border-bottom:1px solid #f1f5f9">${chips}</td></tr>`;
  }).join("");

  const thCols=leaveTypes.map(lt=>`<th ${thStyle} style="background:#f0f7ff;color:${typeColors[lt]};font-size:11px;padding:6px 8px;text-align:center;border-bottom:2px solid #e2e8f0">${lt}</th>`).join("");

  generatePDF(
    `Vacation & Leave Report â€” ${MONTHS_[m]} ${y}`,
    [
      `<div class="section"><div class="st">${MONTHS_[m]} ${y} â€” Leave Summary</div>
      ${leaveByEng.length===0?`<p style="color:#94a3b8;font-size:13px;text-align:center;padding:20px">No leave recorded for ${MONTHS_[m]} ${y}.</p>`:`
      <table><thead><tr><th style="background:#f0f7ff;color:#0f2a50;font-size:11px;padding:6px 8px;border-bottom:2px solid #e2e8f0">Engineer</th>${thCols}<th ${thStyle} style="background:#f0f7ff;color:#0f2a50;font-size:11px;padding:6px 8px;text-align:center;border-bottom:2px solid #e2e8f0">Total</th></tr></thead>
      <tbody>${monthlyRows}</tbody></table>`}
      </div>`,
      `<div class="section"><div class="st">Year-to-Date ${y} â€” All Leave</div>
      ${ytdByEng.length===0?`<p style="color:#94a3b8;font-size:13px;text-align:center;padding:20px">No leave recorded for ${y}.</p>`:`
      <table><thead><tr><th style="background:#f0f7ff;color:#0f2a50;font-size:11px;padding:6px 8px;border-bottom:2px solid #e2e8f0">Engineer</th>${thCols}<th ${thStyle} style="background:#f0f7ff;color:#0f2a50;font-size:11px;padding:6px 8px;text-align:center;border-bottom:2px solid #e2e8f0">YTD Total</th></tr></thead>
      <tbody>${ytdRows}</tbody></table>`}
      </div>`,
      leaveByEng.length>0?`<div class="section"><div class="st">Leave Detail â€” ${MONTHS_[m]} ${y}</div>
      <table><thead><tr><th style="background:#f0f7ff;font-size:11px;padding:6px 8px;border-bottom:2px solid #e2e8f0;width:120px">Engineer</th><th style="background:#f0f7ff;font-size:11px;padding:6px 8px;border-bottom:2px solid #e2e8f0">Leave Days</th></tr></thead>
      <tbody>${detailRows}</tbody></table></div>`:""
    ],
    `Leave & Vacation Report آ· ${MONTHS_[m]} ${y}`
  );
}

/* â”€â”€â”€ INDIVIDUAL TIMESHEET PDF â”€â”€â”€ */
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
    `Monthly Timesheet â€” ${eng.name}`,
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
      `<div class="section"><div class="st">Daily Work Log â€” ${MONTHS[m]} ${y}</div>
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

/* â”€â”€â”€ INVOICE PDF â”€â”€â”€ */
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
    `Invoice â€” ${MONTHS[m]} ${y}`,
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

/* â”€â”€â”€ SIGNUP SCREEN â”€â”€â”€ */
/* â”€â”€ UNDO HELPER â€” used by all delete operations â”€â”€
   Removes from UI immediately, gives 5s undo window, fires DB delete after. */
export { LOGO_SRC, LogoImg, PDF_STYLE, pdfHeader, pdfFooter, generatePDF, buildVacationPDF, buildTimesheetPDF, buildInvoicePDF };
