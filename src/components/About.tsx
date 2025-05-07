import { FC } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/About.css";

const About: FC = () => {
  const navigate = useNavigate();

  const handleCardClick = (path: string) => {
    navigate(path);
  };

  return (
    <div className="about-container">
      <div className="about-content">
        <h1 className="about-title">Welcome!</h1>
        <p className="about-text">
          This is a website for things I find useful.
        </p>
        
        <div className="about-features">
          <div className="feature-card" onClick={() => handleCardClick('/break')}>
            <h3 className="feature-title">Break</h3>
            <p className="feature-description">
              A space to take a break from scrolling and enjoy nature.
            </p>
          </div>
          
          <div className="feature-card" onClick={() => handleCardClick('/pomodoro')}>
            <h3 className="feature-title">Pomodoro</h3>
            <p className="feature-description">
              Stay focused with customizable work and break sessions.
            </p>
          </div>
          
          <div className="feature-card" onClick={() => handleCardClick('/duck')}>
            <h3 className="feature-title">Duck</h3>
            <p className="feature-description">
              Shows you rubber ducks you can explain your code to.
            </p>
          </div>

          <div className="feature-card website-card" onClick={() => window.open('https://prathmesh2498.github.io/pd/', '_blank')}>
            <h3 className="feature-title">Personal Website</h3>
            <p className="feature-description">
              Learn More About Me
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default About;
