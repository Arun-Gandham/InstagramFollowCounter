import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { ProductPageComponent } from './product-page.component';

describe('ProductPageComponent', () => {
  let component: ProductPageComponent;
  let fixture: ComponentFixture<ProductPageComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ProductPageComponent],
      providers: [provideRouter([])]
    }).compileComponents();

    fixture = TestBed.createComponent(ProductPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create the product landing page component', () => {
    expect(component).toBeTruthy();
  });

  it('should toggle FAQ accordion items', () => {
    expect(component.openFaqIndex).toBe(0);
    component.toggleFaq(1);
    expect(component.openFaqIndex).toBe(1);
    component.toggleFaq(1);
    expect(component.openFaqIndex).toBeNull();
  });

  it('should increment interactive count when virtual follow is clicked', () => {
    const initial = component.interactiveCount;
    component.simulateVirtualFollow();
    expect(component.interactiveCount).toBe(initial + 1);
    expect(component.hasVirtualFollowed).toBeTrue();
  });

  it('should submit inquiry form and show confirmation state', fakeAsync(() => {
    component.inquiryName = 'Alex Rivera';
    component.inquiryEmail = 'alex@bakery.com';
    component.inquiryModel = '5';
    component.submitInquiry();
    expect(component.isSubmittingInquiry).toBeTrue();

    tick(850);
    expect(component.isSubmittingInquiry).toBeFalse();
    expect(component.inquirySubmitted).toBeTrue();

    component.resetInquiryForm();
    expect(component.inquirySubmitted).toBeFalse();
    expect(component.inquiryName).toBe('');
  }));

  it('should update selectedDigitCount when changed from mechanical counter', () => {
    component.onDigitCountChanged(7);
    expect(component.selectedDigitCount).toBe(7);
  });
});
