const ENDING_KEY = 'corporatexStoryEnding';
const endings = [
  { id: 'break-free', title: 'Break Free', copy: 'Leaving felt necessary — and brought relief.', image: 'frozen-assets/card-1.webp' },
  { id: 'next-act', title: 'Next Act', copy: 'It was a natural move forward, with no regrets.', image: 'frozen-assets/card-2.webp' },
  { id: 'mixed-ending', title: 'Mixed Ending', copy: 'The good and difficult parts both mattered.', image: 'frozen-assets/card-3.webp' },
  { id: 'pass-the-torch', title: 'Pass the Torch', copy: 'I left, but the right person could still thrive here.', image: 'frozen-assets/card-5.webp' },
];

const root = document.querySelector('[data-guided-workflow]');
const body = document.body;

function validEnding(value) {
  return endings.some((ending) => ending.id === value);
}

function markEndingStep() {
  const markers = [...root.querySelectorAll('[data-guided-step-marker]')];
  let endingMarker = root.querySelector('[data-guided-ending-marker]');
  if (!endingMarker && markers.length) {
    endingMarker = document.createElement('li');
    endingMarker.dataset.guidedEndingMarker = '';
    endingMarker.innerHTML = '<span>1</span>Choose the Ending';
    markers[0].before(endingMarker);
  }
  markers.forEach((marker, index) => {
    const number = marker.querySelector('span');
    if (number) number.textContent = String(index + 2);
  });
  if (!body.classList.contains('cx-guided-ending-selected')) {
    endingMarker?.setAttribute('aria-current', 'step');
    markers.forEach((marker) => marker.removeAttribute('aria-current'));
  }
}

function buildEndingPanel() {
  const panel = document.createElement('section');
  panel.className = 'cx-ending-panel';
  panel.dataset.guidedEndingPanel = '';
  panel.setAttribute('aria-labelledby', 'cx-ending-title');
  panel.innerHTML = `
    <div class="cx-ending-head">
      <p class="ref-editor-kicker">CHOOSE YOUR ENDING</p>
      <h2 id="cx-ending-title">How did this chapter <em>end?</em></h2>
      <p>Choose the ending that feels closest. It gives readers useful context without scoring the company.</p>
    </div>
    <div class="cx-ending-grid" role="list"></div>
    <p class="cx-ending-note">You can still describe all the nuance in your Story Beats. This choice is only a starting point.</p>`;
  const grid = panel.querySelector('.cx-ending-grid');
  endings.forEach((ending) => {
    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'cx-ending-card';
    button.dataset.ending = ending.id;
    button.setAttribute('role', 'listitem');
    button.innerHTML = `<span class="cx-ending-image"><img src="${ending.image}" alt="" /></span><span class="cx-ending-copy"><strong>${ending.title}</strong><span>${ending.copy}</span><b>Choose this ending →</b></span>`;
    button.addEventListener('click', () => chooseEnding(ending.id));
    grid.append(button);
  });
  return panel;
}

function chooseEnding(id, { fromQuery = false } = {}) {
  if (!validEnding(id)) return;
  localStorage.setItem(ENDING_KEY, id);
  root.dataset.ending = id;
  body.classList.add('cx-guided-ending-selected');
  const panel = root.querySelector('[data-guided-ending-panel]');
  if (panel) panel.hidden = true;
  root.querySelector('[data-guided-ending-marker]')?.removeAttribute('aria-current');
  const contextMarker = root.querySelector('[data-guided-step-marker="context"]');
  contextMarker?.setAttribute('aria-current', 'step');
  const context = root.querySelector('[data-guided-context]');
  if (context) context.hidden = false;
  if (!fromQuery) {
    const url = new URL(location.href);
    url.searchParams.set('ending', id);
    history.replaceState({}, '', `${url.pathname}${url.search}${url.hash}`);
  }
  requestAnimationFrame(() => context?.scrollIntoView({ behavior: 'smooth', block: 'start' }));
}

if (root) {
  const params = new URLSearchParams(location.search);
  const resuming = params.get('resume') === 'submit';
  const steps = root.querySelector('.ref-guided-steps');
  const panel = buildEndingPanel();
  steps?.after(panel);
  markEndingStep();

  if (resuming) {
    body.classList.add('cx-guided-ending-selected', 'cx-guided-resuming');
    panel.hidden = true;
  } else {
    const queryEnding = params.get('ending');
    if (validEnding(queryEnding)) chooseEnding(queryEnding, { fromQuery: true });
  }

  window.addEventListener('pageshow', () => {
    if (!body.classList.contains('cx-guided-ending-selected')) markEndingStep();
  });
}
