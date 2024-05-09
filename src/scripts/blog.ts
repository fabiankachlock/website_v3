const enableImageButton = (elm: HTMLElement, isActive: boolean) => {
  elm.setAttribute('focusable', isActive ? 'true' : 'false');
  elm.setAttribute('tabindex', isActive ? '0' : '-1');
  elm.setAttribute('aria-hidden', isActive ? 'false' : 'true');
  elm.setAttribute('aria-role', isActive ? 'button' : '');
};

const menu = document.querySelector('.menu') as HTMLElement | null;
const floatingMenu = document.querySelector('.floating-menu') as HTMLElement | null;

document.querySelectorAll('.blog-image').forEach(image => {
  const maximize = image.querySelector('.blog-image__action--maximize') as HTMLElement | null;
  const minimize = image.querySelector('.blog-image__action--minimize') as HTMLElement | null;
  const isOpen = () => image.classList.contains('blog-image--open');

  const toggle = () => {
    let currentlyOpen = isOpen();
    document.querySelectorAll('.blog-image--open').forEach(openImage => {
      openImage.classList.remove('blog-image--open');
    });

    if (currentlyOpen) {
      image.classList.remove('blog-image--open');
    } else {
      image.classList.add('blog-image--open');
    }

    currentlyOpen = !currentlyOpen;
    enableImageButton(maximize!, !currentlyOpen);
    enableImageButton(minimize!, currentlyOpen);
    if (!menu || !floatingMenu) return;

    if (currentlyOpen) {
      menu.style.zIndex = '0';
      floatingMenu.style.zIndex = '0';
    } else {
      menu.style.zIndex = '1000';
      floatingMenu.style.zIndex = '1200';
    }
  };

  image.querySelector('.blog-image__backdrop')?.addEventListener('click', toggle);
  image.querySelector('.blog-image__wrapper')?.addEventListener('click', toggle);
  image.querySelectorAll('.blog-image__action').forEach(actionButton => {
    actionButton?.addEventListener('keydown', e => {
      const key = (e as KeyboardEvent).key;
      if (key === 'Enter' || key === ' ') {
        toggle();
        if (isOpen()) {
          minimize?.focus();
        } else {
          maximize?.focus();
        }
      }
    });
  });

  enableImageButton(maximize!, true);
  enableImageButton(minimize!, false);
});
