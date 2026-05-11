import { Component, inject } from '@angular/core';
import { HeaderComponent } from './layout/header/header.component';
import { RouterOutlet } from '@angular/router';
import { AccountService } from './core/services/account.service';

@Component({
  selector: 'app-root',
  imports: [HeaderComponent, RouterOutlet],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss',
})
export class AppComponent {
  title = 'AssetFlowManagementSystem';
  accountService = inject(AccountService);
}
