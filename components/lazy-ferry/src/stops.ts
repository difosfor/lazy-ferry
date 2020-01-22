import { ItemOf } from './tsdef';

export const stops = [
  { name: 'Azartplein', lat: 52.377805, lon: 4.937406 },
  { name: 'Buiksloterweg', lat: 52.382182, lon: 4.903229 },
  { name: 'Centraal Station', lat: 52.379832, lon: 4.901298 },
  { name: 'Distelweg', lat: 52.395818, lon: 4.896403 },
  { name: 'IJplein', lat: 52.38171, lon: 4.908325 },
  { name: 'NDSM', lat: 52.401182, lon: 4.891249 },
  { name: 'Pontsteiger', lat: 52.391978, lon: 4.885786 },
  { name: 'Zamenhofstraat', lat: 52.384899, lon: 4.930784 },
] as const;

const stopNames = stops.map(stop => stop.name);

export type StopName = ItemOf<typeof stopNames>;
