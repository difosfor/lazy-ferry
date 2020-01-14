import { html, LitElement } from 'lit-element';
import { lazyTripStyle } from './lazyTripStyle.js';

function timeToSeconds(time) {
  const [, hh, mm, ss] = time.match(/^(\d\d):(\d\d):(\d\d)$/);
  return parseFloat(ss) + 60 * (parseFloat(mm) + 60 * parseFloat(hh));
}

function secondsToTime(seconds) {
  const hh = `${Math.floor(seconds / 3600)}`.padStart(2, '0');
  const mm = `${Math.floor((seconds % 3600) / 60)}`.padStart(2, '0');
  const ss = `${Math.round(seconds % 60)}`.padStart(2, '0');
  return seconds > 3600 ? `${hh}:${mm}:${ss}` : `${mm}:${ss}`;
}

export class LazyTrip extends LitElement {
  static get properties() {
    return {
      isNext: { type: Boolean },
      timeToGo: { type: String },
      trip: { type: Object },
    };
  }

  static get styles() {
    return lazyTripStyle;
  }

  constructor() {
    super();

    this.isNext = false;
    this.timeToGo = '';
    this.trip = null;
  }

  render() {
    return html`
      <link rel="stylesheet" href="sscaffold.css" />

      <div class="clearfix">
        <div class="time">${this.trip.time}</div>
        <div class="line">${this.trip.line}</div>

        ${this.isNext
          ? html`
              <div class="time-to-go">${this.timeToGo}</div>
            `
          : ''}
      </div>

      <div class="to">
        ${this.trip.to.map(
          stop =>
            html`
              ${stop}
              <br />
            `,
        )}
      </div>
    `;
  }

  setIsNext(isNext) {
    // Also scroll into view when this.isNext was already true
    if (isNext) {
      this.scrollIntoView(true);
    }

    if (!this.isNext && isNext) {
      this.isNext = true;
      this.classList.add('is-next');
      this.tick();
      this.tickId = window.setInterval(() => this.tick(), 500);
    }

    if (this.isNext && !isNext) {
      this.isNext = false;
      this.classList.remove('is-next');
      window.clearInterval(this.tickId);
    }
  }

  tick() {
    // Note: This will only work correctly when trip time is between now and now + 24 hours
    // TODO: Replace all of this by using datetimes so we can properly deal with times
    const timeNow = new Date().toTimeString().slice(0, 8);
    let secondsToGo = timeToSeconds(this.trip.time) - timeToSeconds(timeNow);
    if (secondsToGo < 0) {
      secondsToGo += 24 * 60 * 60;
    }
    this.timeToGo = secondsToTime(secondsToGo);
  }
}
