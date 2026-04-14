// Sign In Component Tests
import { ComponentFixture, TestBed } from '@angular/core/testing';
import SignIn from './sign-in';

describe('SignIn Component', () => {
  let component: SignIn;
  let fixture: ComponentFixture<SignIn>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SignIn],
    }).compileComponents();

    fixture = TestBed.createComponent(SignIn);
    component = fixture.componentInstance;

    await fixture.whenStable();
  });

  it('should create the SignIn component', () => {
    expect(component).toBeTruthy();
  });

  it('should have an initial empty login model', () => {
    expect(component.loginModel()).toEqual({ email: '', password: '' });
  });

  it('should validate the form as invalid when fields are empty', () => {
    expect(component.loginForm().invalid()).toBeTruthy();
  });

  it('should validate the form as valid when fields are filled correctly', () => {
    component.loginModel.set({ email: 'test@example.com', password: 'P@ssW0rd@1' });
    expect(component.loginForm().valid()).toBeTruthy();
  });

  // Invalid email format should be caught by the form validation
  it('should validate the form as invalid with incorrect email format', () => {
    component.loginModel.set({ email: 'invalid-email', password: 'P@ssW0rd@1' });
    expect(component.loginForm().valid()).toBeFalsy();
  });

  // Password that does not meet the complexity requirements should be caught by the form validation
  it('should validate the form as invalid with weak password', () => {
    component.loginModel.set({ email: 'test@example.com', password: 'weakpassword' });
    expect(component.loginForm().valid()).toBeFalsy();
  });

});
