import createRateLimitMiddleware from '../rateLimitMiddleware.js';

const createResponse = () => {
  const res = {
    set: vi.fn(),
    status: vi.fn(),
    json: vi.fn(),
  };

  res.status.mockReturnValue(res);
  return res;
};

const createRequest = ({ ip = '127.0.0.1', remoteAddress = '::1' } = {}) => ({
  ip,
  socket: { remoteAddress },
});

describe('rateLimitMiddleware', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-06-03T00:00:00.000Z'));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('should allow requests below limit', () => {
    const middleware = createRateLimitMiddleware({
      windowMs: 60 * 1000,
      maxRequests: 2,
    });
    const req = createRequest();
    const res = createResponse();
    const next = vi.fn();

    middleware(req, res, next);
    middleware(req, res, next);

    expect(next).toHaveBeenCalledTimes(2);
    expect(res.status).not.toHaveBeenCalled();
  });

  it('should reject requests over limit with retry after header', () => {
    const middleware = createRateLimitMiddleware({
      windowMs: 60 * 1000,
      maxRequests: 1,
    });
    const req = createRequest();
    const res = createResponse();
    const next = vi.fn();

    middleware(req, res, next);
    middleware(req, res, next);

    expect(next).toHaveBeenCalledTimes(1);
    expect(res.set).toHaveBeenCalledWith('Retry-After', '60');
    expect(res.status).toHaveBeenCalledWith(429);
    expect(res.json).toHaveBeenCalledWith({
      status: 'fail',
      message: 'terlalu banyak request, coba lagi nanti',
    });
  });

  it('should reset request counter after window expired', () => {
    const middleware = createRateLimitMiddleware({
      windowMs: 60 * 1000,
      maxRequests: 1,
    });
    const req = createRequest();
    const res = createResponse();
    const next = vi.fn();

    middleware(req, res, next);
    vi.advanceTimersByTime(60 * 1000);
    middleware(req, res, next);

    expect(next).toHaveBeenCalledTimes(2);
    expect(res.status).not.toHaveBeenCalled();
  });

  it('should clean expired clients while keeping active clients', () => {
    const middleware = createRateLimitMiddleware({
      windowMs: 60 * 1000,
      maxRequests: 1,
    });
    const expiredReq = createRequest({ ip: '192.168.0.1' });
    const activeReq = createRequest({ ip: '192.168.0.2' });
    const expiredRes = createResponse();
    const activeRes = createResponse();

    middleware(expiredReq, expiredRes, vi.fn());
    vi.advanceTimersByTime(30 * 1000);
    middleware(activeReq, activeRes, vi.fn());
    vi.advanceTimersByTime(30 * 1000);

    middleware(activeReq, activeRes, vi.fn());
    middleware(expiredReq, expiredRes, vi.fn());

    expect(activeRes.status).toHaveBeenCalledWith(429);
    expect(expiredRes.status).not.toHaveBeenCalled();
  });

  it('should use socket remote address when request ip is unavailable', () => {
    const middleware = createRateLimitMiddleware({
      windowMs: 60 * 1000,
      maxRequests: 1,
    });
    const req = createRequest({
      ip: undefined,
      remoteAddress: '10.10.10.10',
    });
    const res = createResponse();
    const next = vi.fn();

    middleware(req, res, next);
    middleware(req, res, next);

    expect(next).toHaveBeenCalledTimes(1);
    expect(res.status).toHaveBeenCalledWith(429);
  });

  it('should still limit requests when client address is unavailable', () => {
    const middleware = createRateLimitMiddleware({
      windowMs: 60 * 1000,
      maxRequests: 1,
    });
    const req = {
      ip: undefined,
      socket: { remoteAddress: undefined },
    };
    const res = createResponse();
    const next = vi.fn();

    middleware(req, res, next);
    middleware(req, res, next);

    expect(next).toHaveBeenCalledTimes(1);
    expect(res.status).toHaveBeenCalledWith(429);
  });
});
