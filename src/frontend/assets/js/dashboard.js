// Dashboard page functionality
$(document).ready(function() {
    initializeDashboard();
    setupEventHandlers();
    startPeriodicUpdates();
});

/**
 * Initialize dashboard
 */
function initializeDashboard() {
    // Load user information
    loadUserInfo();
    
    // Set current time displays
    updateTimeDisplays();
    
    // Check system status
    checkSystemStatus();
    
    // Load recent activity
    loadRecentActivity();
    
    // Apply fade-in animations
    animateElements();
    
    console.log('Dashboard initialized successfully');
}

/**
 * Setup event handlers
 */
function setupEventHandlers() {
    // Logout handler
    $('#logoutLink').on('click', handleLogout);
    
    // Quick action buttons
    $('#refreshUserBtn').on('click', handleRefreshUser);
    $('#validateTokenBtn').on('click', handleValidateToken);
    $('#clearCacheBtn').on('click', handleClearCache);
    $('#testApiBtn').on('click', handleTestApi);
    
    // Navigation handlers
    setupNavigationHandlers();
    
    // Keyboard shortcuts
    setupKeyboardShortcuts();
}

/**
 * Load and display user information
 */
function loadUserInfo() {
    const user = authService.getUser();
    
    if (!user) {
        console.error('No user data found');
        authService.redirectToLogin();
        return;
    }
    
    try {
        // Update main user displays
        const fullName = user.FullName || user.fullname || 'Kullanıcı';
        const firstName = user.FirstName || user.firstName || fullName.split(' ')[0] || 'Kullanıcı';
        
        $('#userFullName').text(fullName);
        $('#welcomeUserName').text(firstName);
        
        // Update detailed user info card
        updateUserInfoCard(user);
        
        // Update login time
        updateLoginTimeDisplay();
        
        console.log('User info loaded for:', user.login || user.Login);
        
    } catch (error) {
        console.error('Error loading user info:', error);
        showAlert('Kullanıcı bilgileri yüklenirken hata oluştu.', 'warning');
    }
}

/**
 * Update user info card with detailed information
 */
function updateUserInfoCard(user) {
    // Basic info
    $('#userInfoFullName').text(user.FullName || user.fullname || '-');
    $('#userInfoLogin').text(user.Login || user.login || '-');
    $('#userInfoEmail').text(user.Email || user.email || '-');
    
    // Admin status
    const isAdmin = user.Admin || user.admin || false;
    const adminBadge = $('#userInfoAdmin');
    if (isAdmin) {
        adminBadge.removeClass('bg-secondary bg-success').addClass('bg-danger').text('Yönetici');
    } else {
        adminBadge.removeClass('bg-danger bg-success').addClass('bg-success').text('Kullanıcı');
    }
    
    // Last login
    const lastLogin = user.LastLoginOn || user.lastLoginOn;
    if (lastLogin) {
        try {
            const loginDate = new Date(lastLogin);
            $('#userInfoLastLogin').text(loginDate.toLocaleString('tr-TR'));
        } catch (error) {
            $('#userInfoLastLogin').text('Geçersiz tarih');
        }
    } else {
        $('#userInfoLastLogin').text('Bu oturum');
    }
}

/**
 * Update time-related displays
 */
function updateTimeDisplays() {
    // Current login time
    const loginInfo = authService.getLoginTimeInfo();
    if (loginInfo) {
        $('#currentLoginTime').text(loginInfo.loginTime.toLocaleString('tr-TR'));
        $('#loginTime').text(loginInfo.loginTime.toLocaleString('tr-TR'));
    } else {
        const now = new Date();
        $('#currentLoginTime').text(now.toLocaleString('tr-TR'));
        $('#loginTime').text('Şimdi');
    }
    
    // Last health check
    $('#lastHealthCheck').text(new Date().toLocaleTimeString('tr-TR'));
}

/**
 * Check and display system status
 */
function checkSystemStatus() {
    // Check authentication status
    const isAuthenticated = authService.isAuthenticated();
    
    // Update status indicators
    updateStatusIndicator('redmineStatus', isAuthenticated, '✓', '✗');
    updateStatusIndicator('tokenStatus', isAuthenticated, '✓', '✗');
    
    // Update footer status if footer component is loaded
    if (typeof updateFooterSystemStatus === 'function') {
        updateFooterSystemStatus();
    }
    
    console.log('System status checked - Authenticated:', isAuthenticated);
}

/**
 * Update a status indicator element
 */
function updateStatusIndicator(elementId, isHealthy, healthyText, unhealthyText) {
    const element = $('#' + elementId);
    if (isHealthy) {
        element.text(healthyText)
               .removeClass('text-danger text-warning')
               .addClass('text-success');
    } else {
        element.text(unhealthyText)
               .removeClass('text-success text-warning')
               .addClass('text-danger');
    }
}

/**
 * Load recent activity data
 */
function loadRecentActivity() {
    // This is a placeholder - in a real app, you'd fetch this from an API
    const activities = [
        {
            icon: '✅',
            title: 'Başarılı Giriş',
            description: 'Portal kimlik doğrulama ile portal girişi yapıldı',
            time: 'Şimdi',
            type: 'success'
        },
        {
            icon: '🔑',
            title: 'JWT Token Oluşturuldu',
            description: 'Güvenli oturum tokeni başarıyla oluşturuldu',
            time: 'Az önce',
            type: 'info'
        },
        {
            icon: '🌐',
            title: 'Sistem Kontrolü',
            description: 'Portal bağlantısı ve API durumu kontrol edildi',
            time: 'Az önce',
            type: 'primary'
        }
    ];
    
    // This would be replaced with actual API call
    displayRecentActivity(activities);
}

/**
 * Display recent activity in timeline
 */
function displayRecentActivity(activities) {
    const timeline = $('.timeline');
    
    // Clear existing activities except the default ones
    // In a real implementation, you'd manage this differently
    
    activities.forEach((activity, index) => {
        const activityHtml = `
            <div class="timeline-item" style="animation-delay: ${index * 0.1}s">
                <div class="timeline-marker bg-${activity.type}"></div>
                <div class="timeline-content">
                    <h6 class="mb-1">${activity.icon} ${activity.title}</h6>
                    <p class="mb-0 text-muted">${activity.description}</p>
                    <small class="text-muted">${activity.time}</small>
                </div>
            </div>
        `;
        
        // Note: In the current implementation, we don't dynamically add activities
        // This is just a placeholder for future enhancement
    });
}

/**
 * Handle logout action
 */
function handleLogout(e) {
    e.preventDefault();
    
    // Show confirmation dialog
    if (confirm('Çıkış yapmak istediğinizden emin misiniz?')) {
        // Show loading state
        const originalText = $(this).text();
        $(this).text('Çıkış yapılıyor...').prop('disabled', true);
        
        // Perform logout
        authService.logout();
    }
}

/**
 * Handle refresh user action
 */
async function handleRefreshUser() {
    const btn = $('#refreshUserBtn');
    const originalText = btn.text();
    
    try {
        // Show loading state
        btn.prop('disabled', true)
           .html('<span class="spinner-border spinner-border-sm me-2"></span>Yenileniyor...');
        
        // Validate token and get fresh user data
        const response = await authService.validateToken();
        
        if (response && response.user) {
            // Update stored user info
            localStorage.setItem('vervo_user', JSON.stringify(response.user));
            
            // Reload user info on page
            loadUserInfo();
            
            showAlert('Kullanıcı bilgileri başarıyla yenilendi!', 'success');
        } else {
            throw new Error('Sunucudan geçersiz yanıt alındı');
        }
        
    } catch (error) {
        console.error('Error refreshing user info:', error);
        showAlert('Kullanıcı bilgileri yenilenirken hata oluştu: ' + error.message, 'danger');
    } finally {
        // Reset button state
        setTimeout(() => {
            btn.prop('disabled', false).text(originalText);
        }, 1000);
    }
}

/**
 * Handle validate token action
 */
async function handleValidateToken() {
    const btn = $('#validateTokenBtn');
    const originalText = btn.text();
    
    try {
        // Show loading state
        btn.prop('disabled', true)
           .html('<span class="spinner-border spinner-border-sm me-2"></span>Kontrol ediliyor...');
        
        // Check local token first
        if (!authService.isAuthenticated()) {
            throw new Error('Token geçersiz veya süresi dolmuş');
        }
        
        // Validate with server
        await authService.validateToken();
        
        // Update status indicators
        updateStatusIndicator('tokenStatus', true, '✓', '✗');
        updateStatusIndicator('redmineStatus', true, '✓', '✗');
        
        showAlert('Token geçerli ve aktif!', 'success');
        
    } catch (error) {
        console.error('Token validation error:', error);
        
        // Update status indicators
        updateStatusIndicator('tokenStatus', false, '✓', '✗');
        updateStatusIndicator('redmineStatus', false, '✓', '✗');
        
        showAlert('Token geçersiz: ' + error.message, 'danger');
    } finally {
        // Reset button state
        setTimeout(() => {
            btn.prop('disabled', false).text(originalText);
        }, 1000);
    }
}

/**
 * Handle clear cache action
 */
function handleClearCache() {
    const btn = $('#clearCacheBtn');
    const originalText = btn.text();
    
    // Show loading state
    btn.prop('disabled', true)
       .html('<span class="spinner-border spinner-border-sm me-2"></span>Temizleniyor...');
    
    try {
        // Clear various caches
        // Session storage (except important data)
        const importantKeys = ['vervo_redirect_after_login'];
        Object.keys(sessionStorage).forEach(key => {
            if (!importantKeys.includes(key)) {
                sessionStorage.removeItem(key);
            }
        });
        
        // Clear any temporary data
        if (typeof caches !== 'undefined') {
            caches.keys().then(cacheNames => {
                cacheNames.forEach(cacheName => {
                    if (cacheName.includes('vervo')) {
                        caches.delete(cacheName);
                    }
                });
            });
        }
        
        setTimeout(() => {
            showAlert('Önbellek başarıyla temizlendi!', 'info');
        }, 1000);
        
    } catch (error) {
        console.error('Error clearing cache:', error);
        showAlert('Önbellek temizlenirken hata oluştu.', 'warning');
    } finally {
        // Reset button state
        setTimeout(() => {
            btn.prop('disabled', false).text(originalText);
        }, 1500);
    }
}

/**
 * Handle test API action
 */
async function handleTestApi() {
    const btn = $('#testApiBtn');
    const originalText = btn.text();
    
    try {
        // Show loading state
        btn.prop('disabled', true)
           .html('<span class="spinner-border spinner-border-sm me-2"></span>Test ediliyor...');
        
        // Test API connectivity
        const startTime = Date.now();
        
        // Make a simple API call
        const response = await authService.validateToken();
        
        const endTime = Date.now();
        const responseTime = endTime - startTime;
        
        // Show success with response time
        showAlert(`API bağlantısı başarılı! Yanıt süresi: ${responseTime}ms`, 'success');
        
        // Update system status
        checkSystemStatus();
        
    } catch (error) {
        console.error('API test failed:', error);
        showAlert('API bağlantı testi başarısız: ' + error.message, 'danger');
    } finally {
        // Reset button state
        setTimeout(() => {
            btn.prop('disabled', false).text(originalText);
        }, 1000);
    }
}

/**
 * Setup navigation handlers
 */
function setupNavigationHandlers() {
    // Dashboard link (current page)
    $('#dashboardLink').addClass('active');
    
    // Other navigation items
    $('#projectsLink, #issuesLink').on('click', function(e) {
        e.preventDefault();
        const linkText = $(this).text().trim();
        showAlert(`${linkText} sayfası henüz hazırlanmadı.`, 'info');
    });
    
    // Profile and settings links
    $('#profileLink, #settingsLink').on('click', function(e) {
        e.preventDefault();
        const linkText = $(this).text().trim();
        showAlert(`${linkText} özelliği yakında eklenecek.`, 'info');
    });
}

/**
 * Setup keyboard shortcuts
 */
function setupKeyboardShortcuts() {
    $(document).on('keydown', function(e) {
        // Ctrl/Cmd + R to refresh user info
        if ((e.ctrlKey || e.metaKey) && e.key === 'r') {
            e.preventDefault();
            handleRefreshUser();
        }
        
        // Ctrl/Cmd + T to validate token
        if ((e.ctrlKey || e.metaKey) && e.key === 't') {
            e.preventDefault();
            handleValidateToken();
        }
        
        // Ctrl/Cmd + L to logout
        if ((e.ctrlKey || e.metaKey) && e.key === 'l') {
            e.preventDefault();
            handleLogout(e);
        }
    });
}

/**
 * Start periodic updates
 */
function startPeriodicUpdates() {
    // Update time displays every minute
    setInterval(updateTimeDisplays, 60000);
    
    // Check system status every 5 minutes
    setInterval(checkSystemStatus, 5 * 60000);
    
    // Update last health check time every 30 seconds
    setInterval(() => {
        $('#lastHealthCheck').text(new Date().toLocaleTimeString('tr-TR'));
    }, 30000);
}

/**
 * Animate page elements
 */
function animateElements() {
    // Add fade-in class to cards with staggered delay
    $('.card').each(function(index) {
        $(this).css('animation-delay', (index * 0.1) + 's')
               .addClass('fade-in');
    });
}

/**
 * Show alert message
 */
function showAlert(message, type = 'info') {
    // Remove existing alerts
    $('#alertContainer').empty();
    
    // Create new alert
    const alertHtml = `
        <div class="alert alert-${type} alert-dismissible fade show" role="alert">
            <strong>${getAlertIcon(type)}</strong> ${message}
            <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
        </div>
    `;
    
    // Add to container
    $('#alertContainer').html(alertHtml);
    
    // Auto remove after 5 seconds
    setTimeout(() => {
        $('.alert').alert('close');
    }, 5000);
    
    // Scroll to top to ensure alert is visible
    $('html, body').animate({ scrollTop: 0 }, 300);
}

/**
 * Get appropriate icon for alert type
 */
function getAlertIcon(type) {
    const icons = {
        success: '✅',
        danger: '❌',
        warning: '⚠️',
        info: 'ℹ️'
    };
    return icons[type] || 'ℹ️';
}

/**
 * Update login time display
 */
function updateLoginTimeDisplay() {
    const loginInfo = authService.getLoginTimeInfo();
    if (loginInfo) {
        const sessionMinutes = loginInfo.sessionDurationMinutes;
        if (sessionMinutes < 60) {
            $('#currentLoginTime').attr('title', `Oturum süresi: ${sessionMinutes} dakika`);
        } else {
            const hours = Math.floor(sessionMinutes / 60);
            const minutes = sessionMinutes % 60;
            $('#currentLoginTime').attr('title', `Oturum süresi: ${hours} saat ${minutes} dakika`);
        }
    }
}

/**
 * Handle page visibility change for security
 */
document.addEventListener('visibilitychange', function() {
    if (!document.hidden) {
        // Page became visible - refresh data
        if (authService.isAuthenticated()) {
            checkSystemStatus();
            updateTimeDisplays();
        }
    }
});

/**
 * Handle window focus for real-time updates
 */
$(window).on('focus', function() {
    if (authService.isAuthenticated()) {
        // Refresh user info and status when window gains focus
        loadUserInfo();
        checkSystemStatus();
    }
});

// Export functions for testing or external use
window.dashboardUtils = {
    loadUserInfo,
    checkSystemStatus,
    showAlert,
    updateTimeDisplays,
    handleRefreshUser,
    handleValidateToken,
    handleTestApi,
    handleClearCache,
    updateUserInfoCard,
    animateElements
};