import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import Icon from "../components/common/Icon.jsx";
import { useBooking } from "../context/BookingContext.jsx";
import { getSelectedTrain } from "../services/trainService.js";
import { recommendSeats } from "../services/recommendationEngine.js";
import { getPassengerCategory } from "../utils/passengerUtils.js";
import "./Recommendation.css";

function SeatButton({ seat, state, onSelect }) {
  return (
    <button
      type="button"
      className={`seat-button seat-${state}`}
      disabled={state === "booked"}
      onClick={() => onSelect(seat)}
      title={`${seat.coachNo}-${seat.seatNumber} · ${seat.berthType}`}
      aria-label={`${seat.coachNo} seat ${seat.seatNumber}, ${seat.berthType}, ${state}`}
    >
      <span>{seat.seatNumber}</span>
      <small>{seat.berthType.replace("Side ", "S ")}</small>
    </button>
  );
}

function OptionCard({ option, selected, onChoose }) {
  return (
    <button
      type="button"
      className={`recommendation-option ${selected ? "recommendation-option-selected" : ""}`}
      onClick={() => onChoose(option)}
    >
      <div className="option-topline">
        <span className="option-label">{option.label}</span>
        {selected && <span className="option-selected">Selected</span>}
      </div>
      <div className="option-seats">
        {option.assignments.length === 0 ? (
          <span>No seat required</span>
        ) : (
          option.assignments.map((assignment) => (
            <span key={assignment.passengerId}>
              {assignment.passengerName.split(" ")[0]} · {assignment.seat.coachNo}-{assignment.seat.seatNumber}
            </span>
          ))
        )}
      </div>
      <p>{option.explanation}</p>
    </button>
  );
}

export default function Recommendation() {
  const navigate = useNavigate();
  const { passengers, setSelectedSeats } = useBooking();
  const selectedTrain = useMemo(() => getSelectedTrain(), []);
  const [selectedOption, setSelectedOption] = useState(null);
  const [manualSeats, setManualSeats] = useState([]);

  const result = useMemo(() => {
    if (!selectedTrain || passengers.length === 0) return null;
    return recommendSeats({ train: selectedTrain, passengers });
  }, [selectedTrain, passengers]);

  useEffect(() => {
    if (!selectedTrain || passengers.length === 0) {
      navigate("/passengers", { replace: true });
    }
  }, [navigate, selectedTrain, passengers.length]);

  useEffect(() => {
    if (result?.recommendedOption) setSelectedOption(result.recommendedOption);
  }, [result]);

  if (!selectedTrain || !result) return null;

  const selectedAssignmentIds = new Set(
    selectedOption?.assignments?.map((assignment) => assignment.seat.id) ?? []
  );
  const manualSeatIds = new Set(manualSeats.map((seat) => seat.id));
  const effectiveSelection = manualSeats.length > 0 ? manualSeats : (selectedOption?.assignments ?? []).map((item) => item.seat);

  function chooseOption(option) {
    setSelectedOption(option);
    setManualSeats([]);
  }

  function handleSeatSelect(seat) {
    if (seatPassengersCount() === 0) return;

    setSelectedOption(null);
    setManualSeats((current) => {
      if (current.some((item) => item.id === seat.id)) {
        return current.filter((item) => item.id !== seat.id);
      }
      if (current.length >= seatPassengersCount()) return current;
      return [...current, seat];
    });
  }

  function seatPassengersCount() {
    return passengers.filter((passenger) => Number(passenger.age) > 5).length;
  }

  function seatState(seat) {
    if (!seat.available) return "booked";
    if (manualSeatIds.has(seat.id)) return "selected";
    if (selectedAssignmentIds.has(seat.id)) return "recommended";
    return "available";
  }

  function handleContinue() {
    if (seatPassengersCount() > 0 && effectiveSelection.length !== seatPassengersCount()) return;

    const assignments = selectedOption?.assignments ?? [];
    const selectedSeats = manualSeats.length > 0
      ? manualSeats.map((seat, index) => ({
          passengerId: passengers.filter((p) => Number(p.age) > 5)[index]?.id,
          seat,
        }))
      : assignments;

    setSelectedSeats(selectedSeats);
    navigate("/summary");
  }

  const coachGroups = result.inventory.reduce((groups, seat) => {
    if (!groups[seat.coachNo]) groups[seat.coachNo] = [];
    groups[seat.coachNo].push(seat);
    return groups;
  }, {});

  return (
    <section className="recommendation-page">
      <div className="container">
        <button type="button" className="recommendation-back" onClick={() => navigate("/passengers")}>
          ← Back to passenger details
        </button>

        <header className="recommendation-header">
          <div>
            <span className="eyebrow">Booking step 03 / 05</span>
            <h1>Let RailMitra find the best seats.</h1>
            <p>
              The recommendation engine weighs passenger needs, berth preference and group proximity before ranking the available seats.
            </p>
          </div>
          <div className="recommendation-train-card">
            <span>{selectedTrain.trainNumber} · {selectedTrain.selectedClassLabel}</span>
            <strong>{selectedTrain.name}</strong>
            <small>{selectedTrain.fromStation?.name} → {selectedTrain.toStation?.name}</small>
          </div>
        </header>

        <div className="recommendation-progress" aria-label="Booking progress">
          <span className="progress-step progress-step-done"><b>✓</b> Passengers</span>
          <span className="progress-line progress-line-done" />
          <span className="progress-step progress-step-active"><b>2</b> Seats</span>
          <span className="progress-line" />
          <span className="progress-step"><b>3</b> Summary</span>
          <span className="progress-line" />
          <span className="progress-step"><b>4</b> Payment</span>
        </div>

        {result.error && <div className="recommendation-alert">{result.error}</div>}

        <div className="recommendation-grid">
          <main>
            <section className="smart-recommendation-card">
              <div className="smart-recommendation-heading">
                <div className="smart-icon"><Icon name="signal" size={22} /></div>
                <div>
                  <span className="eyebrow">RailMitra intelligence</span>
                  <h2>⭐ Recommended arrangement</h2>
                </div>
                {result.recommendedOption && <span className="score-badge">Score {result.recommendedOption.score}</span>}
              </div>

              {result.recommendedOption ? (
                <div className="recommended-assignment-list">
                  {result.recommendedOption.assignments.length === 0 ? (
                    <div className="infant-note">All passengers are infants, so no seats are assigned.</div>
                  ) : (
                    result.recommendedOption.assignments.map((assignment) => {
                      const category = passengers.find((p) => p.id === assignment.passengerId);
                      const type = getPassengerCategory(category?.age);
                      return (
                        <div className="assignment-row" key={assignment.passengerId}>
                          <div className="assignment-passenger">
                            <span>{assignment.passengerName}</span>
                            <small>{type?.label}</small>
                          </div>
                          <div className="assignment-seat">
                            <strong>{assignment.seat.coachNo} · {assignment.seat.seatNumber}</strong>
                            <span>{assignment.seat.berthType}</span>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              ) : null}

              {result.recommendedOption && <p className="recommendation-explanation">{result.recommendedOption.explanation}</p>}
            </section>

            <section className="alternative-section">
              <div className="section-title-row">
                <div>
                  <span className="eyebrow">You stay in control</span>
                  <h2>Alternative arrangements</h2>
                </div>
                <span>{result.alternatives.length} alternatives</span>
              </div>
              <div className="alternative-grid">
                {result.alternatives.map((option) => (
                  <OptionCard
                    key={option.id}
                    option={option}
                    selected={selectedOption?.id === option.id}
                    onChoose={chooseOption}
                  />
                ))}
              </div>
              {result.alternatives.length === 0 && <p className="muted-copy">The recommended arrangement is the strongest available option for this group.</p>}
            </section>

            <section className="seat-map-card">
              <div className="seat-map-heading">
                <div>
                  <span className="eyebrow">Manual selection</span>
                  <h2>Choose seats yourself</h2>
                </div>
                <span className="seat-count">{effectiveSelection.length} / {seatPassengersCount()} selected</span>
              </div>

              <div className="seat-legend">
                <span><i className="legend-dot legend-available" /> Available</span>
                <span><i className="legend-dot legend-recommended" /> Recommended</span>
                <span><i className="legend-dot legend-selected" /> Selected</span>
                <span><i className="legend-dot legend-booked" /> Booked</span>
              </div>

              {Object.entries(coachGroups).map(([coachNo, seats]) => (
                <div className="coach" key={coachNo}>
                  <div className="coach-label">
                    <span>Coach</span>
                    <strong>{coachNo}</strong>
                  </div>
                  <div className="coach-seats">
                    {seats.map((seat) => (
                      <SeatButton key={seat.id} seat={seat} state={seatState(seat)} onSelect={handleSeatSelect} />
                    ))}
                  </div>
                </div>
              ))}
            </section>
          </main>

          <aside className="recommendation-sidebar">
            <div className="sidebar-card passenger-priority-card">
              <span className="eyebrow">What we considered</span>
              <h2>Passenger priorities</h2>
              {passengers.map((passenger) => {
                const category = getPassengerCategory(passenger.age);
                return (
                  <div className="priority-row" key={passenger.id}>
                    <div>
                      <strong>{passenger.name || "Passenger"}</strong>
                      <span>{category?.label ?? "Passenger"}</span>
                    </div>
                    <span>{category?.lowerBerthPriority || passenger.specialRequirement !== "none" ? "Priority" : "Standard"}</span>
                  </div>
                );
              })}
            </div>

            <div className="sidebar-card">
              <span className="eyebrow">Your choice</span>
              <h2>{manualSeats.length > 0 ? "Manual selection" : selectedOption?.label ?? "Select an option"}</h2>
              <p>
                You can accept RailMitra's recommendation, choose an alternative, or select available seats manually.
              </p>
              <button
                type="button"
                className="btn btn-primary btn-block"
                disabled={seatPassengersCount() > 0 && effectiveSelection.length !== seatPassengersCount()}
                onClick={handleContinue}
              >
                Continue to Booking Summary
                <Icon name="arrowRight" size={18} />
              </button>
            </div>
          </aside>
        </div>
      </div>
    </section>
  );
}
