// Login page functionality - FIXED VERSION
$(document).ready(function() {
    console.log('Login page loading...');
    initializeLoginPage();
    setupFormValidation();
    setupEventHandlers();
});

/**
 * Initialize login page
 */
function initializeLoginPage() {
    console.log('Initializing login page...');
    
    // Load remembered username if exists
    loadRememberedUser();
    
    // Set focus to username field
    $('#username').focus();
    
    // Clear any existing alerts
    hideAllMessages();
    
    // Check if there's an error message in URL params
    checkForUrlMessages();
    
    console.log('Login page initialized');
}

/**
 * Load remembered username
 */
function loadRememberedUser() {
    try {
        if (authService && typeof authService.getRememberedUsername === 'function') {
            const rememberedUsername = authService.getRememberedUsername();
            if (rememberedUsername) {
                $('#username').val(rememberedUsername);
                $('#rememberMe').prop('checked', true);
                $('#password').focus(); // Focus to password if username is filled
                console.log('Remembered username loaded:', rememberedUsername);
            }
        } else {
            // Fallback: direct localStorage access
            const rememberedUsername = localStorage.getItem('vervo_remember_username');
            if (rememberedUsername) {
                $('#username').val(rememberedUsername);
                $('#rememberMe').prop('checked', true);
                $('#password').focus();
                console.log('Remembered username loaded (fallback):', rememberedUsername);
            }
        }
    } catch (error) {
        console.error('Error loading remembered user:', error);
    }
}

/**
 * Setup form validation
 */
function setupFormValidation() {
    // Real-time validation for username
    $('#username').on('blur', function() {
        validateUsername();
    });
    
    // Real-time validation for password
    $('#password').on('blur', function() {
        validatePassword();
    });
    
    // Clear validation states on input
    $('#username, #password').on('input', function() {
        clearFieldValidation($(this));
    });
}

/**
 * Setup event handlers
 */
function setupEventHandlers() {
    // Login form submission
    $('#loginForm').on('submit', handleLoginSubmit);
    
    // Enter key handlers
    $('#username, #password').on('keypress', function(e) {
        if (e.which === 13) { // Enter key
            e.preventDefault();
            $('#loginForm').submit();
        }
    });
    
    // Remember me functionality
    $('#rememberMe').on('change', handleRememberMeChange);
    
    // Input field focus effects
    setupInputFocusEffects();
}

/**
 * Handle login form submission
 */
async function handleLoginSubmit(e) {
    e.preventDefault();
    
    console.log('Login form submitted');
    
    // Get form data
    const formData = getFormData();
    console.log('Form data:', { username: formData.username, rememberMe: formData.rememberMe });
    
    // Validate form
    if (!validateForm(formData)) {
        console.log('Form validation failed');
        return;
    }
    
    // Show loading state
    setLoadingState(true);
    
    try {
        console.log('Attempting login...');
        
        // Attempt login
        const response = await authService.login(formData.username, formData.password);
        console.log('Login response:', response);
        
        // Handle remember me
        if (formData.rememberMe) {
            if (authService.rememberUser) {
                authService.rememberUser(formData.username);
            } else {
                localStorage.setItem('vervo_remember_username', formData.username);
            }
        } else {
            if (authService.clearRememberedUser) {
                authService.clearRememberedUser();
            } else {
                localStorage.removeItem('vervo_remember_username');
            }
        }
        
        // Show success message
        showSuccessMessage('Giriş başarılı! Yönlendiriliyorsunuz...');
        
        // Store login analytics (optional)
        storeLoginAnalytics(response.user || {});
        
/**
 * Handle login form submission
 */
async function handleLoginSubmit(e) {
    e.preventDefault();
    
    console.log('Login form submitted');
    
    // Get form data
    const formData = getFormData();
    console.log('Form data:', { username: formData.username, rememberMe: formData.rememberMe });
    
    // Validate form
    if (!validateForm(formData)) {
        console.log('Form validation failed');
        return;
    }
    
    // Show loading state
    setLoadingState(true);
    
    try {
        console.log('Attempting login...');
        
        // Attempt login
        const response = await authService.login(formData.username, formData.password);
        console.log('Login response:', response);
        
        // Handle remember me
        if (formData.rememberMe) {
            if (authService.rememberUser) {
                authService.rememberUser(formData.username);
            } else {
                localStorage.setItem('vervo_remember_username', formData.username);
            }
        } else {
            if (authService.clearRememberedUser) {
                authService.clearRememberedUser();
            } else {
                localStorage.removeItem('vervo_remember_username');
            }
        }
        
        // Show success message
        showSuccessMessage('Giriş başarılı! Yönlendiriliyorsunuz...');
        
        // Store login analytics (optional)
        storeLoginAnalytics(response.user || {});
        
        // Redirect after short delay
        setTimeout(() => {
            console.log('=== LOGIN SUCCESS REDIRECT ===');
            console.log('Current location:', window.location.href);
            
            const dashboardPath = './dashboard.html';
            console.log('Target dashboard:', dashboardPath);
            
            // Multiple redirect attempt
            performRedirect(dashboardPath);
            
        }, 500);
        
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

// Redirect fonksiyonu
function performRedirect(targetPath) {
    console.log('performRedirect called with:', targetPath);
    
    try {
        // Auth service dene
        if (authService && authService.redirectAfterLogin) {
            console.log('Trying authService redirect...');
            authService.redirectAfterLogin();
        }
        
        // Direct redirects
        setTimeout(() => {
            console.log('Direct href redirect...');
            window.location.href = targetPath;
        }, 100);
        
        setTimeout(() => {
            console.log('Assign redirect...');
            window.location.assign(targetPath);
        }, 200);
        
        setTimeout(() => {
            console.log('Replace redirect...');
            window.location.replace(targetPath);
        }, 300);
        
        // Final fallback
        setTimeout(() => {
            console.log('Final fallback - setting window.location...');
            window.location = targetPath;
        }, 500);
        
    } catch (error) {
        console.error('Redirect error:', error);
        alert('Yönlendirme başarısız! Dashboard linkine manuel olarak tıklayın.');
    }
}
        
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
 * Get form data
 */
function getFormData() {
    return {
        username: $('#username').val().trim(),
        password: $('#password').val(),
        rememberMe: $('#rememberMe').is(':checked')
    };
}

/**
 * Validate entire form
 */
function validateForm(data) {
    let isValid = true;
    
    // Clear previous validation states
    clearAllValidation();
    
    // Validate username
    if (!data.username) {
        showFieldError('username', 'Kullanıcı adı gereklidir');
        isValid = false;
    } else if (data.username.length < 2) {
        showFieldError('username', 'Kullanıcı adı en az 2 karakter olmalıdır');
        isValid = false;
    }
    
    // Validate password
    if (!data.password) {
        showFieldError('password', 'Şifre gereklidir');
        isValid = false;
    } else if (data.password.length < 3) {
        showFieldError('password', 'Şifre en az 3 karakter olmalıdır');
        isValid = false;
    }
    
    // Show general error if validation fails
    if (!isValid) {
        showErrorMessage('Lütfen form bilgilerini kontrol edin.');
    }
    
    return isValid;
}

/**
 * Individual field validations
 */
function validateUsername() {
    const username = $('#username').val().trim();
    const field = $('#username');
    
    if (!username) {
        showFieldError('username', 'Kullanıcı adı gereklidir');
        return false;
    } else if (username.length < 2) {
        showFieldError('username', 'Kullanıcı adı en az 2 karakter olmalıdır');
        return false;
    } else {
        clearFieldValidation(field);
        return true;
    }
}

function validatePassword() {
    const password = $('#password').val();
    const field = $('#password');
    
    if (!password) {
        showFieldError('password', 'Şifre gereklidir');
        return false;
    } else if (password.length < 3) {
        showFieldError('password', 'Şifre en az 3 karakter olmalıdır');
        return false;
    } else {
        clearFieldValidation(field);
        return true;
    }
}

/**
 * Show field error
 */
function showFieldError(fieldId, message) {
    const field = $('#' + fieldId);
    field.addClass('is-invalid');
    
    // Remove existing error message
    field.siblings('.invalid-feedback').remove();
    
    // Add error message
    field.after(`<div class="invalid-feedback">${message}</div>`);
}

/**
 * Clear field validation
 */
function clearFieldValidation(field) {
    field.removeClass('is-invalid is-valid');
    field.siblings('.invalid-feedback').remove();
}

/**
 * Clear all validation
 */
function clearAllValidation() {
    $('.form-control').removeClass('is-invalid is-valid');
    $('.invalid-feedback').remove();
}

/**
 * Set loading state
 */
function setLoadingState(loading) {
    const btn = $('#loginBtn');
    const spinner = btn.find('.spinner-border');
    const btnText = btn.find('.btn-text');
    
    if (loading) {
        btn.prop('disabled', true);
        spinner.removeClass('d-none');
        btnText.text('Giriş yapılıyor...');
    } else {
        btn.prop('disabled', false);
        spinner.addClass('d-none');
        btnText.text('Giriş Yap');
    }
}

/**
 * Handle remember me change
 */
function handleRememberMeChange() {
    const isChecked = $('#rememberMe').is(':checked');
    console.log('Remember me changed:', isChecked);
}

/**
 * Setup input focus effects
 */
function setupInputFocusEffects() {
    $('.form-control').on('focus', function() {
        $(this).parent().addClass('focused');
    }).on('blur', function() {
        $(this).parent().removeClass('focused');
    });
}

/**
 * Add form shake effect for errors
 */
function addFormShakeEffect() {
    const form = $('#loginForm');
    form.addClass('shake');
    
    // Add invalid class to fields for visual feedback
    $('#username, #password').addClass('is-invalid');
    
    setTimeout(() => {
        form.removeClass('shake');
        // Keep invalid class briefly then remove
        setTimeout(() => {
            $('#username, #password').removeClass('is-invalid');
        }, 1000);
    }, 500);
}

/**
 * Show error message
 */
function showErrorMessage(message) {
    hideAllMessages();
    
    const alertHtml = `
        <div class="alert alert-danger alert-dismissible fade show" role="alert">
            <strong>Hata!</strong> ${message}
            <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
        </div>
    `;
    
    $('#alertContainer').html(alertHtml);
    
    // Auto hide after 8 seconds
    setTimeout(() => {
        hideAllMessages();
    }, 8000);
    
    // Scroll to top to ensure alert is visible
    $('html, body').animate({ scrollTop: 0 }, 300);
}

/**
 * Show success message
 */
function showSuccessMessage(message) {
    hideAllMessages();
    
    const alertHtml = `
        <div class="alert alert-success alert-dismissible fade show" role="alert">
            <strong>Başarılı!</strong> ${message}
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
            <strong>Bilgi:</strong> ${message}
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