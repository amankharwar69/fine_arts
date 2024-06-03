import mongoose from 'mongoose';

// Define a schema for the bill document
const billSchema = new mongoose.Schema({
  eventName: {
    type: String,
    
  },
  eventDate: {
    type: Date,
   
  },
  billImage: {
    type: String,
    // required: true
  }
});

// Create a model from the schema
const Bill = mongoose.model('Bill', billSchema);

export default Bill;
