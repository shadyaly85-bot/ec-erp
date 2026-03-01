import { useState, useEffect, useMemo } from "react";
import { supabase } from "./supabase";

/* ─── STATIC REFERENCE DATA ─── */
const TASK_CATEGORIES = {
  "Engineering":    ["Basic Engineering","Detailed Engineering","Electrical Design","Control Logic Design","P&ID Review","Cause & Effect Review"],
  "Software":       ["PLC Programming","SCADA Development","HMI Development","OPC Configuration","FAT Preparation","Software Testing"],
  "Documentation":  ["Technical Writing","Datasheet Preparation","Wiring Diagrams","Cable Schedules","I/O List Preparation","Operation Manual"],
  "Project Mgmt":   ["Project Planning","Progress Reporting","Client Meeting","Internal Meeting","Change Management"],
  "Commissioning":  ["Site Survey","Pre-commissioning","Loop Checking","System Integration Test","Cold Commissioning","Hot Commissioning"],
  "Quality":        ["Design Review","Code Review","Document Control","Quality Audit"],
  "Training":       ["Internal Training","Client Training","Knowledge Transfer"],
};
const LEAVE_TYPES = ["Annual Leave","Sick Leave","Public Holiday","Business Travel","Training External","Unpaid Leave"];
const MONTHS = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
const fmt    = d => d.toISOString().slice(0,10);
const today  = new Date();
const fmtCurrency = n => `$${(n||0).toLocaleString(undefined,{minimumFractionDigits:0})}`;
const fmtPct = n => `${Math.round(n||0)}%`;
const TARGET_HRS = 22 * 8; // 176h/month
const getWeekDays = date => {
  const d=new Date(date),day=d.getDay();
  const mon=new Date(d); mon.setDate(d.getDate()-(day===0?6:day-1));
  return Array.from({length:5},(_,i)=>{const x=new Date(mon);x.setDate(mon.getDate()+i);return fmt(x);});
};

/* ─── PDF GENERATOR ─── */
function generatePDF(title, sections, subtitle="Engineering Center Egypt") {
  const win = window.open("","_blank");
  const now = new Date().toLocaleDateString("en-GB",{day:"2-digit",month:"short",year:"numeric"});
  let html = `<!DOCTYPE html><html><head><meta charset="utf-8"><title>${title}</title>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=IBM+Plex+Sans:wght@300;400;600;700&family=IBM+Plex+Mono:wght@400;600&display=swap');
    *{margin:0;padding:0;box-sizing:border-box}
    body{font-family:'IBM Plex Sans',sans-serif;background:#fff;color:#1a2332;font-size:11px}
    .cover{background:linear-gradient(135deg,#0a1628 0%,#0f2a50 60%,#153d6e 100%);color:#fff;padding:50px;position:relative;overflow:hidden}
    .cover::before{content:'';position:absolute;right:-60px;top:-60px;width:300px;height:300px;border:2px solid rgba(56,189,248,0.15);border-radius:50%}
    .cover-label{font-family:'IBM Plex Mono',monospace;font-size:9px;letter-spacing:0.2em;color:#38bdf8;text-transform:uppercase;margin-bottom:10px}
    .cover-title{font-size:24px;font-weight:700;line-height:1.2;margin-bottom:8px}
    .cover-sub{font-size:12px;color:#94a3b8;margin-bottom:16px}
    .cover-meta{display:flex;gap:40px;margin-top:16px}
    .cover-meta-item label{font-size:9px;color:#64748b;letter-spacing:0.1em;text-transform:uppercase;display:block}
    .cover-meta-item span{font-family:'IBM Plex Mono',monospace;font-size:11px;color:#e2e8f0}
    .body{padding:28px 36px}
    .section{margin-bottom:24px;page-break-inside:avoid}
    .section-title{font-size:12px;font-weight:700;color:#0f2a50;text-transform:uppercase;letter-spacing:0.08em;padding-bottom:7px;border-bottom:2px solid #0ea5e9;margin-bottom:12px}
    .kpi-grid{display:grid;grid-template-columns:repeat(4,1fr);gap:10px;margin-bottom:4px}
    .kpi{background:#f0f7ff;border:1px solid #bfdbfe;border-radius:6px;padding:10px}
    .kpi-val{font-family:'IBM Plex Mono',monospace;font-size:20px;font-weight:700;color:#0ea5e9;line-height:1}
    .kpi-label{font-size:9px;color:#64748b;text-transform:uppercase;letter-spacing:0.08em;margin-top:4px}
    table{width:100%;border-collapse:collapse;font-size:10px}
    th{background:#0f2a50;color:#fff;padding:6px 9px;text-align:left;font-weight:600;font-size:9px;letter-spacing:0.06em;text-transform:uppercase}
    td{padding:5px 9px;border-bottom:1px solid #e2e8f0}
    tr:nth-child(even) td{background:#f8fafc}
    .bar-row{display:flex;align-items:center;gap:6px}
    .bar-bg{flex:1;height:5px;background:#e2e8f0;border-radius:3px;overflow:hidden}
    .bar-fill{height:100%;border-radius:3px;background:linear-gradient(90deg,#0ea5e9,#38bdf8)}
    .footer{background:#f8fafc;border-top:1px solid #e2e8f0;padding:10px 36px;display:flex;justify-content:space-between;font-size:9px;color:#94a3b8}
    @media print{body{-webkit-print-color-adjust:exact;print-color-adjust:exact}}
  </style></head><body>
  <div class="cover">
    <div class="cover-label">Engineering Center Egypt · ERP System</div>
    <div class="cover-title">${title}</div>
    <div class="cover-sub">${subtitle}</div>
    <div class="cover-meta">
      <div class="cover-meta-item"><label>Generated</label><span>${now}</span></div>
      <div class="cover-meta-item"><label>System</label><span>EC-ERP v2.0</span></div>
      <div class="cover-meta-item"><label>Confidential</label><span>Management Use Only</span></div>
    </div>
  </div>
  <div class="body">`;
  sections.forEach(s=>{ html += s; });
  html += `</div>
  <div class="footer">
    <span>Engineering Center Egypt · Industrial & Renewable Energy Automation</span>
    <span>CONFIDENTIAL — ${now}</span>
  </div>
  <script>window.onload=()=>window.print()<\/script>
  </body></html>`;
  win.document.write(html); win.document.close();
}

/* ════════════════════════════════════════
   MAIN APP
════════════════════════════════════════ */
export default function App() {
  /* auth */
  const [session, setSession]     = useState(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [email, setEmail]         = useState("");
  const [password, setPassword]   = useState("");
  const [authErr, setAuthErr]     = useState("");
  const [authMode, setAuthMode]   = useState("login"); // login | signup

  /* data */
  const [engineers, setEngineers] = useState([]);
  const [projects,  setProjects]  = useState([]);
  const [entries,   setEntries]   = useState([]);
  const [loading,   setLoading]   = useState(false);
  const [myProfile, setMyProfile] = useState(null);

  /* UI state */
  const [view,       setView]       = useState("dashboard");
  const [selEngId,   setSelEngId]   = useState(null);
  const [weekOf,     setWeekOf]     = useState(fmt(today));
  const [month,      setMonth]      = useState(today.getMonth());
  const [year,       setYear]       = useState(today.getFullYear());
  const [toast,      setToast]      = useState(null);
  const [modalDate,  setModalDate]  = useState(null);
  const [activeRpt,  setActiveRpt]  = useState("utilization");
  const [showProjModal, setShowProjModal] = useState(false);
  const [newEntry,   setNewEntry]   = useState({projectId:"",taskCategory:"Engineering",taskType:"Basic Engineering",hours:8,activity:"",type:"work",leaveType:LEAVE_TYPES[0]});
  const [newProj,    setNewProj]    = useState({id:"",name:"",type:"Renewable Energy",client:"",origin:"Romania HQ",phase:"Design",billable:true,ratePerHour:85,status:"Active"});

  const showToast = (msg,ok=true)=>{setToast({msg,ok});setTimeout(()=>setToast(null),3500);};
  const weekDays = useMemo(()=>getWeekDays(weekOf),[weekOf]);
  const isAdmin  = myProfile?.role === "admin";
  const selEng   = engineers.find(e=>e.id===selEngId) || engineers[0];

  /* ── Auth ── */
  useEffect(()=>{
    supabase.auth.getSession().then(({data:{session}})=>{
      setSession(session); setAuthLoading(false);
    });
    const {data:{subscription}} = supabase.auth.onAuthStateChange((_,session)=>setSession(session));
    return ()=>subscription.unsubscribe();
  },[]);

  useEffect(()=>{
    if(session) { loadAll(); }
  },[session]);

  async function loadAll() {
    setLoading(true);
    try {
      const [engsRes, projRes, entriesRes, profileRes] = await Promise.all([
        supabase.from("engineers").select("*").order("name"),
        supabase.from("projects").select("*").order("id"),
        supabase.from("time_entries").select("*").order("date",{ascending:false}),
        supabase.from("engineers").select("*").eq("user_id", session.user.id).single(),
      ]);
      if(engsRes.data)    setEngineers(engsRes.data);
      if(projRes.data)    setProjects(projRes.data);
      if(entriesRes.data) setEntries(entriesRes.data);
      if(profileRes.data) { setMyProfile(profileRes.data); setSelEngId(profileRes.data.id); }
      else if(engsRes.data?.[0]) setSelEngId(engsRes.data[0].id);
    } catch(e){ showToast("Error loading data",false); }
    setLoading(false);
  }

  async function handleLogin(e) {
    e.preventDefault(); setAuthErr("");
    const {error} = await supabase.auth.signInWithPassword({email,password});
    if(error) setAuthErr(error.message);
  }
  async function handleSignup(e) {
    e.preventDefault(); setAuthErr("");
    const {error} = await supabase.auth.signUp({email,password});
    if(error) setAuthErr(error.message);
    else setAuthErr("✓ Check your email to confirm your account, then log in.");
  }
  async function handleLogout() {
    await supabase.auth.signOut();
    setSession(null); setEngineers([]); setProjects([]); setEntries([]); setMyProfile(null);
  }

  /* ── CRUD ── */
  async function addEntry(date) {
    const proj = projects.find(p=>p.id===newEntry.projectId);
    const payload = {
      engineer_id: selEngId,
      project_id:  newEntry.type==="leave" ? null : newEntry.projectId,
      date,
      task_category: newEntry.type==="leave" ? null : newEntry.taskCategory,
      task_type:     newEntry.type==="leave" ? null : newEntry.taskType,
      hours:         newEntry.type==="leave" ? 8 : +newEntry.hours,
      activity:      newEntry.activity,
      entry_type:    newEntry.type,
      leave_type:    newEntry.type==="leave" ? newEntry.leaveType : null,
      billable:      newEntry.type==="leave" ? false : (proj?.billable||false),
    };
    const {data,error} = await supabase.from("time_entries").insert(payload).select().single();
    if(error){ showToast("Error: "+error.message,false); return; }
    setEntries(prev=>[data,...prev]);
    setModalDate(null); showToast("Hours posted ✓");
  }

  async function deleteEntry(id) {
    const {error} = await supabase.from("time_entries").delete().eq("id",id);
    if(error){ showToast("Error deleting",false); return; }
    setEntries(prev=>prev.filter(e=>e.id!==id));
    showToast("Entry removed",false);
  }

  async function addProject() {
    const {data,error} = await supabase.from("projects").insert(newProj).select().single();
    if(error){ showToast("Error: "+error.message,false); return; }
    setProjects(prev=>[...prev,data].sort((a,b)=>a.id.localeCompare(b.id)));
    setShowProjModal(false);
    setNewProj({id:"",name:"",type:"Renewable Energy",client:"",origin:"Romania HQ",phase:"Design",billable:true,ratePerHour:85,status:"Active"});
    showToast("Project created ✓");
  }

  /* ── Derived stats ── */
  const monthEntries = useMemo(()=>entries.filter(e=>{
    const d=new Date(e.date); return d.getFullYear()===year && d.getMonth()===month;
  }),[entries,year,month]);

  const workEntries  = monthEntries.filter(e=>e.entry_type==="work");
  const leaveEntries = monthEntries.filter(e=>e.entry_type==="leave");
  const totalWorkHrs = workEntries.reduce((s,e)=>s+e.hours,0);
  const totalBillable= workEntries.filter(e=>e.billable).reduce((s,e)=>s+e.hours,0);
  const totalRevenue = workEntries.filter(e=>e.billable).reduce((s,e)=>{
    const p=projects.find(x=>x.id===e.project_id); return s+(p?p.rate_per_hour*e.hours:0);},0);
  const billabilityPct = totalWorkHrs ? Math.round(totalBillable/totalWorkHrs*100):0;
  const overallUtil    = engineers.length ? Math.min(100,Math.round(totalWorkHrs/(engineers.length*TARGET_HRS)*100)):0;

  const engStats = useMemo(()=>engineers.map(eng=>{
    const we=monthEntries.filter(e=>e.engineer_id===eng.id);
    const wh=we.filter(e=>e.entry_type==="work").reduce((s,e)=>s+e.hours,0);
    const bh=we.filter(e=>e.entry_type==="work"&&e.billable).reduce((s,e)=>s+e.hours,0);
    const ld=we.filter(e=>e.entry_type==="leave").length;
    const rev=we.filter(e=>e.entry_type==="work"&&e.billable).reduce((s,e)=>{
      const p=projects.find(x=>x.id===e.project_id); return s+(p?p.rate_per_hour*e.hours:0);},0);
    return{...eng,workHrs:wh,billableHrs:bh,leaveDays:ld,revenue:rev,
      utilization:Math.min(100,Math.round(wh/TARGET_HRS*100)),
      billability:wh?Math.round(bh/wh*100):0};
  }),[engineers,monthEntries,projects]);

  const projStats = useMemo(()=>projects.map(p=>{
    const pe=monthEntries.filter(e=>e.project_id===p.id);
    const hrs=pe.reduce((s,e)=>s+e.hours,0);
    const rev=pe.reduce((s,e)=>s+(p.billable?p.rate_per_hour*e.hours:0),0);
    return{...p,hours:hrs,revenue:rev,engCount:[...new Set(pe.map(e=>e.engineer_id))].length};
  }),[projects,monthEntries]);

  const taskStats = useMemo(()=>{
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

  /* ── PDF builders ── */
  const buildUtilizationPDF = ()=>{
    const rows=engStats.map(e=>`<tr>
      <td><strong>${e.name}</strong><br><span style="color:#64748b;font-size:9px">${e.role||""}</span></td>
      <td>${e.level||""}</td>
      <td style="font-family:'IBM Plex Mono',monospace">${e.workHrs}h</td>
      <td style="font-family:'IBM Plex Mono',monospace">${e.billableHrs}h</td>
      <td>${e.leaveDays}d</td>
      <td><div class="bar-row"><div class="bar-bg"><div class="bar-fill" style="width:${e.utilization}%"></div></div><span>${fmtPct(e.utilization)}</span></div></td>
      <td><div class="bar-row"><div class="bar-bg"><div class="bar-fill" style="width:${e.billability}%;background:linear-gradient(90deg,#10b981,#34d399)"></div></div><span>${fmtPct(e.billability)}</span></div></td>
      <td style="font-family:'IBM Plex Mono',monospace;color:#0ea5e9">${fmtCurrency(e.revenue)}</td>
    </tr>`).join("");
    generatePDF(`Team Utilization & Billability — ${MONTHS[month]} ${year}`,[
      `<div class="section"><div class="section-title">Executive KPIs</div>
      <div class="kpi-grid">
        <div class="kpi"><div class="kpi-val">${fmtPct(overallUtil)}</div><div class="kpi-label">Overall Utilization</div></div>
        <div class="kpi"><div class="kpi-val">${fmtPct(billabilityPct)}</div><div class="kpi-label">Billability Rate</div></div>
        <div class="kpi"><div class="kpi-val">${totalWorkHrs}h</div><div class="kpi-label">Total Work Hours</div></div>
        <div class="kpi"><div class="kpi-val">${fmtCurrency(totalRevenue)}</div><div class="kpi-label">Revenue Billed</div></div>
      </div></div>`,
      `<div class="section"><div class="section-title">Individual Breakdown</div>
      <table><thead><tr><th>Engineer</th><th>Level</th><th>Work Hrs</th><th>Billable Hrs</th><th>Leave</th><th>Utilization</th><th>Billability</th><th>Revenue</th></tr></thead>
      <tbody>${rows}</tbody></table></div>`
    ]);
  };

  const buildBillablePDF = ()=>{
    const rows=projStats.filter(p=>p.billable&&p.hours>0).map(p=>`<tr>
      <td style="font-family:'IBM Plex Mono',monospace;color:#0ea5e9;font-size:9px">${p.id}</td>
      <td><strong>${p.name}</strong></td><td>${p.client||""}</td>
      <td style="font-family:'IBM Plex Mono',monospace">$${p.rate_per_hour}</td>
      <td style="font-family:'IBM Plex Mono',monospace">${p.hours}h</td>
      <td style="font-family:'IBM Plex Mono',monospace;color:#0ea5e9;font-weight:700">${fmtCurrency(p.revenue)}</td>
    </tr>`).join("");
    generatePDF(`Billable Hours & Revenue — ${MONTHS[month]} ${year}`,[
      `<div class="section"><div class="section-title">Summary</div>
      <div class="kpi-grid">
        <div class="kpi"><div class="kpi-val">${fmtCurrency(totalRevenue)}</div><div class="kpi-label">Total Revenue</div></div>
        <div class="kpi"><div class="kpi-val">${totalBillable}h</div><div class="kpi-label">Billable Hours</div></div>
        <div class="kpi"><div class="kpi-val">${projStats.filter(p=>p.billable&&p.hours>0).length}</div><div class="kpi-label">Active Billable Projects</div></div>
        <div class="kpi"><div class="kpi-val">${fmtPct(billabilityPct)}</div><div class="kpi-label">Billability Rate</div></div>
      </div></div>`,
      `<div class="section"><div class="section-title">Billable Projects Detail</div>
      <table><thead><tr><th>Project No.</th><th>Project Name</th><th>Client</th><th>Rate/hr</th><th>Hours</th><th>Revenue</th></tr></thead>
      <tbody>${rows}</tbody></table></div>`
    ],"For Finance & Senior Management");
  };

  const buildTaskPDF = ()=>{
    const catRows=taskStats.map(cat=>{
      const pct=totalWorkHrs?Math.round(cat.hours/totalWorkHrs*100):0;
      return`<tr><td><strong>${cat.category}</strong></td>
      <td style="font-family:'IBM Plex Mono',monospace">${cat.hours}h</td>
      <td style="font-family:'IBM Plex Mono',monospace">${cat.billable}h</td>
      <td><div class="bar-row"><div class="bar-bg"><div class="bar-fill" style="width:${pct}%"></div></div><span>${pct}%</span></div></td>
      <td>${Object.keys(cat.tasks).join(", ")}</td></tr>`;
    }).join("");
    const actRows=entries.filter(e=>e.entry_type==="work"&&e.activity&&new Date(e.date).getMonth()===month).slice(0,25).map(e=>{
      const eng=engineers.find(x=>x.id===e.engineer_id);
      const proj=projects.find(x=>x.id===e.project_id);
      return`<tr><td style="font-family:'IBM Plex Mono',monospace;font-size:9px">${e.date}</td>
      <td>${eng?.name||""}</td><td style="font-size:9px;color:#0ea5e9">${proj?.id||""}</td>
      <td style="font-size:9px">${e.task_type||""}</td><td style="font-style:italic">${e.activity||""}</td>
      <td style="font-family:'IBM Plex Mono',monospace">${e.hours}h</td></tr>`;
    }).join("");
    generatePDF(`Task Analysis Report — ${MONTHS[month]} ${year}`,[
      `<div class="section"><div class="section-title">Task Category Breakdown</div>
      <table><thead><tr><th>Category</th><th>Total Hrs</th><th>Billable Hrs</th><th>Share</th><th>Tasks Performed</th></tr></thead>
      <tbody>${catRows}</tbody></table></div>`,
      `<div class="section"><div class="section-title">Activity Log</div>
      <table><thead><tr><th>Date</th><th>Engineer</th><th>Project</th><th>Task</th><th>Activity Description</th><th>Hrs</th></tr></thead>
      <tbody>${actRows}</tbody></table></div>`
    ]);
  };

  const buildMonthlyPDF = ()=>{
    generatePDF(`Monthly Management Report — ${MONTHS[month]} ${year}`,[
      `<div class="section"><div class="section-title">Executive Summary — ${MONTHS[month]} ${year}</div>
      <div class="kpi-grid">
        <div class="kpi"><div class="kpi-val">${fmtPct(overallUtil)}</div><div class="kpi-label">Team Utilization</div></div>
        <div class="kpi"><div class="kpi-val">${fmtPct(billabilityPct)}</div><div class="kpi-label">Billability</div></div>
        <div class="kpi"><div class="kpi-val">${fmtCurrency(totalRevenue)}</div><div class="kpi-label">Revenue</div></div>
        <div class="kpi"><div class="kpi-val">${leaveEntries.length}</div><div class="kpi-label">Absence Days</div></div>
      </div></div>`,
      `<div class="section"><div class="section-title">Engineer Performance</div>
      <table><thead><tr><th>Engineer</th><th>Utilization</th><th>Billability</th><th>Work Hrs</th><th>Revenue</th><th>Leave</th></tr></thead>
      <tbody>${engStats.map(e=>`<tr><td><strong>${e.name}</strong><br><span style="font-size:9px;color:#64748b">${e.role||""}</span></td>
        <td>${fmtPct(e.utilization)}</td><td>${fmtPct(e.billability)}</td>
        <td style="font-family:'IBM Plex Mono',monospace">${e.workHrs}h</td>
        <td style="font-family:'IBM Plex Mono',monospace;color:#0ea5e9">${fmtCurrency(e.revenue)}</td>
        <td>${e.leaveDays}d</td></tr>`).join("")}</tbody></table></div>`,
      `<div class="section"><div class="section-title">Project Status</div>
      <table><thead><tr><th>Project No.</th><th>Project</th><th>Phase</th><th>Hours</th><th>Billing</th><th>Revenue</th></tr></thead>
      <tbody>${projStats.filter(p=>p.hours>0).map(p=>`<tr>
        <td style="font-family:'IBM Plex Mono',monospace;font-size:9px;color:#0ea5e9">${p.id}</td>
        <td>${p.name}</td><td>${p.phase||""}</td>
        <td style="font-family:'IBM Plex Mono',monospace">${p.hours}h</td>
        <td>${p.billable?"Billable":"Non-Bill."}</td>
        <td style="font-family:'IBM Plex Mono',monospace">${p.billable?fmtCurrency(p.revenue):"—"}</td>
      </tr>`).join("")}</tbody></table></div>`
    ],"Prepared for Senior Management · Confidential");
  };

  /* ── LOADING / AUTH SCREENS ── */
  if(authLoading) return (
    <div style={{display:"flex",alignItems:"center",justifyContent:"center",minHeight:"100vh",background:"#080d1a",fontFamily:"'IBM Plex Mono',monospace",color:"#38bdf8",fontSize:14}}>
      Loading EC-ERP…
    </div>
  );

  if(!session) return (
    <div style={{minHeight:"100vh",background:"#080d1a",display:"flex",alignItems:"center",justifyContent:"center",fontFamily:"'IBM Plex Sans',sans-serif"}}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=IBM+Plex+Sans:wght@400;600;700&family=IBM+Plex+Mono:wght@400;600&display=swap');*{box-sizing:border-box;margin:0;padding:0}input{background:#060e1c;border:1px solid #192d47;color:#dde3ef;padding:10px 14px;border-radius:7px;font-family:'IBM Plex Sans',sans-serif;font-size:14px;outline:none;width:100%;transition:border-color .2s}input:focus{border-color:#38bdf8}`}</style>
      <div style={{background:"#0b1526",border:"1px solid #192d47",borderRadius:14,padding:"40px 36px",width:380,boxShadow:"0 24px 60px #00000080"}}>
        <div style={{textAlign:"center",marginBottom:28}}>
          <div style={{fontFamily:"'IBM Plex Mono',monospace",fontSize:10,color:"#38bdf8",letterSpacing:".18em",marginBottom:8}}>ENGINEERING CENTER EGYPT</div>
          <div style={{fontSize:22,fontWeight:700,color:"#f0f6ff"}}>EC-ERP System</div>
          <div style={{fontSize:12,color:"#2e4a66",marginTop:4}}>Industrial & Renewable Energy Automation</div>
        </div>
        {authErr && <div style={{background:authErr.startsWith("✓")?"#022c22":"#450a0a",color:authErr.startsWith("✓")?"#34d399":"#f87171",border:`1px solid ${authErr.startsWith("✓")?"#34d399":"#f87171"}`,borderRadius:6,padding:"9px 12px",fontSize:12,marginBottom:16}}>{authErr}</div>}
        <form onSubmit={authMode==="login"?handleLogin:handleSignup} style={{display:"grid",gap:12}}>
          <div><div style={{fontSize:11,color:"#4e6479",marginBottom:5}}>Email Address</div>
            <input type="email" value={email} onChange={e=>setEmail(e.target.value)} placeholder="you@company.com" required/></div>
          <div><div style={{fontSize:11,color:"#4e6479",marginBottom:5}}>Password</div>
            <input type="password" value={password} onChange={e=>setPassword(e.target.value)} placeholder="••••••••" required/></div>
          <button type="submit" style={{background:"linear-gradient(135deg,#0ea5e9,#0369a1)",border:"none",color:"#fff",padding:"11px",borderRadius:7,cursor:"pointer",fontFamily:"'IBM Plex Sans',sans-serif",fontSize:14,fontWeight:700,marginTop:4}}>
            {authMode==="login"?"Sign In":"Create Account"}
          </button>
        </form>
        <div style={{textAlign:"center",marginTop:16,fontSize:12,color:"#2e4a66"}}>
          {authMode==="login"?"Don't have an account? ":"Already have an account? "}
          <span style={{color:"#38bdf8",cursor:"pointer"}} onClick={()=>{setAuthMode(authMode==="login"?"signup":"login");setAuthErr("");}}>
            {authMode==="login"?"Sign Up":"Sign In"}
          </span>
        </div>
      </div>
    </div>
  );

  /* ── MAIN RENDER ── */
  return (
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
        .bd{background:transparent;border:1px solid #7f1d1d;color:#f87171;padding:3px 8px;border-radius:4px;cursor:pointer;font-size:10px;font-family:'IBM Plex Sans',sans-serif}
        .bd:hover{background:#7f1d1d30}
        input,select,textarea{background:#060e1c;border:1px solid #192d47;color:#dde3ef;padding:8px 12px;border-radius:6px;font-family:'IBM Plex Sans',sans-serif;font-size:13px;outline:none;width:100%;transition:border-color .2s}
        input:focus,select:focus,textarea:focus{border-color:#38bdf8}
        select option{background:#060e1c}
        .tag{display:inline-block;padding:2px 7px;border-radius:3px;font-size:10px;font-weight:700;font-family:'IBM Plex Mono',monospace}
        table{width:100%;border-collapse:collapse}
        th{color:#4e6479;font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:.05em;padding:9px 12px;border-bottom:1px solid #192d47;text-align:left}
        td{padding:9px 12px;border-bottom:1px solid #0d1a2d;font-size:12px}
        tr:hover td{background:#0d1a2d}
        .av{width:32px;height:32px;border-radius:50%;background:linear-gradient(135deg,#0ea5e9,#0369a1);display:flex;align-items:center;justify-content:center;font-size:10px;font-weight:700;color:#fff;flex-shrink:0}
        .bar{height:6px;border-radius:3px;background:linear-gradient(90deg,#0ea5e9,#38bdf8)}
        .modal-ov{position:fixed;inset:0;background:#00000099;backdrop-filter:blur(6px);z-index:100;display:flex;align-items:center;justify-content:center}
        .modal{background:#0b1526;border:1px solid #192d47;border-radius:12px;padding:26px;width:500px;max-width:95vw;max-height:90vh;overflow-y:auto}
        .toast{position:fixed;bottom:28px;right:28px;padding:11px 18px;border-radius:8px;font-size:12px;font-weight:700;z-index:200;animation:su .3s ease}
        @keyframes su{from{transform:translateY(12px);opacity:0}to{transform:translateY(0);opacity:1}}
        .metric{background:linear-gradient(135deg,#0b1526,#0d1e34);border:1px solid #192d47;border-radius:10px;padding:16px}
        .wc{background:#060e1c;border:1px solid #152639;border-radius:8px;min-height:130px;padding:10px}
        .rpt-card{background:#0b1526;border:1px solid #192d47;border-radius:8px;padding:14px;cursor:pointer;transition:all .2s}
        .rpt-card:hover,.rpt-card.sel{border-color:#38bdf8;background:#0d1e34}
        label{font-size:11px;color:#4e6479;display:block;margin-bottom:4px}
      `}</style>

      <div style={{display:"flex"}}>
        {/* ── Sidebar ── */}
        <div style={{width:215,background:"#060c18",borderRight:"1px solid #192d47",minHeight:"100vh",padding:"20px 10px",position:"fixed",top:0,left:0,bottom:0,overflowY:"auto"}}>
          <div style={{marginBottom:22,paddingLeft:6}}>
            <div style={{fontFamily:"'IBM Plex Mono',monospace",fontSize:9,color:"#38bdf8",letterSpacing:".18em",fontWeight:600}}>ENGINEERING CENTER</div>
            <div style={{fontSize:17,fontWeight:700,color:"#f0f6ff",marginTop:3}}>ERP System</div>
            <div style={{fontSize:10,color:"#2e4a66",marginTop:2,fontFamily:"'IBM Plex Mono',monospace"}}>Cairo, Egypt</div>
          </div>

          {[{id:"dashboard",icon:"▦",label:"Dashboard"},{id:"timesheet",icon:"⏱",label:"Post Hours"},{id:"projects",icon:"◈",label:"Projects"},{id:"team",icon:"◉",label:"Team"},{id:"reports",icon:"⊞",label:"Reports & PDF"},].map(n=>(
            <button key={n.id} className={`nb ${view===n.id?"a":""}`} onClick={()=>setView(n.id)}>
              <span style={{fontFamily:"'IBM Plex Mono',monospace",fontSize:14}}>{n.icon}</span>{n.label}
            </button>
          ))}

          <div style={{marginTop:16,borderTop:"1px solid #192d47",paddingTop:14,paddingLeft:6,paddingRight:6}}>
            <div style={{fontSize:9,color:"#253a52",fontWeight:700,letterSpacing:".1em",marginBottom:8}}>PERIOD</div>
            <div style={{marginBottom:8}}><label>Month</label>
              <select value={month} onChange={e=>setMonth(+e.target.value)} style={{fontSize:11,padding:"5px 8px"}}>
                {MONTHS.map((m,i)=><option key={i} value={i}>{m}</option>)}
              </select>
            </div>
            <div><label>Year</label>
              <select value={year} onChange={e=>setYear(+e.target.value)} style={{fontSize:11,padding:"5px 8px"}}>
                {[year-1,year,year+1].map(y=><option key={y}>{y}</option>)}
              </select>
            </div>
          </div>

          <div style={{position:"absolute",bottom:16,left:10,right:10}}>
            <div style={{background:"#0b1526",border:"1px solid #192d47",borderRadius:8,padding:"9px 10px"}}>
              <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:8}}>
                <div className="av" style={{width:26,height:26,fontSize:8}}>{myProfile?.name?.slice(0,2).toUpperCase()||"?"}</div>
                <div><div style={{fontSize:11,fontWeight:600}}>{myProfile?.name||session.user.email}</div>
                <div style={{fontSize:9,color:"#2e4a66"}}>{myProfile?.role==="admin"?"Admin":"Engineer"}</div></div>
              </div>
              <button onClick={handleLogout} style={{width:"100%",background:"transparent",border:"1px solid #192d47",color:"#4e6479",padding:"5px",borderRadius:5,cursor:"pointer",fontSize:11,fontFamily:"'IBM Plex Sans',sans-serif"}}>Sign Out</button>
            </div>
          </div>
        </div>

        {/* ── Main Content ── */}
        <div style={{marginLeft:215,flex:1,padding:"24px 28px",maxWidth:"calc(100vw - 215px)"}}>
          {loading && <div style={{textAlign:"center",padding:60,color:"#2e4a66",fontFamily:"'IBM Plex Mono',monospace"}}>Loading data…</div>}

          {!loading && <>
          {/* ════ DASHBOARD ════ */}
          {view==="dashboard"&&(
            <div>
              <div style={{marginBottom:22}}>
                <h1 style={{fontSize:21,fontWeight:700,color:"#f0f6ff"}}>Dashboard</h1>
                <p style={{color:"#2e4a66",fontSize:12,marginTop:3,fontFamily:"'IBM Plex Mono',monospace"}}>{MONTHS[month]} {year} · Live Overview</p>
              </div>
              <div style={{display:"grid",gridTemplateColumns:"repeat(5,1fr)",gap:11,marginBottom:20}}>
                {[
                  {l:"Team Utilization",v:fmtPct(overallUtil),c:"#38bdf8"},
                  {l:"Billability Rate", v:fmtPct(billabilityPct),c:"#34d399"},
                  {l:"Revenue Billed",   v:fmtCurrency(totalRevenue),c:"#a78bfa"},
                  {l:"Active Projects",  v:projects.filter(p=>p.status==="Active").length,c:"#fb923c"},
                  {l:"Absence Days",     v:leaveEntries.length,c:"#f472b6"},
                ].map((m,i)=>(
                  <div key={i} className="metric">
                    <div style={{fontSize:9,color:"#2e4a66",fontWeight:700,textTransform:"uppercase",letterSpacing:".06em"}}>{m.l}</div>
                    <div style={{fontFamily:"'IBM Plex Mono',monospace",fontSize:24,fontWeight:700,color:m.c,marginTop:8,lineHeight:1}}>{m.v}</div>
                  </div>
                ))}
              </div>

              <div style={{display:"grid",gridTemplateColumns:"1.5fr 1fr",gap:14,marginBottom:14}}>
                <div className="card">
                  <h3 style={{fontSize:12,fontWeight:600,color:"#7a8faa",marginBottom:12}}>Engineer Utilization</h3>
                  {engStats.length===0&&<p style={{color:"#253a52",fontSize:12}}>No data yet for this month.</p>}
                  {engStats.map(eng=>(
                    <div key={eng.id} style={{display:"flex",alignItems:"center",gap:8,marginBottom:8}}>
                      <div className="av" style={{fontSize:9,width:26,height:26}}>{eng.name?.slice(0,2).toUpperCase()}</div>
                      <div style={{flex:1,minWidth:0}}>
                        <div style={{display:"flex",justifyContent:"space-between",marginBottom:3}}>
                          <span style={{fontSize:11,fontWeight:500}}>{eng.name}</span>
                          <span style={{fontFamily:"'IBM Plex Mono',monospace",fontSize:10,color:"#38bdf8"}}>{eng.workHrs}h · {fmtPct(eng.utilization)}</span>
                        </div>
                        <div style={{background:"#060e1c",height:4,borderRadius:3,overflow:"hidden"}}>
                          <div style={{height:"100%",width:`${eng.utilization}%`,background:eng.utilization>=80?"linear-gradient(90deg,#34d399,#10b981)":eng.utilization>=60?"linear-gradient(90deg,#fb923c,#f59e0b)":"linear-gradient(90deg,#f87171,#ef4444)",borderRadius:3}}/>
                        </div>
                      </div>
                      <span style={{fontFamily:"'IBM Plex Mono',monospace",fontSize:9,color:"#a78bfa",width:32,textAlign:"right"}}>{fmtPct(eng.billability)}</span>
                    </div>
                  ))}
                </div>
                <div className="card">
                  <h3 style={{fontSize:12,fontWeight:600,color:"#7a8faa",marginBottom:12}}>Task Distribution</h3>
                  {taskStats.length===0&&<p style={{color:"#253a52",fontSize:12}}>No tasks logged yet.</p>}
                  {taskStats.map(cat=>{
                    const pct=totalWorkHrs?Math.round(cat.hours/totalWorkHrs*100):0;
                    return(<div key={cat.category} style={{marginBottom:9}}>
                      <div style={{display:"flex",justifyContent:"space-between",marginBottom:2}}>
                        <span style={{fontSize:11}}>{cat.category}</span>
                        <span style={{fontFamily:"'IBM Plex Mono',monospace",fontSize:10,color:"#38bdf8"}}>{cat.hours}h · {pct}%</span>
                      </div>
                      <div style={{background:"#060e1c",height:4,borderRadius:3,overflow:"hidden"}}>
                        <div className="bar" style={{width:`${pct}%`}}/>
                      </div>
                    </div>);
                  })}
                </div>
              </div>

              <div className="card">
                <h3 style={{fontSize:12,fontWeight:600,color:"#7a8faa",marginBottom:12}}>Projects</h3>
                <table>
                  <thead><tr><th>Project No.</th><th>Name</th><th>Phase</th><th>Hours</th><th>Billing</th><th>Revenue</th></tr></thead>
                  <tbody>{projStats.filter(p=>p.hours>0).map(p=>(
                    <tr key={p.id}>
                      <td style={{fontFamily:"'IBM Plex Mono',monospace",fontSize:11,color:"#38bdf8"}}>{p.id}</td>
                      <td style={{fontSize:11}}>{p.name}</td>
                      <td style={{color:"#7a8faa",fontSize:11}}>{p.phase}</td>
                      <td style={{fontFamily:"'IBM Plex Mono',monospace"}}>{p.hours}h</td>
                      <td><span style={{fontSize:9,padding:"2px 6px",borderRadius:3,background:p.billable?"#0c2b4e":"#1a0a00",color:p.billable?"#38bdf8":"#fb923c",fontFamily:"'IBM Plex Mono',monospace",fontWeight:700}}>{p.billable?"BILLABLE":"NON-BILL"}</span></td>
                      <td style={{fontFamily:"'IBM Plex Mono',monospace",color:"#a78bfa"}}>{p.billable?fmtCurrency(p.revenue):"—"}</td>
                    </tr>
                  ))}</tbody>
                </table>
              </div>
            </div>
          )}

          {/* ════ TIMESHEET ════ */}
          {view==="timesheet"&&(
            <div>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-end",marginBottom:18}}>
                <div>
                  <h1 style={{fontSize:21,fontWeight:700,color:"#f0f6ff"}}>Post Hours</h1>
                  <p style={{color:"#2e4a66",fontSize:12,marginTop:3}}>Weekly Timesheet</p>
                </div>
                <div style={{display:"flex",gap:12,alignItems:"flex-end"}}>
                  {isAdmin&&<div><label>Engineer</label>
                    <select style={{width:185}} value={selEngId||""} onChange={e=>setSelEngId(+e.target.value)}>
                      {engineers.map(eng=><option key={eng.id} value={eng.id}>{eng.name}</option>)}
                    </select>
                  </div>}
                  <div><label>Week of</label>
                    <input type="date" style={{width:150}} value={weekOf} onChange={e=>setWeekOf(e.target.value)}/>
                  </div>
                </div>
              </div>

              {selEng&&<div style={{display:"flex",alignItems:"center",gap:14,marginBottom:18,background:"#0b1526",border:"1px solid #192d47",borderRadius:10,padding:"12px 16px"}}>
                <div className="av" style={{width:40,height:40,fontSize:13}}>{selEng.name?.slice(0,2).toUpperCase()}</div>
                <div>
                  <div style={{fontSize:14,fontWeight:600}}>{selEng.name}</div>
                  <div style={{fontSize:11,color:"#2e4a66"}}>{selEng.role}</div>
                </div>
                <div style={{marginLeft:"auto",display:"flex",gap:20}}>
                  {[
                    {l:"Week Hrs",v:weekDays.reduce((s,d)=>s+entries.filter(e=>e.date===d&&e.engineer_id===selEngId).reduce((ss,e)=>ss+e.hours,0),0)+"h",c:"#38bdf8"},
                    {l:"Month Hrs",v:monthEntries.filter(e=>e.engineer_id===selEngId&&e.entry_type==="work").reduce((s,e)=>s+e.hours,0)+"h",c:"#34d399"},
                  ].map((s,i)=><div key={i} style={{textAlign:"center"}}>
                    <div style={{fontFamily:"'IBM Plex Mono',monospace",fontSize:17,fontWeight:700,color:s.c}}>{s.v}</div>
                    <div style={{fontSize:10,color:"#253a52"}}>{s.l}</div>
                  </div>)}
                </div>
              </div>}

              <div style={{display:"grid",gridTemplateColumns:"repeat(5,1fr)",gap:10}}>
                {weekDays.map(day=>{
                  const de=entries.filter(e=>e.date===day&&e.engineer_id===selEngId);
                  const dh=de.reduce((s,e)=>s+e.hours,0);
                  const lbl=new Date(day).toLocaleDateString("en-US",{weekday:"short",month:"short",day:"numeric"});
                  return(
                    <div key={day} className="wc" style={day===fmt(today)?{borderColor:"#0ea5e9"}:{}}>
                      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:7}}>
                        <div>
                          <div style={{fontSize:11,fontWeight:600,color:day===fmt(today)?"#38bdf8":"#7a8faa"}}>{lbl}</div>
                          {dh>0&&<div style={{fontFamily:"'IBM Plex Mono',monospace",fontSize:11,color:"#38bdf8"}}>{dh}h</div>}
                        </div>
                        <button className="bp" style={{padding:"3px 8px",fontSize:11}} onClick={()=>setModalDate(day)}>+</button>
                      </div>
                      {de.map(e=>{
                        const proj=projects.find(p=>p.id===e.project_id);
                        return(
                          <div key={e.id} style={{background:"#08111e",border:`1px solid ${e.billable?"#0c2b4e":"#152535"}`,borderRadius:5,padding:"6px 7px",marginBottom:4,fontSize:10}}>
                            <div style={{display:"flex",justifyContent:"space-between",gap:3}}>
                              <div style={{flex:1,minWidth:0}}>
                                {e.entry_type==="leave"
                                  ?<span style={{color:"#fb923c",fontWeight:600}}>✈ {e.leave_type}</span>
                                  :<>
                                    <span style={{fontFamily:"'IBM Plex Mono',monospace",color:"#0ea5e9",fontSize:9}}>{proj?.id}</span>
                                    <div style={{color:"#7a8faa",fontSize:9,marginTop:1}}>{e.task_type}</div>
                                    {e.activity&&<div style={{color:"#4e6479",fontSize:9,marginTop:1,fontStyle:"italic",lineHeight:1.3}}>{e.activity.substring(0,45)}{e.activity.length>45?"…":""}</div>}
                                  </>}
                              </div>
                              <button className="bd" onClick={()=>deleteEntry(e.id)}>✕</button>
                            </div>
                            <div style={{display:"flex",justifyContent:"space-between",marginTop:4}}>
                              <span style={{fontFamily:"'IBM Plex Mono',monospace",color:"#38bdf8",fontWeight:700,fontSize:12}}>{e.hours}h</span>
                              {e.billable&&<span style={{fontSize:8,color:"#34d399",fontWeight:700}}>BILLABLE</span>}
                            </div>
                          </div>
                        );
                      })}
                      {de.length===0&&<div style={{color:"#152639",fontSize:10,textAlign:"center",marginTop:22}}>No entries</div>}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* ════ PROJECTS ════ */}
          {view==="projects"&&(
            <div>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:20}}>
                <h1 style={{fontSize:21,fontWeight:700,color:"#f0f6ff"}}>Projects</h1>
                {isAdmin&&<button className="bp" onClick={()=>setShowProjModal(true)}>+ New Project</button>}
              </div>
              <div style={{display:"grid",gridTemplateColumns:"repeat(2,1fr)",gap:13}}>
                {projects.map(p=>{
                  const ps=projStats.find(x=>x.id===p.id);
                  const topTasks=Object.entries(
                    monthEntries.filter(e=>e.project_id===p.id).reduce((acc,e)=>{acc[e.task_type]=(acc[e.task_type]||0)+e.hours;return acc;},{})
                  ).sort((a,b)=>b[1]-a[1]).slice(0,3);
                  return(
                    <div key={p.id} className="card" style={{borderLeft:`3px solid ${p.type==="Renewable Energy"?"#34d399":"#818cf8"}`}}>
                      <div style={{display:"flex",justifyContent:"space-between",marginBottom:8}}>
                        <div>
                          <div style={{fontFamily:"'IBM Plex Mono',monospace",fontSize:11,color:"#38bdf8"}}>{p.id}</div>
                          <div style={{fontSize:13,fontWeight:600,marginTop:2,lineHeight:1.3}}>{p.name}</div>
                        </div>
                        <span style={{fontSize:9,padding:"2px 7px",borderRadius:3,fontFamily:"'IBM Plex Mono',monospace",fontWeight:700,background:p.status==="Active"?"#024b36":p.status==="On Hold"?"#7c2d1260":"#1e3a5f",color:p.status==="Active"?"#34d399":p.status==="On Hold"?"#fb923c":"#60a5fa",height:"fit-content"}}>{p.status}</span>
                      </div>
                      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:5,fontSize:11,marginBottom:10}}>
                        <div><span style={{color:"#2e4a66"}}>Client: </span>{p.client}</div>
                        <div><span style={{color:"#2e4a66"}}>Origin: </span>{p.origin}</div>
                        <div><span style={{color:"#2e4a66"}}>Phase: </span><span style={{color:"#60a5fa"}}>{p.phase}</span></div>
                        <div><span style={{color:"#2e4a66"}}>Rate: </span><span style={{fontFamily:"'IBM Plex Mono',monospace",color:p.billable?"#a78bfa":"#253a52"}}>{p.billable?`$${p.rate_per_hour}/h`:"Non-Billable"}</span></div>
                      </div>
                      {topTasks.length>0&&<div style={{background:"#060e1c",borderRadius:5,padding:"7px 9px",marginBottom:10}}>
                        {topTasks.map(([task,hrs])=>(
                          <div key={task} style={{display:"flex",justifyContent:"space-between",fontSize:10,marginBottom:2}}>
                            <span style={{color:"#7a8faa"}}>{task}</span>
                            <span style={{fontFamily:"'IBM Plex Mono',monospace",color:"#38bdf8"}}>{hrs}h</span>
                          </div>
                        ))}
                      </div>}
                      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",paddingTop:9,borderTop:"1px solid #192d47"}}>
                        <div>
                          <div style={{fontFamily:"'IBM Plex Mono',monospace",fontSize:18,fontWeight:700,color:"#38bdf8"}}>{ps?.hours||0}h</div>
                          {p.billable&&<div style={{fontSize:10,color:"#a78bfa"}}>{fmtCurrency(ps?.revenue||0)}</div>}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* ════ TEAM ════ */}
          {view==="team"&&(
            <div>
              <h1 style={{fontSize:21,fontWeight:700,color:"#f0f6ff",marginBottom:18}}>Team</h1>
              <div style={{display:"grid",gridTemplateColumns:"repeat(5,1fr)",gap:11}}>
                {engStats.map(eng=>(
                  <div key={eng.id} className="card" style={{textAlign:"center"}}>
                    <div className="av" style={{width:44,height:44,fontSize:13,margin:"0 auto 9px"}}>{eng.name?.slice(0,2).toUpperCase()}</div>
                    <div style={{fontSize:13,fontWeight:600}}>{eng.name}</div>
                    <div style={{fontSize:10,color:"#2e4a66",marginBottom:11}}>{eng.role}</div>
                    <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:5,marginBottom:7}}>
                      <div style={{background:"#060e1c",borderRadius:5,padding:"6px 4px"}}>
                        <div style={{fontFamily:"'IBM Plex Mono',monospace",fontSize:14,fontWeight:700,color:"#38bdf8"}}>{eng.workHrs}h</div>
                        <div style={{fontSize:9,color:"#253a52"}}>work hrs</div>
                      </div>
                      <div style={{background:"#060e1c",borderRadius:5,padding:"6px 4px"}}>
                        <div style={{fontFamily:"'IBM Plex Mono',monospace",fontSize:14,fontWeight:700,color:eng.utilization>=80?"#34d399":eng.utilization>=60?"#fb923c":"#f87171"}}>{fmtPct(eng.utilization)}</div>
                        <div style={{fontSize:9,color:"#253a52"}}>util.</div>
                      </div>
                    </div>
                    <div style={{fontSize:10,display:"flex",justifyContent:"space-between",color:"#4e6479"}}>
                      <span>Bill: <span style={{color:"#a78bfa",fontWeight:600}}>{fmtPct(eng.billability)}</span></span>
                      {eng.leaveDays>0&&<span style={{color:"#fb923c"}}>✈{eng.leaveDays}d</span>}
                    </div>
                    <div style={{marginTop:7,fontFamily:"'IBM Plex Mono',monospace",fontSize:11,color:"#34d399"}}>{fmtCurrency(eng.revenue)}</div>
                    <div style={{marginTop:5,fontSize:9,padding:"1px 6px",borderRadius:3,background:"#152639",color:"#4e6479",display:"inline-block"}}>{eng.level}</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ════ REPORTS ════ */}
          {view==="reports"&&(
            <div>
              <div style={{marginBottom:20}}>
                <h1 style={{fontSize:21,fontWeight:700,color:"#f0f6ff"}}>Reports & PDF Export</h1>
                <p style={{color:"#2e4a66",fontSize:12,marginTop:3}}>{MONTHS[month]} {year} — Click any report to preview, then export to PDF</p>
              </div>
              <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:10,marginBottom:20}}>
                {[
                  {id:"utilization",icon:"◉",label:"Utilization Report",desc:"Individual & team utilization + billability"},
                  {id:"billable",icon:"$",label:"Billable & Revenue",desc:"Revenue per project & engineer"},
                  {id:"task",icon:"⊟",label:"Task Analysis",desc:"Task categories, activity log, time breakdown"},
                  {id:"monthly",icon:"⊞",label:"Monthly Mgmt Report",desc:"Full executive summary for HQ"},
                ].map(r=>(
                  <div key={r.id} className={`rpt-card ${activeRpt===r.id?"sel":""}`} onClick={()=>setActiveRpt(r.id)}>
                    <div style={{fontSize:18,marginBottom:5,fontFamily:"'IBM Plex Mono',monospace",color:"#38bdf8"}}>{r.icon}</div>
                    <div style={{fontSize:12,fontWeight:700,marginBottom:3}}>{r.label}</div>
                    <div style={{fontSize:10,color:"#2e4a66",lineHeight:1.4}}>{r.desc}</div>
                  </div>
                ))}
              </div>
              <div style={{display:"flex",gap:10,marginBottom:18}}>
                <button className="bp" onClick={()=>{
                  if(activeRpt==="utilization") buildUtilizationPDF();
                  else if(activeRpt==="billable") buildBillablePDF();
                  else if(activeRpt==="task") buildTaskPDF();
                  else buildMonthlyPDF();
                }}>⬇ Export PDF</button>
                <span style={{fontSize:11,color:"#2e4a66",alignSelf:"center"}}>Opens print dialog — save as PDF</span>
              </div>

              {activeRpt==="utilization"&&(
                <div className="card">
                  <h3 style={{fontSize:12,fontWeight:600,color:"#7a8faa",marginBottom:12}}>Utilization Preview — {MONTHS[month]} {year}</h3>
                  <table>
                    <thead><tr><th>Engineer</th><th>Level</th><th>Work Hrs</th><th>Billable Hrs</th><th>Leave</th><th>Utilization</th><th>Billability</th><th>Revenue</th></tr></thead>
                    <tbody>{engStats.map(e=>(
                      <tr key={e.id}>
                        <td><div style={{display:"flex",alignItems:"center",gap:7}}><div className="av" style={{fontSize:9,width:26,height:26}}>{e.name?.slice(0,2).toUpperCase()}</div><div><div style={{fontWeight:500}}>{e.name}</div><div style={{fontSize:9,color:"#2e4a66"}}>{e.role}</div></div></div></td>
                        <td><span style={{fontSize:9,padding:"1px 5px",borderRadius:3,background:"#152639",color:"#4e6479"}}>{e.level}</span></td>
                        <td style={{fontFamily:"'IBM Plex Mono',monospace"}}>{e.workHrs}h</td>
                        <td style={{fontFamily:"'IBM Plex Mono',monospace",color:"#38bdf8"}}>{e.billableHrs}h</td>
                        <td style={{color:e.leaveDays>0?"#fb923c":"#253a52"}}>{e.leaveDays}</td>
                        <td>
                          <div style={{display:"flex",alignItems:"center",gap:5}}>
                            <div style={{background:"#060e1c",height:4,borderRadius:3,width:70,overflow:"hidden"}}>
                              <div style={{height:"100%",width:`${e.utilization}%`,background:e.utilization>=80?"linear-gradient(90deg,#34d399,#10b981)":e.utilization>=60?"linear-gradient(90deg,#fb923c,#f59e0b)":"linear-gradient(90deg,#f87171,#ef4444)",borderRadius:3}}/>
                            </div>
                            <span style={{fontFamily:"'IBM Plex Mono',monospace",fontSize:10,color:"#7a8faa"}}>{fmtPct(e.utilization)}</span>
                          </div>
                        </td>
                        <td>
                          <div style={{display:"flex",alignItems:"center",gap:5}}>
                            <div style={{background:"#060e1c",height:4,borderRadius:3,width:50,overflow:"hidden"}}>
                              <div style={{height:"100%",width:`${e.billability}%`,background:"linear-gradient(90deg,#a78bfa,#7c3aed)",borderRadius:3}}/>
                            </div>
                            <span style={{fontFamily:"'IBM Plex Mono',monospace",fontSize:10,color:"#7a8faa"}}>{fmtPct(e.billability)}</span>
                          </div>
                        </td>
                        <td style={{fontFamily:"'IBM Plex Mono',monospace",color:"#a78bfa"}}>{fmtCurrency(e.revenue)}</td>
                      </tr>
                    ))}</tbody>
                  </table>
                </div>
              )}
              {activeRpt==="task"&&(
                <div className="card">
                  <h3 style={{fontSize:12,fontWeight:600,color:"#7a8faa",marginBottom:12}}>Task Categories — {MONTHS[month]} {year}</h3>
                  {taskStats.length===0&&<p style={{color:"#253a52",fontSize:12}}>No task data for this month.</p>}
                  {taskStats.map(cat=>{
                    const pct=totalWorkHrs?Math.round(cat.hours/totalWorkHrs*100):0;
                    return(<div key={cat.category} style={{marginBottom:14,paddingBottom:14,borderBottom:"1px solid #0d1a2d"}}>
                      <div style={{display:"flex",justifyContent:"space-between",marginBottom:6}}>
                        <span style={{fontWeight:600,fontSize:13}}>{cat.category}</span>
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
                    </div>);
                  })}
                </div>
              )}
              {(activeRpt==="billable"||activeRpt==="monthly")&&(
                <div className="card" style={{textAlign:"center",padding:40}}>
                  <div style={{fontSize:36,marginBottom:10}}>📊</div>
                  <div style={{fontSize:14,fontWeight:700,marginBottom:6}}>Ready to Export</div>
                  <div style={{fontSize:12,color:"#2e4a66"}}>Click "Export PDF" above to generate the formatted report for management.</div>
                </div>
              )}
            </div>
          )}
          </>}
        </div>
      </div>

      {/* ── ADD ENTRY MODAL ── */}
      {modalDate&&(
        <div className="modal-ov" onClick={()=>setModalDate(null)}>
          <div className="modal" onClick={e=>e.stopPropagation()}>
            <h3 style={{fontSize:15,fontWeight:700,marginBottom:4}}>Post Hours</h3>
            <p style={{fontSize:11,color:"#2e4a66",marginBottom:18,fontFamily:"'IBM Plex Mono',monospace"}}>
              {new Date(modalDate).toLocaleDateString("en-US",{weekday:"long",year:"numeric",month:"long",day:"numeric"})} · {selEng?.name}
            </p>
            <div style={{display:"grid",gap:11}}>
              <div><label>Entry Type</label>
                <select value={newEntry.type} onChange={e=>setNewEntry(p=>({...p,type:e.target.value}))}>
                  <option value="work">Work</option>
                  <option value="leave">Leave / Absence</option>
                </select>
              </div>
              {newEntry.type==="work"?<>
                <div><label>Project</label>
                  <select value={newEntry.projectId} onChange={e=>setNewEntry(p=>({...p,projectId:e.target.value}))}>
                    <option value="">— Select Project —</option>
                    {projects.filter(p=>p.status==="Active").map(p=><option key={p.id} value={p.id}>{p.id} — {p.name}</option>)}
                  </select>
                </div>
                <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}>
                  <div><label>Task Category</label>
                    <select value={newEntry.taskCategory} onChange={e=>setNewEntry(p=>({...p,taskCategory:e.target.value,taskType:TASK_CATEGORIES[e.target.value][0]}))}>
                      {Object.keys(TASK_CATEGORIES).map(c=><option key={c}>{c}</option>)}
                    </select>
                  </div>
                  <div><label>Task Type</label>
                    <select value={newEntry.taskType} onChange={e=>setNewEntry(p=>({...p,taskType:e.target.value}))}>
                      {(TASK_CATEGORIES[newEntry.taskCategory]||[]).map(t=><option key={t}>{t}</option>)}
                    </select>
                  </div>
                </div>
                <div><label>Hours</label>
                  <input type="number" min=".5" max="12" step=".5" value={newEntry.hours} onChange={e=>setNewEntry(p=>({...p,hours:+e.target.value}))}/>
                </div>
                <div><label>Activity Description <span style={{color:"#38bdf8"}}>(important for reports)</span></label>
                  <textarea rows={3} placeholder="e.g. Developed PLC logic for pump control sequence, coordinated with Romania HQ…" value={newEntry.activity} onChange={e=>setNewEntry(p=>({...p,activity:e.target.value}))} style={{resize:"vertical"}}/>
                </div>
              </>:(
                <div><label>Leave Type</label>
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

      {/* ── ADD PROJECT MODAL ── */}
      {showProjModal&&(
        <div className="modal-ov" onClick={()=>setShowProjModal(false)}>
          <div className="modal" onClick={e=>e.stopPropagation()}>
            <h3 style={{fontSize:15,fontWeight:700,marginBottom:18}}>New Project</h3>
            <div style={{display:"grid",gap:11}}>
              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}>
                <div><label>Project Number (e.g. EC-2025-009)</label><input value={newProj.id} onChange={e=>setNewProj(p=>({...p,id:e.target.value}))}/></div>
                <div><label>Status</label>
                  <select value={newProj.status} onChange={e=>setNewProj(p=>({...p,status:e.target.value}))}>
                    {["Active","On Hold","Completed"].map(s=><option key={s}>{s}</option>)}
                  </select>
                </div>
              </div>
              <div><label>Project Name</label><input value={newProj.name} onChange={e=>setNewProj(p=>({...p,name:e.target.value}))}/></div>
              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}>
                <div><label>Type</label>
                  <select value={newProj.type} onChange={e=>setNewProj(p=>({...p,type:e.target.value}))}>
                    <option>Renewable Energy</option><option>Industrial</option>
                  </select>
                </div>
                <div><label>Phase</label>
                  <select value={newProj.phase} onChange={e=>setNewProj(p=>({...p,phase:e.target.value}))}>
                    {["Design","Basic Engineering","Detailed Engineering","Software","FAT","Commissioning","Closed"].map(ph=><option key={ph}>{ph}</option>)}
                  </select>
                </div>
              </div>
              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}>
                <div><label>Client</label><input value={newProj.client} onChange={e=>setNewProj(p=>({...p,client:e.target.value}))}/></div>
                <div><label>Origin (BU / HQ)</label><input value={newProj.origin} onChange={e=>setNewProj(p=>({...p,origin:e.target.value}))}/></div>
              </div>
              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}>
                <div><label>Billable?</label>
                  <select value={newProj.billable?"yes":"no"} onChange={e=>setNewProj(p=>({...p,billable:e.target.value==="yes"}))}>
                    <option value="yes">Yes — Billable</option><option value="no">No — Internal</option>
                  </select>
                </div>
                <div><label>Rate per Hour ($)</label>
                  <input type="number" value={newProj.ratePerHour} onChange={e=>setNewProj(p=>({...p,ratePerHour:+e.target.value}))}/>
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

      {/* ── Toast ── */}
      {toast&&(
        <div className="toast" style={{background:toast.ok?"#022c22":"#450a0a",color:toast.ok?"#34d399":"#f87171",border:`1px solid ${toast.ok?"#34d399":"#f87171"}`}}>
          {toast.ok?"✓":"✕"} {toast.msg}
        </div>
      )}
    </div>
  );
}
