console.log("SIKMA: transaksi-form.js loaded successfully!");

const jenisTransaksiSelect = document.getElementById('jenisTransaksi');
const rowNominal = document.getElementById('row_nominal');
const nominalInput = document.getElementById('nominal');

const sectionTagihan = document.getElementById('section_tagihan');
const sectionPemasukan = document.getElementById('section_pemasukan');
const sectionPengeluaran = document.getElementById('section_pengeluaran');
const sectionTabungan = document.getElementById('section_tabungan');
const sectionInfak = document.getElementById('section_infak');
const sectionSetorMadrasah = document.getElementById('section_setor_madrasah');

// Input elements inside sections to toggle disabled state (disabled inputs won't be submitted)
const tagihanInputs = sectionTagihan ? sectionTagihan.querySelectorAll('select, textarea, input') : [];
const pemasukanInputs = sectionPemasukan ? sectionPemasukan.querySelectorAll('select, textarea, input') : [];
const pengeluaranInputs = sectionPengeluaran ? sectionPengeluaran.querySelectorAll('select, textarea, input') : [];
const tabunganInputs = sectionTabungan ? sectionTabungan.querySelectorAll('select, textarea, input') : [];
const infakInputs = sectionInfak ? sectionInfak.querySelectorAll('select, textarea, input') : [];
const setorMadrasahInputs = sectionSetorMadrasah ? sectionSetorMadrasah.querySelectorAll('select, textarea, input') : [];

function disableInputs(inputs) {
  inputs.forEach(input => {
    input.disabled = true;
    input.removeAttribute('required');
    // Mencegah field yang di-disable agar benar-benar tidak dikirim (mencegah duplikat name seperti santriId menjadi array)
    if (input.hasAttribute('name')) {
      input.setAttribute('data-name', input.getAttribute('name'));
      input.removeAttribute('name');
    }
  });
}

function enableInputs(inputs, requiredIds = []) {
  inputs.forEach(input => {
    input.disabled = false;
    if (input.hasAttribute('data-name')) {
      input.setAttribute('name', input.getAttribute('data-name'));
    }
    if (requiredIds.includes(input.id) || input.hasAttribute('data-force-required')) {
      input.setAttribute('required', 'true');
    }
  });
}

// Pre-disable all sections by default
if (tagihanInputs.length) disableInputs(tagihanInputs);
if (pemasukanInputs.length) disableInputs(pemasukanInputs);
if (pengeluaranInputs.length) disableInputs(pengeluaranInputs);
if (tabunganInputs.length) disableInputs(tabunganInputs);
if (infakInputs.length) disableInputs(infakInputs);
if (setorMadrasahInputs.length) disableInputs(setorMadrasahInputs);

const allTagihans = window.allTagihans || [];

function handleLembagaChange(lembagaId) {
  console.log("SIKMA: handleLembagaChange triggered with ID", lembagaId);
  const rowJenisTransaksi = document.getElementById('row_jenis_transaksi');
  if (!rowJenisTransaksi) return;
  
  // Hide all sections first
  sectionTagihan.classList.add('hidden');
  sectionPemasukan.classList.add('hidden');
  sectionPengeluaran.classList.add('hidden');
  sectionTabungan.classList.add('hidden');
  sectionInfak.classList.add('hidden');
  if (sectionSetorMadrasah) sectionSetorMadrasah.classList.add('hidden');
  rowNominal.classList.add('hidden');
  
  disableInputs(tagihanInputs);
  disableInputs(pemasukanInputs);
  disableInputs(pengeluaranInputs);
  disableInputs(tabunganInputs);
  disableInputs(infakInputs);
  disableInputs(setorMadrasahInputs);
  
  jenisTransaksiSelect.innerHTML = '<option value="" disabled selected>-- Pilih Jenis Transaksi --</option>';
  
  if (!lembagaId) {
    rowJenisTransaksi.classList.add('hidden');
    return;
  }
  
  // Filter tagihans for selected lembaga
  const filteredTagihans = allTagihans.filter(t => t.lembagaId == lembagaId);
  
  if (filteredTagihans.length > 0) {
    const optGroupTagihan = document.createElement('optgroup');
    optGroupTagihan.label = "Pembayaran Tagihan Santri";
    const option = document.createElement('option');
    option.value = 'pembayaran_tagihan';
    option.textContent = 'Pembayaran Tagihan Santri (SPP, dll)';
    optGroupTagihan.appendChild(option);
    jenisTransaksiSelect.appendChild(optGroupTagihan);
  }
  
  const lembagaSelect = document.getElementById('lembagaId_global');
  const lembagaName = lembagaSelect ? lembagaSelect.options[lembagaSelect.selectedIndex].text : '';
  const isMadrasah = lembagaName.toLowerCase().includes('madrasah');

  const optGroupUmum = document.createElement('optgroup');
  optGroupUmum.label = "Transaksi Umum";
  
  let optionsHtml = `
    <option value="pemasukan_lain">Pemasukan (Selain Biaya Santri)</option>
    <option value="pengeluaran">Pengeluaran</option>
  `;

  if (isMadrasah) {
    optionsHtml += `
    <option value="infak_harian">Infak Harian</option>
    `;
  } else {
    optionsHtml += `
    <option value="setor_madrasah">Setor Uang ke Madrasah</option>
    <option value="tabungan_setor">Setor Tabungan</option>
    <option value="tabungan_tarik">Tarik Tabungan</option>
    `;
  }
  
  optGroupUmum.innerHTML = optionsHtml;
  jenisTransaksiSelect.appendChild(optGroupUmum);
  
  rowJenisTransaksi.classList.remove('hidden');
}

function handleJenisTransaksiChange(value) {
  try {
    console.log("SIKMA: handleJenisTransaksiChange triggered with value:", value);
    console.log("SIKMA: sectionTabungan element is:", sectionTabungan);
    console.log("SIKMA: rowNominal element is:", rowNominal);
    console.log("SIKMA: globalNominalWrapper element is:", document.getElementById('global_nominal_wrapper'));

    if (sectionTagihan) sectionTagihan.classList.add('hidden');
    if (sectionPemasukan) sectionPemasukan.classList.add('hidden');
    if (sectionPengeluaran) sectionPengeluaran.classList.add('hidden');
    if (sectionTabungan) sectionTabungan.classList.add('hidden');
    if (sectionInfak) sectionInfak.classList.add('hidden');
    if (sectionSetorMadrasah) sectionSetorMadrasah.classList.add('hidden');
    if (rowNominal) rowNominal.classList.add('hidden');

    disableInputs(tagihanInputs);
    disableInputs(pemasukanInputs);
    disableInputs(pengeluaranInputs);
    disableInputs(tabunganInputs);
    disableInputs(infakInputs);
    disableInputs(setorMadrasahInputs);

    if (!value) return;

    if (rowNominal) rowNominal.classList.remove('hidden');
    const selectedLembagaId = document.getElementById('lembagaId_global').value;
    console.log("SIKMA: selectedLembagaId is:", selectedLembagaId);

  if (value === 'pembayaran_tagihan') {
    sectionTagihan.classList.remove('hidden');
    enableInputs(tagihanInputs, ['tagihanId_tagihan', 'kelasId_tagihan', 'santriId_tagihan']);
    
    const globalNominalWrapper = document.getElementById('global_nominal_wrapper');
    if (globalNominalWrapper) globalNominalWrapper.classList.remove('hidden');
    nominalInput.setAttribute('required', 'true');
    nominalInput.disabled = false;
    nominalInput.value = '';

    // Reset tagihan dropdown until a santri is selected
    const tagihanSelect = document.getElementById('tagihanId_tagihan');
    if (tagihanSelect) {
      tagihanSelect.innerHTML = '<option value="">-- Pilih Santri Terlebih Dahulu --</option>';
      tagihanSelect.disabled = true;
    }

    // Load Kelas for this Lembaga
    loadKelasForTagihan(selectedLembagaId);

  } else if (value === 'pemasukan_lain') {
    sectionPemasukan.classList.remove('hidden');
    enableInputs(pemasukanInputs, ['uraianPemasukan', 'diterimaDari', 'pemberi', 'metode_pemasukan']);
    nominalInput.value = '';
    const globalNominalWrapper = document.getElementById('global_nominal_wrapper');
    if (globalNominalWrapper) globalNominalWrapper.classList.remove('hidden');
    nominalInput.setAttribute('required', 'true');
    nominalInput.disabled = false;

  } else if (value === 'pengeluaran') {
    sectionPengeluaran.classList.remove('hidden');
    enableInputs(pengeluaranInputs, ['uraianPengeluaran', 'dibayarkanKepada', 'metode_pengeluaran']);
    nominalInput.value = '';
    const globalNominalWrapper = document.getElementById('global_nominal_wrapper');
    if (globalNominalWrapper) globalNominalWrapper.classList.remove('hidden');
    nominalInput.setAttribute('required', 'true');
    nominalInput.disabled = false;

  } else if (value === 'setor_madrasah') {
    if (sectionSetorMadrasah) sectionSetorMadrasah.classList.remove('hidden');
    enableInputs(setorMadrasahInputs, ['uraian_setoran', 'metode_setoran']);
    nominalInput.value = '';
    const globalNominalWrapper = document.getElementById('global_nominal_wrapper');
    if (globalNominalWrapper) globalNominalWrapper.classList.remove('hidden');
    nominalInput.setAttribute('required', 'true');
    nominalInput.disabled = false;

  } else if (value === 'tabungan_setor' || value === 'tabungan_tarik') {
    sectionTabungan.classList.remove('hidden');
    // santriId_tabungan no longer needs to be enabled here since it's dynamic
    enableInputs(tabunganInputs, ['kelasId_tabungan']);
    nominalInput.value = '';
    
    // Hide global nominal input for Tabungan
    const globalNominalWrapper = document.getElementById('global_nominal_wrapper');
    if (globalNominalWrapper) globalNominalWrapper.classList.add('hidden');
    nominalInput.removeAttribute('required');
    nominalInput.disabled = true;

    loadKelasForTabungan(selectedLembagaId);

  } else if (value === 'infak_harian') {
    sectionInfak.classList.remove('hidden');
    enableInputs(infakInputs);
    nominalInput.value = '';
    const globalNominalWrapper = document.getElementById('global_nominal_wrapper');
    if (globalNominalWrapper) globalNominalWrapper.classList.remove('hidden');
    nominalInput.setAttribute('required', 'true');
    nominalInput.disabled = false;
  }
  } catch (err) {
    console.error("SIKMA Error in handleJenisTransaksiChange:", err);
  }
}

async function loadKelasForTagihan(lembagaId) {
  const kelasSelect = document.getElementById('kelasId_tagihan');
  const santriSelect = document.getElementById('santriId_tagihan');
  if (!kelasSelect || !santriSelect) return;
  
  kelasSelect.innerHTML = '<option value="">Memuat kelas...</option>';
  santriSelect.innerHTML = '<option value="">-- Pilih Kelas Terlebih Dahulu --</option>';
  santriSelect.disabled = true;

  try {
    const res = await fetch(`/api/kelas/${lembagaId}`);
    const kelasList = await res.json();

    let html = '<option value="">-- Pilih Kelas --</option>';
    if (kelasList.length === 0) {
      html = '<option value="">Tidak ada kelas di lembaga ini</option>';
    } else {
      kelasList.forEach(k => {
        html += `<option value="${k.id}">${k.nama}</option>`;
      });
    }
    kelasSelect.innerHTML = html;
  } catch (err) {
    console.error(err);
    kelasSelect.innerHTML = '<option value="">Gagal memuat kelas</option>';
  }
}

async function handleKelasChange(kelasId) {
  const santriSelect = document.getElementById('santriId_tagihan');
  if (!santriSelect) return;

  if (!kelasId) {
    santriSelect.innerHTML = '<option value="">-- Pilih Kelas Terlebih Dahulu --</option>';
    santriSelect.disabled = true;
    return;
  }

  santriSelect.innerHTML = '<option value="">Memuat santri...</option>';
  santriSelect.disabled = false;

  try {
    const res = await fetch(`/api/santri/${kelasId}`);
    const santriList = await res.json();

    let html = '<option value="">-- Pilih Santri --</option>';
    if (santriList.length === 0) {
      html = '<option value="">Tidak ada santri di kelas ini</option>';
    } else {
      santriList.forEach(s => {
        html += `<option value="${s.id}">${s.nama}</option>`;
      });
    }
    santriSelect.innerHTML = html;
    
    const tagihanSelect = document.getElementById('tagihanId_tagihan');
    if (tagihanSelect) {
      tagihanSelect.innerHTML = '<option value="">-- Pilih Santri Terlebih Dahulu --</option>';
      tagihanSelect.disabled = true;
      document.getElementById('nominal').value = '';
    }
  } catch (err) {
    console.error(err);
    santriSelect.innerHTML = '<option value="">Gagal memuat santri</option>';
  }
}

window.handleSantriChange = async function(santriId) {
  const tagihanSelect = document.getElementById('tagihanId_tagihan');
  if (!tagihanSelect) return;

  if (!santriId) {
    tagihanSelect.innerHTML = '<option value="">-- Pilih Santri Terlebih Dahulu --</option>';
    tagihanSelect.disabled = true;
    document.getElementById('nominal').value = '';
    return;
  }

  tagihanSelect.innerHTML = '<option value="">Memuat Tagihan...</option>';
  tagihanSelect.disabled = false;
  document.getElementById('nominal').value = '';

  try {
    const lembagaId = document.getElementById('lembagaId_global').value;
    const res = await fetch(`/api/tagihan/unpaid/${lembagaId}/${santriId}`);
    const unpaidTagihans = await res.json();

    let html = '<option value="">-- Pilih Tagihan --</option>';
    if (unpaidTagihans.length === 0) {
      html = '<option value="">Semua Tagihan Sudah Lunas!</option>';
    } else {
      unpaidTagihans.forEach(t => {
        html += `<option value="${t.id}" data-nominal="${Math.floor(t.nominal)}">${t.nama} (Rp ${Number(t.nominal).toLocaleString('id-ID')})</option>`;
      });
    }
    tagihanSelect.innerHTML = html;
  } catch (err) {
    console.error(err);
    tagihanSelect.innerHTML = '<option value="">Gagal memuat tagihan</option>';
  }
}

async function loadKelasForTabungan(lembagaId) {
  const kelasSelect = document.getElementById('kelasId_tabungan');
  const santriList = document.getElementById('santri_list_tabungan');
  if (!kelasSelect || !santriList) return;
  
  kelasSelect.innerHTML = '<option value="">Memuat kelas...</option>';
  santriList.innerHTML = 'Pilih kelas terlebih dahulu untuk melihat daftar santri.';

  try {
    const res = await fetch(`/api/kelas/${lembagaId}`);
    const kelasData = await res.json();

    let html = '<option value="">-- Pilih Kelas --</option>';
    if (kelasData.length === 0) {
      html = '<option value="">Tidak ada kelas di lembaga ini</option>';
    } else {
      kelasData.forEach(k => {
        html += `<option value="${k.id}">${k.nama}</option>`;
      });
    }
    kelasSelect.innerHTML = html;
  } catch (err) {
    console.error(err);
    kelasSelect.innerHTML = '<option value="">Gagal memuat kelas</option>';
  }
}

async function handleKelasChangeTabungan(kelasId) {
  const santriList = document.getElementById('santri_list_tabungan');
  if (!santriList) return;

  if (!kelasId) {
    santriList.innerHTML = 'Pilih kelas terlebih dahulu untuk melihat daftar santri.';
    return;
  }

  santriList.innerHTML = '<div class="text-center py-4"><i class="bi bi-arrow-repeat animate-spin inline-block text-2xl text-indigo-500"></i><p class="mt-2 text-sm">Memuat daftar santri...</p></div>';

  try {
    const res = await fetch(`/api/santri/${kelasId}`);
    const data = await res.json();

    if (data.length === 0) {
      santriList.innerHTML = '<div class="text-amber-600 bg-amber-50 p-4 rounded-lg">Tidak ada data santri di kelas ini.</div>';
      return;
    }

    let html = `
      <div class="overflow-x-auto">
        <table class="w-full text-left border-collapse">
          <thead>
            <tr class="bg-slate-100 border-b border-slate-200 text-xs uppercase text-slate-600">
              <th class="p-3 font-semibold rounded-tl-lg">Nama Santri</th>
              <th class="p-3 font-semibold rounded-tr-lg" style="width: 250px;">Nominal (Rp)</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-100">
    `;

    data.forEach(s => {
      html += `
        <tr class="hover:bg-slate-50 transition duration-150">
          <td class="p-3 align-middle font-medium text-slate-700">
            ${s.nama}
            <input type="hidden" name="santriId_tabungan[]" value="${s.id}">
          </td>
          <td class="p-2 align-middle">
            <input 
              type="number" 
              name="nominal_tabungan[]" 
              min="0"
              placeholder="0"
              class="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm shadow-sm focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 outline-none transition duration-150"
            >
          </td>
        </tr>
      `;
    });

    html += `
          </tbody>
        </table>
      </div>
      <p class="text-xs text-slate-400 mt-3"><i class="bi bi-info-circle mr-1"></i>Kosongkan nominal jika anak tidak menabung hari ini.</p>
    `;
    
    santriList.innerHTML = html;
  } catch (err) {
    console.error(err);
    santriList.innerHTML = '<div class="text-red-500 bg-red-50 p-4 rounded-lg">Gagal memuat data santri. Silakan coba lagi.</div>';
  }
}

window.handleTagihanSelectChange = function(selectElem) {
  const selectedOption = selectElem.options[selectElem.selectedIndex];
  if (selectedOption && selectedOption.value) {
    const nominal = selectedOption.getAttribute('data-nominal');
    document.getElementById('nominal').value = nominal || '0';
  } else {
    document.getElementById('nominal').value = '';
  }
}
