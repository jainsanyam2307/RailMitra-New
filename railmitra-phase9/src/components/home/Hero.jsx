import SearchForm from "./SearchForm.jsx";
import "./Hero.css";

export default function Hero() {
  return (
    <section className="hero">
      <div className="hero-track" aria-hidden="true" />
      <div className="container hero-inner">
        <div className="hero-copy">
          <span className="eyebrow">RailMitra · Book with confidence</span>
          <h1>Your Smart Railway Booking Companion</h1>
          <p>
            Search live seat availability, get seat picks tailored to how you travel, and book
            confirmed tickets across Indian Railways — in one clean, fast flow.
          </p>
          <ul className="hero-stats">
            <li>
              <strong>2,800+</strong>
              <span>Trains covered</span>
            </li>
            <li>
              <strong>6,500+</strong>
              <span>Stations connected</span>
            </li>
            <li>
              <strong>4.7/5</strong>
              <span>Average traveller rating</span>
            </li>
          </ul>
        </div>

        <div className="hero-form-wrap">
          <SearchForm />
        </div>
      </div>
    </section>
  );
}
