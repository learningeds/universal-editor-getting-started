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

 // ===== New combined carousel/grid toggle logic =====

  const section = document.querySelector('[data-aue-resource*="section_1144820921"]');
  if (!section) return;

  // Find all cards-wrapper inside this section
  const cardsWrappers = Array.from(section.querySelectorAll('.cards-wrapper'));
  if (cardsWrappers.length === 0) return;

  // Create combined container for all cards
  const combinedContainer = document.createElement('div');
  combinedContainer.className = 'combined-cards';

  // Create one UL to hold all cards
  const combinedUL = document.createElement('ul');
  combinedContainer.appendChild(combinedUL);

  // Move all <li> cards from all cards-wrapper > .cards.block > ul into combinedUL
  cardsWrappers.forEach(wrapper => {
    const cardsBlock = wrapper.querySelector('.cards.block');
    if (!cardsBlock) return;

    const ul = cardsBlock.querySelector('ul');
    if (!ul) return;

    Array.from(ul.children).forEach(li => {
      combinedUL.appendChild(li);
    });

    // Hide original cards-wrapper
    wrapper.style.display = 'none';
  });

  // Insert combined container after default content wrapper or at end of section
  const referenceNode = section.querySelector('.default-content-wrapper');
  if (referenceNode) {
    referenceNode.insertAdjacentElement('afterend', combinedContainer);
  } else {
    section.appendChild(combinedContainer);
  }

  // Create toggle button for carousel/grid
  const toggleBtn = document.createElement('button');
  toggleBtn.className = 'cards-view-toggle-btn';
  toggleBtn.textContent = 'View as carousel';
  combinedContainer.parentNode.insertBefore(toggleBtn, combinedContainer);

  let isCarousel = false;
  let index = 0;
  let intervalId;

  // Create carousel indicators container
  const indicatorWrapper = document.createElement('div');
  indicatorWrapper.className = 'cards-carousel-indicators';

  function updateIndicators() {
    indicatorWrapper.innerHTML = ''; // clear existing dots
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
    const dots = indicatorWrapper.querySelectorAll('.dot');
    dots.forEach((dot, i) => {
      dot.classList.toggle('active', i === index);
    });
  }

  function startAutoSlide() {
    if (intervalId) clearInterval(intervalId);
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
      combinedContainer.classList.add('carousel-view');
      combinedContainer.classList.remove('grid-view');
      combinedUL.style.transform = 'translateX(0)';
      index = 0;
      updateIndicators();
      updateCarousel();
      startAutoSlide();
      combinedContainer.appendChild(indicatorWrapper);
    } else {
      combinedContainer.classList.add('grid-view');
      combinedContainer.classList.remove('carousel-view');
      combinedUL.style.transform = 'translateX(0)';
      stopAutoSlide();
      indicatorWrapper.remove();
    }
    toggleBtn.textContent = isCarousel ? 'View as grid' : 'View as carousel';
  });

  // Initialize with grid view
  combinedContainer.classList.add('grid-view');
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
