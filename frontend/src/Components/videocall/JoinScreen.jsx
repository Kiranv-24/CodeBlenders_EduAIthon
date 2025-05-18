import React, { useState } from "react";
import { toast } from "react-hot-toast";
import { GetUserQuery } from "../../api/user";

export function JoinScreen({ getMeetingAndToken }) {
  const [meetingId, setMeetingId] = useState("");
  const { data: user } = GetUserQuery();

  const joinMeeting = async () => {
    if (!meetingId.trim()) {
      toast.error("Please enter a meeting ID");
      return;
    }
    await getMeetingAndToken(meetingId.trim());
  };

  const createMeeting = async () => {
    await getMeetingAndToken(null);
  };

  return (
    <div className="flex justify-center h-screen items-center bg-gray-300">
      <div className="bg-blue-900 p-10 rounded-lg shadow-lg text-white w-96">
        <h2 className="text-2xl mb-4 font-semibold text-center">Video Meeting</h2>
        <div className="mb-6">
          <input
            type="text"
            className="w-full p-3 rounded-lg mb-2 text-gray-900 outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Enter Meeting ID"
            value={meetingId}
            onChange={(e) => setMeetingId(e.target.value)}
          />
          <p className="text-sm text-gray-300">Enter a meeting ID to join an existing meeting</p>
        </div>
        <div className="flex flex-col space-y-4">
          <button
            onClick={joinMeeting}
            className="bg-green-500 hover:bg-green-600 text-white py-3 rounded-lg shadow-md font-semibold transition-colors duration-300"
          >
            Join Meeting
          </button>

          {user?.role === 'mentor' && (
            <>
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-500"></div>
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-2 bg-blue-900 text-gray-300">or</span>
                </div>
              </div>

              <button
                onClick={createMeeting}
                className="bg-blue-500 hover:bg-blue-600 text-white py-3 rounded-lg shadow-md font-semibold transition-colors duration-300"
              >
                Create New Meeting
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
