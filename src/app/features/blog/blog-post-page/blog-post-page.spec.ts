import { ComponentFixture, TestBed } from '@angular/core/testing';
import { of } from 'rxjs';

import { BlogPostPage } from './blog-post-page';
import { SeoService } from '../../../shared/services/seo-service';
import { WpService } from '../../../shared/services/wp-service';
import { commonTestImports, commonTestProviders } from '../../../../testing/test-setup';

describe('BlogPostPage', () => {
  let component: BlogPostPage;
  let fixture: ComponentFixture<BlogPostPage>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BlogPostPage, ...commonTestImports],
      providers: [...commonTestProviders]
    })
    .compileComponents();

    fixture = TestBed.createComponent(BlogPostPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  /**
   * `:slug` (and `hr/:slug`) is a single-segment wildcard, so every unknown
   * one-segment URL lands here rather than on NotFound — /hr/experience/ among
   * them (see app.routes.spec.ts). That is only acceptable because the
   * unknown-slug state is a real 404: noindex plus the status marker the SSR
   * server promotes to an HTTP 404.
   */
  it('serves an unknown slug as a real 404, not a soft one', () => {
    const seo = TestBed.inject(SeoService);
    const robots = spyOn(seo, 'setRobots');
    const status = spyOn(seo, 'setHttpStatus');
    spyOn(TestBed.inject(WpService), 'getPostBySlug').and.returnValue(of([]));

    component.fetch('experience');

    expect(component.post).toBeNull();
    expect(robots).toHaveBeenCalledWith(true);
    expect(status).toHaveBeenCalledWith(404);
  });
});
