import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CtaBlock } from './cta-block';
import { commonTestImports, commonTestProviders } from '../../../../testing/test-setup';

describe('CtaBlock', () => {
  let component: CtaBlock;
  let fixture: ComponentFixture<CtaBlock>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CtaBlock, ...commonTestImports],
      providers: [...commonTestProviders]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CtaBlock);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('exposes mobile-safe hooks for the complete CTA row', () => {
    const actions = fixture.nativeElement.querySelector('.cta-block-actions');
    const links = fixture.nativeElement.querySelectorAll('.cta-block-action');

    expect(actions).not.toBeNull();
    expect(links.length).toBe(3);
  });
});
