import mongoose from 'mongoose';

export const StrategiesSchema = new mongoose.Schema(
    {
        userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
        options: { type: [String] }
    },
    {
        timestamps: true,
        collection: 'Strategies',
    }
);

const StrategiesModel = mongoose.model('Strategies', StrategiesSchema);

export default StrategiesModel;
