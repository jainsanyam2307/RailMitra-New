import { useMemo } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Icon from "../components/common/Icon.jsx";
import { getBookingById } from "../services/bookingService.js";
import "./BookingSuccess.css";

function formatDate(value){if(!value)return "—";const d=new Date(`${value}T00:00:00`);return Number.isNaN(d.getTime())?value:new Intl.DateTimeFormat("en-IN",{day:"2-digit",month:"short",year:"numeric"}).format(d)}

export default function BookingSuccess(){
 const {bookingId}=useParams(); const navigate=useNavigate(); const booking=useMemo(()=>getBookingById(bookingId),[bookingId]);
 if(!booking)return <section className="success-page"><div className="container success-missing"><h1>Booking not found.</h1><button className="btn btn-primary" onClick={()=>navigate("/")}>Go home</button></div></section>;
 const train=booking.train;
 return <section className="success-page"><div className="container">
   <div className="success-hero"><div className="success-icon"><Icon name="check" size={34}/></div><span className="eyebrow">Payment successful</span><h1>Your journey is confirmed.</h1><p>RailMitra has created your booking. Keep the booking ID handy for your ticket.</p></div>
   <div className="success-card"><div className="success-booking-id"><span>Booking ID</span><strong>{booking.bookingId}</strong><small>Transaction: {booking.transactionId}</small></div><div className="success-status">✓ Confirmed</div></div>
   <div className="success-grid"><main className="success-main"><section className="success-panel"><div className="success-panel-head"><div><span className="eyebrow">Journey</span><h2>{train.name}</h2></div><span className="success-chip">{train.trainNumber}</span></div><div className="success-route"><div><strong>{train.departure}</strong><span>{train.fromStation?.name ?? train.from}</span></div><i>→</i><div><strong>{train.arrival}</strong><span>{train.toStation?.name ?? train.to}</span></div></div><div className="success-meta"><span><b>Date</b>{formatDate(train.journeyDate)}</span><span><b>Class</b>{train.selectedClassLabel}</span><span><b>Payment</b>{booking.paymentMethod}</span></div></section>
   <section className="success-panel"><div className="success-panel-head"><div><span className="eyebrow">Passengers</span><h2>{booking.passengers.length} passenger{booking.passengers.length!==1?"s":""}</h2></div></div><div className="success-passengers">{booking.passengers.map((p)=>{const seat=booking.selectedSeats.find(s=>s.passengerId===p.id)?.seat;return <div key={p.id}><span>{p.name}</span><small>{p.age} yrs · {p.gender}</small><strong>{seat?`${seat.coachNo} · ${seat.seatNumber}`:"No seat"}</strong></div>})}</div></section></main><aside className="success-side"><span className="eyebrow">Paid amount</span><strong className="success-total">₹{booking.fare.total.toLocaleString("en-IN")}</strong><span className="success-paid">✓ Payment {booking.paymentStatus}</span><button className="btn btn-primary btn-block" onClick={()=>navigate(`/ticket/${booking.bookingId}`)}>View E-Ticket <Icon name="arrowRight" size={17}/></button><button className="btn btn-ghost btn-block" onClick={()=>navigate("/my-bookings")}>My Bookings</button></aside></div>
 </div></section>
}
