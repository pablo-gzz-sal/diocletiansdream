import { Injectable } from '@angular/core';
import { SupportedLang } from './i18n.config';

type PostTranslations = Partial<Record<SupportedLang, string>>;

function normalise(path: string): string {
  const withoutQueryOrHash = path.split('?')[0].split('#')[0];
  return withoutQueryOrHash.length > 1 ? withoutQueryOrHash.replace(/\/$/, '') : '/';
}

@Injectable({ providedIn: 'root' })
export class PostLanguageRouteService {
  private current: { path: string; translations: PostTranslations } | null = null;

  register(path: string, translations: PostTranslations): void {
    this.current = { path: normalise(path), translations };
  }

  clear(): void {
    this.current = null;
  }

  destinationFor(path: string, target: SupportedLang): string | null {
    if (!this.current || this.current.path !== normalise(path)) return null;

    const slug = this.current.translations[target];
    if (!slug || !/^[^/?#]+$/.test(slug)) return null;

    return target === 'hr' ? `/hr/${slug}` : `/${slug}`;
  }
}
