const mongoose = require('mongoose');

const blogSchema = new mongoose.Schema({
  title: { type: String, required: [true, '{PATH} is required'] },
  description: { type: String, required: [true, '{PATH} is required'] },
  content: { type: String, required: [true, '{PATH} is required'] },
  tags: [{ type: String }],
  author: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  createdAt: { type: Date, default: Date.now },
  updatedAt: Date,
});

blogSchema.set('toJSON', {
  transform: (document, returnedObject) => {
    returnedObject.id = returnedObject._id.toString();
    delete returnedObject._id;
    delete returnedObject.__v;
  },
});

module.exports = mongoose.model('Blog', blogSchema);
