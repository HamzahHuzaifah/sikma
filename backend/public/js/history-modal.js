  let currentHistoryPage = 1;

  function openHistoryModal() {
    const modal = document.getElementById('historyModal');
    const content = document.getElementById('historyModalContent');
    
    modal.classList.remove('hidden');
    // Allow display: block to apply before transition
    setTimeout(() => {
      modal.classList.remove('opacity-0');
      content.classList.remove('scale-95');
      content.classList.add('scale-100');
    }, 10);

    fetchHistoryLogs(1);
  }

  function closeHistoryModal() {
    const modal = document.getElementById('historyModal');
    const content = document.getElementById('historyModalContent');
    
    modal.classList.add('opacity-0');
    content.classList.remove('scale-100');
    content.classList.add('scale-95');
    
    setTimeout(() => {
      modal.classList.add('hidden');
    }, 300);
  }

  // Close modal when clicking outside
  document.getElementById('historyModal').addEventListener('click', function(e) {
    if (e.target === this) {
      closeHistoryModal();
    }
  });

  function formatTimeAgo(dateString) {
    const date = new Date(dateString);
    const now = new Date();
    const diffInSeconds = Math.floor((now - date) / 1000);
    
    if (diffInSeconds < 60) return 'Baru saja';
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} mnt lalu`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} jam lalu`;
    
    const diffInDays = Math.floor(diffInSeconds / 86400);
    if (diffInDays === 1) return 'Kemarin';
    if (diffInDays < 7) return `${diffInDays} hari lalu`;
    
    return date.toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' });
  }

  function getAksiStyle(aksi) {
    switch (aksi?.toUpperCase()) {
      case 'INPUT': return 'bg-emerald-100 text-emerald-700';
      case 'EDIT': return 'bg-blue-100 text-blue-700';
      case 'HAPUS': return 'bg-rose-100 text-rose-700';
      default: return 'bg-slate-100 text-slate-700';
    }
  }

  async function fetchHistoryLogs(page = 1) {
    const loading = document.getElementById('historyLoading');
    const list = document.getElementById('historyList');
    const empty = document.getElementById('historyEmpty');
    const pagination = document.getElementById('historyPagination');

    loading.classList.remove('hidden');
    list.classList.add('hidden');
    empty.classList.add('hidden');
    pagination.classList.add('hidden');
    list.innerHTML = '';

    try {
      const res = await fetch(`/admin/api/log-history?page=${page}&limit=10`);
      const responseData = await res.json();
      
      const data = responseData.data || [];
      const totalPages = responseData.totalPages || 1;
      currentHistoryPage = responseData.currentPage || 1;

      loading.classList.add('hidden');

      if (data && data.length > 0) {
        list.classList.remove('hidden');
        pagination.classList.remove('hidden');
        
        document.getElementById('historyPageInfo').textContent = `Halaman ${currentHistoryPage} dari ${totalPages}`;
        
        const prevBtn = document.getElementById('historyPrevBtn');
        const nextBtn = document.getElementById('historyNextBtn');
        
        prevBtn.disabled = currentHistoryPage <= 1;
        nextBtn.disabled = currentHistoryPage >= totalPages;
        
        prevBtn.onclick = () => fetchHistoryLogs(currentHistoryPage - 1);
        nextBtn.onclick = () => fetchHistoryLogs(currentHistoryPage + 1);

        data.forEach(log => {
          const userName = log.user ? log.user.nama_lengkap : 'Sistem / Unknown';
          const aksiBadge = `<span class="px-2 py-0.5 rounded text-[10px] font-bold tracking-wide uppercase ${getAksiStyle(log.aksi)}">${log.aksi}</span>`;
          
          let icon = 'bi-circle';
          if (log.aksi === 'INPUT') icon = 'bi-plus-circle text-emerald-500';
          if (log.aksi === 'EDIT') icon = 'bi-pencil-square text-blue-500';
          if (log.aksi === 'HAPUS') icon = 'bi-trash text-rose-500';

          const keteranganFormatted = (log.keterangan || '').replace(/\n/g, '<br>');

          const li = document.createElement('li');
          li.className = 'p-4 hover:bg-slate-50 transition flex gap-4 group';
          
          let deleteBtnHTML = '';
          const isSuperAdmin = window.IS_SUPER_ADMIN;
          
          if (isSuperAdmin) {
            deleteBtnHTML = `
              <button onclick="deleteHistoryLog(${log.id})" class="opacity-0 group-hover:opacity-100 transition text-rose-500 hover:bg-rose-50 p-1.5 rounded-lg" title="Hapus Riwayat">
                <i class="bi bi-trash3-fill"></i>
              </button>
            `;
          }

          li.innerHTML = `
            <div class="mt-1">
              <i class="bi ${icon} text-lg"></i>
            </div>
            <div class="flex-1">
              <div class="flex items-center justify-between gap-2 mb-1">
                <div class="flex items-center gap-2">
                  <span class="font-bold text-sm text-slate-700">${userName}</span>
                  ${aksiBadge}
                  <span class="text-xs font-semibold text-slate-500 border border-slate-200 px-1.5 py-0.5 rounded">${log.modul}</span>
                </div>
                <div class="flex items-center gap-2">
                  <span class="text-xs text-slate-400 font-medium whitespace-nowrap">${formatTimeAgo(log.createdAt)}</span>
                  ${deleteBtnHTML}
                </div>
              </div>
              <p class="text-sm text-slate-600 leading-relaxed">${keteranganFormatted}</p>
            </div>
          `;
          list.appendChild(li);
        });
      } else {
        empty.classList.remove('hidden');
      }
    } catch (error) {
      console.error('Failed to fetch history logs', error);
      loading.classList.add('hidden');
      empty.classList.remove('hidden');
      empty.querySelector('h4').textContent = 'Gagal memuat data';
      empty.querySelector('p').textContent = 'Terjadi kesalahan jaringan atau server.';
    }
  }

  async function deleteHistoryLog(id) {
    if (!confirm('Apakah Anda yakin ingin menghapus riwayat aktivitas ini?')) return;
    
    try {
      const res = await fetch(`/admin/api/log-history/${id}`, {
        method: 'DELETE'
      });
      const data = await res.json();
      
      if (data.success) {
        // Refresh list
        fetchHistoryLogs(currentHistoryPage);
      } else {
        alert(data.message || 'Gagal menghapus riwayat');
      }
    } catch (error) {
      console.error('Error deleting log:', error);
      alert('Terjadi kesalahan saat menghubungi server');
    }
  }
