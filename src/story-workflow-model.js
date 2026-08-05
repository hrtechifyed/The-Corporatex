export const GUIDED_CHAPTERS = Object.freeze([
  {
    id: 'beginning',
    number: 1,
    title: 'The Beginning',
    teaser: 'What drew you in?',
    prompt: 'What first made this company or role feel worth joining?',
    helper: 'Think about the mission, people, role, opportunity, flexibility or moment that made you say yes.',
    placeholder: 'I joined because…',
    scene: 'growth',
    icon: '♥',
  },
  {
    id: 'promise',
    number: 2,
    title: 'The Promise',
    teaser: 'What did you expect?',
    prompt: 'What were you told—or what did you reasonably expect—before joining?',
    helper: 'You may mention growth, ownership, flexibility, pay, stability, learning or ways of working.',
    placeholder: 'Before I joined, I understood that…',
    scene: 'personal',
    icon: '★',
  },
  {
    id: 'good',
    number: 3,
    title: 'The Good Part',
    teaser: 'What genuinely worked?',
    prompt: 'What was valuable, positive or worth keeping from the experience?',
    helper: 'Honest stories can include good colleagues, meaningful work, learning, trust or support.',
    placeholder: 'What genuinely worked was…',
    scene: 'leadership',
    icon: '●',
  },
  {
    id: 'shift',
    number: 4,
    title: 'The Shift',
    teaser: 'What changed?',
    prompt: 'When did the experience begin to feel different?',
    helper: 'Describe a new manager, policy, workload, reorganisation, missed promise or gradual pattern.',
    placeholder: 'The experience began to change when…',
    scene: 'change',
    icon: '⚡',
  },
  {
    id: 'tipping',
    number: 5,
    title: 'The Tipping Point',
    teaser: 'Why did leaving become necessary?',
    prompt: 'What made leaving feel necessary rather than optional?',
    helper: 'This can be one event, a repeated pattern, a practical constraint or a personal limit.',
    placeholder: 'Leaving became necessary because…',
    scene: 'wellbeing',
    icon: '!',
  },
  {
    id: 'lesson',
    number: 6,
    title: 'The Lesson',
    teaser: 'What should a candidate ask?',
    prompt: 'What question could help a future candidate understand the reality before joining?',
    helper: 'Offer one practical question that reveals something a job description may not.',
    placeholder: 'Before joining, I would ask…',
    scene: 'compensation',
    icon: '?',
  },
  {
    id: 'ai',
    number: 7,
    title: 'The AI Chapter',
    teaser: 'Did technology change the work?',
    prompt: 'Did AI, automation or productivity technology affect your role or expectations?',
    helper: 'It may have helped, increased pressure, redesigned work, created learning—or had no impact.',
    placeholder: 'AI or automation affected the experience by…',
    scene: 'ai',
    icon: '⌘',
  },
  {
    id: 'fit',
    number: 8,
    title: 'Who Thrives Here?',
    teaser: 'Could someone still thrive?',
    prompt: 'Could someone still do well there under the right conditions?',
    helper: 'Consider the team, manager, career stage, pace, work style or expectations that may suit someone else.',
    placeholder: 'Someone could still thrive there if…',
    scene: 'personal',
    icon: '♟',
  },
]);

const GUIDED_CONTEXT_FIELDS = Object.freeze(['company', 'team', 'location']);

export function createGuidedState() {
  return {
    activeId: GUIDED_CHAPTERS[0].id,
    context: { company: '', team: '', location: '' },
    responses: Object.fromEntries(GUIDED_CHAPTERS.map((chapter) => [chapter.id, ''])),
    skipped: [],
  };
}

export function getChapter(id) {
  return GUIDED_CHAPTERS.find((chapter) => chapter.id === id) || null;
}

export function setActiveChapter(state, id) {
  if (!getChapter(id)) return state;
  return { ...state, activeId: id };
}

export function setGuidedContext(state, field, value) {
  if (!GUIDED_CONTEXT_FIELDS.includes(field)) return state;
  return {
    ...state,
    context: { ...state.context, [field]: String(value ?? '') },
  };
}

export function validateGuidedContext(context) {
  const company = String(context?.company || '').trim();
  const team = String(context?.team || '').trim();
  const location = String(context?.location || '').trim();
  const errors = {};
  if (!company) errors.company = 'Add the company or organisation name.';
  if (!location) errors.location = 'Add a city, country, region or remote location.';
  return {
    valid: Object.keys(errors).length === 0,
    errors,
    context: { company, team, location },
  };
}

export function setGuidedResponse(state, id, value) {
  if (!getChapter(id)) return state;
  const response = String(value ?? '');
  return {
    ...state,
    responses: { ...state.responses, [id]: response },
    skipped: response.trim() ? state.skipped.filter((chapterId) => chapterId !== id) : state.skipped,
  };
}

export function markGuidedSkipped(state, id) {
  if (!getChapter(id)) return state;
  return {
    ...state,
    responses: { ...state.responses, [id]: '' },
    skipped: state.skipped.includes(id) ? state.skipped : [...state.skipped, id],
  };
}

export function chapterStatus(state, id) {
  if (String(state.responses[id] || '').trim()) return 'answered';
  if (state.skipped.includes(id)) return 'skipped';
  return 'unanswered';
}

export function guidedProgress(state) {
  const answered = GUIDED_CHAPTERS.filter((chapter) => chapterStatus(state, chapter.id) === 'answered').length;
  const skipped = GUIDED_CHAPTERS.filter((chapter) => chapterStatus(state, chapter.id) === 'skipped').length;
  const completed = answered + skipped;
  return {
    answered,
    skipped,
    completed,
    total: GUIDED_CHAPTERS.length,
    percent: Math.round((completed / GUIDED_CHAPTERS.length) * 100),
  };
}

export function adjacentChapterId(id, direction = 1) {
  const index = GUIDED_CHAPTERS.findIndex((chapter) => chapter.id === id);
  if (index < 0) return GUIDED_CHAPTERS[0].id;
  const nextIndex = Math.min(GUIDED_CHAPTERS.length - 1, Math.max(0, index + direction));
  return GUIDED_CHAPTERS[nextIndex].id;
}

export function buildGuidedReview(state) {
  return GUIDED_CHAPTERS.map((chapter) => ({
    ...chapter,
    response: String(state.responses[chapter.id] || '').trim(),
    status: chapterStatus(state, chapter.id),
  }));
}

export function buildGuidedSubmission(state) {
  const validation = validateGuidedContext(state.context);
  return {
    valid: validation.valid,
    errors: validation.errors,
    context: validation.context,
    chapters: buildGuidedReview(state),
    progress: guidedProgress(state),
  };
}
