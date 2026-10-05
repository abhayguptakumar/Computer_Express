const CART_KEY = "computerExpressCart";

function getCart(){ return JSON.parse(localStorage.getItem(CART_KEY) || "[]"); }
function saveCart(cart){ localStorage.setItem(CART_KEY, JSON.stringify(cart)); updateCartCount(); }
function cartCount(){ return getCart().reduce((n,i)=>n+i.qty,0); }
function updateCartCount(){
  document.querySelectorAll("[data-cart-count]").forEach(el=>el.textContent=cartCount());
}
function addToCart(id, qty=1){
  const product=PRODUCTS.find(p=>p.id===id); if(!product) return;
  const cart=getCart(); const item=cart.find(i=>i.id===id);
  if(item) item.qty=Math.min(item.qty+qty, product.stock); else cart.push({id,qty:Math.min(qty,product.stock)});
  saveCart(cart); toast(`${product.name} added to cart`);
}
function removeFromCart(id){ saveCart(getCart().filter(i=>i.id!==id)); renderCartPage(); }
function setQty(id,qty){
  const product=PRODUCTS.find(p=>p.id===id); const cart=getCart(); const item=cart.find(i=>i.id===id);
  if(!item||!product)return; item.qty=Math.max(1,Math.min(Number(qty)||1,product.stock)); saveCart(cart); renderCartPage();
}
function money(n){return "₹"+Number(n).toLocaleString("en-IN");}
function toast(msg){
  let el=document.getElementById("toast");
  if(!el){el=document.createElement("div");el.id="toast";el.style.cssText="position:fixed;right:20px;bottom:20px;z-index:100;padding:13px 16px;border:1px solid rgba(255,255,255,.15);border-radius:14px;background:rgba(7,19,38,.94);color:white;backdrop-filter:blur(16px);box-shadow:0 15px 40px rgba(0,0,0,.35);font-size:13px";document.body.appendChild(el)}
  el.textContent=msg; clearTimeout(window.__toast); window.__toast=setTimeout(()=>el.remove(),2200);
}
function header(){
  return `<header class="site-header"><nav class="nav">
    <a class="logo" href="${pathRoot()}index.html"><span class="logo-mark">CE</span><span>COMPUTER EXPRESS<small>FAST • RELIABLE • PROFESSIONAL</small></span></a>
    <div class="nav-links">
      <a href="${pathRoot()}index.html">Home</a><a href="${pathRoot()}pages/products.html">Shop</a><a href="${pathRoot()}index.html#services">Services</a>
      <a href="${pathRoot()}pages/about.html">About</a><a href="${pathRoot()}pages/contact.html">Contact</a>
    </div>
    <div class="nav-actions"><a class="icon-btn" href="${pathRoot()}pages/cart.html" aria-label="Cart">🛒</a><span class="cart-count" data-cart-count>0</span><a class="icon-btn" href="${pathRoot()}pages/login.html" aria-label="Login">◉</a><button class="icon-btn menu-btn" type="button">☰</button></div>
  </nav></header>`;
}
function footer(){
  return `<footer class="site-footer"><div class="footer-grid">
    <div><a class="logo" href="${pathRoot()}index.html"><span class="logo-mark">CE</span><span>COMPUTER EXPRESS<small>TRUSTED COMPUTER SOLUTIONS</small></span></a><p>Products bhi, service bhi — sab ek hi jagah.</p></div>
    <div><h4>Shop</h4><a href="${pathRoot()}pages/products.html">All Products</a><a href="${pathRoot()}pages/cart.html">Cart</a><a href="${pathRoot()}pages/checkout.html">Checkout</a></div>
    <div><h4>Company</h4><a href="${pathRoot()}pages/about.html">About</a><a href="${pathRoot()}pages/contact.html">Contact</a><a href="${pathRoot()}pages/faq.html">FAQs</a></div>
    <div><h4>Policies</h4><a href="${pathRoot()}pages/terms.html">Terms</a><a href="${pathRoot()}pages/privacy.html">Privacy</a><a href="${pathRoot()}pages/refund.html">Refund Policy</a></div>
  </div><div class="footer-bottom">© 2026 Computer Express • Form 1 Frontend</div></footer>`;
}
function pathRoot(){ return location.pathname.includes("/pages/") ? "../" : ""; }
function productCard(p){
  return `<article class="product-card glass"><a href="${pathRoot()}pages/product-details.html?id=${encodeURIComponent(p.id)}"><div class="product-img">${p.icon}</div></a><div class="product-body">
    <span class="product-category">${p.category}</span><h3 class="product-title">${p.name}</h3>
    <div class="product-meta"><span class="price">${money(p.price)}</span><span class="stock">${p.stock} in stock</span></div>
    <div class="card-actions"><a class="btn btn-secondary" href="${pathRoot()}pages/product-details.html?id=${encodeURIComponent(p.id)}">Details</a><button class="btn btn-primary" type="button" onclick="addToCart('${p.id}')">Add</button></div>
  </div></article>`;
}
function renderFeatured(){
  const el=document.getElementById("featured-products"); if(!el)return;
  el.innerHTML=PRODUCTS.slice(0,4).map(productCard).join("");
}
function renderProducts(){
  const grid=document.getElementById("products-grid"); if(!grid)return;
  const search=(document.getElementById("product-search")?.value||"").toLowerCase();
  const cat=new URLSearchParams(location.search).get("category")||"All";
  const list=PRODUCTS.filter(p=>(cat==="All"||p.category===cat)&&(p.name.toLowerCase().includes(search)||p.category.toLowerCase().includes(search)));
  grid.innerHTML=list.length?list.map(productCard).join(""):`<div class="empty glass" style="grid-column:1/-1"><h3>No products found</h3><p>Try another search or category.</p></div>`;
}
function renderCartPage(){
  const root=document.getElementById("cart-root"); if(!root)return;
  const cart=getCart();
  if(!cart.length){root.innerHTML=`<div class="empty glass"><h2>Your cart is empty</h2><p>Add products from the shop to continue.</p><a class="btn btn-primary" href="products.html">Browse Products</a></div>`;return}
  let subtotal=0;
  const rows=cart.map(item=>{const p=PRODUCTS.find(x=>x.id===item.id);const line=p.price*item.qty;subtotal+=line;return `<div class="summary-item"><span><b>${p.name}</b><br><small>${money(p.price)} × ${item.qty}</small></span><span>${money(line)} <button class="qty-btn" onclick="removeFromCart('${p.id}')" aria-label="Remove">×</button></span></div>`}).join("");
  root.innerHTML=`<div class="checkout-grid"><section class="panel glass"><h2>Cart Items</h2>${rows}</section><aside class="panel glass"><h2>Summary</h2><div class="summary-item"><span>Subtotal</span><b>${money(subtotal)}</b></div><div class="summary-item"><span>Delivery</span><span>Calculated at checkout</span></div><div class="summary-total"><span>Total</span><span>${money(subtotal)}</span></div><a class="btn btn-primary" style="width:100%;margin-top:20px" href="checkout.html">Proceed to Checkout</a></aside></div>`;
}
function init(){
  document.getElementById("site-header")?.insertAdjacentHTML("beforeend",header());
  document.getElementById("site-footer")?.insertAdjacentHTML("beforeend",footer());
  updateCartCount(); renderFeatured(); renderProducts(); renderCartPage();
  document.getElementById("product-search")?.addEventListener("input",renderProducts);
  document.getElementById("category-filter")?.addEventListener("change",e=>{const u=new URL(location.href); if(e.target.value==="All")u.searchParams.delete("category");else u.searchParams.set("category",e.target.value);location.href=u});
}
document.addEventListener("DOMContentLoaded",init);