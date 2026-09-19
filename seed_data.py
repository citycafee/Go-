import sqlite3, hashlib, os
from datetime import datetime

DB = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'transport.db')

conn = sqlite3.connect(DB)
c = conn.cursor()

# ── Routes ──
routes = [
    ('Hargeisa', 'Berbera', 150, 15, 180),
    ('Hargeisa', 'Burao', 310, 25, 360),
    ('Hargeisa', 'Erigavo', 180, 20, 240),
    ('Hargeisa', 'Borama', 110, 12, 150),
    ('Hargeisa', 'Sheikh', 60, 8, 90),
    ('Hargeisa', 'Togwajale', 80, 10, 120),
    ('Hargeisa', 'Gebiley', 45, 6, 60),
    ('Berbera', 'Burao', 250, 22, 300),
    ('Berbera', 'Erigavo', 330, 30, 420),
    ('Burao', 'Erigavo', 160, 18, 200),
    ('Burao', 'Borama', 420, 35, 480),
    ('Borama', 'Sheikh', 170, 16, 210),
]
for r in routes:
    c.execute("INSERT OR IGNORE INTO routes (origin,destination,distance_km,base_fare,duration_min) VALUES (?,?,?,?,?)", r)

# ── Buses (all 15-seat) ──
buses_data = [
    # Hargeisa -> Berbera (6 daily buses)
    ('SIL-001', 'Star Line Express', 1, '05:30', '08:30', 15, 15),
    ('SIL-002', 'Star Line Express', 1, '07:00', '10:00', 15, 15),
    ('SIL-003', 'Star Line Express', 1, '09:00', '12:00', 15, 15),
    ('SIL-004', 'Star Line Express', 1, '11:00', '14:00', 15, 15),
    ('SIL-005', 'Star Line Express', 1, '14:00', '17:00', 15, 15),
    ('SIL-006', 'Star Line Express', 1, '16:30', '19:30', 15, 15),

    # Hargeisa -> Burao
    ('SIL-010', 'Somaliland Coach', 2, '06:00', '12:00', 15, 25),
    ('SIL-011', 'Somaliland Coach', 2, '08:00', '14:00', 15, 25),
    ('SIL-012', 'Somaliland Coach', 2, '12:00', '18:00', 15, 25),

    # Hargeisa -> Erigavo
    ('SIL-020', 'Mountain Express', 3, '06:30', '10:30', 15, 20),
    ('SIL-021', 'Mountain Express', 3, '10:00', '14:00', 15, 20),

    # Hargeisa -> Borama
    ('SIL-030', 'Western Shuttle', 4, '06:00', '08:30', 15, 12),
    ('SIL-031', 'Western Shuttle', 4, '08:00', '10:30', 15, 12),
    ('SIL-032', 'Western Shuttle', 4, '10:00', '12:30', 15, 12),
    ('SIL-033', 'Western Shuttle', 4, '13:00', '15:30', 15, 12),
    ('SIL-034', 'Western Shuttle', 4, '15:00', '17:30', 15, 12),

    # Hargeisa -> Sheikh
    ('SIL-040', 'Capital Link', 5, '07:00', '08:30', 15, 8),
    ('SIL-041', 'Capital Link', 5, '10:00', '11:30', 15, 8),
    ('SIL-042', 'Capital Link', 5, '14:00', '15:30', 15, 8),

    # Hargeisa -> Togwajale
    ('SIL-050', 'Border Express', 6, '07:30', '09:30', 15, 10),
    ('SIL-051', 'Border Express', 6, '12:00', '14:00', 15, 10),

    # Hargeisa -> Gebiley
    ('SIL-060', 'City Bus', 7, '06:00', '07:00', 15, 6),
    ('SIL-061', 'City Bus', 7, '08:00', '09:00', 15, 6),
    ('SIL-062', 'City Bus', 7, '10:00', '11:00', 15, 6),
    ('SIL-063', 'City Bus', 7, '13:00', '14:00', 15, 6),
    ('SIL-064', 'City Bus', 7, '16:00', '17:00', 15, 6),

    # Berbera -> Burao
    ('SIL-070', 'Coastal Liner', 8, '07:00', '12:00', 15, 22),
    ('SIL-071', 'Coastal Liner', 8, '13:00', '18:00', 15, 22),

    # Berbera -> Erigavo
    ('SIL-080', 'East-West Express', 9, '08:00', '15:00', 15, 30),

    # Burao -> Erigavo
    ('SIL-090', 'Highland Bus', 10, '07:00', '10:30', 15, 18),
    ('SIL-091', 'Highland Bus', 10, '13:00', '16:30', 15, 18),

    # Burao -> Borama
    ('SIL-100', 'Long Route Express', 11, '06:00', '14:00', 15, 35),

    # Borama -> Sheikh
    ('SIL-110', 'Southern Link', 12, '08:00', '11:30', 15, 16),
]
for b in buses_data:
    c.execute("INSERT OR IGNORE INTO buses (bus_number,bus_name,route_id,departure_time,arrival_time,total_seats,fare) VALUES (?,?,?,?,?,?,?)", b)

conn.commit()
conn.close()
print("Somaliland sample data inserted successfully!")
print(f"DB: {DB}")
