// interactive skill drawers
document.querySelectorAll('.skill-drawer').forEach(drawer => {
  const id = drawer.getAttribute('data-id');
  // document.querySelector(`[data-id="${id}"] .skill-drawer__opener`)?
  document.querySelector(`[data-id="${id}"] .skill-drawer__head`)?.addEventListener('click', () => {
    drawer.classList.toggle('open');
    document.querySelectorAll(`.skill-drawer:not([data-id="${id}"])`).forEach(otherDrawer => {
      otherDrawer.classList.remove('open');
    });
  });
});

document.querySelectorAll('#experience').forEach(span => {
  span.innerHTML = (new Date().getFullYear() - 2018).toString();
});
