import { Blog } from '../model/blog.js';
import { uploadOnCloudinary } from '../utils/cloudinary.js'; // Adjust path as needed
import generateSlug from '../utils/generateSlug.js'; // Ensure this utility function is imported


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

    // Generate slug using the title
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
    const blogs = await Blog.find().sort({ createdAt: -1 }); // Sort by latest first
    res.status(200).json(blogs);
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

export const updateBlogBySlug = async (req, res) => {
  try {
    const { slug } = req.params;
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

    const updatedBlog = await Blog.findOneAndUpdate(
      { slug },
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
    await deleteFromCloudinary(deletedBlog.image); // Uncomment if you want to delete the image from Cloudinary

    res.status(200).json({ message: 'Blog deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting blog', error });
  }
};
