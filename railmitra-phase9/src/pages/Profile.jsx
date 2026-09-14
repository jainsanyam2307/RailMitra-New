import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Icon from "../components/common/Icon.jsx";
import { useAuth } from "../context/AuthContext.jsx";
import "./Auth.css";

export default function Profile() {
  const navigate = useNavigate();
  const { user, updateProfile, logout } = useAuth();
  const [form, setForm] = useState({ name: user?.name ?? "", phone: user?.phone ?? "" });
  const [message, setMessage] = useState("");
  function save(event) { event.preventDefault(); if (!form.name.trim() || !form.phone.trim()) return setMessage("Name and phone are required."); const result=updateProfile(form); setMessage(result.ok?"Profile updated successfully.":result.error); }
  function signOut(){ logout(); navigate("/",{replace:true}); }
  if (!user) return null;
  return <section className="auth-page"><div className="profile-shell"><div className="profile-hero"><div className="profile-avatar">{user.name.charAt(0).toUpperCase()}</div><div><span className="eyebrow">Your account</span><h1>{user.name}</h1><p>{user.email}</p></div></div><div className="profile-grid"><form className="auth-card" onSubmit={save}><div className="auth-card-head"><div className="auth-icon"><Icon name="user" size={22}/></div><div><span className="eyebrow">Personal details</span><h2>Profile</h2></div></div><label>Full name<input value={form.name} onChange={(e)=>setForm({...form,name:e.target.value})}/></label><label>Email<input value={user.email} disabled/></label><label>Phone<input value={form.phone} onChange={(e)=>setForm({...form,phone:e.target.value})}/></label>{message&&<p className="auth-success">{message}</p>}<button className="btn btn-primary btn-block" type="submit">Save changes</button></form><aside className="profile-side"><span className="eyebrow">Quick access</span><h2>Your RailMitra</h2><button className="profile-link" onClick={()=>navigate("/my-bookings")}><Icon name="ticket" size={18}/> My bookings <span>→</span></button><button className="profile-link" onClick={()=>navigate("/trains")}><Icon name="train" size={18}/> Search trains <span>→</span></button><button className="profile-link profile-logout" onClick={signOut}><Icon name="close" size={18}/> Log out <span>→</span></button><p className="auth-note">This is a frontend demo profile. Replace the local authentication layer with a secure backend before production.</p></aside></div></div></section>;
}
