const express = require ('express');
const app = express();
const mongoose = require('mongoose');
const Listing = require('./models/listing.js');
const path = require('path');
const methodOverride = require('method-override');
const ejsMate = require ('ejs-mate');
const wrapAsync = require('./utils/wrapAsync.js');
const ExpressError = require('./utils/ExpressError.js');
const {listingSchema, reviewSchema} = require("./schema.js");
const Review = require('./models/review.js');


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

const validateListing = (req, res, next) => {
    let {error} = listingSchema.validate(req.body);
        if(error){
            let errMsg = error.details.map((el) => el.message).join(",");
            throw new ExpressError(400, errMsg);
        }else{
            next();
        }
};

const validateReview = (req, res, next) => {
    let {error} = reviewSchema.validate(req.body);
        if(error){
            let errMsg = error.details.map((el) => el.message).join(",");
            throw new ExpressError(400, errMsg);
        }else{
            next();
        }
};

//index route. (home page)
app.get("/listings", wrapAsync (async (req, res) => {

        const allListings = await Listing.find({});
        res.render("listings/index.ejs", {allListings});
}));


//New Route

app.get("/listings/new",  (req, res) => {

    res.render("listings/new.ejs");
});

//Show Route

app.get("/listings/:id", wrapAsync (async (req, res) => {

    let {id} = req.params;
    const listing  = await Listing.findById(id).populate("reviews");
   // console.log("listing: ", listing);
    res.render("listings/show.ejs", {listing});
}));

//Create Route

app.post("/listings", validateListing, wrapAsync (async (req, res, next) => {

        
    //let {title, description, image, price, location, country} = req.body;      
        const newListing = new Listing(req.body.listing);
        await newListing.save();
        console.log(newListing);
        res.redirect("/listings")
        
}));

//edit page Route

app.get("/listings/:id/edit", wrapAsync (async(req, res) => {

    let {id} = req.params;
    const listing = await Listing.findById(id);
    res.render("listings/edit.ejs", {listing});
}));

//update Route
app.put("/listings/:id", validateListing, wrapAsync (async (req, res) => {
    let {id} = req.params;
    const updatedListing = await Listing.findByIdAndUpdate(id, {...req.body.listing}, {new: true});
    res.redirect(`/listings/${id}?updated=true`);
}));

//delete route
app.delete("/listings/:id", wrapAsync (async (req, res) => {

    let {id} = req.params;
    const deletedListing = await Listing.findByIdAndDelete(id);
    res.redirect("/listings")
}));

//Review (post route)
app.post("/listings/:id/reviews", validateReview, wrapAsync(async (req, res) => {
        let listing = await Listing.findById(req.params.id);
        let newReview = new Review(req.body.review);

        listing.reviews.push(newReview);
        
        await newReview.save();
        await listing.save();

        console.log("new review: ", newReview);
        res.redirect(`/listings/${listing._id}`);
}));


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