import { journeys } from './journeys.js';

export const timetable = {};

for (const journey of journeys) {
  const { days, stops, trips } = journey;

  let i;
  // eslint-disable-next-line no-plusplus
  for (i = 0; i < stops.length - 1; i++) {
    const from = stops[i];

    if (!timetable[from]) {
      timetable[from] = {};
    }

    for (const day of days) {
      if (!timetable[from][day]) {
        timetable[from][day] = [];
      }

      for (const times of trips) {
        timetable[from][day].push({
          time: times[i],
          to: stops.slice(i + 1),
        });
      }
    }
  }
}

for (const stop of Object.keys(timetable)) {
  for (const day of Object.keys(timetable[stop])) {
    // eslint-disable-next-line no-nested-ternary
    timetable[stop][day].sort((a, b) => (a.time < b.time ? -1 : a.time > b.time ? 1 : 0));
  }
}
