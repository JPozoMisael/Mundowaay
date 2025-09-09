import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { FungicidasPage } from './fungicidas.page';

const routes: Routes = [
  {
    path: '',
    component: FungicidasPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class FungicidasPageRoutingModule {}
