/* ===== Somaliland Express Bus Booking App ===== */

let bookingState = {
    origin: '', destination: '', date: '', bus: null,
    selectedSeats: [], paymentMethod: '', paymentRef: ''
};

// ── Helpers ──
async function api(endpoint, method = 'GET', body = null) {
    const opts = { method, headers: { 'Content-Type': 'application/json' } };
    if (body) opts.body = JSON.stringify(body);
    const res = await fetch(endpoint, opts);
    return res.json();
}

function getParam(key) {
    return new URLSearchParams(window.location.search).get(key);
}

function formatDate(dateStr) {
    const d = new Date(dateStr);
    return d.toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' });
}

// ── Auth ──
async function checkLogin() {
    const data = await api('/api/me');
    const userInfo = document.getElementById('userInfo');
    const loginTrigger = document.getElementById('loginTrigger');
    if (data.logged_in) {
        if (userInfo) {
            userInfo.style.display = 'flex';
            document.getElementById('userName').textContent = data.user.full_name;
        }
        if (loginTrigger) loginTrigger.style.display = 'none';
    } else {
        if (userInfo) userInfo.style.display = 'none';
        if (loginTrigger) loginTrigger.style.display = 'block';
    }
}

function openLoginModal() {
    document.getElementById('loginModal').classList.add('active');
}

function closeLoginModal() {
    document.getElementById('loginModal').classList.remove('active');
}

async function doLogin(e) {
    e.preventDefault();
    const name = document.getElementById('loginName').value.trim();
    const whatsapp = document.getElementById('loginWhatsApp').value.trim();
    const data = await api('/api/login', 'POST', { full_name: name, whatsapp: whatsapp });
    if (data.success) {
        sessionStorage.setItem('user', JSON.stringify(data.user));
        closeLoginModal();
        window.location.href = '/profile';
    } else {
        alert(data.error || 'Login failed');
    }
}

async function doLogout() {
    await api('/api/logout', 'POST');
    sessionStorage.removeItem('user');
    window.location.href = '/';
}

// ── Home Page ──
async function loadCities() {
    const data = await api('/api/routes');
    const originSelect = document.getElementById('originCity');
    const destSelect = document.getElementById('destCity');
    if (!originSelect || !destSelect) return;

    data.cities.forEach(city => {
        originSelect.innerHTML += `<option value="${city}">${city}</option>`;
        destSelect.innerHTML += `<option value="${city}">${city}</option>`;
    });

    const today = new Date().toISOString().split('T')[0];
    document.getElementById('travelDate').value = today;
    document.getElementById('travelDate').min = today;
}

function swapCities() {
    const o = document.getElementById('originCity');
    const d = document.getElementById('destCity');
    [o.value, d.value] = [d.value, o.value];
}

function selectRoute(origin, dest) {
    document.getElementById('originCity').value = origin;
    document.getElementById('destCity').value = dest;
    document.querySelector('.booking-card').scrollIntoView({ behavior: 'smooth' });
}

function searchBuses(e) {
    e.preventDefault();
    const origin = document.getElementById('originCity').value;
    const dest = document.getElementById('destCity').value;
    const date = document.getElementById('travelDate').value;
    if (origin === dest) { alert('Origin and destination must be different'); return; }
    bookingState.origin = origin;
    bookingState.destination = dest;
    bookingState.date = date;
    window.location.href = `/buses?origin=${origin}&dest=${dest}&date=${date}`;
}

// ── Buses Page ──
async function loadBuses() {
    const origin = getParam('origin');
    const dest = getParam('dest');
    const date = getParam('date') || new Date().toISOString().split('T')[0];
    if (!origin || !dest) { window.location.href = '/'; return; }

    bookingState.origin = origin;
    bookingState.destination = dest;
    bookingState.date = date;

    document.getElementById('routeLabel').textContent = `${origin} → ${dest}`;
    document.getElementById('dateLabel').textContent = formatDate(date);

    const data = await api(`/api/buses?origin=${encodeURIComponent(origin + '->' + dest)}&date=${date}`);
    const busList = document.getElementById('busList');
    const noBuses = document.getElementById('noBuses');

    if (!data.buses || data.buses.length === 0) {
        busList.style.display = 'none';
        noBuses.style.display = 'block';
        return;
    }

    busList.innerHTML = data.buses.map(b => {
        const avail = b.available_seats;
        const booked = b.booked_seats;

        return `
        <div class="bus-card" onclick="selectBus(${b.id}, '${date}')">
            <div class="bus-card-image">
                <img src="/static/images/bus-van.png" alt="Somaliland Express Bus" onerror="this.style.display='none';this.parentElement.innerHTML='<div class=\\'bus-icon\\'><i class=\\'fas fa-bus\\'></i></div>'">
            </div>
            <div class="bus-details">
                <div class="bus-number-top">${b.bus_number}</div>
                <div class="bus-time-row">
                    <span class="bus-time-depart">${b.departure_time} Depart</span>
                    <span class="bus-time-line">-----------------------------------</span>
                    <span class="bus-time-arrive">${b.arrival_time} Arrive</span>
                    <span class="bus-time-duration">--- ${b.duration_min} min</span>
                </div>
                <div class="bus-seats-info">
                    <span class="booked-seats">${booked} booked</span>
                    <span class="available-seats">${avail} seats available</span>
                </div>
            </div>
            <div class="bus-fare">
                <div class="price">$${b.fare}</div>
                <div class="per-seat">per seat</div>
            </div>
        </div>`;
    }).join('');
}

function selectBus(busId, date) {
    const travelDate = date || bookingState.date || new Date().toISOString().split('T')[0];
    window.location.href = `/seats?bus_id=${busId}&date=${travelDate}`;
}

// ── Seats Page ──
async function loadSeats() {
    const busId = getParam('bus_id');
    const date = getParam('date');
    if (!busId || !date) { window.location.href = '/'; return; }

    bookingState.date = date;
    const data = await api(`/api/seats/${busId}?date=${date}`);
    if (data.error) { alert(data.error); window.location.href = '/'; return; }

    bookingState.bus = data.bus;
    document.getElementById('busRoute').textContent = `${data.bus.origin} → ${data.bus.destination}`;
    document.getElementById('busDate').textContent = formatDate(date);
    document.getElementById('busTime').textContent = data.bus.departure_time;
    document.getElementById('busDuration').textContent = data.bus.duration_min + ' min';

    const grid = document.getElementById('seatsGrid');
    const seats = data.seats;

    function seatHtml(num) {
        const seatData = seats.find(st => st.number === num);
        const status = seatData ? seatData.status : 'available';
        const cls = status === 'taken' ? 'taken' : 'available';
        const icon = status === 'taken' ? 'fa-times' : 'fa-user';
        return `<div class="van-seat ${cls}" data-seat="${num}" onclick="toggleSeat(this, ${num})" title="Seat ${num}">
            <i class="fas ${icon}"></i>
            <span class="seat-num">${num}</span>
        </div>`;
    }

    let html = '';

    // Row A: Driver col 1, empty col 2, Seat 1 col 3
    html += `<div class="van-seat-row row-a">
        <div class="van-seat driver-seat">
            <i class="fas fa-steering-wheel"></i>
            <span>DRIVER</span>
        </div>
        <div></div>
        ${seatHtml(1)}
    </div>`;
    html += '<div class="van-separator"></div>';

    // Row B: Aisle col 1, Seat 2 col 2, Seat 3 col 3
    html += `<div class="van-seat-row row-b">
        <div class="van-seat aisle-seat">
            <i class="fas fa-arrows-alt-h"></i>
            <span>AISLE</span>
        </div>
        ${seatHtml(2)}
        ${seatHtml(3)}
    </div>`;
    html += '<div class="van-separator"></div>';

    // Rows C-F: 3 seats each
    html += `<div class="van-seat-row row-c">${seatHtml(4)}${seatHtml(5)}${seatHtml(6)}</div>`;
    html += '<div class="van-separator"></div>';
    html += `<div class="van-seat-row row-d">${seatHtml(7)}${seatHtml(8)}${seatHtml(9)}</div>`;
    html += '<div class="van-separator"></div>';
    html += `<div class="van-seat-row row-e">${seatHtml(10)}${seatHtml(11)}${seatHtml(12)}</div>`;
    html += '<div class="van-separator"></div>';
    html += `<div class="van-seat-row row-f">${seatHtml(13)}${seatHtml(14)}${seatHtml(15)}</div>`;

    // Back / Luggage
    html += `<div class="van-back">
        <i class="fas fa-suitcase-rolling"></i>
        <span>BACK / LUGGAGE</span>
    </div>`;

    grid.innerHTML = html;
    document.getElementById('seatPrice').textContent = '$' + data.bus.fare;

    // Show seats summary
    const totalSeats = seats.length;
    const takenSeats = seats.filter(s => s.status === 'taken').length;
    const availSeats = totalSeats - takenSeats;
    document.getElementById('seatsSummary').innerHTML = `
        <div class="summary-item booked"><i class="fas fa-times-circle"></i> ${takenSeats} booked</div>
        <div class="summary-item available"><i class="fas fa-check-circle"></i> ${availSeats} available</div>
        <div class="summary-item total"><i class="fas fa-chair"></i> ${totalSeats} total</div>
    `;
}

function toggleSeat(el, num) {
    if (el.classList.contains('taken')) return;
    if (el.classList.contains('selected')) {
        el.classList.remove('selected');
        el.classList.add('available');
        el.querySelector('i').className = 'fas fa-user';
        bookingState.selectedSeats = bookingState.selectedSeats.filter(s => s !== num);
    } else {
        if (bookingState.selectedSeats.length >= 5) {
            alert('Maximum 5 seats per booking');
            return;
        }
        el.classList.remove('available');
        el.classList.add('selected');
        el.querySelector('i').className = 'fas fa-check';
        bookingState.selectedSeats.push(num);
    }
    updateSelectionSummary();
}

function updateSelectionSummary() {
    const summary = document.getElementById('selectionSummary');
    const list = document.getElementById('selectedSeatsList');
    const count = document.getElementById('seatCount');
    const total = document.getElementById('totalFare');

    if (bookingState.selectedSeats.length === 0) {
        summary.style.display = 'none';
        return;
    }

    summary.style.display = 'block';
    list.innerHTML = bookingState.selectedSeats
        .sort((a, b) => a - b)
        .map(s => `<span class="selected-seat-tag"><i class="fas fa-chair"></i> Seat ${s}</span>`)
        .join('');

    count.textContent = bookingState.selectedSeats.length;
    const fare = bookingState.bus ? bookingState.bus.fare * bookingState.selectedSeats.length : 0;
    total.textContent = '$' + fare;
}

function proceedToPayment() {
    if (bookingState.selectedSeats.length === 0) { alert('Please select at least one seat'); return; }
    const params = new URLSearchParams({
        bus_id: bookingState.bus.id,
        date: bookingState.date,
        seats: bookingState.selectedSeats.join(',')
    });
    window.location.href = `/payment?${params.toString()}`;
}

// ── Payment Page ──
async function loadPaymentPage() {
    await checkLogin();
    const busId = getParam('bus_id');
    const date = getParam('date');
    const seats = getParam('seats');

    if (!busId || !seats) { window.location.href = '/'; return; }

    bookingState.bus_id = busId;
    bookingState.date = date;
    bookingState.selectedSeats = seats.split(',').map(Number);

    const data = await api(`/api/seats/${busId}?date=${date}`);
    if (data.error) { alert(data.error); window.location.href = '/'; return; }

    bookingState.bus = data.bus;
    const bus = data.bus;

    document.getElementById('summaryRoute').textContent = `${bus.origin} → ${bus.destination}`;
    document.getElementById('summaryDate').textContent = formatDate(date);
    document.getElementById('summaryDepart').textContent = bus.departure_time;
    document.getElementById('summaryArrive').textContent = bus.arrival_time;
    document.getElementById('summarySeats').textContent = bookingState.selectedSeats.sort((a,b) => a-b).join(', ');

    const total = bus.fare * bookingState.selectedSeats.length;
    document.getElementById('summaryTotal').textContent = '$' + total;
    bookingState.totalFare = total;
}

function selectPayment(method) {
    bookingState.paymentMethod = method;
    const refSection = document.getElementById('paymentRefSection');
    refSection.style.display = (method === 'cash') ? 'none' : 'block';
    if (method === 'cash') document.getElementById('paymentRef').value = '';
}

async function confirmBooking() {
    const userInfo = sessionStorage.getItem('user');
    if (!userInfo) {
        openLoginModal();
        return;
    }

    if (!bookingState.paymentMethod) {
        alert('Please select a payment method');
        return;
    }

    const paymentRef = document.getElementById('paymentRef').value.trim();
    if (bookingState.paymentMethod !== 'cash' && !paymentRef) {
        alert('Please enter your payment reference number');
        return;
    }

    const btn = document.getElementById('confirmBtn');
    btn.disabled = true;
    btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Processing...';

    const data = await api('/api/book', 'POST', {
        bus_id: parseInt(bookingState.bus_id),
        seat_numbers: bookingState.selectedSeats,
        travel_date: bookingState.date,
        payment_method: bookingState.paymentMethod,
        payment_reference: paymentRef
    });

    if (data.success) {
        sessionStorage.setItem('lastBooking', JSON.stringify({
            booking_id: data.booking_id,
            route: `${bookingState.bus.origin} → ${bookingState.bus.destination}`,
            date: bookingState.date,
            departure: bookingState.bus.departure_time,
            arrival: bookingState.bus.arrival_time,
            seats: bookingState.selectedSeats.sort((a,b) => a-b).join(', '),
            payment: bookingState.paymentMethod,
            total: data.total_fare
        }));
        window.location.href = '/confirmation';
    } else {
        alert(data.error || 'Booking failed');
        btn.disabled = false;
        btn.innerHTML = '<i class="fas fa-check-circle"></i> Confirm Booking';
    }
}

// ── Confirmation Page ──
function loadConfirmation() {
    const booking = JSON.parse(sessionStorage.getItem('lastBooking') || '{}');
    const user = JSON.parse(sessionStorage.getItem('user') || '{}');
    if (!booking.booking_id) { window.location.href = '/'; return; }

    const parts = booking.route ? booking.route.split(' → ') : ['-', '-'];
    const from = parts[0] || '-';
    const to = parts[1] || '-';

    document.getElementById('ticketId').textContent = booking.booking_id;
    document.getElementById('ticketFrom').textContent = from;
    document.getElementById('ticketTo').textContent = to;
    document.getElementById('ticketDate').textContent = formatDate(booking.date);
    document.getElementById('ticketDepart').textContent = booking.departure;
    document.getElementById('ticketArrive').textContent = booking.arrival || '-';
    document.getElementById('ticketSeats').textContent = booking.seats;
    document.getElementById('ticketPassenger').textContent = user.full_name || 'Guest';
    document.getElementById('ticketPayment').textContent = (booking.payment || '-').toUpperCase();
    document.getElementById('ticketTotal').textContent = '$' + booking.total;
    document.getElementById('qrBookingId').textContent = booking.booking_id;

    // QR code from server
    document.getElementById('qrcode-img').src = '/api/qrcode/' + booking.booking_id;
}

// ── Save ticket as image ──
function saveTicketImage() {
    const ticket = document.getElementById('saveableTicket');
    html2canvas(ticket, {
        backgroundColor: '#ffffff',
        scale: 2,
        useCORS: true
    }).then(canvas => {
        const link = document.createElement('a');
        link.download = 'Somaliland-Express-Ticket-' + (document.getElementById('ticketId').textContent || 'ticket') + '.png';
        link.href = canvas.toDataURL('image/png');
        link.click();
    }).catch(() => {
        alert('Could not save ticket. Please take a screenshot instead.');
    });
}

// ── Share ticket ──
function shareTicket() {
    const booking = JSON.parse(sessionStorage.getItem('lastBooking') || '{}');
    const user = JSON.parse(sessionStorage.getItem('user') || '{}');
    if (!booking.booking_id) return;

    const parts = booking.route ? booking.route.split(' → ') : ['-', '-'];
    const text =
        '🚌 *Somaliland Express Ticket*\n\n' +
        '🔖 Booking: #' + booking.booking_id + '\n' +
        '📍 Route: ' + parts[0] + ' → ' + parts[1] + '\n' +
        '📅 Date: ' + formatDate(booking.date) + '\n' +
        '🕐 Departure: ' + booking.departure + '\n' +
        '💺 Seats: ' + booking.seats + '\n' +
        '👤 Passenger: ' + (user.full_name || 'Guest') + '\n' +
        '💰 Payment: ' + (booking.payment || '-').toUpperCase() + '\n' +
        '💵 Total: $' + booking.total + '\n\n' +
        'Show this ticket when you board the bus.';

    if (navigator.share) {
        navigator.share({ title: 'Somaliland Express Ticket', text: text }).catch(() => {});
    } else if (navigator.clipboard) {
        navigator.clipboard.writeText(text).then(() => {
            alert('Ticket copied to clipboard! Paste it anywhere to share.');
        });
    } else {
        const textarea = document.createElement('textarea');
        textarea.value = text;
        document.body.appendChild(textarea);
        textarea.select();
        document.execCommand('copy');
        document.body.removeChild(textarea);
        alert('Ticket copied to clipboard!');
    }
}

// ── My Bookings Page ──
async function loadMyBookings() {
    await checkLogin();
    const data = await api('/api/my-bookings');
    const list = document.getElementById('bookingsList');
    const noBookings = document.getElementById('noBookings');

    if (!data.bookings || data.bookings.length === 0) {
        list.style.display = 'none';
        noBookings.style.display = 'block';
        return;
    }

    list.innerHTML = data.bookings.map(b => `
        <div class="booking-card-item">
            <div class="booking-card-icon"><i class="fas fa-bus"></i></div>
            <div class="booking-card-details">
                <div class="booking-card-route">${b.origin} → ${b.destination}</div>
                <div class="booking-card-info">
                    <span><i class="fas fa-calendar"></i> ${formatDate(b.travel_date)}</span>
                    <span><i class="fas fa-clock"></i> ${b.departure_time}</span>
                    <span><i class="fas fa-chair"></i> Seats: ${b.seat_numbers}</span>
                </div>
            </div>
            <span class="booking-card-status ${b.status}">${b.status}</span>
            <div class="booking-card-fare">
                <div class="amount">$${b.total_fare}</div>
                <div class="method">${b.payment_method}</div>
            </div>
        </div>
    `).join('');
}

// ── Init on load ──
document.addEventListener('DOMContentLoaded', () => {
    checkLogin();
});

// ── Profile Page ──
async function loadProfile() {
    await checkLogin();
    const data = await api('/api/me');
    if (!data.logged_in) { window.location.href = '/'; return; }

    document.getElementById('profileName').textContent = 'Welcome, ' + data.user.full_name;
    document.getElementById('profilePhone').innerHTML = '<i class="fab fa-whatsapp"></i> ' + data.user.whatsapp;

    const stats = await api('/api/profile-stats');
    document.getElementById('statBuses').textContent = stats.bus_bookings;
    document.getElementById('statTaxis').textContent = stats.taxi_bookings;
    document.getElementById('statDeliveries').textContent = stats.delivery_bookings;
    document.getElementById('statTotal').textContent = '$' + stats.total_spent;
}

// ── Taxi Page ──
const taxiFares = { standard: 5, comfort: 8, premium: 12 };
let taxiPaymentMethod = '';

function updateTaxiFare() {
    const type = document.getElementById('taxiType').value;
    document.getElementById('taxiFareDisplay').textContent = '$' + taxiFares[type];
}

function selectTaxiPayment(method) {
    taxiPaymentMethod = method;
    const refSection = document.getElementById('taxiRefSection');
    refSection.style.display = (method === 'cash') ? 'none' : 'block';
    if (method === 'cash') document.getElementById('taxiPaymentRef').value = '';
}

async function submitTaxiBooking(e) {
    e.preventDefault();
    const userInfo = sessionStorage.getItem('user');
    if (!userInfo) { openLoginModal(); return; }

    if (!taxiPaymentMethod) { alert('Please select a payment method'); return; }

    const paymentRef = document.getElementById('taxiPaymentRef').value.trim();
    if (taxiPaymentMethod !== 'cash' && !paymentRef) {
        alert('Please enter your payment reference number'); return;
    }

    const btn = document.getElementById('taxiBookBtn');
    btn.disabled = true;
    btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Processing...';

    const taxiType = document.getElementById('taxiType').value;
    const data = await api('/api/book-taxi', 'POST', {
        pickup_location: document.getElementById('taxiPickup').value.trim(),
        dropoff_location: document.getElementById('taxiDropoff').value.trim(),
        taxi_type: taxiType,
        fare: taxiFares[taxiType],
        payment_method: taxiPaymentMethod,
        payment_reference: paymentRef,
        scheduled_time: document.getElementById('taxiSchedule').value
    });

    if (data.success) {
        sessionStorage.setItem('lastTaxiBooking', JSON.stringify({
            booking_id: data.booking_id,
            pickup: document.getElementById('taxiPickup').value.trim(),
            dropoff: document.getElementById('taxiDropoff').value.trim(),
            taxi_type: taxiType,
            payment: taxiPaymentMethod,
            fare: data.fare
        }));
        window.location.href = '/taxi-confirmation';
    } else {
        alert(data.error || 'Booking failed');
        btn.disabled = false;
        btn.innerHTML = '<i class="fas fa-check-circle"></i> Book Taxi';
    }
}

function loadTaxiConfirmation() {
    const booking = JSON.parse(sessionStorage.getItem('lastTaxiBooking') || '{}');
    const user = JSON.parse(sessionStorage.getItem('user') || '{}');
    if (!booking.booking_id) { window.location.href = '/'; return; }

    document.getElementById('taxiId').textContent = booking.booking_id;
    document.getElementById('taxiPickup').textContent = booking.pickup;
    document.getElementById('taxiDropoff').textContent = booking.dropoff;
    document.getElementById('taxiType').textContent = (booking.taxi_type || 'standard').toUpperCase();
    document.getElementById('taxiPassenger').textContent = user.full_name || 'Guest';
    document.getElementById('taxiPayment').textContent = (booking.payment || '-').toUpperCase();
    document.getElementById('taxiTotal').textContent = '$' + booking.fare;
    document.getElementById('qrBookingId').textContent = booking.booking_id;
    document.getElementById('qrcode-img').src = '/api/qrcode-taxi/' + booking.booking_id;
}

// ── Delivery Page ──
let deliveryPaymentMethod = '';

function selectDeliveryPayment(method) {
    deliveryPaymentMethod = method;
    const refSection = document.getElementById('deliveryRefSection');
    refSection.style.display = (method === 'cash') ? 'none' : 'block';
    if (method === 'cash') document.getElementById('deliveryPaymentRef').value = '';
}

async function submitDeliveryBooking(e) {
    e.preventDefault();
    const userInfo = sessionStorage.getItem('user');
    if (!userInfo) { openLoginModal(); return; }

    if (!deliveryPaymentMethod) { alert('Please select a payment method'); return; }

    const paymentRef = document.getElementById('deliveryPaymentRef').value.trim();
    if (deliveryPaymentMethod !== 'cash' && !paymentRef) {
        alert('Please enter your payment reference number'); return;
    }

    const btn = document.getElementById('deliveryBookBtn');
    btn.disabled = true;
    btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Processing...';

    const data = await api('/api/book-delivery', 'POST', {
        pickup_location: document.getElementById('deliveryPickup').value.trim(),
        dropoff_location: document.getElementById('deliveryDropoff').value.trim(),
        recipient_name: document.getElementById('recipientName').value.trim(),
        recipient_phone: document.getElementById('recipientPhone').value.trim(),
        item_description: document.getElementById('itemDescription').value.trim(),
        item_value: parseFloat(document.getElementById('itemValue').value) || 0,
        fare: 3,
        payment_method: deliveryPaymentMethod,
        payment_reference: paymentRef,
        scheduled_time: document.getElementById('deliverySchedule').value
    });

    if (data.success) {
        const user = JSON.parse(sessionStorage.getItem('user') || '{}');
        sessionStorage.setItem('lastDeliveryBooking', JSON.stringify({
            booking_id: data.booking_id,
            pickup: document.getElementById('deliveryPickup').value.trim(),
            dropoff: document.getElementById('deliveryDropoff').value.trim(),
            sender: user.full_name || 'Guest',
            recipient: document.getElementById('recipientName').value.trim(),
            item: document.getElementById('itemDescription').value.trim(),
            payment: deliveryPaymentMethod,
            fare: data.fare
        }));
        window.location.href = '/delivery-confirmation';
    } else {
        alert(data.error || 'Booking failed');
        btn.disabled = false;
        btn.innerHTML = '<i class="fas fa-paper-plane"></i> Send Delivery';
    }
}

function loadDeliveryConfirmation() {
    const booking = JSON.parse(sessionStorage.getItem('lastDeliveryBooking') || '{}');
    const user = JSON.parse(sessionStorage.getItem('user') || '{}');
    if (!booking.booking_id) { window.location.href = '/'; return; }

    document.getElementById('deliveryId').textContent = booking.booking_id;
    document.getElementById('deliveryPickup').textContent = booking.pickup;
    document.getElementById('deliveryDropoff').textContent = booking.dropoff;
    document.getElementById('deliverySender').textContent = user.full_name || 'Guest';
    document.getElementById('deliveryRecipient').textContent = booking.recipient;
    document.getElementById('deliveryItem').textContent = booking.item;
    document.getElementById('deliveryPayment').textContent = (booking.payment || '-').toUpperCase();
    document.getElementById('deliveryTotal').textContent = '$' + booking.fare;
    document.getElementById('qrBookingId').textContent = booking.booking_id;
    document.getElementById('qrcode-img').src = '/api/qrcode-delivery/' + booking.booking_id;
}
