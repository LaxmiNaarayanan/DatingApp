import { Component, inject, input, output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { AccountService } from '../_services/account.service';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './register.component.html',
  styleUrl: './register.component.css'
})
export class RegisterComponent {
 private accountService = inject(AccountService);
 private toastr = inject(ToastrService);
//  usersFromHomeComponent = input.required<any>();
 cancelRegister = output<boolean>();
 model: any = {}

  register() {
    this.accountService.register(this.model).subscribe({
      next: (res) => {
        console.log(res);
        this.cancel();
      },
      error: (err) => this.toastr.error(err.error)});

    console.log(this.model);
    // Call the API to register the user
    // this.http.post('http://localhost:5000/api/account/register', this.model).subscribe({
    //   next: (res) => console.log(res),
    //   error: (err) => console.error(err),
    //   complete: () => console.log('Request completed')
    // });
  }
  cancel() {
    this.cancelRegister.emit(false);
    console.log('cancelled');
  }
}
