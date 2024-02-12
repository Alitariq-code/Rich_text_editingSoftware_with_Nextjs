import { useState } from 'react';
import dynamic from 'next/dynamic';
import 'react-quill/dist/quill.snow.css'; // Import the styles
import ReactMarkdown from 'react-markdown';
import { MdInsertEmoticon } from 'react-icons/md';
import TurndownService from 'turndown';
import { motion } from 'framer-motion';

import { BeatLoader } from 'react-spinners';

const ReactQuill = dynamic(() => import('react-quill'), { ssr: false });
const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { delay: 0.5 } },
};
function Home() {
  const [editorHtml, setEditorHtml] = useState('');
  const [showPreview, setShowPreview] = useState(false);
  const [blogImage, setBlogImage] = useState('');
  const [selectedFile, setSelectedFile] = useState(null);
  const [markdownContent, setMarkdownContent] = useState('');
  const [loading, setLoading] = useState(false);
  const [blogLoading, setblogLoading] = useState(false);
  const [blogTitle, setBlogTitle] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');

  const cloudinaryCloudName = 'dy3liiuap';
  const cloudinaryUploadPreset = 'Cab-service';

  const modules = {
    toolbar: [
      ['undo', 'redo'],
      [{ header: [1, 2, 3, 4, 5, 6, false] }],
      ['bold', 'italic', 'underline', 'strike'],
      ['blockquote', 'code-block'],
      [{ list: 'ordered' }, { list: 'bullet' }],
      ['link', 'image'],
      [{ color: [] }, { background: [] }],
      ['align', 'size'],
      ['indent', 'outdent'],
      ['clean'],
      ['emoji'],
      ['formula'],
      ['font'], // Add font dropdown to the toolbar
      ['style'], // Add style dropdown to the toolbar
    ],
  };

  const formats = [
    'undo',
    'redo',
    'header',
    'bold',
    'italic',
    'underline',
    'strike',
    'blockquote',
    'code-block',
    'list',
    'bullet',
    'link',
    'image',
    'color',
    'background',
    'align',
    'size',
    'indent',
    'outdent',
    'clean',
    'emoji',
    'formula',
    'font', // Add font format
    'style', // Add style format
  ];
  const convertToMarkdown = async () => {
    console.log(editorHtml);
    const localImageUrls = extractLocalImageUrls(editorHtml);

    // Upload local images to Cloudinary and replace local URLs with Cloudinary URLs
    const cloudinaryHtml = await uploadImagesToCloudinary(
      localImageUrls,
      editorHtml
    );

    setEditorHtml(cloudinaryHtml);
    console.log(cloudinaryHtml);

    setLoading(false);
  };
  const handleEditorChange = async (html) => {
    setEditorHtml(html);
  };

  const extractLocalImageUrls = (html) => {
    console.log('will search');

    // Create a temporary div element to parse the HTML
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = html;

    // Query for image elements within the parsed HTML
    const imageElements = tempDiv.querySelectorAll('img');

    // Extract and return the src attribute of each image element
    const imageUrls = Array.from(imageElements).map((img) => img.src);

    if (imageUrls.length > 0) {
      console.log('milla hai kuch');
      return imageUrls;
    } else {
      console.log('nhi milla');
      return [];
    }
  };

  const uploadImagesToCloudinary = async (localImageUrls, html) => {
    let updatedHtml = html;

    for (const localImageUrl of localImageUrls) {
      const file = await fetch(localImageUrl).then((res) => res.blob());

      const formData = new FormData();
      formData.append('file', file);
      formData.append('upload_preset', cloudinaryUploadPreset);

      const response = await fetch(
        `https://api.cloudinary.com/v1_1/${cloudinaryCloudName}/image/upload`,
        {
          method: 'POST',
          body: formData,
        }
      );

      const data = await response.json();
      console.log(data);
      const cloudinaryUrl = data.secure_url;

      updatedHtml = updatedHtml.replace(localImageUrl, cloudinaryUrl);
    }

    return updatedHtml;
  };

  const togglePreview = () => {
    console.log(editorHtml);
    setLoading(true);
    setShowPreview(!showPreview);
    setLoading(false);
  };

  const clearContent = () => {
    setEditorHtml('');
  };

  const handleImageChange = (event) => {
    const imageURL = event.target.value;
    setBlogImage(imageURL);
  };

  const handleFileChange = (event) => {
    const file = event.target.files[0];
    setSelectedFile(file);
  };

  const postBlog = async () => {
    try {
      setblogLoading(true);
      await convertToMarkdown();

      // Ensure that required fields are not empty before making the API call
      if (!blogTitle || !selectedCategory || !editorHtml || !selectedFile) {
        alert('Please fill in all the required fields.');
        setblogLoading(false);
        return;
      }

      // Get the current date and time in UTC format
      const currentDateTime = new Date().toISOString();

      const formData = new FormData();
      formData.append('title', blogTitle);
      formData.append('category', selectedCategory);
      formData.append('description', editorHtml);
      formData.append('date_time', currentDateTime); // Add current date and time

      if (selectedFile) {
        formData.append('image', selectedFile);
      }

      // Make the POST request to your API endpoint
      const response = await fetch('http://178.16.142.39:8003/api/v1/blog/', {
        method: 'POST',
        body: formData,
      });

      if (response.ok) {
        const data = await response.json();
        alert('Blog posted successfully:');

        // Clear values after successful post
        setBlogTitle('');
        setSelectedCategory('');
        setEditorHtml('');
        setMarkdownContent('');
        setBlogImage('');
        setSelectedFile(null);

        // You can add any additional handling or redirection after successful post
      } else {
        const data = await response.json();
        console.log('Error details:', data);
        console.error('Error posting the blog:', response);
        // You can handle errors or show an error message to the user
      }
    } catch (error) {
      console.error('Error posting the blog:', error);
    } finally {
      setblogLoading(false);
    }
  };

  return (
    <motion.main
      className="min-h-screen p-8 bg-gradient-to-br from-blue-400 via-purple-500 to-pink-500 text-white"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      <main className="min-h-screen p-8 bg-gradient-to-br from-blue-400 via-purple-500 to-pink-500 text-white">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 h-full">
          <motion.div
            className="lg:col-span-1 flex flex-col bg-white rounded-md p-6"
            // whileHover={{ scale: 1.05 }}
          >
            <div className="mb-4">
              <label
                htmlFor="blogTitle"
                className="text-gray-800 font-medium mb-2 block"
              >
                Blog Title
              </label>
              <input
                type="text"
                id="blogTitle"
                placeholder="Enter your blog title..."
                value={blogTitle}
                onChange={(e) => setBlogTitle(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring focus:border-blue-300 transition duration-300 text-black"
              />
            </div>

            <div className="mb-4">
              <label
                htmlFor="category"
                className="text-gray-800 font-medium mb-2 block"
              >
                Category
              </label>
              <select
                id="category"
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="px-4 py-2 border border-black-300 rounded-md bg-black text-white focus:outline-none focus:ring focus:border-blue-300 transition duration-300"
              >
                <option value="">Select a category...</option>

                <option value="data_science">Data Science</option>
                <option value="data_engineering">Data Engineering</option>
                <option value="machine_learning'">Machine Learning</option>
                <option value="deep_learning">Deep Learning</option>
              </select>
            </div>
            <div className="flex mt-8 flex-col lg:flex-row lg:items-center lg:justify-between">
              <div className="flex flex-col space-y-4 lg:flex-row lg:items-center lg:space-x-4 lg:space-y-0">
                {loading ? (
                  <BeatLoader color="#36D7B7" loading={loading} size={15} />
                ) : (
                  <button
                    onClick={() => {
                      togglePreview();
                    }}
                    className="bg-blue-500 text-white px-6 py-3 rounded-md hover:bg-blue-600 focus:outline-none focus:ring focus:border-blue-300 transition duration-300"
                  >
                    {showPreview ? 'Hide Preview' : 'Show Preview'}
                  </button>
                )}
                <button
                  onClick={clearContent}
                  className="bg-red-500 text-white px-6 py-3 rounded-md hover:bg-red-600 focus:outline-none focus:ring focus:border-red-300 transition duration-300"
                >
                  Clear Content
                </button>
              </div>
              <div className="flex flex-col space-y-4 lg:flex-row lg:items-center lg:space-y-0">
                <label className="flex items-center space-x-2">
                  <span className="text-gray-700">Upload Image:</span>
                  <input
                    type="file"
                    onChange={handleFileChange}
                    className="cursor-pointer text-black"
                  />
                </label>
              </div>
            </div>

            <div className="mb-6 flex-grow">
              <ReactQuill
                theme="snow"
                value={editorHtml}
                onChange={handleEditorChange}
                placeholder="Start typing here..."
                modules={modules}
                formats={formats}
                style={{ height: '80vh', width: '100%', color: 'black' }}
              />
            </div>
          </motion.div>

          <motion.div
            className="lg:col-span-1 h-full bg-gray-100 rounded-md p-6"
            // whileHover={{ scale: 1.05 }}
          >
            {blogLoading ? (
              <BeatLoader color="#36D7B7" loading={blogLoading} size={15} />
            ) : (
              <button
                className="bg-green-500 text-white px-6 py-3 rounded-md right-4  hover:bg-green-600 focus:outline-none focus:ring focus:border-green-300 transition duration-300"
                onClick={postBlog}
              >
                Post the Blog
              </button>
            )}
            <div className="prose max-w-full text-black">
              {showPreview && (
                <div dangerouslySetInnerHTML={{ __html: editorHtml }} />
              )}
              {!showPreview && (
                <div className="flex items-center justify-center h-full bg-gray-200 border rounded-md">
                  <MdInsertEmoticon className="text-5xl text-blue-500" />
                </div>
              )}
            </div>
          </motion.div>
        </div>
      </main>
    </motion.main>
  );
}

export default Home;
