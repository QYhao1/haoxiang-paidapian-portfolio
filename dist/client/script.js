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

// 合集选择器：使用现有作品生成照片墙封面，点击后再展开对应的完整作品。
const collectionCarousel = document.querySelector('[data-collection-carousel]');

if (collectionCarousel) {
  const carouselViewport = collectionCarousel.querySelector('[data-collection-carousel-viewport]');
  const previousCollection = collectionCarousel.querySelector('[data-collection-prev]');
  const nextCollection = collectionCarousel.querySelector('[data-collection-next]');
  const collections = [...document.querySelectorAll('[data-portfolio-collection]')];
  const coverImages = [
    { src: 'assets/web/非遗类别/DSC00028-已增强-NR.jpg', position: 'center center' },
    { src: 'assets/web/自然风光/DSC07911.jpg', position: 'center 54%' },
    { src: 'assets/web/城市风光/DSC07619.jpg', position: 'center 58%' },
  ];
  let activeCollectionIndex = 0;

  const collectionData = collections.map((collection, index) => {
    const meta = collection.querySelector('.collection-meta');
    const title = meta?.querySelector('p')?.textContent.trim() || '摄影作品';
    const english = meta?.querySelector('.collection-meta__english')?.textContent.trim() || 'COLLECTION';
    const description = meta?.querySelector('.collection-meta__english + span')?.textContent.trim() || '';
    const images = [...collection.querySelectorAll('.collection-card img')];
    return { index, collection, title, english, description, images, cover: coverImages[index] };
  });

  const createCollectionCover = (data, isActive) => {
    const card = document.createElement('button');
    card.className = `collection-cover ${isActive ? 'collection-cover--active' : 'collection-cover--side'}`;
    card.type = 'button';
    card.setAttribute('aria-label', `点击进入${data.title}合集，共${data.images.length}张作品`);

    const coverImage = document.createElement('img');
    coverImage.className = 'collection-cover__image';
    coverImage.src = data.cover?.src || data.images[0]?.currentSrc || data.images[0]?.src;
    coverImage.alt = '';
    coverImage.decoding = 'async';
    coverImage.loading = isActive ? 'eager' : 'lazy';
    coverImage.style.objectPosition = data.cover?.position || 'center';

    const overlay = document.createElement('span');
    overlay.className = 'collection-cover__overlay';
    const english = document.createElement('span');
    english.className = 'collection-cover__english';
    english.textContent = data.english;
    const title = document.createElement('strong');
    title.textContent = data.title;
    const description = document.createElement('span');
    description.className = 'collection-cover__description';
    description.textContent = data.description;
    const open = document.createElement('span');
    open.className = 'collection-cover__open';
    const openEnglish = document.createElement('span');
    openEnglish.className = 'collection-cover__open-english';
    openEnglish.textContent = 'VIEW COLLECTION';
    const openLabel = document.createElement('span');
    openLabel.className = 'collection-cover__open-label';
    openLabel.textContent = '点击进入合集';
    open.append(openEnglish, openLabel);
    overlay.append(english, title, description, open);
    card.append(coverImage, overlay);
    card.addEventListener('click', () => {
      window.location.href = `collection.html?collection=${encodeURIComponent(data.index)}`;
    });
    return card;
  };

  const renderCollectionCarousel = () => {
    carouselViewport.replaceChildren();
    if (!collectionData.length) return;

    const track = document.createElement('div');
    track.className = 'collection-carousel__track';
    [-1, 0, 1].forEach((offset) => {
      const index = (activeCollectionIndex + offset + collectionData.length) % collectionData.length;
      track.append(createCollectionCover(collectionData[index], offset === 0));
    });
    carouselViewport.append(track);
  };

  const moveCollection = (direction) => {
    activeCollectionIndex = (activeCollectionIndex + direction + collectionData.length) % collectionData.length;
    renderCollectionCarousel();
  };

  previousCollection?.addEventListener('click', () => moveCollection(-1));
  nextCollection?.addEventListener('click', () => moveCollection(1));
  collectionCarousel.addEventListener('keydown', (event) => {
    if (event.key === 'ArrowLeft') moveCollection(-1);
    if (event.key === 'ArrowRight') moveCollection(1);
  });
  renderCollectionCarousel();
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
