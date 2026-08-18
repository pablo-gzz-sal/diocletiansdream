import { ComponentFixture, TestBed } from '@angular/core/testing';

import { About } from './about';
import { commonTestImports, commonTestProviders } from '../../../testing/test-setup';

describe('About', () => {
  let component: About;
  let fixture: ComponentFixture<About>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [About, ...commonTestImports],
      providers: [...commonTestProviders]
    })
    .compileComponents();

    fixture = TestBed.createComponent(About);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('renders every media feature as a safe outbound link with its logo', () => {
    const cards = Array.from(
      fixture.nativeElement.querySelectorAll('.about-press-card'),
    ) as HTMLAnchorElement[];

    expect(cards.length).toBe(component.pressFeatures.length);

    cards.forEach((card, i) => {
      const source = component.pressFeatures[i];

      expect(card.getAttribute('href')).toBe(source.href);
      expect(card.getAttribute('target')).toBe('_blank');
      // Outbound links must not hand the opener window to the target page.
      expect(card.getAttribute('rel')).toContain('noopener');
      expect(card.textContent).toContain(source.headline);
      expect(card.querySelector('img')?.getAttribute('src')).toBe(source.logo);
    });
  });

  it('no longer shows the pre-launch VR film confirmation note', () => {
    // The April 2026 film shipped as planned, so the internal reminder is gone.
    expect(fixture.nativeElement.textContent).not.toContain('aboutPage.origin.note');
  });
});
