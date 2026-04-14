import { ComponentFixture, TestBed } from '@angular/core/testing';
import { App } from './app';

describe('App', () => {
  let fixture: ComponentFixture<App>;
  let app: App;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [App],
    }).compileComponents();

    fixture = TestBed.createComponent(App);
    app = fixture.componentInstance;
    
    await fixture.whenStable();
  });

  it('should create the app', () => {
    expect(app).toBeTruthy();
  });

  // it('should render title', async () => {
  //   const compiled = fixture.nativeElement as HTMLElement;
  //   expect(compiled.querySelector('h1')?.textContent)?.toContain('ahay-edu');
  // });

  // it('should calculate sum correctly', async () => {
  //   app.additionalModel.set({ num1: 5, num2: 10 });
  //   app.calculateSum();
  //   expect(app.sum()).toBe(15);
  // });

  // //Should take into account negative numbers and zero
  // it('should calculate sum with negative numbers and zero', async () => {
  //   app.additionalModel.set({ num1: -5, num2: 0 });
  //   app.calculateSum();
  //   expect(app.sum()).toBe(-5);
  // });

  // //Only numbers should be accepted, but since we are using type safety with signals, this is already enforced at compile time. However, we can still test that the form does not accept non-numeric input.
  // it('should not accept non-numeric input', async () => {
  //   // Simulate non-numeric input by directly setting the model with invalid values
  //   app.additionalModel.set({ num1: NaN, num2: NaN });
  //   app.calculateSum();
  //   expect(app.sum()).toBeNaN();
  // });
  
});
