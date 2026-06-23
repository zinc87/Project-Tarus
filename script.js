/* ================================================================
   CONFIG — edit this to change when the timer starts.
   Format: 'YYYY-MM-DD' or 'YYYY-MM-DD HH:MM' (24-hour).
   ================================================================ */
var START_DATE = '2023-06-04';
var SHOW_SECONDS = true;   // set to false to hide the seconds unit
/* ================================================================ */

(function () {
  var MONTHS = ['January','February','March','April','May','June',
                'July','August','September','October','November','December'];

  function parseStart(raw) {
    raw = String(raw).trim();
    var d = new Date(raw);
    if (isNaN(d.getTime())) {
      var m = raw.match(/(\d{4})\D+(\d{1,2})\D+(\d{1,2})(?:\D+(\d{1,2})\D+(\d{1,2}))?/);
      if (m) d = new Date(+m[1], +m[2]-1, +m[3], m[4]?+m[4]:0, m[5]?+m[5]:0, 0);
      else d = new Date(2023, 5, 4, 0, 0, 0);
    }
    return d;
  }

  function calc(from, now) {
    var years  = now.getFullYear() - from.getFullYear();
    var months = now.getMonth()    - from.getMonth();
    var days   = now.getDate()     - from.getDate();
    var hours  = now.getHours()    - from.getHours();
    var mins   = now.getMinutes()  - from.getMinutes();
    var secs   = now.getSeconds()  - from.getSeconds();
    if (secs  < 0) { secs  += 60; mins--; }
    if (mins  < 0) { mins  += 60; hours--; }
    if (hours < 0) { hours += 24; days--; }
    if (days  < 0) { days  += new Date(now.getFullYear(), now.getMonth(), 0).getDate(); months--; }
    if (months < 0){ months += 12; years--; }
    var weeks = Math.floor(days / 7);
    days = days % 7;
    return { years: years, months: months, weeks: weeks, days: days, hours: hours, mins: mins, secs: secs };
  }

  function pad(n) { return String(n).padStart(2, '0'); }

  var start = parseStart(START_DATE);
  var el = {
    years:  document.getElementById('t-years'),
    months: document.getElementById('t-months'),
    weeks:  document.getElementById('t-weeks'),
    days:   document.getElementById('t-days'),
    hours:  document.getElementById('t-hours'),
    mins:   document.getElementById('t-mins'),
    secs:   document.getElementById('t-secs')
  };

  // "since 4 June 2023" line
  var since = document.getElementById('since');
  if (since) since.textContent = 'since ' + start.getDate() + ' ' + MONTHS[start.getMonth()] + ' ' + start.getFullYear();

  // optionally hide seconds
  if (!SHOW_SECONDS && el.secs) el.secs.parentElement.style.display = 'none';

  function tick() {
    var v = calc(start, new Date());
    el.years.textContent  = String(v.years);
    el.months.textContent = pad(v.months);
    el.weeks.textContent  = pad(v.weeks);
    el.days.textContent   = pad(v.days);
    el.hours.textContent  = pad(v.hours);
    el.mins.textContent   = pad(v.mins);
    el.secs.textContent   = pad(v.secs);
  }
  tick();
  setInterval(tick, 1000);

  // ---- scroll reveal (stays revealed once shown) ----
  var reveals = document.querySelectorAll('[data-reveal]');
  function reveal(e) { e.classList.add('shown'); }
  function revealInstant(e) { e.classList.add('shown', 'instant'); }
  function inView(e) {
    var r = e.getBoundingClientRect();
    return r.top < (window.innerHeight || document.documentElement.clientHeight) && r.bottom > 0;
  }

  // 1) reveal anything already on screen at load (so above-the-fold never stays blank)
  reveals.forEach(function (e) { if (inView(e)) reveal(e); });

  // 2) observe the rest as they scroll in
  if ('IntersectionObserver' in window) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) { reveal(e.target); io.unobserve(e.target); }
      });
    }, { threshold: 0.1, rootMargin: '0px 0px -6% 0px' });
    reveals.forEach(function (e) { if (!e.classList.contains('shown')) io.observe(e); });
  }

  // 3) transition watchdog: if a revealed element's fade hasn't progressed
  //    (transitions disabled/janky in some environments), snap it visible instantly.
  setTimeout(function () {
    reveals.forEach(function (e) {
      if (e.classList.contains('shown') && getComputedStyle(e).opacity !== '1') revealInstant(e);
    });
  }, 1300);

  // 4) final safety net: nothing stays hidden, ever.
  setTimeout(function () {
    reveals.forEach(function (e) {
      if (getComputedStyle(e).opacity !== '1') revealInstant(e);
    });
  }, 5000);
})();
