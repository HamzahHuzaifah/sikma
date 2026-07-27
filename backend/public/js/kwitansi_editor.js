let isEditing = false;
let currentMarginTop = window.KwitansiConfig.marginTop;
let currentMarginLeft = window.KwitansiConfig.marginLeft;
let isTtdVisible = window.KwitansiConfig.ttdVisible;
let currentTtdWidth = window.KwitansiConfig.ttdWidth;
let currentTtdX = window.KwitansiConfig.ttdX;
let currentTtdY = window.KwitansiConfig.ttdY;

function moveRowUp(btn) {
    const tr = btn.closest('tr');
    const tbody = tr.parentNode;
    const rows = Array.from(tbody.querySelectorAll('tr[data-row-id]'));
    rows.sort((a, b) => parseInt(a.style.order) - parseInt(b.style.order));
    const idx = rows.indexOf(tr);
    if (idx > 0) {
        const prev = rows[idx - 1];
        const tempOrder = tr.style.order;
        tr.style.order = prev.style.order;
        prev.style.order = tempOrder;
    }
}

function moveRowDown(btn) {
    const tr = btn.closest('tr');
    const tbody = tr.parentNode;
    const rows = Array.from(tbody.querySelectorAll('tr[data-row-id]'));
    rows.sort((a, b) => parseInt(a.style.order) - parseInt(b.style.order));
    const idx = rows.indexOf(tr);
    if (idx < rows.length - 1) {
        const next = rows[idx + 1];
        const tempOrder = tr.style.order;
        tr.style.order = next.style.order;
        next.style.order = tempOrder;
    }
}

function moveTtd(btn, dx, dy) {
    currentTtdX += dx;
    currentTtdY += dy;
    document.querySelectorAll('.ttd-image').forEach(img => {
        img.style.transform = `translate(calc(-50% + ${currentTtdX}px), calc(-50% + ${currentTtdY}px))`;
    });
}

function moveLayout(xPx, yPx) {
    const cmX = xPx / 37.8;
    const cmY = yPx / 37.8;
    currentMarginLeft += cmX;
    currentMarginTop += cmY;
    const overlay = document.getElementById('contentOverlay');
    overlay.style.paddingLeft = currentMarginLeft.toFixed(2) + 'cm';
    overlay.style.paddingRight = currentMarginLeft.toFixed(2) + 'cm';
    overlay.style.paddingTop = currentMarginTop.toFixed(2) + 'cm';
}

function resizeTtd(btn, changePx) {
    currentTtdWidth += changePx;
    if (currentTtdWidth < 50) currentTtdWidth = 50;
    const img = btn.closest('.ttd-container').querySelector('.ttd-image');
    if (img) img.style.width = currentTtdWidth + 'px';
}

function deleteTtd(btn) {
    isTtdVisible = false;
    document.querySelectorAll('.ttd-image').forEach(i => i.style.display = 'none');
}

function toggleEdit() {
    const btnEdit = document.getElementById('btnEdit');
    const btnPrint = document.getElementById('btnPrint');
    const layoutControls = document.getElementById('layoutControls');
    const editableFields = document.querySelectorAll('.editable-field');
    const ttdControls = document.querySelectorAll('.ttd-controls');
    
    if (!isEditing) {
        isEditing = true;
        document.body.classList.add('editable-mode');
        editableFields.forEach(el => el.contentEditable = "true");
        document.querySelectorAll('.reorder-controls').forEach(el => el.style.display = "table-cell");
        ttdControls.forEach(el => el.style.display = "block");
        layoutControls.style.display = "flex";
        
        btnEdit.innerHTML = '<i class="fas fa-save"></i> Simpan Perubahan';
        btnEdit.style.backgroundColor = '#2563eb';
        btnPrint.style.display = 'none';
    } else {
        const payload = {};
        const getField = (name) => {
            const el = document.querySelector(`.editable-field[data-field="${name}"]`);
            return el ? el.innerText.trim() : undefined;
        };

        payload.docTitle = getField('docTitle');
        payload.dibayarkanKepadaSign = getField('dibayarkanKepadaSign');
        payload.diterimaDariPembayaran = getField('diterimaDariPembayaran');
        payload.namaPemberi = getField('namaPemberi');
        
        payload.layoutMarginTop = currentMarginTop.toFixed(2) + 'cm';
        payload.layoutMarginLeft = currentMarginLeft.toFixed(2) + 'cm';
        payload.ttdVisible = isTtdVisible;
        payload.ttdWidth = currentTtdWidth + 'px';
        payload.ttdX = currentTtdX;
        payload.ttdY = currentTtdY;
        
        const tbody = document.getElementById('kwitansiTbody');
        const rows = Array.from(tbody.querySelectorAll('tr[data-row-id]'));
        rows.sort((a, b) => parseInt(a.style.order) - parseInt(b.style.order));
        payload.rowOrder = JSON.stringify(rows.map(tr => tr.getAttribute('data-row-id')));

        btnEdit.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Menyimpan...';
        
        fetch(window.KwitansiConfig.saveUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        })
        .then(res => res.json())
        .then(data => {
            if (data.success) {
                Swal.fire({ icon: 'success', title: 'Berhasil', text: data.message, confirmButtonText: 'OK' })
                .then(() => window.location.reload());
            } else {
                Swal.fire({ icon: 'error', title: 'Gagal', text: data.message || 'Gagal menyimpan', confirmButtonText: 'OK' })
                .then(() => resetEditMode());
            }
        })
        .catch(err => {
            Swal.fire({ icon: 'error', title: 'Error', text: 'Terjadi kesalahan jaringan', confirmButtonText: 'OK' })
            .then(() => resetEditMode());
        });
    }
}

function resetEditMode() {
    isEditing = false;
    document.body.classList.remove('editable-mode');
    document.querySelectorAll('.editable-field').forEach(el => el.contentEditable = "false");
    document.querySelectorAll('.reorder-controls').forEach(el => el.style.display = "none");
    document.querySelectorAll('.ttd-controls').forEach(el => el.style.display = "none");
    document.getElementById('layoutControls').style.display = "none";
    const btnEdit = document.getElementById('btnEdit');
    const btnPrint = document.getElementById('btnPrint');
    btnEdit.innerHTML = '<i class="fas fa-edit"></i> Edit Data';
    btnEdit.style.backgroundColor = '#f59e0b';
    btnPrint.style.display = 'inline-block';
}

if (window.self !== window.top || new URLSearchParams(window.location.search).has('preview')) {
    const btnBack = document.querySelector('.btn-back');
    if (btnBack) btnBack.style.display = 'none';
}
