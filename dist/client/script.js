const menuButton = document.querySelector('[data-menu-button]');
const mobileMenu = document.querySelector('[data-mobile-menu]');

menuButton.addEventListener('click', () => {
  const isOpen = mobileMenu.classList.toggle('open');
  menuButton.setAttribute('aria-expanded', String(isOpen));
});

mobileMenu.querySelectorAll('a').forEach((link) => link.addEventListener('click', () => {
  mobileMenu.classList.remove('open');
  menuButton.setAttribute('aria-expanded', 'false');
}));

document.querySelector('[data-year]').textContent = new Date().getFullYear();

// 首页只保留一段视频；切换标签页时暂停解码，返回时再继续播放。
const heroVideo = document.querySelector('.hero-video');

if (heroVideo) {
  const syncHeroPlayback = () => {
    if (document.hidden) {
      heroVideo.pause();
      return;
    }
    heroVideo.play().catch(() => {});
  };

  document.addEventListener('visibilitychange', syncHeroPlayback);
  syncHeroPlayback();
}

// 作品集灯箱：点击或键盘打开单张照片，并在当前类别内前后浏览。
const lightbox = document.querySelector('[data-lightbox]');

if (lightbox) {
  const lightboxImage = lightbox.querySelector('[data-lightbox-image]');
  const lightboxTitle = lightbox.querySelector('[data-lightbox-title]');
  const lightboxCounter = lightbox.querySelector('[data-lightbox-counter]');
  const lightboxStage = lightbox.querySelector('.lightbox-stage');
  const lightboxFigure = lightbox.querySelector('.lightbox-figure');
  const closeButton = lightbox.querySelector('[data-lightbox-close]');
  const previousButton = lightbox.querySelector('[data-lightbox-prev]');
  const nextButton = lightbox.querySelector('[data-lightbox-next]');
  let activeImages = [];
  let activeIndex = 0;
  let openingCard = null;

  const updateLightbox = () => {
    const image = activeImages[activeIndex];
    if (!image) return;
    const collection = image.closest('.portfolio-collection');
    const category = collection?.querySelector('.collection-meta > p')?.textContent.trim() || '摄影作品';
    lightboxImage.src = image.getAttribute('src');
    lightboxImage.alt = image.alt;
    lightboxTitle.textContent = category;
    lightboxCounter.textContent = `${activeIndex + 1} / ${activeImages.length}`;
    const hasMultipleImages = activeImages.length > 1;
    previousButton.hidden = !hasMultipleImages;
    nextButton.hidden = !hasMultipleImages;
  };

  const moveLightbox = (direction) => {
    if (!activeImages.length) return;
    activeIndex = (activeIndex + direction + activeImages.length) % activeImages.length;
    updateLightbox();
  };

  const openLightbox = (image, card) => {
    const collection = image.closest('.portfolio-collection');
    activeImages = [...collection.querySelectorAll('.collection-card img')];
    activeIndex = Math.max(0, activeImages.indexOf(image));
    openingCard = card;
    updateLightbox();
    document.body.classList.add('lightbox-open');
    lightbox.showModal();
    window.requestAnimationFrame(() => closeButton.focus());
  };

  document.querySelectorAll('.collection-card').forEach((card) => {
    const image = card.querySelector('img');
    if (!image) return;
    card.tabIndex = 0;
    card.setAttribute('role', 'button');
    card.setAttribute('aria-haspopup', 'dialog');
    card.setAttribute('aria-label', `放大查看：${image.alt}`);
    card.addEventListener('click', () => openLightbox(image, card));
    card.addEventListener('keydown', (event) => {
      if (event.key !== 'Enter' && event.key !== ' ') return;
      event.preventDefault();
      openLightbox(image, card);
    });
  });

  closeButton.addEventListener('click', () => lightbox.close());
  previousButton.addEventListener('click', () => moveLightbox(-1));
  nextButton.addEventListener('click', () => moveLightbox(1));

  lightbox.addEventListener('click', (event) => {
    if (event.target === lightbox || event.target === lightboxStage || event.target === lightboxFigure) lightbox.close();
  });

  lightbox.addEventListener('keydown', (event) => {
    if (event.key === 'ArrowLeft') {
      event.preventDefault();
      moveLightbox(-1);
    }
    if (event.key === 'ArrowRight') {
      event.preventDefault();
      moveLightbox(1);
    }
  });

  lightbox.addEventListener('close', () => {
    document.body.classList.remove('lightbox-open');
    lightboxImage.removeAttribute('src');
    openingCard?.focus();
  });
}
