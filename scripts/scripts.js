import {
  loadHeader,
  loadFooter,
  decorateButtons,
  decorateIcons,
  decorateSections,
  decorateBlocks,
  decorateTemplateAndTheme,
  waitForFirstImage,
  loadSection,
  loadSections,
  loadCSS,
  getMetadata,
  toClassName
} from './aem.js';

/**
 * Moves all the attributes from a given element to another given element.
 * @param {Element} from the element to copy attributes from
 * @param {Element} to the element to copy attributes to
 */
export function moveAttributes(from, to, attributes) {
  if (!attributes) {
    attributes = [...from.attributes].map(({ nodeName }) => nodeName);
  }
  attributes.forEach((attr) => {
    const value = from.getAttribute(attr);
    if (value) {
      to?.setAttribute(attr, value);
      from.removeAttribute(attr);
    }
  });
}

/**
 * Move instrumentation attributes from a given element to another given element.
 * @param {Element} from the element to copy attributes from
 * @param {Element} to the element to copy attributes to
 */
export function moveInstrumentation(from, to) {
  moveAttributes(
    from,
    to,
    [...from.attributes]
      .map(({ nodeName }) => nodeName)
      .filter((attr) => attr.startsWith('data-aue-') || attr.startsWith('data-richtext-')),
  );
}

/**
 * load fonts.css and set a session storage flag
 */
async function loadFonts() {
  await loadCSS(`${window.hlx.codeBasePath}/styles/fonts.css`);
  try {
    if (!window.location.hostname.includes('localhost')) sessionStorage.setItem('fonts-loaded', 'true');
  } catch (e) {
    // do nothing
  }
}

/**
 * Builds all synthetic blocks in a container element.
 * @param {Element} main The container element
 */
function buildAutoBlocks() {
  try {
    // TODO: add auto block, if needed
  } catch (error) {
    console.error('Auto Blocking failed', error);
  }
}

/**
 * Decorates the main element.
 * @param {Element} main The main element
 */
export function decorateMain(main) {
  decorateButtons(main);
  decorateIcons(main);
  buildAutoBlocks(main);
  decorateSections(main);
  decorateBlocks(main);
}

/**
 * Adjusts body padding to prevent content being hidden behind fixed header
 */
function adjustBodyPaddingForFixedHeader() {
  const navWrapper = document.querySelector('.nav-wrapper');
  if (navWrapper) {
    const height = navWrapper.offsetHeight;
    document.body.style.paddingTop = `${height}px`;
  }
}

/**
 * Loads everything needed to get to LCP.
 * @param {Element} doc The container element
 */
async function loadEager(doc) {
  loadSiteCss();
  document.documentElement.lang = 'en';
  decorateTemplateAndTheme();
  const main = doc.querySelector('main');
  if (main) {
    decorateMain(main);
    document.body.classList.add('appear');
    await loadSection(main.querySelector('.section'), waitForFirstImage);
  }

  try {
    if (window.innerWidth >= 900 || sessionStorage.getItem('fonts-loaded')) {
      loadFonts();
    }
  } catch (e) {
    // do nothing
  }
}

/**
 * Loads everything that doesn't need to be delayed.
 * @param {Element} doc The container element
 */
async function loadLazy(doc) {
  const main = doc.querySelector('main');
  await loadSections(main);

  const { hash } = window.location;
  const element = hash ? doc.getElementById(hash.substring(1)) : false;
  if (hash && element) element.scrollIntoView();

  loadHeader(doc.querySelector('header')).then(() => {
    adjustBodyPaddingForFixedHeader(); // Add padding after header loads
  });
  loadFooter(doc.querySelector('footer'));

  loadCSS(`${window.hlx.codeBasePath}/styles/lazy-styles.css`);
  loadFonts();
}

/**
 * Loads everything that happens a lot later,
 * without impacting the user experience.
 */
function loadDelayed() {
  window.setTimeout(() => import('./delayed.js'), 3000);
}

async function loadPage() {
  await loadEager(document);
  await loadLazy(document);
  loadDelayed();

  document.addEventListener('DOMContentLoaded', function () {
    const navWrapper = document.querySelector('.nav-wrapper');

    // Adjust padding on load
    adjustBodyPaddingForFixedHeader();

    // Adjust on scroll
    window.addEventListener('scroll', () => {
      if (window.scrollY > 10) {
        navWrapper?.classList.add('scrolled');
      } else {
        navWrapper?.classList.remove('scrolled');
      }
    });

    // Adjust on resize
    window.addEventListener('resize', adjustBodyPaddingForFixedHeader);
  });
}

async function loadSiteCss() {
  try {
    loadCSS(`${window.hlx.codeBasePath}/styles/base-styles.css`);

    const themeFromUrl = getThemeFromUrl();
    console.warn(`the selected theme is ${themeFromUrl}`);
    switch (themeFromUrl) {
      case "atlascopco":
        loadCSS(`${window.hlx.codeBasePath}/styles/themes/atlascopco-styles.css`);
        break;
      case "midsouth":
        loadCSS(`${window.hlx.codeBasePath}/styles/themes/midsouth-styles.css`);
        break;
      case "ceccato":
        loadCSS(`${window.hlx.codeBasePath}/styles/themes/ceccato-styles.css`);
        break;
      case "compresseurs-mauguiere":
        loadCSS(`${window.hlx.codeBasePath}/styles/themes/compresseurs-mauguiere-styles.css`);
        break;
      default:
        break;
    }
  } catch (error) {
    console.log("Theme loading failed", error);
  }
}

export function getThemeFromUrl() {
  if (window.location.href.indexOf('midsouth-aem-boilerplate') > -1) {
    return 'midsouth';
  }
  if (window.location.href.indexOf('ceccato') > -1) {
    return 'ceccato';
  }
  if (window.location.href.indexOf('compresseurs-mauguiere') > -1) {
    return 'compresseurs-mauguiere';
  }
  return 'atlascopco';
}

loadPage();
