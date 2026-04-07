import React, { useState } from "react";
import { supabase } from "../supabase";

function ActivityEditModal({act, onSave, onClose, engineers, onComment, myProfile}){
  const initGroup = act.group_name && TAXONOMY_GROUP_NAMES.includes(act.group_name)
    ? act.group_name
    : (CAT_TO_GROUP[act.category]||TAXONOMY_GROUP_NAMES[0]);
  const initCat = act.category && TAXONOMY_GROUPS[initGroup]?.includes(act.category)
    ? act.category
    : (TAXONOMY_GROUPS[initGroup]?.[0]||act.category||"");
  const [draft,       setDraft]       = useState({...act, category: initCat});
  const [group,       setGroup]       = useState(initGroup);
  const [customName,  setCustomName]  = useState("");
  const [commentText, setCommentText] = useState("");
  const [submitting,  setSubmitting]  = useState(false);

  // â”€â”€ LOCAL COMMENTS STATE â”€â”€
  // Must be local state (not derived from act.comments prop) so that:
  //   a) comments accumulate visually while the modal is open
  //   b) clicking "Save Activity" includes the latest comments in the payload
  const parseComments = raw=>{
    if(!raw) return [];
    if(Array.isArray(raw)) return raw;
    try{ return JSON.parse(raw); }catch{ return []; }
  };
  const [localComments, setLocalComments] = useState(()=>parseComments(act.comments));

  const isCustom = draft.activity_name==="Customâ€¦";
  const catActs  = ACTIVITY_TAXONOMY[draft.category]||[];
  const INP = {width:"100%",background:"var(--bg2)",border:"1px solid var(--border3)",borderRadius:4,color:"var(--text0)",padding:"6px 8px",fontSize:13,boxSizing:"border-box"};
  const LBL = {fontSize:13,color:"var(--text2)",fontWeight:600,display:"block",marginBottom:4};
  const GROUP_COLORS = {"SCADA":"var(--info)","RTU-PLC":"#a78bfa","Protection":"#f87171","General":"#34d399"};

  const timeAgo = ts=>{
    const s=(Date.now()-new Date(ts).getTime())/1000;
    if(s<60) return "just now";
    if(s<3600) return Math.floor(s/60)+"m ago";
    if(s<86400) return Math.floor(s/3600)+"h ago";
    return new Date(ts+"").toLocaleDateString("en-GB",{day:"2-digit",month:"short",year:"2-digit"});
  };

  const fmtTs = ts=>new Date(ts).toLocaleString("en-GB",{day:"2-digit",month:"short",year:"numeric",hour:"2-digit",minute:"2-digit"});

  const submitComment=async()=>{
    if(!commentText.trim()||!onComment) return;
    // If no real comments yet and remarks has content â†’ auto-migrate remarks as first entry
    const legacyBase = (localComments.length===0 && act.remarks && act.remarks.trim())
      ? [{
          id:"legacy_"+Date.now().toString(36),
          author:"Admin",
          role:"Migrated from Remarks",
          text:act.remarks.trim(),
          ts:new Date().toISOString(),
          _migrated:true
        }]
      : [];
    const c={
      id:Date.now().toString(36)+Math.random().toString(36).slice(2),
      author:myProfile?.name||"Unknown",
      role:myProfile?.role_type||myProfile?.role||"",
      text:commentText.trim(),
      ts:new Date().toISOString()
    };
    const next=[...legacyBase,...localComments,c];
    setSubmitting(true);
    const err=await onComment(act.id, next, {
      isNewComment: true,
      commenterName: myProfile?.name,
      assignedTo: act.assigned_to,
      activityName: act.activity_name,
      projectId: act.project_id
    });
    if(!err){
      setLocalComments(next);  // â†گ update local state so draft picks it up on Save
      setCommentText("");
    }
    setSubmitting(false);
  };

  const migrateRemarks=async()=>{
    if(!onComment||!act.remarks||!act.remarks.trim()) return;
    const legacy={
      id:"legacy_"+Date.now().toString(36),
      author:"Admin",
      role:"Migrated from Remarks",
      text:act.remarks.trim(),
      ts:new Date().toISOString(),
      _migrated:true
    };
    const next=[...localComments,legacy];
    setSubmitting(true);
    const err=await onComment(act.id, next, null); // migration â€” no notification
    if(!err){
      setLocalComments(next);
      setDraft(p=>({...p,remarks:""}));
    }
    setSubmitting(false);
  };

  const removeComment=async cid=>{
    if(!onComment) return;
    const next=localComments.filter(c=>c.id!==cid);
    const err=await onComment(act.id, next, null); // deletion â€” no notification
    if(!err) setLocalComments(next);
  };

  const handleGroupChange = g => {
    setGroup(g);
    const firstCat = TAXONOMY_GROUPS[g][0];
    setDraft(p=>({...p, category:firstCat, activity_name:ACTIVITY_TAXONOMY[firstCat]?.[0]||p.activity_name}));
  };

  // Legacy remark banner: remarks has content, no comments yet, and onComment is wired
  const hasLegacyRemark = act.remarks && act.remarks.trim() && localComments.length===0 && onComment;
  const comments = localComments; // alias for JSX below

  return(
  <div className="modal-ov" onClick={onClose}>
    <div className="modal" style={{maxWidth:520,maxHeight:"90vh",overflowY:"auto"}} onClick={e=>e.stopPropagation()}>
      <h3 style={{fontSize:15,fontWeight:700,color:"var(--text0)",marginBottom:14}}>Edit Activity</h3>
      <div style={{display:"grid",gap:10}}>

        {/* Group */}
        <div>
          <label style={LBL}>GROUP</label>
          <div style={{display:"flex",gap:6}}>
            {TAXONOMY_GROUP_NAMES.map(g=>(
              <button key={g} onClick={()=>handleGroupChange(g)}
                style={{flex:1,padding:"6px 8px",borderRadius:6,border:`1px solid ${group===g?(GROUP_COLORS[g]||"var(--info)")+"60":"var(--border)"}`,
                  background:group===g?(GROUP_COLORS[g]||"var(--info)")+"15":"var(--bg2)",
                  color:group===g?(GROUP_COLORS[g]||"var(--info)"):"var(--text3)",
                  fontSize:13,fontWeight:700,cursor:"pointer",transition:"all .15s"}}>
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
            <>
            <select value={catActs.includes(draft.activity_name)?draft.activity_name:"Customâ€¦"}
              onChange={e=>setDraft(p=>({...p,activity_name:e.target.value}))} style={INP}>
              {catActs.map(a=><option key={a}>{a}</option>)}
              <option value="Customâ€¦">Customâ€¦</option>
            </select>
            {!catActs.includes(draft.activity_name)&&(
              <input autoFocus={isCustom} value={isCustom?customName:draft.activity_name}
                onChange={e=>{
                  if(isCustom) setCustomName(e.target.value);
                  else setDraft(p=>({...p,activity_name:e.target.value}));
                }}
                placeholder="Type activity nameâ€¦"
                style={{...INP,marginTop:6,border:"1px solid #38bdf8"}}/>
            )}
            </>
          ):(
            <input value={draft.activity_name||""} onChange={e=>setDraft(p=>({...p,activity_name:e.target.value}))} style={INP}/>
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
              style={{...INP,color:"var(--info)",fontFamily:"'IBM Plex Mono',monospace"}}/>
          </div>
        </div>

        {/* Dates */}
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}>
          <div>
            <label style={LBL}>START DATE</label>
            <input type="date" value={draft.start_date||""} onChange={e=>setDraft(p=>({...p,start_date:e.target.value||null}))}
              style={{...INP}}/>
          </div>
          <div>
            <label style={LBL}>END DATE <span style={{color:"var(--text3)",fontWeight:400}}>(deadline)</span></label>
            <input type="date" value={draft.end_date||""} onChange={e=>setDraft(p=>({...p,end_date:e.target.value||null}))}
              style={{...INP,color:draft.end_date&&new Date(draft.end_date)<new Date()&&draft.status!=="Completed"?"#f87171":"var(--text0)"}}/>
          </div>
        </div>

        {/* Assigned to */}
        <div>
          <label style={LBL}>ASSIGNED TO</label>
          {engineers&&engineers.length>0?(
            <select value={draft.assigned_to||""} onChange={e=>setDraft(p=>({...p,assigned_to:e.target.value}))} style={INP}>
              <option value="">â€” Unassigned â€”</option>
              {engineers.filter(e=>e.role_type!=="accountant").map(e=><option key={e.id} value={e.name}>{e.name} â€” {e.role}</option>)}
            </select>
          ):(
            <input value={draft.assigned_to||""} onChange={e=>setDraft(p=>({...p,assigned_to:e.target.value}))}
              placeholder="Engineer nameâ€¦" style={INP}/>
          )}
        </div>

        {/* Remarks */}
        <div>
          <label style={LBL}>REMARKS / BLOCKERS</label>
          <textarea value={draft.remarks||""} onChange={e=>setDraft(p=>({...p,remarks:e.target.value}))} rows={2}
            placeholder="e.g. Waiting for IOA addressesâ€¦"
            style={{...INP,color:"var(--text2)",resize:"vertical"}}/>
        </div>

        {/* â”€â”€ Comment Thread â”€â”€ */}
        <div style={{borderTop:"1px solid var(--border3)",paddingTop:12,marginTop:2}}>
          <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:10}}>
            <label style={{...LBL,marginBottom:0}}>COMMENTS</label>
            {comments.length>0&&<span style={{fontSize:11,fontFamily:"'IBM Plex Mono',monospace",background:"#a78bfa20",color:"#a78bfa",padding:"1px 7px",borderRadius:10,fontWeight:700}}>{comments.length}</span>}
          </div>

          {/* â”€â”€ Legacy Remarks Migration Banner â”€â”€ */}
          {hasLegacyRemark&&(
            <div style={{background:"#fb923c08",border:"1px solid #fb923c40",borderRadius:8,
              padding:"10px 12px",marginBottom:12,display:"flex",gap:10,alignItems:"flex-start"}}>
              <div style={{width:28,height:28,borderRadius:"50%",flexShrink:0,background:"#fb923c20",
                color:"#fb923c",fontSize:10,fontWeight:700,display:"flex",alignItems:"center",justifyContent:"center"}}>
                ADM
              </div>
              <div style={{flex:1,minWidth:0}}>
                <div style={{display:"flex",alignItems:"center",gap:7,marginBottom:4,flexWrap:"wrap"}}>
                  <span style={{fontSize:13,fontWeight:700,color:"var(--text0)"}}>Admin</span>
                  <span style={{fontSize:11,padding:"1px 6px",borderRadius:4,background:"#fb923c20",color:"#fb923c",fontWeight:600}}>From Remarks â€” not yet saved to comments</span>
                </div>
                <div style={{fontSize:13,color:"var(--text1)",background:"var(--bg3)",borderRadius:"0 8px 8px 8px",
                  padding:"7px 11px",lineHeight:1.55,borderLeft:"2px solid #fb923c",marginBottom:8}}>
                  {act.remarks}
                </div>
                <button onClick={migrateRemarks} disabled={submitting}
                  style={{fontSize:12,padding:"4px 12px",borderRadius:5,border:"1px solid #fb923c50",
                    background:"#fb923c15",color:"#fb923c",cursor:"pointer",fontFamily:"'IBM Plex Sans',sans-serif",
                    fontWeight:600,opacity:submitting?0.5:1}}>
                  Move to Comments
                </button>
              </div>
            </div>
          )}

          {/* Thread */}
          {comments.length===0&&!hasLegacyRemark&&!onComment&&(
            <div style={{fontSize:12,color:"var(--text4)",fontStyle:"italic"}}>No comments yet.</div>
          )}
          {comments.length===0&&!hasLegacyRemark&&onComment&&(
            <div style={{fontSize:12,color:"var(--text4)",fontStyle:"italic",marginBottom:12}}>No comments yet. Start the thread below.</div>
          )}
          <div style={{display:"grid",gap:10,marginBottom:onComment?12:0}}>
            {comments.map(c=>{
              const isOwn=c.author===myProfile?.name;
              const isMigrated=c._migrated;
              return(
              <div key={c.id} style={{display:"flex",gap:9,alignItems:"flex-start"}}>
                <div style={{width:28,height:28,borderRadius:"50%",flexShrink:0,
                  background:isMigrated?"#fb923c20":isOwn?"var(--info)25":"#a78bfa25",
                  color:isMigrated?"#fb923c":isOwn?"var(--info)":"#a78bfa",
                  fontSize:11,fontWeight:700,display:"flex",alignItems:"center",justifyContent:"center"}}>
                  {c.author?.slice(0,2).toUpperCase()||"?"}
                </div>
                <div style={{flex:1,minWidth:0}}>
                  <div style={{display:"flex",alignItems:"baseline",gap:7,marginBottom:3,flexWrap:"wrap"}}>
                    <span style={{fontSize:13,fontWeight:700,color:"var(--text0)"}}>{c.author}</span>
                    {c.role&&<span style={{fontSize:11,color:isMigrated?"#fb923c":"var(--text4)",fontStyle:"italic"}}>{c.role}</span>}
                    <span style={{fontSize:11,color:"var(--text4)",marginLeft:"auto",whiteSpace:"nowrap"}}>{timeAgo(c.ts)}</span>
                    {onComment&&(isOwn||myProfile?.role_type==="admin")&&(
                      <button onClick={()=>removeComment(c.id)}
                        style={{background:"none",border:"none",color:"var(--text4)",cursor:"pointer",fontSize:12,padding:"0 2px"}}
                        title="Delete comment">âœ•</button>
                    )}
                  </div>
                  <div style={{fontSize:13,color:"var(--text1)",background:"var(--bg3)",
                    borderRadius:"0 8px 8px 8px",padding:"7px 11px",lineHeight:1.55,
                    borderLeft:`2px solid ${isMigrated?"#fb923c":isOwn?"var(--info)":"#a78bfa"}`}}>
                    {c.text}
                  </div>
                </div>
              </div>
              );
            })}
          </div>
          {/* Input */}
          {onComment&&(
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
            <button className="bp" style={{fontSize:13,padding:"5px 16px",
              opacity:submitting||!commentText.trim()?0.5:1}}
              disabled={submitting||!commentText.trim()} onClick={submitComment}>
              Send
            </button>
          </div>)}
        </div>
      </div>

      <div style={{display:"flex",gap:10,marginTop:16,justifyContent:"flex-end"}}>
        <button className="bg" onClick={onClose}>Cancel</button>
        <button className="bp" onClick={()=>{
          const finalName = isCustom&&customName.trim()
            ? customName.trim()
            : draft.activity_name==="Customâ€¦" ? "" : draft.activity_name;
          if(!finalName) return;
          // Always include the latest local comments so Save Activity never overwrites them
          onSave({...draft, activity_name: finalName, comments: localComments});
        }}>Save Activity</button>
      </div>
    </div>
  </div>);
}

/* â”€â”€ Add Activity modal â”€â”€ */
/* â”€â”€ Add Activity modal â”€â”€ */
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
  const finalName = actName==="Customâ€¦" ? custom : actName;

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

  const INP = {width:"100%",background:"var(--bg2)",border:"1px solid var(--border3)",borderRadius:4,color:"var(--text0)",padding:"6px 8px",fontSize:13,boxSizing:"border-box"};
  const LBL = {fontSize:13,color:"var(--text2)",fontWeight:600,display:"block",marginBottom:4};
  const GROUP_COLORS = {"SCADA":"var(--info)","RTU-PLC":"#a78bfa","Protection":"#f87171","General":"#34d399"};

  return(
  <div className="modal-ov" onClick={onClose}>
    <div className="modal" style={{maxWidth:460}} onClick={e=>e.stopPropagation()}>
      <h3 style={{fontSize:15,fontWeight:700,color:"var(--text0)",marginBottom:14}}>Add Activity</h3>
      <div style={{display:"grid",gap:10}}>

        {/* Group selector (SCADA / Field / General) */}
        <div>
          <label style={LBL}>GROUP</label>
          <div style={{display:"flex",gap:6}}>
            {TAXONOMY_GROUP_NAMES.map(g=>(
              <button key={g} onClick={()=>handleGroupChange(g)}
                style={{flex:1,padding:"6px 8px",borderRadius:6,border:`1px solid ${group===g?(GROUP_COLORS[g]||"var(--info)")+"60":"var(--border)"}`,
                  background:group===g?(GROUP_COLORS[g]||"var(--info)")+"15":"var(--bg2)",
                  color:group===g?(GROUP_COLORS[g]||"var(--info)"):"var(--text3)",
                  fontSize:13,fontWeight:700,cursor:"pointer",transition:"all .15s"}}>
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
              <option value="Customâ€¦">Customâ€¦</option>
            </select>
          ):(
            <input value={actName} onChange={e=>setActName(e.target.value)} placeholder="Activity nameâ€¦" style={INP}/>
          )}
          {actName==="Customâ€¦"&&(
            <input value={custom} onChange={e=>setCustom(e.target.value)} placeholder="Type custom activity nameâ€¦"
              style={{...INP,marginTop:6,border:"1px solid #38bdf8"}}/>
          )}
        </div>

        {/* Dates */}
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}>
          <div>
            <label style={LBL}>START DATE</label>
            <input type="date" value={startDate} onChange={e=>setStartDate(e.target.value)}
              style={{...INP}}/>
          </div>
          <div>
            <label style={LBL}>END DATE <span style={{color:"var(--text3)",fontWeight:400}}>(deadline)</span></label>
            <input type="date" value={endDate} onChange={e=>setEndDate(e.target.value)}
              style={{...INP}}/>
          </div>
        </div>

        {/* Assigned to */}
        {engineers&&engineers.length>0&&(
        <div>
          <label style={LBL}>ASSIGNED TO <span style={{color:"var(--text3)",fontWeight:400}}>(optional)</span></label>
          <select value={assignedTo} onChange={e=>setAssignedTo(e.target.value)} style={INP}>
            <option value="">â€” Unassigned â€”</option>
            {engineers.filter(e=>e.role_type!=="accountant").map(e=><option key={e.id} value={e.name}>{e.name} â€” {e.role}</option>)}
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
function EditProjActivities({projId, activities, setActivities, engineers, isEngActive, supabase, showToast, projects, setProjects, showConfirm, myProfile, onActivityComment, insertNotif}){
  const [addModal, setAddModal] = React.useState(false);
  const [editAct, setEditAct]  = React.useState(null);
  const projActs = (activities||[]).filter(a=>a.project_id===projId);

  const autoAssignEngineer = async(assigned_to)=>{
    if(!assigned_to||!engineers||!projects||!setProjects) return;
    const eng=(engineers||[]).find(e=>e.name===assigned_to);
    if(!eng) return;
    const proj=(projects||[]).find(p=>p.id===projId);
    const ae=(proj?.assigned_engineers||[]).map(String);
    if(!ae.includes(String(eng.id))){
      const newAe=[...ae,String(eng.id)];
      await supabase.from("projects").update({assigned_engineers:newAe}).eq("id",projId);
      if(setProjects)setProjects(prev=>prev.map(p=>p.id===projId?{...p,assigned_engineers:newAe}:p));
    }
  };

  const confirmAdd = async({category,activity_name,start_date,end_date,assigned_to})=>{
    const grp = CAT_TO_GROUP[category]||"General";
    const{data,error}=await supabase.from("project_activities").insert({
      project_id:projId, group_name:grp, category:category||null,
      activity_name, status:"Not Started", progress:0,
      start_date:start_date||null, end_date:end_date||null, assigned_to:assigned_to||null,
    }).select().single();
    if(error){if(showToast)showToast("Error: "+error.message,false);return;}
    if(setActivities)setActivities(prev=>[...prev,data]);
    await autoAssignEngineer(assigned_to);
    // â”€â”€ Notification: activity_assigned â”€â”€
    if(assigned_to){
      const aEng=engineers.find(e=>e.name===assigned_to);
      if(aEng&&String(aEng.id)!==String(myProfile?.id)){
        const aProj=projects.find(p=>p.id===projId);
        const _addNow=new Date().toISOString();
        const _addIsAdmin=myProfile?.role_type==="admin";
        // Notify engineer â€” fire-and-forget
        insertNotif({
          type:"activity_assigned",engineer_id:aEng.id,read:false,
          message:`You were assigned to "${activity_name}"${aProj?" آ· "+aProj.name:""}`,
          created_at:_addNow,
          meta:JSON.stringify({recipient_engineer_id:String(aEng.id),project_id:projId,assigned_by:myProfile?.name})
        });
        // Notify project leader (if set and not the creator or the assigned engineer)
        if(aProj?.project_leader){
          const _ldrEng=engineers.find(e=>e.name===aProj.project_leader);
          if(_ldrEng&&String(_ldrEng.id)!==String(myProfile?.id)&&String(_ldrEng.id)!==String(aEng.id)){
            insertNotif({type:"activity_assigned",engineer_id:_ldrEng.id,read:false,
              message:`${myProfile?.name||"Admin"} assigned "${activity_name}" to ${aEng.name}${aProj?" آ· "+aProj.name:""}`,
              created_at:_addNow,meta:JSON.stringify({recipient_engineer_id:String(_ldrEng.id),project_id:projId,assigned_to:aEng.name,assigned_by:myProfile?.name,role:"project_leader"})});
          }
        }
        // If lead is creating + assigning, notify all admins (admin already knows â€” they did it)
        if(!_addIsAdmin){
          const _adminAddMsg=`${myProfile?.name||"Lead"} assigned "${activity_name}" to ${aEng.name}${aProj?" آ· "+aProj.name:""}`;
          const _ap1=engineers.filter(e=>e.role_type==="admin").map(adminEng=>({type:"activity_assigned",engineer_id:adminEng.id,read:false,message:_adminAddMsg,created_at:_addNow,meta:JSON.stringify({recipient_engineer_id:String(adminEng.id),project_id:projId,assigned_to:aEng.name,assigned_by:myProfile?.name})}));
          if(_ap1.length) supabase.from("notifications").insert(_ap1).select().then(({data:rows})=>{if(rows){const _my=rows.find(r=>String(r.engineer_id)===String(myProfile?.id));if(_my)setNotifications(prev=>[_my,...prev]);}});
        }
      }
    }
    setAddModal(false);
    if(showToast)showToast("Activity added âœ“");
  };

  const saveAct = async(draft)=>{
    const{id,...fields}=draft;
    const prevAct=activities.find(a=>a.id===id);
    const grp = CAT_TO_GROUP[fields.category]||fields.group_name||"General";
    const payload={...fields,group_name:grp,category:fields.category||null};
    const{data,error}=await supabase.from("project_activities").update(payload).eq("id",id).select().single();
    if(error){if(showToast)showToast("Error: "+error.message,false);return;}
    if(setActivities)setActivities(prev=>prev.map(a=>a.id===data.id?data:a));
    await autoAssignEngineer(fields.assigned_to);
    // â”€â”€ Notifications for saveAct (EditProjActivities modal) â”€â”€
    const _saProj=projects.find(p=>p.id===(fields.project_id||prevAct?.project_id));
    const _saNow=new Date().toISOString();
    const _saIsAdmin=myProfile?.role_type==="admin";
    // Helper: notify leader + optionally admins (when lead acts)
    const _saNotifyLeaderAndAdmins=(type,msg,meta,skipEngId)=>{
      if(_saProj?.project_leader){
        const _ldr=engineers.find(e=>e.name===_saProj.project_leader);
        if(_ldr&&String(_ldr.id)!==String(myProfile?.id)&&(!skipEngId||String(_ldr.id)!==String(skipEngId))){
          if(insertNotif) insertNotif({type,engineer_id:_ldr.id,read:false,message:msg,created_at:_saNow,meta:JSON.stringify({...meta,role:"project_leader"})});
        }
      }
      if(!_saIsAdmin){
        const adminMsg=`${myProfile?.name||"Lead"} ${msg}`;
        engineers.filter(e=>e.role_type==="admin").forEach(adm=>{
          if(insertNotif) insertNotif({type,engineer_id:adm.id,read:false,message:adminMsg,created_at:_saNow,meta:JSON.stringify(meta)});
        });
      }
    };
    // assignment changed
    if(fields.assigned_to&&fields.assigned_to!==prevAct?.assigned_to){
      const _eng=engineers.find(e=>e.name===fields.assigned_to);
      if(_eng&&String(_eng.id)!==String(myProfile?.id)){
        const _msg=`You were assigned to "${fields.activity_name||data.activity_name}"${_saProj?" آ· "+_saProj.name:""}`;
        if(insertNotif) insertNotif({type:"activity_assigned",engineer_id:_eng.id,read:false,message:_msg,created_at:_saNow,meta:JSON.stringify({activity_id:id,project_id:fields.project_id,assigned_by:myProfile?.name})});
        _saNotifyLeaderAndAdmins("activity_assigned",`${myProfile?.name||"Admin"} assigned "${fields.activity_name||data.activity_name}" to ${_eng.name}${_saProj?" آ· "+_saProj.name:""}`,{activity_id:id,project_id:fields.project_id,assigned_to:_eng.name,assigned_by:myProfile?.name},String(_eng.id));
      }
    }
    // status changed
    if(fields.status&&fields.status!==prevAct?.status){
      const _actName=fields.activity_name||data.activity_name;
      const _assignedEng=prevAct?.assigned_to?engineers.find(e=>e.name===prevAct.assigned_to):null;
      if(_assignedEng&&String(_assignedEng.id)!==String(myProfile?.id)){
        if(insertNotif) insertNotif({type:"activity_status_changed",engineer_id:_assignedEng.id,read:false,message:`"${_actName}" marked ${fields.status}${_saProj?" آ· "+_saProj.name:""}`,created_at:_saNow,meta:JSON.stringify({activity_id:id,project_id:fields.project_id,status:fields.status,changed_by:myProfile?.name})});
      }
      _saNotifyLeaderAndAdmins("activity_status_changed",`"${_actName}" marked ${fields.status}${_saProj?" آ· "+_saProj.name:""}`,{activity_id:id,project_id:fields.project_id,status:fields.status,changed_by:myProfile?.name},_assignedEng?String(_assignedEng.id):null);
    }
    // deadline changed
    if(fields.end_date!==undefined&&fields.end_date!==prevAct?.end_date){
      const _actName=fields.activity_name||data.activity_name;
      const _assignedEng=prevAct?.assigned_to?engineers.find(e=>e.name===prevAct.assigned_to):null;
      const _dl=fields.end_date?new Date(fields.end_date).toLocaleDateString("en-GB",{day:"2-digit",month:"short",year:"numeric"}):"removed";
      if(_assignedEng&&String(_assignedEng.id)!==String(myProfile?.id)){
        if(insertNotif) insertNotif({type:"activity_deadline_changed",engineer_id:_assignedEng.id,read:false,message:`Deadline for "${_actName}" changed to ${_dl}${_saProj?" آ· "+_saProj.name:""}`,created_at:_saNow,meta:JSON.stringify({activity_id:id,project_id:fields.project_id,end_date:fields.end_date,changed_by:myProfile?.name})});
      }
      _saNotifyLeaderAndAdmins("activity_deadline_changed",`Deadline for "${_actName}" changed to ${_dl}${_saProj?" آ· "+_saProj.name:""}`,{activity_id:id,project_id:fields.project_id,end_date:fields.end_date,changed_by:myProfile?.name},_assignedEng?String(_assignedEng.id):null);
    }
    setEditAct(null);
    if(showToast)showToast("Activity saved âœ“");
  };
  const delAct = async(id)=>{
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

  const GROUP_COLORS={"SCADA":"var(--info)","RTU-PLC":"#a78bfa","Protection":"#f87171","General":"#34d399"};
  const STATUS_STYLE={"Completed":{bg:"var(--bg3)",color:"#34d399"},"In Progress":{bg:"var(--bg3)",color:"var(--info)"},"On Hold":{bg:"var(--warn-bg)",color:"#fb923c"},"Not Started":{bg:"var(--bg3)",color:"var(--text3)"}};

  return(
    <div>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:10}}>
        <span style={{fontSize:13,color:"var(--text3)"}}>{projActs.length} activit{projActs.length===1?"y":"ies"} for {projId}</span>
        <button className="bp" style={{fontSize:13,padding:"4px 12px"}} onClick={()=>setAddModal(true)}>+ Add Activity</button>
      </div>
      {projActs.length===0&&(
        <div style={{textAlign:"center",padding:"28px 0",color:"var(--border)",fontSize:13,border:"1px dashed #0f1e2e",borderRadius:6}}>
          No activities yet â€” add the first one above.
        </div>
      )}
      <div style={{display:"grid",gap:5,maxHeight:320,overflowY:"auto"}}>
        {projActs.map(a=>{
          const ss=STATUS_STYLE[a.status]||STATUS_STYLE["Not Started"];
          const gc=GROUP_COLORS[a.group_name]||"var(--text3)";
          const pct=Math.round((a.progress||0)*100);
          return(
          <div key={a.id} style={{background:"var(--bg2)",border:"1px solid var(--border2)",borderRadius:6,padding:"8px 12px"}}>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",gap:8}}>
              <div style={{flex:1,minWidth:0}}>
                <div style={{fontSize:14,fontWeight:600,color:"var(--text0)",marginBottom:4}}>{a.activity_name}</div>
                <div style={{display:"flex",flexWrap:"wrap",gap:5,alignItems:"center"}}>
                  <span style={{fontSize:12,padding:"1px 6px",borderRadius:3,background:gc+"20",color:gc}}>{a.group_name}</span>
                  {a.category&&a.category!==a.group_name&&<span style={{fontSize:12,color:"var(--text3)"}}>{a.category}</span>}
                  <span style={{fontSize:12,padding:"1px 6px",borderRadius:3,background:ss.bg,color:ss.color}}>{a.status}</span>
                  {a.assigned_to&&<span style={{fontSize:12,color:"var(--text2)"}}>ًں‘¤ {a.assigned_to}</span>}
                </div>
                {pct>0&&<div style={{marginTop:6,background:"var(--bg3)",borderRadius:3,height:4,overflow:"hidden"}}>
                  <div style={{height:"100%",width:pct+"%",background:pct===100?"#34d399":"var(--info)",borderRadius:3}}/>
                </div>}
              </div>
              <div style={{display:"flex",gap:4,flexShrink:0}}>
                <button className="be" style={{fontSize:12,padding:"3px 7px"}} onClick={()=>setEditAct({...a})}>âœژ</button>
                <button className="bd" style={{fontSize:12,padding:"3px 7px"}} onClick={()=>delAct(a.id)}>âœ•</button>
              </div>
            </div>
          </div>);
        })}
      </div>
      {/* Shared modals â€” same as Tracker */}
      {addModal&&<AddActivityModal projId={projId} subId={null} defaultCat={null}
        onSave={confirmAdd} onClose={()=>setAddModal(false)} engineers={engineers}/>}
      {editAct&&<ActivityEditModal act={editAct}
        onSave={saveAct} onClose={()=>setEditAct(null)} engineers={engineers}
        onComment={onActivityComment||null}
        myProfile={myProfile}/>}
    </div>
  );
}


/* â”€â”€ Single activity row â”€â”€ */

export { ActivityEditModal, AddActivityModal };
