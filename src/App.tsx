import React from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import Navbar from './components/Navbar';
import About from './components/About';
import Break from './components/Break';
import Pomodoro from './components/Pomodoro';
import Duck from './components/Duck';
import './App.css';

const AppContent = () => {
  const location = useLocation();
  const isBreakPage = location.pathname === '/break';

  return (
    <div className="App">
      {!isBreakPage && <Navbar />}
      <Routes>
        <Route path="/" element={<About />} />
        <Route path="/break" element={<Break />} />
        <Route path="/pomodoro" element={<Pomodoro />} />
        <Route path="/duck" element={<Duck />} />
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
