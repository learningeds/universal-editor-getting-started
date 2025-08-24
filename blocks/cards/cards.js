import { createOptimizedPicture } from '../../scripts/aem.js';
import { moveInstrumentation } from '../../scripts/scripts.js';

export default function decorate(block) {
  // Convert block to ul > li
  const ul = document.createElement('ul');
  [...block.children].forEach((row) => {
    const li = document.createElement('li');
    moveInstrumentation(row, li);
    while (row.firstElementChild) li.append(row.firstElementChild);
    [...li.children].forEach((div) => {
      if (div.children.length === 1 && div.querySelector('picture')) {
        div.className = 'cards-card-image';
      } else {
        div.className = 'cards-card-body';
      }
    });
    ul.append(li);
  });

  // Optimize images
  ul.querySelectorAll('picture > img').forEach((img) => {
    const optimizedPic = createOptimizedPicture(img.src, img.alt, false, [{ width: '750' }]);
    moveInstrumentation(img, optimizedPic.querySelector('img'));
    img.closest('picture').replaceWith(optimizedPic);
  });

  block.textContent = '';
  block.append(ul);

  // ===== Carousel logic for section_1144820921 only =====
  const section = block.closest('[data-aue-resource*="section_1144820921"]');
  if (!section) return;

  // Collect all cards from this block only
  const combinedContainer = document.createElement('div');
  combinedContainer.className = 'combined-cards grid-view';

  const combinedUL = document.createElement('ul');
  ul.querySelectorAll('li').forEach((li) => {
    combinedUL.appendChild(li.cloneNode(true));
  });
  combinedContainer.appendChild(combinedUL);

  // Hide original block
  block.style.display = 'none';

  // Insert new container after content
  const referenceNode = section.querySelector('.default-content-wrapper');
  if (referenceNode) {
    referenceNode.insertAdjacentElement('afterend', combinedContainer);
  } else {
    section.appendChild(combinedContainer);
  }

  // Toggle Button
  let toggleBtn = section.querySelector('.cards-view-toggle-btn');
  if (!toggleBtn) {
    toggleBtn = document.createElement('button');
    toggleBtn.className = 'cards-view-toggle-btn';
    toggleBtn.textContent = 'View as carousel';
    section.insertBefore(toggleBtn, combinedContainer);
  }

  // Carousel indicators
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
      });
      indicatorWrapper.appendChild(dot);
    });
  }

  function updateCarousel() {
    combinedUL.scrollTo({
      left: index * combinedUL.offsetWidth,
      behavior: 'smooth',
    });
    indicatorWrapper.querySelectorAll('.dot').forEach((dot, i) => {
      dot.classList.toggle('active', i === index);
    });
  }

  function startAutoSlide() {
    stopAutoSlide();
    intervalId = setInterval(() => {
      index = (index + 1) % combinedUL.children.length;
      updateCarousel();
    }, 15000);
  }

  function stopAutoSlide() {
    if (intervalId) clearInterval(intervalId);
  }

  toggleBtn.addEventListener('click', () => {
    isCarousel = !isCarousel;

    if (isCarousel) {
      combinedContainer.classList.remove('grid-view');
      combinedContainer.classList.add('carousel-view');

      combinedUL.style.display = 'flex';
      combinedUL.style.overflowX = 'auto';
      combinedUL.style.scrollSnapType = 'x mandatory';

      combinedUL.querySelectorAll('li').forEach((li) => {
        li.style.flex = '0 0 80%';
        li.style.scrollSnapAlign = 'start';
      });

      updateIndicators();
      combinedContainer.appendChild(indicatorWrapper);
      index = 0;
      updateCarousel();
      startAutoSlide();
      toggleBtn.textContent = 'View as grid';
    } else {
      combinedContainer.classList.remove('carousel-view');
      combinedContainer.classList.add('grid-view');

      combinedUL.removeAttribute('style');
      combinedUL.querySelectorAll('li').forEach((li) => li.removeAttribute('style'));
      stopAutoSlide();
      indicatorWrapper.remove();
      toggleBtn.textContent = 'View as carousel';
    }
  });
}
