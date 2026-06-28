const express = require("express");
const cors = require("cors");
const db = require("./db");

const app = express();

app.use(cors());
app.use(express.json());

/* ======================
   GET ALL ARTICLES
====================== */
app.get("/articles", (req, res) => {
  db.query("SELECT * FROM cms_profile ORDER BY id DESC", (err, result) => {
    if (err) {
      console.log(err);
      return res.status(500).json(err);
    }
    res.json(result);
  });
});

/* ======================
   CREATE ARTICLE
====================== */
app.post("/articles", (req, res) => {
  const { title, content, writer } = req.body;

  db.query(
    "INSERT INTO cms_profile(title, content, writer) VALUES (?, ?, ?)",
    [title, content, writer],
    (err, result) => {
      if (err) return res.status(500).json(err);

      res.json({
        id: result.insertId,
        title,
        content,
        writer
      });
    }
  );
});

/* ======================
   UPDATE ARTICLE
====================== */
app.put("/articles/:id", (req, res) => {
  const { id } = req.params;
  const { title, content, writer } = req.body;

  db.query(
    "UPDATE cms_profile SET title=?, content=?, writer=? WHERE id=?",
    [title, content, writer, id],
    (err) => {
      if (err) return res.status(500).json(err);

      res.json({
        id,
        title,
        content,
        writer
      });
    }
  );
});

/* ======================
   DELETE ARTICLE
====================== */
app.delete("/articles/:id", (req, res) => {
  const { id } = req.params;

  db.query(
    "DELETE FROM cms_profile WHERE id=?",
    [id],
    (err) => {
      if (err) return res.status(500).json(err);

      res.json({
        message: "Deleted"
      });
    }
  );
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log("Server running on port", PORT);
});