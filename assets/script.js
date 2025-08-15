/**
 * @file script.js
 * @description Final, integrated script for the website.
 * Handles fully dynamic content loading with cache busting and flexible logo options.
 * @version 9.0.2 - Patched Version with Contact Info & Success Modal
 */

document.addEventListener('DOMContentLoaded', function() {
    
    // --- GLOBAL ELEMENTS & STATE --- //
    const htmlEl = document.documentElement;
    const body = document.body;
    const languageSwitchBtn = document.getElementById('languageSwitch');
    const menuBtn = document.getElementById('menuBtn');
    const mobileMenu = document.getElementById('mobileMenu');
    const contactForm = document.getElementById('contactForm');
    const successModal = document.getElementById('successModal');
    const closeModalBtn = document.getElementById('closeModalBtn');
    const modalContent = document.getElementById('modalContent');
    
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
            // Ensure homeContent is an object even if the file is empty or fails to load
            if (!homeContent) {
                homeContent = {};
                console.warn("Home content could not be loaded or is empty. Using default fallbacks.");
            }
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
                // jsyaml.load returns undefined for empty string, convert to null for consistency
                return jsyaml.load(yamlText) || null;
            }
            return await response.json();
        } catch (error) {
            console.error(`Failed to fetch/parse from ${url}:`, error);
            return type === 'yaml' ? null : []; // Return a safe default value
        }
    }

    // --- DYNAMIC CONTENT RENDERING --- //
    function updateElement(id, value, type = 'text') {
        const el = document.getElementById(id);
        if (el) {
            switch (type) {
                case 'text': el.textContent = value || ''; break;
                case 'html': el.innerHTML = value || ''; break;
                case 'src': if (value) el.src = value; else el.style.display = 'none'; break;
                case 'href': if (value) el.href = value; break;
                case 'action': if (value) el.action = value; break;
            }
        } else {
            // console.warn(`Element with ID '${id}' not found.`);
        }
    }

    function populateContent(lang) {
        // Ensure siteSettings is available
        if (!siteSettings) {
            console.error("Cannot populate content: siteSettings is missing.");
            return;
        }
        // Ensure homeContent is at least an empty object
        if (!homeContent) {
            homeContent = {};
        }

        const langKey = (baseKey) => `${baseKey}_${lang}`;
        const content = homeContent;

        // 1. General Site Settings
        document.title = siteSettings.site_title || 'Bijouterie';
        const descriptionMeta = document.querySelector('meta[name="description"]');
        if (descriptionMeta) {
            descriptionMeta.content = siteSettings.site_description || '';
        }
        updateElement('favicon', siteSettings.site_favicon, 'href');

        // 2. Flexible Logo Handling
        const headerLogoImg = document.getElementById('header-logo');
        if (headerLogoImg) {
            if (siteSettings.site_logo) {
                headerLogoImg.src = siteSettings.site_logo;
                headerLogoImg.classList.remove('hidden');
            } else {
                headerLogoImg.classList.add('hidden');
            }
        }
        
        // 3. Social Links
        const socialLinks = siteSettings.social_links || {};
        const socialContainerContact = document.getElementById('social-links-contact');
        const socialContainerFooter = document.getElementById('social-links-footer');
        const socialHtml = `
            ${socialLinks.social_facebook ? `<a href="${socialLinks.social_facebook}" target="_blank" class="text-gray-500 hover:text-[var(--gold-primary)] transition-colors"><i class="fab fa-facebook-f fa-lg"></i></a>` : ''}
            ${socialLinks.social_instagram ? `<a href="${socialLinks.social_instagram}" target="_blank" class="text-gray-500 hover:text-[var(--gold-primary)] transition-colors"><i class="fab fa-instagram fa-lg"></i></a>` : ''}
            ${socialLinks.social_tiktok ? `<a href="${socialLinks.social_tiktok}" target="_blank" class="text-gray-500 hover:text-[var(--gold-primary)] transition-colors"><i class="fab fa-tiktok fa-lg"></i></a>` : ''}
            ${socialLinks.social_whatsapp ? `<a href="${socialLinks.social_whatsapp}" target="_blank" class="text-gray-500 hover:text-[var(--gold-primary)] transition-colors"><i class="fab fa-whatsapp fa-lg"></i></a>` : ''}
            ${socialLinks.social_snapchat ? `<a href="${socialLinks.social_snapchat}" target="_blank" class="text-gray-500 hover:text-[var(--gold-primary)] transition-colors"><i class="fab fa-snapchat fa-lg"></i></a>` : ''}
            ${socialLinks.social_pinterest ? `<a href="${socialLinks.social_pinterest}" target="_blank" class="text-gray-500 hover:text-[var(--gold-primary)] transition-colors"><i class="fab fa-pinterest fa-lg"></i></a>` : ''}
        `;
        if (socialContainerContact) socialContainerContact.innerHTML = socialHtml;
        if (socialContainerFooter) socialContainerFooter.innerHTML = socialHtml.replace(/text-gray-500/g, 'text-gray-400');

        // 4. Navigation
        const navItems = ['home', 'about', 'collections', 'contact'];
        navItems.forEach(item => {
            updateElement(`nav-${item}-fr`, (content.navigation && content.navigation[`nav_${item}_fr`]) || `Nav ${item} FR`);
            updateElement(`nav-${item}-ar`, (content.navigation && content.navigation[`nav_${item}_ar`]) || `Nav ${item} AR`);
            updateElement(`mobile-nav-${item}-fr`, (content.navigation && content.navigation[`nav_${item}_fr`]) || `Nav ${item} FR`);
            updateElement(`mobile-nav-${item}-ar`, (content.navigation && content.navigation[`nav_${item}_ar`]) || `Nav ${item} AR`);
        });
        
        // 5. Hero Section
        const hero = content.hero_section || {};
        updateElement('hero-background', hero.hero_background, 'src');
        updateElement(`hero-title-fr`, hero.hero_title_fr);
        updateElement(`hero-title-ar`, hero.hero_title_ar);
        updateElement(`hero-subtitle-fr`, hero.hero_subtitle_fr);
        updateElement(`hero-subtitle-ar`, hero.hero_subtitle_ar);
        updateElement(`hero-button-text-fr`, hero.hero_button_text_fr);
        updateElement(`hero-button-text-ar`, hero.hero_button_text_ar);
        updateElement('hero-button-link', hero.hero_button_link, 'href');

        // ... (rest of the sections: welcome, featured, story, services, collections, contact, footer)
        const welcome = content.welcome_section || {};
        updateElement('welcome-image', welcome.about_image, 'src');
        updateElement(`welcome-title-fr`, welcome.about_title_fr);
        updateElement(`welcome-title-ar`, welcome.about_title_ar);
        updateElement(`welcome-text-fr`, welcome.about_text_fr);
        updateElement(`welcome-text-ar`, welcome.about_text_ar);
        updateElement(`welcome-button-text-fr`, welcome.about_button_text_fr);
        updateElement(`welcome-button-text-ar`, welcome.about_button_text_ar);
        updateElement('welcome-button-link', welcome.about_button_link, 'href');

        const featured = content.featured_products_section || {};
        updateElement(`featured-title-fr`, featured.featured_title_fr);
        updateElement(`featured-title-ar`, featured.featured_title_ar);

        const story = content.story_section || {};
        updateElement(`story-section-title-fr`, story.story_section_title_fr);
        updateElement(`story-section-title-ar`, story.story_section_title_ar);
        updateElement(`story-intro-fr`, story.story_intro_fr);
        updateElement(`story-intro-ar`, story.story_intro_ar);
        updateElement(`story-title-fr`, story.story_title_fr);
        updateElement(`story-title-ar`, story.story_title_ar);
        updateElement(`story-text-fr`, story.story_text_fr);
        updateElement(`story-text-ar`, story.story_text_ar);
        updateElement(`craft-title-fr`, story.craft_title_fr);
        updateElement(`craft-title-ar`, story.craft_title_ar);
        updateElement(`craft-text-fr`, story.craft_text_fr);
        updateElement(`craft-text-ar`, story.craft_text_ar);
        updateElement(`story-quote-fr`, story.story_quote_fr);
        updateElement(`story-quote-ar`, story.story_quote_ar);
        updateElement('story-image', story.story_image, 'src');
        
        const services = content.services_section || {};
        updateElement(`services-title-fr`, services.services_title_fr);
        updateElement(`services-title-ar`, services.services_title_ar);
        updateElement(`services-subtitle-fr`, services.services_subtitle_fr);
        updateElement(`services-subtitle-ar`, services.services_subtitle_ar);
        updateElement(`service1-title-fr`, services.service1_title_fr);
        updateElement(`service1-title-ar`, services.service1_title_ar);
        updateElement(`service1-text-fr`, services.service1_text_fr);
        updateElement(`service1-text-ar`, services.service1_text_ar);
        updateElement(`service1-button-fr`, services.service1_button_fr);
        updateElement(`service1-button-ar`, services.service1_button_ar);
        updateElement(`service2-title-fr`, services.service2_title_fr);
        updateElement(`service2-title-ar`, services.service2_title_ar);
        updateElement(`service2-text-fr`, services.service2_text_fr);
        updateElement(`service2-text-ar`, services.service2_text_ar);
        updateElement(`service2-button-fr`, services.service2_button_fr);
        updateElement(`service2-button-ar`, services.service2_button_ar);

        const collections = content.collections_section || {};
        updateElement(`collections-title-fr`, collections.collections_title_fr);
        updateElement(`collections-title-ar`, collections.collections_title_ar);
        updateElement(`collections-subtitle-fr`, collections.collections_subtitle_fr);
        updateElement(`collections-subtitle-ar`, collections.collections_subtitle_ar);
        updateElement(`filter-all-fr`, collections.filter_all_fr);
        updateElement(`filter-all-ar`, collections.filter_all_ar);
        updateElement(`filter-rings-fr`, collections.filter_rings_fr);
        updateElement(`filter-rings-ar`, collections.filter_rings_ar);
        updateElement(`filter-necklaces-fr`, collections.filter_necklaces_fr);
        updateElement(`filter-necklaces-ar`, collections.filter_necklaces_ar);
        updateElement(`filter-bracelets-fr`, collections.filter_bracelets_fr);
        updateElement(`filter-bracelets-ar`, collections.filter_bracelets_ar);
        updateElement(`filter-watches-fr`, collections.filter_watches_fr);
        updateElement(`filter-watches-ar`, collections.filter_watches_ar);

        const contact = content.contact_section || {};
        updateElement(`contact-title-fr`, contact.contact_title_fr);
        updateElement(`contact-title-ar`, contact.contact_title_ar);
        updateElement(`form-title-fr`, contact.form_title_fr);
        updateElement(`form-title-ar`, contact.form_title_ar);
        updateElement('contactForm', contact.form_shortcode, 'action');
        updateElement(`form-name-label-fr`, contact.form_name_label_fr);
        updateElement(`form-name-label-ar`, contact.form_name_label_ar);
        updateElement(`form-email-label-fr`, contact.form_email_label_fr);
        updateElement(`form-email-label-ar`, contact.form_email_label_ar);
        updateElement(`form-message-label-fr`, contact.form_message_label_fr);
        updateElement(`form-message-label-ar`, contact.form_message_label_ar);
        updateElement(`form-submit-button-fr`, contact.form_submit_button_fr);
        updateElement(`form-submit-button-ar`, contact.form_submit_button_ar);
        
        // NEW: Contact Info, Hours, and Map
        updateElement(`contact-info-title-fr`, contact.contact_info_title_fr);
        updateElement(`contact-info-title-ar`, contact.contact_info_title_ar);
        updateElement(`contact-address-fr`, `<i class="fas fa-map-marker-alt text-[var(--gold-primary)] w-6 mr-2"></i>${contact.contact_address_fr || ''}`, 'html');
        updateElement(`contact-address-ar`, `<i class="fas fa-map-marker-alt text-[var(--gold-primary)] w-6 ml-2"></i>${contact.contact_address_ar || ''}`, 'html');
        updateElement(`contact-phone-fr`, `<i class="fas fa-phone text-[var(--gold-primary)] w-6 mr-2"></i>${contact.contact_phone_fr || ''}`, 'html');
        updateElement(`contact-phone-ar`, `<i class="fas fa-phone text-[var(--gold-primary)] w-6 ml-2"></i>${contact.contact_phone_ar || ''}`, 'html');
        updateElement(`contact-email-fr`, `<i class="fas fa-envelope text-[var(--gold-primary)] w-6 mr-2"></i>${contact.contact_email_fr || ''}`, 'html');
        updateElement(`contact-email-ar`, `<i class="fas fa-envelope text-[var(--gold-primary)] w-6 ml-2"></i>${contact.contact_email_ar || ''}`, 'html');
        updateElement(`contact-hours-title-fr`, contact.contact_hours_title_fr);
        updateElement(`contact-hours-title-ar`, contact.contact_hours_title_ar);
        
        const hoursContainerFr = document.getElementById('contact-hours-fr');
        const hoursContainerAr = document.getElementById('contact-hours-ar');
        if (hoursContainerFr && hoursContainerAr && contact.contact_hours) {
            hoursContainerFr.innerHTML = '';
            hoursContainerAr.innerHTML = '';
            contact.contact_hours.forEach(item => {
                hoursContainerFr.innerHTML += `<p><strong>${item.day_fr || ''}:</strong> ${item.hours || ''}</p>`;
                hoursContainerAr.innerHTML += `<p><strong>${item.day_ar || ''}:</strong> ${item.hours || ''}</p>`;
            });
        }
        
        updateElement('google-map-container', contact.google_map_iframe, 'html');

        updateElement(`whatsapp-title-fr`, contact.whatsapp_title_fr);
        updateElement(`whatsapp-title-ar`, contact.whatsapp_title_ar);
        updateElement('whatsapp-qr-code', siteSettings.whatsapp_qr_code, 'src');
        updateElement(`whatsapp-text-fr`, contact.whatsapp_text_fr);
        updateElement(`whatsapp-text-ar`, contact.whatsapp_text_ar);
        updateElement(`follow-us-title-fr`, contact.follow_us_title_fr);
        updateElement(`follow-us-title-ar`, contact.follow_us_title_ar);

        // --- MODAL CONTENT POPULATION --- //
        updateElement(`modal-title-fr`, contact.modal_success_title_fr);
        updateElement(`modal-title-ar`, contact.modal_success_title_ar);
        updateElement(`modal-text-fr`, contact.modal_success_p_fr);
        updateElement(`modal-text-ar`, contact.modal_success_p_ar);
        updateElement(`modal-button-fr`, contact.modal_success_btn_fr);
        updateElement(`modal-button-ar`, contact.modal_success_btn_ar);

        const footer = content.footer_section || {};
        updateElement(`footer-logo-text-fr`, footer.footer_logo_text_fr);
        updateElement(`footer-logo-text-ar`, footer.footer_logo_text_ar);
        updateElement(`footer-text-fr`, footer.footer_text_fr);
        updateElement(`footer-text-ar`, footer.footer_text_ar);
        const copyright_fr = footer.footer_copyright_fr || `&copy; ${new Date().getFullYear()} ${siteSettings.site_title || ''}. Tous droits réservés.`;
        const copyright_ar = footer.footer_copyright_ar || `&copy; ${new Date().getFullYear()} ${siteSettings.site_title || ''}. كل الحقوق محفوظة.`;
        updateElement(`footer-copyright-fr`, copyright_fr, 'html');
        updateElement(`footer-copyright-ar`, copyright_ar, 'html');
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
                        <img src="${image}" alt="${title || 'Product Image'}" class="w-full h-full object-cover transition-transform duration-500 hover:scale-110" loading="lazy">
                    </div>
                    <div class="p-4 text-center">
                        <h3 class="text-base md:text-xl font-serif font-bold text-gray-800">${title || ''}</h3>
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
                    <a href="${image}" data-lightbox="collection" data-title="${title || ''}">
                        <div class="rounded-lg overflow-hidden shadow-md hover:shadow-xl transition-shadow duration-300 aspect-[4/5]">
                            <img src="${image}" alt="${title || 'Gallery Image'}" class="w-full h-full object-cover transition-transform duration-500 hover:scale-110" loading="lazy">
                        </div>
                    </a>
                </div>`;
            container.insertAdjacentHTML('beforeend', galleryItemHTML);
        });
        reobserveAnimations();
    }
    
    // --- MODAL FUNCTIONS --- //
    function showModal() {
        if (successModal && modalContent) {
            successModal.classList.remove('hidden');
            setTimeout(() => {
                successModal.classList.remove('opacity-0');
                modalContent.classList.remove('scale-95', 'opacity-0');
            }, 10);
        }
    }

    function hideModal() {
        if (successModal && modalContent) {
            modalContent.classList.add('scale-95', 'opacity-0');
            successModal.classList.add('opacity-0');
            setTimeout(() => {
                successModal.classList.add('hidden');
            }, 300); // Match transition duration
        }
    }

    // --- UI & EVENT HANDLERS --- //
    function setupEventListeners() {
        if (languageSwitchBtn) {
            languageSwitchBtn.addEventListener('click', () => {
                const newLang = currentLang === 'ar' ? 'fr' : 'ar';
                setLanguage(newLang);
            });
        }

        if (menuBtn) {
            menuBtn.addEventListener('click', toggleMenu);
        }

        document.querySelectorAll('a[href^="#"]').forEach(anchor => {
            anchor.addEventListener('click', function (e) {
                if (body.classList.contains('menu-open')) toggleMenu();
                const targetId = this.getAttribute('href');
                if (targetId.length > 1) {
                    const targetElement = document.querySelector(targetId);
                    if (targetElement) {
                        e.preventDefault();
                        const headerHeight = document.getElementById('header').offsetHeight;
                        const elementPosition = targetElement.getBoundingClientRect().top;
                        const offsetPosition = elementPosition + window.pageYOffset - headerHeight;
                        window.scrollTo({ top: offsetPosition, behavior: 'smooth' });
                    }
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

        // --- FORM & MODAL LISTENERS --- //
        if (contactForm) {
            contactForm.addEventListener('submit', function(e) {
                e.preventDefault();
                // This is where you would typically send form data to a server.
                // For this demo, we just show the success modal.
                console.log('Form submitted!');
                showModal();
                contactForm.reset(); // Optional: reset the form after submission.
            });
        }

        if (closeModalBtn) {
            closeModalBtn.addEventListener('click', hideModal);
        }

        if (successModal) {
            successModal.addEventListener('click', function(e) {
                // Close the modal if the user clicks on the background overlay.
                if (e.target === successModal) {
                    hideModal();
                }
            });
        }
    }
    
    function setLanguage(lang, isInitialLoad = false) {
        currentLang = lang;
        localStorage.setItem('preferredLanguage', lang);
        htmlEl.lang = lang;
        htmlEl.dir = lang === 'ar' ? 'rtl' : 'ltr';
        
        document.querySelectorAll('[data-lang]').forEach(el => {
            if(el.dataset.lang !== lang) {
                el.classList.add('hidden');
            } else {
                el.classList.remove('hidden');
            }
        });
        
        if (languageSwitchBtn) {
            languageSwitchBtn.textContent = lang === 'ar' ? 'FR' : 'AR';
        }
        
        populateContent(lang);
        renderProducts(lang);
        renderGallery(document.querySelector('.filter-btn.active')?.dataset.filter || 'all');
        
        if (!isInitialLoad) {
            reobserveAnimations();
        }
    }

    function toggleMenu() {
        if (menuBtn && mobileMenu && body) {
            menuBtn.classList.toggle('open');
            mobileMenu.classList.toggle('open');
            body.classList.toggle('menu-open');
        }
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
