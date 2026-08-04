import {describe,expect,it} from 'vitest';import {existsSync,readFileSync} from 'node:fs';
describe('brand assets',()=>{it('does not ship the invented HRTechify replacement',()=>{expect(existsSync('public/hrtechify-logo.svg')).toBe(false);expect(readFileSync('components/site-footer.tsx','utf8')).toContain('hrtechify-logo-original')})});
