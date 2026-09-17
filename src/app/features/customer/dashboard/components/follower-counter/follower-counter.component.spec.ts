import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FollowerCounterComponent } from './follower-counter.component';

describe('FollowerCounterComponent', () => {
  let component: FollowerCounterComponent;
  let fixture: ComponentFixture<FollowerCounterComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FollowerCounterComponent]
    }).compileComponents();

    fixture = TestBed.createComponent(FollowerCounterComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create the component', () => {
    expect(component).toBeTruthy();
  });

  it('should pad digits correctly for 7-digit configuration', () => {
    component.count = 1250;
    component.digitCount = 7;
    component.ngOnChanges({
      count: {
        previousValue: 0,
        currentValue: 1250,
        firstChange: false,
        isFirstChange: () => false
      }
    });

    expect(component.digits).toEqual(['0', '0', '0', '1', '2', '5', '0']);
  });

  it('should pad digits correctly for 5-digit configuration', () => {
    component.count = 840;
    component.digitCount = 5;
    component.ngOnChanges({
      count: {
        previousValue: 0,
        currentValue: 840,
        firstChange: false,
        isFirstChange: () => false
      },
      digitCount: {
        previousValue: 7,
        currentValue: 5,
        firstChange: false,
        isFirstChange: () => false
      }
    });

    expect(component.digits).toEqual(['0', '0', '8', '4', '0']);
  });

  it('should identify changing digit indices for animation', () => {
    // Initial state: 1000
    component.count = 1000;
    component.digitCount = 5;
    component.ngOnChanges({
      count: {
        previousValue: 0,
        currentValue: 1000,
        firstChange: false,
        isFirstChange: () => false
      }
    });

    // Updated state: 1025 -> only last two digits change ('0'->'2', '0'->'5')
    component.count = 1025;
    component.ngOnChanges({
      count: {
        previousValue: 1000,
        currentValue: 1025,
        firstChange: false,
        isFirstChange: () => false
      }
    });

    expect(component.flippingIndices.has(3)).toBeTrue();
    expect(component.flippingIndices.has(4)).toBeTrue();
    expect(component.flippingIndices.has(0)).toBeFalse();
    expect(component.flippingIndices.has(1)).toBeFalse();
    expect(component.flippingIndices.has(2)).toBeFalse();
  });

  it('should emit refresh event when onTriggerRefresh is called', () => {
    spyOn(component.refresh, 'emit');
    component.isRefreshing = false;
    component.onTriggerRefresh();
    expect(component.refresh.emit).toHaveBeenCalled();
  });
});
