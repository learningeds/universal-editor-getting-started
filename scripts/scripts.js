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
 * Moves all the attributes from a given elmenet to another given element.
 * @param {Element} from the element to copy attributes from
 * @param {Element} to the element to copy attributes to
 */
export function moveAttributes(from, to, attributes) {
  if (!attributes) {
    // eslint-disable-next-line no-param-reassign
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
    // eslint-disable-next-line no-console
    console.error('Auto Blocking failed', error);
  }
}

/**
 * Decorates the main element.
 * @param {Element} main The main element
 */
// eslint-disable-next-line import/prefer-default-export
export function decorateMain(main) {
  // hopefully forward compatible button decoration
  decorateButtons(main);
  decorateIcons(main);
  buildAutoBlocks(main);
  decorateSections(main);
  decorateBlocks(main);
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
    /* if desktop (proxy for fast connection) or fonts already loaded, load fonts.css */
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

  loadHeader(doc.querySelector('header'));
  loadFooter(doc.querySelector('footer'));

  loadCSS(`${window.hlx.codeBasePath}/styles/lazy-styles.css`);
  loadFonts();
}

/**
 * Loads everything that happens a lot later,
 * without impacting the user experience.
 */
function loadDelayed() {
  // eslint-disable-next-line import/no-cycle
  window.setTimeout(() => import('./delayed.js'), 3000);
  // load anything that can be postponed to the latest here
}

async function loadPage() {
  await loadEager(document);
  await loadLazy(document);
  loadDelayed();
}

async function loadSiteCss() {
  try {
    loadCSS(`${window.hlx.codeBasePath}/styles/base-styles.css`);
    // const themes = ["site1", "site2", "default"];
    // const randomIndex = Math.floor(Math.random() * themes.length);
    // const theme = toClassName(getMetadata("theme"));
    // for a POC, use a random site theme
    //const theme = themes[randomIndex];
    // console.warn(`the selected theme is ${theme}`);

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
// Add this at the bottom of scripts.js (after loadPage or inside loadPage if preferred)
function handleScrollForHeader() {
  const header = document.querySelector('.header');
  if (!header) return;
  
  if (window.scrollY > 0) {
    header.classList.add('scrolled');
  } else {
    header.classList.remove('scrolled');
  }
}

// Make header fixed at top and toggle nav-sections visibility on scroll
window.addEventListener('scroll', handleScrollForHeader);

// Also call once on load in case user is not at top on load
window.addEventListener('load', handleScrollForHeader);

