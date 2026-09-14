import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Icon from "../common/Icon.jsx";
import { STATIONS, TRAVEL_CLASSES } from "../../data/stations.js";
import { buildSearchParams } from "../../services/trainService.js";
import { todayISO } from "../../utils/date.js";
import "./SearchForm.css";

const initialState = {
  from: "",
  to: "",
  date: todayISO(),
  travelClass: "SL",
};

export default function SearchForm() {
  const navigate = useNavigate();
  const [form, setForm] = useState(initialState);
  const [error, setError] = useState("");

  function updateField(field, value) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  function swapStations() {
    setForm((prev) => ({ ...prev, from: prev.to, to: prev.from }));
  }

  function handleSubmit(event) {
    event.preventDefault();

    if (!form.from || !form.to) {
      setError("Please select both a departure and destination station.");
      return;
    }
    if (form.from === form.to) {
      setError("Departure and destination stations can't be the same.");
      return;
    }

    setError("");
    // Train search itself isn't implemented yet (Phase 2) — we just carry
    // the chosen criteria over as query params.
    const params = buildSearchParams(form);
    navigate(`/trains?${params.toString()}`);
  }

  return (
    <form className="search-form" onSubmit={handleSubmit} noValidate>
      <div className="search-form-row">
        <div className="search-field">
          <label htmlFor="from-station">From</label>
          <select
            id="from-station"
            value={form.from}
            onChange={(e) => updateField("from", e.target.value)}
            aria-describedby={error ? "search-form-error" : undefined}
          >
            <option value="">Select departure station</option>
            {STATIONS.map((station) => (
              <option key={station.code} value={station.code}>
                {station.name} ({station.code})
              </option>
            ))}
          </select>
        </div>

        <button
          type="button"
          className="search-swap"
          onClick={swapStations}
          aria-label="Swap departure and destination stations"
        >
          <Icon name="swap" size={18} />
        </button>

        <div className="search-field">
          <label htmlFor="to-station">To</label>
          <select
            id="to-station"
            value={form.to}
            onChange={(e) => updateField("to", e.target.value)}
          >
            <option value="">Select destination station</option>
            {STATIONS.map((station) => (
              <option key={station.code} value={station.code}>
                {station.name} ({station.code})
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="search-form-row">
        <div className="search-field">
          <label htmlFor="journey-date">Journey Date</label>
          <input
            id="journey-date"
            type="date"
            min={todayISO()}
            value={form.date}
            onChange={(e) => updateField("date", e.target.value)}
          />
        </div>

        <div className="search-field">
          <label htmlFor="travel-class">Class</label>
          <select
            id="travel-class"
            value={form.travelClass}
            onChange={(e) => updateField("travelClass", e.target.value)}
          >
            {TRAVEL_CLASSES.map((cls) => (
              <option key={cls.code} value={cls.code}>
                {cls.label}
              </option>
            ))}
          </select>
        </div>

        <button type="submit" className="btn btn-primary search-submit">
          <Icon name="search" size={18} />
          Search Trains
        </button>
      </div>

      {error && (
        <p className="search-form-error" id="search-form-error" role="alert">
          {error}
        </p>
      )}
    </form>
  );
}
