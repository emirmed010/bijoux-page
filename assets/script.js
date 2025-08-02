/**
 * @file script.js
 * @description Main script for the Bijouterie Élégance website.
 * Handles dynamic content loading from YAML files, language switching,
 * mobile menu, gallery filtering, and animations.
 * @version 2.0.0
 * @date 2023-10-27
 */

document.addEventListener('DOMContentLoaded', function() {
    
    // --- GLOBAL VARIABLES --- //
    
    // DOM Elements
    const htmlEl = document.documentElement;
    const body = document.body;
    const languageSwitchBtn = document.getElementById('languageSwitch');
    const menuBtn = document.getElementById('menuBtn');
    const mobileMenu = document.getElementById('mobileMenu');
    const galleryContainer = document.querySelector('.gallery-container');

    // State
    let siteSettings = {};
    let homeContent = {};
    let galleryData = []; // ستبقى بيانات المعرض ثابتة مؤقتاً كما هي
    let currentLang = localStorage.getItem('preferredLanguage') || 'fr';

    // --- INITIALIZATION --- //

    /**
     * Initializes the application by fetching data and setting up event listeners.
     */
    async function initializeApp() {
        try {
            // Fetch dynamic content from YAML files
            const [settingsData, homeData] = await Promise.all([
                fetchYAML('/content/data/settings.yml'),
                fetchYAML('/content/data/home.yml')
            ]);
            
            siteSettings = settingsData;
            homeContent = homeData;
            galleryData = homeContent.collections_section.gallery_items || []; // استخدام بيانات المعرض من CMS

        } catch (error) {
            console.error("Fatal Error: Could not load site content.", error);
            // عرض رسالة خطأ للمستخدم إذا لزم الأمر
        } finally {
            // Setup UI regardless of data fetching success to keep site functional
            setupEventListeners();
            setLanguage(currentLang);
        }
    }

    // --- DATA FETCHING --- //

    /**
     * Fetches and parses a YAML file.
     * @param {string} url - The URL of the YAML file.
     * @returns {Promise<object>} A promise that resolves with the parsed YAML data.
     */
    async function fetchYAML(url) {
        try {
            const response = await fetch(url);
            if (!response.ok) {
                throw new Error(`Network response was not ok: ${response.statusText}`);
            }
            const yamlText = await response.text();
            return jsyaml.load(yamlText);
        } catch (error) {
            console.error(`Failed to fetch or parse YAML from ${url}:`, error);
            return {}; // Return empty object on failure to prevent total crash
        }
    }

    // --- DYNAMIC CONTENT POPULATION --- //

    /**
     * Populates the page with content based on the current language.
     * @param {string} lang - The current language ('fr' or 'ar').
     */
    function populateContent(lang) {
        if (!siteSettings || !homeContent) {
            console.error("Content not loaded, cannot populate page.");
            return;
        }

        // Helper function to update element content safely
        const updateText = (id, value) => {
            const el = document.getElementById(id);
            if (el) el.textContent = value || '';
            else console.warn(`Element with id "${id}" not found.`);
        };

        const updateHTML = (id, value) => {
            const el = document.getElementById(id);
            if (el) el.innerHTML = value || '';
             else console.warn(`Element with id "${id}" not found.`);
        };

        const updateSrc = (id, value) => {
            const el = document.getElementById(id);
            if (el) el.src = value || '';
             else console.warn(`Element with id "${id}" not found.`);
        };

        const updateHref = (id, value) => {
            const el = document.getElementById(id);
            if (el) el.href = value || '#';
             else console.warn(`Element with id "${id}" not found.`);
        };
        
        const langKey = (key) => `${key}_${lang}`;

        // 1. Site Settings (from settings.yml)
        document.title = siteSettings[langKey('site_title')];
        updateSrc('favicon', siteSettings.favicon);
        updateText(`brand-${lang}`, siteSettings[langKey('brand_name')]);
        updateText(`footer-brand-${lang}`, siteSettings[langKey('brand_name')]);
        updateText(`footer-slogan-${lang}`, siteSettings[langKey('footer_slogan')]);
        updateHTML(`footer-copyright-${lang}`, `&copy; <span class="currentYear">${new Date().getFullYear()}</span> ${siteSettings[langKey('copyright')]}`);
        updateText(`footer-design-credit-${lang}`, siteSettings[langKey('design_credit')]);
        updateHref('social-link-facebook', siteSettings.social_links?.facebook);
        updateHref('social-link-instagram', siteSettings.social_links?.instagram);
        updateHref('social-link-pinterest', siteSettings.social_links?.pinterest);
        
        // Navigation Links
        const nav = siteSettings.navigation || [];
        nav.forEach(item => {
            updateText(`nav-${item.id}-${lang}`, item[langKey('text')]);
            updateText(`mobile-nav-${item.id}-${lang}`, item[langKey('text')]);
        });
        
        // 2. Home Page Content (from home.yml)
        const hc = homeContent; // shorthand

        // Hero Section
        updateText(`hero-title-${lang}`, hc.hero_section?.[langKey('title')]);
        updateText(`hero-subtitle-${lang}`, hc.hero_section?.[langKey('subtitle')]);
        updateText(`hero-button-${lang}`, hc.hero_section?.[langKey('button_text')]);
        updateSrc('hero-image', hc.hero_section?.background_image);
        
        // Welcome Section
        updateText(`welcome-title-${lang}`, hc.welcome_section?.[langKey('title')]);
        updateText(`welcome-text-${lang}`, hc.welcome_section?.[langKey('text')]);
        updateText(`welcome-button-${lang}`, hc.welcome_section?.[langKey('button_text')]);
        updateSrc('welcome-image', hc.welcome_section?.image);

        // Featured Products Section
        updateText(`featured-title-${lang}`, hc.featured_products_section?.[langKey('title')]);
        for (let i = 1; i <= 4; i++) {
            updateText(`product-${i}-title-${lang}`, hc.featured_products_section?.[`product_${i}`]?.[langKey('title')]);
            updateSrc(`product-${i}-image`, hc.featured_products_section?.[`product_${i}`]?.image);
        }
        
        // About Section
        updateText(`about-title-${lang}`, hc.about_section?.[langKey('title')]);
        updateText(`about-subtitle-${lang}`, hc.about_section?.[langKey('subtitle')]);
        updateText(`about-story-title-${lang}`, hc.about_section?.[langKey('story_title')]);
        updateText(`about-story-text-${lang}`, hc.about_section?.[langKey('story_text')]);
        updateText(`about-craft-title-${lang}`, hc.about_section?.[langKey('craft_title')]);
        updateText(`about-craft-text-${lang}`, hc.about_section?.[langKey('craft_text')]);
        updateText(`about-quote-${lang}`, hc.about_section?.[langKey('quote')]);
        updateSrc('about-image', hc.about_section?.image);

        // Collections Section
        updateText(`collections-title-${lang}`, hc.collections_section?.[langKey('title')]);
        updateText(`collections-subtitle-${lang}`, hc.collections_section?.[langKey('subtitle')]);
        const filters = hc.collections_section?.filters || [];
        filters.forEach(filter => {
            updateText(`filter-${filter.id}-${lang}`, filter[langKey('text')]);
        });
        
        // Contact Section
        updateText(`contact-title-${lang}`, hc.contact_section?.[langKey('title')]);
        updateText(`contact-subtitle-${lang}`, hc.contact_section?.[langKey('subtitle')]);
        updateText(`form-title-${lang}`, hc.contact_section?.[langKey('form_title')]);
        updateText(`form-label-name-${lang}`, hc.contact_section?.[langKey('form_label_name')]);
        updateText(`form-label-email-${lang}`, hc.contact_section?.[langKey('form_label_email')]);
        updateText(`form-label-phone-${lang}`, hc.contact_section?.[langKey('form_label_phone')]);
        updateText(`form-label-message-${lang}`, hc.contact_section?.[langKey('form_label_message')]);
        updateText(`form-button-${lang}`, hc.contact_section?.[langKey('form_button_text')]);
        updateText(`contact-info-title-${lang}`, hc.contact_section?.[langKey('info_title')]);
        updateHTML(`contact-address-${lang}`, `<i class="fas fa-map-marker-alt text-[var(--gold-primary)] w-6 ${lang === 'ar' ? 'ml-2' : 'mr-2'}"></i> ${hc.contact_section?.address}`);
        updateHTML(`contact-phone-${lang}`, `<i class="fas fa-phone text-[var(--gold-primary)] w-6 ${lang === 'ar' ? 'ml-2' : 'mr-2'}"></i> ${hc.contact_section?.phone}`);
        updateHTML(`contact-email-${lang}`, `<i class="fas fa-envelope text-[var(--gold-primary)] w-6 ${lang === 'ar' ? 'ml-2' : 'mr-2'}"></i> ${hc.contact_section?.email}`);
        updateText(`contact-hours-title-${lang}`, hc.contact_section?.[langKey('hours_title')]);
        updateHTML(`contact-hours-1-${lang}`, `<strong>${hc.contact_section?.[langKey('weekdays_label')]}</strong> ${hc.contact_section?.weekdays_hours}`);
        updateHTML(`contact-hours-2-${lang}`, `<strong>${hc.contact_section?.[langKey('saturday_label')]}</strong> ${hc.contact_section?.saturday_hours}`);
        updateHTML(`contact-hours-3-${lang}`, `<strong>${hc.contact_section?.[langKey('sunday_label')]}</strong> ${hc.contact_section?.sunday_hours}`);
        updateSrc('google-map', hc.contact_section?.google_maps_embed_url);
    }
    
    // --- UI & EVENT HANDLERS --- //

    /**
     * Sets up all the event listeners for the page.
     */
    function setupEventListeners() {
        // Language switcher
        languageSwitchBtn.addEventListener('click', () => setLanguage(currentLang === 'ar' ? 'fr' : 'ar'));

        // Mobile menu
        menuBtn.addEventListener('click', toggleMenu);

        // Smooth scrolling for anchor links
        document.querySelectorAll('a[href^="#"]').forEach(anchor => {
            anchor.addEventListener('click', function (e) {
                if (body.classList.contains('menu-open')) {
                    toggleMenu();
                }
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

        // Gallery filter buttons
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
    
    /**
     * Sets the language for the entire page.
     * @param {string} lang - The language to set ('fr' or 'ar').
     */
    function setLanguage(lang) {
        currentLang = lang;
        localStorage.setItem('preferredLanguage', lang);
        htmlEl.lang = lang;
        htmlEl.dir = lang === 'ar' ? 'rtl' : 'ltr';
        
        document.querySelectorAll('[data-lang]').forEach(el => {
            el.classList.toggle('hidden', el.dataset.lang !== lang);
        });
        
        languageSwitchBtn.textContent = lang === 'ar' ? 'FR' : 'AR';
        
        // Populate content and render gallery after setting visibility
        populateContent(lang);
        renderGallery(document.querySelector('.filter-btn.active')?.dataset.filter || 'all');
    }

    /**
     * Toggles the mobile navigation menu.
     */
    function toggleMenu() {
        menuBtn.classList.toggle('open');
        mobileMenu.classList.toggle('open');
        body.classList.toggle('menu-open');
    }

    /**
     * Renders the gallery based on the selected filter.
     * @param {string} [filter='all'] - The category to filter by.
     */
    function renderGallery(filter = 'all') {
        if (!galleryContainer) return;
        galleryContainer.innerHTML = '';
        const filteredData = filter === 'all' ? galleryData : galleryData.filter(item => item.category === filter);
        
        filteredData.forEach(item => {
            const title = currentLang === 'ar' ? item.title_ar : item.title_fr;
            const galleryItemHTML = `
                <div class="gallery-item scroll-animate" data-category="${item.category}">
                    <a href="${item.image}" data-lightbox="collection" data-title="${title}">
                        <div class="rounded-lg overflow-hidden shadow-md hover:shadow-xl transition-shadow duration-300 aspect-[4/5]">
                            <img src="${item.image}" alt="${title}" class="w-full h-full object-cover transition-transform duration-500 hover:scale-110">
                        </div>
                    </a>
                </div>
            `;
            galleryContainer.insertAdjacentHTML('beforeend', galleryItemHTML);
        });
        
        // Re-initialize scroll animations for new elements
        document.querySelectorAll('.scroll-animate:not(.is-visible)').forEach(el => scrollObserver.observe(el));
    }

    // --- SCROLL ANIMATION --- //

    const scrollObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('is-visible');
                observer.unobserve(entry.target);
            }
        });
    }, { threshold: 0.1 });

    document.querySelectorAll('.scroll-animate').forEach(el => scrollObserver.observe(el));

    // --- LIBRARY CONFIGURATIONS --- //
    
    if (typeof lightbox !== 'undefined') {
        lightbox.option({
          'resizeDuration': 200,
          'wrapAround': true,
          'albumLabel': "Image %1 / %2"
        });
    }

    // --- START THE APP --- //
    initializeApp();
});
