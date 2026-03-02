import { Component, Input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';

@Component({
  selector: 'app-blog-invite',
  standalone: true,
  imports: [RouterLink, TranslateModule],
  templateUrl: './blog-invite.html',
  styleUrl: './blog-invite.css',
})
export class BlogInvite {
  // Optional overrides
  @Input() title = '';
  @Input() text = '';

  // Show secondary links?
  @Input() showSecondaryLinks = false;
}
