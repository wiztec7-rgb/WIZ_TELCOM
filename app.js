let packages = [];
let selectedPackage = "1h";
const money = n => "NLe " + Number(n).toLocaleString("en-SL", {maximumFractionDigits:2});

async function loadPackages(){
  const res = await fetch("/api/packages");
  packages = await res.json();
  renderPackages();
}
function renderPackages(){
  const icons = {"1h":"◷","1d":"☀","7d":"✦"};
  document.querySelector("#packages").innerHTML = packages.map(p => `
    <article class="package ${p.id===selectedPackage?"selected":""}" data-id="${p.id}" tabindex="0" role="button" aria-label="Select ${p.name}">
      <div class="symbol">${icons[p.id]||"⌁"}</div><h3>${p.name}</h3>
      <div class="duration">${p.duration}</div><div class="price">${money(p.price)} <small>/ pass</small></div><p>${p.description}</p>
    </article>`).join("");
  document.querySelectorAll(".package").forEach(el=>{
    const choose=()=>{selectedPackage=el.dataset.id;renderPackages();updateSummary();};
    el.addEventListener("click",choose);
    el.addEventListener("keydown",e=>{if(e.key==="Enter"||e.key===" "){e.preventDefault();choose();}});
  });
  updateSummary();
}
function updateSummary(){
  const p=packages.find(x=>x.id===selectedPackage);
  if(p){document.querySelector("#selected-name").textContent=p.name;document.querySelector("#selected-price").textContent=money(p.price);}
}
function showResult(html,error=false){
  const box=document.querySelector("#result");box.hidden=false;box.className="result"+(error?" error":"");box.innerHTML=html;
}
document.querySelector("#order-form").addEventListener("submit",async e=>{
  e.preventDefault();
  const btn=document.querySelector("#submit-btn");btn.disabled=true;btn.textContent="Creating order…";
  try{
    const data={name:document.querySelector("#name").value,phone:document.querySelector("#phone").value,
      package_id:selectedPackage,payment_method:document.querySelector("#method").value};
    const res=await fetch("/api/orders",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(data)});
    const order=await res.json();if(!res.ok)throw new Error(order.error||"Could not create order.");
    showResult(`<strong>Order #${order.order_id} created</strong><br>${order.package_name} · ${money(order.amount)}<br>Status: <b>Pending</b><br><br>This is a demo order. No money has been collected.<br><button class="primary" id="demo-pay" type="button" style="margin-top:10px">Simulate successful payment</button>`);
    document.querySelector("#demo-pay").addEventListener("click",()=>simulatePayment(order.order_id));
    await loadOrders();
  }catch(err){showResult(err.message,true);}
  finally{btn.disabled=false;btn.textContent="Create order";}
});
async function simulatePayment(id){
  try{
    const res=await fetch(`/api/orders/${id}/demo-pay`,{method:"POST"});
    const data=await res.json();if(!res.ok)throw new Error(data.error||"Demo payment failed.");
    showResult(`<strong>Demo payment marked successful</strong><br>Demo voucher:<br><span class="voucher">${data.voucher}</span><br><b>Important:</b> No money was collected. This voucher is not connected to a Wi-Fi router and does not grant internet access.<br><small>Order #${id} · DEMO ONLY</small>`);
    await loadOrders();
  }catch(err){showResult(err.message,true);}
}
async function loadOrders(){
  const res=await fetch("/api/admin/orders");const orders=await res.json();
  const tbody=document.querySelector("#orders");
  if(!orders.length){tbody.innerHTML='<tr><td colspan="5">No orders yet.</td></tr>';return;}
  tbody.innerHTML=orders.map(o=>`<tr><td>#${o.id}</td><td>${escapeHtml(o.customer_name)}<br><small>${escapeHtml(o.phone)}</small></td><td>${escapeHtml(o.package_name)}</td><td>${money(o.amount)}</td><td><span class="pill ${o.payment_status==="paid"?"paid":""}">${o.payment_status.toUpperCase()}</span></td></tr>`).join("");
}
function escapeHtml(value){return String(value).replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));}
document.querySelector("#refresh-orders").addEventListener("click",loadOrders);
document.querySelector("#year").textContent=new Date().getFullYear();
loadPackages();loadOrders();
