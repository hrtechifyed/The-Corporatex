import { randomInt } from 'node:crypto';
const ALPHABET='ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
export function generateHrtId(){let value='HRT-';for(let i=0;i<9;i++)value+=ALPHABET[randomInt(ALPHABET.length)];return value}
export async function allocateHrtId(exists:(id:string)=>Promise<boolean>,attempts=8){for(let i=0;i<attempts;i++){const id=generateHrtId();if(!await exists(id))return id}throw new Error('Unable to allocate an anonymous identity')}
export const HRT_PATTERN=/^HRT-[A-HJ-NP-Z2-9]{9}$/;
