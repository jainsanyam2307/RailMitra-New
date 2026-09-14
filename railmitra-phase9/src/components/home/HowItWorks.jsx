import { HOW_IT_WORKS } from "../../data/features.js";
import "./HowItWorks.css";

export default function HowItWorks() {
  return (
    <section className="section how-it-works" id="how-it-works">
      <div className="container">
        <div className="section-head">
          <span className="eyebrow">How RailMitra Works</span>
          <h2>From search to seat, in four stops</h2>
          <p>Each booking follows the same short route — no detours, no guesswork.</p>
        </div>

        <ol className="route">
          {HOW_IT_WORKS.map((item) => (
            <li className="route-stop" key={item.step}>
              <span className="route-stop-marker">
                <span className="route-stop-dot" />
                <span className="route-stop-code">{item.step}</span>
              </span>
              <div className="route-stop-content">
                <h3>{item.title}</h3>
                <p>{item.description}</p>
              </div>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
