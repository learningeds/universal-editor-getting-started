import { getMetadata } from '../../scripts/aem.js';
import { loadFragment } from '../fragment/fragment.js';
import { getThemeFromUrl } from '../../scripts/scripts.js';

/**
 * loads and decorates the footer
 * @param {Element} block The footer block element
 */
export default async function decorate(block) {
  // Load footer as fragment
//  const footerMeta = getMetadata('footer');
//  const footerPath = footerMeta ? new URL(footerMeta, window.location).pathname : '/footer';
  const footerMeta = getMetadata('footer');
  let footerPath;

  if (footerMeta) {
    footerPath = new URL(footerMeta, window.location).pathname;
  } else {
    const theme = getThemeFromUrl();
        switch (theme) {
          case 'midsouth':
            footerPath = '/midsouth-aem-boilerplate/footer';
            break;
          default:
            footerPath = '/footer';
            break;
        }
  }

  const fragment = await loadFragment(footerPath);

  // Clear the current footer block content
  block.textContent = '';

  // Instead of appending a new wrapper, flatten the fragment's children into the block
  while (fragment.firstElementChild) {
    const section = fragment.firstElementChild;
    block.append(section);
  }
}
