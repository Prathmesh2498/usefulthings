import React, { useState, useEffect } from 'react';
import '../styles/Pomodoro.css';

type TimerPreset = {
  work: number;
  break: number;
  label: string;
};

const presets: TimerPreset[] = [
  { work: 25, break: 5, label: 'Classic' },
  { work: 50, break: 10, label: 'Extended' },
  { work: 90, break: 20, label: 'Long' },
];

const Pomodoro: React.FC = () => {
  const [minutes, setMinutes] = useState(25);
  const [seconds, setSeconds] = useState(0);
  const [isActive, setIsActive] = useState(false);
  const [isBreak, setIsBreak] = useState(false);
  const [cycles, setCycles] = useState(0);
  const [customWork, setCustomWork] = useState(25);
  const [customBreak, setCustomBreak] = useState(5);
  const [selectedPreset, setSelectedPreset] = useState<TimerPreset>(presets[0]);

  useEffect(() => {
    let interval: NodeJS.Timeout;

    if (isActive) {
      interval = setInterval(() => {
        if (seconds === 0) {
          if (minutes === 0) {
            // Timer completed
            setIsActive(false);
            if (!isBreak) {
              setIsBreak(true);
              setMinutes(selectedPreset.break);
              setCycles(prev => prev + 1);
            } else {
              setIsBreak(false);
              setMinutes(selectedPreset.work);
            }
            // Play notification sound
            new Audio('/notification.mp3').play().catch(() => {});
          } else {
            setMinutes(minutes - 1);
            setSeconds(59);
          }
        } else {
          setSeconds(seconds - 1);
        }
      }, 1000);
    }

    return () => clearInterval(interval);
  }, [isActive, minutes, seconds, isBreak, selectedPreset]);

  const toggleTimer = () => {
    setIsActive(!isActive);
  };

  const resetTimer = () => {
    setIsActive(false);
    setIsBreak(false);
    setMinutes(selectedPreset.work);
    setSeconds(0);
  };

  const formatTime = (time: number) => {
    return time.toString().padStart(2, '0');
  };

  const handlePresetChange = (preset: TimerPreset) => {
    setSelectedPreset(preset);
    setIsActive(false);
    setIsBreak(false);
    setMinutes(preset.work);
    setSeconds(0);
  };

  const handleCustomTime = () => {
    const newPreset = {
      work: customWork,
      break: customBreak,
      label: 'Custom'
    };
    handlePresetChange(newPreset);
  };

  return (
    <div className="pomodoro-container">
      <div className="pomodoro-timer">
        <div className="timer-presets">
          {presets.map((preset) => (
            <button
              key={preset.label}
              className={`preset-btn ${selectedPreset.label === preset.label ? 'active' : ''}`}
              onClick={() => handlePresetChange(preset)}
            >
              {preset.label}
            </button>
          ))}
        </div>

        <div className="timer-display">
          <span className="time">{formatTime(minutes)}</span>
          <span className="separator">:</span>
          <span className="time">{formatTime(seconds)}</span>
        </div>
        <div className="timer-status">
          {isBreak ? 'Break Time!' : 'Focus Time'}
        </div>
        <div className="timer-controls">
          <button 
            className={`control-btn ${isActive ? 'pause' : 'start'}`}
            onClick={toggleTimer}
          >
            {isActive ? 'Pause' : 'Start'}
          </button>
          <button className="control-btn reset" onClick={resetTimer}>
            Reset
          </button>
        </div>
        <div className="cycles-display">
          Completed Cycles: {cycles}
        </div>

        <div className="custom-timer">
          <div className="custom-inputs">
            <div className="input-row">
              <div className="input-group">
                <label>Work (min)</label>
                <input
                  type="number"
                  min="1"
                  max="120"
                  value={customWork}
                  onChange={(e) => setCustomWork(Number(e.target.value))}
                />
              </div>
              <div className="input-group">
                <label>Break (min)</label>
                <input
                  type="number"
                  min="1"
                  max="60"
                  value={customBreak}
                  onChange={(e) => setCustomBreak(Number(e.target.value))}
                />
              </div>
            </div>
            <button className="custom-btn" onClick={handleCustomTime}>
              Set Custom
            </button>
          </div>
        </div>
      </div>
      <div className="pomodoro-decoration">
        <div className="code-line"></div>
        <div className="code-line"></div>
        <div className="code-line"></div>
      </div>
    </div>
  );
};

export default Pomodoro; 