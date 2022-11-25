import { AfterViewChecked, Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { ServerService } from '../server.service';
import { Prediction } from '../models/Prediction';
import { CropperPosition, Dimensions, ImageCroppedEvent, ImageCropperComponent } from 'ngx-image-cropper';
import { ResponseWrapper } from '../models/ResponseWrapper';
import { NgForm } from '@angular/forms';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit, AfterViewChecked {

  //rezultatai yra tikslesni, tačiau retesni
  readonly NO_BIRDS = 'Šioje nuotraukoje neaptikta paukščių. Įkelkite kitą nuotrauką arba iškirpkite paukštį.';
  readonly TOOL_TIP_CHECKBOX = `Skirta automatiškai surasti paukštį jeigu nuotraukoje yra pašalinių objektų.
    Su šia opcija analizė ilgiau užtrunka, rezultatai yra tikslesni, tačiau paukštį ne visada suranda.
    Jeigu nuotraukoje paukštis dominuoja geriau išjungti šią opciją.
    Pasirinkus "iškirpti" ši opcija bus automatiškai išjungta.`;
  readonly TOOL_TIP_RESULTS = `Top 5 spėjimai. Rezultatai išrikiuoti tikėtinumo tvarka.
    Šalia pateikiamos nuorodos į paukščio vikipedijos puslapį. 
    Lietuviškų paukščių rezultatai pateikiami lietuviškais pavadinimais ir turi nuorodą į ornitologijos puslapį.
    Užsienio paukščiai pateikiami lotyniškais pavadinimais.`;

  // @ViewChild(ImageCropperComponent) imageCropper: ImageCropperComponent;
  // @ViewChild('uploadedImage') uploadedImage: ElementRef;
  @ViewChild('scrollMe') myScrollContainer: ElementRef;

  predictions: Prediction[] = [];
  loading: boolean = false;
  loadingImage: boolean = false;
  selectedFiles: FileList;
  errorText = this.NO_BIRDS;
  error: boolean;
  imageUrl: string;
  //birdNames = new Map<string, string | null>();
  serverWorks: boolean;
  enabledCrop: boolean;
  croppedImage: string;
  containerHeight: string = '';
  autoFind = true;
  submited: boolean;
  // cropperPos: CropperPosition;

  constructor(private server: ServerService){
    //this.birdNames.set('background', 'Nežinoma');
  }

  ngOnInit(): void {
    this.containerHeight = document.getElementById('app-container').offsetHeight + 'px';
    this.loading = true;
    this.server.getAllData().subscribe(() => {
      this.loading = false;
      this.serverWorks = true;
    },
    err => this.loading = false);
  }

  ngAfterViewChecked() {
    if (this.submited) {
      this.scrollToBottom();
      this.submited = false;
    }             
} 

  enableCrop(){
    this.clearErrorState();
    this.enabledCrop = !this.enabledCrop;
    if (this.enabledCrop) {
      this.loading = true;
      // this.cropperPos = {
      //   x1: 0, y1: 0, 
      //   x2: (this.uploadedImage.nativeElement as HTMLImageElement).width - 10,  
      //   y2: (this.uploadedImage.nativeElement as HTMLImageElement).height - 10
      // };
    } 
    // else {
    //   this.cropperPos = null;
    // }
  }

  imageLoaded() {
    this.loading = false;
    this.scrollToTop();
  }

  imageCropped(event: ImageCroppedEvent) {
    this.croppedImage = event.base64;
    // this.clearErrorState();
  }

  onSubmit(form: NgForm){
    if ((this.error && !this.imageUrl) || form.invalid) {
      alert('Atsiprašome, įvyko klaida.');
      return;
    }
    
    const autoFind = form.value.autoFindCheck === true;
    const formData = new FormData();
    const file = this.enabledCrop && this.croppedImage 
      ? this.dataURItoBlob(this.croppedImage) 
      : this.selectedFiles.item(0);
    formData.append('file', file, file.name);
    this.loadingImage = true;
    this.submited = false;
    this.clearErrorState();
    this.server.sendFile(formData, autoFind).subscribe((response: ResponseWrapper) => {
      this.submited = true;
      if (response.error) {
        this.error = true;
        this.loadingImage = false;
        return;
      }
      this.predictions = response.predictions.map((pred, idx) => {
        pred.displayName = idx+1 + '. ' + (pred.lt === null ? pred.lot : pred.lt);
        return pred;
      });
      if (this.predictions.length === 0 || this.predictions[0].lot === 'background') {
        this.predictions = [];
        this.error = true;
        this.errorText = 'Nežinoma. Paukštis nerastas.';
      }
      this.loadingImage = false;
    });
    // this.server.sendFile(formData, autoFind).subscribe(async preds => {
    //   if (preds.error) {
    //     this.error = true;
    //     this.loadingImage = false;
    //     return;
    //   }
    //   this.predictions = await this.procesMultipleCandidates(preds);
    //   this.error = this.predictions.length === 0;
    //   this.loadingImage = false;
    // });
  }

  // async procesMultipleCandidates(data: Prediction[]) {
  //   let preds = await Promise.all(data.map(pred => this.predToPromise(pred)));
  //   return preds.filter(pred => pred !== null)
  //     .map((pred, idx) => {
  //       pred.class = idx+1 + '. ' + pred.class;
  //       return pred;
  //     });
  // }

  // predToPromise(pred: Prediction): Promise<Prediction | null> {
  //   const url = 'https://lt.wikipedia.org/wiki/' + pred.class.replace(" ", "_");
  //   if (this.birdNames.has(pred.class)) {
  //     const name = this.birdNames.get(pred.class);
  //     const prediction = new Prediction(name, pred.class === 'background' ? null : url); 
  //     return Promise.resolve(name === null ? null : prediction);
  //   }

  //   return this.server.getWiki(pred.class).toPromise().then(response => {
  //     this.birdNames.set(pred.class, response.title);
  //     return new Prediction(response.title, url);
  //   })
  //   .catch(err => {
  //     this.birdNames.set(pred.class, null);
  //     return Promise.resolve(null);
  //   });
  // }

  scrollToBottom(): void {
    if (!this.myScrollContainer) {
      return;
    }
    try {
        this.myScrollContainer.nativeElement.scrollTop = this.myScrollContainer.nativeElement.scrollHeight;
    } catch(err) { }                 
  }

  scrollToTop(): void {
    if (!this.myScrollContainer) {
      return;
    }
    setTimeout(() => this.myScrollContainer.nativeElement.scrollTop = 0);
  }

  clearErrorState(): void {
    this.errorText = this.NO_BIRDS;
    this.error = false;
  }

  clearState(): void {
    // this.cropperPos = null;
    this.autoFind = true;
    this.enabledCrop = false;
    this.croppedImage = null;
    this.imageUrl = null;
    this.predictions = [];
    this.clearErrorState();
  }

  onFileUpload(event) {
    this.clearState();
    this.selectedFiles = event.target.files;
    if (this.selectedFiles.length === 0)
        return;

    const mimeType = this.selectedFiles.item(0).type;
    if (mimeType.match(/image\/*/) == null) {
        this.error = true;
        this.errorText = "Įkeltas ne paveikslėlio failas!";
        return;
    }
    this.loading = true;
    const reader = new FileReader();
    reader.readAsDataURL(this.selectedFiles.item(0)); 
    reader.onload = (_event) => { 
        this.imageUrl = reader.result.toString();
        this.loading = false;
    }
    // this.onSubmit();
  }

  dataURItoBlob(dataURI) {
    const byteString = window.atob(dataURI.split(",")[1]);
    const arrayBuffer = new ArrayBuffer(byteString.length);
    const int8Array = new Uint8Array(arrayBuffer);
    for (let i = 0; i < byteString.length; i++) {
      int8Array[i] = byteString.charCodeAt(i);
    }
    const blob = new Blob([int8Array], { type: 'image/jpeg' });    
    return new File([blob], 'iskirptas.jpeg', { type: 'image/jpeg' });
  }

}
