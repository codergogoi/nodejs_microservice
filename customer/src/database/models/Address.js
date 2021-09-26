const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const AddressSchema = new Schema({
    street: String,
    postalCode: String,
    city: String,
    country: String
});

module.exports =  mongoose.model('address', AddressSchema);