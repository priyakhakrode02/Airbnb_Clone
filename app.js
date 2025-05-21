const express = require ('express');
const app = express();
const mongoose = require('mongoose');
const Listing = require("./models/listing.js");
const path = require("path");
const methodOverride = require('method-override');
const ejsMate = require ('ejs-mate');

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


//index route. (home page)
app.get("/listings", async (req, res) => {

        const allListings = await Listing.find({});
        res.render("listings/index.ejs", {allListings});
});

//New Route

app.get("/listings/new",  (req, res) => {

    res.render("listings/new.ejs");
});

//Show Route

app.get("/listings/:id", async (req, res) => {

    let {id} = req.params;
    const listing  = await Listing.findById(id);
   // console.log("listing: ", listing);
    res.render("listings/show.ejs", {listing});
});

//Create Route

app.post("/listings", async (req, res) => {

    //let {title, description, image, price, location, country} = req.body;
    
    const newListing = new Listing(req.body.listing);
    await newListing.save();
    console.log(newListing);
    res.redirect("/listings")
});

//edit page Route

app.get("/listings/:id/edit", async(req, res) => {

    let {id} = req.params;
    const listing = await Listing.findById(id);
    res.render("listings/edit.ejs", {listing});
});

//update Route
app.put("/listings/:id", async (req, res) => {
    let {id} = req.params;
    const updatedListing = await Listing.findByIdAndUpdate(id, {...req.body.listing}, {new: true});
    res.redirect(`/listings/${id}?updated=true`);
});

//delete route
app.delete("/listings/:id", async (req, res) => {

    let {id} = req.params;
    const deletedListing = await Listing.findByIdAndDelete(id);
    res.redirect("/listings")
});


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

app.listen(8080, () => {
    console.log("server is listening to port 8080");
});