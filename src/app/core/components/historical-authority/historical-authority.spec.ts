import { ComponentFixture, TestBed } from '@angular/core/testing';

import { HistoricalAuthority } from './historical-authority';
import { commonTestImports, commonTestProviders } from '../../../../testing/test-setup';

describe('HistoricalAuthority', () => {
  let fixture: ComponentFixture<HistoricalAuthority>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HistoricalAuthority, ...commonTestImports],
      providers: [...commonTestProviders],
    }).compileComponents();

    fixture = TestBed.createComponent(HistoricalAuthority);
    fixture.detectChanges();
  });

  it('renders the first authority title phrase as an explicit non-breaking line', () => {
    const lines = fixture.nativeElement.querySelectorAll('.historical-authority__title-line');
    const lead = fixture.nativeElement.querySelector(
      '.historical-authority__title-line--lead',
    ) as HTMLElement;

    expect(lines.length).toBe(3);
    expect(lead).not.toBeNull();
    expect(getComputedStyle(lead).whiteSpace).toBe('nowrap');
  });
});
