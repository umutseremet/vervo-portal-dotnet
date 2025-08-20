// src/frontend/assets/js/alert.js
// Alert sistemi için JavaScript fonksiyonları - TAMAMI

(function() {
    'use strict';

    // Alert sistemi
    const AlertSystem = {
        // Alert container'ı kontrol et
        ensureContainer() {
            let container = document.getElementById('alertContainer');
            if (!container) {
                // Container yoksa oluştur
                container = document.createElement('div');
                container.id = 'alertContainer';
                container.style.cssText = `
                    position: fixed;
                    top: 80px;
                    left: 50%;
                    transform: translateX(-50%);
                    z-index: 1050;
                    width: 90%;
                    max-width: 500px;
                    pointer-events: none;
                `;
                document.body.appendChild(container);
            }
            return container;
        },

        // Alert göster
        show(message, type = 'info', duration = 5000) {
            const container = this.ensureContainer();
            
            // Alert ID oluştur
            const alertId = 'alert-' + Date.now() + '-' + Math.random().toString(36).substr(2, 9);

            // Alert HTML'i oluştur
            const alertHTML = `
                <div class="alert alert-${type} alert-dismissible fade show mb-2" role="alert" id="${alertId}" style="pointer-events: auto; box-shadow: 0 4px 12px rgba(0,0,0,0.15);">
                    <i class="fas fa-${this.getIcon(type)} me-2"></i>
                    ${message}
                    <button type="button" class="btn-close" onclick="AlertSystem.close('${alertId}')" aria-label="Close"></button>
                </div>
            `;

            // Alert'i container'a ekle
            container.insertAdjacentHTML('beforeend', alertHTML);

            // Animation için timeout
            const alertElement = document.getElementById(alertId);
            if (alertElement) {
                // Fade in effect
                setTimeout(() => {
                    alertElement.style.opacity = '1';
                }, 10);

                // Otomatik kaldırma
                if (duration > 0) {
                    setTimeout(() => {
                        this.close(alertId);
                    }, duration);
                }
            }

            return alertId;
        },

        // Alert kapat
        close(alertId) {
            const alertElement = document.getElementById(alertId);
            if (alertElement) {
                // Fade out effect
                alertElement.style.opacity = '0';
                alertElement.style.transform = 'translateY(-10px)';
                
                setTimeout(() => {
                    if (alertElement.parentNode) {
                        alertElement.parentNode.removeChild(alertElement);
                    }
                }, 300);
            }
        },

        // Alert icon'unu belirle
        getIcon(type) {
            const icons = {
                'success': 'check-circle',
                'danger': 'exclamation-triangle',
                'error': 'exclamation-triangle',
                'warning': 'exclamation-circle',
                'info': 'info-circle',
                'primary': 'info-circle',
                'secondary': 'info-circle'
            };
            return icons[type] || 'info-circle';
        },

        // Tüm alert'leri temizle
        clearAll() {
            const container = document.getElementById('alertContainer');
            if (container) {
                // Tüm alert'leri fade out ile kaldır
                const alerts = container.querySelectorAll('.alert');
                alerts.forEach(alert => {
                    alert.style.opacity = '0';
                    alert.style.transform = 'translateY(-10px)';
                });
                
                setTimeout(() => {
                    container.innerHTML = '';
                }, 300);
            }
        }
    };

    // Global alert fonksiyonları
    window.showAlert = function(message, type = 'info', duration = 5000) {
        return AlertSystem.show(message, type, duration);
    };

    window.showSuccess = function(message, duration = 5000) {
        return AlertSystem.show(message, 'success', duration);
    };

    window.showError = function(message, duration = 8000) {
        return AlertSystem.show(message, 'danger', duration);
    };

    window.showWarning = function(message, duration = 6000) {
        return AlertSystem.show(message, 'warning', duration);
    };

    window.showInfo = function(message, duration = 5000) {
        return AlertSystem.show(message, 'info', duration);
    };

    window.clearAllAlerts = function() {
        return AlertSystem.clearAll();
    };

    // Alert sistemi global olarak erişilebilir
    window.AlertSystem = AlertSystem;

    // Bootstrap alert'leri için event listener
    document.addEventListener('click', function(e) {
        if (e.target.classList.contains('btn-close')) {
            const alert = e.target.closest('.alert');
            if (alert && alert.id) {
                AlertSystem.close(alert.id);
            }
        }
    });

    // CSS styles ekleme (eğer yoksa)
    function addAlertStyles() {
        if (!document.getElementById('alert-styles')) {
            const style = document.createElement('style');
            style.id = 'alert-styles';
            style.textContent = `
                .alert {
                    transition: all 0.3s ease;
                    opacity: 0;
                    transform: translateY(-10px);
                }
                
                .alert.show {
                    opacity: 1;
                    transform: translateY(0);
                }
                
                .alert .btn-close {
                    opacity: 0.7;
                }
                
                .alert .btn-close:hover {
                    opacity: 1;
                }
                
                #alertContainer .alert {
                    margin-bottom: 0.5rem;
                }
                
                #alertContainer .alert:last-child {
                    margin-bottom: 0;
                }
            `;
            document.head.appendChild(style);
        }
    }

    // Sayfa yüklendiğinde styles'ı ekle
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', addAlertStyles);
    } else {
        addAlertStyles();
    }

    console.log('✅ Alert system initialized');

})();