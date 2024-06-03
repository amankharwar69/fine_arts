import express from 'express';
import mongoose from 'mongoose';
import path from 'path';
import bodyParser from 'body-parser';
import multer from 'multer';
import fs from 'fs';
import Login from './models/admin.js';
import Event from './models/event.js';
import Stud from './models/stud.js';
import Bill from './models/bills.js';

const app = express();
const port = 3000;

// Database connection
mongoose.connect("mongodb+srv://amankharwar699:umOO1z0gDki7pcnq@cluster0.wydnqur.mongodb.net/finearts?retryWrites=true&w=majority&appName=Cluster0")
    .then(() => {
        console.log("mongodb connected successfully....");
    })
    .catch((error) => {
        console.log("mongodb connection failed...", error);
    });

// Body parsing middleware
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(express.json());

// Setting EJS as the template engine
app.set('view engine', 'ejs');
const __dirname = path.resolve();
app.use(express.static(path.join(__dirname, 'public')));

app.get('/', (req, res) => {
    res.render("index.ejs");
});

// Route to handle form submission
app.post('/loginpage', async (req, res) => {
    const buttonClicked = req.body.button;

    switch (buttonClicked) {
        case 'aboutus':
            res.render('about');
            break;
        case 'gallery':
            res.render('gallery');
            break;
        case 'events':
            try {
                const event_data = await Event.find();
                const events = await Stud.find();
                function formatDate(dateString) {
                    const date = new Date(dateString);
                    const options = { weekday: 'short', month: 'short', day: 'numeric' };
                    return date.toLocaleDateString('en-US', options);
                }
                res.render('events', { event_data, formatDate, events });
            } catch (error) {
                console.error('Error fetching events:', error);
                res.render('events', { event_data: [], formatDate });
            }
            break;
        case 'view':
            const events = await Stud.find({});
            const upevents = await Event.find({});
            res.render('adminviews', { events, upevents });
            break;
        case 'login':
            res.render('login');
            break;
        case 'home':
            res.render('index');
            break;
        case 'logout':
            res.render('login');
            break;
        case 'continue':
            res.render('mainadmin');
            break;
        case 'update':
            res.render('update');
            break;
        case 'admin':
            res.render('mainadmin');
            break;
        default:
            res.send('Invalid Request');
    }
});



// delete routes
app.post('/delete-event/:id', async (req, res) => {
    try {
        const event = await Event.findByIdAndDelete(req.params.id);
        if (!event) {
            return res.status(404).send('Event not found');
        }
        res.send('record deleted successfully...');
    } catch (error) {
        res.status(500).send('Error deleting event');
    }
});

app.post('/delete-upevent/:id', async (req, res) => {
    try {
        const event = await Stud.findByIdAndDelete(req.params.id);
        if (!event) {
            return res.status(404).send('Event not found');
        }
        res.send('Student Participated Events record deleted succefully...');
    } catch (error) {
        res.status(500).send('Error deleting event');
    }
});


app.post('/login', async (req, res) => {
    const buttonClicked = req.body.back;

    switch (buttonClicked) {
        case 'login':
            try {
                const login = await Login.findOne({ username: req.body.username });
                if (login) {
                    if (login.password === req.body.password) {
                        res.render("adminhome.ejs");
                    } else {
                        res.render("login");
                    }
                } else {
                    res.send("Username not found");
                }
            } catch (error) {
                console.error(error);
                res.status(500).send("Internal Server Error");
            }
            break;
        case 'back':
            res.render('index');
            break;
    }
});

// Multer configuration for file uploads
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const uploadDir = 'uploads/';
        if (!fs.existsSync(uploadDir)) {
            fs.mkdirSync(uploadDir);
        }
        cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
        cb(null, `${Date.now()}-${file.originalname}`);
    }
});

const upload = multer({ storage });

// Route to handle form submission with file upload
app.post('/upload_event', upload.single('event_brochure'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).send('No file uploaded');
        }

        const { event_date, event_place, event_name } = req.body;
        const event_brochure = req.file.path;

        const newEvent = new Event({
            event_brochure,
            event_date,
            event_place,
            event_name
        });

        await newEvent.save();

        res.status(201).send('Event uploaded successfully');
    } catch (error) {
        res.status(500).send('Error uploading event: ' + error.message);
    }
});

// File download route
app.get('/download/:fileName', (req, res) => {
    const fileName = req.params.fileName;
    const filePath = path.join(__dirname, 'uploads', fileName);

    fs.access(filePath, fs.constants.F_OK, (err) => {
        if (err) {
            console.error(err);
            res.status(404).send('File not found');
            return;
        }

        res.set({
            'Content-Type': 'application/octet-stream',
            'Content-Disposition': `attachment; filename="${fileName}"`,
        });

        const fileStream = fs.createReadStream(filePath);
        fileStream.pipe(res);
    });
});

// Route to handle form submission with multiple files
app.post("/submitevents", upload.array('eventImage', 10), async (req, res) => {
    try {
        const {
            eventName,
            participatedIn,
            eventPrize,
            eventPlace,
            eventDate,
            studentName,
            studentRegNo,
            studentClass
        } = req.body;

        const students = studentName.map((name, index) => ({
            name,
            regNo: studentRegNo[index],
            studentClass: studentClass[index]
        }));

        const eventImages = req.files.map(file => file.path);

        const newEvent = new Stud({
            eventName,
            participatedIn,
            eventPrize,
            eventPlace,
            eventDate,
            students,
            eventImages
        });

        await newEvent.save();
        res.status(201).send('Event submitted successfully');
    } catch (error) {
        console.error('Error submitting event:', error);
        res.status(500).send('Error submitting event: ' + error.message);
    }
});
app.post('/billupload', async (req, res) => {
    try {
        // Extract data from the request body
        const { eventName, eventDate } = req.body;
        const billImage = req.file; // Extracting the file from the request

        console.log(eventName, eventDate, billImage);

        // Create a new bill document
        const bill = new Bill({
            eventName: eventName,
            eventDate: eventDate,
            // billImage: billImage.path // Assuming you are storing the file path
        });

        // Save the bill to the database
        await bill.save();

        // Respond with success message
        res.status(201).json({ message: 'Bill details saved successfully' });
    } catch (error) {
        // Handle errors
        console.error('Error saving bill details:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});


app.listen(port, () => {
    console.log(`Example app listening on port ${port}`);
});
