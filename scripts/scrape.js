/* eslint-env node */
/* eslint-disable no-console, import/no-extraneous-dependencies, no-await-in-loop */

const fetch = require('node-fetch');
const fs = require('fs');
const path = require('path');
const prettier = require('prettier');
const prettierOptions = require('../node_modules/@open-wc/prettier-config/prettier.config.js');

// Note: I got this API key by opening: https://reisinfo.gvb.nl/nl/lijnen/905
// and then clicking "Bekijk dienstregeling"
// and then noticing the X-Api-Key header used there
// I don't yet know how to obtain one myself etc.
const API_KEY = '92e62dcf-42c3-40ba-a8dd-b28aba2888b3';

const CACHE_DIR = 'scrape-cache';
const JS_FILENAME = 'components/lazy-ferry/src/journeys.js';

function writeFile(filePath, text) {
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
  fs.writeFileSync(filePath, text, 'utf8');
}

async function apiGet(url, init) {
  const apiPath = url.replace('https://maps.gvb.nl/api/v1/', '');
  const cachePath = `${CACHE_DIR}/${apiPath}`;

  try {
    const text = fs.readFileSync(cachePath, 'utf8');
    return JSON.parse(text);
  } catch (e) {
    // uncached url
  }

  const response = await fetch(url, init);
  if (!response.ok) {
    throw new Error(`GET ${apiPath} ${response.status} ${response.statusText}`);
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
  return result.linked.timetables.map(table => table.jsonUrl);
}

async function getJourney(url) {
  const {
    validFor,
    journey: { stops },
    trips,
  } = await apiGet(url);

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
    days,
    stops: stopNames,
    trips: tripTimes,
  };
}

async function getJourneys() {
  const lines = [900, 901, 902, 903, 905, 906, 907, 915];
  const journeys = [];
  for (const line of lines) {
    const urls = await getUrls(line);
    for (const url of urls) {
      const journey = await getJourney(url);
      // console.log(journey);
      journeys.push(journey);
    }
  }
  return journeys;
}

async function main() {
  const journeys = await getJourneys();

  const js = prettier.format(`export const journeys = ${JSON.stringify(journeys)}`, {
    ...prettierOptions,
    parser: 'babel',
  });

  writeFile(JS_FILENAME, js);
}

main().then(
  () => console.log('Done.'),
  error => {
    console.error(error);
    process.exit(1);
  },
);
