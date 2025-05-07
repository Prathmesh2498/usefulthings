import { useState } from 'react';
import '../styles/Duck.css';

const Duck = () => {
  const [selectedDuck, setSelectedDuck] = useState<number | null>(null);
  const ducks = Array.from({ length: 8 }, (_, i) => i + 1);

  return (
    <div className="duck-page">
      {!selectedDuck ? (
        <>
          <h1>Pick a Duck to Talk To</h1>
          <div className="duck-grid">
            {ducks.map((duck) => (
              <div
                key={duck}
                className="duck-card"
                onClick={() => setSelectedDuck(duck)}
              >
                <img
                  src={`/D${duck}.png`}
                  alt={`Duck ${duck}`}
                  className="duck-image"
                />
              </div>
            ))}
          </div>
        </>
      ) : (
        <div className="selected-duck">
          <h1>Okay, Explain</h1>
          <h2>I'm All Ears</h2>
          <img
            src={`/D${selectedDuck}.png`}
            alt={`Selected Duck ${selectedDuck}`}
            className="selected-duck-image"
          />
          <button className="back-button" onClick={() => setSelectedDuck(null)}>
            Choose Another Duck
          </button>
        </div>
      )}
    </div>
  );
};

export default Duck;
