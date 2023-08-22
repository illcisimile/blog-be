const blogsRouter = require('express').Router();
const Blog = require('../models/blog');
const { userExtractor } = require('../utils/middleware');

blogsRouter.get('/', async (request, response) => {
  const blogs = await Blog.find({}).populate('author', {
    name: 1,
    username: 1,
  });
  response.status(200).json(blogs);
});

blogsRouter.get('/:blogId', async (request, response) => {
  const blogId = request.params.blogId;

  const blog = await Blog.findById(blogId).populate('author', {
    name: 1,
    username: 1,
  });

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

  const populatedSavedBlog = await savedBlog.populate('author', {
    name: 1,
    username: 1,
  });

  user.blogs = user.blogs.concat(savedBlog.id);
  await user.save();

  response.status(201).json(populatedSavedBlog);
});

blogsRouter.put('/:blogId', userExtractor, async (request, response) => {
  const blogId = request.params.blogId;
  const body = request.body;
  const user = request.user;

  const blog = await Blog.findById(blogId);

  if (!blog) {
    return response.status(404).json({ error: 'blog does not exist' });
  }

  if (blog.author.toString() !== user.id) {
    return response.status(401).json({ error: 'unauthorized' });
  }

  const updatedBlogObject = {
    title: body.title,
    description: body.description,
    content: body.content,
    tags: body.tags,
    author: user.id,
    updatedAt: Date.now(),
  };

  const updatedBlog = await Blog.findByIdAndUpdate(blogId, updatedBlogObject, {
    new: true,
    runValidators: true,
  });

  const populatedUpdatedBlog = await updatedBlog.populate('author', {
    name: 1,
    username: 1,
  });

  response.status(200).json(populatedUpdatedBlog);
});

blogsRouter.delete('/:blogId', userExtractor, async (request, response) => {
  const blogId = request.params.blogId;
  const user = request.user;
  const blog = await Blog.findById(blogId);

  if (!blog) {
    return response.status(404).json({ error: 'blog does not exist' });
  }

  if (blog.author.toString() !== user.id) {
    return response.status(401).json({ error: 'unauthorized' });
  }

  user.blogs = user.blogs.filter((blog) => blog.toString() !== blogId);
  await user.save();

  await Blog.findByIdAndRemove(blogId);
  response.status(204).end();
});

module.exports = blogsRouter;
