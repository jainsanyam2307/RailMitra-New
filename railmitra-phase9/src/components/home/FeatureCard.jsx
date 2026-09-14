import Icon from "../common/Icon.jsx";
import "./FeatureCard.css";

export default function FeatureCard({ icon, title, description }) {
  return (
    <li className="feature-card">
      <span className="feature-card-icon">
        <Icon name={icon} size={22} />
      </span>
      <h3>{title}</h3>
      <p>{description}</p>
    </li>
  );
}
