// Domain rules. No HTTP here.
export function listTalks(store) {
  return [...store.talks()].sort((a, b) => a.slot.localeCompare(b.slot));
}
