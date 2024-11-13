import { Blog } from '../model/blog.js';
import { uploadOnCloudinary, deleteFromCloudinary } from '../utils/cloudinary.js';
import generateSlug from '../utils/generateSlug.js';

export const createBlog = async (req, res) => {
  try {
    const { title, content } = req.body;
    let image = '';

    if (!title || !content) {
      return res.status(400).json({ message: 'Title and content are required.' });
    }

    if (req.file) {
      const localFilePath = req.file.path;
      const uploadResult = await uploadOnCloudinary(localFilePath, 'blogs');
      image = uploadResult.url;
    }

    const slug = generateSlug(title);

    const blog = new Blog({ title, content, image, slug });
    const savedPost = await blog.save();

    res.status(201).json({ message: 'Blog created successfully', savedPost });
  } catch (error) {
    res.status(500).json({ message: 'Error creating blog', error });
  }
};

export const getAllBlogs = async (req, res) => {
  try {
    const blogs = await Blog.find().sort({ createdAt: -1 });
    res.status(200).json({ message: "All Blogs retrieved", blogs });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching blogs', error });
  }
};


export const getLatestBlogs = async (req, res) => {
  try {
    const blogs = await Blog.find().sort({ createdAt: -1 }).limit(3);
    res.status(200).json({ message: "Latest Blogs retrieved", blogs });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching blogs', error });
  }
};


export const getBlogBySlug = async (req, res) => {
  try {
    const { slug } = req.params;
    const blog = await Blog.findOne({ slug });

    if (!blog) {
      return res.status(404).json({ message: 'Blog not found' });
    }

    res.status(200).json(blog);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching blog', error });
  }
};

// Update blog by ID
export const updateBlogById = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, content } = req.body;
    let image = '';

    if (!title || !content) {
      return res.status(400).json({ message: 'Title and content are required.' });
    }

    if (req.file) {
      const localFilePath = req.file.path;
      const uploadResult = await uploadOnCloudinary(localFilePath, 'blogs');
      image = uploadResult.url;
    }

    const updatedBlog = await Blog.findByIdAndUpdate(
      id,
      { title, content, image, slug: generateSlug(title) },
      { new: true, runValidators: true }
    );

    if (!updatedBlog) {
      return res.status(404).json({ message: 'Blog not found' });
    }

    res.status(200).json({ message: 'Blog updated successfully', updatedBlog });
  } catch (error) {
    res.status(500).json({ message: 'Error updating blog', error });
  }
};

export const deleteBlogById = async (req, res) => {
  try {
    const { id } = req.params;
    const deletedBlog = await Blog.findByIdAndDelete(id);

    if (!deletedBlog) {
      return res.status(404).json({ message: 'Blog not found' });
    }

    // Optionally, delete image from Cloudinary if needed
    await deleteFromCloudinary(deletedBlog.image);

    res.status(200).json({ message: 'Blog deleted successfully' });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: 'Error deleting blog', error });
  }
};



export const getBlogsWithPagination = async (req, res) => {
  try {
    const { page = 1, limit = 10, search = '' } = req.query;

    // Convert page and limit to integers
    const pageNumber = parseInt(page, 10);
    const limitNumber = parseInt(limit, 10);

    // Build query for searching
    const query = search ? { title: { $regex: search, $options: 'i' } } : {};

    // Fetch blogs with pagination and search
    const blogs = await Blog.find(query)
      .sort({ createdAt: -1 })
      .skip((pageNumber - 1) * limitNumber)
      .limit(limitNumber);

    // Get total count of blogs
    const totalBlogs = await Blog.countDocuments(query);
    const totalPages = Math.ceil(totalBlogs / limitNumber);

    res.status(200).json({
      message: 'Blogs retrieved successfully',
      blogs,
      totalBlogs,
      totalPages,
      currentPage: pageNumber,
    });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching blogs', error });
  }
};
