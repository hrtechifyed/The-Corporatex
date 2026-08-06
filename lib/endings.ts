export const ENDINGS = [
  {
    value: 'Break Free',
    slug: 'break-free',
    title: 'Break Free',
    description: 'Leaving felt necessary—and brought relief.',
    guidance: 'A boundary, risk or mismatch made moving on the right decision.',
  },
  {
    value: 'Next Act',
    slug: 'next-act',
    title: 'Next Act',
    description: 'It was a natural move forward, with no regrets.',
    guidance: 'The chapter ended well and another opportunity became the next step.',
  },
  {
    value: 'Mixed Ending',
    slug: 'mixed-ending',
    title: 'Mixed Ending',
    description: 'The good and difficult parts both mattered.',
    guidance: 'The experience deserves nuance rather than a simple positive or negative verdict.',
  },
  {
    value: 'Pass the Torch',
    slug: 'pass-the-torch',
    title: 'Pass the Torch',
    description: 'I left, but the right person could thrive here.',
    guidance: 'The role or employer may be a strong fit for someone with the right expectations.',
  },
] as const;

export type EndingValue = typeof ENDINGS[number]['value'];
export type EndingSlug = typeof ENDINGS[number]['slug'];

export function endingFor(value: string | null | undefined) {
  return ENDINGS.find((ending) => ending.value === value) || ENDINGS[2];
}
