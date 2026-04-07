import React, { useState, useMemo } from "react";
import { PHASES, LEVELS, ROLES_LIST, DEFAULT_WEEKEND, fmtCurrency } from "../constants.js";
import { supabase } from "../supabase";
import { ActivityEditModal, AddActivityModal } from "./ActivityModals.jsx";

function applyUndo(showToast, label, removeUI, restoreUI, dbDelete, logFn){
  removeUI();
  let undone = false;
  showToast(label + " — Undo?", false, ()=>{
    undone = true;
    restoreUI();
    showToast("Undo successful âœ“");
  });
  setTimeout(async()=>{
    if(undone) return;
    const err = await dbDelete();
    if(err){ restoreUI(); showToast("Delete failed — restored", false); }
    else logFn?.();
  }, 3100);
}

/* ---- CONFIRM DIALOG — replaces window.confirm everywhere ---- */
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
      // New accounts always get 'engineer' — only admin can upgrade later
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

/* ---- Projects Page Component (extracted to avoid IIFE hook issues) ---- */
/* ---- Edit Project Activities (standalone component — hooks-safe) ---- */
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
                <div><span style={{color:"var(--text4)"}}>Phase: </span><span style={{color:"#60a5fa"}}>{p.phase||"—"}</span></div>
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

      {/* Activity Modal — reuses same AddActivityModal/ActivityEditModal as Tracker */}
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

export { applyUndo, ConfirmModal, SignupScreen, Lbl, ProjectsView, SubProjectModal, ProjectsTab };
