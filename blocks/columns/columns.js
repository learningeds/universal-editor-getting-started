export default function decorate(block) {
  const cols = [...block.firstElementChild.children];
  block.classList.add(`columns-${cols.length}-cols`);

  // setup image columns
  [...block.children].forEach((row) => {
    [...row.children].forEach((col) => {
      const pic = col.querySelector('picture');
      if (pic) {
        const picWrapper = pic.closest('div');
        if (picWrapper && picWrapper.children.length === 1) {
          // picture is only content in column
          picWrapper.classList.add('columns-img-col');

          // Inject video only once
          if (!picWrapper.querySelector('video')) {
            const video = document.createElement('video');
            video.src = 'https://atlascopco.scene7.com/is/content/atlascopco/brands/atlas-copco-group/videos/about-us/things/katarina-thing-0x360-730k.mp4';
            video.setAttribute('playsinline', '');
            video.setAttribute('controls', '');
            video.setAttribute('muted', '');
            picWrapper.appendChild(video);
          }

          // Add top right link only once
          if (!picWrapper.querySelector('.top-right-link')) {
            const link = document.createElement('a');
            link.href = 'https://atlascopco.scene7.com/is/content/atlascopco/brands/atlas-copco-group/videos/about-us/things/katarina-thing-0x360-730k.mp4';
            link.target = '_blank';
            link.rel = 'noopener noreferrer';
            link.className = 'top-right-link';
            link.textContent = 'Zoom / Fullscreen';
            picWrapper.appendChild(link);
          }
        }
      }
    });
  });

  // Process section metadata
  block.querySelectorAll(':scope > div:not([data-columns-status])').forEach((section) => {
    const sectionMeta = section.querySelector('div.columns-metadata');
    if (sectionMeta) {
      const meta = readBlockConfig(sectionMeta);
      Object.keys(meta).forEach((key) => {
        if (key === 'style') {
          const styles = meta.style
            .split(',')
            .filter((style) => style)
            .map((style) => toClassName(style.trim()));
          styles.forEach((style) => section.classList.add(style));
        } else {
          section.dataset[toCamelCase(key)] = meta[key];
        }
      });
      sectionMeta.parentNode.remove();
    }
  });
}
