import {inject, Injectable} from '@angular/core';
import {INGXLoggerConfig, NGXLogger, NgxLoggerLevel} from 'ngx-logger';
import {HttpHeaders} from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class LoggerService {
  datetime: Date;
  private logger = inject(NGXLogger);
  private readonly CLASS_NAME = LoggerService.name;

  constructor() {
    this.datetime = new Date();
    this.logger.partialUpdateConfig({
      level: NgxLoggerLevel.DEBUG,
      serverLogLevel: NgxLoggerLevel.OFF,
    })
  }

  generateRealMsg(msg: any, tags: string[]): string {
    try {
      let tagsCompose = '';
      if (tags) {
        this.updateHeader('operationId', tags[0]);
        for (const tag of tags) {
          tagsCompose += `[${tag}] `;
        }
      } else {
        this.updateHeader('operationId', 'unknown');
      }
      return tagsCompose + msg;
    } catch (e) {
      // Using logger to avoid circular calls
      this.logger.error(`[${this.CLASS_NAME}] Impossible get message to send with tags:${tags} and message:${msg}`, e);
      return msg;
    }

  }

  trace(msg: any, ...tags: string[]) {
    this.logger.trace(this.generateRealMsg(msg, tags));
  }

  debug(msg: any, ...tags: string[]) {
    this.logger.debug(this.generateRealMsg(msg, tags));
  }

  info(msg: any, ...tags: string[]) {
    this.logger.info(this.generateRealMsg(msg, tags));
  }

  warn(msg: any, ...tags: string[]) {
    this.logger.warn(this.generateRealMsg(msg, tags));
  }

  log(msg: any, ...tags: string[]) {
    this.logger.log(this.generateRealMsg(msg, tags));
  }

  error(msg: any, error?: any, ...tags: string[]) {
    const realMsg = this.generateRealMsg(msg, tags);
    if (error !== undefined) {
      this.logger.error(realMsg, error);
    } else {
      this.logger.error(realMsg);
    }
  }

  fatal(msg: any, ...tags: string[]) {
    this.logger.fatal(this.generateRealMsg(msg, tags));
  }

  updateHeader(key: string, value: string, doLog?: boolean) {
    let httpHeaders = this.logger.getConfigSnapshot().customHttpHeaders;
    if (!httpHeaders) {
      httpHeaders = new HttpHeaders();
    } else {
      httpHeaders.set(key, value);
    }
    const loggerConfig: INGXLoggerConfig = {
      level: this.logger.getConfigSnapshot().level,
      customHttpHeaders: httpHeaders
    };
    this.logger.partialUpdateConfig(loggerConfig);
    if (doLog) {
      // do not use this.info ??
      this.logger.info(`Updated logger config with partial: ${JSON.stringify(loggerConfig)}`, this.CLASS_NAME);
    }

  }

  // UPDATE LOGGING LEVEL
  private getLevel(level: string): NgxLoggerLevel {
    if (level === 'off') {
      return NgxLoggerLevel.OFF;
    } else if (level === 'trace') {
      return NgxLoggerLevel.TRACE;
    } else if (level === 'debug') {
      return NgxLoggerLevel.DEBUG;
    } else if (level === 'info') {
      return NgxLoggerLevel.INFO;
    } else if (level === 'warn') {
      return NgxLoggerLevel.WARN;
    } else if (level === 'error') {
      return NgxLoggerLevel.ERROR;
    } else {
      this.logger.warn(`Not handle level: ${level}`);
      return NgxLoggerLevel.WARN;
    }
  }
}
