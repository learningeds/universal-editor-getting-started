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

  // ===== Combined Carousel Toggle Logic for section_1144820921 =====

const section1 = document.querySelector('[data-aue-resource*="section_1144820921"]');
if (section1) {
  // Fix: Find ALL .combined-cards elements that are part of this section
  const combinedCards = document.querySelectorAll(
    '.combined-cards[data-aue-resource*="section_1144820921"], [data-aue-resource*="section_1144820921"] .combined-cards'
  );

  const allCards = [];

  combinedCards.forEach(cardContainer => {
    const li = cardContainer.querySelector('ul > li');
    if (li) allCards.push(li);
    cardContainer.style.display = 'none'; // Hide original
  });

  if (allCards.length > 0) {
    // Build unified carousel as before
    const combinedContainer = document.createElement('div');
    combinedContainer.className = 'combined-cards';

    const combinedUL = document.createElement('ul');
    combinedUL.style.transition = 'transform 0.5s ease';
    combinedContainer.appendChild(combinedUL);

    allCards.forEach((li) => {
      combinedUL.appendChild(li);
    });

    const referenceNode = section1.querySelector('.default-content-wrapper');
    if (referenceNode) {
      referenceNode.insertAdjacentElement('afterend', combinedContainer);
    } else {
      section1.appendChild(combinedContainer);
    }

    // Toggle button
    let toggleBtn = section1.querySelector('.cards-view-toggle-btn');
    if (!toggleBtn) {
      toggleBtn = document.createElement('button');
      toggleBtn.className = 'cards-view-toggle-btn';
      toggleBtn.textContent = 'View as carousel';
      section1.insertBefore(toggleBtn, combinedContainer);
    }

    const indicatorWrapper = document.createElement('div');
    indicatorWrapper.className = 'cards-carousel-indicators';

    let isCarousel = false;
    let index = 0;
    let intervalId;

    function updateIndicators() {
      indicatorWrapper.innerHTML = '';
      for (let i = 0; i < combinedUL.children.length; i++) {
        const dot = document.createElement('div');
        dot.className = 'dot';
        if (i === index) dot.classList.add('active');
        dot.addEventListener('click', () => {
          index = i;
          updateCarousel();
        });
        indicatorWrapper.appendChild(dot);
      }
    }

    function updateCarousel() {
      combinedUL.style.transform = `translateX(-${index * 100}%)`;
      indicatorWrapper.querySelectorAll('.dot').forEach((dot, i) => {
        dot.classList.toggle('active', i === index);
      });
    }

    function startAutoSlide() {
      clearInterval(intervalId);
      intervalId = setInterval(() => {
        index = (index + 1) % combinedUL.children.length;
        updateCarousel();
      }, 15000);
    }

    function stopAutoSlide() {
      clearInterval(intervalId);
    }

    toggleBtn.addEventListener('click', () => {
      isCarousel = !isCarousel;

      if (isCarousel) {
        combinedContainer.classList.add('carousel-view');
        combinedContainer.classList.remove('grid-view');
        combinedUL.style.transform = 'translateX(0)';
        index = 0;
        updateIndicators();
        updateCarousel();
        combinedContainer.appendChild(indicatorWrapper);
        startAutoSlide();
      } else {
        combinedContainer.classList.add('grid-view');
        combinedContainer.classList.remove('carousel-view');
        combinedUL.style.transform = 'translateX(0)';
        stopAutoSlide();
        indicatorWrapper.remove();
      }

      toggleBtn.textContent = isCarousel ? 'View as grid' : 'View as carousel';
    });

    combinedContainer.classList.add('grid-view'); // default view
  }
}

  // ===== Separate Carousel Logic for section_303714501 with one-time initialization =====

  const section2 = block.closest('.section[data-aue-resource*="section_303714501"]');
  if (section2 && !section2.classList.contains('carousel-initialized')) {
    section2.classList.add('carousel-initialized');

    const track = section2.querySelector('.cards.block > ul');
    const cards = section2.querySelectorAll('.cards.block > ul > li');
    const total = cards.length;
    if (total <= 1) return; // no carousel if 1 or fewer cards
    let index = 0;

    // Create carousel indicators
    const indicatorWrapper2 = document.createElement('div');
    indicatorWrapper2.className = 'cards-carousel-indicators';

    for (let i = 0; i < total; i++) {
      const dot = document.createElement('div');
      dot.className = 'dot';
      if (i === 0) dot.classList.add('active');
      dot.addEventListener('click', () => {
        index = i;
        updateCarousel2();
      });
      indicatorWrapper2.appendChild(dot);
    }

    section2.appendChild(indicatorWrapper2);

    function updateCarousel2() {
      track.style.transform = `translateX(-${index * 105}%)`;
      const dots = indicatorWrapper2.querySelectorAll('.dot');
      dots.forEach((dot, i) => {
        dot.classList.toggle('active', i === index);
      });
    }

    setInterval(() => {
      index = (index + 1) % total;
      updateCarousel2();
    }, 15000); // 15 seconds
  }
}
