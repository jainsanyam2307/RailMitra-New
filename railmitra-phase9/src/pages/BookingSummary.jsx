import { useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import Icon from "../components/common/Icon.jsx";
import { useBooking } from "../context/BookingContext.jsx";
import { getSelectedTrain } from "../services/trainService.js";
import { calculateFare } from "../services/fareCalculator.js";
import { getPassengerCategory } from "../utils/passengerUtils.js";
import "./BookingSummary.css";

function formatDate(value) {
  if (!value) return "—";
  const date = new Date(`${value}T00:00:00`);
  if (Number.isNaN(date.getTime())) return value;
  return new Intl.DateTimeFormat("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(date);
}

function seatForPassenger(selectedSeats, passengerId) {
  return selectedSeats.find((item) => item.passengerId === passengerId)?.seat ?? null;
}

export default function BookingSummary() {
  const navigate = useNavigate();
  const { passengers, selectedSeats } = useBooking();
  const selectedTrain = useMemo(() => getSelectedTrain(), []);

  const fare = useMemo(
    () => calculateFare({ baseFare: selectedTrain?.fare ?? 0, passengers }),
    [selectedTrain, passengers]
  );

  useEffect(() => {
    if (!selectedTrain) {
      navigate("/trains", { replace: true });
      return;
    }
    if (passengers.length === 0) {
      navigate("/passengers", { replace: true });
    }
  }, [navigate, selectedTrain, passengers.length]);

  if (!selectedTrain || passengers.length === 0) return null;

  const seatPassengers = passengers.filter((passenger) => Number(passenger.age) > 5);
  const selectedSeatCount = selectedSeats.length;

  function handleEditPassengers() {
    navigate("/passengers");
  }

  function handleEditSeats() {
    navigate("/recommendation");
  }

  function handlePayment() {
    navigate("/payment");
  }

  return (
    <section className="summary-page">
      <div className="container">
        <button type="button" className="summary-back" onClick={() => navigate("/recommendation")}>
          ← Back to seat recommendation
        </button>

        <header className="summary-header">
          <div>
            <span className="eyebrow">Booking step 04 / 05</span>
            <h1>Review your journey.</h1>
            <p>Everything looks good? Check your passengers, seats and fare before moving to payment.</p>
          </div>
          <div className="summary-status">
            <Icon name="check" size={18} />
            <span>Ready for payment</span>
          </div>
        </header>

        <div className="summary-progress" aria-label="Booking progress">
          <span className="summary-progress-step summary-progress-done"><b>✓</b> Passengers</span>
          <span className="summary-progress-line summary-progress-done" />
          <span className="summary-progress-step summary-progress-done"><b>✓</b> Seats</span>
          <span className="summary-progress-line summary-progress-done" />
          <span className="summary-progress-step summary-progress-active"><b>3</b> Summary</span>
          <span className="summary-progress-line" />
          <span className="summary-progress-step"><b>4</b> Payment</span>
        </div>

        <div className="summary-grid">
          <main className="summary-main">
            <section className="summary-card journey-summary-card">
              <div className="summary-card-head">
                <div>
                  <span className="eyebrow">Journey</span>
                  <h2>{selectedTrain.name}</h2>
                </div>
                <span className="train-number-chip">{selectedTrain.trainNumber}</span>
              </div>

              <div className="journey-route">
                <div className="journey-station">
                  <strong>{selectedTrain.departure}</strong>
                  <span>{selectedTrain.fromStation?.name ?? selectedTrain.from}</span>
                </div>
                <div className="journey-line">
                  <span>{selectedTrain.duration}</span>
                  <i />
                </div>
                <div className="journey-station journey-station-right">
                  <strong>{selectedTrain.arrival}</strong>
                  <span>{selectedTrain.toStation?.name ?? selectedTrain.to}</span>
                </div>
              </div>

              <div className="journey-meta">
                <span><b>Date</b>{formatDate(selectedTrain.journeyDate)}</span>
                <span><b>Class</b>{selectedTrain.selectedClassLabel}</span>
                <span><b>Type</b>{selectedTrain.type}</span>
              </div>
            </section>

            <section className="summary-card">
              <div className="summary-card-head">
                <div>
                  <span className="eyebrow">Passengers & seats</span>
                  <h2>{passengers.length} passenger{passengers.length !== 1 ? "s" : ""}</h2>
                </div>
                <button type="button" className="summary-edit" onClick={handleEditPassengers}>Edit passengers</button>
              </div>

              <div className="passenger-summary-list">
                {passengers.map((passenger, index) => {
                  const category = getPassengerCategory(passenger.age);
                  const seat = seatForPassenger(selectedSeats, passenger.id);
                  const needsSeat = Number(passenger.age) > 5;
                  return (
                    <div className="passenger-summary-row" key={passenger.id}>
                      <div className="passenger-summary-number">{String(index + 1).padStart(2, "0")}</div>
                      <div className="passenger-summary-person">
                        <strong>{passenger.name}</strong>
                        <span>{passenger.age} yrs · {passenger.gender} · {category?.label}</span>
                      </div>
                      <div className="passenger-summary-seat">
                        {needsSeat ? (
                          seat ? <><strong>{seat.coachNo} · {seat.seatNumber}</strong><span>{seat.berthType}</span></> : <span className="missing-seat">Seat not selected</span>
                        ) : (
                          <><strong>No seat</strong><span>Infant · Free</span></>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="seat-summary-footer">
                <span>{selectedSeatCount} of {seatPassengers.length} required seats selected</span>
                <button type="button" className="summary-edit" onClick={handleEditSeats}>Edit seats</button>
              </div>
            </section>

            <section className="summary-info-grid">
              <div className="summary-info-card">
                <span className="summary-info-icon"><Icon name="signal" size={18} /></span>
                <div><strong>Smart recommendation applied</strong><p>Your seat choices came from RailMitra's recommendation engine or your manual selection.</p></div>
              </div>
              <div className="summary-info-card">
                <span className="summary-info-icon"><Icon name="check" size={18} /></span>
                <div><strong>Review before payment</strong><p>You can edit passengers or seats before proceeding. Payment is a demo in this version.</p></div>
              </div>
            </section>
          </main>

          <aside className="fare-card">
            <div className="fare-card-top">
              <span className="eyebrow">Fare breakdown</span>
              <h2>₹{fare.total.toLocaleString("en-IN")}</h2>
              <p>Total payable amount</p>
            </div>

            <div className="fare-lines">
              {fare.passengerFares.map((item) => (
                <div className="fare-line" key={item.passengerId}>
                  <span>{item.passengerName}<small>{item.category}</small></span>
                  <strong>₹{item.fare.toLocaleString("en-IN")}</strong>
                </div>
              ))}
              <div className="fare-divider" />
              <div className="fare-line"><span>Passenger subtotal</span><strong>₹{fare.passengerSubtotal.toLocaleString("en-IN")}</strong></div>
              <div className="fare-line"><span>Taxes & charges</span><strong>₹{fare.taxes.toLocaleString("en-IN")}</strong></div>
              <div className="fare-line"><span>Booking charge</span><strong>₹{fare.bookingCharge.toLocaleString("en-IN")}</strong></div>
            </div>

            <div className="fare-total">
              <span>Total</span>
              <strong>₹{fare.total.toLocaleString("en-IN")}</strong>
            </div>

            <button type="button" className="btn btn-primary btn-block summary-payment-btn" onClick={handlePayment}>
              Proceed to Payment <span aria-hidden="true">→</span>
            </button>
            <p className="fare-note">Secure demo checkout · No real payment will be processed.</p>
          </aside>
        </div>
      </div>
    </section>
  );
}
