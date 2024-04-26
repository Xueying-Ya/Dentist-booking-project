const mongoose = require('mongoose');

const DentistSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Please add a name']
    },
    years_of_experience: {
        type: Number,
        required: [true, 'Please add years of experience']
    },
    area_of_expertise: {
        type: String,
        required: [true, 'Please add area of expertise']
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
}); // Move collection name specification here

//Reverse populate with virtuals 
DentistSchema.virtual('appointments', {
    ref: 'Appointment',
    localField:'_id',
    foreignField: 'dentist',
    justOne: false
    });
    
//Cascade delete appointments when a hospital is deleted
DentistSchema.pre('deleteOne', { document: true, query: false }, async function (next) {
    console.log(`Appointments being removed from following dentist ${this._id}`);
    await this.model('Appointment').deleteMany({ dentist: this._id });
    next();
  });

module.exports = mongoose.model('Dentist', DentistSchema);

