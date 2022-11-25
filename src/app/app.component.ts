import { Component } from '@angular/core';


@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})

export class AppComponent {
  // Dėl browser warrning: Error with Permissions-Policy header: Unrecognized feature: 'interest-cohort'.
  // The browser is complaining because it's not letting the browser fingerprint you.
  // Dėl google ads/tracking experiments.
  // Čia brave specific nes
  // Brave removes all FLoC support in the browser. 
  // This also removes support for understanding the "disable FLoC" header
  // which is why you're seeing the message you're seeing in the console. 
  // Or, put differently, since Brave doesn't support FLoC, 
  // it also doesn't support the "disable FLoC" command. 
  // So, you can safely disregard this message, knowing that FLoC isn't enabled.
}
