// =============================================
// CMS.js — Content Management System Logic
// =============================================

const API = "http://localhost:3000/articles";

// =====================
// STATE
// =====================
let articles = [];
let editingId = null;
let deleteTargetId = null;
let isSidebarCollapsed = false;

// =====================
// INIT
// =====================
document.addEventListener("DOMContentLoaded", () => {
    updateClock();
    setInterval(updateClock, 1000);
    loadArticles();
    setupFormListeners();
});

// =====================
// CLOCK
// =====================
function updateClock() {
    const now = new Date();
    const el = document.getElementById("topbarTime");
    if (el) {
        el.textContent = now.toLocaleString("id-ID", {
            weekday: "short",
            day: "2-digit",
            month: "short",
            hour: "2-digit",
            minute: "2-digit"
        });
    }
}

// =====================
// SIDEBAR TOGGLE
// =====================
const sidebarEl = document.getElementById("sidebar");
const mainWrapper = document.getElementById("mainWrapper");

document.getElementById("sidebarToggle")?.addEventListener("click", () => {
    isSidebarCollapsed = !isSidebarCollapsed;
    sidebarEl.classList.toggle("collapsed", isSidebarCollapsed);
    mainWrapper.classList.toggle("sidebar-collapsed", isSidebarCollapsed);
});

document.getElementById("topbarToggle")?.addEventListener("click", () => {
    sidebarEl.classList.toggle("mobile-open");
});

// Close sidebar on mobile overlay click
document.addEventListener("click", (e) => {
    if (window.innerWidth <= 768 &&
        !sidebarEl.contains(e.target) &&
        !document.getElementById("topbarToggle").contains(e.target)) {
        sidebarEl.classList.remove("mobile-open");
    }
});

// =====================
// SECTION NAVIGATION
// =====================
function showSection(name) {
    document.querySelectorAll(".section").forEach(s => s.classList.remove("active"));
    document.querySelectorAll(".nav-item").forEach(n => n.classList.remove("active"));

    document.getElementById(`section-${name}`)?.classList.add("active");
    document.getElementById(`nav-${name}`)?.classList.add("active");

    const labels = { dashboard: "Dashboard", articles: "Manajemen Artikel", add: "Tambah Artikel" };
    document.getElementById("breadcrumbText").textContent = labels[name] || "Dashboard";

    if (name === "dashboard") renderDashboard();
    if (name === "articles") renderArticleList();

    // Mobile: close sidebar
    if (window.innerWidth <= 768) sidebarEl.classList.remove("mobile-open");

    return false;
}

// =====================
// LOAD / FETCH ARTICLES
// =====================
async function loadArticles() {
    try {
        const res = await fetch(API);
        if (!res.ok) throw new Error("API error");
        articles = await res.json();
    } catch {
        // Fallback to localStorage
        const stored = localStorage.getItem("cms_articles");
        articles = stored ? JSON.parse(stored) : getDefaultArticles();
    }
    renderDashboard();
}

function saveToStorage() {
    localStorage.setItem("cms_articles", JSON.stringify(articles));
}

function getDefaultArticles() {
    return [
        {
            id: 1,
            title: "Pentingnya Menjaga Keseimbangan Hidup di Era Digital",
            content: "Di tengah gempuran notifikasi dan tuntutan untuk selalu terhubung, menjaga keseimbangan hidup menjadi tantangan tersendiri. Menentukan batas waktu penggunaan teknologi membantu menjaga produktivitas dan kesehatan mental.",
            writer: "Naqris",
            category: "Teknologi",
            tags: ["lifestyle", "digital", "kesehatan"],
            createdAt: new Date(Date.now() - 86400000 * 2).toISOString()
        },
        {
            id: 2,
            title: "Implementasi Progressive Web App di Proyek Web Modern",
            content: "Progressive Web App memungkinkan website berjalan seperti aplikasi mobile. Pengguna dapat menginstall aplikasi langsung dari browser tanpa melalui app store, menjadikannya solusi yang efisien dan modern.",
            writer: "Naqris",
            category: "Teknologi",
            tags: ["PWA", "web", "mobile"],
            createdAt: new Date(Date.now() - 86400000).toISOString()
        }
    ];
}

// =====================
// DASHBOARD RENDER
// =====================
function renderDashboard() {
    const total = articles.length;
    const writers = new Set(articles.map(a => a.writer)).size;
    const categories = new Set(articles.map(a => a.category || "Lainnya")).size;
    const today = articles.filter(a => {
        const d = new Date(a.createdAt || Date.now());
        const now = new Date();
        return d.toDateString() === now.toDateString();
    }).length;

    animateCount("statTotal", total);
    animateCount("statWriters", writers);
    animateCount("statCategories", categories);
    animateCount("statToday", today);

    // Recent articles
    const recent = [...articles].sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0)).slice(0, 4);
    const recentEl = document.getElementById("recentArticles");
    if (recentEl) {
        recentEl.innerHTML = recent.length
            ? recent.map(a => `
                <div class="recent-item" onclick="editArticle(${a.id})">
                    <div class="recent-item-icon"><i class="fa-solid fa-file-lines"></i></div>
                    <div class="recent-item-info">
                        <div class="recent-item-title">${escHtml(a.title)}</div>
                        <div class="recent-item-meta">${escHtml(a.writer)} · ${formatDate(a.createdAt)}</div>
                    </div>
                </div>`).join("")
            : `<p style="color:var(--text-muted);font-size:13px;text-align:center;padding:20px">Belum ada artikel</p>`;
    }

    // Category chart
    const catCount = {};
    articles.forEach(a => {
        const cat = a.category || "Lainnya";
        catCount[cat] = (catCount[cat] || 0) + 1;
    });

    const chartEl = document.getElementById("categoryChart");
    if (chartEl) {
        if (Object.keys(catCount).length === 0) {
            chartEl.innerHTML = `<p style="color:var(--text-muted);font-size:13px;text-align:center;padding:20px">Belum ada data</p>`;
        } else {
            const maxVal = Math.max(...Object.values(catCount));
            chartEl.innerHTML = Object.entries(catCount).map(([cat, count]) => `
                <div class="cat-bar-item">
                    <div class="cat-bar-label">
                        <span>${cat}</span>
                        <span>${count} artikel</span>
                    </div>
                    <div class="cat-bar-track">
                        <div class="cat-bar-fill" data-width="${(count / maxVal * 100).toFixed(0)}"></div>
                    </div>
                </div>`).join("");

            setTimeout(() => {
                chartEl.querySelectorAll(".cat-bar-fill").forEach(el => {
                    el.style.width = el.dataset.width + "%";
                });
            }, 100);
        }
    }
}

function animateCount(id, target) {
    const el = document.getElementById(id);
    if (!el) return;
    let current = 0;
    const step = Math.ceil(target / 20);
    const timer = setInterval(() => {
        current = Math.min(current + step, target);
        el.textContent = current;
        if (current >= target) clearInterval(timer);
    }, 40);
}

// =====================
// RENDER ARTICLE LIST
// =====================
function renderArticleList(filtered = null) {
    const list = filtered ?? articles;
    const container = document.getElementById("articleList");
    const empty = document.getElementById("emptyState");

    if (!container) return;

    if (list.length === 0) {
        container.innerHTML = "";
        empty?.classList.remove("hidden");
        return;
    }

    empty?.classList.add("hidden");
    container.innerHTML = list.map(a => `
        <div class="article-card" id="acard-${a.id}">
            <span class="card-category-badge badge-${a.category || 'Lainnya'}">
                <i class="fa-solid fa-tag"></i> ${escHtml(a.category || "Lainnya")}
            </span>
            <div class="card-title">${escHtml(a.title)}</div>
            <div class="card-excerpt">${stripHtml(a.content)}</div>
            ${a.tags && a.tags.length ? `
            <div class="card-tags">
                ${a.tags.map(t => `<span class="card-tag">#${escHtml(t.trim())}</span>`).join("")}
            </div>` : ""}
            <div class="card-meta">
                <i class="fa-solid fa-user"></i> ${escHtml(a.writer)}
                <div class="card-meta-dot"></div>
                <i class="fa-solid fa-calendar"></i> ${formatDate(a.createdAt)}
            </div>
            <div class="card-actions">
                <button class="card-btn card-btn-edit" onclick="editArticle(${a.id})">
                    <i class="fa-solid fa-pen"></i> Edit
                </button>
                <button class="card-btn card-btn-delete" onclick="openDeleteModal(${a.id})">
                    <i class="fa-solid fa-trash"></i> Hapus
                </button>
            </div>
        </div>
    `).join("");
}

// =====================
// FILTER & SEARCH
// =====================
function filterArticles() {
    const search = (document.getElementById("articleSearch")?.value || "").toLowerCase();
    const cat = document.getElementById("categoryFilter")?.value || "";
    const sort = document.getElementById("sortFilter")?.value || "newest";

    let filtered = [...articles];

    if (search) {
        filtered = filtered.filter(a =>
            a.title.toLowerCase().includes(search) ||
            a.writer.toLowerCase().includes(search) ||
            (a.content || "").toLowerCase().includes(search)
        );
    }

    if (cat) filtered = filtered.filter(a => (a.category || "Lainnya") === cat);

    filtered.sort((a, b) => {
        if (sort === "newest") return new Date(b.createdAt || 0) - new Date(a.createdAt || 0);
        if (sort === "oldest") return new Date(a.createdAt || 0) - new Date(b.createdAt || 0);
        if (sort === "az") return a.title.localeCompare(b.title);
        if (sort === "za") return b.title.localeCompare(a.title);
        return 0;
    });

    renderArticleList(filtered);
}

function handleGlobalSearch(q) {
    if (!q) return;
    showSection("articles");
    document.getElementById("articleSearch").value = q;
    filterArticles();
}

// =====================
// FORM LISTENERS
// =====================
function setupFormListeners() {
    const judulInput = document.getElementById("inputJudul");
    const contentInput = document.getElementById("inputContent");

    judulInput?.addEventListener("input", () => {
        const len = judulInput.value.length;
        const counter = document.getElementById("judulCount");
        if (counter) counter.textContent = `${len}/100`;
        updatePreview();
    });

    contentInput?.addEventListener("input", updatePreview);
}

function updatePreview() {
    const title = document.getElementById("inputJudul")?.value || "";
    const content = document.getElementById("inputContent")?.innerHTML || "";
    const writer = document.getElementById("inputWriter")?.value || "";
    const previewEl = document.getElementById("previewBox");

    if (!previewEl) return;

    if (!title && !content) {
        previewEl.innerHTML = `<p class="preview-placeholder">Preview artikel akan muncul di sini...</p>`;
        return;
    }

    previewEl.innerHTML = `
        ${title ? `<div class="preview-title">${escHtml(title)}</div>` : ""}
        ${writer ? `<div class="preview-meta">Oleh ${escHtml(writer)}</div>` : ""}
        <div style="font-size:13px;color:var(--text-secondary);line-height:1.7">${content || ""}</div>
    `;
}

// =====================
// RICH TEXT FORMAT
// =====================
function formatText(cmd) {
    document.execCommand(cmd, false, null);
    document.getElementById("inputContent")?.focus();
}

// =====================
// EDIT ARTICLE
// =====================
function editArticle(id) {
    const article = articles.find(a => a.id === id);
    if (!article) return;

    editingId = id;

    document.getElementById("formTitle").textContent = "Edit Artikel";
    document.getElementById("formSubtitle").textContent = "Ubah isi artikel lalu klik Simpan";
    document.getElementById("submitBtn").innerHTML = `<i class="fa-solid fa-floppy-disk"></i> Simpan Perubahan`;

    document.getElementById("inputJudul").value = article.title;
    document.getElementById("inputContent").innerHTML = article.content;
    document.getElementById("inputWriter").value = article.writer;
    document.getElementById("inputCategory").value = article.category || "Teknologi";
    document.getElementById("inputTags").value = (article.tags || []).join(", ");

    const counter = document.getElementById("judulCount");
    if (counter) counter.textContent = `${article.title.length}/100`;

    updatePreview();
    showSection("add");
    document.getElementById("nav-add").classList.add("active");
}

// =====================
// CANCEL EDIT
// =====================
function cancelEdit() {
    editingId = null;
    document.getElementById("formTitle").textContent = "Tambah Artikel Baru";
    document.getElementById("formSubtitle").textContent = "Tulis artikel dan klik Simpan";
    document.getElementById("submitBtn").innerHTML = `<i class="fa-solid fa-floppy-disk"></i> Simpan Artikel`;
    document.getElementById("inputJudul").value = "";
    document.getElementById("inputContent").innerHTML = "";
    document.getElementById("inputWriter").value = "Naqris";
    document.getElementById("inputCategory").value = "Teknologi";
    document.getElementById("inputTags").value = "";
    hideFormError();
    showSection("articles");
}

// =====================
// SUBMIT ARTICLE
// =====================
async function submitArticle() {
    const title = document.getElementById("inputJudul")?.value.trim();
    const content = document.getElementById("inputContent")?.innerHTML.trim();
    const writer = document.getElementById("inputWriter")?.value.trim();
    const category = document.getElementById("inputCategory")?.value;
    const tagsRaw = document.getElementById("inputTags")?.value;
    const tags = tagsRaw ? tagsRaw.split(",").map(t => t.trim()).filter(Boolean) : [];

    if (!title) return showFormError("Judul artikel tidak boleh kosong.");
    if (!content || content === "<br>") return showFormError("Isi artikel tidak boleh kosong.");
    if (!writer) return showFormError("Nama penulis tidak boleh kosong.");

    hideFormError();

    const articleData = { title, content, writer, category, tags, createdAt: new Date().toISOString() };

    try {
        if (editingId !== null) {
            await updateArticleAPI(editingId, articleData);
        } else {
            await createArticleAPI(articleData);
        }
    } catch {
        // Fallback local
        if (editingId !== null) {
            const idx = articles.findIndex(a => a.id === editingId);
            if (idx !== -1) {
                articles[idx] = { ...articles[idx], ...articleData };
                showToast("Artikel berhasil diperbarui!", "success");
            }
        } else {
            const newId = articles.length ? Math.max(...articles.map(a => a.id)) + 1 : 1;
            articles.unshift({ id: newId, ...articleData });
            showToast("Artikel berhasil ditambahkan!", "success");
        }
        saveToStorage();
    }

    cancelEdit();
    renderDashboard();
}

async function createArticleAPI(data) {
    const res = await fetch(API, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data)
    });
    if (!res.ok) throw new Error("API error");
    const newArticle = await res.json();
    articles.unshift(newArticle);
    showToast("Artikel berhasil ditambahkan!", "success");
}

async function updateArticleAPI(id, data) {
    const res = await fetch(`${API}/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data)
    });
    if (!res.ok) throw new Error("API error");
    const updated = await res.json();
    const idx = articles.findIndex(a => a.id === id);
    if (idx !== -1) articles[idx] = updated;
    showToast("Artikel berhasil diperbarui!", "success");
}

// =====================
// DELETE
// =====================
function openDeleteModal(id) {
    deleteTargetId = id;
    document.getElementById("deleteModal").classList.add("active");
}

function closeDeleteModal() {
    deleteTargetId = null;
    document.getElementById("deleteModal").classList.remove("active");
}

async function confirmDelete() {
    if (deleteTargetId === null) return;

    try {
        const res = await fetch(`${API}/${deleteTargetId}`, { method: "DELETE" });
        if (!res.ok) throw new Error("API error");
    } catch {
        // Fallback local
    }

    articles = articles.filter(a => a.id !== deleteTargetId);
    saveToStorage();

    closeDeleteModal();
    renderArticleList();
    renderDashboard();
    showToast("Artikel berhasil dihapus.", "info");
}

// =====================
// FORM ERROR
// =====================
function showFormError(msg) {
    const el = document.getElementById("formError");
    if (el) {
        el.textContent = msg;
        el.classList.remove("hidden");
    }
}

function hideFormError() {
    const el = document.getElementById("formError");
    if (el) el.classList.add("hidden");
}

// =====================
// TOAST
// =====================
function showToast(message, type = "info") {
    const icons = { success: "fa-circle-check", error: "fa-circle-xmark", info: "fa-circle-info" };
    const container = document.getElementById("toastContainer");
    const toast = document.createElement("div");
    toast.className = `toast toast-${type}`;
    toast.innerHTML = `
        <i class="fa-solid ${icons[type]} toast-icon"></i>
        <span>${message}</span>
    `;
    container.appendChild(toast);

    setTimeout(() => {
        toast.classList.add("hide");
        setTimeout(() => toast.remove(), 300);
    }, 3200);
}

// =====================
// HELPERS
// =====================
function escHtml(str) {
    return String(str)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;");
}

function stripHtml(html) {
    const tmp = document.createElement("div");
    tmp.innerHTML = html;
    return tmp.textContent || tmp.innerText || "";
}

function formatDate(iso) {
    if (!iso) return "Baru saja";
    return new Date(iso).toLocaleDateString("id-ID", {
        day: "2-digit", month: "short", year: "numeric"
    });
}
