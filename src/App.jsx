import React, { useState, useEffect, useMemo, useCallback } from "react";
import { supabase } from "./supabase";


/* ─── COMPANY LOGO (embedded) ─── */
const LOGO_SRC="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAUDBAQEAwUEBAQFBQUGBwwIBwcHBw8LCwkMEQ8SEhEPERETFhwXExQaFRERGCEYGh0dHx8fExciJCIeJBweHx7/2wBDAQUFBQcGBw4ICA4eFBEUHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh7/wAARCADwAPADASIAAhEBAxEB/8QAHQABAAIDAQEBAQAAAAAAAAAAAQACBQYHCAQJA//EAEoQAAEDAwIDBAQGDwgBBQAAAAEAAgMEBQYHEQgSIRMxQVEUFSJhGDJCVnGBFjdDUmJydYKRlaGis9LTCSMkM1OSlKOTF2OFsbL/xAAZAQEBAQEBAQAAAAAAAAAAAAABAAIEAwX/xAAkEQEBAQACAgICAgMBAAAAAAAAAQIDERIhMUEEEyJRIzOx8P/aAAwDAQACEQMRAD8A8yhRASvqPjLKBASkEJQEqVKiAlIRKEhSKUJCWSEqqsEohKqlSpUCiiYyUhAUSFkhCikVYKqQoFKEhIKiiikiiiigxSQqpC53VSrBVSmApCEhKKUKBQKiiiUsogJUCkKoStBZIVQlSWUQlQQJQkJFISqpSFgogJUiEoCUslKAlSRRRRSrEhKqkLndRCUJUFlEBK0ClASpUhRASmBEoSFIpQkJBCVVISFglVSpFRRRMBSFUJSyskKqVIpCEqBShISCohKkxCQhRc7qWUCAlSKQhITGSkIUSlkgoUUCooolFKAlQISFUJTAskKoSlLKISoIlCgSKsEqqsEhAUoT4KRCVVWTGSlVCVJiVFAoud1IrKqQpEJQkKBBSqqy0CEqoSpLBRASmBEhCikskIUCRVkqqQkEJQkKRUUUTAUhVCUsrKBASpFIQoFCrJCN0hIYgJQkLnjrRIQooLKBfXZbXc71cI7dZ7dV3Gtl+JT0sLpJHfmtBO3vXS7bw7aw18AmZiDqdpG4FTWwRO/2l+4RdSfNamda+I5UkLsHwaNY/m3SfrSD+ZaPqNgGU6e3Glt+V0EVHUVcJmhbHUMlDmB3KTu0nbqqbzfUovHqTuxrCQt5060kzvUC01F1xW1U9ZSU85p5HyVkcRDw0O22cQT0cOq/rn+juoWCWNt7yWyR01AZmwmWKqjm5XO35eYNJIB2237t9h4p8899drw11316aEoFFuem+l+aahwVs2KW2CsZQvYyoMlVHFylwJb8YjfoD3Jtk91iZtvUaaotm1EwTJtP7tT2rKaKKjq6iD0iJkdQyUGPmLd92kgdWnotZWpZZ3FZZeqQUrf8Y0W1RyOnZU23DbgKeQbslqiyma4eY7QtJH1LPjhr1i+bdIP/AJOD+ZZ/ZmfbX6t36ci3UXSMw0O1KxHG6vIb9Zaamt1GGmaRtfFIW8zg0ey07nq4L+mLaE6l5Pj1Ff7JZ6Kqt1bH2kEvrGFvMN9uoJ3BBBBB7iE/sz132z+vffXTmqgWUyvH7tiuRVmP32k9EuNG4Nmi5g4DdocCCOhBBB3Cxa3L2zZ0sor0kE1XVQ0tNG6WeaRscTGjcvc4gNA95JAXU7jw86rW631FwrbHQwUtNE6aaR1zg2YxoJcT7XgAVm6mfmqY1r4jlKQiMOkc1rGuc55Aa0DcknuAHn7l03F9BdVb/TMqqfFpKKneN2vuEzKckefK48/7q1dTPzRMa18RzNWXaKjhh1Wih546SzTu/wBOO4gO/eaB+1cwzHFchw68eqMmtc1treQSNjkLTzMJIDmlpIIJBG4PgjPJnXxVrj3n3YwwShIW2CEqqsmMsQO5IVUrmdiy+q0W+ru12o7Vb4TNWVk7KeCMfKke4NaP0kL5N11nhGtkVz1/xxszeZlL29Xt+FHE7lP+4gq1ep2s58tSPaekenmN6VYW2jpW07ahkPa3O5SANdO8DdznOPcwddm9wA89yuM5nxe2iiuk1LiuLS3WljcWtrKqq9HbLt8prA1zuU+BOx9wXdNZMbu+XaZ3vGbFW09FXXGAQNmnLgxrC5vODygnqzmHd4ryt8EDPPnNjX/f/IuPj8L73Xdyeeepxxl/hjXf5h0P6zf/AE1yDXbVOp1VvluutVZYbU6hpXU4ZHUGUPBfzb7lo2XSfggZ3858b/7/AORct1n0vvGlt5oLXebjQV0tbTuqGOpOflaA7l2PMB13Xvj9ff8AH5c3J+7x/l8PTfAH9rC+flt38CJduyq2WHNLDe8Sr3xVMMkXo1bE1274S9gew+5wBa5p8wFxHgD+1hfPy27+BEsZlGo3/p9xi1sdfP2djvNFRUtdzH2YnchEc35rjsT964+S8NZut3p041M8ee3lrO8ZuWG5fcsZuzdqugmMZdtsJW97JB7nNIcPpXp7+z3O9szNvlUUh/ckWT43tOPXONQ6gWuDmrrSzs7gGDrJSk9H+8xuO/4rneSxH9ns7/CZqz/3aI/uzL23vz4u3jjj8ObpqvHx9tKxfkQfx5FuXBfpPbfUUWo1/o46msqZHC0xytDmwRtJaZtj8tzgdj4AbjvWl8fpI1PspHeLECP/ADyr1zpzbIrNgGP2mFgYykttPDsPdG3f9u6xrVnFJPtrjxNc2rfpznW/iAxzTa6+oobfNe72GB8tPFKI46cOG7e0eQfaI68oBO3U7bjfk54wrqSdsEotvDe5v/pq+dcMGf5Nml6yGTJceBuNdLUgPM3M1rnEtafY8G8o+pYYcIedfObG/wDv/kWszhk90b1z2+p6Y7VPiTuOeYHc8TnxKkoY69rGmoZXOkLOWRr+jSwb/F27/Fb7wH5t2tDdcCrJvbpybhQBx+Q4gSsH0O5Xbfhlcy1I4ccrwXCrhlVyv1kqaWgax0kVOJe0dzPawbczQO9wXOtLssqMHz+z5RTlxFDUAzsb90hd7MrfrYT9ey9PDGsWYeP7N45JdvQPHlhvY3Cz53SRbMnb6uriB8tu7onH6Rzt+pq8thfpPqnjdHqPpRc7PTSRzNuNGJqCYdR2gAkheD5bhv1Er82pY5IZXxTsMUkbi2RjuhY4HYg/QQU/jb7z1/S/Kx478p9u18G+GfZNqxFd6mLnoMfjFY8kdDOd2wt+o8z/AMwLuvGtmfqDTSPG6WXlrcgl7FwB6tpmbOlP1nkZ+cVmuEjDPsS0hoqmph7O43o+sKjcbODXACJh+hmx+lxXlXiezE5vq7c5KabtKC3n1bREHcFrCQ94/GkLjv5ALzn+Tl7+o9L/AIuDr7rvHBxpTQW/G6bUG90jJ7rcAX24St39Fg7g9oPc9/U7+DdgO8r0kAvgx2gitdgt9sgaGxUlLFAwDwaxgaP/AKX3rm3u713XZx4mMyR/OqnhpqaWoqJWRQxML5HvOzWtA3JJ8gF5a0PmoNYNc8/yS8W+KvsktuFDBBOzdogdIBGNvAlsRduOoLisvxcamg08umWOVQNbUxGS91DT7NJSgczmE+BcOrvJuw73hfbwTWeCyabPvFSTFPklyeKVrh1fHCxwaP3JSvXOfDjuvuvDWvPlmZ8R5n10wKTTnUWtx9rpJaFzRU2+V/xnwP32BPi5pDmk+PLv4rRgvVPH7bog7Ebu1v8Aek1NK8+bdmPb+3m/SvKy7eHXliWvnc+JjkshSEAqL1eNYlIQoud1rLr3B7cIaDiAsHbODW1UdTTAn750Li0fWW7fWuQL78eutbYr7QXq2ydnWUFTHUwOPcHscHDf3dNj7kancsOb46lfpFrxkt7xDSi95NjrKZ9woI45WNqIy9nJ2jQ8kAjuaSe/wXkk8V2qe/8AlY5/wH/1F6000zjFtW8DdU0vYzx1EBgudtlIL4HObs+N7fFp3Ozu5w/ZwzJeDymmuUs2O5m6konvJjp6yi7Z0Q+952vHMB5kb+e65eO4nc3Hbyzeuriuf/Cu1T/0sc/4D/6i51qtqTkepd1orlkjaBs9HA6CL0SExt5S7mO4Ljud13EcHN2+ftD+rH/1FyDXfSyp0pvtutVTeobq6upXVAkjpzEGAP5dti47r2xePv8Ai5uTPL4/y+HpPgC+1hfPy27+BEuKcazdtea7cdHW6kP7rgu1cAX2r75+W3fwIlxrjdbtrrMfO10p/wD2s4/3V6b/ANEegOEzUCDUHTKTGr49lVdLREKOqZL19JpnAtjeQe/du7He9u571ThswKfTfUjULHuV5t8hoqm2yu+6U7jPyjfxLSCw/i7+K8i6LZ3V6dahW/JIOd9Mx3Y18LT/AJ1O4jnb9I2Dh72hfpRa6yjuVvprlQTR1FNVQtlhmZ1D2OG7SD5EHdefLm4t6+K3wanJJb8x4w4/dzqdZQO/1ENv/PKvX2C3CK64TZLnA4Ojq7fTzNIPg6NpXkPj5+2lYvyIP48i3vgx1ZttVjlNpzfKplPcqIuba3SO2FTCSSIwT8thJAHi3bbuK1rNvFLBx7mebUv20fNeJXVKw5jerGYLA0W+4T0wD6F5dyskIbv/AHnkAViPhV6o/wCnjv8AwH/1F3jW/h0seoeQPyO3Xd9iu0zQKoinEsVQQAGuc3dpa7YAEg9QBuN+q5n8D27fPuh/Vj/6i1nXDZ7jG8c8vqub55xA59muJ12MXlllFBXBrZjBSOZJs17XjYl526tHguTrvWqfDXcMDwK55ZPl1LXsoGscadlA6Mv5pGs+MXnb42/d4Lgq6OO4s/i5uWbl/m9ycFWbfZFpk7HKubmr8fkEA3PV1M7cxH6tnM/NC5fqjo6+v4rKK0QU5FmyKT1rMWjoyNp3qm+7dw/7QuccMubfYPq3bKuom7O23A+r67c7NDJCOV5/Ffyn6N1+hbqamfVx1j4InVETHRxyloLmNcQXAHvAJa3fz5R5Ll5LeLds+3XxSc3HJfpoPEDmDMA0kut0pXNhrHxCit7W9NppBytI/FG7vzV+dAeYyJASSz2tyep26r0RxyZp63zqiw+kl5qWyxdrUgHoamUA7H8WPl/3led10fj48cd/25/yt+W+v6fqZaLjT1lgpLqJWNp56VlQHl2zQxzA7cny2K4DrRxDRio+w7Strr1fqp/o4radnaxxvPTlhH3WT3/FHf17l54xuvzbUWhgxSvzimt2P2eibzi41wp6aGnZ0BLBsZnDoNup7u5fReMuxnDLbUWLTH0iesnY6GvymqZ2dRMw9DHTM+4Rnxd8Yj9K8s8El9+3tv8AJtz69T/3w/nX2Oqfe6fTq0VTbrld6rWsvte2TtWtlLub0dr/AJTYzvJK/wCU9u3czr6+t9NSWnUrCsAtHSkx6w1FbKB5EMp4ife7eYrnPCPpezErHPqTlkbaOrnpXOo2Tjl9EpduZ8rt/iueB9TR+EVsvD7dWZBcM41hvEjKOgudUKagkqHBjYaGmBAcSegBJJPvBWeXXffX1/08OfHq35v/ACNJ4/q6LscQtjXAy9pVVDm+TQI2A/pJ/QvKS6JxE6gM1F1KqrvRl/qqljFJb+YbF0TSSX7eHO4l30cq50Cuvhzc4kri/I3N8lsIShIXq8WICUBK53UQlVSpMlj97vGP3JlysV0rLZWsGzZ6WZ0b9vIkd49x6LpNBxG6x0cIibl3bgeNRQQPd+nk3XJQlVzL8wzWs/Fdi+ExrH85KT9VwfyrR9RdQMq1CuNLcMrr4q2opYTDC5lOyINYXcxGzQN+q1VIKJjM+ILvV9Wt7061bzzT+01FrxW7QUdJUTmokY+jjlJeWhu+7gSOjR0WFz3Mcgzm/m+5LVx1deYWQdoyFsQ5G77DlaAPE9Vr6QnxkvYur1136I710rDdctTcRx2lx+x3+KG3UgIgjlo4pSxpJPKHOBO25Ow8FzRITZNfIzq5+K2fUTPMn1Au9Pdcqro6yrp4PR43sp2RAR8xdts0AHq49VrbXFrg5pIIO4IOxB81VITJJ6gtt910fHtctV7FTspqLNK+SFg5Wsq2R1Ow8t5Gl37VmvhK6xfOSk/VkH8q4+kI8Mf0Zybn26RmOuOpWXY3V47fr3T1NtrA0TxNoIoy4NcHD2mjcdWjuXOAtp01wK/5/d56CyNpooqSHt62sq5eyp6WL757vDuPQdeh8AStldphjDCWv1pwTmHfyumcP0hvVXeMeofHe/dcxPUELrdHxGavUtJDSxZLAY4Y2xtL7fC5xAGw3JbuT07ysJp7pm7LMVvGTVGV2aw2y01TKaeevbIWkvA5SC0dASQFlGaNTXS319Rh+d4plVVQU7qmagoZntqHRt7y1rhs7by3HgPEI1rF9VZzySd5c5vd0rr1eay8XOodUV1bO+eolIA53uO5Ow6D6B3L5Atz0606u2Y26vvXrC22SwW7YVl2uUpjgjcRuGN2G737EdB5jzCzlXpDJWWC4XnCszsGYNtkXbVtJQ9pHUxxjveI3jdwG3h9W56Lfnmemf16s7cx2B23AO3ULL4hem49kVJejabddnUr+0ZTV7HPhc8dxc1pG+x6gHpv3grJUWFVlVpdX5+yuphRUdyjt7qctd2jnvDSHA923tD39E6X4TW57kM9loK2mo5YaKasMk7XOaWx7bt9nrueZN1Or2zM67nTetS+IjNc5xOoxqqobVbKSqLRUvohJ2krAdywlzjs0nbfbv227iVz28Zrk91xuhxqru0wslBG2Ont8IEUA268zmt253bknmdudySs9p9pocqwu45bV5XZsftlBVspJZLg2Qjne1pb1aPHmA+lfXedJKqPErlk2NZfjmWUVqAfcGWyV/bU7D8sscOreh+oE9disT9eb1G7+3U8q5sEo7kr3c9WUQEqTEJCEhc7qKQhRSWSqhIVAVFFEghKAlSKQqhKWVlAgJSllAgJUK7dpaH/AAW9VTQb+l+k0fpPJ8b0fdu+/wCDt2m/u3VtFMR0hz68WzF54s3gvk1I6SpnbVU7aXtI2cz+QcpcGk77b/Wuc6aZ7kGAXia4WN9PIyqh7Cso6uLtKeqi+9e3cb952III3PgSFvGOa4UuO3ll6smlOE264sa5rZ6Zk0bgHDZwGzugIXlrOvfTozrF67+md0bjxwcO2okWVT3WG0NvNI2Z9uYx9QNizl5Q/wBnv23926zWlEOBWew5Xlek897veVW60y/4K9uZAYad3+ZMxrG7SEco9nm93TcLidqzmvt+nmQYVHQ0r6S+VcVVNO5zu0jdG5pAaO7Y8vj5o0xzevwO+Vd1oKKmrTV0E1DLDUOcGmOTl3Ps9dxyhV47exOSTp0HJN/gdYj6ASYDkdQbgW9xl/veTm+rl2+pfz4NjONdaHl39H9X1fpe/wAXsuQfG93NyLT9OdSLthtprrCbfbL7j1wIdV2q5xGSF7wAA9pHVjtgOo8h03AWWr9W56ewV9mwzELBh0Nyj7GuqLe176maM97O1ed2tPkP2JuddXPXyJrPc1b8NgtwifwnZgKQbwszCFzdvCM9mGn6NiF/PhCBGptzkI2azHa1zj5D2Oq0vTXUO64TDcqCK3268WW6sDK+13CIvgm2+K7p1a4eY93ToNs3W6uSU1guNnw3DcexCO5xGGuqaBr5KmWM97BI8+y07+A+jZNzrq5/tZ3nuat+G26P2+y3Thgy2kv+Qtx+gdfqQvrTSPqAwhkRaORnU7np7l89qvmnWm+DZdSY3mFTl17yK3+row21yUsFNGeYOc4v7z7RPTyA26krm9szWuoNM7rgcdFSuornXRVslQS7tWOj5dmtHdt7A7/NawmcfdvbN5JJOp76Hd0CQoovZzlIQEhIYlRRRc7qIKUBKkQlVSpLBRASkVEhCigskIUChVglVSFoEJQkKRCUKBQKQhRKWUCAlQpSEDuUWgskIUCksooooIEoStCsUoooud0okISpFQKKKSyVUJVAVFFEghKqFZSIKiAlIWUCAlIKUBKlSogJSCFEJCkQlCQlkhKqrJRCVVKlSoFFExli1FFF4OlFFFFIhKEqSBKEhSISgJSKiQhRQWSEKKFKsqpCYCkISEopCFAoFRRRKWUQEqFKQgKLQWSFUJUllFFFBi1FFF4uhFFFFJEhCVIqBQKKRSEBIUiooolkhKqkKSwUQlQWCiAlaBCVUJUqsogJSEShIUikISEskJVVYJRCVVKlWMUUUXi90UUUUkUUUUiEqqsFJAlCQVIhKEhMFRIQooLKBASoFIQEhMBSEKBKWSEKBQKiiiUQlVCsoFIVQlMCygQClKf/2Q==";
const LogoImg=()=>(<img src={LOGO_SRC} alt="ENEVO Group" style={{width:64,height:64,borderRadius:12,objectFit:"contain",background:"transparent"}}/>);

/* ─── STATIC DATA ─── */
/* TASK_CATEGORIES defined below after TAXONOMY_GROUPS — see line ~1590 */
const LEAVE_TYPES  = ["Annual Leave","Sick Leave","Public Holiday","Business Travel","Training External","Unpaid Leave"];
const FUNCTION_CATS = [
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
const FUNC_COLORS = {
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
const MONTHS       = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
const PHASES       = ["Design","Basic Engineering","Detailed Engineering","Software","FAT","Commissioning","Closed"];
const LEVELS       = ["Junior","Mid","Senior"];
const ROLES_LIST = [
  // Engineering
  "Engineering Manager","Technical Lead","Senior Automation Engineer","Senior SCADA Engineer","Senior RTU Engineer","Senior Protection Engineer",
  "Automation Engineer","SCADA Engineer","RTU Engineer","Protection Engineer","PLC Programmer",
  "Junior Automation Engineer","Junior SCADA Engineer","Junior RTU Engineer","Junior Protection Engineer",
  "Commissioning Engineer","Control Systems Engineer","Electrical Engineer","Instrumentation Engineer","Project Engineer",
  "Renewable Energy Specialist",
  // Management & Operations
  "CTO","CEO","General Manager","Operations Manager","Project Manager",
  // Support
  "Accountant","Financial Manager","HR Manager","Administrative Manager",
  "IT Manager","Document Controller","Other",
];
// role_type hierarchy: engineer < lead < accountant < admin
// engineer: post own hours only, no reports
// lead: post own hours, edit any engineer hours, export individual timesheet PDF
// accountant: read-only, export invoices + reports, no editing
// admin: full access
const ROLE_TYPES   = ["engineer","lead","accountant","senior_management","admin"];
const ROLE_LABELS  = {engineer:"Engineer",lead:"Lead Engineer",accountant:"Accountant",senior_management:"Senior Management",admin:"Admin"};
const ROLE_COLORS  = {engineer:"var(--text3)",lead:"var(--info)",accountant:"#a78bfa",senior_management:"#94a3b8",admin:"#34d399"};
// Only engineer and lead post billable hours — excluded from utilization: accountant, senior_management, admin
const isBillableRole = r => r==="engineer"||r==="lead";

const fmt          = d => d.toISOString().slice(0,10);
const today        = new Date();
const fmtCurrency  = n => `$${(n||0).toLocaleString(undefined,{minimumFractionDigits:0})}`;
const fmtPct       = n => `${Math.round(n||0)}%`;
const DAY_NAMES    = ["Sun","Mon","Tue","Wed","Thu","Fri","Sat"];
const DEFAULT_WEEKEND = [5,6];

const getWeekDays7 = date => {
  const d=new Date(date), day=d.getDay();
  const sun=new Date(d); sun.setDate(d.getDate()-day);
  return Array.from({length:7},(_,i)=>{const x=new Date(sun);x.setDate(sun.getDate()+i);return fmt(x);});
};
const getWorkDaysInMonth = (y,m,wd=[5,6],fromDay=1) => {
  const days=[]; const total=new Date(y,m+1,0).getDate();
  // fromDay lets us start counting from the engineer's join date within the month
  for(let d=Math.max(1,fromDay);d<=total;d++){const dt=new Date(y,m,d);if(!wd.includes(dt.getDay()))days.push(fmt(dt));}
  return days;
};
// upToDay: for terminated engineers, stop counting after termination day
const getTargetHrs = (y,m,wd=[5,6],fromDay=1,upToDay=null) => {
  const total=new Date(y,m+1,0).getDate();
  const end = upToDay ? Math.min(upToDay,total) : total;
  let count=0;
  for(let d=Math.max(1,fromDay);d<=end;d++){const dt=new Date(y,m,d);if(!wd.includes(dt.getDay()))count++;}
  return count*8;
};

// Posting limit: 1 month past to 1 month future
const minPostDate = () => { const d=new Date(today); d.setMonth(d.getMonth()-1); d.setDate(1); return fmt(d); };
const maxPostDate = () => { const d=new Date(today); d.setMonth(d.getMonth()+2); d.setDate(0); return fmt(d); };
const isDateAllowed = date => date >= minPostDate() && date <= maxPostDate();

/* ─── PDF HELPERS ─── */
const PDF_STYLE = `
  @import url('https://fonts.googleapis.com/css2?family=IBM+Plex+Sans:wght@300;400;600;700&family=IBM+Plex+Mono:wght@400;600&display=swap');
  *{margin:0;padding:0;box-sizing:border-box}
  body{font-family:'IBM Plex Sans',sans-serif;color:#1a2332;font-size:13px}
  /* ── Fixed header repeats on every page ── */
  .pdf-hdr{
    position:fixed;top:0;left:0;right:0;height:38px;z-index:1000;
    background:#0a1628;
    border-bottom:2px solid #0ea5e9;
    display:flex;align-items:center;justify-content:space-between;
    padding:0 28px;
  }
  .pdf-hdr-left{display:flex;align-items:center;gap:10px}
  .pdf-hdr-logo{width:26px;height:26px;border-radius:5px;object-fit:contain}
  .pdf-hdr-brand{font-family:'IBM Plex Mono',monospace;font-size:11px;letter-spacing:.15em;color:#38bdf8;font-weight:600}
  .pdf-hdr-title{font-size:12px;color:#94a3b8}
  .pdf-hdr-right{font-family:'IBM Plex Mono',monospace;font-size:11px;color:#475569}
  /* ── Fixed footer repeats on every page ── */
  .pdf-ftr{
    position:fixed;bottom:0;left:0;right:0;height:28px;z-index:1000;
    background:#f8fafc;
    border-top:1px solid #e2e8f0;
    display:flex;align-items:center;justify-content:space-between;
    padding:0 28px;
    font-size:10px;color:#94a3b8;
  }
  .pdf-ftr-left{display:flex;align-items:center;gap:8px}
  .pdf-ftr-dot{width:4px;height:4px;border-radius:50%;background:#0ea5e9}
  /* ── Content area (pushed below header, above footer) ── */
  .pdf-body{padding-top:50px;padding-bottom:38px}
  .cover{background:linear-gradient(135deg,#0a1628,#0f2a50 60%,#153d6e);color:#fff;padding:44px 44px 44px;position:relative;overflow:hidden;margin-top:38px;page-break-after:always}
  .cover::before{content:'';position:absolute;right:-60px;top:-60px;width:280px;height:280px;border:2px solid rgba(56,189,248,0.15);border-radius:50%}
  .cl{font-family:'IBM Plex Mono',monospace;font-size:11px;letter-spacing:.2em;color:#38bdf8;text-transform:uppercase;margin-bottom:8px}
  .ct{font-size:22px;font-weight:700;line-height:1.2;margin-bottom:6px}.cs{font-size:13px;color:#94a3b8}
  .cm{display:flex;gap:36px;margin-top:14px}.cm label{font-size:11px;color:#64748b;letter-spacing:.1em;text-transform:uppercase;display:block}
  .cm span{font-family:'IBM Plex Mono',monospace;font-size:13px;color:#e2e8f0}
  .body{padding:24px 32px;padding-top:28px}.section{margin-bottom:22px;page-break-inside:avoid}
  .st{font-size:13px;font-weight:700;color:#0f2a50;text-transform:uppercase;letter-spacing:.08em;padding-bottom:6px;border-bottom:2px solid #0ea5e9;margin-bottom:10px}
  .kg{display:grid;grid-template-columns:repeat(4,1fr);gap:10px;margin-bottom:4px}
  .kp{background:#f0f7ff;border:1px solid #bfdbfe;border-radius:6px;padding:10px}
  .kv{font-family:'IBM Plex Mono',monospace;font-size:20px;font-weight:700;color:#0ea5e9;line-height:1}
  .kl{font-size:11px;color:#64748b;text-transform:uppercase;letter-spacing:.08em;margin-top:4px}
  table{width:100%;border-collapse:collapse;font-size:12px}
  th{background:#0f2a50;color:#fff;padding:6px 8px;text-align:left;font-weight:600;font-size:11px;letter-spacing:.05em;text-transform:uppercase}
  td{padding:5px 8px;border-bottom:1px solid #e2e8f0;vertical-align:top}tr:nth-child(even) td{background:#f8fafc}
  .cover-page td{vertical-align:middle !important;padding:0 !important}
  .cover-page th{vertical-align:middle !important;padding:0 !important}
  .cover-page tr:nth-child(even) td{background:transparent !important}
  .cover-page table td,.cover-page table th{border:none !important}
  .footer{display:none}
  @media print{
    body{-webkit-print-color-adjust:exact;print-color-adjust:exact}
    @page{margin:14mm}
    .pdf-hdr{display:none !important}
    .pdf-ftr{display:none !important}
    .pdf-body{padding-top:0 !important;padding-bottom:0 !important}
    .cover{margin-top:0 !important}
    .body{padding-top:16px}
    .section{page-break-inside:auto}
    table{page-break-inside:auto}
    tr{page-break-inside:avoid;page-break-after:auto}
  }`;

/* Shared logo base64 ref for PDFs */
function pdfHeader(titleText, subtitleText, now){
  return `<div class="pdf-hdr">
    <div class="pdf-hdr-left">
      <img src="${LOGO_SRC}" class="pdf-hdr-logo" alt="ENEVO"/>
      <span class="pdf-hdr-brand">ENEVO-ERP</span>
      <span style="color:#192d47;font-size:12px">|</span>
      <span class="pdf-hdr-title">${titleText}</span>
    </div>
    <div class="pdf-hdr-right">${subtitleText || now}</div>
  </div>`;
}

function pdfFooter(leftText, now){
  return `<div class="pdf-ftr">
    <div class="pdf-ftr-left">
      <div class="pdf-ftr-dot"></div>
      <span>ENEVO Group · Industrial &amp; Renewable Energy Automation</span>
      <span style="color:#cbd5e1">·</span>
      <span>${leftText||""}</span>
    </div>
    <span>CONFIDENTIAL · ${now}</span>
  </div>`;
}

function generatePDF(title, sections, subtitle="ENEVO Group"){
  const win=window.open("","pdf_"+Date.now()+"_"+Math.random().toString(36).slice(2));
  const now=new Date().toLocaleDateString("en-GB",{day:"2-digit",month:"short",year:"numeric"});
  let html=`<!DOCTYPE html><html><head><meta charset="utf-8"><title>${title}</title><style>${PDF_STYLE}</style></head><body>
  ${pdfHeader(title, subtitle, now)}
  ${pdfFooter(subtitle, now)}
  <div class="cover">
  <div style="display:flex;align-items:center;gap:14px;margin-bottom:16px">
    <img src="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAUDBAQEAwUEBAQFBQUGBwwIBwcHBw8LCwkMEQ8SEhEPERETFhwXExQaFRERGCEYGh0dHx8fExciJCIeJBweHx7/2wBDAQUFBQcGBw4ICA4eFBEUHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh7/wAARCADwAPADASIAAhEBAxEB/8QAHQABAAIDAQEBAQAAAAAAAAAAAQACBQYHCAQJA//EAEoQAAEDAwIDBAQGDwgBBQAAAAEAAgMEBQYHEQgSIRMxQVEUFSJhGDJCVnGBFjdDUmJydYKRlaGis9LTCSMkM1OSlKOTF2OFsbL/xAAZAQEBAQEBAQAAAAAAAAAAAAABAAIEAwX/xAAkEQEBAQACAgICAgMBAAAAAAAAAQIDERIhMUEEEyJRIzOx8P/aAAwDAQACEQMRAD8A8yhRASvqPjLKBASkEJQEqVKiAlIRKEhSKUJCWSEqqsEohKqlSpUCiiYyUhAUSFkhCikVYKqQoFKEhIKiiikiiiigxSQqpC53VSrBVSmApCEhKKUKBQKiiiUsogJUCkKoStBZIVQlSWUQlQQJQkJFISqpSFgogJUiEoCUslKAlSRRRRSrEhKqkLndRCUJUFlEBK0ClASpUhRASmBEoSFIpQkJBCVVISFglVSpFRRRMBSFUJSyskKqVIpCEqBShISCohKkxCQhRc7qWUCAlSKQhITGSkIUSlkgoUUCooolFKAlQISFUJTAskKoSlLKISoIlCgSKsEqqsEhAUoT4KRCVVWTGSlVCVJiVFAoud1IrKqQpEJQkKBBSqqy0CEqoSpLBRASmBEhCikskIUCRVkqqQkEJQkKRUUUTAUhVCUsrKBASpFIQoFCrJCN0hIYgJQkLnjrRIQooLKBfXZbXc71cI7dZ7dV3Gtl+JT0sLpJHfmtBO3vXS7bw7aw18AmZiDqdpG4FTWwRO/2l+4RdSfNamda+I5UkLsHwaNY/m3SfrSD+ZaPqNgGU6e3Glt+V0EVHUVcJmhbHUMlDmB3KTu0nbqqbzfUovHqTuxrCQt5060kzvUC01F1xW1U9ZSU85p5HyVkcRDw0O22cQT0cOq/rn+juoWCWNt7yWyR01AZmwmWKqjm5XO35eYNJIB2237t9h4p8899drw11316aEoFFuem+l+aahwVs2KW2CsZQvYyoMlVHFylwJb8YjfoD3Jtk91iZtvUaaotm1EwTJtP7tT2rKaKKjq6iD0iJkdQyUGPmLd92kgdWnotZWpZZ3FZZeqQUrf8Y0W1RyOnZU23DbgKeQbslqiyma4eY7QtJH1LPjhr1i+bdIP/AJOD+ZZ/ZmfbX6t36ci3UXSMw0O1KxHG6vIb9Zaamt1GGmaRtfFIW8zg0ey07nq4L+mLaE6l5Pj1Ff7JZ6Kqt1bH2kEvrGFvMN9uoJ3BBBBB7iE/sz132z+vffXTmqgWUyvH7tiuRVmP32k9EuNG4Nmi5g4DdocCCOhBBB3Cxa3L2zZ0sor0kE1XVQ0tNG6WeaRscTGjcvc4gNA95JAXU7jw86rW631FwrbHQwUtNE6aaR1zg2YxoJcT7XgAVm6mfmqY1r4jlKQiMOkc1rGuc55Aa0DcknuAHn7l03F9BdVb/TMqqfFpKKneN2vuEzKckefK48/7q1dTPzRMa18RzNWXaKjhh1Wih546SzTu/wBOO4gO/eaB+1cwzHFchw68eqMmtc1treQSNjkLTzMJIDmlpIIJBG4PgjPJnXxVrj3n3YwwShIW2CEqqsmMsQO5IVUrmdiy+q0W+ru12o7Vb4TNWVk7KeCMfKke4NaP0kL5N11nhGtkVz1/xxszeZlL29Xt+FHE7lP+4gq1ep2s58tSPaekenmN6VYW2jpW07ahkPa3O5SANdO8DdznOPcwddm9wA89yuM5nxe2iiuk1LiuLS3WljcWtrKqq9HbLt8prA1zuU+BOx9wXdNZMbu+XaZ3vGbFW09FXXGAQNmnLgxrC5vODygnqzmHd4ryt8EDPPnNjX/f/IuPj8L73Xdyeeepxxl/hjXf5h0P6zf/AE1yDXbVOp1VvluutVZYbU6hpXU4ZHUGUPBfzb7lo2XSfggZ3858b/7/AORct1n0vvGlt5oLXebjQV0tbTuqGOpOflaA7l2PMB13Xvj9ff8AH5c3J+7x/l8PTfAH9rC+flt38CJduyq2WHNLDe8Sr3xVMMkXo1bE1274S9gew+5wBa5p8wFxHgD+1hfPy27+BEsZlGo3/p9xi1sdfP2djvNFRUtdzH2YnchEc35rjsT964+S8NZut3p041M8ee3lrO8ZuWG5fcsZuzdqugmMZdtsJW97JB7nNIcPpXp7+z3O9szNvlUUh/ckWT43tOPXONQ6gWuDmrrSzs7gGDrJSk9H+8xuO/4rneSxH9ns7/CZqz/3aI/uzL23vz4u3jjj8ObpqvHx9tKxfkQfx5FuXBfpPbfUUWo1/o46msqZHC0xytDmwRtJaZtj8tzgdj4AbjvWl8fpI1PspHeLECP/ADyr1zpzbIrNgGP2mFgYykttPDsPdG3f9u6xrVnFJPtrjxNc2rfpznW/iAxzTa6+oobfNe72GB8tPFKI46cOG7e0eQfaI68oBO3U7bjfk54wrqSdsEotvDe5v/pq+dcMGf5Nml6yGTJceBuNdLUgPM3M1rnEtafY8G8o+pYYcIedfObG/wDv/kWszhk90b1z2+p6Y7VPiTuOeYHc8TnxKkoY69rGmoZXOkLOWRr+jSwb/F27/Fb7wH5t2tDdcCrJvbpybhQBx+Q4gSsH0O5Xbfhlcy1I4ccrwXCrhlVyv1kqaWgax0kVOJe0dzPawbczQO9wXOtLssqMHz+z5RTlxFDUAzsb90hd7MrfrYT9ey9PDGsWYeP7N45JdvQPHlhvY3Cz53SRbMnb6uriB8tu7onH6Rzt+pq8thfpPqnjdHqPpRc7PTSRzNuNGJqCYdR2gAkheD5bhv1Er82pY5IZXxTsMUkbi2RjuhY4HYg/QQU/jb7z1/S/Kx478p9u18G+GfZNqxFd6mLnoMfjFY8kdDOd2wt+o8z/AMwLuvGtmfqDTSPG6WXlrcgl7FwB6tpmbOlP1nkZ+cVmuEjDPsS0hoqmph7O43o+sKjcbODXACJh+hmx+lxXlXiezE5vq7c5KabtKC3n1bREHcFrCQ94/GkLjv5ALzn+Tl7+o9L/AIuDr7rvHBxpTQW/G6bUG90jJ7rcAX24St39Fg7g9oPc9/U7+DdgO8r0kAvgx2gitdgt9sgaGxUlLFAwDwaxgaP/AKX3rm3u713XZx4mMyR/OqnhpqaWoqJWRQxML5HvOzWtA3JJ8gF5a0PmoNYNc8/yS8W+KvsktuFDBBOzdogdIBGNvAlsRduOoLisvxcamg08umWOVQNbUxGS91DT7NJSgczmE+BcOrvJuw73hfbwTWeCyabPvFSTFPklyeKVrh1fHCxwaP3JSvXOfDjuvuvDWvPlmZ8R5n10wKTTnUWtx9rpJaFzRU2+V/xnwP32BPi5pDmk+PLv4rRgvVPH7bog7Ebu1v8Aek1NK8+bdmPb+3m/SvKy7eHXliWvnc+JjkshSEAqL1eNYlIQoud1rLr3B7cIaDiAsHbODW1UdTTAn750Li0fWW7fWuQL78eutbYr7QXq2ydnWUFTHUwOPcHscHDf3dNj7kancsOb46lfpFrxkt7xDSi95NjrKZ9woI45WNqIy9nJ2jQ8kAjuaSe/wXkk8V2qe/8AlY5/wH/1F6000zjFtW8DdU0vYzx1EBgudtlIL4HObs+N7fFp3Ozu5w/ZwzJeDymmuUs2O5m6konvJjp6yi7Z0Q+952vHMB5kb+e65eO4nc3Hbyzeuriuf/Cu1T/0sc/4D/6i51qtqTkepd1orlkjaBs9HA6CL0SExt5S7mO4Ljud13EcHN2+ftD+rH/1FyDXfSyp0pvtutVTeobq6upXVAkjpzEGAP5dti47r2xePv8Ai5uTPL4/y+HpPgC+1hfPy27+BEuKcazdtea7cdHW6kP7rgu1cAX2r75+W3fwIlxrjdbtrrMfO10p/wD2s4/3V6b/ANEegOEzUCDUHTKTGr49lVdLREKOqZL19JpnAtjeQe/du7He9u571ThswKfTfUjULHuV5t8hoqm2yu+6U7jPyjfxLSCw/i7+K8i6LZ3V6dahW/JIOd9Mx3Y18LT/AJ1O4jnb9I2Dh72hfpRa6yjuVvprlQTR1FNVQtlhmZ1D2OG7SD5EHdefLm4t6+K3wanJJb8x4w4/dzqdZQO/1ENv/PKvX2C3CK64TZLnA4Ojq7fTzNIPg6NpXkPj5+2lYvyIP48i3vgx1ZttVjlNpzfKplPcqIuba3SO2FTCSSIwT8thJAHi3bbuK1rNvFLBx7mebUv20fNeJXVKw5jerGYLA0W+4T0wD6F5dyskIbv/AHnkAViPhV6o/wCnjv8AwH/1F3jW/h0seoeQPyO3Xd9iu0zQKoinEsVQQAGuc3dpa7YAEg9QBuN+q5n8D27fPuh/Vj/6i1nXDZ7jG8c8vqub55xA59muJ12MXlllFBXBrZjBSOZJs17XjYl526tHguTrvWqfDXcMDwK55ZPl1LXsoGscadlA6Mv5pGs+MXnb42/d4Lgq6OO4s/i5uWbl/m9ycFWbfZFpk7HKubmr8fkEA3PV1M7cxH6tnM/NC5fqjo6+v4rKK0QU5FmyKT1rMWjoyNp3qm+7dw/7QuccMubfYPq3bKuom7O23A+r67c7NDJCOV5/Ffyn6N1+hbqamfVx1j4InVETHRxyloLmNcQXAHvAJa3fz5R5Ll5LeLds+3XxSc3HJfpoPEDmDMA0kut0pXNhrHxCit7W9NppBytI/FG7vzV+dAeYyJASSz2tyep26r0RxyZp63zqiw+kl5qWyxdrUgHoamUA7H8WPl/3led10fj48cd/25/yt+W+v6fqZaLjT1lgpLqJWNp56VlQHl2zQxzA7cny2K4DrRxDRio+w7Strr1fqp/o4radnaxxvPTlhH3WT3/FHf17l54xuvzbUWhgxSvzimt2P2eibzi41wp6aGnZ0BLBsZnDoNup7u5fReMuxnDLbUWLTH0iesnY6GvymqZ2dRMw9DHTM+4Rnxd8Yj9K8s8El9+3tv8AJtz69T/3w/nX2Oqfe6fTq0VTbrld6rWsvte2TtWtlLub0dr/AJTYzvJK/wCU9u3czr6+t9NSWnUrCsAtHSkx6w1FbKB5EMp4ife7eYrnPCPpezErHPqTlkbaOrnpXOo2Tjl9EpduZ8rt/iueB9TR+EVsvD7dWZBcM41hvEjKOgudUKagkqHBjYaGmBAcSegBJJPvBWeXXffX1/08OfHq35v/ACNJ4/q6LscQtjXAy9pVVDm+TQI2A/pJ/QvKS6JxE6gM1F1KqrvRl/qqljFJb+YbF0TSSX7eHO4l30cq50Cuvhzc4kri/I3N8lsIShIXq8WICUBK53UQlVSpMlj97vGP3JlysV0rLZWsGzZ6WZ0b9vIkd49x6LpNBxG6x0cIibl3bgeNRQQPd+nk3XJQlVzL8wzWs/Fdi+ExrH85KT9VwfyrR9RdQMq1CuNLcMrr4q2opYTDC5lOyINYXcxGzQN+q1VIKJjM+ILvV9Wt7061bzzT+01FrxW7QUdJUTmokY+jjlJeWhu+7gSOjR0WFz3Mcgzm/m+5LVx1deYWQdoyFsQ5G77DlaAPE9Vr6QnxkvYur1136I710rDdctTcRx2lx+x3+KG3UgIgjlo4pSxpJPKHOBO25Ow8FzRITZNfIzq5+K2fUTPMn1Au9Pdcqro6yrp4PR43sp2RAR8xdts0AHq49VrbXFrg5pIIO4IOxB81VITJJ6gtt910fHtctV7FTspqLNK+SFg5Wsq2R1Ow8t5Gl37VmvhK6xfOSk/VkH8q4+kI8Mf0Zybn26RmOuOpWXY3V47fr3T1NtrA0TxNoIoy4NcHD2mjcdWjuXOAtp01wK/5/d56CyNpooqSHt62sq5eyp6WL757vDuPQdeh8AStldphjDCWv1pwTmHfyumcP0hvVXeMeofHe/dcxPUELrdHxGavUtJDSxZLAY4Y2xtL7fC5xAGw3JbuT07ysJp7pm7LMVvGTVGV2aw2y01TKaeevbIWkvA5SC0dASQFlGaNTXS319Rh+d4plVVQU7qmagoZntqHRt7y1rhs7by3HgPEI1rF9VZzySd5c5vd0rr1eay8XOodUV1bO+eolIA53uO5Ow6D6B3L5Atz0606u2Y26vvXrC22SwW7YVl2uUpjgjcRuGN2G737EdB5jzCzlXpDJWWC4XnCszsGYNtkXbVtJQ9pHUxxjveI3jdwG3h9W56Lfnmemf16s7cx2B23AO3ULL4hem49kVJejabddnUr+0ZTV7HPhc8dxc1pG+x6gHpv3grJUWFVlVpdX5+yuphRUdyjt7qctd2jnvDSHA923tD39E6X4TW57kM9loK2mo5YaKasMk7XOaWx7bt9nrueZN1Or2zM67nTetS+IjNc5xOoxqqobVbKSqLRUvohJ2krAdywlzjs0nbfbv227iVz28Zrk91xuhxqru0wslBG2Ont8IEUA268zmt253bknmdudySs9p9pocqwu45bV5XZsftlBVspJZLg2Qjne1pb1aPHmA+lfXedJKqPErlk2NZfjmWUVqAfcGWyV/bU7D8sscOreh+oE9disT9eb1G7+3U8q5sEo7kr3c9WUQEqTEJCEhc7qKQhRSWSqhIVAVFFEghKAlSKQqhKWVlAgJSllAgJUK7dpaH/AAW9VTQb+l+k0fpPJ8b0fdu+/wCDt2m/u3VtFMR0hz68WzF54s3gvk1I6SpnbVU7aXtI2cz+QcpcGk77b/Wuc6aZ7kGAXia4WN9PIyqh7Cso6uLtKeqi+9e3cb952III3PgSFvGOa4UuO3ll6smlOE264sa5rZ6Zk0bgHDZwGzugIXlrOvfTozrF67+md0bjxwcO2okWVT3WG0NvNI2Z9uYx9QNizl5Q/wBnv23926zWlEOBWew5Xlek897veVW60y/4K9uZAYad3+ZMxrG7SEco9nm93TcLidqzmvt+nmQYVHQ0r6S+VcVVNO5zu0jdG5pAaO7Y8vj5o0xzevwO+Vd1oKKmrTV0E1DLDUOcGmOTl3Ps9dxyhV47exOSTp0HJN/gdYj6ASYDkdQbgW9xl/veTm+rl2+pfz4NjONdaHl39H9X1fpe/wAXsuQfG93NyLT9OdSLthtprrCbfbL7j1wIdV2q5xGSF7wAA9pHVjtgOo8h03AWWr9W56ewV9mwzELBh0Nyj7GuqLe176maM97O1ed2tPkP2JuddXPXyJrPc1b8NgtwifwnZgKQbwszCFzdvCM9mGn6NiF/PhCBGptzkI2azHa1zj5D2Oq0vTXUO64TDcqCK3268WW6sDK+13CIvgm2+K7p1a4eY93ToNs3W6uSU1guNnw3DcexCO5xGGuqaBr5KmWM97BI8+y07+A+jZNzrq5/tZ3nuat+G26P2+y3Thgy2kv+Qtx+gdfqQvrTSPqAwhkRaORnU7np7l89qvmnWm+DZdSY3mFTl17yK3+row21yUsFNGeYOc4v7z7RPTyA26krm9szWuoNM7rgcdFSuornXRVslQS7tWOj5dmtHdt7A7/NawmcfdvbN5JJOp76Hd0CQoovZzlIQEhIYlRRRc7qIKUBKkQlVSpLBRASkVEhCigskIUChVglVSFoEJQkKRCUKBQKQhRKWUCAlQpSEDuUWgskIUCksooooIEoStCsUoooud0okISpFQKKKSyVUJVAVFFEghKqFZSIKiAlIWUCAlIKUBKlSogJSCFEJCkQlCQlkhKqrJRCVVKlSoFFExli1FFF4OlFFFFIhKEqSBKEhSISgJSKiQhRQWSEKKFKsqpCYCkISEopCFAoFRRRKWUQEqFKQgKLQWSFUJUllFFFBi1FFF4uhFFFFJEhCVIqBQKKRSEBIUiooolkhKqkKSwUQlQWCiAlaBCVUJUqsogJSEShIUikISEskJVVYJRCVVKlWMUUUXi90UUUUkUUUUiEqqsFJAlCQVIhKEhMFRIQooLKBASoFIQEhMBSEKBKWSEKBQKiiiUQlVCsoFIVQlMCygQClKf/2Q==" alt="ENEVO Group" style="width:52px;height:52px;border-radius:10px;object-fit:contain;flex-shrink:0"/>
    <div>
      <div class="cl" style="margin-bottom:2px">ENEVO GROUP · ERP System</div>
      <div style="font-size:13px;color:#94a3b8">Industrial & Renewable Energy Automation</div>
    </div>
  </div>
  <div class="ct">${title}</div><div class="cs">${subtitle}</div>
  <div class="cm"><div><label>Generated</label><span>${now}</span></div><div><label>System</label><span>ENEVO GROUP</span></div><div><label>Status</label><span>Confidential</span></div></div>
  </div><div class="body">`;
  sections.forEach(s=>{html+=s;});
  html+=`</div>
  <script>window.onload=()=>window.print()<\/script></body></html>`;
  win.document.write(html); win.document.close();
}

/* ─── VACATION / LEAVE REPORT PDF ─── */
function buildVacationPDF(engineers, allEntries, leaveEntries, projects, m, y){
  const MONTHS_=["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
  const leaveTypes=["Annual Leave","Sick Leave","Public Holiday","Business Travel","Training External","Unpaid Leave"];
  const typeColors={"Annual Leave":"#0ea5e9","Sick Leave":"#ef4444","Public Holiday":"#f97316","Business Travel":"#8b5cf6","Training External":"#10b981","Unpaid Leave":"#6b7280"};

  // Monthly data
  const leaveByEng=engineers.map(eng=>{
    const engLeave=leaveEntries.filter(e=>String(e.engineer_id)===String(eng.id));
    const byType={};
    engLeave.forEach(e=>{const lt=e.leave_type||"Annual Leave";byType[lt]=(byType[lt]||0)+1;});
    return{...eng,totalDays:engLeave.length,byType,entries:engLeave.sort((a,b)=>a.date.localeCompare(b.date))};
  }).filter(e=>e.totalDays>0);

  // YTD data
  const ytdByEng=engineers.map(eng=>{
    const all=allEntries.filter(e=>String(e.engineer_id)===String(eng.id)&&e.entry_type==="leave"&&new Date(e.date).getFullYear()===y);
    const byType={};
    all.forEach(e=>{const lt=e.leave_type||"Annual Leave";byType[lt]=(byType[lt]||0)+1;});
    return{...eng,total:all.length,byType};
  }).filter(e=>e.total>0);

  const thStyle=`style="background:#f0f7ff;color:#0f2a50;font-size:11px;padding:6px 8px;text-align:center;border-bottom:2px solid #e2e8f0"`;
  const tdStyle=`style="font-size:11px;padding:5px 8px;text-align:center;border-bottom:1px solid #f1f5f9"`;
  const nameTd=`style="font-size:11px;padding:5px 8px;font-weight:600;border-bottom:1px solid #f1f5f9"`;

  const monthlyRows=leaveByEng.map(eng=>{
    const cells=leaveTypes.map(lt=>{
      const n=eng.byType[lt]||0;
      return`<td ${tdStyle} style="font-size:11px;padding:5px 8px;text-align:center;border-bottom:1px solid #f1f5f9;color:${n>0?typeColors[lt]:"#94a3b8"};font-weight:${n>0?700:400}">${n||"—"}</td>`;
    }).join("");
    return`<tr><td ${nameTd}>${eng.name}<br><span style="font-weight:400;color:#64748b;font-size:10px">${eng.role||""}</span></td>${cells}<td ${tdStyle} style="font-size:11px;padding:5px 8px;text-align:center;border-bottom:1px solid #f1f5f9;font-weight:700;color:#0f2a50">${eng.totalDays}d</td></tr>`;
  }).join("");

  const ytdRows=ytdByEng.map(eng=>{
    const cells=leaveTypes.map(lt=>{
      const n=eng.byType[lt]||0;
      return`<td ${tdStyle} style="font-size:11px;padding:5px 8px;text-align:center;border-bottom:1px solid #f1f5f9;color:${n>0?typeColors[lt]:"#94a3b8"};font-weight:${n>0?700:400}">${n||"—"}</td>`;
    }).join("");
    return`<tr><td ${nameTd}>${eng.name}</td>${cells}<td ${tdStyle} style="font-size:11px;padding:5px 8px;text-align:center;border-bottom:1px solid #f1f5f9;font-weight:700;color:#0f2a50">${eng.total}d</td></tr>`;
  }).join("");

  const detailRows=leaveByEng.map(eng=>{
    const chips=eng.entries.map(e=>`<span style="display:inline-block;margin:2px;padding:2px 7px;border-radius:3px;font-size:10px;background:${typeColors[e.leave_type||"Annual Leave"]}20;color:${typeColors[e.leave_type||"Annual Leave"]};border:1px solid ${typeColors[e.leave_type||"Annual Leave"]}40;font-family:'IBM Plex Mono',monospace">${e.date} · ${e.leave_type||"Annual Leave"}</span>`).join("");
    return`<tr><td style="padding:8px;border-bottom:1px solid #f1f5f9;vertical-align:top;width:120px;font-size:11px;font-weight:600">${eng.name}</td><td style="padding:8px;border-bottom:1px solid #f1f5f9">${chips}</td></tr>`;
  }).join("");

  const thCols=leaveTypes.map(lt=>`<th ${thStyle} style="background:#f0f7ff;color:${typeColors[lt]};font-size:11px;padding:6px 8px;text-align:center;border-bottom:2px solid #e2e8f0">${lt}</th>`).join("");

  generatePDF(
    `Vacation & Leave Report — ${MONTHS_[m]} ${y}`,
    [
      `<div class="section"><div class="st">${MONTHS_[m]} ${y} — Leave Summary</div>
      ${leaveByEng.length===0?`<p style="color:#94a3b8;font-size:13px;text-align:center;padding:20px">No leave recorded for ${MONTHS_[m]} ${y}.</p>`:`
      <table><thead><tr><th style="background:#f0f7ff;color:#0f2a50;font-size:11px;padding:6px 8px;border-bottom:2px solid #e2e8f0">Engineer</th>${thCols}<th ${thStyle} style="background:#f0f7ff;color:#0f2a50;font-size:11px;padding:6px 8px;text-align:center;border-bottom:2px solid #e2e8f0">Total</th></tr></thead>
      <tbody>${monthlyRows}</tbody></table>`}
      </div>`,
      `<div class="section"><div class="st">Year-to-Date ${y} — All Leave</div>
      ${ytdByEng.length===0?`<p style="color:#94a3b8;font-size:13px;text-align:center;padding:20px">No leave recorded for ${y}.</p>`:`
      <table><thead><tr><th style="background:#f0f7ff;color:#0f2a50;font-size:11px;padding:6px 8px;border-bottom:2px solid #e2e8f0">Engineer</th>${thCols}<th ${thStyle} style="background:#f0f7ff;color:#0f2a50;font-size:11px;padding:6px 8px;text-align:center;border-bottom:2px solid #e2e8f0">YTD Total</th></tr></thead>
      <tbody>${ytdRows}</tbody></table>`}
      </div>`,
      leaveByEng.length>0?`<div class="section"><div class="st">Leave Detail — ${MONTHS_[m]} ${y}</div>
      <table><thead><tr><th style="background:#f0f7ff;font-size:11px;padding:6px 8px;border-bottom:2px solid #e2e8f0;width:120px">Engineer</th><th style="background:#f0f7ff;font-size:11px;padding:6px 8px;border-bottom:2px solid #e2e8f0">Leave Days</th></tr></thead>
      <tbody>${detailRows}</tbody></table></div>`:""
    ],
    `Leave & Vacation Report · ${MONTHS_[m]} ${y}`
  );
}

/* ─── INDIVIDUAL TIMESHEET PDF ─── */
function buildTimesheetPDF(eng, monthEntries, projects, m, y){
  const workE = monthEntries.filter(e=>String(e.engineer_id)===String(eng.id)&&e.entry_type==="work").sort((a,b)=>a.date.localeCompare(b.date));
  const leaveE= monthEntries.filter(e=>String(e.engineer_id)===String(eng.id)&&e.entry_type==="leave").sort((a,b)=>a.date.localeCompare(b.date));
  const totalW= workE.reduce((s,e)=>s+e.hours,0);
  const totalL= leaveE.length;
  const projMap={};
  workE.forEach(e=>{
    const p=projects.find(x=>x.id===e.project_id);
    if(!projMap[e.project_id]) projMap[e.project_id]={id:e.project_id,name:p?.name||"Unknown",hours:0};
    projMap[e.project_id].hours+=e.hours;
  });
  const projRows=Object.values(projMap).sort((a,b)=>b.hours-a.hours).map(p=>`<tr>
    <td style="font-weight:600">${p.name||p.id}${p.pm?"<br><span style='font-size:10px;color:#8b5cf6'>PM: "+p.pm+"</span>":""}</td>
    <td style="font-family:'IBM Plex Mono',monospace;color:#0ea5e9;font-size:11px">${p.id}</td>
    <td style="font-family:'IBM Plex Mono',monospace;font-weight:700;color:#0ea5e9">${p.hours}h</td>
    <td>${totalW?Math.round(p.hours/totalW*100):0}%</td></tr>`).join("");
  const entryRows=workE.map(e=>{
    const p=projects.find(x=>x.id===e.project_id);
    return`<tr>
      <td style="font-family:'IBM Plex Mono',monospace;font-size:11px">${e.date}</td>
      <td style="font-family:'IBM Plex Mono',monospace;font-size:11px;color:#0ea5e9">${e.project_id||""}</td>
      <td style="font-size:11px">${p?.name||""}</td>
      <td style="font-size:11px">${e.task_category||""}</td>
      <td style="font-size:11px">${e.task_type||""}</td>
      <td style="font-style:italic;font-size:11px;max-width:200px">${e.activity||""}</td>
      <td style="font-family:'IBM Plex Mono',monospace;font-weight:700;color:#0ea5e9">${e.hours}h</td></tr>`;}).join("");
  const leaveRows=leaveE.map(e=>`<tr>
    <td style="font-family:'IBM Plex Mono',monospace;font-size:11px">${e.date}</td>
    <td style="color:#fb923c;font-size:11px">${e.leave_type}</td>
    <td>8h</td></tr>`).join("");

  generatePDF(
    `Monthly Timesheet — ${eng.name}`,
    [
      `<div class="section"><div class="st">Engineer Information</div>
      <div class="kg" style="grid-template-columns:repeat(3,1fr)">
        <div class="kp"><div class="kv">${totalW}h</div><div class="kl">Work Hours</div></div>
        <div class="kp"><div class="kv">${totalL}d</div><div class="kl">Leave Days</div></div>
        <div class="kp"><div class="kv">${Object.keys(projMap).length}</div><div class="kl">Projects</div></div>
      </div></div>`,
      `<div class="section"><div class="st">Project Summary</div>
      <table><thead><tr><th>Project No.</th><th>Project Name</th><th>Hours</th><th>Share %</th></tr></thead>
      <tbody>${projRows||`<tr><td colspan="4" style="color:#94a3b8;text-align:center;padding:12px">No work entries for ${MONTHS[m]} ${y}</td></tr>`}</tbody></table></div>`,
      `<div class="section"><div class="st">Daily Work Log — ${MONTHS[m]} ${y}</div>
      <table><thead><tr><th>Date</th><th>Project No.</th><th>Project Name</th><th>Category</th><th>Task</th><th>Activity Description</th><th>Hours</th></tr></thead>
      <tbody>${entryRows||`<tr><td colspan="7" style="color:#94a3b8;text-align:center;padding:12px">No entries</td></tr>`}</tbody></table></div>`,
      leaveE.length>0?`<div class="section"><div class="st">Leave / Absence Log</div>
      <table><thead><tr><th>Date</th><th>Leave Type</th><th>Duration</th></tr></thead>
      <tbody>${leaveRows}</tbody></table></div>`:"",
      `<div class="section" style="margin-top:40px">
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:40px;margin-top:20px">
        <div style="border-top:1px solid #e2e8f0;padding-top:8px"><div style="font-size:11px;color:#64748b;text-transform:uppercase;letter-spacing:.08em">Engineer Signature</div><div style="margin-top:4px;font-size:13px;color:#0f2a50;font-weight:600">${eng.name}</div><div style="font-size:11px;color:#94a3b8">${eng.role||""}</div></div>
        <div style="border-top:1px solid #e2e8f0;padding-top:8px"><div style="font-size:11px;color:#64748b;text-transform:uppercase;letter-spacing:.08em">Approved By</div><div style="margin-top:20px;border-bottom:1px solid #e2e8f0;width:200px"></div></div>
      </div></div>`
    ],
    `${eng.role||"Engineer"} · ${MONTHS[m]} ${y}`
  );
}

/* ─── INVOICE PDF ─── */
// filterId: undefined = all projects, or a specific project id
function buildInvoicePDF(projects, entries, engineers, m, y, filterId){
  // Include all billable projects (filter by id if specified)
  const billableProjs=projects.filter(p=>p.billable&&(!filterId||p.id===filterId));
  // Derive billability from CURRENT project flag, not stale entry.billable
  // Use UTC+12h shift to match the import date parsing
  const monthE=entries.filter(e=>{
    const d=new Date(new Date(e.date+"T12:00:00").getTime());
    return d.getFullYear()===y&&d.getMonth()===m&&e.entry_type==="work"
      &&projects.find(p=>p.id===e.project_id&&p.billable);
  });
  const now=new Date().toLocaleDateString("en-GB",{day:"2-digit",month:"short",year:"numeric"});
  const invoiceNo=filterId?`INV-${y}-${String(m+1).padStart(2,"0")}-${filterId}`:`INV-${y}-${String(m+1).padStart(2,"0")}`;

  const projInvoice=billableProjs.map(p=>{
    const pe=monthE.filter(e=>e.project_id===p.id);
    if(!pe.length) return null;
    const hrs=pe.reduce((s,e)=>s+e.hours,0);
    const rev=hrs*p.rate_per_hour;
    const engBreak=[...new Set(pe.map(e=>e.engineer_id))].map(eid=>{
      const eng=engineers.find(x=>x.id===eid);
      const eh=pe.filter(e=>e.engineer_id===eid).reduce((s,e)=>s+e.hours,0);
      return`<tr style="background:#f8fafc"><td style="padding-left:20px;font-size:11px;color:#64748b">↳ ${eng?.name||"Unknown"}</td><td></td><td style="font-size:11px;color:#64748b">${eh}h</td><td></td></tr>`;
    }).join("");
    return{p,hrs,rev,rows:`<tr style="background:#f0f7ff">
      <td style="font-weight:600">${p.name||p.id}<br>${p.pm?"<span style='font-size:10px;color:#8b5cf6'>PM: "+p.pm+"</span><br>":""}<span style="font-size:11px;color:#64748b">${p.client||""}</span></td>
      <td style="font-family:'IBM Plex Mono',monospace;color:#0ea5e9;font-weight:700;font-size:11px">${p.id}</td>
      <td style="font-family:'IBM Plex Mono',monospace;font-weight:700">${hrs}h</td>
      <td style="font-family:'IBM Plex Mono',monospace">$${p.rate_per_hour}/h</td>
      <td style="font-family:'IBM Plex Mono',monospace;font-weight:700;color:#0ea5e9">${fmtCurrency(rev)}</td></tr>${engBreak}`};
  }).filter(Boolean);

  const totalRev=projInvoice.reduce((s,x)=>s+x.rev,0);
  const totalHrs=projInvoice.reduce((s,x)=>s+x.hrs,0);

  generatePDF(
    `Invoice — ${MONTHS[m]} ${y}`,
    [
      `<div class="section">
      <div style="display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:18px">
        <div>
          <div style="font-size:11px;color:#64748b;text-transform:uppercase;letter-spacing:.1em">Invoice From</div>
          <div style="display:flex;align-items:center;gap:10px;margin-top:4px">
            <img src="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAUDBAQEAwUEBAQFBQUGBwwIBwcHBw8LCwkMEQ8SEhEPERETFhwXExQaFRERGCEYGh0dHx8fExciJCIeJBweHx7/2wBDAQUFBQcGBw4ICA4eFBEUHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh7/wAARCADwAPADASIAAhEBAxEB/8QAHQABAAIDAQEBAQAAAAAAAAAAAQACBQYHCAQJA//EAEoQAAEDAwIDBAQGDwgBBQAAAAEAAgMEBQYHEQgSIRMxQVEUFSJhGDJCVnGBFjdDUmJydYKRlaGis9LTCSMkM1OSlKOTF2OFsbL/xAAZAQEBAQEBAQAAAAAAAAAAAAABAAIEAwX/xAAkEQEBAQACAgICAgMBAAAAAAAAAQIDERIhMUEEEyJRIzOx8P/aAAwDAQACEQMRAD8A8yhRASvqPjLKBASkEJQEqVKiAlIRKEhSKUJCWSEqqsEohKqlSpUCiiYyUhAUSFkhCikVYKqQoFKEhIKiiikiiiigxSQqpC53VSrBVSmApCEhKKUKBQKiiiUsogJUCkKoStBZIVQlSWUQlQQJQkJFISqpSFgogJUiEoCUslKAlSRRRRSrEhKqkLndRCUJUFlEBK0ClASpUhRASmBEoSFIpQkJBCVVISFglVSpFRRRMBSFUJSyskKqVIpCEqBShISCohKkxCQhRc7qWUCAlSKQhITGSkIUSlkgoUUCooolFKAlQISFUJTAskKoSlLKISoIlCgSKsEqqsEhAUoT4KRCVVWTGSlVCVJiVFAoud1IrKqQpEJQkKBBSqqy0CEqoSpLBRASmBEhCikskIUCRVkqqQkEJQkKRUUUTAUhVCUsrKBASpFIQoFCrJCN0hIYgJQkLnjrRIQooLKBfXZbXc71cI7dZ7dV3Gtl+JT0sLpJHfmtBO3vXS7bw7aw18AmZiDqdpG4FTWwRO/2l+4RdSfNamda+I5UkLsHwaNY/m3SfrSD+ZaPqNgGU6e3Glt+V0EVHUVcJmhbHUMlDmB3KTu0nbqqbzfUovHqTuxrCQt5060kzvUC01F1xW1U9ZSU85p5HyVkcRDw0O22cQT0cOq/rn+juoWCWNt7yWyR01AZmwmWKqjm5XO35eYNJIB2237t9h4p8899drw11316aEoFFuem+l+aahwVs2KW2CsZQvYyoMlVHFylwJb8YjfoD3Jtk91iZtvUaaotm1EwTJtP7tT2rKaKKjq6iD0iJkdQyUGPmLd92kgdWnotZWpZZ3FZZeqQUrf8Y0W1RyOnZU23DbgKeQbslqiyma4eY7QtJH1LPjhr1i+bdIP/AJOD+ZZ/ZmfbX6t36ci3UXSMw0O1KxHG6vIb9Zaamt1GGmaRtfFIW8zg0ey07nq4L+mLaE6l5Pj1Ff7JZ6Kqt1bH2kEvrGFvMN9uoJ3BBBBB7iE/sz132z+vffXTmqgWUyvH7tiuRVmP32k9EuNG4Nmi5g4DdocCCOhBBB3Cxa3L2zZ0sor0kE1XVQ0tNG6WeaRscTGjcvc4gNA95JAXU7jw86rW631FwrbHQwUtNE6aaR1zg2YxoJcT7XgAVm6mfmqY1r4jlKQiMOkc1rGuc55Aa0DcknuAHn7l03F9BdVb/TMqqfFpKKneN2vuEzKckefK48/7q1dTPzRMa18RzNWXaKjhh1Wih546SzTu/wBOO4gO/eaB+1cwzHFchw68eqMmtc1treQSNjkLTzMJIDmlpIIJBG4PgjPJnXxVrj3n3YwwShIW2CEqqsmMsQO5IVUrmdiy+q0W+ru12o7Vb4TNWVk7KeCMfKke4NaP0kL5N11nhGtkVz1/xxszeZlL29Xt+FHE7lP+4gq1ep2s58tSPaekenmN6VYW2jpW07ahkPa3O5SANdO8DdznOPcwddm9wA89yuM5nxe2iiuk1LiuLS3WljcWtrKqq9HbLt8prA1zuU+BOx9wXdNZMbu+XaZ3vGbFW09FXXGAQNmnLgxrC5vODygnqzmHd4ryt8EDPPnNjX/f/IuPj8L73Xdyeeepxxl/hjXf5h0P6zf/AE1yDXbVOp1VvluutVZYbU6hpXU4ZHUGUPBfzb7lo2XSfggZ3858b/7/AORct1n0vvGlt5oLXebjQV0tbTuqGOpOflaA7l2PMB13Xvj9ff8AH5c3J+7x/l8PTfAH9rC+flt38CJduyq2WHNLDe8Sr3xVMMkXo1bE1274S9gew+5wBa5p8wFxHgD+1hfPy27+BEsZlGo3/p9xi1sdfP2djvNFRUtdzH2YnchEc35rjsT964+S8NZut3p041M8ee3lrO8ZuWG5fcsZuzdqugmMZdtsJW97JB7nNIcPpXp7+z3O9szNvlUUh/ckWT43tOPXONQ6gWuDmrrSzs7gGDrJSk9H+8xuO/4rneSxH9ns7/CZqz/3aI/uzL23vz4u3jjj8ObpqvHx9tKxfkQfx5FuXBfpPbfUUWo1/o46msqZHC0xytDmwRtJaZtj8tzgdj4AbjvWl8fpI1PspHeLECP/ADyr1zpzbIrNgGP2mFgYykttPDsPdG3f9u6xrVnFJPtrjxNc2rfpznW/iAxzTa6+oobfNe72GB8tPFKI46cOG7e0eQfaI68oBO3U7bjfk54wrqSdsEotvDe5v/pq+dcMGf5Nml6yGTJceBuNdLUgPM3M1rnEtafY8G8o+pYYcIedfObG/wDv/kWszhk90b1z2+p6Y7VPiTuOeYHc8TnxKkoY69rGmoZXOkLOWRr+jSwb/F27/Fb7wH5t2tDdcCrJvbpybhQBx+Q4gSsH0O5Xbfhlcy1I4ccrwXCrhlVyv1kqaWgax0kVOJe0dzPawbczQO9wXOtLssqMHz+z5RTlxFDUAzsb90hd7MrfrYT9ey9PDGsWYeP7N45JdvQPHlhvY3Cz53SRbMnb6uriB8tu7onH6Rzt+pq8thfpPqnjdHqPpRc7PTSRzNuNGJqCYdR2gAkheD5bhv1Er82pY5IZXxTsMUkbi2RjuhY4HYg/QQU/jb7z1/S/Kx478p9u18G+GfZNqxFd6mLnoMfjFY8kdDOd2wt+o8z/AMwLuvGtmfqDTSPG6WXlrcgl7FwB6tpmbOlP1nkZ+cVmuEjDPsS0hoqmph7O43o+sKjcbODXACJh+hmx+lxXlXiezE5vq7c5KabtKC3n1bREHcFrCQ94/GkLjv5ALzn+Tl7+o9L/AIuDr7rvHBxpTQW/G6bUG90jJ7rcAX24St39Fg7g9oPc9/U7+DdgO8r0kAvgx2gitdgt9sgaGxUlLFAwDwaxgaP/AKX3rm3u713XZx4mMyR/OqnhpqaWoqJWRQxML5HvOzWtA3JJ8gF5a0PmoNYNc8/yS8W+KvsktuFDBBOzdogdIBGNvAlsRduOoLisvxcamg08umWOVQNbUxGS91DT7NJSgczmE+BcOrvJuw73hfbwTWeCyabPvFSTFPklyeKVrh1fHCxwaP3JSvXOfDjuvuvDWvPlmZ8R5n10wKTTnUWtx9rpJaFzRU2+V/xnwP32BPi5pDmk+PLv4rRgvVPH7bog7Ebu1v8Aek1NK8+bdmPb+3m/SvKy7eHXliWvnc+JjkshSEAqL1eNYlIQoud1rLr3B7cIaDiAsHbODW1UdTTAn750Li0fWW7fWuQL78eutbYr7QXq2ydnWUFTHUwOPcHscHDf3dNj7kancsOb46lfpFrxkt7xDSi95NjrKZ9woI45WNqIy9nJ2jQ8kAjuaSe/wXkk8V2qe/8AlY5/wH/1F6000zjFtW8DdU0vYzx1EBgudtlIL4HObs+N7fFp3Ozu5w/ZwzJeDymmuUs2O5m6konvJjp6yi7Z0Q+952vHMB5kb+e65eO4nc3Hbyzeuriuf/Cu1T/0sc/4D/6i51qtqTkepd1orlkjaBs9HA6CL0SExt5S7mO4Ljud13EcHN2+ftD+rH/1FyDXfSyp0pvtutVTeobq6upXVAkjpzEGAP5dti47r2xePv8Ai5uTPL4/y+HpPgC+1hfPy27+BEuKcazdtea7cdHW6kP7rgu1cAX2r75+W3fwIlxrjdbtrrMfO10p/wD2s4/3V6b/ANEegOEzUCDUHTKTGr49lVdLREKOqZL19JpnAtjeQe/du7He9u571ThswKfTfUjULHuV5t8hoqm2yu+6U7jPyjfxLSCw/i7+K8i6LZ3V6dahW/JIOd9Mx3Y18LT/AJ1O4jnb9I2Dh72hfpRa6yjuVvprlQTR1FNVQtlhmZ1D2OG7SD5EHdefLm4t6+K3wanJJb8x4w4/dzqdZQO/1ENv/PKvX2C3CK64TZLnA4Ojq7fTzNIPg6NpXkPj5+2lYvyIP48i3vgx1ZttVjlNpzfKplPcqIuba3SO2FTCSSIwT8thJAHi3bbuK1rNvFLBx7mebUv20fNeJXVKw5jerGYLA0W+4T0wD6F5dyskIbv/AHnkAViPhV6o/wCnjv8AwH/1F3jW/h0seoeQPyO3Xd9iu0zQKoinEsVQQAGuc3dpa7YAEg9QBuN+q5n8D27fPuh/Vj/6i1nXDZ7jG8c8vqub55xA59muJ12MXlllFBXBrZjBSOZJs17XjYl526tHguTrvWqfDXcMDwK55ZPl1LXsoGscadlA6Mv5pGs+MXnb42/d4Lgq6OO4s/i5uWbl/m9ycFWbfZFpk7HKubmr8fkEA3PV1M7cxH6tnM/NC5fqjo6+v4rKK0QU5FmyKT1rMWjoyNp3qm+7dw/7QuccMubfYPq3bKuom7O23A+r67c7NDJCOV5/Ffyn6N1+hbqamfVx1j4InVETHRxyloLmNcQXAHvAJa3fz5R5Ll5LeLds+3XxSc3HJfpoPEDmDMA0kut0pXNhrHxCit7W9NppBytI/FG7vzV+dAeYyJASSz2tyep26r0RxyZp63zqiw+kl5qWyxdrUgHoamUA7H8WPl/3led10fj48cd/25/yt+W+v6fqZaLjT1lgpLqJWNp56VlQHl2zQxzA7cny2K4DrRxDRio+w7Strr1fqp/o4radnaxxvPTlhH3WT3/FHf17l54xuvzbUWhgxSvzimt2P2eibzi41wp6aGnZ0BLBsZnDoNup7u5fReMuxnDLbUWLTH0iesnY6GvymqZ2dRMw9DHTM+4Rnxd8Yj9K8s8El9+3tv8AJtz69T/3w/nX2Oqfe6fTq0VTbrld6rWsvte2TtWtlLub0dr/AJTYzvJK/wCU9u3czr6+t9NSWnUrCsAtHSkx6w1FbKB5EMp4ife7eYrnPCPpezErHPqTlkbaOrnpXOo2Tjl9EpduZ8rt/iueB9TR+EVsvD7dWZBcM41hvEjKOgudUKagkqHBjYaGmBAcSegBJJPvBWeXXffX1/08OfHq35v/ACNJ4/q6LscQtjXAy9pVVDm+TQI2A/pJ/QvKS6JxE6gM1F1KqrvRl/qqljFJb+YbF0TSSX7eHO4l30cq50Cuvhzc4kri/I3N8lsIShIXq8WICUBK53UQlVSpMlj97vGP3JlysV0rLZWsGzZ6WZ0b9vIkd49x6LpNBxG6x0cIibl3bgeNRQQPd+nk3XJQlVzL8wzWs/Fdi+ExrH85KT9VwfyrR9RdQMq1CuNLcMrr4q2opYTDC5lOyINYXcxGzQN+q1VIKJjM+ILvV9Wt7061bzzT+01FrxW7QUdJUTmokY+jjlJeWhu+7gSOjR0WFz3Mcgzm/m+5LVx1deYWQdoyFsQ5G77DlaAPE9Vr6QnxkvYur1136I710rDdctTcRx2lx+x3+KG3UgIgjlo4pSxpJPKHOBO25Ow8FzRITZNfIzq5+K2fUTPMn1Au9Pdcqro6yrp4PR43sp2RAR8xdts0AHq49VrbXFrg5pIIO4IOxB81VITJJ6gtt910fHtctV7FTspqLNK+SFg5Wsq2R1Ow8t5Gl37VmvhK6xfOSk/VkH8q4+kI8Mf0Zybn26RmOuOpWXY3V47fr3T1NtrA0TxNoIoy4NcHD2mjcdWjuXOAtp01wK/5/d56CyNpooqSHt62sq5eyp6WL757vDuPQdeh8AStldphjDCWv1pwTmHfyumcP0hvVXeMeofHe/dcxPUELrdHxGavUtJDSxZLAY4Y2xtL7fC5xAGw3JbuT07ysJp7pm7LMVvGTVGV2aw2y01TKaeevbIWkvA5SC0dASQFlGaNTXS319Rh+d4plVVQU7qmagoZntqHRt7y1rhs7by3HgPEI1rF9VZzySd5c5vd0rr1eay8XOodUV1bO+eolIA53uO5Ow6D6B3L5Atz0606u2Y26vvXrC22SwW7YVl2uUpjgjcRuGN2G737EdB5jzCzlXpDJWWC4XnCszsGYNtkXbVtJQ9pHUxxjveI3jdwG3h9W56Lfnmemf16s7cx2B23AO3ULL4hem49kVJejabddnUr+0ZTV7HPhc8dxc1pG+x6gHpv3grJUWFVlVpdX5+yuphRUdyjt7qctd2jnvDSHA923tD39E6X4TW57kM9loK2mo5YaKasMk7XOaWx7bt9nrueZN1Or2zM67nTetS+IjNc5xOoxqqobVbKSqLRUvohJ2krAdywlzjs0nbfbv227iVz28Zrk91xuhxqru0wslBG2Ont8IEUA268zmt253bknmdudySs9p9pocqwu45bV5XZsftlBVspJZLg2Qjne1pb1aPHmA+lfXedJKqPErlk2NZfjmWUVqAfcGWyV/bU7D8sscOreh+oE9disT9eb1G7+3U8q5sEo7kr3c9WUQEqTEJCEhc7qKQhRSWSqhIVAVFFEghKAlSKQqhKWVlAgJSllAgJUK7dpaH/AAW9VTQb+l+k0fpPJ8b0fdu+/wCDt2m/u3VtFMR0hz68WzF54s3gvk1I6SpnbVU7aXtI2cz+QcpcGk77b/Wuc6aZ7kGAXia4WN9PIyqh7Cso6uLtKeqi+9e3cb952III3PgSFvGOa4UuO3ll6smlOE264sa5rZ6Zk0bgHDZwGzugIXlrOvfTozrF67+md0bjxwcO2okWVT3WG0NvNI2Z9uYx9QNizl5Q/wBnv23926zWlEOBWew5Xlek897veVW60y/4K9uZAYad3+ZMxrG7SEco9nm93TcLidqzmvt+nmQYVHQ0r6S+VcVVNO5zu0jdG5pAaO7Y8vj5o0xzevwO+Vd1oKKmrTV0E1DLDUOcGmOTl3Ps9dxyhV47exOSTp0HJN/gdYj6ASYDkdQbgW9xl/veTm+rl2+pfz4NjONdaHl39H9X1fpe/wAXsuQfG93NyLT9OdSLthtprrCbfbL7j1wIdV2q5xGSF7wAA9pHVjtgOo8h03AWWr9W56ewV9mwzELBh0Nyj7GuqLe176maM97O1ed2tPkP2JuddXPXyJrPc1b8NgtwifwnZgKQbwszCFzdvCM9mGn6NiF/PhCBGptzkI2azHa1zj5D2Oq0vTXUO64TDcqCK3268WW6sDK+13CIvgm2+K7p1a4eY93ToNs3W6uSU1guNnw3DcexCO5xGGuqaBr5KmWM97BI8+y07+A+jZNzrq5/tZ3nuat+G26P2+y3Thgy2kv+Qtx+gdfqQvrTSPqAwhkRaORnU7np7l89qvmnWm+DZdSY3mFTl17yK3+row21yUsFNGeYOc4v7z7RPTyA26krm9szWuoNM7rgcdFSuornXRVslQS7tWOj5dmtHdt7A7/NawmcfdvbN5JJOp76Hd0CQoovZzlIQEhIYlRRRc7qIKUBKkQlVSpLBRASkVEhCigskIUChVglVSFoEJQkKRCUKBQKQhRKWUCAlQpSEDuUWgskIUCksooooIEoStCsUoooud0okISpFQKKKSyVUJVAVFFEghKqFZSIKiAlIWUCAlIKUBKlSogJSCFEJCkQlCQlkhKqrJRCVVKlSoFFExli1FFF4OlFFFFIhKEqSBKEhSISgJSKiQhRQWSEKKFKsqpCYCkISEopCFAoFRRRKWUQEqFKQgKLQWSFUJUllFFFBi1FFF4uhFFFFJEhCVIqBQKKRSEBIUiooolkhKqkKSwUQlQWCiAlaBCVUJUqsogJSEShIUikISEskJVVYJRCVVKlWMUUUXi90UUUUkUUUUiEqqsFJAlCQVIhKEhMFRIQooLKBASoFIQEhMBSEKBKWSEKBQKiiiUQlVCsoFIVQlMCygQClKf/2Q==" style="width:36px;height:36px;border-radius:6px;object-fit:contain"/>
            <div style="font-size:16px;font-weight:700;color:#0f2a50">ENEVO Group</div>
          </div>
          <div style="font-size:13px;color:#64748b;margin-top:2px">ENEVO Group</div>
          <div style="font-size:13px;color:#64748b">Industrial & Renewable Energy Automation</div>
        </div>
        <div style="text-align:right">
          <div style="font-family:'IBM Plex Mono',monospace;font-size:18px;font-weight:700;color:#0ea5e9">${invoiceNo}</div>
          <div style="font-size:12px;color:#64748b;margin-top:2px">Period: ${MONTHS[m]} ${y}</div>
          <div style="font-size:12px;color:#64748b">Date: ${now}</div>
        </div>
      </div>
      <div class="kg" style="grid-template-columns:repeat(3,1fr)">
        <div class="kp"><div class="kv">${fmtCurrency(totalRev)}</div><div class="kl">Total Billable</div></div>
        <div class="kp"><div class="kv">${totalHrs}h</div><div class="kl">Billable Hours</div></div>
        <div class="kp"><div class="kv">${projInvoice.length}</div><div class="kl">Projects Billed</div></div>
      </div></div>`,
      `<div class="section"><div class="st">Billable Services Detail</div>
      <table><thead><tr><th>Project No.</th><th>Project / Client</th><th>Hours</th><th>Rate</th><th>Amount</th></tr></thead>
      <tbody>${projInvoice.map(x=>x.rows).join("")}
      <tr style="background:#0f2a50;color:#fff"><td colspan="2" style="font-weight:700;font-size:13px">TOTAL</td>
      <td style="font-family:'IBM Plex Mono',monospace;font-weight:700">${totalHrs}h</td><td></td>
      <td style="font-family:'IBM Plex Mono',monospace;font-weight:700;font-size:15px">${fmtCurrency(totalRev)}</td></tr>
      </tbody></table></div>`,
      `<div class="section" style="margin-top:30px">
      <div style="background:#f0f7ff;border:1px solid #bfdbfe;border-radius:8px;padding:16px">
        <div style="font-size:12px;font-weight:700;color:#0f2a50;text-transform:uppercase;letter-spacing:.06em;margin-bottom:8px">Payment Terms</div>
        <div style="font-size:12px;color:#64748b;line-height:1.7">
          Payment due within 30 days of invoice date.<br>
          Please reference invoice number <strong>${invoiceNo}</strong> in all correspondence.<br>
          For queries contact: ENEVO Group Management
        </div>
      </div></div>`
    ],
    `Invoice No. ${invoiceNo} · For Finance & Management`
  );
}

/* ─── SIGNUP SCREEN ─── */
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
    setErr("✓ Account created! Check your email to confirm, then sign in.");
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
        ℹ Account role is set to <strong>Engineer</strong> by default. Your admin can upgrade your access level after registration.
      </div>
      {err&&<div style={{padding:"8px 12px",borderRadius:6,fontSize:14,background:err.startsWith("✓")?"var(--bg3)":"#450a0a",color:err.startsWith("✓")?"#34d399":"#f87171",border:`1px solid ${err.startsWith("✓")?"#34d399":"#f87171"}`}}>{err}</div>}
      <button className="bp" onClick={handle} disabled={loading} style={{width:"100%",justifyContent:"center",padding:11}}>{loading?"Creating…":"Create Account"}</button>
      <div style={{textAlign:"center",fontSize:14,color:"var(--text4)",cursor:"pointer"}} onClick={onBack}>← Back to Sign In</div>
    </div>
  );
}

const Lbl=({children})=><div style={{fontSize:13,color:"var(--text3)",marginBottom:4}}>{children}</div>;

/* ════════════════════════════════════════════
   MAIN APP
════════════════════════════════════════════ */

/* ── Projects Page Component (extracted to avoid IIFE hook issues) ── */
/* ── Edit Project Activities (standalone component — hooks-safe) ── */
function ProjectsView({projects,projSearch,setProjSearch,projStatusFilter,setProjStatusFilter,
  monthEntries,projStats,isAdmin,isAcct,isLead,setShowProjModal,setEditProjModal,deleteProject,fmtCurrency,
  activities,setActivities,engineers,supabase,showToast,setProjects}){
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
    if(showToast)showToast("Activity saved ✓");
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
    if(showToast)showToast("Activity added ✓");
  };
  const delPvAct=async(id)=>{
    if(!window.confirm("Delete this activity?"))return;
    await supabase.from("project_activities").delete().eq("id",id);
    if(setActivities)setActivities(prev=>prev.filter(a=>a.id!==id));
    if(showToast)showToast("Activity deleted");
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
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-end",marginBottom:18}}>
        <div>
          <h1 style={{fontSize:21,fontWeight:700,color:"var(--text0)"}}>Projects</h1>
          <p style={{color:"var(--text4)",fontSize:14,marginTop:3}}>{filteredProjects.length} of {projects.length} projects</p>
        </div>
        <div style={{display:"flex",gap:8,alignItems:"flex-end"}}>
          <div>
            <div style={{fontSize:12,color:"var(--text4)",fontWeight:600,marginBottom:4}}>SEARCH</div>
            <input value={projSearch} onChange={e=>setProjSearch(e.target.value)}
              placeholder="Name, ID, client…" style={{width:180,background:"var(--bg2)",border:"1px solid var(--border3)",borderRadius:6,padding:"7px 10px",color:"var(--text0)",fontSize:14,fontFamily:"'IBM Plex Sans',sans-serif"}}/>
          </div>
          <div>
            <div style={{fontSize:12,color:"var(--text4)",fontWeight:600,marginBottom:4}}>STATUS</div>
            <select value={projStatusFilter} onChange={e=>setProjStatusFilter(e.target.value)}
              style={{width:130,background:"var(--bg2)",border:"1px solid var(--border3)",borderRadius:6,padding:"7px 10px",color:"var(--text0)",fontSize:14,fontFamily:"'IBM Plex Sans',sans-serif"}}>
              <option value="ALL">All Statuses</option>
              {["Active","On Hold","Completed"].map(s=><option key={s}>{s}</option>)}
            </select>
          </div>
          {isAdmin&&<button style={{background:"#0ea5e9",border:"none",borderRadius:6,padding:"8px 14px",color:"#fff",fontSize:14,fontWeight:600,cursor:"pointer",fontFamily:"'IBM Plex Sans',sans-serif"}} onClick={()=>setShowProjModal(true)}>+ New Project</button>}
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
                  <div style={{fontFamily:"'IBM Plex Mono',monospace",fontSize:11,color:"var(--info)",marginTop:1}}>{p.id}</div>
                </div>
                <div style={{display:"flex",gap:5,alignItems:"flex-start"}}>
                  <span style={{fontSize:11,padding:"2px 7px",borderRadius:3,fontFamily:"'IBM Plex Mono',monospace",fontWeight:700,
                    background:p.status==="Active"?"#024b36":p.status==="On Hold"?"#7c2d1230":"var(--border)",
                    color:p.status==="Active"?"#34d399":p.status==="On Hold"?"#fb923c":"#60a5fa"}}>{p.status}</span>
                  {canManage&&<button style={{background:"#0ea5e9",border:"none",borderRadius:4,padding:"2px 6px",color:"#fff",fontSize:12,cursor:"pointer"}} onClick={()=>setEditProjModal({...p})}>✎</button>}
                  {isAdmin&&<button style={{background:"#ef4444",border:"none",borderRadius:4,padding:"2px 6px",color:"#fff",fontSize:12,cursor:"pointer"}} onClick={()=>deleteProject(p.id)}>✕</button>}
                </div>
              </div>
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
                  <div key={task} style={{display:"flex",justifyContent:"space-between",fontSize:12,marginBottom:2}}>
                    <span style={{color:"var(--text2)"}}>{task}</span>
                    <span style={{fontFamily:"'IBM Plex Mono',monospace",color:"var(--info)"}}>{hrs}h</span>
                  </div>
                ))}
              </div>}
              <div style={{paddingTop:9,borderTop:"1px solid var(--border3)"}}>
                <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                  <div>
                    <div style={{fontFamily:"'IBM Plex Mono',monospace",fontSize:18,fontWeight:700,color:"var(--info)"}}>{ps?.hours||0}h</div>
                    {(isAdmin||isAcct)&&p.billable&&<div style={{fontSize:12,color:"#a78bfa"}}>{fmtCurrency(ps?.revenue||0)}</div>}
                  </div>
                  {canManage&&<button className="bp" style={{fontSize:11,padding:"2px 8px"}} onClick={()=>openPvAct(p.id)}>+ Activity</button>}
                </div>
                {/* Activities mini-list */}
                {canManage&&(()=>{
                  const pActs=(activities||[]).filter(a=>a.project_id===p.id);
                  if(!pActs.length) return null;
                  return(
                    <div style={{marginTop:8,display:"grid",gap:2}}>
                      {pActs.slice(0,5).map(a=>(
                        <div key={a.id} style={{display:"flex",justifyContent:"space-between",alignItems:"center",
                          background:"var(--bg2)",borderRadius:4,padding:"3px 7px",fontSize:11}}>
                          <span style={{color:"var(--text2)",flex:1,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{a.activity_name}</span>
                          <span style={{fontFamily:"'IBM Plex Mono',monospace",color:
                            a.status==="Completed"?"#34d399":a.status==="In Progress"?"var(--info)":"var(--text3)",
                            marginLeft:6,whiteSpace:"nowrap"}}>{Math.round((a.progress||0)*100)}%</span>
                          <button onClick={()=>openPvAct(p.id,a)} style={{background:"none",border:"none",color:"var(--text4)",cursor:"pointer",fontSize:12,padding:"0 3px"}}>✎</button>
                          <button onClick={()=>delPvAct(a.id)} style={{background:"none",border:"none",color:"var(--text4)",cursor:"pointer",fontSize:12,padding:"0 3px"}}>✕</button>
                        </div>
                      ))}
                      {pActs.length>5&&<div style={{fontSize:11,color:"var(--text4)",textAlign:"center"}}>+{pActs.length-5} more</div>}
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


/* ─── PROJECT TASKS ANALYSIS PDF ─── */
function buildProjectTasksPDF(pm, grandTotal, month, year, MONTHS_ARR, fmtCurrency, isAdmin, isAcct, periodLabel){
  try{
  const now=new Date().toLocaleDateString("en-GB",{day:"2-digit",month:"short",year:"numeric"});
  const p=pm.proj;
  const pct=grandTotal?Math.round(pm.totalHrs/grandTotal*100):100;
  const billPct=pm.totalHrs?Math.round(pm.billableHrs/pm.totalHrs*100):0;
  const tasksSorted=Object.entries(pm.tasks).sort((a,b)=>b[1].hrs-a[1].hrs);
  const engList=Object.values(pm.engineers).sort((a,b)=>b.hrs-a.hrs);
  const avgDay=pm.days?Math.round(pm.totalHrs/pm.days*10)/10:0;

  const TASK_COLORS=["#0ea5e9","#a78bfa","#34d399","#fb923c","#f87171","#e879f9","#facc15","#4ade80","#f472b6","#60a5fa"];
  const taskColorMap={};let ci=0;
  tasksSorted.forEach(([t])=>{if(!taskColorMap[t])taskColorMap[t]=TASK_COLORS[ci++%TASK_COLORS.length];});

  // KPI cards
  const kpis=`
    <div style="display:grid;grid-template-columns:repeat(4,1fr);gap:10px;margin-bottom:20px">
      ${[
        {l:"Total Hours",   v:pm.totalHrs+"h",  c:"#0ea5e9"},
        {l:"Engineers",     v:Object.keys(pm.engineers).length, c:"#a78bfa"},
        {l:"Work Days",     v:pm.days,           c:"#34d399"},
        {l:"Avg Hrs/Day",   v:avgDay+"h",        c:"#fb923c"},
      ].map(k=>`
        <div style="background:#f0f7ff;border:1px solid #bfdbfe;border-radius:8px;padding:12px">
          <div style="font-family:'IBM Plex Mono',monospace;font-size:22px;font-weight:700;color:${k.c};line-height:1">${k.v}</div>
          <div style="font-size:11px;color:#64748b;text-transform:uppercase;letter-spacing:.08em;margin-top:4px">${k.l}</div>
        </div>`).join("")}
    </div>`;

  // Project info table
  const infoRows=[
    ["Project ID",p.id],
    ["Project Name",p.name],
    ["Client",p.client||"—"],
    ["Project Manager",p.pm||"—"],
    ["Phase",p.phase||"—"],
    ["Status",p.status||"—"],
    ["Type",p.type||"—"],
    ...(isAdmin||isAcct?[
      ["Billing",p.billable?"Billable at $"+p.rate_per_hour+"/h":"Non-Billable"],
      ...(p.billable&&p.rate_per_hour>0?[["Revenue",fmtCurrency(pm.totalHrs*p.rate_per_hour)]]:[] ),
    ]:[]),
    ["Share of Month",pct+"% of total hours"],
  ];
  const infoTable=`
    <div class="section">
      <div class="st">Project Information</div>
      <table><tbody>
        ${infoRows.map(([k,v],i)=>`<tr><td style="width:160px;font-weight:600;color:#334155;background:${i%2===0?"#f8fafc":"#fff"}">${k}</td><td style="background:${i%2===0?"#f8fafc":"#fff"}">${v}</td></tr>`).join("")}
      </tbody></table>
    </div>`;

  // Task breakdown — bars + table
  const taskBars=tasksSorted.map(([task,data])=>{
    const tpct=pm.totalHrs?Math.round(data.hrs/pm.totalHrs*100):0;
    const col=taskColorMap[task]||"#0ea5e9";
    return`<div style="margin-bottom:10px">
      <div style="display:flex;justify-content:space-between;margin-bottom:3px;font-size:12px">
        <div style="display:flex;align-items:center;gap:6px">
          <div style="width:8px;height:8px;border-radius:2px;background:${col};flex-shrink:0"></div>
          <span style="font-weight:600;color:#1e293b">${task}</span>
        </div>
        <div style="display:flex;gap:16px;font-family:'IBM Plex Mono',monospace">
          <span style="color:${col};font-weight:700">${data.hrs}h</span>
          <span style="color:#64748b">${tpct}%</span>
          <span style="color:#94a3b8">${data.engs} engineer${data.engs!==1?"s":""}</span>
        </div>
      </div>
      <div style="background:#e2e8f0;height:7px;border-radius:4px;overflow:hidden">
        <div style="height:100%;width:${tpct}%;background:${col};border-radius:4px"></div>
      </div>
    </div>`;
  }).join("");

  const taskSection=`
    <div class="section">
      <div class="st">Task Breakdown — ${tasksSorted.length} Task Types</div>
      ${taskBars}
      <table style="margin-top:14px">
        <thead><tr><th>Task Type</th><th style="text-align:right">Hours</th><th style="text-align:right">Share</th><th style="text-align:right">Engineers</th></tr></thead>
        <tbody>${tasksSorted.map(([task,data],i)=>{
          const tpct=pm.totalHrs?Math.round(data.hrs/pm.totalHrs*100):0;
          const col=taskColorMap[task]||"#0ea5e9";
          return`<tr><td><span style="display:inline-block;width:8px;height:8px;border-radius:2px;background:${col};margin-right:6px"></span>${task}</td>
            <td style="text-align:right;font-family:'IBM Plex Mono',monospace;color:${col};font-weight:700">${data.hrs}h</td>
            <td style="text-align:right;font-family:'IBM Plex Mono',monospace">${tpct}%</td>
            <td style="text-align:right">${data.engs}</td></tr>`;
        }).join("")}</tbody>
      </table>
    </div>`;

  // Engineer contribution
  const engSection=`
    <div class="section">
      <div class="st">Engineer Contributions — ${engList.length} Engineers</div>
      ${engList.map(eng=>{
        const epct=pm.totalHrs?Math.round(eng.hrs/pm.totalHrs*100):0;
        const topTask=Object.entries(eng.tasks).sort((a,b)=>b[1]-a[1])[0];
        return`<div style="margin-bottom:10px">
          <div style="display:flex;justify-content:space-between;margin-bottom:3px;font-size:12px">
            <div style="display:flex;align-items:center;gap:8px">
              <div style="width:24px;height:24px;border-radius:50%;background:linear-gradient(135deg,#0ea5e9,#0369a1);display:flex;align-items:center;justify-content:center;font-size:10px;font-weight:700;color:#fff;flex-shrink:0">${(eng.name||"?").slice(0,2).toUpperCase()}</div>
              <div>
                <div style="font-weight:600;color:#1e293b">${eng.name}</div>
                ${topTask?`<div style="font-size:11px;color:#64748b">Top task: ${topTask[0]} (${topTask[1]}h)</div>`:""}
              </div>
            </div>
            <div style="display:flex;gap:16px;align-items:center;font-family:'IBM Plex Mono',monospace">
              <span style="color:#0ea5e9;font-weight:700">${eng.hrs}h</span>
              <span style="color:#64748b">${epct}%</span>
            </div>
          </div>
          <div style="background:#e2e8f0;height:7px;border-radius:4px;overflow:hidden">
            <div style="height:100%;width:${epct}%;background:linear-gradient(90deg,#0ea5e9,#38bdf8);border-radius:4px"></div>
          </div>
        </div>`;
      }).join("")}
      <table style="margin-top:14px">
        <thead><tr><th>Engineer</th><th style="text-align:right">Hours</th><th style="text-align:right">Share</th><th>Top Task</th></tr></thead>
        <tbody>${engList.map((eng,i)=>{
          const epct=pm.totalHrs?Math.round(eng.hrs/pm.totalHrs*100):0;
          const topTask=Object.entries(eng.tasks).sort((a,b)=>b[1]-a[1])[0];
          return`<tr>
            <td style="font-weight:500">${eng.name}</td>
            <td style="text-align:right;font-family:'IBM Plex Mono',monospace;color:#0ea5e9;font-weight:700">${eng.hrs}h</td>
            <td style="text-align:right;font-family:'IBM Plex Mono',monospace">${epct}%</td>
            <td style="color:#64748b;font-size:12px">${topTask?topTask[0]+" ("+topTask[1]+"h)":"—"}</td></tr>`;
        }).join("")}</tbody>
      </table>
    </div>`;

  // Billability section
  const billSection=(isAdmin||isAcct)&&p.billable?`
    <div class="section">
      <div class="st">Billability Summary</div>
      <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:10px;margin-bottom:14px">
        ${[
          {l:"Billable Hours",  v:pm.billableHrs+"h",  c:"#34d399"},
          {l:"Bill %",          v:billPct+"%",          c:"#0ea5e9"},
          ...(p.rate_per_hour>0?[{l:"Revenue",v:fmtCurrency(pm.totalHrs*p.rate_per_hour),c:"#a78bfa"}]:[]),
        ].map(k=>`
          <div style="background:#f0fdf4;border:1px solid #bbf7d0;border-radius:8px;padding:12px">
            <div style="font-family:'IBM Plex Mono',monospace;font-size:20px;font-weight:700;color:${k.c};line-height:1">${k.v}</div>
            <div style="font-size:11px;color:#64748b;text-transform:uppercase;letter-spacing:.08em;margin-top:4px">${k.l}</div>
          </div>`).join("")}
      </div>
      <div style="background:#e2e8f0;height:10px;border-radius:5px;overflow:hidden;margin-bottom:6px">
        <div style="height:100%;width:${billPct}%;background:linear-gradient(90deg,#34d399,#10b981);border-radius:5px"></div>
      </div>
      <div style="font-size:12px;color:#64748b;text-align:right">${billPct}% of hours are billable</div>
    </div>`:"";

  // Build full PDF using shared PDF_STYLE + fixed header/footer
  const html=`<!DOCTYPE html><html><head><meta charset="utf-8"><title>Project Report — ${p.id}</title><style>${PDF_STYLE}</style></head><body>
  ${pdfHeader(`Project Analysis · ${p.id}`, `${periodLabel||'All Time'}`, now)}
  ${pdfFooter(`${p.name} — ${p.id}`, now)}
  <div class="cover">
    <div style="display:flex;align-items:center;gap:14px;margin-bottom:16px">
      <img src="${LOGO_SRC}" alt="ENEVO Group" style="width:52px;height:52px;border-radius:10px;object-fit:contain;flex-shrink:0"/>
      <div>
        <div class="cl" style="margin-bottom:2px">ENEVO GROUP · Project Tasks Analysis</div>
        <div style="font-size:13px;color:#94a3b8">Industrial & Renewable Energy Automation</div>
      </div>
    </div>
    <div class="ct">${p.name}</div>
    <div class="cs">Project ID: ${p.id} · ${periodLabel||'All Time'}</div>
    <div class="cm">
      <div><label>Generated</label><span>${now}</span></div>
      <div><label>Total Hours</label><span>${pm.totalHrs}h</span></div>
      <div><label>Engineers</label><span>${Object.keys(pm.engineers).length}</span></div>
      <div><label>Status</label><span>${p.status||"Active"}</span></div>
    </div>
  </div>
  <div class="body">
    ${kpis}
    ${infoTable}
    ${taskSection}
    ${engSection}
    ${billSection}
  </div>
  <script>window.onload=()=>window.print()<\/script>
  </body></html>`;
  const w=window.open("","pdf_"+Date.now()+"_"+Math.random().toString(36).slice(2));
  if(w){w.document.write(html);w.document.close();w.focus();setTimeout(()=>w.print(),600);}
  else{alert("Please allow popups to export PDFs.");}
  }catch(err){ alert("Export error: "+err.message); console.error(err); }
}


/* ─── FINANCE P&L PDF ─── */
function buildFinancePDF({finMonth,finYear,MONTHS_,monthRevUSD,totalPayrollUSDeff,totalPayrollEGP,totalExpUSD,totalExpEGP,totalCostUSD,netPL,netColor,activeStaff,monthExp,deptList,projProfit,ytdData,ytdRev,ytdCost,ytdNet,fmtCurrency,isAdmin,egpRate}){
  const totalPayrollUSD=totalPayrollUSDeff; // alias for PDF use
  const now=new Date().toLocaleDateString("en-GB",{day:"2-digit",month:"short",year:"numeric"});
  const period=`${MONTHS_[finMonth]} ${finYear}`;
  const netSign=netPL>=0?"▲ PROFIT":"▼ LOSS";
  const marginPct=monthRevUSD>0?Math.round(netPL/monthRevUSD*100):0;

  const kpiCards=(items)=>items.map(k=>`
    <div style="background:#f0f7ff;border:1px solid #bfdbfe;border-radius:8px;padding:12px;text-align:center">
      <div style="font-family:'IBM Plex Mono',monospace;font-size:18px;font-weight:700;color:${k.c};line-height:1">${k.v}</div>
      <div style="font-size:10px;color:#64748b;text-transform:uppercase;letter-spacing:.08em;margin-top:4px">${k.l}</div>
    </div>`).join("");

  const coverSection=`
  <div class="cover">
    <div style="display:flex;align-items:center;gap:14px;margin-bottom:20px">
      <img src="${LOGO_SRC}" style="width:52px;height:52px;border-radius:10px;object-fit:contain"/>
      <div>
        <div class="cl">ENEVO GROUP · Financial Report</div>
        <div style="font-size:13px;color:#94a3b8">Profit & Loss Statement</div>
      </div>
    </div>
    <div class="ct">P&L Report — ${period}</div>
    <div class="cs">Generated: ${now} · CONFIDENTIAL</div>
    <div class="cm">
      <div><label>Revenue</label><span>$${monthRevUSD.toLocaleString()}</span></div>
      <div><label>Total Cost</label><span>$${totalCostUSD.toLocaleString()}</span></div>
      <div><label>EGP Rate</label><span>${egpRate} EGP/$</span></div>
      <div><label>Net P&L</label><span style="color:${netColor}">${netSign} $${Math.abs(netPL).toLocaleString()}</span></div>
      <div><label>Margin</label><span style="color:${netColor}">${marginPct}%</span></div>
    </div>
  </div>`;

  const plSection=`
  <div class="section">
    <div class="st">Profit & Loss Summary — ${period}</div>
    <div style="display:grid;grid-template-columns:repeat(4,1fr);gap:10px;margin-bottom:16px">
      ${kpiCards([
        {l:"Revenue",     v:fmtCurrency(monthRevUSD),   c:"#16a34a"},
        {l:"Payroll",     v:fmtCurrency(totalPayrollUSD),c:"#dc2626"},
        {l:"Expenses",    v:fmtCurrency(totalExpUSD),   c:"#ea580c"},
        {l:"Net P&L",     v:fmtCurrency(netPL),         c:netColor},
      ])}
    </div>
    <table>
      <thead><tr><th>Item</th><th style="text-align:right">USD</th><th style="text-align:right">EGP</th><th style="text-align:right">Notes</th></tr></thead>
      <tbody>
        <tr style="background:#f0fdf4"><td style="font-weight:700;color:#16a34a">Revenue — Billable Projects</td><td style="text-align:right;font-family:'IBM Plex Mono',monospace;font-weight:700;color:#16a34a">${fmtCurrency(monthRevUSD)}</td><td style="text-align:right">—</td><td style="font-size:11px;color:#64748b">Derived from project billing rates × hours</td></tr>
        <tr><td style="font-weight:600;color:#dc2626">Total Payroll</td><td style="text-align:right;font-family:'IBM Plex Mono',monospace;color:#dc2626;font-weight:700">${fmtCurrency(totalPayrollUSD)}</td><td style="text-align:right;font-family:'IBM Plex Mono',monospace;color:#ea580c">EGP ${totalPayrollEGP.toLocaleString()}</td><td style="font-size:11px;color:#64748b">${activeStaff.length} active staff</td></tr>
        <tr><td style="font-weight:600;color:#ea580c">Office & Other Expenses</td><td style="text-align:right;font-family:'IBM Plex Mono',monospace;color:#ea580c;font-weight:700">${fmtCurrency(totalExpUSD)}</td><td style="text-align:right;font-family:'IBM Plex Mono',monospace;color:#a78bfa">EGP ${totalExpEGP.toLocaleString()}</td><td style="font-size:11px;color:#64748b">${monthExp.length} expense entries</td></tr>
        <tr style="background:#0f2a50;color:#fff"><td style="font-weight:700">NET PROFIT / LOSS</td><td style="text-align:right;font-family:'IBM Plex Mono',monospace;font-weight:700;font-size:16px;color:${netColor}">${netPL>=0?"+":""}${fmtCurrency(netPL)}</td><td style="text-align:right;color:#94a3b8">—</td><td style="text-align:right;font-family:'IBM Plex Mono',monospace;color:${netColor}">${marginPct}% margin</td></tr>
      </tbody>
    </table>
  </div>`;

  const deptSection=`
  <div class="section">
    <div class="st">Salary by Department</div>
    <table>
      <thead><tr><th>Department</th><th style="text-align:right">Headcount</th><th style="text-align:right">Monthly USD</th><th style="text-align:right">Monthly EGP</th><th style="text-align:right">% of Payroll</th></tr></thead>
      <tbody>${deptList.map(d=>`<tr>
        <td style="font-weight:600">${d.dept}</td>
        <td style="text-align:right">${d.count}</td>
        <td style="text-align:right;font-family:'IBM Plex Mono',monospace;color:#dc2626;font-weight:700">${fmtCurrency(d.usd)}</td>
        <td style="text-align:right;font-family:'IBM Plex Mono',monospace;color:#ea580c">EGP ${d.egp.toLocaleString()}</td>
        <td style="text-align:right;font-family:'IBM Plex Mono',monospace">${totalPayrollUSD?Math.round(d.usd/totalPayrollUSD*100):0}%</td>
      </tr>`).join("")}</tbody>
    </table>
  </div>`;

  const staffSection=`
  <div class="section">
    <div class="st">Staff Salary Breakdown (${activeStaff.length} Active)</div>
    <table>
      <thead><tr><th>Name</th><th>Department</th><th>Role</th><th>Type</th><th style="text-align:right">USD/mo</th><th style="text-align:right">EGP/mo</th><th>Joined</th><th>Left</th></tr></thead>
      <tbody>${activeStaff.map(s=>`<tr>
        <td style="font-weight:600">${s.name}</td>
        <td style="color:#0ea5e9;font-size:11px">${s.department}</td>
        <td style="color:#64748b;font-size:11px">${s.role}</td>
        <td style="font-size:10px"><span style="padding:2px 5px;border-radius:3px;background:#dbeafe;color:#1e40af">${(s.type||"full_time").replace("_"," ")}</span></td>
        <td style="text-align:right;font-family:'IBM Plex Mono',monospace;font-weight:700;color:#dc2626">${fmtCurrency(s.salary_usd||0)}</td>
        <td style="text-align:right;font-family:'IBM Plex Mono',monospace;color:#ea580c">EGP ${(s.salary_egp||0).toLocaleString()}</td>
        <td style="font-family:'IBM Plex Mono',monospace;font-size:11px;color:#0ea5e9">${s.join_date||'—'}</td>
        <td style="font-family:'IBM Plex Mono',monospace;font-size:11px;color:${s.termination_date?'#dc2626':'#94a3b8'}">${s.termination_date||'—'}</td>
      </tr>`).join("")}</tbody>
    </table>
  </div>`;

  const expSection=`
  <div class="section">
    <div class="st">Expense Detail — ${period} (${monthExp.length} entries)</div>
    ${monthExp.length===0?`<p style="color:#94a3b8;font-size:12px;padding:10px 0">No expenses recorded for ${period}.</p>`:`
    <table>
      <thead><tr><th>Category</th><th>Description</th><th style="text-align:right">USD</th><th style="text-align:right">EGP</th><th>Notes</th></tr></thead>
      <tbody>${monthExp.map(e=>`<tr>
        <td><span style="font-size:10px;padding:2px 5px;border-radius:3px;background:#dbeafe;color:#1e40af">${e.category}</span></td>
        <td>${e.description}</td>
        <td style="text-align:right;font-family:'IBM Plex Mono',monospace;font-weight:700;color:#ea580c">${e.amount_usd?fmtCurrency(e.amount_usd):"-"}</td>
        <td style="text-align:right;font-family:'IBM Plex Mono',monospace;color:#7c3aed">EGP ${(e.amount_egp||0).toLocaleString()}</td>
        <td style="font-size:11px;color:#64748b;font-style:italic">${e.notes||""}</td>
      </tr>`).join("")}</tbody>
    </table>`}
  </div>`;

  const projSection=projProfit.length>0?`
  <div class="section">
    <div class="st">Per-Project Profitability — ${period}</div>
    <div style="font-size:11px;color:#64748b;margin-bottom:8px">Cost allocated proportionally by hours worked on each billable project.</div>
    <table>
      <thead><tr><th>Project</th><th style="text-align:right">Revenue</th><th style="text-align:right">Alloc. Cost</th><th style="text-align:right">Net P&L</th><th style="text-align:right">Margin</th><th style="text-align:right">Hours</th></tr></thead>
      <tbody>${projProfit.map(p=>{
        const margin=p.rev>0?Math.round(p.net/p.rev*100):0;
        const c=p.net>=0?"#16a34a":"#dc2626";
        return`<tr>
          <td style="font-weight:600">${p.name} — ${p.id}</td>
          <td style="text-align:right;font-family:'IBM Plex Mono',monospace;color:#16a34a;font-weight:700">${fmtCurrency(p.rev)}</td>
          <td style="text-align:right;font-family:'IBM Plex Mono',monospace;color:#dc2626">${fmtCurrency(Math.round(p.allocatedCost))}</td>
          <td style="text-align:right;font-family:'IBM Plex Mono',monospace;font-weight:700;color:${c}">${p.net>=0?"+":""}${fmtCurrency(Math.round(p.net))}</td>
          <td style="text-align:right;font-family:'IBM Plex Mono',monospace;color:${c}">${margin}%</td>
          <td style="text-align:right;font-family:'IBM Plex Mono',monospace;color:#64748b">${p.hrs}h</td>
        </tr>`;
      }).join("")}</tbody>
    </table>
  </div>`:"";

  const ytdSection=`
  <div class="section">
    <div class="st">Year-to-Date ${finYear} Summary</div>
    <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:10px;margin-bottom:14px">
      ${kpiCards([
        {l:"YTD Revenue",v:fmtCurrency(ytdRev), c:"#16a34a"},
        {l:"YTD Costs",  v:fmtCurrency(ytdCost),c:"#dc2626"},
        {l:"YTD Net",    v:fmtCurrency(ytdNet), c:ytdNet>=0?"#16a34a":"#dc2626"},
      ])}
    </div>
    <table>
      <thead><tr><th>Month</th><th style="text-align:right">Revenue</th><th style="text-align:right">Cost</th><th style="text-align:right">Net P&L</th><th style="text-align:right">Margin</th></tr></thead>
      <tbody>${ytdData.map(row=>{
        const margin=row.rev>0?Math.round(row.net/row.rev*100):0;
        const c=row.net>=0?"#16a34a":"#dc2626";
        return`<tr>
          <td style="font-weight:600">${MONTHS_[row.m]} ${finYear}</td>
          <td style="text-align:right;font-family:'IBM Plex Mono',monospace;color:#16a34a;font-weight:700">${fmtCurrency(row.rev)}</td>
          <td style="text-align:right;font-family:'IBM Plex Mono',monospace;color:#dc2626">${fmtCurrency(row.cost)}</td>
          <td style="text-align:right;font-family:'IBM Plex Mono',monospace;font-weight:700;color:${c}">${row.net>=0?"+":""}${fmtCurrency(row.net)}</td>
          <td style="text-align:right;font-family:'IBM Plex Mono',monospace;color:${c}">${margin}%</td>
        </tr>`;
      }).join("")}</tbody>
    </table>
  </div>`;

  generatePDF(
    `P&L Report — ${period}`,
    [plSection, deptSection, staffSection, expSection, projSection, ytdSection],
    `Financial Statement · ${period} · CONFIDENTIAL`
  );
}

/* ─── ALL PROJECTS COMBINED PDF ─── */
function buildAllProjectsPDF(projList, grandTotal, MONTHS_ARR, fmtCurrency, isAdmin, isAcct, periodLabel){
  const now=new Date().toLocaleDateString("en-GB",{day:"2-digit",month:"short",year:"numeric"});
  const TASK_COLORS=["#0ea5e9","#a78bfa","#34d399","#fb923c","#f87171","#e879f9","#facc15","#4ade80","#f472b6","#60a5fa"];
  const totalBillable=projList.reduce((s,pm)=>s+pm.billableHrs,0);
  const allEngs=new Set(projList.flatMap(pm=>Object.keys(pm.engineers)));

  // Build one HTML block per project
  function buildProjectBlock(pm, idx){
    const p=pm.proj;
    const pct=grandTotal?Math.round(pm.totalHrs/grandTotal*100):0;
    const billPct=pm.totalHrs?Math.round(pm.billableHrs/pm.totalHrs*100):0;
    const avgDay=pm.days?Math.round(pm.totalHrs/pm.days*10)/10:0;
    const tasksSorted=Object.entries(pm.tasks).sort((a,b)=>b[1].hrs-a[1].hrs);
    const engList=Object.values(pm.engineers).sort((a,b)=>b.hrs-a.hrs);
    const tcm={};let ci=0;
    tasksSorted.forEach(([t])=>{if(!tcm[t])tcm[t]=TASK_COLORS[ci++%TASK_COLORS.length];});

    const taskBars=tasksSorted.map(([task,data])=>{
      const tpct=pm.totalHrs?Math.round(data.hrs/pm.totalHrs*100):0;
      const col=tcm[task]||"#0ea5e9";
      return`<div style="margin-bottom:10px">
        <div style="display:flex;justify-content:space-between;margin-bottom:3px;font-size:12px">
          <div style="display:flex;align-items:center;gap:6px">
            <div style="width:8px;height:8px;border-radius:2px;background:${col};flex-shrink:0"></div>
            <span style="font-weight:700;color:#0f172a;font-size:12px">${task}</span>
          </div>
          <div style="display:flex;gap:14px;font-family:'IBM Plex Mono',monospace">
            <span style="color:${col};font-weight:700;font-size:12px">${data.hrs}h</span>
            <span style="color:#334155;font-weight:600;font-size:12px">${tpct}%</span>
            <span style="color:#64748b;font-size:11px">${data.engs} eng</span>
          </div>
        </div>
        <div style="background:#cbd5e1;height:6px;border-radius:3px;overflow:hidden">
          <div style="height:100%;width:${tpct}%;background:${col};border-radius:3px"></div>
        </div>
      </div>`;
    }).join("");

    const engRows=engList.map((eng,ri)=>{
      const epct=pm.totalHrs?Math.round(eng.hrs/pm.totalHrs*100):0;
      const top=Object.entries(eng.tasks).sort((a,b)=>b[1]-a[1])[0];
      const rowBg=ri%2===0?"#f8fafc":"#fff";
      return`<tr style="background:${rowBg}">
        <td style="font-weight:600;color:#0f172a;padding:5px 8px">${eng.name}</td>
        <td style="text-align:right;font-family:'IBM Plex Mono',monospace;color:#0ea5e9;font-weight:700;padding:5px 8px">${eng.hrs}h</td>
        <td style="text-align:right;font-family:'IBM Plex Mono',monospace;color:#334155;font-weight:600;padding:5px 8px">${epct}%</td>
        <td style="color:#475569;font-size:11px;padding:5px 8px">${top?top[0]+" ("+top[1]+"h)":"—"}</td>
      </tr>`;
    }).join("");

    const billBar=(isAdmin||isAcct)&&p.billable?`
      <div style="margin-top:10px;padding-top:8px;border-top:1px solid #e2e8f0">
        <div style="display:flex;justify-content:space-between;font-size:11px;margin-bottom:3px">
          <span style="color:#64748b">Billable coverage</span>
          <span style="font-family:'IBM Plex Mono',monospace;color:#10b981;font-weight:700">${billPct}%${p.rate_per_hour>0?" · "+fmtCurrency(pm.totalHrs*p.rate_per_hour):""}</span>
        </div>
        <div style="background:#e2e8f0;height:6px;border-radius:3px;overflow:hidden">
          <div style="height:100%;width:${billPct}%;background:linear-gradient(90deg,#34d399,#10b981);border-radius:3px"></div>
        </div>
      </div>`:"";

    return`
    <div style="page-break-before:${idx===0?"avoid":"always"};padding:28px 32px 0">
      <!-- Project header banner -->
      <div style="background:linear-gradient(135deg,#0a1628,#0f2a50);border-radius:10px;padding:18px 22px;margin-bottom:16px;display:flex;justify-content:space-between;align-items:flex-start">
        <div>
          <div style="font-family:'IBM Plex Mono',monospace;font-size:11px;letter-spacing:.18em;color:#38bdf8;margin-bottom:5px;font-weight:700">${idx+1} of ${projList.length}  ·  ${p.id}</div>
          <div style="font-size:20px;font-weight:700;color:#ffffff;margin-bottom:4px;letter-spacing:-.01em">${p.name||p.id}</div>
          <div style="font-size:12px;color:#94a3b8;margin-top:2px;font-weight:500">${p.client?"Client: "+p.client+"  ·  ":""} Phase: ${p.phase||"—"}${p.type?"  ·  "+p.type:""}${p.pm?"  ·  PM: "+p.pm:""}</div>
        </div>
        <div style="text-align:right">
          <div style="font-family:'IBM Plex Mono',monospace;font-size:28px;font-weight:700;color:#38bdf8;line-height:1">${pm.totalHrs}h</div>
          <div style="font-size:11px;color:#94a3b8;margin-top:3px;font-weight:500">${pct}% of total  ·  ${pm.days} days active</div>
          <div style="display:flex;gap:5px;margin-top:5px;justify-content:flex-end">
            <span style="font-size:10px;padding:2px 6px;border-radius:3px;background:${p.status==="Active"?"#024b36":"#1e3a5f"};color:${p.status==="Active"?"#34d399":"#60a5fa"}">${p.status||"Active"}</span>
            ${p.billable?`<span style="font-size:10px;padding:2px 6px;border-radius:3px;background:#0c2b4e;color:#38bdf8">BILLABLE</span>`:""}
          </div>
        </div>
      </div>

      <!-- KPI row -->
      <div style="display:grid;grid-template-columns:repeat(4,1fr);gap:8px;margin-bottom:14px">
        ${[
          {l:"Total Hours",v:pm.totalHrs+"h",c:"#0ea5e9"},
          {l:"Engineers",  v:Object.keys(pm.engineers).length,c:"#a78bfa"},
          {l:"Work Days",  v:pm.days,c:"#34d399"},
          {l:"Avg/Day",    v:avgDay+"h",c:"#fb923c"},
        ].map(k=>`<div style="background:#f0f7ff;border:1px solid #bfdbfe;border-radius:8px;padding:12px">
          <div style="font-family:'IBM Plex Mono',monospace;font-size:20px;font-weight:700;color:${k.c};line-height:1">${k.v}</div>
          <div style="font-size:11px;color:#334155;text-transform:uppercase;letter-spacing:.08em;margin-top:5px;font-weight:600">${k.l}</div>
        </div>`).join("")}
      </div>

      <!-- Two columns: task breakdown + engineer contribution -->
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:14px;margin-bottom:10px">
        <div>
          <div style="font-size:11px;font-weight:700;color:#0e4880;text-transform:uppercase;letter-spacing:.1em;padding-bottom:6px;border-bottom:2px solid #0ea5e9;margin-bottom:10px">Task Breakdown · ${tasksSorted.length} types</div>
          ${taskBars||"<div style='color:#94a3b8;font-size:12px'>No task data</div>"}
        </div>
        <div>
          <div style="font-size:11px;font-weight:700;color:#4c1d95;text-transform:uppercase;letter-spacing:.1em;padding-bottom:6px;border-bottom:2px solid #a78bfa;margin-bottom:10px">Engineer Contributions</div>
          <table style="font-size:11px">
            <thead><tr>
              <th style="background:#0f2a50;color:#fff;padding:4px 6px">Engineer</th>
              <th style="background:#0f2a50;color:#fff;padding:4px 6px;text-align:right">Hours</th>
              <th style="background:#0f2a50;color:#fff;padding:4px 6px;text-align:right">%</th>
              <th style="background:#0f2a50;color:#fff;padding:4px 6px">Top Task</th>
            </tr></thead>
            <tbody>${engRows}</tbody>
          </table>
        </div>
      </div>
      ${billBar}
      <div style="border-top:1px solid #e2e8f0;margin-top:16px;padding-top:7px;font-size:10px;color:#64748b;display:flex;justify-content:space-between;font-weight:500">
        <span>ENEVO Group  ·  Project Tasks Analysis  ·  ${periodLabel||"All Time"}</span>
        <span>Project ${idx+1} of ${projList.length}</span>
      </div>
    </div>`;
  }

  // Cover page summary table
  const summaryRows=projList.map((pm,i)=>{
    const pct=grandTotal?Math.round(pm.totalHrs/grandTotal*100):0;
    const billPct=pm.totalHrs?Math.round(pm.billableHrs/pm.totalHrs*100):0;
    const rowBg=i%2===0?"rgba(255,255,255,0.04)":"rgba(255,255,255,0.00)";
    return`<tr style="background:${rowBg}">
      <td style="font-family:'IBM Plex Mono',monospace;font-size:11px;color:#38bdf8;font-weight:700;padding:7px 10px">${pm.proj.id}</td>
      <td style="font-weight:600;color:#f0f6ff;font-size:12px;padding:7px 10px">${pm.proj.name||pm.proj.id}</td>
      <td style="text-align:right;font-family:'IBM Plex Mono',monospace;font-weight:700;color:#38bdf8;padding:7px 10px">${pm.totalHrs}h</td>
      <td style="text-align:right;font-family:'IBM Plex Mono',monospace;color:#94a3b8;padding:7px 10px">${pct}%</td>
      <td style="text-align:right;font-family:'IBM Plex Mono',monospace;color:#10b981;font-weight:700;padding:7px 10px">${billPct}%</td>
      <td style="text-align:right;color:#e2e8f0;padding:7px 10px">${Object.keys(pm.engineers).length}</td>
      <td style="padding:7px 10px"><span style="font-size:10px;padding:3px 7px;border-radius:3px;font-weight:700;background:${pm.proj.status==="Active"?"#024b36":pm.proj.status==="Completed"?"#0f2a50":"#2d1a00"};color:${pm.proj.status==="Active"?"#34d399":pm.proj.status==="Completed"?"#60a5fa":"#fb923c"}">${pm.proj.status||"Active"}</span></td>
    </tr>`;
  }).join("");

  // Build summary rows — 100% explicit inline styles, zero inheritance
  const coverSummaryRows = projList.map((pm,i)=>{
    const pct   = grandTotal ? Math.round(pm.totalHrs/grandTotal*100) : 0;
    const bPct  = pm.totalHrs ? Math.round(pm.billableHrs/pm.totalHrs*100) : 0;
    const rowBg = i%2===0 ? "#0f2845" : "#0c1e36";
    const stBg  = pm.proj.status==="Active" ? "#064e3b" : pm.proj.status==="Completed" ? "#1e3a5f" : "#431407";
    const stCol = pm.proj.status==="Active" ? "#6ee7b7" : pm.proj.status==="Completed" ? "#93c5fd" : "#fdba74";
    // Hours bar — visual width relative to max
    const barW  = grandTotal ? Math.max(4, Math.round(pm.totalHrs/grandTotal*120)) : 4;
    const displayName = (pm.proj.name && pm.proj.name.trim()) ? pm.proj.name : pm.proj.id;
    return `<tr>
      <td style="padding:8px 12px;background:${rowBg};font-family:'IBM Plex Mono',monospace;font-size:11px;color:#38bdf8;font-weight:700;white-space:nowrap;border-bottom:1px solid #0a1e38">${pm.proj.id}</td>
      <td style="padding:8px 12px;background:${rowBg};font-size:12px;font-weight:600;color:#e2eaf4;border-bottom:1px solid #0a1e38">${displayName}</td>
      <td style="padding:8px 12px;background:${rowBg};border-bottom:1px solid #0a1e38">
        <div style="display:flex;align-items:center;gap:8px">
          <div style="flex:0 0 auto;width:${barW}px;height:5px;background:#1d6fa8;border-radius:3px"></div>
          <span style="font-family:'IBM Plex Mono',monospace;font-size:12px;font-weight:700;color:#7dd3fc">${pm.totalHrs}h</span>
        </div>
      </td>
      <td style="padding:8px 12px;background:${rowBg};text-align:center;font-family:'IBM Plex Mono',monospace;font-size:12px;color:#94a3b8;border-bottom:1px solid #0a1e38">${pct}%</td>
      <td style="padding:8px 12px;background:${rowBg};text-align:center;font-family:'IBM Plex Mono',monospace;font-size:12px;font-weight:700;color:#6ee7b7;border-bottom:1px solid #0a1e38">${bPct}%</td>
      <td style="padding:8px 12px;background:${rowBg};text-align:center;font-family:'IBM Plex Mono',monospace;font-size:12px;color:#c4b5fd;border-bottom:1px solid #0a1e38">${Object.keys(pm.engineers).length}</td>
      <td style="padding:8px 12px;background:${rowBg};border-bottom:1px solid #0a1e38"><span style="display:inline-block;padding:3px 9px;border-radius:20px;font-size:10px;font-weight:700;letter-spacing:.05em;background:${stBg};color:${stCol}">${pm.proj.status||"Active"}</span></td>
    </tr>`;
  }).join("");

  const coverHTML=`
  <div style="background:#060e1c;font-family:'IBM Plex Sans',Arial,sans-serif;box-sizing:border-box;min-height:100vh" class="cover-page">

    <!-- TOP HEADER STRIP -->
    <div style="background:linear-gradient(120deg,#071428 0%,#0e2748 50%,#071428 100%);padding:36px 52px 30px;border-bottom:2px solid #0ea5e920">
      <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:20px">
        <div style="display:flex;align-items:center;gap:14px">
          <img src="${LOGO_SRC}" style="width:48px;height:48px;border-radius:10px;object-fit:contain"/>
          <div>
            <div style="font-family:'IBM Plex Mono',monospace;font-size:10px;letter-spacing:.2em;color:#38bdf8;font-weight:700">ENEVO GROUP</div>
            <div style="font-size:12px;color:#475569;margin-top:2px">Industrial & Renewable Energy Automation</div>
          </div>
        </div>
        <div style="text-align:right">
          <div style="font-size:11px;color:#334155;font-family:'IBM Plex Mono',monospace">${now}</div>
          <div style="font-size:11px;color:#334155;font-family:'IBM Plex Mono',monospace;margin-top:2px">CONFIDENTIAL</div>
        </div>
      </div>

      <div style="margin-bottom:24px">
        <div style="font-size:11px;font-family:'IBM Plex Mono',monospace;letter-spacing:.18em;color:#0ea5e9;font-weight:700;margin-bottom:8px;text-transform:uppercase">Project Tasks Analysis Report</div>
        <div style="font-size:34px;font-weight:700;color:#f0f6ff;letter-spacing:-.025em;line-height:1.1;margin-bottom:6px">All Projects</div>
        <div style="font-size:15px;color:#4a6580;font-weight:500">Period: ${periodLabel||"All Time"}</div>
      </div>

      <!-- KPI CARDS — 4 columns -->
      <div style="display:grid;grid-template-columns:repeat(4,1fr);gap:10px">
        ${[
          {l:"Total Hours",   v:grandTotal+"h",   c:"var(--info)", border:"#1d4e6a"},
          {l:"Projects",      v:projList.length,   c:"#a78bfa", border:"#3d2d6a"},
          {l:"Billable Hours",v:totalBillable+"h", c:"#34d399", border:"#0d4a34"},
          {l:"Engineers",     v:allEngs.size,      c:"#fbbf24", border:"#5a3e00"},
        ].map(k=>`
          <div style="background:#071428;border:1px solid ${k.border};border-radius:10px;padding:14px 18px;border-top:3px solid ${k.c}">
            <div style="font-family:'IBM Plex Mono',monospace;font-size:30px;font-weight:800;color:${k.c};line-height:1">${k.v}</div>
            <div style="font-size:11px;color:#4a6580;text-transform:uppercase;letter-spacing:.1em;margin-top:7px;font-weight:600">${k.l}</div>
          </div>
        `).join("")}
      </div>
    </div>

    <!-- SUMMARY TABLE -->
    <div style="padding:28px 52px 44px;background:#060e1c">
      <div style="display:flex;align-items:center;gap:10px;margin-bottom:14px">
        <div style="width:3px;height:16px;background:#0ea5e9;border-radius:2px"></div>
        <div style="font-size:11px;font-weight:700;color:#0ea5e9;text-transform:uppercase;letter-spacing:.18em">Project Summary — ${projList.length} Projects</div>
      </div>
      <table style="width:100%;border-collapse:collapse">
        <thead>
          <tr style="background:#071428;border-bottom:1px solid #0ea5e930">
            <th style="padding:10px 12px;text-align:left;font-family:'IBM Plex Mono',monospace;font-size:8.5px;font-weight:700;letter-spacing:.12em;color:#0ea5e9;text-transform:uppercase;border-bottom:2px solid #0ea5e940">ID</th>
            <th style="padding:10px 12px;text-align:left;font-family:'IBM Plex Mono',monospace;font-size:8.5px;font-weight:700;letter-spacing:.12em;color:#0ea5e9;text-transform:uppercase;border-bottom:2px solid #0ea5e940">Project Name</th>
            <th style="padding:10px 12px;text-align:left;font-family:'IBM Plex Mono',monospace;font-size:8.5px;font-weight:700;letter-spacing:.12em;color:#0ea5e9;text-transform:uppercase;border-bottom:2px solid #0ea5e940">Hours</th>
            <th style="padding:10px 12px;text-align:center;font-family:'IBM Plex Mono',monospace;font-size:8.5px;font-weight:700;letter-spacing:.12em;color:#0ea5e9;text-transform:uppercase;border-bottom:2px solid #0ea5e940">Share</th>
            <th style="padding:10px 12px;text-align:center;font-family:'IBM Plex Mono',monospace;font-size:8.5px;font-weight:700;letter-spacing:.12em;color:#0ea5e9;text-transform:uppercase;border-bottom:2px solid #0ea5e940">Billable</th>
            <th style="padding:10px 12px;text-align:center;font-family:'IBM Plex Mono',monospace;font-size:8.5px;font-weight:700;letter-spacing:.12em;color:#0ea5e9;text-transform:uppercase;border-bottom:2px solid #0ea5e940">Engs</th>
            <th style="padding:10px 12px;text-align:center;font-family:'IBM Plex Mono',monospace;font-size:8.5px;font-weight:700;letter-spacing:.12em;color:#0ea5e9;text-transform:uppercase;border-bottom:2px solid #0ea5e940">Status</th>
          </tr>
        </thead>
        <tbody>${coverSummaryRows}</tbody>
      </table>

      <!-- Bottom branding line -->
      <div style="margin-top:28px;padding-top:14px;border-top:1px solid #0d1e30;display:flex;align-items:center;justify-content:space-between">
        <div style="display:flex;align-items:center;gap:8px">
          <img src="${LOGO_SRC}" style="width:20px;height:20px;border-radius:4px;object-fit:contain;opacity:.5"/>
          <span style="font-size:10px;color:#1e3a52;font-family:'IBM Plex Mono',monospace">ENEVO Group EC-ERP · Confidential</span>
        </div>
        <span style="font-size:10px;color:#1e3a52;font-family:'IBM Plex Mono',monospace">${now}</span>
      </div>
    </div>
  </div>`;

  const projectPages=projList.map((pm,i)=>buildProjectBlock(pm,i)).join("");

  const html=`<!DOCTYPE html><html><head><meta charset="utf-8">
    <title>All Projects Report — ${periodLabel||"All Time"}</title>
    <style>${PDF_STYLE}</style>
  </head><body>
    ${pdfHeader("Project Tasks Analysis · All Projects", periodLabel||"All Time", now)}
    ${pdfFooter("All Projects Report", now)}
    ${coverHTML}
    ${projectPages}
    <script>window.onload=()=>window.print()<\/script>
  </body></html>`;

  const win=window.open("","pdf_"+Date.now()+"_"+Math.random().toString(36).slice(2));
  if(win){win.document.write(html);win.document.close();win.focus();setTimeout(()=>win.print(),600);}
  else{alert("Please allow popups for this site to export PDFs.");}
}

/* ── ProjectTasksReport Component ── */
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
          <h2 style={{fontSize:18,fontWeight:700,color:"var(--text0)",margin:0}}>◈ Project Tasks Analysis</h2>
          <p style={{fontSize:14,color:"var(--text4)",marginTop:4}}>
            {filterMonth==="ALL"?"All Time":filterMonth} · {projList.length} projects · {grandTotal}h total
          </p>
        </div>
        <div style={{display:"flex",gap:8,alignItems:"center",flexWrap:"wrap",justifyContent:"flex-end"}}>
          {/* Month filter */}
          <select value={filterMonth} onChange={e=>{setFilterMonth(e.target.value);setSelProj("ALL");}}
            style={{background:"var(--bg1)",border:"1px solid #38bdf840",borderRadius:6,padding:"6px 10px",color:"var(--info)",fontSize:14,fontFamily:"'IBM Plex Sans',sans-serif",fontWeight:600}}>
            <option value="ALL">📅 All Time</option>
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
                ⬇ Export All ({projList.length})
              </button>
            : <button className="bp" onClick={()=>{
                const label=filterMonth==="ALL"?"All Time":filterMonth;
                const [fy,fm]=filterMonth!=="ALL"?filterMonth.split("-").map(Number):[null,null];
                const pm=displayList[0];
                if(pm) buildProjectTasksPDF(pm,grandTotal,fm?fm-1:null,fy,MONTHS,fmtCurrency,isAdmin,isAcct,label);
              }}>
                ⬇ Export PDF
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
              <div style={{fontSize:11,color:"var(--text4)",fontWeight:700,textTransform:"uppercase",letterSpacing:".06em"}}>{m.l}</div>
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
                style={{width:`${pct}%`,background:PROJ_COLORS[i%PROJ_COLORS.length],display:"flex",alignItems:"center",justifyContent:"center",fontSize:11,fontWeight:700,color:"#fff",overflow:"hidden",whiteSpace:"nowrap",padding:"0 4px"}}>
                {pct>4?pm.proj.id:""}
              </div>;
            })}
          </div>
          <div style={{display:"flex",flexWrap:"wrap",gap:8}}>
            {projList.map((pm,i)=>{
              const pct=grandTotal?Math.round(pm.totalHrs/grandTotal*100):0;
              return<div key={pm.proj.id} style={{display:"flex",alignItems:"center",gap:5,fontSize:12}}>
                <div style={{width:8,height:8,borderRadius:2,background:PROJ_COLORS[i%PROJ_COLORS.length],flexShrink:0}}/>
                <span style={{color:"var(--text0)",fontWeight:600}}>{pm.proj.name||pm.proj.id}</span> <span style={{fontFamily:"'IBM Plex Mono',monospace",fontSize:11,color:"var(--info)"}}>{pm.proj.id}</span>
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
                  <span style={{fontWeight:700,color:"var(--text0)"}}>{pm.proj.name||pm.proj.id}</span> <span style={{fontFamily:"'IBM Plex Mono',monospace",fontSize:11,color:"var(--info)"}}>{pm.proj.id}</span>
                  <span style={{fontSize:11,padding:"2px 6px",borderRadius:3,background:pm.proj.status==="Active"?"#024b36":"var(--border)",color:pm.proj.status==="Active"?"#34d399":"var(--text2)"}}>{pm.proj.status}</span>
                  {pm.proj.billable&&<span style={{fontSize:11,padding:"2px 6px",borderRadius:3,background:"var(--bg3)",color:"var(--info)"}}>BILLABLE</span>}
                </div>
                <div style={{fontSize:17,fontWeight:700,color:"var(--text0)"}}>{pm.proj.name}</div>
                {pm.proj.pm&&<div style={{fontSize:13,color:"var(--text3)",marginTop:1}}>PM: <span style={{color:"#a78bfa",fontWeight:600}}>{pm.proj.pm}</span></div>}
                {pm.proj.client&&<div style={{fontSize:13,color:"var(--text4)",marginTop:2}}>Client: {pm.proj.client} · Phase: {pm.proj.phase||"—"}</div>}
              </div>
              <div style={{textAlign:"right",display:"flex",flexDirection:"column",alignItems:"flex-end",gap:6}}>
                <button className="bp" style={{fontSize:12,padding:"5px 10px"}}
                  onClick={()=>{const label=filterMonth==="ALL"?"All Time":filterMonth;const [fy,fm]=filterMonth!=="ALL"?filterMonth.split("-").map(Number):[null,null];buildProjectTasksPDF(pm,grandTotal,fm?fm-1:null,fy,MONTHS,fmtCurrency,isAdmin,isAcct,label);}}>
                  ⬇ PDF
                </button>
                <div style={{fontFamily:"'IBM Plex Mono',monospace",fontSize:26,fontWeight:700,color:"var(--info)",lineHeight:1}}>{pm.totalHrs}h</div>
                <div style={{fontSize:12,color:"var(--text4)"}}>{pct}% of month total</div>
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
                  <div style={{fontSize:11,color:"var(--text4)",fontWeight:700,textTransform:"uppercase",letterSpacing:".05em"}}>{s.l}</div>
                  <div style={{fontFamily:"'IBM Plex Mono',monospace",fontSize:16,fontWeight:700,color:s.c,marginTop:4}}>{s.v}</div>
                </div>
              ))}
            </div>

            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12}}>
              {/* Task breakdown */}
              <div>
                <div style={{fontSize:12,fontWeight:700,color:"var(--text3)",textTransform:"uppercase",letterSpacing:".06em",marginBottom:8}}>Task Breakdown</div>
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
                        <div style={{display:"flex",gap:10,fontSize:12}}>
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
                <div style={{fontSize:12,fontWeight:700,color:"var(--text3)",textTransform:"uppercase",letterSpacing:".06em",marginBottom:8}}>Engineer Contribution</div>
                {engList.map(eng=>{
                  const epct=pm.totalHrs?Math.round(eng.hrs/pm.totalHrs*100):0;
                  const topEngTask=Object.entries(eng.tasks).sort((a,b)=>b[1]-a[1])[0];
                  return(
                    <div key={eng.name} style={{marginBottom:7}}>
                      <div style={{display:"flex",justifyContent:"space-between",marginBottom:2}}>
                        <div style={{display:"flex",alignItems:"center",gap:6}}>
                          <div className="av" style={{width:20,height:20,fontSize:10,flexShrink:0}}>{eng.name.slice(0,2).toUpperCase()}</div>
                          <span style={{fontSize:13,color:"var(--text1)"}}>{eng.name}</span>
                        </div>
                        <div style={{display:"flex",gap:10,fontSize:12}}>
                          <span style={{fontFamily:"'IBM Plex Mono',monospace",color:"var(--info)",fontWeight:700}}>{eng.hrs}h</span>
                          <span style={{color:"var(--text4)"}}>{epct}%</span>
                        </div>
                      </div>
                      <div style={{background:"var(--bg3)",height:5,borderRadius:3,overflow:"hidden"}}>
                        <div style={{height:"100%",width:`${epct}%`,background:"linear-gradient(90deg,#0ea5e9,#38bdf8)",borderRadius:3}}/>
                      </div>
                      {topEngTask&&<div style={{fontSize:11,color:"var(--text4)",marginTop:1}}>Top: {topEngTask[0]} ({topEngTask[1]}h)</div>}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Billability bar */}
            {pm.proj.billable&&(
              <div style={{marginTop:12,paddingTop:10,borderTop:"1px solid #0d1a2d"}}>
                <div style={{display:"flex",justifyContent:"space-between",marginBottom:4,fontSize:12}}>
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

/* ── VacationReport Component ── */
function VacationReport({engineers,leaveEntries,allEntries,month,year,MONTHS,onExport}){
  const leaveTypes=["Annual Leave","Sick Leave","Public Holiday","Business Travel","Training External","Unpaid Leave"];
  const typeColors={"Annual Leave":"var(--info)","Sick Leave":"#f87171","Public Holiday":"#fb923c","Business Travel":"#a78bfa","Training External":"#34d399","Unpaid Leave":"#6b7280"};

  // Monthly breakdown
  const monthly=engineers.map(eng=>{
    const el=leaveEntries.filter(e=>String(e.engineer_id)===String(eng.id));
    const byType={};
    el.forEach(e=>{const lt=e.leave_type||"Annual Leave";byType[lt]=(byType[lt]||0)+1;});
    return{...eng,total:el.length,byType,days:el.sort((a,b)=>a.date.localeCompare(b.date))};
  }).filter(e=>e.total>0);

  // Year-to-date
  const ytd=engineers.map(eng=>{
    const el=allEntries.filter(e=>String(e.engineer_id)===String(eng.id)&&e.entry_type==="leave"&&new Date(e.date).getFullYear()===year);
    const byType={};
    el.forEach(e=>{const lt=e.leave_type||"Annual Leave";byType[lt]=(byType[lt]||0)+1;});
    return{...eng,total:el.length,byType};
  }).filter(e=>e.total>0);

  return(
    <div>
      {/* Header */}
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:18}}>
        <div>
          <h2 style={{fontSize:18,fontWeight:700,color:"var(--text0)",margin:0}}>✈ Vacation & Leave Report</h2>
          <p style={{fontSize:14,color:"var(--text4)",marginTop:4}}>{MONTHS[month]} {year} · {monthly.length} engineers with leave recorded</p>
        </div>
        <button style={{background:"#0ea5e9",border:"none",borderRadius:6,padding:"8px 16px",color:"#fff",fontSize:14,fontWeight:600,cursor:"pointer",fontFamily:"'IBM Plex Sans',sans-serif"}} onClick={onExport}>⬇ Export PDF</button>
      </div>

      {/* Leave type legend */}
      <div style={{display:"flex",gap:8,flexWrap:"wrap",marginBottom:16}}>
        {leaveTypes.map(lt=>(
          <span key={lt} style={{fontSize:12,padding:"3px 10px",borderRadius:12,border:`1px solid ${typeColors[lt]}50`,color:typeColors[lt],fontWeight:600,background:typeColors[lt]+"15"}}>{lt}</span>
        ))}
      </div>

      {/* Monthly summary */}
      <div className="card" style={{marginBottom:14,overflowX:"auto"}}>
        <h4 style={{fontSize:14,fontWeight:600,color:"var(--text2)",marginBottom:12}}>📅 {MONTHS[month]} {year} — Monthly Summary</h4>
        {monthly.length===0
          ? <p style={{color:"var(--text4)",fontSize:14,textAlign:"center",padding:20}}>No leave recorded for {MONTHS[month]} {year}. Import timesheets first.</p>
          : <table style={{minWidth:600}}>
              <thead><tr>
                <th style={{textAlign:"left"}}>Engineer</th>
                {leaveTypes.map(lt=><th key={lt} style={{textAlign:"center",color:typeColors[lt],fontSize:12,minWidth:60}}>{lt}</th>)}
                <th style={{textAlign:"center"}}>Total</th>
              </tr></thead>
              <tbody>{monthly.map(eng=>(
                <tr key={eng.id}>
                  <td>
                    <div style={{display:"flex",alignItems:"center",gap:8}}>
                      <div style={{width:28,height:28,borderRadius:"50%",background:"var(--bg3)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:11,fontWeight:700,color:"var(--info)",flexShrink:0}}>{(eng.name||"?").slice(0,2).toUpperCase()}</div>
                      <div>
                        <div style={{fontSize:14,fontWeight:600}}>{eng.name}</div>
                        <div style={{fontSize:12,color:"var(--text4)"}}>{eng.role}</div>
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
        <h4 style={{fontSize:14,fontWeight:600,color:"var(--text2)",marginBottom:12}}>📊 Year-to-Date {year} — All Leave</h4>
        {ytd.length===0
          ? <p style={{color:"var(--text4)",fontSize:14,textAlign:"center",padding:20}}>No leave recorded for {year}.</p>
          : <table style={{minWidth:600}}>
              <thead><tr>
                <th style={{textAlign:"left"}}>Engineer</th>
                {leaveTypes.map(lt=><th key={lt} style={{textAlign:"center",color:typeColors[lt],fontSize:12,minWidth:60}}>{lt}</th>)}
                <th style={{textAlign:"center"}}>YTD Total</th>
              </tr></thead>
              <tbody>{ytd.map(eng=>(
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

      {/* Per-engineer day detail */}
      {monthly.length>0&&<div>
        <h4 style={{fontSize:14,fontWeight:600,color:"var(--text2)",marginBottom:10}}>📋 Detail — Leave Days {MONTHS[month]} {year}</h4>
        {monthly.map(eng=>(
          <div key={eng.id} className="card" style={{marginBottom:8}}>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:8}}>
              <div style={{display:"flex",alignItems:"center",gap:10}}>
                <div style={{width:32,height:32,borderRadius:"50%",background:"var(--bg3)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:12,fontWeight:700,color:"var(--info)"}}>{(eng.name||"?").slice(0,2).toUpperCase()}</div>
                <div>
                  <div style={{fontSize:15,fontWeight:600}}>{eng.name}</div>
                  <div style={{fontSize:12,color:"var(--text4)"}}>{eng.total} day{eng.total!==1?"s":""} of leave</div>
                </div>
              </div>
              <div style={{display:"flex",gap:6,flexWrap:"wrap",justifyContent:"flex-end"}}>
                {Object.entries(eng.byType).map(([lt,n])=>(
                  <span key={lt} style={{fontSize:12,padding:"2px 8px",borderRadius:3,background:typeColors[lt]+"25",color:typeColors[lt],fontWeight:600}}>{lt}: {n}d</span>
                ))}
              </div>
            </div>
            <div style={{display:"flex",flexWrap:"wrap",gap:5}}>
              {eng.days.map(e=>(
                <span key={e.id} style={{fontSize:12,padding:"3px 9px",borderRadius:4,background:"var(--bg2)",border:`1px solid ${typeColors[e.leave_type||"Annual Leave"]}40`,color:typeColors[e.leave_type||"Annual Leave"],fontFamily:"'IBM Plex Mono',monospace"}}>
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



/* ════════════════════════════════════════════════════════
   PROJECT ACTIVITY TAXONOMY
   ════════════════════════════════════════════════════════ */
const ACTIVITY_TAXONOMY = {
  /* ── SCADA ── */
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
  /* ── RTU-PLC ── */
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
    "PLC Control Logic — Inverter","PLC Control Logic — Transformer",
    "PLC Control Logic — Generator","PLC Control Logic — Feeder",
    "PLC Control Logic — BESS","PLC Control Logic — Weather Station",
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
  /* ── Protection ── */
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
  /* ── General ── */
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

/* ── Category Groups ── */
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

/* ════════════════════════════════════════════════════════
   PROJECT TRACKER — standalone component (no IIFE, no re-render loops)
   ════════════════════════════════════════════════════════ */
const STATUS_COLOR={"Completed":"#34d399","In Progress":"var(--info)","Not Started":"var(--text3)","On Hold":"#fb923c"};
const STATUS_BG={"Completed":"#14532d30","In Progress":"#0ea5e920","Not Started":"#1e293b40","On Hold":"#78350f30"};

/* ── Inline category/activity editor modal ── */
function ActivityEditModal({act, onSave, onClose, engineers}){
  // Derive the correct group: prefer act.group_name (stored group), fall back to CAT_TO_GROUP[category]
  const initGroup = act.group_name && TAXONOMY_GROUP_NAMES.includes(act.group_name)
    ? act.group_name
    : (CAT_TO_GROUP[act.category]||TAXONOMY_GROUP_NAMES[0]);
  // Derive the correct category: prefer act.category if it's a known category, else use group's first cat
  const initCat = act.category && TAXONOMY_GROUPS[initGroup]?.includes(act.category)
    ? act.category
    : (TAXONOMY_GROUPS[initGroup]?.[0]||act.category||"");
  const [draft, setDraft] = useState({...act, category: initCat});
  const [group, setGroup] = useState(initGroup);
  const [customName, setCustomName] = useState(""); // separate state so typing doesn't close the input
  const isCustom = draft.activity_name==="Custom…";
  const catActs = ACTIVITY_TAXONOMY[draft.category]||[];
  const INP = {width:"100%",background:"var(--bg2)",border:"1px solid var(--border3)",borderRadius:4,color:"var(--text0)",padding:"6px 8px",fontSize:13,boxSizing:"border-box"};
  const LBL = {fontSize:12,color:"var(--text2)",fontWeight:600,display:"block",marginBottom:4};
  const GROUP_COLORS = {"SCADA":"var(--info)","RTU-PLC":"#a78bfa","Protection":"#f87171","General":"#34d399"};

  const handleGroupChange = g => {
    setGroup(g);
    const firstCat = TAXONOMY_GROUPS[g][0];
    setDraft(p=>({...p, category:firstCat, activity_name:ACTIVITY_TAXONOMY[firstCat]?.[0]||p.activity_name}));
  };

  return(
  <div className="modal-ov" onClick={onClose}>
    <div className="modal" style={{maxWidth:500}} onClick={e=>e.stopPropagation()}>
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
            <select value={catActs.includes(draft.activity_name)?draft.activity_name:"Custom…"}
              onChange={e=>setDraft(p=>({...p,activity_name:e.target.value}))} style={INP}>
              {catActs.map(a=><option key={a}>{a}</option>)}
              <option value="Custom…">Custom…</option>
            </select>
            {/* Show custom input if activity_name is not in the taxonomy list */}
            {!catActs.includes(draft.activity_name)&&(
              <input autoFocus={isCustom} value={isCustom?customName:draft.activity_name}
                onChange={e=>{
                  if(isCustom) setCustomName(e.target.value);
                  else setDraft(p=>({...p,activity_name:e.target.value}));
                }}
                placeholder="Type activity name…"
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
              style={{...INP,colorScheme:"dark"}}/>
          </div>
          <div>
            <label style={LBL}>END DATE <span style={{color:"var(--text3)",fontWeight:400}}>(deadline)</span></label>
            <input type="date" value={draft.end_date||""} onChange={e=>setDraft(p=>({...p,end_date:e.target.value||null}))}
              style={{...INP,colorScheme:"dark",color:draft.end_date&&new Date(draft.end_date)<new Date()&&draft.status!=="Completed"?"#f87171":"var(--text0)"}}/>
          </div>
        </div>

        {/* Assigned to */}
        <div>
          <label style={LBL}>ASSIGNED TO</label>
          {engineers&&engineers.length>0?(
            <select value={draft.assigned_to||""} onChange={e=>setDraft(p=>({...p,assigned_to:e.target.value}))} style={INP}>
              <option value="">— Unassigned —</option>
              {engineers.filter(e=>e.role_type!=="accountant").map(e=><option key={e.id} value={e.name}>{e.name} — {e.role}</option>)}
            </select>
          ):(
            <input value={draft.assigned_to||""} onChange={e=>setDraft(p=>({...p,assigned_to:e.target.value}))}
              placeholder="Engineer name…" style={INP}/>
          )}
        </div>

        {/* Remarks */}
        <div>
          <label style={LBL}>REMARKS / BLOCKERS</label>
          <textarea value={draft.remarks||""} onChange={e=>setDraft(p=>({...p,remarks:e.target.value}))} rows={2}
            placeholder="e.g. Waiting for IOA addresses…"
            style={{...INP,color:"var(--text2)",resize:"vertical"}}/>
        </div>
      </div>
      <div style={{display:"flex",gap:10,marginTop:16,justifyContent:"flex-end"}}>
        <button className="bg" onClick={onClose}>Cancel</button>
        <button className="bp" onClick={()=>{
          // Resolve final activity name: custom input takes priority when "Custom…" is selected
          const finalName = isCustom&&customName.trim()
            ? customName.trim()
            : draft.activity_name==="Custom…" ? "" : draft.activity_name;
          if(!finalName) return;
          onSave({...draft, activity_name: finalName});
        }}>Save Activity</button>
      </div>
    </div>
  </div>);
}

/* ── Add Activity modal ── */
/* ── Add Activity modal ── */
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
  const finalName = actName==="Custom…" ? custom : actName;

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
  const LBL = {fontSize:12,color:"var(--text2)",fontWeight:600,display:"block",marginBottom:4};
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
              <option value="Custom…">Custom…</option>
            </select>
          ):(
            <input value={actName} onChange={e=>setActName(e.target.value)} placeholder="Activity name…" style={INP}/>
          )}
          {actName==="Custom…"&&(
            <input value={custom} onChange={e=>setCustom(e.target.value)} placeholder="Type custom activity name…"
              style={{...INP,marginTop:6,border:"1px solid #38bdf8"}}/>
          )}
        </div>

        {/* Dates */}
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}>
          <div>
            <label style={LBL}>START DATE</label>
            <input type="date" value={startDate} onChange={e=>setStartDate(e.target.value)}
              style={{...INP,colorScheme:"dark"}}/>
          </div>
          <div>
            <label style={LBL}>END DATE <span style={{color:"var(--text3)",fontWeight:400}}>(deadline)</span></label>
            <input type="date" value={endDate} onChange={e=>setEndDate(e.target.value)}
              style={{...INP,colorScheme:"dark"}}/>
          </div>
        </div>

        {/* Assigned to */}
        {engineers&&engineers.length>0&&(
        <div>
          <label style={LBL}>ASSIGNED TO <span style={{color:"var(--text3)",fontWeight:400}}>(optional)</span></label>
          <select value={assignedTo} onChange={e=>setAssignedTo(e.target.value)} style={INP}>
            <option value="">— Unassigned —</option>
            {engineers.filter(e=>e.role_type!=="accountant").map(e=><option key={e.id} value={e.name}>{e.name} — {e.role}</option>)}
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
function EditProjActivities({projId, activities, setActivities, engineers, isEngActive, supabase, showToast, projects, setProjects}){
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
    setAddModal(false);
    if(showToast)showToast("Activity added ✓");
  };

  const saveAct = async(draft)=>{
    const{id,...fields}=draft;
    const grp = CAT_TO_GROUP[fields.category]||fields.group_name||"General";
    const payload={...fields,group_name:grp,category:fields.category||null};
    const{data,error}=await supabase.from("project_activities").update(payload).eq("id",id).select().single();
    if(error){if(showToast)showToast("Error: "+error.message,false);return;}
    if(setActivities)setActivities(prev=>prev.map(a=>a.id===data.id?data:a));
    await autoAssignEngineer(fields.assigned_to);
    setEditAct(null);
    if(showToast)showToast("Activity saved ✓");
  };
  const delAct = async(id)=>{
    if(!window.confirm("Delete this activity?"))return;
    await supabase.from("project_activities").delete().eq("id",id);
    if(setActivities)setActivities(prev=>prev.filter(a=>a.id!==id));
    if(showToast)showToast("Activity deleted");
  };

  const GROUP_COLORS={"SCADA":"var(--info)","RTU-PLC":"#a78bfa","Protection":"#f87171","General":"#34d399"};
  const STATUS_STYLE={"Completed":{bg:"var(--bg3)",color:"#34d399"},"In Progress":{bg:"var(--bg3)",color:"var(--info)"},"On Hold":{bg:"#1a0f00",color:"#fb923c"},"Not Started":{bg:"var(--bg3)",color:"var(--text3)"}};

  return(
    <div>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:10}}>
        <span style={{fontSize:13,color:"var(--text3)"}}>{projActs.length} activit{projActs.length===1?"y":"ies"} for {projId}</span>
        <button className="bp" style={{fontSize:12,padding:"4px 12px"}} onClick={()=>setAddModal(true)}>+ Add Activity</button>
      </div>
      {projActs.length===0&&(
        <div style={{textAlign:"center",padding:"28px 0",color:"var(--border)",fontSize:13,border:"1px dashed #0f1e2e",borderRadius:6}}>
          No activities yet — add the first one above.
        </div>
      )}
      <div style={{display:"grid",gap:5,maxHeight:320,overflowY:"auto"}}>
        {projActs.map(a=>{
          const ss=STATUS_STYLE[a.status]||STATUS_STYLE["Not Started"];
          const gc=GROUP_COLORS[a.group_name]||"var(--text3)";
          const pct=Math.round((a.progress||0)*100);
          return(
          <div key={a.id} style={{background:"var(--bg2)",border:"1px solid #0f1e2e",borderRadius:6,padding:"8px 12px"}}>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",gap:8}}>
              <div style={{flex:1,minWidth:0}}>
                <div style={{fontSize:14,fontWeight:600,color:"var(--text0)",marginBottom:4}}>{a.activity_name}</div>
                <div style={{display:"flex",flexWrap:"wrap",gap:5,alignItems:"center"}}>
                  <span style={{fontSize:11,padding:"1px 6px",borderRadius:3,background:gc+"20",color:gc}}>{a.group_name}</span>
                  {a.category&&a.category!==a.group_name&&<span style={{fontSize:11,color:"var(--text3)"}}>{a.category}</span>}
                  <span style={{fontSize:11,padding:"1px 6px",borderRadius:3,background:ss.bg,color:ss.color}}>{a.status}</span>
                  {a.assigned_to&&<span style={{fontSize:11,color:"var(--text2)"}}>👤 {a.assigned_to}</span>}
                </div>
                {pct>0&&<div style={{marginTop:6,background:"var(--bg3)",borderRadius:3,height:4,overflow:"hidden"}}>
                  <div style={{height:"100%",width:pct+"%",background:pct===100?"#34d399":"var(--info)",borderRadius:3}}/>
                </div>}
              </div>
              <div style={{display:"flex",gap:4,flexShrink:0}}>
                <button className="be" style={{fontSize:11,padding:"3px 7px"}} onClick={()=>setEditAct({...a})}>✎</button>
                <button className="bd" style={{fontSize:11,padding:"3px 7px"}} onClick={()=>delAct(a.id)}>✕</button>
              </div>
            </div>
          </div>);
        })}
      </div>
      {/* Shared modals — same as Tracker */}
      {addModal&&<AddActivityModal projId={projId} subId={null} defaultCat={null}
        onSave={confirmAdd} onClose={()=>setAddModal(false)} engineers={engineers}/>}
      {editAct&&<ActivityEditModal act={editAct}
        onSave={saveAct} onClose={()=>setEditAct(null)} engineers={engineers}/>}
    </div>
  );
}


/* ── Single activity row ── */
function ActivityRow({a, actHrs, isAdmin, onEdit, onDelete}){
  const pct      = Math.round(a.progress*100);
  const sc       = STATUS_COLOR[a.status]||"var(--text3)";
  const today    = new Date(); today.setHours(0,0,0,0);
  const endDt    = a.end_date ? new Date(a.end_date) : null;
  const isOverdue= endDt && endDt < today && a.status!=="Completed";
  const fmtDate  = d => d ? new Date(d).toLocaleDateString("en-GB",{day:"2-digit",month:"short"}) : null;
  return(
  <tr style={{cursor:"pointer"}} onClick={()=>onEdit(a)}>
    <td style={{maxWidth:200}}>
      <div style={{fontWeight:600,fontSize:13}}>{a.activity_name}</div>
      {a.remarks&&<div style={{fontSize:11,color:"#f87171",fontStyle:"italic",marginTop:1,maxWidth:190,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{a.remarks}</div>}
    </td>
    <td><span style={{fontSize:11,padding:"2px 7px",borderRadius:3,background:STATUS_BG[a.status]||"var(--bg3)",color:sc,fontWeight:700,whiteSpace:"nowrap"}}>{a.status}</span></td>
    <td>
      <div style={{display:"flex",alignItems:"center",gap:7}}>
        <div style={{width:52,height:5,background:"var(--bg1)",borderRadius:3,overflow:"hidden",flexShrink:0}}>
          <div style={{height:"100%",width:`${pct}%`,background:sc,borderRadius:3}}/>
        </div>
        <span style={{fontFamily:"'IBM Plex Mono',monospace",fontSize:12,fontWeight:700,color:sc}}>{pct}%</span>
      </div>
    </td>
    <td style={{fontSize:12,color:"var(--text2)",whiteSpace:"nowrap"}}>{a.assigned_to||"—"}</td>
    <td style={{fontSize:11,whiteSpace:"nowrap"}}>
      {(a.start_date||a.end_date)?(
        <div style={{display:"flex",flexDirection:"column",gap:1}}>
          {a.start_date&&<span style={{color:"var(--text3)"}}>▶ {fmtDate(a.start_date)}</span>}
          {a.end_date&&<span style={{color:isOverdue?"#f87171":"#fb923c",fontWeight:isOverdue?700:400}}>
            {isOverdue?"⚠ ":"■ "}{fmtDate(a.end_date)}
          </span>}
        </div>
      ):<span style={{color:"var(--text4)"}}>—</span>}
    </td>
    <td style={{fontFamily:"'IBM Plex Mono',monospace",fontSize:12,color:actHrs>0?"var(--info)":"var(--text4)"}}>{actHrs>0?actHrs+"h":"—"}</td>
    {isAdmin&&<td onClick={e=>e.stopPropagation()}><button className="bd" style={{fontSize:12,padding:"1px 5px"}} onClick={()=>onDelete(a.id)}>✕</button></td>}
  </tr>);
}

/* ════════════════════════════════════════════════════════
   PROJECT TRACKER — standalone component
   ════════════════════════════════════════════════════════ */
function ProjectTracker({projects, activities, subprojects, entries, engineers, isAdmin, isLead, isAcct, activitiesLoaded, setActivities, setProjects, showToast, logAction}){
  const canEdit = isAdmin || isLead;
  const [trackerProj,  setTrackerProj]  = useState(null);
  const [trackerSub,   setTrackerSub]   = useState(null);
  const [editActivity, setEditActivity] = useState(null);  // activity being edited (modal)
  const [addModal,     setAddModal]     = useState(null);  // {projId, subId} for add modal
  const [trackerSearch_, setTrackerSearch_] = useState("");
  const [trackerStatusF, setTrackerStatusF] = useState("ALL");
  const [expandedCats, setExpandedCats] = useState({});    // {catName: bool}

  // ── Memoised lookups ──
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

  // ── Callbacks ──
  const saveActivity = useCallback(async(draft)=>{
    const {id,...fields}=draft;
    // group_name = parent group (SCADA/RTU-PLC/...), category = sub-category (Displays/Templates/...)
    const grp = CAT_TO_GROUP[fields.category]||fields.group_name||"SCADA";
    const payload={...fields, group_name:grp, category:fields.category||null, updated_at:new Date().toISOString()};
    const {data,error}=await supabase.from("project_activities").update(payload).eq("id",id).select().single();
    if(error){showToast("Error: "+error.message,false);return;}
    setActivities(prev=>prev.map(a=>a.id===data.id?data:a));
    setEditActivity(null);
    logAction("UPDATE","Tracker",`Updated activity: ${fields.activity_name} on ${fields.project_id}`,{id,project_id:fields.project_id,activity:fields.activity_name,status:fields.status,progress:fields.progress});
    showToast("Activity saved ✓");
  },[setActivities,showToast,logAction]);

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
          showToast(`${assigned_to} added to ${projId} team ✓`);
        }
      }
    }
    setAddModal(null);
    showToast("Activity added ✓");
    if(category) setExpandedCats(p=>({...p,[category]:true}));
  },[addModal,actsByProj,setActivities,showToast,logAction,engineers,projects,setProjects]);

  const deleteActivity = useCallback(async(id)=>{
    if(!window.confirm("Delete this activity?")) return;
    const act=activities.find(a=>a.id===id);
    await supabase.from("project_activities").delete().eq("id",id);
    setActivities(prev=>prev.filter(a=>a.id!==id));
    logAction("DELETE","Tracker",`Deleted activity: ${act?.activity_name||id} on ${act?.project_id||""}`,{id,project_id:act?.project_id,activity:act?.activity_name});
  },[setActivities,activities,logAction]);

  // ── Loading ──
  if(!activitiesLoaded) return(
    <div style={{padding:32,textAlign:"center",color:"var(--text4)",fontSize:15}}>Loading project tracker…</div>
  );

  // ── OVERVIEW ──
  if(!trackerProj){
    const baseProjects=(canEdit||isAcct)
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
      <div style={{display:"flex",gap:8,alignItems:"center",flexWrap:"wrap",justifyContent:"space-between"}}>
        <div style={{display:"flex",gap:8,alignItems:"center"}}>
          <span style={{fontSize:15,fontWeight:700,color:"var(--text0)"}}>Project Tracker</span>
          <span style={{fontSize:13,color:"var(--text4)"}}>{allTrackerProjects.length} projects · {activities.length} activities</span>
        </div>
        <div style={{display:"flex",gap:8}}>
          <input value={trackerSearch_} onChange={e=>setTrackerSearch_(e.target.value)}
            placeholder="🔍 Search projects…"
            style={{background:"var(--bg2)",border:"1px solid var(--border3)",borderRadius:6,padding:"6px 10px",color:"var(--text0)",fontSize:13,width:190}}/>
          <select value={trackerStatusF} onChange={e=>setTrackerStatusF(e.target.value)}
            style={{background:"var(--bg2)",border:"1px solid var(--border3)",borderRadius:6,padding:"6px 10px",color:"var(--text0)",fontSize:13}}>
            <option value="ALL">All Statuses</option>
            <option value="Active">Active</option>
            <option value="On Hold">On Hold</option>
            <option value="Completed">Completed</option>
          </select>
        </div>
      </div>
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
            style={{background:"var(--bg2)",border:"1px solid var(--border3)",borderRadius:10,padding:"14px 16px",cursor:"pointer"}}
            onMouseEnter={e=>e.currentTarget.style.borderColor="var(--info)"}
            onMouseLeave={e=>e.currentTarget.style.borderColor="var(--border)"}>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:8}}>
              <div>
                <div style={{fontSize:14,fontWeight:700,color:"var(--text0)"}}>{p.name||p.id}</div>
                <div style={{fontSize:12,color:"var(--text4)",fontFamily:"'IBM Plex Mono',monospace"}}>{p.id}</div>
                {p.pm&&<div style={{fontSize:11,color:"#a78bfa",marginTop:2}}>PM: <span style={{fontWeight:600}}>{p.pm}</span></div>}
              </div>
              <div style={{textAlign:"right"}}>
                <div style={{fontFamily:"'IBM Plex Mono',monospace",fontSize:18,fontWeight:700,color:barColor}}>{overallPct}%</div>
                <div style={{fontSize:11,color:"var(--text4)"}}>{totalHrs}h logged</div>
              </div>
            </div>
            <div style={{background:"var(--bg1)",borderRadius:4,height:6,overflow:"hidden",marginBottom:8}}>
              <div style={{height:"100%",width:`${overallPct}%`,background:barColor,borderRadius:4}}/>
            </div>
            <div style={{display:"flex",gap:6,flexWrap:"wrap"}}>
              {done>0&&<span style={{fontSize:11,padding:"2px 6px",borderRadius:3,background:"var(--bg3)",color:"#34d399",fontWeight:700}}>{done} Done</span>}
              {active>0&&<span style={{fontSize:11,padding:"2px 6px",borderRadius:3,background:"var(--bg3)",color:"var(--info)",fontWeight:700}}>{active} Active</span>}
              {pending>0&&<span style={{fontSize:11,padding:"2px 6px",borderRadius:3,background:"var(--bg3)",color:"var(--text3)",fontWeight:700}}>{pending} Pending</span>}
              {hasSubs&&<span style={{fontSize:11,padding:"2px 6px",borderRadius:3,background:"var(--bg3)",color:"#a78bfa",fontWeight:700}}>{subprojects.filter(s=>s.project_id===p.id).length} sub-sites</span>}
              {projActs.length===0&&canEdit&&(
                <span style={{fontSize:11,padding:"2px 8px",borderRadius:3,background:"var(--bg3)",color:"var(--info)",border:"1px dashed #192d47",cursor:"pointer"}}
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

  // ── PROJECT DETAIL ──
  const selProj=projects.find(p=>p.id===trackerProj);
  if(!selProj) return null;
  const projSubs=subprojects.filter(s=>s.project_id===trackerProj);
  const hasSubs=projSubs.length>0;
  const projActs=actsByProj[trackerProj]||[];
  const visActs=trackerSub
    ? projActs.filter(a=>String(a.subproject_id)===String(trackerSub))
    : projActs;

  // Group by category — ordered by TAXONOMY_GROUPS definition so SCADA categories stay together
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
      <button className="bg" style={{fontSize:13}} onClick={()=>{setTrackerProj(null);setTrackerSub(null);setExpandedCats({});}}>← All Projects</button>
      <span style={{color:"var(--text4)"}}>/</span>
      <span style={{fontSize:15,fontWeight:700,color:"var(--text0)"}}>{selProj.name||trackerProj}</span>
      <span style={{fontFamily:"'IBM Plex Mono',monospace",fontSize:12,color:"var(--info)"}}>{trackerProj}</span>
      {hasSubs&&trackerSub&&(
        <><span style={{color:"var(--text4)"}}>/</span>
        <span style={{fontSize:14,color:"#a78bfa"}}>{projSubs.find(s=>String(s.id)===String(trackerSub))?.name}</span>
        <button className="bg" style={{fontSize:12}} onClick={()=>setTrackerSub(null)}>All Sites</button></>
      )}
      <div style={{marginLeft:"auto",display:"flex",gap:8,alignItems:"center"}}>
        <div style={{fontFamily:"'IBM Plex Mono',monospace",fontSize:20,fontWeight:700,color:barColor}}>{overallPct}%</div>
        <div style={{fontSize:12,color:"var(--text4)"}}>{totalHrs}h logged</div>
        {canEdit&&<button className="bp" style={{fontSize:12}} onClick={()=>setAddModal({projId:trackerProj,subId:trackerSub||null})}>+ Add Activity</button>}
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
        style={{fontSize:12,padding:"4px 12px",borderRadius:5,border:`1px solid ${!trackerSub?"var(--info)":"var(--border)"}`,background:!trackerSub?"var(--bg3)":"transparent",color:!trackerSub?"var(--info)":"var(--text3)",cursor:"pointer"}}>
        All Sites
      </button>
      {projSubs.map(sp=>{
        const spActs=projActs.filter(a=>String(a.subproject_id)===String(sp.id));
        const spPct=spActs.length>0?Math.round(spActs.reduce((s,a)=>s+a.progress,0)/spActs.length*100):0;
        const isSel=String(trackerSub)===String(sp.id);
        const sc=spPct>=90?"#34d399":spPct>=60?"var(--info)":spPct>=30?"#fb923c":"#f87171";
        return(
        <button key={sp.id} onClick={()=>{setTrackerSub(sp.id);setExpandedCats({});}}
          style={{fontSize:12,padding:"4px 10px",borderRadius:5,border:`1px solid ${isSel?sc:"var(--border)"}`,background:isSel?sc+"20":"transparent",color:isSel?sc:"var(--text3)",cursor:"pointer"}}>
          {sp.name} <span style={{fontFamily:"'IBM Plex Mono',monospace",fontWeight:700}}>{spPct}%</span>
        </button>);
      })}
    </div>)}

    {/* Category accordion sections — grouped by TAXONOMY order */}
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
          {/* Category header — clickable to collapse */}
          <div onClick={()=>toggleCat(cat)}
            style={{display:"flex",alignItems:"center",gap:10,padding:"10px 14px",cursor:"pointer",background:"var(--bg0)"}}
            onMouseEnter={e=>e.currentTarget.style.background="var(--bg3)"}
            onMouseLeave={e=>e.currentTarget.style.background="var(--bg0)"}>
            <span style={{fontSize:13,color:"var(--text4)",transition:"transform .2s",display:"inline-block",transform:isOpen?"rotate(90deg)":"rotate(0deg)"}}>▶</span>
            {catGroup&&<span style={{fontSize:10,padding:"1px 6px",borderRadius:3,background:catColor+"20",color:catColor,fontWeight:700,flexShrink:0}}>{catGroup}</span>}
            <span style={{fontSize:13,fontWeight:700,color:catColor,flex:1}}>{cat}</span>
            {/* Mini progress bar */}
            <div style={{width:80,height:5,background:"var(--bg1)",borderRadius:3,overflow:"hidden"}}>
              <div style={{height:"100%",width:`${catPct}%`,background:catColor,borderRadius:3}}/>
            </div>
            <span style={{fontFamily:"'IBM Plex Mono',monospace",fontSize:12,fontWeight:700,color:catColor,width:32,textAlign:"right"}}>{catPct}%</span>
            <span style={{fontSize:11,color:"var(--text4)",width:60,textAlign:"right"}}>{catDone}/{catActs.length} done</span>
            {canEdit&&<button className="bp" style={{fontSize:11,padding:"1px 7px",marginLeft:4}}
              onClick={e=>{e.stopPropagation();setAddModal({projId:trackerProj,subId:trackerSub||null,defaultCat:cat});}}>+</button>}
          </div>
          {/* Activity rows */}
          {isOpen&&(
          <table style={{margin:0}}>
            <thead><tr>
              <th>Activity</th><th>Status</th><th>Progress</th>
              <th>Assigned</th><th>Dates</th><th>Hours</th>
              {canEdit&&<th style={{width:36}}></th>}
            </tr></thead>
            <tbody>
              {catActs.map(a=>(
                <ActivityRow key={a.id} a={a} actHrs={getHrs(a.id)}
                  isAdmin={canEdit} onEdit={setEditActivity} onDelete={deleteActivity}/>
              ))}
            </tbody>
          </table>)}
        </div>
        );
      })}

      {/* Uncategorised activities */}
      {uncategorised.length>0&&(
      <div style={{background:"var(--bg2)",border:"1px solid var(--border3)",borderRadius:8,overflow:"hidden"}}>
        <div style={{padding:"8px 14px",background:"var(--bg0)",fontSize:12,color:"var(--text3)",fontWeight:700}}>UNCATEGORISED</div>
        <table style={{margin:0}}>
          <thead><tr>
            <th>Activity</th><th>Status</th><th>Progress</th>
            <th>Assigned</th><th>Dates</th><th>Hours</th>
            {canEdit&&<th style={{width:36}}></th>}
          </tr></thead>
          <tbody>
            {uncategorised.map(a=>(
              <ActivityRow key={a.id} a={a} actHrs={getHrs(a.id)}
                isAdmin={canEdit} onEdit={setEditActivity} onDelete={deleteActivity}/>
            ))}
          </tbody>
        </table>
      </div>)}

      {visActs.length===0&&(
        <div style={{textAlign:"center",padding:"40px 24px",background:"var(--bg2)",borderRadius:8,border:"1px dashed #192d47"}}>
          <div style={{fontSize:28,marginBottom:10}}>📋</div>
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
          <span style={{fontSize:12,color:"var(--text3)"}}>{s.label}</span>
        </div>
      ))}
      <div style={{marginLeft:"auto",fontSize:12,color:"var(--text4)"}}>Click row to edit · Click category header to collapse</div>
    </div>
  </div>

  {/* Edit modal */}
  {editActivity&&(
    <ActivityEditModal
      act={{...editActivity, category: editActivity.category||editActivity.group_name||""}}
      onSave={saveActivity}
      onClose={()=>setEditActivity(null)}
      engineers={engineers}/>
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



/* ════════════════════════════════════════════════════════
   SUB-PROJECT MODAL (add / edit)
   ════════════════════════════════════════════════════════ */
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
        <span style={{fontSize:12,color:"#a78bfa",marginLeft:8,fontWeight:400}}>Project: {projectId}</span>
      </h3>
      <div style={{display:"grid",gap:10}}>
        <div>
          <label style={{fontSize:12,color:"var(--text2)",fontWeight:600,display:"block",marginBottom:4}}>SUB-SITE NAME <span style={{color:"#f87171"}}>*</span></label>
          <input value={draft.name} onChange={e=>setDraft(p=>({...p,name:e.target.value}))}
            placeholder="e.g. Ipotesti, Craiova, Bradu…"
            style={{width:"100%",background:"var(--bg2)",border:"1px solid var(--border3)",borderRadius:4,color:"var(--text0)",padding:"6px 8px",fontSize:13,boxSizing:"border-box"}}/>
        </div>
        <div>
          <label style={{fontSize:12,color:"var(--text2)",fontWeight:600,display:"block",marginBottom:4}}>BU ROMANIA PM</label>
          <input value={draft.pm_name||""} onChange={e=>setDraft(p=>({...p,pm_name:e.target.value}))}
            placeholder="e.g. Cosmin, Irena, Alexanda…"
            style={{width:"100%",background:"var(--bg2)",border:"1px solid var(--border3)",borderRadius:4,color:"var(--text0)",padding:"6px 8px",fontSize:13,boxSizing:"border-box"}}/>
        </div>
        <div>
          <label style={{fontSize:12,color:"var(--text2)",fontWeight:600,display:"block",marginBottom:4}}>ASSIGNED ENGINEERS</label>
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
                <span style={{fontSize:12,color:sel?"var(--info)":"var(--text2)"}}>{e.name}</span>
              </label>);
            })}
          </div>
        </div>
        <div>
          <label style={{fontSize:12,color:"var(--text2)",fontWeight:600,display:"block",marginBottom:4}}>PM COMMENTS</label>
          <textarea value={draft.pm_comments||""} onChange={e=>setDraft(p=>({...p,pm_comments:e.target.value}))} rows={2}
            placeholder="Comments from BU Romania PM…"
            style={{width:"100%",background:"var(--bg2)",border:"1px solid var(--border3)",borderRadius:4,color:"var(--text2)",padding:"6px 8px",fontSize:12,resize:"vertical",boxSizing:"border-box"}}/>
        </div>
        <div>
          <label style={{fontSize:12,color:"var(--text2)",fontWeight:600,display:"block",marginBottom:4}}>PENDING ITEMS</label>
          <textarea value={draft.pendings||""} onChange={e=>setDraft(p=>({...p,pendings:e.target.value}))} rows={2}
            placeholder="e.g. Waiting for IP list, IOA addresses…"
            style={{width:"100%",background:"var(--bg2)",border:"1px solid var(--border3)",borderRadius:4,color:"#f87171",padding:"6px 8px",fontSize:12,resize:"vertical",boxSizing:"border-box"}}/>
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

/* ════════════════════════════════════════════════════════
   PROJECTS TAB — standalone component (prevents hang)
   ════════════════════════════════════════════════════════ */
function ProjectsTab({projects, subprojects, entries, engineers, expandedProj, setExpandedProj,
  setShowProjModal, setEditProjModal, setSubProjModal, deleteProject, deleteSubProject,
  activities, setActivities, supabase, showToast, isAdmin, isLead, isAcct}){
  const [actModal,setActModal] = React.useState(null); // {projId, act:null|object}
  const [actDraft,setActDraft] = React.useState({});
  const [projSearch,setProjSearch] = React.useState("");
  const canEdit = isAdmin||isLead;       // guards add/edit/delete buttons
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
    if(showToast)showToast("Activity saved ✓");
  };
  const delAct=async(id)=>{
    if(!window.confirm("Delete this activity?")) return;
    await supabase.from("project_activities").delete().eq("id",id);
    if(setActivities) setActivities(prev=>prev.filter(a=>a.id!==id));
    if(showToast)showToast("Activity deleted");
  };

  const projHrsMap = useMemo(()=>{
    const m={};
    for(const e of entries){ if(e.entry_type==="work"&&e.project_id) m[e.project_id]=(m[e.project_id]||0)+e.hours; }
    return m;
  },[entries]);

  return(
  <div style={{display:"grid",gap:12}}>
    <div className="card" style={{padding:"12px 16px"}}>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:14}}>
        <h3 style={{fontSize:15,fontWeight:600,color:"var(--text2)"}}>Projects ({projects.length})</h3>
        {canEdit&&<button className="bp" onClick={()=>setShowProjModal(true)}>+ New Project</button>}
      </div>
      <div style={{marginBottom:10}}><input value={projSearch} onChange={e=>setProjSearch(e.target.value)} placeholder="Search projects..." style={{width:"100%",boxSizing:"border-box",padding:"7px 12px",borderRadius:6,border:"1px solid var(--border3)",background:"var(--bg2)",color:"var(--text0)",fontSize:13}}/></div>
      <table>
        <thead><tr>
          <th style={{width:28}}></th>
          <th>Name</th><th>No.</th><th>PM</th><th>Client</th><th>Phase</th>
          <th>Status</th><th>Billing</th><th>Hours</th>
          <th>Sub-sites</th>
          <th style={{width:110}}>Actions</th>
        </tr></thead>
        <tbody>{projects.filter(p=>!projSearch||(p.name||'').toLowerCase().includes(projSearch.toLowerCase())||(p.id||'').toLowerCase().includes(projSearch.toLowerCase())).map(p=>{
          const pSubs = subprojects.filter(s=>s.project_id===p.id);
          const isExp = expandedProj[p.id];
          const hrs   = projHrsMap[p.id]||0;
          return(<React.Fragment key={p.id}>
            <tr>
              <td style={{textAlign:"center"}}>
                {pSubs.length>0&&(
                  <button onClick={()=>setExpandedProj(prev=>({...prev,[p.id]:!prev[p.id]}))}
                    style={{background:"none",border:"none",color:"#a78bfa",cursor:"pointer",fontSize:13,padding:0,
                      transition:"transform .2s",display:"inline-block",transform:isExp?"rotate(90deg)":"rotate(0deg)"}}>▶</button>
                )}
              </td>
              <td style={{fontSize:13,fontWeight:600}}>{p.name||p.id}</td>
              <td style={{fontFamily:"'IBM Plex Mono',monospace",fontSize:11,color:"var(--info)"}}>{p.id}</td>
              <td style={{fontSize:13,color:"#a78bfa"}}>{p.pm||"—"}</td>
              <td style={{color:"var(--text2)",fontSize:13}}>{p.client}</td>
              <td style={{color:"#60a5fa",fontSize:13}}>{p.phase}</td>
              <td><span style={{fontSize:11,padding:"2px 6px",borderRadius:3,fontWeight:700,
                background:p.status==="Active"?"#024b36":p.status==="On Hold"?"#7c2d1230":"var(--border)",
                color:p.status==="Active"?"#34d399":p.status==="On Hold"?"#fb923c":"#60a5fa"}}>{p.status}</span></td>
              <td><span style={{fontSize:11,padding:"2px 6px",borderRadius:3,fontWeight:700,
                background:p.billable?"var(--bg3)":"#1a0a00",color:p.billable?"var(--info)":"#fb923c"}}>
                {p.billable?"Billable":"Non-Bill"}</span></td>
              <td style={{fontFamily:"'IBM Plex Mono',monospace",color:"var(--info)",fontWeight:700}}>{hrs}h</td>
              <td>
                {pSubs.length>0
                  ? <span style={{fontSize:11,padding:"2px 6px",borderRadius:3,background:"var(--bg3)",color:"#a78bfa",
                      fontWeight:700,cursor:"pointer"}}
                      onClick={()=>setExpandedProj(prev=>({...prev,[p.id]:!prev[p.id]}))}>
                      {pSubs.length} sub-site{pSubs.length>1?"s":""}
                    </span>
                  : <span style={{fontSize:11,color:"var(--text4)"}}>—</span>
                }
              </td>
              <td><div style={{display:"flex",gap:4}}>
                {canEdit&&<button className="be" title="Edit project" onClick={()=>setEditProjModal({...p})}>✎</button>}
                {canEdit&&<button style={{fontSize:12,padding:"2px 7px",borderRadius:4,background:"var(--bg3)",
                  border:"1px solid #a78bfa30",color:"#a78bfa",cursor:"pointer"}}
                  title="Add sub-site" onClick={()=>setSubProjModal({projectId:p.id,sub:null})}>+⊕</button>}
                {isAdmin&&<button className="bd" title="Delete project" onClick={()=>deleteProject(p.id)}>✕</button>}
              </div></td>
            </tr>
            {/* Sub-project rows */}
            {isExp&&pSubs.map(sp=>(
              <tr key={sp.id} style={{background:"var(--bg2)"}}>
                <td></td>
                <td colSpan={2} style={{paddingLeft:24}}>
                  <div style={{display:"flex",alignItems:"center",gap:6}}>
                    <span style={{color:"var(--text4)",fontSize:12}}>└</span>
                    <span style={{fontSize:13,color:"#a78bfa",fontWeight:600}}>{sp.name}</span>
                  </div>
                </td>
                <td style={{fontSize:12,color:"var(--text2)"}}>{sp.pm_name||"—"}</td>
                <td colSpan={2} style={{fontSize:12,color:"var(--info)"}}>
                  {(sp.assigned_engineers||[]).map(eid=>engineers.find(e=>String(e.id)===String(eid))?.name).filter(Boolean).join(", ")||"—"}
                </td>
                <td colSpan={2} style={{fontSize:12,color:"var(--text3)",fontStyle:"italic",
                  maxWidth:200,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{sp.pendings||""}</td>
                <td></td>
                <td><div style={{display:"flex",gap:4}}>
                  {canEdit&&<button className="be" style={{fontSize:12}} onClick={()=>setSubProjModal({projectId:p.id,sub:sp})}>✎</button>}
                  {isAdmin&&<button className="bd" style={{fontSize:12}} onClick={()=>deleteSubProject(sp.id)}>✕</button>}
                </div></td>
              </tr>
            ))}
          </React.Fragment>);
        })}</tbody>
      </table>
    </div>
  </div>);
}



/* ════════════════════════════════════════════════════════
   FINANCE MODULE COMPONENTS — Excel-matched tabs
   ════════════════════════════════════════════════════════ */

/* ── Shared helpers (module-level, no hooks) ── */
const fmtEGP = v => v != null ? `EGP ${Math.abs(+v).toLocaleString("en-EG",{minimumFractionDigits:2,maximumFractionDigits:2})}` : "—";
const fmtEGPsigned = v => `${+v>=0?"+":"-"} EGP ${Math.abs(+v).toLocaleString("en-EG",{minimumFractionDigits:2,maximumFractionDigits:2})}`;
const MO_SHORT = ["","Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
const MAIN_ACCOUNTS = [
  "Fixed Assets","Cash & Cash Equivalents","Cash Custody","Customers","Non-Current assets",
  "Accrued Expenses","Creditors and other accounts payable","Payable Notes",
  "Tax and Social Insurance Authority","Capital","Share holders",
  "Revenue","Administrative expenses","Operating Costs"
];

/* ═══════════════════════════════════════════════════════════
   TRACKER PROGRESS REPORT
   ═══════════════════════════════════════════════════════════ */
function TrackerProgressReport({activities,projects,subprojects,engineers}){
  const [period,  setPeriod]  = React.useState("weekly");
  const [selProj, setSelProj] = React.useState("ALL");
  const [selStat, setSelStat] = React.useState("ALL");
  const today = new Date();
  const fmtD = function(d){ return d ? new Date(d+"T12:00:00").toLocaleDateString("en-GB",{day:"2-digit",month:"short",year:"numeric"}) : "—"; };
  const GC = {"SCADA":"var(--info)","RTU-PLC":"#a78bfa","Protection":"#f87171","General":"#34d399"};
  const SC = {"Completed":"#34d399","In Progress":"var(--info)","Not Started":"var(--text3)","On Hold":"#fb923c"};
  const SB = {"Completed":"#14532d30","In Progress":"#0ea5e920","Not Started":"#1e293b40","On Hold":"#78350f30"};
  const PERIOD_LABEL = {daily:"Daily (Last 24h)",weekly:"Weekly (Last 7 days)",monthly:"Monthly (Last 30 days)",full:"Full Project"};

  const acts = React.useMemo(function(){
    return activities.filter(function(a){
      if(selProj!=="ALL"&&a.project_id!==selProj) return false;
      if(selStat!=="ALL"&&a.status!==selStat) return false;
      return true;
    });
  },[activities,selProj,selStat]);

  const grouped = React.useMemo(function(){
    const map={};
    acts.forEach(function(a){
      if(!map[a.project_id]) map[a.project_id]={pid:a.project_id,cats:{}};
      const cat=a.category||a.group_name||"General";
      if(!map[a.project_id].cats[cat]) map[a.project_id].cats[cat]=[];
      map[a.project_id].cats[cat].push(a);
    });
    return Object.values(map).sort(function(a,b){
      const na=projects.find(function(p){return p.id===a.pid;}); 
      const nb=projects.find(function(p){return p.id===b.pid;});
      return (na?na.name:a.pid).localeCompare(nb?nb.name:b.pid);
    });
  },[acts,projects]);

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
    let projHTML="";
    grouped.forEach(function(g){
      const proj=projects.find(function(p){return p.id===g.pid;});
      const all=Object.values(g.cats).flat();
      const pd=all.filter(function(a){return a.status==="Completed";}).length;
      const pp=all.length?Math.round(all.reduce(function(s,a){return s+(a.progress||0);},0)/all.length*100):0;
      const bc=pp===100?"#22c55e":pp>=50?"#3b82f6":"#f97316";
      let catRows="";
      Object.entries(g.cats).forEach(function(entry){
        const cat=entry[0]; const catActs=entry[1];
        catRows+='<tr style="background:#f8fafc"><td colspan="7" style="padding:3px 6px 3px 12px;font-size:9px;font-weight:700;color:#64748b;text-transform:uppercase;border-top:1px solid #e2e8f0">'+cat+'</td></tr>';
        catActs.forEach(function(a){
          const pct=Math.round((a.progress||0)*100);
          const ov=a.end_date&&new Date(a.end_date)<today&&a.status!=="Completed";
          const stBg=stBgMap[a.status]||"#f1f5f9";
          const stC=stCMap[a.status]||"#64748b";
          const pctCol=pct===100?"#166534":pct>=50?"#1d4ed8":"#64748b";
          const barCol=pct===100?"#22c55e":pct>=50?"#3b82f6":"#f97316";
          const bar='<div style="display:inline-block;vertical-align:middle;width:60px;height:4px;background:#e2e8f0;border-radius:2px;margin-left:4px"><div style="width:'+pct+'%;height:100%;background:'+barCol+';border-radius:2px"></div></div>';
          catRows+='<tr><td style="padding:5px 6px 5px 22px;font-size:11px">'+a.activity_name+'</td>'
            +'<td style="padding:5px 6px"><span style="background:'+stBg+';color:'+stC+';padding:1px 6px;border-radius:3px;font-size:10px;font-weight:600">'+a.status+'</span></td>'
            +'<td style="padding:5px 6px;white-space:nowrap"><b style="font-size:11px;color:'+pctCol+'">'+pct+'%</b>'+bar+'</td>'
            +'<td style="padding:5px 6px;font-size:10px;color:#475569">'+(a.assigned_to||"—")+'</td>'
            +'<td style="padding:5px 6px;font-size:10px;white-space:nowrap">'+fmtD(a.start_date)+'</td>'
            +'<td style="padding:5px 6px;font-size:10px;white-space:nowrap;color:'+(ov?"#dc2626":"#475569")+';font-weight:'+(ov?"700":"400")+'">'+fmtD(a.end_date)+(ov?" ⚠":"")+'</td>'
            +'<td style="padding:5px 6px;font-size:10px;color:#64748b">'+(a.remarks||"")+'</td></tr>';
        });
      });
      projHTML+='<div style="margin-bottom:20px;page-break-inside:avoid">'
        +'<div style="background:linear-gradient(135deg,#1e3a5f,#1e4d8c);color:#fff;padding:10px 14px;border-radius:7px 7px 0 0;display:flex;justify-content:space-between;align-items:center">'
        +'<div><div style="font-size:15px;font-weight:700">'+(proj?proj.name:g.pid)+'</div>'
        +'<div style="font-size:10px;color:#93c5fd;margin-top:1px">'+g.pid+(proj&&proj.phase?" · Phase: "+proj.phase:"")+'</div></div>'
        +'<div style="text-align:right"><div style="font-size:22px;font-weight:800;color:'+bc+'">'+pp+'%</div>'
        +'<div style="font-size:10px;color:#93c5fd">'+pd+'/'+all.length+' done</div></div></div>'
        +'<div style="height:4px;background:#e2e8f0"><div style="width:'+pp+'%;height:100%;background:'+bc+'"></div></div>'
        +'<table style="width:100%;border-collapse:collapse;border:1px solid #e2e8f0;border-top:none">'
        +'<thead><tr style="background:#f1f5f9">'
        +'<th style="padding:5px 6px 5px 22px;text-align:left;font-size:9px;color:#64748b;border-bottom:1px solid #e2e8f0">ACTIVITY</th>'
        +'<th style="padding:5px 6px;text-align:left;font-size:9px;color:#64748b;border-bottom:1px solid #e2e8f0">STATUS</th>'
        +'<th style="padding:5px 6px;text-align:left;font-size:9px;color:#64748b;border-bottom:1px solid #e2e8f0">PROGRESS</th>'
        +'<th style="padding:5px 6px;text-align:left;font-size:9px;color:#64748b;border-bottom:1px solid #e2e8f0">ASSIGNED</th>'
        +'<th style="padding:5px 6px;text-align:left;font-size:9px;color:#64748b;border-bottom:1px solid #e2e8f0">START</th>'
        +'<th style="padding:5px 6px;text-align:left;font-size:9px;color:#64748b;border-bottom:1px solid #e2e8f0">DEADLINE</th>'
        +'<th style="padding:5px 6px;text-align:left;font-size:9px;color:#64748b;border-bottom:1px solid #e2e8f0">NOTES</th>'
        +'</tr></thead><tbody>'+catRows+'</tbody></table></div>';
    });
    const html='<!DOCTYPE html><html><head><meta charset="utf-8"><title>Tracker Report</title>'
      +'<style>body{font-family:\'Segoe UI\',Arial,sans-serif;margin:0;padding:20px;color:#1e293b}'
      +'@media print{body{padding:0}@page{margin:14mm}.proj-block{page-break-inside:auto}table{page-break-inside:auto}tr{page-break-inside:avoid;page-break-after:auto}}</style></head><body>'
      +'<div style="display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:16px;padding-bottom:12px;border-bottom:3px solid #1e3a5f">'
      +'<div><div style="font-size:20px;font-weight:800;color:#1e3a5f">ENEVO GROUP</div>'
      +'<div style="font-size:15px;font-weight:700;color:#334155;margin-top:2px">Activity Tracker Progress Report</div>'
      +'<div style="font-size:11px;color:#64748b;margin-top:3px">Period: <b>'+label+'</b> · Generated: '+now+'</div></div>'
      +'<div style="text-align:right;font-size:11px;color:#64748b;line-height:1.8">'
      +'<div>'+acts.length+' activities · '+grouped.length+' projects</div>'
      +'<div>Completed: <b style="color:#16a34a">'+done+'</b>  In Progress: <b style="color:#2563eb">'+inprog+'</b>  On Hold: <b style="color:#ea580c">'+onhold+'</b></div>'
      +'<div>Avg: <b style="font-size:14px">'+avg+'%</b></div></div></div>'
      +(grouped.length===0?'<p style="text-align:center;padding:30px;color:#94a3b8">No activities found.</p>':projHTML)
      +'<div style="margin-top:24px;padding-top:8px;border-top:1px solid #e2e8f0;font-size:9px;color:#94a3b8;text-align:center">ENEVO GROUP — Internal Report — '+now+'</div>'
      +'</body></html>';
    var w=window.open("","pdf_"+Date.now()+"_"+Math.random().toString(36).slice(2));
    if(w){w.document.write(html);w.document.close();w.focus();setTimeout(function(){w.print();},600);}
  };

  return(
  <div>
    <div className="card" style={{marginBottom:14}}>
      <div style={{display:"flex",gap:12,flexWrap:"wrap",alignItems:"flex-end",justifyContent:"space-between"}}>
        <div style={{display:"flex",gap:12,flexWrap:"wrap",alignItems:"flex-end"}}>
          <div>
            <div style={{fontSize:11,fontWeight:700,color:"var(--text3)",marginBottom:5}}>PERIOD</div>
            <div style={{display:"flex",gap:5}}>
              {[{v:"daily",l:"Daily"},{v:"weekly",l:"Weekly"},{v:"monthly",l:"Monthly"},{v:"full",l:"Full Project"}].map(function(o){return(
                <button key={o.v} onClick={function(){setPeriod(o.v);}}
                  style={{padding:"6px 12px",borderRadius:5,cursor:"pointer",fontSize:12,
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
            <div style={{fontSize:11,fontWeight:700,color:"var(--text3)",marginBottom:5}}>PROJECT</div>
            <select value={selProj} onChange={function(e){setSelProj(e.target.value);}}
              style={{background:"var(--bg2)",border:"1px solid var(--border3)",borderRadius:5,color:"var(--text0)",padding:"6px 10px",fontSize:13,minWidth:190}}>
              <option value="ALL">All Projects</option>
              {[...new Set(activities.map(function(a){return a.project_id;}))].sort(function(a,b){
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
            <div style={{fontSize:11,fontWeight:700,color:"var(--text3)",marginBottom:5}}>STATUS</div>
            <select value={selStat} onChange={function(e){setSelStat(e.target.value);}}
              style={{background:"var(--bg2)",border:"1px solid var(--border3)",borderRadius:5,color:"var(--text0)",padding:"6px 10px",fontSize:13}}>
              <option value="ALL">All Statuses</option>
              {["Not Started","In Progress","On Hold","Completed"].map(function(s){return <option key={s}>{s}</option>;})}
            </select>
          </div>
        </div>
        <button className="bp" onClick={buildPDF} style={{height:36,padding:"0 18px",fontSize:13,fontWeight:700}}>⬇ Export PDF</button>
      </div>
    </div>
    <div style={{display:"grid",gridTemplateColumns:"repeat(5,1fr)",gap:10,marginBottom:14}}>
      {[{l:"Total",v:total,c:"var(--info)"},{l:"Completed",v:done,c:"#34d399"},
        {l:"In Progress",v:inprog,c:"var(--info)"},{l:"On Hold",v:onhold,c:"#fb923c"},
        {l:"Avg Progress",v:avg+"%",c:avg>=75?"#34d399":avg>=40?"#fb923c":"#f87171"}
      ].map(function(k){return(
        <div key={k.l} className="card" style={{textAlign:"center",padding:"12px 8px"}}>
          <div style={{fontFamily:"'IBM Plex Mono',monospace",fontSize:22,fontWeight:700,color:k.c,lineHeight:1}}>{k.v}</div>
          <div style={{fontSize:11,color:"var(--text4)",marginTop:4,textTransform:"uppercase",letterSpacing:".05em"}}>{k.l}</div>
        </div>
      );})}
    </div>
    {onhold>0&&<div style={{background:"#78350f15",border:"1px solid #fb923c60",borderRadius:6,padding:"9px 14px",marginBottom:12,fontSize:13,color:"#fb923c"}}>
      ⚠ {onhold} {onhold===1?"activity":"activities"} On Hold — review required
    </div>}
    {grouped.length===0&&<div style={{textAlign:"center",padding:40,color:"var(--text4)",fontSize:14}}>No activities match filters.</div>}
    {grouped.map(function(g){
      const proj=projects.find(function(p){return p.id===g.pid;});
      const all=Object.values(g.cats).flat();
      const pd=all.filter(function(a){return a.status==="Completed";}).length;
      const pp=all.length?Math.round(all.reduce(function(s,a){return s+(a.progress||0);},0)/all.length*100):0;
      const bc=pp===100?"#34d399":pp>=50?"var(--info)":"#fb923c";
      return(
      <div key={g.pid} className="card" style={{marginBottom:12}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:12,paddingBottom:10,borderBottom:"1px solid var(--border3)"}}>
          <div>
            <div style={{fontSize:16,fontWeight:700,color:"var(--text0)"}}>{proj?proj.name:g.pid}</div>
            <div style={{fontFamily:"'IBM Plex Mono',monospace",fontSize:11,color:"var(--info)",marginTop:1}}>{g.pid}</div>
            {proj&&proj.pm&&<div style={{fontSize:12,color:"var(--text3)",marginTop:1}}>PM: <span style={{color:"#a78bfa",fontWeight:600}}>{proj.pm}</span></div>}
            {proj&&proj.phase&&<div style={{fontSize:12,color:"var(--text3)",marginTop:2}}>Phase: <span style={{color:"#60a5fa"}}>{proj.phase}</span>{proj.status&&<span> · <span style={{color:proj.status==="Active"?"#34d399":"var(--text3)"}}>{proj.status}</span></span>}</div>}
          </div>
          <div style={{textAlign:"right"}}>
            <div style={{fontFamily:"'IBM Plex Mono',monospace",fontSize:24,fontWeight:700,color:bc}}>{pp}%</div>
            <div style={{fontSize:11,color:"var(--text4)"}}>{pd}/{all.length} completed</div>
            <div style={{marginTop:5,background:"var(--bg3)",borderRadius:4,height:5,width:100,overflow:"hidden",marginLeft:"auto"}}>
              <div style={{height:"100%",width:pp+"%",background:bc,borderRadius:4}}/>
            </div>
          </div>
        </div>
        {Object.entries(g.cats).map(function(entry){
          const cat=entry[0]; const catActs=entry[1];
          const gc=GC[catActs[0]?catActs[0].group_name:""]||"var(--info)";
          return(
          <div key={cat} style={{marginBottom:10}}>
            <div style={{fontSize:11,fontWeight:700,color:gc,textTransform:"uppercase",letterSpacing:".07em",marginBottom:5,display:"flex",alignItems:"center",gap:6}}>
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
                        <span style={{fontSize:11,padding:"2px 7px",borderRadius:3,background:SB[a.status]||"var(--bg3)",color:SC[a.status]||"var(--text3)",fontWeight:600}}>{a.status}</span>
                        {a.assigned_to&&<span style={{fontSize:11,color:"var(--text3)"}}>👤 {a.assigned_to}</span>}
                        {a.start_date&&<span style={{fontSize:11,color:"var(--text4)"}}>▶ {fmtD(a.start_date)}</span>}
                        {a.end_date&&<span style={{fontSize:11,color:ov?"#f87171":"var(--text4)",fontWeight:ov?700:400}}>{ov?"⚠ ":""}⏎ {fmtD(a.end_date)}{ov?" (overdue)":""}</span>}
                      </div>
                      {a.remarks&&<div style={{fontSize:11,color:"var(--text4)",marginTop:4,fontStyle:"italic",padding:"3px 7px",background:"var(--bg3)",borderRadius:3,borderLeft:"2px solid var(--border3)"}}>📝 {a.remarks}</div>}
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
  </div>
  );
}

/* ═══ ASSIGNMENT REPORT ═══ */
function AssignmentReport({entries,projects,engineers,month,year}){
  const [selProj,setSelProj]=React.useState("ALL");
  const [selEng,setSelEng]=React.useState("ALL");
  const MN=["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
  const workE=React.useMemo(function(){
    return entries.filter(function(e){
      var d=new Date(e.date+"T12:00:00");
      if(d.getFullYear()!==year||d.getMonth()+1!==month||e.entry_type!=="work") return false;
      if(selProj!=="ALL"&&e.project_id!==selProj) return false;
      if(selEng!=="ALL"&&String(e.engineer_id)!==String(selEng)) return false;
      return true;
    });
  },[entries,year,month,selProj,selEng]);
  const grouped=React.useMemo(function(){
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
    return Object.entries(map).map(function(kv){
      var tot=Object.values(kv[1]).reduce(function(s,x){return s+x.hours;},0);
      return {pid:kv[0],engs:kv[1],tot:tot};
    }).sort(function(a,b){return b.tot-a.tot;});
  },[workE]);
  var totHrs=workE.reduce(function(s,e){return s+e.hours;},0);
  var totEngs=new Set(workE.map(function(e){return e.engineer_id;})).size;
  var exportPDF=function(){
    var now=new Date().toLocaleDateString("en-GB",{day:"2-digit",month:"short",year:"numeric"});
    var period=(MN[month-1]||"")+" "+year;
    var blocks=grouped.map(function(g){
      var proj=projects.find(function(p){return p.id===g.pid;});
      var rows=Object.entries(g.engs).sort(function(a,b){return b[1].hours-a[1].hours;}).map(function(kv){
        var eng=engineers.find(function(e){return String(e.id)===kv[0];});
        var tasks=Object.entries(kv[1].tasks).map(function(t){return t[0]+": "+t[1]+"h";}).join(", ");
        return "<tr><td style='padding:5px 8px 5px 20px;font-size:12px'>"+(eng?eng.name:kv[0])+"</td>"
          +"<td style='padding:5px 8px;font-size:11px;color:#64748b'>"+(eng?eng.role||"":"")+"</td>"
          +"<td style='padding:5px 8px;font-size:11px;color:#64748b'>"+tasks+"</td>"
          +"<td style='padding:5px 8px;text-align:right;font-family:monospace;font-weight:700;color:#1d4ed8'>"+kv[1].hours+"h</td></tr>";
      }).join("");
      return "<div style='margin-bottom:16px;page-break-inside:avoid'>"
        +"<div style='background:linear-gradient(135deg,#1e3a5f,#1e4d8c);color:#fff;padding:9px 14px;border-radius:6px 6px 0 0;display:flex;justify-content:space-between'>"
        +"<div><div style='font-size:14px;font-weight:700'>"+(proj?proj.name:g.pid)+"</div>"
        +"<div style='font-size:10px;color:#93c5fd'>"+g.pid+(proj&&proj.pm?" · PM: "+proj.pm:"")+(proj&&proj.phase?" · "+proj.phase:"")+"</div></div>"
        +"<div style='text-align:right'><div style='font-size:20px;font-weight:800;color:#60a5fa'>"+g.tot+"h</div>"
        +"<div style='font-size:10px;color:#93c5fd'>"+Object.keys(g.engs).length+" eng</div></div></div>"
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
      +"<div style='font-size:15px;font-weight:700;color:#334155;margin-top:2px'>Assignment Report — "+period+"</div>"
      +"<div style='font-size:11px;color:#64748b;margin-top:3px'>Generated: "+now+"</div></div>"
      +"<div style='text-align:right;font-size:11px;color:#64748b;line-height:1.9'>"
      +"<div>"+grouped.length+" projects · "+totEngs+" engineers</div>"
      +"<div>Total: <b>"+totHrs+"h</b></div></div></div>"
      +(grouped.length===0?"<p style='text-align:center;color:#94a3b8'>No entries found.</p>":blocks)
      +"<div style='margin-top:20px;border-top:1px solid #e2e8f0;padding-top:8px;font-size:9px;color:#94a3b8;text-align:center'>ENEVO GROUP — "+now+"</div>"
      +"</body></html>";
    var w=window.open("","pdf_"+Date.now()+"_"+Math.random().toString(36).slice(2));
    if(w){w.document.write(html);w.document.close();w.focus();setTimeout(function(){w.print();},600);}
  };
  return(<div>
    <div className="card" style={{marginBottom:14}}>
      <div style={{display:"flex",gap:12,flexWrap:"wrap",alignItems:"flex-end",justifyContent:"space-between"}}>
        <div style={{display:"flex",gap:12,flexWrap:"wrap"}}>
          <div><div style={{fontSize:11,fontWeight:700,color:"var(--text3)",marginBottom:5}}>PROJECT</div>
            <select value={selProj} onChange={function(e){setSelProj(e.target.value);}}
              style={{background:"var(--bg2)",border:"1px solid var(--border3)",borderRadius:5,color:"var(--text0)",padding:"6px 10px",fontSize:13,minWidth:190}}>
              <option value="ALL">All Projects</option>
              {[...new Set(workE.map(function(e){return e.project_id;}).filter(Boolean))].sort(function(a,b){
                var pa=projects.find(function(p){return p.id===a;}); var pb=projects.find(function(p){return p.id===b;});
                return (pa?pa.name:a).localeCompare(pb?pb.name:b);
              }).map(function(pid){var p=projects.find(function(x){return x.id===pid;});
                return <option key={pid} value={pid}>{p?p.name:pid}</option>;})}
            </select></div>
          <div><div style={{fontSize:11,fontWeight:700,color:"var(--text3)",marginBottom:5}}>ENGINEER</div>
            <select value={selEng} onChange={function(e){setSelEng(e.target.value);}}
              style={{background:"var(--bg2)",border:"1px solid var(--border3)",borderRadius:5,color:"var(--text0)",padding:"6px 10px",fontSize:13,minWidth:160}}>
              <option value="ALL">All Engineers</option>
              {engineers.filter(function(e){return workE.some(function(x){return String(x.engineer_id)===String(e.id);});}).map(function(e){
                return <option key={e.id} value={String(e.id)}>{e.name}</option>;})}
            </select></div>
        </div>
        <button className="bp" onClick={exportPDF} style={{height:36,padding:"0 18px",fontSize:13,fontWeight:700}}>&#11015; Export PDF</button>
      </div>
    </div>
    <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:10,marginBottom:14}}>
      {[{l:"Projects",v:grouped.length,c:"var(--info)"},{l:"Engineers",v:totEngs,c:"#34d399"},{l:"Total Hours",v:totHrs+"h",c:"#a78bfa"}].map(function(k){return(
        <div key={k.l} className="card" style={{textAlign:"center",padding:"12px 8px"}}>
          <div style={{fontFamily:"'IBM Plex Mono',monospace",fontSize:22,fontWeight:700,color:k.c,lineHeight:1}}>{k.v}</div>
          <div style={{fontSize:11,color:"var(--text4)",marginTop:4,textTransform:"uppercase",letterSpacing:".05em"}}>{k.l}</div>
        </div>);})}
    </div>
    {grouped.length===0&&<div style={{textAlign:"center",padding:40,color:"var(--text4)"}}>No work entries for {MN[month-1]} {year}.</div>}
    {grouped.map(function(g){
      var proj=projects.find(function(p){return p.id===g.pid;});
      return(<div key={g.pid} className="card" style={{marginBottom:12}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:12,paddingBottom:10,borderBottom:"1px solid var(--border3)"}}>
          <div>
            <div style={{fontSize:15,fontWeight:700,color:"var(--text0)"}}>{proj?proj.name:g.pid}</div>
            <div style={{fontFamily:"'IBM Plex Mono',monospace",fontSize:11,color:"var(--info)",marginTop:1}}>{g.pid}</div>
            {proj&&proj.pm&&<div style={{fontSize:12,color:"var(--text3)",marginTop:2}}>PM: <span style={{color:"#a78bfa",fontWeight:600}}>{proj.pm}</span></div>}
            {proj&&proj.phase&&<div style={{fontSize:12,color:"var(--text3)",marginTop:1}}>Phase: <span style={{color:"#60a5fa"}}>{proj.phase}</span></div>}
          </div>
          <div style={{textAlign:"right"}}>
            <div style={{fontFamily:"'IBM Plex Mono',monospace",fontSize:22,fontWeight:700,color:"var(--info)"}}>{g.tot}h</div>
            <div style={{fontSize:11,color:"var(--text4)"}}>{Object.keys(g.engs).length} eng</div>
          </div>
        </div>
        {Object.entries(g.engs).sort(function(a,b){return b[1].hours-a[1].hours;}).map(function(kv){
          var eng=engineers.find(function(e){return String(e.id)===kv[0];});
          return(<div key={kv[0]} style={{marginBottom:8,background:"var(--bg2)",borderRadius:6,padding:"8px 12px",border:"1px solid var(--border3)"}}>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:5}}>
              <div><span style={{fontSize:13,fontWeight:600,color:"var(--text0)"}}>{eng?eng.name:kv[0]}</span>
                {eng&&<span style={{fontSize:11,color:"var(--text4)",marginLeft:8}}>{eng.role}</span>}</div>
              <span style={{fontFamily:"'IBM Plex Mono',monospace",fontSize:13,fontWeight:700,color:"var(--info)"}}>{kv[1].hours}h</span>
            </div>
            <div style={{display:"flex",flexWrap:"wrap",gap:4}}>
              {Object.entries(kv[1].tasks).map(function(t){return(
                <span key={t[0]} style={{background:"var(--bg3)",borderRadius:4,padding:"2px 7px",fontSize:11}}>
                  <span style={{color:"var(--text2)",fontWeight:600}}>{t[0]}</span>
                  <span style={{fontFamily:"'IBM Plex Mono',monospace",color:"var(--info)",marginLeft:4}}>{t[1]}h</span>
                </span>);})}
            </div>
          </div>);})}
      </div>);})}
  </div>);
}

const ENTRY_TYPES = ["Custody","Accrued Salaries","Revenue","Creditors","Opening","Shareholders","project in process"];

/* ══════════════════════════════════════════════════════════
   1. JOURNAL LEDGER
   ══════════════════════════════════════════════════════════ */
function JournalLedger({journalEntries, accounts, isAcct, isAdmin, onAdd, onDelete, onEdit, loading}) {
  const [filterType,  setFilterType]  = React.useState("ALL");
  const [filterMonth, setFilterMonth] = React.useState("ALL");
  const [search,      setSearch]      = React.useState("");
  const [editLine,    setEditLine]    = React.useState(null);
  const [showAdd,     setShowAdd]     = React.useState(false);
  const [voucherEntry, setVoucherEntry] = React.useState(null);
  const blank = {entry_no:"",entry_date:"",month:"",entry_type:"Custody",account_name:"",
    statement_type:"Profit & Loss Sheet",main_account:"",debit:"",credit:"",
    description:"",usd_amount:"",exchange_rate:""};
  const [newLine, setNewLine] = React.useState(blank);

  const canWrite = isAcct || isAdmin;
  const types  = React.useMemo(()=>["ALL",...new Set(journalEntries.map(e=>e.entry_type))].sort(),[journalEntries]);
  const months = React.useMemo(()=>["ALL",...new Set(journalEntries.map(e=>e.month))].sort((a,b)=>+a-+b),[journalEntries]);
  const acctNames = React.useMemo(()=>accounts.map(a=>a.account_name).sort(),[accounts]);

  const filtered = React.useMemo(()=>journalEntries.filter(e=>{
    if(filterType!=="ALL" && e.entry_type!==filterType) return false;
    if(filterMonth!=="ALL" && String(e.month)!==String(filterMonth)) return false;
    if(search && !`${e.entry_no} ${e.account_name} ${e.description} ${e.main_account}`.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  }),[journalEntries,filterType,filterMonth,search]);

  const totDr = filtered.reduce((s,e)=>s+(+e.debit||0),0);
  const totCr = filtered.reduce((s,e)=>s+(+e.credit||0),0);
  const balanced = Math.abs(totDr-totCr)<0.01;

  const typeColor = t=>({Opening:"#38bdf8","Accrued Salaries":"#a78bfa",Revenue:"#34d399",
    Custody:"#fb923c",Creditors:"#f87171",Shareholders:"#facc15","project in process":"#94a3b8"}[t]||"var(--text3)");

  const selectedAcct = accounts.find(a=>a.account_name===newLine.account_name);

  // Group by entry_no for voucher view
  const entryGroups = React.useMemo(()=>{
    const g={};
    filtered.forEach(e=>{
      if(!g[e.entry_no]) g[e.entry_no]=[];
      g[e.entry_no].push(e);
    });
    return g;
  },[filtered]);

  return(<>
    <div>
      {/* Toolbar */}
      <div style={{display:"flex",gap:8,flexWrap:"wrap",marginBottom:12,alignItems:"center"}}>
        <input placeholder="🔍 Search..." value={search} onChange={e=>setSearch(e.target.value)}
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
        <span style={{fontSize:12,color:"var(--text4)",marginLeft:"auto"}}>{filtered.length} lines / {Object.keys(entryGroups).length} entries</span>
        {canWrite&&<button className="bp" style={{padding:"6px 14px",fontSize:13}} onClick={()=>setShowAdd(true)}>+ Post Entry Line</button>}
      </div>

      {/* Balance strip */}
      <div style={{display:"flex",gap:8,marginBottom:12}}>
        {[
          {l:"Filtered Debit",  v:fmtEGP(totDr), c:"#34d399"},
          {l:"Filtered Credit", v:fmtEGP(totCr), c:"#f87171"},
          {l:"Balanced",        v:balanced?"✓ YES":"✗ NO", c:balanced?"#34d399":"#f87171"},
        ].map((k,i)=>(
          <div key={i} style={{background:"var(--bg2)",border:`1px solid ${k.c}30`,borderRadius:8,padding:"7px 14px",minWidth:155}}>
            <div style={{fontFamily:"'IBM Plex Mono',monospace",fontSize:13,fontWeight:700,color:k.c}}>{k.v}</div>
            <div style={{fontSize:11,color:"var(--text4)",marginTop:1}}>{k.l}</div>
          </div>
        ))}
      </div>

      {loading ? <div style={{textAlign:"center",padding:40,color:"var(--text4)"}}>Loading journal…</div> : (
      <div style={{overflowX:"auto"}}>
        <table style={{width:"100%",borderCollapse:"collapse",fontSize:13}}>
          <thead>
            <tr style={{background:"var(--bg2)"}}>
              {["Entry#","Date","Type","Account","Category","Debit","Credit","USD","Rate","Description",""].map(h=>(
                <th key={h} style={{padding:"7px 10px",textAlign:["Debit","Credit","USD","Rate"].includes(h)?"right":"left",
                  color:"var(--text3)",fontWeight:600,fontSize:12,borderBottom:"1px solid var(--border3)",whiteSpace:"nowrap"}}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.map((e,i)=>(
              <tr key={i} style={{borderBottom:"1px solid var(--border3)",background:i%2===0?"transparent":"var(--bg1)",cursor:"pointer"}}
                onClick={()=>setVoucherEntry(e.entry_no)}>
                <td style={{padding:"6px 10px",fontFamily:"'IBM Plex Mono',monospace",fontSize:12,color:"var(--text2)",whiteSpace:"nowrap"}}>{e.entry_no}</td>
                <td style={{padding:"6px 10px",fontFamily:"'IBM Plex Mono',monospace",fontSize:12,color:"var(--text3)",whiteSpace:"nowrap"}}>{String(e.entry_date).slice(0,10)}</td>
                <td style={{padding:"6px 10px"}}>
                  <span style={{background:typeColor(e.entry_type)+"20",color:typeColor(e.entry_type),padding:"2px 6px",borderRadius:4,fontSize:11,fontWeight:600}}>{e.entry_type}</span>
                </td>
                <td style={{padding:"6px 10px",color:"var(--text1)",fontWeight:500,whiteSpace:"nowrap"}}>{e.account_name}</td>
                <td style={{padding:"6px 10px"}}>
                  <div style={{fontSize:11,color:"var(--text3)"}}>{e.main_account}</div>
                  <span style={{fontSize:10,color:e.statement_type==="Balance Sheet"?"#38bdf8":"#a78bfa",fontWeight:600}}>{e.statement_type==="Balance Sheet"?"BS":"P&L"}</span>
                </td>
                <td style={{padding:"6px 10px",fontFamily:"'IBM Plex Mono',monospace",fontSize:12,color:"#34d399",textAlign:"right"}}>{+e.debit>0?fmtEGP(+e.debit):""}</td>
                <td style={{padding:"6px 10px",fontFamily:"'IBM Plex Mono',monospace",fontSize:12,color:"#f87171",textAlign:"right"}}>{+e.credit>0?fmtEGP(+e.credit):""}</td>
                <td style={{padding:"6px 10px",fontFamily:"'IBM Plex Mono',monospace",fontSize:12,color:"#38bdf8",textAlign:"right"}}>{e.usd_amount>0?`$${(+e.usd_amount).toLocaleString("en-US",{minimumFractionDigits:2})}`:""}</td>
                <td style={{padding:"6px 10px",fontFamily:"'IBM Plex Mono',monospace",fontSize:12,color:"var(--text4)",textAlign:"right"}}>{e.exchange_rate>0?e.exchange_rate:""}</td>
                <td style={{padding:"6px 10px",color:"var(--text3)",fontSize:12,maxWidth:200,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}} title={e.description}>{e.description}</td>
                <td style={{padding:"6px 10px"}}>
                  {canWrite && (
                    <div style={{display:"flex",gap:2}}>
                      <button onClick={ev=>{ev.stopPropagation();setEditLine({...e});}} title="Edit"
                        style={{background:"transparent",border:"none",color:"var(--info)",cursor:"pointer",fontSize:13,padding:"2px 4px"}}>✎</button>
                      <button onClick={ev=>{ev.stopPropagation();if(window.confirm("Delete this line?"))onDelete(e.id);}} title="Delete"
                        style={{background:"transparent",border:"none",color:"#f87171",cursor:"pointer",fontSize:13,padding:"2px 4px"}}>✕</button>
                    </div>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      )}

      {/* Voucher Modal */}
      {voucherEntry && (()=>{
        const lines = journalEntries.filter(e=>e.entry_no===voucherEntry);
        const dr = lines.reduce((s,e)=>s+(+e.debit||0),0);
        const cr = lines.reduce((s,e)=>s+(+e.credit||0),0);
        const bal = Math.abs(dr-cr)<0.01;
        return(
          <div style={{position:"fixed",inset:0,background:"#00000090",display:"flex",alignItems:"center",justifyContent:"center",zIndex:1000}} onClick={()=>setVoucherEntry(null)}>
            <div className="card" style={{width:620,maxHeight:"90vh",overflowY:"auto",padding:24}} onClick={e=>e.stopPropagation()}>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:16}}>
                <div>
                  <div style={{fontSize:16,fontWeight:700,color:"var(--text0)"}}>Journal Voucher — Entry #{voucherEntry}</div>
                  <div style={{fontSize:12,color:"var(--text4)",marginTop:2}}>{lines[0]?.entry_date} · {lines[0]?.entry_type} · {lines.length} lines</div>
                </div>
                <button onClick={()=>setVoucherEntry(null)} style={{background:"none",border:"none",color:"var(--text3)",fontSize:22,cursor:"pointer"}}>×</button>
              </div>
              <table style={{width:"100%",borderCollapse:"collapse",fontSize:13,marginBottom:12}}>
                <thead><tr style={{background:"var(--bg2)"}}>
                  {["Account","Category","Debit","Credit","USD","Rate"].map(h=>(
                    <th key={h} style={{padding:"7px 10px",textAlign:["Debit","Credit","USD","Rate"].includes(h)?"right":"left",color:"var(--text3)",fontSize:12,fontWeight:600}}>{h}</th>
                  ))}
                </tr></thead>
                <tbody>
                  {lines.map((e,i)=>(
                    <tr key={i} style={{borderBottom:"1px solid var(--border3)"}}>
                      <td style={{padding:"6px 10px",color:"var(--text1)",fontWeight:500}}>{e.account_name}</td>
                      <td style={{padding:"6px 10px",color:"var(--text4)",fontSize:12}}>{e.main_account}</td>
                      <td style={{padding:"6px 10px",fontFamily:"'IBM Plex Mono',monospace",fontSize:12,color:"#34d399",textAlign:"right"}}>{+e.debit>0?fmtEGP(+e.debit):""}</td>
                      <td style={{padding:"6px 10px",fontFamily:"'IBM Plex Mono',monospace",fontSize:12,color:"#f87171",textAlign:"right"}}>{+e.credit>0?fmtEGP(+e.credit):""}</td>
                      <td style={{padding:"6px 10px",fontFamily:"'IBM Plex Mono',monospace",fontSize:12,color:"#38bdf8",textAlign:"right"}}>{e.usd_amount>0?`$${(+e.usd_amount).toFixed(2)}`:""}</td>
                      <td style={{padding:"6px 10px",fontFamily:"'IBM Plex Mono',monospace",fontSize:12,color:"var(--text4)",textAlign:"right"}}>{e.exchange_rate>0?e.exchange_rate:""}</td>
                    </tr>
                  ))}
                  <tr style={{background:"var(--bg2)",fontWeight:700}}>
                    <td colSpan={2} style={{padding:"8px 10px",color:"var(--text0)"}}>TOTAL — {bal?"✅ Balanced":"❌ Unbalanced"}</td>
                    <td style={{padding:"8px 10px",fontFamily:"'IBM Plex Mono',monospace",textAlign:"right",color:"#34d399"}}>{fmtEGP(dr)}</td>
                    <td style={{padding:"8px 10px",fontFamily:"'IBM Plex Mono',monospace",textAlign:"right",color:"#f87171"}}>{fmtEGP(cr)}</td>
                    <td colSpan={2}/>
                  </tr>
                </tbody>
              </table>
              {lines[0]?.description && <div style={{fontSize:13,color:"var(--text3)",fontStyle:"italic",padding:"8px 0"}}>{lines[0].description}</div>}
            </div>
          </div>
        );
      })()}

      {/* Post Entry Modal */}
      {showAdd && canWrite && (()=>{
        const egpVal = (+newLine.usd_amount>0 && +newLine.exchange_rate>0)
          ? (+newLine.usd_amount * +newLine.exchange_rate).toFixed(2) : (newLine.debit||newLine.credit||"");
        return(
          <div style={{position:"fixed",inset:0,background:"#00000090",display:"flex",alignItems:"center",justifyContent:"center",zIndex:1000}}>
            <div className="card" style={{width:560,maxHeight:"92vh",overflowY:"auto",padding:24}}>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:16}}>
                <h3 style={{fontSize:16,fontWeight:700,color:"var(--text0)",margin:0}}>Post Journal Entry Line</h3>
                <button onClick={()=>{setShowAdd(false);setNewLine(blank);}} style={{background:"none",border:"none",color:"var(--text3)",fontSize:22,cursor:"pointer"}}>×</button>
              </div>
              <div style={{background:"#38bdf810",border:"1px solid #38bdf840",borderRadius:6,padding:"8px 12px",marginBottom:14,fontSize:12,color:"#38bdf8"}}>
                💡 Each entry must balance across all its lines (Dr total = Cr total). Post one line at a time using the same Entry No. to group them.
              </div>
              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}>
                {/* Entry No */}
                <div>
                  <div style={{fontSize:11,color:"var(--text4)",marginBottom:4}}>Entry No *</div>
                  <input value={newLine.entry_no} placeholder="e.g. 67"
                    onChange={e=>setNewLine(p=>({...p,entry_no:e.target.value}))}
                    style={{width:"100%",background:"var(--bg2)",border:"1px solid var(--border3)",borderRadius:6,padding:"6px 10px",color:"var(--text0)",fontSize:13,boxSizing:"border-box"}}/>
                </div>
                {/* Date */}
                <div>
                  <div style={{fontSize:11,color:"var(--text4)",marginBottom:4}}>Date *</div>
                  <input type="date" value={newLine.entry_date}
                    onChange={e=>{
                      const mo = e.target.value ? new Date(e.target.value+"T12:00:00").getMonth()+1 : "";
                      setNewLine(p=>({...p,entry_date:e.target.value,month:mo}));
                    }}
                    style={{width:"100%",background:"var(--bg2)",border:"1px solid var(--border3)",borderRadius:6,padding:"6px 10px",color:"var(--text0)",fontSize:13,boxSizing:"border-box"}}/>
                </div>
                {/* Entry Type */}
                <div>
                  <div style={{fontSize:11,color:"var(--text4)",marginBottom:4}}>Entry Type *</div>
                  <select value={newLine.entry_type} onChange={e=>setNewLine(p=>({...p,entry_type:e.target.value}))}
                    style={{width:"100%",background:"var(--bg1)",border:"1px solid var(--border3)",borderRadius:6,padding:"6px 10px",color:"var(--text0)",fontSize:13}}>
                    {ENTRY_TYPES.map(t=><option key={t}>{t}</option>)}
                  </select>
                </div>
                {/* Account */}
                <div>
                  <div style={{fontSize:11,color:"var(--text4)",marginBottom:4}}>Account *</div>
                  <select value={newLine.account_name} onChange={e=>{
                    const acct = accounts.find(a=>a.account_name===e.target.value);
                    setNewLine(p=>({...p,account_name:e.target.value,
                      main_account:acct?.main_account||p.main_account,
                      statement_type:acct?.statement_type||p.statement_type}));
                  }} style={{width:"100%",background:"var(--bg1)",border:"1px solid var(--border3)",borderRadius:6,padding:"6px 10px",color:"var(--text0)",fontSize:13}}>
                    <option value="">— Select account —</option>
                    {acctNames.map(a=><option key={a}>{a}</option>)}
                  </select>
                </div>
                {/* Main Account — auto-filled but editable */}
                <div>
                  <div style={{fontSize:11,color:"var(--text4)",marginBottom:4}}>Main Account (auto)</div>
                  <input value={newLine.main_account} placeholder="auto-filled from account"
                    onChange={e=>setNewLine(p=>({...p,main_account:e.target.value}))}
                    style={{width:"100%",background:"var(--bg2)",border:"1px solid var(--border3)",borderRadius:6,padding:"6px 10px",color:"var(--text0)",fontSize:13,boxSizing:"border-box"}}/>
                </div>
                {/* Statement Type */}
                <div>
                  <div style={{fontSize:11,color:"var(--text4)",marginBottom:4}}>Statement (auto)</div>
                  <select value={newLine.statement_type} onChange={e=>setNewLine(p=>({...p,statement_type:e.target.value}))}
                    style={{width:"100%",background:"var(--bg1)",border:"1px solid var(--border3)",borderRadius:6,padding:"6px 10px",color:"var(--text0)",fontSize:13}}>
                    <option>Profit &amp; Loss Sheet</option>
                    <option>Balance Sheet</option>
                  </select>
                </div>
              </div>

              {/* USD / Exchange Rate section */}
              <div style={{background:"var(--bg2)",borderRadius:6,padding:12,marginTop:12}}>
                <div style={{fontSize:12,fontWeight:600,color:"var(--text2)",marginBottom:8}}>💵 USD Entry (optional — for foreign currency transactions)</div>
                <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}>
                  <div>
                    <div style={{fontSize:11,color:"var(--text4)",marginBottom:4}}>Amount (USD)</div>
                    <input type="number" min="0" step="0.01" value={newLine.usd_amount}
                      placeholder="0.00"
                      onChange={e=>{
                        const usd=+e.target.value;
                        const egp = usd>0 && +newLine.exchange_rate>0 ? (usd*+newLine.exchange_rate).toFixed(2) : newLine.debit;
                        setNewLine(p=>({...p,usd_amount:e.target.value,debit:egp||p.debit}));
                      }}
                      style={{width:"100%",background:"var(--bg1)",border:"1px solid var(--border3)",borderRadius:6,padding:"6px 10px",color:"var(--text0)",fontSize:13,boxSizing:"border-box"}}/>
                  </div>
                  <div>
                    <div style={{fontSize:11,color:"var(--text4)",marginBottom:4}}>Exchange Rate (EGP per $1)</div>
                    <input type="number" min="0" step="0.01" value={newLine.exchange_rate}
                      placeholder="e.g. 49.5"
                      onChange={e=>{
                        const rate=+e.target.value;
                        const egp = rate>0 && +newLine.usd_amount>0 ? (+newLine.usd_amount*rate).toFixed(2) : newLine.debit;
                        setNewLine(p=>({...p,exchange_rate:e.target.value,debit:egp||p.debit}));
                      }}
                      style={{width:"100%",background:"var(--bg1)",border:"1px solid var(--border3)",borderRadius:6,padding:"6px 10px",color:"var(--text0)",fontSize:13,boxSizing:"border-box"}}/>
                  </div>
                </div>
                {+newLine.usd_amount>0 && +newLine.exchange_rate>0 && (
                  <div style={{fontSize:12,color:"#38bdf8",marginTop:6}}>
                    → EGP equivalent: <strong>{fmtEGP(+newLine.usd_amount * +newLine.exchange_rate)}</strong> (auto-applied to Debit below)
                  </div>
                )}
              </div>

              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10,marginTop:10}}>
                <div>
                  <div style={{fontSize:11,color:"var(--text4)",marginBottom:4}}>Debit (EGP) *</div>
                  <input type="number" min="0" step="0.01" value={newLine.debit} placeholder="0.00"
                    onChange={e=>setNewLine(p=>({...p,debit:e.target.value}))}
                    style={{width:"100%",background:"var(--bg2)",border:"1px solid var(--border3)",borderRadius:6,padding:"6px 10px",color:"var(--text0)",fontSize:13,boxSizing:"border-box"}}/>
                </div>
                <div>
                  <div style={{fontSize:11,color:"var(--text4)",marginBottom:4}}>Credit (EGP) *</div>
                  <input type="number" min="0" step="0.01" value={newLine.credit} placeholder="0.00"
                    onChange={e=>setNewLine(p=>({...p,credit:e.target.value}))}
                    style={{width:"100%",background:"var(--bg2)",border:"1px solid var(--border3)",borderRadius:6,padding:"6px 10px",color:"var(--text0)",fontSize:13,boxSizing:"border-box"}}/>
                </div>
              </div>
              <div style={{marginTop:10}}>
                <div style={{fontSize:11,color:"var(--text4)",marginBottom:4}}>Description</div>
                <input value={newLine.description} placeholder="e.g. Office rent for 03-2026"
                  onChange={e=>setNewLine(p=>({...p,description:e.target.value}))}
                  style={{width:"100%",background:"var(--bg2)",border:"1px solid var(--border3)",borderRadius:6,padding:"6px 10px",color:"var(--text0)",fontSize:13,boxSizing:"border-box"}}/>
              </div>
              <div style={{display:"flex",gap:8,marginTop:16,justifyContent:"flex-end"}}>
                <button onClick={()=>{setShowAdd(false);setNewLine(blank);}}
                  style={{background:"var(--bg2)",border:"1px solid var(--border3)",borderRadius:6,padding:"8px 16px",color:"var(--text2)",cursor:"pointer"}}>Cancel</button>
                <button className="bp" onClick={()=>{
                  if(!newLine.entry_no||!newLine.entry_date||!newLine.account_name) return;
                  const dr=+(newLine.debit)||0; const cr=+(newLine.credit)||0;
                  onAdd({
                    entry_no:newLine.entry_no, entry_date:newLine.entry_date,
                    month:+newLine.month, entry_type:newLine.entry_type,
                    account_name:newLine.account_name, statement_type:newLine.statement_type,
                    main_account:newLine.main_account,
                    debit:dr, credit:cr, balance:dr-cr,
                    description:newLine.description,
                    usd_amount:+newLine.usd_amount||null,
                    exchange_rate:+newLine.exchange_rate||null,
                  });
                  setNewLine(p=>({...blank,entry_no:p.entry_no,entry_date:p.entry_date,month:p.month,entry_type:p.entry_type}));
                }}>Post Line</button>
              </div>
            </div>
          </div>
        );
      })()}
    </div>

    {/* Edit Journal Line Modal */}
    {editLine&&(
      <div style={{position:"fixed",inset:0,background:"#00000090",display:"flex",alignItems:"center",justifyContent:"center",zIndex:1100}}
        onClick={()=>setEditLine(null)}>
        <div className="card" style={{width:560,maxHeight:"92vh",overflowY:"auto",padding:24}} onClick={e=>e.stopPropagation()}>
          <h3 style={{fontSize:16,fontWeight:700,color:"var(--text0)",marginBottom:16}}>Edit Journal Line — #{editLine.entry_no}</h3>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10,marginBottom:10}}>
            {[{label:"Entry No",key:"entry_no",type:"text"},{label:"Date",key:"entry_date",type:"date"},
              {label:"Month",key:"month",type:"number"},{label:"Entry Type",key:"entry_type",type:"text"}].map(({label,key,type})=>(
              <div key={key}><label style={{fontSize:11,color:"var(--text3)",fontWeight:700,display:"block",marginBottom:3}}>{label}</label>
                <input type={type} value={editLine[key]||""} onChange={e=>setEditLine(p=>({...p,[key]:e.target.value}))}
                  style={{width:"100%",boxSizing:"border-box"}}/></div>
            ))}
          </div>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10,marginBottom:10}}>
            <div><label style={{fontSize:11,color:"var(--text3)",fontWeight:700,display:"block",marginBottom:3}}>Account Name</label>
              <input list="acct-edit-dl" value={editLine.account_name||""} onChange={e=>setEditLine(p=>({...p,account_name:e.target.value}))}
                style={{width:"100%",boxSizing:"border-box"}}/>
              <datalist id="acct-edit-dl">{acctNames.map(a=><option key={a} value={a}/>)}</datalist></div>
            <div><label style={{fontSize:11,color:"var(--text3)",fontWeight:700,display:"block",marginBottom:3}}>Main Account</label>
              <input value={editLine.main_account||""} onChange={e=>setEditLine(p=>({...p,main_account:e.target.value}))}
                style={{width:"100%",boxSizing:"border-box"}}/></div>
          </div>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10,marginBottom:10}}>
            <div><label style={{fontSize:11,color:"var(--text3)",fontWeight:700,display:"block",marginBottom:3}}>Statement Type</label>
              <select value={editLine.statement_type||""} onChange={e=>setEditLine(p=>({...p,statement_type:e.target.value}))} style={{width:"100%",boxSizing:"border-box"}}>
                <option value="Profit & Loss Sheet">Profit &amp; Loss Sheet</option>
                <option value="Balance Sheet">Balance Sheet</option>
              </select></div>
            <div><label style={{fontSize:11,color:"var(--text3)",fontWeight:700,display:"block",marginBottom:3}}>BS/PL</label>
              <select value={editLine.bs_pl||""} onChange={e=>setEditLine(p=>({...p,bs_pl:e.target.value}))} style={{width:"100%",boxSizing:"border-box"}}>
                <option value="">—</option><option value="BS">Balance Sheet (BS)</option><option value="PL">Profit &amp; Loss (PL)</option>
              </select></div>
          </div>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:10,marginBottom:10}}>
            {[{label:"Debit (EGP)",key:"debit"},{label:"Credit (EGP)",key:"credit"},{label:"USD Amount",key:"usd_amount"}].map(({label,key})=>(
              <div key={key}><label style={{fontSize:11,color:"var(--text3)",fontWeight:700,display:"block",marginBottom:3}}>{label}</label>
                <input type="number" step="0.01" value={editLine[key]||""} onChange={e=>setEditLine(p=>({...p,[key]:e.target.value}))}
                  style={{width:"100%",boxSizing:"border-box"}}/></div>
            ))}
          </div>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10,marginBottom:10}}>
            <div><label style={{fontSize:11,color:"var(--text3)",fontWeight:700,display:"block",marginBottom:3}}>Exchange Rate</label>
              <input type="number" step="0.01" value={editLine.exchange_rate||""} onChange={e=>setEditLine(p=>({...p,exchange_rate:e.target.value}))}
                style={{width:"100%",boxSizing:"border-box"}}/></div>
          </div>
          <div style={{marginBottom:16}}><label style={{fontSize:11,color:"var(--text3)",fontWeight:700,display:"block",marginBottom:3}}>Description</label>
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

/* ══════════════════════════════════════════════════════════
   2. BALANCE SHEET
   ══════════════════════════════════════════════════════════ */
function BalanceSheetView({journalEntries}) {
  const ASSET_G  = ['Fixed Assets','Cash & Cash Equivalents','Cash Custody','Customers','Non-Current assets'];
  const LIAB_G   = ['Accrued Expenses','Creditors and other accounts payable','Tax and Social Insurance Authority','Payable Notes'];
  const EQUITY_G = ['Capital','Share holders'];

  const {bsMap, totalAssets, totalLiab, totalEquity, netProfit, bsCheck} = React.useMemo(()=>{
    const map={};
    journalEntries.forEach(e=>{
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
    const netP = journalEntries.filter(e=>e.statement_type==="Profit & Loss Sheet").reduce((s,e)=>s+(+e.credit||0)-(+e.debit||0),0);
    const check = Math.abs(totAssets-(totLiab+totEquity+netP));
    return {bsMap:map,totalAssets:totAssets,totalLiab:totLiab,totalEquity:totEquity,netProfit:netP,bsCheck:check};
  },[journalEntries]);

  const Row = ({label,sub,dr,cr,net,isTotal,isNote}) => (
    <tr style={{borderBottom:"1px solid var(--border3)",background:isTotal?"var(--bg2)":"transparent"}}>
      <td style={{padding:"7px 16px",color:isNote?"var(--text3)":isTotal?"var(--text0)":"var(--text2)",fontStyle:isNote?"italic":"normal",fontWeight:isTotal?700:400,paddingLeft:isTotal?16:28}}>{label}</td>
      <td style={{padding:"7px 16px",color:"var(--text4)",fontSize:12}}>{sub||""}</td>
      <td style={{padding:"7px 16px",fontFamily:"'IBM Plex Mono',monospace",fontSize:12,textAlign:"right",color:"#34d399"}}>{dr>0.01?fmtEGP(dr):""}</td>
      <td style={{padding:"7px 16px",fontFamily:"'IBM Plex Mono',monospace",fontSize:12,textAlign:"right",color:"#f87171"}}>{cr>0.01?fmtEGP(cr):""}</td>
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
          color:"var(--text3)",fontWeight:600,fontSize:12,borderBottom:"1px solid var(--border3)"}}>{h}</th>
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
          {l:"BS Check",         v:bsCheck<1?"✓ Balanced":"⚠ Check entries", c:bsCheck<1?"#34d399":"#fb923c"},
        ].map((k,i)=>(
          <div key={i} className="card" style={{textAlign:"center",padding:"14px 8px"}}>
            <div style={{fontFamily:"'IBM Plex Mono',monospace",fontSize:15,fontWeight:700,color:k.c}}>{k.v}</div>
            <div style={{fontSize:11,color:"var(--text4)",marginTop:4,textTransform:"uppercase",letterSpacing:".06em"}}>{k.l}</div>
          </div>
        ))}
      </div>

      <div className="card" style={{padding:0,overflow:"hidden"}}>
        <table style={{width:"100%",borderCollapse:"collapse",fontSize:13}}><THead/><tbody>
          <SectionHead title="▸ ASSETS" total={totalAssets} c="#34d399"/>
          {ASSET_G.filter(g=>bsMap[g]).map(g=>
            Object.values(bsMap[g].accounts).map(a=>{
              const net = g==='Cash Custody' ? a.cr-a.dr : a.dr-a.cr;
              if(Math.abs(net)<0.01) return null;
              return <Row key={g+a.name} label={a.name} sub={g} dr={a.dr} cr={a.cr} net={Math.abs(net)}/>;
            })
          )}
          <Row label="TOTAL ASSETS" dr={0} cr={0} net={totalAssets} isTotal/>

          <SectionHead title="▸ LIABILITIES" total={totalLiab} c="#f87171"/>
          {LIAB_G.filter(g=>bsMap[g]).map(g=>
            Object.values(bsMap[g].accounts).map(a=>{
              if(g==='Tax and Social Insurance Authority'){
                const net=a.cr-a.dr;
                if(Math.abs(net)<0.01) return null;
                return <Row key={a.name} label={a.name} sub={net>0?"🔴 payable":"🟢 receivable"} dr={a.dr} cr={a.cr} net={Math.abs(net)}/>;
              }
              const net=a.cr-a.dr;
              if(Math.abs(net)<0.01) return null;
              return <Row key={g+a.name} label={a.name} sub={g} dr={a.dr} cr={a.cr} net={Math.abs(net)}/>;
            })
          )}
          <Row label="TOTAL LIABILITIES" dr={0} cr={0} net={totalLiab} isTotal/>

          <SectionHead title="▸ EQUITY" total={totalEquity+netProfit} c="#38bdf8"/>
          {EQUITY_G.filter(g=>bsMap[g]).map(g=>
            Object.values(bsMap[g].accounts).map(a=>{
              const net=a.cr-a.dr; if(Math.abs(net)<0.01) return null;
              return <Row key={g+a.name} label={a.name} sub={g} dr={a.dr} cr={a.cr} net={Math.abs(net)}/>;
            })
          )}
          <Row label="Retained Earnings (Current Year)" sub="Net P&L — open period" dr={0} cr={0} net={netProfit} isNote/>
          <Row label="TOTAL EQUITY" dr={0} cr={0} net={totalEquity+netProfit} isTotal/>
        </tbody></table>
      </div>

      {bsCheck>=1 && <div style={{background:"#fb923c15",border:"1px solid #fb923c",borderRadius:8,padding:"10px 16px",fontSize:13,color:"#fb923c"}}>
        ⚠ Balance Sheet off by EGP {bsCheck.toLocaleString("en-EG",{maximumFractionDigits:2})} — may indicate missing entries or opening balance adjustments.
      </div>}
    </div>
  );
}

/* ══════════════════════════════════════════════════════════
   3. EXPENSES — mirrors Excel "expenses" pivot
   ══════════════════════════════════════════════════════════ */
function ExpensesView({journalEntries, oldExpenses, egpRate}) {
  const [viewMode, setViewMode] = React.useState("pivot");

  // P&L data from journal — fixed pivot bug (no m[m.length])
  const {plEntries, revEntries, pivot, activeMonths, totalExpenses, totalRevenue, netPL} = React.useMemo(()=>{
    const plE = journalEntries.filter(e=>e.statement_type==="Profit & Loss Sheet" && +e.debit>0);
    const revE = journalEntries.filter(e=>e.statement_type==="Profit & Loss Sheet" && +e.credit>0);
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
  },[journalEntries]);

  const monthTotal = mo => plEntries.filter(e=>e.month===mo).reduce((s,e)=>s+(+e.debit),0);
  const monthRev   = mo => revEntries.filter(e=>e.month===mo).reduce((s,e)=>s+(+e.credit),0);

  // Old system expenses (from expenses table) — shown as supplementary data
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
            <div style={{fontSize:11,color:"var(--text4)",textTransform:"uppercase",letterSpacing:".06em",marginTop:4}}>{k.l}</div>
          </div>
        ))}
      </div>

      {oldData && (
        <div style={{background:"#38bdf810",border:"1px solid #38bdf840",borderRadius:8,padding:"10px 16px",fontSize:13,color:"#38bdf8"}}>
          📂 Legacy expense records: {oldData.count} entries · USD {oldData.totUSD.toLocaleString("en-US",{minimumFractionDigits:2})} · EGP {oldData.totEGP.toLocaleString()} · {oldData.withRate} entries have exchange rate. These pre-date the journal system. Post to journal to include in reports.
        </div>
      )}

      {/* Pivot table */}
      <div className="card" style={{padding:0,overflow:"hidden"}}>
        <div style={{background:"#f8711815",borderBottom:"2px solid #f87171",padding:"10px 16px",display:"flex",justifyContent:"space-between",alignItems:"center"}}>
          <span style={{fontSize:13,fontWeight:700,color:"#f87171",letterSpacing:".06em"}}>EXPENSES BREAKDOWN — JOURNAL DATA</span>
          <div style={{display:"flex",gap:4}}>
            {[{id:"pivot",l:"📊 Pivot"},{id:"monthly",l:"📅 Monthly"}].map(b=>(
              <button key={b.id} onClick={()=>setViewMode(b.id)}
                style={{background:viewMode===b.id?"#f8711820":"transparent",border:`1px solid ${viewMode===b.id?"#f87171":"var(--border3)"}`,
                  borderRadius:5,padding:"3px 10px",color:viewMode===b.id?"#f87171":"var(--text3)",cursor:"pointer",fontSize:12}}>
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
                  <th style={{padding:"7px 14px",textAlign:"left",color:"var(--text3)",fontSize:12,minWidth:150}}>Category</th>
                  <th style={{padding:"7px 14px",textAlign:"left",color:"var(--text3)",fontSize:12,minWidth:200}}>Account</th>
                  {activeMonths.map(m=>(
                    <th key={m} style={{padding:"7px 10px",textAlign:"right",color:"var(--text3)",fontSize:12,whiteSpace:"nowrap"}}>{MO_SHORT[+m]}</th>
                  ))}
                  <th style={{padding:"7px 14px",textAlign:"right",color:"var(--text3)",fontSize:12}}>Total</th>
                </tr>
              </thead>
              <tbody>
                {Object.values(pivot).sort((a,b)=>b.catTotal-a.catTotal).map(cat=>{
                  const accts = Object.values(cat.accounts).sort((a,b)=>b.total-a.total);
                  return accts.map((acc,i)=>(
                    <tr key={cat.cat+acc.name} style={{borderBottom:"1px solid var(--border3)"}}>
                      <td style={{padding:"6px 14px",color:"var(--text4)",fontSize:12,fontStyle:"italic"}}>{i===0?cat.cat:""}</td>
                      <td style={{padding:"6px 14px",color:"var(--text1)",fontWeight:500}}>{acc.name}</td>
                      {activeMonths.map(m=>(
                        <td key={m} style={{padding:"6px 10px",fontFamily:"'IBM Plex Mono',monospace",fontSize:12,textAlign:"right",color:"var(--text2)"}}>
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
                    <td key={m} style={{padding:"7px 10px",fontFamily:"'IBM Plex Mono',monospace",fontSize:12,textAlign:"right",color:"#34d399"}}>
                      {monthRev(m)?Math.round(monthRev(m)).toLocaleString("en-EG"):"-"}
                    </td>
                  ))}
                  <td style={{padding:"7px 14px",fontFamily:"'IBM Plex Mono',monospace",fontSize:13,textAlign:"right",color:"#34d399",fontWeight:700}}>{fmtEGP(totalRevenue)}</td>
                </tr>
                <tr style={{background:"var(--bg2)",borderTop:"2px solid var(--border)"}}>
                  <td colSpan={2} style={{padding:"9px 14px",fontWeight:700,color:"var(--text0)"}}>TOTAL EXPENSES</td>
                  {activeMonths.map(m=>(
                    <td key={m} style={{padding:"9px 10px",fontFamily:"'IBM Plex Mono',monospace",fontSize:12,textAlign:"right",fontWeight:700,color:"#f87171"}}>
                      {Math.round(monthTotal(m)).toLocaleString("en-EG")}
                    </td>
                  ))}
                  <td style={{padding:"9px 14px",fontFamily:"'IBM Plex Mono',monospace",fontSize:13,textAlign:"right",fontWeight:700,color:"#f87171"}}>{fmtEGP(totalExpenses)}</td>
                </tr>
                <tr style={{background:netPL>=0?"#34d39910":"#f8711810"}}>
                  <td colSpan={2} style={{padding:"9px 14px",fontWeight:700,color:netPL>=0?"#34d399":"#f87171"}}>NET P&L</td>
                  {activeMonths.map(m=>(
                    <td key={m} style={{padding:"9px 10px",fontFamily:"'IBM Plex Mono',monospace",fontSize:12,textAlign:"right",fontWeight:700,color:monthRev(m)-monthTotal(m)>=0?"#34d399":"#f87171"}}>
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
                    <span style={{fontFamily:"'IBM Plex Mono',monospace",fontSize:12,color:mNet>=0?"#34d399":"#f87171",fontWeight:600}}>Net: {fmtEGP(mNet)}</span>
                  </div>
                  {[{l:"Revenue",v:mRev,c:"#34d399"},{l:"Expenses",v:mExp,c:"#f87171"}].map(bar=>(
                    <div key={bar.l} style={{display:"grid",gridTemplateColumns:"80px 1fr 140px",gap:8,alignItems:"center",marginBottom:6}}>
                      <span style={{fontSize:12,color:"var(--text3)"}}>{bar.l}</span>
                      <div style={{height:10,background:"var(--bg2)",borderRadius:4,overflow:"hidden"}}>
                        <div style={{height:"100%",width:`${Math.round(bar.v/max*100)}%`,background:bar.c,borderRadius:4}}/>
                      </div>
                      <span style={{fontFamily:"'IBM Plex Mono',monospace",fontSize:12,color:bar.c,textAlign:"right"}}>{fmtEGP(bar.v)}</span>
                    </div>
                  ))}
                  <div style={{display:"flex",flexWrap:"wrap",gap:4,marginTop:8}}>
                    {mEntries.sort((a,b)=>+b.debit-+a.debit).slice(0,8).map((e,i)=>(
                      <span key={i} style={{fontSize:11,background:"var(--bg2)",border:"1px solid var(--border3)",borderRadius:4,padding:"2px 7px",color:"var(--text3)"}}>
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

/* ══════════════════════════════════════════════════════════
   4. CASH CUSTODY
   ══════════════════════════════════════════════════════════ */
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

  const pColor = n=>({
    "Eng Shady":"#38bdf8","Eng Sameh Saied":"#a78bfa",
    "Eng Ahmed Hassan":"#fb923c","Omar Faheem":"#34d399","Ahmed Sultan Sakr":"#facc15"
  }[n]||"var(--text3)");

  return(
    <div style={{display:"grid",gap:14}}>
      <div style={{display:"grid",gridTemplateColumns:"repeat(5,1fr)",gap:8}}>
        {Object.values(persons).sort((a,b)=>b.held-a.held).map(p=>(
          <div key={p.name} className="card" style={{textAlign:"center",padding:"12px 8px",cursor:"pointer",
            border:`2px solid ${selected===p.name?pColor(p.name):"var(--border3)"}`}}
            onClick={()=>setSelected(selected===p.name?"ALL":p.name)}>
            <div style={{fontSize:11,color:pColor(p.name),fontWeight:700,marginBottom:4}}>{p.name}</div>
            <div style={{fontFamily:"'IBM Plex Mono',monospace",fontSize:14,fontWeight:700,color:p.held>0?"#34d399":"var(--text4)"}}>{fmtEGP(p.held)}</div>
            <div style={{fontSize:10,color:"var(--text4)",marginTop:2}}>currently holds · {p.transactions.length} tx</div>
          </div>
        ))}
      </div>
      <div style={{background:"var(--bg2)",border:"1px solid #34d39440",borderRadius:8,padding:"10px 16px",display:"flex",justifyContent:"space-between"}}>
        <span style={{fontSize:13,color:"var(--text2)"}}>Total company cash held by all custodians</span>
        <span style={{fontFamily:"'IBM Plex Mono',monospace",fontSize:16,fontWeight:700,color:"#34d399"}}>{fmtEGP(totalHeld)}</span>
      </div>
      <div className="card" style={{padding:0,overflow:"hidden"}}>
        <div style={{background:"#fb923c15",borderBottom:"2px solid #fb923c",padding:"10px 16px",display:"flex",justifyContent:"space-between",alignItems:"center"}}>
          <span style={{fontSize:13,fontWeight:700,color:"#fb923c"}}>TRANSACTIONS{selected!=="ALL"?` — ${selected}`:""}</span>
          {selected!=="ALL"&&<button onClick={()=>setSelected("ALL")} style={{background:"transparent",border:"1px solid var(--border3)",borderRadius:4,padding:"2px 8px",color:"var(--text3)",cursor:"pointer",fontSize:12}}>Show All</button>}
        </div>
        <div style={{overflowX:"auto"}}>
          <table style={{width:"100%",borderCollapse:"collapse",fontSize:13}}>
            <thead><tr style={{background:"var(--bg2)"}}>
              {["Date","Entry#","Person","Type","Cash Out","Cash Back/Spent","Net","Description"].map(h=>(
                <th key={h} style={{padding:"7px 12px",textAlign:["Cash Out","Cash Back/Spent","Net"].includes(h)?"right":"left",
                  color:"var(--text3)",fontWeight:600,fontSize:12,borderBottom:"1px solid var(--border3)",whiteSpace:"nowrap"}}>{h}</th>
              ))}
            </tr></thead>
            <tbody>
              {selectedTx.map((e,i)=>{
                const net=(+e.debit||0)-(+e.credit||0);
                return(
                  <tr key={i} style={{borderBottom:"1px solid var(--border3)",background:i%2===0?"transparent":"var(--bg1)"}}>
                    <td style={{padding:"6px 12px",fontFamily:"'IBM Plex Mono',monospace",fontSize:12,color:"var(--text3)"}}>{String(e.entry_date).slice(0,10)}</td>
                    <td style={{padding:"6px 12px",fontFamily:"'IBM Plex Mono',monospace",fontSize:12,color:"var(--text4)"}}>{e.entry_no}</td>
                    <td style={{padding:"6px 12px"}}><span style={{color:pColor(e.account_name.trim()),fontWeight:600,fontSize:12}}>{e.account_name.trim()}</span></td>
                    <td style={{padding:"6px 12px"}}><span style={{background:"#fb923c20",color:"#fb923c",padding:"1px 6px",borderRadius:4,fontSize:11}}>{e.entry_type}</span></td>
                    <td style={{padding:"6px 12px",fontFamily:"'IBM Plex Mono',monospace",fontSize:12,textAlign:"right",color:"#f87171"}}>{+e.credit>0.01?fmtEGP(+e.credit):""}</td>
                    <td style={{padding:"6px 12px",fontFamily:"'IBM Plex Mono',monospace",fontSize:12,textAlign:"right",color:"#34d399"}}>{+e.debit>0.01?fmtEGP(+e.debit):""}</td>
                    <td style={{padding:"6px 12px",fontFamily:"'IBM Plex Mono',monospace",fontSize:12,textAlign:"right",color:net>0?"#34d399":"#f87171",fontWeight:600}}>{fmtEGP(Math.abs(net))}</td>
                    <td style={{padding:"6px 12px",color:"var(--text3)",fontSize:12,maxWidth:220,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}} title={e.description}>{e.description}</td>
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

/* ══════════════════════════════════════════════════════════
   5. TAX & SOCIAL INSURANCE
   ══════════════════════════════════════════════════════════ */
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
            <div style={{fontSize:11,color:"var(--text4)",textTransform:"uppercase",letterSpacing:".06em",marginTop:4}}>{k.l}</div>
          </div>
        ))}
      </div>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12}}>
        {Object.values(byAccount).map(a=>(
          <div key={a.name} className="card" style={{padding:0,overflow:"hidden"}}>
            <div style={{background:aColor(a.name)+"18",borderBottom:`2px solid ${aColor(a.name)}`,padding:"10px 14px",display:"flex",justifyContent:"space-between",alignItems:"center"}}>
              <span style={{fontSize:13,fontWeight:700,color:aColor(a.name)}}>{a.name}</span>
              <span style={{fontSize:12,fontWeight:600,color:a.isLiab?"#f87171":"#34d399"}}>
                {a.isLiab?"🔴":""}{!a.isLiab?"🟢":""} {fmtEGP(Math.abs(a.net))}
              </span>
            </div>
            <table style={{width:"100%",borderCollapse:"collapse",fontSize:13}}>
              <thead><tr style={{background:"var(--bg2)"}}>
                {["Month","Debit","Credit","Net"].map(h=>(
                  <th key={h} style={{padding:"6px 12px",textAlign:h==="Month"?"left":"right",color:"var(--text3)",fontSize:12}}>{h}</th>
                ))}
              </tr></thead>
              <tbody>
                {activeMonths.filter(m=>a.byMonth[m]).map((m,i)=>{
                  const mo=a.byMonth[m]; const net=mo.cr-mo.dr;
                  return(<tr key={m} style={{borderBottom:"1px solid var(--border3)",background:i%2===0?"transparent":"var(--bg1)"}}>
                    <td style={{padding:"6px 12px",color:"var(--text2)",fontWeight:500}}>{MO_SHORT[+m]}</td>
                    <td style={{padding:"6px 12px",fontFamily:"'IBM Plex Mono',monospace",fontSize:12,textAlign:"right",color:"#34d399"}}>{mo.dr>0.01?fmtEGP(mo.dr):""}</td>
                    <td style={{padding:"6px 12px",fontFamily:"'IBM Plex Mono',monospace",fontSize:12,textAlign:"right",color:"#f87171"}}>{mo.cr>0.01?fmtEGP(mo.cr):""}</td>
                    <td style={{padding:"6px 12px",fontFamily:"'IBM Plex Mono',monospace",fontSize:12,textAlign:"right",color:net>0?"#f87171":"#34d399",fontWeight:600}}>{fmtEGP(Math.abs(net))}</td>
                  </tr>);
                })}
                <tr style={{background:"var(--bg2)",borderTop:"2px solid var(--border)"}}>
                  <td style={{padding:"7px 12px",fontWeight:700,color:"var(--text0)"}}>TOTAL</td>
                  <td style={{padding:"7px 12px",fontFamily:"'IBM Plex Mono',monospace",fontSize:12,textAlign:"right",color:"#34d399",fontWeight:700}}>{a.totalDr>0.01?fmtEGP(a.totalDr):""}</td>
                  <td style={{padding:"7px 12px",fontFamily:"'IBM Plex Mono',monospace",fontSize:12,textAlign:"right",color:"#f87171",fontWeight:700}}>{a.totalCr>0.01?fmtEGP(a.totalCr):""}</td>
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

/* ══════════════════════════════════════════════════════════
   6. FIXED ASSETS
   ══════════════════════════════════════════════════════════ */
function FixedAssetsView({fixedAssets, loading}) {
  const TODAY = new Date();
  const assetsWithDepr = React.useMemo(()=>fixedAssets.map(a=>{
    const purchased=new Date(a.purchase_date+"T12:00:00");
    const yrs=Math.max(0,(TODAY-purchased)/(365.25*24*3600*1000));
    const annual=+a.cost_egp/+a.useful_life_years;
    const acc=Math.min(+a.cost_egp,annual*yrs);
    const net=Math.max(0,+a.cost_egp-acc);
    return {...a,annual,acc,net,pct:+a.cost_egp>0?(acc/+a.cost_egp*100):0};
  }),[fixedAssets]);

  const byCategory=React.useMemo(()=>{
    const m={};
    assetsWithDepr.forEach(a=>{
      if(!m[a.category]) m[a.category]={cat:a.category,assets:[],cost:0,depr:0,net:0};
      m[a.category].assets.push(a);
      m[a.category].cost+=+a.cost_egp;
      m[a.category].depr+=a.acc;
      m[a.category].net+=a.net;
    });
    return m;
  },[assetsWithDepr]);

  const totCost=assetsWithDepr.reduce((s,a)=>s+(+a.cost_egp),0);
  const totDepr=assetsWithDepr.reduce((s,a)=>s+a.acc,0);
  const totNet=assetsWithDepr.reduce((s,a)=>s+a.net,0);
  const cColor=c=>({
    "Computers & Programs":"#38bdf8","Furniture":"#a78bfa",
    "Aircondition":"#34d399","Decoration & Furnishing":"#fb923c","Electrical Equipment":"#facc15"
  }[c]||"var(--text3)");

  if(loading) return <div style={{textAlign:"center",padding:40,color:"var(--text4)"}}>Loading assets…</div>;
  return(
    <div style={{display:"grid",gap:14}}>
      <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:10}}>
        {[{l:"Total at Cost",v:fmtEGP(totCost),c:"#38bdf8"},{l:"Accumulated Depr.",v:fmtEGP(totDepr),c:"#fb923c"},{l:"Net Book Value",v:fmtEGP(totNet),c:"#34d399"}].map((k,i)=>(
          <div key={i} className="card" style={{textAlign:"center",padding:"14px 8px"}}>
            <div style={{fontFamily:"'IBM Plex Mono',monospace",fontSize:16,fontWeight:700,color:k.c}}>{k.v}</div>
            <div style={{fontSize:11,color:"var(--text4)",textTransform:"uppercase",letterSpacing:".06em",marginTop:4}}>{k.l}</div>
          </div>
        ))}
      </div>
      {Object.values(byCategory).sort((a,b)=>b.cost-a.cost).map(cat=>(
        <div key={cat.cat} className="card" style={{padding:0,overflow:"hidden"}}>
          <div style={{background:cColor(cat.cat)+"15",borderBottom:`2px solid ${cColor(cat.cat)}`,padding:"10px 16px",display:"flex",justifyContent:"space-between"}}>
            <span style={{fontSize:13,fontWeight:700,color:cColor(cat.cat)}}>{cat.cat}</span>
            <span style={{fontFamily:"'IBM Plex Mono',monospace",fontSize:12,color:"var(--text3)"}}>
              {cat.assets.length} items · Cost {fmtEGP(cat.cost)} · Net {fmtEGP(cat.net)}
            </span>
          </div>
          <div style={{overflowX:"auto"}}>
            <table style={{width:"100%",borderCollapse:"collapse",fontSize:13}}>
              <thead><tr style={{background:"var(--bg2)"}}>
                {["Asset","Purchased","Cost","Life","Annual Depr.","Acc. Depr.","Net Book","Worn %"].map(h=>(
                  <th key={h} style={{padding:"7px 12px",textAlign:h==="Asset"||h==="Purchased"?"left":"right",color:"var(--text3)",fontSize:12,whiteSpace:"nowrap"}}>{h}</th>
                ))}
              </tr></thead>
              <tbody>
                {cat.assets.map((a,i)=>(
                  <tr key={i} style={{borderBottom:"1px solid var(--border3)",background:i%2===0?"transparent":"var(--bg1)"}}>
                    <td style={{padding:"7px 12px",color:"var(--text1)"}}>{a.asset_name}</td>
                    <td style={{padding:"7px 12px",fontFamily:"'IBM Plex Mono',monospace",fontSize:12,color:"var(--text3)"}}>{a.purchase_date}</td>
                    <td style={{padding:"7px 12px",fontFamily:"'IBM Plex Mono',monospace",fontSize:12,textAlign:"right",color:"#38bdf8"}}>{fmtEGP(+a.cost_egp)}</td>
                    <td style={{padding:"7px 12px",fontFamily:"'IBM Plex Mono',monospace",fontSize:12,textAlign:"right",color:"var(--text3)"}}>{a.useful_life_years}y</td>
                    <td style={{padding:"7px 12px",fontFamily:"'IBM Plex Mono',monospace",fontSize:12,textAlign:"right",color:"var(--text2)"}}>{fmtEGP(a.annual)}/yr</td>
                    <td style={{padding:"7px 12px",fontFamily:"'IBM Plex Mono',monospace",fontSize:12,textAlign:"right",color:"#fb923c"}}>{fmtEGP(a.acc)}</td>
                    <td style={{padding:"7px 12px",fontFamily:"'IBM Plex Mono',monospace",fontSize:13,textAlign:"right",color:"#34d399",fontWeight:600}}>{fmtEGP(a.net)}</td>
                    <td style={{padding:"7px 12px",textAlign:"right"}}>
                      <div style={{display:"flex",alignItems:"center",justifyContent:"flex-end",gap:6}}>
                        <div style={{width:50,height:6,background:"var(--bg2)",borderRadius:3,overflow:"hidden"}}>
                          <div style={{height:"100%",width:`${Math.min(100,a.pct).toFixed(0)}%`,background:cColor(cat.cat),borderRadius:3}}/>
                        </div>
                        <span style={{fontFamily:"'IBM Plex Mono',monospace",fontSize:11,color:"var(--text3)",minWidth:35}}>{a.pct.toFixed(1)}%</span>
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

/* ══════════════════════════════════════════════════════════
   7. FINANCE REPORTS — Monthly PDF-ready summary
   ══════════════════════════════════════════════════════════ */
function FinanceReports({journalEntries, fixedAssets, staff, expenses, egpRate}) {
  const [reportType, setReportType] = React.useState("pl");
  const [repMonth,   setRepMonth]   = React.useState(new Date().getMonth()||1);
  const [repYear,    setRepYear]    = React.useState(2026);

  const MONTHS_ = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];

  // ── P&L STATEMENT (journal-based, EGP)
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

  // ── PAYROLL SUMMARY (from staff table + journal accruals by month)
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

  // ── CASH FLOW (simplified — operating + investing)
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
        `P&L Statement — Year to Date ${repYear}`,
        [`<div class="section"><div class="st">Profit & Loss Statement — Year to Date (EGP)</div>
          <div style="font-size:12px;color:#64748b;margin-bottom:12px;text-align:center">Enevo Egypt LLC — All periods up to ${now}</div>
          <table><tbody>
            <tr style="background:#f0fdf4"><td colspan="2" style="padding:8px 16px;font-weight:700;color:#16a34a;font-size:13px">REVENUE</td></tr>
            <tr><td style="padding:7px 16px 7px 28px">Service Revenue — Enevo Group S.R.L.</td><td style="text-align:right;font-family:'IBM Plex Mono',monospace;color:#34d399;font-weight:600">${fmtEGP(plReport.rev)}</td></tr>
            <tr style="background:#f0fdf4"><td style="padding:8px 16px;font-weight:700;color:#16a34a">TOTAL REVENUE</td><td style="text-align:right;font-family:'IBM Plex Mono',monospace;font-weight:700;color:#34d399">${fmtEGP(plReport.rev)}</td></tr>
            <tr style="background:#fff7f0"><td colspan="2" style="padding:8px 16px;font-weight:700;color:#dc2626;font-size:13px">EXPENSES</td></tr>
            ${expRows}
            <tr style="background:#fff7f0"><td style="padding:8px 16px;font-weight:700;color:#dc2626">TOTAL EXPENSES</td><td style="text-align:right;font-family:'IBM Plex Mono',monospace;font-weight:700;color:#f87171">${fmtEGP(plReport.totExp)}</td></tr>
            <tr style="background:${plReport.net>=0?"#f0fdf4":"#fff0f0"}">
              <td style="padding:12px 16px;font-weight:700;font-size:14px;color:${plReport.net>=0?"#16a34a":"#dc2626"}">NET ${plReport.net>=0?"PROFIT":"LOSS"}</td>
              <td style="text-align:right;font-family:'IBM Plex Mono',monospace;font-weight:700;font-size:15px;color:${plReport.net>=0?"#16a34a":"#dc2626"}">${fmtEGP(plReport.net)}</td>
            </tr>
          </tbody></table></div>`],
        `Financial Report · P&L Statement · ${now} · CONFIDENTIAL`
      );
    } else if(reportType==="payroll"){
      const accrualSection = payrollReport.grossCost+payrollReport.grossAdmin > 0
        ? `<div class="section"><div class="st">Payroll Accrual Summary — ${mo} ${repYear}</div>
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
        ? `<div class="section"><div class="st">Staff Roster — ${mo} ${repYear} (${payrollReport.activeThisMonth.length} active)</div>
           <table>
             <thead><tr><th>Name</th><th>Department</th><th>Role</th><th style="text-align:right">USD Salary</th><th style="text-align:right">EGP Salary</th></tr></thead>
             <tbody>${payrollReport.activeThisMonth.map((s,i)=>`
               <tr style="${i%2!==0?"background:#f8fafc":""}">
                 <td style="padding:6px 12px;font-weight:600">${s.name||""}</td>
                 <td style="padding:6px 12px;color:#64748b;font-size:12px">${s.department||""}</td>
                 <td style="padding:6px 12px;color:#64748b;font-size:12px">${s.role||""}</td>
                 <td style="text-align:right;padding:6px 12px;font-family:'IBM Plex Mono',monospace;color:#38bdf8;font-size:12px">${s.salary_usd>0?`$${(+s.salary_usd).toLocaleString("en-US",{minimumFractionDigits:2})}`:"—"}</td>
                 <td style="text-align:right;padding:6px 12px;font-family:'IBM Plex Mono',monospace;color:#fb923c;font-size:12px">${s.salary_egp>0?fmtEGP(+s.salary_egp):"—"}</td>
               </tr>`).join("")}
             </tbody>
           </table></div>`
        : "";
      generatePDF(
        `Payroll Summary — ${mo} ${repYear}`,
        [accrualSection, staffSection],
        `Payroll Report · ${mo} ${repYear} · CONFIDENTIAL`
      );
    } else if(reportType==="cashflow"){
      generatePDF(
        `Cash Flow Statement — ${now}`,
        [`<div class="section"><div class="st">Cash Flow Statement (Simplified)</div>
          <div style="font-size:12px;color:#64748b;margin-bottom:12px">Enevo Egypt LLC — Based on all journal entries</div>
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
        `Cash Flow Statement · ${now} · CONFIDENTIAL`
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
        return `<div class="section"><div class="st">💵 ${p.name} — Balance: ${fmtEGP(p.totalOut-p.totalBack)}</div>
          <table>
            <thead><tr><th>Date</th><th>Entry#</th><th>Description</th><th style="text-align:right">Cash Out</th><th style="text-align:right">Back/Spent</th><th style="text-align:right">Running Bal.</th></tr></thead>
            <tbody>${rows}</tbody>
          </table></div>`;
      });
      if(custodySections.length===0) custodySections.push(`<div class="section"><p style="color:#94a3b8;text-align:center;padding:20px 0">No custody entries found in journal.</p></div>`);
      generatePDF(`Custody Ledger Report`, custodySections, `Cash Custody · ${now} · CONFIDENTIAL`);
    } else if(reportType==="assets"){
      const TODAY=new Date();
      const rows=fixedAssets.map((a,i)=>{
        const purchased=new Date(a.purchase_date+"T12:00:00");
        const yrs=Math.max(0,(TODAY-purchased)/(365.25*24*3600*1000));
        const annual=+a.cost_egp/+a.useful_life_years;
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
          <td style="text-align:center;padding:6px 10px;font-size:11px;color:${done?"#f87171":"#64748b"}">${done?"✓ FULLY":fullyDepr.toLocaleDateString("en-GB",{year:"numeric",month:"short"})}</td>
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
        `Fixed Assets Schedule — ${now}`,
        [`<div class="section"><div class="st">Fixed Assets Depreciation Schedule — Straight-Line Method</div>
          <div style="font-size:11px;color:#64748b;margin-bottom:10px">Enevo Egypt LLC · As of ${now}</div>
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
        `Asset Depreciation Report · ${now} · CONFIDENTIAL`
      );
    }
  };

  return(
    <div style={{display:"grid",gap:14}}>
      {/* Report selector + filter + export */}
      <div style={{display:"flex",gap:8,flexWrap:"wrap",alignItems:"center"}}>
        <button style={btnStyle("pl")}     onClick={()=>setReportType("pl")}>📊 P&L Statement</button>
        <button style={btnStyle("payroll")}onClick={()=>setReportType("payroll")}>👥 Payroll Summary</button>
        <button style={btnStyle("cashflow")}onClick={()=>setReportType("cashflow")}>💧 Cash Flow</button>
        <button style={btnStyle("custody")}onClick={()=>setReportType("custody")}>💵 Custody Ledger</button>
        <button style={btnStyle("assets")} onClick={()=>setReportType("assets")}>🏗 Asset Schedule</button>
        <div style={{marginLeft:"auto",display:"flex",gap:6,alignItems:"center"}}>
          <span style={{fontSize:12,color:"var(--text4)"}}>Filter:</span>
          <select value={repMonth} onChange={e=>setRepMonth(+e.target.value)}
            style={{background:"var(--bg1)",border:"1px solid var(--border3)",borderRadius:6,padding:"5px 8px",color:"var(--text0)",fontSize:13}}>
            {MONTHS_.map((m,i)=><option key={i} value={i+1}>{m}</option>)}
          </select>
          <select value={repYear} onChange={e=>setRepYear(+e.target.value)}
            style={{background:"var(--bg1)",border:"1px solid var(--border3)",borderRadius:6,padding:"5px 8px",color:"var(--text0)",fontSize:13}}>
            {[2025,2026,2027].map(y=><option key={y}>{y}</option>)}
          </select>
          <button className="bp" onClick={handleExport} style={{padding:"6px 14px",fontSize:13,marginLeft:4}}>⬇ Export PDF</button>
        </div>
      </div>

      {/* P&L STATEMENT */}
      {reportType==="pl" && (
        <div className="card">
          <div style={{textAlign:"center",marginBottom:20}}>
            <div style={{fontSize:16,fontWeight:700,color:"var(--text0)"}}>PROFIT & LOSS STATEMENT</div>
            <div style={{fontSize:13,color:"var(--text4)"}}>Enevo Egypt LLC — Year to Date (EGP)</div>
          </div>
          <table style={{width:"100%",borderCollapse:"collapse",fontSize:13}}>
            <tbody>
              <tr style={{background:"var(--bg2)"}}><td colSpan={2} style={{padding:"8px 16px",fontWeight:700,color:"#34d399",fontSize:13}}>REVENUE</td></tr>
              <tr style={{borderBottom:"1px solid var(--border3)"}}><td style={{padding:"7px 16px 7px 28px",color:"var(--text2)"}}>Service Revenue — Enevo Group S.R.L.</td><td style={{padding:"7px 16px",textAlign:"right",fontFamily:"'IBM Plex Mono',monospace",color:"#34d399",fontWeight:600}}>{fmtEGP(plReport.rev)}</td></tr>
              <tr><td style={{padding:"8px 16px",fontWeight:700,color:"#34d399"}}>TOTAL REVENUE</td><td style={{padding:"8px 16px",textAlign:"right",fontFamily:"'IBM Plex Mono',monospace",fontWeight:700,color:"#34d399"}}>{fmtEGP(plReport.rev)}</td></tr>

              <tr style={{background:"var(--bg2)"}}><td colSpan={2} style={{padding:"8px 16px",fontWeight:700,color:"#f87171",fontSize:13}}>EXPENSES</td></tr>
              {["Operating Costs","Administrative expenses"].map(cat=>{
                const items = plReport.expenses.filter(e=>e.cat===cat);
                if(!items.length) return null;
                return [
                  <tr key={cat} style={{background:"var(--bg1)"}}><td colSpan={2} style={{padding:"6px 16px 6px 20px",color:"var(--text4)",fontSize:12,fontStyle:"italic"}}>{cat}</td></tr>,
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
              <div style={{fontSize:16,fontWeight:700,color:"var(--text0)"}}>PAYROLL SUMMARY — {MONTHS_[repMonth-1]} {repYear}</div>
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
              <div style={{fontSize:13,fontWeight:700,color:"var(--text2)",marginBottom:10}}>STAFF ROSTER — {MONTHS_[repMonth-1]} {repYear} ({payrollReport.activeThisMonth.length} active)</div>
              <table style={{width:"100%",borderCollapse:"collapse",fontSize:13}}>
                <thead><tr style={{background:"var(--bg2)"}}>
                  {["Name","Department","Role","USD Salary","EGP Salary"].map(h=>(
                    <th key={h} style={{padding:"6px 12px",textAlign:["USD Salary","EGP Salary"].includes(h)?"right":"left",color:"var(--text3)",fontSize:12}}>{h}</th>
                  ))}
                </tr></thead>
                <tbody>
                  {payrollReport.activeThisMonth.map((s,i)=>(
                    <tr key={i} style={{borderBottom:"1px solid var(--border3)",background:i%2===0?"transparent":"var(--bg1)"}}>
                      <td style={{padding:"6px 12px",color:"var(--text1)",fontWeight:500}}>{s.name}</td>
                      <td style={{padding:"6px 12px",color:"var(--text3)"}}>{s.department}</td>
                      <td style={{padding:"6px 12px",color:"var(--text3)",fontSize:12}}>{s.role}</td>
                      <td style={{padding:"6px 12px",fontFamily:"'IBM Plex Mono',monospace",fontSize:12,textAlign:"right",color:"#38bdf8"}}>{s.salary_usd>0?`$${(+s.salary_usd).toLocaleString("en-US",{minimumFractionDigits:2})}`:"-"}</td>
                      <td style={{padding:"6px 12px",fontFamily:"'IBM Plex Mono',monospace",fontSize:12,textAlign:"right",color:"#fb923c"}}>{s.salary_egp>0?fmtEGP(+s.salary_egp):"-"}</td>
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
            <div style={{fontSize:13,color:"var(--text4)"}}>Enevo Egypt LLC — Based on Journal Entries</div>
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
                  <span style={{fontWeight:700,color:"var(--text0)",fontSize:14}}>💵 {p.name}</span>
                  <span style={{fontFamily:"'IBM Plex Mono',monospace",fontSize:13,color:"#34d399",fontWeight:700}}>Balance: {fmtEGP(p.totalOut-p.totalBack)}</span>
                </div>
                <table style={{width:"100%",borderCollapse:"collapse",fontSize:13}}>
                  <thead><tr style={{background:"var(--bg2)"}}>
                    {["Date","Entry#","Description","Cash Out","Cash Spent/Returned","Running Balance"].map(h=>(
                      <th key={h} style={{padding:"6px 12px",textAlign:["Cash Out","Cash Spent/Returned","Running Balance"].includes(h)?"right":"left",color:"var(--text3)",fontSize:12}}>{h}</th>
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
                        <td style={{padding:"6px 12px",fontFamily:"'IBM Plex Mono',monospace",fontSize:12,color:"var(--text3)"}}>{String(e.entry_date).slice(0,10)}</td>
                        <td style={{padding:"6px 12px",fontFamily:"'IBM Plex Mono',monospace",fontSize:12,color:"var(--text4)"}}>{e.entry_no}</td>
                        <td style={{padding:"6px 12px",color:"var(--text2)",fontSize:12,maxWidth:200,overflow:"hidden",textOverflow:"ellipsis"}}>{e.description}</td>
                        <td style={{padding:"6px 12px",fontFamily:"'IBM Plex Mono',monospace",fontSize:12,textAlign:"right",color:"#f87171"}}>{+e.credit>0.01?fmtEGP(+e.credit):""}</td>
                        <td style={{padding:"6px 12px",fontFamily:"'IBM Plex Mono',monospace",fontSize:12,textAlign:"right",color:"#34d399"}}>{+e.debit>0.01?fmtEGP(+e.debit):""}</td>
                        <td style={{padding:"6px 12px",fontFamily:"'IBM Plex Mono',monospace",fontSize:12,textAlign:"right",color:e.runBal>0?"#34d399":"var(--text3)",fontWeight:600}}>{fmtEGP(e.runBal)}</td>
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
            <div style={{fontSize:12,color:"var(--text4)",marginTop:2}}>Enevo Egypt LLC — Straight-Line Method — As of {new Date().toLocaleDateString("en-EG")}</div>
          </div>
          <div style={{overflowX:"auto"}}>
            <table style={{width:"100%",borderCollapse:"collapse",fontSize:13}}>
              <thead><tr style={{background:"var(--bg2)"}}>
                {["Asset","Category","Purchased","Cost","Life","Annual Depr.","Acc. Depr.","Net Book Value","Fully Depr."].map(h=>(
                  <th key={h} style={{padding:"7px 12px",textAlign:["Cost","Annual Depr.","Acc. Depr.","Net Book Value"].includes(h)?"right":"left",color:"var(--text3)",fontSize:12,whiteSpace:"nowrap"}}>{h}</th>
                ))}
              </tr></thead>
              <tbody>
                {(()=>{
                  const TODAY=new Date();
                  return fixedAssets.map((a,i)=>{
                    const purchased=new Date(a.purchase_date+"T12:00:00");
                    const yrs=Math.max(0,(TODAY-purchased)/(365.25*24*3600*1000));
                    const annual=+a.cost_egp/+a.useful_life_years;
                    const acc=Math.min(+a.cost_egp,annual*yrs);
                    const net=Math.max(0,+a.cost_egp-acc);
                    const fullyDepr=new Date(purchased.getTime()+a.useful_life_years*365.25*24*3600*1000);
                    return(
                      <tr key={i} style={{borderBottom:"1px solid var(--border3)",background:i%2===0?"transparent":"var(--bg1)"}}>
                        <td style={{padding:"6px 12px",color:"var(--text1)",fontWeight:500}}>{a.asset_name}</td>
                        <td style={{padding:"6px 12px",color:"var(--text3)",fontSize:12}}>{a.category}</td>
                        <td style={{padding:"6px 12px",fontFamily:"'IBM Plex Mono',monospace",fontSize:12,color:"var(--text4)"}}>{a.purchase_date}</td>
                        <td style={{padding:"6px 12px",fontFamily:"'IBM Plex Mono',monospace",fontSize:12,textAlign:"right",color:"#38bdf8"}}>{fmtEGP(+a.cost_egp)}</td>
                        <td style={{padding:"6px 12px",fontFamily:"'IBM Plex Mono',monospace",fontSize:12,textAlign:"right",color:"var(--text3)"}}>{a.useful_life_years}y</td>
                        <td style={{padding:"6px 12px",fontFamily:"'IBM Plex Mono',monospace",fontSize:12,textAlign:"right",color:"var(--text2)"}}>{fmtEGP(annual)}</td>
                        <td style={{padding:"6px 12px",fontFamily:"'IBM Plex Mono',monospace",fontSize:12,textAlign:"right",color:"#fb923c"}}>{fmtEGP(acc)}</td>
                        <td style={{padding:"6px 12px",fontFamily:"'IBM Plex Mono',monospace",fontSize:13,textAlign:"right",color:net>0?"#34d399":"var(--text4)",fontWeight:600}}>{fmtEGP(net)}</td>
                        <td style={{padding:"6px 12px",fontFamily:"'IBM Plex Mono',monospace",fontSize:11,color:"var(--text4)"}}>{fullyDepr.toLocaleDateString("en-EG")}</td>
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

/* ══════════════════════════════════════════════════════════
   8. ACCOUNTANT WORKFLOW GUIDE — How to post entries
   ══════════════════════════════════════════════════════════ */
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
    {id:"monthly",   label:"📅 Monthly Close"},
    {id:"custody",   label:"💵 Custody Expense"},
    {id:"salary",    label:"👥 Salary Accrual"},
    {id:"revenue",   label:"💰 Revenue Invoice"},
    {id:"asset",     label:"🏗 Asset Purchase"},
  ];

  return(
    <div style={{display:"grid",gap:14}}>
      <div style={{background:"#38bdf810",border:"1px solid #38bdf840",borderRadius:8,padding:"12px 16px"}}>
        <div style={{fontSize:14,fontWeight:700,color:"#38bdf8",marginBottom:4}}>📖 Accountant Workflow Guide — How to use the Journal</div>
        <div style={{fontSize:13,color:"var(--text2)"}}>Next suggested Entry No: <strong style={{color:"#38bdf8"}}>#{nextEntryNo}</strong> · Last salary posted: {MO[lastPostedMonth]||"none"} · Next to post: {MO[nextMonth]}</div>
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
            {n:1,title:"Post Salary Accrual",desc:"Go to 📒 Journal → Post Entry Line. Use entry type 'Accrued Salaries'. Must post 8 lines per month (see Salary Accrual guide).",done:postedMonths.includes(nextMonth)},
            {n:2,title:"Post Custody Expenses",desc:"For every petty cash receipt, post a line: Dr=expense account, Cr=Cash Custody (the person who paid). Use entry type 'Custody'.",done:false},
            {n:3,title:"Post Revenue Invoice",desc:"When invoice is issued to Enevo Group S.R.L., post Dr=Customers, Cr=Revenue. Enter USD amount + exchange rate.",done:false},
            {n:4,title:"Verify Journal Balance",desc:"In 📒 Journal, filter by month. Check Debit = Credit strip at top. Must be ✓ Balanced.",done:false},
            {n:5,title:"Review Balance Sheet",desc:"Check ⚖ Balance Sheet — Assets = Liabilities + Equity (+ current year profit). No unexplained gaps.",done:false},
            {n:6,title:"Review Tax Position",desc:"Check 🧾 Tax tab — confirm payroll tax and social insurance liabilities match payroll accrual.",done:false},
          ].map(item=>(
            <div key={item.n} style={{display:"flex",gap:12,padding:"10px 0",borderBottom:"1px solid var(--border3)",alignItems:"flex-start"}}>
              <div style={{width:28,height:28,borderRadius:"50%",background:item.done?"#34d39920":"var(--bg2)",border:`2px solid ${item.done?"#34d399":"var(--border3)"}`,display:"flex",alignItems:"center",justifyContent:"center",color:item.done?"#34d399":"var(--text4)",fontWeight:700,fontSize:13,flexShrink:0}}>
                {item.done?"✓":item.n}
              </div>
              <div>
                <div style={{fontWeight:600,color:"var(--text1)",fontSize:13,marginBottom:2}}>{item.title}</div>
                <div style={{fontSize:12,color:"var(--text3)"}}>{item.desc}</div>
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
              {step:"Open 📒 Journal → click + Post Entry Line",detail:""},
              {step:"Entry No",detail:`${nextEntryNo} (next available)`},
              {step:"Date",detail:"Date on the receipt"},
              {step:"Entry Type",detail:"Custody"},
              {step:"Line 1 — Expense side",detail:"Account: Kitchen Supplies · Main: Administrative expenses · Debit: 3,334.50 · Credit: 0"},
              {step:"Line 2 — Custody side",detail:"Account: Omar Faheem · Main: Cash Custody · Debit: 0 · Credit: 3,334.50"},
              {step:"Description",detail:"Purchasing kitchen supplies"},
              {step:"⚠ Verify balance",detail:"Both lines must have equal Debit/Credit total for entry to balance"},
            ].map((r,i)=>(
              <div key={i} style={{display:"grid",gridTemplateColumns:"200px 1fr",gap:8,borderBottom:"1px solid var(--border3)",padding:"7px 0"}}>
                <span style={{fontWeight:600,color:"var(--text2)",fontSize:13}}>{r.step}</span>
                <span style={{fontSize:13,color:"var(--text3)",fontFamily:r.detail.includes(":")?"'IBM Plex Mono',monospace":"inherit"}}>{r.detail}</span>
              </div>
            ))}
          </div>
          <div style={{marginTop:14,background:"#fb923c15",border:"1px solid #fb923c40",borderRadius:6,padding:"10px 14px",fontSize:12,color:"#fb923c"}}>
            💡 If expense was in USD: Enter USD Amount and Exchange Rate in the USD section. The EGP equivalent auto-fills the Debit field. The system stores both USD and EGP for the record.
          </div>
        </div>
      )}

      {/* SALARY ACCRUAL GUIDE */}
      {step==="salary" && (
        <div className="card">
          <div style={{fontSize:15,fontWeight:700,color:"var(--text0)",marginBottom:4}}>How to Post Monthly Salary Accrual</div>
          <div style={{fontSize:12,color:"var(--text4)",marginBottom:14}}>Based on actual payroll data from Enevo Excel. Post 8 lines under the SAME Entry No.</div>
          <div style={{background:"var(--bg2)",borderRadius:6,padding:"12px 16px",marginBottom:12,fontSize:13,color:"var(--text2)"}}>
            <strong>Staff table total EGP salary:</strong> {fmtEGP(totalSalaryEGP)} / month · <strong>{activeStaff.length} active staff</strong>
          </div>
          <div style={{overflowX:"auto"}}>
            <table style={{width:"100%",borderCollapse:"collapse",fontSize:13}}>
              <thead><tr style={{background:"var(--bg2)"}}>
                {["#","Account","Main Account","Statement","Dr","Cr","Notes"].map(h=>(
                  <th key={h} style={{padding:"6px 10px",textAlign:["Dr","Cr"].includes(h)?"right":"left",color:"var(--text3)",fontSize:12}}>{h}</th>
                ))}
              </tr></thead>
              <tbody>
                {[
                  {n:1,acct:"Salaries-Cost",main:"Operating Costs",stmt:"P&L",dr:"Cost staff gross",cr:"—",note:"Dr side: total gross for engineers/leads"},
                  {n:2,acct:"Social Insurance-Cost",main:"Operating Costs",stmt:"P&L",dr:"SI cost staff",cr:"—",note:"24.75% of cost staff gross"},
                  {n:3,acct:"Salaries-Administrative",main:"Administrative expenses",stmt:"P&L",dr:"Admin gross",cr:"—",note:"Dr side: admin/management gross"},
                  {n:4,acct:"Social Insurance-Administrative",main:"Administrative expenses",stmt:"P&L",dr:"SI admin",cr:"—",note:"24.75% of admin gross"},
                  {n:5,acct:"Accrued Salaries",main:"Accrued Expenses",stmt:"BS",dr:"—",cr:"Net payable",note:"Cr: total gross − tax − SI"},
                  {n:6,acct:"Payroll Tax",main:"Tax and Social Insurance Authority",stmt:"BS",dr:"—",cr:"Tax amount",note:"Per Egyptian income tax brackets"},
                  {n:7,acct:"Social Insurance Authority",main:"Tax and Social Insurance Authority",stmt:"BS",dr:"—",cr:"SI amount",note:"Employee portion (11.25%)"},
                  {n:8,acct:"Martyrs Families Fund",main:"Tax and Social Insurance Authority",stmt:"BS",dr:"—",cr:"MFF amount",note:"Small fixed deduction"},
                ].map(r=>(
                  <tr key={r.n} style={{borderBottom:"1px solid var(--border3)"}}>
                    <td style={{padding:"6px 10px",color:"var(--text4)",fontFamily:"'IBM Plex Mono',monospace"}}>{r.n}</td>
                    <td style={{padding:"6px 10px",color:"var(--text1)",fontWeight:500,fontSize:12}}>{r.acct}</td>
                    <td style={{padding:"6px 10px",color:"var(--text3)",fontSize:12}}>{r.main}</td>
                    <td style={{padding:"6px 10px"}}>
                      <span style={{fontSize:10,color:r.stmt==="BS"?"#38bdf8":"#a78bfa",fontWeight:700,background:r.stmt==="BS"?"#38bdf820":"#a78bfa20",padding:"1px 5px",borderRadius:3}}>{r.stmt}</span>
                    </td>
                    <td style={{padding:"6px 10px",color:"#34d399",fontSize:12,textAlign:"right"}}>{r.dr}</td>
                    <td style={{padding:"6px 10px",color:"#f87171",fontSize:12,textAlign:"right"}}>{r.cr}</td>
                    <td style={{padding:"6px 10px",color:"var(--text4)",fontSize:11}}>{r.note}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div style={{marginTop:12,background:"#a78bfa15",border:"1px solid #a78bfa40",borderRadius:6,padding:"10px 14px",fontSize:12,color:"#a78bfa"}}>
            💡 The Payroll Report (under 📋 Reports) shows you last month's posted amounts to use as reference. Compare staff table salaries to the accrual each month.
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
            {step:"Line 1 — Receivable",detail:"Account: Enevo Group S.R.L. · Main: Customers · BS · Debit: EGP amount · Credit: 0"},
            {step:"Line 2 — Revenue",detail:"Account: Revenue · Main: Revenue · P&L · Debit: 0 · Credit: EGP amount"},
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
          <div style={{fontSize:12,color:"var(--text3)",marginBottom:12}}>Step 1 — Post Journal Entry (Fixed Assets + Custody):</div>
          {[
            {step:"Line 1",detail:"Account: Computers and Programs · Main: Fixed Assets · BS · Debit: 273,600 · Credit: 0"},
            {step:"Line 2",detail:"Account: Eng Shady · Main: Cash Custody · BS · Debit: 273,600 · Credit: 0"},
          ].map((r,i)=>(
            <div key={i} style={{display:"grid",gridTemplateColumns:"80px 1fr",gap:8,borderBottom:"1px solid var(--border3)",padding:"7px 0"}}>
              <span style={{fontWeight:600,color:"var(--text2)",fontSize:13}}>{r.step}</span>
              <span style={{fontSize:13,color:"var(--text3)",fontFamily:"'IBM Plex Mono',monospace",fontSize:12}}>{r.detail}</span>
            </div>
          ))}
          <div style={{fontSize:12,color:"var(--text3)",margin:"12px 0 8px"}}>Step 2 — Add to Fixed Asset Register (contact admin to add row to finance_fixed_assets table with asset name, category, cost, purchase date, useful life).</div>
          <div style={{background:"#34d39915",border:"1px solid #34d39940",borderRadius:6,padding:"10px 14px",fontSize:12,color:"#34d399"}}>
            ✅ The 🏗 Fixed Assets tab calculates depreciation automatically from the asset register. No manual entry needed for depreciation — it's calculated in real-time.
          </div>
        </div>
      )}
    </div>
  );
}



/* ════════════════════════════════════════════════════════
   FINANCE TAB — main container
   ════════════════════════════════════════════════════════ */
/* ══════════════════════════════════════════════════════════
   ACTIVITY LOG TAB — admin only
   ══════════════════════════════════════════════════════════ */
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

  const filtered = React.useMemo(()=>{
    setPage(0);
    return source.filter(l=>{
      if(modFilter!=="ALL"  && l.module!==modFilter)    return false;
      if(actFilter!=="ALL"  && l.action!==actFilter)    return false;
      if(userFilter!=="ALL" && l.user_name!==userFilter) return false;
      if(dateFrom && l.created_at < dateFrom)           return false;
      if(dateTo   && l.created_at > dateTo+"T23:59:59") return false;
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
    <div style={{display:"grid",gap:12}}>

      {/* ── Tabs: Live vs Archive ── */}
      <div style={{display:"flex",gap:0,background:"var(--bg2)",borderRadius:8,padding:4,width:"fit-content"}}>
        {[
          {id:"live",    label:`📋 Live Log (${activityLog.length})`},
          {id:"archive", label:`🗄 Archive (${archiveLog.length})`},
        ].map(t=>(
          <button key={t.id} className={`atab ${tab===t.id?"a":""}`} onClick={()=>{setTab(t.id);resetFilters();setPage(0);}}>
            {t.label}
          </button>
        ))}
      </div>

      {/* ── Archive controls (shown when on Live tab) ── */}
      {tab==="live"&&(
        <div style={{background:"var(--bg2)",border:"1px solid var(--border3)",borderRadius:8,padding:"12px 16px",display:"flex",gap:12,alignItems:"center",flexWrap:"wrap"}}>
          <span style={{fontSize:13,color:"var(--text2)",fontWeight:600}}>🗄 Archive Management</span>
          <span style={{fontSize:12,color:"var(--text4)"}}>Move entries older than</span>
          <select value={retentionDays} onChange={e=>setRetentionDays(+e.target.value)}
            style={{background:"var(--bg1)",border:"1px solid var(--border3)",borderRadius:5,padding:"4px 8px",color:"var(--text0)",fontSize:13}}>
            {[30,60,90,180].map(d=><option key={d} value={d}>{d} days</option>)}
          </select>
          <span style={{fontSize:12,color:"var(--text4)"}}>to archive</span>
          <button onClick={onArchive}
            style={{background:"#f8711820",border:"1px solid #f8711840",borderRadius:6,padding:"5px 14px",color:"#f87171",cursor:"pointer",fontSize:13,fontWeight:600}}>
            ⬆ Archive Now
          </button>
          <span style={{fontSize:11,color:"var(--text4)",marginLeft:"auto"}}>
            Archive keeps data forever · Live table stays fast · Export CSV to download either
          </span>
          <button onClick={onPruneArchive}
            style={{background:"#f8711810",border:"1px solid #f8711830",borderRadius:6,padding:"5px 12px",color:"#f87171",cursor:"pointer",fontSize:12,opacity:0.8}}>
            🗑 Prune Archive &gt;1yr
          </button>
        </div>
      )}

      {/* ── Archive load prompt ── */}
      {tab==="archive"&&!archiveLoaded&&!archiveLoading&&(
        <div style={{textAlign:"center",padding:24,background:"var(--bg2)",borderRadius:8,border:"1px solid var(--border3)"}}>
          <div style={{fontSize:14,color:"var(--text2)",marginBottom:10}}>Archive not loaded — kept separate to keep the UI fast.</div>
          <button className="bp" onClick={onLoadArchive}>Load Archive Data</button>
        </div>
      )}
      {tab==="archive"&&archiveLoaded&&archiveLog.length===0&&!archiveLoading&&(
        <div style={{textAlign:"center",padding:40,color:"var(--text4)"}}>No archived entries yet.</div>
      )}
      {tab==="archive"&&archiveLoading&&(
        <div style={{textAlign:"center",padding:24,color:"var(--text4)"}}>Loading archive…</div>
      )}

      {/* ── Toolbar ── */}
      {(tab==="live"||(tab==="archive"&&archiveLog.length>0))&&(
      <div style={{display:"flex",gap:8,flexWrap:"wrap",alignItems:"center"}}>
        <input placeholder="🔍 Search…" value={search} onChange={e=>setSearch(e.target.value)}
          style={{background:"var(--bg2)",border:"1px solid var(--border3)",borderRadius:6,padding:"6px 10px",color:"var(--text0)",fontSize:13,width:190}}/>
        <select value={modFilter} onChange={e=>setModFilter(e.target.value)}
          style={{background:"var(--bg1)",border:"1px solid var(--border3)",borderRadius:6,padding:"6px 10px",color:"var(--text0)",fontSize:13}}>
          <option value="ALL">All Modules</option>
          {modules.filter(m=>m!=="ALL").map(m=><option key={m}>{m}</option>)}
        </select>
        <select value={actFilter} onChange={e=>setActFilter(e.target.value)}
          style={{background:"var(--bg1)",border:"1px solid var(--border3)",borderRadius:6,padding:"6px 10px",color:"var(--text0)",fontSize:13}}>
          <option value="ALL">All Actions</option>
          {actions.filter(a=>a!=="ALL").map(a=><option key={a}>{a}</option>)}
        </select>
        <select value={userFilter} onChange={e=>setUserFilter(e.target.value)}
          style={{background:"var(--bg1)",border:"1px solid var(--border3)",borderRadius:6,padding:"6px 10px",color:"var(--text0)",fontSize:13}}>
          <option value="ALL">All Users</option>
          {users.filter(u=>u!=="ALL").map(u=><option key={u}>{u}</option>)}
        </select>
        <input type="date" value={dateFrom} onChange={e=>setDateFrom(e.target.value)}
          title="From date"
          style={{background:"var(--bg1)",border:"1px solid var(--border3)",borderRadius:6,padding:"5px 8px",color:"var(--text0)",fontSize:13}}/>
        <input type="date" value={dateTo} onChange={e=>setDateTo(e.target.value)}
          title="To date"
          style={{background:"var(--bg1)",border:"1px solid var(--border3)",borderRadius:6,padding:"5px 8px",color:"var(--text0)",fontSize:13}}/>
        {hasFilters&&<button onClick={resetFilters}
          style={{background:"transparent",border:"1px solid var(--border3)",borderRadius:6,padding:"5px 10px",color:"var(--text3)",cursor:"pointer",fontSize:12}}>✕ Clear</button>}
        <span style={{fontSize:12,color:"var(--text4)"}}>{filtered.length} of {source.length} events</span>
        <div style={{marginLeft:"auto",display:"flex",gap:6}}>
          {tab==="live"&&<button onClick={onRefresh}
            style={{background:"var(--bg2)",border:"1px solid var(--border3)",borderRadius:6,padding:"6px 12px",color:"var(--text2)",cursor:"pointer",fontSize:13}}>
            ↻ Refresh
          </button>}
          <button className="bp" onClick={exportCSV} style={{padding:"6px 14px",fontSize:13}}>
            ⬇ Export CSV
          </button>
        </div>
      </div>
      )}

      {/* ── KPI strip (live only) ── */}
      {tab==="live"&&(
        <div style={{display:"grid",gridTemplateColumns:"repeat(5,1fr)",gap:8}}>
          {[
            {l:"Live Events",  v:activityLog.length,                                              c:"var(--info)"},
            {l:"Logins Today", v:activityLog.filter(l=>l.created_at&&new Date(l.created_at).toDateString()===new Date().toDateString()&&l.action==="LOGIN").length, c:"#a78bfa"},
            {l:"Creates",      v:activityLog.filter(l=>l.action==="CREATE").length,               c:"#34d399"},
            {l:"Deletes",      v:activityLog.filter(l=>l.action==="DELETE").length,               c:"#f87171"},
            {l:"Exports",      v:activityLog.filter(l=>l.action==="EXPORT"||l.action==="IMPORT").length, c:"#facc15"},
          ].map((k,i)=>(
            <div key={i} style={{background:"var(--bg2)",border:`1px solid ${k.c}25`,borderRadius:8,padding:"8px 12px"}}>
              <div style={{fontFamily:"'IBM Plex Mono',monospace",fontSize:16,fontWeight:700,color:k.c}}>{k.v}</div>
              <div style={{fontSize:11,color:"var(--text4)",marginTop:2}}>{k.l}</div>
            </div>
          ))}
        </div>
      )}

      {/* ── Table ── */}
      {(loading&&tab==="live") ? (
        <div style={{textAlign:"center",padding:40,color:"var(--text4)"}}>Loading…</div>
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
                  <th key={h} style={{padding:"7px 12px",textAlign:"left",color:"var(--text3)",fontWeight:600,fontSize:12,borderBottom:"1px solid var(--border3)",whiteSpace:"nowrap"}}>{h}</th>
                ))}
              </tr></thead>
              <tbody>
                {visible.map((l,i)=>{
                  let meta={};
                  try{meta=JSON.parse(l.meta||"{}");}catch(e){}
                  const ts = l.created_at
                    ? new Date(l.created_at).toLocaleString("en-EG",{day:"2-digit",month:"short",year:"numeric",hour:"2-digit",minute:"2-digit",second:"2-digit",hour12:false})
                    : "—";
                  return(
                    <tr key={l.id||i} style={{borderBottom:"1px solid var(--border3)",background:i%2===0?"transparent":"var(--bg1)"}}>
                      <td style={{padding:"6px 12px",fontFamily:"'IBM Plex Mono',monospace",fontSize:11,color:"var(--text4)",whiteSpace:"nowrap"}}>{ts}</td>
                      <td style={{padding:"6px 12px",color:"var(--text1)",fontWeight:500,fontSize:12,whiteSpace:"nowrap"}}>{l.user_name||"—"}</td>
                      <td style={{padding:"6px 12px"}}><span style={{fontSize:10,padding:"2px 5px",borderRadius:3,background:"var(--bg2)",color:"var(--info)",fontWeight:600}}>{l.user_role||"—"}</span></td>
                      <td style={{padding:"6px 12px"}}><span style={{fontSize:11,padding:"2px 7px",borderRadius:4,background:actionColor(l.action)+"20",color:actionColor(l.action),fontWeight:700}}>{l.action}</span></td>
                      <td style={{padding:"6px 12px"}}><span style={{fontSize:11,padding:"2px 7px",borderRadius:4,background:moduleColor(l.module)+"15",color:moduleColor(l.module),fontWeight:600}}>{l.module}</span></td>
                      <td style={{padding:"6px 12px",color:"var(--text2)",fontSize:12,maxWidth:280,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}} title={l.detail}>{l.detail||"—"}</td>
                      <td style={{padding:"6px 12px",fontFamily:"'IBM Plex Mono',monospace",fontSize:10,color:"var(--text4)",maxWidth:180,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}
                        title={JSON.stringify(meta)}>
                        {Object.keys(meta).length>0 ? Object.entries(meta).slice(0,3).map(([k,v])=>`${k}:${v}`).join(" · ") : ""}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          {page_count>1&&(
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"10px 16px",borderTop:"1px solid var(--border3)",background:"var(--bg2)"}}>
              <span style={{fontSize:12,color:"var(--text4)"}}>Showing {page*PAGE_SIZE+1}–{Math.min((page+1)*PAGE_SIZE,filtered.length)} of {filtered.length}</span>
              <div style={{display:"flex",gap:4}}>
                {[{l:"«",v:0},{l:"‹",v:page-1}].map(b=>(
                  <button key={b.l} onClick={()=>setPage(Math.max(0,b.v))} disabled={page===0}
                    style={{padding:"3px 8px",background:"var(--bg1)",border:"1px solid var(--border3)",borderRadius:4,color:"var(--text2)",cursor:page===0?"not-allowed":"pointer",fontSize:12,opacity:page===0?0.4:1}}>{b.l}</button>
                ))}
                {Array.from({length:Math.min(7,page_count)},(_,i)=>{
                  const pg=Math.max(0,Math.min(page_count-7,page-3))+i;
                  return <button key={pg} onClick={()=>setPage(pg)}
                    style={{padding:"3px 8px",background:pg===page?"var(--accent)":"var(--bg1)",border:`1px solid ${pg===page?"var(--accent)":"var(--border3)"}`,borderRadius:4,color:pg===page?"#fff":"var(--text2)",cursor:"pointer",fontSize:12}}>{pg+1}</button>;
                })}
                {[{l:"›",v:page+1},{l:"»",v:page_count-1}].map(b=>(
                  <button key={b.l} onClick={()=>setPage(Math.min(page_count-1,b.v))} disabled={page===page_count-1}
                    style={{padding:"3px 8px",background:"var(--bg1)",border:"1px solid var(--border3)",borderRadius:4,color:"var(--text2)",cursor:page===page_count-1?"not-allowed":"pointer",fontSize:12,opacity:page===page_count-1?0.4:1}}>{b.l}</button>
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
  finSubTab, setFinSubTab, accounts, showToast, logAction, supabase}){

  const derived = useMemo(()=>{
    const activeStaff=staff.filter(s=>s.active!==false);
const totalPayrollUSD=activeStaff.reduce((s,x)=>s+(x.salary_usd||0),0);
const totalPayrollEGP=activeStaff.reduce((s,x)=>s+(x.salary_egp||0),0);

const toUSD=(usd,egp,rate)=>(usd&&usd>0)?usd:((egp||0)/(rate||egpRate));

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
const monthRevUSD=entries.filter(e=>{const d=new Date(e.date+"T12:00:00");return d.getFullYear()===finYear&&d.getMonth()===finMonth&&e.entry_type==="revenue";}).reduce((s,e)=>s+e.hours*e.rate,0);

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
  const mRevUSD=entries.filter(e=>{const d=new Date(e.date+"T12:00:00");return d.getFullYear()===finYear&&d.getMonth()===m&&e.entry_type==="revenue";}).reduce((s,e)=>s+e.hours*e.rate,0);
  const mExpUSD=mMonthExpNS.reduce((s,e)=>s+toUSDexp(e),0);
  return{m,rev:mRevUSD,cost:mPayroll+mSalaryCat+mExpUSD,net:mRevUSD-(mPayroll+mSalaryCat+mExpUSD)};
});
const ytdRev=ytdData.reduce((s,m)=>s+m.rev,0);
const ytdCost=ytdData.reduce((s,m)=>s+m.cost,0);
const ytdNet=ytdRev-ytdCost;

const projProfit=projects.map(p=>{
  const projEntries=entries.filter(e=>String(e.project_id)===String(p.id)&&e.entry_type==="revenue");
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
  },[staff,entries,expenses,projects,egpRate,finMonth,finYear]);

  const {activeStaff,totalPayrollUSD,totalPayrollEGP,toUSD,
    staffThisMonth,monthExp,monthExpNonSalary,totalExpUSD,totalExpEGP,salaryCatUSD,
    monthRevUSD,totalPayrollUSDeff,totalCostUSD,netPL,netColor,deptList,
    ytdData,ytdRev,ytdCost,ytdNet,projProfit
  } = derived;

  const MONTHS_ = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];

  return(
<div style={{padding:"16px 0"}}>

  {/* ── Finance sub-tabs ── */}
  <div style={{display:"flex",gap:4,marginBottom:16,background:"var(--bg2)",borderRadius:8,padding:4,width:"fit-content",flexWrap:"wrap"}}>
    {[
      {id:"journal",  label:"📒 Journal"},
      {id:"balance",  label:"⚖ Balance Sheet"},
      {id:"expenses", label:"🧾 Expenses"},
      {id:"custody",  label:"💵 Cash Custody"},
      {id:"assets",   label:"🏗 Fixed Assets"},
      {id:"tax",      label:"🧾 Tax & Social"},
      {id:"reports",  label:"📋 Reports"},
      {id:"workflow", label:"📖 Workflow Guide"},
      {id:"pl",       label:"📈 P&L Operations"},
      {id:"salaries", label:"👤 Salaries"},
    ].map(t=>(
      <button key={t.id} className={`atab ${finSubTab===t.id?"a":""}`} onClick={()=>setFinSubTab(t.id)}>{t.label}</button>
    ))}
  </div>

  {/* EGP rate + PDF — only for P&L / Salaries tabs */}
  {(finSubTab==="pl"||finSubTab==="salaries")&&(
  <div style={{display:"flex",gap:8,alignItems:"center",marginBottom:16,flexWrap:"wrap"}}>
    <div style={{background:"var(--bg2)",border:"1px solid var(--border3)",borderRadius:8,padding:"6px 12px",display:"flex",alignItems:"center",gap:8}}>
      <span style={{fontSize:12,color:"var(--text4)"}}>EGP/$ rate (salaries only)</span>
      <input title="Used for EGP salary → USD conversion only. Journal expenses use their own per-entry rate."
        type="number" value={egpRate} onChange={e=>setEgpRate(Math.max(1,+e.target.value))}
        style={{width:70,background:"transparent",border:"none",color:"var(--text0)",fontSize:14,fontFamily:"'IBM Plex Mono',monospace",textAlign:"right"}}/>
    </div>
    <div style={{background:"var(--bg2)",border:"1px solid var(--border3)",borderRadius:8,padding:"6px 12px",display:"flex",alignItems:"center",gap:8}}>
      <select value={finMonth} onChange={e=>setFinMonth(+e.target.value)}
        style={{background:"transparent",border:"none",color:"var(--text0)",fontSize:13}}>
        {MONTHS_.map((m,i)=><option key={i} value={i}>{m}</option>)}
      </select>
      <select value={finYear} onChange={e=>setFinYear(+e.target.value)}
        style={{background:"transparent",border:"none",color:"var(--text0)",fontSize:13}}>
        {[2024,2025,2026,2027].map(y=><option key={y}>{y}</option>)}
      </select>
    </div>
    <button className="bp" style={{padding:"6px 14px",fontSize:13}} onClick={()=>{
      if(finSubTab==="pl"||finSubTab==="salaries"){
        buildFinancePDF({finMonth,finYear,MONTHS_,monthRevUSD,totalPayrollUSDeff,totalPayrollEGP,totalExpUSD,totalExpEGP,totalCostUSD,netPL,netColor,activeStaff,monthExp,deptList,projProfit,ytdData,ytdRev,ytdCost,ytdNet,fmtCurrency,isAdmin,egpRate});
      } else {
        buildFinancePDF({finMonth,finYear,MONTHS_,monthRevUSD,totalPayrollUSDeff,totalPayrollEGP,totalExpUSD,totalExpEGP,totalCostUSD,netPL,netColor,activeStaff,monthExp,deptList,projProfit,ytdData,ytdRev,ytdCost,ytdNet,fmtCurrency,isAdmin,egpRate});
      }
      logAction("EXPORT","Finance",`Exported Finance PDF — ${MONTHS_[finMonth]} ${finYear}`,{month:finMonth,year:finYear,tab:finSubTab});
    }}>⬇ Export PDF</button>
  </div>
  )}

  {/* ── JOURNAL TAB ── */}
  {finSubTab==="journal"&&(
    <JournalLedger
      journalEntries={journalEntries}
      accounts={accounts||[]}
      isAcct={isAcct} isAdmin={isAdmin}
      loading={journalLoading}
      onAdd={async(entry)=>{
        if(!isAcct&&!isAdmin) return;
        const {data,error}=await supabase.from("journal_entries").insert([{...entry,posted_by:"accountant"}]).select();
        if(!error&&data){ setJournalEntries(prev=>[...prev,...data]);
          logAction("CREATE","Journal",`Posted entry #${entry.entry_no} — ${entry.entry_type} · ${entry.account_name}`,{entry_no:entry.entry_no,entry_type:entry.entry_type,account:entry.account_name,debit:entry.debit,credit:entry.credit}); }
      }}
      onDelete={async(id)=>{
        if(!isAcct&&!isAdmin) return;
        await supabase.from("journal_entries").delete().eq("id",id);
        setJournalEntries(prev=>prev.filter(e=>e.id!==id));
        logAction("DELETE","Journal",`Deleted journal entry id:${id}`,{id});
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
          showToast("Journal entry saved ✓");
        } catch(err) {
          showToast("Error: "+err.message,false);
          console.error("[Journal]",err);
        }
      }}
    />
  )}

  {/* ── BALANCE SHEET TAB ── */}
  {finSubTab==="balance"&&(
    <BalanceSheetView journalEntries={journalEntries}/>
  )}

  {/* ── EXPENSES TAB ── */}
  {finSubTab==="expenses"&&(
    <ExpensesView journalEntries={journalEntries} oldExpenses={expenses} egpRate={egpRate}/>
  )}

  {/* ── CASH CUSTODY TAB ── */}
  {finSubTab==="custody"&&(
    <CashCustodyView journalEntries={journalEntries}/>
  )}

  {/* ── FIXED ASSETS TAB ── */}
  {finSubTab==="assets"&&(
    <FixedAssetsView fixedAssets={fixedAssets} loading={assetsLoading}/>
  )}

  {/* ── TAX & SOCIAL TAB ── */}
  {finSubTab==="tax"&&(
    <TaxSocialView journalEntries={journalEntries}/>
  )}

  {/* ── REPORTS TAB ── */}
  {finSubTab==="reports"&&(
    <FinanceReports journalEntries={journalEntries} fixedAssets={fixedAssets}
      staff={staff} expenses={expenses} egpRate={egpRate}/>
  )}

  {/* ── WORKFLOW GUIDE TAB ── */}
  {finSubTab==="workflow"&&(
    <AccountantGuide journalEntries={journalEntries} staff={staff} egpRate={egpRate}/>
  )}


  {/* ── P&L OPERATIONS TAB — reconciled journal + engineering view ── */}
  {finSubTab==="pl"&&(()=>{
    // ── EGP P&L from journal (the authoritative accounting view)
    const jRevenue = journalEntries.filter(e=>e.main_account==="Revenue").reduce((s,e)=>s+(+e.credit||0),0);
    const jExpenses = journalEntries.filter(e=>e.statement_type==="Profit & Loss Sheet"&&+e.debit>0);
    const jTotalExp = jExpenses.reduce((s,e)=>s+(+e.debit),0);
    const jNetPL = jRevenue - jTotalExp;

    // Revenue in USD from journal (stored on revenue line)
    const jRevUSD = journalEntries.find(e=>e.main_account==="Revenue"&&+e.usd_amount>0)?.usd_amount || 0;
    const jRevRate = journalEntries.find(e=>e.main_account==="Revenue"&&+e.exchange_rate>0)?.exchange_rate || egpRate;

    // Salary accrual from journal (per month, for the YTD table)
    const MO = ["","Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
    const allMonths = [...new Set(journalEntries.map(e=>e.month))].sort((a,b)=>+a-+b);
    const monthPL = allMonths.map(mo=>({
      mo,
      rev: journalEntries.filter(e=>e.main_account==="Revenue"&&+e.month===mo).reduce((s,e)=>s+(+e.credit),0),
      exp: journalEntries.filter(e=>e.statement_type==="Profit & Loss Sheet"&&+e.debit>0&&+e.month===mo).reduce((s,e)=>s+(+e.debit),0),
    })).map(m=>({...m, net:m.rev-m.exp}));

    // Expense breakdown by category from journal
    const expByCategory = {};
    jExpenses.forEach(e=>{
      if(!expByCategory[e.main_account]) expByCategory[e.main_account]={cat:e.main_account,total:0,items:{}};
      if(!expByCategory[e.main_account].items[e.account_name]) expByCategory[e.main_account].items[e.account_name]={name:e.account_name,total:0};
      expByCategory[e.main_account].items[e.account_name].total += +e.debit;
      expByCategory[e.main_account].total += +e.debit;
    });

    // Engineering ops view (billable hours from time entries)
    const billableEntries = entries.filter(e=>e.entry_type==="revenue");
    const totalBillableHrs = billableEntries.reduce((s,e)=>s+e.hours,0);
    const totalBillableUSD = billableEntries.reduce((s,e)=>s+e.hours*(e.rate||0),0);
    const engHours = {};
    engineers.forEach(eng=>{
      const hrs = billableEntries.filter(e=>String(e.engineer_id)===String(eng.id)).reduce((s,e)=>s+e.hours,0);
      if(hrs>0) engHours[eng.id]={name:eng.name,hrs,usd:billableEntries.filter(e=>String(e.engineer_id)===String(eng.id)).reduce((s,e)=>s+e.hours*(e.rate||0),0)};
    });

    const netColor = jNetPL>=0?"#34d399":"#f87171";
    const opCosts = expByCategory["Operating Costs"]?.total||0;
    const adminCosts = expByCategory["Administrative expenses"]?.total||0;

    return(
    <div style={{display:"grid",gap:14}}>

      {/* ── TOP: EGP P&L from journal — authoritative ── */}
      <div style={{background:"var(--bg2)",border:"1px solid var(--border3)",borderRadius:8,padding:"8px 14px",fontSize:12,color:"var(--text3)"}}>
        📒 <strong style={{color:"var(--text1)"}}>Journal-based P&L</strong> — figures sourced directly from posted journal entries (EGP). This is the official accounting view.
      </div>

      <div style={{display:"grid",gridTemplateColumns:"repeat(5,1fr)",gap:10}}>
        {[
          {l:"Revenue (EGP)",       v:fmtEGP(jRevenue),         c:"#34d399"},
          {l:"Operating Costs",     v:fmtEGP(opCosts),           c:"#f87171"},
          {l:"Administrative",      v:fmtEGP(adminCosts),        c:"#fb923c"},
          {l:"Total Expenses",      v:fmtEGP(jTotalExp),         c:"#f87171"},
          {l:"Net P&L (EGP)",       v:fmtEGP(jNetPL),            c:netColor},
        ].map((k,i)=>(
          <div key={i} className="card" style={{textAlign:"center",padding:"12px 8px"}}>
            <div style={{fontFamily:"'IBM Plex Mono',monospace",fontSize:15,fontWeight:700,color:k.c}}>{k.v}</div>
            <div style={{fontSize:11,color:"var(--text4)",textTransform:"uppercase",letterSpacing:".07em",marginTop:4}}>{k.l}</div>
          </div>
        ))}
      </div>

      {/* USD equivalent strip */}
      {jRevUSD>0&&(
        <div style={{background:"#38bdf810",border:"1px solid #38bdf840",borderRadius:8,padding:"10px 16px",display:"flex",gap:20,flexWrap:"wrap",alignItems:"center"}}>
          <span style={{fontSize:12,color:"var(--text3)"}}>Invoice equivalent:</span>
          <span style={{fontFamily:"'IBM Plex Mono',monospace",fontSize:14,fontWeight:700,color:"#38bdf8"}}>${(+jRevUSD).toLocaleString("en-US",{minimumFractionDigits:2})} USD</span>
          <span style={{fontSize:12,color:"var(--text4)"}}>@ EGP {jRevRate}/$ on invoice date</span>
          <span style={{fontFamily:"'IBM Plex Mono',monospace",fontSize:13,color:"#34d399"}}>= {fmtEGP(+jRevUSD * +jRevRate)}</span>
          <span style={{fontSize:12,color:"var(--text4)",marginLeft:"auto"}}>EGP rate override: <input type="number" value={egpRate} onChange={e=>setEgpRate(Math.max(1,+e.target.value))} style={{width:60,background:"transparent",border:"1px solid var(--border3)",borderRadius:4,padding:"2px 6px",color:"var(--text0)",fontSize:12,textAlign:"right"}}/> /$ (salaries only)</span>
        </div>
      )}

      {/* Expense breakdown */}
      <div className="card" style={{padding:0,overflow:"hidden"}}>
        <div style={{background:"#f8711815",borderBottom:"2px solid #f87171",padding:"10px 16px",fontSize:13,fontWeight:700,color:"#f87171"}}>EXPENSE BREAKDOWN (Journal)</div>
        <table style={{width:"100%",borderCollapse:"collapse",fontSize:13}}>
          <thead><tr style={{background:"var(--bg2)"}}>
            <th style={{padding:"7px 14px",textAlign:"left",color:"var(--text3)",fontSize:12}}>Category</th>
            <th style={{padding:"7px 14px",textAlign:"left",color:"var(--text3)",fontSize:12}}>Account</th>
            <th style={{padding:"7px 14px",textAlign:"right",color:"var(--text3)",fontSize:12}}>Amount (EGP)</th>
            <th style={{padding:"7px 14px",textAlign:"right",color:"var(--text3)",fontSize:12}}>% of Total</th>
          </tr></thead>
          <tbody>
            {Object.values(expByCategory).sort((a,b)=>b.total-a.total).map(cat=>
              Object.values(cat.items).sort((a,b)=>b.total-a.total).map((item,i)=>(
                <tr key={cat.cat+item.name} style={{borderBottom:"1px solid var(--border3)"}}>
                  <td style={{padding:"6px 14px",color:"var(--text4)",fontSize:12,fontStyle:"italic"}}>{i===0?cat.cat:""}</td>
                  <td style={{padding:"6px 14px",color:"var(--text1)",fontWeight:500}}>{item.name}</td>
                  <td style={{padding:"6px 14px",fontFamily:"'IBM Plex Mono',monospace",fontSize:12,textAlign:"right",color:"#fb923c"}}>{fmtEGP(item.total)}</td>
                  <td style={{padding:"6px 14px",textAlign:"right"}}>
                    <div style={{display:"flex",alignItems:"center",justifyContent:"flex-end",gap:6}}>
                      <div style={{width:60,height:6,background:"var(--bg2)",borderRadius:3,overflow:"hidden"}}>
                        <div style={{height:"100%",width:`${Math.min(100,(item.total/jTotalExp*100)).toFixed(0)}%`,background:"#fb923c",borderRadius:3}}/>
                      </div>
                      <span style={{fontFamily:"'IBM Plex Mono',monospace",fontSize:11,color:"var(--text4)",minWidth:35}}>{jTotalExp?(item.total/jTotalExp*100).toFixed(1):0}%</span>
                    </div>
                  </td>
                </tr>
              ))
            )}
            <tr style={{background:"var(--bg2)",borderTop:"2px solid var(--border)"}}>
              <td colSpan={2} style={{padding:"8px 14px",fontWeight:700,color:"var(--text0)"}}>TOTAL EXPENSES</td>
              <td style={{padding:"8px 14px",fontFamily:"'IBM Plex Mono',monospace",fontWeight:700,color:"#f87171",textAlign:"right"}}>{fmtEGP(jTotalExp)}</td>
              <td style={{padding:"8px 14px",textAlign:"right",fontFamily:"'IBM Plex Mono',monospace",fontSize:12,color:"var(--text4)"}}>100%</td>
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
        <div style={{background:"var(--bg2)",borderBottom:"2px solid var(--border)",padding:"10px 16px",fontSize:13,fontWeight:700,color:"var(--text2)"}}>
          MONTH-BY-MONTH (Journal) — Note: Revenue posted in Feb when invoice issued; costs accrue monthly
        </div>
        <table style={{width:"100%",borderCollapse:"collapse",fontSize:13}}>
          <thead><tr style={{background:"var(--bg2)"}}>
            {["Month","Revenue (EGP)","Expenses (EGP)","Net (EGP)","Status"].map(h=>(
              <th key={h} style={{padding:"7px 14px",textAlign:h==="Month"||h==="Status"?"left":"right",color:"var(--text3)",fontSize:12}}>{h}</th>
            ))}
          </tr></thead>
          <tbody>
            {monthPL.map((m,i)=>(
              <tr key={m.mo} style={{borderBottom:"1px solid var(--border3)",background:i%2===0?"transparent":"var(--bg1)"}}>
                <td style={{padding:"7px 14px",fontWeight:600,color:"var(--text0)"}}>{MO[+m.mo]}</td>
                <td style={{padding:"7px 14px",fontFamily:"'IBM Plex Mono',monospace",fontSize:12,textAlign:"right",color:"#34d399"}}>{m.rev>0?fmtEGP(m.rev):"—"}</td>
                <td style={{padding:"7px 14px",fontFamily:"'IBM Plex Mono',monospace",fontSize:12,textAlign:"right",color:"#f87171"}}>{m.exp>0?fmtEGP(m.exp):"—"}</td>
                <td style={{padding:"7px 14px",fontFamily:"'IBM Plex Mono',monospace",fontSize:13,textAlign:"right",color:m.net>=0?"#34d399":"#f87171",fontWeight:600}}>{fmtEGP(m.net)}</td>
                <td style={{padding:"7px 14px",fontSize:11,color:"var(--text4)"}}>{m.rev>0&&m.exp>0?"Revenue+Costs":m.rev>0?"Revenue only":m.exp>0?"Costs only":"—"}</td>
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

      {/* ── Engineering ops section ── */}
      {(totalBillableHrs>0||totalBillableUSD>0)&&(
        <div className="card" style={{padding:0,overflow:"hidden"}}>
          <div style={{background:"#38bdf815",borderBottom:"2px solid #38bdf8",padding:"10px 16px",fontSize:13,fontWeight:700,color:"#38bdf8"}}>
            ENGINEERING OPS — Billable Hours (time entries, USD)
            <span style={{fontSize:11,color:"var(--text4)",fontWeight:400,marginLeft:12}}>Management view — not accounting</span>
          </div>
          <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:0,borderBottom:"1px solid var(--border3)"}}>
            {[
              {l:"Total Billable Hours",v:`${totalBillableHrs.toFixed(1)} hrs`,c:"#38bdf8"},
              {l:"Billed Value (USD)",  v:fmtCurrency(totalBillableUSD),       c:"#34d399"},
              {l:"Avg Rate",            v:totalBillableHrs?fmtCurrency(totalBillableUSD/totalBillableHrs)+"/hr":"—",c:"var(--text2)"},
            ].map((k,i)=>(
              <div key={i} style={{textAlign:"center",padding:"14px 8px",borderRight:i<2?"1px solid var(--border3)":"none"}}>
                <div style={{fontFamily:"'IBM Plex Mono',monospace",fontSize:15,fontWeight:700,color:k.c}}>{k.v}</div>
                <div style={{fontSize:11,color:"var(--text4)",marginTop:3}}>{k.l}</div>
              </div>
            ))}
          </div>
          {Object.values(engHours).length>0&&(
            <table style={{width:"100%",borderCollapse:"collapse",fontSize:13}}>
              <thead><tr style={{background:"var(--bg2)"}}>
                {["Engineer","Billable Hours","Billed USD"].map(h=>(
                  <th key={h} style={{padding:"7px 14px",textAlign:h==="Engineer"?"left":"right",color:"var(--text3)",fontSize:12}}>{h}</th>
                ))}
              </tr></thead>
              <tbody>
                {Object.values(engHours).sort((a,b)=>b.usd-a.usd).map((e,i)=>(
                  <tr key={i} style={{borderBottom:"1px solid var(--border3)"}}>
                    <td style={{padding:"6px 14px",color:"var(--text1)",fontWeight:500}}>{e.name}</td>
                    <td style={{padding:"6px 14px",fontFamily:"'IBM Plex Mono',monospace",fontSize:12,textAlign:"right",color:"var(--text2)"}}>{e.hrs.toFixed(1)} hrs</td>
                    <td style={{padding:"6px 14px",fontFamily:"'IBM Plex Mono',monospace",fontSize:12,textAlign:"right",color:"#34d399",fontWeight:600}}>{fmtCurrency(e.usd)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}

      {/* ── Project P&L ── */}
      {projProfit.length>0&&(
        <div className="card" style={{padding:0,overflow:"hidden"}}>
          <div style={{background:"var(--bg2)",borderBottom:"2px solid var(--border)",padding:"10px 16px",fontSize:13,fontWeight:700,color:"var(--text2)"}}>PROJECT P&L (Time Entries × Rate)</div>
          <table style={{width:"100%",borderCollapse:"collapse",fontSize:13}}>
            <thead><tr style={{background:"var(--bg2)"}}>
              {["Project","Revenue","Cost","Profit","Margin"].map(h=>(
                <th key={h} style={{padding:"7px 14px",textAlign:h==="Project"?"left":"right",color:"var(--text3)",fontSize:12}}>{h}</th>
              ))}
            </tr></thead>
            <tbody>
              {projProfit.map((p,i)=>(
                <tr key={i} style={{borderBottom:"1px solid var(--border3)"}}>
                  <td style={{padding:"7px 14px",fontWeight:500,color:"var(--text1)"}}>{p.name}</td>
                  <td style={{padding:"7px 14px",fontFamily:"'IBM Plex Mono',monospace",fontSize:12,textAlign:"right",color:"#34d399"}}>{fmtCurrency(p.rev)}</td>
                  <td style={{padding:"7px 14px",fontFamily:"'IBM Plex Mono',monospace",fontSize:12,textAlign:"right",color:"#f87171"}}>{fmtCurrency(p.cost)}</td>
                  <td style={{padding:"7px 14px",fontFamily:"'IBM Plex Mono',monospace",fontSize:13,textAlign:"right",color:p.net>=0?"#34d399":"#f87171",fontWeight:600}}>{fmtCurrency(p.net)}</td>
                  <td style={{padding:"7px 14px",fontFamily:"'IBM Plex Mono',monospace",fontSize:12,textAlign:"right",color:"var(--text3)"}}>{p.rev?Math.round(p.net/p.rev*100):0}%</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

    </div>
    );
  })()}

  {/* ── SALARIES TAB — journal accruals + staff table reconciled ── */}
  {finSubTab==="salaries"&&(()=>{
    const MO = ["","Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
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
    const totalEGP = activeSt.reduce((s,x)=>s+(+x.salary_egp||0),0);
    const totalUSD = activeSt.reduce((s,x)=>s+(+x.salary_usd||0),0);

    // Last posted month vs staff table — reconciliation
    const lastAccrual = accrualByMonth[accrualByMonth.length-1];
    const lastGross = lastAccrual ? lastAccrual.grossCost + lastAccrual.grossAdmin : 0;
    const reconcileDiff = lastGross - totalEGP;
    const reconcileOK = Math.abs(reconcileDiff) < 100;

    return(
    <div style={{display:"grid",gap:14}}>

      {/* KPI strip */}
      <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:10}}>
        {[
          {l:"Active Staff",        v:activeSt.length,                              c:"var(--info)"},
          {l:"Total EGP Salary",    v:fmtEGP(totalEGP),                             c:"#fb923c"},
          {l:"Total USD Salary",    v:totalUSD>0?`$${totalUSD.toLocaleString("en-US",{minimumFractionDigits:2})}`:"—", c:"#38bdf8"},
          {l:"Journal vs Staff",    v:reconcileOK?"✓ Match":`Δ ${fmtEGP(Math.abs(reconcileDiff))}`, c:reconcileOK?"#34d399":"#f87171"},
        ].map((k,i)=>(
          <div key={i} className="card" style={{textAlign:"center",padding:"12px 8px"}}>
            <div style={{fontFamily:"'IBM Plex Mono',monospace",fontSize:15,fontWeight:700,color:k.c}}>{k.v}</div>
            <div style={{fontSize:11,color:"var(--text4)",textTransform:"uppercase",letterSpacing:".07em",marginTop:4}}>{k.l}</div>
          </div>
        ))}
      </div>

      {!reconcileOK&&(
        <div style={{background:"#f8711815",border:"1px solid #f8711840",borderRadius:8,padding:"10px 16px",fontSize:13,color:"#f87171"}}>
          ⚠ Last journal accrual gross ({fmtEGP(lastGross)}) differs from staff table total ({fmtEGP(totalEGP)}) by {fmtEGP(Math.abs(reconcileDiff))}. 
          Check if staff salaries were updated without a matching journal correction.
        </div>
      )}

      {/* Monthly accrual history */}
      {accrualByMonth.length>0&&(
        <div className="card" style={{padding:0,overflow:"hidden"}}>
          <div style={{background:"#a78bfa15",borderBottom:"2px solid #a78bfa",padding:"10px 16px",fontSize:13,fontWeight:700,color:"#a78bfa"}}>
            MONTHLY PAYROLL ACCRUALS (from journal)
          </div>
          <div style={{overflowX:"auto"}}>
            <table style={{width:"100%",borderCollapse:"collapse",fontSize:13}}>
              <thead><tr style={{background:"var(--bg2)"}}>
                {["Month","Gross Cost","Gross Admin","SI Total","Payroll Tax","MFF","Net Payable"].map(h=>(
                  <th key={h} style={{padding:"7px 12px",textAlign:h==="Month"?"left":"right",color:"var(--text3)",fontSize:12,whiteSpace:"nowrap"}}>{h}</th>
                ))}
              </tr></thead>
              <tbody>
                {accrualByMonth.map((m,i)=>(
                  <tr key={m.mo} style={{borderBottom:"1px solid var(--border3)",background:i%2===0?"transparent":"var(--bg1)"}}>
                    <td style={{padding:"7px 12px",fontWeight:600,color:"var(--text0)"}}>{MO[+m.mo]}</td>
                    <td style={{padding:"7px 12px",fontFamily:"'IBM Plex Mono',monospace",fontSize:12,textAlign:"right",color:"#fb923c"}}>{m.grossCost>0?fmtEGP(m.grossCost):"—"}</td>
                    <td style={{padding:"7px 12px",fontFamily:"'IBM Plex Mono',monospace",fontSize:12,textAlign:"right",color:"#fb923c"}}>{m.grossAdmin>0?fmtEGP(m.grossAdmin):"—"}</td>
                    <td style={{padding:"7px 12px",fontFamily:"'IBM Plex Mono',monospace",fontSize:12,textAlign:"right",color:"#f87171"}}>{fmtEGP(m.siCost+m.siAdmin)}</td>
                    <td style={{padding:"7px 12px",fontFamily:"'IBM Plex Mono',monospace",fontSize:12,textAlign:"right",color:"#f87171"}}>{fmtEGP(m.tax)}</td>
                    <td style={{padding:"7px 12px",fontFamily:"'IBM Plex Mono',monospace",fontSize:12,textAlign:"right",color:"#a78bfa"}}>{fmtEGP(m.mff)}</td>
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

      {/* Dept breakdown from staff table */}
      <div className="card" style={{padding:0,overflow:"hidden"}}>
        <div style={{background:"var(--bg2)",borderBottom:"2px solid var(--border)",padding:"10px 16px",fontSize:13,fontWeight:700,color:"var(--text2)"}}>
          STAFF TABLE — Current Salaries (reference for journal entries)
        </div>
        <table style={{width:"100%",borderCollapse:"collapse",fontSize:13}}>
          <thead><tr style={{background:"var(--bg2)"}}>
            {["Name","Department","Role","EGP Salary","USD Salary","Join Date",""].map(h=>(
              <th key={h} style={{padding:"7px 12px",textAlign:["EGP Salary","USD Salary"].includes(h)?"right":"left",color:"var(--text3)",fontSize:12}}>{h}</th>
            ))}
          </tr></thead>
          <tbody>
            {activeSt.sort((a,b)=>(b.salary_egp||0)-(a.salary_egp||0)).map((s,i)=>(
              <tr key={i} style={{borderBottom:"1px solid var(--border3)",background:i%2===0?"transparent":"var(--bg1)"}}>
                <td style={{padding:"6px 12px",fontWeight:600,color:"var(--text1)"}}>{s.name}</td>
                <td style={{padding:"6px 12px",color:"var(--text3)"}}>{s.department}</td>
                <td style={{padding:"6px 12px"}}><span style={{fontSize:11,padding:"2px 6px",borderRadius:3,background:"var(--bg3)",color:"var(--info)"}}>{s.role}</span></td>
                <td style={{padding:"6px 12px",fontFamily:"'IBM Plex Mono',monospace",fontSize:12,textAlign:"right",color:"#fb923c",fontWeight:600}}>{s.salary_egp?fmtEGP(+s.salary_egp):"\u2014"}</td>
                <td style={{padding:"6px 12px",fontFamily:"'IBM Plex Mono',monospace",fontSize:12,textAlign:"right",color:"#38bdf8"}}>{s.salary_usd?`$${(+s.salary_usd).toLocaleString("en-US",{minimumFractionDigits:2})}`:"\u2014"}</td>
                <td style={{padding:"6px 12px",fontSize:12,color:"var(--text4)"}}>{s.join_date||"—"}</td>
                <td style={{padding:"6px 8px"}}>
                  {(isAdmin||isAcct)&&(
                    <button onClick={()=>{setEditStaff({...s});setShowStaffModal(true);}}
                      style={{background:"var(--bg2)",border:"1px solid var(--border3)",borderRadius:5,padding:"3px 9px",color:"var(--text2)",cursor:"pointer",fontSize:12}}>✏</button>
                  )}
                </td>
              </tr>
            ))}
            <tr style={{background:"var(--bg2)",borderTop:"2px solid var(--border)",fontWeight:700}}>
              <td colSpan={3} style={{padding:"8px 12px",color:"var(--text0)"}}>TOTAL ({activeSt.length} staff)</td>
              <td style={{padding:"8px 12px",fontFamily:"'IBM Plex Mono',monospace",textAlign:"right",color:"#fb923c",fontSize:14}}>{fmtEGP(totalEGP)}</td>
              <td style={{padding:"8px 12px",fontFamily:"'IBM Plex Mono',monospace",textAlign:"right",color:"#38bdf8"}}>{totalUSD>0?`$${totalUSD.toLocaleString("en-US",{minimumFractionDigits:2})}`:""}</td>
              <td colSpan={2}/>
            </tr>
          </tbody>
        </table>
        {(isAdmin||isAcct)&&(
          <div style={{padding:"10px 14px",borderTop:"1px solid var(--border3)",display:"flex",gap:8,alignItems:"center"}}>
            {isAdmin&&<button className="bp" onClick={()=>{setEditStaff(null);setShowStaffModal(true);}}>+ Add Staff Member</button>}
            {isAcct&&!isAdmin&&<span style={{fontSize:12,color:"var(--text4)"}}>✏ Click the edit button on any row to update salary</span>}
          </div>
        )}
      </div>

    </div>
    );
  })()}

</div>
  );
}



/* ════════════════════════════════════════════════════════
   FUNCTIONS TAB — standalone component
   ════════════════════════════════════════════════════════ */
function FunctionsTab({entries, engineers, funcYear, setFuncYear, funcEngId, setFuncEngId, deleteEntry, isAdmin, isLead, isAcct, year, setShowFuncModal}){

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
<div style={{display:"grid",gap:14}}>
  <div style={{display:"flex",gap:8,alignItems:"center",flexWrap:"wrap"}}>
    <select value={funcYear} onChange={e=>setFuncYear(+e.target.value)}
      style={{background:"var(--bg1)",border:"1px solid var(--border3)",borderRadius:6,padding:"6px 10px",color:"var(--text0)",fontSize:14}}>
      {[2024,2025,2026,2027].map(y=><option key={y}>{y}</option>)}
    </select>
    <select value={funcEngId} onChange={e=>setFuncEngId(e.target.value)}
      style={{background:"var(--bg1)",border:"1px solid var(--border3)",borderRadius:6,padding:"6px 10px",color:"var(--text0)",fontSize:14}}>
      <option value="all">All Engineers</option>
      {engineers.map(e=><option key={e.id} value={e.id}>{e.name}</option>)}
    </select>
    <span style={{fontSize:13,color:"var(--text4)"}}>{yearFuncs.length} entries · {totalFuncHrs}h total</span>
    <button className="bp" style={{marginLeft:"auto"}} onClick={()=>setShowFuncModal(true)}>+ Log Function Hours</button>
  </div>
  <div className="card">
    <div style={{fontSize:13,fontWeight:700,color:"var(--text2)",marginBottom:12}}>FUNCTION HOURS BY CATEGORY — {funcYear}{funcEngId!=="all"?" · "+engineers.find(e=>String(e.id)===String(funcEngId))?.name:""}</div>
    <div style={{display:"grid",gap:7}}>
      {FUNCTION_CATS.map(cat=>{
        const hrs=catTotals[cat]||0;
        return(
        <div key={cat} style={{display:"grid",gridTemplateColumns:"240px 1fr 50px",alignItems:"center",gap:10}}>
          <div style={{fontSize:12,color:FUNC_COLORS[cat]||"var(--text2)",fontWeight:600}}>{cat}</div>
          <div style={{background:"var(--bg2)",borderRadius:4,height:16,overflow:"hidden"}}>
            <div style={{height:"100%",width:`${Math.round(hrs/maxCat*100)}%`,background:FUNC_COLORS[cat]||"var(--info)",borderRadius:4,minWidth:hrs>0?4:0}}/>
          </div>
          <div style={{fontFamily:"'IBM Plex Mono',monospace",fontSize:13,color:hrs>0?(FUNC_COLORS[cat]||"var(--info)"):"var(--text4)",fontWeight:700,textAlign:"right"}}>{hrs}h</div>
        </div>);
      })}
    </div>
  </div>
  <div className="card">
    <div style={{fontSize:13,fontWeight:700,color:"var(--text2)",marginBottom:12}}>ENGINEER FUNCTION MATRIX — {funcYear}</div>
    <div style={{overflowX:"auto"}}>
    <table style={{minWidth:700}}>
      <thead><tr>
        <th>Engineer</th>
        <th style={{textAlign:"right"}}>Total</th>
        {FUNCTION_CATS.map(c=><th key={c} style={{textAlign:"right",fontSize:10,maxWidth:70,whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis",color:FUNC_COLORS[c]}} title={c}>{c.split("—")[0].split("&")[0].trim().slice(0,11)}</th>)}
      </tr></thead>
      <tbody>{engineers.map(eng=>{
        const em=engFuncMap[eng.id]||{total:0,cats:{}};
        return(<tr key={eng.id}>
          <td style={{fontWeight:600,minWidth:120}}>{eng.name}<br/><span style={{fontSize:11,color:"var(--text4)"}}>{eng.role}</span></td>
          <td style={{textAlign:"right",fontFamily:"'IBM Plex Mono',monospace",fontWeight:700,color:"#a78bfa"}}>{em.total||"—"}</td>
          {FUNCTION_CATS.map(c=>(
            <td key={c} style={{textAlign:"right",fontFamily:"'IBM Plex Mono',monospace",fontSize:12,color:em.cats[c]>0?(FUNC_COLORS[c]||"var(--info)"):"var(--text4)"}}>{em.cats[c]||"—"}</td>
          ))}
        </tr>);
      })}</tbody>
    </table>
    </div>
  </div>
  <div className="card">
    <div style={{fontSize:13,fontWeight:700,color:"var(--text2)",marginBottom:10}}>ALL FUNCTION ENTRIES — {funcYear}</div>
    <table>
      <thead><tr><th>Date</th><th>Engineer</th><th>Category</th><th>Hours</th><th>Description</th><th>Actions</th></tr></thead>
      <tbody>{yearFuncs.sort((a,b)=>b.date.localeCompare(a.date)).map(e=>{
        const eng=engineers.find(x=>x.id===e.engineer_id);
        const cat=e.function_category||e.task_type||"Other Function";
        return(<tr key={e.id}>
          <td style={{fontFamily:"'IBM Plex Mono',monospace",fontSize:12}}>{e.date}</td>
          <td style={{fontWeight:600,fontSize:12}}>{eng?.name||"?"}</td>
          <td><span style={{fontSize:11,padding:"2px 6px",borderRadius:3,background:(FUNC_COLORS[cat]||"#6b7280")+"20",color:FUNC_COLORS[cat]||"#6b7280",fontWeight:700}}>{cat}</span></td>
          <td style={{fontFamily:"'IBM Plex Mono',monospace",fontWeight:700,color:"#a78bfa"}}>{e.hours}h</td>
          <td style={{fontSize:12,color:"var(--text3)",fontStyle:"italic",maxWidth:220}}>{e.activity||"—"}</td>
          <td>{isAdmin&&<button className="bd" style={{fontSize:12}} onClick={()=>deleteEntry(e.id,e.engineer_id)}>✕</button>}</td>
        </tr>);
      })}</tbody>
    </table>
  </div>
</div>
  );
}

/* ════════════════════════════════════════════════════════
   KPIs TAB — standalone component
   ════════════════════════════════════════════════════════ */
/* ── KPI rating helpers — module-level so JSX render can access them ── */
const kpiRatingLabel=s=>s<=40?"Under Performer":s<=75?"Competent":s<=95?"Performer":"High Performer";
const kpiRatingColor=s=>s<=40?"#f87171":s<=75?"#fb923c":s<=95?"var(--info)":"#34d399";
const kpiRatingBg=   s=>s<=40?"#7f1d1d20":s<=75?"var(--bg3)":s<=95?"var(--bg3)":"var(--bg3)";

function KPIsTab({entries, engineers, projects, kpiYear, setKpiYear, kpiEngId, setKpiEngId, kpiNotes, setKpiNotes, isAdmin, isLead, isAcct, year, notifications, onDismissNotif, alertDay, setAlertDay, showToast}){
  const yearEntries = useMemo(()=>entries.filter(e=>{const d=new Date(e.date+"T12:00:00");return d.getFullYear()===kpiYear;}),[entries,kpiYear]);
  const engKPIs = useMemo(()=>{
/* ── KPI CALCULATION GUIDE (shown in tooltips and detail view) ──
   A. UTILIZATION/EFFICIENCY 30%
      • Billable %   = hours on billable projects ÷ total hours × 100
      • BD/Sales     = Tender+Proposal+BD function hours (tracked, not scored separately)
      • Knowledge %  = Training+R&D function hours ÷ total hours × 100 (target ~10%)
      • Score formula: bill%×0.70 + (knowledge%/10×100)×0.20 + min(BD%×3,100)×0.10
   B. PROJECT PERFORMANCE 30%
      • Description rate = entries with activity notes ÷ total work entries × 100
      • Projects count   = distinct billable projects worked on
      • Doc hours        = Documentation & Reporting function hours
      • Score formula: descRate×0.50 + min(projects×10,100)×0.30 + min(docHrs×5,100)×0.20
   C. DEVELOPMENT GOAL 20%
      • Training given/received, Mentoring, R&D hours
      • Score formula: (trainRcv/8×100)×0.30 + (trainGiven/4×100)×0.25 + (mentoring/4×100)×0.25 + (rnd/4×100)×0.20
   D. COMPLIANCE GOAL 20%
      • Weekly submission rate = distinct weeks with entries ÷ weeks elapsed × 100
   TOTAL = A×0.30 + B×0.30 + C×0.20 + D×0.20
   BANDS: 0-40 Under Performer | 41-75 Competent | 76-95 Performer | 96-120 High Performer
*/

const computeKPI=eng=>{
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
  const entriesWithDesc=workE.filter(e=>e.activity&&e.activity.trim().length>5).length;
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
  // KPI week counting starts from the later of: year start OR engineer's join date
  // This prevents penalising new joiners for weeks before they were employed
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
};

const engKPIs=engineers.map(computeKPI).sort((a,b)=>b.totalScore-a.totalScore);

// Selected engineer for detail view
    return engKPIs;
  }, [entries, engineers, projects, kpiYear, yearEntries]);

  // Derived in component body so JSX render can access them
  const selKPI = kpiEngId ? engKPIs.find(k=>String(k.eng.id)===String(kpiEngId)) : null;


  const alertNotifs = (notifications||[]).filter(n=>n.type==="timesheet_alert"&&!n.read);

  return(
<div style={{display:"grid",gap:14}}>

  {/* Controls */}
  <div style={{display:"flex",gap:8,alignItems:"center",flexWrap:"wrap"}}>
    <select value={kpiYear} onChange={e=>setKpiYear(+e.target.value)}
      style={{background:"var(--bg1)",border:"1px solid var(--border3)",borderRadius:6,padding:"6px 10px",color:"var(--text0)",fontSize:14}}>
      {[2024,2025,2026,2027].map(y=><option key={y}>{y}</option>)}
    </select>
    <select value={kpiEngId||""} onChange={e=>setKpiEngId(e.target.value||null)}
      style={{background:"var(--bg1)",border:"1px solid var(--border3)",borderRadius:6,padding:"6px 10px",color:"var(--text0)",fontSize:14}}>
      <option value="">All Engineers (overview)</option>
      {engineers.map(e=><option key={e.id} value={e.id}>{e.name}</option>)}
    </select>
    <div style={{display:"flex",alignItems:"center",gap:6,background:"var(--bg2)",border:"1px solid #38bdf840",borderRadius:6,padding:"5px 10px"}}>
      <span style={{fontSize:11,color:"var(--text4)",textTransform:"uppercase"}}>Alert from</span>
      <select value={alertDay} onChange={e=>setAlertDay(+e.target.value)}
        style={{background:"transparent",border:"none",color:"var(--info)",fontSize:14,fontFamily:"'IBM Plex Mono',monospace",fontWeight:700,outline:"none",cursor:"pointer"}}>
        {[["1","Monday"],["2","Tuesday"],["3","Wednesday"],["4","Thursday"],["5","Friday"]].map(([v,l])=><option key={v} value={+v}>{l}</option>)}
      </select>
    </div>
    {alertNotifs.length>0&&<span style={{background:"#450a0a",border:"1px solid #f87171",color:"#f87171",fontSize:12,fontWeight:700,padding:"4px 10px",borderRadius:6}}>⏰ {alertNotifs.length} alert{alertNotifs.length>1?"s":""}</span>}
  </div>

  {/* Rating legend */}
  <div style={{display:"flex",gap:8,flexWrap:"wrap",alignItems:"center"}}>
    {[["0–40","Under Performer","#f87171","#7f1d1d20"],["41–75","Competent","#fb923c","var(--bg3)"],["76–95","Performer","var(--info)","var(--bg3)"],["96–120","High Performer","#34d399","var(--bg3)"]].map(([r,l,c,bg])=>(
      <div key={r} style={{display:"flex",alignItems:"center",gap:5,background:bg,border:`1px solid ${c}25`,borderRadius:6,padding:"4px 9px"}}>
        <div style={{width:7,height:7,borderRadius:2,background:c}}/>
        <span style={{fontSize:12,color:c,fontWeight:700}}>{r}</span>
        <span style={{fontSize:12,color:"var(--text3)"}}>{l}</span>
      </div>
    ))}
    <span style={{fontSize:11,color:"var(--text4)"}}>Weights: Utilization 30% · Project Perf 30% · Development 20% · Compliance 20%</span>
  </div>

  {/* Delay alerts */}
  {alertNotifs.length>0&&(
  <div className="card" style={{borderColor:"#f8717130"}}>
    <div style={{fontSize:13,fontWeight:700,color:"#f87171",marginBottom:10}}>⏰ TIMESHEET DELAY ALERTS</div>
    <div style={{display:"grid",gap:6}}>
      {alertNotifs.map(n=>(
        <div key={n.id} style={{display:"flex",alignItems:"center",gap:10,background:"#7f1d1d20",borderRadius:6,padding:"8px 12px"}}>
          <span style={{fontSize:12,color:"#f87171",flex:1}}>{n.message}</span>
          <span style={{fontSize:11,color:"var(--text3)"}}>{new Date(n.created_at).toLocaleDateString("en-GB")}</span>
          <button className="bg" style={{fontSize:11,padding:"2px 6px"}} onClick={()=>onDismissNotif&&onDismissNotif(n.id)}>Dismiss</button>
        </div>
      ))}
    </div>
  </div>)}

  {/* ── Overview table (shown when no engineer selected) ── */}
  {!kpiEngId&&(
  <div className="card">
    <div style={{fontSize:13,fontWeight:700,color:"var(--text2)",marginBottom:12}}>ENGINEER KPI SCORECARD — {kpiYear}</div>
    <div style={{overflowX:"auto"}}>
    <table style={{minWidth:820}}>
      <thead>
        <tr style={{background:"var(--bg2)"}}>
          <th rowSpan={2}>Engineer</th>
          <th colSpan={3} style={{textAlign:"center",color:"var(--info)",fontSize:11,borderBottom:"1px solid #0ea5e920"}}>A. Utilization 30%</th>
          <th colSpan={2} style={{textAlign:"center",color:"#a78bfa",fontSize:11,borderBottom:"1px solid #0ea5e920"}}>B. Project 30%</th>
          <th colSpan={2} style={{textAlign:"center",color:"#34d399",fontSize:11,borderBottom:"1px solid #0ea5e920"}}>C. Development 20%</th>
          <th style={{textAlign:"center",color:"#fb923c",fontSize:11,borderBottom:"1px solid #0ea5e920"}}>D. Compliance 20%</th>
          <th rowSpan={2} style={{textAlign:"center"}}>Score</th>
          <th rowSpan={2} style={{textAlign:"center"}}>Rating</th>
        </tr>
        <tr style={{background:"var(--bg2)"}}>
          <th style={{textAlign:"right",fontSize:10,color:"var(--text4)"}}>Bill%</th>
          <th style={{textAlign:"right",fontSize:10,color:"var(--text4)"}}>Know%</th>
          <th style={{textAlign:"right",fontSize:10,color:"var(--text4)"}}>Score</th>
          <th style={{textAlign:"right",fontSize:10,color:"var(--text4)"}}>Desc%</th>
          <th style={{textAlign:"right",fontSize:10,color:"var(--text4)"}}>Score</th>
          <th style={{textAlign:"right",fontSize:10,color:"var(--text4)"}}>Train↑</th>
          <th style={{textAlign:"right",fontSize:10,color:"var(--text4)"}}>Score</th>
          <th style={{textAlign:"right",fontSize:10,color:"var(--text4)"}}>Submit%</th>
        </tr>
      </thead>
      <tbody>{engKPIs.map((k,i)=>(
        <tr key={k.eng.id} onClick={()=>setKpiEngId(String(k.eng.id))} style={{cursor:"pointer"}}>
          <td><div style={{display:"flex",alignItems:"center",gap:6}}>
            <span style={{fontSize:12,fontWeight:700,color:"var(--text4)",minWidth:16}}>{i+1}</span>
            <div><div style={{fontWeight:700,fontSize:13}}>{k.eng.name}</div><div style={{fontSize:11,color:"var(--text4)"}}>{k.eng.role}</div></div>
          </div></td>
          <td style={{textAlign:"right",fontFamily:"'IBM Plex Mono',monospace",color:"var(--info)",fontSize:12}}>{k.billPct}%</td>
          <td style={{textAlign:"right",fontFamily:"'IBM Plex Mono',monospace",color:k.knowledgePct>=8&&k.knowledgePct<=12?"#34d399":"#fb923c",fontSize:12}}>{k.knowledgePct}%</td>
          <td style={{textAlign:"right",fontFamily:"'IBM Plex Mono',monospace",fontWeight:700,color:kpiRatingColor(k.utilScore)}}>{k.utilScore}</td>
          <td style={{textAlign:"right",fontFamily:"'IBM Plex Mono',monospace",color:"#a78bfa",fontSize:12}}>{k.descRate}%</td>
          <td style={{textAlign:"right",fontFamily:"'IBM Plex Mono',monospace",fontWeight:700,color:kpiRatingColor(k.projScore)}}>{k.projScore}</td>
          <td style={{textAlign:"right",fontFamily:"'IBM Plex Mono',monospace",color:"#34d399",fontSize:12}}>{k.trainingGiven}h</td>
          <td style={{textAlign:"right",fontFamily:"'IBM Plex Mono',monospace",fontWeight:700,color:kpiRatingColor(k.devScore)}}>{k.devScore}</td>
          <td style={{textAlign:"right",fontFamily:"'IBM Plex Mono',monospace",fontWeight:700,color:k.submissionRate>=80?"#34d399":k.submissionRate>=60?"#fb923c":"#f87171"}}>{k.submissionRate}%</td>
          <td style={{textAlign:"center"}}>
            <div style={{display:"inline-flex",alignItems:"center",gap:5}}>
              <div style={{width:34,height:5,background:"var(--bg2)",borderRadius:3,overflow:"hidden"}}>
                <div style={{height:"100%",width:`${Math.min(100,k.totalScore)}%`,background:kpiRatingColor(k.totalScore),borderRadius:3}}/>
              </div>
              <span style={{fontFamily:"'IBM Plex Mono',monospace",fontWeight:700,color:kpiRatingColor(k.totalScore),fontSize:14}}>{k.totalScore}</span>
            </div>
          </td>
          <td><span style={{fontSize:11,padding:"2px 6px",borderRadius:4,background:kpiRatingBg(k.totalScore),color:kpiRatingColor(k.totalScore),fontWeight:700,whiteSpace:"nowrap"}}>{kpiRatingLabel(k.totalScore)}</span></td>
        </tr>
      ))}</tbody>
    </table>
    </div>
    <div style={{fontSize:11,color:"var(--text4)",marginTop:8}}>Click any row for full detail · Know% target is 8–12% (green)</div>
  </div>)}

  {/* ── Individual detail view ── */}
  {selKPI&&(()=>{
    const k=selKPI;
    const {eng}=k;
    const engNotes=kpiNotes[eng.id]||{A:"",B:"",C:"",D:"",general:""};
    const setNote=(field,val)=>setKpiNotes(prev=>({...prev,[eng.id]:{...(prev[eng.id]||{}),general:"",A:"",B:"",C:"",D:"",...(prev[eng.id]||{}),[field]:val}}));

    const monthlyData=["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"].map((mn,m)=>{
      const mWork=k.workE.filter(e=>new Date(e.date+"T12:00:00").getMonth()===m);
      const mFunc=k.funcE.filter(e=>new Date(e.date+"T12:00:00").getMonth()===m);
      const mLeave=yearEntries.filter(e=>String(e.engineer_id)===String(eng.id)&&e.entry_type==="leave"&&new Date(e.date+"T12:00:00").getMonth()===m);
      const wh=mWork.reduce((s,e)=>s+e.hours,0);
      const bh=mWork.filter(e=>{const p=projects.find(x=>x.id===e.project_id);return p&&p.billable;}).reduce((s,e)=>s+e.hours,0);
      const fh=mFunc.reduce((s,e)=>s+e.hours,0);
      const util=wh>0?Math.round(bh/(wh+fh||1)*100):0;
      return{mn,m,wh,bh,fh,util,leave:mLeave.length};
    });

    const criteria=[
      {id:"A",label:"Utilization / Efficiency",weight:"30%",score:k.utilScore,color:"var(--info)",
       howCalc:"Score = Billable%×70% + (Knowledge%÷10×100)×20% + min(BD%×3,100)×10%",
       items:[
         {l:"Billable Utilization %",v:`${k.billPct}%`,calc:`${k.billWork}h billable ÷ ${k.totalHrs}h total`,target:"Maximize — hours on invoiced/contractual projects",color:"var(--info)"},
         {l:"Sales Support / BD hours",v:`${k.salesBD}h`,calc:"Tender+Proposal+BD function entries",target:"Tracked only — proposals, BD & leadership meetings",color:"#0ea5e9"},
         {l:"Knowledge Capture %",v:`${k.knowledgePct}%`,calc:`${Math.round(k.knowledgePct/100*k.totalHrs)}h training+R&D ÷ ${k.totalHrs}h total`,target:"~10% — pre-planned, manager pre-approved",color:k.knowledgePct>=8&&k.knowledgePct<=12?"#34d399":"#fb923c"},
       ]},
      {id:"B",label:"Project Performance",weight:"30%",score:k.projScore,color:"#a78bfa",
       howCalc:"Score = DescriptionRate×50% + min(Projects×10,100)×30% + min(DocHours×5,100)×20%",
       items:[
         {l:"Entry Description Rate",v:`${k.descRate}%`,calc:`${Math.round(k.descRate/100*k.workE.length)} of ${k.workE.length} entries have activity notes`,target:"≥80% — quality of output & discipline indicator",color:k.descRate>=80?"#34d399":"#fb923c"},
         {l:"Projects worked on",v:k.projsWorked,calc:"Distinct billable projects this year",target:"Active across multiple projects",color:"#a78bfa"},
         {l:"Documentation hours",v:`${k.docHrs}h`,calc:"Documentation & Reporting function entries",target:"Lesson learned, closure docs, progress reports",color:"#f59e0b"},
       ]},
      {id:"C",label:"Development Goal",weight:"20%",score:k.devScore,color:"#34d399",
       howCalc:"Score = (TrainRcv÷8×100)×30% + (TrainGiven÷4×100)×25% + (Mentoring÷4×100)×25% + (R&D÷4×100)×20%",
       items:[
         {l:"Training received",v:`${k.trainingReceived}h`,calc:"Internal Training — Received function entries",target:"Personal development — certificates, skills",color:"#818cf8"},
         {l:"Training given (knowledge sharing)",v:`${k.trainingGiven}h`,calc:"Internal Training — Given function entries",target:"Leaders: contribution to team knowledge — target ≥4h",color:"#a78bfa"},
         {l:"Mentoring & coaching",v:`${k.mentoring}h`,calc:"Mentoring & Coaching function entries",target:"Leaders: people empowerment & delegation",color:"#34d399"},
         {l:"R&D & Innovation",v:`${k.rnd}h`,calc:"R&D & Innovation function entries",target:"Library of tools, models, work instructions",color:"#10b981"},
       ]},
      {id:"D",label:"Compliance Goal",weight:"20%",score:k.complianceScore,color:"#fb923c",
       howCalc:"Score = Weeks with entries ÷ Weeks elapsed in year × 100",
       items:[
         {l:"Weekly timesheet submission",v:`${k.submissionRate}%`,calc:`${k.weeks} weeks posted out of ${k.weeksElapsed} elapsed`,target:"100% — weekly entry is a core compliance KPI",color:k.submissionRate>=80?"#34d399":k.submissionRate>=60?"#fb923c":"#f87171"},
         {l:"Total work hours logged",v:`${k.totalWork}h`,calc:"All work-type entries this year",target:"Reflects activity & availability",color:"var(--text2)"},
         {l:"Leave days",v:`${k.totalLeave}d`,calc:"All leave-type entries this year",target:"Tracked — advance submission & approval expected",color:"#fb923c"},
       ]},
    ];

    return(
    <div className="card" style={{borderColor:"#0ea5e930"}}>
      {/* Header row */}
      <div style={{display:"flex",alignItems:"flex-start",gap:14,marginBottom:16,flexWrap:"wrap"}}>
        <div style={{flex:1}}>
          <div style={{fontSize:16,fontWeight:700,color:"var(--text0)"}}>{eng.name}</div>
          <div style={{fontSize:12,color:"var(--text4)"}}>{eng.role} · KPI Year {kpiYear}</div>
        </div>
        <div style={{display:"flex",gap:10,alignItems:"center"}}>
          <div style={{textAlign:"center",background:kpiRatingBg(k.totalScore),border:`1px solid ${kpiRatingColor(k.totalScore)}30`,borderRadius:8,padding:"10px 18px"}}>
            <div style={{fontFamily:"'IBM Plex Mono',monospace",fontSize:32,fontWeight:700,color:kpiRatingColor(k.totalScore),lineHeight:1}}>{k.totalScore}</div>
            <div style={{fontSize:11,color:kpiRatingColor(k.totalScore),textTransform:"uppercase",letterSpacing:".06em",marginTop:4}}>{kpiRatingLabel(k.totalScore)}</div>
          </div>
          <button className="bg" style={{fontSize:12}} onClick={()=>setKpiEngId(null)}>✕ Back</button>
        </div>
      </div>

      {/* 4 criteria cards */}
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10,marginBottom:14}}>
        {criteria.map(c=>(
          <div key={c.id} style={{background:"var(--bg2)",borderRadius:8,padding:"12px 14px",border:`1px solid ${c.color}20`}}>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:4}}>
              <div><span style={{fontSize:11,fontWeight:700,color:c.color,background:c.color+"20",padding:"1px 6px",borderRadius:3,marginRight:5}}>{c.id} · {c.weight}</span><span style={{fontSize:12,fontWeight:700,color:"var(--text0)"}}>{c.label}</span></div>
              <div style={{fontFamily:"'IBM Plex Mono',monospace",fontSize:18,fontWeight:700,color:kpiRatingColor(c.score)}}>{c.score}</div>
            </div>
            {/* How calculated */}
            <div style={{fontSize:11,color:"var(--text4)",fontStyle:"italic",marginBottom:6,padding:"3px 6px",background:"var(--bg2)",borderRadius:3}}>{c.howCalc}</div>
            <div style={{background:"var(--bg1)",borderRadius:3,height:5,overflow:"hidden",marginBottom:10}}>
              <div style={{height:"100%",width:`${Math.min(100,c.score)}%`,background:c.color,borderRadius:3}}/>
            </div>
            <div style={{display:"grid",gap:7}}>
              {c.items.map((item,ii)=>(
                <div key={ii} style={{borderTop:ii>0?"1px solid #0d1a2d":"none",paddingTop:ii>0?6:0}}>
                  <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",gap:6}}>
                    <div style={{flex:1}}>
                      <div style={{fontSize:12,color:"var(--text2)",fontWeight:600}}>{item.l}</div>
                      <div style={{fontSize:11,color:"var(--text4)",marginTop:1}}>{item.calc}</div>
                    </div>
                    <div style={{textAlign:"right",flexShrink:0}}>
                      <div style={{fontFamily:"'IBM Plex Mono',monospace",fontSize:14,fontWeight:700,color:item.color}}>{item.v}</div>
                    </div>
                  </div>
                  <div style={{fontSize:11,color:"var(--text4)",marginTop:2,fontStyle:"italic"}}>→ {item.target}</div>
                </div>
              ))}
            </div>
            {/* Manager note per criterion */}
            <div style={{marginTop:10,borderTop:"1px solid #0d1a2d",paddingTop:8}}>
              <div style={{fontSize:11,color:"var(--text4)",marginBottom:3}}>Manager note for {c.id}:</div>
              <textarea value={engNotes[c.id]||""} onChange={e=>setNote(c.id,e.target.value)}
                rows={2} placeholder={`Add note for ${c.label}…`}
                style={{width:"100%",background:"var(--bg2)",border:"1px solid var(--border3)",borderRadius:4,color:"var(--text2)",fontSize:12,padding:"4px 6px",resize:"vertical",fontFamily:"inherit",boxSizing:"border-box"}}/>
            </div>
          </div>
        ))}
      </div>

      {/* Monthly table */}
      <div style={{fontSize:13,fontWeight:700,color:"var(--text2)",marginBottom:8}}>MONTHLY ACTIVITY — {kpiYear}</div>
      <table style={{marginBottom:14}}>
        <thead><tr><th>Month</th><th style={{textAlign:"right"}}>Work Hrs</th><th style={{textAlign:"right"}}>Billable</th><th style={{textAlign:"right"}}>Util%</th><th style={{textAlign:"right"}}>Func Hrs</th><th style={{textAlign:"right"}}>Leave</th></tr></thead>
        <tbody>{monthlyData.map(row=>(
          <tr key={row.m}>
            <td style={{fontWeight:600}}>{row.mn} {kpiYear}</td>
            <td style={{textAlign:"right",fontFamily:"'IBM Plex Mono',monospace"}}>{row.wh||"—"}</td>
            <td style={{textAlign:"right",fontFamily:"'IBM Plex Mono',monospace",color:"#a78bfa"}}>{row.bh||"—"}</td>
            <td style={{textAlign:"right",fontFamily:"'IBM Plex Mono',monospace",color:row.util>=70?"#34d399":row.util>=50?"#fb923c":"var(--text2)"}}>{row.wh?row.util+"%":"—"}</td>
            <td style={{textAlign:"right",fontFamily:"'IBM Plex Mono',monospace",color:"var(--info)"}}>{row.fh||"—"}</td>
            <td style={{textAlign:"right",fontFamily:"'IBM Plex Mono',monospace",color:"#fb923c"}}>{row.leave||"—"}</td>
          </tr>
        ))}</tbody>
      </table>

      {/* General manager note */}
      <div style={{marginBottom:14}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:6}}>
          <div style={{fontSize:13,fontWeight:700,color:"var(--text2)"}}>GENERAL MANAGER NOTES / YEAR-END SUMMARY</div>
          <button className="bp" style={{fontSize:12,padding:"4px 14px"}} onClick={()=>{
            try{localStorage.setItem("ec_kpi_notes",JSON.stringify(kpiNotes));}catch(err){}
            showToast("Notes saved ✓");
          }}>&#128190; Save Notes</button>
        </div>
        <textarea value={engNotes.general||""} onChange={e=>setNote("general",e.target.value)}
          rows={4} placeholder="Overall performance summary, key achievements, areas for improvement, next year goals…"
          style={{width:"100%",background:"var(--bg2)",border:"1px solid var(--border3)",borderRadius:6,color:"var(--text2)",fontSize:13,padding:"8px 10px",resize:"vertical",fontFamily:"inherit",boxSizing:"border-box"}}/>
        <div style={{fontSize:11,color:"var(--text4)",marginTop:4}}>Notes saved to your browser (localStorage) — persist across sessions.</div>
      </div>

      {/* Improvement actions checklist */}
      <div style={{padding:"10px 12px",background:"var(--bg2)",borderRadius:6,border:"1px solid var(--border3)"}}>
        <div style={{fontSize:12,fontWeight:700,color:"var(--text2)",marginBottom:8}}>HEAD OFFICE IMPROVEMENT ACTIONS (Annual Form)</div>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:5}}>
          {["Process optimization","Training recommendation","Daily project monitoring","Regular one-to-one discussions","Other corrective measures"].map((a,i)=>(
            <div key={i} style={{display:"flex",gap:6,alignItems:"center",fontSize:12,color:"var(--text3)"}}>
              <div style={{width:6,height:6,borderRadius:1,background:"var(--border)",flexShrink:0}}/>
              {a}
            </div>
          ))}
        </div>
        <div style={{fontSize:11,color:"var(--text4)",marginTop:8,fontStyle:"italic"}}>📋 Use this data to fill the annual head office review form — scores, hours, and notes above feed directly into the 4 criteria.</div>
      </div>
    </div>);
  })()}
</div>
  );
}

export default function App(){
  const [session,setSession]         = useState(null);
  const [authLoading,setAuthLoading] = useState(true);

  // ── Theme ──
  const [isDark,setIsDark] = useState(()=>localStorage.getItem("erp_theme")!=="light");
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
  const [notifications,setNotifications] = useState([]);
  // Panel ALWAYS starts closed — user opens manually by clicking the bell header
  // sessionStorage remembers if user left it open (not closed)
  const [notifPanelOpen,setNotifPanelOpen] = useState(false);
  const toggleNotifPanel = React.useCallback(()=>{
    setNotifPanelOpen(prev=>!prev);
  },[]);
  const [myProfile,setMyProfile]     = useState(null);
  const [loading,setLoading]         = useState(false);

  const [view,setView]               = useState("dashboard");
  const [teamViewMode,setTeamViewMode] = useState("org"); // "org" | "grid"
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
  const [subProjModal,setSubProjModal]     = useState(null);  // {projectId, sub?} — add/edit sub-project
  const [expandedProj,setExpandedProj]     = useState({});    // {projId: bool} — show sub-projects in table
  const [showEngModal,setShowEngModal]     = useState(false);
  const [engSearch,setEngSearch]           = useState("");
  const [editEngModal,setEditEngModal]     = useState(null);
  const [adminTab,setAdminTab]             = useState("engineers"); // will be overridden by role redirect
  const [kpiYear,setKpiYear]               = useState(new Date().getFullYear());
  const [alertDay,setAlertDay]             = useState(5); // 1=Mon,2=Tue,3=Wed,4=Thu,5=Fri
  const [funcYear,setFuncYear]             = useState(new Date().getFullYear());
  const [funcEngId,setFuncEngId]           = useState("all");
  const [kpiEngId,setKpiEngId]            = useState(null);
  const [kpiNotes,setKpiNotes]             = useState(()=>{try{return JSON.parse(localStorage.getItem('ec_kpi_notes')||'{}');}catch{return{};}}); // {engId: {A:"",B:"",C:"",D:"",general:""}}
  const [activities,setActivities]         = useState([]);
  const [subprojects,setSubprojects]       = useState([]);
  const [activitiesLoaded,setActivitiesLoaded] = useState(false);

  const [showFuncModal,setShowFuncModal]   = useState(false);
  const [newFunc,setNewFunc]               = useState({engineer_id:"",date:new Date().toISOString().slice(0,10),function_category:FUNCTION_CATS[0],hours:2,activity:""});

  // ── Finance Module State ──
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
  const [pwdForm,setPwdForm]               = useState({newPwd:"",confirmPwd:""});
  const [pwdMsg,setPwdMsg]                 = useState(null); // {ok:bool, text:string}
  const [newStaff,setNewStaff]             = useState({name:"",department:"Engineering",role:"",salary_usd:0,salary_egp:0,type:"full_time",active:true,join_date:null,termination_date:null,email:"",level:"Mid",role_type:"engineer",notes:""});
  const [newExp,setNewExp]                 = useState({category:"Office Rent & Utilities",description:"",amount_usd:0,amount_egp:0,currency:"USD",entry_rate:null,month:new Date().getMonth(),year:new Date().getFullYear(),notes:""});
  const [entryFilter,setEntryFilter]       = useState({engineer:"ALL",project:"ALL",month:today.getMonth(),year:today.getFullYear()});
  const [newEntry,setNewEntry]   = useState({projectId:"",_group:"SCADA",taskCategory:"Templates",taskType:"Block Template",hours:8,activity:"",type:"work",leaveType:LEAVE_TYPES[0],activityId:null,_actCat:null,_actSub:null,_step:1});
  const [newProj,setNewProj]     = useState({id:"",name:"",type:"Renewable Energy",client:"",origin:"Romania HQ",phase:"Design",billable:true,rate_per_hour:85,status:"Active"});
  const [newEng,setNewEng]       = useState({name:"",role:ROLES_LIST[0],level:"Mid",email:"",role_type:"engineer",is_active:true,join_date:null,termination_date:null,weekend_days:JSON.stringify(DEFAULT_WEEKEND)});

  const showToast=(msg,ok=true)=>{setToast({msg,ok});setTimeout(()=>setToast(null),3500);};

  // ── Activity logger — fire-and-forget, never blocks UI ──
  const logAction=useCallback((action,module,detail,meta={})=>{
    if(!session?.user) return;
    const entry={
      user_id:session.user.id,
      user_name:myProfile?.name||session.user.email||"unknown",
      user_role:myProfile?.role_type||"unknown",
      action,module,detail,
      meta:JSON.stringify(meta),
    };
    supabase.from("activity_log").insert(entry).select()
      .then(({data,error})=>{
        if(error){
          console.error("[ActivityLog] Insert failed:",error.message,"| payload:",entry);
        } else if(data){
          setActivityLog(prev=>[{...entry,id:data[0]?.id,created_at:new Date().toISOString()},...prev].slice(0,2000));
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
  // Does NOT rely on is_active column — works with no DB migration.
  const TODAY_STR = new Date().toISOString().slice(0,10);
  const isEngActive = (e) => {
    if(!e) return false;
    // termination_date strictly in the past (before today) → inactive; last day counts as active
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
  const canPostHours = !canViewFinance || isAdmin; // senior+accountant view timesheets read-only
  const canInvoice= isAcct; // ONLY admin + accountant see invoices — NOT senior
  // Redirect away from old mysettings page (merged into Admin › Info)
  useEffect(()=>{
    if(view==="mysettings") setView("dashboard");
  },[view]);
  // When accountant/senior first opens Finance Panel, default to Finance tab
  useEffect(()=>{
    if(canViewFinance&&!isAdmin&&view==="admin"){
      setAdminTab(prev=>prev==="engineers"?"finance":prev);
    }
  },[canViewFinance,isAdmin,view]);

  const viewEngId = canEditAny ? (browseEngId||myProfile?.id) : myProfile?.id;
  const viewEng   = engineers.find(e=>e.id===viewEngId);

  /* ── AUTH ── */
  useEffect(()=>{
    supabase.auth.getSession().then(({data:{session}})=>{setSession(session);setAuthLoading(false);});
    const {data:{subscription}}=supabase.auth.onAuthStateChange((_,s)=>setSession(s));
    return ()=>subscription.unsubscribe();
  },[]);
  useEffect(()=>{if(session)loadAll();},[session]);
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
      const [engsR,projR,entrR,profR,notifR,staffR,expR,journalR,assetsR,accountsR]=await Promise.all([
        supabase.from("engineers").select("*").order("name"),
        supabase.from("projects").select("*").order("id"),
        supabase.from("time_entries").select("*").order("date",{ascending:false}),
        supabase.from("engineers").select("*").eq("user_id",session.user.id).single(),
        supabase.from("notifications").select("*").order("created_at",{ascending:false}),
        supabase.from("staff").select("*").order("name"),
        supabase.from("expenses").select("*").order("year",{ascending:false}).order("month",{ascending:false}),
        supabase.from("journal_entries").select("*").order("entry_date",{ascending:true}),
        supabase.from("finance_fixed_assets").select("*"),
        supabase.from("finance_accounts").select("*"),
      ]);
      if(engsR.data) setEngineers(engsR.data);
      if(projR.data) setProjects(projR.data);
      if(entrR.data) setEntries(entrR.data);
      if(profR.data){ setMyProfile(profR.data); setBrowseEngId(profR.data.id); }
      if(notifR.data){
        // Deduplicate timesheet alerts by alert_key — keep only newest per key, delete duplicates
        const all = notifR.data;
        const seenKeys = new Map(); // alert_key -> keep newest (highest id)
        const toDelete = [];
        // Load dismissed keys from localStorage
        const dismissedKeys = new Set(JSON.parse(localStorage.getItem("ec_dismissed_alerts")||"[]"));
        // First pass: group by alert_key for timesheet_alert type
        all.forEach(n=>{
          if(n.type==="timesheet_alert"){
            let key=null;
            try{ key=JSON.parse(n.meta||"{}").alert_key; }catch{}
            if(key){
              // If already dismissed by user — delete from DB entirely
              if(dismissedKeys.has(key)){ toDelete.push(n.id); return; }
              if(seenKeys.has(key)){
                const prev=seenKeys.get(key);
                if(n.id>prev.id){ toDelete.push(prev.id); seenKeys.set(key,n); }
                else { toDelete.push(n.id); }
              } else { seenKeys.set(key,n); }
            }
          }
        });
        // Also delete read rows (legacy)
        all.filter(n=>n.read).forEach(n=>toDelete.push(n.id));
        if(toDelete.length) supabase.from("notifications").delete().in("id",[...new Set(toDelete)]).then(()=>{});
        const deduped = all.filter(n=>!n.read && !toDelete.includes(n.id));
        setNotifications(deduped);
      }
      if(staffR.data){
        const sData=staffR.data;
        setStaff(sData);
        // Sync termination_date from staff → engineers by name match
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
      // Load activity log for admin — use profR.data directly (myProfile state is stale here)
      if(profR.data?.role_type==="admin"){
        setLogLoading(true);
        supabase.from("activity_log").select("*").order("created_at",{ascending:false}).limit(2000)
          .then(({data})=>{ if(data) setActivityLog(data); setLogLoading(false); });
      }
      // Timesheet alerts: checked via checkTimesheetAlerts called from useEffect below
    }catch(e){showToast("Error loading data",false);}
    setLoading(false);
  },[session]);

  // Load activities + subprojects lazily when tracker tab is first visited
  const loadTrackerData=useCallback(async()=>{
    if(activitiesLoaded) return;
    try{
      const [spRes,actRes]=await Promise.all([
        supabase.from("project_subprojects").select("*").order("name"),
        supabase.from("project_activities").select("*").order("sort_order"),
      ]);
      if(spRes.data)  setSubprojects(spRes.data);
      if(actRes.data) setActivities(actRes.data);
      setActivitiesLoaded(true);
    }catch(e){
      // Tables may not exist yet — mark loaded so UI doesn't keep retrying
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
    setSession(null);setEngineers([]);setProjects([]);setEntries([]);setMyProfile(null);setStaff([]);setExpenses([]);setJournalEntries([]);setFixedAssets([]);
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

  // ─── Org Chart loader ───
  const loadOrgChart = useCallback(async()=>{
    if(!session) return;
    const{data}=await supabase.from("org_chart").select("*").order("sort_order");
    if(data) setOrgNodes(data);
    setOrgLoaded(true);
  },[session]);

  useEffect(()=>{ if(session&&!orgLoaded) loadOrgChart(); },[session,orgLoaded,loadOrgChart]);



  const unreadCount=notifications.length; // all rows are unread (dismissed = deleted)

  // Dismiss = permanently delete from DB so they never come back on refresh
  const dismissNotification=useCallback(async(id)=>{
    const n=notifications.find(x=>x.id===id);
    // For timesheet alerts, track in sessionStorage so they don't re-insert this session
    if(n?.type==="timesheet_alert"){
      try{
        const meta=JSON.parse(n.meta||"{}");
        if(meta.alert_key){
          const prev=JSON.parse(localStorage.getItem("ec_dismissed_alerts")||"[]");
          localStorage.setItem("ec_dismissed_alerts",JSON.stringify([...new Set([...prev,meta.alert_key])]));
        }
      }catch(e){}
    }
    await supabase.from("notifications").delete().eq("id",id);
    setNotifications(prev=>prev.filter(x=>x.id!==id));
  },[notifications]);

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
    await supabase.from("notifications").delete().in("id",ids);
    setNotifications(prev=>prev.filter(n=>n.type!==type));
  },[notifications]);

  const markAllRead=async()=>{
    // Delete all read notifications to keep table clean
    const ids=notifications.filter(n=>!n.read).map(n=>n.id);
    if(!ids.length) return;
    await supabase.from("notifications").delete().in("id",ids);
    setNotifications(prev=>prev.filter(n=>n.read));
  };

  /* ── WEEKEND SAVE ── */
  // saveWeekendFor: saves weekend for any engineer by id (admin can set for others)
  const saveWeekendFor=async(engId,days)=>{
    await supabase.from("engineers").update({weekend_days:JSON.stringify(days)}).eq("id",engId);
    setEngineers(prev=>prev.map(e=>e.id===engId?{...e,weekend_days:JSON.stringify(days)}:e));
    if(engId===myProfile?.id) setMyProfile(p=>({...p,weekend_days:JSON.stringify(days)}));
    showToast("Weekend preference saved ✓");
  };
  // saveMyWeekend: shortcut for current user
  const saveMyWeekend=async days=>saveWeekendFor(myProfile.id,days);

  /* ── ADD ENTRY ── */
  /* ── Project eligibility: which projects can a given engineer post work hours to? ──
     Rules:
     1. Project must be Active (not Completed, On Hold, or any other status)
     2. If project has assigned_engineers list with at least 1 entry →
        engineer MUST be in that list
     3. If project has empty assigned_engineers → visible to ALL engineers
     4. Admins/Leads/Accountants/Senior posting ON BEHALF of an engineer
        → use the TARGET engineer's assignment, not the poster's role
  */
  const getPostableProjects = useCallback((forEngineerId) => {
    // Rule — no exceptions, no role bypasses:
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
    const proj=projects.find(p=>p.id===newEntry.projectId);
    const engId=canEditAny?viewEngId:myProfile.id;
    const isFunc=newEntry.type==="function";
    const isLeave=newEntry.type==="leave";
    const funcCat=isFunc?(newEntry.taskType||newEntry.function_category||FUNCTION_CATS[0]):null;
    const actId=(!isLeave&&!isFunc&&newEntry.activityId)?newEntry.activityId:null;
    // Validate: work entries must have a project
    if(!isLeave&&!isFunc&&!newEntry.projectId){showToast("Please select a project",false);return;}
    // Validate: admin posting for engineer must have engineer selected
    if(canEditAny&&!viewEngId){showToast("Please select an engineer",false);return;}
    // Validate: project must still be Active
    if(!isLeave&&!isFunc){
      const targetProj=projects.find(p=>p.id===newEntry.projectId);
      if(!targetProj){showToast("Project not found",false);return;}
      if((targetProj.status||"").trim()!=="Active"){showToast(`Cannot post hours — project is ${targetProj.status||"inactive"}`,false);return;}
      // Assignment check — no role exemptions:
      // The target engineer (engId) MUST be in assigned_engineers, always.
      const ae=(targetProj.assigned_engineers||[]).map(String);
      if(!ae.includes(String(engId))){
        const targetEngName=engineers.find(e=>String(e.id)===String(engId))?.name||"Engineer";
        showToast(`${targetEngName} is not assigned to ${targetProj.id}`,false);
        return;
      }
    }
    const selectedAct = actId ? activities.find(a=>String(a.id)===String(actId)) : null;
    const basePayload={
      engineer_id:engId,
      project_id: (isLeave||isFunc)?null:newEntry.projectId,
      date,
      task_category:(isLeave)?null:isFunc?"Function":(newEntry._group||newEntry.taskCategory),
      task_type:   (isLeave)?null:isFunc?funcCat:selectedAct?(selectedAct.activity_name):(newEntry.taskType||newEntry.taskCategory),
      hours:       isLeave?8:+newEntry.hours,
      activity:    newEntry.activity,
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
    setModalDate(null);
    setNewEntry({projectId:"",_group:"SCADA",taskCategory:"Templates",taskType:"Block Template",hours:8,activity:"",type:"work",leaveType:LEAVE_TYPES[0],activityId:null,_actCat:null,_actSub:null,_step:1});
    showToast("Hours posted ✓");
    const _engName = engineers.find(e=>String(e.id)===String(engId))?.name||engId;
    const _onBehalf = String(engId)!==String(myProfile?.id) ? ` on behalf of ${_engName}` : "";
    logAction("CREATE","TimeEntry",`Posted ${basePayload.hours}h on ${basePayload.project_id||basePayload.entry_type} for ${basePayload.date}${_onBehalf}`,{engineer_id:engId,engineer_name:_engName,project_id:basePayload.project_id,hours:basePayload.hours,date:basePayload.date,entry_type:basePayload.entry_type});
  };


  /* ── Copy a day's entries to clipboard ── */
  const copyDay = date => {
    const dayEntries = entries.filter(e=>e.date===date&&e.engineer_id===(canEditAny?viewEngId:myProfile.id));
    if(!dayEntries.length){showToast("No entries to copy",false);return;}
    setClipboard({date, entries:dayEntries});
    showToast(`Copied ${dayEntries.length} entr${dayEntries.length===1?"y":"ies"} from ${date} ✓`);
  };

  /* ── Paste clipboard entries to target date ── */
  const pasteDay = async targetDate => {
    if(!clipboard||!clipboard.entries.length){showToast("Nothing in clipboard",false);return;}
    if(!isDateAllowed(targetDate)){showToast("Cannot post to locked date",false);return;}
    const engId = canEditAny?viewEngId:myProfile.id;
    // Validate all work entries reference still-active projects
    for(const e of clipboard.entries){
      if(e.entry_type==="work"&&e.project_id){
        const proj=projects.find(p=>p.id===e.project_id);
        if(!proj||(proj.status||"").trim()!=="Active"){
          showToast(`Cannot paste — project ${proj?.name||e.project_id} (${e.project_id}) is no longer active`,false);return;
        }
        const ae=(proj.assigned_engineers||[]).map(String);
        if(!ae.includes(String(engId))){
          const nm=engineers.find(x=>String(x.id)===String(engId))?.name||"Engineer";
          const projName=proj?.name||e.project_id;
          showToast(`Cannot paste — ${nm} is not assigned to ${projName} (${e.project_id})`,false);return;
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
      activity:    e.activity,
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
    if(data) setEntries(prev=>[...data,...prev]);
    const _engName2 = engineers.find(e=>String(e.id)===String(engId))?.name||engId;
    const _onBehalf2 = String(engId)!==String(myProfile?.id) ? ` on behalf of ${_engName2}` : "";
    showToast(`Pasted ${inserts.length} entr${inserts.length===1?"y":"ies"} to ${targetDate} ✓`);
    logAction("CREATE","TimeEntry",`Pasted ${inserts.length} entries to ${targetDate}${_onBehalf2}`,{engineer_id:engId,engineer_name:_engName2,date:targetDate,count:inserts.length});
  };

  const saveEditEntry=async()=>{
    if(!editEntry) return;
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
    setEditEntry(null); showToast("Entry updated ✓");
    const _editEngName = engineers.find(e=>String(e.id)===String(editEntry?.engineer_id))?.name||"";
    const _editOnBehalf = editEntry?.engineer_id && String(editEntry.engineer_id)!==String(myProfile?.id) ? ` on behalf of ${_editEngName}` : "";
    const _prevEntry = entries.find(e=>e.id===editEntry?.id)||{};
    const _entryChanges=[];
    if(_prevEntry.hours!==payload.hours) _entryChanges.push(`hours: ${_prevEntry.hours}→${payload.hours}`);
    if(_prevEntry.project_id!==payload.project_id) _entryChanges.push(`project: ${_prevEntry.project_id||"—"}→${payload.project_id||"—"}`);
    if(payload.activity&&_prevEntry.activity!==payload.activity) _entryChanges.push(`note: "${payload.activity}"`);
    logAction("UPDATE","TimeEntry",`Updated entry on ${editEntry?.date}${_editOnBehalf}${_entryChanges.length?" — "+_entryChanges.join(", "):""}`,{id:editEntry?.id,engineer_id:editEntry?.engineer_id,engineer_name:_editEngName,date:editEntry?.date,changes:_entryChanges});
  };

  const deleteEntry=async(id, engineerId)=>{
    if(!canEditAny && String(engineerId)!==String(myProfile?.id)) { showToast("You can only delete your own entries",false); return; }
    if(!window.confirm("Delete this entry?")) return;
    const {error}=await supabase.from("time_entries").delete().eq("id",id);
    if(error){showToast("Error",false);return;}
    setEntries(prev=>prev.filter(e=>e.id!==id));
    const _delEngName = engineers.find(e=>String(e.id)===String(engineerId))?.name||engineerId;
    const _delOnBehalf = String(engineerId)!==String(myProfile?.id) ? ` on behalf of ${_delEngName}` : "";
    showToast("Deleted",false);
    logAction("DELETE","TimeEntry",`Deleted time entry id:${id}${_delOnBehalf}`,{id,engineer_id:engineerId,engineer_name:_delEngName});
  };

  /* ── FUNCTION ENTRIES & KPI ALERTS ── */
  const addFunctionEntry=useCallback(async()=>{
    if(!newFunc.engineer_id){showToast("Select an engineer",false);return;}
    if(!newFunc.hours||newFunc.hours<=0){showToast("Enter hours > 0",false);return;}
    // function_category column requires SQL migration — try with it, fallback without
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
    showToast("Function hours posted ✓");
    const _funcEngName=engineers.find(e=>String(e.id)===String(newFunc.engineer_id))?.name||newFunc.engineer_id;
    const _funcOnBehalf=String(newFunc.engineer_id)!==String(myProfile?.id)?` on behalf of ${_funcEngName}`:"";
    logAction("CREATE","TimeEntry",`Posted function ${newFunc.hours}h — ${newFunc.function_category} for ${newFunc.date}${_funcOnBehalf}`,{engineer_id:newFunc.engineer_id,engineer_name:_funcEngName,category:newFunc.function_category,hours:newFunc.hours,date:newFunc.date});
    setShowFuncModal(false);
    setNewFunc({engineer_id:"",date:new Date().toISOString().slice(0,10),function_category:FUNCTION_CATS[0],hours:2,activity:""});
  },[newFunc,showToast]);

  // Check for engineers who haven't posted hours by Friday — only alerts on Fri/Sat/Sun
  const checkTimesheetAlerts=useCallback(async(engs,allE,staffList=[],currentNotifs=[])=>{
    if(!isAdmin&&!isLead) return;
    const today=new Date();
    const dayOfWeek=today.getDay();
    const isEndOfWeek=dayOfWeek===0||(dayOfWeek>=alertDay&&dayOfWeek<=6);
    if(!isEndOfWeek) return;
    const mondayOffset=dayOfWeek===0?-6:1-dayOfWeek;
    const weekStart=new Date(today);weekStart.setDate(today.getDate()+mondayOffset);weekStart.setHours(0,0,0,0);
    const friday=new Date(weekStart);friday.setDate(weekStart.getDate()+4);
    const weekStartStr=weekStart.toISOString().slice(0,10);
    const fridayStr=friday.toISOString().slice(0,10);
    const todayStr=today.toISOString().slice(0,10);

    const laggards=[];
    engs.forEach(eng=>{
      if(["accountant","senior_management","admin"].includes(eng.role_type)) return;
      if(eng.is_active===false) return;
      if(eng.termination_date&&String(eng.termination_date).slice(0,10)<todayStr) return;
      const staffMatch=staffList.find(s=>s.name?.trim().toLowerCase()===eng.name?.trim().toLowerCase());
      if(staffMatch){
        if(staffMatch.active===false) return;
        if(staffMatch.termination_date&&String(staffMatch.termination_date).slice(0,10)<todayStr) return;
      }
      const hasWeekHours=allE.some(e=>String(e.engineer_id)===String(eng.id)&&e.date>=weekStartStr&&e.date<=fridayStr&&(e.entry_type==="work"||(e.entry_type==="function"||e.task_category==="Function")));
      if(!hasWeekHours) laggards.push({eng,type:"weekly",label:`No hours posted this week (Mon ${weekStartStr} → Fri ${fridayStr})`});
    });

    if(laggards.length===0) return;

    // Build set of already-known alert keys from: current state + sessionStorage
    // This is the only source of truth — no DB round trip needed
    const knownKeys = new Set([
      ...currentNotifs.map(n=>{ try{ return JSON.parse(n.meta||"{}").alert_key; }catch{ return null; } }).filter(Boolean),
      ...JSON.parse(localStorage.getItem("ec_dismissed_alerts")||"[]"),
    ]);

    for(const{eng,type,label}of laggards){
      const key=`timesheet_alert_${eng.id}_${type}_${weekStartStr}`;
      if(knownKeys.has(key)) continue;
      await supabase.from("notifications").insert({
        type:"timesheet_alert",
        message:`⏰ ${eng.name}: ${label}`,
        meta:JSON.stringify({engineer_id:eng.id,alert_key:key,alert_type:type}),
        read:false
      });
      knownKeys.add(key); // prevent double-insert within same loop
    }
  },[isAdmin,isLead,alertDay]);

  // Run alert check once when user first logs in (engineers+entries loaded)
  const alertsRanRef = React.useRef(false);
  useEffect(()=>{
    if(!session||(!isAdmin&&!isLead)) return;
    if(alertsRanRef.current) return;
    if(!engineers.length||!entries.length) return;
    alertsRanRef.current = true;
    // Capture notifications snapshot NOW so checkTimesheetAlerts skips already-shown alerts
    const notifSnapshot = notifications.slice();
    setTimeout(()=>checkTimesheetAlerts(engineers,entries,staff,notifSnapshot),1500);
  },[session,engineers.length,entries.length]); // eslint-disable-line

  /* ── FINANCE CRUD ── */
  const STAFF_DEPTS=["Engineering","Management","Finance","Operations","IT","Administration","Other"];
  const STAFF_TYPES=["full_time","part_time","contractor","intern"];
  const EXP_CATS=["Office Rent & Utilities","Salaries","Software & Subscriptions","Travel & Transportation","Equipment & Supplies","Other"];

  const saveStaff=useCallback(async()=>{
    const raw=editStaff?{...editStaff}:{...newStaff};
    if(!raw.name.trim()){showToast("Name required",false);return;}
    // ONLY columns that exist in the staff table — strip engineer-only fields
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
      // ── EDIT staff ──
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
      showToast("Staff updated ✓");setEditStaff(null);setShowStaffModal(false);
      const _sprev=staff.find(s=>s.id===editStaff.id)||{};
      const _schanges=[];
      if(_sprev.role!==data.role) _schanges.push(`role: "${_sprev.role||"—"}"→"${data.role||"—"}"`);
      if(_sprev.department!==data.department) _schanges.push(`dept: ${_sprev.department}→${data.department}`);
      if(String(_sprev.active)!==String(data.active)) _schanges.push(`active: ${_sprev.active}→${data.active}`);
      if(_sprev.termination_date!==data.termination_date) _schanges.push(`termination: ${_sprev.termination_date||"none"}→${data.termination_date||"none"}`);
      if(_sprev.salary_egp!==data.salary_egp) _schanges.push(`salary EGP: ${_sprev.salary_egp||0}→${data.salary_egp||0}`);
      logAction("UPDATE","Staff",`Updated staff: ${data.name}${_schanges.length?" — "+_schanges.join(", "):""}`,{id:data.id,name:data.name,department:data.department,role:data.role,changes:_schanges});
    } else {
      // ── ADD staff ──
      const{data,error}=await supabase.from("staff").insert(staffPayload).select().single();
      if(error){showToast("Error: "+error.message,false);return;}
      setStaff(prev=>[...prev,data].sort((a,b)=>a.name.localeCompare(b.name)));
      // Auto-create engineer record — check by name OR email to prevent duplication
      const existsEngByName=engineers.find(e=>e.name?.trim().toLowerCase()===data.name?.trim().toLowerCase());
      const existsEngByEmail=raw.email?.trim()?engineers.find(e=>e.email?.trim().toLowerCase()===raw.email.trim().toLowerCase()):null;
      const existsEng=existsEngByName||existsEngByEmail;
      // Also check: if staff record already existed before this insert (was added via Add Member previously)
      // In that case the engineer record already exists — just show the linked message
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
          showToast("Member added ✓ — appears in Team + Finance");
          logAction("CREATE","Staff",`Added staff+engineer: ${data.name}`,{id:data.id,name:data.name,role:data.role,department:data.department});
        } else {
          showToast("Staff added ✓ — set salary in Finance › Staff");
          logAction("CREATE","Staff",`Added staff (no engineer link): ${data.name}`,{id:data.id,name:data.name});
        }
      } else if(existsEng){
        showToast("Staff added ✓ — linked to existing engineer profile");
        logAction("CREATE","Staff",`Added staff (linked to existing engineer): ${data.name}`,{id:data.id,name:data.name});
      } else {
        showToast("Staff added ✓ — provide email to grant system access");
        logAction("CREATE","Staff",`Added staff (no email/access): ${data.name}`,{id:data.id,name:data.name});
      }
      setShowStaffModal(false);
      setNewStaff({name:"",department:"Engineering",role:"",salary_usd:0,salary_egp:0,type:"full_time",active:true,join_date:null,termination_date:null,email:"",level:"Mid",role_type:"engineer",notes:""});
    }
  },[editStaff,newStaff,engineers,showToast]);

  const deleteStaff=useCallback(async(id)=>{
    if(!window.confirm("Delete this staff member?")) return;
    const name=staff.find(s=>s.id===id)?.name||id;
    await supabase.from("staff").delete().eq("id",id);
    setStaff(prev=>prev.filter(s=>s.id!==id));
    logAction("DELETE","Staff",`Deleted staff member: ${name}`,{id,name});
  },[staff,logAction]);

  const saveExpense=useCallback(async()=>{
    const payload=editExp?{...editExp}:{...newExp};
    if(!payload.description.trim()){showToast("Description required",false);return;}
    if(editExp){
      const{data,error}=await supabase.from("expenses").update(payload).eq("id",editExp.id).select().single();
      if(!error&&data){
        const _prev=expenses.find(e=>e.id===data.id)||{};
        const _expChanges=[];
        if(_prev.description!==data.description) _expChanges.push(`desc: "${_prev.description}"→"${data.description}"`);
        if(_prev.category!==data.category) _expChanges.push(`category: ${_prev.category}→${data.category}`);
        if(_prev.amount_egp!==data.amount_egp) _expChanges.push(`EGP: ${_prev.amount_egp||0}→${data.amount_egp||0}`);
        if(_prev.amount_usd!==data.amount_usd) _expChanges.push(`USD: ${_prev.amount_usd||0}→${data.amount_usd||0}`);
        setExpenses(prev=>prev.map(e=>e.id===data.id?data:e));showToast("Expense updated");setEditExp(null);setShowExpModal(false);
        logAction("UPDATE","Expense",`Updated expense: ${data.description}${_expChanges.length?" — "+_expChanges.join(", "):""}`,{id:data.id,category:data.category,amount_usd:data.amount_usd,amount_egp:data.amount_egp,changes:_expChanges});
      }
      else showToast(error?.message||"Error",false);
    } else {
      const{data,error}=await supabase.from("expenses").insert(payload).select().single();
      if(!error&&data){setExpenses(prev=>[data,...prev]);showToast("Expense added");setShowExpModal(false);setNewExp({category:"Office Rent & Utilities",description:"",amount_usd:0,amount_egp:0,currency:"USD",entry_rate:egpRate,month:new Date().getMonth(),year:new Date().getFullYear(),notes:""});logAction("CREATE","Expense",`Added expense: "${payload.description}" — ${payload.category} · EGP ${payload.amount_egp||0} / USD ${payload.amount_usd||0}`,{category:payload.category,amount_usd:payload.amount_usd,amount_egp:payload.amount_egp,month:payload.month,year:payload.year});}
      else showToast(error?.message||"Error",false);
    }
  },[editExp,newExp,showToast]);

  const deleteExpense=useCallback(async(id)=>{
    if(!window.confirm("Delete this expense?")) return;
    const exp=expenses.find(e=>e.id===id);
    await supabase.from("expenses").delete().eq("id",id);
    setExpenses(prev=>prev.filter(e=>e.id!==id));
    logAction("DELETE","Expense",`Deleted expense: ${exp?.description||id}`,{id,description:exp?.description});
  },[expenses,logAction]);

  /* ── EXCEL IMPORT ── */
  const importTimesheets=async files=>{
    setImporting(true);
    setImportLog([]);
    const log=[];
    const addLog=(type,msg)=>{log.push({type,msg});setImportLog([...log]);};

    // Working copies of projects/engineers (updated during import as new ones are created)
    let localProjects=[...projects];
    let localEngineers=[...engineers];

    // Cache of name→project to avoid duplicate inserts across rows
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
      // Auto-create — use "Industrial" type (matches DB constraint)
      // Make a safe ID: alphanumeric + hyphens only, max 30 chars
      const projId=clean.replace(/[^a-zA-Z0-9]/g,"-").replace(/-+/g,"-").replace(/^-|-$/g,"").substring(0,30);
      addLog("info",`    📁 Creating project: ${clean}`);
      const {data:newPArr,error:pErr}=await supabase.from("projects").insert({
        id:projId, name:clean, client:"(imported)", type:"Industrial",
        status:"Active", phase:"Design", billable:true, rate_per_hour:0,
      }).select();
      if(pErr){
        addLog("warn",`    ⚠ Project failed: ${pErr.message}`);
        projCache[cleanLower]=null; // cache failure to avoid retrying every row
        return null;
      }
      const newP=Array.isArray(newPArr)?newPArr[0]:newPArr;
      if(!newP){ projCache[cleanLower]=null; return null; }
      localProjects=[...localProjects,newP];
      setProjects(prev=>[...prev,newP].sort((a,b)=>a.id.localeCompare(b.id)));
      addLog("ok",`    ✓ Project created: ${clean} (${projId})`);
      projCache[cleanLower]=newP;
      return newP;
    };

    for(const file of files){
      addLog("info",`📂 Processing: ${file.name}`);
      try{
        const buf=await file.arrayBuffer();
        const XLSX=window.XLSX;
        if(!XLSX){addLog("error","SheetJS not loaded — go back and wait for ✓ XLSX READY, then try again");break;}
        const wb=XLSX.read(new Uint8Array(buf),{type:"array",cellDates:true});
        const ws=wb.Sheets[wb.SheetNames[0]];
        const rows=XLSX.utils.sheet_to_json(ws,{header:1,defval:"",raw:true});


        // ── FIX: Detect column layout — standard (col 0) vs shifted (col 4, Shehab-style) ──
        // Standard: row[0]=Date/Name, row[1]=email value, row[2]=task...
        // Shifted:  row[4]=Name label, row[5]=Name value, row[6]=task...
        let colOffset=0;
        const r0=String(rows[0]?.[0]||"").trim().toLowerCase();
        const r0c4=String(rows[0]?.[4]||"").trim().toLowerCase();
        if(!r0&&r0c4==="name"){ colOffset=4; addLog("info","  ℹ Shifted column layout detected (offset +4)"); }

        // Parse header (row 0=Name, row 1=Email, row 2=Month)
        const engName=String(rows[0]?.[colOffset+1]||"").trim();
        const engEmail=String(rows[1]?.[colOffset+1]||"").trim().toLowerCase();
        const engRole=String(rows[0]?.[colOffset+4]||"").trim();

        if(!engName||!engEmail){addLog("error","  ✕ Missing name/email in header rows");continue;}
        addLog("info",`  👤 ${engName} <${engEmail}>`);

        // Find or create engineer
        let eng=localEngineers.find(e=>(e.email||"").toLowerCase()===engEmail);
        if(!eng){
          const {data:eArr,error:eErr}=await supabase.from("engineers").insert({
            name:engName,email:engEmail,
            role:engRole||"Automation Engineer",
            level:"Mid",role_type:"engineer",
            weekend_days:JSON.stringify([5,6])
          }).select();
          if(eErr){addLog("error",`  ✕ Engineer failed: ${eErr.message}`);continue;}
          eng=Array.isArray(eArr)?eArr[0]:eArr;
          if(!eng){addLog("error","  ✕ Engineer insert returned no data");continue;}
          localEngineers=[...localEngineers,eng];
          setEngineers(prev=>[...prev,eng].sort((a,b)=>a.name.localeCompare(b.name)));
          addLog("ok",`  ✓ Created engineer: ${engName}`);
        } else {
          addLog("info",`  → Existing engineer: ${eng.name}`);
        }

        // ── LOCAL DATE HELPER: always use local year/month/day, never toISOString() ──
        // SheetJS cellDates:true returns Date at local midnight — toISOString() shifts in UTC+ zones
        const localDateStr=(d)=>{
          // Add 12 hours then use UTC methods — handles SheetJS storing local midnight as UTC
          // e.g. Egypt UTC+2: "2026-02-01 local" stored as "2026-01-31T22:00Z"
          // +12h → "2026-02-01T10:00Z" → getUTCFullYear/Month/Date = 2026/1/1 = Feb 1 ✓
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

        // ── DETECT IMPORT MONTH ──
        // SheetJS with cellDates:true + raw:true returns date cells as Date objects OR serial numbers
        // depending on browser/version. Handle all cases explicitly.
        // Strategy: try every possible representation of the Month cell and all early data rows.
        let importYear=year, importMonth=month;

        const extractYearMonth=(raw)=>{
          if(!raw) return null;
          // SheetJS stores date cells as UTC midnight of the LOCAL date
          // e.g. Egypt UTC+2: Feb 1 00:00 local = Jan 31 22:00 UTC
          // getMonth() on this UTC date returns January — WRONG
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
        addLog("info",`  📅 Month: ${moStr}/${yrStr} (${monthStart} → ${monthEnd})`);

        // Delete existing entries for this engineer+month
        const {data:existingRows,error:fetchErr}=await supabase
          .from("time_entries").select("id")
          .eq("engineer_id",eng.id).gte("date",monthStart).lte("date",monthEnd);
        if(fetchErr){
          addLog("warn",`  ⚠ Fetch error: ${fetchErr.message}`);
        } else {
          addLog("info",`  🔍 Found ${existingRows?.length||0} existing entries`);
          if(existingRows&&existingRows.length>0){
            const ids=existingRows.map(r=>r.id);
            const {error:delErr}=await supabase.from("time_entries").delete().in("id",ids);
            if(delErr) addLog("warn",`  ⚠ Delete failed: ${delErr.message}`);
            else{ setEntries(prev=>prev.filter(e=>!ids.includes(e.id))); addLog("ok",`  ✓ Cleared ${ids.length} old entries`); }
          } else { addLog("ok","  ✓ No existing entries — fresh import"); }
        }

        // ── PARSE DATA ROWS ──
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

          // ── STOP: skip rows outside the import month (e.g. Mar rows in a Feb sheet) ──
          if(dateStr<monthStart||dateStr>monthEnd){ skipped++; continue; }

          // Read task/hours/project/details — use colOffset for shifted layouts
          const task       =String(row[colOffset+2]||"").trim();
          const hoursRaw   =row[colOffset+3];
          const projName   =String(row[colOffset+4]||"").trim();
          const taskDetails=String(row[colOffset+5]||"").trim();

          const projLower   =projName.toLowerCase();
          const taskLower   =task.toLowerCase();
          const detailsLower=taskDetails.toLowerCase();
          const hours=typeof hoursRaw==="number"?hoursRaw:(hoursRaw?parseFloat(String(hoursRaw)):0);

          // ── WEEKEND: day-of-week check (local noon to avoid UTC shift) ──
          const dow=new Date(dateStr+"T12:00:00").getDay(); // 0=Sun…5=Fri,6=Sat
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

          // ── VACATION: explicit vacation keyword in task, regardless of project column ──
          // (some engineers put "Vacation" in both task AND project — detect by task only)
          const isVacationTask=taskLower==="vacation"||taskLower==="annual leave"
            ||taskLower==="sick leave"||taskLower==="unpaid leave";
          const isVacationDetail=detailsLower.includes("vacation");

          // ── PUBLIC HOLIDAY / NATIONAL DAY ──
          const isHoliday=(taskLower.includes("holiday")||taskLower.includes("national day")
            ||detailsLower.includes("holiday"))&&!projName;

          // ── TRAINING with no project → Training External leave ──
          const isTrainingNoProj=(taskLower==="training"||taskLower.includes("training"))
            &&!projName&&hours>0;

          // ── FIRST DAY marker → skip it as a plain note (no leave, no work) ──
          const isFirstDayMarker=taskLower.includes("first day")||taskLower.includes("(first day)");

          // ── IMPLICIT ABSENCE: empty workday row ──
          // Only count as absence if we've seen at least one working day (avoids pre-employment period)
          const isImplicitAbsence=allEmpty&&!engWeekend.includes(dow)&&firstDaySeen;

          // ── CLASSIFY ──
          if(isHoliday){
            const {error:lErr}=await supabase.from("time_entries").upsert({
              engineer_id:eng.id,date:dateStr,hours:8,
              entry_type:"leave",leave_type:"Public Holiday",billable:false
            },{onConflict:"engineer_id,date,entry_type,leave_type",ignoreDuplicates:false});
            if(!lErr){inserted++;leaveCnt++; firstDaySeen=true;}
            else addLog("warn",`  ⚠ Holiday ${dateStr}: ${lErr.message}`);
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
            else addLog("warn",`  ⚠ Leave(${lvType}) ${dateStr}: ${lErr.message}`);
            continue;
          }

          if(isTrainingNoProj){
            const {error:lErr}=await supabase.from("time_entries").upsert({
              engineer_id:eng.id,date:dateStr,hours,
              entry_type:"leave",leave_type:"Training External",billable:false
            },{onConflict:"engineer_id,date,entry_type,leave_type",ignoreDuplicates:false});
            if(!lErr){inserted++;leaveCnt++; firstDaySeen=true;}
            else addLog("warn",`  ⚠ Training ${dateStr}: ${lErr.message}`);
            continue;
          }

          if(isFirstDayMarker){
            // First day orientation — log as Training External, mark employment start
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
            else addLog("warn",`  ⚠ Absence ${dateStr}: ${lErr.message}`);
            continue;
          }

          // ── WORK ENTRY: must have task + hours + project ──
          if(!task||isNaN(hours)||hours<=0||!projName) continue;
          firstDaySeen=true;

          const proj=await findOrCreateProject(projName);

          // Map task → category/type
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

          const activity=taskDetails||(task+(projName?` — ${projName}`:""));

          const {error:eErr}=await supabase.from("time_entries").upsert({
            engineer_id:eng.id,
            project_id:proj?.id||null,
            date:dateStr,hours,
            task_category:cat,task_type:typ,
            activity,entry_type:"work",
            billable:proj?.billable||false,
          },{onConflict:"engineer_id,date,project_id,task_type",ignoreDuplicates:false});
          if(!eErr) inserted++;
          else{addLog("warn",`  ⚠ Entry ${dateStr} failed: ${eErr.message}`);skipped++;}
        }
        addLog("ok",`  ✓ Done: ${inserted} entries (${leaveCnt} leave, ${skipped} skipped)`);
      }catch(err){
        addLog("error",`  ✕ Parse error: ${err.message}`);
      }
    }
    addLog("info","✅ All files processed — refreshing...");
    await loadAll();
    setImporting(false);
    logAction("IMPORT","Import",`Imported ${files.length} timesheet file(s)`,{files:files.map(f=>f.name)});
  };

  const bulkDeleteEntries=async()=>{
    if(selectedEntries.size===0) return;
    if(!window.confirm(`Delete ${selectedEntries.size} selected entries?`)) return;
    const ids=[...selectedEntries];
    const {error}=await supabase.from("time_entries").delete().in("id",ids);
    if(error){showToast("Error: "+error.message,false);return;}
    setEntries(prev=>prev.filter(e=>!selectedEntries.has(e.id)));
    setSelectedEntries(new Set());
    showToast(`Deleted ${ids.length} entries`);
    logAction("DELETE","TimeEntry",`Bulk deleted ${ids.length} time entries`,{count:ids.length});
  };

  /* ── PROJECT CRUD ── */
  const addProject=async()=>{
    if(!newProj.id||!newProj.name){showToast("Number and name required",false);return;}
    const projToInsert={...newProj,assigned_engineers:newProj.assigned_engineers||[]};
    const {data,error}=await supabase.from("projects").insert(projToInsert).select().single();
    if(error){showToast("Error: "+error.message,false);return;}
    setProjects(prev=>[...prev,data].sort((a,b)=>a.id.localeCompare(b.id)));
    setShowProjModal(false);
    setNewProj({id:"",name:"",type:"Renewable Energy",client:"",origin:"Romania HQ",phase:"Design",billable:true,rate_per_hour:85,status:"Active"});
    showToast("Project created ✓");
    logAction("CREATE","Project",`Created project ${newProj.id} — ${newProj.name}`,{project_id:newProj.id,name:newProj.name});
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
      setEditProjModal(null); showToast("Project ID renamed & entries re-linked ✓");
      logAction("UPDATE","Project",`Renamed project ${origId} → ${newId}`,{old_id:origId,new_id:newId});
    } else {
      const{id,...fields}=rest;
      let {data,error}=await supabase.from("projects").update(fields).eq("id",id).select().single();
      if(error&&error.message&&error.message.includes("assigned_engineers")){
        const{assigned_engineers:_ae,...fieldsNoAE}=fields;
        const res=await supabase.from("projects").update(fieldsNoAE).eq("id",id).select().single();
        data=res.data; error=res.error;
        if(!error) showToast("⚠ Saved — but run the 'Assigned Engineers' migration in Admin › Info to enable assignment tracking",false);
      }
      if(error){showToast("Error: "+error.message,false);return;}
      if(data){
        setProjects(prev=>prev.map(p=>p.id===data.id?{...data,assigned_engineers:fields.assigned_engineers||[]}:p));
      }
      setEditProjModal(null); showToast("Project updated ✓");
      const _pprev=projects.find(p=>p.id===editProjModal?.id)||{};
      const _pchanges=[];
      if(_pprev.name!==rest.name) _pchanges.push(`name: "${_pprev.name}"→"${rest.name}"`);
      if(_pprev.client!==rest.client) _pchanges.push(`client: "${_pprev.client||"—"}"→"${rest.client||"—"}"`);
      if(_pprev.billable!==rest.billable) _pchanges.push(`billable: ${_pprev.billable}→${rest.billable}`);
      if(_pprev.status!==rest.status) _pchanges.push(`status: ${_pprev.status||"—"}→${rest.status||"—"}`);
      logAction("UPDATE","Project",`Updated project ${editProjModal?.id}${_pchanges.length?" — "+_pchanges.join(", "):""}`,{project_id:editProjModal?.id,changes:_pchanges});
    }
  };
  const deleteProject=async id=>{
    if(!window.confirm(`Delete ${id} and all its entries? This also removes all activities and sub-sites.`)) return;
    await supabase.from("time_entries").delete().eq("project_id",id);
    await supabase.from("project_activities").delete().eq("project_id",id).then(()=>{});
    await supabase.from("project_subprojects").delete().eq("project_id",id).then(()=>{});
    await supabase.from("projects").delete().eq("id",id);
    setProjects(prev=>prev.filter(p=>p.id!==id));
    setEntries(prev=>prev.filter(e=>e.project_id!==id));
    setActivities(prev=>prev.filter(a=>a.project_id!==id));
    setSubprojects(prev=>prev.filter(s=>s.project_id!==id));
    showToast("Project deleted",false);
    logAction("DELETE","Project",`Deleted project ${id}`,{project_id:id});
  };

  /* ── SUB-PROJECT CRUD ── */
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
    setSubProjModal(null); showToast("Sub-project added ✓");
    logAction("CREATE","Project",`Added sub-project: ${data.name} (${pid})`,{subproject_id:data.id,name:data.name,project_id:pid});
  };
  const saveSubProject=async(sub)=>{
    const{id,...fields}=sub;
    const{data,error}=await supabase.from("project_subprojects")
      .update(fields).eq("id",id).select().single();
    if(error){showToast("Error: "+error.message,false);return;}
    setSubprojects(prev=>prev.map(s=>s.id===data.id?data:s));
    setSubProjModal(null); showToast("Sub-project saved ✓");
    logAction("UPDATE","Project",`Updated sub-project: ${data.name}`,{subproject_id:data.id,name:data.name});
  };
  const deleteSubProject=async(id)=>{
    if(!window.confirm("Delete this sub-project and unlink its activities?")) return;
    const sub=subprojects.find(s=>s.id===id);
    // Unlink activities (set subproject_id to null)
    await supabase.from("project_activities").update({subproject_id:null}).eq("subproject_id",id);
    await supabase.from("project_subprojects").delete().eq("id",id);
    setSubprojects(prev=>prev.filter(s=>s.id!==id));
    setActivities(prev=>prev.map(a=>String(a.subproject_id)===String(id)?{...a,subproject_id:null}:a));
    showToast("Sub-project deleted",false);
    logAction("DELETE","Project",`Deleted sub-project: ${sub?.name||id}`,{subproject_id:id,name:sub?.name});
  };

  /* ── ENGINEER CRUD ── */
  const addEngineer=async()=>{
    if(!newEng.name.trim()){showToast("Name required",false);return;}
    if(!newEng.email.trim()){showToast("Email required",false);return;}

    // Try inserting with progressively fewer columns until one works
    // This handles ANY schema state — missing columns, wrong types, constraints
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
      // Attempt 4: absolute minimum — just name, role, level, role_type
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
    showToast("Member added ✓ — set salary in Finance › Staff");
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
    setEditEngModal(null); showToast("Updated ✓");
    const _prev=engineers.find(e=>e.id===id)||{};
    const _changes=[];
    if(_prev.name!==merged.name) _changes.push(`name: "${_prev.name}"→"${merged.name}"`);
    if(_prev.role!==merged.role) _changes.push(`job role: "${_prev.role||"—"}"→"${merged.role||"—"}"`);
    if(_prev.role_type!==merged.role_type) _changes.push(`access: ${_prev.role_type}→${merged.role_type}`);
    if(_prev.level!==merged.level) _changes.push(`level: "${_prev.level||"—"}"→"${merged.level||"—"}"`);
    if(String(_prev.is_active)!==String(merged.is_active)) _changes.push(`active: ${_prev.is_active}→${merged.is_active}`);
    if(_prev.termination_date!==merged.termination_date) _changes.push(`termination: ${_prev.termination_date||"none"}→${merged.termination_date||"none"}`);
    logAction("UPDATE","Engineer",`Updated engineer: ${merged.name}${_changes.length?" — "+_changes.join(", "):""}`,{id,name:merged.name,role_type:merged.role_type,is_active:merged.is_active,termination_date:merged.termination_date||null,changes:_changes});
  };
  const deleteEngineer=async id=>{
    if(!window.confirm("Delete this engineer and all their entries?")) return;
    const eng=engineers.find(e=>e.id===id);
    await supabase.from("time_entries").delete().eq("engineer_id",id);
    await supabase.from("engineers").delete().eq("id",id);
    setEngineers(prev=>prev.filter(e=>e.id!==id));
    setEntries(prev=>prev.filter(e=>e.engineer_id!==id));
    // Remove from all project assigned_engineers lists
    setProjects(prev=>prev.map(p=>({...p,assigned_engineers:(p.assigned_engineers||[]).filter(x=>String(x)!==String(id))})));
    // Clear from activities assigned_to
    if(eng) setActivities(prev=>prev.map(a=>a.assigned_to===eng.name?{...a,assigned_to:""}:a));
    showToast("Removed",false);
    logAction("DELETE","Engineer",`Deleted engineer: ${eng?.name||id}`,{id,name:eng?.name});
  };

  /* ── DERIVED STATS ── */
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
    const d=new Date(e.date+"T12:00:00"); // noon avoids UTC midnight date shift in UTC+ timezones
    return (entryFilter.engineer==="ALL"||e.engineer_id===+entryFilter.engineer)
      &&(entryFilter.project==="ALL"||e.project_id===entryFilter.project)
      &&d.getMonth()===entryFilter.month&&d.getFullYear()===entryFilter.year;
  }),[entries,entryFilter]);

  /* ── PDF builds ── */
  const buildUtilizationPDF=()=>{
    generatePDF(`Team Utilization — ${MONTHS[month]} ${year}`,[
      `<div class="section"><div class="st">KPIs</div><div class="kg">
        <div class="kp"><div class="kv">${fmtPct(overallUtil)}</div><div class="kl">Utilization</div></div>
        <div class="kp"><div class="kv">${fmtPct(billabilityPct)}</div><div class="kl">Billability</div></div>
        <div class="kp"><div class="kv">${totalWorkHrs}h</div><div class="kl">Work Hours</div></div>
        <div class="kp"><div class="kv">${fmtCurrency(totalRevenue)}</div><div class="kl">Revenue</div></div>
      </div></div>`,
      `<div class="section"><div class="st">Individual Breakdown</div>
      <table><thead><tr><th>Engineer</th><th>Level</th><th>Target Hrs</th><th>Work Hrs</th><th>Billable Hrs</th><th>Leave</th><th>Utilization</th><th>Billability</th><th>Revenue</th></tr></thead>
      <tbody>${engStats.map(e=>{
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

    // ── DERIVED METRICS ──
    const nonBillableHrs=totalWorkHrs-totalBillable;
    const nonBillablePct=totalWorkHrs?Math.round(nonBillableHrs/totalWorkHrs*100):0;
    const avgRate=totalBillable>0?totalRevenue/totalBillable:0;
    const costOfNonBillable=Math.round(nonBillableHrs*avgRate);
    const uniqueTaskTypes=[...new Set(workEntries.map(e=>e.task_type).filter(Boolean))].length;
    const uniqueEngineers=[...new Set(workEntries.map(e=>e.engineer_id))].length;
    const avgHrsPerEntry=workEntries.length?(totalWorkHrs/workEntries.length).toFixed(1):0;

    // ── PREVIOUS MONTH COMPARISON ──
    const prevMonth=month===0?11:month-1;
    const prevYear=month===0?year-1:year;
    const prevWE=entries.filter(e=>{const d=new Date(e.date+"T12:00:00");return d.getFullYear()===prevYear&&d.getMonth()===prevMonth&&e.entry_type==="work";});
    const prevTotalHrs=prevWE.reduce((s,e)=>s+e.hours,0);
    const prevCatMap={};
    prevWE.forEach(e=>{const g=e.task_category||CAT_TO_GROUP[e.task_type]||"General";prevCatMap[g]=(prevCatMap[g]||0)+e.hours;});

    // ── TOP ACTIVITIES ──
    const actMap={};
    workEntries.forEach(e=>{
      if(!e.activity)return;
      const k=`${e.task_type||""}|||${e.activity}`;
      if(!actMap[k])actMap[k]={task:e.task_type||"—",activity:e.activity,hrs:0,count:0,billable:0};
      actMap[k].hrs+=e.hours; actMap[k].count++;
      const p=projects.find(x=>x.id===e.project_id);
      if(p&&p.billable)actMap[k].billable+=e.hours;
    });
    const topActivities=Object.values(actMap).sort((a,b)=>b.hrs-a.hrs).slice(0,12);

    // ── ENGINEER × CATEGORY MATRIX ──
    const activeEngs=engStats.filter(e=>e.workHrs>0);
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

    // ── COLORS ──
    const CLRS=["#0ea5e9","#a78bfa","#34d399","#fb923c","#f87171","#e879f9","#facc15","#4ade80","#f472b6","#60a5fa","#2dd4bf","#f97316"];
    const ccm={};taskStats.forEach((t,i)=>{ccm[t.category]=CLRS[i%CLRS.length];});

    // ── SECTION 1: EXECUTIVE KPIs ──
    const hrsVsPrev=prevTotalHrs>0?totalWorkHrs-prevTotalHrs:null;
    const s1=`<div class="section"><div class="st">Executive Summary — ${period}</div>
      <div style="display:grid;grid-template-columns:repeat(5,1fr);gap:10px;margin-bottom:12px">
        ${[
          {l:"Total Hours",    v:totalWorkHrs+"h",          c:"#0ea5e9", sub:uniqueEngineers+" engineers · "+workEntries.length+" entries"},
          {l:"Billable Hours", v:totalBillable+"h",         c:"#34d399", sub:fmtPct(billabilityPct)+" of total"},
          {l:"Non-Billable",   v:nonBillableHrs+"h",        c:"#fb923c", sub:fmtPct(nonBillablePct)+" of total"},
          {l:"Utilization",    v:fmtPct(overallUtil),       c:overallUtil>=70?"#34d399":"#f87171", sub:"Benchmark ≥ 70%"},
          {l:"Revenue",        v:fmtCurrency(totalRevenue), c:"#38bdf8", sub:avgRate>0?"$"+Math.round(avgRate)+"/h avg rate":"—"},
        ].map(k=>`<div style="background:#f0f7ff;border:1px solid #bfdbfe;border-radius:8px;padding:12px;text-align:center">
          <div style="font-family:'IBM Plex Mono',monospace;font-size:17px;font-weight:700;color:${k.c};line-height:1">${k.v}</div>
          <div style="font-size:10px;color:#64748b;text-transform:uppercase;letter-spacing:.07em;margin-top:4px;font-weight:600">${k.l}</div>
          <div style="font-size:10px;color:#94a3b8;margin-top:3px">${k.sub}</div>
        </div>`).join("")}
      </div>
      <div style="background:#f8fafc;border-radius:6px;padding:8px 14px;display:flex;gap:16px;flex-wrap:wrap;font-size:11px;color:#64748b;align-items:center">
        <span>📋 Avg ${avgHrsPerEntry}h per entry</span>
        <span>·</span><span>🗂 ${uniqueTaskTypes} task types across ${taskStats.length} categories</span>
        ${hrsVsPrev!==null?`<span style="margin-left:auto;font-weight:700;color:${hrsVsPrev>=0?"#16a34a":"#dc2626"}">${hrsVsPrev>=0?"▲ +":"▼ "}${hrsVsPrev}h vs ${MONTHS[prevMonth]} ${prevYear}</span>`:""}
      </div>
    </div>`;

    // ── SECTION 2: CATEGORY VISUAL DISTRIBUTION ──
    const s2=`<div class="section"><div class="st">Task Category Distribution</div>
      <div style="font-size:11px;color:#64748b;margin-bottom:10px;padding:6px 10px;background:#fffbeb;border-left:3px solid #f59e0b;border-radius:0 4px 4px 0">
        ⚡ Industry benchmarks for engineering firms: Billable ≥ 70% · Internal overhead ≤ 20% · Training / R&D ≤ 10%
      </div>
      ${taskStats.map((cat,i)=>{
        const pct=totalWorkHrs?Math.round(cat.hours/totalWorkHrs*100):0;
        const billPct=cat.hours?Math.round(cat.billable/cat.hours*100):0;
        const col=ccm[cat.category]||"#0ea5e9";
        const delta=prevCatMap[cat.category]!=null?cat.hours-(prevCatMap[cat.category]||0):null;
        const topTasks=Object.entries(cat.tasks).sort((a,b)=>b[1].hrs-a[1].hrs).slice(0,3).map(([k,v])=>`${k} (${v.hrs}h)`).join("  ·  ");
        return`<div style="margin-bottom:10px;padding:10px 12px;background:${i%2===0?"#f8fafc":"#ffffff"};border-radius:6px;border-left:3px solid ${col}">
          <div style="display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:5px">
            <div>
              <span style="font-weight:700;color:#0f172a;font-size:13px">${cat.category}</span>
              <span style="margin-left:10px;font-size:10px;color:#94a3b8">${topTasks}</span>
            </div>
            <div style="display:flex;gap:10px;align-items:center;font-family:'IBM Plex Mono',monospace;font-size:12px;white-space:nowrap">
              <span style="color:${col};font-weight:700">${cat.hours}h</span>
              <span style="background:${col}22;color:${col};padding:1px 6px;border-radius:3px;font-weight:700">${pct}%</span>
              ${delta!==null?`<span style="font-size:10px;color:${delta>=0?"#16a34a":"#dc2626"}">${delta>=0?"▲+":"▼"}${delta}h</span>`:""}
            </div>
          </div>
          <div style="background:#e2e8f0;height:9px;border-radius:5px;overflow:hidden;display:flex">
            <div style="width:${pct}%;display:flex;overflow:hidden;border-radius:5px 0 0 5px">
              <div style="width:${billPct}%;background:#34d399;min-width:${cat.billable>0?2:0}px"></div>
              <div style="flex:1;background:${col}"></div>
            </div>
          </div>
          <div style="display:flex;gap:16px;margin-top:4px;font-size:10px;color:#94a3b8">
            <span style="color:#16a34a;font-weight:600">✓ Billable ${cat.billable}h (${billPct}%)</span>
            <span>◻ Non-bill ${cat.hours-cat.billable}h (${100-billPct}%)</span>
            <span style="margin-left:auto">${Object.keys(cat.tasks).length} task type${Object.keys(cat.tasks).length!==1?"s":""}</span>
          </div>
        </div>`;
      }).join("")}
    </div>`;

    // ── SECTION 3: BILLABILITY & EFFICIENCY ──
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
                <span style="font-family:'IBM Plex Mono',monospace;color:${r.c};font-weight:700">${r.h}h — ${w}%</span>
              </div>
              <div style="background:#e2e8f0;height:7px;border-radius:4px;overflow:hidden">
                <div style="height:100%;width:${w}%;background:${r.c};border-radius:4px"></div>
              </div>
            </div>`;
          }).join("")}
          ${avgRate>0&&costOfNonBillable>0?`<div style="margin-top:12px;padding:10px 12px;background:#fff7ed;border:1px solid #fed7aa;border-radius:6px;font-size:11px;color:#9a3412">
            <div style="font-weight:700;margin-bottom:3px">💰 Non-Billable Opportunity Cost</div>
            <div style="font-family:'IBM Plex Mono',monospace;font-size:14px;color:#c2410c;font-weight:700">${fmtCurrency(costOfNonBillable)}</div>
            <div style="color:#b45309;margin-top:2px">${nonBillableHrs}h × $${Math.round(avgRate)}/h blended rate</div>
          </div>`:""}
          <div style="margin-top:12px;padding:10px 12px;background:${billabilityPct>=70?"#f0fdf4":"#fff7ed"};border:1px solid ${billabilityPct>=70?"#bbf7d0":"#fed7aa"};border-radius:6px;font-size:11px">
            <span style="font-weight:700;color:${billabilityPct>=70?"#166534":"#92400e"}">
              ${billabilityPct>=70?"✅ Billability target met":"⚠ Below 70% billability target"}
            </span>
            <div style="color:#64748b;margin-top:2px">Current: ${fmtPct(billabilityPct)} · Target: ≥ 70% · Gap: ${billabilityPct>=70?"None":"+"+(70-billabilityPct)+"% needed"}</div>
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
              const rating=bp>=70?"✅ Good":bp>=40?"⚡ Fair":"⚠ Low";
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

    // ── SECTION 4: TASK TYPE DEEP DIVE ──
    const s4=`<div class="section"><div class="st">Task Type Detail — Within Each Category</div>
      ${taskStats.map(cat=>{
        const col=ccm[cat.category]||"#0ea5e9";
        const subs=Object.entries(cat.tasks).sort((a,b)=>b[1].hrs-a[1].hrs);
        const cols=Math.min(subs.length,3);
        return`<div style="margin-bottom:14px">
          <div style="font-size:12px;font-weight:700;color:#0f172a;padding:6px 10px;background:#f1f5f9;border-left:4px solid ${col};border-radius:0 5px 5px 0;margin-bottom:6px;display:flex;justify-content:space-between">
            <span>${cat.category}</span>
            <span style="font-family:'IBM Plex Mono',monospace;color:${col}">${cat.hours}h total · ${subs.length} type${subs.length!==1?"s":""}</span>
          </div>
          <div style="display:grid;grid-template-columns:repeat(${cols},1fr);gap:6px;padding-left:6px">
            ${subs.map(([taskType,data])=>{
              const tpct=cat.hours?Math.round(data.hrs/cat.hours*100):0;
              const topAct=Object.entries(data.activities).sort((a,b)=>b[1]-a[1])[0];
              return`<div style="background:#f8fafc;border:1px solid #e2e8f0;border-top:2px solid ${col};border-radius:0 0 5px 5px;padding:7px 9px">
                <div style="font-weight:600;color:#334155;font-size:11px;margin-bottom:2px">${taskType}</div>
                <div style="font-family:'IBM Plex Mono',monospace;font-size:14px;font-weight:700;color:${col}">${data.hrs}h <span style="font-size:10px;color:#94a3b8;font-weight:400">${tpct}%</span></div>
                ${topAct?`<div style="font-size:9px;color:#94a3b8;font-style:italic;margin-top:3px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">↳ ${topAct[0]}</div>`:""}
              </div>`;
            }).join("")}
          </div>
        </div>`;
      }).join("")}
    </div>`;

    // ── SECTION 5: ENGINEER × CATEGORY MATRIX ──
    const s5=engCatMatrix.length>0?`<div class="section"><div class="st">Engineer × Task Category Matrix</div>
      <div style="overflow-x:auto">
      <table style="font-size:11px;width:100%">
        <thead><tr>
          <th style="text-align:left;white-space:nowrap;padding:5px 8px">Engineer</th>
          <th style="text-align:right;padding:5px 6px">Total</th>
          <th style="text-align:right;padding:5px 6px">Bill%</th>
          ${allCats.map(c=>`<th style="text-align:right;padding:5px 5px;font-size:10px;max-width:55px;overflow:hidden;white-space:nowrap" title="${c}">${c.length>9?c.slice(0,9)+"…":c}</th>`).join("")}
          <th style="text-align:left;padding:5px 8px;font-size:10px">Top Focus</th>
        </tr></thead>
        <tbody>${engCatMatrix.map((eng,ri)=>`<tr style="background:${ri%2===0?"#f8fafc":"#fff"}">
          <td style="padding:5px 8px;font-weight:600;white-space:nowrap">${eng.name}<br><span style="font-size:10px;color:#94a3b8;font-weight:400">${eng.role||""}</span></td>
          <td style="text-align:right;padding:5px 6px;font-family:'IBM Plex Mono',monospace;color:#0ea5e9;font-weight:700">${eng.workHrs}h</td>
          <td style="text-align:right;padding:5px 6px;font-family:'IBM Plex Mono',monospace;font-weight:700;color:${eng.billability>=70?"#16a34a":eng.billability>=40?"#d97706":"#dc2626"}">${eng.billability}%</td>
          ${allCats.map(c=>{const h=eng.catHrs[c]||0;const col=ccm[c]||"#0ea5e9";
            return`<td style="text-align:right;padding:5px 5px;font-family:'IBM Plex Mono',monospace;font-size:11px;color:${h>0?col:"#cbd5e1"}">${h>0?h+"h":"—"}</td>`;
          }).join("")}
          <td style="padding:5px 8px;font-size:10px;color:#64748b">${eng.topCat?eng.topCat[0]+" ("+eng.topCat[1]+"h)":"—"}</td>
        </tr>`).join("")}</tbody>
      </table>
      </div>
    </div>`:"";

    // ── SECTION 6: TOP ACTIVITIES ──
    const s6=topActivities.length>0?`<div class="section"><div class="st">Top Activities by Hours — What the Team Is Actually Working On</div>
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
            <td style="text-align:right;font-family:'IBM Plex Mono',monospace;color:#94a3b8">${a.count}×</td>
            <td style="text-align:right;font-family:'IBM Plex Mono',monospace;font-weight:700;color:${bp>=70?"#16a34a":bp>=40?"#d97706":"#94a3b8"}">${a.hrs>0?bp+"%":"—"}</td>
            <td style="text-align:right;font-family:'IBM Plex Mono',monospace;color:#94a3b8">${pct}%</td>
          </tr>`;
        }).join("")}</tbody>
      </table>
    </div>`:"";

    generatePDF(
      `Task Analysis Report — ${period}`,
      [s1,s2,s3,s4,s5,s6],
      `Task &amp; Productivity Analysis · ${period} · Confidential`
    );
  };
  const buildMonthlyPDF=()=>{
    generatePDF(`Monthly Management Report — ${MONTHS[month]} ${year}`,[
      `<div class="section"><div class="st">Summary</div><div class="kg">
        <div class="kp"><div class="kv">${fmtPct(overallUtil)}</div><div class="kl">Team Utilization</div></div>
        <div class="kp"><div class="kv">${fmtPct(billabilityPct)}</div><div class="kl">Billability</div></div>
        <div class="kp"><div class="kv">${fmtCurrency(totalRevenue)}</div><div class="kl">Revenue</div></div>
        <div class="kp"><div class="kv">${leaveEntries.length}</div><div class="kl">Absences</div></div>
      </div></div>`,
      `<div class="section"><div class="st">Engineer Performance</div><table><thead><tr><th>Engineer</th><th>Util.</th><th>Bill.</th><th>Work Hrs</th><th>Revenue</th><th>Leave</th></tr></thead>
      <tbody>${engStats.map(e=>`<tr><td><strong>${e.name}</strong><br><span style="font-size:11px;color:#64748b">${e.role||""}</span></td>
        <td>${fmtPct(e.utilization)}</td><td>${fmtPct(e.billability)}</td><td>${e.workHrs}h</td>
        <td style="color:#0ea5e9">${fmtCurrency(e.revenue)}</td><td>${e.leaveDays}d</td></tr>`).join("")}</tbody></table></div>`,
      `<div class="section"><div class="st">Projects</div><table><thead><tr><th>No.</th><th>Project</th><th>PM</th><th>Phase</th><th>Hours</th><th>Revenue</th></tr></thead>
      <tbody>${projStats.filter(p=>p.hours>0).map(p=>`<tr>
        <td style="color:#0ea5e9;font-size:11px">${p.id}</td><td>${p.name}</td><td style="color:#a78bfa;font-size:11px">${p.pm||"—"}</td><td>${p.phase||""}</td>
        <td>${p.hours}h</td><td>${p.billable?fmtCurrency(p.revenue):"—"}</td></tr>`).join("")}</tbody></table></div>`],
      "Prepared for Senior Management");
  };

  /* ── LOADING ── */
  if(authLoading) return(
    <div style={{display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",minHeight:"100vh",background:"var(--bg0)",gap:16}}>
      <img src={LOGO_SRC} alt="ENEVO Group" style={{width:110,height:110,borderRadius:18,opacity:0.9}}/>
      <div style={{fontFamily:"'IBM Plex Mono',monospace",color:"var(--info)",fontSize:15,letterSpacing:".1em"}}>Loading ENEVO GROUP…</div>
    </div>
  );

  /* ── AUTH SCREEN ── */
  if(!session) return(
    <div style={{minHeight:"100vh",background:"var(--bg0)",display:"flex",alignItems:"center",justifyContent:"center",fontFamily:"'IBM Plex Sans',sans-serif"}}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=IBM+Plex+Sans:wght@400;600;700&family=IBM+Plex+Mono:wght@400;600&display=swap');*{box-sizing:border-box;margin:0;padding:0}input,select{background:var(--input-bg);border:1px solid var(--border3);color:var(--text1);padding:10px 14px;border-radius:7px;font-family:'IBM Plex Sans',sans-serif;font-size:15px;outline:none;width:100%;transition:border-color .2s}input:focus,select:focus{border-color:var(--info)}select option{background:var(--input-bg)}.bp{background:linear-gradient(135deg,#0ea5e9,#0369a1);border:none;color:#fff;padding:11px;border-radius:7px;cursor:pointer;font-family:'IBM Plex Sans',sans-serif;font-size:16px;font-weight:700;display:flex;align-items:center;justify-content:center}.bp:hover{opacity:.85}`}</style>
      <div style={{background:"var(--bg1)",border:"1px solid var(--border3)",borderRadius:14,padding:"36px",width:430,maxWidth:"95vw",boxShadow:"0 24px 60px #00000080"}}>
        <div style={{textAlign:"center",marginBottom:24}}>
          <div style={{display:"flex",justifyContent:"center",marginBottom:12}}>
            <img src={LOGO_SRC} alt="ENEVO Group" style={{width:130,height:130,borderRadius:22,objectFit:"contain"}}/>
          </div>
          <div style={{fontFamily:"'IBM Plex Mono',monospace",fontSize:12,color:"var(--info)",letterSpacing:".18em",marginBottom:6}}>ENEVO GROUP</div>
          <div style={{fontSize:22,fontWeight:700,color:"var(--text0)"}}>ENEVO GROUP</div>
          <div style={{fontSize:14,color:"var(--text4)",marginTop:4}}>Industrial & Renewable Energy Automation</div>
        </div>
        {authMode==="login"?(
          <div style={{display:"grid",gap:12}}>
            {authErr&&<div style={{padding:"8px 12px",borderRadius:6,fontSize:14,background:"#450a0a",color:"#f87171",border:"1px solid #f87171"}}>{authErr}</div>}
            <div><Lbl>Email</Lbl><input type="email" value={authEmail} onChange={e=>setAuthEmail(e.target.value)} placeholder="you@company.com"/></div>
            <div><Lbl>Password</Lbl><input type="password" value={authPwd} onChange={e=>setAuthPwd(e.target.value)} onKeyDown={e=>e.key==="Enter"&&handleLogin(e)}/></div>
            <button className="bp" onClick={handleLogin}>Sign In</button>
            <div style={{textAlign:"center",fontSize:14,color:"var(--text4)"}}>New engineer? <span style={{color:"var(--info)",cursor:"pointer"}} onClick={()=>setAuthMode("signup")}>Create Account</span></div>
          </div>
        ):<SignupScreen onBack={()=>setAuthMode("login")}/>}
      </div>
    </div>
  );

  /* ════════════════════════
     MAIN LAYOUT
  ════════════════════════ */
  const navItems = [
    {id:"dashboard", icon:"▦", label:"Dashboard"},
    // Timesheet: senior sees read-only Hours Review (same as accountant)
    {id:"timesheet", icon:"⏱", label:(isAcct||isSenior)?"Hours Review":"Post Hours"},
    {id:"projects",  icon:"◈", label:"Projects"},
    {id:"team",      icon:"◉", label:"Team"},
    ...(canReport?[{id:"reports",icon:"⊞",label:"Reports & PDF"}]:[]),
    {id:"admin", icon:"⚙", label:isAdmin?"Admin Panel":isSenior?"Overview Panel":isAcct?"Finance Panel":"Lead Panel"},
    ...(isAdmin?[{id:"import",icon:"⬆",label:"Import Excel"}]:[]),
  ];

  return(
    <div style={{fontFamily:"'IBM Plex Sans',sans-serif",background:"var(--bg0)",minHeight:"100vh",color:"var(--text1)",transition:"background .3s,color .3s"}}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=IBM+Plex+Sans:wght@300;400;500;600;700&family=IBM+Plex+Mono:wght@400;500;600&display=swap');
        *{box-sizing:border-box;margin:0;padding:0}
        /* ── DARK THEME (default) ── */
        :root{
          --bg0:#07101e;--bg1:#0c1829;--bg2:#060e1c;--bg3:#0d1e33;
          --bg1g:linear-gradient(135deg,#0c1829,#0d1e34);
          --border:#1a3050;--border2:#0d1e33;--border3:#192d47;
          --sidebar:#060c18;--sidebar-border:#0d1e33;
          --nb-hover:#0d1a2d;--atab-active:#0d1a2d;
          --text0:#f0f6ff;--text1:#dde3ef;--text2:#7a8faa;--text3:#4e6479;--text4:#2e4a66;
          --accent:#0ea5e9;--info:#38bdf8;--scrollbar-thumb:#1a3354;
          --input-bg:#060e1c;--input-border:#1a3050;
          --modal-bg:#0c1829;--card-hover:#0d1e34;
          --th-bg:#060e1c;--tr-hover:#0d1e33;
        }
        /* ── LIGHT THEME ── */
        body.light{
          --bg0:#eef2f7;--bg1:#ffffff;--bg2:#f5f8fc;--bg3:#e8eef6;
          --bg1g:linear-gradient(135deg,#ffffff,#f0f5fb);
          --border:#c8d6e8;--border2:#dce6f0;--border3:#c0d0e0;
          --sidebar:#1e293b;--sidebar-border:#2d3f55;
          --nb-hover:#2d3f55;--atab-active:#1e3a5a;
          --text0:#0f172a;--text1:#1e293b;--text2:#475569;--text3:#64748b;--text4:#94a3b8;
          --accent:#0ea5e9;--info:#0284c7;--scrollbar-thumb:#94a3b8;
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
        .card{background:var(--bg1);border:1px solid var(--border);border-radius:10px;padding:18px}
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
        th{color:var(--text3);font-size:12px;font-weight:700;text-transform:uppercase;letter-spacing:.05em;padding:9px 12px;border-bottom:1px solid var(--border);text-align:left}
        td{padding:8px 12px;border-bottom:1px solid var(--border2);font-size:14px;color:var(--text1)}tr:hover td{background:var(--tr-hover)}th{background:var(--th-bg)}
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
        .role-badge{display:inline-block;padding:2px 7px;border-radius:3px;font-size:11px;font-weight:700;font-family:'IBM Plex Mono',monospace}
        /* light mode sidebar text override */
        body.light .nb{color:#94a3b8}
        body.light .nb:hover,body.light .nb.a{color:#38bdf8;background:#2d3f55}
      `}</style>

      <div style={{display:"flex"}}>
        {/* ── Sidebar ── */}
        <div style={{width:215,background:"var(--sidebar)",borderRight:`1px solid var(--sidebar-border)`,minHeight:"100vh",padding:"20px 10px",position:"fixed",top:0,left:0,bottom:0,overflowY:"auto",zIndex:50,transition:"background .3s"}}>
          <div style={{marginBottom:20,paddingLeft:6}}>
            <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:8}}>
              <LogoImg/>
              <div>
                <div style={{fontFamily:"'IBM Plex Mono',monospace",fontSize:11,color:"var(--info)",letterSpacing:".15em",fontWeight:600}}>ENEVO-ERP</div>
                <div style={{fontSize:15,fontWeight:700,color:"var(--text0)",lineHeight:1.1}}>ENEVO GROUP</div>
              </div>
            </div>
            <div style={{fontSize:12,color:"var(--text4)",fontFamily:"'IBM Plex Mono',monospace"}}>ENEVO Group</div>
          </div>
          {navItems.map(n=>(
            <button key={n.id} className={`nb ${view===n.id?"a":""}`} onClick={()=>setView(n.id)}>
              <span style={{fontFamily:"'IBM Plex Mono',monospace",fontSize:16}}>{n.icon}</span>{n.label}
              {n.id==="admin"&&unreadCount>0&&<span style={{marginLeft:"auto",background:"#ef4444",color:"#fff",fontSize:11,fontWeight:700,padding:"1px 5px",borderRadius:10}}>{unreadCount}</span>}
            </button>
          ))}
          <div style={{marginTop:14,borderTop:`1px solid var(--border)`,paddingTop:12,paddingLeft:6,paddingRight:6}}>
            <div style={{fontSize:11,color:"var(--text3)",fontWeight:700,letterSpacing:".1em",marginBottom:8}}>PERIOD</div>
            <div style={{marginBottom:8}}><Lbl>Month</Lbl>
              <select value={month} onChange={e=>setMonth(+e.target.value)} style={{fontSize:13,padding:"5px 8px"}}>
                {MONTHS.map((m,i)=><option key={i} value={i}>{m}</option>)}
              </select>
            </div>
            <div><Lbl>Year</Lbl>
              <select value={year} onChange={e=>setYear(+e.target.value)} style={{fontSize:13,padding:"5px 8px"}}>
                {[year-2,year-1,year,year+1].map(y=><option key={y}>{y}</option>)}
              </select>
            </div>
          </div>
          <div style={{position:"absolute",bottom:16,left:10,right:10}}>
            <div style={{background:"var(--bg1)",border:`1px solid var(--border)`,borderRadius:8,padding:"9px 10px"}}>
              <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:8}}>
                <div className="av" style={{width:26,height:26,fontSize:10}}>{myProfile?.name?.slice(0,2).toUpperCase()||"?"}</div>
                <div style={{minWidth:0}}>
                  <div style={{fontSize:13,fontWeight:600,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap",color:"var(--text0)"}}>{myProfile?.name||session.user.email}</div>
                  <div style={{fontSize:11,color:ROLE_COLORS[role]||"var(--text4)",fontWeight:600}}>{ROLE_LABELS[role]||role}</div>
                </div>
              </div>
              <div style={{display:"flex",gap:6,marginBottom:6}}>
                <button onClick={()=>{setShowPwdModal(true);setPwdForm({newPwd:"",confirmPwd:""});setPwdMsg(null);}} style={{flex:1,background:"transparent",border:`1px solid var(--border)`,color:"var(--text2)",padding:"5px",borderRadius:5,cursor:"pointer",fontSize:12,fontFamily:"'IBM Plex Sans',sans-serif"}}
                  onMouseEnter={e=>{e.currentTarget.style.borderColor="var(--info)";e.currentTarget.style.color="var(--info)"}}
                  onMouseLeave={e=>{e.currentTarget.style.borderColor="var(--border)";e.currentTarget.style.color="var(--text2)"}}>
                  🔑 Password
                </button>
                <button onClick={toggleTheme} title={isDark?"Switch to Light Mode":"Switch to Dark Mode"} style={{flex:1,background:"transparent",border:`1px solid var(--border)`,color:"var(--text2)",padding:"5px",borderRadius:5,cursor:"pointer",fontSize:15,fontFamily:"'IBM Plex Sans',sans-serif",transition:"all .2s"}}
                  onMouseEnter={e=>{e.currentTarget.style.borderColor="var(--info)";e.currentTarget.style.color="var(--info)"}}
                  onMouseLeave={e=>{e.currentTarget.style.borderColor="var(--border)";e.currentTarget.style.color="var(--text2)"}}>
                  {isDark?"☀️":"🌙"}
                </button>
              </div>
              <button onClick={handleLogout} style={{width:"100%",background:"transparent",border:`1px solid var(--border)`,color:"var(--text2)",padding:"5px",borderRadius:5,cursor:"pointer",fontSize:13,fontFamily:"'IBM Plex Sans',sans-serif"}}>Sign Out</button>
            </div>
          </div>
        </div>

        {/* ── Main Content ── */}
        <div style={{marginLeft:215,flex:1,padding:"24px 28px",maxWidth:"calc(100vw - 215px)",background:"var(--bg2)",color:"var(--text1)",minHeight:"100vh",transition:"background .3s"}}>
          {loading&&<div style={{textAlign:"center",padding:60,color:"var(--text4)",fontFamily:"'IBM Plex Mono',monospace"}}>Loading…</div>}
          {!loading&&<>

          {/* ════ DASHBOARD ════ */}
          {view==="dashboard"&&(
            <div>
              <div style={{marginBottom:20}}>
                <h1 style={{fontSize:21,fontWeight:700,color:"var(--text0)"}}>{isAdmin||isAcct||isLead?"Team Dashboard":"My Summary"}</h1>
                <p style={{color:"var(--text4)",fontSize:14,marginTop:3,fontFamily:"'IBM Plex Mono',monospace"}}>{MONTHS[month]} {year} · {isAdmin||isAcct||isLead?"Live Overview":"Your personal stats"}</p>
              </div>
              {/* Engineers only see their own summary */}
              {!isAdmin&&!isAcct&&!isLead&&(()=>{
                const myE=monthEntries.filter(e=>String(e.engineer_id)===String(myProfile?.id));
                const myWork=myE.filter(e=>e.entry_type==="work").reduce((s,e)=>s+e.hours,0);
                const myLeave=myE.filter(e=>e.entry_type==="leave").length;
                const myProjs=[...new Set(myE.filter(e=>e.entry_type==="work").map(e=>e.project_id).filter(Boolean))].length;
                const myTarget=getTargetHrs(year,month,myWeekend);
                const myUtil=myTarget>0?Math.round(myWork/myTarget*100):0;
                return<>
                  <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:11,marginBottom:18}}>
                    {[{l:"My Work Hours",v:myWork+"h",c:"var(--info)"},{l:"Utilization",v:fmtPct(myUtil),c:myUtil>=80?"#34d399":myUtil>=60?"#fb923c":"#f87171"},{l:"Leave Days",v:myLeave+"d",c:"#fb923c"},{l:"Projects",v:myProjs,c:"#a78bfa"}].map((s,i)=>(
                      <div key={i} className="metric"><div style={{fontSize:11,color:"var(--text4)",fontWeight:700,textTransform:"uppercase",letterSpacing:".06em"}}>{s.l}</div><div style={{fontFamily:"'IBM Plex Mono',monospace",fontSize:22,fontWeight:700,color:s.c,marginTop:8,lineHeight:1}}>{s.v}</div></div>
                    ))}
                  </div>
                  <div className="card"><h3 style={{fontSize:14,fontWeight:600,color:"var(--text2)",marginBottom:10}}>My {MONTHS[month]} Work Log</h3>
                    <table><thead><tr><th>Date</th><th>Project</th><th>Task</th><th>Activity</th><th>Hrs</th></tr></thead>
                    <tbody>{myE.filter(e=>e.entry_type==="work").sort((a,b)=>a.date.localeCompare(b.date)).map(e=>{
                      const p=projects.find(x=>x.id===e.project_id);
                      return<tr key={e.id}><td style={{fontFamily:"'IBM Plex Mono',monospace",fontSize:13}}>{e.date}</td><td style={{color:"var(--info)",fontSize:13}}>{p?.id||"—"}</td><td style={{fontSize:13,color:"var(--text2)"}}>{e.task_type||"—"}</td><td style={{fontSize:13,color:"var(--text3)",fontStyle:"italic",maxWidth:180,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{e.activity||"—"}</td><td style={{fontFamily:"'IBM Plex Mono',monospace",fontWeight:700,color:"var(--info)"}}>{e.hours}h</td></tr>;
                    })}{myE.length===0&&<tr><td colSpan={5} style={{textAlign:"center",color:"var(--text4)",padding:16}}>No entries for {MONTHS[month]} {year}. Go to Post Hours to log time.</td></tr>}
                    </tbody></table>
                  </div>
                </>;
              })()}
              {/* Admin/Lead/Accountant see full team dashboard */}
              {(isAdmin||isAcct||isLead)&&(()=>{
                // Filtered entries for dashboard
                const dEntries=dashProjFilter==="ALL"?monthEntries:monthEntries.filter(e=>e.project_id===dashProjFilter);
                const dWork=dEntries.filter(e=>e.entry_type==="work");
                const dWorkHrs=dWork.reduce((s,e)=>s+e.hours,0);
                // Always derive billable from current project status
                const dBillHrs=dWork.reduce((s,e)=>{const p=projects.find(x=>x.id===e.project_id);return s+(p&&p.billable?e.hours:0);},0);
                const dNonHrs=dWorkHrs-dBillHrs;
                const dRevenue=dWork.reduce((s,e)=>{const p=projects.find(x=>x.id===e.project_id);return s+(p&&p.billable?p.rate_per_hour*e.hours:0);},0);
                const dBillPct=dWorkHrs?Math.round(dBillHrs/dWorkHrs*100):0;
                const dLeave=dEntries.filter(e=>e.entry_type==="leave").length;
                return<>
              {/* Month + Project filter bar */}
              <div style={{display:"flex",gap:10,alignItems:"flex-end",marginBottom:16,background:"var(--bg2)",borderRadius:8,padding:"10px 14px",border:"1px solid var(--border3)"}}>
                <div style={{marginRight:"auto"}}>
                  <div style={{fontSize:12,color:"var(--text4)",fontWeight:700,marginBottom:4}}>MONTH</div>
                  <div style={{display:"flex",gap:6,alignItems:"center"}}>
                    <button style={{background:"var(--bg1)",border:"1px solid var(--border3)",borderRadius:5,padding:"4px 8px",color:"var(--text1)",cursor:"pointer",fontSize:13}} onClick={()=>{if(month===0){setMonth(11);setYear(y=>y-1);}else setMonth(m=>m-1);}}>←</button>
                    <select value={month} onChange={e=>setMonth(+e.target.value)} style={{background:"var(--bg1)",border:"1px solid var(--border3)",borderRadius:5,padding:"4px 8px",color:"var(--text0)",fontSize:14,fontFamily:"'IBM Plex Sans',sans-serif"}}>
                      {MONTHS.map((m,i)=><option key={i} value={i}>{m}</option>)}
                    </select>
                    <select value={year} onChange={e=>setYear(+e.target.value)} style={{background:"var(--bg1)",border:"1px solid var(--border3)",borderRadius:5,padding:"4px 8px",color:"var(--text0)",fontSize:14,fontFamily:"'IBM Plex Sans',sans-serif"}}>
                      {[2024,2025,2026,2027].map(y=><option key={y}>{y}</option>)}
                    </select>
                    <button style={{background:"var(--bg1)",border:"1px solid var(--border3)",borderRadius:5,padding:"4px 8px",color:"var(--text1)",cursor:"pointer",fontSize:13}} onClick={()=>{if(month===11){setMonth(0);setYear(y=>y+1);}else setMonth(m=>m+1);}}>→</button>
                  </div>
                </div>
                <div>
                  <div style={{fontSize:12,color:"var(--text4)",fontWeight:700,marginBottom:4}}>PROJECT FILTER</div>
                  <select value={dashProjFilter} onChange={e=>setDashProjFilter(e.target.value)} style={{background:"var(--bg1)",border:"1px solid var(--border3)",borderRadius:5,padding:"4px 10px",color:"var(--text0)",fontSize:14,fontFamily:"'IBM Plex Sans',sans-serif",width:220}}>
                    <option value="ALL">All Projects</option>
                    {projects.filter(p=>p.status==="Active").map(p=><option key={p.id} value={p.id}>{p.name} ({p.id})</option>)}
                  </select>
                </div>
                {dashProjFilter!=="ALL"&&<button style={{background:"transparent",border:"1px solid var(--border3)",borderRadius:5,padding:"4px 8px",color:"var(--text2)",cursor:"pointer",fontSize:12}} onClick={()=>setDashProjFilter("ALL")}>✕ All</button>}
              </div>
              {/* Warn if all projects are non-billable — guide admin to fix */}
              {(isAdmin||isAcct)&&dWorkHrs>0&&dBillHrs===0&&(
                <div style={{background:"#1a0f00",border:"1px solid #fb923c40",borderRadius:6,padding:"8px 14px",marginBottom:12,display:"flex",alignItems:"center",justifyContent:"space-between",gap:12}}>
                  <span style={{fontSize:13,color:"#fb923c"}}>⚠ All hours showing as non-billable — projects may need billable flag set. Go to Reports → Invoice Export to fix.</span>
                  <button className="bg" style={{fontSize:13,borderColor:"#fb923c",color:"#fb923c",whiteSpace:"nowrap",flexShrink:0}} onClick={()=>setView("reports")}>Fix now →</button>
                </div>
              )}
              <div style={{display:"grid",gridTemplateColumns:"repeat(6,1fr)",gap:11,marginBottom:18}}>
                {[
                  {l:"Total Work Hrs",v:dWorkHrs+"h",c:"var(--text0)",show:true},
                  {l:"Billable Hrs",v:dBillHrs+"h",c:"#34d399",show:isAdmin||isAcct||isLead},
                  {l:"Non-Billable",v:dNonHrs+"h",c:"#fb923c",show:isAdmin||isAcct},
                  {l:"Billability",v:fmtPct(dBillPct),c:"var(--info)",show:isAdmin||isAcct},
                  {l:"Revenue Billed",v:fmtCurrency(dRevenue),c:"#a78bfa",show:isAdmin||isAcct},
                  {l:"Absence Days",v:dLeave+"d",c:"#f472b6",show:true},
                ].filter(m=>m.show).map((m,i)=>(
                  <div key={i} className="metric">
                    <div style={{fontSize:11,color:"var(--text4)",fontWeight:700,textTransform:"uppercase",letterSpacing:".06em"}}>{m.l}</div>
                    <div style={{fontFamily:"'IBM Plex Mono',monospace",fontSize:22,fontWeight:700,color:m.c,marginTop:8,lineHeight:1}}>{m.v}</div>
                  </div>
                ))}
              </div>
              <div style={{display:"grid",gridTemplateColumns:"1.5fr 1fr",gap:14,marginBottom:14}}>
                <div className="card">
                  <h3 style={{fontSize:14,fontWeight:600,color:"var(--text2)",marginBottom:12}}>Team Utilization — {MONTHS[month]}</h3>
                  {engStats.length===0&&<p style={{color:"var(--text4)",fontSize:14}}>No hours logged yet.</p>}
                  {engStats.map(eng=>(
                    <div key={eng.id} style={{display:"flex",alignItems:"center",gap:8,marginBottom:8}}>
                      <div className="av" style={{fontSize:11,width:26,height:26}}>{eng.name?.slice(0,2).toUpperCase()}</div>
                      <div style={{flex:1,minWidth:0}}>
                        <div style={{display:"flex",justifyContent:"space-between",marginBottom:2}}>
                          <span style={{fontSize:13,fontWeight:500}}>{eng.name}</span>
                          <span style={{fontFamily:"'IBM Plex Mono',monospace",fontSize:12,color:"var(--info)"}}>{eng.workHrs}h · {fmtPct(eng.utilization)}</span>
                        </div>
                        <div style={{background:"var(--bg3)",height:4,borderRadius:3,overflow:"hidden"}}>
                          <div style={{height:"100%",width:`${eng.utilization}%`,borderRadius:3,background:eng.utilization>=80?"linear-gradient(90deg,#34d399,#10b981)":eng.utilization>=60?"linear-gradient(90deg,#fb923c,#f59e0b)":"linear-gradient(90deg,#f87171,#ef4444)"}}/>
                        </div>
                      </div>
                      {(isAdmin||isAcct)&&<span style={{fontFamily:"'IBM Plex Mono',monospace",fontSize:11,color:"#a78bfa",width:32,textAlign:"right"}}>{fmtPct(eng.billability)}</span>}
                    </div>
                  ))}
                </div>
                <div className="card">
                  <h3 style={{fontSize:14,fontWeight:600,color:"var(--text2)",marginBottom:12}}>Task Distribution</h3>
                  {taskStats.length===0&&<p style={{color:"var(--text4)",fontSize:14}}>No tasks logged.</p>}
                  {taskStats.map(cat=>{const pct=totalWorkHrs?Math.round(cat.hours/totalWorkHrs*100):0;return(
                    <div key={cat.category} style={{marginBottom:9}}>
                      <div style={{display:"flex",justifyContent:"space-between",marginBottom:2}}>
                        <span style={{fontSize:13}}>{cat.category}</span>
                        <span style={{fontFamily:"'IBM Plex Mono',monospace",fontSize:12,color:"var(--info)"}}>{cat.hours}h · {pct}%</span>
                      </div>
                      <div style={{background:"var(--bg3)",height:4,borderRadius:3,overflow:"hidden"}}>
                        <div className="bar" style={{width:`${pct}%`}}/>
                      </div>
                    </div>);})}
                </div>
              </div>
              <div className="card">
                <h3 style={{fontSize:14,fontWeight:600,color:"var(--text2)",marginBottom:12}}>Projects — {MONTHS[month]} {year}{dashProjFilter!=="ALL"&&` · Filtered`}</h3>
                <table>
                  <thead><tr><th>Name</th><th>No.</th><th>Phase</th><th>Hours</th>{(isAdmin||isAcct)&&<><th>Billing</th><th>Revenue</th></>}</tr></thead>
                  <tbody>{projStats.filter(p=>p.hours>0&&(dashProjFilter==="ALL"||p.id===dashProjFilter)).map(p=>(
                    <tr key={p.id}>
                      <td style={{fontSize:13,fontWeight:600}}>{p.name||p.id}</td>
                      <td style={{fontFamily:"'IBM Plex Mono',monospace",fontSize:11,color:"var(--info)"}}>{p.id}</td>
                      <td style={{color:"var(--text2)",fontSize:13}}>{p.phase}</td>
                      <td style={{fontFamily:"'IBM Plex Mono',monospace"}}>{p.hours}h</td>
                      {(isAdmin||isAcct)&&<><td><span style={{fontSize:11,padding:"2px 6px",borderRadius:3,fontFamily:"'IBM Plex Mono',monospace",fontWeight:700,background:p.billable?"var(--bg3)":"#1a0a00",color:p.billable?"var(--info)":"#fb923c"}}>{p.billable?"BILLABLE":"NON-BILL"}</span></td>
                      <td style={{fontFamily:"'IBM Plex Mono',monospace",color:"#a78bfa"}}>{p.billable?fmtCurrency(p.revenue):"—"}</td></>}
                    </tr>
                  ))}</tbody>
                </table>
              </div>
              </>;})()}
            </div>
          )}

          {/* ════ TIMESHEET ════ */}
          {view==="timesheet"&&(
            <div>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-end",marginBottom:16}}>
                <div>
                  <h1 style={{fontSize:21,fontWeight:700,color:"var(--text0)"}}>{isAcct?"Hours Review":"Post Hours"}</h1>
                  <p style={{color:"var(--text4)",fontSize:14,marginTop:3}}>
                    Allowed: {minPostDate()} → {maxPostDate()}
                    {canEdit&&" · Lead/Admin can browse all engineers"}
                  </p>
                </div>
                <div style={{display:"flex",gap:12,alignItems:"flex-end"}}>
                  {canBrowseAll&&(
                    <div><Lbl>Browse Engineer</Lbl>
                      <select style={{width:190}} value={viewEngId||""} onChange={e=>setBrowseEngId(+e.target.value)}>
                        {engineers.filter(e=>isEngActive(e)&&isBillableRole(e.role_type)).map(eng=><option key={eng.id} value={eng.id}>{eng.name}</option>)}
                      </select>
                    </div>
                  )}
                  <div><Lbl>Week</Lbl>
                    <div style={{display:"flex",alignItems:"center",gap:6}}>
                      <button className="bg" style={{padding:"7px 10px"}} onClick={()=>{const d=new Date(weekOf);d.setDate(d.getDate()-7);setWeekOf(fmt(d));}}>←</button>
                      <input type="date" style={{width:140}} value={weekOf} onChange={e=>setWeekOf(e.target.value)}
                        min={minPostDate()} max={maxPostDate()}/>
                      <button className="bg" style={{padding:"7px 10px"}} onClick={()=>{const d=new Date(weekOf);d.setDate(d.getDate()+7);setWeekOf(fmt(d));}}>→</button>
                      <button className="bg" style={{fontSize:13}} onClick={()=>setWeekOf(fmt(today))}>Today</button>
                    </div>
                  </div>
                </div>
              </div>

              {viewEng&&<div style={{display:"flex",alignItems:"center",gap:14,marginBottom:14,background:"var(--bg1)",border:"1px solid var(--border3)",borderRadius:10,padding:"12px 16px"}}>
                <div className="av" style={{width:42,height:42,fontSize:15}}>{viewEng.name?.slice(0,2).toUpperCase()}</div>
                <div>
                  <div style={{fontSize:16,fontWeight:600}}>{viewEng.name}</div>
                  <div style={{fontSize:13,color:"var(--text4)"}}>{viewEng.role} · {viewEng.level}</div>
                </div>
                <div style={{marginLeft:"auto",display:"flex",gap:20}}>
                  {[
                    {l:"Week Hrs",v:weekDays.reduce((s,d)=>s+entries.filter(e=>e.date===d&&e.engineer_id===viewEngId).reduce((ss,e)=>ss+e.hours,0),0)+"h",c:"var(--info)"},
                    {l:"Month Hrs",v:monthEntries.filter(e=>e.engineer_id===viewEngId&&e.entry_type==="work").reduce((s,e)=>s+e.hours,0)+"h",c:"#34d399"},
                    {l:"Utilization",v:(()=>{const vEng=engStats.find(e=>e.id===viewEngId);const vTarget=vEng?.targetHrs||targetHrs;const vWork=monthEntries.filter(e=>e.engineer_id===viewEngId&&e.entry_type==="work").reduce((s,e)=>s+e.hours,0);return fmtPct(vTarget>0?Math.min(100,Math.round(vWork/vTarget*100)):0);})(),c:"#a78bfa"},
                  ].map((s,i)=><div key={i} style={{textAlign:"center"}}>
                    <div style={{fontFamily:"'IBM Plex Mono',monospace",fontSize:17,fontWeight:700,color:s.c}}>{s.v}</div>
                    <div style={{fontSize:12,color:"var(--text4)"}}>{s.l}</div>
                  </div>)}
                </div>
              </div>}

              {/* ── Weekend Picker — visible to all roles, edits viewed engineer's weekend ── */}
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
                      <span style={{fontSize:14,fontWeight:600,color:"var(--text1)"}}>🗓 {label}</span>
                      <span style={{fontFamily:"'IBM Plex Mono',monospace",fontSize:12,color:"#fb923c",background:"#fb923c15",padding:"2px 8px",borderRadius:4}}>{wdStr}</span>
                      <span style={{fontFamily:"'IBM Plex Mono',monospace",fontSize:12,color:"var(--text4)",marginLeft:"auto"}}>
                        {getWorkDaysInMonth(year,month,pickerWd).length} working days · {getTargetHrs(year,month,pickerWd)}h target
                      </span>
                      <span style={{color:"var(--text3)",fontSize:12}}>{showWeekendPicker?"▲":"▼"}</span>
                    </div>
                    {showWeekendPicker&&(
                      <div style={{background:"var(--bg1)",border:"1px solid var(--border3)",borderRadius:8,padding:"14px 16px",marginTop:4}}>
                        {!isOwnProfile&&<div style={{fontSize:12,color:"#fb923c",marginBottom:10}}>⚠ Editing weekend for <strong>{pickerEng.name}</strong> — this affects their utilization target</div>}
                        <div style={{display:"grid",gridTemplateColumns:"repeat(7,1fr)",gap:6,marginBottom:12}}>
                          {["Sun","Mon","Tue","Wed","Thu","Fri","Sat"].map((name,i)=>{
                            const isOff=pickerWd.includes(i);
                            return(
                              <button key={i} onClick={()=>{const next=isOff?pickerWd.filter(d=>d!==i):[...pickerWd,i].sort((a,b)=>a-b);saveWeekendFor(pickerEngId,next);}}
                                style={{padding:"9px 4px",borderRadius:7,border:`2px solid ${isOff?"#f47218":"var(--border)"}`,
                                  background:isOff?"#1a0a0040":"var(--bg2)",color:isOff?"#f47218":"var(--text3)",
                                  cursor:"pointer",fontSize:13,fontWeight:700,fontFamily:"'IBM Plex Sans',sans-serif"}}>
                                {name}{isOff&&<div style={{fontSize:10,marginTop:2,color:"#f47218"}}>OFF</div>}
                              </button>
                            );
                          })}
                        </div>
                        <div style={{display:"flex",gap:6,flexWrap:"wrap"}}>
                          {[
                            {label:"🇪🇬 Egypt",days:[5,6],desc:"Fri+Sat"},
                            {label:"🇷🇴 Europe",days:[0,6],desc:"Sat+Sun"},
                            {label:"🌍 No Weekend",days:[],desc:"All 7 days"},
                          ].map(p=>(
                            <button key={p.label} onClick={()=>saveWeekendFor(pickerEngId,p.days)}
                              style={{background:"var(--bg2)",border:"1px solid var(--border3)",borderRadius:6,
                                padding:"6px 12px",cursor:"pointer",fontFamily:"'IBM Plex Sans',sans-serif",
                                color:"var(--text1)",fontSize:13,display:"flex",gap:6,alignItems:"center"}}>
                              <span style={{fontWeight:600}}>{p.label}</span>
                              <span style={{color:"var(--text4)",fontSize:11,fontFamily:"'IBM Plex Mono',monospace"}}>{p.desc}</span>
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })()}

              {/* Clipboard banner */}
              {clipboard&&(
                <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",
                  background:"#a78bfa18",border:"1px solid #a78bfa60",borderRadius:8,
                  padding:"8px 14px",marginBottom:10,fontSize:13}}>
                  <span style={{color:"#a78bfa",fontWeight:700}}>
                    ⎘ Clipboard: {clipboard.entries.length} entr{clipboard.entries.length===1?"y":"ies"} from {clipboard.date}
                    <span style={{color:"var(--text2)",fontWeight:400,marginLeft:6}}>
                      — click ⎙ Paste on any allowed day to copy
                    </span>
                  </span>
                  <button onClick={()=>setClipboard(null)}
                    style={{background:"none",border:"none",color:"var(--text3)",cursor:"pointer",fontSize:15}}>✕</button>
                </div>
              )}
              {/* 7-day week grid */}
              <div style={{display:"grid",gridTemplateColumns:"repeat(7,1fr)",gap:7}}>
                {weekDays.map(day=>{
                  const dow=new Date(day).getDay();
                  // Use viewed engineer's weekend days for calendar highlighting
                  const viewEngWd=(()=>{const ve=engineers.find(e=>e.id===viewEngId);try{return ve?.weekend_days?JSON.parse(ve.weekend_days):myWeekend;}catch{return myWeekend;}})();
                  const isWE=viewEngWd.includes(dow);
                  const allowed=isDateAllowed(day);
                  const de=entries.filter(e=>e.date===day&&e.engineer_id===viewEngId);
                  const dh=de.reduce((s,e)=>s+e.hours,0);
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
                          <div style={{fontSize:12,fontWeight:700,color:isToday?"var(--info)":isWE?"#f47218":isFuture?"#a78bfa":"var(--text2)"}}>
                            {DAY_NAMES[dow]}{isWE&&<span style={{fontSize:11,marginLeft:2,color:"#f47218"}}> WE</span>}
                          </div>
                          <div style={{fontSize:11,color:"var(--text4)"}}>{new Date(day).toLocaleDateString("en-US",{month:"short",day:"numeric"})}</div>
                          {dh>0&&<div style={{fontFamily:"'IBM Plex Mono',monospace",fontSize:11,color:"var(--info)",marginTop:1}}>{dh}h</div>}
                        </div>
                        <div style={{display:"flex",flexDirection:"column",gap:2,alignItems:"flex-end"}}>
                          {allowed&&canPostHours&&<button className="bp" style={{padding:"2px 5px",fontSize:12,
                            background:isWE?"linear-gradient(135deg,#b45309,#92400e)":isFuture?"linear-gradient(135deg,#7c3aed,#6d28d9)":undefined
                          }} onClick={()=>setModalDate(day)}>+</button>}
                          {de.length>0&&allowed&&canPostHours&&(
                            <button title="Copy this day" onClick={()=>copyDay(day)}
                              style={{padding:"2px 5px",fontSize:11,borderRadius:4,border:"1px solid var(--border3)",
                                background:clipboard?.date===day?"#38bdf818":"var(--bg2)",
                                color:clipboard?.date===day?"var(--info)":"var(--text3)",cursor:"pointer",lineHeight:1}}>
                              {clipboard?.date===day?"✓ Copied":"⎘ Copy"}
                            </button>
                          )}
                          {clipboard&&allowed&&canPostHours&&clipboard.date!==day&&(
                            <button title={`Paste ${clipboard.entries.length} entr${clipboard.entries.length===1?"y":"ies"} from ${clipboard.date}`}
                              onClick={()=>pasteDay(day)}
                              style={{padding:"2px 5px",fontSize:11,borderRadius:4,border:"1px solid #a78bfa60",
                                background:"#a78bfa18",color:"#a78bfa",cursor:"pointer",lineHeight:1}}>
                              ⎙ Paste
                            </button>
                          )}
                          {!allowed&&<span style={{fontSize:10,color:"var(--text4)",fontFamily:"'IBM Plex Mono',monospace"}}>LOCKED</span>}
                        </div>
                      </div>
                      {de.map(e=>{
                        const proj=projects.find(p=>p.id===e.project_id);
                        return(
                          <div key={e.id} style={{background:"var(--bg0)",border:`1px solid ${e.billable?"var(--bg3)":"#152535"}`,borderRadius:4,padding:"5px 6px",marginBottom:3,fontSize:11}}>
                            <div style={{display:"flex",justifyContent:"space-between",gap:2}}>
                              <div style={{flex:1,minWidth:0}}>
                                {e.entry_type==="leave"
                                  ?<span style={{color:"#fb923c",fontWeight:600}}>✈ {e.leave_type}</span>
                                  :<><span style={{color:"#0ea5e9",fontSize:10,fontWeight:600}}>{proj?.name||proj?.id||e.project_id}</span>
                                    <div style={{color:"var(--text2)",fontSize:10,marginTop:1}}>{e.task_type}</div>
                                    {e.activity&&<div style={{color:"var(--text3)",fontSize:10,marginTop:1,fontStyle:"italic",lineHeight:1.3}}>{e.activity.substring(0,35)}{e.activity.length>35?"…":""}</div>}
                                  </>}
                              </div>
                              {canEdit&&canPostHours&&<div style={{display:"flex",flexDirection:"column",gap:2}}>
                                <button className="be" style={{padding:"1px 4px",fontSize:11}} onClick={()=>setEditEntry({...e,projectId:e.project_id,type:e.entry_type,taskCategory:e.task_category||"Engineering",taskType:e.task_type||"Basic Engineering",leaveType:e.leave_type||"Annual Leave"})}>✎</button>
                                <button className="bd" style={{padding:"1px 4px",fontSize:11}} onClick={()=>deleteEntry(e.id,e.engineer_id)}>✕</button>
                              </div>}
                            </div>
                            <div style={{display:"flex",justifyContent:"space-between",marginTop:3}}>
                              <span style={{fontFamily:"'IBM Plex Mono',monospace",color:"var(--info)",fontWeight:700,fontSize:13}}>{e.hours}h</span>
                              {e.billable&&<span style={{fontSize:11,color:"#34d399",fontWeight:700}}>BILL</span>}
                            </div>
                          </div>
                        );
                      })}
                      {de.length===0&&<div style={{color:"var(--border)",fontSize:11,textAlign:"center",marginTop:16}}>{allowed?"No entries":"—"}</div>}
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
                  <h3 style={{fontSize:15,fontWeight:600,color:"var(--text2)"}}>Full Month — {MONTHS[month]} {year}</h3>
                  <div style={{display:"flex",gap:8,alignItems:"center"}}>
                    {selectedEntries.size>0&&<button style={{background:"#ef4444",border:"none",borderRadius:5,padding:"4px 10px",color:"#fff",fontSize:13,fontWeight:600,cursor:"pointer"}} onClick={bulkDeleteEntries}>🗑 Delete {selectedEntries.size} selected</button>}
                    <select style={{fontSize:13,padding:"4px 8px",width:"auto",background:"var(--bg2)",border:"1px solid var(--border3)",borderRadius:5,color:"var(--text0)",fontFamily:"'IBM Plex Sans',sans-serif"}} value={filterProject} onChange={e=>setFilterProject(e.target.value)}>
                      <option value="ALL">All Projects</option>
                      {projects.map(p=><option key={p.id} value={p.id}>{p.name} ({p.id})</option>)}
                    </select>
                    {filterProject!=="ALL"&&<button style={{background:"transparent",border:"1px solid var(--border3)",borderRadius:5,padding:"4px 8px",color:"var(--text2)",cursor:"pointer",fontSize:12}} onClick={()=>setFilterProject("ALL")}>✕</button>}
                    <span style={{fontSize:12,color:"var(--text4)",fontFamily:"'IBM Plex Mono',monospace"}}>{visEntries.reduce((s,e)=>s+e.hours,0)}h</span>
                  </div>
                </div>
                <div className="card">
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
                        return(
                          <tr key={e.id} style={{background:checked?"#0d1e3440":"transparent"}}>
                            <td><input type="checkbox" checked={checked} onChange={()=>setSelectedEntries(prev=>{const n=new Set(prev);checked?n.delete(e.id):n.add(e.id);return n;})} style={{cursor:"pointer"}}/></td>
                            <td style={{fontFamily:"'IBM Plex Mono',monospace",fontSize:13}}>{e.date}</td>
                            <td style={{fontSize:13,color:"var(--info)"}}>{proj?<><span style={{fontWeight:600,color:"var(--text0)"}}>{proj.name||proj.id}</span><span style={{fontFamily:"'IBM Plex Mono',monospace",fontSize:10,color:"var(--info)",marginLeft:4}}>({proj.id})</span></>:<span style={{color:"#fb923c"}}>{e.leave_type}</span>}</td>
                            <td style={{fontSize:13,color:"var(--text2)"}}>{e.task_type||"—"}</td>
                            <td style={{fontSize:13,color:"var(--text3)",fontStyle:"italic",maxWidth:160,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{e.activity||"—"}</td>
                            <td style={{fontFamily:"'IBM Plex Mono',monospace",color:"var(--info)",fontWeight:700}}>{e.hours}h</td>
                            <td><span style={{fontSize:11,padding:"2px 5px",borderRadius:3,background:e.entry_type==="leave"?"#7c2d1230":"#022c2230",color:e.entry_type==="leave"?"#fb923c":"#34d399",fontWeight:700}}>{e.entry_type}</span></td>
                            <td><div style={{display:"flex",gap:5}}>
                              {canPostHours&&<button className="be" onClick={()=>setEditEntry({...e,projectId:e.project_id,type:e.entry_type,taskCategory:e.task_category||"Engineering",taskType:e.task_type||"Basic Engineering",leaveType:e.leave_type||"Annual Leave"})}>✎</button>}
                              {canPostHours&&<button className="bd" onClick={()=>deleteEntry(e.id,e.engineer_id)}>✕</button>}
                              {!canPostHours&&<span style={{fontSize:11,color:"var(--text4)"}}>—</span>}
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

          {/* ════ PROJECTS ════ */}
          {view==="projects"&&<ProjectsView
            projects={projects} projSearch={projSearch} setProjSearch={setProjSearch}
            projStatusFilter={projStatusFilter} setProjStatusFilter={setProjStatusFilter}
            monthEntries={monthEntries} projStats={projStats}
            isAdmin={isAdmin} isAcct={isAcct} isLead={isLead}
            setShowProjModal={setShowProjModal} setEditProjModal={setEditProjModal} deleteProject={deleteProject}
            fmtCurrency={fmtCurrency}
            activities={activities} setActivities={setActivities}
            engineers={engineers} supabase={supabase} showToast={showToast}
            setProjects={setProjects}
          />}

          {/* ════ TEAM ════ */}
          {view==="team"&&(()=>{
            const filteredTeam=filterEngineer==="ALL"?engStats:engStats.filter(e=>e.id===+filterEngineer);
            const teamMonthEntries=monthEntries.filter(e=>filterProject==="ALL"||e.project_id===filterProject);
            const selectedEng=filterEngineer!=="ALL"?engStats.find(e=>e.id===+filterEngineer):null;
            return(
            <div>
              {/* Filter bar */}
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-end",marginBottom:12}}>
                <div>
                  <h1 style={{fontSize:21,fontWeight:700,color:"var(--text0)"}}>Team</h1>
                  <p style={{color:"var(--text4)",fontSize:14,marginTop:3}}>{engineers.filter(e=>isEngActive(e)).length} active · {engineers.length} total · {MONTHS[month]} {year}</p>
                </div>
                <div style={{display:"flex",gap:8,alignItems:"flex-end"}}>
                  <div><Lbl>Engineer</Lbl>
                    <select style={{width:160}} value={filterEngineer} onChange={e=>setFilterEngineer(e.target.value)}>
                      <option value="ALL">All Engineers</option>
                      {engineers.map(e=><option key={e.id} value={e.id}>{e.name}{!isEngActive(e)?" (inactive)":""}</option>)}
                    </select>
                  </div>
                  <div><Lbl>Project</Lbl>
                    <select style={{width:160}} value={filterProject} onChange={e=>setFilterProject(e.target.value)}>
                      <option value="ALL">All Projects</option>
                      {projects.map(p=><option key={p.id} value={p.id}>{p.name} ({p.id})</option>)}
                    </select>
                  </div>
                  {(filterEngineer!=="ALL"||filterProject!=="ALL")&&
                    <button className="bg" style={{fontSize:13}} onClick={()=>{setFilterEngineer("ALL");setFilterProject("ALL");}}>✕ Clear</button>}
                </div>
              </div>

              {/* ── TOTAL HOURS SUMMARY BOX (shows when any filter active) ── */}
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
                // Target hours based on filtered engineers — respects join/termination dates
                const filtEngs=filterEngineer==="ALL"?engStats:engStats.filter(e=>e.id===+filterEngineer);
                const targetW=filtEngs.reduce((s,eng)=>s+(eng.targetHrs||0),0);
                const util=targetW?Math.round(totalW/targetW*100):0;
                const selProjName=filterProject!=="ALL"?projects.find(p=>p.id===filterProject)?.name:"";
                const selEngName=filterEngineer!=="ALL"?engineers.find(e=>e.id===+filterEngineer)?.name:"";
                const label=[selEngName,selProjName].filter(Boolean).join(" · ")||"All";
                return(
                  <div style={{background:"var(--bg2)",border:"1px solid var(--border3)",borderRadius:8,padding:"12px 16px",marginBottom:16,display:"flex",gap:0,alignItems:"center"}}>
                    <div style={{marginRight:20,minWidth:120}}>
                      <div style={{fontSize:12,color:"var(--text4)",fontWeight:700,textTransform:"uppercase",letterSpacing:".06em",marginBottom:2}}>Filter Summary</div>
                      <div style={{fontSize:14,color:"var(--text2)",fontWeight:600}}>{label}</div>
                      <div style={{fontSize:12,color:"var(--text4)"}}>{MONTHS[month]} {year}</div>
                    </div>
                    <div style={{flex:1,display:"grid",gridTemplateColumns:"repeat(5,1fr)",gap:8}}>
                      {[
                        {l:"Total Work",v:totalW+"h",c:"var(--text0)"},
                        {l:"Billable",v:totalB+"h",c:"#34d399",show:isAdmin||isAcct},
                        {l:"Non-Billable",v:totalNB+"h",c:"#fb923c",show:isAdmin||isAcct},
                        {l:"Leave Days",v:totalL+"d",c:"#f472b6"},
                        {l:"Utilization",v:util+"%",c:util>=80?"#34d399":util>=60?"#fb923c":"#f87171"},
                      ].filter(m=>m.show!==false).map((m,i)=>(
                        <div key={i} style={{background:"var(--bg1)",borderRadius:6,padding:"8px 10px",textAlign:"center",border:"1px solid var(--border3)"}}>
                          <div style={{fontFamily:"'IBM Plex Mono',monospace",fontSize:18,fontWeight:700,color:m.c,lineHeight:1}}>{m.v}</div>
                          <div style={{fontSize:11,color:"var(--text4)",marginTop:4,textTransform:"uppercase",letterSpacing:".05em"}}>{m.l}</div>
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
                      <div style={{fontSize:14,color:"var(--text4)"}}>{selectedEng.role} · {selectedEng.level}</div>
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
                          <div style={{fontSize:11,color:"var(--text4)"}}>{s.l}</div>
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
                          <td style={{fontSize:13,color:"var(--info)"}}>{p?.id||<span style={{color:"var(--text2)"}}>—</span>}</td>
                          <td style={{fontSize:13,color:"var(--text2)"}}>{e.task_type||"—"}</td>
                          <td style={{fontSize:13,color:"var(--text3)",fontStyle:"italic",maxWidth:200,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{e.activity||"—"}</td>
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
                    style={{padding:"4px 14px",borderRadius:20,fontSize:12,fontWeight:600,cursor:"pointer",
                      letterSpacing:".05em",textTransform:"uppercase",
                      border:`1px solid ${teamViewMode===m?"#38bdf840":"var(--bg3)"}`,
                      background:teamViewMode===m?"#38bdf810":"transparent",
                      color:teamViewMode===m?"var(--info)":"var(--border)"}}>
                    {l}
                  </button>
                ))}
              </div>

              {/* ── ORG CHART VIEW ── */}
              {teamViewMode==="org"&&(()=>{
                // Build tree from flat orgNodes array
                const roots = orgNodes.filter(n=>!n.parent_id);
                const children = (pid) => orgNodes.filter(n=>n.parent_id===pid).sort((a,b)=>(a.sort_order||0)-(b.sort_order||0));

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
                  showToast("Saved ✓");
                };

                const deleteNode = async(id) => {
                  if(!window.confirm("Delete this node? Children will become unattached.")) return;
                  await supabase.from("org_chart").delete().eq("id",id);
                  setOrgNodes(prev=>prev.filter(n=>n.id!==id));
                  showToast("Deleted");
                };

                const moveNode = async(nodeId, newParentId) => {
                  const node = orgNodes.find(n=>n.id===nodeId);
                  if(!node) return;
                  const updated = {...node, parent_id: newParentId||null};
                  await supabase.from("org_chart").update({parent_id:newParentId||null}).eq("id",nodeId);
                  setOrgNodes(prev=>prev.map(n=>n.id===nodeId?updated:n));
                  showToast("Moved ✓");
                };

                // Card component — clean, elegant, no stats
                const OrgCard = ({node}) => {
                  // Use raw engineers (not engStats) so accountants/senior_mgmt are included
                  const eng = node.engineer_id ? engineers.find(e=>e.id===node.engineer_id) : null;
                  const active = eng ? isEngActive(eng) : true;
                  const isDragging = orgDragId===node.id;
                  const rc = eng ? (ROLE_COLORS[eng.role_type]||"var(--text3)") : "var(--text4)";
                  const initials = (node.name||"?").split(" ").map(w=>w[0]).slice(0,2).join("").toUpperCase();

                  return(
                    <div
                      draggable={orgEditing}
                      onDragStart={orgEditing?()=>setOrgDragId(node.id):undefined}
                      onDragEnd={orgEditing?()=>setOrgDragId(null):undefined}
                      onDragOver={orgEditing?e=>e.preventDefault():undefined}
                      onDrop={orgEditing?e=>{e.preventDefault();e.stopPropagation();if(orgDragId&&orgDragId!==node.id) moveNode(orgDragId,node.id);}:undefined}
                      style={{
                        background: node.is_external?"transparent":"var(--bg1)",
                        border: node.is_external
                          ? "1px dashed #2a4a6a"
                          : orgEditing
                            ? `1px solid ${rc}60`
                            : `1px solid ${rc}35`,
                        borderRadius:12,
                        padding:"16px 14px 14px",
                        textAlign:"center",
                        width:152,
                        cursor: orgEditing?"grab":"default",
                        opacity: isDragging?0.3:!active?0.5:1,
                        filter: !active?"grayscale(0.7)":"none",
                        transition:"border-color .2s, box-shadow .2s",
                        position:"relative",
                        boxShadow: orgEditing?`0 0 0 1px ${rc}25, 0 4px 16px #00000060`:`0 4px 16px #00000050, 0 0 0 1px ${rc}20`,
                      }}
                    >
                      {/* Edit/delete buttons — only in edit mode */}
                      {orgEditing&&isAdmin&&(
                        <div style={{position:"absolute",top:6,right:6,display:"flex",gap:4,zIndex:20}}>
                          <button onClick={e=>{e.stopPropagation();e.preventDefault();setOrgEditNode({...node});}}
                            style={{background:"var(--bg1)",border:"1px solid #38bdf830",color:"var(--info)",width:20,height:20,
                              borderRadius:4,fontSize:11,cursor:"pointer",padding:0,zIndex:20,lineHeight:"20px"}}>✎</button>
                          <button onClick={e=>{e.stopPropagation();e.preventDefault();deleteNode(node.id);}}
                            style={{background:"var(--bg1)",border:"1px solid #f8717130",color:"#f87171",width:20,height:20,
                              borderRadius:4,fontSize:11,cursor:"pointer",padding:0,zIndex:20,lineHeight:"20px"}}>✕</button>
                        </div>
                      )}

                      {/* Avatar circle with role color ring */}
                      <div style={{
                        width:50, height:50, borderRadius:"50%",
                        background:`linear-gradient(135deg, ${rc}28, ${rc}12)`,
                        border:`2px solid ${rc}55`,
                        display:"flex", alignItems:"center", justifyContent:"center",
                        margin:"0 auto 11px",
                        fontSize:17, fontWeight:800, color:rc,
                        letterSpacing:".03em",
                        boxShadow:`0 0 0 4px ${rc}15, 0 2px 8px #00000040`,
                      }}>
                        {initials}
                      </div>

                      {/* Name */}
                      <div style={{
                        fontSize:14, fontWeight:700,
                        color: node.is_external?"#4e6a82":"var(--text0)",
                        lineHeight:1.3, marginBottom:4,
                        letterSpacing:"-.01em",
                      }}>
                        {node.name}
                        {!active&&eng&&(
                          <div style={{fontSize:10,color:"#f87171",marginTop:2,letterSpacing:".06em",fontWeight:700}}>INACTIVE</div>
                        )}
                      </div>

                      {/* Title + role — always shown when linked or title set */}
                      <div style={{marginTop:2,minHeight:18}}>
                        {/* job title: node.title (manual) or eng.role (from DB) or ROLE_LABELS fallback */}
                        {(node.title||eng?.role||eng)&&(
                          <div style={{
                            fontSize:12, color: node.is_external?"var(--text3)":"var(--text2)",
                            lineHeight:1.4, letterSpacing:".01em",
                            fontStyle: node.is_external?"italic":"normal",
                            fontWeight:500,
                          }}>
                            {node.title||(eng?.role)||(eng?ROLE_LABELS[eng.role_type]||"":"")}
                          </div>
                        )}
                        {/* role type badge — colored chip below title */}
                        {eng&&!node.is_external&&(
                          <div style={{
                            display:"inline-block",
                            marginTop:4,
                            padding:"1px 6px",
                            borderRadius:3,
                            fontSize:10, fontWeight:700,
                            letterSpacing:".06em", textTransform:"uppercase",
                            background:`${rc}18`, color:rc,
                          }}>
                            {ROLE_LABELS[eng.role_type]||eng.role_type}
                          </div>
                        )}
                      </div>
                    </div>
                  );
                };

                // Recursive tree renderer
                // ── Live org chart renderer (React) ──
                // Uses border-based connectors: each node sits inside a <td> that draws
                // its top-border (the horizontal bar) and left-border (the elbow line).
                const CONN = isDark ? "#3a6a9a" : "#1e4d80";

                const OrgRow = ({nodes, depth}) => {
                  if(!nodes.length) return null;
                  const solo = nodes.length===1;
                  return (
                    <table style={{borderCollapse:"separate",borderSpacing:0,tableLayout:"fixed",margin:"0 auto"}}>
                      <tbody>
                        <tr>
                          {nodes.map((node,i)=>{
                            const kids = children(node.id);
                            return (
                              <td key={node.id} style={{
                                verticalAlign:"top", padding:"0 8px", minWidth:180,
                                textAlign:"center",
                                borderTop: (!solo && depth>0) ? `2px solid ${CONN}` : "none",
                              }}>
                                {/* vertical stub from top border down to card */}
                                {depth>0 && (
                                  <div style={{width:2,height:18,background:(!solo)?CONN:"transparent",margin:"0 auto"}}/>
                                )}
                                <div style={{display:"flex",flexDirection:"column",alignItems:"center"}}>
                                  <OrgCard node={node}/>
                                  {orgEditing&&isAdmin&&(
                                    <button onClick={()=>setOrgEditNode({id:null,name:"",title:"",engineer_id:null,parent_id:node.id,is_external:false,sort_order:kids.length})}
                                      style={{marginTop:5,background:"transparent",border:`1px dashed ${CONN}`,color:CONN,
                                        borderRadius:6,padding:"3px 8px",fontSize:11,cursor:"pointer",width:"100%",letterSpacing:".05em",fontWeight:600}}>
                                      + add
                                    </button>
                                  )}
                                  {kids.length>0&&(
                                    <>
                                      <div style={{width:2,height:20,background:CONN}}/>
                                      <OrgRow nodes={kids} depth={depth+1}/>
                                    </>
                                  )}
                                </div>
                              </td>
                            );
                          })}
                        </tr>
                      </tbody>
                    </table>
                  );
                };

                const RenderLevel = ({nodes}) => {
                  if(!nodes||!nodes.length) return null;
                  return <OrgRow nodes={nodes} depth={0}/>;
                };

                // ── PDF export ──
                // Uses an HTML <table> approach for reliable cross-browser connector lines.
                const exportOrgPDF = () => {
                  const ch2 = (pid) => orgNodes.filter(n=>n.parent_id===pid).sort((a,b)=>(a.sort_order||0)-(b.sort_order||0));

                  const buildCard2 = (node) => {
                    const eng2 = node.engineer_id ? engineers.find(e=>e.id===node.engineer_id) : null;
                    const rc2 = eng2 ? (ROLE_COLORS[eng2.role_type]||"#1a5276") : "#1a5276";
                    const ini2 = (node.name||"?").split(" ").map(w=>w[0]).slice(0,2).join("").toUpperCase();
                    const ext = node.is_external;
                    return `<div style="width:136px;background:${ext?"#f8fafc":"#eef4fb"};border-radius:10px;padding:12px 8px 10px;text-align:center;border:2px solid ${ext?"#8aaac0":"#1a5276"};box-shadow:0 2px 8px rgba(10,30,60,0.10);display:inline-block;${ext?"opacity:0.8;border-style:dashed;":""}">
  <div style="width:40px;height:40px;border-radius:50%;display:flex;align-items:center;justify-content:center;margin:0 auto 7px;font-size:15px;font-weight:800;border:2.5px solid ${rc2};background:${rc2}22;color:${rc2}">${ini2}</div>
  <div style="font-size:13px;font-weight:800;line-height:1.3;margin-bottom:2px;color:#0b1f38">${node.name}</div>
  ${node.title?`<div style="font-size:10px;color:#2a4a6a;font-weight:600;line-height:1.4">${node.title}</div>`:""}
  ${eng2&&!ext?`<div style="font-size:9px;color:#4a6a8a;letter-spacing:.06em;text-transform:uppercase;font-weight:700;margin-top:2px">${ROLE_LABELS[eng2.role_type]||eng2.role||""}</div>`:""}
</div>`;
                  };

                  // Recursive table builder — each level is a <table> row of <td>s
                  // The top-border of each <td> (except first child) forms the horizontal connector
                  const buildTable = (nodes, isRoot) => {
                    if(!nodes.length) return "";
                    const solo = nodes.length === 1;
                    const tds = nodes.map((n, i) => {
                      const kids = ch2(n.id);
                      // border-top only — no border-left (avoids full-height vertical lines)
                      const tdStyle = isRoot||solo
                        ? `padding:0 10px;vertical-align:top;text-align:center;`
                        : `padding:0 10px;vertical-align:top;text-align:center;border-top:2px solid #1a5276;`;
                      const stub = (!isRoot&&!solo) ? `<div style="width:2px;height:16px;background:#1a5276;margin:0 auto;"></div>` : "";
                      const vline = kids.length ? `<div style="width:2px;height:18px;background:#1a5276;margin:0 auto;"></div>` : "";
                      return `<td style="${tdStyle}">${stub}${buildCard2(n)}${vline}${kids.length?buildTable(kids,false):""}</td>`;
                    });
                    return `<table style="border-collapse:separate;border-spacing:0;margin:0 auto;"><tbody><tr>${tds.join("")}</tr></tbody></table>`;
                  };

                  const rts = orgNodes.filter(n=>!n.parent_id).sort((a,b)=>(a.sort_order||0)-(b.sort_order||0));
                  const html = `<!DOCTYPE html><html><head><meta charset="utf-8"/>
<style>
*{margin:0;padding:0;box-sizing:border-box;}
body{background:#fff;font-family:'Segoe UI',Arial,sans-serif;padding:24px 20px;-webkit-print-color-adjust:exact;print-color-adjust:exact;}
.hdr{display:flex;align-items:center;gap:14px;margin-bottom:30px;padding-bottom:14px;border-bottom:2px solid #0e2a4a;}
.hdr img{width:44px;height:44px;border-radius:8px;object-fit:contain;}
.hdr h1{font-size:18px;font-weight:800;color:#0b1f38;}
.hdr p{font-size:11px;color:#4a6a8a;margin-top:2px;letter-spacing:.06em;text-transform:uppercase;font-weight:600;}
@media print{
  @page{margin:6mm;size:A4 landscape;}
  body{zoom:0.65;}
}
</style></head><body>
<div class="hdr"><img src="${LOGO_SRC}"/><div><h1>Organization Chart</h1><p>ENEVO Group · ${new Date().toLocaleDateString("en-GB",{month:"long",year:"numeric"})}</p></div></div>
<div style="display:flex;justify-content:center;">${buildTable(rts, true)}</div>
<script>window.onload=()=>setTimeout(()=>{window.print();},500);</script>
</body></html>`;
                  const w = window.open("","pdf_"+Date.now()+"_"+Math.random().toString(36).slice(2));
                  if(w){w.document.write(html);w.document.close();logAction("EXPORT","OrgChart",`Exported org chart PDF`,{nodes:orgNodes.length});}
                  else showToast("Allow popups to export PDF",false);
                };

                return(
                  <div style={{background:"var(--bg1)",borderRadius:12,padding:"20px 0 0",margin:"-4px 0"}}>
                    <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:28,padding:"0 24px"}}>
                      <div style={{display:"flex",alignItems:"center",gap:14}}>
                        <img src={LOGO_SRC} alt="ENEVO" style={{width:40,height:40,borderRadius:9,objectFit:"contain",opacity:0.85}}/>
                        <div>
                          <div style={{fontSize:17,fontWeight:700,color:"var(--text0)",letterSpacing:"-.02em"}}>Organization Chart</div>
                          <div style={{fontSize:12,color:"#4e7a9a",marginTop:1,letterSpacing:".05em",textTransform:"uppercase"}}>
                            {orgEditing?<span style={{color:"#fb923c",fontWeight:700}}>EDIT MODE</span>:`ENEVO Group · ${orgNodes.filter(n=>!n.is_external).length} members`}
                          </div>
                        </div>
                      </div>
                      <div style={{display:"flex",gap:8,alignItems:"center"}}>
                        {!orgEditing&&orgNodes.length>0&&(
                          <button onClick={exportOrgPDF} style={{padding:"6px 14px",borderRadius:8,fontSize:13,fontWeight:600,cursor:"pointer",background:"#38bdf810",border:"1px solid #38bdf830",color:"var(--info)",letterSpacing:".03em"}}>⬇ Export PDF</button>
                        )}
                        {isAdmin&&(
                          <>
                            {orgEditing&&(
                              <button onClick={()=>setOrgEditNode({id:null,name:"",title:"",engineer_id:null,parent_id:null,is_external:false,sort_order:roots.length})} style={{padding:"6px 14px",borderRadius:8,fontSize:13,fontWeight:600,cursor:"pointer",background:"transparent",border:"1px solid var(--border)",color:"var(--text4)",letterSpacing:".03em"}}>+ Root Node</button>
                            )}
                            <button onClick={()=>setOrgEditing(e=>!e)} style={{padding:"6px 14px",borderRadius:8,fontSize:13,fontWeight:600,cursor:"pointer",background:orgEditing?"#fb923c12":"transparent",border:`1px solid ${orgEditing?"#fb923c40":"var(--border)"}`,color:orgEditing?"#fb923c":"var(--text4)",letterSpacing:".03em"}}>{orgEditing?"done":"edit"}</button>
                          </>
                        )}
                      </div>
                    </div>
                    {orgNodes.length===0&&(
                      <div style={{textAlign:"center",padding:"80px 20px"}}>
                        <div style={{fontSize:13,marginBottom:16,letterSpacing:".08em",textTransform:"uppercase",color:"var(--border)"}}>No chart configured</div>
                        {isAdmin&&<button onClick={()=>setOrgEditing(true)} style={{padding:"8px 20px",borderRadius:8,background:"transparent",border:"1px solid var(--border)",color:"var(--text4)",fontSize:13,cursor:"pointer",letterSpacing:".05em"}}>edit chart</button>}
                      </div>
                    )}

                    {/* Chart */}
                    {orgNodes.length>0&&(
                      <div style={{overflowX:"auto",paddingBottom:20}}>
                        <div style={{minWidth:600,display:"flex",flexDirection:"column",alignItems:"center",gap:0,paddingTop:8}}>
                          {/* Top-level drop zone */}
                          {orgEditing&&(
                            <div onDragOver={e=>e.preventDefault()}
                              onDrop={e=>{e.preventDefault();if(orgDragId) moveNode(orgDragId,null);}}
                              style={{width:"100%",padding:"6px",textAlign:"center",fontSize:11,color:"var(--text4)",
                                border:"1px dashed #192d47",borderRadius:6,marginBottom:8}}>
                              ↑ Drop here to make root
                            </div>
                          )}
                          <RenderLevel nodes={roots.sort((a,b)=>(a.sort_order||0)-(b.sort_order||0))}/>
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
                            <div style={{fontSize:12,fontWeight:700,color:"var(--text3)",marginBottom:4}}>DISPLAY NAME *</div>
                            <input value={orgEditNode.name||""} onChange={e=>setOrgEditNode(p=>({...p,name:e.target.value}))}
                              placeholder="e.g. Sameh Said" style={{width:"100%",boxSizing:"border-box"}}/>
                          </div>

                          <div>
                            <div style={{fontSize:12,fontWeight:700,color:"var(--text3)",marginBottom:4}}>TITLE / ROLE LABEL</div>
                            <input value={orgEditNode.title||""} onChange={e=>setOrgEditNode(p=>({...p,title:e.target.value}))}
                              placeholder="e.g. CTO · Romain" style={{width:"100%",boxSizing:"border-box"}}/>
                          </div>

                          <div>
                            <div style={{fontSize:12,fontWeight:700,color:"var(--text3)",marginBottom:4}}>LINK TO ENGINEER (optional)</div>
                            <select value={orgEditNode.engineer_id||""} onChange={e=>setOrgEditNode(p=>({...p,engineer_id:e.target.value?+e.target.value:null}))}
                              style={{width:"100%",boxSizing:"border-box"}}>
                              <option value="">— External / No link —</option>
                              {engineers.map(e=><option key={e.id} value={e.id}>{e.name} · {e.role}</option>)}
                            </select>
                          </div>

                          <div>
                            <div style={{fontSize:12,fontWeight:700,color:"var(--text3)",marginBottom:4}}>REPORTS TO</div>
                            <select value={orgEditNode.parent_id||""} onChange={e=>setOrgEditNode(p=>({...p,parent_id:e.target.value?+e.target.value:null}))}
                              style={{width:"100%",boxSizing:"border-box"}}>
                              <option value="">— Top level (root) —</option>
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
                            <div style={{fontSize:12,fontWeight:700,color:"var(--text3)",marginBottom:4}}>SORT ORDER</div>
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


              {/* ── GRID VIEW ── */}
              {teamViewMode==="grid"&&<div style={{display:"grid",gridTemplateColumns:"repeat(5,1fr)",gap:11}}>
                {filteredTeam.map(eng=>(
                  <div key={eng.id} className="card" style={{textAlign:"center",cursor:"pointer",
                    opacity:!isEngActive(eng)?0.5:1,
                    border:filterEngineer===String(eng.id)?"1px solid #38bdf8":!isEngActive(eng)?"1px solid #0f1e2e":"1px solid var(--border3)"}}
                    onClick={()=>setFilterEngineer(filterEngineer===String(eng.id)?"ALL":String(eng.id))}>
                    <div className="av" style={{width:44,height:44,fontSize:15,margin:"0 auto 8px",filter:!isEngActive(eng)?"grayscale(1)":"none"}}>{eng.name?.slice(0,2).toUpperCase()}</div>
                    <div style={{fontSize:15,fontWeight:600}}>{eng.name}{!isEngActive(eng)&&<span style={{fontSize:11,marginLeft:5,color:"#f87171",background:"#f8717115",padding:"1px 4px",borderRadius:3}}>LEFT</span>}</div>
                    <div style={{fontSize:12,color:"var(--text4)",marginBottom:4}}>{eng.role}</div>
                    <div style={{marginBottom:8}}><span className="role-badge" style={{background:ROLE_COLORS[eng.role_type]+"20",color:ROLE_COLORS[eng.role_type]||"var(--text3)"}}>{ROLE_LABELS[eng.role_type]||eng.role_type}</span></div>
                    <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:5,marginBottom:7}}>
                      <div style={{background:"var(--bg2)",borderRadius:5,padding:"6px 4px"}}>
                        <div style={{fontFamily:"'IBM Plex Mono',monospace",fontSize:16,fontWeight:700,color:"var(--info)"}}>{(filterProject==="ALL"?eng.workHrs:teamMonthEntries.filter(e=>String(e.engineer_id)===String(eng.id)&&e.entry_type==="work").reduce((s,e)=>s+e.hours,0))}h</div>
                        <div style={{fontSize:11,color:"var(--text4)"}}>work hrs</div>
                      </div>
                      <div style={{background:"var(--bg2)",borderRadius:5,padding:"6px 4px"}}>
                        <div style={{fontFamily:"'IBM Plex Mono',monospace",fontSize:16,fontWeight:700,color:eng.utilization>=80?"#34d399":eng.utilization>=60?"#fb923c":"#f87171"}}>{fmtPct(eng.utilization)}</div>
                        <div style={{fontSize:11,color:"var(--text4)"}}>util.</div>
                      </div>
                    </div>
                    <div style={{fontSize:12,display:"flex",justifyContent:"space-between",color:"var(--text3)",paddingBottom:6}}>
                      {(isAdmin||isAcct)&&<span>Bill: <span style={{color:"#a78bfa",fontWeight:600}}>{fmtPct(eng.billability)}</span></span>}
                      {eng.leaveDays>0&&<span style={{color:"#fb923c"}}>✈{eng.leaveDays}d</span>}
                    </div>
                    {(isAdmin||isAcct)&&<div style={{fontSize:13,fontFamily:"'IBM Plex Mono',monospace",color:"#34d399",marginBottom:5}}>{fmtCurrency(eng.revenue)}</div>}
                    <div style={{fontSize:11,padding:"1px 6px",borderRadius:3,background:"var(--border)",color:"var(--text3)",display:"inline-block"}}>{eng.level}</div>
                    {/* Assigned projects */}
                    {(()=>{
                      const myProjs=projects.filter(p=>
                        p.status==="Active"&&
                        (p.assigned_engineers||[]).map(String).includes(String(eng.id))
                      );
                      if(!myProjs.length) return(
                        <div style={{fontSize:11,color:"var(--border)",marginTop:6}}>no assigned projects</div>
                      );
                      return(
                        <div style={{marginTop:6,display:"flex",flexWrap:"wrap",gap:3,justifyContent:"center"}}>
                          {myProjs.slice(0,4).map(p=>(
                            <span key={p.id} title={(p.name||p.id)+" ("+p.id+")"} style={{fontSize:10,padding:"1px 5px",borderRadius:3,
                              background:"var(--bg2)",border:"1px solid var(--border3)",color:"var(--info)",
                              whiteSpace:"nowrap",maxWidth:90,overflow:"hidden",textOverflow:"ellipsis"}}>
                              {p.name||p.id}
                            </span>
                          ))}
                          {myProjs.length>4&&<span style={{fontSize:10,color:"var(--text4)"}}>+{myProjs.length-4}</span>}
                        </div>
                      );
                    })()}
                  </div>
                ))}
              </div>}

            </div>
          );})()}

          {/* ════ REPORTS ════ */}
          {view==="reports"&&canReport&&(
            <div>
              <div style={{marginBottom:20}}>
                <h1 style={{fontSize:21,fontWeight:700,color:"var(--text0)"}}>Reports & PDF Export</h1>
                <p style={{color:"var(--text4)",fontSize:14,marginTop:3}}>{MONTHS[month]} {year}</p>
              </div>

              {/* Report type cards */}
              <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:10,marginBottom:18}}>
                {[
                  {id:"utilization",icon:"◉",label:"Team Utilization",desc:"All engineers utilization & billability",show:isAdmin||isAcct||isSenior},
                  {id:"individual",icon:"👤",label:"Individual Timesheet",desc:"One engineer — full monthly timesheet PDF",show:true},
                  {id:"task",icon:"⊟",label:"Task Analysis",desc:"Task categories & activity log",show:true},
                  {id:"projtasks",icon:"◈",label:"Project Analysis",desc:"Per-project hours, tasks & engineer breakdown",show:isAdmin||isAcct||isLead||isSenior},
                  {id:"tracker",icon:"📊",label:"Tracker Report",desc:"Activity progress — status, notes & phases by project",show:isAdmin||isLead||isAcct||isSenior},
                  {id:"vacation",icon:"✈",label:"Vacation Report",desc:"Leave & absence summary per engineer",show:true},
                  {id:"monthly",icon:"⊞",label:"Monthly Mgmt",desc:"Full executive summary",show:isAdmin||isAcct||isSenior},
                  {id:"assignment",icon:"👥",label:"Assignment Report",desc:"Who is working on what this month",show:isAdmin||isLead||isAcct||isSenior},
                  {id:"invoice",icon:"🧾",label:"Invoice Export",desc:"Billable invoice per month",show:canInvoice},
                ].filter(r=>r.show).map(r=>(
                  <div key={r.id} className={`rpt-card ${activeRpt===r.id?"sel":""}`} onClick={()=>setActiveRpt(r.id)}>
                    <div style={{fontSize:18,marginBottom:5}}>{r.icon}</div>
                    <div style={{fontSize:14,fontWeight:700,marginBottom:3}}>{r.label}</div>
                    <div style={{fontSize:12,color:"var(--text4)",lineHeight:1.4}}>{r.desc}</div>
                  </div>
                ))}
              </div>

              {/* Individual timesheet export */}
              {activeRpt==="individual"&&(
                <div>
                  <div className="card" style={{marginBottom:14}}>
                    <h3 style={{fontSize:15,fontWeight:600,color:"var(--text0)",marginBottom:14}}>👤 Timesheet Export — {MONTHS[month]} {year}</h3>
                    <div style={{display:"grid",gridTemplateColumns:"1fr auto auto",gap:12,alignItems:"flex-end",marginBottom:6}}>
                      <div><Lbl>Select Engineer (or export all)</Lbl>
                        <select value={rptEngId||"ALL"} onChange={e=>setRptEngId(e.target.value==="ALL"?null:+e.target.value)}>
                          <option value="ALL">📋 All Engineers (separate PDFs)</option>
                          {engineers.map(e=><option key={e.id} value={e.id}>{e.name} · {e.role}</option>)}
                        </select>
                      </div>
                      <button className="bp" onClick={()=>{
                        if(!rptEngId){
                          // Export all engineers one by one
                          engineers.forEach((eng,i)=>setTimeout(()=>buildTimesheetPDF(eng,monthEntries,projects,month,year),i*600));
                          showToast(`Exporting ${engineers.length} timesheets — check your browser tabs`);
                        } else {
                          const eng=engineers.find(e=>e.id===rptEngId);
                          if(eng) buildTimesheetPDF(eng,monthEntries,projects,month,year);
                        }
                      }}>⬇ Export PDF{!rptEngId?" (All)":""}</button>
                    </div>
                    <div style={{fontSize:13,color:"var(--text4)"}}>
                      {!rptEngId?"Will open one PDF per engineer in separate browser tabs — allow popups if prompted":"Select an engineer above to preview their timesheet"}
                    </div>
                  </div>
                  <div className="card">
                  <h3 style={{fontSize:14,fontWeight:600,color:"var(--text2)",marginBottom:14}}>{rptEngId?"Timesheet Preview":"All Engineers Summary"}</h3>
                  {!rptEngId&&(
                    <table>
                      <thead><tr><th>Engineer</th><th>Role</th><th>Work Hrs</th><th>Projects</th><th>Leave Days</th><th>Quick Export</th></tr></thead>
                      <tbody>{engineers.map(eng=>{
                        const ee=monthEntries.filter(e=>String(e.engineer_id)===String(eng.id));
                        const wh=ee.filter(e=>e.entry_type==="work").reduce((s,e)=>s+e.hours,0);
                        const ld=ee.filter(e=>e.entry_type==="leave").length;
                        const prjs=[...new Set(ee.filter(e=>e.entry_type==="work").map(e=>e.project_id))].length;
                        return<tr key={eng.id}>
                          <td><div style={{display:"flex",alignItems:"center",gap:7}}><div className="av" style={{fontSize:11,width:24,height:24}}>{eng.name?.slice(0,2).toUpperCase()}</div><span style={{fontWeight:500}}>{eng.name}</span></div></td>
                          <td style={{fontSize:13,color:"var(--text2)"}}>{eng.role}</td>
                          <td style={{fontFamily:"'IBM Plex Mono',monospace",color:"var(--info)",fontWeight:700}}>{wh}h</td>
                          <td style={{fontFamily:"'IBM Plex Mono',monospace"}}>{prjs}</td>
                          <td style={{color:ld>0?"#fb923c":"var(--text4)"}}>{ld}</td>
                          <td><button className="be" style={{fontSize:13}} onClick={()=>buildTimesheetPDF(eng,monthEntries,projects,month,year)}>⬇ PDF</button></td>
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
                      <div style={{background:"var(--bg2)",borderRadius:8,padding:"14px 16px"}}>
                        <div style={{display:"flex",alignItems:"center",gap:12,marginBottom:12}}>
                          <div className="av" style={{width:40,height:40,fontSize:15}}>{eng?.name?.slice(0,2).toUpperCase()}</div>
                          <div><div style={{fontSize:16,fontWeight:600}}>{eng?.name}</div><div style={{fontSize:13,color:"var(--text4)"}}>{eng?.role} · {eng?.level}</div></div>
                          <div style={{marginLeft:"auto",display:"flex",gap:20,textAlign:"center"}}>
                            {[{l:"Work Hrs",v:wh+"h",c:"var(--info)"},{l:"Leave Days",v:ld+"d",c:"#fb923c"},{l:"Projects",v:projs.length,c:"#a78bfa"}].map((s,i)=>(
                              <div key={i}><div style={{fontFamily:"'IBM Plex Mono',monospace",fontSize:17,fontWeight:700,color:s.c}}>{s.v}</div><div style={{fontSize:11,color:"var(--text4)"}}>{s.l}</div></div>
                            ))}
                          </div>
                        </div>
                        <table>
                          <thead><tr><th>Date</th><th>Project</th><th>Task</th><th>Activity</th><th>Hrs</th></tr></thead>
                          <tbody>{engEntries.filter(e=>e.entry_type==="work").sort((a,b)=>a.date.localeCompare(b.date)).map(e=>{
                            const proj=projects.find(p=>p.id===e.project_id);
                            return<tr key={e.id}>
                              <td style={{fontFamily:"'IBM Plex Mono',monospace",fontSize:13}}>{e.date}</td>
                              <td style={{fontSize:13,color:"var(--info)"}}>{proj?.name||proj?.id} ({proj?.id})</td>
                              <td style={{fontSize:13,color:"var(--text2)"}}>{e.task_type}</td>
                              <td style={{fontSize:13,color:"var(--text3)",fontStyle:"italic",maxWidth:200,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{e.activity||"—"}</td>
                              <td style={{fontFamily:"'IBM Plex Mono',monospace",color:"var(--info)",fontWeight:700}}>{e.hours}h</td>
                            </tr>;})}
                          </tbody>
                        </table>
                      </div>
                    );
                  })()}
                  </div>
                </div>
              )}

              {/* Utilization preview */}
              {activeRpt==="utilization"&&(
                <div className="card">
                  <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:12}}>
                    <h3 style={{fontSize:14,fontWeight:600,color:"var(--text2)"}}>Team Utilization Preview</h3>
                    <button className="bp" onClick={buildUtilizationPDF}>⬇ Export PDF</button>
                  </div>
                  <table>
                    <thead><tr><th>Engineer</th><th>Level</th><th>Target Hrs</th><th>Work Hrs</th><th>Billable</th><th>Leave</th><th>Utilization</th><th>Billability</th><th>Revenue</th></tr></thead>
                    <tbody>{engStats.map(e=>(
                      <tr key={e.id}>
                        <td><div style={{display:"flex",alignItems:"center",gap:7}}><div className="av" style={{fontSize:11,width:24,height:24}}>{e.name?.slice(0,2).toUpperCase()}</div><div><div style={{fontWeight:500,fontSize:14}}>{e.name}</div><div style={{fontSize:11,color:"var(--text4)"}}>{e.role}</div></div></div></td>
                        <td><span style={{fontSize:11,padding:"1px 5px",borderRadius:3,background:"var(--border)",color:"var(--text3)"}}>{e.level}</span></td>
                        <td style={{fontFamily:"'IBM Plex Mono',monospace",color:"var(--text4)"}}>{e.targetHrs}h{e.join_date&&(()=>{const j=new Date(e.join_date+"T12:00:00");if(j.getFullYear()===year&&j.getMonth()===month)return <span style={{fontSize:10,color:"#34d399",marginLeft:4}}>joined {j.getDate()}</span>;return null;})()}</td>
                        <td style={{fontFamily:"'IBM Plex Mono',monospace"}}>{e.workHrs}h</td>
                        <td style={{fontFamily:"'IBM Plex Mono',monospace",color:"var(--info)"}}>{e.billableHrs}h</td>
                        <td style={{color:e.leaveDays>0?"#fb923c":"var(--text4)"}}>{e.leaveDays}</td>
                        <td><div style={{display:"flex",alignItems:"center",gap:5}}><div style={{background:"var(--bg3)",height:4,borderRadius:3,width:60,overflow:"hidden"}}><div style={{height:"100%",width:`${e.utilization}%`,background:e.utilization>=80?"linear-gradient(90deg,#34d399,#10b981)":e.utilization>=60?"linear-gradient(90deg,#fb923c,#f59e0b)":"linear-gradient(90deg,#f87171,#ef4444)",borderRadius:3}}/></div><span style={{fontFamily:"'IBM Plex Mono',monospace",fontSize:12}}>{fmtPct(e.utilization)}</span></div></td>
                        <td><div style={{display:"flex",alignItems:"center",gap:5}}><div style={{background:"var(--bg3)",height:4,borderRadius:3,width:50,overflow:"hidden"}}><div style={{height:"100%",width:`${e.billability}%`,background:"linear-gradient(90deg,#a78bfa,#7c3aed)",borderRadius:3}}/></div><span style={{fontFamily:"'IBM Plex Mono',monospace",fontSize:12}}>{fmtPct(e.billability)}</span></div></td>
                        <td style={{fontFamily:"'IBM Plex Mono',monospace",color:"#a78bfa"}}>{fmtCurrency(e.revenue)}</td>
                      </tr>
                    ))}</tbody>
                  </table>
                </div>
              )}

              {/* Task analysis */}
              {activeRpt==="task"&&(()=>{
                const GC={"SCADA":"var(--info)","RTU-PLC":"#a78bfa","Protection":"#f87171","General":"#34d399"};
                return(
                <div className="card">
                  <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:16}}>
                    <div>
                      <h3 style={{fontSize:15,fontWeight:700,color:"var(--text0)",margin:0}}>Task Analysis</h3>
                      <p style={{fontSize:13,color:"var(--text4)",marginTop:2,marginBottom:0}}>{MONTHS[month]} {year} · {totalWorkHrs}h work logged</p>
                    </div>
                    <button className="bp" onClick={buildTaskPDF}>⬇ Export PDF</button>
                  </div>

                  {taskStats.length===0&&<p style={{color:"var(--text4)",fontSize:14}}>No work hours logged for this period.</p>}

                  {taskStats.map(grp=>{
                    const pct=totalWorkHrs?Math.round(grp.hours/totalWorkHrs*100):0;
                    const gc=GC[grp.category]||"var(--info)";
                    return(
                    <div key={grp.category} style={{marginBottom:18,paddingBottom:18,borderBottom:"1px solid #0d1a2d"}}>
                      {/* Group header + bar */}
                      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:6}}>
                        <div style={{display:"flex",alignItems:"center",gap:8}}>
                          <div style={{width:10,height:10,borderRadius:3,background:gc,flexShrink:0}}/>
                          <span style={{fontWeight:700,fontSize:15,color:gc}}>{grp.category}</span>
                        </div>
                        <div style={{display:"flex",gap:14,fontSize:13}}>
                          <span style={{fontFamily:"'IBM Plex Mono',monospace",color:gc,fontWeight:700}}>{grp.hours}h</span>
                          <span style={{color:"var(--text3)"}}>{pct}%</span>
                          <span style={{color:"#34d399"}}>{grp.hours?Math.round(grp.billable/grp.hours*100):0}% billable</span>
                        </div>
                      </div>
                      {/* Group progress bar */}
                      <div style={{background:"var(--bg3)",height:6,borderRadius:4,overflow:"hidden",marginBottom:10}}>
                        <div style={{height:"100%",width:`${pct}%`,background:gc,borderRadius:4,transition:"width .4s"}}/>
                      </div>
                      {/* Category pills with activity drill-down */}
                      <div style={{display:"grid",gap:6}}>
                        {Object.entries(grp.tasks).sort((a,b)=>b[1].hrs-a[1].hrs).map(([cat,catData])=>{
                          const catPct=grp.hours?Math.round(catData.hrs/grp.hours*100):0;
                          const topActs=Object.entries(catData.activities||{}).sort((a,b)=>b[1]-a[1]).slice(0,4);
                          return(
                          <div key={cat} style={{background:"var(--bg2)",border:"1px solid var(--border3)",borderRadius:6,padding:"8px 10px"}}>
                            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:topActs.length?4:0}}>
                              <span style={{fontSize:13,fontWeight:600,color:"var(--text2)"}}>{cat}</span>
                              <div style={{display:"flex",gap:8,alignItems:"center"}}>
                                <div style={{background:"var(--bg3)",height:4,borderRadius:3,width:50,overflow:"hidden"}}>
                                  <div style={{height:"100%",width:`${catPct}%`,background:gc+"80",borderRadius:3}}/>
                                </div>
                                <span style={{fontFamily:"'IBM Plex Mono',monospace",fontSize:12,color:gc}}>{catData.hrs}h</span>
                                <span style={{fontSize:11,color:"var(--text4)"}}>{catPct}%</span>
                              </div>
                            </div>
                            {topActs.length>0&&(
                              <div style={{display:"flex",flexWrap:"wrap",gap:4,marginTop:4}}>
                                {topActs.map(([act,hrs])=>(
                                  <span key={act} style={{background:"var(--bg0)",border:"1px solid #0d1a2d",borderRadius:4,
                                    padding:"2px 6px",fontSize:11,color:"var(--text3)"}}>
                                    {act.length>30?act.slice(0,28)+"…":act}
                                    <span style={{color:"var(--info)",fontFamily:"'IBM Plex Mono',monospace",marginLeft:4}}>{hrs}h</span>
                                  </span>
                                ))}
                                {Object.keys(catData.activities||{}).length>4&&(
                                  <span style={{fontSize:11,color:"var(--text4)",padding:"2px 4px"}}>
                                    +{Object.keys(catData.activities).length-4} more
                                  </span>
                                )}
                              </div>
                            )}
                          </div>);
                        })}
                      </div>
                    </div>
                  );})}
                </div>);
              })()}

              {/* ════ PROJECT TASKS ANALYSIS ════ */}
              {activeRpt==="projtasks"&&<ProjectTasksReport allEntries={entries} projects={projects} engineers={engineers} MONTHS={MONTHS} fmtCurrency={fmtCurrency} fmtPct={fmtPct} isAdmin={isAdmin} isAcct={isAcct}/>}

              {activeRpt==="tracker"&&(
                <TrackerProgressReport activities={activities} projects={projects} subprojects={subprojects} engineers={engineers}/>
              )}

              {activeRpt==="assignment"&&(
                <AssignmentReport entries={entries} projects={projects} engineers={engineers} month={month} year={year}/>
              )}

           {/* Vacation Report */}
              {activeRpt==="vacation"&&<VacationReport
                engineers={engineers} leaveEntries={leaveEntries} allEntries={entries}
                month={month} year={year} MONTHS={MONTHS}
                onExport={()=>buildVacationPDF(engineers,entries,leaveEntries,projects,month,year)}
              />}

              {/* Monthly mgmt */}
              {activeRpt==="monthly"&&(
                <div className="card" style={{textAlign:"center",padding:40}}>
                  <div style={{fontSize:36,marginBottom:10}}>📊</div>
                  <div style={{fontSize:16,fontWeight:700,marginBottom:6}}>Monthly Management Report</div>
                  <div style={{fontSize:14,color:"var(--text4)",marginBottom:18}}>Full executive summary for {MONTHS[month]} {year}</div>
                  <button className="bp" onClick={buildMonthlyPDF}>⬇ Export PDF</button>
                </div>
              )}

              {/* Invoice */}
              {activeRpt==="invoice"&&canInvoice&&(()=>{
                // All projects with hours — billable ones count toward invoice total
                const allWithHours=projStats.filter(p=>p.hours>0);
                const billableActive=allWithHours.filter(p=>p.billable);
                const filteredProjs=invoiceProjId==="ALL"?allWithHours:allWithHours.filter(p=>p.id===invoiceProjId);
                const invTotal=filteredProjs.filter(p=>p.billable).reduce((s,p)=>s+p.revenue,0);
                const invHrs=filteredProjs.filter(p=>p.billable).reduce((s,p)=>s+p.hours,0);
                return(
                <div>
                  {/* Invoice selector */}
                  <div className="card" style={{marginBottom:14}}>
                    <h3 style={{fontSize:15,fontWeight:600,color:"var(--text0)",marginBottom:14}}>🧾 Invoice Export — {MONTHS[month]} {year}</h3>
                    {/* Quick-fix: bulk mark all active projects as billable */}
                    {allWithHours.some(p=>!p.billable)&&(
                      <div style={{background:"#1a0f00",border:"1px solid #fb923c40",borderRadius:6,padding:"8px 12px",marginBottom:12,display:"flex",alignItems:"center",justifyContent:"space-between"}}>
                        <span style={{fontSize:13,color:"#fb923c"}}>
                          ⚠ {allWithHours.filter(p=>!p.billable).length} project(s) marked as non-billable — excluded from invoice
                        </span>
                        <button className="bg" style={{fontSize:13,borderColor:"#fb923c",color:"#fb923c",whiteSpace:"nowrap"}} onClick={async()=>{
                          const ids=allWithHours.filter(p=>!p.billable).map(p=>p.id);
                          for(const id of ids){
                            await supabase.from("projects").update({billable:true}).eq("id",id);
                          }
                          await loadAll();
                          showToast(`Marked ${ids.length} project(s) as billable ✓`);
                        }}>Mark all as billable</button>
                      </div>
                    )}
                    <div style={{display:"grid",gridTemplateColumns:"1fr auto",gap:12,alignItems:"flex-end",marginBottom:16}}>
                      <div><Lbl>Invoice Scope</Lbl>
                        <select value={invoiceProjId} onChange={e=>setInvoiceProjId(e.target.value)}>
                          <option value="ALL">📋 All Billable Projects (Combined Invoice)</option>
                          {allWithHours.filter(p=>p.billable).map(p=><option key={p.id} value={p.id}>{p.name} ({p.id}) · {p.hours}h · {fmtCurrency(p.revenue)}</option>)}
                        </select>
                      </div>
                      <button className="bp" style={{background:"linear-gradient(135deg,#a78bfa,#7c3aed)",whiteSpace:"nowrap"}}
                        onClick={()=>buildInvoicePDF(projects,entries,engineers,month,year,invoiceProjId==="ALL"?undefined:invoiceProjId)}>
                        🧾 Export PDF
                      </button>
                    </div>
                    {/* KPI strip */}
                    <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:10}}>
                      {[
                        {l:invoiceProjId==="ALL"?"Total Billable":"Project Total",v:fmtCurrency(invTotal),c:"#a78bfa"},
                        {l:"Billable Hours",v:invHrs+"h",c:"var(--info)"},
                        {l:invoiceProjId==="ALL"?"Projects":"Engineers",v:invoiceProjId==="ALL"?filteredProjs.length:[...new Set(entries.filter(e=>e.project_id===invoiceProjId&&new Date(e.date).getMonth()===month&&new Date(e.date).getFullYear()===year).map(e=>e.engineer_id))].length,c:"#34d399"},
                      ].map((s,i)=><div key={i} className="metric" style={{textAlign:"center"}}>
                        <div style={{fontFamily:"'IBM Plex Mono',monospace",fontSize:22,fontWeight:700,color:s.c}}>{s.v}</div>
                        <div style={{fontSize:12,color:"var(--text4)",marginTop:4}}>{s.l}</div>
                      </div>)}
                    </div>
                  </div>
                  {/* Preview table */}
                  <div className="card">
                    <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:12}}>
                      <h3 style={{fontSize:14,fontWeight:600,color:"var(--text2)",margin:0}}>
                        {invoiceProjId==="ALL"?"All Projects — Feb "+year+" (billable highlighted)":"Project Invoice Preview"}
                      </h3>
                      {allWithHours.filter(p=>!p.billable||p.rate_per_hour===0).length>0&&(
                        <span style={{fontSize:12,color:"#fb923c",background:"#2a1a0a",border:"1px solid #fb923c40",borderRadius:4,padding:"2px 8px"}}>
                          ⚠ {allWithHours.filter(p=>!p.billable||p.rate_per_hour===0).length} projects need rate set — go to Projects page to edit
                        </span>
                      )}
                    </div>
                    <table>
                      <thead><tr><th>Name</th><th>No.</th><th>Client</th><th>Hours</th><th>Rate</th><th>Amount</th><th>Status</th></tr></thead>
                      <tbody>
                        {filteredProjs.map(p=>{
                          const needsRate=p.billable&&p.rate_per_hour===0;
                          const notBillable=!p.billable;
                          const rowStyle={cursor:"pointer",opacity:notBillable?0.45:1,background:notBillable?"var(--bg0)":"inherit"};
                          return(
                          <tr key={p.id} style={rowStyle} onClick={()=>setInvoiceProjId(p.id)}>
                            <td style={{fontSize:13,fontWeight:600,color:notBillable?"var(--text3)":"var(--text0)"}}>{p.name||p.id}</td>
                      <td style={{fontFamily:"'IBM Plex Mono',monospace",fontSize:11,color:notBillable?"var(--text3)":"var(--info)"}}>{p.id}</td>
                            <td style={{fontSize:13,fontWeight:500,color:notBillable?"var(--text3)":"var(--text0)"}}>{p.name}</td>
                            <td style={{fontSize:13,color:"var(--text2)"}}>{p.client}</td>
                            <td style={{fontFamily:"'IBM Plex Mono',monospace",color:notBillable?"var(--text3)":"var(--text0)"}}>{p.hours}h</td>
                            <td style={{fontFamily:"'IBM Plex Mono',monospace",color:needsRate?"#fb923c":notBillable?"var(--text3)":"var(--text2)"}}>
                              {notBillable?"—":`$${p.rate_per_hour}/h`}
                            </td>
                            <td style={{fontFamily:"'IBM Plex Mono',monospace",color:notBillable?"var(--text3)":"#a78bfa",fontWeight:700}}>
                              {notBillable?"—":fmtCurrency(p.revenue)}
                            </td>
                            <td style={{fontSize:12}}>
                              {notBillable&&<span style={{color:"var(--text3)",background:"var(--border)",borderRadius:3,padding:"1px 5px"}}>not billable</span>}
                              {needsRate&&<span style={{color:"#fb923c",background:"#2a1a0a",borderRadius:3,padding:"1px 5px"}}>set rate ⚠</span>}
                              {p.billable&&p.rate_per_hour>0&&<span style={{color:"#34d399",background:"var(--bg2)",borderRadius:3,padding:"1px 5px"}}>✓ billable</span>}
                            </td>
                          </tr>
                          );
                        })}
                        {filteredProjs.filter(p=>p.billable).length>0&&(
                          <tr style={{background:"var(--bg3)"}}>
                            <td colSpan={3} style={{fontWeight:700,color:"var(--text0)"}}>BILLABLE TOTAL</td>
                            <td style={{fontFamily:"'IBM Plex Mono',monospace",fontWeight:700,color:"var(--info)"}}>{invHrs}h</td>
                            <td></td>
                            <td style={{fontFamily:"'IBM Plex Mono',monospace",fontWeight:700,color:"#a78bfa",fontSize:15}}>{fmtCurrency(invTotal)}</td>
                            <td></td>
                          </tr>
                        )}
                        {filteredProjs.length===0&&<tr><td colSpan={7} style={{textAlign:"center",color:"var(--text4)",padding:20}}>No hours logged for {MONTHS[month]} {year}</td></tr>}
                      </tbody>
                    </table>
                    {invoiceProjId!=="ALL"&&allWithHours.length>1&&(
                      <div style={{marginTop:10,textAlign:"right"}}>
                        <button className="bg" style={{fontSize:13}} onClick={()=>setInvoiceProjId("ALL")}>← Back to All Projects</button>
                      </div>
                    )}
                  </div>
                </div>
              );})()}
            </div>
          )}

          {/* ════ ADMIN / LEAD PANEL ════ */}
          {view==="admin"&&(isAdmin||role==="lead"||isAcct||isSenior)&&(
            <div>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:20}}>
                <div>
                  <h1 style={{fontSize:21,fontWeight:700,color:"var(--text0)"}}>{isAdmin?"Admin Panel":isSenior?"Overview Panel":isAcct?"Finance Panel":"Lead Panel"}</h1>
                  <p style={{color:"var(--text4)",fontSize:13,marginTop:3}}>{isAdmin?"Full control: engineers, projects, entries, settings":isSenior?"View-only access · full visibility across all data":isAcct?"Full access to Finance · View all data":"Edit engineer entries · Export individual timesheets"}</p>
                </div>
                {false&&unreadCount>0&&isAdmin&&<button className="bg" onClick={()=>{ notifications.forEach(n=>supabase.from("notifications").delete().eq("id",n.id)); setNotifications([]); }}>Dismiss all {notifications.length} notifications</button>}
              </div>

              {/* Notifications (admin only) — collapsible, state survives tab switches */}
              {isAdmin&&notifications.length>0&&(()=>{
                const signupNotifs  = notifications.filter(n=>n.type==="new_signup");
                const alertNotifs2  = notifications.filter(n=>n.type==="timesheet_alert");
                const otherNotifs   = notifications.filter(n=>n.type!=="new_signup"&&n.type!=="timesheet_alert");
                const totalCount    = notifications.length;
                return(
                <div style={{marginBottom:18,background:"var(--bg2)",border:"1px solid var(--border3)",borderRadius:10,overflow:"hidden"}}>
                  {/* Panel header — always visible, click to toggle */}
                  <div style={{display:"flex",alignItems:"center",gap:10,padding:"10px 14px",cursor:"pointer",userSelect:"none"}}
                    onClick={toggleNotifPanel}>
                    <span style={{fontSize:15}}>🔔</span>
                    <span style={{fontSize:13,fontWeight:700,color:"var(--text1)"}}>Notifications</span>
                    <span style={{background:"#ef444420",color:"#f87171",fontSize:11,fontWeight:700,padding:"2px 7px",borderRadius:10,minWidth:20,textAlign:"center"}}>{totalCount}</span>
                    <div style={{marginLeft:"auto",display:"flex",gap:8,alignItems:"center"}}>
                      <button style={{background:"#f8717110",border:"1px solid #f8717130",borderRadius:5,padding:"3px 10px",color:"#f87171",fontSize:11,cursor:"pointer"}}
                        onClick={e=>{e.stopPropagation();
                          // Save timesheet alert keys to localStorage before deleting so they don't re-insert
                          const alertKeys=notifications.filter(n=>n.type==="timesheet_alert").map(n=>{try{return JSON.parse(n.meta||"{}").alert_key;}catch{return null;}}).filter(Boolean);
                          if(alertKeys.length){const prev=JSON.parse(localStorage.getItem("ec_dismissed_alerts")||"[]");localStorage.setItem("ec_dismissed_alerts",JSON.stringify([...new Set([...prev,...alertKeys])]));}
                          const ids=notifications.map(n=>n.id); supabase.from("notifications").delete().in("id",ids); setNotifications([]);}}>
                        Dismiss All
                      </button>
                      <span style={{fontSize:14,color:"var(--text4)",fontWeight:700,transform:notifPanelOpen?"rotate(0)":"rotate(-90deg)",display:"inline-block",transition:"transform 0.2s"}}>▾</span>
                    </div>
                  </div>

                  {/* Collapsible body */}
                  {notifPanelOpen&&(
                  <div style={{borderTop:"1px solid var(--border3)",padding:"12px 14px",display:"grid",gap:10}}>

                    {/* 👤 New Signups */}
                    {signupNotifs.length>0&&(
                      <div>
                        <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:7}}>
                          <span style={{fontSize:12,fontWeight:700,color:"#fb923c",textTransform:"uppercase",letterSpacing:".05em"}}>👤 New Signups</span>
                          <span style={{background:"#fb923c20",color:"#fb923c",fontSize:10,fontWeight:700,padding:"1px 6px",borderRadius:8}}>{signupNotifs.length}</span>
                          <button style={{marginLeft:"auto",background:"transparent",border:"none",color:"var(--text4)",fontSize:11,cursor:"pointer",padding:"2px 6px"}}
                            onClick={()=>dismissAllOfType("new_signup")}>Dismiss all</button>
                        </div>
                        <div style={{display:"grid",gap:5}}>
                          {signupNotifs.map(n=>(
                            <div key={n.id} style={{display:"flex",alignItems:"center",gap:10,background:"var(--bg1)",borderRadius:7,padding:"9px 12px",border:"1px solid #fb923c18"}}>
                              <div style={{flex:1,minWidth:0}}>
                                <div style={{fontSize:13,fontWeight:600,color:"var(--text0)"}}>{n.message}</div>
                                <div style={{fontSize:11,color:"var(--text4)",marginTop:3}}>
                                  {new Date(n.created_at).toLocaleString("en-EG",{day:"2-digit",month:"short",year:"numeric",hour:"2-digit",minute:"2-digit",hour12:false})}
                                  {" · "}<span style={{color:"var(--info)"}}>Engineers tab → set role</span>
                                </div>
                              </div>
                              <button style={{flexShrink:0,background:"transparent",border:"1px solid var(--border3)",borderRadius:5,padding:"3px 9px",color:"var(--text3)",fontSize:11,cursor:"pointer"}}
                                onClick={()=>dismissNotification(n.id)}>✕</button>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* ⏰ Timesheet Alerts */}
                    {alertNotifs2.length>0&&(
                      <div>
                        <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:7}}>
                          <span style={{fontSize:12,fontWeight:700,color:"#f87171",textTransform:"uppercase",letterSpacing:".05em"}}>⏰ Timesheet Alerts</span>
                          <span style={{background:"#f8717120",color:"#f87171",fontSize:10,fontWeight:700,padding:"1px 6px",borderRadius:8}}>{alertNotifs2.length}</span>
                          <button style={{marginLeft:"auto",background:"transparent",border:"none",color:"var(--text4)",fontSize:11,cursor:"pointer",padding:"2px 6px"}}
                            onClick={()=>dismissAllOfType("timesheet_alert")}>Dismiss all</button>
                        </div>
                        <div style={{display:"grid",gap:5}}>
                          {alertNotifs2.map(n=>(
                            <div key={n.id} style={{display:"flex",alignItems:"center",gap:10,background:"var(--bg1)",borderRadius:7,padding:"9px 12px",border:"1px solid #f8717118"}}>
                              <div style={{flex:1,minWidth:0}}>
                                <div style={{fontSize:13,color:"var(--text0)"}}>{n.message}</div>
                                <div style={{fontSize:11,color:"var(--text4)",marginTop:3}}>
                                  {new Date(n.created_at).toLocaleString("en-EG",{day:"2-digit",month:"short",year:"numeric",hour:"2-digit",minute:"2-digit",hour12:false})}
                                </div>
                              </div>
                              <button style={{flexShrink:0,background:"transparent",border:"1px solid var(--border3)",borderRadius:5,padding:"3px 9px",color:"var(--text3)",fontSize:11,cursor:"pointer"}}
                                onClick={()=>dismissNotification(n.id)}>✕</button>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* ℹ System */}
                    {otherNotifs.length>0&&(
                      <div>
                        <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:7}}>
                          <span style={{fontSize:12,fontWeight:700,color:"var(--text3)",textTransform:"uppercase",letterSpacing:".05em"}}>ℹ System</span>
                          <span style={{background:"var(--bg3)",color:"var(--text3)",fontSize:10,fontWeight:700,padding:"1px 6px",borderRadius:8}}>{otherNotifs.length}</span>
                          <button style={{marginLeft:"auto",background:"transparent",border:"none",color:"var(--text4)",fontSize:11,cursor:"pointer",padding:"2px 6px"}}
                            onClick={()=>{const ids=otherNotifs.map(n=>n.id);supabase.from("notifications").delete().in("id",ids);setNotifications(prev=>prev.filter(n=>n.type==="new_signup"||n.type==="timesheet_alert"));}}>Dismiss all</button>
                        </div>
                        <div style={{display:"grid",gap:5}}>
                          {otherNotifs.map(n=>(
                            <div key={n.id} style={{display:"flex",alignItems:"center",gap:10,background:"var(--bg1)",borderRadius:7,padding:"9px 12px",border:"1px solid var(--border3)"}}>
                              <div style={{flex:1,minWidth:0}}>
                                <div style={{fontSize:13,color:"var(--text0)"}}>{n.message}</div>
                                <div style={{fontSize:11,color:"var(--text4)",marginTop:3}}>{new Date(n.created_at).toLocaleString("en-EG",{day:"2-digit",month:"short",year:"numeric",hour:"2-digit",minute:"2-digit",hour12:false})}</div>
                              </div>
                              <button style={{flexShrink:0,background:"transparent",border:"1px solid var(--border3)",borderRadius:5,padding:"3px 9px",color:"var(--text3)",fontSize:11,cursor:"pointer"}}
                                onClick={()=>dismissNotification(n.id)}>✕</button>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                  </div>
                  )}
                </div>
                );
              })()}

              {/* Tabs */}
              <div style={{display:"flex",gap:4,marginBottom:18,background:"var(--bg2)",borderRadius:8,padding:4,width:"fit-content"}}>
                {[
                  {id:"engineers",label:"👥 Engineers",show:isAdmin||isAcct||isSenior},
                  {id:"projects", label:"◈ Projects",  show:isAdmin||isLead||isAcct||isSenior},
                  {id:"entries",  label:"⏱ All Entries",show:isAdmin||isLead||isAcct||isSenior},
                  {id:"finance",  label:"💰 Finance",   show:isAdmin||isAcct||isSenior},
                  {id:"functions",label:"⚡ Functions",  show:isAdmin||isLead||isAcct||isSenior},
                  {id:"kpis",     label:"📈 KPIs",       show:isAdmin||isLead||isAcct||isSenior},
                  {id:"tracker",  label:"📊 Tracker",    show:isAdmin||isLead||isAcct||isSenior},
                  {id:"settings", label:"ℹ Info",        show:isAdmin},
                  {id:"actlog",   label:"🪵 Activity Log", show:isAdmin},
                ].filter(t=>t.show).map(t=>(
                  <button key={t.id} className={`atab ${adminTab===t.id?"a":""}`} onClick={()=>setAdminTab(t.id)}>{t.label}</button>
                ))}
              </div>

              {/* ENGINEERS */}
              {adminTab==="engineers"&&(isAdmin||isAcct||isSenior)&&(
                <div className="card">
                  <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:14}}>
                    <h3 style={{fontSize:15,fontWeight:600,color:"var(--text2)"}}>Engineers & Access Control ({engineers.length})</h3>
                    {isAdmin&&<button className="bp" onClick={()=>setShowEngModal(true)}>+ Add Member</button>}
                  </div>
                  <div style={{background:"var(--bg2)",border:"1px solid #0ea5e930",borderRadius:6,padding:"8px 12px",fontSize:13,color:"var(--info)",marginBottom:12}}>
                    ℹ New registrations default to <strong>Engineer</strong> role. Update their role here after they sign up.
                  </div>
                  <div style={{marginBottom:10}}><input value={engSearch} onChange={e=>setEngSearch(e.target.value)} placeholder="Search engineers..." style={{width:"100%",boxSizing:"border-box",padding:"7px 12px",borderRadius:6,border:"1px solid var(--border3)",background:"var(--bg2)",color:"var(--text0)",fontSize:13}}/></div>
                  <table>
                    <thead><tr><th>Name</th><th>Job Role</th><th>Level</th><th>Email</th><th>Access Role</th><th>Weekend</th><th>Month Hrs</th><th style={{width:110}}>Actions</th></tr></thead>
                    <tbody>{engineers.filter(eng=>!engSearch||(eng.name||"").toLowerCase().includes(engSearch.toLowerCase())||(eng.role||"").toLowerCase().includes(engSearch.toLowerCase())).map(eng=>{
                      const es=engStats.find(e=>e.id===eng.id);
                      const engWd=()=>{try{return eng.weekend_days?JSON.parse(eng.weekend_days):DEFAULT_WEEKEND;}catch{return DEFAULT_WEEKEND;}};
                      const wdStr=engWd().map(d=>["Su","Mo","Tu","We","Th","Fr","Sa"][d]).join("+");
                      return(
                        <tr key={eng.id}>
                          <td><div style={{display:"flex",alignItems:"center",gap:8}}><div className="av" style={{fontSize:11,width:26,height:26,opacity:!isEngActive(eng)?0.4:1}}>{eng.name?.slice(0,2).toUpperCase()}</div><div><span style={{fontWeight:500,color:!isEngActive(eng)?"var(--text3)":"inherit"}}>{eng.name}</span>{!isEngActive(eng)&&<span style={{marginLeft:5,fontSize:11,padding:"1px 5px",borderRadius:3,background:"#f8717120",color:"#f87171"}}>INACTIVE</span>}</div></div></td>
                          <td style={{color:"var(--text2)",fontSize:13}}>{eng.role}</td>
                          <td><span style={{fontSize:11,padding:"2px 6px",borderRadius:3,background:"var(--border)",color:"var(--text3)"}}>{eng.level}</span></td>
                          <td style={{color:"var(--text3)",fontSize:13}}>{eng.email||"—"}</td>
                          <td>
                            <div style={{display:"flex",gap:5,alignItems:"center"}}>
                              <select value={pendingRoles[eng.id]??eng.role_type??"engineer"}
                                style={{padding:"3px 6px",fontSize:13,width:"auto",background:"var(--bg2)",border:"1px solid var(--border3)",color:"var(--text1)",borderRadius:4,outline:"none"}}
                                onChange={e=>setPendingRoles(p=>({...p,[eng.id]:e.target.value}))}>
                                {ROLE_TYPES.map(r=><option key={r} value={r}>{ROLE_LABELS[r]}</option>)}
                              </select>
                              {pendingRoles[eng.id]&&pendingRoles[eng.id]!==eng.role_type&&(
                                <button className="be" style={{fontSize:12,padding:"3px 8px"}} onClick={async()=>{
                                  const newRole=pendingRoles[eng.id];
                                  const {data,error}=await supabase.from("engineers").update({role_type:newRole}).eq("id",eng.id).select().single();
                                  if(error){
                                    // RLS blocks this — need policy: allow admin to update any row
                                    // Workaround: update local state and show SQL to run
                                    setEngineers(prev=>prev.map(e=>e.id===eng.id?{...e,role_type:newRole}:e));
                                    showToast("Role set locally ✓ — To persist: run SQL migration in Admin › Info tab",false);
                                    return;
                                  }
                                  if(data) setEngineers(prev=>prev.map(x=>x.id===data.id?data:x));
                                  setPendingRoles(p=>{const n={...p};delete n[eng.id];return n;});
                                  showToast(`${eng.name} → ${ROLE_LABELS[newRole]} ✓`);
                                  logAction("UPDATE","Engineer",`Role changed: ${eng.name} → ${newRole}`,{engineer_id:eng.id,name:eng.name,new_role:newRole});
                                }}>Save</button>
                              )}
                            </div>
                          </td>
                          <td style={{fontFamily:"'IBM Plex Mono',monospace",fontSize:12,color:"#f47218"}}>{wdStr||"—"}</td>
                          <td style={{fontFamily:"'IBM Plex Mono',monospace",color:"var(--info)"}}>{es?.workHrs||0}h</td>
                          <td><div style={{display:"flex",gap:5}}>
                            <button className="be" onClick={()=>setEditEngModal({...eng})}>✎</button>
                            <button className="bd" onClick={()=>deleteEngineer(eng.id)}>✕</button>
                          </div></td>
                        </tr>
                      );
                    })}</tbody>
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
                />
              )}

              {/* ALL ENTRIES */}
              {adminTab==="entries"&&(
                <div>
                  <div className="card" style={{marginBottom:12}}>
                    <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:10}}>
                      <div><Lbl>Engineer</Lbl>
                        <select value={entryFilter.engineer} onChange={e=>setEntryFilter(p=>({...p,engineer:e.target.value}))}>
                          <option value="ALL">All Engineers</option>
                          {engineers.map(e=><option key={e.id} value={e.id}>{e.name}</option>)}
                        </select>
                      </div>
                      <div><Lbl>Project</Lbl>
                        <select value={entryFilter.project} onChange={e=>setEntryFilter(p=>({...p,project:e.target.value}))}>
                          <option value="ALL">All Projects</option>
                          {projects.map(p=><option key={p.id} value={p.id}>{p.name} ({p.id})</option>)}
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
                    {(()=>{
                      const workE=adminBrowseEntries.filter(e=>e.entry_type==="work");
                      const leaveE=adminBrowseEntries.filter(e=>e.entry_type==="leave");
                      const totalWH=workE.reduce((s,e)=>s+e.hours,0);
                      const billH=workE.filter(e=>{const p=projects.find(x=>x.id===e.project_id);return p&&p.billable;}).reduce((s,e)=>s+e.hours,0);
                      const nonBillH=totalWH-billH;
                      const uniqEngs=[...new Set(workE.map(e=>e.engineer_id))].length;
                      const uniqProjs=[...new Set(workE.map(e=>e.project_id).filter(Boolean))].length;
                      return(
                    <div style={{marginBottom:14}}>
                      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:10}}>
                        <h3 style={{fontSize:15,fontWeight:600,color:"var(--text2)"}}>Entries ({adminBrowseEntries.length})</h3>
                        <span style={{fontFamily:"'IBM Plex Mono',monospace",fontSize:13,color:"#34d399",fontWeight:700}}>{totalWH}h work · <span style={{color:"#fb923c"}}>{leaveE.length}d leave</span></span>
                      </div>
                      <div style={{display:"grid",gridTemplateColumns:"repeat(5,1fr)",gap:8}}>
                        {[
                          {l:"Work Hours",  v:totalWH+"h",       c:"var(--info)"},
                          {l:"Billable",    v:billH+"h",         c:"#34d399"},
                          {l:"Non-Billable",v:nonBillH+"h",      c:"#fb923c"},
                          {l:"Engineers",   v:uniqEngs,          c:"#a78bfa"},
                          {l:"Projects",    v:uniqProjs,         c:"#60a5fa"},
                        ].map((s,i)=>(
                          <div key={i} style={{background:"var(--bg2)",borderRadius:6,padding:"8px 10px"}}>
                            <div style={{fontSize:11,color:"var(--text4)",fontWeight:700,textTransform:"uppercase",letterSpacing:".05em"}}>{s.l}</div>
                            <div style={{fontFamily:"'IBM Plex Mono',monospace",fontSize:17,fontWeight:700,color:s.c,marginTop:4}}>{s.v}</div>
                          </div>
                        ))}
                      </div>
                    </div>
                      );
                    })()}
                    <div style={{maxHeight:500,overflowY:"auto"}}>
                      <table>
                        <thead><tr><th>Date</th><th>Engineer</th><th>Project</th><th>Task</th><th>Activity</th><th>Hrs</th><th>Type</th><th style={{width:90}}>Actions</th></tr></thead>
                        <tbody>
                          {adminBrowseEntries.length===0&&<tr><td colSpan={8} style={{textAlign:"center",color:"var(--text4)",padding:20}}>No entries</td></tr>}
                          {adminBrowseEntries.map(e=>{
                            const eng=engineers.find(x=>x.id===e.engineer_id);
                            const proj=projects.find(x=>x.id===e.project_id);
                            return(
                              <tr key={e.id}>
                                <td style={{fontFamily:"'IBM Plex Mono',monospace",fontSize:13}}>{e.date}</td>
                                <td style={{fontSize:13}}>{eng?.name||"—"}</td>
                                <td style={{fontSize:13}}>{proj?<span style={{color:"var(--info)"}}>{proj.name} <span style={{fontFamily:"'IBM Plex Mono',monospace",fontSize:11,color:"var(--text3)"}}>({proj.id})</span></span>:<span style={{color:"#fb923c"}}>{e.leave_type}</span>}</td>
                                <td style={{fontSize:12,color:"var(--text2)"}}>{e.task_type||"—"}</td>
                                <td style={{fontSize:12,color:"var(--text3)",fontStyle:"italic",maxWidth:140,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{e.activity||"—"}</td>
                                <td style={{fontFamily:"'IBM Plex Mono',monospace",color:"var(--info)",fontWeight:700}}>{e.hours}h</td>
                                <td><span style={{fontSize:11,padding:"2px 5px",borderRadius:3,background:e.entry_type==="leave"?"#7c2d1230":"#022c2230",color:e.entry_type==="leave"?"#fb923c":"#34d399",fontWeight:700}}>{e.entry_type}</span></td>
                                {canEditAny&&<td><div style={{display:"flex",gap:4}}>
                                  <button className="be" style={{fontSize:12}} onClick={()=>setEditEntry({...e,projectId:e.project_id,type:e.entry_type,taskCategory:e.task_category||"Engineering",taskType:e.task_type||"Basic Engineering",leaveType:e.leave_type||"Annual Leave"})}>✎</button>
                                  {isAdmin&&<button className="bd" style={{fontSize:12}} onClick={()=>deleteEntry(e.id,e.engineer_id)}>✕</button>}
                                </div></td>}
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              )}


              {/* ══ FINANCE MODULE ══ */}
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
                  accounts={accounts} showToast={showToast} logAction={logAction} supabase={supabase}/>
              )}

              {/* ══ FUNCTIONS / ACTIVITIES ══ */}
              {adminTab==="functions"&&(isAdmin||isLead||isAcct||isSenior)&&(
                <FunctionsTab
                  entries={entries} engineers={engineers}
                  funcYear={funcYear} setFuncYear={setFuncYear}
                  funcEngId={funcEngId} setFuncEngId={setFuncEngId}
                  deleteEntry={deleteEntry} isAdmin={isAdmin} isLead={isLead} isAcct={isAcct} year={year}
                  setShowFuncModal={setShowFuncModal}
                />
              )}

              {/* ══ KPI DASHBOARD ══ */}
              {adminTab==="kpis"&&(isAdmin||isLead||isAcct||isSenior)&&(
                <KPIsTab
                  entries={entries} engineers={engineers} projects={projects}
                  kpiYear={kpiYear} setKpiYear={setKpiYear}
                  kpiEngId={kpiEngId} setKpiEngId={setKpiEngId}
                  kpiNotes={kpiNotes} setKpiNotes={setKpiNotes}
                  isAdmin={isAdmin} isLead={isLead} isAcct={isAcct} year={year}
                  notifications={notifications}
                  onDismissNotif={dismissNotification}
                  alertDay={alertDay} setAlertDay={setAlertDay}
                  showToast={showToast}
                />
              )}


              {/* ══ PROJECT TRACKER ══ */}
              {adminTab==="tracker"&&(isAdmin||isLead||isAcct||isSenior)&&(
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
                  showToast={showToast}
                  logAction={logAction}
                />
              )}

              {/* SETTINGS */}
              {adminTab==="settings"&&isAdmin&&(
                <div style={{maxWidth:600,display:"grid",gap:14}}>
                  <div className="card">
                    <h3 style={{fontSize:15,fontWeight:700,color:"var(--text0)",marginBottom:4}}>Access Role Descriptions</h3>
                    <p style={{fontSize:13,color:"var(--text4)",marginBottom:14,lineHeight:1.6}}>Each role controls what features are visible and accessible.</p>
                    <div style={{display:"grid",gap:8}}>
                      {[
                        {role:"engineer",label:"Engineer",color:"var(--text3)",perms:"Post own hours on assigned projects only · View dashboard, projects & team · No reports access"},
                        {role:"lead",    label:"Lead Engineer",color:"var(--info)",perms:"Post & edit any engineer's hours · View all reports · Export individual timesheets · Manage project tracker"},
                        {role:"accountant",label:"Accountant",color:"#a78bfa",perms:"Full Finance tab access · Add/edit/delete expenses · Export all reports & invoices · View rates & revenue"},
                        {role:"senior_management",label:"Senior Management",color:"#fb923c",perms:"View-only admin access · Export all reports · No data entry or editing allowed"},
                        {role:"admin",   label:"Admin",color:"#34d399",perms:"Full access · Manage engineers & projects · All reports & invoices · Configure system settings"},
                      ].map(r=>(
                        <div key={r.role} style={{background:"var(--bg2)",border:`1px solid ${r.color}30`,borderRadius:8,padding:"10px 14px"}}>
                          <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:4}}>
                            <span className="role-badge" style={{background:r.color+"20",color:r.color}}>{r.label}</span>
                          </div>
                          <div style={{fontSize:13,color:"var(--text3)",lineHeight:1.5}}>{r.perms}</div>
                        </div>
                      ))}
                    </div>
                  </div>
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
                    supabase.from("activity_log").select("*").order("created_at",{ascending:false}).limit(2000)
                      .then(({data})=>{ if(data) setActivityLog(data); setLogLoading(false); });
                  }}
                  onArchive={async()=>{
                    if(!window.confirm(`Move logs older than ${retentionDays} days to archive?`)) return;
                    const {data,error} = await supabase.rpc("archive_activity_log",{retention_days:retentionDays});
                    if(error){ alert("Archive error: "+error.message); return; }
                    const r = data?.[0]||{};
                    showToast(`Archived ${r.archived_count||0} events, removed ${r.deleted_count||0} from live log`);
                    logAction("EXPORT","Auth",`Archived activity log — retention ${retentionDays}d`,{archived:r.archived_count,deleted:r.deleted_count});
                    // Reload live log after archive
                    setLogLoading(true);
                    supabase.from("activity_log").select("*").order("created_at",{ascending:false}).limit(2000)
                      .then(({data:liveData})=>{ if(liveData) setActivityLog(liveData); setLogLoading(false); });
                    // Reset archive cache so next "Load Archive" gets fresh data
                    setArchiveLog([]); setArchiveLoaded(false);
                  }}
                  onLoadArchive={()=>{
                    setArchiveLoading(true);
                    supabase.from("activity_log_archive").select("*").order("created_at",{ascending:false}).limit(2000)
                      .then(({data,error})=>{
                        if(error){ console.error("[Archive] Load failed:",error.message); showToast("Archive load error: "+error.message,false); }
                        else{ setArchiveLog(data||[]); setArchiveLoaded(true); }
                        setArchiveLoading(false);
                      });
                  }}
                  onPruneArchive={async()=>{
                    if(!window.confirm("Delete archive entries older than 1 year? This cannot be undone.")) return;
                    const {data,error} = await supabase.rpc("prune_activity_archive",{max_age_days:365});
                    if(error){alert("Prune error: "+error.message);return;}
                    showToast(`Pruned ${data||0} archive entries older than 1 year`);
                    logAction("DELETE","Auth",`Pruned activity archive — entries older than 365d`,{pruned:data});
                    setArchiveLog([]); setArchiveLoaded(false);
                  }}
                />
              )}
            </div>
          )}




          {/* ════ IMPORT EXCEL ════ */}
          {view==="import"&&isAdmin&&(
            <div>
              <div style={{marginBottom:20}}>
                <h1 style={{fontSize:21,fontWeight:700,color:"var(--text0)"}}>Import Excel Timesheets</h1>
                <div style={{display:"flex",alignItems:"center",gap:10,marginTop:4}}>
                  <p style={{color:"var(--text4)",fontSize:14}}>Upload ENEVOEGY timesheet files · Engineers &amp; projects created automatically</p>
                  <span style={{fontSize:12,padding:"2px 8px",borderRadius:3,background:xlsxReady?"#024b36":"#1a0a00",color:xlsxReady?"#34d399":"#fb923c",fontWeight:700,fontFamily:"'IBM Plex Mono',monospace"}}>
                    {xlsxReady?"✓ XLSX READY":"⏳ LOADING XLSX..."}
                  </span>
                </div>
              </div>
              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:16}}>
                {/* Upload panel */}
                <div>
                  <div className="card" style={{marginBottom:14}}>
                    <h3 style={{fontSize:15,fontWeight:700,color:"var(--text0)",marginBottom:12}}>📂 Upload Timesheet Files</h3>
                    <div style={{border:"2px dashed #192d47",borderRadius:8,padding:"28px",textAlign:"center",marginBottom:14,cursor:"pointer",transition:"border-color .2s"}}
                      onDragOver={e=>{e.preventDefault();e.currentTarget.style.borderColor="var(--info)";}}
                      onDragLeave={e=>{e.currentTarget.style.borderColor="var(--border)";}}
                      onDrop={e=>{e.preventDefault();e.currentTarget.style.borderColor="var(--border)";const f=[...e.dataTransfer.files].filter(f=>f.name.endsWith(".xlsx")||f.name.endsWith(".xls"));setImportFiles(prev=>[...prev,...f]);}}
                      onClick={()=>document.getElementById("xlsxInput").click()}>
                      <div style={{fontSize:32,marginBottom:8}}>📊</div>
                      <div style={{fontSize:15,fontWeight:600,color:"var(--text0)",marginBottom:4}}>Drop .xlsx files here or click to browse</div>
                      <div style={{fontSize:13,color:"var(--text4)"}}>Supports ENEVOEGY timesheet format · Multiple files at once</div>
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
                              <div style={{fontSize:12,color:"var(--text4)"}}>{(f.size/1024).toFixed(1)} KB</div>
                            </div>
                            <button className="bd" style={{fontSize:12}} onClick={()=>setImportFiles(prev=>prev.filter((_,j)=>j!==i))}>✕</button>
                          </div>
                        ))}
                        {!xlsxReady&&<div style={{background:"#1a0a00",border:"1px solid #fb923c30",borderRadius:6,padding:"8px 12px",fontSize:13,color:"#fb923c",marginBottom:8}}>⏳ XLSX library loading... wait a moment then try again.</div>}
                        <div style={{display:"flex",gap:10,marginTop:12}}>
                          <button className="bp" style={{flex:1,justifyContent:"center"}} disabled={importing||!xlsxReady} onClick={()=>importTimesheets(importFiles)}>
                            {importing?"⏳ Importing...":!xlsxReady?"⏳ Loading XLSX...":"⬆ Import All Files"}
                          </button>
                          <button className="bg" onClick={()=>{setImportFiles([]);setImportLog([]);}}>Clear</button>
                        </div>
                      </div>
                    )}
                  </div>
                  <div className="card">
                    <h3 style={{fontSize:14,fontWeight:700,color:"var(--text0)",marginBottom:10}}>📋 What Gets Imported</h3>
                    {[
                      ["👤","Engineer","Created automatically from Name + Email in the sheet header"],
                      ["⏱","Work Hours","Daily task + hours + project mapped to entries"],
                      ["✈","Leave Days","Public holidays and leave days detected automatically"],
                      ["◈","Projects","Matched by project name — assign missing ones after import"],
                      ["🔤","Task Types","Auto-detected from task description (SCADA, HMI, PLC, etc.)"],
                    ].map(([icon,label,desc])=>(
                      <div key={label} style={{display:"flex",gap:10,marginBottom:10}}>
                        <div style={{fontSize:16,width:24,flexShrink:0}}>{icon}</div>
                        <div><div style={{fontSize:14,fontWeight:600}}>{label}</div><div style={{fontSize:13,color:"var(--text4)",lineHeight:1.5}}>{desc}</div></div>
                      </div>
                    ))}
                    <div style={{background:"#1a0a00",border:"1px solid #fb923c30",borderRadius:6,padding:"9px 12px",fontSize:13,color:"#fb923c",marginTop:8}}>
                      ⚠ After importing, go to Admin → All Entries to review and assign project numbers to any unmatched entries.
                    </div>
                  </div>
                </div>
                {/* Log panel */}
                <div className="card" style={{maxHeight:600,overflowY:"auto"}}>
                  <h3 style={{fontSize:14,fontWeight:700,color:"var(--text0)",marginBottom:12}}>📋 Import Log</h3>
                  {importLog.length===0&&<div style={{color:"var(--text4)",fontSize:14,textAlign:"center",padding:30}}>No import started yet</div>}
                  {importLog.map((entry,i)=>(
                    <div key={i} style={{display:"flex",gap:8,marginBottom:5,fontSize:13,padding:"4px 0",borderBottom:"1px solid #0d1a2d"}}>
                      <span style={{width:8,height:8,borderRadius:"50%",marginTop:4,flexShrink:0,background:entry.type==="ok"?"#34d399":entry.type==="error"?"#f87171":entry.type==="warn"?"#fb923c":"var(--info)"}}/>
                      <span style={{color:entry.type==="ok"?"#34d399":entry.type==="error"?"#f87171":entry.type==="warn"?"#fb923c":"var(--text2)",lineHeight:1.4}}>{entry.msg}</span>
                    </div>
                  ))}
                  {importing&&<div style={{textAlign:"center",padding:10,color:"var(--info)",fontFamily:"'IBM Plex Mono',monospace",fontSize:13}}>Processing…</div>}
                </div>
              </div>
            </div>
          )}

          </>}
        </div>
      </div>

      {/* ════ MODALS ════ */}

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
          // Show all activities for this project — not just ones assigned to the engineer
          return matchSub && matchCat;
        });

        const INP={width:"100%",background:"var(--bg2)",border:"1px solid var(--border3)",borderRadius:5,color:"var(--text0)",padding:"7px 10px",fontSize:14,boxSizing:"border-box"};
        const LBL={fontSize:12,color:"var(--text2)",fontWeight:700,display:"block",marginBottom:4,letterSpacing:".05em"};
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
              <p style={{fontSize:12,color:"var(--text4)",fontFamily:"'IBM Plex Mono',monospace",margin:0}}>
                {new Date(modalDate).toLocaleDateString("en-US",{weekday:"long",month:"short",day:"numeric"})}
                {canEdit&&viewEng&&<span> · {viewEng.name}</span>}
              </p>
            </div>

            <StepBar/>

            <div style={{display:"grid",gap:12}}>

              {/* ── STEP 1: Entry type ── */}
              {step===1&&(
                <div>
                  <label style={LBL}>WHAT ARE YOU LOGGING?</label>
                  <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:8,marginTop:4}}>
                    {[
                      {v:"work",   icon:"🔧", label:"Work"},
                      {v:"function",icon:"📋",label:"Function"},
                      {v:"leave",  icon:"🌴", label:"Leave"},
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

              {/* ── STEP 2 for LEAVE: type + hours ── */}
              {step===2&&isLeave&&(
                <div style={{display:"grid",gap:12}}>
                  <div>
                    <label style={LBL}>LEAVE TYPE</label>
                    <select value={newEntry.leaveType} onChange={e=>setNewEntry(p=>({...p,leaveType:e.target.value}))} style={INP}>
                      {LEAVE_TYPES.map(t=><option key={t}>{t}</option>)}
                    </select>
                  </div>
                  <div style={{padding:"10px 12px",background:"var(--bg0)",borderRadius:6,border:"1px solid var(--border3)",fontSize:13,color:"var(--text3)"}}>
                    ℹ️ Leave entries are logged as a full 8-hour day automatically.
                  </div>
                </div>
              )}

              {/* ── STEP 2 for FUNCTION: category ── */}
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
                            fontSize:12,fontWeight:700,cursor:"pointer",textAlign:"left"}}>
                          {c}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* ── STEP 3 for FUNCTION: hours + description ── */}
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
                      <label style={LBL}>DESCRIPTION</label>
                      <textarea rows={2} value={newEntry.activity}
                        onChange={e=>setNewEntry(p=>({...p,activity:e.target.value}))}
                        placeholder="Describe the activity…" style={{...INP,resize:"vertical"}}/>
                    </div>
                  </div>
                </div>
              )}

              {/* ── STEP 2 for WORK: project + sub-site ── */}
              {step===2&&isWork&&(
                <div style={{display:"grid",gap:12}}>
                  {(()=>{
                    return(
                    <div>
                      <label style={LBL}>PROJECT</label>
                      {_noProjects?(
                        <div style={{padding:"12px",background:"#1a0a0a",border:"1px solid #f8717140",borderRadius:6,fontSize:13,color:"#f87171",textAlign:"center"}}>
                          ⚠ {_targetEng?.name||"This engineer"} is not assigned to any active project.<br/>
                          <span style={{color:"var(--text3)",fontSize:12}}>Ask an admin to assign projects first.</span>
                        </div>
                      ):(
                        <select value={newEntry.projectId}
                          onChange={e=>setNewEntry(p=>({...p,projectId:e.target.value,activityId:null,_actCat:null,_actSub:null}))}
                          style={{...INP,borderColor:!newEntry.projectId?"#f87171":"var(--border)"}}>
                          <option value="">— Select Project —</option>
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
                        <option value="">— All sub-sites —</option>
                        {projSubList.map(sid=>{
                          const sp=subprojects.find(s=>String(s.id)===String(sid));
                          return sp?<option key={sid} value={sid}>{sp.name}</option>:null;
                        })}
                      </select>
                    </div>
                  )}
                </div>
              )}

              {/* ── STEP 3 for WORK: group + category + activity ── */}
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
                            fontSize:12,fontWeight:700,cursor:"pointer"}}>
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

                  {/* Activity — from tracker if available, else from taxonomy */}
                  <div>
                    <label style={LBL}>ACTIVITY</label>
                    {filteredActs.length>0?(
                      <select value={newEntry.activityId||""}
                        onChange={e=>setNewEntry(p=>({...p,activityId:e.target.value||null,
                          taskType:filteredActs.find(a=>String(a.id)===e.target.value)?.activity_name||p.taskType}))}
                        style={{...INP,borderColor:"var(--info)"+"60"}}>
                        <option value="">— General (no specific activity) —</option>
                        {filteredActs
                          .filter(a=>!newEntry.taskCategory||(a.category===newEntry.taskCategory)||(a.group_name===newEntry.taskCategory)||(a.group_name===CAT_TO_GROUP[newEntry.taskCategory]))
                          .map(a=>(
                          <option key={a.id} value={a.id}>
                            {a.activity_name} · {Math.round((a.progress||0)*100)}%
                          </option>
                        ))}
                      </select>
                    ):(
                      <select value={newEntry.taskType}
                        onChange={e=>setNewEntry(p=>({...p,taskType:e.target.value}))}
                        style={INP}>
                        {catActs.map(t=><option key={t}>{t}</option>)}
                        <option value="Other">Other…</option>
                      </select>
                    )}
                    {filteredActs.length>0&&(
                      <div style={{fontSize:11,color:"var(--info)",marginTop:3,paddingLeft:2}}>
                        ✓ Linked to project tracker activities
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* ── STEP 4 for WORK: hours + description ── */}
              {step===4&&isWork&&(
                <div style={{display:"grid",gap:12}}>
                  {/* Summary badge */}
                  <div style={{display:"flex",gap:6,flexWrap:"wrap"}}>
                    <span style={{padding:"3px 8px",borderRadius:99,background:(GC[newEntry._group]||"var(--info)")+"18",
                      color:GC[newEntry._group]||"var(--info)",fontSize:12,fontWeight:700}}>
                      {newEntry._group}
                    </span>
                    <span style={{padding:"3px 8px",borderRadius:99,background:"var(--border)",color:"var(--text2)",fontSize:12}}>
                      {newEntry.taskCategory}
                    </span>
                    {newEntry.taskType&&(
                      <span style={{padding:"3px 8px",borderRadius:99,background:"var(--border)",color:"var(--text2)",fontSize:12}}>
                        {newEntry.taskType.length>30?newEntry.taskType.slice(0,28)+"…":newEntry.taskType}
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
                      <label style={LBL}>NOTES <span style={{color:"var(--text3)",fontWeight:400}}>(optional)</span></label>
                      <textarea rows={2} value={newEntry.activity}
                        onChange={e=>setNewEntry(p=>({...p,activity:e.target.value}))}
                        placeholder="e.g. Completed BESS display animations…"
                        style={{...INP,resize:"vertical"}}/>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Navigation */}
            <div style={{display:"flex",justifyContent:"space-between",marginTop:18,gap:10}}>
              <div>
                {step>1&&(
                  <Btn onClick={()=>setNewEntry(p=>({...p,_step:p._step-1}))}>← Back</Btn>
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
                    Next →
                  </Btn>
                ):(
                  <Btn primary
                    disabled={!newEntry.hours||(isWork&&!newEntry.projectId)}
                    onClick={()=>addEntry(modalDate)}>
                    ✓ Post Hours
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
              <button className="bp" onClick={saveEditEntry}>Save Changes</button>
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
                <div><Lbl>Client</Lbl><input value={newProj.client} onChange={e=>setNewProj(p=>({...p,client:e.target.value}))}/></div>
                <div><Lbl>Origin (HQ / BU)</Lbl><input value={newProj.origin} onChange={e=>setNewProj(p=>({...p,origin:e.target.value}))}/></div>
              </div>
              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}>
                <div><Lbl>Billable?</Lbl><select value={newProj.billable?"yes":"no"} onChange={e=>setNewProj(p=>({...p,billable:e.target.value==="yes"}))}><option value="yes">Yes</option><option value="no">No — Internal</option></select></div>
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
                      <span style={{fontSize:12,color:sel?"var(--info)":"var(--text2)"}}>{e.name}</span>
                      <span style={{fontSize:11,color:"var(--text4)",marginLeft:"auto"}}>{e.role} · {e.role_type==="lead"?"Lead":e.level||""}</span>
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
            <h3 style={{fontSize:17,fontWeight:700,marginBottom:12}}>Edit Project — {editProjModal._origId||editProjModal.id}</h3>
            {/* Tab bar */}
            <div style={{display:"flex",gap:0,marginBottom:14,borderBottom:"1px solid var(--border3)"}}>
              {(isAdmin?[["details","⚙ Details"],["team","👥 Team"],["activities","📋 Activities"]]:[["details","⚙ Details"],["team","👥 Team"],["activities","📋 Activities"]]).map(([t,l])=>(
                <button key={t} onClick={()=>setEpTab(t)}
                  style={{padding:"6px 14px",border:"none",borderBottom:epTab===t?"2px solid #38bdf8":"2px solid transparent",
                    background:"transparent",color:epTab===t?"var(--info)":"var(--text3)",fontSize:13,fontWeight:600,cursor:"pointer"}}>
                  {l}{t==="activities"?` (${epActs.length})`:""}
                </button>
              ))}
            </div>
            <div style={{overflowY:"auto",flex:1}}>
            {/* ── DETAILS TAB ── */}
            {epTab==="details"&&<div style={{display:"grid",gap:11}}>
              <div style={{display:"grid",gridTemplateColumns:"1fr 2fr",gap:10}}>
                <div><Lbl>Project No. <span style={{color:"#f87171",fontSize:11}}>(rename re-links all entries)</span></Lbl>
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
              <div><Lbl>Client</Lbl><input value={editProjModal.client||""} onChange={e=>setEditProjModal(p=>({...p,client:e.target.value}))}/></div>
                <div><Lbl>Origin</Lbl><input value={editProjModal.origin||""} onChange={e=>setEditProjModal(p=>({...p,origin:e.target.value}))}/></div>
              </div>
              {isAdmin&&<div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}>
                <div><Lbl>Billable?</Lbl><select value={editProjModal.billable?"yes":"no"} onChange={e=>setEditProjModal(p=>({...p,billable:e.target.value==="yes"}))}><option value="yes">Yes</option><option value="no">No</option></select></div>
                <div><Lbl>Rate per Hour ($)</Lbl><input type="number" value={editProjModal.rate_per_hour} onChange={e=>setEditProjModal(p=>({...p,rate_per_hour:+e.target.value}))}/></div>
              </div>}
            </div>}
            {/* ── TEAM TAB ── */}
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
                      <div style={{fontSize:12,color:"var(--text3)",marginTop:1}}>{e.role} · <span style={{color:ROLE_COLORS[e.role_type]||"var(--text3)"}}>{ROLE_LABELS[e.role_type]||e.role_type}</span></div>
                    </div>
                    {sel&&<span style={{fontSize:11,color:"var(--info)",background:"#38bdf820",padding:"2px 6px",borderRadius:3,flexShrink:0}}>✓ Assigned</span>}
                  </label>);
                })}
              </div>
              <div style={{fontSize:12,color:"var(--text3)",marginTop:8,display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                <span>{(editProjModal.assigned_engineers||[]).length} engineer{(editProjModal.assigned_engineers||[]).length!==1?"s":""} assigned</span>
                {(editProjModal.assigned_engineers||[]).length>0&&
                  <button style={{background:"none",border:"none",color:"#f87171",fontSize:12,cursor:"pointer"}}
                    onClick={()=>setEditProjModal(p=>({...p,assigned_engineers:[]}))}>Clear all</button>}
              </div>
            </div>}
            {/* ── ACTIVITIES TAB ── */}
            {epTab==="activities"&&<EditProjActivities
              projId={editProjModal._origId||editProjModal.id}
              activities={activities} setActivities={setActivities}
              engineers={engineers} isEngActive={isEngActive}
              supabase={supabase} showToast={showToast}
              projects={projects} setProjects={setProjects}
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
                <div style={{fontSize:12,color:"var(--text4)",marginTop:4}}>
                  {newEng.role_type==="engineer"&&"Can log hours & view own timesheets"}
                  {newEng.role_type==="lead"&&"Engineer + can view all team timesheets"}
                  {newEng.role_type==="accountant"&&"Full access to Finance tab, invoices & reports — no timesheet editing"}
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
            <h3 style={{fontSize:17,fontWeight:700,marginBottom:18}}>Edit — {editEngModal.name}</h3>
            <div style={{display:"grid",gap:11}}>
              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}>
                <div><Lbl>Full Name</Lbl><input value={editEngModal.name||""} onChange={e=>setEditEngModal(p=>({...p,name:e.target.value}))}/></div>
                <div><Lbl>Level</Lbl><select value={editEngModal.level||"Mid"} onChange={e=>setEditEngModal(p=>({...p,level:e.target.value}))}>{LEVELS.map(l=><option key={l}>{l}</option>)}</select></div>
              </div>
              <div><Lbl>Job Title</Lbl>
                <select value={editEngModal.role||""} onChange={e=>setEditEngModal(p=>({...p,role:e.target.value}))}>
                  <option value="">— Select —</option>
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


      {/* ── STAFF MODAL ── */}
      {showStaffModal&&(
        <div className="modal-ov" onClick={()=>{setShowStaffModal(false);setEditStaff(null);}}>
          <div className="modal" style={{maxWidth:500}} onClick={e=>e.stopPropagation()}>
            <h3 style={{fontSize:17,fontWeight:700,marginBottom:4}}>{editStaff?"Edit Staff Member":"Add Staff Member"}</h3>
            {!editStaff&&<p style={{fontSize:12,color:"var(--text4)",marginBottom:16}}>This will also create an engineer login record if email is provided.</p>}
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
                    <option value="">— Select —</option>
                    {ROLES_LIST.map(r=><option key={r}>{r}</option>)}
                  </select>
                </div>
              </div>
              {/* Row 3: Email (for engineer record) + Level — new staff only */}
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
              {/* Row 4: Access Role — new staff only */}
              {!editStaff&&(
                <div>
                  <Lbl>System Access Role</Lbl>
                  <select value={newStaff.role_type||"engineer"} onChange={e=>setNewStaff(p=>({...p,role_type:e.target.value}))}>
                    {ROLE_TYPES.map(r=><option key={r} value={r}>{ROLE_LABELS[r]}</option>)}
                  </select>
                  <div style={{fontSize:12,color:"var(--text4)",marginTop:3}}>
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

      {/* ── EXPENSE MODAL ── */}
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
              <div><Lbl>Description</Lbl><input value={(editExp||newExp).description} onChange={e=>editExp?setEditExp(p=>({...p,description:e.target.value})):setNewExp(p=>({...p,description:e.target.value}))} placeholder="e.g. Office Rent — Cairo HQ"/></div>
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
                        <Lbl>RATE <span style={{color:"var(--text3)",fontWeight:400,fontSize:11}}>EGP/$</span></Lbl>
                        <input type="number" min="1" max="9999" step="1"
                          value={exp.entry_rate||""}
                          onChange={e=>setRate(e.target.value?+e.target.value:null)}
                          placeholder={String(egpRate)}/>
                      </div>
                    )}
                  </div>
                  {isEGP&&(exp.amount_egp>0)&&(
                    <div style={{padding:"5px 10px",background:"var(--bg2)",borderRadius:4,border:"1px solid #0f1e2e",fontSize:12,color:"var(--text3)"}}>
                      ≈ <span style={{color:"var(--info)",fontFamily:"'IBM Plex Mono',monospace"}}>${(Math.round((exp.amount_egp||0)/(rate)*100)/100).toLocaleString()}</span>
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
                    {[2024,2025,2026,2027].map(y=><option key={y}>{y}</option>)}
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


      {/* ── FUNCTION HOURS MODAL ── */}
      {showFuncModal&&(
        <div className="modal-ov" onClick={()=>setShowFuncModal(false)}>
          <div className="modal" style={{maxWidth:460}} onClick={e=>e.stopPropagation()}>
            <h3 style={{fontSize:17,fontWeight:700,marginBottom:4}}>⚡ Log Function Hours</h3>
            <p style={{fontSize:12,color:"var(--text4)",marginBottom:16}}>Post non-billable activity hours for an engineer — visible in KPI reports.</p>
            <div style={{display:"grid",gap:11}}>
              <div><Lbl>Engineer</Lbl>
                <select value={newFunc.engineer_id} onChange={e=>setNewFunc(p=>({...p,engineer_id:e.target.value}))}
                  style={{borderColor:!newFunc.engineer_id?"#f87171":""}}>
                  <option value="">— Select Engineer —</option>
                  {engineers.map(e=><option key={e.id} value={e.id}>{e.name} · {e.role}</option>)}
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
                  <span style={{fontSize:12,color:FUNC_COLORS[newFunc.function_category]||"#6b7280"}}>{newFunc.function_category}</span>
                </div>
              </div>
              <div><Lbl>Description <span style={{color:"var(--info)"}}>(used in KPI reports)</span></Lbl>
                <textarea rows={3} value={newFunc.activity} onChange={e=>setNewFunc(p=>({...p,activity:e.target.value}))}
                  placeholder="e.g. Delivered PLC basics session to 3 junior engineers…" style={{resize:"vertical"}}/>
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
            <h3 style={{fontSize:16,fontWeight:700,color:"var(--text0)",marginBottom:4}}>🔑 Change Password</h3>
            <p style={{fontSize:13,color:"var(--text4)",marginBottom:20}}>Choose a new password for your account.</p>
            <div style={{display:"grid",gap:12}}>
              <div>
                <label style={{fontSize:12,color:"var(--text3)",fontWeight:600,display:"block",marginBottom:4}}>New Password</label>
                <input type="password" value={pwdForm.newPwd} onChange={e=>setPwdForm(p=>({...p,newPwd:e.target.value}))}
                  placeholder="Min. 6 characters" autoFocus
                  onKeyDown={e=>e.key==="Enter"&&handleChangePassword()}/>
              </div>
              <div>
                <label style={{fontSize:12,color:"var(--text3)",fontWeight:600,display:"block",marginBottom:4}}>Confirm Password</label>
                <input type="password" value={pwdForm.confirmPwd} onChange={e=>setPwdForm(p=>({...p,confirmPwd:e.target.value}))}
                  placeholder="Repeat new password"
                  onKeyDown={e=>e.key==="Enter"&&handleChangePassword()}/>
              </div>
              {pwdMsg&&(
                <div style={{fontSize:13,padding:"8px 12px",borderRadius:7,background:pwdMsg.ok?"#052e1620":"#450a0a",color:pwdMsg.ok?"#34d399":"#f87171",border:`1px solid ${pwdMsg.ok?"#34d39940":"#f8717140"}`}}>
                  {pwdMsg.ok?"✓":"✕"} {pwdMsg.text}
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

      {/* Toast */}
      {toast&&(
        <div className="toast" style={{background:toast.ok?"var(--bg3)":"#450a0a",color:toast.ok?"#34d399":"#f87171",border:`1px solid ${toast.ok?"#34d399":"#f87171"}`}}>
          {toast.ok?"✓":"✕"} {toast.msg}
        </div>
      )}
    </div>
  );
}