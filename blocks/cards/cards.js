import { createOptimizedPicture } from '../../scripts/aem.js';
import { moveInstrumentation } from '../../scripts/scripts.js';

export default function decorate(block) {
  // Step 1: Build a standard <ul> card layout
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

  // Optimize all <img>
  ul.querySelectorAll('picture > img').forEach(img => {
    const optimizedPic = createOptimizedPicture(img.src, img.alt, false, [{ width: '750' }]);
    moveInstrumentation(img, optimizedPic.querySelector('img'));
    img.closest('picture').replaceWith(optimizedPic);
  });

  // Clean block and insert new list
  block.textContent = '';
  block.append(ul);

  // Step 2: Run logic to combine all cards in section (just once per section)
  const section = block.closest('.section');
  if (!section || section.classList.contains('cards-initialized')) return;
  section.classList.add('cards-initialized');

  const cardsBlocks = section.querySelectorAll('.cards.block');

  if (cardsBlocks.length === 0) return;

  const allCards = [];

  cardsBlocks.forEach(cardsBlock => {
    const lis = cardsBlock.querySelectorAll('ul > li');
    lis.forEach(li => {
      const cloned = li.cloneNode(true);
      allCards.push(cloned);
    });
    cardsBlock.parentElement.style.display = 'none'; // Hide original
  });

  if (allCards.length === 0) return;

  // Create combined container
  const combinedContainer = document.createElement('div');
  combinedContainer.className = 'combined-cards grid-view';

  const combinedUL = document.createElement('ul');
  allCards.forEach(card => combinedUL.appendChild(card));
  combinedContainer.appendChild(combinedUL);

  const ref = section.querySelector('.default-content-wrapper');
  if (ref) {
    ref.insertAdjacentElement('afterend', combinedContainer);
  } else {
    section.appendChild(combinedContainer);
  }

  // Toggle Button
  let toggleBtn = document.createElement('button');
  toggleBtn.className = 'cards-view-toggle-btn';
  toggleBtn.textContent = 'View as carousel';
  section.insertBefore(toggleBtn, combinedContainer);

  // Arrows
  const prevBtn = document.createElement('button');
  prevBtn.className = 'carousel-arrow prev';
  prevBtn.textContent = '‹';

  const nextBtn = document.createElement('button');
  nextBtn.className = 'carousel-arrow next';
  nextBtn.textContent = '›';

  combinedContainer.append(prevBtn, nextBtn);

  // Indicators
  const indicators = document.createElement('div');
  indicators.className = 'cards-carousel-indicators';

  let currentIndex = 0;
  let isCarousel = false;
  let intervalId;

  function updateIndicators() {
    indicators.innerHTML = '';
    allCards.forEach((_, i) => {
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
      currentIndex = (currentIndex + 1) % allCards.length;
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
    if (currentIndex < allCards.length - 1) {
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
      combinedUL.style.width = `${allCards.length * 100}%`;
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

  prevBtn.style.display = 'none';
  nextBtn.style.display = 'none';
}
