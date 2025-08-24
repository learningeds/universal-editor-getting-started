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

  // Find all combined-cards containers inside section
  const combinedCardsContainers = Array.from(section.querySelectorAll('.combined-cards'));
  if (combinedCardsContainers.length === 0) return;

  // Create toggle button once
  let toggleBtn = section.querySelector('.cards-view-toggle-btn');
  if (!toggleBtn) {
    toggleBtn = document.createElement('button');
    toggleBtn.className = 'cards-view-toggle-btn';
    toggleBtn.textContent = 'View as carousel';
    section.insertBefore(toggleBtn, combinedCardsContainers[0]);
  }

  // Create combined carousel container - initially not added to DOM
  const carouselContainer = document.createElement('div');
  carouselContainer.className = 'combined-cards carousel-view';
  const carouselUL = document.createElement('ul');
  carouselContainer.appendChild(carouselUL);

  // Arrows for carousel
  const prevBtn = document.createElement('button');
  prevBtn.className = 'carousel-arrow prev';
  prevBtn.textContent = '‹';

  const nextBtn = document.createElement('button');
  nextBtn.className = 'carousel-arrow next';
  nextBtn.textContent = '›';

  carouselContainer.append(prevBtn, nextBtn);

  // Indicators container
  const indicators = document.createElement('div');
  indicators.className = 'cards-carousel-indicators';

  let currentIndex = 0;
  let isCarousel = false;
  let intervalId;

  function updateIndicators() {
    indicators.innerHTML = '';
    carouselUL.querySelectorAll('li').forEach((_, i) => {
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
    carouselUL.style.transform = `translateX(-${currentIndex * 100}%)`;
    indicators.querySelectorAll('.dot').forEach((dot, i) => {
      dot.classList.toggle('active', i === currentIndex);
    });
  }

  function startAutoSlide() {
    clearInterval(intervalId);
    intervalId = setInterval(() => {
      currentIndex = (currentIndex + 1) % carouselUL.children.length;
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
    if (currentIndex < carouselUL.children.length - 1) {
      currentIndex++;
      updateCarousel();
      resetAutoSlide();
    }
  };

  toggleBtn.onclick = () => {
    isCarousel = !isCarousel;
    if (isCarousel) {
      // Collect all cards from all combined-cards containers
      const allCards = [];
      combinedCardsContainers.forEach(container => {
        const lis = Array.from(container.querySelectorAll('ul > li'));
        allCards.push(...lis);
        container.style.display = 'none'; // hide originals
      });

      // Empty carouselUL and append all cards
      carouselUL.innerHTML = '';
      allCards.forEach(li => {
        // Reset styles to ensure proper carousel display
        li.style.flex = '0 0 100%';
        li.style.maxWidth = '100%';
        carouselUL.appendChild(li);
      });

      // Set carousel UL styles
      carouselUL.style.display = 'flex';
      carouselUL.style.width = `${allCards.length * 100}%`;
      carouselUL.style.transition = 'transform 0.5s ease';

      // Add carousel container and indicators
      section.appendChild(carouselContainer);
      carouselContainer.appendChild(indicators);

      currentIndex = 0;
      updateIndicators();
      startAutoSlide();

      toggleBtn.textContent = 'View as grid';

      // Show arrows
      prevBtn.style.display = 'block';
      nextBtn.style.display = 'block';

    } else {
      // Remove carousel container and indicators
      stopAutoSlide();
      carouselContainer.remove();
      indicators.remove();

      // Show original combined-cards containers again
      combinedCardsContainers.forEach(container => {
        container.style.display = '';
      });

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
