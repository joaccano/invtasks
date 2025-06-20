export const logNotificationHelper = (type: 'INFO'|'ERROR'|'COMPLETED' = 'INFO' ,message: string, data?: any, queueName: string = 'notificationQueue') => {
  let payload = `[${queueName}] [${new Date().toLocaleString()}] [${type}] [${message}]`;
  if(data) payload = `${payload} [${data}]`
  switch(type) {
    case 'INFO':
      payload = `\x1b[34m${payload}\x1b[0m`;
      break;
    case 'ERROR':
      payload = `\x1b[41m${payload}\x1b[0m`;
      break;
    case 'COMPLETED':
      payload = `\x1b[32m${payload}\x1b[0m`;
      break;
  }
  console.log(payload);
}