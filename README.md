# Wiztec Wi-Fi Manager — 30-minute learning prototype

A small mobile-friendly full-stack web app using:
- Front end: HTML, CSS, JavaScript
- Back end: Python + Flask
- Database: SQLite (created automatically)
- Payment: clearly labelled demo checkout; no real money is collected

## What works in this demo
- Displays three sample Wi-Fi packages
- Creates orders via the back-end API
- Stores orders in `wifi_shop.db`
- Shows recent orders in a simple dashboard
- Has a demo-only button that marks an order paid and creates a sample voucher

**This is not production-ready.** The demo payment endpoint can mark an order paid without collecting money. Do not deploy it publicly or use its vouchers for customer access.

## 30-minute plan
1. 0–5 min: install Python and create the project folder.
2. 5–10 min: install Flask.
3. 10–15 min: run the app and test the customer page.
4. 15–20 min: create an order and inspect the dashboard.
5. 20–25 min: open the app on your phone using the PC's local IP.
6. 25–30 min: review real-payment and router-integration next steps.

## Run on Windows 10/11
1. Install Python 3 from https://www.python.org/downloads/ . During setup, tick **Add Python to PATH**.
2. Extract this ZIP to a folder such as `C:\wiztec_wifi_manager`.
3. Open Command Prompt in that folder.
4. Run:

```bat
py -m venv .venv
.venv\Scripts\activate
py -m pip install -r requirements.txt
py app.py
```

5. On the PC, open `http://127.0.0.1:5000`.
6. On the same Wi-Fi network, find the PC IPv4 address by opening a second Command Prompt and running `ipconfig`. On your phone's browser, visit `http://PC-IP-ADDRESS:5000` (replace with the PC's IPv4 address, e.g. `http://192.168.1.10:5000`).
7. If Windows Firewall asks, allow Python on **Private networks only**. Do not expose this demo to the public internet.

## Optional: run on Android with Pydroid 3
This project is designed first for a PC. On Android, install Pydroid 3, install Flask from its Pip menu, copy the project folder to your phone, and run `app.py`. Availability of all dependencies can vary by Android/Pydroid version. The database file is created in the project folder.

## Test it
1. Choose a package.
2. Enter a sample name and phone number. Do not enter any wallet PIN.
3. Choose a payment option; the label says the integration is not connected.
4. Tap **Create order**.
5. Tap **Simulate successful payment**. A demo voucher appears and the order dashboard updates.
6. Stop and restart the server; the SQLite order records remain in `wifi_shop.db`.

## API routes
- `GET /api/packages` — list packages
- `POST /api/orders` — create pending order
- `POST /api/orders/<id>/demo-pay` — DEMO ONLY; marks an order paid without collecting money
- `GET /api/admin/orders` — recent orders; currently not authenticated
- `GET /health` — health check

## Real Sierra Leone mobile-money payments
The UI contains Orange Money and Afrimoney choices for demonstration only. They are **not connected**. Do not change an order to paid based only on a browser redirect or a customer screenshot.

Potential next steps:
- **Orange Money:** the official Orange Sierra Leone developer page advertises web payment. Apply through https://www.orange.sl/en/orange-developer.html and follow the current merchant onboarding and API documentation. Availability of test/live credentials and business-document requirements must be confirmed with Orange.
- **Afrimoney:** the Africell Sierra Leone merchant-payments page describes merchant payments and the USSD flow. Contact Africell/Afrimoney to ask for approved online/API collection access and current technical documentation: https://www.africell.sl/afrimoney_services/merchant-payments/
- **Payment aggregator option:** MarzPay publishes Sierra Leone Orange Money collection documentation at https://wallet.wearemarz.com/documentation/sierra-leone. Confirm eligibility, account activation, fees, current API details and whether the service supports your business before selecting it.

Real integration requires merchant approval, secret credentials stored on the server (never in JavaScript), HTTPS, unique transaction references, server-side status verification, signed/verified webhooks, duplicate-event protection, error handling and reconciliation. A successful browser return is not proof of payment.

## Connect to a real Wi-Fi hotspot
The sample voucher is just text. To provide internet access automatically, the production version needs a supported router/controller integration (for example, a MikroTik HotSpot with RouterOS API/RADIUS). Only activate a router user after the server verifies a real successful payment. Also add:
- Admin login and access control
- Rate limiting, input validation and audit logs
- HTTPS and secure secrets management
- Refund/cancellation handling and transaction reconciliation
- Expiry and data limits enforced by the router
- Privacy notice and secure handling of customer data

## Before taking real customer money
Remove or disable the demo-pay route, secure the admin dashboard, test payment failures and duplicate callbacks, and have the complete payment and router flow reviewed before launch.
