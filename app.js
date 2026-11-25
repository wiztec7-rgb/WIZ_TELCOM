const packageDetails = {
  basic: { name: "Quick Connect · 30 minutes", price: "NLe 5" },
  standard: { name: "Everyday · 1 hour", price: "NLe 10" },
  premium: { name: "Power User · 3 hours", price: "NLe 20" },
  daily: { name: "All Day · 24 hours", price: "NLe 60" }
};

const tabs = document.querySelectorAll(".view-tab");
const portal = document.querySelector("#portal-view");
const admin = document.querySelector("#admin-view");

function setView(view) {
  const showAdmin = view === "admin";
  portal.hidden = showAdmin;
  admin.hidden = !showAdmin;
  tabs.forEach((tab) => {
    const active = tab.dataset.view === view;
    tab.classList.toggle("is-active", active);
    tab.setAttribute("aria-pressed", String(active));
  });
  window.scrollTo({ top: 0, behavior: "smooth" });
}

tabs.forEach((tab) => tab.addEventListener("click", () => setView(tab.dataset.view)));

document.querySelectorAll(".package-card").forEach((card) => {
  card.addEventListener("click", () => {
    document.querySelectorAll(".package-card").forEach((item) => {
      const selected = item === card;
      item.classList.toggle("is-selected", selected);
      item.setAttribute("aria-pressed", String(selected));
    });
    const selectedPackage = packageDetails[card.dataset.package];
    document.querySelector("#selected-name").textContent = selectedPackage.name;
    document.querySelector("#selected-price").textContent = selectedPackage.price;
  });
});

document.querySelector("#order-form").addEventListener("submit", (event) => {
  event.preventDefault();
  const notice = document.querySelector("#result");
  notice.hidden = false;
  notice.classList.add("notice-visible");
  notice.textContent = "This is a visual preview: no order was saved, no payment was taken, and Wi-Fi access was not activated.";
});

document.querySelector("#refresh-orders").addEventListener("click", (event) => {
  const button = event.currentTarget;
  button.classList.add("is-refreshing");
  window.setTimeout(() => button.classList.remove("is-refreshing"), 500);
});

document.querySelector("#year").textContent = new Date().getFullYear();
