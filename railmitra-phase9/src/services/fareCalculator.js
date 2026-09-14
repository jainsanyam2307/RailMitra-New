import { getPassengerCategory } from "../utils/passengerUtils.js";

const BOOKING_CHARGE = 20;
const TAX_RATE = 0.05;

export function calculatePassengerFare(baseFare, passenger) {
  const category = getPassengerCategory(passenger.age);
  const multiplier = category?.fareMultiplier ?? 1;
  return Math.round(Number(baseFare || 0) * multiplier);
}

export function calculateFare({ baseFare, passengers }) {
  const passengerFares = passengers.map((passenger) => {
    const category = getPassengerCategory(passenger.age);
    const fare = calculatePassengerFare(baseFare, passenger);
    return {
      passengerId: passenger.id,
      passengerName: passenger.name,
      category: category?.label ?? "Passenger",
      categoryCode: category?.code ?? "adult",
      fare,
    };
  });

  const passengerSubtotal = passengerFares.reduce((sum, item) => sum + item.fare, 0);
  const taxes = Math.round(passengerSubtotal * TAX_RATE);
  const total = passengerSubtotal + taxes + (passengerSubtotal > 0 ? BOOKING_CHARGE : 0);

  return {
    baseFare: Number(baseFare || 0),
    passengerFares,
    passengerSubtotal,
    taxes,
    bookingCharge: passengerSubtotal > 0 ? BOOKING_CHARGE : 0,
    total,
  };
}

export { BOOKING_CHARGE, TAX_RATE };
