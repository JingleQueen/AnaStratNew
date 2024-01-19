import ReferalModel from "../models/Referal";

class ReferalService{
  static async createReferal(userCode,userObjectId){
    const userRefer = new ReferalModel({
      refererId: userObjectId,
      referals:[],
      code:userCode
    });
    await userRefer.save();
  }
  static async updateReferrer(referrerCode,userObjectId){
    const referrerId = await ReferalModel.findOne({code:referrerCode})
    if(!referrerId){
      return json({message:"referrerId cannot be found"});
    }else{
      referrerId.referals.push(userObjectId);
      referrerId.save();
      return "referreId updated"
    }
  }
}
export default ReferalService;