require('dotenv').config();
const mongoose = require('mongoose');

mongoose.set('strictQuery', false);

const uri = process.env.MONGODB_URI;

mongoose.connect(uri)
    .then(_ => {
        console.log('Connected to MongoDB')
    })
    .catch(err => {
        console.log(`Error while trying to connect to MongoDB through driver uri ${uri}:`, err.message);
    })
;

const personSchema = new mongoose.Schema({
    name: String,
    number: String
});

personSchema.set('toJSON', {
    transform: (_, returnedDocument) => {
        returnedDocument.id = returnedDocument._id.toString();

        delete returnedDocument._id;
        delete returnedDocument.__v;
    }
});

/**
 * 
 * personSchema.statics.deleteById = function(id) {
 * return this.deleteOne({ _id: id });
 * }
 */

module.exports = mongoose.model('Person', personSchema);