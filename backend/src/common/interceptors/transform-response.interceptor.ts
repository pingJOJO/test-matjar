import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { ApiResponse } from '../interfaces/api-response.interface.js';

@Injectable()
export class TransformResponseInterceptor<T>
  implements NestInterceptor<T, ApiResponse<T>>
{
  intercept(
    context: ExecutionContext,
    next: CallHandler,
  ): Observable<ApiResponse<T>> {
    const httpContext = context.switchToHttp();
    const response = httpContext.getResponse();
    const request = httpContext.getRequest();
    const statusCode = response.statusCode;

    return next.handle().pipe(
      map((res) => {
        // If response is already formatted as ApiResponse, return it directly
        if (res && typeof res === 'object' && 'success' in res && 'data' in res) {
          return {
            ...res,
            statusCode: res.statusCode || statusCode,
            timestamp: res.timestamp || new Date().toISOString(),
            path: res.path || request.url,
          };
        }

        // If response contains data and meta (for pagination)
        if (res && typeof res === 'object' && 'data' in res && 'meta' in res) {
          return {
            success: true,
            data: res.data,
            meta: res.meta,
            message: res.message || 'Operation successful',
            statusCode,
            timestamp: new Date().toISOString(),
            path: request.url,
          };
        }

        // Standard unified envelope
        return {
          success: true,
          data: res ?? null,
          message: 'Operation successful',
          statusCode,
          timestamp: new Date().toISOString(),
          path: request.url,
        };
      }),
    );
  }
}
