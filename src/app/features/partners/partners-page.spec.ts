import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PartnersPage } from './partners-page';
import { commonTestImports, commonTestProviders } from '../../../testing/test-setup';

describe('PartnersPage', () => {
  let component: PartnersPage;
  let fixture: ComponentFixture<PartnersPage>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PartnersPage, ...commonTestImports],
      providers: [...commonTestProviders],
    }).compileComponents();

    fixture = TestBed.createComponent(PartnersPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('carries exactly one h1 — the cards section must not add a second heading', () => {
    // The partners section owns an <h2> on the homepage. Rendering it here with
    // showHeader still on would leave the page with two competing headings
    // saying the same thing.
    expect(fixture.nativeElement.querySelectorAll('h1').length).toBe(1);
    expect(fixture.nativeElement.querySelector('.partners-header')).toBeNull();
  });

  it('renders every partner card as a safe outbound link', () => {
    const cards = Array.from(
      fixture.nativeElement.querySelectorAll('.pcard'),
    ) as HTMLElement[];

    expect(cards.length).toBe(3);

    cards.forEach((card) => {
      const link = card.querySelector('a') as HTMLAnchorElement;
      expect(link.getAttribute('href')).toMatch(/^https:\/\//);
      expect(link.getAttribute('target')).toBe('_blank');
      // Outbound links must not hand the opener window to the target page.
      expect(link.getAttribute('rel')).toContain('noopener');
    });
  });
});
