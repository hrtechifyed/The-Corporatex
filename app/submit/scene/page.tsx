import { ValidatedSceneStep } from '@/components/validated-scene-step';

type SceneSearchParams = Promise<Record<string, string | string[] | undefined>>;

export default async function SetTheScenePage({ searchParams }: { searchParams: SceneSearchParams }) {
  const params = await searchParams;
  const endingSlug = typeof params.ending === 'string' ? params.ending : undefined;
  const fromHome = params.from === 'home';

  return <ValidatedSceneStep endingSlug={endingSlug} fromHome={fromHome} />;
}
