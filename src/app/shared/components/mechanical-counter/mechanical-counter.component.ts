import { CommonModule } from '@angular/common';
import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  DestroyRef,
  EventEmitter,
  Input,
  OnChanges,
  OnDestroy,
  OnInit,
  Output,
  SimpleChanges,
  inject
} from '@angular/core';

export type CounterTheme = 'sunset-wood' | 'classic-charcoal' | 'artisan-ivory';

export interface DigitFlapState {
  current: string;
  previous: string;
  isFlipping: boolean;
}

@Component({
  selector: 'app-mechanical-counter',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './mechanical-counter.component.html',
  styleUrls: ['./mechanical-counter.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class MechanicalCounterComponent implements OnInit, OnChanges, OnDestroy {
  private readonly cdr = inject(ChangeDetectorRef);
  private readonly destroyRef = inject(DestroyRef);

  /** Configurable initial and target demonstration bounds */
  readonly DEMO_CONFIG = {
    fiveDigit: {
      start: 4821,
      end: 4830 // includes carry-over to 4830
    },
    sevenDigit: {
      start: 2124821,
      end: 2124830 // includes carry-over
    },
    initialDelayMs: 900,
    stepIntervalMs: 1200,
    endPauseMs: 4000
  };

  @Input() digitCount: 5 | 7 = 5;
  @Input() platform: 'instagram' | 'facebook' | 'tiktok' | 'youtube' = 'instagram';
  @Input() theme: CounterTheme = 'sunset-wood';
  @Input() blankLeadingZeros = true;
  @Input() autoAnimate = true;
  @Input() showControls = true;
  @Input() surfaceType: 'plinth' | 'minimal' | 'desk' = 'plinth';
  @Input() customCount?: number;

  @Output() digitCountChange = new EventEmitter<5 | 7>();
  @Output() platformChange = new EventEmitter<'instagram' | 'facebook' | 'tiktok' | 'youtube'>();
  @Output() themeChange = new EventEmitter<CounterTheme>();
  @Output() countUpdated = new EventEmitter<number>();
  @Output() actionClick = new EventEmitter<void>();

  currentValue = 4821;
  displayDigits: DigitFlapState[] = [];
  isPlaying = false;
  isPaused = false;

  private stepTimer: ReturnType<typeof setTimeout> | null = null;
  private flipResetTimer: ReturnType<typeof setTimeout> | null = null;
  private visibilityListener?: () => void;

  ngOnInit(): void {
    this.initCounter(false);
    this.setupVisibilityListener();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['digitCount'] && !changes['digitCount'].firstChange) {
      this.resetDemo();
    } else if (changes['customCount'] && this.customCount !== undefined) {
      this.setCount(this.customCount, true);
    }
  }

  ngOnDestroy(): void {
    this.clearAllTimers();
    if (this.visibilityListener && typeof document !== 'undefined') {
      document.removeEventListener('visibilitychange', this.visibilityListener);
    }
  }

  get accessibleCountText(): string {
    return `${this.currentValue.toLocaleString()} followers on Instagram`;
  }

  get modelNumber(): string {
    return this.digitCount === 5 ? 'FC-05M' : 'FC-07M';
  }

  selectDigitCount(count: 5 | 7): void {
    if (this.digitCount === count) return;
    this.digitCount = count;
    this.digitCountChange.emit(count);
    this.resetDemo();
  }

  selectPlatform(platform: 'instagram' | 'facebook' | 'tiktok' | 'youtube'): void {
    if (platform !== 'instagram') return; // Instagram active, others roadmap
    this.platform = platform;
    this.platformChange.emit(platform);
  }

  setTheme(newTheme: CounterTheme): void {
    if (this.theme === newTheme) return;
    this.theme = newTheme;
    this.themeChange.emit(this.theme);
    this.cdr.markForCheck();
  }

  cycleTheme(): void {
    const themes: CounterTheme[] = ['sunset-wood', 'classic-charcoal', 'artisan-ivory'];
    const nextIdx = (themes.indexOf(this.theme) + 1) % themes.length;
    this.setTheme(themes[nextIdx]);
  }

  onActionClick(): void {
    this.actionClick.emit();
  }

  replay(): void {
    this.clearAllTimers();
    this.initCounter(true);
  }

  private initCounter(startImmediate = true): void {
    const config = this.digitCount === 5 ? this.DEMO_CONFIG.fiveDigit : this.DEMO_CONFIG.sevenDigit;
    this.currentValue = this.customCount !== undefined ? this.customCount : config.start;
    this.buildDigits(this.currentValue, false);

    if (this.autoAnimate && this.customCount === undefined) {
      const delay = startImmediate ? 300 : this.DEMO_CONFIG.initialDelayMs;
      this.scheduleNextStep(delay);
    }
  }

  private resetDemo(): void {
    this.clearAllTimers();
    this.initCounter(false);
  }

  private scheduleNextStep(delayMs: number): void {
    this.clearStepTimer();
    this.isPlaying = true;

    this.stepTimer = setTimeout(() => {
      // Check document visibility
      if (typeof document !== 'undefined' && document.hidden) {
        // Postpone step until visible
        this.isPlaying = false;
        return;
      }

      const config = this.digitCount === 5 ? this.DEMO_CONFIG.fiveDigit : this.DEMO_CONFIG.sevenDigit;
      if (this.currentValue < config.end) {
        this.stepTo(this.currentValue + 1);
        this.scheduleNextStep(this.DEMO_CONFIG.stepIntervalMs);
      } else {
        // Reached end value: pause then loop softly
        this.isPlaying = false;
        this.cdr.markForCheck();
        this.stepTimer = setTimeout(() => {
          this.initCounter(false);
        }, this.DEMO_CONFIG.endPauseMs);
      }
    }, delayMs);

    this.cdr.markForCheck();
  }

  private stepTo(nextValue: number): void {
    const prevDigits = this.getFormattedDigitArray(this.currentValue);
    const newDigits = this.getFormattedDigitArray(nextValue);

    this.currentValue = nextValue;
    this.countUpdated.emit(this.currentValue);

    // Identify which digits specifically changed
    const newDisplay: DigitFlapState[] = [];
    for (let i = 0; i < this.digitCount; i++) {
      const changed = prevDigits[i] !== newDigits[i];
      newDisplay.push({
        current: newDigits[i],
        previous: prevDigits[i],
        isFlipping: changed
      });
    }

    this.displayDigits = newDisplay;
    this.cdr.markForCheck();

    // Clear the flipping animation class after CSS animation finishes (400ms)
    if (this.flipResetTimer) clearTimeout(this.flipResetTimer);
    this.flipResetTimer = setTimeout(() => {
      this.displayDigits = this.displayDigits.map((d) => ({
        ...d,
        previous: d.current,
        isFlipping: false
      }));
      this.cdr.markForCheck();
    }, 450);
  }

  private setCount(val: number, animate = true): void {
    if (animate) {
      this.stepTo(val);
    } else {
      this.currentValue = val;
      this.buildDigits(val, false);
    }
  }

  private buildDigits(val: number, isFlipping = false): void {
    const digits = this.getFormattedDigitArray(val);
    this.displayDigits = digits.map((digit) => ({
      current: digit,
      previous: digit,
      isFlipping
    }));
    this.cdr.markForCheck();
  }

  private getFormattedDigitArray(val: number): string[] {
    const rawDigits = val.toString().padStart(this.digitCount, '0').split('');
    if (!this.blankLeadingZeros) return rawDigits;

    let foundNonZero = false;
    return rawDigits.map((digit, index) => {
      // The last digit should never be blank even if it is 0 (e.g. for number 0)
      if (digit !== '0' || index === this.digitCount - 1) {
        foundNonZero = true;
      }
      return foundNonZero ? digit : '';
    });
  }

  private clearStepTimer(): void {
    if (this.stepTimer) {
      clearTimeout(this.stepTimer);
      this.stepTimer = null;
    }
  }

  private clearAllTimers(): void {
    this.clearStepTimer();
    if (this.flipResetTimer) {
      clearTimeout(this.flipResetTimer);
      this.flipResetTimer = null;
    }
    this.isPlaying = false;
  }

  private setupVisibilityListener(): void {
    if (typeof document !== 'undefined') {
      this.visibilityListener = () => {
        if (!document.hidden && this.autoAnimate && !this.isPlaying) {
          this.scheduleNextStep(600);
        }
      };
      document.addEventListener('visibilitychange', this.visibilityListener);
    }
  }
}
