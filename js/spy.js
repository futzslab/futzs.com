// Highlights the menu entry matching the section under the header.
(function () {
  function ids(scope) {
    return Array.prototype.map.call(
      document.querySelectorAll('[data-spy] a[href^="#"]'),
      function (a) { return a.getAttribute('href').slice(1); }
    );
  }
  function tick() {
    var list = ids();
    if (!list.length) return;
    var current = list[0];
    list.forEach(function (id) {
      var el = document.getElementById(id);
      if (el && el.getBoundingClientRect().top <= 170) current = id;
    });
    list.forEach(function (id) {
      document.querySelectorAll('[data-spy] a[href="#' + id + '"]').forEach(function (a) {
        a.classList.toggle('is-active', id === current);
      });
    });
  }
  var queued = false;
  window.addEventListener('scroll', function () {
    if (queued) return;
    queued = true;
    requestAnimationFrame(function () { queued = false; tick(); });
  }, { passive: true });
  tick();
})();
