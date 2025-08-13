// Login page functionality
$(document).ready(function() {
    initializeLoginPage();
    setupFormValidation();
    setupEventHandlers();
});

/**
 * Initialize login page
 */
function initializeLoginPage() {
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
    
    // Password visibility toggle (if needed in future)
    // setupPasswordToggle();
}

/**
 * Handle login form submission
 */
async function handleLoginSubmit(e) {
    e.preventDefault();
    
    // Get form data
    const formData = getFormData();
    
    // Validate form
    if (!validateForm(formData)) {
        return;
    }
    
    // Show loading state
    setLoadingState(true);
    
    try {
        // Attempt login
        const response = await authService.login(formData.username, formData.password);
        
        // Handle remember me
        if (formData.rememberMe) {
            authService.rememberUser(formData.username);
        } else {
            authService.clearRememberedUser();
        }
        
        // Show success message
        showSuccessMessage('Giriş başarılı! Yönlendiriliyorsunuz...');
        
        // Store login analytics (optional)
        storeLoginAnalytics(response.user);
        
        // Redirect after short delay
        setTimeout(() => {
            authService.redirectAfterLogin();
        }, 1500);
        
    } catch (error) {
        console.error('Login failed:', error);
        
        // Show error message
        showErrorMessage(error.message || 'Giriş işlemi başarısız oldu.');
        
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
 * Validate username field
 */
function validateUsername() {
    const username = $('#username').val().trim();
    const field = $('#username');
    
    if (!username) {
        setFieldValidation(field, false, 'Kullanıcı adı gereklidir');
        return false;
    } else if (username.length < 2) {
        setFieldValidation(field, false, 'Kullanıcı adı en az 2 karakter olmalıdır');
        return false;
    } else {
        setFieldValidation(field, true);
        return true;
    }
}

/**
 * Validate password field
 */
function validatePassword() {
    const password = $('#password').val();
    const field = $('#password');
    
    if (!password) {
        setFieldValidation(field, false, 'Şifre gereklidir');
        return false;
    } else if (password.length < 3) {
        setFieldValidation(field, false, 'Şifre en az 3 karakter olmalıdır');
        return false;
    } else {
        setFieldValidation(field, true);
        return true;
    }
}

/**
 * Set field validation state
 */
function setFieldValidation(field, isValid, message = '') {
    field.removeClass('is-valid is-invalid');
    
    if (isValid) {
        field.addClass('is-valid');
    } else {
        field.addClass('is-invalid');
        if (message) {
            // You can add invalid feedback div here if needed
            console.warn('Validation error:', message);
        }
    }
}

/**
 * Show field-specific error
 */
function showFieldError(fieldId, message) {
    const field = $(`#${fieldId}`);
    setFieldValidation(field, false, message);
}

/**
 * Clear field validation
 */
function clearFieldValidation(field) {
    field.removeClass('is-valid is-invalid');
}

/**
 * Clear all validation states
 */
function clearAllValidation() {
    $('#username, #password').removeClass('is-valid is-invalid');
}

/**
 * Handle remember me change
 */
function handleRememberMeChange() {
    const isChecked = $('#rememberMe').is(':checked');
    const username = $('#username').val().trim();
    
    if (isChecked && username) {
        authService.rememberUser(username);
    } else if (!isChecked) {
        authService.clearRememberedUser();
    }
}

/**
 * Load remembered user
 */
function loadRememberedUser() {
    const rememberedUser = authService.getRememberedUser();
    if (rememberedUser) {
        $('#username').val(rememberedUser);
        $('#rememberMe').prop('checked', true);
        $('#password').focus(); // Focus password field if username is pre-filled
    }
}

/**
 * Setup input focus effects
 */
function setupInputFocusEffects() {
    $('.form-floating .form-control').on('focus', function() {
        $(this).closest('.form-floating').addClass('focused');
    }).on('blur', function() {
        $(this).closest('.form-floating').removeClass('focused');
    });
}

/**
 * Set loading state for form
 */
function setLoadingState(isLoading) {
    const loginBtn = $('#loginBtn');
    const spinner = loginBtn.find('.spinner-border');
    const btnText = loginBtn.find('.btn-text');
    const form = $('#loginForm');
    
    if (isLoading) {
        loginBtn.addClass('btn-loading').prop('disabled', true);
        spinner.removeClass('d-none');
        btnText.text('Giriş yapılıyor...');
        form.addClass('loading');
        
        // Disable form inputs
        $('#username, #password, #rememberMe').prop('disabled', true);
    } else {
        loginBtn.removeClass('btn-loading').prop('disabled', false);
        spinner.addClass('d-none');
        btnText.text('Giriş Yap');
        form.removeClass('loading');
        
        // Re-enable form inputs
        $('#username, #password, #rememberMe').prop('disabled', false);
    }
}

/**
 * Add shake effect to form for errors
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
    
    // Auto hide after 5 seconds
    setTimeout(() => {
        hideAllMessages();
    }, 5000);
    
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
            userId: user.id,
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

/**
 * Setup password visibility toggle (future enhancement)
 */
function setupPasswordToggle() {
    const passwordField = $('#password');
    const toggleButton = $('<button type="button" class="password-toggle">👁️</button>');
    
    // Add toggle button to password field container
    passwordField.parent().append(toggleButton);
    
    toggleButton.on('click', function() {
        const type = passwordField.attr('type') === 'password' ? 'text' : 'password';
        passwordField.attr('type', type);
        $(this).text(type === 'password' ? '👁️' : '🙈');
    });
}

/**
 * Handle keyboard shortcuts
 */
$(document).on('keydown', function(e) {
    // Ctrl+Enter or Cmd+Enter to submit form
    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
        e.preventDefault();
        $('#loginForm').submit();
    }
    
    // Escape key to clear form
    if (e.key === 'Escape') {
        clearForm();
        hideAllMessages();
    }
});

/**
 * Clear form data
 */
function clearForm() {
    $('#username, #password').val('');
    $('#rememberMe').prop('checked', false);
    clearAllValidation();
    $('#username').focus();
}

/**
 * Detect caps lock status
 */
$('#password').on('keypress', function(e) {
    // Simple caps lock detection
    const char = String.fromCharCode(e.which);
    if (char.toUpperCase() === char && char.toLowerCase() !== char && !e.shiftKey) {
        // Caps lock might be on
        if (!$('#capsLockWarning').length) {
            const warning = $('<small id="capsLockWarning" class="text-warning">⚠️ Caps Lock açık olabilir</small>');
            $(this).parent().append(warning);
            
            setTimeout(() => {
                warning.fadeOut(() => warning.remove());
            }, 3000);
        }
    }
});

/**
 * Auto-save form data (except password) for user convenience
 */
function autoSaveFormData() {
    $('#username').on('input', function() {
        const username = $(this).val().trim();
        if (username) {
            sessionStorage.setItem('vervo_temp_username', username);
        } else {
            sessionStorage.removeItem('vervo_temp_username');
        }
    });
}

/**
 * Restore temporary form data
 */
function restoreTemporaryData() {
    const tempUsername = sessionStorage.getItem('vervo_temp_username');
    if (tempUsername && !$('#username').val()) {
        $('#username').val(tempUsername);
    }
}

// Initialize auto-save and restore functionality
$(document).ready(function() {
    autoSaveFormData();
    restoreTemporaryData();
});

// Clean up temporary data on successful login
$(window).on('beforeunload', function() {
    // Clean up temporary data when leaving page
    sessionStorage.removeItem('vervo_temp_username');
});

// Export functions for testing or external use
window.loginPageUtils = {
    validateForm,
    validateUsername,
    validatePassword,
    showErrorMessage,
    showSuccessMessage,
    showInfoMessage,
    hideAllMessages,
    clearForm,
    setLoadingState
};