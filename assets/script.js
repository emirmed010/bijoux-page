/**
 * @file script.js
 * @description Main script for the website. Handles fully dynamic content loading.
 * @version 6.0.0
 */

document.addEventListener('DOMContentLoaded', function() {
    
    // --- GLOBAL ELEMENTS & STATE --- //
    const htmlEl = document.documentElement;
    const body = document.body;
    const languageSwitchBtn = document.getElementById('languageSwitch');
    const menuBtn = document.getElementById('menuBtn');
    const mobileMenu = document.getElementById('mobileMenu');
    
    let siteSettings = {};
    let homeContent = {};
    let productsData = [];
    let galleryData = [];
    let currentLang = localStorage.getItem('preferredLanguage') || 'fr';

    // --- INITIALIZATION --- //
    async function initializeApp() {
        try {
            // Fetch all data sources concurrently
            [siteSettings, homeContent, productsData, galleryData] = await Promise.all([
                fetchData('/content/data/settings.yml', 'yaml'),
                fetchData('/content/data/home.yml', 'yaml'),
                fetchData('/assets/data/products.json', 'json'),
                fetchData('/assets/data/gallery.json', 'json')
            ]);
        } catch (error) {
            console.error("Fatal Error: Could not load site content.", error);
            // Optionally, display a user-friendly error message on the page
        } finally {
            // Always run setup and initial render, even if some data failed
            setupEventListeners();
            setLanguage(currentLang, true); // Initial load
        }
    }

    // --- DATA FETCHING UTILITY --- //
    async function fetchData(url, type = 'json') {
        try {
            // Add a cache-busting query parameter
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
            console.error(`Failed to fetch/parse ${type.toUpperCase()} from ${url}:`, error);
            return type === 'yaml' ? {} : []; // Return a default empty value on failure
        }
    }

    // --- DYNAMIC CONTENT RENDERING --- //
    
    /**
     * A helper function to safely update DOM elements.
     * @param {string} id - The ID of the element to update.
     * @param {string} value - The content or attribute value.
     * @param {'text'|'html'|'src'|'href'|'action'} type - The type of update.
     */
    function updateElement(id, value, type = 'text') {
        const el = document.getElementById(id);
        if (el) {
            switch (type) {
                case 'text': el.textContent = value || ''; break;
                case 'html': el.innerHTML = value || ''; break;
                case 'src': if (value) el.src = value; break;
                case 'href': if (value) el.href = value; break;
                case 'action': if (value) el.action = value; break;
            }
        } else {
            // This warning helps during development to find mismatched IDs
            // console.warn(`Element with ID "${id}" not found.`);
        }
    }

    /**
     * Populates the entire page with content based on the current language.
     * @param {string} lang - The current language ('fr' or 'ar').
     */
    function populateAllContent(lang) {
        if (!siteSettings || !homeContent) {
            console.error("Content not loaded, cannot populate page.");
            return;
        }

        const langKey = (baseKey) => `${baseKey}_${lang}`;
        const content = homeContent;

        // 1. General Site Settings (from settings.yml)
        document.title = siteSettings.site_title || 'Website';
        document.querySelector('meta[name="description"]').content = siteSettings.site_description || '';
        updateElement('favicon', siteSettings.site_favicon, 'src');
        updateElement('header-logo', siteSettings.site_logo, 'src');
        updateElement('whatsapp-qr-code', siteSettings.whatsapp_qr_code, 'src');
        
        // 2. Navigation (from home.yml)
        const nav = content.navigation || {};
        updateElement(`nav-home-${lang}`, nav[langKey('home')]);
        updateElement(`nav-about-${lang}`, nav[langKey('about')]);
        updateElement(`nav-collections-${lang}`, nav[langKey('collections')]);
        updateElement(`nav-contact-${lang}`, nav[langKey('contact')]);
        updateElement(`mobile-nav-home-${lang}`, nav[langKey('home')]);
        updateElement(`mobile-nav-about-${lang}`, nav[langKey('about')]);
        updateElement(`mobile-nav-collections-${lang}`, nav[langKey('collections')]);
        updateElement(`mobile-nav-contact-${lang}`, nav[langKey('contact')]);

        // 3. Hero Section (from home.yml)
        const hero = content.hero_section || {};
        updateElement('hero-background', hero.hero_background, 'src');
        updateElement(`hero-title-${lang}`, hero[langKey('hero_title')]);
        updateElement(`hero-subtitle-${lang}`, hero[langKey('hero_subtitle')]);
        updateElement(`hero-button-text-${lang}`, hero[langKey('hero_button_text')]);
        updateElement('hero-button-link', hero.hero_button_link, 'href');

        // 4. Welcome Section (from home.yml)
        const welcome = content.welcome_section || {};
        updateElement('welcome-image', welcome.about_image, 'src');
        updateElement(`welcome-title-${lang}`, welcome[langKey('about_title')]);
        updateElement(`welcome-text-${lang}`, welcome[langKey('about_text')]);
        updateElement(`welcome-button-text-${lang}`, welcome[langKey('about_button_text')]);
        updateElement('welcome-button-link', welcome.about_button_link, 'href');
        
        // 5. Featured Products Section (from home.yml)
        const featured = content.featured_products_section || {};
        updateElement(`featured-title-${lang}`, featured[langKey('featured_title')]);

        // 6. Story Section (from home.yml)
        const story = content.story_section || {};
        updateElement(`story-section-title-${lang}`, story[langKey('story_section_title')]);
        updateElement(`story-intro-${lang}`, story[langKey('story_intro')]);
        updateElement(`story-title-${lang}`, story[langKey('story_title')]);
        updateElement(`story-text-${lang}`, story[langKey('story_text')]);
        updateElement(`craft-title-${lang}`, story[langKey('craft_title')]);
        updateElement(`craft-text-${lang}`, story[langKey('craft_text')]);
        updateElement(`story-quote-${lang}`, story[langKey('story_quote')]);
        updateElement('story-image', story.story_image, 'src');

        // 7. Services Section (from home.yml)
        const services = content.services_section || {};
        updateElement(`services-title-${lang}`, services[langKey('services_title')]);
        updateElement(`services-subtitle-${lang}`, services[langKey('services_subtitle')]);
        updateElement(`service1-title-${lang}`, services[langKey('service1_title')]);
        updateElement(`service1-text-${lang}`, services[langKey('service1_text')]);
        updateElement(`service1-button-${lang}`, services[langKey('service1_button')]);
        updateElement(`service2-title-${lang}`, services[langKey('service2_title')]);
        updateElement(`service2-text-${lang}`, services[langKey('service2_text')]);
        updateElement(`service2-button-${lang}`, services[langKey('service2_button')]);

        // 8. Collections Section (from home.yml)
        const collections = content.collections_section || {};
        updateElement(`collections-title-${lang}`, collections[langKey('collections_title')]);
        updateElement(`collections-subtitle-${lang}`, collections[langKey('collections_subtitle')]);
        updateElement(`filter-all-${lang}`, collections[langKey('filter_all')]);
        updateElement(`filter-rings-${lang}`, collections[langKey('filter_rings')]);
        updateElement(`filter-necklaces-${lang}`, collections[langKey('filter_necklaces')]);
        updateElement(`filter-bracelets-${lang}`, collections[langKey('filter_bracelets')]);
        updateElement(`filter-watches-${lang}`, collections[langKey('filter_watches')]);
        
        // 9. Contact Section (from home.yml & settings.yml)
        const contact = content.contact_section || {};
        updateElement(`contact-title-${lang}`, contact[langKey('contact_title')]);
        updateElement(`form-title-${lang}`, contact[langKey('form_title')]);
        updateElement('contactForm', contact.form_shortcode, 'action');
        updateElement(`form-name-label-${lang}`, contact[langKey('form_name_label')]);
        updateElement(`form-email-label-${lang}`, contact[langKey('form_email_label')]);
        updateElement(`form-message-label-${lang}`, contact[langKey('form_message_label')]);
        updateElement(`form-submit-button-${lang}`, contact[langKey('form_submit_button')]);
        updateElement(`whatsapp-title-${lang}`, contact[langKey('whatsapp_title')]);
        updateElement(`whatsapp-text-${lang}`, contact[langKey('whatsapp_text')]);
        updateElement(`follow-us-title-${lang}`, contact[langKey('follow_us_title')]);

        // 10. Footer (from home.yml & settings.yml)
        const footer = content.footer_section || {};
        updateElement(`footer-logo-text-${lang}`, footer[langKey('footer_logo_text')]);
        updateElement(`footer-text-${lang}`, footer[langKey('footer_text')]);
        updateElement(`footer-copyright-${lang}`, `&copy; ${new Date().getFullYear()} ${footer[langKey('footer_copyright')] || ''}`, 'html');
        
        // 11. Social Links (from settings.yml)
        renderSocialLinks();
    }

    function renderSocialLinks() {
        const links = siteSettings.social_links || {};
        const platforms = [
            { key: 'social_facebook', icon: 'fab fa-facebook-f' },
            { key: 'social_instagram', icon: 'fab fa-instagram' },
            { key: 'social_tiktok', icon: 'fab fa-tiktok' },
            { key: 'social_whatsapp', icon: 'fab fa-whatsapp' },
            { key: 'social_snapchat', icon: 'fab fa-snapchat' },
            { key: 'social_pinterest', icon: 'fab fa-pinterest-p' },
        ];
        
        const generateLinksHTML = (platformSubset) => {
            return platformSubset
                .filter(p => links[p.key]) // Only include if link exists
                .map(p => `
                    <a href="${links[p.key]}" target="_blank" rel="noopener noreferrer" class="text-gray-400 hover:text-[var(--gold-primary)] transition-colors duration-300" aria-label="${p.key.split('_')[1]}">
                        <i class="${p.icon} text-2xl"></i>
                    </a>
                `).join('');
        };

        const contactPlatforms = platforms.filter(p => p.key !== 'social_pinterest');
        const footerPlatforms = platforms.filter(p => ['social_facebook', 'social_instagram', 'social_pinterest'].includes(p.key));

        updateElement('social-links-contact', generateLinksHTML(contactPlatforms), 'html');
        updateElement('social-links-footer', generateLinksHTML(footerPlatforms), 'html');
    }

    function renderProducts(lang) {
        const container = document.getElementById('featured-products-grid');
        if (!container || !productsData) return;
        container.innerHTML = '';
        productsData.forEach((product, index) => {
            const title = product[lang === 'ar' ? 'produit_title_ar' : 'produit_title_fr'];
            const image = product.produit_image;
            const delay = index * 100;
            const productHTML = `
                <div class="collection-card bg-white rounded-lg scroll-animate" style="transition-delay: ${delay}ms;">
                    <div class="rounded-lg overflow-hidden shadow-lg aspect-[4/5]">
                        <img src="${image}" alt="${title}" class="w-full h-full object-cover transition-transform duration-500 hover:scale-110" loading="lazy">
                    </div>
                    <div class="p-4 text-center">
                        <h3 class="text-base md:text-xl font-serif font-bold text-gray-800">${title}</h3>
                    </div>
                </div>`;
            container.insertAdjacentHTML('beforeend', productHTML);
        });
    }

    function renderGallery(filter = 'all') {
        const container = document.querySelector('.gallery-container');
        if (!container || !galleryData) return;
        container.innerHTML = '';
        const filteredData = filter === 'all' ? galleryData : galleryData.filter(item => item.collection_category === filter);
        filteredData.forEach(item => {
            const title = currentLang === 'ar' ? item.collection_title_ar : item.collection_title_fr;
            const image = item.collection_image;
            const category = item.collection_category;
            const galleryItemHTML = `
                <div class="gallery-item scroll-animate" data-category="${category}">
                    <a href="${image}" data-lightbox="collection" data-title="${title}">
                        <div class="rounded-lg overflow-hidden shadow-md hover:shadow-xl transition-shadow duration-300 aspect-[4/5]">
                            <img src="${image}" alt="${title}" class="w-full h-full object-cover transition-transform duration-500 hover:scale-110" loading="lazy">
                        </div>
                    </a>
                </div>`;
            container.insertAdjacentHTML('beforeend', galleryItemHTML);
        });
        // After rendering, re-observe new elements for animations
        reobserveAnimations();
    }

    // --- UI & EVENT HANDLERS --- //
    function setupEventListeners() {
        languageSwitchBtn.addEventListener('click', () => {
            const newLang = currentLang === 'ar' ? 'fr' : 'ar';
            setLanguage(newLang);
        });

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
    
    function setLanguage(lang, isInitialLoad = false) {
        currentLang = lang;
        localStorage.setItem('preferredLanguage', lang);
        
        // Update HTML attributes
        htmlEl.lang = lang;
        htmlEl.dir = lang === 'ar' ? 'rtl' : 'ltr';
        
        // Toggle visibility of language-specific elements
        document.querySelectorAll('[data-lang]').forEach(el => {
            el.classList.toggle('hidden', el.dataset.lang !== lang);
        });
        
        languageSwitchBtn.textContent = lang === 'ar' ? 'FR' : 'AR';
        
        // Re-render all dynamic content
        populateAllContent(lang);
        renderProducts(lang);
        renderGallery(document.querySelector('.filter-btn.active')?.dataset.filter || 'all');
        
        // Only re-observe animations if it's not the first page load
        if (!isInitialLoad) {
            reobserveAnimations();
        }
    }

    function toggleMenu() {
        menuBtn.classList.toggle('open');
        mobileMenu.classList.toggle('open');
        body.classList.toggle('menu-open');
    }

    // --- SCROLL ANIMATION OBSERVER --- //
    const scrollObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('is-visible');
                observer.unobserve(entry.target);
            }
        });
    }, { threshold: 0.1 });

    function reobserveAnimations() {
        document.querySelectorAll('.scroll-animate:not(.is-visible)').forEach(el => {
            scrollObserver.observe(el);
        });
    }

    // --- INITIALIZE THE APP --- //
    initializeApp().then(() => {
        // First-time observation of all elements
        document.querySelectorAll('.scroll-animate').forEach(el => {
            scrollObserver.observe(el);
        });
    });
});
