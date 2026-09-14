import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import Icon from "../components/common/Icon.jsx";
import { useBooking } from "../context/BookingContext.jsx";
import { useAuth } from "../context/AuthContext.jsx";
import { getSelectedTrain } from "../services/trainService.js";
import { calculateFare } from "../services/fareCalculator.js";
import { createBooking } from "../services/bookingService.js";
import "./Payment.css";

const METHODS = [
  { id: "upi", label: "UPI", icon: "signal", hint: "Google Pay, PhonePe, Paytm" },
  { id: "card", label: "Card", icon: "ticket", hint: "Credit or debit card" },
  { id: "netbanking", label: "Net Banking", icon: "shield", hint: "All major banks" },
  { id: "wallet", label: "Wallet", icon: "user", hint: "Choose your wallet" },
];

function getInitialForm(method) {
  if (method === "upi") return { upi: "", card: "", bank: "", wallet: "" };
  return { upi: "", card: "", bank: "", wallet: "" };
}

export default function Payment() {
  const navigate = useNavigate();
  const { passengers, selectedSeats } = useBooking();
  const { user } = useAuth();
  const selectedTrain = useMemo(() => getSelectedTrain(), []);
  const fare = useMemo(() => calculateFare({ baseFare: selectedTrain?.fare ?? 0, passengers }), [selectedTrain, passengers]);
  const [method, setMethod] = useState("upi");
  const [form, setForm] = useState(getInitialForm("upi"));
  const [error, setError] = useState("");
  const [processing, setProcessing] = useState(false);

  if (!selectedTrain || passengers.length === 0) {
    return null;
  }

  function update(field, value) {
    setForm((current) => ({ ...current, [field]: value }));
    setError("");
  }

  function validate() {
    if (method === "upi" && !/^[\w.-]+@[\w.-]+$/.test(form.upi.trim())) return "Enter a valid demo UPI ID, e.g. sanyam@upi.";
    if (method === "card" && form.card.replace(/\s/g, "").length !== 16) return "Enter a 16-digit demo card number.";
    if (method === "netbanking" && !form.bank) return "Select a bank to continue.";
    if (method === "wallet" && !form.wallet) return "Select a wallet to continue.";
    return "";
  }

  function pay() {
    const validation = validate();
    if (validation) { setError(validation); return; }
    setProcessing(true);
    setError("");
    window.setTimeout(() => {
      const booking = createBooking({
        train: selectedTrain,
        passengers,
        selectedSeats,
        userEmail: user?.email ?? null,
        userId: user?.id ?? null,
        fare,
        paymentMethod: METHODS.find((item) => item.id === method)?.label ?? method,
      });
      sessionStorage.setItem("railmitra-latest-booking", booking.bookingId);
      navigate(`/booking-success/${booking.bookingId}`, { replace: true });
    }, 1100);
  }

  return (
    <section className="payment-page">
      <div className="container">
        <button className="payment-back" type="button" onClick={() => navigate("/summary")}>← Back to summary</button>
        <header className="payment-header">
          <div><span className="eyebrow">Booking step 04 / 05</span><h1>Complete your booking.</h1><p>Your payment is simulated securely for this frontend demo. No real money is charged.</p></div>
          <div className="payment-demo-badge"><Icon name="shield" size={17} /> Demo payment</div>
        </header>

        <div className="payment-progress"><span className="done">✓ Passengers</span><i /><span className="done">✓ Seats</span><i /><span className="done">✓ Summary</span><i className="active" /><span className="active">4 Payment</span></div>

        <div className="payment-grid">
          <main className="payment-main">
            <section className="payment-card">
              <div className="payment-card-head"><div><span className="eyebrow">Choose method</span><h2>How would you like to pay?</h2></div></div>
              <div className="payment-methods">
                {METHODS.map((item) => (
                  <button key={item.id} type="button" className={`payment-method ${method === item.id ? "selected" : ""}`} onClick={() => { setMethod(item.id); setError(""); }}>
                    <span className="payment-method-icon"><Icon name={item.icon} size={19} /></span><span><strong>{item.label}</strong><small>{item.hint}</small></span>{method === item.id && <span className="payment-radio">✓</span>}
                  </button>
                ))}
              </div>

              <div className="payment-form">
                {method === "upi" && <label>UPI ID<input value={form.upi} onChange={(e) => update("upi", e.target.value)} placeholder="yourname@upi" autoComplete="off" /></label>}
                {method === "card" && <><label>Card number<input inputMode="numeric" value={form.card} onChange={(e) => update("card", e.target.value.replace(/\D/g, "").slice(0,16))} placeholder="1234 5678 9012 3456" /></label><div className="payment-two"><label>Expiry<input placeholder="MM/YY" /></label><label>CVV<input inputMode="numeric" maxLength="3" placeholder="•••" /></label></div></>}
                {method === "netbanking" && <label>Bank<select value={form.bank} onChange={(e) => update("bank", e.target.value)}><option value="">Select your bank</option><option>State Bank of India</option><option>HDFC Bank</option><option>ICICI Bank</option><option>Axis Bank</option></select></label>}
                {method === "wallet" && <label>Wallet<select value={form.wallet} onChange={(e) => update("wallet", e.target.value)}><option value="">Select your wallet</option><option>Paytm Wallet</option><option>Mobikwik</option><option>Amazon Pay</option></select></label>}
                {error && <p className="payment-error">{error}</p>}
                <button type="button" className="btn btn-primary btn-block payment-pay" onClick={pay} disabled={processing}>{processing ? <><span className="payment-spinner" /> Processing payment…</> : <>Pay ₹{fare.total.toLocaleString("en-IN")} <Icon name="arrowRight" size={18} /></>}</button>
                <p className="payment-secure"><Icon name="shield" size={14} /> Demo only — no real payment gateway is connected.</p>
              </div>
            </section>
          </main>

          <aside className="payment-order">
            <span className="eyebrow">Order summary</span><h2>{selectedTrain.name}</h2><span className="payment-train-number">{selectedTrain.trainNumber} · {selectedTrain.selectedClassLabel}</span>
            <div className="payment-route"><strong>{selectedTrain.fromStation?.name ?? selectedTrain.from}</strong><span>→</span><strong>{selectedTrain.toStation?.name ?? selectedTrain.to}</strong></div>
            <div className="payment-order-line"><span>Passengers</span><strong>{passengers.length}</strong></div><div className="payment-order-line"><span>Seats</span><strong>{selectedSeats.length}</strong></div><div className="payment-order-line"><span>Fare</span><strong>₹{fare.passengerSubtotal.toLocaleString("en-IN")}</strong></div><div className="payment-order-line"><span>Taxes & charges</span><strong>₹{(fare.taxes + fare.bookingCharge).toLocaleString("en-IN")}</strong></div>
            <div className="payment-total"><span>Total</span><strong>₹{fare.total.toLocaleString("en-IN")}</strong></div>
          </aside>
        </div>
      </div>
    </section>
  );
}
