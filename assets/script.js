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
        if (!element) {
            element = document.createElement('meta');
            element.name = name;
            document.head.appendChild(element);
        }
        if (content) element.content = content;
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

    // NOTE: This is a way to fetch folder collection items without a build step.
    // It assumes your slugs are simple (e.g., product-1, product-2).
    async function fetchFolderCollection(folderPath) {
        // This is a simplified approach. It's better to have a manifest file.
        // For this to work, you MUST name your files in the CMS with simple slugs
        // like "produit-1", "produit-2", "bague-diamant", etc.
        // We will assume a list of known slugs for now.
        // TODO: Replace this with a real list of your product/gallery slugs.
        const itemSlugs = ['item-1', 'item-2', 'item-3', 'item-4']; // Example slugs
        const promises = itemSlugs.map(slug => fetchData(`/content/${folderPath}/${slug}.md`));
        const results = await Promise.all(promises);
        return results.filter(r => r !== null);
    }


    // =================================================================
    // ==                    RENDERING LOGIC                          ==
    // =================================================================

    function renderStaticContent() {
        const settings = cmsData.settings || {};
        const home = cmsData.home || {};
        const lang = currentLang;

        // --- Settings ---
        document.title = settings.site_title || 'Bijouterie Élégance';
        updateMeta('description', settings.site_description);
        updateImage('favicon', settings.site_favicon); // Assumes <link id="favicon">
        updateImage('header-logo-img', settings.site_logo); // Assumes <img id="header-logo-img"> in your header
        updateHref('social-link-facebook', settings.social_facebook);
        updateHref('social-link-instagram', settings.social_instagram);
        updateHref('social-link-pinterest', settings.social_pinterest);

        // --- Header & Footer ---
        updateText(`brand-${lang}`, home[`header_logo_text_${lang}`]);
        updateText(`footer-brand-${lang}`, home[`footer_logo_text_${lang}`]);
        updateText(`footer-slogan-${lang}`, home[`footer_text_${lang}`]);
        updateText(`footer-copyright-${lang}`, home[`footer_copyright_${lang}`]);
        updateText(`footer-design-credit-${lang}`, home[`footer_credit_${lang}`]);

        // --- Page Sections ---
        updateImage('hero-image', home.hero_background);
        updateText(`hero-title-${lang}`, home[`hero_title_${lang}`]);
        updateText(`hero-subtitle-${lang}`, home[`hero_subtitle_${lang}`]);
        updateText(`hero-button-${lang}`, home[`hero_button_text_${lang}`]);
        updateHref('hero-button-link', home.hero_button_link);

        updateImage('welcome-image', home.about_image);
        updateText(`welcome-title-${lang}`, home[`about_title_${lang}`]);
        updateText(`welcome-text-${lang}`, home[`about_text_${lang}`]);
        updateText(`welcome-button-${lang}`, home[`about_button_text_${lang}`]);
        updateHref('welcome-button-link', home.about_button_link);
        
        updateText(`about-title-${lang}`, home[`story_title_${lang}`]);
        updateText(`about-subtitle-${lang}`, home[`story_intro_${lang}`]);
        updateText(`about-quote-${lang}`, home[`story_quote_${lang}`]);
        updateImage('about-image', home.story_image);
        
        updateText(`contact-title-${lang}`, home[`contact_title_${lang}`]);
        updateText(`contact-subtitle-${lang}`, home[`contact_text_${lang}`]);
        const contactForm = document.getElementById('contactForm');
        if(contactForm && home.form_shortcode) contactForm.action = home.form_shortcode;
        updateText(`contact-address-${lang}`, home[`contact_address_${lang}`]);
        updateText(`contact-phone-fr`, home.contact_phone);
        updateText(`contact-phone-ar`, home.contact_phone);
        updateText(`contact-email-fr`, home.contact_email);
        updateText(`contact-email-ar`, home.contact_email);
        const mapFrame = document.getElementById('google-map');
        if (mapFrame && home.contact_map_embed) mapFrame.innerHTML = home.contact_map_embed;
    }

    function renderProducts() {
        const container = document.getElementById('featured-products-grid');
        if (!container || !cmsData.products) return;
        container.innerHTML = ''; // Clear existing static content

        cmsData.products.forEach(item => {
            const title = currentLang === 'ar' ? item.produit_title_ar : item.produit_title_fr;
            const cardHTML = `
                <div class="collection-card bg-white rounded-lg scroll-animate">
                    <div class="rounded-lg overflow-hidden shadow-lg aspect-[4/5]">
                        <img src="${item.produit_image}" alt="${title}" class="w-full h-full object-cover transition-transform duration-500 hover:scale-110">
                    </div>
                    <div class="p-4 text-center">
                        <h3 class="text-base md:text-xl font-serif font-bold text-gray-800">${title}</h3>
                    </div>
                </div>
            `;
            container.insertAdjacentHTML('beforeend', cardHTML);
        });
    }

    function renderGallery(filter = 'all') {
        const container = document.querySelector('.gallery-container');
        if (!container || !cmsData.gallery) return;
        container.innerHTML = '';

        const filteredData = filter === 'all' 
            ? cmsData.gallery 
            : cmsData.gallery.filter(item => item.collection_category === filter);
        
        filteredData.forEach(item => {
            const title = currentLang === 'ar' ? item.collection_title_ar : item.collection_title_fr;
            const cardHTML = `
                <div class="gallery-item scroll-animate" data-category="${item.collection_category}">
                    <a href="${item.collection_image}" data-lightbox="collection" data-title="${title}">
                        <div class="rounded-lg overflow-hidden shadow-md hover:shadow-xl transition-shadow duration-300 aspect-[4/5]">
                            <img src="${item.collection_image}" alt="${title}" class="w-full h-full object-cover transition-transform duration-500 hover:scale-110">
                        </div>
                    </a>
                </div>
            `;
            container.insertAdjacentHTML('beforeend', cardHTML);
        });
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
        
        renderStaticContent();
        renderProducts();
        renderGallery(document.querySelector('.filter-btn.active')?.dataset.filter || 'all');
    }

    async function initializePage() {
        // Fetch all data
        const [settings, home, products, gallery] = await Promise.all([
            fetchData('/content/data/settings.yml'),
            fetchData('/content/data/home.yml'),
            fetchFolderCollection('products'),  // Fetch dynamic products
            fetchFolderCollection('gallery')    // Fetch dynamic gallery items
        ]);
        
        cmsData = { settings, home, products, gallery };

        setLanguage(currentLang);

        // Attach event listeners
        const languageSwitchBtn = document.getElementById('languageSwitch');
        if (languageSwitchBtn) {
            languageSwitchBtn.addEventListener('click', () => setLanguage(currentLang === 'ar' ? 'fr' : 'ar'));
        }
        
        document.querySelectorAll('.filter-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                document.querySelector('.filter-btn.active')?.classList.remove('active');
                btn.classList.add('active');
                renderGallery(btn.dataset.filter);
            });
        });
        
        // Add other listeners...
    }

    initializePage();
});
