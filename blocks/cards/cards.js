import { createOptimizedPicture } from '../../scripts/aem.js';
import { moveInstrumentation } from '../../scripts/scripts.js';

export default function decorate(block) {
  /* change to ul, li */
  const ul = document.createElement('ul');
  [...block.children].forEach((row) => {
    const li = document.createElement('li');
    moveInstrumentation(row, li);
    while (row.firstElementChild) li.append(row.firstElementChild);
    [...li.children].forEach((div) => {
      if (div.children.length === 1 && div.querySelector('picture')) div.className = 'cards-card-image';
      else div.className = 'cards-card-body';
    });
    ul.append(li);
  });
  ul.querySelectorAll('picture > img').forEach((img) => {
    const optimizedPic = createOptimizedPicture(img.src, img.alt, false, [{ width: '750' }]);
    moveInstrumentation(img, optimizedPic.querySelector('img'));
    img.closest('picture').replaceWith(optimizedPic);
  });
  block.textContent = '';
  block.append(ul);


  // ===== Carousel Toggle Script Starts =====

  // Carousel toggle for "There is always a better way" section
  function addBetterWayCarouselToggle() {
    const section = document.querySelector('[data-aue-resource*="section_1144820921"]');
    if (!section) return;

    const heading = section.querySelector('h1#there-is-always-a-better-way');
    if (!heading) return;

    const cardsBlocks = section.querySelectorAll('.cards.block');
    let targetBlock = null;

    cardsBlocks.forEach((cardsBlock) => {
      if (!targetBlock) {
        const hasTargetHeading = [...cardsBlock.querySelectorAll('h3')].some(
          (h3) => h3.textContent.trim() === 'The hunt for the unknow'
        );
        if (hasTargetHeading) targetBlock = cardsBlock;
      }
    });

    if (!targetBlock) return;

    const track = targetBlock.querySelector('ul');
    const cards = targetBlock.querySelectorAll('ul > li');
    const total = cards.length;

    if (total <= 1) return;

    targetBlock.classList.add('better-way-cards');

    if (targetBlock.querySelector('.cards-view-toggle-btn')) return;

    const toggleBtn = document.createElement('button');
    toggleBtn.className = 'cards-view-toggle-btn';
    toggleBtn.textContent = 'View as carousel';

    let index = 0;
    let intervalId;

    const indicatorWrapper = document.createElement('div');
    indicatorWrapper.className = 'cards-carousel-indicators';

    for (let i = 0; i < total; i++) {
      const dot = document.createElement('div');
      dot.className = 'dot';
      if (i === 0) dot.classList.add('active');
      dot.addEventListener('click', () => {
        index = i;
        updateCarousel();
      });
      indicatorWrapper.appendChild(dot);
    }

    targetBlock.appendChild(indicatorWrapper);

    function updateCarousel() {
      track.style.transform = `translateX(-${index * 100}%)`;
      indicatorWrapper.querySelectorAll('.dot').forEach((dot, i) => {
        dot.classList.toggle('active', i === index);
      });
    }

    function startAutoSlide() {
      intervalId = setInterval(() => {
        index = (index + 1) % total;
        updateCarousel();
      }, 15000);
    }

    function stopAutoSlide() {
      clearInterval(intervalId);
    }

    toggleBtn.addEventListener('click', () => {
      targetBlock.classList.toggle('carousel-view');
      const isCarousel = targetBlock.classList.contains('carousel-view');

      toggleBtn.textContent = isCarousel ? 'View as grid' : 'View as carousel';

      if (isCarousel) {
        index = 0;
        updateCarousel();
        startAutoSlide();
      } else {
        stopAutoSlide();
        track.style.transform = 'translateX(0)';
        indicatorWrapper.querySelectorAll('.dot').forEach(dot => dot.classList.remove('active'));
      }
    });

    targetBlock.insertBefore(toggleBtn, track);

    if (targetBlock.classList.contains('carousel-view')) {
      startAutoSlide();
      updateCarousel();
    }
  }

  addBetterWayCarouselToggle();
  const section = block.closest('.section[data-aue-resource*="section_303714501"]');
  if (!section) return; // Exit if not in target section
  if (section) {
    const track = section.querySelector('.cards.block > ul');
    const cards = section.querySelectorAll('.cards.block > ul > li');
    const total = cards.length;
    let index = 0;
  
    // Create carousel indicators
    const indicatorWrapper = document.createElement('div');
    indicatorWrapper.className = 'cards-carousel-indicators';
  
    for (let i = 0; i < total; i++) {
      const dot = document.createElement('div');
      dot.className = 'dot';
      if (i === 0) dot.classList.add('active');
      dot.addEventListener('click', () => {
        index = i;
        updateCarousel();
      });
      indicatorWrapper.appendChild(dot);
    }
  
    section.appendChild(indicatorWrapper);
  
    function updateCarousel() {
      track.style.transform = `translateX(-${index * 105}%)`;
      const dots = indicatorWrapper.querySelectorAll('.dot');
      dots.forEach((dot, i) => {
        dot.classList.toggle('active', i === index);
      });
    }
  
    setInterval(() => {
      index = (index + 1) % total;
      updateCarousel();
    }, 15000); // 15 seconds
  }
}
