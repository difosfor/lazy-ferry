import { ItemOf } from './tsdef';

export const weekdays = [
  'sunday',
  'monday',
  'tuesday',
  'wednesday',
  'thursday',
  'friday',
  'saturday',
] as const;

export type Weekday = ItemOf<typeof weekdays>;
