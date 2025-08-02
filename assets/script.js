/**
 * @file script.js
 * @description Main script for the website.
 * Handles dynamic content loading from all CMS sources (settings, home, products, gallery),
 * after the build script aggregates folder collections.
 * @version 5.0.0
 */

document.addEventListener('DOMContentLoaded', function() {
    
    // --- GLOBAL VARIABLES --- //
    const htmlEl = document.documentElement;
    const body = document.body;
    const languageSwitchBtn = document.getElementById('languageSwitch');
    const menuBtn = document.getElementById('menuBtn');
    const mobileMenu = document.getElementById('mobileMenu');
    const galleryContainer = document.querySelector('.gallery-container');
    const productsContainer = document.getElementById('featured-products-container');

    // State
    let siteSettings = {};
    let homeContent = {};
    let productsData = [];
    let galleryData = [];
    let currentLang = localStorage.getItem('preferredLanguage') || 'fr';

    // --- INITIALIZATION --- //
    async function initializeApp() {
        try {
            [siteSettings, homeContent, productsData, galleryData] = await Promise.all([
                fetchData('/content/data/settings.yml', 'yaml'),
                fetchData('/content/data/home.yml', 'yaml'),
                fetchData('/assets/data/products.json', 'json'),
                fetchData('/assets/data/gallery.json', 'json')
            ]);
        } catch (error) {
            console.error("Fatal Error: Could not load site content.", error);
        } finally {
            setupEventListeners();
            setLanguage(currentLang);
        }
    }

    // --- DATA FETCHING --- //
    async function fetchData(url, type = 'json') {
        try {
            // Add a cache-busting query parameter to avoid stale data
            const response = await fetch(`${url}?v=${new Date().getTime()}`);
            if (!response.ok) {
                throw new Error(`Network response was not ok: ${response.statusText} for URL: ${url}`);
            }
            if (type === 'yaml') {
                const yamlText = await response.text();
                return jsyaml.load(yamlText);
            }
            return await response.json();
        } catch (error) {
            console.error(`Failed to fetch or parse ${type.toUpperCase()} from ${url}:`, error);
            return type === 'yaml' ? {} : []; // Return default empty value
        }
    }

    // --- DYNAMIC CONTENT & RENDERING --- //
    function populateContent(lang) {
        if (!siteSettings || !homeContent) return;

        const updateText = (id, value) => { const el = document.getElementById(id); if (el) el.textContent = value || ''; };
        const updateHTML = (id, value) => { const el = document.getElementById(id); if (el) el.innerHTML = value || ''; };
        const updateSrc = (id, value) => { const el = document.getElementById(id); if (el) el.src = value || ''; };
        const updateHref = (id, value) => { const el = document.getElementById(id); if (el) el.href = value || '#'; };
        const updateAction = (id, value) => { const el = document.getElementById(id); if(el) el.action = value || ''; };
        const langKey = (baseKey) => `${baseKey}_${lang}`;
        
        // Settings.yml
        document.title = siteSettings.site_title || 'Website';
        const metaDesc = document.querySelector('meta[name="description"]');
        if (metaDesc) metaDesc.content = siteSettings.site_description || '';
        updateSrc('favicon', siteSettings.site_favicon);
        updateHref('social-link-facebook', siteSettings.social_facebook);
        updateHref('social-link-instagram', siteSettings.social_instagram);
        updateHref('social-link-pinterest', siteSettings.social_pinterest);

        // Home.yml
        const content = homeContent;
        updateText(`brand-${lang}`, content[langKey('header_logo_text')]);
        updateText(`hero-title-${lang}`, content[langKey('hero_title')]);
        updateText(`hero-subtitle-${lang}`, content[langKey('hero_subtitle')]);
        updateText(`hero-button-${lang}`, content[langKey('hero_button_text')]);
        const heroButtonLink = document.querySelector('#home .btn');
        if (heroButtonLink) heroButtonLink.href = content.hero_button_link || '#collections';
        updateSrc('hero-image', content.hero_background);
        updateText(`welcome-title-${lang}`, content[langKey('about_title')]);
        updateText(`welcome-text-${lang}`, content[langKey('about_text')]);
        updateText(`welcome-button-${lang}`, content[langKey('about_button_text')]);
        const welcomeButtonLink = document.querySelector('.md\\:w-1\\/2 .btn');
        if(welcomeButtonLink) welcomeButtonLink.href = content.about_button_link || '#about';
        updateSrc('welcome-image', content.about_image);
        updateText(`about-title-${lang}`, content[langKey('story_title')]);
        updateText(`about-subtitle-${lang}`, content[langKey('story_intro')]);
        updateText(`about-story-title-${lang}`, content[langKey('story_title')]);
        updateText(`about-story-text-${lang}`, content[langKey('story_intro')]);
        updateText(`about-quote-${lang}`, content[langKey('story_quote')]);
        updateSrc('about-image', content.story_image);
        updateText(`featured-title-${lang}`, content[langKey('featured_title')]); // Assuming you add this to home.yml
        updateText(`contact-title-${lang}`, content[langKey('contact_title')]);
        updateText(`contact-subtitle-${lang}`, content[langKey('contact_text')]);
        updateAction('contactForm', content.form_shortcode);
        updateHTML(`contact-address-${lang}`, `<i class="fas fa-map-marker-alt text-[var(--gold-primary)] w-6 ${lang === 'ar' ? 'ml-2' : 'mr-2'}"></i> ${content[langKey('contact_address')] || ''}`);
        updateHTML(`contact-phone-${lang}`, `<i class="fas fa-phone text-[var(--gold-primary)] w-6 ${lang === 'ar' ? 'ml-2' : 'mr-2'}"></i> ${content.contact_phone || ''}`);
        updateHTML(`contact-email-${lang}`, `<i class="fas fa-envelope text-[var(--gold-primary)] w-6 ${lang === 'ar' ? 'ml-2' : 'mr-2'}"></i> ${content.contact_email || ''}`);
        updateSrc('google-map', content.contact_map_embed);
        updateText(`footer-brand-${lang}`, content[langKey('footer_logo_text')]);
        updateText(`footer-slogan-${lang}`, content[langKey('footer_text')]);
        updateHTML(`footer-copyright-${lang}`, `&copy; <span class="currentYear">${new Date().getFullYear()}</span> ${content[langKey('footer_copyright')] || ''}`);
        updateText(`footer-design-credit-${lang}`, content[langKey('footer_credit')]);
    }

    function renderProducts(lang) {
        if (!productsContainer || !productsData) return;
        productsContainer.innerHTML = '';
        productsData.forEach((product, index) => {
            const title = product[lang === 'ar' ? 'produit_title_ar' : 'produit_title_fr'];
            const image = product.produit_image;
            const delay = index * 150;
            const productHTML = `
                <div class="collection-card bg-white rounded-lg scroll-animate" style="transition-delay: ${delay}ms;">
                    <div class="rounded-lg overflow-hidden shadow-lg aspect-[4/5]">
                        <img src="${image}" alt="${title}" class="w-full h-full object-cover transition-transform duration-500 hover:scale-110">
                    </div>
                    <div class="p-4 text-center">
                        <h3 class="text-base md:text-xl font-serif font-bold text-gray-800">${title}</h3>
                    </div>
                </div>`;
            productsContainer.insertAdjacentHTML('beforeend', productHTML);
        });
    }

    function renderGallery(filter = 'all') {
        if (!galleryContainer || !galleryData) return;
        galleryContainer.innerHTML = '';
        const filteredData = filter === 'all' ? galleryData : galleryData.filter(item => item.collection_category === filter);
        filteredData.forEach(item => {
            const title = currentLang === 'ar' ? item.collection_title_ar : item.collection_title_fr;
            const image = item.collection_image;
            const category = item.collection_category;
            const galleryItemHTML = `
                <div class="gallery-item scroll-animate" data-category="${category}">
                    <a href="${image}" data-lightbox="collection" data-title="${title}">
                        <div class="rounded-lg overflow-hidden shadow-md hover:shadow-xl transition-shadow duration-300 aspect-[4/5]">
                            <img src="${image}" alt="${title}" class="w-full h-full object-cover transition-transform duration-500 hover:scale-110">
                        </div>
                    </a>
                </div>`;
            galleryContainer.insertAdjacentHTML('beforeend', galleryItemHTML);
        });
        reobserveAnimations();
    }
    
    function reobserveAnimations() {
        document.querySelectorAll('.scroll-animate:not(.is-visible)').forEach(el => scrollObserver.observe(el));
    }

    // --- UI & EVENT HANDLERS --- //
    function setupEventListeners() {
        languageSwitchBtn.addEventListener('click', () => setLanguage(currentLang === 'ar' ? 'fr' : 'ar'));
        menuBtn.addEventListener('click', toggleMenu);
        document.querySelectorAll('a[href^="#"]').forEach(anchor => {
            anchor.addEventListener('click', function (e) {
                if (body.classList.contains('menu-open')) toggleMenu();
                e.preventDefault();
                const targetId = this.getAttribute('href');
                const targetElement = document.querySelector(targetId);
                if (targetElement) {
                    const headerHeight = document.getElementById('header').offsetHeight;
                    const elementPosition = targetElement.getBoundingClientRect().top;
                    const offsetPosition = elementPosition + window.pageYOffset - headerHeight;
                    window.scrollTo({ top: offsetPosition, behavior: 'smooth' });
                }
            });
        });
        document.querySelectorAll('.filter-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                document.querySelector('.filter-btn.active')?.classList.replace('btn-gold', 'btn-outline-gold');
                document.querySelector('.filter-btn.active')?.classList.remove('active');
                btn.classList.replace('btn-outline-gold', 'btn-gold');
                btn.classList.add('active');
                renderGallery(btn.dataset.filter);
            });
        });
    }
    
    function setLanguage(lang) {
        currentLang = lang;
        localStorage.setItem('preferredLanguage', lang);
        htmlEl.lang = lang;
        htmlEl.dir = lang === 'ar' ? 'rtl' : 'ltr';
        document.querySelectorAll('[data-lang]').forEach(el => {
            el.classList.toggle('hidden', el.dataset.lang !== lang);
        });
        languageSwitchBtn.textContent = lang === 'ar' ? 'FR' : 'AR';
        
        populateContent(lang);
        renderProducts(lang);
        renderGallery(document.querySelector('.filter-btn.active')?.dataset.filter || 'all');
        reobserveAnimations();
    }

    function toggleMenu() {
        menuBtn.classList.toggle('open');
        mobileMenu.classList.toggle('open');
        body.classList.toggle('menu-open');
    }

    const scrollObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('is-visible');
                observer.unobserve(entry.target);
            }
        });
    }, { threshold: 0.1 });
    
    if (typeof lightbox !== 'undefined') {
        lightbox.option({ 'resizeDuration': 200, 'wrapAround': true, 'albumLabel': "Image %1 / %2" });
    }
    
    initializeApp();
});
