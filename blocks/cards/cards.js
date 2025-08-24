import { createOptimizedPicture } from '../../scripts/aem.js';
import { moveInstrumentation } from '../../scripts/scripts.js';

export default function decorate(block) {
  // ... your existing ul creation and optimized picture code ...

  const section = document.querySelector('[data-aue-resource*="section_1144820921"]');
  if (!section) return;

  // Convert .cards-wrapper to .combined-cards.grid-view
  const cardsWrappers = Array.from(section.querySelectorAll('.cards-wrapper'));
  cardsWrappers.forEach(wrapper => {
    wrapper.classList.add('combined-cards', 'grid-view');
    wrapper.classList.remove('cards-wrapper');
  });

  // Collect all cards from all combined-cards
  const combinedCardsContainers = Array.from(section.querySelectorAll('.combined-cards'));
  if (combinedCardsContainers.length === 0) return;

  const allCards = [];
  combinedCardsContainers.forEach(container => {
   const cards = container.querySelectorAll('li');
if (cards.length > 0) {
  allCards.push(...cards);
}
container.remove();

  });

  if (allCards.length === 0) return;

  // Create new combined container
  const combinedContainer = document.createElement('div');
  combinedContainer.className = 'combined-cards grid-view';
  const combinedUL = document.createElement('ul');
  combinedContainer.append(combinedUL);
  allCards.forEach(li => combinedUL.append(li));

  // Insert combinedContainer after default-content-wrapper or at end of section
  const ref = section.querySelector('.default-content-wrapper');
  if (ref) {
    ref.insertAdjacentElement('afterend', combinedContainer);
  } else {
    section.appendChild(combinedContainer);
  }

  // Create toggle button
  let toggleBtn = section.querySelector('.cards-view-toggle-btn');
  if (!toggleBtn) {
    toggleBtn = document.createElement('button');
    toggleBtn.className = 'cards-view-toggle-btn';
    toggleBtn.textContent = 'View as carousel';

    // Insert toggle button right before combinedContainer for visibility
    combinedContainer.before(toggleBtn);
  }

  // For debugging: make sure button is visible
  toggleBtn.style.margin = '10px 0';
  toggleBtn.style.padding = '10px 20px';
  toggleBtn.style.cursor = 'pointer';
  toggleBtn.style.fontSize = '1rem';

  // Create arrows
  const prevBtn = document.createElement('button');
  prevBtn.className = 'carousel-arrow prev';
  prevBtn.textContent = '‹';
  prevBtn.style.display = 'none';

  const nextBtn = document.createElement('button');
  nextBtn.className = 'carousel-arrow next';
  nextBtn.textContent = '›';
  nextBtn.style.display = 'none';

  combinedContainer.append(prevBtn, nextBtn);

  // Indicators
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

      prevBtn.style.display = 'none';
      nextBtn.style.display = 'none';
    }
  };
}
