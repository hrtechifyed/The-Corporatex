import { ownedExperience } from '@/lib/auth';
import { GuidedEditor } from '@/components/guided-editor';
import { endingFor } from '@/lib/endings';

export default async function Guided({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { supabase, experience } = await ownedExperience(id);
  const { data } = await supabase
    .from('guided_answers')
    .select('question_key,answer')
    .eq('experience_id', id)
    .order('sort_order');
  const ending = endingFor(experience.main_reason);

  return (
    <div className="cx-page cx-journey">
      <div className="cx-shell">
        <p className="cx-kicker">Private story · {ending.title}</p>
        <h1 className="cx-title">Choose the moments that <em>matter.</em></h1>
        <p className="cx-lede">One scene at a time. Skip anything that does not belong in your story.</p>
        <ol className="cx-steps" aria-label="Story journey">
          <li><span>1</span>Opening Signal</li>
          <li><span>2</span>Set the Scene</li>
          <li aria-current="step"><span>3</span>Story Beats</li>
          <li><span>4</span>Final Cut</li>
        </ol>
        <GuidedEditor id={id} saved={data || []} ending={ending.slug} />
      </div>
    </div>
  );
}
