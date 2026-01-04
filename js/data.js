// /js/data.js
export const PRODUCTS = [
  // POLERAS (con tallas + colores + mockups)
  {
    id: "tee-gracia",
    type: "ropa",
    name: "Polera “Gracia”",
    desc: "Minimalista, elegante, con propósito.",
    category: "Ropa",
    image:"assets/img/ropa/modelo2.png",
    tags: ["minimal", "premium", "polera"],
    sizes: ["S","M","L","XL"],
    colors: [
      { key:"negra", label:"Negra", hex:"#111827", mockupKey:"tee_black" },
      { key:"blanca", label:"Blanca", hex:"#f8fafc", mockupKey:"tee_white" },
      { key:"beige", label:"Beige", hex:"#e7dcc7", mockupKey:"tee_beige" },
    ],
    price: 17990,
    discountPrice: 12990,
    stockByVariant: { "negra:S": 6, "negra:M": 12, "negra:L": 7, "negra:XL": 2, "blanca:M": 4, "beige:L": 5 },
    shipping: { eta: "24-72 hrs", cost: 2990, freeOver: 30000 },
    rating: 4.7,
    reviewsCount: 128
  },
  {
    id: "tee-fe",
    type: "ropa",
    name: "Polera “Fe”",
    desc: "Para días de montaña y valle.",
    category: "Ropa",
    image:"assets/img/ropa/modelo1.png",
    tags: ["versiculos","tipografia","polera"],
    sizes: ["S","M","L","XL"],
    colors: [
      { key:"negra", label:"Negra", hex:"#111827", mockupKey:"tee_black" },
      { key:"blanca", label:"Blanca", hex:"#f8fafc", mockupKey:"tee_white" },
    ],
    price: 15990,
    discountPrice: 11990,
    stockByVariant: { "negra:M": 3, "negra:L": 1, "blanca:S": 0, "blanca:M": 6, "blanca:L": 5, "blanca:XL": 2 },
    shipping: { eta: "24-72 hrs", cost: 2990, freeOver: 30000 },
    rating: 4.5,
    reviewsCount: 74
  },

  // TAZAS
  {
    id: "mug-versiculo-1",
    type: "taza",
    name: "Taza “Juan 3:16”",
    desc: "Blanca, minimal, con versículo icónico.",
    category: "Tazas",
    image:"assets/img/tazas/taza1.png",
    tags: ["versiculos","taza","regalo"],
    sizes: null,
    colors: [
      { key:"blanca", label:"Blanca", hex:"#f8fafc", mockupKey:"mug_white" },
      { key:"negra", label:"Negra", hex:"#111827", mockupKey:"mug_black" },
    ],
    price: 9990,
    discountPrice: 7990,
    stockByVariant: { "blanca": 18, "negra": 8 },
    shipping: { eta: "24-72 hrs", cost: 2990, freeOver: 30000 },
    rating: 4.8,
    reviewsCount: 52
  },

  // BOLSOS
  {
    id: "bag-minimal-1",
    type: "bolso",
    name: "Bolso “Luz”",
    desc: "Bolso tote minimal para todos los días.",
    category: "Bolsos",
    image: "assets/img/bolsos/bolso1.png",
    tags: ["minimal","bolso","tote"],
    sizes: null,
    colors: [
      { key:"beige", label:"Beige", hex:"#e7dcc7", mockupKey:"bag_beige" },
      { key:"negra", label:"Negra", hex:"#111827", mockupKey:"bag_black" },
    ],
    price: 12990,
    discountPrice: 10990,
    stockByVariant: { "beige": 10, "negra": 4 },
    shipping: { eta: "24-72 hrs", cost: 2990, freeOver: 30000 },
    rating: 4.4,
    reviewsCount: 21
  }
];

// Mockups simples (SVG data URL) por tipo/color.
// Puedes reemplazar estos por imágenes reales después.
export function getMockupDataUrl(mockupKey){
  const map = {
    tee_black: teeSvg("#111827"),
    tee_white: teeSvg("#f8fafc"),
    tee_beige: teeSvg("#e7dcc7"),
    mug_white: mugSvg("#f8fafc"),
    mug_black: mugSvg("#111827"),
    bag_beige: bagSvg("#e7dcc7"),
    bag_black: bagSvg("#111827"),
  };
  return map[mockupKey] || teeSvg("#f8fafc");
}

function svgData(svg){
  return "data:image/svg+xml;utf8," + encodeURIComponent(svg);
}

function teeSvg(color){
  return svgData(`
  <svg xmlns='http://www.w3.org/2000/svg' width='800' height='920'>
    <defs>
      <linearGradient id='bg' x1='0' y1='0' x2='0' y2='1'>
        <stop offset='0' stop-color='#ffffff'/>
        <stop offset='1' stop-color='#f3f4f6'/>
      </linearGradient>
    </defs>
    <rect width='100%' height='100%' fill='url(#bg)'/>
    <g transform='translate(120,120)'>
      <path d='M170 60 C210 20 250 0 290 0 C330 0 370 20 410 60 L520 120 L460 250 L410 210 L410 690 C410 740 380 780 330 780 L250 780 C200 780 170 740 170 690 L170 210 L120 250 L60 120 Z'
        fill='${color}' stroke='rgba(15,23,42,0.14)' stroke-width='6' />
      <circle cx='290' cy='120' r='55' fill='rgba(0,0,0,0.12)'/>
      <rect x='220' y='235' width='140' height='220' rx='22' fill='rgba(255,255,255,0.06)' stroke='rgba(15,23,42,0.12)'/>
    </g>
    <text x='50%' y='860' fill='rgba(15,23,42,0.45)' font-family='Arial' font-size='26' text-anchor='middle'>Mockup Polera</text>
  </svg>`);
}

function mugSvg(color){
  return svgData(`
  <svg xmlns='http://www.w3.org/2000/svg' width='800' height='920'>
    <rect width='100%' height='100%' fill='#ffffff'/>
    <g transform='translate(170,210)'>
      <rect x='0' y='0' width='360' height='420' rx='42' fill='${color}' stroke='rgba(15,23,42,0.14)' stroke-width='6'/>
      <path d='M360 110 C430 110 450 140 450 210 C450 280 430 310 360 310' fill='none' stroke='rgba(15,23,42,0.18)' stroke-width='18'/>
      <rect x='70' y='90' width='220' height='220' rx='26' fill='rgba(255,255,255,0.06)' stroke='rgba(15,23,42,0.12)'/>
    </g>
    <text x='50%' y='860' fill='rgba(15,23,42,0.45)' font-family='Arial' font-size='26' text-anchor='middle'>Mockup Taza</text>
  </svg>`);
}

function bagSvg(color){
  return svgData(`
  <svg xmlns='http://www.w3.org/2000/svg' width='800' height='920'>
    <rect width='100%' height='100%' fill='#ffffff'/>
    <g transform='translate(190,190)'>
      <rect x='0' y='120' width='420' height='430' rx='46' fill='${color}' stroke='rgba(15,23,42,0.14)' stroke-width='6'/>
      <path d='M100 120 C100 30 320 30 320 120' fill='none' stroke='rgba(15,23,42,0.18)' stroke-width='18'/>
      <rect x='110' y='210' width='200' height='220' rx='26' fill='rgba(255,255,255,0.06)' stroke='rgba(15,23,42,0.12)'/>
    </g>
    <text x='50%' y='860' fill='rgba(15,23,42,0.45)' font-family='Arial' font-size='26' text-anchor='middle'>Mockup Bolso</text>
  </svg>`);
}
