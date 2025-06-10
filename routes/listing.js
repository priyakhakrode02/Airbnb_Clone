const express = require ('express');
const router = express.Router();
const wrapAsync = require('../utils/wrapAsync.js');
const ExpressError = require('../utils/ExpressError.js');
const {listingSchema, reviewSchema} = require("../schema.js");
const Listing = require('../models/listing.js');



const validateListing = (req, res, next) => {
    let {error} = listingSchema.validate(req.body);
        if(error){
            let errMsg = error.details.map((el) => el.message).join(",");
            throw new ExpressError(400, errMsg);
        }else{
            next();
        }
};

//index route. (home page)
router.get("/", wrapAsync (async (req, res) => {

        const allListings = await Listing.find({});
        res.render("listings/index.ejs", {allListings});
}));


//New Route

router.get("/new",  (req, res) => {

    res.render("listings/new.ejs");
});

//Show Route


router.get("/:id", wrapAsync (async (req, res) => {

    let {id} = req.params;
    const listing  = await Listing.findById(id).populate("reviews");
   // console.log("listing: ", listing);
    res.render("listings/show.ejs", {listing});
}));

//Create Route

router.post("/", validateListing, wrapAsync (async (req, res, next) => {

        
    //let {title, description, image, price, location, country} = req.body;      
        const newListing = new Listing(req.body.listing);
        await newListing.save();
        console.log(newListing);
        res.redirect("/listings")
        
}));

//edit page Route

router.get("/:id/edit", wrapAsync (async(req, res) => {

    let {id} = req.params;
    const listing = await Listing.findById(id);
    res.render("listings/edit.ejs", {listing});
}));

//update Route
router.put("/:id", validateListing, wrapAsync (async (req, res) => {
    let {id} = req.params;
    const updatedListing = await Listing.findByIdAndUpdate(id, {...req.body.listing}, {new: true});
    res.redirect(`/listings/${id}?updated=true`);
}));

//delete route
router.delete("/:id", wrapAsync (async (req, res) => {

    let {id} = req.params;
    const deletedListing = await Listing.findByIdAndDelete(id);
    res.redirect("/listings")
}));

module.exports = router;
