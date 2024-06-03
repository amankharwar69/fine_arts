import mongoose from 'mongoose';

const studentSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  regNo: {
    type: String,
    required: true
  },
  studentClass: {
    type: String,
    enum: ['BBA', 'BCOM', 'BCA', 'BSC', 'BA'],
    required: true
  }
});

const eventSchema = new mongoose.Schema({
  eventName: {
    type: String,
    required: true
  },
  participatedIn: {
    type: String,
    required: true
  },
  eventPrize: {
    type: String,
    enum: ['1st', '2nd', '3rd', 'no'],
    required: true
  },
  eventPlace: {
    type: String,
    required: true
  },
  eventDate: {
    type: Date,
    required: true
  },
  students: [studentSchema],
  eventImages: [{
    type: String
  }]
});

const EventSchemaModel = mongoose.model('EventSchemaModel', eventSchema);

export default EventSchemaModel;
