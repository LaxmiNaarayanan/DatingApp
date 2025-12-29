import { HttpClient } from '@angular/common/http';
import { inject, Injectable, signal } from '@angular/core';
import { RegisterCreds, User } from '../../types/user';
import { tap } from 'rxjs';
import { environment } from '../../environments/environment';
import { LikesService } from './likes-service';

@Injectable({
  providedIn: 'root'
})
export class AccountService {
  private http = inject(HttpClient);
  private likesService = inject(LikesService);
  currentUser = signal<User | null>(null);
  private baseUrl = environment.apiUrl;

  register(creds: RegisterCreds) {
    return this.http.post<User>(this.baseUrl + 'account/register', creds, {withCredentials: true}).pipe(
      tap((user: User) => {
        if (user) {
          this.setCurrentUser(user);
          this.startTokenRefreshInterval();
        }
      })
    );
  }

  login(creds: any) {
    return this.http.post<User>(this.baseUrl + 'account/login', creds, {withCredentials: true}).pipe(
      tap((user: User) => {
        if (user) {
          this.setCurrentUser(user);
          this.startTokenRefreshInterval();
        }
      })
    );
  }

  refreshToken() {
    return this.http.post<User>(this.baseUrl + 'account/refresh-token', {}, {withCredentials: true})
  }

  startTokenRefreshInterval() {
    setInterval(() => {
      this.http.post<User>(this.baseUrl + 'account/refresh-token', {}, {withCredentials: true})
        .subscribe({
          next: user => {
            this.setCurrentUser(user);
          },
          error: () => {
            this.logout();
          }
        })
    }, 5 * 60 * 1000); // every 5 minutes
  }

  setCurrentUser(user: User) {
    user.roles = this.getRoleFromToken(user);
    this.currentUser.set(user);
    this.likesService.getLikeIds();
  }


  logout() {
    localStorage.removeItem('filters');
    this.likesService.clearLikeIds();
    this.currentUser.set(null);
  }

  private getRoleFromToken(user: User): string[] {
    const payload = user.token.split('.')[1];
    const decodedPayload = atob(payload);
    const jsonPayload = JSON.parse(decodedPayload);
    return Array.isArray(jsonPayload['role']) ? jsonPayload['role'] : [jsonPayload['role']];
  }
}
