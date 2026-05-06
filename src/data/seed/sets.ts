import type { CollectionSet } from '../types';

export const seedSets: CollectionSet[] = [
  {
    id: 'forgotten-women',
    name: 'Forgotten Women',
    description:
      'Three subjects whose stories were censored, sidelined, or marketed past until somebody had to put them back together.',
    topicIds: ['hatshepsut-erasure', 'hedy-lamarr-frequency-hopping', 'inanna-descent'],
    rewardSwagId: 'frame-foundling',
    coverImage: 'https://picsum.photos/seed/forgotten-women-set/1200/800',
  },
  {
    id: 'lost-and-found',
    name: 'Lost & Found',
    description:
      'Knowledge that disappeared and came back. Three things humanity nearly never saw again.',
    topicIds: ['antikythera-mechanism', 'ramanujan-lost-notebook', 'ashurbanipal-library'],
    rewardSwagId: 'badge-archivist',
    coverImage: 'https://picsum.photos/seed/lost-and-found-set/1200/800',
  },
  {
    id: 'cosmic-mysteries',
    name: 'Cosmic Mysteries',
    description:
      'Three things from the dark sky that we still cannot fully explain. The first one is still flying.',
    topicIds: ['voyager-golden-record', 'tunguska-event', 'wow-signal'],
    rewardSwagId: 'title-stargazer',
    coverImage: 'https://picsum.photos/seed/cosmic-mysteries-set/1200/800',
  },
];
