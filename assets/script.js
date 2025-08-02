document.addEventListener('DOMContentLoaded', async function() {

    // =================================================================
    // ==                  GLOBAL STATE & HELPERS                   ==
    // =================================================================

    let currentLang = localStorage.getItem('preferredLanguage') || 'fr';
    let cmsData = {
        settings: {},
        home: {},
        products: [],
        gallery: []
    };

    // Helper functions to safely update the DOM
    const updateText = (id, value) => {
        const element = document.getElementById(id);
        if (element && value) element.textContent = value;
    };
    const updateImage = (id, src) => {
        const element = document.getElementById(id);
        if (element && src) element.src = src;
    };
    const updateHref = (id, href) => {
        const element = document.getElementById(id);
        if (element && href) element.href = href;
    };
    const updateMeta = (name, content) => {
        let element = document.querySelector(`meta[name="${name}"]`);
        if (element && content) element.content = content;
    };
    const updateFormAction = (id, action) => {
        const element = document.getElementById(id);
        if (element && action) element.action = action;
    };
    const updateInnerHTML = (id, html) => {
        const element = document.getElementById(id);
        if (element && html) element.innerHTML = html;
    };


    // =================================================================
    // ==                    DATA FETCHING & PARSING                  ==
    // =================================================================

    async function fetchData(url) {
        try {
            const response = await fetch(url);
            if (response.status === 404) return null;
            if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
            const yamlText = await response.text();
            const data = {};
            yamlText.split('\n').forEach(line => {
                const parts = line.split(':');
                if (parts.length > 1) {
                    const key = parts[0].trim();
                    const value = parts.slice(1).join(':').trim().replace(/^['"]|['"]$/g, '');
                    if (key) data[key] = value;
                }
            });
            return data;
        } catch (error) {
            console.error(`Failed to fetch or parse ${url}:`, error);
            return null;
        }
    }
    
    // NOTE: This is a placeholder for fetching folder collections.
    // A real implementation requires a build step or using the GitHub API.
    async function fetchFolderCollection(folderPath, slugs = []) {
        if (slugs.length === 0) return []; // Return empty if no slugs are provided
        const promises = slugs.map(slug => fetchData(`/content/${folderPath}/${slug}.md`));
        const results = await Promise.all(promises);
        return results.filter(r => r !== null);
    }


    // =================================================================
    // ==                    RENDERING LOGIC                          ==
    // =================================================================

    function renderPageContent() {
        const settings = cmsData.settings || {};
        const home = cmsData.home || {};
        const lang = currentLang;

        // --- 1. General Settings ---
        document.title = settings.site_title || 'Bijouterie Élégance';
        updateMeta('description', settings.site_description);
        updateImage('favicon', settings.site_favicon);
        updateHref('social-link-facebook', settings.social_facebook);
        updateHref('social-link-instagram', settings.social_instagram);
        updateHref('social-link-pinterest', settings.social_pinterest);

        // --- 2. Header ---
        updateText(`brand-${lang}`, home[`header_logo_text_${lang}`]);

        // --- 3. Hero Section ---
        updateImage('hero-image', home.hero_background);
        updateText(`hero-title-${lang}`, home[`hero_title_${lang}`]);
        updateText(`hero-subtitle-${lang}`, home[`hero_subtitle_${lang}`]);
        updateText(`hero-button-${lang}`, home[`hero_button_text_${lang}`]);
        updateHref('hero-button-link', home.hero_button_link);

        // --- 4. "Bienvenue" Section (Uses 'about' data from CMS) ---
        updateImage('welcome-image', home.about_image);
        updateText(`welcome-title-${lang}`, home[`about_title_${lang}`]);
        updateText(`welcome-text-${lang}`, home[`about_text_${lang}`]);
        updateText(`welcome-button-${lang}`, home[`about_button_text_${lang}`]);
        updateHref('welcome-button-link', home.about_button_link);
        
        // --- 5. "Notre Histoire" Section (Uses 'story' data from CMS) ---
        updateText(`about-title-${lang}`, home[`story_title_${lang}`]);
        updateText(`about-subtitle-${lang}`, home[`story_intro_${lang}`]);
        updateText(`about-quote-${lang}`, home[`story_quote_${lang}`]);
        updateImage('about-image', home.story_image);
        
        // --- 6. Contact Section ---
        updateText(`contact-title-${lang}`, home[`contact_title_${lang}`]);
        updateText(`contact-subtitle-${lang}`, home[`contact_text_${lang}`]);
        updateFormAction('contactForm', home.form_shortcode);
        updateText(`contact-address-${lang}`, home[`contact_address_${lang}`]);
        updateText(`contact-phone-fr`, home.contact_phone);
        updateText(`contact-phone-ar`, home.contact_phone);
        updateText(`contact-email-fr`, home.contact_email);
        updateText(`contact-email-ar`, home.contact_email);
        const mapContainer = document.getElementById('google-map-container');
        if (mapContainer && home.contact_map_embed) {
            updateInnerHTML('google-map-container', home.contact_map_embed);
        }

        // --- 7. Footer ---
        updateText(`footer-brand-${lang}`, home[`footer_logo_text_${lang}`]);
        updateText(`footer-slogan-${lang}`, home[`footer_text_${lang}`]);
        updateText(`footer-copyright-${lang}`, home[`footer_copyright_${lang}`]);
        updateText(`footer-design-credit-${lang}`, home[`footer_credit_${lang}`]);
    }
    
    function setLanguage(lang) {
        currentLang = lang;
        localStorage.setItem('preferredLanguage', lang);
        document.documentElement.lang = lang;
        document.documentElement.dir = lang === 'ar' ? 'rtl' : 'ltr';
        
        document.querySelectorAll('[data-lang]').forEach(el => {
            el.classList.toggle('hidden', el.dataset.lang !== lang);
        });
        
        const languageSwitchBtn = document.getElementById('languageSwitch');
        if (languageSwitchBtn) languageSwitchBtn.textContent = lang === 'ar' ? 'FR' : 'AR';
        
        renderPageContent();
    }

    // =================================================================
    // ==                       INITIALIZATION                        ==
    // =================================================================
    
    async function initializePage() {
        const [settings, home] = await Promise.all([
            fetchData('/content/data/settings.yml'),
            fetchData('/content/data/home.yml')
        ]);
        
        cmsData.settings = settings;
        cmsData.home = home;

        setLanguage(currentLang);

        // --- Original Event Listeners from your file ---
        const languageSwitchBtn = document.getElementById('languageSwitch');
        if (languageSwitchBtn) {
            languageSwitchBtn.addEventListener('click', () => setLanguage(currentLang === 'ar' ? 'fr' : 'ar'));
        }
        
        const menuBtn = document.getElementById('menuBtn');
        const mobileMenu = document.getElementById('mobileMenu');
        const body = document.body;
        if(menuBtn) {
            menuBtn.addEventListener('click', () => {
                menuBtn.classList.toggle('open');
                mobileMenu.classList.toggle('open');
                body.classList.toggle('menu-open');
            });
        }
        
        document.querySelectorAll('a[href^="#"]').forEach(anchor => {
            anchor.addEventListener('click', function (e) {
                if (body.classList.contains('menu-open')) {
                    menuBtn.click(); // Close menu if open
                }
                // Smooth scroll logic can be kept as is
            });
        });
        
        // Add other listeners...
    }

    initializePage();
});
