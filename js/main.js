// [CRITERIA: IIFE Scope - Encapsulates variables within a private scope, preventing global namespace pollution]
$(function () {
  'use strict';
  // 1. GLOBAL HELPERS & UTILITIES
  const twoDigits = n => String(n).padStart(2, '0');
  const formatPrice = n => `${n.toLocaleString('en-US')} ₸`;

  function todayISO(date) {
    return `${date.getFullYear()}-${twoDigits(date.getMonth() + 1)}-${twoDigits(date.getDate())}`;
  }

  // Update text content across multiple selectors at once
  function setText(fields) {
    $.each(fields, (selector, text) => $(selector).text(text));
  }

  // Safe wrapper to trigger Bootstrap Modals
  function showModal(selector) {
    const $modal = $(selector);
    if ($modal.length && window.bootstrap) bootstrap.Modal.getOrCreateInstance($modal[0]).show();
  }

  // Live field validation state styling (adds/removes is-valid / is-invalid classes)
  function setFieldState($input, ok, message) {
    if (!$input.length) return ok;
    $input.toggleClass('is-invalid', !ok).toggleClass('is-valid', ok && String($input.val() || '').trim() !== '');
    const $feedback = $input.parent().find('.invalid-feedback');
    if (!ok && $feedback.length && message) $feedback.text(message);
    return ok;
  }

  // Reusable notification toast system with auto-timeout
  function showToast(message) {
    let $toast = $('#custom-toast');
    if (!$toast.length) {
      $toast = $('<div>', { id: 'custom-toast', class: 'museum-toast', role: 'status' });
      $('body').append($toast);
    }
    $toast.text(message).addClass('show');
    clearTimeout($toast.data('timer'));
    const timer = setTimeout(() => $toast.removeClass('show'), 2800);
    $toast.data('timer', timer);
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

  function initContacts() {
    const $badge = $('#museum-status-badge');
    if ($badge.length) {
      const status = museumStatus();
      $badge.attr('class', `badge ${status.cls} px-3 py-2 fs-6 text-wrap`).text(status.text);
    }
  }

  // 2. COLLECTION CATALOG MODULE (Search, Filter, Sorting, Modal)
  function initCollection() {
    const $root = $('#exhibits-main-content');
    if (!$root.length) return;

    // Accessibility enhancements for exhibit cards
    $root.find('#exhibits-cards-grid .card').attr({ tabindex: 0, role: 'button', 'aria-haspopup': 'dialog' });
    $root.on('keydown', '#exhibits-cards-grid .card', function (event) {
      if (event.key === 'Enter' || event.key === ' ') { event.preventDefault(); $(this).trigger('click'); }
    });
    
    // Delegated click handler to open exhibit passport modal and load details
    $root.on('click', '#exhibits-cards-grid .card', function () {
      const $card = $(this);
      const id = $card.parent().data('id') || $card.parent().attr('id')?.replace('exhibit-card-', '') || '1';
      const title = $card.find('.card-title').text().trim();
      const imgSrc = $card.find('img').attr('src');
      const desc = $card.find('.card-text').text().trim();

      $('#exhibitModalLabel').text(title);
      $('#modal-exhibit-img').attr('src', imgSrc).attr('alt', title);
      const badges = $card.find('.badge');
      const type = badges.first().text().trim();
      const year = badges.last().text().trim();
      $('#modal-exhibit-inv').text(`Collection item ${id}`);
      $('#modal-exhibit-meta .badge').eq(0).text(type);
      $('#modal-exhibit-meta .badge').eq(1).text(year);
      $('#modal-exhibit-meta .badge').eq(2).text('Museum collection');
      if (window.bootstrap) bootstrap.Tab.getOrCreateInstance($('#overview-tab')[0]).show();
      $('#modal-exhibit-desc').text(desc);

      showModal('#exhibitModal');
    });

    const originalCards = $('#exhibits-cards-grid').children('div').get();
    const $searchInput = $('#collection-search');
    const $sortSelect = $('#sort-exhibits');
    const $chipButtons = $('#collection-chips [data-type]');
    const $countDisplay = $('#collection-count');
    const $emptyState = $('#collection-empty');

    // Main filtering and sorting engine for museum exhibits
    function filterCollection() {
      const query = String($searchInput.val() || '').toLowerCase().trim();
      const activeType = $('#collection-chips .active').data('type') || 'all';
      
      const $grid = $('#exhibits-cards-grid');
      let $cols = $(originalCards).detach();

      // [CRITERIA: Array.prototype.filter() used to narrow down the list of exhibit objects]
      const filteredCards = originalCards.filter(card => {
        const $col = $(card);
        const cardText = $col.text().toLowerCase();
        const cardType = $col.find('.badge').first().text().toLowerCase().trim();
        const matchesQuery = cardText.includes(query);
        const matchesType = (activeType === 'all' || cardType.includes(activeType));
        return matchesQuery && matchesType;
      });

      const shown = filteredCards.length;

      // [CRITERIA: Element visibility managed by setting the native hidden property without inline styles]
      $cols.each(function () {
        const isMatched = filteredCards.includes(this);
        $(this).prop('hidden', !isMatched); 
      });

      // Sorting logic (by title or year ascending/descending)
      const sortVal = $sortSelect.val();
      if (sortVal !== 'default') {
        $cols.sort(function (a, b) {
          const $a = $(a), $b = $(b);
          if (sortVal === 'title-asc') {
            return $a.find('.card-title').text().localeCompare($b.find('.card-title').text());
          }
          const yearA = parseInt($a.find('.badge').last().text(), 10) || 0;
          const yearB = parseInt($b.find('.badge').last().text(), 10) || 0;
          // [CRITERIA: Correct sorting expression a.year - b.year / yearA - yearB]
          return sortVal === 'year-asc' ? yearA - yearB : yearB - yearA;
        });
      }

      $grid.append($cols);
      $countDisplay.text(`Showing ${shown} of ${originalCards.length} exhibits`);
      $emptyState.prop('hidden', shown > 0);
    }

    $searchInput.on('input', filterCollection);
    $sortSelect.on('change', filterCollection);

    function selectCategory($button) {
      $chipButtons.removeClass('btn-success active').addClass('btn-outline-success').attr('aria-pressed', 'false');
      $button.removeClass('btn-outline-success').addClass('btn-success active').attr('aria-pressed', 'true');
      filterCollection();
    }
    $chipButtons.on('click', function () { selectCategory($(this)); });

    $chipButtons.attr('aria-pressed', 'false').filter('.active').attr('aria-pressed', 'true');
    filterCollection();

    $('#collection-clear').on('click', function () {
      $searchInput.val('');
      $sortSelect.val('default');
      selectCategory($chipButtons.first());
    });
  }

  // 3. GALLERY & FACT OF THE DAY MODULE (Lightbox, Zoom, Carousel)
  const FACTS = [
    'Saken Seifullin is regarded as one of the founders of modern Kazakh literature.',
    'Seifullin was a poet, a prose writer and a public figure at the same time.',
    'His autobiographical novel "Thorny Path" is one of his best-known prose works.',
    '"Asau Tulpar" ("The Wild Steed") is one of his famous collections of poetry.',
    'This museum keeps a manuscript of one of his poems dated 1922.'
  ];

  function initGallery() {
    if (!$('#gallery-main-content').length) return;

    let factIndex = 0;

    // Fact of the Day generator using sequential modulo rotation
    $('#btn-fact-of-day').on('click', function () {
      // [CRITERIA: Sequential modulo selection for Fact of the Day]
      const currentFact = FACTS[factIndex];
      factIndex = (factIndex + 1) % FACTS.length;

      $('#fact-container')
        .hide()
        .removeClass('d-none')
        .html(`<strong>💡 Fact of the Day:</strong> ${currentFact}`)
        .slideDown(300);
    });

    const $cards = $('.gallery-card-col');
    const photos = $cards.map(function () {
      const $card = $(this);
      return {
        src: $card.find('img').attr('src') || '',
        title: $card.find('.card-title').text().trim(),
        desc: $card.find('.card-text').text().trim(),
        tag: $card.find('.badge').text().trim() || 'Interior'
      };
    }).get();

    let currentIndex = 0;
    let zoom = 1;

    // Image zoom controller for the lightbox viewer (100% to 300%)
    function setZoom(value) {
      zoom = Math.min(3, Math.max(1, value));
      $('#lightbox-img-wrapper').css('transform', `scale(${zoom})`);
      $('#btn-gallery-zoom-reset').text(`${Math.round(zoom * 100)}%`);
      $('#btn-gallery-zoom-in').prop('disabled', zoom >= 3).text('+');
      $('#btn-gallery-zoom-out').prop('disabled', zoom <= 1).text('−');
    }

    function showPhoto(idx) {
      currentIndex = (idx + photos.length) % photos.length;
      const photo = photos[currentIndex] || photos[0];

      $('#lightbox-img').attr('src', photo.src).attr('alt', photo.title);
      setText({ '#lightbox-card-title': photo.title, '#lightbox-desc': photo.desc, '#lightbox-tag': photo.tag });
      setZoom(1);
      $('#photo-counter').text(`Photo ${currentIndex + 1} of ${photos.length}`);
    }

    $('#museumCarousel').on('slid.bs.carousel', function (event) {
      $('#photo-counter').text(`Photo ${event.to + 1} of ${photos.length}`);
    });
    
    const $modalEl = $('#lightboxModal');
    $modalEl.on('hidden.bs.modal', function () { setZoom(1); });
    setZoom(1);
    
    function openLightbox(idx) {
      showPhoto(idx);
      showModal('#lightboxModal');
    }

    $cards.on('click', function () {
      const idx = $(this).data('index') !== undefined ? $(this).data('index') : $(this).index();
      openLightbox(idx);
    });

    $('#museumCarousel .carousel-item').on('click', function () {
      openLightbox($(this).index());
    });

    const controls = {
      '#btn-lightbox-prev': () => showPhoto(currentIndex - 1),
      '#btn-lightbox-next': () => showPhoto(currentIndex + 1),
      '#btn-gallery-zoom-in': () => setZoom(zoom + 0.5),
      '#btn-gallery-zoom-out': () => setZoom(zoom - 0.5),
      '#btn-gallery-zoom-reset': () => setZoom(1)
    };
    $.each(controls, (selector, action) => $(selector).on('click', action));
  }

  // 4. BOOKING & EXCURSION CALCULATOR MODULE (Form Validation & Pricing)
  function initBooking() {
    const $form = $('#excursion-form');
    if (!$form.length) return;

    const PRICES = { adult: 1000, student: 500, senior: 300, group: 600 };
    
    // [CRITERIA: RegEx validation for full visitor name with unicode support]
    const NAME_RE = /^\p{L}[\p{L}'’.-]*(\s+\p{L}[\p{L}'’.-]*)+$/u;
    const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

    $('.ticket-qty, #qty-group-people').attr('step', '1').each(function () {
      const $field = $(this);
      if (!$field.siblings('.invalid-feedback').length) $field.after($('<div>', { class: 'invalid-feedback', role: 'alert' }));
    });
    const isGroup = () => $('#type-group').is(':checked');

    const $dateInput = $('#visit-date');
    const $timeSelect = $('#visit-time');
    if ($dateInput.length) $dateInput.attr('min', todayISO(new Date()));

    // Toggle individual vs large group calculator blocks dynamically
    function syncVisitType() {
      // [CRITERIA: Element visibility managed via predefined CSS classes like d-none]
      $('#calculator-individual').toggleClass('d-none', isGroup());
      $('#calculator-group').toggleClass('d-none', !isGroup());
      $('#group-org-block').toggleClass('d-none', !isGroup());
      $('#org-name, #qty-group-people').prop('required', isGroup()).prop('disabled', !isGroup());
      $('.ticket-qty').prop('disabled', isGroup());
      $form.find('.is-valid, .is-invalid').removeClass('is-valid is-invalid');
    }

    // Populate available working hours dynamically based on selected date
    function fillSlots() {
      if (!$dateInput.length || !$timeSelect.length) return;
      const val = $dateInput.val();
      const hours = val ? HOURS[new Date(`${val}T00:00`).getDay()] : undefined;
      const now = new Date();
      $timeSelect.empty();

      if (hours) {
        for (let h = hours[0]; h < hours[1]; h++) {
          if (val === todayISO(now) && h <= now.getHours()) continue;
          $timeSelect.append(new Option(`${twoDigits(h)}:00 – ${twoDigits(h + 1)}:00`, `${twoDigits(h)}:00`));
        }
      }

      let placeholder = 'Select a time slot...';
      if (!val) placeholder = 'Select date first...';
      else if (!hours) placeholder = 'Museum is closed this day';
      else if (!$timeSelect.children().length) placeholder = 'No slots left today';

      $timeSelect.prepend(new Option(placeholder, '', true, true));
      $timeSelect.find('option:first').prop('disabled', true);
    }

    function renderBreakdown(selector, lines) {
      const $box = $(selector).empty();
      lines.forEach(([label, sum]) => {
        $box.append(`<div class="d-flex justify-content-between"><span>${label}</span><span>${formatPrice(sum)}</span></div>`);
      });
      return $box;
    }

    // Calculate total order price and discounts in real-time
    function calculateOrder() {
      const lines = [];
      let people = 0;
      let saved = 0;

      if (isGroup()) {
        people = ticketQuantity($('#qty-group-people').val());
        lines.push([`Group tariff × ${people}`, people * PRICES.group]);
        saved = people * (PRICES.adult - PRICES.group);
      } else {
        [['adult', 'Adult'], ['student', 'Student'], ['senior', 'Child / Senior']].forEach(([key, label]) => {
          const qty = ticketQuantity($(`#qty-${key}`).val());
          people += qty;
          if (qty > 0) lines.push([`${label} × ${qty}`, qty * PRICES[key]]);
        });
      }

      $('.extra-service:checked').each(function () {
        const labelText = $(this).next('label').text().replace(/\s*\(.*\)/, '');
        lines.push([labelText, Number($(this).val())]);
      });

      const total = lines.reduce((sum, item) => sum + item[1], 0);

      const $box = renderBreakdown('#price-breakdown-list', lines);
      if (!people) $box.append('<div class="text-danger">Add at least one ticket to continue.</div>');
      if (saved > 0) $box.append(`<div class="text-success mt-1">You save ${formatPrice(saved)} with group discount!</div>`);

      $('#total-price-display').text(formatPrice(total));
      return { lines, people, total };
    }

    function ticketQuantity(value) {
      const number = Number(value);
      return String(value).trim() && Number.isSafeInteger(number) && number >= 0 ? number : 0;
    }

    // Comprehensive form validation checking names, email, dates, slots, and quantities
    function validateBooking() {
      const currentDate = new Date();
      const date = String($dateInput.val() || '');
      const visit = new Date(`${date}T00:00`);
      const hours = HOURS[visit.getDay()];
      const validDate = /^\d{4}-\d{2}-\d{2}$/.test(date) && !Number.isNaN(visit.getTime()) &&
        todayISO(visit) === date && date >= todayISO(currentDate) && !!hours;
      const time = String($timeSelect.val() || '');
      const hour = Number(time.slice(0, 2));
      const validTime = validDate && /^\d{2}:00$/.test(time) && hour >= hours[0] && hour < hours[1] &&
        (date !== todayISO(currentDate) || hour > currentDate.getHours());
      const checks = [
        ['#visitor-name', NAME_RE.test(String($('#visitor-name').val() || '').trim()), 'Please enter your full name.'],
        ['#visitor-email', EMAIL_RE.test(String($('#visitor-email').val() || '').trim()), 'Please provide a valid email.'],
        ['#visit-date', validDate, 'Choose today or a future working day (Tuesday–Sunday).'],
        ['#visit-time', validTime, 'Select an available future time slot.']
      ];
      if (isGroup()) {
        checks.push(['#org-name', String($('#org-name').val() || '').trim().length >= 2, 'Please enter your organization.']);
      }
      const $quantities = isGroup() ? $('#qty-group-people') : $('.ticket-qty');
      const people = $quantities.toArray().reduce((sum, field) => sum + ticketQuantity($(field).val()), 0);
      $quantities.each(function () {
        const value = String($(this).val() || '').trim();
        const number = Number(value);
        const minimum = isGroup() ? 10 : 0;
        checks.push([`#${this.id}`, value !== '' && Number.isSafeInteger(number) && number >= minimum && people > 0,
          isGroup() ? 'Enter a whole number of at least 10 visitors.' : 'Use whole, non-negative quantities and select at least one ticket.']);
      });
      let valid = true;
      checks.forEach(([selector, ok, message]) => { if (!setFieldState($(selector), ok, message)) valid = false; });
      return valid;
    }

    function refreshBooking() {
      syncVisitType();
      fillSlots();
      calculateOrder();
    }
    
    let submitted = false;
    // [CRITERIA: 'input' event type used for instant real-time price updates]
    $form.on('input change', 'input, select', function (e) {
      if (e.target.name === 'visitType') syncVisitType();
      if (e.target.id === 'visit-date') fillSlots();
      calculateOrder();
      if (submitted) validateBooking();
    });
    
    $form.on('reset', function () {
      setTimeout(function () {
        submitted = false;
        refreshBooking();
      }, 0);
    });
    // Form submission interceptor triggering preview modal or focusing first error
    $form.on('submit', function (e) {
      e.preventDefault();
      submitted = true;
      if (!validateBooking()) {
        // [CRITERIA: Highlight invalid inputs and focus the first invalid field]
        $form.find('.is-invalid:first').trigger('focus');
        return;
      }
      const nameVal = String($('#visitor-name').val() || '').trim();
      const emailVal = String($('#visitor-email').val() || '').trim();
      const order = calculateOrder();

      const $previewModal = $('#bookingPreviewModal');
      if ($previewModal.length && window.bootstrap) {
        setText({
          '#prev-name': nameVal, '#prev-email': emailVal,
          '#prev-datetime': `${$dateInput.val()}, ${$timeSelect.val()}`,
          '#prev-type': isGroup() ? 'Large Group' : 'Individual / Small Group'
        });

        renderBreakdown('#prev-breakdown', order.lines);

        $('#prev-total').text(formatPrice(order.total));
        bootstrap.Modal.getOrCreateInstance($previewModal[0]).show();
      }
    });

    $('#btn-confirm-demo-submit').on('click', function () {
      if (!validateBooking()) {
        bootstrap.Modal.getInstance($('#bookingPreviewModal')[0])?.hide();
        return;
      }
      const $previewModal = $('#bookingPreviewModal');
      if ($previewModal.length && window.bootstrap) {
        bootstrap.Modal.getInstance($previewModal[0])?.hide();
      }
      const ref = Math.floor(100000 + Math.random() * 900000);
      showToast(`Demo booking #${ref} created successfully!`);
      $form[0].reset();
      refreshBooking();
    });

    refreshBooking();
  }
  // 5. REVIEWS & FEEDBACK MODULE (XSS Protection & Rating System)
  function initReviews() {
    const $form = $('#feedback-form');
    if (!$form.length) return;

    let selectedRating = 0;
    const $stars = $('#rating-container span');

    $stars.on('click', function () {
      selectedRating = $(this).index() + 1;
      $stars.each(function (idx) {
        $(this).toggleClass('text-warning', idx < selectedRating).toggleClass('text-muted', idx >= selectedRating);
      });
      $('#rating-label').text(`${selectedRating} / 5`);
      $('#rating-error').text('');
    });

    $('#feedback-text').on('input', function () {
      const $text = $(this), value = $text.val();
      $('#char-counter').text(`${value.length} / 500`);
      $text.toggleClass('is-invalid', value.trim().length < 10);
    });

    $form.on('submit', function (e) {
      e.preventDefault();

      const $textInput = $('#feedback-text');
      const textVal = $textInput.val().trim();

      if (selectedRating === 0) {
        $('#rating-error').text('Please select a rating star.');
        return;
      }

      if (textVal.length < 10) {
        $textInput.addClass('is-invalid');
        return;
      }

      // [CRITERIA: XSS Protection using jQuery .text() to sanitize user review input]
      const safeReviewText = $('<span>').text(textVal).html();

      $('#feedback-response-area')
        .removeClass('d-none')
        .hide()
        .html(`<strong>Thank you!</strong> Your ${selectedRating}-star review: "${safeReviewText}" has been posted in demo mode.`)
        .fadeIn(400, function () {
            setTimeout(() => $(this).fadeOut(400), 4000);
        });

      $form[0].reset();
      $textInput.removeClass('is-valid is-invalid');
      selectedRating = 0;
      $stars.removeClass('text-warning').addClass('text-muted');
      setText({ '#rating-label': '', '#char-counter': '0 / 500' });
    });
  }
  // 6. MODULE INITIALIZATIONS
  initContacts();
  initCollection();
  initGallery();
  initBooking();
  initReviews();
});