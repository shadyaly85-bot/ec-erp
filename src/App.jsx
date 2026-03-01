import { useState, useEffect, useMemo, useCallback } from "react";
import { supabase } from "./supabase";

/* ─── STATIC DATA ─── */
const TASK_CATEGORIES = {
  "Engineering":    ["Basic Engineering","Detailed Engineering","Electrical Design","Control Logic Design","P&ID Review","Cause & Effect Review"],
  "Software":       ["PLC Programming","SCADA Development","HMI Development","OPC Configuration","FAT Preparation","Software Testing"],
  "Documentation":  ["Technical Writing","Datasheet Preparation","Wiring Diagrams","Cable Schedules","I/O List Preparation","Operation Manual"],
  "Project Mgmt":   ["Project Planning","Progress Reporting","Client Meeting","Internal Meeting","Change Management"],
  "Commissioning":  ["Site Survey","Pre-commissioning","Loop Checking","System Integration Test","Cold Commissioning","Hot Commissioning"],
  "Quality":        ["Design Review","Code Review","Document Control","Quality Audit"],
  "Training":       ["Internal Training","Client Training","Knowledge Transfer"],
};
const LEAVE_TYPES   = ["Annual Leave","Sick Leave","Public Holiday","Business Travel","Training External","Unpaid Leave"];
const MONTHS        = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
const PHASES        = ["Design","Basic Engineering","Detailed Engineering","Software","FAT","Commissioning","Closed"];
const LEVELS        = ["Junior","Mid","Senior"];
const ROLES_LIST    = ["Electrical Engineer","Automation Engineer","PLC Programmer","SCADA Engineer","Commissioning Engineer","Renewable Energy Specialist","Instrumentation Engineer","Control Systems Engineer","Project Engineer","Engineering Manager"];

const fmt         = d => d.toISOString().slice(0,10);
const today       = new Date();
const fmtCurrency = n => `$${(n||0).toLocaleString(undefined,{minimumFractionDigits:0})}`;
const fmtPct      = n => `${Math.round(n||0)}%`;
const TARGET_HRS  = 22 * 8;

const getWeekDays = date => {
  const d=new Date(date), day=d.getDay();
  const mon=new Date(d); mon.setDate(d.getDate()-(day===0?6:day-1));
  return Array.from({length:5},(_,i)=>{const x=new Date(mon);x.setDate(mon.getDate()+i);return fmt(x);});
};
const getDaysInMonth = (y,m) => {
  const days=[];
  const total=new Date(y,m+1,0).getDate();
  for(let d=1;d<=total;d++){
    const date=new Date(y,m,d);
    if(date.getDay()!==0&&date.getDay()!==6) days.push(fmt(date));
  }
  return days;
};

/* ─── PDF ─── */
function generatePDF(title, sections, subtitle="Engineering Center Egypt"){
  const win=window.open("","_blank");
  const now=new Date().toLocaleDateString("en-GB",{day:"2-digit",month:"short",year:"numeric"});
  let html=`<!DOCTYPE html><html><head><meta charset="utf-8"><title>${title}</title>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=IBM+Plex+Sans:wght@300;400;600;700&family=IBM+Plex+Mono:wght@400;600&display=swap');
    *{margin:0;padding:0;box-sizing:border-box}body{font-family:'IBM Plex Sans',sans-serif;background:#fff;color:#1a2332;font-size:11px}
    .cover{background:linear-gradient(135deg,#0a1628,#0f2a50 60%,#153d6e);color:#fff;padding:50px;position:relative;overflow:hidden}
    .cover::before{content:'';position:absolute;right:-60px;top:-60px;width:300px;height:300px;border:2px solid rgba(56,189,248,0.15);border-radius:50%}
    .cl{font-family:'IBM Plex Mono',monospace;font-size:9px;letter-spacing:.2em;color:#38bdf8;text-transform:uppercase;margin-bottom:10px}
    .ct{font-size:24px;font-weight:700;line-height:1.2;margin-bottom:8px}.cs{font-size:12px;color:#94a3b8;margin-bottom:16px}
    .cm{display:flex;gap:40px;margin-top:16px}.cm label{font-size:9px;color:#64748b;letter-spacing:.1em;text-transform:uppercase;display:block}
    .cm span{font-family:'IBM Plex Mono',monospace;font-size:11px;color:#e2e8f0}
    .body{padding:28px 36px}.section{margin-bottom:24px;page-break-inside:avoid}
    .st{font-size:12px;font-weight:700;color:#0f2a50;text-transform:uppercase;letter-spacing:.08em;padding-bottom:7px;border-bottom:2px solid #0ea5e9;margin-bottom:12px}
    .kg{display:grid;grid-template-columns:repeat(4,1fr);gap:10px;margin-bottom:4px}
    .kp{background:#f0f7ff;border:1px solid #bfdbfe;border-radius:6px;padding:10px}
    .kv{font-family:'IBM Plex Mono',monospace;font-size:20px;font-weight:700;color:#0ea5e9;line-height:1}
    .kl{font-size:9px;color:#64748b;text-transform:uppercase;letter-spacing:.08em;margin-top:4px}
    table{width:100%;border-collapse:collapse;font-size:10px}
    th{background:#0f2a50;color:#fff;padding:6px 9px;text-align:left;font-weight:600;font-size:9px;letter-spacing:.06em;text-transform:uppercase}
    td{padding:5px 9px;border-bottom:1px solid #e2e8f0}tr:nth-child(even) td{background:#f8fafc}
    .br{display:flex;align-items:center;gap:6px}.bb{flex:1;height:5px;background:#e2e8f0;border-radius:3px;overflow:hidden}
    .bf{height:100%;border-radius:3px;background:linear-gradient(90deg,#0ea5e9,#38bdf8)}
    .footer{background:#f8fafc;border-top:1px solid #e2e8f0;padding:10px 36px;display:flex;justify-content:space-between;font-size:9px;color:#94a3b8}
    @media print{body{-webkit-print-color-adjust:exact;print-color-adjust:exact}}
  </style></head><body>
  <div class="cover"><div class="cl">Engineering Center Egypt · ERP System</div>
  <div class="ct">${title}</div><div class="cs">${subtitle}</div>
  <div class="cm"><div><label>Generated</label><span>${now}</span></div><div><label>System</label><span>EC-ERP v3.0</span></div><div><label>Confidential</label><span>Management Use Only</span></div></div>
  </div><div class="body">`;
  sections.forEach(s=>{html+=s;});
  html+=`</div><div class="footer"><span>Engineering Center Egypt · Industrial & Renewable Energy Automation</span><span>CONFIDENTIAL — ${now}</span></div>
  <script>window.onload=()=>window.print()<\/script></body></html>`;
  win.document.write(html); win.document.close();
}

/* ════════════════════════════════════════
   SIGNUP SCREEN — with name/role fields
════════════════════════════════════════ */
function SignupScreen({onBack}){
  const [form,setForm]=useState({email:"",password:"",name:"",role:ROLES_LIST[0],level:"Mid"});
  const [err,setErr]=useState(""); const [loading,setLoading]=useState(false);

  const handle=async e=>{
    e.preventDefault(); setErr(""); setLoading(true);
    if(!form.name.trim()){setErr("Please enter your full name.");setLoading(false);return;}
    const {data,error}=await supabase.auth.signUp({email:form.email,password:form.password});
    if(error){setErr(error.message);setLoading(false);return;}
    // Auto-create engineer row
    if(data.user){
      await supabase.from("engineers").insert({
        user_id:data.user.id, name:form.name.trim(), role:form.role,
        level:form.level, email:form.email, role_type:"engineer"
      });
      // Notify admin via notifications table
      await supabase.from("notifications").insert({
        type:"new_signup", message:`New engineer signed up: ${form.name} (${form.role})`,
        meta:JSON.stringify({email:form.email,role:form.role,level:form.level}), read:false
      });
    }
    setErr("✓ Account created! Please check your email to confirm, then sign in.");
    setLoading(false);
  };

  return(
    <div style={{display:"grid",gap:11}}>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}>
        <div><Lbl>Full Name</Lbl><input value={form.name} onChange={e=>setForm(p=>({...p,name:e.target.value}))} placeholder="Ahmed Hassan"/></div>
        <div><Lbl>Level</Lbl>
          <select value={form.level} onChange={e=>setForm(p=>({...p,level:e.target.value}))}>
            {LEVELS.map(l=><option key={l}>{l}</option>)}
          </select>
        </div>
      </div>
      <div><Lbl>Job Role</Lbl>
        <select value={form.role} onChange={e=>setForm(p=>({...p,role:e.target.value}))}>
          {ROLES_LIST.map(r=><option key={r}>{r}</option>)}
        </select>
      </div>
      <div><Lbl>Email Address</Lbl><input type="email" value={form.email} onChange={e=>setForm(p=>({...p,email:e.target.value}))} placeholder="you@company.com"/></div>
      <div><Lbl>Password</Lbl><input type="password" value={form.password} onChange={e=>setForm(p=>({...p,password:e.target.value}))} placeholder="Min 6 characters"/></div>
      {err&&<div style={{padding:"8px 12px",borderRadius:6,fontSize:12,background:err.startsWith("✓")?"#022c22":"#450a0a",color:err.startsWith("✓")?"#34d399":"#f87171",border:`1px solid ${err.startsWith("✓")?"#34d399":"#f87171"}`}}>{err}</div>}
      <button className="bp" onClick={handle} disabled={loading} style={{width:"100%",justifyContent:"center",padding:11}}>{loading?"Creating…":"Create Account"}</button>
      <div style={{textAlign:"center",fontSize:12,color:"#2e4a66",cursor:"pointer"}} onClick={onBack}>← Back to Sign In</div>
    </div>
  );
}

/* ─── small helpers ─── */
const Lbl=({children})=><div style={{fontSize:11,color:"#4e6479",marginBottom:4}}>{children}</div>;

/* ════════════════════════════════════════
   MAIN APP
════════════════════════════════════════ */
export default function App(){
  /* auth */
  const [session,setSession]         = useState(null);
  const [authLoading,setAuthLoading] = useState(true);
  const [authEmail,setAuthEmail]     = useState("");
  const [authPwd,setAuthPwd]         = useState("");
  const [authErr,setAuthErr]         = useState("");
  const [authMode,setAuthMode]       = useState("login");

  /* data */
  const [engineers,setEngineers]     = useState([]);
  const [projects,setProjects]       = useState([]);
  const [entries,setEntries]         = useState([]);
  const [notifications,setNotifications] = useState([]);
  const [myProfile,setMyProfile]     = useState(null);
  const [loading,setLoading]         = useState(false);

  /* UI */
  const [view,setView]               = useState("dashboard");
  const [browseEngId,setBrowseEngId] = useState(null); // admin: which eng to browse
  const [weekOf,setWeekOf]           = useState(fmt(today));
  const [month,setMonth]             = useState(today.getMonth());
  const [year,setYear]               = useState(today.getFullYear());
  const [toast,setToast]             = useState(null);
  const [modalDate,setModalDate]     = useState(null);
  const [editEntry,setEditEntry]     = useState(null); // entry being edited
  const [activeRpt,setActiveRpt]     = useState("utilization");
  const [showProjModal,setShowProjModal]   = useState(false);
  const [editProjModal,setEditProjModal]   = useState(null); // project being edited
  const [showEngModal,setShowEngModal]     = useState(false);
  const [editEngModal,setEditEngModal]     = useState(null);
  const [showNotifPanel,setShowNotifPanel] = useState(false);
  const [adminTab,setAdminTab]             = useState("engineers"); // engineers|projects|entries
  const [entryFilter,setEntryFilter]       = useState({engineer:"ALL",project:"ALL",month:today.getMonth(),year:today.getFullYear()});

  /* forms */
  const [newEntry,setNewEntry]   = useState({projectId:"",taskCategory:"Engineering",taskType:"Basic Engineering",hours:8,activity:"",type:"work",leaveType:LEAVE_TYPES[0]});
  const [newProj,setNewProj]     = useState({id:"",name:"",type:"Renewable Energy",client:"",origin:"Romania HQ",phase:"Design",billable:true,rate_per_hour:85,status:"Active"});
  const [newEng,setNewEng]       = useState({name:"",role:ROLES_LIST[0],level:"Mid",email:"",role_type:"engineer"});

  const showToast=(msg,ok=true)=>{setToast({msg,ok});setTimeout(()=>setToast(null),3500);};
  const weekDays=useMemo(()=>getWeekDays(weekOf),[weekOf]);
  const isAdmin=myProfile?.role_type==="admin";

  // The engineer whose timesheet is shown
  // Admin can browse any engineer; regular engineer only sees themselves
  const viewEngId = isAdmin ? (browseEngId || myProfile?.id) : myProfile?.id;
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
      if(engsR.data)  setEngineers(engsR.data);
      if(projR.data)  setProjects(projR.data);
      if(entrR.data)  setEntries(entrR.data);
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

  /* ── MARK NOTIFICATIONS READ ── */
  const markAllRead=async()=>{
    await supabase.from("notifications").update({read:true}).eq("read",false);
    setNotifications(prev=>prev.map(n=>({...n,read:true})));
  };

  /* ── ADD ENTRY ── */
  const addEntry=async date=>{
    const proj=projects.find(p=>p.id===newEntry.projectId);
    const engId = isAdmin ? viewEngId : myProfile.id;
    const payload={
      engineer_id:engId,
      project_id: newEntry.type==="leave"?null:newEntry.projectId,
      date,
      task_category:newEntry.type==="leave"?null:newEntry.taskCategory,
      task_type:    newEntry.type==="leave"?null:newEntry.taskType,
      hours:        newEntry.type==="leave"?8:+newEntry.hours,
      activity:     newEntry.activity,
      entry_type:   newEntry.type,
      leave_type:   newEntry.type==="leave"?newEntry.leaveType:null,
      billable:     newEntry.type==="leave"?false:(proj?.billable||false),
    };
    const {data,error}=await supabase.from("time_entries").insert(payload).select().single();
    if(error){showToast("Error: "+error.message,false);return;}
    setEntries(prev=>[data,...prev]);
    setModalDate(null);
    setNewEntry({projectId:"",taskCategory:"Engineering",taskType:"Basic Engineering",hours:8,activity:"",type:"work",leaveType:LEAVE_TYPES[0]});
    showToast("Hours posted ✓");
  };

  /* ── EDIT ENTRY ── */
  const saveEditEntry=async()=>{
    if(!editEntry) return;
    const proj=projects.find(p=>p.id===editEntry.projectId);
    const payload={
      project_id:   editEntry.type==="leave"?null:editEntry.projectId,
      task_category:editEntry.type==="leave"?null:editEntry.taskCategory,
      task_type:    editEntry.type==="leave"?null:editEntry.taskType,
      hours:        +editEntry.hours,
      activity:     editEntry.activity,
      entry_type:   editEntry.type,
      leave_type:   editEntry.type==="leave"?editEntry.leaveType:null,
      billable:     editEntry.type==="leave"?false:(proj?.billable||false),
      date:         editEntry.date,
    };
    const {data,error}=await supabase.from("time_entries").update(payload).eq("id",editEntry.id).select().single();
    if(error){showToast("Error: "+error.message,false);return;}
    setEntries(prev=>prev.map(e=>e.id===data.id?data:e));
    setEditEntry(null); showToast("Entry updated ✓");
  };

  /* ── DELETE ENTRY ── */
  const deleteEntry=async id=>{
    if(!window.confirm("Delete this entry?")) return;
    const {error}=await supabase.from("time_entries").delete().eq("id",id);
    if(error){showToast("Error deleting",false);return;}
    setEntries(prev=>prev.filter(e=>e.id!==id));
    showToast("Entry deleted",false);
  };

  /* ── PROJECT CRUD ── */
  const addProject=async()=>{
    if(!newProj.id||!newProj.name){showToast("Project number and name are required",false);return;}
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
    if(!window.confirm(`Delete project ${id}? This will also delete all time entries for this project.`)) return;
    await supabase.from("time_entries").delete().eq("project_id",id);
    const {error}=await supabase.from("projects").delete().eq("id",id);
    if(error){showToast("Error: "+error.message,false);return;}
    setProjects(prev=>prev.filter(p=>p.id!==id));
    setEntries(prev=>prev.filter(e=>e.project_id!==id));
    showToast("Project deleted",false);
  };

  /* ── ENGINEER CRUD (admin) ── */
  const addEngineer=async()=>{
    if(!newEng.name){showToast("Name is required",false);return;}
    const {data,error}=await supabase.from("engineers").insert(newEng).select().single();
    if(error){showToast("Error: "+error.message,false);return;}
    setEngineers(prev=>[...prev,data].sort((a,b)=>a.name.localeCompare(b.name)));
    setShowEngModal(false);
    setNewEng({name:"",role:ROLES_LIST[0],level:"Mid",email:"",role_type:"engineer"});
    showToast("Engineer added ✓");
  };

  const saveEditEngineer=async()=>{
    if(!editEngModal) return;
    const {id,...rest}=editEngModal;
    const {data,error}=await supabase.from("engineers").update(rest).eq("id",id).select().single();
    if(error){showToast("Error: "+error.message,false);return;}
    setEngineers(prev=>prev.map(e=>e.id===data.id?data:e));
    setEditEngModal(null); showToast("Engineer updated ✓");
  };

  const deleteEngineer=async id=>{
    if(!window.confirm("Delete this engineer and all their entries?")) return;
    await supabase.from("time_entries").delete().eq("engineer_id",id);
    const {error}=await supabase.from("engineers").delete().eq("id",id);
    if(error){showToast("Error: "+error.message,false);return;}
    setEngineers(prev=>prev.filter(e=>e.id!==id));
    setEntries(prev=>prev.filter(e=>e.engineer_id!==id));
    showToast("Engineer removed",false);
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
    const p=projects.find(x=>x.id===e.project_id); return s+(p?p.rate_per_hour*e.hours:0);},0);
  const billabilityPct= totalWorkHrs?Math.round(totalBillable/totalWorkHrs*100):0;
  const overallUtil   = engineers.length?Math.min(100,Math.round(totalWorkHrs/(engineers.length*TARGET_HRS)*100)):0;

  const engStats=useMemo(()=>engineers.map(eng=>{
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

  /* admin entries browser filtered */
  const adminBrowseEntries=useMemo(()=>entries.filter(e=>{
    const d=new Date(e.date);
    const byE=entryFilter.engineer==="ALL"||e.engineer_id===+entryFilter.engineer;
    const byP=entryFilter.project==="ALL"||e.project_id===entryFilter.project;
    const byM=d.getMonth()===entryFilter.month&&d.getFullYear()===entryFilter.year;
    return byE&&byP&&byM;
  }),[entries,entryFilter]);

  /* ── PDF builders ── */
  const buildUtilizationPDF=()=>{
    const rows=engStats.map(e=>`<tr>
      <td><strong>${e.name}</strong><br><span style="color:#64748b;font-size:9px">${e.role||""}</span></td>
      <td>${e.level||""}</td><td>${e.workHrs}h</td><td>${e.billableHrs}h</td><td>${e.leaveDays}d</td>
      <td><div class="br"><div class="bb"><div class="bf" style="width:${e.utilization}%"></div></div><span>${fmtPct(e.utilization)}</span></div></td>
      <td><div class="br"><div class="bb"><div class="bf" style="width:${e.billability}%;background:linear-gradient(90deg,#10b981,#34d399)"></div></div><span>${fmtPct(e.billability)}</span></div></td>
      <td style="color:#0ea5e9;font-weight:700">${fmtCurrency(e.revenue)}</td></tr>`).join("");
    generatePDF(`Team Utilization & Billability — ${MONTHS[month]} ${year}`,[
      `<div class="section"><div class="st">Executive KPIs</div><div class="kg">
        <div class="kp"><div class="kv">${fmtPct(overallUtil)}</div><div class="kl">Overall Utilization</div></div>
        <div class="kp"><div class="kv">${fmtPct(billabilityPct)}</div><div class="kl">Billability Rate</div></div>
        <div class="kp"><div class="kv">${totalWorkHrs}h</div><div class="kl">Total Work Hours</div></div>
        <div class="kp"><div class="kv">${fmtCurrency(totalRevenue)}</div><div class="kl">Revenue Billed</div></div>
      </div></div>`,
      `<div class="section"><div class="st">Individual Breakdown</div>
      <table><thead><tr><th>Engineer</th><th>Level</th><th>Work Hrs</th><th>Billable Hrs</th><th>Leave</th><th>Utilization</th><th>Billability</th><th>Revenue</th></tr></thead>
      <tbody>${rows}</tbody></table></div>`
    ]);
  };
  const buildBillablePDF=()=>{
    generatePDF(`Billable Hours & Revenue — ${MONTHS[month]} ${year}`,[
      `<div class="section"><div class="st">Summary</div><div class="kg">
        <div class="kp"><div class="kv">${fmtCurrency(totalRevenue)}</div><div class="kl">Total Revenue</div></div>
        <div class="kp"><div class="kv">${totalBillable}h</div><div class="kl">Billable Hours</div></div>
        <div class="kp"><div class="kv">${projStats.filter(p=>p.billable&&p.hours>0).length}</div><div class="kl">Billed Projects</div></div>
        <div class="kp"><div class="kv">${fmtPct(billabilityPct)}</div><div class="kl">Billability Rate</div></div>
      </div></div>`,
      `<div class="section"><div class="st">Billable Projects</div>
      <table><thead><tr><th>Project No.</th><th>Name</th><th>Client</th><th>Rate/hr</th><th>Hours</th><th>Revenue</th></tr></thead>
      <tbody>${projStats.filter(p=>p.billable&&p.hours>0).map(p=>`<tr>
        <td style="color:#0ea5e9">${p.id}</td><td>${p.name}</td><td>${p.client||""}</td>
        <td>$${p.rate_per_hour}</td><td>${p.hours}h</td><td style="color:#0ea5e9;font-weight:700">${fmtCurrency(p.revenue)}</td>
      </tr>`).join("")}</tbody></table></div>`
    ],"For Finance & Senior Management");
  };
  const buildTaskPDF=()=>{
    const actRows=entries.filter(e=>e.entry_type==="work"&&e.activity&&new Date(e.date).getMonth()===month&&new Date(e.date).getFullYear()===year)
      .slice(0,30).map(e=>{
        const eng=engineers.find(x=>x.id===e.engineer_id);
        const proj=projects.find(x=>x.id===e.project_id);
        return`<tr><td style="font-size:9px">${e.date}</td><td>${eng?.name||""}</td>
        <td style="color:#0ea5e9;font-size:9px">${proj?.id||""}</td>
        <td style="font-size:9px">${e.task_type||""}</td><td style="font-style:italic">${e.activity||""}</td>
        <td>${e.hours}h</td></tr>`;}).join("");
    generatePDF(`Task Analysis — ${MONTHS[month]} ${year}`,[
      `<div class="section"><div class="st">Task Category Breakdown</div>
      <table><thead><tr><th>Category</th><th>Total Hrs</th><th>Billable Hrs</th><th>Share</th><th>Tasks</th></tr></thead>
      <tbody>${taskStats.map(cat=>{const pct=totalWorkHrs?Math.round(cat.hours/totalWorkHrs*100):0;
        return`<tr><td><strong>${cat.category}</strong></td><td>${cat.hours}h</td><td>${cat.billable}h</td>
        <td><div class="br"><div class="bb"><div class="bf" style="width:${pct}%"></div></div><span>${pct}%</span></div></td>
        <td style="font-size:9px">${Object.keys(cat.tasks).join(", ")}</td></tr>`;}).join("")}
      </tbody></table></div>`,
      `<div class="section"><div class="st">Activity Log</div>
      <table><thead><tr><th>Date</th><th>Engineer</th><th>Project</th><th>Task</th><th>Activity</th><th>Hrs</th></tr></thead>
      <tbody>${actRows}</tbody></table></div>`
    ]);
  };
  const buildMonthlyPDF=()=>{
    generatePDF(`Monthly Management Report — ${MONTHS[month]} ${year}`,[
      `<div class="section"><div class="st">Executive Summary</div><div class="kg">
        <div class="kp"><div class="kv">${fmtPct(overallUtil)}</div><div class="kl">Team Utilization</div></div>
        <div class="kp"><div class="kv">${fmtPct(billabilityPct)}</div><div class="kl">Billability</div></div>
        <div class="kp"><div class="kv">${fmtCurrency(totalRevenue)}</div><div class="kl">Revenue</div></div>
        <div class="kp"><div class="kv">${leaveEntries.length}</div><div class="kl">Absence Days</div></div>
      </div></div>`,
      `<div class="section"><div class="st">Engineer Performance</div>
      <table><thead><tr><th>Engineer</th><th>Utilization</th><th>Billability</th><th>Work Hrs</th><th>Revenue</th><th>Leave</th></tr></thead>
      <tbody>${engStats.map(e=>`<tr><td><strong>${e.name}</strong><br><span style="font-size:9px;color:#64748b">${e.role||""}</span></td>
        <td>${fmtPct(e.utilization)}</td><td>${fmtPct(e.billability)}</td><td>${e.workHrs}h</td>
        <td style="color:#0ea5e9">${fmtCurrency(e.revenue)}</td><td>${e.leaveDays}d</td></tr>`).join("")}
      </tbody></table></div>`,
      `<div class="section"><div class="st">Project Status</div>
      <table><thead><tr><th>Project No.</th><th>Project</th><th>Phase</th><th>Hours</th><th>Revenue</th></tr></thead>
      <tbody>${projStats.filter(p=>p.hours>0).map(p=>`<tr>
        <td style="color:#0ea5e9;font-size:9px">${p.id}</td><td>${p.name}</td><td>${p.phase||""}</td>
        <td>${p.hours}h</td><td>${p.billable?fmtCurrency(p.revenue):"—"}</td></tr>`).join("")}
      </tbody></table></div>`
    ],"Prepared for Senior Management · Confidential");
  };

  /* ════ LOADING ════ */
  if(authLoading) return(
    <div style={{display:"flex",alignItems:"center",justifyContent:"center",minHeight:"100vh",background:"#080d1a",fontFamily:"'IBM Plex Mono',monospace",color:"#38bdf8",fontSize:14}}>
      Loading EC-ERP…
    </div>
  );

  /* ════ AUTH ════ */
  if(!session) return(
    <div style={{minHeight:"100vh",background:"#080d1a",display:"flex",alignItems:"center",justifyContent:"center",fontFamily:"'IBM Plex Sans',sans-serif"}}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=IBM+Plex+Sans:wght@400;600;700&family=IBM+Plex+Mono:wght@400;600&display=swap');*{box-sizing:border-box;margin:0;padding:0}input,select{background:#060e1c;border:1px solid #192d47;color:#dde3ef;padding:10px 14px;border-radius:7px;font-family:'IBM Plex Sans',sans-serif;font-size:13px;outline:none;width:100%;transition:border-color .2s}input:focus,select:focus{border-color:#38bdf8}select option{background:#060e1c}.bp{background:linear-gradient(135deg,#0ea5e9,#0369a1);border:none;color:#fff;padding:11px;border-radius:7px;cursor:pointer;font-family:'IBM Plex Sans',sans-serif;font-size:14px;font-weight:700;transition:opacity .2s;display:flex;align-items:center;justify-content:center}.bp:hover{opacity:.85}`}</style>
      <div style={{background:"#0b1526",border:"1px solid #192d47",borderRadius:14,padding:"36px",width:420,maxWidth:"95vw",boxShadow:"0 24px 60px #00000080"}}>
        <div style={{textAlign:"center",marginBottom:24}}>
          <div style={{fontFamily:"'IBM Plex Mono',monospace",fontSize:10,color:"#38bdf8",letterSpacing:".18em",marginBottom:8}}>ENGINEERING CENTER EGYPT</div>
          <div style={{fontSize:22,fontWeight:700,color:"#f0f6ff"}}>EC-ERP System</div>
          <div style={{fontSize:12,color:"#2e4a66",marginTop:4}}>Industrial & Renewable Energy Automation</div>
        </div>

        {authMode==="login"?(
          <div style={{display:"grid",gap:12}}>
            {authErr&&<div style={{padding:"8px 12px",borderRadius:6,fontSize:12,background:authErr.startsWith("✓")?"#022c22":"#450a0a",color:authErr.startsWith("✓")?"#34d399":"#f87171",border:`1px solid ${authErr.startsWith("✓")?"#34d399":"#f87171"}`}}>{authErr}</div>}
            <div><Lbl>Email Address</Lbl><input type="email" value={authEmail} onChange={e=>setAuthEmail(e.target.value)} placeholder="you@company.com"/></div>
            <div><Lbl>Password</Lbl><input type="password" value={authPwd} onChange={e=>setAuthPwd(e.target.value)} placeholder="••••••••" onKeyDown={e=>e.key==="Enter"&&handleLogin(e)}/></div>
            <button className="bp" onClick={handleLogin}>Sign In</button>
            <div style={{textAlign:"center",fontSize:12,color:"#2e4a66"}}>
              New engineer? <span style={{color:"#38bdf8",cursor:"pointer"}} onClick={()=>{setAuthMode("signup");setAuthErr("");}}>Create Account</span>
            </div>
          </div>
        ):(
          <SignupScreen onBack={()=>setAuthMode("login")}/>
        )}
      </div>
    </div>
  );

  /* ════ MAIN APP ════ */
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
        .be{background:transparent;border:1px solid #0ea5e930;color:#38bdf8;padding:4px 9px;border-radius:4px;cursor:pointer;font-size:11px;font-family:'IBM Plex Sans',sans-serif;transition:all .2s}
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
        .modal{background:#0b1526;border:1px solid #192d47;border-radius:12px;padding:24px;width:520px;max-width:95vw;max-height:90vh;overflow-y:auto}
        .toast{position:fixed;bottom:28px;right:28px;padding:11px 18px;border-radius:8px;font-size:12px;font-weight:700;z-index:200;animation:su .3s ease}
        @keyframes su{from{transform:translateY(12px);opacity:0}to{transform:translateY(0);opacity:1}}
        .metric{background:linear-gradient(135deg,#0b1526,#0d1e34);border:1px solid #192d47;border-radius:10px;padding:16px}
        .wc{background:#060e1c;border:1px solid #152639;border-radius:8px;min-height:120px;padding:9px}
        .atab{background:none;border:none;cursor:pointer;padding:7px 14px;border-radius:6px;font-family:'IBM Plex Sans',sans-serif;font-size:12px;font-weight:600;color:#4e6479;transition:all .2s}
        .atab:hover{color:#38bdf8}.atab.a{background:#0d1a2d;color:#38bdf8}
        .rpt-card{background:#0b1526;border:1px solid #192d47;border-radius:8px;padding:14px;cursor:pointer;transition:all .2s}
        .rpt-card:hover,.rpt-card.sel{border-color:#38bdf8;background:#0d1e34}
        .notif-dot{width:8px;height:8px;border-radius:50%;background:#ef4444;position:absolute;top:6px;right:6px}
      `}</style>

      <div style={{display:"flex"}}>
        {/* ── Sidebar ── */}
        <div style={{width:215,background:"#060c18",borderRight:"1px solid #192d47",minHeight:"100vh",padding:"20px 10px",position:"fixed",top:0,left:0,bottom:0,overflowY:"auto",zIndex:50}}>
          <div style={{marginBottom:20,paddingLeft:6}}>
            <div style={{fontFamily:"'IBM Plex Mono',monospace",fontSize:9,color:"#38bdf8",letterSpacing:".18em",fontWeight:600}}>ENGINEERING CENTER</div>
            <div style={{fontSize:17,fontWeight:700,color:"#f0f6ff",marginTop:2}}>EC-ERP v3</div>
            <div style={{fontSize:10,color:"#2e4a66",marginTop:1,fontFamily:"'IBM Plex Mono',monospace"}}>Cairo, Egypt</div>
          </div>

          {[{id:"dashboard",icon:"▦",label:"Dashboard"},
            {id:"timesheet",icon:"⏱",label:"Post Hours"},
            {id:"projects", icon:"◈",label:"Projects"},
            {id:"team",     icon:"◉",label:"Team"},
            {id:"reports",  icon:"⊞",label:"Reports & PDF"},
            ...(isAdmin?[{id:"admin",icon:"⚙",label:"Admin Panel"}]:[])
          ].map(n=>(
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
                  <div style={{fontSize:9,color:"#2e4a66"}}>{isAdmin?"Admin · Engineering Manager":"Engineer"}</div>
                </div>
              </div>
              <button onClick={handleLogout} style={{width:"100%",background:"transparent",border:"1px solid #192d47",color:"#4e6479",padding:"5px",borderRadius:5,cursor:"pointer",fontSize:11,fontFamily:"'IBM Plex Sans',sans-serif"}}>Sign Out</button>
            </div>
          </div>
        </div>

        {/* ── Main ── */}
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
              <div style={{display:"grid",gridTemplateColumns:"repeat(5,1fr)",gap:11,marginBottom:18}}>
                {[
                  {l:"Team Utilization",v:fmtPct(overallUtil),c:"#38bdf8"},
                  {l:"Billability",     v:fmtPct(billabilityPct),c:"#34d399"},
                  {l:"Revenue Billed",  v:fmtCurrency(totalRevenue),c:"#a78bfa"},
                  {l:"Active Projects", v:projects.filter(p=>p.status==="Active").length,c:"#fb923c"},
                  {l:"Absence Days",    v:leaveEntries.length,c:"#f472b6"},
                ].map((m,i)=>(
                  <div key={i} className="metric">
                    <div style={{fontSize:9,color:"#2e4a66",fontWeight:700,textTransform:"uppercase",letterSpacing:".06em"}}>{m.l}</div>
                    <div style={{fontFamily:"'IBM Plex Mono',monospace",fontSize:24,fontWeight:700,color:m.c,marginTop:8,lineHeight:1}}>{m.v}</div>
                  </div>
                ))}
              </div>
              <div style={{display:"grid",gridTemplateColumns:"1.5fr 1fr",gap:14,marginBottom:14}}>
                <div className="card">
                  <h3 style={{fontSize:12,fontWeight:600,color:"#7a8faa",marginBottom:12}}>Engineer Utilization — {MONTHS[month]}</h3>
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
                      <span style={{fontFamily:"'IBM Plex Mono',monospace",fontSize:9,color:"#a78bfa",width:32,textAlign:"right"}}>{fmtPct(eng.billability)}</span>
                    </div>
                  ))}
                </div>
                <div className="card">
                  <h3 style={{fontSize:12,fontWeight:600,color:"#7a8faa",marginBottom:12}}>Task Distribution</h3>
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
                  <thead><tr><th>No.</th><th>Name</th><th>Phase</th><th>Hours</th><th>Billing</th><th>Revenue</th></tr></thead>
                  <tbody>{projStats.filter(p=>p.hours>0).map(p=>(
                    <tr key={p.id}>
                      <td style={{fontFamily:"'IBM Plex Mono',monospace",fontSize:11,color:"#38bdf8"}}>{p.id}</td>
                      <td style={{fontSize:11}}>{p.name}</td>
                      <td style={{color:"#7a8faa",fontSize:11}}>{p.phase}</td>
                      <td style={{fontFamily:"'IBM Plex Mono',monospace"}}>{p.hours}h</td>
                      <td><span style={{fontSize:9,padding:"2px 6px",borderRadius:3,fontFamily:"'IBM Plex Mono',monospace",fontWeight:700,background:p.billable?"#0c2b4e":"#1a0a00",color:p.billable?"#38bdf8":"#fb923c"}}>{p.billable?"BILLABLE":"NON-BILL"}</span></td>
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
                  <p style={{color:"#2e4a66",fontSize:12,marginTop:3}}>
                    {isAdmin?"Admin View — Browse any engineer's timesheet":"Your weekly timesheet"}
                  </p>
                </div>
                <div style={{display:"flex",gap:12,alignItems:"flex-end"}}>
                  {isAdmin&&(
                    <div><Lbl>Browse Engineer</Lbl>
                      <select style={{width:190}} value={viewEngId||""} onChange={e=>setBrowseEngId(+e.target.value)}>
                        {engineers.map(eng=><option key={eng.id} value={eng.id}>{eng.name}</option>)}
                      </select>
                    </div>
                  )}
                  {/* Week navigator — no restrictions, can go past or future */}
                  <div>
                    <Lbl>Week</Lbl>
                    <div style={{display:"flex",alignItems:"center",gap:6}}>
                      <button className="bg" style={{padding:"7px 10px",fontSize:13}} onClick={()=>{
                        const d=new Date(weekOf); d.setDate(d.getDate()-7); setWeekOf(fmt(d));
                      }}>←</button>
                      <input type="date" style={{width:145}} value={weekOf} onChange={e=>setWeekOf(e.target.value)}/>
                      <button className="bg" style={{padding:"7px 10px",fontSize:13}} onClick={()=>{
                        const d=new Date(weekOf); d.setDate(d.getDate()+7); setWeekOf(fmt(d));
                      }}>→</button>
                      <button className="bg" style={{padding:"7px 10px",fontSize:11,whiteSpace:"nowrap"}} onClick={()=>setWeekOf(fmt(today))}>Today</button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Engineer header card */}
              {viewEng&&<div style={{display:"flex",alignItems:"center",gap:14,marginBottom:16,background:"#0b1526",border:"1px solid #192d47",borderRadius:10,padding:"12px 16px"}}>
                <div className="av" style={{width:42,height:42,fontSize:13}}>{viewEng.name?.slice(0,2).toUpperCase()}</div>
                <div>
                  <div style={{fontSize:14,fontWeight:600}}>{viewEng.name}</div>
                  <div style={{fontSize:11,color:"#2e4a66"}}>{viewEng.role} · {viewEng.level}</div>
                </div>
                <div style={{marginLeft:"auto",display:"flex",gap:20}}>
                  {[
                    {l:"Week Hrs", v:weekDays.reduce((s,d)=>s+entries.filter(e=>e.date===d&&e.engineer_id===viewEngId).reduce((ss,e)=>ss+e.hours,0),0)+"h", c:"#38bdf8"},
                    {l:"Month Hrs",v:monthEntries.filter(e=>e.engineer_id===viewEngId&&e.entry_type==="work").reduce((s,e)=>s+e.hours,0)+"h", c:"#34d399"},
                    {l:"Utilization",v:fmtPct(Math.min(100,Math.round(monthEntries.filter(e=>e.engineer_id===viewEngId&&e.entry_type==="work").reduce((s,e)=>s+e.hours,0)/TARGET_HRS*100))),c:"#a78bfa"},
                  ].map((s,i)=><div key={i} style={{textAlign:"center"}}>
                    <div style={{fontFamily:"'IBM Plex Mono',monospace",fontSize:17,fontWeight:700,color:s.c}}>{s.v}</div>
                    <div style={{fontSize:10,color:"#253a52"}}>{s.l}</div>
                  </div>)}
                </div>
              </div>}

              {/* Week grid */}
              <div style={{display:"grid",gridTemplateColumns:"repeat(5,1fr)",gap:10}}>
                {weekDays.map(day=>{
                  const de=entries.filter(e=>e.date===day&&e.engineer_id===viewEngId);
                  const dh=de.reduce((s,e)=>s+e.hours,0);
                  const lbl=new Date(day).toLocaleDateString("en-US",{weekday:"short",month:"short",day:"numeric"});
                  const isToday=day===fmt(today);
                  const isFuture=day>fmt(today);
                  return(
                    <div key={day} className="wc" style={isToday?{borderColor:"#0ea5e9"}:isFuture?{borderColor:"#a78bfa40",background:"#0a0e1f"}:{}}>
                      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:7}}>
                        <div>
                          <div style={{fontSize:11,fontWeight:600,color:isToday?"#38bdf8":isFuture?"#a78bfa":"#7a8faa"}}>
                            {lbl}
                            {isFuture&&<span style={{fontSize:8,marginLeft:4,color:"#a78bfa",fontFamily:"'IBM Plex Mono',monospace"}}>FUTURE</span>}
                          </div>
                          {dh>0&&<div style={{fontFamily:"'IBM Plex Mono',monospace",fontSize:10,color:"#38bdf8"}}>{dh}h</div>}
                        </div>
                        <button className="bp" style={{padding:"2px 7px",fontSize:11,background:isFuture?"linear-gradient(135deg,#7c3aed,#6d28d9)":undefined}} onClick={()=>setModalDate(day)}>+</button>
                      </div>
                      {de.map(e=>{
                        const proj=projects.find(p=>p.id===e.project_id);
                        return(
                          <div key={e.id} style={{background:"#08111e",border:`1px solid ${e.billable?"#0c2b4e":"#152535"}`,borderRadius:5,padding:"6px 7px",marginBottom:4,fontSize:10}}>
                            <div style={{display:"flex",justifyContent:"space-between",gap:3}}>
                              <div style={{flex:1,minWidth:0}}>
                                {e.entry_type==="leave"
                                  ?<span style={{color:"#fb923c",fontWeight:600}}>✈ {e.leave_type}</span>
                                  :<><span style={{fontFamily:"'IBM Plex Mono',monospace",color:"#0ea5e9",fontSize:9}}>{proj?.id}</span>
                                    <div style={{color:"#7a8faa",fontSize:9,marginTop:1}}>{e.task_type}</div>
                                    {e.activity&&<div style={{color:"#4e6479",fontSize:9,marginTop:1,fontStyle:"italic",lineHeight:1.3}}>{e.activity.substring(0,42)}{e.activity.length>42?"…":""}</div>}
                                  </>}
                              </div>
                              <div style={{display:"flex",flexDirection:"column",gap:3}}>
                                <button className="be" onClick={()=>setEditEntry({...e,projectId:e.project_id,type:e.entry_type})}>✎</button>
                                <button className="bd" onClick={()=>deleteEntry(e.id)}>✕</button>
                              </div>
                            </div>
                            <div style={{display:"flex",justifyContent:"space-between",marginTop:4}}>
                              <span style={{fontFamily:"'IBM Plex Mono',monospace",color:"#38bdf8",fontWeight:700,fontSize:12}}>{e.hours}h</span>
                              {e.billable&&<span style={{fontSize:8,color:"#34d399",fontWeight:700}}>BILLABLE</span>}
                            </div>
                          </div>
                        );
                      })}
                      {de.length===0&&<div style={{color:"#152639",fontSize:10,textAlign:"center",marginTop:20}}>No entries</div>}
                    </div>
                  );
                })}
              </div>

              {/* Month view for engineer — full month calendar */}
              <div style={{marginTop:24}}>
                <h3 style={{fontSize:13,fontWeight:600,color:"#7a8faa",marginBottom:12}}>Full Month View — {MONTHS[month]} {year}</h3>
                <div className="card">
                  <table>
                    <thead><tr><th>Date</th><th>Project</th><th>Task</th><th>Activity</th><th>Hours</th><th>Type</th><th style={{width:80}}>Actions</th></tr></thead>
                    <tbody>
                      {monthEntries.filter(e=>e.engineer_id===viewEngId).length===0&&
                        <tr><td colSpan={7} style={{textAlign:"center",color:"#253a52",padding:20}}>No entries for {MONTHS[month]} {year}</td></tr>}
                      {monthEntries.filter(e=>e.engineer_id===viewEngId)
                        .sort((a,b)=>a.date.localeCompare(b.date))
                        .map(e=>{
                          const proj=projects.find(p=>p.id===e.project_id);
                          return(
                            <tr key={e.id}>
                              <td style={{fontFamily:"'IBM Plex Mono',monospace",fontSize:11}}>{e.date}</td>
                              <td style={{fontSize:11,color:"#38bdf8"}}>{proj?.id||<span style={{color:"#fb923c"}}>{e.leave_type}</span>}</td>
                              <td style={{fontSize:11,color:"#7a8faa"}}>{e.task_type||"—"}</td>
                              <td style={{fontSize:11,color:"#4e6479",fontStyle:"italic",maxWidth:200,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{e.activity||"—"}</td>
                              <td style={{fontFamily:"'IBM Plex Mono',monospace",color:"#38bdf8",fontWeight:700}}>{e.hours}h</td>
                              <td><span style={{fontSize:9,padding:"2px 6px",borderRadius:3,background:e.entry_type==="leave"?"#7c2d1230":"#022c2230",color:e.entry_type==="leave"?"#fb923c":"#34d399",fontWeight:700}}>{e.entry_type}</span></td>
                              <td>
                                <div style={{display:"flex",gap:5}}>
                                  <button className="be" onClick={()=>setEditEntry({...e,projectId:e.project_id,type:e.entry_type})}>✎</button>
                                  <button className="bd" onClick={()=>deleteEntry(e.id)}>✕</button>
                                </div>
                              </td>
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
                          {isAdmin&&<><button className="be" style={{fontSize:10}} onClick={()=>setEditProjModal({...p})}>✎</button>
                          <button className="bd" style={{fontSize:10}} onClick={()=>deleteProject(p.id)}>✕</button></>}
                        </div>
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
              <h1 style={{fontSize:21,fontWeight:700,color:"#f0f6ff",marginBottom:18}}>Team — {engineers.length} Engineers</h1>
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
                    <div style={{fontSize:10,display:"flex",justifyContent:"space-between",color:"#4e6479",paddingBottom:6}}>
                      <span>Bill: <span style={{color:"#a78bfa",fontWeight:600}}>{fmtPct(eng.billability)}</span></span>
                      {eng.leaveDays>0&&<span style={{color:"#fb923c"}}>✈{eng.leaveDays}d</span>}
                    </div>
                    <div style={{fontSize:11,fontFamily:"'IBM Plex Mono',monospace",color:"#34d399",marginBottom:5}}>{fmtCurrency(eng.revenue)}</div>
                    <div style={{fontSize:9,padding:"1px 6px",borderRadius:3,background:"#152639",color:"#4e6479",display:"inline-block"}}>{eng.level}</div>
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
                <p style={{color:"#2e4a66",fontSize:12,marginTop:3}}>{MONTHS[month]} {year} — Select report then export to PDF</p>
              </div>
              <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:10,marginBottom:18}}>
                {[{id:"utilization",icon:"◉",label:"Utilization",desc:"Individual & team utilization + billability"},
                  {id:"billable",icon:"$",label:"Billable & Revenue",desc:"Revenue per project & engineer"},
                  {id:"task",icon:"⊟",label:"Task Analysis",desc:"Task categories, activity log"},
                  {id:"monthly",icon:"⊞",label:"Monthly Mgmt",desc:"Full executive summary for HQ"},
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
                <span style={{fontSize:11,color:"#2e4a66",alignSelf:"center"}}>Opens print dialog → Save as PDF</span>
              </div>
              {activeRpt==="utilization"&&(
                <div className="card">
                  <h3 style={{fontSize:12,fontWeight:600,color:"#7a8faa",marginBottom:12}}>Utilization Preview</h3>
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
              {activeRpt==="task"&&(
                <div className="card">
                  <h3 style={{fontSize:12,fontWeight:600,color:"#7a8faa",marginBottom:12}}>Task Categories</h3>
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
              {(activeRpt==="billable"||activeRpt==="monthly")&&(
                <div className="card" style={{textAlign:"center",padding:40}}>
                  <div style={{fontSize:36,marginBottom:10}}>📊</div>
                  <div style={{fontSize:14,fontWeight:700,marginBottom:6}}>Ready to Export</div>
                  <div style={{fontSize:12,color:"#2e4a66"}}>Click "Export PDF" above to generate the full formatted report.</div>
                </div>
              )}
            </div>
          )}

          {/* ════ ADMIN PANEL ════ */}
          {view==="admin"&&isAdmin&&(
            <div>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:20}}>
                <div>
                  <h1 style={{fontSize:21,fontWeight:700,color:"#f0f6ff"}}>Admin Panel</h1>
                  <p style={{color:"#2e4a66",fontSize:12,marginTop:3}}>Full control — engineers, projects, entries, notifications</p>
                </div>
                {unreadCount>0&&<button className="bg" onClick={markAllRead}>Mark all {unreadCount} notifications read</button>}
              </div>

              {/* Notifications */}
              {notifications.filter(n=>!n.read).length>0&&(
                <div style={{marginBottom:18}}>
                  <h3 style={{fontSize:12,fontWeight:700,color:"#fb923c",marginBottom:10,display:"flex",alignItems:"center",gap:8}}>
                    <span>🔔</span> New Notifications ({unreadCount})
                  </h3>
                  {notifications.filter(n=>!n.read).map(n=>(
                    <div key={n.id} style={{background:"#1a0a00",border:"1px solid #fb923c40",borderRadius:8,padding:"10px 14px",marginBottom:8,display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                      <div>
                        <div style={{fontSize:12,fontWeight:600,color:"#fb923c"}}>{n.message}</div>
                        <div style={{fontSize:10,color:"#2e4a66",marginTop:3}}>{new Date(n.created_at).toLocaleString()}</div>
                      </div>
                      <span style={{fontSize:9,padding:"2px 7px",borderRadius:3,background:"#fb923c20",color:"#fb923c",fontFamily:"'IBM Plex Mono',monospace",fontWeight:700}}>{n.type}</span>
                    </div>
                  ))}
                </div>
              )}

              {/* Tabs */}
              <div style={{display:"flex",gap:4,marginBottom:18,background:"#060e1c",borderRadius:8,padding:4,width:"fit-content"}}>
                {[{id:"engineers",label:"👥 Engineers"},{id:"projects",label:"◈ Projects"},{id:"entries",label:"⏱ All Entries"}].map(t=>(
                  <button key={t.id} className={`atab ${adminTab===t.id?"a":""}`} onClick={()=>setAdminTab(t.id)}>{t.label}</button>
                ))}
              </div>

              {/* ── ADMIN: ENGINEERS ── */}
              {adminTab==="engineers"&&(
                <div className="card">
                  <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:14}}>
                    <h3 style={{fontSize:13,fontWeight:600,color:"#7a8faa"}}>Engineers ({engineers.length})</h3>
                    <button className="bp" onClick={()=>setShowEngModal(true)}>+ Add Engineer</button>
                  </div>
                  <table>
                    <thead><tr><th>Name</th><th>Role</th><th>Level</th><th>Email</th><th>Access</th><th>Month Hrs</th><th style={{width:100}}>Actions</th></tr></thead>
                    <tbody>{engineers.map(eng=>{
                      const es=engStats.find(e=>e.id===eng.id);
                      return(
                        <tr key={eng.id}>
                          <td><div style={{display:"flex",alignItems:"center",gap:8}}><div className="av" style={{fontSize:9,width:26,height:26}}>{eng.name?.slice(0,2).toUpperCase()}</div><span style={{fontWeight:500}}>{eng.name}</span></div></td>
                          <td style={{color:"#7a8faa"}}>{eng.role}</td>
                          <td><span style={{fontSize:9,padding:"2px 6px",borderRadius:3,background:"#152639",color:"#4e6479"}}>{eng.level}</span></td>
                          <td style={{color:"#4e6479",fontSize:11}}>{eng.email||"—"}</td>
                          <td><span style={{fontSize:9,padding:"2px 6px",borderRadius:3,fontWeight:700,background:eng.role_type==="admin"?"#1e1b4b":"#060e1c",color:eng.role_type==="admin"?"#a78bfa":"#4e6479"}}>{eng.role_type}</span></td>
                          <td style={{fontFamily:"'IBM Plex Mono',monospace",color:"#38bdf8"}}>{es?.workHrs||0}h</td>
                          <td><div style={{display:"flex",gap:5}}>
                            <button className="be" onClick={()=>setEditEngModal({...eng})}>✎ Edit</button>
                            <button className="bd" onClick={()=>deleteEngineer(eng.id)}>✕</button>
                          </div></td>
                        </tr>
                      );
                    })}</tbody>
                  </table>
                </div>
              )}

              {/* ── ADMIN: PROJECTS ── */}
              {adminTab==="projects"&&(
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
                          <button className="be" onClick={()=>setEditProjModal({...p})}>✎ Edit</button>
                          <button className="bd" onClick={()=>deleteProject(p.id)}>✕</button>
                        </div></td>
                      </tr>
                    ))}</tbody>
                  </table>
                </div>
              )}

              {/* ── ADMIN: ALL ENTRIES ── */}
              {adminTab==="entries"&&(
                <div>
                  <div className="card" style={{marginBottom:14}}>
                    <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:12}}>
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
                      <span style={{fontSize:11,color:"#2e4a66",fontFamily:"'IBM Plex Mono',monospace"}}>
                        Total: {adminBrowseEntries.reduce((s,e)=>s+e.hours,0)}h
                      </span>
                    </div>
                    <div style={{maxHeight:500,overflowY:"auto"}}>
                      <table>
                        <thead><tr><th>Date</th><th>Engineer</th><th>Project</th><th>Task</th><th>Activity</th><th>Hrs</th><th>Type</th><th style={{width:90}}>Actions</th></tr></thead>
                        <tbody>
                          {adminBrowseEntries.length===0&&<tr><td colSpan={8} style={{textAlign:"center",color:"#253a52",padding:20}}>No entries found</td></tr>}
                          {adminBrowseEntries.map(e=>{
                            const eng=engineers.find(x=>x.id===e.engineer_id);
                            const proj=projects.find(x=>x.id===e.project_id);
                            return(
                              <tr key={e.id}>
                                <td style={{fontFamily:"'IBM Plex Mono',monospace",fontSize:11}}>{e.date}</td>
                                <td style={{fontSize:11}}>{eng?.name||"—"}</td>
                                <td style={{fontFamily:"'IBM Plex Mono',monospace",fontSize:11,color:"#38bdf8"}}>{proj?.id||<span style={{color:"#fb923c"}}>{e.leave_type}</span>}</td>
                                <td style={{fontSize:10,color:"#7a8faa"}}>{e.task_type||"—"}</td>
                                <td style={{fontSize:10,color:"#4e6479",fontStyle:"italic",maxWidth:160,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{e.activity||"—"}</td>
                                <td style={{fontFamily:"'IBM Plex Mono',monospace",color:"#38bdf8",fontWeight:700}}>{e.hours}h</td>
                                <td><span style={{fontSize:9,padding:"2px 5px",borderRadius:3,background:e.entry_type==="leave"?"#7c2d1230":"#022c2230",color:e.entry_type==="leave"?"#fb923c":"#34d399",fontWeight:700}}>{e.entry_type}</span></td>
                                <td><div style={{display:"flex",gap:4}}>
                                  <button className="be" style={{fontSize:10}} onClick={()=>setEditEntry({...e,projectId:e.project_id,type:e.entry_type})}>✎</button>
                                  <button className="bd" style={{fontSize:10}} onClick={()=>deleteEntry(e.id)}>✕</button>
                                </div></td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
          </>}
        </div>
      </div>

      {/* ════ MODAL: ADD ENTRY ════ */}
      {modalDate&&(
        <div className="modal-ov" onClick={()=>setModalDate(null)}>
          <div className="modal" onClick={e=>e.stopPropagation()}>
            <h3 style={{fontSize:15,fontWeight:700,marginBottom:4}}>Post Hours</h3>
            <p style={{fontSize:11,color:"#2e4a66",marginBottom:18,fontFamily:"'IBM Plex Mono',monospace"}}>
              {new Date(modalDate).toLocaleDateString("en-US",{weekday:"long",year:"numeric",month:"long",day:"numeric"})}
              {isAdmin&&viewEng&&<span> · {viewEng.name}</span>}
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

      {/* ════ MODAL: EDIT ENTRY ════ */}
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
                    <select value={editEntry.task_category||"Engineering"} onChange={e=>setEditEntry(p=>({...p,task_category:e.target.value,task_type:TASK_CATEGORIES[e.target.value][0]}))}>
                      {Object.keys(TASK_CATEGORIES).map(c=><option key={c}>{c}</option>)}
                    </select>
                  </div>
                  <div><Lbl>Task Type</Lbl>
                    <select value={editEntry.task_type||""} onChange={e=>setEditEntry(p=>({...p,task_type:e.target.value}))}>
                      {(TASK_CATEGORIES[editEntry.task_category||"Engineering"]||[]).map(t=><option key={t}>{t}</option>)}
                    </select>
                  </div>
                </div>
                <div><Lbl>Hours</Lbl><input type="number" min=".5" max="12" step=".5" value={editEntry.hours} onChange={e=>setEditEntry(p=>({...p,hours:+e.target.value}))}/></div>
                <div><Lbl>Activity Description</Lbl>
                  <textarea rows={3} value={editEntry.activity||""} onChange={e=>setEditEntry(p=>({...p,activity:e.target.value}))} style={{resize:"vertical"}}/>
                </div>
              </>:(
                <div><Lbl>Leave Type</Lbl>
                  <select value={editEntry.leave_type||LEAVE_TYPES[0]} onChange={e=>setEditEntry(p=>({...p,leave_type:e.target.value}))}>
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

      {/* ════ MODAL: NEW PROJECT ════ */}
      {showProjModal&&(
        <div className="modal-ov" onClick={()=>setShowProjModal(false)}>
          <div className="modal" onClick={e=>e.stopPropagation()}>
            <h3 style={{fontSize:15,fontWeight:700,marginBottom:18}}>New Project</h3>
            <div style={{display:"grid",gap:11}}>
              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}>
                <div><Lbl>Project Number (e.g. EC-2025-009)</Lbl><input value={newProj.id} onChange={e=>setNewProj(p=>({...p,id:e.target.value}))} placeholder="EC-2025-009"/></div>
                <div><Lbl>Status</Lbl>
                  <select value={newProj.status} onChange={e=>setNewProj(p=>({...p,status:e.target.value}))}>
                    {["Active","On Hold","Completed"].map(s=><option key={s}>{s}</option>)}
                  </select>
                </div>
              </div>
              <div><Lbl>Project Name</Lbl><input value={newProj.name} onChange={e=>setNewProj(p=>({...p,name:e.target.value}))} placeholder="e.g. Solar Farm Automation – Aswan"/></div>
              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}>
                <div><Lbl>Type</Lbl>
                  <select value={newProj.type} onChange={e=>setNewProj(p=>({...p,type:e.target.value}))}>
                    <option>Renewable Energy</option><option>Industrial</option>
                  </select>
                </div>
                <div><Lbl>Phase</Lbl>
                  <select value={newProj.phase} onChange={e=>setNewProj(p=>({...p,phase:e.target.value}))}>
                    {PHASES.map(ph=><option key={ph}>{ph}</option>)}
                  </select>
                </div>
              </div>
              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}>
                <div><Lbl>Client</Lbl><input value={newProj.client} onChange={e=>setNewProj(p=>({...p,client:e.target.value}))}/></div>
                <div><Lbl>Origin (HQ / BU)</Lbl><input value={newProj.origin} onChange={e=>setNewProj(p=>({...p,origin:e.target.value}))}/></div>
              </div>
              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}>
                <div><Lbl>Billable?</Lbl>
                  <select value={newProj.billable?"yes":"no"} onChange={e=>setNewProj(p=>({...p,billable:e.target.value==="yes"}))}>
                    <option value="yes">Yes — Billable</option><option value="no">No — Internal</option>
                  </select>
                </div>
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

      {/* ════ MODAL: EDIT PROJECT ════ */}
      {editProjModal&&(
        <div className="modal-ov" onClick={()=>setEditProjModal(null)}>
          <div className="modal" onClick={e=>e.stopPropagation()}>
            <h3 style={{fontSize:15,fontWeight:700,marginBottom:18}}>Edit Project — {editProjModal.id}</h3>
            <div style={{display:"grid",gap:11}}>
              <div><Lbl>Project Name</Lbl><input value={editProjModal.name} onChange={e=>setEditProjModal(p=>({...p,name:e.target.value}))}/></div>
              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}>
                <div><Lbl>Status</Lbl>
                  <select value={editProjModal.status} onChange={e=>setEditProjModal(p=>({...p,status:e.target.value}))}>
                    {["Active","On Hold","Completed"].map(s=><option key={s}>{s}</option>)}
                  </select>
                </div>
                <div><Lbl>Phase</Lbl>
                  <select value={editProjModal.phase} onChange={e=>setEditProjModal(p=>({...p,phase:e.target.value}))}>
                    {PHASES.map(ph=><option key={ph}>{ph}</option>)}
                  </select>
                </div>
              </div>
              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}>
                <div><Lbl>Client</Lbl><input value={editProjModal.client||""} onChange={e=>setEditProjModal(p=>({...p,client:e.target.value}))}/></div>
                <div><Lbl>Origin</Lbl><input value={editProjModal.origin||""} onChange={e=>setEditProjModal(p=>({...p,origin:e.target.value}))}/></div>
              </div>
              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}>
                <div><Lbl>Billable?</Lbl>
                  <select value={editProjModal.billable?"yes":"no"} onChange={e=>setEditProjModal(p=>({...p,billable:e.target.value==="yes"}))}>
                    <option value="yes">Yes — Billable</option><option value="no">No — Internal</option>
                  </select>
                </div>
                <div><Lbl>Rate per Hour ($)</Lbl><input type="number" value={editProjModal.rate_per_hour} onChange={e=>setEditProjModal(p=>({...p,rate_per_hour:+e.target.value}))}/></div>
              </div>
              <div><Lbl>Type</Lbl>
                <select value={editProjModal.type} onChange={e=>setEditProjModal(p=>({...p,type:e.target.value}))}>
                  <option>Renewable Energy</option><option>Industrial</option>
                </select>
              </div>
            </div>
            <div style={{display:"flex",gap:10,marginTop:18,justifyContent:"flex-end"}}>
              <button className="bg" onClick={()=>setEditProjModal(null)}>Cancel</button>
              <button className="bp" onClick={saveEditProject}>Save Changes</button>
            </div>
          </div>
        </div>
      )}

      {/* ════ MODAL: ADD ENGINEER ════ */}
      {showEngModal&&(
        <div className="modal-ov" onClick={()=>setShowEngModal(false)}>
          <div className="modal" onClick={e=>e.stopPropagation()}>
            <h3 style={{fontSize:15,fontWeight:700,marginBottom:18}}>Add Engineer</h3>
            <div style={{display:"grid",gap:11}}>
              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}>
                <div><Lbl>Full Name</Lbl><input value={newEng.name} onChange={e=>setNewEng(p=>({...p,name:e.target.value}))}/></div>
                <div><Lbl>Level</Lbl>
                  <select value={newEng.level} onChange={e=>setNewEng(p=>({...p,level:e.target.value}))}>
                    {LEVELS.map(l=><option key={l}>{l}</option>)}
                  </select>
                </div>
              </div>
              <div><Lbl>Job Role</Lbl>
                <select value={newEng.role} onChange={e=>setNewEng(p=>({...p,role:e.target.value}))}>
                  {ROLES_LIST.map(r=><option key={r}>{r}</option>)}
                </select>
              </div>
              <div><Lbl>Email (must match their signup email)</Lbl><input type="email" value={newEng.email} onChange={e=>setNewEng(p=>({...p,email:e.target.value}))}/></div>
              <div><Lbl>Access Level</Lbl>
                <select value={newEng.role_type} onChange={e=>setNewEng(p=>({...p,role_type:e.target.value}))}>
                  <option value="engineer">Engineer</option><option value="admin">Admin</option>
                </select>
              </div>
            </div>
            <div style={{display:"flex",gap:10,marginTop:18,justifyContent:"flex-end"}}>
              <button className="bg" onClick={()=>setShowEngModal(false)}>Cancel</button>
              <button className="bp" onClick={addEngineer}>Add Engineer</button>
            </div>
          </div>
        </div>
      )}

      {/* ════ MODAL: EDIT ENGINEER ════ */}
      {editEngModal&&(
        <div className="modal-ov" onClick={()=>setEditEngModal(null)}>
          <div className="modal" onClick={e=>e.stopPropagation()}>
            <h3 style={{fontSize:15,fontWeight:700,marginBottom:18}}>Edit Engineer — {editEngModal.name}</h3>
            <div style={{display:"grid",gap:11}}>
              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}>
                <div><Lbl>Full Name</Lbl><input value={editEngModal.name||""} onChange={e=>setEditEngModal(p=>({...p,name:e.target.value}))}/></div>
                <div><Lbl>Level</Lbl>
                  <select value={editEngModal.level||"Mid"} onChange={e=>setEditEngModal(p=>({...p,level:e.target.value}))}>
                    {LEVELS.map(l=><option key={l}>{l}</option>)}
                  </select>
                </div>
              </div>
              <div><Lbl>Job Role</Lbl>
                <select value={editEngModal.role||""} onChange={e=>setEditEngModal(p=>({...p,role:e.target.value}))}>
                  {ROLES_LIST.map(r=><option key={r}>{r}</option>)}
                </select>
              </div>
              <div><Lbl>Email</Lbl><input type="email" value={editEngModal.email||""} onChange={e=>setEditEngModal(p=>({...p,email:e.target.value}))}/></div>
              <div><Lbl>Access Level</Lbl>
                <select value={editEngModal.role_type||"engineer"} onChange={e=>setEditEngModal(p=>({...p,role_type:e.target.value}))}>
                  <option value="engineer">Engineer</option><option value="admin">Admin</option>
                </select>
              </div>
            </div>
            <div style={{display:"flex",gap:10,marginTop:18,justifyContent:"flex-end"}}>
              <button className="bg" onClick={()=>setEditEngModal(null)}>Cancel</button>
              <button className="bp" onClick={saveEditEngineer}>Save Changes</button>
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
