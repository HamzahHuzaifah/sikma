/**
 * JS helper for Santri Import page
 */

document.addEventListener('DOMContentLoaded', () => {
  const spmbForm = document.getElementById('spmbForm');
  const btnPull = document.getElementById('btnPull');

  if (spmbForm && btnPull) {
    spmbForm.addEventListener('submit', (e) => {
      // Ubah tombol menjadi loading state
      btnPull.disabled = true;
      btnPull.innerHTML = `
        <span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
        Menghubungkan & Menarik Data dari SPMB...
      `;
    });
  }
});

function isiDataTesting() {
  const names = ['Ahmad Fauzi', 'Budi Santoso', 'Citra Kirana', 'Dewi Lestari', 'Eko Prasetyo'];
  const randomName = names[Math.floor(Math.random() * names.length)] + ' ' + Math.floor(Math.random() * 1000);
  
  document.getElementById('namaManual').value = randomName;
  document.getElementById('kelasManual').value = 'Kelas Testing';
  
  const lembagaSelect = document.getElementById('lembagaManual');
  if (lembagaSelect && lembagaSelect.options.length > 1) {
    const randomIndex = Math.floor(Math.random() * (lembagaSelect.options.length - 1)) + 1;
    lembagaSelect.selectedIndex = randomIndex;
    
    // Sync the custom Tailwind select dropdown UI if it exists
    if (lembagaSelect.tailwindSelect) {
      lembagaSelect.tailwindSelect.syncValue();
    }
  }
}
