/*
   vanilla.js — Saken Seifullin Museum
   Plain JavaScript Logic (Weeks 6–8)
 */
'use strict';

(() => {
  // 1. Data Store (Arrays & Objects)
  const SCHEDULE = {
    0: { day: 'Sunday', hours: [10, 17], status: 'Weekend Schedule' },
    1: { day: 'Monday', hours: null, status: 'Day Off (Closed)' },
    2: { day: 'Tuesday', hours: [10, 18], status: 'Regular Schedule' },
    3: { day: 'Wednesday', hours: [10, 18], status: 'Regular Schedule' },
    4: { day: 'Thursday', hours: [10, 18], status: 'Regular Schedule' },
    5: { day: 'Friday', hours: [10, 18], status: 'Regular Schedule' },
    6: { day: 'Saturday', hours: [10, 17], status: 'Weekend Schedule' }
  };

  const TOUR_SPECS = {
    avgExhibits: 8,
    avgTimePerExhibitMin: 12,
    baseGuideDurationMin: 45
  };

  // 2. Helper Functions with Parameters and Return Values
  function twoDigits(num) {
    return String(num).padStart(2, '0');
  }

  function calculateRecommendedVisitDuration(exhibitCount) {
    const count = Math.max(1, Number(exhibitCount) || TOUR_SPECS.avgExhibits);
    const totalMinutes = (count * TOUR_SPECS.avgTimePerExhibitMin) + TOUR_SPECS.baseGuideDurationMin;
    const hours = Math.floor(totalMinutes / 60);
    const minutes = totalMinutes % 60;
    return { count, totalMinutes, hours, minutes };
  }

  function getMuseumRealtimeStatus(now = new Date()) {
    const dayOfWeek = now.getDay();
    const currentHour = now.getHours();
    const todayInfo = SCHEDULE[dayOfWeek];

    if (todayInfo.hours && currentHour >= todayInfo.hours[0] && currentHour < todayInfo.hours[1]) {
      const remainingHours = todayInfo.hours[1] - currentHour;
      return {
        isOpen: true,
        badgeClass: 'bg-success',
        text: `🟢 Open now (until ${twoDigits(todayInfo.hours[1])}:00 — ${remainingHours}h remaining)`
      };
    }
    
    if (todayInfo.hours && currentHour < todayInfo.hours[0]) {
      return {
        isOpen: false,
        badgeClass: 'bg-warning text-dark',
        text: `🟡 Closed now (opens today at ${twoDigits(todayInfo.hours[0])}:00)`
      };
    }

    return {
      isOpen: false,
      badgeClass: 'bg-danger',
      text: `🔴 Closed today (${todayInfo.status})`
    };
  }

  // 3. Dynamic DOM Generation (Plain JS)
  function renderWorkingHoursWidget() {
    const statusBadge = document.getElementById('museum-status-badge');
    if (statusBadge) {
      const status = getMuseumRealtimeStatus();
      statusBadge.className = `badge ${status.badgeClass} px-3 py-2 fs-6 text-wrap`;
      statusBadge.textContent = status.text;
    }

    const hoursCard = document.getElementById('museum-hours-card');
    if (hoursCard && !document.getElementById('vanilla-visit-advisor')) {
      const duration = calculateRecommendedVisitDuration(8);
      const advisorBox = document.createElement('div');
      advisorBox.id = 'vanilla-visit-advisor';
      advisorBox.className = 'mt-3 pt-3 border-top small text-muted';
      advisorBox.innerHTML = `
        <strong class="text-dark d-block mb-1">⏱️ Recommended Tour Time:</strong>
        <span>Viewing ${duration.count} key collection items takes approx. 
        <strong>${duration.hours}h ${duration.minutes}m</strong>.</span>
      `;
      hoursCard.appendChild(advisorBox);
    }
  }

  // 4. Initialization on DOM Load
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', renderWorkingHoursWidget);
  } else {
    renderWorkingHoursWidget();
  }
})();