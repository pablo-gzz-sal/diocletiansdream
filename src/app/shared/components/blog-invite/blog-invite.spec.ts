import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BlogInvite } from './blog-invite';
import { commonTestImports, commonTestProviders } from '../../../../testing/test-setup';

describe('BlogInvite', () => {
  let component: BlogInvite;
  let fixture: ComponentFixture<BlogInvite>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BlogInvite, ...commonTestImports],
      providers: [...commonTestProviders]
    })
    .compileComponents();

    fixture = TestBed.createComponent(BlogInvite);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('exposes mobile-safe action hooks for every invitation link', () => {
    component.showSecondaryLinks = true;
    fixture.detectChanges();

    const actions = fixture.nativeElement.querySelector('.blog-invite-actions');
    const links = fixture.nativeElement.querySelectorAll('.blog-invite-action');

    expect(actions).not.toBeNull();
    expect(links.length).toBe(3);
  });
});
