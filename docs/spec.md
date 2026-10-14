# talk-pulse — product spec

## Users
- **Attendee**: opens the page on a phone, rates talks, sees what others think.
- **Organizer**: seeds the list of talks, watches the leaderboard on the big screen.

## Core objects
- **Talk**: id, title, speaker, slot (e.g. "18:30").
- **Rating**: talkId, stars (integer 1–5), comment (optional, ≤ 280 chars), createdAt.

## Behaviour
- The home page lists every talk in slot order with its average score and rating count.
- An attendee can rate any talk from the list. Invalid ratings are rejected with a clear message.
- The leaderboard ranks talks with at least one rating by average (ties: more ratings first).
- Data survives a server restart.
- The leaderboard refreshes on its own while the page is open.

## Out of scope
Accounts, authentication, editing or deleting ratings, admin UI.
