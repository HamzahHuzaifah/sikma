async function handleLembagaChange(lembagaId) {
  const kelasSelect = document.getElementById('kelasId');
  if (!kelasSelect) return;
  
  kelasSelect.innerHTML = '<option value="">Memuat kelas...</option>';
  
  if (!lembagaId) {
    kelasSelect.innerHTML = '<option value="">-- Tanpa Kelas --</option>';
    return;
  }
  
  try {
    const res = await fetch(`/api/kelas/${lembagaId}`);
    const kelasList = await res.json();
    
    let html = '<option value="">-- Tanpa Kelas --</option>';
    if (kelasList.length > 0) {
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
