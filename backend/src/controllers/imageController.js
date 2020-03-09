const Image = require("../models/Image");

// list all images from mongo
const listImages = async (req, res) => {
  const images = await Image.find();
  return res.json(images);
};

// upload image to mongo and aws/local
const uploadImage = async (req, res) => {
  const { originalName: name, size, key, location: url = "" } = req.file;

  const post = await Image.create({
    name,
    size,
    key,
    url
  });

  return res.json({
    image: post
  });
};

// delete image from mongo and aws/local
const deleteImage = async (req, res) => {
  const image = await Image.findById(req.params.id);
  await image.remove();
  return res.send("Image removed");
};

module.exports = {
  listImages,
  uploadImage,
  deleteImage
}