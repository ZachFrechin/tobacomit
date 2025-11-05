// Compute days since stop date and fetch motivational sentence asynchronously
(function () {
  function parseDate(input) {
    if (!input) return null;
    if (input instanceof Date) return input;
    const s = String(input);
    const ddmmyyyy = s.match(/^(\d{1,2})-(\d{1,2})-(\d{4})/);
    if (ddmmyyyy) {
      const [, d, m, y] = ddmmyyyy;
      return new Date(Number(y), Number(m) - 1, Number(d));
    }
    const yyyymmdd = s.match(/^(\d{4})-(\d{2})-(\d{2})/);
    if (yyyymmdd) {
      const [, y, m, d] = yyyymmdd;
      return new Date(Number(y), Number(m) - 1, Number(d));
    }
    const date = new Date(s);
    return isNaN(date.getTime()) ? null : date;
  }

  function computeDays(stopDate) {
    if (!stopDate) return 0;
    const a = new Date();
    a.setHours(0,0,0,0);
    const b = new Date(stopDate);
    b.setHours(0,0,0,0);
    const diff = a - b;
    return Math.max(0, Math.floor(diff / (1000 * 60 * 60 * 24)));
  }

  function setDays() {
    const root = document.getElementById('home');
    if (!root) return;
    const daysValueEl = document.getElementById('daysValue');
    const daysLabelEl = document.getElementById('daysLabel');
    const stopDateStr = root.getAttribute('data-date');
    const stopDate = parseDate(stopDateStr);
    const days = computeDays(stopDate);
    daysValueEl.textContent = String(days);
    daysValueEl.classList.add('fade-in');
    daysLabelEl.classList.add('fade-in');
  }

  async function fetchMotiv() {
    const line = document.getElementById('motivLine');
    const loader = document.getElementById('motivLoader');
    if (!line) return;
    try {
      const res = await fetch('/api/ia/get-model-sentence', { credentials: 'same-origin' });
      if (!res.ok) throw new Error('Failed');
      const json = await res.json();
      // Try to extract text from known shapes
      let text = '';
      if (json && json.data) {
        if (typeof json.data === 'string') text = json.data;
        else if (json.data.response) text = json.data.response;
        else if (json.data.message) text = json.data.message;
      }
      line.classList.remove('muted');
      line.textContent = text || 'Continue, chaque jour compte.';
      line.classList.add('fade-in');
    } catch (e) {
      line.textContent = 'Continue, chaque jour compte.';
    }
    if (loader) loader.style.display = 'none';
  }

  window.addEventListener('DOMContentLoaded', function () {
    setDays();
    fetchMotiv();
  });
})();


