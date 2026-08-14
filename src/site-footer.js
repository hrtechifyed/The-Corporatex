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
  tagline.textContent = 'Not a score. A sequence.';
  brand.append(brandLine, tagline);

  const links = document.createElement('nav');
  links.className = 'cx-footer-links';
  links.setAttribute('aria-label', 'Footer navigation');
  for (const [label, href] of [
    ['Privacy & Safety', 'privacy-safety.html'],
    ['Terms', 'terms.html'],
    ['Community Guidelines', 'community-guidelines.html'],
  ]) {
    const link = document.createElement('a');
    link.href = href;
    link.textContent = label;
    links.append(link);
  }

  const meta = document.createElement('div');
  meta.className = 'cx-footer-meta';
  const copyright = document.createElement('p');
  copyright.textContent = '© 2026 HRTechify. All rights reserved.';
  const perspective = document.createElement('p');
  perspective.textContent = 'Contributor stories reflect individual perspectives.';
  meta.append(copyright, perspective);

  inner.append(brand, links, meta);
  footer.append(inner);
}

mountCorporateXFooter();
