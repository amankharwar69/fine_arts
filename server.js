import express from 'express';
import mongoose from 'mongoose';
import path from 'path';
import bodyParser from 'body-parser';
import { request } from 'http';
import Login from './models/admin.js'
import Event from './models/event.js';
import multer from 'multer';
import fs from 'fs'; // Import the 'fs' module for file system operations


const app = express()
const port = 3000





/* connection of the database */
mongoose.connect("mongodb+srv://amankharwar699:umOO1z0gDki7pcnq@cluster0.wydnqur.mongodb.net/finearts?retryWrites=true&w=majority&appName=Cluster0")
    .then(() => {
        console.log("mongodb connected successfully....")
    })
    .catch(function (error) {
        console.log("mongodb connection failed...")
    });







// Body parsing middleware for handling form submissions
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

// setting ejs template engine
app.set('view engine', 'ejs')
const __dirname = path.resolve();
app.use(express.static(path.join(__dirname, 'public')));



app.get('/', (req, res) => {
    res.render("index.ejs");
})





// Route to handle form submission
app.post('/loginpage', async (req, res) => {
    // Check the value of the clicked button
    const buttonClicked = req.body.button;

    // Handle button click
    switch (buttonClicked) {
        case 'aboutus':
            res.render('about');
            break;
        case 'gallery':
            res.render('gallery');
            break; // Don't forget to add break here
        case 'events':
            try {
                const event_data = await Event.find();
                // Define formatDate function
                function formatDate(dateString) {
                    const date = new Date(dateString);
                    const options = { weekday: 'short', month: 'short', day: 'numeric' };
                    return date.toLocaleDateString('en-US', options);
                }
    
                // Render the EJS template with event data
                res.render('events', { event_data, formatDate });
            } catch (error) {
                console.error('Error fetching events:', error);
                res.render('events', { event_data: [] }); // Render events page with empty array if there's an error
            }
            break;
        case 'login':
            res.render('login'); // Redirect to the login page
            break;
        case 'home':
            res.render('index'); // Redirect to the login page
            break;
        case 'logout':
            res.render('login');
            break;
        case 'continue':
            res.render('mainadmin');
            break;
        case 'update':
            res.render('update')
            break;
        case 'admin':
            res.render('mainadmin')
        default:
            res.send('Invalid Request');
    }
    
});




// app.post('/home',(req,res)=>{
//     res.render("home")
// })





app.post('/login', async (req, res) => {
    console.log(req.body);
    const buttonClicked = req.body.back;

    switch (buttonClicked) {
        case 'login': try {
            const login = await Login.findOne({ username: req.body.username });
            console.log(login);
            if (login) {
                if (login.password === req.body.password) {
                    res.render("adminhome.ejs");
                } else {

                    res.render("login"); // Redirect to the login page
                    break;

                }
            } else {
                res.send("Username not found");
            }
        } catch (error) {
            console.error(error);
            res.status(500).send("Internal Server Error");
        }
            break;

        case 'back': res.render('index');
            break;
    }

});


// Multer configuration for file uploads
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const uploadDir = 'uploads/';
        // Create the destination directory if it doesn't exist
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

// Route to handle form submission
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



// Route to handle form submission
app.post('/submit-participated-events', upload.array('eventImage', 5), async (req, res) => {
    try {
        const {
            eventName,
            eventPrize,
            eventPlace,
            eventDate,
            studentName,
            studentRegNo
        } = req.body;

        const eventImages = req.files.map(file => file.path);

        const participatingStudents = studentName.map((name, index) => ({
            studentName: name,
            studentRegNo: studentRegNo[index]
        }));

        const newParticipatedEvent = new ParticipatedEvent({
            eventName,
            eventPrize,
            eventPlace,
            eventDate,
            participatingStudents,
            eventImages
        });

        await newParticipatedEvent.save();

        res.status(201).send('Participated event details submitted successfully');
    } catch (error) {
        res.status(500).send('Error submitting participated event details: ' + error.message);
    }
});






app.listen(port, () => {
    console.log(`Example app listening on port ${port}`)
})