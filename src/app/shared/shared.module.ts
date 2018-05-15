import { NgModule, ModuleWithProviders } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { ReactiveFormsModule } from '@angular/forms';
import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';

import { ApiInterceptor } from '@app/shared/api.interceptor';
import { PopupService } from '@app/shared/popup.service';
import {
  ObjectKeysPipe,
  ObjectValuesPipe,
  ObjectKeyValuePipe,
} from './pipes/object-iterators.pipe';
import { InfoModalComponent } from '@app/shared/components/info-modal/info-modal.component';

@NgModule({
  imports: [CommonModule, ReactiveFormsModule, HttpClientModule, IonicModule],
  exports: [
    CommonModule,
    ReactiveFormsModule,
    HttpClientModule,
    IonicModule,
    ObjectKeysPipe,
    ObjectValuesPipe,
    ObjectKeyValuePipe,
    InfoModalComponent,
  ],
  declarations: [
    ObjectKeysPipe,
    ObjectValuesPipe,
    ObjectKeyValuePipe,
    InfoModalComponent,
  ],
  entryComponents: [InfoModalComponent],
})
export class SharedModule {
  static forRoot(): ModuleWithProviders {
    return {
      ngModule: SharedModule,
      providers: [
        {
          provide: HTTP_INTERCEPTORS,
          useClass: ApiInterceptor,
          multi: true,
        },
        PopupService,
      ],
    };
  }
}