function clarifyContributorNavigation() {
  document.querySelectorAll('.cx-unified-account').forEach((link) => {
    link.setAttribute('href', '/The-Corporatex/account.html');
    const label = link.querySelector('span');
    if (label) label.textContent = 'My Space';
    else if (!link.querySelector('svg')) link.textContent = 'My Space';
  });

  document.querySelectorAll('.cx-unified-menu nav a').forEach((link) => {
    if (/^(Sign In|My Stories|My Space)$/i.test(link.textContent?.trim() || '')) {
      link.textContent = 'My Space';
      link.setAttribute('href', '/The-Corporatex/account.html');
    }
  });
}

clarifyContributorNavigation();
queueMicrotask(clarifyContributorNavigation);
