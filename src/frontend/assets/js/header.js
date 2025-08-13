// Header Component JavaScript
// src/frontend/assets/js/header.js

// Header yüklendikten sonra çalışacak kodlar
function initializeHeader() {
    console.log('Header initializing...');
    
    // Auth kontrolünü burada yapma - sayfaların kendi kontrolüne bırak
    // Load user info
    loadUserInfo();
}

function loadUserInfo() {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    
    if (user) {
        // Update user display
        const fullName = user.FullName || user.fullname || 'Kullanıcı';
        const firstName = user.FirstName || user.firstName || fullName.split(' ')[0] || 'U';
        
        $('#navUserName').text(firstName);
        $('#dropdownUserInfo').text(fullName);
        
        // Create user initials
        const initials = getInitials(fullName);
        $('#userInitials').text(initials);
    }
    
    // Set active navigation item based on current page
    setActiveNavItem();
    
    // Bind logout event
    $('#navLogout').on('click', function(e) {
        e.preventDefault();
        handleLogout();
    });
    
    // Bind other navigation events
    bindNavigationEvents();
}

function getInitials(fullName) {
    const names = fullName.split(' ');
    if (names.length >= 2) {
        return (names[0][0] + names[1][0]).toUpperCase();
    } else {
        return names[0].substring(0, 2).toUpperCase();
    }
}

function setActiveNavItem() {
    const currentPage = window.location.pathname.split('/').pop();
    
    // Remove all active classes
    $('.navbar-nav .nav-link').removeClass('active');
    
    // Add active class based on current page
    switch(currentPage) {
        case 'dashboard.html':
            $('#navDashboard').addClass('active');
            break;
        case 'aractakip.html':
            $('#navAracTakip').addClass('active');
            break;
        // Add more cases as you create more pages
    }
}

function bindNavigationEvents() {
    // Araç Takip Sistemi linki
    $('#navAracTakip').on('click', function(e) {
        if ($(this).attr('href') === '#') {
            e.preventDefault();
            window.location.href = 'aractakip.html';
        }
    });
    
    // Raporlar linki
    $('#navReports').on('click', function(e) {
        e.preventDefault();
        showAlert('Raporlar sayfası henüz hazırlanmadı.', 'info');
    });
    
    // Diğer navigation linklerini güncelle
    $('#navProfile, #navSettings, #navHelp').on('click', function(e) {
        e.preventDefault();
        showAlert('Bu özellik henüz hazırlanmadı.', 'info');
    });
}

function handleLogout() {
    if (confirm('Çıkış yapmak istediğinizden emin misiniz?')) {
        authService.logout();
    }
}

function updateNotificationCount(count) {
    const badge = $('#notificationBadge');
    if (count > 0) {
        badge.text(count).removeClass('d-none');
    } else {
        badge.addClass('d-none');
    }
}

// Header load function for manual loading
function loadHeaderComponent() {
    return new Promise((resolve, reject) => {
        $('#headerContainer').load('../components/header.html', function(response, status, xhr) {
            if (status == "error") {
                console.error("Header yüklenirken hata:", xhr.status, xhr.statusText);
                reject(xhr);
            } else {
                // Header yüklendikten sonra initialize et
                setTimeout(() => {
                    initializeHeader();
                    resolve();
                }, 100);
            }
        });
    });
}