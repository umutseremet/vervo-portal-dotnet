// src/frontend/assets/js/auth.js
// Complete Authentication Service for Vervo Portal - DEBUG MODE İLE GÜNCELLENMİŞ

(function() {
    'use strict';

    // Auth service object
    const authService = {
        // Storage keys
        TOKEN_KEY: 'authToken',
        USER_KEY: 'user',
        REFRESH_TOKEN_KEY: 'refreshToken',
        EXPIRES_KEY: 'tokenExpires',

        // API endpoints (will use config if available)
        endpoints: {
            login: '/auth/login',
            logout: '/auth/logout',
            refresh: '/auth/refresh',
            verify: '/auth/verify'
        },

        // Initialize auth service
        init() {
            this.setupAxiosInterceptors();
            this.startTokenRefreshTimer();
            this.log('Auth service initialized');
        },

        // Check if user is authenticated - DEBUG MODE İLE GÜNCELLENMİŞ
        isAuthenticated() {
            try {
                // Development modunda auth kontrolünü esnek yap
                if (window.APP_CONFIG && window.APP_CONFIG.DEBUG_MODE) {
                    this.log('Debug mode: Auth check bypassed for development');
                    // Debug modunda token ve user var mı sadece kontrol et
                    const token = this.getToken();
                    const user = this.getUser();
                    
                    // Eğer hiç auth data yoksa fake data oluştur
                    if (!token || !user) {
                        this.createDevelopmentAuth();
                        return true;
                    }
                    return true; // Debug modunda her zaman authenticated
                }

                const token = this.getToken();
                const user = this.getUser();
                
                if (!token || !user) {
                    this.log('No token or user found');
                    return false;
                }

                // Check if token is expired
                if (this.isTokenExpired()) {
                    this.log('Token is expired');
                    this.logout();
                    return false;
                }

                return true;
            } catch (error) {
                this.log('Auth check error:', error);
                // Debug modunda hata olsa bile true döndür
                if (window.APP_CONFIG && window.APP_CONFIG.DEBUG_MODE) {
                    this.createDevelopmentAuth();
                    return true;
                }
                return false;
            }
        },

        // Development için fake auth data oluştur - YENİ METOD
        createDevelopmentAuth() {
            try {
                const fakeToken = 'dev.fake.token.' + Date.now();
                const fakeUser = {
                    id: 'dev-user-1',
                    name: 'Development User',
                    fullname: 'Development User',
                    firstName: 'Development',
                    lastName: 'User',
                    email: 'dev@example.com',
                    roles: ['user', 'admin'],
                    permissions: ['read', 'write']
                };

                localStorage.setItem(this.TOKEN_KEY, fakeToken);
                localStorage.setItem(this.USER_KEY, JSON.stringify(fakeUser));
                
                // 1 saatlik expiration
                const expiresAt = Math.floor(Date.now() / 1000) + 3600;
                localStorage.setItem(this.EXPIRES_KEY, expiresAt.toString());
                
                this.log('Development auth data created');
            } catch (error) {
                this.log('Create development auth error:', error);
            }
        },

        // Get current user
        getCurrentUser() {
            try {
                const userStr = localStorage.getItem(this.USER_KEY);
                return userStr ? JSON.parse(userStr) : null;
            } catch (error) {
                this.log('Get user error:', error);
                return null;
            }
        },

        // Get user alias for getCurrentUser
        getUser() {
            return this.getCurrentUser();
        },

        // Get auth token
        getToken() {
            try {
                return localStorage.getItem(this.TOKEN_KEY);
            } catch (error) {
                this.log('Get token error:', error);
                return null;
            }
        },

        // Get refresh token
        getRefreshToken() {
            try {
                return localStorage.getItem(this.REFRESH_TOKEN_KEY);
            } catch (error) {
                this.log('Get refresh token error:', error);
                return null;
            }
        },

        // Check if token is expired
        isTokenExpired() {
            try {
                const token = this.getToken();
                if (!token) return true;

                // Check stored expiration time first
                const expiresAt = localStorage.getItem(this.EXPIRES_KEY);
                if (expiresAt) {
                    const currentTime = Math.floor(Date.now() / 1000);
                    return parseInt(expiresAt) <= currentTime;
                }

                // Parse JWT token
                const tokenData = this.parseJWT(token);
                if (tokenData && tokenData.exp) {
                    const currentTime = Math.floor(Date.now() / 1000);
                    // Add 5 minute buffer before expiration
                    return tokenData.exp <= (currentTime + 300);
                }

                return false;
            } catch (error) {
                this.log('Token expiration check error:', error);
                return true;
            }
        },

        // Parse JWT token
        parseJWT(token) {
            try {
                const base64Url = token.split('.')[1];
                const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
                const jsonPayload = decodeURIComponent(
                    atob(base64).split('').map(function(c) {
                        return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
                    }).join('')
                );
                return JSON.parse(jsonPayload);
            } catch (error) {
                this.log('JWT parse error:', error);
                return null;
            }
        },

        // Login function
        async login(credentials) {
            try {
                const apiUrl = this.getApiUrl(this.endpoints.login);
                
                const response = await fetch(apiUrl, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(credentials)
                });

                if (!response.ok) {
                    const errorData = await response.json().catch(() => ({}));
                    throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
                }

                const data = await response.json();
                
                if (data.token && data.user) {
                    this.storeAuthData(data);
                    this.log('Login successful');
                    return { success: true, data };
                } else {
                    throw new Error('Invalid response format');
                }
            } catch (error) {
                this.log('Login error:', error);
                return { success: false, error: error.message };
            }
        },

        // Logout function
        logout(skipApiCall = false) {
            try {
                // Call logout API if not skipping
                if (!skipApiCall) {
                    this.callLogoutAPI().catch(error => {
                        this.log('Logout API error (ignored):', error);
                    });
                }

                // Clear local storage
                this.clearAuthData();
                
                // Stop refresh timer
                this.stopTokenRefreshTimer();
                
                this.log('Logout completed');
                
                // Redirect to login page
                this.redirectToLogin();
            } catch (error) {
                this.log('Logout error:', error);
                // Force redirect even if logout fails
                this.redirectToLogin();
            }
        },

        // Call logout API
        async callLogoutAPI() {
            try {
                const token = this.getToken();
                if (!token) return;

                const apiUrl = this.getApiUrl(this.endpoints.logout);
                
                await fetch(apiUrl, {
                    method: 'POST',
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    }
                });
            } catch (error) {
                this.log('Logout API call error:', error);
            }
        },

        // Store authentication data
        storeAuthData(data) {
            try {
                // Store token
                if (data.token) {
                    localStorage.setItem(this.TOKEN_KEY, data.token);
                }

                // Store user
                if (data.user) {
                    localStorage.setItem(this.USER_KEY, JSON.stringify(data.user));
                }

                // Store refresh token
                if (data.refreshToken) {
                    localStorage.setItem(this.REFRESH_TOKEN_KEY, data.refreshToken);
                }

                // Store expiration time
                if (data.expiresIn) {
                    const expiresAt = Math.floor(Date.now() / 1000) + data.expiresIn;
                    localStorage.setItem(this.EXPIRES_KEY, expiresAt.toString());
                } else if (data.token) {
                    // Try to get expiration from token
                    const tokenData = this.parseJWT(data.token);
                    if (tokenData && tokenData.exp) {
                        localStorage.setItem(this.EXPIRES_KEY, tokenData.exp.toString());
                    }
                }

                // Start refresh timer
                this.startTokenRefreshTimer();
            } catch (error) {
                this.log('Store auth data error:', error);
            }
        },

        // Clear authentication data
        clearAuthData() {
            try {
                localStorage.removeItem(this.TOKEN_KEY);
                localStorage.removeItem(this.USER_KEY);
                localStorage.removeItem(this.REFRESH_TOKEN_KEY);
                localStorage.removeItem(this.EXPIRES_KEY);
            } catch (error) {
                this.log('Clear auth data error:', error);
            }
        },

        // Get authorization header for API requests
        getAuthHeader() {
            const token = this.getToken();
            return token ? { 'Authorization': `Bearer ${token}` } : {};
        },

        // Get all headers including auth
        getHeaders() {
            return {
                'Content-Type': 'application/json',
                ...this.getAuthHeader()
            };
        },

        // Refresh token
        async refreshToken() {
            try {
                const refreshToken = this.getRefreshToken();
                if (!refreshToken) {
                    throw new Error('No refresh token available');
                }

                const apiUrl = this.getApiUrl(this.endpoints.refresh);
                
                const response = await fetch(apiUrl, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({ refreshToken })
                });

                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }

                const data = await response.json();
                
                if (data.token) {
                    this.storeAuthData(data);
                    this.log('Token refreshed successfully');
                    return true;
                } else {
                    throw new Error('Invalid refresh response');
                }
            } catch (error) {
                this.log('Token refresh error:', error);
                this.logout(true); // Skip API call since refresh failed
                return false;
            }
        },

        // Start token refresh timer
        startTokenRefreshTimer() {
            this.stopTokenRefreshTimer(); // Clear existing timer

            const checkInterval = 60000; // Check every minute
            
            this.refreshTimer = setInterval(() => {
                if (this.isAuthenticated()) {
                    const expiresAt = localStorage.getItem(this.EXPIRES_KEY);
                    if (expiresAt) {
                        const currentTime = Math.floor(Date.now() / 1000);
                        const timeUntilExpiry = parseInt(expiresAt) - currentTime;
                        
                        // Refresh if token expires in less than 10 minutes
                        if (timeUntilExpiry < 600 && timeUntilExpiry > 0) {
                            this.log('Token expiring soon, refreshing...');
                            this.refreshToken();
                        }
                    }
                }
            }, checkInterval);
        },

        // Stop token refresh timer
        stopTokenRefreshTimer() {
            if (this.refreshTimer) {
                clearInterval(this.refreshTimer);
                this.refreshTimer = null;
            }
        },

        // Setup axios interceptors (if axios is available)
        setupAxiosInterceptors() {
            if (typeof axios !== 'undefined') {
                // Request interceptor
                axios.interceptors.request.use(
                    (config) => {
                        const token = this.getToken();
                        if (token) {
                            config.headers.Authorization = `Bearer ${token}`;
                        }
                        return config;
                    },
                    (error) => {
                        return Promise.reject(error);
                    }
                );

                // Response interceptor
                axios.interceptors.response.use(
                    (response) => {
                        return response;
                    },
                    async (error) => {
                        if (error.response && error.response.status === 401) {
                            this.log('401 Unauthorized - logging out');
                            this.logout();
                        }
                        return Promise.reject(error);
                    }
                );
            }
        },

        // Get API URL
        getApiUrl(endpoint) {
            const baseUrl = (window.APP_CONFIG && window.APP_CONFIG.API_BASE_URL) || 
                           window.API_BASE_URL || 
                           'http://localhost:5000/api';
            return baseUrl + endpoint;
        },

        // Redirect to login page - DEBUG MODE İLE GÜNCELLENMİŞ
        redirectToLogin() {
            // Development modunda redirect yapma
            if (window.APP_CONFIG && window.APP_CONFIG.DEBUG_MODE) {
                this.log('Debug mode: Login redirect prevented');
                return;
            }

            const currentPath = window.location.pathname;
            
            // Don't redirect if already on login page
            if (currentPath.includes('index.html') || currentPath.endsWith('/')) {
                return;
            }

            // Determine login page path
            let loginPath = '../index.html';
            if (currentPath.includes('/pages/')) {
                loginPath = '../index.html';
            } else if (currentPath.includes('/src/frontend/')) {
                loginPath = './index.html';
            }

            this.log('Redirecting to login:', loginPath);
            setTimeout(() => {
                window.location.href = loginPath;
            }, 100);
        },

        // Verify token with server
        async verifyToken() {
            try {
                const token = this.getToken();
                if (!token) return false;

                const apiUrl = this.getApiUrl(this.endpoints.verify);
                
                const response = await fetch(apiUrl, {
                    method: 'POST',
                    headers: this.getHeaders()
                });

                return response.ok;
            } catch (error) {
                this.log('Token verification error:', error);
                return false;
            }
        },

        // Update user profile
        updateUser(userData) {
            try {
                const currentUser = this.getCurrentUser();
                if (currentUser) {
                    const updatedUser = { ...currentUser, ...userData };
                    localStorage.setItem(this.USER_KEY, JSON.stringify(updatedUser));
                    this.log('User profile updated');
                    return true;
                }
                return false;
            } catch (error) {
                this.log('Update user error:', error);
                return false;
            }
        },

        // Check if user has specific role
        hasRole(role) {
            const user = this.getCurrentUser();
            return user && user.roles && user.roles.includes(role);
        },

        // Check if user has specific permission
        hasPermission(permission) {
            const user = this.getCurrentUser();
            return user && user.permissions && user.permissions.includes(permission);
        },

        // Logging function
        log(message, data = null) {
            if (window.debugLog) {
                window.debugLog(`[AUTH] ${message}`, data);
            } else if (window.APP_CONFIG && window.APP_CONFIG.DEBUG_MODE) {
                console.log(`[AUTH] ${message}`, data || '');
            }
        }
    };

    // Initialize auth service
    authService.init();

    // Add to global scope
    window.authService = authService;

    // Backward compatibility - add individual functions to global scope
    window.isAuthenticated = authService.isAuthenticated.bind(authService);
    window.getCurrentUser = authService.getCurrentUser.bind(authService);
    window.getToken = authService.getToken.bind(authService);
    window.logout = authService.logout.bind(authService);
    window.getAuthHeader = authService.getAuthHeader.bind(authService);
    window.getHeaders = authService.getHeaders.bind(authService);

    // Page visibility change listener - refresh token when page becomes visible
    document.addEventListener('visibilitychange', function() {
        if (!document.hidden && authService.isAuthenticated()) {
            // Check if token needs refresh when page becomes visible
            setTimeout(() => {
                if (authService.isTokenExpired()) {
                    authService.refreshToken();
                }
            }, 1000);
        }
    });

    // Storage event listener - sync logout across tabs
    window.addEventListener('storage', function(e) {
        if (e.key === authService.TOKEN_KEY && !e.newValue) {
            // Token was removed in another tab, logout this tab too
            authService.logout(true); // Skip API call
        }
    });

})();