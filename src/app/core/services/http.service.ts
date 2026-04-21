import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, retry, map } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import { ApiModuleEnum } from '../enums/api-modules.enum';

export interface IHttpOptions {
  headers?: HttpHeaders | Record<string, string | string[]>;
  params?:
    | HttpParams
    | Record<string, string | number | boolean | readonly (string | number | boolean)[]>;
  observe?: 'body';
  reportProgress?: boolean;
  responseType?: 'json';
  withCredentials?: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class HttpService {
  private readonly _baseUrl = environment.apiUrl || 'http://localhost:3000/api';
  private _http = inject(HttpClient);

  public get<T>(module: ApiModuleEnum, endpoint: string, options?: IHttpOptions): Observable<T> {
    return this._http.get<T>(this._buildUrl(module, endpoint), options).pipe(
      retry(1),
      map(response => this._checkApiResponse<T>(response)),
      catchError(this._handleError)
    );
  }

  public getRaw<T>(module: ApiModuleEnum, endpoint: string, options?: IHttpOptions): Observable<T> {
    return this._http
      .get<T>(this._buildUrl(module, endpoint), options)
      .pipe(catchError(this._handleError));
  }

  public post<T>(
    module: ApiModuleEnum,
    endpoint: string,
    data: unknown,
    options?: IHttpOptions
  ): Observable<T> {
    return this._http.post<T>(this._buildUrl(module, endpoint), data, options).pipe(
      map(response => this._checkApiResponse<T>(response)),
      catchError(this._handleError)
    );
  }

  public put<T>(
    module: ApiModuleEnum,
    endpoint: string,
    data: unknown,
    options?: IHttpOptions
  ): Observable<T> {
    return this._http.put<T>(this._buildUrl(module, endpoint), data, options).pipe(
      map(response => this._checkApiResponse<T>(response)),
      catchError(this._handleError)
    );
  }

  public patch<T>(
    module: ApiModuleEnum,
    endpoint: string,
    data: unknown,
    options?: IHttpOptions
  ): Observable<T> {
    return this._http.patch<T>(this._buildUrl(module, endpoint), data, options).pipe(
      map(response => this._checkApiResponse<T>(response)),
      catchError(this._handleError)
    );
  }

  public delete<T>(module: ApiModuleEnum, endpoint: string, options?: IHttpOptions): Observable<T> {
    return this._http.delete<T>(this._buildUrl(module, endpoint), options).pipe(
      map(response => this._checkApiResponse<T>(response)),
      catchError(this._handleError)
    );
  }

  public upload<T>(
    module: ApiModuleEnum,
    endpoint: string,
    file: File,
    additionalData?: Record<string, unknown>
  ): Observable<T> {
    const formData = new FormData();
    formData.append('file', file);

    if (additionalData) {
      Object.keys(additionalData).forEach(key => {
        const value = additionalData[key];
        formData.append(key, String(value));
      });
    }

    return this._http
      .post<T>(this._buildUrl(module, endpoint), formData)
      .pipe(catchError(this._handleError));
  }

  public download(module: ApiModuleEnum, endpoint: string): Observable<Blob> {
    return this._http
      .get(this._buildUrl(module, endpoint), {
        responseType: 'blob'
      })
      .pipe(catchError(this._handleError));
  }

  public setAuthToken(token: string): HttpHeaders {
    return new HttpHeaders({
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json'
    });
  }

  public createAuthOptions(token?: string): IHttpOptions {
    if (token) {
      return {
        headers: this.setAuthToken(token)
      };
    }
    return {};
  }

  private _buildUrl(module: ApiModuleEnum, endpoint: string): string {
    const normalizedBase = this._baseUrl.replace(/\/+$/, '');
    const normalizedModule = String(module).replace(/^\/+|\/+$/g, '');
    const normalizedEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
    if (!normalizedModule) {
      return `${normalizedBase}${normalizedEndpoint}`;
    }
    return `${normalizedBase}/${normalizedModule}${normalizedEndpoint}`;
  }

  private _handleError(error: HttpErrorResponse): Observable<never> {
    // eslint-disable-next-line no-console
    console.error('HTTP Error:', error);
    return throwError(() => error);
  }

  private _checkApiResponse<T>(response: unknown): T {
    if (response && typeof response === 'object' && response !== null) {
      const responseObj = response as Record<string, unknown>;

      if (
        responseObj['statusCode'] &&
        typeof responseObj['statusCode'] === 'number' &&
        responseObj['statusCode'] !== 200 &&
        responseObj['statusCode'] !== 0
      ) {
        const errorMessage =
          (typeof responseObj['message'] === 'string' ? responseObj['message'] : null) ||
          'API Error occurred';
        // eslint-disable-next-line no-console
        console.error('API Error:', response);

        const httpError = new HttpErrorResponse({
          error: { message: errorMessage },
          status: responseObj['statusCode'],
          statusText: 'API Error',
          url: ''
        });

        throw httpError;
      }

      if (responseObj['succeeded'] !== undefined) {
        if (responseObj['succeeded'] === false) {
          const errorMessage =
            (typeof responseObj['message'] === 'string' ? responseObj['message'] : null) ||
            'API Error occurred';
          // eslint-disable-next-line no-console
          console.error('API Error:', response);

          const httpError = new HttpErrorResponse({
            error: { message: errorMessage },
            status: 400,
            statusText: 'API Error',
            url: ''
          });

          throw httpError;
        }

        if (responseObj['succeeded'] === true && responseObj['data'] !== undefined) {
          return responseObj['data'] as T;
        }
      }

      if (
        (responseObj['statusCode'] === 200 || responseObj['statusCode'] === 0) &&
        responseObj['data'] !== undefined
      ) {
        return responseObj['data'] as T;
      }
    }
    return response as T;
  }
}
