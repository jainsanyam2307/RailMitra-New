import { STATIONS, TRAVEL_CLASSES } from "../data/stations.js";
import { TRAINS } from "../data/trains.js";

const stationByCode = Object.fromEntries(STATIONS.map((station) => [station.code, station]));
const classByCode = Object.fromEntries(TRAVEL_CLASSES.map((travelClass) => [travelClass.code, travelClass]));

export function getStation(code) {
  return stationByCode[code] ?? null;
}

export function getTravelClass(code) {
  return classByCode[code] ?? null;
}

/**
 * Builds a query-string friendly search payload from the home search form.
 */
export function buildSearchParams({ from, to, date, travelClass }) {
  const params = new URLSearchParams();
  if (from) params.set("from", from);
  if (to) params.set("to", to);
  if (date) params.set("date", date);
  if (travelClass) params.set("class", travelClass);
  return params;
}

/**
 * Converts a duration such as "15h 40m" into minutes for sorting.
 */
export function durationToMinutes(duration) {
  const match = duration.match(/(?:(\d+)h)?\s*(?:(\d+)m)?/i);
  if (!match) return Number.POSITIVE_INFINITY;
  return Number(match[1] || 0) * 60 + Number(match[2] || 0);
}

/**
 * Converts HH:MM into minutes from midnight.
 */
export function timeToMinutes(time) {
  const [hours, minutes] = time.split(":").map(Number);
  return hours * 60 + minutes;
}

/**
 * Searches the local mock train dataset.
 *
 * The date is accepted as part of the search payload so a future backend can
 * use it for real availability. In Phase 2 the mock dataset returns the same
 * service pattern for any valid future date.
 */
export function searchTrains({ from, to, date, travelClass }) {
  const matching = TRAINS.filter((train) => {
    const routeMatches = train.from === from && train.to === to;
    const classMatches = Boolean(train.classOptions[travelClass]);
    return routeMatches && classMatches;
  });

  return matching.map((train) => {
    const classInfo = train.classOptions[travelClass];

    return {
      ...train,
      journeyDate: date,
      selectedClass: travelClass,
      selectedClassLabel: getTravelClass(travelClass)?.label ?? travelClass,
      fare: classInfo.fare,
      availableSeats: classInfo.availableSeats,
      availabilityStatus: getAvailabilityStatus(classInfo.availableSeats),
      fromStation: getStation(train.from),
      toStation: getStation(train.to),
    };
  });
}

export function getAvailabilityStatus(availableSeats) {
  if (availableSeats <= 0) return "unavailable";
  if (availableSeats <= 20) return "limited";
  return "available";
}

export function getTrainTypes(trains) {
  return [...new Set(trains.map((train) => train.type))];
}

export function getTrainById(id) {
  return TRAINS.find((train) => String(train.id) === String(id)) ?? null;
}

export function saveSelectedTrain(train) {
  sessionStorage.setItem("railmitra-selected-train", JSON.stringify(train));
}

export function getSelectedTrain() {
  const raw = sessionStorage.getItem("railmitra-selected-train");
  if (!raw) return null;

  try {
    return JSON.parse(raw);
  } catch {
    sessionStorage.removeItem("railmitra-selected-train");
    return null;
  }
}
