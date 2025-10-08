import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { IydPage } from './iyd.page';

const routes: Routes = [
  {
    path: '',
    component: IydPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class IydPageRoutingModule {}
