
import httpErrors from 'http-errors';
import UserService from '../services/user.service';
import DbConstants from '../utils/DbConstants';
import JwtUtils from '../utils/JwtUtils';

class Auth {
  static async ensureAuthenticated(req, res, next) {
    const authorizationHeader = req.headers['Authorization'] || req.headers['authorization'];

    if (!authorizationHeader) {
      return next(new httpErrors.Unauthorized('Authorization header not found'));
    }

    const accessToken = authorizationHeader.split(' ')[1];

    if (!accessToken) {
      return next(new httpErrors.Unauthorized('Authorization header invalid format'));
    }

    const { decoded, error } = await JwtUtils.verifyAccessToken(accessToken);

    if (error) {
      return next(new httpErrors.Unauthorized('Invalid Access Token'));
    }

    req.user = decoded.user;
    req.provider = decoded.provider;
    req.providerAccessToken = decoded.providerAccessToken;
    

    // Verifying the user on the very first login using other providers
    if (req.provider == DbConstants.PROVIDERS.OTHERS && !decoded.user.isVerified) {
      await UserService.verifyUser(req.user);
    }
    next();
  }

  static async ensureAdmin(req, res, next) {
    if (!req.user.isAdmin) {
      return next(new httpErrors.Unauthorized('User is not an admin'));
    }
    next();
  }
}

export default Auth;