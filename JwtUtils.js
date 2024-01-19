import jwt, { decode } from 'jsonwebtoken';
import config from './config';

class JwtUtils {
  static SECRET = config.get('jwtSecret');

  static async generateAccessToken(payload) {
    const accessToken = jwt.sign(payload, this.SECRET, { expiresIn: '1d' });

    return accessToken;
  }

  static async verifyAccessToken(accessToken) {
    try {
      const decoded = await jwt.verify(accessToken, this.SECRET);

      return { decoded, error: null };
    } catch (err) {
      return { decoded: null, error: true };
    }
  }
}

export default JwtUtils;
