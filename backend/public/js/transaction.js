/**
 * Handle cascading dropdowns for Transaction Form using Fetch API
 */

// Global elements
const kategoriSelect = document.getElementById('kategoriId');
const kelasSelect = document.getElementById('kelasId');
const santriSelect = document.getElementById('santriId');
const tagihanSelect = document.getElementById('tagihanId');
const nominalInput = document.getElementById('nominal');
const jenisSelect = document.getElementById('jenis');
const keteranganInput = document.getElementById('keterangan');

let currentTagihans = [];

/**
 * Dipanggil saat dropdown Lembaga berubah
 */
async function handleLembagaChange(lembagaId) {
  // Reset dropdowns
  resetSelect(kategoriSelect, '-- Pilih Kategori --');
  resetSelect(kelasSelect, '-- Pilih Kelas (Opsional) --');
  resetSelect(santriSelect, '-- Pilih Kelas Terlebih Dahulu --');
  if (tagihanSelect) {
    resetSelect(tagihanSelect, '-- Pilih Lembaga Terlebih Dahulu --');
  }
  currentTagihans = [];

  if (!lembagaId) {
    kategoriSelect.disabled = true;
    kelasSelect.disabled = true;
    santriSelect.disabled = true;
    if (tagihanSelect) tagihanSelect.disabled = true;
    return;
  }

  try {
    kategoriSelect.disabled = false;
    kelasSelect.disabled = false;
    
    // Fetch Kategori
    kategoriSelect.innerHTML = '<option value="">Memuat kategori...</option>';
    const resKategori = await fetch(`/api/kategori/${lembagaId}`);
    const kategoriData = await resKategori.json();
    populateSelect(kategoriSelect, kategoriData, 'Pilih Kategori');

    // Fetch Kelas
    kelasSelect.innerHTML = '<option value="">Memuat kelas...</option>';
    const resKelas = await fetch(`/api/kelas/${lembagaId}`);
    const kelasData = await resKelas.json();
    populateSelect(kelasSelect, kelasData, 'Pilih Kelas (Opsional)');

    // Fetch Tagihan di tingkat Lembaga
    if (tagihanSelect) {
      tagihanSelect.disabled = false;
      tagihanSelect.innerHTML = '<option value="">Memuat tagihan...</option>';
      const resTagihan = await fetch(`/api/tagihan/lembaga/${lembagaId}`);
      currentTagihans = await resTagihan.json();
      
      let html = '<option value="">-- Pilih Tagihan (Opsional) --</option>';
      if (currentTagihans.length === 0) {
        html = '<option value="">Tidak ada tagihan untuk lembaga ini</option>';
      } else {
        currentTagihans.forEach(tagihan => {
          html += `<option value="${tagihan.id}">${tagihan.nama} (Rp ${Number(tagihan.nominal).toLocaleString('id-ID')})</option>`;
        });
      }
      tagihanSelect.innerHTML = html;
    }

  } catch (error) {
    console.error('Error fetching data for Lembaga:', error);
    alert('Gagal mengambil data Kategori/Kelas/Tagihan untuk lembaga ini.');
  }
}

/**
 * Dipanggil saat dropdown Kelas berubah
 */
async function handleKelasChange(kelasId) {
  // Reset dropdown Santri
  resetSelect(santriSelect, '-- Pilih Santri --');

  if (!kelasId) {
    santriSelect.disabled = true;
    return;
  }

  try {
    santriSelect.disabled = false;
    santriSelect.innerHTML = '<option value="">Memuat santri...</option>';

    // Fetch Santri berdasarkan Kelas
    const resSantri = await fetch(`/api/santri/${kelasId}`);
    const santriData = await resSantri.json();
    populateSelect(santriSelect, santriData, 'Pilih Santri');

  } catch (error) {
    console.error('Error fetching Santri:', error);
    alert('Gagal mengambil data santri untuk kelas ini.');
  }
}

/**
 * Helper untuk mengosongkan dropdown
 */
function resetSelect(element, placeholderText) {
  element.innerHTML = `<option value="">${placeholderText}</option>`;
  element.disabled = true;
}

/**
 * Helper untuk mengisi data ke dropdown
 */
function populateSelect(element, items, placeholderText) {
  let html = `<option value="">-- ${placeholderText} --</option>`;
  if (items.length === 0) {
    html = `<option value="">Tidak ada data tersedia</option>`;
  } else {
    items.forEach(item => {
      html += `<option value="${item.id}">${item.nama}</option>`;
    });
  }
  element.innerHTML = html;
}

// Logic Auto-populasi Form berdasarkan Tagihan terpilih
function updateKeterangan() {
  if (!tagihanSelect || !keteranganInput) return;
  const tagihanId = tagihanSelect.value;
  if (!tagihanId) return;

  const tagihan = currentTagihans.find(t => String(t.id) === String(tagihanId));
  if (tagihan) {
    const santriName = santriSelect.options[santriSelect.selectedIndex]?.text || '';
    const cleanSantriName = santriName.startsWith('--') || santriName.includes('Memuat') || santriName.includes('Pilih') ? '' : santriName;
    if (cleanSantriName) {
      keteranganInput.value = `Pembayaran ${tagihan.nama} - ${cleanSantriName}`;
    } else {
      keteranganInput.value = `Pembayaran ${tagihan.nama}`;
    }
  }
}

if (tagihanSelect) {
  tagihanSelect.addEventListener('change', (e) => {
    const tagihanId = e.target.value;
    const kelasLabel = document.querySelector('label[for="kelasId"]');
    const santriLabel = document.querySelector('label[for="santriId"]');

    if (!tagihanId) {
      // Jika dikosongkan, reset field-field auto-fill
      nominalInput.value = '';
      kategoriSelect.value = '';
      jenisSelect.value = 'Pemasukan';
      keteranganInput.value = '';
      
      // Kembalikan Kelas & Santri menjadi opsional
      kelasSelect.required = false;
      santriSelect.required = false;
      if (kelasLabel) kelasLabel.innerHTML = 'Kelas (Opsional)';
      if (santriLabel) santriLabel.innerHTML = 'Nama Santri (Opsional)';
      return;
    }

    const tagihan = currentTagihans.find(t => String(t.id) === String(tagihanId));
    if (tagihan) {
      nominalInput.value = Math.floor(tagihan.nominal);
      jenisSelect.value = 'Pemasukan';
      
      // Kelas & Santri wajib diisi jika tagihan dipilih
      kelasSelect.required = true;
      santriSelect.required = true;
      if (kelasLabel) kelasLabel.innerHTML = 'Kelas *';
      if (santriLabel) santriLabel.innerHTML = 'Nama Santri *';

      updateKeterangan();
    }
  });
}

if (santriSelect) {
  santriSelect.addEventListener('change', () => {
    updateKeterangan();
  });
}
