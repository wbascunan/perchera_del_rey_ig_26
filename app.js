// ------- Mini catálogo (luego lo traemos desde la DB) -------
const CATALOG = [
    { id: "p1", name: "Polera 'Gracia'", price: 12990, desc: "Minimalista, elegante, con propósito." },
    { id: "p2", name: "Polera 'Fe'", price: 11990, desc: "Para días de montaña y valle." },
    { id: "p3", name: "Polera 'Luz'", price: 13990, desc: "Brilla sin gritar." },
  ];
  
  const $ = (s) => document.querySelector(s);
  
  const productsEl = $("#products");
  const cartDrawer = $("#cartDrawer");
  const backdrop = $("#backdrop");
  const cartCount = $("#cartCount");
  const cartItems = $("#cartItems");
  const cartTotal = $("#cartTotal");
  
  const CART_KEY = "perchera_cart_v1";
  
  function moneyCLP(n){
    return n.toLocaleString("es-CL", { style:"currency", currency:"CLP" });
  }
  
  function loadCart(){
    try { return JSON.parse(localStorage.getItem(CART_KEY) || "[]"); }
    catch { return []; }
  }
  function saveCart(cart){
    localStorage.setItem(CART_KEY, JSON.stringify(cart));
    renderCart();
  }
  
  function addToCart(item){
    const cart = loadCart();
    cart.push(item);
    saveCart(cart);
    openCart();
  }
  
  function removeFromCart(index){
    const cart = loadCart();
    cart.splice(index, 1);
    saveCart(cart);
  }
  
  function renderCatalog(){
    productsEl.innerHTML = "";
    CATALOG.forEach(p => {
      const div = document.createElement("div");
      div.className = "product";
      div.innerHTML = `
        <div class="name">${p.name}</div>
        <div class="price">${moneyCLP(p.price)}</div>
        <div class="meta">${p.desc}</div>
        <div class="actions">
          <button class="btn ghost" data-add="${p.id}">Agregar (sin diseño)</button>
        </div>
      `;
      productsEl.appendChild(div);
    });
  
    productsEl.addEventListener("click", (e) => {
      const id = e.target?.dataset?.add;
      if(!id) return;
      const p = CATALOG.find(x => x.id === id);
      addToCart({ type:"product", productId:p.id, name:p.name, price:p.price });
    }, { once:false });
  }
  
  function renderCart(){
    const cart = loadCart();
    cartCount.textContent = String(cart.length);
  
    cartItems.innerHTML = "";
    let total = 0;
  
    cart.forEach((it, idx) => {
      total += it.price || 0;
      const row = document.createElement("div");
      row.className = "cartItem";
  
      const thumb = document.createElement("img");
      thumb.className = "thumb";
      thumb.src = it.previewDataUrl || makePlaceholderThumb(it.name || "Item");
      thumb.alt = "preview";
  
      const mid = document.createElement("div");
      mid.innerHTML = `
        <div style="font-weight:700">${it.name || "Item"}</div>
        <div class="micro">${it.type === "custom" ? "Polera personalizada" : "Producto"}</div>
        <div class="micro">${moneyCLP(it.price || 0)}</div>
      `;
  
      const btn = document.createElement("button");
      btn.className = "btn ghost";
      btn.textContent = "Quitar";
      btn.onclick = () => removeFromCart(idx);
  
      row.appendChild(thumb);
      row.appendChild(mid);
      row.appendChild(btn);
      cartItems.appendChild(row);
    });
  
    cartTotal.textContent = moneyCLP(total);
  }
  
  function makePlaceholderThumb(text){
    const c = document.createElement("canvas");
    c.width = 180; c.height = 180;
    const ctx = c.getContext("2d");
    ctx.fillStyle = "#101425";
    ctx.fillRect(0,0,c.width,c.height);
    ctx.fillStyle = "rgba(124,58,237,.85)";
    ctx.fillRect(0,0,c.width,6);
    ctx.fillStyle = "rgba(255,255,255,.88)";
    ctx.font = "bold 18px system-ui";
    ctx.fillText("👑", 12, 34);
    ctx.font = "14px system-ui";
    wrapText(ctx, text, 12, 70, 156, 18);
    return c.toDataURL("image/png");
  }
  function wrapText(ctx, text, x, y, maxW, lh){
    const words = text.split(" ");
    let line = "";
    for (let n = 0; n < words.length; n++){
      const test = line + words[n] + " ";
      if (ctx.measureText(test).width > maxW && n > 0){
        ctx.fillText(line, x, y);
        line = words[n] + " ";
        y += lh;
      } else line = test;
    }
    ctx.fillText(line, x, y);
  }
  
  function openCart(){
    cartDrawer.classList.add("open");
    backdrop.classList.add("show");
  }
  function closeCart(){
    cartDrawer.classList.remove("open");
    backdrop.classList.remove("show");
  }
  
  // ------- Personalizador (Canvas simple: drag/zoom/rotate) -------
  const canvas = $("#designer");
  const ctx = canvas.getContext("2d");
  
  const state = {
    shirtImg: null,
    designImg: null,
    design: { x: 260, y: 310, s: 1, r: 0 },
    dragging: false,
    last: { x:0, y:0 }
  };
  
  function loadBaseShirt(){
    // Polera base dibujada “vector style” en canvas (sin assets externos)
    // Para pro: luego reemplazamos por imagen real de producto (DB)
    state.shirtImg = null;
    draw();
  }
  
  function drawShirt(){
    // Polera estilizada
    ctx.save();
    ctx.translate(canvas.width/2, canvas.height/2);
  
    const w = 360, h = 420;
    ctx.beginPath();
    // cuerpo
    roundedRect(ctx, -w/2, -h/2+40, w, h, 28);
    ctx.fillStyle = "rgba(255,255,255,.10)";
    ctx.fill();
  
    // mangas
    ctx.beginPath();
    roundedRect(ctx, -w/2-90, -h/2+80, 120, 150, 26);
    ctx.fillStyle = "rgba(255,255,255,.08)";
    ctx.fill();
    ctx.beginPath();
    roundedRect(ctx, w/2-30, -h/2+80, 120, 150, 26);
    ctx.fill();
  
    // cuello
    ctx.beginPath();
    ctx.arc(0, -h/2+80, 46, 0, Math.PI*2);
    ctx.fillStyle = "rgba(0,0,0,.20)";
    ctx.fill();
  
    // borde suave
    ctx.strokeStyle = "rgba(255,255,255,.12)";
    ctx.lineWidth = 2;
    ctx.stroke();
  
    ctx.restore();
  }
  
  function roundedRect(ctx, x, y, w, h, r){
    const rr = Math.min(r, w/2, h/2);
    ctx.moveTo(x+rr, y);
    ctx.arcTo(x+w, y, x+w, y+h, rr);
    ctx.arcTo(x+w, y+h, x, y+h, rr);
    ctx.arcTo(x, y+h, x, y, rr);
    ctx.arcTo(x, y, x+w, y, rr);
    ctx.closePath();
  }
  
  function draw(){
    ctx.clearRect(0,0,canvas.width,canvas.height);
  
    // fondo con glow
    ctx.fillStyle = "rgba(124,58,237,.10)";
    ctx.fillRect(0,0,canvas.width,canvas.height);
  
    drawShirt();
  
    if(state.designImg){
      ctx.save();
      ctx.translate(state.design.x, state.design.y);
      ctx.rotate(state.design.r);
      const iw = state.designImg.width;
      const ih = state.designImg.height;
      const scale = 0.35 * state.design.s;
  
      ctx.globalAlpha = 0.98;
      ctx.drawImage(state.designImg, -iw*scale/2, -ih*scale/2, iw*scale, ih*scale);
  
      // marco sutil
      ctx.strokeStyle = "rgba(255,255,255,.20)";
      ctx.lineWidth = 2;
      ctx.strokeRect(-iw*scale/2, -ih*scale/2, iw*scale, ih*scale);
  
      ctx.restore();
    }
  }
  
  function isInsideDesign(mx, my){
    if(!state.designImg) return false;
    const iw = state.designImg.width;
    const ih = state.designImg.height;
    const scale = 0.35 * state.design.s;
  
    // aproximación (AABB sin rotación): suficiente para MVP
    const left = state.design.x - (iw*scale/2);
    const top  = state.design.y - (ih*scale/2);
    return mx >= left && mx <= left + iw*scale && my >= top && my <= top + ih*scale;
  }
  
  canvas.addEventListener("mousedown", (e)=>{
    const r = canvas.getBoundingClientRect();
    const mx = (e.clientX - r.left) * (canvas.width / r.width);
    const my = (e.clientY - r.top) * (canvas.height / r.height);
  
    if(isInsideDesign(mx,my)){
      state.dragging = true;
      state.last = { x: mx, y: my };
    }
  });
  
  window.addEventListener("mouseup", ()=> state.dragging=false);
  
  canvas.addEventListener("mousemove", (e)=>{
    if(!state.dragging) return;
    const r = canvas.getBoundingClientRect();
    const mx = (e.clientX - r.left) * (canvas.width / r.width);
    const my = (e.clientY - r.top) * (canvas.height / r.height);
  
    const dx = mx - state.last.x;
    const dy = my - state.last.y;
  
    state.design.x += dx;
    state.design.y += dy;
    state.last = { x: mx, y: my };
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
    draw();
  }, { passive:false });
  
  $("#designFile").addEventListener("change", (e)=>{
    const f = e.target.files?.[0];
    if(!f) return;
  
    const img = new Image();
    img.onload = () => {
      state.designImg = img;
      state.design = { x: 260, y: 320, s: 1, r: 0 };
      draw();
    };
    img.src = URL.createObjectURL(f);
  });
  
  $("#btnReset").addEventListener("click", ()=>{
    state.design = { x: 260, y: 320, s: 1, r: 0 };
    draw();
  });
  
  $("#btnAddToCart").addEventListener("click", ()=>{
    // “producto base” demo
    const base = CATALOG[0];
    const preview = canvas.toDataURL("image/png");
  
    addToCart({
      type: "custom",
      productId: base.id,
      name: base.name + " (Personalizada)",
      price: base.price,
      previewDataUrl: preview
    });
  });
  
  // Drawer
  $("#btnCart").addEventListener("click", openCart);
  $("#btnCloseCart").addEventListener("click", closeCart);
  backdrop.addEventListener("click", closeCart);
  
  $("#btnCheckout").addEventListener("click", ()=>{
    alert("Checkout demo ✅\nSiguiente paso: usuarios + órdenes en Supabase.");
  });
  
  // Login demo (luego Supabase)
  $("#btnLogin").addEventListener("click", ()=>{
    alert("Siguiente paso: Login real con Supabase Auth ✅");
  });
  
  renderCatalog();
  loadBaseShirt();
  renderCart();
  