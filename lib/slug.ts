export function slugify(value:string){return value.normalize('NFKD').replace(/[\u0300-\u036f]/g,'').toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'').slice(0,80)}
export function experienceUrl(company:string,story:string){return `/experience/${encodeURIComponent(company)}/${encodeURIComponent(story)}`}
