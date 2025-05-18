import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  MdVideoCall,
  MdGroup,
  MdLock,
  MdPeople,
  MdArrowForward,
  MdAdd,
  MdPublic,
  MdLockOutline,
  MdSearch
} from 'react-icons/md';
import { toast } from 'react-hot-toast';
import { LanguageSelector } from '../LanguageSelector';

export function MeetingLobby({ user, onJoinMeeting, onCreateMeeting }) {
  const { t } = useTranslation();
  const [meetingId, setMeetingId] = useState('');
  const [showCreateRoom, setShowCreateRoom] = useState(false);
  const [roomName, setRoomName] = useState('');
  const [roomType, setRoomType] = useState('public');
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleJoinMeeting = async () => {
    if (!meetingId.trim()) {
      toast.error(t('enterMeetingId'));
      return;
    }
    setIsLoading(true);
    try {
      await onJoinMeeting(meetingId);
    } catch (error) {
      toast.error(t('joinMeetingError'));
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateRoom = async () => {
    if (!roomName.trim()) {
      toast.error(t('enterRoomName'));
      return;
    }
    setIsLoading(true);
    try {
      const newMeetingId = await onCreateMeeting({
        name: roomName,
        type: roomType,
        createdBy: user.id
      });
      toast.success(t('roomCreated'));
      onJoinMeeting(newMeetingId);
    } catch (error) {
      toast.error(t('roomCreationError'));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 p-8">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-end mb-4">
          <LanguageSelector />
        </div>
        
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-800 mb-3 animate-fade-in">
            {t('videoCall')}
          </h1>
          <p className="text-lg text-gray-600 animate-fade-in-delay">
            {t('connectWithPeers')}
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          {/* Join Meeting Section */}
          <div className="bg-white rounded-2xl shadow-xl p-8 transform hover:scale-[1.02] transition-all duration-300">
            <div className="flex items-center space-x-3 text-gray-800 mb-6">
              <div className="p-3 bg-blue-100 rounded-full">
                <MdVideoCall className="text-3xl text-blue-600" />
              </div>
              <h2 className="text-2xl font-semibold">{t('joinMeeting')}</h2>
            </div>

            <div className="space-y-6">
              <div className="relative">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t('enterMeetingId')}
                </label>
                <input
                  type="text"
                  value={meetingId}
                  onChange={(e) => setMeetingId(e.target.value)}
                  placeholder={t('enterMeetingId')}
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-gray-50 hover:bg-white"
                />
              </div>

              <button
                onClick={handleJoinMeeting}
                disabled={isLoading}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors duration-200 flex items-center justify-center space-x-2 disabled:opacity-50"
              >
                {isLoading ? (
                  <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent" />
                ) : (
                  <>
                    <MdArrowForward className="text-xl" />
                    <span>{t('joinMeeting')}</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Create Room Section - Only visible for students */}
          {user.role === 'student' && (
            <div className="bg-white rounded-2xl shadow-xl p-8 transform hover:scale-[1.02] transition-all duration-300">
              <div className="flex items-center space-x-3 text-gray-800 mb-6">
                <div className="p-3 bg-indigo-100 rounded-full">
                  <MdGroup className="text-3xl text-indigo-600" />
                </div>
                <h2 className="text-2xl font-semibold">{t('studyRooms')}</h2>
              </div>

              {!showCreateRoom ? (
                <div className="space-y-6">
                  <div className="relative">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      {t('searchRooms')}
                    </label>
                    <div className="relative">
                      <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder={t('searchRooms')}
                        className="w-full pl-10 pr-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200 bg-gray-50 hover:bg-white"
                      />
                      <MdSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 text-xl" />
                    </div>
                  </div>

                  <button
                    onClick={() => setShowCreateRoom(true)}
                    className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors duration-200 flex items-center justify-center space-x-2"
                  >
                    <MdAdd className="text-xl" />
                    <span>{t('createStudyRoom')}</span>
                  </button>
                </div>
              ) : (
                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      {t('roomName')}
                    </label>
                    <input
                      type="text"
                      value={roomName}
                      onChange={(e) => setRoomName(e.target.value)}
                      placeholder={t('roomName')}
                      className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200 bg-gray-50 hover:bg-white"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      {t('roomType')}
                    </label>
                    <div className="grid grid-cols-2 gap-4">
                      <button
                        onClick={() => setRoomType('public')}
                        className={`p-4 rounded-lg border-2 transition-all duration-200 flex items-center justify-center space-x-2 ${
                          roomType === 'public'
                            ? 'border-indigo-500 bg-indigo-50 text-indigo-700'
                            : 'border-gray-200 hover:border-indigo-200'
                        }`}
                      >
                        <MdPublic className="text-xl" />
                        <span>{t('public')}</span>
                      </button>
                      <button
                        onClick={() => setRoomType('private')}
                        className={`p-4 rounded-lg border-2 transition-all duration-200 flex items-center justify-center space-x-2 ${
                          roomType === 'private'
                            ? 'border-indigo-500 bg-indigo-50 text-indigo-700'
                            : 'border-gray-200 hover:border-indigo-200'
                        }`}
                      >
                        <MdLockOutline className="text-xl" />
                        <span>{t('private')}</span>
                      </button>
                    </div>
                  </div>

                  <div className="flex space-x-4">
                    <button
                      onClick={() => setShowCreateRoom(false)}
                      className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold py-3 px-6 rounded-lg transition-colors duration-200"
                    >
                      {t('cancel')}
                    </button>
                    <button
                      onClick={handleCreateRoom}
                      disabled={isLoading}
                      className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors duration-200 disabled:opacity-50"
                    >
                      {isLoading ? (
                        <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent" />
                      ) : (
                        t('create')
                      )}
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Create Meeting Section - Only visible for mentors */}
          {user.role === 'mentor' && (
            <div className="bg-white rounded-2xl shadow-xl p-8 transform hover:scale-[1.02] transition-all duration-300">
              <div className="flex items-center space-x-3 text-gray-800 mb-6">
                <div className="p-3 bg-green-100 rounded-full">
                  <MdLock className="text-3xl text-green-600" />
                </div>
                <h2 className="text-2xl font-semibold">{t('createMeeting')}</h2>
              </div>

              <div className="space-y-6">
                <p className="text-gray-600">{t('startNewMeeting')}</p>
                <button
                  onClick={() => onCreateMeeting()}
                  disabled={isLoading}
                  className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors duration-200 flex items-center justify-center space-x-2 disabled:opacity-50"
                >
                  {isLoading ? (
                    <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent" />
                  ) : (
                    <>
                      <MdAdd className="text-xl" />
                      <span>{t('createMeeting')}</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
} 