import React, { useEffect, useState } from "react";
import { getSubjectsQuery } from "../../api/material";
import Leftbar from "../Leftbar";
import { useNavigate } from "react-router";
import Loading from "../Loading";
import { FaBook, FaCalculator, FaFlask, FaGlobe, FaLanguage } from 'react-icons/fa';

function Material() {
  const data = getSubjectsQuery();
  const navigate = useNavigate();
  const [subjects, setSubjects] = useState([]);

  useEffect(() => {
    if (data.isSuccess) {
      // Filter and transform the data for class 10 subjects
      const class10Subjects = data.data.map(subject => ({
        ...subject,
        name: subject.name.replace(/^10th /, ''), // Remove '10th ' prefix if present
      }));
      setSubjects(class10Subjects);
    }
  }, [data?.data]);

  const getSubjectIcon = (subjectName) => {
    const subject = subjectName.toLowerCase();
    if (subject.includes("math")) return <FaCalculator className="text-4xl text-blue-500" />;
    if (subject.includes("science")) return <FaFlask className="text-4xl text-green-500" />;
    if (subject.includes("social")) return <FaGlobe className="text-4xl text-amber-500" />;
    if (subject.includes("english")) return <FaLanguage className="text-4xl text-purple-500" />;
    return <FaBook className="text-4xl text-gray-500" />;
  };

  const getSubjectColor = (subjectName) => {
    const subject = subjectName.toLowerCase();
    if (subject.includes("math")) return "bg-blue-50 border-blue-200 hover:bg-blue-100";
    if (subject.includes("science")) return "bg-green-50 border-green-200 hover:bg-green-100";
    if (subject.includes("social")) return "bg-amber-50 border-amber-200 hover:bg-amber-100";
    if (subject.includes("english")) return "bg-purple-50 border-purple-200 hover:bg-purple-100";
    return "bg-gray-50 border-gray-200 hover:bg-gray-100";
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white">
      <div className="container mx-auto px-4 py-12">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-gray-800 mb-4">Class 10th Learning Materials</h2>
          <p className="text-gray-600 max-w-2xl mx-auto">Access comprehensive study materials for all your subjects</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {subjects.length > 0 ? (
            subjects.map((course) => (
              <div
                key={course.id}
                onClick={() => navigate(`/user/material/${course.name}`)}
                className={`group relative overflow-hidden border-2 rounded-xl p-6 ${getSubjectColor(course.name)} transition-all duration-300 transform hover:scale-105 hover:shadow-xl cursor-pointer`}
              >
                <div className="absolute top-0 right-0 w-32 h-32 bg-white/20 rounded-full -mr-16 -mt-16 transition-transform group-hover:scale-125"></div>
                
                <div className="relative z-10">
                  <div className="mb-6">
                    {getSubjectIcon(course.name)}
                  </div>
                  
                  <h3 className="text-xl font-bold mb-2 text-gray-800">
                    {course.name.toUpperCase()}
                  </h3>
                  
                  <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                    {course.description || `Comprehensive study materials for ${course.name}`}
                  </p>
                  
                  <div className="flex items-center text-sm text-gray-500">
                    <FaBook className="mr-2" />
                    <span>Click to view materials</span>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="col-span-full flex justify-center items-center py-12">
              <Loading />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default Material;