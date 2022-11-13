import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpErrorResponse } from '@angular/common/http';
import { Prediction } from './models/Prediction';

const httpOptions = {
  headers: new HttpHeaders({
    'Content-Type': 'application/json'
  })
};

@Injectable({
  providedIn: 'root'
})
export class ServerService {

  // private serviceUrl = 'https://birds-ai.herokuapp.com';
  private serviceUrl = 'https://birdsai.pythonanywhere.com';
  constructor(private http: HttpClient) {}

  getAllData(){
    return this.http.get<string>(this.serviceUrl);
  }

  // sendFile(data: FormData) { //: Observable<Blob>
  //   return this.http.post<Blob>(this.serviceUrl + '/crop', data, {responseType: 'blob' as 'json'});
  // }

  sendFile(data: FormData, cropped: boolean) { //: Observable<Blob>
    // return this.http.post<Prediction[]>(this.serviceUrl + '/predict', data);
    const url = this.serviceUrl + (cropped ? '/predict-crop' : '/predict');
    return this.http.post<any>(url, data);
  }

  getWiki(title: string) {
    const url = 'https://lt.wikipedia.org/api/rest_v1/page/summary/' + title.replace(" ", "_");
    return this.http.get<any>(url);
  }
}
