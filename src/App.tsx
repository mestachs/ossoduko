import { useState } from "react";
import "./App.css";

const range = (n: number) => Array.from({ length: n }, (_value, key) => key);

interface Coordinates {
  i: number;
  j: number;
}

const removePossibilitiesForCells = function (
  cells: Cell[],
  stopAtFirst = true
): Cell | null {
  const resolvedPossibilities = cells
    .filter((c) => c.isSolved())
    .map((c) => c.possibilities[0]);
  for (let cell of cells.filter((c) => !c.isSolved())) {
    cell.removePossibilities(resolvedPossibilities);
    if (cell.possibilities.length == 1 && stopAtFirst) {
      cell.markAsSolved();
      return cell;
    }
  }
  return null;
};

class Cell {
  public possibilities: number[] = [1, 2, 3, 4, 5, 6, 7, 8, 9];
  public block?: Coordinates;
  public coordinates: Coordinates;
  public frozen: boolean = false;
  public solved: boolean = false;

  constructor(i: number, j: number) {
    this.coordinates = { i, j };
  }
  public isSolved(): boolean {
    return this.solved;
  }

  public markAsSolved() {
    this.solved = true;
  }

  public assignBlock(i: number, j: number) {
    this.block = { i, j };
  }

  public removePossibilities(resolvedPossibilities: number[]) {
    this.possibilities = this.possibilities.filter(
      (p) => !resolvedPossibilities.includes(p)
    );
  }

  public freeze() {
    this.frozen = true;
    this.markAsSolved();
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

  public play(
    rowNumber: number,
    colNumber: number,
    possibility: number,
    freeze = false
  ) {
    if (this.cells) {
      const row = this.cells[rowNumber];
      row[colNumber].possibilities = [possibility];
      row[colNumber].markAsSolved();
      if (freeze) {
        row[colNumber].freeze();
      }
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

  public adaptPossibilities(stopAtFirst = true) {
    if (this.cells) {
      for (let row of this.getRows()) {
        const cell = removePossibilitiesForCells(row, stopAtFirst);
        if (cell && stopAtFirst) {
          return cell;
        }
      }
      for (let column of this.getColumns()) {
        const cell = removePossibilitiesForCells(column, stopAtFirst);
        if (cell && stopAtFirst) {
          return cell;
        }
      }
      for (let block of this.getBlocks()) {
        const cell = removePossibilitiesForCells(block, stopAtFirst);
        if (cell && stopAtFirst) {
          return cell;
        }
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
        game.play(rowNumber, colNumber, possibility, true);
      }
      index = index + 1;
    }
    return game;
  }
}

function App() {
  const puzzlesAsString = [
    "..17..5.9573.241.68..5.1..27..295.18..94..3.56528....7465.8..71...159..49.8..7.5.",
    "524..6.........7.13...........4..8..6......5...........418.........3..2...87.....",
    "1....7.9..3..2...8..96..5....53..9...1..8...26....4...3......1..4......7..7...3..",
    "..............3.85..1.2.......5.7.....4...1...9.......5......73..2.1........4...9",
    "4.....8.5.3..........7......2.....6.....8.4......1.......6.3.7.5..2.....1.4......",
    "82.6..9.5.............2.31...7318.6.24.....73...........279.1..5...8..36..3......",
  ];
  const [game, _] = useState(GameFactory.fromStringPuzzle(puzzlesAsString[0]));
  const [count, setCount] = useState(0);
  const [justSolvedCell, setJustSolvedCell] = useState<Cell | null>(null);

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
          <img src="./ossoduko.svg" color="white" width={50}></img>
        </button>
      </div>
    </div>
  );
}

export default App;
