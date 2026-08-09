import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Partners } from './partners';
import { commonTestImports, commonTestProviders } from '../../../../testing/test-setup';

describe('Partners', () => {
  let component: Partners;
  let fixture: ComponentFixture<Partners>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Partners, ...commonTestImports],
      providers: [...commonTestProviders]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Partners);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('renders one card per partner with a safe outbound link', () => {
    const links = fixture.nativeElement.querySelectorAll('.pcard-btn') as NodeListOf<HTMLAnchorElement>;
    expect(links.length).toBe(component.partners.length);

    links.forEach((link, i) => {
      expect(link.getAttribute('href')).toBe(component.partners[i].href);
      expect(link.getAttribute('target')).toBe('_blank');
      expect(link.getAttribute('rel')).toBe('noopener noreferrer');
    });
  });
});
