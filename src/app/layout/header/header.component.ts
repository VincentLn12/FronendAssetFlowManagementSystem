import { Component, inject } from '@angular/core';
import { MatIcon } from '@angular/material/icon';
import { MatButton } from '@angular/material/button';
import { Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { MatProgressBar } from '@angular/material/progress-bar';
import { BusyService } from '../../core/services/busy.service';
import { AccountService } from '../../core/services/account.service';
import { CommonModule } from '@angular/common';
import { SystemSettingsService } from '../../core/services/system-settings.service';

@Component({
  selector: 'app-header',
  imports: [
    CommonModule,
    MatIcon,
    MatButton,
    RouterLink,
    RouterLinkActive,
    // MatProgressBar,
    RouterOutlet,
  ],
  templateUrl: './header.component.html',
  styleUrl: './header.component.scss',
})
export class HeaderComponent {
  busyService = inject(BusyService);
  accountService = inject(AccountService);
  settingsService = inject(SystemSettingsService);
  private router = inject(Router);
  dropdownOpen = false;

  get sidebarOpen() {
    return this.settingsService.navbarVisible();
  }

  set sidebarOpen(value: boolean) {
    if (this.settingsService.navbarVisible() !== value) {
      this.settingsService.toggleNavbar();
    }
  }

  toggleSidebar() {
    this.settingsService.toggleNavbar();
  }

  toggleDropdown() {
    this.dropdownOpen = !this.dropdownOpen;
  }
  logout() {
    this.accountService.logout().subscribe({
      next: () => {
        this.accountService.currentUser.set(null);
        this.router.navigateByUrl('/account/login');
      },
    });
  }
}

