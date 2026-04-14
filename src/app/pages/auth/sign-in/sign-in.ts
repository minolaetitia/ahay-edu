import { Component, signal } from '@angular/core';
import {
  email,
  form,
  FormField,
  minLength,
  pattern,
  required,
  submit,
} from '@angular/forms/signals';
import { LoginData } from './types/login-data';

@Component({
  selector: 'app-sign-in',
  templateUrl: './sign-in.html',
  styleUrls: ['./sign-in.scss'],
  imports: [FormField],
})
export default class SignIn {
  loginModel = signal<LoginData>({
    email: '',
    password: '',
  });

  private readonly passwordRegex =
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[$@$!%*?&])[A-Za-z\d$@$!%*?&].{8,}$/;

  // Signal Form for sign-in - Add Validators as needed for email and password fields
  loginForm = form(this.loginModel, (schemaPath) => {
    required(schemaPath.email, { message: 'Email is required' });
    email(schemaPath.email, { message: 'Please enter a valid email address' });

    required(schemaPath.password, { message: 'Password is required' });
    //Password must be at least 6 characters - Must have at least one uppercase letter, one lowercase letter, a special character and one number
    //Regex pattern for password validation: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{6,}$/
    minLength(schemaPath.password, 8, { message: 'Password must be at least 8 characters' });
    pattern(schemaPath.password, this.passwordRegex, {
      message:
        'Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character',
    });
  });

  onSubmit(event: Event) {
    event.preventDefault();
    submit(this.loginForm, {
      action: async () => {
        const credentials = this.loginModel();
        // In a real app, this would be async:
        // await this.authService.login(credentials);
        console.log('Logging in with:', credentials);
      },
    });
  }
}
