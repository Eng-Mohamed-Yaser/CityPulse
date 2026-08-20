import { body } from "express-validator";

export const validateReport = [
    body("title")
        .trim()
        .isLength({ min: 5, max: 100 })
        .withMessage("Title must be between 5 and 100 characters"),
    body("description")
        .trim()
        .isLength({ min: 15, max: 1000 })
        .withMessage("Description must be between 15 and 1000 characters"),
    body("category")
        .isIn(["Pothole", "Streetlight", "WaterLeak", "Garbage", "RoadDamage", "Other"])
        .withMessage("Invalid category"),
    body("severity")
        .isIn(["Low", "Medium", "High", "Critical"])
        .withMessage("Invalid severity"),
    body("longitude")
        .isFloat({ min: -180, max: 180 })
        .withMessage("Longitude must be a valid number"),
    body("latitude")
        .isFloat({ min: -90, max: 90 })
        .withMessage("Latitude must be a valid number"),
    body("imageUrl")
        .optional({ nullable: true })
        .isURL()
        .withMessage("Image URL must be a valid URL")
];