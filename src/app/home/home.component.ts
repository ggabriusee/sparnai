import { Component, OnInit } from '@angular/core';
import { ServerService } from '../server.service';
import { Prediction } from '../models/Prediction';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit {

  predictions: Prediction[] = [];
  loading: boolean = false;
  loadingImage: boolean = false;
  selectedFiles: FileList;
  errorText = 'Šioje nuotraukoje neaptikta paukščių. Įkelkite kitą nuotrauką.'
  error: boolean;
  imageUrl: string;
  birdNames = new Map<string, string | null>();
  serverWorks: boolean;

  constructor(private server: ServerService){
    this.birdNames.set('background', null);
  }

  ngOnInit(): void {
    this.loading = true;
    this.server.getAllData().subscribe(() => {
      this.loading = false;
      this.serverWorks = true;
    },
    err => this.loading = false);
  }

  onSubmit(){
    if (this.error) {
      return;
    }
    const formData = new FormData();
    const file = this.selectedFiles.item(0);
    formData.append('file', file, file.name);
    this.loadingImage = true;
    this.error = false;
    this.server.sendFile(formData).subscribe(async preds => {
      console.log('atsakymas is servako', preds);
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
    return preds.filter(pred => pred !== null);
  }

  predToPromise(pred: Prediction): Promise<Prediction | null> {
    const url = 'https://lt.wikipedia.org/wiki/' + pred.class.replace(" ", "_");
    if (this.birdNames.has(pred.class)) {
      const name = this.birdNames.get(pred.class);
      return Promise.resolve(name === null ? null : new Prediction(name, url));
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
    this.imageUrl = null;
    this.errorText = 'Šioje nuotraukoje neaptikta paukščių. Įkelkite kitą nuotrauką.';
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
    this.onSubmit();
  }

}
