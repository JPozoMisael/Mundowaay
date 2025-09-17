import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';
import { SharedModule } from 'src/app/shared/shared-module';
import { SemillasPageRoutingModule } from './semillas-routing.module';

import { SemillasPage } from './semillas.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    SharedModule,
    IonicModule,
    SemillasPageRoutingModule
  ],
  declarations: [SemillasPage]
})
export class SemillasPageModule {}
