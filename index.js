// Modules
const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const imgur = require('imgur');
const multer = require('multer');
const fs = require('fs');
const path = require('path');

// Express instance
const app = express();

const storage = multer.diskStorage({
    destination: './uploads',
    filename: (req, file, cb) => {
        cb(
            null, file.fieldname + '-' + Date.now() + path.extname(file.originalname)
        );
    },
});

const upload = multer({ storage });

app.use(express.json({ extended: false }));
app.use(express.urlencoded({ extended: false }));
app.use(cors());
app.use(morgan('dev'));
app.use(upload.any());
app.set('view engine', 'ejs');

// GETS
app.get('/', (req, res) => {
    res.render('index', {
        url: false
    });
});

app.post('/uploads', async (req, res) => {
    const file = req.files[0];
    
    try {
        const url = await imgur.uploadFile(`./uploads/${file.filename}`);
        res.render('index', { 
            url: url.link
         });
        fs.unlinkSync(`./uploads/${file.filename}`);
    } catch (err) {
        console.log(err);
        res.status(500).json({
            status: 500,
            err: true,
            message: 'Erro interno!'
        });
    }
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => console.log(`Backend is running on port ${PORT}`));