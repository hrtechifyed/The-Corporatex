import { redirect } from 'next/navigation';
import { ownedExperience } from '@/lib/auth';
import { ReviewEditor } from '@/components/review-editor';
import { analysisSchema } from '@/lib/schemas';
import { endingFor } from '@/lib/endings';

export default async function Review({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { supabase, experience } = await ownedExperience(id);
  if (!experience.ai_analysis) redirect(`/submit/${id}/analysis`);
  const parsed = analysisSchema.parse(experience.ai_analysis);
  const { data: answers } = await supabase
    .from('guided_answers')
    .select('question_key,answer')
    .eq('experience_id', id)
    .order('sort_order');
  const original = [experience.original_text, ...(answers || []).map((answer) => `${answer.question_key.replaceAll('_', ' ')}\n${answer.answer}`)]
    .filter(Boolean)
    .join('\n\n');
  const ending = endingFor(experience.main_reason);

  return (
    <div className="cx-page cx-journey">
      <div className="cx-shell">
        <div className="cx-journey-head cx-journey-head--solo">
          <div>
            <p className="cx-kicker">The Final Cut · Private</p>
            <h1 className="cx-title">Read it as someone else will.</h1>
            <p className="cx-lede">This is your account. Edit, remove or restore any scene before release.</p>
            <ol className="cx-steps" aria-label="Story journey">
              <li><span>1</span>Opening Signal</li>
              <li><span>2</span>Set the Scene</li>
              <li><span>3</span>Story Beats</li>
              <li aria-current="step"><span>4</span>Final Cut</li>
            </ol>
          </div>
        </div>
        {parsed.seriousTopic ? <aside className="cx-journey-panel cx-note">Sensitive material was detected. Review the neutral wording and identity details with particular care.</aside> : null}
        <ReviewEditor id={id} original={original} initial={parsed} ending={ending.title} />
      </div>
    </div>
  );
}
