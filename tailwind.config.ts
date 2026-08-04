import type { Config } from 'tailwindcss';
export default { content:['./app/**/*.{ts,tsx}','./components/**/*.{ts,tsx}'], theme:{extend:{colors:{ink:'#140d12',paper:'#f2e8d8',ember:'#ed6a29',signal:'#ffc75c'},fontFamily:{sans:['var(--font-sans)']}}}, plugins:[] } satisfies Config;
