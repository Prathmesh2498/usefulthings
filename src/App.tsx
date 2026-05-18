import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import Navbar from './components/Navbar';
import About from './components/About';
import Break from './components/Break';
import Pomodoro from './components/Pomodoro';
import Duck from './components/Duck';
import Prism from './components/Prism';
import './App.css';

const AppContent = () => {
  const location = useLocation();
  const isBreakPage = location.pathname === '/break';
  const isPrismPage = location.pathname === '/prism';

  return (
    <div className={`App${isPrismPage ? ' app-prism' : ''}`}>
      {!isBreakPage && !isPrismPage && <Navbar />}
      <Routes>
        <Route path="/" element={<About />} />
        <Route path="/break" element={<Break />} />
        <Route path="/pomodoro" element={<Pomodoro />} />
        <Route path="/duck" element={<Duck />} />
        <Route path="/prism" element={<Prism />} />
        <Route path="/signal" element={<Navigate to="/prism" replace />} />
      </Routes>
    </div>
  );
};

function App() {
  return (
    <Router>
      <AppContent />
    </Router>
  );
}

export default App;
