/* eslint-env node */
/* eslint-disable no-console, import/no-extraneous-dependencies, no-await-in-loop */

const fs = require('fs');
const path = require('path');
const prettier = require('prettier');
const prettierOptions = require('../prettier.config.js');

// Note: I got this API key by opening: https://reisinfo.gvb.nl/nl/lijnen/905
// and then clicking "Bekijk dienstregeling"
// and then noticing the X-Api-Key header used there
// I don't yet know how to obtain one myself etc.
const API_KEY = '92e62dcf-42c3-40ba-a8dd-b28aba2888b3';

const CACHE_DIR = 'scrape-cache';
const JS_FILENAME = 'components/lazy-ferry/src/timetable.ts';

function writeFile(filePath, text) {
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
  fs.writeFileSync(filePath, text, 'utf8');
}

async function apiGet(url, init) {
  const apiPath = url.replace('https://maps.gvb.nl/', '');
  const cachePath = `${CACHE_DIR}/${apiPath}`;

  try {
    const text = fs.readFileSync(cachePath, 'utf8');
    return JSON.parse(text);
  } catch (e) {
    // uncached url
  }

  const response = await fetch(url, init);
  if (!response.ok) {
    return new Error(
      `GET ${apiPath} ${response.status} ${response.statusText}`,
    );
  }
  const obj = await response.json();

  writeFile(cachePath, JSON.stringify(obj, null, '  '));

  return obj;
}

async function getUrls(line) {
  const result = await apiGet(
    `https://maps.gvb.nl/api/v1/timetable_validities?linenumber=${line}&include=timetables`,
    { headers: { 'X-Api-Key': API_KEY } },
  );
  if (result.linked === undefined) {
    console.log('undefined result for line:', line);
    return [];
  }
  return result.linked.timetables.map(table => table.jsonUrl);
}

async function getJourney(url) {
  const result = await apiGet(url);
  if (result instanceof Error) {
    // TODO: Avoid trying to fetch these in the first place
    // E.g: Update to using new API?
    console.log('Failed to fetch journey', result.message);
    return undefined;
  }

  const {
    line,
    validFor,
    journey: { stops },
    trips,
  } = result;

  const days = [];
  for (const day of validFor) {
    if (day === 'weekdays') {
      days.push('monday', 'tuesday', 'wednesday', 'thursday', 'friday');
    } else {
      days.push(day);
    }
  }

  const stopNames = stops.map(stop => stop.name);
  const tripTimes = trips.map(trip => trip.times);
  return {
    line: line.number,
    days,
    stops: stopNames,
    trips: tripTimes,
  };
}

async function getJourneys() {
  // const lines = [900, 901, 902, 903, 905, 906, 907, 915];
  // 905 and 907 are undefined now; let's try to use these new(?) line names
  const lines = ['F1', 'F2', 'F3', 'F4', 'F6', 'F7'];
  const journeys = [];
  for (const line of lines) {
    const urls = await getUrls(line);
    for (const url of urls) {
      const journey = await getJourney(url);
      // console.log(journey);
      // TODO: Figure out why some of the specified urls return 404
      // For now let's just skip that data; that does result in timetable.ts going down in size from 569K to 289K though
      if (journey) {
        journeys.push(journey);
      }
    }
  }
  return journeys;
}

async function getTimetable() {
  const journeys = await getJourneys();

  const timetable = {};

  for (const journey of journeys) {
    const { days, stops, trips } = journey;

    let i;
    // eslint-disable-next-line no-plusplus
    for (i = 0; i < stops.length - 1; i++) {
      const from = stops[i];

      if (!timetable[from]) {
        timetable[from] = {
          monday: [],
          tuesday: [],
          wednesday: [],
          thursday: [],
          friday: [],
          saturday: [],
          sunday: [],
        };
      }

      // TODO: Bump times 24:00:00 and later to next day
      // P.e: monday 24:30:00 => tuesday 00:30:00
      for (const day of days) {
        for (const times of trips) {
          // Filter out duplicates
          // TODO: Prevent duplicates from ending up here in the first place (find root cause)
          // TODO: See if we can optimize timetable storage a bit, e.g: make a special case for weekdays
          const trip = {
            time: times[i],
            line: journey.line,
            to: stops.slice(i + 1),
          };
          const tripStr = JSON.stringify(trip);
          const exists = timetable[from][day].some(
            _trip => JSON.stringify(_trip) === tripStr,
          );
          if (!exists) {
            timetable[from][day].push(trip);
          }
        }
      }
    }
  }

  for (const stop of Object.keys(timetable)) {
    for (const day of Object.keys(timetable[stop])) {
      timetable[stop][day].sort((a, b) =>
        // eslint-disable-next-line no-nested-ternary
        a.time < b.time ? -1 : a.time > b.time ? 1 : 0,
      );
    }
  }

  return timetable;
}

async function main() {
  const timetable = await getTimetable();

  const js = prettier.format(
    `import { StopName } from './stops';
import { Weekday } from './weekdays';

export interface Trip {
  time: string;
  line: string;
  to: StopName[];
}

type Timetable = {
  [key in StopName]: {
    [key in Weekday]: Trip[];
  };
};

export const timetable: Timetable = ${JSON.stringify(timetable)};
`,
    {
      ...prettierOptions,
      parser: 'typescript',
    },
  );

  writeFile(JS_FILENAME, js);
}

main().then(
  () => console.log('Done.'),
  error => {
    console.error(error);
    process.exit(1);
  },
);
