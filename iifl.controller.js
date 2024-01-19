import _ from 'lodash';
import UserService from '../services/user.service';
import JwtUtils from '../utils/JwtUtils';
import DbConstants from '../utils/DbConstants';
import logger from '../utils/logger';
import IIFLService from '../services/iifl.service';
import ApiValidator from '../utils/ApiValidator';
import Joi from 'joi';
import {
    IIFL_LOGIN_HTML
} from '../utils/OauthIIFLHtml';
import config from '../utils/config';

class IIFLController {
    // static async handlePostAuth(req, res, next) {
    //     try {
    //         ApiValidator.validate(req.body, Joi.object({
    //             ClientCode: Joi
    //                 .string()
    //                 .required(),
    //             Password: Joi
    //                 .string()
    //                 .required(),
    //             My2PIN: Joi
    //                 .string()
    //                 .required()
    //         }).unknown(true));
    //         const {ClientCode, Password, My2PIN} = req.body;
    // const {Token} = await IIFLService.authenticate({ClientCode, Password, My2PIN});
    //         if (!Token) {
    //             return next(new httpErrors.Unauthorized("Unauthorized"));
    //         }
    //         const profileDetails = await IIFLService.clientProfile(Token, ClientCode)

    //         // Create/Update User Profile
    //         const user = await UserService.createOrUpdateUserForIIFL(profileDetails);

    //         // Generate JWT token
    //         const jwtToken = await JwtUtils.generateAccessToken({user, provider: DbConstants.PROVIDERS.IIFL, providerAccessToken: Token});

    //         // Running tradebook sync in background
    //         setImmediate(async() => {
    //             try {
    //                 logger.info({message: `Running IIFL sync in background for user ${user._id}`});
    //                 await IIFLService.syncTrades(user._id, Token, ClientCode);
    //             } catch (err) {
    //                 logger.error({message: `Error in running IIFL sync in background for user ${user._id}`});
    //             }
    //         });

    //         res.json({
    //             success: true,
    //             data: {
    //                 token: jwtToken
    //             }
    //         })
    //     } catch (err) {
    //         if (err.message === "Invalid login/password") {
    //             return next(new httpErrors.Unauthorized(err.message));
    //         }
    //         next(err);
    //     }
    // }

    static async handleAuth(req, res, next) {
        try {
            res.send(IIFL_LOGIN_HTML);
        } catch (err) {
            next(err);
        }
    }

    static async handleAuthCallback(req, res, next) {
        try {
            const {
                ClientCode,
                IIFLMarCookie,
                JWTToken
            } = req.body;
            const anastratAuthFailureUrl = `${config.get('anastratAppUrl')}/auth/failure`;
            if (!IIFLMarCookie) {
                return res.redirect(anastratAuthFailureUrl);
            }
            const profileDetails = await IIFLService.clientProfile(IIFLMarCookie, ClientCode)
            if (!profileDetails) {
                return res.redirect(anastratAuthFailureUrl);
            }
            // Create/Update User Profile
            const user = await UserService.createOrUpdateUserForIIFL(profileDetails);
            const userWithoutTags = _.omit(user, ['tags']);
            // Generate JWT token
            const jwtToken = await JwtUtils.generateAccessToken({
                user: { ...userWithoutTags },
                provider: DbConstants.PROVIDERS.IIFL,
                providerAccessToken: IIFLMarCookie,
                JWTToken
            });
            // Running tradebook sync in background
            setImmediate(async () => {
                try {
                    logger.info({
                        message: `Running IIFL sync in background for user ${user._id}`
                    });
                    await IIFLService.syncTrades(user._id, IIFLMarCookie, ClientCode);
                } catch (err) {
                    logger.error({
                        message: `Error in running IIFL sync in background for user ${user._id}`
                    });
                }
            });
            const anastratAuthSuccessUrl = `${config.get(
                'anastratAppUrl'
            )}/auth/success?token=${jwtToken}`;
            return res.redirect(anastratAuthSuccessUrl);
        } catch (err) {
            next(err);
        }
    }



    static async syncTrades(req, res, next) {
        try {
            const providerAccessToken = req.providerAccessToken;
            const user = req.user;
            await IIFLService.syncTrades(user._id, providerAccessToken, user.providers.iifl.id);
            res.json({
                success: true,
                message: 'Sync successfull'
            });
        } catch (err) {
            next(err);
        }
    }

    static async getDashboard(req, res, next) {
        try {
            const userId = req.user._id;
            const {
                duration
            } = req.query;
            const dashboardData = await IIFLService.getDashboardData(userId, duration);
            res.json({
                success: true,
                dashboardData
            });
        } catch (err) {
            next(err);
        }
    }

    static async tradePairs(req, res, next) {
        try {
            ApiValidator.validate(
                req.query,
                Joi.object({
                    time_period: Joi.string(),
                    segment: Joi.string(),
                    tags: Joi.string(),
                    offset: Joi.number(),
                    limit: Joi.number()
                }).unknown(true)
            );
            const userId = req.user._id;
            const {
                time_period,
                segment,
                tags="[]",
                offset,
                limit,
                tradePattern,
                tradeType,
                tradeTerm,
                sort,
                order
            } = req.query;

            const tradePairs = await IIFLService.getTradePairs(userId, { time_period, segment, tags: JSON.parse(tags), tradePattern, tradeType, tradeTerm }, offset, limit, { sort, order});

            res.json(tradePairs);
        } catch (err) {
            next(err);
        }
    }

    static async updateTradePairImages(req, res, next) {
      try {
          const {
              tradePairId
          } = req.query;
          const {
              images
          } = req.body;
          const data = await IIFLService.updateTradePairImages(tradePairId, images)
          res.json(data);
      } catch (err) {
          next(err);
      }
  }
   

    static async updateTradePairTags(req, res, next) {
        try {
            const {
                tradePairId
            } = req.query;
            const userId = req.user._id;
            const {
                tag
            } = req.body;
            const data = await IIFLService.updateTradePairTags(tradePairId, tag)
            await UserService.updateUserTags(userId, tag)
            res.json(data);
        } catch (err) {
            next(err);
        }
    }

    static async deleteTradePairTags(req, res, next) {
        try {
            const {
                tradePairId
            } = req.query;
            const {
                tag =null,
            } = req.body;
            const data = await IIFLService.deleteTradePairTags(tradePairId, tag);
            res.json(data);
        } catch (err) {
            next(err);
        }
    }

    static async bulkUpdateTradePairsTag(req, res, next) {
        try {
          const {
            data
          } = req.body;
          const userId = req.user._id;
          const response = await IIFLService.bulkUpdateTradePairsTag(data);
          await UserService.updateUserTags(userId, data?.tag)
          res.json(response);
        } catch (err) {
          next(err);
        }
    }

    static async updateTradePairComment(req, res, next) {
        try {
            const {
                tradePairId
            } = req.query;
            const {
                comment
            } = req.body;
            const data = await IIFLService.updateTradePairComment(tradePairId, comment)
            res.json(data);
        } catch (err) {
            next(err);
        }
    }
}

export default IIFLController;