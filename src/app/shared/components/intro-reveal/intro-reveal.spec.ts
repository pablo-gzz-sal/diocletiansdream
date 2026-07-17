import { ComponentFixture, TestBed } from '@angular/core/testing';

import { IntroReveal } from './intro-reveal';
import { commonTestImports, commonTestProviders } from '../../../../testing/test-setup';

describe('IntroReveal', () => {
  let component: IntroReveal;
  let fixture: ComponentFixture<IntroReveal>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [IntroReveal, ...commonTestImports],
      providers: [...commonTestProviders]
    })
    .compileComponents();

    fixture = TestBed.createComponent(IntroReveal);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  /**
   * Regression: this decorative overlay used to render the wordmark as an <h1>,
   * which gave the homepage two <h1>s alongside the hero's real one.
   */
  it('renders no h1 — the hero owns the homepage heading', () => {
    const host: HTMLElement = fixture.nativeElement;

    expect(host.querySelectorAll('h1').length).toBe(0);
    expect(host.querySelector('.intro-title')?.textContent)
      .withContext('the wordmark itself should still be there, just not as an h1')
      .toContain('Diocletians');
  });
});
