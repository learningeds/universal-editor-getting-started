import { createOptimizedPicture } from '../../scripts/aem.js';
import { moveInstrumentation } from '../../scripts/scripts.js';

export default function decorate(block) {
  const ul = document.createElement('ul');
  [...block.children].forEach(row => {
    const li = document.createElement('li');
    moveInstrumentation(row, li);
    while (row.firstElementChild) li.append(row.firstElementChild);
    [...li.children].forEach(div => {
      if (div.children.length === 1 && div.querySelector('picture')) div.className = 'cards-card-image';
      else div.className = 'cards-card-body';
    });
    ul.append(li);
  });

  ul.querySelectorAll('picture > img').forEach(img => {
    const optimizedPic = createOptimizedPicture(img.src, img.alt, false, [{ width: '750' }]);
    moveInstrumentation(img, optimizedPic.querySelector('img'));
    img.closest('picture').replaceWith(optimizedPic);
  });

  block.textContent = '';
  block.append(ul);

  const section = document.querySelector('[data-aue-resource*="section_1144820921"]');
  if (!section) return;

  // ====== Convert existing .cards-wrapper containers to .combined-cards ======
  const cardsWrappers = Array.from(section.querySelectorAll('.cards-wrapper'));
  cardsWrappers.forEach(wrapper => {
    if (!wrapper.classList.contains('combined-cards')) {
      wrapper.classList.add('combined-cards');
      wrapper.classList.remove('cards-wrapper');
      wrapper.classList.add('grid-view');
    }
  });

  // ====== Collect all combined-cards containers ======
  const combinedCardsContainers = Array.from(section.querySelectorAll('.combined-cards'));
  if (combinedCardsContainers.length === 0) return;

  // Collect all cards (li elements) from all combined-cards containers
  const allCards = [];
  combinedCardsContainers.forEach(container => {
    const ul = container.querySelector('ul');
    if (ul) {
      allCards.push(...ul.children);
      // Remove the old container since we'll rebuild
      container.remove();
    }
  });

  if (allCards.length === 0) return;

  // Create a new combined container with grid-view by default
  const combinedContainer = document.createElement('div');
  combinedContainer.className = 'combined-cards grid-view';
  const combinedUL = document.createElement('ul');
  combinedContainer.append(combinedUL);
  allCards.forEach(li => combinedUL.append(li));

  const ref = section.querySelector('.default-content-wrapper');
  if (ref) ref.insertAdjacentElement('afterend', combinedContainer);
  else section.appendChild(combinedContainer);

  // ====== Create toggle button if not exists ======
  let toggleBtn = section.querySelector('.cards-view-toggle-btn');
  if (!toggleBtn) {
    toggleBtn = document.createElement('button');
    toggleBtn.className = 'cards-view-toggle-btn';
    toggleBtn.textContent = 'View as carousel';
    // Insert before combinedContainer or prepend to section
    if (combinedCardsContainers.length > 0) {
      section.insertBefore(toggleBtn, combinedCardsContainers[0]);
    } else {
      section.prepend(toggleBtn);
    }
  }

  // ====== Create carousel arrows ======
  const prevBtn = document.createElement('button');
  prevBtn.className = 'carousel-arrow prev';
  prevBtn.textContent = '‹';

  const nextBtn = document.createElement('button');
  nextBtn.className = 'carousel-arrow next';
  nextBtn.textContent = '›';

  combinedContainer.append(prevBtn, nextBtn);

  // ====== Create indicators container ======
  const indicators = document.createElement('div');
  indicators.className = 'cards-carousel-indicators';

  let currentIndex = 0;
  let isCarousel = false;
  let intervalId;

  function updateIndicators() {
    indicators.innerHTML = '';
    combinedUL.querySelectorAll('li').forEach((_, i) => {
      const dot = document.createElement('div');
      dot.className = 'dot';
      if (i === currentIndex) dot.classList.add('active');
      dot.onclick = () => {
        currentIndex = i;
        updateCarousel();
        resetAutoSlide();
      };
      indicators.appendChild(dot);
    });
  }

  function updateCarousel() {
    combinedUL.style.transform = `translateX(-${currentIndex * 100}%)`;
    indicators.querySelectorAll('.dot').forEach((dot, i) => {
      dot.classList.toggle('active', i === currentIndex);
    });
  }

  function startAutoSlide() {
    clearInterval(intervalId);
    intervalId = setInterval(() => {
      currentIndex = (currentIndex + 1) % combinedUL.children.length;
      updateCarousel();
    }, 15000);
  }

  function stopAutoSlide() {
    clearInterval(intervalId);
  }

  function resetAutoSlide() {
    stopAutoSlide();
    startAutoSlide();
  }

  prevBtn.onclick = () => {
    if (currentIndex > 0) {
      currentIndex--;
      updateCarousel();
      resetAutoSlide();
    }
  };

  nextBtn.onclick = () => {
    if (currentIndex < combinedUL.children.length - 1) {
      currentIndex++;
      updateCarousel();
      resetAutoSlide();
    }
  };

  toggleBtn.onclick = () => {
    isCarousel = !isCarousel;
    if (isCarousel) {
      combinedContainer.classList.replace('grid-view', 'carousel-view');
      combinedUL.style.display = 'flex';
      combinedUL.style.width = `${combinedUL.children.length * 100}%`;
      combinedUL.querySelectorAll('li').forEach(li => {
        li.style.flex = '0 0 100%';
        li.style.maxWidth = '100%';
      });
      currentIndex = 0;
      updateIndicators();
      combinedContainer.append(indicators);
      startAutoSlide();
      toggleBtn.textContent = 'View as grid';

      // Show arrows
      prevBtn.style.display = 'block';
      nextBtn.style.display = 'block';
    } else {
      combinedContainer.classList.replace('carousel-view', 'grid-view');
      combinedUL.style.display = 'grid';
      combinedUL.style.transform = '';
      combinedUL.style.width = '';
      combinedUL.querySelectorAll('li').forEach(li => {
        li.style.flex = '';
        li.style.maxWidth = '';
      });
      stopAutoSlide();
      indicators.remove();
      toggleBtn.textContent = 'View as carousel';

      // Hide arrows
      prevBtn.style.display = 'none';
      nextBtn.style.display = 'none';
    }
  };

  // Initialize arrows hidden for grid view
  prevBtn.style.display = 'none';
  nextBtn.style.display = 'none';
}
