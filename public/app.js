const $ = (sel) => document.querySelector(sel);

function talkCard(t) {
  const el = document.createElement("article");
  el.className = "talk";
  el.dataset.id = t.id;
  el.innerHTML = `
    <h2></h2>
    <div class="meta"><span class="slot"></span><span class="speaker"></span></div>`;
  el.querySelector("h2").textContent = t.title;
  el.querySelector(".slot").textContent = t.slot;
  el.querySelector(".speaker").textContent = t.speaker;
  return el;
}

async function render() {
  const talks = await (await fetch("/api/talks")).json();
  $("#talks").replaceChildren(...talks.map(talkCard));
}

render();
