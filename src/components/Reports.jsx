import React, { useState, useMemo } from "react";
import { MONTHS, fmtCurrency, fmtPct } from "../constants.js";
import { buildProjectTasksPDF, buildAllProjectsPDF } from "../pdfHelpers.jsx";

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
            {projList.map(x=><option key={x.proj.id} value={x.proj.id}>{x.proj.name} — {x.proj.id} ({x.totalHrs}h)</option>)}
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
                {pm.proj.client&&<div style={{fontSize:13,color:"var(--text4)",marginTop:2}}>Client: {pm.proj.client} آ· Phase: {pm.proj.phase||"—"}</div>}
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
                {l:"Avg/Day",   v:pm.days?Math.round(pm.totalHrs/pm.days*10)/10+"h":"—", c:"#fb923c"},
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

/* ---- VacationReport Component ---- */
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
        <h4 style={{fontSize:14,fontWeight:600,color:"var(--text2)",marginBottom:12}}>{MONTHS[month]} {year} — Monthly Summary</h4>
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
                      {eng.byType[lt]||"—"}
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
        <h4 style={{fontSize:14,fontWeight:600,color:"var(--text2)",marginBottom:12}}>Year-to-Date {year} — All Leave</h4>
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
                      {eng.byType[lt]||"—"}
                    </td>
                  ))}
                  <td style={{textAlign:"center",fontFamily:"'IBM Plex Mono',monospace",fontWeight:700,color:"var(--text0)"}}>{eng.total}d</td>
                </tr>
              ))}</tbody>
            </table>
        }
      </div>

      {/* ---- ANNUAL LEAVE BALANCE TRACKER ---- */}
      {(()=>{
        const yearBalances = (vacationBalances||{})[year]||{};
        const annualOnly   = allEntries.filter(e=>
          e.entry_type==="leave" && (e.leave_type==="Annual Leave"||!e.leave_type) &&
          e.activity!=="PENDING_APPROVAL" &&  // exclude pending — not yet approved
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
              <h4 style={{fontSize:14,fontWeight:600,color:"var(--text2)",margin:0}}>Annual Leave Balance — {year}</h4>
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
                  const status   = eng.pct>=100?"ًںڑ¨ Exceeded":eng.pct>=90?"âڑ  Critical":eng.pct>=60?"▲ High":"âœ“ Healthy";
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
                      {/* Entitlement — editable for admin */}
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
        <h4 style={{fontSize:14,fontWeight:600,color:"var(--text2)",marginBottom:10}}>Detail — Leave Days {MONTHS[month]} {year}</h4>
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


function TrackerProgressReport({activities,projects,subprojects,engineers}){
  const [period,  setPeriod]  = React.useState("weekly");
  const [selProj, setSelProj] = React.useState("ALL");
  const [selStat, setSelStat] = React.useState("ALL");
  const [showInactiveProj, setShowInactiveProj] = React.useState(false); // Active projects only by default
  const today = new Date();
  const fmtD = function(d){ return d ? new Date(d+"T12:00:00").toLocaleDateString("en-GB",{day:"2-digit",month:"short",year:"numeric"}) : "ظ¤"; };
  const GC = {"SCADA":"var(--info)","RTU-PLC":"#a78bfa","Protection":"#f87171","General":"#34d399"};
  const SC = {"Completed":"#34d399","In Progress":"var(--info)","Not Started":"var(--text3)","On Hold":"#fb923c"};
  const SB = {"Completed":"#14532d30","In Progress":"#0ea5e920","Not Started":"#1e293b40","On Hold":"#78350f30"};
  const PERIOD_LABEL = {daily:"Daily (Last 24h)",weekly:"Weekly (Last 7 days)",monthly:"Monthly (Last 30 days)",full:"Full Project"};

  // Filter projects by status ظ¤ Active only unless showInactiveProj is checked
  const visibleProjIds = React.useMemo(function(){
    const ids=new Set();
    projects.forEach(function(p){
      if(showInactiveProj||(p.status||"Active")==="Active") ids.add(p.id);
    });
    return ids;
  },[projects,showInactiveProj]);

  const acts = React.useMemo(function(){
    return activities.filter(function(a){
      if(!visibleProjIds.has(a.project_id)) return false; // exclude inactive projects
      if(selProj!=="ALL"&&a.project_id!==selProj) return false;
      if(selStat!=="ALL"&&a.status!==selStat) return false;
      return true;
    });
  },[activities,selProj,selStat,visibleProjIds]);

  const grouped = React.useMemo(function(){
    const map={};
    acts.forEach(function(a){
      if(!map[a.project_id]) map[a.project_id]={pid:a.project_id,cats:{},subs:{}};
      const cat=a.category||a.group_name||"General";
      const subId=a.subproject_id?String(a.subproject_id):null;
      if(subId){
        if(!map[a.project_id].subs[subId]){
          const sp=subprojects.find(function(s){return String(s.id)===subId;});
          map[a.project_id].subs[subId]={subId:subId,subName:sp?sp.name:"Sub-site",cats:{}};
        }
        if(!map[a.project_id].subs[subId].cats[cat]) map[a.project_id].subs[subId].cats[cat]=[];
        map[a.project_id].subs[subId].cats[cat].push(a);
      } else {
        if(!map[a.project_id].cats[cat]) map[a.project_id].cats[cat]=[];
        map[a.project_id].cats[cat].push(a);
      }
    });
    return Object.values(map).sort(function(a,b){
      const na=projects.find(function(p){return p.id===a.pid;});
      const nb=projects.find(function(p){return p.id===b.pid;});
      return (na?na.name:a.pid).localeCompare(nb?nb.name:b.pid);
    });
  },[acts,projects,subprojects]);

  const total=acts.length;
  const done=acts.filter(function(a){return a.status==="Completed";}).length;
  const inprog=acts.filter(function(a){return a.status==="In Progress";}).length;
  const onhold=acts.filter(function(a){return a.status==="On Hold";}).length;
  const avg=total?Math.round(acts.reduce(function(s,a){return s+(a.progress||0);},0)/total*100):0;

  const buildPDF=function(){
    const now=today.toLocaleDateString("en-GB",{day:"2-digit",month:"short",year:"numeric"});
    const label=PERIOD_LABEL[period];
    const stBgMap={"Completed":"#dcfce7","In Progress":"#dbeafe","Not Started":"#f1f5f9","On Hold":"#fff7ed"};
    const stCMap={"Completed":"#166534","In Progress":"#1d4ed8","Not Started":"#64748b","On Hold":"#9a3412"};

    // Helper: renders activity rows for a given cats object, with optional indent level
    function buildCatRows(cats, indentPx){
      var rows="";
      Object.entries(cats).forEach(function(entry){
        var cat=entry[0]; var catActs=entry[1];
        rows+='<tr style="background:#f0f4f8"><td colspan="7" style="padding:4px 6px 4px '+indentPx+'px;font-size:9px;font-weight:700;color:#475569;text-transform:uppercase;letter-spacing:.08em;border-top:1px solid #e2e8f0">'+cat+'</td></tr>';
        catActs.forEach(function(a){
          var pct=Math.round((a.progress||0)*100);
          var ov=a.end_date&&new Date(a.end_date)<today&&a.status!=="Completed";
          var stBg=stBgMap[a.status]||"#f1f5f9";
          var stC=stCMap[a.status]||"#64748b";
          var pctCol=pct===100?"#166534":pct>=50?"#1d4ed8":"#64748b";
          var barCol=pct===100?"#22c55e":pct>=50?"#3b82f6":"#f97316";
          var bar='<div style="display:inline-block;vertical-align:middle;width:55px;height:4px;background:#e2e8f0;border-radius:2px;margin-left:4px"><div style="width:'+pct+'%;height:100%;background:'+barCol+';border-radius:2px"></div></div>';
          var cs=a.comments?Array.isArray(a.comments)?a.comments:(function(){try{return JSON.parse(a.comments);}catch(e){return[];}})():[];
          var commentHTML=cs.length?'<div style="margin-top:5px;border-top:1px solid #e2e8f0;padding-top:4px">'+cs.map(function(c){var tsStr=c.ts?new Date(c.ts).toLocaleString("en-GB",{day:"2-digit",month:"short",year:"numeric",hour:"2-digit",minute:"2-digit"}):"";return'<div style="display:flex;gap:5px;margin-bottom:3px"><div style="width:18px;height:18px;border-radius:50%;background:'+(c._migrated?"#fff7ed":"#f5f3ff")+';color:'+(c._migrated?"#c2410c":"#7c3aed")+';font-size:8px;font-weight:700;display:flex;align-items:center;justify-content:center;flex-shrink:0">'+(c.author||"?").slice(0,2).toUpperCase()+'</div><div style="flex:1"><div style="font-size:9px;color:#475569;margin-bottom:1px"><b>'+c.author+'</b>'+(c.role?' ┬╖ '+c.role:'')+' <span style="float:right;color:#94a3b8">'+tsStr+'</span></div><div style="font-size:10px;color:#334155;background:#f8fafc;border-left:2px solid '+(c._migrated?"#f97316":"#7c3aed")+';padding:2px 6px;border-radius:0 3px 3px 0">'+c.text+'</div></div></div>';}).join('')+'</div>':'';
          rows+='<tr><td style="padding:5px 6px 5px '+(indentPx+10)+'px;font-size:11px">'+a.activity_name+'</td>'
            +'<td style="padding:5px 6px"><span style="background:'+stBg+';color:'+stC+';padding:1px 6px;border-radius:3px;font-size:10px;font-weight:600">'+a.status+'</span></td>'
            +'<td style="padding:5px 6px;white-space:nowrap"><b style="font-size:11px;color:'+pctCol+'">'+pct+'%</b>'+bar+'</td>'
            +'<td style="padding:5px 6px;font-size:10px;color:#475569">'+(a.assigned_to||"ظ¤")+'</td>'
            +'<td style="padding:5px 6px;font-size:10px;white-space:nowrap">'+fmtD(a.start_date)+'</td>'
            +'<td style="padding:5px 6px;font-size:10px;white-space:nowrap;color:'+(ov?"#dc2626":"#475569")+';font-weight:'+(ov?"700":"400")+'">'+fmtD(a.end_date)+(ov?" ظأب":"")+'</td>'
            +'<td style="padding:5px 6px;font-size:10px;color:#64748b">'+(a.remarks||"")+(cs.length?' '+commentHTML:'')+'</td></tr>';
        });
      });
      return rows;
    }

    var tableHead='<thead><tr style="background:#f1f5f9">'
      +'<th style="padding:5px 6px 5px 22px;text-align:left;font-size:9px;color:#64748b;border-bottom:1px solid #e2e8f0">ACTIVITY</th>'
      +'<th style="padding:5px 6px;text-align:left;font-size:9px;color:#64748b;border-bottom:1px solid #e2e8f0">STATUS</th>'
      +'<th style="padding:5px 6px;text-align:left;font-size:9px;color:#64748b;border-bottom:1px solid #e2e8f0">PROGRESS</th>'
      +'<th style="padding:5px 6px;text-align:left;font-size:9px;color:#64748b;border-bottom:1px solid #e2e8f0">ASSIGNED</th>'
      +'<th style="padding:5px 6px;text-align:left;font-size:9px;color:#64748b;border-bottom:1px solid #e2e8f0">START</th>'
      +'<th style="padding:5px 6px;text-align:left;font-size:9px;color:#64748b;border-bottom:1px solid #e2e8f0">DEADLINE</th>'
      +'<th style="padding:5px 6px;text-align:left;font-size:9px;color:#64748b;border-bottom:1px solid #e2e8f0">NOTES</th>'
      +'</tr></thead>';

    var projHTML="";
    var SUB_COLORS=["#7c3aed","#0369a1","#047857","#b45309","#be123c","#0f766e","#6d28d9","#0284c7"];
    grouped.forEach(function(g){
      var proj=projects.find(function(p){return p.id===g.pid;});
      var subList=Object.values(g.subs);
      var hasSubs=subList.length>0;
      // All acts: sub-site acts + unassigned acts
      var allActs=[].concat(
        Object.values(g.cats).flat(),
        subList.flatMap(function(s){return Object.values(s.cats).flat();})
      );
      var pd=allActs.filter(function(a){return a.status==="Completed";}).length;
      var pp=allActs.length?Math.round(allActs.reduce(function(s,a){return s+(a.progress||0);},0)/allActs.length*100):0;
      var bc=pp===100?"#22c55e":pp>=50?"#3b82f6":"#f97316";

      // Project banner
      var banner='<div style="background:linear-gradient(135deg,#1e3a5f,#1e4d8c);color:#fff;padding:10px 14px;border-radius:7px 7px 0 0;display:flex;justify-content:space-between;align-items:center">'
        +'<div>'
        +'<div style="font-size:15px;font-weight:700">'+(proj?proj.name:g.pid)+'</div>'
        +'<div style="font-size:10px;color:#93c5fd;margin-top:2px">'+g.pid
          +(proj&&proj.project_leader?' ┬╖ Leader: '+proj.project_leader:'')
          +(proj&&proj.pm?' ┬╖ PM: '+proj.pm:'')
          +(proj&&proj.phase?' ┬╖ Phase: '+proj.phase:'')
          +(proj&&proj.client?' ┬╖ '+proj.client:'')
        +'</div>'
        +(hasSubs?'<div style="font-size:10px;color:#a5b4fc;margin-top:3px">'+subList.length+' sub-site'+(subList.length!==1?'s':'')+': '+subList.map(function(s){return s.subName;}).join(' ┬╖ ')+'</div>':'')
        +'</div>'
        +'<div style="text-align:right">'
        +'<div style="font-size:22px;font-weight:800;color:'+bc+'">'+pp+'%</div>'
        +'<div style="font-size:10px;color:#93c5fd">'+pd+'/'+allActs.length+' done</div>'
        +'</div></div>';

      // Overall progress bar
      var progBar='<div style="height:5px;background:#e2e8f0"><div style="width:'+pp+'%;height:100%;background:'+bc+'"></div></div>';

      var body="";

      if(hasSubs){
        // Sub-site summary strip
        var summaryRow='<div style="display:flex;gap:6px;flex-wrap:wrap;padding:8px 12px;background:#f8fafc;border-bottom:1px solid #e2e8f0">';
        subList.forEach(function(s,si){
          var sActs=Object.values(s.cats).flat();
          var sp2=sActs.length?Math.round(sActs.reduce(function(r,a){return r+(a.progress||0);},0)/sActs.length*100):0;
          var sd=sActs.filter(function(a){return a.status==="Completed";}).length;
          var sc2=sp2===100?"#22c55e":sp2>=50?"#3b82f6":"#f97316";
          summaryRow+='<span style="padding:3px 10px;border-radius:12px;border:1px solid '+sc2+';font-size:10px;background:'+sc2+'18;color:'+sc2+';font-weight:700">'+s.subName+': '+sp2+'% ('+sd+'/'+sActs.length+')</span>';
        });
        // Unassigned count
        var unassgActs=Object.values(g.cats).flat();
        if(unassgActs.length) summaryRow+='<span style="padding:3px 10px;border-radius:12px;border:1px solid #94a3b8;font-size:10px;color:#64748b">No Sub-site: '+unassgActs.length+' act.</span>';
        summaryRow+='</div>';

        // Per sub-site sections
        var subSections="";
        subList.forEach(function(s,si){
          var sActs=Object.values(s.cats).flat();
          var sp2=sActs.length?Math.round(sActs.reduce(function(r,a){return r+(a.progress||0);},0)/sActs.length*100):0;
          var sd=sActs.filter(function(a){return a.status==="Completed";}).length;
          var sc2=SUB_COLORS[si%SUB_COLORS.length];
          var catRows=buildCatRows(s.cats,22);
          subSections+='<tr style="background:'+sc2+'15"><td colspan="7" style="padding:6px 10px;font-weight:700;color:'+sc2+';font-size:11px;border-top:2px solid '+sc2+'">'
            +'≡اô '+s.subName
            +' <span style="font-weight:400;color:#64748b;font-size:10px">'
            +sp2+'% ┬╖ '+sd+'/'+sActs.length+' done'
            +'</span></td></tr>'
            +catRows;
        });

        // Activities not assigned to any sub-site
        var unRows=Object.keys(g.cats).length>0?
          '<tr style="background:#f9fafb"><td colspan="7" style="padding:6px 10px;font-weight:700;color:#64748b;font-size:11px;border-top:2px solid #cbd5e1"No Sub-site Assigned</td></tr>'
          +buildCatRows(g.cats,22):"";

        body=summaryRow
          +'<table style="width:100%;border-collapse:collapse;border:1px solid #e2e8f0;border-top:none">'
          +tableHead+'<tbody>'+subSections+unRows+'</tbody></table>';
      } else {
        // No sub-sites ظ¤ original flat layout
        var catRows=buildCatRows(g.cats,22);
        body='<table style="width:100%;border-collapse:collapse;border:1px solid #e2e8f0;border-top:none">'
          +tableHead+'<tbody>'+catRows+'</tbody></table>';
      }

      projHTML+='<div style="margin-bottom:22px">'+banner+progBar+body+'</div>';
    });
    const html='<!DOCTYPE html><html><head><meta charset="utf-8"><title>Tracker Report</title>'
      +'<style>body{font-family:\'Segoe UI\',Arial,sans-serif;margin:0;padding:20px;color:#1e293b}'
      +'@media print{body{padding:0}@page{margin:14mm}.proj-block{page-break-inside:auto}table{page-break-inside:auto}tr{page-break-inside:avoid;page-break-after:auto}}</style></head><body>'
      +'<div style="display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:16px;padding-bottom:12px;border-bottom:3px solid #1e3a5f">'
      +'<div><div style="font-size:20px;font-weight:800;color:#1e3a5f">ENEVO GROUP</div>'
      +'<div style="font-size:15px;font-weight:700;color:#334155;margin-top:2px">Activity Tracker Progress Report</div>'
      +'<div style="font-size:11px;color:#64748b;margin-top:3px">Period: <b>'+label+'</b> ┬╖ '+(showInactiveProj?'All project statuses':'Active projects only')+' ┬╖ Generated: '+now+'</div></div>'
      +'<div style="text-align:right;font-size:11px;color:#64748b;line-height:1.8">'
      +'<div>'+acts.length+' activities ┬╖ '+grouped.length+' projects</div>'
      +'<div>Completed: <b style="color:#16a34a">'+done+'</b>  In Progress: <b style="color:#2563eb">'+inprog+'</b>  On Hold: <b style="color:#ea580c">'+onhold+'</b></div>'
      +'<div>Avg: <b style="font-size:14px">'+avg+'%</b></div></div></div>'
      +(grouped.length===0?'<p style="text-align:center;padding:30px;color:#94a3b8">No activities found.</p>':projHTML)
      +'<div style="margin-top:24px;padding-top:8px;border-top:1px solid #e2e8f0;font-size:9px;color:#94a3b8;text-align:center">ENEVO GROUP ظ¤ Internal Report ظ¤ '+now+'</div>'
      +'</body></html>';
    var w=window.open("","pdf_"+Date.now()+"_"+Math.random().toString(36).slice(2));
    if(w){w.document.write(html);w.document.close();w.focus();setTimeout(function(){w.print();},600);}
  };

  // ظ¤ظ¤ Build sub-site focused PDF ظ¤ظ¤
  const buildSubPDF=function(subId,subName){
    var now=today.toLocaleDateString("en-GB",{day:"2-digit",month:"short",year:"numeric"});
    var label=PERIOD_LABEL[period];
    var stBgMap={"Completed":"#dcfce7","In Progress":"#dbeafe","Not Started":"#f1f5f9","On Hold":"#fff7ed"};
    var stCMap={"Completed":"#166534","In Progress":"#1d4ed8","Not Started":"#64748b","On Hold":"#9a3412"};
    // Find project info
    var projGroup=grouped.find(function(g){return Object.values(g.subs).some(function(s){return s.subId===subId;});});
    var proj=projGroup?projects.find(function(p){return p.id===projGroup.pid;}):null;
    var sub=projGroup?projGroup.subs[subId]:null;
    if(!sub) return;
    var sActs=Object.values(sub.cats).flat();
    var sp2=sActs.length?Math.round(sActs.reduce(function(r,a){return r+(a.progress||0);},0)/sActs.length*100):0;
    var sd=sActs.filter(function(a){return a.status==="Completed";}).length;
    var bc=sp2===100?"#22c55e":sp2>=50?"#3b82f6":"#f97316";
    var tableHead='<thead><tr style="background:#f1f5f9">'
      +'<th style="padding:5px 6px 5px 12px;text-align:left;font-size:9px;color:#64748b;border-bottom:1px solid #e2e8f0">ACTIVITY</th>'
      +'<th style="padding:5px 6px;text-align:left;font-size:9px;color:#64748b;border-bottom:1px solid #e2e8f0">STATUS</th>'
      +'<th style="padding:5px 6px;text-align:left;font-size:9px;color:#64748b;border-bottom:1px solid #e2e8f0">PROGRESS</th>'
      +'<th style="padding:5px 6px;text-align:left;font-size:9px;color:#64748b;border-bottom:1px solid #e2e8f0">ASSIGNED</th>'
      +'<th style="padding:5px 6px;text-align:left;font-size:9px;color:#64748b;border-bottom:1px solid #e2e8f0">START</th>'
      +'<th style="padding:5px 6px;text-align:left;font-size:9px;color:#64748b;border-bottom:1px solid #e2e8f0">DEADLINE</th>'
      +'<th style="padding:5px 6px;text-align:left;font-size:9px;color:#64748b;border-bottom:1px solid #e2e8f0">NOTES</th>'
      +'</tr></thead>';
    var bodyRows="";
    Object.entries(sub.cats).forEach(function(entry){
      var cat=entry[0]; var catActs=entry[1];
      bodyRows+='<tr style="background:#f0f4f8"><td colspan="7" style="padding:4px 6px 4px 12px;font-size:9px;font-weight:700;color:#475569;text-transform:uppercase;letter-spacing:.08em;border-top:1px solid #e2e8f0">'+cat+'</td></tr>';
      catActs.forEach(function(a){
        var pct=Math.round((a.progress||0)*100);
        var ov=a.end_date&&new Date(a.end_date)<today&&a.status!=="Completed";
        var stBg=stBgMap[a.status]||"#f1f5f9"; var stC=stCMap[a.status]||"#64748b";
        var pctCol=pct===100?"#166534":pct>=50?"#1d4ed8":"#64748b";
        var barCol=pct===100?"#22c55e":pct>=50?"#3b82f6":"#f97316";
        var bar='<div style="display:inline-block;vertical-align:middle;width:55px;height:4px;background:#e2e8f0;border-radius:2px;margin-left:4px"><div style="width:'+pct+'%;height:100%;background:'+barCol+';border-radius:2px"></div></div>';
        var cs=a.comments?Array.isArray(a.comments)?a.comments:(function(){try{return JSON.parse(a.comments);}catch(e){return[];}})():[];
        var commentHTML=cs.length?'<div style="margin-top:4px;border-top:1px solid #e2e8f0;padding-top:3px">'+cs.map(function(c){var tsStr=c.ts?new Date(c.ts).toLocaleString("en-GB",{day:"2-digit",month:"short",year:"numeric",hour:"2-digit",minute:"2-digit"}):"";return'<div style="font-size:9px;color:#334155;margin-bottom:2px"><b>'+c.author+'</b><span style="color:#94a3b8;float:right">'+tsStr+'</span><br>'+c.text+'</div>';}).join('')+'</div>':'';
        bodyRows+='<tr><td style="padding:5px 6px 5px 12px;font-size:11px">'+a.activity_name+'</td>'
          +'<td style="padding:5px 6px"><span style="background:'+stBg+';color:'+stC+';padding:1px 6px;border-radius:3px;font-size:10px;font-weight:600">'+a.status+'</span></td>'
          +'<td style="padding:5px 6px;white-space:nowrap"><b style="font-size:11px;color:'+pctCol+'">'+pct+'%</b>'+bar+'</td>'
          +'<td style="padding:5px 6px;font-size:10px;color:#475569">'+(a.assigned_to||"ظ¤")+'</td>'
          +'<td style="padding:5px 6px;font-size:10px;white-space:nowrap">'+fmtD(a.start_date)+'</td>'
          +'<td style="padding:5px 6px;font-size:10px;white-space:nowrap;color:'+(ov?"#dc2626":"#475569")+';font-weight:'+(ov?"700":"400")+'">'+fmtD(a.end_date)+(ov?" ظأب":"")+'</td>'
          +'<td style="padding:5px 6px;font-size:10px;color:#64748b">'+(a.remarks||"")+(cs.length?' '+commentHTML:'')+'</td></tr>';
      });
    });
    var html='<!DOCTYPE html><html><head><meta charset="utf-8"><title>'+subName+' ظ¤ Progress Report</title>'
      +'<style>body{font-family:\'Segoe UI\',Arial,sans-serif;margin:0;padding:20px;color:#1e293b}'
      +'@media print{body{padding:0}@page{margin:14mm}table{page-break-inside:auto}tr{page-break-inside:avoid;page-break-after:auto}}</style></head><body>'
      +'<div style="display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:16px;padding-bottom:12px;border-bottom:3px solid #1e3a5f">'
      +'<div><div style="font-size:20px;font-weight:800;color:#1e3a5f">ENEVO GROUP</div>'
      +'<div style="font-size:15px;font-weight:700;color:#334155;margin-top:2px">Sub-site Report ظ¤ '+subName+'</div>'
      +'<div style="font-size:12px;color:#7c3aed;font-weight:600;margin-top:2px">Part of: '+(proj?proj.name:projGroup?.pid||"")+(proj&&proj.id?' ('+proj.id+')':'')+'</div>'
      +'<div style="font-size:11px;color:#64748b;margin-top:3px">Period: <b>'+label+'</b> ┬╖ Generated: '+now+'</div></div>'
      +'<div style="text-align:right;font-size:11px;color:#64748b;line-height:1.8">'
      +'<div style="font-size:22px;font-weight:800;color:'+bc+'">'+sp2+'%</div>'
      +'<div>'+sd+'/'+sActs.length+' completed</div></div></div>'
      +'<div style="height:6px;background:#e2e8f0;border-radius:3px;margin-bottom:16px"><div style="width:'+sp2+'%;height:100%;background:'+bc+';border-radius:3px"></div></div>'
      +'<table style="width:100%;border-collapse:collapse;border:1px solid #e2e8f0">'
      +tableHead+'<tbody>'+bodyRows+'</tbody></table>'
      +'<div style="margin-top:20px;padding-top:8px;border-top:1px solid #e2e8f0;font-size:9px;color:#94a3b8;text-align:center">ENEVO GROUP ┬╖ '+subName+' ┬╖ '+now+'</div>'
      +'</body></html>';
    var w=window.open("","subpdf_"+Date.now()+"_"+Math.random().toString(36).slice(2));
    if(w){w.document.write(html);w.document.close();w.focus();setTimeout(function(){w.print();},600);}
  };

  // Detect sub-sites for the selected project
  const selectedProjGroup = selProj!=="ALL" ? grouped.find(function(g){return g.pid===selProj;}) : null;
  const selectedProjSubs  = selectedProjGroup ? Object.values(selectedProjGroup.subs) : [];

  return(
  <div>
    <div className="card" style={{marginBottom:14}}>
      <div style={{display:"flex",gap:12,flexWrap:"wrap",alignItems:"flex-end",justifyContent:"space-between"}}>
        <div style={{display:"flex",gap:12,flexWrap:"wrap",alignItems:"flex-end"}}>
          <div>
            <div style={{fontSize:12,fontWeight:700,color:"var(--text3)",marginBottom:5}}>PERIOD</div>
            <div style={{display:"flex",gap:5}}>
              {[{v:"daily",l:"Daily"},{v:"weekly",l:"Weekly"},{v:"monthly",l:"Monthly"},{v:"full",l:"Full Project"}].map(function(o){return(
                <button key={o.v} onClick={function(){setPeriod(o.v);}}
                  style={{padding:"6px 12px",borderRadius:5,cursor:"pointer",fontSize:13,
                    fontWeight:period===o.v?700:400,
                    border:"1px solid "+(period===o.v?"var(--info)":"var(--border3)"),
                    background:period===o.v?"var(--info)20":"var(--bg2)",
                    color:period===o.v?"var(--info)":"var(--text2)"}}>
                  {o.l}
                </button>
              );})}
            </div>
          </div>
          <div>
            <div style={{fontSize:12,fontWeight:700,color:"var(--text3)",marginBottom:5}}>PROJECT</div>
            <select value={selProj} onChange={function(e){setSelProj(e.target.value);}}
              style={{background:"var(--bg2)",border:"1px solid var(--border3)",borderRadius:5,color:"var(--text0)",padding:"6px 10px",fontSize:13,minWidth:190}}>
              <option value="ALL">All Projects</option>
              {[...new Set(activities.filter(function(a){return visibleProjIds.has(a.project_id);}).map(function(a){return a.project_id;}))].sort(function(a,b){
                const na=projects.find(function(p){return p.id===a;});
                const nb=projects.find(function(p){return p.id===b;});
                return (na?na.name:a).localeCompare(nb?nb.name:b);
              }).map(function(pid){
                const p=projects.find(function(x){return x.id===pid;});
                return <option key={pid} value={pid}>{p?p.name:pid}</option>;
              })}
            </select>
          </div>
          <div>
            <div style={{fontSize:12,fontWeight:700,color:"var(--text3)",marginBottom:5}}>STATUS</div>
            <select value={selStat} onChange={function(e){setSelStat(e.target.value);}}
              style={{background:"var(--bg2)",border:"1px solid var(--border3)",borderRadius:5,color:"var(--text0)",padding:"6px 10px",fontSize:13}}>
              <option value="ALL">All Statuses</option>
              {["Not Started","In Progress","On Hold","Completed"].map(function(s){return <option key={s}>{s}</option>;})}
            </select>
          </div>
          {/* Project status toggle */}
          <label style={{display:"flex",alignItems:"center",gap:7,cursor:"pointer",paddingBottom:2}}>
            <input type="checkbox" checked={showInactiveProj}
              onChange={function(e){setShowInactiveProj(e.target.checked);setSelProj("ALL");}}
              style={{accentColor:"var(--info)",width:15,height:15,cursor:"pointer"}}/>
            <span style={{fontSize:13,color:"var(--text3)",userSelect:"none"}}>Include On Hold & Completed projects</span>
          </label>
        </div>
        <div style={{display:"flex",gap:8,alignItems:"center",flexWrap:"wrap"}}>
          <button className="bp" onClick={buildPDF} style={{height:36,padding:"0 18px",fontSize:13,fontWeight:700}}>ظشç Export PDF</button>
          {/* Sub-site individual exports ظ¤ only shown when a single project with sub-sites is selected */}
          {selectedProjSubs.length>0&&(
            <div style={{display:"flex",gap:6,flexWrap:"wrap",alignItems:"center"}}>
              <span style={{fontSize:12,color:"var(--text4)",fontWeight:600,whiteSpace:"nowrap"}}>Sub-sites:</span>
              {selectedProjSubs.map(function(s){
                const sActs=Object.values(s.cats).flat();
                const sp2=sActs.length?Math.round(sActs.reduce(function(r,a){return r+(a.progress||0);},0)/sActs.length*100):0;
                const sc=sp2===100?"#34d399":sp2>=50?"var(--info)":"#fb923c";
                return(
                  <button key={s.subId} onClick={function(){buildSubPDF(s.subId,s.subName);}}
                    style={{height:36,padding:"0 14px",borderRadius:6,border:"1px solid #a78bfa50",
                      background:"#a78bfa12",color:"#a78bfa",cursor:"pointer",fontSize:13,
                      fontFamily:"'IBM Plex Sans',sans-serif",fontWeight:600,display:"flex",alignItems:"center",gap:6}}>
                    ظشç {s.subName}
                    <span style={{fontFamily:"'IBM Plex Mono',monospace",fontSize:11,color:sc,fontWeight:700}}>{sp2}%</span>
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
    <div style={{display:"grid",gridTemplateColumns:"repeat(5,1fr)",gap:10,marginBottom:14}}>
      {[{l:"Total",v:total,c:"var(--info)"},{l:"Completed",v:done,c:"#34d399"},
        {l:"In Progress",v:inprog,c:"var(--info)"},{l:"On Hold",v:onhold,c:"#fb923c"},
        {l:"Avg Progress",v:avg+"%",c:avg>=75?"#34d399":avg>=40?"#fb923c":"#f87171"}
      ].map(function(k){return(
        <div key={k.l} className="card" style={{textAlign:"center",padding:"12px 8px"}}>
          <div style={{fontFamily:"'IBM Plex Mono',monospace",fontSize:22,fontWeight:700,color:k.c,lineHeight:1}}>{k.v}</div>
          <div style={{fontSize:12,color:"var(--text4)",marginTop:4,textTransform:"uppercase",letterSpacing:".05em"}}>{k.l}</div>
        </div>
      );})}
    </div>
    {onhold>0&&<div style={{background:"#78350f15",border:"1px solid #fb923c60",borderRadius:6,padding:"9px 14px",marginBottom:12,fontSize:13,color:"#fb923c"}}>
      ظأب {onhold} {onhold===1?"activity":"activities"} On Hold ظ¤ review required
    </div>}
    {grouped.length===0&&<div style={{textAlign:"center",padding:40,color:"var(--text4)",fontSize:14}}>No activities match filters.</div>}
    {grouped.map(function(g){
      const proj=projects.find(function(p){return p.id===g.pid;});
      const subList=Object.values(g.subs);
      const hasSubs=subList.length>0;
      const allActs=[].concat(
        Object.values(g.cats).flat(),
        subList.flatMap(function(s){return Object.values(s.cats).flat();})
      );
      const pd=allActs.filter(function(a){return a.status==="Completed";}).length;
      const pp=allActs.length?Math.round(allActs.reduce(function(s,a){return s+(a.progress||0);},0)/allActs.length*100):0;
      const bc=pp===100?"#34d399":pp>=50?"var(--info)":"#fb923c";
      const SUB_COLORS=["#7c3aed","#0369a1","#047857","#b45309","#be123c","#0f766e","#6d28d9","#0284c7"];
      return(
      <div key={g.pid} className="card" style={{marginBottom:12}}>
        {/* Project header */}
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:10,paddingBottom:10,borderBottom:"1px solid var(--border3)"}}>
          <div>
            <div style={{fontSize:16,fontWeight:700,color:"var(--text0)"}}>{proj?proj.name:g.pid}</div>
            <div style={{fontFamily:"'IBM Plex Mono',monospace",fontSize:12,color:"var(--info)",marginTop:1}}>{g.pid}</div>
            {proj&&proj.project_leader&&<div style={{fontSize:13,color:"var(--text2)",marginTop:1,fontWeight:700}}>Leader: <span style={{color:"var(--info)"}}>{proj.project_leader}</span></div>}
            {proj&&proj.project_leader&&<div style={{fontSize:13,color:"var(--text2)",marginTop:1,fontWeight:700}}>Leader: <span style={{color:"var(--info)"}}>{proj.project_leader}</span></div>}
            {proj&&proj.pm&&<div style={{fontSize:13,color:"var(--text3)",marginTop:1}}>PM: <span style={{color:"#a78bfa",fontWeight:600}}>{proj.pm}</span></div>}
            {proj&&proj.phase&&<div style={{fontSize:13,color:"var(--text3)",marginTop:2}}>Phase: <span style={{color:"#60a5fa"}}>{proj.phase}</span>{proj.status&&<span> ┬╖ <span style={{color:proj.status==="Active"?"#34d399":"var(--text3)"}}>{proj.status}</span></span>}</div>}
            {hasSubs&&<div style={{display:"flex",gap:4,flexWrap:"wrap",marginTop:6}}>
              {subList.map(function(s,si){
                const sActs=Object.values(s.cats).flat();
                const sp2=sActs.length?Math.round(sActs.reduce(function(r,a){return r+(a.progress||0);},0)/sActs.length*100):0;
                const sd=sActs.filter(function(a){return a.status==="Completed";}).length;
                const sc2=SUB_COLORS[si%SUB_COLORS.length];
                const spColor=sp2===100?"#34d399":sp2>=50?"var(--info)":"#fb923c";
                return <span key={s.subId} style={{fontSize:12,padding:"2px 9px",borderRadius:12,border:"1px solid "+sc2+"60",background:sc2+"18",color:sc2,fontWeight:600}}>
                  ≡اô {s.subName}: <span style={{color:spColor}}>{sp2}%</span> <span style={{color:"var(--text4)",fontWeight:400}}>({sd}/{sActs.length})</span>
                </span>;
              })}
            </div>}
          </div>
          <div style={{textAlign:"right"}}>
            <div style={{fontFamily:"'IBM Plex Mono',monospace",fontSize:24,fontWeight:700,color:bc}}>{pp}%</div>
            <div style={{fontSize:12,color:"var(--text4)"}}>{pd}/{allActs.length} completed</div>
            <div style={{marginTop:5,background:"var(--bg3)",borderRadius:4,height:5,width:100,overflow:"hidden",marginLeft:"auto"}}>
              <div style={{height:"100%",width:pp+"%",background:bc,borderRadius:4}}/>
            </div>
          </div>
        </div>

        {/* Sub-site sections (if any) */}
        {hasSubs&&subList.map(function(s,si){
          const sc2=SUB_COLORS[si%SUB_COLORS.length];
          const sActs=Object.values(s.cats).flat();
          const sp2=sActs.length?Math.round(sActs.reduce(function(r,a){return r+(a.progress||0);},0)/sActs.length*100):0;
          const sd=sActs.filter(function(a){return a.status==="Completed";}).length;
          const sbColor=sp2===100?"#34d399":sp2>=50?"var(--info)":"#fb923c";
          return(
          <div key={s.subId} style={{marginBottom:10}}>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"6px 10px",background:sc2+"18",borderRadius:6,border:"1px solid "+sc2+"40",marginBottom:6}}>
              <span style={{fontSize:13,fontWeight:700,color:sc2}}>≡اô {s.subName}</span>
              <span style={{fontFamily:"'IBM Plex Mono',monospace",fontSize:13,fontWeight:700,color:sbColor}}>{sp2}% <span style={{fontSize:12,color:"var(--text4)",fontWeight:400}}>({sd}/{sActs.length})</span></span>
            </div>
            {Object.entries(s.cats).map(function(entry){
              const cat=entry[0]; const catActs=entry[1];
              const gc=GC[catActs[0]?catActs[0].group_name:""]||sc2;
              return(
              <div key={cat} style={{marginBottom:8,paddingLeft:8}}>
                <div style={{fontSize:12,fontWeight:700,color:gc,textTransform:"uppercase",letterSpacing:".07em",marginBottom:4,display:"flex",alignItems:"center",gap:6}}>
                  <div style={{width:6,height:6,borderRadius:2,background:gc}}/>{cat}
                </div>
                <div style={{display:"grid",gap:4}}>
                  {catActs.map(function(a){
                    const pct=Math.round((a.progress||0)*100);
                    const ov=a.end_date&&new Date(a.end_date)<today&&a.status!=="Completed";
                    return(
                    <div key={a.id} style={{background:"var(--bg2)",border:"1px solid var(--border3)",borderRadius:6,padding:"8px 12px"}}>
                      <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",gap:10}}>
                        <div style={{flex:1,minWidth:0}}>
                          <div style={{fontSize:13,fontWeight:600,color:"var(--text0)",marginBottom:4}}>{a.activity_name}</div>
                          <div style={{display:"flex",flexWrap:"wrap",gap:4,alignItems:"center"}}>
                            <span style={{fontSize:12,padding:"2px 7px",borderRadius:3,background:SB[a.status]||"var(--bg3)",color:SC[a.status]||"var(--text3)",fontWeight:600}}>{a.status}</span>
                            {a.assigned_to&&<span style={{fontSize:12,color:"var(--text3)"}}>≡اّج {a.assigned_to}</span>}
                            {a.start_date&&<span style={{fontSize:12,color:"var(--text4)"}}>ظû╢ {fmtD(a.start_date)}</span>}
                            {a.end_date&&<span style={{fontSize:12,color:ov?"#f87171":"var(--text4)",fontWeight:ov?700:400}}>{ov?"ظأب ":""}ظ {fmtD(a.end_date)}{ov?" (overdue)":""}</span>}
                          </div>
                          {a.remarks&&<div style={{fontSize:12,color:"var(--text4)",marginTop:4,fontStyle:"italic",padding:"3px 7px",background:"var(--bg3)",borderRadius:3,borderLeft:"2px solid var(--border3)"}}>{a.remarks}</div>}
                          {(()=>{
                            var cs=a.comments?Array.isArray(a.comments)?a.comments:JSON.parse(a.comments||'[]'):[];
                            if(!cs.length) return null;
                            return <div style={{marginTop:6,borderTop:"1px solid var(--border3)",paddingTop:6,display:"grid",gap:5}}>
                              {cs.map(function(c){
                                var ts=c.ts?new Date(c.ts).toLocaleString("en-GB",{day:"2-digit",month:"short",year:"numeric",hour:"2-digit",minute:"2-digit"}):"";
                                return <div key={c.id} style={{display:"flex",gap:6,alignItems:"flex-start"}}>
                                  <div style={{width:20,height:20,borderRadius:"50%",flexShrink:0,background:c._migrated?"#fb923c20":"#a78bfa20",color:c._migrated?"#fb923c":"#a78bfa",fontSize:9,fontWeight:700,display:"flex",alignItems:"center",justifyContent:"center"}}>{(c.author||"?").slice(0,2).toUpperCase()}</div>
                                  <div style={{flex:1,minWidth:0}}>
                                    <div style={{fontSize:11,color:"var(--text3)",marginBottom:1}}><span style={{fontWeight:700,color:"var(--text2)"}}>{c.author}</span>{c.role?" ┬╖ "+c.role:""}<span style={{float:"right",color:"var(--text4)",fontSize:10}}>{ts}</span></div>
                                    <div style={{fontSize:12,color:"var(--text1)",background:"var(--bg3)",borderRadius:"0 5px 5px 5px",padding:"4px 8px",borderLeft:"2px solid "+(c._migrated?"#fb923c":"#a78bfa")}}>{c.text}</div>
                                  </div>
                                </div>;
                              })}
                            </div>;
                          })()}
                        </div>
                        <div style={{fontFamily:"'IBM Plex Mono',monospace",fontSize:16,fontWeight:700,flexShrink:0,color:pct===100?"#34d399":pct>=50?"var(--info)":"var(--text3)"}}>{pct}%</div>
                      </div>
                      {pct>0&&<div style={{marginTop:6,background:"var(--bg3)",borderRadius:2,height:3,overflow:"hidden"}}>
                        <div style={{height:"100%",width:pct+"%",background:pct===100?"#34d399":"var(--info)",borderRadius:2}}/>
                      </div>}
                    </div>);
                  })}
                </div>
              </div>);
            })}
          </div>);
        })}

        {/* Activities not assigned to any sub-site */}
        {Object.keys(g.cats).length>0&&(
          <div>
            {hasSubs&&<div style={{fontSize:12,fontWeight:700,color:"var(--text4)",textTransform:"uppercase",letterSpacing:".07em",marginBottom:6,padding:"4px 8px",background:"var(--bg2)",borderRadius:4}}>No Sub-site Assigned</div>}
            {Object.entries(g.cats).map(function(entry){
              const cat=entry[0]; const catActs=entry[1];
              const gc=GC[catActs[0]?catActs[0].group_name:""]||"var(--info)";
              return(
              <div key={cat} style={{marginBottom:10,paddingLeft:hasSubs?8:0}}>
                <div style={{fontSize:12,fontWeight:700,color:gc,textTransform:"uppercase",letterSpacing:".07em",marginBottom:5,display:"flex",alignItems:"center",gap:6}}>
                  <div style={{width:7,height:7,borderRadius:2,background:gc}}/>{cat}
                </div>
                <div style={{display:"grid",gap:4}}>
                  {catActs.map(function(a){
                    const pct=Math.round((a.progress||0)*100);
                    const ov=a.end_date&&new Date(a.end_date)<today&&a.status!=="Completed";
                    return(
                    <div key={a.id} style={{background:"var(--bg2)",border:"1px solid var(--border3)",borderRadius:6,padding:"8px 12px"}}>
                      <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",gap:10}}>
                        <div style={{flex:1,minWidth:0}}>
                          <div style={{fontSize:13,fontWeight:600,color:"var(--text0)",marginBottom:4}}>{a.activity_name}</div>
                          <div style={{display:"flex",flexWrap:"wrap",gap:4,alignItems:"center"}}>
                            <span style={{fontSize:12,padding:"2px 7px",borderRadius:3,background:SB[a.status]||"var(--bg3)",color:SC[a.status]||"var(--text3)",fontWeight:600}}>{a.status}</span>
                            {a.assigned_to&&<span style={{fontSize:12,color:"var(--text3)"}}>≡اّج {a.assigned_to}</span>}
                            {a.start_date&&<span style={{fontSize:12,color:"var(--text4)"}}>ظû╢ {fmtD(a.start_date)}</span>}
                            {a.end_date&&<span style={{fontSize:12,color:ov?"#f87171":"var(--text4)",fontWeight:ov?700:400}}>{ov?"ظأب ":""}ظ {fmtD(a.end_date)}{ov?" (overdue)":""}</span>}
                          </div>
                          {a.remarks&&<div style={{fontSize:12,color:"var(--text4)",marginTop:4,fontStyle:"italic",padding:"3px 7px",background:"var(--bg3)",borderRadius:3,borderLeft:"2px solid var(--border3)"}}>{a.remarks}</div>}
                          {(()=>{
                            var cs=a.comments?Array.isArray(a.comments)?a.comments:JSON.parse(a.comments||'[]'):[];
                            if(!cs.length) return null;
                            return <div style={{marginTop:6,borderTop:"1px solid var(--border3)",paddingTop:6,display:"grid",gap:5}}>
                              {cs.map(function(c){
                                var ts=c.ts?new Date(c.ts).toLocaleString("en-GB",{day:"2-digit",month:"short",year:"numeric",hour:"2-digit",minute:"2-digit"}):"";
                                return <div key={c.id} style={{display:"flex",gap:6,alignItems:"flex-start"}}>
                                  <div style={{width:20,height:20,borderRadius:"50%",flexShrink:0,background:c._migrated?"#fb923c20":"#a78bfa20",color:c._migrated?"#fb923c":"#a78bfa",fontSize:9,fontWeight:700,display:"flex",alignItems:"center",justifyContent:"center"}}>{(c.author||"?").slice(0,2).toUpperCase()}</div>
                                  <div style={{flex:1,minWidth:0}}>
                                    <div style={{fontSize:11,color:"var(--text3)",marginBottom:1}}><span style={{fontWeight:700,color:"var(--text2)"}}>{c.author}</span>{c.role?" ┬╖ "+c.role:""}<span style={{float:"right",color:"var(--text4)",fontSize:10}}>{ts}</span></div>
                                    <div style={{fontSize:12,color:"var(--text1)",background:"var(--bg3)",borderRadius:"0 5px 5px 5px",padding:"4px 8px",borderLeft:"2px solid "+(c._migrated?"#fb923c":"#a78bfa")}}>{c.text}</div>
                                  </div>
                                </div>;
                              })}
                            </div>;
                          })()}
                        </div>
                        <div style={{fontFamily:"'IBM Plex Mono',monospace",fontSize:16,fontWeight:700,flexShrink:0,color:pct===100?"#34d399":pct>=50?"var(--info)":"var(--text3)"}}>{pct}%</div>
                      </div>
                      {pct>0&&<div style={{marginTop:6,background:"var(--bg3)",borderRadius:2,height:3,overflow:"hidden"}}>
                        <div style={{height:"100%",width:pct+"%",background:pct===100?"#34d399":"var(--info)",borderRadius:2}}/>
                      </div>}
                    </div>);
                  })}
                </div>
              </div>);
            })}
          </div>
        )}
      </div>);
    })}
  </div>
  );
}

function AssignmentReport({entries,projects,engineers,month,year}){
  const [selProj,setSelProj]=React.useState("ALL");
  const [selEng,setSelEng]=React.useState("ALL");
  const [showInactive,setShowInactive]=React.useState(false); // default: Active projects only
  const MN=["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];

  // Active-only filter applied to projects ظ¤ On Hold and Completed excluded by default
  const visibleProjects=React.useMemo(function(){
    return projects.filter(function(p){
      if(showInactive) return true; // show everything when toggled
      return (p.status||"Active")==="Active";
    });
  },[projects,showInactive]);

  // Work entries for the selected month ظ¤ month is 0-based to match app state
  const workE=React.useMemo(function(){
    const activeIds=new Set(visibleProjects.map(function(p){return p.id;}));
    return entries.filter(function(e){
      var d=new Date(e.date+"T12:00:00");
      if(d.getFullYear()!==year||d.getMonth()!==month||e.entry_type!=="work") return false;
      if(e.project_id&&!activeIds.has(e.project_id)) return false; // exclude inactive projects
      if(selProj!=="ALL"&&e.project_id!==selProj) return false;
      if(selEng!=="ALL"&&String(e.engineer_id)!==String(selEng)) return false;
      return true;
    });
  },[entries,year,month,selProj,selEng,visibleProjects]);

  // Build hours map: {project_id: {engineer_id: {hours, tasks}}}
  const hoursMap=React.useMemo(function(){
    var map={};
    workE.forEach(function(e){
      var pid=e.project_id||"?";
      if(!map[pid]) map[pid]={};
      var eid=String(e.engineer_id);
      if(!map[pid][eid]) map[pid][eid]={hours:0,tasks:{}};
      map[pid][eid].hours+=e.hours;
      var t=e.task_type||"General";
      map[pid][eid].tasks[t]=(map[pid][eid].tasks[t]||0)+e.hours;
    });
    return map;
  },[workE]);

  // Build grouped list: derive from ASSIGNED engineers on each project (not just hours logged)
  // This ensures engineers assigned to a project but with 0 hours still appear
  const grouped=React.useMemo(function(){
    // Collect all relevant project IDs from VISIBLE (status-filtered) projects only
    var projIds=new Set();
    visibleProjects.forEach(function(p){
      if(selProj!=="ALL"&&p.id!==selProj) return;
      var ae=(p.assigned_engineers||[]).map(String);
      if(selEng==="ALL"){
        if(ae.length>0||(hoursMap[p.id]&&Object.keys(hoursMap[p.id]).length>0)) projIds.add(p.id);
      } else {
        if(ae.includes(String(selEng))||(hoursMap[p.id]&&hoursMap[p.id][String(selEng)])) projIds.add(p.id);
      }
    });
    // Also include visible projects that have hours but no assigned_engineers set (legacy data)
    const visibleIds=new Set(visibleProjects.map(function(p){return p.id;}));
    Object.keys(hoursMap).forEach(function(pid){
      if(!visibleIds.has(pid)) return; // skip inactive-project entries
      if(selProj!=="ALL"&&pid!==selProj) return;
      projIds.add(pid);
    });

    return Array.from(projIds).map(function(pid){
      var proj=projects.find(function(p){return p.id===pid;});
      var ae=(proj?.assigned_engineers||[]).map(String);
      var engMap={};
      // Add all assigned engineers (may have 0 hours)
      ae.forEach(function(eid){
        if(selEng!=="ALL"&&eid!==String(selEng)) return;
        var eng=engineers.find(function(e){return String(e.id)===eid;});
        if(!eng) return; // skip if engineer not in scoped list
        var logged=(hoursMap[pid]&&hoursMap[pid][eid])||{hours:0,tasks:{}};
        engMap[eid]=logged;
      });
      // Also add engineers who logged hours but may not be in assigned_engineers (legacy)
      if(hoursMap[pid]){
        Object.keys(hoursMap[pid]).forEach(function(eid){
          if(selEng!=="ALL"&&eid!==String(selEng)) return;
          if(!engMap[eid]) engMap[eid]=hoursMap[pid][eid];
        });
      }
      var tot=Object.values(engMap).reduce(function(s,x){return s+x.hours;},0);
      var assignedCount=ae.length;
      return{pid,engs:engMap,tot,assignedCount};
    }).filter(function(g){return Object.keys(g.engs).length>0;})
      .sort(function(a,b){return b.tot-a.tot;});
  },[workE,hoursMap,visibleProjects,engineers,selProj,selEng]);

  var totHrs=grouped.reduce(function(s,g){return s+g.tot;},0);
  var totEngs=new Set(grouped.flatMap(function(g){return Object.keys(g.engs);})).size;

  var exportPDF=function(){
    var now=new Date().toLocaleDateString("en-GB",{day:"2-digit",month:"short",year:"numeric"});
    var period=(MN[month]||"")+" "+year;
    var blocks=grouped.map(function(g){
      var proj=projects.find(function(p){return p.id===g.pid;});
      var rows=Object.entries(g.engs).sort(function(a,b){return b[1].hours-a[1].hours;}).map(function(kv){
        var eng=engineers.find(function(e){return String(e.id)===kv[0];});
        var tasks=Object.entries(kv[1].tasks).map(function(t){return t[0]+": "+t[1]+"h";}).join(", ")||"ظ¤";
        var hoursStr=kv[1].hours>0?kv[1].hours+"h":"0h (assigned, no hours)";
        var hrsColor=kv[1].hours>0?"#1d4ed8":"#94a3b8";
        return "<tr><td style='padding:5px 8px 5px 20px;font-size:12px'>"+(eng?eng.name:kv[0])+"</td>"
          +"<td style='padding:5px 8px;font-size:11px;color:#64748b'>"+(eng?eng.role||"":"")+"</td>"
          +"<td style='padding:5px 8px;font-size:11px;color:#64748b'>"+tasks+"</td>"
          +"<td style='padding:5px 8px;text-align:right;font-family:monospace;font-weight:700;color:"+hrsColor+"'>"+hoursStr+"</td></tr>";
      }).join("");
      return "<div style='margin-bottom:16px;page-break-inside:avoid'>"
        +"<div style='background:linear-gradient(135deg,#1e3a5f,#1e4d8c);color:#fff;padding:9px 14px;border-radius:6px 6px 0 0;display:flex;justify-content:space-between'>"
        +"<div><div style='font-size:14px;font-weight:700'>"+(proj?proj.name:g.pid)+"</div>"
        +"<div style='font-size:10px;color:#93c5fd'>"+g.pid+(proj&&proj.project_leader?" ┬╖ Leader: "+proj.project_leader:"")+(proj&&proj.pm?" ┬╖ PM: "+proj.pm:"")+(proj&&proj.phase?" ┬╖ "+proj.phase:"")+"</div></div>"
        +"<div style='text-align:right'><div style='font-size:20px;font-weight:800;color:#60a5fa'>"+g.tot+"h</div>"
        +"<div style='font-size:10px;color:#93c5fd'>"+g.assignedCount+" assigned ┬╖ "+Object.keys(g.engs).length+" shown</div></div></div>"
        +"<table style='width:100%;border-collapse:collapse;border:1px solid #e2e8f0;border-top:none'>"
        +"<thead><tr style='background:#f1f5f9'>"
        +"<th style='padding:5px 8px 5px 20px;text-align:left;font-size:9px;color:#64748b;border-bottom:1px solid #e2e8f0'>ENGINEER</th>"
        +"<th style='padding:5px 8px;text-align:left;font-size:9px;color:#64748b;border-bottom:1px solid #e2e8f0'>ROLE</th>"
        +"<th style='padding:5px 8px;text-align:left;font-size:9px;color:#64748b;border-bottom:1px solid #e2e8f0'>TASKS</th>"
        +"<th style='padding:5px 8px;text-align:right;font-size:9px;color:#64748b;border-bottom:1px solid #e2e8f0'>HRS</th>"
        +"</tr></thead><tbody>"+rows+"</tbody></table></div>";
    }).join("");
    var html="<!DOCTYPE html><html><head><meta charset='utf-8'><title>Assignment Report</title>"
      +"<style>body{font-family:'Segoe UI',Arial,sans-serif;margin:0;padding:20px;color:#1e293b}@media print{body{padding:0}@page{margin:14mm}.proj-block{page-break-inside:auto}table{page-break-inside:auto}tr{page-break-inside:avoid;page-break-after:auto}}</style>"
      +"</head><body>"
      +"<div style='display:flex;justify-content:space-between;margin-bottom:16px;padding-bottom:12px;border-bottom:3px solid #1e3a5f'>"
      +"<div><div style='font-size:20px;font-weight:800;color:#1e3a5f'>ENEVO GROUP</div>"
      +"<div style='font-size:15px;font-weight:700;color:#334155;margin-top:2px'>Assignment Report ظ¤ "+period+"</div>"
      +"<div style='font-size:11px;color:#64748b;margin-top:3px'>Generated: "+now+(showInactive?" ┬╖ All statuses":" ┬╖ Active projects only")+" ┬╖ Includes assigned engineers with 0 hours</div></div>"
      +"<div style='text-align:right;font-size:11px;color:#64748b;line-height:1.9'>"
      +"<div>"+grouped.length+" projects ┬╖ "+totEngs+" engineers</div>"
      +"<div>Total: <b>"+totHrs+"h</b></div></div></div>"
      +(grouped.length===0?"<p style='text-align:center;color:#94a3b8'>No assignments found.</p>":blocks)
      +"<div style='margin-top:20px;border-top:1px solid #e2e8f0;padding-top:8px;font-size:9px;color:#94a3b8;text-align:center'>ENEVO GROUP ظ¤ "+now+"</div>"
      +"</body></html>";
    var w=window.open("","pdf_"+Date.now()+"_"+Math.random().toString(36).slice(2));
    if(w){w.document.write(html);w.document.close();w.focus();setTimeout(function(){w.print();},600);}
  };

  return(<div>
    <div className="card" style={{marginBottom:14}}>
      <div style={{display:"flex",gap:12,flexWrap:"wrap",alignItems:"flex-end",justifyContent:"space-between"}}>
        <div style={{display:"flex",gap:12,flexWrap:"wrap",alignItems:"flex-end"}}>
          <div><div style={{fontSize:12,fontWeight:700,color:"var(--text3)",marginBottom:5}}>PROJECT</div>
            <select value={selProj} onChange={function(e){setSelProj(e.target.value);}}
              style={{background:"var(--bg2)",border:"1px solid var(--border3)",borderRadius:5,color:"var(--text0)",padding:"6px 10px",fontSize:13,minWidth:190}}>
              <option value="ALL">All Projects</option>
              {visibleProjects.filter(function(p){
                return (p.assigned_engineers||[]).length>0||Object.keys(hoursMap[p.id]||{}).length>0;
              }).map(function(p){return <option key={p.id} value={p.id}>{p.name||p.id}</option>;})}
            </select></div>
          <div><div style={{fontSize:12,fontWeight:700,color:"var(--text3)",marginBottom:5}}>ENGINEER</div>
            <select value={selEng} onChange={function(e){setSelEng(e.target.value);}}
              style={{background:"var(--bg2)",border:"1px solid var(--border3)",borderRadius:5,color:"var(--text0)",padding:"6px 10px",fontSize:13,minWidth:160}}>
              <option value="ALL">All Engineers</option>
              {engineers.map(function(e){return <option key={e.id} value={String(e.id)}>{e.name}</option>;})}
            </select></div>
          {/* Status toggle ظ¤ Active only by default */}
          <label style={{display:"flex",alignItems:"center",gap:7,cursor:"pointer",paddingBottom:2}}>
            <input type="checkbox" checked={showInactive} onChange={function(e){setShowInactive(e.target.checked);setSelProj("ALL");}}
              style={{accentColor:"var(--info)",width:15,height:15,cursor:"pointer"}}/>
            <span style={{fontSize:13,color:"var(--text3)",userSelect:"none"}}>
              Include On Hold & Completed
            </span>
          </label>
        </div>
        <button className="bp" onClick={exportPDF} style={{height:36,padding:"0 18px",fontSize:13,fontWeight:700}}>&#11015; Export PDF</button>
      </div>
    </div>
    <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:10,marginBottom:14}}>
      {[{l:"Projects",v:grouped.length,c:"var(--info)"},{l:"Engineers",v:totEngs,c:"#34d399"},{l:"Total Hours",v:totHrs+"h",c:"#a78bfa"}].map(function(k){return(
        <div key={k.l} className="card" style={{textAlign:"center",padding:"12px 8px"}}>
          <div style={{fontFamily:"'IBM Plex Mono',monospace",fontSize:22,fontWeight:700,color:k.c,lineHeight:1}}>{k.v}</div>
          <div style={{fontSize:12,color:"var(--text4)",marginTop:4,textTransform:"uppercase",letterSpacing:".05em"}}>{k.l}</div>
        </div>);})}
    </div>
    {grouped.length===0&&<div style={{textAlign:"center",padding:40,color:"var(--text4)"}}>No assignments found for {MN[month]} {year}.</div>}
    {grouped.map(function(g){
      var proj=projects.find(function(p){return p.id===g.pid;});
      return(<div key={g.pid} className="card" style={{marginBottom:12}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:12,paddingBottom:10,borderBottom:"1px solid var(--border3)"}}>
          <div>
            <div style={{fontSize:15,fontWeight:700,color:"var(--text0)"}}>{proj?proj.name:g.pid}</div>
            <div style={{fontFamily:"'IBM Plex Mono',monospace",fontSize:12,color:"var(--info)",marginTop:1}}>{g.pid}</div>
            {proj&&proj.pm&&<div style={{fontSize:13,color:"var(--text3)",marginTop:2}}>PM: <span style={{color:"#a78bfa",fontWeight:600}}>{proj.pm}</span></div>}
            {proj&&proj.phase&&<div style={{fontSize:13,color:"var(--text3)",marginTop:1}}>Phase: <span style={{color:"#60a5fa"}}>{proj.phase}</span></div>}
          </div>
          <div style={{textAlign:"right"}}>
            <div style={{fontFamily:"'IBM Plex Mono',monospace",fontSize:22,fontWeight:700,color:"var(--info)"}}>{g.tot}h</div>
            <div style={{fontSize:12,color:"var(--text4)"}}>{g.assignedCount} assigned ┬╖ {Object.keys(g.engs).length} shown</div>
          </div>
        </div>
        {Object.entries(g.engs).sort(function(a,b){return b[1].hours-a[1].hours;}).map(function(kv){
          var eng=engineers.find(function(e){return String(e.id)===kv[0];});
          var hasHours=kv[1].hours>0;
          return(<div key={kv[0]} style={{marginBottom:8,background:"var(--bg2)",borderRadius:6,padding:"8px 12px",
            border:"1px solid var(--border3)",opacity:hasHours?1:0.7}}>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:hasHours?5:0}}>
              <div>
                <span style={{fontSize:13,fontWeight:600,color:"var(--text0)"}}>{eng?eng.name:kv[0]}</span>
                {eng&&<span style={{fontSize:12,color:"var(--text4)",marginLeft:8}}>{eng.role}</span>}
              </div>
              <span style={{fontFamily:"'IBM Plex Mono',monospace",fontSize:13,fontWeight:700,
                color:hasHours?"var(--info)":"var(--text4)"}}>
                {hasHours?kv[1].hours+"h":"0h"}
                {!hasHours&&<span style={{fontSize:11,marginLeft:5,color:"var(--text4)"}}>assigned</span>}
              </span>
            </div>
            {hasHours&&<div style={{display:"flex",flexWrap:"wrap",gap:4}}>
              {Object.entries(kv[1].tasks).map(function(t){return(
                <span key={t[0]} style={{background:"var(--bg3)",borderRadius:4,padding:"2px 7px",fontSize:12}}>
                  <span style={{color:"var(--text2)",fontWeight:600}}>{t[0]}</span>
                  <span style={{fontFamily:"'IBM Plex Mono',monospace",color:"var(--info)",marginLeft:4}}>{t[1]}h</span>
                </span>);})}
            </div>}
          </div>);
        })}
      </div>);
    })}
  </div>);
}

export { ProjectTasksReport, VacationReport, TrackerProgressReport, AssignmentReport };
