// Persistence layer: a JSON file, written atomically. Pass no file for in-memory (tests).
import { readFileSync, writeFileSync, renameSync, mkdirSync, existsSync } from "node:fs";
import { dirname } from "node:path";

const SEED = [
  { id: "t1", title: "Why your agent forgets everything", speaker: "A. de Vries", slot: "18:30" },
  { id: "t2", title: "Harness engineering in 15 minutes", speaker: "Ivan", slot: "18:50" },
  { id: "t3", title: "Evals are just tests with feelings", speaker: "M. Jansen", slot: "19:10" },
  { id: "t4", title: "Shipping with three models at once", speaker: "S. Bakker", slot: "19:30" },
];

export function createStore(file) {
  const state = file && existsSync(file)
    ? JSON.parse(readFileSync(file, "utf8"))
    : { talks: structuredClone(SEED), ratings: [] };

  const save = () => {
    if (!file) return;
    mkdirSync(dirname(file), { recursive: true });
    writeFileSync(`${file}.tmp`, JSON.stringify(state, null, 2));
    renameSync(`${file}.tmp`, file);  // atomic: a crash never leaves half a file
  };
  save();

  return {
    talks: () => state.talks,
    ratings: () => state.ratings,
    addRating: (rating) => { state.ratings.push(rating); save(); return rating; },
  };
}
