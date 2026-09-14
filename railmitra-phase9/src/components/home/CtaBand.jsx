import { Link } from "react-router-dom";
import Icon from "../common/Icon.jsx";
import "./CtaBand.css";

export default function CtaBand() {
  return (
    <section className="section">
      <div className="container">
        <div className="cta-band">
          <div>
            <h2>Ready for your next journey?</h2>
            <p>Check live seat availability across classes and book in under a minute.</p>
          </div>
          <Link to="/trains" className="btn btn-primary">
            Search Trains
            <Icon name="arrowRight" size={18} />
          </Link>
        </div>
      </div>
    </section>
  );
}
