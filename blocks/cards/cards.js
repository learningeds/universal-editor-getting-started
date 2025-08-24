export default function decorate(block) {
  const section = block.closest('.section');
  if (!section) return;

  const combinedCardsContainers = Array.from(section.querySelectorAll('.combined-cards'));
  if (combinedCardsContainers.length === 0) return;

  const allCards = [];

  // Extract all cards
  combinedCardsContainers.forEach(container => {
    const cardBlocks = container.querySelectorAll('.cards.block > div');
    cardBlocks.forEach(card => {
      const li = document.createElement('li');
      while (card.firstChild) {
        li.appendChild(card.firstChild);
      }
      li.classList.add('cards-card');
      allCards.push(li);
    });
    container.remove(); // Remove old containers
  });

  if (allCards.length === 0) return;

  // Create new combined container
  const combinedContainer = document.createElement('div');
  combinedContainer.className = 'combined-cards grid-view';

  const combinedUL = document.createElement('ul');
  allCards.forEach(card => combinedUL.appendChild(card));
  combinedContainer.appendChild(combinedUL);

  // Insert the combined container back into the section
  const ref = section.querySelector('.default-content-wrapper');
  if (ref) {
    ref.insertAdjacentElement('afterend', combinedContainer);
  } else {
    section.appendChild(combinedContainer);
  }

  // Add toggle button
  let toggleBtn = section.querySelector('.cards-view-toggle-btn');
  if (!toggleBtn) {
    toggleBtn = document.createElement('button');
    toggleBtn.className = 'cards-view-toggle-btn';
    toggleBtn.textContent = 'View as carousel';
    section.insertBefore(toggleBtn, combinedContainer);
  }

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

  // Toggle grid ↔ carousel
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

  // Init in grid view
  prevBtn.style.display = 'none';
  nextBtn.style.display = 'none';
}
