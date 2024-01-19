import _ from 'lodash';
import dhanUserModel from '../models/dhanUser';
import ProfileModel from '../models/Profile';
import UserModel from '../models/User';
import StrategiesModel from '../models/Strategies';
import AppContants from '../utils/AppConstants'
import ReferalService from './referal.service';
import {customAlphabet} from 'nanoid'
class UserService {
  static async createOrUpdateUserForFyers(profile) {
    let user = await UserModel.findOne({ email: profile.email }).lean().exec();

    if (_.isEmpty(user)) {
      user = new UserModel({
        name: profile.name,
        email: profile.email,
        providers: {
          fyers: {
            name: profile.name,
            email: profile.email,
            id: profile.id,
          },
        },
      });

      await user.save();

      user = user.toJSON();
    } else {
      user = await UserModel.findOneAndUpdate(
        { email: profile.email },
        {
          $set: {
            'providers.fyers': {
              name: profile.name,
              email: profile.email,
              id: profile.id,
            },
          },
        },
        { new: true }
      )
        .lean()
        .exec();
    }

    return user;
  }

  static async createOrUpdateUserForZerodha(profile) {
    let user = await UserModel.findOne({ email: profile.email }).lean().exec();

    if (_.isEmpty(user)) {
      user = new UserModel({
        name: profile.name,
        email: profile.email,
        providers: {
          zerodha: {
            name: profile.name,
            email: profile.email,
            id: profile.id,
          },
        },
      });

      await user.save();

      user = user.toJSON();
    } else {
      user = await UserModel.findOneAndUpdate(
        { email: profile.email },
        {
          $set: {
            'providers.zerodha': {
              name: profile.name,
              email: profile.email,
              id: profile.id,
            },
          },
        },
        { new: true }
      )
        .lean()
        .exec();
    }

    return user;
  }

  static async createOrUpdateUserForIIFL(profile) {
    let user = await UserModel
      .findOne({ email: profile.Email })
      .lean()
      .exec();

    if (_.isEmpty(user)) {
      user = new UserModel({
        name: profile.ClientName,
        email: profile.Email,
        providers: {
          iifl: {
            name: profile.ClientName,
            email: profile.Email,
            id: profile.ClientCode
          }
        }
      });

      await user.save();

      user = user.toJSON();
    } else {
      user = await UserModel.findOneAndUpdate({
        email: profile.Email
      }, {
        $set: {
          'providers.iifl': {
            name: profile.ClientName,
            email: profile.Email,
            id: profile.ClientCode
          }
        }
      }, { new: true })
        .lean()
        .exec();
    }

    return user;
  }

  static async createOrUpdateUserForOthers(profile) {
    let user = await UserModel
      .findOne({ email: profile.Email })
      .lean()
      .exec();

    if (_.isEmpty(user)) {
      user = new UserModel({
        name: profile.accountName,
        email: profile.Email,
        providers: {
          others: {
            name: profile.accountName,
            email: profile.Email,
            id: profile.accountID,
            password: profile.hash
          }
        },
        isVerified: false
      });

      await user.save();

      user = user.toJSON();
    } else if (user.providers.others == undefined) {
      // Add check to see if others is empty or not otherwise multiple signups possible
      user = await UserModel.findOneAndUpdate({
        email: profile.Email
      }, {
        $set: {
          'providers.others': {
            name: profile.accountName,
            email: profile.Email,
            id: profile.accountID,
            password: profile.hash
          }
        }
      }, { new: true })
        .lean()
        .exec();
    }
    else {
      throw "User already registered"
    }

    return user;
  }

// For dhan the user schema is different since mapping is done with dhanId instead of user email
static async createOrUpdateUserForDhan(profile) {
  let user = await dhanUserModel
      .findOne({id: profile.dhanClientId})
      .lean()
      .exec();

  if (_.isEmpty(user)) {
      user = new dhanUserModel({
          name: profile.dhanClientName,
          id: profile.dhanClientId,
          providers: {
              dhan: {
                  name: profile.dhanClientName,
                  id: profile.dhanClientId,
              }
          }
      });

      await user.save();

      user = user.toJSON();
  } 

  return user;
}

// add error handling
static async verifyUser(profile){
    let user = await UserModel
      .findOne({ email: profile.email })
      .lean()
      .exec();

    if (!(_.isEmpty(user))) {
      user = await UserModel.findOneAndUpdate({
        email: profile.email
      }, {
        $set: {
          isVerified: true
        }
      })
        .lean()
        .exec();
    }

    return user;

  }

  static async updateUserTags(userId, tags) {
    const data = await UserModel.findOneAndUpdate({ '_id': userId }, { $addToSet: { tags: tags } }, { new: true })
    return data;
  }

  static async getUserTags(userId) {
    const data = await UserModel.findOne({ '_id': userId }).lean().exec();
    return data?.tags || [];
  }

  static async getProfile(userId) {
    const data = await ProfileModel.findOne({ userId }).lean().exec();
    return data;
  }

  static async updateProfile(userId, data) {
    const {
      firstName,
      lastName,
      email,
      phone,
      city,
      strategies,
      timeFrames,
      referrerCode //referrerCode
    } = data;
    let isCompleted = false;

    if (firstName && lastName && email && phone && city) {
      isCompleted = true
    }
    let code = '';
    let checkCode=''
  do{
      const nanoid = customAlphabet('1234567890ABCDEFGHIJKLMNOPQRSTUVWXYZ', 6)
      code = nanoid();
      checkCode = await ProfileModel.findOne({code})
    }while(checkCode)
    await ProfileModel.findOneAndUpdate({ userId },
      {
        $set: {
          firstName,
          lastName,
          email,
          phone,
          city,
          isCompleted,
          userId,
          strategies,
          timeFrames,
          code
        },
      },
      {
        upsert: true,
        returnDocument: 'after'
      }).exec();
      const createUserRefer = await ReferalService.createReferal(code,userId);
      if(referrerCode){
        await ReferalService.updateReferrer(referrerCode,userId)
      }

      return createUserRefer;

  }
  
  static async getStrategies(userId) {
    const userStrategies = await StrategiesModel.findOne({ userId });
    if (userStrategies) {
      return [...userStrategies.options, ...AppContants.STRATEGIES]
    }
    return AppContants.STRATEGIES;
  }

  static async createStrategy(userId, value) {
    return await StrategiesModel.findOneAndUpdate({ userId }, { $addToSet: { options: value } }, { upsert: true });
  }

  static async deleteStrategy(userId, value) {
    await StrategiesModel.findOneAndUpdate({ userId }, { $pull: { options: value } });
    await ProfileModel.findOneAndUpdate({ userId }, { $pull: { strategies: value } });
    return;
  }

}

export default UserService;
