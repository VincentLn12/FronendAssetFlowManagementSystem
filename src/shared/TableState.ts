import { Params } from '../app/shared/models/allType';

export class TableState {
  params = new Params();

  onSearch(value: string, reload: () => void) {
    this.params.search = value;
    this.params.pageNumber = 1;
    reload();
  }

  onPageChange(page: number, reload: () => void) {
    this.params.pageNumber = page;
    reload();
  }

  onSort(value: string, reload: () => void) {
    this.params.sort = value;
    this.params.pageNumber = 1;
    reload();
  }
}
