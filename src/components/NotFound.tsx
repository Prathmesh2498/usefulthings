import { FC } from "react";

const pandaGrid = [
  [" ", " ", "x", " ", " ",  " ", " ", "x", " ", " ",  " ", " ", "x", " ", " "],
  [" ", "x", "x", " ", " ",  " ", "x", " ", "x", " ",  " ", " ", "x", "x", " "],
  ["x", " ", "x", " ", " ",  " ", "x", " ", "x", " ",  " ", " ", "x", " ", "x"],
  ["x", "x", "x", "x", " ",  " ", "x", " ", "x", " ",  " ", "x", "x", "x", "x"],
  [" ", " ", "x", " ", " ",  " ", "x", " ", "x", " ",  " ", " ", "x", " ", " "],
  [" ", " ", "x", " ", " ",  " ", " ", "x", " ", " ",  " ", " ", "x", " ", " "],
];

const NotFound: FC = () => {
  return (
    <div className="panda-404">
      {/* <img src="/leaf.png" alt="Falling Leaf" className="leaf" /> */}
      <div className="panda-grid">
        {pandaGrid.map((row, rowIndex) =>
          row.map((cell, colIndex) => {
            const isPanda = cell === "x";
            const isFlippedFour = colIndex >= 10;
            const isCircleCol = colIndex >= 5 && colIndex <= 9;
            const isRightHalfCircle = colIndex >= 7;
            const isCenterPanda =
              isCircleCol && rowIndex === 2 && colIndex === 7;
            const flip =
              isFlippedFour || isRightHalfCircle || isCenterPanda;

            return (
              <div
                key={`${rowIndex}-${colIndex}`}
                className={`cell ${isPanda ? "panda" : ""} ${
                  flip ? "flip" : ""
                }`}
              />
            );
          })
        )}
      </div>
      <div className="panda-message">
        The page you are looking for does not exist.
      </div>
    </div>
  );
};

export default NotFound;

