const API = "http://localhost:3000/articles";

const form = document.getElementById("articleForm");
const titleInput = document.getElementById("judul");
const contentInput = document.getElementById("content");
const writerInput = document.getElementById("writer");

const articleList = document.getElementById("list");

// READ
async function displayArticles() {
  const response = await fetch(API);
  const articles = await response.json();

  articleList.innerHTML = "";

  articles.forEach((article) => {
    articleList.innerHTML += `
      <div class="card">

        <h3>${article.title}</h3>

        <small>
          Ditulis oleh: ${article.writer}
        </small>

        <p>${article.content}</p>

        <div class="actions">

          <button onclick="editArticle(${article.id}, '${article.title}', '${article.content}', '${article.writer}')">
            Edit
          </button>

          <button onclick="deleteArticle(${article.id})">
            Hapus
          </button>

        </div>

      </div>
    `;
  });
}

// CREATE
form.addEventListener("submit", async (e) => {
  e.preventDefault();

  const articleData = {
    title: titleInput.value,
    content: contentInput.value,
    writer: writerInput.value,
  };

  await fetch(API, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(articleData),
  });

  form.reset();

  displayArticles();
});

// UPDATE
async function editArticle(id, oldTitle, oldContent, oldWriter) {
  const title = prompt("Edit Judul Artikel", oldTitle);

  if (title === null) return;

  const content = prompt("Edit Isi Artikel", oldContent);

  if (content === null) return;

  const writer = prompt("Edit Nama Penulis", oldWriter);

  if (writer === null) return;

  await fetch(`${API}/${id}`, {
    method: "PUT",

    headers: {
      "Content-Type": "application/json",
    },

    body: JSON.stringify({
      title,
      content,
      writer,
    }),
  });

  displayArticles();
}

// DELETE
async function deleteArticle(id) {
  const confirmDelete = confirm("Yakin ingin menghapus artikel ini?");

  if (!confirmDelete) return;

  await fetch(`${API}/${id}`, {
    method: "DELETE",
  });

  displayArticles();
}

displayArticles();
