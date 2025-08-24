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

  // Combined Carousel Toggle Logic
  const section1 = document.querySelector('[data-aue-resource*="section_1144820921"]');
  if (section1) {
    const cardsWrappers = section1.querySelectorAll('.cards-wrapper');
    const combinedUL = document.createElement('ul');
    const combinedContainer = document.createElement('div');
    combinedContainer.className = 'combined-cards grid-view'; // start in grid-view
    combinedContainer.appendChild(combinedUL);

    let hasCards = false;
    cardsWrappers.forEach(wrapper => {
      const cardsBlock = wrapper.querySelector('.cards.block');
      const ul = cardsBlock?.querySelector('ul');
      if (ul) {
        const lis = ul.querySelectorAll('li');
        if (lis.length > 0) {
          hasCards = true;
          lis.forEach(li => combinedUL.appendChild(li));
        }
      }
      wrapper.style.display = 'none';
    });

    if (hasCards) {
      const referenceNode = section1.querySelector('.default-content-wrapper');
      if (referenceNode) referenceNode.insertAdjacentElement('afterend', combinedContainer);
      else section1.appendChild(combinedContainer);

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
        combinedUL.querySelectorAll('li').forEach((_, i) => {
          const dot = document.createElement('div');
          dot.className = 'dot';
          if (i === index) dot.classList.add('active');
          dot.addEventListener('click', () => {
            index = i;
            updateCarousel();
            resetAutoSlide();
          });
          indicatorWrapper.appendChild(dot);
        });
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

      function resetAutoSlide() {
        stopAutoSlide();
        startAutoSlide();
      }

      toggleBtn.addEventListener('click', () => {
        isCarousel = !isCarousel;

        if (isCarousel) {
          combinedContainer.classList.add('carousel-view');
          combinedContainer.classList.remove('grid-view');

          combinedUL.style.display = 'flex';
          combinedUL.style.transition = 'transform 0.5s ease';
          combinedUL.style.width = `${combinedUL.children.length * 100}%`;
          combinedUL.querySelectorAll('li').forEach(li => {
            li.style.flex = '0 0 100%';
            li.style.maxWidth = '100%';
          });

          index = 0;
          updateIndicators();
          updateCarousel();
          combinedContainer.appendChild(indicatorWrapper);
          startAutoSlide();

          toggleBtn.textContent = 'View as grid';
        } else {
          combinedContainer.classList.add('grid-view');
          combinedContainer.classList.remove('carousel-view');

          combinedUL.style.transform = 'none';
          combinedUL.style.transition = 'none';
          combinedUL.style.width = 'auto';
          combinedUL.style.display = 'grid';  // Use grid display for grid-view
          combinedUL.querySelectorAll('li').forEach(li => {
            li.style.flex = 'initial';
            li.style.maxWidth = 'initial';
            li.style.removeProperty('flex-basis');
          });

          stopAutoSlide();
          indicatorWrapper.remove();

          toggleBtn.textContent = 'View as carousel';
        }
      });

      // Initialize with grid view
      combinedContainer.classList.add('grid-view');
      combinedUL.style.display = 'grid';
    }
  }


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
