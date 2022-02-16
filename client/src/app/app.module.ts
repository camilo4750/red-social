import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { routing, appRoutingProviders } from './app.routing';
import { FormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';

// components
import { AppComponent } from './app.component';
import { LoginComponent } from './components/login/login.component';
import { RegisterComponent } from './components/register/register.component';
@NgModule({
  declarations: [
    // componentes
    AppComponent,
    LoginComponent,
    RegisterComponent,
  ],
  imports: [
    // modulos
    BrowserModule,
    routing,
    FormsModule,
    HttpClientModule,
  ],
  providers: [
    //servicio
    appRoutingProviders,
  ],
  bootstrap: [AppComponent],
})
export class AppModule {}
