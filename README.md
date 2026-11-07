# Spare Parts & Service Billing System

A fast, professional, and secure Invoicing & Billing application customized for **RAJARAM HODAWADEKAR**.

---

## 🔒 1. Admin Security Access & Fixed QR Code Lock
For enhanced shop and payment security, the system incorporates two layers of protection:
* **Admin Login & Sign In Portal**:
  * **Default Admin ID / Phone:** `1234567890` (or `rajaram`)
  * **Default Password:** `admin`
  * Locks the entire billing workspace when logging out (`🔒 Logout`).
* **Fixed QR Code Security Lock**:
  * The payment QR code on the bill is **FIXED** as your permanent official merchant QR code.
  * To set, upload, or modify this Fixed QR code, clicking **`🔐 Set / Change Fixed QR`** requires entering the **Admin ID & Password**.
  * Prevents counter staff or unauthorized persons from modifying the payment QR code!

---

## 👤 2. Client Details (For Your Private Records)
* **1. NAME** & **2. PHONE NUMBER** are optional fields kept for your internal shop history.
* **"Print on Bill" toggle**: Keep it checked to print the client's name on customer bills, or uncheck it to produce clean, anonymous counter cash memos.

---

## 📲 3. Exact WhatsApp Bill Structure
The WhatsApp bill format directly matches your requested structure:
```text
🧾 *BILL / INVOICE: INV-2026-0001*
──────────────────────────
*FROM: RAJARAM HODAWADEKAR*
📞 *Contact:* +91 1234567890
🏪 *Shop:* AUTO SPARES & SERVICE CENTRE
📅 *Date:* 07-11-2026
👤 *Customer:* Ramesh Patil
──────────────────────────
*SPARE PARTS & SERVICES:*

1. *Engine Oil (1 Litre)*
   1 x ₹450.00 = *₹450.00*

2. *Brake Shoes / Brake Pads*
   1 x ₹380.00 = *₹380.00*

3. *General Servicing & Labour Charges*
   1 x ₹350.00 = *₹350.00*

──────────────────────────
💰 *TOTAL AMOUNT DUE: ₹1,180.00*
──────────────────────────

📲 *CLICK TO PAY DIRECTLY (GPay / PhonePe / Paytm):*
upi://pay?pa=1234567890@upi&pn=RAJARAM%20HODAWADEKAR&am=1180.00&cu=INR&tn=Bill_INV-2026-0001

💳 *Or Pay Manually to UPI ID:*
👉 `1234567890@upi`

Thank you for your business! Please let us know once paid. 🙏
```

---

## ⚙️ 4. Automated Calculations
* Fast row insertion with <kbd>Enter</kbd> key navigation.
* Real-time line item `Qty × Price` calculations.
* Real-time Subtotal, Discount (₹ or %), GST/Tax, Round-off, and **Grand Total (₹)**.
* Automatic **Amount in Words** (*e.g., "One Thousand One Hundred Eighty Rupees Only"*).

---

## ⚡ 5. Real-Time Auto-Update: UNPAID to PAID in Saved Bills
When a client pays the bill via Google Pay, PhonePe, Paytm, or Cash:
1. **1-Click Auto-Update on Invoice**: Click the green **`✅ Mark Paid`** button next to Payment Status or on the sticky floating dock. The saved invoice record in your local database is **immediately and automatically updated** from `Unpaid` to `Paid`!
2. **1-Click Update in Saved Bills History**: Open **History** to view all invoices. Every unpaid bill features a direct **`✅ Mark Paid`** button right in its row. Click once, and the bill instantly flips to `PAID` with real-time badge and counter updates!
3. **Filter by Payment Status**: Filter history with 1-click tabs:
   * **All Bills**
   * **⏳ Pending / Unpaid**
   * **✅ Paid**
4. **Client Payment & UTR Confirmation Box**: Enter the client's 12-digit UPI UTR / Reference number from GPay/PhonePe and click **`✅ Confirm Payment & Mark PAID`** to permanently attach the transaction reference and verify payment.
5. **WhatsApp Modal Shortcut**: Inside the WhatsApp sharing window, click **`✅ Client Paid? Mark as PAID`** to mark it as paid the moment your customer messages back confirmation!

---

## 🚀 Live Access
Access the live running local server at:
👉 **[http://localhost:5500](http://localhost:5500)**
Or double-click `start_app.bat`.
