import React, { useState } from "react";
import Leftbar from "../Leftbar";
import { createMaterial } from "../../api/material";
import toast from "react-hot-toast";
import { FaFilePdf } from "react-icons/fa";

function CreateMaterial() {
  const [formData, setFormData] = useState({
    title: "",
    content: "",
    classname: "",
    subjectname: "",
  });
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile && selectedFile.type === "application/pdf") {
      setFile(selectedFile);
    } else {
      toast.error("Please select a PDF file");
      e.target.value = null;
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setUploading(true);

    try {
      const formDataToSend = new FormData();
      formDataToSend.append("title", formData.title);
      formDataToSend.append("content", formData.content);
      formDataToSend.append("classname", formData.classname);
      formDataToSend.append("subjectname", formData.subjectname);
      
      if (file) {
        formDataToSend.append("pdfFile", file);
      }

      const data = await createMaterial(formDataToSend);
      if (data.success) {
        toast.success("Material added successfully");
        // Reset form
        setFormData({
          title: "",
          content: "",
          classname: "",
          subjectname: "",
        });
        setFile(null);
        e.target.reset();
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to create material");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-teal-50 p-8 font-['Poppins']">
      <div className="max-w-4xl mx-auto bg-white/80 backdrop-blur-lg rounded-3xl shadow-xl border border-white/20 overflow-hidden transition-all duration-500 hover:shadow-2xl">
        <div className="p-8 border-b border-white/10 bg-gradient-to-r from-emerald-600 via-green-600 to-teal-600">
          <h2 className="text-3xl font-black text-white flex items-center gap-3">
            <span className="bg-white/20 p-2 rounded-lg">
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
            </span>
            Create Learning Material
          </h2>
          <p className="text-blue-100 mt-2 ml-[3.2rem]">Share knowledge with your students through engaging content</p>
        </div>
        
        <form onSubmit={handleSubmit} className="p-8 space-y-6">
          <div className="mb-4">
            <div className="group">
              <label htmlFor="title" className="block text-sm font-semibold text-gray-700 mb-2 transition-colors group-focus-within:text-indigo-600">
                Title of Material
              </label>
              <div className="relative">
                <input
                  type="text"
                  id="title"
                  name="title"
                  value={formData.title}
                  onChange={handleChange}
                  className="w-full px-4 py-3 rounded-xl border-2 border-gray-100 focus:border-indigo-500 focus:ring focus:ring-indigo-200 focus:ring-opacity-50 transition-all duration-300 bg-white/50 backdrop-blur-sm"
                  placeholder="Enter a descriptive title"
                  required
                />
                <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-blue-600/10 via-indigo-600/10 to-violet-600/10 opacity-0 group-focus-within:opacity-100 transition-opacity duration-500 pointer-events-none" />
              </div>
            </div>
          </div>
          <div className="mb-4">
            <div className="group">
              <label htmlFor="content" className="block text-sm font-semibold text-gray-700 mb-2 transition-colors group-focus-within:text-indigo-600">
                Content Description
              </label>
              <div className="relative">
                <textarea
                  id="content"
                  name="content"
                  value={formData.content}
                  onChange={handleChange}
                  rows="4"
                  className="w-full px-4 py-3 rounded-xl border-2 border-gray-100 focus:border-indigo-500 focus:ring focus:ring-indigo-200 focus:ring-opacity-50 transition-all duration-300 bg-white/50 backdrop-blur-sm resize-none"
                  placeholder="Describe the learning material and its objectives..."
                  required
                />
                <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-blue-600/10 via-indigo-600/10 to-violet-600/10 opacity-0 group-focus-within:opacity-100 transition-opacity duration-500 pointer-events-none" />
              </div>
            </div>
          </div>
          <div className="mb-4">
            <div className="group">
              <label htmlFor="classname" className="block text-sm font-semibold text-gray-700 mb-2 transition-colors group-focus-within:text-indigo-600">
                Class Name
              </label>
              <div className="relative">
                <input
                  type="text"
                  id="classname"
                  name="classname"
                  value={formData.classname}
                  onChange={handleChange}
                  className="w-full px-4 py-3 rounded-xl border-2 border-gray-100 focus:border-indigo-500 focus:ring focus:ring-indigo-200 focus:ring-opacity-50 transition-all duration-300 bg-white/50 backdrop-blur-sm"
                  placeholder="e.g., Grade 10, Class XII"
                  required
                />
                <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-blue-600/10 via-indigo-600/10 to-violet-600/10 opacity-0 group-focus-within:opacity-100 transition-opacity duration-500 pointer-events-none" />
              </div>
            </div>
          </div>
          <div className="mb-4">
            <div className="group">
              <label htmlFor="subjectname" className="block text-sm font-semibold text-gray-700 mb-2 transition-colors group-focus-within:text-indigo-600">
                Subject Name
              </label>
              <div className="relative">
                <input
                  type="text"
                  id="subjectname"
                  name="subjectname"
                  value={formData.subjectname}
                  onChange={handleChange}
                  className="w-full px-4 py-3 rounded-xl border-2 border-gray-100 focus:border-indigo-500 focus:ring focus:ring-indigo-200 focus:ring-opacity-50 transition-all duration-300 bg-white/50 backdrop-blur-sm"
                  placeholder="e.g., Mathematics, Physics"
                  required
                />
                <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-blue-600/10 via-indigo-600/10 to-violet-600/10 opacity-0 group-focus-within:opacity-100 transition-opacity duration-500 pointer-events-none" />
              </div>
            </div>
          </div>
          <div className="mb-4">
            <div className="group">
              <label htmlFor="pdfFile" className="block text-sm font-semibold text-gray-700 mb-2 transition-colors group-focus-within:text-indigo-600">
                Upload PDF Material
              </label>
              <div className="mt-1 flex items-center space-x-4">
                <label className="flex items-center px-6 py-4 bg-gradient-to-r from-emerald-500 via-green-500 to-teal-500 rounded-xl shadow-lg cursor-pointer transform hover:scale-[1.02] transition-all duration-300 group-hover:shadow-xl text-white">
                  <FaFilePdf className="mr-3 text-2xl text-white/90" />
                  <span className="font-medium">Choose PDF File</span>
                  <input
                    type="file"
                    id="pdfFile"
                    accept=".pdf"
                    onChange={handleFileChange}
                    className="hidden"
                  />
                </label>
                {file && (
                  <div className="flex items-center px-4 py-2 bg-white/50 backdrop-blur-sm rounded-xl border-2 border-emerald-100">
                    <FaFilePdf className="mr-2 text-indigo-500" />
                    <span className="text-sm text-gray-600 font-medium">{file.name}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
          <div className="mt-4">
            <button
              type="submit"
              disabled={uploading}
              className="w-full bg-gradient-to-r from-emerald-600 via-green-600 to-teal-600 text-white font-bold py-4 px-8 rounded-xl shadow-lg transform hover:scale-[1.02] transition-all duration-300 hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2 text-base"
            >
              {uploading ? (
                <>
                  <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  <span>Uploading Material...</span>
                </>
              ) : (
                <>
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                  <span>Create Learning Material</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default CreateMaterial;