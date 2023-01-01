import { Response } from 'express';
import { ArgumentsHost, Catch, HttpStatus } from '@nestjs/common';
import { BaseExceptionFilter } from '@nestjs/core';

// import prisma
import { PrismaClientKnownRequestError } from '@prisma/client/runtime';
import { prismaErrorCodes } from '../errorCode/prismaErrorCode.enum';

@Catch(PrismaClientKnownRequestError)
export class PrismaClientExceptionFilter extends BaseExceptionFilter {
  catch(exception: PrismaClientKnownRequestError, host: ArgumentsHost) {
    console.error(exception.message);
    const ctx = host.switchToHttp();
    const res = ctx.getResponse<Response>();
    // const message = exception.message.replace(/\n/g, '');

    switch (exception.code) {
      case prismaErrorCodes.outRange: {
        const status = HttpStatus.BAD_REQUEST;
        res.status(status).json({
          statusCode: status,
          message:
            "The provided value for the column is too long for the column's type",
          error: exception.meta ? exception.meta : exception.code,
        });
        break;
      }
      case prismaErrorCodes.unique: {
        const status = HttpStatus.CONFLICT;
        res.status(status).json({
          statusCode: status,
          message: 'Unique constraint failed',
          error: exception.meta ? exception.meta : exception.code,
        });
        break;
      }
      case prismaErrorCodes.foreignKey: {
        const status = HttpStatus.BAD_REQUEST;
        res.status(status).json({
          statusCode: status,
          message: 'Foreign Key failed. Record(s) not found',
          error: exception.meta ? exception.meta : exception.code,
        });
        break;
      }
      case prismaErrorCodes.notFound: {
        const status = HttpStatus.NOT_FOUND;
        res.status(status).json({
          statusCode: status,
          message: 'The provided record is not found',
          error: exception.meta ? exception.meta : exception.code,
        });
        break;
      }
      default:
        // default 500 error code
        // super.catch(exception, host);
        const status = HttpStatus.BAD_REQUEST;
        res.status(status).json({
          statusCode: status,
          message: `Failed when executing request at database. Prisma Error Code: ${exception.code}`,
          error: exception.meta ? exception.meta : exception.code,
        });
        break;
    }
  }
}
