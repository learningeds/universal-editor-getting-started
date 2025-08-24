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

  // Find the main section containing combined-cards
  const section = document.querySelector('[data-aue-resource*="section_1144820921"]');
  if (!section) return;

  // Select all combined-cards containers on the page
  const combinedCardsContainers = Array.from(section.querySelectorAll('.combined-cards'));

  if (combinedCardsContainers.length === 0) return;

  // Create toggle button once
  let toggleBtn = section.querySelector('.cards-view-toggle-btn');
  if (!toggleBtn) {
    toggleBtn = document.createElement('button');
    toggleBtn.className = 'cards-view-toggle-btn';
    toggleBtn.textContent = 'View as carousel';
    // Insert toggle before first combined-cards container
    section.insertBefore(toggleBtn, combinedCardsContainers[0]);
  }

  // Wrap all combined-cards containers into a single carousel wrapper
  const carouselWrapper = document.createElement('div');
  carouselWrapper.className = 'combined-cards-carousel-wrapper grid-view'; // start in grid view
  // Move all combined-cards containers inside this wrapper
  combinedCardsContainers.forEach(container => {
    carouselWrapper.appendChild(container);
  });
  // Append carousel wrapper to section (replace old containers)
  section.appendChild(carouselWrapper);

  // Create carousel arrows for navigating combined-cards containers (the carousel "pages")
  const prevBtn = document.createElement('button');
  prevBtn.className = 'carousel-arrow prev';
  prevBtn.textContent = '‹';
  const nextBtn = document.createElement('button');
  nextBtn.className = 'carousel-arrow next';
  nextBtn.textContent = '›';

  carouselWrapper.append(prevBtn, nextBtn);

  // Create indicators container for pagination dots
  const indicators = document.createElement('div');
  indicators.className = 'cards-carousel-indicators';
  carouselWrapper.appendChild(indicators);

  let currentIndex = 0;
  let isCarousel = false;
  let intervalId;

  function updateIndicators() {
    indicators.innerHTML = '';
    combinedCardsContainers.forEach((_, i) => {
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
    // Calculate translateX for carouselWrapper to show one combined-cards container at a time
    const translateX = -currentIndex * 100;
    carouselWrapper.style.transform = `translateX(${translateX}%)`;

    // Update dots active state
    indicators.querySelectorAll('.dot').forEach((dot, i) => {
      dot.classList.toggle('active', i === currentIndex);
    });
  }

  function startAutoSlide() {
    clearInterval(intervalId);
    intervalId = setInterval(() => {
      currentIndex = (currentIndex + 1) % combinedCardsContainers.length;
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
    if (currentIndex < combinedCardsContainers.length - 1) {
      currentIndex++;
      updateCarousel();
      resetAutoSlide();
    }
  };

  toggleBtn.onclick = () => {
    isCarousel = !isCarousel;
    if (isCarousel) {
      carouselWrapper.classList.replace('grid-view', 'carousel-view');
      // Display flex and width 100% so combined-cards line up horizontally
      carouselWrapper.style.display = 'flex';
      carouselWrapper.style.width = `${combinedCardsContainers.length * 100}%`;
      combinedCardsContainers.forEach(container => {
        container.style.flex = '0 0 100%'; // each container fills full width
        container.style.maxWidth = '100%';
      });
      currentIndex = 0;
      updateIndicators();
      startAutoSlide();
      toggleBtn.textContent = 'View as grid';

      // Show arrows & indicators
      prevBtn.style.display = 'block';
      nextBtn.style.display = 'block';
      indicators.style.display = 'flex';
    } else {
      carouselWrapper.classList.replace('carousel-view', 'grid-view');
      carouselWrapper.style.display = 'grid';
      carouselWrapper.style.transform = '';
      carouselWrapper.style.width = '';
      combinedCardsContainers.forEach(container => {
        container.style.flex = '';
        container.style.maxWidth = '';
      });
      stopAutoSlide();
      indicators.style.display = 'none';
      toggleBtn.textContent = 'View as carousel';

      // Hide arrows
      prevBtn.style.display = 'none';
      nextBtn.style.display = 'none';
    }
  };

  // Initialize UI in grid mode
  carouselWrapper.classList.add('grid-view');
  carouselWrapper.style.display = 'grid';
  prevBtn.style.display = 'none';
  nextBtn.style.display = 'none';
  indicators.style.display = 'none';
}
