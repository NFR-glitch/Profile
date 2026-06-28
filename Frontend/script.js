// =====================
// API
// =====================
const API = "https://profile-production-2b3c.up.railway.app";

// =====================
// LOAD PROFILE
// =====================
async function getProfile() {
  try {
    const res = await fetch(`${API}/profile`);

    if (!res.ok) {
      throw new Error("Gagal mengambil data profile");
    }

    const profile = await res.json();

    document.getElementById("nama").textContent =
      profile.nama || "Naqris Fatkhur Rozak";
    document.getElementById("nim").textContent =
      "NIM: " + (profile.nim || "-");
    document.getElementById("prodi").textContent =
      "Prodi: " + (profile.prodi || "-");
    document.getElementById("email").textContent =
      "Email: " + (profile.email || "-");
    document.getElementById("deskripsi").textContent =
      profile.deskripsi || "Mahasiswa Informatika";
  } catch (error) {
    console.error("Error:", error);
  }
}

// =====================
// LOAD MAP
// =====================
function loadMap() {
  if (!navigator.geolocation) return;

  navigator.geolocation.getCurrentPosition((position) => {
    const lat = position.coords.latitude;
    const lng = position.coords.longitude;

    const map = L.map("map").setView([lat, lng], 15);

    L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: "&copy; OpenStreetMap",
    }).addTo(map);

    L.marker([lat, lng])
      .addTo(map)
      .bindPopup("Lokasi Saya Saat Ini")
      .openPopup();
  });
}

// =====================
// PUSH NOTIFICATION
// =====================
async function testPushNotification() {
  if (!("Notification" in window)) {
    alert("Browser ini tidak mendukung desktop notification");
    return;
  }

  let permission = Notification.permission;

  if (permission !== "granted") {
    permission = await Notification.requestPermission();
  }

  if (permission === "granted") {
    if (navigator.serviceWorker.controller) {
      navigator.serviceWorker.controller.postMessage("Web Push Notification Berhasil");
      alert("Push notification berhasil dikirim!");
    } else {
      alert("Service Worker belum aktif. Coba refresh halaman.");
    }
  } else {
    alert("Izin notifikasi tidak diberikan.");
  }
}

// =====================
// SERVICE WORKER
// =====================
if ("serviceWorker" in navigator) {
  window.addEventListener("load", async () => {
    try {
      await navigator.serviceWorker.register("sw.js");
      console.log("Service Worker aktif");
    } catch (err) {
      console.log(err);
    }
  });
}

// =====================
// RUN
// =====================
getProfile();
loadMap();