# GEMINI.md - Panduan & Aturan Permanen Proyek Platform Nikah

> **Sistem:** All-in-One Wedding Planner & Digital Invitation Platform (LIVE on GitHub + Vercel + Supabase)  
> **Repository GitHub:** https://github.com/yogi2610/wedding-planner-and-invitation.git  
> **Branch Utama:** `main`

---

## 1. Kredensial & Konfigurasi Supabase
- **Project URL:** `https://zjrqjneeyiymazyizlyw.supabase.co`
- **Publishable / Anon Key:** `sb_publishable_95FRogiLuqPP_K0kTuKtew_NBH8l6ZM`
- **Storage Bucket:** `wedding-media`
- **SDK Import:** `https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2`

### Catatan Keamanan & RLS (Tahap Alpha/Beta Test):
Untuk kelancaran fase testing Alpha & Beta, seluruh tabel dijalankan dengan akses anon/public (RLS disabled).
Jika Supabase mengembalikan pesan error `42501 (new row violates row-level security policy)`, jalankan script ini di SQL Editor Supabase:
```sql
ALTER TABLE users DISABLE ROW LEVEL SECURITY;
ALTER TABLE activation_tokens DISABLE ROW LEVEL SECURITY;
ALTER TABLE templates DISABLE ROW LEVEL SECURITY;
ALTER TABLE weddings DISABLE ROW LEVEL SECURITY;
ALTER TABLE planner_budgets DISABLE ROW LEVEL SECURITY;
ALTER TABLE planner_checklists DISABLE ROW LEVEL SECURITY;
ALTER TABLE planner_items DISABLE ROW LEVEL SECURITY;
ALTER TABLE guests DISABLE ROW LEVEL SECURITY;
```

---

## 2. Struktur Schema & Kolom Database (8 Tabel)

Berikut daftar 8 tabel database beserta nama-nama kolom resmi yang aktif:

### 1. `users`
Tabel pengguna (Admin & Pengantin):
- `id` (uuid / primary key)
- `name` (text / varchar) - Nama lengkap user
- `email` (text / varchar, unique)
- `password_hash` (text / varchar)
- `role` (text) - `'admin'` atau `'user'`
- `wedding_date` (date / timestamp) - Tanggal rencana pernikahan
- `created_at` (timestamp)
- `expires_at` (timestamp)

### 2. `activation_tokens`
Tabel kode token lisensi / pembelian untuk registrasi:
- `id` (uuid / primary key)
- `token_code` (text, unique) - Format contoh: `WED-2027-XXXX`
- `status` (text) - `'unused'` atau `'used'`
- `used_by_user_id` (uuid / reference ke `users.id`)
- `used_at` (timestamp)
- `created_at` (timestamp)

### 3. `templates`
Katalog tema desain undangan digital:
- `id` (uuid / primary key)
- `name` (text) - Nama template
- `slug` (text, unique)
- `category` (text) - Contoh: `'rustic'`, `'modern'`, `'islamic'`, `'luxury'`
- `is_active` (boolean)
- `is_premium` (boolean)
- `preview_url` (text)
- `created_at` (timestamp)

### 4. `weddings`
Data detail acara pernikahan & website undangan:
- `id` (uuid / primary key)
- `user_id` (uuid / foreign key ke `users.id`)
- `template_id` (uuid / foreign key ke `templates.id`)
- `slug` (text, unique) - URL unik undangan, misal: `yogi-rina-829`
- `groom_fullname` (text)
- `bride_fullname` (text)
- `groom_nickname` (text)
- `bride_nickname` (text)
- `groom_parents` (text)
- `bride_parents` (text)
- `groom_photo` (text / url)
- `bride_photo` (text / url)
- `akad_date` (date)
- `akad_time` (text / time)
- `akad_venue` (text)
- `akad_address` (text)
- `resepsi_date` (date)
- `resepsi_time` (text / time)
- `resepsi_venue` (text)
- `resepsi_address` (text)
- `audio_url` (text)
- `is_published` (boolean)
- `created_at` (timestamp)

### 5. `planner_budgets`
Pos anggaran dan pengeluaran smart wedding planner:
- `id` (uuid / primary key)
- `user_id` (uuid)
- `category` (text) - Contoh: Katering, Venue, Dekorasi, MUA & Busana, Dokumentasi, Seserahan & KUA, Dana Darurat
- `item_name` (text)
- `estimated_amount` (numeric / bigint) - Estimasi alokasi dana
- `paid_amount` (numeric / bigint) - Jumlah dana yang telah dibayar (DP / Lunas)
- `actual_amount` (numeric / bigint) - Biaya final riil
- `due_date` (date) - Tenggat waktu pembayaran vendor
- `vendor_name` (text)
- `notes` (text)
- `created_at` (timestamp)

### 6. `planner_checklists`
Daftar checklist timeline persiapan pernikahan (16 tahapan):
- `id` (uuid / primary key)
- `user_id` (uuid)
- `task_title` (text) - Judul kegiatan / checklist
- `notes` (text) - Menyimpan kode fase waktu (`H-12_H-6`, `H-6_H-3`, `H-3_H-1`, `H-30_D-Day`) dan catatan berkas
- `is_completed` (boolean) - Status selesai / belum
- `sort_order` (integer) - Urutan tampil (1 - 16)
- `created_at` (timestamp)

### 7. `planner_items`
Daftar barang seserahan, rundown acara, dan hantaran:
- `id` (uuid / primary key)
- `user_id` (uuid)
- `title` (text)
- `subtitle` (text)
- `sort_order` (integer)
- `created_at` (timestamp)

### 8. `guests`
Buku tamu, RSVP, dan kuota undangan:
- `id` (uuid / primary key)
- `user_id` (uuid)
- `wedding_id` (uuid)
- `name` (text) - Nama tamu undangan
- `rsvp_status` (text) - `'hadir'`, `'tidak_hadir'`, `'ragu'`
- `created_at` (timestamp)

---

## 3. Aturan Arsitektur Zero-Bloat
1. **Frontend Stack:**
   - HTML5 Semantik murni.
   - Tailwind CSS via CDN (`https://cdn.tailwindcss.com`) dengan konfigurasi warna custom (Rose Gold, Champagne Gold, Emerald Slate, Ivory).
   - Google Fonts: `Plus Jakarta Sans` (body font modern) & `Cormorant Garamond` (display font wedding mewah).
   - Icons: Lucide Icons CDN (`https://unpkg.com/lucide@latest`).
   - Vanilla JavaScript ES6+ modular tanpa framework berat (React/Vue/Next.js).
2. **Backend & Database:**
   - Supabase JS Client v2 via CDN.
   - State session login disimpan di `localStorage` (`platform_nikah_user`, `platform_nikah_session`).
3. **Deployment Vercel:**
   - Routing dikontrol oleh `vercel.json` di root folder.
   - Clean URLs aktif (`cleanUrls: true`).
   - Rewrite otomatis `/u/:slug` menuju `/u.html?slug=:slug`.

---

## 4. ATURAN WAJIB PENGEMBANGAN (MANDATORY RULE)
Setiap kali AI selesai:
1. Membangun fitur baru
2. Melakukan perbaikan bug / refactoring
3. Memperbarui halaman atau file apapun

**WAJIB OTOMATIS** menjalankan serangkaian perintah Git berikut ke branch `main`:
```bash
git add .
git commit -m "<Pesan commit deskriptif yang jelas>"
git push origin main
```
Tujuannya agar deploy otomatis di Vercel langsung sinkron dan website live selalu ter-update secara instan.
