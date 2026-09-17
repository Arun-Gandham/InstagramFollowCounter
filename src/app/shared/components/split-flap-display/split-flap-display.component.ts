import { CommonModule } from '@angular/common';
import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';

@Component({
  selector: 'app-split-flap-display',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="split-flap-wrapper">
      <!-- Architectural Enclosure -->
      <div class="hardware-chassis">
        <!-- Top Acrylic Glare Sheen -->
        <div class="acrylic-glare"></div>

        <!-- Corner Precision Fasteners -->
        <div class="corner-bolt top-left"></div>
        <div class="corner-bolt top-right"></div>
        <div class="corner-bolt bottom-left"></div>
        <div class="corner-bolt bottom-right"></div>

        <!-- Reels Display Drum -->
        <div class="reels-frame flex items-center">
          @for (digit of digits; track $index) {
            <div class="flap-unit" [class.is-flipping]="flippingIndices.has($index)">
              <!-- Top Flap Card -->
              <div class="flap-card top">
                <div class="flap-text font-mono">{{ digit }}</div>
                <div class="card-shadow-top"></div>
              </div>

              <!-- Bottom Flap Card -->
              <div class="flap-card bottom">
                <div class="flap-text font-mono">{{ digit }}</div>
                <div class="card-shadow-bottom"></div>
              </div>

              <!-- Mechanical Hinge Bar -->
              <div class="flap-hinge"></div>
            </div>
          }
        </div>
      </div>


    </div>
  `,
  styles: [`
    .split-flap-wrapper {
      display: inline-flex;
      flex-direction: column;
      align-items: center;
      gap: 0.75rem;
      position: relative;
    }
    .hardware-chassis {
      background: linear-gradient(180deg, #1e293b 0%, #0f172a 100%);
      border: 4px solid #334155;
      border-radius: 18px;
      padding: 1.5rem 2rem;
      box-shadow:
        0 1px 2px 0 rgba(15, 23, 42, 0.15),
        0 20px 35px -10px rgba(15, 23, 42, 0.2),
        inset 0 1px 1px rgba(255, 255, 255, 0.2),
        inset 0 -2px 6px rgba(0, 0, 0, 0.4);
      position: relative;
      overflow: hidden;
    }
    .acrylic-glare {
      position: absolute;
      top: 0;
      left: -25%;
      right: -25%;
      height: 40%;
      background: linear-gradient(135deg, rgba(255, 255, 255, 0.12) 0%, rgba(255, 255, 255, 0.01) 50%, transparent 100%);
      transform: skewY(-4deg);
      pointer-events: none;
      z-index: 20;
    }
    .corner-bolt {
      position: absolute;
      width: 7px;
      height: 7px;
      border-radius: 50%;
      background: radial-gradient(circle at 35% 35%, #cbd5e1 0%, #64748b 70%, #334155 100%);
      box-shadow: 0 1px 2px rgba(0, 0, 0, 0.5);
      z-index: 25;
    }
    .corner-bolt.top-left { top: 8px; left: 10px; }
    .corner-bolt.top-right { top: 8px; right: 10px; }
    .corner-bolt.bottom-left { bottom: 8px; left: 10px; }
    .corner-bolt.bottom-right { bottom: 8px; right: 10px; }

    .reels-frame {
      gap: 0.6rem;
      background: #090d16;
      padding: 0.65rem 0.75rem;
      border-radius: 10px;
      box-shadow: inset 0 3px 12px rgba(0, 0, 0, 0.9), 0 1px 0 rgba(255, 255, 255, 0.05);
      border: 1px solid #1e293b;
    }
    .flap-unit {
      position: relative;
      width: 60px;
      height: 96px;
      perspective: 450px;
      user-select: none;
    }
    @media (min-width: 640px) {
      .flap-unit {
        width: 80px;
        height: 120px;
      }
    }
    .flap-card {
      position: absolute;
      left: 0;
      width: 100%;
      height: 50%;
      overflow: hidden;
      color: #ffffff;
      border-left: 1px solid rgba(255, 255, 255, 0.06);
      border-right: 1px solid rgba(255, 255, 255, 0.06);
    }
    .flap-card.top {
      top: 0;
      background: linear-gradient(180deg, #242e42 0%, #171f2e 100%);
      border-top-left-radius: 6px;
      border-top-right-radius: 6px;
      border-bottom: 1.5px solid #090d16;
      box-shadow: inset 0 1.5px 2px rgba(255, 255, 255, 0.2);
      transform-origin: bottom;
    }
    .flap-card.bottom {
      bottom: 0;
      background: linear-gradient(180deg, #131926 0%, #0c111a 100%);
      border-bottom-left-radius: 6px;
      border-bottom-right-radius: 6px;
      border-top: 1.5px solid #090d16;
      box-shadow: inset 0 -2px 4px rgba(0, 0, 0, 0.6);
      transform-origin: top;
    }
    .flap-text {
      position: absolute;
      left: 0;
      width: 100%;
      height: 200%;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 3.25rem;
      font-weight: 800;
      text-shadow: 0 2px 4px rgba(0, 0, 0, 0.8);
      color: #f8fafc;
    }
    @media (min-width: 640px) {
      .flap-text {
        font-size: 4.25rem;
      }
    }
    .flap-card.top .flap-text { top: 0; }
    .flap-card.bottom .flap-text { bottom: 0; }

    .card-shadow-top {
      position: absolute;
      bottom: 0;
      left: 0;
      right: 0;
      height: 6px;
      background: linear-gradient(180deg, transparent 0%, rgba(0, 0, 0, 0.35) 100%);
      pointer-events: none;
    }
    .card-shadow-bottom {
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      height: 6px;
      background: linear-gradient(180deg, rgba(0, 0, 0, 0.5) 0%, transparent 100%);
      pointer-events: none;
    }
    .flap-hinge {
      position: absolute;
      top: 50%;
      left: -2px;
      right: -2px;
      height: 3px;
      background: #090d16;
      z-index: 10;
      border-radius: 2px;
    }
    .is-flipping .flap-card.top {
      animation: flipTop 0.3s cubic-bezier(0.37, 0, 0.63, 1);
    }
    .is-flipping .flap-card.bottom {
      animation: flipBottom 0.3s cubic-bezier(0.37, 0, 0.63, 1);
    }
    @keyframes flipTop {
      0% { transform: rotateX(0deg); }
      100% { transform: rotateX(-90deg); filter: brightness(0.65); }
    }
    @keyframes flipBottom {
      0% { transform: rotateX(90deg); filter: brightness(0.65); }
      100% { transform: rotateX(0deg); filter: brightness(1); }
    }
    .hardware-plate {
      width: 100%;
      padding: 0 0.5rem;
      color: #64748b;
    }
    .plate-ig-icon {
      width: 13px;
      height: 13px;
      color: #e1306c;
    }
    .plate-text {
      font-size: 0.65rem;
      font-weight: 700;
      letter-spacing: 0.08em;
      color: #64748b;
    }
    .plate-badge {
      font-size: 0.625rem;
      font-weight: 700;
      letter-spacing: 0.05em;
      color: #475569;
      background: #f1f5f9;
      padding: 0.15rem 0.45rem;
      border-radius: 4px;
      border: 1px solid #e2e8f0;
    }
    .sound-toggle-btn {
      width: 26px;
      height: 26px;
      border-radius: 6px;
      background: #ffffff;
      border: 1px solid #e2e8f0;
      color: #64748b;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      transition: all 0.15s ease;
      box-shadow: 0 1px 2px rgba(15, 23, 42, 0.05);
    }
    .sound-toggle-btn:hover {
      color: #0f172a;
      border-color: #cbd5e1;
      background: #f8fafc;
    }
    .sound-toggle-btn svg {
      width: 14px;
      height: 14px;
    }
  `]
})
export class SplitFlapDisplayComponent implements OnChanges {
  @Input() count: number | null | undefined = 0;
  @Input() digitCount = 7;
  @Input() padWithZero = true;

  digits: string[] = [];
  flippingIndices = new Set<number>();
  soundEnabled = true;

  private previousDigits: string[] = [];
  private audioCtx: AudioContext | null = null;

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['count'] || changes['digitCount']) {
      this.updateDigits();
    }
  }



  private updateDigits(): void {
    const rawNum = Math.max(0, this.count ?? 0);
    const numStr = rawNum.toString();
    const padChar = this.padWithZero ? '0' : ' ';
    const padded = numStr.padStart(this.digitCount, padChar).slice(-this.digitCount);
    const newDigits = padded.split('');

    // Trigger flip animation on changed digits
    this.flippingIndices.clear();
    let hasChanged = false;
    if (this.previousDigits.length === newDigits.length) {
      newDigits.forEach((d, i) => {
        if (d !== this.previousDigits[i]) {
          this.flippingIndices.add(i);
          hasChanged = true;
        }
      });
    }



    this.digits = newDigits;
    this.previousDigits = [...newDigits];

    if (this.flippingIndices.size > 0) {
      setTimeout(() => {
        this.flippingIndices.clear();
      }, 320);
    }
  }
}
