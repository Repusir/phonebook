require('dotenv').config();
const mongoose = require('mongoose');

mongoose.set('strictQuery', false);

const uri = process.env.MONGODB_URI;

mongoose.connect(uri)
  .then((_) => {
    console.log('Connected to MongoDB');
  })
  .catch((err) => {
    console.log(`Error while trying to connect to MongoDB through driver uri ${uri}:`, err.message);
  })
;

/**
 * 3.19*: Phonebook database, step7
 * Expand the validation so that the name stored in the database has to be at least three characters long.
 *
 * 3.20*: Phonebook database, step8
 * Add validation to your phonebook application, which will make sure that phone numbers are of the correct form. A phone number must:
 *
 * - have length of 8 or more
 * - be formed of two parts that are separated by -, the first part has two or three numbers and the second part also consists of numbers
 *
 * eg. 09-1234556 and 040-22334455 are valid phone numbers
 * eg. 1234556, 1-22334455 and 10-22-334455 are invalid
 */

const personSchema = new mongoose.Schema({
  name: {
    type: String,
    minLength: 3,
    required: [true, 'Name is required'],
  },
  number: {
    type: String,
    validate: {
      validator(v) {
        return /^(\d{2}-\d{6,})|(\d{3}-\d{5,})$/.test(v);
      },
      message: (props) => `${props.value} is not a valid phone number!`,
    },
    required: [true, 'Number is required'],
  },
});

personSchema.set('toJSON', {
  transform: (document, returnedDocument) => {
    returnedDocument.id = returnedDocument._id.toString();

    delete returnedDocument._id;
    delete returnedDocument.__v;
  },
});

/**
 *
 * personSchema.statics.deleteById = function(id) {
 * return this.deleteOne({ _id: id });
 * }
 */

module.exports = mongoose.model('Person', personSchema);
