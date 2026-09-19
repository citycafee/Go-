
var bookingState={origin:'',destination:'',date:'',bus:null,selectedSeats:[],paymentMethod:'',paymentRef:'',bus_id:null,totalFare:0};

var DB_ROUTES=[{id:1,origin:'Hargeisa',destination:'Berbera',distance_km:150,base_fare:15,duration_min:180},{id:2,origin:'Hargeisa',destination:'Burao',distance_km:310,base_fare:25,duration_min:360},{id:3,origin:'Hargeisa',destination:'Erigavo',distance_km:180,base_fare:20,duration_min:240},{id:4,origin:'Hargeisa',destination:'Borama',distance_km:110,base_fare:12,duration_min:150},{id:5,origin:'Hargeisa',destination:'Sheikh',distance_km:60,base_fare:8,duration_min:90},{id:6,origin:'Hargeisa',destination:'Togwajale',distance_km:80,base_fare:10,duration_min:120},{id:7,origin:'Hargeisa',destination:'Gebiley',distance_km:45,base_fare:6,duration_min:60},{id:8,origin:'Berbera',destination:'Burao',distance_km:250,base_fare:22,duration_min:300},{id:9,origin:'Berbera',destination:'Erigavo',distance_km:330,base_fare:30,duration_min:420},{id:10,origin:'Burao',destination:'Erigavo',distance_km:160,base_fare:18,duration_min:200},{id:11,origin:'Burao',destination:'Borama',distance_km:420,base_fare:35,duration_min:480},{id:12,origin:'Borama',destination:'Sheikh',distance_km:170,base_fare:16,duration_min:210}];

var DB_BUSES=[{id:1,bus_number:'SIL-001',bus_name:'Star Line Express',route_id:1,departure_time:'05:30',arrival_time:'08:30',total_seats:15,fare:15},{id:2,bus_number:'SIL-002',bus_name:'Star Line Express',route_id:1,departure_time:'07:00',arrival_time:'10:00',total_seats:15,fare:15},{id:3,bus_number:'SIL-003',bus_name:'Star Line Express',route_id:1,departure_time:'09:00',arrival_time:'12:00',total_seats:15,fare:15},{id:4,bus_number:'SIL-004',bus_name:'Star Line Express',route_id:1,departure_time:'11:00',arrival_time:'14:00',total_seats:15,fare:15},{id:5,bus_number:'SIL-005',bus_name:'Star Line Express',route_id:1,departure_time:'14:00',arrival_time:'17:00',total_seats:15,fare:15},{id:6,bus_number:'SIL-006',bus_name:'Star Line Express',route_id:1,departure_time:'16:30',arrival_time:'19:30',total_seats:15,fare:15},{id:7,bus_number:'SIL-010',bus_name:'Somaliland Coach',route_id:2,departure_time:'06:00',arrival_time:'12:00',total_seats:15,fare:25},{id:8,bus_number:'SIL-011',bus_name:'Somaliland Coach',route_id:2,departure_time:'08:00',arrival_time:'14:00',total_seats:15,fare:25},{id:9,bus_number:'SIL-012',bus_name:'Somaliland Coach',route_id:2,departure_time:'12:00',arrival_time:'18:00',total_seats:15,fare:25},{id:10,bus_number:'SIL-020',bus_name:'Mountain Express',route_id:3,departure_time:'06:30',arrival_time:'10:30',total_seats:15,fare:20},{id:11,bus_number:'SIL-021',bus_name:'Mountain Express',route_id:3,departure_time:'10:00',arrival_time:'14:00',total_seats:15,fare:20},{id:12,bus_number:'SIL-030',bus_name:'Western Shuttle',route_id:4,departure_time:'06:00',arrival_time:'08:30',total_seats:15,fare:12},{id:13,bus_number:'SIL-031',bus_name:'Western Shuttle',route_id:4,departure_time:'08:00',arrival_time:'10:30',total_seats:15,fare:12},{id:14,bus_number:'SIL-032',bus_name:'Western Shuttle',route_id:4,departure_time:'10:00',arrival_time:'12:30',total_seats:15,fare:12},{id:15,bus_number:'SIL-033',bus_name:'Western Shuttle',route_id:4,departure_time:'13:00',arrival_time:'15:30',total_seats:15,fare:12},{id:16,bus_number:'SIL-034',bus_name:'Western Shuttle',route_id:4,departure_time:'15:00',arrival_time:'17:30',total_seats:15,fare:12},{id:17,bus_number:'SIL-040',bus_name:'Capital Link',route_id:5,departure_time:'07:00',arrival_time:'08:30',total_seats:15,fare:8},{id:18,bus_number:'SIL-041',bus_name:'Capital Link',route_id:5,departure_time:'10:00',arrival_time:'11:30',total_seats:15,fare:8},{id:19,bus_number:'SIL-042',bus_name:'Capital Link',route_id:5,departure_time:'14:00',arrival_time:'15:30',total_seats:15,fare:8},{id:20,bus_number:'SIL-050',bus_name:'Border Express',route_id:6,departure_time:'07:30',arrival_time:'09:30',total_seats:15,fare:10},{id:21,bus_number:'SIL-051',bus_name:'Border Express',route_id:6,departure_time:'12:00',arrival_time:'14:00',total_seats:15,fare:10},{id:22,bus_number:'SIL-060',bus_name:'City Bus',route_id:7,departure_time:'06:00',arrival_time:'07:00',total_seats:15,fare:6},{id:23,bus_number:'SIL-061',bus_name:'City Bus',route_id:7,departure_time:'08:00',arrival_time:'09:00',total_seats:15,fare:6},{id:24,bus_number:'SIL-062',bus_name:'City Bus',route_id:7,departure_time:'10:00',arrival_time:'11:00',total_seats:15,fare:6},{id:25,bus_number:'SIL-063',bus_name:'City Bus',route_id:7,departure_time:'13:00',arrival_time:'14:00',total_seats:15,fare:6},{id:26,bus_number:'SIL-064',bus_name:'City Bus',route_id:7,departure_time:'16:00',arrival_time:'17:00',total_seats:15,fare:6},{id:27,bus_number:'SIL-070',bus_name:'Coastal Liner',route_id:8,departure_time:'07:00',arrival_time:'12:00',total_seats:15,fare:22},{id:28,bus_number:'SIL-071',bus_name:'Coastal Liner',route_id:8,departure_time:'13:00',arrival_time:'18:00',total_seats:15,fare:22},{id:29,bus_number:'SIL-080',bus_name:'East-West Express',route_id:9,departure_time:'08:00',arrival_time:'15:00',total_seats:15,fare:30},{id:30,bus_number:'SIL-090',bus_name:'Highland Bus',route_id:10,departure_time:'07:00',arrival_time:'10:30',total_seats:15,fare:18},{id:31,bus_number:'SIL-091',bus_name:'Highland Bus',route_id:10,departure_time:'13:00',arrival_time:'16:30',total_seats:15,fare:18},{id:32,bus_number:'SIL-100',bus_name:'Long Route Express',route_id:11,departure_time:'06:00',arrival_time:'14:00',total_seats:15,fare:35},{id:33,bus_number:'SIL-110',bus_name:'Southern Link',route_id:12,departure_time:'08:00',arrival_time:'11:30',total_seats:15,fare:16}];


function getUser(){return JSON.parse(localStorage.getItem('se_user')||'null')}
function setUser(u){localStorage.setItem('se_user',JSON.stringify(u))}
function getBookings(){return JSON.parse(localStorage.getItem('se_bus_bookings')||'[]')}
function saveBookings(b){localStorage.setItem('se_bus_bookings',JSON.stringify(b))}
function getTaxiBookings(){return JSON.parse(localStorage.getItem('se_taxi_bookings')||'[]')}
function saveTaxiBookings(b){localStorage.setItem('se_taxi_bookings',JSON.stringify(b))}
function getDeliveryBookings(){return JSON.parse(localStorage.getItem('se_delivery_bookings')||'[]')}
function saveDeliveryBookings(b){localStorage.setItem('se_delivery_bookings',JSON.stringify(b))}
function getRoute(rId){return DB_ROUTES.find(function(r){return r.id===rId})}
function nextId(key){var id=parseInt(localStorage.getItem('se_'+key+'_id')||'0')+1;localStorage.setItem('se_'+key+'_id',id);return id}
function formatDate(d){return new Date(d).toLocaleDateString('en-GB',{weekday:'short',day:'numeric',month:'short',year:'numeric'})}
function getParam(k){return new URLSearchParams(window.location.search).get(k)}
function go(hash){window.location.hash=hash}
function checkLogin(){var u=getUser();document.querySelectorAll('.user-info').forEach(function(el){el.style.display=u?'flex':'none'});document.querySelectorAll('#loginTrigger').forEach(function(el){el.style.display=u?'none':'block'});document.querySelectorAll('#userName').forEach(function(el){if(u)el.textContent=u.full_name})}
function openLoginModal(){document.getElementById('loginModal').classList.add('active')}
function closeLoginModal(){document.getElementById('loginModal').classList.remove('active')}

function doLogin(e){
  e.preventDefault();
  var name=document.getElementById('loginName').value.trim();
  var whatsapp=document.getElementById('loginWhatsApp').value.trim();
  if(!name||!whatsapp)return alert('Name and WhatsApp required');
  setUser({id:1,full_name:name,whatsapp:whatsapp});
  closeLoginModal();checkLogin();
  var redirect=localStorage.getItem('se_login_redirect');
  if(redirect){localStorage.removeItem('se_login_redirect');go(redirect)}else{go('profile')}
}
function doLogout(){localStorage.removeItem('se_user');checkLogin();go('home')}
function swapCities(){var o=document.getElementById('originCity'),d=document.getElementById('destCity');var t=o.value;o.value=d.value;d.value=t}
function selectRoute(o,d){document.getElementById('originCity').value=o;document.getElementById('destCity').value=d;document.querySelector('.booking-card').scrollIntoView({behavior:'smooth'})}

function loadCities(){
  var cities=[];DB_ROUTES.forEach(function(r){if(cities.indexOf(r.origin)===-1)cities.push(r.origin);if(cities.indexOf(r.destination)===-1)cities.push(r.destination)});
  cities.sort();
  var os=document.getElementById('originCity'),ds=document.getElementById('destCity');
  cities.forEach(function(c){os.innerHTML+='<option value="'+c+'">'+c+'</option>';ds.innerHTML+='<option value="'+c+'">'+c+'</option>'});
  var today=new Date().toISOString().split('T')[0];
  document.getElementById('travelDate').value=today;
  document.getElementById('travelDate').min=today;
}

function searchBuses(e){
  e.preventDefault();
  var o=document.getElementById('originCity').value,d=document.getElementById('destCity').value,t=document.getElementById('travelDate').value;
  if(!o||!d)return alert('Select cities');
  if(o===d)return alert('Different cities needed');
  go('buses?origin='+encodeURIComponent(o)+'&dest='+encodeURIComponent(d)+'&date='+t);
}


function loadBuses(){
  var origin=getParam('origin'),dest=getParam('dest'),date=getParam('date')||new Date().toISOString().split('T')[0];
  if(!origin||!dest)return go('home');
  bookingState.origin=origin;bookingState.destination=dest;bookingState.date=date;
  document.getElementById('routeLabel').textContent=origin+' \u2192 '+dest;
  document.getElementById('dateLabel').textContent=formatDate(date);
  var r=DB_ROUTES.find(function(r){return r.origin===origin&&r.destination===dest});
  var routeBuses=r?DB_BUSES.filter(function(b){return b.route_id===r.id}):[];
  var busList=document.getElementById('busList'),noBuses=document.getElementById('noBuses');
  var allBookings=getBookings();
  if(!routeBuses.length){busList.style.display='none';noBuses.style.display='block';return}
  busList.innerHTML=routeBuses.map(function(b){
    var booked=allBookings.filter(function(x){return x.bus_id===b.id&&x.date===date&&x.status==='confirmed'});
    var bookedCount=0;booked.forEach(function(x){bookedCount+=x.seats.split(',').length});
    var avail=b.total_seats-bookedCount;
    return '<div class="bus-card" onclick="selectBus('+b.id+')"><div class="bus-card-image"><div class="bus-icon"><i class="fas fa-bus"></i></div></div><div class="bus-details"><div class="bus-number-top">'+b.bus_number+'</div><div class="bus-time-row"><span class="bus-time-depart">'+b.departure_time+' Depart</span><span class="bus-time-line">---</span><span class="bus-time-arrive">'+b.arrival_time+' Arrive</span><span class="bus-time-duration">'+b.duration_min+' min</span></div><div class="bus-seats-info"><span class="booked-seats">'+bookedCount+' booked</span><span class="available-seats">'+avail+' seats available</span></div></div><div class="bus-fare"><div class="price">$'+b.fare+'</div><div class="per-seat">per seat</div></div></div>';
  }).join('');
}

function selectBus(busId){go('seats?bus_id='+busId+'&date='+bookingState.date)}

function loadSeats(){
  var busId=parseInt(getParam('bus_id')),date=getParam('date');
  if(!busId||!date)return go('home');
  bookingState.date=date;bookingState.bus_id=busId;
  var bus=DB_BUSES.find(function(b){return b.id===busId});
  if(!bus)return go('home');
  bookingState.bus=bus;
  var r=getRoute(bus.route_id);
  document.getElementById('busRoute').textContent=r.origin+' \u2192 '+r.destination;
  document.getElementById('busDate').textContent=formatDate(date);
  document.getElementById('busTime').textContent=bus.departure_time;
  document.getElementById('busDuration').textContent=bus.duration_min+' min';
  var allBookings=getBookings();
  var taken={};
  allBookings.filter(function(x){return x.bus_id===busId&&x.date===date&&x.status==='confirmed'}).forEach(function(x){x.seats.split(',').forEach(function(s){taken[s.trim()]=true})});
  var grid=document.getElementById('seatsGrid');
  function sH(n){var t=taken[String(n)];return '<div class="van-seat '+(t?'taken':'available')+'" data-seat="'+n+'" onclick="toggleSeat(this,'+n+')"><i class="fas '+(t?'fa-times':'fa-user')+'"></i><span class="seat-num">'+n+'</span></div>'}
  var h='<div class="van-seat-row row-a"><div class="van-seat driver-seat"><i class="fas fa-steering-wheel"></i><span>DRIVER</span></div><div></div>'+sH(1)+'</div><div class="van-separator"></div>';
  h+='<div class="van-seat-row row-b"><div class="van-seat aisle-seat"><i class="fas fa-arrows-alt-h"></i><span>AISLE</span></div>'+sH(2)+sH(3)+'</div><div class="van-separator"></div>';
  h+='<div class="van-seat-row row-c">'+sH(4)+sH(5)+sH(6)+'</div><div class="van-separator"></div>';
  h+='<div class="van-seat-row row-d">'+sH(7)+sH(8)+sH(9)+'</div><div class="van-separator"></div>';
  h+='<div class="van-seat-row row-e">'+sH(10)+sH(11)+sH(12)+'</div><div class="van-separator"></div>';
  h+='<div class="van-seat-row row-f">'+sH(13)+sH(14)+sH(15)+'</div>';
  h+='<div class="van-back"><i class="fas fa-suitcase-rolling"></i><span>BACK / LUGGAGE</span></div>';
  grid.innerHTML=h;
  document.getElementById('seatPrice').textContent='$'+bus.fare;
  var totalSeats=bus.total_seats,takenCount=Object.keys(taken).length,availCount=totalSeats-takenCount;
  document.getElementById('seatsSummary').innerHTML='<div class="summary-item booked"><i class="fas fa-times-circle"></i> '+takenCount+' booked</div><div class="summary-item available"><i class="fas fa-check-circle"></i> '+availCount+' available</div><div class="summary-item total"><i class="fas fa-chair"></i> '+totalSeats+' total</div>';
}

function toggleSeat(el,num){
  if(el.classList.contains('taken'))return;
  if(el.classList.contains('selected')){el.classList.remove('selected');el.classList.add('available');el.querySelector('i').className='fas fa-user';bookingState.selectedSeats=bookingState.selectedSeats.filter(function(s){return s!==num})}
  else{if(bookingState.selectedSeats.length>=5)return alert('Max 5 seats');el.classList.remove('available');el.classList.add('selected');el.querySelector('i').className='fas fa-check';bookingState.selectedSeats.push(num)}
  updateSelectionSummary();
}

function updateSelectionSummary(){
  var s=document.getElementById('selectionSummary'),l=document.getElementById('selectedSeatsList'),c=document.getElementById('seatCount'),t=document.getElementById('totalFare');
  if(!bookingState.selectedSeats.length){s.style.display='none';return}
  s.style.display='block';
  l.innerHTML=bookingState.selectedSeats.sort(function(a,b){return a-b}).map(function(x){return '<span class="selected-seat-tag"><i class="fas fa-chair"></i> Seat '+x+'</span>'}).join('');
  c.textContent=bookingState.selectedSeats.length;
  var fare=bookingState.bus?bookingState.bus.fare*bookingState.selectedSeats.length:0;
  t.textContent='$'+fare;bookingState.totalFare=fare;
}

function proceedToPayment(){
  if(!bookingState.selectedSeats.length)return alert('Select seats first');
  go('payment?bus_id='+bookingState.bus_id+'&date='+bookingState.date+'&seats='+bookingState.selectedSeats.join(','));
}


function loadPaymentPage(){
  checkLogin();
  var busId=parseInt(getParam('bus_id')),date=getParam('date'),seats=getParam('seats');
  if(!busId||!seats)return go('home');
  bookingState.bus_id=busId;bookingState.date=date;bookingState.selectedSeats=seats.split(',').map(Number);
  var bus=DB_BUSES.find(function(b){return b.id===busId});if(!bus)return go('home');
  bookingState.bus=bus;var r=getRoute(bus.route_id);
  document.getElementById('summaryRoute').textContent=r.origin+' \u2192 '+r.destination;
  document.getElementById('summaryDate').textContent=formatDate(date);
  document.getElementById('summaryDepart').textContent=bus.departure_time;
  document.getElementById('summaryArrive').textContent=bus.arrival_time;
  document.getElementById('summarySeats').textContent=bookingState.selectedSeats.sort(function(a,b){return a-b}).join(', ');
  var total=bus.fare*bookingState.selectedSeats.length;
  document.getElementById('summaryTotal').textContent='$'+total;bookingState.totalFare=total;
}

function selectPayment(m){bookingState.paymentMethod=m;document.getElementById('paymentRefSection').style.display=m==='cash'?'none':'block';if(m==='cash')document.getElementById('paymentRef').value=''}

function confirmBooking(){
  var u=getUser();
  if(!u){localStorage.setItem('se_login_redirect','payment?bus_id='+bookingState.bus_id+'&date='+bookingState.date+'&seats='+bookingState.selectedSeats.join(','));openLoginModal();return}
  if(!bookingState.paymentMethod)return alert('Select payment method');
  var ref=document.getElementById('paymentRef').value.trim();
  if(bookingState.paymentMethod!=='cash'&&!ref)return alert('Enter payment reference');
  var bookings=getBookings();var id=nextId('bus');
  var booking={id:id,bus_id:bookingState.bus_id,seats:bookingState.selectedSeats.join(','),date:bookingState.date,name:u.full_name,whatsapp:u.whatsapp,fare:bookingState.totalFare,payment:bookingState.paymentMethod,ref:ref,status:'confirmed',origin:bookingState.bus.origin||getRoute(bookingState.bus.route_id).origin,destination:bookingState.bus.destination||getRoute(bookingState.bus.route_id).destination,departure:bookingState.bus.departure_time,arrival:bookingState.bus.arrival_time};
  var r=getRoute(bookingState.bus.route_id);booking.origin=r.origin;booking.destination=r.destination;
  bookings.push(booking);saveBookings(bookings);
  localStorage.setItem('se_last_booking',JSON.stringify(booking));
  go('confirmation');
}

function loadConfirmation(){
  var b=JSON.parse(localStorage.getItem('se_last_booking')||'null');
  var u=getUser();if(!b)return go('home');
  document.getElementById('ticketId').textContent=b.id;
  document.getElementById('ticketFrom').textContent=b.origin;
  document.getElementById('ticketTo').textContent=b.destination;
  document.getElementById('ticketDate').textContent=formatDate(b.date);
  document.getElementById('ticketDepart').textContent=b.departure;
  document.getElementById('ticketArrive').textContent=b.arrival;
  document.getElementById('ticketSeats').textContent=b.seats;
  document.getElementById('ticketPassenger').textContent=u?u.full_name:'Guest';
  document.getElementById('ticketPayment').textContent=(b.payment||'').toUpperCase();
  document.getElementById('ticketTotal').textContent='$'+b.fare;
  document.getElementById('qrBookingId').textContent=b.id;
  generateQR('qrcode-img','SOMALAND EXPRESS\nBooking: #'+b.id+'\nRoute: '+b.origin+' to '+b.destination+'\nDate: '+b.date+'\nDepart: '+b.departure+'\nSeats: '+b.seats+'\nPassenger: '+(u?u.full_name:'Guest')+'\nPayment: '+(b.payment||'').toUpperCase()+'\nTotal: $'+b.fare,'#1A237E');
}


function generateQR(elemId,text,color){
  var el=document.getElementById(elemId);if(!el)return;
  var c=document.createElement('canvas');var size=200;c.width=size;c.height=size;
  var ctx=c.getContext('2d');var modules=21,cellSize=size/modules;
  ctx.fillStyle='white';ctx.fillRect(0,0,size,size);
  ctx.fillStyle=color||'#1A237E';
  function fillRect(x,y,w,h){for(var dy=0;dy<h;dy++)for(var dx=0;dx<w;dx++)ctx.fillRect((x+dx)*cellSize,(y+dy)*cellSize,cellSize,cellSize)}
  fillRect(0,0,7,7);fillRect(modules-7,0,7,7);fillRect(0,modules-7,7,7);
  for(var i=8;i<modules-8;i++){if(i%2===0)fillRect(i,6,1,1);fillRect(6,i,1,1)}
  var seed=42;function rand(){seed=(seed*16807)%2147483647;return seed/2147483647}
  for(var y=0;y<modules;y++)for(var x=0;x<modules;x++){
    if((x<8&&y<8)||(x>=modules-8&&y<8)||(x<8&&y>=modules-8))continue;
    if(x===6||y===6)continue;
    if(rand()>0.5)ctx.fillRect(x*cellSize,y*cellSize,cellSize,cellSize);
  }
  el.src=c.toDataURL();
}

function loadMyBookings(){
  checkLogin();var u=getUser();if(!u)return;
  var all=getBookings().filter(function(b){return b.whatsapp===u.whatsapp}).reverse();
  var list=document.getElementById('bookingsList'),no=document.getElementById('noBookings');
  if(!all.length){list.style.display='none';no.style.display='block';return}
  list.innerHTML=all.map(function(b){
    return '<div class="booking-card-item"><div class="booking-card-icon"><i class="fas fa-bus"></i></div><div class="booking-card-details"><div class="booking-card-route">'+b.origin+' to '+b.destination+'</div><div class="booking-card-info"><span><i class="fas fa-calendar"></i> '+formatDate(b.date)+'</span><span><i class="fas fa-clock"></i> '+b.departure+'</span><span><i class="fas fa-chair"></i> Seats: '+b.seats+'</span></div></div><span class="booking-card-status '+b.status+'">'+b.status+'</span><div class="booking-card-fare"><div class="amount">$'+b.fare+'</div><div class="method">'+b.payment+'</div></div></div>';
  }).join('');
}

function loadProfile(){
  checkLogin();var u=getUser();if(!u)return go('home');
  document.getElementById('profileName').textContent='Welcome, '+u.full_name;
  document.getElementById('profilePhone').innerHTML='<i class="fab fa-whatsapp"></i> '+u.whatsapp;
  var busBookings=getBookings().filter(function(b){return b.whatsapp===u.whatsapp});
  var taxiBookings=getTaxiBookings().filter(function(b){return b.whatsapp===u.whatsapp});
  var delBookings=getDeliveryBookings().filter(function(b){return b.whatsapp===u.whatsapp});
  document.getElementById('statBuses').textContent=busBookings.length;
  document.getElementById('statTaxis').textContent=taxiBookings.length;
  document.getElementById('statDeliveries').textContent=delBookings.length;
  var total=busBookings.reduce(function(s,b){return s+b.fare},0)+taxiBookings.reduce(function(s,b){return s+b.fare},0)+delBookings.reduce(function(s,b){return s+b.fare},0);
  document.getElementById('statTotal').textContent='$'+total;
}


var taxiFares={standard:5,comfort:8,premium:12};
var taxiPaymentMethod='';
function updateTaxiFare(){document.getElementById('taxiFareDisplay').textContent='$'+taxiFares[document.getElementById('taxiType').value]}
function selectTaxiPayment(m){taxiPaymentMethod=m;document.getElementById('taxiRefSection').style.display=m==='cash'?'none':'block';if(m==='cash')document.getElementById('taxiPaymentRef').value=''}
function submitTaxiBooking(e){
  e.preventDefault();var u=getUser();
  if(!u){localStorage.setItem('se_login_redirect','taxi');openLoginModal();return}
  if(!taxiPaymentMethod)return alert('Select payment method');
  var ref=document.getElementById('taxiPaymentRef').value.trim();
  if(taxiPaymentMethod!=='cash'&&!ref)return alert('Enter reference');
  var type=document.getElementById('taxiType').value;
  var bookings=getTaxiBookings();var id=nextId('taxi');
  bookings.push({id:id,pickup:document.getElementById('taxiPickup').value.trim(),dropoff:document.getElementById('taxiDropoff').value.trim(),type:type,name:u.full_name,whatsapp:u.whatsapp,fare:taxiFares[type],payment:taxiPaymentMethod,ref:ref,schedule:document.getElementById('taxiSchedule').value,status:'confirmed'});
  saveTaxiBookings(bookings);
  localStorage.setItem('se_last_taxi',JSON.stringify(bookings[bookings.length-1]));
  go('taxi-confirm');
}
function loadTaxiConfirmation(){
  var b=JSON.parse(localStorage.getItem('se_last_taxi')||'null');if(!b)return go('home');
  document.getElementById('taxiId').textContent=b.id;
  document.getElementById('taxiPickup').textContent=b.pickup;
  document.getElementById('taxiDropoff').textContent=b.dropoff;
  document.getElementById('taxiType').textContent=(b.type||'standard').toUpperCase();
  document.getElementById('taxiPassenger').textContent=b.name;
  document.getElementById('taxiPayment').textContent=(b.payment||'').toUpperCase();
  document.getElementById('taxiTotal').textContent='$'+b.fare;
  document.getElementById('qrBookingId').textContent=b.id;
  generateQR('qrcode-img','SOMALAND EXPRESS TAXI\nBooking: #'+b.id+'\nPickup: '+b.pickup+'\nDropoff: '+b.dropoff+'\nType: '+(b.type||'').toUpperCase()+'\nPassenger: '+b.name+'\nPayment: '+(b.payment||'').toUpperCase()+'\nTotal: $'+b.fare,'#E65100');
}

var deliveryPaymentMethod='';
function selectDeliveryPayment(m){deliveryPaymentMethod=m;document.getElementById('deliveryRefSection').style.display=m==='cash'?'none':'block';if(m==='cash')document.getElementById('deliveryPaymentRef').value=''}
function submitDeliveryBooking(e){
  e.preventDefault();var u=getUser();
  if(!u){localStorage.setItem('se_login_redirect','delivery');openLoginModal();return}
  if(!deliveryPaymentMethod)return alert('Select payment method');
  var ref=document.getElementById('deliveryPaymentRef').value.trim();
  if(deliveryPaymentMethod!=='cash'&&!ref)return alert('Enter reference');
  var bookings=getDeliveryBookings();var id=nextId('delivery');
  bookings.push({id:id,pickup:document.getElementById('deliveryPickup').value.trim(),dropoff:document.getElementById('deliveryDropoff').value.trim(),recipient:document.getElementById('recipientName').value.trim(),rphone:document.getElementById('recipientPhone').value.trim(),item:document.getElementById('itemDescription').value.trim(),ival:document.getElementById('itemValue').value,name:u.full_name,whatsapp:u.whatsapp,fare:3,payment:deliveryPaymentMethod,ref:ref,status:'confirmed'});
  saveDeliveryBookings(bookings);
  localStorage.setItem('se_last_delivery',JSON.stringify(bookings[bookings.length-1]));
  go('delivery-confirm');
}
function loadDeliveryConfirmation(){
  var b=JSON.parse(localStorage.getItem('se_last_delivery')||'null');if(!b)return go('home');
  document.getElementById('deliveryId').textContent=b.id;
  document.getElementById('deliveryPickup').textContent=b.pickup;
  document.getElementById('deliveryDropoff').textContent=b.dropoff;
  document.getElementById('deliverySender').textContent=b.name;
  document.getElementById('deliveryRecipient').textContent=b.recipient;
  document.getElementById('deliveryItem').textContent=b.item;
  document.getElementById('deliveryPayment').textContent=(b.payment||'').toUpperCase();
  document.getElementById('deliveryTotal').textContent='$'+b.fare;
  document.getElementById('qrBookingId').textContent=b.id;
  generateQR('qrcode-img','SOMALAND EXPRESS DELIVERY\nBooking: #'+b.id+'\nPickup: '+b.pickup+'\nDropoff: '+b.dropoff+'\nSender: '+b.name+'\nRecipient: '+b.recipient+'\nItem: '+b.item+'\nPayment: '+(b.payment||'').toUpperCase()+'\nFee: $'+b.fare,'#1B5E20');
}

function loadVerify(){
  var id=getParam('id');if(!id)return;
  var all=getBookings();
  var b=all.find(function(x){return String(x.id)===String(id)});
  document.getElementById('loadingState').style.display='none';
  document.getElementById('verifyResult').style.display='block';
  if(!b){document.getElementById('statusSection').className='verify-status invalid';document.getElementById('statusIcon').innerHTML='<i class="fas fa-times-circle"></i>';document.getElementById('statusTitle').textContent='Not Found';document.getElementById('statusText').textContent='Ticket not found.';return}
  document.getElementById('statusSection').className='verify-status valid';
  document.getElementById('statusIcon').innerHTML='<i class="fas fa-check-circle"></i>';
  document.getElementById('statusTitle').textContent='Valid Ticket';
  document.getElementById('statusText').textContent='Verified successfully.';
  document.getElementById('routeSection').style.display='flex';
  document.getElementById('verifyFrom').textContent=b.origin;
  document.getElementById('verifyTo').textContent=b.destination;
  document.getElementById('detailsSection').style.display='block';
  document.getElementById('verifyBookingId').textContent='#'+b.id;
  document.getElementById('verifyPassenger').textContent=b.name;
  document.getElementById('verifyDate').textContent=formatDate(b.date);
  document.getElementById('verifyDepart').textContent=b.departure;
  document.getElementById('verifyArrive').textContent=b.arrival;
  document.getElementById('verifySeats').textContent=b.seats;
  document.getElementById('verifyPayment').textContent=(b.payment||'').toUpperCase();
  document.getElementById('verifyTotal').textContent='$'+b.fare;
  document.getElementById('verifyStatus').textContent=b.status.toUpperCase();
  document.getElementById('verifyTime').textContent=new Date().toLocaleString();
}
