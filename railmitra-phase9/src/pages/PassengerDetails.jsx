import { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate, useSearchParams } from "react-router-dom";
import Icon from "../components/common/Icon.jsx";
import { useBooking } from "../context/BookingContext.jsx";
import { getSelectedTrain, getTrainById, getStation, getTravelClass } from "../services/trainService.js";
import {
  createEmptyPassenger,
  getPassengerCategory,
  getSpecialRequirementLabel,
} from "../utils/passengerUtils.js";
import "./PassengerDetails.css";

const ID_PROOF_OPTIONS = [
  { value: "aadhaar", label: "Aadhaar Card" },
  { value: "passport", label: "Passport" },
  { value: "driving-license", label: "Driving Licence" },
  { value: "voter-id", label: "Voter ID" },
];

const SPECIAL_REQUIREMENTS = [
  { value: "none", label: "None" },
  { value: "pwd", label: "Person with Disability" },
  { value: "pregnant", label: "Pregnant Woman" },
];

function PassengerCard({ passenger, index, onChange, onRemove, canRemove }) {
  const category = getPassengerCategory(passenger.age);

  function update(field, value) {
    onChange(passenger.id, field, value);
  }

  return (
    <article className="passenger-card">
      <div className="passenger-card-head">
        <div>
          <span className="eyebrow">Passenger {String(index + 1).padStart(2, "0")}</span>
          <h2>{passenger.name.trim() || "Passenger details"}</h2>
        </div>
        {canRemove && (
          <button
            type="button"
            className="passenger-remove"
            onClick={() => onRemove(passenger.id)}
            aria-label={`Remove passenger ${index + 1}`}
          >
            <Icon name="close" size={18} />
            Remove
          </button>
        )}
      </div>

      <div className="passenger-form-grid">
        <div className="passenger-field passenger-field-wide">
          <label htmlFor={`name-${passenger.id}`}>Full Name *</label>
          <input
            id={`name-${passenger.id}`}
            type="text"
            value={passenger.name}
            onChange={(event) => update("name", event.target.value)}
            placeholder="Enter passenger name"
            autoComplete="name"
          />
        </div>

        <div className="passenger-field">
          <label htmlFor={`age-${passenger.id}`}>Age *</label>
          <input
            id={`age-${passenger.id}`}
            type="number"
            min="0"
            max="120"
            value={passenger.age}
            onChange={(event) => update("age", event.target.value)}
            placeholder="Age"
          />
        </div>

        <div className="passenger-field">
          <label htmlFor={`gender-${passenger.id}`}>Gender *</label>
          <select
            id={`gender-${passenger.id}`}
            value={passenger.gender}
            onChange={(event) => update("gender", event.target.value)}
          >
            <option value="">Select gender</option>
            <option value="male">Male</option>
            <option value="female">Female</option>
            <option value="other">Other</option>
          </select>
        </div>

        <div className="passenger-field">
          <label htmlFor={`food-${passenger.id}`}>Food Preference</label>
          <select
            id={`food-${passenger.id}`}
            value={passenger.foodPreference}
            onChange={(event) => update("foodPreference", event.target.value)}
          >
            <option value="Vegetarian">Vegetarian</option>
            <option value="Jain">Jain</option>
            <option value="Non-Vegetarian">Non-Vegetarian</option>
            <option value="No Preference">No Preference</option>
          </select>
        </div>

        <div className="passenger-field">
          <label htmlFor={`special-${passenger.id}`}>Special Requirement</label>
          <select
            id={`special-${passenger.id}`}
            value={passenger.specialRequirement}
            onChange={(event) => update("specialRequirement", event.target.value)}
          >
            {SPECIAL_REQUIREMENTS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>

        <div className="passenger-field">
          <label htmlFor={`proof-type-${passenger.id}`}>ID Proof *</label>
          <select
            id={`proof-type-${passenger.id}`}
            value={passenger.idProofType}
            onChange={(event) => update("idProofType", event.target.value)}
          >
            <option value="">Select ID proof</option>
            {ID_PROOF_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>

        <div className="passenger-field passenger-field-wide">
          <label htmlFor={`proof-number-${passenger.id}`}>ID Proof Number *</label>
          <input
            id={`proof-number-${passenger.id}`}
            type="text"
            value={passenger.idProofNumber}
            onChange={(event) => update("idProofNumber", event.target.value)}
            placeholder="Enter ID proof number"
          />
        </div>
      </div>

      <div className="passenger-category" aria-live="polite">
        <div className="passenger-category-icon">
          <Icon name={category?.code === "senior" ? "priority" : "user"} size={20} />
        </div>
        <div>
          <span className="passenger-category-label">Automatically detected category</span>
          <strong>{category?.label ?? "Enter age to detect category"}</strong>
          {category && <span>{category.description}</span>}
        </div>
        {category?.lowerBerthPriority && (
          <span className="priority-chip">Lower berth priority</span>
        )}
        {passenger.specialRequirement !== "none" && (
          <span className="special-chip">{getSpecialRequirementLabel(passenger.specialRequirement)}</span>
        )}
      </div>
    </article>
  );
}

function validatePassengers(passengers) {
  const errors = {};

  passengers.forEach((passenger, index) => {
    const fieldErrors = {};
    const age = Number(passenger.age);

    if (!passenger.name.trim()) fieldErrors.name = "Name is required.";
    if (passenger.age === "" || !Number.isInteger(age) || age < 0 || age > 120) {
      fieldErrors.age = "Enter a valid age from 0 to 120.";
    }
    if (!passenger.gender) fieldErrors.gender = "Select a gender.";
    if (!passenger.idProofType) fieldErrors.idProofType = "Select an ID proof.";
    if (!passenger.idProofNumber.trim()) fieldErrors.idProofNumber = "ID proof number is required.";

    if (Object.keys(fieldErrors).length > 0) errors[passenger.id] = fieldErrors;

    // Keep the index useful while debugging invalid form submissions.
    void index;
  });

  return errors;
}

export default function PassengerDetails() {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const { passengers: savedPassengers, setPassengers } = useBooking();

  const selectedTrain = useMemo(() => {
    // Preferred: router state from Select Train.
    if (location.state?.selectedTrain) return location.state.selectedTrain;

    // Fallback: rebuild the selected result from URL parameters.
    const trainId = searchParams.get("train");
    const date = searchParams.get("date") || "";
    const travelClass = searchParams.get("class") || "";

    if (trainId) {
      const baseTrain = getTrainById(trainId);
      const classInfo = baseTrain?.classOptions?.[travelClass];
      if (baseTrain && classInfo) {
        return {
          ...baseTrain,
          journeyDate: date,
          selectedClass: travelClass,
          selectedClassLabel: getTravelClass(travelClass)?.label ?? travelClass,
          fare: classInfo.fare,
          availableSeats: classInfo.availableSeats,
          fromStation: getStation(baseTrain.from),
          toStation: getStation(baseTrain.to),
        };
      }
    }

    // Final fallback for an already-open booking tab.
    return getSelectedTrain();
  }, [location.state, searchParams]);
  const [passengers, setLocalPassengers] = useState(
    savedPassengers.length > 0 ? savedPassengers : [createEmptyPassenger()]
  );
  const [errors, setErrors] = useState({});
  const [formError, setFormError] = useState("");


  if (!selectedTrain) {
    return (
      <section className="passenger-page">
        <div className="container">
          <div className="passenger-recovery" role="alert">
            <span className="eyebrow">Booking session</span>
            <h1>We couldn't restore this train</h1>
            <p>Please return to the train results and select the train again.</p>
            <button type="button" className="btn btn-primary" onClick={() => navigate("/trains")}>
              Back to Train Results
            </button>
          </div>
        </div>
      </section>
    );
  }

  function updatePassenger(id, field, value) {
    setLocalPassengers((current) =>
      current.map((passenger) =>
        passenger.id === id ? { ...passenger, [field]: value } : passenger
      )
    );
    setErrors((current) => {
      if (!current[id]?.[field]) return current;
      const next = { ...current };
      const passengerErrors = { ...next[id] };
      delete passengerErrors[field];
      if (Object.keys(passengerErrors).length === 0) delete next[id];
      else next[id] = passengerErrors;
      return next;
    });
    setFormError("");
  }

  function addPassenger() {
    setLocalPassengers((current) => [...current, createEmptyPassenger()]);
  }

  function removePassenger(id) {
    setLocalPassengers((current) => current.filter((passenger) => passenger.id !== id));
    setErrors((current) => {
      const next = { ...current };
      delete next[id];
      return next;
    });
  }

  function handleContinue() {
    const nextErrors = validatePassengers(passengers);
    setErrors(nextErrors);

    if (Object.keys(nextErrors).length > 0) {
      setFormError("Please complete the highlighted passenger details before continuing.");
      window.scrollTo({ top: 180, behavior: "smooth" });
      return;
    }

    setPassengers(passengers);
    navigate("/recommendation");
  }

  return (
    <section className="passenger-page">
      <div className="container">
        <button type="button" className="passenger-back" onClick={() => navigate(-1)}>
          <span aria-hidden="true">←</span> Back to train results
        </button>

        <header className="passenger-page-header">
          <div>
            <span className="eyebrow">Booking step 02 / 04</span>
            <h1>Who is travelling?</h1>
            <p>
              Add passenger details once. RailMitra will automatically understand passenger
              categories and use them when recommending seats.
            </p>
          </div>

          <div className="journey-mini-card">
            <span className="journey-mini-label">Selected train</span>
            <strong>{selectedTrain.name}</strong>
            <span>
              {selectedTrain.fromStation?.name ?? selectedTrain.from} → {selectedTrain.toStation?.name ?? selectedTrain.to}
            </span>
            <span>{selectedTrain.journeyDate} · {selectedTrain.selectedClassLabel}</span>
          </div>
        </header>

        <div className="passenger-progress" aria-label="Booking progress">
          <span className="progress-step progress-step-active"><b>1</b> Passengers</span>
          <span className="progress-line" />
          <span className="progress-step"><b>2</b> Seats</span>
          <span className="progress-line" />
          <span className="progress-step"><b>3</b> Summary</span>
          <span className="progress-line" />
          <span className="progress-step"><b>4</b> Payment</span>
        </div>

        <div className="passenger-content">
          <div className="passenger-list">
            {passengers.map((passenger, index) => (
              <div key={passenger.id}>
                <PassengerCard
                  passenger={passenger}
                  index={index}
                  onChange={updatePassenger}
                  onRemove={removePassenger}
                  canRemove={passengers.length > 1}
                />
                {errors[passenger.id] && (
                  <div className="passenger-error-list" role="alert">
                    {Object.values(errors[passenger.id]).map((message) => (
                      <span key={message}>{message}</span>
                    ))}
                  </div>
                )}
              </div>
            ))}

            <button type="button" className="add-passenger-btn" onClick={addPassenger}>
              <span>+</span> Add another passenger
            </button>
          </div>

          <aside className="passenger-side-panel">
            <div className="smart-note">
              <div className="smart-note-icon"><Icon name="signal" size={20} /></div>
              <div>
                <span className="eyebrow">RailMitra intelligence</span>
                <h2>Seats will be recommended next</h2>
                <p>
                  We will use age, special requirements and group size to find the most suitable
                  available arrangement.
                </p>
              </div>
            </div>

            <div className="category-guide">
              <span className="eyebrow">Automatic categories</span>
              <div><strong>0–5 years</strong><span>Infant · Free / no seat</span></div>
              <div><strong>6–11 years</strong><span>Child · Half ticket</span></div>
              <div><strong>12–59 years</strong><span>Adult · Full ticket</span></div>
              <div><strong>60+ years</strong><span>Senior · Lower berth priority</span></div>
            </div>

            <div className="passenger-side-actions">
              {formError && <p className="form-error" role="alert">{formError}</p>}
              <button type="button" className="btn btn-primary btn-block" onClick={handleContinue}>
                Continue to Seat Recommendation
                <Icon name="arrowRight" size={18} />
              </button>
            </div>
          </aside>
        </div>
      </div>
    </section>
  );
}
