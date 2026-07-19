# Setup & Deploy (Cloudflare Workers)

Struktur project ini pakai model Cloudflare terbaru (Workers + Static Assets),
gantiin Cloudflare Pages yang lama.

- `public/` -> semua file website (HTML, CSS, JS, foto) — ini yang ditampilkan ke pengunjung
- `src/index.js` -> kode server kecil yang nanganin fitur kirim jawaban ke Telegram
- `wrangler.jsonc` -> file konfigurasi, jangan dihapus/diganti nama

## 1. Aset yang udah terpasang
Foto & doodle yang kamu kirim udah otomatis kepasang ke halaman yang sesuai:
- `1-photo.png` - foto halaman 1
- `2-photo1.png`, `2-photo2.png` - foto halaman 2
- `3-photo1.png`, `3-photo2.png` - foto stack halaman 3
- `4-photo1.png`, `4-photo2.png` - foto halaman 4
- `sketch-girl-profile.png`, `sketch-suitcase.png`, `doodle-stamp-face.png`, `doodle-totoro.png`, `doodle-icecream.png` - ilustrasi doodle (background udah dibikin transparan)

Sound:
- `pencil-write.mp3` - suara pas teks "nulis"
- `bg-music.mp3` - musik latar, muter otomatis pas pengunjung pertama kali klik apapun di web, ada tombol mute di pojok kanan atas
- `page-flip.mp3` - **belum ada file-nya**, kalau mau ada suara pas ganti halaman, cari/kirim file suara kertas dibuka, taruh dengan nama ini di folder yang sama

Kalau mau ganti foto/doodle lain, taruh file baru di `public/assets/images/`, sesuaikan nama file yang dipanggil di `public/index.html`.

## 2. Deploy
Di Cloudflare dashboard, waktu bikin Worker baru -> Connect to Git -> pilih repo ini.
Build command dikosongkan. Deploy command biarin default (`npx wrangler deploy`) — dia
otomatis baca `wrangler.jsonc` di root repo ini.

## 3. Set environment variables (WAJIB biar fitur Telegram jalan)
Di dashboard Worker -> Settings -> Variables and Secrets, tambahin:
- `TELEGRAM_BOT_TOKEN` = token bot dari BotFather (tandain sebagai **Secret**, bukan plain text)
- `TELEGRAM_CHAT_ID` = chat ID kamu

## 4. (Opsional tapi disaranin) Bikin KV namespace buat nyimpen histori jawaban
1. Dashboard -> Storage & Databases -> KV -> Create namespace, kasih nama misal `answers`
2. Balik ke Worker -> Settings -> Bindings -> Add binding -> KV Namespace -> nama binding `ANSWERS_KV` -> pilih namespace tadi
3. Tanpa ini, notif Telegram tetap jalan, cuma histori jawaban gak kesimpen permanen.

## 5. Tiap ada klien baru beli template ini
- Duplikat repo ini (atau bikin repo baru dari isi ini), deploy jadi Worker baru
- Ganti foto & teks di `public/index.html`
- Environment variable Telegram tetap isi punya kamu sendiri
