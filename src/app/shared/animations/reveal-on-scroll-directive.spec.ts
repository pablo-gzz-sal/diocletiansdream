import { ElementRef } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { RevealOnScrollDirective } from './reveal-on-scroll-directive';

describe('RevealOnScrollDirective', () => {
  it('should create an instance', () => {
    // The directive injects PLATFORM_ID in a field initializer, so it must be
    // constructed inside an injection context.
    const directive = TestBed.runInInjectionContext(
      () => new RevealOnScrollDirective(new ElementRef(document.createElement('div'))),
    );
    expect(directive).toBeTruthy();
  });
});
