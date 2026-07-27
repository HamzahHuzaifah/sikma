function openModalLaporan(url) {
    document.getElementById('laporanModal').style.display = 'flex';
    document.getElementById('iframeLoader').style.display = 'flex';
    document.getElementById('laporanIframe').src = url;
    document.body.style.overflow = 'hidden';
}

function closeModalLaporan() {
    document.getElementById('laporanModal').style.display = 'none';
    document.getElementById('laporanIframe').src = '';
    document.body.style.overflow = 'auto';
}
