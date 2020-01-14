import { html, LitElement } from 'lit-element';
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
    return lazyFerryStyle;
  }

  constructor() {
    super();

    this.from = window.localStorage.getItem('from') || stops[0];

    this.refresh();
  }

  $(selector) {
    return this.shadowRoot ? this.shadowRoot.querySelector(selector) : null;
  }

  $$(selector) {
    return this.shadowRoot ? this.shadowRoot.querySelectorAll(selector) : null;
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
      <link rel="stylesheet" href="sscaffold.css" />

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
      <!-- TODO: Create lazy-trip element and use that here to add countdown support etc. -->
      ${timetable[this.from][day].map(
        journey =>
          html`
            <div class="main-trip" tabindex="0" data-time="${journey.time}">
              ${journey.time} to ${journey.to.join(', ')} <sup>[${journey.line}]</sup>
            </div>
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

    const trips = this.$$('.main-trip');
    if (!trips) {
      return;
    }

    const now = new Date().toTimeString().slice(0, 8);

    const next = Array.from(trips).find(trip => trip.dataset.time > now);
    if (!next) {
      return;
    }

    next.scrollIntoView(true);
    next.focus();
  }
}
