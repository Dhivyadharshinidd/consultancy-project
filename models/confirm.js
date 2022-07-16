const mongoose = require('mongoose');

const confirmSchema = new mongoose.Schema({
    userid:{
        type:String,
        
    },
    date:{
        type: String,
    },
    timeslot: {
        type: String,
        enum:['9.00 a.m. to 12.30 p.m.','1.00 p.m. to 4.30 p.m.']
    }
    
})


// detailsSchema.pre('save', async function (next) {
//     next();
// })

module.exports = mongoose.model('Confirm', confirmSchema);
