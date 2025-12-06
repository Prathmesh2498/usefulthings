import React, { useState, useEffect, useRef, useCallback } from 'react';
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

const STORAGE_KEY = 'pomodoro_timer_data';

interface TimerData {
  endTime: number; // UTC timestamp when timer should end
  isBreak: boolean;
  cycles: number;
  workDuration: number;
  breakDuration: number;
}

const Pomodoro: React.FC = () => {
  const [minutes, setMinutes] = useState(25);
  const [seconds, setSeconds] = useState(0);
  const [isActive, setIsActive] = useState(false);
  const [isBreak, setIsBreak] = useState(false);
  const [cycles, setCycles] = useState(0);
  const [customWork, setCustomWork] = useState(25);
  const [customBreak, setCustomBreak] = useState(5);
  const [selectedPreset, setSelectedPreset] = useState<TimerPreset>(presets[0]);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  // Calculate remaining time from stored end time
  const calculateRemainingTime = (endTime: number): { minutes: number; seconds: number } => {
    const now = Date.now();
    const remaining = Math.max(0, Math.floor((endTime - now) / 1000));
    const mins = Math.floor(remaining / 60);
    const secs = remaining % 60;
    return { minutes: mins, seconds: secs };
  };

  // Handle timer completion
  const handleTimerComplete = useCallback((data: TimerData) => {
    if (!data.isBreak) {
      // Start break
      const breakEndTime = Date.now() + data.breakDuration * 60 * 1000;
      const newData: TimerData = {
        endTime: breakEndTime,
        isBreak: true,
        cycles: data.cycles + 1,
        workDuration: data.workDuration,
        breakDuration: data.breakDuration,
      };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(newData));
      setIsBreak(true);
      setMinutes(data.breakDuration);
      setSeconds(0);
      setCycles(data.cycles + 1);
      new Audio('/Start.wav').play().catch(() => {});
    } else {
      // End break, start work
      const workEndTime = Date.now() + data.workDuration * 60 * 1000;
      const newData: TimerData = {
        endTime: workEndTime,
        isBreak: false,
        cycles: data.cycles,
        workDuration: data.workDuration,
        breakDuration: data.breakDuration,
      };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(newData));
      setIsBreak(false);
      setMinutes(data.workDuration);
      setSeconds(0);
      new Audio('/Stop.wav').play().catch(() => {});
    }
  }, []);

  // Update timer display from stored end time
  const updateTimerFromStorage = useCallback(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return;

    try {
      const data: TimerData = JSON.parse(stored);
      const remaining = calculateRemainingTime(data.endTime);

      if (remaining.minutes === 0 && remaining.seconds === 0) {
        // Timer completed
        handleTimerComplete(data);
      } else {
        setMinutes(remaining.minutes);
        setSeconds(remaining.seconds);
        setIsBreak(data.isBreak);
        setCycles(data.cycles);
      }
    } catch (e) {
      console.error('Error reading timer data:', e);
      localStorage.removeItem(STORAGE_KEY);
    }
  }, [handleTimerComplete]);

  // Start timer - save end time to localStorage
  const startTimer = (workMinutes: number, breakMinutes: number, isBreakTime: boolean) => {
    const duration = isBreakTime ? breakMinutes : workMinutes;
    const endTime = Date.now() + duration * 60 * 1000;
    
    const timerData: TimerData = {
      endTime,
      isBreak: isBreakTime,
      cycles: cycles,
      workDuration: workMinutes,
      breakDuration: breakMinutes,
    };
    
    localStorage.setItem(STORAGE_KEY, JSON.stringify(timerData));
    setIsActive(true);
    setIsBreak(isBreakTime);
    setMinutes(duration);
    setSeconds(0);
  };

  // Stop timer - clear localStorage
  const stopTimer = () => {
    localStorage.removeItem(STORAGE_KEY);
    setIsActive(false);
  };

  // Main timer update effect - only runs when tab is active
  useEffect(() => {
    if (!isActive) {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      return;
    }

    // Update immediately
    updateTimerFromStorage();

    // Update every second when tab is visible
    const updateInterval = () => {
      if (document.visibilityState === 'visible') {
        updateTimerFromStorage();
      }
    };

    intervalRef.current = setInterval(updateInterval, 1000);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [isActive, updateTimerFromStorage]);

  // Handle tab visibility changes
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible' && isActive) {
        // Tab became active, recalculate from stored time
        updateTimerFromStorage();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [isActive, updateTimerFromStorage]);

  // Restore timer state on mount
  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        const data: TimerData = JSON.parse(stored);
        const remaining = calculateRemainingTime(data.endTime);
        
        if (remaining.minutes > 0 || remaining.seconds > 0) {
          // Timer is still running
          setMinutes(remaining.minutes);
          setSeconds(remaining.seconds);
          setIsBreak(data.isBreak);
          setCycles(data.cycles);
          setIsActive(true);
          setSelectedPreset({
            work: data.workDuration,
            break: data.breakDuration,
            label: 'Custom',
          });
        } else {
          // Timer expired while tab was inactive
          handleTimerComplete(data);
        }
      } catch (e) {
        console.error('Error restoring timer:', e);
        localStorage.removeItem(STORAGE_KEY);
      }
    }
  }, [handleTimerComplete]);

  const toggleTimer = () => {
    if (isActive) {
      stopTimer();
    } else {
      startTimer(selectedPreset.work, selectedPreset.break, isBreak);
    }
  };

  const resetTimer = () => {
    stopTimer();
    setIsBreak(false);
    setMinutes(selectedPreset.work);
    setSeconds(0);
  };

  const formatTime = (time: number) => {
    return time.toString().padStart(2, '0');
  };

  const handlePresetChange = (preset: TimerPreset) => {
    stopTimer();
    setSelectedPreset(preset);
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