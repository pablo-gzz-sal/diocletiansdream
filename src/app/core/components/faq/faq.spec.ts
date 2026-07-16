import { ComponentFixture, TestBed } from '@angular/core/testing';
import gsap from 'gsap';

import { Faq } from './faq';
import { commonTestImports, commonTestProviders } from '../../../../testing/test-setup';

describe('Faq', () => {
  let component: Faq;
  let fixture: ComponentFixture<Faq>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Faq, ...commonTestImports],
      providers: [...commonTestProviders]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Faq);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  /**
   * Regression: the panel lookup used to index '.faq-a' with a hardcoded +1
   * offset for the newsletter panel that used to sit in slot 0. Commenting the
   * newsletter out shifted every panel, so clicking a question animated the
   * NEXT one open. Scoping the query to [data-faq-item] keeps panels[i] paired
   * with faqs[i] whether or not the newsletter is present.
   */
  it('pairs each accordion panel with its own question', () => {
    const host: HTMLElement = fixture.nativeElement;
    const panels = host.querySelectorAll<HTMLElement>('[data-faq-item] .faq-a');
    const items = host.querySelectorAll<HTMLElement>('[data-faq-item]');

    expect(panels.length).toBe(component.faqs.length);

    component.faqs.forEach((faq, i) => {
      expect(items[i].contains(panels[i]))
        .withContext(`panel ${i} does not belong to the item keyed "${faq.q}"`)
        .toBe(true);
    });
  });

  it('renders question and answer text from i18n keys', () => {
    // Guards against the keys drifting out of the translation files: a missing
    // key renders empty, which is exactly how the prerender bug presented.
    for (const faq of component.faqs) {
      expect(faq.q).toMatch(/^home\.faq\.items\./);
      expect(faq.a).toMatch(/^home\.faq\.items\./);
    }
  });

  it('opens the clicked question and closes the others', () => {
    const host: HTMLElement = fixture.nativeElement;
    const buttons = host.querySelectorAll<HTMLButtonElement>('[data-faq-item] .faq-q');

    buttons[2].click();
    fixture.detectChanges();

    expect(component.faqs.map((f) => f.open)).toEqual([false, false, true, false]);
    expect(host.querySelectorAll('[data-faq-item]')[2].classList).toContain('faq-item--open');
  });

  /**
   * The offset bug lived here specifically: the open/closed FLAG and the CSS
   * class were always correct, so only the tween target reveals it. Spy on GSAP
   * to assert the element being expanded is the clicked question's own panel.
   */
  it('expands the clicked question own panel, not the next one', () => {
    const host: HTMLElement = fixture.nativeElement;
    const fromTo = spyOn(gsap, 'fromTo').and.callThrough();

    const items = host.querySelectorAll<HTMLElement>('[data-faq-item]');
    items[1].querySelector<HTMLButtonElement>('.faq-q')!.click();

    expect(fromTo).toHaveBeenCalled();
    const target = fromTo.calls.mostRecent().args[0] as HTMLElement;
    expect(items[1].contains(target))
      .withContext('GSAP expanded a panel belonging to a different question')
      .toBe(true);
  });
});
