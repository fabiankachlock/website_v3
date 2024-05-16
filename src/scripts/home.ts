const content = document.querySelector('.main-content');

// interactive skill drawers
document.querySelectorAll('.skill-drawer').forEach((drawer, idx) => {
  const id = drawer.getAttribute('data-id');
  const head = document.querySelector(`[data-id="${id}"] .skill-drawer__head`);

  head?.addEventListener('click', () => {
    drawer.classList.toggle('open');
    if (drawer.classList.contains('open')) {
      try {
        plausible('Skill', { props: { 'skill-id': id } });
      } catch {}
    }

    let openDrawer: HTMLElement | null = null;
    document.querySelectorAll(`.skill-drawer:not([data-id="${id}"])`).forEach(otherDrawer => {
      if (otherDrawer.classList.contains('open')) {
        otherDrawer.classList.remove('open');
        openDrawer = otherDrawer as HTMLElement;
      }
    });

    if (drawer.classList.contains('open') && (content?.clientWidth ?? 0) < 720) {
      const drawerRect = drawer.getBoundingClientRect();
      const other = openDrawer as HTMLElement | null;
      const topSpacing = 64 + (idx === 0 ? 15 : 0);
      const target = drawerRect.top + (content?.scrollTop ?? 0) - topSpacing;

      if (other && other?.getBoundingClientRect().top < drawerRect.top) {
        const otherHead = document.querySelector(`[data-id="${other.getAttribute('data-id')}"] .skill-drawer__head`);
        const offset = other.getBoundingClientRect().height - (otherHead?.getBoundingClientRect()?.height || 0);
        content?.scrollTo({
          top: target - offset - 31,
          behavior: 'smooth',
        });
      } else {
        content?.scrollTo({
          top: target,
          behavior: 'smooth',
        });
      }
    }
  });
});

document.querySelectorAll('#experience').forEach(span => {
  span.innerHTML = (new Date().getFullYear() - 2018).toString();
});
