import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { map, Observable } from 'rxjs';

export interface Response<T> {
  message: string;
  dateTime: string;
  content: T;
}

@Injectable()
export class TransformResponseInterceptor<T>
  implements NestInterceptor<T, Response<T>>
{
  intercept(
    context: ExecutionContext,
    next: CallHandler,
  ): Observable<Response<T>> {
    return next.handle().pipe(
      map((data) => {
        // if (typeof data === 'string') {
        //   return { message: data, content: 'Success' };
        // }
        // if (Array.isArray(data)) {
        //   const newData = data.map((item) => {
        //     item.isRemoved = undefined;
        //     return item;
        //   });
        //   return { message: 'Success', content: newData };
        // }
        // data.isRemoved = undefined;
        return {
          message: 'Success',
          dateTime: new Date().toISOString(),
          content: data,
        };
      }),
    );
  }
}
