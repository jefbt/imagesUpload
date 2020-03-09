const routes = require("express").Router();
const multer = require("multer");
const multerConfig = require("./config/multer");

const Image = require("./models/Image");

routes.get("/images", async (req, res) => {
  const images = await Image.find();
  return res.json(images);
});

routes.post("/images/upload", multer(multerConfig).single("file"),
  async (req, res) => {
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
  }
);

routes.delete("/images/:id", async (req, res) => {
  const image = await Image.findById(req.params.id);
  await image.remove();
  return res.send("Image removed");
});

module.exports = routes;