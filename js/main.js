/* ==========================================================================
   Sadguru Broadnet Services: page behaviour
   Vanilla JS, no dependencies. Loaded with `defer`, so the DOM is ready.
   ========================================================================== */
(function () {
  'use strict';

  var header = document.querySelector('.site-header');
  var toggle = document.querySelector('.nav-toggle');
  var nav = document.getElementById('site-nav');

  /* ---------- Mobile menu ---------- */
  function setMenu(open) {
    toggle.setAttribute('aria-expanded', String(open));
    toggle.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
    nav.classList.toggle('is-open', open);
  }

  toggle.addEventListener('click', function () {
    setMenu(toggle.getAttribute('aria-expanded') !== 'true');
  });

  // Close after choosing a link, on Escape, or on a click outside the header
  nav.addEventListener('click', function (e) {
    if (e.target.closest('a')) setMenu(false);
  });
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && nav.classList.contains('is-open')) {
      setMenu(false);
      toggle.focus();
    }
  });
  document.addEventListener('click', function (e) {
    if (nav.classList.contains('is-open') && !header.contains(e.target)) setMenu(false);
  });

  /* ---------- Header shadow once the page scrolls ---------- */
  function onScroll() {
    header.classList.toggle('is-scrolled', window.scrollY > 8);
  }
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  /* ---------- Scroll-spy: highlight the nav link for the visible section ---------- */
  var links = nav.querySelectorAll('a[href^="#"]');
  var sections = Array.prototype.map.call(links, function (a) {
    return document.querySelector(a.getAttribute('href'));
  }).filter(Boolean);
  // Watch the hero too: it has no nav link, so scrolling back up clears the highlight
  var hero = document.querySelector('.hero');
  if (hero) sections.unshift(hero);

  function setCurrent(hash) {
    links.forEach(function (a) {
      if (a.getAttribute('href') === hash) a.setAttribute('aria-current', 'true');
      else a.removeAttribute('aria-current');
    });
  }

  // After a nav click, mark the destination straight away and pause the spy while the
  // page smooth-scrolls, so the underline doesn't flash across every section passed.
  var spyPaused = false, resumeTimer;
  function resumeSpy() {
    spyPaused = false;
    clearTimeout(resumeTimer);
    window.removeEventListener('scrollend', resumeSpy);
  }
  nav.addEventListener('click', function (e) {
    var a = e.target.closest('a[href^="#"]');
    if (!a) return;
    setCurrent(a.getAttribute('href'));
    spyPaused = true;
    window.addEventListener('scrollend', resumeSpy);
    clearTimeout(resumeTimer);
    resumeTimer = setTimeout(resumeSpy, 1200); // fallback where scrollend isn't supported
  });

  if ('IntersectionObserver' in window) {
    var spy = new IntersectionObserver(function (entries) {
      if (spyPaused) return;
      entries.forEach(function (entry) {
        if (entry.isIntersecting) setCurrent('#' + entry.target.id);
      });
    }, { rootMargin: '-45% 0px -50% 0px' }); // "active" = section crossing the middle of the screen
    sections.forEach(function (s) { spy.observe(s); });
  }

  /* ---------- Contact form: submit to Netlify without leaving the page ----------
     Without JS the form still posts normally and Netlify shows /thank-you.html. */
  var form = document.querySelector('form[name="contact"]');
  if (form && window.fetch) {
    var status = form.querySelector('.form-status');
    var button = form.querySelector('button[type="submit"]');

    form.addEventListener('submit', function (e) {
      e.preventDefault();
      button.disabled = true;
      status.className = 'form-status';
      status.textContent = 'Sending…';

      fetch('/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams(new FormData(form)).toString()
      })
        .then(function (res) {
          if (!res.ok) throw new Error(res.status);
          form.reset();
          status.classList.add('is-success');
          status.textContent = 'Thank you! We have received your enquiry and will call you back soon.';
        })
        .catch(function () {
          status.classList.add('is-error');
          status.textContent = 'Sorry, that did not go through. Please call or WhatsApp us on +91 74981 58140.';
        })
        .then(function () { button.disabled = false; });
    });
  }

  /* ---------- Footer year ---------- */
  var year = document.getElementById('year');
  if (year) year.textContent = new Date().getFullYear();
})();
