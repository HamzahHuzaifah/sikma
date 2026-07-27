function toggleKwitansiPreview(btn, url, colspan) {
    const tr = btn.closest('tr');
    let nextTr = tr.nextElementSibling;
    
    if (nextTr && nextTr.classList.contains('kwitansi-preview-row')) {
        // Toggle visibility
        if (nextTr.style.display === 'none') {
            nextTr.style.display = 'table-row';
        } else {
            nextTr.style.display = 'none';
        }
    } else {
        // Create new row
        const newTr = document.createElement('tr');
        newTr.className = 'kwitansi-preview-row';
        
        const td = document.createElement('td');
        td.colSpan = colspan || 10;
        td.className = 'p-0 bg-slate-50 border-b border-gray-200 shadow-inner';
        
        // Wrapper for iframe
        const wrapper = document.createElement('div');
        wrapper.className = 'p-4 flex flex-col items-center justify-center relative w-full';
        
        // Close button inside the wrapper
        const closeBtn = document.createElement('button');
        closeBtn.innerHTML = '<i class="bi bi-x-circle-fill"></i> Tutup Preview';
        closeBtn.className = 'absolute top-2 right-4 text-rose-500 hover:text-rose-700 bg-white rounded-full px-3 py-1 shadow-md text-sm font-semibold transition z-10';
        closeBtn.onclick = () => { newTr.style.display = 'none'; };
        
        const iframe = document.createElement('iframe');
        iframe.src = url;
        iframe.className = 'w-full rounded-xl border border-gray-300 shadow-lg bg-white overflow-hidden';
        iframe.style.height = '700px';
        
        wrapper.appendChild(closeBtn);
        wrapper.appendChild(iframe);
        td.appendChild(wrapper);
        newTr.appendChild(td);
        
        tr.parentNode.insertBefore(newTr, nextTr);
    }
}
