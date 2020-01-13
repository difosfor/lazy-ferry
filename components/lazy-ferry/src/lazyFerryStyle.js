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
    padding: 0.3em;
  }

  /* header */

  header {
    width: 100%;
    padding-top: env(safe-area-inset-top);
    display: flex;
    justify-content: space-between;
    background-color: var(--primary-dark-color);
    font-size: 1.15em;
    line-height: 1.3;
  }

  header select {
    height: 1.9em;
    width: initial;
    padding: 0.3em 1.4em 0.3em 0.5em;
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

  .main-trip {
    margin: 0.3em;
    padding: 0.3em;
    background-color: var(--primary-light-color);
    border: 1px solid var(--primary-light-color);
    border-radius: 0.3em;
  }

  .main-trip:focus {
    outline: 0;
    border: 1px solid var(--secondary-color);
  }

  /* footer */

  footer {
    width: 100%;
    padding-bottom: env(safe-area-inset-bottom);
    background-color: var(--primary-dark-color);
    font-size: 0.8em;
    line-height: 1.3;
    text-align: center;
  }
`;
