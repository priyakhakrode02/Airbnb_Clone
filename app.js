const express = require ('express');
const app = express();
const mongoose = require('mongoose');
const Listing = require("./models/listing.js");
const path = require("path");



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


app.get("/", (req, res) => {

    res.send("hello, i am root!");
});


//index route. (home page)
app.get("/listings", async (req, res) => {

        const allListings = await Listing.find({});
        res.render("listings/index.ejs", {allListings});
});

//Show Route

app.get("/listings/:id", async (req, res) => {

    let {id} = req.params;
    const listing  = await Listing.findById(id);
    res.render("listings/show.ejs", {listing});
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