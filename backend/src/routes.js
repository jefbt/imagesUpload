const routes = require("express").Router();
const multer = require("multer");
const multerConfig = require("./config/multer");

const imageController = require("./controllers/imageController");

routes.get(
  "/images",
  imageController.listImages
);

routes.post(
  "/images/upload",
  multer(multerConfig).single("file"),
  imageController.uploadImage
);

routes.delete(
  "/images/:id", 
  imageController.deleteImage
);

module.exports = routes;