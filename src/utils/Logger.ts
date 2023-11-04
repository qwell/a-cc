export default class Logger {
  //TODO: Log to disk (or better, syslog).
  static debug(...data: unknown[]) {
    console.debug(data);
  }
  static verbose(...data: unknown[]) {
    console.log(data);
  }
  static warn(...data: unknown[]) {
    console.warn(data);
  }
  static error(...data: unknown[]) {
    console.error(data);
  }
}
