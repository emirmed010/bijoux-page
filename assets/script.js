// =================================================================
// ==                      Main Application Logic                 ==
// =================================================================

document.addEventListener('DOMContentLoaded', async function() {

  // --- 1. Global State & Variables ---
  let currentLang = localStorage.getItem('preferredLanguage') || 'fr';
  let cmsData = {
    settings: {},
    home: {},
    gallery: []
    // We will add products here later
  };

  // --- 2. Data Fetching ---
  
  // Fetches and parses a single YAML file
  async function fetchData(url) {
    try {
      const response = await fetch(url);
      if (!response.ok) {
        // Don't log an error if the file simply doesn't exist yet
        if (response.status === 404) return null;
        throw new Error(`Failed to fetch: ${response.statusText}`);
      }
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
      console.error(`Error loading data from ${url}:`, error);
      return null;
    }
  }
  
  // NOTE: Fetching a whole folder of items is more complex and usually requires a build step
  // or using the GitHub API. For now, we will simulate it by fetching a predefined list.
  // This needs to be replaced with a real implementation for the gallery/products to be dynamic.
  async function fetchCollection(collectionName, fileList) {
      const promises = fileList.map(file => fetchData(`/content/${collectionName}/${file}.md`));
      const results = await Promise.all(promises);
      return results.filter(r => r !== null); // Filter out any that failed to load
  }


  // --- 3. Rendering & UI Functions ---

  function updatePageContent() {
    const settings = cmsData.settings;
    const home = cmsData.home;
    const lang = currentLang;

    // Helper functions
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

    // --- Update page from CMS data ---
    
    // Settings
    document.title = settings.site_title || document.title;
    updateImage('favicon', settings.site_favicon);
    updateHref('social-link-facebook', settings.social_facebook);
    updateHref('social-link-instagram', settings.social_instagram);
    updateHref('social-link-pinterest', settings.social_pinterest);

    // Header
    updateText(`brand-${lang}`, home[`header_logo_text_${lang}`]);

    // Hero
    updateImage('hero-image', home.hero_background);
    updateText(`hero-title-${lang}`, home[`hero_title_${lang}`]);
    updateText(`hero-subtitle-${lang}`, home[`hero_subtitle_${lang}`]);
    updateText(`hero-button-${lang}`, home[`hero_button_text_${lang}`]);

    // Add other sections here...
    // Example for "Welcome" section
    updateImage('welcome-image', home.about_image);
    updateText(`welcome-title-${lang}`, home[`about_title_${lang}`]);
    updateText(`welcome-text-${lang}`, home[`about_text_${lang}`]);
    updateText(`welcome-button-${lang}`, home[`about_button_text_${lang}`]);
  }

  function renderGallery(filter = 'all') {
    const galleryContainer = document.querySelector('.gallery-container');
    if (!galleryContainer) return;
    galleryContainer.innerHTML = '';
    
    const dataToRender = (cmsData.gallery.length > 0) ? cmsData.gallery : [];

    const filteredData = filter === 'all' ? dataToRender : dataToRender.filter(item => item.collection_category === filter);
    
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
            </div>
        `;
        galleryContainer.insertAdjacentHTML('beforeend', galleryItemHTML);
    });

    // Re-initialize scroll observer for new items
    document.querySelectorAll('.scroll-animate:not(.is-visible)').forEach(el => scrollObserver.observe(el));
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
    
    // Re-render dynamic parts
    updatePageContent();
    renderGallery(document.querySelector('.filter-btn.active')?.dataset.filter || 'all');
  }

  // --- 4. Event Listeners & Initialization ---

  // Scroll observer for animations
  const scrollObserver = new IntersectionObserver((entries, observer) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-visible');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.1 });

  async function initializePage() {
    // Fetch all data first
    const [settings, home] = await Promise.all([
        fetchData('/content/data/settings.yml'),
        fetchData('/content/data/home.yml'),
        // In a real app, you would dynamically get the list of gallery files
        // For now, we assume you have two files: item-1.md and item-2.md
        // fetchCollection('gallery', ['item-1', 'item-2']) 
    ]);
    cmsData.settings = settings || {};
    cmsData.home = home || {};
    // cmsData.gallery = galleryItems || [];

    // Initial render
    setLanguage(currentLang);

    // Set up all event listeners
    const languageSwitchBtn = document.getElementById('languageSwitch');
    if (languageSwitchBtn) {
        languageSwitchBtn.addEventListener('click', () => {
            setLanguage(currentLang === 'ar' ? 'fr' : 'ar');
        });
    }
    
    document.querySelectorAll('.filter-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        document.querySelector('.filter-btn.active')?.classList.remove('btn-gold', 'active');
        btn.classList.add('btn-gold', 'active');
        renderGallery(btn.dataset.filter);
      });
    });

    // Animate initial elements
    document.querySelectorAll('.scroll-animate').forEach(el => scrollObserver.observe(el));
  }

  initializePage();
});
