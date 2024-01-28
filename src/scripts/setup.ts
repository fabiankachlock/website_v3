import { getStoredTheme, setTheme, toggleTheme } from '@/scripts/theme';

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

const menuButtonElement = document.querySelector('.menu__opener') as HTMLButtonElement | null;
const headElement = document.querySelector('.head');
const translateElements = document.querySelectorAll('.translate');
const themeSwitchElements = document.querySelectorAll('.theme-switch__button');

// toggle the menu
if (menuButtonElement) {
  menuButtonElement.addEventListener('click', () => {
    headElement?.classList.toggle('open');
    menuButtonElement.blur();
  });
}

// toggle language select
if (translateElements.length > 0) {
  translateElements.forEach(
    e =>
      e.querySelector('.translate__button')?.addEventListener('click', () => {
        e.querySelector('.language-select')?.classList.toggle('open');
      }),
  );
}

if (themeSwitchElements.length > 0) {
  themeSwitchElements.forEach(e =>
    e.addEventListener('click', () => {
      toggleTheme();
    }),
  );
}

setupTheme();
