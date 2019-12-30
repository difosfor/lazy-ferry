import { LitElement, html, css } from 'lit-element';

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

      main {
        flex-grow: 1;
        font-size: 0.5em;
      }

      .app-footer {
        font-size: calc(12px + 0.5vmin);
        align-items: center;
      }
    `;
  }

  render() {
    return html`
      <header>
        Lazy Ferry<br />
        <!-- TODO: replace by select box and current day/time etc. -->
        From: NDSM<br />
        On: Monday
      </header>

      <main>
        <code
          ><pre>
          ${JSON.stringify(timetable.NDSM.monday, null, '  ')}
        </pre
          ></code
        >
      </main>

      <p class="app-footer">
        ⚓️ Made with love by P.P. Elfferich (<a
          target="_blank"
          rel="noopener noreferrer"
          href="https://github.com/difosfor/lazy-ferry"
          >source</a
        >)
      </p>
    `;
  }
}
