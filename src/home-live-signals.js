const SUPABASE_URL = 'https://otgnnkaawwwwqxlzrfpx.supabase.co';
const SUPABASE_KEY = 'sb_publishable_bYYz3uHOE9py4E84KpEpiw_A4HGdcoX';

function el(tag, className, text) {
  const node = document.createElement(tag);
  if (className) node.className = className;
  if (text != null) node.textContent = text;
  return node;
}

async function loadLiveSignals() {
  const stage = document.querySelector('.pages-live-stage');
  if (!stage) return;
  try {
    const response = await fetch(`${SUPABASE_URL}/rest/v1/live_story_signals?select=label,pending_count,confirmed_count,total_count&order=total_count.desc,label.asc`, {
      headers: { apikey: SUPABASE_KEY, Authorization: `Bearer ${SUPABASE_KEY}`, Accept: 'application/json' },
      cache: 'no-store',
    });
    if (!response.ok) throw new Error(`Signal archive unavailable (${response.status})`);
    const signals = await response.json();
    if (!Array.isArray(signals) || !signals.length) return;

    const panel = el('div', 'cx-live-signals');
    const heading = el('div', 'cx-live-signals__head');
    heading.append(el('h3', '', 'Signals entering the sequence.'), el('p', '', 'Only broad theme labels appear here while a story is under review. Raw story text, company details and contributor identity stay private.'));
    const cloud = el('div', 'cx-live-signal-cloud');
    cloud.setAttribute('aria-label', 'Live workplace themes');

    signals.slice(0, 14).forEach((signal, index) => {
      const confirmed = Number(signal.confirmed_count || 0) > 0;
      const chip = el('span', `cx-live-signal ${confirmed ? 'is-confirmed' : 'is-pending'}`, signal.label || 'Workplace signal');
      chip.style.setProperty('--signal-weight', String(Math.min(4, Math.max(1, Number(signal.total_count || 1)))));
      chip.style.setProperty('--signal-delay', `${(index % 7) * -0.35}s`);
      chip.title = confirmed ? 'Confirmed from at least one published story' : 'Pending content validation';
      cloud.append(chip);
    });

    const foot = el('div', 'cx-live-signals__foot');
    const pendingTotal = signals.reduce((sum, signal) => sum + Number(signal.pending_count || 0), 0);
    const confirmedTotal = signals.reduce((sum, signal) => sum + Number(signal.confirmed_count || 0), 0);
    foot.append(el('span', '', `${pendingTotal} pending signal${pendingTotal === 1 ? '' : 's'}`), el('span', '', `${confirmedTotal} confirmed signal${confirmedTotal === 1 ? '' : 's'}`));
    panel.append(heading, cloud, foot);
    stage.replaceChildren(panel);

    const patterns = document.querySelector('.pages-patterns');
    const shared = signals.filter((signal) => Number(signal.confirmed_count || 0) >= 5).map((signal) => signal.label);
    if (patterns && shared.length) {
      const text = patterns.querySelector('p');
      if (text) text.textContent = `Confirmed across five or more published stories: ${shared.join(' · ')}`;
    }
  } catch (error) {
    console.error('CorporateX live signal cloud could not load.', error);
  }
}

loadLiveSignals();
