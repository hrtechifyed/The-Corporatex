function clarifyContributorNavigation() {
  document.querySelectorAll('.cx-unified-account').forEach((link) => {
    link.setAttribute('href', '/The-Corporatex/account.html');
    const label = link.querySelector('span');
    if (label) label.textContent = 'My Stories';
    else if (!link.querySelector('svg')) link.textContent = 'My Stories';
  });

  document.querySelectorAll('.cx-unified-menu nav a').forEach((link) => {
    if (/^(Sign In|My Stories)$/i.test(link.textContent?.trim() || '')) {
      link.textContent = 'My Stories';
      link.setAttribute('href', '/The-Corporatex/account.html');
    }
  });
}

clarifyContributorNavigation();
queueMicrotask(clarifyContributorNavigation);
