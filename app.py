import sqlite3, hashlib, os, json, io, base64
import qrcode
from flask import Flask, render_template, request, jsonify, session, redirect, url_for, send_file
from flask_cors import CORS
from functools import wraps
from datetime import datetime

app = Flask(__name__)
app.secret_key = 'somaliland-bus-2026-secret'
CORS(app)

DB = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'transport.db')

def get_db():
    conn = sqlite3.connect(DB)
    conn.row_factory = sqlite3.Row
    return conn

def init_db():
    db = get_db()
    db.executescript('''
        CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            full_name TEXT NOT NULL,
            whatsapp TEXT UNIQUE NOT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
        CREATE TABLE IF NOT EXISTS routes (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            origin TEXT NOT NULL,
            destination TEXT NOT NULL,
            distance_km REAL,
            base_fare REAL NOT NULL,
            duration_min INTEGER NOT NULL,
            status TEXT DEFAULT 'active',
            UNIQUE(origin, destination)
        );
        CREATE TABLE IF NOT EXISTS buses (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            bus_number TEXT UNIQUE NOT NULL,
            bus_name TEXT NOT NULL,
            route_id INTEGER NOT NULL,
            departure_time TEXT NOT NULL,
            arrival_time TEXT NOT NULL,
            total_seats INTEGER DEFAULT 15,
            fare REAL NOT NULL,
            status TEXT DEFAULT 'active',
            FOREIGN KEY (route_id) REFERENCES routes(id)
        );
        CREATE TABLE IF NOT EXISTS bookings (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER NOT NULL,
            bus_id INTEGER NOT NULL,
            seat_numbers TEXT NOT NULL,
            passenger_name TEXT NOT NULL,
            passenger_whatsapp TEXT NOT NULL,
            total_fare REAL NOT NULL,
            payment_method TEXT NOT NULL,
            payment_reference TEXT,
            status TEXT DEFAULT 'confirmed',
            travel_date TEXT NOT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (user_id) REFERENCES users(id),
            FOREIGN KEY (bus_id) REFERENCES buses(id)
        );
        CREATE TABLE IF NOT EXISTS taxi_bookings (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER NOT NULL,
            pickup_location TEXT NOT NULL,
            dropoff_location TEXT NOT NULL,
            passenger_name TEXT NOT NULL,
            passenger_whatsapp TEXT NOT NULL,
            taxi_type TEXT DEFAULT 'standard',
            fare REAL NOT NULL,
            payment_method TEXT NOT NULL,
            payment_reference TEXT,
            status TEXT DEFAULT 'confirmed',
            scheduled_time TEXT,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (user_id) REFERENCES users(id)
        );
        CREATE TABLE IF NOT EXISTS delivery_bookings (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER NOT NULL,
            pickup_location TEXT NOT NULL,
            dropoff_location TEXT NOT NULL,
            sender_name TEXT NOT NULL,
            sender_whatsapp TEXT NOT NULL,
            recipient_name TEXT NOT NULL,
            recipient_phone TEXT NOT NULL,
            item_description TEXT NOT NULL,
            item_value REAL DEFAULT 0,
            fare REAL NOT NULL,
            payment_method TEXT NOT NULL,
            payment_reference TEXT,
            status TEXT DEFAULT 'confirmed',
            scheduled_time TEXT,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (user_id) REFERENCES users(id)
        );
    ''')
    db.commit()
    db.close()

def login_required(f):
    @wraps(f)
    def decorated(*args, **kwargs):
        if 'user_id' not in session:
            return redirect(url_for('home'))
        return f(*args, **kwargs)
    return decorated

# ── Pages ──

@app.route('/')
def home():
    return render_template('index.html')

@app.route('/buses')
def buses_page():
    return render_template('buses.html')

@app.route('/seats')
def seats_page():
    return render_template('seats.html')

@app.route('/payment')
def payment_page():
    return render_template('payment.html')

@app.route('/confirmation')
def confirmation_page():
    return render_template('confirmation.html')

@app.route('/my-bookings')
def my_bookings_page():
    return render_template('my_bookings.html')

@app.route('/verify/<int:booking_id>')
def verify_page(booking_id):
    return render_template('verify.html', booking_id=booking_id)

@app.route('/profile')
@login_required
def profile_page():
    return render_template('profile.html')

@app.route('/taxi')
def taxi_page():
    return render_template('taxi.html')

@app.route('/delivery')
def delivery_page():
    return render_template('delivery.html')

@app.route('/taxi-confirmation')
def taxi_confirmation_page():
    return render_template('taxi_confirmation.html')

@app.route('/delivery-confirmation')
def delivery_confirmation_page():
    return render_template('delivery_confirmation.html')

# ── Auth API ──

@app.route('/api/login', methods=['POST'])
def api_login():
    data = request.get_json()
    name = data.get('full_name', '').strip()
    whatsapp = data.get('whatsapp', '').strip()
    if not name or not whatsapp:
        return jsonify({'error': 'Name and WhatsApp required'}), 400
    db = get_db()
    user = db.execute('SELECT * FROM users WHERE whatsapp = ?', (whatsapp,)).fetchone()
    if user:
        if user['full_name'] != name:
            db.execute('UPDATE users SET full_name = ? WHERE id = ?', (name, user['id']))
            db.commit()
        session['user_id'] = user['id']
        session['user_name'] = name
        session['user_whatsapp'] = whatsapp
        return jsonify({'success': True, 'user': {'id': user['id'], 'full_name': name, 'whatsapp': whatsapp}})
    db.execute('INSERT INTO users (full_name, whatsapp) VALUES (?, ?)', (name, whatsapp))
    db.commit()
    user = db.execute('SELECT * FROM users WHERE whatsapp = ?', (whatsapp,)).fetchone()
    session['user_id'] = user['id']
    session['user_name'] = name
    session['user_whatsapp'] = whatsapp
    return jsonify({'success': True, 'user': {'id': user['id'], 'full_name': name, 'whatsapp': whatsapp}})

@app.route('/api/logout', methods=['POST'])
def api_logout():
    session.clear()
    return jsonify({'success': True})

@app.route('/api/me')
def api_me():
    if 'user_id' in session:
        return jsonify({'logged_in': True, 'user': {'id': session['user_id'], 'full_name': session['user_name'], 'whatsapp': session['user_whatsapp']}})
    return jsonify({'logged_in': False})

# ── Routes API ──

@app.route('/api/routes')
def api_get_routes():
    db = get_db()
    rows = db.execute('SELECT * FROM routes WHERE status = "active" ORDER BY origin, destination').fetchall()
    cities = sorted(set([r['origin'] for r in rows] + [r['destination'] for r in rows]))
    return jsonify({'routes': [dict(r) for r in rows], 'cities': cities})

# ── Buses API ──

@app.route('/api/buses')
def api_get_buses():
    origin = request.args.get('origin', '')
    date = request.args.get('date', '')
    db = get_db()
    query = '''
        SELECT b.*, r.origin, r.destination, r.duration_min, r.distance_km
        FROM buses b JOIN routes r ON b.route_id = r.id
        WHERE r.status = "active" AND b.status = "active"
    '''
    params = []
    if origin:
        query += ' AND r.origin = ? AND r.destination = ?'
        parts = origin.split('->')
        if len(parts) == 2:
            params.extend([parts[0].strip(), parts[1].strip()])
    query += ' ORDER BY b.departure_time'
    buses = db.execute(query, params).fetchall()

    result = []
    for bus in buses:
        bus_dict = dict(bus)
        # Count actual seat numbers booked (not number of bookings)
        if date:
            bookings = db.execute(
                '''SELECT seat_numbers FROM bookings
                   WHERE bus_id = ? AND travel_date = ? AND status = "confirmed"''',
                (bus['id'], date)
            ).fetchall()
        else:
            bookings = db.execute(
                '''SELECT seat_numbers FROM bookings
                   WHERE bus_id = ? AND status = "confirmed"''',
                (bus['id'],)
            ).fetchall()

        # Count individual seats (split comma-separated seat numbers)
        booked_count = 0
        for row in bookings:
            if row['seat_numbers']:
                seats_list = row['seat_numbers'].split(',')
                booked_count += len([s for s in seats_list if s.strip()])

        bus_dict['total_seats'] = bus['total_seats']
        bus_dict['booked_seats'] = booked_count
        bus_dict['available_seats'] = bus['total_seats'] - booked_count
        result.append(bus_dict)

    db.close()
    return jsonify({'buses': result})

# ── Seats API ──

@app.route('/api/seats/<int:bus_id>')
def api_get_seats(bus_id):
    db = get_db()
    bus = db.execute('''
        SELECT b.*, r.origin, r.destination, r.duration_min, r.distance_km
        FROM buses b JOIN routes r ON b.route_id = r.id WHERE b.id = ?
    ''', (bus_id,)).fetchone()
    if not bus:
        return jsonify({'error': 'Bus not found'}), 404

    date = request.args.get('date', datetime.now().strftime('%Y-%m-%d'))
    booked = db.execute(
        'SELECT seat_numbers FROM bookings WHERE bus_id = ? AND travel_date = ? AND status = "confirmed"',
        (bus_id, date)
    ).fetchall()
    taken = set()
    for row in booked:
        for s in row['seat_numbers'].split(','):
            taken.add(s.strip())

    seats = []
    for i in range(1, bus['total_seats'] + 1):
        seats.append({'number': i, 'status': 'taken' if str(i) in taken else 'available'})
    return jsonify({'bus': dict(bus), 'seats': seats, 'date': date})

# ── Booking API ──

@app.route('/api/book', methods=['POST'])
@login_required
def api_book():
    data = request.get_json()
    bus_id = data.get('bus_id')
    seat_numbers = data.get('seat_numbers', [])
    travel_date = data.get('travel_date', '')
    payment_method = data.get('payment_method', 'cash')
    payment_reference = data.get('payment_reference', '')

    if not bus_id or not seat_numbers or not travel_date:
        return jsonify({'error': 'Missing booking details'}), 400

    db = get_db()
    bus = db.execute('SELECT * FROM buses WHERE id = ? AND status = "active"', (bus_id,)).fetchone()
    if not bus:
        return jsonify({'error': 'Bus not found'}), 404

    booked = db.execute(
        'SELECT seat_numbers FROM bookings WHERE bus_id = ? AND travel_date = ? AND status = "confirmed"',
        (bus_id, travel_date)
    ).fetchall()
    taken = set()
    for row in booked:
        for s in row['seat_numbers'].split(','):
            taken.add(s.strip())

    for s in seat_numbers:
        if str(s) in taken:
            return jsonify({'error': f'Seat {s} is already taken'}), 400

    total_fare = bus['fare'] * len(seat_numbers)
    seats_str = ','.join([str(s) for s in seat_numbers])

    db.execute('''INSERT INTO bookings
        (user_id, bus_id, seat_numbers, passenger_name, passenger_whatsapp, total_fare, payment_method, payment_reference, travel_date)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)''',
        (session['user_id'], bus_id, seats_str, session['user_name'], session['user_whatsapp'],
         total_fare, payment_method, payment_reference, travel_date))
    booking_id = db.execute('SELECT last_insert_rowid()').fetchone()[0]
    db.commit()
    db.close()

    return jsonify({'success': True, 'booking_id': booking_id, 'total_fare': total_fare})

@app.route('/api/my-bookings')
@login_required
def api_my_bookings():
    db = get_db()
    bookings = db.execute('''
        SELECT bk.*, b.bus_number, b.bus_name, b.departure_time, b.arrival_time,
               r.origin, r.destination, r.duration_min
        FROM bookings bk
        JOIN buses b ON bk.bus_id = b.id
        JOIN routes r ON b.route_id = r.id
        WHERE bk.user_id = ?
        ORDER BY bk.created_at DESC
    ''', (session['user_id'],)).fetchall()
    return jsonify({'bookings': [dict(b) for b in bookings]})

@app.route('/api/booking/<int:booking_id>')
def api_booking_detail(booking_id):
    db = get_db()
    booking = db.execute('''
        SELECT bk.*, b.bus_number, b.bus_name, b.departure_time, b.arrival_time,
               r.origin, r.destination, r.duration_min, r.distance_km
        FROM bookings bk
        JOIN buses b ON bk.bus_id = b.id
        JOIN routes r ON b.route_id = r.id
        WHERE bk.id = ?
    ''', (booking_id,)).fetchone()
    if not booking:
        return jsonify({'error': 'Booking not found'}), 404
    return jsonify({'booking': dict(booking)})

# ── Taxi API ──

@app.route('/api/book-taxi', methods=['POST'])
@login_required
def api_book_taxi():
    data = request.get_json()
    pickup = data.get('pickup_location', '').strip()
    dropoff = data.get('dropoff_location', '').strip()
    taxi_type = data.get('taxi_type', 'standard')
    fare = data.get('fare', 0)
    payment_method = data.get('payment_method', 'cash')
    payment_reference = data.get('payment_reference', '')
    scheduled_time = data.get('scheduled_time', '')

    if not pickup or not dropoff:
        return jsonify({'error': 'Pickup and dropoff locations required'}), 400

    db = get_db()
    db.execute('''INSERT INTO taxi_bookings
        (user_id, pickup_location, dropoff_location, passenger_name, passenger_whatsapp,
         taxi_type, fare, payment_method, payment_reference, scheduled_time)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)''',
        (session['user_id'], pickup, dropoff, session['user_name'], session['user_whatsapp'],
         taxi_type, fare, payment_method, payment_reference, scheduled_time))
    booking_id = db.execute('SELECT last_insert_rowid()').fetchone()[0]
    db.commit()
    db.close()
    return jsonify({'success': True, 'booking_id': booking_id, 'fare': fare})

@app.route('/api/my-taxis')
@login_required
def api_my_taxis():
    db = get_db()
    bookings = db.execute('''
        SELECT * FROM taxi_bookings WHERE user_id = ? ORDER BY created_at DESC
    ''', (session['user_id'],)).fetchall()
    return jsonify({'bookings': [dict(b) for b in bookings]})

# ── Delivery API ──

@app.route('/api/book-delivery', methods=['POST'])
@login_required
def api_book_delivery():
    data = request.get_json()
    pickup = data.get('pickup_location', '').strip()
    dropoff = data.get('dropoff_location', '').strip()
    recipient_name = data.get('recipient_name', '').strip()
    recipient_phone = data.get('recipient_phone', '').strip()
    item_desc = data.get('item_description', '').strip()
    item_value = data.get('item_value', 0)
    fare = data.get('fare', 0)
    payment_method = data.get('payment_method', 'cash')
    payment_reference = data.get('payment_reference', '')
    scheduled_time = data.get('scheduled_time', '')

    if not pickup or not dropoff or not recipient_name or not recipient_phone:
        return jsonify({'error': 'All fields are required'}), 400

    db = get_db()
    db.execute('''INSERT INTO delivery_bookings
        (user_id, pickup_location, dropoff_location, sender_name, sender_whatsapp,
         recipient_name, recipient_phone, item_description, item_value,
         fare, payment_method, payment_reference, scheduled_time)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)''',
        (session['user_id'], pickup, dropoff, session['user_name'], session['user_whatsapp'],
         recipient_name, recipient_phone, item_desc, item_value,
         fare, payment_method, payment_reference, scheduled_time))
    booking_id = db.execute('SELECT last_insert_rowid()').fetchone()[0]
    db.commit()
    db.close()
    return jsonify({'success': True, 'booking_id': booking_id, 'fare': fare})

@app.route('/api/my-deliveries')
@login_required
def api_my_deliveries():
    db = get_db()
    bookings = db.execute('''
        SELECT * FROM delivery_bookings WHERE user_id = ? ORDER BY created_at DESC
    ''', (session['user_id'],)).fetchall()
    return jsonify({'bookings': [dict(b) for b in bookings]})

# ── Profile Stats API ──

@app.route('/api/profile-stats')
@login_required
def api_profile_stats():
    db = get_db()
    bus_count = db.execute('SELECT COUNT(*) as c FROM bookings WHERE user_id = ?', (session['user_id'],)).fetchone()['c']
    taxi_count = db.execute('SELECT COUNT(*) as c FROM taxi_bookings WHERE user_id = ?', (session['user_id'],)).fetchone()['c']
    delivery_count = db.execute('SELECT COUNT(*) as c FROM delivery_bookings WHERE user_id = ?', (session['user_id'],)).fetchone()['c']
    bus_total = db.execute('SELECT COALESCE(SUM(total_fare),0) as t FROM bookings WHERE user_id = ?', (session['user_id'],)).fetchone()['t']
    taxi_total = db.execute('SELECT COALESCE(SUM(fare),0) as t FROM taxi_bookings WHERE user_id = ?', (session['user_id'],)).fetchone()['t']
    delivery_total = db.execute('SELECT COALESCE(SUM(fare),0) as t FROM delivery_bookings WHERE user_id = ?', (session['user_id'],)).fetchone()['t']
    db.close()
    return jsonify({
        'bus_bookings': bus_count,
        'taxi_bookings': taxi_count,
        'delivery_bookings': delivery_count,
        'total_spent': bus_total + taxi_total + delivery_total
    })

@app.route('/api/qrcode/<int:booking_id>')
def api_qrcode(booking_id):
    db = get_db()
    booking = db.execute('''
        SELECT bk.*, b.bus_number, b.bus_name, b.departure_time, b.arrival_time,
               r.origin, r.destination, r.duration_min
        FROM bookings bk
        JOIN buses b ON bk.bus_id = b.id
        JOIN routes r ON b.route_id = r.id
        WHERE bk.id = ?
    ''', (booking_id,)).fetchone()
    db.close()

    if not booking:
        return 'Booking not found', 404

    verify_url = request.host_url + 'verify/' + str(booking_id)
    qr_text = (
        f'=== SOMALILAND EXPRESS ===\n'
        f'Booking: #{booking["id"]}\n'
        f'Route: {booking["origin"]} -> {booking["destination"]}\n'
        f'Date: {booking["travel_date"]}\n'
        f'Depart: {booking["departure_time"]}\n'
        f'Seats: {booking["seat_numbers"]}\n'
        f'Passenger: {booking["passenger_name"]}\n'
        f'Payment: {booking["payment_method"].upper()}\n'
        f'Total: ${booking["total_fare"]}\n'
        f'Verify: {verify_url}'
    )

    qr = qrcode.QRCode(version=1, box_size=10, border=2)
    qr.add_data(qr_text)
    qr.make(fit=True)
    img = qr.make_image(fill_color='#1A237E', back_color='white')

    buf = io.BytesIO()
    img.save(buf, format='PNG')
    buf.seek(0)
    return send_file(buf, mimetype='image/png')

@app.route('/api/qrcode-taxi/<int:booking_id>')
def api_qrcode_taxi(booking_id):
    db = get_db()
    booking = db.execute('SELECT * FROM taxi_bookings WHERE id = ?', (booking_id,)).fetchone()
    db.close()

    if not booking:
        return 'Booking not found', 404

    qr_text = (
        f'=== SOMALILAND EXPRESS TAXI ===\n'
        f'Booking: #{booking["id"]}\n'
        f'Pickup: {booking["pickup_location"]}\n'
        f'Dropoff: {booking["dropoff_location"]}\n'
        f'Type: {booking["taxi_type"].upper()}\n'
        f'Passenger: {booking["passenger_name"]}\n'
        f'Payment: {booking["payment_method"].upper()}\n'
        f'Total: ${booking["fare"]}\n'
        f'Status: {booking["status"].upper()}'
    )

    qr = qrcode.QRCode(version=1, box_size=10, border=2)
    qr.add_data(qr_text)
    qr.make(fit=True)
    img = qr.make_image(fill_color='#E65100', back_color='white')

    buf = io.BytesIO()
    img.save(buf, format='PNG')
    buf.seek(0)
    return send_file(buf, mimetype='image/png')

@app.route('/api/qrcode-delivery/<int:booking_id>')
def api_qrcode_delivery(booking_id):
    db = get_db()
    booking = db.execute('SELECT * FROM delivery_bookings WHERE id = ?', (booking_id,)).fetchone()
    db.close()

    if not booking:
        return 'Booking not found', 404

    qr_text = (
        f'=== SOMALILAND EXPRESS DELIVERY ===\n'
        f'Booking: #{booking["id"]}\n'
        f'Pickup: {booking["pickup_location"]}\n'
        f'Dropoff: {booking["dropoff_location"]}\n'
        f'Sender: {booking["sender_name"]}\n'
        f'Recipient: {booking["recipient_name"]}\n'
        f'Phone: {booking["recipient_phone"]}\n'
        f'Item: {booking["item_description"]}\n'
        f'Payment: {booking["payment_method"].upper()}\n'
        f'Fee: ${booking["fare"]}\n'
        f'Status: {booking["status"].upper()}'
    )

    qr = qrcode.QRCode(version=1, box_size=10, border=2)
    qr.add_data(qr_text)
    qr.make(fit=True)
    img = qr.make_image(fill_color='#1B5E20', back_color='white')

    buf = io.BytesIO()
    img.save(buf, format='PNG')
    buf.seek(0)
    return send_file(buf, mimetype='image/png')

if __name__ == '__main__':
    init_db()
    app.run(debug=True, host='0.0.0.0', port=5000)
