import React from 'react';
import { Link } from 'react-router-dom';
import '../styles/Navbar.css';

const Navbar: React.FC = () => {
  return (
    <nav className="navbar">
      <div className="nav-links">
        <Link to="/break" className="nav-link">Break</Link>
        <Link to="/pomodoro" className="nav-link">Pomodoro</Link>
        <Link to="/duck" className="nav-link">Duck</Link>
        <Link to="/" className="nav-link">About</Link>
      </div>
    </nav>
  );
};

export default Navbar; 