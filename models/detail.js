const mongoose = require('mongoose');

const detailSchema = new mongoose.Schema({
    userid:{
        type:String,
        
    },
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
    mobilenumber: {
        type: String,
        required: [true, 'Mobilenumber cannot be blank']
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
        enum:['tamilnadu','karnataka','kerala','andhra pradesh']
    },
    date:{
        type:String,
    },
    timeslot: {
        type: String,
        enum:['9.00 a.m. to 12.30 p.m.','1.00 p.m. to 4.30 p.m.']
    },
    servicetype: {
        type: String,
        enum:['electrical repair','generators','security','automation','remodelling','electrical system inspection']
    },
    propertytype: {
        type: String,
        enum:['residential','commercial']
    },
    price:{
        type:String,
        
    }

})


// detailsSchema.pre('save', async function (next) {
//     next();
// })

module.exports = mongoose.model('Detail', detailSchema);
