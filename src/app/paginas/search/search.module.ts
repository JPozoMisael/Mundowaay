import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { SearchPageRoutingModule } from './search-routing.module';
import { Routes, RouterModule } from '@angular/router';
import { SearchPage } from './search.page';

const routes: Routes = [{ path: '', component: SearchPage }];
@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    SearchPageRoutingModule,
    RouterModule.forChild(routes),
  ],
  declarations: [SearchPage]
})
export class SearchPageModule {}
