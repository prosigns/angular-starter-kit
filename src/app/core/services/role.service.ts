import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { HttpService } from './http.service';
import { ApiModuleEnum } from '../enums/api-modules.enum';

export interface IRole {
  id: string;
  name: string;
  description: string;
  permissions: string[];
}

@Injectable({
  providedIn: 'root'
})
export class RoleService {
  private _httpService = inject(HttpService);

  public getRoles(): Observable<IRole[]> {
    return this._httpService.get<IRole[]>(ApiModuleEnum.AUTH, '/roles');
  }

  public getAllUserRoles(): Observable<IRole[]> {
    return this.getRoles();
  }

  public getRoleById(id: string): Observable<IRole> {
    return this._httpService.get<IRole>(ApiModuleEnum.AUTH, `/roles/${id}`);
  }

  public getAssignedRoles(): Observable<IRole[]> {
    return this._httpService.get<IRole[]>(ApiModuleEnum.AUTH, '/roles/assigned');
  }
}
