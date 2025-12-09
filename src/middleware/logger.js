// Middleware для логирования запросов
const logger = (req, res, next) => {
  const timestamp = new Date().toISOString();
  const method = req.method;
  const url = req.url;
  const ip = req.ip || req.connection.remoteAddress;
  
  console.log(`[${timestamp}] ${method} ${url} - IP: ${ip}`);
  
  // Логирование тела запроса для POST/PUT
  if (['POST', 'PUT'].includes(method)) {
    console.log('📦 Body:', req.body);
  }
  
  next();
};

module.exports = logger;