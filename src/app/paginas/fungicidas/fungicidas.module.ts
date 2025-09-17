import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';
import { SharedModule } from 'src/app/shared/shared-module';
import { FungicidasPageRoutingModule } from './fungicidas-routing.module';

import { FungicidasPage } from './fungicidas.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    SharedModule,
    IonicModule,
    FungicidasPageRoutingModule
  ],
  declarations: [FungicidasPage]
})
export class FungicidasPageModule {}
