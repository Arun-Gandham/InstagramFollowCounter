import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { MechanicalCounterComponent } from './mechanical-counter.component';

describe('MechanicalCounterComponent', () => {
  let component: MechanicalCounterComponent;
  let fixture: ComponentFixture<MechanicalCounterComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MechanicalCounterComponent]
    }).compileComponents();

    fixture = TestBed.createComponent(MechanicalCounterComponent);
    component = fixture.componentInstance;
    component.autoAnimate = false; // disable automatic interval in tests
    fixture.detectChanges();
  });

  afterEach(() => {
    component.ngOnDestroy();
  });

  it('should create the mechanical counter component', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize with 5 digits by default', () => {
    expect(component.digitCount).toBe(5);
    expect(component.displayDigits.length).toBe(5);
    expect(component.modelNumber).toBe('FC-05M');
  });

  it('should switch to 7-digit variant cleanly and update drum length', () => {
    component.selectDigitCount(7);
    expect(component.digitCount).toBe(7);
    expect(component.displayDigits.length).toBe(7);
    expect(component.modelNumber).toBe('FC-07M');
  });

  it('should correctly format accessible count text for screen readers', () => {
    component.currentValue = 2481;
    expect(component.accessibleCountText).toContain('2,481');
    expect(component.accessibleCountText).toContain('followers on Instagram');
  });

  it('should trigger replay and reset to demonstration start', () => {
    component.currentValue = 2489;
    component.replay();
    expect(component.currentValue).toBe(component.DEMO_CONFIG.fiveDigit.start);
  });

  it('should clean up timers on destroy without leaks', () => {
    expect(() => component.ngOnDestroy()).not.toThrow();
  });
});
