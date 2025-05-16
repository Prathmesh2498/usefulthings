import { FC, useEffect, useState } from "react";
import Navbar from "./Navbar";
import "../styles/Break.css";

const Break: FC = () => {
  const images: string[] = [
    "/P1.jpg",
    "/P2.jpg",
    "/P3.jpg",
    "/P4.jpg",
    "/P5.jpg"
  ];

  const [currentImageIndex, setCurrentImageIndex] = useState<number>(
    Math.floor(Math.random() * images.length)
  );
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showNavbar, setShowNavbar] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => {
      setIsLoading(true);
      setCurrentImageIndex(Math.floor(Math.random() * images.length));
    }, 15 * 60 * 1000); // 15 minutes in milliseconds

    return () => clearInterval(interval);
  }, []);

  const handleImageLoad = () => {
    setIsLoading(false);
    setError(null);
  };

  const handleImageError = () => {
    setError("Failed to load image");
    setIsLoading(false);
  };

  return (
    <div className="break-page">
      <div 
        className="navbar"
        style={{ 
          opacity: showNavbar ? 1 : 0.4,
          pointerEvents: 'auto',
          height: '60px'
        }}
        onMouseEnter={() => setShowNavbar(true)}
        onMouseLeave={() => setShowNavbar(false)}
      >
        <div className="nav-links">
          <a href="/break" className="nav-link">Break</a>
          <a href="/pomodoro" className="nav-link">Pomodoro</a>
          <a href="/duck" className="nav-link">Duck</a>
          <a href="/" className="nav-link">About</a>
        </div>
      </div>
      <div className="break-container">
        {isLoading && (
          <div className="loading-message">
            Loading...
          </div>
        )}
        {error && (
          <div className="error-message">
            {error}
          </div>
        )}
        <img 
          src={images[currentImageIndex]}
          alt="nature" 
          className={`break-image ${!isLoading ? 'loaded' : ''}`}
          onLoad={handleImageLoad}
          onError={handleImageError}
        />
      </div>
    </div>
  );
};

export default Break;
