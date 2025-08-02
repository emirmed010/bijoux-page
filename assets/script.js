document.addEventListener('DOMContentLoaded', function() {
    
    // بيانات المعرض
    const galleryData = [
        { category: 'bagues', img: 'https://images.unsplash.com/photo-1605100804763-247f67b3557e?q=80&w=1080&h=1350&fit=crop', title_fr: 'Bague Émeraude Royale', title_ar: 'خاتم الزمرد الملكي' },
        { category: 'bagues', img: 'https://images.unsplash.com/photo-1611591437313-42a4a93d8b18?q=80&w=1080&h=1350&fit=crop', title_fr: 'Alliance Tressée en Or Rose', title_ar: 'خاتم زواج مضفر من الذهب الوردي' },
        { category: 'colliers', img: 'https://images.unsplash.com/photo-1610495144218-ab65d2282427?q=80&w=1080&h=1350&fit=crop', title_fr: 'Pendentif Coeur de l\'Océan', title_ar: 'قلادة قلب المحيط' },
        { category: 'colliers', img: 'https://images.unsplash.com/photo-1595809935238-593ff5a9699a?q=80&w=1080&h=1350&fit=crop', title_fr: 'Collier de Perles Fines', title_ar: 'عقد من اللؤلؤ الفاخر' },
        { category: 'bracelets', img: 'https://images.unsplash.com/photo-1611601338338-53a4d1f2718e?q=80&w=1080&h=1350&fit=crop', title_fr: 'Jonc en Argent Massif', title_ar: 'سوار من الفضة الخالصة' },
        { category: 'montres', img: 'https://images.unsplash.com/photo-1622434641406-a158123450f9?q=80&w=1080&h=1350&fit=crop', title_fr: 'Montre Classique Cuir', title_ar: 'ساعة كلاسيكية بجلد' },
        { category: 'montres', img: 'https://images.unsplash.com/photo-1587836374828-24c96634b2b9?q=80&w=1080&h=1350&fit=crop', title_fr: 'Montre de Luxe Automatique', title_ar: 'ساعة فاخرة أوتوماتيكية' },
        { category: 'bracelets', img: 'https://images.unsplash.com/photo-1508361001413-7a9dca2cde85?q=80&w=1080&h=1350&fit=crop', title_fr: 'Bracelet Manchette Or', title_ar: 'سوار عريض من الذهب' }
    ];

    // الحصول على عناصر DOM
    const galleryContainer = document.querySelector('.gallery-container');
    const languageSwitchBtn = document.getElementById('languageSwitch');
    const htmlEl = document.documentElement;
    const menuBtn = document.getElementById('menuBtn');
    const mobileMenu = document.getElementById('mobileMenu');
    const body = document.body;
    let currentLang = localStorage.getItem('preferredLanguage') || 'fr';

    // دالة لعرض عناصر المعرض
    function renderGallery(filter = 'all') {
        galleryContainer.innerHTML = '';
        const filteredData = filter === 'all' ? galleryData : galleryData.filter(item => item.category === filter);
        
        filteredData.forEach(item => {
            const lang = htmlEl.lang;
            const title = lang === 'ar' ? item.title_ar : item.title_fr;
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
        // إعادة تهيئة مراقب التمرير للعناصر الجديدة
        document.querySelectorAll('.scroll-animate:not(.is-visible)').forEach(el => scrollObserver.observe(el));
    }

    // دالة لضبط اللغة
    function setLanguage(lang) {
        currentLang = lang;
        localStorage.setItem('preferredLanguage', lang);
        htmlEl.lang = lang;
        htmlEl.dir = lang === 'ar' ? 'rtl' : 'ltr';
        
        document.querySelectorAll('[data-lang]').forEach(el => {
            el.classList.toggle('hidden', el.dataset.lang !== lang);
        });
        
        languageSwitchBtn.textContent = lang === 'ar' ? 'FR' : 'AR';
        renderGallery(document.querySelector('.filter-btn.active')?.dataset.filter || 'all');
        document.title = lang === 'ar' ? 'مجوهرات إليجانس - إبداعات فريدة' : 'Bijouterie Élégance - Créations Uniques';
    }

    // دالة لفتح وإغلاق القائمة الجانبية
    function toggleMenu() {
        menuBtn.classList.toggle('open');
        mobileMenu.classList.toggle('open');
        body.classList.toggle('menu-open');
    }

    // إضافة مستمعي الأحداث
    menuBtn.addEventListener('click', toggleMenu);
    languageSwitchBtn.addEventListener('click', () => setLanguage(currentLang === 'ar' ? 'fr' : 'ar'));

    // التعامل مع التنقل السلس للروابط الداخلية
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

    // مراقب التمرير لإظهار العناصر عند الوصول إليها
    const scrollObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('is-visible');
                observer.unobserve(entry.target);
            }
        });
    }, { threshold: 0.1 });

    document.querySelectorAll('.scroll-animate').forEach(el => scrollObserver.observe(el));

    // التعامل مع أزرار تصفية المعرض
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

    // تحديث السنة الحالية في التذييل
    document.querySelectorAll('.currentYear').forEach(span => {
        span.textContent = new Date().getFullYear();
    });
    
    // إعدادات Lightbox
    lightbox.option({
      'resizeDuration': 200,
      'wrapAround': true,
      'albumLabel': "Image %1 / %2"
    });

    // ضبط اللغة عند تحميل الصفحة
    setLanguage(currentLang);
});
