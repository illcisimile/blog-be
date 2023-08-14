const blogsRouter = require('express').Router();
const Blog = require('../models/blog');
const { userExtractor } = require('../utils/middleware');

blogsRouter.get('/', async (request, response) => {
  const blogs = await Blog.find({}).populate('author', { name: 1 });
  response.status(200).json(blogs);
});

blogsRouter.get('/:id', async (request, response) => {
  const blog = await Blog.findById(request.params.id);

  if (blog) {
    response.status(200).json(blog);
  } else {
    response.status(404).end();
  }
});

blogsRouter.post('/', userExtractor, async (request, response) => {
  const body = request.body;
  const user = request.user;

  const blog = new Blog({
    title: body.title,
    description: body.description,
    content: body.content,
    tags: body.tags,
    author: user.id,
  });

  const savedBlog = await blog.save();
  const populatedSavedBlog = await savedBlog.populate('author', { name: 1 });

  user.blogs = user.blogs.concat(savedBlog.id);
  await user.save();

  response.status(201).json(populatedSavedBlog);
});

module.exports = blogsRouter;
