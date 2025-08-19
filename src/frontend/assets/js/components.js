// Component Loader - src/frontend/assets/js/components.js
// Header ve Footer component'lerini yükler

/**
 * Component'leri yükle
 */
async function loadComponents() {
    console.log('🔄 Loading components...');
    
    try {
        // Header yükle
        await loadHeader();
        
        // Footer yükle (varsa)
        await loadFooter();
        
        console.log('✅ All components loaded successfully');
        return true;
        
    } catch (error) {
        console.error('❌ Component loading failed:', error);
        throw error;
    }
}

/**
 * Header component'ini yükle
 */
async function loadHeader() {
    try {
        console.log('📥 Loading header component...');
        
        const response = await fetch('../components/header.html');
        if (!response.ok) {
            throw new Error(`Header fetch failed: ${response.status}`);
        }
        
        const html = await response.text();
        const headerContainer = document.getElementById('headerContainer');
        
        if (!headerContainer) {
            throw new Error('headerContainer element not found');
        }
        
        headerContainer.innerHTML = html;
        console.log('✅ Header HTML loaded successfully');
        
        // Script'lerin execute edilmesini bekle
        await new Promise(resolve => setTimeout(resolve, 100));
        
        // Header'ı initialize et
        if (typeof window.initializeHeader === 'function') {
            console.log('🔧 Initializing header...');
            window.initializeHeader();
        } else {
            console.warn('⚠️ initializeHeader function not found');
        }
        
        return true;
        
    } catch (error) {
        console.error('❌ Header loading failed:', error);
        throw error;
    }
}

/**
 * Footer component'ini yükle
 */
async function loadFooter() {
    try {
        console.log('📥 Loading footer component...');
        
        const footerContainer = document.getElementById('footerContainer');
        if (!footerContainer) {
            console.log('ℹ️ Footer container not found, skipping...');
            return true;
        }
        
        const response = await fetch('../components/footer.html');
        if (!response.ok) {
            console.warn('⚠️ Footer fetch failed:', response.status);
            return true; // Footer optional
        }
        
        const html = await response.text();
        footerContainer.innerHTML = html;
        console.log('✅ Footer loaded successfully');
        
        return true;
        
    } catch (error) {
        console.warn('⚠️ Footer loading failed:', error);
        return true; // Footer optional, don't fail
    }
}

/**
 * Component yükleme durumunu kontrol et
 */
function checkComponentsLoaded() {
    const headerLoaded = document.getElementById('headerContainer')?.innerHTML.trim().length > 0;
    const footerLoaded = document.getElementById('footerContainer')?.innerHTML.trim().length > 0;
    
    console.log('Component status:', {
        header: headerLoaded ? '✅' : '❌',
        footer: footerLoaded ? '✅' : '⚠️'
    });
    
    return headerLoaded;
}

// Global export
window.loadComponents = loadComponents;
window.loadHeader = loadHeader;
window.loadFooter = loadFooter;
window.checkComponentsLoaded = checkComponentsLoaded;

console.log('✅ Components.js loaded successfully');