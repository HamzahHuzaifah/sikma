document.addEventListener('DOMContentLoaded', () => {
  const filterableHeaders = document.querySelectorAll('th.filterable');
  if (filterableHeaders.length === 0) return;

  // Retrieve current URL search params
  const urlParams = new URLSearchParams(window.location.search);
  let activeDropdown = null;

  filterableHeaders.forEach(th => {
    th.style.position = 'relative'; // Ensure dropdown positions correctly
    const colName = th.getAttribute('data-column');
    const optionsRaw = th.getAttribute('data-options');
    const sortable = th.getAttribute('data-sortable') !== 'false';
    const options = optionsRaw ? optionsRaw.split(',') : [];

    // Check if currently filtered
    const currentFilter = urlParams.get(`filter_${colName}`);
    const currentSearch = urlParams.get(`search_${colName}`);
    const currentSort = urlParams.get(`sort_${colName}`);
    
    const isActive = currentFilter || currentSearch || currentSort;

    const icon = document.createElement('i');
    icon.className = `bi bi-filter cursor-pointer transition-colors ml-1 ${isActive ? 'text-indigo-600 font-bold' : 'text-slate-400 hover:text-indigo-600'}`;
    
    // Create dropdown container
    const dropdown = document.createElement('div');
    dropdown.className = 'absolute bg-white border border-slate-200 rounded-xl shadow-xl p-3 min-w-[200px] z-50 hidden font-normal normal-case tracking-normal text-slate-700 mt-1';
    
    // Sort A-Z
    let sortHtml = '';
    if (sortable) {
      sortHtml = `
        <div class="flex items-center gap-2 p-2 cursor-pointer rounded-lg hover:bg-slate-100 transition-colors filter-sort-btn ${currentSort === 'asc' ? 'text-indigo-600 font-bold bg-indigo-50' : ''}" data-sort="asc">
          <i class="bi bi-sort-alpha-down"></i> Urutkan A ke Z
        </div>
        <div class="flex items-center gap-2 p-2 cursor-pointer rounded-lg hover:bg-slate-100 transition-colors filter-sort-btn ${currentSort === 'desc' ? 'text-indigo-600 font-bold bg-indigo-50' : ''}" data-sort="desc">
          <i class="bi bi-sort-alpha-up"></i> Urutkan Z ke A
        </div>
        <hr class="my-2 border-slate-100">
      `;
    }

    // Search Input
    const searchHtml = `
      <input type="text" class="w-full border border-slate-200 rounded-lg px-2.5 py-1.5 my-2 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 text-xs" placeholder="Cari..." value="${currentSearch || ''}">
    `;

    // Checkboxes
    let optionsHtml = '';
    if (options.length > 0) {
      const selectedOpts = currentFilter ? currentFilter.split(',') : [];
      optionsHtml = `<div class="max-h-[150px] overflow-y-auto my-2">`;
      options.forEach(opt => {
        const isChecked = selectedOpts.includes(opt) ? 'checked' : '';
        optionsHtml += `
          <label class="flex items-center gap-2 py-1.5 cursor-pointer hover:bg-slate-50 px-1 rounded text-xs">
            <input type="checkbox" value="${opt}" class="filter-checkbox rounded text-indigo-600 focus:ring-indigo-500 border-slate-300" ${isChecked}>
            <span>${opt}</span>
          </label>
        `;
      });
      optionsHtml += `</div>`;
    }

    dropdown.innerHTML = `
      ${sortHtml}
      ${searchHtml}
      ${optionsHtml}
      <button class="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-lg py-2 mt-2 transition-colors text-center text-xs filter-apply-btn">Terapkan</button>
      <button class="w-full text-xs text-slate-400 mt-2 hover:text-slate-600 text-center transition-colors filter-clear-btn">Kosongkan Filter</button>
    `;

    // Append icon to the header
    const wrapper = document.createElement('div');
    wrapper.className = 'flex items-center gap-1';
    while (th.firstChild) {
      wrapper.appendChild(th.firstChild);
    }
    wrapper.appendChild(icon);
    th.appendChild(wrapper);
    th.appendChild(dropdown);

    // Event Listeners
    icon.addEventListener('click', (e) => {
      e.stopPropagation();
      if (activeDropdown && activeDropdown !== dropdown) {
        activeDropdown.classList.add('hidden');
      }
      dropdown.classList.toggle('hidden');
      activeDropdown = dropdown.classList.contains('hidden') ? null : dropdown;
      
      if (activeDropdown) {
        // Smart positioning: if header is on the right side, align dropdown to the right
        const rect = th.getBoundingClientRect();
        if (rect.left > window.innerWidth / 2) {
          dropdown.style.left = 'auto';
          dropdown.style.right = '0';
        } else {
          dropdown.style.left = '0';
          dropdown.style.right = 'auto';
        }
        dropdown.style.top = '100%';
      }
    });

    dropdown.addEventListener('click', (e) => {
      e.stopPropagation(); // Prevent closing when clicking inside
    });

    // Handle sort clicks
    const sortBtns = dropdown.querySelectorAll('.filter-sort-btn');
    sortBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        const isAlreadySelected = btn.classList.contains('text-indigo-600');
        sortBtns.forEach(b => b.className = 'flex items-center gap-2 p-2 cursor-pointer rounded-lg hover:bg-slate-100 transition-colors filter-sort-btn');
        if (!isAlreadySelected) {
          btn.className = 'flex items-center gap-2 p-2 cursor-pointer rounded-lg hover:bg-slate-100 transition-colors filter-sort-btn text-indigo-600 font-bold bg-indigo-50';
        }
      });
    });

    // Apply Button
    const applyBtn = dropdown.querySelector('.filter-apply-btn');
    applyBtn.addEventListener('click', () => {
      const selectedSortBtn = dropdown.querySelector('.filter-sort-btn.text-indigo-600');
      const sortVal = selectedSortBtn ? selectedSortBtn.getAttribute('data-sort') : null;
      const searchVal = dropdown.querySelector('input[type="text"]').value.trim();
      const checkboxes = dropdown.querySelectorAll('.filter-checkbox:checked');
      const filterVals = Array.from(checkboxes).map(cb => cb.value);

      if (sortVal) urlParams.set(`sort_${colName}`, sortVal);
      else urlParams.delete(`sort_${colName}`);

      if (searchVal) urlParams.set(`search_${colName}`, searchVal);
      else urlParams.delete(`search_${colName}`);

      if (filterVals.length > 0) urlParams.set(`filter_${colName}`, filterVals.join(','));
      else urlParams.delete(`filter_${colName}`);

      // Reset page to 1 when filtering
      urlParams.set('page', '1');

      window.location.search = urlParams.toString();
    });

    // Clear Button
    const clearBtn = dropdown.querySelector('.filter-clear-btn');
    clearBtn.addEventListener('click', () => {
      urlParams.delete(`sort_${colName}`);
      urlParams.delete(`search_${colName}`);
      urlParams.delete(`filter_${colName}`);
      urlParams.set('page', '1');
      window.location.search = urlParams.toString();
    });
  });

  // Close dropdown when clicking outside
  document.addEventListener('click', () => {
    if (activeDropdown) {
      activeDropdown.classList.add('hidden');
      activeDropdown = null;
    }
  });
});
