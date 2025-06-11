const express = require ('express');
const app = express();
const mongoose = require('mongoose');
const path = require('path');
const methodOverride = require('method-override');
const ejsMate = require ('ejs-mate');
const ExpressError = require('./utils/ExpressError.js');


const listings = require('./routes/listing.js');
const reviews = require('./routes/review.js');  


//mongod --dbpath "C:\Program Files\MongoDB\Server\8.0\data" --logpath "C:\Program Files\MongoDB\Server\8.0\bin\mongod.log" --install --serviceName "MongoDB"

main()
.then((res) => {
    console.log("connection Successful");
})
.catch( err => console.log("Error: ", err));

async function main () {
    await mongoose.connect("mongodb://127.0.0.1:27017/wanderlust");
}

app.set('view engine', 'ejs');
app.set("views", path.join(__dirname, "views"));
app.use(express.urlencoded({extended: true}));
app.use(methodOverride("_method"));
app.engine("ejs", ejsMate);
app.use(express.static(path.join(__dirname, "/public")));


app.get("/", (req, res) => {

    res.send("hello, i am root!");
});


app.use("/listings", listings);
app.use("/listings/:id/reviews", reviews);



/*app.get("/testListing", async (req, res) => {
    
    let sampleListing = new Listing ({
        title: "My New Villa",
        description: "A beautiful villa by the Beach",
        price: 1200,
        location: "Calangute, goa",
        country: "India"
    });

    await sampleListing.save();
    console.log("sample was saved to db");
    res.send("successful testing.");
});*/

app.all(/.*/, (req, res, next) => {
    next(new ExpressError(404, "page not found"));
});


//error handling middleware
app.use((err, req, res, next) => {
    let {status = 500, message = "Something went wrong!"} = err;
    res.status(status).render("error.ejs", {message});
    //res.status(status).send(message);
});

app.listen(8080, () => {
    console.log("server is listening to port 8080");
});