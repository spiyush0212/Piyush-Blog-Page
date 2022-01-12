// IMPORT MODULES
const express = require('express'),
    app = express(),
    mongoose = require('mongoose'),
    path = require('path'),
    bodyParser = require('body-parser'),
    methodOverride = require('method-override'),
    expressSanitizer = require('express-sanitizer');

// APP CONFIG
app.use(express.static(path.join(__dirname, 'public')));
app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.json());
app.use(expressSanitizer());
app.use(methodOverride('_method'));

// MONGOOSE CONFIG
mongoose.connect('mongodb://0.0.0.0/blogdb');
const blogSchema = mongoose.Schema({
    title: {
        type: String,
        default: 'Untitled Blog'
    },
    image: {
        type: String,
        default: 'https://lanecdr.org/wp-content/uploads/2019/08/placeholder.png'
    },
    body: {
        type: String,
        default: 'This blog does not have a description'
    },
    date: {
        type: Date,
        default: Date.now()
    }
});
const Blog = mongoose.model('Blog', blogSchema);

// MIDDLEWARE
const sanitiseInput = (req, res, next) => {
    req.body.blog.body = req.sanitize(req.body.blog.body);
    next();
};

// ROUTES
app.get('/', (req, res) => {
    res.redirect('/blogs');
})

// INDEX ROUTE
app.get('/blogs', (req, res) => {
    Blog.find({}, (err, doc) => {
        if (err)
            res.send('An error was encountered. Please try again later.')
        else
            res.render('index.ejs', { blogs: doc });
    })
});

// NEW ROUTE
app.get('/blogs/new', (req, res) => {
    res.render('new.ejs');
});

// CREATE ROUTE
app.post('/blogs', sanitiseInput, (req, res) => {
    Blog.create(req.body.blog, (err, doc) => {
        if (err)
            res.redirect('/new');
        else
            res.redirect('/blogs');
    });
});

// SHOW ROUTE
app.get('/blogs/:id', (req, res) => {
    Blog.find({ _id: req.params.id }, (err, doc) => {
        if (err)
            res.redirect('/blogs');
        else
            res.render('show.ejs', { blog: doc });
    })
});

// EDIT ROUTE
app.get('/blogs/:id/edit', (req, res) => {
    Blog.find({ _id: req.params.id }, (err, doc) => {
        if (err)
            res.redirect('/blogs');
        else
            res.render('edit', { blog: doc });
    });
});

// UPDATE ROUTE
app.put('/blogs/:id', sanitiseInput, (req, res) => {
    Blog.findOneAndUpdate(req.params.id, req.body.blog, (err, doc) => {
        if (err)
            res.redirect('/blogs');
        else
            res.redirect('/blogs/' + req.params.id);
    })
});

// DELETE ROUTE
app.delete('/blogs/:id', (req, res) => {
    Blog.findByIdAndDelete(req.params.id, (err, doc) => {
        if (err)
            res.redirect('/blogs');
        else
            res.redirect('/blogs');
    });
});

// START SERVER
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log('Server running on PORT ' + PORT));