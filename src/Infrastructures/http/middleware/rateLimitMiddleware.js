const createRateLimitMiddleware = ({ windowMs, maxRequests }) => {
  const clients = new Map();
  let lastCleanupAt = Date.now();

  const cleanupExpiredClients = (now) => {
    if (now - lastCleanupAt < windowMs) {
      return;
    }

    clients.forEach((clientRequest, clientKey) => {
      if (clientRequest.resetAt <= now) {
        clients.delete(clientKey);
      }
    });

    lastCleanupAt = now;
  };

  return (req, res, next) => {
    const now = Date.now();
    const clientKey = req.ip || req.socket.remoteAddress;
    const clientRequest = clients.get(clientKey);

    cleanupExpiredClients(now);

    if (!clientRequest || clientRequest.resetAt <= now) {
      clients.set(clientKey, {
        count: 1,
        resetAt: now + windowMs,
      });
      return next();
    }

    if (clientRequest.count >= maxRequests) {
      const retryAfter = Math.ceil((clientRequest.resetAt - now) / 1000);

      res.set('Retry-After', retryAfter.toString());
      return res.status(429).json({
        status: 'fail',
        message: 'terlalu banyak request, coba lagi nanti',
      });
    }

    clientRequest.count += 1;
    return next();
  };
};

export default createRateLimitMiddleware;
