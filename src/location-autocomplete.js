import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm';

const field = document.querySelector('[data-guided-location]');
if (field) {
  const SUPABASE_URL = 'https://otgnnkaawwwwqxlzrfpx.supabase.co';
  const SUPABASE_KEY = 'sb_publishable_bYYz3uHOE9py4E84KpEpiw_A4HGdcoX';
  const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);
  const searchUrl = `${SUPABASE_URL}/functions/v1/search-locations`;
  const errorNode = document.querySelector('[data-guided-error="location"]');
  const nextButton = document.querySelector('[data-guided-context-next]');
  const statusNode = document.querySelector('[data-guided-context-status]');
  const list = document.createElement('div');
  list.className = 'cx-location-listbox';
  list.id = 'cx-location-options';
  list.setAttribute('role', 'listbox');
  list.hidden = true;

  const attribution = document.createElement('p');
  attribution.className = 'cx-location-attribution';
  attribution.innerHTML = 'Global city data: <a href="https://github.com/dr5hn/countries-states-cities-database" target="_blank" rel="noopener noreferrer">Countries States Cities Database</a> · ODbL';

  field.removeAttribute('list');
  field.setAttribute('autocomplete', 'off');
  field.setAttribute('role', 'combobox');
  field.setAttribute('aria-autocomplete', 'list');
  field.setAttribute('aria-controls', list.id);
  field.setAttribute('aria-expanded', 'false');
  field.setAttribute('placeholder', 'Type any city, or choose Remote / Other');
  field.insertAdjacentElement('afterend', list);
  list.insertAdjacentElement('afterend', attribution);

  let visible = [];
  let active = -1;
  let selected = null;
  let debounceTimer = null;
  let requestToken = 0;
  let suppressInput = false;

  const normalize = (value) => String(value || '')
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/\s+/g, ' ')
    .trim();

  function setValidity(valid, message = '') {
    field.dataset.locationValid = valid ? 'true' : 'false';
    if (valid) {
      field.removeAttribute('aria-invalid');
      if (errorNode) errorNode.textContent = '';
    } else if (message) {
      field.setAttribute('aria-invalid', 'true');
      if (errorNode) errorNode.textContent = message;
    }
  }

  function clearSelection() {
    selected = null;
    delete field.dataset.locationKind;
    delete field.dataset.locationCity;
    delete field.dataset.locationCountryCode;
    delete field.dataset.locationStateCode;
    delete field.dataset.locationCountry;
    delete field.dataset.locationState;
    setValidity(false);
  }

  function closeList() {
    list.hidden = true;
    active = -1;
    field.setAttribute('aria-expanded', 'false');
    field.removeAttribute('aria-activedescendant');
  }

  function applySelection(item) {
    selected = item;
    field.dataset.locationKind = item.category || 'city';
    field.dataset.locationCity = item.city || '';
    field.dataset.locationCountryCode = item.country_code || '';
    field.dataset.locationStateCode = item.state_code || '';
    field.dataset.locationCountry = item.country || '';
    field.dataset.locationState = item.state || '';
    setValidity(true);
  }

  function choose(item) {
    suppressInput = true;
    field.value = item.display_name;
    applySelection(item);
    field.dispatchEvent(new Event('input', { bubbles: true }));
    suppressInput = false;
    applySelection(item);
    closeList();
  }

  function optionDetail(item) {
    if (item.category === 'remote') return 'Work was remote';
    if (item.category === 'other') return 'Location outside a city';
    return [item.state, item.country].filter(Boolean).join(' · ') || 'City';
  }

  function render(items, { more = false, query = '' } = {}) {
    visible = Array.isArray(items) ? items : [];
    if (!visible.length) {
      list.replaceChildren();
      const empty = document.createElement('p');
      empty.className = 'cx-location-empty';
      empty.textContent = query
        ? 'No matching city yet. Keep typing, or choose Other.'
        : 'Start typing any city, or choose Remote / Other.';
      list.append(empty);
      list.hidden = false;
      field.setAttribute('aria-expanded', 'true');
      return;
    }

    list.replaceChildren(...visible.map((item, index) => {
      const option = document.createElement('button');
      option.type = 'button';
      option.className = 'cx-location-option';
      option.id = `cx-location-option-${index}`;
      option.setAttribute('role', 'option');
      option.setAttribute('aria-selected', 'false');

      const main = document.createElement('strong');
      main.textContent = item.display_name;
      const detail = document.createElement('span');
      detail.textContent = optionDetail(item);
      option.append(main, detail);
      option.addEventListener('pointerdown', (event) => event.preventDefault());
      option.addEventListener('click', () => choose(item));
      return option;
    }));

    if (more) {
      const hint = document.createElement('p');
      hint.className = 'cx-location-more';
      hint.textContent = 'More cities match this search — keep typing to narrow the list.';
      list.append(hint);
    }

    active = -1;
    list.hidden = false;
    field.setAttribute('aria-expanded', 'true');
  }

  async function fallbackSearch(query) {
    const q = String(query || '').trim();
    let request = supabase.from('story_locations')
      .select('display_name,category')
      .eq('is_active', true)
      .order('priority', { ascending: true })
      .order('display_name', { ascending: true })
      .limit(20);
    if (q) request = request.ilike('display_name', `${q}%`);
    const { data, error } = await request;
    if (error) throw error;
    return (data || []).map((item) => ({
      display_name: item.display_name,
      category: item.category,
      city: '',
      country_code: '',
      state_code: '',
      country: '',
      state: '',
    }));
  }

  async function search(query) {
    const token = ++requestToken;
    const q = String(query || '').trim().slice(0, 80);
    try {
      const response = await fetch(`${searchUrl}?q=${encodeURIComponent(q)}`, {
        method: 'GET',
        headers: { apikey: SUPABASE_KEY, Accept: 'application/json' },
        cache: 'no-store',
      });
      if (!response.ok) throw new Error(`Location search unavailable (${response.status})`);
      const payload = await response.json();
      if (token !== requestToken) return;
      render(payload?.results || [], { more: Boolean(payload?.more), query: q });
    } catch (error) {
      try {
        const items = await fallbackSearch(q);
        if (token !== requestToken) return;
        render(items, { more: false, query: q });
      } catch (fallbackError) {
        if (token !== requestToken) return;
        closeList();
        setValidity(false, 'Location suggestions could not load. Refresh and try again.');
        console.error('CorporateX location search failed.', error, fallbackError);
      }
    }
  }

  function scheduleSearch(query, immediate = false) {
    window.clearTimeout(debounceTimer);
    if (immediate) {
      search(query);
      return;
    }
    debounceTimer = window.setTimeout(() => search(query), 150);
  }

  function activate(index) {
    if (!visible.length) return;
    active = Math.max(0, Math.min(index, visible.length - 1));
    [...list.querySelectorAll('.cx-location-option')].forEach((option, i) => option.setAttribute('aria-selected', String(i === active)));
    const option = list.querySelector(`#cx-location-option-${active}`);
    if (option) {
      field.setAttribute('aria-activedescendant', option.id);
      option.scrollIntoView({ block: 'nearest' });
    }
  }

  field.addEventListener('input', () => {
    if (suppressInput) return;
    clearSelection();
    scheduleSearch(field.value);
  });

  field.addEventListener('focus', () => {
    if (!selected || normalize(selected.display_name) !== normalize(field.value)) scheduleSearch(field.value, true);
  });

  field.addEventListener('blur', () => {
    window.setTimeout(() => {
      if (selected && normalize(selected.display_name) === normalize(field.value)) {
        applySelection(selected);
      } else {
        const exact = visible.find((item) => normalize(item.display_name) === normalize(field.value));
        if (exact) choose(exact);
        else closeList();
      }
    }, 140);
  });

  field.addEventListener('keydown', (event) => {
    if (event.key === 'ArrowDown') {
      event.preventDefault();
      if (list.hidden) scheduleSearch(field.value, true);
      activate(active + 1);
    } else if (event.key === 'ArrowUp') {
      event.preventDefault();
      activate(active <= 0 ? 0 : active - 1);
    } else if (event.key === 'Enter' && active >= 0 && visible[active]) {
      event.preventDefault();
      choose(visible[active]);
    } else if (event.key === 'Escape') {
      closeList();
    }
  });

  nextButton?.addEventListener('click', (event) => {
    const valid = selected && normalize(selected.display_name) === normalize(field.value);
    if (valid) {
      applySelection(selected);
      return;
    }
    event.preventDefault();
    event.stopImmediatePropagation();
    setValidity(false, 'Choose a city, Remote, or Other from the suggestions.');
    if (statusNode) statusNode.textContent = 'Select a location suggestion before entering the Story Beats.';
    field.focus();
    scheduleSearch(field.value, true);
  }, true);

  setValidity(false);
}
