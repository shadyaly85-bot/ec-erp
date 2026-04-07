import React, { useState, useMemo, useCallback } from "react";
import { supabase } from "../supabase";
import { FUNCTION_CATS, FUNC_COLORS, today } from "../constants.js";
import { ActivityEditModal, AddActivityModal } from "./ActivityModals.jsx";

function ActivityRow({a, actHrs, isAdmin, onEdit, onDelete, isSelected, onSelect, onComment, myProfile, isEngineerRole}){
  const [commentOpen, setCommentOpen] = React.useState(false);
  const [commentText, setCommentText] = React.useState("");
  const [submitting,  setSubmitting]  = React.useState(false);

  const comments = React.useMemo(()=>{
    if(!a.comments) return [];
    if(Array.isArray(a.comments)) return a.comments;
    try{ return JSON.parse(a.comments); }catch{ return []; }
  },[a.comments]);

  const timeAgo = ts=>{
    const s=(Date.now()-new Date(ts).getTime())/1000;
    if(s<60) return "just now";
    if(s<3600) return Math.floor(s/60)+"m ago";
    if(s<86400) return Math.floor(s/3600)+"h ago";
    return new Date(ts+"").toLocaleDateString("en-GB",{day:"2-digit",month:"short"});
  };

  const submitComment=async()=>{
    if(!commentText.trim()||!onComment) return;
    const c={
      id:Date.now().toString(36)+Math.random().toString(36).slice(2),
      author:myProfile?.name||"Unknown",
      role:myProfile?.role_type||myProfile?.role||"",
      text:commentText.trim(),
      ts:new Date().toISOString()
    };
    const next=[...comments,c];
    setSubmitting(true);
    const err=await onComment(a.id, next, {
      isNewComment: true,
      commenterName: myProfile?.name,
      assignedTo: a.assigned_to,
      activityName: a.activity_name,
      projectId: a.project_id
    });
    if(!err) setCommentText("");
    setSubmitting(false);
  };

  const removeComment=async cid=>{
    if(!onComment) return;
    await onComment(a.id, comments.filter(c=>c.id!==cid), null);
  };

  const pct      = Math.round(a.progress*100);
  const sc       = STATUS_COLOR[a.status]||"var(--text3)";
  const today    = new Date(); today.setHours(0,0,0,0);
  const endDt    = a.end_date ? new Date(a.end_date) : null;
  const isOverdue= endDt && endDt < today && a.status!=="Completed";
  const fmtDate  = d => d ? new Date(d).toLocaleDateString("en-GB",{day:"2-digit",month:"short"}) : null;
  const hasComments=comments.length>0;
  // Engineer can only comment on their own assigned activity
  const isOwnActivity = myProfile&&a.assigned_to&&a.assigned_to.trim()===myProfile.name?.trim();
  const canComment = onComment&&(isAdmin||isOwnActivity);

  return(
  <React.Fragment>
    <tr style={{cursor:isEngineerRole&&!canComment?"default":"pointer",background:isSelected?"#0ea5e910":undefined}}
      title={isEngineerRole&&!canComment?"View only â€” you are not assigned to this activity":undefined}
      onClick={()=>{ if(isEngineerRole){ if(canComment) setCommentOpen(o=>!o); } else onEdit(a); }}>
      {onSelect&&<td style={{width:28,paddingLeft:8}} onClick={e=>e.stopPropagation()}>
        <input type="checkbox" checked={!!isSelected} onChange={()=>onSelect(a.id)}
          style={{cursor:"pointer",width:14,height:14,accentColor:"var(--info)"}}/>
      </td>}
      <td style={{maxWidth:200}}>
        <div style={{fontWeight:600,fontSize:13}}>{a.activity_name}</div>
        {a.remarks&&<div style={{fontSize:12,color:"#f87171",fontStyle:"italic",marginTop:1,maxWidth:190,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{a.remarks}</div>}
      </td>
      <td><span style={{fontSize:12,padding:"2px 7px",borderRadius:3,background:STATUS_BG[a.status]||"var(--bg3)",color:sc,fontWeight:700,whiteSpace:"nowrap"}}>{a.status}</span></td>
      <td>
        <div style={{display:"flex",alignItems:"center",gap:7}}>
          <div style={{width:52,height:5,background:"var(--bg1)",borderRadius:3,overflow:"hidden",flexShrink:0}}>
            <div style={{height:"100%",width:`${pct}%`,background:sc,borderRadius:3}}/>
          </div>
          <span style={{fontFamily:"'IBM Plex Mono',monospace",fontSize:13,fontWeight:700,color:sc}}>{pct}%</span>
        </div>
      </td>
      <td style={{fontSize:13,color:"var(--text2)",whiteSpace:"nowrap"}}>{a.assigned_to||"â€”"}</td>
      <td style={{fontSize:12,whiteSpace:"nowrap"}}>
        {(a.start_date||a.end_date)?(
          <div style={{display:"flex",flexDirection:"column",gap:1}}>
            {a.start_date&&<span style={{color:"var(--text3)"}}>â–¶ {fmtDate(a.start_date)}</span>}
            {a.end_date&&<span style={{color:isOverdue?"#f87171":"#fb923c",fontWeight:isOverdue?700:400}}>
              {isOverdue?"âڑ  ":"â–  "}{fmtDate(a.end_date)}
            </span>}
          </div>
        ):<span style={{color:"var(--text4)"}}>â€”</span>}
      </td>
      <td style={{fontFamily:"'IBM Plex Mono',monospace",fontSize:13,color:actHrs>0?"var(--info)":"var(--text4)"}}>{actHrs>0?actHrs+"h":"â€”"}</td>
      {/* Comment bubble â€” visible to admin/lead AND to the assigned engineer */}
      {canComment&&<td onClick={e=>e.stopPropagation()} style={{width:36}}>
        <button title={hasComments?`${comments.length} comment${comments.length!==1?"s":""}`:("Add comment")}
          onClick={e=>{e.stopPropagation();setCommentOpen(o=>!o);}}
          style={{fontSize:11,padding:"2px 7px",borderRadius:4,cursor:"pointer",fontFamily:"'IBM Plex Sans',sans-serif",
            border:`1px solid ${commentOpen||hasComments?"#a78bfa50":"var(--border)"}`,
            background:commentOpen?"#a78bfa20":hasComments?"#a78bfa10":"transparent",
            color:commentOpen||hasComments?"#a78bfa":"var(--text4)",
            display:"flex",alignItems:"center",gap:3,transition:"all .15s"}}>
          <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M10.5 7a1 1 0 01-1 1H3.5l-2 2V2a1 1 0 011-1h7a1 1 0 011 1v5z"/>
          </svg>
          {hasComments&&<span style={{fontFamily:"'IBM Plex Mono',monospace",fontWeight:700}}>{comments.length}</span>}
        </button>
      </td>}
      {/* Delete â€” admin/lead only */}
      {isAdmin&&<td onClick={e=>e.stopPropagation()} style={{width:28}}>
        <button className="bd" style={{fontSize:13,padding:"1px 5px"}} onClick={e=>{e.stopPropagation();onDelete(a.id);}}>âœ•</button>
      </td>}
    </tr>
    {/* â”€â”€ Inline comment thread â”€â”€ */}
    {commentOpen&&(
    <tr style={{background:"#a78bfa06",borderTop:"1px solid #a78bfa20"}}>
      <td colSpan={99} style={{padding:"12px 18px 14px"}} onClick={e=>e.stopPropagation()}>
        {/* Thread */}
        {comments.length===0&&(
          <div style={{fontSize:12,color:"var(--text4)",marginBottom:10,fontStyle:"italic"}}>
            No comments yet. Start the thread.
          </div>
        )}
        <div style={{display:"grid",gap:10,marginBottom:comments.length?12:0}}>
          {comments.map(c=>{
            const isOwn=c.author===myProfile?.name;
            return(
            <div key={c.id} style={{display:"flex",gap:10,alignItems:"flex-start"}}>
              {/* Avatar */}
              <div style={{width:28,height:28,borderRadius:"50%",flexShrink:0,
                background:isOwn?"var(--info)25":"#a78bfa25",
                color:isOwn?"var(--info)":"#a78bfa",
                fontSize:11,fontWeight:700,display:"flex",alignItems:"center",justifyContent:"center"}}>
                {c.author?.slice(0,2).toUpperCase()||"?"}
              </div>
              {/* Bubble */}
              <div style={{flex:1,minWidth:0}}>
                <div style={{display:"flex",alignItems:"baseline",gap:7,marginBottom:3,flexWrap:"wrap"}}>
                  <span style={{fontSize:13,fontWeight:700,color:"var(--text0)"}}>{c.author}</span>
                  {c.role&&<span style={{fontSize:11,color:"var(--text4)",fontStyle:"italic"}}>{c.role}</span>}
                  <span style={{fontSize:11,color:"var(--text4)",marginLeft:"auto",whiteSpace:"nowrap"}}>{timeAgo(c.ts)}</span>
                  {(isAdmin||isOwn)&&(
                    <button onClick={()=>removeComment(c.id)}
                      style={{background:"none",border:"none",color:"var(--text4)",cursor:"pointer",fontSize:12,padding:"0 2px",lineHeight:1}}
                      title="Delete comment">âœ•</button>
                  )}
                </div>
                <div style={{fontSize:13,color:"var(--text1)",background:"var(--bg3)",borderRadius:"0 8px 8px 8px",padding:"8px 12px",lineHeight:1.5,borderLeft:`2px solid ${isOwn?"var(--info)":"#a78bfa"}`}}>
                  {c.text}
                </div>
              </div>
            </div>
            );
          })}
        </div>
        {/* Input bar */}
        <div style={{display:"flex",gap:8,alignItems:"center"}}>
          <div style={{width:28,height:28,borderRadius:"50%",flexShrink:0,
            background:"var(--info)20",color:"var(--info)",
            fontSize:11,fontWeight:700,display:"flex",alignItems:"center",justifyContent:"center"}}>
            {myProfile?.name?.slice(0,2).toUpperCase()||"?"}
          </div>
          <input value={commentText} onChange={e=>setCommentText(e.target.value)}
            onKeyDown={e=>{if(e.key==="Enter"&&!e.shiftKey){e.preventDefault();submitComment();}}}
            placeholder="Add a commentâ€¦ (Enter to send)"
            style={{flex:1,background:"var(--bg2)",border:"1px solid #a78bfa40",borderRadius:20,
              color:"var(--text0)",padding:"6px 14px",fontSize:13,outline:"none"}}/>
          <button className="bp" style={{fontSize:13,padding:"5px 16px",opacity:submitting||!commentText.trim()?0.5:1}}
            disabled={submitting||!commentText.trim()} onClick={submitComment}>
            Send
          </button>
        </div>
      </td>
    </tr>)}
  </React.Fragment>);
}

function ProjectTracker({projects, activities, subprojects, entries, engineers, isAdmin, isLead, isAcct, isEngineerRole, activitiesLoaded, setActivities, setProjects, setNotifications, showToast, logAction, showConfirm, myProfile, onActivityComment,
  trackerProj,  setTrackerProj,
  trackerSub,   setTrackerSub,
  trackerSearch, setTrackerSearch,
  trackerStatus, setTrackerStatus,
  actClipboard,  setActClipboard,
  insertNotif,
}){
  const canEdit = isAdmin || isLead;
  // Persistent state lifted to parent (survives remounts/minimize)
  const trackerSearch_ = trackerSearch;
  const setTrackerSearch_ = setTrackerSearch;
  const trackerStatusF = trackerStatus;
  const setTrackerStatusF = setTrackerStatus;
  // Transient state ظ¤ fine to reset on remount
  const [editActivity, setEditActivity] = useState(null);
  const [addModal,     setAddModal]     = useState(null);
  const [expandedCats, setExpandedCats] = useState({});
  const [bulkSelected, setBulkSelected] = useState(new Set());
  const [bulkStatus,   setBulkStatus]   = useState("Completed");
  // Paste destination state
  const [pasteTargetProj, setPasteTargetProj] = useState("");
  const [pasteTargetSub,  setPasteTargetSub]  = useState("");
  const [dlPanelOpen,    setDlPanelOpen]      = useState(true); // Deadline panel open/closed

  // ظ¤ظ¤ Memoised lookups ظ¤ظ¤
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

  // ظ¤ظ¤ Callbacks ظ¤ظ¤
  const saveActivity = useCallback(async(draft)=>{
    const {id,...fields}=draft;
    const grp = CAT_TO_GROUP[fields.category]||fields.group_name||"SCADA";
    const payload={...fields, group_name:grp, category:fields.category||null, updated_at:new Date().toISOString()};
    const prevActivity=activities.find(a=>a.id===id);
    const {data,error}=await supabase.from("project_activities").update(payload).eq("id",id).select().single();
    if(error){showToast("Error: "+error.message,false);return;}
    setActivities(prev=>prev.map(a=>a.id===data.id?data:a));

    const _now=new Date().toISOString();
    const _changerIsAdmin=myProfile?.role_type==="admin";
    const _proj=projects.find(p=>p.id===(fields.project_id||prevActivity?.project_id));

    // ظ¤ظ¤ Notification: activity_assigned ظ¤ظ¤
    if(fields.assigned_to && fields.assigned_to!==prevActivity?.assigned_to){
      const assignedEng=engineers.find(e=>e.name===fields.assigned_to);
      if(assignedEng&&String(assignedEng.id)!==String(myProfile?.id)){
        const assignMsg=`You were assigned to "${fields.activity_name||data.activity_name}"${_proj?" ┬╖ "+_proj.name:""}`;
        const assignMeta={recipient_engineer_id:String(assignedEng.id),activity_id:id,project_id:fields.project_id,assigned_by:myProfile?.name};
        // Notify engineer ظ¤ fire-and-forget (engineer gets via RT/loadAll; don't add to assigner state)
        insertNotif({type:"activity_assigned",engineer_id:assignedEng.id,read:false,message:assignMsg,created_at:_now,meta:JSON.stringify(assignMeta)});
        // Notify project leader (if set, not the changer, and not the assigned engineer)
        if(_proj?.project_leader){
          const _ldrEng2=engineers.find(e=>e.name===_proj.project_leader);
          if(_ldrEng2&&String(_ldrEng2.id)!==String(myProfile?.id)&&String(_ldrEng2.id)!==String(assignedEng.id)){
            insertNotif({type:"activity_assigned",engineer_id:_ldrEng2.id,read:false,
              message:`${myProfile?.name||"Admin"} assigned "${fields.activity_name||data.activity_name}" to ${assignedEng.name}${_proj?" ┬╖ "+_proj.name:""}`,
              created_at:_now,meta:JSON.stringify({recipient_engineer_id:String(_ldrEng2.id),activity_id:id,project_id:fields.project_id,assigned_to:assignedEng.name,assigned_by:myProfile?.name,role:"project_leader"})});
          }
        }
        // If lead is assigning, also notify all admins (admin already knows ظ¤ they did it)
        if(!_changerIsAdmin){
          const adminMsg=`${myProfile?.name||"Lead"} assigned "${fields.activity_name||data.activity_name}" to ${assignedEng.name}${_proj?" ┬╖ "+_proj.name:""}`;
          const _ap2=engineers.filter(e=>e.role_type==="admin").map(adminEng=>({type:"activity_assigned",engineer_id:adminEng.id,read:false,message:adminMsg,created_at:_now,meta:JSON.stringify({recipient_engineer_id:String(adminEng.id),activity_id:id,project_id:fields.project_id,assigned_to:assignedEng.name,assigned_by:myProfile?.name})}));
          if(_ap2.length) supabase.from("notifications").insert(_ap2).select().then(({data:rows})=>{if(rows){const _my=rows.find(r=>String(r.engineer_id)===String(myProfile?.id));if(_my)setNotifications(prev=>[_my,...prev]);}});
        }
      }
    }

    // ظ¤ظ¤ Notification: activity_status_changed ظ¤ظ¤
    if(fields.status && fields.status!==prevActivity?.status){
      const actName=fields.activity_name||data.activity_name;
      const statusMsg=`"${actName}" marked ${fields.status}${_proj?" ┬╖ "+_proj.name:""}`;
      // Notify assigned engineer (if exists and not the changer)
      if(prevActivity?.assigned_to){
        const assignedEng=engineers.find(e=>e.name===prevActivity.assigned_to);
        if(assignedEng&&String(assignedEng.id)!==String(myProfile?.id)){
          // Fire-and-forget for engineer
          insertNotif({
            type:"activity_status_changed",engineer_id:assignedEng.id,read:false,message:statusMsg,created_at:_now,
            meta:JSON.stringify({recipient_engineer_id:String(assignedEng.id),activity_id:id,project_id:fields.project_id,status:fields.status,changed_by:myProfile?.name})
          });
        }
      }
      // Notify project leader on status change (if not the changer)
      if(_proj?.project_leader){
        const _ldrS=engineers.find(e=>e.name===_proj.project_leader);
        if(_ldrS&&String(_ldrS.id)!==String(myProfile?.id)){
          const _ldrAssigned=prevActivity?.assigned_to&&engineers.find(e=>e.name===prevActivity.assigned_to);
          if(!_ldrAssigned||String(_ldrS.id)!==String(_ldrAssigned.id)){
            insertNotif({type:"activity_status_changed",engineer_id:_ldrS.id,read:false,
              message:`${myProfile?.name||"Admin"} marked "${actName}" as ${fields.status}${_proj?" ┬╖ "+_proj.name:""}`,
              created_at:_now,meta:JSON.stringify({recipient_engineer_id:String(_ldrS.id),activity_id:id,project_id:fields.project_id,status:fields.status,changed_by:myProfile?.name,role:"project_leader"})});
          }
        }
      }
      // If lead changed status, notify all admins (admin already knows)
      if(!_changerIsAdmin){
        const adminStatusMsg=`${myProfile?.name||"Lead"} marked "${actName}" as ${fields.status}${_proj?" ┬╖ "+_proj.name:""}`;
        const _ap3=engineers.filter(e=>e.role_type==="admin").map(adminEng=>({type:"activity_status_changed",engineer_id:adminEng.id,read:false,message:adminStatusMsg,created_at:_now,meta:JSON.stringify({recipient_engineer_id:String(adminEng.id),activity_id:id,project_id:fields.project_id,status:fields.status,changed_by:myProfile?.name})}));
        if(_ap3.length) supabase.from("notifications").insert(_ap3).select().then(({data:rows})=>{if(rows){const _my=rows.find(r=>String(r.engineer_id)===String(myProfile?.id));if(_my)setNotifications(prev=>[_my,...prev]);}});
      }
    }

    // ظ¤ظ¤ Notification: activity_progress_changed ظ¤ظ¤
    // Notify assigned engineer + admins (when lead changes) when progress % is updated
    if(fields.progress!==undefined && fields.progress!==prevActivity?.progress && prevActivity?.assigned_to){
      const assignedEng=engineers.find(e=>e.name===prevActivity.assigned_to);
      const actName=fields.activity_name||data.activity_name;
      const pct=Math.round((fields.progress||0)*100);
      // Notify engineer
      if(assignedEng&&String(assignedEng.id)!==String(myProfile?.id)){
        const progMsg=`"${actName}" progress updated to ${pct}%${_proj?" ┬╖ "+_proj.name:""}`;
        insertNotif({
          type:"activity_progress_changed",engineer_id:assignedEng.id,read:false,message:progMsg,created_at:_now,
          meta:JSON.stringify({recipient_engineer_id:String(assignedEng.id),activity_id:id,project_id:fields.project_id,progress:pct,changed_by:myProfile?.name})
        });
      }
      // Notify project leader on progress change (if not the changer or the assigned eng)
      if(_proj?.project_leader){
        const _ldrP=engineers.find(e=>e.name===_proj.project_leader);
        if(_ldrP&&String(_ldrP.id)!==String(myProfile?.id)){
          const _ldrIsAssigned=assignedEng&&String(_ldrP.id)===String(assignedEng.id);
          if(!_ldrIsAssigned){
            insertNotif({type:"activity_progress_changed",engineer_id:_ldrP.id,read:false,
              message:`"${actName}" progress updated to ${pct}%${_proj?" ┬╖ "+_proj.name:""}`,
              created_at:_now,meta:JSON.stringify({recipient_engineer_id:String(_ldrP.id),activity_id:id,project_id:fields.project_id,progress:pct,changed_by:myProfile?.name,role:"project_leader"})});
          }
        }
      }
      // If lead changed progress, notify all admins (admin already knows)
      if(!_changerIsAdmin){
        const adminProgMsg=`${myProfile?.name||"Lead"} updated "${actName}" to ${pct}%${_proj?" ┬╖ "+_proj.name:""}`;
        const _ap4=engineers.filter(e=>e.role_type==="admin").map(adminEng=>({type:"activity_progress_changed",engineer_id:adminEng.id,read:false,message:adminProgMsg,created_at:_now,meta:JSON.stringify({recipient_engineer_id:String(adminEng.id),activity_id:id,project_id:fields.project_id,progress:pct,changed_by:myProfile?.name})}));
        if(_ap4.length) supabase.from("notifications").insert(_ap4).select().then(({data:rows})=>{if(rows){const _my=rows.find(r=>String(r.engineer_id)===String(myProfile?.id));if(_my)setNotifications(prev=>[_my,...prev]);}});
      }
    }

    // ظ¤ظ¤ Notification: activity_deadline_changed ظ¤ظ¤
    // Notify assigned engineer AND admins (when lead changes) when deadline moves
    if(fields.end_date!==undefined && fields.end_date!==prevActivity?.end_date && prevActivity?.assigned_to){
      const assignedEng=engineers.find(e=>e.name===prevActivity.assigned_to);
      const actName=fields.activity_name||data.activity_name;
      const newDeadline=fields.end_date
        ? new Date(fields.end_date).toLocaleDateString("en-GB",{day:"2-digit",month:"short",year:"numeric"})
        : "removed";
      if(assignedEng&&String(assignedEng.id)!==String(myProfile?.id)){
        const dlMsg=`Deadline for "${actName}" changed to ${newDeadline}${_proj?" ┬╖ "+_proj.name:""}`;
        insertNotif({
          type:"activity_deadline_changed",engineer_id:assignedEng.id,read:false,message:dlMsg,created_at:_now,
          meta:JSON.stringify({recipient_engineer_id:String(assignedEng.id),activity_id:id,project_id:fields.project_id,end_date:fields.end_date,changed_by:myProfile?.name})
        });
      }
      // Notify project leader on deadline change (if not the changer or the assigned eng)
      if(_proj?.project_leader){
        const _ldrD=engineers.find(e=>e.name===_proj.project_leader);
        if(_ldrD&&String(_ldrD.id)!==String(myProfile?.id)){
          const _ldrIsAssignedD=assignedEng&&String(_ldrD.id)===String(assignedEng.id);
          if(!_ldrIsAssignedD){
            insertNotif({type:"activity_deadline_changed",engineer_id:_ldrD.id,read:false,
              message:`Deadline for "${actName}" changed to ${newDeadline}${_proj?" ┬╖ "+_proj.name:""}`,
              created_at:_now,meta:JSON.stringify({recipient_engineer_id:String(_ldrD.id),activity_id:id,project_id:fields.project_id,end_date:fields.end_date,changed_by:myProfile?.name,role:"project_leader"})});
          }
        }
      }
      // If lead changed deadline, notify admins too (admin already knows)
      if(!_changerIsAdmin){
        const adminDlMsg=`${myProfile?.name||"Lead"} changed deadline for "${actName}" to ${newDeadline}${_proj?" ┬╖ "+_proj.name:""}`;
        const _ap5=engineers.filter(e=>e.role_type==="admin").map(adminEng=>({type:"activity_deadline_changed",engineer_id:adminEng.id,read:false,message:adminDlMsg,created_at:_now,meta:JSON.stringify({recipient_engineer_id:String(adminEng.id),activity_id:id,project_id:fields.project_id,end_date:fields.end_date,changed_by:myProfile?.name})}));
        if(_ap5.length) supabase.from("notifications").insert(_ap5).select().then(({data:rows})=>{if(rows){const _my=rows.find(r=>String(r.engineer_id)===String(myProfile?.id));if(_my)setNotifications(prev=>[_my,...prev]);}});
      }
    }

    setEditActivity(null);
    logAction("UPDATE","Tracker",`Updated activity: ${fields.activity_name} on ${fields.project_id}`,{id,project_id:fields.project_id,activity:fields.activity_name,status:fields.status,progress:fields.progress});
    // Auto-assign engineer to project when assigned_to is set (covers sub-site activities too ظ¤ always assign to parent project)
    if(fields.assigned_to){
      const eng=engineers.find(e=>e.name===fields.assigned_to);
      if(eng){
        const projId=fields.project_id;
        const proj=projects.find(p=>p.id===projId);
        const ae=(proj?.assigned_engineers||[]).map(String);
        if(!ae.includes(String(eng.id))){
          const newAe=[...ae,String(eng.id)];
          await supabase.from("projects").update({assigned_engineers:newAe}).eq("id",projId);
          setProjects(prev=>prev.map(p=>p.id===projId?{...p,assigned_engineers:newAe}:p));
          showToast(`${fields.assigned_to} added to ${projId} team ظ£ô`);
          return; // showToast already called
        }
      }
    }
    showToast("Activity saved ظ£ô");
  },[activities,setActivities,showToast,logAction,engineers,projects,setProjects,setNotifications,myProfile]);

  const confirmAdd = useCallback(async({category,activity_name,start_date,end_date,assigned_to})=>{
    if(!addModal) return;
    const {projId,subId}=addModal;
    const grp = CAT_TO_GROUP[category]||"General";
    const {data,error}=await supabase.from("project_activities").insert({
      project_id:projId, subproject_id:subId||null,
      group_name:grp, category:category||null,
      activity_name, status:"Not Started", progress:0,
      start_date:start_date||null, end_date:end_date||null,
      assigned_to:assigned_to||null,
      sort_order:(actsByProj[projId]||[]).length
    }).select().single();
    if(error){showToast("Error: "+error.message,false);return;}
    setActivities(prev=>[...prev,data]);
    logAction("CREATE","Tracker",`Added activity: ${activity_name} on ${projId}`,{project_id:projId,category,activity:activity_name,assigned_to:assigned_to||null});
    // Auto-assign engineer to project if not already assigned
    if(assigned_to){
      const eng=engineers.find(e=>e.name===assigned_to);
      if(eng){
        const proj=projects.find(p=>p.id===projId);
        const ae=(proj?.assigned_engineers||[]).map(String);
        if(!ae.includes(String(eng.id))){
          const newAe=[...ae,String(eng.id)];
          await supabase.from("projects").update({assigned_engineers:newAe}).eq("id",projId);
          setProjects(prev=>prev.map(p=>p.id===projId?{...p,assigned_engineers:newAe}:p));
          showToast(`${assigned_to} added to ${projId} team ظ£ô`);
        }
      }
    }
    setAddModal(null);
    showToast("Activity added ظ£ô");
    if(category) setExpandedCats(p=>({...p,[category]:true}));
  },[addModal,actsByProj,setActivities,showToast,logAction,engineers,projects,setProjects,setNotifications,myProfile]);

  const bulkUpdateStatus = useCallback(async()=>{
    if(!bulkSelected.size) return;
    const ids=[...bulkSelected];
    const prog=bulkStatus==="Completed"?1:bulkStatus==="In Progress"?0.5:0;
    const{error}=await supabase.from("project_activities")
      .update({status:bulkStatus,progress:prog}).in("id",ids);
    if(error){showToast("Bulk update failed: "+error.message,false);return;}
    setActivities(prev=>prev.map(a=>ids.includes(a.id)?{...a,status:bulkStatus,progress:prog}:a));
    setBulkSelected(new Set());
    showToast(`${ids.length} activit${ids.length===1?"y":"ies"} ظْ ${bulkStatus} ظ£ô`);
    logAction("UPDATE","Tracker",`Bulk set ${ids.length} activities to ${bulkStatus}`,{count:ids.length,status:bulkStatus});
  },[bulkSelected,bulkStatus,showToast,logAction]);

  // ظ¤ظ¤ Copy selected activities to clipboard ظ¤ظ¤
  const copyActivities = useCallback(()=>{
    if(!bulkSelected.size){showToast("Select activities first",false);return;}
    const acts=activities.filter(a=>bulkSelected.has(a.id));
    const fromProj=trackerProj;
    const fromSub=trackerSub;
    const fromProjName=projects.find(p=>p.id===fromProj)?.name||fromProj;
    setActClipboard({acts, fromProj, fromSub, fromProjName});
    setBulkSelected(new Set());
    showToast(`${acts.length} activit${acts.length===1?"y":"ies"} copied to clipboard ظ£ô`);
  },[bulkSelected,activities,trackerProj,trackerSub,projects,setActClipboard,showToast]);

  // ظ¤ظ¤ Paste clipboard activities into target project / sub-site ظ¤ظ¤
  const pasteActivities = useCallback(async()=>{
    if(!actClipboard||!actClipboard.acts.length){showToast("Nothing in clipboard",false);return;}
    const targetProj=pasteTargetProj||trackerProj;
    if(!targetProj){showToast("Select a target project",false);return;}
    const targetSub=pasteTargetSub||null;
    const inserts=actClipboard.acts.map((a,i)=>({
      project_id:   targetProj,
      subproject_id:targetSub||null,
      group_name:   a.group_name||null,
      category:     a.category||null,
      activity_name:a.activity_name,
      status:       "Not Started",   // always reset
      progress:     0,               // always reset
      assigned_to:  a.assigned_to||null,
      start_date:   a.start_date||null,
      end_date:     a.end_date||null,
      sort_order:   (actsByProj[targetProj]||[]).length + i,
    }));
    const{data,error}=await supabase.from("project_activities").insert(inserts).select();
    if(error){showToast("Paste failed: "+error.message,false);return;}
    if(data) setActivities(prev=>[...prev,...data]);
    // Auto-assign all pasted engineers to the target project
    const proj=projects.find(p=>p.id===targetProj);
    let ae=(proj?.assigned_engineers||[]).map(String);
    let assigned=false;
    for(const a of actClipboard.acts){
      if(!a.assigned_to) continue;
      const eng=engineers.find(e=>e.name===a.assigned_to);
      if(eng&&!ae.includes(String(eng.id))){
        ae=[...ae,String(eng.id)];
        assigned=true;
      }
    }
    if(assigned){
      await supabase.from("projects").update({assigned_engineers:ae}).eq("id",targetProj);
      setProjects(prev=>prev.map(p=>p.id===targetProj?{...p,assigned_engineers:ae}:p));
    }
    const destName=projects.find(p=>p.id===targetProj)?.name||targetProj;
    const pastedActIds=(data||[]).map(a=>a.id);
    // Offer undo ظ¤ clicking removes the pasted activities from UI and DB
    showToast(
      `${inserts.length} activit${inserts.length===1?"y":"ies"} pasted into ${destName}`,
      true,
      async()=>{
        setActivities(prev=>prev.filter(a=>!pastedActIds.includes(a.id)));
        await supabase.from("project_activities").delete().in("id",pastedActIds);
        showToast("Paste undone ظ£ô");
      }
    );
    logAction("CREATE","Tracker",`Pasted ${inserts.length} activities from ${actClipboard.fromProjName} ظْ ${destName}`,{count:inserts.length,from:actClipboard.fromProj,to:targetProj});
    setPasteTargetProj(""); setPasteTargetSub("");
  },[actClipboard,pasteTargetProj,pasteTargetSub,trackerProj,actsByProj,projects,engineers,setActivities,setProjects,showToast,logAction]);

  const deleteActivity = useCallback(async(id)=>{
    const act=activities.find(a=>a.id===id);
    showConfirm(`Delete activity "${act?.activity_name||id}"?`,()=>{
      applyUndo(
        showToast,"Activity deleted",
        ()=>setActivities(prev=>prev.filter(a=>a.id!==id)),
        ()=>{ if(act)setActivities(prev=>[act,...prev]); },
        async()=>{ const{error}=await supabase.from("project_activities").delete().eq("id",id); return error||null; },
        ()=>logAction("DELETE","Tracker",`Deleted activity: ${act?.activity_name||id} on ${act?.project_id||""}`,{id,project_id:act?.project_id,activity:act?.activity_name})
      );
    },{title:"Delete Activity",confirmLabel:"Delete"});
  },[setActivities,activities,logAction,showConfirm,showToast]);

  // ظ¤ظ¤ Comment handler ظ¤ delegates to app-level appHandleActivityComment for consistent notification routing ظ¤ظ¤
  const handleActivityComment = onActivityComment;
  if(!activitiesLoaded) return(
    <div style={{padding:32,textAlign:"center",color:"var(--text4)",fontSize:15}}>Loading project trackerظخ</div>
  );

  // ظ¤ظ¤ OVERVIEW ظ¤ظ¤
  if(!trackerProj){
    // Engineers see only projects they are assigned to
  const baseProjects=isEngineerRole
    ? projects.filter(p=>(p.assigned_engineers||[]).map(String).includes(String(myProfile?.id))&&(actsByProj[p.id]||[]).length>0)
    : (canEdit||isAcct)
      ? projects
      : projects.filter(p=>(actsByProj[p.id]||[]).length>0);
    const allTrackerProjects=baseProjects.filter(p=>{
      if(trackerStatusF!=="ALL" && p.status!==trackerStatusF) return false;
      if(trackerSearch_){
        const q=trackerSearch_.toLowerCase();
        if(!p.id.toLowerCase().includes(q)&&!(p.name||"").toLowerCase().includes(q)&&!(p.client||"").toLowerCase().includes(q)) return false;
      }
      return true;
    });
    return(<>
    <div style={{display:"grid",gap:14}}>
      <div style={{display:"flex",gap:12,alignItems:"flex-start",flexWrap:"wrap",justifyContent:"space-between"}}>
        <div>
          <div style={{fontSize:11,fontWeight:700,color:"var(--text4)",textTransform:"uppercase",letterSpacing:".1em",marginBottom:4}}>PROJECT TRACKER</div>
          <div style={{fontSize:22,fontWeight:800,color:"var(--text0)"}}>{allTrackerProjects.length}{trackerStatusF!=="ALL"&&<span style={{fontSize:13,color:"var(--text4)",fontWeight:400}}> / {baseProjects.length}</span>} <span style={{fontSize:14,fontWeight:400,color:"var(--text3)"}}>projects ┬╖ {activities.length} activities</span></div>
        </div>
        <div style={{display:"flex",gap:10,alignItems:"flex-end",flexWrap:"wrap"}}>
          {/* Search */}
          <div>
            <div style={{fontSize:12,color:"var(--text4)",fontWeight:700,textTransform:"uppercase",letterSpacing:".06em",marginBottom:5}}>SEARCH</div>
            <input value={trackerSearch_} onChange={e=>setTrackerSearch_(e.target.value)}
              placeholder="Search projectsظخ" style={{width:180}}/>
          </div>
          {/* Status chips */}
          <div>
            <div style={{fontSize:12,color:"var(--text4)",fontWeight:700,textTransform:"uppercase",letterSpacing:".06em",marginBottom:5}}>STATUS</div>
            <div style={{display:"flex",gap:4}}>
              {[
                {v:"ALL",      l:"All",     c:"var(--text2)"},
                {v:"Active",   l:"Active",  c:"#34d399"},
                {v:"On Hold",  l:"On Hold", c:"#fb923c"},
                {v:"Completed",l:"Done",    c:"#a78bfa"},
              ].map(chip=>{
                // Show counts from FULL baseProjects (not filtered) so user knows total per status
                const cnt=chip.v==="ALL"?allTrackerProjects.length:baseProjects.filter(p=>p.status===chip.v).length;
                const active=trackerStatusF===chip.v;
                return(
                  <button type="button" key={chip.v} onClick={()=>setTrackerStatusF(chip.v)}
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
        </div>
      </div>
      {/* ظ¤ظ¤ Deadline Panel ظ¤ظ¤ */}
      {(()=>{
        // FIX: build today string from LOCAL date parts (not toISOString which is UTC)
        const _now=new Date();
        const _todayStr=`${_now.getFullYear()}-${String(_now.getMonth()+1).padStart(2,"0")}-${String(_now.getDate()).padStart(2,"0")}`;
        const _addDays=(n)=>{const d=new Date(_now);d.setDate(_now.getDate()+n);return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,"0")}-${String(d.getDate()).padStart(2,"0")}`;};
        const _7dStr=_addDays(7);
        const _14dStr=_addDays(14);
        // FIX: exclude Cancelled + activities on Completed projects + accountant sees nothing
        const _inactiveProjIds=new Set(projects.filter(p=>p.status==="Completed"||p.status==="On Hold").map(p=>p.id));
        const _scopedActs=activities.filter(a=>{
          if(!a.end_date) return false;
          if(a.status==="Completed"||a.status==="Cancelled"||a.status==="On Hold") return false;
          if(a.end_date>_14dStr) return false;
          if(_inactiveProjIds.has(a.project_id)) return false; // skip On Hold + Completed projects
          if(isAcct&&!isAdmin) return false; // accountant does not see deadline panel; admin is also isAcct so must exclude explicitly
          if(isEngineerRole) return !!(a.assigned_to&&myProfile?.name&&a.assigned_to.trim()===myProfile.name.trim());
          if(isLead&&!isAdmin){ const _ids=new Set(baseProjects.map(p=>p.id)); return _ids.has(a.project_id); }
          return true; // admin: all
        });
        if(!_scopedActs.length) return null;
        const _overdue  =_scopedActs.filter(a=>a.end_date<_todayStr).sort((a,b)=>a.end_date.localeCompare(b.end_date));
        const _thisWeek =_scopedActs.filter(a=>a.end_date>=_todayStr&&a.end_date<=_7dStr).sort((a,b)=>a.end_date.localeCompare(b.end_date));
        const _upcoming =_scopedActs.filter(a=>a.end_date>_7dStr).sort((a,b)=>a.end_date.localeCompare(b.end_date));
        const _fmtDate=d=>new Date(d+"T12:00:00").toLocaleDateString("en-GB",{weekday:"short",day:"2-digit",month:"short"});
        // FIX: use string comparison for "Due today" to avoid timezone arithmetic bug
        const _daysLeft=d=>{
          if(d===_todayStr) return "Due today";
          if(d<_todayStr){
            // count overdue days via string-safe calc
            const diff=Math.round((new Date(d+"T12:00:00")-new Date(_todayStr+"T12:00:00"))/(1000*60*60*24));
            return `${Math.abs(diff)}d overdue`;
          }
          const diff=Math.round((new Date(d+"T12:00:00")-new Date(_todayStr+"T12:00:00"))/(1000*60*60*24));
          if(diff===1) return "Due tomorrow";
          return `${diff}d left`;
        };
        // Plain render function ظ¤ NOT a component, no hooks
        const _renderRow=(a,urgent)=>{
          const _proj=projects.find(p=>p.id===a.project_id);
          const _ov=a.end_date<_todayStr;
          const _col=_ov?"#f87171":urgent?"#fb923c":"#34d399";
          const _bg=_ov?"#7f1d1d18":urgent?"#78350f18":"#14532d18";
          return(
            <div key={a.id}
              onClick={()=>{setTrackerProj(a.project_id);setTrackerSub(null);}}
              onKeyDown={e=>{if(e.key==="Enter"||e.key===" "){setTrackerProj(a.project_id);setTrackerSub(null);}}}
              role="button" tabIndex={0}
              title={`Open ${_proj?.name||a.project_id}`}
              style={{display:"flex",alignItems:"center",gap:10,padding:"7px 12px",borderRadius:7,
                background:_bg,border:`1px solid ${_col}30`,cursor:"pointer",transition:"border-color .15s"}}
              onMouseEnter={e=>e.currentTarget.style.borderColor=_col+"80"}
              onMouseLeave={e=>e.currentTarget.style.borderColor=_col+"30"}>
              <span style={{fontSize:13,flexShrink:0}}>{_ov?"≡ا¤┤":urgent?"≡ااة":"≡اات"}</span>
              <div style={{flex:1,minWidth:0}}>
                <div style={{display:"flex",alignItems:"center",gap:6,flexWrap:"wrap"}}>
                  <span style={{fontSize:12,fontWeight:700,color:_col,fontFamily:"'IBM Plex Mono',monospace"}}>{_fmtDate(a.end_date)}</span>
                  <span style={{fontSize:12,color:"var(--text4)"}}>┬╖</span>
                  <span style={{fontSize:13,fontWeight:600,color:"var(--text0)",overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{a.activity_name}</span>
                </div>
                <div style={{display:"flex",gap:6,marginTop:2,alignItems:"center"}}>
                  <span style={{fontSize:11,color:"var(--text4)",overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{_proj?.name||a.project_id}</span>
                  {a.assigned_to&&!isEngineerRole&&<><span style={{fontSize:11,color:"var(--text4)"}}>┬╖</span><span style={{fontSize:11,color:"var(--info)",fontWeight:600}}>{a.assigned_to}</span></>}
                </div>
              </div>
              <span style={{fontSize:11,fontWeight:700,color:_col,fontFamily:"'IBM Plex Mono',monospace",
                background:_col+"20",padding:"2px 7px",borderRadius:10,whiteSpace:"nowrap",flexShrink:0}}>
                {_daysLeft(a.end_date)}
              </span>
            </div>
          );
        };
        const _total=_overdue.length+_thisWeek.length+_upcoming.length;
        return(
          <div style={{background:"var(--bg1)",border:`1px solid ${_overdue.length?"#f8717140":"var(--border3)"}`,borderRadius:10,overflow:"hidden",marginBottom:2}}>
            <div onClick={()=>setDlPanelOpen(o=>!o)}
              style={{display:"flex",alignItems:"center",gap:10,padding:"10px 16px",cursor:"pointer",
                background:_overdue.length?"#7f1d1d10":"var(--bg0)",userSelect:"none"}}>
              <span style={{fontSize:15}}>{_overdue.length?"≡ا¤┤":"≡اôà"}</span>
              <span style={{fontSize:13,fontWeight:700,color:_overdue.length?"#f87171":"var(--text0)"}}>
                Deadlines
                {_overdue.length>0&&<span style={{marginLeft:6,background:"#f8717130",color:"#f87171",fontSize:11,padding:"1px 7px",borderRadius:8,fontWeight:700}}>{_overdue.length} overdue</span>}
                {_thisWeek.length>0&&<span style={{marginLeft:6,background:"#fb923c20",color:"#fb923c",fontSize:11,padding:"1px 7px",borderRadius:8,fontWeight:700}}>{_thisWeek.length} this week</span>}
                {_upcoming.length>0&&<span style={{marginLeft:6,background:"#34d39920",color:"#34d399",fontSize:11,padding:"1px 7px",borderRadius:8,fontWeight:700}}>{_upcoming.length} upcoming</span>}
              </span>
              <span style={{marginLeft:"auto",fontSize:12,color:"var(--text4)"}}>{dlPanelOpen?"ظû▓":"ظû╝"} {_total} ┬╖ click to {dlPanelOpen?"collapse":"expand"}</span>
            </div>
            {dlPanelOpen&&(
              <div style={{padding:"10px 12px",display:"grid",gap:5}}>
                {_overdue.length>0&&<>
                  <div style={{fontSize:11,fontWeight:700,color:"#f87171",textTransform:"uppercase",letterSpacing:".08em",padding:"4px 4px 2px"}}>≡ا¤┤ Overdue</div>
                  {_overdue.map(a=>_renderRow(a,false))}
                </>}
                {_thisWeek.length>0&&<>
                  <div style={{fontSize:11,fontWeight:700,color:"#fb923c",textTransform:"uppercase",letterSpacing:".08em",padding:"4px 4px 2px",marginTop:_overdue.length?6:0}}>≡ااة Due This Week</div>
                  {_thisWeek.map(a=>_renderRow(a,true))}
                </>}
                {_upcoming.length>0&&<>
                  <div style={{fontSize:11,fontWeight:700,color:"#34d399",textTransform:"uppercase",letterSpacing:".08em",padding:"4px 4px 2px",marginTop:(_overdue.length||_thisWeek.length)?6:0}}>≡اات Next 14 Days</div>
                  {_upcoming.map(a=>_renderRow(a,false))}
                </>}
              </div>
            )}
          </div>
        );
      })()}

      <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(280px,1fr))",gap:10}}>
        {allTrackerProjects.map(p=>{
          const projActs=actsByProj[p.id]||[];
          const hasSubs=subprojects.some(s=>s.project_id===p.id);
          const totalHrs=getProjHrs(p.id);
          const overallPct=projActs.length>0?Math.round(projActs.reduce((s,a)=>s+a.progress,0)/projActs.length*100):0;
          const barColor=overallPct>=90?"#34d399":overallPct>=60?"var(--info)":overallPct>=30?"#fb923c":"#f87171";
          const done=projActs.filter(a=>a.status==="Completed").length;
          const active=projActs.filter(a=>a.status==="In Progress").length;
          const pending=projActs.filter(a=>a.status==="Not Started").length;
          return(
          <div key={p.id} onClick={()=>setTrackerProj(p.id)}
            style={{background:"var(--bg2)",border:"1px solid var(--border3)",borderRadius:10,padding:"14px 16px",cursor:"pointer",transition:"border-color .15s"}}
            onMouseEnter={e=>e.currentTarget.style.borderColor="var(--info)"}
            onMouseLeave={e=>e.currentTarget.style.borderColor="var(--border3)"}>
            {/* Header */}
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:10}}>
              <div style={{flex:1,minWidth:0,paddingRight:8}}>
                <div style={{fontSize:14,fontWeight:700,color:"var(--text0)",marginBottom:2,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{p.name||p.id}</div>
                <div style={{display:"flex",alignItems:"center",gap:6}}>
                  <span style={{fontFamily:"'IBM Plex Mono',monospace",fontSize:11,color:"var(--info)"}}>{p.id}</span>
                  {p.status!=="Active"&&<span style={{fontSize:11,fontWeight:600,padding:"1px 6px",borderRadius:3,
                    background:p.status==="On Hold"?"#fb923c15":"#a78bfa15",
                    color:p.status==="On Hold"?"#fb923c":"#a78bfa"}}>{p.status}</span>}
                </div>
                {p.project_leader&&<div style={{fontSize:12,color:"var(--info)",marginTop:2,fontWeight:700}}>Leader: {p.project_leader}</div>}
                {p.pm&&<div style={{fontSize:12,color:"#a78bfa",marginTop:1}}>PM: <span style={{fontWeight:600}}>{p.pm}</span></div>}
              </div>
              <div style={{textAlign:"right",flexShrink:0}}>
                <div style={{fontFamily:"'IBM Plex Mono',monospace",fontSize:20,fontWeight:800,color:barColor,lineHeight:1}}>{overallPct}%</div>
                <div style={{fontSize:11,color:"var(--text4)",marginTop:2}}>{totalHrs}h logged</div>
              </div>
            </div>
            {/* Progress bar */}
            <div style={{background:"var(--bg1)",borderRadius:4,height:5,overflow:"hidden",marginBottom:10}}>
              <div style={{height:"100%",width:`${overallPct}%`,background:barColor,borderRadius:4,transition:"width .4s"}}/>
            </div>
            {/* Activity chips */}
            <div style={{display:"flex",gap:5,flexWrap:"wrap"}}>
              {done>0&&<span style={{fontSize:11,padding:"2px 8px",borderRadius:4,background:"#34d39915",color:"#34d399",fontWeight:600,border:"1px solid #34d39930"}}>{done} Done</span>}
              {active>0&&<span style={{fontSize:11,padding:"2px 8px",borderRadius:4,background:"var(--info)15",color:"var(--info)",fontWeight:600,border:"1px solid var(--info)30"}}>{active} Active</span>}
              {pending>0&&<span style={{fontSize:11,padding:"2px 8px",borderRadius:4,background:"var(--bg3)",color:"var(--text3)",fontWeight:600}}>{pending} Pending</span>}
              {hasSubs&&<span style={{fontSize:11,padding:"2px 8px",borderRadius:4,background:"#a78bfa15",color:"#a78bfa",fontWeight:600,border:"1px solid #a78bfa30"}}>{subprojects.filter(s=>s.project_id===p.id).length} sub-sites</span>}
              {projActs.length===0&&canEdit&&(
                <span style={{fontSize:11,padding:"2px 8px",borderRadius:4,background:"transparent",color:"var(--info)",border:"1px dashed var(--border3)",cursor:"pointer"}}
                  onClick={e=>{e.stopPropagation();setTrackerProj(p.id);}}>
                  + Add activities
                </span>
              )}
              {projActs.length===0&&!canEdit&&<span style={{fontSize:11,color:"var(--text4)",fontStyle:"italic"}}>No activities yet</span>}
            </div>
          </div>);
        })}
      </div>
    </div>
    {addModal&&<AddActivityModal projId={addModal.projId} subId={addModal.subId} defaultCat={addModal.defaultCat} engineers={engineers} onSave={confirmAdd} onClose={()=>setAddModal(null)}/>}
    </>);
  }

  // ظ¤ظ¤ PROJECT DETAIL ظ¤ظ¤
  const selProj=projects.find(p=>p.id===trackerProj);
  if(!selProj) return null;
  const projSubs=subprojects.filter(s=>s.project_id===trackerProj);
  const hasSubs=projSubs.length>0;
  const projActs=actsByProj[trackerProj]||[];
  const visActs=trackerSub
    ? projActs.filter(a=>String(a.subproject_id)===String(trackerSub))
    : projActs;

  // Group by category ظ¤ ordered by TAXONOMY_GROUPS definition so SCADA categories stay together
  // Build ordered list: for each group in order, add its categories that have activities
  const ORDERED_GROUPS = ["SCADA","RTU-PLC","Protection","General"];
  const orderedCats = [];
  ORDERED_GROUPS.forEach(grp=>{
    (TAXONOMY_GROUPS[grp]||[]).forEach(cat=>{
      if(visActs.some(a=>(a.category===cat)||(a.group_name===cat&&!a.category))){
        orderedCats.push(cat);
      }
    });
  });
  // Also add any categories not in taxonomy (custom ones) at the end
  const knownCats = new Set(orderedCats);
  visActs.forEach(a=>{
    const cat = a.category||(CAT_TO_GROUP[a.group_name]?null:a.group_name)||null;
    if(cat&&!knownCats.has(cat)){ orderedCats.push(cat); knownCats.add(cat); }
  });
  const catNames = orderedCats;
  // Activity belongs to a category if: a.category===cat OR (no category and group_name===cat)
  const getActsForCat = cat => visActs.filter(a=>
    a.category===cat || ((!a.category)&&(a.group_name===cat))
  );
  const uncategorised=visActs.filter(a=>!a.group_name&&!a.category);

  const overallPct=projActs.length>0?Math.round(projActs.reduce((s,a)=>s+a.progress,0)/projActs.length*100):0;
  const barColor=overallPct>=90?"#34d399":overallPct>=60?"var(--info)":overallPct>=30?"#fb923c":"#f87171";
  const totalHrs=getProjHrs(trackerProj);

  return(<>
  <div style={{display:"grid",gap:14}}>
    {/* Breadcrumb */}
    <div style={{display:"flex",alignItems:"center",gap:10,flexWrap:"wrap"}}>
      <button className="bg" style={{fontSize:13}} onClick={()=>{setTrackerProj(null);setTrackerSub(null);setExpandedCats({});}}>ظ All Projects</button>
      <span style={{color:"var(--text4)"}}>/</span>
      <span style={{fontSize:15,fontWeight:700,color:"var(--text0)"}}>{selProj.name||trackerProj}</span>
      <span style={{fontFamily:"'IBM Plex Mono',monospace",fontSize:13,color:"var(--info)"}}>{trackerProj}</span>
      {hasSubs&&trackerSub&&(
        <><span style={{color:"var(--text4)"}}>/</span>
        <span style={{fontSize:14,color:"#a78bfa"}}>{projSubs.find(s=>String(s.id)===String(trackerSub))?.name}</span>
        <button className="bg" style={{fontSize:13}} onClick={()=>setTrackerSub(null)}>All Sites</button></>
      )}
      <div style={{marginLeft:"auto",display:"flex",gap:8,alignItems:"center"}}>
        <div style={{fontFamily:"'IBM Plex Mono',monospace",fontSize:20,fontWeight:700,color:barColor}}>{overallPct}%</div>
        <div style={{fontSize:13,color:"var(--text4)"}}>{totalHrs}h logged</div>
        {canEdit&&<button className="bp" style={{fontSize:13}} onClick={()=>setAddModal({projId:trackerProj,subId:trackerSub||null})}>+ Add Activity</button>}
      </div>
    </div>

    {/* Progress bar */}
    <div style={{background:"var(--bg2)",borderRadius:4,height:8,overflow:"hidden"}}>
      <div style={{height:"100%",width:`${overallPct}%`,background:barColor,borderRadius:4,transition:"width .5s"}}/>
    </div>

    {/* Sub-site tabs */}
    {hasSubs&&(
    <div style={{display:"flex",gap:6,flexWrap:"wrap"}}>
      <button onClick={()=>{setTrackerSub(null);setExpandedCats({});}}
        style={{fontSize:13,padding:"4px 12px",borderRadius:5,border:`1px solid ${!trackerSub?"var(--info)":"var(--border)"}`,background:!trackerSub?"var(--bg3)":"transparent",color:!trackerSub?"var(--info)":"var(--text3)",cursor:"pointer"}}>
        All Sites
      </button>
      {projSubs.map(sp=>{
        const spActs=projActs.filter(a=>String(a.subproject_id)===String(sp.id));
        const spPct=spActs.length>0?Math.round(spActs.reduce((s,a)=>s+a.progress,0)/spActs.length*100):0;
        const isSel=String(trackerSub)===String(sp.id);
        const sc=spPct>=90?"#34d399":spPct>=60?"var(--info)":spPct>=30?"#fb923c":"#f87171";
        return(
        <button key={sp.id} onClick={()=>{setTrackerSub(sp.id);setExpandedCats({});}}
          style={{fontSize:13,padding:"4px 10px",borderRadius:5,border:`1px solid ${isSel?sc:"var(--border)"}`,background:isSel?sc+"20":"transparent",color:isSel?sc:"var(--text3)",cursor:"pointer"}}>
          {sp.name} <span style={{fontFamily:"'IBM Plex Mono',monospace",fontWeight:700}}>{spPct}%</span>
        </button>);
      })}
    </div>)}

    {/* ظ¤ظ¤ Activity Clipboard Paste Bar ظ¤ظ¤ */}
    {actClipboard&&canEdit&&(
      <div style={{display:"flex",gap:10,alignItems:"center",padding:"12px 16px",background:"#a78bfa15",border:"1px solid #a78bfa40",borderRadius:10,flexWrap:"wrap"}}>
        
        <div style={{flex:1,minWidth:200}}>
          <div style={{fontSize:14,fontWeight:700,color:"#a78bfa"}}>
            {actClipboard.acts.length} activit{actClipboard.acts.length===1?"y":"ies"} in clipboard
          </div>
          <div style={{fontSize:13,color:"var(--text3)",marginTop:2}}>
            From: <span style={{color:"var(--text0)",fontWeight:600}}>{actClipboard.fromProjName}</span>
            {actClipboard.fromSub&&<span> ظ║ {subprojects.find(s=>String(s.id)===String(actClipboard.fromSub))?.name}</span>}
            <span style={{marginLeft:8,fontSize:12,color:"var(--text4)"}}>┬╖ Status resets to Not Started on paste</span>
          </div>
        </div>
        <div style={{display:"flex",gap:8,alignItems:"center",flexWrap:"wrap"}}>
          <div>
            <div style={{fontSize:11,color:"var(--text4)",fontWeight:700,letterSpacing:".06em",textTransform:"uppercase",marginBottom:3}}>Target Project</div>
            <select value={pasteTargetProj||trackerProj||""} onChange={e=>setPasteTargetProj(e.target.value)} style={{fontSize:13,width:160}}>
              {projects.filter(p=>p.status==="Active").map(p=><option key={p.id} value={p.id}>{p.name||p.id}</option>)}
            </select>
          </div>
          {(()=>{
            const tProj=pasteTargetProj||trackerProj;
            const tSubs=subprojects.filter(s=>s.project_id===tProj);
            if(!tSubs.length) return null;
            return(
              <div>
                <div style={{fontSize:11,color:"var(--text4)",fontWeight:700,letterSpacing:".06em",textTransform:"uppercase",marginBottom:3}}>Sub-site (optional)</div>
                <select value={pasteTargetSub} onChange={e=>setPasteTargetSub(e.target.value)} style={{fontSize:13,width:140}}>
                  <option value="">ظ¤ No sub-site ظ¤</option>
                  {tSubs.map(s=><option key={s.id} value={s.id}>{s.name}</option>)}
                </select>
              </div>
            );
          })()}
          <button className="bp" style={{fontSize:13,padding:"7px 18px",alignSelf:"flex-end"}} onClick={pasteActivities}>
            ظآ Paste {actClipboard.acts.length}
          </button>
          <button className="bg" style={{fontSize:13,alignSelf:"flex-end"}} onClick={()=>{setActClipboard(null);setPasteTargetProj("");setPasteTargetSub("");}}>
            ظ£ـ Clear
          </button>
        </div>
      </div>
    )}

    {/* Category accordion sections ظ¤ grouped by TAXONOMY order */}
    {canEdit&&bulkSelected.size>0&&(
      <div style={{display:"flex",gap:8,alignItems:"center",padding:"8px 14px",background:"#0ea5e915",border:"1px solid #0ea5e930",borderRadius:8,flexWrap:"wrap"}}>
        <span style={{fontSize:13,fontWeight:700,color:"var(--info)"}}>{bulkSelected.size} selected</span>
        <span style={{color:"var(--text4)",fontSize:13}}>ظْ Set to:</span>
        <select value={bulkStatus} onChange={e=>setBulkStatus(e.target.value)}
          style={{background:"var(--bg2)",border:"1px solid var(--border3)",borderRadius:5,padding:"4px 8px",color:"var(--text0)",fontSize:13}}>
          {["Not Started","In Progress","On Hold","Completed"].map(s=><option key={s}>{s}</option>)}
        </select>
        <button className="bp" style={{fontSize:13,padding:"4px 14px"}} onClick={bulkUpdateStatus}>Apply</button>
        <button style={{fontSize:13,padding:"4px 14px",borderRadius:6,border:"1px solid #a78bfa50",background:"#a78bfa15",color:"#a78bfa",cursor:"pointer",fontFamily:"'IBM Plex Sans',sans-serif",fontWeight:600}}
          onClick={copyActivities}>
          ≡اôï Copy selection
        </button>
        <button className="bg" style={{fontSize:13,padding:"4px 10px"}} onClick={()=>setBulkSelected(new Set())}>ظ£ـ Clear</button>
      </div>
    )}
    <div style={{display:"grid",gap:8}}>
      {catNames.map(cat=>{
        const catActs=getActsForCat(cat);
        const catPct=Math.round(catActs.reduce((s,a)=>s+a.progress,0)/catActs.length*100);
        const catDone=catActs.filter(a=>a.status==="Completed").length;
        const isOpen=expandedCats[cat]!==false;
        const catGroup=CAT_TO_GROUP[cat]||null;
        const GROUP_COLORS_MAP={"SCADA":"var(--info)","RTU-PLC":"#a78bfa","Protection":"#f87171","General":"#34d399"};
        const catColor=GROUP_COLORS_MAP[catGroup]||(catPct>=90?"#34d399":catPct>=60?"var(--info)":catPct>=30?"#fb923c":"#f87171");
        return(
        <div key={cat} style={{background:"var(--bg2)",border:`1px solid ${catColor}30`,borderRadius:8,overflow:"hidden"}}>
          {/* Category header ظ¤ clickable to collapse */}
          <div onClick={()=>toggleCat(cat)}
            style={{display:"flex",alignItems:"center",gap:10,padding:"10px 14px",cursor:"pointer",background:"var(--bg0)"}}
            onMouseEnter={e=>e.currentTarget.style.background="var(--bg3)"}
            onMouseLeave={e=>e.currentTarget.style.background="var(--bg0)"}>
            <span style={{fontSize:13,color:"var(--text4)",transition:"transform .2s",display:"inline-block",transform:isOpen?"rotate(90deg)":"rotate(0deg)"}}>ظû╢</span>
            {catGroup&&<span style={{fontSize:11,padding:"1px 6px",borderRadius:3,background:catColor+"20",color:catColor,fontWeight:700,flexShrink:0}}>{catGroup}</span>}
            <span style={{fontSize:13,fontWeight:700,color:catColor,flex:1}}>{cat}</span>
            {/* Mini progress bar */}
            <div style={{width:80,height:5,background:"var(--bg1)",borderRadius:3,overflow:"hidden"}}>
              <div style={{height:"100%",width:`${catPct}%`,background:catColor,borderRadius:3}}/>
            </div>
            <span style={{fontFamily:"'IBM Plex Mono',monospace",fontSize:13,fontWeight:700,color:catColor,width:32,textAlign:"right"}}>{catPct}%</span>
            <span style={{fontSize:12,color:"var(--text4)",width:60,textAlign:"right"}}>{catDone}/{catActs.length} done</span>
            {canEdit&&<button className="bp" style={{fontSize:12,padding:"1px 7px",marginLeft:4}}
              onClick={e=>{e.stopPropagation();setAddModal({projId:trackerProj,subId:trackerSub||null,defaultCat:cat});}}>+</button>}
          </div>
          {/* Activity rows */}
          {isOpen&&(
          <table style={{margin:0}}>
            <thead><tr>
              {canEdit&&<th style={{width:28}}></th>}
              <th>Activity</th><th>Status</th><th>Progress</th>
              <th>Assigned</th><th>Dates</th><th>Hours</th>
              {(canEdit||isEngineerRole)&&<th style={{width:36}}></th>}
              {canEdit&&<th style={{width:28}}></th>}
            </tr></thead>
            <tbody>
              {catActs.map(a=>(
                <ActivityRow key={a.id} a={a} actHrs={getHrs(a.id)}
                  isAdmin={canEdit} onEdit={setEditActivity} onDelete={deleteActivity}
                  isSelected={bulkSelected.has(a.id)}
                  onSelect={canEdit?(id=>setBulkSelected(prev=>{const s=new Set(prev);s.has(id)?s.delete(id):s.add(id);return s;})):null}
                  onComment={handleActivityComment} myProfile={myProfile} isEngineerRole={isEngineerRole}/>
              ))}
            </tbody>
          </table>)}
        </div>
        );
      })}

      {/* Uncategorised activities */}
      {uncategorised.length>0&&(
      <div style={{background:"var(--bg2)",border:"1px solid var(--border3)",borderRadius:8,overflow:"hidden"}}>
        <div style={{padding:"8px 14px",background:"var(--bg0)",fontSize:13,color:"var(--text3)",fontWeight:700}}>UNCATEGORISED</div>
        <table style={{margin:0}}>
          <thead><tr>
            {canEdit&&<th style={{width:28}}></th>}
            <th>Activity</th><th>Status</th><th>Progress</th>
            <th>Assigned</th><th>Dates</th><th>Hours</th>
            {(canEdit||isEngineerRole)&&<th style={{width:36}}></th>}
            {canEdit&&<th style={{width:28}}></th>}
          </tr></thead>
          <tbody>
            {uncategorised.map(a=>(
              <ActivityRow key={a.id} a={a} actHrs={getHrs(a.id)}
                isAdmin={canEdit} onEdit={setEditActivity} onDelete={deleteActivity}
                isSelected={bulkSelected.has(a.id)}
                onSelect={canEdit?(id=>setBulkSelected(prev=>{const s=new Set(prev);s.has(id)?s.delete(id):s.add(id);return s;})):null}
                onComment={handleActivityComment} myProfile={myProfile} isEngineerRole={isEngineerRole}/>
            ))}
          </tbody>
        </table>
      </div>)}

      {visActs.length===0&&(
        <div style={{textAlign:"center",padding:"40px 24px",background:"var(--bg2)",borderRadius:8,border:"1px dashed var(--border3)"}}>
          
          <div style={{fontSize:15,fontWeight:600,color:"var(--text0)",marginBottom:6}}>No activities yet</div>
          <div style={{fontSize:13,color:"var(--text4)",marginBottom:canEdit?18:0}}>
            {trackerSub
              ? "No activities have been added to this sub-site yet."
              : "This project has no tracker activities."}
          </div>
          {canEdit&&(
            <button className="bp" style={{fontSize:13,padding:"7px 18px"}}
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
        {label:"Completed",  count:visActs.filter(a=>a.status==="Completed").length,  color:"#34d399",bg:"var(--bg3)"},
        {label:"In Progress",count:visActs.filter(a=>a.status==="In Progress").length, color:"var(--info)",bg:"var(--bg3)"},
        {label:"Not Started",count:visActs.filter(a=>a.status==="Not Started").length, color:"var(--text3)",bg:"var(--bg3)"},
        {label:"On Hold",    count:visActs.filter(a=>a.status==="On Hold").length,     color:"#fb923c",bg:"var(--bg3)"},
      ].filter(s=>s.count>0).map(s=>(
        <div key={s.label} style={{display:"flex",gap:6,alignItems:"center",background:s.bg,border:`1px solid ${s.color}25`,borderRadius:6,padding:"5px 10px"}}>
          <span style={{fontFamily:"'IBM Plex Mono',monospace",fontSize:16,fontWeight:700,color:s.color}}>{s.count}</span>
          <span style={{fontSize:13,color:"var(--text3)"}}>{s.label}</span>
        </div>
      ))}
      <div style={{marginLeft:"auto",fontSize:13,color:"var(--text4)"}}>Click row to edit ┬╖ Click category header to collapse</div>
    </div>
  </div>

  {/* Edit modal */}
  {editActivity&&(
    <ActivityEditModal
      act={{...editActivity, category: editActivity.category||editActivity.group_name||""}}
      onSave={saveActivity}
      onClose={()=>setEditActivity(null)}
      engineers={engineers}
      onComment={handleActivityComment}
      myProfile={myProfile}/>
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

export { ActivityRow, ProjectTracker };
