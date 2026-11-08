/*
'use strict';

document.addEventListener('DOMContentLoaded', () => {

  // 1. Scroll to top button
  const scrollTopBtn = document.createElement('button');
  scrollTopBtn.innerHTML = '↑';
  scrollTopBtn.id = 'scrollTopBtn';
  scrollTopBtn.setAttribute('aria-label', 'Scroll to top');

  scrollTopBtn.style.cssText = `
    position: fixed;
    bottom: 30px;
    right: 30px;
    width: 45px;
    height: 45px;
    border-radius: 50%;
    background-color: #198754;
    color: white;
    border: none;
    font-size: 20px;
    cursor: pointer;
    display: none;
    box-shadow: 0 4px 10px rgba(0,0,0,0.3);
    z-index: 1000;
    transition: all 0.3s ease;
  `;

  document.body.appendChild(scrollTopBtn);

  window.addEventListener('scroll', () => {
    scrollTopBtn.style.display =
      window.scrollY > 300 ? 'block' : 'none';
  });

  scrollTopBtn.addEventListener('click', () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  });

  // 2. Interactive museum history timeline
  const timelineData = {
    "1984": {
      subtitle: "Official Opening",
      title: "Establishment of the State Museum",
      desc: "On July 9, 1984, the museum officially opened its doors in a historical wooden merchant house built in the late 19th century in Akmolinsk."
    },
    "1998": {
      subtitle: "Restoration",
      title: "Restoration and Development of the Museum",
      desc: "After Astana became the new capital of Kazakhstan, the historical museum building was restored, and its collection was expanded with rare manuscripts and historical documents."
    },
    "2014": {
      subtitle: "30th Anniversary",
      title: "Expansion and International Recognition",
      desc: "The museum celebrated its 30th anniversary, organized international literary conferences, and opened new exhibition halls dedicated to Saken Seifullin and his contemporaries."
    },
    "2024": {
      subtitle: "Modernization",
      title: "Digitalization and Interactive Exhibitions",
      desc: "The museum introduced digital archives, interactive multimedia displays, and modern technologies to preserve and present historical materials and personal belongings."
    }
  };

  const timelineBtns =
    document.querySelectorAll('.timeline-year-btn');

  if (timelineBtns.length > 0) {
    timelineBtns.forEach(btn => {
      btn.addEventListener('click', () => {

        timelineBtns.forEach(b => {
          b.classList.remove('btn-success', 'active');
          b.classList.add('btn-outline-success');
        });

        btn.classList.remove('btn-outline-success');
        btn.classList.add('btn-success', 'active');

        const year = btn.getAttribute('data-year');
        const data = timelineData[year];

        if (data) {
          document.getElementById('timeline-badge').textContent =
            year;

          document.getElementById('timeline-subtitle').textContent =
            data.subtitle;

          document.getElementById('timeline-title').textContent =
            data.title;

          document.getElementById('timeline-desc').textContent =
            data.desc;
        }
      });
    });
  }

  // 3. World of Poetry
  const poemTriggers =
    document.querySelectorAll('.poem-modal-trigger');

  if (poemTriggers.length > 0) {
    let currentModalText = '';
    let selectedCategory = 'all';

    poemTriggers.forEach(trigger => {

      trigger.addEventListener('click', () => {
        const title =
          trigger.getAttribute('data-title') || '';

        const meta =
          trigger.getAttribute('data-meta') || '';

        const badge =
          trigger.getAttribute('data-badge') || '';

        const poem =
          trigger.getAttribute('data-en') ||
          trigger.getAttribute('data-kaz') ||
          '';

        const desc =
          trigger.getAttribute('data-desc') || '';

        document.getElementById('poemModalLabel').textContent =
          title;

        document.getElementById('modal-poem-meta').textContent =
          meta;

        document.getElementById('modal-poem-badge').textContent =
          badge;

        document.getElementById('modal-poem-quote').textContent =
          poem;

        document.getElementById('modal-poem-desc').textContent =
          desc;

        currentModalText =
          `${poem} — Saken Seifullin (${title})`;
      });

      const poemText =
        trigger.querySelector('.poem-text');

      const poem =
        trigger.getAttribute('data-en') ||
        trigger.getAttribute('data-kaz');

      if (poemText && poem) {
        poemText.textContent = poem;
      }
    });

    // Copy poem text
    const modalCopyBtn =
      document.getElementById('modal-copy-btn');

    if (modalCopyBtn) {
      modalCopyBtn.addEventListener('click', () => {

        if (navigator.clipboard) {
          navigator.clipboard.writeText(currentModalText)
            .then(() => {
              showToast('Poem copied successfully!');
            })
            .catch(() => {
              showToast('Failed to copy the poem.');
            });
        } else {
          showToast('Your browser does not support copying.');
        }
      });
    }

    // Poetry search and filtering
    const filterBtns =
      document.querySelectorAll('.filter-btn');

    const poemCols =
      document.querySelectorAll('.poem-card-col');

    const searchInput =
      document.getElementById('poetry-search');

    function updateVisiblePoems() {
      const query = (searchInput?.value || '')
        .toLocaleLowerCase('en')
        .trim();

      poemCols.forEach(col => {
        const matchesCategory =
          selectedCategory === 'all' ||
          col.getAttribute('data-category') === selectedCategory;

        const matchesQuery = col.textContent
          .toLocaleLowerCase('en')
          .includes(query);

        col.style.display =
          matchesCategory && matchesQuery ? '' : 'none';
      });
    }

    filterBtns.forEach(btn => {
      btn.addEventListener('click', () => {

        filterBtns.forEach(b => {
          b.classList.remove('btn-success', 'active');
          b.classList.add('btn-outline-success');
        });

        btn.classList.remove('btn-outline-success');
        btn.classList.add('btn-success', 'active');

        selectedCategory =
          btn.getAttribute('data-category') || 'all';

        updateVisiblePoems();
      });
    });

    if (searchInput) {
      searchInput.addEventListener(
        'input',
        updateVisiblePoems
      );
    }
  }

  // 4. Exhibit search, filtering and modal
  const exhibitTriggers =
    document.querySelectorAll('.exhibit-modal-trigger');

  if (exhibitTriggers.length > 0) {

    exhibitTriggers.forEach(trigger => {
      trigger.addEventListener('click', () => {

        document.getElementById('exhibitModalTitle').textContent =
          trigger.getAttribute('data-title') || '';

        document.getElementById('exhibitModalInv').textContent =
          trigger.getAttribute('data-inv') || '';

        document.getElementById('exhibitModalYear').textContent =
          `Year: ${trigger.getAttribute('data-year') || ''}`;

        document.getElementById('exhibitModalDesc').textContent =
          trigger.getAttribute('data-desc') || '';
      });
    });

    const exFilterBtns =
      document.querySelectorAll('.filter-exhibit-btn');

    const exCols =
      document.querySelectorAll('.exhibit-card-col');

    exFilterBtns.forEach(btn => {
      btn.addEventListener('click', () => {

        exFilterBtns.forEach(b => {
          b.classList.remove('btn-success', 'active');
          b.classList.add('btn-outline-success');
        });

        btn.classList.remove('btn-outline-success');
        btn.classList.add('btn-success', 'active');

        const category =
          btn.getAttribute('data-category');

        exCols.forEach(col => {
          col.style.display =
            category === 'all' ||
            col.getAttribute('data-category') === category
              ? 'block'
              : 'none';
        });
      });
    });

    const exSearchInput =
      document.getElementById('exhibit-search');

    if (exSearchInput) {
      exSearchInput.addEventListener('input', event => {

        const value =
          event.target.value.toLowerCase().trim();

        exCols.forEach(col => {
          col.style.display =
            col.innerText.toLowerCase().includes(value)
              ? 'block'
              : 'none';
        });
      });
    }
  }

  // 5. Gallery filtering and image lightbox
  const galleryTriggers =
    document.querySelectorAll('.gallery-lightbox-trigger');

  if (galleryTriggers.length > 0) {

    galleryTriggers.forEach(trigger => {
      trigger.addEventListener('click', () => {

        document.getElementById('lightbox-img').src =
          trigger.getAttribute('data-img') || '';

        document.getElementById('lightbox-caption').textContent =
          trigger.getAttribute('data-caption') || '';
      });
    });

    const gFilterBtns =
      document.querySelectorAll('.filter-gallery-btn');

    const gCols =
      document.querySelectorAll('.gallery-card-col');

    gFilterBtns.forEach(btn => {
      btn.addEventListener('click', () => {

        gFilterBtns.forEach(b => {
          b.classList.remove('btn-success', 'active');
          b.classList.add('btn-outline-success');
        });

        btn.classList.remove('btn-outline-success');
        btn.classList.add('btn-success', 'active');

        const category =
          btn.getAttribute('data-category');

        gCols.forEach(col => {
          col.style.display =
            category === 'all' ||
            col.getAttribute('data-category') === category
              ? 'block'
              : 'none';
        });
      });
    });
  }

  // 6. Ticket price calculator
  const adultInput =
    document.getElementById('adult-tickets');

  const studentInput =
    document.getElementById('student-tickets');

  const totalPriceDisplay =
    document.getElementById('total-price-display');

  if (adultInput && studentInput && totalPriceDisplay) {

    const calculateTotal = () => {
      const adults =
        parseInt(adultInput.value, 10) || 0;

      const students =
        parseInt(studentInput.value, 10) || 0;

      const total =
        adults * 1000 + students * 500;

      totalPriceDisplay.textContent =
        `${total} KZT`;
    };

    adultInput.addEventListener('input', calculateTotal);
    studentInput.addEventListener('input', calculateTotal);
  }

  // 7. Excursion booking
  const bookingForm =
    document.getElementById('booking-form');

  if (bookingForm) {
    bookingForm.addEventListener('submit', event => {
      event.preventDefault();

      showToast('Your excursion booking request has been received!');

      bookingForm.reset();
    });
  }

  // 8. Visitor reviews
  const reviewForm =
    document.getElementById('review-form');

  const reviewsFeed =
    document.getElementById('reviews-feed');

  if (reviewForm && reviewsFeed) {

    reviewForm.addEventListener('submit', event => {
      event.preventDefault();

      const name =
        document.getElementById('review-name').value.trim();

      const rating =
        document.getElementById('review-rating').value;

      const reviewText =
        document.getElementById('review-text').value.trim();

      const stars =
        '⭐'.repeat(parseInt(rating, 10) || 0);

      const reviewCard =
        document.createElement('div');

      reviewCard.className =
        'card border-0 shadow-sm p-3 bg-white';

      reviewCard.innerHTML = `
        <div class="d-flex justify-content-between align-items-center mb-1">
          <strong class="text-dark"></strong>
          <span class="text-warning small">${stars}</span>
        </div>
        <p class="text-secondary small mb-0"></p>
      `;

      reviewCard.querySelector('strong').textContent =
        name;

      reviewCard.querySelector('p').textContent =
        `"${reviewText}"`;

      reviewsFeed.prepend(reviewCard);

      showToast('Thank you! Your review has been published.');

      reviewForm.reset();
    });
  }

  // 9. Animated museum statistics
  const animatedElements =
    document.querySelectorAll('.display-6');

  if (animatedElements.length > 0) {

    const startCounter = element => {
      const targetText =
        element.innerText.trim();

      const hasPlus =
        targetText.includes('+');

      const targetNum =
        parseInt(targetText, 10);

      if (isNaN(targetNum)) return;

      const startNum =
        targetNum > 1000 ? targetNum - 40 : 0;

      const duration = 1200;
      const stepTime = 30;
      const steps = duration / stepTime;

      const increment =
        (targetNum - startNum) / steps;

      let current = startNum;

      const timer = setInterval(() => {
        current += increment;

        if (current >= targetNum) {
          element.innerText =
            targetNum + (hasPlus ? '+' : '');

          clearInterval(timer);
        } else {
          element.innerText =
            Math.floor(current) + (hasPlus ? '+' : '');
        }
      }, stepTime);
    };

    const observer = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          startCounter(entry.target);
          observer.unobserve(entry.target);
        }
      });
    }, {
      threshold: 0.3
    });

    animatedElements.forEach(element => {
      observer.observe(element);
    });
  }

  // 10. Museum opening status
  const statusBadge =
    document.getElementById('museum-status-badge');

  if (statusBadge) {

    const now = new Date();
    const day = now.getDay();
    const hour = now.getHours();

    if (day === 1) {
      statusBadge.className =
        'badge bg-danger px-3 py-2 fs-6';

      statusBadge.textContent =
        '🔴 Closed (Monday — Day Off)';

    } else if (hour >= 10 && hour < 18) {
      statusBadge.className =
        'badge bg-success px-3 py-2 fs-6';

      statusBadge.textContent =
        '🟢 Open (Until 6:00 PM)';

    } else {
      statusBadge.className =
        'badge bg-warning text-dark px-3 py-2 fs-6';

      statusBadge.textContent =
        '🟡 Closed (Opens at 10:00 AM)';
    }
  }

  // 11. Copy contact information
  document.querySelectorAll('.copy-contact').forEach(link => {

    link.addEventListener('click', () => {

      const copyValue =
        link.getAttribute('data-copy') ||
        link.innerText.trim();

      if (navigator.clipboard) {

        navigator.clipboard.writeText(copyValue)
          .then(() => {
            showToast(`Copied: ${copyValue}`);
          })
          .catch(() => {
            showToast('Failed to copy contact information.');
          });

      } else {
        showToast('Your browser does not support copying.');
      }
    });
  });

});

// 12. Toast notification
function showToast(message) {

  let toast =
    document.getElementById('custom-toast');

  if (!toast) {

    toast = document.createElement('div');
    toast.id = 'custom-toast';

    toast.style.cssText = `
      position: fixed;
      bottom: 30px;
      left: 50%;
      transform: translateX(-50%);
      background-color: #198754;
      color: white;
      padding: 12px 24px;
      border-radius: 25px;
      box-shadow: 0 4px 12px rgba(0,0,0,0.2);
      z-index: 9999;
      font-weight: 500;
      transition: opacity 0.3s ease;
    `;

    document.body.appendChild(toast);
  }

  toast.innerText = message;
  toast.style.opacity = '1';

  setTimeout(() => {
    toast.style.opacity = '0';
  }, 2500);
}
*/