from flask import Flask, render_template, request, jsonify
import sqlite3, os, secrets, string
from datetime import datetime, timezone

APP_DIR = os.path.dirname(os.path.abspath(__file__))
DB_PATH = os.path.join(APP_DIR, "wifi_shop.db")
app = Flask(__name__)

PACKAGES = [
    {"id": "1h", "name": "1 Hour Pass", "price": 5, "duration": "1 hour", "description": "Quick browsing"},
    {"id": "1d", "name": "1 Day Pass", "price": 20, "duration": "24 hours", "description": "A full day online"},
    {"id": "7d", "name": "7 Day Pass", "price": 100, "duration": "7 days", "description": "For regular users"},
]

def connect_db():
    con = sqlite3.connect(DB_PATH)
    con.row_factory = sqlite3.Row
    return con

def init_db():
    with connect_db() as con:
        con.execute("""CREATE TABLE IF NOT EXISTS orders (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            customer_name TEXT NOT NULL,
            phone TEXT NOT NULL,
            package_id TEXT NOT NULL,
            package_name TEXT NOT NULL,
            amount REAL NOT NULL,
            payment_method TEXT NOT NULL,
            payment_status TEXT NOT NULL DEFAULT 'pending',
            voucher TEXT,
            created_at TEXT NOT NULL
        )""")

def make_voucher():
    alphabet = string.ascii_uppercase + string.digits
    return "WZ-" + "".join(secrets.choice(alphabet) for _ in range(8))

@app.route("/")
def home():
    return render_template("index.html")

@app.get("/api/packages")
def get_packages():
    return jsonify(PACKAGES)

@app.post("/api/orders")
def create_order():
    data = request.get_json(silent=True) or {}
    name = str(data.get("name", "")).strip()
    phone = str(data.get("phone", "")).strip()
    package_id = str(data.get("package_id", "")).strip()
    method = str(data.get("payment_method", "demo")).strip()

    package = next((p for p in PACKAGES if p["id"] == package_id), None)
    if not name or len(name) > 80:
        return jsonify(error="Enter a customer name (maximum 80 characters)."), 400
    if not phone or len(phone) > 25:
        return jsonify(error="Enter a valid phone number."), 400
    if not package:
        return jsonify(error="Choose a valid package."), 400
    if method not in ("orange_money", "afrimoney", "demo"):
        return jsonify(error="Choose a listed payment method."), 400

    with connect_db() as con:
        cur = con.execute("""INSERT INTO orders
            (customer_name, phone, package_id, package_name, amount, payment_method, payment_status, created_at)
            VALUES (?, ?, ?, ?, ?, ?, 'pending', ?)""",
            (name, phone, package["id"], package["name"], package["price"], method,
             datetime.now(timezone.utc).isoformat()))
        order_id = cur.lastrowid

    # This creates an order only. It does NOT collect money.
    return jsonify(
        order_id=order_id,
        amount=package["price"],
        package_name=package["name"],
        status="pending",
        message="Order created. No real money has been collected."
    ), 201

@app.post("/api/orders/<int:order_id>/demo-pay")
def demo_pay(order_id):
    """DEMO ONLY: simulates a confirmed payment. Never expose this route in production."""
    with connect_db() as con:
        order = con.execute("SELECT * FROM orders WHERE id=?", (order_id,)).fetchone()
        if not order:
            return jsonify(error="Order not found."), 404
        if order["payment_status"] == "paid":
            return jsonify(order_id=order_id, status="paid", voucher=order["voucher"],
                           message="This demo order was already marked paid.")
        voucher = make_voucher()
        con.execute("UPDATE orders SET payment_status='paid', voucher=? WHERE id=?",
                    (voucher, order_id))
    return jsonify(order_id=order_id, status="paid", voucher=voucher,
                   message="DEMO PAYMENT ONLY: no money was collected and this voucher does not enable internet access.")

@app.get("/api/admin/orders")
def admin_orders():
    # Local demo only. Add real authentication before deployment.
    with connect_db() as con:
        rows = con.execute("""SELECT id, customer_name, phone, package_name, amount,
            payment_method, payment_status, voucher, created_at
            FROM orders ORDER BY id DESC LIMIT 100""").fetchall()
    return jsonify([dict(r) for r in rows])

@app.get("/health")
def health():
    return jsonify(status="ok", app="Wiztec Wi-Fi Manager")

if __name__ == "__main__":
    init_db()
    print("Wiztec Wi-Fi Manager running at http://127.0.0.1:5000")
    print("Phone on the same Wi-Fi can use your PC's local IP, e.g. http://192.168.1.10:5000")
    app.run(host="0.0.0.0", port=5000, debug=False)
