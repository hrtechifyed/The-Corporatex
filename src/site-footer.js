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
  links.style.columnGap = '8px';

  const navItems = [
    ['About', 'index.html#about'],
    ['Privacy', 'privacy-safety.html'],
    ['Contact', 'mailto:hrtechifyed@gmail.com'],
  ];

  navItems.forEach(([label, href], index) => {
    if (index > 0) {
      const separator = document.createElement('span');
      separator.textContent = '·';
      separator.setAttribute('aria-hidden', 'true');
      links.append(separator);
    }

    const link = document.createElement('a');
    link.href = href;
    link.textContent = label;
    links.append(link);
  });

  const meta = document.createElement('div');
  meta.className = 'cx-footer-meta';
  const copyright = document.createElement('p');
  copyright.textContent = '© 2026 HRTechify. All rights reserved.';
  meta.append(copyright);

  inner.append(brand, links, meta);
  footer.append(inner);
}

mountCorporateXFooter();
