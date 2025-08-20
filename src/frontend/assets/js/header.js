// src/frontend/assets/js/header.js
// Header Component JavaScript - UNIFIED HEADER İÇİN GÜNCELLENMİŞ

/**
 * Header yüklendikten sonra çalışacak ana fonksiyon
 */
function initializeHeader() {
    console.log('🚀 Header initializing...');
    
    // Config'den title'ı güncelle
    updateHeaderTitle();
    
    // User bilgilerini yükle
    loadUserInfo();
    
    // Active navigation'ı set et
    setActiveNavItem();
    
    // Sidebar'ı initialize et
    initializeSidebar();
    
    // Event listener'ları bind et
    bindNavigationEvents();
    
    console.log('✅ Header initialized successfully');
}

/**
 * Config'den header title'ını güncelle
 */
function updateHeaderTitle() {
    try {
        const config = window.APP_CONFIG;
        if (config && config.PORTAL_TITLE) {
            const headerTitle = document.getElementById('headerTitle');
            const sidebarTitle = document.getElementById('sidebarTitle');
            
            if (headerTitle) {
                headerTitle.textContent = config.PORTAL_TITLE;
            }
            if (sidebarTitle) {
                sidebarTitle.textContent = config.PORTAL_TITLE;
            }
            
            console.log('✅ Header title updated:', config.PORTAL_TITLE);
        }
    } catch (error) {
        console.warn('Header title update error:', error);
    }
}

/**
 * User bilgilerini localStorage'dan yükle ve göster
 */
function loadUserInfo() {
    try {
        const userStr = localStorage.getItem('user') || localStorage.getItem('vervo_user_data');
        if (userStr) {
            const user = JSON.parse(userStr);
            const fullName = user.fullName || user.fullname || user.name || 'Kullanıcı';
            const firstName = user.firstName || user.firstName || fullName.split(' ')[0] || 'U';
            
            // Update user display elements
            const navUserName = document.getElementById('navUserName');
            const dropdownUserInfo = document.getElementById('dropdownUserInfo');
            const userInitials = document.getElementById('userInitials');
            
            if (navUserName) {
                navUserName.textContent = firstName;
            }
            if (dropdownUserInfo) {
                dropdownUserInfo.textContent = fullName;
            }
            if (userInitials) {
                const initials = getInitials(fullName);
                userInitials.textContent = initials;
            }
            
            console.log('✅ User info updated for:', firstName);
        }
    } catch (error) {
        console.warn('User info load error:', error);
    }
}

/**
 * Full name'den initials oluştur
 */
function getInitials(fullName) {
    const names = fullName.split(' ');
    if (names.length >= 2) {
        return (names[0][0] + names[1][0]).toUpperCase();
    }
    return names[0].substring(0, 2).toUpperCase();
}

/**
 * Mevcut sayfaya göre active navigation item'ı set et
 */
function setActiveNavItem() {
    try {
        const currentPage = window.location.pathname.split('/').pop();
        
        // Remove all active classes
        document.querySelectorAll('.navbar-nav .nav-link').forEach(link => {
            link.classList.remove('active');
        });
        
        // Add active class based on current page
        switch(currentPage) {
            case 'dashboard.html':
                const dashboardLink = document.getElementById('navDashboard');
                if (dashboardLink) {
                    dashboardLink.classList.add('active');
                }
                break;
            case 'aractakip.html':
                const aracTakipLink = document.getElementById('navAracTakip');
                if (aracTakipLink) {
                    aracTakipLink.classList.add('active');
                }
                break;
            // Diğer sayfalar için case'ler buraya eklenebilir
        }
        
        console.log('✅ Active navigation set for:', currentPage);
    } catch (error) {
        console.warn('Active navigation set error:', error);
    }
}

/**
 * Mobile sidebar'ı initialize et
 */
function initializeSidebar() {
    try {
        const sidebarToggle = document.getElementById('sidebarToggle');
        const sidebar = document.getElementById('mobileSidebar');
        const overlay = document.getElementById('sidebarOverlay');
        const sidebarClose = document.getElementById('sidebarClose');
        
        if (!sidebarToggle || !sidebar || !overlay) {
            console.warn('Sidebar elements not found');
            return;
        }
        
        // Toggle sidebar function
        function toggleSidebar() {
            sidebar.classList.add('show');
            overlay.classList.add('show');
            document.body.style.overflow = 'hidden';
            console.log('✅ Sidebar opened');
        }
        
        // Close sidebar function
        function closeSidebar() {
            sidebar.classList.remove('show');
            overlay.classList.remove('show');
            document.body.style.overflow = '';
            console.log('✅ Sidebar closed');
        }
        
        // Event listeners
        sidebarToggle.addEventListener('click', function(e) {
            e.preventDefault();
            toggleSidebar();
        });
        
        if (sidebarClose) {
            sidebarClose.addEventListener('click', function(e) {
                e.preventDefault();
                closeSidebar();
            });
        }
        
        overlay.addEventListener('click', function(e) {
            closeSidebar();
        });
        
        // ESC key to close sidebar
        document.addEventListener('keydown', function(e) {
            if (e.key === 'Escape' && sidebar.classList.contains('show')) {
                closeSidebar();
            }
        });
        
        // Global functions for external access
        window.toggleSidebar = toggleSidebar;
        window.closeSidebar = closeSidebar;
        
        console.log('✅ Sidebar initialized');
    } catch (error) {
        console.error('Sidebar initialization error:', error);
    }
}

/**
 * Navigation event'larını bind et
 */
function bindNavigationEvents() {
    try {
        console.log('🔗 Binding navigation events...');
        
        // Logout event - Desktop
        const logoutLink = document.getElementById('navLogout');
        if (logoutLink) {
            logoutLink.addEventListener('click', function(e) {
                e.preventDefault();
                handleLogout();
            });
        }
        
        // Logout event - Sidebar
        const sidebarLogout = document.getElementById('sidebarLogout');
        if (sidebarLogout) {
            sidebarLogout.addEventListener('click', function(e) {
                e.preventDefault();
                handleLogout();
            });
        }
        
        // Reports link event
        const reportsLink = document.getElementById('navReports');
        if (reportsLink) {
            reportsLink.addEventListener('click', function(e) {
                e.preventDefault();
                if (typeof window.showAlert === 'function') {
                    window.showAlert('Raporlar sayfası henüz hazırlanmadı.', 'info');
                } else {
                    alert('Raporlar sayfası henüz hazırlanmadı.');
                }
            });
        }
        
        // Navigation links - ensure proper routing
        const navLinks = document.querySelectorAll('.navbar-nav .nav-link[href]');
        navLinks.forEach(link => {
            const href = link.getAttribute('href');
            if (href && href !== '#' && href.endsWith('.html')) {
                link.addEventListener('click', function(e) {
                    // Normal navigation, let it proceed
                    console.log('Navigating to:', href);
                });
            }
        });
        
        console.log('✅ Navigation events bound');
    } catch (error) {
        console.error('Navigation events binding error:', error);
    }
}

/**
 * Logout işlemini handle et
 */
function handleLogout() {
    try {
        console.log('🚪 Logout initiated...');
        
        // AuthService varsa kullan
        if (window.authService && typeof window.authService.logout === 'function') {
            window.authService.logout();
        } else {
            // Manual logout
            console.log('Manual logout - clearing storage');
            localStorage.removeItem('authToken');
            localStorage.removeItem('user');
            localStorage.removeItem('vervo_auth_token');
            localStorage.removeItem('vervo_user_data');
            localStorage.removeItem('tokenExpires');
            localStorage.removeItem('vervo_login_time');
            
            // Redirect to login
            window.location.href = '../index.html';
        }
        
        console.log('✅ Logout completed');
    } catch (error) {
        console.error('Logout error:', error);
        // Force redirect even if logout fails
        window.location.href = '../index.html';
    }
}

/**
 * Global logout function (backward compatibility)
 */
window.logout = handleLogout;

/**
 * Global functions for external access
 */
window.initializeHeader = initializeHeader;
window.handleLogout = handleLogout;

// Auto-initialize check
if (typeof window.headerAutoInit === 'undefined') {
    window.headerAutoInit = true;
}