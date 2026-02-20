import type { ImageMetadata } from 'astro';
import battleShockedImg from './battle-shocked-printed.jpg';

export interface StandaloneDownload {
  label: string;
  description: string;
  url: string;
  host?: string;
  cover?: ImageMetadata;
  coverAlt?: string;
}

export const standaloneDownloads: StandaloneDownload[] = [
  {
    label: 'Battle Shock Token',
    description: 'Simple token for remembering which units are battle shocked. Hope it helps!',
    url: 'https://makerworld.com/en/models/2297300-battle-shock-token#profileId-2507076',
    host: 'MakerWorld',
    cover: battleShockedImg,
    coverAlt: 'A 3D-printed battle shock token',
  },
];
