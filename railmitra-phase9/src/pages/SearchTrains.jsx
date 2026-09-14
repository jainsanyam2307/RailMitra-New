import { useMemo, useState } from "react";
import { Link, useSearchParams, useNavigate } from "react-router-dom";
import Icon from "../components/common/Icon.jsx";
import { TRAVEL_CLASSES } from "../data/stations.js";
import {
  durationToMinutes,
  searchTrains,
  saveSelectedTrain,
  timeToMinutes,
} from "../services/trainService.js";
import "./SearchTrains.css";

const SORT_OPTIONS = [
  { value: "recommended", label: "Recommended" },
  { value: "cheapest", label: "Cheapest" },
  { value: "fastest", label: "Fastest" },
  { value: "earliest", label: "Earliest departure" },
];

const AVAILABILITY_OPTIONS = [
  { value: "all", label: "All availability" },
  { value: "available", label: "Available" },
  { value: "limited", label: "Limited seats" },
];

function formatJourneyDate(date) {
  if (!date) return "";
  const parsed = new Date(`${date}T00:00:00`);
  if (Number.isNaN(parsed.getTime())) return date;
  return new Intl.DateTimeFormat("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(parsed);
}

function formatCurrency(value) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(value);
}

function TrainCard({ train, onSelect }) {
  return (
    <article className="train-card">
      <div className="train-card-top">
        <div className="train-identity">
          <div className="train-icon" aria-hidden="true">
            <Icon name="train" size={22} />
          </div>
          <div>
            <p className="train-number">{train.trainNumber}</p>
            <h2>{train.name}</h2>
            <span className="train-type">{train.type}</span>
          </div>
        </div>

        <div className={`availability availability-${train.availabilityStatus}`}>
          <span className="availability-dot" aria-hidden="true" />
          {train.availableSeats > 0
            ? `${train.availableSeats} seats available`
            : "Sold out"}
        </div>
      </div>

      <div className="train-route">
        <div className="train-time-point">
          <strong>{train.departure}</strong>
          <span>{train.fromStation?.code}</span>
          <small>{train.fromStation?.name}</small>
        </div>

        <div className="train-duration">
          <span>{train.duration}</span>
          <div className="route-line" aria-hidden="true">
            <span className="route-dot" />
            <span className="route-track" />
            <Icon name="train" size={15} />
            <span className="route-track" />
            <span className="route-dot" />
          </div>
          <span className="route-label">Journey</span>
        </div>

        <div className="train-time-point train-time-point-end">
          <strong>{train.arrival}</strong>
          <span>{train.toStation?.code}</span>
          <small>{train.toStation?.name}</small>
        </div>
      </div>

      <div className="train-card-bottom">
        <div className="train-fare">
          <span>Starting fare</span>
          <strong>{formatCurrency(train.fare)}</strong>
          <small>{train.selectedClassLabel}</small>
        </div>

        <button
          type="button"
          className="btn btn-primary"
          disabled={train.availableSeats <= 0}
          onClick={() => onSelect(train)}
        >
          Select Train
          <Icon name="arrowRight" size={17} />
        </button>
      </div>
    </article>
  );
}

function FilterPanel({
  selectedTypes,
  setSelectedTypes,
  availability,
  setAvailability,
  maxFare,
  setMaxFare,
  availableMaxFare,
}) {
  const trainTypes = ["Rajdhani", "Shatabdi", "Superfast", "Duronto", "Intercity"];

  function toggleType(type) {
    setSelectedTypes((current) =>
      current.includes(type) ? current.filter((item) => item !== type) : [...current, type]
    );
  }

  return (
    <aside className="search-filters">
      <div className="filters-heading">
        <div>
          <span className="eyebrow">Refine</span>
          <h2>Filters</h2>
        </div>
        <button
          type="button"
          className="filter-reset"
          onClick={() => {
            setSelectedTypes([]);
            setAvailability("all");
            setMaxFare(availableMaxFare);
          }}
        >
          Reset
        </button>
      </div>

      <fieldset className="filter-group">
        <legend>Train type</legend>
        {trainTypes.map((type) => (
          <label className="filter-check" key={type}>
            <input
              type="checkbox"
              checked={selectedTypes.includes(type)}
              onChange={() => toggleType(type)}
            />
            <span>{type}</span>
          </label>
        ))}
      </fieldset>

      <fieldset className="filter-group">
        <legend>Availability</legend>
        {AVAILABILITY_OPTIONS.map((option) => (
          <label className="filter-radio" key={option.value}>
            <input
              type="radio"
              name="availability"
              value={option.value}
              checked={availability === option.value}
              onChange={(event) => setAvailability(event.target.value)}
            />
            <span>{option.label}</span>
          </label>
        ))}
      </fieldset>

      <fieldset className="filter-group">
        <legend>Maximum fare</legend>
        <div className="fare-range">
          <input
            type="range"
            min="0"
            max={availableMaxFare}
            step="50"
            value={maxFare}
            onChange={(event) => setMaxFare(Number(event.target.value))}
            aria-label="Maximum fare"
          />
          <div>
            <span>₹0</span>
            <strong>{formatCurrency(maxFare)}</strong>
          </div>
        </div>
      </fieldset>
    </aside>
  );
}

export default function SearchTrains() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const from = searchParams.get("from") || "";
  const to = searchParams.get("to") || "";
  const date = searchParams.get("date") || "";
  const travelClass = searchParams.get("class") || "SL";

  const baseResults = useMemo(
    () => searchTrains({ from, to, date, travelClass }),
    [from, to, date, travelClass]
  );

  const availableMaxFare = useMemo(
    () => Math.max(...baseResults.map((train) => train.fare), 0),
    [baseResults]
  );

  const [sortBy, setSortBy] = useState("recommended");
  const [selectedTypes, setSelectedTypes] = useState([]);
  const [availability, setAvailability] = useState("all");
  const [maxFare, setMaxFare] = useState(availableMaxFare);

  // Keep the range in sync when a new search produces a different fare ceiling.
  const effectiveMaxFare = Math.min(maxFare || availableMaxFare, availableMaxFare);

  const filteredResults = useMemo(() => {
    const filtered = baseResults.filter((train) => {
      const typeMatches =
        selectedTypes.length === 0 || selectedTypes.includes(train.type);
      const availabilityMatches =
        availability === "all" || train.availabilityStatus === availability;
      const fareMatches = train.fare <= effectiveMaxFare;

      return typeMatches && availabilityMatches && fareMatches;
    });

    return [...filtered].sort((a, b) => {
      if (sortBy === "cheapest") return a.fare - b.fare;
      if (sortBy === "fastest") {
        return durationToMinutes(a.duration) - durationToMinutes(b.duration);
      }
      if (sortBy === "earliest") {
        return timeToMinutes(a.departure) - timeToMinutes(b.departure);
      }

      // Recommended: prioritize available seats, then price, then duration.
      const availabilityScore = (train) =>
        train.availableSeats > 20 ? 2 : train.availableSeats > 0 ? 1 : 0;
      return (
        availabilityScore(b) - availabilityScore(a) ||
        a.fare - b.fare ||
        durationToMinutes(a.duration) - durationToMinutes(b.duration)
      );
    });
  }, [baseResults, selectedTypes, availability, effectiveMaxFare, sortBy]);

  function handleSelectTrain(train) {
    // Keep the selected train in both session storage and router state.
    // Router state makes the booking flow more reliable on mobile browsers.
    saveSelectedTrain(train);

    // Keep a stable train id in the URL as a fallback. This makes the
    // booking transition work even if browser/session state is unavailable.
    const params = new URLSearchParams({
      train: String(train.id),
      date: train.journeyDate || "",
      class: train.selectedClass || travelClass,
    });

    navigate(`/passengers?${params.toString()}`, {
      state: { selectedTrain: train },
    });
  }

  const hasSearch = Boolean(from && to && date && travelClass);
  const selectedClassLabel =
    TRAVEL_CLASSES.find((item) => item.code === travelClass)?.label || travelClass;

  if (!hasSearch) {
    return (
      <section className="search-page search-page-empty">
        <div className="container">
          <div className="search-empty-card">
            <span className="empty-icon">
              <Icon name="search" size={26} />
            </span>
            <span className="eyebrow">Train search</span>
            <h1>Where are you travelling?</h1>
            <p>
              Start from the RailMitra home page and enter your route, date and preferred class
              to see available trains.
            </p>
            <Link to="/" className="btn btn-primary">
              Search Trains
              <Icon name="arrowRight" size={17} />
            </Link>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="search-page">
      <div className="container">
        <div className="search-page-header">
          <div>
            <Link className="back-link" to="/">
              ← Change search
            </Link>
            <span className="eyebrow">Train search</span>
            <h1>
              {baseResults[0]?.fromStation?.name || from}
              <span className="route-arrow">→</span>
              {baseResults[0]?.toStation?.name || to}
            </h1>
            <div className="search-summary">
              <span>
                <Icon name="calendar" size={15} />
                {formatJourneyDate(date)}
              </span>
              <span>{selectedClassLabel}</span>
            </div>
          </div>

          <div className="search-result-count">
            <strong>{filteredResults.length}</strong>
            <span>{filteredResults.length === 1 ? "train found" : "trains found"}</span>
          </div>
        </div>

        <div className="search-toolbar">
          <div className="mobile-filter-label">
            <span className="eyebrow">Search results</span>
            <strong>{filteredResults.length} matching trains</strong>
          </div>
          <label className="sort-control">
            <span>Sort by</span>
            <select value={sortBy} onChange={(event) => setSortBy(event.target.value)}>
              {SORT_OPTIONS.map((option) => (
                <option value={option.value} key={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </label>
        </div>

        <div className="search-content">
          <FilterPanel
            selectedTypes={selectedTypes}
            setSelectedTypes={setSelectedTypes}
            availability={availability}
            setAvailability={setAvailability}
            maxFare={effectiveMaxFare}
            setMaxFare={setMaxFare}
            availableMaxFare={availableMaxFare}
          />

          <div className="train-results">
            {filteredResults.length > 0 ? (
              filteredResults.map((train) => (
                <TrainCard key={train.id} train={train} onSelect={handleSelectTrain} />
              ))
            ) : (
              <div className="no-results">
                <span className="empty-icon">
                  <Icon name="train" size={25} />
                </span>
                <span className="eyebrow">No matches</span>
                <h2>No trains match these filters</h2>
                <p>
                  Try removing a filter or changing your search criteria. RailMitra will show
                  the available mock services for your route.
                </p>
                <button
                  type="button"
                  className="btn btn-ghost"
                  onClick={() => {
                    setSelectedTypes([]);
                    setAvailability("all");
                    setMaxFare(availableMaxFare);
                  }}
                >
                  Clear filters
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
