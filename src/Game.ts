import { range } from "./utils";

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

export class Cell {
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

export class Game {
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

  public isUnsolvable(): boolean {
    if (this.cells) {
      for (let block of this.getBlocks()) {
        for (let cell of block) {
          if (cell.possibilities.length == 0) {
            return true;
          }
        }
      }
      return false;
    }
    return true;
  }

  public isSolved(): boolean {
    if (this.cells) {
      for (let block of this.getBlocks()) {
        for (let cell of block) {
          if (!cell.isSolved()) {
            return false;
          }
        }
      }
      return true;
    }
    return false;
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

  public getUnsolvedCells(): Cell[] {
    const unsolvedCells: Cell[] = [];
    for (let block of this.getBlocks()) {
      for (let cell of block) {
        if (!cell.isSolved()) {
          unsolvedCells.push(cell);
        }
      }
    }
    return unsolvedCells;
  }

  public getCandidate(): Cell | null {
    const unsolvedCells = this.getUnsolvedCells();
    unsolvedCells.sort((a: Cell, b: Cell) => {
      return a.possibilities.length - b.possibilities.length;
    });
    debugger;
    return unsolvedCells[0];
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

export class GameFactory {
  static fromStringPuzzle(puzzle: string): Game {
    const game = new Game();
    let index = 0;
    for (let c of puzzle.split("")) {
      if (c != ".") {
        const possibility = parseInt(c);
        const rowNumber = Math.floor(index / 9);
        const colNumber = index % 9;
        game.play(rowNumber, colNumber, possibility, true);
      }
      index = index + 1;
    }
    return game;
  }

  static toStringPuzzle(game: Game): string {
    let results = [];
    for (let row of game.getRows()) {
      for (let cell of row) {
        if (cell.isSolved()) {
          results.push(cell.possibilities[0]);
        } else {
          results.push(".");
        }
      }
    }
    return results.join("");
  }
}

function solveBasic(game: Game, solutions: Cell[]) {
  let cell;
  while ((cell = game.adaptPossibilities())) {
    solutions.push(cell);
  }
  return;
}

export class Solver {
  static solve(game: Game): Cell[] {
    const solutions: Cell[] = [];
    while (!game.isSolved()) {
      solveBasic(game, solutions);
      const cell = game.getCandidate();
      if (cell) {
        game.play(
          cell.coordinates.i,
          cell.coordinates.j,
          cell.possibilities[0]
        );
      }
      if (game.isUnsolvable()) {
        throw new Error("unsolvable");
      }
    }
    return solutions;
  }
}
