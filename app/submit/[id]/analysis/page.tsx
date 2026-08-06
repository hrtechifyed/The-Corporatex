import { ownedExperience } from '@/lib/auth';
import { AnalysisRunner } from '@/components/analysis-runner';
import { CareerJarvis } from '@/components/career-jarvis';
import { endingFor } from '@/lib/endings';

export default async function Analysis({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { experience } = await ownedExperience(id);
  const ending = endingFor(experience.main_reason);

  return (
    <div className="cx-page cx-journey">
      <div className="cx-shell">
        <div className="cx-journey-head">
          <div>
            <p className="cx-kicker">Private transition</p>
            <h1 className="cx-title">Prepare the <em>Final Cut.</em></h1>
            <p className="cx-lede">CorporateX organises the saved Story Beats and checks a narrow set of safety indicators. Your meaning and final edit remain yours.</p>
            <ol className="cx-steps" aria-label="Story journey">
              <li><span>1</span>Opening Signal</li>
              <li><span>2</span>Set the Scene</li>
              <li><span>3</span>Story Beats</li>
              <li aria-current="step"><span>4</span>Final Cut</li>
            </ol>
          </div>
          <CareerJarvis
            compact
            pose="protecting"
            tone={ending.slug}
            dialogue="The screen checks harmful expressions and identifying details—not your opinion of the employer."
          />
        </div>
        <AnalysisRunner id={id} hasAnalysis={Boolean(experience.ai_analysis)} />
      </div>
    </div>
  );
}
