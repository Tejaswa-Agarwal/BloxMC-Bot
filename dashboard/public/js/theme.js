(function () {
  const KEY = 'axion-theme';
  const root = document.body;

  function applyTheme(theme) {
    const safe = ['default', 'neon', 'sunset', 'emerald', 'wick'].includes(theme) ? theme : 'default';
    root.classList.remove('theme-default', 'theme-neon', 'theme-sunset', 'theme-emerald', 'theme-wick');
    root.classList.add(`theme-${safe}`);
    localStorage.setItem(KEY, safe);

    document.querySelectorAll('[data-theme]').forEach(btn => {
      btn.classList.toggle('active', btn.getAttribute('data-theme') === safe);
    });
  }

  const saved = localStorage.getItem(KEY) || 'default';
  applyTheme(saved);

  document.addEventListener('click', (e) => {
    const btn = e.target.closest('[data-theme]');
    if (!btn) return;
    applyTheme(btn.getAttribute('data-theme'));
  });
})();
