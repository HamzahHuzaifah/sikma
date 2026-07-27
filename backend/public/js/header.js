function toggleDropdown() {
  const menu = document.getElementById('dropdownMenu');
  if (menu) {
    menu.classList.toggle('hidden');
  }
}

// Close dropdown when clicking outside
window.addEventListener('click', function(e) {
  const dropdown = document.getElementById('profileDropdown');
  const menu = document.getElementById('dropdownMenu');
  if (dropdown && !dropdown.contains(e.target) && menu) {
    menu.classList.add('hidden');
  }
});
