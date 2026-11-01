const $ = (selector) => document.querySelector(selector);
const $$ = (selector) => [...document.querySelectorAll(selector)];

const doctors = [
  {name:'Dr. Ananya Menon',specialty:'Cardiologist',department:'Cardiology',initials:'AM'},
  {name:'Dr. Rahul Nair',specialty:'Neurologist',department:'Neurology',initials:'RN'},
  {name:'Dr. Meera Thomas',specialty:'Dental Surgeon',department:'Dental care',initials:'MT'},
  {name:'Dr. Arjun Das',specialty:'Orthopedic Surgeon',department:'Orthopedics',initials:'AD'},
  {name:'Dr. Nisha Varghese',specialty:'Pediatrician',department:'Pediatrics',initials:'NV'}
];
const sampleAppointments = [
  {id:1,patient:'Aarav Menon',patientId:'PT-1024',doctor:'Dr. Ananya Menon',department:'Cardiology',date:'2026-11-01',time:'09:30',status:'Confirmed'},
  {id:2,patient:'Diya Joseph',patientId:'PT-1025',doctor:'Dr. Rahul Nair',department:'Neurology',date:'2026-11-01',time:'10:15',status:'Pending'},
  {id:3,patient:'Noah Thomas',patientId:'PT-1026',doctor:'Dr. Meera Thomas',department:'Dental care',date:'2026-11-01',time:'11:00',status:'Confirmed'},
  {id:4,patient:'Mia George',patientId:'PT-1027',doctor:'Dr. Arjun Das',department:'Orthopedics',date:'2026-11-02',time:'14:00',status:'Completed'}
];
const samplePatients = [
  {name:'Aarav Menon',id:'PT-1024',age:32,phone:'+91 98765 43210',visit:'2026-10-29',status:'Active'},
  {name:'Diya Joseph',id:'PT-1025',age:27,phone:'+91 98470 12345',visit:'2026-10-28',status:'Active'},
  {name:'Noah Thomas',id:'PT-1026',age:45,phone:'+91 98950 67890',visit:'2026-10-26',status:'Active'},
  {name:'Mia George',id:'PT-1027',age:19,phone:'+91 97460 54321',visit:'2026-10-24',status:'Active'},
  {name:'Ishaan Paul',id:'PT-1028',age:56,phone:'+91 95670 11223',visit:'2026-10-20',status:'Active'}
];
let appointments = JSON.parse(localStorage.getItem('carepoint_appointments') || 'null') || sampleAppointments;
let patients = JSON.parse(localStorage.getItem('carepoint_patients') || 'null') || samplePatients;
let nextId = Math.max(0,...appointments.map(a=>a.id))+1;
let nextPatientId = Math.max(1028,...patients.map(p=>Number((p.id||'').split('-')[1])||0))+1;
let toastTimer;

function saveData(){localStorage.setItem('carepoint_appointments',JSON.stringify(appointments));localStorage.setItem('carepoint_patients',JSON.stringify(patients));}
function initials(name){return name.split(' ').filter(Boolean).slice(0,2).map(x=>x[0]).join('').toUpperCase();}
function prettyDate(date){if(!date)return '—';return new Date(date+'T00:00:00').toLocaleDateString('en-IN',{day:'2-digit',month:'short',year:'numeric'});}
function prettyTime(time){if(!time)return '';const [h,m]=time.split(':');const d=new Date();d.setHours(+h,+m);return d.toLocaleTimeString('en-IN',{hour:'2-digit',minute:'2-digit'});}
function showToast(message){const toast=$('#toast');toast.textContent=message;toast.classList.add('show');clearTimeout(toastTimer);toastTimer=setTimeout(()=>toast.classList.remove('show'),2600);}
function personCell(name,id){return `<div class="person-cell"><span class="person-avatar">${initials(name)}</span><span><strong>${escapeHtml(name)}</strong><small>${escapeHtml(id||'Patient')}</small></span></div>`;}
function escapeHtml(value){return String(value).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));}
function statusBadge(status){return `<span class="status ${status}">${status}</span>`;}

function renderOverview(){
  $('#appointmentTotal').textContent=appointments.length;
  $('#navAppointmentCount').textContent=appointments.length;
  $('#overviewAppointments').innerHTML=appointments.slice().sort((a,b)=>(a.date+a.time).localeCompare(b.date+b.time)).slice(0,4).map(a=>`<tr><td>${personCell(a.patient,a.patientId)}</td><td>${escapeHtml(a.doctor)}</td><td>${prettyDate(a.date)}<br><small>${prettyTime(a.time)}</small></td><td>${statusBadge(a.status)}</td></tr>`).join('')||'<tr><td colspan="4" class="empty-state">No appointments yet. Add your first appointment.</td></tr>';
  $('#doctorMiniGrid').innerHTML=doctors.slice(0,3).map(d=>`<div class="doctor-mini"><span class="doctor-photo">${d.initials}</span><span><strong>${d.name}</strong><small>${d.specialty}</small></span></div>`).join('');
}
function renderAppointments(){
  const query=($('#appointmentSearch')?.value||'').toLowerCase(),filter=$('#statusFilter')?.value||'all';
  const filtered=appointments.filter(a=>(a.patient+' '+a.doctor+' '+a.department).toLowerCase().includes(query)&&(filter==='all'||a.status===filter));
  $('#allAppointments').innerHTML=filtered.map(a=>`<tr><td>${personCell(a.patient,a.patientId)}</td><td>${escapeHtml(a.doctor)}</td><td>${escapeHtml(a.department)}</td><td>${prettyDate(a.date)}<br><small>${prettyTime(a.time)}</small></td><td>${statusBadge(a.status)}</td><td><button class="action-btn" data-complete="${a.id}">${a.status==='Completed'?'Done':'Complete'}</button></td></tr>`).join('')||'<tr><td colspan="6" class="empty-state">No matching appointments found.</td></tr>';
  $('#reportAppointments').textContent=appointments.length;
  $('#reportConfirmed').textContent=appointments.filter(a=>a.status==='Confirmed').length;
  $('#reportPending').textContent=appointments.filter(a=>a.status==='Pending').length;
}
function renderPatients(){
  const q=($('#patientSearch')?.value||'').toLowerCase();
  const filtered=patients.filter(p=>(p.name+' '+p.id).toLowerCase().includes(q));
  $('#patientTable').innerHTML=filtered.map(p=>`<tr><td>${personCell(p.name,p.id)}</td><td>${p.id}</td><td>${p.age}</td><td>${escapeHtml(p.phone)}</td><td>${prettyDate(p.visit)}</td><td><span class="status Confirmed">${p.status}</span></td></tr>`).join('')||'<tr><td colspan="6" class="empty-state">No patients found.</td></tr>';
  $('#patientCountLabel').textContent=`${filtered.length} patients`;
  $('#patientTotal').textContent=(1284+Math.max(0,patients.length-samplePatients.length)).toLocaleString('en-IN');
  $('#reportPatients').textContent=$('#patientTotal').textContent;
}
function renderDoctors(){
  $('#doctorDirectory').innerHTML=doctors.map(d=>`<article class="doctor-card"><div class="doctor-large">${d.initials}</div><div><h3>${d.name}</h3><p>${d.specialty} · ${d.department}</p><span class="availability">● Available today</span></div></article>`).join('');
}
function renderAll(){renderOverview();renderAppointments();renderPatients();renderDoctors();}
function goTo(page){
  const target=document.getElementById(page);if(!target)return;
  $$('.page-section').forEach(s=>s.classList.toggle('active-page',s.id===page));
  $$('.nav-link').forEach(a=>a.classList.toggle('active',a.dataset.page===page));
  $('#breadcrumbPage').textContent=({overview:'Overview',appointments:'Appointments',patients:'Patients',doctors:'Doctors',services:'Departments',reports:'Reports'})[page]||'Overview';
  history.replaceState(null,'','#'+page);$('#sidebar').classList.remove('show');window.scrollTo({top:0,behavior:'smooth'});
}
$$('.nav-link').forEach(link=>link.addEventListener('click',e=>{e.preventDefault();goTo(link.dataset.page);}));
$$('[data-goto]').forEach(link=>link.addEventListener('click',e=>{e.preventDefault();goTo(link.dataset.goto);}));
$('#mobileMenu').addEventListener('click',()=>$('#sidebar').classList.toggle('show'));
$('#notificationBtn').addEventListener('click',()=>showToast('You’re all caught up!'));
function openModal(id){$('#'+id).classList.add('open');$('#'+id).setAttribute('aria-hidden','false');}
function closeModal(id){$('#'+id).classList.remove('open');$('#'+id).setAttribute('aria-hidden','true');}
$$('[data-close]').forEach(btn=>btn.addEventListener('click',()=>closeModal(btn.dataset.close)));
$$('.modal-backdrop').forEach(bg=>bg.addEventListener('click',e=>{if(e.target===bg)closeModal(bg.id);}));
$('#quickAddBtn').addEventListener('click',()=>openModal('appointmentModal'));
$('#addAppointmentBtn').addEventListener('click',()=>openModal('appointmentModal'));
$('#addPatientBtn').addEventListener('click',()=>openModal('patientModal'));
$('#appointmentSearch').addEventListener('input',renderAppointments);
$('#statusFilter').addEventListener('change',renderAppointments);
$('#patientSearch').addEventListener('input',renderPatients);

$('#appointmentForm').addEventListener('submit',e=>{
  e.preventDefault();const data=Object.fromEntries(new FormData(e.target));
  const matchingPatient=patients.find(p=>p.name.toLowerCase()===data.patient.trim().toLowerCase());
  const appointment={id:nextId++,patient:data.patient.trim(),patientId:matchingPatient?.id||'NEW PATIENT',doctor:data.doctor,department:data.department,date:data.date,time:data.time,status:'Pending',notes:data.notes};
  appointments.push(appointment);if(!matchingPatient){patients.push({name:appointment.patient,id:'NEW PATIENT',age:'—',phone:'Not provided',visit:data.date,status:'Active'});}
  saveData();renderAll();e.target.reset();closeModal('appointmentModal');showToast('Appointment added successfully!');goTo('appointments');
});
$('#patientForm').addEventListener('submit',e=>{
  e.preventDefault();const d=Object.fromEntries(new FormData(e.target));const id='PT-'+nextPatientId++;
  patients.push({name:d.name.trim(),id,age:d.age,phone:d.phone,visit:d.visit,status:'Active'});saveData();renderPatients();renderOverview();e.target.reset();closeModal('patientModal');showToast('Patient added successfully!');
});
$('#allAppointments').addEventListener('click',e=>{
  const button=e.target.closest('[data-complete]');if(!button)return;
  const item=appointments.find(a=>a.id===Number(button.dataset.complete));if(item){item.status='Completed';saveData();renderAll();showToast('Appointment marked as completed.');}
});
$('#exportBtn').addEventListener('click',()=>{
  const header=['Patient','Patient ID','Doctor','Department','Date','Time','Status'];
  const rows=appointments.map(a=>[a.patient,a.patientId,a.doctor,a.department,a.date,a.time,a.status]);
  const csv=[header,...rows].map(row=>row.map(v=>'"'+String(v??'').replace(/"/g,'""')+'"').join(',')).join('\n');
  const blob=new Blob([csv],{type:'text/csv;charset=utf-8;'}),url=URL.createObjectURL(blob),a=document.createElement('a');a.href=url;a.download='carepoint-appointments.csv';a.click();URL.revokeObjectURL(url);showToast('Appointment report exported.');
});
document.addEventListener('keydown',e=>{if(e.key==='Escape')$$('.modal-backdrop.open').forEach(m=>closeModal(m.id));});
if(location.hash&&document.querySelector(location.hash+'.page-section'))goTo(location.hash.slice(1));
renderAll();
