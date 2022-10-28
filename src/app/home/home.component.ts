import { Component } from '@angular/core';
import { ServerService } from '../server.service';
import { Prediction } from '../models/Prediction';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent {

  predictions: Prediction[] = [];
  loading: boolean = false;
  selectedFiles: FileList;
  errorText = 'Šioje nuotraukoje neaptikta paukščių. Įkelkite kitą nuotrauką.'
  error: boolean;
  imageUrl: string;
  birdNames = new Map<string, string | null>();

  constructor(private server: ServerService){
    this.birdNames.set('background', null);
  }

  ping(){
    this.loading = true;
    this.server.getAllData().subscribe(response => {
      this.loading = false;
      alert('Serveris veikia');
    });
  }

  onSubmit(){
    if (this.error) {
      return;
    }
    const formData = new FormData();
    const file = this.selectedFiles.item(0);
    formData.append('file', file, file.name);
    this.loading = true;
    this.error = false;
    this.server.sendFile(formData).subscribe(async preds => {
      if (preds.error) {
        this.error = true;
        this.loading = false;
        return;
      }
      this.predictions = await this.procesMultipleCandidates(preds);
      this.loading = false;
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

  onFileUpload(event) {
    this.errorText = 'Šioje nuotraukoje neaptikta paukščių. Įkelkite kitą nuotrauką.';
    this.error = false;
    this.predictions = [];
    this.selectedFiles = event.target.files;
    if (this.selectedFiles.length === 0)
        return;

    const mimeType = this.selectedFiles.item(0).type;
    if (mimeType.match(/image\/*/) == null) {
        this.error = true;
        this.errorText = "Įkeltas ne paveikslėlio failas";
        return;
    }

    const reader = new FileReader();
    reader.readAsDataURL(this.selectedFiles.item(0)); 
    reader.onload = (_event) => { 
        this.imageUrl = reader.result.toString(); 
    }
  }

}
