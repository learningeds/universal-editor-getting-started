import { createOptimizedPicture } from '../../scripts/aem.js';
import { moveInstrumentation } from '../../scripts/scripts.js';

export default function decorate(block) {
  const ul = document.createElement('ul');
  [...block.children].forEach(row => {
    const li = document.createElement('li');
    moveInstrumentation(row, li);
    while (row.firstElementChild) li.append(row.firstElementChild);
    [...li.children].forEach(div => {
      if (div.children.length === 1 && div.querySelector('picture')) {
        div.className = 'cards-card-image';
      } else {
        div.className = 'cards-card-body';
      }
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

  // ✅ Scoped section only
  const section = document.querySelector('[data-aue-resource*="section_1144820921"]');
  if (!section || section.classList.contains('cards-initialized')) return;
  section.classList.add('cards-initialized');

  const cardBlocks = section.querySelectorAll('.cards.block');
  const allCards = [];

  cardBlocks.forEach(cardsBlock => {
    // New: each child div inside cards.block is a card
    const cardDivs = cardsBlock.querySelectorAll(':scope > div');
    cardDivs.forEach(card => {
      const li = document.createElement('li');
      li.classList.add('cards-card');
      // Move children into li
      while (card.firstChild) {
        li.appendChild(card.firstChild);
      }
      allCards.push(li);
    });

    cardsBlock.parentElement.style.display = 'none'; // Hide original cards-wrapper
  });

  if (allCards.length === 0) return;

  // Create combined container
  const combinedContainer = document.createElement('div');
  combinedContainer.className = 'combined-cards grid-view';

  const combinedUL = document.createElement('ul');
  allCards.forEach(card => combinedUL.appendChild(card));
  combinedContainer.appendChild(combinedUL);

  // Insert into section
  const ref = section.querySelector('.default-content-wrapper');
  if (ref) {
    ref.insertAdjacentElement('afterend', combinedContainer);
  } else {
    section.appendChild(combinedContainer);
  }

  // Toggle button
  const toggleBtn = document.createElement('button');
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
  const offset = currentIndex * combinedContainer.offsetWidth;
  combinedUL.style.transform = `translateX(-${offset}px)`;

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
    combinedUL.style.width = `${allCards.length * 40}%`;
    combinedUL.style.transition = 'transform 0.5s ease';
    combinedUL.style.overflow = 'hidden';

    combinedUL.querySelectorAll('li').forEach(li => {
      li.style.flex = `0 0 ${100 / allCards.length}%`;
      li.style.maxWidth = `${100 / allCards.length}%`;
    });

    currentIndex = 0;
    updateIndicators();
    combinedContainer.append(indicators);
    startAutoSlide();
    toggleBtn.textContent = 'View as grid';
    prevBtn.style.display = 'block';
    nextBtn.style.display = 'block';
    updateCarousel(); // Ensure correct transform on toggle
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


  // Init in grid view
  prevBtn.style.display = 'none';
  nextBtn.style.display = 'none';
}
