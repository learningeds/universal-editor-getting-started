import { createOptimizedPicture } from '../../scripts/aem.js';
import { moveInstrumentation } from '../../scripts/scripts.js';

export default function decorate(block) {
  /* convert to ul > li */
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

  // Optimize pictures
  ul.querySelectorAll('picture > img').forEach((img) => {
    const optimizedPic = createOptimizedPicture(img.src, img.alt, false, [{ width: '750' }]);
    moveInstrumentation(img, optimizedPic.querySelector('img'));
    img.closest('picture').replaceWith(optimizedPic);
  });

  block.textContent = '';
  block.append(ul);

  // ===== Updated Combined Carousel Logic for section_1144820921 =====
  const section = document.querySelector('[data-aue-resource*="section_1144820921"]');
  if (!section) return;

  // Collect all cards from existing combined-cards.carousel-view containers
  const separateContainers = section.querySelectorAll('.combined-cards.carousel-view');
  const allCards = [];

  separateContainers.forEach(container => {
    const containerUL = container.querySelector('ul');
    if (containerUL) {
      [...containerUL.children].forEach(li => allCards.push(li));
    }
    container.remove(); // Remove old container
  });

  // Also collect cards from .cards-wrapper > .cards.block > ul if any
  const wrappers = section.querySelectorAll('.cards-wrapper');
  wrappers.forEach(wrapper => {
    const cardsBlock = wrapper.querySelector('.cards.block');
    const wrapperUL = cardsBlock?.querySelector('ul');
    if (wrapperUL) {
      [...wrapperUL.children].forEach(li => allCards.push(li));
    }
    wrapper.style.display = 'none';
  });

  if (allCards.length === 0) {
    // No cards found to combine, exit
    return;
  }

  // Create combined container and ul
  const combinedContainer = document.createElement('div');
  combinedContainer.className = 'combined-cards grid-view'; // start in grid-view

  const combinedUL = document.createElement('ul');
  combinedContainer.appendChild(combinedUL);

  // Append all cards to combined ul
  allCards.forEach(li => combinedUL.appendChild(li));

  // Insert combined container after default-content-wrapper if exists, else at end of section
  const refNode = section.querySelector('.default-content-wrapper');
  if (refNode) refNode.insertAdjacentElement('afterend', combinedContainer);
  else section.appendChild(combinedContainer);

  // Create toggle button
  let toggleBtn = section.querySelector('.cards-view-toggle-btn');
  if (!toggleBtn) {
    toggleBtn = document.createElement('button');
    toggleBtn.className = 'cards-view-toggle-btn';
    toggleBtn.textContent = 'View as carousel';
    section.insertBefore(toggleBtn, combinedContainer);
  }

  // Carousel indicators container
  const indicators = document.createElement('div');
  indicators.className = 'cards-carousel-indicators';

  let currentIndex = 0;
  let autoSlideInterval;
  let isCarousel = false;

  // Update indicators dots based on cards count
  function updateIndicators() {
    indicators.innerHTML = '';
    for (let i = 0; i < combinedUL.children.length; i++) {
      const dot = document.createElement('div');
      dot.className = 'dot';
      if (i === currentIndex) dot.classList.add('active');
      dot.addEventListener('click', () => {
        currentIndex = i;
        updateCarousel();
        resetAutoSlide();
      });
      indicators.appendChild(dot);
    }
  }

  // Update carousel transform and active dot
  function updateCarousel() {
    combinedUL.style.transform = `translateX(-${currentIndex * 100}%)`;
    indicators.querySelectorAll('.dot').forEach((dot, idx) => {
      dot.classList.toggle('active', idx === currentIndex);
    });
  }

  // Start auto slide
  function startAutoSlide() {
    stopAutoSlide();
    autoSlideInterval = setInterval(() => {
      currentIndex = (currentIndex + 1) % combinedUL.children.length;
      updateCarousel();
    }, 15000);
  }

  // Stop auto slide
  function stopAutoSlide() {
    if (autoSlideInterval) clearInterval(autoSlideInterval);
  }

  // Reset auto slide timer
  function resetAutoSlide() {
    stopAutoSlide();
    startAutoSlide();
  }

  // Toggle button handler
  toggleBtn.addEventListener('click', () => {
    isCarousel = !isCarousel;

    if (isCarousel) {
      combinedContainer.classList.remove('grid-view');
      combinedContainer.classList.add('carousel-view');

      combinedUL.style.display = 'flex';
      combinedUL.style.transition = 'transform 0.5s ease';
      combinedUL.style.width = `${combinedUL.children.length * 100}%`;
      combinedUL.querySelectorAll('li').forEach(li => {
        li.style.flex = '0 0 100%';
        li.style.maxWidth = '100%';
      });

      currentIndex = 0;
      updateIndicators();
      updateCarousel();

      combinedContainer.appendChild(indicators);

      startAutoSlide();

      toggleBtn.textContent = 'View as grid';
    } else {
      combinedContainer.classList.remove('carousel-view');
      combinedContainer.classList.add('grid-view');

      combinedUL.style.transform = 'none';
      combinedUL.style.transition = 'none';
      combinedUL.style.width = 'auto';
      combinedUL.style.display = 'grid';
      combinedUL.querySelectorAll('li').forEach(li => {
        li.style.flex = '';
        li.style.maxWidth = '';
      });

      stopAutoSlide();
      indicators.remove();

      toggleBtn.textContent = 'View as carousel';
    }
  });

  // Initialize with grid view
  combinedContainer.classList.add('grid-view');
  combinedUL.style.display = 'grid';
  // ===== Separate Carousel Logic for section_303714501 with one-time initialization =====

  const section2 = block.closest('.section[data-aue-resource*="section_303714501"]');
  if (section2 && !section2.classList.contains('carousel-initialized')) {
    section2.classList.add('carousel-initialized');

    const track = section2.querySelector('.cards.block > ul');
    const cards = section2.querySelectorAll('.cards.block > ul > li');
    const total = cards.length;
    if (total <= 1) return;

    let index = 0;

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
    }, 15000);
  }
}
