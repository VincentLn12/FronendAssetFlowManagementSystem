import { inject, Injectable, signal, effect } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';

interface SystemSettingDto {
  id?: number;
  project_name: string;
  logo_path: string;
}

@Injectable({
  providedIn: 'root',
})
export class SystemSettingsService {
  private http = inject(HttpClient);
  private baseUrl = environment.baseUrl + 'systemsettings';

  projectName = signal<string>('ระบบบริหารพัสดุ');
  logoPath = signal<string>('/institute-Logo.png');
  navbarVisible = signal<boolean>(true);
  darkMode = signal<boolean>(false);

  constructor() {
    // โหลดการตั้งค่าเปิด-ปิด Navbar จาก LocalStorage
    const savedNavbar = localStorage.getItem('navbarVisible');
    if (savedNavbar !== null) {
      this.navbarVisible.set(savedNavbar === 'true');
    }

    // โหลดการตั้งค่าโหมดมืด (Dark Mode) จาก LocalStorage
    const savedDarkMode = localStorage.getItem('darkMode');
    if (savedDarkMode !== null) {
      const isDark = savedDarkMode === 'true';
      this.darkMode.set(isDark);
      this.applyTheme(isDark);
    }

    // ดึงข้อมูลการตั้งค่าชื่อโปรเจกต์และโลโก้จาก Backend
    this.fetchSystemSettings();
  }

  fetchSystemSettings() {
    this.http.get<SystemSettingDto>(this.baseUrl).subscribe({
      next: (settings) => {
        if (settings) {
          this.projectName.set(settings.project_name);
          this.logoPath.set(settings.logo_path);
        }
      },
      error: (err) => console.error('Failed to fetch system settings', err),
    });
  }

  updateSystemSettings(projectName: string, logoPath: string) {
    return this.http.put<void>(this.baseUrl, { project_name: projectName, logo_path: logoPath });
  }

  uploadLogo(file: File) {
    const formData = new FormData();
    formData.append('file', file);
    return this.http.post<{ logoPath: string }>(`${this.baseUrl}/upload-logo`, formData);
  }

  resetSystemSettings() {
    return this.http.post<SystemSettingDto>(`${this.baseUrl}/reset`, {});
  }

  getLogoUrl(): string {
    const logo = this.logoPath();
    if (!logo) return '/institute-Logo.png';
    if (logo.startsWith('http') || logo.startsWith('/assets') || logo.startsWith('assets/')) {
      return logo;
    }
    const apiIndex = this.baseUrl.indexOf('/api/');
    if (apiIndex !== -1) {
      const host = this.baseUrl.substring(0, apiIndex);
      return host + logo;
    }
    return logo;
  }


  toggleNavbar() {
    const nextState = !this.navbarVisible();
    this.navbarVisible.set(nextState);
    localStorage.setItem('navbarVisible', String(nextState));
  }

  toggleDarkMode() {
    const nextState = !this.darkMode();
    this.darkMode.set(nextState);
    localStorage.setItem('darkMode', String(nextState));
    this.applyTheme(nextState);
  }

  private applyTheme(isDark: boolean) {
    if (isDark) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }
}
