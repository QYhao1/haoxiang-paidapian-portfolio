const collectionId = Number(new URLSearchParams(window.location.search).get('collection'));
const grid = document.querySelector('[data-viewer-grid]');
const title = document.querySelector('[data-viewer-title]');
const english = document.querySelector('[data-viewer-english]');
const description = document.querySelector('[data-viewer-description]');
const count = document.querySelector('[data-viewer-count]');
const lightbox = document.querySelector('[data-viewer-lightbox]');
const lightboxImage = document.querySelector('[data-viewer-image]');
const lightboxCaption = document.querySelector('[data-viewer-caption]');
const lightboxIndex = document.querySelector('[data-viewer-index]');
const closeLightbox = document.querySelector('[data-viewer-close]');
const previousImage = document.querySelector('[data-viewer-prev]');
const nextImage = document.querySelector('[data-viewer-next]');
let images = [];
let activeImageIndex = 0;
let opener = null;

const updateLightbox = () => {
  const image = images[activeImageIndex];
  if (!image) return;
  lightboxImage.src = image.src;
  lightboxImage.alt = image.alt;
  lightboxCaption.textContent = title.textContent;
  lightboxIndex.textContent = `${activeImageIndex + 1} / ${images.length}`;
  previousImage.hidden = images.length < 2;
  nextImage.hidden = images.length < 2;
};

const openLightbox = (index, trigger) => {
  activeImageIndex = index;
  opener = trigger;
  updateLightbox();
  lightbox.showModal();
  closeLightbox.focus();
};

const moveImage = (direction) => {
  activeImageIndex = (activeImageIndex + direction + images.length) % images.length;
  updateLightbox();
};

const renderCollection = (collection) => {
  const meta = collection.querySelector('.collection-meta');
  const collectionTitle = meta?.querySelector('p')?.textContent.trim() || '摄影作品';
  const collectionEnglish = meta?.querySelector('.collection-meta__english')?.textContent.trim() || 'COLLECTION';
  const collectionDescription = meta?.querySelector('.collection-meta__english + span')?.textContent.trim() || '';
  images = [...collection.querySelectorAll('.collection-card img')].map((image) => ({ src: image.getAttribute('src'), alt: image.alt }));
  document.title = `${collectionTitle}｜豪想拍大片`;
  title.textContent = collectionTitle;
  english.textContent = collectionEnglish;
  description.textContent = collectionDescription;
  count.textContent = `${images.length} 幅作品`;

  const fragment = document.createDocumentFragment();
  images.forEach((image, index) => {
    const button = document.createElement('button');
    button.className = 'viewer-card';
    button.type = 'button';
    button.setAttribute('aria-label', `放大查看：${image.alt}`);
    const picture = document.createElement('img');
    picture.src = image.src;
    picture.alt = image.alt;
    picture.loading = index < 4 ? 'eager' : 'lazy';
    picture.decoding = 'async';
    button.append(picture);
    button.addEventListener('click', () => openLightbox(index, button));
    fragment.append(button);
  });
  grid.replaceChildren(fragment);
};

fetch('index.html', { cache: 'no-store' })
  .then((response) => response.ok ? response.text() : Promise.reject(new Error('无法读取作品信息')))
  .then((source) => {
    const documentSource = new DOMParser().parseFromString(source, 'text/html');
    const collections = [...documentSource.querySelectorAll('[data-portfolio-collection]')];
    const collection = collections[collectionId];
    if (!collection) throw new Error('找不到该作品集');
    renderCollection(collection);
  })
  .catch(() => {
    title.textContent = '作品集暂时无法打开';
    description.textContent = '请返回全部合集后重新选择。';
  });

closeLightbox.addEventListener('click', () => lightbox.close());
previousImage.addEventListener('click', () => moveImage(-1));
nextImage.addEventListener('click', () => moveImage(1));
lightbox.addEventListener('click', (event) => {
  if (event.target === lightbox) lightbox.close();
});
lightbox.addEventListener('keydown', (event) => {
  if (event.key === 'ArrowLeft') { event.preventDefault(); moveImage(-1); }
  if (event.key === 'ArrowRight') { event.preventDefault(); moveImage(1); }
});
lightbox.addEventListener('close', () => {
  lightboxImage.removeAttribute('src');
  opener?.focus();
});
