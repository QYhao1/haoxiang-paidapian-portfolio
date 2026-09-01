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

// 首页标题的逐字邻近效果：根据光标到每个字的距离，平滑提升字重与大小。
const proximityTitle = document.querySelector('[data-variable-proximity]');
const heroSection = document.querySelector('.hero');

if (proximityTitle && heroSection) {
  const title = proximityTitle.textContent.trim();
  proximityTitle.textContent = '';
  const letters = [...title].map((character) => {
    const letter = document.createElement('span');
    letter.className = 'proximity-letter';
    letter.textContent = character;
    letter.setAttribute('aria-hidden', 'true');
    proximityTitle.appendChild(letter);
    return letter;
  });
  let pointer = null;
  let animationFrame = null;

  const updateLetters = () => {
    animationFrame = null;
    const radius = window.innerWidth <= 620 ? 132 : 190;
    letters.forEach((letter) => {
      let strength = 0;
      if (pointer) {
        const bounds = letter.getBoundingClientRect();
        const centerX = bounds.left + bounds.width / 2;
        const centerY = bounds.top + bounds.height / 2;
        const distance = Math.hypot(pointer.x - centerX, pointer.y - centerY);
        strength = Math.max(0, 1 - distance / radius);
      }
      letter.style.setProperty('--proximity', strength.toFixed(3));
    });
  };

  const requestUpdate = () => {
    if (!animationFrame) animationFrame = window.requestAnimationFrame(updateLetters);
  };

  heroSection.addEventListener('pointermove', (event) => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    pointer = { x: event.clientX, y: event.clientY };
    requestUpdate();
  });

  heroSection.addEventListener('pointerleave', () => {
    pointer = null;
    requestUpdate();
  });

  updateLetters();
}

// 第二屏漂浮照片墙：将这里的文件名替换为 assets/ 中自己的风光照片。
const driftImages = [
  'assets/DJI_0083-已增强-NR.jpg',
  'assets/DJI_0113 全景-恢复的.jpg',
  'assets/DJI_0129.jpg',
  'assets/DJI_0888-已增强-NR.jpg',
  'assets/DJI_0898.jpg',
  'assets/DJI_0906-已增强-NR.jpg',
  'assets/DJI_0923-已增强-NR.jpg',
  'assets/DJI_0930.jpg',
  'assets/DSC00028-已增强-NR.jpg',
  'assets/DSC00028.jpg',
  'assets/DSC00044-已增强-NR.jpg',
  'assets/DSC00045-已增强-NR.jpg',
  'assets/DSC00172.jpg',
  'assets/DSC00273.jpg',
  'assets/DSC00338 全景.jpg',
  'assets/DSC01019.jpg',
  'assets/DSC01020.jpg',
  'assets/DSC01030.jpg',
  'assets/DSC01989.jpg',
  'assets/DSC02014.jpg',
  'assets/DSC06423-已增强-NR.jpg',
  'assets/DSC06455-已增强-NR.jpg',
  'assets/DSC06551.jpg',
  'assets/DSC06553.jpg',
  'assets/DSC06586-已增强-NR.jpg',
  'assets/DSC06603-已增强-NR-恢复的.jpg',
  'assets/DSC06678.jpg',
  'assets/DSC06719.jpg',
  'assets/DSC06746.jpg',
  'assets/DSC06771.jpg',
  'assets/DSC06780.jpg',
  'assets/DSC06792.jpg',
  'assets/DSC06832.jpg',
  'assets/DSC06863-恢复的.jpg',
  'assets/DSC06895-恢复的.jpg',
  'assets/DSC06914-已增强-NR.jpg',
  'assets/DSC07011-已增强-NR-恢复的.jpg',
  'assets/DSC07049-已增强-NR-恢复的.jpg',
  'assets/DSC07239-已增强-NR-恢复的.jpg',
  'assets/DSC07269-已增强-NR.jpg',
  'assets/DSC07277-已增强-NR-恢复的.jpg',
  'assets/DSC07440.jpg',
  'assets/DSC07537-已增强-NR.jpg',
  'assets/DSC07568-已增强-NR.jpg',
  'assets/DSC07612.jpg',
  'assets/DSC07619.jpg',
  'assets/DSC07635.jpg',
  'assets/DSC07663.jpg',
  'assets/DSC07723.jpg',
  'assets/DSC07746.jpg',
  'assets/DSC07797上海乍浦路铁桥.jpg',
  'assets/DSC078031.jpg',
  'assets/DSC07853.jpg',
  'assets/DSC07898.jpg',
  'assets/DSC07911.jpg',
  'assets/DSC07914.jpg',
  'assets/DSC07972-恢复的.jpg',
  'assets/DSC07974-恢复的.jpg',
  'assets/DSC08153.jpg',
  'assets/DSC08236.jpg',
  'assets/DSC08247 全景.jpg',
  'assets/DSC08255.jpg',
  'assets/DSC08259.jpg',
  'assets/DSC09989-恢复的.jpg',
  'assets/外滩观景台.jpg',
  'assets/未标题-1-恢复的.jpg',
  'assets/未标题-1.jpg'
];

const driftWall = document.querySelector('[data-drift-wall]');
const driftPlane = document.querySelector('[data-drift-plane]');

if (driftWall && driftPlane) {
  const columns = 7;
  const columnImages = Array.from({ length: columns }, () => []);
  let driftDistanceFrame;
  let pendingDriftTiles = 0;

  const markDriftTileReady = () => {
    pendingDriftTiles = Math.max(0, pendingDriftTiles - 1);
    updateDriftDistances();
    if (pendingDriftTiles === 0) driftPlane.classList.add('is-ready');
  };

  const updateDriftDistances = () => {
    window.cancelAnimationFrame(driftDistanceFrame);
    driftDistanceFrame = window.requestAnimationFrame(() => {
      driftPlane.querySelectorAll('.drift-column').forEach((column) => {
        const tiles = [...column.querySelectorAll('.drift-tile')];
        const firstLoop = tiles.slice(0, tiles.length / 2);
        const distance = firstLoop.reduce((total, tile) => {
          const margin = Number.parseFloat(window.getComputedStyle(tile).marginBottom) || 0;
          return total + tile.getBoundingClientRect().height + margin;
        }, 0);
        if (distance > 0) column.style.setProperty('--drift-distance', `${distance}px`);
      });
    });
  };

  driftImages.forEach((image, index) => columnImages[index % columns].push(image));

  for (let columnIndex = 0; columnIndex < columns; columnIndex += 1) {
    const column = document.createElement('div');
    column.className = 'drift-column';
    column.style.setProperty('--drift-speed', `${20 + columnIndex * 1.4}s`);
    column.style.setProperty('--drift-distance', `${columnImages[columnIndex].length * 102}px`);

    [...columnImages[columnIndex], ...columnImages[columnIndex]].forEach((image) => {
      const tile = document.createElement('div');
      tile.className = 'drift-tile';
      const photo = document.createElement('img');
      pendingDriftTiles += 1;
      photo.addEventListener('load', markDriftTileReady, { once: true });
      photo.addEventListener('error', markDriftTileReady, { once: true });
      photo.src = image;
      photo.alt = '';
      photo.loading = 'eager';
      photo.decoding = 'async';
      photo.draggable = false;
      tile.appendChild(photo);
      column.appendChild(tile);
    });
    driftPlane.appendChild(column);
  }

  window.addEventListener('load', updateDriftDistances, { once: true });
  updateDriftDistances();

  driftWall.addEventListener('pointermove', (event) => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const bounds = driftWall.getBoundingClientRect();
    const x = (event.clientX - bounds.left) / bounds.width - 0.5;
    const y = (event.clientY - bounds.top) / bounds.height - 0.5;
    driftPlane.style.transform = `translate(-50%, -50%) scale(1.28) rotateX(${18 - y * 5}deg) rotateY(${-13 + x * 6}deg) translateZ(-45px)`;
  });

  driftWall.addEventListener('pointerleave', () => {
    driftPlane.style.transform = '';
  });
}

// 首页全屏视频轮播：每段完整播放后，以交叉溶解切换下一段。
const heroVideoStage = document.querySelector('[data-hero-videos]');
if (heroVideoStage) {
  const heroVideos = [...heroVideoStage.querySelectorAll('.hero-video')];
  const progressItems = [...document.querySelectorAll('.hero-video-progress i')];
  let activeVideoIndex = 0;
  let switchingVideo = false;

  const activateHeroVideo = async (nextIndex) => {
    const currentIndex = heroVideos.findIndex((video) => video.classList.contains('is-active'));
    if (switchingVideo || currentIndex < 0 || nextIndex === currentIndex) return;
    switchingVideo = true;
    const previousVideo = heroVideos[currentIndex];
    const nextVideo = heroVideos[nextIndex];
    nextVideo.currentTime = 0;
    try {
      await nextVideo.play();
    } catch {
      switchingVideo = false;
      return;
    }
    requestAnimationFrame(() => {
      previousVideo.classList.remove('is-active');
      nextVideo.classList.add('is-active');
    });
    progressItems[nextIndex].style.transform = 'scaleX(0.02)';
    progressItems.forEach((item, index) => item.classList.toggle('is-active', index === nextIndex));
    activeVideoIndex = nextIndex;
    heroVideos[(nextIndex + 1) % heroVideos.length].preload = 'auto';
    window.setTimeout(() => {
      previousVideo.pause();
      previousVideo.currentTime = 0;
      switchingVideo = false;
    }, 2450);
  };

  // 交叉溶解期间可能恰好收到上一段的 ended 事件；稍后重试，避免漏掉下一次轮播。
  const queueHeroVideo = (nextIndex) => {
    if (heroVideos[nextIndex].classList.contains('is-active')) return;
    if (switchingVideo) {
      window.setTimeout(() => queueHeroVideo(nextIndex), 160);
      return;
    }
    void activateHeroVideo(nextIndex);
  };

  heroVideos.forEach((video, index) => {
    video.addEventListener('ended', () => {
      if (heroVideos.length > 1 && video.classList.contains('is-active')) queueHeroVideo((index + 1) % heroVideos.length);
    });
    video.addEventListener('timeupdate', () => {
      const progressItem = progressItems[index];
      if (index !== activeVideoIndex || !progressItem || !Number.isFinite(video.duration) || video.duration <= 0) return;
      progressItem.style.transform = `scaleX(${Math.max(0.02, video.currentTime / video.duration)})`;
    });
  });
  if (heroVideos[1]) heroVideos[1].preload = 'auto';
  heroVideos[0].play().catch(() => {});
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
