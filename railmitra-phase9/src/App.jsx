import { Route, Routes } from "react-router-dom";
import MainLayout from "./components/layout/MainLayout.jsx";
import Home from "./pages/Home.jsx";
import SearchTrains from "./pages/SearchTrains.jsx";
import PassengerDetails from "./pages/PassengerDetails.jsx";
import MyBookings from "./pages/MyBookings.jsx";
import Login from "./pages/Login.jsx";
import Register from "./pages/Register.jsx";
import NotFound from "./pages/NotFound.jsx";
import Recommendation from "./pages/Recommendation.jsx";
import BookingSummary from "./pages/BookingSummary.jsx";
import Payment from "./pages/Payment.jsx";
import BookingSuccess from "./pages/BookingSuccess.jsx";
import Ticket from "./pages/Ticket.jsx";
import Profile from "./pages/Profile.jsx";

export default function App() {
  return (
    <Routes>
      <Route element={<MainLayout />}>
        <Route index element={<Home />} />
        <Route path="trains" element={<SearchTrains />} />
        <Route path="passengers" element={<PassengerDetails />} />
        <Route path="recommendation" element={<Recommendation />} />
        <Route path="summary" element={<BookingSummary />} />
        <Route path="payment" element={<Payment />} />
        <Route path="booking-success/:bookingId" element={<BookingSuccess />} />
        <Route path="ticket/:bookingId" element={<Ticket />} />
        <Route path="my-bookings" element={<MyBookings />} />
        <Route path="profile" element={<Profile />} />
        <Route path="login" element={<Login />} />
        <Route path="register" element={<Register />} />
        <Route path="*" element={<NotFound />} />
      </Route>
    </Routes>
  );
}
