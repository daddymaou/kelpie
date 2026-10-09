export type ArtUsage = 'hero' | 'doc-banner' | 'empty-state' | 'blog-card';
export type ArtTone = 'blue' | 'mono';

export interface ArtSlot {
	src: string;
	alt: string;
	focalPoint: string;
	tone: ArtTone;
	usage: ArtUsage[];
}

export const art = {
	hero: {
		src: '/art/hero.jpg',
		alt: 'A quiet, close-cropped portrait against a dark background',
		focalPoint: '76% 48%',
		tone: 'blue',
		usage: ['hero']
	},
	bannerA: {
		src: '/art/banner-a.jpg',
		alt: 'A weathered surface in close detail',
		focalPoint: '50% 48%',
		tone: 'blue',
		usage: ['doc-banner']
	},
	bannerB: {
		src: '/art/banner-b.jpg',
		alt: 'Fine lines and texture in a cropped monochrome study',
		focalPoint: '50% 42%',
		tone: 'mono',
		usage: ['doc-banner']
	},
	empty: {
		src: '/art/empty.jpg',
		alt: 'A cracked surface fading into shadow',
		focalPoint: '50% 50%',
		tone: 'mono',
		usage: ['empty-state']
	},
	card: {
		src: '/art/card.jpg',
		alt: 'A close detail of a steel-blue textured surface',
		focalPoint: '50% 50%',
		tone: 'blue',
		usage: ['blog-card']
	}
} satisfies Record<string, ArtSlot>;

export function artForUsage(usage: ArtUsage): ArtSlot | undefined {
	return Object.values(art).find((slot) => slot.usage.includes(usage));
}
