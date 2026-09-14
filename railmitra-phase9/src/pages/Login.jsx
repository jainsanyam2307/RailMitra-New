import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import Icon from "../components/common/Icon.jsx";
import { useAuth } from "../context/AuthContext.jsx";
import "./Auth.css";

export default function Login() {
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const destination = location.state?.from || "/";
  function submit(event) {
    event.preventDefault();
    setError("");
    if (!form.email.trim() || !form.password) return setError("Enter your email and password.");
    const result = login(form);
    if (!result.ok) return setError(result.error);
    navigate(destination, { replace: true });
  }

  return <section className="auth-page"><div className="auth-shell">
    <div className="auth-intro"><span className="eyebrow">Welcome back</span><h1>Travel smarter with RailMitra.</h1><p>Sign in to keep your bookings, tickets and journeys together on this device.</p><div className="auth-benefits"><span><Icon name="ticket" size={17}/> Saved bookings</span><span><Icon name="seat" size={17}/> Seat recommendations</span><span><Icon name="shield" size={17}/> Simple account access</span></div></div>
    <form className="auth-card" onSubmit={submit}><div className="auth-card-head"><div className="auth-icon"><Icon name="user" size={22}/></div><div><span className="eyebrow">Account</span><h2>Sign in</h2></div></div>
      <label>Email<input type="email" value={form.email} onChange={(e)=>setForm({...form,email:e.target.value})} placeholder="you@example.com" autoComplete="email"/></label>
      <label>Password<span className="auth-password"><input type={showPassword?"text":"password"} value={form.password} onChange={(e)=>setForm({...form,password:e.target.value})} placeholder="Your password" autoComplete="current-password"/><button type="button" onClick={()=>setShowPassword(!showPassword)}>{showPassword?"Hide":"Show"}</button></span></label>
      {error && <p className="auth-error">{error}</p>}
      <button className="btn btn-primary btn-block" type="submit">Sign in <Icon name="arrowRight" size={17}/></button>
      <p className="auth-foot">New to RailMitra? <Link to="/register">Create an account</Link></p>
      <p className="auth-note">Demo authentication: credentials are stored locally in your browser. No real server is connected.</p>
    </form>
  </div></section>;
}
