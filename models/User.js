const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const UserSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Please add a name']
    },
    email: {
        type: String,
        required: [true, 'Please add an email'],
        unique: true,
        match: [
            /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/,
            'Please add a valid email'
        ]
    },
    telephone_number: {
        type: String,
        required: [true, 'Please add a telephone number'],
        match: [
            /^(\([0-9]{3}\)\s*|[0-9]{3}\-)[0-9]{3}-[0-9]{4}$/,
            'Please add a valid telephone number e.g. 123-345-3456, (078)789-8908, (078) 789-8908'
        ]
    },
    role: {
        type: String,
        enum: ['user', 'admin'],
        default: 'user'
    },
    password: {
        type: String,
        required: [true, 'Please add a password'],
        minlength: 6,
        select: false
    },
    resetPasswordToken: String,
    resetPasswordExpire: Date,
    createdAt: {
        type: Date,
        default: Date.now
    }
});

// Encrypt password using bcrypt
UserSchema.pre('save', async function (next) {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
});

// Sign JWT and return
UserSchema.methods.getSignedJwtToken = function() {
    return jwt.sign({ id: this._id }, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_EXPIRE
    });
};

// Match user password to hashed in db
UserSchema.methods.matchPassword = async function(enteredPassword) {
    return await bcrypt.compare(enteredPassword, this.password);
};
  
module.exports = mongoose.model('User', UserSchema);


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

