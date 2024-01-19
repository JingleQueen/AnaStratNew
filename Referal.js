import mongoose from 'mongoose';

const ReferalSchema = new mongoose.Schema(
  {
    refererId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    referals : [{
        userId:{ type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    }],
    code: {
        type: String
    }
  },
  { timestamps: true, collection: 'Referal' }
);

const ReferalModel = mongoose.model('Referal', ReferalSchema);

export default ReferalModel;


  
