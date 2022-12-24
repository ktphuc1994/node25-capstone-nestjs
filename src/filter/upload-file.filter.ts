import {
  UnsupportedMediaTypeException,
  PayloadTooLargeException,
} from '@nestjs/common';
import { Request } from 'express';

export function uploadFileFilter(...mimetypes: string[]) {
  return (
    req: Request,
    file: Express.Multer.File,
    callback: (error: Error | null, acceptFile: boolean) => void,
  ) => {
    if (!mimetypes.some((m) => file.mimetype.includes(m))) {
      callback(
        new UnsupportedMediaTypeException(
          `File type is not matching: ${mimetypes.join(', ')}`,
        ),
        false,
      );
      return;
    }
    callback(null, true);
  };
}
