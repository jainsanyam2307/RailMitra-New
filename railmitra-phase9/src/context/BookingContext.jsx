import { createContext, useContext, useMemo, useState } from "react";

const BookingContext = createContext(null);
const STORAGE_KEY = "railmitra-passengers";
const SEATS_STORAGE_KEY = "railmitra-selected-seats";

function readSelectedSeats() {
  try {
    const raw = sessionStorage.getItem(SEATS_STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    sessionStorage.removeItem(SEATS_STORAGE_KEY);
    return [];
  }
}

function readPassengers() {
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    sessionStorage.removeItem(STORAGE_KEY);
    return [];
  }
}

export function BookingProvider({ children }) {
  const [passengers, setPassengersState] = useState(readPassengers);
  const [selectedSeats, setSelectedSeatsState] = useState(readSelectedSeats);

  function setPassengers(nextPassengers) {
    setPassengersState(nextPassengers);
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(nextPassengers));
  }

  function setSelectedSeats(nextSeats) {
    setSelectedSeatsState(nextSeats);
    sessionStorage.setItem(SEATS_STORAGE_KEY, JSON.stringify(nextSeats));
  }

  function clearPassengers() {
    setPassengersState([]);
    sessionStorage.removeItem(STORAGE_KEY);
    setSelectedSeatsState([]);
    sessionStorage.removeItem(SEATS_STORAGE_KEY);
  }

  const value = useMemo(
    () => ({ passengers, setPassengers, clearPassengers, selectedSeats, setSelectedSeats }),
    [passengers, selectedSeats]
  );

  return <BookingContext.Provider value={value}>{children}</BookingContext.Provider>;
}

export function useBooking() {
  const context = useContext(BookingContext);
  if (!context) {
    throw new Error("useBooking must be used inside BookingProvider");
  }
  return context;
}
