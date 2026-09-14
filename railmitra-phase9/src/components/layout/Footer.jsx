import { Link } from "react-router-dom";
import Icon from "../common/Icon.jsx";
import "./Footer.css";

export default function Footer() {
  return (
    <footer className="footer">
      <div className="container footer-inner">
        <div className="footer-brand">
          <span className="footer-brand-row">
            <span className="navbar-brand-mark">
              <Icon name="train" size={20} />
            </span>
            <span className="footer-brand-text">
              Rail<strong>Mitra</strong>
            </span>
          </span>
          <p>Smart, simple train ticket booking for every kind of traveller.</p>
        </div>

        <nav aria-label="Footer" className="footer-links">
          <div>
            <h4>Product</h4>
            <ul>
              <li><Link to="/">Home</Link></li>
              <li><Link to="/trains">Search Trains</Link></li>
              <li><Link to="/my-bookings">My Bookings</Link></li>
            </ul>
          </div>
          <div>
            <h4>Account</h4>
            <ul>
              <li><Link to="/login">Login</Link></li>
              <li><Link to="/register">Register</Link></li>
            </ul>
          </div>
          <div>
            <h4>Company</h4>
            <ul>
              <li><a href="#why-railmitra">Why RailMitra</a></li>
              <li><a href="#how-it-works">How it works</a></li>
            </ul>
          </div>
        </nav>
      </div>

      <div className="container footer-bottom">
        <p>© {new Date().getFullYear()} RailMitra. All rights reserved.</p>
        <p>Built for a smoother railway booking experience.</p>
      </div>
    </footer>
  );
}
