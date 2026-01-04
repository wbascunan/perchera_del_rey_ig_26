import { PRODUCTS, getMockupDataUrl } from "./data.js";
import { addItemToCart, getCartCount } from "./cart.js";

const qs = new URLSearchParams(location.search);
const id = qs.get("id") || "tee-gracia";
const product = PRODUCTS.find(p => p.id === id) || PRODUCTS[0];

const cartCountEl = document.querySelector("#cartCount");
const yearEl = document.querySelector("#year");

const breadcrumbsEl = document.querySelector("#breadcrumbs");

const pName = document.querySelector("#pName");
const pDesc = document.querySelector("#pDesc");
const priceNowEl = document.querySelector("#priceNow");
const priceOldEl = document.querySelector("#priceOld");
const discountEl = document.querySelector("#discountPct");
const stockBadge = document.querySelector("#stockBadge");
const ratingRow = document.querySelector("#ratingRow");
const shippingRow = document.querySelector("#shippingRow");

const swatchesEl = document.querySelector("#swatches");
const sizesEl = document.querySelector("#sizes");
const variantBlock = document.querySelector("#variantBlock");
const customBlock = document.querySelector("#customBlock");

const designFile = document.querySelector("#designFile");

const btnCenter = document.querySelector("#btnCenter");
const btnReset = document.querySelector("#btnReset");
const btnRemove = document.querySelector("#btnRemove");
const btnZoomIn = document.querySelector("#btnZoomIn");
const btnZoomOut = document.querySelector("#btnZoomOut");
const btnRotL = document.querySelector("#btnRotL");
const btnRotR = document.querySelector("#btnRotR");
const btnAddToCart = document.querySelector("#btnAddToCart");

const canvas = document.querySelector("#designer");
const ctx = canvas.getContext("2d");

function moneyCLP(n){
  return n.toLocaleString("es-CL", { style:"currency", currency:"CLP" });
}
function refreshCartCount(){
  cartCountEl.textContent = String(getCartCount());
}

function computeVariantStock(colorKey, size){
  const map = product.stockByVariant || {};
  if(product.sizes?.length){
    return map[`${colorKey}:${size}`] ?? 0;
  }
  return map[colorKey] ?? 0;
}

let selectedColor = product.colors?.[0]?.key || "default";
let selectedSize = product.sizes?.[0] || null;

const state = {
  baseImg: null,
  designImg: null,
  design: { x: 260, y: 325, s: 1, r: 0 },
  dragging:false,
  last:{x:0,y:0}
};

// Para ropa: área de impresión
const PRINT_AREA = { x: 220, y: 240, w: 160, h: 220 };

function setBreadcrumbs(){
  breadcrumbsEl.innerHTML = `
    <a href="index.html">Inicio</a> <span>›</span>
    <a href="index.html#catalogo">${product.category}</a> <span>›</span>
    <span>${product.name}</span>
  `;
}

function setInfo(){
  pName.textContent = product.name;
  pDesc.textContent = product.desc;

  const hasDiscount = typeof product.discountPrice === "number" && product.discountPrice < product.price;
  const now = hasDiscount ? product.discountPrice : product.price;
  priceNowEl.textContent = moneyCLP(now);

  if(hasDiscount){
    priceOldEl.style.display = "inline";
    discountEl.style.display = "inline-flex";
    priceOldEl.textContent = moneyCLP(product.price);
    const pct = Math.round((1 - (product.discountPrice / product.price)) * 100);
    discountEl.textContent = `-${pct}%`;
  } else {
    priceOldEl.style.display = "none";
    discountEl.style.display = "none";
  }

  ratingRow.innerHTML = `<span class="reviewStars">★</span> ${product.rating} (${product.reviewsCount}) • Reviews (mock)`;
  const ship = product.shipping || {};
  const shipTxt = ship.freeOver ? `Envío ${ship.eta} • ${moneyCLP(ship.cost)} (Gratis sobre ${moneyCLP(ship.freeOver)})` : `Envío ${ship.eta}`;
  shippingRow.textContent = shipTxt;
}

function setVariantUI(){
  // Si no hay variantes, ocultar bloque
  if(!product.colors?.length && !product.sizes?.length){
    variantBlock.style.display = "none";
    return;
  }

  // Colores (swatches)
  swatchesEl.innerHTML = "";
  (product.colors || []).forEach(c => {
    const b = document.createElement("button");
    b.className = "swatch" + (c.key === selectedColor ? " active" : "");
    b.style.background = c.hex;
    b.title = c.label;
    b.addEventListener("click", ()=>{
      selectedColor = c.key;
      setVariantUI();
      loadBaseMockup();
    });
    swatchesEl.appendChild(b);
  });

  // Tallas
  sizesEl.innerHTML = "";
  if(product.sizes?.length){
    product.sizes.forEach(s => {
      const b = document.createElement("button");
      b.className = "sizeBtn" + (s === selectedSize ? " active" : "");
      b.textContent = s;
      b.addEventListener("click", ()=>{
        selectedSize = s;
        setVariantUI();
        // Recalcular stock badge
        updateStockBadge();
      });
      sizesEl.appendChild(b);
    });
  } else {
    // si no hay tallas, ocultar bloque de tallas
    sizesEl.innerHTML = `<span class="muted" style="font-size:12px">Sin tallas</span>`;
  }

  updateStockBadge();

  // Personalización solo si es ropa
  if(product.type === "ropa"){
    customBlock.style.display = "block";
  } else {
    customBlock.style.display = "none";
    state.designImg = null;
  }
}

function updateStockBadge(){
  const stock = computeVariantStock(selectedColor, selectedSize);
  if(stock > 0){
    stockBadge.className = "badge green";
    stockBadge.textContent = `Stock: ${stock}`;
    btnAddToCart.disabled = false;
  } else {
    stockBadge.className = "badge red";
    stockBadge.textContent = "Agotado";
    btnAddToCart.disabled = true;
  }
}

function loadBaseMockup(){
  const colorObj = (product.colors || []).find(c => c.key === selectedColor) || product.colors?.[0];
  const key = colorObj?.mockupKey || "tee_white";
  const img = new Image();
  img.onload = ()=>{ state.baseImg = img; draw(); };
  img.src = getMockupDataUrl(key);
}

function draw(){
  ctx.clearRect(0,0,canvas.width,canvas.height);
  // fondo
  ctx.fillStyle = "rgba(15,23,42,.02)";
  ctx.fillRect(0,0,canvas.width,canvas.height);

  // base mockup
  if(state.baseImg){
    ctx.drawImage(state.baseImg, 0, 0, canvas.width, canvas.height);
  }

  // área impresión solo ropa
  if(product.type === "ropa"){
    ctx.save();
    ctx.strokeStyle = "rgba(22,163,74,.35)";
    ctx.setLineDash([8,6]);
    ctx.lineWidth = 2;
    ctx.strokeRect(PRINT_AREA.x, PRINT_AREA.y, PRINT_AREA.w, PRINT_AREA.h);
    ctx.restore();
  }

  // diseño
  if(state.designImg){
    ctx.save();
    ctx.translate(state.design.x, state.design.y);
    ctx.rotate(state.design.r);
    const iw = state.designImg.width;
    const ih = state.designImg.height;
    const scale = 0.35 * state.design.s;
    ctx.globalAlpha = 0.98;
    ctx.drawImage(state.designImg, -iw*scale/2, -ih*scale/2, iw*scale, ih*scale);
    ctx.restore();
  }
}

function clampToPrintArea(){
  if(product.type !== "ropa") return;
  if(!state.designImg) return;

  const iw = state.designImg.width;
  const ih = state.designImg.height;
  const scale = 0.35 * state.design.s;
  const halfW = (iw*scale)/2;
  const halfH = (ih*scale)/2;

  const minX = PRINT_AREA.x + halfW;
  const maxX = PRINT_AREA.x + PRINT_AREA.w - halfW;
  const minY = PRINT_AREA.y + halfH;
  const maxY = PRINT_AREA.y + PRINT_AREA.h - halfH;

  state.design.x = Math.max(minX, Math.min(maxX, state.design.x));
  state.design.y = Math.max(minY, Math.min(maxY, state.design.y));
}

function canvasCoords(evt){
  const r = canvas.getBoundingClientRect();
  const mx = (evt.clientX - r.left) * (canvas.width / r.width);
  const my = (evt.clientY - r.top) * (canvas.height / r.height);
  return { mx, my };
}

function isInsideDesign(mx,my){
  if(!state.designImg) return false;
  const iw = state.designImg.width;
  const ih = state.designImg.height;
  const scale = 0.35 * state.design.s;

  const left = state.design.x - (iw*scale/2);
  const top  = state.design.y - (ih*scale/2);
  return mx >= left && mx <= left + iw*scale && my >= top && my <= top + ih*scale;
}

// Interacciones solo si ropa y hay diseño
canvas.addEventListener("mousedown", (e)=>{
  if(product.type !== "ropa") return;
  const { mx, my } = canvasCoords(e);
  if(isInsideDesign(mx,my)){
    state.dragging = true;
    state.last = { x: mx, y: my };
  }
});
window.addEventListener("mouseup", ()=> state.dragging=false);

canvas.addEventListener("mousemove", (e)=>{
  if(product.type !== "ropa") return;
  if(!state.dragging) return;
  const { mx, my } = canvasCoords(e);
  state.design.x += (mx - state.last.x);
  state.design.y += (my - state.last.y);
  state.last = { x: mx, y: my };
  clampToPrintArea();
  draw();
});

canvas.addEventListener("wheel", (e)=>{
  if(product.type !== "ropa") return;
  if(!state.designImg) return;
  e.preventDefault();
  const delta = Math.sign(e.deltaY);
  if(e.shiftKey){
    state.design.r += delta * 0.08;
  } else {
    state.design.s *= (delta > 0 ? 0.92 : 1.08);
    state.design.s = Math.max(0.25, Math.min(3.2, state.design.s));
  }
  clampToPrintArea();
  draw();
}, { passive:false });

designFile?.addEventListener("change", (e)=>{
  if(product.type !== "ropa") return;
  const f = e.target.files?.[0];
  if(!f) return;

  const img = new Image();
  img.onload = ()=>{
    state.designImg = img;
    state.design = { x: PRINT_AREA.x + PRINT_AREA.w/2, y: PRINT_AREA.y + PRINT_AREA.h/2, s: 1, r: 0 };
    clampToPrintArea();
    draw();
  };
  img.src = URL.createObjectURL(f);
});

// Botones
btnCenter?.addEventListener("click", ()=>{
  state.design.x = PRINT_AREA.x + PRINT_AREA.w/2;
  state.design.y = PRINT_AREA.y + PRINT_AREA.h/2;
  clampToPrintArea();
  draw();
});
btnReset?.addEventListener("click", ()=>{
  state.design = { x: PRINT_AREA.x + PRINT_AREA.w/2, y: PRINT_AREA.y + PRINT_AREA.h/2, s: 1, r: 0 };
  clampToPrintArea();
  draw();
});
btnRemove?.addEventListener("click", ()=>{
  state.designImg = null;
  draw();
});
btnZoomIn?.addEventListener("click", ()=>{
  if(!state.designImg) return;
  state.design.s = Math.min(3.2, state.design.s * 1.08);
  clampToPrintArea();
  draw();
});
btnZoomOut?.addEventListener("click", ()=>{
  if(!state.designImg) return;
  state.design.s = Math.max(0.25, state.design.s * 0.92);
  clampToPrintArea();
  draw();
});
btnRotL?.addEventListener("click", ()=>{
  if(!state.designImg) return;
  state.design.r -= 0.12;
  draw();
});
btnRotR?.addEventListener("click", ()=>{
  if(!state.designImg) return;
  state.design.r += 0.12;
  draw();
});

btnAddToCart.addEventListener("click", ()=>{
  const stock = computeVariantStock(selectedColor, selectedSize);
  if(stock <= 0) return;

  const hasCustom = product.type === "ropa" && !!state.designImg;
  const previewDataUrl = hasCustom ? canvas.toDataURL("image/png") : null;

  addItemToCart({
    type: hasCustom ? "custom" : product.type,
    productId: product.id,
    name: hasCustom ? `${product.name} (Personalizada)` : product.name,
    price: (product.discountPrice ?? product.price),
    color: selectedColor,
    size: selectedSize,
    previewDataUrl
  });

  refreshCartCount();
  alert("Agregado al carrito ✅");
});

function renderMockReviews(){
  const grid = document.querySelector("#reviewsGrid");
  const samples = [
    { name:"Camila", stars:5, text:"Se ve premium, la impresión quedó perfect." },
    { name:"Matías", stars:4, text:"Buen material y llegó rápido." },
    { name:"Javiera", stars:5, text:"Minimal pero con intención. 10/10." },
    { name:"Diego", stars:4, text:"Buen calce. Ojalá más colores." },
  ];
  grid.innerHTML = "";
  samples.forEach(r=>{
    const div = document.createElement("div");
    div.className = "reviewCard";
    div.innerHTML = `
      <div style="display:flex; justify-content:space-between; gap:10px">
        <b>${r.name}</b>
        <span class="reviewStars">${"★".repeat(r.stars)}${"☆".repeat(5-r.stars)}</span>
      </div>
      <div class="muted" style="margin-top:8px; font-size:12px">${r.text}</div>
    `;
    grid.appendChild(div);
  });
}

function renderReco(){
  const grid = document.querySelector("#recoGrid");
  const sameCat = PRODUCTS.filter(p => p.id !== product.id && p.category === product.category);
  const fallback = PRODUCTS.filter(p => p.id !== product.id);
  const list = (sameCat.length ? sameCat : fallback).slice(0,4);

  grid.innerHTML = "";
  list.forEach(p=>{
    const div = document.createElement("div");
    div.className = "productCard";
    const now = (p.discountPrice ?? p.price);
    div.innerHTML = `
      <div class="thumbPro">
        <div class="thumbLabel">${p.name}</div>
        <div class="thumbMini">${p.category} • ${p.type}</div>
      </div>
      <div class="pcBody">
        <div class="pcRow">
          <div class="name">${p.name}</div>
          <span class="badge">${p.category}</span>
        </div>
        <div class="priceRow">
          <div class="price">${moneyCLP(now)}</div>
        </div>
        <div class="pcActions">
          <a class="btn soft" href="product.html?id=${encodeURIComponent(p.id)}">Ver</a>
          <a class="btn ghost" href="index.html#catalogo">Catálogo</a>
        </div>
      </div>
    `;
    grid.appendChild(div);
  });
}

// Init
yearEl.textContent = new Date().getFullYear();
setBreadcrumbs();
setInfo();
setVariantUI();
loadBaseMockup();
draw();
renderMockReviews();
renderReco();
refreshCartCount();
