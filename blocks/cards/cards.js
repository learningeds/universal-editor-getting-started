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
    // Find all cards-wrapper inside this section
    const cardsWrappers = Array.from(section1.querySelectorAll('.cards-wrapper'));
    if (cardsWrappers.length > 0) {
      // Create a carousel container to hold all cards-wrapper as carousel items
      const carouselContainer = document.createElement('div');
      carouselContainer.className = 'combined-cards-wrapper-carousel';

      // Move each cards-wrapper inside carouselContainer
      cardsWrappers.forEach(wrapper => {
        carouselContainer.appendChild(wrapper);
      });

      // Insert carouselContainer at end of section1 (or replace original cards-wrappers container if you prefer)
      section1.appendChild(carouselContainer);

      // Create toggle button for carousel/grid and place it at the bottom
      const toggleBtn = document.createElement('button');
      toggleBtn.className = 'cards-view-toggle-btn';
      toggleBtn.textContent = 'View as carousel';
      section1.appendChild(toggleBtn);

      let isCarousel = false;
      let index = 0;
      let intervalId;

      // Carousel indicators container
      const indicatorWrapper = document.createElement('div');
      indicatorWrapper.className = 'cards-carousel-indicators';

      function updateIndicators() {
        indicatorWrapper.innerHTML = ''; // clear existing dots
        for (let i = 0; i < carouselContainer.children.length; i++) {
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
        // Translate carouselContainer to show only the selected cards-wrapper
        carouselContainer.style.transform = `translateX(-${index * 100}%)`;

        // Update dots active state
        const dots = indicatorWrapper.querySelectorAll('.dot');
        dots.forEach((dot, i) => {
          dot.classList.toggle('active', i === index);
        });
      }

      function startAutoSlide() {
        if (intervalId) clearInterval(intervalId);
        intervalId = setInterval(() => {
          index = (index + 1) % carouselContainer.children.length;
          updateCarousel();
        }, 15000);
      }

      function stopAutoSlide() {
        if (intervalId) clearInterval(intervalId);
      }

      toggleBtn.addEventListener('click', () => {
        isCarousel = !isCarousel;
        if (isCarousel) {
          carouselContainer.classList.add('carousel-view');
          carouselContainer.classList.remove('grid-view');
          index = 0;
          updateIndicators();
          updateCarousel();
          startAutoSlide();
          section1.appendChild(indicatorWrapper);
        } else {
          carouselContainer.classList.add('grid-view');
          carouselContainer.classList.remove('carousel-view');
          carouselContainer.style.transform = 'translateX(0)';
          stopAutoSlide();
          indicatorWrapper.remove();
        }
        toggleBtn.textContent = isCarousel ? 'View as grid' : 'View as carousel';
      });

      // Initialize with grid view
      carouselContainer.classList.add('grid-view');
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
