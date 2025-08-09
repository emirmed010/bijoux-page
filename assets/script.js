/**
 * @file script.js
 * @description Final, integrated script for the website.
 * Handles fully dynamic content loading with cache busting and flexible logo options.
 * @version 9.0.0 - Final Version
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
            // Fetch all data sources concurrently with a cache-busting parameter
            const cacheBuster = `?v=${new Date().getTime()}`;
            [siteSettings, homeContent, productsData, galleryData] = await Promise.all([
                fetchData(`/content/data/settings.yml${cacheBuster}`, 'yaml'),
                fetchData(`/content/data/home.yml${cacheBuster}`, 'yaml'),
                fetchData(`/assets/data/products.json${cacheBuster}`, 'json'),
                fetchData(`/assets/data/gallery.json${cacheBuster}`, 'json')
            ]);
        } catch (error) {
            console.error("Fatal Error: Could not load site content.", error);
        } finally {
            // Setup the page regardless of data fetching success
            setupEventListeners();
            setLanguage(currentLang, true); // Initial page load
        }
    }

    // --- DATA FETCHING UTILITY --- //
    async function fetchData(url, type = 'json') {
        try {
            const response = await fetch(url);
            if (!response.ok) throw new Error(`Network response was not ok for ${url}`);
            if (type === 'yaml') {
                const yamlText = await response.text();
                return jsyaml.load(yamlText);
            }
            return await response.json();
        } catch (error) {
            console.error(`Failed to fetch/parse from ${url}:`, error);
            return type === 'yaml' ? {} : []; // Return a safe default value
        }
    }

    // --- DYNAMIC CONTENT RENDERING --- //
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
        }
    }

    function populateContent(lang) {
        if (!siteSettings || !homeContent) return;

        const langKey = (baseKey) => `${baseKey}_${lang}`;
        const content = homeContent;

        // 1. General Site Settings
        document.title = siteSettings.site_title || 'Bijouterie';
        document.querySelector('meta[name="description"]').content = siteSettings.site_description || '';
        updateElement('favicon', siteSettings.site_favicon, 'src');

        // 2. Flexible Logo Handling
        const headerLogoImg = document.getElementById('header-logo-img');
        const brandFr = document.getElementById('brand-fr');
        const brandAr = document.getElementById('brand-ar');
        
        if (siteSettings.site_logo) {
            headerLogoImg.src = siteSettings.site_logo;
            headerLogoImg.classList.remove('hidden');
            brandFr.classList.add('hidden');
            brandAr.classList.add('hidden');
        } else {
            headerLogoImg.classList.add('hidden');
            brandFr.classList.remove('hidden');
            brandAr.classList.remove('hidden');
            updateElement('brand-fr', content['header_logo_text_fr']);
            updateElement('brand-ar', content['header_logo_text_ar']);
        }
        
        // 3. Social Links
        updateElement('social-link-facebook', siteSettings.social_facebook, 'href');
        updateElement('social-link-instagram', siteSettings.social_instagram, 'href');
        updateElement('social-link-pinterest', siteSettings.social_pinterest, 'href');

        // 4. Navigation (using a more robust check)
        const navHome = content[langKey('nav_home_text')] || (lang === 'fr' ? 'Accueil' : 'الرئيسية');
        const navAbout = content[langKey('nav_about_text')] || (lang === 'fr' ? 'Notre Histoire' : 'قصتنا');
        const navCollections = content[langKey('nav_collections_text')] || (lang === 'fr' ? 'Collections' : 'المجموعات');
        const navContact = content[langKey('nav_contact_text')] || (lang === 'fr' ? 'Contact' : 'اتصل بنا');

        updateElement(`nav-home-${lang}`, navHome);
        updateElement(`nav-about-${lang}`, navAbout);
        updateElement(`nav-collections-${lang}`, navCollections);
        updateElement(`nav-contact-${lang}`, navContact);
        updateElement(`mobile-nav-home-${lang}`, navHome);
        updateElement(`mobile-nav-about-${lang}`, navAbout);
        updateElement(`mobile-nav-collections-${lang}`, navCollections);
        updateElement(`mobile-nav-contact-${lang}`, navContact);
        
        // 5. Hero Section
        updateElement('hero-image', content.hero_background, 'src');
        updateElement(`hero-title-${lang}`, content[langKey('hero_title')]);
        updateElement(`hero-subtitle-${lang}`, content[langKey('hero_subtitle')]);
        updateElement(`hero-button-${lang}`, content[langKey('hero_button_text')]);
        updateElement('hero-button-link', content.hero_button_link, 'href');

        // 6. Welcome Section
        updateElement('welcome-image', content.about_image, 'src');
        updateElement(`welcome-title-${lang}`, content[langKey('about_title')]);
        updateElement(`welcome-text-${lang}`, content[langKey('about_text')]);
        updateElement(`welcome-button-${lang}`, content[langKey('about_button_text')]);
        updateElement('welcome-button-link', content.about_button_link, 'href');

        // 7. Featured Products Title
        updateElement(`featured-title-${lang}`, content[langKey('featured_products_title')]);

        // 8. Story / About Section
        updateElement(`about-title-${lang}`, content[langKey('story_section_title')]);
        updateElement(`about-subtitle-${lang}`, content[langKey('story_intro')]);
        updateElement(`about-story-title-${lang}`, content[langKey('story_title')]);
        updateElement(`about-story-text-${lang}`, content[langKey('story_text')]);
        updateElement(`about-quote-${lang}`, content[langKey('story_quote')]);
        updateElement('about-image', content.story_image, 'src');

        // 9. Collections Section
        updateElement(`collections-title-${lang}`, content[langKey('collections_section_title')]);
        updateElement(`collections-subtitle-${lang}`, content[langKey('collections_subtitle')]);
        updateElement(`filter-all-${lang}`, content[langKey('filter_all_text')]);
        updateElement(`filter-rings-${lang}`, content[langKey('filter_rings_text')]);
        updateElement(`filter-necklaces-${lang}`, content[langKey('filter_necklaces_text')]);
        updateElement(`filter-bracelets-${lang}`, content[langKey('filter_bracelets_text')]);
        updateElement(`filter-watches-${lang}`, content[langKey('filter_watches_text')]);

        // 10. Contact Section
        updateElement(`contact-title-${lang}`, content[langKey('contact_section_title')]);
        updateElement(`contact-subtitle-${lang}`, content[langKey('contact_section_subtitle')]);
        updateElement(`form-title-${lang}`, content[langKey('form_title')]);
        updateElement('contactForm', content.form_shortcode, 'action');
        updateElement(`form-label-name-${lang}`, content[langKey('form_name_label')]);
        updateElement(`form-label-email-${lang}`, content[langKey('form_email_label')]);
        updateElement(`form-label-message-${lang}`, content[langKey('form_message_label')]);
        updateElement(`form-button-${lang}`, content[langKey('form_submit_button')]);
        
        const address = content[langKey('contact_address')] || '';
        const phone = content.contact_phone || '';
        const email = content.contact_email || '';
        const iconClass = lang === 'ar' ? 'ml-2' : 'mr-2';
        
        updateElement(`contact-address-${lang}`, `<i class="fas fa-map-marker-alt text-[var(--gold-primary)] w-6 ${iconClass}"></i> ${address}`, 'html');
        updateElement(`contact-phone-${lang}`, `<i class="fas fa-phone text-[var(--gold-primary)] w-6 ${iconClass}"></i> ${phone}`, 'html');
        updateElement(`contact-email-${lang}`, `<i class="fas fa-envelope text-[var(--gold-primary)] w-6 ${iconClass}"></i> ${email}`, 'html');

        const mapContainer = document.getElementById('google-map-container');
        if (mapContainer && content.contact_map_embed) {
            mapContainer.innerHTML = content.contact_map_embed;
            const iframe = mapContainer.querySelector('iframe');
            if (iframe) {
                iframe.style.width = '100%';
                iframe.style.height = '100%';
                iframe.style.border = '0';
            }
        }

        // 11. Footer
        updateElement(`footer-brand-${lang}`, content[langKey('footer_logo_text')]);
        updateElement(`footer-slogan-${lang}`, content[langKey('footer_text')]);
        updateElement(`footer-copyright-${lang}`, `&copy; ${new Date().getFullYear()} ${content[langKey('footer_copyright')] || ''}`, 'html');
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
        htmlEl.lang = lang;
        htmlEl.dir = lang === 'ar' ? 'rtl' : 'ltr';
        
        document.querySelectorAll('[data-lang]').forEach(el => {
            if (el.id !== 'brand-fr' && el.id !== 'brand-ar') {
                 el.classList.toggle('hidden', el.dataset.lang !== lang);
            }
        });
        
        languageSwitchBtn.textContent = lang === 'ar' ? 'FR' : 'AR';
        
        populateContent(lang);
        renderProducts(lang);
        renderGallery(document.querySelector('.filter-btn.active')?.dataset.filter || 'all');
        
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
        document.querySelectorAll('.scroll-animate').forEach(el => {
            scrollObserver.observe(el);
        });
        if (typeof lightbox !== 'undefined') {
            lightbox.option({ 'resizeDuration': 200, 'wrapAround': true, 'albumLabel': "Image %1 / %2" });
        }
    });
});
