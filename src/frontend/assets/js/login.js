// Login Page JavaScript
// src/frontend/assets/js/login.js

$(document).ready(function() {
    console.log('Login script loaded');
    
    // Initialize login page
    initializeLoginPage();
    
    // Check for URL messages
    checkForUrlMessages();
    
    // Setup form handlers
    setupFormHandlers();
    
    // Setup input effects
    setupInputFocusEffects();
});

/**
 * Initialize login page
 */
function initializeLoginPage() {
    console.log('Initializing login page...');
    
    // Focus on username field
    $('#username').focus();
    
    // Load remembered username
    loadRememberedUsername();
    
    // Setup keyboard shortcuts
    setupKeyboardShortcuts();
}

/**
 * Setup form event handlers
 */
function setupFormHandlers() {
    // Login form submission
    $('#loginForm').on('submit', handleLogin);
    
    // Enter key handling
    $('.form-control').on('keypress', function(e) {
        if (e.which === 13) { // Enter key
            e.preventDefault();
            handleLogin(e);
        }
    });
    
    // Show/hide password toggle
    $('#togglePassword').on('click', function() {
        const passwordField = $('#password');
        const passwordFieldType = passwordField.attr('type');
        
        if (passwordFieldType === 'password') {
            passwordField.attr('type', 'text');
            $(this).html('<i class="fas fa-eye-slash"></i>');
        } else {
            passwordField.attr('type', 'password');
            $(this).html('<i class="fas fa-eye"></i>');
        }
    });
}

/**
 * Handle login form submission - FIXED VERSION
 */
async function handleLogin(event) {
    event.preventDefault();
    console.log('=== LOGIN ATTEMPT ===');
    
    // Form verilerini al
    const username = $('#username').val()?.trim();
    const password = $('#password').val();
    const rememberMe = $('#rememberMe').is(':checked');
    
    // Validation
    if (!username || !password) {
        showErrorMessage('Kullanıcı adı ve şifre gereklidir.');
        return;
    }
    
    try {
        // Loading state
        setLoadingState(true);
        hideAllMessages();
        
        console.log('Attempting login with username:', username);
        
        // API call
        const response = await authService.login(username, password, rememberMe);
        console.log('Login successful:', response);
        
        // Handle remember me
        if (rememberMe) {
            localStorage.setItem('vervo_remember_username', username);
        } else {
            localStorage.removeItem('vervo_remember_username');
        }
        
        // Success message
        showSuccessMessage('Giriş başarılı! Yönlendiriliyorsunuz...');
        
        // Store login analytics (optional)
        storeLoginAnalytics(response.user || {});
        
        // Basit ve doğrudan yönlendirme - FIXED
        setTimeout(() => {
            console.log('=== LOGIN SUCCESS REDIRECT ===');
            console.log('Current location:', window.location.href);
            
            // Doğrudan dashboard'a yönlendir
            window.location.href = './dashboard.html';
            
        }, 1000); // 1 saniye bekle ki kullanıcı mesajı görsün
        
    } catch (error) {
        console.error('Login failed:', error);
        
        // Show error message
        const errorMessage = error.message || 'Giriş işlemi başarısız oldu. Lütfen bilgilerinizi kontrol edin.';
        showErrorMessage(errorMessage);
        
        // Add visual feedback
        addFormShakeEffect();
        
        // Focus back to username field for retry
        setTimeout(() => {
            $('#username').focus().select();
        }, 500);
        
    } finally {
        // Reset loading state after delay
        setTimeout(() => {
            setLoadingState(false);
        }, 1000);
    }
}

/**
 * Load remembered username
 */
function loadRememberedUsername() {
    const rememberedUsername = localStorage.getItem('vervo_remember_username');
    if (rememberedUsername) {
        $('#username').val(rememberedUsername);
        $('#rememberMe').prop('checked', true);
        $('#password').focus();
    }
}

/**
 * Setup keyboard shortcuts
 */
function setupKeyboardShortcuts() {
    $(document).on('keydown', function(e) {
        // Ctrl+L or Cmd+L to focus username
        if ((e.ctrlKey || e.metaKey) && e.key === 'l') {
            e.preventDefault();
            $('#username').focus().select();
        }
        
        // Escape to clear form
        if (e.key === 'Escape') {
            clearForm();
        }
    });
}

/**
 * Clear login form
 */
function clearForm() {
    $('#username, #password').val('');
    $('#rememberMe').prop('checked', false);
    hideAllMessages();
    $('#username').focus();
}

/**
 * Set loading state
 */
function setLoadingState(loading) {
    const loginBtn = $('#loginBtn');
    const form = $('#loginForm');
    
    if (loading) {
        loginBtn.prop('disabled', true)
               .html('<span class="spinner-border spinner-border-sm me-2" role="status"></span>Giriş yapılıyor...');
        form.addClass('loading');
    } else {
        loginBtn.prop('disabled', false)
               .html('<i class="fas fa-sign-in-alt me-2"></i>Giriş Yap');
        form.removeClass('loading');
    }
}

/**
 * Add form shake effect for errors
 */
function addFormShakeEffect() {
    const form = $('#loginForm');
    form.addClass('shake');
    
    setTimeout(() => {
        form.removeClass('shake');
    }, 600);
}

/**
 * Setup input focus effects
 */
function setupInputFocusEffects() {
    $('.form-control').on('focus', function() {
        $(this).closest('.form-floating').addClass('focused');
    }).on('blur', function() {
        if (!$(this).val()) {
            $(this).closest('.form-floating').removeClass('focused');
        }
    });
}

/**
 * Show success message
 */
function showSuccessMessage(message) {
    hideAllMessages();
    
    const alertHtml = `
        <div class="alert alert-success alert-dismissible fade show" role="alert">
            <strong>✅ Başarılı:</strong> ${message}
            <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
        </div>
    `;
    
    $('#alertContainer').html(alertHtml);
}

/**
 * Show error message
 */
function showErrorMessage(message) {
    hideAllMessages();
    
    const alertHtml = `
        <div class="alert alert-danger alert-dismissible fade show" role="alert">
            <strong>❌ Hata:</strong> ${message}
            <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
        </div>
    `;
    
    $('#alertContainer').html(alertHtml);
}

/**
 * Show info message
 */
function showInfoMessage(message) {
    hideAllMessages();
    
    const alertHtml = `
        <div class="alert alert-info alert-dismissible fade show" role="alert">
            <strong>ℹ️ Bilgi:</strong> ${message}
            <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
        </div>
    `;
    
    $('#alertContainer').html(alertHtml);
    
    // Auto hide after 4 seconds
    setTimeout(() => {
        hideAllMessages();
    }, 4000);
}

/**
 * Hide all messages
 */
function hideAllMessages() {
    $('#alertContainer').empty();
}

/**
 * Check for URL parameters with messages
 */
function checkForUrlMessages() {
    const urlParams = new URLSearchParams(window.location.search);
    const error = urlParams.get('error');
    const message = urlParams.get('message');
    
    if (error) {
        showErrorMessage(decodeURIComponent(error));
        // Clean URL
        window.history.replaceState({}, document.title, window.location.pathname);
    } else if (message) {
        showInfoMessage(decodeURIComponent(message));
        // Clean URL
        window.history.replaceState({}, document.title, window.location.pathname);
    }
}

/**
 * Store login analytics (optional)
 */
function storeLoginAnalytics(user) {
    try {
        const analytics = {
            loginTime: new Date().toISOString(),
            userId: user.id || 'unknown',
            userAgent: navigator.userAgent,
            platform: navigator.platform,
            language: navigator.language
        };
        
        // Store in sessionStorage for this session
        sessionStorage.setItem('vervo_login_analytics', JSON.stringify(analytics));
        
        console.log('Login analytics stored');
    } catch (error) {
        console.warn('Could not store login analytics:', error);
    }
}