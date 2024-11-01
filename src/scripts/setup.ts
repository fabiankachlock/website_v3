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
setupTheme();

// toggle the menu
const menuButtonElement = document.querySelector('.menu__opener') as HTMLButtonElement | null;
const headElement = document.querySelector('.head') as HTMLElement | null;

if (menuButtonElement) {
  menuButtonElement.addEventListener('click', () => {
    headElement?.classList.toggle('open');
    menuButtonElement.blur();
  });
}

const isMenuOpen = () => headElement && headElement.classList.contains('open');

const tryToggleMenu = (open: boolean) => {
  if (headElement && open && !headElement.classList.contains('open')) {
    headElement.classList.add('open');
  } else if (headElement && !open && headElement.classList.contains('open')) {
    headElement.classList.remove('open');
  }
};

// toggle language select
document.querySelectorAll('.translate').forEach(e => {
  e.querySelector('.translate__button')?.addEventListener('click', evt => {
    e.querySelector('.language-select')?.classList.toggle('open');
    evt.stopPropagation();
    try {
      plausible('Translate');
    } catch {
      /* empty */
    }
  });
});

document.addEventListener('click', () => {
  document.querySelectorAll('.translate').forEach(e => {
    e.querySelector('.language-select')?.classList.remove('open');
  });
});

// setup theme switches
document.querySelectorAll('.theme-switch__button').forEach(e => {
  e.addEventListener('click', () => {
    toggleTheme();
    try {
      plausible('Theme');
    } catch {
      /* empty */
    }
  });
});

document.querySelectorAll('#year').forEach(span => {
  span.innerHTML = new Date().getFullYear().toString();
});

// swipes
let xStart: number | undefined = undefined;
let xEnd: number | undefined = undefined;
let yStart: number | undefined = undefined;

const handleTouchStart = (evt: TouchEvent) => {
  // set initial touch position
  xStart = evt.touches[0]?.clientX;
  yStart = evt.touches[0]?.clientY;
  // reset end state
  xEnd = undefined;
  // prepare dom nodes
  headElement?.classList.add('dragging');
  document.body?.style.setProperty('--dragged-offset', '0.0001');
};

const handleTouchMove = (evt: TouchEvent) => {
  if (!xStart || !yStart || window.innerWidth > 1024) {
    // not initial position / window to large --> disable dragging
    xEnd = undefined;
    return;
  }

  // set current end
  xEnd = evt.touches[0]?.clientX;
  const minThreshold = 5;
  const yDiff = Math.abs(yStart - (evt.touches[0]?.clientY ?? yStart));
  let xDiff = xStart - (xEnd ?? xStart);
  const menuOpen = isMenuOpen();

  // prevent swipes in the opposite direction
  if ((xDiff > 0 && menuOpen) || (xDiff < 0 && !menuOpen)) {
    return;
  }
  xDiff = Math.abs(xDiff);

  // sort ou normal scrolling and prevent menu flickering on normal scroll
  if (yDiff > xDiff || xDiff < minThreshold) {
    return;
  }

  // slowly reveal the menu as the user drags
  const menuWidth = Math.min(window.innerWidth * 0.7, 300); // menuWidth = max(70vw, 300px)
  const openThreshold = menuWidth * 0.5;
  document.body?.style.setProperty('--dragged-offset', `${xDiff / menuWidth}`);

  if (xDiff < openThreshold || !xEnd) {
    return;
  }

  // open or close the menu after the threshold is surpassed
  tryToggleMenu(xStart > xEnd);
  // stop the drag
  headElement?.classList.remove('dragging');
  xStart = undefined;
};

const handleTouchEnd = () => {
  headElement?.classList.remove('dragging');
};

document.addEventListener('touchstart', handleTouchStart, false);
document.addEventListener('touchmove', handleTouchMove, false);
document.addEventListener('touchend', handleTouchEnd, false);
