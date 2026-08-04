const primaryReasons = [
  ['💰', 'Compensation'],
  ['↗', 'Career growth'],
  ['🧭', 'Manager / leadership'],
  ['🌐', 'Work culture'],
  ['⚠', 'Workplace harassment'],
  ['↻', 'Layoff / restructuring'],
  ['⇄', 'Role change'],
  ['🌅', 'Retirement'],
  ['📍', 'Location / relocation constraints'],
  ['◇', 'Personal reasons'],
  ['🌙', 'Work-life balance / burnout'],
  ['♡', 'Health / wellbeing'],
  ['🚪', 'Better opportunity'],
  ['▣', 'Job security'],
  ['⚖', 'Values mismatch'],
  ['📚', 'Learning / skill stagnation'],
  ['✦', 'AI / automation impact'],
  ['…', 'Other'],
];

const secondaryReasons = [
  ['💰', 'Compensation'],
  ['↗', 'Career growth'],
  ['🧭', 'Manager'],
  ['⚡', 'Team conflict'],
  ['◉', 'Leadership trust'],
  ['▤', 'Workload'],
  ['🌙', 'Burnout'],
  ['✧', 'Lack of recognition'],
  ['☁', 'Toxic culture'],
  ['⚠', 'Harassment / discrimination'],
  ['⏱', 'Performance pressure'],
  ['📍', 'Location / commute'],
  ['⌂', 'Remote / hybrid mismatch'],
  ['⇄', 'Role drift'],
  ['?', 'Lack of clarity'],
  ['↻', 'Layoff fear'],
  ['◇', 'Personal / family situation'],
  ['🌅', 'Retirement planning'],
  ['♡', 'Health reasons'],
  ['✦', 'AI-driven role pressure'],
  ['…', 'Other'],
];

const storyBeats = [
  {
    id: 'attracted',
    chapter: '01 · THE OPENING PULL',
    title: 'What drew you in?',
    prompt: 'What first made this company feel like the right next chapter?',
    placeholder: 'The role, mission, people, promise or opportunity that caught your attention…',
  },
  {
    id: 'promised',
    chapter: '02 · THE PROMISE',
    title: 'What did you expect?',
    prompt: 'What were you told, shown or led to believe would be true?',
    placeholder: 'Growth, flexibility, ownership, leadership support, stability…',
  },
  {
    id: 'worked',
    chapter: '03 · THE BRIGHT PART',
    title: 'What genuinely worked?',
    prompt: 'What was good in the beginning—or remained good even when other things changed?',
    placeholder: 'A strong team, meaningful work, a great manager, learning, trust…',
  },
  {
    id: 'changed',
    chapter: '04 · THE SHIFT',
    title: 'When did the story turn?',
    prompt: 'Describe the moment, pattern or slow change that altered the experience.',
    placeholder: 'A leadership change, a missed promise, new pressure, a reorganisation…',
  },
  {
    id: 'necessary',
    chapter: '05 · THE POINT OF NO RETURN',
    title: 'Why did leaving become necessary?',
    prompt: 'What made staying feel harder, riskier or less honest than moving on?',
    placeholder: 'The final conversation, repeated pattern, personal limit or practical reality…',
  },
  {
    id: 'candidate',
    chapter: '06 · THE QUESTION TO ASK',
    title: 'What should a candidate investigate?',
    prompt: 'Give the next person one question that could reveal what the job description cannot.',
    placeholder: 'Ask how promotions are decided, how workload is measured, what changed after the last reorganisation…',
  },
  {
    id: 'recommend',
    chapter: '07 · THE RIGHT-FIT CAVEAT',
    title: 'Could someone still thrive there?',
    prompt: 'Would you recommend this employer to certain people, teams or career stages?',
    placeholder: 'It may suit someone who values…, works best under…, or joins a particular team…',
  },
  {
    id: 'ai-impact',
    chapter: '08 · THE AI CHAPTER',
    title: 'Did technology change the work?',
    prompt: 'Did AI, automation or rising productivity expectations affect workload, learning, role security or team size?',
    placeholder: 'AI removed repetitive work, increased output expectations, changed roles, enabled learning—or had no impact…',
  },
];

function slugify(value) {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
}

function renderReasonOptions(reasons, type, name) {
  return reasons.map(([icon, label]) => {
    const id = `${name}-${slugify(label)}`;
    return `
      <label class="reason-chip" for="${id}">
        <input id="${id}" type="${type}" name="${name}" value="${label}" />
        <span class="reason-icon" aria-hidden="true">${icon}</span>
        <span class="reason-label">${label}</span>
        <span class="reason-check" aria-hidden="true">✓</span>
      </label>`;
  }).join('');
}

function renderStoryBeats() {
  return storyBeats.map((beat) => `
    <label class="story-beat" for="story-${beat.id}">
      <span class="story-beat-chapter">${beat.chapter}</span>
      <strong>${beat.title}</strong>
      <span>${beat.prompt}</span>
      <textarea id="story-${beat.id}" name="${beat.id}" rows="4" maxlength="700" placeholder="${beat.placeholder}"></textarea>
      <small><span data-count-for="story-${beat.id}">0</span>/700 · One line is enough. A chapter is welcome.</small>
    </label>`).join('');
}

function initStoryFlow() {
  const promptSection = document.querySelector('#share');
  if (!promptSection) return;

  if (!document.querySelector('link[href$="story-flow.css"]')) {
    const stylesheet = document.createElement('link');
    stylesheet.rel = 'stylesheet';
    stylesheet.href = 'src/story-flow.css';
    document.head.append(stylesheet);
  }

  promptSection.innerHTML = `
    <div class="prompt-glow" aria-hidden="true"></div>
    <div class="story-flow-shell">
      <aside class="story-flow-intro">
        <p class="eyebrow">YOUR EXIT, TOLD AS A STORY</p>
        <h2>Find the reason.<br /><em>Follow the turning point.</em></h2>
        <p>Most exits are not one sentence. Start with the clearest reason, add the forces around it, then capture only the moments that matter.</p>
        <div class="story-flow-promise">
          <span aria-hidden="true">✦</span>
          <p><strong>Light by design.</strong><br />Choose, reflect, write. Skip any prompt that does not belong to your story.</p>
        </div>
        <ol class="story-flow-map" aria-label="Story creation steps">
          <li class="is-active" data-map-step="1"><span>1</span><div><b>The turning point</b><small>Name the main reason.</small></div></li>
          <li data-map-step="2"><span>2</span><div><b>The forces around it</b><small>Add the contributing reasons.</small></div></li>
          <li data-map-step="3"><span>3</span><div><b>The story arc</b><small>Capture the moments that matter.</small></div></li>
        </ol>
      </aside>

      <form class="story-builder" novalidate>
        <div class="story-builder-progress" aria-hidden="true"><i></i></div>
        <p class="story-step-kicker">PRIVATE STORY MAP · <span data-step-label>STEP 1 OF 3</span></p>

        <fieldset class="story-step" data-story-step="1">
          <legend>Name the turning point.</legend>
          <p class="story-step-lede">Every ending has a headline. Choose the reason that best explains yours.</p>
          <div class="reason-grid primary-reasons" role="radiogroup" aria-label="Primary reason for leaving">
            ${renderReasonOptions(primaryReasons, 'radio', 'primaryReason')}
          </div>
          <label class="other-reason" data-other-primary hidden>
            <span>Write your own headline</span>
            <input type="text" name="primaryOther" maxlength="80" placeholder="A reason that is uniquely yours…" />
          </label>
          <p class="story-form-error" data-primary-error hidden>Please choose the reason that sits closest to the centre of your exit.</p>
          <div class="story-step-actions align-end">
            <button class="button button-primary" type="button" data-next-step="2">Follow the story <span>→</span></button>
          </div>
        </fieldset>

        <fieldset class="story-step" data-story-step="2" hidden>
          <legend>What else moved the story?</legend>
          <p class="story-step-lede">Most exits are not one-note. Add the pressures, pivots or personal realities that shaped the final decision.</p>
          <p class="story-step-hint">Choose as many as feel true. Three to five is usually enough.</p>
          <div class="reason-grid secondary-reasons" aria-label="Contributing reasons for leaving">
            ${renderReasonOptions(secondaryReasons, 'checkbox', 'secondaryReasons')}
          </div>
          <label class="other-reason" data-other-secondary hidden>
            <span>Add another thread</span>
            <input type="text" name="secondaryOther" maxlength="80" placeholder="Something the list did not capture…" />
          </label>
          <div class="story-step-actions">
            <button class="button story-back" type="button" data-back-step="1">← Back</button>
            <button class="button button-primary" type="button" data-next-step="3">Build the story arc <span>→</span></button>
          </div>
        </fieldset>

        <fieldset class="story-step" data-story-step="3" hidden>
          <legend>Tell the arc, not just the ending.</legend>
          <p class="story-step-lede">Pick up the moments that matter. Write a line or a chapter—skip any beat that does not belong to your story.</p>
          <div class="story-reason-recap">
            <div><small>THE HEADLINE REASON</small><strong data-primary-summary>Not selected</strong></div>
            <div><small>THE THREADS BENEATH IT</small><span data-secondary-summary>None selected—and that is okay.</span></div>
          </div>
          <div class="story-beats-grid">
            ${renderStoryBeats()}
          </div>
          <div class="story-step-actions">
            <button class="button story-back" type="button" data-back-step="2">← Back</button>
            <button class="button button-primary" type="submit">Save my private story map <span>→</span></button>
          </div>
          <p class="form-note">🔒 This prototype keeps the story private and does not publish anything.</p>
        </fieldset>
      </form>
    </div>`;

  const form = promptSection.querySelector('.story-builder');
  const steps = [...form.querySelectorAll('[data-story-step]')];
  const mapItems = [...promptSection.querySelectorAll('[data-map-step]')];
  const progressBar = form.querySelector('.story-builder-progress i');
  const stepLabel = form.querySelector('[data-step-label]');
  const primaryError = form.querySelector('[data-primary-error]');
  const primaryOther = form.querySelector('[data-other-primary]');
  const secondaryOther = form.querySelector('[data-other-secondary]');

  const selectedLabel = (input) => input?.closest('.reason-chip')?.querySelector('.reason-label')?.textContent?.trim() || '';

  function toggleOtherFields() {
    const primaryOtherSelected = form.querySelector('input[name="primaryReason"][value="Other"]')?.checked;
    const secondaryOtherSelected = form.querySelector('input[name="secondaryReasons"][value="Other"]')?.checked;
    primaryOther.hidden = !primaryOtherSelected;
    secondaryOther.hidden = !secondaryOtherSelected;
    primaryOther.querySelector('input').disabled = !primaryOtherSelected;
    secondaryOther.querySelector('input').disabled = !secondaryOtherSelected;
  }

  function updateSummary() {
    const primaryInput = form.querySelector('input[name="primaryReason"]:checked');
    let primaryText = selectedLabel(primaryInput) || 'Not selected';
    if (primaryText === 'Other') {
      primaryText = form.elements.primaryOther.value.trim() || 'Other';
    }

    const secondaryInputs = [...form.querySelectorAll('input[name="secondaryReasons"]:checked')];
    const secondaryText = secondaryInputs.map((input) => {
      const label = selectedLabel(input);
      if (label === 'Other') return form.elements.secondaryOther.value.trim() || 'Other';
      return label;
    }).filter(Boolean);

    form.querySelector('[data-primary-summary]').textContent = primaryText;
    form.querySelector('[data-secondary-summary]').textContent = secondaryText.length
      ? secondaryText.join(' · ')
      : 'None selected—and that is okay.';
  }

  function showStep(stepNumber, focus = true) {
    steps.forEach((step) => {
      step.hidden = Number(step.dataset.storyStep) !== stepNumber;
    });
    mapItems.forEach((item) => {
      const itemStep = Number(item.dataset.mapStep);
      item.classList.toggle('is-active', itemStep === stepNumber);
      item.classList.toggle('is-complete', itemStep < stepNumber);
    });
    progressBar.style.width = `${(stepNumber / steps.length) * 100}%`;
    stepLabel.textContent = `STEP ${stepNumber} OF ${steps.length}`;
    if (stepNumber === 3) updateSummary();
    if (focus) {
      const activeLegend = form.querySelector(`[data-story-step="${stepNumber}"] legend`);
      activeLegend.setAttribute('tabindex', '-1');
      activeLegend.focus({ preventScroll: true });
      promptSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }

  form.addEventListener('change', (event) => {
    if (event.target.matches('input[name="primaryReason"]')) {
      primaryError.hidden = true;
    }
    if (event.target.matches('input[name="primaryReason"], input[name="secondaryReasons"]')) {
      toggleOtherFields();
      updateSummary();
    }
  });

  form.addEventListener('input', (event) => {
    if (event.target.matches('textarea')) {
      const counter = form.querySelector(`[data-count-for="${event.target.id}"]`);
      if (counter) counter.textContent = String(event.target.value.length);
    }
    if (event.target.matches('input[name="primaryOther"], input[name="secondaryOther"]')) {
      updateSummary();
    }
  });

  form.addEventListener('click', (event) => {
    const nextButton = event.target.closest('[data-next-step]');
    const backButton = event.target.closest('[data-back-step]');

    if (nextButton) {
      const nextStep = Number(nextButton.dataset.nextStep);
      if (nextStep === 2 && !form.querySelector('input[name="primaryReason"]:checked')) {
        primaryError.hidden = false;
        form.querySelector('input[name="primaryReason"]').focus();
        return;
      }
      showStep(nextStep);
    }

    if (backButton) showStep(Number(backButton.dataset.backStep));
  });

  form.addEventListener('submit', (event) => {
    event.preventDefault();
    updateSummary();
    const primaryReason = form.querySelector('[data-primary-summary]').textContent;
    const toast = document.querySelector('.toast');
    if (toast) {
      toast.textContent = `Your private story map now has a centre: ${primaryReason}. Nothing has been published.`;
      toast.classList.add('show');
      window.setTimeout(() => toast.classList.remove('show'), 4200);
    }
  });

  toggleOtherFields();
  showStep(1, false);
}

initStoryFlow();
