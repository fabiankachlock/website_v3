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

// toggle the menu
const menuButtonElement = document.querySelector('.menu__opener') as HTMLButtonElement | null;
const headElement = document.querySelector('.head');

if (menuButtonElement) {
  menuButtonElement.addEventListener('click', () => {
    headElement?.classList.toggle('open');
    menuButtonElement.blur();
  });
}

// toggle language select
document.querySelectorAll('.translate').forEach(e => {
  e.querySelector('.translate__button')?.addEventListener('click', () => {
    e.querySelector('.language-select')?.classList.toggle('open');
  });
});

// setup theme switches
document.querySelectorAll('.theme-switch__button').forEach(e => {
  e.addEventListener('click', () => {
    toggleTheme();
  });
});

setupTheme();
