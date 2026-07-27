(function() {
    const colors = [
        '#e11d48', // Rose
        '#2563eb', // Blue
        '#059669', // Emerald
        '#d97706', // Amber
        '#7c3aed', // Violet
        '#db2777', // Pink
        '#0891b2', // Cyan
        '#ea580c'  // Orange
    ];

    function getHashColor(str) {
        let hash = 0;
        for (let i = 0; i < str.length; i++) {
            hash = str.charCodeAt(i) + ((hash << 5) - hash);
        }
        const index = Math.abs(hash) % colors.length;
        return colors[index];
    }

    function updateOnlineUsers(users) {
        const listContainer = document.getElementById('onlineUsersList');
        const wrapper = document.getElementById('onlineUsersWrapper');
        if (!listContainer || !wrapper) return;
        
        listContainer.innerHTML = '';
        
        if (users && users.length > 0) {
            users.forEach(u => {
                const initial = u.nama ? u.nama.charAt(0).toUpperCase() : (u.username ? u.username.charAt(0).toUpperCase() : 'A');
                const color = getHashColor(u.username || 'admin');
                
                const avatarDiv = document.createElement('div');
                avatarDiv.className = 'w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold ring-2 ring-white cursor-pointer transition hover:-translate-y-1';
                avatarDiv.style.backgroundColor = color;
                avatarDiv.title = u.nama || u.username;
                avatarDiv.textContent = initial;
                listContainer.appendChild(avatarDiv);
            });
            wrapper.style.display = 'flex';
        } else {
            wrapper.style.display = 'none';
        }
    }

    function sendHeartbeat() {
        fetch('/admin/api/admin/heartbeat', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            }
        })
        .then(res => res.json())
        .then(data => {
            if (data.success && data.onlineUsers) {
                updateOnlineUsers(data.onlineUsers);
            }
        })
        .catch(err => {
            console.error('Error sending presence heartbeat:', err);
        });
    }

    // Kirim detak jantung pertama saat DOM siap
    document.addEventListener('DOMContentLoaded', () => {
        sendHeartbeat();
        // Kirim setiap 10 detik
        setInterval(sendHeartbeat, 10000);
    });
})();
