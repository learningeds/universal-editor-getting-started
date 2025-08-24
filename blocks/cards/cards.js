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
 function addBetterWayCarouselToggle() {
  const heading = document.querySelector('h1#there-is-always-a-better-way');

  if (!heading) return;

  // Traverse following siblings to find related .cards.block containers
  let current = heading.parentElement.nextElementSibling;
  while (current) {
    const cardsBlock = current.querySelector('.cards.block');
    if (cardsBlock) {
      const containsTargetHeading = [...cardsBlock.querySelectorAll('h3')].some(
        (h3) => h3.textContent.trim() === 'The hunt for the unknow'
      );

      if (containsTargetHeading) {
        cardsBlock.classList.add('better-way-cards');

        // Insert toggle button if not already there
        if (!cardsBlock.querySelector('.cards-view-toggle-btn')) {
          const toggleBtn = document.createElement('button');
          toggleBtn.className = 'cards-view-toggle-btn';
          toggleBtn.textContent = 'View as carousel';

          toggleBtn.addEventListener('click', () => {
            cardsBlock.classList.toggle('carousel-view');
            toggleBtn.textContent = cardsBlock.classList.contains('carousel-view')
              ? 'View as grid'
              : 'View as carousel';
          });

          cardsBlock.insertBefore(toggleBtn, cardsBlock.querySelector('ul'));
        }
      }
    }

    current = current.nextElementSibling;
  }
}

addBetterWayCarouselToggle();

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
