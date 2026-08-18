import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Experience } from './experience';
import { commonTestImports, commonTestProviders } from '../../../../testing/test-setup';

describe('Experience', () => {
  let component: Experience;
  let fixture: ComponentFixture<Experience>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Experience, ...commonTestImports],
      providers: [...commonTestProviders]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Experience);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('uses the visitor image and Tripadvisor award to balance the introduction', () => {
    const image = fixture.nativeElement.querySelector(
      '[data-testid="experience-visitor-image"]',
    ) as HTMLImageElement | null;
    const award = fixture.nativeElement.querySelector(
      '[data-testid="tripadvisor-award"]',
    ) as HTMLElement | null;

    expect(image?.getAttribute('src')).toBe('assets/images/vr/visitors-vr.jpg');
    expect(award).not.toBeNull();
    expect(award?.querySelector('img')?.getAttribute('src')).toBe(
      'tripadvisor-travellers-choice.png',
    );
  });

  it('allows the Tripadvisor visual to shrink inside narrow layout grids', () => {
    const visual = fixture.nativeElement.querySelector(
      '.experience-visual',
    ) as HTMLElement;

    expect(getComputedStyle(visual).minWidth).toBe('0px');
  });
});
