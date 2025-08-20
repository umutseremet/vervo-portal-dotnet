/**
 * YENİ DOSYA - TAMAMEN EKLENEN
 * Sidebar Module - Merkezi sidebar yönetimi
 * Path: src/frontend/assets/js/sidebar-module.js
 */

window.SidebarModule = (function() {
    'use strict';
    
    let isInitialized = false;
    let sidebar = null;
    let overlay = null;
    let sidebarToggle = null;
    let sidebarClose = null;
    
    function init() {
        if (isInitialized) {
            console.log('🔄 Sidebar already initialized, skipping...');
            return true;
        }
        
        console.log('🚀 *** SIDEBAR MODULE INIT ***');
        
        sidebar = document.getElementById('mobileSidebar');
        overlay = document.getElementById('sidebarOverlay');
        sidebarToggle = document.getElementById('sidebarToggle');
        sidebarClose = document.getElementById('sidebarClose');
        
        if (!validateElements()) {
            console.error('❌ Required sidebar elements not found');
            return false;
        }
        
        setupEventListeners();
        ensureRequiredClasses();
        
        isInitialized = true;
        console.log('✅ Sidebar module initialized successfully');
        return true;
    }
    
    function validateElements() {
        const elements = { sidebar, overlay, sidebarToggle };
        let isValid = true;
        
        for (const [name, element] of Object.entries(elements)) {
            if (!element) {
                console.error(`❌ ${name} element not found`);
                isValid = false;
            }
        }
        return isValid;
    }
    
    function ensureRequiredClasses() {
        if (sidebar && !sidebar.classList.contains('sidebar')) {
            sidebar.classList.add('sidebar');
        }
        if (overlay && !overlay.classList.contains('sidebar-overlay')) {
            overlay.classList.add('sidebar-overlay');
        }
    }
    
    function setupEventListeners() {
        removeExistingListeners();
        
        if (sidebarToggle) {
            sidebarToggle.addEventListener('click', handleToggleClick);
        }
        
        if (sidebarClose) {
            sidebarClose.addEventListener('click', handleCloseClick);
        }
        
        if (overlay) {
            overlay.addEventListener('click', handleOverlayClick);
        }
        
        document.addEventListener('keydown', handleEscapeKey);
    }
    
    function removeExistingListeners() {
        if (sidebarToggle) {
            const newToggle = sidebarToggle.cloneNode(true);
            sidebarToggle.parentNode.replaceChild(newToggle, sidebarToggle);
            sidebarToggle = newToggle;
        }
        
        if (sidebarClose) {
            const newClose = sidebarClose.cloneNode(true);
            sidebarClose.parentNode.replaceChild(newClose, sidebarClose);
            sidebarClose = newClose;
        }
    }
    
    function handleToggleClick(e) {
        e.preventDefault();
        e.stopPropagation();
        console.log('🔘 *** HAMBURGER MENU CLICKED ***');
        
        const isOpen = sidebar.classList.contains('show');
        if (isOpen) {
            closeSidebar();
        } else {
            openSidebar();
        }
    }
    
    function handleCloseClick(e) {
        e.preventDefault();
        e.stopPropagation();
        console.log('❌ *** CLOSE BUTTON CLICKED ***');
        closeSidebar();
    }
    
    function handleOverlayClick(e) {
        e.preventDefault();
        console.log('🎯 *** OVERLAY CLICKED ***');
        closeSidebar();
    }
    
    function handleEscapeKey(e) {
        if (e.key === 'Escape' && sidebar && sidebar.classList.contains('show')) {
            console.log('⌨️ *** ESCAPE KEY PRESSED ***');
            closeSidebar();
        }
    }
    
    function openSidebar() {
        if (!sidebar || !overlay) return;
        
        console.log('📂 *** OPENING SIDEBAR ***');
        
        sidebar.classList.add('show');
        overlay.classList.add('show');
        document.body.classList.add('sidebar-open');
        document.body.style.overflow = 'hidden';
        
        console.log('✅ Sidebar opened');
    }
    
    function closeSidebar() {
        if (!sidebar || !overlay) return;
        
        console.log('📁 *** CLOSING SIDEBAR ***');
        
        sidebar.classList.remove('show');
        overlay.classList.remove('show');
        document.body.classList.remove('sidebar-open');
        document.body.style.overflow = '';
        
        console.log('✅ Sidebar closed');
    }
    
    function toggleSidebar() {
        if (!sidebar) return;
        
        const isOpen = sidebar.classList.contains('show');
        if (isOpen) {
            closeSidebar();
        } else {
            openSidebar();
        }
    }
    
    function isOpen() {
        return sidebar && sidebar.classList.contains('show');
    }
    
    // Auto-initialize
    function autoInit() {
        const sidebar = document.getElementById('mobileSidebar');
        const overlay = document.getElementById('sidebarOverlay');
        const toggle = document.getElementById('sidebarToggle');
        
        if (!sidebar || !overlay || !toggle) {
            setTimeout(autoInit, 100);
            return;
        }
        
        const success = init();
        
        if (success) {
            window.openSidebar = openSidebar;
            window.closeSidebar = closeSidebar;
            window.toggleSidebar = toggleSidebar;
        }
    }
    
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', autoInit);
    } else {
        autoInit();
    }
    
    return {
        init,
        open: openSidebar,
        close: closeSidebar,
        toggle: toggleSidebar,
        isOpen
    };
})();

console.log('📝 Sidebar module script loaded');