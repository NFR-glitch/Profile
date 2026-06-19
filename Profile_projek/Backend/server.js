const express = require("express");
const cors = require("cors");
const db = require("./db");

const app = express();

app.use(cors());
app.use(express.json());

// PROFILE
app.get("/profile", (req, res) => {
  db.query("SELECT * FROM profile LIMIT 1", (err, result) => {
    if (err) {
      console.log(err);
      res.status(500).json(err);
    } else {
      console.log(result);
      res.json(result[0]);
    }
  });
});

// READ
app.get("/articles", (req, res) => {
  db.query("SELECT * FROM articles", (err, result) => {
    if (err) {
      res.status(500).json(err);
    } else {
      res.json(result);
    }
  });
});

// CREATE
app.post("/articles", (req, res) => {
  const { title, content, writer } = req.body;

  db.query("INSERT INTO articles(title, content, writer) VALUES (?, ?, ?)", [title, content, writer], (err, result) => {
    if (err) {
      res.status(500).json(err);
    } else {
      res.json({
        message: "Artikel berhasil ditambah",
      });
    }
  });
});

// UPDATE
app.put("/articles/:id", (req, res) => {
  const id = req.params.id;
  const { title, content, writer } = req.body;

  db.query(
    "UPDATE articles SET title=?, content=?, writer=? WHERE id=?",
    [title, content, writer, id],
    (err, result) => {
      if (err) {
        return res.status(500).json(err);
      }

      // Jika id tidak ditemukan, result.affectedRows biasanya = 0
      if (result.affectedRows === 0) {
        return res.status(404).json({ message: "Artikel tidak ditemukan" });
      }

      return res.json({
        message: "Artikel berhasil diperbarui",
      });
    }
  );
});

// DELETE
app.delete("/articles/:id", (req, res) => {
  const id = req.params.id;

  db.query("DELETE FROM articles WHERE id=?", [id], (err, result) => {
    if (err) {
      res.status(500).json(err);
    } else {
      res.json({
        message: "Artikel berhasil dihapus",
      });
    }
  });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

