import { getMetadata } from '../../scripts/aem.js';
import { loadFragment } from '../fragment/fragment.js';
import { getThemeFromUrl } from '../../scripts/scripts.js';

// media query match that indicates mobile/tablet width
const isDesktop = window.matchMedia('(min-width: 900px)');

function closeOnEscape(e) {
  if (e.code === 'Escape') {
    const nav = document.getElementById('nav');
    const navSections = nav.querySelector('.nav-sections');
    const navSectionExpanded = navSections.querySelector('[aria-expanded="true"]');
    if (navSectionExpanded && isDesktop.matches) {
      // eslint-disable-next-line no-use-before-define
      toggleAllNavSections(navSections);
      navSectionExpanded.focus();
    } else if (!isDesktop.matches) {
      // eslint-disable-next-line no-use-before-define
      toggleMenu(nav, navSections);
      nav.querySelector('button').focus();
    }
  }
}

function closeOnFocusLost(e) {
  const nav = e.currentTarget;
  if (!nav.contains(e.relatedTarget)) {
    const navSections = nav.querySelector('.nav-sections');
    const navSectionExpanded = navSections.querySelector('[aria-expanded="true"]');
    if (navSectionExpanded && isDesktop.matches) {
      // eslint-disable-next-line no-use-before-define
      toggleAllNavSections(navSections, false);
    } else if (!isDesktop.matches) {
      // eslint-disable-next-line no-use-before-define
      toggleMenu(nav, navSections, false);
    }
  }
}

function openOnKeydown(e) {
  const focused = document.activeElement;
  const isNavDrop = focused.className === 'nav-drop';
  if (isNavDrop && (e.code === 'Enter' || e.code === 'Space')) {
    const dropExpanded = focused.getAttribute('aria-expanded') === 'true';
    // eslint-disable-next-line no-use-before-define
    toggleAllNavSections(focused.closest('.nav-sections'));
    focused.setAttribute('aria-expanded', dropExpanded ? 'false' : 'true');
  }
}

function focusNavSection() {
  document.activeElement.addEventListener('keydown', openOnKeydown);
}

/**
 * Toggles all nav sections
 * @param {Element} sections The container element
 * @param {Boolean} expanded Whether the element should be expanded or collapsed
 */
function toggleAllNavSections(sections, expanded = false) {
  sections.querySelectorAll('.nav-sections .default-content-wrapper > ul > li').forEach((section) => {
    section.setAttribute('aria-expanded', expanded);
  });
}

/**
 * Toggles the entire nav
 * @param {Element} nav The container element
 * @param {Element} navSections The nav sections within the container element
 * @param {*} forceExpanded Optional param to force nav expand behavior when not null
 */
function toggleMenu(nav, navSections, forceExpanded = null) {
  const expanded = forceExpanded !== null ? !forceExpanded : nav.getAttribute('aria-expanded') === 'true';
  const button = nav.querySelector('.nav-hamburger button');
  document.body.style.overflowY = (expanded || isDesktop.matches) ? '' : 'hidden';
  nav.setAttribute('aria-expanded', expanded ? 'false' : 'true');
  toggleAllNavSections(navSections, expanded || isDesktop.matches ? 'false' : 'true');
  button.setAttribute('aria-label', expanded ? 'Open navigation' : 'Close navigation');
  // enable nav dropdown keyboard accessibility
  const navDrops = navSections.querySelectorAll('.nav-drop');
  if (isDesktop.matches) {
    navDrops.forEach((drop) => {
      if (!drop.hasAttribute('tabindex')) {
        drop.setAttribute('tabindex', 0);
        drop.addEventListener('focus', focusNavSection);
      }
    });
  } else {
    navDrops.forEach((drop) => {
      drop.removeAttribute('tabindex');
      drop.removeEventListener('focus', focusNavSection);
    });
  }

  // enable menu collapse on escape keypress
  if (!expanded || isDesktop.matches) {
    // collapse menu on escape press
    window.addEventListener('keydown', closeOnEscape);
    // collapse menu on focus lost
    nav.addEventListener('focusout', closeOnFocusLost);
  } else {
    window.removeEventListener('keydown', closeOnEscape);
    nav.removeEventListener('focusout', closeOnFocusLost);
  }
}

export default async function decorate(block) {
  // Clear existing content
  block.textContent = '';

  // Wrapper
  const navWrapper = document.createElement('div');
  navWrapper.className = 'nav-wrapper';

  // Nav container
  const nav = document.createElement('nav');
  nav.id = 'nav';
  nav.setAttribute('aria-expanded', 'false');

  // --- Left: Brand Logo ---
  const navBrand = document.createElement('div');
  navBrand.className = 'nav-brand';
  navBrand.innerHTML = `
    <div class="default-content-wrapper">
      <picture>
        <img src="/adobe/dynamicmedia/deliver/dm-aid--c86512f3-6b96-434a-9919-ef3317c70777/atlas-copco-group-logo-header-1.webp?preferwebp=true&quality=85&width=160" width="160" height="46" alt="Atlas Copco Group">
      </picture>
    </div>
  `;

  // --- Right: Hamburger Menu Button ---
  const hamburger = document.createElement('div');
  hamburger.classList.add('nav-hamburger');
  hamburger.innerHTML = `
    <button type="button" aria-controls="nav" aria-label="Toggle navigation" id="menu-toggle">
      <span class="nav-hamburger-icon"></span> <span class="menu-label">Menu</span>
    </button>
  `;

  // --- Hidden Menu List ---
  const navSections = document.createElement('div');
  navSections.className = 'nav-sections';
  navSections.style.display = 'none'; // Start hidden

   navSections.innerHTML = `
    <div class="default-content-wrapper">
      <ul>
        <li><a href="https://www.atlascopcogroup.com/en/about-us">About us</a></li>
        <li><a href="https://www.atlascopcogroup.com/en/sustainability">Sustainability</a></li>
        <li><a href="https://www.atlascopcogroup.com/en/careers">Careers</a></li>
        <li><a href="https://www.atlascopcogroup.com/en/media">Media</a></li>
        <li><a href="https://www.atlascopcogroup.com/en/investors">Investors</a></li>
        <li><a href="https://www.atlascopcogroup.com/en/innovation">Innovation</a></li>
      </ul>
     <ul class="nav-utility">
  <li class="nav-utility-item"><span>ENGLISH</span><i class="globe-icon">🌐</i></li>
  <li class="nav-utility-item"><span>SEARCH</span><i class="search-icon">🔍</i></li>
</ul>

    </div>
  `;


  // --- Toggle Menu Show/Hide ---
 hamburger.querySelector('button').addEventListener('click', () => {
  const isOpen = nav.getAttribute('aria-expanded') === 'true';
  nav.setAttribute('aria-expanded', isOpen ? 'false' : 'true');
  navSections.style.display = isOpen ? 'none' : 'block';
});


  // Assemble navigation
  nav.append(navBrand, hamburger, navSections);

navWrapper.append(nav);


  block.append(navWrapper);
}

