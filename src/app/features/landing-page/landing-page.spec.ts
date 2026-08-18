import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LandingPage } from './landing-page';
import { commonTestImports, commonTestProviders } from '../../../testing/test-setup';

describe('LandingPage', () => {
  let component: LandingPage;
  let fixture: ComponentFixture<LandingPage>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LandingPage, ...commonTestImports],
      providers: [...commonTestProviders]
    })
    .compileComponents();

    fixture = TestBed.createComponent(LandingPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('places historical authority between location and visitor testimonials', () => {
    const visit = fixture.nativeElement.querySelector('app-visit') as HTMLElement | null;
    const authority = fixture.nativeElement.querySelector(
      'app-historical-authority',
    ) as HTMLElement | null;
    const reviews = fixture.nativeElement.querySelector('app-reviews') as HTMLElement | null;

    expect(visit).not.toBeNull();
    expect(authority).not.toBeNull();
    expect(reviews).not.toBeNull();
    if (!visit || !authority || !reviews) {
      fail('Expected visit, historical authority, and reviews to render');
      return;
    }

    expect(visit.compareDocumentPosition(authority) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
    expect(authority.compareDocumentPosition(reviews) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
  });
});
