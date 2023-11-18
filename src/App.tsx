import { useState } from "react";
import "./App.css";
import { Cell, GameFactory, Solver } from "./Game";
import { puzzlesAsString } from "./data";

function App() {
  const [game, _] = useState(
    GameFactory.fromStringPuzzle(puzzlesAsString[1].sudoku)
  );
  const [count, setCount] = useState(0);
  const [justSolvedCell, setJustSolvedCell] = useState<Cell | null | undefined>(
    null
  );

  function pickPossibleChoices(cell: Cell) {
    let rawValue = prompt("Which value ? " + cell.toString());
    if (rawValue) {
      let value = parseInt(rawValue);
      if (cell.possibilities.includes(value)) {
        game.play(cell.coordinates.i, cell.coordinates.j, value);
        setCount(count + 1);
      }
    }
  }

  return (
    <div>
      <div className="board" key={count}>
        {game.cells?.flatMap((row) => {
          return row.map((cell) => (
            <div
              title={cell.possibilities.join(" ")}
              className={[
                "cell",
                "block-" + cell.block?.i + "-" + cell.block?.j,
                cell.isSolved() ? "solved" : "unsolved",
                justSolvedCell === cell ? "justSolved" : "",
                cell.frozen ? "frozen" : "",
              ].join(" ")}
              onClick={() => pickPossibleChoices(cell)}
            >
              {cell.isSolved() ? cell.toString() : " "}
            </div>
          ));
        })}
      </div>
      <div>
        <button
          onClick={() => {
            const cell = game.adaptPossibilities();
            setJustSolvedCell(cell);
            setCount(count + 1);
          }}
        >
          {game.isSolved() ? (
            <span style={{ color: "green" }}>Yes ! You made it !</span>
          ) : (
            <img src="./ossoduko.svg" color="white" width={50}></img>
          )}
        </button>
        <span style={{ color: "red" }}>
          {game.isUnsolvable() &&
            "Ouch you probably made a bad move, it looks unsolvable"}
        </span>
        <button
          onClick={() => {
            Solver.solve(game);
            setCount(count + 1);
          }}
        >
          Solve all
        </button>
      </div>
    </div>
  );
}

export default App;
