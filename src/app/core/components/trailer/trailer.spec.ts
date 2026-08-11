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
    const bookingFacts = bookingDock.querySelectorAll('.booking-fact');

    expect(heading).withContext('hero heading').not.toBeNull();
    expect(bookingFacts.length).toBe(4);
    expect(fixture.nativeElement.querySelector('.trailer-trust')).not.toBeNull();
    expect(video.autoplay).toBeTrue();
    expect(video.muted).toBeTrue();
    expect(video.loop).toBeFalse();
    expect(video.hasAttribute('playsinline')).toBeTrue();
    expect(bookingCta).withContext('hero booking CTA').not.toBeNull();
    expect(bookingCta.getAttribute('href')).toBe('/booking');
  });

  it('renders the trailer video as a full-viewport hero background', () => {
    const hero = fixture.nativeElement.querySelector('#trailer') as HTMLElement;
    const video = fixture.nativeElement.querySelector('video') as HTMLVideoElement;

    expect(hero.classList.contains('trailer--full-viewport')).toBeTrue();
    expect(video.classList.contains('trailer-video')).toBeTrue();
    expect(fixture.nativeElement.querySelector('.reel')).toBeNull();
  });

  it('keeps native controls available after the trailer is paused', () => {
    const component = fixture.componentInstance;
    const video = fixture.nativeElement.querySelector('video') as HTMLVideoElement;

    video.dispatchEvent(new Event('play'));
    fixture.detectChanges();

    video.dispatchEvent(new Event('pause'));
    fixture.detectChanges();

    expect(component.hasStarted).toBeTrue();
    expect(component.playing).toBeFalse();
    expect(fixture.nativeElement.querySelector('.trailer-play')).toBeNull();
    expect(video.controls).toBeTrue();
  });

  it('starts the clean loop after the opening branding and resets once before the closing branding', () => {
    const component = fixture.componentInstance;
    const video = fixture.nativeElement.querySelector('video') as HTMLVideoElement;
    const play = spyOn(video, 'play').and.returnValue(Promise.resolve());

    setVideoTime(video, 0);
    component.onVideoLoadedMetadata();

    expect(video.currentTime).toBe(5);

    setVideoTime(video, 47.2);
    component.onVideoTimeUpdate();

    expect(video.currentTime).toBe(5);
    expect(play).toHaveBeenCalledTimes(1);

    setVideoTime(video, 47.2);
    component.onVideoTimeUpdate();

    expect(video.currentTime).toBe(47.2);
    expect(play).toHaveBeenCalledTimes(1);

    component.onVideoSeeked();
    component.onVideoTimeUpdate();

    expect(video.currentTime).toBe(5);
    expect(play).toHaveBeenCalledTimes(2);
  });

  it('only shows the cinematic copy at the start and end of the clean loop', () => {
    const component = fixture.componentInstance;
    const video = fixture.nativeElement.querySelector('video') as HTMLVideoElement;

    setVideoTime(video, 5);
    component.onVideoTimeUpdate();
    expect(component.heroCopyVisible).toBeTrue();

    setVideoTime(video, 10.1);
    component.onVideoTimeUpdate();
    expect(component.heroCopyVisible).toBeFalse();

    setVideoTime(video, 43.2);
    component.onVideoTimeUpdate();
    expect(component.heroCopyVisible).toBeTrue();
  });

  it('disables autoplay for reduced motion and keeps the manual play fallback', async () => {
    TestBed.resetTestingModule();
    spyOn(window, 'matchMedia').and.returnValue({ matches: true } as MediaQueryList);
    fixture = await createTrailerFixture();

    const component = fixture.componentInstance;
    const video = fixture.nativeElement.querySelector('video') as HTMLVideoElement;
    const playButton = fixture.nativeElement.querySelector('.trailer-play') as HTMLButtonElement;
    const play = spyOn(video, 'play').and.returnValue(Promise.resolve());

    expect(component.autoplayAllowed).toBeFalse();
    expect(video.autoplay).toBeFalse();
    expect(playButton).not.toBeNull();

    playButton.click();

    expect(play).toHaveBeenCalledTimes(1);
    expect(fixture.nativeElement.querySelector('.trailer-play')).not.toBeNull();
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

function setVideoTime(video: HTMLVideoElement, time: number): void {
  Object.defineProperty(video, 'currentTime', { configurable: true, value: time, writable: true });
}
