import { css, html, LitElement } from 'lit-element';
import { timetable } from './timetable.js';

export class LazyFerry extends LitElement {
  static get styles() {
    return css`
      :host {
        min-height: 100vh;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: flex-start;
        font-size: calc(10px + 2vmin);
        color: #1a2b42;
        max-width: 960px;
        margin: 0 auto;
      }

      header {
        width: 100%;
        background: #fff;
        border-bottom: 1px solid #ccc;
      }

      select {
        font-size: 1em;
      }

      main {
        flex-grow: 1;
      }

      .app-footer {
        font-size: calc(12px + 0.5vmin);
        align-items: center;
      }
    `;
  }

  static get properties() {
    return {
      day: { type: String },
      from: { type: String },
    };
  }

  static get stops() {
    return Object.keys(timetable).sort();
  }

  constructor() {
    super();

    this.day = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'][
      new Date().getDay()
    ];

    this.from = window.localStorage.getItem('from') || LazyFerry.stops[0];
  }

  firstUpdated(changedProperties) {
    super.firstUpdated(changedProperties);

    this.shadowRoot.querySelector('select[name=day]').value = this.day;
    this.shadowRoot.querySelector('select[name=from]').value = this.from;
  }

  render() {
    return html`
      <header>
        Lazy Ferry

        <select name="from" @input="${this.onFromChange}">
          ${LazyFerry.stops.map(
            stop =>
              html`
                <option>${stop}</option>
              `,
          )}
        </select>

        <select name="day" @input="${this.onDayChange}">
          <option>monday</option>
          <option>tuesday</option>
          <option>wednesday</option>
          <option>thursday</option>
          <option>friday</option>
          <option>saturday</option>
          <option>sunday</option>
        </select>
      </header>

      <main>
        ${timetable[this.from][this.day].map(
          journey =>
            html`
              ${journey.time} => ${journey.to.join(', ')}<br />
            `,
        )}
      </main>

      <p class="app-footer">
        ⚓️ Made with love by
        <a target="_blank" href="https://github.com/difosfor">difosfor</a>
        (<a target="_blank" href="https://github.com/difosfor/lazy-ferry">source</a>)
      </p>
    `;
  }

  onDayChange(event) {
    this.day = event.target.value;
    this.requestUpdate();
  }

  onFromChange(event) {
    this.from = event.target.value;
    this.requestUpdate();
    window.localStorage.setItem('from', this.from);
  }
}
