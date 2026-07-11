import { DefaultUrlSerializer, UrlSerializer, UrlTree } from '@angular/router';

/**
 * URL serializer that makes the app trailing-slash canonical (matching the old
 * WordPress permalinks, e.g. `/what-to-do-in-split/`).
 *
 * - `parse()` strips a trailing slash before matching, so both `/foo` and
 *   `/foo/` resolve to the same route (no client-side redirect loop).
 * - `serialize()` re-adds the trailing slash, so RouterLink hrefs and the
 *   address bar consistently show the slash form.
 *
 * Root (`/`), files (a dot in the last path segment) and the query/fragment are
 * left untouched.
 */
export class TrailingSlashUrlSerializer implements UrlSerializer {
  private readonly base = new DefaultUrlSerializer();

  parse(url: string): UrlTree {
    return this.base.parse(this.stripTrailingSlash(url));
  }

  serialize(tree: UrlTree): string {
    return this.addTrailingSlash(this.base.serialize(tree));
  }

  private splitPath(url: string): { path: string; rest: string } {
    const i = url.search(/[?#]/);
    return i === -1 ? { path: url, rest: '' } : { path: url.slice(0, i), rest: url.slice(i) };
  }

  private stripTrailingSlash(url: string): string {
    const { path, rest } = this.splitPath(url);
    if (path.length > 1 && path.endsWith('/')) {
      return path.slice(0, -1) + rest;
    }
    return url;
  }

  private addTrailingSlash(url: string): string {
    const { path, rest } = this.splitPath(url);
    const lastSegment = path.split('/').pop() ?? '';
    if (path === '/' || path.endsWith('/') || lastSegment.includes('.')) {
      return url;
    }
    return `${path}/${rest}`;
  }
}

export const trailingSlashUrlSerializerProvider = {
  provide: UrlSerializer,
  useClass: TrailingSlashUrlSerializer,
};
