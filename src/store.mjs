// Persistence layer. In-memory for now.
const SEED = [
  { id: "t1", title: "Why your agent forgets everything", speaker: "A. de Vries", slot: "18:30" },
  { id: "t2", title: "Harness engineering in 15 minutes", speaker: "Ivan", slot: "18:50" },
  { id: "t3", title: "Evals are just tests with feelings", speaker: "M. Jansen", slot: "19:10" },
  { id: "t4", title: "Shipping with three models at once", speaker: "S. Bakker", slot: "19:30" },
];

export function createStore() {
  const state = { talks: structuredClone(SEED), ratings: [] };
  return {
    talks: () => state.talks,
    ratings: () => state.ratings,
    addRating: (rating) => { state.ratings.push(rating); return rating; },
  };
}
