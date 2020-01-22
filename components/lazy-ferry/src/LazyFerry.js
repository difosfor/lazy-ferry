import { html, LitElement } from 'lit-element';
import { sscaffoldStyle } from '../../../sscaffoldStyle.js';
import '../../lazy-trip/lazy-trip.js';
import { getDistance } from './getDistance.js';
import { boatIcon } from './icons/boat-icon.js';
import { githubIcon } from './icons/github-icon.js';
import { locationIcon } from './icons/location-icon.js';
import { lazyFerryStyle } from './lazyFerryStyle.js';
import { stops } from './stops.js';
import { timetable } from './timetable.js';

export class LazyFerry extends LitElement {
  static get properties() {
    return {
      today: { type: String },
      tomorrow: { type: String },
      from: { type: String },
    };
  }

  static get styles() {
    return [sscaffoldStyle, lazyFerryStyle];
  }

  constructor() {
    super();

    this.from = window.localStorage.getItem('from') || stops[0].name;

    this.refresh();
  }

  $(selector) {
    return this.renderRoot.querySelector(selector);
  }

  $$(selector) {
    return this.renderRoot.querySelectorAll(selector);
  }

  firstUpdated(changedProperties) {
    super.firstUpdated(changedProperties);

    this.$('select[name=from]').value = this.from;
  }

  refresh() {
    const days = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
    this.today = days[new Date().getDay()];
    this.tomorrow = days[(new Date().getDay() + 1) % 7];

    // Re-render trips and then re-focus next trip
    this.requestUpdate();
  }

  render() {
    return html`
      <header>
        <span>
          <a
            href="#"
            @click="${event => {
              event.preventDefault();
              this.refresh();
            }}"
          >
            ${boatIcon} Lazy Ferry
          </a>
        </span>

        <span>
          <a
            href="#"
            @click="${event => {
              event.preventDefault();
              this.setFromClosest();
            }}"
          >
            ${locationIcon}
          </a>
          <select
            name="from"
            @input="${event => {
              this.setFrom(event.target.value);
            }}"
          >
            ${stops.map(
              stop =>
                html`
                  <option>${stop.name}</option>
                `,
            )}
          </select>
        </span>
      </header>

      <main>
        <div class="main-trips">
          <!-- TODO: Replace by infinite scrolling -->
          ${this.renderDay(this.today)} ${this.renderDay(this.tomorrow)}
        </div>
      </main>

      <footer>
        Made with ♥ by
        <a
          target="_blank"
          rel="noopener"
          title="difosfor on GitHub"
          href="https://github.com/difosfor"
          >difosfor</a
        >
        <a
          target="_blank"
          rel="noopener"
          title="Lazy Ferry on GitHub"
          href="https://github.com/difosfor/lazy-ferry"
        >
          ${githubIcon}
        </a>
      </footer>
    `;
  }

  renderDay(day) {
    return html`
      <div class="main-day">${day}</div>
      ${timetable[this.from][day].map(
        trip =>
          html`
            <lazy-trip .trip="${trip}"></lazy-trip>
          `,
      )}
    `;
  }

  setFrom(value) {
    this.from = value;

    for (const option of this.$$('select[name=from] option')) {
      option.selected = option.value === this.from;
    }

    // Re-render trips and then re-focus next trip
    this.requestUpdate();

    window.localStorage.setItem('from', this.from);
  }

  setFromClosest() {
    navigator.geolocation.getCurrentPosition(pos => {
      const {
        coords: { latitude: lat, longitude: lon },
      } = pos;

      let closestStop = stops.find(stop => stop.name === this.from);
      let closestDist = getDistance(lat, lon, closestStop.lat, closestStop.lon);

      for (const stop of stops) {
        const dist = getDistance(lat, lon, stop.lat, stop.lon);
        if (dist < closestDist) {
          closestStop = stop;
          closestDist = dist;
        }
      }

      this.setFrom(closestStop.name);
    });
  }

  updated(changedProperties) {
    super.updated(changedProperties);

    const lazyTrips = this.$$('lazy-trip');
    if (!lazyTrips) {
      return;
    }

    const now = new Date().toTimeString().slice(0, 8);

    let foundNext = false;
    for (const lazyTrip of lazyTrips) {
      if (!foundNext && lazyTrip.trip.time > now) {
        foundNext = true;
        lazyTrip.setIsNext(true);
      } else {
        lazyTrip.setIsNext(false);
      }
    }
  }
}
