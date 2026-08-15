function mountCorporateXFooter() {
  const footer = document.querySelector('.site-footer, .pages-footer');
  if (!footer || footer.dataset.cxFooter === 'true') return;

  footer.dataset.cxFooter = 'true';
  footer.classList.remove('pages-footer');
  footer.classList.add('site-footer');
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
  brand.append(brandLine);

  const links = document.createElement('nav');
  links.className = 'cx-footer-links';
  links.setAttribute('aria-label', 'Footer navigation');
  for (const [label, href] of [
    ['Stories', 'stories.html'],
    ['How It Works', 'how-it-works.html'],
    ['Privacy', 'privacy-safety.html'],
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
  copyright.textContent = `© ${new Date().getFullYear()} HRTechify`;
  meta.append(copyright);

  inner.append(brand, links, meta);
  footer.append(inner);
}

mountCorporateXFooter();
