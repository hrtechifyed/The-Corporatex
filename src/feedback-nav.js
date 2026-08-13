const feedbackHref='/The-Corporatex/feedback.html';
function addFeedbackNav(){
  const desktop=document.querySelector('.cx-unified-nav');
  if(desktop&&!desktop.querySelector('[data-cx-route="feedback"]')){
    const account=desktop.querySelector('.cx-unified-account');
    const link=document.createElement('a');link.href=feedbackHref;link.dataset.cxRoute='feedback';link.textContent='Feedback';
    if(location.pathname.endsWith('/feedback.html'))link.setAttribute('aria-current','page');
    desktop.insertBefore(link,account||null);
  }
  const mobile=document.querySelector('.cx-unified-menu nav');
  if(mobile&&!mobile.querySelector('[data-cx-route="feedback"]')){
    const link=document.createElement('a');link.href=feedbackHref;link.dataset.cxRoute='feedback';link.textContent='Feedback';
    if(location.pathname.endsWith('/feedback.html'))link.setAttribute('aria-current','page');
    const account=[...mobile.querySelectorAll('a')].find(a=>a.textContent.trim()==='My Space');
    mobile.insertBefore(link,account||null);
  }
}
addFeedbackNav();
queueMicrotask(addFeedbackNav);