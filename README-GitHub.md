# 📝 TTS Model ADDIE — Calon Guru Pendidikan Agama Islam

<div align="center">

**تقاطع الكلمات**

*Teka-Teki Silang Interaktif tentang Model Desain Instruksional ADDIE*

![Status](https://img.shields.io/badge/status-active-brightgreen)
![Soal](https://img.shields.io/badge/soal-40-blue)
![Platform](https://img.shields.io/badge/platform-web-orange)

</div>

---

## 📖 Deskripsi

Aplikasi Teka-Teki Silang (TTS) interaktif berbasis web yang dirancang khusus untuk mahasiswa calon guru **Pendidikan Agama Islam (PAI)**. Berisi **40 soal** seputar **Model ADDIE** (Analysis, Design, Development, Implementation, Evaluation) dalam konteks desain instruksional pendidikan Islam.

## ✨ Fitur Utama

| Fitur | Keterangan |
|-------|------------|
| 🧩 40 Soal TTS | 20 mendatar + 20 menurun tentang ADDIE |
| 👤 Sistem Login | Nama, NIM, Kelas/Semester |
| ⏱️ Timer | Penghitung waktu otomatis |
| 📊 Scoring | Penilaian otomatis + predikat bahasa Arab |
| 💡 Petunjuk | Sistem hint dengan penalti skor |
| 🏆 Leaderboard | Papan peringkat lokal & online |
| 📈 Google Sheets | Push skor otomatis via Apps Script |
| 🐙 GitHub | Simpan skor sebagai JSON ke repository |

## 🎯 Sistem Penilaian

| Skor | Predikat | Keterangan |
|------|----------|------------|
| 85-100 | A — Mumtaz | Istimewa |
| 70-84 | B — Jayyid Jiddan | Sangat Baik |
| 55-69 | C — Jayyid | Baik |
| 0-54 | D — Maqbul | Cukup |

**Rumus Skor:**
```
Skor = (Jawaban Benar / Total) × 100 - (Petunjuk × 2.5) + Bonus Waktu
```

## 🚀 Cara Menggunakan

### Untuk Mahasiswa
1. Buka file `TTS-ADDIE-Calon-Guru-PAI.html` di browser
2. Masukkan Nama, NIM, dan Kelas
3. Kerjakan TTS dengan mengisi huruf pada kotak
4. Gunakan tombol **Periksa** untuk mengecek jawaban
5. Klik **Selesai** untuk melihat skor akhir

### Untuk Dosen (Setup Integrasi)

#### Google Sheets
1. Buat Google Spreadsheet baru
2. Buka **Extensions → Apps Script**
3. Copy-paste isi file `google-apps-script.gs`
4. Deploy sebagai **Web App** (akses: Anyone)
5. Bagikan URL deployment ke mahasiswa

#### GitHub Repository
1. Fork repository ini
2. Buat **Personal Access Token** (Settings → Developer Settings → PAT)
3. Berikan izin `repo`
4. Mahasiswa memasukkan `username/repo` dan token saat login

## 📁 Struktur File

```
├── TTS-ADDIE-Calon-Guru-PAI.html  # Aplikasi utama (standalone)
├── google-apps-script.gs          # Google Apps Script backend
├── panduan-penggunaan.docx        # Panduan lengkap untuk dosen & mahasiswa
├── rubrik-penilaian.xlsx          # Rubrik & rekap nilai
├── kunci-jawaban.md               # Kunci jawaban 40 soal
├── README.md                      # Dokumentasi ini
└── scores/                        # Folder skor (auto-generated)
    └── [NIM]_[timestamp].json     # File skor per mahasiswa
```

## 📊 Papan Skor

| Nama | NIM | Kelas | Skor | Terjawab | Tanggal |
|------|-----|-------|------|----------|---------|
| *(data akan terisi otomatis)* | | | | | |

## 🔧 Teknologi

- **Frontend:** HTML5, CSS3, Vanilla JavaScript
- **Backend:** Google Apps Script
- **Storage:** GitHub API, Google Sheets API
- **Desain:** Responsive, Islamic-themed UI

## 📋 Cakupan Materi

### Tahapan ADDIE
- Analysis (Analisis kebutuhan, karakteristik peserta didik)
- Design (Tujuan pembelajaran, strategi, blueprint)
- Development (Pengembangan bahan ajar, validasi ahli)
- Implementation (Uji coba, pelaksanaan)
- Evaluation (Formatif, sumatif, N-Gain)

### Konsep Pendidikan Terkait
- Taksonomi Bloom (Kognitif, Afektif, Psikomotorik)
- Kurikulum & RPP
- Media Pembelajaran & Multimedia
- Instrumen Evaluasi (Angket, Observasi, Wawancara)
- Validitas & Reliabilitas

## 📄 Lisensi

Dibuat untuk keperluan pendidikan. Bebas digunakan dan dimodifikasi untuk pembelajaran di lingkungan perguruan tinggi Islam.

---

<div align="center">

**بسم الله الرحمن الرحيم**

*"Barangsiapa menempuh jalan untuk menuntut ilmu, Allah akan memudahkan baginya jalan menuju surga."*
*(HR. Muslim)*

</div>
