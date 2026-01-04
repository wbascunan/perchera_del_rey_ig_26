// /js/designer.js
import { PRODUCTS } from "./data.js";
import { getCartCount, addItemToCart } from "./cart.js";

const qs = new URLSearchParams(location.search);
const productId = qs.get("id") || "p1";
const product = PRODUCTS.find(p => p.id === productId) || PRODUCTS[0];

const pName = document.querySelector("#pName");
const pDesc = document.querySelector("#pDesc");
const pPrice = document.querySelector("#pPrice");
const cartCountEl = document.querySelector("#cartCount");

const colorSelect = document.querySelector("#colorSelect");
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

pName.textContent = product.name;
pDesc.textContent = product.desc;
pPrice.textContent = moneyCLP(product.price);

// Colores
(product.colorways || ["Negra"]).forEach(c => {
  const opt = document.createElement("option");
  opt.value = c;
  opt.textContent = c;
  colorSelect.appendChild(opt);
});

const state = {
  baseImg: null,
  designImg: null,
  color: colorSelect.value || "Negra",
  design: { x: 260, y: 325, s: 1, r: 0 },
  dragging: false,
  last: { x:0, y:0 }
};

// Área de impresión (rect dentro del “pecho”)
const PRINT_AREA = { x: 220, y: 240, w: 160, h: 220 }; // basado en mockup svg

function loadBase(){
  // Usamos mockup svg data-url si existe. Si no, dibujamos una polera simple.
  if(product.mockup){
    const img = new Image();
    img.onload = () => { state.baseImg = img; draw(); };
    img.src = product.mockup;
  } else {
    state.baseImg = null;
    draw();
  }
}

function drawBaseFallback(){
  // Polera estilizada fallback
  ctx.save();
  ctx.translate(canvas.width/2, canvas.height/2);
  const w = 360, h = 420;

  ctx.beginPath();
  roundedRect(-w/2, -h/2+40, w, h, 28);
  ctx.fillStyle = "rgba(255,255,255,.12)";
  ctx.fill();

  ctx.beginPath();
  roundedRect(-w/2-90, -h/2+80, 120, 150, 26);
  ctx.fillStyle = "rgba(255,255,255,.09)";
  ctx.fill();

  ctx.beginPath();
  roundedRect(w/2-30, -h/2+80, 120, 150, 26);
  ctx.fill();

  ctx.beginPath();
  ctx.arc(0, -h/2+80, 46, 0, Math.PI*2);
  ctx.fillStyle = "rgba(0,0,0,.22)";
  ctx.fill();

  ctx.strokeStyle = "rgba(255,255,255,.14)";
  ctx.lineWidth = 2;
  ctx.stroke();

  ctx.restore();
}

function draw(){
  // fondo suave
  ctx.clearRect(0,0,canvas.width,canvas.height);
  ctx.fillStyle = "rgba(124,58,237,.10)";
  ctx.fillRect(0,0,canvas.width,canvas.height);

  // base
  if(state.baseImg){
    ctx.drawImage(state.baseImg, 0, 0, canvas.width, canvas.height);
  } else {
    drawBaseFallback();
  }

  // área de impresión (guía)
  ctx.save();
  ctx.strokeStyle = "rgba(34,197,94,.35)";
  ctx.setLineDash([8,6]);
  ctx.lineWidth = 2;
  ctx.strokeRect(PRINT_AREA.x, PRINT_AREA.y, PRINT_AREA.w, PRINT_AREA.h);
  ctx.restore();

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

function roundedRect(x,y,w,h,r){
  const rr = Math.min(r, w/2, h/2);
  ctx.beginPath();
  ctx.moveTo(x+rr, y);
  ctx.arcTo(x+w, y, x+w, y+h, rr);
  ctx.arcTo(x+w, y+h, x, y+h, rr);
  ctx.arcTo(x, y+h, x, y, rr);
  ctx.arcTo(x, y, x+w, y, rr);
  ctx.closePath();
}

function clampDesignToPrintArea(){
  if(!state.designImg) return;

  // AABB aproximado (sin rotación), suficiente para MVP
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

// Mouse interactions
canvas.addEventListener("mousedown", (e)=>{
  const { mx, my } = canvasCoords(e);
  if(isInsideDesign(mx,my)){
    state.dragging = true;
    state.last = { x: mx, y: my };
  }
});
window.addEventListener("mouseup", ()=> state.dragging=false);

canvas.addEventListener("mousemove", (e)=>{
  if(!state.dragging) return;
  const { mx, my } = canvasCoords(e);
  const dx = mx - state.last.x;
  const dy = my - state.last.y;
  state.design.x += dx;
  state.design.y += dy;
  state.last = { x: mx, y: my };
  clampDesignToPrintArea();
  draw();
});

canvas.addEventListener("wheel", (e)=>{
  if(!state.designImg) return;
  e.preventDefault();
  const delta = Math.sign(e.deltaY);

  if(e.shiftKey){
    state.design.r += delta * 0.08;
  } else {
    state.design.s *= (delta > 0 ? 0.92 : 1.08);
    state.design.s = Math.max(0.25, Math.min(3.2, state.design.s));
  }

  clampDesignToPrintArea();
  draw();
}, { passive:false });

designFile.addEventListener("change", (e)=>{
  const f = e.target.files?.[0];
  if(!f) return;

  const img = new Image();
  img.onload = () => {
    state.designImg = img;
    state.design = { x: PRINT_AREA.x + PRINT_AREA.w/2, y: PRINT_AREA.y + PRINT_AREA.h/2, s: 1, r: 0 };
    clampDesignToPrintArea();
    draw();
  };
  img.src = URL.createObjectURL(f);
});

// UI buttons
colorSelect.addEventListener("change", ()=>{
  state.color = colorSelect.value;
  // Por ahora no cambia el mockup, solo guardamos el color en el item del carrito
});

btnCenter.addEventListener("click", ()=>{
  state.design.x = PRINT_AREA.x + PRINT_AREA.w/2;
  state.design.y = PRINT_AREA.y + PRINT_AREA.h/2;
  clampDesignToPrintArea();
  draw();
});

btnReset.addEventListener("click", ()=>{
  state.design = { x: PRINT_AREA.x + PRINT_AREA.w/2, y: PRINT_AREA.y + PRINT_AREA.h/2, s: 1, r: 0 };
  clampDesignToPrintArea();
  draw();
});

btnRemove.addEventListener("click", ()=>{
  state.designImg = null;
  draw();
});

btnZoomIn.addEventListener("click", ()=>{
  if(!state.designImg) return;
  state.design.s = Math.min(3.2, state.design.s * 1.08);
  clampDesignToPrintArea();
  draw();
});
btnZoomOut.addEventListener("click", ()=>{
  if(!state.designImg) return;
  state.design.s = Math.max(0.25, state.design.s * 0.92);
  clampDesignToPrintArea();
  draw();
});

btnRotL.addEventListener("click", ()=>{
  if(!state.designImg) return;
  state.design.r -= 0.12;
  draw();
});
btnRotR.addEventListener("click", ()=>{
  if(!state.designImg) return;
  state.design.r += 0.12;
  draw();
});

btnAddToCart.addEventListener("click", ()=>{
  const previewDataUrl = canvas.toDataURL("image/png");
  addItemToCart({
    type: state.designImg ? "custom" : "product",
    productId: product.id,
    name: state.designImg ? `${product.name} (Personalizada)` : product.name,
    price: product.price,
    color: state.color,
    previewDataUrl
  });
  refreshCartCount();
  alert("Agregado al carrito ✅");
});

refreshCartCount();
loadBase();
