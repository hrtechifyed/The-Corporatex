import {describe,expect,it} from 'vitest';import {experienceUrl,slugify} from '@/lib/slug';
describe('shareable routes',()=>{it('creates stable URL-safe paths',()=>expect(experienceUrl(slugify('Fictional Co.'),'my-story-123')).toBe('/experience/fictional-co/my-story-123'))});
