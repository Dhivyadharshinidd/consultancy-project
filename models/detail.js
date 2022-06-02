const mongoose = require('mongoose');

const detailSchema = new mongoose.Schema({
    firstname: {
        type: String,
        required: [true, 'Username cannot be blank']
    },
    lastname: {
        type: String,
        required: [true, 'Password cannot be blank']
    },
    email: {
        type: String,
        required: [true, 'Email cannot be blank']
    },
    address: {
        type: String,
        required: [true, 'Address cannot be blank']
    },
    city: {
        type: String,
        required: [true, 'City cannot be blank']
    },
    zipcode: {
        type: String,
        required: [true, 'Zipcode cannot be blank']
    },
    state: {
        type: String,
        enum:['tamilnadu','karnataka','kerala','andhra pradesh','maharashtra']
    },
    country: {
        type: String,
        enum:['india','united states','indonesia','france','italy']
    },
    servicetype: {
        type: String,
        enum:['electrical repair','generators','security','automation','remodelling','electrical system inspection']
    },
    propertytype: {
        type: String,
        enum:['residential','commercial']
    }
})


// detailsSchema.pre('save', async function (next) {
//     next();
// })

module.exports = mongoose.model('Detail', detailSchema);
