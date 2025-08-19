import { getMetadata } from '../../scripts/aem.js';
import { loadFragment } from '../fragment/fragment.js';

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

  if (navMeta) {
    footerPath = new URL(footerMeta, window.location).pathname;
  } else {
    const path = window.location.pathname;

    if (path.includes('/aem-boilerplate/agre-aem-boilerplate')) {
      footerPath = '/agre-aem-boilerplate/footer';
    } else {
      footerPath = '/footer';
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
