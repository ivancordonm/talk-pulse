const $ = (sel, root = document) => root.querySelector(sel);

function scoreText(t) {
  return t.count === 0 ? "No ratings yet" : `★ ${t.avg.toFixed(1)} · ${t.count} rating${t.count === 1 ? "" : "s"}`;
}

function talkCard(t) {
  const el = document.createElement("article");
  el.className = "talk";
  el.dataset.id = t.id;
  el.innerHTML = `
    <h2></h2>
    <div class="meta"><span class="slot"></span><span class="speaker"></span></div>
    <div class="score"></div>
    <form class="rate">
      <div class="stars" role="radiogroup" aria-label="Stars">
        ${[1, 2, 3, 4, 5].map((n) => `<button type="button" class="star" data-stars="${n}" aria-label="${n} stars">★</button>`).join("")}
      </div>
      <input name="comment" maxlength="300" placeholder="Optional comment">
      <button type="submit" class="send">Rate</button>
      <p class="error" role="alert"></p>
    </form>`;
  $("h2", el).textContent = t.title;
  $(".slot", el).textContent = t.slot;
  $(".speaker", el).textContent = t.speaker;
  $(".score", el).textContent = scoreText(t);

  wireRating(el, t);
  return el;
}

// Star picker + submit for one card. Kept apart so talkCard only builds markup.
function wireRating(el, t) {
  let chosen = 0;
  el.querySelectorAll(".star").forEach((b) =>
    b.addEventListener("click", () => {
      chosen = Number(b.dataset.stars);
      el.querySelectorAll(".star").forEach((s) => s.classList.toggle("on", Number(s.dataset.stars) <= chosen));
    }));

  $(".rate", el).addEventListener("submit", async (ev) => {
    ev.preventDefault();
    const res = await fetch(`/api/talks/${t.id}/ratings`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ stars: chosen, comment: $("input", el).value }),
    });
    const body = await res.json();
    $(".error", el).textContent = res.ok ? "" : body.message;
    if (res.ok) { $("input", el).value = ""; await render(); }
  });
}

async function render() {
  const talks = await (await fetch("/api/talks")).json();
  for (const t of talks) {
    const card = $(`.talk[data-id="${t.id}"]`);
    if (card) $(".score", card).textContent = scoreText(t);
    else $("#talks").append(talkCard(t));
  }
}

render();
