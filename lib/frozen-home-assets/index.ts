import hero1 from './hero-1';
import hero2 from './hero-2';
import hero3 from './hero-3';
import hero4 from './hero-4';
import hero5 from './hero-5';
import hero6 from './hero-6';
import hero7 from './hero-7';
import card1 from './card-1';
import card2 from './card-2';
import card3 from './card-3';
import card4 from './card-4';
import card5 from './card-5';

const webp = (value: string) => `data:image/webp;base64,${value}`;

export const FROZEN_HERO = webp(hero1 + hero2 + hero3 + hero4 + hero5 + hero6 + hero7);
export const FROZEN_CARDS = [webp(card1), webp(card2), webp(card3), webp(card4), webp(card5)] as const;
