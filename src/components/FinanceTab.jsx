import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { supabase } from '../supabase.js';
import { MONTHS, fmtCurrency, fmtPct, fmt, today, DEFAULT_WEEKEND } from '../constants.js';

const fmtEGP = v => v != null ? `EGP ${Math.abs(+v).toLocaleString("en-EG",{minimumFractionDigits:2,maximumFractionDigits:2})}` : "â€”";
const fmtEGPsigned = v => `${+v>=0?"+":"-"} EGP ${Math.abs(+v).toLocaleString("en-EG",{minimumFractionDigits:2,maximumFractionDigits:2})}`;
const MO_SHORT = ["","Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
const MAIN_ACCOUNTS = [
  "Fixed Assets","Cash & Cash Equivalents","Cash Custody","Customers","Non-Current assets",
  "Accrued Expenses","Creditors and other accounts payable","Payable Notes",
  "Tax and Social Insurance Authority","Capital","Share holders",
  "Revenue","Administrative expenses","Operating Costs"
];

/* â•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گ
   TRACKER PROGRESS REPORT
   â•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گ */
function TrackerProgressReport({activities,projects,subprojects,engineers}){
  const [period,  setPeriod]  = React.useState("weekly");
  const [selProj, setSelProj] = React.useState("ALL");
  const [selStat, setSelStat] = React.useState("ALL");
  const [showInactiveProj, setShowInactiveProj] = React.useState(false); // Active projects only by default
  const today = new Date();
  const fmtD = function(d){ return d ? new Date(d+"T12:00:00").toLocaleDateString("en-GB",{day:"2-digit",month:"short",year:"numeric"}) : "â€”"; };
  const GC = {"SCADA":"var(--info)","RTU-PLC":"#a78bfa","Protection":"#f87171","General":"#34d399"};
  const SC = {"Completed":"#34d399","In Progress":"var(--info)","Not Started":"var(--text3)","On Hold":"#fb923c"};
  const SB = {"Completed":"#14532d30","In Progress":"#0ea5e920","Not Started":"#1e293b40","On Hold":"#78350f30"};
  const PERIOD_LABEL = {daily:"Daily (Last 24h)",weekly:"Weekly (Last 7 days)",monthly:"Monthly (Last 30 days)",full:"Full Project"};

  // Filter projects by status â€” Active only unless showInactiveProj is checked
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
          var commentHTML=cs.length?'<div style="margin-top:5px;border-top:1px solid #e2e8f0;padding-top:4px">'+cs.map(function(c){var tsStr=c.ts?new Date(c.ts).toLocaleString("en-GB",{day:"2-digit",month:"short",year:"numeric",hour:"2-digit",minute:"2-digit"}):"";return'<div style="display:flex;gap:5px;margin-bottom:3px"><div style="width:18px;height:18px;border-radius:50%;background:'+(c._migrated?"#fff7ed":"#f5f3ff")+';color:'+(c._migrated?"#c2410c":"#7c3aed")+';font-size:8px;font-weight:700;display:flex;align-items:center;justify-content:center;flex-shrink:0">'+(c.author||"?").slice(0,2).toUpperCase()+'</div><div style="flex:1"><div style="font-size:9px;color:#475569;margin-bottom:1px"><b>'+c.author+'</b>'+(c.role?' آ· '+c.role:'')+' <span style="float:right;color:#94a3b8">'+tsStr+'</span></div><div style="font-size:10px;color:#334155;background:#f8fafc;border-left:2px solid '+(c._migrated?"#f97316":"#7c3aed")+';padding:2px 6px;border-radius:0 3px 3px 0">'+c.text+'</div></div></div>';}).join('')+'</div>':'';
          rows+='<tr><td style="padding:5px 6px 5px '+(indentPx+10)+'px;font-size:11px">'+a.activity_name+'</td>'
            +'<td style="padding:5px 6px"><span style="background:'+stBg+';color:'+stC+';padding:1px 6px;border-radius:3px;font-size:10px;font-weight:600">'+a.status+'</span></td>'
            +'<td style="padding:5px 6px;white-space:nowrap"><b style="font-size:11px;color:'+pctCol+'">'+pct+'%</b>'+bar+'</td>'
            +'<td style="padding:5px 6px;font-size:10px;color:#475569">'+(a.assigned_to||"â€”")+'</td>'
            +'<td style="padding:5px 6px;font-size:10px;white-space:nowrap">'+fmtD(a.start_date)+'</td>'
            +'<td style="padding:5px 6px;font-size:10px;white-space:nowrap;color:'+(ov?"#dc2626":"#475569")+';font-weight:'+(ov?"700":"400")+'">'+fmtD(a.end_date)+(ov?" âڑ ":"")+'</td>'
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
          +(proj&&proj.project_leader?' آ· Leader: '+proj.project_leader:'')
          +(proj&&proj.pm?' آ· PM: '+proj.pm:'')
          +(proj&&proj.phase?' آ· Phase: '+proj.phase:'')
          +(proj&&proj.client?' آ· '+proj.client:'')
        +'</div>'
        +(hasSubs?'<div style="font-size:10px;color:#a5b4fc;margin-top:3px">'+subList.length+' sub-site'+(subList.length!==1?'s':'')+': '+subList.map(function(s){return s.subName;}).join(' آ· ')+'</div>':'')
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
            +'ًں“چ '+s.subName
            +' <span style="font-weight:400;color:#64748b;font-size:10px">'
            +sp2+'% آ· '+sd+'/'+sActs.length+' done'
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
        // No sub-sites â€” original flat layout
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
      +'<div style="font-size:11px;color:#64748b;margin-top:3px">Period: <b>'+label+'</b> آ· '+(showInactiveProj?'All project statuses':'Active projects only')+' آ· Generated: '+now+'</div></div>'
      +'<div style="text-align:right;font-size:11px;color:#64748b;line-height:1.8">'
      +'<div>'+acts.length+' activities آ· '+grouped.length+' projects</div>'
      +'<div>Completed: <b style="color:#16a34a">'+done+'</b>  In Progress: <b style="color:#2563eb">'+inprog+'</b>  On Hold: <b style="color:#ea580c">'+onhold+'</b></div>'
      +'<div>Avg: <b style="font-size:14px">'+avg+'%</b></div></div></div>'
      +(grouped.length===0?'<p style="text-align:center;padding:30px;color:#94a3b8">No activities found.</p>':projHTML)
      +'<div style="margin-top:24px;padding-top:8px;border-top:1px solid #e2e8f0;font-size:9px;color:#94a3b8;text-align:center">ENEVO GROUP â€” Internal Report â€” '+now+'</div>'
      +'</body></html>';
    var w=window.open("","pdf_"+Date.now()+"_"+Math.random().toString(36).slice(2));
    if(w){w.document.write(html);w.document.close();w.focus();setTimeout(function(){w.print();},600);}
  };

  // â”€â”€ Build sub-site focused PDF â”€â”€
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
          +'<td style="padding:5px 6px;font-size:10px;color:#475569">'+(a.assigned_to||"â€”")+'</td>'
          +'<td style="padding:5px 6px;font-size:10px;white-space:nowrap">'+fmtD(a.start_date)+'</td>'
          +'<td style="padding:5px 6px;font-size:10px;white-space:nowrap;color:'+(ov?"#dc2626":"#475569")+';font-weight:'+(ov?"700":"400")+'">'+fmtD(a.end_date)+(ov?" âڑ ":"")+'</td>'
          +'<td style="padding:5px 6px;font-size:10px;color:#64748b">'+(a.remarks||"")+(cs.length?' '+commentHTML:'')+'</td></tr>';
      });
    });
    var html='<!DOCTYPE html><html><head><meta charset="utf-8"><title>'+subName+' â€” Progress Report</title>'
      +'<style>body{font-family:\'Segoe UI\',Arial,sans-serif;margin:0;padding:20px;color:#1e293b}'
      +'@media print{body{padding:0}@page{margin:14mm}table{page-break-inside:auto}tr{page-break-inside:avoid;page-break-after:auto}}</style></head><body>'
      +'<div style="display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:16px;padding-bottom:12px;border-bottom:3px solid #1e3a5f">'
      +'<div><div style="font-size:20px;font-weight:800;color:#1e3a5f">ENEVO GROUP</div>'
      +'<div style="font-size:15px;font-weight:700;color:#334155;margin-top:2px">Sub-site Report â€” '+subName+'</div>'
      +'<div style="font-size:12px;color:#7c3aed;font-weight:600;margin-top:2px">Part of: '+(proj?proj.name:projGroup?.pid||"")+(proj&&proj.id?' ('+proj.id+')':'')+'</div>'
      +'<div style="font-size:11px;color:#64748b;margin-top:3px">Period: <b>'+label+'</b> آ· Generated: '+now+'</div></div>'
      +'<div style="text-align:right;font-size:11px;color:#64748b;line-height:1.8">'
      +'<div style="font-size:22px;font-weight:800;color:'+bc+'">'+sp2+'%</div>'
      +'<div>'+sd+'/'+sActs.length+' completed</div></div></div>'
      +'<div style="height:6px;background:#e2e8f0;border-radius:3px;margin-bottom:16px"><div style="width:'+sp2+'%;height:100%;background:'+bc+';border-radius:3px"></div></div>'
      +'<table style="width:100%;border-collapse:collapse;border:1px solid #e2e8f0">'
      +tableHead+'<tbody>'+bodyRows+'</tbody></table>'
      +'<div style="margin-top:20px;padding-top:8px;border-top:1px solid #e2e8f0;font-size:9px;color:#94a3b8;text-align:center">ENEVO GROUP آ· '+subName+' آ· '+now+'</div>'
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
          <button className="bp" onClick={buildPDF} style={{height:36,padding:"0 18px",fontSize:13,fontWeight:700}}>â¬‡ Export PDF</button>
          {/* Sub-site individual exports â€” only shown when a single project with sub-sites is selected */}
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
                    â¬‡ {s.subName}
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
      âڑ  {onhold} {onhold===1?"activity":"activities"} On Hold â€” review required
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
            {proj&&proj.phase&&<div style={{fontSize:13,color:"var(--text3)",marginTop:2}}>Phase: <span style={{color:"#60a5fa"}}>{proj.phase}</span>{proj.status&&<span> آ· <span style={{color:proj.status==="Active"?"#34d399":"var(--text3)"}}>{proj.status}</span></span>}</div>}
            {hasSubs&&<div style={{display:"flex",gap:4,flexWrap:"wrap",marginTop:6}}>
              {subList.map(function(s,si){
                const sActs=Object.values(s.cats).flat();
                const sp2=sActs.length?Math.round(sActs.reduce(function(r,a){return r+(a.progress||0);},0)/sActs.length*100):0;
                const sd=sActs.filter(function(a){return a.status==="Completed";}).length;
                const sc2=SUB_COLORS[si%SUB_COLORS.length];
                const spColor=sp2===100?"#34d399":sp2>=50?"var(--info)":"#fb923c";
                return <span key={s.subId} style={{fontSize:12,padding:"2px 9px",borderRadius:12,border:"1px solid "+sc2+"60",background:sc2+"18",color:sc2,fontWeight:600}}>
                  ًں“چ {s.subName}: <span style={{color:spColor}}>{sp2}%</span> <span style={{color:"var(--text4)",fontWeight:400}}>({sd}/{sActs.length})</span>
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
              <span style={{fontSize:13,fontWeight:700,color:sc2}}>ًں“چ {s.subName}</span>
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
                            {a.assigned_to&&<span style={{fontSize:12,color:"var(--text3)"}}>ًں‘¤ {a.assigned_to}</span>}
                            {a.start_date&&<span style={{fontSize:12,color:"var(--text4)"}}>â–¶ {fmtD(a.start_date)}</span>}
                            {a.end_date&&<span style={{fontSize:12,color:ov?"#f87171":"var(--text4)",fontWeight:ov?700:400}}>{ov?"âڑ  ":""}âڈژ {fmtD(a.end_date)}{ov?" (overdue)":""}</span>}
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
                                    <div style={{fontSize:11,color:"var(--text3)",marginBottom:1}}><span style={{fontWeight:700,color:"var(--text2)"}}>{c.author}</span>{c.role?" آ· "+c.role:""}<span style={{float:"right",color:"var(--text4)",fontSize:10}}>{ts}</span></div>
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
                            {a.assigned_to&&<span style={{fontSize:12,color:"var(--text3)"}}>ًں‘¤ {a.assigned_to}</span>}
                            {a.start_date&&<span style={{fontSize:12,color:"var(--text4)"}}>â–¶ {fmtD(a.start_date)}</span>}
                            {a.end_date&&<span style={{fontSize:12,color:ov?"#f87171":"var(--text4)",fontWeight:ov?700:400}}>{ov?"âڑ  ":""}âڈژ {fmtD(a.end_date)}{ov?" (overdue)":""}</span>}
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
                                    <div style={{fontSize:11,color:"var(--text3)",marginBottom:1}}><span style={{fontWeight:700,color:"var(--text2)"}}>{c.author}</span>{c.role?" آ· "+c.role:""}<span style={{float:"right",color:"var(--text4)",fontSize:10}}>{ts}</span></div>
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

/* â•گâ•گâ•گ ASSIGNMENT REPORT â•گâ•گâ•گ */
function AssignmentReport({entries,projects,engineers,month,year}){
  const [selProj,setSelProj]=React.useState("ALL");
  const [selEng,setSelEng]=React.useState("ALL");
  const [showInactive,setShowInactive]=React.useState(false); // default: Active projects only
  const MN=["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];

  // Active-only filter applied to projects â€” On Hold and Completed excluded by default
  const visibleProjects=React.useMemo(function(){
    return projects.filter(function(p){
      if(showInactive) return true; // show everything when toggled
      return (p.status||"Active")==="Active";
    });
  },[projects,showInactive]);

  // Work entries for the selected month â€” month is 0-based to match app state
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
        var tasks=Object.entries(kv[1].tasks).map(function(t){return t[0]+": "+t[1]+"h";}).join(", ")||"â€”";
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
        +"<div style='font-size:10px;color:#93c5fd'>"+g.pid+(proj&&proj.project_leader?" آ· Leader: "+proj.project_leader:"")+(proj&&proj.pm?" آ· PM: "+proj.pm:"")+(proj&&proj.phase?" آ· "+proj.phase:"")+"</div></div>"
        +"<div style='text-align:right'><div style='font-size:20px;font-weight:800;color:#60a5fa'>"+g.tot+"h</div>"
        +"<div style='font-size:10px;color:#93c5fd'>"+g.assignedCount+" assigned آ· "+Object.keys(g.engs).length+" shown</div></div></div>"
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
      +"<div style='font-size:15px;font-weight:700;color:#334155;margin-top:2px'>Assignment Report â€” "+period+"</div>"
      +"<div style='font-size:11px;color:#64748b;margin-top:3px'>Generated: "+now+(showInactive?" آ· All statuses":" آ· Active projects only")+" آ· Includes assigned engineers with 0 hours</div></div>"
      +"<div style='text-align:right;font-size:11px;color:#64748b;line-height:1.9'>"
      +"<div>"+grouped.length+" projects آ· "+totEngs+" engineers</div>"
      +"<div>Total: <b>"+totHrs+"h</b></div></div></div>"
      +(grouped.length===0?"<p style='text-align:center;color:#94a3b8'>No assignments found.</p>":blocks)
      +"<div style='margin-top:20px;border-top:1px solid #e2e8f0;padding-top:8px;font-size:9px;color:#94a3b8;text-align:center'>ENEVO GROUP â€” "+now+"</div>"
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
          {/* Status toggle â€” Active only by default */}
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
            <div style={{fontSize:12,color:"var(--text4)"}}>{g.assignedCount} assigned آ· {Object.keys(g.engs).length} shown</div>
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

const ENTRY_TYPES = ["Custody","Accrued Salaries","Revenue","Creditors","Opening","Shareholders","project in process"];

/* â•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گ
   1. JOURNAL LEDGER
   â•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گ */
function JournalLedger({journalEntries, accounts, isAcct, isAdmin, onAdd, onDelete, onEdit, loading, showToast}) {
  const [filterType,  setFilterType]  = React.useState("ALL");
  const [filterMonth, setFilterMonth] = React.useState("ALL");
  const [search,      setSearch]      = React.useState("");
  const [editLine,    setEditLine]    = React.useState(null);
  const [showAdd,     setShowAdd]     = React.useState(false);
  const [voucherEntry,setVoucherEntry]= React.useState(null);

  // â”€â”€ Voucher header (shared across all lines in one entry) â”€â”€
  const blankHeader = {entry_no:"",entry_date:"",entry_type:"Custody",description:""};
  const blankLine   = {account_name:"",main_account:"",statement_type:"Profit & Loss Sheet",debit:"",credit:""};
  const [vHeader,   setVHeader]  = React.useState(blankHeader);
  const [vLines,    setVLines]   = React.useState([{...blankLine},{...blankLine}]);

  const canWrite  = isAcct || isAdmin;
  const types     = React.useMemo(()=>["ALL",...new Set(journalEntries.map(e=>e.entry_type))].sort(),[journalEntries]);
  const months    = React.useMemo(()=>["ALL",...new Set(journalEntries.map(e=>e.month))].sort((a,b)=>+a-+b),[journalEntries]);
  const acctNames = React.useMemo(()=>accounts.map(a=>a.account_name).sort(),[accounts]);
  const acctMap   = React.useMemo(()=>{const m={};accounts.forEach(a=>{m[a.account_name]=a;});return m;},[accounts]);

  const filtered = React.useMemo(()=>journalEntries.filter(e=>{
    if(filterType!=="ALL" && e.entry_type!==filterType) return false;
    if(filterMonth!=="ALL" && String(e.month)!==String(filterMonth)) return false;
    if(search && !`${e.entry_no} ${e.account_name} ${e.description} ${e.main_account}`.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  }),[journalEntries,filterType,filterMonth,search]);

  const totDr  = filtered.reduce((s,e)=>s+(+e.debit||0),0);
  const totCr  = filtered.reduce((s,e)=>s+(+e.credit||0),0);
  const balanced = Math.abs(totDr-totCr)<0.01;

  const typeColor = t=>({Opening:"#38bdf8","Accrued Salaries":"#a78bfa",Revenue:"#34d399",
    Custody:"#fb923c",Creditors:"#f87171",Shareholders:"#facc15","project in process":"#94a3b8"}[t]||"var(--text3)");

  // Group by entry_no for voucher view
  const entryGroups = React.useMemo(()=>{
    const g={};
    filtered.forEach(e=>{if(!g[e.entry_no]) g[e.entry_no]=[];g[e.entry_no].push(e);});
    return g;
  },[filtered]);

  // â”€â”€ Voucher totals â”€â”€
  const vDr = vLines.reduce((s,l)=>s+(+l.debit||0),0);
  const vCr = vLines.reduce((s,l)=>s+(+l.credit||0),0);
  const vBal = Math.abs(vDr-vCr)<0.01 && vDr>0;

  const updateLine=(i,field,val)=>setVLines(prev=>prev.map((l,idx)=>{
    if(idx!==i) return l;
    const next={...l,[field]:val};
    if(field==="account_name"){
      const a=acctMap[val];
      if(a){next.main_account=a.main_account||"";next.statement_type=a.statement_type||"Profit & Loss Sheet";}
    }
    return next;
  }));

  const openAdd=()=>{
    // Auto-suggest next entry no
    const maxNo=journalEntries.reduce((m,e)=>{const n=parseInt(e.entry_no,10);return isNaN(n)?m:Math.max(m,n);},0);
    setVHeader({...blankHeader,entry_no:String(maxNo+1),entry_date:new Date().toISOString().slice(0,10)});
    setVLines([{...blankLine},{...blankLine}]);
    setShowAdd(true);
  };

  const INP={background:"var(--bg2)",border:"1px solid var(--border3)",borderRadius:5,
    color:"var(--text0)",padding:"5px 8px",fontSize:13,width:"100%",boxSizing:"border-box"};

  return(<>
    <div>
      {/* Toolbar */}
      <div style={{display:"flex",gap:8,flexWrap:"wrap",marginBottom:12,alignItems:"center"}}>
        <input placeholder="ًں”چ Search..." value={search} onChange={e=>setSearch(e.target.value)}
          style={{background:"var(--bg2)",border:"1px solid var(--border3)",borderRadius:6,padding:"6px 10px",color:"var(--text0)",fontSize:13,width:190}}/>
        <select value={filterMonth} onChange={e=>setFilterMonth(e.target.value)}
          style={{background:"var(--bg1)",border:"1px solid var(--border3)",borderRadius:6,padding:"6px 10px",color:"var(--text0)",fontSize:13}}>
          <option value="ALL">All Months</option>
          {months.filter(m=>m!=="ALL").map(m=><option key={m} value={m}>{MO_SHORT[+m]||m}</option>)}
        </select>
        <select value={filterType} onChange={e=>setFilterType(e.target.value)}
          style={{background:"var(--bg1)",border:"1px solid var(--border3)",borderRadius:6,padding:"6px 10px",color:"var(--text0)",fontSize:13}}>
          <option value="ALL">All Types</option>
          {types.filter(t=>t!=="ALL").map(t=><option key={t}>{t}</option>)}
        </select>
        <span style={{fontSize:13,color:"var(--text4)",marginLeft:"auto"}}>{filtered.length} lines / {Object.keys(entryGroups).length} entries</span>
        {canWrite&&<button className="bp" style={{padding:"6px 14px",fontSize:13}} onClick={openAdd}>+ New Journal Entry</button>}
      </div>

      {/* Balance strip */}
      <div style={{display:"flex",gap:8,marginBottom:12}}>
        {[
          {l:"Filtered Debit",  v:fmtEGP(totDr), c:"#34d399"},
          {l:"Filtered Credit", v:fmtEGP(totCr), c:"#f87171"},
          {l:"Balanced",        v:balanced?"âœ“ YES":"âœ— NO", c:balanced?"#34d399":"#f87171"},
        ].map((k,i)=>(
          <div key={i} style={{background:"var(--bg2)",border:`1px solid ${k.c}30`,borderRadius:8,padding:"7px 14px",minWidth:155}}>
            <div style={{fontFamily:"'IBM Plex Mono',monospace",fontSize:13,fontWeight:700,color:k.c}}>{k.v}</div>
            <div style={{fontSize:12,color:"var(--text4)",marginTop:1}}>{k.l}</div>
          </div>
        ))}
      </div>

      {loading ? <div style={{textAlign:"center",padding:40,color:"var(--text4)"}}>Loading journalâ€¦</div> : (
      <div style={{overflowX:"auto"}}>
        <table style={{width:"100%",borderCollapse:"collapse",fontSize:13}}>
          <thead>
            <tr style={{background:"var(--bg2)"}}>
              {["Entry#","Date","Type","Account","Category","Debit","Credit","Description",""].map(h=>(
                <th key={h} style={{padding:"7px 10px",textAlign:["Debit","Credit"].includes(h)?"right":"left",
                  color:"var(--text3)",fontWeight:600,fontSize:13,borderBottom:"1px solid var(--border3)",whiteSpace:"nowrap"}}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.map((e,i)=>(
              <tr key={i} style={{borderBottom:"1px solid var(--border3)",background:i%2===0?"transparent":"var(--bg1)",cursor:"pointer"}}
                onClick={()=>setVoucherEntry(e.entry_no)}>
                <td style={{padding:"6px 10px",fontFamily:"'IBM Plex Mono',monospace",fontSize:13,color:"var(--text2)",whiteSpace:"nowrap"}}>{e.entry_no}</td>
                <td style={{padding:"6px 10px",fontFamily:"'IBM Plex Mono',monospace",fontSize:13,color:"var(--text3)",whiteSpace:"nowrap"}}>{String(e.entry_date).slice(0,10)}</td>
                <td style={{padding:"6px 10px"}}>
                  <span style={{background:typeColor(e.entry_type)+"20",color:typeColor(e.entry_type),padding:"2px 6px",borderRadius:4,fontSize:12,fontWeight:600}}>{e.entry_type}</span>
                </td>
                <td style={{padding:"6px 10px",color:"var(--text1)",fontWeight:500,whiteSpace:"nowrap"}}>{e.account_name}</td>
                <td style={{padding:"6px 10px"}}>
                  <div style={{fontSize:12,color:"var(--text3)"}}>{e.main_account}</div>
                  <span style={{fontSize:11,color:e.statement_type==="Balance Sheet"?"#38bdf8":"#a78bfa",fontWeight:600}}>{e.statement_type==="Balance Sheet"?"BS":"P&L"}</span>
                </td>
                <td style={{padding:"6px 10px",fontFamily:"'IBM Plex Mono',monospace",fontSize:13,color:"#34d399",textAlign:"right"}}>{+e.debit>0?fmtEGP(+e.debit):""}</td>
                <td style={{padding:"6px 10px",fontFamily:"'IBM Plex Mono',monospace",fontSize:13,color:"#f87171",textAlign:"right"}}>{+e.credit>0?fmtEGP(+e.credit):""}</td>
                <td style={{padding:"6px 10px",color:"var(--text3)",fontSize:13,maxWidth:200,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}} title={e.description}>{e.description}</td>
                <td style={{padding:"6px 10px"}}>
                  {canWrite && (
                    <div style={{display:"flex",gap:2}}>
                      <button onClick={ev=>{ev.stopPropagation();setEditLine({...e});}} title="Edit"
                        style={{background:"transparent",border:"none",color:"var(--info)",cursor:"pointer",fontSize:13,padding:"2px 4px"}}>âœژ</button>
                      <button onClick={ev=>{ev.stopPropagation();onDelete(e.id);}} title="Delete"
                        style={{background:"transparent",border:"none",color:"#f87171",cursor:"pointer",fontSize:13,padding:"2px 4px"}}>âœ•</button>
                    </div>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      )}

      {/* â”€â”€ Voucher View Modal â”€â”€ */}
      {voucherEntry && (()=>{
        const lines = journalEntries.filter(e=>e.entry_no===voucherEntry);
        const dr = lines.reduce((s,e)=>s+(+e.debit||0),0);
        const cr = lines.reduce((s,e)=>s+(+e.credit||0),0);
        const bal = Math.abs(dr-cr)<0.01;
        return(
          <div style={{position:"fixed",inset:0,background:"#00000090",display:"flex",alignItems:"center",justifyContent:"center",zIndex:1000}} onClick={()=>setVoucherEntry(null)}>
            <div className="card" style={{width:640,maxHeight:"90vh",overflowY:"auto",padding:24}} onClick={e=>e.stopPropagation()}>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:16}}>
                <div>
                  <div style={{fontSize:16,fontWeight:700,color:"var(--text0)"}}>Journal Voucher â€” Entry #{voucherEntry}</div>
                  <div style={{fontSize:13,color:"var(--text4)",marginTop:2}}>{lines[0]?.entry_date} آ· {lines[0]?.entry_type} آ· {lines.length} line{lines.length!==1?"s":""}</div>
                </div>
                <button onClick={()=>setVoucherEntry(null)} style={{background:"none",border:"none",color:"var(--text3)",fontSize:22,cursor:"pointer"}}>أ—</button>
              </div>
              <table style={{width:"100%",borderCollapse:"collapse",fontSize:13,marginBottom:12}}>
                <thead><tr style={{background:"var(--bg2)"}}>
                  {["Account","Category","Stmt","Debit","Credit"].map(h=>(
                    <th key={h} style={{padding:"7px 10px",textAlign:["Debit","Credit"].includes(h)?"right":"left",color:"var(--text3)",fontSize:13,fontWeight:600}}>{h}</th>
                  ))}
                </tr></thead>
                <tbody>
                  {lines.map((e,i)=>(
                    <tr key={i} style={{borderBottom:"1px solid var(--border3)"}}>
                      <td style={{padding:"6px 10px",color:"var(--text1)",fontWeight:500}}>{e.account_name}</td>
                      <td style={{padding:"6px 10px",color:"var(--text4)",fontSize:13}}>{e.main_account}</td>
                      <td style={{padding:"6px 10px"}}><span style={{fontSize:11,color:e.statement_type==="Balance Sheet"?"#38bdf8":"#a78bfa",fontWeight:600}}>{e.statement_type==="Balance Sheet"?"BS":"P&L"}</span></td>
                      <td style={{padding:"6px 10px",fontFamily:"'IBM Plex Mono',monospace",fontSize:13,color:"#34d399",textAlign:"right"}}>{+e.debit>0?fmtEGP(+e.debit):""}</td>
                      <td style={{padding:"6px 10px",fontFamily:"'IBM Plex Mono',monospace",fontSize:13,color:"#f87171",textAlign:"right"}}>{+e.credit>0?fmtEGP(+e.credit):""}</td>
                    </tr>
                  ))}
                  <tr style={{background:"var(--bg2)",fontWeight:700}}>
                    <td colSpan={3} style={{padding:"8px 10px",color:"var(--text0)"}}>TOTAL â€” {bal?"âœ… Balanced":"â‌Œ Unbalanced"}</td>
                    <td style={{padding:"8px 10px",fontFamily:"'IBM Plex Mono',monospace",textAlign:"right",color:"#34d399"}}>{fmtEGP(dr)}</td>
                    <td style={{padding:"8px 10px",fontFamily:"'IBM Plex Mono',monospace",textAlign:"right",color:"#f87171"}}>{fmtEGP(cr)}</td>
                  </tr>
                </tbody>
              </table>
              {lines[0]?.description && <div style={{fontSize:13,color:"var(--text3)",fontStyle:"italic",padding:"8px 0",borderTop:"1px solid var(--border3)"}}>{lines[0].description}</div>}
            </div>
          </div>
        );
      })()}

      {/* â•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گ
          NEW JOURNAL ENTRY â€” Double-Entry Voucher Modal
          Debit + Credit lines in the same window
         â•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گ */}
      {showAdd && canWrite && (
        <div style={{position:"fixed",inset:0,background:"#00000090",display:"flex",alignItems:"center",justifyContent:"center",zIndex:1000}}>
          <div className="card" style={{width:820,maxHeight:"94vh",overflowY:"auto",padding:0}} onClick={e=>e.stopPropagation()}>

            {/* Header */}
            <div style={{background:"var(--bg0)",borderBottom:"1px solid var(--border3)",padding:"16px 24px",display:"flex",justifyContent:"space-between",alignItems:"center"}}>
              <div>
                <div style={{fontSize:16,fontWeight:700,color:"var(--text0)"}}>New Journal Entry</div>
                <div style={{fontSize:13,color:"var(--text4)",marginTop:2}}>Double-entry â€” Debit and Credit lines in one transaction</div>
              </div>
              <button onClick={()=>setShowAdd(false)} style={{background:"none",border:"none",color:"var(--text3)",fontSize:22,cursor:"pointer"}}>أ—</button>
            </div>

            <div style={{padding:24}}>
              {/* â”€â”€ Entry Header Fields â”€â”€ */}
              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr 2fr",gap:10,marginBottom:16}}>
                <div>
                  <div style={{fontSize:12,color:"var(--text4)",fontWeight:600,marginBottom:4}}>Entry No *</div>
                  <input value={vHeader.entry_no} placeholder="e.g. 68"
                    onChange={e=>setVHeader(p=>({...p,entry_no:e.target.value}))}
                    style={INP}/>
                </div>
                <div>
                  <div style={{fontSize:12,color:"var(--text4)",fontWeight:600,marginBottom:4}}>Date *</div>
                  <input type="date" value={vHeader.entry_date}
                    onChange={e=>setVHeader(p=>({...p,entry_date:e.target.value}))}
                    style={INP}/>
                </div>
                <div>
                  <div style={{fontSize:12,color:"var(--text4)",fontWeight:600,marginBottom:4}}>Entry Type *</div>
                  <select value={vHeader.entry_type} onChange={e=>setVHeader(p=>({...p,entry_type:e.target.value}))}
                    style={{...INP,background:"var(--bg1)"}}>
                    {ENTRY_TYPES.map(t=><option key={t}>{t}</option>)}
                  </select>
                </div>
                <div>
                  <div style={{fontSize:12,color:"var(--text4)",fontWeight:600,marginBottom:4}}>Description</div>
                  <input value={vHeader.description} placeholder="e.g. March salaries accrual"
                    onChange={e=>setVHeader(p=>({...p,description:e.target.value}))}
                    style={INP}/>
                </div>
              </div>

              {/* â”€â”€ Lines Table â”€â”€ */}
              <div style={{border:"1px solid var(--border3)",borderRadius:8,overflow:"hidden",marginBottom:12}}>
                {/* Table header */}
                <div style={{display:"grid",gridTemplateColumns:"2fr 1.4fr 80px 130px 130px 32px",gap:0,
                  background:"var(--bg2)",padding:"8px 12px",
                  fontSize:12,fontWeight:700,color:"var(--text3)",textTransform:"uppercase",letterSpacing:".05em"}}>
                  <div>Account</div>
                  <div>Category / Statement</div>
                  <div style={{textAlign:"center"}}>Stmt</div>
                  <div style={{textAlign:"right",color:"#34d399"}}>Debit (EGP)</div>
                  <div style={{textAlign:"right",color:"#f87171"}}>Credit (EGP)</div>
                  <div/>
                </div>

                {/* Lines */}
                {vLines.map((line,i)=>(
                  <div key={i} style={{display:"grid",gridTemplateColumns:"2fr 1.4fr 80px 130px 130px 32px",gap:0,
                    padding:"6px 12px",borderTop:"1px solid var(--border3)",alignItems:"center",
                    background:i%2===0?"transparent":"var(--bg0)"}}>
                    {/* Account */}
                    <div style={{paddingRight:8}}>
                      <select value={line.account_name}
                        onChange={e=>updateLine(i,"account_name",e.target.value)}
                        style={{...INP,background:"var(--bg1)",fontSize:12}}>
                        <option value="">â€” Select account â€”</option>
                        {acctNames.map(a=><option key={a}>{a}</option>)}
                      </select>
                    </div>
                    {/* Main account */}
                    <div style={{paddingRight:8}}>
                      <input value={line.main_account} placeholder="auto-filled"
                        onChange={e=>updateLine(i,"main_account",e.target.value)}
                        style={{...INP,fontSize:12,color:"var(--text3)"}}/>
                    </div>
                    {/* Statement type pill */}
                    <div style={{textAlign:"center"}}>
                      <button onClick={()=>updateLine(i,"statement_type",
                        line.statement_type==="Balance Sheet"?"Profit & Loss Sheet":"Balance Sheet")}
                        title={line.statement_type}
                        style={{background:line.statement_type==="Balance Sheet"?"#38bdf820":"#a78bfa20",
                          color:line.statement_type==="Balance Sheet"?"#38bdf8":"#a78bfa",
                          border:`1px solid ${line.statement_type==="Balance Sheet"?"#38bdf840":"#a78bfa40"}`,
                          borderRadius:4,padding:"3px 6px",fontSize:11,fontWeight:700,cursor:"pointer"}}>
                        {line.statement_type==="Balance Sheet"?"BS":"P&L"}
                      </button>
                    </div>
                    {/* Debit */}
                    <div style={{paddingLeft:8}}>
                      <input type="number" min="0" step="0.01" value={line.debit} placeholder="0.00"
                        onChange={e=>updateLine(i,"debit",e.target.value)}
                        style={{...INP,textAlign:"right",color:"#34d399",fontFamily:"'IBM Plex Mono',monospace",
                          fontSize:13,fontWeight:600,borderColor:+line.debit>0?"#34d39960":"var(--border3)"}}/>
                    </div>
                    {/* Credit */}
                    <div style={{paddingLeft:4}}>
                      <input type="number" min="0" step="0.01" value={line.credit} placeholder="0.00"
                        onChange={e=>updateLine(i,"credit",e.target.value)}
                        style={{...INP,textAlign:"right",color:"#f87171",fontFamily:"'IBM Plex Mono',monospace",
                          fontSize:13,fontWeight:600,borderColor:+line.credit>0?"#f8717160":"var(--border3)"}}/>
                    </div>
                    {/* Remove line */}
                    <div style={{textAlign:"center"}}>
                      {vLines.length>2&&(
                        <button onClick={()=>setVLines(prev=>prev.filter((_,idx)=>idx!==i))}
                          style={{background:"none",border:"none",color:"var(--text4)",cursor:"pointer",fontSize:15,padding:"2px 4px"}}
                          title="Remove line">âœ•</button>
                      )}
                    </div>
                  </div>
                ))}

                {/* Add line button */}
                <div style={{padding:"8px 12px",borderTop:"1px solid var(--border3)",background:"var(--bg2)"}}>
                  <button onClick={()=>setVLines(prev=>[...prev,{...blankLine}])}
                    style={{background:"none",border:"1px dashed var(--border3)",borderRadius:5,padding:"4px 12px",
                      color:"var(--text3)",cursor:"pointer",fontSize:13,fontFamily:"'IBM Plex Sans',sans-serif"}}>
                    + Add Line
                  </button>
                </div>
              </div>

              {/* â”€â”€ Live Balance Footer â”€â”€ */}
              <div style={{display:"flex",gap:10,alignItems:"center",padding:"12px 16px",
                background:vBal?"#05603a20":vDr===0?"var(--bg2)":"#7f1d1d20",
                border:`1px solid ${vBal?"#34d39940":vDr===0?"var(--border3)":"#f8717140"}`,
                borderRadius:8,marginBottom:16}}>
                <div style={{flex:1,display:"flex",gap:24}}>
                  <div>
                    <div style={{fontSize:11,color:"var(--text4)",fontWeight:700,textTransform:"uppercase",letterSpacing:".06em"}}>Total Debit</div>
                    <div style={{fontFamily:"'IBM Plex Mono',monospace",fontSize:17,fontWeight:800,color:"#34d399"}}>{fmtEGP(vDr)}</div>
                  </div>
                  <div>
                    <div style={{fontSize:11,color:"var(--text4)",fontWeight:700,textTransform:"uppercase",letterSpacing:".06em"}}>Total Credit</div>
                    <div style={{fontFamily:"'IBM Plex Mono',monospace",fontSize:17,fontWeight:800,color:"#f87171"}}>{fmtEGP(vCr)}</div>
                  </div>
                  <div>
                    <div style={{fontSize:11,color:"var(--text4)",fontWeight:700,textTransform:"uppercase",letterSpacing:".06em"}}>Difference</div>
                    <div style={{fontFamily:"'IBM Plex Mono',monospace",fontSize:17,fontWeight:800,
                      color:Math.abs(vDr-vCr)<0.01&&vDr>0?"#34d399":"#f87171"}}>
                      {fmtEGP(Math.abs(vDr-vCr))}
                    </div>
                  </div>
                </div>
                <div style={{textAlign:"right"}}>
                  {vBal
                    ?<span style={{color:"#34d399",fontWeight:700,fontSize:15}}>âœ… Balanced â€” ready to post</span>
                    :vDr===0&&vCr===0
                    ?<span style={{color:"var(--text4)",fontSize:13}}>Enter amounts above</span>
                    :<span style={{color:"#f87171",fontWeight:700,fontSize:14}}>â‌Œ Entry must balance (Dr = Cr)</span>}
                </div>
              </div>

              {/* â”€â”€ Action buttons â”€â”€ */}
              <div style={{display:"flex",gap:8,justifyContent:"flex-end"}}>
                <button onClick={()=>setShowAdd(false)}
                  style={{background:"var(--bg2)",border:"1px solid var(--border3)",borderRadius:6,
                    padding:"8px 18px",color:"var(--text2)",cursor:"pointer",fontSize:14}}>Cancel</button>
                <button className="bp"
                  disabled={!vBal||!vHeader.entry_no||!vHeader.entry_date}
                  style={{opacity:(!vBal||!vHeader.entry_no||!vHeader.entry_date)?0.4:1,
                    cursor:(!vBal||!vHeader.entry_no||!vHeader.entry_date)?"not-allowed":"pointer",fontSize:14}}
                  onClick={async()=>{
                    if(!vBal||!vHeader.entry_no||!vHeader.entry_date) return;
                    const month=vHeader.entry_date?new Date(vHeader.entry_date+"T12:00:00").getMonth()+1:null;
                    const linesToPost=vLines.filter(l=>l.account_name&&(+l.debit>0||+l.credit>0)).map(l=>({
                      entry_no:   vHeader.entry_no,
                      entry_date: vHeader.entry_date,
                      month:      month,
                      entry_type: vHeader.entry_type,
                      account_name:   l.account_name,
                      main_account:   l.main_account||"",
                      statement_type: l.statement_type,
                      debit:   +l.debit||0,
                      credit:  +l.credit||0,
                      balance: (+l.debit||0)-(+l.credit||0),
                      description: vHeader.description||"",
                      posted_by: "accountant",
                    }));
                    if(linesToPost.length<2){showToast("Please fill at least 2 account lines with account + debit or credit.",false);return;}
                    await onAdd(linesToPost);
                    setShowAdd(false);
                    setVHeader(blankHeader);
                    setVLines([{...blankLine},{...blankLine}]);
                  }}>
                  Post Entry ({vLines.filter(l=>l.account_name&&(+l.debit>0||+l.credit>0)).length} lines)
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>

    {/* â”€â”€ Edit Journal Line Modal â”€â”€ */}
    {editLine&&(
      <div style={{position:"fixed",inset:0,background:"#00000090",display:"flex",alignItems:"center",justifyContent:"center",zIndex:1100}}
        onClick={()=>setEditLine(null)}>
        <div className="card" style={{width:560,maxHeight:"92vh",overflowY:"auto",padding:24}} onClick={e=>e.stopPropagation()}>
          <h3 style={{fontSize:16,fontWeight:700,color:"var(--text0)",marginBottom:16}}>Edit Journal Line â€” #{editLine.entry_no}</h3>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10,marginBottom:10}}>
            {[{label:"Entry No",key:"entry_no",type:"text"},{label:"Date",key:"entry_date",type:"date"},
              {label:"Month",key:"month",type:"number"},{label:"Entry Type",key:"entry_type",type:"text"}].map(({label,key,type})=>(
              <div key={key}><label style={{fontSize:12,color:"var(--text3)",fontWeight:700,display:"block",marginBottom:3}}>{label}</label>
                <input type={type} value={editLine[key]||""} onChange={e=>setEditLine(p=>({...p,[key]:e.target.value}))}
                  style={{width:"100%",boxSizing:"border-box"}}/></div>
            ))}
          </div>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10,marginBottom:10}}>
            <div><label style={{fontSize:12,color:"var(--text3)",fontWeight:700,display:"block",marginBottom:3}}>Account Name</label>
              <select value={editLine.account_name||""} onChange={e=>{
                const a=acctMap[e.target.value];
                setEditLine(p=>({...p,account_name:e.target.value,
                  main_account:a?.main_account||p.main_account,
                  statement_type:a?.statement_type||p.statement_type}));
              }} style={{width:"100%",boxSizing:"border-box"}}>
                <option value="">â€” Select account â€”</option>
                {acctNames.map(a=><option key={a}>{a}</option>)}
              </select></div>
            <div><label style={{fontSize:12,color:"var(--text3)",fontWeight:700,display:"block",marginBottom:3}}>Main Account</label>
              <input value={editLine.main_account||""} onChange={e=>setEditLine(p=>({...p,main_account:e.target.value}))}
                style={{width:"100%",boxSizing:"border-box"}}/></div>
          </div>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10,marginBottom:10}}>
            <div><label style={{fontSize:12,color:"var(--text3)",fontWeight:700,display:"block",marginBottom:3}}>Statement Type</label>
              <select value={editLine.statement_type||""} onChange={e=>setEditLine(p=>({...p,statement_type:e.target.value}))} style={{width:"100%",boxSizing:"border-box"}}>
                <option value="Profit & Loss Sheet">Profit &amp; Loss Sheet</option>
                <option value="Balance Sheet">Balance Sheet</option>
              </select></div>
            <div/>
          </div>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10,marginBottom:10}}>
            {[{label:"Debit (EGP)",key:"debit"},{label:"Credit (EGP)",key:"credit"}].map(({label,key})=>(
              <div key={key}><label style={{fontSize:12,color:"var(--text3)",fontWeight:700,display:"block",marginBottom:3}}>{label}</label>
                <input type="number" step="0.01" value={editLine[key]||""} onChange={e=>setEditLine(p=>({...p,[key]:e.target.value}))}
                  style={{width:"100%",boxSizing:"border-box"}}/></div>
            ))}
          </div>
          <div style={{marginBottom:16}}><label style={{fontSize:12,color:"var(--text3)",fontWeight:700,display:"block",marginBottom:3}}>Description</label>
            <textarea rows={2} value={editLine.description||""} onChange={e=>setEditLine(p=>({...p,description:e.target.value}))}
              style={{width:"100%",boxSizing:"border-box",resize:"vertical",background:"var(--bg2)",border:"1px solid var(--border3)",borderRadius:5,color:"var(--text0)",padding:"6px 8px",fontFamily:"inherit",fontSize:13}}/>
          </div>
          <div style={{display:"flex",gap:10,justifyContent:"flex-end"}}>
            <button className="bg" onClick={()=>setEditLine(null)}>Cancel</button>
            <button className="bp" onClick={async()=>{if(onEdit)await onEdit({...editLine});setEditLine(null);}}>Save Changes</button>
          </div>
        </div>
      </div>
    )}
  </>);
}


/* â•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گ
   2. BALANCE SHEET
   â•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گ */
function BalanceSheetView({journalEntries, finYear}) {
  const ASSET_G  = ['Fixed Assets','Cash & Cash Equivalents','Cash Custody','Customers','Non-Current assets'];
  const LIAB_G   = ['Accrued Expenses','Creditors and other accounts payable','Tax and Social Insurance Authority','Payable Notes'];
  const EQUITY_G = ['Capital','Share holders'];

  const {bsMap, totalAssets, totalLiab, totalEquity, netProfit, bsCheck} = React.useMemo(()=>{
    // Balance Sheet is cumulative (all periods) for BS accounts, but P&L net is year-scoped
    // P&L entries scoped to finYear; BS accounts cumulative (accounting standard)
    const bsEntries = finYear
      ? journalEntries.filter(e=>e.statement_type!=="Profit & Loss Sheet"||!e.entry_date||(new Date(String(e.entry_date)+"T12:00:00").getFullYear()===finYear))
      : journalEntries;
    const map={};
    bsEntries.forEach(e=>{
      const k=e.main_account;
      if(!map[k]) map[k]={main:k,stmt:e.statement_type,accounts:{}};
      if(!map[k].accounts[e.account_name]) map[k].accounts[e.account_name]={name:e.account_name,dr:0,cr:0};
      map[k].accounts[e.account_name].dr += +e.debit||0;
      map[k].accounts[e.account_name].cr += +e.credit||0;
    });
    const gDrCr = g => Object.values(map[g]?.accounts||{}).reduce((s,a)=>({dr:s.dr+a.dr,cr:s.cr+a.cr}),{dr:0,cr:0});
    // Assets: debit-normal (Custody: credit-normal because cash is held by staff)
    const totAssets = ASSET_G.reduce((s,g)=>{
      if(!map[g]) return s;
      const {dr,cr}=gDrCr(g);
      return s + (g==='Cash Custody' ? Math.max(0,cr-dr) : Math.max(0,dr-cr));
    },0);
    // Liabilities: credit-normal. Tax: split by sub-account sign
    const totLiab = LIAB_G.reduce((s,g)=>{
      if(!map[g]) return s;
      if(g==='Tax and Social Insurance Authority'){
        return s + Object.values(map[g].accounts).reduce((ss,a)=>ss+Math.max(0,a.cr-a.dr),0);
      }
      const {dr,cr}=gDrCr(g);
      return s + Math.max(0,cr-dr);
    },0);
    const totEquity = EQUITY_G.reduce((s,g)=>{
      if(!map[g]) return s;
      const {dr,cr}=gDrCr(g);
      return s + (cr-dr);
    },0);
    const netP = bsEntries.filter(e=>e.statement_type==="Profit & Loss Sheet").reduce((s,e)=>s+(+e.credit||0)-(+e.debit||0),0);
    const check = Math.abs(totAssets-(totLiab+totEquity+netP));
    return {bsMap:map,totalAssets:totAssets,totalLiab:totLiab,totalEquity:totEquity,netProfit:netP,bsCheck:check};
  },[journalEntries,finYear]);

  const Row = ({label,sub,dr,cr,net,isTotal,isNote}) => (
    <tr style={{borderBottom:"1px solid var(--border3)",background:isTotal?"var(--bg2)":"transparent"}}>
      <td style={{padding:"7px 16px",color:isNote?"var(--text3)":isTotal?"var(--text0)":"var(--text2)",fontStyle:isNote?"italic":"normal",fontWeight:isTotal?700:400,paddingLeft:isTotal?16:28}}>{label}</td>
      <td style={{padding:"7px 16px",color:"var(--text4)",fontSize:13}}>{sub||""}</td>
      <td style={{padding:"7px 16px",fontFamily:"'IBM Plex Mono',monospace",fontSize:13,textAlign:"right",color:"#34d399"}}>{dr>0.01?fmtEGP(dr):""}</td>
      <td style={{padding:"7px 16px",fontFamily:"'IBM Plex Mono',monospace",fontSize:13,textAlign:"right",color:"#f87171"}}>{cr>0.01?fmtEGP(cr):""}</td>
      <td style={{padding:"7px 16px",fontFamily:"'IBM Plex Mono',monospace",fontSize:isTotal?14:13,textAlign:"right",color:net>=0?"#34d399":"#f87171",fontWeight:isTotal?700:500}}>{fmtEGP(Math.abs(net))}</td>
    </tr>
  );

  const SectionHead = ({title,total,c}) => (
    <tr style={{background:c+"18"}}>
      <td colSpan={4} style={{padding:"10px 16px",fontWeight:700,color:c,fontSize:13,letterSpacing:".06em"}}>{title}</td>
      <td style={{padding:"10px 16px",fontFamily:"'IBM Plex Mono',monospace",fontWeight:700,color:c,textAlign:"right",fontSize:13}}>{fmtEGP(total)}</td>
    </tr>
  );

  const THead = () => (
    <thead><tr style={{background:"var(--bg2)"}}>
      {["Account","Category","Debit","Credit","Net Balance"].map(h=>(
        <th key={h} style={{padding:"7px 16px",textAlign:["Debit","Credit","Net Balance"].includes(h)?"right":"left",
          color:"var(--text3)",fontWeight:600,fontSize:13,borderBottom:"1px solid var(--border3)"}}>{h}</th>
      ))}
    </tr></thead>
  );

  return(
    <div style={{display:"grid",gap:14}}>
      <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:10}}>
        {[
          {l:"Total Assets",     v:fmtEGP(totalAssets),                      c:"#34d399"},
          {l:"Total Liabilities",v:fmtEGP(totalLiab),                        c:"#f87171"},
          {l:"Total Equity",     v:fmtEGP(totalEquity+netProfit),             c:"#38bdf8"},
          {l:"BS Check",         v:bsCheck<1?"âœ“ Balanced":"âڑ  Check entries", c:bsCheck<1?"#34d399":"#fb923c"},
        ].map((k,i)=>(
          <div key={i} className="card" style={{textAlign:"center",padding:"14px 8px"}}>
            <div style={{fontFamily:"'IBM Plex Mono',monospace",fontSize:15,fontWeight:700,color:k.c}}>{k.v}</div>
            <div style={{fontSize:12,color:"var(--text4)",marginTop:4,textTransform:"uppercase",letterSpacing:".06em"}}>{k.l}</div>
          </div>
        ))}
      </div>

      <div className="card" style={{padding:0,overflow:"hidden"}}>
        <table style={{width:"100%",borderCollapse:"collapse",fontSize:13}}><THead/><tbody>
          <SectionHead title="â–¸ ASSETS" total={totalAssets} c="#34d399"/>
          {ASSET_G.filter(g=>bsMap[g]).map(g=>
            Object.values(bsMap[g].accounts).map(a=>{
              const net = g==='Cash Custody' ? a.cr-a.dr : a.dr-a.cr;
              if(Math.abs(net)<0.01) return null;
              return <Row key={g+a.name} label={a.name} sub={g} dr={a.dr} cr={a.cr} net={Math.abs(net)}/>;
            })
          )}
          <Row label="TOTAL ASSETS" dr={0} cr={0} net={totalAssets} isTotal/>

          <SectionHead title="â–¸ LIABILITIES" total={totalLiab} c="#f87171"/>
          {LIAB_G.filter(g=>bsMap[g]).map(g=>
            Object.values(bsMap[g].accounts).map(a=>{
              if(g==='Tax and Social Insurance Authority'){
                const net=a.cr-a.dr;
                if(Math.abs(net)<0.01) return null;
                return <Row key={a.name} label={a.name} sub={net>0?"ًں”´ payable":"ًںں¢ receivable"} dr={a.dr} cr={a.cr} net={Math.abs(net)}/>;
              }
              const net=a.cr-a.dr;
              if(Math.abs(net)<0.01) return null;
              return <Row key={g+a.name} label={a.name} sub={g} dr={a.dr} cr={a.cr} net={Math.abs(net)}/>;
            })
          )}
          <Row label="TOTAL LIABILITIES" dr={0} cr={0} net={totalLiab} isTotal/>

          <SectionHead title="â–¸ EQUITY" total={totalEquity+netProfit} c="#38bdf8"/>
          {EQUITY_G.filter(g=>bsMap[g]).map(g=>
            Object.values(bsMap[g].accounts).map(a=>{
              const net=a.cr-a.dr; if(Math.abs(net)<0.01) return null;
              return <Row key={g+a.name} label={a.name} sub={g} dr={a.dr} cr={a.cr} net={Math.abs(net)}/>;
            })
          )}
          <Row label="Retained Earnings (Current Year)" sub="Net P&L â€” open period" dr={0} cr={0} net={netProfit} isNote/>
          <Row label="TOTAL EQUITY" dr={0} cr={0} net={totalEquity+netProfit} isTotal/>
        </tbody></table>
      </div>

      {bsCheck>=1 && <div style={{background:"#fb923c15",border:"1px solid #fb923c",borderRadius:8,padding:"10px 16px",fontSize:13,color:"#fb923c"}}>
        âڑ  Balance Sheet off by EGP {bsCheck.toLocaleString("en-EG",{maximumFractionDigits:2})} â€” may indicate missing entries or opening balance adjustments.
      </div>}
    </div>
  );
}

/* â•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گ
   3. EXPENSES â€” mirrors Excel "expenses" pivot
   â•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گ */
function ExpensesView({journalEntries, oldExpenses, egpRate, finYear}) {
  const [viewMode, setViewMode] = React.useState("pivot");

  // P&L data from journal â€” fixed pivot bug (no m[m.length])
  const {plEntries, revEntries, pivot, activeMonths, totalExpenses, totalRevenue, netPL} = React.useMemo(()=>{
    const yearEntries = finYear ? journalEntries.filter(e=>{
      if(!e.entry_date) return true;
      return new Date(String(e.entry_date)+"T12:00:00").getFullYear()===finYear;
    }) : journalEntries;
    const plE = yearEntries.filter(e=>e.statement_type==="Profit & Loss Sheet" && +e.debit>0);
    const revE = yearEntries.filter(e=>e.statement_type==="Profit & Loss Sheet" && +e.credit>0);
    const months = [...new Set(plE.map(e=>e.month))].sort((a,b)=>+a-+b);
    const piv={};
    plE.forEach(e=>{
      if(!piv[e.main_account]) piv[e.main_account]={cat:e.main_account,accounts:{},catTotal:0};
      if(!piv[e.main_account].accounts[e.account_name])
        piv[e.main_account].accounts[e.account_name]={name:e.account_name,months:{},total:0};
      piv[e.main_account].accounts[e.account_name].months[e.month] =
        (piv[e.main_account].accounts[e.account_name].months[e.month]||0)+(+e.debit);
      piv[e.main_account].accounts[e.account_name].total += +e.debit;
      piv[e.main_account].catTotal += +e.debit;
    });
    const totExp = plE.reduce((s,e)=>s+(+e.debit),0);
    const totRev = revE.reduce((s,e)=>s+(+e.credit),0);
    return {plEntries:plE,revEntries:revE,pivot:piv,activeMonths:months,
            totalExpenses:totExp,totalRevenue:totRev,netPL:totRev-totExp};
  },[journalEntries,finYear]);

  const monthTotal = mo => plEntries.filter(e=>e.month===mo).reduce((s,e)=>s+(+e.debit),0);
  const monthRev   = mo => revEntries.filter(e=>e.month===mo).reduce((s,e)=>s+(+e.credit),0);

  // Old system expenses (from expenses table) â€” shown as supplementary data
  const oldData = React.useMemo(()=>{
    if(!oldExpenses||!oldExpenses.length) return null;
    const totUSD = oldExpenses.reduce((s,e)=>s+(+e.amount_usd||0),0);
    const totEGP = oldExpenses.reduce((s,e)=>s+(+e.amount_egp||0),0);
    const withRate = oldExpenses.filter(e=>e.entry_rate>0);
    return {count:oldExpenses.length,totUSD,totEGP,withRate:withRate.length};
  },[oldExpenses]);

  return(
    <div style={{display:"grid",gap:14}}>
      {/* KPI */}
      <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:10}}>
        {[
          {l:"Total Revenue (EGP)",  v:fmtEGP(totalRevenue),  c:"#34d399"},
          {l:"Total Expenses (EGP)", v:fmtEGP(totalExpenses), c:"#f87171"},
          {l:"Net P&L (EGP)",        v:fmtEGP(netPL),         c:netPL>=0?"#34d399":"#f87171"},
        ].map((k,i)=>(
          <div key={i} className="card" style={{textAlign:"center",padding:"14px 8px"}}>
            <div style={{fontFamily:"'IBM Plex Mono',monospace",fontSize:17,fontWeight:700,color:k.c}}>{k.v}</div>
            <div style={{fontSize:12,color:"var(--text4)",textTransform:"uppercase",letterSpacing:".06em",marginTop:4}}>{k.l}</div>
          </div>
        ))}
      </div>

      {oldData && (
        <div style={{background:"#38bdf810",border:"1px solid #38bdf840",borderRadius:8,padding:"10px 16px",fontSize:13,color:"#38bdf8"}}>
          ًں“‚ Legacy expense records: {oldData.count} entries آ· USD {oldData.totUSD.toLocaleString("en-US",{minimumFractionDigits:2})} آ· EGP {oldData.totEGP.toLocaleString()} آ· {oldData.withRate} entries have exchange rate. These pre-date the journal system. Post to journal to include in reports.
        </div>
      )}

      {/* Pivot table */}
      <div className="card" style={{padding:0,overflow:"hidden"}}>
        <div style={{background:"var(--bg0)",borderBottom:"1px solid var(--border)",padding:"14px 20px",display:"flex",justifyContent:"space-between",alignItems:"center"}}>
          <div style={{fontSize:15,fontWeight:700,color:"var(--text0)"}}>Expenses Breakdown</div>
          <div style={{display:"flex",gap:4}}>
            {[{id:"pivot",l:"Pivot"},{id:"monthly",l:"Monthly"}].map(b=>(
              <button key={b.id} onClick={()=>setViewMode(b.id)}
                style={{background:viewMode===b.id?"linear-gradient(135deg,#0ea5e9,#0369a1)":"transparent",border:`1px solid ${viewMode===b.id?"transparent":"var(--border)"}`,
                  borderRadius:6,padding:"4px 12px",color:viewMode===b.id?"#fff":"var(--text2)",cursor:"pointer",fontSize:14,fontWeight:viewMode===b.id?600:400,fontFamily:"'IBM Plex Sans',sans-serif"}}>
                {b.l}
              </button>
            ))}
          </div>
        </div>

        {viewMode==="pivot" ? (
          <div style={{overflowX:"auto"}}>
            <table style={{width:"100%",borderCollapse:"collapse",fontSize:13}}>
              <thead>
                <tr style={{background:"var(--bg2)"}}>
                  <th style={{padding:"7px 14px",textAlign:"left",color:"var(--text3)",fontSize:13,minWidth:150}}>Category</th>
                  <th style={{padding:"7px 14px",textAlign:"left",color:"var(--text3)",fontSize:13,minWidth:200}}>Account</th>
                  {activeMonths.map(m=>(
                    <th key={m} style={{padding:"7px 10px",textAlign:"right",color:"var(--text3)",fontSize:13,whiteSpace:"nowrap"}}>{MO_SHORT[+m]}</th>
                  ))}
                  <th style={{padding:"7px 14px",textAlign:"right",color:"var(--text3)",fontSize:13}}>Total</th>
                </tr>
              </thead>
              <tbody>
                {Object.values(pivot).sort((a,b)=>b.catTotal-a.catTotal).map(cat=>{
                  const accts = Object.values(cat.accounts).sort((a,b)=>b.total-a.total);
                  return accts.map((acc,i)=>(
                    <tr key={cat.cat+acc.name} style={{borderBottom:"1px solid var(--border3)"}}>
                      <td style={{padding:"6px 14px",color:"var(--text4)",fontSize:13,fontStyle:"italic"}}>{i===0?cat.cat:""}</td>
                      <td style={{padding:"6px 14px",color:"var(--text1)",fontWeight:500}}>{acc.name}</td>
                      {activeMonths.map(m=>(
                        <td key={m} style={{padding:"6px 10px",fontFamily:"'IBM Plex Mono',monospace",fontSize:13,textAlign:"right",color:"var(--text2)"}}>
                          {acc.months[m]?Math.round(acc.months[m]).toLocaleString("en-EG"):"-"}
                        </td>
                      ))}
                      <td style={{padding:"6px 14px",fontFamily:"'IBM Plex Mono',monospace",fontSize:13,textAlign:"right",color:"#fb923c",fontWeight:600}}>{fmtEGP(acc.total)}</td>
                    </tr>
                  ));
                })}
                <tr style={{borderTop:"2px solid #34d39940",background:"#34d39908"}}>
                  <td style={{padding:"7px 14px",color:"#34d399",fontWeight:700}}>Revenue</td>
                  <td style={{padding:"7px 14px",color:"var(--text2)"}}>Enevo Group S.R.L.</td>
                  {activeMonths.map(m=>(
                    <td key={m} style={{padding:"7px 10px",fontFamily:"'IBM Plex Mono',monospace",fontSize:13,textAlign:"right",color:"#34d399"}}>
                      {monthRev(m)?Math.round(monthRev(m)).toLocaleString("en-EG"):"-"}
                    </td>
                  ))}
                  <td style={{padding:"7px 14px",fontFamily:"'IBM Plex Mono',monospace",fontSize:13,textAlign:"right",color:"#34d399",fontWeight:700}}>{fmtEGP(totalRevenue)}</td>
                </tr>
                <tr style={{background:"var(--bg2)",borderTop:"2px solid var(--border)"}}>
                  <td colSpan={2} style={{padding:"9px 14px",fontWeight:700,color:"var(--text0)"}}>TOTAL EXPENSES</td>
                  {activeMonths.map(m=>(
                    <td key={m} style={{padding:"9px 10px",fontFamily:"'IBM Plex Mono',monospace",fontSize:13,textAlign:"right",fontWeight:700,color:"#f87171"}}>
                      {Math.round(monthTotal(m)).toLocaleString("en-EG")}
                    </td>
                  ))}
                  <td style={{padding:"9px 14px",fontFamily:"'IBM Plex Mono',monospace",fontSize:13,textAlign:"right",fontWeight:700,color:"#f87171"}}>{fmtEGP(totalExpenses)}</td>
                </tr>
                <tr style={{background:netPL>=0?"#34d39910":"#f8711810"}}>
                  <td colSpan={2} style={{padding:"9px 14px",fontWeight:700,color:netPL>=0?"#34d399":"#f87171"}}>NET P&L</td>
                  {activeMonths.map(m=>(
                    <td key={m} style={{padding:"9px 10px",fontFamily:"'IBM Plex Mono',monospace",fontSize:13,textAlign:"right",fontWeight:700,color:monthRev(m)-monthTotal(m)>=0?"#34d399":"#f87171"}}>
                      {Math.round(monthRev(m)-monthTotal(m)).toLocaleString("en-EG")}
                    </td>
                  ))}
                  <td style={{padding:"9px 14px",fontFamily:"'IBM Plex Mono',monospace",fontSize:13,textAlign:"right",fontWeight:700,color:netPL>=0?"#34d399":"#f87171"}}>{fmtEGP(netPL)}</td>
                </tr>
              </tbody>
            </table>
          </div>
        ) : (
          <div style={{padding:16,display:"grid",gap:16}}>
            {activeMonths.map(m=>{
              const mExp=monthTotal(m); const mRev=monthRev(m); const mNet=mRev-mExp;
              const max=Math.max(mExp,mRev,1);
              const mEntries=plEntries.filter(e=>e.month===m);
              return(
                <div key={m} style={{borderBottom:"1px solid var(--border3)",paddingBottom:16}}>
                  <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:10}}>
                    <span style={{fontWeight:700,color:"var(--text0)",fontSize:15}}>{MO_SHORT[+m]}</span>
                    <span style={{fontFamily:"'IBM Plex Mono',monospace",fontSize:13,color:mNet>=0?"#34d399":"#f87171",fontWeight:600}}>Net: {fmtEGP(mNet)}</span>
                  </div>
                  {[{l:"Revenue",v:mRev,c:"#34d399"},{l:"Expenses",v:mExp,c:"#f87171"}].map(bar=>(
                    <div key={bar.l} style={{display:"grid",gridTemplateColumns:"80px 1fr 140px",gap:8,alignItems:"center",marginBottom:6}}>
                      <span style={{fontSize:13,color:"var(--text3)"}}>{bar.l}</span>
                      <div style={{height:10,background:"var(--bg2)",borderRadius:4,overflow:"hidden"}}>
                        <div style={{height:"100%",width:`${Math.round(bar.v/max*100)}%`,background:bar.c,borderRadius:4}}/>
                      </div>
                      <span style={{fontFamily:"'IBM Plex Mono',monospace",fontSize:13,color:bar.c,textAlign:"right"}}>{fmtEGP(bar.v)}</span>
                    </div>
                  ))}
                  <div style={{display:"flex",flexWrap:"wrap",gap:4,marginTop:8}}>
                    {mEntries.sort((a,b)=>+b.debit-+a.debit).slice(0,8).map((e,i)=>(
                      <span key={i} style={{fontSize:12,background:"var(--bg2)",border:"1px solid var(--border3)",borderRadius:4,padding:"2px 7px",color:"var(--text3)"}}>
                        {e.account_name}: {Math.round(+e.debit).toLocaleString("en-EG")}
                      </span>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

/* â•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گ
   4. CASH CUSTODY
   â•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گ */
function CashCustodyView({journalEntries}) {
  const [selected, setSelected] = React.useState("ALL");

  const {persons, totalHeld} = React.useMemo(()=>{
    const m={};
    journalEntries.filter(e=>e.main_account==="Cash Custody").forEach(e=>{
      const name=e.account_name.trim();
      if(!m[name]) m[name]={name,totalOut:0,totalBack:0,transactions:[]};
      m[name].totalOut  += +e.credit||0;
      m[name].totalBack += +e.debit||0;
      m[name].transactions.push(e);
    });
    Object.values(m).forEach(p=>p.held=p.totalOut-p.totalBack);
    return {persons:m, totalHeld:Object.values(m).reduce((s,p)=>s+p.held,0)};
  },[journalEntries]);

  const allCustody = journalEntries.filter(e=>e.main_account==="Cash Custody");
  const selectedTx = (selected==="ALL" ? allCustody : (persons[selected]?.transactions||[]))
    .sort((a,b)=>String(a.entry_date).localeCompare(String(b.entry_date)));

  // Dynamic color from name hash â€” no hardcoded names
  const pColor = n => {
    const PALETTE=["#38bdf8","#a78bfa","#fb923c","#34d399","#facc15","#f87171","#e879f9","#4ade80"];
    let h=0; for(let i=0;i<(n||"").length;i++) h=(h*31+n.charCodeAt(i))&0xffff;
    return PALETTE[h%PALETTE.length];
  };

  return(
    <div style={{display:"grid",gap:14}}>
      <div style={{display:"grid",gridTemplateColumns:"repeat(5,1fr)",gap:8}}>
        {Object.values(persons).sort((a,b)=>b.held-a.held).map(p=>(
          <div key={p.name} className="card" style={{textAlign:"center",padding:"12px 8px",cursor:"pointer",
            border:`2px solid ${selected===p.name?pColor(p.name):"var(--border3)"}`}}
            onClick={()=>setSelected(selected===p.name?"ALL":p.name)}>
            <div style={{fontSize:12,color:pColor(p.name),fontWeight:700,marginBottom:4}}>{p.name}</div>
            <div style={{fontFamily:"'IBM Plex Mono',monospace",fontSize:14,fontWeight:700,color:p.held>0?"#34d399":"var(--text4)"}}>{fmtEGP(p.held)}</div>
            <div style={{fontSize:11,color:"var(--text4)",marginTop:2}}>currently holds آ· {p.transactions.length} tx</div>
          </div>
        ))}
      </div>
      <div style={{background:"var(--bg2)",border:"1px solid #34d39440",borderRadius:8,padding:"10px 16px",display:"flex",justifyContent:"space-between"}}>
        <span style={{fontSize:13,color:"var(--text2)"}}>Total company cash held by all custodians</span>
        <span style={{fontFamily:"'IBM Plex Mono',monospace",fontSize:16,fontWeight:700,color:"#34d399"}}>{fmtEGP(totalHeld)}</span>
      </div>
      <div className="card" style={{padding:0,overflow:"hidden"}}>
        <div style={{background:"#fb923c15",borderBottom:"2px solid #fb923c",padding:"10px 16px",display:"flex",justifyContent:"space-between",alignItems:"center"}}>
          <span style={{fontSize:13,fontWeight:700,color:"#fb923c"}}>TRANSACTIONS{selected!=="ALL"?` â€” ${selected}`:""}</span>
          {selected!=="ALL"&&<button onClick={()=>setSelected("ALL")} style={{background:"transparent",border:"1px solid var(--border3)",borderRadius:4,padding:"2px 8px",color:"var(--text3)",cursor:"pointer",fontSize:13}}>Show All</button>}
        </div>
        <div style={{overflowX:"auto"}}>
          <table style={{width:"100%",borderCollapse:"collapse",fontSize:13}}>
            <thead><tr style={{background:"var(--bg2)"}}>
              {["Date","Entry#","Person","Type","Cash Out","Cash Back/Spent","Net","Description"].map(h=>(
                <th key={h} style={{padding:"7px 12px",textAlign:["Cash Out","Cash Back/Spent","Net"].includes(h)?"right":"left",
                  color:"var(--text3)",fontWeight:600,fontSize:13,borderBottom:"1px solid var(--border3)",whiteSpace:"nowrap"}}>{h}</th>
              ))}
            </tr></thead>
            <tbody>
              {selectedTx.map((e,i)=>{
                const net=(+e.debit||0)-(+e.credit||0);
                return(
                  <tr key={i} style={{borderBottom:"1px solid var(--border3)",background:i%2===0?"transparent":"var(--bg1)"}}>
                    <td style={{padding:"6px 12px",fontFamily:"'IBM Plex Mono',monospace",fontSize:13,color:"var(--text3)"}}>{String(e.entry_date).slice(0,10)}</td>
                    <td style={{padding:"6px 12px",fontFamily:"'IBM Plex Mono',monospace",fontSize:13,color:"var(--text4)"}}>{e.entry_no}</td>
                    <td style={{padding:"6px 12px"}}><span style={{color:pColor(e.account_name.trim()),fontWeight:600,fontSize:13}}>{e.account_name.trim()}</span></td>
                    <td style={{padding:"6px 12px"}}><span style={{background:"#fb923c20",color:"#fb923c",padding:"1px 6px",borderRadius:4,fontSize:12}}>{e.entry_type}</span></td>
                    <td style={{padding:"6px 12px",fontFamily:"'IBM Plex Mono',monospace",fontSize:13,textAlign:"right",color:"#f87171"}}>{+e.credit>0.01?fmtEGP(+e.credit):""}</td>
                    <td style={{padding:"6px 12px",fontFamily:"'IBM Plex Mono',monospace",fontSize:13,textAlign:"right",color:"#34d399"}}>{+e.debit>0.01?fmtEGP(+e.debit):""}</td>
                    <td style={{padding:"6px 12px",fontFamily:"'IBM Plex Mono',monospace",fontSize:13,textAlign:"right",color:net>0?"#34d399":"#f87171",fontWeight:600}}>{fmtEGP(Math.abs(net))}</td>
                    <td style={{padding:"6px 12px",color:"var(--text3)",fontSize:13,maxWidth:220,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}} title={e.description}>{e.description}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

/* â•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گ
   5. TAX & SOCIAL INSURANCE
   â•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گ */
function TaxSocialView({journalEntries}) {
  const taxEntries = journalEntries.filter(e=>e.main_account==="Tax and Social Insurance Authority");
  const {byAccount, activeMonths} = React.useMemo(()=>{
    const m={};
    taxEntries.forEach(e=>{
      const name=e.account_name;
      if(!m[name]) m[name]={name,entries:[],totalDr:0,totalCr:0,byMonth:{}};
      m[name].entries.push(e);
      m[name].totalDr += +e.debit||0;
      m[name].totalCr += +e.credit||0;
      const mo=e.month;
      if(!m[name].byMonth[mo]) m[name].byMonth[mo]={dr:0,cr:0};
      m[name].byMonth[mo].dr += +e.debit||0;
      m[name].byMonth[mo].cr += +e.credit||0;
    });
    Object.values(m).forEach(a=>{a.net=a.totalCr-a.totalDr; a.isLiab=a.net>0;});
    return {byAccount:m, activeMonths:[...new Set(taxEntries.map(e=>e.month))].sort((a,b)=>+a-+b)};
  },[taxEntries]);

  const totalLiab = Object.values(byAccount).filter(a=>a.isLiab).reduce((s,a)=>s+a.net,0);
  const totalAsset= Object.values(byAccount).filter(a=>!a.isLiab).reduce((s,a)=>s+Math.abs(a.net),0);
  const aColor = n=>({
    "Payroll Tax":"#f87171","Social Insurance Authority":"#fb923c",
    "Martyrs Families Fund":"#a78bfa","VAT":"#34d399"}[n]||"var(--text3)");

  return(
    <div style={{display:"grid",gap:14}}>
      <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:10}}>
        {[
          {l:"Tax Liabilities",    v:fmtEGP(totalLiab),                 c:"#f87171"},
          {l:"VAT Receivable",     v:fmtEGP(totalAsset),                c:"#34d399"},
          {l:"Net Payable to Gov", v:fmtEGP(Math.abs(totalLiab-totalAsset)), c:"#fb923c"},
        ].map((k,i)=>(
          <div key={i} className="card" style={{textAlign:"center",padding:"14px 8px"}}>
            <div style={{fontFamily:"'IBM Plex Mono',monospace",fontSize:16,fontWeight:700,color:k.c}}>{k.v}</div>
            <div style={{fontSize:12,color:"var(--text4)",textTransform:"uppercase",letterSpacing:".06em",marginTop:4}}>{k.l}</div>
          </div>
        ))}
      </div>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12}}>
        {Object.values(byAccount).map(a=>(
          <div key={a.name} className="card" style={{padding:0,overflow:"hidden"}}>
            <div style={{background:aColor(a.name)+"18",borderBottom:`2px solid ${aColor(a.name)}`,padding:"10px 14px",display:"flex",justifyContent:"space-between",alignItems:"center"}}>
              <span style={{fontSize:13,fontWeight:700,color:aColor(a.name)}}>{a.name}</span>
              <span style={{fontSize:13,fontWeight:600,color:a.isLiab?"#f87171":"#34d399"}}>
                {a.isLiab?"ًں”´":""}{!a.isLiab?"ًںں¢":""} {fmtEGP(Math.abs(a.net))}
              </span>
            </div>
            <table style={{width:"100%",borderCollapse:"collapse",fontSize:13}}>
              <thead><tr style={{background:"var(--bg2)"}}>
                {["Month","Debit","Credit","Net"].map(h=>(
                  <th key={h} style={{padding:"6px 12px",textAlign:h==="Month"?"left":"right",color:"var(--text3)",fontSize:13}}>{h}</th>
                ))}
              </tr></thead>
              <tbody>
                {activeMonths.filter(m=>a.byMonth[m]).map((m,i)=>{
                  const mo=a.byMonth[m]; const net=mo.cr-mo.dr;
                  return(<tr key={m} style={{borderBottom:"1px solid var(--border3)",background:i%2===0?"transparent":"var(--bg1)"}}>
                    <td style={{padding:"6px 12px",color:"var(--text2)",fontWeight:500}}>{MO_SHORT[+m]}</td>
                    <td style={{padding:"6px 12px",fontFamily:"'IBM Plex Mono',monospace",fontSize:13,textAlign:"right",color:"#34d399"}}>{mo.dr>0.01?fmtEGP(mo.dr):""}</td>
                    <td style={{padding:"6px 12px",fontFamily:"'IBM Plex Mono',monospace",fontSize:13,textAlign:"right",color:"#f87171"}}>{mo.cr>0.01?fmtEGP(mo.cr):""}</td>
                    <td style={{padding:"6px 12px",fontFamily:"'IBM Plex Mono',monospace",fontSize:13,textAlign:"right",color:net>0?"#f87171":"#34d399",fontWeight:600}}>{fmtEGP(Math.abs(net))}</td>
                  </tr>);
                })}
                <tr style={{background:"var(--bg2)",borderTop:"2px solid var(--border)"}}>
                  <td style={{padding:"7px 12px",fontWeight:700,color:"var(--text0)"}}>TOTAL</td>
                  <td style={{padding:"7px 12px",fontFamily:"'IBM Plex Mono',monospace",fontSize:13,textAlign:"right",color:"#34d399",fontWeight:700}}>{a.totalDr>0.01?fmtEGP(a.totalDr):""}</td>
                  <td style={{padding:"7px 12px",fontFamily:"'IBM Plex Mono',monospace",fontSize:13,textAlign:"right",color:"#f87171",fontWeight:700}}>{a.totalCr>0.01?fmtEGP(a.totalCr):""}</td>
                  <td style={{padding:"7px 12px",fontFamily:"'IBM Plex Mono',monospace",fontSize:13,textAlign:"right",color:a.isLiab?"#f87171":"#34d399",fontWeight:700}}>{fmtEGP(Math.abs(a.net))}</td>
                </tr>
              </tbody>
            </table>
          </div>
        ))}
      </div>
    </div>
  );
}

/* â•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گ
   6. FIXED ASSETS
   â•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گ */
function FixedAssetsView({fixedAssets, loading}) {
  const TODAY = new Date();
  const [assetSearch, setAssetSearch] = React.useState("");

  const assetsWithDepr = React.useMemo(()=>fixedAssets.map(a=>{
    if(!a.purchase_date) return {...a,annual:0,acc:0,net:+a.cost_egp||0,pct:0};
    const purchased=new Date(a.purchase_date+"T12:00:00");
    const yrs=Math.max(0,(TODAY-purchased)/(365.25*24*3600*1000));
    const annual=+a.useful_life_years>0?(+a.cost_egp/+a.useful_life_years):0;
    const acc=Math.min(+a.cost_egp,annual*yrs);
    const net=Math.max(0,+a.cost_egp-acc);
    return {...a,annual,acc,net,pct:+a.cost_egp>0?(acc/+a.cost_egp*100):0};
  }),[fixedAssets]);

  const filteredAssets = React.useMemo(()=>{
    if(!assetSearch) return assetsWithDepr;
    const q=assetSearch.toLowerCase();
    return assetsWithDepr.filter(a=>
      (a.asset_name||"").toLowerCase().includes(q)||
      (a.category||"").toLowerCase().includes(q)||
      (a.purchase_date||"").includes(q)
    );
  },[assetsWithDepr,assetSearch]);

  const byCategory=React.useMemo(()=>{
    const m={};
    filteredAssets.forEach(a=>{
      if(!m[a.category]) m[a.category]={cat:a.category,assets:[],cost:0,depr:0,net:0};
      m[a.category].assets.push(a);
      m[a.category].cost+=+a.cost_egp;
      m[a.category].depr+=a.acc;
      m[a.category].net+=a.net;
    });
    return m;
  },[filteredAssets]);

  const totCost=filteredAssets.reduce((s,a)=>s+(+a.cost_egp),0);
  const totDepr=filteredAssets.reduce((s,a)=>s+a.acc,0);
  const totNet=filteredAssets.reduce((s,a)=>s+a.net,0);
  const cColor=c=>({
    "Computers & Programs":"#38bdf8","Furniture":"#a78bfa",
    "Aircondition":"#34d399","Decoration & Furnishing":"#fb923c","Electrical Equipment":"#facc15"
  }[c]||"var(--text3)");

  if(loading) return <div style={{textAlign:"center",padding:40,color:"var(--text4)"}}>Loading assetsâ€¦</div>;
  return(
    <div style={{display:"grid",gap:14}}>
      <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",gap:10,flexWrap:"wrap"}}>
        <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:10,flex:1}}>
          {[{l:"Total at Cost",v:fmtEGP(totCost),c:"#38bdf8"},{l:"Accumulated Depr.",v:fmtEGP(totDepr),c:"#fb923c"},{l:"Net Book Value",v:fmtEGP(totNet),c:"#34d399"}].map((k,i)=>(
            <div key={i} className="card" style={{textAlign:"center",padding:"14px 8px"}}>
              <div style={{fontFamily:"'IBM Plex Mono',monospace",fontSize:16,fontWeight:700,color:k.c}}>{k.v}</div>
              <div style={{fontSize:12,color:"var(--text4)",textTransform:"uppercase",letterSpacing:".06em",marginTop:4}}>{k.l}</div>
            </div>
          ))}
        </div>
        <input value={assetSearch} onChange={e=>setAssetSearch(e.target.value)}
          placeholder="ًں”چ Search assetsâ€¦"
          style={{background:"var(--bg1)",border:"1px solid var(--border3)",borderRadius:6,padding:"7px 12px",color:"var(--text0)",fontSize:13,width:200,flexShrink:0}}/>
      </div>
      {filteredAssets.length===0&&assetSearch&&(
        <div style={{textAlign:"center",padding:24,color:"var(--text4)",fontSize:13}}>No assets match "{assetSearch}"</div>
      )}
      {Object.values(byCategory).sort((a,b)=>b.cost-a.cost).map(cat=>(
        <div key={cat.cat} className="card" style={{padding:0,overflow:"hidden"}}>
          <div style={{background:cColor(cat.cat)+"15",borderBottom:`2px solid ${cColor(cat.cat)}`,padding:"10px 16px",display:"flex",justifyContent:"space-between"}}>
            <span style={{fontSize:13,fontWeight:700,color:cColor(cat.cat)}}>{cat.cat}</span>
            <span style={{fontFamily:"'IBM Plex Mono',monospace",fontSize:13,color:"var(--text3)"}}>
              {cat.assets.length} items آ· Cost {fmtEGP(cat.cost)} آ· Net {fmtEGP(cat.net)}
            </span>
          </div>
          <div style={{overflowX:"auto"}}>
            <table style={{width:"100%",borderCollapse:"collapse",fontSize:13}}>
              <thead><tr style={{background:"var(--bg2)"}}>
                {["Asset","Purchased","Cost","Life","Annual Depr.","Acc. Depr.","Net Book","Worn %"].map(h=>(
                  <th key={h} style={{padding:"7px 12px",textAlign:h==="Asset"||h==="Purchased"?"left":"right",color:"var(--text3)",fontSize:13,whiteSpace:"nowrap"}}>{h}</th>
                ))}
              </tr></thead>
              <tbody>
                {cat.assets.map((a,i)=>(
                  <tr key={i} style={{borderBottom:"1px solid var(--border3)",background:i%2===0?"transparent":"var(--bg1)"}}>
                    <td style={{padding:"7px 12px",color:"var(--text1)"}}>{a.asset_name}</td>
                    <td style={{padding:"7px 12px",fontFamily:"'IBM Plex Mono',monospace",fontSize:13,color:"var(--text3)"}}>{a.purchase_date}</td>
                    <td style={{padding:"7px 12px",fontFamily:"'IBM Plex Mono',monospace",fontSize:13,textAlign:"right",color:"#38bdf8"}}>{fmtEGP(+a.cost_egp)}</td>
                    <td style={{padding:"7px 12px",fontFamily:"'IBM Plex Mono',monospace",fontSize:13,textAlign:"right",color:"var(--text3)"}}>{a.useful_life_years}y</td>
                    <td style={{padding:"7px 12px",fontFamily:"'IBM Plex Mono',monospace",fontSize:13,textAlign:"right",color:"var(--text2)"}}>{fmtEGP(a.annual)}/yr</td>
                    <td style={{padding:"7px 12px",fontFamily:"'IBM Plex Mono',monospace",fontSize:13,textAlign:"right",color:"#fb923c"}}>{fmtEGP(a.acc)}</td>
                    <td style={{padding:"7px 12px",fontFamily:"'IBM Plex Mono',monospace",fontSize:13,textAlign:"right",color:"#34d399",fontWeight:600}}>{fmtEGP(a.net)}</td>
                    <td style={{padding:"7px 12px",textAlign:"right"}}>
                      <div style={{display:"flex",alignItems:"center",justifyContent:"flex-end",gap:6}}>
                        <div style={{width:50,height:6,background:"var(--bg2)",borderRadius:3,overflow:"hidden"}}>
                          <div style={{height:"100%",width:`${Math.min(100,a.pct).toFixed(0)}%`,background:cColor(cat.cat),borderRadius:3}}/>
                        </div>
                        <span style={{fontFamily:"'IBM Plex Mono',monospace",fontSize:12,color:"var(--text3)",minWidth:35}}>{a.pct.toFixed(1)}%</span>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ))}
    </div>
  );
}

/* â•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گ
   7. FINANCE REPORTS â€” Monthly PDF-ready summary
   â•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گ */
function FinanceReports({journalEntries, fixedAssets, staff, expenses, egpRate}) {
  const [reportType, setReportType] = React.useState("pl");
  const [repMonth,   setRepMonth]   = React.useState(new Date().getMonth()||1);
  const [repYear,    setRepYear]    = React.useState(2026);

  const MONTHS_ = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];

  // â”€â”€ P&L STATEMENT (journal-based, EGP)
  const plReport = React.useMemo(()=>{
    const rev = journalEntries
      .filter(e=>e.statement_type==="Profit & Loss Sheet" && +e.credit>0)
      .reduce((s,e)=>s+(+e.credit||0),0);
    const byAcct={};
    journalEntries.filter(e=>e.statement_type==="Profit & Loss Sheet" && +e.debit>0).forEach(e=>{
      if(!byAcct[e.account_name]) byAcct[e.account_name]={name:e.account_name,cat:e.main_account,total:0};
      byAcct[e.account_name].total += +e.debit;
    });
    const expenses = Object.values(byAcct).sort((a,b)=>b.total-a.total);
    const totExp = expenses.reduce((s,e)=>s+e.total,0);
    return {rev,expenses,totExp,net:rev-totExp};
  },[journalEntries]);

  // â”€â”€ PAYROLL SUMMARY (from staff table + journal accruals by month)
  const payrollReport = React.useMemo(()=>{
    const MO_IDX = repMonth; // 1-based
    const activeThisMonth = staff.filter(s=>{
      if(!s.join_date) return true;
      const joined = new Date(s.join_date+"T12:00:00");
      const mEnd = new Date(repYear, MO_IDX, 0);
      if(joined > mEnd) return false;
      if(s.termination_date){
        const term = new Date(s.termination_date+"T12:00:00");
        const mStart = new Date(repYear, MO_IDX-1, 1);
        if(term < mStart) return false;
      }
      return true;
    });
    // Journal accruals for this month
    const accrualLines = journalEntries.filter(e=>e.entry_type==="Accrued Salaries" && +e.month===MO_IDX);
    const grossCost = accrualLines.filter(e=>e.main_account==="Operating Costs" && +e.debit>0).reduce((s,e)=>s+(+e.debit),0);
    const grossAdmin = accrualLines.filter(e=>e.main_account==="Administrative expenses" && +e.debit>0).reduce((s,e)=>s+(+e.debit),0);
    const taxLine = accrualLines.filter(e=>e.account_name==="Payroll Tax" && +e.credit>0).reduce((s,e)=>s+(+e.credit),0);
    const siLine  = accrualLines.filter(e=>e.account_name==="Social Insurance Authority" && +e.credit>0).reduce((s,e)=>s+(+e.credit),0);
    const mfLine  = accrualLines.filter(e=>e.account_name==="Martyrs Families Fund" && +e.credit>0).reduce((s,e)=>s+(+e.credit),0);
    const netSalary = accrualLines.filter(e=>e.account_name==="Accrued Salaries" && +e.credit>0).reduce((s,e)=>s+(+e.credit),0);
    const deptMap={};
    activeThisMonth.forEach(s=>{
      const d=s.department||"Other";
      if(!deptMap[d]) deptMap[d]={dept:d,count:0,usd:0,egp:0};
      deptMap[d].count++;
      deptMap[d].usd += +s.salary_usd||0;
      deptMap[d].egp += +s.salary_egp||0;
    });
    return {activeThisMonth,grossCost,grossAdmin,taxLine,siLine,mfLine,netSalary,deptMap:Object.values(deptMap)};
  },[journalEntries,staff,repMonth,repYear]);

  // â”€â”€ CASH FLOW (simplified â€” operating + investing)
  const cashFlow = React.useMemo(()=>{
    const revenue = journalEntries.filter(e=>e.main_account==="Revenue").reduce((s,e)=>s+(+e.credit),0);
    // Cash paid for expenses (from custody/creditor payments)
    const cashPaid = journalEntries.filter(e=>e.main_account!=="Cash Custody" && e.main_account!=="Customers"
      && e.statement_type==="Profit & Loss Sheet" && +e.debit>0).reduce((s,e)=>s+(+e.debit),0);
    const fixedAssetCost = fixedAssets.reduce((s,a)=>s+(+a.cost_egp),0);
    const cashInBank = journalEntries.filter(e=>e.main_account==="Cash & Cash Equivalents").reduce((s,e)=>s+(+e.debit)-(+e.credit),0);
    const cashInCustody = journalEntries.filter(e=>e.main_account==="Cash Custody").reduce((s,e)=>s+(+e.credit)-(+e.debit),0);
    // Tax outstanding
    const taxOwed = journalEntries.filter(e=>e.main_account==="Tax and Social Insurance Authority").reduce((s,e)=>s+(+e.credit)-(+e.debit),0);
    return {revenue,cashPaid,fixedAssetCost,cashInBank,cashInCustody,taxOwed,
      netOpCash:revenue-cashPaid, netInvest:-fixedAssetCost};
  },[journalEntries,fixedAssets]);

  const btnStyle = id => ({
    padding:"7px 14px",fontSize:13,cursor:"pointer",borderRadius:6,
    background:reportType===id?"var(--accent)":"var(--bg2)",
    border:`1px solid ${reportType===id?"var(--accent)":"var(--border3)"}`,
    color:reportType===id?"#fff":"var(--text2)"
  });

  const handleExport = () => {
    const now = new Date().toLocaleDateString("en-GB",{day:"2-digit",month:"short",year:"numeric"});
    const mo = MONTHS_[repMonth-1];

    if(reportType==="pl"){
      const expRows = ["Operating Costs","Administrative expenses"].map(cat=>{
        const items = plReport.expenses.filter(e=>e.cat===cat);
        if(!items.length) return "";
        return `<tr style="background:#f8fafc"><td colspan="2" style="padding:6px 16px 6px 20px;color:#64748b;font-size:12px;font-style:italic">${cat}</td></tr>`
          +items.map(e=>`<tr><td style="padding:6px 16px 6px 32px">${e.name}</td><td style="text-align:right;font-family:'IBM Plex Mono',monospace;color:#fb923c">${fmtEGP(e.total)}</td></tr>`).join("");
      }).join("");
      generatePDF(
        `P&L Statement â€” Year to Date ${repYear}`,
        [`<div class="section"><div class="st">Profit & Loss Statement â€” Year to Date (EGP)</div>
          <div style="font-size:12px;color:#64748b;margin-bottom:12px;text-align:center">Enevo Egypt LLC â€” All periods up to ${now}</div>
          <table><tbody>
            <tr style="background:#f0fdf4"><td colspan="2" style="padding:8px 16px;font-weight:700;color:#16a34a;font-size:13px">REVENUE</td></tr>
            <tr><td style="padding:7px 16px 7px 28px">Service Revenue â€” Enevo Group S.R.L.</td><td style="text-align:right;font-family:'IBM Plex Mono',monospace;color:#34d399;font-weight:600">${fmtEGP(plReport.rev)}</td></tr>
            <tr style="background:#f0fdf4"><td style="padding:8px 16px;font-weight:700;color:#16a34a">TOTAL REVENUE</td><td style="text-align:right;font-family:'IBM Plex Mono',monospace;font-weight:700;color:#34d399">${fmtEGP(plReport.rev)}</td></tr>
            <tr style="background:#fff7f0"><td colspan="2" style="padding:8px 16px;font-weight:700;color:#dc2626;font-size:13px">EXPENSES</td></tr>
            ${expRows}
            <tr style="background:#fff7f0"><td style="padding:8px 16px;font-weight:700;color:#dc2626">TOTAL EXPENSES</td><td style="text-align:right;font-family:'IBM Plex Mono',monospace;font-weight:700;color:#f87171">${fmtEGP(plReport.totExp)}</td></tr>
            <tr style="background:${plReport.net>=0?"#f0fdf4":"#fff0f0"}">
              <td style="padding:12px 16px;font-weight:700;font-size:14px;color:${plReport.net>=0?"#16a34a":"#dc2626"}">NET ${plReport.net>=0?"PROFIT":"LOSS"}</td>
              <td style="text-align:right;font-family:'IBM Plex Mono',monospace;font-weight:700;font-size:15px;color:${plReport.net>=0?"#16a34a":"#dc2626"}">${fmtEGP(plReport.net)}</td>
            </tr>
          </tbody></table></div>`],
        `Financial Report آ· P&L Statement آ· ${now} آ· CONFIDENTIAL`
      );
    } else if(reportType==="payroll"){
      const accrualSection = payrollReport.grossCost+payrollReport.grossAdmin > 0
        ? `<div class="section"><div class="st">Payroll Accrual Summary â€” ${mo} ${repYear}</div>
           <table><tbody>
             <tr style="background:#f8f0ff"><td colspan="2" style="padding:8px 16px;font-weight:700;font-size:13px">GROSS PAYROLL</td></tr>
             <tr><td style="padding:7px 16px 7px 28px">Cost of Work Staff (Salaries-Cost)</td><td style="text-align:right;font-family:'IBM Plex Mono',monospace;color:#fb923c">${fmtEGP(payrollReport.grossCost)}</td></tr>
             <tr><td style="padding:7px 16px 7px 28px">Administrative Staff (Salaries-Admin)</td><td style="text-align:right;font-family:'IBM Plex Mono',monospace;color:#fb923c">${fmtEGP(payrollReport.grossAdmin)}</td></tr>
             <tr style="background:#f8f0ff"><td colspan="2" style="padding:8px 16px;font-weight:700;color:#dc2626;font-size:13px">DEDUCTIONS (Government)</td></tr>
             <tr><td style="padding:7px 16px 7px 28px">Payroll Tax</td><td style="text-align:right;font-family:'IBM Plex Mono',monospace;color:#f87171">${fmtEGP(payrollReport.taxLine)}</td></tr>
             <tr><td style="padding:7px 16px 7px 28px">Social Insurance Authority</td><td style="text-align:right;font-family:'IBM Plex Mono',monospace;color:#f87171">${fmtEGP(payrollReport.siLine)}</td></tr>
             <tr><td style="padding:7px 16px 7px 28px">Martyrs Families Fund</td><td style="text-align:right;font-family:'IBM Plex Mono',monospace;color:#f87171">${fmtEGP(payrollReport.mfLine)}</td></tr>
             <tr style="background:#f0fdf4">
               <td style="padding:10px 16px;font-weight:700;color:#16a34a;font-size:13px">NET SALARY PAYABLE (Accrued)</td>
               <td style="text-align:right;font-family:'IBM Plex Mono',monospace;font-weight:700;font-size:14px;color:#34d399">${fmtEGP(payrollReport.netSalary)}</td>
             </tr>
           </tbody></table></div>`
        : `<div class="section"><p style="color:#94a3b8;padding:20px 0;text-align:center">No payroll accrual posted for ${mo} ${repYear}. Post a salary journal entry first.</p></div>`;
      const staffSection = payrollReport.activeThisMonth.length > 0
        ? `<div class="section"><div class="st">Staff Roster â€” ${mo} ${repYear} (${payrollReport.activeThisMonth.length} active)</div>
           <table>
             <thead><tr><th>Name</th><th>Department</th><th>Role</th><th style="text-align:right">USD Salary</th><th style="text-align:right">EGP Salary</th></tr></thead>
             <tbody>${payrollReport.activeThisMonth.map((s,i)=>`
               <tr style="${i%2!==0?"background:#f8fafc":""}">
                 <td style="padding:6px 12px;font-weight:600">${s.name||""}</td>
                 <td style="padding:6px 12px;color:#64748b;font-size:12px">${s.department||""}</td>
                 <td style="padding:6px 12px;color:#64748b;font-size:12px">${s.role||""}</td>
                 <td style="text-align:right;padding:6px 12px;font-family:'IBM Plex Mono',monospace;color:#38bdf8;font-size:12px">${s.salary_usd>0?`$${(+s.salary_usd).toLocaleString("en-US",{minimumFractionDigits:2})}`:"â€”"}</td>
                 <td style="text-align:right;padding:6px 12px;font-family:'IBM Plex Mono',monospace;color:#fb923c;font-size:12px">${s.salary_egp>0?fmtEGP(+s.salary_egp):"â€”"}</td>
               </tr>`).join("")}
             </tbody>
           </table></div>`
        : "";
      generatePDF(
        `Payroll Summary â€” ${mo} ${repYear}`,
        [accrualSection, staffSection],
        `Payroll Report آ· ${mo} ${repYear} آ· CONFIDENTIAL`
      );
    } else if(reportType==="cashflow"){
      generatePDF(
        `Cash Flow Statement â€” ${now}`,
        [`<div class="section"><div class="st">Cash Flow Statement (Simplified)</div>
          <div style="font-size:12px;color:#64748b;margin-bottom:12px">Enevo Egypt LLC â€” Based on all journal entries</div>
          <table><tbody>
            <tr style="background:#f0fdf4"><td colspan="2" style="padding:8px 16px;font-weight:700;color:#16a34a;font-size:13px">A. OPERATING ACTIVITIES</td></tr>
            <tr><td style="padding:7px 16px 7px 28px">Revenue Accrued (Invoice)</td><td style="text-align:right;font-family:'IBM Plex Mono',monospace;color:#34d399">${fmtEGP(cashFlow.revenue)}</td></tr>
            <tr><td style="padding:7px 16px 7px 28px">Operating Expenses Paid</td><td style="text-align:right;font-family:'IBM Plex Mono',monospace;color:#f87171">(${fmtEGP(cashFlow.cashPaid)})</td></tr>
            <tr><td style="padding:7px 16px 7px 28px">Taxes Outstanding (not yet paid)</td><td style="text-align:right;font-family:'IBM Plex Mono',monospace;color:#f87171">(${fmtEGP(cashFlow.taxOwed)})</td></tr>
            <tr style="background:#f0fdf4"><td style="padding:8px 16px;font-weight:700;color:#16a34a">Net Operating Cash Flow</td><td style="text-align:right;font-family:'IBM Plex Mono',monospace;font-weight:700;color:#34d399">${fmtEGP(cashFlow.netOpCash)}</td></tr>
            <tr style="background:#fff7f0"><td colspan="2" style="padding:8px 16px;font-weight:700;color:#ea580c;font-size:13px">B. INVESTING ACTIVITIES</td></tr>
            <tr><td style="padding:7px 16px 7px 28px">Fixed Asset Purchases</td><td style="text-align:right;font-family:'IBM Plex Mono',monospace;color:#f87171">(${fmtEGP(cashFlow.fixedAssetCost)})</td></tr>
            <tr style="background:#fff7f0"><td style="padding:8px 16px;font-weight:700;color:#ea580c">Net Investing Cash Flow</td><td style="text-align:right;font-family:'IBM Plex Mono',monospace;font-weight:700;color:#f87171">(${fmtEGP(cashFlow.fixedAssetCost)})</td></tr>
            <tr style="background:#eff6ff"><td colspan="2" style="padding:8px 16px;font-weight:700;color:#1d4ed8;font-size:13px">C. CASH BALANCES</td></tr>
            <tr><td style="padding:7px 16px 7px 28px">Cash at Bank (Credit Agricole)</td><td style="text-align:right;font-family:'IBM Plex Mono',monospace;color:#38bdf8">${fmtEGP(cashFlow.cashInBank)}</td></tr>
            <tr><td style="padding:7px 16px 7px 28px">Cash in Custody (all custodians)</td><td style="text-align:right;font-family:'IBM Plex Mono',monospace;color:#38bdf8">${fmtEGP(cashFlow.cashInCustody)}</td></tr>
            <tr style="background:#eff6ff"><td style="padding:8px 16px;font-weight:700;color:#1d4ed8">TOTAL CASH POSITION</td><td style="text-align:right;font-family:'IBM Plex Mono',monospace;font-weight:700;color:#38bdf8;font-size:14px">${fmtEGP(cashFlow.cashInBank+cashFlow.cashInCustody)}</td></tr>
          </tbody></table></div>`],
        `Cash Flow Statement آ· ${now} آ· CONFIDENTIAL`
      );
    } else if(reportType==="custody"){
      const custodyMap={};
      journalEntries.filter(e=>e.main_account==="Cash Custody").forEach(e=>{
        const n=e.account_name.trim();
        if(!custodyMap[n]) custodyMap[n]={name:n,lines:[],totalOut:0,totalBack:0};
        custodyMap[n].lines.push(e);
        custodyMap[n].totalOut += +e.credit||0;
        custodyMap[n].totalBack += +e.debit||0;
      });
      const custodySections = Object.values(custodyMap).map(p=>{
        let runBal=0;
        const rows=p.lines.sort((a,b)=>String(a.entry_date).localeCompare(String(b.entry_date))).map((e,i)=>{
          runBal += (+e.credit||0)-(+e.debit||0);
          return `<tr style="${i%2!==0?"background:#f8fafc":""}">
            <td style="padding:5px 10px;font-family:'IBM Plex Mono',monospace;font-size:11px;color:#64748b">${String(e.entry_date||"").slice(0,10)}</td>
            <td style="padding:5px 10px;font-family:'IBM Plex Mono',monospace;font-size:11px;color:#94a3b8">${e.entry_no||""}</td>
            <td style="padding:5px 10px;font-size:11px">${e.description||""}</td>
            <td style="text-align:right;padding:5px 10px;font-family:'IBM Plex Mono',monospace;font-size:11px;color:#f87171">${+e.credit>0.01?fmtEGP(+e.credit):""}</td>
            <td style="text-align:right;padding:5px 10px;font-family:'IBM Plex Mono',monospace;font-size:11px;color:#34d399">${+e.debit>0.01?fmtEGP(+e.debit):""}</td>
            <td style="text-align:right;padding:5px 10px;font-family:'IBM Plex Mono',monospace;font-size:11px;font-weight:600;color:${runBal>0?"#34d399":"#64748b"}">${fmtEGP(runBal)}</td>
          </tr>`;
        }).join("");
        return `<div class="section"><div class="st">${p.name} â€” Balance: ${fmtEGP(p.totalOut-p.totalBack)}</div>
          <table>
            <thead><tr><th>Date</th><th>Entry#</th><th>Description</th><th style="text-align:right">Cash Out</th><th style="text-align:right">Back/Spent</th><th style="text-align:right">Running Bal.</th></tr></thead>
            <tbody>${rows}</tbody>
          </table></div>`;
      });
      if(custodySections.length===0) custodySections.push(`<div class="section"><p style="color:#94a3b8;text-align:center;padding:20px 0">No custody entries found in journal.</p></div>`);
      generatePDF(`Custody Ledger Report`, custodySections, `Cash Custody آ· ${now} آ· CONFIDENTIAL`);
    } else if(reportType==="assets"){
      const TODAY=new Date();
      const rows=fixedAssets.map((a,i)=>{
        if(!a.purchase_date) return {...a,annual:0,acc:0,net:+a.cost_egp||0,pct:0};
    const purchased=new Date(a.purchase_date+"T12:00:00");
        const yrs=Math.max(0,(TODAY-purchased)/(365.25*24*3600*1000));
        const annual=+a.useful_life_years>0?(+a.cost_egp/+a.useful_life_years):0;
        const acc=Math.min(+a.cost_egp,annual*yrs);
        const net=Math.max(0,+a.cost_egp-acc);
        const fullyDepr=new Date(purchased.getTime()+a.useful_life_years*365.25*24*3600*1000);
        const done=net<=1;
        return `<tr style="${i%2!==0?"background:#f8fafc":""}">
          <td style="padding:6px 10px;font-weight:600;font-size:12px">${a.asset_name||""}</td>
          <td style="padding:6px 10px;font-size:11px;color:#64748b">${a.category||""}</td>
          <td style="padding:6px 10px;font-family:'IBM Plex Mono',monospace;font-size:11px;color:#94a3b8">${a.purchase_date||""}</td>
          <td style="text-align:right;padding:6px 10px;font-family:'IBM Plex Mono',monospace;font-size:12px">${fmtEGP(+a.cost_egp)}</td>
          <td style="text-align:center;padding:6px 10px;font-size:11px">${a.useful_life_years}y</td>
          <td style="text-align:right;padding:6px 10px;font-family:'IBM Plex Mono',monospace;font-size:11px;color:#fb923c">${fmtEGP(annual)}</td>
          <td style="text-align:right;padding:6px 10px;font-family:'IBM Plex Mono',monospace;font-size:11px;color:#f87171">${fmtEGP(acc)}</td>
          <td style="text-align:right;padding:6px 10px;font-family:'IBM Plex Mono',monospace;font-size:12px;font-weight:${done?"400":"600"};color:${done?"#94a3b8":"#34d399"}">${fmtEGP(net)}</td>
          <td style="text-align:center;padding:6px 10px;font-size:11px;color:${done?"#f87171":"#64748b"}">${done?"âœ“ FULLY":fullyDepr.toLocaleDateString("en-GB",{year:"numeric",month:"short"})}</td>
        </tr>`;
      }).join("");
      const totalCost=fixedAssets.reduce((s,a)=>s+(+a.cost_egp),0);
      const totalAcc=fixedAssets.reduce((s,a)=>{
        const p=new Date(a.purchase_date+"T12:00:00");
        const y2=Math.max(0,(TODAY-p)/(365.25*24*3600*1000));
        return s+Math.min(+a.cost_egp,(+a.cost_egp/+a.useful_life_years)*y2);
      },0);
      const totalNet=Math.max(0,totalCost-totalAcc);
      generatePDF(
        `Fixed Assets Schedule â€” ${now}`,
        [`<div class="section"><div class="st">Fixed Assets Depreciation Schedule â€” Straight-Line Method</div>
          <div style="font-size:11px;color:#64748b;margin-bottom:10px">Enevo Egypt LLC آ· As of ${now}</div>
          <table>
            <thead><tr>
              <th>Asset</th><th>Category</th><th>Purchased</th>
              <th style="text-align:right">Cost (EGP)</th><th style="text-align:center">Life</th>
              <th style="text-align:right">Annual Depr.</th><th style="text-align:right">Acc. Depr.</th>
              <th style="text-align:right">Net Book Value</th><th style="text-align:center">Fully Depr.</th>
            </tr></thead>
            <tbody>
              ${rows}
              <tr style="background:#f0f7ff;border-top:2px solid #bfdbfe">
                <td colspan="3" style="padding:7px 10px;font-weight:700">TOTAL (${fixedAssets.length} assets)</td>
                <td style="text-align:right;padding:7px 10px;font-family:'IBM Plex Mono',monospace;font-weight:700">${fmtEGP(totalCost)}</td>
                <td colspan="2"></td>
                <td style="text-align:right;padding:7px 10px;font-family:'IBM Plex Mono',monospace;color:#f87171;font-weight:700">${fmtEGP(totalAcc)}</td>
                <td style="text-align:right;padding:7px 10px;font-family:'IBM Plex Mono',monospace;color:#34d399;font-weight:700;font-size:13px">${fmtEGP(totalNet)}</td>
                <td></td>
              </tr>
            </tbody>
          </table></div>`],
        `Asset Depreciation Report آ· ${now} آ· CONFIDENTIAL`
      );
    }
  };

  return(
    <div style={{display:"grid",gap:14}}>
      {/* Report selector + filter + export */}
      <div style={{display:"flex",gap:8,flexWrap:"wrap",alignItems:"center"}}>
        <button style={btnStyle("pl")}     onClick={()=>setReportType("pl")}>P&L Statement</button>
        <button style={btnStyle("payroll")}onClick={()=>setReportType("payroll")}>Payroll Summary</button>
        <button style={btnStyle("cashflow")}onClick={()=>setReportType("cashflow")}>ًں’§ Cash Flow</button>
        <button style={btnStyle("custody")}onClick={()=>setReportType("custody")}>Custody Ledger</button>
        <button style={btnStyle("assets")} onClick={()=>setReportType("assets")}>Asset Schedule</button>
        <div style={{marginLeft:"auto",display:"flex",gap:6,alignItems:"center"}}>
          <span style={{fontSize:13,color:"var(--text4)"}}>Filter:</span>
          <select value={repMonth} onChange={e=>setRepMonth(+e.target.value)}
            style={{background:"var(--bg1)",border:"1px solid var(--border3)",borderRadius:6,padding:"5px 8px",color:"var(--text0)",fontSize:13}}>
            {MONTHS_.map((m,i)=><option key={i} value={i+1}>{m}</option>)}
          </select>
          <select value={repYear} onChange={e=>setRepYear(+e.target.value)}
            style={{background:"var(--bg2)",border:"1px solid var(--border3)",borderRadius:6,padding:"5px 10px",color:"var(--text0)",fontSize:13,fontWeight:600,outline:"none",cursor:"pointer",minWidth:80}}>
            {Array.from({length:6},(_,i)=>new Date().getFullYear()-2+i).map(y=><option key={y}>{y}</option>)}
          </select>
          <button className="bp" onClick={handleExport} style={{padding:"6px 14px",fontSize:13,marginLeft:4}}>â¬‡ Export PDF</button>
        </div>
      </div>

      {/* P&L STATEMENT */}
      {reportType==="pl" && (
        <div className="card">
          <div style={{textAlign:"center",marginBottom:20}}>
            <div style={{fontSize:16,fontWeight:700,color:"var(--text0)"}}>PROFIT & LOSS STATEMENT</div>
            <div style={{fontSize:13,color:"var(--text4)"}}>Enevo Egypt LLC â€” Year to Date (EGP)</div>
          </div>
          <table style={{width:"100%",borderCollapse:"collapse",fontSize:13}}>
            <tbody>
              <tr style={{background:"var(--bg2)"}}><td colSpan={2} style={{padding:"8px 16px",fontWeight:700,color:"#34d399",fontSize:13}}>REVENUE</td></tr>
              <tr style={{borderBottom:"1px solid var(--border3)"}}><td style={{padding:"7px 16px 7px 28px",color:"var(--text2)"}}>Service Revenue â€” Enevo Group S.R.L.</td><td style={{padding:"7px 16px",textAlign:"right",fontFamily:"'IBM Plex Mono',monospace",color:"#34d399",fontWeight:600}}>{fmtEGP(plReport.rev)}</td></tr>
              <tr><td style={{padding:"8px 16px",fontWeight:700,color:"#34d399"}}>TOTAL REVENUE</td><td style={{padding:"8px 16px",textAlign:"right",fontFamily:"'IBM Plex Mono',monospace",fontWeight:700,color:"#34d399"}}>{fmtEGP(plReport.rev)}</td></tr>

              <tr style={{background:"var(--bg2)"}}><td colSpan={2} style={{padding:"8px 16px",fontWeight:700,color:"#f87171",fontSize:13}}>EXPENSES</td></tr>
              {["Operating Costs","Administrative expenses"].map(cat=>{
                const items = plReport.expenses.filter(e=>e.cat===cat);
                if(!items.length) return null;
                return [
                  <tr key={cat} style={{background:"var(--bg1)"}}><td colSpan={2} style={{padding:"6px 16px 6px 20px",color:"var(--text4)",fontSize:13,fontStyle:"italic"}}>{cat}</td></tr>,
                  ...items.map(e=>(
                    <tr key={e.name} style={{borderBottom:"1px solid var(--border3)"}}><td style={{padding:"6px 16px 6px 32px",color:"var(--text2)"}}>{e.name}</td><td style={{padding:"6px 16px",textAlign:"right",fontFamily:"'IBM Plex Mono',monospace",color:"#fb923c"}}>{fmtEGP(e.total)}</td></tr>
                  ))
                ];
              })}
              <tr style={{background:"var(--bg2)"}}><td style={{padding:"8px 16px",fontWeight:700,color:"#f87171"}}>TOTAL EXPENSES</td><td style={{padding:"8px 16px",textAlign:"right",fontFamily:"'IBM Plex Mono',monospace",fontWeight:700,color:"#f87171"}}>{fmtEGP(plReport.totExp)}</td></tr>
              <tr style={{background:plReport.net>=0?"#34d39918":"#f8711818",borderTop:"2px solid var(--border)"}}>
                <td style={{padding:"12px 16px",fontWeight:700,fontSize:15,color:plReport.net>=0?"#34d399":"#f87171"}}>NET {plReport.net>=0?"PROFIT":"LOSS"}</td>
                <td style={{padding:"12px 16px",textAlign:"right",fontFamily:"'IBM Plex Mono',monospace",fontWeight:700,fontSize:16,color:plReport.net>=0?"#34d399":"#f87171"}}>{fmtEGP(plReport.net)}</td>
              </tr>
            </tbody>
          </table>
        </div>
      )}

      {/* PAYROLL SUMMARY */}
      {reportType==="payroll" && (
        <div style={{display:"grid",gap:12}}>
          <div className="card">
            <div style={{textAlign:"center",marginBottom:16}}>
              <div style={{fontSize:16,fontWeight:700,color:"var(--text0)"}}>PAYROLL SUMMARY â€” {MONTHS_[repMonth-1]} {repYear}</div>
              <div style={{fontSize:13,color:"var(--text4)"}}>Enevo Egypt LLC</div>
            </div>
            {payrollReport.grossCost+payrollReport.grossAdmin > 0 ? (
              <table style={{width:"100%",borderCollapse:"collapse",fontSize:13}}>
                <tbody>
                  <tr style={{background:"var(--bg2)"}}><td colSpan={2} style={{padding:"8px 16px",fontWeight:700,color:"var(--text2)"}}>GROSS PAYROLL</td></tr>
                  <tr style={{borderBottom:"1px solid var(--border3)"}}><td style={{padding:"7px 16px 7px 28px",color:"var(--text2)"}}>Cost of Work Staff (Salaries-Cost)</td><td style={{padding:"7px 16px",textAlign:"right",fontFamily:"'IBM Plex Mono',monospace",color:"#fb923c"}}>{fmtEGP(payrollReport.grossCost)}</td></tr>
                  <tr style={{borderBottom:"1px solid var(--border3)"}}><td style={{padding:"7px 16px 7px 28px",color:"var(--text2)"}}>Administrative Staff (Salaries-Admin)</td><td style={{padding:"7px 16px",textAlign:"right",fontFamily:"'IBM Plex Mono',monospace",color:"#fb923c"}}>{fmtEGP(payrollReport.grossAdmin)}</td></tr>
                  <tr style={{background:"var(--bg2)"}}><td colSpan={2} style={{padding:"8px 16px",fontWeight:700,color:"var(--text2)"}}>DEDUCTIONS (Government)</td></tr>
                  <tr style={{borderBottom:"1px solid var(--border3)"}}><td style={{padding:"7px 16px 7px 28px",color:"var(--text2)"}}>Payroll Tax</td><td style={{padding:"7px 16px",textAlign:"right",fontFamily:"'IBM Plex Mono',monospace",color:"#f87171"}}>{fmtEGP(payrollReport.taxLine)}</td></tr>
                  <tr style={{borderBottom:"1px solid var(--border3)"}}><td style={{padding:"7px 16px 7px 28px",color:"var(--text2)"}}>Social Insurance Authority</td><td style={{padding:"7px 16px",textAlign:"right",fontFamily:"'IBM Plex Mono',monospace",color:"#f87171"}}>{fmtEGP(payrollReport.siLine)}</td></tr>
                  <tr style={{borderBottom:"1px solid var(--border3)"}}><td style={{padding:"7px 16px 7px 28px",color:"var(--text2)"}}>Martyrs Families Fund</td><td style={{padding:"7px 16px",textAlign:"right",fontFamily:"'IBM Plex Mono',monospace",color:"#f87171"}}>{fmtEGP(payrollReport.mfLine)}</td></tr>
                  <tr style={{background:"#34d39918",borderTop:"2px solid var(--border)"}}>
                    <td style={{padding:"10px 16px",fontWeight:700,color:"#34d399"}}>NET SALARY PAYABLE (Accrued)</td>
                    <td style={{padding:"10px 16px",textAlign:"right",fontFamily:"'IBM Plex Mono',monospace",fontWeight:700,fontSize:15,color:"#34d399"}}>{fmtEGP(payrollReport.netSalary)}</td>
                  </tr>
                </tbody>
              </table>
            ) : (
              <div style={{textAlign:"center",padding:24,color:"var(--text4)"}}>No payroll accrual posted for {MONTHS_[repMonth-1]} {repYear}. Post a salary journal entry first.</div>
            )}
          </div>
          {/* Staff breakdown from staff table */}
          {payrollReport.activeThisMonth.length > 0 && (
            <div className="card">
              <div style={{background:"var(--bg0)",borderBottom:"1px solid var(--border)",padding:"12px 20px",margin:"-1px",display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:0}}>
                <div style={{fontSize:15,fontWeight:700,color:"var(--text0)"}}>Staff Roster</div>
                <div style={{fontSize:13,color:"var(--text3)",fontFamily:"'IBM Plex Mono',monospace"}}>{MONTHS_[repMonth-1]} {repYear} آ· {payrollReport.activeThisMonth.length} active</div>
              </div>
              <table style={{width:"100%",borderCollapse:"collapse",fontSize:13}}>
                <thead><tr style={{background:"var(--bg2)"}}>
                  {["Name","Department","Role","USD Salary","EGP Salary"].map(h=>(
                    <th key={h} style={{padding:"6px 12px",textAlign:["USD Salary","EGP Salary"].includes(h)?"right":"left",color:"var(--text3)",fontSize:13}}>{h}</th>
                  ))}
                </tr></thead>
                <tbody>
                  {payrollReport.activeThisMonth.map((s,i)=>(
                    <tr key={i} style={{borderBottom:"1px solid var(--border3)",background:i%2===0?"transparent":"var(--bg1)"}}>
                      <td style={{padding:"6px 12px",color:"var(--text1)",fontWeight:500}}>{s.name}</td>
                      <td style={{padding:"6px 12px",color:"var(--text3)"}}>{s.department}</td>
                      <td style={{padding:"6px 12px",color:"var(--text3)",fontSize:13}}>{s.role}</td>
                      <td style={{padding:"6px 12px",fontFamily:"'IBM Plex Mono',monospace",fontSize:13,textAlign:"right",color:"#38bdf8"}}>{s.salary_usd>0?`$${(+s.salary_usd).toLocaleString("en-US",{minimumFractionDigits:2})}`:"-"}</td>
                      <td style={{padding:"6px 12px",fontFamily:"'IBM Plex Mono',monospace",fontSize:13,textAlign:"right",color:"#fb923c"}}>{s.salary_egp>0?fmtEGP(+s.salary_egp):"-"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* CASH FLOW */}
      {reportType==="cashflow" && (
        <div className="card">
          <div style={{textAlign:"center",marginBottom:20}}>
            <div style={{fontSize:16,fontWeight:700,color:"var(--text0)"}}>CASH FLOW STATEMENT (Simplified)</div>
            <div style={{fontSize:13,color:"var(--text4)"}}>Enevo Egypt LLC â€” Based on Journal Entries</div>
          </div>
          <table style={{width:"100%",borderCollapse:"collapse",fontSize:13}}>
            <tbody>
              <tr style={{background:"var(--bg2)"}}><td colSpan={2} style={{padding:"8px 16px",fontWeight:700,color:"#34d399"}}>A. OPERATING ACTIVITIES</td></tr>
              <tr><td style={{padding:"7px 16px 7px 28px",color:"var(--text2)"}}>Revenue Accrued (Invoice EGY-001)</td><td style={{padding:"7px 16px",textAlign:"right",fontFamily:"'IBM Plex Mono',monospace",color:"#34d399"}}>{fmtEGP(cashFlow.revenue)}</td></tr>
              <tr><td style={{padding:"7px 16px 7px 28px",color:"var(--text2)"}}>Operating Expenses Paid</td><td style={{padding:"7px 16px",textAlign:"right",fontFamily:"'IBM Plex Mono',monospace",color:"#f87171"}}>({fmtEGP(cashFlow.cashPaid)})</td></tr>
              <tr><td style={{padding:"7px 16px 7px 28px",color:"var(--text2)"}}>Taxes Outstanding (not yet paid)</td><td style={{padding:"7px 16px",textAlign:"right",fontFamily:"'IBM Plex Mono',monospace",color:"#f87171"}}>({fmtEGP(cashFlow.taxOwed)})</td></tr>
              <tr style={{background:"var(--bg2)"}}><td style={{padding:"8px 16px",fontWeight:700,color:"#34d399"}}>Net Operating Cash Flow</td><td style={{padding:"8px 16px",textAlign:"right",fontFamily:"'IBM Plex Mono',monospace",fontWeight:700,color:"#34d399"}}>{fmtEGP(cashFlow.netOpCash)}</td></tr>

              <tr style={{background:"var(--bg2)"}}><td colSpan={2} style={{padding:"8px 16px",fontWeight:700,color:"#fb923c"}}>B. INVESTING ACTIVITIES</td></tr>
              <tr><td style={{padding:"7px 16px 7px 28px",color:"var(--text2)"}}>Fixed Asset Purchases</td><td style={{padding:"7px 16px",textAlign:"right",fontFamily:"'IBM Plex Mono',monospace",color:"#f87171"}}>({fmtEGP(cashFlow.fixedAssetCost)})</td></tr>
              <tr style={{background:"var(--bg2)"}}><td style={{padding:"8px 16px",fontWeight:700,color:"#fb923c"}}>Net Investing Cash Flow</td><td style={{padding:"8px 16px",textAlign:"right",fontFamily:"'IBM Plex Mono',monospace",fontWeight:700,color:"#f87171"}}>({fmtEGP(cashFlow.fixedAssetCost)})</td></tr>

              <tr style={{background:"var(--bg2)"}}><td colSpan={2} style={{padding:"8px 16px",fontWeight:700,color:"#38bdf8"}}>C. BALANCES</td></tr>
              <tr><td style={{padding:"7px 16px 7px 28px",color:"var(--text2)"}}>Cash at Bank (Credit Agricole)</td><td style={{padding:"7px 16px",textAlign:"right",fontFamily:"'IBM Plex Mono',monospace",color:"#38bdf8"}}>{fmtEGP(cashFlow.cashInBank)}</td></tr>
              <tr><td style={{padding:"7px 16px 7px 28px",color:"var(--text2)"}}>Cash in Custody (all custodians)</td><td style={{padding:"7px 16px",textAlign:"right",fontFamily:"'IBM Plex Mono',monospace",color:"#38bdf8"}}>{fmtEGP(cashFlow.cashInCustody)}</td></tr>
              <tr style={{background:"var(--bg2)"}}><td style={{padding:"8px 16px",fontWeight:700,color:"#38bdf8"}}>Total Cash Position</td><td style={{padding:"8px 16px",textAlign:"right",fontFamily:"'IBM Plex Mono',monospace",fontWeight:700,color:"#38bdf8"}}>{fmtEGP(cashFlow.cashInBank+cashFlow.cashInCustody)}</td></tr>
            </tbody>
          </table>
        </div>
      )}

      {/* CUSTODY LEDGER per person */}
      {reportType==="custody" && (
        <div style={{display:"grid",gap:12}}>
          {(() => {
            const custodyMap={};
            journalEntries.filter(e=>e.main_account==="Cash Custody").forEach(e=>{
              const n=e.account_name.trim();
              if(!custodyMap[n]) custodyMap[n]={name:n,lines:[],totalOut:0,totalBack:0};
              custodyMap[n].lines.push(e);
              custodyMap[n].totalOut += +e.credit||0;
              custodyMap[n].totalBack += +e.debit||0;
            });
            return Object.values(custodyMap).map(p=>(
              <div key={p.name} className="card" style={{padding:0,overflow:"hidden"}}>
                <div style={{background:"var(--bg2)",borderBottom:"2px solid var(--border)",padding:"10px 16px",display:"flex",justifyContent:"space-between"}}>
                  <span style={{fontWeight:700,color:"var(--text0)",fontSize:14}}>{p.name}</span>
                  <span style={{fontFamily:"'IBM Plex Mono',monospace",fontSize:13,color:"#34d399",fontWeight:700}}>Balance: {fmtEGP(p.totalOut-p.totalBack)}</span>
                </div>
                <table style={{width:"100%",borderCollapse:"collapse",fontSize:13}}>
                  <thead><tr style={{background:"var(--bg2)"}}>
                    {["Date","Entry#","Description","Cash Out","Cash Spent/Returned","Running Balance"].map(h=>(
                      <th key={h} style={{padding:"6px 12px",textAlign:["Cash Out","Cash Spent/Returned","Running Balance"].includes(h)?"right":"left",color:"var(--text3)",fontSize:13}}>{h}</th>
                    ))}
                  </tr></thead>
                  <tbody>
                    {p.lines.sort((a,b)=>String(a.entry_date).localeCompare(String(b.entry_date))).reduce((acc,e,i)=>{
                      const prevBal = acc.length>0?acc[acc.length-1].runBal:0;
                      const runBal = prevBal + (+e.credit||0) - (+e.debit||0);
                      acc.push({...e,runBal});
                      return acc;
                    },[]).map((e,i)=>(
                      <tr key={i} style={{borderBottom:"1px solid var(--border3)",background:i%2===0?"transparent":"var(--bg1)"}}>
                        <td style={{padding:"6px 12px",fontFamily:"'IBM Plex Mono',monospace",fontSize:13,color:"var(--text3)"}}>{String(e.entry_date).slice(0,10)}</td>
                        <td style={{padding:"6px 12px",fontFamily:"'IBM Plex Mono',monospace",fontSize:13,color:"var(--text4)"}}>{e.entry_no}</td>
                        <td style={{padding:"6px 12px",color:"var(--text2)",fontSize:13,maxWidth:200,overflow:"hidden",textOverflow:"ellipsis"}}>{e.description}</td>
                        <td style={{padding:"6px 12px",fontFamily:"'IBM Plex Mono',monospace",fontSize:13,textAlign:"right",color:"#f87171"}}>{+e.credit>0.01?fmtEGP(+e.credit):""}</td>
                        <td style={{padding:"6px 12px",fontFamily:"'IBM Plex Mono',monospace",fontSize:13,textAlign:"right",color:"#34d399"}}>{+e.debit>0.01?fmtEGP(+e.debit):""}</td>
                        <td style={{padding:"6px 12px",fontFamily:"'IBM Plex Mono',monospace",fontSize:13,textAlign:"right",color:e.runBal>0?"#34d399":"var(--text3)",fontWeight:600}}>{fmtEGP(e.runBal)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ));
          })()}
        </div>
      )}

      {/* FIXED ASSET DEPRECIATION SCHEDULE */}
      {reportType==="assets" && (
        <div className="card" style={{padding:0,overflow:"hidden"}}>
          <div style={{background:"var(--bg2)",borderBottom:"2px solid var(--border)",padding:"10px 16px"}}>
            <div style={{fontSize:15,fontWeight:700,color:"var(--text0)"}}>FIXED ASSETS DEPRECIATION SCHEDULE</div>
            <div style={{fontSize:13,color:"var(--text4)",marginTop:2}}>Enevo Egypt LLC â€” Straight-Line Method â€” As of {new Date().toLocaleDateString("en-EG")}</div>
          </div>
          <div style={{overflowX:"auto"}}>
            <table style={{width:"100%",borderCollapse:"collapse",fontSize:13}}>
              <thead><tr style={{background:"var(--bg2)"}}>
                {["Asset","Category","Purchased","Cost","Life","Annual Depr.","Acc. Depr.","Net Book Value","Fully Depr."].map(h=>(
                  <th key={h} style={{padding:"7px 12px",textAlign:["Cost","Annual Depr.","Acc. Depr.","Net Book Value"].includes(h)?"right":"left",color:"var(--text3)",fontSize:13,whiteSpace:"nowrap"}}>{h}</th>
                ))}
              </tr></thead>
              <tbody>
                {(()=>{
                  const TODAY=new Date();
                  return fixedAssets.map((a,i)=>{
                    if(!a.purchase_date) return {...a,annual:0,acc:0,net:+a.cost_egp||0,pct:0};
    const purchased=new Date(a.purchase_date+"T12:00:00");
                    const yrs=Math.max(0,(TODAY-purchased)/(365.25*24*3600*1000));
                    const annual=+a.useful_life_years>0?(+a.cost_egp/+a.useful_life_years):0;
                    const acc=Math.min(+a.cost_egp,annual*yrs);
                    const net=Math.max(0,+a.cost_egp-acc);
                    const fullyDepr=new Date(purchased.getTime()+a.useful_life_years*365.25*24*3600*1000);
                    return(
                      <tr key={i} style={{borderBottom:"1px solid var(--border3)",background:i%2===0?"transparent":"var(--bg1)"}}>
                        <td style={{padding:"6px 12px",color:"var(--text1)",fontWeight:500}}>{a.asset_name}</td>
                        <td style={{padding:"6px 12px",color:"var(--text3)",fontSize:13}}>{a.category}</td>
                        <td style={{padding:"6px 12px",fontFamily:"'IBM Plex Mono',monospace",fontSize:13,color:"var(--text4)"}}>{a.purchase_date}</td>
                        <td style={{padding:"6px 12px",fontFamily:"'IBM Plex Mono',monospace",fontSize:13,textAlign:"right",color:"#38bdf8"}}>{fmtEGP(+a.cost_egp)}</td>
                        <td style={{padding:"6px 12px",fontFamily:"'IBM Plex Mono',monospace",fontSize:13,textAlign:"right",color:"var(--text3)"}}>{a.useful_life_years}y</td>
                        <td style={{padding:"6px 12px",fontFamily:"'IBM Plex Mono',monospace",fontSize:13,textAlign:"right",color:"var(--text2)"}}>{fmtEGP(annual)}</td>
                        <td style={{padding:"6px 12px",fontFamily:"'IBM Plex Mono',monospace",fontSize:13,textAlign:"right",color:"#fb923c"}}>{fmtEGP(acc)}</td>
                        <td style={{padding:"6px 12px",fontFamily:"'IBM Plex Mono',monospace",fontSize:13,textAlign:"right",color:net>0?"#34d399":"var(--text4)",fontWeight:600}}>{fmtEGP(net)}</td>
                        <td style={{padding:"6px 12px",fontFamily:"'IBM Plex Mono',monospace",fontSize:12,color:"var(--text4)"}}>{fullyDepr.toLocaleDateString("en-EG")}</td>
                      </tr>
                    );
                  });
                })()}
                <tr style={{background:"var(--bg2)",borderTop:"2px solid var(--border)",fontWeight:700}}>
                  <td colSpan={3} style={{padding:"8px 12px",color:"var(--text0)"}}>TOTAL</td>
                  <td style={{padding:"8px 12px",fontFamily:"'IBM Plex Mono',monospace",textAlign:"right",color:"#38bdf8"}}>{fmtEGP(fixedAssets.reduce((s,a)=>s+(+a.cost_egp),0))}</td>
                  <td/>
                  <td style={{padding:"8px 12px",fontFamily:"'IBM Plex Mono',monospace",textAlign:"right",color:"var(--text2)"}}>{fmtEGP(fixedAssets.reduce((s,a)=>s+(+a.cost_egp/+a.useful_life_years),0))}/yr</td>
                  <td style={{padding:"8px 12px",fontFamily:"'IBM Plex Mono',monospace",textAlign:"right",color:"#fb923c"}}>{fmtEGP((()=>{const T=new Date();return fixedAssets.reduce((s,a)=>{const p=new Date(a.purchase_date+"T12:00:00");const y=Math.max(0,(T-p)/(365.25*24*3600*1000));return s+Math.min(+a.cost_egp,(+a.cost_egp/+a.useful_life_years)*y);},0);})())}</td>
                  <td style={{padding:"8px 12px",fontFamily:"'IBM Plex Mono',monospace",textAlign:"right",color:"#34d399"}}>{fmtEGP((()=>{const T=new Date();return fixedAssets.reduce((s,a)=>{const p=new Date(a.purchase_date+"T12:00:00");const y=Math.max(0,(T-p)/(365.25*24*3600*1000));return s+Math.max(0,+a.cost_egp-Math.min(+a.cost_egp,(+a.cost_egp/+a.useful_life_years)*y));},0);})())}</td>
                  <td/>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

/* â•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گ
   8. ACCOUNTANT WORKFLOW GUIDE â€” How to post entries
   â•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گ */
function AccountantGuide({journalEntries, staff, egpRate}) {
  const [step, setStep] = React.useState("monthly");
  const MO = ["","Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];

  // Calculate next entry number
  const nextEntryNo = React.useMemo(()=>{
    const nums = journalEntries.map(e=>+e.entry_no).filter(n=>!isNaN(n));
    return nums.length>0 ? Math.max(...nums)+1 : 67;
  },[journalEntries]);

  // Active staff for salary template
  const activeStaff = staff.filter(s=>s.active!==false);
  const totalSalaryEGP = activeStaff.reduce((s,x)=>s+(+x.salary_egp||0),0);

  // What month to post next
  const postedMonths = [...new Set(journalEntries.filter(e=>e.entry_type==="Accrued Salaries").map(e=>e.month))].sort((a,b)=>+a-+b);
  const lastPostedMonth = postedMonths[postedMonths.length-1]||0;
  const nextMonth = lastPostedMonth>=12 ? 1 : lastPostedMonth+1;

  const steps = [
    {id:"monthly",   label:"Monthly Close"},
    {id:"custody",   label:"Custody Expense"},
    {id:"salary",    label:"Salary Accrual"},
    {id:"revenue",   label:"Revenue Invoice"},
    {id:"asset",     label:"Asset Purchase"},
  ];

  return(
    <div style={{display:"grid",gap:14}}>
      <div style={{background:"#38bdf810",border:"1px solid #38bdf840",borderRadius:8,padding:"12px 16px"}}>
        <div style={{fontSize:14,fontWeight:700,color:"#38bdf8",marginBottom:4}}>Accountant Workflow Guide â€” How to use the Journal</div>
        <div style={{fontSize:13,color:"var(--text2)"}}>Next suggested Entry No: <strong style={{color:"#38bdf8"}}>#{nextEntryNo}</strong> آ· Last salary posted: {MO[lastPostedMonth]||"none"} آ· Next to post: {MO[nextMonth]}</div>
      </div>

      <div style={{display:"flex",gap:6,flexWrap:"wrap"}}>
        {steps.map(s=>(
          <button key={s.id} onClick={()=>setStep(s.id)}
            style={{padding:"7px 14px",fontSize:13,cursor:"pointer",borderRadius:6,
              background:step===s.id?"var(--accent)":"var(--bg2)",
              border:`1px solid ${step===s.id?"var(--accent)":"var(--border3)"}`,
              color:step===s.id?"#fff":"var(--text2)"}}>
            {s.label}
          </button>
        ))}
      </div>

      {/* MONTHLY CLOSE CHECKLIST */}
      {step==="monthly" && (
        <div className="card">
          <div style={{fontSize:15,fontWeight:700,color:"var(--text0)",marginBottom:14}}>Monthly Close Checklist</div>
          {[
            {n:1,title:"Post Salary Accrual",desc:"Go to Journal â†’ Post Entry Line. Use entry type 'Accrued Salaries'. Must post 8 lines per month (see Salary Accrual guide).",done:postedMonths.includes(nextMonth)},
            {n:2,title:"Post Custody Expenses",desc:"For every petty cash receipt, post a line: Dr=expense account, Cr=Cash Custody (the person who paid). Use entry type 'Custody'.",done:false},
            {n:3,title:"Post Revenue Invoice",desc:"When invoice is issued to Enevo Group S.R.L., post Dr=Customers, Cr=Revenue. Enter USD amount + exchange rate.",done:false},
            {n:4,title:"Verify Journal Balance",desc:"In Journal, filter by month. Check Debit = Credit strip at top. Must be âœ“ Balanced.",done:false},
            {n:5,title:"Review Balance Sheet",desc:"Check Balance Sheet â€” Assets = Liabilities + Equity (+ current year profit). No unexplained gaps.",done:false},
            {n:6,title:"Review Tax Position",desc:"Check Tax tab â€” confirm payroll tax and social insurance liabilities match payroll accrual.",done:false},
          ].map(item=>(
            <div key={item.n} style={{display:"flex",gap:12,padding:"10px 0",borderBottom:"1px solid var(--border3)",alignItems:"flex-start"}}>
              <div style={{width:28,height:28,borderRadius:"50%",background:item.done?"#34d39920":"var(--bg2)",border:`2px solid ${item.done?"#34d399":"var(--border3)"}`,display:"flex",alignItems:"center",justifyContent:"center",color:item.done?"#34d399":"var(--text4)",fontWeight:700,fontSize:13,flexShrink:0}}>
                {item.done?"âœ“":item.n}
              </div>
              <div>
                <div style={{fontWeight:600,color:"var(--text1)",fontSize:13,marginBottom:2}}>{item.title}</div>
                <div style={{fontSize:13,color:"var(--text3)"}}>{item.desc}</div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* CUSTODY EXPENSE GUIDE */}
      {step==="custody" && (
        <div className="card">
          <div style={{fontSize:15,fontWeight:700,color:"var(--text0)",marginBottom:14}}>How to Post a Custody Expense</div>
          <div style={{background:"var(--bg2)",borderRadius:6,padding:"12px 16px",marginBottom:14,fontSize:13,color:"var(--text2)"}}>
            <strong>Example:</strong> Omar Faheem spent EGP 3,334.50 purchasing kitchen supplies in Dec-2025.
          </div>
          <div style={{display:"grid",gap:8}}>
            {[
              {step:"Open Journal â†’ click + Post Entry Line",detail:""},
              {step:"Entry No",detail:`${nextEntryNo} (next available)`},
              {step:"Date",detail:"Date on the receipt"},
              {step:"Entry Type",detail:"Custody"},
              {step:"Line 1 â€” Expense side",detail:"Account: Kitchen Supplies آ· Main: Administrative expenses آ· Debit: 3,334.50 آ· Credit: 0"},
              {step:"Line 2 â€” Custody side",detail:"Account: Omar Faheem آ· Main: Cash Custody آ· Debit: 0 آ· Credit: 3,334.50"},
              {step:"Description",detail:"Purchasing kitchen supplies"},
              {step:"âڑ  Verify balance",detail:"Both lines must have equal Debit/Credit total for entry to balance"},
            ].map((r,i)=>(
              <div key={i} style={{display:"grid",gridTemplateColumns:"200px 1fr",gap:8,borderBottom:"1px solid var(--border3)",padding:"7px 0"}}>
                <span style={{fontWeight:600,color:"var(--text2)",fontSize:13}}>{r.step}</span>
                <span style={{fontSize:13,color:"var(--text3)",fontFamily:r.detail.includes(":")?"'IBM Plex Mono',monospace":"inherit"}}>{r.detail}</span>
              </div>
            ))}
          </div>
          <div style={{marginTop:14,background:"#fb923c15",border:"1px solid #fb923c40",borderRadius:6,padding:"10px 14px",fontSize:13,color:"#fb923c"}}>
            ًں’، If expense was in USD: Enter USD Amount and Exchange Rate in the USD section. The EGP equivalent auto-fills the Debit field. The system stores both USD and EGP for the record.
          </div>
        </div>
      )}

      {/* SALARY ACCRUAL GUIDE */}
      {step==="salary" && (
        <div className="card">
          <div style={{fontSize:15,fontWeight:700,color:"var(--text0)",marginBottom:4}}>How to Post Monthly Salary Accrual</div>
          <div style={{fontSize:13,color:"var(--text4)",marginBottom:14}}>Based on actual payroll data from Enevo Excel. Post 8 lines under the SAME Entry No.</div>
          <div style={{background:"var(--bg2)",borderRadius:6,padding:"12px 16px",marginBottom:12,fontSize:13,color:"var(--text2)"}}>
            <strong>Staff table total EGP salary:</strong> {fmtEGP(totalSalaryEGP)} / month آ· <strong>{activeStaff.length} active staff</strong>
          </div>
          <div style={{overflowX:"auto"}}>
            <table style={{width:"100%",borderCollapse:"collapse",fontSize:13}}>
              <thead><tr style={{background:"var(--bg2)"}}>
                {["#","Account","Main Account","Statement","Dr","Cr","Notes"].map(h=>(
                  <th key={h} style={{padding:"6px 10px",textAlign:["Dr","Cr"].includes(h)?"right":"left",color:"var(--text3)",fontSize:13}}>{h}</th>
                ))}
              </tr></thead>
              <tbody>
                {[
                  {n:1,acct:"Salaries-Cost",main:"Operating Costs",stmt:"P&L",dr:"Cost staff gross",cr:"â€”",note:"Dr side: total gross for engineers/leads"},
                  {n:2,acct:"Social Insurance-Cost",main:"Operating Costs",stmt:"P&L",dr:"SI cost staff",cr:"â€”",note:"24.75% of cost staff gross"},
                  {n:3,acct:"Salaries-Administrative",main:"Administrative expenses",stmt:"P&L",dr:"Admin gross",cr:"â€”",note:"Dr side: admin/management gross"},
                  {n:4,acct:"Social Insurance-Administrative",main:"Administrative expenses",stmt:"P&L",dr:"SI admin",cr:"â€”",note:"24.75% of admin gross"},
                  {n:5,acct:"Accrued Salaries",main:"Accrued Expenses",stmt:"BS",dr:"â€”",cr:"Net payable",note:"Cr: total gross âˆ’ tax âˆ’ SI"},
                  {n:6,acct:"Payroll Tax",main:"Tax and Social Insurance Authority",stmt:"BS",dr:"â€”",cr:"Tax amount",note:"Per Egyptian income tax brackets"},
                  {n:7,acct:"Social Insurance Authority",main:"Tax and Social Insurance Authority",stmt:"BS",dr:"â€”",cr:"SI amount",note:"Employee portion (11.25%)"},
                  {n:8,acct:"Martyrs Families Fund",main:"Tax and Social Insurance Authority",stmt:"BS",dr:"â€”",cr:"MFF amount",note:"Small fixed deduction"},
                ].map(r=>(
                  <tr key={r.n} style={{borderBottom:"1px solid var(--border3)"}}>
                    <td style={{padding:"6px 10px",color:"var(--text4)",fontFamily:"'IBM Plex Mono',monospace"}}>{r.n}</td>
                    <td style={{padding:"6px 10px",color:"var(--text1)",fontWeight:500,fontSize:13}}>{r.acct}</td>
                    <td style={{padding:"6px 10px",color:"var(--text3)",fontSize:13}}>{r.main}</td>
                    <td style={{padding:"6px 10px"}}>
                      <span style={{fontSize:11,color:r.stmt==="BS"?"#38bdf8":"#a78bfa",fontWeight:700,background:r.stmt==="BS"?"#38bdf820":"#a78bfa20",padding:"1px 5px",borderRadius:3}}>{r.stmt}</span>
                    </td>
                    <td style={{padding:"6px 10px",color:"#34d399",fontSize:13,textAlign:"right"}}>{r.dr}</td>
                    <td style={{padding:"6px 10px",color:"#f87171",fontSize:13,textAlign:"right"}}>{r.cr}</td>
                    <td style={{padding:"6px 10px",color:"var(--text4)",fontSize:12}}>{r.note}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div style={{marginTop:12,background:"#a78bfa15",border:"1px solid #a78bfa40",borderRadius:6,padding:"10px 14px",fontSize:13,color:"#a78bfa"}}>
            ًں’، The Payroll Report (under Reports) shows you last month's posted amounts to use as reference. Compare staff table salaries to the accrual each month.
          </div>
        </div>
      )}

      {/* REVENUE INVOICE GUIDE */}
      {step==="revenue" && (
        <div className="card">
          <div style={{fontSize:15,fontWeight:700,color:"var(--text0)",marginBottom:14}}>How to Post a Revenue Invoice</div>
          <div style={{background:"var(--bg2)",borderRadius:6,padding:"12px 16px",marginBottom:14,fontSize:13,color:"var(--text2)"}}>
            <strong>Example:</strong> Invoice EGY-002 for Feb-2026 = $106,427.36 USD @ 46.90 EGP/$ = EGP 4,991,442.18
          </div>
          {[
            {step:"Entry Type",detail:"Revenue"},
            {step:"Line 1 â€” Receivable",detail:"Account: Enevo Group S.R.L. آ· Main: Customers آ· BS آ· Debit: EGP amount آ· Credit: 0"},
            {step:"Line 2 â€” Revenue",detail:"Account: Revenue آ· Main: Revenue آ· P&L آ· Debit: 0 آ· Credit: EGP amount"},
            {step:"USD Fields",detail:"Enter USD invoice amount + exchange rate on Line 1. System stores both."},
            {step:"Description",detail:"Accrued Invoice NO. EGY-002 for Feb-2026 equivalent to $106,427.36 USD"},
          ].map((r,i)=>(
            <div key={i} style={{display:"grid",gridTemplateColumns:"160px 1fr",gap:8,borderBottom:"1px solid var(--border3)",padding:"8px 0"}}>
              <span style={{fontWeight:600,color:"var(--text2)",fontSize:13}}>{r.step}</span>
              <span style={{fontSize:13,color:"var(--text3)"}}>{r.detail}</span>
            </div>
          ))}
        </div>
      )}

      {/* ASSET PURCHASE GUIDE */}
      {step==="asset" && (
        <div className="card">
          <div style={{fontSize:15,fontWeight:700,color:"var(--text0)",marginBottom:14}}>How to Post an Asset Purchase</div>
          <div style={{background:"var(--bg2)",borderRadius:6,padding:"12px 16px",marginBottom:14,fontSize:13,color:"var(--text2)"}}>
            <strong>Example:</strong> 3 laptops purchased for EGP 273,600 (from Eng Shady custody).
          </div>
          <div style={{fontSize:13,color:"var(--text3)",marginBottom:12}}>Step 1 â€” Post Journal Entry (Fixed Assets + Custody):</div>
          {[
            {step:"Line 1",detail:"Account: Computers and Programs آ· Main: Fixed Assets آ· BS آ· Debit: 273,600 آ· Credit: 0"},
            {step:"Line 2",detail:"Account: Eng Shady آ· Main: Cash Custody آ· BS آ· Debit: 273,600 آ· Credit: 0"},
          ].map((r,i)=>(
            <div key={i} style={{display:"grid",gridTemplateColumns:"80px 1fr",gap:8,borderBottom:"1px solid var(--border3)",padding:"7px 0"}}>
              <span style={{fontWeight:600,color:"var(--text2)",fontSize:13}}>{r.step}</span>
              <span style={{fontSize:13,color:"var(--text3)",fontFamily:"'IBM Plex Mono',monospace",fontSize:13}}>{r.detail}</span>
            </div>
          ))}
          <div style={{fontSize:13,color:"var(--text3)",margin:"12px 0 8px"}}>Step 2 â€” Add to Fixed Asset Register (contact admin to add row to finance_fixed_assets table with asset name, category, cost, purchase date, useful life).</div>
          <div style={{background:"#34d39915",border:"1px solid #34d39940",borderRadius:6,padding:"10px 14px",fontSize:13,color:"#34d399"}}>
            âœ… The Fixed Assets tab calculates depreciation automatically from the asset register. No manual entry needed for depreciation â€” it's calculated in real-time.
          </div>
        </div>
      )}
    </div>
  );
}



/* â•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گ
   FINANCE TAB â€” main container
   â•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گ */
/* â•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گ
   ACTIVITY LOG TAB â€” admin only
   â•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گ */
function ActivityLogTab({activityLog, archiveLog, loading, archiveLoading, archiveLoaded,
  onRefresh, onArchive, onLoadArchive, onPruneArchive, retentionDays, setRetentionDays}) {

  const [tab,        setTab]       = React.useState("live");   // live | archive
  const [search,     setSearch]    = React.useState("");
  const [modFilter,  setModFilter] = React.useState("ALL");
  const [actFilter,  setActFilter] = React.useState("ALL");
  const [userFilter, setUserFilter]= React.useState("ALL");
  const [dateFrom,   setDateFrom]  = React.useState("");
  const [dateTo,     setDateTo]    = React.useState("");
  const [page,       setPage]      = React.useState(0);
  const PAGE_SIZE = 100;

  const source = tab==="live" ? activityLog : archiveLog;

  const modules = React.useMemo(()=>["ALL",...new Set(source.map(l=>l.module))].sort(),[source]);
  const actions = React.useMemo(()=>["ALL",...new Set(source.map(l=>l.action))].sort(),[source]);
  const users   = React.useMemo(()=>["ALL",...new Set(source.map(l=>l.user_name).filter(Boolean))].sort(),[source]);

  // Reset page when filters change â€” use separate effect, NOT inside useMemo
  React.useEffect(()=>{ setPage(0); },[source,modFilter,actFilter,userFilter,dateFrom,dateTo,search]);

  const filtered = React.useMemo(()=>{
    return source.filter(l=>{
      if(modFilter!=="ALL"  && l.module!==modFilter)    return false;
      if(actFilter!=="ALL"  && l.action!==actFilter)    return false;
      if(userFilter!=="ALL" && l.user_name!==userFilter) return false;
      // Compare date portion only â€” avoids timezone-suffix corruption in ISO strings
      const entryDate = l.created_at ? l.created_at.slice(0,10) : "";
      if(dateFrom && entryDate && entryDate < dateFrom) return false;
      if(dateTo   && entryDate && entryDate > dateTo)   return false;
      if(search && !`${l.detail||""} ${l.user_name||""} ${l.module} ${l.action}`.toLowerCase().includes(search.toLowerCase())) return false;
      return true;
    });
  // eslint-disable-next-line
  },[source,modFilter,actFilter,userFilter,dateFrom,dateTo,search]);

  const page_count = Math.ceil(filtered.length / PAGE_SIZE);
  const visible    = filtered.slice(page*PAGE_SIZE, (page+1)*PAGE_SIZE);

  const actionColor = a=>({
    CREATE:"#34d399",UPDATE:"#38bdf8",DELETE:"#f87171",
    LOGIN:"#a78bfa", LOGOUT:"#fb923c",EXPORT:"#facc15",IMPORT:"#34d399"
  }[a]||"var(--text3)");
  const moduleColor = m=>({
    Journal:"#a78bfa",TimeEntry:"#38bdf8",Staff:"#fb923c",
    Project:"#34d399",Engineer:"#38bdf8",Expense:"#facc15",
    Auth:"#f87171",   Finance:"#34d399", Import:"#fb923c"
  }[m]||"var(--text3)");

  const exportCSV = ()=>{
    const rows = [
      ["Timestamp","User","Role","Action","Module","Detail","Meta"],
      ...filtered.map(l=>[
        l.created_at ? new Date(l.created_at).toLocaleString("en-EG") : "",
        l.user_name||"", l.user_role||"", l.action||"", l.module||"",
        '"' + (l.detail||"").replace(/"/g,'""') + '"',
        '"' + (l.meta||"").replace(/"/g,'""') + '"',
      ])
    ].map(r=>r.join(",")).join("\n");
    const a=Object.assign(document.createElement("a"),{
      href:URL.createObjectURL(new Blob([rows],{type:"text/csv"})),
      download:`EC-ERP_ActivityLog_${tab}_${new Date().toISOString().slice(0,10)}.csv`
    });
    a.click();
  };

  const resetFilters=()=>{ setSearch("");setModFilter("ALL");setActFilter("ALL");setUserFilter("ALL");setDateFrom("");setDateTo(""); };

  const hasFilters = search||modFilter!=="ALL"||actFilter!=="ALL"||userFilter!=="ALL"||dateFrom||dateTo;

  return(
    <div style={{display:"grid",gap:16}}>

      {/* â”€â”€ Pill nav â”€â”€ */}
      <div style={{display:"flex",gap:2,background:"var(--bg1)",borderRadius:10,padding:4,border:"1px solid var(--border)",width:"fit-content"}}>
        {[
          {id:"live",    label:"Live Log",    count:activityLog.length},
          {id:"archive", label:"Archive",     count:archiveLog.length},
        ].map(t=>{
          const active=tab===t.id;
          return(
            <button key={t.id} onClick={()=>{setTab(t.id);resetFilters();setPage(0);}}
              style={{padding:"8px 16px",borderRadius:7,border:"none",cursor:"pointer",fontSize:14,fontWeight:active?700:500,
                fontFamily:"'IBM Plex Sans',sans-serif",transition:"all .15s",
                background:active?"linear-gradient(135deg,#0ea5e9,#0369a1)":"transparent",
                color:active?"#fff":"var(--text2)"}}>
              {t.label} <span style={{fontFamily:"'IBM Plex Mono',monospace",fontSize:12,opacity:.8}}>({t.count})</span>
            </button>
          );
        })}
      </div>

      {/* â”€â”€ Archive management card â”€â”€ */}
      {tab==="live"&&(()=>{
        const cutoffDate=new Date();cutoffDate.setDate(cutoffDate.getDate()-retentionDays);
        const cutoffStr=cutoffDate.toISOString().slice(0,10);
        // Count archivable: entries with real timestamp older than cutoff OR null timestamp (legacy)
        const archivable=activityLog.filter(l=>
          !l.created_at || l.created_at.slice(0,10)<cutoffStr
        );
        return(
        <div className="card" style={{padding:0,overflow:"hidden"}}>
          <div style={{background:"var(--bg0)",borderBottom:"1px solid var(--border)",padding:"12px 20px",display:"flex",alignItems:"center",gap:12,flexWrap:"wrap"}}>
            <div style={{fontSize:15,fontWeight:700,color:"var(--text0)"}}>Archive Management</div>
            <div style={{fontSize:13,color:"var(--text3)",marginLeft:"auto"}}>Live table stays fast آ· Archive keeps data forever</div>
          </div>
          <div style={{padding:"12px 20px",display:"flex",gap:10,alignItems:"center",flexWrap:"wrap"}}>
            <span style={{fontSize:14,color:"var(--text2)"}}>Move entries older than</span>
            <select value={retentionDays} onChange={e=>setRetentionDays(+e.target.value)}
              style={{width:"auto",padding:"6px 10px",fontSize:14}}>
              {[7,14,30,60,90,180].map(d=><option key={d} value={d}>{d} days</option>)}
            </select>
            <span style={{fontSize:14,color:"var(--text2)"}}>to archive</span>
            <span style={{
              fontSize:13,padding:"3px 10px",borderRadius:6,fontFamily:"'IBM Plex Mono',monospace",fontWeight:700,
              background:archivable.length>0?"#f8711820":"var(--bg3)",
              color:archivable.length>0?"#f87171":"var(--text4)",
              border:`1px solid ${archivable.length>0?"#f8711840":"var(--border)"}`,
            }}>
              {archivable.length>0?`${archivable.length} eligible`:"0 eligible â€” all recent"}
            </span>
            <button onClick={onArchive}
              style={{background:"#f8711820",border:"1px solid #f8711840",borderRadius:7,padding:"7px 16px",color:"#f87171",cursor:"pointer",fontSize:14,fontWeight:600,fontFamily:"'IBM Plex Sans',sans-serif"}}>
              â¬† Archive Now
            </button>
            <button onClick={onPruneArchive}
              style={{background:"var(--bg2)",border:"1px solid var(--border)",borderRadius:7,padding:"7px 14px",color:"var(--text3)",cursor:"pointer",fontSize:14,fontFamily:"'IBM Plex Sans',sans-serif",marginLeft:"auto"}}>
              ًں—‘ Prune &gt;1yr
            </button>
          </div>
          {archivable.length===0&&activityLog.length>0&&(
            <div style={{padding:"8px 20px 12px",fontSize:13,color:"var(--text4)"}}>
              â„¹ All {activityLog.length} entries in the live log are within the last {retentionDays} days. Try reducing the retention window above, or this count reflects what is loaded (up to 5000 rows â€” the DB may have older entries that will still be found during archive).
            </div>
          )}
        </div>
        );
      })()}

      {/* â”€â”€ Archive load prompt â”€â”€ */}
      {tab==="archive"&&!archiveLoaded&&!archiveLoading&&(
        <div style={{textAlign:"center",padding:24,background:"var(--bg2)",borderRadius:8,border:"1px solid var(--border3)"}}>
          <div style={{fontSize:14,color:"var(--text2)",marginBottom:10}}>Archive not loaded â€” kept separate to keep the UI fast.</div>
          <button className="bp" onClick={onLoadArchive}>Load Archive Data</button>
        </div>
      )}
      {tab==="archive"&&archiveLoaded&&archiveLog.length===0&&!archiveLoading&&(
        <div style={{textAlign:"center",padding:40,color:"var(--text4)"}}>No archived entries yet.</div>
      )}
      {tab==="archive"&&archiveLoading&&(
        <div style={{textAlign:"center",padding:24,color:"var(--text4)"}}>Loading archiveâ€¦</div>
      )}

      {/* â”€â”€ Filter toolbar â”€â”€ */}
      {(tab==="live"||(tab==="archive"&&archiveLog.length>0))&&(
      <div className="card" style={{padding:0,overflow:"hidden"}}>
        <div style={{background:"var(--bg0)",borderBottom:"1px solid var(--border)",padding:"12px 20px",display:"flex",justifyContent:"space-between",alignItems:"center"}}>
          <div style={{fontSize:15,fontWeight:700,color:"var(--text0)"}}>
            {tab==="live"?"Live Log":"Archive"}
            <span style={{fontFamily:"'IBM Plex Mono',monospace",fontSize:13,fontWeight:400,color:"var(--text3)",marginLeft:8}}>{filtered.length} of {source.length} entries</span>
          </div>
          <div style={{display:"flex",gap:8,alignItems:"center"}}>
            <button className="be" onClick={exportCSV}>â¬‡ Export CSV</button>
            <button className="bp" onClick={onRefresh}>â†؛ Refresh</button>
          </div>
        </div>
        <div style={{padding:"12px 20px",display:"flex",gap:8,flexWrap:"wrap",alignItems:"center"}}>
        <input placeholder="ًں”چ Searchâ€¦" value={search} onChange={e=>setSearch(e.target.value)}
          style={{width:200,padding:"7px 12px",fontSize:14}}/>
        <select value={modFilter} onChange={e=>setModFilter(e.target.value)} style={{width:"auto",padding:"7px 12px",fontSize:14}}>
          <option value="ALL">All Modules</option>
          {modules.filter(m=>m!=="ALL").map(m=><option key={m}>{m}</option>)}
        </select>
        <select value={actFilter} onChange={e=>setActFilter(e.target.value)} style={{width:"auto",padding:"7px 12px",fontSize:14}}>
          <option value="ALL">All Actions</option>
          {actions.filter(a=>a!=="ALL").map(a=><option key={a}>{a}</option>)}
        </select>
        <select value={userFilter} onChange={e=>setUserFilter(e.target.value)} style={{width:"auto",padding:"7px 12px",fontSize:14}}>
          <option value="ALL">All Users</option>
          {users.filter(u=>u!=="ALL").map(u=><option key={u}>{u}</option>)}
        </select>
        <input type="date" value={dateFrom} onChange={e=>setDateFrom(e.target.value)} title="From date" style={{width:"auto",padding:"7px 10px",fontSize:14}}/>
        <input type="date" value={dateTo} onChange={e=>setDateTo(e.target.value)} title="To date" style={{width:"auto",padding:"7px 10px",fontSize:14}}/>
        {hasFilters&&<button onClick={resetFilters} className="bg" style={{fontSize:13}}>âœ• Clear</button>}
        </div>
      </div>
      )}

      {/* â”€â”€ KPI strip (live only) â”€â”€ */}
      {tab==="live"&&(
        <div style={{display:"grid",gridTemplateColumns:"repeat(5,1fr)",gap:12}}>
          {[
            {l:"Live Events",  v:activityLog.length,                                                                                              c:"var(--info)",  sub:"Total logged"},
            {l:"Logins Today", v:activityLog.filter(l=>l.created_at&&new Date(l.created_at).toDateString()===new Date().toDateString()&&l.action==="LOGIN").length, c:"#a78bfa", sub:"Active sessions"},
            {l:"Creates",      v:activityLog.filter(l=>l.action==="CREATE").length,                                                               c:"#34d399",      sub:"New records"},
            {l:"Deletes",      v:activityLog.filter(l=>l.action==="DELETE").length,                                                               c:"#f87171",      sub:"Removals"},
            {l:"Exports",      v:activityLog.filter(l=>l.action==="EXPORT"||l.action==="IMPORT").length,                                          c:"#facc15",      sub:"Reports & imports"},
          ].map((k,i)=>(
            <div key={i} style={{background:"var(--bg1)",border:"1px solid var(--border)",borderRadius:12,padding:"16px",borderTop:`3px solid ${k.c}`}}>
              <div style={{fontSize:12,fontWeight:700,color:"var(--text4)",textTransform:"uppercase",letterSpacing:".07em",marginBottom:8}}>{k.l}</div>
              <div style={{fontFamily:"'IBM Plex Mono',monospace",fontSize:24,fontWeight:800,color:k.c,marginBottom:4}}>{k.v}</div>
              <div style={{fontSize:12,color:"var(--text4)"}}>{k.sub}</div>
            </div>
          ))}
        </div>
      )}

      {/* â”€â”€ Table â”€â”€ */}
      {(loading&&tab==="live") ? (
        <div style={{textAlign:"center",padding:40,color:"var(--text4)"}}>Loadingâ€¦</div>
      ) : (tab==="live"||archiveLog.length>0) ? (
        filtered.length===0 ? (
          <div style={{textAlign:"center",padding:40,color:"var(--text4)"}}>
            {source.length===0 ? "No events yet." : "No results match your filters."}
          </div>
        ) : (
        <div className="card" style={{padding:0,overflow:"hidden"}}>
          <div style={{overflowX:"auto"}}>
            <table style={{width:"100%",borderCollapse:"collapse",fontSize:13}}>
              <thead><tr style={{background:"var(--bg2)"}}>
                {["Timestamp","User","Role","Action","Module","Detail","Meta"].map(h=>(
                  <th key={h} style={{padding:"7px 12px",textAlign:"left",color:"var(--text3)",fontWeight:600,fontSize:13,borderBottom:"1px solid var(--border3)",whiteSpace:"nowrap"}}>{h}</th>
                ))}
              </tr></thead>
              <tbody>
                {visible.map((l,i)=>{
                  let meta={};
                  try{meta=JSON.parse(l.meta||"{}");}catch(e){}
                  const ts = l.created_at
                    ? new Date(l.created_at).toLocaleString("en-EG",{day:"2-digit",month:"short",year:"numeric",hour:"2-digit",minute:"2-digit",second:"2-digit",hour12:false})
                    : "â€”";
                  return(
                    <tr key={l.id||i} style={{borderBottom:"1px solid var(--border3)",background:i%2===0?"transparent":"var(--bg1)"}}>
                      <td style={{padding:"6px 12px",fontFamily:"'IBM Plex Mono',monospace",fontSize:12,color:"var(--text4)",whiteSpace:"nowrap"}}>{ts}</td>
                      <td style={{padding:"6px 12px",color:"var(--text1)",fontWeight:500,fontSize:13,whiteSpace:"nowrap"}}>{l.user_name||"â€”"}</td>
                      <td style={{padding:"6px 12px"}}><span style={{fontSize:11,padding:"2px 5px",borderRadius:3,background:"var(--bg2)",color:"var(--info)",fontWeight:600}}>{l.user_role||"â€”"}</span></td>
                      <td style={{padding:"6px 12px"}}><span style={{fontSize:12,padding:"2px 7px",borderRadius:4,background:actionColor(l.action)+"20",color:actionColor(l.action),fontWeight:700}}>{l.action}</span></td>
                      <td style={{padding:"6px 12px"}}><span style={{fontSize:12,padding:"2px 7px",borderRadius:4,background:moduleColor(l.module)+"15",color:moduleColor(l.module),fontWeight:600}}>{l.module}</span></td>
                      <td style={{padding:"6px 12px",color:"var(--text2)",fontSize:13,maxWidth:280,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}} title={l.detail}>{l.detail||"â€”"}</td>
                      <td style={{padding:"6px 12px",fontFamily:"'IBM Plex Mono',monospace",fontSize:11,color:"var(--text4)",maxWidth:180,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}
                        title={JSON.stringify(meta)}>
                        {Object.keys(meta).length>0 ? Object.entries(meta).slice(0,3).map(([k,v])=>`${k}:${v}`).join(" آ· ") : ""}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          {page_count>1&&(
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"10px 16px",borderTop:"1px solid var(--border3)",background:"var(--bg2)"}}>
              <span style={{fontSize:13,color:"var(--text4)"}}>Showing {page*PAGE_SIZE+1}â€“{Math.min((page+1)*PAGE_SIZE,filtered.length)} of {filtered.length}</span>
              <div style={{display:"flex",gap:4}}>
                {[{l:"آ«",v:0},{l:"â€¹",v:page-1}].map(b=>(
                  <button key={b.l} onClick={()=>setPage(Math.max(0,b.v))} disabled={page===0}
                    style={{padding:"3px 8px",background:"var(--bg1)",border:"1px solid var(--border3)",borderRadius:4,color:"var(--text2)",cursor:page===0?"not-allowed":"pointer",fontSize:13,opacity:page===0?0.4:1}}>{b.l}</button>
                ))}
                {Array.from({length:Math.min(7,page_count)},(_,i)=>{
                  const pg=Math.max(0,Math.min(page_count-7,page-3))+i;
                  return <button key={pg} onClick={()=>setPage(pg)}
                    style={{padding:"3px 8px",background:pg===page?"var(--accent)":"var(--bg1)",border:`1px solid ${pg===page?"var(--accent)":"var(--border3)"}`,borderRadius:4,color:pg===page?"#fff":"var(--text2)",cursor:"pointer",fontSize:13}}>{pg+1}</button>;
                })}
                {[{l:"â€؛",v:page+1},{l:"آ»",v:page_count-1}].map(b=>(
                  <button key={b.l} onClick={()=>setPage(Math.min(page_count-1,b.v))} disabled={page===page_count-1}
                    style={{padding:"3px 8px",background:"var(--bg1)",border:"1px solid var(--border3)",borderRadius:4,color:"var(--text2)",cursor:page===page_count-1?"not-allowed":"pointer",fontSize:13,opacity:page===page_count-1?0.4:1}}>{b.l}</button>
                ))}
              </div>
            </div>
          )}
        </div>
        )
      ) : null}
    </div>
  );
}


function FinanceTab({staff, entries, expenses, projects, engineers, egpRate, setEgpRate,
  finTab, setFinTab, finMonth, setFinMonth, finYear, setFinYear,
  setEditStaff, setShowStaffModal, setEditExp, setNewExp, setShowExpModal,
  deleteStaff, deleteExpense, fmtCurrency, buildFinancePDF, isAdmin, isSenior, isAcct,
  journalEntries, setJournalEntries, fixedAssets, journalLoading, assetsLoading,
  finSubTab, setFinSubTab, accounts, showToast, logAction, supabase, showConfirm}){

  // staffSearch lives here (function scope) so it's not inside the salaries IIFE
  const [staffSearch, setStaffSearch] = React.useState("");
  // Pay slip state â€” must be at FinanceTab top level (Rules of Hooks)
  const [psAdj,       setPsAdj]       = React.useState({});
  const [psSelectAll, setPsSelectAll] = React.useState(true);
  const [psSelected,  setPsSelected]  = React.useState(new Set());

  const derived = useMemo(()=>{
    const activeStaff=staff.filter(s=>s.active!==false);
const totalPayrollUSD=activeStaff.reduce((s,x)=>s+(x.salary_usd||0),0);
const totalPayrollEGP=activeStaff.reduce((s,x)=>s+(x.salary_egp||0),0);

const toUSD=(usd,egp,rate)=>(usd&&usd>0)?usd:((egp||0)/(rate||egpRate||1));

const allJoinDates=activeStaff.map(s=>s.join_date).filter(Boolean).map(d=>new Date(d));
const companyStart=allJoinDates.length>0?new Date(Math.min(...allJoinDates)):null;

const wasEmployed=(s,y,m)=>{
  const monthStart=new Date(y,m,1);
  const monthEnd=new Date(y,m+1,0);
  const effectiveJoin=s.join_date?new Date(s.join_date+"T12:00:00"):companyStart;
  if(effectiveJoin&&effectiveJoin>monthEnd) return false;
  if(s.termination_date){
    const term=new Date(s.termination_date+"T12:00:00");
    const mStart=new Date(y,m,1);
    if(term<mStart) return false;
  }
  return true;
};

const prorateStaff=(s,y,m)=>{
  const daysInMonth=new Date(y,m+1,0).getDate();
  const mStart=new Date(y,m,1); const mEnd=new Date(y,m+1,0);
  const join=s.join_date?new Date(s.join_date+"T12:00:00"):mStart;
  const term=s.termination_date?new Date(s.termination_date+"T12:00:00"):mEnd;
  const effStart=join>mStart?join:mStart;
  const effEnd=term<mEnd?term:mEnd;
  const days=Math.max(0,Math.floor((effEnd-effStart)/(86400000))+1);
  return days/daysInMonth;
};

const staffThisMonth=activeStaff.filter(s=>wasEmployed(s,finYear,finMonth));
const monthExp=expenses.filter(e=>+e.month===finMonth&&+e.year===finYear);
const monthExpNonSalary=monthExp.filter(e=>e.category!=="Salaries");
const toUSDexp=(e)=>{
  if(e.amount_usd>0) return e.amount_usd;
  if(e.amount_egp>0&&e.entry_rate>0) return e.amount_egp/e.entry_rate;
  return 0;
};
const totalExpUSD=monthExpNonSalary.reduce((s,e)=>s+toUSDexp(e),0);
const totalExpEGP=monthExpNonSalary.reduce((s,e)=>s+(e.amount_egp||0),0);
const salaryCatUSD=monthExp.filter(e=>e.category==="Salaries").reduce((s,e)=>s+toUSD(e.amount_usd,e.amount_egp,e.entry_rate),0);
const monthRevUSD=entries.filter(e=>{const d=new Date(e.date+"T12:00:00");return d.getFullYear()===finYear&&d.getMonth()===finMonth&&e.entry_type==="work"&&projects.find(p=>String(p.id)===String(e.project_id)&&p.billable!==false);}).reduce((s,e)=>s+e.hours*(e.rate||0),0);

const totalPayrollUSDeff=staffThisMonth.reduce((s,x)=>s+toUSD(x.salary_usd,x.salary_egp)*prorateStaff(x,finYear,finMonth),0);
const totalCostUSD=totalPayrollUSDeff+salaryCatUSD+totalExpUSD;
const netPL=monthRevUSD-totalCostUSD;
const netColor=netPL>=0?"#34d399":"#f87171";

const deptMap={};
staffThisMonth.forEach(s=>{
  const d=s.department||"Other";
  if(!deptMap[d]) deptMap[d]={dept:d,count:0,usd:0,egp:0};
  deptMap[d].count++;
  const prorate=prorateStaff(s,finYear,finMonth);
  deptMap[d].usd+=toUSD(s.salary_usd,s.salary_egp)*prorate;
  deptMap[d].egp+=(s.salary_egp||0)*prorate;
});
const deptList=Object.values(deptMap).sort((a,b)=>b.usd-a.usd);

const ytdData=Array.from({length:finMonth+1},(_,m)=>{
  const mStaff=activeStaff.filter(s=>wasEmployed(s,finYear,m));
  const mExp=expenses.filter(e=>+e.month===m&&+e.year===finYear);
  const mMonthExpNS=mExp.filter(e=>e.category!=="Salaries");
  const mSalaryCat=mExp.filter(e=>e.category==="Salaries").reduce((s,e)=>s+toUSD(e.amount_usd,e.amount_egp,e.entry_rate),0);
  const mPayroll=mStaff.reduce((s,x)=>s+toUSD(x.salary_usd,x.salary_egp)*prorateStaff(x,finYear,m),0);
  const mRevUSD=entries.filter(e=>{const d=new Date(e.date+"T12:00:00");return d.getFullYear()===finYear&&d.getMonth()===m&&e.entry_type==="work"&&projects.find(p=>String(p.id)===String(e.project_id)&&p.billable!==false);}).reduce((s,e)=>s+e.hours*(e.rate||0),0);
  const mExpUSD=mMonthExpNS.reduce((s,e)=>s+toUSDexp(e),0);
  return{m,rev:mRevUSD,cost:mPayroll+mSalaryCat+mExpUSD,net:mRevUSD-(mPayroll+mSalaryCat+mExpUSD)};
});
const ytdRev=ytdData.reduce((s,m)=>s+m.rev,0);
const ytdCost=ytdData.reduce((s,m)=>s+m.cost,0);
const ytdNet=ytdRev-ytdCost;

const projProfit=projects.map(p=>{
  const projEntries=entries.filter(e=>String(e.project_id)===String(p.id)&&e.entry_type==="work");
  const rev=projEntries.reduce((s,e)=>s+e.hours*e.rate,0);
  const cost=projEntries.reduce((s,e)=>{
    const eng=engineers.find(en=>en.id===e.engineer_id);
    return s+(eng?toUSD(eng.salary_usd,eng.salary_egp)*(e.hours/160):0);
  },0);
  return{...p,rev,cost,net:rev-cost};
}).filter(p=>p.rev>0||p.cost>0);

    return {activeStaff,totalPayrollUSD,totalPayrollEGP,toUSD,companyStart,wasEmployed,
      staffThisMonth,monthExp,monthExpNonSalary,totalExpUSD,totalExpEGP,salaryCatUSD,
      monthRevUSD,totalPayrollUSDeff,totalCostUSD,netPL,netColor,deptList,
      ytdData,ytdRev,ytdCost,ytdNet,projProfit,prorateStaff
    };
  },[staff,entries,expenses,projects,engineers,egpRate,finMonth,finYear]);

  const {activeStaff,totalPayrollUSD,totalPayrollEGP,toUSD,
    staffThisMonth,monthExp,monthExpNonSalary,totalExpUSD,totalExpEGP,salaryCatUSD,
    monthRevUSD,totalPayrollUSDeff,totalCostUSD,netPL,netColor,deptList,
    ytdData,ytdRev,ytdCost,ytdNet,projProfit,wasEmployed,prorateStaff
  } = derived;

  // â”€â”€ P&L data â€” useMemo at component top level (Rules of Hooks: never inside IIFEs) â”€â”€
  const plData = useMemo(()=>{
    const jRevenue  = journalEntries.filter(e=>e.main_account==="Revenue").reduce((s,e)=>s+(+e.credit||0),0);
    const jExpenses = journalEntries.filter(e=>e.statement_type==="Profit & Loss Sheet"&&+e.debit>0);
    const jTotalExp = jExpenses.reduce((s,e)=>s+(+e.debit),0);
    const jNetPL    = jRevenue - jTotalExp;
    const jRevUSD   = journalEntries.find(e=>e.main_account==="Revenue"&&+e.usd_amount>0)?.usd_amount||0;
    const jRevRate  = journalEntries.find(e=>e.main_account==="Revenue"&&+e.exchange_rate>0)?.exchange_rate||egpRate;
    const allMonths = [...new Set(journalEntries.map(e=>e.month))].sort((a,b)=>+a-+b);
    const monthPL   = allMonths.map(mo=>({
      mo,
      rev: journalEntries.filter(e=>e.main_account==="Revenue"&&+e.month===mo).reduce((s,e)=>s+(+e.credit),0),
      exp: journalEntries.filter(e=>e.statement_type==="Profit & Loss Sheet"&&+e.debit>0&&+e.month===mo).reduce((s,e)=>s+(+e.debit),0),
    })).map(m=>({...m,net:m.rev-m.exp}));
    const expByCategory = {};
    jExpenses.forEach(e=>{
      if(!expByCategory[e.main_account]) expByCategory[e.main_account]={cat:e.main_account,total:0,items:{}};
      if(!expByCategory[e.main_account].items[e.account_name]) expByCategory[e.main_account].items[e.account_name]={name:e.account_name,total:0};
      expByCategory[e.main_account].items[e.account_name].total += +e.debit;
      expByCategory[e.main_account].total += +e.debit;
    });
    const billableEntries = entries.filter(e=>e.entry_type==="work"&&projects.find(p=>String(p.id)===String(e.project_id)&&p.billable!==false));
    const totalBillableHrs = billableEntries.reduce((s,e)=>s+e.hours,0);
    const totalBillableUSD = billableEntries.reduce((s,e)=>s+e.hours*(e.rate||0),0);
    const engHours = {};
    engineers.forEach(eng=>{
      const hrs=billableEntries.filter(e=>String(e.engineer_id)===String(eng.id)).reduce((s,e)=>s+e.hours,0);
      if(hrs>0) engHours[eng.id]={name:eng.name,hrs,
        usd:billableEntries.filter(e=>String(e.engineer_id)===String(eng.id)).reduce((s,e)=>s+e.hours*(e.rate||0),0)};
    });
    return {jRevenue,jExpenses,jTotalExp,jNetPL,jRevUSD,jRevRate,allMonths,monthPL,
            expByCategory,billableEntries,totalBillableHrs,totalBillableUSD,engHours};
  },[journalEntries,entries,engineers,projects,egpRate]);

  const {jRevenue,jExpenses,jTotalExp,jNetPL,jRevUSD,jRevRate,allMonths,monthPL,
         expByCategory,billableEntries,totalBillableHrs,totalBillableUSD,engHours} = plData;

  const MONTHS_ = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];

  return(
<div style={{display:"grid",gap:20,padding:"4px 0"}}>

  {/* â”€â”€ Page header â”€â”€ */}
  <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",flexWrap:"wrap",gap:14}}>
    <div>
      <div style={{fontSize:11,fontWeight:700,color:"var(--text4)",textTransform:"uppercase",letterSpacing:".1em",marginBottom:4}}>FINANCE & ACCOUNTING</div>
      <h1 style={{fontSize:26,fontWeight:800,color:"var(--text0)",lineHeight:1}}>Finance Panel</h1>
      <p style={{color:"var(--text3)",fontSize:14,marginTop:4,fontFamily:"'IBM Plex Mono',monospace"}}>
        {isAdmin?"Full accounting access آ· journal, payroll, P&L":isAcct?"Full accounting access آ· post entries, manage payroll, view reports":"Read-only آ· all figures from posted journal entries"}
      </p>
    </div>
    {/* EGP rate + month/year controls â€” always visible */}
    <div style={{display:"flex",gap:8,alignItems:"center",flexWrap:"wrap"}}>
      <div style={{background:"var(--bg1)",border:"1px solid var(--border)",borderRadius:8,padding:"8px 12px",display:"flex",alignItems:"center",gap:6}}>
        <span style={{fontSize:12,color:"var(--text4)",whiteSpace:"nowrap"}}>EGP / $</span>
        <input type="number" value={egpRate} onChange={e=>setEgpRate(Math.max(1,+e.target.value||1))}
          title="Used for EGP salary â†’ USD conversion only"
          style={{width:64,background:"transparent",border:"none",color:"var(--info)",fontSize:14,fontFamily:"'IBM Plex Mono',monospace",fontWeight:700,textAlign:"right",outline:"none"}}/>
      </div>
      <div style={{background:"var(--bg1)",border:"1px solid var(--border)",borderRadius:8,padding:"8px 12px",display:"flex",alignItems:"center",gap:6}}>
        <select value={finMonth} onChange={e=>setFinMonth(+e.target.value)}
          style={{background:"transparent",border:"none",color:"var(--text0)",fontSize:14,fontWeight:600,outline:"none",cursor:"pointer"}}>
          {MONTHS_.map((m,i)=><option key={i} value={i}>{m}</option>)}
        </select>
        <select value={finYear} onChange={e=>setFinYear(+e.target.value)}
          style={{background:"var(--bg2)",border:"1px solid var(--border3)",borderRadius:6,padding:"5px 10px",color:"var(--text0)",fontSize:13,fontWeight:600,outline:"none",cursor:"pointer"}}>
          {Array.from({length:6},(_,i)=>new Date().getFullYear()-2+i).map(y=><option key={y}>{y}</option>)}
        </select>
      </div>
      {(finSubTab==="pl"||finSubTab==="salaries")&&(
        <button className="bp" style={{padding:"8px 16px",fontSize:14}} onClick={()=>{
          buildFinancePDF({finMonth,finYear,MONTHS_,monthRevUSD,totalPayrollUSDeff,totalPayrollEGP,totalExpUSD,totalExpEGP,totalCostUSD,netPL,netColor,activeStaff,monthExp,deptList,projProfit,ytdData,ytdRev,ytdCost,ytdNet,fmtCurrency,isAdmin,egpRate});
          logAction("EXPORT","Finance",`Exported Finance PDF â€” ${MONTHS_[finMonth]} ${finYear}`,{month:finMonth,year:finYear,tab:finSubTab});
        }}>â¬‡ Export PDF</button>
      )}
    </div>
  </div>

  {/* â”€â”€ Sub-tab navigation â”€â”€ */}
  <div style={{display:"flex",gap:2,background:"var(--bg1)",borderRadius:10,padding:4,border:"1px solid var(--border)",flexWrap:"wrap"}}>
    {[
      {id:"journal",  label:"Journal",     group:"Ledger"},
      {id:"balance",  label:"Balance Sheet",group:"Ledger"},
      {id:"expenses", label:"Expenses",     group:"Ledger"},
      {id:"custody",  label:"Cash Custody", group:"Ledger"},
      {id:"pl",       label:"P&L",          group:"Analysis"},
      {id:"salaries", label:"Payroll",       group:"Analysis"},
      {id:"assets",   label:"Fixed Assets",  group:"Analysis"},
      {id:"tax",      label:"Tax & Social",  group:"Analysis"},
      {id:"reports",  label:"Reports",       group:"Output"},
      {id:"workflow", label:"Guide",         group:"Output"},
    ].map(t=>{
      const active=finSubTab===t.id;
      return(
        <button key={t.id} onClick={()=>setFinSubTab(t.id)}
          style={{padding:"8px 14px",borderRadius:7,border:"none",cursor:"pointer",fontSize:14,fontWeight:active?700:500,
            fontFamily:"'IBM Plex Sans',sans-serif",transition:"all .15s",
            background:active?"linear-gradient(135deg,#0ea5e9,#0369a1)":"transparent",
            color:active?"#fff":"var(--text2)"}}>
          {t.label}
        </button>
      );
    })}
  </div>

  {/* â”€â”€ JOURNAL TAB â”€â”€ */}
  {finSubTab==="journal"&&(
    <JournalLedger
      journalEntries={journalEntries}
      accounts={accounts||[]}
      isAcct={isAcct} isAdmin={isAdmin}
      loading={journalLoading}
      showToast={showToast}
      onAdd={async(lines)=>{
        if(!isAcct&&!isAdmin) return;
        // lines is array of safe whitelisted objects (no bs_pl / usd_amount / exchange_rate)
        const safeLines=lines.map(l=>({
          entry_no:       l.entry_no,
          entry_date:     l.entry_date,
          month:          l.month||null,
          entry_type:     l.entry_type||"Custody",
          account_name:   l.account_name,
          main_account:   l.main_account||"",
          statement_type: l.statement_type||"Profit & Loss Sheet",
          debit:          Number(l.debit)||0,
          credit:         Number(l.credit)||0,
          balance:        (Number(l.debit)||0)-(Number(l.credit)||0),
          description:    l.description||"",
          posted_by:      l.posted_by||"accountant",
        }));
        const {data,error}=await supabase.from("journal_entries").insert(safeLines).select();
        if(error){showToast("Journal post failed: "+error.message,false);return;}
        if(data){
          setJournalEntries(prev=>[...prev,...data]);
          showToast(`âœ“ Entry #${safeLines[0]?.entry_no} posted â€” ${safeLines.length} line${safeLines.length!==1?"s":""}`);
          logAction("CREATE","Journal",`Posted entry #${safeLines[0]?.entry_no} â€” ${safeLines.length} lines آ· ${safeLines[0]?.entry_type}`,
            {entry_no:safeLines[0]?.entry_no,entry_type:safeLines[0]?.entry_type,lines:safeLines.length,
             total_debit:safeLines.reduce((s,l)=>s+l.debit,0)});
        }
      }}
      onDelete={async(id)=>{
        if(!isAcct&&!isAdmin) return;
        const entry=journalEntries.find(e=>e.id===id);
        showConfirm(`Delete journal entry #${entry?.entry_no||id} â€” ${entry?.account_name||""}?`,()=>{
          applyUndo(
            showToast,`Entry #${entry?.entry_no||id} deleted`,
            ()=>setJournalEntries(prev=>prev.filter(e=>e.id!==id)),
            ()=>setJournalEntries(prev=>[...prev,entry].sort((a,b)=>String(a.entry_date).localeCompare(String(b.entry_date)))),
            async()=>{ const{error}=await supabase.from("journal_entries").delete().eq("id",id); return error||null; },
            ()=>logAction("DELETE","Journal",`Deleted journal entry id:${id}`,{id})
          );
        },{title:"Delete Journal Entry",confirmLabel:"Delete Entry"});
      }}
      onEdit={async(entry)=>{
        if(!isAcct&&!isAdmin) return;
        var id = entry.id;
        if(!id){ showToast("Error: no entry ID",false); return; }
        function toNum(v){ return (v===''||v===null||v===undefined) ? null : (Number(v)||null); }
        var payload = {
          entry_no:       entry.entry_no       || null,
          entry_date:     entry.entry_date      || null,
          month:          toNum(entry.month),
          entry_type:     entry.entry_type      || null,
          account_name:   entry.account_name    || null,
          main_account:   entry.main_account    || null,
          statement_type: entry.statement_type  || null,
          description:    entry.description     || null,
          debit:          Number(entry.debit)   || 0,
          credit:         Number(entry.credit)  || 0,
        };
        try {
          var res = await supabase.from("journal_entries").update(payload).eq("id",id);
          if(res.error){ showToast("Save failed: "+res.error.message,false); return; }
          setJournalEntries(function(prev){ return prev.map(function(e){ return e.id===id ? Object.assign({},e,payload,{id:id}) : e; }); });
          logAction("UPDATE","Journal","Updated entry #"+entry.entry_no,{id:id});
          showToast("Journal entry saved âœ“");
        } catch(err) {
          showToast("Error: "+err.message,false);
          console.error("[Journal]",err);
        }
      }}
    />
  )}

  {/* â”€â”€ BALANCE SHEET TAB â”€â”€ */}
  {finSubTab==="balance"&&(
    <div>
      <div style={{background:"var(--bg0)",borderBottom:"1px solid var(--border)",borderRadius:"10px 10px 0 0",padding:"14px 20px",display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:0}}>
        <div style={{fontSize:15,fontWeight:700,color:"var(--text0)"}}>Balance Sheet</div>
        <button className="bp" style={{padding:"6px 14px",fontSize:13}} onClick={()=>{
          // Build Balance Sheet PDF from journal entries
          const bsE=journalEntries.filter(e=>e.statement_type==="Balance Sheet");
          const byAcct={};
          bsE.forEach(e=>{
            if(!byAcct[e.main_account])byAcct[e.main_account]={cat:e.main_account,items:{},dr:0,cr:0};
            if(!byAcct[e.main_account].items[e.account_name])byAcct[e.main_account].items[e.account_name]={name:e.account_name,dr:0,cr:0};
            byAcct[e.main_account].items[e.account_name].dr+=(+e.debit||0);
            byAcct[e.main_account].items[e.account_name].cr+=(+e.credit||0);
            byAcct[e.main_account].dr+=(+e.debit||0);
            byAcct[e.main_account].cr+=(+e.credit||0);
          });
          const now=new Date().toLocaleDateString("en-GB",{day:"2-digit",month:"short",year:"numeric"});
          const rows=Object.values(byAcct).sort((a,b)=>a.cat.localeCompare(b.cat)).map(cat=>{
            const itemRows=Object.values(cat.items).map((item,i)=>`<tr style="${i%2?"background:#f8fafc":""}"><td style="padding:6px 16px 6px 28px;color:#334155">${item.name}</td><td style="text-align:right;font-family:'IBM Plex Mono',monospace;color:#34d399">${item.dr>0?fmtEGP(item.dr):""}</td><td style="text-align:right;font-family:'IBM Plex Mono',monospace;color:#f87171">${item.cr>0?fmtEGP(item.cr):""}</td></tr>`).join("");
            return `<tr style="background:#f0f7ff"><td colspan="3" style="padding:7px 16px;font-weight:700;color:#0f2a50">${cat.cat}</td></tr>${itemRows}<tr style="background:#e8f4fd"><td style="padding:6px 16px;font-style:italic;color:#64748b">Subtotal â€” ${cat.cat}</td><td style="text-align:right;font-family:'IBM Plex Mono',monospace;font-weight:700;color:#34d399">${cat.dr>0?fmtEGP(cat.dr):""}</td><td style="text-align:right;font-family:'IBM Plex Mono',monospace;font-weight:700;color:#f87171">${cat.cr>0?fmtEGP(cat.cr):""}</td></tr>`;
          }).join("");
          generatePDF("Balance Sheet",
            [`<div class="section"><div class="st">Balance Sheet â€” As of ${now}</div><table><thead><tr><th>Account</th><th style="text-align:right">Debit (EGP)</th><th style="text-align:right">Credit (EGP)</th></tr></thead><tbody>${rows||"<tr><td colspan='3' style='text-align:center;color:#94a3b8;padding:20px'>No balance sheet entries in journal</td></tr>"}</tbody></table></div>`],
            `Balance Sheet آ· Enevo Egypt LLC آ· ${now}`);
          logAction("EXPORT","Finance",`Exported Balance Sheet PDF`,{tab:"balance"});
        }}>â¬‡ Export PDF</button>
      </div>
      <BalanceSheetView journalEntries={journalEntries} finYear={finYear}/>
    </div>
  )}

  {/* â”€â”€ EXPENSES TAB â”€â”€ */}
  {finSubTab==="expenses"&&(
    <div>
      <div style={{background:"var(--bg0)",borderBottom:"1px solid var(--border)",borderRadius:"10px 10px 0 0",padding:"14px 20px",display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:0}}>
        <div style={{fontSize:15,fontWeight:700,color:"var(--text0)"}}>Expenses</div>
        <button className="bp" style={{padding:"6px 14px",fontSize:13}} onClick={()=>{
          const now=new Date().toLocaleDateString("en-GB",{day:"2-digit",month:"short",year:"numeric"});
          const plE=journalEntries.filter(e=>e.statement_type==="Profit & Loss Sheet"&&+e.debit>0);
          const catMap={};
          plE.forEach(e=>{
            if(!catMap[e.main_account])catMap[e.main_account]={cat:e.main_account,items:{},total:0};
            if(!catMap[e.main_account].items[e.account_name])catMap[e.main_account].items[e.account_name]={name:e.account_name,total:0};
            catMap[e.main_account].items[e.account_name].total+=(+e.debit||0);
            catMap[e.main_account].total+=(+e.debit||0);
          });
          const grandTotal=plE.reduce((s,e)=>s+(+e.debit||0),0);
          const rows=Object.values(catMap).sort((a,b)=>b.total-a.total).map(cat=>{
            const items=Object.values(cat.items).sort((a,b)=>b.total-a.total).map((item,i)=>`<tr style="${i%2?"background:#f8fafc":""}"><td style="padding:6px 16px 6px 28px;color:#334155">${item.name}</td><td style="text-align:right;font-family:'IBM Plex Mono',monospace;color:#fb923c">${fmtEGP(item.total)}</td><td style="text-align:right;font-family:'IBM Plex Mono',monospace;color:#94a3b8">${grandTotal?(item.total/grandTotal*100).toFixed(1)+"%":""}</td></tr>`).join("");
            return`<tr style="background:#fff7ed"><td colspan="3" style="padding:7px 16px;font-weight:700;color:#9a3412">${cat.cat} â€” ${fmtEGP(cat.total)}</td></tr>${items}`;
          }).join("");
          generatePDF("Expenses Report",
            [`<div class="section"><div class="st">Expense Breakdown (P&L Entries) â€” ${now}</div><table><thead><tr><th>Account</th><th style="text-align:right">Amount (EGP)</th><th style="text-align:right">% of Total</th></tr></thead><tbody>${rows||"<tr><td colspan='3' style='text-align:center;color:#94a3b8;padding:20px'>No expense entries in journal</td></tr>"}<tr style="background:#0f2a50"><td style="padding:8px 16px;font-weight:700;color:#fff">TOTAL EXPENSES</td><td style="text-align:right;font-family:'IBM Plex Mono',monospace;font-weight:700;color:#f87171;padding:8px 16px">${fmtEGP(grandTotal)}</td><td></td></tr></tbody></table></div>`],
            `Expense Report آ· Enevo Egypt LLC آ· ${now}`);
          logAction("EXPORT","Finance",`Exported Expenses PDF`,{tab:"expenses"});
        }}>â¬‡ Export PDF</button>
      </div>
      <ExpensesView journalEntries={journalEntries} oldExpenses={expenses} egpRate={egpRate} finYear={finYear}/>
    </div>
  )}

  {/* â”€â”€ CASH CUSTODY TAB â”€â”€ */}
  {finSubTab==="custody"&&(
    <div>
      <div style={{background:"var(--bg0)",borderBottom:"1px solid var(--border)",borderRadius:"10px 10px 0 0",padding:"14px 20px",display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:0}}>
        <div style={{fontSize:15,fontWeight:700,color:"var(--text0)"}}>Cash Custody</div>
        <button className="bp" style={{padding:"6px 14px",fontSize:13}} onClick={()=>{
          const now=new Date().toLocaleDateString("en-GB",{day:"2-digit",month:"short",year:"numeric"});
          const custMap={};
          journalEntries.filter(e=>e.main_account==="Cash Custody").forEach(e=>{
            const n=e.account_name.trim();
            if(!custMap[n])custMap[n]={name:n,lines:[],totalOut:0,totalBack:0};
            custMap[n].lines.push(e);
            custMap[n].totalOut+=(+e.credit||0);
            custMap[n].totalBack+=(+e.debit||0);
          });
          const sections=Object.values(custMap).map(p=>{
            let runBal=0;
            const rows=p.lines.sort((a,b)=>String(a.entry_date).localeCompare(String(b.entry_date))).map((e,i)=>{
              runBal+=(+e.credit||0)-(+e.debit||0);
              return`<tr style="${i%2?"background:#f8fafc":""}"><td style="font-family:'IBM Plex Mono',monospace;font-size:11px">${String(e.entry_date||"").slice(0,10)}</td><td style="font-family:'IBM Plex Mono',monospace;font-size:11px;color:#94a3b8">${e.entry_no||""}</td><td>${e.description||""}</td><td style="text-align:right;font-family:'IBM Plex Mono',monospace;color:#f87171">${+e.credit>0.01?fmtEGP(+e.credit):""}</td><td style="text-align:right;font-family:'IBM Plex Mono',monospace;color:#34d399">${+e.debit>0.01?fmtEGP(+e.debit):""}</td><td style="text-align:right;font-family:'IBM Plex Mono',monospace;font-weight:700;color:${runBal>0?"#34d399":"#64748b"}">${fmtEGP(runBal)}</td></tr>`;
            }).join("");
            return`<div class="section"><div class="st">${p.name} â€” Balance: ${fmtEGP(p.totalOut-p.totalBack)}</div><table><thead><tr><th>Date</th><th>Entry#</th><th>Description</th><th style="text-align:right">Cash Out</th><th style="text-align:right">Back/Spent</th><th style="text-align:right">Balance</th></tr></thead><tbody>${rows}</tbody></table></div>`;
          });
          if(!sections.length)sections.push(`<div class="section"><p style="text-align:center;color:#94a3b8;padding:20px">No custody entries found</p></div>`);
          generatePDF("Cash Custody Ledger",sections,`Cash Custody آ· Enevo Egypt LLC آ· ${now}`);
          logAction("EXPORT","Finance",`Exported Custody Ledger PDF`,{tab:"custody"});
        }}>â¬‡ Export PDF</button>
      </div>
      <CashCustodyView journalEntries={journalEntries}/>
    </div>
  )}

  {/* â”€â”€ FIXED ASSETS TAB â”€â”€ */}
  {finSubTab==="assets"&&(
    <FixedAssetsView fixedAssets={fixedAssets} loading={assetsLoading}/>
  )}

  {/* â”€â”€ TAX & SOCIAL TAB â”€â”€ */}
  {finSubTab==="tax"&&(
    <TaxSocialView journalEntries={journalEntries}/>
  )}

  {/* â”€â”€ REPORTS TAB â”€â”€ */}
  {finSubTab==="reports"&&(
    <FinanceReports journalEntries={journalEntries} fixedAssets={fixedAssets}
      staff={staff} expenses={expenses} egpRate={egpRate}/>
  )}

  {/* â”€â”€ WORKFLOW GUIDE TAB â”€â”€ */}
  {finSubTab==="workflow"&&(
    <AccountantGuide journalEntries={journalEntries} staff={staff} egpRate={egpRate}/>
  )}


  {/* â”€â”€ P&L OPERATIONS TAB â€” reconciled journal + engineering view â”€â”€ */}
  {finSubTab==="pl"&&(()=>{
    // â”€â”€ P&L vars computed at FinanceTab top level (Rules of Hooks â€” no useMemo in IIFE) â”€â”€
    const netColor = jNetPL>=0?"#34d399":"#f87171";
    const opCosts = expByCategory["Operating Costs"]?.total||0;
    const adminCosts = expByCategory["Administrative expenses"]?.total||0;

    return(
    <div style={{display:"grid",gap:16}}>

      {/* â”€â”€ Info banner â”€â”€ */}
      <div style={{background:"var(--bg1)",border:"1px solid #38bdf830",borderRadius:10,padding:"10px 16px",fontSize:13,color:"var(--text3)",display:"flex",alignItems:"center",gap:10}}>
        <span><strong style={{color:"var(--text1)"}}>Journal-based P&L</strong> â€” All figures sourced directly from posted journal entries (EGP). This is the official accounting view for {MONTHS_[finMonth]} {finYear}.</span>
      </div>

      {/* â”€â”€ Hero metrics â”€â”€ */}
      <div style={{display:"grid",gridTemplateColumns:"repeat(5,1fr)",gap:12}}>
        {[
          {l:"Revenue",          v:fmtEGP(jRevenue),   c:"#34d399",  sub:"From journal credits"},
          {l:"Operating Costs",  v:fmtEGP(opCosts),    c:"#fb923c",  sub:"Operations & direct"},
          {l:"Admin Expenses",   v:fmtEGP(adminCosts), c:"#f59e0b",  sub:"Administrative"},
          {l:"Total Expenses",   v:fmtEGP(jTotalExp),  c:"#f87171",  sub:"All debit entries"},
          {l:"Net P&L",          v:fmtEGP(jNetPL),     c:netColor,   sub:jNetPL>=0?"Profitable":"Loss"},
        ].map((k,i)=>(
          <div key={i} style={{background:"var(--bg1)",border:"1px solid var(--border)",borderRadius:12,padding:"18px 16px",borderTop:`3px solid ${k.c}`}}>
            <div style={{fontSize:12,fontWeight:700,color:"var(--text4)",textTransform:"uppercase",letterSpacing:".07em",marginBottom:10}}>{k.l}</div>
            <div style={{fontFamily:"'IBM Plex Mono',monospace",fontSize:20,fontWeight:800,color:k.c,lineHeight:1.1,marginBottom:6,wordBreak:"break-all"}}>{k.v}</div>
            <div style={{fontSize:12,color:"var(--text4)"}}>{k.sub}</div>
          </div>
        ))}
      </div>

      {/* USD equivalent strip */}
      {jRevUSD>0&&(
        <div style={{background:"#38bdf810",border:"1px solid #38bdf840",borderRadius:8,padding:"10px 16px",display:"flex",gap:20,flexWrap:"wrap",alignItems:"center"}}>
          <span style={{fontSize:13,color:"var(--text3)"}}>Invoice equivalent:</span>
          <span style={{fontFamily:"'IBM Plex Mono',monospace",fontSize:14,fontWeight:700,color:"#38bdf8"}}>${(+jRevUSD).toLocaleString("en-US",{minimumFractionDigits:2})} USD</span>
          <span style={{fontSize:13,color:"var(--text4)"}}>@ EGP {jRevRate}/$ on invoice date</span>
          <span style={{fontFamily:"'IBM Plex Mono',monospace",fontSize:13,color:"#34d399"}}>= {fmtEGP(+jRevUSD * +jRevRate)}</span>
          <span style={{fontSize:13,color:"var(--text4)",marginLeft:"auto"}}>EGP rate override: <input type="number" value={egpRate} onChange={e=>setEgpRate(Math.max(1,+e.target.value||1))} style={{width:60,background:"transparent",border:"1px solid var(--border3)",borderRadius:4,padding:"2px 6px",color:"var(--text0)",fontSize:13,textAlign:"right"}}/> /$ (salaries only)</span>
        </div>
      )}

      {/* â”€â”€ Expense breakdown â”€â”€ */}
      <div className="card" style={{padding:0,overflow:"hidden"}}>
        <div style={{background:"var(--bg0)",borderBottom:"1px solid var(--border)",padding:"14px 20px",display:"flex",justifyContent:"space-between",alignItems:"center"}}>
          <div style={{fontSize:15,fontWeight:700,color:"var(--text0)"}}>Expense Breakdown</div>
          <div style={{fontSize:13,color:"var(--text3)",fontFamily:"'IBM Plex Mono',monospace"}}>{fmtEGP(jTotalExp)} total</div>
        </div>
        <table>
          <thead><tr style={{background:"var(--bg2)"}}>
            <th style={{padding:"7px 14px",textAlign:"left",color:"var(--text3)",fontSize:13}}>Category</th>
            <th style={{padding:"7px 14px",textAlign:"left",color:"var(--text3)",fontSize:13}}>Account</th>
            <th style={{padding:"7px 14px",textAlign:"right",color:"var(--text3)",fontSize:13}}>Amount (EGP)</th>
            <th style={{padding:"7px 14px",textAlign:"right",color:"var(--text3)",fontSize:13}}>% of Total</th>
          </tr></thead>
          <tbody>
            {Object.values(expByCategory).sort((a,b)=>b.total-a.total).map(cat=>
              Object.values(cat.items).sort((a,b)=>b.total-a.total).map((item,i)=>(
                <tr key={cat.cat+item.name} style={{borderBottom:"1px solid var(--border3)"}}>
                  <td style={{padding:"6px 14px",color:"var(--text4)",fontSize:13,fontStyle:"italic"}}>{i===0?cat.cat:""}</td>
                  <td style={{padding:"6px 14px",color:"var(--text1)",fontWeight:500}}>{item.name}</td>
                  <td style={{padding:"6px 14px",fontFamily:"'IBM Plex Mono',monospace",fontSize:13,textAlign:"right",color:"#fb923c"}}>{fmtEGP(item.total)}</td>
                  <td style={{padding:"6px 14px",textAlign:"right"}}>
                    <div style={{display:"flex",alignItems:"center",justifyContent:"flex-end",gap:6}}>
                      <div style={{width:60,height:6,background:"var(--bg2)",borderRadius:3,overflow:"hidden"}}>
                        <div style={{height:"100%",width:`${Math.min(100,(item.total/jTotalExp*100)).toFixed(0)}%`,background:"#fb923c",borderRadius:3}}/>
                      </div>
                      <span style={{fontFamily:"'IBM Plex Mono',monospace",fontSize:12,color:"var(--text4)",minWidth:35}}>{jTotalExp?(item.total/jTotalExp*100).toFixed(1):0}%</span>
                    </div>
                  </td>
                </tr>
              ))
            )}
            <tr style={{background:"var(--bg2)",borderTop:"2px solid var(--border)"}}>
              <td colSpan={2} style={{padding:"8px 14px",fontWeight:700,color:"var(--text0)"}}>TOTAL EXPENSES</td>
              <td style={{padding:"8px 14px",fontFamily:"'IBM Plex Mono',monospace",fontWeight:700,color:"#f87171",textAlign:"right"}}>{fmtEGP(jTotalExp)}</td>
              <td style={{padding:"8px 14px",textAlign:"right",fontFamily:"'IBM Plex Mono',monospace",fontSize:13,color:"var(--text4)"}}>100%</td>
            </tr>
            <tr style={{background:jNetPL>=0?"#34d39910":"#f8711810"}}>
              <td colSpan={2} style={{padding:"9px 14px",fontWeight:700,color:netColor}}>NET {jNetPL>=0?"PROFIT":"LOSS"}</td>
              <td style={{padding:"9px 14px",fontFamily:"'IBM Plex Mono',monospace",fontWeight:700,fontSize:15,color:netColor,textAlign:"right"}}>{fmtEGP(jNetPL)}</td>
              <td/>
            </tr>
          </tbody>
        </table>
      </div>

      {/* Month-by-month YTD from journal */}
      <div className="card" style={{padding:0,overflow:"hidden"}}>
        <div style={{background:"var(--bg0)",borderBottom:"1px solid var(--border)",padding:"14px 20px",display:"flex",justifyContent:"space-between",alignItems:"center"}}>
          <div style={{fontSize:15,fontWeight:700,color:"var(--text0)"}}>Month-by-Month YTD</div>
          <div style={{fontSize:13,color:"var(--text3)"}}>Revenue posted when invoice issued آ· costs accrue monthly</div>
        </div>
        <table style={{width:"100%",borderCollapse:"collapse",fontSize:13}}>
          <thead><tr style={{background:"var(--bg2)"}}>
            {["Month","Revenue (EGP)","Expenses (EGP)","Net (EGP)","Status"].map(h=>(
              <th key={h} style={{padding:"7px 14px",textAlign:h==="Month"||h==="Status"?"left":"right",color:"var(--text3)",fontSize:13}}>{h}</th>
            ))}
          </tr></thead>
          <tbody>
            {monthPL.map((m,i)=>(
              <tr key={m.mo} style={{borderBottom:"1px solid var(--border3)",background:i%2===0?"transparent":"var(--bg1)"}}>
                <td style={{padding:"7px 14px",fontWeight:600,color:"var(--text0)"}}>{MONTHS_[+m.mo-1]||""}</td>
                <td style={{padding:"7px 14px",fontFamily:"'IBM Plex Mono',monospace",fontSize:13,textAlign:"right",color:"#34d399"}}>{m.rev>0?fmtEGP(m.rev):"â€”"}</td>
                <td style={{padding:"7px 14px",fontFamily:"'IBM Plex Mono',monospace",fontSize:13,textAlign:"right",color:"#f87171"}}>{m.exp>0?fmtEGP(m.exp):"â€”"}</td>
                <td style={{padding:"7px 14px",fontFamily:"'IBM Plex Mono',monospace",fontSize:13,textAlign:"right",color:m.net>=0?"#34d399":"#f87171",fontWeight:600}}>{fmtEGP(m.net)}</td>
                <td style={{padding:"7px 14px",fontSize:12,color:"var(--text4)"}}>{m.rev>0&&m.exp>0?"Revenue+Costs":m.rev>0?"Revenue only":m.exp>0?"Costs only":"â€”"}</td>
              </tr>
            ))}
            <tr style={{background:"var(--bg2)",borderTop:"2px solid var(--border)",fontWeight:700}}>
              <td style={{padding:"8px 14px",color:"var(--text0)"}}>YTD TOTAL</td>
              <td style={{padding:"8px 14px",fontFamily:"'IBM Plex Mono',monospace",textAlign:"right",color:"#34d399"}}>{fmtEGP(jRevenue)}</td>
              <td style={{padding:"8px 14px",fontFamily:"'IBM Plex Mono',monospace",textAlign:"right",color:"#f87171"}}>{fmtEGP(jTotalExp)}</td>
              <td style={{padding:"8px 14px",fontFamily:"'IBM Plex Mono',monospace",textAlign:"right",color:netColor,fontSize:14}}>{fmtEGP(jNetPL)}</td>
              <td/>
            </tr>
          </tbody>
        </table>
      </div>

      {/* â”€â”€ Engineering ops section â”€â”€ */}
      {(totalBillableHrs>0||totalBillableUSD>0)&&(
        <div className="card" style={{padding:0,overflow:"hidden"}}>
          <div style={{background:"#38bdf815",borderBottom:"2px solid #38bdf8",padding:"10px 16px",fontSize:13,fontWeight:700,color:"#38bdf8"}}>
            ENGINEERING OPS â€” Billable Hours (time entries, USD)
            <span style={{fontSize:12,color:"var(--text4)",fontWeight:400,marginLeft:12}}>Management view â€” not accounting</span>
          </div>
          <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:0,borderBottom:"1px solid var(--border3)"}}>
            {[
              {l:"Total Billable Hours",v:`${totalBillableHrs.toFixed(1)} hrs`,c:"#38bdf8"},
              {l:"Billed Value (USD)",  v:fmtCurrency(totalBillableUSD),       c:"#34d399"},
              {l:"Avg Rate",            v:totalBillableHrs?fmtCurrency(totalBillableUSD/totalBillableHrs)+"/hr":"â€”",c:"var(--text2)"},
            ].map((k,i)=>(
              <div key={i} style={{textAlign:"center",padding:"14px 8px",borderRight:i<2?"1px solid var(--border3)":"none"}}>
                <div style={{fontFamily:"'IBM Plex Mono',monospace",fontSize:15,fontWeight:700,color:k.c}}>{k.v}</div>
                <div style={{fontSize:12,color:"var(--text4)",marginTop:3}}>{k.l}</div>
              </div>
            ))}
          </div>
          {Object.values(engHours).length>0&&(
            <table style={{width:"100%",borderCollapse:"collapse",fontSize:13}}>
              <thead><tr style={{background:"var(--bg2)"}}>
                {["Engineer","Billable Hours","Billed USD"].map(h=>(
                  <th key={h} style={{padding:"7px 14px",textAlign:h==="Engineer"?"left":"right",color:"var(--text3)",fontSize:13}}>{h}</th>
                ))}
              </tr></thead>
              <tbody>
                {Object.values(engHours).sort((a,b)=>b.usd-a.usd).map((e,i)=>(
                  <tr key={i} style={{borderBottom:"1px solid var(--border3)"}}>
                    <td style={{padding:"6px 14px",color:"var(--text1)",fontWeight:500}}>{e.name}</td>
                    <td style={{padding:"6px 14px",fontFamily:"'IBM Plex Mono',monospace",fontSize:13,textAlign:"right",color:"var(--text2)"}}>{e.hrs.toFixed(1)} hrs</td>
                    <td style={{padding:"6px 14px",fontFamily:"'IBM Plex Mono',monospace",fontSize:13,textAlign:"right",color:"#34d399",fontWeight:600}}>{fmtCurrency(e.usd)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}

      {/* â”€â”€ Project P&L â”€â”€ */}
      {projProfit.length>0&&(
        <div className="card" style={{padding:0,overflow:"hidden"}}>
          <div style={{background:"var(--bg0)",borderBottom:"1px solid var(--border)",padding:"14px 20px",display:"flex",justifyContent:"space-between",alignItems:"center"}}><div style={{fontSize:15,fontWeight:700,color:"var(--text0)"}}>Project P&L</div><div style={{fontSize:13,color:"var(--text3)"}}>Time entries أ— hourly rate</div></div>
          <table style={{width:"100%",borderCollapse:"collapse",fontSize:13}}>
            <thead><tr style={{background:"var(--bg2)"}}>
              {["Project","Revenue","Cost","Profit","Margin"].map(h=>(
                <th key={h} style={{padding:"7px 14px",textAlign:h==="Project"?"left":"right",color:"var(--text3)",fontSize:13}}>{h}</th>
              ))}
            </tr></thead>
            <tbody>
              {projProfit.map((p,i)=>(
                <tr key={i} style={{borderBottom:"1px solid var(--border3)"}}>
                  <td style={{padding:"7px 14px",fontWeight:500,color:"var(--text1)"}}>{p.name}</td>
                  <td style={{padding:"7px 14px",fontFamily:"'IBM Plex Mono',monospace",fontSize:13,textAlign:"right",color:"#34d399"}}>{fmtCurrency(p.rev)}</td>
                  <td style={{padding:"7px 14px",fontFamily:"'IBM Plex Mono',monospace",fontSize:13,textAlign:"right",color:"#f87171"}}>{fmtCurrency(p.cost)}</td>
                  <td style={{padding:"7px 14px",fontFamily:"'IBM Plex Mono',monospace",fontSize:13,textAlign:"right",color:p.net>=0?"#34d399":"#f87171",fontWeight:600}}>{fmtCurrency(p.net)}</td>
                  <td style={{padding:"7px 14px",fontFamily:"'IBM Plex Mono',monospace",fontSize:13,textAlign:"right",color:"var(--text3)"}}>{p.rev?Math.round(p.net/p.rev*100):0}%</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

    </div>
    );
  })()}

  {/* â”€â”€ SALARIES TAB â€” journal accruals + staff table reconciled â”€â”€ */}
  {finSubTab==="salaries"&&(()=>{
    // Salary accruals from journal, grouped by month
    const salaryAccruals = journalEntries.filter(e=>e.entry_type==="Accrued Salaries");
    const accrualMonths = [...new Set(salaryAccruals.map(e=>e.month))].sort((a,b)=>+a-+b);

    // Per-month: gross cost, gross admin, net payable, tax, SI
    const accrualByMonth = accrualMonths.map(mo=>{
      const lines = salaryAccruals.filter(e=>e.month===mo);
      return {
        mo,
        grossCost:  lines.filter(e=>e.account_name==="Salaries-Cost"       ).reduce((s,e)=>s+(+e.debit),0),
        grossAdmin: lines.filter(e=>e.account_name==="Salaries-Administrative").reduce((s,e)=>s+(+e.debit),0),
        siCost:     lines.filter(e=>e.account_name==="Social Insurance-Cost"  ).reduce((s,e)=>s+(+e.debit),0),
        siAdmin:    lines.filter(e=>e.account_name==="Social Insurance-Administrative").reduce((s,e)=>s+(+e.debit),0),
        tax:        lines.filter(e=>e.account_name==="Payroll Tax"             ).reduce((s,e)=>s+(+e.credit),0),
        si:         lines.filter(e=>e.account_name==="Social Insurance Authority").reduce((s,e)=>s+(+e.credit),0),
        mff:        lines.filter(e=>e.account_name==="Martyrs Families Fund"   ).reduce((s,e)=>s+(+e.credit),0),
        net:        lines.filter(e=>e.account_name==="Accrued Salaries"         ).reduce((s,e)=>s+(+e.credit),0),
      };
    });

    // Staff table totals
    const activeSt = staff.filter(s=>s.active!==false);
    const filteredSt = staffSearch
      ? activeSt.filter(s=>(s.name||"").toLowerCase().includes(staffSearch.toLowerCase())
          ||(s.department||"").toLowerCase().includes(staffSearch.toLowerCase())
          ||(s.role||"").toLowerCase().includes(staffSearch.toLowerCase()))
      : activeSt;
    const totalEGP = activeSt.reduce((s,x)=>s+(+x.salary_egp||0),0);
    const totalUSD = activeSt.reduce((s,x)=>s+(+x.salary_usd||0),0);

    // Last posted month vs staff table â€” reconciliation
    const lastAccrual = accrualByMonth[accrualByMonth.length-1];
    const lastGross = lastAccrual ? lastAccrual.grossCost + lastAccrual.grossAdmin : 0;
    const reconcileDiff = lastGross - totalEGP;
    const reconcileOK = Math.abs(reconcileDiff) < 100;

    return(
    <div style={{display:"grid",gap:16}}>

      {/* â”€â”€ Hero metrics â”€â”€ */}
      <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:12}}>
        {[
          {l:"Active Staff",      v:activeSt.length,                                                               c:"var(--info)",   sub:"Current headcount"},
          {l:"Total EGP Payroll", v:fmtEGP(totalEGP),                                                             c:"#fb923c",       sub:"Monthly gross"},
          {l:"Total USD Payroll", v:totalUSD>0?`$${totalUSD.toLocaleString("en-US",{minimumFractionDigits:2})}`:"â€”",c:"#38bdf8",    sub:"Monthly USD"},
          {l:"Journal vs Staff",  v:reconcileOK?"âœ“ Match":`خ” ${fmtEGP(Math.abs(reconcileDiff))}`,                c:reconcileOK?"#34d399":"#f87171",sub:reconcileOK?"Last accrual matches":"Check journal"},
        ].map((k,i)=>(
          <div key={i} style={{background:"var(--bg1)",border:"1px solid var(--border)",borderRadius:12,padding:"18px 16px",borderTop:`3px solid ${k.c}`}}>
            <div style={{fontSize:12,fontWeight:700,color:"var(--text4)",textTransform:"uppercase",letterSpacing:".07em",marginBottom:10}}>{k.l}</div>
            <div style={{fontFamily:"'IBM Plex Mono',monospace",fontSize:20,fontWeight:800,color:k.c,lineHeight:1.1,marginBottom:6,wordBreak:"break-all"}}>{k.v}</div>
            <div style={{fontSize:12,color:"var(--text4)"}}>{k.sub}</div>
          </div>
        ))}
      </div>

      {!reconcileOK&&(
        <div style={{background:"#f8711815",border:"1px solid #f8711840",borderRadius:8,padding:"10px 16px",fontSize:13,color:"#f87171"}}>
          âڑ  Last journal accrual gross ({fmtEGP(lastGross)}) differs from staff table total ({fmtEGP(totalEGP)}) by {fmtEGP(Math.abs(reconcileDiff))}. 
          Check if staff salaries were updated without a matching journal correction.
        </div>
      )}

      {/* Monthly accrual history */}
      {accrualByMonth.length>0&&(
        <div className="card" style={{padding:0,overflow:"hidden"}}>
          <div style={{background:"var(--bg0)",borderBottom:"1px solid var(--border)",padding:"14px 20px",display:"flex",justifyContent:"space-between",alignItems:"center"}}>
            <div style={{fontSize:15,fontWeight:700,color:"var(--text0)"}}>Monthly Payroll Accruals</div>
            <div style={{fontSize:13,color:"var(--text3)",fontFamily:"'IBM Plex Mono',monospace"}}>From journal آ· {accrualByMonth.length} month{accrualByMonth.length!==1?"s":""}</div>
          </div>
          <div style={{overflowX:"auto"}}>
            <table style={{width:"100%",borderCollapse:"collapse",fontSize:13}}>
              <thead><tr style={{background:"var(--bg2)"}}>
                {["Month","Gross Cost","Gross Admin","SI Total","Payroll Tax","MFF","Net Payable"].map(h=>(
                  <th key={h} style={{padding:"7px 12px",textAlign:h==="Month"?"left":"right",color:"var(--text3)",fontSize:13,whiteSpace:"nowrap"}}>{h}</th>
                ))}
              </tr></thead>
              <tbody>
                {accrualByMonth.map((m,i)=>(
                  <tr key={m.mo} style={{borderBottom:"1px solid var(--border3)",background:i%2===0?"transparent":"var(--bg1)"}}>
                    <td style={{padding:"7px 12px",fontWeight:600,color:"var(--text0)"}}>{MONTHS_[+m.mo-1]||""}</td>
                    <td style={{padding:"7px 12px",fontFamily:"'IBM Plex Mono',monospace",fontSize:13,textAlign:"right",color:"#fb923c"}}>{m.grossCost>0?fmtEGP(m.grossCost):"â€”"}</td>
                    <td style={{padding:"7px 12px",fontFamily:"'IBM Plex Mono',monospace",fontSize:13,textAlign:"right",color:"#fb923c"}}>{m.grossAdmin>0?fmtEGP(m.grossAdmin):"â€”"}</td>
                    <td style={{padding:"7px 12px",fontFamily:"'IBM Plex Mono',monospace",fontSize:13,textAlign:"right",color:"#f87171"}}>{fmtEGP(m.siCost+m.siAdmin)}</td>
                    <td style={{padding:"7px 12px",fontFamily:"'IBM Plex Mono',monospace",fontSize:13,textAlign:"right",color:"#f87171"}}>{fmtEGP(m.tax)}</td>
                    <td style={{padding:"7px 12px",fontFamily:"'IBM Plex Mono',monospace",fontSize:13,textAlign:"right",color:"#a78bfa"}}>{fmtEGP(m.mff)}</td>
                    <td style={{padding:"7px 12px",fontFamily:"'IBM Plex Mono',monospace",fontSize:13,textAlign:"right",color:"#34d399",fontWeight:600}}>{fmtEGP(m.net)}</td>
                  </tr>
                ))}
                <tr style={{background:"var(--bg2)",borderTop:"2px solid var(--border)",fontWeight:700}}>
                  <td style={{padding:"8px 12px",color:"var(--text0)"}}>TOTAL</td>
                  {[
                    accrualByMonth.reduce((s,m)=>s+m.grossCost,0),
                    accrualByMonth.reduce((s,m)=>s+m.grossAdmin,0),
                    accrualByMonth.reduce((s,m)=>s+m.siCost+m.siAdmin,0),
                    accrualByMonth.reduce((s,m)=>s+m.tax,0),
                    accrualByMonth.reduce((s,m)=>s+m.mff,0),
                    accrualByMonth.reduce((s,m)=>s+m.net,0),
                  ].map((v,i)=>(
                    <td key={i} style={{padding:"8px 12px",fontFamily:"'IBM Plex Mono',monospace",textAlign:"right",color:i===5?"#34d399":"var(--text1)",fontSize:i===5?14:13}}>{fmtEGP(v)}</td>
                  ))}
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Staff salary table */}
      <div className="card" style={{padding:0,overflow:"hidden"}}>
        <div style={{background:"var(--bg0)",borderBottom:"1px solid var(--border)",padding:"14px 20px",display:"flex",alignItems:"center",justifyContent:"space-between",gap:12,flexWrap:"wrap"}}>
          <div>
            <div style={{fontSize:15,fontWeight:700,color:"var(--text0)"}}>Staff Table â€” Current Salaries</div>
            <div style={{fontSize:13,color:"var(--text3)",marginTop:2}}>{activeSt.length} active staff members</div>
          </div>
          <input value={staffSearch} onChange={e=>setStaffSearch(e.target.value)}
            placeholder="ًں”چ Search name, dept, roleâ€¦"
            style={{background:"var(--bg2)",border:"1px solid var(--border)",borderRadius:7,padding:"7px 12px",color:"var(--text0)",fontSize:14,width:230,outline:"none"}}/>
        </div>
        <table style={{width:"100%",borderCollapse:"collapse",fontSize:13}}>
          <thead><tr style={{background:"var(--bg2)"}}>
            {["Name","Department","Role","EGP Salary","USD Salary","Join Date",""].map(h=>(
              <th key={h} style={{padding:"7px 12px",textAlign:["EGP Salary","USD Salary"].includes(h)?"right":"left",color:"var(--text3)",fontSize:13}}>{h}</th>
            ))}
          </tr></thead>
          <tbody>
            {filteredSt.sort((a,b)=>(b.salary_egp||0)-(a.salary_egp||0)).map((s,i)=>(
              <tr key={i} style={{borderBottom:"1px solid var(--border3)",background:i%2===0?"transparent":"var(--bg1)"}}>
                <td style={{padding:"6px 12px",fontWeight:600,color:"var(--text1)"}}>{s.name}</td>
                <td style={{padding:"6px 12px",color:"var(--text3)"}}>{s.department}</td>
                <td style={{padding:"6px 12px"}}><span style={{fontSize:12,padding:"2px 6px",borderRadius:3,background:"var(--bg3)",color:"var(--info)"}}>{s.role}</span></td>
                <td style={{padding:"6px 12px",fontFamily:"'IBM Plex Mono',monospace",fontSize:13,textAlign:"right",color:"#fb923c",fontWeight:600}}>{s.salary_egp?fmtEGP(+s.salary_egp):"\u2014"}</td>
                <td style={{padding:"6px 12px",fontFamily:"'IBM Plex Mono',monospace",fontSize:13,textAlign:"right",color:"#38bdf8"}}>{s.salary_usd?`$${(+s.salary_usd).toLocaleString("en-US",{minimumFractionDigits:2})}`:"\u2014"}</td>
                <td style={{padding:"6px 12px",fontSize:13,color:"var(--text4)"}}>{s.join_date||"â€”"}</td>
                <td style={{padding:"6px 8px"}}>
                  {(isAdmin||isAcct)&&(
                    <button onClick={()=>{setEditStaff({...s});setShowStaffModal(true);}}
                      style={{background:"var(--bg2)",border:"1px solid var(--border3)",borderRadius:5,padding:"3px 9px",color:"var(--text2)",cursor:"pointer",fontSize:13}}>âœڈ</button>
                  )}
                </td>
              </tr>
            ))}
            <tr style={{background:"var(--bg2)",borderTop:"2px solid var(--border)",fontWeight:700}}>
              <td colSpan={3} style={{padding:"8px 12px",color:"var(--text0)"}}>
                {staffSearch?`${filteredSt.length} of ${activeSt.length} staff`:`TOTAL (${activeSt.length} staff)`}
              </td>
              <td style={{padding:"8px 12px",fontFamily:"'IBM Plex Mono',monospace",textAlign:"right",color:"#fb923c",fontSize:14}}>{fmtEGP(totalEGP)}</td>
              <td style={{padding:"8px 12px",fontFamily:"'IBM Plex Mono',monospace",textAlign:"right",color:"#38bdf8"}}>{totalUSD>0?`$${totalUSD.toLocaleString("en-US",{minimumFractionDigits:2})}`:""}</td>
              <td colSpan={2}/>
            </tr>
          </tbody>
        </table>
        {(isAdmin||isAcct)&&(
          <div style={{padding:"10px 14px",borderTop:"1px solid var(--border3)",display:"flex",gap:8,alignItems:"center"}}>
            {isAdmin&&<button className="bp" onClick={()=>{setEditStaff(null);setShowStaffModal(true);}}>+ Add Staff Member</button>}
            {isAcct&&!isAdmin&&<span style={{fontSize:13,color:"var(--text4)"}}>âœڈ Click the edit button on any row to update salary</span>}
          </div>
        )}
      </div>

      {/* â•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گ
          PAY SLIPS â€” Generate individual PDF pay slips
         â•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گ */}
      {(()=>{
        const psStaff = activeSt.filter(s=>wasEmployed(s,finYear,finMonth));
        // Compute per-person deductions from journal accruals (proportional allocation)
        const lastMo = accrualByMonth.find(m=>+m.mo===finMonth+1) || accrualByMonth[accrualByMonth.length-1];
        const totalGross = lastMo ? lastMo.grossCost + lastMo.grossAdmin : 0;

        const personSlip = (s) => {
          const adj  = psAdj[s.id]||{};
          const isUSD = (s.salary_usd||0)>0 && !(s.salary_egp||0);
          const prorate = prorateStaff(s,finYear,finMonth);
          const basic   = isUSD ? (s.salary_usd||0)*prorate : (s.salary_egp||0)*prorate;
          const basicEGP= isUSD ? basic*(egpRate||1) : basic;
          // Deductions: allocate from journal proportionally, or 0 if no journal
          const share   = totalGross>0 ? basicEGP/totalGross : 0;
          const siEmp   = lastMo ? Math.round((lastMo.siCost+lastMo.siAdmin)*share*0.37) : 0; // emp ~37% of total SI
          const tax     = lastMo ? Math.round(lastMo.tax*share) : 0;
          const mff     = lastMo ? Math.round(lastMo.mff*share) : 0;
          const transport = +(adj.transport||0);
          const housing   = +(adj.housing||0);
          const bonus     = +(adj.bonus||0);
          const health    = +(adj.health||0);
          const advance   = +(adj.advance||0);
          const absence   = +(adj.absence||0);
          const grossEarnings = basicEGP + (isUSD?0:transport) + (isUSD?0:housing) + (isUSD?0:bonus);
          const grossUSD      = isUSD ? basic + transport + housing + bonus : 0;
          const totalDed      = siEmp + tax + mff + health + advance + absence;
          const netEGP  = isUSD ? 0 : grossEarnings - totalDed;
          const netUSD  = isUSD ? (grossUSD - (totalDed/(egpRate||1))) : 0;
          return {isUSD,basic,basicEGP,prorate,siEmp,tax,mff,transport,housing,bonus,health,advance,absence,
                  grossEarnings:isUSD?grossUSD:grossEarnings,totalDed,netEGP,netUSD,share};
        };

        const generateSlip = (s) => {
          const slip = personSlip(s);
          const adj  = psAdj[s.id]||{};
          const MONTHS_LONG=["January","February","March","April","May","June",
            "July","August","September","October","November","December"];
          const periodStr = MONTHS_LONG[finMonth]+' '+finYear;
          const slipNo = 'EGY-'+finYear+'-'+String(finMonth+1).padStart(2,'0')+'-'+String(psStaff.indexOf(s)+1).padStart(3,'0');
          const now = new Date().toLocaleDateString('en-GB',{day:'2-digit',month:'short',year:'numeric'});
          const fmt  = v=>v>0?fmtEGP(v):'â€”';
          const fmtU = v=>v>0?'$'+v.toLocaleString('en-US',{minimumFractionDigits:2}):'â€”';
          const isCur = slip.isUSD;
          const cur   = isCur?'USD':'EGP';

          const earningsRows = [
            ['Basic Salary',               isCur?fmtU(slip.basic):fmt(slip.basicEGP), 'earnings'],
            slip.prorate<0.99?['Days Worked',''+Math.round(slip.prorate*new Date(finYear,finMonth+1,0).getDate())+' / '+new Date(finYear,finMonth+1,0).getDate(),'note']:null,
            (adj.transport||0)>0?['Transportation Allowance', isCur?fmtU(+adj.transport):fmt(+adj.transport),'allow']:null,
            (adj.housing||0)>0 ?['Housing Allowance',         isCur?fmtU(+adj.housing) :fmt(+adj.housing), 'allow']:null,
            (adj.bonus||0)>0   ?['Performance Bonus',         isCur?fmtU(+adj.bonus)   :fmt(+adj.bonus),   'allow']:null,
          ].filter(Boolean);

          const dedRows = [
            slip.siEmp >0?['Social Insurance',      fmt(isCur?Math.round(slip.siEmp/(egpRate||1)):slip.siEmp),'ded']:null,
            slip.tax   >0?['Income Tax',             fmt(isCur?Math.round(slip.tax/(egpRate||1))  :slip.tax),  'ded']:null,
            slip.mff   >0?['Martyrs Families Fund',  fmt(isCur?Math.round(slip.mff/(egpRate||1))  :slip.mff),  'ded']:null,
            (adj.health||0)>0?  ['Health Insurance',    fmt(+adj.health),   'ded']:null,
            (adj.advance||0)>0? ['Loan / Advance',       fmt(+adj.advance),  'ded']:null,
            (adj.absence||0)>0? ['Absence Deduction',    fmt(+adj.absence),  'ded']:null,
          ].filter(Boolean);

          const netVal  = isCur ? fmtU(slip.netUSD)  : fmtEGP(slip.netEGP);
          const grossVal= isCur ? fmtU(slip.grossEarnings) : fmtEGP(slip.grossEarnings);
          const dedVal  = isCur ? fmtU(slip.totalDed/(egpRate||1)) : fmtEGP(slip.totalDed);

          const rowHtml = (label, val, type) => {
            const c = type==='earnings'?'#1e3a5f':type==='allow'?'#14532d':type==='ded'?'#7f1d1d':'#1e3a5f';
            const bg= type==='earnings'?'#eff6ff':type==='allow'?'#f0fdf4':type==='ded'?'#fff5f5':'#f8fafc';
            return `<tr><td style="padding:5px 10px;color:${c};background:${bg}">${label}</td>
              <td style="text-align:right;padding:5px 10px;font-family:'IBM Plex Mono',monospace;font-weight:600;color:${c};background:${bg}">${val}</td></tr>`;
          };

          const html = `
<!DOCTYPE html><html><head><meta charset="utf-8">
<style>
  body{font-family:'Segoe UI',Arial,sans-serif;margin:0;padding:0;background:#f0f4f8}
  .slip{width:680px;margin:20px auto;background:#fff;border-radius:12px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,.12);border:1px solid #e2e8f0}
  .hdr{background:linear-gradient(135deg,#0f2a50 0%,#1e4d8c 100%);padding:22px 28px;display:flex;justify-content:space-between;align-items:center}
  .hdr-left{display:flex;align-items:center;gap:14px}
  .hdr-logo{width:52px;height:52px;border-radius:10px;object-fit:contain;background:#fff;padding:4px}
  .hdr-name{color:#fff;font-size:22px;font-weight:800;letter-spacing:.04em}
  .hdr-sub{color:#93c5fd;font-size:11px;letter-spacing:.12em;margin-top:2px}
  .hdr-right{text-align:right}
  .hdr-slip{color:#fff;font-size:18px;font-weight:700}
  .hdr-period{color:#93c5fd;font-size:13px;margin-top:4px}
  .hdr-no{color:#60a5fa;font-size:11px;font-family:monospace;margin-top:2px}
  .emp{background:#f8fafc;border-bottom:1px solid #e2e8f0;padding:16px 28px;display:grid;grid-template-columns:1fr 1fr;gap:8px}
  .emp-row{display:flex;flex-direction:column}
  .emp-lbl{font-size:10px;font-weight:700;color:#94a3b8;text-transform:uppercase;letter-spacing:.08em}
  .emp-val{font-size:14px;font-weight:600;color:#1e293b;margin-top:2px}
  .body{padding:20px 28px;display:grid;grid-template-columns:1fr 1fr;gap:20px}
  .col-title{font-size:11px;font-weight:800;text-transform:uppercase;letter-spacing:.1em;padding:7px 10px;border-radius:5px}
  .earn-title{background:#dbeafe;color:#1d4ed8}
  .ded-title{background:#fee2e2;color:#b91c1c}
  table{width:100%;border-collapse:collapse;margin-top:6px;border-radius:6px;overflow:hidden}
  .subtotal-row td{padding:7px 10px;font-weight:700;font-size:13px;background:#f1f5f9;border-top:2px solid #cbd5e1}
  .net-bar{background:linear-gradient(90deg,#0f2a50,#1e4d8c);margin:0 28px 24px;border-radius:8px;padding:16px 20px;display:flex;justify-content:space-between;align-items:center}
  .net-lbl{color:#93c5fd;font-size:12px;font-weight:700;text-transform:uppercase;letter-spacing:.1em}
  .net-val{color:#fff;font-size:26px;font-weight:800;font-family:'IBM Plex Mono',monospace}
  .net-cur{color:#60a5fa;font-size:13px;margin-left:6px;font-weight:600}
  .recon{margin:0 28px 20px;background:#f0fdf4;border:1px solid #bbf7d0;border-radius:7px;padding:10px 14px;font-size:12px;color:#166534}
  .ftr{background:#f8fafc;border-top:1px solid #e2e8f0;padding:12px 28px;display:flex;justify-content:space-between;font-size:11px;color:#94a3b8}
  @media print{body{background:#fff}.slip{box-shadow:none;border:none;border-radius:0}@page{margin:0;size:A4}}
</style></head><body>
<div class="slip">
  <div class="hdr">
    <div class="hdr-left">
      <img src="${LOGO_SRC}" class="hdr-logo" alt="ENEVO"/>
      <div><div class="hdr-name">ENEVO EGY</div><div class="hdr-sub">INDUSTRIAL &amp; ENGINEERING SOLUTIONS</div></div>
    </div>
    <div class="hdr-right">
      <div class="hdr-slip">Pay Slip</div>
      <div class="hdr-period">${periodStr}</div>
      <div class="hdr-no">${slipNo}</div>
    </div>
  </div>
  <div class="emp">
    <div class="emp-row"><span class="emp-lbl">Employee Name</span><span class="emp-val">${s.name}</span></div>
    <div class="emp-row"><span class="emp-lbl">Department</span><span class="emp-val">${s.department||'â€”'}</span></div>
    <div class="emp-row"><span class="emp-lbl">Job Title</span><span class="emp-val">${s.role||'â€”'}</span></div>
    <div class="emp-row"><span class="emp-lbl">Employment Type</span><span class="emp-val">${(s.type||'full_time').replace('_',' ').replace(/\b\w/g,c=>c.toUpperCase())}</span></div>
    <div class="emp-row"><span class="emp-lbl">Join Date</span><span class="emp-val">${s.join_date||'â€”'}</span></div>
    <div class="emp-row"><span class="emp-lbl">Currency</span><span class="emp-val">${cur}</span></div>
  </div>
  <div class="body">
    <div>
      <div class="col-title earn-title">Earnings</div>
      <table>
        ${earningsRows.map(([l,v])=>rowHtml(l,v,'earnings')).join('')}
        <tr class="subtotal-row"><td>Gross Earnings</td><td style="text-align:right;font-family:'IBM Plex Mono',monospace">${grossVal}</td></tr>
      </table>
    </div>
    <div>
      <div class="col-title ded-title">Deductions</div>
      <table>
        ${dedRows.length>0?dedRows.map(([l,v])=>rowHtml(l,v,'ded')).join(''):'<tr><td colspan="2" style="padding:10px;color:#94a3b8;text-align:center;font-size:12px">No deductions</td></tr>'}
        <tr class="subtotal-row"><td>Total Deductions</td><td style="text-align:right;font-family:'IBM Plex Mono',monospace">${dedVal}</td></tr>
      </table>
    </div>
  </div>
  <div class="net-bar">
    <div><div class="net-lbl">Net Pay</div><div style="color:#93c5fd;font-size:11px;margin-top:3px">${periodStr}</div></div>
    <div><span class="net-val">${netVal}</span><span class="net-cur">${cur}</span></div>
  </div>
  ${lastMo&&slip.share>0?`<div class="recon">âœ… Computed from journal entry â€” Period: ${periodStr} آ· Accrued Salaries ref: Entry #${journalEntries.find(e=>e.entry_type==='Accrued Salaries'&&+e.month===finMonth+1)?.entry_no||'â€”'}</div>`:''}
  <div class="ftr">
    <span>Generated: ${now}</span>
    <span>ENEVO Group آ· Egypt</span>
    <span>${slipNo}</span>
  </div>
</div>
<script>window.print();</script>
</body></html>`;
          const win=window.open('','payslip_'+s.id+'_'+Date.now(),'width=760,height=900,scrollbars=yes');
          win.document.write(html);
          win.document.close();
        };

        const generateAll = () => {
          const toGen = psSelectAll ? psStaff : psStaff.filter(s=>psSelected.has(s.id));
          toGen.forEach((s,i)=>setTimeout(()=>generateSlip(s),i*400));
        };

        const AdjRow = ({s}) => {
          const adj=psAdj[s.id]||{};
          const sl=personSlip(s);
          const isUSD=sl.isUSD;
          const CUR=isUSD?'USD':'EGP';
          const fmt=v=>v>0?(isUSD?'$'+v:'EGP '+v):null;
          return(
            <tr style={{borderBottom:'1px solid var(--border3)'}}>
              <td style={{padding:'6px 10px',fontWeight:600,color:'var(--text1)',whiteSpace:'nowrap'}}>
                <input type="checkbox" checked={psSelectAll||psSelected.has(s.id)}
                  onChange={e=>{if(!psSelectAll){const ns=new Set(psSelected);e.target.checked?ns.add(s.id):ns.delete(s.id);setPsSelected(ns);}}}
                  style={{marginRight:8}}/>
                {s.name}
              </td>
              <td style={{padding:'6px 10px',color:'var(--text3)',fontSize:13}}>{s.department}</td>
              <td style={{padding:'6px 8px',fontFamily:"'IBM Plex Mono',monospace",fontSize:13,textAlign:'right',
                color:isUSD?'#38bdf8':'#fb923c',fontWeight:600}}>
                {isUSD?('$'+(sl.basic).toLocaleString('en-US',{minimumFractionDigits:2})):fmtEGP(sl.basicEGP)}
              </td>
              {['transport','housing','bonus','health','advance','absence'].map(field=>(
                <td key={field} style={{padding:'4px 6px'}}>
                  <input type="number" min="0" value={adj[field]||''} placeholder="0"
                    onChange={e=>setPsAdj(prev=>({...prev,[s.id]:{...(prev[s.id]||{}),[field]:e.target.value}}))}
                    style={{width:76,background:'var(--bg2)',border:'1px solid var(--border3)',borderRadius:4,
                      padding:'3px 6px',color:'var(--text0)',fontSize:12,textAlign:'right',fontFamily:"'IBM Plex Mono',monospace"}}/>
                </td>
              ))}
              <td style={{padding:'6px 6px',fontFamily:"'IBM Plex Mono',monospace",fontSize:13,fontWeight:700,
                textAlign:'right',color:sl.isUSD?'#38bdf8':'#34d399'}}>
                {sl.isUSD?('$'+(sl.netUSD).toLocaleString('en-US',{minimumFractionDigits:2})):fmtEGP(sl.netEGP)}
              </td>
              <td style={{padding:'6px 6px',textAlign:'center'}}>
                <button onClick={()=>generateSlip(s)}
                  style={{background:'var(--info)',border:'none',borderRadius:5,padding:'4px 10px',
                    color:'#fff',cursor:'pointer',fontSize:12,fontWeight:600}}>PDF</button>
              </td>
            </tr>
          );
        };

        return(
          <div style={{marginTop:20}}>
            <div className="card" style={{padding:0,overflow:'hidden'}}>
              <div style={{background:'var(--bg0)',borderBottom:'1px solid var(--border)',padding:'14px 20px',
                display:'flex',justifyContent:'space-between',alignItems:'center',flexWrap:'wrap',gap:10}}>
                <div>
                  <div style={{fontSize:15,fontWeight:700,color:'var(--text0)'}}>Pay Slips â€” {MONTHS_[finMonth]} {finYear}</div>
                  <div style={{fontSize:13,color:'var(--text3)',marginTop:2}}>{psStaff.length} employees آ· enter adjustments then generate PDF per person or all at once</div>
                </div>
                <div style={{display:'flex',gap:8,alignItems:'center'}}>
                  <label style={{display:'flex',alignItems:'center',gap:5,fontSize:13,color:'var(--text2)',cursor:'pointer'}}>
                    <input type="checkbox" checked={psSelectAll} onChange={e=>{setPsSelectAll(e.target.checked);if(e.target.checked)setPsSelected(new Set());}}/>
                    All staff
                  </label>
                  <button className="bp" style={{padding:'7px 18px',fontSize:14}} onClick={generateAll}>
                    â¬‡ Generate All PDFs ({psSelectAll?psStaff.length:psSelected.size})
                  </button>
                </div>
              </div>
              <div style={{overflowX:'auto'}}>
                <table style={{width:'100%',borderCollapse:'collapse',fontSize:13}}>
                  <thead>
                    <tr style={{background:'var(--bg2)'}}>
                      {['Employee','Department','Basic','Transport','Housing','Bonus','Health Ins.','Loan/Adv.','Absence','Net Pay',''].map((h,i)=>(
                        <th key={i} style={{padding:'7px '+(i>1?'6px':'10px'),textAlign:i>1?'right':'left',
                          color:'var(--text3)',fontWeight:600,fontSize:12,whiteSpace:'nowrap',
                          borderBottom:'1px solid var(--border3)'}}>
                          {h}
                          {h==='Transport'&&<div style={{fontSize:10,color:'var(--text4)',fontWeight:400}}>Allowance</div>}
                          {h==='Housing'&&<div style={{fontSize:10,color:'var(--text4)',fontWeight:400}}>Allowance</div>}
                          {h==='Bonus'&&<div style={{fontSize:10,color:'var(--text4)',fontWeight:400}}>Variable</div>}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {psStaff.map(s=><AdjRow key={s.id} s={s}/>)}
                  </tbody>
                  <tfoot>
                    <tr style={{background:'var(--bg2)',borderTop:'2px solid var(--border)',fontWeight:700}}>
                      <td colSpan={2} style={{padding:'8px 10px',color:'var(--text0)'}}>TOTALS ({psStaff.length} staff)</td>
                      <td style={{padding:'8px 6px',textAlign:'right',fontFamily:"'IBM Plex Mono',monospace",fontSize:13,color:'#fb923c'}}>
                        {fmtEGP(psStaff.reduce((sum,s)=>sum+personSlip(s).basicEGP,0))}
                      </td>
                      <td colSpan={6}/>
                      <td style={{padding:'8px 6px',textAlign:'right',fontFamily:"'IBM Plex Mono',monospace",fontSize:13,color:'#34d399',fontWeight:800}}>
                        {fmtEGP(psStaff.reduce((sum,s)=>{const sl=personSlip(s);return sum+(sl.isUSD?sl.netUSD*(egpRate||1):sl.netEGP);},0))}
                      </td>
                      <td/>
                    </tr>
                  </tfoot>
                </table>
              </div>
              {lastMo&&(
                <div style={{padding:'10px 16px',borderTop:'1px solid var(--border3)',background:'#f0fdf420',
                  display:'flex',justifyContent:'space-between',fontSize:12,color:'var(--text3)'}}>
                  <span>Journal reconciliation: Accrued Salaries (journal) = <strong style={{color:'#34d399'}}>{fmtEGP(lastMo.net)}</strong></span>
                  <span>Total net from staff table = <strong style={{color:'#34d399'}}>{fmtEGP(psStaff.reduce((sum,s)=>{const sl=personSlip(s);return sum+(sl.isUSD?sl.netUSD*(egpRate||1):sl.netEGP);},0))}</strong></span>
                </div>
              )}
            </div>
          </div>
        );
      })()}

    </div>
    );
  })()}

</div>
  );
}



/* â•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گ
   FUNCTIONS TAB â€” standalone component
   â•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گ */

export { fmtEGP, fmtEGPsigned, JournalLedger, BalanceSheetView, ExpensesView, CashCustodyView, TaxSocialView, FixedAssetsView, FinanceReports, AccountantGuide, ActivityLogTab, FinanceTab };


