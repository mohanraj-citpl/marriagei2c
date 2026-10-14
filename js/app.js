const weddingStart = new Date("2026-10-25T00:00:00+05:30");
const address = "Vidhya Maahal, Mahabalipuram 603102, Tamil Nadu, India";

const gate = document.querySelector("#gate");
const openButton = document.querySelector("#open-invite");
const progress = document.querySelector("#progress");
const nav = document.querySelector("#nav");
const toast = document.querySelector("#toast");
const countdownNote = document.querySelector("#countdown-note");
const copyStatus = document.querySelector("#copy-status");

const units = {
  days: document.querySelector('[data-unit="days"]'),
  hours: document.querySelector('[data-unit="hours"]'),
  minutes: document.querySelector('[data-unit="minutes"]'),
  seconds: document.querySelector('[data-unit="seconds"]'),
};

function pad(value) {
  return String(value).padStart(2, "0");
}

function showToast(message) {
  toast.textContent = message;
  toast.classList.add("is-on");
  window.setTimeout(() => toast.classList.remove("is-on"), 2400);
}

function openInvitation() {
  if (gate.classList.contains("is-opening")) return;
  gate.classList.add("is-opening");
  document.body.classList.add("is-open");
  document.body.classList.remove("is-locked");
  window.setTimeout(() => {
    gate.classList.add("is-open");
    gate.setAttribute("aria-hidden", "true");
  }, 1300);
  sessionStorage.setItem("invite-open", "1");
}

function updateCountdown() {
  const now = new Date();
  let distance = weddingStart.getTime() - now.getTime();

  if (distance <= 0) {
    units.days.textContent = "00";
    units.hours.textContent = "00";
    units.minutes.textContent = "00";
    units.seconds.textContent = "00";
    const endOfDay = weddingStart.getTime() + 86400000;
    countdownNote.textContent = now.getTime() < endOfDay
      ? "Today we celebrate."
      : "Thank you for celebrating with us.";
    return;
  }

  const days = Math.floor(distance / 86400000);
  distance -= days * 86400000;
  const hours = Math.floor(distance / 3600000);
  distance -= hours * 3600000;
  const minutes = Math.floor(distance / 60000);
  distance -= minutes * 60000;
  const seconds = Math.floor(distance / 1000);

  units.days.textContent = pad(days);
  units.hours.textContent = pad(hours);
  units.minutes.textContent = pad(minutes);
  units.seconds.textContent = pad(seconds);
}

function downloadCalendar() {
  const ics = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//Thazeen and Syed//Wedding//EN",
    "CALSCALE:GREGORIAN",
    "BEGIN:VEVENT",
    "UID:thazeen-syed-wedding-20261025@invitation",
    "DTSTAMP:20261014T000000Z",
    "DTSTART;VALUE=DATE:20261025",
    "DTEND;VALUE=DATE:20261026",
    "SUMMARY:Wedding of Thazeen Afshan & Syed Adam",
    `LOCATION:${address}`,
    "DESCRIPTION:You are invited to the wedding of Thazeen Afshan and Syed Adam at Vidhya Maahal, Mahabalipuram.",
    "END:VEVENT",
    "END:VCALENDAR",
  ].join("\r\n");

  const file = new Blob([ics], { type: "text/calendar" });
  const url = URL.createObjectURL(file);
  const link = document.createElement("a");
  link.href = url;
  link.download = "thazeen-and-syed-wedding.ics";
  link.click();
  URL.revokeObjectURL(url);
  showToast("Calendar file downloaded");
}

async function copyText(text) {
  try {
    await navigator.clipboard.writeText(text);
    return;
  } catch (error) {
    const field = document.createElement("textarea");
    field.value = text;
    field.setAttribute("readonly", "");
    field.style.position = "fixed";
    field.style.left = "-999px";
    document.body.appendChild(field);
    field.select();
    document.execCommand("copy");
    field.remove();
  }
}

async function shareInvitation() {
  const payload = {
    title: "Thazeen Afshan & Syed Adam",
    text: "You are invited to the wedding of Thazeen Afshan and Syed Adam on 25 October 2026 at Vidhya Maahal, Mahabalipuram.",
    url: window.location.href,
  };

  if (navigator.share) {
    try {
      await navigator.share(payload);
      return;
    } catch (error) {
      if (error && error.name === "AbortError") return;
    }
  }

  await copyText(`${payload.text} ${payload.url}`);
  showToast("Invitation link copied");
}

async function copyAddress() {
  await copyText(address);
  copyStatus.textContent = "Address copied";
  showToast("Address copied");
}

function setupDust() {
  const canvas = document.querySelector("#dust");
  if (!canvas || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

  const context = canvas.getContext("2d");
  const specks = Array.from({ length: 48 }, () => ({
    x: Math.random(),
    y: Math.random(),
    r: Math.random() * 1.6 + 0.4,
    s: Math.random() * 0.18 + 0.04,
    a: Math.random() * 0.45 + 0.15,
  }));

  function resize() {
    canvas.width = canvas.offsetWidth * devicePixelRatio;
    canvas.height = canvas.offsetHeight * devicePixelRatio;
  }

  function frame() {
    context.clearRect(0, 0, canvas.width, canvas.height);
    specks.forEach((speck) => {
      speck.y -= speck.s * 0.012;
      if (speck.y < 0) speck.y = 1;
      context.beginPath();
      context.fillStyle = `rgba(231, 211, 161, ${speck.a})`;
      context.arc(speck.x * canvas.width, speck.y * canvas.height, speck.r * devicePixelRatio, 0, Math.PI * 2);
      context.fill();
    });
    requestAnimationFrame(frame);
  }

  resize();
  frame();
  window.addEventListener("resize", resize);
}

function setupReveal() {
  const nodes = document.querySelectorAll(".reveal");
  if (!("IntersectionObserver" in window)) {
    nodes.forEach((node) => node.classList.add("is-in"));
    return;
  }

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-in");
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.2 }
  );

  nodes.forEach((node) => observer.observe(node));
}

openButton.addEventListener("click", openInvitation);
document.querySelector("#calendar").addEventListener("click", downloadCalendar);
document.querySelector("#nav-calendar").addEventListener("click", downloadCalendar);
document.querySelector("#share").addEventListener("click", shareInvitation);
document.querySelector("#share-bottom").addEventListener("click", shareInvitation);
document.querySelector("#copy-address").addEventListener("click", copyAddress);

document.addEventListener("keydown", (event) => {
  if (event.key === "Enter" && !document.body.classList.contains("is-open")) {
    openInvitation();
  }
});

window.addEventListener("scroll", () => {
  const scrolled = document.documentElement.scrollTop;
  const height = document.documentElement.scrollHeight - window.innerHeight;
  progress.style.width = `${height > 0 ? (scrolled / height) * 100 : 0}%`;
  nav.classList.toggle("is-solid", scrolled > 40);
});

document.body.classList.add("is-locked");

if (sessionStorage.getItem("invite-open") === "1") {
  gate.classList.add("is-opening", "is-open");
  gate.setAttribute("aria-hidden", "true");
  document.body.classList.add("is-open");
  document.body.classList.remove("is-locked");
}

updateCountdown();
window.setInterval(updateCountdown, 1000);
setupDust();
setupReveal();
