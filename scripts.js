let intro;
let main;

window.onload = function () {
  setUp();
  setTimeout(fadeout_intro, 700);
  // JSON 연동
  loadNewsletters();
};

function setUp() {
  window.scrollTo(0, 0);
  let width = window.innerWidth;
  let height = window.innerHeight;

  intro = $("#intro");
  main = $("#main");
  main.css("display", "none");

  intro.css("width", width);
  intro.css("height", height);
}

function fadeout_intro() {
  let opacity = parseFloat(intro.css("opacity")) || 1;

  let fadeout = setInterval(function () {
    intro.css("opacity", opacity - 1 / 255);
    opacity -= 1 / 255;

    if (opacity <= 0.1) {
      intro.css("display", "none");
      onFadeout_intro();
      clearInterval(fadeout);
    }
  }, 1000 / 255);
}

function onFadeout_intro() {
  setTimeout(fadein_main, 500);
}

function fadein_main() {
  main.css("opacity", 0);
  main.css("display", "block");
  let opacity = 0;

  let fadein = setInterval(function () {
    main.css("opacity", opacity + 1 / 255);
    opacity += 1 / 255;

    if (opacity >= 0.9) {
      main.css("opacity", 1);
      clearInterval(fadein);
    }
  }, 1000 / 255);
}

let searching = false;
function call_search(onfocus_search = false) {
  if (searching) return;
  searching = true;
  fadein_modal_search();
  if (!onfocus_search) $("#input-text-search").focus();
}
function cancle_search() {
  if (!searching) return;
  searching = false;
  fadeout_modal_search();
  $("#input-text-search").focusout();
}

function fadein_modal_search() {
  $(".modal-search").css("opacity", 0);
  $(".modal-search").css("visibility", "visible");
  let opacity = 0;

  let fadein = setInterval(function () {
    $(".modal-search").css("opacity", opacity + 1 / 60);
    opacity += 1 / 60;

    if (opacity >= 0.9) {
      $(".modal-search").css("opacity", 1);
      clearInterval(fadein);
    }
  }, 1);
}

function fadeout_modal_search() {
  $(".modal-search").css("opacity", 1);
  $(".modal-search").css("visibility", "visible");
  let opacity = 1;

  let fadeout = setInterval(function () {
    $(".modal-search").css("opacity", opacity - 1 / 50);
    opacity -= 1 / 50;

    if (opacity <= 0.1) {
      $(".modal-search").css("opacity", 0);
      $(".modal-search").css("visibility", "hidden");
      clearInterval(fadeout);
    }
  }, 1);
}

function open_link(link) {
  window.open(link, "_blank", "noopener,noreferrer");
}

function reset() {
  location.reload(true);
}

let tag = [{}];
function addBadge(cate) {
  if (tag[cate] != 1) {
    tag[cate] = 1;
    let badge = "";
    switch (cate) {
      case 0:
        badge = `<div class="badge-IT col-md-2 align-self-center">
                        <span class="badge rounded-pill bg-primary">
                            IT
                        </span>
                    </div>`;
        break;
      case 1:
        badge = `<div class="badge-tech col-md-2 align-self-center">
                        <span class="badge rounded-pill bg-primary">
                            기술
                        </span>
                    </div>`;
        break;
      case 2:
        badge = `<div class="badge-news col-md-2 align-self-center">
                        <span class="badge rounded-pill bg-secondary">
                            뉴스/시사
                        </span>
                    </div>`;
        break;
      case 3:
        badge = `<div class="badge-job col-md-2 align-self-center">
                        <span class="badge rounded-pill bg-success">
                            채용/커리어
                        </span>
                    </div>`;
        break;
      case 4:
        badge = `<div class="badge-economy col-md-2 align-self-center">
                        <span class="badge rounded-pill bg-danger">
                            경제
                        </span>
                    </div>`;
        break;
      case 5:
        badge = `<div class="badge-cook col-md-2 align-self-center">
                        <span class="badge rounded-pill bg-warning text-dark">
                            요리
                        </span>
                    </div>`;
        break;
      case 6:
        badge = `<div class="badge-edu col-md-2 align-self-center">
                        <span class="badge rounded-pill bg-info text-dark">
                            교육
                        </span>
                    </div>`;
        break;
      case 7:
        badge = `<div class="badge-book col-md-2 align-self-center">
                        <span class="badge rounded-pill bg-dark">
                            문학
                        </span>
                    </div>`;
        break;
    }
    $(".container-modal-badge").append(badge);
  } else {
    tag[cate] = 0;
    switch (cate) {
      case 0:
        $(".badge-IT").remove();
        break;
      case 1:
        $(".badge-tech").remove();
        break;
      case 2:
        $(".badge-news").remove();
        break;
      case 3:
        $(".badge-job").remove();
        break;
      case 4:
        $(".badge-economy").remove();
        break;
      case 5:
        $(".badge-cook").remove();
        break;
      case 6:
        $(".badge-edu").remove();
        break;
      case 7:
        $(".badge-book").remove();
        break;
    }
  }
  console.log(cate, tag[cate]);
}

/* ============ JSON 로드 & 카드 렌더링 ============ */
async function loadNewsletters() {
  try {
    const res = await fetch("./lettey_newsletters.json");
    if (!res.ok) throw new Error("HTTP " + res.status);
    const data = await res.json();

    // 섹션 컨테이너가 없으면 동적 생성(안전장치)
    ensureContainers();

    // 최신 6개
    renderCards("#latest-list", data.slice(0, 6));

    // 인기 3개 (가로형)
    renderHorizontalCards("#popular-list", data.slice(6, 9));

    // 카테고리 타일
    renderCategoryTiles("#category-tiles", data);

    // 모달 태그 버튼
    buildTagButtons(".container-tag", data);
  } catch (err) {
    console.error("JSON 로드 실패:", err);
    const el = document.querySelector("#latest-list");
    if (el)
      el.innerHTML = `<div class="text-danger">데이터를 불러오지 못했어요. (${String(
        err
      )})</div>`;
  }
}

function ensureContainers() {
  const latest = document.querySelector("#latest-list");
  const popular = document.querySelector("#popular-list");
  const categories = document.querySelector("#category-tiles");

  if (!latest || !popular || !categories) {
    const wrapper = document.createElement("div");
    wrapper.innerHTML = `
      <section class="section background-section1">
        <div class="section1">
          <div class="container-news row"><div id="card-container-title">오늘 올라온 레터에요!</div></div>
          <div id="latest-list" class="container-news row g-4"></div>
        </div>
        <div id="line"></div>
      </section>
      <section class="section background-section2">
        <div class="section2">
          <div class="container-news row"><div id="card-container-title">이번주 가장 인기있는 레터에요!</div></div>
          <div id="popular-list" class="container-news row g-4"></div>
        </div>
        <div id="line"></div>
      </section>
      <section class="section background-section3">
        <div class="section3">
          <div class="container-news row"><div id="card-container-title">레티가 좋아할만한<br/>레터에요!</div></div>
          <div id="category-tiles" class="container-news row g-4"></div>
        </div>
        <div id="line"></div>
      </section>`;
    document.querySelector("#main")?.appendChild(wrapper);
  }
}

function renderCards(containerSelector, items) {
  const container = document.querySelector(containerSelector);
  if (!container) return;
  container.innerHTML = items
    .map(
      (item) => `
      <div class="col-12 col-sm-6 col-md-4">
        <div class="card h-100 shadow-sm hover-card" onclick="open_link('${
          item.subscribe_url
        }')">
          <img src="${item.image_url}" class="card-img-top" alt="${escapeHtml(
        item.title
      )}">
          <div class="card-body d-flex flex-column">
            <h6 class="publisher text-muted mb-2">${escapeHtml(
              item.publisher
            )}</h6>
            <h5 class="card-title mb-2 text-truncate">${escapeHtml(
              item.title
            )}</h5>
            <p class="card-text text-truncate-2 mb-3">${escapeHtml(
              item.body
            )}</p>
            <div class="mt-auto d-flex justify-content-between align-items-center">
              <span class="badge rounded-pill bg-secondary">${escapeHtml(
                item.category
              )}</span>
              <a class="stretched-link" href="${
                item.subscribe_url
              }" target="_blank" rel="noopener"></a>
            </div>
          </div>
        </div>
      </div>`
    )
    .join("");
}

function renderHorizontalCards(containerSelector, items) {
  const container = document.querySelector(containerSelector);
  if (!container) return;
  container.innerHTML = items
    .map(
      (item) => `
      <div class="col-12">
        <div class="card card-horizontal shadow-sm hover-card" onclick="open_link('${
          item.subscribe_url
        }')">
          <div class="row g-0">
            <div class="col-12 col-md-4">
              <img src="${
                item.image_url
              }" class="img-fluid rounded-start w-100" alt="${escapeHtml(
        item.title
      )}">
            </div>
            <div class="col-12 col-md-8">
              <div class="card-body d-flex flex-column h-100">
                <h6 class="publisher text-muted mb-2">${escapeHtml(
                  item.publisher
                )}</h6>
                <h5 class="card-title mb-2">${escapeHtml(item.title)}</h5>
                <p class="card-text text-truncate-3 mb-3">${escapeHtml(
                  item.body
                )}</p>
                <div class="mt-auto d-flex justify-content-between align-items-center">
                  <span class="badge rounded-pill bg-secondary">${escapeHtml(
                    item.category
                  )}</span>
                  <a class="stretched-link" href="${
                    item.subscribe_url
                  }" target="_blank" rel="noopener"></a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>`
    )
    .join("");
}

function renderCategoryTiles(containerSelector, items) {
  const container = document.querySelector(containerSelector);
  if (!container) return;
  const categories = [...new Set(items.map((i) => i.category))];
  container.innerHTML = categories
    .map((cat) => {
      const item = items.find((i) => i.category === cat);
      const bg = item?.image_url || "";
      const link = item?.subscribe_url || "#";
      return `
      <div class="col-12 col-sm-6 col-lg-4">
        <div class="category-tile card-news-like" style="background-image:url('${bg}');" onclick="open_link('${link}')">
          <div class="title-news-like">${escapeHtml(cat)}</div>
        </div>
      </div>`;
    })
    .join("");
}

function buildTagButtons(containerSelector, items) {
  const container = document.querySelector(containerSelector);
  if (!container) return;
  const categories = [...new Set(items.map((i) => i.category))];
  container.innerHTML = categories
    .map(
      (cat, idx) => `
      <button type="button" onclick="addBadge(${idx})" class="btn btn-outline-primary me-2 mb-2">
        ${escapeHtml(cat)}
      </button>`
    )
    .join("");
}

function escapeHtml(str) {
  return String(str ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}
