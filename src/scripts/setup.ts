import { getStoredTheme, setTheme } from '@/scripts/theme';

const setupTheme = () => {
  const storedTheme = getStoredTheme();
  if (storedTheme) {
    setTheme(storedTheme);
    return;
  }

  if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
    setTheme('dark');
  }
};

const menuButtonElement = document.querySelector('.menu__opener');
const bgElement = document.querySelector('.background');
const frameContentElement = document.querySelector('.frame__content');
const headElement = document.querySelector('.head');
const footerElement = document.querySelector('.footer');
const menuElement = document.querySelector('.head__menu-content-wrapper');
const terminalElement = document.querySelector('.terminal-opener');
const consoleElement = document.querySelector('.footer__console-content-wrapper');
let last = 0;
let stringSize = 0;

if (frameContentElement) {
  frameContentElement.addEventListener('scroll', () => renderBg());
}
window.onresize = () => {
  resizeBg();
  repositionUpperHline();
  repositionBottomHline();
};

const chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789-+_#=';

const resizeBg = () => {
  const rect = bgElement?.getBoundingClientRect();
  stringSize = ((rect?.width ?? 1) / 10) * ((rect?.height ?? 1) / 20);
  renderBg();
};

const renderBg = () => {
  const now = performance.now();
  if (!bgElement || now - 50 < last) return;
  let randomText = '';
  for (let i = 0; i < stringSize; i++) {
    randomText += chars[Math.floor(Math.random() * chars.length)];
  }
  last = now;
  bgElement.innerHTML = randomText;
};

const moveHline = (selector: string, attribute: string, yPosition?: string) => {
  if (yPosition !== undefined) {
    document.querySelector(selector)?.setAttribute('style', `${attribute}: ${yPosition}`);
  } else {
    document.querySelector(selector)?.setAttribute('style', `${attribute}:  var(--inset)`);
  }
};

// toggle the menu
const toggleMenu = () => {
  headElement?.classList.toggle('open');
  repositionUpperHline();
};

export const repositionUpperHline = () => {
  const height = menuElement?.getBoundingClientRect()?.height;
  if (headElement?.classList.contains('open')) {
    moveHline('.frame__hline--top', 'top', `calc(var(--inset) + ${height}px)`);
  } else {
    moveHline('.frame__hline--top', 'top', undefined);
  }
};

if (menuButtonElement) {
  menuButtonElement.addEventListener('click', () => toggleMenu());
}

// toggle the terminal
const toggleTerminal = () => {
  footerElement?.classList.toggle('open');
  repositionBottomHline();
};

export const repositionBottomHline = () => {
  const height = consoleElement?.getBoundingClientRect()?.height;
  if (footerElement?.classList.contains('open')) {
    moveHline('.frame__hline--bottom', 'bottom', `calc(var(--inset) + ${height}px)`);
  } else {
    moveHline('.frame__hline--bottom', 'bottom', undefined);
  }
};

if (terminalElement) {
  terminalElement.addEventListener('click', () => toggleTerminal());
}

setupTheme();
resizeBg();
