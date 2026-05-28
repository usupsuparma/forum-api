import AuthenticationTokenManager from '../../../Applications/security/AuthenticationTokenManager.js';
import AuthenticationError from '../../../Commons/exceptions/AuthenticationError.js';

const createAuthMiddleware = (container) => async (req, res, next) => {
  try {
    const { authorization } = req.headers;

    if (!authorization) {
      throw new AuthenticationError('Missing authentication');
    }

    const [scheme, token] = authorization.split(' ');

    if (scheme !== 'Bearer' || !token) {
      throw new AuthenticationError('Invalid authentication');
    }

    const tokenManager = container.getInstance(AuthenticationTokenManager.name);
    await tokenManager.verifyAccessToken(token);
    const { id } = await tokenManager.decodePayload(token);
    req.userId = id;

    next();
  } catch (error) {
    next(error);
  }
};

export default createAuthMiddleware;
