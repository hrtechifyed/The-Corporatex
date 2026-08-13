const ENDPOINT='https://otgnnkaawwwwqxlzrfpx.supabase.co/functions/v1/submit-feedback';
const sections=[...document.querySelectorAll('[data-feedback-section]')];
const ratings=[['poor','Needs work'],['okay','Okay'],['good','Good'],['great','Great']];
for(const card of sections){
  const section=card.dataset.feedbackSection;
  const controls=document.createElement('div');controls.className='cx-feedback-controls';
  const group=document.createElement('div');group.className='cx-feedback-ratings';group.setAttribute('role','radiogroup');group.setAttribute('aria-label',`${section} rating`);
  for(const [value,label] of ratings){const id=`fb-${section.replace(/\W+/g,'-').toLowerCase()}-${value}`;const wrap=document.createElement('label');wrap.className='cx-feedback-rating';wrap.innerHTML=`<input type="radio" name="${section}" value="${value}" id="${id}" /><span>${label}</span>`;group.append(wrap);}
  const textarea=document.createElement('textarea');textarea.maxLength=500;textarea.rows=2;textarea.placeholder='Optional short note…';textarea.setAttribute('aria-label',`${section} comment`);
  controls.append(group,textarea);card.append(controls);
}
const form=document.querySelector('[data-feedback-form]');const status=document.querySelector('[data-feedback-status]');
form.addEventListener('submit',async(event)=>{event.preventDefault();status.textContent='';const items=[];for(const card of sections){const checked=card.querySelector('input[type="radio"]:checked');const comment=card.querySelector('textarea').value.trim();if(checked)items.push({section:card.dataset.feedbackSection,rating:checked.value,comment});else if(comment){status.textContent=`Choose a quick rating for ${card.dataset.feedbackSection}.`;card.scrollIntoView({behavior:'smooth',block:'center'});return;}}
  if(!items.length){status.textContent='Choose at least one section to rate.';return;}
  const button=form.querySelector('button[type="submit"]');button.disabled=true;button.textContent='Sending…';
  try{const response=await fetch(ENDPOINT,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({items,sourcePath:location.pathname,companyWebsite:new FormData(form).get('companyWebsite')||''})});const data=await response.json().catch(()=>({}));if(!response.ok)throw new Error(data.error||'Could not submit feedback.');form.reset();status.textContent='Thank you — your feedback has been recorded.';}
  catch(error){status.textContent=error instanceof Error?error.message:'We could not send your feedback. Please try again.';}
  finally{button.disabled=false;button.textContent='Send feedback →';}
});