import { html, LitElement, property } from 'lit-element';
import { mainStyle } from '../../../mainStyle';
import { Trip } from '../../lazy-ferry/src/timetable';
import { lazyTripStyle } from './lazyTripStyle';

function timeToSeconds(time: string) {
  const matches = /^(\d\d):(\d\d):(\d\d)$/.exec(time);
  if (!matches) {
    throw new Error(`Invalid time string: ${time}`);
  }
  const [, hh, mm, ss] = matches;
  return parseFloat(ss) + 60 * (parseFloat(mm) + 60 * parseFloat(hh));
}

function secondsToTime(seconds: number) {
  const hh = `${Math.floor(seconds / 3600)}`.padStart(2, '0');
  const mm = `${Math.floor((seconds % 3600) / 60)}`.padStart(2, '0');
  const ss = `${Math.round(seconds % 60)}`.padStart(2, '0');
  return seconds > 3600 ? `${hh}:${mm}:${ss}` : `${mm}:${ss}`;
}

export class LazyTrip extends LitElement {
  static styles = [mainStyle, lazyTripStyle];

  @property({ type: Boolean })
  isNext = false;

  tickId = -1;

  @property({ type: String })
  timeToGo = '';

  @property({ type: Object })
  trip: Trip = { time: '00:00:00', line: '0', to: [] };

  render() {
    return html`
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

  setIsNext(isNext: boolean) {
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
