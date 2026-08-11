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
    const bookingDock = fixture.nativeElement.querySelector('.booking-dock') as HTMLElement;
    const bookingCta = fixture.nativeElement.querySelector(
      '[data-testid="hero-booking-cta"]',
    ) as HTMLAnchorElement;
    const bookingFacts = bookingDock.querySelectorAll('.booking-fact');

    expect(heading).withContext('hero heading').not.toBeNull();
    expect(bookingFacts.length).toBe(4);
    expect(fixture.nativeElement.querySelector('.trailer-trust')).not.toBeNull();
    expect(playerFrame).withContext('Vimeo player frame').not.toBeNull();
    expect(playerFrame.classList.contains('trailer-video')).toBeTrue();
    expect(playerFrame.src).toContain('player.vimeo.com/video/1217274878');
    expect(playerFrame.src).toContain('dnt=1');
    expect(playerFrame.src).toContain('autoplay=1');
    expect(playerFrame.src).toContain('muted=1');
    expect(bookingCta).withContext('hero booking CTA').not.toBeNull();
    expect(bookingCta.getAttribute('href')).toBe('/booking');
  });

  it('renders the Vimeo player as a full-viewport hero background', () => {
    const hero = fixture.nativeElement.querySelector('#trailer') as HTMLElement;
    const playerFrame = fixture.nativeElement.querySelector('iframe') as HTMLIFrameElement;

    expect(hero.classList.contains('trailer--full-viewport')).toBeTrue();
    expect(playerFrame.classList.contains('trailer-video')).toBeTrue();
    expect(fixture.nativeElement.querySelector('.reel')).toBeNull();
  });

  it('keeps Vimeo controls available after the trailer is paused', () => {
    const component = fixture.componentInstance;
    const playerFrame = fixture.nativeElement.querySelector('iframe') as HTMLIFrameElement;

    component.onPlayerPlay();
    fixture.detectChanges();

    component.onPlayerPause();
    fixture.detectChanges();

    expect(component.hasStarted).toBeTrue();
    expect(component.playing).toBeFalse();
    expect(fixture.nativeElement.querySelector('.trailer-play')).toBeNull();
    expect(playerFrame.src).toContain('controls=1');
  });

  it('starts the clean loop after the opening branding and resets once before the closing branding', async () => {
    const component = fixture.componentInstance;
    const player = createPlayerStub();
    setPlayer(component, player);

    await component.onPlayerReady();

    expect(player.setCurrentTime).toHaveBeenCalledWith(5);
    expect(player.setMuted).toHaveBeenCalledWith(true);
    expect(player.play).toHaveBeenCalledTimes(1);

    component.onPlayerTimeUpdate(47.2);
    component.onPlayerTimeUpdate(47.2);

    expect(player.setCurrentTime).toHaveBeenCalledTimes(2);

    await settlePromises();

    expect(player.play).toHaveBeenCalledTimes(2);
  });

  it('only shows the cinematic copy at the start and end of the clean loop', () => {
    const component = fixture.componentInstance;

    component.onPlayerTimeUpdate(5);
    expect(component.heroCopyVisible).toBeTrue();

    component.onPlayerTimeUpdate(10.1);
    expect(component.heroCopyVisible).toBeFalse();

    component.onPlayerTimeUpdate(43.2);
    expect(component.heroCopyVisible).toBeTrue();
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

type PlayerStub = Pick<Player, 'destroy' | 'play' | 'ready' | 'setCurrentTime' | 'setMuted'>;

function createPlayerStub(): jasmine.SpyObj<PlayerStub> {
  const player = jasmine.createSpyObj<PlayerStub>('VimeoPlayer', [
    'destroy',
    'play',
    'ready',
    'setCurrentTime',
    'setMuted',
  ]);

  player.destroy.and.resolveTo();
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
