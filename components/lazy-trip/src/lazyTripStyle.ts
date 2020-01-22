import { css } from 'lit-element';

export const lazyTripStyle = css`
  :host {
    position: relative;
    display: block;
    padding: var(--padding);
    background-color: var(--primary-light-color);
    border-radius: var(--padding);
    text-align: center;
  }

  :host(.is-next) {
    border: 1px solid var(--primary-text-color);
    box-shadow: 4px 4px 6px var(--primary-dark-color);
  }

  .time {
    float: left;
  }

  .line {
    float: right;
    font-size: 0.6em;
  }

  .time-to-go {
    font-size: 2em;
  }

  .to {
    font-style: italic;
  }
`;
