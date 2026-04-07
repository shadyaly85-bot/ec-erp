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

export { ProjectTasksReport, VacationReport };
