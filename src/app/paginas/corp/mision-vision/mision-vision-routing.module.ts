import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { MisionVisionPage } from './mision-vision.page';

const routes: Routes = [
  {
    path: '',
    component: MisionVisionPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class MisionVisionPageRoutingModule {}
