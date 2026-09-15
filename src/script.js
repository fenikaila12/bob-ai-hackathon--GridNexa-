/* PortFlow AI — Front-end prototype
   script.js contains application state and interactions.
*/

// Sample data store
const state = {
  vessels: [
    {id:1,name:'MSC Aurora',imo:'9832145',eta:'10:30',terminal:'North',berth:'B-04',status:'Arriving',containers:1200,priority:'High',risk:'Medium'},
    {id:2,name:'Ocean Star',imo:'9728451',eta:'12:15',terminal:'South',berth:'B-02',status:'Scheduled',containers:860,priority:'Normal',risk:'Low'},
    {id:3,name:'CMA Future',imo:'9612348',eta:'18:00',terminal:'North',berth:'B-06',status:'At Risk',containers:1500,priority:'High',risk:'High'},
    {id:4,name:'Horizon One',imo:'9456781',eta:'14:00',terminal:'West',berth:'B-05',status:'At Berth',containers:400,priority:'Low',risk:'Medium'}
  ],
  berths: ['B-01','B-02','B-03','B-04','B-05','B-06','B-07','B-08'],
  cranesTotal:18,
  availableCranes:12,
  terminals: {
    North: {capacity:92},
    South: {capacity:68},
    East: {capacity:44},
    West: {capacity:76}
  },
  notifications: [
    'High congestion predicted at North Terminal.',
    'CMA Future requires routing review.',
    'Crane C-07 is available.'
  ]
};

// Utility: risk level from capacity
function riskFromCapacity(cap){
  if(cap>85) return 'High';
  if(cap>65) return 'Medium';
  return 'Low';
}

// DOM references
const pages = document.querySelectorAll('.page');
const navItems = document.querySelectorAll('.nav-item');
const pageTitle = document.getElementById('pageTitle');
const globalSearch = document.getElementById('globalSearch');
const searchClear = document.getElementById('searchClear');
const notifBtn = document.getElementById('notifBtn');
const notifCount = document.getElementById('notifCount');
const modal = document.getElementById('modal');
const modalBackdrop = document.getElementById('modalBackdrop');
const modalContent = document.getElementById('modalContent');
const modalClose = document.getElementById('modalClose');
const mobileToggle = document.getElementById('mobileToggle');
const sidebar = document.getElementById('sidebar');

// Navigation
navItems.forEach(btn=>btn.addEventListener('click', ()=>{
  document.querySelector('.nav-item.active').classList.remove('active');
  btn.classList.add('active');
  showPage(btn.dataset.page);
}));

function showPage(id){
  pages.forEach(p=>p.classList.add('hidden'));
  const el = document.getElementById(id);
  if(el) el.classList.remove('hidden');
  // update title
  pageTitle.textContent = {
    dashboard:'Port Operations Dashboard',
    vessels:'Vessel Management',
    congestion:'Congestion Intelligence',
    allocations:'Berth & Crane Optimiser',
    routes:'Alternate Route Recommendations',
    plan:'72-Hour Port Operations Plan',
    analytics:'Port Performance Analytics',
    about:'About'
  }[id]||'PortFlow AI';
  // close mobile sidebar on nav
  sidebar.classList.remove('open');
  renderAll();
}

// Mobile toggle
mobileToggle.addEventListener('click', ()=>sidebar.classList.toggle('open'));

// Modal helpers
function openModal(html){
  modalContent.innerHTML = html;
  modal.classList.remove('hidden');
  modalBackdrop.classList.remove('hidden');
}
function closeModal(){
  modal.classList.add('hidden');
  modalBackdrop.classList.add('hidden');
  modalContent.innerHTML = '';
}
modalClose.addEventListener('click', closeModal);
modalBackdrop.addEventListener('click', closeModal);

// Notifications
notifBtn.addEventListener('click', ()=>{
  const list = state.notifications.map(n=>`<div class="muted">• ${n}</div>`).join('');
  openModal(`<h3>Notifications (${state.notifications.length})</h3><div>${list}</div>`);
});

// Render functions
function renderKPIs(){
  document.getElementById('kpiVessels').textContent = state.vessels.length;
  const util = Math.round(Object.values(state.terminals).reduce((s,t)=>s+t.capacity,0)/Object.keys(state.terminals).length);
  document.getElementById('kpiBerths').textContent = util + '%';
  // overall risk: highest terminal
  const maxCap = Math.max(...Object.values(state.terminals).map(t=>t.capacity));
  document.getElementById('kpiRisk').textContent = riskFromCapacity(maxCap).toUpperCase();
  document.getElementById('kpiCranes').textContent = state.availableCranes;
}

function renderAlerts(){
  const alerts = [
    {level:'High',text:`North Terminal expected to reach 91% capacity at 18:00.`},
    {level:'Medium',text:`MSC Aurora arrival overlaps with peak berth utilisation.`},
    {level:'Low',text:`Crane C-07 available for redeployment.`}
  ];
  const el = document.getElementById('alerts');
  el.innerHTML = alerts.map(a=>`<div class="alert"><span class="dot ${a.level==='High'?'danger':a.level==='Medium'?'amber':'green'}"></span><strong>${a.level}:</strong> ${a.text}</div>`).join('');
}

function renderTerminalChart(){
  const container = document.getElementById('terminalChart');
  container.innerHTML = '';
  // simple bars
  Object.keys(state.terminals).forEach(k=>{
    const cap = state.terminals[k].capacity;
    const row = document.createElement('div');
    row.className = 'term-row';
    row.innerHTML = `<div style="display:flex;justify-content:space-between;margin-bottom:6px"><div>${k}</div><div>${cap}%</div></div><div style="background:#e6f0ff;border-radius:8px;height:12px;overflow:hidden"><div style="width:${cap}%;height:100%;background:linear-gradient(90deg,var(--accent),#00b4ff)"></div></div>`;
    container.appendChild(row);
  });
}

function renderVesselTable(filter){
  const tbody = document.querySelector('#vesselTable tbody');
  const q = (globalSearch.value||'').toLowerCase();
  tbody.innerHTML = '';
  state.vessels.forEach(v=>{
    if(q && !v.name.toLowerCase().includes(q)) return;
    const tr = document.createElement('tr');
    tr.innerHTML = `<td>${v.name}</td><td>${v.imo}</td><td>${v.eta}</td><td>${v.terminal}</td><td>${v.berth||'-'}</td><td>${v.status}</td><td>${v.risk}</td><td><button class="small" onclick="viewVessel(${v.id})">Review</button></td>`;
    tbody.appendChild(tr);
  });
}

// Manage page table
function renderManageTable(){
  const tbody = document.querySelector('#manageTable tbody');
  tbody.innerHTML = '';
  state.vessels.forEach(v=>{
    const tr = document.createElement('tr');
    tr.innerHTML = `<td>${v.name}</td><td>${v.imo}</td><td>${v.eta}</td><td>${v.containers}</td><td>${v.terminal}</td><td>${v.priority}</td><td>${v.status}</td><td>${v.risk}</td><td><button class="small" onclick="viewVessel(${v.id})">View</button> <button class="small" onclick="editVessel(${v.id})">Edit</button> <button class="small" onclick="removeVessel(${v.id})">Remove</button></td>`;
    tbody.appendChild(tr);
  });
}

// View/Edit/Remove
window.viewVessel = function(id){
  const v = state.vessels.find(x=>x.id===id);
  openModal(`<h3>Vessel Details</h3><div><strong>${v.name}</strong> (IMO ${v.imo})</div><div>ETA: ${v.eta}</div><div>Terminal: ${v.terminal}</div><div>Berth: ${v.berth||'-'}</div><div>Status: ${v.status}</div>`);
}

window.editVessel = function(id){
  const v = state.vessels.find(x=>x.id===id);
  openModal(`<h3>Edit Vessel</h3><form id="editForm"> <label>Name<input name="name" value="${v.name}"/></label><label>IMO<input name="imo" value="${v.imo}"/></label><label>ETA<input name="eta" value="${v.eta}"/></label><label>Terminal<select name="terminal"><option ${v.terminal==='North'?'selected':''}>North</option><option ${v.terminal==='South'?'selected':''}>South</option><option ${v.terminal==='East'?'selected':''}>East</option><option ${v.terminal==='West'?'selected':''}>West</option></select></label><div style="margin-top:8px"><button type="submit" class="primary">Save</button></div></form>`);
  document.getElementById('editForm').addEventListener('submit', e=>{
    e.preventDefault();
    const fd = new FormData(e.target);
    v.name = fd.get('name'); v.imo = fd.get('imo'); v.eta = fd.get('eta'); v.terminal = fd.get('terminal');
    closeModal(); renderAll();
  });
}

window.removeVessel = function(id){
  if(!confirm('Remove vessel?')) return;
  state.vessels = state.vessels.filter(v=>v.id!==id);
  renderAll();
}

// Add vessel
document.getElementById('addVesselBtn').addEventListener('click', ()=>{
  openModal(`<h3>Add Vessel</h3><form id="addForm"> <label>Vessel Name<input name="name" required/></label><label>IMO Number<input name="imo" required/></label><label>ETA<input name="eta" required/></label><label>Terminal<select name="terminal"><option>North</option><option>South</option><option>East</option><option>West</option></select></label><label>Container Count<input name="containers" type="number" value="100"/></label><label>Priority<select name="priority"><option>Normal</option><option>High</option><option>Low</option></select></label><label>Status<select name="status"><option>Scheduled</option><option>Arriving</option><option>At Risk</option><option>At Berth</option></select></label><div style="margin-top:8px"><button type="submit" class="primary">Add</button></div></form>`);
  document.getElementById('addForm').addEventListener('submit', e=>{
    e.preventDefault();
    const fd = new FormData(e.target);
    const id = Date.now();
    const v = {id,name:fd.get('name'),imo:fd.get('imo'),eta:fd.get('eta'),terminal:fd.get('terminal'),containers:fd.get('containers'),priority:fd.get('priority'),status:fd.get('status'),risk:'Low',berth:''};
    state.vessels.push(v);
    closeModal(); renderAll();
  });
});

// Search
globalSearch.addEventListener('input', ()=>renderVesselTable());
searchClear.addEventListener('click', ()=>{globalSearch.value='';renderVesselTable();});

// Congestion analysis
document.getElementById('runAnalysis').addEventListener('click', ()=>{
  // simple simulation: find peak hour and highest terminal
  const timeline = [12,15,18,21,0].map(h=>({hour:h,cap:Math.min(100, Math.round((Math.random()*20)+50 + (h===18?20:0)))}));
  const peak = timeline.reduce((a,b)=>a.cap>b.cap?a:b);
  openModal(`<h3>Analysis Complete</h3><div>North Terminal is predicted to become the highest-risk congestion hotspot during the 18:00–21:00 window.</div><div style="margin-top:8px"><strong>Primary contributing factors:</strong><ul><li>High vessel arrivals</li><li>92% berth utilisation</li><li>Limited crane availability</li></ul></div><div class="muted">Prototype Analysis — Based on Sample Operational Data</div>`);
});

// Berth board
function renderBerthBoard(){
  const el = document.getElementById('berthBoard'); el.innerHTML='';
  const occupied = {};
  state.vessels.forEach(v=>{ if(v.berth) occupied[v.berth]=v; });
  state.berths.forEach(b=>{
    const v = occupied[b];
    const div = document.createElement('div'); div.className='berth '+(v? 'occupied':'available');
    div.innerHTML = `<strong>${b}</strong><div style="font-size:13px;margin-top:6px">${v? `<div>${v.name}</div><div style="font-size:12px">${v.eta} — ETD TBD</div><div style="margin-top:6px">3 Cranes</div><div style="margin-top:6px;color:${v? 'var(--danger)':'var(--success)'}">${v? 'OCCUPIED':'AVAILABLE'}</div>` : '<div style="color:var(--muted)">Available</div>'}</div>`;
    el.appendChild(div);
  });
}

// Allocation optimiser simulation
document.getElementById('runAllocation').addEventListener('click', ()=>{
  // naive: find an occupied berth with medium/low priority and recommend swap
  const recs = [];
  const ocean = state.vessels.find(v=>v.name==='Ocean Star');
  if(ocean){ recs.push(`Move Ocean Star from B-02 to B-05`); recs.push('Assign Crane C-08 and C-09'); recs.push('Estimated waiting time reduced by 18 minutes'); }
  openModal(`<h3>Recommended Allocation</h3><ul>${recs.map(r=>`<li>${r}</li>`).join('')}</ul><div class="muted">Front-end prototype using sample data</div>`);
});

// Route recommendations
function renderRouteRecs(){
  const container = document.getElementById('routeRecs'); container.innerHTML='';
  const recs = [
    {v:'CMA Future',current:'North',recommended:'South',reason:'North Terminal congestion risk = 91%',delta:32},
    {v:'Ocean Star',current:'East Gate',recommended:'West Gate',reason:'Reduced yard congestion',delta:21},
    {v:'Horizon One',current:'West',recommended:'South',reason:'Balanced crane availability',delta:18}
  ];
  recs.forEach((r,idx)=>{
    const card = document.createElement('div'); card.className='card';
    card.innerHTML = `<div style="display:flex;justify-content:space-between"><div><strong>RECOMMENDATION ${String(idx+1).padStart(2,'0')}</strong><div>${r.v}</div></div><div style="text-align:right">Delay reduction: <strong>${r.delta} min</strong></div></div><div style="margin-top:8px">Current Route: ${r.current} <br/>Recommended: <strong>${r.recommended}</strong><br/>Reason: ${r.reason}</div><div style="margin-top:8px"><button class="primary" onclick="acceptRec('${r.v}')">Accept Recommendation</button> <button class="small" onclick="viewRec('${r.v}')">View Details</button></div>`;
    container.appendChild(card);
  });
}
window.acceptRec = function(vname){
  const v = state.vessels.find(x=>x.name===vname);
  if(v){ v.status = 'Recommendation Accepted'; renderAll(); openModal(`<div>Recommendation accepted for ${vname}.</div>`); }
}
window.viewRec = function(vname){ openModal(`<div>Details for ${vname}.<br/><em>Prototype recommendation based on sample data.</em></div>`); }

// 72-hour plan generator
document.getElementById('genPlan').addEventListener('click', ()=>{
  const rows = [];
  const times = ['10:00','14:00','18:00','22:00','02:00'];
  for(let i=0;i<5;i++){
    const v = state.vessels[i%state.vessels.length];
    rows.push(`<tr><td>${times[i]}</td><td>${v.name}</td><td>${v.berth||'B-0'+(i+1)}</td><td>C-0${i+3}, C-0${i+4}</td><td>Loading</td><td>${v.risk}</td><td>${v.risk==='High'?'Consider reroute':'Proceed'}</td></tr>`);
  }
  openModal(`<h3>72-Hour Plan — Next 24 Hours</h3><table style="width:100%;border-collapse:collapse"><thead><tr><th>Time</th><th>Vessel</th><th>Berth</th><th>Crane Assignment</th><th>Operation</th><th>Risk</th><th>Recommendation</th></tr></thead><tbody>${rows.join('')}</tbody></table><div class="muted" style="margin-top:8px">Prototype plan generated from sample vessel schedules</div>`);
});

// Analytics
document.querySelectorAll('#analytics .filters button, .filters button').forEach(b=>b.addEventListener('click', e=>{
  // quick sample updates
  document.getElementById('statWait').textContent = (Math.floor(Math.random()*40)+10)+ ' min';
  document.getElementById('statBerth').textContent = (Math.floor(Math.random()*40)+50)+'%';
  document.getElementById('statCrane').textContent = (Math.floor(Math.random()*50)+30)+'%';
  document.getElementById('statIncidents').textContent = Math.floor(Math.random()*8);
}));

// Plan tab switching
document.querySelectorAll('#plan .tab').forEach(t=>t.addEventListener('click', ()=>{
  document.querySelector('#plan .tab.active').classList.remove('active');
  t.classList.add('active');
}));

// Render all
function renderAll(){
  renderKPIs(); renderAlerts(); renderTerminalChart(); renderVesselTable(); renderManageTable(); renderBerthBoard(); renderRouteRecs();
  document.getElementById('predictionTimeline').innerHTML = '';
  // timeline example
  const tl = ['12:00 — 68%','15:00 — 74%','18:00 — 91%','21:00 — 83%','00:00 — 61%'];
  document.getElementById('predictionTimeline').innerHTML = tl.map(t=>`<div>${t}</div>`).join('');
  // notifications count
  notifCount.textContent = state.notifications.length;
}

// Date/time
function updateDateTime(){
  const el = document.getElementById('datetime');
  const d = new Date();
  const s = d.toLocaleString();
  el.textContent = s;
}
setInterval(updateDateTime,1000); updateDateTime();

// initial render
renderAll();

// small accessibility: close modal with ESC
window.addEventListener('keydown', e=>{ if(e.key==='Escape') closeModal(); });

// Filters on management page
document.getElementById('vesselSearch').addEventListener('input', ()=>{
  const q = document.getElementById('vesselSearch').value.toLowerCase();
  const rows = document.querySelectorAll('#manageTable tbody tr');
  rows.forEach(r=>{ r.style.display = r.textContent.toLowerCase().includes(q)?'':'none'; });
});

// status & risk filters
document.getElementById('filterStatus').addEventListener('change', ()=>{
  const v = document.getElementById('filterStatus').value; const rows = document.querySelectorAll('#manageTable tbody tr');
  rows.forEach(r=>{ r.style.display = v? (r.cells[6].textContent===v?'':'none') : ''; });
});
document.getElementById('filterRisk').addEventListener('change', ()=>{
  const v = document.getElementById('filterRisk').value; const rows = document.querySelectorAll('#manageTable tbody tr');
  rows.forEach(r=>{ r.style.display = v? (r.cells[7].textContent===v?'':'none') : ''; });
});

// Expose a quick test function
window._state = state;