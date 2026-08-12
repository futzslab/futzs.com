/* Futzs — scroll-spy for the sub-nav and docs TOC, plus docs page search. */
(function () {
  function spy() {
    document.querySelectorAll('[data-spy]').forEach(function (scope) {
      var links = scope.querySelectorAll('a[href^="#"]');
      if (!links.length) return;
      var ids = [], current = null;
      links.forEach(function (a) { ids.push(a.getAttribute('href').slice(1)); });
      ids.forEach(function (id) {
        var el = document.getElementById(id);
        if (el && el.getBoundingClientRect().top <= 170) current = id;
      });
      if (!current) current = ids[0];
      links.forEach(function (a) {
        a.classList.toggle('is-active', a.getAttribute('href') === '#' + current);
      });
    });
  }

  var queued = false;
  window.addEventListener('scroll', function () {
    if (queued) return;
    queued = true;
    requestAnimationFrame(function () { queued = false; spy(); });
  }, { passive: true });
  spy();

  /* Docs search: filters the headings on the current page. */
  var input = document.getElementById('docs-search');
  var panel = document.getElementById('docs-results');
  if (!input || !panel) return;

  var headings = [].slice.call(document.querySelectorAll('[data-docs-body] h2[id], [data-docs-body] h3[id]'))
    .map(function (h) { return { id: h.id, label: h.textContent.trim() }; });

  function jump(id) {
    var el = document.getElementById(id);
    input.value = '';
    render();
    if (el) window.scrollTo({ top: el.getBoundingClientRect().top + window.scrollY - 100 });
  }

  function render() {
    var q = input.value.trim().toLowerCase();
    if (!q) { panel.hidden = true; panel.innerHTML = ''; return; }
    var hits = headings.filter(function (h) { return h.label.toLowerCase().indexOf(q) !== -1; });
    panel.hidden = false;
    if (!hits.length) { panel.innerHTML = '<div class="docs-noresult">No section matches that.</div>'; return; }
    panel.innerHTML = hits.map(function (h) {
      return '<a href="#' + h.id + '" data-id="' + h.id + '">' + h.label + '</a>';
    }).join('');
    panel.querySelectorAll('a').forEach(function (a) {
      a.addEventListener('click', function (e) { e.preventDefault(); jump(a.dataset.id); });
    });
  }

  input.addEventListener('input', render);
  input.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') { input.value = ''; render(); }
    if (e.key === 'Enter') {
      e.preventDefault();
      var first = panel.querySelector('a');
      if (first) jump(first.dataset.id);
    }
  });
  document.addEventListener('click', function (e) {
    if (!panel.contains(e.target) && e.target !== input) { panel.hidden = true; }
  });
})();

/* Mobile navigation: the hamburger opens the link panel. */
(function () {
  var shell = document.querySelector('[data-nav]');
  var toggle = document.querySelector('[data-nav-toggle]');
  if (!shell || !toggle) return;

  function setOpen(open) {
    shell.classList.toggle('is-open', open);
    toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
    toggle.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
  }

  toggle.addEventListener('click', function (e) {
    e.stopPropagation();
    setOpen(!shell.classList.contains('is-open'));
  });

  /* Following a link inside the panel should leave it closed behind you. */
  shell.querySelectorAll('.nav-links a').forEach(function (a) {
    a.addEventListener('click', function () { setOpen(false); });
  });

  document.addEventListener('click', function (e) {
    if (!shell.contains(e.target)) setOpen(false);
  });
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') setOpen(false);
  });
  /* Reset state when resizing back up to the desktop layout. */
  window.addEventListener('resize', function () {
    if (window.innerWidth > 860) setOpen(false);
  });
})();
