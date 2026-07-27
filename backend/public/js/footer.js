document.addEventListener("DOMContentLoaded", () => {
  const path = window.location.pathname;
  const defaultClass = "flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-50 transition";
  const activeClass = "flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-bold text-brand-600 bg-brand-50 transition";

  // Reset all links
  document.querySelectorAll('aside nav a').forEach(link => {
    link.className = defaultClass;
  });

  let activeId = null;
  if (path === '/') {
    activeId = 'nav-dashboard';
  } else if (path.startsWith('/transaksi')) {
    activeId = 'nav-transaksi';
  } else if (path.startsWith('/laporan')) {
    activeId = 'nav-laporan';
  } else if (path.startsWith('/tabungan')) {
    activeId = 'nav-tabungan';
  } else if (path.startsWith('/infak')) {
    activeId = 'nav-infak';
  } else if (path.startsWith('/import')) {
    activeId = 'nav-import';
  } else if (path.startsWith('/lembaga/')) {
    const slug = path.split('/')[2];
    activeId = `nav-lembaga-${slug.toLowerCase()}`;
  }

  if (activeId) {
    const activeEl = document.getElementById(activeId);
    if (activeEl) {
      activeEl.className = activeClass;
    }
  }

  // Highlight sub-menu links pencocokan path eksak
  document.querySelectorAll('aside div div a').forEach(subLink => {
    if (subLink.getAttribute('href') === path) {
      subLink.classList.remove('text-slate-500');
      subLink.classList.add('text-brand-600', 'bg-brand-50/50');
    }
  });
});

// Global Page Loader handling removed for faster perceived navigation

// ----------------------------------------------------
// 2. Flatpickr & Select2 Custom Integration
// ----------------------------------------------------
$(document).ready(function() {
    initGlobalFlatpickr();
});

function initGlobalFlatpickr() {
    if (typeof flatpickr !== 'undefined') {
        flatpickr("input[type='date']", {
            locale: "id",
            dateFormat: "Y-m-d",
            altInput: true,
            altFormat: "d/m/Y",
            allowInput: true,
            disableMobile: true, // Memaksa popup HTML/CSS kustom di HP alih-alih UI kalender bawaan HP/Chrome
            monthSelectorType: "dropdown", // Menggunakan dropdown agar pengguna bebas memilih bulan secara langsung
            onReady: function(selectedDates, dateStr, instance) {
                initMonthSelect2(instance);
                initYearSelect2(instance);
            },
            onOpen: function(selectedDates, dateStr, instance) {
                initMonthSelect2(instance);
                initYearSelect2(instance);
            },
            onMonthChange: function(selectedDates, dateStr, instance) {
                setTimeout(() => {
                    initMonthSelect2(instance);
                    initYearSelect2(instance);
                }, 10);
            },
            onYearChange: function(selectedDates, dateStr, instance) {
                setTimeout(() => {
                    initMonthSelect2(instance);
                    initYearSelect2(instance);
                }, 10);
            }
        });
    }
}

function initMonthSelect2(instance) {
    console.log("initMonthSelect2 called");
    try {
        const $select = $(instance.calendarContainer).find('.flatpickr-monthDropdown-months');
        console.log("Month select found:", $select.length);
        if ($select.length && !$select.hasClass('select2-hidden-accessible')) {
            console.log("Initializing Select2 on month select");
            $select.select2({
                minimumResultsForSearch: Infinity,
                containerCssClass: 'select2-flatpickr-month', // Diberikan class khusus untuk styling lebar di CSS
                dropdownParent: $(instance.calendarContainer) // Menempelkan dropdown di dalam kalender agar tidak meluber keluar layar HP
            }).on('change', function() {
                // Memicu event native change agar Flatpickr mendeteksi perubahan bulan
                const event = document.createEvent('HTMLEvents');
                event.initEvent('change', true, false);
                this.dispatchEvent(event);
            });

            // Sesuaikan gaya visual teks dropdown pemicu
            $select.next('.select2-container').find('.select2-selection__rendered').css({
                'font-weight': '700',
                'color': '#1e293b',
                'font-size': '14px'
            });
            console.log("Select2 month initialized successfully");
        }
    } catch (err) {
        console.error("Error in initMonthSelect2:", err);
    }
}

function initYearSelect2(instance) {
    console.log("initYearSelect2 called");
    try {
        const $yearWrapper = $(instance.calendarContainer).find('.numInputWrapper');
        console.log("Year wrapper found:", $yearWrapper.length);
        if ($yearWrapper.length) {
            let $yearSelect = $(instance.calendarContainer).find('.flatpickr-yearDropdown-years');
            console.log("Existing year select found:", $yearSelect.length);
            
            // Jika dropdown tahun kustom belum dibuat
            if (!$yearSelect.length) {
                console.log("Creating custom year select");
                $yearSelect = $('<select class="flatpickr-yearDropdown-years"></select>');
                
                // Isi tahun dari currentYear - 10 s/d currentYear + 10
                const currentYear = new Date().getFullYear();
                const startYear = currentYear - 10;
                const endYear = currentYear + 10;
                
                for (let y = startYear; y <= endYear; y++) {
                    $yearSelect.append(`<option value="${y}">${y}</option>`);
                }
                
                // Samakan nilai awal tahun
                $yearSelect.val(instance.currentYear);
                
                // Masukkan dropdown setelah year wrapper, lalu sembunyikan input angka bawaan Flatpickr
                $yearWrapper.after($yearSelect);
                $yearWrapper.hide();
                
                // Inisialisasi Select2 pada dropdown tahun kustom
                console.log("Initializing Select2 on year select");
                $yearSelect.select2({
                    tags: true, // Memungkinkan pengetikan tahun kustom secara manual
                    createTag: function(params) {
                        const term = $.trim(params.term);
                        // Hanya izinkan input angka 3 atau 4 digit sebagai tahun valid (misal: 1998, 2050, atau 999)
                        if (term === '' || !/^\d{3,4}$/.test(term)) {
                            return null;
                        }
                        return {
                            id: term,
                            text: term,
                            newTag: true
                        };
                    },
                    dropdownParent: $(instance.calendarContainer)
                }).on('change', function() {
                    const selectedYear = parseInt($(this).val());
                    if (selectedYear && selectedYear !== instance.currentYear) {
                        instance.changeYear(selectedYear);
                    }
                });

                // Sesuaikan gaya visual teks dropdown pemicu tahun
                $yearSelect.next('.select2-container').find('.select2-selection__rendered').css({
                    'font-weight': '700',
                    'color': '#1e293b',
                    'font-size': '14px'
                });
                console.log("Select2 year initialized successfully");
            } else {
                // Sinkronkan nilai tahun jika terjadi perubahan dari navigasi tombol
                if (parseInt($yearSelect.val()) !== instance.currentYear) {
                    $yearSelect.val(instance.currentYear).trigger('change.select2');
                }
            }
        }
    } catch (err) {
        console.error("Error in initYearSelect2:", err);
    }
}
