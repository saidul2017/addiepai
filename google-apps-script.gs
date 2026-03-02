/**
 * =====================================================
 * Google Apps Script - TTS Model ADDIE
 * Penerima Skor Otomatis untuk Google Sheets
 * =====================================================
 * 
 * CARA SETUP:
 * 1. Buka Google Sheets baru
 * 2. Buat header di baris 1:
 *    A1: Timestamp | B1: Nama | C1: NIM | D1: Kelas 
 *    E1: Skor | F1: Terjawab | G1: Total Soal 
 *    H1: Petunjuk | I1: Waktu (detik) | J1: Predikat
 * 3. Klik Extensions → Apps Script
 * 4. Hapus semua kode, paste seluruh file ini
 * 5. Klik Deploy → New Deployment
 * 6. Pilih Type: Web App
 * 7. Execute as: Me
 * 8. Who has access: Anyone
 * 9. Klik Deploy → Copy URL
 * 10. Paste URL ke field "Google Sheets URL" di TTS
 * 
 * PENTING: Setiap kali edit script, buat New Deployment
 * (jangan Update existing, karena cache bisa bermasalah)
 */

// ================================
// KONFIGURASI
// ================================
const CONFIG = {
  SHEET_NAME: 'Skor TTS ADDIE',      // Nama sheet utama
  REKAP_SHEET: 'Rekap Per Kelas',     // Sheet rekapitulasi
  LOG_SHEET: 'Log Akses',             // Sheet log
  MAX_ATTEMPTS: 3,                     // Maksimal percobaan per NIM
  PASSING_SCORE: 55,                   // Skor minimum lulus
};

// ================================
// HANDLER UTAMA
// ================================

/**
 * Handler POST - menerima data skor dari TTS
 */
function doPost(e) {
  try {
    const data = JSON.parse(e.postData.contents);
    
    // Validasi data
    if (!data.nama || !data.nim || data.score === undefined) {
      return jsonResponse({ status: 'error', message: 'Data tidak lengkap' });
    }
    
    // Cek jumlah percobaan
    const attempts = countAttempts(data.nim);
    if (attempts >= CONFIG.MAX_ATTEMPTS) {
      return jsonResponse({ 
        status: 'error', 
        message: `Maksimal ${CONFIG.MAX_ATTEMPTS} percobaan. Anda sudah mencoba ${attempts}x.` 
      });
    }
    
    // Tentukan predikat
    const predikat = getPredikat(data.score);
    
    // Simpan ke sheet utama
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    let sheet = ss.getSheetByName(CONFIG.SHEET_NAME);
    if (!sheet) {
      sheet = ss.insertSheet(CONFIG.SHEET_NAME);
      setupMainSheet(sheet);
    }
    
    sheet.appendRow([
      new Date().toLocaleString('id-ID', { timeZone: 'Asia/Jakarta' }),
      data.nama,
      data.nim,
      data.kelas || '-',
      data.score,
      data.solved || 0,
      data.total || 40,
      data.hints || 0,
      data.time_seconds || 0,
      predikat,
      attempts + 1  // Percobaan ke-
    ]);
    
    // Update rekap
    updateRekap(data);
    
    // Log akses
    logAccess(data, 'POST_SCORE');
    
    return jsonResponse({ 
      status: 'ok', 
      message: 'Skor berhasil disimpan!',
      attempt: attempts + 1,
      predikat: predikat
    });
    
  } catch (error) {
    return jsonResponse({ status: 'error', message: error.toString() });
  }
}

/**
 * Handler GET - menampilkan leaderboard atau data
 */
function doGet(e) {
  try {
    const action = e.parameter.action || 'leaderboard';
    
    if (action === 'leaderboard') {
      return jsonResponse(getLeaderboard());
    }
    
    if (action === 'check') {
      const nim = e.parameter.nim;
      if (!nim) return jsonResponse({ status: 'error', message: 'NIM diperlukan' });
      const attempts = countAttempts(nim);
      return jsonResponse({ nim, attempts, remaining: CONFIG.MAX_ATTEMPTS - attempts });
    }
    
    if (action === 'stats') {
      return jsonResponse(getStatistics());
    }
    
    if (action === 'rekap') {
      const kelas = e.parameter.kelas;
      return jsonResponse(getRekapKelas(kelas));
    }
    
    return jsonResponse({ status: 'error', message: 'Action tidak dikenali' });
    
  } catch (error) {
    return jsonResponse({ status: 'error', message: error.toString() });
  }
}

// ================================
// FUNGSI UTILITAS
// ================================

function jsonResponse(data) {
  return ContentService
    .createTextOutput(JSON.stringify(data))
    .setMimeType(ContentService.MimeType.JSON);
}

function getPredikat(score) {
  if (score >= 85) return 'A - Mumtaz (Istimewa)';
  if (score >= 70) return 'B - Jayyid Jiddan (Sangat Baik)';
  if (score >= 55) return 'C - Jayyid (Baik)';
  return 'D - Maqbul (Cukup)';
}

function countAttempts(nim) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName(CONFIG.SHEET_NAME);
  if (!sheet) return 0;
  
  const data = sheet.getDataRange().getValues();
  let count = 0;
  for (let i = 1; i < data.length; i++) {
    if (String(data[i][2]) === String(nim)) count++;
  }
  return count;
}

function setupMainSheet(sheet) {
  const headers = [
    'Timestamp', 'Nama', 'NIM', 'Kelas', 'Skor', 
    'Terjawab', 'Total Soal', 'Petunjuk', 'Waktu (dtk)', 
    'Predikat', 'Percobaan Ke-'
  ];
  sheet.appendRow(headers);
  
  // Format header
  const headerRange = sheet.getRange(1, 1, 1, headers.length);
  headerRange.setFontWeight('bold');
  headerRange.setBackground('#0d6b4e');
  headerRange.setFontColor('#ffffff');
  headerRange.setHorizontalAlignment('center');
  
  // Freeze header
  sheet.setFrozenRows(1);
  
  // Set column widths
  sheet.setColumnWidth(1, 160); // Timestamp
  sheet.setColumnWidth(2, 180); // Nama
  sheet.setColumnWidth(3, 120); // NIM
  sheet.setColumnWidth(4, 140); // Kelas
  sheet.setColumnWidth(10, 180); // Predikat
}

// ================================
// LEADERBOARD & STATISTIK
// ================================

function getLeaderboard() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName(CONFIG.SHEET_NAME);
  if (!sheet) return { status: 'ok', data: [] };
  
  const data = sheet.getDataRange().getValues();
  const scores = {};
  
  // Ambil skor tertinggi per NIM
  for (let i = 1; i < data.length; i++) {
    const nim = String(data[i][2]);
    const score = Number(data[i][4]);
    if (!scores[nim] || score > scores[nim].score) {
      scores[nim] = {
        nama: data[i][1],
        nim: nim,
        kelas: data[i][3],
        score: score,
        solved: data[i][5],
        predikat: data[i][9],
        tanggal: data[i][0]
      };
    }
  }
  
  const leaderboard = Object.values(scores)
    .sort((a, b) => b.score - a.score)
    .slice(0, 20);
  
  return { status: 'ok', data: leaderboard };
}

function getStatistics() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName(CONFIG.SHEET_NAME);
  if (!sheet) return { status: 'ok', data: {} };
  
  const data = sheet.getDataRange().getValues();
  const allScores = [];
  const kelasMap = {};
  
  for (let i = 1; i < data.length; i++) {
    const score = Number(data[i][4]);
    const kelas = data[i][3];
    allScores.push(score);
    
    if (!kelasMap[kelas]) kelasMap[kelas] = [];
    kelasMap[kelas].push(score);
  }
  
  if (allScores.length === 0) return { status: 'ok', data: { totalPeserta: 0 } };
  
  const avg = allScores.reduce((a, b) => a + b, 0) / allScores.length;
  const passing = allScores.filter(s => s >= CONFIG.PASSING_SCORE).length;
  
  const rekapKelas = {};
  for (const [kelas, scores] of Object.entries(kelasMap)) {
    const kelasAvg = scores.reduce((a, b) => a + b, 0) / scores.length;
    rekapKelas[kelas] = {
      jumlahPeserta: scores.length,
      rataRata: Math.round(kelasAvg * 10) / 10,
      tertinggi: Math.max(...scores),
      terendah: Math.min(...scores),
      lulus: scores.filter(s => s >= CONFIG.PASSING_SCORE).length
    };
  }
  
  return {
    status: 'ok',
    data: {
      totalPeserta: allScores.length,
      rataRata: Math.round(avg * 10) / 10,
      skorTertinggi: Math.max(...allScores),
      skorTerendah: Math.min(...allScores),
      persentaseLulus: Math.round((passing / allScores.length) * 100),
      rekapKelas
    }
  };
}

function getRekapKelas(kelas) {
  const stats = getStatistics();
  if (kelas && stats.data.rekapKelas) {
    return { status: 'ok', data: stats.data.rekapKelas[kelas] || null };
  }
  return stats;
}

// ================================
// REKAP PER KELAS (Auto-update)
// ================================

function updateRekap(data) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let rekap = ss.getSheetByName(CONFIG.REKAP_SHEET);
  if (!rekap) {
    rekap = ss.insertSheet(CONFIG.REKAP_SHEET);
    const headers = ['Kelas', 'Jumlah Peserta', 'Rata-rata', 'Tertinggi', 'Terendah', '% Lulus', 'Last Updated'];
    rekap.appendRow(headers);
    const headerRange = rekap.getRange(1, 1, 1, headers.length);
    headerRange.setFontWeight('bold');
    headerRange.setBackground('#c8a52e');
    headerRange.setFontColor('#ffffff');
    rekap.setFrozenRows(1);
  }
  
  // Recalculate all classes
  const stats = getStatistics();
  if (!stats.data.rekapKelas) return;
  
  // Clear old data
  if (rekap.getLastRow() > 1) {
    rekap.getRange(2, 1, rekap.getLastRow() - 1, 7).clear();
  }
  
  let row = 2;
  for (const [kelas, info] of Object.entries(stats.data.rekapKelas)) {
    rekap.getRange(row, 1, 1, 7).setValues([[
      kelas,
      info.jumlahPeserta,
      info.rataRata,
      info.tertinggi,
      info.terendah,
      Math.round((info.lulus / info.jumlahPeserta) * 100) + '%',
      new Date().toLocaleString('id-ID', { timeZone: 'Asia/Jakarta' })
    ]]);
    row++;
  }
}

// ================================
// LOGGING
// ================================

function logAccess(data, action) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let logSheet = ss.getSheetByName(CONFIG.LOG_SHEET);
  if (!logSheet) {
    logSheet = ss.insertSheet(CONFIG.LOG_SHEET);
    logSheet.appendRow(['Timestamp', 'Action', 'NIM', 'Nama', 'IP/Info']);
    logSheet.getRange(1, 1, 1, 5).setFontWeight('bold');
    logSheet.setFrozenRows(1);
  }
  
  logSheet.appendRow([
    new Date().toLocaleString('id-ID', { timeZone: 'Asia/Jakarta' }),
    action,
    data.nim || '-',
    data.nama || '-',
    'Via TTS ADDIE Web App'
  ]);
}

// ================================
// TRIGGER OTOMATIS (Opsional)
// ================================

/**
 * Kirim notifikasi email ketika ada skor baru
 * Setup: Triggers → Add Trigger → onEdit → From spreadsheet → On edit
 */
function onEdit(e) {
  // Hanya trigger untuk sheet utama
  if (e.source.getActiveSheet().getName() !== CONFIG.SHEET_NAME) return;
  
  // Uncomment baris berikut untuk aktifkan notifikasi email:
  // const email = 'dosen@email.com';
  // const lastRow = e.source.getActiveSheet().getLastRow();
  // const data = e.source.getActiveSheet().getRange(lastRow, 1, 1, 11).getValues()[0];
  // MailApp.sendEmail(email, 
  //   `[TTS ADDIE] Skor Baru: ${data[1]} - ${data[4]}/100`,
  //   `Nama: ${data[1]}\nNIM: ${data[2]}\nKelas: ${data[3]}\nSkor: ${data[4]}/100\nPredikat: ${data[9]}`
  // );
}

/**
 * Bersihkan log lama setiap minggu
 * Setup: Triggers → Add Trigger → cleanOldLogs → Time-driven → Weekly
 */
function cleanOldLogs() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const logSheet = ss.getSheetByName(CONFIG.LOG_SHEET);
  if (!logSheet || logSheet.getLastRow() <= 1) return;
  
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
  
  const data = logSheet.getDataRange().getValues();
  const rowsToDelete = [];
  
  for (let i = data.length - 1; i >= 1; i--) {
    if (new Date(data[i][0]) < thirtyDaysAgo) {
      rowsToDelete.push(i + 1);
    }
  }
  
  rowsToDelete.forEach(row => logSheet.deleteRow(row));
}
