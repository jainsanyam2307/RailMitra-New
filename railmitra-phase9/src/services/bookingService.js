const BOOKINGS_KEY = "railmitra-bookings";

function readBookings() {
  try {
    const raw = localStorage.getItem(BOOKINGS_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    localStorage.removeItem(BOOKINGS_KEY);
    return [];
  }
}
function saveBookings(bookings) { localStorage.setItem(BOOKINGS_KEY, JSON.stringify(bookings)); }
function randomPart(length = 6) { const chars="ABCDEFGHJKLMNPQRSTUVWXYZ23456789"; let value=""; for(let i=0;i<length;i+=1)value+=chars[Math.floor(Math.random()*chars.length)]; return value; }
export function generateBookingId(){return `RLM-${randomPart(8)}`}
export function generateTransactionId(){return `TXN-RLM-${randomPart(10)}`}
export function createBooking(payload){const booking={...payload,bookingId:generateBookingId(),transactionId:generateTransactionId(),bookingDate:new Date().toISOString(),paymentStatus:"Paid",status:"Confirmed"};const bookings=readBookings();bookings.unshift(booking);saveBookings(bookings);return booking}
export function getBookings(userEmail=null){const bookings=readBookings();if(!userEmail)return bookings;return bookings.filter((booking)=>booking.userEmail===userEmail)}
export function getBookingById(id){return readBookings().find((booking)=>booking.bookingId===id)??null}
export function cancelBooking(id){const bookings=readBookings().map((booking)=>booking.bookingId===id?{...booking,status:"Cancelled"}:booking);saveBookings(bookings);return bookings.find((booking)=>booking.bookingId===id)??null}
