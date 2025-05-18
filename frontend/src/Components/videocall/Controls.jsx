import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import { useMeeting } from "@videosdk.live/react-sdk";
import {
  MdMic,
  MdMicOff,
  MdVideocam,
  MdVideocamOff,
  MdScreenShare,
  MdStopScreenShare,
  MdCallEnd,
  MdMoreVert,
  MdSettings,
  MdPeople,
  MdChat
} from "react-icons/md";

export function Controls() {
  const { t } = useTranslation();
  const { leave, toggleMic, toggleWebcam, enableScreenShare, disableScreenShare } = useMeeting();
  const [isMicOn, setIsMicOn] = useState(true);
  const [isVideoOn, setIsVideoOn] = useState(true);
  const [isScreenSharing, setIsScreenSharing] = useState(false);
  const [showMoreOptions, setShowMoreOptions] = useState(false);

  const handleMicToggle = () => {
    toggleMic();
    setIsMicOn(!isMicOn);
  };

  const handleVideoToggle = () => {
    toggleWebcam();
    setIsVideoOn(!isVideoOn);
  };

  const handleScreenShare = async () => {
    try {
      if (isScreenSharing) {
        await disableScreenShare();
      } else {
        await enableScreenShare();
      }
      setIsScreenSharing(!isScreenSharing);
    } catch (error) {
      console.error('Screen sharing error:', error);
    }
  };

  const ControlButton = ({ onClick, isActive, activeColor, icon: Icon, label }) => (
    <div className="relative group">
      <button
        onClick={onClick}
        className={`p-4 rounded-full transition-all duration-200 ${
          isActive 
            ? `${activeColor} text-white transform hover:scale-105` 
            : 'bg-gray-800 text-gray-300 hover:bg-gray-700 hover:text-white'
        } focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500`}
      >
        <Icon size={24} />
      </button>
      <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-gray-900 text-white text-xs rounded-md opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap">
        {label}
      </div>
    </div>
  );

  return (
    <div className="bg-black bg-opacity-90 backdrop-blur-sm rounded-2xl shadow-lg p-4">
      <div className="flex items-center justify-center space-x-4">
        {/* Main Controls */}
        <ControlButton
          onClick={handleMicToggle}
          isActive={!isMicOn}
          activeColor="bg-red-600 hover:bg-red-700"
          icon={isMicOn ? MdMic : MdMicOff}
          label={isMicOn ? t('muteMicrophone') : t('unmuteMicrophone')}
        />

        <ControlButton
          onClick={handleVideoToggle}
          isActive={!isVideoOn}
          activeColor="bg-red-600 hover:bg-red-700"
          icon={isVideoOn ? MdVideocam : MdVideocamOff}
          label={isVideoOn ? t('turnOffCamera') : t('turnOnCamera')}
        />

        <ControlButton
          onClick={handleScreenShare}
          isActive={isScreenSharing}
          activeColor="bg-blue-600 hover:bg-blue-700"
          icon={isScreenSharing ? MdStopScreenShare : MdScreenShare}
          label={isScreenSharing ? t('stopSharing') : t('shareScreen')}
        />

        <div className="w-px h-8 bg-gray-700 mx-2" />

        {/* Additional Controls */}
        <ControlButton
          onClick={() => {}}
          isActive={false}
          activeColor="bg-blue-600"
          icon={MdPeople}
          label={t('participants')}
        />

        <ControlButton
          onClick={() => {}}
          isActive={false}
          activeColor="bg-blue-600"
          icon={MdChat}
          label={t('chat')}
        />

        <div className="relative">
          <ControlButton
            onClick={() => setShowMoreOptions(!showMoreOptions)}
            isActive={showMoreOptions}
            activeColor="bg-gray-700"
            icon={MdMoreVert}
            label={t('moreOptions')}
          />
          
          {/* More Options Dropdown */}
          {showMoreOptions && (
            <div className="absolute bottom-full right-0 mb-2 w-48 bg-gray-900 rounded-lg shadow-lg overflow-hidden transform transition-all duration-200">
              <button
                onClick={() => {}}
                className="w-full px-4 py-3 text-left text-gray-300 hover:bg-gray-800 flex items-center space-x-2"
              >
                <MdSettings className="text-xl" />
                <span>{t('settings')}</span>
              </button>
            </div>
          )}
        </div>

        <div className="w-px h-8 bg-gray-700 mx-2" />

        {/* Leave Call */}
        <ControlButton
          onClick={() => leave()}
          isActive={true}
          activeColor="bg-red-600 hover:bg-red-700"
          icon={MdCallEnd}
          label={t('leaveCall')}
        />
      </div>
    </div>
  );
}
