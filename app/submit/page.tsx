import { createDraft } from './actions';
import { OpeningSignalSelector } from '@/components/opening-signal-selector';
import { ENDINGS } from '@/lib/endings';

export default function Submit() {
  return (
    <div className="cx-page cx-journey">
      <div className="cx-shell">
        <div className="cx-journey-head cx-journey-head--solo">
          <div>
            <p className="cx-kicker">Share Your Story · Private draft</p>
            <h1 className="cx-title">Begin with the <em>ending.</em></h1>
            <p className="cx-lede">Your exit does not need to be positive or negative to be useful. Choose the closest ending, then set the scene.</p>
            <ol className="cx-steps" aria-label="Story journey">
              <li aria-current="step"><span>1</span>Opening Signal</li>
              <li><span>2</span>Set the Scene</li>
              <li><span>3</span>Story Beats</li>
              <li><span>4</span>Final Cut</li>
            </ol>
          </div>
        </div>

        <form action={createDraft} className="cx-journey-panel">
          <OpeningSignalSelector endings={ENDINGS} />

          <section id="set-the-scene" className="cx-set-the-scene" tabIndex={-1}>
            <p className="cx-kicker">Set the Scene</p>
            <h2 className="cx-title">Where did this story unfold?</h2>
            <p className="cx-note">Give readers the setting—not anyone’s identity. Do not name colleagues or include confidential records.</p>
            <div className="cx-form-grid" style={{ marginTop: '1.5rem' }}>
              <label className="cx-field">
                <span>Company · required</span>
                <input className="cx-input" name="companyName" required minLength={2} maxLength={120} autoComplete="organization" placeholder="e.g. Northstar Technologies" />
              </label>
              <label className="cx-field">
                <span>Location · required</span>
                <input className="cx-input" name="broadRegion" required minLength={2} maxLength={80} autoComplete="country-name" placeholder="e.g. Bengaluru, India or Remote — Europe" />
              </label>
              <label className="cx-field">
                <span>Team or function · optional</span>
                <input className="cx-input" name="broadFunction" maxLength={80} placeholder="e.g. Product, Sales or People" />
              </label>
              <label className="cx-field">
                <span>Approximate tenure</span>
                <select className="cx-select" name="approximateTenure" defaultValue="1–2 years">
                  <option>Less than 1 year</option>
                  <option>1–2 years</option>
                  <option>3–5 years</option>
                  <option>6–10 years</option>
                  <option>More than 10 years</option>
                </select>
              </label>
              <label className="cx-field">
                <span>Work arrangement</span>
                <select className="cx-select" name="workArrangement" defaultValue="Hybrid">
                  <option>On-site</option>
                  <option>Hybrid</option>
                  <option>Remote</option>
                </select>
              </label>
            </div>
          </section>

          <div className="cx-actions" style={{ justifyContent: 'flex-end' }}>
            <button className="cx-button cx-button--signal" type="submit">Enter the Story Beats <span aria-hidden="true">→</span></button>
          </div>
          <p className="cx-note">You will sign in by private magic link when the draft is created. Your email never appears on the public story.</p>
        </form>
      </div>
    </div>
  );
}
