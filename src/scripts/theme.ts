export const setTheme = (theme: string) => {
  document.body.setAttribute("data-theme", theme);
  localStorage.setItem("fabiankachlock.dev/theme", theme);

  //   document
  //     .querySelectorAll('[data-id="favicon"]')
  //     .forEach((elm) => elm.remove());

  //   const link = document.createElement("link");
  //   link.setAttribute("rel", "icon");
  //   link.setAttribute("data-id", "favicon");
  //   link.setAttribute("type", "image/svg");
  //   link.setAttribute("href", `/img/icon/icon_${theme}.svg`);
  //   document.head.appendChild(link);
};

export const getStoredTheme = (): string | null => {
  return localStorage.getItem("fabiankachlock.dev/theme");
};

export const toggleTheme = () => {
  if (document.body.getAttribute("data-theme") == "dark") {
    setTheme("light");
  } else {
    setTheme("dark");
  }
};
