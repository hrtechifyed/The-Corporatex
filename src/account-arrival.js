const q=new URLSearchParams(location.search);
if(document.body.dataset.refPage==='account'&&q.get('submitted')==='1'){
  document.querySelector('[data-space-tab="submissions"]')?.click();
  const tabs=document.querySelector('.cx-space-tabs');
  if(tabs&&!document.querySelector('.cx-submit-arrival')){
    const n=document.createElement('div');
    n.className='cx-submit-arrival';
    n.setAttribute('role','status');
    n.style.cssText='display:grid;gap:5px;margin:0 0 18px;padding:14px 16px;border:1px solid rgba(246,200,79,.28);border-radius:14px;background:rgba(246,200,79,.065);color:#d8d1c7';
    n.innerHTML='<strong style="color:#f7d46e">Story received for moderation.</strong><span style="font-size:.8rem;line-height:1.55">Your submission is private. Track its status below. It appears in Explore Stories only after moderator approval.</span>';
    tabs.before(n);
  }
}