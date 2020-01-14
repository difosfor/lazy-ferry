import { css } from 'lit-element';

export const lazyFerryStyle = css`
  :host {
    height: 100vh;
    width: 100%;
    display: flex;
    flex-direction: column;
    background-color: var(--primary-color);
    color: var(--primary-text-color);
  }

  /* General CSS */

  a {
    color: var(--primary-text-color);
  }

  a:hover,
  a:focus {
    color: var(--secondary-color);
  }

  a:focus {
    outline: 0;
  }

  .icon {
    height: 1em;
    fill: var(--primary-text-color);
    vertical-align: middle;
  }

  a:hover .icon,
  a:focus .icon {
    fill: var(--secondary-color);
  }

  header,
  main,
  footer {
    padding: var(--padding);
  }

  /* header */

  header {
    width: 100%;
    padding-top: calc(var(--safe-area-inset-top) + var(--padding));
    display: flex;
    justify-content: space-between;
    background-color: var(--primary-dark-color);
    font-size: 1.15em;
    line-height: 1.3;
  }

  header select {
    height: 1.9em;
    width: initial;
    padding: var(--padding) calc(var(--padding) + 1.1em) var(--padding) calc(var(--padding) + 0.2em);
    margin-bottom: 0;
    color: var(--primary-text-color);
    font-size: 0.8em;
  }

  header select:focus {
    border-color: var(--secondary-color);
  }

  /* main */

  main {
    width: 100%;
    flex-grow: 1;
    overflow: auto;
  }

  main::-webkit-scrollbar {
    display: none;
  }

  .main-day,
  .main-trips {
    margin: 0 auto;
    width: max-content;
    max-width: 100%;
  }

  lazy-trip {
    margin: calc(2 * var(--padding));
  }

  /* footer */

  footer {
    width: 100%;
    padding-bottom: calc(var(--safe-area-inset-bottom) + var(--padding));
    background-color: var(--primary-dark-color);
    font-size: 0.8em;
    line-height: 1.3;
    text-align: center;
  }
`;
