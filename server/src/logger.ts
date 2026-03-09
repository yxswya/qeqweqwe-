import winston from 'winston'

/**
 * Winston 日志配置
 * 日志级别: error < warn < info < debug
 */

const logDir = 'logs'

// 自定义日志格式
const logFormat = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  winston.format.errors({ stack: true }),
  winston.format.printf(({ timestamp, level, message, ...meta }) => {
    let log = `${timestamp} [${level.toUpperCase()}]: ${message}`
    // 打印额外的元数据
    if (Object.keys(meta).length > 0) {
      log += ` ${JSON.stringify(meta)}`
    }
    return log
  }),
)

export const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: logFormat,
  transports: [
    // 错误日志单独写入文件
    new winston.transports.File({
      filename: `${logDir}/error.log`,
      level: 'error',
    }),
    // 所有日志写入 combined.log
    new winston.transports.File({
      filename: `${logDir}/combined.log`,
    }),
    // 控制台输出（带颜色）
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.colorize(),
        winston.format.printf(({ timestamp, level, message }) => {
          return `${timestamp} [${level}]: ${message}`
        }),
      ),
    }),
  ],
})
