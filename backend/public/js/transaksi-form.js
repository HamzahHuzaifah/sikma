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
const sectionSpmb = document.getElementById('section_spmb');

// Input elements inside sections to toggle disabled state (disabled inputs won't be submitted)
const tagihanInputs = sectionTagihan ? sectionTagihan.querySelectorAll('select, textarea, input') : [];
const pemasukanInputs = sectionPemasukan ? sectionPemasukan.querySelectorAll('select, textarea, input') : [];
const pengeluaranInputs = sectionPengeluaran ? sectionPengeluaran.querySelectorAll('select, textarea, input') : [];
const tabunganInputs = sectionTabungan ? sectionTabungan.querySelectorAll('select, textarea, input') : [];
const infakInputs = sectionInfak ? sectionInfak.querySelectorAll('select, textarea, input') : [];
const setorMadrasahInputs = sectionSetorMadrasah ? sectionSetorMadrasah.querySelectorAll('select, textarea, input') : [];
const spmbInputs = sectionSpmb ? sectionSpmb.querySelectorAll('select, textarea, input') : [];

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
if (spmbInputs.length) disableInputs(spmbInputs);

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
  if (sectionSpmb) sectionSpmb.classList.add('hidden');
  rowNominal.classList.add('hidden');
  
  disableInputs(tagihanInputs);
  disableInputs(pemasukanInputs);
  disableInputs(pengeluaranInputs);
  disableInputs(tabunganInputs);
  disableInputs(infakInputs);
  disableInputs(setorMadrasahInputs);
  disableInputs(spmbInputs);
  
  jenisTransaksiSelect.innerHTML = '<option value="" disabled selected>-- Pilih Jenis Transaksi --</option>';
  
  if (!lembagaId) {
    rowJenisTransaksi.classList.add('hidden');
    return;
  }
  
  const lembagaSelect = document.getElementById('lembagaId_global');
  const lembagaName = lembagaSelect ? lembagaSelect.options[lembagaSelect.selectedIndex].text : '';
  const isMadrasah = lembagaName.toLowerCase().includes('madrasah');

  // Filter tagihans for selected lembaga
  const filteredTagihans = allTagihans.filter(t => t.lembagaId == lembagaId);
  
  if (filteredTagihans.length > 0 && !isMadrasah) {
    const optGroupTagihan = document.createElement('optgroup');
    optGroupTagihan.label = "Pembayaran Tagihan Santri";
    const option = document.createElement('option');
    option.value = 'pembayaran_tagihan';
    option.textContent = 'Pembayaran Tagihan Santri (SPP, dll)';
    optGroupTagihan.appendChild(option);
    jenisTransaksiSelect.appendChild(optGroupTagihan);
  }

  // Tambahan SPMB options (hanya di Madrasah Pusat)
  if (isMadrasah) {
    const optGroupSpmb = document.createElement('optgroup');
    optGroupSpmb.label = "Pembayaran Tunggakan SPMB";
    
    const optBaru = document.createElement('option');
    optBaru.value = 'pembayaran_daftar_baru_spmb';
    optBaru.textContent = 'Pembayaran Daftar Baru (SPMB)';
    optGroupSpmb.appendChild(optBaru);
    
    const optUlang = document.createElement('option');
    optUlang.value = 'pembayaran_daftar_ulang_spmb';
    optUlang.textContent = 'Pembayaran Daftar Ulang (SPMB)';
    optGroupSpmb.appendChild(optUlang);
    
    jenisTransaksiSelect.appendChild(optGroupSpmb);
  }

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
    enableInputs(tagihanInputs, ['kelasId_tagihan', 'santriId_tagihan']);
    
    // Hide global nominal, because we use custom tagihan nominal total
    const globalNominalWrapper = document.getElementById('global_nominal_wrapper');
    if (globalNominalWrapper) globalNominalWrapper.classList.add('hidden');
    
    // We still need the global nominal to be submitted for backend validation if necessary, 
    // but the actual nominals are in nominal_tagihan[]. We'll update the global nominal via JS.
    nominalInput.removeAttribute('required'); // Will be calculated dynamically
    nominalInput.disabled = false;
    nominalInput.value = '';

    // Reset tagihan container until a santri is selected
    const tagihanContainer = document.getElementById('tagihan_list_container');
    const tagihanTotal = document.getElementById('tagihan_total_container');
    if (tagihanContainer) {
      tagihanContainer.innerHTML = '<div class="text-center py-4 text-sm text-slate-400">-- Pilih Santri Terlebih Dahulu --</div>';
    }
    if (tagihanTotal) {
      tagihanTotal.classList.add('hidden');
      document.getElementById('tagihan_total_display').textContent = 'Rp 0';
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

  } else if (value === 'pembayaran_daftar_baru_spmb' || value === 'pembayaran_daftar_ulang_spmb') {
    if (sectionSpmb) sectionSpmb.classList.remove('hidden');
    enableInputs(spmbInputs, ['santriId_spmb', 'metode_spmb']);
    nominalInput.value = '';
    const globalNominalWrapper = document.getElementById('global_nominal_wrapper');
    if (globalNominalWrapper) globalNominalWrapper.classList.remove('hidden');
    nominalInput.setAttribute('required', 'true');
    nominalInput.disabled = false;
    
    // reset spmb detail
    const spmbDetailContainer = document.getElementById('spmb_detail_container');
    if (spmbDetailContainer) spmbDetailContainer.innerHTML = '-- Pilih Santri Terlebih Dahulu --';
    
    loadSantriSpmb(selectedLembagaId, value === 'pembayaran_daftar_ulang_spmb');

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
    const res = await fetch(`/api/kelas/${lembagaId}?hasSantri=true`);
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
    
    const tagihanContainer = document.getElementById('tagihan_list_container');
    const tagihanTotal = document.getElementById('tagihan_total_container');
    if (tagihanContainer) {
      tagihanContainer.innerHTML = '<div class="text-center py-4 text-sm text-slate-400">-- Pilih Santri Terlebih Dahulu --</div>';
      document.getElementById('nominal').value = '';
    }
    if (tagihanTotal) {
      tagihanTotal.classList.add('hidden');
      document.getElementById('tagihan_total_display').textContent = 'Rp 0';
    }
  } catch (err) {
    console.error(err);
    santriSelect.innerHTML = '<option value="">Gagal memuat santri</option>';
  }
}

window.handleSantriChange = async function(santriId) {
  const tagihanContainer = document.getElementById('tagihan_list_container');
  const tagihanTotal = document.getElementById('tagihan_total_container');
  if (!tagihanContainer) return;

  if (!santriId) {
    tagihanContainer.innerHTML = '<div class="text-center py-4 text-sm text-slate-400">-- Pilih Santri Terlebih Dahulu --</div>';
    document.getElementById('nominal').value = '';
    if (tagihanTotal) tagihanTotal.classList.add('hidden');
    return;
  }

  tagihanContainer.innerHTML = '<div class="text-center py-4 text-sm text-indigo-500 animate-pulse">Memuat Daftar Tagihan...</div>';
  document.getElementById('nominal').value = '';
  if (tagihanTotal) {
    tagihanTotal.classList.add('hidden');
    document.getElementById('tagihan_total_display').textContent = 'Rp 0';
  }

  try {
    const lembagaId = document.getElementById('lembagaId_global').value;
    const res = await fetch(`/api/tagihan/unpaid/${lembagaId}/${santriId}`);
    const unpaidTagihans = await res.json();

    if (unpaidTagihans.length === 0) {
      tagihanContainer.innerHTML = '<div class="text-center py-4 text-sm text-emerald-600 font-bold bg-emerald-50 rounded-lg">Semua Tagihan Santri Ini Sudah Lunas! 🎉</div>';
      return;
    }

    let html = `
      <div class="mb-3 pb-3 border-b border-slate-100 flex justify-between items-center">
        <span class="text-xs font-semibold text-slate-500">Daftar Tagihan Belum Lunas</span>
        <label class="flex items-center gap-2 cursor-pointer text-xs font-bold text-indigo-600 hover:text-indigo-800 transition">
          <input type="checkbox" id="selectAllTagihan" class="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500">
          Pilih Semua
        </label>
      </div>
      <div class="space-y-3">
    `;

    unpaidTagihans.forEach((t, index) => {
      const sisa = Math.floor(t.sisa);
      const isCicil = t.terbayar > 0;
      const sisaText = isCicil ? `(Sisa Rp ${Number(sisa).toLocaleString('id-ID')})` : `(Rp ${Number(sisa).toLocaleString('id-ID')})`;
      const badgeHTML = isCicil ? `<span class="px-2 py-0.5 bg-amber-100 text-amber-700 text-[10px] font-bold rounded uppercase">Mencicil</span>` : '';

      html += `
        <div class="flex flex-col sm:flex-row sm:items-center gap-3 p-3 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-lg transition">
          <label class="flex items-start sm:items-center gap-3 cursor-pointer flex-1">
            <input type="checkbox" name="tagihanId_tagihan[]" value="${t.id}" class="tagihan-checkbox mt-1 sm:mt-0 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 w-5 h-5 transition">
            <div class="flex flex-col">
              <div class="flex items-center gap-2">
                <span class="text-sm font-bold text-slate-700">${t.nama}</span>
                ${badgeHTML}
              </div>
              <span class="text-xs font-semibold text-slate-500">${sisaText}</span>
            </div>
          </label>
          <div class="w-full sm:w-1/3 flex items-center gap-2">
            <span class="text-xs font-bold text-slate-400">Rp</span>
            <input type="number" name="nominal_tagihan[]" value="${sisa}" min="1" max="${sisa}" class="tagihan-nominal-input w-full border border-slate-200 rounded-lg px-3 py-1.5 text-sm shadow-sm focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 outline-none transition duration-150" disabled>
          </div>
        </div>
      `;
    });
    
    html += `</div>`;
    tagihanContainer.innerHTML = html;
    
    if (tagihanTotal) tagihanTotal.classList.remove('hidden');
    
    attachTagihanListeners();

  } catch (err) {
    console.error(err);
    tagihanContainer.innerHTML = '<div class="text-center py-4 text-sm text-rose-500 bg-rose-50 rounded-lg">Gagal memuat tagihan.</div>';
  }
}

function attachTagihanListeners() {
  const selectAll = document.getElementById('selectAllTagihan');
  const checkboxes = document.querySelectorAll('.tagihan-checkbox');
  const nominalInputs = document.querySelectorAll('.tagihan-nominal-input');
  
  function calculateTotal() {
    let total = 0;
    checkboxes.forEach((cb, idx) => {
      const input = nominalInputs[idx];
      if (cb.checked) {
        total += Number(input.value) || 0;
      }
    });
    
    document.getElementById('tagihan_total_display').textContent = 'Rp ' + total.toLocaleString('id-ID');
    document.getElementById('nominal').value = total;
  }

  checkboxes.forEach((cb, idx) => {
    cb.addEventListener('change', function() {
      const input = nominalInputs[idx];
      input.disabled = !this.checked;
      
      // Update selectAll status
      const allChecked = Array.from(checkboxes).every(c => c.checked);
      const someChecked = Array.from(checkboxes).some(c => c.checked);
      selectAll.checked = allChecked;
      selectAll.indeterminate = someChecked && !allChecked;
      
      calculateTotal();
    });
  });

  nominalInputs.forEach(input => {
    input.addEventListener('input', calculateTotal);
  });

  selectAll.addEventListener('change', function() {
    const isChecked = this.checked;
    checkboxes.forEach((cb, idx) => {
      cb.checked = isChecked;
      nominalInputs[idx].disabled = !isChecked;
    });
    calculateTotal();
  });
}

// Remove old handleTagihanSelectChange
// window.handleTagihanSelectChange = function(selectElem) { ... }

async function loadKelasForTabungan(lembagaId) {
  const kelasSelect = document.getElementById('kelasId_tabungan');
  const santriList = document.getElementById('santri_list_tabungan');
  if (!kelasSelect || !santriList) return;
  
  kelasSelect.innerHTML = '<option value="">Memuat kelas...</option>';
  santriList.innerHTML = 'Pilih kelas terlebih dahulu untuk melihat daftar santri.';

  try {
    const res = await fetch(`/api/kelas/${lembagaId}?hasSantri=true`);
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

// ================= SPMB LOGIC =================
window.spmbTunggakanData = [];

async function loadSantriSpmb(lembagaId, isDaftarUlang) {
  const santriSelect = document.getElementById('santriId_spmb');
  if (!santriSelect) return;

  santriSelect.innerHTML = '<option value="">Memuat data dari SPMB...</option>';
  santriSelect.disabled = true;
  
  const lembagaSelect = document.getElementById('lembagaId_global');
  const lembagaName = lembagaSelect ? lembagaSelect.options[lembagaSelect.selectedIndex].text : '';

  try {
    const res = await fetch(`/api/spmb/tunggakan`);
    const allData = await res.json();
    
    window.spmbTunggakanData = allData.filter(item => {
        return item.is_daftar_ulang === isDaftarUlang && item.sisa > 0;
    });

    let html = '<option value="">-- Pilih Santri --</option>';
    if (window.spmbTunggakanData.length === 0) {
      html = '<option value="">Tidak ada tunggakan santri SPMB</option>';
    } else {
      window.spmbTunggakanData.forEach((s, idx) => {
        html += `<option value="${idx}">${s.nama} [${s.lembaga}] (Sisa: Rp ${Number(s.sisa).toLocaleString('id-ID')})</option>`;
      });
    }
    santriSelect.innerHTML = html;
    santriSelect.disabled = false;
  } catch (err) {
    console.error(err);
    santriSelect.innerHTML = '<option value="">Gagal memuat data SPMB</option>';
  }
}

window.handleSantriSpmbChange = function(idx) {
  const detailContainer = document.getElementById('spmb_detail_container');
  const inputNama = document.getElementById('nama_spmb');
  const inputSatuan = document.getElementById('satuan_pendidikan_spmb');
  const inputIsDaftarUlang = document.getElementById('is_daftar_ulang_spmb');
  
  if (!detailContainer) return;

  if (idx === "") {
    detailContainer.innerHTML = '-- Pilih Santri Terlebih Dahulu --';
    document.getElementById('nominal').value = '';
    inputNama.disabled = true;
    inputSatuan.disabled = true;
    inputIsDaftarUlang.disabled = true;
    return;
  }

  const data = window.spmbTunggakanData[idx];
  if (!data) return;

  // Set hidden inputs to send to backend
  inputNama.value = data.nama;
  inputNama.disabled = false;
  
  inputSatuan.value = data.satuan_pendidikan_asli;
  inputSatuan.disabled = false;
  
  inputIsDaftarUlang.value = data.is_daftar_ulang ? 'true' : 'false';
  inputIsDaftarUlang.disabled = false;
  
  document.getElementById('nominal').value = data.sisa;
  
  detailContainer.innerHTML = `
    <div class="flex flex-col gap-2">
      <div class="flex justify-between border-b border-slate-100 pb-2">
        <span class="font-bold text-slate-700">Jenis Tagihan</span>
        <span class="text-indigo-600 font-bold">${data.nama_tagihan}</span>
      </div>
      <div class="flex justify-between border-b border-slate-100 pb-2">
        <span class="font-bold text-slate-700">Total Tagihan</span>
        <span class="text-slate-600">Rp ${Number(data.total).toLocaleString('id-ID')}</span>
      </div>
      <div class="flex justify-between border-b border-slate-100 pb-2">
        <span class="font-bold text-slate-700">Sudah Dibayar</span>
        <span class="text-emerald-600">Rp ${Number(data.dibayar).toLocaleString('id-ID')}</span>
      </div>
      <div class="flex justify-between pt-1">
        <span class="font-black text-slate-800">Sisa Tunggakan</span>
        <span class="text-rose-600 font-black text-lg">Rp ${Number(data.sisa).toLocaleString('id-ID')}</span>
      </div>
    </div>
  `;
}
