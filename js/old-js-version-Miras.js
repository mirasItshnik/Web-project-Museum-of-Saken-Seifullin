/*
'use strict';

(() => {
// Shared functions
// Helpers to find elements and create content
function select(selector, root = document) {
  return root.querySelector(selector);
}

function selectAll(selector, root = document) {
  return Array.from(root.querySelectorAll(selector));
}

function twoDigits(number) {
  return String(number).padStart(2, '0');
}

function formatPrice(number) {
  return `${number.toLocaleString('en-US')} ₸`;
}

function todayISO(date) {
  return `${date.getFullYear()}-${twoDigits(date.getMonth() + 1)}-${twoDigits(date.getDate())}`;
}

function createElement(tag, className = '', text = '') {
  const element = document.createElement(tag);
  element.className = className;
  element.textContent = text;
  return element;
}

function setActive(buttons, active) {
  buttons.forEach(btn => {
    const on = btn === active;
    btn.classList.toggle('btn-success', on);
    btn.classList.toggle('btn-outline-success', !on);
    btn.classList.toggle('active', on);
  });
}

function setFieldState(input, ok, message) {
  if (!input) return ok;
  input.classList.toggle('is-invalid', !ok);
  input.classList.toggle('is-valid', ok && input.value.trim() !== '');
  const feedback = input.parentElement?.querySelector('.invalid-feedback');
  if (!ok && feedback && message) feedback.textContent = message;
  return ok;
}

const DAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
const HOURS = { 0: [10, 17], 1: null, 2: [10, 18], 3: [10, 18], 4: [10, 18], 5: [10, 18], 6: [10, 17] };

function museumStatus(now = new Date()) {
  const today = HOURS[now.getDay()];
  const hour = now.getHours();
  if (today && hour >= today[0] && hour < today[1]) {
    return { cls: 'bg-success', text: `🟢 Open now (until ${twoDigits(today[1])}:00)` };
  }
  if (today && hour < today[0]) {
    return { cls: 'bg-warning text-dark', text: `🟡 Closed now (opens at ${twoDigits(today[0])}:00)` };
  }
  for (let i = 1; i <= 7; i++) {
    const day = (now.getDay() + i) % 7;
    if (HOURS[day]) {
      const when = i === 1 ? 'tomorrow' : DAYS[day];
      return { cls: 'bg-danger', text: `🔴 Closed${today ? '' : ' (day off)'}, opens ${when} at ${twoDigits(HOURS[day][0])}:00` };
    }
  }
}

function showToast(message) {
  let toast = select('#custom-toast');
  if (!toast) {
    toast = createElement('div', 'museum-toast');
    toast.id = 'custom-toast';
    toast.setAttribute('role', 'status');
    document.body.append(toast);
  }
  toast.textContent = message;
  toast.classList.add('show');
  clearTimeout(toast.timer);
  toast.timer = setTimeout(() => toast.classList.remove('show'), 2800);
}

function initContacts() {
  const badge = select('#museum-status-badge');
  if (badge) {
    const status = museumStatus();
    badge.className = `badge ${status.cls} px-3 py-2 fs-6 text-wrap`;
    badge.textContent = status.text;
  }
}

// Collection: search, filter and sort
function initCollection() {
  const root = select('#exhibits-main-content');
  if (!root) return;

  const tbody = select('tbody', root);
  const grid = select('#exhibits-cards-grid');
  const searchInput = select('#collection-search');
  const sortSelect = select('#sort-exhibits');
  const chipButtons = selectAll('#collection-chips [data-type]');
  const countDisplay = select('#collection-count');
  const emptyState = select('#collection-empty');
  const clearBtn = select('#collection-clear');

  if (!tbody) return;

  const items = selectAll('tr', tbody).map(row => {
    const title = row.cells[0]?.textContent.trim() || '';
    const id = row.dataset.id;
    const card = select(`#exhibit-card-${id}`);
    return {
      id,
      row,
      card,
      title,
      sortTitle: title.replace(/^[^\p{L}\p{N}]+/u, ''),
      type: row.cells[1]?.textContent.trim().toLowerCase() || '',
      year: parseInt(row.cells[2]?.textContent, 10) || 0,
      text: row.textContent.toLowerCase()
    };
  });

  const state = { query: '', type: 'all', sort: 'default' };

  const sorters = {
    default: () => 0,
    'year-asc': (a, b) => a.year - b.year,
    'year-desc': (a, b) => b.year - a.year,
    'title-asc': (a, b) => a.sortTitle.localeCompare(b.sortTitle)
  };

  function render() {
    const q = state.query.toLowerCase().trim();
    let shown = 0;

    [...items].sort(sorters[state.sort] || sorters.default).forEach(item => {
      const visible = (state.type === 'all' || item.type === state.type) && item.text.includes(q);

      if (tbody && item.row) tbody.append(item.row);
      if (grid && item.card) grid.append(item.card);

      if (item.row) item.row.hidden = !visible;
      if (item.card) item.card.hidden = !visible;

      if (visible) shown++;
    });

    if (countDisplay) {
      countDisplay.textContent = `Showing ${shown} of ${items.length} exhibits`;
    }
    if (emptyState) {
      emptyState.hidden = shown > 0;
    }
  }

  searchInput?.addEventListener('input', e => {
    state.query = e.target.value;
    render();
  });

  sortSelect?.addEventListener('change', e => {
    state.sort = e.target.value;
    render();
  });

  chipButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      setActive(chipButtons, btn);
      state.type = btn.dataset.type || 'all';
      render();
    });
  });

  clearBtn?.addEventListener('click', () => {
    state.query = '';
    state.type = 'all';
    state.sort = 'default';

    if (searchInput) searchInput.value = '';
    if (sortSelect) sortSelect.value = 'default';

    if (chipButtons.length) setActive(chipButtons, chipButtons[0]);
    render();
  });

  // Show details of the selected exhibit
  const modalEl = select('#exhibitModal');
  if (modalEl) {
    selectAll('tbody tr, #exhibits-cards-grid .card', root).forEach(trigger => {
      trigger.tabIndex = 0;
      trigger.setAttribute('role', 'button');
      trigger.dataset.bsToggle = 'modal';
      trigger.dataset.bsTarget = '#exhibitModal';

      trigger.addEventListener('keydown', e => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          trigger.click();
        }
      });
    });

    modalEl.addEventListener('show.bs.modal', e => {
      const trigger = e.relatedTarget?.closest('[data-id]') || e.relatedTarget;
      const id = trigger?.dataset?.id || '1';
      const card = select(`#exhibit-card-${id}`);
      if (!card) return;

      const title = select('.card-title', card)?.textContent.trim() || '';
      const img = select('img', card);
      const badges = selectAll('.badge', card);
      const typeText = badges[0]?.textContent.trim() || 'Artifact';
      const yearText = badges[1]?.textContent.trim() || 'Historical Era';
      const desc = select('.card-text', card)?.textContent.trim() || '';

      const modalTitle = select('#exhibitModalLabel');
      const modalImg = select('#modal-exhibit-img');
      const modalMeta = select('#modal-exhibit-meta');
      const modalDesc = select('#modal-exhibit-desc');
      const modalInv = select('#modal-exhibit-inv');

      if (modalTitle) modalTitle.textContent = title;
      if (modalImg && img) {
        modalImg.src = img.getAttribute('src');
        modalImg.alt = title;
      }
      if (modalInv) modalInv.textContent = `INV-1927/0${id}`;
      if (modalMeta) {
        modalMeta.textContent = `${typeText} · ${yearText}`;
      }
      if (modalDesc) modalDesc.textContent = desc;

      // Start with the Overview tab
      const firstTab = select('#overview-tab');
      if (firstTab && window.bootstrap) {
        bootstrap.Tab.getOrCreateInstance(firstTab).show();
      }
    });

  }

  render();
}

// Gallery: photos and zoom
const FACTS = [
  'Saken Seifullin is regarded as one of the founders of modern Kazakh literature.',
  'Seifullin was a poet, a prose writer and a public figure at the same time.',
  'His autobiographical novel "Thorny Path" is one of his best-known prose works.',
  '"Asau Tulpar" ("The Wild Steed") is one of his famous collections of poetry.',
  'This museum keeps a manuscript of one of his poems dated 1922.',
  'The collection includes a 1936 petition written by his wife, Gulbakhram Seifullina, in support of her husband.',
  'After the repressions of the 1930s, Seifullin was rehabilitated posthumously in the 1950s.'
];

function initGallery() {
  const galleryRoot = select('#gallery-main-content');
  if (!galleryRoot) return;

  const factBtn = select('#btn-fact-of-day');
  const factBox = select('#fact-container');
  let factIndex = -1;

  if (factBtn && factBox) {
    factBtn.addEventListener('click', () => {
      const nextIndex = Math.floor(Math.random() * FACTS.length);
      factIndex = nextIndex === factIndex ? (nextIndex + 1) % FACTS.length : nextIndex;
      factBox.classList.remove('d-none');
      factBox.hidden = false;
      factBox.textContent = '';

      const strong = document.createElement('strong');
      strong.textContent = '💡 Fact of the Day: ';
      factBox.append(strong, document.createTextNode(FACTS[factIndex]));

      factBtn.textContent = '💡 Another fact';
    });
  }

  const carousel = select('#museumCarousel');
  if (carousel) {
    carousel.addEventListener('slid.bs.carousel', e => {
      const counter = select('#photo-counter');
      if (counter) counter.textContent = `Photo ${e.to + 1} of 3`;
    });
  }

  const modalEl = select('#lightboxModal');
  if (!modalEl) return;

  const cards = selectAll('.gallery-card-col');
  const photos = cards.map(card => ({
    src: select('img', card)?.getAttribute('src') || '',
    title: select('.card-title', card)?.textContent.trim() || '',
    desc: select('.card-text', card)?.textContent.trim() || '',
    tag: select('.badge', card)?.textContent.trim() || 'Interior'
  }));

  const wrap = select('#lightbox-img-wrapper');
  const img = select('#lightbox-img');
  let index = 0;
  let zoom = 1;

  function renderZoom() {
    if (!wrap) return;
    wrap.style.transform = `scale(${zoom})`;
    wrap.classList.toggle('zoomed', zoom > 1);
    const zoomResetBtn = select('#btn-gallery-zoom-reset');
    if (zoomResetBtn) zoomResetBtn.textContent = `${Math.round(zoom * 100)}%`;
  }

  function setZoom(value) {
    zoom = Math.min(3, Math.max(1, value));
    renderZoom();
  }

  function show(i) {
    index = (i + photos.length) % photos.length;
    const photo = photos[index] || photos[0];
    if (img) {
      img.src = photo.src;
      img.alt = photo.title;
    }

    const cardTitle = select('#lightbox-card-title');
    const descEl = select('#lightbox-desc');
    const tagEl = select('#lightbox-tag');

    if (cardTitle) cardTitle.textContent = photo.title;
    if (descEl) descEl.textContent = photo.desc;
    if (tagEl) tagEl.textContent = photo.tag;
    setZoom(1);

  }

  const openModal = i => {
    show(i);
    if (window.bootstrap && bootstrap.Modal) {
      bootstrap.Modal.getOrCreateInstance(modalEl).show();
    }
  };

  selectAll('#museumCarousel .carousel-item').forEach((slide, idx) => {
    slide.tabIndex = 0;
    slide.setAttribute('role', 'button');
    slide.setAttribute('aria-label', 'Open museum photo');
    slide.addEventListener('keydown', event => {
      if (event.key === 'Enter' || event.key === ' ') { event.preventDefault(); openModal(idx); }
    });
    slide.addEventListener('click', () => openModal(idx));
  });

  cards.forEach((card, idx) => {
    card.tabIndex = 0;
    card.setAttribute('role', 'button');
    card.addEventListener('keydown', event => {
      if (event.key === 'Enter' || event.key === ' ') { event.preventDefault(); openModal(idx); }
    });
    card.addEventListener('click', () => openModal(idx));
  });

  select('#btn-lightbox-prev')?.addEventListener('click', () => show(index - 1));
  select('#btn-lightbox-next')?.addEventListener('click', () => show(index + 1));
  select('#btn-gallery-zoom-in')?.addEventListener('click', () => setZoom(zoom + 0.5));
  select('#btn-gallery-zoom-out')?.addEventListener('click', () => setZoom(zoom - 0.5));
  select('#btn-gallery-zoom-reset')?.addEventListener('click', () => setZoom(1));
  modalEl.addEventListener('hidden.bs.modal', () => setZoom(1));
}

// Booking form and ticket prices
function initBooking() {
  const form = select('#excursion-form');
  if (!form) return;

  const demoNotice = createElement('p', 'small text-muted', 'Front-end demonstration: no data is sent to a server and no real booking or payment is created.');
  demoNotice.setAttribute('role', 'status');
  form.append(demoNotice);

  const PRICES = { adult: 1000, student: 500, senior: 300, group: 600 };
  const NAME_RE = /^\p{L}[\p{L}'’.-]*(\s+\p{L}[\p{L}'’.-]*)+$/u;
  const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
  const isGroup = () => select('#type-group')?.checked || false;
  function readQuantity(selector) {
    const value = Number(select(selector).value);
    return Number.isInteger(value) && value >= 0 ? value : 0;
  }
  const dateInput = select('#visit-date');
  const timeSelect = select('#visit-time');
  if (dateInput) dateInput.min = todayISO(new Date());

  function syncVisitType() {
    select('#calculator-individual')?.classList.toggle('d-none', isGroup());
    select('#calculator-group')?.classList.toggle('d-none', !isGroup());
    select('#group-org-block')?.classList.toggle('d-none', !isGroup());
    selectAll('.is-valid, .is-invalid', form).forEach(field => field.classList.remove('is-valid', 'is-invalid'));
  }

  function fillSlots() {
    if (!dateInput || !timeSelect) return;
    const value = dateInput.value;
    const hours = value ? HOURS[new Date(`${value}T00:00`).getDay()] : undefined;
    const now = new Date();
    const slots = [];
    if (hours) {
      for (let h = hours[0]; h < hours[1]; h++) {
        if (value === todayISO(now) && h <= now.getHours()) continue;
        slots.push(new Option(`${twoDigits(h)}:00 – ${twoDigits(h + 1)}:00`, `${twoDigits(h)}:00`));
      }
    }
    let placeholder = 'Select a time slot...';
    if (!value) placeholder = 'Select date first...';
    else if (!hours) placeholder = 'Museum is closed this day';
    else if (slots.length === 0) placeholder = 'No slots left today';
    timeSelect.replaceChildren(new Option(placeholder, '', true, true), ...slots);
    timeSelect.options[0].disabled = true;
    timeSelect.classList.remove('is-valid', 'is-invalid');
  }

  function getOrder() {
    const lines = [];
    let people = 0;
    let saved = 0;
    if (isGroup()) {
      people = readQuantity('#qty-group-people');
      lines.push([`Group tariff × ${people}`, people * PRICES.group]);
      saved = people * (PRICES.adult - PRICES.group);
    } else {
      [['adult', 'Adult'], ['student', 'Student'], ['senior', 'Child / Senior']].forEach(([key, label]) => {
        const quantity = readQuantity(`#qty-${key}`);
        people += quantity;
        if (quantity > 0) lines.push([`${label} × ${quantity}`, quantity * PRICES[key]]);
      });
    }
    selectAll('.extra-service:checked').forEach(box => {
      lines.push([box.nextElementSibling.textContent.replace(/\s*\(.*\)/, ''), Number(box.value)]);
    });
    return { lines, people, saved, total: lines.reduce((sum, line) => sum + line[1], 0) };
  }

  function renderReceipt(box, order) {
    if (!box) return;
    const rows = order.lines.map(([label, sum]) => {
      const row = createElement('div', 'receipt-row');
      row.append(createElement('span', '', label), createElement('span', '', formatPrice(sum)));
      return row;
    });
    box.replaceChildren(...rows);
    if (!order.people) box.append(createElement('div', 'text-danger', 'Add at least one ticket to continue.'));
    if (order.saved) box.append(createElement('div', 'receipt-saved', `You save ${formatPrice(order.saved)} compared with adult tickets.`));
  }

  function renderOrder() {
    const order = getOrder();
    renderReceipt(select('#price-breakdown-list'), order);
    const totalDisplay = select('#total-price-display');
    if (totalDisplay) totalDisplay.textContent = formatPrice(order.total);
    return order;
  }

  function validQuantity(value) {
    if (value.trim() === '' || !Number.isInteger(Number(value)) || Number(value) < 0) {
      return 'Enter a whole number of tickets, zero or more.';
    }
    return true;
  }

  const rules = {
    'visitor-name': v => NAME_RE.test(v.trim()) || 'Please enter your first and last name.',
    'visitor-email': v => EMAIL_RE.test(v.trim()) || 'Please provide a valid email, e.g. name@example.com.',
    'org-name': v => !isGroup() || v.trim().length >= 2 || 'Please enter the name of your organization.',
    'qty-group-people': v => !isGroup() || (Number.isInteger(Number(v)) && Number(v) >= 10) || 'Enter a whole number of at least 10 visitors.',
    'qty-adult': v => validQuantity(v),
    'qty-student': v => validQuantity(v),
    'qty-senior': v => validQuantity(v),
    'visit-time': v => {
      const day = new Date(`${dateInput.value}T00:00`);
      const hours = HOURS[day.getDay()];
      const hour = Number(v.split(':')[0]);
      if (!v || !hours || hour < hours[0] || hour >= hours[1]) return 'Please select an available time slot.';
      if (day < new Date() && new Date(`${dateInput.value}T${v}`) <= new Date()) return 'This time has already passed.';
      return true;
    },
    'visit-date': v => {
      if (!v) return 'Please choose a date.';
      if (v < dateInput.min) return 'The date cannot be in the past.';
      return HOURS[new Date(`${v}T00:00`).getDay()] ? true : 'The museum is closed on Mondays. Please choose Tue–Sun.';
    }
  };

  function validateField(input) {
    if (!input || !rules[input.id]) return true;
    const result = rules[input.id](input.value);
    let feedback = input.parentElement.querySelector('.invalid-feedback');
    if (!feedback) {
      feedback = createElement('div', 'invalid-feedback');
      input.after(feedback);
    }
    return setFieldState(input, result === true, result);
  }

  form.addEventListener('input', e => {
    const target = e.target;
    if (target.name === 'visitType') syncVisitType();
    if (target === dateInput) { fillSlots(); validateField(dateInput); }
    else if (rules[target.id] && (target.classList.contains('is-valid') || target.classList.contains('is-invalid'))) validateField(target);
    renderOrder();
  });

  form.addEventListener('change', e => {
    if (e.target === timeSelect || e.target === dateInput) validateField(e.target);
  });

  form.addEventListener('reset', () => setTimeout(() => {
    selectAll('.is-valid, .is-invalid', form).forEach(node => node.classList.remove('is-valid', 'is-invalid'));
    syncVisitType();
    fillSlots();
    renderOrder();
  }, 0));

  form.addEventListener('submit', e => {
    e.preventDefault();
    const ids = ['visitor-name', 'visitor-email', 'visit-date', 'visit-time'];
    if (isGroup()) ids.push('org-name', 'qty-group-people');
    else ids.push('qty-adult', 'qty-student', 'qty-senior');
    const invalid = ids.map(id => select(`#${id}`)).filter(input => !validateField(input));
    const order = renderOrder();

    if (invalid.length) {
      invalid[0].focus();
      showToast('Please fix the highlighted fields.');
      return;
    }
    if (!order.people) {
      select('#qty-adult')?.focus();
      showToast('Please add at least one ticket.');
      return;
    }

    const modalEl = select('#bookingPreviewModal');
    if (modalEl && window.bootstrap) {
      const prettyDate = new Date(`${dateInput.value}T00:00`).toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
      select('#prev-name').textContent = select('#visitor-name')?.value.trim() || '';
      select('#prev-email').textContent = select('#visitor-email')?.value.trim() || '';
      select('#prev-datetime').textContent = `${prettyDate}, ${timeSelect.selectedOptions[0]?.text || ''}`;
      select('#prev-type').textContent = isGroup() ? `Large group, ${select('#org-name')?.value.trim() || ''}` : 'Individual / small group';
      renderReceipt(select('#prev-breakdown'), order);
      select('#prev-total').textContent = formatPrice(order.total);
      bootstrap.Modal.getOrCreateInstance(modalEl).show();
    }
  });

  select('#btn-confirm-demo-submit')?.addEventListener('click', () => {
    const modalEl = select('#bookingPreviewModal');
    if (modalEl && window.bootstrap) {
      bootstrap.Modal.getInstance(modalEl)?.hide();
    }
    const reference = Math.floor(100000 + Math.random() * 900000);
    demoNotice.textContent = `Demo request #${reference}. No data was sent and no real booking was created.`;
    form.reset();
    showToast(`Demo request #${reference}. No data was sent and no real booking was created.`);
  });

  syncVisitType();
  fillSlots();
  renderOrder();
}

// Visitor reviews
// Check the rating and text, then add a review card
function initReviews() {
  const form = select('#feedback-form');
  if (!form) return;
  const stars = selectAll('#rating-container span');
  const textInput = select('#feedback-text');
  const counter = select('#char-counter');
  const response = select('#feedback-response-area');
  const reviews = [];
  let rating = 0;
  const list = createElement('div', 'mt-3');
  const emptyMessage = createElement('p', 'small text-muted', 'No demo reviews yet. Write the first review.');
  response.after(emptyMessage, list);
  response.setAttribute('role', 'status');

  function showRating(value) {
    stars.forEach((star, index) => {
      star.classList.toggle('on', index < value);
      star.classList.toggle('off', index >= value);
      star.setAttribute('aria-pressed', String(index < value));
    });
    select('#rating-label').textContent = value === 0 ? 'Choose a rating' : `${value}/5`;
  }

  function chooseRating(value) {
    rating = value;
    select('#rating-error').textContent = '';
    showRating(rating);
  }

  function renderReview(review) {
    const card = createElement('article', 'card p-3 mb-2');
    card.append(
      createElement('strong', '', `${review.rating}/5 — Museum review`),
      createElement('small', 'text-muted', review.date),
      createElement('p', 'mb-0', review.text)
    );
    return card;
  }

  stars.forEach((star, index) => {
    star.tabIndex = 0;
    star.setAttribute('role', 'button');
    star.setAttribute('aria-label', `Rate ${index + 1} out of 5`);
    star.addEventListener('click', () => chooseRating(index + 1));
    star.addEventListener('keydown', event => {
      if (event.key === 'Enter' || event.key === ' ') {
        event.preventDefault();
        chooseRating(index + 1);
      }
    });
  });
  textInput.addEventListener('input', () => {
    counter.textContent = `${textInput.value.length} / ${textInput.maxLength}`;
    if (textInput.classList.contains('is-invalid')) {
      setFieldState(textInput, textInput.value.trim().length >= 10, 'Write 10–500 characters.');
    }
    response.classList.add('d-none');
  });
  form.addEventListener('submit', event => {
    event.preventDefault();
    const text = textInput.value.trim();
    const validText = text.length >= 10 && text.length <= textInput.maxLength;
    setFieldState(textInput, validText, 'Write 10–500 characters.');
    if (rating === 0) {
      select('#rating-error').textContent = 'Choose a rating from 1 to 5.';
      stars[0].focus();
      return;
    }
    if (!validText) { textInput.focus(); return; }
    const review = { rating, text, date: new Date().toLocaleString('en-GB') };
    reviews.push(review);
    list.prepend(renderReview(review));
    emptyMessage.classList.add('d-none');
    response.classList.remove('d-none');
    response.textContent = `Demo review added (${reviews.length}). It stays only on this page; no data was sent.`;
    form.reset();
    textInput.classList.remove('is-valid', 'is-invalid');
    rating = 0;
    showRating(rating);
    counter.textContent = `0 / ${textInput.maxLength}`;
  });
  showRating(rating);
}

// Run after the HTML is ready. Skip sections that are not on this page.
function start() {
  selectAll('.container > .row.g-5').forEach(row => row.classList.add('mx-0'));
  initContacts();
  initCollection();
  initGallery();
  initBooking();
  initReviews();
}
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', start);
} else {
  start();
}
})();
*/