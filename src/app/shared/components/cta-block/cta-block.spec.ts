import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CtaBlock } from './cta-block';

describe('CtaBlock', () => {
  let component: CtaBlock;
  let fixture: ComponentFixture<CtaBlock>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CtaBlock]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CtaBlock);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
