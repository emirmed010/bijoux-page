document.addEventListener('DOMContentLoaded', async function() {

    // =================================================================
    // ==                  GLOBAL STATE & HELPERS                   ==
    // =================================================================

    let currentLang = localStorage.getItem('preferredLanguage') || 'fr';
    let cmsData = {
        settings: {},
        home: {}
        // Dynamic collections like products/gallery can be added here
    };

    // Helper functions with built-in debugging
    const updateText = (id, value) => {
        const element = document.getElementById(id);
        if (element && value) {
            element.textContent = value;
        } else if (!element && value) {
            // Only warn if there was data but no element to put it in
            console.warn(`[Debug] Element with id #${id} was NOT FOUND in HTML.`);
        }
    };
    const updateImage = (id, src) => {
        const element = document.getElementById(id);
        if (element && src) {
            element.src = src;
        } else if (!element && src) {
            console.warn(`[Debug] Element with id #${id} was NOT FOUND in HTML.`);
        }
    };
    const updateHref = (id, href) => {
        const element = document.getElementById(id);
        if (element && href) {
            element.href = href;
        } else if (!element && href) {
            console.warn(`[Debug] Element with id #${id} was NOT FOUND in HTML.`);
        }
    };
    const updateMeta = (name, content) => {
        let element = document.querySelector(`meta[name="${name}"]`);
        if (element && content) {
            element.content = content;
        }
    };
    const updateFormAction = (id, action) => {
        const element = document.getElementById(id);
        if (element && action) {
            element.action = action;
        }
    };
    const updateInnerHTML = (id, html) => {
        const element = document.getElementById(id);
        if (element && html) {
            element.innerHTML = html;
        }
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


    // =================================================================
    // ==                    RENDERING LOGIC                          ==
    // =================================================================

    function renderPageContent() {
        const settings = cmsData.settings || {};
        const home = cmsData.home || {};
        const lang = currentLang;

        console.log("[Debug] Rendering content for language:", lang);
        console.log("[Debug] Home data:", home);

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
        updateHref('hero-button-link', home.hero_button_link); // Assuming the <a> tag has this ID

        // --- 4. "Bienvenue" Section (Uses 'about' data from CMS) ---
        updateImage('welcome-image', home.about_image);
        updateText(`welcome-title-${lang}`, home[`about_title_${lang}`]);
        updateText(`welcome-text-${lang}`, home[`about_text_${lang}`]);
        updateText(`welcome-button-${lang}`, home[`about_button_text_${lang}`]);
        updateHref('welcome-button-link', home.about_button_link); // Assuming the <a> tag has this ID

        // --- 5. "Notre Histoire" Section (Uses 'story' data from CMS) ---
        updateText(`about-title-${lang}`, home[`story_title_${lang}`]);
        updateText(`about-subtitle-${lang}`, home[`story_intro_${lang}`]);
        updateText(`about-quote-${lang}`, home[`story_quote_${lang}`]);
        updateImage('about-image', home.story_image); // Note: This will overwrite the previous about-image. Ensure your IDs are unique if needed.
        
        // --- 6. Contact Section ---
        updateText(`contact-title-${lang}`, home[`contact_title_${lang}`]);
        updateText(`contact-subtitle-${lang}`, home[`contact_text_${lang}`]);
        updateFormAction('contactForm', home.form_shortcode);
        updateText(`contact-address-${lang}`, home[`contact_address_${lang}`]);
        updateText(`contact-phone-fr`, home.contact_phone);
        updateText(`contact-phone-ar`, home.contact_phone);
        updateText(`contact-email-fr`, home.contact_email);
        updateText(`contact-email-ar`, home.contact_email);
        const mapFrame = document.getElementById('google-map');
        if (mapFrame && home.contact_map_embed) mapFrame.src = home.contact_map_embed;

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

        // --- Original Event Listeners ---
        const languageSwitchBtn = document.getElementById('languageSwitch');
        if (languageSwitchBtn) {
            languageSwitchBtn.addEventListener('click', () => setLanguage(currentLang === 'ar' ? 'fr' : 'ar'));
        }
        // Add other listeners from your original file...
    }

    initializePage();
});
