import { html, LitElement, property } from 'lit-element';
import { mainStyle } from '../../../mainStyle';
import '../../lazy-trip/lazy-trip';
import { LazyTrip } from '../../lazy-trip/src/LazyTrip';
import { getDistance } from './getDistance';
import { boatIcon } from './icons/boat-icon';
import { githubIcon } from './icons/github-icon';
import { locationIcon } from './icons/location-icon';
import { lazyFerryStyle } from './lazyFerryStyle';
import { StopName, stops } from './stops';
import { timetable } from './timetable';
import { Weekday, weekdays } from './weekdays';

export class LazyFerry extends LitElement {
  static styles = [mainStyle, lazyFerryStyle];

  @property({ type: String })
  from: StopName =
    (window.localStorage.getItem('from') as StopName) || stops[0].name;

  @property({ type: String })
  today: Weekday = weekdays[new Date().getDay()];

  @property({ type: String })
  tomorrow: Weekday = weekdays[(new Date().getDay() + 1) % 7];

  $<T extends Element>(selector: string) {
    const element = this.renderRoot.querySelector<T>(selector);
    if (!element) {
      throw new Error(`Could not find element with selector: ${selector}`);
    }
    return element;
  }

  $$<T extends Element>(selector: string) {
    return Array.from(this.renderRoot.querySelectorAll<T>(selector));
  }

  firstUpdated(changedProperties: Map<PropertyKey, unknown>) {
    super.firstUpdated(changedProperties);

    this.$<HTMLSelectElement>('select[name=from]').value = this.from;
  }

  refresh() {
    this.today = weekdays[new Date().getDay()];
    this.tomorrow = weekdays[(new Date().getDay() + 1) % 7];

    // Re-render trips and then re-focus next trip
    this.requestUpdate();
  }

  render() {
    return html`
      <header>
        <span>
          <a
            href="#"
            @click="${(event: Event) => {
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
            @click="${(event: Event) => {
              event.preventDefault();
              this.setFromClosest();
            }}"
          >
            ${locationIcon}
          </a>
          <select
            name="from"
            @input="${(event: InputEvent) => {
              this.setFrom(
                (event.target as HTMLSelectElement).value as StopName,
              );
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

  renderDay(day: Weekday) {
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

  setFrom(value: StopName) {
    this.from = value;

    for (const option of this.$$<HTMLOptionElement>(
      'select[name=from] option',
    )) {
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
      if (!closestStop) {
        throw new Error(`Could not find stop with name: ${this.from}`);
      }
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

  updated(changedProperties: Map<PropertyKey, unknown>) {
    super.updated(changedProperties);

    const lazyTrips = this.$$<LazyTrip>('lazy-trip');
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
