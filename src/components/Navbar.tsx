import React from 'react';
import { NavLink } from 'react-router-dom';
import '../styles/Navbar.css';

const Navbar: React.FC = () => {
  return (
    <nav className="navbar">
      <div className="nav-links">
        <NavLink to="/break" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>Break</NavLink>
        <NavLink to="/pomodoro" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>Pomodoro</NavLink>
        <NavLink to="/duck" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>Duck</NavLink>
        <NavLink to="/" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>About</NavLink>
      </div>
    </nav>
  );
};

export default Navbar; 