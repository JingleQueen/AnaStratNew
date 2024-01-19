import mongoose from 'mongoose';

export const GlobalBytesSchema = new mongoose.Schema(
    {
        globalBytes : {type: String, required: true}
    },
    {
        timestamps:true,
        collection:'GlobalBytes'
    }
);

const GlobalBytesModel = mongoose.model('GlobalBytes',GlobalBytesSchema);

export default GlobalBytesModel;