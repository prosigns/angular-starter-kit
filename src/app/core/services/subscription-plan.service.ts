import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { HttpService } from './http.service';
import { ApiModuleEnum } from '../enums/api-modules.enum';
import {
  SubscriptionPlan,
  SubscriptionPlanListResponse,
  CreateSubscriptionPlanRequest,
  UpdateSubscriptionPlanRequest
} from '@features/primary/subscription-plans/subscription-plan.model';

@Injectable({
  providedIn: 'root'
})
export class SubscriptionPlanService {
  private _httpService = inject(HttpService);
  private readonly _module = ApiModuleEnum.OPERATORS;

  public getSubscriptionPlans(params?: {
    pageNumber?: number;
    pageSize?: number;
    searchString?: string;
    orderBy?: string[];
  }): Observable<SubscriptionPlanListResponse> {
    const httpParams: Record<string, string | number | boolean | readonly string[]> = {};
    if (params?.pageNumber !== undefined) httpParams['pageNumber'] = params.pageNumber;
    if (params?.pageSize !== undefined) httpParams['pageSize'] = params.pageSize;
    if (params?.searchString) httpParams['searchString'] = params.searchString;
    if (params?.orderBy && params.orderBy.length > 0) httpParams['orderBy'] = params.orderBy;

    return this._httpService.get<SubscriptionPlanListResponse>(
      this._module,
      '/subscriptionplans/list',
      { params: httpParams }
    );
  }

  public getSubscriptionPlanById(id: string): Observable<SubscriptionPlan> {
    return this._httpService.get<SubscriptionPlan>(this._module, `/subscriptionplans/${id}`);
  }

  public createSubscriptionPlan(
    request: CreateSubscriptionPlanRequest
  ): Observable<SubscriptionPlan> {
    return this._httpService.post<SubscriptionPlan>(
      this._module,
      '/subscriptionplans/create',
      request
    );
  }

  public updateSubscriptionPlan(
    id: string,
    request: UpdateSubscriptionPlanRequest
  ): Observable<SubscriptionPlan> {
    return this._httpService.put<SubscriptionPlan>(
      this._module,
      `/subscriptionplans/${id}`,
      request
    );
  }

  public deleteSubscriptionPlan(id: string): Observable<void> {
    return this._httpService.delete<void>(this._module, `/subscriptionplans/${id}`);
  }

  public getSubscriptionPlansForDropdown(): Observable<{ id: string; name: string }[]> {
    return this._httpService
      .get<{ id: string; name: string }[]>(this._module, '/subscriptionplans/dropdown')
      .pipe(map(response => (Array.isArray(response) ? response : [])));
  }
}
