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

const listings = require('./routes/listing.js');


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



const validateReview = (req, res, next) => {
    let {error} = reviewSchema.validate(req.body);
        if(error){
            let errMsg = error.details.map((el) => el.message).join(",");
            throw new ExpressError(400, errMsg);
        }else{
            next();
        }
};

app.use("/listings", listings);

//Reviews
//Post Review route (post route)
app.post("/listings/:id/reviews", validateReview, wrapAsync(async (req, res) => {
        let listing = await Listing.findById(req.params.id);
        let newReview = new Review(req.body.review);

        listing.reviews.push(newReview);
        
        await newReview.save();
        await listing.save();

        console.log("new review: ", newReview);
        res.redirect(`/listings/${listing._id}`);
}));

//Delete Review Route
app.delete("/listings/:id/reviews/:reviewId",  wrapAsync (async (req, res) => {
    let {id, reviewId} = req.params;
    await Listing.findByIdAndUpdate(id, {$pull: {reviews: reviewId}});
    await Review.findByIdAndDelete(reviewId);
    console.log(reviewId);
    res.redirect(`/listings/${id}`);

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