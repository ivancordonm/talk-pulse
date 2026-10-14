// Domain rules. No HTTP here.
import { randomUUID } from "node:crypto";

export class DomainError extends Error {
  constructor(code, message, status = 400) { super(message); this.code = code; this.status = status; }
}

export function scoreOf(store, talkId) {
  const stars = store.ratings().filter((r) => r.talkId === talkId).map((r) => r.stars);
  if (stars.length === 0) return { avg: null, count: 0 };
  const avg = stars.reduce((a, b) => a + b, 0) / stars.length;
  return { avg: Math.round(avg * 10) / 10, count: stars.length };
}

export function listTalks(store) {
  return [...store.talks()]
    .sort((a, b) => a.slot.localeCompare(b.slot))
    .map((t) => ({ ...t, ...scoreOf(store, t.id) }));
}

export function addRating(store, talkId, input) {
  if (!store.talks().some((t) => t.id === talkId)) {
    throw new DomainError("talk_not_found", `No talk with id "${talkId}"`, 404);
  }
  const { stars, comment = "" } = input ?? {};
  if (!Number.isInteger(stars) || stars < 1 || stars > 5) {
    throw new DomainError("invalid_stars", "Stars must be a whole number from 1 to 5");
  }
  if (typeof comment !== "string" || comment.length > 280) {
    throw new DomainError("invalid_comment", "Comment must be text of at most 280 characters");
  }
  return store.addRating({ id: randomUUID(), talkId, stars, comment: comment.trim(), createdAt: new Date().toISOString() });
}
