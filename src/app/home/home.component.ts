import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { ServerService } from '../server.service';
import { Prediction } from '../models/Prediction';
import { CropperPosition, Dimensions, ImageCroppedEvent, ImageCropperComponent } from 'ngx-image-cropper';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit {

  readonly NO_BIRDS = 'Šioje nuotraukoje neaptikta paukščių. Įkelkite kitą nuotrauką.';

  // @ViewChild(ImageCropperComponent) imageCropper: ImageCropperComponent;
  // @ViewChild('uploadedImage') uploadedImage: ElementRef;

  predictions: Prediction[] = [];
  loading: boolean = false;
  loadingImage: boolean = false;
  selectedFiles: FileList;
  errorText = this.NO_BIRDS;
  error: boolean;
  imageUrl: string;
  birdNames = new Map<string, string | null>();
  serverWorks: boolean;
  enabledCrop: boolean;
  croppedImage: string;
  // cropperPos: CropperPosition;

  constructor(private server: ServerService){
    this.birdNames.set('background', 'Nežinoma');
  }

  ngOnInit(): void {
    this.loading = true;
    this.server.getAllData().subscribe(() => {
      this.loading = false;
      this.serverWorks = true;
    },
    err => this.loading = false);
  }

  enableCrop(){
    this.error = false;
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
  }

  cropperReady(dims: Dimensions) {
    //this.imageCropper.cropper = {...this.cropperPos};
    // this.cropperPosition = {
    //   x1: 0, y1: 0, 
    //   x2: (this.uploadedImage.nativeElement as HTMLImageElement).width,  
    //   y2: (this.uploadedImage.nativeElement as HTMLImageElement).height
    // };
  }

  imageCropped(event: ImageCroppedEvent) {
    this.croppedImage = event.base64;
    // this.error = false;
  }

  onSubmit(){
    if (this.error && !this.imageUrl) {
      return;
    }
    
    const formData = new FormData();
    const file = this.enabledCrop && this.croppedImage 
      ? this.dataURItoBlob(this.croppedImage) 
      : this.selectedFiles.item(0);
    formData.append('file', file, file.name);
    this.loadingImage = true;
    this.error = false;
    this.server.sendFile(formData, this.enabledCrop).subscribe(async preds => {
      if (preds.error) {
        this.error = true;
        this.loadingImage = false;
        return;
      }
      this.predictions = await this.procesMultipleCandidates(preds);
      this.error = this.predictions.length === 0;
      this.loadingImage = false;
    });
  }

  async procesMultipleCandidates(data: Prediction[]) {
    let preds = await Promise.all(data.map(pred => this.predToPromise(pred)));
    return preds.filter(pred => pred !== null)
      .map((pred, idx) => {
        pred.class = idx+1 + '. ' + pred.class;
        return pred;
      });
  }

  predToPromise(pred: Prediction): Promise<Prediction | null> {
    const url = 'https://lt.wikipedia.org/wiki/' + pred.class.replace(" ", "_");
    if (this.birdNames.has(pred.class)) {
      const name = this.birdNames.get(pred.class);
      const prediction = new Prediction(name, pred.class === 'background' ? null : url); 
      return Promise.resolve(name === null ? null : prediction);
    }

    return this.server.getWiki(pred.class).toPromise().then(response => {
      this.birdNames.set(pred.class, response.title);
      return new Prediction(response.title, url);
    })
    .catch(err => {
      this.birdNames.set(pred.class, null);
      return Promise.resolve(null);
    });
  }

  clearState(): void {
    // this.cropperPos = null;
    this.enabledCrop = false;
    this.croppedImage = null;
    this.imageUrl = null;
    this.errorText = this.NO_BIRDS;
    this.error = false;
    this.predictions = [];
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

    const reader = new FileReader();
    reader.readAsDataURL(this.selectedFiles.item(0)); 
    reader.onload = (_event) => { 
        this.imageUrl = reader.result.toString();
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
