import React from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import Navbar from './components/Navbar';
import About from './components/About';
import Break from './components/Break';
import Pomodoro from './components/Pomodoro';
import Duck from './components/Duck';
import SignalGarden from './components/SignalGarden';
import './App.css';

const AppContent = () => {
  const location = useLocation();
  const isBreakPage = location.pathname === '/break';
  const isSignalPage = location.pathname === '/signal';

  return (
    <div className={`App${isSignalPage ? ' app-signal' : ''}`}>
      {!isBreakPage && <Navbar />}
      <Routes>
        <Route path="/" element={<About />} />
        <Route path="/break" element={<Break />} />
        <Route path="/pomodoro" element={<Pomodoro />} />
        <Route path="/duck" element={<Duck />} />
        <Route path="/signal" element={<SignalGarden />} />
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
