// Mock coach/seat inventory used by the Phase 4 recommendation engine.
// The layout is deterministic so the same train always produces the same demo inventory.

const BERTH_CYCLE = [
  "Lower",
  "Middle",
  "Upper",
  "Lower",
  "Middle",
  "Upper",
  "Side Lower",
  "Side Upper",
];

const COACHES = ["S1", "S2", "S3"];

function seededBooked(trainNumber, coachIndex, seatNumber) {
  const seed = Number(String(trainNumber).replace(/\D/g, "").slice(-4) || 1234);
  const value = (seed + coachIndex * 37 + seatNumber * 17) % 19;
  return value === 0 || value === 7 || value === 13;
}

export function createSeatInventory(train) {
  const trainNumber = train?.trainNumber ?? "1234";
  const seats = [];

  COACHES.forEach((coachNo, coachIndex) => {
    for (let seatNumber = 1; seatNumber <= 72; seatNumber += 1) {
      const berthType = BERTH_CYCLE[(seatNumber - 1) % BERTH_CYCLE.length];
      const nearDoor = seatNumber <= 8 || seatNumber >= 65;

      seats.push({
        id: `${coachNo}-${seatNumber}`,
        coachNo,
        seatNumber,
        berthType,
        nearDoor,
        available: !seededBooked(trainNumber, coachIndex, seatNumber),
      });
    }
  });

  // Keep the inventory large enough for the demo even for unusual train numbers.
  return seats;
}
