import { Component, OnInit } from '@angular/core';


@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})

export class AppComponent implements OnInit {

  ngOnInit(): void {
    // reset the height whenever the window's resized
    // window.addEventListener("resize", this.resetHeight);
    // // called to initially set the height.
    // this.resetHeight();
  }

  resetHeight(){
    // const containerHeight = document.getElementById('app-container').offsetHeight + 'px';
    // document.getElementById('scroll-container')
    //   .setAttribute('style', 'max-height: ' + containerHeight);
  }
    
}
