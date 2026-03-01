import { useState, useEffect, useMemo, useCallback } from "react";
import { supabase } from "./supabase";

/* ─── STATIC DATA ─── */
const TASK_CATEGORIES = {
  "Engineering":   ["Basic Engineering","Detailed Engineering","Electrical Design","Control Logic Design","P&ID Review","Cause & Effect Review"],
  "Software":      ["PLC Programming","SCADA Development","HMI Development","OPC Configuration","FAT Preparation","Software Testing"],
  "Documentation": ["Technical Writing","Datasheet Preparation","Wiring Diagrams","Cable Schedules","I/O List Preparation","Operation Manual"],
  "Project Mgmt":  ["Project Planning","Progress Reporting","Client Meeting","Internal Meeting","Change Management"],
  "Commissioning": ["Site Survey","Pre-commissioning","Loop Checking","System Integration Test","Cold Commissioning","Hot Commissioning"],
  "Quality":       ["Design Review","Code Review","Document Control","Quality Audit"],
  "Training":      ["Internal Training","Client Training","Knowledge Transfer"],
};
const LEAVE_TYPES  = ["Annual Leave","Sick Leave","Public Holiday","Business Travel","Training External","Unpaid Leave"];
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
  *{margin:0;padding:0;box-sizing:border-box}body{font-family:'IBM Plex Sans',sans-serif;color:#1a2332;font-size:11px}
  .cover{background:linear-gradient(135deg,#0a1628,#0f2a50 60%,#153d6e);color:#fff;padding:44px;position:relative;overflow:hidden}
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
  .footer{background:#f8fafc;border-top:1px solid #e2e8f0;padding:9px 32px;display:flex;justify-content:space-between;font-size:9px;color:#94a3b8}
  @media print{body{-webkit-print-color-adjust:exact;print-color-adjust:exact}@page{margin:0}}`;

function generatePDF(title, sections, subtitle="Engineering Center Egypt"){
  const win=window.open("","_blank");
  const now=new Date().toLocaleDateString("en-GB",{day:"2-digit",month:"short",year:"numeric"});
  let html=`<!DOCTYPE html><html><head><meta charset="utf-8"><title>${title}</title><style>${PDF_STYLE}</style></head><body>
  <div class="cover"><div class="cl">Engineering Center Egypt · EC-ERP v4</div>
  <div class="ct">${title}</div><div class="cs">${subtitle}</div>
  <div class="cm"><div><label>Generated</label><span>${now}</span></div><div><label>System</label><span>EC-ERP v4.0</span></div><div><label>Status</label><span>Confidential</span></div></div>
  </div><div class="body">`;
  sections.forEach(s=>{html+=s;});
  html+=`</div><div class="footer"><span>Engineering Center Egypt · Industrial & Renewable Energy Automation</span><span>CONFIDENTIAL — ${now}</span></div>
  <script>window.onload=()=>window.print()<\/script></body></html>`;
  win.document.write(html); win.document.close();
}

/* ─── INDIVIDUAL TIMESHEET PDF ─── */
function buildTimesheetPDF(eng, monthEntries, projects, m, y){
  const workE = monthEntries.filter(e=>e.engineer_id===eng.id&&e.entry_type==="work").sort((a,b)=>a.date.localeCompare(b.date));
  const leaveE= monthEntries.filter(e=>e.engineer_id===eng.id&&e.entry_type==="leave").sort((a,b)=>a.date.localeCompare(b.date));
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
  const billableProjs=projects.filter(p=>p.billable&&(!filterId||p.id===filterId));
  const monthE=entries.filter(e=>{const d=new Date(e.date);return d.getFullYear()===y&&d.getMonth()===m&&e.entry_type==="work"&&e.billable;});
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
          <div style="font-size:14px;font-weight:700;color:#0f2a50;margin-top:4px">Engineering Center Egypt</div>
          <div style="font-size:11px;color:#64748b">Cairo, Egypt · Industrial & Renewable Energy Automation</div>
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
          For queries contact: Engineering Center Egypt Management
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
  const [activeRpt,setActiveRpt]     = useState("utilization");
  const [rptEngId,setRptEngId]       = useState(null); // for individual timesheet export
  const [invoiceProjId,setInvoiceProjId] = useState("ALL"); // ALL or specific project id
  const [pendingRoles,setPendingRoles]     = useState({}); // eng.id -> role_type pending save
  // Filters (shared across pages)
  const [filterEngineer,setFilterEngineer] = useState("ALL");
  const [filterProject,setFilterProject]   = useState("ALL");
  // Import modal
  const [showImport,setShowImport]         = useState(false);
  const [importFiles,setImportFiles]       = useState([]);
  const [importLog,setImportLog]           = useState([]);
  const [importing,setImporting]           = useState(false);
  const [showProjModal,setShowProjModal]   = useState(false);
  const [editProjModal,setEditProjModal]   = useState(null);
  const [showEngModal,setShowEngModal]     = useState(false);
  const [editEngModal,setEditEngModal]     = useState(null);
  const [adminTab,setAdminTab]             = useState("engineers");
  const [entryFilter,setEntryFilter]       = useState({engineer:"ALL",project:"ALL",month:today.getMonth(),year:today.getFullYear()});
  const [newEntry,setNewEntry]   = useState({projectId:"",taskCategory:"Engineering",taskType:"Basic Engineering",hours:8,activity:"",type:"work",leaveType:LEAVE_TYPES[0]});
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

  const loadAll=useCallback(async()=>{
    setLoading(true);
    try{
      const [engsR,projR,entrR,profR,notifR]=await Promise.all([
        supabase.from("engineers").select("*").order("name"),
        supabase.from("projects").select("*").order("id"),
        supabase.from("time_entries").select("*").order("date",{ascending:false}),
        supabase.from("engineers").select("*").eq("user_id",session.user.id).single(),
        supabase.from("notifications").select("*").order("created_at",{ascending:false}).limit(50),
      ]);
      if(engsR.data) setEngineers(engsR.data);
      if(projR.data) setProjects(projR.data);
      if(entrR.data) setEntries(entrR.data);
      if(profR.data){ setMyProfile(profR.data); setBrowseEngId(profR.data.id); }
      if(notifR.data) setNotifications(notifR.data);
    }catch(e){showToast("Error loading data",false);}
    setLoading(false);
  },[session]);

  const handleLogin=async e=>{
    e.preventDefault(); setAuthErr("");
    const {error}=await supabase.auth.signInWithPassword({email:authEmail,password:authPwd});
    if(error) setAuthErr(error.message);
  };
  const handleLogout=async()=>{
    await supabase.auth.signOut();
    setSession(null);setEngineers([]);setProjects([]);setEntries([]);setMyProfile(null);
  };

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
    const payload={
      engineer_id:engId,
      project_id: newEntry.type==="leave"?null:newEntry.projectId,
      date,
      task_category:newEntry.type==="leave"?null:newEntry.taskCategory,
      task_type:   newEntry.type==="leave"?null:newEntry.taskType,
      hours:       newEntry.type==="leave"?8:+newEntry.hours,
      activity:    newEntry.activity,
      entry_type:  newEntry.type,
      leave_type:  newEntry.type==="leave"?newEntry.leaveType:null,
      billable:    newEntry.type==="leave"?false:(proj?.billable||false),
    };
    const {data,error}=await supabase.from("time_entries").insert(payload).select().single();
    if(error){showToast("Error: "+error.message,false);return;}
    setEntries(prev=>[data,...prev]);
    setModalDate(null);
    setNewEntry({projectId:"",taskCategory:"Engineering",taskType:"Basic Engineering",hours:8,activity:"",type:"work",leaveType:LEAVE_TYPES[0]});
    showToast("Hours posted ✓");
  };

  const saveEditEntry=async()=>{
    if(!editEntry) return;
    if(!canEditAny && editEntry.engineer_id !== myProfile?.id) { showToast("You can only edit your own entries",false); return; }
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
      entry_type:   editEntry.type,
      leave_type:   editEntry.type==="leave"?lvType:null,
      billable:     editEntry.type==="leave"?false:(proj?.billable||false),
      date:         editEntry.date,
    };
    const {data,error}=await supabase.from("time_entries").update(payload).eq("id",editEntry.id).select().single();
    if(error){showToast("Error: "+error.message,false);return;}
    setEntries(prev=>prev.map(e=>e.id===data.id?data:e));
    setEditEntry(null); showToast("Entry updated ✓");
  };

  const deleteEntry=async(id, engineerId)=>{
    if(!canEditAny && engineerId !== myProfile?.id) { showToast("You can only delete your own entries",false); return; }
    if(!window.confirm("Delete this entry?")) return;
    const {error}=await supabase.from("time_entries").delete().eq("id",id);
    if(error){showToast("Error",false);return;}
    setEntries(prev=>prev.filter(e=>e.id!==id));
    showToast("Deleted",false);
  };

  /* ── EXCEL IMPORT ── */
  const importTimesheets=async files=>{
    setImporting(true);
    setImportLog([]);
    const log=[];
    const addLog=(type,msg)=>{ log.push({type,msg}); setImportLog([...log]); };

    for(const file of files){
      addLog("info",`📂 Processing: ${file.name}`);
      try{
        const data=await file.arrayBuffer();
        // Parse xlsx in browser using SheetJS (loaded below)
        const XLSX=window._XLSX;
        if(!XLSX){ addLog("error","SheetJS not loaded — refresh and try again"); break; }
        const wb=XLSX.read(data,{type:"array",cellDates:true});
        const ws=wb.Sheets[wb.SheetNames[0]];
        const rows=XLSX.utils.sheet_to_json(ws,{header:1,raw:false,dateNF:"yyyy-mm-dd"});

        // Parse header info (rows 0-2)
        const engName=(rows[0]?.[1]||"").trim();
        const engEmail=(rows[1]?.[1]||"").trim().toLowerCase();
        const engRole=(rows[0]?.[4]||"").trim();
        const monthStr=rows[2]?.[1]||"";

        if(!engName||!engEmail){ addLog("error",`  ✕ Missing name or email`); continue; }
        addLog("info",`  👤 Engineer: ${engName} (${engEmail})`);

        // Find or create engineer
        let eng=engineers.find(e=>e.email?.toLowerCase()===engEmail);
        if(!eng){
          const {data:newEng,error:engErr}=await supabase.from("engineers").insert({
            name:engName, email:engEmail,
            role:engRole||"Automation Engineer",
            level:"Mid", role_type:"engineer",
            weekend_days:JSON.stringify([5,6])
          }).select().single();
          if(engErr){ addLog("error",`  ✕ Could not create engineer: ${engErr.message}`); continue; }
          eng=newEng;
          setEngineers(prev=>[...prev,newEng].sort((a,b)=>a.name.localeCompare(b.name)));
          addLog("ok",`  ✓ Created engineer: ${engName}`);
        } else {
          addLog("info",`  → Found existing engineer: ${eng.name}`);
        }

        // Parse daily rows (starting row index 4, after header row 3)
        let inserted=0, skipped=0;
        for(let i=4;i<rows.length;i++){
          const row=rows[i];
          if(!row||!row[0]) continue;
          // Skip summary rows
          if(typeof row[0]==="string"&&(row[0].toLowerCase().includes("subtotal")||row[0].toLowerCase().includes("signature"))) break;

          // Parse date
          let dateStr="";
          const rawDate=row[0];
          if(rawDate instanceof Date){ dateStr=rawDate.toISOString().slice(0,10); }
          else if(typeof rawDate==="string"&&rawDate.match(/\d{4}-\d{2}-\d{2}/)){dateStr=rawDate.slice(0,10);}
          else if(typeof rawDate==="string"&&rawDate.includes("/")){
            const parts=rawDate.split("/");
            if(parts.length===3) dateStr=`${parts[2]}-${parts[1].padStart(2,"0")}-${parts[0].padStart(2,"0")}`;
          }
          if(!dateStr) continue;

          const task=(row[2]||"").trim();
          const hoursRaw=row[3];
          const projName=(row[4]||"").trim();
          const taskDetails=(row[5]||"").trim();

          // Determine entry type
          const isWeekend=projName.toLowerCase()==="weekend"||(!task&&!hoursRaw&&!projName);
          const isHoliday=taskDetails.toLowerCase().includes("holiday")||(!task&&!hoursRaw&&taskDetails.toLowerCase().includes("holiday"));
          const isLeave=!task&&!hoursRaw&&!projName&&!isWeekend;

          if(isWeekend) continue; // skip weekends

          const hours=parseFloat(hoursRaw)||0;

          if(isHoliday||isLeave){
            // Insert leave entry
            const lvType=taskDetails.toLowerCase().includes("holiday")?"Public Holiday":"Annual Leave";
            const {error}=await supabase.from("time_entries").insert({
              engineer_id:eng.id, date:dateStr, hours:8,
              entry_type:"leave", leave_type:lvType, billable:false
            });
            if(!error) inserted++;
            else skipped++;
            continue;
          }

          if(!task||hours<=0||!projName) continue;

          // Match project by name (fuzzy)
          const projNameClean=projName.trim().toLowerCase();
          let proj=projects.find(p=>
            p.name.toLowerCase()===projNameClean||
            p.id.toLowerCase()===projNameClean||
            p.name.toLowerCase().includes(projNameClean)||
            projNameClean.includes(p.name.toLowerCase())
          );

          // Map task to category
          let taskCategory="Software", taskType="SCADA Development";
          const taskLower=task.toLowerCase();
          if(taskLower.includes("scada")||taskLower.includes("hmi")){taskCategory="Software";taskType=taskLower.includes("hmi")?"HMI Development":"SCADA Development";}
          else if(taskLower.includes("database")){taskCategory="Software";taskType="OPC Configuration";}
          else if(taskLower.includes("plc")||taskLower.includes("program")){taskCategory="Software";taskType="PLC Programming";}
          else if(taskLower.includes("engineer")||taskLower.includes("design")){taskCategory="Engineering";taskType="Detailed Engineering";}
          else if(taskLower.includes("commission")){taskCategory="Commissioning";taskType="System Integration Test";}
          else if(taskLower.includes("doc")||taskLower.includes("fds")||taskLower.includes("report")){taskCategory="Documentation";taskType="Technical Writing";}
          else if(taskLower.includes("meeting")||taskLower.includes("project")){taskCategory="Project Mgmt";taskType="Client Meeting";}

          const activity=taskDetails||(task+(projName?` on ${projName}`:""));

          const {error}=await supabase.from("time_entries").insert({
            engineer_id:eng.id,
            project_id: proj?.id||null,
            date:dateStr, hours,
            task_category:taskCategory, task_type:taskType,
            activity, entry_type:"work",
            billable:proj?.billable||false,
          });
          if(!error) inserted++;
          else skipped++;
        }
        addLog("ok",`  ✓ Imported ${inserted} entries (${skipped} skipped)`);
        if(inserted>0) addLog("warn","  ⚠ Check entries without matched projects — assign projects manually");
      }catch(err){
        addLog("error",`  ✕ Error reading file: ${err.message}`);
      }
    }
    addLog("info","✅ Import complete — refreshing data...");
    await loadAll();
    setImporting(false);
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
    const {id,...rest}=editProjModal;
    const {data,error}=await supabase.from("projects").update(rest).eq("id",id).select().single();
    if(error){showToast("Error: "+error.message,false);return;}
    setProjects(prev=>prev.map(p=>p.id===data.id?data:p));
    setEditProjModal(null); showToast("Project updated ✓");
  };
  const deleteProject=async id=>{
    if(!window.confirm(`Delete ${id} and all its entries?`)) return;
    await supabase.from("time_entries").delete().eq("project_id",id);
    await supabase.from("projects").delete().eq("id",id);
    setProjects(prev=>prev.filter(p=>p.id!==id));
    setEntries(prev=>prev.filter(e=>e.project_id!==id));
    showToast("Project deleted",false);
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
    const d=new Date(e.date); return d.getFullYear()===year&&d.getMonth()===month;
  }),[entries,year,month]);

  const workEntries   = monthEntries.filter(e=>e.entry_type==="work");
  const leaveEntries  = monthEntries.filter(e=>e.entry_type==="leave");
  const totalWorkHrs  = workEntries.reduce((s,e)=>s+e.hours,0);
  const totalBillable = workEntries.filter(e=>e.billable).reduce((s,e)=>s+e.hours,0);
  const totalRevenue  = workEntries.filter(e=>e.billable).reduce((s,e)=>{
    const p=projects.find(x=>x.id===e.project_id);return s+(p?p.rate_per_hour*e.hours:0);},0);
  const billabilityPct= totalWorkHrs?Math.round(totalBillable/totalWorkHrs*100):0;
  const overallUtil   = engineers.length?Math.min(100,Math.round(totalWorkHrs/(engineers.length*targetHrs)*100)):0;

  const engStats=useMemo(()=>engineers.map(eng=>{
    const we=monthEntries.filter(e=>e.engineer_id===eng.id);
    const wh=we.filter(e=>e.entry_type==="work").reduce((s,e)=>s+e.hours,0);
    const bh=we.filter(e=>e.entry_type==="work"&&e.billable).reduce((s,e)=>s+e.hours,0);
    const ld=we.filter(e=>e.entry_type==="leave").length;
    const rev=we.filter(e=>e.entry_type==="work"&&e.billable).reduce((s,e)=>{
      const p=projects.find(x=>x.id===e.project_id);return s+(p?p.rate_per_hour*e.hours:0);},0);
    const engWd=()=>{try{return eng.weekend_days?JSON.parse(eng.weekend_days):DEFAULT_WEEKEND;}catch{return DEFAULT_WEEKEND;}};
    const engTarget=getTargetHrs(year,month,engWd());
    return{...eng,workHrs:wh,billableHrs:bh,leaveDays:ld,revenue:rev,
      utilization:Math.min(100,Math.round(wh/engTarget*100)),
      billability:wh?Math.round(bh/wh*100):0};
  }),[engineers,monthEntries,projects,year,month]);

  const projStats=useMemo(()=>projects.map(p=>{
    const pe=monthEntries.filter(e=>e.project_id===p.id);
    const hrs=pe.reduce((s,e)=>s+e.hours,0);
    const rev=pe.reduce((s,e)=>s+(p.billable?p.rate_per_hour*e.hours:0),0);
    return{...p,hours:hrs,revenue:rev,engCount:[...new Set(pe.map(e=>e.engineer_id))].length};
  }),[projects,monthEntries]);

  const taskStats=useMemo(()=>{
    const map={};
    workEntries.forEach(e=>{
      if(!e.task_category) return;
      if(!map[e.task_category]) map[e.task_category]={category:e.task_category,hours:0,billable:0,tasks:{}};
      map[e.task_category].hours+=e.hours;
      if(e.billable) map[e.task_category].billable+=e.hours;
      map[e.task_category].tasks[e.task_type]=(map[e.task_category].tasks[e.task_type]||0)+e.hours;
    });
    return Object.values(map).sort((a,b)=>b.hours-a.hours);
  },[workEntries]);

  const adminBrowseEntries=useMemo(()=>entries.filter(e=>{
    const d=new Date(e.date);
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
    <div style={{display:"flex",alignItems:"center",justifyContent:"center",minHeight:"100vh",background:"#080d1a",fontFamily:"'IBM Plex Mono',monospace",color:"#38bdf8",fontSize:14}}>Loading EC-ERP…</div>
  );

  /* ── AUTH SCREEN ── */
  if(!session) return(
    <div style={{minHeight:"100vh",background:"#080d1a",display:"flex",alignItems:"center",justifyContent:"center",fontFamily:"'IBM Plex Sans',sans-serif"}}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=IBM+Plex+Sans:wght@400;600;700&family=IBM+Plex+Mono:wght@400;600&display=swap');*{box-sizing:border-box;margin:0;padding:0}input,select{background:#060e1c;border:1px solid #192d47;color:#dde3ef;padding:10px 14px;border-radius:7px;font-family:'IBM Plex Sans',sans-serif;font-size:13px;outline:none;width:100%;transition:border-color .2s}input:focus,select:focus{border-color:#38bdf8}select option{background:#060e1c}.bp{background:linear-gradient(135deg,#0ea5e9,#0369a1);border:none;color:#fff;padding:11px;border-radius:7px;cursor:pointer;font-family:'IBM Plex Sans',sans-serif;font-size:14px;font-weight:700;display:flex;align-items:center;justify-content:center}.bp:hover{opacity:.85}`}</style>
      <div style={{background:"#0b1526",border:"1px solid #192d47",borderRadius:14,padding:"36px",width:430,maxWidth:"95vw",boxShadow:"0 24px 60px #00000080"}}>
        <div style={{textAlign:"center",marginBottom:24}}>
          <div style={{fontFamily:"'IBM Plex Mono',monospace",fontSize:10,color:"#38bdf8",letterSpacing:".18em",marginBottom:8}}>ENGINEERING CENTER EGYPT</div>
          <div style={{fontSize:22,fontWeight:700,color:"#f0f6ff"}}>EC-ERP v4</div>
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
            <div style={{fontFamily:"'IBM Plex Mono',monospace",fontSize:9,color:"#38bdf8",letterSpacing:".18em",fontWeight:600}}>ENGINEERING CENTER</div>
            <div style={{fontSize:17,fontWeight:700,color:"#f0f6ff",marginTop:2}}>EC-ERP v4</div>
            <div style={{fontSize:10,color:"#2e4a66",marginTop:1,fontFamily:"'IBM Plex Mono',monospace"}}>Cairo, Egypt</div>
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
                <h1 style={{fontSize:21,fontWeight:700,color:"#f0f6ff"}}>Dashboard</h1>
                <p style={{color:"#2e4a66",fontSize:12,marginTop:3,fontFamily:"'IBM Plex Mono',monospace"}}>{MONTHS[month]} {year} · Live Overview</p>
              </div>
              <div style={{display:"grid",gridTemplateColumns:`repeat(${isAdmin||isAcct?5:3},1fr)`,gap:11,marginBottom:18}}>
                {[
                  {l:"Team Utilization",v:fmtPct(overallUtil),c:"#38bdf8",show:true},
                  {l:"Billability",v:fmtPct(billabilityPct),c:"#34d399",show:isAdmin||isAcct},
                  {l:"Revenue Billed",v:fmtCurrency(totalRevenue),c:"#a78bfa",show:isAdmin||isAcct},
                  {l:"Active Projects",v:projects.filter(p=>p.status==="Active").length,c:"#fb923c",show:true},
                  {l:"Absence Days",v:leaveEntries.length,c:"#f472b6",show:true},
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
                <h3 style={{fontSize:12,fontWeight:600,color:"#7a8faa",marginBottom:12}}>Projects — {MONTHS[month]} {year}</h3>
                <table>
                  <thead><tr><th>No.</th><th>Name</th><th>Phase</th><th>Hours</th>{(isAdmin||isAcct)&&<><th>Billing</th><th>Revenue</th></>}</tr></thead>
                  <tbody>{projStats.filter(p=>p.hours>0).map(p=>(
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
                        {allowed&&<button className="bp" style={{padding:"2px 5px",fontSize:10,
                          background:isWE?"linear-gradient(135deg,#b45309,#92400e)":isFuture?"linear-gradient(135deg,#7c3aed,#6d28d9)":undefined
                        }} onClick={()=>setModalDate(day)}>+</button>}
                        {!allowed&&<span style={{fontSize:8,color:"#2e4a66",fontFamily:"'IBM Plex Mono',monospace"}}>LOCKED</span>}
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
                <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:10}}>
                  <h3 style={{fontSize:13,fontWeight:600,color:"#7a8faa"}}>Full Month — {MONTHS[month]} {year}</h3>
                  <div style={{display:"flex",gap:8,alignItems:"center"}}>
                    <select style={{fontSize:11,padding:"4px 8px",width:"auto"}} value={filterProject} onChange={e=>setFilterProject(e.target.value)}>
                      <option value="ALL">All Projects</option>
                      {projects.map(p=><option key={p.id} value={p.id}>{p.id} — {p.name}</option>)}
                    </select>
                    {filterProject!=="ALL"&&<button className="bg" style={{fontSize:10,padding:"4px 8px"}} onClick={()=>setFilterProject("ALL")}>✕ Clear</button>}
                    <span style={{fontSize:10,color:"#253a52",fontFamily:"'IBM Plex Mono',monospace"}}>
                      {monthEntries.filter(e=>e.engineer_id===viewEngId&&(filterProject==="ALL"||e.project_id===filterProject)).reduce((s,e)=>s+e.hours,0)}h total
                    </span>
                  </div>
                </div>
                <div className="card">
                  <table>
                    <thead><tr><th>Date</th><th>Project</th><th>Task</th><th>Activity</th><th>Hrs</th><th>Type</th><th style={{width:80}}>Actions</th></tr></thead>
                    <tbody>
                      {monthEntries.filter(e=>e.engineer_id===viewEngId&&(filterProject==="ALL"||e.project_id===filterProject)).length===0&&
                        <tr><td colSpan={7} style={{textAlign:"center",color:"#253a52",padding:20}}>No entries for {MONTHS[month]} {year}</td></tr>}
                      {monthEntries.filter(e=>e.engineer_id===viewEngId&&(filterProject==="ALL"||e.project_id===filterProject)).sort((a,b)=>a.date.localeCompare(b.date)).map(e=>{
                        const proj=projects.find(p=>p.id===e.project_id);
                        return(
                          <tr key={e.id}>
                            <td style={{fontFamily:"'IBM Plex Mono',monospace",fontSize:11}}>{e.date}</td>
                            <td style={{fontSize:11,color:"#38bdf8"}}>{proj?.id||<span style={{color:"#fb923c"}}>{e.leave_type}</span>}</td>
                            <td style={{fontSize:11,color:"#7a8faa"}}>{e.task_type||"—"}</td>
                            <td style={{fontSize:11,color:"#4e6479",fontStyle:"italic",maxWidth:180,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{e.activity||"—"}</td>
                            <td style={{fontFamily:"'IBM Plex Mono',monospace",color:"#38bdf8",fontWeight:700}}>{e.hours}h</td>
                            <td><span style={{fontSize:9,padding:"2px 5px",borderRadius:3,background:e.entry_type==="leave"?"#7c2d1230":"#022c2230",color:e.entry_type==="leave"?"#fb923c":"#34d399",fontWeight:700}}>{e.entry_type}</span></td>
                            {canEdit&&<td><div style={{display:"flex",gap:5}}>
                              <button className="be" onClick={()=>setEditEntry({...e,projectId:e.project_id,type:e.entry_type,taskCategory:e.task_category||"Engineering",taskType:e.task_type||"Basic Engineering",leaveType:e.leave_type||"Annual Leave"})}>✎</button>
                              <button className="bd" onClick={()=>deleteEntry(e.id,e.engineer_id)}>✕</button>
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

          {/* ════ PROJECTS ════ */}
          {view==="projects"&&(
            <div>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:18}}>
                <h1 style={{fontSize:21,fontWeight:700,color:"#f0f6ff"}}>Projects</h1>
                {isAdmin&&<button className="bp" onClick={()=>setShowProjModal(true)}>+ New Project</button>}
              </div>
              <div style={{display:"grid",gridTemplateColumns:"repeat(2,1fr)",gap:12}}>
                {projects.map(p=>{
                  const ps=projStats.find(x=>x.id===p.id);
                  const topTasks=Object.entries(monthEntries.filter(e=>e.project_id===p.id).reduce((acc,e)=>{acc[e.task_type]=(acc[e.task_type]||0)+e.hours;return acc;},{})).sort((a,b)=>b[1]-a[1]).slice(0,3);
                  return(
                    <div key={p.id} className="card" style={{borderLeft:`3px solid ${p.type==="Renewable Energy"?"#34d399":"#818cf8"}`}}>
                      <div style={{display:"flex",justifyContent:"space-between",marginBottom:8}}>
                        <div>
                          <div style={{fontFamily:"'IBM Plex Mono',monospace",fontSize:11,color:"#38bdf8"}}>{p.id}</div>
                          <div style={{fontSize:13,fontWeight:600,marginTop:2,lineHeight:1.3}}>{p.name}</div>
                        </div>
                        <div style={{display:"flex",gap:5,alignItems:"flex-start"}}>
                          <span style={{fontSize:9,padding:"2px 7px",borderRadius:3,fontFamily:"'IBM Plex Mono',monospace",fontWeight:700,background:p.status==="Active"?"#024b36":p.status==="On Hold"?"#7c2d1230":"#1e3a5f",color:p.status==="Active"?"#34d399":p.status==="On Hold"?"#fb923c":"#60a5fa"}}>{p.status}</span>
                          {isAdmin&&<><button className="be" style={{fontSize:10}} onClick={()=>setEditProjModal({...p})}>✎</button><button className="bd" style={{fontSize:10}} onClick={()=>deleteProject(p.id)}>✕</button></>}
                        </div>
                      </div>
                      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:5,fontSize:11,marginBottom:10}}>
                        <div><span style={{color:"#2e4a66"}}>Client: </span>{p.client}</div>
                        <div><span style={{color:"#2e4a66"}}>Origin: </span>{p.origin}</div>
                        <div><span style={{color:"#2e4a66"}}>Phase: </span><span style={{color:"#60a5fa"}}>{p.phase}</span></div>
                        {(isAdmin||isAcct)&&<div><span style={{color:"#2e4a66"}}>Rate: </span><span style={{fontFamily:"'IBM Plex Mono',monospace",color:p.billable?"#a78bfa":"#253a52"}}>{p.billable?`$${p.rate_per_hour}/h`:"Non-Billable"}</span></div>}
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
          )}

          {/* ════ TEAM ════ */}
          {view==="team"&&(()=>{
            const filteredTeam=filterEngineer==="ALL"?engStats:engStats.filter(e=>e.id===+filterEngineer);
            const teamMonthEntries=monthEntries.filter(e=>filterProject==="ALL"||e.project_id===filterProject);
            const selectedEng=filterEngineer!=="ALL"?engStats.find(e=>e.id===+filterEngineer):null;
            return(
            <div>
              {/* Filter bar */}
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-end",marginBottom:18}}>
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
                    <button className="bg" style={{fontSize:11}} onClick={()=>{setFilterEngineer("ALL");setFilterProject("ALL");}}>✕ Clear Filters</button>}
                </div>
              </div>

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
                        <div style={{fontFamily:"'IBM Plex Mono',monospace",fontSize:14,fontWeight:700,color:"#38bdf8"}}>{(filterProject==="ALL"?eng.workHrs:teamMonthEntries.filter(e=>e.engineer_id===eng.id&&e.entry_type==="work").reduce((s,e)=>s+e.hours,0))}h</div>
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
                  {id:"utilization",icon:"◉",label:"Team Utilization",desc:"All engineers utilization & billability",show:true},
                  {id:"individual",icon:"👤",label:"Individual Timesheet",desc:"One engineer — full monthly timesheet PDF",show:true},
                  {id:"task",icon:"⊟",label:"Task Analysis",desc:"Task categories & activity log",show:true},
                  {id:"monthly",icon:"⊞",label:"Monthly Mgmt",desc:"Full executive summary",show:true},
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
                        const ee=monthEntries.filter(e=>e.engineer_id===eng.id);
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
              {activeRpt==="task"&&(
                <div className="card">
                  <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:12}}>
                    <h3 style={{fontSize:12,fontWeight:600,color:"#7a8faa"}}>Task Categories</h3>
                    <button className="bp" onClick={buildTaskPDF}>⬇ Export PDF</button>
                  </div>
                  {taskStats.map(cat=>{const pct=totalWorkHrs?Math.round(cat.hours/totalWorkHrs*100):0;return(
                    <div key={cat.category} style={{marginBottom:14,paddingBottom:14,borderBottom:"1px solid #0d1a2d"}}>
                      <div style={{display:"flex",justifyContent:"space-between",marginBottom:6}}>
                        <span style={{fontWeight:600}}>{cat.category}</span>
                        <div style={{display:"flex",gap:14,fontSize:11}}>
                          <span style={{fontFamily:"'IBM Plex Mono',monospace",color:"#38bdf8"}}>{cat.hours}h ({pct}%)</span>
                          <span style={{color:"#34d399"}}>{cat.hours?Math.round(cat.billable/cat.hours*100):0}% billable</span>
                        </div>
                      </div>
                      <div style={{display:"flex",flexWrap:"wrap",gap:5}}>
                        {Object.entries(cat.tasks).sort((a,b)=>b[1]-a[1]).map(([task,hrs])=>(
                          <span key={task} style={{background:"#060e1c",border:"1px solid #192d47",borderRadius:4,padding:"2px 7px",fontSize:10}}>
                            {task} <span style={{fontFamily:"'IBM Plex Mono',monospace",color:"#38bdf8"}}>{hrs}h</span>
                          </span>
                        ))}
                      </div>
                    </div>
                  );})}
                </div>
              )}

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
                const billableActive=projStats.filter(p=>p.billable&&p.hours>0);
                const filteredProjs=invoiceProjId==="ALL"?billableActive:billableActive.filter(p=>p.id===invoiceProjId);
                const invTotal=filteredProjs.reduce((s,p)=>s+p.revenue,0);
                const invHrs=filteredProjs.reduce((s,p)=>s+p.hours,0);
                return(
                <div>
                  {/* Invoice selector */}
                  <div className="card" style={{marginBottom:14}}>
                    <h3 style={{fontSize:13,fontWeight:600,color:"#f0f6ff",marginBottom:14}}>🧾 Invoice Export — {MONTHS[month]} {year}</h3>
                    <div style={{display:"grid",gridTemplateColumns:"1fr auto",gap:12,alignItems:"flex-end",marginBottom:16}}>
                      <div><Lbl>Invoice Scope</Lbl>
                        <select value={invoiceProjId} onChange={e=>setInvoiceProjId(e.target.value)}>
                          <option value="ALL">📋 All Billable Projects (Combined Invoice)</option>
                          {billableActive.map(p=><option key={p.id} value={p.id}>{p.id} — {p.name} · {p.hours}h · {fmtCurrency(p.revenue)}</option>)}
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
                    <h3 style={{fontSize:12,fontWeight:600,color:"#7a8faa",marginBottom:12}}>
                      {invoiceProjId==="ALL"?"All Billable Projects Preview":"Project Invoice Preview"}
                    </h3>
                    <table>
                      <thead><tr><th>Project No.</th><th>Name</th><th>Client</th><th>Hours</th><th>Rate</th><th>Amount</th></tr></thead>
                      <tbody>
                        {filteredProjs.map(p=>(
                          <tr key={p.id} style={{cursor:"pointer"}} onClick={()=>setInvoiceProjId(p.id)}>
                            <td style={{fontFamily:"'IBM Plex Mono',monospace",fontSize:11,color:"#38bdf8"}}>{p.id}</td>
                            <td style={{fontSize:11,fontWeight:500}}>{p.name}</td>
                            <td style={{fontSize:11,color:"#7a8faa"}}>{p.client}</td>
                            <td style={{fontFamily:"'IBM Plex Mono',monospace"}}>{p.hours}h</td>
                            <td style={{fontFamily:"'IBM Plex Mono',monospace",color:"#7a8faa"}}>${p.rate_per_hour}/h</td>
                            <td style={{fontFamily:"'IBM Plex Mono',monospace",color:"#a78bfa",fontWeight:700}}>{fmtCurrency(p.revenue)}</td>
                          </tr>
                        ))}
                        {filteredProjs.length>1&&(
                          <tr style={{background:"#0d1e34"}}>
                            <td colSpan={3} style={{fontWeight:700,color:"#f0f6ff"}}>TOTAL</td>
                            <td style={{fontFamily:"'IBM Plex Mono',monospace",fontWeight:700,color:"#38bdf8"}}>{invHrs}h</td>
                            <td></td>
                            <td style={{fontFamily:"'IBM Plex Mono',monospace",fontWeight:700,color:"#a78bfa",fontSize:13}}>{fmtCurrency(invTotal)}</td>
                          </tr>
                        )}
                        {filteredProjs.length===0&&<tr><td colSpan={6} style={{textAlign:"center",color:"#253a52",padding:20}}>No billable hours for {MONTHS[month]} {year}</td></tr>}
                      </tbody>
                    </table>
                    {invoiceProjId!=="ALL"&&billableActive.length>1&&(
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
                <div className="card">
                  <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:14}}>
                    <h3 style={{fontSize:13,fontWeight:600,color:"#7a8faa"}}>Projects ({projects.length})</h3>
                    <button className="bp" onClick={()=>setShowProjModal(true)}>+ New Project</button>
                  </div>
                  <table>
                    <thead><tr><th>ID</th><th>Name</th><th>Client</th><th>Phase</th><th>Status</th><th>Billing</th><th>Rate</th><th style={{width:100}}>Actions</th></tr></thead>
                    <tbody>{projects.map(p=>(
                      <tr key={p.id}>
                        <td style={{fontFamily:"'IBM Plex Mono',monospace",fontSize:11,color:"#38bdf8"}}>{p.id}</td>
                        <td style={{fontSize:11,fontWeight:500}}>{p.name}</td>
                        <td style={{color:"#7a8faa",fontSize:11}}>{p.client}</td>
                        <td style={{color:"#60a5fa",fontSize:11}}>{p.phase}</td>
                        <td><span style={{fontSize:9,padding:"2px 6px",borderRadius:3,fontWeight:700,background:p.status==="Active"?"#024b36":p.status==="On Hold"?"#7c2d1230":"#1e3a5f",color:p.status==="Active"?"#34d399":p.status==="On Hold"?"#fb923c":"#60a5fa"}}>{p.status}</span></td>
                        <td><span style={{fontSize:9,padding:"2px 6px",borderRadius:3,fontWeight:700,background:p.billable?"#0c2b4e":"#1a0a00",color:p.billable?"#38bdf8":"#fb923c"}}>{p.billable?"Billable":"Non-Bill"}</span></td>
                        <td style={{fontFamily:"'IBM Plex Mono',monospace",color:"#a78bfa"}}>${p.rate_per_hour}</td>
                        <td><div style={{display:"flex",gap:5}}>
                          <button className="be" onClick={()=>setEditProjModal({...p})}>✎</button>
                          <button className="bd" onClick={()=>deleteProject(p.id)}>✕</button>
                        </div></td>
                      </tr>
                    ))}</tbody>
                  </table>
                </div>
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
                    <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:12}}>
                      <h3 style={{fontSize:13,fontWeight:600,color:"#7a8faa"}}>Entries ({adminBrowseEntries.length})</h3>
                      <span style={{fontSize:11,color:"#2e4a66",fontFamily:"'IBM Plex Mono',monospace"}}>Total: {adminBrowseEntries.reduce((s,e)=>s+e.hours,0)}h</span>
                    </div>
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

              {/* SETTINGS */}
              {adminTab==="settings"&&isAdmin&&(
                <div style={{maxWidth:540}}>
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
              {/* Load SheetJS on mount */}
              {!window._XLSX&&(()=>{
                const s=document.createElement("script");
                s.src="https://cdnjs.cloudflare.com/ajax/libs/xlsx/0.18.5/xlsx.full.min.js";
                s.onload=()=>{window._XLSX=window.XLSX;};
                document.head.appendChild(s);
              })()}
              <div style={{marginBottom:20}}>
                <h1 style={{fontSize:21,fontWeight:700,color:"#f0f6ff"}}>Import Excel Timesheets</h1>
                <p style={{color:"#2e4a66",fontSize:12,marginTop:3}}>Upload ENEVOEGY timesheet files · Engineers are created automatically if not found</p>
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
                        <div style={{display:"flex",gap:10,marginTop:12}}>
                          <button className="bp" style={{flex:1,justifyContent:"center"}} disabled={importing} onClick={()=>importTimesheets(importFiles)}>
                            {importing?"⏳ Importing...":"⬆ Import All Files"}
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
      {modalDate&&(
        <div className="modal-ov" onClick={()=>setModalDate(null)}>
          <div className="modal" onClick={e=>e.stopPropagation()}>
            <h3 style={{fontSize:15,fontWeight:700,marginBottom:4}}>Post Hours</h3>
            <p style={{fontSize:11,color:"#2e4a66",marginBottom:18,fontFamily:"'IBM Plex Mono',monospace"}}>
              {new Date(modalDate).toLocaleDateString("en-US",{weekday:"long",year:"numeric",month:"long",day:"numeric"})}
              {canEdit&&viewEng&&<span> · {viewEng.name}</span>}
            </p>
            <div style={{display:"grid",gap:11}}>
              <div><Lbl>Entry Type</Lbl>
                <select value={newEntry.type} onChange={e=>setNewEntry(p=>({...p,type:e.target.value}))}>
                  <option value="work">Work</option><option value="leave">Leave / Absence</option>
                </select>
              </div>
              {newEntry.type==="work"?<>
                <div><Lbl>Project</Lbl>
                  <select value={newEntry.projectId} onChange={e=>setNewEntry(p=>({...p,projectId:e.target.value}))}>
                    <option value="">— Select Project —</option>
                    {projects.filter(p=>p.status==="Active").map(p=><option key={p.id} value={p.id}>{p.id} — {p.name}</option>)}
                  </select>
                </div>
                <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}>
                  <div><Lbl>Task Category</Lbl>
                    <select value={newEntry.taskCategory} onChange={e=>setNewEntry(p=>({...p,taskCategory:e.target.value,taskType:TASK_CATEGORIES[e.target.value][0]}))}>
                      {Object.keys(TASK_CATEGORIES).map(c=><option key={c}>{c}</option>)}
                    </select>
                  </div>
                  <div><Lbl>Task Type</Lbl>
                    <select value={newEntry.taskType} onChange={e=>setNewEntry(p=>({...p,taskType:e.target.value}))}>
                      {(TASK_CATEGORIES[newEntry.taskCategory]||[]).map(t=><option key={t}>{t}</option>)}
                    </select>
                  </div>
                </div>
                <div><Lbl>Hours</Lbl><input type="number" min=".5" max="12" step=".5" value={newEntry.hours} onChange={e=>setNewEntry(p=>({...p,hours:+e.target.value}))}/></div>
                <div><Lbl>Activity Description <span style={{color:"#38bdf8"}}>(important for reports)</span></Lbl>
                  <textarea rows={3} placeholder="e.g. Developed PLC logic for pump control sequence…" value={newEntry.activity} onChange={e=>setNewEntry(p=>({...p,activity:e.target.value}))} style={{resize:"vertical"}}/>
                </div>
              </>:(
                <div><Lbl>Leave Type</Lbl>
                  <select value={newEntry.leaveType} onChange={e=>setNewEntry(p=>({...p,leaveType:e.target.value}))}>
                    {LEAVE_TYPES.map(t=><option key={t}>{t}</option>)}
                  </select>
                </div>
              )}
            </div>
            <div style={{display:"flex",gap:10,marginTop:18,justifyContent:"flex-end"}}>
              <button className="bg" onClick={()=>setModalDate(null)}>Cancel</button>
              <button className="bp" onClick={()=>addEntry(modalDate)}>Post Hours</button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Entry */}
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
                    <select value={editEntry.taskCategory||editEntry.task_category||"Engineering"} onChange={e=>setEditEntry(p=>({...p,taskCategory:e.target.value,taskType:TASK_CATEGORIES[e.target.value][0]}))}>
                      {Object.keys(TASK_CATEGORIES).map(c=><option key={c}>{c}</option>)}
                    </select>
                  </div>
                  <div><Lbl>Task Type</Lbl>
                    <select value={editEntry.taskType||editEntry.task_type||""} onChange={e=>setEditEntry(p=>({...p,taskType:e.target.value}))}>
                      {(TASK_CATEGORIES[editEntry.taskCategory||editEntry.task_category||"Engineering"]||[]).map(t=><option key={t}>{t}</option>)}
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
          <div className="modal" onClick={e=>e.stopPropagation()}>
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
          <div className="modal" onClick={e=>e.stopPropagation()}>
            <h3 style={{fontSize:15,fontWeight:700,marginBottom:18}}>Edit Project — {editProjModal.id}</h3>
            <div style={{display:"grid",gap:11}}>
              <div><Lbl>Project Name</Lbl><input value={editProjModal.name} onChange={e=>setEditProjModal(p=>({...p,name:e.target.value}))}/></div>
              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}>
                <div><Lbl>Status</Lbl><select value={editProjModal.status} onChange={e=>setEditProjModal(p=>({...p,status:e.target.value}))}>{["Active","On Hold","Completed"].map(s=><option key={s}>{s}</option>)}</select></div>
                <div><Lbl>Phase</Lbl><select value={editProjModal.phase} onChange={e=>setEditProjModal(p=>({...p,phase:e.target.value}))}>{PHASES.map(ph=><option key={ph}>{ph}</option>)}</select></div>
              </div>
              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}>
                <div><Lbl>Client</Lbl><input value={editProjModal.client||""} onChange={e=>setEditProjModal(p=>({...p,client:e.target.value}))}/></div>
                <div><Lbl>Origin</Lbl><input value={editProjModal.origin||""} onChange={e=>setEditProjModal(p=>({...p,origin:e.target.value}))}/></div>
              </div>
              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}>
                <div><Lbl>Type</Lbl><select value={editProjModal.type} onChange={e=>setEditProjModal(p=>({...p,type:e.target.value}))}><option>Renewable Energy</option><option>Industrial</option></select></div>
                <div><Lbl>Phase</Lbl><select value={editProjModal.phase} onChange={e=>setEditProjModal(p=>({...p,phase:e.target.value}))}>{PHASES.map(ph=><option key={ph}>{ph}</option>)}</select></div>
              </div>
              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}>
                <div><Lbl>Billable?</Lbl><select value={editProjModal.billable?"yes":"no"} onChange={e=>setEditProjModal(p=>({...p,billable:e.target.value==="yes"}))}><option value="yes">Yes</option><option value="no">No</option></select></div>
                <div><Lbl>Rate per Hour ($)</Lbl><input type="number" value={editProjModal.rate_per_hour} onChange={e=>setEditProjModal(p=>({...p,rate_per_hour:+e.target.value}))}/></div>
              </div>
            </div>
            <div style={{display:"flex",gap:10,marginTop:18,justifyContent:"flex-end"}}>
              <button className="bg" onClick={()=>setEditProjModal(null)}>Cancel</button>
              <button className="bp" onClick={saveEditProject}>Save Changes</button>
            </div>
          </div>
        </div>
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
              <div><Lbl>Job Role</Lbl><select value={newEng.role} onChange={e=>setNewEng(p=>({...p,role:e.target.value}))}>{ROLES_LIST.map(r=><option key={r}>{r}</option>)}</select></div>
              <div><Lbl>Email (must match their signup email)</Lbl><input type="email" value={newEng.email} onChange={e=>setNewEng(p=>({...p,email:e.target.value}))}/></div>
              <div><Lbl>Access Role</Lbl><select value={newEng.role_type} onChange={e=>setNewEng(p=>({...p,role_type:e.target.value}))}>{ROLE_TYPES.map(r=><option key={r} value={r}>{ROLE_LABELS[r]}</option>)}</select></div>
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

      {/* Toast */}
      {toast&&(
        <div className="toast" style={{background:toast.ok?"#022c22":"#450a0a",color:toast.ok?"#34d399":"#f87171",border:`1px solid ${toast.ok?"#34d399":"#f87171"}`}}>
          {toast.ok?"✓":"✕"} {toast.msg}
        </div>
      )}
    </div>
  );
}
