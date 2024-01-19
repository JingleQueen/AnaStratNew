import ApiValidator from "../utils/ApiValidator";
import logger from "../utils/logger";
import Joi from "joi";
import ReferalService from "../services/referal.service";
class ReferalController{

  static async handleCreateReferal(req, res, next){
    try {
      const { body: { refererId = null} = {} } = req || {};
      ApiValidator.validate(
        req.body,
        Joi.object({
          refererId: Joi.string().required(),
        }).unknown(true)
      );
      const createReferalData = await ReferalService.createReferal({req, res, refererId})
      return res.send({status:201, msg: "Referal created succesfully", data: createReferalData})
    } catch (error) {
      logger.error({ message: `Error in Creating Referal`, error });
      return next (error)  
    }
  }

  // static async handleGetReferal({

  // })


}

export default ReferalController;
