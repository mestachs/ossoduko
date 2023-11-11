import { useState } from "react";
import "./App.css";

const range = (n: number) => Array.from({ length: n }, (_value, key) => key);

interface Coordinates {
  i: number;
  j: number;
}

const removePossibilitiesForCells = function (cells: Cell[]) {
  const resolvedPossibilities = cells
    .filter((c) => c.isSolved())
    .map((c) => c.possibilities[0]);
  for (let cell of cells.filter((c) => !c.isSolved())) {
    cell.removePossibilities(resolvedPossibilities);
  }
};

class Cell {
  public possibilities: number[] = [1, 2, 3, 4, 5, 6, 7, 8, 9];
  public block?: Coordinates;
  public coordinates: Coordinates;

  constructor(i: number, j: number) {
    this.coordinates = { i, j };
  }
  public isSolved(): boolean {
    return this.possibilities.length == 1;
  }

  public assignBlock(i: number, j: number) {
    this.block = { i, j };
  }

  public removePossibilities(resolvedPossibilities: number[]) {
    this.possibilities = this.possibilities.filter(
      (p) => !resolvedPossibilities.includes(p)
    );
  }

  public toString(): string {
    return this.possibilities.map((s) => "" + s).join(",");
  }
}

class Game {
  public cells?: Cell[][];

  constructor() {
    this.cells = [];
    for (let i in range(9)) {
      this.cells[i] = [];
      for (let j in range(9)) {
        this.cells[i][j] = new Cell(i, j);
      }
    }
    // assign block info
    this.getBlocks();
  }

  public play(rowNumber: number, colNumber: number, possibility: number) {
    if (this.cells) {
      const row = this.cells[rowNumber];
      row[colNumber].possibilities = [possibility];
    }
  }

  public getRows(): Cell[][] {
    if (this.cells) {
      return this.cells;
    }
    throw new Error("no cell");
  }

  public getColumns(): Cell[][] {
    if (this.cells) {
      const results: Cell[][] = [];
      for (let colNumber of range(9)) {
        const column = this.cells?.map((row) => row[colNumber]);
        results.push(column);
      }
      return results;
    }
    throw new Error("no cell");
  }

  public getBlocks(): Cell[][] {
    if (this.cells) {
      const results: Cell[][] = [];
      for (let blocki of range(3)) {
        for (let blockj of range(3)) {
          const block = [
            this.cells[blocki * 3][blockj * 3],
            this.cells[blocki * 3][blockj * 3 + 1],
            this.cells[blocki * 3][blockj * 3 + 2],
            this.cells[blocki * 3 + 1][blockj * 3],
            this.cells[blocki * 3 + 1][blockj * 3 + 1],
            this.cells[blocki * 3 + 1][blockj * 3 + 2],
            this.cells[blocki * 3 + 2][blockj * 3],
            this.cells[blocki * 3 + 2][blockj * 3 + 1],
            this.cells[blocki * 3 + 2][blockj * 3 + 2],
          ];

          for (let cell of block) {
            cell.assignBlock(blocki, blockj);
          }
          results.push(block);
        }
      }
      return results;
    }
    throw new Error("no cell");
  }

  public adaptPossibilities() {
    if (this.cells) {
      for (let row of this.getRows()) {
        removePossibilitiesForCells(row);
      }
      for (let column of this.getColumns()) {
        removePossibilitiesForCells(column);
      }
      for (let block of this.getBlocks()) {
        removePossibilitiesForCells(block);
      }
    }
  }
}

class GameFactory {
  static fromStringPuzzle(puzzle: string): Game {
    const game = new Game();
    let index = 0;
    for (let c of puzzle.split("")) {
      if (c != ".") {
        const possibility = parseInt(c);
        const rowNumber = Math.floor(index / 9);
        const colNumber = index % 9;
        console.log(
          "index",
          index,
          " => ",
          rowNumber + " " + colNumber + "  : " + possibility + " " + c
        );
        game.play(rowNumber, colNumber, possibility);
      }
      index = index + 1;
    }
    return game;
  }
}

function App() {
  const puzzlesAsString = [
    "..17..5.9573.241.68..5.1..27..295.18..94..3.56528....7465.8..71...159..49.8..7.53",
    "524..6.........7.13...........4..8..6......5...........418.........3..2...87.....",
  ];
  const [game, setGame] = useState(
    GameFactory.fromStringPuzzle(puzzlesAsString[1])
  );
  const [count, setCount] = useState(0);

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
      <table key={count}>
        {game.cells?.map((row) => (
          <tr>
            {row.map((cell) => (
              <td
                width="120"
                height="120"
                title={cell.block?.i + " " + cell.block?.j}
                className={[
                  "block-" + cell.block?.i + "-" + cell.block?.j,
                  cell.isSolved() ? "solved" : "unsolved",
                ].join(" ")}
                onClick={() => pickPossibleChoices(cell)}
              >
                {cell.toString()}
              </td>
            ))}
          </tr>
        ))}
      </table>
      <button
        onClick={() => {
          game.adaptPossibilities();
          setCount(count + 1);
        }}
      >
        solve
      </button>
    </div>
  );
}

export default App;
