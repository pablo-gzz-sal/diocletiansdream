import { ensureGoogleTagBridge } from './thank-you';

describe('ensureGoogleTagBridge', () => {
  it('creates a Google tag queue before the TuriTop purchase script runs', () => {
    const testWindow = {} as Window & {
      dataLayer?: IArguments[];
      gtag?: (...args: unknown[]) => void;
    };
    const testDocument = { defaultView: testWindow } as Document;

    ensureGoogleTagBridge(testDocument);

    expect(typeof testWindow.gtag).toBe('function');
    expect(testWindow.dataLayer).toBeDefined();
    expect(Array.from(testWindow.dataLayer![0])).toEqual(['js', jasmine.any(Date)]);
    expect(Array.from(testWindow.dataLayer![1])).toEqual(['config', 'G-QN1CZT8HXQ']);
    expect(Array.from(testWindow.dataLayer![2])).toEqual(['config', 'AW-11199515913']);
  });

  it('does not add duplicate configuration when the site-wide Google tag exists', () => {
    const existingQueue: IArguments[] = [];
    const existingGtag = (...args: unknown[]) => existingQueue.push(args as unknown as IArguments);
    const testWindow = {
      dataLayer: existingQueue,
      gtag: existingGtag,
    } as unknown as Window & {
      dataLayer?: IArguments[];
      gtag?: (...args: unknown[]) => void;
    };

    ensureGoogleTagBridge({ defaultView: testWindow } as Document);

    expect(testWindow.gtag).toBe(existingGtag);
    expect(existingQueue).toEqual([]);
  });
});
