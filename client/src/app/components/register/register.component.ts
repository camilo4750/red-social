import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute, Params } from '@angular/router';
import { User } from '../../models/user';
import { UserService } from 'src/app/services/user.service';
@Component({
  selector: 'register',
  templateUrl: './register.component.html',
  providers: [UserService],
})
export class RegisterComponent implements OnInit {
  public title: String;
  public user: User;
  public status: String;

  constructor(
    private _route: ActivatedRoute,
    private _router: Router,
    private _UserService: UserService
  ) {
    this.title = 'Registrate';
    this.user = new User('', '', '', '', '', '', 'ROLE_USER', '');
    this.status = 'string';
  }
  ngOnInit() {
    console.log('Component de registro');
  }
  onSubmit(registerForm: any):any {
    this._UserService.register(this.user).subscribe(
      (res) => {
        if (res.user && res.user._id) {
          this.status = 'success';
          registerForm.reset();
        } else {
          this.status = 'error';
        }
      },
      (error) => {
        this.status = 'error';
      }
    );
  }
}
