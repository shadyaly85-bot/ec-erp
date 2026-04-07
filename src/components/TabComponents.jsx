import React, { useState, useMemo, useCallback } from "react";
import { FUNCTION_CATS, FUNC_COLORS } from "../constants.js";
import { supabase } from "../supabase";

/* â•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گ
   PROJECT TRACKER — standalone component
/* ---- Shared helpers (module-level, no hooks) ---- */
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

  {/* ---- Page header ---- */}
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
          <div style={{fontFamily:"'IBM Plex Mono',monospace",fontSize:14,color:hrs>0?(FUNC_COLORS[cat]||"var(--info)"):"var(--text4)",fontWeight:700,textAlign:"right"}}>{hrs>0?hrs+"h":"—"}</div>
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
        {FUNCTION_CATS.map(c=><th key={c} style={{textAlign:"right",maxWidth:70,whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis",color:FUNC_COLORS[c]}} title={c}>{c.split("—")[0].split("&")[0].trim().slice(0,11)}</th>)}
      </tr></thead>
      <tbody>{engineers.filter(e=>e.is_active!==false&&e.is_active!==0&&e.is_active!==null&&(!e.termination_date||String(e.termination_date).slice(0,10)>new Date().toISOString().slice(0,10))).map(eng=>{
        const em=engFuncMap[eng.id]||{total:0,cats:{}};
        return(<tr key={eng.id}>
          <td><div style={{fontWeight:600}}>{eng.name}</div><div style={{fontSize:12,color:"var(--text4)"}}>{eng.role}</div></td>
          <td style={{textAlign:"right",fontFamily:"'IBM Plex Mono',monospace",fontWeight:700,color:"#a78bfa"}}>{em.total||"—"}</td>
          {FUNCTION_CATS.map(c=>(
            <td key={c} style={{textAlign:"right",fontFamily:"'IBM Plex Mono',monospace",color:em.cats[c]>0?(FUNC_COLORS[c]||"var(--info)"):"var(--text4)"}}>{em.cats[c]||"—"}</td>
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
          <td style={{color:"var(--text3)",fontStyle:"italic",maxWidth:220,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{e.activity||"—"}</td>
          {isAdmin&&<td>{isMonthFrozen(e.date)?<span title="Month frozen" style={{fontSize:13,color:"#93c5fd",padding:"0 6px"}}>â‌„</span>:<button className="bd" onClick={()=>deleteEntry(e.id,e.engineer_id)}>âœ•</button>}</td>}
        </tr>);
      })}</tbody>
    </table>
  </div>
</div>
  );
}

/* â•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گ
   KPIs TAB — standalone component
   â•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گ */
/* ---- KPI rating helpers — module-level so JSX render can access them ---- */
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
    // 4. Send vacation_approved notification — direct insert, no helper, no prop chain
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
        console.warn("[EC-ERP] vacation_approved insert failed:",ne.message,"— trying fallback without engineer_id column");
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
      console.error("[EC-ERP] approveVacation — entry not found in state! entryId:",entryId,"entries count:",entries.length);
      showToast("âڑ  Approval saved but entry not found — refresh and check",false);
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
      console.error("[EC-ERP] rejectVacation — entry not found! entryId:",entryId);
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
      {icon:"ًں“‹",tip:"Log hours on billable projects every day — even 1h entries count."},
      {icon:"ًںژ“",tip:"Keep knowledge sessions to ~10% of total time (Training & R&D function entries)."},
      {icon:"ًں¤‌",tip:"Log BD activities: tender reviews, proposals, and client meetings as Function → BD/Sales."},
    ],
    B:[
      {icon:"âœچï¸ڈ",tip:"Add a meaningful activity note (>5 chars) to every single work entry — aim for 100%."},
      {icon:"ًں“پ",tip:"Work across multiple active projects; each distinct project boosts your score."},
      {icon:"ًں“‌",tip:"Log lesson-learned and progress-report writing as Function → Documentation."},
    ],
    C:[
      {icon:"ًں“ڑ",tip:"Attend internal or external training sessions and log them as Function → Training Received."},
      {icon:"ًں‘¨â€چًںڈ«",tip:"Run at least one knowledge-sharing session per quarter → Function → Training Given."},
      {icon:"ًں”¬",tip:"Contribute to R&D or tool-building → Function → R&D & Innovation."},
    ],
    D:[
      {icon:"ًں“…",tip:"Submit at least one entry every working week — gaps penalise your compliance score heavily."},
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
          <span style={{fontSize:14,color:"var(--text4)",transition:"transform .2s",transform:open?"rotate(90deg)":"rotate(0deg)"}}>▶</span>
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

    {/* ---- Header ---- */}
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
          <StatRow label="Knowledge capture" value={`${k.knowledgePct}%`} sub="Target: 8—12%" color={k.knowledgePct>=8&&k.knowledgePct<=12?"#34d399":"#fb923c"}/>
          <StatRow label="BD / Sales support" value={`${k.salesBD}h`} sub="Tenders + proposals + BD meetings"/>
        </MetricCard>

        <MetricCard id="B" label="B آ· Project Performance" weight="30%" score={k.projScore} color="#a78bfa">
          <StatRow label="Entry description rate" value={`${k.descRate}%`} sub={`${Math.round(k.descRate/100*k.workE.length)} of ${k.workE.length} entries have notes`} color={k.descRate>=80?"#34d399":"#fb923c"}/>
          <StatRow label="Active projects" value={k.projsWorked} sub="Distinct billable projects this year" color="#a78bfa"/>
          <StatRow label="Documentation hours" value={`${k.docHrs}h`} sub="Reports, lesson-learned, closure docs"/>
        </MetricCard>

        <MetricCard id="C" label="C آ· Development Goal" weight="20%" score={k.devScore} color="#34d399">
          <StatRow label="Training received" value={`${k.trainingReceived}h`} sub="Target ≥8h/yr" color={k.trainingReceived>=8?"#34d399":"#fb923c"}/>
          <StatRow label="Training given" value={`${k.trainingGiven}h`} sub="Knowledge sharing sessions — target ≥4h"/>
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
            <div style={{fontSize:13,fontWeight:700,color:"var(--text2)"}}>Manager Notes <span style={{fontSize:12,fontWeight:400,color:"var(--text4)"}}>— admin only</span></div>
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
          <span style={{fontSize:13,fontWeight:700,color:"var(--text2)"}}>TEAM KPI SCORECARD — {kpiYear}</span>
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

export { FunctionsTab, KPIsTab };
