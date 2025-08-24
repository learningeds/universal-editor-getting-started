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
  // Function to add toggle button and carousel logic to the "better way" cards blocks
    function addBetterWayCarouselToggle() {
        // Find the heading to locate related cards blocks
        const heading = document.querySelector('h1#there-is-always-a-better-way');
        if (!heading) return;

        // Traverse siblings to find cards blocks related to the heading
        let current = heading.parentElement.nextElementSibling;
        while (current) {
            const cardsBlock = current.querySelector('.cards.block');
            if (cardsBlock) {
                // Check if the cards block contains a specific card heading to identify target blocks
                const containsTargetHeading = [...cardsBlock.querySelectorAll('h3')].some(
                    (h3) => h3.textContent.trim() === 'The hunt for the unknow'
                );

                if (containsTargetHeading) {
                    cardsBlock.classList.add('better-way-cards');

                    // Insert toggle button if not already present
                    if (!cardsBlock.querySelector('.cards-view-toggle-btn')) {
                        const toggleBtn = document.createElement('button');
                        toggleBtn.className = 'cards-view-toggle-btn';
                        toggleBtn.textContent = 'View as carousel';

                        // Carousel state
                        let index = 0;
                        let intervalId;

                        // Grab ul and li cards inside this cardsBlock
                        const track = cardsBlock.querySelector('ul');
                        const cards = cardsBlock.querySelectorAll('ul > li');
                        const total = cards.length;

                        // Create carousel indicators container
                        const indicatorWrapper = document.createElement('div');
                        indicatorWrapper.className = 'cards-carousel-indicators';

                        // Create dots for indicators
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
                        cardsBlock.appendChild(indicatorWrapper);

                        // Update carousel position and active dot
                        function updateCarousel() {
                            track.style.transform = `translateX(-${index * 100}%)`;
                            indicatorWrapper.querySelectorAll('.dot').forEach((dot, i) => {
                                dot.classList.toggle('active', i === index);
                            });
                        }

                        // Start automatic sliding
                        function startAutoSlide() {
                            intervalId = setInterval(() => {
                                index = (index + 1) % total;
                                updateCarousel();
                            }, 15000);
                        }

                        // Stop automatic sliding
                        function stopAutoSlide() {
                            clearInterval(intervalId);
                        }

                        // Handle toggle button click: switch between grid and carousel views
                        toggleBtn.addEventListener('click', () => {
                            cardsBlock.classList.toggle('carousel-view');
                            const isCarousel = cardsBlock.classList.contains('carousel-view');

                            toggleBtn.textContent = isCarousel ? 'View as grid' : 'View as carousel';

                            if (isCarousel) {
                                startAutoSlide();
                                index = 0;
                                updateCarousel();
                            } else {
                                stopAutoSlide();
                                track.style.transform = 'translateX(0)';
                                indicatorWrapper.querySelectorAll('.dot').forEach((dot) => dot.classList.remove('active'));
                            }
                        });

                        // Append the toggle button before the ul
                        cardsBlock.insertBefore(toggleBtn, track);

                        // If block is initially in carousel view, activate carousel behavior
                        if (cardsBlock.classList.contains('carousel-view')) {
                            startAutoSlide();
                            updateCarousel();
                        }
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
