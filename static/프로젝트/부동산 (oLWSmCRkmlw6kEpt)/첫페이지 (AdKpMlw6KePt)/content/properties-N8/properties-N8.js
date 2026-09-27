(function() {
  function initN8Reveal() {
    var section = document.querySelector('.properties-N8[id="ciMLW6keFd"]');
    if (!section) return;

    var items = section.querySelectorAll('.addr');
    if (!items.length) return;

    section.classList.add('reveal-ready');

    var showItems = function() {
      items.forEach(function(item, idx) {
        window.setTimeout(function() {
          item.classList.add('in-view');
        }, idx * 180);
      });
    };

    if (!('IntersectionObserver' in window)) {
      showItems();
      return;
    }

    var observer = new IntersectionObserver(function(entries, obs) {
      entries.forEach(function(entry) {
        if (entry.isIntersecting) {
          showItems();
          obs.unobserve(entry.target);
        }
      });
    }, {
      threshold: 0.2,
      rootMargin: '0px 0px -10% 0px'
    });

    observer.observe(section);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initN8Reveal);
  } else {
    initN8Reveal();
  }
})();
