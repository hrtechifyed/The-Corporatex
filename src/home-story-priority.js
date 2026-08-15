const file = location.pathname.split('/').filter(Boolean).at(-1) || 'index.html';
const isHome = file === 'index.html' || file === 'The-Corporatex' || location.pathname.endsWith('/The-Corporatex/');

function prioritizePublishedStories() {
  if (!isHome) return;

  const hero = document.querySelector('.pages-hero');
  const stories = document.querySelector('.pages-stories');
  const archive = document.querySelector('.pages-archive');
  if (!hero || !stories || !archive) return;

  stories.classList.add('cx-home-stories-priority');
  if (hero.nextElementSibling !== stories) hero.after(stories);

  let guideSection = document.querySelector('.cx-home-story-guide-section');
  if (!guideSection) {
    guideSection = document.createElement('section');
    guideSection.className = 'pages-section cx-home-story-guide-section';
    guideSection.setAttribute('aria-label', 'How to read a CorporateX story');

    const shell = document.createElement('div');
    shell.className = 'pages-shell';
    shell.append(archive);
    guideSection.append(shell);
    stories.after(guideSection);
  } else if (!guideSection.contains(archive)) {
    guideSection.querySelector('.pages-shell')?.append(archive);
  }

  document.body.classList.add('cx-home-priority-ready');
}

prioritizePublishedStories();
