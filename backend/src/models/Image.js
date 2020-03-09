const mongoose = require("mongoose");
const aws = require("aws-sdk");
const fs = require("fs");
const path = require("path");
const { promisify } = require("util");

const s3 = new aws.S3();

const ImageSchema = new mongoose.Schema({
  name: String,
  size: Number,
  key: String,
  url: String,
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// middleware interception to generate local file url
ImageSchema.pre("save", function() {
  if  (!this.url) {
    this.url = `${process.env.APP_URL}/files/${this.key}`
  }
});

// middleware interception to remove file locally or in the cloud
ImageSchema.pre("remove", function() {
  if (process.env.STORAGE_TYPE === "s3") {
    return s3.deleteObject({
      Bucket: process.env.S3_BUCKET,
      Key: this.key
    }).promise();
  } else {
    return promisify(fs.unlink)(
      path.resolve(__dirname, "..", "..", "tmp", "uploads", this.key)
    );
  }
});

module.exports = mongoose.model("Image", ImageSchema);