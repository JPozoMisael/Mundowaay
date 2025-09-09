import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { HerbicidasPageRoutingModule } from './herbicidas-routing.module';

import { HerbicidasPage } from './herbicidas.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    HerbicidasPageRoutingModule
  ],
  declarations: [HerbicidasPage]
})
export class HerbicidasPageModule {}
