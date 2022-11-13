import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { RouterModule } from '@angular/router';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { ImageCropperModule } from 'ngx-image-cropper';

import { AppComponent } from './app.component';
import { ServerService } from './server.service';
import { CommonModule } from '@angular/common';
import { HomeComponent } from './home/home.component';
import { DragDropDirective } from './drag-drop.directive';

@NgModule({
  declarations: [
    AppComponent,
    HomeComponent,
    DragDropDirective
  ],
  imports: [
    BrowserModule,
    FormsModule,
    NgbModule,
    HttpClientModule,
    BrowserAnimationsModule,
    ImageCropperModule,
    CommonModule,
    RouterModule.forRoot([
      {path: '', component: HomeComponent},
    ])
  ],
  providers: [ServerService],
  bootstrap: [AppComponent]
})
export class AppModule { }
