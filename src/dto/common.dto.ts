import { Request } from 'express';
import { NguoiDungDto } from './index.dto';

export interface RequestWithUser extends Request {
  user: NguoiDungDto;
}

export interface ResSuccess<T> {
  message: string;
  content: T;
}
