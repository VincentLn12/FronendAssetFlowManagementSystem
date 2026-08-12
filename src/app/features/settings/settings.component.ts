import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatIcon } from '@angular/material/icon';
import { SystemSettingsService } from '../../core/services/system-settings.service';
import { AccountService } from '../../core/services/account.service';
import { SnackbarService } from '../../core/services/snackbar.service';

@Component({
  selector: 'app-settings',
  standalone: true,
  imports: [CommonModule, FormsModule, MatIcon],
  templateUrl: './settings.component.html',
  styleUrl: './settings.component.scss'
})
export class SettingsComponent implements OnInit {
  settingsService = inject(SystemSettingsService);
  accountService = inject(AccountService);
  snackbarService = inject(SnackbarService);

  projectNameInput = '';
  selectedFile: File | null = null;
  previewUrl: string | null = null;
  isSaving = false;

  ngOnInit() {
    this.projectNameInput = this.settingsService.projectName();
  }

  onFileSelected(event: any) {
    const file = event.target.files[0];
    if (!file) return;

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/svg+xml'];
    if (!allowedTypes.includes(file.type)) {
      this.snackbarService.error('อนุญาตเฉพาะไฟล์รูปภาพ (PNG, JPG, JPEG, SVG) เท่านั้น');
      return;
    }

    // Validate size (2MB)
    if (file.size > 2 * 1024 * 1024) {
      this.snackbarService.error('ขนาดรูปภาพต้องไม่เกิน 2MB');
      return;
    }

    this.selectedFile = file;

    // Create preview url
    const reader = new FileReader();
    reader.onload = () => {
      this.previewUrl = reader.result as string;
    };
    reader.readAsDataURL(file);
  }

  saveSettings() {
    if (!this.projectNameInput.trim()) {
      this.snackbarService.error('กรุณาระบุชื่อโปรเจกต์');
      return;
    }

    this.isSaving = true;

    const saveDetails = (logoPath: string) => {
      this.settingsService.updateSystemSettings(this.projectNameInput, logoPath).subscribe({
        next: () => {
          this.settingsService.projectName.set(this.projectNameInput);
          if (logoPath) {
            this.settingsService.logoPath.set(logoPath);
          }
          this.selectedFile = null;
          this.previewUrl = null;
          this.snackbarService.success('บันทึกการตั้งค่าระบบเรียบร้อยแล้ว');
          this.isSaving = false;
        },
        error: (err) => {
          console.error(err);
          this.snackbarService.error('ไม่สามารถบันทึกข้อมูลการตั้งค่าได้');
          this.isSaving = false;
        }
      });
    };

    if (this.selectedFile) {
      this.settingsService.uploadLogo(this.selectedFile).subscribe({
        next: (res) => {
          saveDetails(res.logoPath);
        },
        error: (err) => {
          console.error(err);
          this.snackbarService.error('อัปโหลดโลโก้ไม่สำเร็จ');
          this.isSaving = false;
        }
      });
    } else {
      saveDetails(this.settingsService.logoPath());
    }
  }

  resetSettings() {
    if (confirm('คุณต้องการรีเซ็ตการตั้งค่าระบบกลับเป็นค่าเริ่มต้นใช่หรือไม่?')) {
      this.isSaving = true;
      this.settingsService.resetSystemSettings().subscribe({
        next: (res) => {
          this.settingsService.projectName.set(res.project_name);
          this.settingsService.logoPath.set(res.logo_path);
          this.projectNameInput = res.project_name;
          this.selectedFile = null;
          this.previewUrl = null;
          this.snackbarService.success('รีเซ็ตการตั้งค่าระบบเป็นค่าเริ่มต้นเรียบร้อยแล้ว');
          this.isSaving = false;
        },
        error: (err) => {
          console.error(err);
          this.snackbarService.error('รีเซ็ตการตั้งค่าไม่สำเร็จ');
          this.isSaving = false;
        }
      });
    }
  }

  toggleNavbar() {
    this.settingsService.toggleNavbar();
  }

  toggleDarkMode() {
    this.settingsService.toggleDarkMode();
  }
}
