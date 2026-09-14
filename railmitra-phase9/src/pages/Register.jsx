import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Icon from "../components/common/Icon.jsx";
import { useAuth } from "../context/AuthContext.jsx";
import "./Auth.css";

export default function Register() {
  const navigate = useNavigate();
  const { register } = useAuth();
  const [form, setForm] = useState({ name: "", email: "", phone: "", password: "", confirm: "" });
  const [error, setError] = useState("");
  function update(field, value) { setForm((current)=>({...current,[field]:value})); setError(""); }
  function submit(event) {
    event.preventDefault();
    if (!form.name.trim() || !form.email.trim() || !form.phone.trim() || !form.password) return setError("Please complete all required fields.");
    if (!/^\S+@\S+\.\S+$/.test(form.email)) return setError("Enter a valid email address.");
    if (form.password.length < 6) return setError("Password must contain at least 6 characters.");
    if (form.password !== form.confirm) return setError("Passwords do not match.");
    const result = register(form);
    if (!result.ok) return setError(result.error);
    navigate("/", { replace: true });
  }
  return <section className="auth-page"><div className="auth-shell">
    <div className="auth-intro"><span className="eyebrow">Join RailMitra</span><h1>One account for every journey.</h1><p>Create your demo account to keep your RailMitra bookings and tickets organized.</p><div className="auth-benefits"><span><Icon name="ticket" size={17}/> Booking history</span><span><Icon name="user" size={17}/> Personal profile</span><span><Icon name="seat" size={17}/> Your saved journeys</span></div></div>
    <form className="auth-card" onSubmit={submit}><div className="auth-card-head"><div className="auth-icon"><Icon name="user" size={22}/></div><div><span className="eyebrow">New account</span><h2>Create account</h2></div></div>
      <label>Full name<input value={form.name} onChange={(e)=>update("name",e.target.value)} placeholder="Your full name" autoComplete="name"/></label>
      <div className="auth-two"><label>Email<input type="email" value={form.email} onChange={(e)=>update("email",e.target.value)} placeholder="you@example.com" autoComplete="email"/></label><label>Phone<input inputMode="tel" value={form.phone} onChange={(e)=>update("phone",e.target.value)} placeholder="10-digit number" autoComplete="tel"/></label></div>
      <div className="auth-two"><label>Password<input type="password" value={form.password} onChange={(e)=>update("password",e.target.value)} placeholder="At least 6 characters" autoComplete="new-password"/></label><label>Confirm password<input type="password" value={form.confirm} onChange={(e)=>update("confirm",e.target.value)} placeholder="Repeat password" autoComplete="new-password"/></label></div>
      {error && <p className="auth-error">{error}</p>}
      <button className="btn btn-primary btn-block" type="submit">Create account <Icon name="arrowRight" size={17}/></button>
      <p className="auth-foot">Already have an account? <Link to="/login">Sign in</Link></p>
      <p className="auth-note">Demo authentication: account data stays in this browser and is not sent to a backend.</p>
    </form>
  </div></section>;
}
