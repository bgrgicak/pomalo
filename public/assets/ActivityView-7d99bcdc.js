import{d as c,u as o,a8 as r,r as u,O as n,K as s,o as v,c as l,a9 as _,n as m}from'./index-fe8b870b.js';const y=c({__name:'ActivityView',setup(f){const t=o(),a=r(),e=u(a.params._id);return e.value&&t.get(e.value),n(()=>a.params._id,i=>{e.value=i,e.value&&t.get(e.value);}),(i,p)=>s(t).activities[e.value]?(v(),l(_,{key:0,activity:s(t).activities[e.value]},null,8,['activity'])):m('',!0);}});export{y as default};
