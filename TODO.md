# TODO - Sesuaikan kode dengan struktur folder yang ada

## Langkah
1. [x] Pahami struktur & keterkaitan file: Backend / Frontend / Database
2. [x] Identifikasi gap: Frontend memanggil `PUT /articles/:id`, sedangkan backend belum menyediakan route update
3. [x] Implement endpoint update di `Profile_projek/Backend/server.js` (`app.put("/articles/:id", ...)`)

4. [x] Verifikasi konsistensi field: `title`, `content`, `writer` (sesuai query & HTML: id="judul","content","writer")
5. [ ] Opsional testing: jalankan backend + buka frontend, cek fitur Add/Edit/Delete


