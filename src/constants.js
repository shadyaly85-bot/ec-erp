/* =========== CONSTANTS & STATIC DATA =========== */

export const LEAVE_TYPES = ["Annual Leave","Sick Leave","Public Holiday","Business Travel","Training External","Unpaid Leave"];

export const FUNCTION_CATS = [
  "Internal Training — Given",
  "Internal Training — Received",
  "Tendering Support — Local",
  "Tendering Support — International",
  "Mentoring & Coaching",
  "R&D & Innovation",
  "Client Meetings",
  "Documentation & Reporting",
  "Proposal Writing & BD",
  "Other Function",
];

export const FUNC_COLORS = {
  "Internal Training — Given":        "#a78bfa",
  "Internal Training — Received":     "#818cf8",
  "Tendering Support — Local":        "var(--info)",
  "Tendering Support — International":"#0ea5e9",
  "Mentoring & Coaching":             "#34d399",
  "R&D & Innovation":                 "#10b981",
  "Client Meetings":                  "#fb923c",
  "Documentation & Reporting":        "#f59e0b",
  "Proposal Writing & BD":            "#ec4899",
  "Other Function":                   "#6b7280",
};

export const MONTHS = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];

export const PHASES = ["Design","Basic Engineering","Detailed Engineering","Software","FAT","Commissioning","Closed"];

export const LEVELS = ["Junior","Mid","Senior"];

export const ROLES_LIST = [
  "Engineering Manager","Technical Lead","Senior Automation Engineer","Senior SCADA Engineer",
  "Senior RTU Engineer","Senior Protection Engineer","Automation Engineer","SCADA Engineer",
  "RTU Engineer","Protection Engineer","PLC Programmer","Junior Automation Engineer",
  "Junior SCADA Engineer","Junior RTU Engineer","Junior Protection Engineer",
  "Commissioning Engineer","Control Systems Engineer","Electrical Engineer",
  "Instrumentation Engineer","Project Engineer","Renewable Energy Specialist",
  "CTO","CEO","General Manager","Operations Manager","Project Manager",
  "Accountant","Financial Manager","HR Manager","Administrative Manager",
  "IT Manager","Document Controller","Other",
];

export const ROLE_TYPES  = ["engineer","lead","accountant","senior_management","admin"];
export const ROLE_LABELS = {engineer:"Engineer",lead:"Lead Engineer",accountant:"Accountant",senior_management:"Senior Management",admin:"Admin"};
export const ROLE_COLORS = {engineer:"var(--text3)",lead:"var(--info)",accountant:"#a78bfa",senior_management:"#94a3b8",admin:"#34d399"};

export const isBillableRole = r => r==="engineer" || r==="lead";

export const DAY_NAMES      = ["Sun","Mon","Tue","Wed","Thu","Fri","Sat"];
export const DEFAULT_WEEKEND = [5, 6];

/* =========== DATE HELPERS =========== */
export const fmt = d => d.toISOString().slice(0,10);
export const today = new Date();

export const fmtCurrency = n => `$${(n||0).toLocaleString(undefined,{minimumFractionDigits:0})}`;
export const fmtPct      = n => `${Math.round(n||0)}%`;

export const getWeekDays7 = date => {
  const d=new Date(date), day=d.getDay();
  const sun=new Date(d); sun.setDate(d.getDate()-day);
  return Array.from({length:7},(_,i)=>{const x=new Date(sun);x.setDate(sun.getDate()+i);return fmt(x);});
};

export const getWorkDaysInMonth = (y,m,wd=[5,6],fromDay=1) => {
  const days=[]; const total=new Date(y,m+1,0).getDate();
  for(let d=Math.max(1,fromDay);d<=total;d++){const dt=new Date(y,m,d);if(!wd.includes(dt.getDay()))days.push(fmt(dt));}
  return days;
};

export const getTargetHrs = (y,m,wd=[5,6],fromDay=1,upToDay=null) => {
  const total=new Date(y,m+1,0).getDate();
  const end = upToDay ? Math.min(upToDay,total) : total;
  let count=0;
  for(let d=Math.max(1,fromDay);d<=end;d++){const dt=new Date(y,m,d);if(!wd.includes(dt.getDay()))count++;}
  return count*8;
};

export const minPostDate = () => { const d=new Date(today); d.setMonth(d.getMonth()-1); d.setDate(1); return fmt(d); };
export const maxPostDate = () => { const d=new Date(today); d.setMonth(d.getMonth()+2); d.setDate(0); return fmt(d); };
export const isDateAllowed = date => date >= minPostDate() && date <= maxPostDate();