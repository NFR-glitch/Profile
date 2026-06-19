// Base URL API (untuk deploy tidak hardcode localhost)
// Default: same-origin (frontend & backend bisa host di domain yang sama via proxy)
// Contoh production (kalau backend beda domain): set window.ARTICLE_API di HTML atau gunakan ENV saat build.
// Ambil dari backend (sesuai Backend di Profile_projek: port 3000)
// Jika deploy, ganti ke URL backend yang sesuai.
const ARTICLE_API = window.ARTICLE_API || "http://localhost:3000/articles";


const articleContainer = document.getElementById("article-container");

// =====================
// LOAD ARTICLES
// =====================
async function getArticles() {
  try {
    const response = await fetch(ARTICLE_API);
    const articles = await response.json();

    articleContainer.innerHTML = "";

    articles.forEach((article) => {
      articleContainer.innerHTML += `
        <div class="card">
          <h2>${article.title}</h2>

          <small>
            Ditulis oleh ${article.writer}
          </small>

          <p>${article.content}</p>
        </div>
      `;
    });
  } catch (error) {
    console.error("Error mengambil artikel:", error);
  }
}

// =====================
// LOAD PROFILE + MAP
// =====================
function loadMap() {
  if (!navigator.geolocation) {
    alert("Browser tidak mendukung Geolocation");
    return;
  }

  navigator.geolocation.getCurrentPosition(
    (position) => {
      const lat = position.coords.latitude;
      const lng = position.coords.longitude;

      const map = L.map("map").setView([lat, lng], 15);

      L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: "&copy; OpenStreetMap",
      }).addTo(map);

      L.marker([lat, lng]).addTo(map).bindPopup("Lokasi Saya Saat Ini").openPopup();

      console.log("Latitude:", lat);
      console.log("Longitude:", lng);
    },
    (error) => {
      console.error(error);
      alert("Gagal mendapatkan lokasi");
    },
  );
}
// =====================
// SERVICE WORKER
// =====================
if ("serviceWorker" in navigator) {
  window.addEventListener("load", async () => {
    try {
      const registration = await navigator.serviceWorker.register("./profile_pwa/sw.js");
      console.log("Service Worker Registered:", registration);
    } catch (error) {
      console.error("Service Worker gagal:", error);
    }
  });
}

// =====================
// NOTIFICATION & PUSH TEST
// =====================
async function testPushNotification() {
  if (!("Notification" in window)) {
    alert("Browser Anda tidak mendukung Push Notification.");
    return;
  }

  const permission = await Notification.requestPermission();
  if (permission !== "granted") {
    alert("Izin notifikasi ditolak. Silakan aktifkan izin notifikasi di browser Anda.");
    return;
  }

  const registration = await navigator.serviceWorker.ready;
  if (registration && registration.active) {
    registration.active.postMessage("Web Push Notification Berhasil");
  } else {
    alert("Service Worker belum aktif. Silakan reload halaman.");
  }
}

async function showNotification() {
  if (!("Notification" in window)) {
    return;
  }

  const permission = await Notification.requestPermission();
  if (permission === "granted") {
    new Notification("Website Profile", {
      body: "Selamat datang di website profile Naqris Fatkhur Rozak",
      icon: "./icon-192.png"
    });
  }
}

// =====================
// RUN
// =====================
getArticles();
loadMap();
showNotification();