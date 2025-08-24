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

    // ===== Combined Carousel Toggle Logic for section_1144820921 =====

    export default function decorate(block) {
        // Build <ul> from block rows
        const ul = document.createElement('ul');
        [...block.children].forEach((row) => {
            const li = document.createElement('li');
            while (row.firstElementChild) li.append(row.firstElementChild);
            [...li.children].forEach((div) => {
                if (div.querySelector('picture')) {
                    div.className = 'cards-card-image';
                } else {
                    div.className = 'cards-card-body';
                }
            });
            ul.append(li);
        });

        block.textContent = '';
        block.append(ul);

        // ===== Carousel logic for section_1144820921 only =====
        const section = document.querySelector('[data-aue-resource*="section_1144820921"]');
        if (!section) return;

        const combinedContainer = document.createElement('div');
        combinedContainer.className = 'combined-cards grid-view';

        const combinedUL = document.createElement('ul');
        combinedContainer.appendChild(combinedUL);

        // Gather all cards from all .combined-cards
        section.querySelectorAll('.combined-cards ul').forEach(cardUL => {
            cardUL.querySelectorAll('li').forEach(li => {
                combinedUL.appendChild(li.cloneNode(true));
            });
        });

        // Hide original .combined-cards blocks
        section.querySelectorAll('.combined-cards').forEach(el => {
            el.style.display = 'none';
        });

        const referenceNode = section.querySelector('.default-content-wrapper');
        if (referenceNode) {
            referenceNode.insertAdjacentElement('afterend', combinedContainer);
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
                combinedUL.querySelectorAll('li').forEach(li => {
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
                combinedUL.querySelectorAll('li').forEach(li => li.removeAttribute('style'));
                stopAutoSlide();
                indicatorWrapper.remove();
                toggleBtn.textContent = 'View as carousel';
            }
        });

        combinedContainer.classList.add('grid-view');
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
