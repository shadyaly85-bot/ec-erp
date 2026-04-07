import React, { useState, useEffect, useMemo, useCallback } from "react";
import { supabase } from "./supabase";
import { LEAVE_TYPES, FUNCTION_CATS, FUNC_COLORS, MONTHS, PHASES, LEVELS, ROLES_LIST, ROLE_TYPES, ROLE_LABELS, ROLE_COLORS, isBillableRole, DAY_NAMES, DEFAULT_WEEKEND, fmt, today, fmtCurrency, fmtPct, getWeekDays7, getWorkDaysInMonth, getTargetHrs, minPostDate, maxPostDate, isDateAllowed } from './constants.js';

import { fmtEGP, fmtEGPsigned, JournalLedger, BalanceSheetView, ExpensesView, CashCustodyView, TaxSocialView, FixedAssetsView, FinanceReports, AccountantGuide, ActivityLogTab, FinanceTab } from './components/FinanceTab.jsx';
import { LOGO_SRC, LogoImg, PDF_STYLE, pdfHeader, pdfFooter, generatePDF, buildVacationPDF, buildTimesheetPDF, buildInvoicePDF, buildProjectTasksPDF, buildFinancePDF, buildAllProjectsPDF } from './pdfHelpers.jsx';
import { ActivityEditModal, AddActivityModal } from './components/ActivityModals.jsx';
import { ActivityRow, ProjectTracker } from './components/ProjectTracker.jsx';
function applyUndo(showToast, label, removeUI, restoreUI, dbDelete, logFn){
  removeUI();
  let undone = false;
  showToast(label + " â€” Undo?", false, ()=>{
    undone = true;
    restoreUI();
    showToast("Undo successful âœ“");
  });
  setTimeout(async()=>{
    if(undone) return;
    const err = await dbDelete();
    if(err){ restoreUI(); showToast("Delete failed â€” restored", false); }
    else logFn?.();
  }, 3100);
}

/* â”€â”€ CONFIRM DIALOG â€” replaces window.confirm everywhere â”€â”€ */
function ConfirmModal({dlg}){
  React.useEffect(()=>{
    if(!dlg) return;
    const handle=e=>{ if(e.key==="Escape") dlg.onCancel&&dlg.onCancel(); };
    window.addEventListener("keydown",handle);
    return()=>window.removeEventListener("keydown",handle);
  },[dlg]);
  if(!dlg) return null;
  return(
    <div style={{position:"fixed",inset:0,background:"#00000099",backdropFilter:"blur(6px)",zIndex:2000,display:"flex",alignItems:"center",justifyContent:"center"}}
      onClick={e=>{if(e.target===e.currentTarget)dlg.onCancel&&dlg.onCancel();}}>
      <div style={{background:"var(--bg1)",border:`1px solid ${dlg.danger?"#f8711860":"var(--border3)"}`,borderRadius:12,padding:"28px 28px 22px",width:390,maxWidth:"92vw",boxShadow:"0 24px 60px #00000090"}}>
        <div style={{fontSize:22,marginBottom:8,lineHeight:1}}>{dlg.icon||"âڑ "}</div>
        <div style={{fontSize:15,fontWeight:700,color:"var(--text0)",marginBottom:8}}>{dlg.title||"Are you sure?"}</div>
        <div style={{fontSize:13,color:"var(--text3)",marginBottom:24,lineHeight:1.6}}>{dlg.message}</div>
        <div style={{display:"flex",gap:10,justifyContent:"flex-end"}}>
          <button className="bg" style={{padding:"8px 22px",fontSize:14}} onClick={()=>dlg.onCancel&&dlg.onCancel()}>Cancel</button>
          <button onClick={()=>dlg.onConfirm&&dlg.onConfirm()}
            style={{padding:"8px 22px",borderRadius:6,border:"none",cursor:"pointer",
              fontFamily:"'IBM Plex Sans',sans-serif",fontSize:14,fontWeight:700,
              background:dlg.danger?"#dc2626":"var(--accent)",color:"#fff"}}>
            {dlg.confirmLabel||"Confirm"}
          </button>
        </div>
      </div>
    </div>
  );
}

function SignupScreen({onBack}){
  const [form,setForm]=useState({email:"",password:"",name:"",role:ROLES_LIST[0],level:"Mid"});
  const [err,setErr]=useState(""); const [loading,setLoading]=useState(false);
  const handle=async e=>{
    e.preventDefault(); setErr(""); setLoading(true);
    if(!form.name.trim()){setErr("Please enter your full name.");setLoading(false);return;}
    const {data,error}=await supabase.auth.signUp({email:form.email,password:form.password});
    if(error){setErr(error.message);setLoading(false);return;}
    if(data.user){
      // New accounts always get 'engineer' â€” only admin can upgrade later
      await supabase.from("engineers").insert({
        user_id:data.user.id,name:form.name.trim(),role:form.role,
        level:form.level,email:form.email,role_type:"engineer",
        weekend_days:JSON.stringify(DEFAULT_WEEKEND)
      });
      // Only insert signup notification if not already present (avoid duplicates on re-register attempts)
      const {data:existingSignup}=await supabase.from("notifications").select("id")
        .eq("type","new_signup").ilike("message",`%${form.email}%`).maybeSingle();
      if(!existingSignup){
        await supabase.from("notifications").insert({
          type:"new_signup",message:`New engineer signed up: ${form.name} (${form.role})`,
          meta:JSON.stringify({email:form.email,role:form.role,level:form.level}),read:false
        });
      }
    }
    setErr("âœ“ Account created! Check your email to confirm, then sign in.");
    setLoading(false);
  };
  return(
    <div style={{display:"grid",gap:11}}>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}>
        <div><Lbl>Full Name</Lbl><input value={form.name} onChange={e=>setForm(p=>({...p,name:e.target.value}))} placeholder="Ahmed Hassan"/></div>
        <div><Lbl>Level</Lbl><select value={form.level} onChange={e=>setForm(p=>({...p,level:e.target.value}))}>{LEVELS.map(l=><option key={l}>{l}</option>)}</select></div>
      </div>
      <div><Lbl>Job Title</Lbl>
        <select value={form.role} onChange={e=>setForm(p=>({...p,role:e.target.value}))}>
          {ROLES_LIST.map(r=><option key={r}>{r}</option>)}
        </select>
      </div>
      <div><Lbl>Email</Lbl><input type="email" value={form.email} onChange={e=>setForm(p=>({...p,email:e.target.value}))} placeholder="you@company.com"/></div>
      <div><Lbl>Password</Lbl><input type="password" value={form.password} onChange={e=>setForm(p=>({...p,password:e.target.value}))} placeholder="Min 6 characters"/></div>
      <div style={{background:"var(--bg3)",border:"1px solid #0ea5e930",borderRadius:6,padding:"8px 12px",fontSize:13,color:"var(--info)"}}>
        â„¹ Account role is set to <strong>Engineer</strong> by default. Your admin can upgrade your access level after registration.
      </div>
      {err&&<div style={{padding:"8px 12px",borderRadius:6,fontSize:14,background:err.startsWith("âœ“")?"var(--bg3)":"var(--err-bg)",color:err.startsWith("âœ“")?"#34d399":"#f87171",border:`1px solid ${err.startsWith("âœ“")?"#34d399":"#f87171"}`}}>{err}</div>}
      <button className="bp" onClick={handle} disabled={loading} style={{width:"100%",justifyContent:"center",padding:11}}>{loading?"Creatingâ€¦":"Create Account"}</button>
      <div style={{textAlign:"center",fontSize:14,color:"var(--text4)",cursor:"pointer"}} onClick={onBack}>â†گ Back to Sign In</div>
    </div>
  );
}

const Lbl=({children})=><div style={{fontSize:13,color:"var(--text3)",marginBottom:4}}>{children}</div>;

/* â•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گ
   MAIN APP
â•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گ */

/* â”€â”€ Projects Page Component (extracted to avoid IIFE hook issues) â”€â”€ */
/* â”€â”€ Edit Project Activities (standalone component â€” hooks-safe) â”€â”€ */
function ProjectsView({projects,projSearch,setProjSearch,projStatusFilter,setProjStatusFilter,
  monthEntries,projStats,isAdmin,isAcct,isLead,setShowProjModal,setEditProjModal,deleteProject,fmtCurrency,
  activities,setActivities,engineers,supabase,showToast,setProjects,showConfirm}){
  const [pvActModal,setPvActModal] = React.useState(null);
  const [pvActDraft,setPvActDraft] = React.useState({});
  const canManage = isAdmin||isLead; // accountant: read-only, cannot add/edit/delete projects

  // openPvAct: null act = add new, act = edit existing
  const openPvAct=(projId,act=null)=>{
    setPvActDraft(act?{...act}:{project_id:projId,group_name:"SCADA",category:"Templates",activity_name:"",status:"Not Started",progress:0,assigned_to:"",remarks:""});
    setPvActModal({projId,act});
  };
  // savePvAct for edit (add goes through AddActivityModal.onSave)
  const savePvAct=async(draft)=>{
    const d=draft||pvActDraft;
    if(!d.activity_name?.trim()){if(showToast)showToast("Activity name required",false);return;}
    const{id,...fields}=d;
    const payload={...fields,group_name:CAT_TO_GROUP[fields.category]||fields.group_name||"SCADA"};
    if(id){
      const{data,error}=await supabase.from("project_activities").update(payload).eq("id",id).select().single();
      if(error){if(showToast)showToast("Error: "+error.message,false);return;}
      if(setActivities)setActivities(prev=>prev.map(a=>a.id===data.id?data:a));
    }else{
      const{data,error}=await supabase.from("project_activities").insert({...payload,project_id:d.project_id}).select().single();
      if(error){if(showToast)showToast("Error: "+error.message,false);return;}
      if(setActivities)setActivities(prev=>[...prev,data]);
    }
    setPvActModal(null);
    if(showToast)showToast("Activity saved âœ“");
  };
  // confirmPvAdd: called from AddActivityModal
  const confirmPvAdd=async({category,activity_name,start_date,end_date,assigned_to})=>{
    if(!pvActModal) return;
    const grp=CAT_TO_GROUP[category]||"General";
    const{data,error}=await supabase.from("project_activities").insert({
      project_id:pvActModal.projId,
      group_name:grp, category:category||null,
      activity_name, status:"Not Started", progress:0,
      start_date:start_date||null, end_date:end_date||null,
      assigned_to:assigned_to||null,
    }).select().single();
    if(error){if(showToast)showToast("Error: "+error.message,false);return;}
    if(setActivities)setActivities(prev=>[...prev,data]);
    // Auto-assign engineer to project if not already assigned
    if(assigned_to){
      const eng=(engineers||[]).find(e=>e.name===assigned_to);
      if(eng){
        const proj=projects.find(p=>p.id===pvActModal.projId);
        const ae=(proj?.assigned_engineers||[]).map(String);
        if(!ae.includes(String(eng.id))){
          const newAe=[...ae,String(eng.id)];
          await supabase.from("projects").update({assigned_engineers:newAe}).eq("id",pvActModal.projId);
          if(setProjects)setProjects(prev=>prev.map(p=>p.id===pvActModal.projId?{...p,assigned_engineers:newAe}:p));
        }
      }
    }
    setPvActModal(null);
    if(showToast)showToast("Activity added âœ“");
  };
  const delPvAct=async(id)=>{
    const act=(activities||[]).find(a=>a.id===id);
    showConfirm("Delete this activity?",()=>{
      applyUndo(
        showToast,"Activity deleted",
        ()=>{ if(setActivities)setActivities(prev=>prev.filter(a=>a.id!==id)); },
        ()=>{ if(setActivities&&act)setActivities(prev=>[act,...prev]); },
        async()=>{ const{error}=await supabase.from("project_activities").delete().eq("id",id); return error||null; },
        null
      );
    },{title:"Delete Activity",confirmLabel:"Delete"});
  };
  const filteredProjects=projects.filter(p=>{
    const ms=projStatusFilter==="ALL"||p.status===projStatusFilter;
    const mq=!projSearch||p.name.toLowerCase().includes(projSearch.toLowerCase())||
      p.id.toLowerCase().includes(projSearch.toLowerCase())||
      (p.client||"").toLowerCase().includes(projSearch.toLowerCase());
    return ms&&mq;
  });
  return(
    <div>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-end",marginBottom:18,flexWrap:"wrap",gap:12}}>
        <div>
          <div style={{fontSize:11,fontWeight:700,color:"var(--text4)",textTransform:"uppercase",letterSpacing:".1em",marginBottom:4}}>PROJECT PORTFOLIO</div>
          <h1 style={{fontSize:26,fontWeight:800,color:"var(--text0)",lineHeight:1}}>Projects</h1>
          <p style={{color:"var(--text4)",fontSize:14,marginTop:3}}>{filteredProjects.length} of {projects.length} projects</p>
        </div>
        <div style={{display:"flex",gap:8,alignItems:"flex-end",flexWrap:"wrap"}}>
          {/* Search */}
          <div>
            <div style={{fontSize:12,color:"var(--text4)",fontWeight:700,textTransform:"uppercase",letterSpacing:".06em",marginBottom:5}}>SEARCH</div>
            <input value={projSearch} onChange={e=>setProjSearch(e.target.value)}
              placeholder="Name, ID, clientâ€¦" style={{width:180}}/>
          </div>
          {/* Status chips */}
          <div>
            <div style={{fontSize:12,color:"var(--text4)",fontWeight:700,textTransform:"uppercase",letterSpacing:".06em",marginBottom:5}}>STATUS</div>
            <div style={{display:"flex",gap:4}}>
              {[
                {v:"ALL",     l:"All",       c:"var(--text2)"},
                {v:"Active",  l:"Active",    c:"#34d399"},
                {v:"On Hold", l:"On Hold",   c:"#fb923c"},
                {v:"Completed",l:"Done",     c:"#a78bfa"},
              ].map(chip=>{
                const cnt=chip.v==="ALL"?projects.length:projects.filter(p=>p.status===chip.v).length;
                const active=projStatusFilter===chip.v;
                return(
                  <button key={chip.v} onClick={()=>setProjStatusFilter(chip.v)}
                    style={{padding:"6px 12px",borderRadius:20,border:`1px solid ${active?chip.c+"90":"var(--border)"}`,
                      background:active?chip.c+"18":"transparent",color:active?chip.c:"var(--text3)",
                      fontSize:13,fontWeight:active?700:500,cursor:"pointer",fontFamily:"'IBM Plex Sans',sans-serif",
                      display:"flex",alignItems:"center",gap:5,transition:"all .15s",whiteSpace:"nowrap"}}>
                    {chip.l}
                    <span style={{fontSize:11,fontFamily:"'IBM Plex Mono',monospace",opacity:.8}}>{cnt}</span>
                  </button>
                );
              })}
            </div>
          </div>
          {isAdmin&&<button className="bp" style={{fontSize:14,padding:"8px 14px"}} onClick={()=>setShowProjModal(true)}>+ New Project</button>}
        </div>
      </div>
      {filteredProjects.length===0&&<div style={{textAlign:"center",padding:60,color:"var(--text4)",fontSize:15}}>No projects match your filter.</div>}
      <div style={{display:"grid",gridTemplateColumns:"repeat(2,1fr)",gap:12}}>
        {filteredProjects.map(p=>{
          const ps=projStats.find(x=>x.id===p.id);
          const topTasks=Object.entries(
            monthEntries.filter(e=>e.project_id===p.id&&e.entry_type==="work")
              .reduce((acc,e)=>{acc[e.task_type||"Other"]=(acc[e.task_type||"Other"]||0)+e.hours;return acc;},{})
          ).sort((a,b)=>b[1]-a[1]).slice(0,3);
          return(
            <div key={p.id} style={{background:"var(--bg1)",border:"1px solid var(--border3)",borderRadius:10,padding:16,borderLeft:`3px solid ${p.type==="Renewable Energy"?"#34d399":"#818cf8"}`}}>
              <div style={{display:"flex",justifyContent:"space-between",marginBottom:8}}>
                <div>
                  <div style={{fontSize:15,fontWeight:700,lineHeight:1.3,color:"var(--text0)"}}>{p.name||p.id}</div>
                  <div style={{fontFamily:"'IBM Plex Mono',monospace",fontSize:12,color:"var(--info)",marginTop:1}}>{p.id}</div>
                </div>
                <div style={{display:"flex",gap:5,alignItems:"flex-start"}}>
                  <span style={{fontSize:12,padding:"2px 7px",borderRadius:3,fontFamily:"'IBM Plex Mono',monospace",fontWeight:700,
                    background:p.status==="Active"?"#05603a30":p.status==="On Hold"?"#7c2d1230":"var(--border)",
                    color:p.status==="Active"?"#34d399":p.status==="On Hold"?"#fb923c":"#60a5fa"}}>{p.status}</span>
                  {canManage&&<button style={{background:"#0ea5e9",border:"none",borderRadius:4,padding:"2px 6px",color:"#fff",fontSize:13,cursor:"pointer"}} onClick={()=>setEditProjModal({...p})}>âœژ</button>}
                  {isAdmin&&<button style={{background:"#ef4444",border:"none",borderRadius:4,padding:"2px 6px",color:"#fff",fontSize:13,cursor:"pointer"}} onClick={()=>deleteProject(p.id)}>âœ•</button>}
                </div>
              </div>
              {/* Tracker completion bar */}
              {(()=>{
                const pActs=(activities||[]).filter(a=>a.project_id===p.id);
                if(!pActs.length) return null;
                const pct=Math.round(pActs.reduce((s,a)=>s+(a.progress||0),0)/pActs.length*100);
                const done=pActs.filter(a=>a.status==="Completed").length;
                const barColor=pct===100?"#34d399":pct>=60?"var(--info)":"#fb923c";
                return(
                  <div style={{marginBottom:10}}>
                    <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:3}}>
                      <span style={{fontSize:12,color:"var(--text4)"}}>Tracker Progress آ· {done}/{pActs.length} activities</span>
                      <span style={{fontFamily:"'IBM Plex Mono',monospace",fontSize:13,fontWeight:700,color:barColor}}>{pct}%</span>
                    </div>
                    <div style={{background:"var(--bg3)",height:5,borderRadius:3,overflow:"hidden"}}>
                      <div style={{height:"100%",width:`${pct}%`,background:barColor,borderRadius:3,transition:"width .4s"}}/>
                    </div>
                  </div>
                );
              })()}
              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:5,fontSize:13,marginBottom:10,color:"var(--text1)"}}>
                {p.pm&&<div><span style={{color:"var(--text4)"}}>PM: </span><span style={{color:"#a78bfa",fontWeight:600}}>{p.pm}</span></div>}
                {p.client&&<div><span style={{color:"var(--text4)"}}>Client: </span>{p.client}</div>}
                {p.origin&&<div><span style={{color:"var(--text4)"}}>Origin: </span>{p.origin}</div>}
                <div><span style={{color:"var(--text4)"}}>Phase: </span><span style={{color:"#60a5fa"}}>{p.phase||"â€”"}</span></div>
                {(isAdmin||isAcct)&&<div><span style={{color:"var(--text4)"}}>Rate: </span>
                  <span style={{fontFamily:"'IBM Plex Mono',monospace",color:p.billable?"#a78bfa":"var(--text4)"}}>
                    {p.billable?`$${p.rate_per_hour}/h`:"Non-Billable"}
                  </span>
                </div>}
              </div>
              {topTasks.length>0&&<div style={{background:"var(--bg2)",borderRadius:5,padding:"6px 9px",marginBottom:10}}>
                {topTasks.map(([task,hrs])=>(
                  <div key={task} style={{display:"flex",justifyContent:"space-between",fontSize:13,marginBottom:2}}>
                    <span style={{color:"var(--text2)"}}>{task}</span>
                    <span style={{fontFamily:"'IBM Plex Mono',monospace",color:"var(--info)"}}>{hrs}h</span>
                  </div>
                ))}
              </div>}
              <div style={{paddingTop:9,borderTop:"1px solid var(--border3)"}}>
                <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                  <div>
                    <div style={{fontFamily:"'IBM Plex Mono',monospace",fontSize:18,fontWeight:700,color:"var(--info)"}}>{ps?.hours||0}h</div>
                    {(isAdmin||isAcct)&&p.billable&&<div style={{fontSize:13,color:"#a78bfa"}}>{fmtCurrency(ps?.revenue||0)}</div>}
                  </div>
                  {canManage&&<button className="bp" style={{fontSize:12,padding:"2px 8px"}} onClick={()=>openPvAct(p.id)}>+ Activity</button>}
                </div>
                {/* Activities mini-list */}
                {canManage&&(()=>{
                  const pActs=(activities||[]).filter(a=>a.project_id===p.id);
                  if(!pActs.length) return null;
                  return(
                    <div style={{marginTop:8,display:"grid",gap:2}}>
                      {pActs.slice(0,5).map(a=>(
                        <div key={a.id} style={{display:"flex",justifyContent:"space-between",alignItems:"center",
                          background:"var(--bg2)",borderRadius:4,padding:"3px 7px",fontSize:12}}>
                          <span style={{color:"var(--text2)",flex:1,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{a.activity_name}</span>
                          <span style={{fontFamily:"'IBM Plex Mono',monospace",color:
                            a.status==="Completed"?"#34d399":a.status==="In Progress"?"var(--info)":"var(--text3)",
                            marginLeft:6,whiteSpace:"nowrap"}}>{Math.round((a.progress||0)*100)}%</span>
                          <button onClick={()=>openPvAct(p.id,a)} style={{background:"none",border:"none",color:"var(--text4)",cursor:"pointer",fontSize:13,padding:"0 3px"}}>âœژ</button>
                          <button onClick={()=>delPvAct(a.id)} style={{background:"none",border:"none",color:"var(--text4)",cursor:"pointer",fontSize:13,padding:"0 3px"}}>âœ•</button>
                        </div>
                      ))}
                      {pActs.length>5&&<div style={{fontSize:12,color:"var(--text4)",textAlign:"center"}}>+{pActs.length-5} more</div>}
                    </div>
                  );
                })()}
              </div>
            </div>
          );
        })}
      </div>

      {/* Activity Modal â€” reuses same AddActivityModal/ActivityEditModal as Tracker */}
      {pvActModal&&!pvActModal.act&&(
        <AddActivityModal
          projId={pvActModal.projId} subId={null} defaultCat={null}
          onSave={confirmPvAdd}
          onClose={()=>setPvActModal(null)}
          engineers={engineers}/>
      )}
      {pvActModal&&pvActModal.act&&(
        <ActivityEditModal
          act={pvActModal.act}
          onSave={savePvAct}
          onClose={()=>setPvActModal(null)}
          engineers={engineers}/>
      )}
    </div>
  );
}



/* â”€â”€ ProjectTasksReport Component â”€â”€ */
function ProjectTasksReport({allEntries,projects,engineers,MONTHS,fmtCurrency,fmtPct,isAdmin,isAcct}){
  const [selProj,setSelProj]=useState("ALL");
  // "ALL" means all-time, otherwise "YYYY-MM"
  const [filterMonth,setFilterMonth]=useState("ALL");

  const TASK_COLORS=["var(--info)","#a78bfa","#34d399","#fb923c","#f87171","#e879f9","#facc15","#4ade80","#f472b6","#60a5fa"];
  const PROJ_COLORS=["#0ea5e9","#a78bfa","#34d399","#fb923c","#f87171","#e879f9","#facc15","var(--info)"];

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
          <h2 style={{fontSize:18,fontWeight:700,color:"var(--text0)",margin:0}}>Project Tasks Analysis</h2>
          <p style={{fontSize:14,color:"var(--text4)",marginTop:4}}>
            {filterMonth==="ALL"?"All Time":filterMonth} آ· {projList.length} projects آ· {grandTotal}h total
          </p>
        </div>
        <div style={{display:"flex",gap:8,alignItems:"center",flexWrap:"wrap",justifyContent:"flex-end"}}>
          {/* Month filter */}
          <select value={filterMonth} onChange={e=>{setFilterMonth(e.target.value);setSelProj("ALL");}}
            style={{background:"var(--bg1)",border:"1px solid #38bdf840",borderRadius:6,padding:"6px 10px",color:"var(--info)",fontSize:14,fontFamily:"'IBM Plex Sans',sans-serif",fontWeight:600}}>
            <option value="ALL">All Time</option>
            {availableMonths.map(m=>{
              const [y,mo]=m.split("-");
              return <option key={m} value={m}>{MONTHS[parseInt(mo)-1]} {y}</option>;
            })}
          </select>
          {/* Project filter */}
          <select value={selProj} onChange={e=>setSelProj(e.target.value)}
            style={{background:"var(--bg1)",border:"1px solid var(--border3)",borderRadius:6,padding:"6px 10px",color:"var(--text0)",fontSize:14,fontFamily:"'IBM Plex Sans',sans-serif"}}>
            <option value="ALL">All Projects</option>
            {projList.map(x=><option key={x.proj.id} value={x.proj.id}>{x.proj.name} â€” {x.proj.id} ({x.totalHrs}h)</option>)}
          </select>
          {/* Export buttons */}
          {selProj==="ALL"
            ? <button className="bp" style={{whiteSpace:"nowrap"}} onClick={()=>{
                const label=filterMonth==="ALL"?"All Time":filterMonth;
                buildAllProjectsPDF(displayList,grandTotal,MONTHS,fmtCurrency,isAdmin,isAcct,label);
              }}>
                â¬‡ Export All ({projList.length})
              </button>
            : <button className="bp" onClick={()=>{
                const label=filterMonth==="ALL"?"All Time":filterMonth;
                const [fy,fm]=filterMonth!=="ALL"?filterMonth.split("-").map(Number):[null,null];
                const pm=displayList[0];
                if(pm) buildProjectTasksPDF(pm,grandTotal,fm?fm-1:null,fy,MONTHS,fmtCurrency,isAdmin,isAcct,label);
              }}>
                â¬‡ Export PDF
              </button>
          }
        </div>
      </div>

      {projList.length===0&&<div className="card" style={{textAlign:"center",padding:40,color:"var(--text4)"}}>No hours logged for {MONTHS[month]} {year}. Import timesheets first.</div>}

      {/* KPI strip */}
      {projList.length>0&&(
        <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:10,marginBottom:18}}>
          {[
            {l:"Total Hours",     v:grandTotal+"h",                                          c:"var(--text0)"},
            {l:"Active Projects", v:projList.length,                                         c:"var(--info)"},
            {l:"Billable Hours",  v:projList.reduce((s,p)=>s+p.billableHrs,0)+"h",          c:"#34d399"},
            {l:"Unique Tasks",    v:Object.keys(taskColorMap).length,                        c:"#a78bfa"},
          ].map((m,i)=>(
            <div key={i} className="metric">
              <div style={{fontSize:12,color:"var(--text4)",fontWeight:700,textTransform:"uppercase",letterSpacing:".06em"}}>{m.l}</div>
              <div style={{fontFamily:"'IBM Plex Mono',monospace",fontSize:22,fontWeight:700,color:m.c,marginTop:8,lineHeight:1}}>{m.v}</div>
            </div>
          ))}
        </div>
      )}

      {/* Stacked hours bar */}
      {projList.length>1&&selProj==="ALL"&&(
        <div className="card" style={{marginBottom:14}}>
          <h3 style={{fontSize:14,fontWeight:600,color:"var(--text2)",marginBottom:12}}>Hours Distribution Across Projects</h3>
          <div style={{display:"flex",height:28,borderRadius:6,overflow:"hidden",marginBottom:10}}>
            {projList.map((pm,i)=>{
              const pct=grandTotal?pm.totalHrs/grandTotal*100:0;
              return pct>0&&<div key={pm.proj.id} title={`${pm.proj.name||pm.proj.id} (${pm.proj.id}): ${pm.totalHrs}h (${Math.round(pct)}%)`}
                style={{width:`${pct}%`,background:PROJ_COLORS[i%PROJ_COLORS.length],display:"flex",alignItems:"center",justifyContent:"center",fontSize:12,fontWeight:700,color:"#fff",overflow:"hidden",whiteSpace:"nowrap",padding:"0 4px"}}>
                {pct>4?pm.proj.id:""}
              </div>;
            })}
          </div>
          <div style={{display:"flex",flexWrap:"wrap",gap:8}}>
            {projList.map((pm,i)=>{
              const pct=grandTotal?Math.round(pm.totalHrs/grandTotal*100):0;
              return<div key={pm.proj.id} style={{display:"flex",alignItems:"center",gap:5,fontSize:13}}>
                <div style={{width:8,height:8,borderRadius:2,background:PROJ_COLORS[i%PROJ_COLORS.length],flexShrink:0}}/>
                <span style={{color:"var(--text0)",fontWeight:600}}>{pm.proj.name||pm.proj.id}</span> <span style={{fontFamily:"'IBM Plex Mono',monospace",fontSize:12,color:"var(--info)"}}>{pm.proj.id}</span>
                <span style={{fontFamily:"'IBM Plex Mono',monospace",color:"var(--text0)",fontWeight:600}}>{pm.totalHrs}h</span>
                <span style={{color:"var(--text4)"}}>({pct}%)</span>
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
                  <span style={{fontWeight:700,color:"var(--text0)"}}>{pm.proj.name||pm.proj.id}</span> <span style={{fontFamily:"'IBM Plex Mono',monospace",fontSize:12,color:"var(--info)"}}>{pm.proj.id}</span>
                  <span style={{fontSize:12,padding:"2px 6px",borderRadius:3,background:pm.proj.status==="Active"?"#024b36":"var(--border)",color:pm.proj.status==="Active"?"#34d399":"var(--text2)"}}>{pm.proj.status}</span>
                  {pm.proj.billable&&<span style={{fontSize:12,padding:"2px 6px",borderRadius:3,background:"var(--bg3)",color:"var(--info)"}}>BILLABLE</span>}
                </div>
                <div style={{fontSize:17,fontWeight:700,color:"var(--text0)"}}>{pm.proj.name}</div>
                {pm.proj.project_leader&&<div style={{fontSize:13,color:"var(--text2)",marginTop:1,fontWeight:700}}>Leader: <span style={{color:"var(--info)"}}>{pm.proj.project_leader}</span></div>}
                {pm.proj.pm&&<div style={{fontSize:13,color:"var(--text3)",marginTop:1}}>PM: <span style={{color:"#a78bfa",fontWeight:600}}>{pm.proj.pm}</span></div>}
                {pm.proj.client&&<div style={{fontSize:13,color:"var(--text4)",marginTop:2}}>Client: {pm.proj.client} آ· Phase: {pm.proj.phase||"â€”"}</div>}
              </div>
              <div style={{textAlign:"right",display:"flex",flexDirection:"column",alignItems:"flex-end",gap:6}}>
                <button className="bp" style={{fontSize:13,padding:"5px 10px"}}
                  onClick={()=>{const label=filterMonth==="ALL"?"All Time":filterMonth;const [fy,fm]=filterMonth!=="ALL"?filterMonth.split("-").map(Number):[null,null];buildProjectTasksPDF(pm,grandTotal,fm?fm-1:null,fy,MONTHS,fmtCurrency,isAdmin,isAcct,label);}}>
                  â¬‡ PDF
                </button>
                <div style={{fontFamily:"'IBM Plex Mono',monospace",fontSize:26,fontWeight:700,color:"var(--info)",lineHeight:1}}>{pm.totalHrs}h</div>
                <div style={{fontSize:13,color:"var(--text4)"}}>{pct}% of month total</div>
                {(isAdmin||isAcct)&&pm.proj.billable&&pm.proj.rate_per_hour>0&&<div style={{fontSize:13,color:"#a78bfa",fontFamily:"'IBM Plex Mono',monospace"}}>{fmtCurrency(pm.totalHrs*pm.proj.rate_per_hour)}</div>}
              </div>
            </div>

            {/* Stats row */}
            <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:8,marginBottom:14}}>
              {[
                {l:"Engineers", v:Object.keys(pm.engineers).length, c:"var(--info)"},
                {l:"Task Types",v:tasksSorted.length,               c:"#a78bfa"},
                {l:"Work Days", v:pm.days,                     c:"#34d399"},
                {l:"Avg/Day",   v:pm.days?Math.round(pm.totalHrs/pm.days*10)/10+"h":"â€”", c:"#fb923c"},
              ].map((s,i)=>(
                <div key={i} style={{background:"var(--bg2)",borderRadius:6,padding:"8px 10px"}}>
                  <div style={{fontSize:12,color:"var(--text4)",fontWeight:700,textTransform:"uppercase",letterSpacing:".05em"}}>{s.l}</div>
                  <div style={{fontFamily:"'IBM Plex Mono',monospace",fontSize:16,fontWeight:700,color:s.c,marginTop:4}}>{s.v}</div>
                </div>
              ))}
            </div>

            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12}}>
              {/* Task breakdown */}
              <div>
                <div style={{fontSize:13,fontWeight:700,color:"var(--text3)",textTransform:"uppercase",letterSpacing:".06em",marginBottom:8}}>Task Breakdown</div>
                {tasksSorted.map(([task,data])=>{
                  const tpct=pm.totalHrs?Math.round(data.hrs/pm.totalHrs*100):0;
                  const col=taskColorMap[task]||"var(--info)";
                  return(
                    <div key={task} style={{marginBottom:7}}>
                      <div style={{display:"flex",justifyContent:"space-between",marginBottom:2}}>
                        <div style={{display:"flex",alignItems:"center",gap:5}}>
                          <div style={{width:6,height:6,borderRadius:1,background:col,flexShrink:0}}/>
                          <span style={{fontSize:13,color:"var(--text1)"}}>{task}</span>
                        </div>
                        <div style={{display:"flex",gap:10,fontSize:13}}>
                          <span style={{fontFamily:"'IBM Plex Mono',monospace",color:col,fontWeight:700}}>{data.hrs}h</span>
                          <span style={{color:"var(--text4)"}}>{tpct}%</span>
                          <span style={{color:"var(--text3)"}}>{data.engs.size} eng</span>
                        </div>
                      </div>
                      <div style={{background:"var(--bg3)",height:5,borderRadius:3,overflow:"hidden"}}>
                        <div style={{height:"100%",width:`${tpct}%`,background:col,borderRadius:3,opacity:0.85}}/>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Engineer contribution */}
              <div>
                <div style={{fontSize:13,fontWeight:700,color:"var(--text3)",textTransform:"uppercase",letterSpacing:".06em",marginBottom:8}}>Engineer Contribution</div>
                {engList.map(eng=>{
                  const epct=pm.totalHrs?Math.round(eng.hrs/pm.totalHrs*100):0;
                  const topEngTask=Object.entries(eng.tasks).sort((a,b)=>b[1]-a[1])[0];
                  return(
                    <div key={eng.name} style={{marginBottom:7}}>
                      <div style={{display:"flex",justifyContent:"space-between",marginBottom:2}}>
                        <div style={{display:"flex",alignItems:"center",gap:6}}>
                          <div className="av" style={{width:20,height:20,fontSize:11,flexShrink:0}}>{eng.name.slice(0,2).toUpperCase()}</div>
                          <span style={{fontSize:13,color:"var(--text1)"}}>{eng.name}</span>
                        </div>
                        <div style={{display:"flex",gap:10,fontSize:13}}>
                          <span style={{fontFamily:"'IBM Plex Mono',monospace",color:"var(--info)",fontWeight:700}}>{eng.hrs}h</span>
                          <span style={{color:"var(--text4)"}}>{epct}%</span>
                        </div>
                      </div>
                      <div style={{background:"var(--bg3)",height:5,borderRadius:3,overflow:"hidden"}}>
                        <div style={{height:"100%",width:`${epct}%`,background:"linear-gradient(90deg,#0ea5e9,#38bdf8)",borderRadius:3}}/>
                      </div>
                      {topEngTask&&<div style={{fontSize:12,color:"var(--text4)",marginTop:1}}>Top: {topEngTask[0]} ({topEngTask[1]}h)</div>}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Billability bar */}
            {pm.proj.billable&&(
              <div style={{marginTop:12,paddingTop:10,borderTop:"1px solid var(--border2)"}}>
                <div style={{display:"flex",justifyContent:"space-between",marginBottom:4,fontSize:13}}>
                  <span style={{color:"var(--text3)"}}>Billable coverage</span>
                  <span style={{fontFamily:"'IBM Plex Mono',monospace",color:"#34d399",fontWeight:700}}>{billPct}%</span>
                </div>
                <div style={{background:"var(--bg3)",height:6,borderRadius:3,overflow:"hidden"}}>
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

/* â”€â”€ VacationReport Component â”€â”€ */
function VacationReport({engineers,leaveEntries,allEntries,month,year,MONTHS,onExport,isAdmin,vacationBalances={},setVacBalance,showToast}){
  const [vacSearch,setVacSearch] = React.useState("");
  const leaveTypes=["Annual Leave","Sick Leave","Public Holiday","Business Travel","Training External","Unpaid Leave"];
  const typeColors={"Annual Leave":"var(--info)","Sick Leave":"#f87171","Public Holiday":"#fb923c","Business Travel":"#a78bfa","Training External":"#34d399","Unpaid Leave":"#6b7280"};

  // Monthly breakdown
  const monthly=engineers.map(eng=>{
    const el=leaveEntries.filter(e=>String(e.engineer_id)===String(eng.id)&&e.activity!=="PENDING_APPROVAL");
    const byType={};
    el.forEach(e=>{const lt=e.leave_type||"Annual Leave";byType[lt]=(byType[lt]||0)+1;});
    return{...eng,total:el.length,byType,days:el.sort((a,b)=>a.date.localeCompare(b.date))};
  }).filter(e=>e.total>0);

  // Year-to-date
  const ytd=engineers.map(eng=>{
    const el=allEntries.filter(e=>String(e.engineer_id)===String(eng.id)&&e.entry_type==="leave"&&e.activity!=="PENDING_APPROVAL"&&new Date(e.date).getFullYear()===year);
    const byType={};
    el.forEach(e=>{const lt=e.leave_type||"Annual Leave";byType[lt]=(byType[lt]||0)+1;});
    return{...eng,total:el.length,byType};
  }).filter(e=>e.total>0);

  return(
    <div>
      {/* Header */}
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:18,gap:12,flexWrap:"wrap"}}>
        <div>
          <h2 style={{fontSize:18,fontWeight:700,color:"var(--text0)",margin:0}}>Vacation & Leave Report</h2>
          <p style={{fontSize:14,color:"var(--text4)",marginTop:4}}>{MONTHS[month]} {year} آ· {monthly.filter(e=>!vacSearch||e.name.toLowerCase().includes(vacSearch.toLowerCase())).length} engineers</p>
        </div>
        <div style={{display:"flex",gap:8,alignItems:"center",flexWrap:"wrap"}}>
          <input value={vacSearch} onChange={e=>setVacSearch(e.target.value)} placeholder="Search engineerâ€¦"
            style={{padding:"7px 12px",borderRadius:7,border:"1px solid var(--border3)",background:"var(--bg2)",color:"var(--text0)",fontSize:13,minWidth:160,outline:"none"}}/>
          <button style={{background:"#0ea5e9",border:"none",borderRadius:6,padding:"8px 16px",color:"#fff",fontSize:14,fontWeight:600,cursor:"pointer",fontFamily:"'IBM Plex Sans',sans-serif"}} onClick={onExport}>â¬‡ Export PDF</button>
        </div>
      </div>

      {/* Leave type legend */}
      <div style={{display:"flex",gap:8,flexWrap:"wrap",marginBottom:16}}>
        {leaveTypes.map(lt=>(
          <span key={lt} style={{fontSize:13,padding:"3px 10px",borderRadius:12,border:`1px solid ${typeColors[lt]}50`,color:typeColors[lt],fontWeight:600,background:typeColors[lt]+"15"}}>{lt}</span>
        ))}
      </div>

      {/* Monthly summary */}
      <div className="card" style={{marginBottom:14,overflowX:"auto"}}>
        <h4 style={{fontSize:14,fontWeight:600,color:"var(--text2)",marginBottom:12}}>{MONTHS[month]} {year} â€” Monthly Summary</h4>
        {monthly.length===0
          ? <p style={{color:"var(--text4)",fontSize:14,textAlign:"center",padding:20}}>No leave recorded for {MONTHS[month]} {year}. Import timesheets first.</p>
          : <table style={{minWidth:600}}>
              <thead><tr>
                <th style={{textAlign:"left"}}>Engineer</th>
                {leaveTypes.map(lt=><th key={lt} style={{textAlign:"center",color:typeColors[lt],fontSize:13,minWidth:60}}>{lt}</th>)}
                <th style={{textAlign:"center"}}>Total</th>
              </tr></thead>
              <tbody>{monthly.filter(e=>!vacSearch||e.name.toLowerCase().includes(vacSearch.toLowerCase())).map(eng=>(
                <tr key={eng.id}>
                  <td>
                    <div style={{display:"flex",alignItems:"center",gap:8}}>
                      <div style={{width:28,height:28,borderRadius:"50%",background:"var(--bg3)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:12,fontWeight:700,color:"var(--info)",flexShrink:0}}>{(eng.name||"?").slice(0,2).toUpperCase()}</div>
                      <div>
                        <div style={{fontSize:14,fontWeight:600}}>{eng.name}</div>
                        <div style={{fontSize:13,color:"var(--text4)"}}>{eng.role}</div>
                      </div>
                    </div>
                  </td>
                  {leaveTypes.map(lt=>(
                    <td key={lt} style={{textAlign:"center",fontFamily:"'IBM Plex Mono',monospace",color:eng.byType[lt]?typeColors[lt]:"var(--text4)",fontWeight:eng.byType[lt]?700:400}}>
                      {eng.byType[lt]||"â€”"}
                    </td>
                  ))}
                  <td style={{textAlign:"center",fontFamily:"'IBM Plex Mono',monospace",fontWeight:700,color:"var(--text0)"}}>{eng.total}d</td>
                </tr>
              ))}</tbody>
            </table>
        }
      </div>

      {/* YTD summary */}
      <div className="card" style={{marginBottom:14,overflowX:"auto"}}>
        <h4 style={{fontSize:14,fontWeight:600,color:"var(--text2)",marginBottom:12}}>Year-to-Date {year} â€” All Leave</h4>
        {ytd.length===0
          ? <p style={{color:"var(--text4)",fontSize:14,textAlign:"center",padding:20}}>No leave recorded for {year}.</p>
          : <table style={{minWidth:600}}>
              <thead><tr>
                <th style={{textAlign:"left"}}>Engineer</th>
                {leaveTypes.map(lt=><th key={lt} style={{textAlign:"center",color:typeColors[lt],fontSize:13,minWidth:60}}>{lt}</th>)}
                <th style={{textAlign:"center"}}>YTD Total</th>
              </tr></thead>
              <tbody>{ytd.filter(e=>!vacSearch||e.name.toLowerCase().includes(vacSearch.toLowerCase())).map(eng=>(
                <tr key={eng.id}>
                  <td style={{fontSize:14,fontWeight:600}}>{eng.name}</td>
                  {leaveTypes.map(lt=>(
                    <td key={lt} style={{textAlign:"center",fontFamily:"'IBM Plex Mono',monospace",color:eng.byType[lt]?typeColors[lt]:"var(--text4)",fontWeight:eng.byType[lt]?700:400}}>
                      {eng.byType[lt]||"â€”"}
                    </td>
                  ))}
                  <td style={{textAlign:"center",fontFamily:"'IBM Plex Mono',monospace",fontWeight:700,color:"var(--text0)"}}>{eng.total}d</td>
                </tr>
              ))}</tbody>
            </table>
        }
      </div>

      {/* â”€â”€ ANNUAL LEAVE BALANCE TRACKER â”€â”€ */}
      {(()=>{
        const yearBalances = (vacationBalances||{})[year]||{};
        const annualOnly   = allEntries.filter(e=>
          e.entry_type==="leave" && (e.leave_type==="Annual Leave"||!e.leave_type) &&
          e.activity!=="PENDING_APPROVAL" &&  // exclude pending â€” not yet approved
          new Date(e.date+"T12:00:00").getFullYear()===year
        );
        const rows = engineers
          .filter(eng=>eng.is_active!==false)
          .map(eng=>{
            const entitlement = +(yearBalances[eng.id]??21); // default 21 if not set
            const used        = annualOnly.filter(e=>String(e.engineer_id)===String(eng.id)).length;
            const remaining   = Math.max(0, entitlement - used);
            const pct         = entitlement>0 ? Math.round(used/entitlement*100) : 0;
            return{...eng, entitlement, used, remaining, pct};
          });
        if(!rows.length) return null;

        return(
          <div className="card" style={{marginBottom:14}}>
            {/* Header */}
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:12,flexWrap:"wrap",gap:10}}>
              <h4 style={{fontSize:14,fontWeight:600,color:"var(--text2)",margin:0}}>Annual Leave Balance â€” {year}</h4>
              {isAdmin&&(
                <div style={{fontSize:13,color:"var(--text4)"}}>
                  Edit each person's entitlement in the <span style={{color:"var(--info)",fontWeight:600}}>Balance</span> column, then click Save
                </div>
              )}
            </div>

            {/* Table */}
            <div style={{overflowX:"auto"}}>
            <table style={{width:"100%",borderCollapse:"collapse",fontSize:13}}>
              <thead>
                <tr style={{background:"var(--bg2)"}}>
                  <th style={{textAlign:"left",padding:"8px 12px",color:"var(--text3)",fontSize:13}}>Engineer</th>
                  <th style={{textAlign:"center",padding:"8px 12px",color:"var(--info)",fontSize:13}}>
                    {isAdmin?"Balance (editable)":"Entitlement"}
                  </th>
                  <th style={{textAlign:"center",padding:"8px 12px",color:"#fb923c",fontSize:13}}>Used</th>
                  <th style={{textAlign:"left",padding:"8px 12px",color:"var(--text3)",fontSize:13,minWidth:120}}>Progress</th>
                  <th style={{textAlign:"center",padding:"8px 12px",color:"#34d399",fontSize:13}}>Remaining</th>
                  <th style={{textAlign:"center",padding:"8px 12px",color:"var(--text3)",fontSize:13}}>Status</th>
                </tr>
              </thead>
              <tbody>
                {rows.sort((a,b)=>b.used-a.used).map((eng,i)=>{
                  const barColor = eng.pct>=90?"#f87171":eng.pct>=60?"#fb923c":"#34d399";
                  const status   = eng.pct>=100?"ًںڑ¨ Exceeded":eng.pct>=90?"âڑ  Critical":eng.pct>=60?"â–² High":"âœ“ Healthy";
                  return(
                    <tr key={eng.id} style={{borderBottom:"1px solid var(--border3)",background:i%2===0?"transparent":"var(--bg1)"}}>
                      {/* Engineer */}
                      <td style={{padding:"8px 12px"}}>
                        <div style={{display:"flex",alignItems:"center",gap:8}}>
                          <div style={{width:28,height:28,borderRadius:"50%",background:"var(--bg3)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:11,fontWeight:700,color:"var(--info)",flexShrink:0}}>{(eng.name||"?").slice(0,2).toUpperCase()}</div>
                          <div>
                            <div style={{fontWeight:600,fontSize:13}}>{eng.name}</div>
                            <div style={{fontSize:12,color:"var(--text4)"}}>{eng.role}</div>
                          </div>
                        </div>
                      </td>
                      {/* Entitlement â€” editable for admin */}
                      <td style={{textAlign:"center",padding:"6px 10px"}}>
                        {isAdmin?(
                          <div style={{display:"flex",alignItems:"center",justifyContent:"center",gap:4}}>
                            <button onClick={()=>setVacBalance&&setVacBalance(year,eng.id,eng.entitlement-1)}
                              style={{background:"var(--bg3)",border:"1px solid var(--border3)",borderRadius:4,width:26,height:30,cursor:"pointer",color:"var(--text2)",fontSize:16,lineHeight:1,flexShrink:0}}>âˆ’</button>
                            <input type="number" min={0} max={365} value={eng.entitlement}
                              onChange={e=>setVacBalance&&setVacBalance(year,eng.id,+e.target.value||0)}
                              style={{width:60,textAlign:"center",background:"var(--bg2)",border:"1px solid var(--info)",borderRadius:6,color:"var(--info)",fontSize:15,fontFamily:"'IBM Plex Mono',monospace",fontWeight:700,padding:"4px 6px",outline:"none"}}/>
                            <button onClick={()=>setVacBalance&&setVacBalance(year,eng.id,eng.entitlement+1)}
                              style={{background:"var(--bg3)",border:"1px solid var(--border3)",borderRadius:4,width:26,height:30,cursor:"pointer",color:"var(--text2)",fontSize:16,lineHeight:1,flexShrink:0}}>+</button>
                          </div>
                        ):(
                          <span style={{fontFamily:"'IBM Plex Mono',monospace",fontWeight:700,color:"var(--info)",fontSize:14}}>{eng.entitlement}d</span>
                        )}
                      </td>
                      {/* Used */}
                      <td style={{textAlign:"center",fontFamily:"'IBM Plex Mono',monospace",fontWeight:700,color:"#fb923c",fontSize:14,padding:"8px 10px"}}>{eng.used}d</td>
                      {/* Progress bar */}
                      <td style={{padding:"8px 12px"}}>
                        <div style={{background:"var(--bg3)",height:8,borderRadius:4,overflow:"hidden"}}>
                          <div style={{height:"100%",width:`${Math.min(100,eng.pct)}%`,background:barColor,borderRadius:4,transition:"width .4s"}}/>
                        </div>
                        <div style={{fontSize:11,color:"var(--text4)",marginTop:2}}>{eng.used} of {eng.entitlement} days</div>
                      </td>
                      {/* Remaining */}
                      <td style={{textAlign:"center",fontFamily:"'IBM Plex Mono',monospace",fontWeight:800,color:eng.remaining>0?"#34d399":"#f87171",fontSize:16,padding:"8px 10px"}}>{eng.remaining}d</td>
                      {/* Status */}
                      <td style={{textAlign:"center",padding:"8px 10px"}}>
                        <span style={{fontSize:12,padding:"2px 9px",borderRadius:8,background:barColor+"20",color:barColor,fontWeight:700,whiteSpace:"nowrap"}}>{status}</span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
              <tfoot>
                <tr style={{background:"var(--bg2)",borderTop:"2px solid var(--border)"}}>
                  <td style={{padding:"8px 12px",fontWeight:700,color:"var(--text0)"}}>TEAM TOTAL</td>
                  <td style={{textAlign:"center",fontFamily:"'IBM Plex Mono',monospace",fontWeight:700,color:"var(--info)"}}>{rows.reduce((s,e)=>s+e.entitlement,0)}d</td>
                  <td style={{textAlign:"center",fontFamily:"'IBM Plex Mono',monospace",fontWeight:700,color:"#fb923c"}}>{rows.reduce((s,e)=>s+e.used,0)}d</td>
                  <td/>
                  <td style={{textAlign:"center",fontFamily:"'IBM Plex Mono',monospace",fontWeight:700,color:"#34d399"}}>{rows.reduce((s,e)=>s+e.remaining,0)}d</td>
                  <td/>
                </tr>
              </tfoot>
            </table>
            </div>

            {/* Save button */}
            {isAdmin&&(
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginTop:12,paddingTop:10,borderTop:"1px solid var(--border3)"}}>
                <span style={{fontSize:13,color:"var(--text4)"}}>
                  ًں’، Balances are per-year and per-person. Changes are auto-saved when you click ًں’¾ Save.
                </span>
                <button className="bp" style={{fontSize:13,padding:"7px 22px",flexShrink:0}} onClick={()=>{
                  try{localStorage.setItem('ec_vacation_balances',JSON.stringify(vacationBalances));}catch(err){}
                  showToast&&showToast("Vacation balances saved âœ“");
                }}>ًں’¾ Save</button>
              </div>
            )}
          </div>
        );
      })()}

      {/* Per-engineer day detail */}
      {monthly.length>0&&<div>
        <h4 style={{fontSize:14,fontWeight:600,color:"var(--text2)",marginBottom:10}}>Detail â€” Leave Days {MONTHS[month]} {year}</h4>
        {monthly.map(eng=>(
          <div key={eng.id} className="card" style={{marginBottom:8}}>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:8}}>
              <div style={{display:"flex",alignItems:"center",gap:10}}>
                <div style={{width:32,height:32,borderRadius:"50%",background:"var(--bg3)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:13,fontWeight:700,color:"var(--info)"}}>{(eng.name||"?").slice(0,2).toUpperCase()}</div>
                <div>
                  <div style={{fontSize:15,fontWeight:600}}>{eng.name}</div>
                  <div style={{fontSize:13,color:"var(--text4)"}}>{eng.total} day{eng.total!==1?"s":""} of leave</div>
                </div>
              </div>
              <div style={{display:"flex",gap:6,flexWrap:"wrap",justifyContent:"flex-end"}}>
                {Object.entries(eng.byType).map(([lt,n])=>(
                  <span key={lt} style={{fontSize:13,padding:"2px 8px",borderRadius:3,background:typeColors[lt]+"25",color:typeColors[lt],fontWeight:600}}>{lt}: {n}d</span>
                ))}
              </div>
            </div>
            <div style={{display:"flex",flexWrap:"wrap",gap:5}}>
              {eng.days.map(e=>(
                <span key={e.id} style={{fontSize:13,padding:"3px 9px",borderRadius:4,background:"var(--bg2)",border:`1px solid ${typeColors[e.leave_type||"Annual Leave"]}40`,color:typeColors[e.leave_type||"Annual Leave"],fontFamily:"'IBM Plex Mono',monospace"}}>
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



/* â•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گ
   PROJECT ACTIVITY TAXONOMY
   â•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گ */
const ACTIVITY_TAXONOMY = {
  /* â”€â”€ SCADA â”€â”€ */
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
  /* â”€â”€ RTU-PLC â”€â”€ */
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
    "PLC Control Logic â€” Inverter","PLC Control Logic â€” Transformer",
    "PLC Control Logic â€” Generator","PLC Control Logic â€” Feeder",
    "PLC Control Logic â€” BESS","PLC Control Logic â€” Weather Station",
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
  /* â”€â”€ Protection â”€â”€ */
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
  /* â”€â”€ General â”€â”€ */
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

/* â”€â”€ Category Groups â”€â”€ */
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

/* â•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گ
   PROJECT TRACKER â€” standalone component (no IIFE, no re-render loops)
   â•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گ */
const STATUS_COLOR={"Completed":"#34d399","In Progress":"var(--info)","Not Started":"var(--text3)","On Hold":"#fb923c"};
const STATUS_BG={"Completed":"#14532d30","In Progress":"#0ea5e920","Not Started":"#1e293b40","On Hold":"#78350f30"};

/* â”€â”€ Inline category/activity editor modal â”€â”€ */

/* â•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گ
   PROJECT TRACKER â€” standalone component
/* â”€â”€ Shared helpers (module-level, no hooks) â”€â”€ */
function FunctionsTab({entries, engineers, funcYear, setFuncYear, funcEngId, setFuncEngId, deleteEntry, isAdmin, isLead, isAcct, year, setShowFuncModal, isMonthFrozen}){

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
<div style={{display:"grid",gap:20}}>

  {/* â”€â”€ Page header â”€â”€ */}
  <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",flexWrap:"wrap",gap:14}}>
    <div>
      <div style={{fontSize:11,fontWeight:700,color:"var(--text4)",textTransform:"uppercase",letterSpacing:".1em",marginBottom:4}}>FUNCTION HOURS</div>
      <h1 style={{fontSize:26,fontWeight:800,color:"var(--text0)",lineHeight:1}}>Functions</h1>
      <p style={{color:"var(--text3)",fontSize:14,marginTop:4,fontFamily:"'IBM Plex Mono',monospace"}}>{yearFuncs.length} entries آ· {totalFuncHrs}h total آ· {funcYear}</p>
    </div>
    <div style={{display:"flex",gap:8,alignItems:"center",flexWrap:"wrap"}}>
      <select value={funcYear} onChange={e=>setFuncYear(+e.target.value)}
        style={{background:"var(--bg2)",border:"1px solid var(--border3)",borderRadius:6,padding:"5px 10px",color:"var(--text0)",fontSize:13,fontWeight:600,outline:"none",cursor:"pointer"}}>
        {Array.from({length:6},(_,i)=>new Date().getFullYear()-2+i).map(y=><option key={y}>{y}</option>)}
      </select>
      <select value={funcEngId} onChange={e=>setFuncEngId(e.target.value)}
        style={{background:"var(--bg1)",border:"1px solid var(--border)",borderRadius:8,padding:"8px 12px",color:"var(--text0)",fontSize:14}}>
        <option value="all">All Engineers</option>
        {engineers.filter(e=>e.is_active!==false&&e.is_active!==0&&e.is_active!==null&&(!e.termination_date||String(e.termination_date).slice(0,10)>new Date().toISOString().slice(0,10))).map(e=><option key={e.id} value={e.id}>{e.name}</option>)}
      </select>
      <button className="bp" onClick={()=>setShowFuncModal(true)}>+ Log Function Hours</button>
    </div>
  </div>

  {/* Category bars */}
  <div className="card" style={{padding:0,overflow:"hidden"}}>
    <div style={{background:"var(--bg0)",borderBottom:"1px solid var(--border)",padding:"14px 20px",display:"flex",justifyContent:"space-between",alignItems:"center"}}>
      <div style={{fontSize:15,fontWeight:700,color:"var(--text0)"}}>Hours by Category</div>
      <div style={{fontSize:13,color:"var(--text3)",fontFamily:"'IBM Plex Mono',monospace"}}>{funcYear}{funcEngId!=="all"?" آ· "+engineers.find(e=>String(e.id)===String(funcEngId))?.name:""}</div>
    </div>
    <div style={{padding:"16px 20px",display:"grid",gap:10}}>
      {FUNCTION_CATS.map(cat=>{
        const hrs=catTotals[cat]||0;
        const pct=Math.round(hrs/maxCat*100);
        return(
        <div key={cat} style={{display:"grid",gridTemplateColumns:"220px 1fr 60px",alignItems:"center",gap:12}}>
          <div style={{fontSize:14,color:FUNC_COLORS[cat]||"var(--text2)",fontWeight:600,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{cat}</div>
          <div style={{background:"var(--bg3)",borderRadius:4,height:8,overflow:"hidden"}}>
            <div style={{height:"100%",width:`${pct}%`,background:FUNC_COLORS[cat]||"var(--info)",borderRadius:4,transition:"width .4s",minWidth:hrs>0?4:0}}/>
          </div>
          <div style={{fontFamily:"'IBM Plex Mono',monospace",fontSize:14,color:hrs>0?(FUNC_COLORS[cat]||"var(--info)"):"var(--text4)",fontWeight:700,textAlign:"right"}}>{hrs>0?hrs+"h":"â€”"}</div>
        </div>);
      })}
    </div>
  </div>

  {/* Engineer matrix */}
  <div className="card" style={{padding:0,overflow:"hidden"}}>
    <div style={{background:"var(--bg0)",borderBottom:"1px solid var(--border)",padding:"14px 20px",display:"flex",justifyContent:"space-between",alignItems:"center"}}>
      <div style={{fontSize:15,fontWeight:700,color:"var(--text0)"}}>Engineer Function Matrix</div>
      <div style={{fontSize:13,color:"var(--text3)",fontFamily:"'IBM Plex Mono',monospace"}}>{funcYear}</div>
    </div>
    <div style={{overflowX:"auto"}}>
    <table style={{minWidth:700}}>
      <thead><tr>
        <th>Engineer</th>
        <th style={{textAlign:"right"}}>Total</th>
        {FUNCTION_CATS.map(c=><th key={c} style={{textAlign:"right",maxWidth:70,whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis",color:FUNC_COLORS[c]}} title={c}>{c.split("â€”")[0].split("&")[0].trim().slice(0,11)}</th>)}
      </tr></thead>
      <tbody>{engineers.filter(e=>e.is_active!==false&&e.is_active!==0&&e.is_active!==null&&(!e.termination_date||String(e.termination_date).slice(0,10)>new Date().toISOString().slice(0,10))).map(eng=>{
        const em=engFuncMap[eng.id]||{total:0,cats:{}};
        return(<tr key={eng.id}>
          <td><div style={{fontWeight:600}}>{eng.name}</div><div style={{fontSize:12,color:"var(--text4)"}}>{eng.role}</div></td>
          <td style={{textAlign:"right",fontFamily:"'IBM Plex Mono',monospace",fontWeight:700,color:"#a78bfa"}}>{em.total||"â€”"}</td>
          {FUNCTION_CATS.map(c=>(
            <td key={c} style={{textAlign:"right",fontFamily:"'IBM Plex Mono',monospace",color:em.cats[c]>0?(FUNC_COLORS[c]||"var(--info)"):"var(--text4)"}}>{em.cats[c]||"â€”"}</td>
          ))}
        </tr>);
      })}</tbody>
    </table>
    </div>
  </div>

  {/* All entries */}
  <div className="card" style={{padding:0,overflow:"hidden"}}>
    <div style={{background:"var(--bg0)",borderBottom:"1px solid var(--border)",padding:"14px 20px",display:"flex",justifyContent:"space-between",alignItems:"center"}}>
      <div style={{fontSize:15,fontWeight:700,color:"var(--text0)"}}>All Function Entries</div>
      <div style={{fontSize:13,color:"var(--text3)",fontFamily:"'IBM Plex Mono',monospace"}}>{yearFuncs.length} entries آ· {funcYear}</div>
    </div>
    <table>
      <thead><tr><th>Date</th><th>Engineer</th><th>Category</th><th style={{textAlign:"right"}}>Hours</th><th>Description</th>{isAdmin&&<th style={{width:60}}></th>}</tr></thead>
      <tbody>{yearFuncs.sort((a,b)=>b.date.localeCompare(a.date)).map(e=>{
        const eng=engineers.find(x=>x.id===e.engineer_id);
        const cat=e.function_category||e.task_type||"Other Function";
        return(<tr key={e.id}>
          <td style={{fontFamily:"'IBM Plex Mono',monospace"}}>{e.date}</td>
          <td style={{fontWeight:600}}>{eng?.name||"?"}</td>
          <td><span style={{fontSize:12,padding:"2px 8px",borderRadius:4,background:(FUNC_COLORS[cat]||"#6b7280")+"20",color:FUNC_COLORS[cat]||"#6b7280",fontWeight:700}}>{cat}</span></td>
          <td style={{textAlign:"right",fontFamily:"'IBM Plex Mono',monospace",fontWeight:700,color:"#a78bfa"}}>{e.hours}h</td>
          <td style={{color:"var(--text3)",fontStyle:"italic",maxWidth:220,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{e.activity||"â€”"}</td>
          {isAdmin&&<td>{isMonthFrozen(e.date)?<span title="Month frozen" style={{fontSize:13,color:"#93c5fd",padding:"0 6px"}}>â‌„</span>:<button className="bd" onClick={()=>deleteEntry(e.id,e.engineer_id)}>âœ•</button>}</td>}
        </tr>);
      })}</tbody>
    </table>
  </div>
</div>
  );
}

/* â•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گ
   KPIs TAB â€” standalone component
   â•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گ */
/* â”€â”€ KPI rating helpers â€” module-level so JSX render can access them â”€â”€ */
const kpiRatingLabel=s=>s<=40?"Under Performer":s<=75?"Competent":s<=95?"Performer":"High Performer";
const kpiRatingColor=s=>s<=40?"#f87171":s<=75?"#fb923c":s<=95?"var(--info)":"#34d399";
const kpiRatingBg=   s=>s<=40?"#7f1d1d20":s<=75?"var(--bg3)":s<=95?"var(--bg3)":"var(--bg3)";

function KPIsTab({entries,engineers,projects,kpiYear,setKpiYear,kpiEngId,setKpiEngId,kpiNotes,setKpiNotes,isAdmin,isLead,isAcct,isEngineer,myProfile,year,notifications,onDismissNotif,alertDay,setAlertDay,alertTime,setAlertTime,showToast,supabase,setEntries,setNotifications,setNotifHistory,insertNotif,logAction}){

  const canManageKPI = isAdmin||isLead;
  // Engineers auto-locked to their own profile
  const effectiveEngId = isEngineer ? (myProfile?.id ? String(myProfile.id) : null) : kpiEngId;

  const yearEntries=useMemo(()=>entries.filter(e=>{const d=new Date(e.date+"T12:00:00");return d.getFullYear()===kpiYear;}),[entries,kpiYear]);

  const computeKPI=useCallback(eng=>{
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
    const entriesWithDesc=workE.filter(e=>e.activity&&e.activity.trim().length>5&&e.activity!=="PENDING_APPROVAL").length;
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
    const now2=new Date();
    const yearStart=new Date(kpiYear,0,1);
    const engJoinDate=eng.join_date?new Date(eng.join_date+"T12:00:00"):null;
    const kpiStart=engJoinDate&&engJoinDate>yearStart?engJoinDate:yearStart;
    const kpiEnd=Math.min(now2,new Date(kpiYear,11,31));
    const weeksElapsed=Math.max(1,Math.ceil((kpiEnd-kpiStart)/(7*24*3600*1000)));
    const submissionRate=Math.min(100,Math.round(weeks.size/weeksElapsed*100));
    const complianceScore=submissionRate;
    const totalScore=Math.round(utilScore*0.30+projScore*0.30+devScore*0.20+complianceScore*0.20);
    return{eng,totalWork,billWork,billPct,bdPct,knowledgePct,totalLeave,totalFuncHrs,
      utilScore,projScore,devScore,complianceScore,totalScore,
      submissionRate,trainingGiven,trainingReceived,mentoring,rnd,salesBD,
      projsWorked:projsWorked.length,descRate,docHrs,
      weeks:weeks.size,weeksElapsed,funcE,workE,totalHrs};
  },[yearEntries,projects,kpiYear]);

  const engKPIs=useMemo(()=>engineers.filter(e=>e.is_active!==false&&e.is_active!==0&&e.is_active!==null&&(!e.termination_date||String(e.termination_date).slice(0,10)>new Date().toISOString().slice(0,10))).map(computeKPI).sort((a,b)=>b.totalScore-a.totalScore),[engineers,computeKPI]);
  const selKPI=effectiveEngId?engKPIs.find(k=>String(k.eng.id)===String(effectiveEngId)):null;

  // Pending vacation requests
  const pendingVacations=useMemo(()=>{
    // Scope to engineers visible to this user (lead sees only their subtree via props)
    const scopedEngIds=new Set(engineers.map(e=>String(e.id)));
    return entries.filter(e=>
      e.entry_type==="leave" &&
      e.activity==="PENDING_APPROVAL" &&
      scopedEngIds.has(String(e.engineer_id))
    );
  },[entries,engineers]);

  const alertNotifs=(notifications||[]).filter(n=>n.type==="timesheet_alert"&&!n.read);
  const overdueNotif=(notifications||[]).find(n=>n.type==="overdue_alert");
  const vacReqNotifs=(notifications||[]).filter(n=>n.type==="vacation_request");

  // Approve/reject vacation
  const approveVacation=async(entryId,notifId)=>{
    if(!supabase){showToast("No DB connection",false);return;}
    const entry=entries.find(e=>e.id===entryId);
    // 1. Optimistic UI update
    setEntries&&setEntries(prev=>prev.map(e=>e.id===entryId?{...e,activity:null}:e));
    // 2. DB update
    const{error:ue}=await supabase.from("time_entries").update({activity:null}).eq("id",entryId);
    if(ue) console.error("[EC-ERP] time_entries update error:",ue.message);
    // 3. Move vacation_request notification to history
    if(notifId){
      await supabase.from("notifications").update({read:true}).eq("id",notifId);
      const _notif=(notifications||[]).find(n=>n.id===notifId);
      setNotifications&&setNotifications(prev=>prev.filter(n=>n.id!==notifId));
      if(_notif&&setNotifHistory) setNotifHistory(prev=>[{..._notif,read:true},...prev].slice(0,200));
    }
    // 4. Send vacation_approved notification â€” direct insert, no helper, no prop chain
    if(entry){
      const requesterEng=engineers.find(e=>String(e.id)===String(entry.engineer_id));
      const _payload={
        type:"vacation_approved",engineer_id:entry.engineer_id,read:false,
        message:`âœ“ Your Annual Leave on ${entry.date} has been approved`,
        created_at:new Date().toISOString(),
        meta:JSON.stringify({engineer_id:String(entry.engineer_id),date:entry.date,entry_id:entryId})
      };
      const{error:ne}=await supabase.from("notifications").insert(_payload);
      if(ne){
        console.warn("[EC-ERP] vacation_approved insert failed:",ne.message,"â€” trying fallback without engineer_id column");
        const{engineer_id:_eid,..._rest}=_payload;
        const _meta={...JSON.parse(_rest.meta||"{}"),_eng_id:String(_eid)};
        const{error:ne2}=await supabase.from("notifications").insert({..._rest,meta:JSON.stringify(_meta)});
        if(ne2){
          console.error("[EC-ERP] vacation_approved BOTH inserts failed:",ne2.message);
          showToast("âڑ  Approval sent but notification failed: "+ne2.message,false);
        } else {
        }
      } else {
      }
      logAction("UPDATE","TimeEntry",`Approved vacation for ${requesterEng?.name||entry.engineer_id} on ${entry.date}`,{entry_id:entryId,engineer_id:entry.engineer_id,engineer_name:requesterEng?.name,date:entry.date});
    } else {
      console.error("[EC-ERP] approveVacation â€” entry not found in state! entryId:",entryId,"entries count:",entries.length);
      showToast("âڑ  Approval saved but entry not found â€” refresh and check",false);
    }
    showToast("Vacation approved âœ“");
  };
  const rejectVacation=async(entryId,notifId)=>{
    if(!supabase){showToast("No DB connection",false);return;}
    const entry=entries.find(e=>e.id===entryId);
    setEntries&&setEntries(prev=>prev.filter(e=>e.id!==entryId));
    const{error:de}=await supabase.from("time_entries").delete().eq("id",entryId);
    if(de) console.error("[EC-ERP] time_entries delete error:",de.message);
    if(notifId){
      await supabase.from("notifications").update({read:true}).eq("id",notifId);
      const _notif2=(notifications||[]).find(n=>n.id===notifId);
      setNotifications&&setNotifications(prev=>prev.filter(n=>n.id!==notifId));
      if(_notif2&&setNotifHistory) setNotifHistory(prev=>[{..._notif2,read:true},...prev].slice(0,200));
    }
    if(entry){
      const requesterEng=engineers.find(e=>String(e.id)===String(entry.engineer_id));
      const _payload={
        type:"vacation_rejected",engineer_id:entry.engineer_id,read:false,
        message:`âœ• Your Annual Leave request on ${entry.date} was not approved`,
        created_at:new Date().toISOString(),
        meta:JSON.stringify({engineer_id:String(entry.engineer_id),date:entry.date,entry_id:entryId})
      };
      const{error:ne}=await supabase.from("notifications").insert(_payload);
      if(ne){
        console.warn("[EC-ERP] vacation_rejected insert failed:",ne.message);
        const{engineer_id:_eid,..._rest}=_payload;
        const _meta={...JSON.parse(_rest.meta||"{}"),_eng_id:String(_eid)};
        const{error:ne2}=await supabase.from("notifications").insert({..._rest,meta:JSON.stringify(_meta)});
        if(ne2){
          console.error("[EC-ERP] vacation_rejected BOTH inserts failed:",ne2.message);
          showToast("âڑ  Rejection saved but notification failed: "+ne2.message,false);
        } else {
        }
      } else {
      }
      logAction("DELETE","TimeEntry",`Rejected vacation for ${requesterEng?.name||entry.engineer_id} on ${entry.date}`,{entry_id:entryId,engineer_id:entry.engineer_id,engineer_name:requesterEng?.name,date:entry.date});
    } else {
      console.error("[EC-ERP] rejectVacation â€” entry not found! entryId:",entryId);
    }
    showToast("Vacation request rejected",false)
  };

  // Score gauge (SVG arc)
  const ScoreGauge=({score,size=120})=>{
    const R=46; const cx=60; const cy=62;
    const arcLen=2*Math.PI*R*0.75;
    const pct=Math.min(score/120,1);
    const fill=pct*arcLen;
    const color=score>=96?"#34d399":score>=76?"#0ea5e9":score>=41?"#fb923c":"#f87171";
    const label=score>=96?"High Performer":score>=76?"Performer":score>=41?"Competent":"Under Performer";
    return(
      <svg width={size} height={size} viewBox="0 0 120 110">
        <path d={`M ${cx-R*Math.cos(Math.PI*0.25)} ${cy+R*Math.sin(Math.PI*0.25)} A ${R} ${R} 0 1 1 ${cx+R*Math.cos(Math.PI*0.25)} ${cy+R*Math.sin(Math.PI*0.25)}`}
          fill="none" stroke="var(--bg3)" strokeWidth="10" strokeLinecap="round"/>
        <path d={`M ${cx-R*Math.cos(Math.PI*0.25)} ${cy+R*Math.sin(Math.PI*0.25)} A ${R} ${R} 0 1 1 ${cx+R*Math.cos(Math.PI*0.25)} ${cy+R*Math.sin(Math.PI*0.25)}`}
          fill="none" stroke={color} strokeWidth="10" strokeLinecap="round"
          strokeDasharray={`${fill} ${arcLen}`} style={{transition:"stroke-dasharray .8s ease"}}/>
        <text x={cx} y={cy-4} textAnchor="middle" fontSize="22" fontWeight="800" fill={color} fontFamily="'IBM Plex Mono',monospace">{score}</text>
        <text x={cx} y={cy+12} textAnchor="middle" fontSize="8.5" fill="var(--text4)" fontFamily="sans-serif">{label}</text>
        <text x={cx} y={cy+23} textAnchor="middle" fontSize="7.5" fill="var(--text4)" fontFamily="sans-serif">out of 120</text>
      </svg>
    );
  };

  // Improvement tips per metric
  const TIPS={
    A:[
      {icon:"ًں“‹",tip:"Log hours on billable projects every day â€” even 1h entries count."},
      {icon:"ًںژ“",tip:"Keep knowledge sessions to ~10% of total time (Training & R&D function entries)."},
      {icon:"ًں¤‌",tip:"Log BD activities: tender reviews, proposals, and client meetings as Function â†’ BD/Sales."},
    ],
    B:[
      {icon:"âœچï¸ڈ",tip:"Add a meaningful activity note (>5 chars) to every single work entry â€” aim for 100%."},
      {icon:"ًں“پ",tip:"Work across multiple active projects; each distinct project boosts your score."},
      {icon:"ًں“‌",tip:"Log lesson-learned and progress-report writing as Function â†’ Documentation."},
    ],
    C:[
      {icon:"ًں“ڑ",tip:"Attend internal or external training sessions and log them as Function â†’ Training Received."},
      {icon:"ًں‘¨â€چًںڈ«",tip:"Run at least one knowledge-sharing session per quarter â†’ Function â†’ Training Given."},
      {icon:"ًں”¬",tip:"Contribute to R&D or tool-building â†’ Function â†’ R&D & Innovation."},
    ],
    D:[
      {icon:"ًں“…",tip:"Submit at least one entry every working week â€” gaps penalise your compliance score heavily."},
      {icon:"âڈ°",tip:"Post timesheets by Friday; your alert day is currently set to remind you."},
      {icon:"âœ…",tip:"If you have no project work in a week, log a function entry or leave entry to stay compliant."},
    ],
  };

  // Score card component
  const MetricCard=({id,label,weight,score,color,items,children})=>{
    const [open,setOpen]=React.useState(false);
    return(
      <div style={{background:"var(--bg2)",border:`1px solid ${color}30`,borderRadius:10,overflow:"hidden"}}>
        <div style={{display:"flex",alignItems:"center",gap:12,padding:"12px 16px",cursor:"pointer"}} onClick={()=>setOpen(o=>!o)}>
          <div style={{width:48,height:48,borderRadius:"50%",background:color+"20",border:`2px solid ${color}`,display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}>
            <span style={{fontFamily:"'IBM Plex Mono',monospace",fontSize:18,fontWeight:800,color}}>{score}</span>
          </div>
          <div style={{flex:1}}>
            <div style={{display:"flex",justifyContent:"space-between",marginBottom:4}}>
              <span style={{fontSize:13,fontWeight:700,color:"var(--text0)"}}>{label}</span>
              <span style={{fontSize:12,color:"var(--text4)",background:"var(--bg3)",padding:"1px 7px",borderRadius:8}}>{weight}</span>
            </div>
            <div style={{background:"var(--bg3)",height:6,borderRadius:3,overflow:"hidden"}}>
              <div style={{height:"100%",width:`${Math.min(100,score)}%`,background:color,borderRadius:3,transition:"width .8s ease"}}/>
            </div>
          </div>
          <span style={{fontSize:14,color:"var(--text4)",transition:"transform .2s",transform:open?"rotate(90deg)":"rotate(0deg)"}}>â–¶</span>
        </div>
        {open&&(
          <div style={{padding:"0 16px 14px",borderTop:`1px solid ${color}20`}}>
            {children}
            <div style={{marginTop:12}}>
              <div style={{fontSize:12,fontWeight:700,color:"var(--text4)",textTransform:"uppercase",letterSpacing:".06em",marginBottom:6}}>How to improve</div>
              <div style={{display:"grid",gap:5}}>
                {TIPS[id]?.map((t,i)=>(
                  <div key={i} style={{display:"flex",gap:8,alignItems:"flex-start",fontSize:13,color:"var(--text3)",background:"var(--bg1)",borderRadius:6,padding:"6px 10px"}}>
                    <span style={{flexShrink:0}}>{t.icon}</span>{t.tip}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    );
  };

  // Stat row inside metric card
  const StatRow=({label,value,sub,color})=>(
    <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"5px 0",borderBottom:"1px solid var(--border3)"}}>
      <span style={{fontSize:13,color:"var(--text3)"}}>{label}</span>
      <div style={{textAlign:"right"}}>
        <span style={{fontFamily:"'IBM Plex Mono',monospace",fontSize:13,fontWeight:700,color:color||"var(--text0)"}}>{value}</span>
        {sub&&<div style={{fontSize:11,color:"var(--text4)"}}>{sub}</div>}
      </div>
    </div>
  );

  const kpiRatingColor=s=>s>=96?"#34d399":s>=76?"var(--info)":s>=41?"#fb923c":"#f87171";
  const kpiRatingLabel=s=>s>=96?"High Performer":s>=76?"Performer":s>=41?"Competent":"Under Performer";

  return(
  <div style={{display:"grid",gap:16}}>

    {/* â”€â”€ Header â”€â”€ */}
    <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",flexWrap:"wrap",gap:14}}>
      <div>
        <div style={{fontSize:11,fontWeight:700,color:"var(--text4)",textTransform:"uppercase",letterSpacing:".1em",marginBottom:4}}>PERFORMANCE</div>
        <h1 style={{fontSize:26,fontWeight:800,color:"var(--text0)",lineHeight:1}}>KPI Dashboard</h1>
        <p style={{color:"var(--text3)",fontSize:14,marginTop:4,fontFamily:"'IBM Plex Mono',monospace"}}>{kpiYear} آ· Scorecard آ· Max 120 pts</p>
      </div>
      <div style={{display:"flex",gap:8,alignItems:"center",flexWrap:"wrap"}}>
        <select value={kpiYear} onChange={e=>setKpiYear(+e.target.value)}
          style={{background:"var(--bg2)",border:"1px solid var(--border3)",borderRadius:6,padding:"5px 10px",color:"var(--text0)",fontSize:13,fontWeight:600,outline:"none",cursor:"pointer"}}>
          {Array.from({length:6},(_,i)=>new Date().getFullYear()-2+i).map(y=><option key={y}>{y}</option>)}
        </select>
        {canManageKPI&&(
          <select value={effectiveEngId||""} onChange={e=>setKpiEngId(e.target.value||null)}
            style={{background:"var(--bg1)",border:"1px solid var(--border)",borderRadius:8,padding:"8px 12px",color:"var(--text0)",fontSize:14}}>
            <option value="">Team Overview</option>
            {engineers.filter(e=>e.is_active!==false&&e.is_active!==0&&e.is_active!==null&&(!e.termination_date||String(e.termination_date).slice(0,10)>new Date().toISOString().slice(0,10))).map(e=><option key={e.id} value={e.id}>{e.name}</option>)}
          </select>
        )}
        {isAdmin&&(
          <div style={{background:"var(--bg1)",border:"1px solid var(--border3)",borderRadius:10,padding:"14px 18px"}}>
            <div style={{fontSize:12,fontWeight:700,color:"var(--text4)",letterSpacing:"0.08em",textTransform:"uppercase",marginBottom:12}}>âڈ° Timesheet Posting Alert</div>
            <div style={{display:"flex",alignItems:"center",gap:12,flexWrap:"wrap"}}>
              <div style={{display:"flex",flexDirection:"column",gap:4}}>
                <span style={{fontSize:11,color:"var(--text4)"}}>Day</span>
                <select value={alertDay} onChange={e=>{{const v=+e.target.value;setAlertDay(v);localStorage.setItem("ec_alertDay",v);}}}
                  style={{background:"var(--bg2)",border:"1px solid var(--border3)",borderRadius:6,padding:"5px 10px",color:"var(--text0)",fontSize:13,fontWeight:600,outline:"none",cursor:"pointer",minWidth:110}}>
                  {[["0","Sunday"],["1","Monday"],["2","Tuesday"],["3","Wednesday"],["4","Thursday"],["5","Friday"],["6","Saturday"]].map(([v,l])=><option key={v} value={+v}>{l}</option>)}
                </select>
              </div>
              <div style={{display:"flex",flexDirection:"column",gap:4}}>
                <span style={{fontSize:11,color:"var(--text4)"}}>After</span>
                <input type="time" value={alertTime} onChange={e=>{setAlertTime(e.target.value);localStorage.setItem("ec_alertTime",e.target.value);}}
                  style={{background:"var(--bg2)",border:"1px solid var(--border3)",borderRadius:6,padding:"5px 10px",color:"var(--text0)",fontSize:13,fontWeight:600,outline:"none",cursor:"pointer",fontFamily:"'IBM Plex Mono',monospace",minWidth:110}}/>
              </div>
              <div style={{fontSize:11,color:"var(--text4)",alignSelf:"flex-end",paddingBottom:2}}>
                Alerts admin &amp; lead when engineers miss posting hours
              </div>
            </div>
          </div>
        )}
      </div>
    </div>

    {/* -- Pending vacation approvals (admin/lead) -- */}
    {isAdmin&&pendingVacations.length>0&&(
      <div className="card" style={{borderColor:"#f59e0b50",padding:0,overflow:"hidden"}}>
        <div style={{background:"var(--bg0)",borderBottom:"1px solid #f59e0b40",padding:"14px 20px",display:"flex",alignItems:"center",gap:10}}>
          <span style={{fontSize:15,fontWeight:700,color:"#f59e0b"}}>Pending Vacation Approvals</span>
          <span style={{fontSize:13,background:"#f59e0b20",border:"1px solid #f59e0b40",color:"#f59e0b",padding:"2px 9px",borderRadius:8,fontWeight:700}}>{pendingVacations.length}</span>
          <span style={{fontSize:13,color:"var(--text3)",marginLeft:"auto"}}>Also visible in notifications bell at top of Admin panel</span>
        </div>
        <div style={{display:"grid",gap:0}}>
          {pendingVacations.map(e=>{
            const eng=engineers.find(x=>String(x.id)===String(e.engineer_id));
            const engRole=eng?.role_type||"engineer";
            const notif=vacReqNotifs.find(n=>{ try{return JSON.parse(n.meta||"{}").entry_id===e.id;}catch{return false;} });
            return(
              <div key={e.id} style={{display:"flex",alignItems:"center",gap:12,padding:"12px 20px",borderBottom:"1px solid var(--border)"}}>
                <div className="av" style={{width:34,height:34,fontSize:13,flexShrink:0}}>{eng?.name?.slice(0,2).toUpperCase()||"?"}</div>
                <div style={{flex:1}}>
                  <div style={{fontSize:14,fontWeight:700,color:"var(--text0)"}}>{eng?.name||"Unknown"}</div>
                  <div style={{fontSize:13,color:"var(--text3)",marginTop:2}}>
                    Annual Leave آ· <span style={{fontFamily:"'IBM Plex Mono',monospace",color:"var(--info)"}}>{e.date}</span>
                    <span style={{marginLeft:6,fontSize:12,padding:"1px 6px",borderRadius:4,background:ROLE_COLORS[engRole]+"20",color:ROLE_COLORS[engRole]||"var(--text4)",fontWeight:600}}>{ROLE_LABELS[engRole]||engRole}</span>
                  </div>
                </div>
                <button onClick={()=>approveVacation(e.id,notif?.id)}
                  style={{background:"#05603a",border:"1px solid #34d39950",borderRadius:7,padding:"6px 16px",color:"#34d399",fontSize:14,fontWeight:700,cursor:"pointer",fontFamily:"'IBM Plex Sans',sans-serif"}}>âœ“ Approve</button>
                <button onClick={()=>rejectVacation(e.id,notif?.id)}
                  style={{background:"var(--err-bg)",border:"1px solid #f8717150",borderRadius:7,padding:"6px 16px",color:"#f87171",fontSize:14,fontWeight:700,cursor:"pointer",fontFamily:"'IBM Plex Sans',sans-serif"}}>âœ• Reject</button>
              </div>
            );
          })}
        </div>
      </div>
    )}

    {/* -- Timesheet + overdue alerts -- */}
    {alertNotifs.length>0&&(
      <div className="card" style={{borderColor:"#f8717130",padding:"10px 16px"}}>
        <div style={{fontSize:13,fontWeight:700,color:"#f87171",marginBottom:8}}>âڈ° {alertNotifs.length} TIMESHEET DELAY ALERT{alertNotifs.length>1?"S":""}</div>
        <div style={{display:"grid",gap:4}}>
          {alertNotifs.map(n=>(
            <div key={n.id} style={{display:"flex",alignItems:"center",gap:8,background:"#7f1d1d20",borderRadius:5,padding:"6px 10px"}}>
              <span style={{fontSize:13,color:"#f87171",flex:1}}>{n.message}</span>
              <button className="bg" style={{fontSize:12,padding:"2px 6px"}} onClick={()=>onDismissNotif&&onDismissNotif(n.id)}>âœ•</button>
            </div>
          ))}
        </div>
      </div>
    )}
    {overdueNotif&&(
      <div style={{display:"flex",alignItems:"center",gap:10,background:"#78350f20",border:"1px solid #f59e0b40",borderRadius:8,padding:"10px 14px"}}>
        <span style={{fontSize:13,color:"#fb923c",flex:1}}>âڑ  {(()=>{try{return JSON.parse(overdueNotif.meta||"{}").count;}catch{return "?";}})()  } Tracker activities past their deadline</span>
        <button className="bg" style={{fontSize:12}} onClick={()=>onDismissNotif&&onDismissNotif(overdueNotif.id)}>Dismiss</button>
      </div>
    )}

    {/* -- Rating legend -- */}
    <div style={{display:"flex",gap:6,flexWrap:"wrap"}}>
      {[["0-40","Under Performer","#f87171"],["41-75","Competent","#fb923c"],["76-95","Performer","var(--info)"],["96-120","High Performer","#34d399"]].map(([r,l,c])=>(
        <div key={r} style={{display:"flex",alignItems:"center",gap:5,background:c+"15",border:`1px solid ${c}30`,borderRadius:6,padding:"4px 10px"}}>
          <div style={{width:7,height:7,borderRadius:2,background:c}}/><span style={{fontSize:12,color:c,fontWeight:700}}>{r}</span><span style={{fontSize:12,color:"var(--text3)"}}>{l}</span>
        </div>
      ))}
      <span style={{fontSize:12,color:"var(--text4)",alignSelf:"center",marginLeft:4}}>Weights: Aأ—30% آ· Bأ—30% آ· Cأ—20% آ· Dأ—20%</span>
    </div>

    {/* -- Individual detail view -- */}
    {selKPI&&(()=>{
      const k=selKPI; const {eng}=k;
      const engNotes=kpiNotes[eng.id]||{general:"",A:"",B:"",C:"",D:""};
      const setNote=(field,val)=>setKpiNotes(prev=>({...prev,[eng.id]:{...{general:"",A:"",B:"",C:"",D:""},...(prev[eng.id]||{}),[field]:val}}));
      const teamAvg=engKPIs.length>0?Math.round(engKPIs.reduce((s,k)=>s+k.totalScore,0)/engKPIs.length):0;

      return(
      <div style={{display:"grid",gap:14}}>
        {/* Hero card */}
        <div style={{background:"var(--bg1g)",border:"1px solid #0ea5e930",borderRadius:14,padding:"20px 24px",display:"flex",gap:20,alignItems:"center",flexWrap:"wrap"}}>
          <ScoreGauge score={k.totalScore} size={130}/>
          <div style={{flex:1,minWidth:200}}>
            <div style={{fontSize:22,fontWeight:800,color:"var(--text0)",marginBottom:2}}>{eng.name}</div>
            <div style={{fontSize:13,color:"var(--info)",marginBottom:12}}>{eng.role} آ· {eng.level} آ· KPI {kpiYear}</div>
            <div style={{display:"grid",gridTemplateColumns:"repeat(2,1fr)",gap:8}}>
              {[
                {l:"Total Work",v:`${k.totalWork}h`,c:"var(--text0)"},
                {l:"Billable",v:`${k.billPct}%`,c:"#34d399"},
                {l:"Projects",v:k.projsWorked,c:"#a78bfa"},
                {l:"Compliance",v:`${k.submissionRate}%`,c:k.submissionRate>=80?"#34d399":"#fb923c"},
              ].map(s=>(
                <div key={s.l} style={{background:"#ffffff08",borderRadius:8,padding:"8px 12px"}}>
                  <div style={{fontSize:11,color:"var(--text4)",textTransform:"uppercase",letterSpacing:".06em"}}>{s.l}</div>
                  <div style={{fontFamily:"'IBM Plex Mono',monospace",fontSize:18,fontWeight:800,color:s.c,marginTop:3}}>{s.v}</div>
                </div>
              ))}
            </div>
          </div>
          {canManageKPI&&engKPIs.length>1&&(
            <div style={{textAlign:"center",minWidth:100}}>
              <div style={{fontSize:11,color:"var(--text4)",textTransform:"uppercase",marginBottom:6}}>Team rank</div>
              <div style={{fontFamily:"'IBM Plex Mono',monospace",fontSize:32,fontWeight:800,color:"var(--info)"}}>#{engKPIs.findIndex(x=>x.eng.id===eng.id)+1}</div>
              <div style={{fontSize:12,color:"var(--text4)"}}>of {engKPIs.length}</div>
              <div style={{marginTop:8,fontSize:12,color:"var(--text3)"}}>Team avg: <span style={{color:kpiRatingColor(teamAvg),fontWeight:700}}>{teamAvg}</span></div>
            </div>
          )}
        </div>

        {/* Rating banner */}
        <div style={{textAlign:"center",fontSize:15,fontWeight:700,color:kpiRatingColor(k.totalScore),background:kpiRatingColor(k.totalScore)+"15",border:`1px solid ${kpiRatingColor(k.totalScore)}30`,borderRadius:8,padding:"10px",letterSpacing:".03em"}}>
          {kpiRatingLabel(k.totalScore)}
        </div>

        {/* 4 metric cards */}
        <MetricCard id="A" label="A آ· Utilization / Efficiency" weight="30%" score={k.utilScore} color="var(--info)">
          <StatRow label="Billable utilization" value={`${k.billPct}%`} sub={`${k.billWork}h / ${k.totalHrs}h total`} color={k.billPct>=70?"#34d399":"#fb923c"}/>
          <StatRow label="Knowledge capture" value={`${k.knowledgePct}%`} sub="Target: 8â€“12%" color={k.knowledgePct>=8&&k.knowledgePct<=12?"#34d399":"#fb923c"}/>
          <StatRow label="BD / Sales support" value={`${k.salesBD}h`} sub="Tenders + proposals + BD meetings"/>
        </MetricCard>

        <MetricCard id="B" label="B آ· Project Performance" weight="30%" score={k.projScore} color="#a78bfa">
          <StatRow label="Entry description rate" value={`${k.descRate}%`} sub={`${Math.round(k.descRate/100*k.workE.length)} of ${k.workE.length} entries have notes`} color={k.descRate>=80?"#34d399":"#fb923c"}/>
          <StatRow label="Active projects" value={k.projsWorked} sub="Distinct billable projects this year" color="#a78bfa"/>
          <StatRow label="Documentation hours" value={`${k.docHrs}h`} sub="Reports, lesson-learned, closure docs"/>
        </MetricCard>

        <MetricCard id="C" label="C آ· Development Goal" weight="20%" score={k.devScore} color="#34d399">
          <StatRow label="Training received" value={`${k.trainingReceived}h`} sub="Target â‰¥8h/yr" color={k.trainingReceived>=8?"#34d399":"#fb923c"}/>
          <StatRow label="Training given" value={`${k.trainingGiven}h`} sub="Knowledge sharing sessions â€” target â‰¥4h"/>
          <StatRow label="Mentoring & coaching" value={`${k.mentoring}h`} sub="People development"/>
          <StatRow label="R&D & innovation" value={`${k.rnd}h`} sub="Tools, models, work instructions"/>
        </MetricCard>

        <MetricCard id="D" label="D آ· Compliance Goal" weight="20%" score={k.complianceScore} color="#fb923c">
          <StatRow label="Weekly submission rate" value={`${k.submissionRate}%`} sub={`${k.weeks} weeks posted out of ${k.weeksElapsed} elapsed`} color={k.submissionRate>=80?"#34d399":k.submissionRate>=60?"#fb923c":"#f87171"}/>
          <StatRow label="Total work hours" value={`${k.totalWork}h`} sub="All work entries this year"/>
          <StatRow label="Leave days" value={`${k.totalLeave}d`} sub="Annual leave + sick + other"/>
        </MetricCard>

        {/* Notes -- admin eyes only */}
        {isAdmin&&(
        <div className="card">
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:10}}>
            <div style={{fontSize:13,fontWeight:700,color:"var(--text2)"}}>Manager Notes <span style={{fontSize:12,fontWeight:400,color:"var(--text4)"}}>â€” admin only</span></div>
            <button className="bp" style={{fontSize:13,padding:"5px 16px"}} onClick={()=>{
              try{localStorage.setItem("ec_kpi_notes",JSON.stringify(kpiNotes));}catch(err){}
              showToast("Notes saved âœ“");
            }}>ًں’¾ Save Notes</button>
          </div>
          <div style={{display:"grid",gap:8}}>
            {[["general","General"],["A","Utilization"],["B","Project Perf."],["C","Development"],["D","Compliance"]].map(([f,l])=>(
              <div key={f}>
                <div style={{fontSize:12,color:"var(--text4)",marginBottom:3}}>{l}</div>
                <textarea rows={2} value={engNotes[f]||""} onChange={e=>setNote(f,e.target.value)}
                  placeholder={`Notes on ${l}â€¦`}
                  style={{width:"100%",background:"var(--bg2)",border:"1px solid var(--border3)",borderRadius:6,padding:"6px 10px",color:"var(--text0)",fontSize:13,resize:"vertical",fontFamily:"'IBM Plex Sans',sans-serif"}}/>
              </div>
            ))}
          </div>
        </div>
        )}

        {canManageKPI&&<button className="bg" style={{fontSize:13}} onClick={()=>{ isEngineer?null:setKpiEngId(null); }}>â†گ Back to team overview</button>}
      </div>);
    })()}

    {/* -- Team Overview (admin/lead, no engineer selected) -- */}
    {!selKPI&&canManageKPI&&(
      <div className="card" style={{padding:0,overflow:"hidden"}}>
        <div style={{padding:"12px 16px",borderBottom:"1px solid var(--border3)",display:"flex",justifyContent:"space-between",alignItems:"center"}}>
          <span style={{fontSize:13,fontWeight:700,color:"var(--text2)"}}>TEAM KPI SCORECARD â€” {kpiYear}</span>
          <span style={{fontSize:13,color:"var(--text4)"}}>{engKPIs.length} engineers آ· Avg: <span style={{color:kpiRatingColor(Math.round(engKPIs.reduce((s,k)=>s+k.totalScore,0)/Math.max(1,engKPIs.length))),fontWeight:700}}>{Math.round(engKPIs.reduce((s,k)=>s+k.totalScore,0)/Math.max(1,engKPIs.length))}</span></span>
        </div>
        <div style={{overflowX:"auto"}}>
        <table style={{minWidth:700}}>
          <thead><tr style={{background:"var(--bg2)"}}>
            <th style={{textAlign:"left",padding:"8px 12px"}}>#</th>
            <th style={{textAlign:"left",padding:"8px 12px"}}>Engineer</th>
            <th style={{textAlign:"center",padding:"8px 10px",color:"var(--info)",fontSize:12}}>A<br/>Util</th>
            <th style={{textAlign:"center",padding:"8px 10px",color:"#a78bfa",fontSize:12}}>B<br/>Proj</th>
            <th style={{textAlign:"center",padding:"8px 10px",color:"#34d399",fontSize:12}}>C<br/>Dev</th>
            <th style={{textAlign:"center",padding:"8px 10px",color:"#fb923c",fontSize:12}}>D<br/>Comply</th>
            <th style={{textAlign:"center",padding:"8px 12px"}}>Score</th>
            <th style={{textAlign:"center",padding:"8px 12px"}}>Rating</th>
          </tr></thead>
          <tbody>{engKPIs.map((k,i)=>(
            <tr key={k.eng.id} onClick={()=>setKpiEngId(String(k.eng.id))} style={{cursor:"pointer",borderBottom:"1px solid var(--border3)"}}>
              <td style={{padding:"8px 12px",fontFamily:"'IBM Plex Mono',monospace",fontSize:13,color:"var(--text4)",fontWeight:700}}>{i+1}</td>
              <td style={{padding:"8px 12px"}}>
                <div style={{fontWeight:700,fontSize:13}}>{k.eng.name}</div>
                <div style={{fontSize:12,color:"var(--text4)"}}>{k.eng.role}</div>
              </td>
              {[k.utilScore,k.projScore,k.devScore,k.complianceScore].map((s,j)=>(
                <td key={j} style={{textAlign:"center",padding:"8px 10px"}}>
                  <div style={{display:"flex",flexDirection:"column",alignItems:"center",gap:2}}>
                    <span style={{fontFamily:"'IBM Plex Mono',monospace",fontWeight:700,fontSize:14,color:kpiRatingColor(s)}}>{s}</span>
                    <div style={{width:36,height:4,background:"var(--bg3)",borderRadius:2,overflow:"hidden"}}>
                      <div style={{height:"100%",width:`${s}%`,background:kpiRatingColor(s),borderRadius:2}}/>
                    </div>
                  </div>
                </td>
              ))}
              <td style={{textAlign:"center",padding:"8px 12px"}}>
                <div style={{display:"flex",alignItems:"center",gap:6,justifyContent:"center"}}>
                  <div style={{width:40,height:5,background:"var(--bg3)",borderRadius:3,overflow:"hidden"}}>
                    <div style={{height:"100%",width:`${Math.min(100,k.totalScore)}%`,background:kpiRatingColor(k.totalScore),borderRadius:3}}/>
                  </div>
                  <span style={{fontFamily:"'IBM Plex Mono',monospace",fontWeight:800,color:kpiRatingColor(k.totalScore),fontSize:15}}>{k.totalScore}</span>
                </div>
              </td>
              <td style={{textAlign:"center",padding:"8px 12px"}}>
                <span style={{fontSize:12,padding:"2px 8px",borderRadius:10,background:kpiRatingColor(k.totalScore)+"20",color:kpiRatingColor(k.totalScore),fontWeight:700,whiteSpace:"nowrap"}}>
                  {k.totalScore>=96?"High Performer":k.totalScore>=76?"Performer":k.totalScore>=41?"Competent":"Under Performer"}
                </span>
              </td>
            </tr>
          ))}</tbody>
        </table>
        </div>
        <div style={{padding:"8px 16px",fontSize:12,color:"var(--text4)"}}>Click any row for full detail with improvement guide</div>
      </div>
    )}

    {/* -- Engineer: no profile linked -- */}
    {isEngineer&&!selKPI&&(
      <div style={{textAlign:"center",padding:"40px 20px",background:"var(--bg2)",borderRadius:12,border:"1px dashed var(--border3)"}}>
        
        <div style={{fontSize:16,fontWeight:700,color:"var(--text0)",marginBottom:6}}>KPI not available</div>
        <div style={{fontSize:13,color:"var(--text4)"}}>Your engineer profile is not linked to your account yet. Ask your admin to link it.</div>
      </div>
    )}

  </div>);
}
export default function App(){
  const [session,setSession]         = useState(null);
  const [authLoading,setAuthLoading] = useState(true);

  // â”€â”€ Theme â”€â”€
  const [isDark,setIsDark] = useState(()=>localStorage.getItem("erp_theme")!=="light");
  const [menuOpen,setMenuOpen] = useState(false); // mobile sidebar toggle
  useEffect(()=>{
    if(isDark){ document.body.classList.remove("light"); localStorage.setItem("erp_theme","dark"); }
    else{ document.body.classList.add("light"); localStorage.setItem("erp_theme","light"); }
  },[isDark]);
  const toggleTheme = ()=>setIsDark(d=>!d);

  const [authEmail,setAuthEmail]     = useState("");
  const [authPwd,setAuthPwd]         = useState("");
  const [authErr,setAuthErr]         = useState("");
  const [authMode,setAuthMode]       = useState("login");

  const [engineers,setEngineers]     = useState([]);
  const [projects,setProjects]       = useState([]);
  const [entries,setEntries]         = useState([]);
  const [loadedYears,setLoadedYears] = useState(new Set()); // tracks which years are in entries state
  const [notifications,setNotifications] = useState([]);
  // Panel ALWAYS starts closed â€” user opens manually by clicking the bell header
  // sessionStorage remembers if user left it open (not closed)
  const [notifPanelOpen,setNotifPanelOpen] = useState(false);
  const [bellOpen,setBellOpen]             = useState(false);
  const [notifHistory,setNotifHistory]     = useState([]);
  const [bellTab,setBellTab]               = useState("active"); // "active" | "history"
  const [frozenMonths,setFrozenMonths]     = useState([]); // [{id,year,month,frozen_at,frozen_by}]

  // â”€â”€ insertNotif â€” App scope: accessible by bell buttons, KPIsTab, poll â”€â”€
  const insertNotif=async(payload)=>{
    const{error}=await supabase.from("notifications").insert(payload);
    if(error){
      if(error.message&&(error.message.includes("engineer_id")||error.message.includes("column")||error.message.includes("does not exist"))){
        console.warn("[EC-ERP] engineer_id column not found â€” retrying without it.");
        const{engineer_id,...rest}=payload;
        const metaObj=engineer_id!=null?{...JSON.parse(rest.meta||"{}"),_eng_id:String(engineer_id)}:JSON.parse(rest.meta||"{}");
        const{error:err2}=await supabase.from("notifications").insert({...rest,meta:JSON.stringify(metaObj)});
        if(err2){console.error("[EC-ERP] Notification insert failed (both attempts):",err2.message);showToast("âڑ  Notification not sent â€” run SQL migration in Admin â†’ Info",false);}
        return err2||null;
      }
      console.error("[EC-ERP] Notification insert failed:",payload.type,error.message);
      showToast("âڑ  Notification error: "+error.message,false);
    }
    return error||null;
  };

  // â”€â”€ isMonthFrozen: check if a date string falls in a frozen month â”€â”€
  const isMonthFrozen=React.useCallback((dateStr)=>{
    if(!dateStr||!frozenMonths.length) return false;
    const d=new Date(dateStr+'T12:00:00');
    return frozenMonths.some(fm=>Number(fm.year)===d.getFullYear()&&Number(fm.month)===d.getMonth());
  },[frozenMonths]);

  // â”€â”€ toggleFreezeMonth: admin only â”€â”€
  const toggleFreezeMonth=async(yr,mo)=>{
    const existing=frozenMonths.find(fm=>Number(fm.year)===yr&&Number(fm.month)===mo);
    const MONTHS_=["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
    if(existing){
      showConfirm(`Unfreeze ${MONTHS_[mo]} ${yr}? Engineers will be able to edit and delete entries again.`,async()=>{
        const{error}=await supabase.from("frozen_months").delete().eq("id",existing.id);
        if(error){showToast("Unfreeze failed: "+error.message,false);return;}
        setFrozenMonths(prev=>prev.filter(fm=>fm.id!==existing.id));
        showToast(`${MONTHS_[mo]} ${yr} unfrozen âœ“`);
        logAction("UPDATE","TimesheetFreeze",`Unfroze ${MONTHS_[mo]} ${yr}`,{year:yr,month:mo});
        // Notify all active engineers + leads
        const _now=new Date().toISOString();
        const _msg=`ًں”“ ${MONTHS_[mo]} ${yr} has been unfrozen â€” you can now edit time entries for this month`;
        engineers.filter(e=>e.is_active!==false&&e.is_active!==0&&e.role_type!=="admin"&&String(e.id)!==String(myProfile?.id)).forEach(e=>{
          insertNotif({type:"project_status",engineer_id:e.id,read:false,message:_msg,created_at:_now,meta:JSON.stringify({action:"month_unfrozen",year:yr,month:mo})});
        });
      },{title:`Unfreeze ${MONTHS_[mo]} ${yr}`,confirmLabel:"Unfreeze",danger:false,icon:"ًں”“"});
    } else {
      showConfirm(`Freeze ${MONTHS_[mo]} ${yr}? All engineers will be unable to add, edit or delete time entries for this month. Function hours are still allowed.`,async()=>{
        const payload={year:yr,month:mo,frozen_by:myProfile?.name||"Admin",frozen_at:new Date().toISOString()};
        const{data,error}=await supabase.from("frozen_months").insert(payload).select().single();
        if(error){showToast("Freeze failed: "+error.message,false);return;}
        setFrozenMonths(prev=>[...prev,data]);
        showToast(`${MONTHS_[mo]} ${yr} frozen â‌„`);
        logAction("UPDATE","TimesheetFreeze",`Froze ${MONTHS_[mo]} ${yr}`,{year:yr,month:mo});
        // Notify all active engineers + leads
        const _now=new Date().toISOString();
        const _msg=`â‌„ ${MONTHS_[mo]} ${yr} has been frozen â€” you cannot add, edit or delete time entries for this month`;
        engineers.filter(e=>e.is_active!==false&&e.is_active!==0&&e.role_type!=="admin"&&String(e.id)!==String(myProfile?.id)).forEach(e=>{
          insertNotif({type:"project_status",engineer_id:e.id,read:false,message:_msg,created_at:_now,meta:JSON.stringify({action:"month_frozen",year:yr,month:mo})});
        });
      },{title:`Freeze ${MONTHS_[mo]} ${yr}`,confirmLabel:"Freeze Month",danger:true,icon:"â‌„"});
    }
  };

  // â”€â”€ reloadNotifications â€” App scope: accessible by poll useEffect + bell â”€â”€
  const reloadNotifications=async()=>{
    if(!supabase||!myProfile?.id) return;
    const _profId=myProfile.id;
    const _profRole=myProfile.role_type||"engineer";
    const _isLeadOrAdmin=["admin","lead"].includes(_profRole);
    const _matchId2=n=>{
      if(n.engineer_id!=null) return String(n.engineer_id)===String(_profId);
      try{const m=JSON.parse(n.meta||"{}");return String(m.engineer_id||m.recipient_engineer_id||m._eng_id||"")===String(_profId);}
      catch{return false;}
    };
    const _isBcast=n=>n.type==="new_signup"||n.type==="overdue_alert"||(n.type==="timesheet_alert"&&!n.engineer_id);
    const _thirtyAgo2=new Date(Date.now()-90*24*3600*1000).toISOString(); // 90-day history window
    const{data:rN}=await supabase.from("notifications").select("*").eq("read",false).order("created_at",{ascending:false}).limit(300);
    setNotifications((rN||[]).filter(n=>_matchId2(n)||(_isLeadOrAdmin&&_isBcast(n))));
    const{data:rH}=await supabase.from("notifications").select("*").eq("read",true).gte("created_at",_thirtyAgo2).order("created_at",{ascending:false}).limit(500);
    // Include broadcasts in history for lead/admin (same as active filter logic)
    const _isLeadOrAdmin2=["admin","lead"].includes(myProfile?.role_type);
    setNotifHistory((rH||[]).filter(n=>_matchId2(n)||(_isLeadOrAdmin2&&_isBcast(n))));
  };
  const toggleNotifPanel = React.useCallback(()=>{
    setNotifPanelOpen(prev=>!prev);
  },[]);
  const [myProfile,setMyProfile]     = useState(null);
  const myProfileRef = React.useRef(null); // always current â€” used inside stale closures (realtime handler)
  const [loading,setLoading]         = useState(false);

  const [view,setView]               = useState("dashboard");
  const [teamViewMode,setTeamViewMode] = useState("grid"); // "org" | "grid" â€” default grid for instant load
  const [orgNodes,setOrgNodes]         = useState([]); // [{id,engineer_id,name,title,parent_id,is_external,sort_order}]
  const [orgLoaded,setOrgLoaded]       = useState(false);
  const [orgEditing,setOrgEditing]     = useState(false);
  const [orgEditNode,setOrgEditNode]   = useState(null); // node being edited
  const [orgDragId,setOrgDragId]       = useState(null); // dragging node id
  const [browseEngId,setBrowseEngId] = useState(null);
  const [weekOf,setWeekOf]           = useState(fmt(today));
  const [month,setMonth]             = useState(today.getMonth());
  const [year,setYear]               = useState(today.getFullYear());
  const [toast,setToast]             = useState(null);
  const [modalDate,setModalDate]     = useState(null);
  const [editEntry,setEditEntry]     = useState(null);
  const [clipboard,setClipboard]     = useState(null); // {date, entries:[]} for copy/paste
  const [showWeekendPicker,setShowWeekendPicker] = useState(false);
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
  const [subProjModal,setSubProjModal]     = useState(null);  // {projectId, sub?} â€” add/edit sub-project
  const [expandedProj,setExpandedProj]     = useState({});    // {projId: bool} â€” show sub-projects in table
  const [showEngModal,setShowEngModal]     = useState(false);
  const [engSearch,setEngSearch]           = useState("");
  const [editEngModal,setEditEngModal]     = useState(null);
  const [adminTab,setAdminTab]             = useState("engineers"); // overridden per role below
  const [kpiYear,setKpiYear]               = useState(new Date().getFullYear());
  const [alertDay,setAlertDay]             = useState(()=>{ const s=parseInt(localStorage.getItem("ec_alertDay"),10); return isNaN(s)?5:s; }); // 0=Sun,1=Mon..6=Sat
  const [alertTime,setAlertTime]           = useState(()=>localStorage.getItem("ec_alertTime")||"09:00"); // HH:MM 24h
  const [funcYear,setFuncYear]             = useState(new Date().getFullYear());
  const [funcEngId,setFuncEngId]           = useState("all");
  const [kpiEngId,setKpiEngId]            = useState(null);
  const [kpiNotes,setKpiNotes]             = useState(()=>{try{return JSON.parse(localStorage.getItem('ec_kpi_notes')||'{}');}catch{return{};}}); // {engId: {A:"",B:"",C:"",D:"",general:""}}
  // Per-engineer vacation entitlement: { year: { engId: days } }  â€” admin enters each person's allowance
  const [vacationBalances,setVacationBalances] = useState(()=>{try{return JSON.parse(localStorage.getItem('ec_vacation_balances')||'{}');}catch{return {};}});
  useEffect(()=>{ localStorage.setItem('ec_vacation_balances',JSON.stringify(vacationBalances)); },[vacationBalances]);
  const setVacBalance=(yr,engId,days)=>setVacationBalances(prev=>({...prev,[yr]:{...(prev[yr]||{}),[engId]:Math.max(0,days)}}));
  // Tracker persistent state â€” lifted here so it survives browser minimize/tab-switch/remount
  const [trackerProj,  setTrackerProj]   = useState(null);
  const [trackerSub,   setTrackerSub]    = useState(null);
  const [trackerSearch,setTrackerSearch] = useState("");
  const [trackerStatus,setTrackerStatus] = useState("ALL");
  const [actClipboard, setActClipboard]  = useState(null); // {acts:[...], fromProj, fromSub, fromProjName}
  const [activities,setActivities]         = useState([]);
  const [subprojects,setSubprojects]       = useState([]);
  const [activitiesLoaded,setActivitiesLoaded] = useState(false);

  const [showFuncModal,setShowFuncModal]   = useState(false);
  const [newFunc,setNewFunc]               = useState({engineer_id:"",date:new Date().toISOString().slice(0,10),function_category:FUNCTION_CATS[0],hours:2,activity:""});

  // â”€â”€ Finance Module State â”€â”€
  const [staff,setStaff]                   = useState([]);
  const [journalEntries,setJournalEntries]   = useState([]);
  const [fixedAssets,setFixedAssets]         = useState([]);
  const [accounts,setAccounts]               = useState([]);
  const [activityLog,setActivityLog]         = useState([]);
  const [archiveLog,setArchiveLog]           = useState([]);
  const [archiveLoaded,setArchiveLoaded]     = useState(false);
  const [logLoading,setLogLoading]           = useState(false);
  const [archiveLoading,setArchiveLoading]   = useState(false);
  const [retentionDays,setRetentionDays]     = useState(30);
  const [journalLoading,setJournalLoading]   = useState(false);
  const [assetsLoading,setAssetsLoading]     = useState(false);
  const [finSubTab,setFinSubTab]             = useState("journal"); // journal|balance|pl|assets
  const [expenses,setExpenses]             = useState([]);
  const [finTab,setFinTab]                 = useState("pl");        // pl | salaries | expenses
  const [egpRate,setEgpRate]               = useState(50);          // EGP per 1 USD exchange rate
  const [finMonth,setFinMonth]             = useState(new Date().getMonth());
  const [finYear,setFinYear]               = useState(new Date().getFullYear());
  const [showStaffModal,setShowStaffModal] = useState(false);
  const [editStaff,setEditStaff]           = useState(null);
  const [showExpModal,setShowExpModal]     = useState(false);
  const [editExp,setEditExp]               = useState(null);
  const [showPwdModal,setShowPwdModal]     = useState(false);
  const [confirmDlg,  setConfirmDlg]       = useState(null);

  // Styled in-app confirm â€” replaces window.confirm everywhere
  const showConfirm = useCallback((message, onConfirm, {title, confirmLabel="Delete", danger=true, icon}={})=>{
    setConfirmDlg({message, title, confirmLabel, danger, icon:icon||(danger?"ًں—‘":"âڑ "),
      onConfirm:()=>{ setConfirmDlg(null); onConfirm(); },
      onCancel: ()=>setConfirmDlg(null),
    });
  },[]);
  const [pwdForm,setPwdForm]               = useState({newPwd:"",confirmPwd:""});
  const [pwdMsg,setPwdMsg]                 = useState(null); // {ok:bool, text:string}
  const [newStaff,setNewStaff]             = useState({name:"",department:"Engineering",role:"",salary_usd:0,salary_egp:0,type:"full_time",active:true,join_date:null,termination_date:null,email:"",level:"Mid",role_type:"engineer",notes:""});
  const [newExp,setNewExp]                 = useState({category:"Office Rent & Utilities",description:"",amount_usd:0,amount_egp:0,currency:"USD",entry_rate:null,month:new Date().getMonth(),year:new Date().getFullYear(),notes:""});
  const [entryFilter,setEntryFilter]       = useState({engineer:"ALL",project:"ALL",month:today.getMonth(),year:today.getFullYear()});
  const [newEntry,setNewEntry]   = useState({projectId:"",_group:"SCADA",taskCategory:"Templates",taskType:"Block Template",hours:8,activity:"",type:"work",leaveType:LEAVE_TYPES[0],activityId:null,_actCat:null,_actSub:null,_step:1});
  const [newProj,setNewProj]     = useState({id:"",name:"",type:"Renewable Energy",client:"",origin:"Romania HQ",phase:"Design",billable:true,rate_per_hour:85,status:"Active"});
  const [newEng,setNewEng]       = useState({name:"",role:ROLES_LIST[0],level:"Mid",email:"",role_type:"engineer",is_active:true,join_date:null,termination_date:null,weekend_days:JSON.stringify(DEFAULT_WEEKEND)});

  const _toastTimer = React.useRef(null);
  const showToast=(msg,ok=true,undoFn=null)=>{
    if(_toastTimer.current) clearTimeout(_toastTimer.current);
    const duration = undoFn ? 3000 : 3500;
    setToast({msg,ok,undoFn});
    _toastTimer.current = setTimeout(()=>setToast(null), duration);
  };
  const dismissToast=()=>{ if(_toastTimer.current) clearTimeout(_toastTimer.current); setToast(null); };

  // Global Escape key â€” closes topmost open modal (placed here so all state vars are in scope)
  useEffect(()=>{
    const handler=e=>{
      if(e.key!=="Escape") return;
      if(confirmDlg)     { setConfirmDlg(null); return; }
      if(showPwdModal)   { setShowPwdModal(false); return; }
      if(subProjModal)   { setSubProjModal(null); return; }
      if(editProjModal)  { setEditProjModal(null); return; }
      if(showProjModal)  { setShowProjModal(false); return; }
      if(editEngModal)   { setEditEngModal(null); return; }
      if(showEngModal)   { setShowEngModal(false); return; }
      if(showStaffModal) { setShowStaffModal(false); setEditStaff(null); return; }
      if(showExpModal)   { setShowExpModal(false); setEditExp(null); return; }
      if(showFuncModal)  { setShowFuncModal(false); return; }
      if(editEntry)      { setEditEntry(null); return; }
      if(modalDate)      { setModalDate(null); return; }
    };
    document.addEventListener("keydown",handler);
    return ()=>document.removeEventListener("keydown",handler);
  },[confirmDlg,showPwdModal,subProjModal,editProjModal,showProjModal,
     editEngModal,showEngModal,showStaffModal,showExpModal,showFuncModal,editEntry,modalDate]);;

  // On-demand year fetch â€” loads a year's entries only when user navigates to it
  const [entriesLoading,setEntriesLoading] = useState(false);
  useEffect(()=>{
    if(!session||!year||loadedYears.has(year)) return;
    setEntriesLoading(true);
    supabase.from("time_entries").select("*")
      .gte("date",`${year}-01-01`).lte("date",`${year}-12-31`)
      .order("date",{ascending:false})
      .then(({data,error})=>{
        if(!error&&data){
          setEntries(prev=>{
            const existingIds=new Set(prev.map(e=>e.id));
            const fresh=data.filter(e=>!existingIds.has(e.id));
            return fresh.length>0?[...prev,...fresh]:prev;
          });
          setLoadedYears(prev=>new Set([...prev,year]));
        }
        setEntriesLoading(false);
      });
  },[year,session]); // eslint-disable-line

  // â”€â”€ Activity logger â€” fire-and-forget, never blocks UI â”€â”€
  const logAction=useCallback((action,module,detail,meta={})=>{
    if(!session?.user) return;
    const entry={
      user_id:session.user.id,
      user_name:myProfile?.name||session.user.email||"unknown",
      user_role:myProfile?.role_type||"unknown",
      action,module,detail,
      meta:JSON.stringify(meta),
      created_at:new Date().toISOString(),  // explicit â€” don't rely on DB default
    };
    supabase.from("activity_log").insert(entry).select()
      .then(({data,error})=>{
        if(error){
          console.error("[ActivityLog] Insert failed:",error.message,"| payload:",entry);
        } else if(data){
          setActivityLog(prev=>[{...entry,id:data[0]?.id,created_at:new Date().toISOString()},...prev].slice(0,5000));
        }
      });
  },[session,myProfile]);

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
  // isEngActive: checks termination_date (from engineers row OR synced from staff).
  // Does NOT rely on is_active column â€” works with no DB migration.
  const TODAY_STR = new Date().toISOString().slice(0,10);
  const isEngActive = (e) => {
    if(!e) return false;
    // termination_date strictly in the past (before today) â†’ inactive; last day counts as active
    if(e.termination_date && String(e.termination_date).slice(0,10) < TODAY_STR) return false;
    // explicit is_active false
    if(e.is_active===false) return false;
    return true;
  };
  const isSenior  = role==="senior_management";
  const isLead    = role==="lead"||role==="admin";
  // isAcct: ONLY accountant+admin get Finance edit rights. senior_management is view-only.
  const isAcct    = role==="accountant"||role==="admin";
  // canViewFinance: senior_management CAN see Finance panel (read-only) but cannot edit
  const canViewFinance = isAcct || isSenior;
  const canEditAny= isLead; // admin + lead can edit any engineer's entries
  const canBrowseAll = isLead||canViewFinance; // all finance-visible roles can browse engineers
  const canEdit   = true;   // everyone can edit/delete their own entries
  const canReport = canViewFinance || isLead; // senior + accountant + lead see Reports
  const canPostHours = !isSenior || isAdmin; // senior_management view-only; accountant CAN post their own vacation
  const canInvoice= isAcct; // ONLY admin + accountant see invoices â€” NOT senior
  // Redirect away from old mysettings page (merged into Admin â€؛ Info)
  useEffect(()=>{
    if(view==="mysettings") setView("dashboard");
  },[view]);
  // Set correct default tab per role when entering the panel
  useEffect(()=>{
    if(view!=="admin") return;
    if(isAdmin) return; // admin stays on engineers
    if(isLead)  setAdminTab(prev=>["tracker","entries","functions","kpis","projects","settings"].includes(prev)?prev:"tracker");
    else if(isAcct)   setAdminTab(prev=>["finance","entries","engineers","functions","kpis","settings"].includes(prev)?prev:"finance");
    else if(isSenior) setAdminTab(prev=>["engineers","projects","entries","finance","functions","kpis","tracker","settings"].includes(prev)?prev:"engineers");
    else // engineer
      setAdminTab(prev=>["tracker","kpis","settings"].includes(prev)?prev:"tracker");
  },[view,isAdmin,isLead,isAcct,isSenior]);

  const viewEngId = canEditAny ? (browseEngId||myProfile?.id) : myProfile?.id;
  const viewEng   = engineers.find(e=>e.id===viewEngId);

  // Lead scoping: compute which engineer IDs the current lead can see
  // Admin/accountant/senior: unrestricted (null = all)
  // Lead: only self + org chart descendants
  const mySubEngIds = useMemo(()=>{
    if(isAdmin||isAcct||isSenior) return null; // unrestricted
    if(!isLead||!myProfile) return new Set([String(myProfile?.id||"")]);
    // Find lead's node in org chart
    const myNode = orgNodes.find(n=>String(n.engineer_id)===String(myProfile.id));
    const result  = new Set([String(myProfile.id)]);
    if(!myNode) return result; // not in org chart â†’ only self
    // BFS down from lead's node
    const q    = [myNode.id];
    const seen = new Set([myNode.id]);
    while(q.length){
      const nid  = q.shift();
      const kids = orgNodes.filter(n=>Number(n.parent_id)===Number(nid));
      kids.forEach(k=>{
        if(!seen.has(k.id)){
          seen.add(k.id);
          q.push(k.id);
          if(k.engineer_id) result.add(String(k.engineer_id));
        }
      });
    }
    return result;
  },[isAdmin,isAcct,isSenior,isLead,myProfile,orgNodes]);

  // Hash routing â€” sync URL hash â†” view state so refresh restores position
  useEffect(()=>{
    const hash = window.location.hash.slice(1);
    const valid = ["dashboard","timesheet","projects","team","reports","admin","import"];
    if(hash && valid.includes(hash)) setView(hash);
  },[]); // eslint-disable-line
  useEffect(()=>{
    if(session) window.location.hash = view;
  },[view,session]);

  /* â”€â”€ AUTH â”€â”€ */
  useEffect(()=>{
    supabase.auth.getSession().then(({data:{session}})=>{setSession(session);setAuthLoading(false);});
    const {data:{subscription}}=supabase.auth.onAuthStateChange((_,s)=>setSession(s));
    return ()=>subscription.unsubscribe();
  },[]);
  useEffect(()=>{if(session)loadAll();},[session]);

  // â”€â”€ Poll notifications every 30s â€” works even if Supabase Realtime is disabled â”€â”€
  useEffect(()=>{
    if(!session||!myProfile?.id) return;
    const _t=setInterval(()=>reloadNotifications(),15000);
    return()=>clearInterval(_t);
  },[session,myProfile?.id]);

  // Real-time sync â€” keep data current when teammates make changes
  useEffect(()=>{
    if(!session) return;
    const cutoff=(()=>{const d=new Date();d.setMonth(d.getMonth()-18);return d.toISOString().slice(0,10);})();
    const myId = session.user.id;
    const ch = supabase.channel("erp-realtime-"+myId)
      // time_entries
      .on("postgres_changes",{event:"INSERT",schema:"public",table:"time_entries"},({new:row})=>{
        if(row.date < cutoff) return; // outside our window
        setEntries(prev=>prev.some(e=>e.id===row.id)?prev:[row,...prev]);
      })
      .on("postgres_changes",{event:"UPDATE",schema:"public",table:"time_entries"},({new:row})=>{
        setEntries(prev=>prev.map(e=>e.id===row.id?row:e));
      })
      .on("postgres_changes",{event:"DELETE",schema:"public",table:"time_entries"},({old:row})=>{
        setEntries(prev=>prev.filter(e=>e.id!==row.id));
      })
      // project_activities
      .on("postgres_changes",{event:"INSERT",schema:"public",table:"project_activities"},({new:row})=>{
        setActivities(prev=>prev.some(a=>a.id===row.id)?prev:[...prev,row]);
      })
      .on("postgres_changes",{event:"UPDATE",schema:"public",table:"project_activities"},({new:row})=>{
        setActivities(prev=>prev.map(a=>a.id===row.id?row:a));
      })
      .on("postgres_changes",{event:"DELETE",schema:"public",table:"project_activities"},({old:row})=>{
        setActivities(prev=>prev.filter(a=>a.id!==row.id));
      })
      // projects
      .on("postgres_changes",{event:"INSERT",schema:"public",table:"projects"},({new:row})=>{
        setProjects(prev=>prev.some(p=>p.id===row.id)?prev:[...prev,row].sort((a,b)=>a.id.localeCompare(b.id)));
      })
      .on("postgres_changes",{event:"UPDATE",schema:"public",table:"projects"},({new:row})=>{
        setProjects(prev=>prev.map(p=>p.id===row.id?row:p));
      })
      .on("postgres_changes",{event:"DELETE",schema:"public",table:"projects"},({old:row})=>{
        setProjects(prev=>prev.filter(p=>p.id!==row.id));
      })
      // notifications â€” live bell updates without refresh
      .on("postgres_changes",{event:"INSERT",schema:"public",table:"notifications"},({new:row})=>{
        if(row.read) return;
        const _meId=String(myProfileRef.current?.id||"");
        const _meRole=myProfileRef.current?.role_type||"engineer";
        const _isAdminRT=_meRole==="admin";
        const _isLeadRT=["admin","lead"].includes(_meRole);
        // Check engineer_id (top-level column, post-migration) OR meta fallback (pre-migration)
        if(row.engineer_id!==null&&row.engineer_id!==undefined){
          if(String(row.engineer_id)!==_meId) return;
        } else {
          // No top-level engineer_id: check meta for personal notification pre-migration
          try{
            const m=JSON.parse(row.meta||"{}");
            const metaId=m.engineer_id||m.recipient_engineer_id||m._eng_id;
            if(metaId){
              if(String(metaId)!==_meId) return; // addressed to someone else
            } else {
              // Broadcast (no recipient in meta): only admin/lead
              if(!_isLeadRT) return;
            }
          }catch{ if(!_isLeadRT) return; }
        }
        setNotifications(prev=>prev.some(n=>n.id===row.id)?prev:[row,...prev]);
      })
      .on("postgres_changes",{event:"UPDATE",schema:"public",table:"notifications"},({new:row})=>{
        if(row.read) setNotifications(prev=>prev.filter(n=>n.id!==row.id));
        else setNotifications(prev=>prev.map(n=>n.id===row.id?row:n));
      })
      .on("postgres_changes",{event:"DELETE",schema:"public",table:"notifications"},({old:row})=>{
        setNotifications(prev=>prev.filter(n=>n.id!==row.id));
      })
      .subscribe();
    return ()=>{ supabase.removeChannel(ch); };
  },[session]); // eslint-disable-line
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
      const [engsR,projR,entrR,profR,staffR,expR,journalR,assetsR,accountsR]=await Promise.all([
        supabase.from("engineers").select("*").order("name"),
        supabase.from("projects").select("*").order("id"),
        supabase.from("time_entries").select("*").order("date",{ascending:false})
          .gte("date",`${today.getFullYear()-1}-01-01`),
        supabase.from("engineers").select("*").eq("user_id",session.user.id).single(),
        supabase.from("staff").select("*").order("name"),
        supabase.from("expenses").select("*").order("year",{ascending:false}).order("month",{ascending:false}),
        supabase.from("journal_entries").select("*").order("entry_date",{ascending:true}),
        supabase.from("finance_fixed_assets").select("*"),
        supabase.from("finance_accounts").select("*"),
      ]);
      if(engsR.data) setEngineers(engsR.data);
      if(projR.data) setProjects(projR.data);
      if(entrR.data){
        setEntries(entrR.data);
        setLoadedYears(new Set([today.getFullYear(), today.getFullYear()-1]));
      }
      if(profR.data){ setMyProfile(profR.data); myProfileRef.current=profR.data; setBrowseEngId(profR.data.id); }
      // â”€â”€ Notification loading â€” server-side scoped â”€â”€
      // The notifications table has a top-level engineer_id column (the recipient).
      // Personal: fetch only rows addressed to this user.
      // Broadcast (admin/lead): also fetch rows with engineer_id=null (alerts, signups).
      if(profR.data){
        const _profId=profR.data.id;
        const _profRole=profR.data?.role_type||"engineer";
        const _isLeadOrAdmin=["admin","lead"].includes(_profRole);
        const dismissedKeys=new Set(JSON.parse(localStorage.getItem("ec_dismissed_alerts")||"[]"));

        // 1. Personal active (unread) notifications
        // Try server-side filter (requires engineer_id column â€” run SQL migration if failing)
        const _ninetyAgo=new Date(Date.now()-90*24*60*60*1000).toISOString();
        const _thirtyAgo=new Date(Date.now()-30*24*60*60*1000).toISOString(); // kept for backward compat
        let personalNotifs=[], historyNotifs=[];

        // â”€â”€ Always use full-table meta-scan â€” works before AND after migration â”€â”€
        // engineer_id column may exist but be null on older rows, so we can't rely on
        // server-side filter alone. Fetch all and match by engineer_id OR meta fields.
        const _matchId=n=>{
          if(n.engineer_id!=null) return String(n.engineer_id)===String(_profId);
          try{
            const m=JSON.parse(n.meta||"{}");
            return String(m.engineer_id||m.recipient_engineer_id||m._eng_id||"")===String(_profId);
          }catch{return false;}
        };
        const _isBroadcast=n=>n.type==="new_signup"||n.type==="overdue_alert"||(n.type==="timesheet_alert"&&!n.engineer_id);

        // Active (unread) â€” fetch all unread, filter client-side
        const{data:allN}=await supabase.from("notifications")
          .select("*").eq("read",false).order("created_at",{ascending:false}).limit(300);
        personalNotifs=(allN||[]).filter(n=>_matchId(n)||(_isLeadOrAdmin&&_isBroadcast(n)));

        // History (read, last 90 days) â€” persistent 3-month window
        const{data:allH}=await supabase.from("notifications")
          .select("*").eq("read",true).gte("created_at",_ninetyAgo)
          .order("created_at",{ascending:false}).limit(500);
        // Include broadcasts (null engineer_id) in history for lead/admin â€” same logic as active
        historyNotifs=(allH||[]).filter(n=>_matchId(n)||(_isLeadOrAdmin&&_isBroadcast(n)));
        // â”€â”€ Auto-purge: admin/lead only â€” delete ALL notifications older than 90 days â”€â”€
        // Fire-and-forget, non-blocking. Engineers cannot purge admin notifications.
        if(_isLeadOrAdmin){
          supabase.from("notifications").delete()
            .lt("created_at",_ninetyAgo)
            .then(()=>{});
        }

        // 3. Deduplicate timesheet_alert by alert_key; delete dismissed + duplicates
        // (personalNotifs already includes broadcasts via _isBroadcast filter above)
        const allNotifs=[...(personalNotifs||[])];
        const seenKeys=new Map();
        const toDelete=[];
        allNotifs.forEach(n=>{
          if(n.type==="timesheet_alert"){
            let alertKey=null; try{alertKey=JSON.parse(n.meta||"{}").alert_key;}catch{}
            if(alertKey){
              // Composite key: alert_key + engineer_id â€” each recipient keeps their own copy
              const compositeKey=alertKey+"__"+(n.engineer_id||"broadcast");
              if(dismissedKeys.has(alertKey)){toDelete.push(n.id);return;}
              if(seenKeys.has(compositeKey)){
                const prev=seenKeys.get(compositeKey);
                if(n.id>prev.id){toDelete.push(prev.id);seenKeys.set(compositeKey,n);}
                else{toDelete.push(n.id);}
              }else{seenKeys.set(compositeKey,n);}
            }
          }
        });
        if(toDelete.length) supabase.from("notifications").delete().in("id",[...new Set(toDelete)]).then(()=>{});
        setNotifications(allNotifs.filter(n=>!toDelete.includes(n.id)));
        setNotifHistory((historyNotifs||[]).filter(n=>!toDelete.includes(n.id)));
      }
      if(staffR.data){
        const sData=staffR.data;
        setStaff(sData);
        // Sync termination_date from staff â†’ engineers by name match
        if(engsR.data){
          setEngineers(prev=>prev.map(eng=>{
            const match=sData.find(s=>s.name?.trim().toLowerCase()===eng.name?.trim().toLowerCase());
            if(!match) return eng;
            return {...eng, termination_date: match.termination_date||eng.termination_date||null};
          }));
        }
      }
      if(expR.data) setExpenses(expR.data);
      if(journalR.data) setJournalEntries(journalR.data);
      if(assetsR.data) setFixedAssets(assetsR.data);
      if(accountsR?.data) setAccounts(accountsR.data);
      // Load activity log for admin â€” use profR.data directly (myProfile state is stale here)
      if(profR.data?.role_type==="admin"){
        setLogLoading(true);
        (async()=>{
          const rows=[];let from=0;const batch=1000;
          while(true){
            const{data,error}=await supabase.from("activity_log").select("*").order("created_at",{ascending:false}).range(from,from+batch-1);
            if(error||!data?.length) break;
            rows.push(...data);
            if(data.length<batch) break;
            from+=batch;
            if(rows.length>=5000) break;
          }
          setActivityLog(rows);setLogLoading(false);
        })();
      }
      // Timesheet alerts: checked via checkTimesheetAlerts called from useEffect below
      // Frozen months
      try{const{data:_fm}=await supabase.from("frozen_months").select("*");if(_fm)setFrozenMonths(_fm);}catch(_){/* table may not exist yet -- run migration */}
    }catch(e){showToast("Error loading data",false);}
    setLoading(false);
  },[session]);

  // Load activities + subprojects lazily when tracker tab is first visited
  const loadTrackerData=useCallback(async()=>{
    if(activitiesLoaded) return;
    try{
      // Fetch subprojects and activities in parallel
      // Attempt 1: with sort_order (preferred â€” allows manual reordering)
      const [spRes,actRes]=await Promise.all([
        supabase.from("project_subprojects").select("*").order("name"),
        supabase.from("project_activities").select("*").order("sort_order"),
      ]);
      if(spRes.data)  setSubprojects(spRes.data);
      if(actRes.error&&actRes.error.message&&actRes.error.message.includes("sort_order")){
        // Fallback: sort_order column may not exist yet in DB â€” fetch without ordering
        const{data:actData}=await supabase.from("project_activities").select("*");
        if(actData) setActivities(actData);
      } else if(actRes.data){
        setActivities(actRes.data);
      }
      setActivitiesLoaded(true);
    }catch(e){
      // Network / table doesn't exist â€” try simple fetch without order
      try{
        const{data:actData}=await supabase.from("project_activities").select("*");
        const{data:spData}=await supabase.from("project_subprojects").select("*");
        if(actData) setActivities(actData);
        if(spData)  setSubprojects(spData);
      }catch(_){}
      setActivitiesLoaded(true);
    }
  },[activitiesLoaded,showToast]);

  const handleLogin=async e=>{
    e.preventDefault(); setAuthErr("");
    const {error}=await supabase.auth.signInWithPassword({email:authEmail,password:authPwd});
    if(error) setAuthErr(error.message);
    else { setTimeout(()=>logAction("LOGIN","Auth",`Signed in as ${authEmail}`),800); }
  };
  const handleLogout=async()=>{
    logAction("LOGOUT","Auth","Signed out");
    await supabase.auth.signOut();
    setSession(null);setEngineers([]);setProjects([]);setEntries([]);setLoadedYears(new Set());setMyProfile(null);setStaff([]);setExpenses([]);setJournalEntries([]);setFixedAssets([]);
    setAccounts([]);setActivityLog([]);setArchiveLog([]);
  };
  const handleChangePassword=async()=>{
    setPwdMsg(null);
    if(!pwdForm.newPwd||pwdForm.newPwd.length<6){setPwdMsg({ok:false,text:"Password must be at least 6 characters."});return;}
    if(pwdForm.newPwd!==pwdForm.confirmPwd){setPwdMsg({ok:false,text:"Passwords do not match."});return;}
    const{error}=await supabase.auth.updateUser({password:pwdForm.newPwd});
    if(error){setPwdMsg({ok:false,text:error.message});}
    else{
      setPwdMsg({ok:true,text:"Password changed successfully!"});
      logAction("UPDATE","Auth","User changed their password");
      setPwdForm({newPwd:"",confirmPwd:""});
      setTimeout(()=>{setShowPwdModal(false);setPwdMsg(null);},1500);
    }
  };

  // Load tracker data: eagerly when session exists (not lazily)
  // This ensures activities are always available in Projects view, Edit modal, Tracker
  useEffect(()=>{
    if(session&&!activitiesLoaded){ loadTrackerData(); }
  },[session,activitiesLoaded,loadTrackerData]);

  // â”€â”€â”€ Org Chart loader â”€â”€â”€
  const loadOrgChart = useCallback(async()=>{
    if(!session) return;
    const{data}=await supabase.from("org_chart").select("*").order("sort_order");
    if(data) setOrgNodes(data);
    setOrgLoaded(true);
  },[session]);

  useEffect(()=>{ if(session&&!orgLoaded) loadOrgChart(); },[session,orgLoaded,loadOrgChart]);



  const unreadCount=useMemo(()=>{
    // vacation_request: admins use pendingVacCount (from entries), leads count directly from notifications
    const personalCount=notifications.filter(n=>{
      if(n.type==="vacation_request") return isLead; // leads see it in count; admin uses pendingVacCount
      return true;
    }).length;
    // Pending vacation approvals â€” admin uses entries (always accurate even before bell loads)
    const pendingVacCount=isAdmin
      ? entries.filter(e=>e.entry_type==="leave"&&e.activity==="PENDING_APPROVAL").length
      : 0;
    return Math.max(personalCount, pendingVacCount);
  },[notifications,entries,isAdmin,isLead]);

  // Dismiss = permanently delete from DB so they never come back on refresh
  const dismissNotification=useCallback(async(id)=>{
    const n=notifications.find(x=>x.id===id);
    if(!n) return;
    // Track timesheet alert keys so they don't re-insert this session
    if(n.type==="timesheet_alert"){
      try{
        const meta=JSON.parse(n.meta||"{}");
        if(meta.alert_key){
          const prev=JSON.parse(localStorage.getItem("ec_dismissed_alerts")||"[]");
          localStorage.setItem("ec_dismissed_alerts",JSON.stringify([...new Set([...prev,meta.alert_key])]));
        }
      }catch(e){}
    }
    // Mark as read (moves to history) â€” NEVER hard-delete so history survives redeploy
    await supabase.from("notifications").update({read:true}).eq("id",id);
    setNotifications(prev=>prev.filter(x=>x.id!==id));
    setNotifHistory(prev=>[{...n,read:true},...prev.filter(x=>x.id!==id)].slice(0,200));
  },[notifications,setNotifHistory]);

  // â”€â”€ Activity comment handler â€” lifted to App scope so ALL surfaces share one notification path â”€â”€
  const appHandleActivityComment=useCallback(async(actId, comments, notifyCtx)=>{
    const{error}=await supabase.from("project_activities").update({comments}).eq("id",actId);
    if(!error){
      setActivities(prev=>prev.map(a=>a.id===actId?{...a,comments}:a));

      if(notifyCtx?.isNewComment && notifyCtx.commenterName){
        const newComment=comments[comments.length-1];
        const proj=projects.find(p=>p.id===notifyCtx.projectId);
        const projName=proj?.name||notifyCtx.projectId||"";
        const excerpt=(newComment?.text||"").slice(0,80);
        const msgText=`${notifyCtx.commenterName} commented on "${notifyCtx.activityName}" آ· ${projName}: "${excerpt}${excerpt.length>=80?"â€¦":""}"`;
        const isCommenter=e=>notifyCtx.commenterName&&e.name&&e.name.trim()===notifyCtx.commenterName.trim();

        // Build recipient list: assigned engineer + project leader + all admins
        const recipientIds=new Set();

        // 1. Assigned engineer on the activity
        if(notifyCtx.assignedTo){
          const eng=engineers.find(e=>e.name===notifyCtx.assignedTo);
          if(eng&&!isCommenter(eng)) recipientIds.add(String(eng.id));
        }
        // 2. Project Leader (stored on project record)
        if(proj?.project_leader){
          const ldr=engineers.find(e=>e.name===proj.project_leader);
          if(ldr&&!isCommenter(ldr)) recipientIds.add(String(ldr.id));
        }
        // 3. All admins
        engineers.forEach(e=>{
          if(e.role_type==="admin"&&!isCommenter(e)) recipientIds.add(String(e.id));
        });

        // Insert one notification row per recipient
        // Schema matches existing notifications table: type, read, message, created_at, meta
        const now=new Date().toISOString();
        for(const recipId of recipientIds){
          const notif={
            type:"activity_comment",
            engineer_id:parseInt(recipId,10)||recipId,
            read:false,
            message:msgText,
            created_at:now,
            meta:JSON.stringify({
              recipient_engineer_id:recipId,
              activity_id:actId,
              activity_name:notifyCtx.activityName,
              commenter:notifyCtx.commenterName,
              project_id:notifyCtx.projectId
            })
          };
          const{data:nd,error:ne}=await supabase.from("notifications").insert(notif).select().single();
          if(ne&&ne.message&&(ne.message.includes("engineer_id")||ne.message.includes("column")||ne.message.includes("does not exist"))){
            // Fallback: engineer_id column may not exist â€” store in meta
            const{engineer_id:_eid,..._rC}=notif;
            const{data:nd2}=await supabase.from("notifications").insert({..._rC,meta:JSON.stringify({...JSON.parse(_rC.meta||"{}"),_eng_id:String(_eid)})}).select().single();
            if(nd2&&String(recipId)===String(myProfile?.id)) setNotifications(prev=>[nd2,...prev]);
          } else if(nd){
            if(String(recipId)===String(myProfile?.id)) setNotifications(prev=>[nd,...prev]);
          } else if(ne){
            console.warn("[EC-ERP] activity_comment notification error:",ne.message);
          }
        }
      }
    } else {
      showToast("Comment error â€” the 'comments' column may not exist yet. Run the SQL migration in Admin â†’ Info.",false);
    }
    return error||null;
  },[supabase,setActivities,setNotifications,showToast,engineers,projects,myProfile]);

  const dismissAllOfType=useCallback(async(type)=>{
    const toRemove=notifications.filter(n=>n.type===type);
    if(!toRemove.length) return;
    // For timesheet alerts track keys in sessionStorage
    if(type==="timesheet_alert"){
      try{
        const keys=toRemove.map(n=>JSON.parse(n.meta||"{}").alert_key).filter(Boolean);
        const prev=JSON.parse(localStorage.getItem("ec_dismissed_alerts")||"[]");
        localStorage.setItem("ec_dismissed_alerts",JSON.stringify([...new Set([...prev,...keys])]));
      }catch(e){}
    }
    const ids=toRemove.map(n=>n.id);
    // Mark as read (moves to history) â€” NEVER hard-delete
    await supabase.from("notifications").update({read:true}).in("id",ids);
    setNotifications(prev=>prev.filter(n=>n.type!==type));
    setNotifHistory(prev=>[...toRemove.map(n=>({...n,read:true})),...prev].slice(0,200));
  },[notifications,setNotifHistory]);

  const markAllRead=async()=>{
    // Mark all unread as read â†’ moves them to history
    const unread=notifications.filter(n=>!n.read);
    if(!unread.length) return;
    const ids=unread.map(n=>n.id);
    await supabase.from("notifications").update({read:true}).in("id",ids);
    setNotifHistory(prev=>[...unread.map(n=>({...n,read:true})),...prev].slice(0,200));
    setNotifications([]);
  };

  /* â”€â”€ WEEKEND SAVE â”€â”€ */
  // saveWeekendFor: saves weekend for any engineer by id (admin can set for others)
  const saveWeekendFor=async(engId,days)=>{
    await supabase.from("engineers").update({weekend_days:JSON.stringify(days)}).eq("id",engId);
    setEngineers(prev=>prev.map(e=>e.id===engId?{...e,weekend_days:JSON.stringify(days)}:e));
    if(engId===myProfile?.id) setMyProfile(p=>({...p,weekend_days:JSON.stringify(days)}));
    showToast("Weekend preference saved âœ“");
  };
  // saveMyWeekend: shortcut for current user
  const saveMyWeekend=async days=>saveWeekendFor(myProfile.id,days);

  /* -- ADD ENTRY -- */
  /* -- Project eligibility: which projects can a given engineer post work hours to? --
     Rules:
     1. Project must be Active (not Completed, On Hold, or any other status)
     2. If project has assigned_engineers list with at least 1 entry ->
        engineer MUST be in that list
     3. If project has empty assigned_engineers -> visible to ALL engineers
     4. Admins/Leads/Accountants/Senior posting ON BEHALF of an engineer
        -> use the TARGET engineer's assignment, not the poster's role
  */
  const getPostableProjects = useCallback((forEngineerId) => {
    // Rule -- no exceptions, no role bypasses:
    // 1. Project must be Active
    // 2. forEngineerId must be in assigned_engineers
    //    Empty assigned_engineers [] = nobody assigned = project not available to anyone
    return projects.filter(p => {
      if((p.status||"").trim() !== "Active") return false;
      const ae = (p.assigned_engineers || []).map(String);
      return ae.includes(String(forEngineerId));
    });
  }, [projects]);

  const addEntry=async date=>{
    if(!isDateAllowed(date)){showToast("Cannot post hours outside the allowed date range",false);return;}
    // Freeze check â€” functions are always allowed, only work/leave are blocked
    if(newEntry.type!=="function"&&isMonthFrozen(date)){
      const _d=new Date(date+"T12:00:00");
      const _mn=["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"][_d.getMonth()];
      showToast(`â‌„ ${_mn} ${_d.getFullYear()} is frozen â€” contact admin to unlock`,false);
      return;
    }
    const proj=projects.find(p=>p.id===newEntry.projectId);
    const engId=canEditAny?viewEngId:myProfile.id;
    const isFunc=newEntry.type==="function";
    const isLeave=newEntry.type==="leave";
    const funcCat=isFunc?(newEntry.taskType||newEntry.function_category||FUNCTION_CATS[0]):null;
    const actId=(!isLeave&&!isFunc&&newEntry.activityId)?newEntry.activityId:null;
    // Validate: hours must be > 0 for non-leave entries
    if(!isLeave){
      const h=+newEntry.hours;
      if(!h||h<=0||isNaN(h)){showToast("Please enter hours greater than 0",false);return;}
    }
    // Validate: work entries must have a project
    if(!isLeave&&!isFunc&&!newEntry.projectId){showToast("Please select a project",false);return;}
    // Validate: admin posting for engineer must have engineer selected
    if(canEditAny&&!viewEngId){showToast("Please select an engineer",false);return;}
    // Validate: project must still be Active
    if(!isLeave&&!isFunc){
      const targetProj=projects.find(p=>p.id===newEntry.projectId);
      if(!targetProj){showToast("Project not found â€” it may have been deleted. Please refresh.",false);return;}
      if((targetProj.status||"").trim()!=="Active"){showToast(`Cannot post hours â€” project is ${targetProj.status||"inactive"}`,false);return;}
      // Assignment check â€” no role exemptions:
      const ae=(targetProj.assigned_engineers||[]).map(String);
      if(!ae.includes(String(engId))){
        const targetEngName=engineers.find(e=>String(e.id)===String(engId))?.name||"Engineer";
        showToast(`${targetEngName} is not assigned to ${targetProj.id}`,false);
        return;
      }
    }
    const selectedAct = actId ? activities.find(a=>String(a.id)===String(actId)) : null;
    // Vacation approval workflow: flag Annual Leave from non-admin/lead as pending
    const isAnnualLeave = isLeave && (newEntry.leaveType==="Annual Leave" || !newEntry.leaveType);
    const needsApproval = isAnnualLeave && !isAdmin; // only admin bypasses; lead, accountant, engineer all need approval
    const basePayload={
      engineer_id:engId,
      project_id: (isLeave||isFunc)?null:newEntry.projectId,
      date,
      task_category:(isLeave)?null:isFunc?"Function":(newEntry._group||newEntry.taskCategory),
      task_type:   (isLeave)?null:isFunc?funcCat:selectedAct?(selectedAct.activity_name):(newEntry.taskType||newEntry.taskCategory),
      hours:       isLeave?8:+newEntry.hours,
      activity:    needsApproval ? "PENDING_APPROVAL" : (newEntry.activity||null),
      entry_type:  (newEntry.type==="function")?"work":newEntry.type,
      leave_type:  isLeave?newEntry.leaveType:null,
      billable:    !isLeave&&!isFunc&&(projects.find(p=>p.id===newEntry.projectId)?.billable||false),
      activity_id: actId,
    };
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
    // If pending approval: create admin notification
    if(needsApproval && data){
      const _reqEng = engineers.find(e=>String(e.id)===String(engId));
      const notif = {
        type:"vacation_request", read:false,
        message:`${_reqEng?.name||"Someone"} requested Annual Leave on ${date}`,
        created_at:new Date().toISOString(),
        meta:JSON.stringify({entry_id:data.id,engineer_id:engId,engineer_name:_reqEng?.name,date,leave_type:newEntry.leaveType})
      };
      // Insert one vacation_request notification per admin (with their engineer_id)
      // so each admin's server-side scoped load query picks it up
      const _adminVacPayloads=engineers.filter(e=>e.role_type==="admin").map(adminEng=>({...notif,engineer_id:adminEng.id}));
      if(_adminVacPayloads.length) supabase.from("notifications").insert(_adminVacPayloads).select().then(({data:rows})=>{if(rows){const _my=rows.find(r=>String(r.engineer_id)===String(myProfile?.id));if(_my)setNotifications(prev=>[_my,...prev]);}});
      // Notify the engineer's direct lead (if any) â€” uses reverse BFS of mySubEngIds logic
      (async()=>{
        // Fetch org chart fresh if not loaded yet (avoids lazy-load race condition)
        let _nodes=orgNodes||[];
        if(!_nodes.length){
          try{const{data:_f}=await supabase.from("org_chart").select("*");if(_f)_nodes=_f;}catch(_){}
        }
        if(!_nodes.length) return; // org chart not configured
        // Find which lead has this engineer in their subtree (reverse of mySubEngIds BFS)
        // This handles optional engineer_id on intermediate nodes gracefully
        const _leadEng=engineers.filter(e=>e.role_type==="lead").find(le=>{
          const _leadNode=_nodes.find(n=>String(n.engineer_id)===String(le.id));
          if(!_leadNode) return false;
          // BFS down from lead node â€” check if engId appears anywhere in subtree
          const _q=[_leadNode.id];const _seen=new Set([_leadNode.id]);
          while(_q.length){
            const _nid=_q.shift();
            const _kids=_nodes.filter(n=>Number(n.parent_id)===Number(_nid));
            for(const _k of _kids){
              if(String(_k.engineer_id)===String(engId)) return true;
              if(!_seen.has(_k.id)){_seen.add(_k.id);_q.push(_k.id);}
            }
          }
          return false;
        });
        if(!_leadEng) return; // no lead manages this engineer
        const leadNotif={
          type:"vacation_request",engineer_id:_leadEng.id,read:false,
          message:`${_reqEng?.name||"Someone"} requested Annual Leave on ${date} (your team)`,
          created_at:new Date().toISOString(),
          meta:JSON.stringify({entry_id:data.id,engineer_id:engId,engineer_name:_reqEng?.name,date,leave_type:newEntry.leaveType,notify_lead:true,lead_id:String(_leadEng.id)})
        };
        const{data:ndL,error:neL}=await supabase.from("notifications").insert(leadNotif).select().single();
        if(neL&&neL.message&&(neL.message.includes("engineer_id")||neL.message.includes("column")||neL.message.includes("does not exist"))){
          const{engineer_id:_eid,..._rL}=leadNotif;
          const{data:ndL2}=await supabase.from("notifications").insert({..._rL,meta:JSON.stringify({...JSON.parse(_rL.meta||"{}"),_eng_id:String(_eid)})}).select().single();
          if(ndL2&&String(_leadEng.id)===String(myProfile?.id)) setNotifications(prev=>[ndL2,...prev]);
        } else if(ndL&&String(_leadEng.id)===String(myProfile?.id)){
          setNotifications(prev=>[ndL,...prev]);
        }
      })();
      showToast("Vacation request submitted â€” pending admin approval âœ“");
    } else {
      const hasNote = !!(newEntry.activity && newEntry.activity.trim().length > 2);
      const isWorkEntry = !isLeave && !isFunc;
      if(isWorkEntry && !hasNote){
        // Post succeeded but no description â€” show amber warning
        showToast("Hours posted â€” no description added. Add a note to improve your KPI score.",false);
      } else {
        showToast("Hours posted âœ“");
      }
    }
    // Notify engineer if lead/admin posted on their behalf
    if(data&&String(engId)!==String(myProfile?.id)&&!isLeave&&!isFunc){
      const _projName=projects.find(p=>p.id===newEntry.projectId)?.name||newEntry.projectId;
      insertNotif({type:"activity_assigned",engineer_id:engId,read:false,
        message:`${myProfile?.name||"Admin"} posted ${+newEntry.hours}h on "${_projName}" on your behalf for ${date}`,
        created_at:new Date().toISOString(),
        meta:JSON.stringify({engineer_id:String(engId),date,project_id:newEntry.projectId,hours:+newEntry.hours,posted_by:myProfile?.name})});
    }
    setModalDate(null);
    setNewEntry({projectId:"",_group:"SCADA",taskCategory:"Templates",taskType:"Block Template",hours:8,activity:"",type:"work",leaveType:LEAVE_TYPES[0],activityId:null,_actCat:null,_actSub:null,_step:1});
    const _engName = engineers.find(e=>String(e.id)===String(engId))?.name||engId;
    const _onBehalf = String(engId)!==String(myProfile?.id) ? ` on behalf of ${_engName}` : "";
    logAction("CREATE","TimeEntry",`Posted ${basePayload.hours}h on ${basePayload.project_id||basePayload.entry_type} for ${basePayload.date}${_onBehalf}`,{engineer_id:engId,engineer_name:_engName,project_id:basePayload.project_id,hours:basePayload.hours,date:basePayload.date,entry_type:basePayload.entry_type});
  };


  /* â”€â”€ Copy a day's entries to clipboard â”€â”€ */
  const copyDay = date => {
    const dayEntries = entries.filter(e=>
      e.date===date &&
      e.engineer_id===(canEditAny?viewEngId:myProfile.id) &&
      e.activity!=="PENDING_APPROVAL"  // never copy pending-approval entries
    );
    if(!dayEntries.length){showToast("No entries to copy",false);return;}
    setClipboard({date, entries:dayEntries});
    showToast(`Copied ${dayEntries.length} entr${dayEntries.length===1?"y":"ies"} from ${date} âœ“`);
  };

  /* â”€â”€ Paste clipboard entries to target date â”€â”€ */
  const pasteDay = async targetDate => {
    if(!clipboard||!clipboard.entries.length){showToast("Nothing in clipboard",false);return;}
    if(!isDateAllowed(targetDate)){showToast("Cannot post to locked date",false);return;}
    // Freeze check â€” block paste into frozen months (function entries are never in clipboard)
    if(isMonthFrozen(targetDate)){
      const _d=new Date(targetDate+"T12:00:00");
      const _mn=["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"][_d.getMonth()];
      showToast(`â‌„ ${_mn} ${_d.getFullYear()} is frozen â€” cannot paste into a frozen month`,false);
      return;
    }
    const engId = canEditAny?viewEngId:myProfile.id;
    // Validate all work entries reference still-active projects
    for(const e of clipboard.entries){
      if(e.entry_type==="work"&&e.project_id){
        const proj=projects.find(p=>p.id===e.project_id);
        if(!proj||(proj.status||"").trim()!=="Active"){
          showToast(`Cannot paste â€” project ${proj?.name||e.project_id} (${e.project_id}) is no longer active`,false);return;
        }
        const ae=(proj.assigned_engineers||[]).map(String);
        if(!ae.includes(String(engId))){
          const nm=engineers.find(x=>String(x.id)===String(engId))?.name||"Engineer";
          const projName=proj?.name||e.project_id;
          showToast(`Cannot paste â€” ${nm} is not assigned to ${projName} (${e.project_id})`,false);return;
        }
      }
    }
    const inserts = clipboard.entries.map(e=>({
      engineer_id: engId,
      project_id:  e.project_id,
      date:        targetDate,
      task_category: e.task_category,
      task_type:   e.task_type,
      hours:       e.hours,
      activity:    e.activity==="PENDING_APPROVAL"?null:e.activity,  // never paste a pending state
      entry_type:  e.entry_type,
      leave_type:  e.leave_type||null,
      billable:    e.billable||false,
      activity_id: e.activity_id||null,
      function_category: e.function_category||null,
    }));
    // Try with function_category; fall back without it if column not yet migrated
    let {data,error}=await supabase.from("time_entries").insert(inserts).select();
    if(error&&error.message&&error.message.includes("function_category")){
      const stripped=inserts.map(({function_category,...rest})=>rest);
      const res=await supabase.from("time_entries").insert(stripped).select();
      data=res.data; error=res.error;
    }
    if(error){showToast("Paste error: "+error.message,false);return;}
    if(data){
      const pastedIds=data.map(e=>e.id);
      const _engName2 = engineers.find(e=>String(e.id)===String(engId))?.name||engId;
      const _onBehalf2 = String(engId)!==String(myProfile?.id) ? ` on behalf of ${_engName2}` : "";
      // Add entries to UI immediately
      setEntries(prev=>[...data,...prev]);
      // Show toast with undo â€” clicking Undo removes from UI and deletes from DB
      showToast(
        `Pasted ${data.length} entr${data.length===1?"y":"ies"} to ${targetDate}`,
        true,
        async()=>{
          setEntries(prev=>prev.filter(e=>!pastedIds.includes(e.id)));
          await supabase.from("time_entries").delete().in("id",pastedIds);
          showToast("Paste undone âœ“");
        }
      );
      logAction("CREATE","TimeEntry",`Pasted ${data.length} entries to ${targetDate}${_onBehalf2}`,{engineer_id:engId,engineer_name:_engName2,date:targetDate,count:data.length});
    }
  };

  const saveEditEntry=async()=>{
    if(!editEntry) return;
    if(isMonthFrozen(editEntry.date)){
      const _d=new Date(editEntry.date+"T12:00:00");
      const _mn=["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"][_d.getMonth()];
      showToast(`â‌„ ${_mn} ${_d.getFullYear()} is frozen â€” contact admin to unlock`,false);
      return;
    }
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
    setEditEntry(null); showToast("Entry updated âœ“");
    const _editEngName = engineers.find(e=>String(e.id)===String(editEntry?.engineer_id))?.name||"";
    const _editOnBehalf = editEntry?.engineer_id && String(editEntry.engineer_id)!==String(myProfile?.id) ? ` on behalf of ${_editEngName}` : "";
    const _prevEntry = entries.find(e=>e.id===editEntry?.id)||{};
    const _entryChanges=[];
    if(_prevEntry.hours!==payload.hours) _entryChanges.push(`hours: ${_prevEntry.hours}â†’${payload.hours}`);
    if(_prevEntry.project_id!==payload.project_id) _entryChanges.push(`project: ${_prevEntry.project_id||"â€”"}â†’${payload.project_id||"â€”"}`);
    if(payload.activity&&_prevEntry.activity!==payload.activity) _entryChanges.push(`note: "${payload.activity}"`);
    logAction("UPDATE","TimeEntry",`Updated entry on ${editEntry?.date}${_editOnBehalf}${_entryChanges.length?" â€” "+_entryChanges.join(", "):""}`,{id:editEntry?.id,engineer_id:editEntry?.engineer_id,engineer_name:_editEngName,date:editEntry?.date,changes:_entryChanges});
  };

  const deleteEntry=async(id, engineerId)=>{
    if(!canEditAny && String(engineerId)!==String(myProfile?.id)){ showToast("You can only delete your own entries",false); return; }
    const entry=entries.find(e=>e.id===id);
    if(!entry) return;
    // â”€â”€ FREEZE CHECK â”€â”€
    if(isMonthFrozen(entry.date)){
      const _d=new Date(entry.date+"T12:00:00");
      const _mn=["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"][_d.getMonth()];
      showToast(`â‌„ ${_mn} ${_d.getFullYear()} is frozen â€” contact admin to unlock`,false);
      return;
    }
    // â”€â”€ APPROVED LEAVE LOCK â”€â”€
    // Once annual leave is approved (no longer PENDING_APPROVAL), only admin can delete it.
    // Engineers must contact their admin to cancel approved leave â€” this preserves the approval audit trail.
    const isApprovedLeave = entry.entry_type==="leave"
      && entry.leave_type==="Annual Leave"
      && entry.activity!=="PENDING_APPROVAL";
    // Only admin can cancel approved leave â€” lead and engineer must request through admin
    if(isApprovedLeave && !isAdmin){
      showToast("Approved annual leave cannot be deleted. Contact admin to cancel.",false);
      return;
    }
    const _engName=engineers.find(e=>String(e.id)===String(engineerId))?.name||engineerId;
    const _onBehalf=String(engineerId)!==String(myProfile?.id)?` on behalf of ${_engName}`:"";
    const _confirmMsg=isApprovedLeave
      ? "This will permanently cancel the approved annual leave. The engineer will be notified."
      : "This time entry will be permanently removed.";
    // Detect pending vacation (submitted but not yet approved)
    const isPendingLeave=entry.entry_type==="leave"&&entry.leave_type==="Annual Leave"&&entry.activity==="PENDING_APPROVAL";
    showConfirm(_confirmMsg,()=>{
      // 1. INSTANT UI remove â€” synchronous, user sees it gone at once
      setEntries(prev=>prev.filter(e=>e.id!==id));
      // 2. Show undo toast IMMEDIATELY (synchronous â€” no await delay)
      let _undone=false;
      showToast("Entry deleted â€” Undo?",false,()=>{
        _undone=true;
        setEntries(prev=>{const _ids=new Set(prev.map(e=>e.id));return _ids.has(entry.id)?prev:[entry,...prev].sort((a,b)=>b.date.localeCompare(a.date));});
        showToast("Undo successful âœ“");
      });
      // 3. DB delete after 5s undo window (applies to ALL entry types including vacation)
      setTimeout(async()=>{
        if(_undone) return;
        const{error:_delErr}=await supabase.from("time_entries").delete().eq("id",id);
        if(_delErr){
          setEntries(prev=>{const _ids=new Set(prev.map(e=>e.id));return _ids.has(entry.id)?prev:[entry,...prev].sort((a,b)=>b.date.localeCompare(a.date));});
          showToast("Delete failed â€” restored: "+_delErr.message,false);
          return;
        }
        // 4. Send notification after DB delete confirms
        if(isApprovedLeave&&isAdmin){
          insertNotif({
            type:"vacation_cancelled",engineer_id:entry.engineer_id,read:false,
            message:`Your approved Annual Leave on ${entry.date} has been cancelled by admin`,
            created_at:new Date().toISOString(),
            meta:JSON.stringify({engineer_id:String(entry.engineer_id),date:entry.date,entry_id:id,cancelled_by:myProfile?.name})
          });
        }
        if(isPendingLeave&&isAdmin){
          insertNotif({
            type:"vacation_rejected",engineer_id:entry.engineer_id,read:false,
            message:`Your Annual Leave request on ${entry.date} was cancelled by admin`,
            created_at:new Date().toISOString(),
            meta:JSON.stringify({engineer_id:String(entry.engineer_id),date:entry.date,entry_id:id,cancelled_by:myProfile?.name})
          });
        }
        logAction("DELETE","TimeEntry",`Deleted time entry id:${id}${_onBehalf}`,{id,engineer_id:engineerId,engineer_name:_engName});
      },3100);
    },{title:isApprovedLeave?"Cancel Approved Leave":isPendingLeave?"Remove Vacation Request":"Delete Time Entry",confirmLabel:"Delete"});
  };

  /* â”€â”€ FUNCTION ENTRIES & KPI ALERTS â”€â”€ */
  const addFunctionEntry=useCallback(async()=>{
    if(!newFunc.engineer_id){showToast("Select an engineer",false);return;}
    if(!newFunc.hours||newFunc.hours<=0){showToast("Enter hours > 0",false);return;}
    // function_category column requires SQL migration â€” try with it, fallback without
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
    showToast("Function hours posted âœ“");
    const _funcEngName=engineers.find(e=>String(e.id)===String(newFunc.engineer_id))?.name||newFunc.engineer_id;
    const _funcOnBehalf=String(newFunc.engineer_id)!==String(myProfile?.id)?` on behalf of ${_funcEngName}`:"";
    logAction("CREATE","TimeEntry",`Posted function ${newFunc.hours}h â€” ${newFunc.function_category} for ${newFunc.date}${_funcOnBehalf}`,{engineer_id:newFunc.engineer_id,engineer_name:_funcEngName,category:newFunc.function_category,hours:newFunc.hours,date:newFunc.date});
    setShowFuncModal(false);
    setNewFunc({engineer_id:"",date:new Date().toISOString().slice(0,10),function_category:FUNCTION_CATS[0],hours:2,activity:""});
  },[newFunc,showToast]);

  // Check for engineers who haven't posted hours by Friday â€” only alerts on Fri/Sat/Sun
  const checkTimesheetAlerts=useCallback(async(engs,allE,staffList=[],currentNotifs=[],_orgNodes=[])=>{
    if(!isAdmin&&!isLead) return;
    const today=new Date();
    const dayOfWeek=today.getDay();
    if(dayOfWeek!==alertDay) return;
    const _alertHour=parseInt((alertTime||"09:00").split(":")[0],10);
    if(today.getHours()<_alertHour) return;
    const mondayOffset=dayOfWeek===0?-6:1-dayOfWeek;
    const weekStart=new Date(today);weekStart.setDate(today.getDate()+mondayOffset);weekStart.setHours(0,0,0,0);
    const friday=new Date(weekStart);friday.setDate(weekStart.getDate()+4);
    const weekStartStr=weekStart.toISOString().slice(0,10);
    const fridayStr=friday.toISOString().slice(0,10);
    const todayStr=today.toISOString().slice(0,10);

    // Fetch org chart if not passed in
    let _nodes=_orgNodes.length?_orgNodes:orgNodes;
    if(!_nodes.length){
      try{const{data:_f}=await supabase.from("org_chart").select("*");if(_f)_nodes=_f;}catch(_){}
    }
    // Build set of engineer_ids present in org chart (only alert for these)
    const _orgEngIds=new Set(_nodes.map(n=>String(n.engineer_id)).filter(Boolean));

    const laggards=[];
    engs.forEach(eng=>{
      // Skip non-billable roles
      if(["accountant","senior_management","admin"].includes(eng.role_type)) return;
      // Skip inactive (all falsy values: false, 0, null)
      if(eng.is_active===false||eng.is_active===0||eng.is_active===null) return;
      // Skip terminated
      if(eng.termination_date&&String(eng.termination_date).slice(0,10)<=todayStr) return;
      // Skip if not active in staff table
      const staffMatch=staffList.find(s=>s.name?.trim().toLowerCase()===eng.name?.trim().toLowerCase());
      if(staffMatch){
        if(staffMatch.active===false) return;
        if(staffMatch.termination_date&&String(staffMatch.termination_date).slice(0,10)<todayStr) return;
      }
      // â”€â”€ KEY FIX: skip engineers not in org chart â”€â”€
      if(_nodes.length&&!_orgEngIds.has(String(eng.id))) return;
      const hasWeekHours=allE.some(e=>String(e.engineer_id)===String(eng.id)&&e.date>=weekStartStr&&e.date<=fridayStr&&(e.entry_type==="work"||e.task_category==="Function"));
      const onApprovedLeave=allE.some(e=>String(e.engineer_id)===String(eng.id)&&e.date>=weekStartStr&&e.date<=fridayStr&&e.entry_type==="leave"&&e.activity!=="PENDING_APPROVAL");
      if(!hasWeekHours&&!onApprovedLeave) laggards.push({eng,type:"weekly",label:`No hours posted this week (Mon ${weekStartStr} â†’ Fri ${fridayStr})`});
    });
    if(laggards.length===0) return;

    // Build known keys to avoid duplicates
    const knownKeys=new Set([
      ...currentNotifs.map(n=>{try{return JSON.parse(n.meta||"{}").alert_key;}catch{return null;}}).filter(Boolean),
      ...JSON.parse(localStorage.getItem("ec_dismissed_alerts")||"[]"),
    ]);

    // â”€â”€ KEY FIX: send per-recipient (admin + scoped lead) not as broadcast â”€â”€
    // Build reverse BFS helper: given engineer id, find which lead manages them
    const _findLead=(engId)=>{
      if(!_nodes.length) return null;
      return engs.filter(e=>e.role_type==="lead").find(le=>{
        const _ln=_nodes.find(n=>String(n.engineer_id)===String(le.id));
        if(!_ln) return false;
        const _q=[_ln.id];const _seen=new Set([_ln.id]);
        while(_q.length){
          const _nid=_q.shift();
          const _kids=_nodes.filter(n=>Number(n.parent_id)===Number(_nid));
          for(const _k of _kids){
            if(String(_k.engineer_id)===String(engId)) return true;
            if(!_seen.has(_k.id)){_seen.add(_k.id);_q.push(_k.id);}
          }
        }
        return false;
      })||null;
    };

    const _now=new Date().toISOString();
    for(const{eng,type,label}of laggards){
      const key=`timesheet_alert_${eng.id}_${type}_${weekStartStr}`;
      if(knownKeys.has(key)) continue;
      const _msg=`âڈ° ${eng.name}: ${label}`;
      const _meta=JSON.stringify({engineer_id:eng.id,alert_key:key,alert_type:type});
      // Find the lead who manages this engineer
      const _leadEng=_findLead(eng.id);
      // Build recipient list: all admins + scoped lead (deduplicated)
      const _recipients=[
        ...engs.filter(e=>e.role_type==="admin"),
        ...(_leadEng?[_leadEng]:[]),
      ].filter((e,i,arr)=>arr.findIndex(x=>x.id===e.id)===i); // deduplicate
      // Bulk insert one notification per recipient
      const _payloads=_recipients.map(r=>({type:"timesheet_alert",engineer_id:r.id,read:false,message:_msg,created_at:_now,meta:_meta}));
      if(_payloads.length){
        const{data:_rows,error:_ne}=await supabase.from("notifications").insert(_payloads).select();
        if(_ne) console.warn("[EC-ERP] timesheet_alert insert failed:",_ne.message);
        else if(_rows){
          // Show in current user's bell if they are a recipient
          const _mine=_rows.find(r=>String(r.engineer_id)===String(myProfile?.id));
          if(_mine) setNotifications(prev=>[_mine,...prev]);
        }
      }
      knownKeys.add(key);
    }
  },[isAdmin,isLead,alertDay,alertTime,orgNodes,myProfile,supabase,insertNotif,setNotifications]);

  // Run alert check once when user first logs in (engineers+entries loaded)
  const alertsRanRef = React.useRef(false);
  useEffect(()=>{
    if(!session||(!isAdmin&&!isLead)) return;
    if(alertsRanRef.current) return;
    if(!engineers.length||!entries.length) return;
    alertsRanRef.current = true;
    const notifSnapshot = notifications.slice();
    setTimeout(()=>checkTimesheetAlerts(engineers,entries,staff,notifSnapshot,orgNodes),1500);
    // Check for overdue tracker activities (not completed, past end_date)
    setTimeout(()=>{
      const _oNow=new Date();
      const todayStr=`${_oNow.getFullYear()}-${String(_oNow.getMonth()+1).padStart(2,"0")}-${String(_oNow.getDate()).padStart(2,"0")}`;
      const overdue = activities.filter(a=>{
        if(!a.end_date||a.end_date>=todayStr) return false;
        if(a.status==="Completed"||a.status==="Cancelled"||a.status==="On Hold") return false;
        // Exclude activities on On Hold or Completed projects
        const _proj=projects.find(p=>p.id===a.project_id);
        if(_proj&&(_proj.status==="On Hold"||_proj.status==="Completed")) return false;
        return true;
      });
      if(overdue.length > 0){
        const key = "overdue_activities_" + todayStr;
        const dismissed = new Set(JSON.parse(localStorage.getItem("ec_dismissed_alerts")||"[]"));
        if(!dismissed.has(key)){
          // Persist to DB so overdue_alert survives page refresh
          supabase.from("notifications").select("id").eq("type","overdue_alert")
            .then(({data:existing})=>{
              if(existing&&existing.length>0){
                // Update existing row
                supabase.from("notifications").update({
                  message:`${overdue.length} tracker activit${overdue.length===1?"y":"ies"} past deadline`,
                  meta:JSON.stringify({alert_key:key,count:overdue.length,projects:[...new Set(overdue.map(a=>a.project_id))].slice(0,3)}),
                  created_at:new Date().toISOString()
                }).eq("type","overdue_alert").then(()=>{});
              } else {
                (async()=>{
                  const _ovPayload={type:"overdue_alert",read:false,
                    message:`${overdue.length} tracker activit${overdue.length===1?"y":"ies"} past deadline`,
                    created_at:new Date().toISOString(),
                    meta:JSON.stringify({alert_key:key,count:overdue.length,projects:[...new Set(overdue.map(a=>a.project_id))].slice(0,3)})};
                  try{
                    const{data:nd,error:ne}=await supabase.from("notifications").insert(_ovPayload).select().single();
                    if(nd) setNotifications(prev=>[...prev.filter(n=>n.type!=="overdue_alert"),nd]);
                    else if(ne) console.warn("[EC-ERP] overdue_alert insert failed:",ne.message);
                  }catch(e){console.warn("[EC-ERP] overdue_alert insert error:",e.message);}
                })();
              }
            });
        }
      }
    },2500);
  },[session,engineers.length,entries.length,activities.length]); // eslint-disable-line

  /* â”€â”€ FINANCE CRUD â”€â”€ */
  const STAFF_DEPTS=["Engineering","Management","Finance","Operations","IT","Administration","Other"];
  const STAFF_TYPES=["full_time","part_time","contractor","intern"];
  const EXP_CATS=["Office Rent & Utilities","Salaries","Software & Subscriptions","Travel & Transportation","Equipment & Supplies","Other"];

  const saveStaff=useCallback(async()=>{
    const raw=editStaff?{...editStaff}:{...newStaff};
    if(!raw.name.trim()){showToast("Name required",false);return;}
    // ONLY columns that exist in the staff table â€” strip engineer-only fields
    const staffPayload={
      name:            raw.name.trim(),
      department:      raw.department||"Engineering",
      role:            raw.role||"",
      type:            raw.type||"full_time",
      active:          raw.active!==false,
      salary_usd:      raw.salary_usd||0,
      salary_egp:      raw.salary_egp||0,
      join_date:       raw.join_date||null,
      termination_date:raw.termination_date||null,
      notes:           raw.notes||"",
    };
    if(editStaff){
      // â”€â”€ EDIT staff â”€â”€
      const{data,error}=await supabase.from("staff").update(staffPayload).eq("id",editStaff.id).select().single();
      if(error){showToast("Error: "+error.message,false);return;}
      setStaff(prev=>prev.map(s=>s.id===data.id?data:s));
      // Sync role + active + dates to matching engineer
      const matchEng=engineers.find(e=>e.name?.trim().toLowerCase()===data.name?.trim().toLowerCase());
      if(matchEng){
        const engSync={role:data.role||matchEng.role,is_active:data.active!==false,join_date:data.join_date||null,termination_date:data.termination_date||null};
        await supabase.from("engineers").update(engSync).eq("id",matchEng.id);
        setEngineers(prev=>prev.map(e=>e.id===matchEng.id?{...e,...engSync}:e));
      }
      showToast("Staff updated âœ“");setEditStaff(null);setShowStaffModal(false);
      const _sprev=staff.find(s=>s.id===editStaff.id)||{};
      const _schanges=[];
      if(_sprev.role!==data.role) _schanges.push(`role: "${_sprev.role||"â€”"}"â†’"${data.role||"â€”"}"`);
      if(_sprev.department!==data.department) _schanges.push(`dept: ${_sprev.department}â†’${data.department}`);
      if(String(_sprev.active)!==String(data.active)) _schanges.push(`active: ${_sprev.active}â†’${data.active}`);
      if(_sprev.termination_date!==data.termination_date) _schanges.push(`termination: ${_sprev.termination_date||"none"}â†’${data.termination_date||"none"}`);
      if(_sprev.salary_egp!==data.salary_egp) _schanges.push(`salary EGP: ${_sprev.salary_egp||0}â†’${data.salary_egp||0}`);
      logAction("UPDATE","Staff",`Updated staff: ${data.name}${_schanges.length?" â€” "+_schanges.join(", "):""}`,{id:data.id,name:data.name,department:data.department,role:data.role,changes:_schanges});
    } else {
      // â”€â”€ ADD staff â”€â”€
      const{data,error}=await supabase.from("staff").insert(staffPayload).select().single();
      if(error){showToast("Error: "+error.message,false);return;}
      setStaff(prev=>[...prev,data].sort((a,b)=>a.name.localeCompare(b.name)));
      // Auto-create engineer record â€” check by name OR email to prevent duplication
      const existsEngByName=engineers.find(e=>e.name?.trim().toLowerCase()===data.name?.trim().toLowerCase());
      const existsEngByEmail=raw.email?.trim()?engineers.find(e=>e.email?.trim().toLowerCase()===raw.email.trim().toLowerCase()):null;
      const existsEng=existsEngByName||existsEngByEmail;
      // Also check: if staff record already existed before this insert (was added via Add Member previously)
      // In that case the engineer record already exists â€” just show the linked message
      if(!existsEng&&raw.email?.trim()){
        const engAttempts=[
          {name:data.name,email:raw.email.trim().toLowerCase(),role:data.role||ROLES_LIST[0],
           level:raw.level||"Mid",role_type:raw.role_type||"engineer",is_active:true,
           join_date:null,termination_date:null,weekend_days:JSON.stringify(DEFAULT_WEEKEND)},
          {name:data.name,email:raw.email.trim().toLowerCase(),role:data.role||ROLES_LIST[0],
           level:raw.level||"Mid",role_type:raw.role_type||"engineer",is_active:true,
           weekend_days:JSON.stringify(DEFAULT_WEEKEND)},
          {name:data.name,email:raw.email.trim().toLowerCase(),role:data.role||ROLES_LIST[0],
           level:raw.level||"Mid",role_type:raw.role_type||"engineer"},
          {name:data.name,role:data.role||ROLES_LIST[0],level:raw.level||"Mid",role_type:raw.role_type||"engineer"},
        ];
        let ed=null;
        for(const attempt of engAttempts){
          const res=await supabase.from("engineers").insert(attempt).select().single();
          if(!res.error){ed={...attempt,...res.data,is_active:true,join_date:null,termination_date:null,email:raw.email?.trim().toLowerCase()||"",weekend_days:JSON.stringify(DEFAULT_WEEKEND)};break;}
        }
        if(ed){
          setEngineers(prev=>[...prev,ed].sort((a,b)=>a.name.localeCompare(b.name)));
          showToast("Member added âœ“ â€” appears in Team + Finance");
          logAction("CREATE","Staff",`Added staff+engineer: ${data.name}`,{id:data.id,name:data.name,role:data.role,department:data.department});
        } else {
          showToast("Staff added âœ“ â€” set salary in Finance â€؛ Staff");
          logAction("CREATE","Staff",`Added staff (no engineer link): ${data.name}`,{id:data.id,name:data.name});
        }
      } else if(existsEng){
        showToast("Staff added âœ“ â€” linked to existing engineer profile");
        logAction("CREATE","Staff",`Added staff (linked to existing engineer): ${data.name}`,{id:data.id,name:data.name});
      } else {
        showToast("Staff added âœ“ â€” provide email to grant system access");
        logAction("CREATE","Staff",`Added staff (no email/access): ${data.name}`,{id:data.id,name:data.name});
      }
      setShowStaffModal(false);
      setNewStaff({name:"",department:"Engineering",role:"",salary_usd:0,salary_egp:0,type:"full_time",active:true,join_date:null,termination_date:null,email:"",level:"Mid",role_type:"engineer",notes:""});
    }
  },[editStaff,newStaff,engineers,showToast]);

  const deleteStaff=useCallback(async(id)=>{
    const item=staff.find(s=>s.id===id);
    const name=item?.name||id;
    showConfirm(`Remove ${name} from the staff salary table? This does not delete their engineer account.`,()=>{
      applyUndo(
        showToast,`${name} removed from staff`,
        ()=>setStaff(prev=>prev.filter(s=>s.id!==id)),
        ()=>setStaff(prev=>[item,...prev].sort((a,b)=>a.name.localeCompare(b.name))),
        async()=>{ const{error}=await supabase.from("staff").delete().eq("id",id); return error||null; },
        ()=>logAction("DELETE","Staff",`Deleted staff member: ${name}`,{id,name})
      );
    },{title:"Remove Staff Member",confirmLabel:"Remove"});
  },[staff,logAction,showConfirm,showToast]);

  const saveExpense=useCallback(async()=>{
    const payload=editExp?{...editExp}:{...newExp};
    if(!payload.description.trim()){showToast("Description required",false);return;}
    if(editExp){
      const{data,error}=await supabase.from("expenses").update(payload).eq("id",editExp.id).select().single();
      if(!error&&data){
        const _prev=expenses.find(e=>e.id===data.id)||{};
        const _expChanges=[];
        if(_prev.description!==data.description) _expChanges.push(`desc: "${_prev.description}"â†’"${data.description}"`);
        if(_prev.category!==data.category) _expChanges.push(`category: ${_prev.category}â†’${data.category}`);
        if(_prev.amount_egp!==data.amount_egp) _expChanges.push(`EGP: ${_prev.amount_egp||0}â†’${data.amount_egp||0}`);
        if(_prev.amount_usd!==data.amount_usd) _expChanges.push(`USD: ${_prev.amount_usd||0}â†’${data.amount_usd||0}`);
        setExpenses(prev=>prev.map(e=>e.id===data.id?data:e));showToast("Expense updated");setEditExp(null);setShowExpModal(false);
        logAction("UPDATE","Expense",`Updated expense: ${data.description}${_expChanges.length?" â€” "+_expChanges.join(", "):""}`,{id:data.id,category:data.category,amount_usd:data.amount_usd,amount_egp:data.amount_egp,changes:_expChanges});
      }
      else showToast(error?.message||"Error",false);
    } else {
      const{data,error}=await supabase.from("expenses").insert(payload).select().single();
      if(!error&&data){setExpenses(prev=>[data,...prev]);showToast("Expense added");setShowExpModal(false);setNewExp({category:"Office Rent & Utilities",description:"",amount_usd:0,amount_egp:0,currency:"USD",entry_rate:egpRate,month:new Date().getMonth(),year:new Date().getFullYear(),notes:""});logAction("CREATE","Expense",`Added expense: "${payload.description}" â€” ${payload.category} آ· EGP ${payload.amount_egp||0} / USD ${payload.amount_usd||0}`,{category:payload.category,amount_usd:payload.amount_usd,amount_egp:payload.amount_egp,month:payload.month,year:payload.year});}
      else showToast(error?.message||"Error",false);
    }
  },[editExp,newExp,showToast]);

  const deleteExpense=useCallback(async(id)=>{
    const exp=expenses.find(e=>e.id===id);
    showConfirm(`Delete "${exp?.description||"this expense"}"?`,()=>{
      applyUndo(
        showToast,"Expense deleted",
        ()=>setExpenses(prev=>prev.filter(e=>e.id!==id)),
        ()=>setExpenses(prev=>[exp,...prev]),
        async()=>{ const{error}=await supabase.from("expenses").delete().eq("id",id); return error||null; },
        ()=>logAction("DELETE","Expense",`Deleted expense: ${exp?.description||id}`,{id,description:exp?.description})
      );
    },{title:"Delete Expense",confirmLabel:"Delete"});
  },[expenses,logAction,showConfirm,showToast]);

  /* â”€â”€ EXCEL IMPORT â”€â”€ */
  const importTimesheets=async files=>{
    setImporting(true);
    setImportLog([]);
    const log=[];
    const addLog=(type,msg)=>{log.push({type,msg});setImportLog([...log]);};

    // Working copies of projects/engineers (updated during import as new ones are created)
    let localProjects=[...projects];
    let localEngineers=[...engineers];

    // Cache of nameâ†’project to avoid duplicate inserts across rows
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
      // Auto-create â€” use "Industrial" type (matches DB constraint)
      // Make a safe ID: alphanumeric + hyphens only, max 30 chars
      const projId=clean.replace(/[^a-zA-Z0-9]/g,"-").replace(/-+/g,"-").replace(/^-|-$/g,"").substring(0,30);
      addLog("info",`    ًں“پ Creating project: ${clean}`);
      const {data:newPArr,error:pErr}=await supabase.from("projects").insert({
        id:projId, name:clean, client:"(imported)", type:"Industrial",
        status:"Active", phase:"Design", billable:true, rate_per_hour:0,
      }).select();
      if(pErr){
        addLog("warn",`    âڑ  Project failed: ${pErr.message}`);
        projCache[cleanLower]=null; // cache failure to avoid retrying every row
        return null;
      }
      const newP=Array.isArray(newPArr)?newPArr[0]:newPArr;
      if(!newP){ projCache[cleanLower]=null; return null; }
      localProjects=[...localProjects,newP];
      setProjects(prev=>[...prev,newP].sort((a,b)=>a.id.localeCompare(b.id)));
      addLog("ok",`    âœ“ Project created: ${clean} (${projId})`);
      projCache[cleanLower]=newP;
      return newP;
    };

    for(const file of files){
      addLog("info",`ًں“‚ Processing: ${file.name}`);
      try{
        const buf=await file.arrayBuffer();
        const XLSX=window.XLSX;
        if(!XLSX){addLog("error","SheetJS not loaded â€” go back and wait for âœ“ XLSX READY, then try again");break;}
        const wb=XLSX.read(new Uint8Array(buf),{type:"array",cellDates:true});
        const ws=wb.Sheets[wb.SheetNames[0]];
        const rows=XLSX.utils.sheet_to_json(ws,{header:1,defval:"",raw:true});


        // â”€â”€ FIX: Detect column layout â€” standard (col 0) vs shifted (col 4, Shehab-style) â”€â”€
        // Standard: row[0]=Date/Name, row[1]=email value, row[2]=task...
        // Shifted:  row[4]=Name label, row[5]=Name value, row[6]=task...
        let colOffset=0;
        const r0=String(rows[0]?.[0]||"").trim().toLowerCase();
        const r0c4=String(rows[0]?.[4]||"").trim().toLowerCase();
        if(!r0&&r0c4==="name"){ colOffset=4; addLog("info","  â„¹ Shifted column layout detected (offset +4)"); }

        // Parse header (row 0=Name, row 1=Email, row 2=Month)
        const engName=String(rows[0]?.[colOffset+1]||"").trim();
        const engEmail=String(rows[1]?.[colOffset+1]||"").trim().toLowerCase();
        const engRole=String(rows[0]?.[colOffset+4]||"").trim();

        if(!engName||!engEmail){addLog("error","  âœ• Missing name/email in header rows");continue;}
        addLog("info",`  ًں‘¤ ${engName} <${engEmail}>`);

        // Find or create engineer
        let eng=localEngineers.find(e=>(e.email||"").toLowerCase()===engEmail);
        if(!eng){
          const {data:eArr,error:eErr}=await supabase.from("engineers").insert({
            name:engName,email:engEmail,
            role:engRole||"Automation Engineer",
            level:"Mid",role_type:"engineer",
            weekend_days:JSON.stringify([5,6])
          }).select();
          if(eErr){addLog("error",`  âœ• Engineer failed: ${eErr.message}`);continue;}
          eng=Array.isArray(eArr)?eArr[0]:eArr;
          if(!eng){addLog("error","  âœ• Engineer insert returned no data");continue;}
          localEngineers=[...localEngineers,eng];
          setEngineers(prev=>[...prev,eng].sort((a,b)=>a.name.localeCompare(b.name)));
          addLog("ok",`  âœ“ Created engineer: ${engName}`);
        } else {
          addLog("info",`  â†’ Existing engineer: ${eng.name}`);
        }

        // â”€â”€ LOCAL DATE HELPER: always use local year/month/day, never toISOString() â”€â”€
        // SheetJS cellDates:true returns Date at local midnight â€” toISOString() shifts in UTC+ zones
        const localDateStr=(d)=>{
          // Add 12 hours then use UTC methods â€” handles SheetJS storing local midnight as UTC
          // e.g. Egypt UTC+2: "2026-02-01 local" stored as "2026-01-31T22:00Z"
          // +12h â†’ "2026-02-01T10:00Z" â†’ getUTCFullYear/Month/Date = 2026/1/1 = Feb 1 âœ“
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

        // â”€â”€ DETECT IMPORT MONTH â”€â”€
        // SheetJS with cellDates:true + raw:true returns date cells as Date objects OR serial numbers
        // depending on browser/version. Handle all cases explicitly.
        // Strategy: try every possible representation of the Month cell and all early data rows.
        let importYear=year, importMonth=month;

        const extractYearMonth=(raw)=>{
          if(!raw) return null;
          // SheetJS stores date cells as UTC midnight of the LOCAL date
          // e.g. Egypt UTC+2: Feb 1 00:00 local = Jan 31 22:00 UTC
          // getMonth() on this UTC date returns January â€” WRONG
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
        addLog("info",`  ًں“… Month: ${moStr}/${yrStr} (${monthStart} â†’ ${monthEnd})`);

        // Delete existing entries for this engineer+month
        const {data:existingRows,error:fetchErr}=await supabase
          .from("time_entries").select("id")
          .eq("engineer_id",eng.id).gte("date",monthStart).lte("date",monthEnd);
        if(fetchErr){
          addLog("warn",`  âڑ  Fetch error: ${fetchErr.message}`);
        } else {
          addLog("info",`  ًں”چ Found ${existingRows?.length||0} existing entries`);
          if(existingRows&&existingRows.length>0){
            const ids=existingRows.map(r=>r.id);
            const {error:delErr}=await supabase.from("time_entries").delete().in("id",ids);
            if(delErr) addLog("warn",`  âڑ  Delete failed: ${delErr.message}`);
            else{ setEntries(prev=>prev.filter(e=>!ids.includes(e.id))); addLog("ok",`  âœ“ Cleared ${ids.length} old entries`); }
          } else { addLog("ok","  âœ“ No existing entries â€” fresh import"); }
        }

        // â”€â”€ PARSE DATA ROWS â”€â”€
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

          // â”€â”€ STOP: skip rows outside the import month (e.g. Mar rows in a Feb sheet) â”€â”€
          if(dateStr<monthStart||dateStr>monthEnd){ skipped++; continue; }

          // Read task/hours/project/details â€” use colOffset for shifted layouts
          const task       =String(row[colOffset+2]||"").trim();
          const hoursRaw   =row[colOffset+3];
          const projName   =String(row[colOffset+4]||"").trim();
          const taskDetails=String(row[colOffset+5]||"").trim();

          const projLower   =projName.toLowerCase();
          const taskLower   =task.toLowerCase();
          const detailsLower=taskDetails.toLowerCase();
          const hours=typeof hoursRaw==="number"?hoursRaw:(hoursRaw?parseFloat(String(hoursRaw)):0);

          // â”€â”€ WEEKEND: day-of-week check (local noon to avoid UTC shift) â”€â”€
          const dow=new Date(dateStr+"T12:00:00").getDay(); // 0=Sunâ€¦5=Fri,6=Sat
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

          // â”€â”€ VACATION: explicit vacation keyword in task, regardless of project column â”€â”€
          // (some engineers put "Vacation" in both task AND project â€” detect by task only)
          const isVacationTask=taskLower==="vacation"||taskLower==="annual leave"
            ||taskLower==="sick leave"||taskLower==="unpaid leave";
          const isVacationDetail=detailsLower.includes("vacation");

          // â”€â”€ PUBLIC HOLIDAY / NATIONAL DAY â”€â”€
          const isHoliday=(taskLower.includes("holiday")||taskLower.includes("national day")
            ||detailsLower.includes("holiday"))&&!projName;

          // â”€â”€ TRAINING with no project â†’ Training External leave â”€â”€
          const isTrainingNoProj=(taskLower==="training"||taskLower.includes("training"))
            &&!projName&&hours>0;

          // â”€â”€ FIRST DAY marker â†’ skip it as a plain note (no leave, no work) â”€â”€
          const isFirstDayMarker=taskLower.includes("first day")||taskLower.includes("(first day)");

          // â”€â”€ IMPLICIT ABSENCE: empty workday row â”€â”€
          // Only count as absence if we've seen at least one working day (avoids pre-employment period)
          const isImplicitAbsence=allEmpty&&!engWeekend.includes(dow)&&firstDaySeen;

          // â”€â”€ CLASSIFY â”€â”€
          if(isHoliday){
            const {error:lErr}=await supabase.from("time_entries").upsert({
              engineer_id:eng.id,date:dateStr,hours:8,
              entry_type:"leave",leave_type:"Public Holiday",billable:false
            },{onConflict:"engineer_id,date,entry_type,leave_type",ignoreDuplicates:false});
            if(!lErr){inserted++;leaveCnt++; firstDaySeen=true;}
            else addLog("warn",`  âڑ  Holiday ${dateStr}: ${lErr.message}`);
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
            else addLog("warn",`  âڑ  Leave(${lvType}) ${dateStr}: ${lErr.message}`);
            continue;
          }

          if(isTrainingNoProj){
            const {error:lErr}=await supabase.from("time_entries").upsert({
              engineer_id:eng.id,date:dateStr,hours,
              entry_type:"leave",leave_type:"Training External",billable:false
            },{onConflict:"engineer_id,date,entry_type,leave_type",ignoreDuplicates:false});
            if(!lErr){inserted++;leaveCnt++; firstDaySeen=true;}
            else addLog("warn",`  âڑ  Training ${dateStr}: ${lErr.message}`);
            continue;
          }

          if(isFirstDayMarker){
            // First day orientation â€” log as Training External, mark employment start
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
            else addLog("warn",`  âڑ  Absence ${dateStr}: ${lErr.message}`);
            continue;
          }

          // â”€â”€ WORK ENTRY: must have task + hours + project â”€â”€
          if(!task||isNaN(hours)||hours<=0||!projName) continue;
          firstDaySeen=true;

          const proj=await findOrCreateProject(projName);

          // Map task â†’ category/type
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

          const activity=taskDetails||(task+(projName?` â€” ${projName}`:""));

          const {error:eErr}=await supabase.from("time_entries").upsert({
            engineer_id:eng.id,
            project_id:proj?.id||null,
            date:dateStr,hours,
            task_category:cat,task_type:typ,
            activity,entry_type:"work",
            billable:proj?.billable||false,
          },{onConflict:"engineer_id,date,project_id,task_type",ignoreDuplicates:false});
          if(!eErr) inserted++;
          else{addLog("warn",`  âڑ  Entry ${dateStr} failed: ${eErr.message}`);skipped++;}
        }
        addLog("ok",`  âœ“ Done: ${inserted} entries (${leaveCnt} leave, ${skipped} skipped)`);
      }catch(err){
        addLog("error",`  âœ• Parse error: ${err.message}`);
      }
    }
    addLog("info","âœ… All files processed â€” refreshing...");
    await loadAll();
    setImporting(false);
    logAction("IMPORT","Import",`Imported ${files.length} timesheet file(s)`,{files:files.map(f=>f.name)});
  };

  const bulkDeleteEntries=async()=>{
    if(selectedEntries.size===0) return;
    const allIds=[...selectedEntries];
    // Filter out frozen entries from bulk delete
    const frozenIds=allIds.filter(id=>{const e=entries.find(x=>x.id===id);return e&&isMonthFrozen(e.date);});
    const ids=allIds.filter(id=>!frozenIds.includes(id));
    if(frozenIds.length>0) showToast(`â‌„ ${frozenIds.length} frozen entr${frozenIds.length===1?"y":"ies"} skipped`,false);
    if(ids.length===0) return;
    const saved=entries.filter(e=>ids.includes(e.id));
    showConfirm(`Delete ${ids.length} selected time entr${ids.length===1?"y":"ies"}?`,()=>{
      // Immediate UI remove + undo toast
      setEntries(prev=>prev.filter(e=>!selectedEntries.has(e.id)));
      setSelectedEntries(new Set());
      let _undone=false;
      showToast(`${ids.length} entr${ids.length===1?"y":"ies"} deleted â€” Undo?`,false,()=>{
        _undone=true;
        setEntries(prev=>[...saved,...prev].sort((a,b)=>b.date.localeCompare(a.date)));
        showToast("Undo successful âœ“");
      });
      setTimeout(async()=>{
        if(_undone) return;
        const{error}=await supabase.from("time_entries").delete().in("id",ids);
        if(error){
          setEntries(prev=>[...saved,...prev].sort((a,b)=>b.date.localeCompare(a.date)));
          showToast("Bulk delete failed â€” restored: "+error.message,false);
          return;
        }
        logAction("DELETE","TimeEntry",`Bulk deleted ${ids.length} time entries`,{count:ids.length});
      },3100);
    },{title:"Bulk Delete Entries",confirmLabel:`Delete ${ids.length}`});
  };

  /* â”€â”€ PROJECT CRUD â”€â”€ */
  const addProject=async()=>{
    if(!newProj.id||!newProj.name){showToast("Number and name required",false);return;}
    const projToInsert={...newProj,assigned_engineers:newProj.assigned_engineers||[]};
    const {data,error}=await supabase.from("projects").insert(projToInsert).select().single();
    if(error){showToast("Error: "+error.message,false);return;}
    setProjects(prev=>[...prev,data].sort((a,b)=>a.id.localeCompare(b.id)));
    setShowProjModal(false);
    setNewProj({id:"",name:"",type:"Renewable Energy",client:"",origin:"Romania HQ",phase:"Design",billable:true,rate_per_hour:85,status:"Active"});
    showToast("Project created âœ“");
    logAction("CREATE","Project",`Created project ${newProj.id} â€” ${newProj.name}`,{project_id:newProj.id,name:newProj.name});
    // â”€â”€ Notify project leader + assigned engineers on creation â”€â”€
    const _now=new Date().toISOString();
    const _projName=newProj.name||newProj.id;
    const _notified=new Set([String(myProfile?.id)]);
    // Notify leader
    if(newProj.project_leader){
      const _leaderEng=engineers.find(e=>e.name===newProj.project_leader);
      if(_leaderEng&&!_notified.has(String(_leaderEng.id))){
        _notified.add(String(_leaderEng.id));
        insertNotif({type:"project_leader",engineer_id:_leaderEng.id,read:false,
          message:`â­گ You have been set as Project Leader for "${_projName}"`,
          created_at:_now,
          meta:JSON.stringify({project_id:newProj.id,project_name:_projName,changed_by:myProfile?.name})});
      }
    }
    // Notify all assigned engineers
    (newProj.assigned_engineers||[]).forEach(engId=>{
      if(_notified.has(String(engId))) return;
      _notified.add(String(engId));
      const _aEng=engineers.find(e=>String(e.id)===String(engId));
      if(_aEng) insertNotif({type:"project_assigned",engineer_id:_aEng.id,read:false,
        message:`âœ“ You have been added to project "${_projName}"`,
        created_at:_now,
        meta:JSON.stringify({project_id:newProj.id,project_name:_projName,changed_by:myProfile?.name})});
    });
    // If LEAD creates project, notify all admins (admin creating â†’ they already know)
    if(!isAdmin){
      const _adminProjMsg=`${myProfile?.name||"Lead"} created project "${_projName}"`;
      engineers.filter(e=>e.role_type==="admin"&&!_notified.has(String(e.id))).forEach(adm=>{
        insertNotif({type:"project_status",engineer_id:adm.id,read:false,
          message:_adminProjMsg,created_at:_now,
          meta:JSON.stringify({project_id:newProj.id,project_name:_projName,created_by:myProfile?.name})});
      });
    }
  };
  const saveEditProject=async()=>{
    if(!editProjModal) return;
    const {_origId,_tab,...rest}=editProjModal;
    const origId=_origId||rest.id;
    const newId=rest.id;
    const idChanged=_origId&&_origId!==newId;
    if(idChanged){
      let insertData={...rest};
      let {error:e1}=await supabase.from("projects").insert(insertData);
      if(e1&&e1.message&&e1.message.includes("assigned_engineers")){
        const{assigned_engineers:_ae,...restNoAE}=insertData;
        const r2=await supabase.from("projects").insert(restNoAE);
        e1=r2.error;
      }
      if(e1){showToast("Error renaming: "+e1.message,false);return;}
      await supabase.from("time_entries").update({project_id:newId}).eq("project_id",origId);
      await supabase.from("project_activities").update({project_id:newId}).eq("project_id",origId);
      await supabase.from("project_subprojects").update({project_id:newId}).eq("project_id",origId);
      await supabase.from("projects").delete().eq("id",origId);
      setProjects(prev=>prev.map(p=>p.id===origId?{...rest,id:newId}:p));
      setEntries(prev=>prev.map(e=>e.project_id===origId?{...e,project_id:newId}:e));
      setActivities(prev=>prev.map(a=>a.project_id===origId?{...a,project_id:newId}:a));
      setSubprojects(prev=>prev.map(s=>s.project_id===origId?{...s,project_id:newId}:s));
      setEditProjModal(null); showToast("Project ID renamed & entries re-linked âœ“");
      logAction("UPDATE","Project",`Renamed project ${origId} â†’ ${newId}`,{old_id:origId,new_id:newId});
    } else {
      const{id,...fields}=rest;
      let {data,error}=await supabase.from("projects").update(fields).eq("id",id).select().single();
      if(error&&error.message&&error.message.includes("assigned_engineers")){
        const{assigned_engineers:_ae,...fieldsNoAE}=fields;
        const res=await supabase.from("projects").update(fieldsNoAE).eq("id",id).select().single();
        data=res.data; error=res.error;
        if(!error) showToast("âڑ  Saved â€” but run the 'Assigned Engineers' migration in Admin â€؛ Info to enable assignment tracking",false);
      }
      if(error){showToast("Error: "+error.message,false);return;}
      if(data){
        setProjects(prev=>prev.map(p=>p.id===data.id?{...data,assigned_engineers:fields.assigned_engineers||[]}:p));
      }
      setEditProjModal(null); showToast("Project updated âœ“");
      const _pprev=projects.find(p=>p.id===editProjModal?.id)||{};
      const _pchanges=[];
      if(_pprev.name!==rest.name) _pchanges.push(`name: "${_pprev.name}"â†’"${rest.name}"`);
      if(_pprev.client!==rest.client) _pchanges.push(`client: "${_pprev.client||"â€”"}"â†’"${rest.client||"â€”"}"`);
      if(_pprev.billable!==rest.billable) _pchanges.push(`billable: ${_pprev.billable}â†’${rest.billable}`);
      if(_pprev.status!==rest.status) _pchanges.push(`status: ${_pprev.status||"â€”"}â†’${rest.status||"â€”"}`);
      // â”€â”€ Helper: notify leader + all assigned (excluding self and already-notified) â”€â”€
      const _notifyTeam=(type,message,meta,skipIds=[])=>{
        const _skip=new Set([String(myProfile?.id),...skipIds.map(String)]);
        if(rest.project_leader){
          const _l=engineers.find(e=>e.name===rest.project_leader);
          if(_l&&!_skip.has(String(_l.id))){
            _skip.add(String(_l.id));
            insertNotif({type,engineer_id:_l.id,read:false,message,created_at:new Date().toISOString(),meta:JSON.stringify(meta)});
          }
        }
        (rest.assigned_engineers||[]).forEach(engId=>{
          if(_skip.has(String(engId))) return;
          const _aEng=engineers.find(e=>String(e.id)===String(engId));
          if(_aEng) insertNotif({type,engineer_id:_aEng.id,read:false,message,created_at:new Date().toISOString(),meta:JSON.stringify(meta)});
        });
      };

      // 1. STATUS CHANGE â†’ notify leader + team
      if(_pprev.status!==rest.status){
        const _emoji=rest.status==="On Hold"?"âڈ¸":rest.status==="Completed"?"âœ…":rest.status==="Active"?"â–¶":"ًں”„";
        _notifyTeam("project_status",
          `${_emoji} Project "${rest.name||rest.id}" status: ${_pprev.status||"â€”"} â†’ ${rest.status}`,
          {project_id:rest.id,project_name:rest.name,old_status:_pprev.status,new_status:rest.status,changed_by:myProfile?.name});
      }

      // 2. PHASE CHANGE â†’ notify leader + team
      if(_pprev.phase!==rest.phase&&rest.phase){
        _notifyTeam("project_phase",
          `ًں“‹ Project "${rest.name||rest.id}" phase: ${_pprev.phase||"â€”"} â†’ ${rest.phase}`,
          {project_id:rest.id,project_name:rest.name,old_phase:_pprev.phase,new_phase:rest.phase,changed_by:myProfile?.name});
      }

      // 3. PROJECT LEADER CHANGE â†’ notify new leader + old leader
      if(_pprev.project_leader!==rest.project_leader){
        if(rest.project_leader){
          const _newLeaderEng=engineers.find(e=>e.name===rest.project_leader);
          if(_newLeaderEng&&String(_newLeaderEng.id)!==String(myProfile?.id)){
            insertNotif({type:"project_leader",engineer_id:_newLeaderEng.id,read:false,
              message:`â­گ You are now Project Leader for "${rest.name||rest.id}"`,
              created_at:new Date().toISOString(),
              meta:JSON.stringify({project_id:rest.id,project_name:rest.name,changed_by:myProfile?.name})});
          }
        }
        if(_pprev.project_leader&&_pprev.project_leader!==rest.project_leader){
          const _oldLeaderEng=engineers.find(e=>e.name===_pprev.project_leader);
          if(_oldLeaderEng&&String(_oldLeaderEng.id)!==String(myProfile?.id)){
            insertNotif({type:"project_leader",engineer_id:_oldLeaderEng.id,read:false,
              message:`â„¹ You are no longer Project Leader for "${rest.name||rest.id}"`,
              created_at:new Date().toISOString(),
              meta:JSON.stringify({project_id:rest.id,project_name:rest.name,changed_by:myProfile?.name})});
          }
        }
      }

      // 4. TEAM ASSIGNMENT CHANGE â†’ notify added engineers, notify removed engineers
      if(JSON.stringify((_pprev.assigned_engineers||[]).slice().sort())!==JSON.stringify((rest.assigned_engineers||[]).slice().sort())){
        const _prevIds=new Set((_pprev.assigned_engineers||[]).map(String));
        const _newIds=new Set((rest.assigned_engineers||[]).map(String));
        // Added
        _newIds.forEach(engId=>{
          if(_prevIds.has(engId)) return; // was already on team
          if(String(engId)===String(myProfile?.id)) return; // self
          const _aEng=engineers.find(e=>String(e.id)===engId);
          if(_aEng) insertNotif({type:"project_assigned",engineer_id:_aEng.id,read:false,
            message:`âœ“ You have been added to project "${rest.name||rest.id}"`,
            created_at:new Date().toISOString(),
            meta:JSON.stringify({project_id:rest.id,project_name:rest.name,changed_by:myProfile?.name})});
        });
        // Removed
        _prevIds.forEach(engId=>{
          if(_newIds.has(engId)) return; // still on team
          if(String(engId)===String(myProfile?.id)) return; // self
          const _rEng=engineers.find(e=>String(e.id)===engId);
          if(_rEng) insertNotif({type:"project_assigned",engineer_id:_rEng.id,read:false,
            message:`â„¹ You have been removed from project "${rest.name||rest.id}"`,
            created_at:new Date().toISOString(),
            meta:JSON.stringify({project_id:rest.id,project_name:rest.name,changed_by:myProfile?.name})});
        });
      }

      logAction("UPDATE","Project",`Updated project ${editProjModal?.id}${_pchanges.length?" â€” "+_pchanges.join(", "):""}`,{project_id:editProjModal?.id,changes:_pchanges});
    }
  };
  const deleteProject=async id=>{
    const proj=projects.find(p=>p.id===id);
    const savedEntries=entries.filter(e=>e.project_id===id);
    const savedActs=activities.filter(a=>a.project_id===id);
    const savedSubs=subprojects.filter(s=>s.project_id===id);
    showConfirm(`Delete project "${proj?.name||id}"? This removes all its entries, activities and sub-sites.`,()=>{
      applyUndo(
        showToast,`Project "${proj?.name||id}" deleted`,
        ()=>{ setProjects(prev=>prev.filter(p=>p.id!==id)); setEntries(prev=>prev.filter(e=>e.project_id!==id)); setActivities(prev=>prev.filter(a=>a.project_id!==id)); setSubprojects(prev=>prev.filter(s=>s.project_id!==id)); },
        ()=>{ setProjects(prev=>[...prev,proj].sort((a,b)=>a.id.localeCompare(b.id))); setEntries(prev=>[...savedEntries,...prev]); setActivities(prev=>[...savedActs,...prev]); setSubprojects(prev=>[...savedSubs,...prev]); },
        async()=>{
          await supabase.from("time_entries").delete().eq("project_id",id);
          await supabase.from("project_activities").delete().eq("project_id",id);
          await supabase.from("project_subprojects").delete().eq("project_id",id);
          const{error}=await supabase.from("projects").delete().eq("id",id);
          return error||null;
        },
        async()=>{
          logAction("DELETE","Project",`Deleted project ${id}`,{project_id:id});
          // Notify project leader + assigned engineers that project was deleted
          const _now=new Date().toISOString();
          const _msg=`Project "${proj?.name||id}" has been deleted by admin`;
          const _notified=new Set([String(myProfile?.id)]);
          if(proj?.project_leader){
            const _ldr=engineers.find(e=>e.name===proj.project_leader);
            if(_ldr&&!_notified.has(String(_ldr.id))){
              _notified.add(String(_ldr.id));
              insertNotif({type:"project_status",engineer_id:_ldr.id,read:false,message:_msg,created_at:_now,meta:JSON.stringify({project_id:id,project_name:proj?.name,action:"deleted"})});
            }
          }
          (proj?.assigned_engineers||[]).forEach(engId=>{
            if(_notified.has(String(engId))) return;
            _notified.add(String(engId));
            const _e=engineers.find(e=>String(e.id)===String(engId));
            if(_e) insertNotif({type:"project_status",engineer_id:_e.id,read:false,message:_msg,created_at:_now,meta:JSON.stringify({project_id:id,project_name:proj?.name,action:"deleted"})});
          });
        }
      );
    },{title:"Delete Project",confirmLabel:"Delete Project",icon:"ًں—‘"});
  };

  /* â”€â”€ SUB-PROJECT CRUD â”€â”€ */
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
    setSubProjModal(null); showToast("Sub-project added âœ“");
    logAction("CREATE","Project",`Added sub-project: ${data.name} (${pid})`,{subproject_id:data.id,name:data.name,project_id:pid});
  };
  const saveSubProject=async(sub)=>{
    const{id,...fields}=sub;
    const{data,error}=await supabase.from("project_subprojects")
      .update(fields).eq("id",id).select().single();
    if(error){showToast("Error: "+error.message,false);return;}
    setSubprojects(prev=>prev.map(s=>s.id===data.id?data:s));
    setSubProjModal(null); showToast("Sub-project saved âœ“");
    logAction("UPDATE","Project",`Updated sub-project: ${data.name}`,{subproject_id:data.id,name:data.name});
  };
  const deleteSubProject=async(id)=>{
    const sub=subprojects.find(s=>s.id===id);
    const linkedActs=activities.filter(a=>String(a.subproject_id)===String(id));
    showConfirm(`Delete sub-site "${sub?.name||id}"? Its activities will be unlinked but not deleted.`,()=>{
      applyUndo(
        showToast,`Sub-site "${sub?.name||id}" deleted`,
        ()=>{ setSubprojects(prev=>prev.filter(s=>s.id!==id)); setActivities(prev=>prev.map(a=>String(a.subproject_id)===String(id)?{...a,subproject_id:null}:a)); },
        ()=>{ setSubprojects(prev=>[...prev,sub]); setActivities(prev=>prev.map(a=>linkedActs.find(l=>l.id===a.id)?{...a,subproject_id:id}:a)); },
        async()=>{
          await supabase.from("project_activities").update({subproject_id:null}).eq("subproject_id",id);
          const{error}=await supabase.from("project_subprojects").delete().eq("id",id);
          return error||null;
        },
        ()=>logAction("DELETE","Project",`Deleted sub-project: ${sub?.name||id}`,{subproject_id:id,name:sub?.name})
      );
    },{title:"Delete Sub-Site",confirmLabel:"Delete Sub-Site"});
  };

  /* â”€â”€ ENGINEER CRUD â”€â”€ */
  const addEngineer=async()=>{
    if(!newEng.name.trim()){showToast("Name required",false);return;}
    if(!newEng.email.trim()){showToast("Email required",false);return;}

    // Try inserting with progressively fewer columns until one works
    // This handles ANY schema state â€” missing columns, wrong types, constraints
    const attempts=[
      // Attempt 1: full payload with all optional columns
      {name:newEng.name.trim(),email:newEng.email.trim().toLowerCase(),
       role:newEng.role||ROLES_LIST[0],level:newEng.level||"Mid",
       role_type:newEng.role_type||"engineer",is_active:true,
       join_date:null,termination_date:null,
       weekend_days:newEng.weekend_days||JSON.stringify(DEFAULT_WEEKEND)},
      // Attempt 2: without date columns (in case they don't exist yet)
      {name:newEng.name.trim(),email:newEng.email.trim().toLowerCase(),
       role:newEng.role||ROLES_LIST[0],level:newEng.level||"Mid",
       role_type:newEng.role_type||"engineer",is_active:true,
       weekend_days:newEng.weekend_days||JSON.stringify(DEFAULT_WEEKEND)},
      // Attempt 3: without is_active and weekend_days
      {name:newEng.name.trim(),email:newEng.email.trim().toLowerCase(),
       role:newEng.role||ROLES_LIST[0],level:newEng.level||"Mid",
       role_type:newEng.role_type||"engineer"},
      // Attempt 4: absolute minimum â€” just name, role, level, role_type
      {name:newEng.name.trim(),
       role:newEng.role||ROLES_LIST[0],level:newEng.level||"Mid",
       role_type:newEng.role_type||"engineer"},
    ];

    let data=null, lastError=null;
    for(const attempt of attempts){
      const res=await supabase.from("engineers").insert(attempt).select().single();
      if(!res.error){
        data={...attempt,...res.data, is_active:true, join_date:null, termination_date:null,
              weekend_days:newEng.weekend_days||JSON.stringify(DEFAULT_WEEKEND),
              email:newEng.email.trim().toLowerCase()};
        lastError=null; break;
      }
      lastError=res.error;
    }
    if(lastError||!data){
      const msg=lastError?.message||"Unknown error";
      if(msg.includes("duplicate")||msg.includes("unique")){
        showToast("A member with this name or email already exists",false);
      } else {
        showToast("Error: "+msg,false);
      }
      return;
    }

    setEngineers(prev=>[...prev,data].sort((a,b)=>a.name.localeCompare(b.name)));

    // Auto-create staff record if not already present (check by name to avoid duplication)
    const existingStaff=staff.find(s=>s.name?.trim().toLowerCase()===data.name?.trim().toLowerCase());
    if(!existingStaff){
      const safeStaff={name:data.name,department:"Engineering",role:data.role||"",
                       type:"full_time",active:true,salary_usd:0,salary_egp:0,notes:""};
      let staffRes=await supabase.from("staff").insert({...safeStaff,join_date:null,termination_date:null}).select().single();
      if(staffRes.error) staffRes=await supabase.from("staff").insert(safeStaff).select().single();
      if(!staffRes.error&&staffRes.data) setStaff(prev=>[...prev,staffRes.data].sort((a,b)=>a.name.localeCompare(b.name)));
    }

    setShowEngModal(false);
    setNewEng({name:"",role:ROLES_LIST[0],level:"Mid",email:"",role_type:"engineer",is_active:true,join_date:null,termination_date:null,weekend_days:JSON.stringify(DEFAULT_WEEKEND)});
    showToast("Member added âœ“ â€” set salary in Finance â€؛ Staff");
    logAction("CREATE","Engineer",`Added engineer: ${data.name}`,{id:data.id,name:data.name,role_type:data.role_type,role:data.role});
  };
  const saveEditEngineer=async()=>{
    if(!editEngModal) return;
    const {id,...rest}=editEngModal;
    // Try full update first; if termination_date/is_active columns missing, strip them
    let {data,error}=await supabase.from("engineers").update(rest).eq("id",id).select().single();
    if(error&&(error.message?.includes("is_active")||error.message?.includes("termination_date")||error.message?.includes("join_date"))){
      const {is_active,termination_date,join_date,...safeRest}=rest;
      const res=await supabase.from("engineers").update(safeRest).eq("id",id).select().single();
      data=res.data; error=res.error;
      if(data) data={...data, termination_date: termination_date||null, is_active, join_date};
    }
    if(error){showToast("Error: "+error.message,false);return;}
    const merged={...editEngModal,...(data||{})};
    // If name changed, update activities assigned_to
    if(editEngModal.name && data?.name && editEngModal.name!==data.name){
      setActivities(prev=>prev.map(a=>a.assigned_to===editEngModal.name?{...a,assigned_to:data.name}:a));
    }
    // Sync ALL common fields back to matching staff record
    const staffSync={
      role:            merged.role||"",
      active:          merged.is_active!==false,
      join_date:       merged.join_date||null,
      termination_date:merged.termination_date||null,
    };
    const matchStaff=staff.find(s=>s.name?.trim().toLowerCase()===merged.name?.trim().toLowerCase());
    if(matchStaff){
      supabase.from("staff").update(staffSync).eq("id",matchStaff.id).then(()=>{});
      setStaff(prev=>prev.map(s=>s.id===matchStaff.id?{...s,...staffSync}:s));
    }
    setEngineers(prev=>prev.map(e=>e.id===id?merged:e));
    if(id===myProfile?.id) setMyProfile(merged);
    setEditEngModal(null); showToast("Updated âœ“");
    const _prev=engineers.find(e=>e.id===id)||{};
    const _changes=[];
    if(_prev.name!==merged.name) _changes.push(`name: "${_prev.name}"â†’"${merged.name}"`);
    if(_prev.role!==merged.role) _changes.push(`job role: "${_prev.role||"â€”"}"â†’"${merged.role||"â€”"}"`);
    if(_prev.role_type!==merged.role_type) _changes.push(`access: ${_prev.role_type}â†’${merged.role_type}`);
    if(_prev.level!==merged.level) _changes.push(`level: "${_prev.level||"â€”"}"â†’"${merged.level||"â€”"}"`);
    if(String(_prev.is_active)!==String(merged.is_active)) _changes.push(`active: ${_prev.is_active}â†’${merged.is_active}`);
    if(_prev.termination_date!==merged.termination_date) _changes.push(`termination: ${_prev.termination_date||"none"}â†’${merged.termination_date||"none"}`);
    logAction("UPDATE","Engineer",`Updated engineer: ${merged.name}${_changes.length?" â€” "+_changes.join(", "):""}`,{id,name:merged.name,role_type:merged.role_type,is_active:merged.is_active,termination_date:merged.termination_date||null,changes:_changes});
  };
  const deleteEngineer=async id=>{
    const eng=engineers.find(e=>e.id===id);
    const savedEntries=entries.filter(e=>e.engineer_id===id);
    showConfirm(`Delete engineer "${eng?.name||id}" and all their time entries?`,()=>{
      applyUndo(
        showToast,`Engineer "${eng?.name||id}" deleted`,
        ()=>{ setEngineers(prev=>prev.filter(e=>e.id!==id)); setEntries(prev=>prev.filter(e=>e.engineer_id!==id)); setProjects(prev=>prev.map(p=>({...p,assigned_engineers:(p.assigned_engineers||[]).filter(x=>String(x)!==String(id))}))); if(eng)setActivities(prev=>prev.map(a=>a.assigned_to===eng.name?{...a,assigned_to:""}:a)); setNotifications(prev=>prev.filter(n=>{
          // Use top-level engineer_id (current schema) with meta fallback (legacy rows)
          const topLevel=n.engineer_id!=null?String(n.engineer_id)!==String(id):true;
          if(!topLevel) return false;
          // Also check meta.engineer_id for legacy notification rows
          try{ const m=JSON.parse(n.meta||"{}"); if(m.engineer_id&&String(m.engineer_id)===String(id)) return false; }catch{}
          return true;
        })); },
        ()=>{ setEngineers(prev=>[...prev,eng].sort((a,b)=>a.name.localeCompare(b.name))); setEntries(prev=>[...savedEntries,...prev]); },
        async()=>{
          await supabase.from("time_entries").delete().eq("engineer_id",id);
          // Clean notifications: direct engineer_id field (vacation) + activity_comment via meta pattern
          await supabase.from("notifications").delete().eq("engineer_id",id);
          // Note: activity_comment notifications store recipient in meta â€” orphaned rows cleaned by RLS or periodic admin archive
          const{error}=await supabase.from("engineers").delete().eq("id",id);
          return error||null;
        },
        ()=>logAction("DELETE","Engineer",`Deleted engineer: ${eng?.name||id}`,{id,name:eng?.name})
      );
    },{title:"Delete Engineer",confirmLabel:"Delete Engineer"});
  };

  /* â”€â”€ DERIVED STATS â”€â”€ */
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

  const engStats=useMemo(()=>engineers
    .filter(eng=>isBillableRole(eng.role_type))
    .filter(eng=>{
      // Exclude terminated engineers whose termination date was before this month started
      if(eng.termination_date){
        const term=new Date(eng.termination_date+"T12:00:00");
        if(term.getFullYear()<year||(term.getFullYear()===year&&term.getMonth()<month)) return false;
      }
      // Exclude inactive engineers with no termination date (manually deactivated)
      if(eng.is_active===false&&!eng.termination_date) return false;
      // Exclude engineers who hadn't joined yet in the selected month
      if(eng.join_date){
        const join=new Date(eng.join_date+"T12:00:00");
        if(join.getFullYear()>year||(join.getFullYear()===year&&join.getMonth()>month)) return false;
      }
      // Engineers with NO join_date are treated as always active (legacy records)
      return true;
    })
    .map(eng=>{
      const we=monthEntries.filter(e=>String(e.engineer_id)===String(eng.id));
      const wh=we.filter(e=>e.entry_type==="work").reduce((s,e)=>s+e.hours,0);
      const bh=we.filter(e=>e.entry_type==="work").reduce((s,e)=>{
        const p=projects.find(x=>x.id===e.project_id);
        return s+(p&&p.billable?e.hours:0);},0);
      const ld=we.filter(e=>e.entry_type==="leave").length;
      const rev=we.filter(e=>e.entry_type==="work").reduce((s,e)=>{
        const p=projects.find(x=>x.id===e.project_id);return s+(p&&p.billable?p.rate_per_hour*e.hours:0);},0);
      const engWd=()=>{try{return eng.weekend_days?JSON.parse(eng.weekend_days):DEFAULT_WEEKEND;}catch{return DEFAULT_WEEKEND;}};
      // Calculate effective target: start from join date if they joined mid-month
      const joinFromDay = (()=>{
        if(!eng.join_date) return 1;
        const join=new Date(eng.join_date+"T12:00:00");
        if(join.getFullYear()===year&&join.getMonth()===month) return join.getDate();
        return 1;
      })();
      // Stop counting at termination date if terminated mid-month
      const termUpToDay = (()=>{
        if(!eng.termination_date) return null;
        const term=new Date(eng.termination_date+"T12:00:00");
        if(term.getFullYear()===year&&term.getMonth()===month) return term.getDate();
        return null;
      })();
      const engTarget=getTargetHrs(year,month,engWd(),joinFromDay,termUpToDay);
      return{...eng,workHrs:wh,billableHrs:bh,leaveDays:ld,revenue:rev,
        utilization:engTarget>0?Math.min(100,Math.round(wh/engTarget*100)):0,
        billability:wh?Math.round(bh/wh*100):0,
        targetHrs:engTarget};
    }),[engineers,monthEntries,projects,year,month]);

  // overallUtil: sum of individual adjusted targets (respects join/termination dates)
  const overallUtil = (()=>{
    const totalTarget=engStats.reduce((s,e)=>s+(e.targetHrs||0),0);
    return totalTarget?Math.min(100,Math.round(totalWorkHrs/totalTarget*100)):0;
  })();

  // Lead-scoped engStats: leads see only their org subtree; admins/others see all
  const visibleEngStats = useMemo(()=>
    mySubEngIds ? engStats.filter(e=>mySubEngIds.has(String(e.id))) : engStats,
  [mySubEngIds,engStats]);

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
    const d=new Date(e.date+"T12:00:00");
    // Lead: scope to subtree engineers only
    if(mySubEngIds&&!mySubEngIds.has(String(e.engineer_id))) return false;
    return (entryFilter.engineer==="ALL"||e.engineer_id===+entryFilter.engineer)
      &&(entryFilter.project==="ALL"||e.project_id===entryFilter.project)
      &&d.getMonth()===entryFilter.month&&d.getFullYear()===entryFilter.year;
  }),[entries,entryFilter,mySubEngIds]);

  /* â”€â”€ PDF builds â”€â”€ */
  const buildUtilizationPDF=()=>{
    const pdfStats=visibleEngStats; // scoped for lead, full for admin/acct
    generatePDF(`Team Utilization â€” ${MONTHS[month]} ${year}`,[
      `<div class="section"><div class="st">KPIs</div><div class="kg">
        <div class="kp"><div class="kv">${fmtPct(overallUtil)}</div><div class="kl">Utilization</div></div>
        <div class="kp"><div class="kv">${fmtPct(billabilityPct)}</div><div class="kl">Billability</div></div>
        <div class="kp"><div class="kv">${totalWorkHrs}h</div><div class="kl">Work Hours</div></div>
        <div class="kp"><div class="kv">${fmtCurrency(totalRevenue)}</div><div class="kl">Revenue</div></div>
      </div></div>`,
      `<div class="section"><div class="st">Individual Breakdown</div>
      <table><thead><tr><th>Engineer</th><th>Level</th><th>Target Hrs</th><th>Work Hrs</th><th>Billable Hrs</th><th>Leave</th><th>Utilization</th><th>Billability</th><th>Revenue</th></tr></thead>
      <tbody>${pdfStats.map(e=>{
        const joinNote=(()=>{if(!e.join_date)return"";const j=new Date(e.join_date+"T12:00:00");if(j.getFullYear()===year&&j.getMonth()===month)return` <span style="color:#34d399;font-size:10px">(joined ${j.getDate()})</span>`;return"";})();
        return`<tr>
        <td><strong>${e.name}</strong><br><span style="color:#64748b;font-size:11px">${e.role||""}</span></td>
        <td>${e.level||""}</td><td style="color:#64748b">${e.targetHrs}h${joinNote}</td><td>${e.workHrs}h</td><td style="color:#0ea5e9">${e.billableHrs}h</td>
        <td>${e.leaveDays}d</td><td>${fmtPct(e.utilization)}</td><td>${fmtPct(e.billability)}</td>
        <td style="color:#0ea5e9;font-weight:700">${fmtCurrency(e.revenue)}</td></tr>`;}).join("")}
      </tbody></table></div>`]);
  };
  const buildTaskPDF=()=>{
    const now=new Date().toLocaleDateString("en-GB",{day:"2-digit",month:"short",year:"numeric"});
    const period=`${MONTHS[month]} ${year}`;

    // â”€â”€ DERIVED METRICS â”€â”€
    const nonBillableHrs=totalWorkHrs-totalBillable;
    const nonBillablePct=totalWorkHrs?Math.round(nonBillableHrs/totalWorkHrs*100):0;
    const avgRate=totalBillable>0?totalRevenue/totalBillable:0;
    const costOfNonBillable=Math.round(nonBillableHrs*avgRate);
    const uniqueTaskTypes=[...new Set(workEntries.map(e=>e.task_type).filter(Boolean))].length;
    const uniqueEngineers=[...new Set(workEntries.map(e=>e.engineer_id))].length;
    const avgHrsPerEntry=workEntries.length?(totalWorkHrs/workEntries.length).toFixed(1):0;

    // â”€â”€ PREVIOUS MONTH COMPARISON â”€â”€
    const prevMonth=month===0?11:month-1;
    const prevYear=month===0?year-1:year;
    const prevWE=entries.filter(e=>{const d=new Date(e.date+"T12:00:00");return d.getFullYear()===prevYear&&d.getMonth()===prevMonth&&e.entry_type==="work";});
    const prevTotalHrs=prevWE.reduce((s,e)=>s+e.hours,0);
    const prevCatMap={};
    prevWE.forEach(e=>{const g=e.task_category||CAT_TO_GROUP[e.task_type]||"General";prevCatMap[g]=(prevCatMap[g]||0)+e.hours;});

    // â”€â”€ TOP ACTIVITIES â”€â”€
    const actMap={};
    workEntries.forEach(e=>{
      if(!e.activity)return;
      const k=`${e.task_type||""}|||${e.activity}`;
      if(!actMap[k])actMap[k]={task:e.task_type||"â€”",activity:e.activity,hrs:0,count:0,billable:0};
      actMap[k].hrs+=e.hours; actMap[k].count++;
      const p=projects.find(x=>x.id===e.project_id);
      if(p&&p.billable)actMap[k].billable+=e.hours;
    });
    const topActivities=Object.values(actMap).sort((a,b)=>b.hrs-a.hrs).slice(0,12);

    // â”€â”€ ENGINEER أ— CATEGORY MATRIX â”€â”€
    const activeEngs=visibleEngStats.filter(e=>e.workHrs>0); // scoped for lead
    const allCats=taskStats.map(t=>t.category);
    const engCatMatrix=activeEngs.map(eng=>{
      const catHrs={};
      workEntries.filter(e=>String(e.engineer_id)===String(eng.id)).forEach(e=>{
        const g=e.task_category||CAT_TO_GROUP[e.task_type]||"General";
        catHrs[g]=(catHrs[g]||0)+e.hours;
      });
      const topCat=Object.entries(catHrs).sort((a,b)=>b[1]-a[1])[0];
      return{...eng,catHrs,topCat};
    });

    // â”€â”€ COLORS â”€â”€
    const CLRS=["#0ea5e9","#a78bfa","#34d399","#fb923c","#f87171","#e879f9","#facc15","#4ade80","#f472b6","#60a5fa","#2dd4bf","#f97316"];
    const ccm={};taskStats.forEach((t,i)=>{ccm[t.category]=CLRS[i%CLRS.length];});

    // â”€â”€ SECTION 1: EXECUTIVE KPIs â”€â”€
    const hrsVsPrev=prevTotalHrs>0?totalWorkHrs-prevTotalHrs:null;
    const s1=`<div class="section"><div class="st">Executive Summary â€” ${period}</div>
      <div style="display:grid;grid-template-columns:repeat(5,1fr);gap:10px;margin-bottom:12px">
        ${[
          {l:"Total Hours",    v:totalWorkHrs+"h",          c:"#0ea5e9", sub:uniqueEngineers+" engineers آ· "+workEntries.length+" entries"},
          {l:"Billable Hours", v:totalBillable+"h",         c:"#34d399", sub:fmtPct(billabilityPct)+" of total"},
          {l:"Non-Billable",   v:nonBillableHrs+"h",        c:"#fb923c", sub:fmtPct(nonBillablePct)+" of total"},
          {l:"Utilization",    v:fmtPct(overallUtil),       c:overallUtil>=70?"#34d399":"#f87171", sub:"Benchmark â‰¥ 70%"},
          {l:"Revenue",        v:fmtCurrency(totalRevenue), c:"#38bdf8", sub:avgRate>0?"$"+Math.round(avgRate)+"/h avg rate":"â€”"},
        ].map(k=>`<div style="background:#f0f7ff;border:1px solid #bfdbfe;border-radius:8px;padding:12px;text-align:center">
          <div style="font-family:'IBM Plex Mono',monospace;font-size:17px;font-weight:700;color:${k.c};line-height:1">${k.v}</div>
          <div style="font-size:10px;color:#64748b;text-transform:uppercase;letter-spacing:.07em;margin-top:4px;font-weight:600">${k.l}</div>
          <div style="font-size:10px;color:#94a3b8;margin-top:3px">${k.sub}</div>
        </div>`).join("")}
      </div>
      <div style="background:#f8fafc;border-radius:6px;padding:8px 14px;display:flex;gap:16px;flex-wrap:wrap;font-size:11px;color:#64748b;align-items:center">
        <span>ًں“‹ Avg ${avgHrsPerEntry}h per entry</span>
        <span>آ·</span><span>ًں—‚ ${uniqueTaskTypes} task types across ${taskStats.length} categories</span>
        ${hrsVsPrev!==null?`<span style="margin-left:auto;font-weight:700;color:${hrsVsPrev>=0?"#16a34a":"#dc2626"}">${hrsVsPrev>=0?"â–² +":"â–¼ "}${hrsVsPrev}h vs ${MONTHS[prevMonth]} ${prevYear}</span>`:""}
      </div>
    </div>`;

    // â”€â”€ SECTION 2: CATEGORY VISUAL DISTRIBUTION â”€â”€
    const s2=`<div class="section"><div class="st">Task Category Distribution</div>
      <div style="font-size:11px;color:#64748b;margin-bottom:10px;padding:6px 10px;background:#fffbeb;border-left:3px solid #f59e0b;border-radius:0 4px 4px 0">
        âڑ، Industry benchmarks for engineering firms: Billable â‰¥ 70% آ· Internal overhead â‰¤ 20% آ· Training / R&D â‰¤ 10%
      </div>
      ${taskStats.map((cat,i)=>{
        const pct=totalWorkHrs?Math.round(cat.hours/totalWorkHrs*100):0;
        const billPct=cat.hours?Math.round(cat.billable/cat.hours*100):0;
        const col=ccm[cat.category]||"#0ea5e9";
        const delta=prevCatMap[cat.category]!=null?cat.hours-(prevCatMap[cat.category]||0):null;
        const topTasks=Object.entries(cat.tasks).sort((a,b)=>b[1].hrs-a[1].hrs).slice(0,3).map(([k,v])=>`${k} (${v.hrs}h)`).join("  آ·  ");
        return`<div style="margin-bottom:10px;padding:10px 12px;background:${i%2===0?"#f8fafc":"#ffffff"};border-radius:6px;border-left:3px solid ${col}">
          <div style="display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:5px">
            <div>
              <span style="font-weight:700;color:#0f172a;font-size:13px">${cat.category}</span>
              <span style="margin-left:10px;font-size:10px;color:#94a3b8">${topTasks}</span>
            </div>
            <div style="display:flex;gap:10px;align-items:center;font-family:'IBM Plex Mono',monospace;font-size:12px;white-space:nowrap">
              <span style="color:${col};font-weight:700">${cat.hours}h</span>
              <span style="background:${col}22;color:${col};padding:1px 6px;border-radius:3px;font-weight:700">${pct}%</span>
              ${delta!==null?`<span style="font-size:10px;color:${delta>=0?"#16a34a":"#dc2626"}">${delta>=0?"â–²+":"â–¼"}${delta}h</span>`:""}
            </div>
          </div>
          <div style="background:#e2e8f0;height:9px;border-radius:5px;overflow:hidden;display:flex">
            <div style="width:${pct}%;display:flex;overflow:hidden;border-radius:5px 0 0 5px">
              <div style="width:${billPct}%;background:#34d399;min-width:${cat.billable>0?2:0}px"></div>
              <div style="flex:1;background:${col}"></div>
            </div>
          </div>
          <div style="display:flex;gap:16px;margin-top:4px;font-size:10px;color:#94a3b8">
            <span style="color:#16a34a;font-weight:600">âœ“ Billable ${cat.billable}h (${billPct}%)</span>
            <span>â—» Non-bill ${cat.hours-cat.billable}h (${100-billPct}%)</span>
            <span style="margin-left:auto">${Object.keys(cat.tasks).length} task type${Object.keys(cat.tasks).length!==1?"s":""}</span>
          </div>
        </div>`;
      }).join("")}
    </div>`;

    // â”€â”€ SECTION 3: BILLABILITY & EFFICIENCY â”€â”€
    const s3=`<div class="section"><div class="st">Billability &amp; Efficiency Analysis</div>
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:18px">
        <div>
          <div style="font-size:11px;font-weight:700;color:#0e4880;text-transform:uppercase;letter-spacing:.1em;padding-bottom:5px;border-bottom:2px solid #0ea5e9;margin-bottom:10px">Hours Allocation</div>
          ${[
            {l:"Billable Hours",     h:totalBillable,    c:"#34d399"},
            {l:"Non-Billable Hours", h:nonBillableHrs,   c:"#fb923c"},
          ].map(r=>{
            const w=totalWorkHrs?Math.round(r.h/totalWorkHrs*100):0;
            return`<div style="margin-bottom:10px">
              <div style="display:flex;justify-content:space-between;margin-bottom:3px;font-size:12px">
                <span style="font-weight:600;color:#334155">${r.l}</span>
                <span style="font-family:'IBM Plex Mono',monospace;color:${r.c};font-weight:700">${r.h}h â€” ${w}%</span>
              </div>
              <div style="background:#e2e8f0;height:7px;border-radius:4px;overflow:hidden">
                <div style="height:100%;width:${w}%;background:${r.c};border-radius:4px"></div>
              </div>
            </div>`;
          }).join("")}
          ${avgRate>0&&costOfNonBillable>0?`<div style="margin-top:12px;padding:10px 12px;background:#fff7ed;border:1px solid #fed7aa;border-radius:6px;font-size:11px;color:#9a3412">
            <div style="font-weight:700;margin-bottom:3px">ًں’° Non-Billable Opportunity Cost</div>
            <div style="font-family:'IBM Plex Mono',monospace;font-size:14px;color:#c2410c;font-weight:700">${fmtCurrency(costOfNonBillable)}</div>
            <div style="color:#b45309;margin-top:2px">${nonBillableHrs}h أ— $${Math.round(avgRate)}/h blended rate</div>
          </div>`:""}
          <div style="margin-top:12px;padding:10px 12px;background:${billabilityPct>=70?"#f0fdf4":"#fff7ed"};border:1px solid ${billabilityPct>=70?"#bbf7d0":"#fed7aa"};border-radius:6px;font-size:11px">
            <span style="font-weight:700;color:${billabilityPct>=70?"#166534":"#92400e"}">
              ${billabilityPct>=70?"âœ… Billability target met":"âڑ  Below 70% billability target"}
            </span>
            <div style="color:#64748b;margin-top:2px">Current: ${fmtPct(billabilityPct)} آ· Target: â‰¥ 70% آ· Gap: ${billabilityPct>=70?"None":"+"+(70-billabilityPct)+"% needed"}</div>
          </div>
        </div>
        <div>
          <div style="font-size:11px;font-weight:700;color:#4c1d95;text-transform:uppercase;letter-spacing:.1em;padding-bottom:5px;border-bottom:2px solid #a78bfa;margin-bottom:10px">Billability Rate by Category</div>
          <table style="font-size:11px;width:100%">
            <thead><tr>
              <th style="background:#f5f3ff;color:#4c1d95;padding:5px 8px;text-align:left;border-radius:3px 0 0 0">Category</th>
              <th style="background:#f5f3ff;color:#4c1d95;padding:5px 8px;text-align:right">Bill%</th>
              <th style="background:#f5f3ff;color:#4c1d95;padding:5px 8px;text-align:right">Hours</th>
              <th style="background:#f5f3ff;color:#4c1d95;padding:5px 8px;text-align:right">Rating</th>
            </tr></thead>
            <tbody>${taskStats.map((cat,i)=>{
              const bp=cat.hours?Math.round(cat.billable/cat.hours*100):0;
              const rating=bp>=70?"âœ… Good":bp>=40?"âڑ، Fair":"âڑ  Low";
              const rc=bp>=70?"#166534":bp>=40?"#92400e":"#991b1b";
              return`<tr style="background:${i%2===0?"#f8fafc":"#fff"}">
                <td style="padding:5px 8px;font-weight:600">${cat.category}</td>
                <td style="text-align:right;padding:5px 8px;font-family:'IBM Plex Mono',monospace;font-weight:700;color:${rc}">${bp}%</td>
                <td style="text-align:right;padding:5px 8px;font-family:'IBM Plex Mono',monospace;color:#64748b">${cat.hours}h</td>
                <td style="text-align:right;padding:5px 8px;font-size:10px;color:${rc}">${rating}</td>
              </tr>`;
            }).join("")}</tbody>
          </table>
        </div>
      </div>
    </div>`;

    // â”€â”€ SECTION 4: TASK TYPE DEEP DIVE â”€â”€
    const s4=`<div class="section"><div class="st">Task Type Detail â€” Within Each Category</div>
      ${taskStats.map(cat=>{
        const col=ccm[cat.category]||"#0ea5e9";
        const subs=Object.entries(cat.tasks).sort((a,b)=>b[1].hrs-a[1].hrs);
        const cols=Math.min(subs.length,3);
        return`<div style="margin-bottom:14px">
          <div style="font-size:12px;font-weight:700;color:#0f172a;padding:6px 10px;background:#f1f5f9;border-left:4px solid ${col};border-radius:0 5px 5px 0;margin-bottom:6px;display:flex;justify-content:space-between">
            <span>${cat.category}</span>
            <span style="font-family:'IBM Plex Mono',monospace;color:${col}">${cat.hours}h total آ· ${subs.length} type${subs.length!==1?"s":""}</span>
          </div>
          <div style="display:grid;grid-template-columns:repeat(${cols},1fr);gap:6px;padding-left:6px">
            ${subs.map(([taskType,data])=>{
              const tpct=cat.hours?Math.round(data.hrs/cat.hours*100):0;
              const topAct=Object.entries(data.activities).sort((a,b)=>b[1]-a[1])[0];
              return`<div style="background:#f8fafc;border:1px solid #e2e8f0;border-top:2px solid ${col};border-radius:0 0 5px 5px;padding:7px 9px">
                <div style="font-weight:600;color:#334155;font-size:11px;margin-bottom:2px">${taskType}</div>
                <div style="font-family:'IBM Plex Mono',monospace;font-size:14px;font-weight:700;color:${col}">${data.hrs}h <span style="font-size:10px;color:#94a3b8;font-weight:400">${tpct}%</span></div>
                ${topAct?`<div style="font-size:9px;color:#94a3b8;font-style:italic;margin-top:3px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">â†³ ${topAct[0]}</div>`:""}
              </div>`;
            }).join("")}
          </div>
        </div>`;
      }).join("")}
    </div>`;

    // â”€â”€ SECTION 5: ENGINEER أ— CATEGORY MATRIX â”€â”€
    const s5=engCatMatrix.length>0?`<div class="section"><div class="st">Engineer أ— Task Category Matrix</div>
      <div style="overflow-x:auto">
      <table style="font-size:11px;width:100%">
        <thead><tr>
          <th style="text-align:left;white-space:nowrap;padding:5px 8px">Engineer</th>
          <th style="text-align:right;padding:5px 6px">Total</th>
          <th style="text-align:right;padding:5px 6px">Bill%</th>
          ${allCats.map(c=>`<th style="text-align:right;padding:5px 5px;font-size:10px;max-width:55px;overflow:hidden;white-space:nowrap" title="${c}">${c.length>9?c.slice(0,9)+"â€¦":c}</th>`).join("")}
          <th style="text-align:left;padding:5px 8px;font-size:10px">Top Focus</th>
        </tr></thead>
        <tbody>${engCatMatrix.map((eng,ri)=>`<tr style="background:${ri%2===0?"#f8fafc":"#fff"}">
          <td style="padding:5px 8px;font-weight:600;white-space:nowrap">${eng.name}<br><span style="font-size:10px;color:#94a3b8;font-weight:400">${eng.role||""}</span></td>
          <td style="text-align:right;padding:5px 6px;font-family:'IBM Plex Mono',monospace;color:#0ea5e9;font-weight:700">${eng.workHrs}h</td>
          <td style="text-align:right;padding:5px 6px;font-family:'IBM Plex Mono',monospace;font-weight:700;color:${eng.billability>=70?"#16a34a":eng.billability>=40?"#d97706":"#dc2626"}">${eng.billability}%</td>
          ${allCats.map(c=>{const h=eng.catHrs[c]||0;const col=ccm[c]||"#0ea5e9";
            return`<td style="text-align:right;padding:5px 5px;font-family:'IBM Plex Mono',monospace;font-size:11px;color:${h>0?col:"#cbd5e1"}">${h>0?h+"h":"â€”"}</td>`;
          }).join("")}
          <td style="padding:5px 8px;font-size:10px;color:#64748b">${eng.topCat?eng.topCat[0]+" ("+eng.topCat[1]+"h)":"â€”"}</td>
        </tr>`).join("")}</tbody>
      </table>
      </div>
    </div>`:"";

    // â”€â”€ SECTION 6: TOP ACTIVITIES â”€â”€
    const s6=topActivities.length>0?`<div class="section"><div class="st">Top Activities by Hours â€” What the Team Is Actually Working On</div>
      <table>
        <thead><tr>
          <th style="text-align:left">Task Type</th><th style="text-align:left">Activity Description</th>
          <th style="text-align:right">Hours</th><th style="text-align:right">Entries</th>
          <th style="text-align:right">Bill%</th><th style="text-align:right">Share</th>
        </tr></thead>
        <tbody>${topActivities.map((a,i)=>{
          const pct=totalWorkHrs?Math.round(a.hrs/totalWorkHrs*100):0;
          const bp=a.hrs?Math.round(a.billable/a.hrs*100):0;
          return`<tr>
            <td style="font-size:10px;color:#64748b;white-space:nowrap">${a.task}</td>
            <td style="font-weight:600;color:#0f172a">${a.activity}</td>
            <td style="text-align:right;font-family:'IBM Plex Mono',monospace;color:#0ea5e9;font-weight:700">${a.hrs}h</td>
            <td style="text-align:right;font-family:'IBM Plex Mono',monospace;color:#94a3b8">${a.count}أ—</td>
            <td style="text-align:right;font-family:'IBM Plex Mono',monospace;font-weight:700;color:${bp>=70?"#16a34a":bp>=40?"#d97706":"#94a3b8"}">${a.hrs>0?bp+"%":"â€”"}</td>
            <td style="text-align:right;font-family:'IBM Plex Mono',monospace;color:#94a3b8">${pct}%</td>
          </tr>`;
        }).join("")}</tbody>
      </table>
    </div>`:"";

    generatePDF(
      `Task Analysis Report â€” ${period}`,
      [s1,s2,s3,s4,s5,s6],
      `Task &amp; Productivity Analysis آ· ${period} آ· Confidential`
    );
  };
  const buildMonthlyPDF=()=>{
    const pdfStats=visibleEngStats; // scoped for lead, full for admin/acct
    generatePDF(`Monthly Management Report â€” ${MONTHS[month]} ${year}`,[
      `<div class="section"><div class="st">Summary</div><div class="kg">
        <div class="kp"><div class="kv">${fmtPct(overallUtil)}</div><div class="kl">Team Utilization</div></div>
        <div class="kp"><div class="kv">${fmtPct(billabilityPct)}</div><div class="kl">Billability</div></div>
        <div class="kp"><div class="kv">${fmtCurrency(totalRevenue)}</div><div class="kl">Revenue</div></div>
        <div class="kp"><div class="kv">${leaveEntries.length}</div><div class="kl">Absences</div></div>
      </div></div>`,
      `<div class="section"><div class="st">Engineer Performance</div><table><thead><tr><th>Engineer</th><th>Util.</th><th>Bill.</th><th>Work Hrs</th><th>Revenue</th><th>Leave</th></tr></thead>
      <tbody>${pdfStats.map(e=>`<tr><td><strong>${e.name}</strong><br><span style="font-size:11px;color:#64748b">${e.role||""}</span></td>
        <td>${fmtPct(e.utilization)}</td><td>${fmtPct(e.billability)}</td><td>${e.workHrs}h</td>
        <td style="color:#0ea5e9">${fmtCurrency(e.revenue)}</td><td>${e.leaveDays}d</td></tr>`).join("")}</tbody></table></div>`,
      `<div class="section"><div class="st">Projects</div><table><thead><tr><th>No.</th><th>Project</th><th>PM</th><th>Phase</th><th>Hours</th><th>Revenue</th></tr></thead>
      <tbody>${projStats.filter(p=>p.hours>0).map(p=>`<tr>
        <td style="color:#0ea5e9;font-size:11px">${p.id}</td><td>${p.name}</td><td style="color:#a78bfa;font-size:11px">${p.pm||"â€”"}</td><td>${p.phase||""}</td>
        <td>${p.hours}h</td><td>${p.billable?fmtCurrency(p.revenue):"â€”"}</td></tr>`).join("")}</tbody></table></div>`],
      "Prepared for Senior Management");
  };

  /* â”€â”€ LOADING â”€â”€ */
  if(authLoading) return(
    <div style={{display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",minHeight:"100vh",background:"var(--bg0)",gap:16}}>
      <img src={LOGO_SRC} alt="ENEVO Group" style={{width:110,height:110,borderRadius:18,opacity:0.9}}/>
      <div style={{fontFamily:"'IBM Plex Mono',monospace",color:"var(--info)",fontSize:15,letterSpacing:".1em"}}>Loading ENEVO GROUPâ€¦</div>
    </div>
  );

  /* â”€â”€ AUTH SCREEN â”€â”€ */
  if(!session) return(
    <div style={{minHeight:"100vh",background:"var(--bg0)",display:"flex",alignItems:"center",justifyContent:"center",fontFamily:"'IBM Plex Sans',sans-serif"}}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=IBM+Plex+Sans:wght@400;600;700&family=IBM+Plex+Mono:wght@400;600&display=swap');*{box-sizing:border-box;margin:0;padding:0}input,select{background:var(--input-bg);border:1px solid var(--border3);color:var(--text1);padding:10px 14px;border-radius:7px;font-family:'IBM Plex Sans',sans-serif;font-size:15px;outline:none;width:100%;transition:border-color .2s}input:focus,select:focus{border-color:var(--info)}select option{background:var(--input-bg)}.bp{background:linear-gradient(135deg,#0ea5e9,#0369a1);border:none;color:#fff;padding:11px;border-radius:7px;cursor:pointer;font-family:'IBM Plex Sans',sans-serif;font-size:16px;font-weight:700;display:flex;align-items:center;justify-content:center}.bp:hover{opacity:.85}`}</style>
      <div style={{background:"var(--bg1)",border:"1px solid var(--border3)",borderRadius:14,padding:"36px",width:430,maxWidth:"95vw",boxShadow:"0 24px 60px #00000080"}}>
        <div style={{textAlign:"center",marginBottom:24}}>
          <div style={{display:"flex",justifyContent:"center",marginBottom:12}}>
            <img src={LOGO_SRC} alt="ENEVO Group" style={{width:130,height:130,borderRadius:22,objectFit:"contain"}}/>
          </div>
          <div style={{fontFamily:"'IBM Plex Mono',monospace",fontSize:13,color:"var(--info)",letterSpacing:".18em",marginBottom:6}}>ENEVO GROUP</div>
          <div style={{fontSize:22,fontWeight:700,color:"var(--text0)"}}>ENEVO GROUP</div>
          <div style={{fontSize:14,color:"var(--text4)",marginTop:4}}>Industrial & Renewable Energy Automation</div>
        </div>
        {authMode==="login"?(
          <div style={{display:"grid",gap:12}}>
            {authErr&&<div style={{padding:"8px 12px",borderRadius:6,fontSize:14,background:"var(--err-bg)",color:"#f87171",border:"1px solid #f87171"}}>{authErr}</div>}
            <div><Lbl>Email</Lbl><input type="email" value={authEmail} onChange={e=>setAuthEmail(e.target.value)} placeholder="you@company.com"/></div>
            <div><Lbl>Password</Lbl><input type="password" value={authPwd} onChange={e=>setAuthPwd(e.target.value)} onKeyDown={e=>e.key==="Enter"&&handleLogin(e)}/></div>
            <button className="bp" onClick={handleLogin}>Sign In</button>
            <div style={{textAlign:"center",fontSize:14,color:"var(--text4)"}}>New engineer? <span style={{color:"var(--info)",cursor:"pointer"}} onClick={()=>setAuthMode("signup")}>Create Account</span></div>
          </div>
        ):<SignupScreen onBack={()=>setAuthMode("login")}/>}
      </div>
    </div>
  );

  /* â•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گ
     MAIN LAYOUT
  â•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گ */
  // â”€â”€ Minimal SVG nav icons â€” consistent stroke weight, engineering-grade â”€â”€
  const NavIcon=({id,active})=>{
    const c=active?"var(--info)":"var(--text3)";
    const s={width:17,height:17,display:"block",flexShrink:0};
    if(id==="dashboard") return(
      <svg style={s} viewBox="0 0 17 17" fill="none" stroke={c} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <rect x="1.5" y="1.5" width="6" height="6" rx="1.2"/><rect x="9.5" y="1.5" width="6" height="6" rx="1.2"/>
        <rect x="1.5" y="9.5" width="6" height="6" rx="1.2"/><rect x="9.5" y="9.5" width="6" height="6" rx="1.2"/>
      </svg>);
    if(id==="timesheet") return(
      <svg style={s} viewBox="0 0 17 17" fill="none" stroke={c} strokeWidth="1.5" strokeLinecap="round">
        <circle cx="8.5" cy="8.5" r="6.5"/><polyline points="8.5,4.5 8.5,8.5 11,10.5"/>
      </svg>);
    if(id==="projects") return(
      <svg style={s} viewBox="0 0 17 17" fill="none" stroke={c} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M1.5 4.5h14M1.5 4.5V13a1 1 0 001 1h11a1 1 0 001-1V4.5M1.5 4.5V3a1 1 0 011-1h3l1.5 2h6a1 1 0 011 1v.5"/>
      </svg>);
    if(id==="team") return(
      <svg style={s} viewBox="0 0 17 17" fill="none" stroke={c} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="6" cy="5.5" r="2.5"/><path d="M1 14c0-2.76 2.24-5 5-5s5 2.24 5 5"/>
        <circle cx="12.5" cy="5.5" r="2" opacity=".6"/><path d="M11 14c.16-1.3.9-2.43 1.96-3.1" opacity=".6"/>
      </svg>);
    if(id==="reports") return(
      <svg style={s} viewBox="0 0 17 17" fill="none" stroke={c} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M3 2h8l3 3v10a1 1 0 01-1 1H3a1 1 0 01-1-1V3a1 1 0 011-1z"/><polyline points="11,2 11,5 14,5"/>
        <line x1="5" y1="8" x2="12" y2="8"/><line x1="5" y1="11" x2="10" y2="11"/>
      </svg>);
    if(id==="admin") return(
      <svg style={s} viewBox="0 0 17 17" fill="none" stroke={c} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="8.5" cy="8.5" r="2.5"/>
        <path d="M8.5 1.5v2M8.5 13.5v2M1.5 8.5h2M13.5 8.5h2M3.4 3.4l1.4 1.4M12.2 12.2l1.4 1.4M3.4 13.6l1.4-1.4M12.2 4.8l1.4-1.4"/>
      </svg>);
    if(id==="import") return(
      <svg style={s} viewBox="0 0 17 17" fill="none" stroke={c} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="3,9 3,14 14,14 14,9"/><polyline points="5.5,5.5 8.5,2.5 11.5,5.5"/>
        <line x1="8.5" y1="2.5" x2="8.5" y2="11.5"/>
      </svg>);
    return null;
  };

  const navItems = [
    {id:"dashboard", label:"Dashboard"},
    {id:"timesheet", label:(isAcct||isSenior)?"Hours Review":"Post Hours"},
    {id:"projects",  label:"Projects"},
    {id:"team",      label:"Team"},
    ...(canReport?[{id:"reports",label:"Reports & PDF"}]:[]),
    {id:"admin", label:isAdmin?"Admin Panel":isSenior?"Overview Panel":isAcct?"Finance Panel":isLead?"Team Panel":"My Work"},
    ...(isAdmin?[{id:"import",label:"Import Excel"}]:[]),
  ];

  return(
    <div style={{fontFamily:"'IBM Plex Sans',sans-serif",background:"var(--bg0)",minHeight:"100vh",color:"var(--text1)",transition:"background .3s,color .3s"}}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=IBM+Plex+Sans:wght@300;400;500;600;700&family=IBM+Plex+Mono:wght@400;500;600&display=swap');
        *{box-sizing:border-box;margin:0;padding:0}
        /* â”€â”€ DARK THEME (default) â”€â”€ */
        :root{
          --bg0:#07101e;--bg1:#0c1829;--bg2:#060e1c;--bg3:#0d1e33;
          --bg1g:linear-gradient(135deg,#0c1829,#0d1e34);
          --border:#1a3050;--border2:#0d1e33;--border3:#192d47;
          --sidebar:#060c18;--sidebar-border:#0d1e33;
          --nb-hover:#0d1a2d;--atab-active:#0d1a2d;
          --text0:#f0f6ff;--text1:#dde3ef;--text2:#8fa8c4;--text3:#6b8caa;--text4:#4a6f8f;
          --accent:#0ea5e9;--info:#38bdf8;--scrollbar-thumb:#1a3354;
          --warn-bg:#1a0f00;--warn-border:#f59e0b40;
          --err-bg:#2d0808;--err-border:#f8717150;
          --success-bg:#031a0f;--success-border:#34d39940;
          --input-bg:#060e1c;--input-border:#1a3050;
          --modal-bg:#0c1829;--card-hover:#0d1e34;
          --th-bg:#060e1c;--tr-hover:#0d1e33;
        }
        /* â”€â”€ LIGHT THEME â”€â”€ */
        body.light{
          --bg0:#eef2f7;--bg1:#ffffff;--bg2:#f5f8fc;--bg3:#e8eef6;
          --bg1g:linear-gradient(135deg,#ffffff,#f0f5fb);
          --border:#c8d6e8;--border2:#dce6f0;--border3:#c0d0e0;
          --sidebar:#1e293b;--sidebar-border:#2d3f55;
          --nb-hover:#2d3f55;--atab-active:#1e3a5a;
          --text0:#0f172a;--text1:#1e293b;--text2:#334e68;--text3:#4a6080;--text4:#627d98;
          --accent:#0ea5e9;--info:#0284c7;--scrollbar-thumb:#94a3b8;
          --warn-bg:#fffbeb;--warn-border:#f59e0b50;
          --err-bg:#fff1f1;--err-border:#f8717150;
          --success-bg:#f0fdf4;--success-border:#34d39940;
          --input-bg:#f8fafc;--input-border:#c8d6e8;
          --modal-bg:#ffffff;--card-hover:#edf3fa;
          --th-bg:#f0f5fb;--tr-hover:#edf3fa;
        }
        /* scrollbar */
        ::-webkit-scrollbar{width:5px}::-webkit-scrollbar-track{background:var(--bg0)}::-webkit-scrollbar-thumb{background:var(--scrollbar-thumb);border-radius:3px}
        /* nav buttons */
        .nb{background:none;border:none;cursor:pointer;padding:9px 14px;border-radius:6px;font-family:'IBM Plex Sans',sans-serif;font-size:15px;font-weight:500;color:var(--text2);display:flex;align-items:center;gap:8px;transition:all .2s;width:100%;text-align:left}
        .nb:hover{background:var(--nb-hover);color:var(--info)}.nb.a{background:var(--nb-hover);color:var(--info);border-left:2px solid var(--info)}
        /* cards */
        .card{background:var(--bg1);border:1px solid var(--border);border-radius:10px;padding:20px}
        /* buttons */
        .bp{background:linear-gradient(135deg,#0ea5e9,#0369a1);border:none;color:#fff;padding:8px 16px;border-radius:6px;cursor:pointer;font-family:'IBM Plex Sans',sans-serif;font-size:15px;font-weight:600;transition:opacity .2s;display:inline-flex;align-items:center;gap:6px}
        .bp:hover{opacity:.85}
        .bg{background:transparent;border:1px solid var(--border);color:var(--text2);padding:6px 12px;border-radius:6px;cursor:pointer;font-family:'IBM Plex Sans',sans-serif;font-size:14px;transition:all .2s}
        .bg:hover{border-color:var(--info);color:var(--info)}
        .be{background:transparent;border:1px solid #0ea5e930;color:var(--info);padding:4px 9px;border-radius:4px;cursor:pointer;font-size:13px;font-family:'IBM Plex Sans',sans-serif}
        .be:hover{background:#0ea5e920}
        .bd{background:transparent;border:1px solid #7f1d1d;color:#f87171;padding:4px 9px;border-radius:4px;cursor:pointer;font-size:13px;font-family:'IBM Plex Sans',sans-serif}
        .bd:hover{background:#7f1d1d30}
        /* inputs */
        input,select,textarea{background:var(--input-bg);border:1px solid var(--input-border);color:var(--text1);padding:8px 12px;border-radius:6px;font-family:'IBM Plex Sans',sans-serif;font-size:15px;outline:none;width:100%;transition:border-color .2s}
        input:focus,select:focus,textarea:focus{border-color:var(--info)}select option{background:var(--input-bg);color:var(--text1)}
        /* tables */
        table{width:100%;border-collapse:collapse}
        th{color:var(--text2);font-size:13px;font-weight:700;text-transform:uppercase;letter-spacing:.04em;padding:10px 12px;border-bottom:2px solid var(--border);text-align:left}
        td{padding:10px 12px;border-bottom:1px solid var(--border2);font-size:14px;color:var(--text1);line-height:1.45}tr:hover td{background:var(--tr-hover)}th{background:var(--th-bg)}
        /* misc */
        .av{width:32px;height:32px;border-radius:50%;background:linear-gradient(135deg,#0ea5e9,#0369a1);display:flex;align-items:center;justify-content:center;font-size:12px;font-weight:700;color:#fff;flex-shrink:0}
        .bar{height:5px;border-radius:3px;background:linear-gradient(90deg,#0ea5e9,#38bdf8)}
        .modal-ov{position:fixed;inset:0;background:#00000099;backdrop-filter:blur(6px);z-index:100;display:flex;align-items:center;justify-content:center}
        .modal{background:var(--modal-bg);border:1px solid var(--border);border-radius:12px;padding:24px;width:530px;max-width:95vw;max-height:90vh;overflow-y:auto;color:var(--text1)}
        .toast{position:fixed;bottom:28px;right:28px;padding:11px 18px;border-radius:8px;font-size:14px;font-weight:700;z-index:200;animation:su .3s ease}
        @keyframes su{from{transform:translateY(12px);opacity:0}to{transform:translateY(0);opacity:1}}
        .metric{background:var(--bg1g);border:1px solid var(--border);border-radius:10px;padding:16px}
        .wc{background:var(--input-bg);border:1px solid var(--border);border-radius:8px;min-height:110px;padding:8px}
        .atab{background:none;border:none;cursor:pointer;padding:7px 13px;border-radius:6px;font-family:'IBM Plex Sans',sans-serif;font-size:14px;font-weight:600;color:var(--text3);transition:all .2s}
        .atab:hover{color:var(--info)}.atab.a{background:var(--atab-active);color:var(--info)}
        .rpt-card{background:var(--bg1);border:1px solid var(--border);border-radius:8px;padding:14px;cursor:pointer;transition:all .2s}
        .rpt-card:hover,.rpt-card.sel{border-color:var(--info);background:var(--card-hover)}
        .role-badge{display:inline-block;padding:2px 8px;border-radius:3px;font-size:12px;font-weight:700;font-family:'IBM Plex Mono',monospace}
        .metric{background:var(--bg1g);border:1px solid var(--border);border-radius:10px;padding:18px;line-height:1.4}/* light mode sidebar text override */
        body.light .nb{color:#94a3b8}
        body.light .nb:hover,body.light .nb.a{color:#38bdf8;background:#2d3f55}
        /* â”€â”€ Light mode component overrides â”€â”€ */
        body.light{color-scheme:light}
        body.light .bd{border-color:#fca5a5;color:#dc2626}
        body.light .bd:hover{background:#fee2e240}
        body.light .be{border-color:#bfdbfe;color:#2563eb}
        body.light .be:hover{background:#dbeafe50}
        body.light .card{box-shadow:0 1px 6px #0000000d}
        body.light .modal{box-shadow:0 12px 40px #00000018}
        body.light .metric{box-shadow:0 1px 4px #0000000a}
        body.light .modal-ov{background:#00000055}
        body.light th{border-bottom-color:#c8d6e8}
        body.light .toast{box-shadow:0 4px 16px #00000018}
        body.light input,body.light select,body.light textarea{color-scheme:light;box-shadow:inset 0 1px 3px #0000000a}
        body.light input:focus,body.light select:focus,body.light textarea:focus{box-shadow:0 0 0 3px #0ea5e920}
        body.light .rpt-card{box-shadow:0 1px 4px #0000000a}
        body.light .wc{box-shadow:inset 0 1px 3px #0000000a}
        /* â”€â”€ RESPONSIVE / MOBILE â”€â”€ */
        .hamburger{display:none;position:fixed;top:14px;left:14px;z-index:300;
          background:var(--info);border:none;border-radius:8px;width:40px;height:40px;
          cursor:pointer;flex-direction:column;align-items:center;justify-content:center;gap:5px;box-shadow:0 2px 12px #0005}
        .hamburger span{display:block;width:20px;height:2px;background:#fff;border-radius:2px;transition:all .25s}
        .sidebar-overlay{display:none;position:fixed;inset:0;z-index:149;background:#00000060;backdrop-filter:blur(3px)}
        @media(max-width:900px){
          .hamburger{display:flex !important}
          .app-sidebar{transform:translateX(-100%);transition:transform .25s ease;z-index:150}
          .app-sidebar.sidebar-open{transform:translateX(0)}
          .sidebar-overlay{display:block}
          .app-content{margin-left:0 !important;max-width:100vw !important;padding:16px 14px 24px !important;padding-top:64px !important}
        }
        @media(max-width:640px){
          .week-grid-7{grid-template-columns:repeat(3,1fr) !important}
          .stats-5col{grid-template-columns:repeat(2,1fr) !important}
          .stats-4col{grid-template-columns:repeat(2,1fr) !important}
          .hide-mobile{display:none !important}
          .modal{width:95vw !important;padding:16px !important}
          .rpt-two-panel{grid-template-columns:1fr !important}
          .rpt-nav{position:static !important}
        }
      `}</style>

      {/* â”€â”€ Hamburger (mobile only) â”€â”€ */}
      <button className="hamburger" onClick={()=>setMenuOpen(o=>!o)} aria-label="Menu">
        <span style={{transform:menuOpen?"rotate(45deg) translate(5px,5px)":"none"}}/>
        <span style={{opacity:menuOpen?0:1}}/>
        <span style={{transform:menuOpen?"rotate(-45deg) translate(5px,-5px)":"none"}}/>
      </button>
      {/* â”€â”€ Sidebar overlay (mobile tap-to-close) â”€â”€ */}
      {menuOpen&&<div className="sidebar-overlay" onClick={()=>setMenuOpen(false)}/>}

      <div style={{display:"flex"}}>
        {/* â”€â”€ Sidebar â”€â”€ */}
        <div className={`app-sidebar${menuOpen?" sidebar-open":""}`} style={{width:215,background:"var(--sidebar)",borderRight:`1px solid var(--sidebar-border)`,minHeight:"100vh",padding:"20px 10px",position:"fixed",top:0,left:0,bottom:0,overflowY:"auto",zIndex:menuOpen?200:50,transition:"background .3s, transform .25s"}}>
          <div style={{marginBottom:16,paddingLeft:6,paddingRight:6}}>
            <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:6}}>
              <LogoImg/>
              <div style={{flex:1,minWidth:0}}>
                <div style={{fontFamily:"'IBM Plex Mono',monospace",fontSize:12,color:"var(--info)",letterSpacing:".15em",fontWeight:600}}>ENEVO-ERP</div>
                <div style={{fontSize:15,fontWeight:700,color:"var(--text0)",lineHeight:1.1}}>ENEVO GROUP</div>
              </div>
              {/* â”€â”€ Bell notification button â€” lives in sidebar header, no overlap â”€â”€ */}
              {session&&!loading&&(()=>{
                const bellCount=unreadCount;
                const typeIcon=t=>t==="activity_comment"?"ًں’¬":t==="vacation_approved"?"âœ“":t==="vacation_rejected"?"âœ•":t==="vacation_request"?"âڈ³":t==="project_status"?"ًں”„":t==="project_phase"?"ًں“‹":t==="project_leader"?"â­گ":t==="project_assigned"?"ًں‘¤":t==="timesheet_alert"?"âڈ°":t==="overdue_alert"?"âڑ ":t==="activity_assigned"?"ًں“‹":t==="activity_status_changed"?"â†؛":t==="activity_progress_changed"?"â—‰":t==="activity_deadline_changed"?"ًں“…":t==="vacation_cancelled"?"âœ•":t==="new_signup"?"ًں‘¤":"â€¢";
                const typeColor=t=>t==="activity_comment"?"#a78bfa":t==="vacation_approved"?"#34d399":t==="vacation_rejected"?"#f87171":t==="vacation_request"?"#f59e0b":t==="timesheet_alert"?"#f87171":t==="overdue_alert"?"#fb923c":t==="activity_assigned"?"#0ea5e9":t==="activity_status_changed"?"#22d3ee":t==="activity_progress_changed"?"#34d399":t==="activity_deadline_changed"?"#fb923c":t==="vacation_cancelled"?"#f87171":t==="new_signup"?"#fb923c":t==="project_status"?"#a78bfa":t==="project_phase"?"#fb923c":t==="project_leader"?"#f59e0b":t==="project_assigned"?"#34d399":"var(--text3)";
                const typeLabel=t=>t==="activity_comment"?"Comment":t==="vacation_approved"?"Approved":t==="vacation_rejected"?"Rejected":t==="vacation_request"?"Leave Request":t==="timesheet_alert"?"Timesheet":t==="overdue_alert"?"Overdue":t==="activity_assigned"?"Assigned":t==="activity_status_changed"?"Status":t==="activity_progress_changed"?"Progress":t==="activity_deadline_changed"?"Deadline":t==="vacation_cancelled"?"Cancelled":t==="new_signup"?"New Signup":t==="project_status"?"Project":t==="project_phase"?"Phase":t==="project_leader"?"Leader":t==="project_assigned"?"Team":"";
                const fmtAgo=ts=>{if(!ts)return"";const diff=Date.now()-new Date(ts).getTime();const m=Math.floor(diff/60000);if(m<1)return"just now";if(m<60)return m+"m ago";const h=Math.floor(m/60);if(h<24)return h+"h ago";return Math.floor(h/24)+"d ago";};
                const sorted=[...notifications].sort((a,b)=>new Date(b.created_at)-new Date(a.created_at));
                return(
                  <div style={{position:"relative",flexShrink:0}}>
                    {/* Bell button */}
                    <button onClick={()=>setBellOpen(o=>!o)}
                      style={{position:"relative",background:bellOpen?"var(--bg3)":"transparent",border:`1px solid ${bellOpen?"var(--info)":"var(--border)"}`,borderRadius:8,padding:"6px 7px",cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",transition:"all .2s"}}
                      title={bellCount>0?`${bellCount} notification${bellCount!==1?"s":""}`:"No new notifications"}>
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={bellCount>0?"#f59e0b":"var(--text3)"} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 01-3.46 0"/>
                      </svg>
                      {bellCount>0&&<span style={{position:"absolute",top:-5,right:-5,background:"#ef4444",color:"#fff",fontSize:10,fontWeight:800,minWidth:16,height:16,borderRadius:8,display:"flex",alignItems:"center",justifyContent:"center",padding:"0 3px",border:"2px solid var(--sidebar)",fontFamily:"'IBM Plex Mono',monospace",lineHeight:1}}>
                        {bellCount>99?"99+":bellCount}
                      </span>}
                    </button>
                    {/* Dropdown â€” opens to the right of sidebar */}
                    {bellOpen&&(
                      <div style={{position:"fixed",top:72,left:220,width:370,maxHeight:520,background:"var(--bg1)",border:"1px solid var(--border)",borderRadius:14,boxShadow:"0 8px 32px #00000060",overflow:"hidden",display:"flex",flexDirection:"column",zIndex:601}}>
                        {/* Header + Tabs */}
                        <div style={{borderBottom:"1px solid var(--border)",flexShrink:0}}>
                          <div style={{padding:"12px 16px 8px",display:"flex",alignItems:"center",justifyContent:"space-between"}}>
                            <span style={{fontSize:14,fontWeight:700,color:"var(--text0)"}}>Notifications</span>
                            <div style={{display:"flex",gap:6,alignItems:"center"}}>
                              <button onClick={()=>reloadNotifications()}
                                title="Refresh notifications"
                                style={{background:"transparent",border:"none",cursor:"pointer",color:"var(--text3)",fontSize:16,padding:"2px 4px",lineHeight:1}}>â†»</button>
                              {bellTab==="active"&&notifications.length>0&&(
                                <button onClick={async()=>{
                                  // Mark all active as read (history) instead of deleting
                                  const ids=notifications.map(n=>n.id).filter(id=>id!=null);
                                  if(ids.length){
                                    await supabase.from("notifications").update({read:true}).in("id",ids);
                                    setNotifHistory(prev=>[...notifications,...prev].slice(0,200));
                                  }
                                  try{const al=JSON.parse(localStorage.getItem("ec_dismissed_alerts")||"[]");const ods=notifications.filter(n=>n.type==="overdue_alert").map(n=>{try{return JSON.parse(n.meta||"{}").alert_key;}catch{return null;}}).filter(Boolean);if(ods.length)localStorage.setItem("ec_dismissed_alerts",JSON.stringify([...new Set([...al,...ods])]));}catch{}
                                  setNotifications([]);
                                }} style={{background:"transparent",border:"none",color:"var(--text4)",fontSize:12,cursor:"pointer",fontFamily:"'IBM Plex Sans',sans-serif"}}
                                  onMouseEnter={e=>e.currentTarget.style.color="var(--info)"}
                                  onMouseLeave={e=>e.currentTarget.style.color="var(--text4)"}>
                                  Mark all read
                                </button>
                              )}
                              {bellTab==="history"&&notifHistory.length>0&&(
                                <button onClick={async()=>{
                                  const ids=notifHistory.map(n=>n.id).filter(id=>id!=null);
                                  if(ids.length) await supabase.from("notifications").delete().in("id",ids);
                                  setNotifHistory([]);
                                }} style={{background:"transparent",border:"none",color:"var(--text4)",fontSize:12,cursor:"pointer",fontFamily:"'IBM Plex Sans',sans-serif"}}
                                  onMouseEnter={e=>e.currentTarget.style.color="#f87171"}
                                  onMouseLeave={e=>e.currentTarget.style.color="var(--text4)"}>
                                  Clear history
                                </button>
                              )}
                            </div>
                          </div>
                          {/* Active / History tabs */}
                          <div style={{display:"flex",borderTop:"1px solid var(--border3)"}}>
                            {[
                              {id:"active",  label:"Active",  count:bellCount},
                              {id:"history", label:"History", count:notifHistory.length},
                            ].map(tab=>(
                              <button key={tab.id} onClick={()=>setBellTab(tab.id)}
                                style={{flex:1,padding:"7px 12px",border:"none",borderBottom:bellTab===tab.id?"2px solid var(--info)":"2px solid transparent",
                                  background:"transparent",cursor:"pointer",fontFamily:"'IBM Plex Sans',sans-serif",
                                  fontSize:12,fontWeight:bellTab===tab.id?700:500,
                                  color:bellTab===tab.id?"var(--info)":"var(--text4)",transition:"all .15s"}}>
                                {tab.label}
                                {tab.count>0&&<span style={{marginLeft:4,background:bellTab===tab.id?"var(--info)":"var(--border)",color:bellTab===tab.id?"#fff":"var(--text4)",fontSize:10,padding:"1px 5px",borderRadius:8,fontWeight:700}}>{tab.count>99?"99+":tab.count}</span>}
                              </button>
                            ))}
                          </div>
                        </div>
                        {/* List */}
                        <div style={{overflowY:"auto",flex:1}}>
                          {bellTab==="active"&&sorted.length===0&&!isAdmin&&(
                            <div style={{padding:"28px 16px",textAlign:"center",color:"var(--text4)",fontSize:13}}>
                              <div style={{fontSize:24,marginBottom:6}}>ًں””</div>All caught up
                            </div>
                          )}
                          {/* Vacation approval queue â€” admin only */}
                          {isAdmin&&bellTab==="active"&&(()=>{
                            const pendingVacs=entries.filter(e=>e.entry_type==="leave"&&e.activity==="PENDING_APPROVAL");
                            if(!pendingVacs.length&&sorted.length===0) return(
                              <div style={{padding:"28px 16px",textAlign:"center",color:"var(--text4)",fontSize:13}}>
                                <div style={{fontSize:24,marginBottom:6}}>ًں””</div>All caught up
                              </div>
                            );
                            return pendingVacs.map(e=>{
                              const eng=engineers.find(x=>String(x.id)===String(e.engineer_id));
                              const matchedNotif=notifications.find(n=>{try{return n.type==="vacation_request"&&JSON.parse(n.meta||"{}").entry_id===e.id;}catch{return false;}});
                              return(
                                <div key={e.id} style={{padding:"11px 16px",borderBottom:"1px solid var(--border3)",display:"flex",gap:10,alignItems:"flex-start",background:"#78350f08"}}>
                                  <div style={{width:28,height:28,borderRadius:"50%",background:"#f59e0b20",color:"#f59e0b",fontSize:13,display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0,fontWeight:700}}>âڈ³</div>
                                  <div style={{flex:1,minWidth:0}}>
                                    <div style={{fontSize:13,fontWeight:600,color:"var(--text0)",marginBottom:2}}><span style={{color:"#f59e0b"}}>{eng?.name||"Engineer"}</span> â€” Annual Leave</div>
                                    <div style={{fontSize:11,color:"var(--text4)",fontFamily:"'IBM Plex Mono',monospace",marginBottom:7}}>{e.date}</div>
                                    <div style={{display:"flex",gap:5}}>
                                      <button onClick={async()=>{
                                        setEntries(prev=>prev.map(x=>x.id===e.id?{...x,activity:null}:x));
                                        await supabase.from("time_entries").update({activity:null}).eq("id",e.id);
                                        if(matchedNotif){
                                          // Mark as read â†’ moves to admin's history
                                          await supabase.from("notifications").update({read:true}).eq("id",matchedNotif.id);
                                          setNotifications(prev=>prev.filter(n=>n.id!==matchedNotif.id));
                                          setNotifHistory(prev=>[{...matchedNotif,read:true},...prev].slice(0,200));
                                        }
                                        insertNotif({type:"vacation_approved",engineer_id:e.engineer_id,read:false,message:`Your Annual Leave on ${e.date} has been approved`,created_at:new Date().toISOString(),meta:JSON.stringify({engineer_id:e.engineer_id,date:e.date,entry_id:e.id})});
                                        showToast(`${eng?.name||"Vacation"} approved âœ“`);
                                      }} style={{background:"#05603a",border:"1px solid #34d39950",borderRadius:5,padding:"3px 10px",color:"#34d399",fontSize:12,fontWeight:700,cursor:"pointer",fontFamily:"'IBM Plex Sans',sans-serif"}}>âœ“ Approve</button>
                                      <button onClick={async()=>{
                                        setEntries(prev=>prev.filter(x=>x.id!==e.id));
                                        await supabase.from("time_entries").delete().eq("id",e.id);
                                        if(matchedNotif){
                                          // Mark as read â†’ moves to admin's history
                                          await supabase.from("notifications").update({read:true}).eq("id",matchedNotif.id);
                                          setNotifications(prev=>prev.filter(n=>n.id!==matchedNotif.id));
                                          setNotifHistory(prev=>[{...matchedNotif,read:true},...prev].slice(0,200));
                                        }
                                        insertNotif({type:"vacation_rejected",engineer_id:e.engineer_id,read:false,message:`Your Annual Leave on ${e.date} was not approved`,created_at:new Date().toISOString(),meta:JSON.stringify({engineer_id:e.engineer_id,date:e.date,entry_id:e.id})});
                                        showToast(`${eng?.name||"Vacation"} rejected`,false);
                                      }} style={{background:"var(--err-bg)",border:"1px solid #f8717150",borderRadius:5,padding:"3px 10px",color:"#f87171",fontSize:12,fontWeight:700,cursor:"pointer",fontFamily:"'IBM Plex Sans',sans-serif"}}>âœ• Reject</button>
                                    </div>
                                  </div>
                                </div>
                              );
                            });
                          })()}
                          {/* All other notifications â€” active tab */}
                          {bellTab==="active"&&sorted.map(n=>{
                            const ic=typeIcon(n.type);const cl=typeColor(n.type);const lbl=typeLabel(n.type);
                            return(
                              <div key={n.id} style={{padding:"10px 16px",borderBottom:"1px solid var(--border3)",display:"flex",gap:10,alignItems:"flex-start"}}
                                onMouseEnter={e=>e.currentTarget.style.background="var(--bg2)"}
                                onMouseLeave={e=>e.currentTarget.style.background="transparent"}>
                                <div style={{width:28,height:28,borderRadius:"50%",background:cl+"18",color:cl,fontSize:13,display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0,fontWeight:700,border:`1px solid ${cl}25`}}>{ic}</div>
                                <div style={{flex:1,minWidth:0}}>
                                  <div style={{display:"flex",alignItems:"baseline",gap:6,marginBottom:2}}>
                                    <span style={{fontSize:10,fontWeight:700,color:cl,textTransform:"uppercase",letterSpacing:".05em"}}>{lbl}</span>
                                    <span style={{fontSize:10,color:"var(--text4)",marginLeft:"auto",whiteSpace:"nowrap",fontFamily:"'IBM Plex Mono',monospace"}}>{fmtAgo(n.created_at)}</span>
                                  </div>
                                  <div style={{fontSize:12,color:"var(--text1)",lineHeight:1.45}}>{n.message}</div>
                                </div>
                                <button onClick={async()=>{
                                  if(typeof n.id==="string"&&n.id.startsWith("overdue_")){
                                    // overdue_alert: mark localStorage + mark read in DB
                                    try{const m=JSON.parse(n.meta||"{}");if(m.alert_key){const prev=JSON.parse(localStorage.getItem("ec_dismissed_alerts")||"[]");localStorage.setItem("ec_dismissed_alerts",JSON.stringify([...new Set([...prev,m.alert_key])]));}}catch{}
                                    supabase.from("notifications").update({read:true}).eq("id",n.id).then(()=>{});
                                    setNotifications(prev=>prev.filter(x=>x.id!==n.id));
                                    setNotifHistory(prev=>[{...n,read:true},...prev].slice(0,200));
                                  } else {
                                    // Mark as read (moves to history) instead of deleting
                                    await supabase.from("notifications").update({read:true}).eq("id",n.id);
                                    setNotifications(prev=>prev.filter(x=>x.id!==n.id));
                                    setNotifHistory(prev=>[{...n,read:true},...prev].slice(0,200));
                                  }
                                }} style={{background:"transparent",border:"none",color:"var(--text4)",cursor:"pointer",fontSize:13,padding:"2px 3px",flexShrink:0,lineHeight:1}}
                                  title="Mark as read"
                                  onMouseEnter={e=>e.currentTarget.style.color="var(--info)"}
                                  onMouseLeave={e=>e.currentTarget.style.color="var(--text4)"}>âœ“</button>
                              </div>
                            );
                          })}
                          {/* History tab â€” past read notifications */}
                          {bellTab==="history"&&(
                            <div>
                              <div style={{fontSize:11,color:"var(--text4)",textAlign:"center",padding:"5px 0 4px",borderBottom:"1px solid var(--border3)",background:"var(--bg0)",letterSpacing:".04em"}}>
                                ًں“… Last 3 months آ· {notifHistory.length} notifications
                              </div>
                              {notifHistory.length===0
                              ? <div style={{padding:"28px 16px",textAlign:"center",color:"var(--text4)",fontSize:13}}>
                                  <div style={{fontSize:24,marginBottom:6}}>ًں“­</div>No notification history yet
                                </div>
                              : notifHistory.map(n=>{
                                const ic=typeIcon(n.type);const cl=typeColor(n.type);const lbl=typeLabel(n.type);
                                return(
                                  <div key={n.id} style={{padding:"10px 16px",borderBottom:"1px solid var(--border3)",display:"flex",gap:10,alignItems:"flex-start",opacity:0.75}}>
                                    <div style={{width:28,height:28,borderRadius:"50%",background:cl+"10",color:cl,fontSize:13,display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0,fontWeight:700}}>{ic}</div>
                                    <div style={{flex:1,minWidth:0}}>
                                      <div style={{display:"flex",alignItems:"baseline",gap:6,marginBottom:2}}>
                                        <span style={{fontSize:10,fontWeight:700,color:cl,textTransform:"uppercase",letterSpacing:".05em"}}>{lbl}</span>
                                        <span style={{fontSize:10,color:"var(--text4)",marginLeft:"auto",whiteSpace:"nowrap",fontFamily:"'IBM Plex Mono',monospace"}}>{fmtAgo(n.created_at)}</span>
                                      </div>
                                      <div style={{fontSize:12,color:"var(--text3)",lineHeight:1.45}}>{n.message}</div>
                                    </div>
                                    <button onClick={()=>{
                                      // Remove from UI only â€” DB row stays as read history (90-day window)
                                      setNotifHistory(prev=>prev.filter(x=>x.id!==n.id));
                                    }} style={{background:"transparent",border:"none",color:"var(--text4)",cursor:"pointer",fontSize:12,padding:"2px 3px",flexShrink:0}}
                                      title="Delete from history"
                                      onMouseEnter={e=>e.currentTarget.style.color="#f87171"}
                                      onMouseLeave={e=>e.currentTarget.style.color="var(--text4)"}>âœ•</button>
                                  </div>
                                );
                              })
                          }</div>
                          )}
                        </div>
                      </div>
                    )}
                    {bellOpen&&<div style={{position:"fixed",inset:0,zIndex:600}} onClick={()=>setBellOpen(false)}/>}
                  </div>
                );
              })()}
            </div>
            <div style={{fontSize:12,color:"var(--text4)",fontFamily:"'IBM Plex Mono',monospace"}}>ENEVO Group</div>
          </div>
          {navItems.map(n=>(
            <button key={n.id} className={`nb ${view===n.id?"a":""}`} onClick={()=>{setView(n.id);setMenuOpen(false);setBellOpen(false);}}>
              <NavIcon id={n.id} active={view===n.id}/>
              {n.label}
              {/* notification badges moved to bell icon â€” top right */}
            </button>
          ))}
          <div style={{marginTop:14,borderTop:`1px solid var(--border)`,paddingTop:12,paddingLeft:6,paddingRight:6}}>
            <div style={{fontSize:12,color:"var(--text3)",fontWeight:700,letterSpacing:".1em",marginBottom:8}}>PERIOD</div>
            <div style={{marginBottom:8}}><Lbl>Month</Lbl>
              <select value={month} onChange={e=>setMonth(+e.target.value)} style={{background:"var(--bg2)",border:"1px solid var(--border3)",borderRadius:6,padding:"5px 10px",color:"var(--text0)",fontSize:13,fontWeight:600,outline:"none",cursor:"pointer",width:"100%"}}>
                {MONTHS.map((m,i)=><option key={i} value={i}>{m}</option>)}
              </select>
            </div>
            <div><Lbl>Year</Lbl>
              <div style={{display:"flex",gap:6,alignItems:"center"}}>
                <select value={year} onChange={e=>setYear(+e.target.value)} style={{background:"var(--bg2)",border:"1px solid var(--border3)",borderRadius:6,padding:"5px 10px",color:"var(--text0)",fontSize:13,fontWeight:600,outline:"none",cursor:"pointer",minWidth:80}}>
                  {[year-2,year-1,year,year+1].map(y=><option key={y}>{y}</option>)}
                </select>
                {entriesLoading&&<span style={{fontSize:12,color:"var(--info)",fontFamily:"'IBM Plex Mono',monospace"}}>âں³ {year}</span>}
              </div>
            </div>
          </div>
          <div style={{position:"absolute",bottom:16,left:10,right:10}}>
            <div style={{background:"var(--bg1)",border:`1px solid var(--border)`,borderRadius:8,padding:"9px 10px"}}>
              <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:8}}>
                <div className="av" style={{width:26,height:26,fontSize:11}}>{myProfile?.name?.slice(0,2).toUpperCase()||"?"}</div>
                <div style={{minWidth:0}}>
                  <div style={{fontSize:13,fontWeight:600,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap",color:"var(--text0)"}}>{myProfile?.name||session.user.email}</div>
                  <div style={{fontSize:12,color:ROLE_COLORS[role]||"var(--text4)",fontWeight:600}}>{ROLE_LABELS[role]||role}</div>
                </div>
              </div>
              <div style={{display:"flex",gap:6,marginBottom:6}}>
                <button onClick={()=>{setShowPwdModal(true);setPwdForm({newPwd:"",confirmPwd:""});setPwdMsg(null);}} style={{flex:1,background:"transparent",border:`1px solid var(--border)`,color:"var(--text2)",padding:"5px",borderRadius:5,cursor:"pointer",fontSize:13,fontFamily:"'IBM Plex Sans',sans-serif"}}
                  onMouseEnter={e=>{e.currentTarget.style.borderColor="var(--info)";e.currentTarget.style.color="var(--info)"}}
                  onMouseLeave={e=>{e.currentTarget.style.borderColor="var(--border)";e.currentTarget.style.color="var(--text2)"}}>
                  ًں”‘ Password
                </button>
                <button onClick={toggleTheme} title={isDark?"Switch to Light Mode":"Switch to Dark Mode"} style={{flex:1,background:"transparent",border:`1px solid var(--border)`,color:"var(--text2)",padding:"5px",borderRadius:5,cursor:"pointer",fontSize:15,fontFamily:"'IBM Plex Sans',sans-serif",transition:"all .2s"}}
                  onMouseEnter={e=>{e.currentTarget.style.borderColor="var(--info)";e.currentTarget.style.color="var(--info)"}}
                  onMouseLeave={e=>{e.currentTarget.style.borderColor="var(--border)";e.currentTarget.style.color="var(--text2)"}}>
                  {isDark?"âک€ï¸ڈ":"ًںŒ™"}
                </button>
              </div>
              <button onClick={handleLogout} style={{width:"100%",background:"transparent",border:`1px solid var(--border)`,color:"var(--text2)",padding:"5px",borderRadius:5,cursor:"pointer",fontSize:13,fontFamily:"'IBM Plex Sans',sans-serif"}}>Sign Out</button>
            </div>
          </div>
        </div>


        {/* â”€â”€ Main Content â”€â”€ */}
        <div className="app-content" style={{marginLeft:215,flex:1,padding:"24px 28px",maxWidth:"calc(100vw - 215px)",background:"var(--bg2)",color:"var(--text1)",minHeight:"100vh",transition:"background .3s"}}>
          {loading&&<div style={{textAlign:"center",padding:60,color:"var(--text4)",fontFamily:"'IBM Plex Mono',monospace"}}>Loadingâ€¦</div>}
          {!loading&&<>

          {/* â•گâ•گâ•گâ•گ DASHBOARD â•گâ•گâ•گâ•گ */}
          {view==="dashboard"&&(
            <div style={{display:"grid",gap:20}}>

              {/* â”€â”€ Page header + controls â”€â”€ */}
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",flexWrap:"wrap",gap:14}}>
                <div>
                  <div style={{fontSize:11,fontWeight:700,color:"var(--text4)",textTransform:"uppercase",letterSpacing:".1em",marginBottom:4}}>
                    {isAdmin||isAcct||isLead?"TEAM COMMAND CENTER":"MY DASHBOARD"}
                  </div>
                  <h1 style={{fontSize:26,fontWeight:800,color:"var(--text0)",lineHeight:1}}>
                    {MONTHS[month]} {year}
                  </h1>
                  <p style={{color:"var(--text3)",fontSize:14,marginTop:4,fontFamily:"'IBM Plex Mono',monospace"}}>
                    {isAdmin||isAcct||isLead?"Live team overview آ· auto-synced":"Your personal stats"}
                    {entriesLoading&&<span style={{color:"var(--info)",marginLeft:8}}>âں³ Loading {year}â€¦</span>}
                  </p>
                </div>
                {/* Controls */}
                <div style={{display:"flex",gap:8,alignItems:"center",flexWrap:"wrap"}}>
                  <div style={{display:"flex",alignItems:"center",gap:4,background:"var(--bg1)",border:"1px solid var(--border)",borderRadius:8,padding:"6px 10px"}}>
                    <button style={{background:"none",border:"none",color:"var(--text2)",cursor:"pointer",fontSize:16,padding:"0 4px",lineHeight:1}} onClick={()=>{if(month===0){setMonth(11);setYear(y=>y-1);}else setMonth(m=>m-1);}}>â€¹</button>
                    <select value={month} onChange={e=>setMonth(+e.target.value)} style={{background:"transparent",border:"none",color:"var(--text0)",fontSize:14,fontWeight:600,fontFamily:"'IBM Plex Sans',sans-serif",cursor:"pointer",outline:"none",padding:"0 4px",minWidth:90}}>
                      {MONTHS.map((m,i)=><option key={i} value={i}>{m}</option>)}
                    </select>
                    <select value={year} onChange={e=>setYear(+e.target.value)} style={{background:"transparent",border:"none",color:"var(--text0)",fontSize:14,fontWeight:700,fontFamily:"'IBM Plex Mono',monospace",cursor:"pointer",outline:"none",padding:"0 4px",minWidth:58}}>
                      {Array.from({length:6},(_,i)=>new Date().getFullYear()-2+i).map(y=><option key={y}>{y}</option>)}
                    </select>
                    <button style={{background:"none",border:"none",color:"var(--text2)",cursor:"pointer",fontSize:16,padding:"0 4px",lineHeight:1}} onClick={()=>{if(month===11){setMonth(0);setYear(y=>y+1);}else setMonth(m=>m+1);}}>â€؛</button>
                  </div>
                  {(isAdmin||isAcct||isLead)&&(
                    <select value={dashProjFilter} onChange={e=>setDashProjFilter(e.target.value)}
                      style={{background:"var(--bg1)",border:"1px solid var(--border)",borderRadius:8,padding:"8px 12px",color:"var(--text0)",fontSize:14,fontFamily:"'IBM Plex Sans',sans-serif",minWidth:180}}>
                      <option value="ALL">All Projects</option>
                      {projects.filter(p=>p.status==="Active").map(p=><option key={p.id} value={p.id}>{p.name}</option>)}
                    </select>
                  )}
                  {dashProjFilter!=="ALL"&&<button className="bg" style={{fontSize:13}} onClick={()=>setDashProjFilter("ALL")}>âœ• Clear filter</button>}
                </div>
              </div>

              {/* â”€â”€ ENGINEER personal view â”€â”€ */}
              {!isAdmin&&!isAcct&&!isLead&&(()=>{
                const myE=monthEntries.filter(e=>String(e.engineer_id)===String(myProfile?.id));
                const myWork=myE.filter(e=>e.entry_type==="work").reduce((s,e)=>s+e.hours,0);
                const myLeave=myE.filter(e=>e.entry_type==="leave").length;
                const myProjs=[...new Set(myE.filter(e=>e.entry_type==="work").map(e=>e.project_id).filter(Boolean))].length;
                const myTarget=getTargetHrs(year,month,myWeekend);
                const myUtil=myTarget>0?Math.round(myWork/myTarget*100):0;
                const utilColor=myUtil>=80?"#34d399":myUtil>=60?"#fb923c":"#f87171";
                return<>
                  <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:14}}>
                    {[
                      {l:"Work Hours",v:myWork+"h",c:"var(--info)",sub:`Target ${myTarget}h`},
                      {l:"Utilization",v:fmtPct(myUtil),c:utilColor,sub:myUtil>=80?"On track":myUtil>=60?"Needs attention":"Below target"},
                      {l:"Leave Days",v:myLeave+"d",c:"#fb923c",sub:MONTHS[month]},
                      {l:"Projects",v:myProjs,c:"#a78bfa",sub:"Active this month"},
                    ].map((s,i)=>(
                      <div key={i} style={{background:"var(--bg1)",border:"1px solid var(--border)",borderRadius:12,padding:"18px 20px",borderTop:`3px solid ${s.c}`}}>
                        <div style={{fontSize:12,fontWeight:700,color:"var(--text3)",textTransform:"uppercase",letterSpacing:".07em",marginBottom:10}}>{s.l}</div>
                        <div style={{fontFamily:"'IBM Plex Mono',monospace",fontSize:30,fontWeight:800,color:s.c,lineHeight:1,marginBottom:6}}>{s.v}</div>
                        <div style={{fontSize:13,color:"var(--text4)"}}>{s.sub}</div>
                      </div>
                    ))}
                  </div>
                  <div className="card" style={{padding:0,overflow:"hidden"}}>
                    <div style={{background:"var(--bg0)",borderBottom:"1px solid var(--border)",padding:"14px 20px"}}>
                      <div style={{fontSize:15,fontWeight:700,color:"var(--text0)"}}>My Work Log â€” {MONTHS[month]} {year}</div>
                    </div>
                    <table>
                      <thead><tr><th>Date</th><th>Project</th><th>Task</th><th>Activity</th><th>Hrs</th></tr></thead>
                      <tbody>{myE.filter(e=>e.entry_type==="work").sort((a,b)=>a.date.localeCompare(b.date)).map(e=>{
                        const p=projects.find(x=>x.id===e.project_id);
                        return<tr key={e.id}>
                          <td style={{fontFamily:"'IBM Plex Mono',monospace"}}>{e.date}</td>
                          <td style={{color:"var(--info)",fontWeight:600}}>{p?.id||"â€”"}</td>
                          <td style={{color:"var(--text2)"}}>{e.task_type||"â€”"}</td>
                          <td style={{color:"var(--text3)",fontStyle:"italic",maxWidth:180,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{e.activity||"â€”"}</td>
                          <td style={{fontFamily:"'IBM Plex Mono',monospace",fontWeight:700,color:"var(--info)"}}>{e.hours}h</td>
                        </tr>;
                      })}{myE.length===0&&<tr><td colSpan={5} style={{textAlign:"center",color:"var(--text4)",padding:24}}>No entries for {MONTHS[month]} {year} â€” go to Post Hours to log time.</td></tr>}
                      </tbody>
                    </table>
                  </div>
                </>;
              })()}

              {/* â”€â”€ ADMIN / LEAD / ACCOUNTANT full dashboard â”€â”€ */}
              {(isAdmin||isAcct||isLead)&&(()=>{
                const dEntries=dashProjFilter==="ALL"?monthEntries:monthEntries.filter(e=>e.project_id===dashProjFilter);
                const dWork=dEntries.filter(e=>e.entry_type==="work");
                const dWorkHrs=dWork.reduce((s,e)=>s+e.hours,0);
                const dBillHrs=dWork.reduce((s,e)=>{const p=projects.find(x=>x.id===e.project_id);return s+(p&&p.billable?e.hours:0);},0);
                const dNonHrs=dWorkHrs-dBillHrs;
                const dRevenue=dWork.reduce((s,e)=>{const p=projects.find(x=>x.id===e.project_id);return s+(p&&p.billable?p.rate_per_hour*e.hours:0);},0);
                const dBillPct=dWorkHrs?Math.round(dBillHrs/dWorkHrs*100):0;
                const dLeave=dEntries.filter(e=>e.entry_type==="leave").length;
                const billColor=dBillPct>=80?"#34d399":dBillPct>=60?"#fb923c":"#f87171";

                return<>
                {/* â”€â”€ Non-billable warning â”€â”€ */}
                {(isAdmin||isAcct)&&dWorkHrs>0&&dBillHrs===0&&(
                  <div style={{background:"var(--warn-bg)",border:"1px solid #fb923c40",borderRadius:10,padding:"12px 18px",display:"flex",alignItems:"center",justifyContent:"space-between",gap:12}}>
                    <span style={{fontSize:14,color:"#fb923c"}}>âڑ  All hours are showing as non-billable â€” projects may need the billable flag set.</span>
                    <button className="bg" style={{fontSize:13,borderColor:"#fb923c",color:"#fb923c",whiteSpace:"nowrap",flexShrink:0}} onClick={()=>setView("reports")}>Fix in Reports â†’</button>
                  </div>
                )}

                {/* â”€â”€ Hero metrics â”€â”€ */}
                <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:14}}>
                  {[
                    {l:"Total Work Hours",  v:dWorkHrs+"h",  c:"var(--text0)",  sub:`${dEntries.filter(e=>e.entry_type==="work").length} entries آ· ${[...new Set(dWork.map(e=>e.engineer_id))].length} engineers`,show:true},
                    {l:"Billable Hours",    v:dBillHrs+"h",  c:"#34d399",       sub:`${dBillPct}% of total work`,show:isAdmin||isAcct||isLead},
                    {l:"Billability Rate",  v:fmtPct(dBillPct),c:billColor,     sub:dBillPct>=80?"On target":dBillPct>=60?"Needs attention":"Below target",show:isAdmin||isAcct},
                    {l:"Non-Billable",      v:dNonHrs+"h",   c:"#fb923c",       sub:"Internal / overhead",show:isAdmin||isAcct},
                    {l:"Revenue Billed",   v:fmtCurrency(dRevenue),c:"#a78bfa", sub:MONTHS[month]+" "+year,show:isAdmin||isAcct},
                    {l:"Absence Days",     v:dLeave+"d",     c:"#f472b6",       sub:"All leave types",show:true},
                  ].filter(m=>m.show).map((m,i)=>(
                    <div key={i} style={{background:"var(--bg1)",border:"1px solid var(--border)",borderRadius:12,padding:"20px 22px",borderTop:`3px solid ${m.c}`,display:"flex",flexDirection:"column",gap:8}}>
                      <div style={{fontSize:12,fontWeight:700,color:"var(--text3)",textTransform:"uppercase",letterSpacing:".07em"}}>{m.l}</div>
                      <div style={{fontFamily:"'IBM Plex Mono',monospace",fontSize:32,fontWeight:800,color:m.c,lineHeight:1}}>{m.v}</div>
                      <div style={{fontSize:13,color:"var(--text4)"}}>{m.sub}</div>
                    </div>
                  ))}
                </div>

                {/* â”€â”€ Team Utilization + Task Distribution â”€â”€ */}
                <div style={{display:"grid",gridTemplateColumns:"1.6fr 1fr",gap:14}}>

                  {/* Team Utilization */}
                  <div className="card" style={{padding:0,overflow:"hidden"}}>
                    <div style={{background:"var(--bg0)",borderBottom:"1px solid var(--border)",padding:"14px 20px",display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                      <div style={{fontSize:15,fontWeight:700,color:"var(--text0)"}}>Team Utilization</div>
                      <div style={{fontSize:13,color:"var(--text3)",fontFamily:"'IBM Plex Mono',monospace"}}>{MONTHS[month]} {year}</div>
                    </div>
                    <div style={{padding:"16px 20px",display:"grid",gap:12}}>
                      {visibleEngStats.length===0&&<p style={{color:"var(--text4)",fontSize:14,textAlign:"center",padding:16}}>No hours logged yet.</p>}
                      {visibleEngStats.map(eng=>(
                        <div key={eng.id}>
                          <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:6}}>
                            <div className="av" style={{width:30,height:30,fontSize:12,flexShrink:0}}>{eng.name?.slice(0,2).toUpperCase()}</div>
                            <div style={{flex:1,minWidth:0}}>
                              <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                                <span style={{fontSize:14,fontWeight:600,color:"var(--text0)",overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{eng.name}</span>
                                <div style={{display:"flex",gap:12,alignItems:"center",flexShrink:0,marginLeft:8}}>
                                  <span style={{fontFamily:"'IBM Plex Mono',monospace",fontSize:14,fontWeight:700,color:"var(--info)"}}>{eng.workHrs}h</span>
                                  <span style={{fontFamily:"'IBM Plex Mono',monospace",fontSize:13,fontWeight:700,color:eng.utilization>=80?"#34d399":eng.utilization>=60?"#fb923c":"#f87171"}}>{fmtPct(eng.utilization)}</span>
                                  {(isAdmin||isAcct)&&<span style={{fontFamily:"'IBM Plex Mono',monospace",fontSize:12,color:"#a78bfa",minWidth:36,textAlign:"right"}}>{fmtPct(eng.billability)}</span>}
                                </div>
                              </div>
                            </div>
                          </div>
                          <div style={{background:"var(--bg3)",height:8,borderRadius:4,overflow:"hidden"}}>
                            <div style={{height:"100%",width:`${Math.min(100,eng.utilization)}%`,borderRadius:4,transition:"width .6s ease",
                              background:eng.utilization>=80?"linear-gradient(90deg,#34d399,#10b981)":eng.utilization>=60?"linear-gradient(90deg,#fb923c,#f59e0b)":"linear-gradient(90deg,#f87171,#ef4444)"}}/>
                          </div>
                        </div>
                      ))}
                      {(isAdmin||isAcct)&&visibleEngStats.length>0&&<div style={{fontSize:12,color:"var(--text4)",marginTop:4,textAlign:"right"}}>Hours آ· Utilization% آ· <span style={{color:"#a78bfa"}}>Billability%</span></div>}
                    </div>
                  </div>

                  {/* Task Distribution */}
                  <div className="card" style={{padding:0,overflow:"hidden"}}>
                    <div style={{background:"var(--bg0)",borderBottom:"1px solid var(--border)",padding:"14px 20px",display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                      <div style={{fontSize:15,fontWeight:700,color:"var(--text0)"}}>Task Distribution</div>
                      <div style={{fontSize:13,color:"var(--text3)",fontFamily:"'IBM Plex Mono',monospace"}}>{dWorkHrs}h total</div>
                    </div>
                    <div style={{padding:"16px 20px",display:"grid",gap:12}}>
                      {taskStats.length===0&&<p style={{color:"var(--text4)",fontSize:14,textAlign:"center",padding:16}}>No tasks logged.</p>}
                      {taskStats.map((cat,i)=>{
                        const pct=totalWorkHrs?Math.round(cat.hours/totalWorkHrs*100):0;
                        const catColors=["var(--info)","#a78bfa","#34d399","#fb923c","#f472b6","#f59e0b"];
                        const c=catColors[i%catColors.length];
                        return(
                        <div key={cat.category}>
                          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:5}}>
                            <span style={{fontSize:13,fontWeight:500,color:"var(--text1)"}}>{cat.category}</span>
                            <span style={{fontFamily:"'IBM Plex Mono',monospace",fontSize:13,fontWeight:700,color:c}}>{cat.hours}h آ· {pct}%</span>
                          </div>
                          <div style={{background:"var(--bg3)",height:8,borderRadius:4,overflow:"hidden"}}>
                            <div style={{height:"100%",width:`${pct}%`,borderRadius:4,background:c,transition:"width .6s ease"}}/>
                          </div>
                        </div>);
                      })}
                    </div>
                  </div>
                </div>

                {/* â”€â”€ Active Projects â”€â”€ */}
                <div className="card" style={{padding:0,overflow:"hidden"}}>
                  <div style={{background:"var(--bg0)",borderBottom:"1px solid var(--border)",padding:"14px 20px",display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                    <div style={{fontSize:15,fontWeight:700,color:"var(--text0)"}}>
                      Active Projects
                      {dashProjFilter!=="ALL"&&<span style={{fontSize:13,fontWeight:400,color:"var(--text3)",marginLeft:8}}>آ· Filtered</span>}
                    </div>
                    <div style={{fontSize:13,color:"var(--text3)",fontFamily:"'IBM Plex Mono',monospace"}}>{MONTHS[month]} {year}</div>
                  </div>
                  <table>
                    <thead><tr>
                      <th>Project</th><th>No.</th><th>Phase</th><th style={{textAlign:"right"}}>Hours</th>
                      {(isAdmin||isAcct)&&<><th>Type</th><th style={{textAlign:"right"}}>Revenue</th></>}
                    </tr></thead>
                    <tbody>
                      {projStats.filter(p=>p.hours>0&&(dashProjFilter==="ALL"||p.id===dashProjFilter)).map(p=>(
                        <tr key={p.id}>
                          <td style={{fontWeight:600,color:"var(--text0)"}}>{p.name||p.id}</td>
                          <td style={{fontFamily:"'IBM Plex Mono',monospace",color:"var(--info)",fontWeight:700}}>{p.id}</td>
                          <td><span style={{fontSize:12,padding:"2px 8px",borderRadius:4,background:"var(--bg3)",color:"var(--text2)",fontWeight:600}}>{p.phase||"â€”"}</span></td>
                          <td style={{textAlign:"right",fontFamily:"'IBM Plex Mono',monospace",fontWeight:700,color:"var(--text0)"}}>{p.hours}h</td>
                          {(isAdmin||isAcct)&&<>
                            <td><span style={{fontSize:12,padding:"2px 8px",borderRadius:4,fontFamily:"'IBM Plex Mono',monospace",fontWeight:700,background:p.billable?"#05603a30":"#fb923c20",color:p.billable?"#34d399":"#fb923c"}}>{p.billable?"BILLABLE":"NON-BILL"}</span></td>
                            <td style={{textAlign:"right",fontFamily:"'IBM Plex Mono',monospace",color:"#a78bfa",fontWeight:600}}>{p.billable?fmtCurrency(p.revenue):"â€”"}</td>
                          </>}
                        </tr>
                      ))}
                      {projStats.filter(p=>p.hours>0&&(dashProjFilter==="ALL"||p.id===dashProjFilter)).length===0&&(
                        <tr><td colSpan={(isAdmin||isAcct)?6:4} style={{textAlign:"center",color:"var(--text4)",padding:24}}>No hours logged for {MONTHS[month]} {year}</td></tr>
                      )}
                    </tbody>
                  </table>
                </div>

                {/* â”€â”€ Deadlines + Workload â”€â”€ */}
                {(isAdmin||isLead)&&activitiesLoaded&&(()=>{
                  // Dashboard uses local date (not UTC toISOString) to avoid timezone shift
                  const _dn=new Date();
                  const todayStr=`${_dn.getFullYear()}-${String(_dn.getMonth()+1).padStart(2,"0")}-${String(_dn.getDate()).padStart(2,"0")}`;
                  const _addD=(n)=>{const d=new Date(_dn);d.setDate(_dn.getDate()+n);return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,"0")}-${String(d.getDate()).padStart(2,"0")}`;};
                  const in30Str=_addD(30); // Extended to 30 days (was 14)
                  // Build set of On Hold / Completed project IDs â€” exclude from all deadline views
                  const _inactiveDashProjIds=new Set(projects.filter(p=>p.status==="On Hold"||p.status==="Completed").map(p=>p.id));
                  const upcoming=activities.filter(a=>
                    a.end_date&&a.end_date>=todayStr&&a.end_date<=in30Str&&
                    a.status!=="Completed"&&a.status!=="Cancelled"&&a.status!=="On Hold"&&
                    !_inactiveDashProjIds.has(a.project_id)  // exclude On Hold + Completed projects
                  ).sort((a,b)=>a.end_date.localeCompare(b.end_date));
                  const overdue=activities.filter(a=>
                    a.end_date&&a.end_date<todayStr&&
                    a.status!=="Completed"&&a.status!=="Cancelled"&&a.status!=="On Hold"&&
                    !_inactiveDashProjIds.has(a.project_id)  // exclude On Hold + Completed projects
                  ).sort((a,b)=>a.end_date.localeCompare(b.end_date));
                  const engWorkload=visibleEngStats.map(eng=>{const logged=eng.workHrs,target=eng.targetHrs||0,remaining=Math.max(0,target-logged),availPct=target>0?Math.round(remaining/target*100):0;return{...eng,logged,target,remaining,availPct};}).filter(e=>e.target>0).sort((a,b)=>b.availPct-a.availPct);
                  const fmtDl=d=>{const dt=new Date(d+"T12:00:00"),diff=Math.round((dt-new Date(todayStr+"T12:00:00"))/(864e5));return diff===0?{label:"Today",c:"#f87171"}:diff===1?{label:"Tomorrow",c:"#fb923c"}:diff<=7?{label:`In ${diff}d`,c:"#fb923c"}:diff<=14?{label:`In ${diff}d`,c:"var(--info)"}:{label:`In ${diff}d`,c:"var(--text3)"};};
                  const daysLeft=(()=>{let n=0,t=new Date(),e=new Date(year,month+1,0);while(t<=e){if(t.getDay()!==5&&t.getDay()!==6)n++;t.setDate(t.getDate()+1);}return n;})();
                  return(
                  <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:14}}>

                    {/* Deadlines */}
                    <div className="card" style={{padding:0,overflow:"hidden"}}>
                      <div style={{background:"var(--bg0)",borderBottom:"1px solid var(--border)",padding:"14px 20px",display:"flex",alignItems:"center",justifyContent:"space-between"}}>
                        <div style={{fontSize:15,fontWeight:700,color:"var(--text0)"}}>Upcoming Deadlines
                          <span style={{fontSize:13,fontWeight:400,color:"var(--text3)",marginLeft:8}}>Next 30 days</span>
                        </div>
                        {overdue.length>0&&<span style={{fontSize:12,padding:"3px 10px",borderRadius:10,background:"#f8711820",border:"1px solid #f8711840",color:"#f87171",fontWeight:700}}>âڑ  {overdue.length} overdue</span>}
                      </div>
                      <div style={{maxHeight:300,overflowY:"auto"}}>
                        {overdue.length===0&&upcoming.length===0&&<div style={{padding:"28px 20px",textAlign:"center",color:"var(--text4)",fontSize:14}}>No deadlines in the next 30 days âœ“</div>}
                        {overdue.slice(0,5).map(a=>{const proj=projects.find(p=>p.id===a.project_id);return(
                          <div key={a.id} style={{padding:"11px 20px",borderBottom:"1px solid var(--border)",background:"#f8711808",display:"flex",gap:12,alignItems:"center"}}>
                            <div style={{width:4,alignSelf:"stretch",background:"#f87171",borderRadius:2,flexShrink:0}}/>
                            <div style={{flex:1,minWidth:0}}>
                              <div style={{fontSize:14,fontWeight:600,color:"var(--text0)",overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{a.activity_name}</div>
                              <div style={{fontSize:13,color:"var(--text3)",marginTop:2}}><span style={{color:"var(--info)"}}>{proj?.name||a.project_id}</span>{a.assigned_to&&<span style={{color:"var(--text4)"}}> آ· {a.assigned_to}</span>}</div>
                            </div>
                            <div style={{textAlign:"right",flexShrink:0}}>
                              <div style={{fontSize:13,fontWeight:700,color:"#f87171"}}>OVERDUE</div>
                              <div style={{fontSize:12,color:"var(--text4)",fontFamily:"'IBM Plex Mono',monospace"}}>{a.end_date}</div>
                            </div>
                          </div>);})}
                        {upcoming.map(a=>{const proj=projects.find(p=>p.id===a.project_id),dl=fmtDl(a.end_date),pct=Math.round((a.progress||0)*100);return(
                          <div key={a.id} style={{padding:"11px 20px",borderBottom:"1px solid var(--border)",display:"flex",gap:12,alignItems:"center"}}>
                            <div style={{width:4,alignSelf:"stretch",background:dl.c,borderRadius:2,flexShrink:0}}/>
                            <div style={{flex:1,minWidth:0}}>
                              <div style={{fontSize:14,fontWeight:600,color:"var(--text0)",overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{a.activity_name}</div>
                              <div style={{fontSize:13,color:"var(--text3)",marginTop:2}}>
                                <span style={{color:"var(--info)"}}>{proj?.name||a.project_id}</span>
                                {a.assigned_to&&<span style={{color:"var(--text4)"}}> آ· {a.assigned_to}</span>}
                                <span style={{marginLeft:8,fontFamily:"'IBM Plex Mono',monospace",fontWeight:700,color:pct>=75?"#34d399":pct>=40?"var(--info)":"var(--text3)"}}>{pct}%</span>
                              </div>
                            </div>
                            <div style={{textAlign:"right",flexShrink:0}}>
                              <div style={{fontSize:13,fontWeight:700,color:dl.c}}>{dl.label}</div>
                              <div style={{fontSize:12,color:"var(--text4)",fontFamily:"'IBM Plex Mono',monospace"}}>{a.end_date}</div>
                            </div>
                          </div>);})}
                      </div>
                    </div>

                    {/* Workload Forecast */}
                    <div className="card" style={{padding:0,overflow:"hidden"}}>
                      <div style={{background:"var(--bg0)",borderBottom:"1px solid var(--border)",padding:"14px 20px"}}>
                        <div style={{fontSize:15,fontWeight:700,color:"var(--text0)"}}>Workload Forecast</div>
                        <div style={{fontSize:13,color:"var(--text3)",marginTop:3}}>{daysLeft} working days left in {MONTHS[month]}</div>
                      </div>
                      <div style={{maxHeight:300,overflowY:"auto"}}>
                        {engWorkload.length===0&&<div style={{padding:"28px 20px",textAlign:"center",color:"var(--text4)",fontSize:14}}>No engineer data</div>}
                        {engWorkload.map(eng=>{
                          const c=eng.availPct>=60?"#34d399":eng.availPct>=30?"#fb923c":"#f87171";
                          const status=eng.availPct>=60?"Available":eng.availPct>=30?"Busy":"Near Full";
                          return(
                          <div key={eng.id} style={{padding:"12px 20px",borderBottom:"1px solid var(--border)"}}>
                            <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:7}}>
                              <div className="av" style={{width:30,height:30,fontSize:12,flexShrink:0}}>{eng.name?.slice(0,2).toUpperCase()}</div>
                              <div style={{flex:1,minWidth:0,display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                                <span style={{fontSize:14,fontWeight:600,color:"var(--text0)",overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap",maxWidth:140}}>{eng.name}</span>
                                <span style={{fontSize:12,padding:"2px 8px",borderRadius:8,background:c+"20",border:`1px solid ${c}40`,color:c,fontWeight:700,flexShrink:0}}>{status}</span>
                              </div>
                            </div>
                            <div style={{display:"flex",gap:10,alignItems:"center"}}>
                              <div style={{flex:1,background:"var(--bg3)",borderRadius:4,height:8,overflow:"hidden"}}>
                                <div style={{height:"100%",width:`${Math.min(100,100-eng.availPct)}%`,background:`linear-gradient(90deg,var(--info),${c})`,borderRadius:4}}/>
                              </div>
                              <div style={{fontSize:13,fontFamily:"'IBM Plex Mono',monospace",color:"var(--text2)",whiteSpace:"nowrap",minWidth:100,textAlign:"right"}}>
                                {eng.logged}h آ· <span style={{color:c,fontWeight:700}}>{eng.remaining}h free</span>
                              </div>
                            </div>
                          </div>);
                        })}
                      </div>
                    </div>

                  </div>);
                })()}

                </>;})()}
            </div>
          )}

          {/* â•گâ•گâ•گâ•گ TIMESHEET â•گâ•گâ•گâ•گ */}
          {view==="timesheet"&&(
            <div>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:20,flexWrap:"wrap",gap:14}}>
                <div>
                  <div style={{fontSize:11,fontWeight:700,color:"var(--text4)",textTransform:"uppercase",letterSpacing:".1em",marginBottom:4}}>{isAcct?"REVIEW":"POST HOURS"}</div>
                  <h1 style={{fontSize:26,fontWeight:800,color:"var(--text0)",lineHeight:1}}>{isAcct?"Hours Review":"Post Hours"}</h1>
                  <p style={{color:"var(--text3)",fontSize:14,marginTop:4,fontFamily:"'IBM Plex Mono',monospace"}}>
                    Allowed: {minPostDate()} â†’ {maxPostDate()}
                    
                  </p>
                </div>
                <div style={{display:"flex",gap:12,alignItems:"flex-end"}}>
                  {canBrowseAll&&(
                    <div><Lbl>Browse Engineer</Lbl>
                      <select style={{width:190}} value={viewEngId||""} onChange={e=>setBrowseEngId(+e.target.value)}>
                        {engineers
                          .filter(e=>isEngActive(e)&&isBillableRole(e.role_type))
                          .filter(e=>!mySubEngIds||mySubEngIds.has(String(e.id)))
                          .map(eng=><option key={eng.id} value={eng.id}>{eng.name}</option>)}
                      </select>
                    </div>
                  )}
                  <div><Lbl>Week</Lbl>
                    <div style={{display:"flex",alignItems:"center",gap:6}}>
                      <button className="bg" style={{padding:"7px 10px"}} onClick={()=>{const d=new Date(weekOf);d.setDate(d.getDate()-7);setWeekOf(fmt(d));}}>â†گ</button>
                      <input type="date" style={{width:140}} value={weekOf} onChange={e=>setWeekOf(e.target.value)}
                        min={minPostDate()} max={maxPostDate()}/>
                      <button className="bg" style={{padding:"7px 10px"}} onClick={()=>{const d=new Date(weekOf);d.setDate(d.getDate()+7);setWeekOf(fmt(d));}}>â†’</button>
                      <button className="bg" style={{fontSize:13}} onClick={()=>setWeekOf(fmt(today))}>Today</button>
                      {canPostHours&&(()=>{
                        // Count entries in previous week
                        const prevWeekDays=getWeekDays7((()=>{const d=new Date(weekOf);d.setDate(d.getDate()-7);return fmt(d);})());
                        const prevEntries=entries.filter(e=>prevWeekDays.includes(e.date)&&e.engineer_id===(canEditAny?viewEngId:myProfile?.id)&&e.entry_type!=="leave");
                        if(!prevEntries.length) return null;
                        return(
                          <button className="bg" style={{fontSize:13,gap:5,display:"flex",alignItems:"center",borderColor:"#a78bfa50",color:"#a78bfa",whiteSpace:"nowrap"}}
                            title={`Copy all ${prevEntries.length} work entries from last week to this week`}
                            onClick={async()=>{
                              const engId=canEditAny?viewEngId:myProfile?.id;
                              const allInserted=[];
                              let skipped=0;
                              for(const d of weekDays){
                                const dayOfWeek=new Date(d).getDay();
                                const prevDay=prevWeekDays.find(pd=>new Date(pd).getDay()===dayOfWeek);
                                if(!prevDay) continue;
                                const dayPrevEntries=prevEntries.filter(e=>e.date===prevDay);
                                if(!dayPrevEntries.length) continue;
                                if(!isDateAllowed(d)){skipped++;continue;}
                                const existing=entries.filter(e=>e.date===d&&e.engineer_id===engId);
                                if(existing.length){skipped++;continue;} // skip days already filled
                                const inserts=dayPrevEntries.map(e=>({
                                  engineer_id:engId,project_id:e.project_id,
                                  date:d,task_category:e.task_category,task_type:e.task_type,
                                  hours:e.hours,activity:e.activity,entry_type:e.entry_type,
                                  leave_type:e.leave_type||null,billable:e.billable||false,
                                  activity_id:e.activity_id||null,
                                }));
                                let {data,error}=await supabase.from("time_entries").insert(inserts).select();
                                if(error&&error.message?.includes("function_category")){
                                  const res=await supabase.from("time_entries").insert(inserts).select();
                                  data=res.data; error=res.error;
                                }
                                if(!error&&data) allInserted.push(...data);
                              }
                              if(allInserted.length>0){
                                const copiedIds=allInserted.map(e=>e.id);
                                const skipMsg=skipped>0?` (${skipped} days skipped â€” already filled or locked)`:"";
                                // Add to UI first, then offer undo via toast
                                setEntries(prev=>[...allInserted,...prev]);
                                showToast(
                                  `Copied ${allInserted.length} entries from last week${skipMsg}`,
                                  true,
                                  async()=>{
                                    setEntries(prev=>prev.filter(e=>!copiedIds.includes(e.id)));
                                    await supabase.from("time_entries").delete().in("id",copiedIds);
                                    showToast("Copy undone âœ“");
                                  }
                                );
                              } else {
                                showToast("No entries copied â€” all days already filled or locked",false);
                              }
                            }}>
                            âژک Copy Last Week <span style={{fontSize:11,opacity:.7}}>({prevEntries.length})</span>
                          </button>
                        );
                      })()}
                    </div>
                  </div>
                </div>
              </div>

              {viewEng&&<div style={{display:"flex",alignItems:"center",gap:14,marginBottom:14,background:"var(--bg1)",border:"1px solid var(--border3)",borderRadius:10,padding:"12px 16px"}}>
                <div className="av" style={{width:42,height:42,fontSize:15}}>{viewEng.name?.slice(0,2).toUpperCase()}</div>
                <div>
                  <div style={{fontSize:16,fontWeight:600}}>{viewEng.name}</div>
                  <div style={{fontSize:13,color:"var(--text4)"}}>{viewEng.role} آ· {viewEng.level}</div>
                </div>
                <div style={{marginLeft:"auto",display:"flex",gap:20,flexWrap:"wrap",alignItems:"center"}}>
                  {[
                    {l:"Week Hrs",v:weekDays.reduce((s,d)=>s+entries.filter(e=>e.date===d&&e.engineer_id===viewEngId).reduce((ss,e)=>ss+e.hours,0),0)+"h",c:"var(--info)"},
                    {l:"Month Hrs",v:monthEntries.filter(e=>e.engineer_id===viewEngId&&e.entry_type==="work").reduce((s,e)=>s+e.hours,0)+"h",c:"#34d399"},
                    {l:"Utilization",v:(()=>{const vEng=engStats.find(e=>e.id===viewEngId);const vTarget=vEng?.targetHrs||targetHrs;const vWork=monthEntries.filter(e=>e.engineer_id===viewEngId&&e.entry_type==="work").reduce((s,e)=>s+e.hours,0);return fmtPct(vTarget>0?Math.min(100,Math.round(vWork/vTarget*100)):0);})(),c:"#a78bfa"},
                  ].map((s,i)=><div key={i} style={{textAlign:"center"}}>
                    <div style={{fontFamily:"'IBM Plex Mono',monospace",fontSize:17,fontWeight:700,color:s.c}}>{s.v}</div>
                    <div style={{fontSize:13,color:"var(--text4)"}}>{s.l}</div>
                  </div>)}
                  {/* â”€â”€ Vacation balance â€” visible to every role for the viewed engineer â”€â”€ */}
                  {(()=>{
                    const entitlement=(vacationBalances[year]||{})[viewEngId]??21;
                    const used=entries.filter(e=>
                      String(e.engineer_id)===String(viewEngId) &&
                      e.entry_type==="leave" &&
                      (e.leave_type==="Annual Leave"||!e.leave_type) &&
                      e.activity!=="PENDING_APPROVAL" &&
                      new Date(e.date+"T12:00:00").getFullYear()===year
                    ).length;
                    const pending=entries.filter(e=>
                      String(e.engineer_id)===String(viewEngId) &&
                      e.entry_type==="leave" &&
                      (e.leave_type==="Annual Leave"||!e.leave_type) &&
                      e.activity==="PENDING_APPROVAL" &&
                      new Date(e.date+"T12:00:00").getFullYear()===year
                    ).length;
                    const remaining=Math.max(0,entitlement-used);
                    const c=remaining>5?"#34d399":remaining>0?"#fb923c":"#f87171";
                    return(
                      <div style={{textAlign:"center",borderLeft:"1px solid var(--border)",paddingLeft:20}}>
                        <div style={{fontFamily:"'IBM Plex Mono',monospace",fontSize:17,fontWeight:700,color:c}}>{remaining}d</div>
                        <div style={{fontSize:13,color:"var(--text4)"}}>Annual Leave Left</div>
                        <div style={{fontSize:11,color:"var(--text4)",marginTop:1}}>{used} used آ· {entitlement} total{pending>0?` آ· ${pending} pending`:""}</div>
                      </div>
                    );
                  })()}
                </div>
              </div>}

              {/* â”€â”€ Weekend Picker â€” visible to all roles, edits viewed engineer's weekend â”€â”€ */}
              {viewEng&&(()=>{
                const pickerEngId = viewEngId||myProfile?.id;
                const pickerEng = engineers.find(e=>e.id===pickerEngId)||viewEng;
                const pickerWd = (()=>{try{return pickerEng.weekend_days?JSON.parse(pickerEng.weekend_days):DEFAULT_WEEKEND;}catch{return DEFAULT_WEEKEND;}})();
                const isOwnProfile = pickerEngId===myProfile?.id;
                const label = isOwnProfile?"My Weekend":pickerEng.name+"'s Weekend";
                const wdStr = pickerWd.length===0?"All days":["Sun","Mon","Tue","Wed","Thu","Fri","Sat"].filter((_,i)=>pickerWd.includes(i)).join(" + ");
                return(
                  <div style={{marginBottom:10}}>
                    <div style={{display:"flex",alignItems:"center",gap:10,background:"var(--bg1)",border:"1px solid var(--border3)",borderRadius:8,padding:"8px 14px",cursor:"pointer"}}
                      onClick={()=>setShowWeekendPicker(p=>!p)}>
                      <span style={{fontSize:14,fontWeight:600,color:"var(--text1)"}}>ًں—“ {label}</span>
                      <span style={{fontFamily:"'IBM Plex Mono',monospace",fontSize:13,color:"#fb923c",background:"#fb923c15",padding:"2px 8px",borderRadius:4}}>{wdStr}</span>
                      <span style={{fontFamily:"'IBM Plex Mono',monospace",fontSize:13,color:"var(--text4)",marginLeft:"auto"}}>
                        {getWorkDaysInMonth(year,month,pickerWd).length} working days آ· {getTargetHrs(year,month,pickerWd)}h target
                      </span>
                      <span style={{color:"var(--text3)",fontSize:13}}>{showWeekendPicker?"â–²":"â–¼"}</span>
                    </div>
                    {showWeekendPicker&&(
                      <div style={{background:"var(--bg1)",border:"1px solid var(--border3)",borderRadius:8,padding:"14px 16px",marginTop:4}}>
                        {!isOwnProfile&&<div style={{fontSize:13,color:"#fb923c",marginBottom:10}}>âڑ  Editing weekend for <strong>{pickerEng.name}</strong> â€” this affects their utilization target</div>}
                        <div style={{display:"grid",gridTemplateColumns:"repeat(7,1fr)",gap:6,marginBottom:12}}>
                          {["Sun","Mon","Tue","Wed","Thu","Fri","Sat"].map((name,i)=>{
                            const isOff=pickerWd.includes(i);
                            return(
                              <button key={i} onClick={()=>{const next=isOff?pickerWd.filter(d=>d!==i):[...pickerWd,i].sort((a,b)=>a-b);saveWeekendFor(pickerEngId,next);}}
                                style={{padding:"9px 4px",borderRadius:7,border:`2px solid ${isOff?"#f47218":"var(--border)"}`,
                                  background:isOff?"#1a0a0040":"var(--bg2)",color:isOff?"#f47218":"var(--text3)",
                                  cursor:"pointer",fontSize:13,fontWeight:700,fontFamily:"'IBM Plex Sans',sans-serif"}}>
                                {name}{isOff&&<div style={{fontSize:11,marginTop:2,color:"#f47218"}}>OFF</div>}
                              </button>
                            );
                          })}
                        </div>
                        <div style={{display:"flex",gap:6,flexWrap:"wrap"}}>
                          {[
                            {label:"ًں‡ھًں‡¬ Egypt",days:[5,6],desc:"Fri+Sat"},
                            {label:"ًں‡·ًں‡´ Europe",days:[0,6],desc:"Sat+Sun"},
                            {label:"ًںŒچ No Weekend",days:[],desc:"All 7 days"},
                          ].map(p=>(
                            <button key={p.label} onClick={()=>saveWeekendFor(pickerEngId,p.days)}
                              style={{background:"var(--bg2)",border:"1px solid var(--border3)",borderRadius:6,
                                padding:"6px 12px",cursor:"pointer",fontFamily:"'IBM Plex Sans',sans-serif",
                                color:"var(--text1)",fontSize:13,display:"flex",gap:6,alignItems:"center"}}>
                              <span style={{fontWeight:600}}>{p.label}</span>
                              <span style={{color:"var(--text4)",fontSize:12,fontFamily:"'IBM Plex Mono',monospace"}}>{p.desc}</span>
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })()}

              {/* â”€â”€ Month Freeze Calendar â”€â”€ */}
              {(()=>{
                const _MONTHS=["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
                const _curYear=new Date(weekOf+"T12:00:00").getFullYear()||year;
                // Check if current week's month is frozen â€” show banner
                const _weekMonth=new Date(weekOf+"T12:00:00").getMonth();
                const _weekYear=new Date(weekOf+"T12:00:00").getFullYear();
                const _weekFrozen=frozenMonths.some(fm=>Number(fm.year)===_weekYear&&Number(fm.month)===_weekMonth);
                return(
                  <div style={{marginBottom:10}}>
                    {/* Frozen banner for current week */}
                    {_weekFrozen&&(
                      <div style={{display:"flex",alignItems:"center",gap:10,background:"#1e3a5f",border:"1px solid #3b82f640",borderRadius:8,padding:"8px 14px",marginBottom:8}}>
                        <span style={{fontSize:16}}>â‌„</span>
                        <span style={{fontSize:13,color:"#93c5fd",fontWeight:700}}>
                          {_MONTHS[_weekMonth]} {_weekYear} is frozen â€” time entries cannot be added, edited or deleted.
                        </span>
                        {isAdmin&&<button onClick={()=>toggleFreezeMonth(_weekYear,_weekMonth)}
                          style={{marginLeft:"auto",padding:"3px 12px",borderRadius:5,border:"1px solid #93c5fd60",background:"transparent",color:"#93c5fd",fontSize:12,fontWeight:700,cursor:"pointer",fontFamily:"'IBM Plex Sans',sans-serif",flexShrink:0}}>
                          ًں”“ Unfreeze
                        </button>}
                      </div>
                    )}
                    {/* Month grid â€” admin can click, others see status */}
                    <div style={{background:"var(--bg1)",border:"1px solid var(--border3)",borderRadius:8,padding:"10px 14px"}}>
                      <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:8}}>
                        <span style={{fontSize:12,fontWeight:700,color:"var(--text4)",textTransform:"uppercase",letterSpacing:".06em"}}>
                          â‌„ {isAdmin?"Freeze Control":"Month Status"} â€” {year}
                        </span>
                        {!isAdmin&&<span style={{fontSize:11,color:"var(--text4)"}}>ًں”’ locked months cannot be edited</span>}
                      </div>
                      <div style={{display:"grid",gridTemplateColumns:"repeat(12,1fr)",gap:4}}>
                        {_MONTHS.map((mn,mi)=>{
                          const _frozen=frozenMonths.some(fm=>Number(fm.year)===year&&Number(fm.month)===mi);
                          const _isCurrent=mi===month;
                          return(
                            <button key={mi}
                              onClick={isAdmin?()=>toggleFreezeMonth(year,mi):undefined}
                              title={_frozen?`${mn} ${year} â€” Frozen${isAdmin?" آ· Click to unfreeze":""}`:isAdmin?`Click to freeze ${mn} ${year}`:mn+" "+year}
                              style={{
                                padding:"5px 2px",borderRadius:6,border:`1px solid ${_frozen?"#3b82f660":_isCurrent?"var(--info)40":"var(--border3)"}`,
                                background:_frozen?"#1e3a5f":_isCurrent?"var(--info)10":"transparent",
                                color:_frozen?"#93c5fd":_isCurrent?"var(--info)":"var(--text3)",
                                fontSize:11,fontWeight:_frozen||_isCurrent?700:400,
                                cursor:isAdmin?"pointer":"default",
                                fontFamily:"'IBM Plex Sans',sans-serif",
                                display:"flex",flexDirection:"column",alignItems:"center",gap:1,
                                transition:"all .15s",
                              }}>
                              <span>{mn}</span>
                              <span style={{fontSize:10}}>{_frozen?"ًں”’":""}</span>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                );
              })()}

              {/* Clipboard banner */}
              {clipboard&&(
                <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",
                  background:"#a78bfa18",border:"1px solid #a78bfa60",borderRadius:8,
                  padding:"8px 14px",marginBottom:10,fontSize:13}}>
                  <span style={{color:"#a78bfa",fontWeight:700}}>
                    âژک Clipboard: {clipboard.entries.length} entr{clipboard.entries.length===1?"y":"ies"} from {clipboard.date}
                    <span style={{color:"var(--text2)",fontWeight:400,marginLeft:6}}>
                      â€” click âژ™ Paste on any allowed day to copy
                    </span>
                  </span>
                  <button onClick={()=>setClipboard(null)}
                    style={{background:"none",border:"none",color:"var(--text3)",cursor:"pointer",fontSize:15}}>âœ•</button>
                </div>
              )}

              {/* Pending vacation banner â€” shown to engineer/lead/accountant */}
              {(()=>{
                const myPending=entries.filter(e=>String(e.engineer_id)===String(viewEngId)&&e.entry_type==="leave"&&e.activity==="PENDING_APPROVAL");
                if(myPending.length===0) return null;
                return(
                  <div style={{display:"flex",alignItems:"center",gap:12,background:"#78350f18",border:"1px solid #f59e0b50",borderRadius:10,padding:"12px 16px",marginBottom:10}}>
                    <span style={{fontSize:20}}>âڈ³</span>
                    <div style={{flex:1}}>
                      <div style={{fontSize:14,fontWeight:700,color:"#f59e0b"}}>{myPending.length} Annual Leave request{myPending.length!==1?"s":""} pending admin approval</div>
                      <div style={{fontSize:13,color:"var(--text3)",marginTop:2}}>
                        {myPending.map(e=>e.date).join(", ")} آ· The admin will approve or reject shortly
                      </div>
                    </div>
                    <span style={{fontSize:12,padding:"3px 10px",borderRadius:8,background:"#f59e0b20",border:"1px solid #f59e0b40",color:"#f59e0b",fontWeight:700,fontFamily:"'IBM Plex Mono',monospace"}}>
                      PENDING
                    </span>
                  </div>
                );
              })()}

              {/* Vacation outcomes â€” shown in bell notification (top right) */}

              {/* 7-day week grid */}
              <div className="week-grid-7" style={{display:"grid",gridTemplateColumns:"repeat(7,1fr)",gap:7}}>
                {weekDays.map(day=>{
                  const dow=new Date(day).getDay();
                  // Use viewed engineer's weekend days for calendar highlighting
                  const viewEngWd=(()=>{const ve=engineers.find(e=>e.id===viewEngId);try{return ve?.weekend_days?JSON.parse(ve.weekend_days):myWeekend;}catch{return myWeekend;}})();
                  const isWE=viewEngWd.includes(dow);
                  const allowed=isDateAllowed(day);
                  const de=entries.filter(e=>e.date===day&&e.engineer_id===viewEngId);
                  const dh=de.reduce((s,e)=>s+e.hours,0);
                  const dwh=de.filter(e=>e.entry_type==="work").reduce((s,e)=>s+e.hours,0);
                  const targetDay=8; // standard working day
                  const dhPct=Math.min(100,Math.round(dh/targetDay*100));
                  const barColor=dh===0?"var(--border)":dh>=targetDay?"#34d399":dh>=4?"#fb923c":"var(--info)";
                  const isToday=day===fmt(today);
                  const isFuture=day>fmt(today);
                  return(
                    <div key={day} className="wc" style={
                      isToday?{borderColor:"#0ea5e9"}:
                      isWE?{borderColor:"#f4721830",background:"var(--bg0)",opacity:0.8}:
                      !allowed?{opacity:0.4,borderColor:"var(--bg3)"}:
                      isFuture?{borderColor:"#a78bfa40",background:"var(--bg2)"}:{}
                    }>
                      <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:6}}>
                        <div>
                          <div style={{fontSize:13,fontWeight:700,color:isToday?"var(--info)":isWE?"#f47218":isFuture?"#a78bfa":"var(--text2)"}}>
                            {DAY_NAMES[dow]}{isWE&&<span style={{fontSize:12,marginLeft:2,color:"#f47218"}}> WE</span>}
                          </div>
                          <div style={{fontSize:12,color:"var(--text4)"}}>{new Date(day).toLocaleDateString("en-US",{month:"short",day:"numeric"})}</div>
                          {dh>0&&<div style={{fontFamily:"'IBM Plex Mono',monospace",fontSize:12,color:barColor,fontWeight:700,marginTop:1}}>{dh}h</div>}
                        </div>
                        <div style={{display:"flex",flexDirection:"column",gap:2,alignItems:"flex-end"}}>
                          {allowed&&canPostHours&&!isMonthFrozen(day)&&<button className="bp" style={{padding:"2px 5px",fontSize:13,
                            background:isWE?"linear-gradient(135deg,#b45309,#92400e)":isFuture?"linear-gradient(135deg,#7c3aed,#6d28d9)":undefined
                          }} onClick={()=>setModalDate(day)}>+</button>}
          {isMonthFrozen(day)&&<span title="Month frozen" style={{fontSize:11,color:"#93c5fd",opacity:.7,lineHeight:1}}>â‌„</span>}
                          {de.length>0&&allowed&&canPostHours&&(
                            <button title="Copy this day" onClick={()=>copyDay(day)}
                              style={{padding:"2px 5px",fontSize:12,borderRadius:4,border:"1px solid var(--border3)",
                                background:clipboard?.date===day?"#38bdf818":"var(--bg2)",
                                color:clipboard?.date===day?"var(--info)":"var(--text3)",cursor:"pointer",lineHeight:1}}>
                              {clipboard?.date===day?"âœ“ Copied":"âژک Copy"}
                            </button>
                          )}
                          {clipboard&&allowed&&canPostHours&&clipboard.date!==day&&(
                            <button title={`Paste ${clipboard.entries.length} entr${clipboard.entries.length===1?"y":"ies"} from ${clipboard.date}`}
                              onClick={()=>pasteDay(day)}
                              style={{padding:"2px 5px",fontSize:12,borderRadius:4,border:"1px solid #a78bfa60",
                                background:"#a78bfa18",color:"#a78bfa",cursor:"pointer",lineHeight:1}}>
                              âژ™ Paste
                            </button>
                          )}
                          {!allowed&&<span style={{fontSize:11,color:"var(--text4)",fontFamily:"'IBM Plex Mono',monospace"}}>LOCKED</span>}
                        </div>
                      </div>
                      {/* Daily hours progress bar */}
                      {allowed&&!isWE&&(
                        <div style={{height:3,borderRadius:2,background:"var(--bg3)",marginBottom:6,overflow:"hidden"}}>
                          <div style={{height:"100%",width:`${dhPct}%`,background:barColor,borderRadius:2,transition:"width .3s"}}/>
                        </div>
                      )}
                      {de.map(e=>{
                        const proj=projects.find(p=>p.id===e.project_id);
                        const isPending=e.activity==="PENDING_APPROVAL";
                        return(
                          <div key={e.id} style={{background:isPending?"#78350f18":"var(--bg0)",border:`1px solid ${isPending?"#f59e0b50":"var(--border2)"}`,borderRadius:4,padding:"5px 6px",marginBottom:3,fontSize:12}}>
                            <div style={{display:"flex",justifyContent:"space-between",gap:2}}>
                              <div style={{flex:1,minWidth:0}}>
                                {e.entry_type==="leave"
                                  ?<>
                                    <span style={{color:"#fb923c",fontWeight:600}}>âœˆ {e.leave_type||"Annual Leave"}</span>
                                    {isPending&&<div style={{marginTop:2,display:"inline-flex",alignItems:"center",gap:3,background:"#f59e0b20",border:"1px solid #f59e0b50",borderRadius:3,padding:"1px 5px",marginLeft:4}}>
                                      <span style={{fontSize:10,color:"#f59e0b",fontWeight:700}}>âڈ³ PENDING APPROVAL</span>
                                    </div>}
                                  </>
                                  :<><span style={{color:"#0ea5e9",fontSize:11,fontWeight:600}}>{proj?.name||proj?.id||e.project_id}</span>
                                    <div style={{color:"var(--text2)",fontSize:11,marginTop:1}}>{e.task_type}</div>
                                    {e.activity&&!isPending&&<div style={{color:"var(--text3)",fontSize:11,marginTop:1,fontStyle:"italic",lineHeight:1.3}}>{e.activity.substring(0,35)}{e.activity.length>35?"â€¦":""}</div>}
                                  </>}
                              </div>
                              {canEdit&&canPostHours&&!(()=>{
                                // Hide edit/delete for approved annual leave (non-admin)
                                const isApprovedLeave=e.entry_type==="leave"&&e.leave_type==="Annual Leave"&&e.activity!=="PENDING_APPROVAL";
                                return isApprovedLeave&&!isAdmin;
                              })()&&<div style={{display:"flex",flexDirection:"column",gap:2}}>
                                <button className="be" style={{padding:"1px 4px",fontSize:12}} onClick={()=>setEditEntry({...e,projectId:e.project_id,type:e.entry_type,taskCategory:e.task_category||"Engineering",taskType:e.task_type||"Basic Engineering",leaveType:e.leave_type||"Annual Leave"})}>âœژ</button>
                                <button className="bd" style={{padding:"1px 4px",fontSize:12,display:isMonthFrozen(e.date)?"none":"inline-flex"}} onClick={()=>deleteEntry(e.id,e.engineer_id)}>âœ•</button>
                              </div>}
                            </div>
                            <div style={{display:"flex",justifyContent:"space-between",marginTop:3}}>
                              <span style={{fontFamily:"'IBM Plex Mono',monospace",color:"var(--info)",fontWeight:700,fontSize:13}}>{e.hours}h</span>
                              {e.billable&&<span style={{fontSize:12,color:"#34d399",fontWeight:700}}>BILL</span>}
                            </div>
                          </div>
                        );
                      })}
                      {de.length===0&&<div style={{color:"var(--border)",fontSize:12,textAlign:"center",marginTop:16}}>{allowed?"No entries":"â€”"}</div>}
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
                  <div style={{fontSize:15,fontWeight:700,color:"var(--text0)"}}>Full Month â€” {MONTHS[month]} {year}</div>
                  <div style={{display:"flex",gap:8,alignItems:"center"}}>
                    {selectedEntries.size>0&&<button style={{background:"#ef4444",border:"none",borderRadius:6,padding:"5px 12px",color:"#fff",fontSize:13,fontWeight:600,cursor:"pointer",fontFamily:"'IBM Plex Sans',sans-serif"}} onClick={bulkDeleteEntries}>ًں—‘ Delete {selectedEntries.size} selected</button>}
                    <select style={{fontSize:13,padding:"5px 10px",width:"auto"}} value={filterProject} onChange={e=>setFilterProject(e.target.value)}>
                      <option value="ALL">All Projects</option>
                      {projects.map(p=><option key={p.id} value={p.id}>{p.name} ({p.id})</option>)}
                    </select>
                    {filterProject!=="ALL"&&<button className="bg" style={{fontSize:13}} onClick={()=>setFilterProject("ALL")}>âœ•</button>}
                    <span style={{fontSize:13,color:"var(--text3)",fontFamily:"'IBM Plex Mono',monospace"}}>{visEntries.reduce((s,e)=>s+e.hours,0)}h</span>
                  </div>
                </div>
                <div className="card" style={{padding:0,overflow:"hidden"}}>
                  <table>
                    <thead><tr>
                      <th style={{width:28}}><input type="checkbox" checked={allChecked} onChange={toggleAll} style={{cursor:"pointer"}}/></th>
                      <th>Date</th><th>Project</th><th>Task</th><th>Activity</th><th>Hrs</th><th>Type</th><th style={{width:80}}>Actions</th>
                    </tr></thead>
                    <tbody>
                      {visEntries.length===0&&<tr><td colSpan={8} style={{textAlign:"center",color:"var(--text4)",padding:20}}>No entries for {MONTHS[month]} {year}</td></tr>}
                      {visEntries.map(e=>{
                        const proj=projects.find(p=>p.id===e.project_id);
                        const checked=selectedEntries.has(e.id);
                        const isPending=e.activity==="PENDING_APPROVAL";
                        return(
                          <tr key={e.id} style={{background:checked?"#0ea5e910":isPending?"#78350f10":"transparent"}}>
                            <td><input type="checkbox" checked={checked} onChange={()=>setSelectedEntries(prev=>{const n=new Set(prev);checked?n.delete(e.id):n.add(e.id);return n;})} style={{cursor:"pointer",accentColor:"var(--info)"}}/></td>
                            <td style={{fontFamily:"'IBM Plex Mono',monospace"}}>{e.date}</td>
                            <td>{proj
                              ?<><span style={{fontWeight:600,color:"var(--text0)"}}>{proj.name||proj.id}</span><span style={{fontFamily:"'IBM Plex Mono',monospace",fontSize:12,color:"var(--info)",marginLeft:4}}>({proj.id})</span></>
                              :<span style={{color:"#fb923c",fontWeight:600}}>âœˆ {e.leave_type||"Leave"}</span>}
                            </td>
                            <td style={{color:"var(--text2)"}}>{e.task_type||"â€”"}</td>
                            <td style={{color:"var(--text3)",fontStyle:"italic",maxWidth:160,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>
                              {isPending
                                ?<span style={{color:"#f59e0b",fontWeight:700,fontStyle:"normal"}}>âڈ³ Pending Approval</span>
                                :(e.activity||"â€”")}
                            </td>
                            <td style={{fontFamily:"'IBM Plex Mono',monospace",color:"var(--info)",fontWeight:700}}>{e.hours}h</td>
                            <td>
                              {isPending
                                ?<span style={{fontSize:12,padding:"2px 8px",borderRadius:4,background:"#f59e0b20",border:"1px solid #f59e0b40",color:"#f59e0b",fontWeight:700}}>PENDING</span>
                                :<span style={{fontSize:12,padding:"2px 7px",borderRadius:4,background:e.entry_type==="leave"?"#7c2d1230":"#022c2230",color:e.entry_type==="leave"?"#fb923c":"#34d399",fontWeight:700}}>{e.entry_type}</span>}
                            </td>
                            <td><div style={{display:"flex",gap:5}}>
                              {(()=>{
                                const isApprovedLeave=e.entry_type==="leave"&&e.leave_type==="Annual Leave"&&e.activity!=="PENDING_APPROVAL";
                                const locked=isApprovedLeave&&!isAdmin;
                                return locked
                                  ? <span style={{fontSize:11,color:"var(--text4)",fontStyle:"italic"}}>Approved â€” admin only</span>
                                  : <>{canPostHours&&<button className="be" onClick={()=>setEditEntry({...e,projectId:e.project_id,type:e.entry_type,taskCategory:e.task_category||"Engineering",taskType:e.task_type||"Basic Engineering",leaveType:e.leave_type||"Annual Leave"})}>âœژ</button>}
                                     {canPostHours&&<button className="bd" onClick={()=>deleteEntry(e.id,e.engineer_id)}>âœ•</button>}
                                     {!canPostHours&&<span style={{fontSize:12,color:"var(--text4)"}}>â€”</span>}</>;
                              })()}
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

          {/* â•گâ•گâ•گâ•گ PROJECTS â•گâ•گâ•گâ•گ */}
          {view==="projects"&&(()=>{ return(
              <>
              <ProjectsView
                projects={projects} projSearch={projSearch} setProjSearch={setProjSearch}
                projStatusFilter={projStatusFilter} setProjStatusFilter={setProjStatusFilter}
                monthEntries={monthEntries} projStats={projStats}
                isAdmin={isAdmin} isAcct={isAcct} isLead={isLead}
                setShowProjModal={setShowProjModal} setEditProjModal={setEditProjModal} deleteProject={deleteProject}
                fmtCurrency={fmtCurrency}
                activities={activities} setActivities={setActivities}
                engineers={engineers} supabase={supabase} showToast={showToast}
                setProjects={setProjects}
                showConfirm={showConfirm}
              />
            </>);
          })()}

          {/* â•گâ•گâ•گâ•گ TEAM â•گâ•گâ•گâ•گ */}
          {view==="team"&&(()=>{
            // Scope engStats to lead's org subtree; admins see all
            const scopedEngStats = mySubEngIds
              ? engStats.filter(e=>mySubEngIds.has(String(e.id)))
              : engStats;
            const filteredTeam=filterEngineer==="ALL"?scopedEngStats:scopedEngStats.filter(e=>e.id===+filterEngineer);
            const teamMonthEntries=monthEntries.filter(e=>filterProject==="ALL"||e.project_id===filterProject);
            const selectedEng=filterEngineer!=="ALL"?scopedEngStats.find(e=>e.id===+filterEngineer):null;
            return(
            <div>
              {/* Header + Filter bar */}
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:18,flexWrap:"wrap",gap:14}}>
                <div>
                  <div style={{fontSize:11,fontWeight:700,color:"var(--text4)",textTransform:"uppercase",letterSpacing:".1em",marginBottom:4}}>ENGINEERING TEAM</div>
                  <h1 style={{fontSize:26,fontWeight:800,color:"var(--text0)",lineHeight:1}}>Team</h1>
                  <p style={{color:"var(--text3)",fontSize:14,marginTop:4,fontFamily:"'IBM Plex Mono',monospace"}}>{scopedEngStats.filter(e=>isEngActive(e)).length} active آ· {scopedEngStats.length} total آ· {MONTHS[month]} {year}</p>
                </div>
                <div style={{display:"flex",gap:8,alignItems:"flex-end"}}>
                  <div><Lbl>Engineer</Lbl>
                    <select style={{width:160}} value={filterEngineer} onChange={e=>setFilterEngineer(e.target.value)}>
                      <option value="ALL">All Engineers</option>
                      {scopedEngStats.map(e=><option key={e.id} value={e.id}>{e.name}{!isEngActive(e)?" (inactive)":""}</option>)}
                    </select>
                  </div>
                  <div><Lbl>Project</Lbl>
                    <select style={{width:160}} value={filterProject} onChange={e=>setFilterProject(e.target.value)}>
                      <option value="ALL">All Projects</option>
                      {projects.map(p=><option key={p.id} value={p.id}>{p.name} ({p.id})</option>)}
                    </select>
                  </div>
                  {(filterEngineer!=="ALL"||filterProject!=="ALL")&&
                    <button className="bg" style={{fontSize:13}} onClick={()=>{setFilterEngineer("ALL");setFilterProject("ALL");}}>âœ• Clear</button>}
                </div>
              </div>

              {/* â”€â”€ TOTAL HOURS SUMMARY BOX (shows when any filter active) â”€â”€ */}
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
                // Target hours based on filtered engineers â€” respects join/termination dates
                const filtEngs=filterEngineer==="ALL"?scopedEngStats:scopedEngStats.filter(e=>e.id===+filterEngineer);
                const targetW=filtEngs.reduce((s,eng)=>s+(eng.targetHrs||0),0);
                const util=targetW?Math.round(totalW/targetW*100):0;
                const selProjName=filterProject!=="ALL"?projects.find(p=>p.id===filterProject)?.name:"";
                const selEngName=filterEngineer!=="ALL"?engineers.find(e=>e.id===+filterEngineer)?.name:"";
                const label=[selEngName,selProjName].filter(Boolean).join(" آ· ")||"All";
                return(
                  <div style={{background:"var(--bg2)",border:"1px solid var(--border3)",borderRadius:8,padding:"12px 16px",marginBottom:16,display:"flex",gap:0,alignItems:"center"}}>
                    <div style={{marginRight:20,minWidth:120}}>
                      <div style={{fontSize:13,color:"var(--text4)",fontWeight:700,textTransform:"uppercase",letterSpacing:".06em",marginBottom:2}}>Filter Summary</div>
                      <div style={{fontSize:14,color:"var(--text2)",fontWeight:600}}>{label}</div>
                      <div style={{fontSize:13,color:"var(--text4)"}}>{MONTHS[month]} {year}</div>
                    </div>
                    <div className="stats-5col" style={{flex:1,display:"grid",gridTemplateColumns:"repeat(5,1fr)",gap:8}}>
                      {[
                        {l:"Total Work",v:totalW+"h",c:"var(--text0)"},
                        {l:"Billable",v:totalB+"h",c:"#34d399",show:isAdmin||isAcct},
                        {l:"Non-Billable",v:totalNB+"h",c:"#fb923c",show:isAdmin||isAcct},
                        {l:"Leave Days",v:totalL+"d",c:"#f472b6"},
                        {l:"Utilization",v:util+"%",c:util>=80?"#34d399":util>=60?"#fb923c":"#f87171"},
                      ].filter(m=>m.show!==false).map((m,i)=>(
                        <div key={i} style={{background:"var(--bg1)",borderRadius:6,padding:"8px 10px",textAlign:"center",border:"1px solid var(--border3)"}}>
                          <div style={{fontFamily:"'IBM Plex Mono',monospace",fontSize:18,fontWeight:700,color:m.c,lineHeight:1}}>{m.v}</div>
                          <div style={{fontSize:12,color:"var(--text4)",marginTop:4,textTransform:"uppercase",letterSpacing:".05em"}}>{m.l}</div>
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
                    <div className="av" style={{width:50,height:50,fontSize:17}}>{selectedEng.name?.slice(0,2).toUpperCase()}</div>
                    <div style={{flex:1}}>
                      <div style={{fontSize:17,fontWeight:700}}>{selectedEng.name}</div>
                      <div style={{fontSize:14,color:"var(--text4)"}}>{selectedEng.role} آ· {selectedEng.level}</div>
                      <span className="role-badge" style={{background:ROLE_COLORS[selectedEng.role_type]+"20",color:ROLE_COLORS[selectedEng.role_type]||"var(--text3)",marginTop:4,display:"inline-block"}}>{ROLE_LABELS[selectedEng.role_type]}</span>
                    </div>
                    <div style={{display:"flex",gap:20,textAlign:"center"}}>
                      {[
                        {l:"Work Hrs",v:selectedEng.workHrs+"h",c:"var(--info)"},
                        {l:"Utilization",v:fmtPct(selectedEng.utilization),c:selectedEng.utilization>=80?"#34d399":selectedEng.utilization>=60?"#fb923c":"#f87171"},
                        {l:"Leave Days",v:selectedEng.leaveDays+"d",c:"#fb923c"},
                        ...(isAdmin||isAcct?[{l:"Revenue",v:fmtCurrency(selectedEng.revenue),c:"#a78bfa"}]:[]),
                      ].map((s,i)=>(
                        <div key={i} style={{background:"var(--bg2)",borderRadius:6,padding:"8px 16px"}}>
                          <div style={{fontFamily:"'IBM Plex Mono',monospace",fontSize:18,fontWeight:700,color:s.c}}>{s.v}</div>
                          <div style={{fontSize:12,color:"var(--text4)"}}>{s.l}</div>
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
                          <td style={{fontFamily:"'IBM Plex Mono',monospace",fontSize:13}}>{e.date}</td>
                          <td style={{fontSize:13,color:"var(--info)"}}>{p?.id||<span style={{color:"var(--text2)"}}>â€”</span>}</td>
                          <td style={{fontSize:13,color:"var(--text2)"}}>{e.task_type||"â€”"}</td>
                          <td style={{fontSize:13,color:"var(--text3)",fontStyle:"italic",maxWidth:200,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{e.activity||"â€”"}</td>
                          <td style={{fontFamily:"'IBM Plex Mono',monospace",fontWeight:700,color:"var(--info)"}}>{e.hours}h</td>
                        </tr>;
                      })}
                      {teamMonthEntries.filter(e=>e.engineer_id===selectedEng.id&&e.entry_type==="work").length===0&&
                        <tr><td colSpan={5} style={{textAlign:"center",color:"var(--text4)",padding:16}}>No work entries</td></tr>}
                    </tbody>
                  </table>
                </div>
              )}

              {/* View toggle */}
              <div style={{display:"flex",gap:6,marginBottom:16,alignItems:"center"}}>
                {[["org","Org Chart"],["grid","Grid"]].map(([m,l])=>(
                  <button key={m} onClick={()=>setTeamViewMode(m)}
                    style={{padding:"4px 14px",borderRadius:20,fontSize:13,fontWeight:600,cursor:"pointer",
                      letterSpacing:".05em",textTransform:"uppercase",
                      border:`1px solid ${teamViewMode===m?"#38bdf840":"var(--bg3)"}`,
                      background:teamViewMode===m?"#38bdf810":"transparent",
                      color:teamViewMode===m?"var(--info)":"var(--border)"}}>
                    {l}
                  </button>
                ))}
              </div>

              {/* â”€â”€ ORG CHART VIEW â”€â”€ */}
              {teamViewMode==="org"&&(()=>{

                const saveNode = async(node) => {
                  const{id,...fields}=node;
                  if(id&&id>0){
                    const{error}=await supabase.from("org_chart").update(fields).eq("id",id);
                    if(error){showToast("Save error: "+error.message,false);return;}
                    setOrgNodes(prev=>prev.map(n=>n.id===id?{...n,...fields}:n));
                  } else {
                    const{data,error}=await supabase.from("org_chart").insert(fields).select().single();
                    if(error){showToast("Insert error: "+error.message,false);return;}
                    setOrgNodes(prev=>[...prev,data]);
                  }
                  setOrgEditNode(null);
                  showToast("Saved âœ“");
                };

                const deleteNode = async(id) => {
                  const node=orgNodes.find(n=>n.id===id);
                  showConfirm(`Delete "${node?.name||"this node"}"? Its children will become unattached.`,()=>{
                    applyUndo(
                      showToast,`Node "${node?.name||id}" deleted`,
                      ()=>setOrgNodes(prev=>prev.filter(n=>n.id!==id)),
                      ()=>setOrgNodes(prev=>[...prev,node]),
                      async()=>{ const{error}=await supabase.from("org_chart").delete().eq("id",id); return error||null; },
                      null
                    );
                  },{title:"Delete Org Node",confirmLabel:"Delete"});
                };

                const moveNode = async(nodeId, newParentId) => {
                  const node = orgNodes.find(n=>n.id===nodeId);
                  if(!node) return;
                  const updated = {...node, parent_id: newParentId||null};
                  await supabase.from("org_chart").update({parent_id:newParentId||null}).eq("id",nodeId);
                  setOrgNodes(prev=>prev.map(n=>n.id===nodeId?updated:n));
                  showToast("Moved âœ“");
                };

                const exportOrgPDF = () => {
                  const getKids = pid => orgNodes.filter(n=>Number(n.parent_id)===Number(pid)).sort((a,b)=>(a.sort_order||0)-(b.sort_order||0));
                  const buildCard = node => {
                    const eng = node.engineer_id ? engineers.find(e=>e.id===node.engineer_id) : null;
                    const rc  = eng ? (ROLE_COLORS[eng.role_type]||"#1a5276") : "#1a5276";
                    const ini = (node.name||"?").split(" ").map(w=>w[0]).slice(0,2).join("").toUpperCase();
                    return `<div style="width:140px;background:${node.is_external?"#f0f4f8":"#eef4fb"};border:2px solid ${node.is_external?"#8aa":"#1a5276"};border-style:${node.is_external?"dashed":"solid"};border-radius:10px;padding:12px 8px 10px;text-align:center;display:inline-block;box-shadow:0 2px 6px #0002">
                      <div style="width:40px;height:40px;border-radius:50%;background:${rc}22;border:2.5px solid ${rc};color:${rc};font-size:15px;font-weight:800;display:flex;align-items:center;justify-content:center;margin:0 auto 7px">${ini}</div>
                      <div style="font-size:13px;font-weight:800;color:#0b1f38;line-height:1.3;margin-bottom:3px">${node.name}</div>
                      ${node.title?`<div style="font-size:11px;color:#2a4a6a;font-weight:600">${node.title}</div>`:""}
                      ${eng?`<div style="font-size:10px;color:#4a6a8a;text-transform:uppercase;letter-spacing:.05em;margin-top:2px">${ROLE_LABELS[eng.role_type]||""}</div>`:""}
                    </div>`;
                  };
                  const buildTable = (nodes, isRoot) => {
                    if (!nodes.length) return "";
                    const solo = nodes.length===1;
                    return `<table style="border-collapse:separate;border-spacing:0;margin:0 auto"><tbody><tr>${
                      nodes.map(n=>{
                        const kids=getKids(n.id);
                        return `<td style="padding:0 10px;vertical-align:top;text-align:center;${(!isRoot&&!solo)?"border-top:2px solid #1a5276;":""}">
                          ${(!isRoot&&!solo)?`<div style="width:2px;height:16px;background:#1a5276;margin:0 auto"></div>`:""}
                          ${buildCard(n)}
                          ${kids.length?`<div style="width:2px;height:18px;background:#1a5276;margin:0 auto"></div>${buildTable(kids,false)}`:""}
                        </td>`;
                      }).join("")
                    }</tr></tbody></table>`;
                  };
                  const rts = orgNodes.filter(n=>!n.parent_id).sort((a,b)=>(a.sort_order||0)-(b.sort_order||0));
                  const html = `<!DOCTYPE html><html><head><meta charset="utf-8">
                    <style>*{margin:0;padding:0;box-sizing:border-box}body{font-family:'Segoe UI',sans-serif;padding:24px;-webkit-print-color-adjust:exact}
                    .hdr{display:flex;align-items:center;gap:14px;margin-bottom:28px;padding-bottom:14px;border-bottom:2px solid #0e2a4a}
                    @media print{@page{margin:6mm;size:A4 landscape}body{zoom:0.65}}</style>
                  </head><body>
                  <div class="hdr"><img src="${LOGO_SRC}" style="width:44px;height:44px;border-radius:8px">
                    <div><h1 style="font-size:18px;font-weight:800;color:#0b1f38">Organization Chart</h1>
                    <p style="font-size:11px;color:#4a6a8a;text-transform:uppercase;letter-spacing:.06em;font-weight:600">ENEVO Group آ· ${new Date().toLocaleDateString("en-GB",{month:"long",year:"numeric"})}</p></div></div>
                  <div style="display:flex;justify-content:center">${buildTable(rts,true)}</div>
                  <script>window.onload=()=>setTimeout(()=>window.print(),400)</script>
                  </body></html>`;
                  const w = window.open("","org_pdf_"+Date.now());
                  if(w){w.document.write(html);w.document.close();}
                  else showToast("Allow popups to export PDF",false);
                };

                // OrgCard â€” plain render function (NOT a React component)
                const renderOrgCard = (node) => {
                  const eng = node.engineer_id ? engineers.find(e=>String(e.id)===String(node.engineer_id)) : null;
                  const active = eng ? isEngActive(eng) : true;
                  // Map role_type to a fixed hex color so we can safely use alpha
                  const ROLE_HEX = {
                    admin:"#f59e0b", lead:"#38bdf8", accountant:"#a78bfa",
                    senior_management:"#34d399", engineer:"#64748b"
                  };
                  const rc  = eng ? (ROLE_HEX[eng.role_type]||"#38bdf8") : "#38bdf8";
                  const initials = (node.name||"?").split(" ").filter(Boolean).map(w=>w[0]).slice(0,2).join("").toUpperCase();
                  const cardBg   = node.is_external
                    ? (isDark?"#0a1525":"#f0f4f8")
                    : (isDark?"#122040":"#ffffff");
                  const cardBorder = node.is_external
                    ? (isDark?"1px dashed #2a5a8a":"1px dashed #94b4d0")
                    : orgEditing
                      ? `2px dashed ${rc}`
                      : `1px solid ${rc}`;
                  return(
                    <div style={{
                      background: cardBg,
                      border: cardBorder,
                      borderRadius:14,
                      padding:"18px 14px 16px",
                      textAlign:"center",
                      width:170,
                      boxSizing:"border-box",
                      opacity: !active?0.5:1,
                      position:"relative",
                      boxShadow: isDark
                        ? "0 4px 20px #00000080, 0 1px 3px #00000060"
                        : "0 2px 12px #0000001a, 0 1px 4px #00000010",
                    }}>
                      {/* Edit/delete â€” edit mode only */}
                      {orgEditing&&isAdmin&&(
                        <div style={{position:"absolute",top:6,right:6,display:"flex",gap:3,zIndex:20}}>
                          <button onClick={e=>{e.stopPropagation();setOrgEditNode({...node});}}
                            style={{background:"#0ea5e920",border:"1px solid #0ea5e960",color:"#38bdf8",
                              width:22,height:22,borderRadius:5,fontSize:12,cursor:"pointer",padding:0,lineHeight:"20px"}}>âœژ</button>
                          <button onClick={e=>{e.stopPropagation();deleteNode(node.id);}}
                            style={{background:"#f8717120",border:"1px solid #f8717160",color:"#f87171",
                              width:22,height:22,borderRadius:5,fontSize:12,cursor:"pointer",padding:0,lineHeight:"20px"}}>âœ•</button>
                        </div>
                      )}
                      {/* Avatar circle */}
                      <div style={{
                        width:54,height:54,borderRadius:"50%",
                        background: isDark ? `${rc}22` : `${rc}18`,
                        border:`2.5px solid ${rc}`,
                        display:"flex",alignItems:"center",justifyContent:"center",
                        margin:"0 auto 10px",
                        fontSize:18,fontWeight:800,color:rc,
                        boxShadow:`0 0 0 4px ${rc}20`,
                      }}>
                        {initials}
                      </div>
                      {/* Name */}
                      <div style={{fontSize:14,fontWeight:700,
                        color: node.is_external?(isDark?"#4e7a9a":"#64748b"):(isDark?"#e2eaf4":"#0f172a"),
                        lineHeight:1.3,marginBottom:4}}>
                        {node.name}
                        {!active&&eng&&<div style={{fontSize:10,color:"#f87171",letterSpacing:".06em",fontWeight:700,marginTop:2}}>INACTIVE</div>}
                      </div>
                      {/* Title */}
                      {(node.title||eng?.role||eng)&&(
                        <div style={{fontSize:12,
                          color: node.is_external?(isDark?"#4a6a8a":"#94a3b8"):(isDark?"#7a9ab8":"#475569"),
                          lineHeight:1.4,fontStyle:node.is_external?"italic":"normal",fontWeight:500,marginBottom:4}}>
                          {node.title||(eng?.role)||(eng?ROLE_LABELS[eng.role_type]||"":"")}
                        </div>
                      )}
                      {/* Role badge */}
                      {eng&&!node.is_external&&(
                        <div style={{display:"inline-block",padding:"2px 8px",borderRadius:4,
                          fontSize:11,fontWeight:700,letterSpacing:".05em",textTransform:"uppercase",
                          background:`${rc}20`,color:rc,border:`1px solid ${rc}40`}}>
                          {ROLE_LABELS[eng.role_type]||eng.role_type}
                        </div>
                      )}
                    </div>
                  );
                };


                // â”€â”€ Layout: iterative BFS â€” no recursion, guaranteed termination â”€â”€
                const CARD_W  = 170;
                const CARD_H  = 165;  // actual card content is ~165px tall
                const H_GAP   = 40;   // horizontal gap between siblings
                const V_GAP   = 88;   // vertical gap between levels
                const LEVEL_H = CARD_H + V_GAP;
                const PAD_X   = 52;
                const PAD_Y   = 28;

                // Build children map (once, O(N))
                const kidMap = {};
                const rootNodes = [];
                orgNodes.forEach(n => {
                  const pid = n.parent_id ? Number(n.parent_id) : null;
                  if (!pid) { rootNodes.push(n); return; }
                  if (!kidMap[pid]) kidMap[pid] = [];
                  kidMap[pid].push(n);
                });
                Object.values(kidMap).forEach(arr => arr.sort((a,b)=>(a.sort_order||0)-(b.sort_order||0)));
                rootNodes.sort((a,b)=>(a.sort_order||0)-(b.sort_order||0));

                // BFS to get ordered list of reachable nodes â€” visited set prevents ANY cycle hang
                const bfsOrder = []; // [{id, depth}]
                const bfsSeen  = new Set();
                const bfsQ     = rootNodes.map(n=>({id:n.id, depth:0}));
                while (bfsQ.length) {
                  const item = bfsQ.shift();
                  if (bfsSeen.has(item.id)) continue;
                  bfsSeen.add(item.id);
                  bfsOrder.push(item);
                  (kidMap[item.id]||[]).forEach(c => { if (!bfsSeen.has(c.id)) bfsQ.push({id:c.id, depth:item.depth+1}); });
                }

                // Phase 1: subtree widths bottom-up (reverse BFS = leaves first)
                const widths = {};
                [...bfsOrder].reverse().forEach(({id}) => {
                  const kids = (kidMap[id]||[]).filter(c=>bfsSeen.has(c.id));
                  widths[id] = kids.length === 0
                    ? CARD_W + H_GAP
                    : Math.max(CARD_W + H_GAP, kids.reduce((s,c)=>s+(widths[c.id]||CARD_W+H_GAP), 0));
                });

                // Phase 2: positions top-down (BFS order = parents first)
                const positions = {};
                let rx = PAD_X;
                rootNodes.forEach(r => {
                  const rw = widths[r.id]||CARD_W+H_GAP;
                  positions[r.id] = { x: rx + rw/2 - CARD_W/2, y: PAD_Y };
                  rx += rw;
                });
                bfsOrder.forEach(({id, depth}) => {
                  if (!positions[id]) return;
                  const kids = (kidMap[id]||[]).filter(c=>bfsSeen.has(c.id));
                  if (!kids.length) return;
                  const subtreeStart = positions[id].x + CARD_W/2 - (widths[id]||CARD_W+H_GAP)/2;
                  let cx = subtreeStart;
                  kids.forEach(c => {
                    const cw = widths[c.id]||CARD_W+H_GAP;
                    positions[c.id] = { x: cx + cw/2 - CARD_W/2, y: PAD_Y + (depth+1)*LEVEL_H };
                    cx += cw;
                  });
                });

                // Canvas size
                const allPos   = Object.values(positions);
                const canvasW  = PAD_X * 2 + rootNodes.reduce((s,r)=>s+(widths[r.id]||CARD_W+H_GAP), 0);
                const canvasH  = (allPos.length ? Math.max(...allPos.map(p=>p.y)) : 0) + CARD_H + PAD_Y * 2;

                // SVG connector paths
                const connectors = [];
                orgNodes.forEach(node => {
                  if (!node.parent_id) return;
                  const pid = Number(node.parent_id);
                  if (!positions[node.id] || !positions[pid]) return;
                  const px = positions[pid].x    + CARD_W/2;
                  const py = positions[pid].y    + CARD_H;
                  const cx = positions[node.id].x + CARD_W/2;
                  const cy = positions[node.id].y;
                  const midY = py + V_GAP/2;
                  connectors.push({px,py,cx,cy,midY,key:node.id});
                });

                return(
                  <div style={{background:"var(--bg0)",borderRadius:12,padding:"0 0 32px",margin:"-4px 0",border:"1px solid var(--border)"}}>
                    {/* Chart header */}
                    <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:24,padding:"20px 28px 0"}}>
                      <div style={{display:"flex",alignItems:"center",gap:14}}>
                        <img src={LOGO_SRC} alt="ENEVO" style={{width:42,height:42,borderRadius:9,objectFit:"contain",opacity:0.85}}/>
                        <div>
                          <div style={{fontSize:11,fontWeight:700,color:"var(--text4)",textTransform:"uppercase",letterSpacing:".1em",marginBottom:3}}>ENEVO GROUP</div>
                          <div style={{fontSize:20,fontWeight:800,color:"var(--text0)",lineHeight:1}}>Organization Chart</div>
                          <div style={{fontSize:13,color:"var(--text3)",marginTop:3,fontFamily:"'IBM Plex Mono',monospace"}}>
                            {orgEditing
                              ?<span style={{color:"#fb923c",fontWeight:700}}>âڑ  Edit Mode â€” drag cards to rearrange</span>
                              :`${orgNodes.filter(n=>!n.is_external).length} members آ· ${new Date().toLocaleDateString("en-GB",{month:"long",year:"numeric"})}`}
                          </div>
                        </div>
                      </div>
                      <div style={{display:"flex",gap:8,alignItems:"center"}}>
                        {!orgEditing&&orgNodes.length>0&&(
                          <button onClick={exportOrgPDF} className="be" style={{fontSize:14,padding:"7px 16px"}}>â¬‡ Export PDF</button>
                        )}
                        {isAdmin&&(
                          <>
                            {orgEditing&&(
                              <button className="bg" style={{fontSize:14}}
                                onClick={()=>setOrgEditNode({id:null,name:"",title:"",engineer_id:null,parent_id:null,is_external:false,sort_order:rootNodes.length})}>
                                + Root Node
                              </button>
                            )}
                            <button onClick={()=>setOrgEditing(e=>!e)}
                              style={{padding:"7px 16px",borderRadius:8,fontSize:14,fontWeight:600,cursor:"pointer",fontFamily:"'IBM Plex Sans',sans-serif",
                                background:orgEditing?"#fb923c":"linear-gradient(135deg,#0ea5e9,#0369a1)",
                                border:"none",color:"#fff",transition:"all .2s"}}>
                              {orgEditing?"âœ“ Done editing":"âœژ Edit Chart"}
                            </button>
                          </>
                        )}
                      </div>
                    </div>

                    {/* Empty state */}
                    {orgNodes.length===0&&(
                      <div style={{textAlign:"center",padding:"80px 20px"}}>
                        
                        <div style={{fontSize:15,fontWeight:700,color:"var(--text0)",marginBottom:6}}>No org chart configured</div>
                        <div style={{fontSize:13,color:"var(--text4)",marginBottom:20}}>Add your team hierarchy to visualize the organization</div>
                        {isAdmin&&<button className="bp" onClick={()=>setOrgEditing(true)}>âœژ Start building</button>}
                      </div>
                    )}

                    {/* Chart canvas */}
                    {orgNodes.length>0&&(
                      <div style={{overflowX:"auto",overflowY:"visible",paddingBottom:8}}>
                        {/* Drop zone for root */}
                        {orgEditing&&(
                          <div onDragOver={e=>e.preventDefault()}
                            onDrop={e=>{e.preventDefault();if(orgDragId) moveNode(orgDragId,null);}}
                            style={{margin:"0 28px 8px",padding:"8px",textAlign:"center",fontSize:13,
                              color:"var(--text4)",border:"1px dashed var(--border)",borderRadius:8}}>
                            â†‘ Drop here to make root-level
                          </div>
                        )}
                        <div style={{position:"relative", width:canvasW, height:canvasH, minWidth:"100%"}}>
                          {/* SVG connector layer */}
                          <svg style={{position:"absolute",inset:0,width:"100%",height:"100%",pointerEvents:"none",overflow:"visible"}} aria-hidden="true">
                            {connectors.map(({px,py,cx,cy,midY,key})=>(
                              <path key={key}
                                d={`M ${px} ${py} L ${px} ${midY} L ${cx} ${midY} L ${cx} ${cy}`}
                                fill="none"
                                stroke={isDark?"#2a5a8a":"#94b4d0"}
                                strokeWidth="2"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                              />
                            ))}
                          </svg>

                          {/* Card layer â€” absolutely positioned */}
                          {orgNodes.map(node=>{
                            const pos = positions[node.id];
                            if(!pos) return null;
                            return(
                              <div key={node.id}
                                draggable={orgEditing}
                                onDragStart={orgEditing?e=>{e.stopPropagation();setOrgDragId(node.id);}:undefined}
                                onDragEnd={orgEditing?()=>setOrgDragId(null):undefined}
                                onDragOver={orgEditing?e=>e.preventDefault():undefined}
                                onDrop={orgEditing?e=>{e.preventDefault();e.stopPropagation();if(orgDragId&&orgDragId!==node.id) moveNode(orgDragId,node.id);}:undefined}
                                style={{
                                  position:"absolute",
                                  left:pos.x, top:pos.y,
                                  width:CARD_W,
                                  cursor:orgEditing?"grab":"default",
                                  opacity:orgDragId===node.id?0.25:1,
                                  transition:"opacity .2s",
                                  zIndex:2,
                                  userSelect:"none",
                                }}>
                                {renderOrgCard(node)}
                                {orgEditing&&isAdmin&&(
                                  <button
                                    onClick={()=>setOrgEditNode({id:null,name:"",title:"",engineer_id:null,parent_id:node.id,is_external:false,sort_order:(kidMap[node.id]||[]).length})}
                                    style={{marginTop:4,width:"100%",background:"transparent",border:`1px dashed ${isDark?"#2a5a8a":"#94b4d0"}`,
                                      color:isDark?"#4a8aaa":"#4a6a8a",borderRadius:6,padding:"4px",fontSize:12,
                                      cursor:"pointer",fontWeight:600,letterSpacing:".04em"}}>
                                    + add child
                                  </button>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    )}
                    {/* Edit Node Modal */}
                    {orgEditNode&&(
                      <div style={{position:"fixed",inset:0,background:"#00000090",zIndex:1000,display:"flex",alignItems:"center",justifyContent:"center"}}
                        onClick={e=>{if(e.target===e.currentTarget)setOrgEditNode(null);}}>
                        <div style={{background:"var(--bg1)",border:"1px solid var(--border3)",borderRadius:12,padding:24,width:360,display:"grid",gap:12}}>
                          <div style={{fontSize:16,fontWeight:700,color:"var(--info)",marginBottom:4}}>
                            {orgEditNode.id?"Edit Node":"Add Node"}
                          </div>

                          <div>
                            <div style={{fontSize:13,fontWeight:700,color:"var(--text3)",marginBottom:4}}>DISPLAY NAME *</div>
                            <input value={orgEditNode.name||""} onChange={e=>setOrgEditNode(p=>({...p,name:e.target.value}))}
                              placeholder="e.g. Sameh Said" style={{width:"100%",boxSizing:"border-box"}}/>
                          </div>

                          <div>
                            <div style={{fontSize:13,fontWeight:700,color:"var(--text3)",marginBottom:4}}>TITLE / ROLE LABEL</div>
                            <input value={orgEditNode.title||""} onChange={e=>setOrgEditNode(p=>({...p,title:e.target.value}))}
                              placeholder="e.g. CTO آ· Romain" style={{width:"100%",boxSizing:"border-box"}}/>
                          </div>

                          <div>
                            <div style={{fontSize:13,fontWeight:700,color:"var(--text3)",marginBottom:4}}>LINK TO ENGINEER (optional)</div>
                            <select value={orgEditNode.engineer_id||""} onChange={e=>setOrgEditNode(p=>({...p,engineer_id:e.target.value?+e.target.value:null}))}
                              style={{width:"100%",boxSizing:"border-box"}}>
                              <option value="">â€” External / No link â€”</option>
                              {engineers.map(e=><option key={e.id} value={e.id}>{e.name} آ· {e.role}</option>)}
                            </select>
                          </div>

                          <div>
                            <div style={{fontSize:13,fontWeight:700,color:"var(--text3)",marginBottom:4}}>REPORTS TO</div>
                            <select value={orgEditNode.parent_id||""} onChange={e=>setOrgEditNode(p=>({...p,parent_id:e.target.value?+e.target.value:null}))}
                              style={{width:"100%",boxSizing:"border-box"}}>
                              <option value="">â€” Top level (root) â€”</option>
                              {orgNodes.filter(n=>n.id!==orgEditNode.id).map(n=>(
                                <option key={n.id} value={n.id}>{n.name}</option>
                              ))}
                            </select>
                          </div>

                          <div style={{display:"flex",alignItems:"center",gap:8}}>
                            <input type="checkbox" id="extChk" checked={!!orgEditNode.is_external}
                              onChange={e=>setOrgEditNode(p=>({...p,is_external:e.target.checked}))}/>
                            <label htmlFor="extChk" style={{fontSize:13,color:"var(--text2)",cursor:"pointer"}}>External person (dashed card)</label>
                          </div>

                          <div>
                            <div style={{fontSize:13,fontWeight:700,color:"var(--text3)",marginBottom:4}}>SORT ORDER</div>
                            <input type="number" value={orgEditNode.sort_order||0} onChange={e=>setOrgEditNode(p=>({...p,sort_order:+e.target.value}))}
                              style={{width:80}}/>
                          </div>

                          <div style={{display:"flex",gap:8,justifyContent:"flex-end",marginTop:4}}>
                            <button className="bg" onClick={()=>setOrgEditNode(null)}>Cancel</button>
                            <button className="bp" onClick={()=>{
                              if(!orgEditNode.name?.trim()){showToast("Name required",false);return;}
                              saveNode(orgEditNode);
                            }}>Save Node</button>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })()}


              {/* â”€â”€ GRID VIEW â”€â”€ */}
              {teamViewMode==="grid"&&<div className="stats-5col" style={{display:"grid",gridTemplateColumns:"repeat(5,1fr)",gap:11}}>
                {filteredTeam.map(eng=>(
                  <div key={eng.id} className="card" style={{textAlign:"center",cursor:"pointer",padding:"16px 12px",
                    opacity:!isEngActive(eng)?0.5:1,transition:"border-color .15s",
                    border:filterEngineer===String(eng.id)?"1px solid var(--info)":!isEngActive(eng)?"1px solid var(--border2)":"1px solid var(--border3)"}}
                    onClick={()=>setFilterEngineer(filterEngineer===String(eng.id)?"ALL":String(eng.id))}>
                    {/* Avatar */}
                    <div className="av" style={{width:44,height:44,fontSize:15,margin:"0 auto 10px",filter:!isEngActive(eng)?"grayscale(1)":"none"}}>{eng.name?.slice(0,2).toUpperCase()}</div>
                    {/* Name + status */}
                    <div style={{fontSize:14,fontWeight:700,color:"var(--text0)",lineHeight:1.2,marginBottom:2}}>
                      {eng.name}
                      {!isEngActive(eng)&&<span style={{fontSize:11,marginLeft:5,color:"#f87171",background:"#f8717115",padding:"1px 5px",borderRadius:3,fontWeight:600}}>LEFT</span>}
                    </div>
                    <div style={{fontSize:12,color:"var(--text4)",marginBottom:6}}>{eng.role}</div>
                    {/* Role badge */}
                    <div style={{marginBottom:10}}><span className="role-badge" style={{background:ROLE_COLORS[eng.role_type]+"20",color:ROLE_COLORS[eng.role_type]||"var(--text3)"}}>{ROLE_LABELS[eng.role_type]||eng.role_type}</span></div>
                    {/* Utilization bar */}
                    {(()=>{
                      const u=eng.utilization||0;
                      const barC=u>=80?"#34d399":u>=60?"#fb923c":"#f87171";
                      return(
                        <div style={{marginBottom:10}}>
                          <div style={{display:"flex",justifyContent:"space-between",fontSize:11,color:"var(--text4)",marginBottom:3}}>
                            <span>Util.</span><span style={{fontFamily:"'IBM Plex Mono',monospace",fontWeight:700,color:barC}}>{u}%</span>
                          </div>
                          <div style={{background:"var(--bg3)",borderRadius:4,height:5,overflow:"hidden"}}>
                            <div style={{height:"100%",width:`${Math.min(100,u)}%`,background:barC,borderRadius:4,transition:"width .3s"}}/>
                          </div>
                        </div>
                      );
                    })()}
                    {/* Stats row */}
                    <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:5,marginBottom:8}}>
                      <div style={{background:"var(--bg2)",borderRadius:6,padding:"7px 4px"}}>
                        <div style={{fontFamily:"'IBM Plex Mono',monospace",fontSize:15,fontWeight:700,color:"var(--info)"}}>
                          {(filterProject==="ALL"?eng.workHrs:teamMonthEntries.filter(e=>String(e.engineer_id)===String(eng.id)&&e.entry_type==="work").reduce((s,e)=>s+e.hours,0))}h
                        </div>
                        <div style={{fontSize:11,color:"var(--text4)"}}>Work Hrs</div>
                      </div>
                      <div style={{background:"var(--bg2)",borderRadius:6,padding:"7px 4px"}}>
                        <div style={{fontFamily:"'IBM Plex Mono',monospace",fontSize:15,fontWeight:700,color:"#a78bfa"}}>
                          {(isAdmin||isAcct)?fmtPct(eng.billability):"â€”"}
                        </div>
                        <div style={{fontSize:11,color:"var(--text4)"}}>Billability</div>
                      </div>
                    </div>
                    {/* Leave + revenue */}
                    <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:eng.leaveDays>0?6:0}}>
                      {eng.leaveDays>0&&<span style={{fontSize:12,color:"#fb923c",background:"#fb923c12",padding:"2px 8px",borderRadius:4,fontWeight:600}}>{eng.leaveDays}d leave</span>}
                      {(isAdmin||isAcct)&&<span style={{fontSize:12,fontFamily:"'IBM Plex Mono',monospace",color:"#34d399",marginLeft:"auto"}}>{fmtCurrency(eng.revenue)}</span>}
                    </div>
                    {/* Level */}
                    <div style={{fontSize:11,padding:"2px 8px",borderRadius:4,background:"var(--border)",color:"var(--text3)",display:"inline-block",marginBottom:eng.leaveDays>0||((isAdmin||isAcct)&&eng.revenue>0)?4:0}}>{eng.level||"â€”"}</div>
                    {/* Assigned projects */}
                    {(()=>{
                      const myProjs=projects.filter(p=>p.status==="Active"&&(p.assigned_engineers||[]).map(String).includes(String(eng.id)));
                      if(!myProjs.length) return(<div style={{fontSize:11,color:"var(--border)",marginTop:6}}>no active projects</div>);
                      return(
                        <div style={{marginTop:6,display:"flex",flexWrap:"wrap",gap:3,justifyContent:"center"}}>
                          {myProjs.slice(0,4).map(p=>(
                            <span key={p.id} title={(p.name||p.id)+" ("+p.id+")"} style={{fontSize:11,padding:"2px 6px",borderRadius:4,
                              background:"var(--bg2)",border:"1px solid var(--border3)",color:"var(--info)",
                              whiteSpace:"nowrap",maxWidth:90,overflow:"hidden",textOverflow:"ellipsis"}}>
                              {p.name||p.id}
                            </span>
                          ))}
                          {myProjs.length>4&&<span style={{fontSize:11,color:"var(--text4)"}}>+{myProjs.length-4}</span>}
                        </div>
                      );
                    })()}
                  </div>
                ))}
              </div>}

            </div>
          );})()}

          {/* â•گâ•گâ•گâ•گ REPORTS â•گâ•گâ•گâ•گ */}
          {view==="reports"&&canReport&&(
            <div style={{display:"grid",gap:20}}>

              {/* â”€â”€ Page header â”€â”€ */}
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",flexWrap:"wrap",gap:14}}>
                <div>
                  <div style={{fontSize:11,fontWeight:700,color:"var(--text4)",textTransform:"uppercase",letterSpacing:".1em",marginBottom:4}}>REPORTING</div>
                  <h1 style={{fontSize:26,fontWeight:800,color:"var(--text0)",lineHeight:1}}>Reports & PDF Export</h1>
                  <p style={{color:"var(--text3)",fontSize:14,marginTop:4,fontFamily:"'IBM Plex Mono',monospace"}}>{MONTHS[month]} {year} آ· Select a report to preview and export</p>
                </div>
              </div>

              {/* â”€â”€ Two-panel layout â”€â”€ */}
              <div className="rpt-two-panel" style={{display:"grid",gridTemplateColumns:"220px 1fr",gap:16,alignItems:"start"}}>

                {/* Left: report navigator */}
                <div style={{background:"var(--bg1)",border:"1px solid var(--border)",borderRadius:12,overflow:"hidden",position:"sticky",top:24}}>
                  {[
                    {group:"Team",items:[
                      {id:"utilization",label:"Team Utilization",show:isAdmin||isAcct||isSenior},
                      {id:"assignment", label:"Assignment",       show:isAdmin||isLead||isAcct||isSenior},
                    ]},
                    {group:"Hours",items:[
                      {id:"individual",label:"Timesheets",       show:true},
                      {id:"task",      label:"Task Analysis",    show:true},
                      {id:"projtasks", label:"Project Analysis", show:isAdmin||isAcct||isLead||isSenior},
                    ]},
                    {group:"Projects",items:[
                      {id:"tracker",   label:"Tracker Progress", show:true},
                    ]},
                    {group:"HR",items:[
                      {id:"vacation",  label:"Vacation & Leave", show:true},
                    ]},
                    {group:"Finance",items:[
                      {id:"monthly",   label:"Monthly Mgmt",     show:isAdmin||isAcct||isSenior},
                      {id:"invoice",   label:"Invoice Export",   show:canInvoice},
                    ]},
                  ].map(grp=>{
                    const visible=grp.items.filter(i=>i.show);
                    if(!visible.length) return null;
                    return(
                      <div key={grp.group}>
                        <div style={{padding:"10px 14px 6px",fontSize:11,fontWeight:700,color:"var(--text4)",textTransform:"uppercase",letterSpacing:".08em",borderTop:"1px solid var(--border)"}}>{grp.group}</div>
                        {visible.map(r=>{
                          const active=activeRpt===r.id;
                          return(
                            <button key={r.id} onClick={()=>setActiveRpt(r.id)}
                              style={{width:"100%",display:"flex",alignItems:"center",gap:10,padding:"9px 14px",background:active?"var(--nb-hover)":"transparent",border:"none",borderLeft:active?"3px solid var(--info)":"3px solid transparent",color:active?"var(--info)":"var(--text2)",cursor:"pointer",fontSize:14,fontFamily:"'IBM Plex Sans',sans-serif",fontWeight:active?600:400,textAlign:"left",transition:"all .15s"}}>
                              {r.label}
                            </button>
                          );
                        })}
                      </div>
                    );
                  })}
                </div>

                {/* Right: content area */}
                <div style={{minWidth:0}}>

                  {/* â”€â”€ Individual timesheet â”€â”€ */}
                  {activeRpt==="individual"&&(
                    <div style={{display:"grid",gap:14}}>
                      <div className="card" style={{padding:0,overflow:"hidden"}}>
                        <div style={{background:"var(--bg0)",borderBottom:"1px solid var(--border)",padding:"14px 20px",display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                          <div>
                            <div style={{fontSize:15,fontWeight:700,color:"var(--text0)"}}>Individual Timesheets</div>
                            <div style={{fontSize:13,color:"var(--text3)",marginTop:2}}>{MONTHS[month]} {year} آ· Select engineer or export all</div>
                          </div>
                          <button className="bp" onClick={()=>{
                            if(!rptEngId){
                              const now=new Date().toLocaleDateString("en-GB",{day:"2-digit",month:"short",year:"numeric"});
                              const MONTHS_=["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
                              let body=`<h2 style="text-align:center;font-family:'IBM Plex Sans',sans-serif;color:#1e3a5f;margin-bottom:4px">ENEVO GROUP â€” All Timesheets</h2><p style="text-align:center;font-size:12px;color:#64748b;font-family:sans-serif;margin-bottom:24px">${MONTHS_[month]} ${year} آ· Generated ${now} آ· ${engineers.length} engineers</p>`;
                              engineers.forEach((eng,i)=>{
                                const we=monthEntries.filter(e=>String(e.engineer_id)===String(eng.id)&&e.entry_type==="work").sort((a,b)=>a.date.localeCompare(b.date));
                                const le=monthEntries.filter(e=>String(e.engineer_id)===String(eng.id)&&e.entry_type==="leave");
                                const totalW=we.reduce((s,e)=>s+e.hours,0);
                                const rows=we.map(e=>{const p=projects.find(x=>x.id===e.project_id);return`<tr><td style="font-family:monospace">${e.date}</td><td style="color:#0ea5e9">${e.project_id||""}</td><td>${p?.name||""}</td><td>${e.task_type||""}</td><td style="font-style:italic;color:#64748b">${e.activity||""}</td><td style="font-family:monospace;font-weight:700;color:#0ea5e9">${e.hours}h</td></tr>`;}).join("");
                                body+=`<div style="page-break-before:${i===0?"avoid":"always"};margin-bottom:24px"><div style="background:#1e3a5f;color:#fff;padding:10px 16px;border-radius:6px 6px 0 0;display:flex;justify-content:space-between"><div><div style="font-size:16px;font-weight:700">${eng.name}</div><div style="font-size:11px;color:#93c5fd">${eng.role||""} آ· ${MONTHS_[month]} ${year}</div></div><div style="font-size:22px;font-weight:800;color:#38bdf8">${totalW}h</div></div><table style="width:100%;border-collapse:collapse;font-size:12px;font-family:sans-serif;border:1px solid #e2e8f0;border-top:none"><thead><tr style="background:#f1f5f9"><th style="padding:5px 8px;text-align:left;font-size:10px;color:#64748b">DATE</th><th style="padding:5px 8px;text-align:left;font-size:10px;color:#64748b">PROJ ID</th><th style="padding:5px 8px;text-align:left;font-size:10px;color:#64748b">PROJECT</th><th style="padding:5px 8px;text-align:left;font-size:10px;color:#64748b">TASK</th><th style="padding:5px 8px;text-align:left;font-size:10px;color:#64748b">ACTIVITY</th><th style="padding:5px 8px;text-align:left;font-size:10px;color:#64748b">HRS</th></tr></thead><tbody>${rows||`<tr><td colspan="6" style="padding:12px;text-align:center;color:#94a3b8">No entries for ${MONTHS_[month]} ${year}</td></tr>`}</tbody><tfoot><tr style="background:#f8fafc"><td colspan="5" style="padding:6px 8px;font-weight:700;font-size:12px">Total آ· ${le.length} leave day${le.length!==1?"s":""}</td><td style="padding:6px 8px;font-family:monospace;font-weight:700;color:#0ea5e9">${totalW}h</td></tr></tfoot></table></div>`;
                              });
                              const html=`<!DOCTYPE html><html><head><meta charset="utf-8"><title>All Timesheets â€” ${MONTHS_[month]} ${year}</title><style>*{box-sizing:border-box;margin:0;padding:0}body{font-family:sans-serif;color:#1e293b;padding:20px}@media print{body{padding:0}@page{margin:14mm}tr{page-break-inside:avoid}}</style></head><body>${body}<div style="margin-top:20px;border-top:1px solid #e2e8f0;padding-top:8px;font-size:9px;color:#94a3b8;text-align:center">ENEVO GROUP آ· ${now}</div></body></html>`;
                              const w=window.open("","pdf_merged_"+Date.now());
                              if(w){w.document.write(html);w.document.close();w.focus();setTimeout(()=>w.print(),600);}
                              else showToast("Allow popups to export",false);
                            } else {
                              const eng=engineers.find(e=>e.id===rptEngId);
                              if(eng) buildTimesheetPDF(eng,monthEntries,projects,month,year);
                            }
                          }}>â¬‡ {!rptEngId?"All â€” Merged PDF":"Export PDF"}</button>
                        </div>
                        <div style={{padding:"16px 20px"}}>
                          <select value={rptEngId||"ALL"} onChange={e=>setRptEngId(e.target.value==="ALL"?null:+e.target.value)}
                            style={{marginBottom:14,width:"100%",maxWidth:340}}>
                            <option value="ALL">All Engineers (merged PDF)</option>
                            {engineers.map(e=><option key={e.id} value={e.id}>{e.name} آ· {e.role}</option>)}
                          </select>
                          {!rptEngId&&(
                            <table>
                              <thead><tr><th>Engineer</th><th>Role</th><th style={{textAlign:"right"}}>Work Hrs</th><th style={{textAlign:"right"}}>Projects</th><th style={{textAlign:"right"}}>Leave</th><th></th></tr></thead>
                              <tbody>{engineers.map(eng=>{
                                const ee=monthEntries.filter(e=>String(e.engineer_id)===String(eng.id));
                                const wh=ee.filter(e=>e.entry_type==="work").reduce((s,e)=>s+e.hours,0);
                                const ld=ee.filter(e=>e.entry_type==="leave").length;
                                const prjs=[...new Set(ee.filter(e=>e.entry_type==="work").map(e=>e.project_id))].length;
                                return<tr key={eng.id}>
                                  <td><div style={{display:"flex",alignItems:"center",gap:8}}><div className="av" style={{width:28,height:28,fontSize:12}}>{eng.name?.slice(0,2).toUpperCase()}</div><div><div style={{fontWeight:600}}>{eng.name}</div><div style={{fontSize:12,color:"var(--text4)"}}>{eng.role}</div></div></div></td>
                                  <td style={{color:"var(--text3)"}}>{eng.level}</td>
                                  <td style={{textAlign:"right",fontFamily:"'IBM Plex Mono',monospace",fontWeight:700,color:"var(--info)"}}>{wh}h</td>
                                  <td style={{textAlign:"right",fontFamily:"'IBM Plex Mono',monospace"}}>{prjs}</td>
                                  <td style={{textAlign:"right",color:ld>0?"#fb923c":"var(--text4)"}}>{ld}d</td>
                                  <td><button className="be" onClick={()=>buildTimesheetPDF(eng,monthEntries,projects,month,year)}>â¬‡ PDF</button></td>
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
                              <div>
                                <div style={{display:"flex",alignItems:"center",gap:14,marginBottom:14,background:"var(--bg2)",borderRadius:10,padding:"14px 16px"}}>
                                  <div className="av" style={{width:44,height:44,fontSize:15}}>{eng?.name?.slice(0,2).toUpperCase()}</div>
                                  <div style={{flex:1}}>
                                    <div style={{fontSize:16,fontWeight:700,color:"var(--text0)"}}>{eng?.name}</div>
                                    <div style={{fontSize:13,color:"var(--text3)"}}>{eng?.role} آ· {eng?.level}</div>
                                  </div>
                                  <div style={{display:"flex",gap:20}}>
                                    {[{l:"Work Hrs",v:wh+"h",c:"var(--info)"},{l:"Leave",v:ld+"d",c:"#fb923c"},{l:"Projects",v:projs.length,c:"#a78bfa"}].map((s,i)=>(
                                      <div key={i} style={{textAlign:"center"}}>
                                        <div style={{fontFamily:"'IBM Plex Mono',monospace",fontSize:20,fontWeight:800,color:s.c}}>{s.v}</div>
                                        <div style={{fontSize:12,color:"var(--text4)"}}>{s.l}</div>
                                      </div>
                                    ))}
                                  </div>
                                </div>
                                <table>
                                  <thead><tr><th>Date</th><th>Project</th><th>Task</th><th>Activity</th><th style={{textAlign:"right"}}>Hrs</th></tr></thead>
                                  <tbody>{engEntries.filter(e=>e.entry_type==="work").sort((a,b)=>a.date.localeCompare(b.date)).map(e=>{
                                    const proj=projects.find(p=>p.id===e.project_id);
                                    return<tr key={e.id}>
                                      <td style={{fontFamily:"'IBM Plex Mono',monospace"}}>{e.date}</td>
                                      <td style={{color:"var(--info)",fontWeight:600}}>{proj?.name||proj?.id}</td>
                                      <td style={{color:"var(--text2)"}}>{e.task_type}</td>
                                      <td style={{color:"var(--text3)",fontStyle:"italic",maxWidth:200,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{e.activity||"â€”"}</td>
                                      <td style={{textAlign:"right",fontFamily:"'IBM Plex Mono',monospace",color:"var(--info)",fontWeight:700}}>{e.hours}h</td>
                                    </tr>;})}
                                  </tbody>
                                </table>
                              </div>
                            );
                          })()}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* â”€â”€ Team Utilization â”€â”€ */}
                  {activeRpt==="utilization"&&(
                    <div className="card" style={{padding:0,overflow:"hidden"}}>
                      <div style={{background:"var(--bg0)",borderBottom:"1px solid var(--border)",padding:"14px 20px",display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                        <div>
                          <div style={{fontSize:15,fontWeight:700,color:"var(--text0)"}}>Team Utilization</div>
                          <div style={{fontSize:13,color:"var(--text3)",marginTop:2}}>{MONTHS[month]} {year} آ· {visibleEngStats.length} engineers</div>
                        </div>
                        <button className="bp" onClick={buildUtilizationPDF}>â¬‡ Export PDF</button>
                      </div>
                      <table>
                        <thead><tr><th>Engineer</th><th>Level</th><th style={{textAlign:"right"}}>Target</th><th style={{textAlign:"right"}}>Work</th><th style={{textAlign:"right"}}>Billable</th><th style={{textAlign:"right"}}>Leave</th><th>Utilization</th><th>Billability</th>{(isAdmin||isAcct)&&<th style={{textAlign:"right"}}>Revenue</th>}</tr></thead>
                        <tbody>{visibleEngStats.map(e=>(
                          <tr key={e.id}>
                            <td><div style={{display:"flex",alignItems:"center",gap:8}}><div className="av" style={{width:30,height:30,fontSize:12}}>{e.name?.slice(0,2).toUpperCase()}</div><div><div style={{fontWeight:600}}>{e.name}</div><div style={{fontSize:12,color:"var(--text4)"}}>{e.role}</div></div></div></td>
                            <td><span style={{fontSize:12,padding:"2px 7px",borderRadius:4,background:"var(--bg3)",color:"var(--text2)",fontWeight:600}}>{e.level}</span></td>
                            <td style={{textAlign:"right",fontFamily:"'IBM Plex Mono',monospace",color:"var(--text3)"}}>{e.targetHrs}h</td>
                            <td style={{textAlign:"right",fontFamily:"'IBM Plex Mono',monospace",fontWeight:700}}>{e.workHrs}h</td>
                            <td style={{textAlign:"right",fontFamily:"'IBM Plex Mono',monospace",color:"var(--info)",fontWeight:700}}>{e.billableHrs}h</td>
                            <td style={{textAlign:"right",color:e.leaveDays>0?"#fb923c":"var(--text4)"}}>{e.leaveDays}d</td>
                            <td style={{minWidth:140}}>
                              <div style={{display:"flex",alignItems:"center",gap:8}}>
                                <div style={{flex:1,background:"var(--bg3)",height:7,borderRadius:4,overflow:"hidden"}}>
                                  <div style={{height:"100%",width:`${Math.min(100,e.utilization)}%`,borderRadius:4,background:e.utilization>=80?"linear-gradient(90deg,#34d399,#10b981)":e.utilization>=60?"linear-gradient(90deg,#fb923c,#f59e0b)":"linear-gradient(90deg,#f87171,#ef4444)"}}/>
                                </div>
                                <span style={{fontFamily:"'IBM Plex Mono',monospace",fontWeight:700,minWidth:38,color:e.utilization>=80?"#34d399":e.utilization>=60?"#fb923c":"#f87171"}}>{fmtPct(e.utilization)}</span>
                              </div>
                            </td>
                            <td style={{minWidth:130}}>
                              <div style={{display:"flex",alignItems:"center",gap:8}}>
                                <div style={{flex:1,background:"var(--bg3)",height:7,borderRadius:4,overflow:"hidden"}}>
                                  <div style={{height:"100%",width:`${Math.min(100,e.billability)}%`,background:"linear-gradient(90deg,#a78bfa,#7c3aed)",borderRadius:4}}/>
                                </div>
                                <span style={{fontFamily:"'IBM Plex Mono',monospace",fontWeight:700,minWidth:38,color:"#a78bfa"}}>{fmtPct(e.billability)}</span>
                              </div>
                            </td>
                            {(isAdmin||isAcct)&&<td style={{textAlign:"right",fontFamily:"'IBM Plex Mono',monospace",color:"#a78bfa",fontWeight:600}}>{fmtCurrency(e.revenue)}</td>}
                          </tr>
                        ))}</tbody>
                      </table>
                    </div>
                  )}

                  {/* â”€â”€ Task Analysis â”€â”€ */}
                  {activeRpt==="task"&&(()=>{
                    const GC={"SCADA":"var(--info)","RTU-PLC":"#a78bfa","Protection":"#f87171","General":"#34d399"};
                    return(
                    <div className="card" style={{padding:0,overflow:"hidden"}}>
                      <div style={{background:"var(--bg0)",borderBottom:"1px solid var(--border)",padding:"14px 20px",display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                        <div>
                          <div style={{fontSize:15,fontWeight:700,color:"var(--text0)"}}>Task Analysis</div>
                          <div style={{fontSize:13,color:"var(--text3)",marginTop:2}}>{MONTHS[month]} {year} آ· {totalWorkHrs}h work logged</div>
                        </div>
                        <button className="bp" onClick={buildTaskPDF}>â¬‡ Export PDF</button>
                      </div>
                      <div style={{padding:"20px"}}>
                        {taskStats.length===0&&<p style={{color:"var(--text4)",fontSize:14,textAlign:"center",padding:24}}>No work hours logged for this period.</p>}
                        {taskStats.map(grp=>{
                          const pct=totalWorkHrs?Math.round(grp.hours/totalWorkHrs*100):0;
                          const gc=GC[grp.category]||"var(--info)";
                          return(
                          <div key={grp.category} style={{marginBottom:20,paddingBottom:20,borderBottom:"1px solid var(--border)"}}>
                            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:8}}>
                              <div style={{display:"flex",alignItems:"center",gap:10}}>
                                <div style={{width:12,height:12,borderRadius:3,background:gc,flexShrink:0}}/>
                                <span style={{fontWeight:700,fontSize:16,color:gc}}>{grp.category}</span>
                              </div>
                              <div style={{display:"flex",gap:16,fontSize:13,alignItems:"center"}}>
                                <span style={{fontFamily:"'IBM Plex Mono',monospace",color:gc,fontWeight:700,fontSize:15}}>{grp.hours}h</span>
                                <span style={{color:"var(--text3)",fontFamily:"'IBM Plex Mono',monospace"}}>{pct}%</span>
                                <span style={{color:"#34d399",fontWeight:600}}>{grp.hours?Math.round(grp.billable/grp.hours*100):0}% billable</span>
                              </div>
                            </div>
                            <div style={{background:"var(--bg3)",height:8,borderRadius:4,overflow:"hidden",marginBottom:12}}>
                              <div style={{height:"100%",width:`${pct}%`,background:gc,borderRadius:4,transition:"width .4s"}}/>
                            </div>
                            <div style={{display:"grid",gap:6}}>
                              {Object.entries(grp.tasks).sort((a,b)=>b[1].hrs-a[1].hrs).map(([cat,catData])=>{
                                const catPct=grp.hours?Math.round(catData.hrs/grp.hours*100):0;
                                const topActs=Object.entries(catData.activities||{}).sort((a,b)=>b[1]-a[1]).slice(0,4);
                                return(
                                <div key={cat} style={{background:"var(--bg2)",border:"1px solid var(--border)",borderRadius:8,padding:"10px 14px"}}>
                                  <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:topActs.length?6:0}}>
                                    <span style={{fontSize:14,fontWeight:600,color:"var(--text1)"}}>{cat}</span>
                                    <div style={{display:"flex",gap:10,alignItems:"center"}}>
                                      <div style={{background:"var(--bg3)",height:6,borderRadius:3,width:60,overflow:"hidden"}}>
                                        <div style={{height:"100%",width:`${catPct}%`,background:gc+"80",borderRadius:3}}/>
                                      </div>
                                      <span style={{fontFamily:"'IBM Plex Mono',monospace",fontSize:14,color:gc,fontWeight:700}}>{catData.hrs}h</span>
                                      <span style={{fontSize:13,color:"var(--text4)"}}>{catPct}%</span>
                                    </div>
                                  </div>
                                  {topActs.length>0&&(
                                    <div style={{display:"flex",flexWrap:"wrap",gap:5}}>
                                      {topActs.map(([act,hrs])=>(
                                        <span key={act} style={{background:"var(--bg0)",border:"1px solid var(--border)",borderRadius:5,padding:"3px 8px",fontSize:12,color:"var(--text3)"}}>
                                          {act.length>30?act.slice(0,28)+"â€¦":act}
                                          <span style={{color:"var(--info)",fontFamily:"'IBM Plex Mono',monospace",marginLeft:5,fontWeight:700}}>{hrs}h</span>
                                        </span>
                                      ))}
                                      {Object.keys(catData.activities||{}).length>4&&<span style={{fontSize:12,color:"var(--text4)",padding:"3px 4px"}}>+{Object.keys(catData.activities).length-4} more</span>}
                                    </div>
                                  )}
                                </div>);
                              })}
                            </div>
                          </div>
                        );})}
                      </div>
                    </div>);
                  })()}

                  {/* â”€â”€ Project Tasks Analysis â”€â”€ */}
                  {activeRpt==="projtasks"&&(
                    <div>
                      <div className="card" style={{padding:0,overflow:"hidden",marginBottom:14}}>
                        <div style={{background:"var(--bg0)",borderBottom:"1px solid var(--border)",padding:"14px 20px",display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                          <div style={{fontSize:15,fontWeight:700,color:"var(--text0)"}}>Project Analysis</div>
                          <div style={{fontSize:13,color:"var(--text3)",fontFamily:"'IBM Plex Mono',monospace"}}>{MONTHS[month]} {year}</div>
                        </div>
                      </div>
                      <ProjectTasksReport
                        allEntries={mySubEngIds ? entries.filter(e=>mySubEngIds.has(String(e.engineer_id))) : entries}
                        projects={projects}
                        engineers={mySubEngIds ? engineers.filter(e=>mySubEngIds.has(String(e.id))) : engineers}
                        MONTHS={MONTHS} fmtCurrency={fmtCurrency} fmtPct={fmtPct} isAdmin={isAdmin} isAcct={isAcct}/>
                    </div>
                  )}

                  {/* â”€â”€ Tracker Progress â”€â”€ */}
                  {activeRpt==="tracker"&&(
                    <div>
                      <div className="card" style={{padding:0,overflow:"hidden",marginBottom:14}}>
                        <div style={{background:"var(--bg0)",borderBottom:"1px solid var(--border)",padding:"14px 20px"}}>
                          <div style={{fontSize:15,fontWeight:700,color:"var(--text0)"}}>Tracker Progress Report</div>
                          <div style={{fontSize:13,color:"var(--text3)",marginTop:2}}>Activity status, progress and phases by project</div>
                        </div>
                      </div>
                      <TrackerProgressReport activities={activities} projects={projects} subprojects={subprojects} engineers={engineers}/>
                    </div>
                  )}

                  {/* â”€â”€ Assignment â”€â”€ */}
                  {activeRpt==="assignment"&&(
                    <div>
                      <div className="card" style={{padding:0,overflow:"hidden",marginBottom:14}}>
                        <div style={{background:"var(--bg0)",borderBottom:"1px solid var(--border)",padding:"14px 20px"}}>
                          <div style={{fontSize:15,fontWeight:700,color:"var(--text0)"}}>Assignment Report</div>
                          <div style={{fontSize:13,color:"var(--text3)",marginTop:2}}>{MONTHS[month]} {year} آ· Who is working on what</div>
                        </div>
                      </div>
                      <AssignmentReport
                        entries={mySubEngIds ? entries.filter(e=>mySubEngIds.has(String(e.engineer_id))) : entries}
                        projects={projects}
                        engineers={mySubEngIds ? engineers.filter(e=>mySubEngIds.has(String(e.id))) : engineers}
                        month={month} year={year}/>
                    </div>
                  )}

                  {/* â”€â”€ Vacation â”€â”€ */}
                  {activeRpt==="vacation"&&<VacationReport
                    engineers={(mySubEngIds ? engineers.filter(e=>mySubEngIds.has(String(e.id))) : engineers).filter(e=>e.is_active!==false&&e.is_active!==0&&e.is_active!==null&&(!e.termination_date||String(e.termination_date).slice(0,10)>new Date().toISOString().slice(0,10)))}
                    leaveEntries={leaveEntries} allEntries={entries}
                    month={month} year={year} MONTHS={MONTHS}
                    isAdmin={isAdmin}
                    vacationBalances={vacationBalances}
                    setVacBalance={setVacBalance}
                    showToast={showToast}
                    onExport={()=>{
                      const expEngs = (mySubEngIds ? engineers.filter(e=>mySubEngIds.has(String(e.id))) : engineers).filter(e=>e.is_active!==false&&e.is_active!==0&&e.is_active!==null&&(!e.termination_date||String(e.termination_date).slice(0,10)>new Date().toISOString().slice(0,10)));
                      buildVacationPDF(expEngs,entries,leaveEntries,projects,month,year);
                    }}
                  />}

                  {/* â”€â”€ Monthly Management â”€â”€ */}
                  {activeRpt==="monthly"&&(
                    <div className="card" style={{padding:0,overflow:"hidden"}}>
                      <div style={{background:"var(--bg0)",borderBottom:"1px solid var(--border)",padding:"14px 20px",display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                        <div>
                          <div style={{fontSize:15,fontWeight:700,color:"var(--text0)"}}>Monthly Management Report</div>
                          <div style={{fontSize:13,color:"var(--text3)",marginTop:2}}>Full executive summary â€” {MONTHS[month]} {year}</div>
                        </div>
                        <button className="bp" onClick={buildMonthlyPDF}>â¬‡ Export PDF</button>
                      </div>
                      <div style={{padding:"32px 20px",textAlign:"center"}}>
                        
                        <div style={{fontSize:16,fontWeight:700,color:"var(--text0)",marginBottom:6}}>Ready to generate</div>
                        <div style={{fontSize:14,color:"var(--text3)",marginBottom:24,maxWidth:400,margin:"0 auto 24px"}}>Includes team utilization, billability, revenue, project breakdown, and engineer summary for {MONTHS[month]} {year}.</div>
                        <button className="bp" style={{fontSize:15,padding:"10px 28px"}} onClick={buildMonthlyPDF}>â¬‡ Export PDF</button>
                      </div>
                    </div>
                  )}

                  {/* â”€â”€ Invoice â”€â”€ */}
                  {activeRpt==="invoice"&&canInvoice&&(()=>{
                    const allWithHours=projStats.filter(p=>p.hours>0);
                    const filteredProjs=invoiceProjId==="ALL"?allWithHours:allWithHours.filter(p=>p.id===invoiceProjId);
                    const invTotal=filteredProjs.filter(p=>p.billable).reduce((s,p)=>s+p.revenue,0);
                    const invHrs=filteredProjs.filter(p=>p.billable).reduce((s,p)=>s+p.hours,0);
                    return(
                    <div style={{display:"grid",gap:14}}>
                      <div className="card" style={{padding:0,overflow:"hidden"}}>
                        <div style={{background:"var(--bg0)",borderBottom:"1px solid var(--border)",padding:"14px 20px",display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                          <div>
                            <div style={{fontSize:15,fontWeight:700,color:"var(--text0)"}}>Invoice Export</div>
                            <div style={{fontSize:13,color:"var(--text3)",marginTop:2}}>{MONTHS[month]} {year} آ· Billable projects only</div>
                          </div>
                          <div style={{display:"flex",gap:8}}>
                            <select value={invoiceProjId} onChange={e=>setInvoiceProjId(e.target.value)} style={{width:200}}>
                              <option value="ALL">All Billable Projects</option>
                              {allWithHours.filter(p=>p.billable).map(p=><option key={p.id} value={p.id}>{p.name}</option>)}
                            </select>
                          </div>
                        </div>
                        {allWithHours.some(p=>!p.billable)&&(
                          <div style={{padding:"10px 20px",background:"var(--warn-bg)",borderBottom:"1px solid #fb923c30",display:"flex",alignItems:"center",justifyContent:"space-between",gap:12}}>
                            <span style={{fontSize:13,color:"#fb923c"}}>âڑ  Some projects have hours but are not marked billable</span>
                            <button className="bg" style={{fontSize:12,borderColor:"#fb923c50",color:"#fb923c",flexShrink:0,padding:"4px 10px"}}
                              onClick={async()=>{
                                const toMark=allWithHours.filter(p=>!p.billable);
                                for(const p of toMark){
                                  await supabase.from("projects").update({billable:true}).eq("id",p.id);
                                  setProjects(prev=>prev.map(pr=>pr.id===p.id?{...pr,billable:true}:pr));
                                }
                                showToast(`${toMark.length} projects marked billable âœ“`);
                              }}>Mark all billable</button>
                          </div>
                        )}
                        <div style={{padding:"16px 20px"}}>
                          <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:12,marginBottom:16}}>
                            {[
                              {l:"Billable Hours",v:invHrs+"h",c:"var(--info)"},
                              {l:"Total Revenue",v:fmtCurrency(invTotal),c:"#a78bfa"},
                              {l:"Projects",v:filteredProjs.filter(p=>p.billable).length,c:"#34d399"},
                            ].map((s,i)=>(
                              <div key={i} style={{background:"var(--bg2)",border:"1px solid var(--border)",borderRadius:10,padding:"14px 16px",borderTop:`3px solid ${s.c}`}}>
                                <div style={{fontSize:12,fontWeight:700,color:"var(--text4)",textTransform:"uppercase",letterSpacing:".06em",marginBottom:6}}>{s.l}</div>
                                <div style={{fontFamily:"'IBM Plex Mono',monospace",fontSize:24,fontWeight:800,color:s.c}}>{s.v}</div>
                              </div>
                            ))}
                          </div>
                          <div style={{display:"flex",gap:8,justifyContent:"flex-end",marginBottom:12}}>
                            <button className="bp" style={{fontSize:13,padding:"7px 18px"}}
                              onClick={()=>buildInvoicePDF(projects,entries,engineers,month,year,invoiceProjId==="ALL"?null:invoiceProjId)}>
                              â¬‡ Export Invoice PDF {invoiceProjId!=="ALL"?"(filtered)":"(all)"}
                            </button>
                          </div>
                          <table>
                            <thead><tr><th>Project</th><th>No.</th><th style={{textAlign:"right"}}>Hours</th><th style={{textAlign:"right"}}>Rate</th><th style={{textAlign:"right"}}>Revenue</th><th style={{textAlign:"right"}}>Type</th><th></th></tr></thead>
                            <tbody>{filteredProjs.map(p=>(
                              <tr key={p.id}>
                                <td style={{fontWeight:600}}>{p.name||p.id}</td>
                                <td style={{fontFamily:"'IBM Plex Mono',monospace",color:"var(--info)",fontWeight:700}}>{p.id}</td>
                                <td style={{textAlign:"right",fontFamily:"'IBM Plex Mono',monospace",fontWeight:700}}>{p.hours}h</td>
                                <td style={{textAlign:"right",fontFamily:"'IBM Plex Mono',monospace",color:"var(--text3)"}}>{p.billable?`$${p.rate_per_hour}/h`:"â€”"}</td>
                                <td style={{textAlign:"right",fontFamily:"'IBM Plex Mono',monospace",color:"#a78bfa",fontWeight:700}}>{p.billable?fmtCurrency(p.revenue):"â€”"}</td>
                                <td style={{textAlign:"right"}}><span style={{fontSize:12,padding:"2px 8px",borderRadius:4,background:p.billable?"#05603a30":"#fb923c20",color:p.billable?"#34d399":"#fb923c",fontWeight:700}}>{p.billable?"BILL":"NON"}</span></td>
                                <td><button className="be" style={{fontSize:12,whiteSpace:"nowrap"}}
                                  onClick={()=>buildInvoicePDF(projects,entries,engineers,month,year,p.id)}>
                                  â¬‡ PDF
                                </button></td>
                              </tr>
                            ))}</tbody>
                            {filteredProjs.filter(p=>p.billable).length>0&&(
                              <tfoot><tr style={{background:"var(--bg2)",borderTop:"2px solid var(--border)"}}>
                                <td colSpan={2} style={{fontWeight:700,color:"var(--text0)"}}>BILLABLE TOTAL</td>
                                <td style={{textAlign:"right",fontFamily:"'IBM Plex Mono',monospace",fontWeight:700,color:"var(--info)"}}>{invHrs}h</td>
                                <td></td>
                                <td style={{textAlign:"right",fontFamily:"'IBM Plex Mono',monospace",fontWeight:700,color:"#a78bfa",fontSize:15}}>{fmtCurrency(invTotal)}</td>
                                <td colSpan={2}></td>
                              </tr></tfoot>
                            )}
                          </table>
                        </div>
                      </div>
                    </div>);
                  })()}

                </div>{/* end right panel */}
              </div>{/* end two-panel grid */}
            </div>
          )}
          {/* â•گâ•گâ•گâ•گ ADMIN / LEAD PANEL â•گâ•گâ•گâ•گ */}
          {view==="admin"&&(
            <div style={{display:"grid",gap:20}}>

              {/* â”€â”€ Page header â”€â”€ */}
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",flexWrap:"wrap",gap:14}}>
                <div>
                  <div style={{fontSize:11,fontWeight:700,color:"var(--text4)",textTransform:"uppercase",letterSpacing:".1em",marginBottom:4}}>
                    {isAdmin?"SYSTEM ADMINISTRATION":isSenior?"OVERVIEW PANEL":isAcct?"FINANCE PANEL":isLead?"TEAM PANEL":"MY WORK"}
                  </div>
                  <h1 style={{fontSize:26,fontWeight:800,color:"var(--text0)",lineHeight:1}}>
                    {isAdmin?"Admin Panel":isSenior?"Overview Panel":isAcct?"Finance Panel":isLead?"Team Panel":"My Work"}
                  </h1>
                  <p style={{color:"var(--text3)",fontSize:14,marginTop:4,fontFamily:"'IBM Plex Mono',monospace"}}>
                    {isAdmin?"Engineers آ· Projects آ· Finance آ· Tracker آ· KPIs آ· Settings":
                     isSenior?"Full visibility آ· read-only across all data":
                     isAcct?"Finance access آ· view all team data":
                     isLead?"Tracker آ· Team Hours آ· Team KPIs آ· Projects":"Your activities, KPI score & info"}
                  </p>
                </div>

              </div>

              {/* Notifications panel moved to bell icon (top right) */}

              {/* â”€â”€ Senior Management: read-only overview banner â”€â”€ */}
              {isSenior&&!isAdmin&&(
                <div style={{display:"flex",alignItems:"center",gap:14,background:"#0ea5e910",border:"1px solid #0ea5e930",borderRadius:10,padding:"14px 18px"}}>
                  <span style={{fontSize:24}}>ًں‘پ</span>
                  <div>
                    <div style={{fontSize:15,fontWeight:700,color:"var(--info)"}}>Overview Panel â€” Read Only</div>
                    <div style={{fontSize:13,color:"var(--text3)",marginTop:2}}>You have visibility across all company data. Changes must be made through the Admin or Lead accounts.</div>
                  </div>
                </div>
              )}

              {/* â”€â”€ Tab navigation â”€â”€ */}
              <div style={{display:"flex",gap:2,background:"var(--bg1)",borderRadius:10,padding:4,border:"1px solid var(--border)",flexWrap:"wrap"}}>
                {(()=>{
                  // Tab definitions â€” order and labels are role-specific
                  const allTabs=[
                    // â”€â”€ Engineer only â”€â”€
                    {id:"tracker",  label:"My Activities", show:!isAdmin&&!isLead&&!isAcct&&!isSenior},
                    {id:"kpis",     label:"My KPIs",       show:!isAdmin&&!isLead&&!isAcct&&!isSenior},
                    {id:"settings", label:"Info",          show:!isAdmin&&!isLead&&!isAcct&&!isSenior},
                    // â”€â”€ Lead only â”€â”€
                    {id:"tracker",  label:"Project Tracker",   show:isLead&&!isAdmin},
                    {id:"entries",  label:"Team Hours",         show:isLead&&!isAdmin},
                    {id:"functions",label:"Function Hours",     show:isLead&&!isAdmin},
                    {id:"kpis",     label:"Team KPIs",          show:isLead&&!isAdmin},
                    {id:"projects", label:"Manage Projects",    show:isLead&&!isAdmin},
                    {id:"settings", label:"Info",               show:isLead&&!isAdmin},
                    // â”€â”€ Accountant â”€â”€
                    {id:"finance",  label:"Finance",        show:isAcct&&!isAdmin},
                    {id:"entries",  label:"All Entries",    show:isAcct&&!isAdmin},
                    {id:"engineers",label:"Engineers",      show:isAcct&&!isAdmin},
                    {id:"functions",label:"Functions",      show:isAcct&&!isAdmin},
                    {id:"kpis",     label:"KPIs",           show:isAcct&&!isAdmin},
                    {id:"settings", label:"Info",           show:isAcct&&!isAdmin},
                    // â”€â”€ Senior Management â”€â”€
                    {id:"engineers",label:"Engineers",      show:isSenior&&!isAdmin},
                    {id:"projects", label:"Projects",       show:isSenior&&!isAdmin},
                    {id:"entries",  label:"All Entries",    show:isSenior&&!isAdmin},
                    {id:"finance",  label:"Finance",        show:isSenior&&!isAdmin},
                    {id:"functions",label:"Functions",      show:isSenior&&!isAdmin},
                    {id:"kpis",     label:"KPIs",           show:isSenior&&!isAdmin},
                    {id:"tracker",  label:"Tracker",        show:isSenior&&!isAdmin},
                    {id:"settings", label:"Info",           show:isSenior&&!isAdmin},
                    // â”€â”€ Admin â”€â”€
                    {id:"engineers",label:"Engineers",      show:isAdmin},
                    {id:"projects", label:"Projects",       show:isAdmin},
                    {id:"entries",  label:"All Entries",    show:isAdmin},
                    {id:"finance",  label:"Finance",        show:isAdmin},
                    {id:"functions",label:"Functions",      show:isAdmin},
                    {id:"kpis",     label:"KPIs",           show:isAdmin},
                    {id:"tracker",  label:"Tracker",        show:isAdmin},
                    {id:"settings", label:"Info",           show:isAdmin},
                    {id:"actlog",   label:"Activity Log",   show:isAdmin},
                  ];
                  return allTabs.filter(t=>t.show).map(t=>{
                  const active=adminTab===t.id;
                  return(
                    <button key={t.id} onClick={()=>setAdminTab(t.id)}
                      style={{padding:"8px 14px",borderRadius:7,border:"none",cursor:"pointer",fontSize:14,fontWeight:active?700:500,
                        fontFamily:"'IBM Plex Sans',sans-serif",transition:"all .15s",
                        background:active?"linear-gradient(135deg,#0ea5e9,#0369a1)":"transparent",
                        color:active?"#fff":"var(--text2)"}}>
                      {t.label}
                    </button>
                  );
                });
              })()}
              </div>

              {/* ENGINEERS */}
              {adminTab==="engineers"&&(isAdmin||isAcct||isSenior)&&(
                <div className="card" style={{padding:0,overflow:"hidden"}}>
                  {/* Card header */}
                  <div style={{background:"var(--bg0)",borderBottom:"1px solid var(--border)",padding:"14px 20px",display:"flex",alignItems:"center",justifyContent:"space-between",gap:12,flexWrap:"wrap"}}>
                    <div>
                      <div style={{fontSize:15,fontWeight:700,color:"var(--text0)"}}>Engineers & Access Control</div>
                      <div style={{fontSize:13,color:"var(--text3)",marginTop:2}}>{engineers.filter(e=>isEngActive(e)).length} active آ· {engineers.length} total members</div>
                    </div>
                    <div style={{display:"flex",gap:8,alignItems:"center"}}>
                      <input value={engSearch} onChange={e=>setEngSearch(e.target.value)}
                        placeholder="ًں”چ Search engineersâ€¦"
                        style={{background:"var(--bg2)",border:"1px solid var(--border)",borderRadius:7,padding:"7px 12px",color:"var(--text0)",fontSize:14,width:210,outline:"none"}}/>
                      {isAdmin&&<button className="bp" onClick={()=>setShowEngModal(true)}>+ Add Member</button>}
                    </div>
                  </div>

                  {/* Info bar */}
                  <div style={{background:"#0ea5e908",borderBottom:"1px solid #0ea5e920",padding:"8px 20px",fontSize:13,color:"var(--info)"}}>
                    â„¹ New registrations default to <strong>Engineer</strong> role â€” update their access role in the dropdown below after they sign up.
                  </div>

                  {/* Engineers table */}
                  <table>
                    <thead><tr>
                      <th>Member</th>
                      <th>Job Role</th>
                      <th>Level</th>
                      <th>Email</th>
                      <th>Access Role</th>
                      <th>Weekend</th>
                      <th style={{textAlign:"right"}}>Month Hrs</th>
                      <th style={{width:90}}>Actions</th>
                    </tr></thead>
                    <tbody>
                      {engineers.filter(eng=>!engSearch||(eng.name||"").toLowerCase().includes(engSearch.toLowerCase())||(eng.role||"").toLowerCase().includes(engSearch.toLowerCase())).map(eng=>{
                        const es=engStats.find(e=>e.id===eng.id);
                        const engWd=()=>{try{return eng.weekend_days?JSON.parse(eng.weekend_days):DEFAULT_WEEKEND;}catch{return DEFAULT_WEEKEND;}};
                        const wdStr=engWd().map(d=>["Su","Mo","Tu","We","Th","Fr","Sa"][d]).join("+");
                        const roleColor=ROLE_COLORS[eng.role_type]||"var(--text4)";
                        const active=isEngActive(eng);
                        return(
                          <tr key={eng.id} style={{opacity:active?1:0.6}}>
                            <td>
                              <div style={{display:"flex",alignItems:"center",gap:10}}>
                                <div className="av" style={{width:32,height:32,fontSize:13,flexShrink:0,opacity:active?1:0.5}}>{eng.name?.slice(0,2).toUpperCase()}</div>
                                <div>
                                  <div style={{fontWeight:600,color:"var(--text0)"}}>{eng.name}</div>
                                  {!active&&<span style={{fontSize:12,padding:"1px 6px",borderRadius:3,background:"#f8717120",color:"#f87171",fontWeight:700}}>INACTIVE</span>}
                                </div>
                              </div>
                            </td>
                            <td style={{color:"var(--text2)"}}>{eng.role}</td>
                            <td><span style={{fontSize:12,padding:"2px 8px",borderRadius:4,background:"var(--bg3)",color:"var(--text2)",fontWeight:600}}>{eng.level}</span></td>
                            <td style={{color:"var(--text3)",fontSize:13}}>{eng.email||"â€”"}</td>
                            <td>
                              {isSenior&&!isAdmin
                                ?<span style={{fontSize:13,padding:"2px 10px",borderRadius:6,background:"var(--bg3)",color:roleColor,fontWeight:600,border:`1px solid ${roleColor}30`}}>{ROLE_LABELS[eng.role_type||"engineer"]}</span>
                                :<div style={{display:"flex",gap:6,alignItems:"center"}}>
                                <select value={pendingRoles[eng.id]??eng.role_type??"engineer"}
                                  style={{padding:"5px 8px",fontSize:13,background:"var(--bg2)",border:`1px solid ${roleColor}40`,color:roleColor,borderRadius:6,outline:"none",fontWeight:600}}
                                  onChange={e=>setPendingRoles(p=>({...p,[eng.id]:e.target.value}))}>
                                  {ROLE_TYPES.map(r=><option key={r} value={r}>{ROLE_LABELS[r]}</option>)}
                                </select>
                                {pendingRoles[eng.id]&&pendingRoles[eng.id]!==eng.role_type&&(
                                  <button className="be" style={{fontSize:13,padding:"4px 10px",whiteSpace:"nowrap"}} onClick={async()=>{
                                    const newRole=pendingRoles[eng.id];
                                    const {data,error}=await supabase.from("engineers").update({role_type:newRole}).eq("id",eng.id).select().single();
                                    if(error){
                                      setEngineers(prev=>prev.map(e=>e.id===eng.id?{...e,role_type:newRole}:e));
                                      showToast("Role set locally âœ“ â€” To persist: run SQL migration in Admin â€؛ Info tab",false);
                                      return;
                                    }
                                    if(data) setEngineers(prev=>prev.map(x=>x.id===data.id?data:x));
                                    setPendingRoles(p=>{const n={...p};delete n[eng.id];return n;});
                                    showToast(`${eng.name} â†’ ${ROLE_LABELS[newRole]} âœ“`);
                                    logAction("UPDATE","Engineer",`Role changed: ${eng.name} â†’ ${newRole}`,{engineer_id:eng.id,name:eng.name,new_role:newRole});
                                  }}>Save âœ“</button>
                                )}
                              </div>}
                            </td>
                            <td style={{fontFamily:"'IBM Plex Mono',monospace",fontSize:13,color:"#f47218",fontWeight:600}}>{wdStr||"â€”"}</td>
                            <td style={{textAlign:"right",fontFamily:"'IBM Plex Mono',monospace",color:"var(--info)",fontWeight:700}}>{es?.workHrs||0}h</td>
                            <td>
                              {isSenior&&!isAdmin
                                ?<span style={{fontSize:12,color:"var(--text4)"}}>view only</span>
                                :<div style={{display:"flex",gap:5}}>
                                  <button className="be" onClick={()=>setEditEngModal({...eng})}>âœژ</button>
                                  <button className="bd" onClick={()=>deleteEngineer(eng.id)}>âœ•</button>
                                </div>}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}

              {/* PROJECTS */}
              {adminTab==="projects"&&(isAdmin||isLead||isAcct||isSenior)&&(
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
                  isAdmin={isAdmin}
                  isLead={isLead}
                  isAcct={isAcct}
                  showConfirm={showConfirm}
                />
              )}

              {/* ALL ENTRIES */}
              {adminTab==="entries"&&(
                <div style={{display:"grid",gap:14}}>

                  {/* Filter card */}
                  <div className="card" style={{padding:0,overflow:"hidden"}}>
                    <div style={{background:"var(--bg0)",borderBottom:"1px solid var(--border)",padding:"14px 20px"}}>
                      <div style={{fontSize:15,fontWeight:700,color:"var(--text0)"}}>All Time Entries</div>
                      <div style={{fontSize:13,color:"var(--text3)",marginTop:2}}>Browse, filter and audit all engineer entries</div>
                    </div>
                    <div style={{padding:"14px 20px",display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:12}}>
                      <div>
                        <div style={{fontSize:12,fontWeight:700,color:"var(--text4)",textTransform:"uppercase",letterSpacing:".06em",marginBottom:6}}>Engineer</div>
                        <select value={entryFilter.engineer} onChange={e=>setEntryFilter(p=>({...p,engineer:e.target.value}))}>
                          <option value="ALL">All Engineers</option>
                          {engineers
                            .filter(e=>!mySubEngIds||mySubEngIds.has(String(e.id)))
                            .map(e=><option key={e.id} value={e.id}>{e.name}</option>)}
                        </select>
                      </div>
                      <div>
                        <div style={{fontSize:12,fontWeight:700,color:"var(--text4)",textTransform:"uppercase",letterSpacing:".06em",marginBottom:6}}>Project</div>
                        <select value={entryFilter.project} onChange={e=>setEntryFilter(p=>({...p,project:e.target.value}))}>
                          <option value="ALL">All Projects</option>
                          {projects.map(p=><option key={p.id} value={p.id}>{p.name} ({p.id})</option>)}
                        </select>
                      </div>
                      <div>
                        <div style={{fontSize:12,fontWeight:700,color:"var(--text4)",textTransform:"uppercase",letterSpacing:".06em",marginBottom:6}}>Month</div>
                        <select value={entryFilter.month} onChange={e=>setEntryFilter(p=>({...p,month:+e.target.value}))}>
                          {MONTHS.map((m,i)=><option key={i} value={i}>{m}</option>)}
                        </select>
                      </div>
                      <div>
                        <div style={{fontSize:12,fontWeight:700,color:"var(--text4)",textTransform:"uppercase",letterSpacing:".06em",marginBottom:6}}>Year</div>
                        <select value={entryFilter.year} onChange={e=>setEntryFilter(p=>({...p,year:+e.target.value}))} style={{background:"var(--bg2)",border:"1px solid var(--border3)",borderRadius:6,padding:"5px 10px",color:"var(--text0)",fontSize:13,fontWeight:600,outline:"none",cursor:"pointer",minWidth:80}}>
                          {[year-2,year-1,year,year+1].map(y=><option key={y}>{y}</option>)}
                        </select>
                      </div>
                    </div>
                  </div>

                  {/* Metrics + table */}
                  {(()=>{
                    const workE=adminBrowseEntries.filter(e=>e.entry_type==="work");
                    const leaveE=adminBrowseEntries.filter(e=>e.entry_type==="leave");
                    const totalWH=workE.reduce((s,e)=>s+e.hours,0);
                    const billH=workE.filter(e=>{const p=projects.find(x=>x.id===e.project_id);return p&&p.billable;}).reduce((s,e)=>s+e.hours,0);
                    const nonBillH=totalWH-billH;
                    const uniqEngs=[...new Set(workE.map(e=>e.engineer_id))].length;
                    const uniqProjs=[...new Set(workE.map(e=>e.project_id).filter(Boolean))].length;
                    return(
                    <div style={{display:"grid",gap:14}}>
                      {/* Hero metrics */}
                      <div style={{display:"grid",gridTemplateColumns:"repeat(5,1fr)",gap:12}}>
                        {[
                          {l:"Work Hours",  v:totalWH+"h",  c:"var(--info)",  sub:`${adminBrowseEntries.length} entries`},
                          {l:"Billable",    v:billH+"h",    c:"#34d399",      sub:totalWH?Math.round(billH/totalWH*100)+"% of total":""},
                          {l:"Non-Billable",v:nonBillH+"h", c:"#fb923c",      sub:"Internal / overhead"},
                          {l:"Engineers",   v:uniqEngs,     c:"#a78bfa",      sub:"Active in selection"},
                          {l:"Projects",    v:uniqProjs,    c:"#60a5fa",      sub:"Distinct projects"},
                        ].map((s,i)=>(
                          <div key={i} style={{background:"var(--bg1)",border:"1px solid var(--border)",borderRadius:12,padding:"16px",borderTop:`3px solid ${s.c}`}}>
                            <div style={{fontSize:12,fontWeight:700,color:"var(--text4)",textTransform:"uppercase",letterSpacing:".07em",marginBottom:8}}>{s.l}</div>
                            <div style={{fontFamily:"'IBM Plex Mono',monospace",fontSize:24,fontWeight:800,color:s.c,lineHeight:1,marginBottom:4}}>{s.v}</div>
                            <div style={{fontSize:12,color:"var(--text4)"}}>{s.sub}</div>
                          </div>
                        ))}
                      </div>

                      {/* Entries table */}
                      <div className="card" style={{padding:0,overflow:"hidden"}}>
                        <div style={{background:"var(--bg0)",borderBottom:"1px solid var(--border)",padding:"12px 20px",display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                          <div style={{fontSize:14,fontWeight:700,color:"var(--text0)"}}>{adminBrowseEntries.length} Entries</div>
                          {canEditAny&&isAdmin&&selectedEntries.size>0&&(
                            <button className="bd" style={{fontSize:13,padding:"5px 14px"}} onClick={bulkDeleteEntries}>
                              ًں—‘ Delete {selectedEntries.size} selected
                            </button>
                          )}
                        </div>
                        <div style={{maxHeight:520,overflowY:"auto"}}>
                          <table>
                            <thead><tr>
                              {canEditAny&&isAdmin&&<th style={{width:36,paddingLeft:12}}>
                                <input type="checkbox" onChange={e=>setSelectedEntries(e.target.checked?new Set(adminBrowseEntries.map(e=>e.id)):new Set())}
                                  checked={selectedEntries.size===adminBrowseEntries.length&&adminBrowseEntries.length>0}
                                  style={{cursor:"pointer",accentColor:"var(--info)"}}/>
                              </th>}
                              <th>Date</th><th>Engineer</th><th>Project</th><th>Task</th><th>Activity</th>
                              <th style={{textAlign:"right"}}>Hrs</th><th>Type</th>
                              {canEditAny&&<th style={{width:80}}></th>}
                            </tr></thead>
                            <tbody>
                              {adminBrowseEntries.length===0&&<tr><td colSpan={9} style={{textAlign:"center",color:"var(--text4)",padding:28,fontSize:14}}>No entries match the current filter</td></tr>}
                              {adminBrowseEntries.map(e=>{
                                const eng=engineers.find(x=>x.id===e.engineer_id);
                                const proj=projects.find(x=>x.id===e.project_id);
                                const isLeave=e.entry_type==="leave";
                                return(
                                  <tr key={e.id} style={{background:selectedEntries.has(e.id)?"#0ea5e910":undefined}}>
                                    {canEditAny&&isAdmin&&<td style={{paddingLeft:12}} onClick={ev=>ev.stopPropagation()}>
                                      <input type="checkbox" checked={selectedEntries.has(e.id)}
                                        onChange={()=>setSelectedEntries(prev=>{const s=new Set(prev);s.has(e.id)?s.delete(e.id):s.add(e.id);return s;})}
                                        style={{cursor:"pointer",accentColor:"var(--info)"}}/>
                                    </td>}
                                    <td style={{fontFamily:"'IBM Plex Mono',monospace",fontSize:13}}>{e.date}</td>
                                    <td>
                                      <div style={{display:"flex",alignItems:"center",gap:6}}>
                                        <div className="av" style={{width:24,height:24,fontSize:10,flexShrink:0}}>{eng?.name?.slice(0,2).toUpperCase()||"?"}</div>
                                        <span style={{fontWeight:500}}>{eng?.name||"â€”"}</span>
                                      </div>
                                    </td>
                                    <td>{isLeave
                                      ? <span style={{color:"#fb923c",fontWeight:600}}>{e.leave_type||"Leave"}</span>
                                      : proj ? <span><span style={{color:"var(--info)",fontWeight:600}}>{proj.name}</span> <span style={{fontFamily:"'IBM Plex Mono',monospace",fontSize:12,color:"var(--text4)"}}>({proj.id})</span></span>
                                      : <span style={{color:"var(--text4)"}}>â€”</span>}
                                    </td>
                                    <td style={{color:"var(--text2)"}}>{e.task_type||"â€”"}</td>
                                    <td style={{color:"var(--text3)",fontStyle:"italic",maxWidth:140,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{e.activity||"â€”"}</td>
                                    <td style={{textAlign:"right",fontFamily:"'IBM Plex Mono',monospace",color:"var(--info)",fontWeight:700}}>{e.hours}h</td>
                                    <td><span style={{fontSize:12,padding:"2px 7px",borderRadius:4,fontWeight:700,
                                      background:isLeave?"#7c2d1230":"#022c2230",
                                      color:isLeave?"#fb923c":"#34d399"}}>{e.entry_type}</span>
                                    </td>
                                    {canEditAny&&<td><div style={{display:"flex",gap:4}}>
                                      <button className="be" style={{fontSize:12}} onClick={()=>setEditEntry({...e,projectId:e.project_id,type:e.entry_type,taskCategory:e.task_category||"Engineering",taskType:e.task_type||"Basic Engineering",leaveType:e.leave_type||"Annual Leave"})}>âœژ</button>
                                      {isAdmin&&<button className="bd" style={{fontSize:12}} onClick={()=>deleteEntry(e.id,e.engineer_id)}>âœ•</button>}
                                    </div></td>}
                                  </tr>
                                );
                              })}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    </div>
                    );
                  })()}
                </div>
              )}


              {/* â•گâ•گ FINANCE MODULE â•گâ•گ */}
              {adminTab==="finance"&&(isAdmin||isAcct||isSenior)&&(
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
                  isAdmin={isAdmin} isSenior={isSenior} isLead={isLead} isAcct={isAcct}
                  journalEntries={journalEntries} setJournalEntries={setJournalEntries}
                  fixedAssets={fixedAssets} journalLoading={journalLoading}
                  assetsLoading={assetsLoading} finSubTab={finSubTab} setFinSubTab={setFinSubTab}
                  accounts={accounts} showToast={showToast} logAction={logAction} supabase={supabase}
                  showConfirm={showConfirm}/>
              )}

              {/* â•گâ•گ FUNCTIONS / ACTIVITIES â•گâ•گ */}
              {adminTab==="functions"&&(isAdmin||isLead||isAcct||isSenior)&&(
                <FunctionsTab
                  entries={mySubEngIds ? entries.filter(e=>mySubEngIds.has(String(e.engineer_id))) : entries}
                  engineers={mySubEngIds ? engineers.filter(e=>mySubEngIds.has(String(e.id))) : engineers}
                  funcYear={funcYear} setFuncYear={setFuncYear}
                  funcEngId={funcEngId} setFuncEngId={setFuncEngId}
                  deleteEntry={deleteEntry} isAdmin={isAdmin} isLead={isLead} isAcct={isAcct} year={year}
                  setShowFuncModal={setShowFuncModal}
                  isMonthFrozen={isMonthFrozen}
                />
              )}

              {/* â•گâ•گ KPI DASHBOARD â•گâ•گ */}
              {adminTab==="kpis"&&(
                <KPIsTab
                  entries={entries}
                  engineers={mySubEngIds ? engineers.filter(e=>mySubEngIds.has(String(e.id))) : engineers}
                  projects={projects}
                  kpiYear={kpiYear} setKpiYear={setKpiYear}
                  kpiEngId={kpiEngId} setKpiEngId={setKpiEngId}
                  kpiNotes={kpiNotes} setKpiNotes={setKpiNotes}
                  isAdmin={isAdmin} isLead={isLead} isAcct={isAcct}
                  isEngineer={!isAdmin&&!isLead&&!isAcct&&!isSenior}
                  myProfile={myProfile}
                  year={year} notifications={notifications}
                  onDismissNotif={dismissNotification}
                  alertDay={alertDay} setAlertDay={setAlertDay} alertTime={alertTime} setAlertTime={setAlertTime} insertNotif={insertNotif} setNotifHistory={setNotifHistory} logAction={logAction}
                  showToast={showToast} supabase={supabase}
                  setEntries={setEntries} setNotifications={setNotifications}
                />
              )}


              {/* â•گâ•گ PROJECT TRACKER â•گâ•گ */}
              {adminTab==="tracker"&&(
                <ProjectTracker
                  projects={projects}
                  activities={activities}
                  subprojects={subprojects}
                  entries={entries}
                  engineers={engineers}
                  isAdmin={isAdmin}
                  isLead={isLead}
                  isAcct={isAcct}
                  activitiesLoaded={activitiesLoaded}
                  setActivities={setActivities}
                  setProjects={setProjects}
                  setNotifications={setNotifications}
                  showToast={showToast}
                  logAction={logAction}
                  insertNotif={insertNotif}
                  showConfirm={showConfirm}
                  myProfile={myProfile}
                  isEngineerRole={!isAdmin&&!isLead&&!isAcct&&!isSenior}
                  onActivityComment={appHandleActivityComment}
                  trackerProj={trackerProj}   setTrackerProj={setTrackerProj}
                  trackerSub={trackerSub}     setTrackerSub={setTrackerSub}
                  trackerSearch={trackerSearch} setTrackerSearch={setTrackerSearch}
                  trackerStatus={trackerStatus} setTrackerStatus={setTrackerStatus}
                  actClipboard={actClipboard}  setActClipboard={setActClipboard}
                />
              )}

              {/* SETTINGS */}
              {adminTab==="settings"&&(
                <div style={{maxWidth:760,display:"grid",gap:16}}>

                  {/* â”€â”€ YOUR ROLE â”€â”€ */}
                  {(()=>{
                    const roleMap={
                      admin:      {label:"Admin",           color:"#34d399", desc:"Full system access. Manage engineers, projects, timesheets, Finance, and all settings. Only role that can approve/reject vacations, cancel approved leave, and access the Activity Log. Receives all broadcast alerts (new signups, overdue activities, timesheet alerts)."},
                      lead:       {label:"Lead Engineer",   color:"var(--info)", desc:"Manage your direct-report engineers (org-chart subtree). Post and edit hours for your team, manage tracker activities, view scoped reports, and comment on project activities. Receives timesheet alerts and overdue alerts for your team."},
                      accountant: {label:"Accountant",      color:"#a78bfa", desc:"Full Finance module read and write access â€” post and edit journal entries, manage payroll, view P&L, balance sheet, fixed assets, and export invoices. View all engineer hours and generate all reports. Submit your own vacation leave and receive bell notifications when approved or rejected. Cannot post work timesheet entries for engineers."},
                      senior_management:{label:"Senior Management",color:"#fb923c",desc:"Read-only access across all dashboards, reports, and the project tracker. Export PDFs. Cannot add, edit, or delete any data. No notification bell."},
                      engineer:   {label:"Engineer",        color:"var(--text3)", desc:"Post your own hours on assigned projects, view your vacation balance and KPI score, and comment on your assigned activities. You receive bell notifications for vacation approvals/rejections and activity comments addressed to you."},
                    };
                    const me=roleMap[myProfile?.role_type]||roleMap.engineer;
                    return(
                    <div className="card" style={{border:`1px solid ${me.color}30`,padding:"18px 20px"}}>
                      <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:10}}>
                        <span className="role-badge" style={{background:me.color+"20",color:me.color,fontSize:13,padding:"3px 10px"}}>{me.label}</span>
                        <span style={{fontSize:14,color:"var(--text3)"}}>Your current role</span>
                      </div>
                      <div style={{fontSize:14,color:"var(--text1)",lineHeight:1.65}}>{me.desc}</div>
                    </div>);
                  })()}

                  {/* â”€â”€ HOW TO USE â”€â”€ */}
                  <div className="card">
                    <div style={{fontSize:15,fontWeight:700,color:"var(--text0)",marginBottom:14}}>How to Use EC-ERP</div>
                    <div style={{display:"grid",gap:10}}>
                      {[
                        {title:"Post Work Hours",           show:!isAcct&&!isSenior,             color:"var(--info)",  text:"Go to Post Hours â†’ click any day cell â†’ choose Work â†’ select Project â†’ Sub-site (optional) â†’ Work Group & Category â†’ Activity â†’ enter Hours and Notes. Press âœ“ Post Hours to save. A description is required for a good KPI score. You can only post on projects you are assigned to."},
                        {title:"Submit Vacation / Leave",   show:!isSenior,                       color:"#34d399",      text:"Go to Post Hours â†’ click the day â†’ choose Leave â†’ select Annual Leave (or other type) â†’ Save. Annual Leave is submitted as PENDING APPROVAL and sent to your admin. You will receive a bell notification (ًں”” top of sidebar) when your request is approved or rejected. Your remaining balance (21 days/year default) updates automatically in the stats bar once approved. Accountants follow the same process."},
                        {title:"Notification Bell",         show:true,                            color:"#a78bfa",      text:"The ًں”” bell in the top of the sidebar shows your personal notifications. Active tab: unread notifications â€” click أ— to dismiss (moves to History). History tab: last 3 months of read notifications (up to 500). Broadcasts (timesheet alerts, new signups) are visible to admin and lead only. Notifications refresh every 15 seconds automatically."},
                        {title:"Undo a Delete",             show:!isSenior,                       color:"#fb923c",      text:"After deleting any time entry you get a 3-second undo window. A toast appears at the bottom of the screen with an â†© Undo button. Click it before the toast disappears to restore the entry. After 3 seconds the delete is committed to the database and cannot be undone. Vacation entries (approved or pending) follow the same 3-second window."},
                        {title:"View & Comment on Activities", show:!isAcct&&!isSenior,          color:"#a78bfa",      text:"Engineers: My Work â†’ My Activities â€” shows only your assigned projects. Click the ًں’¬ button on any activity to open the comment thread. Type and press Enter. Lead & Admin: Tracker tab â€” click any activity card to edit or comment. Comments notify the assigned engineer, project leader, and all admins (excluding the commenter). Comments survive activity saves and appear in PDF exports."},
                        {title:"Project Tracker",           show:isAdmin||isLead,                color:"#a78bfa",      text:"Admin/Lead Panel â†’ Tracker. Each project shows activity cards grouped by category. Click any card to edit status, progress, deadline, and assignment. The COMMENTS section in the edit modal is the main communication channel â€” real-time, timestamped, and role-attributed. Export full project PDFs or per-sub-site PDFs from the Tracker Progress Report."},
                        {title:"Approve / Reject Vacations",show:isAdmin||isLead,                color:"#34d399",      text:"Two paths: (1) KPIs tab â†’ pending vacation section at top â€” shows all pending requests with Approve/Reject buttons. (2) Notification Bell â†’ pending vacations appear at the top of the Active tab with inline âœ“ Approve and âœ• Reject buttons. After actioning, the vacation_request notification moves to your History tab. The engineer receives a bell notification with the outcome."},
                        {title:"Timesheet Posting Alert",   show:isAdmin||isLead,                color:"#fb923c",      text:"Admin/Lead Panel â†’ KPIs tab â†’ scroll to the âڈ° Timesheet Posting Alert box. Select the day of the week and the hour. On that day after that hour, if any active engineer hasn't posted hours this week, an alert fires into admin and lead bells. Engineers on approved leave are automatically skipped. Settings are saved per-browser via localStorage."},
                        {title:"Reports & PDF Export",      show:canReport,                      color:"var(--info)",  text:"Reports & PDF in the sidebar. Includes: Team Utilization, Assignment Report, Timesheets, Task Analysis, Tracker Progress (with per-sub-site export), Vacation & Leave, Monthly Management, Invoice Export. Leads see only their team's data. Year selectors show current year آ± 2 and update automatically each year."},
                        {title:"Finance Module",            show:isAdmin||isAcct,                color:"#a78bfa",      text:"Admin/Finance Panel â†’ Finance. Tabs: Journal (double-entry bookkeeping), Balance Sheet, Expenses, Cash Custody, P&L, Payroll, Fixed Assets, Tax & Social, and Reports. All figures are EGP. The Guide tab has step-by-step month-close instructions. Only admin and accountant can edit â€” senior management is view-only."},
                        {title:"KPI Score",                 show:!isAcct&&!isSenior,             color:"#fb923c",      text:"My KPIs (or Admin â†’ KPIs). Score is out of 120 â€” covering billable hours, coverage, note quality, function entries, project diversity, and timesheet compliance. Posting hours without a description reduces your note quality score. Aim for 96+ for High Performer. KPI notes are saved automatically and persist across sessions."},
                        {title:"Org Chart & Lead Scoping",  show:isAdmin,                        color:"var(--info)",  text:"Team page â†’ Org Chart tab â†’ Edit Chart to arrange cards. The org chart controls lead scoping â€” a lead sees only engineers in their subtree across all tabs (Entries, Functions, Reports, KPIs). Engineers' direct lead is used for vacation request routing. Setting the org chart correctly is required before enabling leads."},
                        {title:"Change Password",           show:true,                            color:"var(--text3)", text:"Your avatar / name button at the bottom of the sidebar â†’ Change Password. Enter your new password twice and confirm. Takes effect immediately â€” you do not need to log out."},
                      ].filter(i=>i.show!==false).map(item=>(
                        <div key={item.title} style={{background:"var(--bg2)",borderRadius:8,padding:"12px 14px",borderLeft:`3px solid ${item.color}`}}>
                          <div style={{fontSize:13,fontWeight:700,color:item.color,marginBottom:5}}>{item.title}</div>
                          <div style={{fontSize:13,color:"var(--text2)",lineHeight:1.6}}>{item.text}</div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* â”€â”€ WHAT'S NEW â”€â”€ */}
                  <div className="card">
                    <div style={{fontSize:15,fontWeight:700,color:"var(--text0)",marginBottom:4}}>What's New</div>
                    <div style={{fontSize:12,color:"var(--text4)",marginBottom:14}}>v6 â€” April 2026 feature release</div>
                    <div style={{display:"grid",gap:8}}>
                      {[
                        {tag:"Bell",      color:"#a78bfa", text:"Single notification bell (ًں””) in the sidebar header â€” single bell for all notifications. Active tab shows unread, History tab shows last 3 months of dismissed notifications. Bell refreshes every 15 seconds and on login."},
                        {tag:"Vacation",  color:"#34d399", text:"Approve and reject vacations directly from the bell dropdown or the KPIs tab. After actioning, the request moves to admin History. Engineer receives vacation_approved or vacation_rejected bell notification instantly. Admin deleting a pending vacation now also notifies the requester."},
                        {tag:"Vacation",  color:"#34d399", text:"Approved vacation lock â€” only admin can delete an approved annual leave. Non-admin roles see a clear message directing them to contact admin. Engineers and leads cannot bypass this lock."},
                        {tag:"Notify",    color:"#34d399", text:"Activity notifications: comment posted â†’ notifies assigned engineer, project leader, and all admins (commenter excluded). Status/progress/deadline changes by lead â†’ admin notified. Activity assigned â†’ engineer notified. All scoped to recipient â€” no user sees another person's notifications."},
                        {tag:"Notify",    color:"#34d399", text:"Timesheet posting alert: configurable day + hour. Admin and lead receive a bell notification listing engineers who haven't posted hours. Engineers on approved leave are automatically excluded. Settings saved in browser localStorage."},
                        {tag:"Comments",  color:"#a78bfa", text:"Threaded comment system on every tracker activity â€” timestamped, role-attributed, survives activity saves, visible in PDFs. Engineers can comment on their assigned activities from My Work â†’ My Activities."},
                        {tag:"Undo",      color:"#fb923c", text:"3-second undo window on all time entry deletes (single and bulk). Entry disappears immediately, undo toast appears â€” click â†© Undo within 3 seconds to restore. After 3 seconds the DB delete commits and notifications fire."},
                        {tag:"UI",        color:"var(--info)", text:"All year selectors are now dynamic (current year آ± 2) and consistent styling across all tabs. Timesheet alert box redesigned with labeled columns and full day names. Navigation uses SVG icons."},
                        {tag:"Projects",  color:"#fb923c", text:"Project Leader field â€” set any lead or admin as the project's responsible leader. Auto-added to team, appears on all cards, reports, and PDFs. Receives comment notifications for all activities in their project."},
                        {tag:"Reports",   color:"var(--info)", text:"Tracker Progress Report: Active-only default with toggle for On Hold & Completed. Per-sub-site PDF export. Assignment Report: sourced from assigned_engineers list. All reports scoped to lead's org subtree."},
                        {tag:"Scoping",   color:"var(--text3)", text:"Lead scoping via BFS org chart â€” all entries, functions, reports, KPIs, and PDFs filtered to lead's subtree. Set the org chart correctly to enable this."},
                      ].map((item,i)=>(
                        <div key={i} style={{display:"flex",gap:10,alignItems:"flex-start",padding:"8px 0",borderBottom:"1px solid var(--border3)"}}>
                          <span style={{fontSize:11,padding:"2px 8px",borderRadius:4,background:item.color+"18",color:item.color,fontWeight:700,flexShrink:0,marginTop:1}}>{item.tag}</span>
                          <div style={{fontSize:13,color:"var(--text2)",lineHeight:1.55}}>{item.text}</div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* â”€â”€ ROLE ACCESS TABLE â€” admin only â”€â”€ */}
                  {isAdmin&&(<div className="card">
                    <div style={{fontSize:15,fontWeight:700,color:"var(--text0)",marginBottom:14}}>Role Access Reference</div>
                    <div style={{display:"grid",gap:8}}>
                      {[
                        {role:"Engineer",         color:"var(--text3)", perms:"Post own hours on assigned projects آ· Submit vacation (Annual Leave + other types) آ· View own vacation balance & KPI score آ· Comment on own assigned activities آ· Bell: vacation approved/rejected + activity comments"},
                        {role:"Lead Engineer",    color:"var(--info)",  perms:"All engineer permissions آ· Post/edit hours for team (org subtree) آ· Full tracker (edit, comment, add activities) آ· Approve/reject vacations آ· Scoped reports & PDFs آ· Bell: all of above + timesheet alerts + overdue alerts for team"},
                        {role:"Accountant",       color:"#a78bfa",      perms:"Finance module full access (journal, payroll, P&L, balance sheet, invoices) آ· View all hours & reports آ· Submit own vacation آ· Bell: vacation approved/rejected آ· Cannot post work timesheet entries"},
                        {role:"Senior Management",color:"#fb923c",      perms:"Read-only: all dashboards, reports, tracker, finance آ· Export PDFs آ· No data entry آ· No notifications bell"},
                        {role:"Admin",            color:"#34d399",      perms:"Full system access آ· Manage all engineers & projects آ· Approve/reject/cancel vacations آ· Finance & all reports آ· Activity Log آ· Timesheet posting alert آ· Bell: all notifications including broadcasts (new signup, alerts, overdue)"},
                      ].map(r=>(
                        <div key={r.role} style={{background:"var(--bg2)",border:`1px solid ${r.color}25`,borderRadius:7,padding:"9px 13px",display:"flex",gap:12,alignItems:"flex-start"}}>
                          <span className="role-badge" style={{background:r.color+"20",color:r.color,flexShrink:0,marginTop:1}}>{r.role}</span>
                          <div style={{fontSize:13,color:"var(--text3)",lineHeight:1.5}}>{r.perms}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                  )}

                  {/* â”€â”€ SQL MIGRATIONS (admin only) â”€â”€ */}
                  {isAdmin&&(
                  <div className="card" style={{borderColor:"#f59e0b40"}}>
                    <div style={{fontSize:15,fontWeight:700,color:"var(--text0)",marginBottom:4}}>Required SQL Migrations</div>
                    <div style={{fontSize:12,color:"var(--text4)",marginBottom:14}}>Run these once in your Supabase SQL editor â€” safe to re-run (IF NOT EXISTS)</div>
                    {[
                      {label:"Notifications engineer_id", sql:"ALTER TABLE notifications ADD COLUMN IF NOT EXISTS engineer_id BIGINT REFERENCES engineers(id); CREATE INDEX IF NOT EXISTS idx_notifications_eng ON notifications(engineer_id);", desc:"Required for the notification bell. Run this first."},
                      {label:"Backfill engineer_id",      sql:"UPDATE notifications SET engineer_id = CAST(meta->>'engineer_id' AS BIGINT) WHERE engineer_id IS NULL AND meta->>'engineer_id' IS NOT NULL; UPDATE notifications SET engineer_id = CAST(meta->>'recipient_engineer_id' AS BIGINT) WHERE engineer_id IS NULL AND meta->>'recipient_engineer_id' IS NOT NULL;", desc:"Run after adding the column to backfill existing notifications."},
                      {label:"Activity Comments column",  sql:"ALTER TABLE project_activities ADD COLUMN IF NOT EXISTS comments JSONB DEFAULT '[]';", desc:"Enables threaded comments on activities."},
                      {label:"Assigned Engineers column", sql:"ALTER TABLE projects ADD COLUMN IF NOT EXISTS assigned_engineers JSONB DEFAULT '[]';", desc:"Enables team assignment and auto-assign on activity creation."},
                      {label:"Project Leader column",     sql:"ALTER TABLE projects ADD COLUMN IF NOT EXISTS project_leader TEXT;", desc:"Enables the Project Leader field and notification routing."},
                      {label:"Frozen Months table", sql:"CREATE TABLE IF NOT EXISTS frozen_months (id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY, year INTEGER NOT NULL, month INTEGER NOT NULL, frozen_at TIMESTAMPTZ DEFAULT NOW(), frozen_by TEXT, UNIQUE(year,month));", desc:"Required for the month freeze feature. After creating, enable RLS in Supabase Dashboard â†’ Table Editor â†’ frozen_months â†’ RLS â†’ Add policy: allow all authenticated users (USING true WITH CHECK true)."},
                    ].map(m=>(
                      <div key={m.label} style={{background:"var(--bg2)",borderRadius:7,padding:"10px 14px",marginBottom:8,border:"1px solid var(--border3)"}}>
                        <div style={{fontSize:13,fontWeight:700,color:"var(--text1)",marginBottom:3}}>{m.label}</div>
                        <div style={{fontSize:12,color:"var(--text3)",marginBottom:6}}>{m.desc}</div>
                        <code style={{display:"block",background:"var(--bg0)",padding:"8px 12px",borderRadius:5,fontSize:12,
                          color:"#34d399",fontFamily:"'IBM Plex Mono',monospace",lineHeight:1.5,
                          border:"1px solid var(--border3)",userSelect:"all",cursor:"text"}}>
                          {m.sql}
                        </code>
                      </div>
                    ))}
                  </div>)}

                </div>
              )}

              {/* ACTIVITY LOG */}
              {adminTab==="actlog"&&isAdmin&&(
                <ActivityLogTab
                  activityLog={activityLog}
                  archiveLog={archiveLog}
                  archiveLoaded={archiveLoaded}
                  loading={logLoading}
                  archiveLoading={archiveLoading}
                  retentionDays={retentionDays}
                  setRetentionDays={setRetentionDays}
                  onRefresh={()=>{
                    setLogLoading(true);
                    (async()=>{
                      const rows=[];let from=0;const batch=1000;
                      while(true){
                        const{data,error}=await supabase.from("activity_log").select("*").order("created_at",{ascending:false}).range(from,from+batch-1);
                        if(error||!data?.length) break;
                        rows.push(...data);
                        if(data.length<batch) break;
                        from+=batch;
                        if(rows.length>=5000) break;
                      }
                      setActivityLog(rows);setLogLoading(false);
                    })();
                  }}
                  onArchive={async()=>{
                    showConfirm(`Move activity log entries older than ${retentionDays} days to the archive? The live log will be faster afterwards.`, async()=>{
                      const cutoff=new Date();cutoff.setDate(cutoff.getDate()-retentionDays);
                      const cutoffISO=cutoff.toISOString();
                      const cutoffDate=cutoff.toISOString().slice(0,10);

                      const toArchive=[];

                      // Pass 1: entries with real timestamp older than cutoff
                      let from=0;
                      while(true){
                        const{data,error}=await supabase.from("activity_log")
                          .select("*").lt("created_at",cutoffISO)
                          .order("created_at",{ascending:true}).range(from,from+999);
                        if(error){showToast("Archive fetch error: "+error.message,false);return;}
                        if(!data?.length) break;
                        toArchive.push(...data);
                        if(data.length<1000) break;
                        from+=1000;
                      }

                      // Pass 2: entries with NULL created_at â€” these are legacy rows (pre-timestamp fix)
                      // NULL entries cannot be older or newer than anything, so archive them all
                      {
                        let nf=0;
                        while(true){
                          const{data,error}=await supabase.from("activity_log")
                            .select("*").is("created_at",null).range(nf,nf+999);
                          if(error||!data?.length) break;
                          toArchive.push(...data);
                          if(data.length<1000) break;
                          nf+=1000;
                        }
                      }

                      // Pass 3: client-side fallback â€” check all rows in case timestamptz stored differently
                      if(!toArchive.length){
                        let af=0;
                        const allRows=[];
                        while(true){
                          const{data,error}=await supabase.from("activity_log")
                            .select("*").order("id",{ascending:true}).range(af,af+999);
                          if(error||!data?.length) break;
                          allRows.push(...data);
                          if(data.length<1000) break;
                          af+=1000;
                          if(allRows.length>=10000) break;
                        }
                        const seen=new Set(toArchive.map(r=>r.id));
                        allRows.forEach(r=>{
                          if(seen.has(r.id)) return;
                          if(!r.created_at){ toArchive.push(r); return; } // null = definitely old
                          if(r.created_at.slice(0,10)<cutoffDate) toArchive.push(r);
                        });
                      }

                      if(!toArchive.length){
                        showToast(`No entries older than ${retentionDays} days to archive. All ${activityLog.length} entries are recent.`,false);
                        return;
                      }

                      // Insert into archive (strip id so DB gives new one)
                      let insertOk=0;
                      for(let i=0;i<toArchive.length;i+=500){
                        const chunk=toArchive.slice(i,i+500).map(({id,...rest})=>rest);
                        const{error}=await supabase.from("activity_log_archive").insert(chunk);
                        if(error){showToast("Archive insert error: "+error.message,false);return;}
                        insertOk+=chunk.length;
                      }
                      // Delete from live log by id
                      const ids=toArchive.map(r=>r.id);
                      let deletedOk=0;
                      for(let i=0;i<ids.length;i+=500){
                        const chunk=ids.slice(i,i+500);
                        const{error}=await supabase.from("activity_log").delete().in("id",chunk);
                        if(error){showToast("Archive delete error: "+error.message,false);return;}
                        deletedOk+=chunk.length;
                      }
                      showToast(`Archived ${insertOk} events, removed ${deletedOk} from live log âœ“`);
                      logAction("EXPORT","Auth",`Archived activity log â€” retention ${retentionDays}d`,{archived:insertOk,deleted:deletedOk});
                      // Reload live log
                      setLogLoading(true);
                      const rows=[];let rfrom=0;
                      while(true){
                        const{data:liveData,error}=await supabase.from("activity_log").select("*").order("created_at",{ascending:false}).range(rfrom,rfrom+999);
                        if(error||!liveData?.length) break;
                        rows.push(...liveData);
                        if(liveData.length<1000) break;
                        rfrom+=1000;
                        if(rows.length>=5000) break;
                      }
                      setActivityLog(rows);setLogLoading(false);
                      setArchiveLog([]);setArchiveLoaded(false);
                    },{title:"Archive Activity Log",confirmLabel:"Archive Now",danger:false,icon:"ًں—„"});
                  }}
                  onLoadArchive={()=>{
                    setArchiveLoading(true);
                    (async()=>{
                      const rows=[];let from=0;const batch=1000;
                      while(true){
                        const{data,error}=await supabase.from("activity_log_archive").select("*").order("created_at",{ascending:false}).range(from,from+batch-1);
                        if(error){showToast("Archive load error: "+error.message,false);break;}
                        if(!data?.length) break;
                        rows.push(...data);
                        if(data.length<batch) break;
                        from+=batch;
                        if(rows.length>=5000) break;
                      }
                      setArchiveLog(rows);setArchiveLoaded(true);setArchiveLoading(false);
                    })();
                  }}
                  onPruneArchive={async()=>{
                    showConfirm("Permanently delete all archive entries older than 1 year? This cannot be undone.", async()=>{
                      const cutoff=new Date();cutoff.setFullYear(cutoff.getFullYear()-1);
                      const cutoffISO=cutoff.toISOString();
                      const{error,count}=await supabase.from("activity_log_archive")
                        .delete().lt("created_at",cutoffISO);
                      if(error){showToast("Prune error: "+error.message,false);return;}
                      showToast(`Pruned archive entries older than 1 year âœ“`);
                      logAction("DELETE","Auth","Pruned activity archive â€” entries older than 365d",{});
                      setArchiveLog([]); setArchiveLoaded(false);
                    },{title:"Prune Archive",confirmLabel:"Prune Now"});
                  }}
                />
              )}
            </div>
          )}




          {/* â•گâ•گâ•گâ•گ IMPORT EXCEL â•گâ•گâ•گâ•گ */}
          {view==="import"&&isAdmin&&(
            <div>
              <div style={{marginBottom:20}}>
                <div style={{fontSize:11,fontWeight:700,color:"var(--text4)",textTransform:"uppercase",letterSpacing:".1em",marginBottom:4}}>IMPORT</div>
                <h1 style={{fontSize:26,fontWeight:800,color:"var(--text0)",lineHeight:1}}>Import Excel Timesheets</h1>
                <div style={{display:"flex",alignItems:"center",gap:10,marginTop:4}}>
                  <p style={{color:"var(--text4)",fontSize:14}}>Upload ENEVOEGY timesheet files آ· Engineers &amp; projects created automatically</p>
                  <span style={{fontSize:13,padding:"2px 8px",borderRadius:3,background:xlsxReady?"#05603a30":"var(--warn-bg)",color:xlsxReady?"#34d399":"#fb923c",fontWeight:700,fontFamily:"'IBM Plex Mono',monospace"}}>
                    {xlsxReady?"âœ“ XLSX READY":"âڈ³ LOADING XLSX..."}
                  </span>
                </div>
              </div>
              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:16}}>
                {/* Upload panel */}
                <div>
                  <div className="card" style={{marginBottom:14}}>
                    <h3 style={{fontSize:15,fontWeight:700,color:"var(--text0)",marginBottom:12}}>Upload Timesheet Files</h3>
                    <div style={{border:"2px dashed var(--border3)",borderRadius:8,padding:"28px",textAlign:"center",marginBottom:14,cursor:"pointer",transition:"border-color .2s"}}
                      onDragOver={e=>{e.preventDefault();e.currentTarget.style.borderColor="var(--info)";}}
                      onDragLeave={e=>{e.currentTarget.style.borderColor="var(--border)";}}
                      onDrop={e=>{e.preventDefault();e.currentTarget.style.borderColor="var(--border)";const f=[...e.dataTransfer.files].filter(f=>f.name.endsWith(".xlsx")||f.name.endsWith(".xls"));setImportFiles(prev=>[...prev,...f]);}}
                      onClick={()=>document.getElementById("xlsxInput").click()}>
                      
                      <div style={{fontSize:15,fontWeight:600,color:"var(--text0)",marginBottom:4}}>Drop .xlsx files here or click to browse</div>
                      <div style={{fontSize:13,color:"var(--text4)"}}>Supports ENEVOEGY timesheet format آ· Multiple files at once</div>
                      <input id="xlsxInput" type="file" accept=".xlsx,.xls" multiple style={{display:"none"}}
                        onChange={e=>setImportFiles(prev=>[...prev,...Array.from(e.target.files)])}/>
                    </div>
                    {importFiles.length>0&&(
                      <div>
                        <div style={{fontSize:13,color:"var(--text2)",marginBottom:8,fontWeight:700}}>{importFiles.length} FILE{importFiles.length>1?"S":""} QUEUED:</div>
                        {importFiles.map((f,i)=>(
                          <div key={i} style={{display:"flex",alignItems:"center",justifyContent:"space-between",background:"var(--bg2)",borderRadius:5,padding:"7px 10px",marginBottom:5}}>
                            <div>
                              <div style={{fontSize:14,fontWeight:600}}>{f.name}</div>
                              <div style={{fontSize:13,color:"var(--text4)"}}>{(f.size/1024).toFixed(1)} KB</div>
                            </div>
                            <button className="bd" style={{fontSize:13}} onClick={()=>setImportFiles(prev=>prev.filter((_,j)=>j!==i))}>âœ•</button>
                          </div>
                        ))}
                        {!xlsxReady&&<div style={{background:"var(--warn-bg)",border:"1px solid #fb923c30",borderRadius:6,padding:"8px 12px",fontSize:13,color:"#fb923c",marginBottom:8}}>âڈ³ XLSX library loading... wait a moment then try again.</div>}
                        <div style={{display:"flex",gap:10,marginTop:12}}>
                          <button className="bp" style={{flex:1,justifyContent:"center"}} disabled={importing||!xlsxReady} onClick={()=>importTimesheets(importFiles)}>
                            {importing?"âڈ³ Importing...":!xlsxReady?"âڈ³ Loading XLSX...":"â¬† Import All Files"}
                          </button>
                          <button className="bg" onClick={()=>{setImportFiles([]);setImportLog([]);}}>Clear</button>
                        </div>
                      </div>
                    )}
                  </div>
                  <div className="card">
                    <h3 style={{fontSize:14,fontWeight:700,color:"var(--text0)",marginBottom:10}}>What Gets Imported</h3>
                    {[
                      ["â€¢","Engineer","Created automatically from Name + Email in the sheet header"],
                      ["â€¢","Work Hours","Daily task + hours + project mapped to entries"],
                      ["â€¢","Leave Days","Public holidays and leave days detected automatically"],
                      ["â€¢","Projects","Matched by project name â€” assign missing ones after import"],
                      ["â€¢","Task Types","Auto-detected from task description (SCADA, HMI, PLC, etc.)"],
                    ].map(([icon,label,desc])=>(
                      <div key={label} style={{display:"flex",gap:10,marginBottom:10}}>
                        <div style={{fontSize:16,width:24,flexShrink:0}}>{icon}</div>
                        <div><div style={{fontSize:14,fontWeight:600}}>{label}</div><div style={{fontSize:13,color:"var(--text4)",lineHeight:1.5}}>{desc}</div></div>
                      </div>
                    ))}
                    <div style={{background:"var(--warn-bg)",border:"1px solid #fb923c30",borderRadius:6,padding:"9px 12px",fontSize:13,color:"#fb923c",marginTop:8}}>
                      âڑ  After importing, go to Admin â†’ All Entries to review and assign project numbers to any unmatched entries.
                    </div>
                  </div>
                </div>
                {/* Log panel */}
                <div className="card" style={{maxHeight:600,overflowY:"auto"}}>
                  <h3 style={{fontSize:14,fontWeight:700,color:"var(--text0)",marginBottom:12}}>Import Log</h3>
                  {importLog.length===0&&<div style={{color:"var(--text4)",fontSize:14,textAlign:"center",padding:30}}>No import started yet</div>}
                  {importLog.map((entry,i)=>(
                    <div key={i} style={{display:"flex",gap:8,marginBottom:5,fontSize:13,padding:"4px 0",borderBottom:"1px solid var(--border2)"}}>
                      <span style={{width:8,height:8,borderRadius:"50%",marginTop:4,flexShrink:0,background:entry.type==="ok"?"#34d399":entry.type==="error"?"#f87171":entry.type==="warn"?"#fb923c":"var(--info)"}}/>
                      <span style={{color:entry.type==="ok"?"#34d399":entry.type==="error"?"#f87171":entry.type==="warn"?"#fb923c":"var(--text2)",lineHeight:1.4}}>{entry.msg}</span>
                    </div>
                  ))}
                  {importing&&<div style={{textAlign:"center",padding:10,color:"var(--info)",fontFamily:"'IBM Plex Mono',monospace",fontSize:13}}>Processingâ€¦</div>}
                </div>
              </div>
            </div>
          )}

          </>}
        </div>
      </div>

      {/* â•گâ•گâ•گâ•گ MODALS â•گâ•گâ•گâ•گ */}

      {/* Add Entry */}
      {modalDate&&(()=>{
        const step = newEntry._step||1;
        const isWork = newEntry.type==="work";
        const isLeave = newEntry.type==="leave";
        const isFunc = newEntry.type==="function";
        // Determine target engineer (who hours are being posted FOR)
        const _postForId = canEditAny ? viewEngId : myProfile?.id;
        const _targetEng = canEditAny
          ? engineers.find(e=>e.id===viewEngId||String(e.id)===String(viewEngId))
          : myProfile;
        const _targetRole = _targetEng?.role_type||"engineer";
        const _availProjs = getPostableProjects(_postForId);
        const _noProjects = isWork && _availProjs.length===0;
        const groupCats = TAXONOMY_GROUPS[newEntry._group]||[];
        const catActs = ACTIVITY_TAXONOMY[newEntry.taskCategory]||[];
        const projActs = isWork&&newEntry.projectId
          ? activities.filter(a=>a.project_id===newEntry.projectId&&a.status!=="Completed")
          : [];
        const projSubList=[...new Set(projActs.map(a=>a.subproject_id).filter(Boolean))];
        const filteredActs = projActs.filter(a=>{
          const matchSub = !newEntry._actSub || String(a.subproject_id)===String(newEntry._actSub);
          const matchCat = !newEntry._actCat || a.category===newEntry._actCat || a.group_name===newEntry._actCat;
          // Show all activities for this project â€” not just ones assigned to the engineer
          return matchSub && matchCat;
        });

        const INP={width:"100%",background:"var(--bg2)",border:"1px solid var(--border3)",borderRadius:5,color:"var(--text0)",padding:"7px 10px",fontSize:14,boxSizing:"border-box"};
        const LBL={fontSize:13,color:"var(--text2)",fontWeight:700,display:"block",marginBottom:4,letterSpacing:".05em"};
        const GC={"SCADA":"var(--info)","RTU-PLC":"#a78bfa","Protection":"#f87171","General":"#34d399"};

        // Step pill indicator
        const totalSteps = isLeave?2:isFunc?3:4;
        const StepBar=()=>(
          <div style={{display:"flex",gap:4,marginBottom:16}}>
            {Array.from({length:totalSteps},(_,i)=>(
              <div key={i} style={{flex:1,height:3,borderRadius:99,
                background:i<step?"var(--info)":"var(--border)",
                transition:"background .2s"}}/>
            ))}
          </div>
        );

        const Btn=({children,onClick,disabled,primary})=>(
          <button onClick={onClick} disabled={disabled}
            style={{padding:"8px 18px",borderRadius:6,border:"none",cursor:disabled?"not-allowed":"pointer",
              background:primary?"#1d4ed8":"var(--bg3)",color:disabled?"var(--text4)":"var(--text0)",
              fontSize:14,fontWeight:700,opacity:disabled?.5:1,transition:"all .15s"}}>
            {children}
          </button>
        );

        return(
        <div className="modal-ov" onClick={()=>setModalDate(null)}>
          <div className="modal" style={{maxWidth:420}} onClick={e=>e.stopPropagation()}>

            {/* Header */}
            <div style={{marginBottom:14}}>
              <h3 style={{fontSize:16,fontWeight:700,color:"var(--text0)",marginBottom:2}}>Post Hours</h3>
              <p style={{fontSize:13,color:"var(--text4)",fontFamily:"'IBM Plex Mono',monospace",margin:0}}>
                {new Date(modalDate).toLocaleDateString("en-US",{weekday:"long",month:"short",day:"numeric"})}
                {canEdit&&viewEng&&<span> آ· {viewEng.name}</span>}
              </p>
            </div>

            <StepBar/>

            <div style={{display:"grid",gap:12}}>

              {/* â”€â”€ STEP 1: Entry type â”€â”€ */}
              {step===1&&(
                <div>
                  <label style={LBL}>WHAT ARE YOU LOGGING?</label>
                  <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:8,marginTop:4}}>
                    {[
                      {v:"work",   icon:"â—†", label:"Work"},
                      {v:"function",icon:"â—ˆ",label:"Function"},
                      {v:"leave",  icon:"â—‡", label:"Leave"},
                    ].map(({v,icon,label})=>(
                      <button key={v} onClick={()=>setNewEntry(p=>({...p,type:v,_step:2}))}
                        style={{padding:"14px 8px",borderRadius:8,border:`2px solid ${newEntry.type===v?"var(--info)":"var(--border)"}`,
                          background:newEntry.type===v?"var(--info)"+"18":"var(--bg2)",
                          color:newEntry.type===v?"var(--info)":"var(--text3)",
                          fontSize:14,fontWeight:700,cursor:"pointer",display:"flex",
                          flexDirection:"column",alignItems:"center",gap:4}}>
                        <span style={{fontSize:20}}>{icon}</span>{label}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* â”€â”€ STEP 2 for LEAVE: type + hours â”€â”€ */}
              {step===2&&isLeave&&(
                <div style={{display:"grid",gap:12}}>
                  <div>
                    <label style={LBL}>LEAVE TYPE</label>
                    <select value={newEntry.leaveType} onChange={e=>setNewEntry(p=>({...p,leaveType:e.target.value}))} style={INP}>
                      {LEAVE_TYPES.map(t=><option key={t}>{t}</option>)}
                    </select>
                  </div>
                  <div style={{padding:"10px 12px",background:"var(--bg0)",borderRadius:6,border:"1px solid var(--border3)",fontSize:13,color:"var(--text3)"}}>
                    â„¹ï¸ڈ Leave entries are logged as a full 8-hour day automatically.
                  </div>
                </div>
              )}

              {/* â”€â”€ STEP 2 for FUNCTION: category â”€â”€ */}
              {step===2&&isFunc&&(
                <div style={{display:"grid",gap:12}}>
                  <div>
                    <label style={LBL}>FUNCTION CATEGORY</label>
                    <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:6}}>
                      {FUNCTION_CATS.map(c=>(
                        <button key={c} onClick={()=>setNewEntry(p=>({...p,taskType:c,function_category:c}))}
                          style={{padding:"7px 8px",borderRadius:6,border:`1px solid ${newEntry.taskType===c?"var(--info)":"var(--border)"}`,
                            background:newEntry.taskType===c?"var(--info)"+"18":"var(--bg2)",
                            color:newEntry.taskType===c?"var(--info)":"var(--text3)",
                            fontSize:13,fontWeight:700,cursor:"pointer",textAlign:"left"}}>
                          {c}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* â”€â”€ STEP 3 for FUNCTION: hours + description â”€â”€ */}
              {step===3&&isFunc&&(
                <div style={{display:"grid",gap:12}}>
                  <div style={{padding:"8px 12px",background:"var(--info)"+"12",borderRadius:6,border:"1px solid #38bdf8"+"40",fontSize:13,color:"var(--info)",fontWeight:700}}>
                    {newEntry.taskType||FUNCTION_CATS[0]}
                  </div>
                  <div style={{display:"grid",gridTemplateColumns:"100px 1fr",gap:10,alignItems:"start"}}>
                    <div>
                      <label style={LBL}>HOURS</label>
                      <input type="number" min=".5" max="12" step=".5" value={newEntry.hours}
                        onChange={e=>setNewEntry(p=>({...p,hours:+e.target.value}))} style={INP}/>
                    </div>
                    <div>
                      <label style={LBL}>DESCRIPTION <span style={{fontSize:11,color:"#fb923c",fontWeight:400}}>(recommended)</span></label>
                      <textarea rows={2} value={newEntry.activity}
                        onChange={e=>setNewEntry(p=>({...p,activity:e.target.value}))}
                        placeholder="Describe the activityâ€¦"
                        style={{...INP,resize:"vertical",borderColor:(!newEntry.activity||newEntry.activity.trim().length<=2)?"#fb923c50":"var(--input-border)"}}/>
                    </div>
                  </div>
                </div>
              )}

              {/* â”€â”€ STEP 2 for WORK: project + sub-site â”€â”€ */}
              {step===2&&isWork&&(
                <div style={{display:"grid",gap:12}}>
                  {(()=>{
                    return(
                    <div>
                      <label style={LBL}>PROJECT</label>
                      {_noProjects?(
                        <div style={{padding:"12px",background:"var(--err-bg)",border:"1px solid #f8717140",borderRadius:6,fontSize:13,color:"#f87171",textAlign:"center"}}>
                          âڑ  {_targetEng?.name||"This engineer"} is not assigned to any active project.<br/>
                          <span style={{color:"var(--text3)",fontSize:13}}>Ask an admin to assign projects first.</span>
                        </div>
                      ):(
                        <select value={newEntry.projectId}
                          onChange={e=>setNewEntry(p=>({...p,projectId:e.target.value,activityId:null,_actCat:null,_actSub:null}))}
                          style={{...INP,borderColor:!newEntry.projectId?"#f87171":"var(--border)"}}>
                          <option value="">â€” Select Project â€”</option>
                          {_availProjs.map(p=>(
                            <option key={p.id} value={p.id}>{p.name} ({p.id})</option>
                          ))}
                        </select>
                      )}
                    </div>);
                  })()}
                  {/* Sub-site if available */}
                  {newEntry.projectId&&projSubList.length>0&&(
                    <div>
                      <label style={LBL}>SUB-SITE <span style={{color:"var(--text3)",fontWeight:400}}>(optional)</span></label>
                      <select value={newEntry._actSub||""}
                        onChange={e=>setNewEntry(p=>({...p,_actSub:e.target.value||null,activityId:null}))}
                        style={INP}>
                        <option value="">â€” All sub-sites â€”</option>
                        {projSubList.map(sid=>{
                          const sp=subprojects.find(s=>String(s.id)===String(sid));
                          return sp?<option key={sid} value={sid}>{sp.name}</option>:null;
                        })}
                      </select>
                    </div>
                  )}
                </div>
              )}

              {/* â”€â”€ STEP 3 for WORK: group + category + activity â”€â”€ */}
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
                            border:`1px solid ${newEntry._group===g?(GC[g]||"var(--info)")+"80":"var(--border)"}`,
                            background:newEntry._group===g?(GC[g]||"var(--info)")+"15":"var(--bg2)",
                            color:newEntry._group===g?(GC[g]||"var(--info)"):"var(--text3)",
                            fontSize:13,fontWeight:700,cursor:"pointer"}}>
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

                  {/* Activity â€” from tracker if available, else from taxonomy */}
                  <div>
                    <label style={LBL}>ACTIVITY</label>
                    {filteredActs.length>0?(
                      <select value={newEntry.activityId||""}
                        onChange={e=>setNewEntry(p=>({...p,activityId:e.target.value||null,
                          taskType:filteredActs.find(a=>String(a.id)===e.target.value)?.activity_name||p.taskType}))}
                        style={{...INP,borderColor:"var(--info)"+"60"}}>
                        <option value="">â€” General (no specific activity) â€”</option>
                        {filteredActs
                          .filter(a=>!newEntry.taskCategory||(a.category===newEntry.taskCategory)||(a.group_name===newEntry.taskCategory)||(a.group_name===CAT_TO_GROUP[newEntry.taskCategory]))
                          .map(a=>(
                          <option key={a.id} value={a.id}>
                            {a.activity_name} آ· {Math.round((a.progress||0)*100)}%
                          </option>
                        ))}
                      </select>
                    ):(
                      <select value={newEntry.taskType}
                        onChange={e=>setNewEntry(p=>({...p,taskType:e.target.value}))}
                        style={INP}>
                        {catActs.map(t=><option key={t}>{t}</option>)}
                        <option value="Other">Otherâ€¦</option>
                      </select>
                    )}
                    {filteredActs.length>0&&(
                      <div style={{fontSize:12,color:"var(--info)",marginTop:3,paddingLeft:2}}>
                        âœ“ Linked to project tracker activities
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* â”€â”€ STEP 4 for WORK: hours + description â”€â”€ */}
              {step===4&&isWork&&(
                <div style={{display:"grid",gap:12}}>
                  {/* Summary badge */}
                  <div style={{display:"flex",gap:6,flexWrap:"wrap"}}>
                    <span style={{padding:"3px 8px",borderRadius:99,background:(GC[newEntry._group]||"var(--info)")+"18",
                      color:GC[newEntry._group]||"var(--info)",fontSize:13,fontWeight:700}}>
                      {newEntry._group}
                    </span>
                    <span style={{padding:"3px 8px",borderRadius:99,background:"var(--border)",color:"var(--text2)",fontSize:13}}>
                      {newEntry.taskCategory}
                    </span>
                    {newEntry.taskType&&(
                      <span style={{padding:"3px 8px",borderRadius:99,background:"var(--border)",color:"var(--text2)",fontSize:13}}>
                        {newEntry.taskType.length>30?newEntry.taskType.slice(0,28)+"â€¦":newEntry.taskType}
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
                      <label style={LBL}>NOTES <span style={{fontSize:11,color:"#fb923c",fontWeight:400}}>(recommended)</span></label>
                      <textarea rows={2} value={newEntry.activity}
                        onChange={e=>setNewEntry(p=>({...p,activity:e.target.value}))}
                        placeholder="e.g. Completed BESS display animationsâ€¦"
                        style={{...INP,resize:"vertical",borderColor:(!newEntry.activity||newEntry.activity.trim().length<=2)?"#fb923c50":"var(--input-border)"}}/>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Navigation */}
            <div style={{display:"flex",justifyContent:"space-between",marginTop:18,gap:10}}>
              <div>
                {step>1&&(
                  <Btn onClick={()=>setNewEntry(p=>({...p,_step:p._step-1}))}>â†گ Back</Btn>
                )}
              </div>
              <div style={{display:"flex",gap:8}}>
                <Btn onClick={()=>setModalDate(null)}>Cancel</Btn>
                {step<totalSteps?(
                  <Btn primary
                    disabled={
                      (step===2&&isWork&&(_noProjects||!newEntry.projectId))||
                      (step===2&&isFunc&&!newEntry.taskType)
                    }
                    onClick={()=>setNewEntry(p=>({...p,_step:p._step+1}))}>
                    Next â†’
                  </Btn>
                ):(
                  <Btn primary
                    disabled={!newEntry.hours||(isWork&&!newEntry.projectId)}
                    onClick={()=>addEntry(modalDate)}>
                    âœ“ Post Hours
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
            <h3 style={{fontSize:17,fontWeight:700,marginBottom:18}}>Edit Entry</h3>
            {/* Frozen month warning banner */}
            {isMonthFrozen(editEntry.date)&&(()=>{
              const _d=new Date(editEntry.date+"T12:00:00");
              const _mn=["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"][_d.getMonth()];
              return(
                <div style={{display:"flex",alignItems:"center",gap:10,background:"#1e3a5f",border:"1px solid #3b82f640",
                  borderRadius:8,padding:"10px 14px",marginBottom:14}}>
                  <span style={{fontSize:18}}>â‌„</span>
                  <div>
                    <div style={{fontSize:13,fontWeight:700,color:"#93c5fd"}}>{_mn} {_d.getFullYear()} is frozen</div>
                    <div style={{fontSize:12,color:"#64748b",marginTop:2}}>Changes cannot be saved.{isAdmin?" Unfreeze this month from Post Hours to edit.":""}</div>
                  </div>
                </div>
              );
            })()}
            <div style={{display:"grid",gap:11,opacity:isMonthFrozen(editEntry.date)?0.5:1,pointerEvents:isMonthFrozen(editEntry.date)?"none":"auto"}}>
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
                    <option value="">â€” Select â€”</option>
                    {projects.map(p=><option key={p.id} value={p.id}>{p.name} ({p.id})</option>)}
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
              <button className="bp" onClick={saveEditEntry}
                disabled={isMonthFrozen(editEntry.date)}
                style={{opacity:isMonthFrozen(editEntry.date)?0.4:1,cursor:isMonthFrozen(editEntry.date)?"not-allowed":"pointer"}}>
                {isMonthFrozen(editEntry.date)?"â‌„ Frozen":"Save Changes"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* New Project */}
      {showProjModal&&(
        <div className="modal-ov" onClick={()=>setShowProjModal(false)}>
          <div className="modal" style={{maxWidth:520}} onClick={e=>e.stopPropagation()}>
            <h3 style={{fontSize:17,fontWeight:700,marginBottom:18}}>New Project</h3>
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
                <div><Lbl>Project Leader</Lbl>
                  <select value={newProj.project_leader||""} onChange={e=>{
                    const name=e.target.value;
                    const eng=engineers.find(x=>x.name===name);
                    setNewProj(p=>{
                      const ae=(p.assigned_engineers||[]);
                      const newAe=eng&&!ae.includes(String(eng.id))?[...ae,String(eng.id)]:ae;
                      return {...p,project_leader:name,assigned_engineers:newAe};
                    });
                  }}>
                    <option value="">â€” None â€”</option>
                    {engineers.filter(e=>isEngActive(e)&&(e.role_type==="lead"||e.role_type==="admin")).map(e=>(
                      <option key={e.id} value={e.name}>{e.name}</option>
                    ))}
                  </select>
                </div>
                <div><Lbl>Client</Lbl><input value={newProj.client} onChange={e=>setNewProj(p=>({...p,client:e.target.value}))}/></div>
                <div><Lbl>Origin (HQ / BU)</Lbl><input value={newProj.origin} onChange={e=>setNewProj(p=>({...p,origin:e.target.value}))}/></div>
              </div>
              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}>
                <div><Lbl>Billable?</Lbl><select value={newProj.billable?"yes":"no"} onChange={e=>setNewProj(p=>({...p,billable:e.target.value==="yes"}))}><option value="yes">Yes</option><option value="no">No â€” Internal</option></select></div>
                <div><Lbl>Rate per Hour ($)</Lbl><input type="number" value={newProj.rate_per_hour} onChange={e=>setNewProj(p=>({...p,rate_per_hour:+e.target.value}))}/></div>
              </div>
              {/* Team assignment */}
              <div>
                <Lbl>Assigned Team Members</Lbl>
                <div style={{background:"var(--bg2)",border:"1px solid var(--border3)",borderRadius:6,padding:"8px 10px",display:"grid",gridTemplateColumns:"1fr 1fr",gap:6,maxHeight:160,overflowY:"auto"}}>
                  {engineers.filter(e=>{
                    if(!isEngActive(e)) return false;
                    if(e.role_type==="accountant"||e.role_type==="senior_management") return false;
                    if(isLead&&!isAdmin){
                      return e.id===myProfile?.id||e.role_type==="engineer";
                    }
                    return true;
                  }).map(e=>{
                    const sel=(newProj.assigned_engineers||[]).includes(String(e.id));
                    return(
                    <label key={e.id} style={{display:"flex",alignItems:"center",gap:6,cursor:"pointer",padding:"3px 4px",borderRadius:4,background:sel?"var(--bg3)":"transparent"}}>
                      <input type="checkbox" checked={sel} onChange={()=>setNewProj(p=>{
                        const cur=p.assigned_engineers||[];
                        return {...p,assigned_engineers:sel?cur.filter(x=>x!==String(e.id)):[...cur,String(e.id)]};
                      })} style={{accentColor:"var(--info)"}}/>
                      <span style={{fontSize:13,color:sel?"var(--info)":"var(--text2)"}}>{e.name}</span>
                      <span style={{fontSize:12,color:"var(--text4)",marginLeft:"auto"}}>{e.role} آ· {e.role_type==="lead"?"Lead":e.level||""}</span>
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
      {editProjModal&&(()=>{
        const epTab=editProjModal._tab||"details";
        const epActs=(activities||[]).filter(a=>a.project_id===(editProjModal._origId||editProjModal.id));
        const setEpTab=t=>setEditProjModal(p=>({...p,_tab:t}));
        return(
        <div className="modal-ov" onClick={()=>setEditProjModal(null)}>
          <div className="modal" style={{maxWidth:580,maxHeight:"85vh",display:"flex",flexDirection:"column"}} onClick={e=>e.stopPropagation()}>
            <h3 style={{fontSize:17,fontWeight:700,marginBottom:12}}>Edit Project â€” {editProjModal._origId||editProjModal.id}</h3>
            {/* Tab bar */}
            <div style={{display:"flex",gap:0,marginBottom:14,borderBottom:"1px solid var(--border3)"}}>
              {(isAdmin?[["details","Details"],["team","Team"],["activities","Activities"]]:[["details","Details"],["team","Team"],["activities","Activities"]]).map(([t,l])=>(
                <button key={t} onClick={()=>setEpTab(t)}
                  style={{padding:"6px 14px",border:"none",borderBottom:epTab===t?"2px solid #38bdf8":"2px solid transparent",
                    background:"transparent",color:epTab===t?"var(--info)":"var(--text3)",fontSize:13,fontWeight:600,cursor:"pointer"}}>
                  {l}{t==="activities"?` (${epActs.length})`:""}
                </button>
              ))}
            </div>
            <div style={{overflowY:"auto",flex:1}}>
            {/* â”€â”€ DETAILS TAB â”€â”€ */}
            {epTab==="details"&&<div style={{display:"grid",gap:11}}>
              <div style={{display:"grid",gridTemplateColumns:"1fr 2fr",gap:10}}>
                <div><Lbl>Project No. <span style={{color:"#f87171",fontSize:12}}>(rename re-links all entries)</span></Lbl>
                  {isAdmin?<input value={editProjModal.id||""} onChange={e=>setEditProjModal(p=>({...p,id:e.target.value.toUpperCase(),_origId:p._origId||p.id}))}/>
                  :<div style={{fontFamily:"'IBM Plex Mono',monospace",fontSize:15,color:"var(--info)",padding:"8px 0"}}>{editProjModal.id}</div>}
                </div>
                <div><Lbl>Project Name</Lbl><input value={editProjModal.name} onChange={e=>setEditProjModal(p=>({...p,name:e.target.value}))}/></div>
              </div>
              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}>
                <div><Lbl>Status</Lbl><select value={editProjModal.status} onChange={e=>setEditProjModal(p=>({...p,status:e.target.value}))}>{["Active","On Hold","Completed"].map(s=><option key={s}>{s}</option>)}</select></div>
                <div><Lbl>Phase</Lbl><select value={editProjModal.phase} onChange={e=>setEditProjModal(p=>({...p,phase:e.target.value}))}>{PHASES.map(ph=><option key={ph}>{ph}</option>)}</select></div>
              </div>
              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}>
                <div><Lbl>Project Manager (PM)</Lbl><input value={editProjModal.pm||""} onChange={e=>setEditProjModal(p=>({...p,pm:e.target.value}))} placeholder="e.g. Ahmed Farahat" style={{width:"100%",boxSizing:"border-box"}}/></div>
                <div><Lbl>Project Leader</Lbl>
                  <select value={editProjModal.project_leader||""} onChange={e=>{
                    const name=e.target.value;
                    const eng=engineers.find(x=>x.name===name);
                    setEditProjModal(p=>{
                      const ae=(p.assigned_engineers||[]);
                      const newAe=eng&&!ae.includes(String(eng.id))?[...ae,String(eng.id)]:ae;
                      return {...p,project_leader:name,assigned_engineers:newAe};
                    });
                  }} style={{width:"100%"}}>
                    <option value="">â€” None â€”</option>
                    {engineers.filter(e=>isEngActive(e)&&(e.role_type==="lead"||e.role_type==="admin")).map(e=>(
                      <option key={e.id} value={e.name}>{e.name} â€” {ROLE_LABELS[e.role_type]||e.role_type}</option>
                    ))}
                  </select>
                </div>
              <div><Lbl>Client</Lbl><input value={editProjModal.client||""} onChange={e=>setEditProjModal(p=>({...p,client:e.target.value}))}/></div>
                <div><Lbl>Origin</Lbl><input value={editProjModal.origin||""} onChange={e=>setEditProjModal(p=>({...p,origin:e.target.value}))}/></div>
              </div>
              {isAdmin&&<div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}>
                <div><Lbl>Billable?</Lbl><select value={editProjModal.billable?"yes":"no"} onChange={e=>setEditProjModal(p=>({...p,billable:e.target.value==="yes"}))}><option value="yes">Yes</option><option value="no">No</option></select></div>
                <div><Lbl>Rate per Hour ($)</Lbl><input type="number" value={editProjModal.rate_per_hour} onChange={e=>setEditProjModal(p=>({...p,rate_per_hour:+e.target.value}))}/></div>
              </div>}
            </div>}
            {/* â”€â”€ TEAM TAB â”€â”€ */}
            {epTab==="team"&&<div>
              <div style={{fontSize:13,color:"var(--text3)",marginBottom:10}}>Select engineers assigned to this project. Only assigned engineers can post hours.</div>
              <div style={{background:"var(--bg2)",border:"1px solid var(--border3)",borderRadius:6,padding:"6px 8px",display:"grid",gridTemplateColumns:"1fr",gap:4,maxHeight:300,overflowY:"auto"}}>
                {engineers.filter(e=>{
                  if(!isEngActive(e)) return false;
                  if(e.role_type==="accountant"||e.role_type==="senior_management") return false;
                  if(isLead&&!isAdmin) return e.id===myProfile?.id||e.role_type==="engineer"||e.role_type==="lead";
                  return true;
                }).map(e=>{
                  const sel=(editProjModal.assigned_engineers||[]).includes(String(e.id));
                  const nameParts=(e.name||"").trim().split(" ");
                  const displayName=nameParts.length>=2?nameParts[0]+" "+nameParts[nameParts.length-1]:e.name;
                  return(
                  <label key={e.id} style={{display:"flex",alignItems:"center",gap:10,cursor:"pointer",padding:"7px 10px",borderRadius:6,
                    background:sel?"var(--bg3)":"var(--bg2)",border:`1px solid ${sel?"#0ea5e940":"var(--bg3)"}`,transition:"background .15s"}}>
                    <input type="checkbox" checked={sel} onChange={()=>setEditProjModal(p=>{
                      const cur=p.assigned_engineers||[];
                      return {...p,assigned_engineers:sel?cur.filter(x=>x!==String(e.id)):[...cur,String(e.id)]};
                    })} style={{accentColor:"var(--info)",width:14,height:14,flexShrink:0}}/>
                    <div className="av" style={{width:30,height:30,fontSize:13,flexShrink:0}}>{(e.name||"").slice(0,2).toUpperCase()}</div>
                    <div style={{flex:1,minWidth:0}}>
                      <div style={{fontSize:14,fontWeight:600,color:sel?"var(--info)":"var(--text0)",letterSpacing:.2}}>{displayName}</div>
                      <div style={{fontSize:13,color:"var(--text3)",marginTop:1}}>{e.role} آ· <span style={{color:ROLE_COLORS[e.role_type]||"var(--text3)"}}>{ROLE_LABELS[e.role_type]||e.role_type}</span></div>
                    </div>
                    {sel&&<span style={{fontSize:12,color:"var(--info)",background:"#38bdf820",padding:"2px 6px",borderRadius:3,flexShrink:0}}>âœ“ Assigned</span>}
                  </label>);
                })}
              </div>
              <div style={{fontSize:13,color:"var(--text3)",marginTop:8,display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                <span>{(editProjModal.assigned_engineers||[]).length} engineer{(editProjModal.assigned_engineers||[]).length!==1?"s":""} assigned</span>
                {(editProjModal.assigned_engineers||[]).length>0&&
                  <button style={{background:"none",border:"none",color:"#f87171",fontSize:13,cursor:"pointer"}}
                    onClick={()=>setEditProjModal(p=>({...p,assigned_engineers:[]}))}>Clear all</button>}
              </div>
            </div>}
            {/* â”€â”€ ACTIVITIES TAB â”€â”€ */}
            {epTab==="activities"&&<EditProjActivities
              projId={editProjModal._origId||editProjModal.id}
              activities={activities} setActivities={setActivities}
              engineers={engineers} isEngActive={isEngActive}
              supabase={supabase} showToast={showToast}
              projects={projects} setProjects={setProjects}
              showConfirm={showConfirm}
              myProfile={myProfile}
              onActivityComment={appHandleActivityComment}
              insertNotif={insertNotif}
            />}
                        </div>
            {epTab!=="activities"&&<div style={{display:"flex",gap:10,marginTop:18,justifyContent:"flex-end",borderTop:"1px solid var(--border3)",paddingTop:14}}>
              <button className="bg" onClick={()=>setEditProjModal(null)}>Cancel</button>
              <button className="bp" onClick={saveEditProject}>Save Changes</button>
            </div>}
          </div>
        </div>);
      })()}

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
            <h3 style={{fontSize:17,fontWeight:700,marginBottom:18}}>Add Member</h3>
            <div style={{display:"grid",gap:11}}>
              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}>
                <div><Lbl>Full Name</Lbl><input value={newEng.name} onChange={e=>setNewEng(p=>({...p,name:e.target.value}))}/></div>
                <div><Lbl>Level</Lbl><select value={newEng.level} onChange={e=>setNewEng(p=>({...p,level:e.target.value}))}>{LEVELS.map(l=><option key={l}>{l}</option>)}</select></div>
              </div>
              <div><Lbl>Job Title</Lbl>
                <select value={newEng.role||ROLES_LIST[0]} onChange={e=>setNewEng(p=>({...p,role:e.target.value}))}>
                  {ROLES_LIST.map(r=><option key={r}>{r}</option>)}
                </select>
              </div>
              <div><Lbl>Email (must match their signup email)</Lbl><input type="email" value={newEng.email} onChange={e=>setNewEng(p=>({...p,email:e.target.value}))}/></div>
              <div>
                <Lbl>Access Role</Lbl>
                <select value={newEng.role_type} onChange={e=>setNewEng(p=>({...p,role_type:e.target.value}))}>
                  {ROLE_TYPES.map(r=><option key={r} value={r}>{ROLE_LABELS[r]}</option>)}
                </select>
                <div style={{fontSize:13,color:"var(--text4)",marginTop:4}}>
                  {newEng.role_type==="engineer"&&"Can log hours & view own timesheets"}
                  {newEng.role_type==="lead"&&"Engineer + can view all team timesheets"}
                  {newEng.role_type==="accountant"&&"Full access to Finance tab, invoices & reports â€” no timesheet editing"}
                  {newEng.role_type==="admin"&&"Full access to everything including settings"}
                </div>
              </div>
            </div>
              <div style={{display:"flex",alignItems:"center",gap:10,padding:"8px 10px",background:"var(--bg2)",borderRadius:6,border:"1px solid var(--border3)"}}>
                <span style={{fontSize:13,color:"var(--text2)",flex:1}}>Employment Status</span>
                {["Active","Inactive"].map(s=>{
                  const active=s==="Active";
                  const sel=(newEng.is_active!==false&&!newEng.termination_date)===active;
                  return <button key={s} onClick={()=>setNewEng(p=>({...p,is_active:active}))}
                    style={{padding:"4px 14px",borderRadius:5,border:`1px solid ${sel?(active?"#34d399":"#f87171")+"80":"var(--border)"}`,
                      background:sel?(active?"#34d399":"#f87171")+"15":"var(--bg2)",
                      color:sel?(active?"#34d399":"#f87171"):"var(--text3)",fontSize:13,fontWeight:600,cursor:"pointer"}}>{s}</button>;
                })}
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
            <h3 style={{fontSize:17,fontWeight:700,marginBottom:18}}>Edit â€” {editEngModal.name}</h3>
            <div style={{display:"grid",gap:11}}>
              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}>
                <div><Lbl>Full Name</Lbl><input value={editEngModal.name||""} onChange={e=>setEditEngModal(p=>({...p,name:e.target.value}))}/></div>
                <div><Lbl>Level</Lbl><select value={editEngModal.level||"Mid"} onChange={e=>setEditEngModal(p=>({...p,level:e.target.value}))}>{LEVELS.map(l=><option key={l}>{l}</option>)}</select></div>
              </div>
              <div><Lbl>Job Title</Lbl>
                <select value={editEngModal.role||""} onChange={e=>setEditEngModal(p=>({...p,role:e.target.value}))}>
                  <option value="">â€” Select â€”</option>
                  {ROLES_LIST.map(r=><option key={r}>{r}</option>)}
                </select>
              </div>
              <div><Lbl>Email</Lbl><input type="email" value={editEngModal.email||""} onChange={e=>setEditEngModal(p=>({...p,email:e.target.value}))}/></div>
              <div><Lbl>Access Role</Lbl><select value={editEngModal.role_type||"engineer"} onChange={e=>setEditEngModal(p=>({...p,role_type:e.target.value}))}>{ROLE_TYPES.map(r=><option key={r} value={r}>{ROLE_LABELS[r]}</option>)}</select></div>
              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}>
                <div><Lbl>Join Date</Lbl><input type="date" value={editEngModal.join_date||""} onChange={e=>setEditEngModal(p=>({...p,join_date:e.target.value||null}))}/></div>
                <div><Lbl>Left Date <span style={{color:"var(--text3)",fontWeight:400}}>(sets inactive)</span></Lbl><input type="date" value={editEngModal.termination_date||""} onChange={e=>setEditEngModal(p=>({...p,termination_date:e.target.value||null,is_active:e.target.value?false:p.is_active}))}/></div>
              </div>
              <div style={{display:"flex",alignItems:"center",gap:10,padding:"8px 10px",background:"var(--bg2)",borderRadius:6,border:"1px solid var(--border3)"}}>
                <span style={{fontSize:13,color:"var(--text2)",flex:1}}>Status</span>
                {["Active","Inactive"].map(s=>{
                  const active=s==="Active";
                  const sel=isEngActive(editEngModal)===active;
                  return <button key={s} onClick={()=>setEditEngModal(p=>({...p,is_active:active,termination_date:active?null:p.termination_date||TODAY_STR}))}
                    style={{padding:"4px 14px",borderRadius:5,border:`1px solid ${sel?(active?"#34d399":"#f87171")+"80":"var(--border)"}`,
                      background:sel?(active?"#34d399":"#f87171")+"15":"var(--bg2)",
                      color:sel?(active?"#34d399":"#f87171"):"var(--text3)",fontSize:13,fontWeight:600,cursor:"pointer"}}>{s}</button>;
                })}
              </div>
            </div>
            <div style={{display:"flex",gap:10,marginTop:18,justifyContent:"flex-end"}}>
              <button className="bg" onClick={()=>setEditEngModal(null)}>Cancel</button>
              <button className="bp" onClick={saveEditEngineer}>Save</button>
            </div>
          </div>
        </div>
      )}


      {/* â”€â”€ STAFF MODAL â”€â”€ */}
      {showStaffModal&&(
        <div className="modal-ov" onClick={()=>{setShowStaffModal(false);setEditStaff(null);}}>
          <div className="modal" style={{maxWidth:500}} onClick={e=>e.stopPropagation()}>
            <h3 style={{fontSize:17,fontWeight:700,marginBottom:4}}>{editStaff?"Edit Staff Member":"Add Staff Member"}</h3>
            {!editStaff&&<p style={{fontSize:13,color:"var(--text4)",marginBottom:16}}>This will also create an engineer login record if email is provided.</p>}
            <div style={{display:"grid",gap:11}}>
              {/* Row 1: Name + Type */}
              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}>
                <div><Lbl>Full Name</Lbl><input value={(editStaff||newStaff).name} onChange={e=>editStaff?setEditStaff(p=>({...p,name:e.target.value})):setNewStaff(p=>({...p,name:e.target.value}))}/></div>
                <div><Lbl>Employment Type</Lbl>
                  <select value={(editStaff||newStaff).type||"full_time"} onChange={e=>editStaff?setEditStaff(p=>({...p,type:e.target.value})):setNewStaff(p=>({...p,type:e.target.value}))}>
                    {["full_time","part_time","contractor","intern"].map(t=><option key={t} value={t}>{t.replace("_"," ")}</option>)}
                  </select>
                </div>
              </div>
              {/* Row 2: Department + Job Title */}
              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}>
                <div><Lbl>Department</Lbl>
                  <select value={(editStaff||newStaff).department||"Engineering"} onChange={e=>editStaff?setEditStaff(p=>({...p,department:e.target.value})):setNewStaff(p=>({...p,department:e.target.value}))}>
                    {["Engineering","Management","Finance","Operations","IT","Administration","Other"].map(d=><option key={d}>{d}</option>)}
                  </select>
                </div>
                <div><Lbl>Job Title</Lbl>
                  <select value={(editStaff||newStaff).role||""} onChange={e=>editStaff?setEditStaff(p=>({...p,role:e.target.value})):setNewStaff(p=>({...p,role:e.target.value}))}>
                    <option value="">â€” Select â€”</option>
                    {ROLES_LIST.map(r=><option key={r}>{r}</option>)}
                  </select>
                </div>
              </div>
              {/* Row 3: Email (for engineer record) + Level â€” new staff only */}
              {!editStaff&&(
                <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}>
                  <div>
                    <Lbl>Email <span style={{color:"var(--text4)",fontWeight:400}}>(signup email)</span></Lbl>
                    <input type="email" value={newStaff.email||""} onChange={e=>setNewStaff(p=>({...p,email:e.target.value}))} placeholder="name@enevoegy.com"/>
                  </div>
                  <div><Lbl>Level</Lbl>
                    <select value={newStaff.level||"Mid"} onChange={e=>setNewStaff(p=>({...p,level:e.target.value}))}>
                      {["Junior","Mid","Senior","Lead","Manager","Director"].map(l=><option key={l}>{l}</option>)}
                    </select>
                  </div>
                </div>
              )}
              {/* Row 4: Access Role â€” new staff only */}
              {!editStaff&&(
                <div>
                  <Lbl>System Access Role</Lbl>
                  <select value={newStaff.role_type||"engineer"} onChange={e=>setNewStaff(p=>({...p,role_type:e.target.value}))}>
                    {ROLE_TYPES.map(r=><option key={r} value={r}>{ROLE_LABELS[r]}</option>)}
                  </select>
                  <div style={{fontSize:13,color:"var(--text4)",marginTop:3}}>
                    {(newStaff.role_type||"engineer")==="engineer"&&"Can log hours & view own timesheets"}
                    {(newStaff.role_type||"engineer")==="lead"&&"Can view all timesheets + approve hours"}
                    {(newStaff.role_type||"engineer")==="accountant"&&"Full Finance tab access"}
                    {(newStaff.role_type||"engineer")==="senior_management"&&"View-only access across all tabs"}
                    {(newStaff.role_type||"engineer")==="admin"&&"Full access to everything"}
                  </div>
                </div>
              )}
              {/* Salaries */}
              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}>
                <div><Lbl>Monthly Salary (USD)</Lbl><input type="number" value={(editStaff||newStaff).salary_usd||""} onChange={e=>editStaff?setEditStaff(p=>({...p,salary_usd:+e.target.value})):setNewStaff(p=>({...p,salary_usd:+e.target.value}))} placeholder="0"/></div>
                <div><Lbl>Monthly Salary (EGP)</Lbl><input type="number" value={(editStaff||newStaff).salary_egp||""} onChange={e=>editStaff?setEditStaff(p=>({...p,salary_egp:+e.target.value})):setNewStaff(p=>({...p,salary_egp:+e.target.value}))} placeholder="0"/></div>
              </div>
              {/* Dates */}
              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}>
                <div><Lbl>Join / Start Date</Lbl><input type="date" value={(editStaff||newStaff).join_date||""} onChange={e=>editStaff?setEditStaff(p=>({...p,join_date:e.target.value||null})):setNewStaff(p=>({...p,join_date:e.target.value||null}))}/></div>
                <div><Lbl>Termination Date</Lbl><input type="date" value={(editStaff||newStaff).termination_date||""} onChange={e=>editStaff?setEditStaff(p=>({...p,termination_date:e.target.value||null})):setNewStaff(p=>({...p,termination_date:e.target.value||null}))}/></div>
              </div>
              {/* Active status */}
              <div style={{display:"flex",alignItems:"center",gap:10,padding:"8px 10px",background:"var(--bg2)",borderRadius:6,border:"1px solid var(--border3)"}}>
                <span style={{fontSize:13,color:"var(--text2)",flex:1}}>Employment Status</span>
                {["Active","Inactive"].map(s=>{
                  const active=s==="Active";
                  const sel=(editStaff||newStaff).active!==false===active;
                  return <button key={s} onClick={()=>editStaff?setEditStaff(p=>({...p,active})):setNewStaff(p=>({...p,active}))}
                    style={{padding:"4px 14px",borderRadius:5,border:`1px solid ${sel?(active?"#34d399":"#f87171")+"80":"var(--border)"}`,
                      background:sel?(active?"#34d399":"#f87171")+"15":"var(--bg2)",
                      color:sel?(active?"#34d399":"#f87171"):"var(--text3)",fontSize:13,fontWeight:600,cursor:"pointer"}}>{s}</button>;
                })}
              </div>
              <div><Lbl>Notes</Lbl><input value={(editStaff||newStaff).notes||""} onChange={e=>editStaff?setEditStaff(p=>({...p,notes:e.target.value})):setNewStaff(p=>({...p,notes:e.target.value}))} placeholder="Optional"/></div>
            </div>
            <div style={{display:"flex",gap:10,marginTop:18,justifyContent:"flex-end"}}>
              <button className="bg" onClick={()=>{setShowStaffModal(false);setEditStaff(null);}}>Cancel</button>
              <button className="bp" onClick={saveStaff}>{editStaff?"Save Changes":"Add Member"}</button>
            </div>
          </div>
        </div>
      )}

      {/* â”€â”€ EXPENSE MODAL â”€â”€ */}
      {showExpModal&&(
        <div className="modal-ov" onClick={()=>{setShowExpModal(false);setEditExp(null);}}>
          <div className="modal" style={{maxWidth:480}} onClick={e=>e.stopPropagation()}>
            <h3 style={{fontSize:17,fontWeight:700,marginBottom:18}}>{editExp?"Edit Expense":"Add Expense"}</h3>
            <div style={{display:"grid",gap:11}}>
              <div><Lbl>Category</Lbl>
                <select value={(editExp||newExp).category} onChange={e=>editExp?setEditExp(p=>({...p,category:e.target.value})):setNewExp(p=>({...p,category:e.target.value}))}>
                  {["Office Rent & Utilities","Salaries","Software & Subscriptions","Travel & Transportation","Equipment & Supplies","Other"].map(c=><option key={c}>{c}</option>)}
                </select>
              </div>
              <div><Lbl>Description</Lbl><input value={(editExp||newExp).description} onChange={e=>editExp?setEditExp(p=>({...p,description:e.target.value})):setNewExp(p=>({...p,description:e.target.value}))} placeholder="e.g. Office Rent â€” Cairo HQ"/></div>
              {/* Currency selector + single amount + optional rate */}
              <div>
                <Lbl>CURRENCY</Lbl>
                <div style={{display:"flex",gap:8}}>
                  {["USD","EGP"].map(cur=>{
                    const active=(editExp||newExp).currency===cur||(!(editExp||newExp).currency&&cur==="USD");
                    return(
                    <button key={cur} onClick={()=>editExp?setEditExp(p=>({...p,currency:cur})):setNewExp(p=>({...p,currency:cur}))}
                      style={{flex:1,padding:"7px",borderRadius:6,border:`1px solid ${active?(cur==="USD"?"var(--info)":"#a78bfa")+"80":"var(--border)"}`,
                        background:active?(cur==="USD"?"var(--info)":"#a78bfa")+"15":"var(--bg2)",
                        color:active?(cur==="USD"?"var(--info)":"#a78bfa"):"var(--text3)",
                        fontSize:14,fontWeight:700,cursor:"pointer"}}>
                      {cur}
                    </button>);
                  })}
                </div>
              </div>
              {(()=>{
                const exp=editExp||newExp;
                const cur=exp.currency||"USD";
                const isEGP=cur==="EGP";
                const rate=exp.entry_rate||egpRate;
                const amtVal=isEGP?(exp.amount_egp||""):(exp.amount_usd||"");
                const setAmt=v=>{ if(editExp) setEditExp(p=>isEGP?{...p,amount_egp:v,amount_usd:0}:{...p,amount_usd:v,amount_egp:0}); else setNewExp(p=>isEGP?{...p,amount_egp:v,amount_usd:0}:{...p,amount_usd:v,amount_egp:0}); };
                const setRate=v=>{ if(editExp) setEditExp(p=>({...p,entry_rate:v||null})); else setNewExp(p=>({...p,entry_rate:v||null})); };
                return(<>
                  <div style={{display:"grid",gridTemplateColumns:isEGP?"2fr 1fr":"1fr",gap:10}}>
                    <div>
                      <Lbl>{isEGP?"AMOUNT (EGP)":"AMOUNT (USD)"}</Lbl>
                      <input type="number" min="0" step={isEGP?"1":"0.01"}
                        value={amtVal}
                        onChange={e=>setAmt(+e.target.value)}
                        placeholder={isEGP?"0":"0.00"}/>
                    </div>
                    {isEGP&&(
                      <div>
                        <Lbl>RATE <span style={{color:"var(--text3)",fontWeight:400,fontSize:12}}>EGP/$</span></Lbl>
                        <input type="number" min="1" max="9999" step="1"
                          value={exp.entry_rate||""}
                          onChange={e=>setRate(e.target.value?+e.target.value:null)}
                          placeholder={String(egpRate)}/>
                      </div>
                    )}
                  </div>
                  {isEGP&&(exp.amount_egp>0)&&(
                    <div style={{padding:"5px 10px",background:"var(--bg2)",borderRadius:4,border:"1px solid var(--border2)",fontSize:13,color:"var(--text3)"}}>
                      â‰ˆ <span style={{color:"var(--info)",fontFamily:"'IBM Plex Mono',monospace"}}>${(Math.round((exp.amount_egp||0)/(rate)*100)/100).toLocaleString()}</span>
                      <span style={{marginLeft:8}}>@ {rate} EGP/$</span>
                    </div>
                  )}
                </>);
              })()}
              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}>
                <div><Lbl>Month</Lbl>
                  <select value={(editExp||newExp).month} onChange={e=>editExp?setEditExp(p=>({...p,month:+e.target.value})):setNewExp(p=>({...p,month:+e.target.value}))}>
                    {["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"].map((m,i)=><option key={i} value={i}>{m}</option>)}
                  </select>
                </div>
                <div><Lbl>Year</Lbl>
                  <select value={(editExp||newExp).year} onChange={e=>editExp?setEditExp(p=>({...p,year:+e.target.value})):setNewExp(p=>({...p,year:+e.target.value}))}>
                    {Array.from({length:6},(_,i)=>new Date().getFullYear()-2+i).map(y=><option key={y}>{y}</option>)}
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


      {/* â”€â”€ FUNCTION HOURS MODAL â”€â”€ */}
      {showFuncModal&&(
        <div className="modal-ov" onClick={()=>setShowFuncModal(false)}>
          <div className="modal" style={{maxWidth:460}} onClick={e=>e.stopPropagation()}>
            <h3 style={{fontSize:17,fontWeight:700,marginBottom:4}}>Log Function Hours</h3>
            <p style={{fontSize:13,color:"var(--text4)",marginBottom:16}}>Post non-billable activity hours for an engineer â€” visible in KPI reports.</p>
            <div style={{display:"grid",gap:11}}>
              <div><Lbl>Engineer</Lbl>
                <select value={newFunc.engineer_id} onChange={e=>setNewFunc(p=>({...p,engineer_id:e.target.value}))}
                  style={{borderColor:!newFunc.engineer_id?"#f87171":""}}>
                  <option value="">â€” Select Engineer â€”</option>
                  {engineers.map(e=><option key={e.id} value={e.id}>{e.name} آ· {e.role}</option>)}
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
                  <span style={{fontSize:13,color:FUNC_COLORS[newFunc.function_category]||"#6b7280"}}>{newFunc.function_category}</span>
                </div>
              </div>
              <div><Lbl>Description <span style={{color:"var(--info)"}}>(used in KPI reports)</span></Lbl>
                <textarea rows={3} value={newFunc.activity} onChange={e=>setNewFunc(p=>({...p,activity:e.target.value}))}
                  placeholder="e.g. Delivered PLC basics session to 3 junior engineersâ€¦" style={{resize:"vertical"}}/>
              </div>
            </div>
            <div style={{display:"flex",gap:10,marginTop:18,justifyContent:"flex-end"}}>
              <button className="bg" onClick={()=>setShowFuncModal(false)}>Cancel</button>
              <button className="bp" onClick={addFunctionEntry}>Post Function Hours</button>
            </div>
          </div>
        </div>
      )}

      {/* Change Password Modal */}
      {showPwdModal&&(
        <div style={{position:"fixed",inset:0,background:"#00000080",zIndex:1000,display:"flex",alignItems:"center",justifyContent:"center"}}
          onClick={e=>{if(e.target===e.currentTarget){setShowPwdModal(false);setPwdMsg(null);}}}>
          <div style={{background:"var(--bg1)",border:"1px solid var(--border3)",borderRadius:12,padding:28,width:360,maxWidth:"95vw",boxShadow:"0 24px 60px #00000080"}}>
            <h3 style={{fontSize:16,fontWeight:700,color:"var(--text0)",marginBottom:4}}>Change Password</h3>
            <p style={{fontSize:13,color:"var(--text4)",marginBottom:20}}>Choose a new password for your account.</p>
            <div style={{display:"grid",gap:12}}>
              <div>
                <label style={{fontSize:13,color:"var(--text3)",fontWeight:600,display:"block",marginBottom:4}}>New Password</label>
                <input type="password" value={pwdForm.newPwd} onChange={e=>setPwdForm(p=>({...p,newPwd:e.target.value}))}
                  placeholder="Min. 6 characters" autoFocus
                  onKeyDown={e=>e.key==="Enter"&&handleChangePassword()}/>
              </div>
              <div>
                <label style={{fontSize:13,color:"var(--text3)",fontWeight:600,display:"block",marginBottom:4}}>Confirm Password</label>
                <input type="password" value={pwdForm.confirmPwd} onChange={e=>setPwdForm(p=>({...p,confirmPwd:e.target.value}))}
                  placeholder="Repeat new password"
                  onKeyDown={e=>e.key==="Enter"&&handleChangePassword()}/>
              </div>
              {pwdMsg&&(
                <div style={{fontSize:13,padding:"8px 12px",borderRadius:7,background:pwdMsg.ok?"var(--success-bg)":"var(--err-bg)",color:pwdMsg.ok?"#34d399":"#f87171",border:`1px solid ${pwdMsg.ok?"#34d39940":"#f8717140"}`}}>
                  {pwdMsg.ok?"âœ“":"âœ•"} {pwdMsg.text}
                </div>
              )}
              <div style={{display:"flex",gap:10,marginTop:4}}>
                <button className="bg" style={{flex:1}} onClick={()=>{setShowPwdModal(false);setPwdMsg(null);}}>Cancel</button>
                <button className="bp" style={{flex:1}} onClick={handleChangePassword}>Update Password</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Confirm Dialog â€” replaces window.confirm */}
      <ConfirmModal dlg={confirmDlg}/>

      {/* Toast â€” supports optional Undo */}
      {toast&&(
        <div className="toast" style={{background:toast.ok?"var(--bg3)":"var(--err-bg)",color:toast.ok?"#34d399":"#f87171",border:`1px solid ${toast.ok?"#34d399":"#f87171"}`,display:"flex",alignItems:"center",gap:12,paddingRight:toast.undoFn?10:18}}>
          <span>{toast.ok?"âœ“":"âœ•"} {toast.msg}</span>
          {toast.undoFn&&(
            <button onClick={()=>{ toast.undoFn(); dismissToast(); }}
              style={{background:"transparent",border:`1px solid ${toast.ok?"#34d399":"#f87171"}`,borderRadius:5,padding:"3px 10px",color:toast.ok?"#34d399":"#f87171",cursor:"pointer",fontSize:13,fontWeight:700,fontFamily:"'IBM Plex Sans',sans-serif",flexShrink:0}}>
              â†© Undo
            </button>
          )}
        </div>
      )}
    </div>
  );
}





/* ظـظـظـظـظـظـظـظـظـظـظـظـظـظـظـظـظـظـظـظـظـظـظـظـظـظـظـظـظـظـظـظـظـظـظـظـظـظـظـظـظـظـظـظـظـظـظـظـظـظـظـظـظـظـظـظـ
   SUB-PROJECT MODAL (add / edit)
   ظـظـظـظـظـظـظـظـظـظـظـظـظـظـظـظـظـظـظـظـظـظـظـظـظـظـظـظـظـظـظـظـظـظـظـظـظـظـظـظـظـظـظـظـظـظـظـظـظـظـظـظـظـظـظـظـ */
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
      <h3 style={{fontSize:16,fontWeight:700,color:"var(--text0)",marginBottom:16}}>
        {isEdit?"Edit Sub-site":"Add Sub-site"}
        <span style={{fontSize:13,color:"#a78bfa",marginLeft:8,fontWeight:400}}>Project: {projectId}</span>
      </h3>
      <div style={{display:"grid",gap:10}}>
        <div>
          <label style={{fontSize:13,color:"var(--text2)",fontWeight:600,display:"block",marginBottom:4}}>SUB-SITE NAME <span style={{color:"#f87171"}}>*</span></label>
          <input value={draft.name} onChange={e=>setDraft(p=>({...p,name:e.target.value}))}
            placeholder="e.g. Ipotesti, Craiova, Braduظخ"
            style={{width:"100%",background:"var(--bg2)",border:"1px solid var(--border3)",borderRadius:4,color:"var(--text0)",padding:"6px 8px",fontSize:13,boxSizing:"border-box"}}/>
        </div>
        <div>
          <label style={{fontSize:13,color:"var(--text2)",fontWeight:600,display:"block",marginBottom:4}}>BU ROMANIA PM</label>
          <input value={draft.pm_name||""} onChange={e=>setDraft(p=>({...p,pm_name:e.target.value}))}
            placeholder="e.g. Cosmin, Irena, Alexandaظخ"
            style={{width:"100%",background:"var(--bg2)",border:"1px solid var(--border3)",borderRadius:4,color:"var(--text0)",padding:"6px 8px",fontSize:13,boxSizing:"border-box"}}/>
        </div>
        <div>
          <label style={{fontSize:13,color:"var(--text2)",fontWeight:600,display:"block",marginBottom:4}}>ASSIGNED ENGINEERS</label>
          <div style={{background:"var(--bg2)",border:"1px solid var(--border3)",borderRadius:6,padding:"8px 10px",display:"grid",gridTemplateColumns:"1fr 1fr",gap:5,maxHeight:140,overflowY:"auto"}}>
            {engList.map(e=>{
              const assignedArr = (draft.assigned_engineers||[]).map(String);
              const sel = assignedArr.includes(String(e.id));
              return(
              <label key={e.id} style={{display:"flex",alignItems:"center",gap:6,cursor:"pointer",padding:"2px 4px",borderRadius:3,background:sel?"var(--bg3)":"transparent"}}>
                <input type="checkbox" checked={sel} onChange={()=>setDraft(p=>{
                  const cur=(p.assigned_engineers||[]).map(String);
                  return {...p, assigned_engineers: sel ? cur.filter(x=>x!==String(e.id)) : [...cur,String(e.id)]};
                })} style={{accentColor:"var(--info)"}}/>
                <span style={{fontSize:13,color:sel?"var(--info)":"var(--text2)"}}>{e.name}</span>
              </label>);
            })}
          </div>
        </div>
        <div>
          <label style={{fontSize:13,color:"var(--text2)",fontWeight:600,display:"block",marginBottom:4}}>PM COMMENTS</label>
          <textarea value={draft.pm_comments||""} onChange={e=>setDraft(p=>({...p,pm_comments:e.target.value}))} rows={2}
            placeholder="Comments from BU Romania PMظخ"
            style={{width:"100%",background:"var(--bg2)",border:"1px solid var(--border3)",borderRadius:4,color:"var(--text2)",padding:"6px 8px",fontSize:13,resize:"vertical",boxSizing:"border-box"}}/>
        </div>
        <div>
          <label style={{fontSize:13,color:"var(--text2)",fontWeight:600,display:"block",marginBottom:4}}>PENDING ITEMS</label>
          <textarea value={draft.pendings||""} onChange={e=>setDraft(p=>({...p,pendings:e.target.value}))} rows={2}
            placeholder="e.g. Waiting for IP list, IOA addressesظخ"
            style={{width:"100%",background:"var(--bg2)",border:"1px solid var(--border3)",borderRadius:4,color:"#f87171",padding:"6px 8px",fontSize:13,resize:"vertical",boxSizing:"border-box"}}/>
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

/* ظـظـظـظـظـظـظـظـظـظـظـظـظـظـظـظـظـظـظـظـظـظـظـظـظـظـظـظـظـظـظـظـظـظـظـظـظـظـظـظـظـظـظـظـظـظـظـظـظـظـظـظـظـظـظـظـ
   PROJECTS TAB ظ¤ standalone component (prevents hang)
   ظـظـظـظـظـظـظـظـظـظـظـظـظـظـظـظـظـظـظـظـظـظـظـظـظـظـظـظـظـظـظـظـظـظـظـظـظـظـظـظـظـظـظـظـظـظـظـظـظـظـظـظـظـظـظـظـ */
function ProjectsTab({projects, subprojects, entries, engineers, expandedProj, setExpandedProj,
  setShowProjModal, setEditProjModal, setSubProjModal, deleteProject, deleteSubProject,
  activities, setActivities, supabase, showToast, isAdmin, isLead, isAcct, showConfirm}){
  const [actModal,setActModal] = React.useState(null); // {projId, act:null|object}
  const [actDraft,setActDraft] = React.useState({});
  const [projSearch,setProjSearch]   = React.useState("");
  const [projStatus,setProjStatus]   = React.useState("ALL");
  const [projType,setProjType]       = React.useState("ALL");
  const [projPhase,setProjPhase]     = React.useState("ALL");
  const [projBilling,setProjBilling] = React.useState("ALL");
  const canEdit = isAdmin||isLead;
  const canManageActs = isAdmin||isLead;

  const openActModal=(projId,act=null)=>{
    setActDraft(act?{...act}:{project_id:projId,group_name:"SCADA",category:"Templates",activity_name:"",status:"Not Started",progress:0,assigned_to:"",remarks:""});
    setActModal({projId,act});
  };
  const saveAct=async()=>{
    if(!actDraft.activity_name?.trim()){if(showToast)showToast("Activity name required",false);return;}
    if(actModal.act){
      const{id,...fields}=actDraft;
      const{data,error}=await supabase.from("project_activities").update(fields).eq("id",id).select().single();
      if(error){if(showToast)showToast("Error: "+error.message,false);return;}
      if(setActivities) setActivities(prev=>prev.map(a=>a.id===data.id?data:a));
    } else {
      const{data,error}=await supabase.from("project_activities").insert(actDraft).select().single();
      if(error){if(showToast)showToast("Error: "+error.message,false);return;}
      if(setActivities) setActivities(prev=>[...prev,data]);
    }
    setActModal(null);
    if(showToast)showToast("Activity saved ظ£ô");
  };
  const delAct=async(id)=>{
    const act=(activities||[]).find(a=>a.id===id);
    showConfirm("Delete this activity?",()=>{
      applyUndo(
        showToast,"Activity deleted",
        ()=>{ if(setActivities)setActivities(prev=>prev.filter(a=>a.id!==id)); },
        ()=>{ if(setActivities&&act)setActivities(prev=>[act,...prev]); },
        async()=>{ const{error}=await supabase.from("project_activities").delete().eq("id",id); return error||null; },
        null
      );
    },{title:"Delete Activity",confirmLabel:"Delete"});
  };

  const projHrsMap = useMemo(()=>{
    const m={};
    for(const e of entries){ if(e.entry_type==="work"&&e.project_id) m[e.project_id]=(m[e.project_id]||0)+e.hours; }
    return m;
  },[entries]);

  return(
  <div style={{display:"grid",gap:12}}>
    <div className="card" style={{padding:0,overflow:"hidden"}}>
      {/* ظ¤ظ¤ Header row ظ¤ظ¤ */}
      <div style={{background:"var(--bg0)",borderBottom:"1px solid var(--border)",padding:"14px 20px",display:"flex",alignItems:"center",justifyContent:"space-between",gap:12,flexWrap:"wrap"}}>
        <div>
          <div style={{fontSize:15,fontWeight:700,color:"var(--text0)"}}>Projects</div>
          <div style={{fontSize:13,color:"var(--text3)",marginTop:2}}>
            {projects.filter(p=>{
              const ms=projStatus==="ALL"||p.status===projStatus;
              const mt=projType==="ALL"||p.type===projType;
              const mph=projPhase==="ALL"||p.phase===projPhase;
              const mb=projBilling==="ALL"||(projBilling==="Billable"?p.billable:!p.billable);
              const mq=!projSearch||(p.name||"").toLowerCase().includes(projSearch.toLowerCase())||(p.id||"").toLowerCase().includes(projSearch.toLowerCase())||(p.client||"").toLowerCase().includes(projSearch.toLowerCase());
              return ms&&mt&&mph&&mb&&mq;
            }).length} of {projects.length} projects
          </div>
        </div>
        <div style={{display:"flex",gap:8,alignItems:"center"}}>
          <input value={projSearch} onChange={e=>setProjSearch(e.target.value)} placeholder="Search name, ID, clientظخ"
            style={{width:200,padding:"7px 12px",borderRadius:7,border:"1px solid var(--border)",background:"var(--bg2)",color:"var(--text0)",fontSize:13}}/>
          {canEdit&&<button className="bp" onClick={()=>setShowProjModal(true)}>+ New Project</button>}
        </div>
      </div>
      {/* ظ¤ظ¤ Filter bar ظ¤ظ¤ */}
      <div style={{padding:"10px 20px",borderBottom:"1px solid var(--border)",background:"var(--bg1)",display:"flex",gap:16,flexWrap:"wrap",alignItems:"flex-end"}}>
        {/* Status */}
        <div>
          <div style={{fontSize:11,fontWeight:700,color:"var(--text4)",textTransform:"uppercase",letterSpacing:".06em",marginBottom:5}}>Status</div>
          <div style={{display:"flex",gap:4}}>
            {[["ALL","All"],["Active","Active"],["On Hold","On Hold"],["Completed","Done"]].map(([v,l])=>{
              const cnt=v==="ALL"?projects.length:projects.filter(p=>p.status===v).length;
              const col=v==="Active"?"#34d399":v==="On Hold"?"#fb923c":v==="Completed"?"#a78bfa":"var(--text2)";
              const active=projStatus===v;
              return(<button key={v} onClick={()=>setProjStatus(v)}
                style={{padding:"4px 10px",borderRadius:20,border:`1px solid ${active?col+"90":"var(--border)"}`,
                  background:active?col+"18":"transparent",color:active?col:"var(--text3)",
                  fontSize:12,fontWeight:active?700:500,cursor:"pointer",fontFamily:"'IBM Plex Sans',sans-serif",whiteSpace:"nowrap"}}>
                {l} <span style={{fontSize:11,opacity:.8}}>{cnt}</span>
              </button>);
            })}
          </div>
        </div>
        {/* Type */}
        <div>
          <div style={{fontSize:11,fontWeight:700,color:"var(--text4)",textTransform:"uppercase",letterSpacing:".06em",marginBottom:5}}>Type</div>
          <div style={{display:"flex",gap:4}}>
            {[["ALL","All"],["Renewable Energy","Renewable"],["Industrial","Industrial"]].map(([v,l])=>{
              const col=v==="Renewable Energy"?"#34d399":v==="Industrial"?"#818cf8":"var(--text2)";
              const active=projType===v;
              return(<button key={v} onClick={()=>setProjType(v)}
                style={{padding:"4px 10px",borderRadius:20,border:`1px solid ${active?col+"90":"var(--border)"}`,
                  background:active?col+"18":"transparent",color:active?col:"var(--text3)",
                  fontSize:12,fontWeight:active?700:500,cursor:"pointer",fontFamily:"'IBM Plex Sans',sans-serif",whiteSpace:"nowrap"}}>
                {l}
              </button>);
            })}
          </div>
        </div>
        {/* Billing */}
        <div>
          <div style={{fontSize:11,fontWeight:700,color:"var(--text4)",textTransform:"uppercase",letterSpacing:".06em",marginBottom:5}}>Billing</div>
          <div style={{display:"flex",gap:4}}>
            {[["ALL","All"],["Billable","Billable"],["Internal","Internal"]].map(([v,l])=>{
              const col=v==="Billable"?"#34d399":v==="Internal"?"var(--text3)":"var(--text2)";
              const active=projBilling===v;
              return(<button key={v} onClick={()=>setProjBilling(v)}
                style={{padding:"4px 10px",borderRadius:20,border:`1px solid ${active?col+"90":"var(--border)"}`,
                  background:active?col+"18":"transparent",color:active?col:"var(--text3)",
                  fontSize:12,fontWeight:active?700:500,cursor:"pointer",fontFamily:"'IBM Plex Sans',sans-serif",whiteSpace:"nowrap"}}>
                {l}
              </button>);
            })}
          </div>
        </div>
        {/* Phase */}
        <div>
          <div style={{fontSize:11,fontWeight:700,color:"var(--text4)",textTransform:"uppercase",letterSpacing:".06em",marginBottom:5}}>Phase</div>
          <select value={projPhase} onChange={e=>setProjPhase(e.target.value)}
            style={{background:"var(--bg2)",border:"1px solid var(--border3)",borderRadius:6,padding:"4px 10px",color:"var(--text0)",fontSize:12,fontWeight:600,outline:"none",cursor:"pointer",minWidth:120}}>
            <option value="ALL">All Phases</option>
            {["Design","Basic Engineering","Detailed Engineering","Software","FAT","Commissioning","Closed"].map(ph=><option key={ph}>{ph}</option>)}
          </select>
        </div>
        {/* Clear all */}
        {(projStatus!=="ALL"||projType!=="ALL"||projPhase!=="ALL"||projBilling!=="ALL"||projSearch)&&(
          <button onClick={()=>{setProjStatus("ALL");setProjType("ALL");setProjPhase("ALL");setProjBilling("ALL");setProjSearch("");}}
            style={{padding:"4px 12px",borderRadius:20,border:"1px solid #f8717160",background:"#f8717112",color:"#f87171",
              fontSize:12,fontWeight:700,cursor:"pointer",fontFamily:"'IBM Plex Sans',sans-serif",alignSelf:"flex-end",marginBottom:1}}>
            ظ£ـ Clear filters
          </button>
        )}
      </div>
      <table>
        <thead><tr>
          <th style={{width:28}}></th>
          <th>Name</th><th>No.</th><th>PM</th><th>Client</th><th>Phase</th>
          <th>Status</th><th>Billing</th><th>Hours</th>
          <th>Sub-sites</th>
          <th style={{width:110}}>Actions</th>
        </tr></thead>
        <tbody>{projects.filter(p=>{
          const ms=projStatus==="ALL"||p.status===projStatus;
          const mt=projType==="ALL"||p.type===projType;
          const mph=projPhase==="ALL"||p.phase===projPhase;
          const mb=projBilling==="ALL"||(projBilling==="Billable"?p.billable:!p.billable);
          const mq=!projSearch||(p.name||"").toLowerCase().includes(projSearch.toLowerCase())||(p.id||"").toLowerCase().includes(projSearch.toLowerCase())||(p.client||"").toLowerCase().includes(projSearch.toLowerCase());
          return ms&&mt&&mph&&mb&&mq;
        }).map(p=>{
          const pSubs = subprojects.filter(s=>s.project_id===p.id);
          const isExp = expandedProj[p.id];
          const hrs   = projHrsMap[p.id]||0;
          return(<React.Fragment key={p.id}>
            <tr>
              <td style={{textAlign:"center"}}>
                {pSubs.length>0&&(
                  <button onClick={()=>setExpandedProj(prev=>({...prev,[p.id]:!prev[p.id]}))}
                    style={{background:"none",border:"none",color:"#a78bfa",cursor:"pointer",fontSize:13,padding:0,
                      transition:"transform .2s",display:"inline-block",transform:isExp?"rotate(90deg)":"rotate(0deg)"}}>ظû╢</button>
                )}
              </td>
              <td style={{fontSize:13,fontWeight:600}}>{p.name||p.id}</td>
              <td style={{fontFamily:"'IBM Plex Mono',monospace",fontSize:12,color:"var(--info)"}}>{p.id}</td>
              <td style={{fontSize:13,color:"#a78bfa"}}>{p.pm||"ظ¤"}</td>
              <td style={{color:"var(--text2)",fontSize:13}}>{p.client}</td>
              <td style={{color:"#60a5fa",fontSize:13}}>{p.phase}</td>
              <td><span style={{fontSize:12,padding:"2px 6px",borderRadius:3,fontWeight:700,
                background:p.status==="Active"?"#05603a30":p.status==="On Hold"?"#7c2d1230":"var(--border)",
                color:p.status==="Active"?"#34d399":p.status==="On Hold"?"#fb923c":"#60a5fa"}}>{p.status}</span></td>
              <td><span style={{fontSize:12,padding:"2px 6px",borderRadius:3,fontWeight:700,
                background:p.billable?"var(--bg3)":"#fb923c20",color:p.billable?"var(--info)":"#fb923c"}}>
                {p.billable?"Billable":"Non-Bill"}</span></td>
              <td style={{fontFamily:"'IBM Plex Mono',monospace",color:"var(--info)",fontWeight:700}}>{hrs}h</td>
              <td>
                {pSubs.length>0
                  ? <span style={{fontSize:12,padding:"2px 6px",borderRadius:3,background:"var(--bg3)",color:"#a78bfa",
                      fontWeight:700,cursor:"pointer"}}
                      onClick={()=>setExpandedProj(prev=>({...prev,[p.id]:!prev[p.id]}))}>
                      {pSubs.length} sub-site{pSubs.length>1?"s":""}
                    </span>
                  : <span style={{fontSize:12,color:"var(--text4)"}}>ظ¤</span>
                }
              </td>
              <td><div style={{display:"flex",gap:4}}>
                {canEdit&&<button className="be" title="Edit project" onClick={()=>setEditProjModal({...p})}>ظ£</button>}
                {canEdit&&<button style={{fontSize:13,padding:"2px 7px",borderRadius:4,background:"var(--bg3)",
                  border:"1px solid #a78bfa30",color:"#a78bfa",cursor:"pointer"}}
                  title="Add sub-site" onClick={()=>setSubProjModal({projectId:p.id,sub:null})}>+ظèـ</button>}
                {isAdmin&&<button className="bd" title="Delete project" onClick={()=>deleteProject(p.id)}>ظ£ـ</button>}
              </div></td>
            </tr>
            {/* Sub-project rows */}
            {isExp&&pSubs.map(sp=>(
              <tr key={sp.id} style={{background:"var(--bg2)"}}>
                <td></td>
                <td colSpan={2} style={{paddingLeft:24}}>
                  <div style={{display:"flex",alignItems:"center",gap:6}}>
                    <span style={{color:"var(--text4)",fontSize:13}}>ظ¤¤</span>
                    <span style={{fontSize:13,color:"#a78bfa",fontWeight:600}}>{sp.name}</span>
                  </div>
                </td>
                <td style={{fontSize:13,color:"var(--text2)"}}>{sp.pm_name||"ظ¤"}</td>
                <td colSpan={2} style={{fontSize:13,color:"var(--info)"}}>
                  {(sp.assigned_engineers||[]).map(eid=>engineers.find(e=>String(e.id)===String(eid))?.name).filter(Boolean).join(", ")||"ظ¤"}
                </td>
                <td colSpan={2} style={{fontSize:13,color:"var(--text3)",fontStyle:"italic",
                  maxWidth:200,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{sp.pendings||""}</td>
                <td></td>
                <td><div style={{display:"flex",gap:4}}>
                  {canEdit&&<button className="be" style={{fontSize:13}} onClick={()=>setSubProjModal({projectId:p.id,sub:sp})}>ظ£</button>}
                  {isAdmin&&<button className="bd" style={{fontSize:13}} onClick={()=>deleteSubProject(sp.id)}>ظ£ـ</button>}
                </div></td>
              </tr>
            ))}
          </React.Fragment>);
        })}</tbody>
      </table>
    </div>
  </div>);
}



/* ظـظـظـظـظـظـظـظـظـظـظـظـظـظـظـظـظـظـظـظـظـظـظـظـظـظـظـظـظـظـظـظـظـظـظـظـظـظـظـظـظـظـظـظـظـظـظـظـظـظـظـظـظـظـظـظـ
   FINANCE MODULE COMPONENTS ظ¤ Excel-matched tabs
   ظـظـظـظـظـظـظـظـظـظـظـظـظـظـظـظـظـظـظـظـظـظـظـظـظـظـظـظـظـظـظـظـظـظـظـظـظـظـظـظـظـظـظـظـظـظـظـظـظـظـظـظـظـظـظـظـ */

