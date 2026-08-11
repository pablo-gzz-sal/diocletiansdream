import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Trailer } from './trailer';
import { commonTestImports, commonTestProviders } from '../../../../testing/test-setup';

describe('Trailer', () => {
  let fixture: ComponentFixture<Trailer>;

  beforeEach(async () => {
    fixture = await createTrailerFixture();
  });

  it('renders a browser-safe autoplay trailer and booking CTA contract', () => {
    const video = fixture.nativeElement.querySelector('video') as HTMLVideoElement;
    const heading = fixture.nativeElement.querySelector('h1') as HTMLHeadingElement;
    const bookingDock = fixture.nativeElement.querySelector('.booking-dock') as HTMLElement;
    const bookingCta = fixture.nativeElement.querySelector(
      '[data-testid="hero-booking-cta"]',
    ) as HTMLAnchorElement;
    const bookingDockText = bookingDock.textContent.replace(/\s+/g, ' ');

    expect(heading).withContext('hero heading').not.toBeNull();
    expect(bookingDockText).toContain('15-minute experience');
    expect(bookingDockText).toContain('Beside the Golden Gate');
    expect(bookingDockText).toContain('Adult €13');
    expect(bookingDockText).toContain('Child €9');
    expect(bookingDockText).toContain('ages 8–14');
    expect(video.autoplay).toBeTrue();
    expect(video.muted).toBeTrue();
    expect(video.loop).toBeTrue();
    expect(video.hasAttribute('playsinline')).toBeTrue();
    expect(bookingCta).withContext('hero booking CTA').not.toBeNull();
    expect(bookingCta.getAttribute('href')).toBe('/booking');
  });

  it('shows native pause controls only after the trailer starts playing', () => {
    const video = fixture.nativeElement.querySelector('video') as HTMLVideoElement;

    video.dispatchEvent(new Event('play'));
    fixture.detectChanges();

    expect(fixture.nativeElement.querySelector('.reel-veil')).toBeNull();
    expect(fixture.nativeElement.querySelector('.reel-play')).toBeNull();
    expect(video.controls).toBeTrue();
  });

  it('disables autoplay for reduced motion and keeps the manual play fallback', async () => {
    TestBed.resetTestingModule();
    spyOn(window, 'matchMedia').and.returnValue({ matches: true } as MediaQueryList);
    fixture = await createTrailerFixture();

    const component = fixture.componentInstance;
    const video = fixture.nativeElement.querySelector('video') as HTMLVideoElement;
    const playButton = fixture.nativeElement.querySelector('.reel-play') as HTMLButtonElement;
    const play = spyOn(video, 'play').and.returnValue(Promise.resolve());

    expect(component.autoplayAllowed).toBeFalse();
    expect(video.autoplay).toBeFalse();
    expect(playButton).not.toBeNull();

    playButton.click();

    expect(play).toHaveBeenCalledTimes(1);
    expect(fixture.nativeElement.querySelector('.reel-veil')).not.toBeNull();
  });
});

async function createTrailerFixture(): Promise<ComponentFixture<Trailer>> {
  await TestBed.configureTestingModule({
    imports: [Trailer, ...commonTestImports],
    providers: [...commonTestProviders],
  }).compileComponents();

  const fixture = TestBed.createComponent(Trailer);
  fixture.detectChanges();
  return fixture;
}
