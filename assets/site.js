/* A/1 Creative Website 2.0 — shared site behavior.
   Progressive enhancement only: nav links work with JS disabled; this adds the
   mobile menu toggle, sticky-header shadow, active-link marking, light reveal,
   and the copyright year. No external requests. */
(function () {
  'use strict';
  var doc = document;

  /* ---- sticky header shadow on scroll ---- */
  var header = doc.querySelector('.site-header');
  if (header) {
    var onScroll = function () { header.classList.toggle('scrolled', window.scrollY > 8); };
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
  }

  /* ---- mobile nav toggle ---- */
  var toggle = doc.querySelector('.nav-toggle');
  var links = doc.getElementById('nav-links');
  if (toggle && links) {
    var setOpen = function (open) {
      toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
      links.classList.toggle('open', open);
    };
    toggle.addEventListener('click', function () {
      setOpen(toggle.getAttribute('aria-expanded') !== 'true');
    });
    links.addEventListener('click', function (e) {
      if (e.target.closest('a')) setOpen(false);
    });
    doc.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && toggle.getAttribute('aria-expanded') === 'true') { setOpen(false); toggle.focus(); }
    });
    doc.addEventListener('click', function (e) {
      if (links.classList.contains('open') && !e.target.closest('.nav')) setOpen(false);
    });
    window.addEventListener('resize', function () { if (window.innerWidth > 900) setOpen(false); });
  }

  /* ---- mark the active nav link by pathname ---- */
  var path = location.pathname.replace(/\/index\.html$/, '/').replace(/\.html$/, '');
  if (path === '') path = '/';
  Array.prototype.forEach.call(doc.querySelectorAll('.nav-links a[href]'), function (a) {
    var href = a.getAttribute('href').replace(/\.html$/, '');
    if (href === path || (href !== '/' && path.indexOf(href) === 0)) a.setAttribute('aria-current', 'page');
  });

  /* ---- light reveal on scroll (respects reduced motion) ---- */
  var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var reveals = doc.querySelectorAll('.reveal');
  if (reveals.length) {
    if (reduce || !('IntersectionObserver' in window)) {
      Array.prototype.forEach.call(reveals, function (el) { el.classList.add('in'); });
    } else {
      var io = new IntersectionObserver(function (entries) {
        entries.forEach(function (en) { if (en.isIntersecting) { en.target.classList.add('in'); io.unobserve(en.target); } });
      }, { rootMargin: '0px 0px -8% 0px', threshold: 0.06 });
      Array.prototype.forEach.call(reveals, function (el) { io.observe(el); });
    }
  }

  /* ---- copyright year ---- */
  Array.prototype.forEach.call(doc.querySelectorAll('[data-year]'), function (el) {
    el.textContent = new Date().getFullYear();
  });
})();
