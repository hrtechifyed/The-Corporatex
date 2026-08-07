import { ownedExperience } from '@/lib/auth';
import { ENDINGS } from '@/lib/endings';
import { updateContext } from './actions';

export default async function Context({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { experience } = await ownedExperience(id);
  const company = Array.isArray(experience.companies) ? experience.companies[0]?.display_name : experience.companies?.display_name;

  return (
    <div className="cx-page cx-journey">
      <div className="cx-shell">
        <div className="cx-journey-head cx-journey-head--solo">
          <div>
            <p className="cx-kicker">Edit the Scene</p>
            <h1 className="cx-title">Change the context, not your identity.</h1>
            <p className="cx-lede">Your saved Story Beats remain exactly where you left them.</p>
          </div>
        </div>

        <form action={updateContext.bind(null, id)} className="cx-journey-panel">
          <fieldset>
            <legend className="cx-kicker">Opening Signal</legend>
            <div className="cx-ending-choice-grid">
              {ENDINGS.map((ending) => (
                <label className="cx-ending-choice" data-ending={ending.slug} key={ending.value}>
                  <input type="radio" name="mainReason" value={ending.value} defaultChecked={experience.main_reason === ending.value} required />
                  <span className="cx-ending-choice__card"><strong>{ending.title}</strong><span>{ending.description}</span></span>
                </label>
              ))}
            </div>
          </fieldset>
          <div className="cx-form-grid" style={{ marginTop: '2rem' }}>
            <label className="cx-field"><span>Company · required</span><input className="cx-input" name="companyName" required minLength={2} maxLength={120} defaultValue={company || ''} /></label>
            <label className="cx-field"><span>Location · required</span><input className="cx-input" name="broadRegion" required minLength={2} maxLength={80} defaultValue={experience.broad_region || ''} /></label>
            <label className="cx-field"><span>Team or function · optional</span><input className="cx-input" name="broadFunction" maxLength={80} defaultValue={experience.broad_function || ''} /></label>
            <label className="cx-field"><span>Approximate tenure</span><select className="cx-select" name="approximateTenure" defaultValue={experience.approximate_tenure || '1–2 years'}><option>Less than 1 year</option><option>1–2 years</option><option>3–5 years</option><option>6–10 years</option><option>More than 10 years</option></select></label>
            <label className="cx-field"><span>Work arrangement</span><select className="cx-select" name="workArrangement" defaultValue={experience.work_arrangement || 'Hybrid'}><option>On-site</option><option>Hybrid</option><option>Remote</option></select></label>
          </div>
          <div className="cx-actions" style={{ justifyContent: 'flex-end' }}><button className="cx-button cx-button--signal" type="submit">Save and return to Story Beats →</button></div>
        </form>
      </div>
    </div>
  );
}
