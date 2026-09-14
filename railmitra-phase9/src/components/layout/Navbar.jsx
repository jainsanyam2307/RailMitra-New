import { useEffect, useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import Icon from "../common/Icon.jsx";
import { useAuth } from "../../context/AuthContext.jsx";
import "./Navbar.css";

const NAV_LINKS = [
  { to: "/", label: "Home", end: true },
  { to: "/trains", label: "Search Trains" },
  { to: "/my-bookings", label: "My Bookings" },
];

export default function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const { user, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();

  useEffect(() => { const onScroll=()=>setIsScrolled(window.scrollY>8); onScroll(); window.addEventListener("scroll",onScroll,{passive:true}); return()=>window.removeEventListener("scroll",onScroll); },[]);
  useEffect(() => { const onResize=()=>{if(window.innerWidth>860)setIsMenuOpen(false)}; window.addEventListener("resize",onResize); return()=>window.removeEventListener("resize",onResize)},[]);
  function signOut(){ logout(); setProfileOpen(false); setIsMenuOpen(false); navigate("/"); }
  const accountControls = isAuthenticated ? <div className="navbar-user-wrap"><button type="button" className="navbar-user" aria-haspopup="true" aria-expanded={profileOpen} onClick={()=>setProfileOpen((v)=>!v)}><span className="navbar-user-avatar">{user.name.charAt(0).toUpperCase()}</span><span className="navbar-user-name">{user.name.split(" ")[0]}</span><span className="navbar-chevron">⌄</span></button>{profileOpen&&<div className="navbar-user-menu"><button onClick={()=>{setProfileOpen(false);navigate("/profile")}}><Icon name="user" size={16}/> Profile</button><button onClick={()=>{setProfileOpen(false);navigate("/my-bookings")}}><Icon name="ticket" size={16}/> My bookings</button><button className="menu-logout" onClick={signOut}><Icon name="close" size={16}/> Log out</button></div>}</div> : <><NavLink to="/login" className="btn btn-ghost btn-sm"><Icon name="user" size={16}/> Login</NavLink><NavLink to="/register" className="btn btn-primary btn-sm">Register</NavLink></>;
  return <header className={`navbar ${isScrolled?"navbar-scrolled":""}`}><div className="container navbar-inner"><NavLink to="/" className="navbar-brand" onClick={()=>setIsMenuOpen(false)}><span className="navbar-brand-mark"><Icon name="train" size={22}/></span><span className="navbar-brand-text">Rail<strong>Mitra</strong></span></NavLink><nav id="primary-navigation" className={`navbar-links ${isMenuOpen?"navbar-links-open":""}`} aria-label="Primary"><ul>{NAV_LINKS.map((link)=><li key={link.to}><NavLink to={link.to} end={link.end} className={({isActive})=>`navbar-link ${isActive?"navbar-link-active":""}`} onClick={()=>setIsMenuOpen(false)}>{link.label}</NavLink></li>)}</ul><div className="navbar-auth navbar-auth-mobile">{accountControls}</div></nav><div className="navbar-auth navbar-auth-desktop">{accountControls}</div><button type="button" className="navbar-toggle" aria-expanded={isMenuOpen} aria-controls="primary-navigation" aria-label={isMenuOpen?"Close menu":"Open menu"} onClick={()=>setIsMenuOpen((open)=>!open)}><Icon name={isMenuOpen?"close":"menu"} size={22}/></button></div></header>;
}
