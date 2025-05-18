// @ts-nocheck
import { useState, useRef, useEffect } from "react";
import { Controls } from "./Controls";
import { ParticipantView } from "./ParticipantView";
import { useMeeting } from "@videosdk.live/react-sdk";
import { toast } from "react-hot-toast";
import { 
  MdContentCopy,
  MdFullscreen,
  MdFullscreenExit,
  MdChevronLeft,
  MdChevronRight,
  MdPeople,
  MdClose,
  MdOutlineSignalCellularAlt,
  MdOutlineSignalCellularAlt2Bar,
  MdOutlineSignalCellularAlt1Bar
} from "react-icons/md";

export function MeetingView({ user, meetingId, onMeetingLeave }) {
  const [joined, setJoined] = useState(false);
  const [isFullScreen, setIsFullScreen] = useState(false);
  const [showParticipantList, setShowParticipantList] = useState(false);
  const [currentPage, setCurrentPage] = useState(0);
  const [focusedParticipant, setFocusedParticipant] = useState(null);
  const [connectionQuality, setConnectionQuality] = useState('good'); // 'good', 'fair', 'poor'
  const containerRef = useRef(null);
  const participantsPerPage = 6;

  const { join, participants } = useMeeting({
    onMeetingJoined: () => {
      setJoined(true);
      toast.success("Successfully joined the meeting!");
    },
    onMeetingLeft: () => {
      toast.success("Left the meeting");
      onMeetingLeave();
    },
    onParticipantJoined: (participant) => {
      toast.success(`${participant.displayName} joined the meeting`);
    },
    onParticipantLeft: (participant) => {
      if (focusedParticipant === participant.id) {
        setFocusedParticipant(null);
      }
      toast.info(`${participant.displayName} left the meeting`);
    },
    onError: (error) => {
      toast.error(`Error: ${error.message}`);
      console.error("Meeting Error:", error);
    }
  });

  // Simulate connection quality monitoring
  useEffect(() => {
    const checkConnectionQuality = () => {
      const quality = Math.random();
      if (quality > 0.7) setConnectionQuality('good');
      else if (quality > 0.4) setConnectionQuality('fair');
      else setConnectionQuality('poor');
    };

    const interval = setInterval(checkConnectionQuality, 5000);
    return () => clearInterval(interval);
  }, []);

  const toggleFullScreen = () => {
    if (!document.fullscreenElement) {
      containerRef.current.requestFullscreen();
      setIsFullScreen(true);
    } else {
      document.exitFullscreen();
      setIsFullScreen(false);
    }
  };

  const copyMeetingId = () => {
    navigator.clipboard.writeText(meetingId);
    toast.success("Meeting ID copied to clipboard!");
  };

  const participantArray = [...participants.keys()];
  const totalPages = Math.ceil(participantArray.length / participantsPerPage);
  const currentParticipants = participantArray.slice(
    currentPage * participantsPerPage,
    (currentPage + 1) * participantsPerPage
  );

  const nextPage = () => {
    if (currentPage < totalPages - 1) {
      setCurrentPage(currentPage + 1);
    }
  };

  const prevPage = () => {
    if (currentPage > 0) {
      setCurrentPage(currentPage - 1);
    }
  };

  const getConnectionIcon = () => {
    switch (connectionQuality) {
      case 'good':
        return <MdOutlineSignalCellularAlt className="text-green-500" />;
      case 'fair':
        return <MdOutlineSignalCellularAlt2Bar className="text-yellow-500" />;
      case 'poor':
        return <MdOutlineSignalCellularAlt1Bar className="text-red-500" />;
      default:
        return null;
    }
  };

  return (
    <div ref={containerRef} className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800">
      {/* Header */}
      <div className="bg-black bg-opacity-50 backdrop-blur-sm shadow-lg p-4 flex justify-between items-center">
        <div className="flex items-center space-x-4">
          <h3 className="text-xl font-semibold text-white">Meeting Room</h3>
          <button
            onClick={copyMeetingId}
            className="flex items-center space-x-2 text-gray-300 hover:text-white bg-gray-800 hover:bg-gray-700 px-3 py-1.5 rounded-full text-sm transition-all duration-200"
          >
            <span className="font-mono">{meetingId}</span>
            <MdContentCopy className="text-lg" />
          </button>
          <div className="flex items-center space-x-2 text-gray-300">
            {getConnectionIcon()}
            <span className="text-sm capitalize">{connectionQuality} Connection</span>
          </div>
        </div>
        <div className="flex items-center space-x-4">
          <button
            onClick={() => setShowParticipantList(!showParticipantList)}
            className="flex items-center space-x-2 text-gray-300 hover:text-white transition-colors duration-200"
          >
            <MdPeople className="text-xl" />
            <span>{participants.size} Participants</span>
          </button>
          <button
            onClick={toggleFullScreen}
            className="text-gray-300 hover:text-white transition-colors duration-200"
          >
            {isFullScreen ? (
              <MdFullscreenExit className="text-xl" />
            ) : (
              <MdFullscreen className="text-xl" />
            )}
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="p-4">
        {!joined ? (
          <div className="flex items-center justify-center h-[60vh]">
            <button 
              onClick={() => join()}
              className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-8 rounded-lg transition-all duration-200 transform hover:scale-105 hover:shadow-xl"
            >
              Join Meeting
            </button>
          </div>
        ) : (
          <div className="relative">
            {/* Participants Grid */}
            <div className={`grid ${
              focusedParticipant 
                ? 'grid-cols-1 lg:grid-cols-4 lg:grid-rows-3 gap-4' 
                : participants.size === 1
                ? 'grid-cols-1'
                : participants.size === 2
                ? 'grid-cols-2'
                : participants.size <= 4
                ? 'grid-cols-2'
                : 'grid-cols-3'
            } gap-4 auto-rows-fr`}>
              {currentParticipants.map((participantId) => (
                <div
                  key={participantId}
                  className={`relative transform transition-all duration-300 ${
                    focusedParticipant === participantId
                      ? "lg:col-span-3 lg:row-span-3 scale-100"
                      : focusedParticipant
                      ? "lg:col-start-4 scale-95 hover:scale-100"
                      : "scale-95 hover:scale-100"
                  }`}
                >
                  <ParticipantView
                    participantId={participantId}
                    isFullScreen={isFullScreen}
                    isFocused={focusedParticipant === participantId}
                    onFocusClick={() => setFocusedParticipant(
                      focusedParticipant === participantId ? null : participantId
                    )}
                  />
                </div>
              ))}
            </div>

            {/* Pagination Controls */}
            {totalPages > 1 && (
              <div className="flex justify-center mt-6 space-x-4">
                <button
                  onClick={prevPage}
                  disabled={currentPage === 0}
                  className={`p-2 rounded-full transition-all duration-200 ${
                    currentPage === 0
                      ? 'bg-gray-700 text-gray-500 cursor-not-allowed'
                      : 'bg-blue-600 text-white hover:bg-blue-700'
                  }`}
                >
                  <MdChevronLeft className="text-xl" />
                </button>
                <span className="flex items-center text-white">
                  Page {currentPage + 1} of {totalPages}
                </span>
                <button
                  onClick={nextPage}
                  disabled={currentPage === totalPages - 1}
                  className={`p-2 rounded-full transition-all duration-200 ${
                    currentPage === totalPages - 1
                      ? 'bg-gray-700 text-gray-500 cursor-not-allowed'
                      : 'bg-blue-600 text-white hover:bg-blue-700'
                  }`}
                >
                  <MdChevronRight className="text-xl" />
                </button>
              </div>
            )}

            {/* Participants List Sidebar */}
            {showParticipantList && (
              <div className="fixed right-0 top-0 h-full w-72 bg-gray-900 shadow-2xl transform transition-transform duration-300 ease-in-out z-50">
                <div className="p-4 border-b border-gray-800 flex justify-between items-center">
                  <h4 className="text-lg font-semibold text-white">Participants</h4>
                  <button
                    onClick={() => setShowParticipantList(false)}
                    className="text-gray-400 hover:text-white transition-colors duration-200"
                  >
                    <MdClose className="text-xl" />
                  </button>
                </div>
                <div className="p-4 space-y-2">
                  {[...participants.values()].map((participant) => (
                    <div
                      key={participant.id}
                      className="flex items-center justify-between p-3 hover:bg-gray-800 rounded-lg transition-colors duration-200"
                    >
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white font-semibold">
                          {participant.displayName[0].toUpperCase()}
                        </div>
                        <div>
                          <span className="text-white">{participant.displayName}</span>
                          {participant.id === focusedParticipant && (
                            <span className="text-xs text-blue-400 block">Currently Focused</span>
                          )}
                        </div>
                      </div>
                      <button
                        onClick={() => setFocusedParticipant(
                          focusedParticipant === participant.id ? null : participant.id
                        )}
                        className={`text-sm px-3 py-1.5 rounded-full transition-all duration-200 ${
                          focusedParticipant === participant.id
                            ? "bg-blue-600 text-white"
                            : "bg-gray-700 text-gray-300 hover:bg-gray-600"
                        }`}
                      >
                        {focusedParticipant === participant.id ? "Unfocus" : "Focus"}
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Controls */}
      {joined && (
        <div className="fixed bottom-0 left-0 right-0 p-6 flex justify-center">
          <Controls />
        </div>
      )}
    </div>
  );
}
