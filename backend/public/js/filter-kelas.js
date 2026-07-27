// Memuat Kelas Berdasarkan Lembaga
function loadKelasFilter(lembagaId) {
    const kelasSelect = document.getElementById('kelasId');
    const santriSelect = document.getElementById('santriId');
    if (!kelasSelect) return;

    kelasSelect.innerHTML = '<option value="">Semua Kelas</option>';
    if (santriSelect) {
        santriSelect.innerHTML = '<option value="">Semua Santri</option>';
    }

    if (!lembagaId) return;

    const selectedKelas = kelasSelect.dataset.selectedKelas || '';

    fetch(`/api/kelas?lembagaId=${lembagaId}`)
    .then(res => res.json())
    .then(data => {
        data.forEach(k => {
            const selected = selectedKelas == k.id ? 'selected' : '';
            kelasSelect.innerHTML += `<option value="${k.id}" ${selected}>${k.nama}</option>`;
        });
        // Auto load santri if kelas is selected
        if (kelasSelect.value) {
            loadSantriFilter(kelasSelect.value);
        }
    })
    .catch(err => console.error('Error fetching kelas:', err));
}

// Memuat Santri Berdasarkan Kelas
function loadSantriFilter(kelasId) {
    const santriSelect = document.getElementById('santriId');
    if (!santriSelect) return;

    santriSelect.innerHTML = '<option value="">Semua Santri</option>';
    if (!kelasId) return;

    const selectedSantri = santriSelect.dataset.selectedSantri || '';

    fetch(`/api/santri?kelasId=${kelasId}`)
    .then(res => res.json())
    .then(data => {
        data.forEach(s => {
            const selected = selectedSantri == s.id ? 'selected' : '';
            santriSelect.innerHTML += `<option value="${s.id}" ${selected}>${s.nama}</option>`;
        });
    })
    .catch(err => console.error('Error fetching santri:', err));
}

// Load filter options on init if lembaga is pre-selected
document.addEventListener('DOMContentLoaded', () => {
    const lembagaSelect = document.getElementById('lembagaId');
    if (lembagaSelect && lembagaSelect.value) {
        loadKelasFilter(lembagaSelect.value);
    }
});
