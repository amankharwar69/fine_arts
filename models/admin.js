// user.js

import mongoose from 'mongoose';

const { Schema } = mongoose;

// Define the user schema
const userSchema = new Schema({
  username: {
    type: String,
    required: true,
    unique: true
  },
  password: {
    type: String,
    required: true
  }
});

// Create the User model with 'admin' collection
const admin = new mongoose.model('admin', userSchema);


// Export the User model
export default admin;
