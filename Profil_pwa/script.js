// =====================
// ELEMENT TARGET
// =====================
const articleContainer = document.getElementById("article-container");

// =====================
// LOAD ARTICLES (STATIC)
// =====================
function getArticles() {
  const articles = [
    {
      title: "Pentingnya Menjaga Keseimbangan Hidup di Era Digital",
      writer: "Naqris",
      content:
        "Di tengah gempuran notifikasi dan tuntutan untuk selalu terhubung, menjaga keseimbangan hidup menjadi tantangan tersendiri. Menentukan batas waktu penggunaan teknologi membantu menjaga produktivitas dan kesehatan mental."
    },
    {
      title: "Implementasi Progressive Web App",
      writer: "Naqris",
      content:
        "Progressive Web App memungkinkan website berjalan seperti aplikasi mobile. Pengguna dapat menginstall aplikasi langsung dari browser tanpa melalui app store."
    }
  ];

  articleContainer.innerHTML = "";

  articles.forEach((article) => {
    articleContainer.innerHTML += `
      <div class="card">
        <h2>${article.title}</h2>
        <small>Ditulis oleh ${article.writer}</small>
        <p>${article.content}</p>
      </div>
    `;
  });
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
      const registration = await navigator.serviceWorker.register("Profil_pwa/sw.js");
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
      icon: "Profil_pwa/icon-192.png"
    });
  }
}

// =====================
// RUN WEBSITE
// =====================
getArticles();
// loadMap();
// showNotification();