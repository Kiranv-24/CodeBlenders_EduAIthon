// @ts-nocheck
import { useParticipant } from "@videosdk.live/react-sdk";
import { useEffect, useMemo, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import ReactPlayer from "react-player";
import { 
  MdMicOff, 
  MdVideocamOff, 
  MdPushPin,
  MdOutlinePushPin,
  MdScreenShare,
  MdSignalCellularAlt,
  MdSignalCellularAlt2Bar,
  MdSignalCellularAlt1Bar
} from "react-icons/md";

export function ParticipantView({ participantId, isFullScreen, isFocused, onFocusClick }) {
  const { t } = useTranslation();
  const micRef = useRef(null);
  const [quality, setQuality] = useState('good'); // 'good', 'fair', 'poor'
  const [showControls, setShowControls] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  
  const {
    webcamStream,
    micStream,
    webcamOn,
    micOn,
    isLocal,
    displayName,
    screenShareStream,
    screenShareOn,
    quality: connectionQuality
  } = useParticipant(participantId);

  const videoStream = useMemo(() => {
    if (webcamOn && webcamStream) {
      const mediaStream = new MediaStream();
      mediaStream.addTrack(webcamStream.track);
      return mediaStream;
    }
  }, [webcamStream, webcamOn]);

  const screenShareVideoStream = useMemo(() => {
    if (screenShareOn && screenShareStream) {
      const mediaStream = new MediaStream();
      mediaStream.addTrack(screenShareStream.track);
      return mediaStream;
    }
  }, [screenShareStream, screenShareOn]);

  useEffect(() => {
    if (micRef.current) {
      if (micOn && micStream) {
        const mediaStream = new MediaStream();
        mediaStream.addTrack(micStream.track);
        micRef.current.srcObject = mediaStream;
        micRef.current
          .play()
          .catch((error) => console.error("mic play() failed", error));
      } else {
        micRef.current.srcObject = null;
      }
    }
  }, [micStream, micOn]);

  // Simulate quality changes
  useEffect(() => {
    const updateQuality = () => {
      const q = Math.random();
      if (q > 0.7) setQuality('good');
      else if (q > 0.4) setQuality('fair');
      else setQuality('poor');
    };
    const interval = setInterval(updateQuality, 10000);
    return () => clearInterval(interval);
  }, []);

  const getQualityIcon = () => {
    switch (quality) {
      case 'good':
        return <MdSignalCellularAlt className="text-green-500" />;
      case 'fair':
        return <MdSignalCellularAlt2Bar className="text-yellow-500" />;
      case 'poor':
        return <MdSignalCellularAlt1Bar className="text-red-500" />;
      default:
        return null;
    }
  };

  return (
    <div 
      className={`relative w-full h-full min-h-[200px] bg-gray-900 rounded-xl overflow-hidden shadow-lg transform transition-all duration-300 ${
        isFocused ? 'ring-2 ring-blue-500' : ''
      }`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Audio for participant */}
      <audio ref={micRef} autoPlay playsInline muted={isLocal} />

      {/* Video Stream */}
      {webcamOn && videoStream ? (
        <div className="relative w-full h-full">
          <ReactPlayer
            playsinline
            pip={false}
            light={false}
            controls={false}
            muted={isLocal}
            playing={true}
            url={videoStream}
            width="100%"
            height="100%"
            onError={(err) => {
              console.log("Participant video error:", err);
            }}
            style={{
              backgroundColor: "#1a1c1d",
              objectFit: "cover",
              borderRadius: "0.75rem",
            }}
          />
          
          {/* Screen Share Overlay */}
          {screenShareOn && screenShareVideoStream && (
            <div className="absolute inset-0 bg-black bg-opacity-90">
              <ReactPlayer
                playsinline
                pip={false}
                light={false}
                controls={false}
                muted={isLocal}
                playing={true}
                url={screenShareVideoStream}
                width="100%"
                height="100%"
                onError={(err) => {
                  console.log("Screen share error:", err);
                }}
                style={{
                  backgroundColor: "transparent",
                  objectFit: "contain",
                }}
              />
              <div className="absolute top-2 left-2 bg-blue-600 text-white text-xs px-2 py-1 rounded-full flex items-center space-x-1">
                <MdScreenShare className="text-sm" />
                <span>{t('sharingScreen')}</span>
              </div>
            </div>
          )}

          {/* Hover Controls */}
          <div 
            className={`absolute inset-0 bg-gradient-to-b from-black/60 via-transparent to-black/60 transition-opacity duration-300 ${
              isHovered ? 'opacity-100' : 'opacity-0'
            }`}
          >
            {/* Top Controls */}
            <div className="absolute top-2 right-2 flex items-center space-x-2">
              <div className="bg-black/50 backdrop-blur-sm px-2 py-1 rounded-full flex items-center space-x-1">
                {getQualityIcon()}
                <span className="text-xs text-white capitalize">{t(quality)}</span>
              </div>
            </div>

            {/* Bottom Info */}
            <div className="absolute bottom-2 left-2 right-2 flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <span className="text-white text-sm font-medium">
                  {displayName} {isLocal ? `(${t('you')})` : ""}
                </span>
                <div className="flex items-center space-x-1">
                  {!micOn && (
                    <div className="bg-red-500/90 p-1 rounded-full">
                      <MdMicOff className="text-white text-xs" />
                    </div>
                  )}
                  {!webcamOn && (
                    <div className="bg-red-500/90 p-1 rounded-full">
                      <MdVideocamOff className="text-white text-xs" />
                    </div>
                  )}
                </div>
              </div>
              <button
                onClick={onFocusClick}
                className={`p-1.5 rounded-full transition-colors duration-200 ${
                  isFocused 
                    ? 'bg-blue-600 text-white' 
                    : 'bg-black/50 text-white/80 hover:bg-black/70'
                }`}
              >
                {isFocused ? (
                  <MdPushPin className="text-sm" />
                ) : (
                  <MdOutlinePushPin className="text-sm" />
                )}
              </button>
            </div>
          </div>
        </div>
      ) : (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-gradient-to-br from-gray-800 to-gray-900">
          <div className="w-20 h-20 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-2xl text-white font-semibold mb-3">
            {displayName?.charAt(0)?.toUpperCase()}
          </div>
          <span className="text-white/90 font-medium">{displayName}</span>
          <div className="flex items-center space-x-2 mt-2">
            {!micOn && (
              <div className="bg-red-500/90 p-1.5 rounded-full">
                <MdMicOff className="text-white text-sm" />
              </div>
            )}
            {!webcamOn && (
              <div className="bg-red-500/90 p-1.5 rounded-full">
                <MdVideocamOff className="text-white text-sm" />
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
