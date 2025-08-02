// =================================================================
// ==                  Main Application Logic                     ==
// =================================================================

document.addEventListener('DOMContentLoaded', async function() {

  // --- 1. Global State & Variables ---
  let currentLang = localStorage.getItem('preferredLanguage') || 'fr';
  let cmsData = {}; // This will hold the data fetched from home.yml
  const galleryData = [ // This gallery data remains static for now
      { category: 'bagues', img: 'https://images.unsplash.com/photo-1605100804763-247f67b3557e?q=80&w=1080&h=1350&fit=crop', title_fr: 'Bague Émeraude Royale', title_ar: 'خاتم الزمرد الملكي' },
      { category: 'colliers', img: 'https://images.unsplash.com/photo-1610495144218-ab65d2282427?q=80&w=1080&h=1350&fit=crop', title_fr: 'Pendentif Coeur de l\'Océan', title_ar: 'قلادة قلب المحيط' },
      { category: 'bracelets', img: 'https://images.unsplash.com/photo-1611601338338-53a4d1f2718e?q=80&w=1080&h=1350&fit=crop', title_fr: 'Jonc en Argent Massif', title_ar: 'سوار من الفضة الخالصة' },
      { category: 'montres', img: 'https://images.unsplash.com/photo-1622434641406-a158123450f9?q=80&w=1080&h=1350&fit=crop', title_fr: 'Montre Classique Cuir', title_ar: 'ساعة كلاسيكية بجلد' },
      // Add other gallery items here
  ];

  // DOM Elements
  const galleryContainer = document.querySelector('.gallery-container');
  const languageSwitchBtn = document.getElementById('languageSwitch');
  const htmlEl = document.documentElement;
  const menuBtn = document.getElementById('menuBtn');
  const mobileMenu = document.getElementById('mobileMenu');
  const body = document.body;

  // --- 2. Data Fetching ---
  async function loadDynamicContent() {
    try {
      const response = await fetch('/content/home.yml');
      if (!response.ok) {
        console.error('Could not fetch CMS content.');
        return;
      }
      const yamlText = await response.text();
      const data = {};
      yamlText.split('\n').forEach(line => {
        const parts = line.split(':');
        if (parts.length > 1) {
          const key = parts[0].trim();
          const value = parts.slice(1).join(':').trim().replace(/^['"]|['"]$/g, '');
          data[key] = value;
        }
      });
      cmsData = data; // Store the fetched data in the global variable
    } catch (error) {
      console.error('Error loading dynamic content:', error);
    }
  }

  // --- 3. Rendering & UI Functions ---

  function updatePageContent() {
    if (Object.keys(cmsData).length === 0) return; // Don't run if data isn't loaded

    const updateText = (id, value) => {
      const element = document.getElementById(id);
      if (element && value) element.textContent = value;
    };
    const updateImage = (id, src) => {
      const element = document.getElementById(id);
      if (element && src) element.src = src;
    };
    const updateLink = (id, href) => {
      const element = document.getElementById(id);
      if (element && href) element.href = href;
    };

    // Update all elements with data from CMS
    updateText('hero-title-ar', cmsData.hero_title);
    updateText('hero-subtitle-ar', cmsData.hero_text);
    updateImage('hero-image', cmsData.hero_image);
    updateText('hero-button-ar', cmsData.cta_text);
    updateText('about-title-ar', cmsData.about_title);
    updateText('about-story-text-ar', cmsData.about_text);
    updateImage('about-image', cmsData.about_image);
    updateText('collections-title-ar', cmsData.collections_title);
    updateText('collections-subtitle-ar', cmsData.collections_text);
    updateText('contact-title-ar', cmsData.contact_title);
    updateText('contact-subtitle-ar', cmsData.contact_text);
    updateText('contact-address-ar', cmsData.contact_address);
    updateText('contact-phone-ar', cmsData.contact_phone);
    updateText('contact-email-ar', cmsData.contact_email);
    const mapIframe = document.getElementById('google-map');
    if (mapIframe && cmsData.contact_map) mapIframe.src = cmsData.contact_map;
    updateText('footer-slogan-ar', cmsData.footer_text);
    updateText('footer-copyright-ar', cmsData.footer_rights);
    updateLink('social-link-facebook', cmsData.facebook_link);
    updateLink('social-link-instagram', cmsData.instagram_link);
    updateLink('social-link-pinterest', cmsData.pinterest_link);
  }

  function renderGallery(filter = 'all') {
    if (!galleryContainer) return;
    galleryContainer.innerHTML = '';
    const filteredData = filter === 'all' ? galleryData : galleryData.filter(item => item.category === filter);
    
    filteredData.forEach(item => {
        const title = htmlEl.lang === 'ar' ? item.title_ar : item.title_fr;
        const galleryItemHTML = `
            <div class="gallery-item scroll-animate" data-category="${item.category}">
                <a href="${item.img.replace('&w=1080&h=1350&fit=crop', '')}" data-lightbox="collection" data-title="${title}">
                    <div class="rounded-lg overflow-hidden shadow-md hover:shadow-xl transition-shadow duration-300 aspect-[4/5]">
                        <img src="${item.img}" alt="${title}" class="w-full h-full object-cover transition-transform duration-500 hover:scale-110">
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
    htmlEl.lang = lang;
    htmlEl.dir = lang === 'ar' ? 'rtl' : 'ltr';
    
    document.querySelectorAll('[data-lang]').forEach(el => {
        el.classList.toggle('hidden', el.dataset.lang !== lang);
    });
    
    if (languageSwitchBtn) languageSwitchBtn.textContent = lang === 'ar' ? 'FR' : 'AR';
    
    // Update the title dynamically
    const titleKey = lang === 'ar' ? 'site_title_ar' : 'site_title_fr';
    document.title = cmsData[titleKey] || (lang === 'ar' ? 'مجوهرات إليجانس' : 'Bijouterie Élégance');
    
    renderGallery(document.querySelector('.filter-btn.active')?.dataset.filter || 'all');
  }

  function toggleMenu() {
    if (!menuBtn || !mobileMenu) return;
    menuBtn.classList.toggle('open');
    mobileMenu.classList.toggle('open');
    body.classList.toggle('menu-open');
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
  document.querySelectorAll('.scroll-animate').forEach(el => scrollObserver.observe(el));

  // Attach event listeners
  if (menuBtn) menuBtn.addEventListener('click', toggleMenu);
  if (languageSwitchBtn) languageSwitchBtn.addEventListener('click', () => setLanguage(currentLang === 'ar' ? 'fr' : 'ar'));

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

  document.querySelectorAll('.filter-btn').forEach(btn => {
    btn.addEventListener('click', () => {
        const currentActive = document.querySelector('.filter-btn.active');
        if (currentActive) {
            currentActive.classList.remove('btn-gold', 'active');
            currentActive.classList.add('btn-outline-gold');
        }
        btn.classList.add('btn-gold', 'active');
        btn.classList.remove('btn-outline-gold');
        renderGallery(btn.dataset.filter);
    });
  });

  // Update current year in footer
  document.querySelectorAll('.currentYear').forEach(span => {
    span.textContent = new Date().getFullYear();
  });
  
  // Lightbox options
  if (typeof lightbox !== 'undefined') {
    lightbox.option({
      'resizeDuration': 200,
      'wrapAround': true,
      'albumLabel': "Image %1 / %2"
    });
  }
  
  // --- Initial Page Load ---
  await loadDynamicContent(); // Wait for CMS data to be fetched
  updatePageContent();       // Populate the page with the fetched data
  setLanguage(currentLang);  // Set the initial language and render language-specific content
});
