import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BlogPostPage } from './blog-post-page';
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
});
