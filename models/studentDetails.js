import mongoose from 'mongoose';

const { Schema } = mongoose;

const participatedEventSchema = new Schema({
    eventName: {
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
    participatingStudents: [{
        studentName: {
            type: String,
            required: true
        },
        studentRegNo: {
            type: String,
            required: true
        }
    }],
    eventImages: [{
        type: String, // Store the path of the uploaded image files
        required: true
    }]
});

const ParticipatedEvent = mongoose.model('ParticipatedEvent', participatedEventSchema);

export default ParticipatedEvent;
