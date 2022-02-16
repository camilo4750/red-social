import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute, Params } from '@angular/router';
import { User } from 'src/app/models/user';
import { UserService } from 'src/app/services/user.service';

@Component({
  selector: 'login',
  templateUrl: './login.component.html',
  providers: [UserService],
})
export class LoginComponent implements OnInit {
  public title: String;
  public user: User;
  public status: String;
  public identity: any;
  public token: any;

  constructor(
    private _route: ActivatedRoute,
    private _router: Router,
    private _userServices: UserService
  ) {
    this.title = 'Identificate';
    this.user = new User('', '', '', '', '', '', 'ROLE_USER', '');
    this.status = 'String';
    this.token = 'String';
  }

  ngOnInit(): void {
    console.log('Componente del login cargado');
  }

  onSubmit() {
    this._userServices.signup(this.user).subscribe(
      (response) => {
        this.identity = response.user;
        console.log(response.user);
        if (!this.identity || !this.identity._id) {
          this.status = 'error';
        } else {
          console.log('id ->' + 'this.identity._id');
          this.status = 'success';
          // persistir datos user

          //conseguir token
          this.getToken();
        }
        this.status = 'success';
      },
      (err) => {
        let errorMessage = <any>err;
        console.log(errorMessage);
        if (errorMessage != null) {
          this.status = 'error';
        }
      }
    );
  }

  getToken() {
    this._userServices.signup(this.user, 'true').subscribe(
      (response) => {
        this.token = response.token;
        console.log(this.token);
        if (this.token.length <= 0) {
          this.status = 'error';
        } else {
          this.status = 'success';
          // PERSISTIR TOKEN

          // CONSEGUIR LOS DATOS DE LOS CONTADORES
        }
      },
      (error) => {
        var errorMessage = <any>error;
        console.log(errorMessage);
        if (errorMessage != null) {
          this.status = 'error';
        }
      }
    );
  }
}
