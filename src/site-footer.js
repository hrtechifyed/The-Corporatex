function mountCorporateXFooter() {
  const footer = document.querySelector('.site-footer');
  if (!footer || footer.dataset.cxFooter === 'true') return;
  footer.dataset.cxFooter = 'true';
  footer.replaceChildren();

  const inner = document.createElement('div');
  inner.className = 'cx-footer-inner';

  const brand = document.createElement('div');
  brand.className = 'cx-footer-brand';
  const brandLine = document.createElement('strong');
  brandLine.append('CorporateX ');
  const byline = document.createElement('span');
  byline.textContent = 'by HRTechify';
  brandLine.append(byline);
  const tagline = document.createElement('p');
  tagline.textContent = 'Workplace stories, structured for better career decisions.';
  brand.append(brandLine, tagline);

  const links = document.createElement('nav');
  links.className = 'cx-footer-links';
  links.setAttribute('aria-label', 'Footer navigation');
  for (const [label, href] of [
    ['Stories', 'stories.html'],
    ['How It Works', 'how-it-works.html'],
    ['Privacy & Safety', 'privacy-safety.html'],
    ['Community Guidelines', 'community-guidelines.html'],
    ['Terms', 'terms.html'],
  ]) {
    const link = document.createElement('a');
    link.href = href;
    link.textContent = label;
    links.append(link);
  }

  const meta = document.createElement('div');
  meta.className = 'cx-footer-meta';
  const copyright = document.createElement('p');
  copyright.textContent = `© ${new Date().getFullYear()} HRTechify. All rights reserved.`;
  const perspective = document.createElement('p');
  perspective.textContent = 'Contributor stories reflect individual perspectives and are moderated before publication.';
  meta.append(copyright, perspective);

  inner.append(brand, links, meta);
  footer.append(inner);
}

mountCorporateXFooter();
