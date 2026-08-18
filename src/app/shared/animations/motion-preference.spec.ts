import { MOBILE_MOTION_QUERY, shouldDisableMotion } from './motion-preference';

describe('mobile motion preference', () => {
  it('disables decorative motion on mobile viewports', () => {
    spyOn(window, 'matchMedia').and.callFake((query: string) => ({
      matches: query === MOBILE_MOTION_QUERY,
    }) as MediaQueryList);

    expect(shouldDisableMotion()).toBeTrue();
  });

  it('keeps decorative motion on desktop when reduced motion is not requested', () => {
    spyOn(window, 'matchMedia').and.returnValue({ matches: false } as MediaQueryList);

    expect(shouldDisableMotion()).toBeFalse();
  });

  it('disables decorative motion when the visitor requests reduced motion', () => {
    spyOn(window, 'matchMedia').and.callFake((query: string) => ({
      matches: query === '(prefers-reduced-motion: reduce)',
    }) as MediaQueryList);

    expect(shouldDisableMotion()).toBeTrue();
  });
});
