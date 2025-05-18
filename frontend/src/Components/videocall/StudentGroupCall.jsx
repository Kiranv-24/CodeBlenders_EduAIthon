import React, { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import {
  MdGroup,
  MdPersonAdd,
  MdVideoCall,
  MdClose,
  MdCheck,
} from 'react-icons/md';

export function StudentGroupCall({ currentUser, onCreateMeeting }) {
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [selectedStudents, setSelectedStudents] = useState([]);
  const [availableStudents, setAvailableStudents] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    fetchAvailableStudents();
  }, []);

  const fetchAvailableStudents = async () => {
    try {
      setIsLoading(true);
      // TODO: Replace with your actual API call
      const response = await fetch('/api/students/available');
      const data = await response.json();
      setAvailableStudents(data.students);
    } catch (error) {
      console.error('Error fetching students:', error);
      toast.error('Failed to load available students');
    } finally {
      setIsLoading(false);
    }
  };

  const handleStudentSelect = (student) => {
    if (selectedStudents.find(s => s.id === student.id)) {
      setSelectedStudents(selectedStudents.filter(s => s.id !== student.id));
    } else {
      setSelectedStudents([...selectedStudents, student]);
    }
  };

  const handleCreateGroupCall = async () => {
    if (selectedStudents.length === 0) {
      toast.error('Please select at least one student');
      return;
    }

    try {
      setIsLoading(true);
      // Create meeting and send invitations
      const meetingId = await onCreateMeeting();
      
      // Send invitations to selected students
      await Promise.all(selectedStudents.map(student => 
        fetch('/api/meetings/invite', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            meetingId,
            studentId: student.id,
            inviterId: currentUser.id
          })
        })
      ));

      toast.success('Group call created and invitations sent!');
      setShowInviteModal(false);
    } catch (error) {
      console.error('Error creating group call:', error);
      toast.error('Failed to create group call');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <button
        onClick={() => setShowInviteModal(true)}
        className="flex items-center space-x-2 bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg transition-colors duration-200"
      >
        <MdGroup className="text-xl" />
        <span>Create Student Group Call</span>
      </button>

      {/* Invite Modal */}
      {showInviteModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full max-h-[80vh] flex flex-col">
            {/* Modal Header */}
            <div className="p-4 border-b flex justify-between items-center">
              <h3 className="text-lg font-semibold text-gray-800">Create Student Group Call</h3>
              <button
                onClick={() => setShowInviteModal(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <MdClose className="text-xl" />
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-4 flex-1 overflow-y-auto">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="font-medium text-gray-700">Select Students</h4>
                  <span className="text-sm text-gray-500">
                    {selectedStudents.length} selected
                  </span>
                </div>

                {isLoading ? (
                  <div className="flex justify-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {availableStudents.map(student => (
                      <div
                        key={student.id}
                        onClick={() => handleStudentSelect(student)}
                        className={`flex items-center justify-between p-3 rounded-lg cursor-pointer transition-colors duration-200 ${
                          selectedStudents.find(s => s.id === student.id)
                            ? 'bg-blue-50 border border-blue-200'
                            : 'hover:bg-gray-50 border border-gray-100'
                        }`}
                      >
                        <div className="flex items-center space-x-3">
                          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-white font-medium">
                            {student.name.charAt(0)}
                          </div>
                          <div>
                            <div className="font-medium text-gray-800">{student.name}</div>
                            <div className="text-sm text-gray-500">{student.email}</div>
                          </div>
                        </div>
                        <div className={`w-6 h-6 rounded-full flex items-center justify-center ${
                          selectedStudents.find(s => s.id === student.id)
                            ? 'bg-blue-500 text-white'
                            : 'border-2 border-gray-300'
                        }`}>
                          {selectedStudents.find(s => s.id === student.id) && (
                            <MdCheck className="text-lg" />
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-4 border-t bg-gray-50 rounded-b-xl">
              <div className="flex justify-end space-x-3">
                <button
                  onClick={() => setShowInviteModal(false)}
                  className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors duration-200"
                >
                  Cancel
                </button>
                <button
                  onClick={handleCreateGroupCall}
                  disabled={selectedStudents.length === 0 || isLoading}
                  className={`flex items-center space-x-2 px-4 py-2 rounded-lg ${
                    selectedStudents.length === 0 || isLoading
                      ? 'bg-gray-300 cursor-not-allowed'
                      : 'bg-blue-500 hover:bg-blue-600 text-white'
                  }`}
                >
                  <MdVideoCall className="text-xl" />
                  <span>Start Group Call</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
} 