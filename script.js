'use strict';
const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];

/* Функция 1: переключение светлой и тёмной темы (запоминается в localStorage) */
function initTheme() {
  const btn = $('#theme'), root = document.documentElement;
  const apply = (t) => {
    root.dataset.theme = t;
    btn.setAttribute('aria-pressed', t === 'dark');
  };
  let saved = null;
  try { saved = localStorage.getItem('theme'); } catch (e) {}
  apply(saved || (matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'));
  btn.addEventListener('click', () => {
    const next = root.dataset.theme === 'dark' ? 'light' : 'dark';
    apply(next);
    try { localStorage.setItem('theme', next); } catch (e) {}
  });
}

/* Функция 2: мобильное меню (закрывается по ссылке и по Escape) */
function initMenu() {
  const burger = $('#burger'), menu = $('#menu');
  const set = (open) => {
    menu.classList.toggle('open', open);
    burger.setAttribute('aria-expanded', open);
    burger.setAttribute('aria-label', open ? 'Закрыть меню' : 'Открыть меню');
  };
  burger.addEventListener('click', () => set(!menu.classList.contains('open')));
  $$('a', menu).forEach(a => a.addEventListener('click', () => set(false)));
  document.addEventListener('keydown', e => { if (e.key === 'Escape') set(false); });
}

/* Функция 3: модальное окно с подробностями проекта (фокус возвращается на кнопку) */
function initModal() {
  const modal = $('#modal'); let last = null;
  const close = () => { modal.hidden = true; if (last) last.focus(); };
  $$('.more').forEach(btn => btn.addEventListener('click', () => {
    const d = btn.closest('.card').dataset;
    $('#m-title').textContent = d.title;
    $('#m-desc').textContent = d.desc;
    $('#m-tech').textContent = 'Технологии: ' + d.tech;
    last = btn; modal.hidden = false; $('#m-close').focus();
  }));
  $('#m-close').addEventListener('click', close);
  modal.addEventListener('click', e => { if (e.target === modal) close(); });
  document.addEventListener('keydown', e => { if (e.key === 'Escape' && !modal.hidden) close(); });
}

/* Функция 4: проверка формы с сообщениями об ошибках */
function initForm() {
  const form = $('#form'), ok = $('#ok');
  const rules = {
    name: v => v.trim().length >= 2 ? '' : 'Введите имя: минимум 2 символа.',
    email: v => /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v) ? '' : 'Введите почту в формате name@mail.com.',
    msg: v => v.trim().length >= 10 ? '' : 'Напишите сообщение: минимум 10 символов.'
  };
  const check = (id) => {
    const input = $('#' + id), msg = rules[id](input.value);
    $('#' + id + '-err').textContent = msg;
    input.closest('.field').classList.toggle('bad', !!msg);
    input.setAttribute('aria-invalid', !!msg);
    return !msg;
  };
  Object.keys(rules).forEach(id => $('#' + id).addEventListener('blur', () => check(id)));
  form.addEventListener('submit', e => {
    e.preventDefault(); ok.textContent = '';
    const results = Object.keys(rules).map(check);
    const firstBad = Object.keys(rules).find((id, i) => !results[i]);
    if (firstBad) { $('#' + firstBad).focus(); return; }
    ok.textContent = 'Сообщение отправлено, спасибо, ' + $('#name').value.trim() + '!';
    form.reset();
  });
}

/* Анимации: буквы имени, появление блоков, подсветка меню, свечение за курсором */
function initEffects() {
  $$('.hero-name span').forEach((word, w) => {
    const text = word.textContent; word.textContent = ''; word.setAttribute('aria-label', text);
    [...text].forEach((c, i) => {
      const s = document.createElement('span');
      s.className = 'ch'; s.textContent = c; s.setAttribute('aria-hidden', 'true');
      s.style.animationDelay = (w * 0.35 + i * 0.05) + 's';
      word.appendChild(s);
    });
  });
  const io = new IntersectionObserver(es => es.forEach(e => {
    if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); }
  }), { threshold: .15 });
  $$('.reveal').forEach(el => io.observe(el));

  const links = $$('.nav a'), nav = new IntersectionObserver(es => es.forEach(e => {
    if (e.isIntersecting) links.forEach(a => a.classList.toggle('is-current', a.hash === '#' + e.target.id));
  }), { rootMargin: '-45% 0px -50% 0px' });
  $$('main section[id]').forEach(s => nav.observe(s));

  const glow = $('.glow');
  addEventListener('pointermove', e => { glow.style.left = e.clientX + 'px'; glow.style.top = e.clientY + 'px'; });
}

document.addEventListener('DOMContentLoaded', () => {
  initTheme(); initMenu(); initModal(); initForm(); initEffects();
});
