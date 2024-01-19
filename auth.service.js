import _ from "lodash";
import UserModel from "../models/User";
import bcrypt from "bcrypt";
import Mailer from "../utils/Mailer";
import DbConstants from "../utils/DbConstants";
import JwtUtils from "../utils/JwtUtils";
import  Jwt  from "jsonwebtoken";
import config from "../utils/config";
import logger from "../utils/logger";


class AuthService{

    static async loginService({ email, password }) {
        try {
    
          let user = await UserModel
                    .findOne({email:email})
                    .lean()
                    .exec();
    
          if(_.isEmpty(user) || user.providers.others == undefined){
            return("No user exists");
          }
          else{
            let data = user.providers.others; 
            if(!user.isVerified){

              logger.debug({ message: `Sending verification mail to: ${email} `});

              const verificationUrl = await this.genUrl(user);
              let response = await Mailer.mailer(verificationUrl, email);
              logger.debug({
                message: `Verification mail sent to: ${email}`,
                info: response
              });

              return("Email Verification Pending. Check Your Email");
            }
            else if(await bcrypt.compare(password,data.password))
              return user;
            else
              return("Password not valid");
          }
        }
        catch(err){
          throw err;
        }
      }

    //generate the login url
    static async genUrl(user){

      const jwtToken = await JwtUtils.generateAccessToken({
        user,
        provider: DbConstants.PROVIDERS.OTHERS
      });

      const anastratAuthSuccessUrl = `${config.get(
        'anastratAppUrl'
      )}/auth/success?token=${jwtToken}`;

      return anastratAuthSuccessUrl;

    }
}

export default AuthService;