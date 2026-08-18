import { ComponentFixture, TestBed } from '@angular/core/testing';
import type Player from '@vimeo/player';

import { Trailer } from './trailer';
import { commonTestImports, commonTestProviders } from '../../../../testing/test-setup';

describe('Trailer', () => {
  let fixture: ComponentFixture<Trailer>;

  beforeEach(async () => {
    fixture = await createTrailerFixture();
  });

  it('renders the Vimeo trailer with the privacy-preserving player contract and booking CTA', () => {
    const playerFrame = fixture.nativeElement.querySelector('iframe') as HTMLIFrameElement;
    const heading = fixture.nativeElement.querySelector('h1') as HTMLHeadingElement;
    const poster = fixture.nativeElement.querySelector('.trailer-poster') as HTMLElement;
    const bookingDock = fixture.nativeElement.querySelector('.booking-dock') as HTMLElement;
    const bookingCta = fixture.nativeElement.querySelector(
      '[data-testid="hero-booking-cta"]',
    ) as HTMLAnchorElement;
    const bookingFacts = bookingDock.querySelectorAll('.booking-fact');

    expect(heading).withContext('hero heading').not.toBeNull();
    expect(poster).withContext('ancient opening poster').not.toBeNull();
    expect(poster.classList.contains('trailer-poster--hidden')).toBeFalse();
    expect(bookingFacts.length).toBe(4);
    expect(fixture.nativeElement.querySelector('.trailer-trust')).not.toBeNull();
    expect(playerFrame).withContext('Vimeo player frame').not.toBeNull();
    expect(playerFrame.classList.contains('trailer-video')).toBeTrue();
    expect(playerFrame.src).toContain('player.vimeo.com/video/1217274878');
    expect(playerFrame.src).toContain('dnt=1');
    expect(playerFrame.src).toContain('autoplay=1');
    expect(playerFrame.src).toContain('background=1');
    expect(playerFrame.src).toContain('controls=0');
    expect(playerFrame.src).toContain('loop=1');
    expect(playerFrame.src).toContain('muted=1');
    expect(bookingCta).withContext('hero booking CTA').not.toBeNull();
    expect(bookingCta.getAttribute('href')).toBe('/booking');
  });

  it('marks the mobile booking dock hidden exactly while the hero copy is visible', () => {
    const component = fixture.componentInstance;

    component.heroCopyVisible = true;
    fixture.detectChanges();
    let bookingDock = fixture.nativeElement.querySelector('.booking-dock') as HTMLElement;
    expect(bookingDock.classList.contains('booking-dock--mobile-hidden')).toBeTrue();

    component.heroCopyVisible = false;
    fixture.detectChanges();
    bookingDock = fixture.nativeElement.querySelector('.booking-dock') as HTMLElement;
    expect(bookingDock.classList.contains('booking-dock--mobile-hidden')).toBeFalse();
  });

  it('renders the Vimeo player as a full-viewport hero background', () => {
    const hero = fixture.nativeElement.querySelector('#trailer') as HTMLElement;
    const playerFrame = fixture.nativeElement.querySelector('iframe') as HTMLIFrameElement;

    expect(hero.classList.contains('trailer--full-viewport')).toBeTrue();
    expect(playerFrame.classList.contains('trailer-video')).toBeTrue();
    expect(fixture.nativeElement.querySelector('.reel')).toBeNull();
    expect(getComputedStyle(playerFrame).maxWidth).toBe('none');
  });

  it('does not show a manual player control during the autoplay poster hold', () => {
    expect(fixture.componentInstance.autoplayAllowed).toBeTrue();
    expect(fixture.nativeElement.querySelector('.trailer-play')).toBeNull();
  });

  it('keeps the custom playback fallback while hiding Vimeo controls', () => {
    const component = fixture.componentInstance;
    const playerFrame = fixture.nativeElement.querySelector('iframe') as HTMLIFrameElement;

    component.onPlayerPlay();
    fixture.detectChanges();

    component.onPlayerPause();
    fixture.detectChanges();

    expect(component.hasStarted).toBeTrue();
    expect(component.playing).toBeFalse();
    expect(fixture.nativeElement.querySelector('.trailer-play')).toBeNull();
    expect(playerFrame.src).toContain('controls=0');
  });

  it('starts the clean Vimeo asset immediately without application seeking', async () => {
    const component = fixture.componentInstance;
    const player = createPlayerStub();
    setPlayer(component, player);

    await component.onPlayerReady();

    expect(player.getDuration).toHaveBeenCalledTimes(1);
    expect(player.setMuted).toHaveBeenCalledWith(true);
    expect(player.setCurrentTime).not.toHaveBeenCalled();
    expect(player.pause).not.toHaveBeenCalled();
    expect(player.play).toHaveBeenCalledTimes(1);
    expect(component.videoRevealed).toBeTrue();
  });

  it('resumes an unexpected pause while the autoplay hero remains visible', async () => {
    const component = fixture.componentInstance;
    const player = createPlayerStub();
    setPlayer(component, player);

    await component.onPlayerReady();
    player.play.calls.reset();
    player.setCurrentTime.calls.reset();

    component.onPlayerPlay();
    component.onPlayerTimeUpdate(20);
    component.onPlayerPause();
    await settlePromises();

    expect(player.setCurrentTime).not.toHaveBeenCalled();
    expect(player.play).toHaveBeenCalledTimes(1);
  });

  it('crossfades through the poster around Vimeo native looping without seeking', async () => {
    const component = fixture.componentInstance;
    const player = createPlayerStub();
    setPlayer(component, player);

    await component.onPlayerReady();
    player.setCurrentTime.calls.reset();
    component.onPlayerPlay();
    expect(component.videoRevealed).toBeTrue();

    component.onPlayerTimeUpdate(40.5);
    expect(component.videoRevealed).toBeFalse();
    expect(component.heroCopyVisible).toBeTrue();

    component.onPlayerPlay();
    expect(component.videoRevealed).toBeFalse();

    component.onPlayerTimeUpdate(0.2);
    expect(component.videoRevealed).toBeTrue();
    expect(player.setCurrentTime).not.toHaveBeenCalled();
  });

  it('only shows the cinematic copy at the start and end of the clean loop', async () => {
    const component = fixture.componentInstance;
    const player = createPlayerStub();
    setPlayer(component, player);
    await component.onPlayerReady();

    component.onPlayerTimeUpdate(0);
    expect(component.heroCopyVisible).toBeTrue();

    component.onPlayerTimeUpdate(2.6);
    expect(component.heroCopyVisible).toBeFalse();

    component.onPlayerTimeUpdate(37.2);
    expect(component.heroCopyVisible).toBeTrue();
  });

  it('uses play-only recovery when Vimeo pauses or reaches the end', async () => {
    const component = fixture.componentInstance;
    const player = createPlayerStub();
    setPlayer(component, player);

    await component.onPlayerReady();
    player.setCurrentTime.calls.reset();
    player.play.calls.reset();

    component.onPlayerPlay();
    component.onPlayerPause();
    await settlePromises();

    expect(player.setCurrentTime).not.toHaveBeenCalled();
    expect(player.play).toHaveBeenCalledTimes(1);

    player.setCurrentTime.calls.reset();
    player.play.calls.reset();

    component.onPlayerEnded();
    await settlePromises();

    expect(player.setCurrentTime).not.toHaveBeenCalled();
    expect(player.play).toHaveBeenCalledTimes(1);
  });

  it('pauses outside the viewport and resumes without changing playback position', async () => {
    const component = fixture.componentInstance;
    const player = createPlayerStub();
    setPlayer(component, player);

    component.onPlayerPlay();
    player.pause.calls.reset();
    player.play.calls.reset();
    player.setCurrentTime.calls.reset();

    component.onHeroVisibilityChange(false);
    await settlePromises();

    expect(player.pause).toHaveBeenCalledTimes(1);

    component.onHeroVisibilityChange(true);
    await settlePromises();

    expect(player.setCurrentTime).not.toHaveBeenCalled();
    expect(player.play).toHaveBeenCalledTimes(1);
  });

  it('disables autoplay for reduced motion and keeps the manual play fallback', async () => {
    TestBed.resetTestingModule();
    spyOn(window, 'matchMedia').and.returnValue({ matches: true } as MediaQueryList);
    fixture = await createTrailerFixture();

    const component = fixture.componentInstance;
    const playerFrame = fixture.nativeElement.querySelector('iframe') as HTMLIFrameElement;
    const player = createPlayerStub();
    const playButton = fixture.nativeElement.querySelector('.trailer-play') as HTMLButtonElement;
    setPlayer(component, player);

    expect(component.autoplayAllowed).toBeFalse();
    expect(playerFrame.src).toContain('autoplay=0');
    expect(playButton).not.toBeNull();

    playButton.click();

    expect(player.play).toHaveBeenCalledTimes(1);
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

type PlayerStub = Pick<
  Player,
  'destroy' | 'getDuration' | 'pause' | 'play' | 'ready' | 'setCurrentTime' | 'setMuted'
>;

function createPlayerStub(): jasmine.SpyObj<PlayerStub> {
  const player = jasmine.createSpyObj<PlayerStub>('VimeoPlayer', [
    'destroy',
    'getDuration',
    'pause',
    'play',
    'ready',
    'setCurrentTime',
    'setMuted',
  ]);

  player.destroy.and.resolveTo();
  player.getDuration.and.resolveTo(41.2);
  player.pause.and.resolveTo();
  player.play.and.resolveTo();
  player.ready.and.resolveTo();
  player.setCurrentTime.and.resolveTo(5);
  player.setMuted.and.resolveTo(true);

  return player;
}

function setPlayer(component: Trailer, player: PlayerStub): void {
  Object.defineProperty(component, 'player', { configurable: true, value: player });
}

async function settlePromises(): Promise<void> {
  await Promise.resolve();
  await Promise.resolve();
}
