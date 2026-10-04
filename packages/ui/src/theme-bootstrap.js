// Run before CSS/React, including when storage is unavailable. No inline script is needed.
(() => {
  let theme = 'dark';
  try {
    const saved = localStorage.getItem('portfolio-theme');
    if (saved === 'dark' || saved === 'light') theme = saved;
  } catch {
    // Private/restricted browsers still get a usable default theme.
  }
  document.documentElement.dataset.theme = theme;
})();
