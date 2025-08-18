// Standalone Header Script - src/frontend/assets/js/header-navigation.js
// Bu dosyayı dashboard.html'de header yüklendikten sonra çağırın

(function() {
    'use strict';
    
    console.log('🌍 Standalone Header Navigation Script Loading...');
    
    // Namespace to prevent conflicts
    window.NavigationModule = window.NavigationModule || {};
    
    // Safe toggle sidebar function
    window.NavigationModule.toggleSidebar = function() {
        console.log('🔄 NavigationModule.toggleSidebar called');
        const sidebar = document.getElementById('mobileSidebar');
        const overlay = document.getElementById('sidebarOverlay');
        
        if (!sidebar || !overlay) {
            console.error('❌ Sidebar elements not found');
            return false;
        }
        
        const isOpen = sidebar.classList.contains('show');
        
        if (isOpen) {
            sidebar.classList.remove('show');
            overlay.classList.remove('show');
            document.body.classList.remove('sidebar-open');
            console.log('✅ Sidebar closed');
        } else {
            sidebar.classList.add('show');
            overlay.classList.add('show');
            document.body.classList.add('sidebar-open');
            console.log('✅ Sidebar opened');
        }
        
        return true;
    };

    // Safe close sidebar function
    window.NavigationModule.closeSidebar = function() {
        console.log('🔒 NavigationModule.closeSidebar called');
        const sidebar = document.getElementById('mobileSidebar');
        const overlay = document.getElementById('sidebarOverlay');
        
        if (sidebar && overlay) {
            sidebar.classList.remove('show');
            overlay.classList.remove('show');
            document.body.classList.remove('sidebar-open');
            console.log('✅ Sidebar closed');
            return true;
        }
        return false;
    };

    // Global wrapper functions for backward compatibility
    window.toggleSidebar = function() {
        return window.NavigationModule.toggleSidebar();
    };

    window.closeSidebar = function() {
        return window.NavigationModule.closeSidebar();
    };
    
    // Initialize header navigation
    function initializeHeaderNavigation() {
        console.log('🚀 Initializing header navigation...');
        
        // Wait for elements to be available
        const checkElements = () => {
            const sidebarToggle = document.getElementById('sidebarToggle');
            const sidebar = document.getElementById('mobileSidebar');
            const overlay = document.getElementById('sidebarOverlay');
            
            return sidebarToggle && sidebar && overlay;
        };
        
        // Try to initialize immediately
        if (checkElements()) {
            setupEventListeners();
            return;
        }
        
        // Otherwise wait a bit and try again
        let attempts = 0;
        const maxAttempts = 50;
        const interval = setInterval(() => {
            attempts++;
            console.log(`🔄 Waiting for elements... attempt ${attempts}`);
            
            if (checkElements()) {
                clearInterval(interval);
                setupEventListeners();
            } else if (attempts >= maxAttempts) {
                clearInterval(interval);
                console.error('❌ Could not find sidebar elements after max attempts');
            }
        }, 100);
    }
    
    // Setup all event listeners
    function setupEventListeners() {
        console.log('🎯 Setting up event listeners...');
        
        const sidebarToggle = document.getElementById('sidebarToggle');
        const sidebarClose = document.getElementById('sidebarClose');
        const overlay = document.getElementById('sidebarOverlay');
        
        // Toggle button click
        if (sidebarToggle) {
            // Remove any existing listeners
            const newToggle = sidebarToggle.cloneNode(true);
            sidebarToggle.parentNode.replaceChild(newToggle, sidebarToggle);
            
            newToggle.addEventListener('click', function(e) {
                console.log('🖱️ Toggle button clicked!');
                e.preventDefault();
                e.stopPropagation();
                window.NavigationModule.toggleSidebar();
            });
            
            console.log('✅ Toggle button listener attached');
        }
        
        // Close button click
        if (sidebarClose) {
            sidebarClose.addEventListener('click', function(e) {
                console.log('❌ Close button clicked!');
                e.preventDefault();
                e.stopPropagation();
                window.NavigationModule.closeSidebar();
            });
            
            console.log('✅ Close button listener attached');
        }
        
        // Overlay click
        if (overlay) {
            overlay.addEventListener('click', function(e) {
                if (e.target === overlay) {
                    console.log('🔍 Overlay clicked!');
                    window.NavigationModule.closeSidebar();
                }
            });
            
            console.log('✅ Overlay listener attached');
        }
        
        // Escape key
        document.addEventListener('keydown', function(e) {
            if (e.key === 'Escape') {
                const sidebar = document.getElementById('mobileSidebar');
                if (sidebar && sidebar.classList.contains('show')) {
                    console.log('⌨️ Escape key pressed');
                    window.NavigationModule.closeSidebar();
                }
            }
        });
        
        // Auto-close on window resize to desktop
        window.addEventListener('resize', function() {
            if (window.innerWidth >= 992) {
                const sidebar = document.getElementById('mobileSidebar');
                if (sidebar && sidebar.classList.contains('show')) {
                    console.log('📱 Window resized to desktop');
                    window.NavigationModule.closeSidebar();
                }
            }
        });
        
        // Menu links - close sidebar when navigating
        const menuLinks = document.querySelectorAll('.mobile-sidebar .menu-link');
        menuLinks.forEach(link => {
            link.addEventListener('click', function() {
                if (this.href && !this.href.includes('#')) {
                    setTimeout(() => {
                        window.NavigationModule.closeSidebar();
                    }, 100);
                }
            });
        });
        
        // Initialize dropdowns (desktop)
        initializeDropdowns();
        
        // Set active navigation
        setActiveNavigation();
        
        // Update user info
        updateUserInfo();
        
        // Initialize notifications
        initializeNotifications();
        
        console.log('✅ All event listeners attached successfully');
    }
    
    // Initialize dropdown functionality
    function initializeDropdowns() {
        const dropdownToggles = document.querySelectorAll('.dropdown-toggle');
        
        dropdownToggles.forEach(toggle => {
            toggle.addEventListener('click', function(e) {
                e.preventDefault();
                
                const dropdown = this.closest('.dropdown');
                const menu = dropdown.querySelector('.dropdown-menu');
                
                if (menu) {
                    const isVisible = menu.classList.contains('show');
                    
                    // Close all other dropdowns
                    document.querySelectorAll('.dropdown-menu.show').forEach(otherMenu => {
                        if (otherMenu !== menu) {
                            otherMenu.classList.remove('show');
                            const otherToggle = otherMenu.previousElementSibling;
                            if (otherToggle) {
                                otherToggle.setAttribute('aria-expanded', 'false');
                            }
                        }
                    });
                    
                    // Toggle current dropdown
                    menu.classList.toggle('show', !isVisible);
                    this.setAttribute('aria-expanded', (!isVisible).toString());
                }
            });
        });
        
        // Close dropdowns when clicking outside
        document.addEventListener('click', function(e) {
            if (!e.target.closest('.dropdown')) {
                document.querySelectorAll('.dropdown-menu.show').forEach(menu => {
                    menu.classList.remove('show');
                });
                document.querySelectorAll('.dropdown-toggle').forEach(toggle => {
                    toggle.setAttribute('aria-expanded', 'false');
                });
            }
        });
    }
    
    // Set active navigation based on current page
    function setActiveNavigation() {
        const currentPage = window.location.pathname.split('/').pop();
        
        // Desktop navigation
        const desktopNavLinks = document.querySelectorAll('.navbar-nav .nav-link:not(.dropdown-toggle)');
        desktopNavLinks.forEach(link => {
            const href = link.getAttribute('href');
            if (href && (href === currentPage || href.includes(currentPage))) {
                link.classList.add('active');
            } else {
                link.classList.remove('active');
            }
        });
        
        // Mobile sidebar navigation
        const mobileMenuLinks = document.querySelectorAll('.menu-link');
        mobileMenuLinks.forEach(link => {
            const href = link.getAttribute('href');
            if (href && (href === currentPage || href.includes(currentPage))) {
                link.classList.add('active');
            } else {
                link.classList.remove('active');
            }
        });
    }
    
    // Update user information
    function updateUserInfo() {
        const userInfo = getUserFromStorage();
        if (userInfo) {
            // Desktop user info
            const userDisplayName = document.getElementById('userDisplayName');
            const userEmail = document.getElementById('userEmail');
            const userAvatar = document.querySelector('.navbar .user-avatar span');
            
            if (userDisplayName) {
                userDisplayName.textContent = userInfo.name || userInfo.FullName || 'Kullanıcı';
            }
            
            if (userEmail) {
                userEmail.textContent = userInfo.email || userInfo.Email || 'user@example.com';
            }
            
            if (userAvatar && (userInfo.name || userInfo.FullName)) {
                const name = userInfo.name || userInfo.FullName;
                userAvatar.textContent = name.charAt(0).toUpperCase();
            }
            
            // Mobile user info
            const mobileUserName = document.getElementById('mobileUserName');
            const mobileUserEmail = document.getElementById('mobileUserEmail');
            const mobileUserAvatar = document.querySelector('.sidebar-user .user-avatar span');
            
            if (mobileUserName && (userInfo.name || userInfo.FullName)) {
                mobileUserName.textContent = userInfo.name || userInfo.FullName;
            }
            
            if (mobileUserEmail && (userInfo.email || userInfo.Email)) {
                mobileUserEmail.textContent = userInfo.email || userInfo.Email;
            }
            
            if (mobileUserAvatar && (userInfo.name || userInfo.FullName)) {
                const name = userInfo.name || userInfo.FullName;
                mobileUserAvatar.textContent = name.charAt(0).toUpperCase();
            }
        }
    }
    
    // Initialize notification system
    function initializeNotifications() {
        const notificationBadge = document.getElementById('notificationBadge');
        const mobileBadge = document.getElementById('mobileBadge');
        
        // You can update this with real notification count from API
        const notificationCount = 0;
        
        if (notificationCount > 0) {
            if (notificationBadge) {
                notificationBadge.textContent = notificationCount;
                notificationBadge.classList.remove('d-none');
            }
            if (mobileBadge) {
                mobileBadge.textContent = notificationCount;
                mobileBadge.classList.remove('d-none');
            }
        } else {
            if (notificationBadge) notificationBadge.classList.add('d-none');
            if (mobileBadge) mobileBadge.classList.add('d-none');
        }
    }
    
    // Get user data from storage
    function getUserFromStorage() {
        try {
            const userData = localStorage.getItem('userData') || 
                           localStorage.getItem('user') || 
                           localStorage.getItem('vervo_user');
            return userData ? JSON.parse(userData) : null;
        } catch (e) {
            console.error('Error getting user data from storage:', e);
            return null;
        }
    }
    
    // Logout function
    window.logout = function() {
        // Clear user session
        localStorage.removeItem('token');
        localStorage.removeItem('userData');
        localStorage.removeItem('user');
        localStorage.removeItem('vervo_token');
        localStorage.removeItem('vervo_user');
        
        // Show loading state
        const logoutBtn = event.target.closest('a, button');
        if (logoutBtn) {
            logoutBtn.innerHTML = '<i class="fas fa-spinner fa-spin me-2"></i>Çıkış yapılıyor...';
        }
        
        // Redirect to login page
        setTimeout(() => {
            window.location.href = '../login.html';
        }, 500);
    };
    
    // Expose initialization function globally
    window.initializeHeaderNavigation = initializeHeaderNavigation;
    
    // Auto-initialize if this script is loaded after the header
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initializeHeaderNavigation);
    } else {
        // Wait a bit for the header to be inserted
        setTimeout(initializeHeaderNavigation, 100);
    }
    
    console.log('✅ Standalone Header Navigation Script Ready');
    
})();