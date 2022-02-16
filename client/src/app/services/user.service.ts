import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { User } from '../models/user';
import { GLOBAL } from './global';
@Injectable()
export class UserService {
  public url: String;

  constructor(public http: HttpClient) {
    this.url = GLOBAL.url;
  }
  register(user: User): Observable<any> {
    let json = JSON.stringify(user);
    let params = json;
    let headers = new HttpHeaders().set('Content-Type', 'application/json');
    return this.http.post(this.url + 'register', params, { headers: headers });
  }

  signup(user: any, getToken:string='null'): Observable<any> {
    if(getToken !='null') {
      user.getToken = getToken;
    }
    
    let json = JSON.stringify(user);
    let params = json;
    let headers = new HttpHeaders().set('Content-Type', 'application/json');
    return this.http.post(this.url + 'login', params, { headers: headers });
  }
}
