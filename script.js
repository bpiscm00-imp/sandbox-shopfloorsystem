// =========================================================================
// 🔗 URL WEB APP APPS SCRIPT
// =========================================================================
const WEB_APP_URL = "https://script.google.com/macros/s/AKfycbzcfVJRdI75U-64wMcxeqzxfxiyHDFKUvaFkMu2eVJFzrA-8kCyAxMOk6LtbJou1S4dsw/exec";

// =========================================================================
// 🗄️ DATABASE FORMULA & KOMPONEN KIT MASTER LOKAL (MOCK BOM)
// =========================================================================
const DATABASE_FORMULA_LOKAL = {
  "IMP EYE SHADOW 11 COLOUR": [
    "RM-0012 - Talc Powder Premium A",
    "RM-0045 - Mica Shimmer Pearl B",
    "RM-0089 - Binder Liquid Type C",
    "RM-0102 - Magnesium Stearate"
  ],
  "IMP LIP CREAM MATTE CAROLINA": [
    "RM-0210 - Isododecane Base",
    "RM-0340 - Kaolin Clay Smooth",
    "RM-0512 - Red Pigment Paste CI-15850"
  ],
  "IMP SINGLE PIGMEN": [
    "RM-0012 - Talc Powder Premium A",
    "RM-0788 - Titanium Dioxide Pure"
  ]
};

const MASTER_PRODUCT_KIT = {
  "IMP EYE SHADOW 11 COLOUR": ["Kit Wadah Casing", "Kit Cermin Internal", "Kit Aplikator Kuas", "Kit Penutup Akrilik"],
  "IMP LIP CREAM MATTE CAROLINA": [], 
  "IMP SINGLE PIGMEN": []
};

const INVENTORY_ALL_RM_GUDARE = [
  "RM-0012 - Talc Powder Premium A",
  "RM-0045 - Mica Shimmer Pearl B",
  "RM-0089 - Binder Liquid Type C",
  "RM-0102 - Magnesium Stearate",
  "RM-0210 - Isododecane Base",
  "RM-0340 - Kaolin Clay Smooth",
  "RM-0512 - Red Pigment Paste CI-15850",
  "RM-0788 - Titanium Dioxide Pure",
  "RM-0999 - Bahan Alternatif Substitusi Lapangan"
];

let userActive = { nama: "", role: "" };
let selectedMeta = { batch: "", subbrand: "", mesin: "", noMesin: "", statusSICAktif: "", statusQCAktif: "AWAL", statusMaintAktif: "MULAI" };

// Global State Data Modul Baru
let dataTimbanganRM_Tersimpan = [];
let statusRM_SudahIsi = false;

function hitungTotalWaktuOperasional(jamMulai, jamSelesai) {
  if(!jamMulai || !jamSelesai) return "—";
  const [h1, m1] = jamMulai.split(':').map(Number);
  const [h2, m2] = jamSelesai.split(':').map(Number);
  let t1 = (h1 * 60) + m1, t2 = (h2 * 60) + m2;
  if (t2 < t1) t2 += 24 * 60;
  let diff = t2 - t1;
  return `${Math.floor(diff / 60)} Jam ${diff % 60} Menit`;
}

function cekPINPanjangKarakter() {
  const pin = document.getElementById('input-pin').value;
  if(pin.length === 4) {
    verifikasiPINKeBackend();
  }
}

// =========================================================================
// 🔐 DATABASE PIN OTORISASI LOKAL (UNTUK MODE SIMULASI & SANDBOX)
// =========================================================================
// =========================================================================
// 🔐 DATABASE PIN OTORISASI LOKAL (UNTUK MODE SIMULASI & SANDBOX)
// =========================================================================
const DATABASE_PIN_LOKAL = {
  "1234": { nama: "Makata Aldian", role: "SIC" },
  "5678": { nama: "Budi Santoso", role: "OEE" },
  "9999": { nama: "Rizky Nugraha", role: "PACKING" },
  "1111": { nama: "Tim QC Utama", role: "QC" }
};

// Pastikan fungsi pendeteksi ketikan ini dibuat bersih tanpa tabrakan eksekusi
function cekPINPanjangKarakter() {
  const pinVal = document.getElementById('input-pin').value.trim();
  if(pinVal.length === 4) {
    document.getElementById('input-pin').blur(); // Lepas fokus keyboard otomatis
    verifikasiPINKeBackend();
  }
}

function verifikasiPINKeBackend() {
  const pinInput = document.getElementById('input-pin').value.trim(); // Ambil nilai murni tanpa spasi pembatas
  
  if(!pinInput) {
    alert("Silakan ketik PIN Anda!");
    return;
  }
  
  // Sembunyikan tombol sementara agar tidak diklik dua kali oleh operator
  document.getElementById('btn-login-submit').style.display = "none";
  document.getElementById('txt-login-loading').style.display = "block";
  
  // Simulasi jeda autentikasi lokal demi kenyamanan visual operator (0.3 detik)
  setTimeout(() => {
    document.getElementById('txt-login-loading').style.display = "none";
    
    // Validasi pengecekan ke database objek lokal
    if (DATABASE_PIN_LOKAL[pinInput]) {
      const userTerdeteksi = DATABASE_PIN_LOKAL[pinInput];
      
      userActive.nama = userTerdeteksi.nama;
      userActive.role = userTerdeteksi.role;
      
      // Update antarmuka visual dashboard
      document.getElementById('title-operator-welcome').innerText = `Metadata Operator: ${userActive.nama} (${userActive.role})`;
      document.getElementById('sec-login').style.display = "none";
      document.getElementById('sec-filter').style.display = "block";
      document.getElementById('sec-history').style.display = "block";
      document.getElementById('btn-logout').style.display = "block"; // Munculkan tombol keluar
      
      document.getElementById('txt-app-subtitle').innerText = `Selamat bekerja, silakan lengkapi identitas penugasan shift Anda.`;
      
      // Jalankan fungsi load dropdown simulasi lokal
      loadDaftarBatchDanSubbrandDariServer();
      renderHistoryTable();
    } else {
      // Jika salah, kembalikan posisi tombol login semula
      alert("PIN Otorisasi Lokal Salah atau Tidak Terdaftar!\n\nGunakan PIN Uji Coba:\n➔ 1234 (SIC)\n➔ 5678 (OEE)");
      document.getElementById('input-pin').value = "";
      document.getElementById('btn-login-submit').style.display = "block";
    }
  }, 300);
}
function loadDaftarBatchDanSubbrandDariServer() {
  // SUNTIK DATA BATCH & SUBBRAND SECARA LOKAL UNTUK SIMULASI SANDBOX
  const mockBatches = ["BATCH-ES-001", "BATCH-LC-042", "BATCH-XAU99"];
  const mockSubbrands = ["IMP EYE SHADOW 11 COLOUR", "IMP LIP CREAM MATTE CAROLINA", "IMP SINGLE PIGMEN"];
  
  const selBatch = document.getElementById('select-batch');
  selBatch.innerHTML = `<option value="" disabled selected>-- Pilih Nomor Batch --</option>`;
  mockBatches.forEach(b => {
    selBatch.innerHTML += `<option value="${b}">${b}</option>`;
  });
  
  const selSub = document.getElementById('select-subbrand');
  selSub.innerHTML = `<option value="" disabled selected>-- Pilih Subbrand Master --</option>`;
  mockSubbrands.forEach(s => {
    selSub.innerHTML += `<option value="${s}">${s}</option>`;
  });

  // Pasang ulang trigger otomatis resep
  selSub.removeEventListener('change', handlePerubahanSubbrandTrigger);
  selSub.addEventListener('change', handlePerubahanSubbrandTrigger);
}
// LOGIKA SUNTIK OTOMATIS BERDASARKAN SUBBRAND PILIHAN (PERTANYAAN NO 2)
function handlePerubahanSubbrandTrigger() {
  const subbrandVal = this.value;
  
  // Reset data Timbangan Raw Material
  dataTimbanganRM_Tersimpan = [];
  statusRM_SudahIsi = false;
  const btnRM = document.getElementById('btn-buka-rm');
  btnRM.className = "btn btn-warning";
  btnRM.innerHTML = "⚖️ Isi Konsumsi Raw Material Batch Ini";
  
  const bodyTabel = document.getElementById('body-tabel-rm');
  bodyTabel.innerHTML = "";
  
  const resepBawaan = DATABASE_FORMULA_LOKAL[subbrandVal] || [];
  resepBawaan.forEach(bahan => {
    tambahBarisBahanBakuManual(bahan);
  });

  // Logika Menggelar Pertanyaan Kit untuk Tim Packing (Kasus 2)
  const containerKit = document.getElementById('container-modul-kit');
  const listInputKit = document.getElementById('list-input-kit');
  const daftarKit = MASTER_PRODUCT_KIT[subbrandVal] || [];

  if(daftarKit.length > 0) {
    containerKit.style.display = "block";
    listInputKit.innerHTML = "";
    
    daftarKit.forEach(namaKit => {
      const uniqueId = namaKit.replace(/\s+/g, '-').toLowerCase();
      const div = document.createElement('div');
      div.className = "kit-card";
      div.id = `card-${uniqueId}`;
      div.innerHTML = `
        <div class="kit-row">
          <div class="kit-name">${namaKit}</div>
          <div class="flex-1"><input type="text" class="input-batch-kit1" placeholder="Cari No Batch ${namaKit}..." required></div>
          <div class="w-90"><input type="number" class="input-qty-kit1" placeholder="Pcs" style="text-align:center;" required></div>
          <div><button type="button" class="btn-kombinasi" onclick="toggleKombinasiBatchKitEksklusif('${uniqueId}')">+ Kombinasi</button></div>
        </div>
        <div id="sub-batch-${uniqueId}" style="display:none;"></div>
      `;
      listInputKit.appendChild(div);
    });
  } else {
    containerKit.style.display = "none";
  }
}

function evaluasiKondisiMesinBagiRawMaterial() {
  const mesinVal = document.getElementById('select-mesin').value.toLowerCase();
  const boxTombolRM = document.getElementById('container-tombol-rm');
  
  if (mesinVal.includes('mixing') && userActive.role === 'SIC') {
    boxTombolRM.style.display = "block";
  } else {
    boxTombolRM.style.display = "none";
  }
}

// FUNGSI MODAL RAW MATERIAL
function bukaModalRawMaterial() {
  const subVal = document.getElementById('select-subbrand').value;
  if(!subVal) {
    alert("Silakan pilih Subbrand Master terlebih dahulu di Pertanyaan Nomor 2!");
    return;
  }
  document.getElementById('judul-modal-rm').innerText = `Form Timbangan: ${subVal}`;
  document.getElementById('modal-rm').style.display = "flex";
}

function tutupModalRawMaterial() {
  document.getElementById('modal-rm').style.display = "none";
}

function tambahBarisBahanBakuManual(namaBahanBawaan = "") {
  const tbody = document.getElementById('body-tabel-rm');
  const tr = document.createElement('tr');
  tr.style.borderBottom = "1px solid #f0f0f0";
  
  let optionsHtml = `<option value="" disabled ${namaBahanBawaan === "" ? "selected" : ""}>-- Pilih Bahan --</option>`;
  INVENTORY_ALL_RM_GUDARE.forEach(item => {
    const activeSel = item === namaBahanBawaan ? "selected" : "";
    optionsHtml += `<option value="${item}" ${activeSel}>${item}</option>`;
  });

  tr.innerHTML = `
    <td style="padding: 6px 2px;">
      <select class="select-rm-item" style="width:100%; padding:6px; border-radius:4px;">${optionsHtml}</select>
    </td>
    <td style="padding: 6px 2px;">
      <input type="number" class="qty-rm-item" placeholder="0.00" style="text-align: right; width:100%; padding:6px; border-radius:4px;" step="0.01" required>
    </td>
    <td style="padding: 6px 2px; text-align: center;">
      <button type="button" style="color:red; background:none; border:none; font-weight:bold; font-size:14px; cursor:pointer;" onclick="this.closest('tr').remove()">&times;</button>
    </td>
  `;
  tbody.appendChild(tr);
}

function simpanFormRawMaterialKeMemori() {
  const rows = document.querySelectorAll('#body-tabel-rm tr');
  dataTimbanganRM_Tersimpan = [];
  
  let validasiAdaIsi = false;
  rows.forEach(row => {
    const itemRM = row.querySelector('.select-rm-item').value;
    const qtyRM = row.querySelector('.qty-rm-item').value;
    if(itemRM && qtyRM) {
      validasiAdaIsi = true;
      dataTimbanganRM_Tersimpan.push({ nama_material: itemRM, qty: Number(qtyRM) });
    }
  });

  if(!validasiAdaIsi) {
    alert("Mohon isi kuantitas minimal untuk satu item bahan baku!");
    return;
  }

  statusRM_SudahIsi = true;
  const btnRM = document.getElementById('btn-buka-rm');
  btnRM.className = "btn btn-success";
  btnRM.innerHTML = "✓ Raw Material Terkunci Akurat (Klik untuk Ubah)";
  tutupModalRawMaterial();
  alert("Data Raw Material sukses diamankan di memori lokal aplikasi!");
}

// FUNGSI KOMBINASI BATCH KIT
function toggleKombinasiBatchKitEksklusif(idKit) {
  const sub = document.getElementById(`sub-batch-${idKit}`);
  const card = document.getElementById(`card-${idKit}`);
  const btn = card.querySelector('.btn-kombinasi');

  if(sub.style.display === "none") {
    sub.style.display = "block";
    card.style.borderColor = "#adc6ff";
    card.style.background = "#f0f5ff";
    btn.innerHTML = "✓ Aktif";
    btn.classList.add('active');
    sub.innerHTML = `
      <div class="sub-kit-row">
        <div class="sub-kit-label">↳ Batch 2:</div>
        <div class="flex-1"><input type="text" class="input-batch-kit2" placeholder="No Batch ke-2..." required></div>
        <div class="w-90"><input type="number" class="input-qty-kit2" placeholder="Pcs" style="text-align: center;" required></div>
        <div style="width:40px; text-align:right;">
          <button type="button" style="color:red; background:none; border:none; font-weight:bold; cursor:pointer;" onclick="hapusSubBatchKitEksklusif('${idKit}')">&times;</button>
        </div>
      </div>
    `;
  } else {
    hapusSubBatchKitEksklusif(idKit);
  }
}

function hapusSubBatchKitEksklusif(idKit) {
  const sub = document.getElementById(`sub-batch-${idKit}`);
  const card = document.getElementById(`card-${idKit}`);
  const btn = card.querySelector('.btn-kombinasi');
  sub.style.display = "none";
  sub.innerHTML = "";
  card.style.borderColor = "#f0f0f0";
  card.style.background = "#fafafa";
  btn.innerHTML = "+ Kombinasi";
  btn.classList.remove('active');
}

function kunciMetadataDanLanjutKeForm() {
  selectedMeta.batch = document.getElementById('select-batch').value;
  selectedMeta.subbrand = document.getElementById('select-subbrand').value;
  selectedMeta.mesin = document.getElementById('select-mesin').value;
  selectedMeta.noMesin = document.getElementById('select-no-mesin').value;

  if(!selectedMeta.batch || !selectedMeta.subbrand || !selectedMeta.mesin || !selectedMeta.noMesin) {
    alert("Mohon lengkapi keempat pertanyaan metadata identitas di atas!");
    return;
  }

  // VALIDASI PROTEKSI RAW MATERIAL KHUSUS MIXING
  if(selectedMeta.mesin.toLowerCase().includes('mixing') && userActive.role === 'SIC' && !statusRM_SudahIsi) {
    alert("⚠️ Anda memilih mesin Mixing. Anda WAJIB mengisi pop-up data konsumsi Raw Material terlebih dahulu sebelum melanjutkan!");
    return;
  }

  document.getElementById('panel-meta-summary').innerHTML = `
    <strong>📌 AKTIVITAS BERJALAN:</strong><br>
    Batch: <code>${selectedMeta.batch}</code> | ${selectedMeta.subbrand}<br>
    Lini: ${selectedMeta.mesin} - Line ${selectedMeta.noMesin}
  `;

  renderStatusToggleButtonsGrid();
  
  document.getElementById('sec-filter').style.display = "none";
  document.getElementById('sec-form').style.display = "block";
}

function renderStatusToggleButtonsGrid() {
  const container = document.getElementById('container-status-buttons');
  container.innerHTML = "";
  document.getElementById('panel-oee-inputs').style.display = "none";

  let listStatus = [];
  if (userActive.role === 'SIC') {
    listStatus = ["MULAI", "SEDANG PROSES", "ISTIRAHAT", "SANITASI", "SELESAI"];
  } else if (userActive.role === 'QC') {
    listStatus = ["AWAL", "TENGAH", "AKHIR"];
  } else if (userActive.role === 'OEE') {
    listStatus = ["REKAP SHIFT"];
  } else if (userActive.role === 'MAINTENANCE') {
    listStatus = ["MULAI", "SELESAI"];
  }

  listStatus.forEach(st => {
    const btn = document.createElement('button');
    btn.type = "button";
    btn.className = "toggle-btn";
    btn.innerText = st;
    
    let currentActive = "";
    if (userActive.role === 'SIC') currentActive = selectedMeta.statusSICAktif;
    if (userActive.role === 'QC') currentActive = selectedMeta.statusQCAktif;
    if (userActive.role === 'MAINTENANCE') currentActive = selectedMeta.statusMaintAktif;
    if (userActive.role === 'OEE') currentActive = "REKAP SHIFT";

    if(st === currentActive) btn.classList.add('active');

    btn.onclick = function() {
      document.querySelectorAll('.toggle-btn').forEach(b => b.classList.remove('active'));
      this.classList.add('active');
      
      if (userActive.role === 'SIC') selectedMeta.statusSICAktif = st;
      if (userActive.role === 'QC') selectedMeta.statusQCAktif = st;
      if (userActive.role === 'MAINTENANCE') selectedMeta.statusMaintAktif = st;

      if(userActive.role === 'OEE' || st === "REKAP SHIFT") {
        document.getElementById('panel-oee-inputs').style.display = "block";
        document.getElementById('oee-area').value = selectedMeta.mesin;
        document.getElementById('oee-varian').value = selectedMeta.subbrand;
      } else {
        document.getElementById('panel-oee-inputs').style.display = "none";
      }
    };
    container.appendChild(btn);
  });

  if(userActive.role === 'OEE') {
    document.getElementById('panel-oee-inputs').style.display = "block";
    document.getElementById('oee-area').value = selectedMeta.mesin;
    document.getElementById('oee-varian').value = selectedMeta.subbrand;
  }
}

function kembaliKeFilter() {
  document.getElementById('sec-form').style.display = "none";
  document.getElementById('sec-filter').style.display = "block";
}

function kirimDataKeSpreadsheetServer() {
  let statusFinal = "";
  if (userActive.role === 'SIC') statusFinal = selectedMeta.statusSICAktif;
  if (userActive.role === 'QC') statusFinal = selectedMeta.statusQCAktif;
  if (userActive.role === 'MAINTENANCE') statusFinal = selectedMeta.statusMaintAktif;
  if (userActive.role === 'OEE') statusFinal = "REKAP SHIFT";

  if(!statusFinal) {
    alert("Silakan tentukan/klik salah satu tombol status aktivitas terlebih dahulu!");
    return;
  }

  const payload = {
    timestamp: new Date().toLocaleString('id-ID'),
    operator: userActive.nama,
    role: userActive.role,
    action: "submitLog",
    metadata: {
      batch: selectedMeta.batch,
      subbrand: selectedMeta.subbrand,
      mesin: selectedMeta.mesin,
      noMesin: selectedMeta.noMesin,
      statusSICAktif: selectedMeta.statusSICAktif,
      statusQCAktif: selectedMeta.statusQCAktif,
      statusMaintAktif: selectedMeta.statusMaintAktif
    },
    form_data: {}
  };

  // TAMBAHAN: JIKA ADA DATA RAW MATERIAL TERISI, SUNTIKKAN PULA KE PAYLOAD
  if(statusRM_SudahIsi && dataTimbanganRM_Tersimpan.length > 0) {
    payload.raw_materials = dataTimbanganRM_Tersimpan;
  }

  // TAMBAHAN: JIKA ADALAH PRODUK KIT DAN DIINPUT OLEH TIM PACKING
  const containerKit = document.getElementById('container-modul-kit');
  if(containerKit.style.display === "block") {
    const kitDataList = [];
    document.querySelectorAll('#list-input-kit .kit-card').forEach(card => {
      const namaKitItem = card.querySelector('.kit-name').innerText;
      const b1 = card.querySelector('.input-batch-kit1').value;
      const q1 = card.querySelector('.input-qty-kit1').value;
      
      const subRow = card.querySelector('.sub-kit-row');
      let b2 = "—", q2 = 0;
      if(subRow) {
        b2 = card.querySelector('.input-batch-kit2').value || "—";
        q2 = card.querySelector('.input-qty-kit2').value || 0;
      }
      
      if(b1 && q1) {
        kitDataList.push({
          nama_kit: namaKitItem,
          batch_1: b1, qty_1: Number(q1),
          batch_2: b2, qty_2: Number(q2)
        });
      }
    });
    payload.kit_genealogy = kitDataList;
  }

  // Logika Khusus Form OEE
  if(userActive.role === 'OEE') {
    const valOut = document.getElementById('oee-capaian').value || "0";
    const jmMulai = document.getElementById('oee-jam-mulai').value;
    const jmSelesai = document.getElementById('oee-jam-selesai').value;
    const istirahat = Number(document.getElementById('oee-istirahat').value || 0);
    
    let durasiMenitBersih = 0;
    if (jmMulai && jmSelesai) {
      let [h1, m1] = jmMulai.split(':').map(Number);
      let [h2, m2] = jmSelesai.split(':').map(Number);
      let t1 = (h1 * 60) + m1, t2 = (h2 * 60) + m2;
      if (t2 < t1) t2 += 24 * 60;
      durasiMenitBersih = (t2 - t1) - istirahat;
      if(durasiMenitBersih < 0) durasiMenitBersih = 0;
    }

    payload.form_data = { 
      spv: document.getElementById('oee-spv').value, 
      tanggal: document.getElementById('oee-tanggal').value, 
      area: selectedMeta.mesin, 
      varian: selectedMeta.subbrand, 
      jam_mulai: jmMulai, 
      jam_selesai: jmSelesai, 
      istirahat_menit: istirahat.toString(), 
      capaian_pcs: valOut, 
      mp_orang: document.getElementById('oee-mp').value || "0", 
      kemas_rusak: document.getElementById('oee-rusak').value || "0", 
      alasan_rusak: document.getElementById('oee-alasan-rusak').value,
      durasi_bersih_menit: durasiMenitBersih.toString(),
      mesin: selectedMeta.mesin,
      no_mesin: selectedMeta.noMesin
    };
  }

  // Eksekusi POST AJAX ke Google Sheets server
  fetch(WEB_APP_URL, {
    method: "POST",
    mode: "no-cors",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload)
  }).then(() => {
    alert(`Data Transaksi Berhasil Terkirim ke Server!`);
    
    // Simpan ke Riwayat Lokal Browser
    const lokalLogs = JSON.parse(localStorage.getItem('ss_table_logs')) || [];
    lokalLogs.unshift({
      jam: new Date().toLocaleTimeString('id-ID', {hour: '2-digit', minute:'2-digit'}),
      noBatch: selectedMeta.batch,
      mesinLine: `${selectedMeta.mesin} (${selectedMeta.noMesin})`,
      info: userActive.role === 'OEE' ? `Capaian: ${document.getElementById('oee-capaian').value} Pcs` : selectedMeta.subbrand,
      status: statusFinal,
      role: userActive.role,
      operator: userActive.nama
    });
    localStorage.setItem('ss_table_logs', JSON.stringify(lokalLogs));
    
    // Reset parameter dinamis
    dataTimbanganRM_Tersimpan = [];
    statusRM_SudahIsi = false;
    
    renderHistoryTable();
    kembaliKeFilter();
  }).catch(() => alert("Koneksi bermasalah. Gagal mengirim data!"));
}

function renderHistoryTable() {
  const tBody = document.getElementById('history-table-body');
  const logs = JSON.parse(localStorage.getItem('ss_table_logs')) || [];
  
  const filteredLogs = logs.filter(l => l.role === userActive.role && l.operator === userActive.nama);
  
  if(filteredLogs.length === 0) {
    tBody.innerHTML = `<tr><td colspan="5" style="text-align:center; color:#aaa; font-style:italic;">Belum ada riwayat input shift ini.</td></tr>`;
    return;
  }
  
  tBody.innerHTML = filteredLogs.map(l => {
    let colorBadge = "#096dd9";
    if (l.status === "ISTIRAHAT") colorBadge = "#d46b08";
    if (l.status === "SELESAI" || l.status === "AKHIR" || l.status === "CLOSED" || l.status === "REKAP SHIFT") colorBadge = "#cf1322";
    if (l.status === "MULAI" || l.status === "SANITASI" || l.status === "TENGAH") colorBadge = "#389e0d";

    return `<tr>
      <td>${l.jam}</td>
      <td style="font-weight:600;">${l.noBatch}</td>
      <td>${l.mesinLine}</td>
      <td style="color:#666; font-size:10px;">${l.info}</td>
      <td style="text-align:center;"><span class="status-badge" style="background:${colorBadge};">${l.status}</span></td>
    </tr>`;
  }).join('');
}

function clearHistoryLokal() {
  if(confirm("Apakah Anda yakin ingin menghapus seluruh log visual shift ini dari layar HP?")) {
    localStorage.removeItem('ss_table_logs');
    renderHistoryTable();
  }
}

function logoutAplikasi() {
  userActive = { nama: "", role: "" };
  document.getElementById('input-pin').value = "";
  document.getElementById('sec-form').style.display = "none";
  document.getElementById('sec-filter').style.display = "none";
  document.getElementById('sec-history').style.display = "none";
  document.getElementById('sec-login').style.display = "block";
  document.getElementById('txt-app-title').innerText = "Shopfloor System";
  document.getElementById('txt-app-subtitle').innerText = "Silakan masukkan PIN otorisasi Anda.";
}
