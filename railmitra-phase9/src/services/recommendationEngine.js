import { getPassengerCategory } from "../utils/passengerUtils.js";
import { createSeatInventory } from "../data/seats.js";

const BERTH_SCORE = {
  Lower: 24,
  "Side Lower": 20,
  Middle: 8,
  Upper: 5,
  "Side Upper": 3,
};

function passengerPriority(passenger) {
  const category = getPassengerCategory(passenger.age);
  let score = 0;

  if (category?.code === "senior") score += 70;
  if (passenger.specialRequirement === "pregnant") score += 65;
  if (passenger.specialRequirement === "pwd") score += 65;

  return score;
}

function berthPreferenceScore(passenger, seat) {
  const category = getPassengerCategory(passenger.age);
  let score = BERTH_SCORE[seat.berthType] ?? 0;

  if (category?.code === "senior") {
    score += seat.berthType === "Lower" ? 70 : seat.berthType === "Side Lower" ? 55 : 0;
  }

  if (passenger.specialRequirement === "pregnant") {
    score += seat.berthType === "Lower" ? 75 : seat.berthType === "Side Lower" ? 60 : 0;
  }

  if (passenger.specialRequirement === "pwd") {
    score += seat.berthType === "Lower" ? 60 : seat.berthType === "Side Lower" ? 52 : 0;
    if (seat.nearDoor) score += 32;
  }

  if (seat.nearDoor && passenger.specialRequirement !== "none") score += 8;

  return score;
}

function seatCompatibility(passenger, seat) {
  return berthPreferenceScore(passenger, seat) + passengerPriority(passenger) / 10;
}

function compareSeats(a, b) {
  return a.coachNo.localeCompare(b.coachNo) || a.seatNumber - b.seatNumber;
}

function assignPassengersToSeats(passengers, seats) {
  const orderedPassengers = [...passengers].sort(
    (a, b) => passengerPriority(b) - passengerPriority(a)
  );
  const remaining = [...seats];
  const assignments = [];

  orderedPassengers.forEach((passenger) => {
    let bestIndex = 0;
    let bestScore = Number.NEGATIVE_INFINITY;

    remaining.forEach((seat, index) => {
      const score = seatCompatibility(passenger, seat);
      if (score > bestScore) {
        bestScore = score;
        bestIndex = index;
      }
    });

    const [seat] = remaining.splice(bestIndex, 1);
    assignments.push({ passenger, seat });
  });

  return assignments;
}

function contiguousBlocks(availableSeats, count) {
  const byCoach = new Map();
  availableSeats.forEach((seat) => {
    if (!byCoach.has(seat.coachNo)) byCoach.set(seat.coachNo, []);
    byCoach.get(seat.coachNo).push(seat);
  });

  const blocks = [];

  byCoach.forEach((coachSeats) => {
    coachSeats.sort((a, b) => a.seatNumber - b.seatNumber);

    for (let start = 0; start <= coachSeats.length - count; start += 1) {
      const block = coachSeats.slice(start, start + count);
      const contiguous = block.every(
        (seat, index) => index === 0 || seat.seatNumber === block[index - 1].seatNumber + 1
      );
      if (contiguous) blocks.push(block);
    }
  });

  return blocks;
}

function scoreArrangement(assignments, passengers) {
  const baseScore = assignments.reduce(
    (total, item) => total + seatCompatibility(item.passenger, item.seat),
    0
  );

  const coachCount = new Set(assignments.map((item) => item.seat.coachNo)).size;
  const sameCoachBonus = coachCount === 1 ? 70 : 0;

  let adjacencyBonus = 0;
  const sorted = [...assignments].sort((a, b) => compareSeats(a.seat, b.seat));
  for (let index = 1; index < sorted.length; index += 1) {
    if (
      sorted[index].seat.coachNo === sorted[index - 1].seat.coachNo &&
      sorted[index].seat.seatNumber === sorted[index - 1].seat.seatNumber + 1
    ) {
      adjacencyBonus += 38;
    }
  }

  const groupBonus = passengers.length > 1 ? sameCoachBonus + adjacencyBonus : 0;
  return baseScore + groupBonus;
}

function buildExplanation(assignments, passengers) {
  const reasons = [];
  const senior = passengers.some((p) => getPassengerCategory(p.age)?.code === "senior");
  const pwd = passengers.some((p) => p.specialRequirement === "pwd");
  const pregnant = passengers.some((p) => p.specialRequirement === "pregnant");

  if (passengers.length > 1) reasons.push("keeps the group in the same coach where possible");
  if (passengers.length > 1 && new Set(assignments.map((item) => item.seat.coachNo)).size === 1) {
    reasons.push("prioritizes nearby seats for the group");
  }
  if (senior) reasons.push("prioritizes a lower berth for the senior citizen");
  if (pwd) reasons.push("considers a lower/near-door seat for accessibility");
  if (pregnant) reasons.push("prioritizes a lower berth for the pregnant passenger");

  if (reasons.length === 0) reasons.push("selects the highest-scoring available seats");

  return `Recommended because it ${reasons.join(" and ")}.`;
}

function optionKey(assignments) {
  return assignments
    .slice()
    .sort((a, b) => a.passenger.id.localeCompare(b.passenger.id))
    .map((item) => `${item.passenger.id}:${item.seat.id}`)
    .join("|");
}

function makeOption(assignments, passengers, label = "Recommended arrangement") {
  return {
    id: optionKey(assignments),
    label,
    score: Math.round(scoreArrangement(assignments, passengers)),
    assignments: assignments.map((item) => ({
      passengerId: item.passenger.id,
      passengerName: item.passenger.name,
      seat: item.seat,
    })),
    explanation: buildExplanation(assignments, passengers),
  };
}

export function recommendSeats({ train, passengers }) {
  const inventory = createSeatInventory(train);
  const seatPassengers = passengers.filter((passenger) => Number(passenger.age) > 5);
  const infants = passengers.filter((passenger) => Number(passenger.age) <= 5);

  if (seatPassengers.length === 0) {
    return {
      inventory,
      recommendedOption: {
        id: "infants-only",
        label: "No seat required",
        score: 100,
        assignments: [],
        explanation: "All travelling passengers are infants (0–5), so RailMitra does not assign seats.",
      },
      alternatives: [],
      infants,
    };
  }

  const available = inventory.filter((seat) => seat.available);
  if (available.length < seatPassengers.length) {
    return {
      inventory,
      recommendedOption: null,
      alternatives: [],
      infants,
      error: "There are not enough available seats for this booking.",
    };
  }

  const options = [];

  if (seatPassengers.length === 1) {
    const passenger = seatPassengers[0];
    const ranked = [...available].sort(
      (a, b) => berthPreferenceScore(passenger, b) - berthPreferenceScore(passenger, a)
    );
    ranked.slice(0, 8).forEach((seat) => {
      options.push(makeOption([{ passenger, seat }], seatPassengers));
    });
  } else {
    const blocks = contiguousBlocks(available, seatPassengers.length);
    blocks.slice(0, 60).forEach((block) => {
      const assignments = assignPassengersToSeats(seatPassengers, block);
      options.push(makeOption(assignments, seatPassengers));
    });

    // If a completely contiguous block is not available, compare a few best nearby-seat
    // arrangements within the same coach before falling back to any available seats.
    if (options.length === 0) {
      const coachGroups = new Map();
      available.forEach((seat) => {
        if (!coachGroups.has(seat.coachNo)) coachGroups.set(seat.coachNo, []);
        coachGroups.get(seat.coachNo).push(seat);
      });
      coachGroups.forEach((coachSeats) => {
        const candidates = coachSeats
          .sort((a, b) => a.seatNumber - b.seatNumber)
          .slice(0, Math.max(seatPassengers.length + 8, 12));
        if (candidates.length >= seatPassengers.length) {
          options.push(makeOption(assignPassengersToSeats(seatPassengers, candidates), seatPassengers));
        }
      });
    }
  }

  if (options.length === 0) {
    const assignments = assignPassengersToSeats(seatPassengers, available.slice(0, seatPassengers.length));
    options.push(makeOption(assignments, seatPassengers));
  }

  const unique = new Map();
  options.forEach((option) => {
    if (!unique.has(option.id)) unique.set(option.id, option);
  });

  const rankedOptions = [...unique.values()].sort((a, b) => b.score - a.score);

  return {
    inventory,
    recommendedOption: rankedOptions[0],
    alternatives: rankedOptions.slice(1, 4).map((option, index) => ({
      ...option,
      label: `Alternative ${index + 1}`,
    })),
    infants,
  };
}
