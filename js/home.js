import { PRODUCTS } from "./data.js";
import { addItemToCart, getCartCount } from "./cart.js";

const productsEl = document.querySelector("#products");
const cartCountEl = document.querySelector("#cartCount");
const yearEl = document.querySelector("#year");

const searchInput = document.querySelector("#searchInput");
const searchBtn = document.querySelector("#searchBtn");

const typeFilter = document.querySelector("#typeFilter");
const sizeFilter = document.querySelector("#sizeFilter");
const sortSelect = document.querySelector("#sortSelect");

let query = "";

function moneyCLP(n){
  return n.toLocaleString("es-CL", { style:"currency", currency:"CLP" });
}
function refreshCartCount(){
  cartCountEl.textContent = String(getCartCount());
}

function computeStock(p){
  if(!p.stockByVariant) return 0;
  return Object.values(p.stockByVariant).reduce((a,b)=>a+(b||0),0);
}

function renderProducts(list){
  productsEl.innerHTML = "";
  list.forEach(p => {
    const stock = computeStock(p);
    const hasDiscount = typeof p.discountPrice === "number" && p.discountPrice < p.price;
    const priceNow = hasDiscount ? p.discountPrice : p.price;
    const discountPct = hasDiscount ? Math.round((1 - (p.discountPrice / p.price)) * 100) : 0;

    const card = document.createElement("div");
    card.className = "productCard";

    const stockBadge = stock > 0
      ? `<span class="badge green">Stock: ${stock}</span>`
      : `<span class="badge red">Agotado</span>`;

    card.innerHTML = `
      <div class="thumbPro">
        <img class="thumbImg" src="${p.image || `assets/img/ropa/modelo1.png`}" alt="${p.name}">
        <div class="thumbOverlay">
          <div class="thumbLabel">${p.name}</div>
          <div class="thumbMini">${p.category} • ${p.type}</div>
        </div>
      </div>


      <div class="pcBody">
        <div class="pcRow">
          <div class="name">${p.name}</div>
          ${stockBadge}
        </div>

        <div class="priceRow">
          <div class="price">${moneyCLP(priceNow)}</div>
          ${hasDiscount ? `<div class="oldPrice">${moneyCLP(p.price)}</div><div class="discount">-${discountPct}%</div>` : ``}
        </div>

        <div class="meta">${p.desc}</div>

        <div class="meta">⭐ ${p.rating} (${p.reviewsCount}) • Envío: ${p.shipping?.eta || "24-72 hrs"}</div>

        <div class="pcActions">
          <a class="btn" href="product.html?id=${encodeURIComponent(p.id)}">Ver producto</a>
          <button class="btn ghost" data-add="${p.id}" ${stock<=0 ? "disabled" : ""}>Agregar</button>
        </div>
      </div>
    `;

    productsEl.appendChild(card);
  });

  productsEl.querySelectorAll("[data-add]").forEach(btn => {
    btn.addEventListener("click", () => {
      const id = btn.getAttribute("data-add");
      const p = PRODUCTS.find(x => x.id === id);
      if(!p) return;

      const firstColor = p.colors?.[0]?.key || "default";
      const firstSize = p.sizes?.[0] || null;

      addItemToCart({
        type: p.type,
        productId: p.id,
        name: p.name,
        price: (p.discountPrice ?? p.price),
        color: firstColor,
        size: firstSize,
        previewDataUrl: null
      });

      refreshCartCount();
      btn.textContent = "Agregado ✅";
      setTimeout(() => (btn.textContent = "Agregar"), 900);
    });
  });
}

function applyFilters(){
  let list = PRODUCTS.slice();

  // nombre/tags/categoría
  if(query.trim()){
    const q = query.trim().toLowerCase();
    list = list.filter(p =>
      p.name.toLowerCase().includes(q) ||
      p.desc.toLowerCase().includes(q) ||
      (p.category || "").toLowerCase().includes(q) ||
      (p.tags || []).some(t => t.toLowerCase().includes(q))
    );
  }

  // tipo producto
  const t = typeFilter.value;
  if(t !== "all") list = list.filter(p => p.type === t);

  // talla (solo ropa)
  const s = sizeFilter.value;
  if(s !== "all"){
    list = list.filter(p => (p.sizes || []).includes(s));
  }

  // sort
  const sort = sortSelect.value;
  const priceNow = (p) => (typeof p.discountPrice === "number" ? p.discountPrice : p.price);

  if(sort === "priceAsc") list.sort((a,b)=>priceNow(a)-priceNow(b));
  if(sort === "priceDesc") list.sort((a,b)=>priceNow(b)-priceNow(a));
  if(sort === "nameAsc") list.sort((a,b)=>a.name.localeCompare(b.name));

  renderProducts(list);
}

// Search
searchBtn?.addEventListener("click", () => {
  query = searchInput.value;
  applyFilters();
});
searchInput?.addEventListener("keydown", (e)=>{
  if(e.key === "Enter"){
    query = searchInput.value;
    applyFilters();
  }
});

// Filters
[typeFilter, sizeFilter, sortSelect].forEach(el => el.addEventListener("change", applyFilters));

yearEl.textContent = new Date().getFullYear();
refreshCartCount();
applyFilters();

/* ---------- 3 Carousels ---------- */
document.querySelectorAll("[data-carousel]").forEach(setupCarousel);

function setupCarousel(root){
  const track = root.querySelector("[data-track]");
  const slides = Array.from(track.children);
  const prev = root.querySelector("[data-prev]");
  const next = root.querySelector("[data-next]");
  const dots = root.querySelector("[data-dots]");

  let i = 0;
  let timer = null;

  function renderDots(){
    dots.innerHTML = "";
    slides.forEach((_, idx) => {
      const d = document.createElement("button");
      d.className = "dot" + (idx===i ? " active" : "");
      d.addEventListener("click", ()=>goTo(idx, true));
      dots.appendChild(d);
    });
  }

  function goTo(idx, user=false){
    i = (idx + slides.length) % slides.length;
    track.style.transform = `translateX(${-i * 100}%)`;
    renderDots();
    if(user) restart();
  }

  function restart(){
    clearInterval(timer);
    timer = setInterval(()=>goTo(i+1), 4200);
  }

  prev.addEventListener("click", ()=>goTo(i-1, true));
  next.addEventListener("click", ()=>goTo(i+1, true));

  renderDots();
  goTo(0);
  restart();
}
