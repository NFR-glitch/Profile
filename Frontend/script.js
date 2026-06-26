// =====================
// ELEMENT TARGET
// =====================
const articleContainer = document.getElementById("article-container");

// =====================
// LOAD PROFILE (FETCH)
// =====================
async function getProfile() {
  try {
    const res = await fetch("http://localhost:3000/articles");
    if (!res.ok) throw new Error("Gagal mengambil data profile");
    const profile = await res.json();

    if (profile) {
      document.getElementById("nama").textContent = profile.nama || "Naqris Fatkhur Rozak";
      document.getElementById("nim").textContent = "NIM: " + (profile.nim || "-");
      document.getElementById("prodi").textContent = "Prodi: " + (profile.prodi || "-");
      document.getElementById("email").textContent = "Email: " + (profile.email || "-");
      document.getElementById("deskripsi").textContent = profile.deskripsi || "Mahasiswa Informatika";
    }
  } catch (error) {
    console.log("Error fetching profile:", error);
  }
}

// =====================
// LOAD ARTICLES (FETCH)
// =====================
async function getArticles() {
  try {
    const res = await fetch("http://localhost:3000/articles");
    if (!res.ok) throw new Error("Gagal mengambil data artikel");
    const articles = await res.json();

    articleContainer.innerHTML = "";

    if (articles.length === 0) {
      articleContainer.innerHTML = "<p>Belum ada artikel.</p>";
      return;
    }

    articles.forEach((article) => {
      articleContainer.innerHTML += `
        <div class="card">
          <h2>${article.title}</h2>
          <small>Ditulis oleh ${article.writer}</small>
          <p>${article.content}</p>
        </div>
      `;
    });
  } catch (error) {
    console.log("Error fetching articles:", error);
    articleContainer.innerHTML = "<p>Gagal memuat artikel. Pastikan server backend berjalan.</p>";
  }
}

// =====================
// LOAD MAP (OPTIONAL)
// =====================
function loadMap() {
  if (!navigator.geolocation) {
    console.log("Geolocation tidak didukung browser");
    return;
  }

  navigator.geolocation.getCurrentPosition(
    (position) => {
      const lat = position.coords.latitude;
      const lng = position.coords.longitude;

      const map = L.map("map").setView([lat, lng], 15);

      L.tileLayer(
        "https://tile.openstreetmap.org/{z}/{x}/{y}.png",
        {
          attribution: "&copy; OpenStreetMap"
        }
      ).addTo(map);

      L.marker([lat, lng])
        .addTo(map)
        .bindPopup("Lokasi Saya Saat Ini")
        .openPopup();

      console.log("Latitude:", lat);
      console.log("Longitude:", lng);
    },
    (error) => {
      console.log("Lokasi gagal diakses:", error);
    }
  );
}

// =====================
// REGISTER SERVICE WORKER
// =====================
if ("serviceWorker" in navigator) {
  window.addEventListener("load", async () => {
    try {
      const registration = await navigator.serviceWorker.register("sw.js");
      console.log("Service Worker aktif:", registration);
    } catch (error) {
      console.log("Service Worker gagal:", error);
    }
  });
}

// =====================
// PUSH NOTIFICATION TEST
// =====================
async function testPushNotification() {
  if (!("Notification" in window)) {
    alert("Browser tidak mendukung notifikasi");
    return;
  }

  const permission = await Notification.requestPermission();

  if (permission !== "granted") {
    alert("Izin notifikasi ditolak");
    return;
  }

  const registration = await navigator.serviceWorker.ready;

  if (registration && registration.active) {
    registration.active.postMessage("Web Push Notification Berhasil");
  }
}

// =====================
// SHOW NOTIFICATION
// =====================
async function showNotification() {
  if (!("Notification" in window)) {
    return;
  }

  const permission = await Notification.requestPermission();

  if (permission === "granted") {
    new Notification("Website Profile", {
      body: "Selamat datang di website profile Naqris",
      icon: "./icon-192.png"
    });
  }
}

// =====================
// RUN WEBSITE
// =====================
getProfile();
getArticles();
loadMap();
//showNotification();