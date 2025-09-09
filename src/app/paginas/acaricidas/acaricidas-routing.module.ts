import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { AcaricidasPage } from './acaricidas.page';

const routes: Routes = [
  {
    path: '',
    component: AcaricidasPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class AcaricidasPageRoutingModule {}
