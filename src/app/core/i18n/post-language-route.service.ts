import { Injectable } from '@angular/core';
import { SupportedLang } from './i18n.config';

type PostTranslations = Partial<Record<SupportedLang, string>>;

function normalise(path: string): string {
  const withoutQueryOrHash = path.split('?')[0].split('#')[0];
  return withoutQueryOrHash.length > 1 ? withoutQueryOrHash.replace(/\/$/, '') : '/';
}

function isSafeSlug(value: unknown): value is string {
  if (typeof value !== 'string' || value.length === 0) return false;

  let decoded: string;
  try {
    decoded = decodeURIComponent(value);
  } catch {
    return false;
  }

  return (
    decoded.length > 0 &&
    !/[/\\?#;()\u0000-\u001F\u007F]/.test(decoded) &&
    !/^\.+$/.test(decoded)
  );
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
    if (!isSafeSlug(slug)) return null;

    return target === 'hr' ? `/hr/${slug}` : `/${slug}`;
  }
}
