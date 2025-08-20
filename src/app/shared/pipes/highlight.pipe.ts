import { Pipe, PipeTransform } from '@angular/core';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';

@Pipe({
  name: 'highlight',
  standalone: true
})
export class HighlightPipe implements PipeTransform {
  constructor(private sanitizer: DomSanitizer) {}

  transform(text: string, search: string): SafeHtml {
    if (!search || !text) {
      return this.sanitizer.bypassSecurityTrustHtml(text);
    }

    // Escape special RegExp characters
    const searchRegex = search.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

    // Create regex with all separate words from search
    const regex = new RegExp(
      `(${searchRegex
        .split(' ')
        .filter(t => t.length > 0)
        .join('|')})`,
      'gi'
    );

    // Replace matches with highlighted version
    const replaced = text.replace(regex, '<span class="highlight">$1</span>');

    // Return sanitized HTML
    return this.sanitizer.bypassSecurityTrustHtml(replaced);
  }
}
