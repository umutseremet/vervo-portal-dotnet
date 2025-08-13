// Utility Functions for Aslan Group Portal
// src/frontend/assets/js/utils.js

/**
 * Show alert message
 * @param {string} message - Alert message
 * @param {string} type - Alert type (success, danger, warning, info)
 * @param {number} duration - Auto hide duration in milliseconds (default: 5000)
 */
function showAlert(message, type = 'info', duration = 5000) {
    console.log('showAlert called:', message, type);
    
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
    
    // Auto remove after specified duration
    if (duration > 0) {
        setTimeout(() => {
            $('.alert').alert('close');
        }, duration);
    }
    
    // Scroll to top to ensure alert is visible
    $('html, body').animate({ scrollTop: 0 }, 300);
}

/**
 * Get appropriate icon for alert type
 * @param {string} type - Alert type
 * @returns {string} Icon emoji
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
 * Show confirmation dialog
 * @param {string} message - Confirmation message
 * @param {Function} onConfirm - Callback function when confirmed
 * @param {Function} onCancel - Callback function when cancelled
 */
function showConfirm(message, onConfirm, onCancel = null) {
    if (confirm(message)) {
        if (typeof onConfirm === 'function') {
            onConfirm();
        }
    } else {
        if (typeof onCancel === 'function') {
            onCancel();
        }
    }
}

/**
 * Format date for Turkish locale
 * @param {Date|string} date - Date to format
 * @param {boolean} includeTime - Include time in format
 * @returns {string} Formatted date string
 */
function formatDate(date, includeTime = false) {
    if (!date) return 'Belirtilmemiş';
    
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    
    if (isNaN(dateObj.getTime())) {
        return 'Geçersiz tarih';
    }
    
    const options = {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit'
    };
    
    if (includeTime) {
        options.hour = '2-digit';
        options.minute = '2-digit';
    }
    
    return dateObj.toLocaleDateString('tr-TR', options);
}

/**
 * Format number with Turkish locale
 * @param {number} number - Number to format
 * @param {number} decimals - Number of decimal places
 * @returns {string} Formatted number string
 */
function formatNumber(number, decimals = 0) {
    if (isNaN(number)) return '0';
    
    return new Intl.NumberFormat('tr-TR', {
        minimumFractionDigits: decimals,
        maximumFractionDigits: decimals
    }).format(number);
}

/**
 * Debounce function
 * @param {Function} func - Function to debounce
 * @param {number} wait - Wait time in milliseconds
 * @returns {Function} Debounced function
 */
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

/**
 * Throttle function
 * @param {Function} func - Function to throttle
 * @param {number} limit - Limit in milliseconds
 * @returns {Function} Throttled function
 */
function throttle(func, limit) {
    let lastFunc;
    let lastRan;
    return function(...args) {
        if (!lastRan) {
            func.apply(this, args);
            lastRan = Date.now();
        } else {
            clearTimeout(lastFunc);
            lastFunc = setTimeout(() => {
                if ((Date.now() - lastRan) >= limit) {
                    func.apply(this, args);
                    lastRan = Date.now();
                }
            }, limit - (Date.now() - lastRan));
        }
    };
}

/**
 * Validate email format
 * @param {string} email - Email to validate
 * @returns {boolean} Is valid email
 */
function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

/**
 * Validate phone number (Turkish format)
 * @param {string} phone - Phone number to validate
 * @returns {boolean} Is valid phone
 */
function isValidPhone(phone) {
    // Turkish phone number formats: +90 5xx xxx xx xx, 0 5xx xxx xx xx, 5xx xxx xx xx
    const phoneRegex = /^(\+90|0)?[5][0-9]{2}[0-9]{3}[0-9]{2}[0-9]{2}$/;
    const cleanPhone = phone.replace(/\s/g, '');
    return phoneRegex.test(cleanPhone);
}

/**
 * Format phone number for display
 * @param {string} phone - Phone number to format
 * @returns {string} Formatted phone number
 */
function formatPhone(phone) {
    const cleanPhone = phone.replace(/\D/g, '');
    
    if (cleanPhone.length === 10 && cleanPhone.startsWith('5')) {
        // Format: 5xx xxx xx xx
        return cleanPhone.replace(/(\d{3})(\d{3})(\d{2})(\d{2})/, '$1 $2 $3 $4');
    } else if (cleanPhone.length === 11 && cleanPhone.startsWith('05')) {
        // Format: 0 5xx xxx xx xx
        return cleanPhone.replace(/(\d{1})(\d{3})(\d{3})(\d{2})(\d{2})/, '$1 $2 $3 $4 $5');
    } else if (cleanPhone.length === 12 && cleanPhone.startsWith('905')) {
        // Format: +90 5xx xxx xx xx
        return cleanPhone.replace(/(\d{2})(\d{3})(\d{3})(\d{2})(\d{2})/, '+$1 $2 $3 $4 $5');
    }
    
    return phone; // Return original if no format matches
}

/**
 * Get file size in human readable format
 * @param {number} bytes - File size in bytes
 * @returns {string} Human readable file size
 */
function formatFileSize(bytes) {
    if (bytes === 0) return '0 Bytes';
    
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

/**
 * Copy text to clipboard
 * @param {string} text - Text to copy
 * @returns {Promise<boolean>} Success status
 */
async function copyToClipboard(text) {
    try {
        if (navigator.clipboard && window.isSecureContext) {
            await navigator.clipboard.writeText(text);
            return true;
        } else {
            // Fallback for older browsers
            const textArea = document.createElement('textarea');
            textArea.value = text;
            document.body.appendChild(textArea);
            textArea.focus();
            textArea.select();
            
            try {
                const successful = document.execCommand('copy');
                document.body.removeChild(textArea);
                return successful;
            } catch (err) {
                document.body.removeChild(textArea);
                return false;
            }
        }
    } catch (err) {
        console.error('Failed to copy text: ', err);
        return false;
    }
}

/**
 * Generate random string
 * @param {number} length - Length of string
 * @param {string} chars - Characters to use
 * @returns {string} Random string
 */
function generateRandomString(length = 8, chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789') {
    let result = '';
    for (let i = 0; i < length; i++) {
        result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
}

/**
 * Scroll to element smoothly
 * @param {string|Element} element - Element selector or element
 * @param {number} offset - Offset from top
 */
function scrollToElement(element, offset = 0) {
    const targetElement = typeof element === 'string' ? document.querySelector(element) : element;
    
    if (targetElement) {
        const elementPosition = targetElement.getBoundingClientRect().top + window.pageYOffset;
        const offsetPosition = elementPosition - offset;
        
        window.scrollTo({
            top: offsetPosition,
            behavior: 'smooth'
        });
    }
}

/**
 * Check if element is in viewport
 * @param {Element} element - Element to check
 * @returns {boolean} Is in viewport
 */
function isInViewport(element) {
    const rect = element.getBoundingClientRect();
    return (
        rect.top >= 0 &&
        rect.left >= 0 &&
        rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) &&
        rect.right <= (window.innerWidth || document.documentElement.clientWidth)
    );
}

/**
 * Load external script dynamically
 * @param {string} src - Script source URL
 * @returns {Promise} Promise that resolves when script is loaded
 */
function loadScript(src) {
    return new Promise((resolve, reject) => {
        const script = document.createElement('script');
        script.src = src;
        script.onload = resolve;
        script.onerror = reject;
        document.head.appendChild(script);
    });
}

/**
 * Storage helper functions
 */
const storage = {
    /**
     * Set item in localStorage with expiration
     */
    setItem(key, value, expirationMinutes = null) {
        const item = {
            value: value,
            timestamp: Date.now(),
            expiration: expirationMinutes ? Date.now() + (expirationMinutes * 60 * 1000) : null
        };
        
        try {
            localStorage.setItem(key, JSON.stringify(item));
            return true;
        } catch (error) {
            console.error('Error setting localStorage item:', error);
            return false;
        }
    },
    
    /**
     * Get item from localStorage with expiration check
     */
    getItem(key) {
        try {
            const itemStr = localStorage.getItem(key);
            if (!itemStr) return null;
            
            const item = JSON.parse(itemStr);
            
            // Check expiration
            if (item.expiration && Date.now() > item.expiration) {
                localStorage.removeItem(key);
                return null;
            }
            
            return item.value;
        } catch (error) {
            console.error('Error getting localStorage item:', error);
            return null;
        }
    },
    
    /**
     * Remove item from localStorage
     */
    removeItem(key) {
        try {
            localStorage.removeItem(key);
            return true;
        } catch (error) {
            console.error('Error removing localStorage item:', error);
            return false;
        }
    },
    
    /**
     * Clear all expired items
     */
    clearExpired() {
        try {
            const keys = Object.keys(localStorage);
            keys.forEach(key => {
                const itemStr = localStorage.getItem(key);
                if (itemStr) {
                    try {
                        const item = JSON.parse(itemStr);
                        if (item.expiration && Date.now() > item.expiration) {
                            localStorage.removeItem(key);
                        }
                    } catch (e) {
                        // Item is not in our format, ignore
                    }
                }
            });
        } catch (error) {
            console.error('Error clearing expired items:', error);
        }
    }
};

// Make utility functions globally available
window.utils = {
    showAlert,
    getAlertIcon,
    showConfirm,
    formatDate,
    formatNumber,
    debounce,
    throttle,
    isValidEmail,
    isValidPhone,
    formatPhone,
    formatFileSize,
    copyToClipboard,
    generateRandomString,
    scrollToElement,
    isInViewport,
    loadScript,
    storage
};

// Initialize utility functions on page load
$(document).ready(function() {
    // Clear expired localStorage items
    storage.clearExpired();
    
    console.log('Utils.js loaded successfully');
});