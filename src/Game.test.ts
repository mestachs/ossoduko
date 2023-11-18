import { test, expect } from "bun:test";
import { GameFactory, Solver } from "./Game";

test("Should be able to solve easy sudoku", () => {
  const game = GameFactory.fromStringPuzzle(
    "..17..5.9573.241.68..5.1..27..295.18..94..3.56528....7465.8..71...159..49.8..7.5."
  );
  Solver.solve(game);
  expect(game.isSolved()).toBe(true);
  expect(GameFactory.toStringPuzzle(game)).toBe(
    "241768539573924186896531742734295618189476325652813497465382971327159864918647253"
  );
});

test("Should be able to solve medium sudoku", () => {
  const game = GameFactory.fromStringPuzzle(
    "8.4.71.9.976.3....5.196....3.7495...692183...4.5726..92483591..169847...753612984"
  );
  Solver.solve(game);
  expect(game.isSolved()).toBe(true);
  expect(GameFactory.toStringPuzzle(game)).toBe(
    "824571396976234518531968472387495621692183745415726839248359167169847253753612984"
  );
});
