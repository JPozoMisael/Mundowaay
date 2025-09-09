import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { AcaricidasPageRoutingModule } from './acaricidas-routing.module';

import { AcaricidasPage } from './acaricidas.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    AcaricidasPageRoutingModule
  ],
  declarations: [AcaricidasPage]
})
export class AcaricidasPageModule {}
