import { html, LitElement } from 'lit-element';
import { boatIcon } from './icons/boat-icon.js';
import { githubIcon } from './icons/github-icon.js';
import { refreshIcon } from './icons/refresh-icon.js';
import { lazyFerryStyle } from './lazyFerryStyle.js';
import { timetable } from './timetable.js';

export class LazyFerry extends LitElement {
  static get styles() {
    return lazyFerryStyle;
  }

  static get properties() {
    return {
      today: { type: String },
      tomorrow: { type: String },
      from: { type: String },
    };
  }

  static get stops() {
    return Object.keys(timetable).sort();
  }

  constructor() {
    super();

    // Instead of persisting choice in local storage look for most nearby stop by geo location from refresh()
    this.from = window.localStorage.getItem('from') || LazyFerry.stops[0];

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

  refresh() {
    const days = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
    this.today = days[new Date().getDay()];
    this.tomorrow = days[(new Date().getDay() + 1) % 7];

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
            ${boatIcon} Lazy Ferry ${refreshIcon}
          </a>
        </span>

        <span>
          <select name="from" @input="${this.onFromChange}">
            ${LazyFerry.stops.map(
              stop =>
                html`
                  <option>${stop}</option>
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
              ${journey.time} to ${journey.to.join(', ')}<br />
            </div>
          `,
      )}
    `;
  }

  onFromChange(event) {
    this.from = event.target.value;
    this.requestUpdate();
    window.localStorage.setItem('from', this.from);
  }
}
