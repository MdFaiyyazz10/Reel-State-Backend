

const generateSlug = (title) => {
    return title
      .toLowerCase() // Title ko lower case mein convert karna
      .replace(/[^a-z0-9]+/g, "-") // Special characters aur spaces ko replace karna
      .replace(/(^-|-$)/g, ""); // Leading aur trailing hyphens ko remove karna
  };
  
  export default generateSlug;
  