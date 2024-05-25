import mongoose from 'mongoose';

const { Schema, model } = mongoose;

const eventSchema = new Schema({
    event_brochure: {
        type: String,
        required: true
    },
    event_date: {
        type: Date,
        required: true
    },
    event_place: {
        type: String,
        required: true
    },
    event_name: {
        type: String,
        required: true
    }
}, {
    timestamps: true
});

const Event = model('Event', eventSchema);

export default Event;
