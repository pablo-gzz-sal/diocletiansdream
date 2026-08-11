import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Trailer } from './trailer';
import { commonTestImports, commonTestProviders } from '../../../../testing/test-setup';

describe('Trailer', () => {
  let fixture: ComponentFixture<Trailer>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Trailer, ...commonTestImports],
      providers: [...commonTestProviders],
    }).compileComponents();

    fixture = TestBed.createComponent(Trailer);
    fixture.detectChanges();
  });

  it('renders a browser-safe autoplay trailer and booking CTA contract', () => {
    const video = fixture.nativeElement.querySelector('video') as HTMLVideoElement;
    const bookingCta = fixture.nativeElement.querySelector(
      '[data-testid="hero-booking-cta"]',
    ) as HTMLAnchorElement;

    expect(video.autoplay).toBeTrue();
    expect(video.muted).toBeTrue();
    expect(video.loop).toBeTrue();
    expect(video.hasAttribute('playsinline')).toBeTrue();
    expect(bookingCta).withContext('hero booking CTA').not.toBeNull();
    expect(bookingCta.getAttribute('href')).toBe('/booking');
  });
});
