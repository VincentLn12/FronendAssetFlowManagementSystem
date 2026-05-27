import { Component, OnInit, inject, signal } from '@angular/core';
import { DataTableComponent } from '../../../shared/data-table/data-table.component';
import { Pagination } from '../../shared/models/pagination';
import { Params } from '../../shared/models/allType';
import { TableState } from '../../../shared/TableState';
import { UserService } from './service/users.service';
import { usersType } from './interface/usersType';

@Component({
  selector: 'app-departments',
  standalone: true,
  imports: [DataTableComponent],
  templateUrl: './users.component.html',
})
export class UsersComponent implements OnInit {
  private table = new TableState();
  private userServive = inject(UserService);

  user?: Pagination<usersType>;
  users = signal<usersType[]>([]);

  Params = new Params();

  ngOnInit(): void {
    this.getUsers();
  }

  getUsers() {
    this.userServive.getUser(this.table.params).subscribe({
      next: (response) => {
        this.user = response;
        this.users.set(response.data);
      },
      error: (error) => console.error(error),
    });
  }

  onSearch(value: string) {
    this.table.onSearch(value, () => this.getUsers());
  }

  onPageChange(page: number) {
    this.table.onPageChange(page, () => this.getUsers());
  }

  onSort(value: string) {
    this.table.onSort(value, () => this.getUsers());
  }

  sortOptions = [
    { label: 'ชื่อ ก-ฮ', value: 'nameAsc' },
    { label: 'ชื่อ ฮ-ก', value: 'nameDesc' },
    { label: 'ใหม่ล่าสุด', value: 'latest' },
    { label: 'เก่าสุด', value: 'oldest' },
  ];

  columns: { label: string; key: string; type?: 'text' | 'price' | 'badge' }[] = [
    { label: 'ชื่อผู้ใช้', key: 'userName' },
    { label: 'อีเมล', key: 'email' },
    { label: 'เบอร์โทร', key: 'phone' },
  ];
}
