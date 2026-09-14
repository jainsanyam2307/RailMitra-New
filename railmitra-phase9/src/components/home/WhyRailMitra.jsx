import FeatureCard from "./FeatureCard.jsx";
import { FEATURES } from "../../data/features.js";
import "./WhyRailMitra.css";

export default function WhyRailMitra() {
  return (
    <section className="section" id="why-railmitra">
      <div className="container">
        <div className="section-head">
          <span className="eyebrow">Why RailMitra?</span>
          <h2>Booking that thinks a step ahead</h2>
          <p>
            Every part of RailMitra is built around the small details that make train travel in
            India easier — from who you're travelling with to how far you need to walk on the
            platform.
          </p>
        </div>

        <ul className="feature-grid">
          {FEATURES.map((feature) => (
            <FeatureCard
              key={feature.id}
              icon={feature.icon}
              title={feature.title}
              description={feature.description}
            />
          ))}
        </ul>
      </div>
    </section>
  );
}
