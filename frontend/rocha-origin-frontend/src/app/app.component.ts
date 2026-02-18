import { Component, signal } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { CommonModule } from '@angular/common';

import { MatSidenavModule } from '@angular/material/sidenav';
import { MatListModule } from '@angular/material/list';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatToolbarModule } from '@angular/material/toolbar';
import { RouterModule } from '@angular/router';
import { MatIconRegistry } from '@angular/material/icon';
import { DomSanitizer } from '@angular/platform-browser';

@Component({
  selector: 'app-root',
  imports: [
    RouterOutlet,
    MatToolbarModule,
    MatButtonModule,
    RouterModule,
    MatSidenavModule,
    MatListModule,
    MatIconModule,
    RouterLink,
    RouterLinkActive,
    CommonModule,
  ],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss',
})
export class App {
  protected readonly title = signal('rocha-origin-frontend');

  isCollapsed = false;
  isManagementOpen = true;

  toggleManagement(): void {
    this.isManagementOpen = !this.isManagementOpen;
  }

  constructor(
    private iconRegistry: MatIconRegistry,
    private sanitizer: DomSanitizer,
  ) {
    this.registerIcons();
  }

  toggleSidebar(): void {
    this.isCollapsed = !this.isCollapsed;
  }

  private registerIcons(): void {
    const icons = [
      'icon-dashboard',
      'icon-orders',
      'icon-clients',
      'icon-cow',
      'icon-meat',
      'icon-setting',
      'icon-add-order',
    ];

    icons.forEach((icon) => {
      this.iconRegistry.addSvgIcon(
        icon,
        this.sanitizer.bypassSecurityTrustResourceUrl(`assets/${icon}.svg`),
      );
    });
  }
}
