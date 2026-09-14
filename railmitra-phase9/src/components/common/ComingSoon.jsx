import { Link } from "react-router-dom";
import Icon from "./Icon.jsx";
import "./ComingSoon.css";

export default function ComingSoon({ title, description }) {
  return (
    <section className="coming-soon container">
      <span className="coming-soon-icon">
        <Icon name="ticket" size={26} />
      </span>
      <h1>{title}</h1>
      <p>{description}</p>
      <Link to="/" className="btn btn-ghost">
        Back to Home
      </Link>
    </section>
  );
}
