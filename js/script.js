/* СК «ПРОФИ» — интерактивность сайта */
(function () {
  'use strict';

  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------- Год в футере ---------- */
  document.querySelectorAll('#year').forEach(function (el) {
    el.textContent = new Date().getFullYear();
  });

  /* ---------- Мобильное меню ---------- */
  var burger = document.getElementById('burger');
  var mobileMenu = document.getElementById('mobileMenu');
  if (burger && mobileMenu) {
    burger.addEventListener('click', function () {
      burger.classList.toggle('open');
      mobileMenu.classList.toggle('open');
      document.body.style.overflow = mobileMenu.classList.contains('open') ? 'hidden' : '';
    });
    mobileMenu.querySelectorAll('a').forEach(function (a) {
      a.addEventListener('click', function () {
        burger.classList.remove('open');
        mobileMenu.classList.remove('open');
        document.body.style.overflow = '';
      });
    });
  }

  /* ---------- Появление секций при скролле ---------- */
  var revealEls = document.querySelectorAll('.reveal');
  if (revealEls.length && 'IntersectionObserver' in window && !reduceMotion) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) {
          en.target.classList.add('visible');
          io.unobserve(en.target);
        }
      });
    }, { threshold: 0.12 });
    revealEls.forEach(function (el) { io.observe(el); });
  } else {
    revealEls.forEach(function (el) { el.classList.add('visible'); });
  }

  /* ---------- Параллакс героя: скролл + лёгкий наклон за мышью ---------- */
  var heroBg = document.querySelector('.hero__bg');
  if (heroBg && !reduceMotion) {
    var hero = document.querySelector('.hero');
    window.addEventListener('scroll', function () {
      var y = window.scrollY;
      if (y < window.innerHeight) {
        heroBg.style.transform = 'translateY(' + (y * 0.25) + 'px) scale(' + (1 + y / 4000) + ')';
      }
    }, { passive: true });
    hero.addEventListener('mousemove', function (e) {
      var r = hero.getBoundingClientRect();
      var dx = (e.clientX - r.left) / r.width - 0.5;
      var dy = (e.clientY - r.top) / r.height - 0.5;
      heroBg.style.transform = 'translate(' + (dx * -14) + 'px,' + (dy * -10) + 'px) scale(1.06)';
    });
    hero.addEventListener('mouseleave', function () {
      heroBg.style.transform = '';
    });
  }

  /* ---------- Анимированные счётчики цифр ---------- */
  function animateNum(el) {
    var target = parseInt(el.getAttribute('data-count'), 10);
    if (isNaN(target)) return;
    var start = null, dur = 1400;
    function step(ts) {
      if (!start) start = ts;
      var p = Math.min((ts - start) / dur, 1);
      el.textContent = Math.round(target * (1 - Math.pow(1 - p, 3)));
      if (p < 1) requestAnimationFrame(step);
    }
    requestAnimationFrame(step);
  }
  var nums = document.querySelectorAll('[data-count]');
  if (nums.length && 'IntersectionObserver' in window && !reduceMotion) {
    var ioNum = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) { animateNum(en.target); ioNum.unobserve(en.target); }
      });
    }, { threshold: 0.5 });
    nums.forEach(function (el) { ioNum.observe(el); });
  }

  /* ---------- Слайдер объектов (главная) + автоплей ---------- */
  var slider = document.getElementById('slider');
  if (slider) {
    var track = slider.querySelector('.slider__track');
    var slides = Array.prototype.slice.call(slider.querySelectorAll('.slider__slide'));
    var prevBtn = slider.querySelector('[data-prev]');
    var nextBtn = slider.querySelector('[data-next]');
    var dotsWrap = slider.querySelector('[data-dots]');
    var index = 0, timer = null;

    function perView() {
      var w = window.innerWidth;
      if (w <= 620) return 1;
      if (w <= 1024) return 2;
      return 3;
    }
    function maxIndex() { return Math.max(0, slides.length - perView()); }

    function renderDots() {
      if (!dotsWrap) return;
      dotsWrap.innerHTML = '';
      for (var i = 0; i <= maxIndex(); i++) {
        (function (i) {
          var d = document.createElement('button');
          d.className = 'slider__dot' + (i === index ? ' active' : '');
          d.setAttribute('aria-label', 'Слайд ' + (i + 1));
          d.addEventListener('click', function () { go(i); restart(); });
          dotsWrap.appendChild(d);
        })(i);
      }
    }
    function go(i) {
      index = Math.min(Math.max(i, 0), maxIndex());
      var slideW = slides[0].getBoundingClientRect().width;
      track.style.transform = 'translateX(' + (-index * slideW) + 'px)';
      if (prevBtn) prevBtn.disabled = index === 0;
      if (nextBtn) nextBtn.disabled = index === maxIndex();
      renderDots();
    }
    function restart() {
      if (timer) clearInterval(timer);
      if (reduceMotion) return;
      timer = setInterval(function () {
        go(index >= maxIndex() ? 0 : index + 1);
      }, 4000);
    }
    if (prevBtn) prevBtn.addEventListener('click', function () { go(index - 1); restart(); });
    if (nextBtn) nextBtn.addEventListener('click', function () { go(index + 1); restart(); });
    slider.addEventListener('mouseenter', function () { if (timer) clearInterval(timer); });
    slider.addEventListener('mouseleave', restart);
    window.addEventListener('resize', function () { go(index); });
    go(0); restart();
  }

  /* ---------- Фильтры портфолио ---------- */
  var filters = document.getElementById('filters');
  if (filters) {
    var cards = document.querySelectorAll('#objectsGrid .obj-card');
    filters.addEventListener('click', function (e) {
      var btn = e.target.closest('.filter');
      if (!btn) return;
      filters.querySelectorAll('.filter').forEach(function (f) { f.classList.remove('active'); });
      btn.classList.add('active');
      var cat = btn.getAttribute('data-filter');
      cards.forEach(function (card) {
        var show = cat === 'all' || card.getAttribute('data-cat') === cat;
        card.style.display = show ? '' : 'none';
        if (show) {
          card.classList.remove('visible');
          requestAnimationFrame(function () { card.classList.add('visible'); });
        }
      });
    });
  }

  /* ---------- Галерея объекта + автоплей 2.5 c ---------- */
  var galleryMain = document.getElementById('galleryMain');
  if (galleryMain) {
    var gBtns = Array.prototype.slice.call(document.querySelectorAll('.gallery__thumbs button'));
    var gIndex = 0, gTimer = null;
    function gGo(i) {
      gIndex = i % gBtns.length;
      gBtns.forEach(function (b) { b.classList.remove('active'); });
      gBtns[gIndex].classList.add('active');
      galleryMain.src = gBtns[gIndex].getAttribute('data-src');
    }
    gBtns.forEach(function (btn, i) {
      btn.addEventListener('click', function () { gGo(i); gRestart(); });
    });
    function gRestart() {
      if (gTimer) clearInterval(gTimer);
      if (reduceMotion) return;
      gTimer = setInterval(function () { gGo(gIndex + 1); }, 2500);
    }
    var gal = document.getElementById('gallery');
    if (gal) {
      gal.addEventListener('mouseenter', function () { if (gTimer) clearInterval(gTimer); });
      gal.addEventListener('mouseleave', gRestart);
    }
    gRestart();
  }

  /* ---------- Якорная навигация на странице услуг ---------- */
  var anchorLinks = document.querySelectorAll('[data-anchor]');
  if (anchorLinks.length) {
    var sections = Array.prototype.slice.call(anchorLinks).map(function (a) {
      return document.querySelector(a.getAttribute('href'));
    }).filter(Boolean);
    function highlightAnchor() {
      var pos = window.scrollY + 200;
      var current = null;
      sections.forEach(function (sec) { if (sec.offsetTop <= pos) current = sec; });
      anchorLinks.forEach(function (a) {
        a.classList.toggle('active', current && a.getAttribute('href') === '#' + current.id);
      });
    }
    window.addEventListener('scroll', highlightAnchor, { passive: true });
    highlightAnchor();
  }

  /* ---------- Маска телефона ---------- */
  function maskPhone(input) {
    input.addEventListener('input', function () {
      var d = input.value.replace(/\D/g, '');
      if (d.charAt(0) === '8') d = d.slice(1);
      if (d.charAt(0) === '7') d = d.slice(1);
      d = d.slice(0, 10);
      var out = '+7';
      if (d.length > 0) out += ' (' + d.slice(0, 3);
      if (d.length >= 3) out += ')';
      if (d.length > 3) out += ' ' + d.slice(3, 6);
      if (d.length > 6) out += '-' + d.slice(6, 8);
      if (d.length > 8) out += '-' + d.slice(8, 10);
      input.value = out;
    });
  }

  /* ---------- Валидация и отправка формы ---------- */
  var form = document.getElementById('leadForm');
  if (form) {
    var nameInput = form.querySelector('[name="Имя"]');
    var phoneInput = form.querySelector('[name="Телефон"]');
    var consentBox = form.querySelector('.consent input[type="checkbox"]');
    if (phoneInput) maskPhone(phoneInput);

    function setInvalid(input, msg) {
      var field = input.closest('.field') || input.closest('.consent');
      if (!field) return;
      field.classList.add('invalid');
      var err = field.querySelector('.err');
      if (err && msg) err.textContent = msg;
    }
    form.addEventListener('input', function (e) {
      var field = e.target.closest('.field') || e.target.closest('.consent');
      if (field) field.classList.remove('invalid');
    });

    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var ok = true;
      if (nameInput && nameInput.value.trim().length < 2) {
        setInvalid(nameInput, 'Введите имя (минимум 2 буквы)'); ok = false;
      }
      if (phoneInput) {
        var digits = phoneInput.value.replace(/\D/g, '');
        if (digits.length !== 11) {
          setInvalid(phoneInput, 'Введите телефон полностью: +7 (XXX) XXX-XX-XX'); ok = false;
        }
      }
      if (consentBox && !consentBox.checked) {
        setInvalid(consentBox, ''); ok = false;
      }
      if (!ok) return;

      var type = (form.querySelector('[name="Тип объекта"]') || {}).value || '';
      var msg = (form.querySelector('[name="Комментарий"]') || {}).value || '';
      var subject = encodeURIComponent('Заявка с сайта СК Профи: ' + type);
      var body = encodeURIComponent(
        'Имя: ' + nameInput.value.trim() + '\nТелефон: ' + phoneInput.value +
        '\nТип объекта: ' + type + '\nКомментарий: ' + msg
      );
      var okBox = document.getElementById('formOk');
      if (okBox) {
        okBox.classList.add('show');
        okBox.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      }
      window.location.href = 'mailto:info@ckprofi.ru?subject=' + subject + '&body=' + body;
    });
  }
})();
