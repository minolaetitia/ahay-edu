import { Component, signal } from '@angular/core';
import { form } from '@angular/forms/signals';
import { RouterOutlet } from '@angular/router';

interface AdditionalModel {
  num1: number;
  num2: number;
}

@Component({
  selector: 'app-root',
  imports: [ RouterOutlet],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {
  protected readonly title = signal('ahay-edu');
  
  // Signal Form for little addition form
  additionalModel = signal<AdditionalModel>({ num1: 0, num2: 0 });
  sum = signal(0);

  additionalForm = form(this.additionalModel)


  calculateSum(): void {
    const { num1, num2 } = this.additionalModel();
    this.sum.set(num1 + num2);
  }

}
