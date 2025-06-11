const Joi = require('joi');

module.exports.listingSchema = Joi.object({
    listing : Joi.object({
        title : Joi.string().required(),
        description : Joi.string().required(),
        location : Joi.string().required(),
        country : Joi.string().required(),
        price : Joi.number().required().min(0), // Ensure price is a number and non-negative. 
        image: Joi.object({  // ✅ Defines image as an object
            filename: Joi.string().optional(),
            url: Joi.string().uri().allow("", null).default("https://unsplash.com/photos/body-of-water-near-trees-and-mountain-cliff-during-daytime-TWoL-QCZubY")
        }).required() 
        // Allow null or empty string for image

    }).required(),
});

module.exports.reviewSchema = Joi.object({
    review: Joi.object({
        rating: Joi.number().required().min(1).max(5),
        comment : Joi.string().required(),
        
    }).required(),
});