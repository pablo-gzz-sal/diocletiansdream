import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BlogInvite } from './blog-invite';

describe('BlogInvite', () => {
  let component: BlogInvite;
  let fixture: ComponentFixture<BlogInvite>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BlogInvite]
    })
    .compileComponents();

    fixture = TestBed.createComponent(BlogInvite);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
