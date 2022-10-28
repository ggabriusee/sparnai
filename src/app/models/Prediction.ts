export class Prediction {
    class: string;
    confidence: number;
    url: string;
    error: string;

    constructor(className: string, url: string){
        this.class = className;
        this.url = url;
    }
}