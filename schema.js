const Joi = require('joi');

module.exports.listingSchema = Joi.object({
    listing : Joi.object({
        title : Joi.string().required(),
        description : Joi.string().required(),
        location : Joi.string().required(),
        country : Joi.string().required(),
        price : Joi.number().required().min(0), // Ensure price is a number and non-negative.
        image : Joi.string().allow("", null) // Allow null or empty string for image

    }).required(),
});

module.exports.reviewSchema = Joi.object({
    review: Joi.object({
        comment : Joi.string().required(),
        rating: Joi.number().required()
    }).required(),
});