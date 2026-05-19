const header = document.querySelector("[data-header]");
const navToggle = document.querySelector(".nav-toggle");
const navMenu = document.querySelector("#nav-menu");
const navLinks = document.querySelectorAll(".nav-menu a");
const revealItems = document.querySelectorAll(".reveal");
const form = document.querySelector("#contact-form");
const formStatus = document.querySelector("#form-status");
const heroVisual = document.querySelector(".hero-visual");
const serviceTabs = document.querySelectorAll("[data-service-tab]");
const servicePanels = document.querySelectorAll("[data-service-panel]");
const serviceRequests = document.querySelectorAll("[data-service-interest]");
let lastScrollY = window.scrollY;

function updateHeader() {
  if (!header) return;

  const currentScrollY = window.scrollY;
  const isMenuOpen = navToggle?.getAttribute("aria-expanded") === "true";
  const shouldHide = currentScrollY > lastScrollY && currentScrollY > 120 && !isMenuOpen;

  header.classList.toggle("is-scrolled", currentScrollY > 16);
  header.classList.toggle("is-hidden", shouldHide);
  lastScrollY = Math.max(currentScrollY, 0);
}

function closeMenu() {
  navToggle?.setAttribute("aria-expanded", "false");
  navMenu?.classList.remove("is-open");
  document.body.classList.remove("nav-open");
}

navToggle?.addEventListener("click", () => {
  const isOpen = navToggle.getAttribute("aria-expanded") === "true";
  navToggle.setAttribute("aria-expanded", String(!isOpen));
  navMenu?.classList.toggle("is-open", !isOpen);
  document.body.classList.toggle("nav-open", !isOpen);
});

navLinks.forEach((link) => {
  link.addEventListener("click", closeMenu);
});

document.addEventListener("keydown", (event) => {
  if (event.key === "Escape") {
    closeMenu();
  }
});

window.addEventListener("scroll", updateHeader, { passive: true });
updateHeader();

if ("IntersectionObserver" in window) {
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.16 }
  );

  revealItems.forEach((item) => observer.observe(item));
} else {
  revealItems.forEach((item) => item.classList.add("is-visible"));
}

if (heroVisual && !window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
  window.addEventListener(
    "pointermove",
    (event) => {
      const x = (event.clientX / window.innerWidth - 0.5) * 14;
      const y = (event.clientY / window.innerHeight - 0.5) * 14;
      heroVisual.style.setProperty("--tilt-x", `${x}px`);
      heroVisual.style.setProperty("--tilt-y", `${y}px`);
    },
    { passive: true }
  );
}

function activateServiceTab(target) {
  serviceTabs.forEach((tab) => {
    const isActive = tab.dataset.serviceTab === target;
    tab.classList.toggle("is-active", isActive);
    tab.setAttribute("aria-selected", String(isActive));
  });

  servicePanels.forEach((panel) => {
    const isActive = panel.dataset.servicePanel === target;
    panel.classList.toggle("is-active", isActive);
    panel.hidden = !isActive;

    if (isActive) {
      panel.querySelectorAll(".reveal").forEach((item) => item.classList.add("is-visible"));
    }
  });
}

serviceTabs.forEach((tab, index) => {
  tab.addEventListener("click", () => activateServiceTab(tab.dataset.serviceTab));
  tab.addEventListener("keydown", (event) => {
    if (event.key !== "ArrowLeft" && event.key !== "ArrowRight") return;
    event.preventDefault();
    const nextIndex = event.key === "ArrowRight"
      ? (index + 1) % serviceTabs.length
      : (index - 1 + serviceTabs.length) % serviceTabs.length;
    serviceTabs[nextIndex].focus();
    activateServiceTab(serviceTabs[nextIndex].dataset.serviceTab);
  });
});

serviceRequests.forEach((link) => {
  link.addEventListener("click", (event) => {
    event.preventDefault();

    const clientType = link.dataset.clientType;
    const serviceInterest = link.dataset.serviceInterest;
    const clientField = form?.querySelector("#tipo_cliente");
    const serviceField = form?.querySelector("#servicio");

    if (clientField && clientType) {
      clientField.value = clientType;
      markInvalid(clientField, false);
    }

    if (serviceField && serviceInterest) {
      serviceField.value = serviceInterest;
    }

    form?.scrollIntoView({ behavior: "smooth", block: "center" });
    setStatus("He preseleccionado el servicio. Completa tus datos para enviar la solicitud.", "is-success");
  });
});

function setStatus(message, type) {
  if (!formStatus) return;
  formStatus.textContent = message;
  formStatus.classList.remove("is-error", "is-success");
  if (type) {
    formStatus.classList.add(type);
  }
}

function markInvalid(field, invalid) {
  field.setAttribute("aria-invalid", String(invalid));
}

form?.addEventListener("submit", (event) => {
  const requiredFields = [
    form.querySelector("#nombre"),
    form.querySelector("#email"),
    form.querySelector("#tipo_cliente"),
    form.querySelector("#mensaje"),
    form.querySelector("#privacidad"),
  ].filter(Boolean);

  let hasError = false;
  requiredFields.forEach((field) => {
    const invalid = !field.value.trim() || !field.checkValidity();
    markInvalid(field, invalid);
    hasError = hasError || invalid;
  });

  if (hasError) {
    event.preventDefault();
    setStatus("Revisa los campos obligatorios antes de enviar.", "is-error");
    return;
  }

  setStatus("Enviando solicitud...", "is-success");
});
