import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm';

const field = document.querySelector('[data-guided-location]');
if (field) {
  const supabase = createClient('https://otgnnkaawwwwqxlzrfpx.supabase.co','sb_publishable_bYYz3uHOE9py4E84KpEpiw_A4HGdcoX');
  const errorNode = document.querySelector('[data-guided-error="location"]');
  const nextButton = document.querySelector('[data-guided-context-next]');
  const statusNode = document.querySelector('[data-guided-context-status]');
  const list = document.createElement('div');
  list.className = 'cx-location-listbox';
  list.id = 'cx-location-options';
  list.setAttribute('role','listbox');
  list.hidden = true;
  field.removeAttribute('list');
  field.setAttribute('autocomplete','off');
  field.setAttribute('role','combobox');
  field.setAttribute('aria-autocomplete','list');
  field.setAttribute('aria-controls',list.id);
  field.setAttribute('aria-expanded','false');
  field.setAttribute('placeholder','Start typing a city, e.g. Bengaluru');
  field.insertAdjacentElement('afterend',list);

  let locations = [];
  let visible = [];
  let active = -1;
  let loaded = false;

  const normalize = (value) => String(value || '').normalize('NFKD').replace(/[\u0300-\u036f]/g,'').toLowerCase().trim();
  const exact = (value) => locations.find((item) => normalize(item.display_name) === normalize(value));

  function setValidity(valid, message = '') {
    field.dataset.locationValid = valid ? 'true' : 'false';
    if (valid) {
      field.removeAttribute('aria-invalid');
      if (errorNode) errorNode.textContent = '';
    } else if (message) {
      field.setAttribute('aria-invalid','true');
      if (errorNode) errorNode.textContent = message;
    }
  }

  function closeList() {
    list.hidden = true;
    active = -1;
    field.setAttribute('aria-expanded','false');
    field.removeAttribute('aria-activedescendant');
  }

  function choose(item) {
    field.value = item.display_name;
    setValidity(true);
    closeList();
    field.dispatchEvent(new Event('input',{ bubbles:true }));
    field.dataset.locationValid = 'true';
  }

  function render(query) {
    const q = normalize(query);
    if (!loaded || !q) { closeList(); return; }
    const starts = locations.filter((item) => normalize(item.display_name).startsWith(q));
    const contains = locations.filter((item) => !normalize(item.display_name).startsWith(q) && normalize(item.display_name).includes(q));
    visible = [...starts,...contains].slice(0,10);
    if (!visible.length) {
      list.innerHTML = '<p class="cx-location-empty">No matching major location. Try another city name.</p>';
      list.hidden = false;
      field.setAttribute('aria-expanded','true');
      return;
    }
    list.replaceChildren(...visible.map((item,index) => {
      const option = document.createElement('button');
      option.type = 'button';
      option.className = 'cx-location-option';
      option.id = `cx-location-option-${index}`;
      option.setAttribute('role','option');
      option.setAttribute('aria-selected','false');
      option.innerHTML = `<strong></strong><span></span>`;
      option.querySelector('strong').textContent = item.display_name;
      option.querySelector('span').textContent = item.category === 'remote' ? 'Remote work location' : 'Major city';
      option.addEventListener('pointerdown',(event)=>event.preventDefault());
      option.addEventListener('click',()=>choose(item));
      return option;
    }));
    active = -1;
    list.hidden = false;
    field.setAttribute('aria-expanded','true');
  }

  function activate(index) {
    if (!visible.length) return;
    active = Math.max(0,Math.min(index,visible.length-1));
    [...list.querySelectorAll('.cx-location-option')].forEach((option,i)=>option.setAttribute('aria-selected',String(i===active)));
    const option = list.querySelector(`#cx-location-option-${active}`);
    if (option) {
      field.setAttribute('aria-activedescendant',option.id);
      option.scrollIntoView({ block:'nearest' });
    }
  }

  field.addEventListener('input',()=>{
    const match = exact(field.value);
    setValidity(Boolean(match));
    render(field.value);
  });
  field.addEventListener('focus',()=>render(field.value));
  field.addEventListener('blur',()=>{
    window.setTimeout(()=>{
      const match = exact(field.value);
      if (match) choose(match);
      else closeList();
    },120);
  });
  field.addEventListener('keydown',(event)=>{
    if (event.key === 'ArrowDown') { event.preventDefault(); if (list.hidden) render(field.value); activate(active+1); }
    else if (event.key === 'ArrowUp') { event.preventDefault(); activate(active<=0?0:active-1); }
    else if (event.key === 'Enter' && active >= 0 && visible[active]) { event.preventDefault(); choose(visible[active]); }
    else if (event.key === 'Escape') closeList();
  });

  nextButton?.addEventListener('click',(event)=>{
    const match = exact(field.value);
    if (match) {
      field.value = match.display_name;
      setValidity(true);
      return;
    }
    event.preventDefault();
    event.stopImmediatePropagation();
    setValidity(false, loaded ? 'Choose a valid location from the suggestions.' : 'Location suggestions are still loading. Try again in a moment.');
    if (statusNode) statusNode.textContent = 'Select a valid city or remote region before entering the Story Beats.';
    field.focus();
    render(field.value);
  },true);

  const { data, error } = await supabase.from('story_locations').select('display_name,category,priority').eq('is_active',true).order('priority',{ ascending:true }).order('display_name',{ ascending:true });
  if (error) {
    loaded = false;
    setValidity(false,'Location suggestions could not load. Refresh and try again.');
  } else {
    locations = data || [];
    loaded = true;
    const match = exact(field.value);
    setValidity(Boolean(match));
  }
}
