async function handleKelasChange(kelasId) {
  const santriSelect = document.getElementById('santriId');
  if (!santriSelect) return;
  
  santriSelect.innerHTML = '<option value="">Memuat santri...</option>';
  
  if (!kelasId) {
    santriSelect.innerHTML = '<option value="">-- Pilih Santri --</option>';
    return;
  }
  
  try {
    const res = await fetch(`/api/santri/${kelasId}`);
    const santriList = await res.json();
    
    let html = '<option value="">-- Pilih Santri --</option>';
    if (santriList.length > 0) {
      santriList.forEach(s => {
        html += `<option value="${s.id}">${s.nama}</option>`;
      });
    } else {
      html = '<option value="">Tidak ada santri di kelas ini</option>';
    }
    santriSelect.innerHTML = html;
  } catch (err) {
    console.error(err);
    santriSelect.innerHTML = '<option value="">Gagal memuat santri</option>';
  }
}
