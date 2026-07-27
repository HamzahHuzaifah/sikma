// ----------------------------------------------------
// 0. Toast Notifications for Success / Error
// ----------------------------------------------------
function showToast(message, type = 'success') {
  let container = document.getElementById('toast-container');
  if (!container) {
    container = document.createElement('div');
    container.id = 'toast-container';
    container.className = 'fixed top-4 right-4 z-[10000] flex flex-col gap-3 pointer-events-none no-print';
    document.body.appendChild(container);
  }

  const toast = document.createElement('div');
  const isSuccess = type === 'success';
  
  const bgColor = isSuccess ? 'bg-emerald-50 border-emerald-100 text-emerald-600' : 'bg-rose-50 border-rose-100 text-rose-600';
  const icon = isSuccess ? 'bi-check-circle-fill' : 'bi-exclamation-triangle-fill';
  
  toast.className = `flex items-center gap-3 p-4 rounded-xl shadow-lg border ${bgColor} font-semibold text-sm transform transition-all duration-300 translate-x-full opacity-0 pointer-events-auto min-w-[300px] max-w-md`;
  
  toast.innerHTML = `
    <i class="bi ${icon} text-lg"></i>
    <span class="flex-1">${message}</span>
    <button class="text-current opacity-50 hover:opacity-100 transition-opacity ml-2">
      <i class="bi bi-x-lg text-xs"></i>
    </button>
  `;
  
  container.appendChild(toast);
  
  const closeBtn = toast.querySelector('button');
  closeBtn.onclick = () => {
    toast.classList.add('translate-x-full', 'opacity-0');
    setTimeout(() => toast.remove(), 300);
  };
  
  requestAnimationFrame(() => {
    toast.classList.remove('translate-x-full', 'opacity-0');
  });
  
  setTimeout(() => {
    if (toast.parentElement) {
      toast.classList.add('translate-x-full', 'opacity-0');
      setTimeout(() => toast.remove(), 300);
    }
  }, 4000);
}

document.addEventListener('DOMContentLoaded', () => {
  const params = new URLSearchParams(window.location.search);
  const successMsg = params.get('success');
  const errorMsg = params.get('error');
  
  if (successMsg) showToast(successMsg, 'success');
  if (errorMsg) showToast(errorMsg, 'error');
  
  if (successMsg || errorMsg) {
    params.delete('success');
    params.delete('error');
    const newUrl = window.location.pathname + (params.toString() ? '?' + params.toString() : '');
    window.history.replaceState({}, '', newUrl);
  }
});

// ----------------------------------------------------
// 1. Custom Alert & Confirm Modals
// ----------------------------------------------------
function showCustomConfirm(message, onConfirm) {
  const modal = document.getElementById('custom-confirm-modal');
  const content = document.getElementById('custom-confirm-content');
  const msgEl = document.getElementById('custom-confirm-message');
  const okBtn = document.getElementById('custom-confirm-ok');
  const cancelBtn = document.getElementById('custom-confirm-cancel');
  
  if (!modal || !content || !msgEl || !okBtn || !cancelBtn) return;
  
  msgEl.textContent = message;
  
  // Reset buttons and focus
  okBtn.focus();
  
  // Open modal animation
  modal.classList.remove('hidden');
  // force reflow
  modal.offsetHeight;
  modal.classList.remove('opacity-0');
  content.classList.remove('scale-95');
  content.classList.add('scale-100');
  
  const close = () => {
    modal.classList.add('opacity-0');
    content.classList.remove('scale-100');
    content.classList.add('scale-95');
    setTimeout(() => {
      modal.classList.add('hidden');
    }, 200);
  };
  
  okBtn.onclick = () => {
    close();
    if (onConfirm) onConfirm();
  };
  
  cancelBtn.onclick = close;
  modal.onclick = (e) => {
    if (e.target === modal) close();
  };
}

function showCustomAlert(message, title = 'Pemberitahuan') {
  const modal = document.getElementById('custom-alert-modal');
  const content = document.getElementById('custom-alert-content');
  const msgEl = document.getElementById('custom-alert-message');
  const titleEl = document.getElementById('custom-alert-title');
  const okBtn = document.getElementById('custom-alert-ok');
  
  if (!modal || !content || !msgEl || !titleEl || !okBtn) return;
  
  msgEl.textContent = message;
  titleEl.textContent = title;
  
  // Open modal animation
  modal.classList.remove('hidden');
  // force reflow
  modal.offsetHeight;
  modal.classList.remove('opacity-0');
  content.classList.remove('scale-95');
  content.classList.add('scale-100');
  
  const close = () => {
    modal.classList.add('opacity-0');
    content.classList.remove('scale-100');
    content.classList.add('scale-95');
    setTimeout(() => {
      modal.classList.add('hidden');
    }, 200);
  };
  
  okBtn.onclick = close;
  modal.onclick = (e) => {
    if (e.target === modal) close();
  };
}

// Override standard window.alert
window.alert = function(message) {
  showCustomAlert(message);
};

// Intercept form submissions that have confirm dialogs in onsubmit
document.addEventListener('DOMContentLoaded', () => {
  // Intercept form with native onsubmit confirm
  document.querySelectorAll('form[onsubmit*="confirm"]').forEach(form => {
    const onsubmitAttr = form.getAttribute('onsubmit');
    let message = 'Apakah Anda yakin ingin melakukan tindakan ini?';
    const match = onsubmitAttr.match(/confirm\(['"](.+?)['"]\)/);
    if (match && match[1]) {
      message = match[1];
    }
    
    // Remove inline attribute to bypass native dialog
    form.removeAttribute('onsubmit');
    
    // Add modern confirm listener
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      showCustomConfirm(message, () => {
        // Temporarily attach dynamic indicator to bypass checks if any
        form.submit();
      });
    });
  });
});

// ----------------------------------------------------
// 2. Custom select dropdown using Tailwind CSS
// ----------------------------------------------------
class TailwindSelect {
  constructor(selectElement) {
    this.select = selectElement;
    if (this.select.dataset.tailwindSelectInitialized) return;
    this.select.dataset.tailwindSelectInitialized = 'true';
    this.select.tailwindSelect = this;
    
    // Hide original select but keep it focusable for HTML5 validation
    // Using display: none breaks form submission if the select is required but empty.
    this.select.style.position = 'absolute';
    this.select.style.opacity = '0';
    this.select.style.width = '1px';
    this.select.style.height = '1px';
    this.select.style.zIndex = '-1';
    this.select.style.pointerEvents = 'none';
    
    // Create wrapper
    this.wrapper = document.createElement('div');
    this.wrapper.className = 'relative w-full';
    this.select.parentNode.insertBefore(this.wrapper, this.select);
    this.wrapper.appendChild(this.select);
    
    // Create trigger button
    this.button = document.createElement('button');
    this.button.type = 'button';
    
    // Copy some classes from original select or use default style matching SIKMA
    this.button.className = 'w-full flex items-center justify-between bg-white border border-slate-200 rounded-xl px-4 py-2.5 text-sm shadow-sm focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 outline-none transition duration-150 cursor-pointer disabled:bg-slate-50 disabled:text-slate-400 disabled:cursor-not-allowed';
    
    this.buttonText = document.createElement('span');
    this.buttonText.className = 'truncate';
    this.button.appendChild(this.buttonText);
    
    this.chevron = document.createElement('i');
    this.chevron.className = 'bi bi-chevron-down text-xs text-slate-400 ml-2 transition-transform duration-200';
    this.button.appendChild(this.chevron);
    
    this.wrapper.appendChild(this.button);
    
    // Create menu dropdown container
    this.menuContainer = document.createElement('div');
    this.menuContainer.className = 'hidden absolute left-0 right-0 mt-1 bg-white border border-slate-200 rounded-xl shadow-lg z-[999] transition duration-150 flex flex-col overflow-hidden';
    this.wrapper.appendChild(this.menuContainer);
    
    // Create search wrapper
    this.searchWrapper = document.createElement('div');
    this.searchWrapper.className = 'p-2 border-b border-slate-100 bg-slate-50/50';
    this.searchInput = document.createElement('input');
    this.searchInput.type = 'text';
    this.searchInput.placeholder = 'Ketik untuk mencari...';
    this.searchInput.className = 'w-full px-3 py-1.5 text-sm border border-slate-200 rounded-lg focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-all bg-white';
    this.searchInput.addEventListener('click', (e) => e.stopPropagation());
    this.searchInput.addEventListener('input', (e) => this.filterOptions(e.target.value));
    
    this.searchWrapper.appendChild(this.searchInput);
    this.menuContainer.appendChild(this.searchWrapper);

    // Create menu dropdown items container
    this.menu = document.createElement('div');
    this.menu.className = 'max-h-60 overflow-y-auto py-1';
    this.menuContainer.appendChild(this.menu);
    
    // Bind events
    this.button.addEventListener('click', (e) => {
      e.stopPropagation();
      if (this.select.disabled) return;
      this.toggleMenu();
    });
    
    document.addEventListener('click', (e) => {
      if (!this.wrapper.contains(e.target)) {
        this.closeMenu();
      }
    });
    
    // Initial sync
    this.syncOptions();
    this.syncValue();
    this.syncDisabled();
    
    // Observe mutation changes on options
    this.observer = new MutationObserver(() => {
      this.syncOptions();
      this.syncValue();
      this.syncDisabled();
    });
    this.observer.observe(this.select, { childList: true, attributes: true, attributeFilter: ['disabled'] });
    
    // Hook value property setter on original select to auto update our custom UI
    const self = this;
    const valueDescriptor = Object.getOwnPropertyDescriptor(HTMLSelectElement.prototype, 'value');
    if (valueDescriptor) {
      Object.defineProperty(this.select, 'value', {
        get: function() {
          return valueDescriptor.get.call(this);
        },
        set: function(val) {
          valueDescriptor.set.call(this, val);
          self.syncValue();
        }
      });
    }
    
    const disabledDescriptor = Object.getOwnPropertyDescriptor(HTMLSelectElement.prototype, 'disabled');
    if (disabledDescriptor) {
      Object.defineProperty(this.select, 'disabled', {
        get: function() {
          return disabledDescriptor.get.call(this);
        },
        set: function(val) {
          disabledDescriptor.set.call(this, val);
          self.syncDisabled();
        }
      });
    }
    
    const indexDescriptor = Object.getOwnPropertyDescriptor(HTMLSelectElement.prototype, 'selectedIndex');
    if (indexDescriptor) {
      Object.defineProperty(this.select, 'selectedIndex', {
        get: function() {
          return indexDescriptor.get.call(this);
        },
        set: function(val) {
          indexDescriptor.set.call(this, val);
          self.syncValue();
        }
      });
    }
  }
  
  toggleMenu() {
    // Close other TailwindSelect menus
    document.querySelectorAll('[data-tailwind-select-initialized]').forEach(el => {
      if (el !== this.select && el.tailwindSelect) {
        el.tailwindSelect.closeMenu();
      }
    });
    
    const isHidden = this.menuContainer.classList.contains('hidden');
    if (isHidden) {
      this.openMenu();
    } else {
      this.closeMenu();
    }
  }
  
  openMenu() {
    this.menuContainer.classList.remove('hidden');
    this.chevron.classList.add('rotate-180');
    this.button.classList.add('border-indigo-500', 'ring-4', 'ring-indigo-500/10');
    
    this.searchInput.value = '';
    this.filterOptions('');
    
    // Tampilkan search box hanya jika opsi lebih dari 5
    if (this.select.options.length > 5) {
      this.searchWrapper.style.display = '';
      setTimeout(() => this.searchInput.focus(), 50);
    } else {
      this.searchWrapper.style.display = 'none';
    }
  }
  
  closeMenu() {
    this.menuContainer.classList.add('hidden');
    this.chevron.classList.remove('rotate-180');
    this.button.classList.remove('border-indigo-500', 'ring-4', 'ring-indigo-500/10');
  }

  filterOptions(query) {
    const q = query.toLowerCase();
    const items = Array.from(this.menu.children);
    
    if (items.length === 1 && items[0].tagName === 'DIV' && !items[0].classList.contains('no-results-msg')) return;
    
    let visibleCount = 0;
    
    items.forEach(item => {
      if (item.tagName !== 'BUTTON') return;
      
      const text = item.textContent.toLowerCase();
      if (text.includes(q)) {
        item.style.display = '';
        visibleCount++;
      } else {
        item.style.display = 'none';
      }
    });

    let noResults = this.menu.querySelector('.no-results-msg');
    if (visibleCount === 0 && items.length > 0) {
      if (!noResults) {
        noResults = document.createElement('div');
        noResults.className = 'no-results-msg px-4 py-2 text-sm text-slate-400 italic';
        noResults.textContent = 'Data tidak ditemukan';
        this.menu.appendChild(noResults);
      }
      noResults.style.display = '';
    } else if (noResults) {
      noResults.style.display = 'none';
    }
  }
  
  syncOptions() {
    this.menu.innerHTML = '';
    const options = Array.from(this.select.options);
    
    if (options.length === 0) {
      const emptyItem = document.createElement('div');
      emptyItem.className = 'px-4 py-2 text-sm text-slate-400 italic';
      emptyItem.textContent = 'Tidak ada pilihan';
      this.menu.appendChild(emptyItem);
      return;
    }
    
    options.forEach(opt => {
      const item = document.createElement('button');
      item.type = 'button';
      item.className = 'w-full text-left px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 transition-colors duration-150 flex items-center justify-between';
      
      if (opt.disabled) {
        item.className += ' opacity-50 cursor-not-allowed';
      }
      
      const textSpan = document.createElement('span');
      textSpan.textContent = opt.textContent;
      item.appendChild(textSpan);
      
      if (opt.selected && opt.value !== '') {
        const checkIcon = document.createElement('i');
        checkIcon.className = 'bi bi-check-lg text-indigo-600 font-bold';
        item.appendChild(checkIcon);
        item.className += ' font-semibold bg-indigo-50/50';
      }
      
      item.addEventListener('click', (e) => {
        e.stopPropagation();
        if (opt.disabled) return;
        
        this.select.value = opt.value;
        // Trigger change event
        this.select.dispatchEvent(new Event('change', { bubbles: true }));
        // Trigger inline onchange if any
        if (typeof this.select.onchange === 'function') {
          this.select.onchange();
        }
        
        this.syncValue();
        this.closeMenu();
      });
      
      this.menu.appendChild(item);
    });
  }
  
  syncValue() {
    const selectedOption = this.select.options[this.select.selectedIndex];
    if (selectedOption) {
      this.buttonText.textContent = selectedOption.textContent;
      if (selectedOption.value === '') {
        this.buttonText.className = 'truncate text-slate-400';
      } else {
        this.buttonText.className = 'truncate text-slate-700 font-medium';
      }
    } else {
      this.buttonText.textContent = '-- Pilih --';
      this.buttonText.className = 'truncate text-slate-400';
    }
    
    const items = Array.from(this.menu.children);
    const options = Array.from(this.select.options);
    
    items.forEach((item, index) => {
      const opt = options[index];
      if (!opt || item.tagName !== 'BUTTON') return;
      
      item.className = 'w-full text-left px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 transition-colors duration-150 flex items-center justify-between';
      if (opt.disabled) {
        item.className += ' opacity-50 cursor-not-allowed';
      }
      
      const checkIcon = item.querySelector('.bi-check-lg');
      if (checkIcon) checkIcon.remove();
      
      if (opt.selected && opt.value !== '') {
        const newCheck = document.createElement('i');
        newCheck.className = 'bi bi-check-lg text-indigo-600 font-bold';
        item.appendChild(newCheck);
        item.className += ' font-semibold bg-indigo-50/50';
      }
    });
  }
  
  syncDisabled() {
    this.button.disabled = this.select.disabled;
    if (this.select.disabled) {
      this.button.className = 'w-full flex items-center justify-between bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm shadow-sm text-slate-400 cursor-not-allowed';
    } else {
      this.button.className = 'w-full flex items-center justify-between bg-white border border-slate-200 rounded-xl px-4 py-2.5 text-sm shadow-sm focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 outline-none transition duration-150 cursor-pointer';
    }
  }
}

function initAllTailwindSelects() {
  document.querySelectorAll('select').forEach(select => {
    if (
      select.closest('th.filterable') || 
      select.dataset.tailwindSelectInitialized || 
      select.closest('.flatpickr-calendar') || 
      select.classList.contains('flatpickr-monthDropdown-months') ||
      select.classList.contains('flatpickr-yearDropdown-years')
    ) {
      return;
    }
    new TailwindSelect(select);
  });
}

document.addEventListener('DOMContentLoaded', () => {
  initAllTailwindSelects();
  
  const selectObserver = new MutationObserver((mutations) => {
    mutations.forEach(mutation => {
      mutation.addedNodes.forEach(node => {
        if (node.nodeType === Node.ELEMENT_NODE) {
          if (node.tagName === 'SELECT') {
            if (
              !node.closest('th.filterable') && 
              !node.closest('.flatpickr-calendar') && 
              !node.classList.contains('flatpickr-monthDropdown-months') &&
              !node.classList.contains('flatpickr-yearDropdown-years')
            ) {
              new TailwindSelect(node);
            }
          } else {
            node.querySelectorAll('select').forEach(sel => {
              if (
                !sel.closest('th.filterable') && 
                !sel.closest('.flatpickr-calendar') && 
                !sel.classList.contains('flatpickr-monthDropdown-months') &&
                !sel.classList.contains('flatpickr-yearDropdown-years')
              ) {
                new TailwindSelect(sel);
              }
            });
          }
        }
      });
    });
  });
  
  selectObserver.observe(document.body, { childList: true, subtree: true });
});
