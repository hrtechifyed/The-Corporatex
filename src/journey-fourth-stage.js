function ensureFourthJourneyStage() {
  const signal = document.querySelector('.cx-unified-signal');
  if (!signal) return false;

  const milestones = signal.querySelectorAll(':scope > i');
  if (milestones.length >= 4) return true;

  for (let index = milestones.length; index < 4; index += 1) {
    signal.append(document.createElement('i'));
  }
  return true;
}

if (!ensureFourthJourneyStage()) {
  const observer = new MutationObserver(() => {
    if (ensureFourthJourneyStage()) observer.disconnect();
  });
  observer.observe(document.documentElement, { childList: true, subtree: true });
}
