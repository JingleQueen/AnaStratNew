
import UserService from '../services/user.service';
import Mailer from '../utils/Mailer';
import AuthService from '../services/auth.service';
import Hashing from '../utils/Hashing';
import logger from '../utils/logger';
import generateRandom from '../utils/generateRandom';
import JwtUtils from '../utils/JwtUtils';
import UserModel from '../models/User';
import config from '../utils/config';
import ApiValidator from '../utils/ApiValidator';
import Joi from 'joi';

class AuthController {
  static async handleRegistration(req, res, next) {
    const profile = {
      accountName: req.body.name,
      Email: req.body.email,
      hash: await Hashing.hash(req.body.password),
      accountID: req.body.name.substring(0, 3).toLowerCase() + generateRandom(4),
    };
    try {
      const user = await UserService.createOrUpdateUserForOthers(profile);

      const anastratAuthSuccessUrl = await AuthService.genUrl(user);

      logger.debug({ message: `Sending verification mail to: ${profile.Email} ` });

      let response = await Mailer.mailer(anastratAuthSuccessUrl, profile.Email);

      logger.debug({
        message: `Verification mail sent to: ${profile.Email}`,
        info: response,
      });

      return res.json({ success: true, info: 'Mail sent successfully' });
    } catch (error) {
      if (typeof error == 'string') res.status(401).json({ success: false, error: error });
      else next(error);
    }
  }

  static async handleLogin(req, res, next) {
    try {
      const profile = {
        email: req.body.email,
        password: req.body.password,
      };

      let user = await AuthService.loginService(profile);

      if (typeof user == 'string') {
        return res.status(401).json({ error: user });
      } else {
        let anastratAuthSuccessUrl = await AuthService.genUrl(user);

        return res.send(anastratAuthSuccessUrl);
      }
    } catch (error) {
      next(error);
    }
  }

}

export default AuthController;





