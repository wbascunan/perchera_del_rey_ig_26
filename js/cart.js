// /js/cart.js
const CART_KEY = "perchera_cart_v1";

export function loadCart(){
  try { return JSON.parse(localStorage.getItem(CART_KEY) || "[]"); }
  catch { return []; }
}
export function saveCart(cart){
  localStorage.setItem(CART_KEY, JSON.stringify(cart));
}
export function addItemToCart(item){
  const cart = loadCart();
  cart.push({
    ...item,
    id: crypto?.randomUUID ? crypto.randomUUID() : String(Date.now() + Math.random())
  });
  saveCart(cart);
}
export function removeItem(id){
  const cart = loadCart().filter(x => x.id !== id);
  saveCart(cart);
}
export function clearCart(){
  saveCart([]);
}
export function getCartCount(){
  return loadCart().length;
}

function moneyCLP(n){
  return n.toLocaleString("es-CL", { style:"currency", currency:"CLP" });
}
function placeholderThumb(text){
  const c = document.createElement("canvas");
  c.width = 220; c.height = 220;
  const ctx = c.getContext("2d");
  ctx.fillStyle = "#101425";
  ctx.fillRect(0,0,c.width,c.height);
  ctx.fillStyle = "rgba(124,58,237,.85)";
  ctx.fillRect(0,0,c.width,8);
  ctx.fillStyle = "rgba(255,255,255,.9)";
  ctx.font = "bold 18px system-ui";
  ctx.fillText("👑", 14, 34);
  ctx.font = "14px system-ui";
  wrap(ctx, text, 14, 70, 192, 18);
  return c.toDataURL("image/png");
}
function wrap(ctx, text, x, y, maxW, lh){
  const words = text.split(" ");
  let line = "";
  for (let i=0;i<words.length;i++){
    const test = line + words[i] + " ";
    if(ctx.measureText(test).width > maxW && i>0){
      ctx.fillText(line, x, y);
      line = words[i] + " ";
      y += lh;
    } else line = test;
  }
  ctx.fillText(line, x, y);
}

// Si estamos en cart.html, renderizamos
const cartList = document.querySelector("#cartList");
const totalEl = document.querySelector("#total");
const checkoutBtn = document.querySelector("#checkout");

if(cartList && totalEl){
  renderCartUI();

  checkoutBtn?.addEventListener("click", ()=>{
    alert("Checkout demo ✅\nSiguiente: usuarios + órdenes en Supabase.");
  });
}

function renderCartUI(){
  const cart = loadCart();
  cartList.innerHTML = "";

  if(cart.length === 0){
    cartList.innerHTML = `<div class="micro">Tu carrito está vacío. Vuelve al catálogo y elige una polera 👑</div>`;
    totalEl.textContent = moneyCLP(0);
    return;
  }

  let total = 0;

  cart.forEach(item => {
    total += item.price || 0;

    const row = document.createElement("div");
    row.className = "cartItem";

    const img = document.createElement("img");
    img.src = item.previewDataUrl || placeholderThumb(item.name || "Item");
    img.alt = "preview";

    const mid = document.createElement("div");
    mid.innerHTML = `
      <div style="font-weight:800">${item.name || "Item"}</div>
      <div class="micro">${item.color ? `Color: ${item.color}` : ""} ${item.type === "custom" ? "• Personalizada" : ""}</div>
      <div class="micro">${moneyCLP(item.price || 0)}</div>
    `;

    const btn = document.createElement("button");
    btn.className = "btn ghost";
    btn.textContent = "Quitar";
    btn.addEventListener("click", ()=>{
      removeItem(item.id);
      renderCartUI();
    });

    row.appendChild(img);
    row.appendChild(mid);
    row.appendChild(btn);
    cartList.appendChild(row);
  });

  totalEl.textContent = moneyCLP(total);
}
