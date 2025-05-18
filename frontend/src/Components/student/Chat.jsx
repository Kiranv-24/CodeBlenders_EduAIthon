import React, { useEffect, useRef, useState } from "react";
import { io } from "socket.io-client";
import {
  GetAllConvoQuery,
  GetAllUsersQuery,
  GetUserQuery,
  sendMessage,
  GetMyGroupsQuery,
  createGroupChat,
  sendGroupMessage,
  getGroupDetails,
  getMyGroups,
} from "../../api/user";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../../Components/ui/dropdown-menu";
import toast from "react-hot-toast";
import { Send, VerifiedUserRounded } from "@mui/icons-material";
import { BiUserCircle } from "react-icons/bi";
import { HiUserGroup } from "react-icons/hi";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../../Components/ui/dialog";
import { Avatar } from "@mui/material";

const Chat = () => {
  const [open, setOpen] = useState(false);
  const [groupDialogOpen, setGroupDialogOpen] = useState(false);
  const [wantTo, setWantto] = useState();
  const [groupName, setGroupName] = useState("");
  const [selectedMembers, setSelectedMembers] = useState([]);
  const { data: mydetails } = GetUserQuery();
  const [onlineUsers, setOnlineUser] = useState([]);
  const {
    data: AllconvoData,
    isLoading: conversationsLoading,
    refetch,
  } = GetAllConvoQuery();
  const {
    data: myGroups,
    isLoading: groupsLoading,
    refetch: refetchGroups,
  } = GetMyGroupsQuery();
  const { data: allusers, isLoading: usersLoading } = GetAllUsersQuery();
  const [selectedConvo, setSelectedConvo] = useState("");
  const [selectedGroup, setSelectedGroup] = useState(null);
  const [selected, setSelected] = useState(null);
  const [message, setMessage] = useState("");
  const [isGroupChat, setIsGroupChat] = useState(false);
  const [activeTab, setActiveTab] = useState("chats"); // "chats" or "groups"
  const messagesEndRef = useRef(null);
  const socketRef = useRef(null);
  const BACKEND_URL = `${import.meta.env.VITE_BASE_URL}`;

  useEffect(() => {
    if (!mydetails?.id) return;

    // Connect to socket server
    socketRef.current = io(BACKEND_URL, {
      query: {
        userId: mydetails?.id,
      },
    });

    // Handle incoming messages
    socketRef.current.on("new_message", (mess) => {
      console.log("New message received:", mess);
      setSelectedConvo((prev) => {
        if (!prev) return prev;
        return {
          ...prev,
          messages: [...(prev.messages || []), { 
            message: mess, 
            senderId: prev?.participants?.[0]?.id || "",
            timestamp: Date.now()
          }],
        };
      });
    });

    // Handle group messages
    socketRef.current.on("group_message", (data) => {
      console.log("Group message received:", data);
      if (selectedGroup && selectedGroup.id === data.groupId) {
        setSelectedGroup(prev => ({
          ...prev,
          messages: [...(prev.messages || []), data.message]
        }));
      }
    });

    socketRef.current.on("getOnlineUsers", (users) => {
      setOnlineUser(users);
      console.log("Online users:", users);
    });

    // Request online users list when connected
    socketRef.current.emit("get_online_users");

    // Cleanup on unmount
    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect();
        socketRef.current = null;
      }
    };
  }, [mydetails?.id, BACKEND_URL, selectedGroup]);

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [selectedConvo?.messages, selectedGroup?.messages]);

  const sendMessageHandler = async () => {
    if (!message.trim()) {
      toast.error("Message cannot be empty!");
      return;
    }

    if (isGroupChat) {
      // Send message to group
      if (!selectedGroup || !mydetails?.id) {
        toast.error("Cannot send message right now");
        return;
      }
      
      try {
        // Optimistically update the UI
        const newMessage = {
          content: message,
          sender: {
            id: mydetails.id,
            name: mydetails.name
          },
          createdAt: new Date().toISOString()
        };
        
        setSelectedGroup(prev => ({
          ...prev,
          messages: [
            ...(prev.messages || []),
            newMessage
          ]
        }));
        
        // Clear input
        setMessage("");
        
        // Send to server
        await sendGroupMessage(selectedGroup.id, message);
        
      } catch (err) {
        console.error("Error sending group message:", err);
        toast.error("Failed to send message");
      }
    } else {
      // Send message to individual
      if (!selectedConvo || !mydetails?.id) {
        toast.error("Cannot send message right now");
        return;
      }

      // Check if participants array exists and has at least one element
      if (!selectedConvo.participants || selectedConvo.participants.length === 0) {
        toast.error("Invalid conversation recipient");
        return;
      }

      try {
        // Optimistically update the UI
        const newMessage = {
          message: message,
          senderId: mydetails?.id,
          timestamp: Date.now()
        };
        
        setSelectedConvo((prev) => ({
          ...prev,
          messages: [
            ...(prev.messages || []),
            newMessage
          ],
        }));
        
        // Clear input
        setMessage("");
        
        // Send to server
        await sendMessage(
          message,
          selectedConvo.participants[0].id,
          selectedConvo.id
        );
        
      } catch (err) {
        console.error("Error sending message:", err);
        toast.error("Failed to send message");
      }
    }
  };

  const createConversation = async () => {
    if (!wantTo?.id || !mydetails?.id) {
      toast.error("Cannot create conversation");
      return;
    }
    
    try {
      await sendMessage("Hi, let's chat!", wantTo?.id);
      setWantto(null);
      setOpen(false);
      refetch();
      toast.success("Chat started successfully");
    } catch (err) {
      console.error("Error creating conversation:", err);
      toast.error("Failed to start conversation");
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessageHandler();
    }
  };

  const handleCreateGroup = async () => {
    if (!groupName.trim()) {
      toast.error("Group name is required");
      return;
    }

    if (selectedMembers.length === 0) {
      toast.error("Please select at least one member");
      return;
    }

    try {
      await createGroupChat(groupName, selectedMembers);
      setGroupName("");
      setSelectedMembers([]);
      setGroupDialogOpen(false);
      refetchGroups();
      toast.success("Group created successfully");
    } catch (err) {
      console.error("Error creating group:", err);
      toast.error("Failed to create group");
    }
  };

  const toggleMemberSelection = (userId) => {
    if (selectedMembers.includes(userId)) {
      setSelectedMembers(selectedMembers.filter(id => id !== userId));
    } else {
      setSelectedMembers([...selectedMembers, userId]);
    }
  };

  const selectGroup = (group) => {
    setSelectedGroup(group);
    setSelectedConvo("");
    setIsGroupChat(true);
  };

  const selectConversation = (convo) => {
    setSelectedConvo(convo);
    setSelectedGroup(null);
    setIsGroupChat(false);
  };

  // Filter conversations to separate individual chats and group chats
  const individualChats = AllconvoData?.filter(convo => {
    // Check if the conversation has any messages with receiverId = 'group'
    return !convo.messages?.some(msg => msg.receiverId === 'group');
  }) || [];

  // Debugging improvements to track down participant data issues
  useEffect(() => {
    if (myGroups) {
      console.log("Loaded groups:", myGroups);
      // Log specific information about participants
      myGroups.forEach(group => {
        console.log(`Group ${group.name || group.id} participants:`, group.participants);
      });
    }
    if (AllconvoData) {
      console.log("All conversations data:", AllconvoData);
      // Log specific information about conversation participants
      AllconvoData.forEach(convo => {
        console.log(`Conversation ${convo.id} participants:`, convo.participants);
      });
    }
  }, [myGroups, AllconvoData]);
  
  // When a group is selected, fetch its full details
  useEffect(() => {
    if (selectedGroup?.id && isGroupChat) {
      const fetchGroupDetails = async () => {
        try {
          console.log("Fetching details for group:", selectedGroup.id);
          const groupData = await getGroupDetails(selectedGroup.id);
          console.log("Received group details:", groupData);
          setSelectedGroup(groupData);
        } catch (err) {
          console.error("Error fetching group details:", err);
          toast.error("Could not load group details");
        }
      };
      
      fetchGroupDetails();
    }
  }, [selectedGroup?.id, isGroupChat]);

  // After useEffect for socket connection
  useEffect(() => {
    // Directly fetch groups on component mount
    const fetchGroups = async () => {
      try {
        console.log("Directly fetching groups on component mount");
        const groupsData = await getMyGroups();
        console.log("Direct groups fetch result:", groupsData);
      } catch (err) {
        console.error("Error in direct group fetch:", err);
      }
    };
    
    if (mydetails?.id) {
      fetchGroups();
      // Force refetch at regular intervals for debugging
      const intervalId = setInterval(() => {
        refetchGroups();
        console.log("Forced refetch of groups");
      }, 5000);
      
      return () => clearInterval(intervalId);
    }
  }, [mydetails?.id]);

  if (usersLoading) return <div>Loading users...</div>;
  if (conversationsLoading) return <div>Loading conversations...</div>;

  return (
    <div className="flex h-screen">
      <div className="bg-gray-300 w-1/4 p-4 text-black">
        <div className="flex space-x-2 mb-4">
          <button 
            className={`flex-1 py-2 px-4 rounded-lg ${activeTab === 'chats' ? 'bg-stone-600 text-white' : 'bg-stone-400 text-gray-800'}`}
            onClick={() => setActiveTab('chats')}
          >
            Chats
          </button>
          <button 
            className={`flex-1 py-2 px-4 rounded-lg ${activeTab === 'groups' ? 'bg-stone-600 text-white' : 'bg-stone-400 text-gray-800'}`}
            onClick={() => setActiveTab('groups')}
          >
            Groups
          </button>
        </div>

        <div className="flex space-x-2">
          <DropdownMenu>
            <DropdownMenuTrigger className="flex-1 bg-stone-500 hover:bg-stone-600 text-white py-2 px-4 rounded-lg">
              Create Chat
            </DropdownMenuTrigger>
            <DropdownMenuContent className="bg-white">
              <DropdownMenuLabel className="font-bold">
                Select User
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              {allusers?.map((x) => (
                <DropdownMenuItem
                  key={x.id}
                  onClick={() => {
                    setOpen(true);
                    setWantto(x);
                  }}
                  className="cursor-pointer hover:bg-gray-200 px-4 py-2"
                >
                  {x.name}
                  {onlineUsers.includes(x.id) && (
                    <span className="ml-2 h-2 w-2 rounded-full bg-green-500" title="Online"></span>
                  )}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>

          <button 
            onClick={() => setGroupDialogOpen(true)}
            className="flex-1 bg-indigo-500 hover:bg-indigo-600 text-white py-2 px-4 rounded-lg flex items-center justify-center"
          >
            <HiUserGroup className="mr-2" />
            Create Group
          </button>
        </div>

        <div className="mt-6 h-[90%] p-2 overflow-auto">
          {activeTab === 'chats' ? (
            // Individual chats only
            <>
              {individualChats.map((convo) => (
                <div
                  key={convo.id}
                  className={`cursor-pointer py-2 px-3 bg-white rounded-lg mb-2 hover:bg-green-200 ${
                    selectedConvo?.id === convo.id ? "bg-lime-300" : ""
                  }`}
                  onClick={() => selectConversation(convo)}
                >
                  <div className="flex gap-2 p-2 rounded-md">
                    <div className="flex">
                      <Avatar />
                    </div>
                    <div className="flex flex-col">
                      <div className="font-medium">
                        {convo.participants && convo.participants[0]
                          ? convo.participants[0].name
                          : convo.participantIds
                            ? `User ${convo.participantIds[0]?.substring(0, 4) || ''}`
                            : "Chat"}
                      </div>
                      {convo.messages && convo.messages.length > 0 && (
                        <div className="text-sm text-gray-500 truncate max-w-[180px]">
                          {convo.messages[convo.messages.length - 1].message}
                        </div>
                      )}
                    </div>
                    {convo.participants && convo.participants[0] && onlineUsers.includes(convo.participants[0].id) && (
                      <span className="h-2 w-2 rounded-full bg-green-500 ml-auto" title="Online"></span>
                    )}
                  </div>
                </div>
              ))}
              {individualChats.length === 0 && (
                <div className="text-center text-gray-500 mt-4">
                  No conversations yet. Start a new chat!
                </div>
              )}
            </>
          ) : (
            // Group chats only
            <>
              {myGroups && myGroups.length > 0 ? (
                myGroups.map((group) => (
                  <div
                    key={group.id}
                    className={`cursor-pointer py-2 px-3 bg-white rounded-lg mb-2 hover:bg-indigo-100 ${
                      selectedGroup?.id === group.id ? "bg-indigo-200" : ""
                    }`}
                    onClick={() => selectGroup(group)}
                  >
                    <div className="flex gap-2 p-2 rounded-md">
                      <div className="flex">
                        <Avatar sx={{ bgcolor: 'indigo' }}>
                          <HiUserGroup />
                        </Avatar>
                      </div>
                      <div className="flex flex-col">
                        <div className="font-medium">{group.name || "Group Chat"}</div>
                        <div className="text-xs text-gray-500">
                          {Array.isArray(group.participants) 
                            ? `${group.participants.length} members` 
                            : Array.isArray(group.participantIds)
                              ? `${group.participantIds.length} members`
                              : "Loading members..."}
                        </div>
                        {group.messages && group.messages.length > 0 && (
                          <div className="text-sm text-gray-500 truncate max-w-[180px]">
                            {group.messages[group.messages.length - 1].content || 
                             group.messages[group.messages.length - 1].message}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center text-gray-500 mt-4">
                  No groups yet. Create a new group!
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {selectedConvo || selectedGroup ? (
        <div className="bg-gray-100 w-3/4 flex flex-col">
          <div className="bg-stone-500 text-white p-4 flex justify-between items-center">
            <div className="flex items-center gap-2">
              {isGroupChat ? (
                <>
                  <HiUserGroup className="text-2xl" />
                  <span>{selectedGroup?.name || "Group Chat"}</span>
                </>
              ) : (
                <>
                  <BiUserCircle className="text-2xl" />
                  <span>
                    {selectedConvo.participants && selectedConvo.participants[0] 
                      ? selectedConvo.participants[0].name 
                      : "Chat"}
                  </span>
                </>
              )}
            </div>
            
            {isGroupChat && (
              <div className="text-sm flex items-center">
                <span className="mr-2">
                  {selectedGroup?.participants?.length || 
                   selectedGroup?.participantIds?.length || 0} members
                </span>
                <div className="flex -space-x-2">
                  {(selectedGroup?.participants || []).slice(0, 3).map(member => (
                    <Avatar 
                      key={member.id} 
                      sx={{ width: 24, height: 24, fontSize: '0.8rem' }}
                      title={member.name}
                    >
                      {member.name?.charAt(0) || '?'}
                    </Avatar>
                  ))}
                  {selectedGroup?.participants?.length > 3 && (
                    <Avatar 
                      sx={{ width: 24, height: 24, fontSize: '0.7rem' }}
                    >
                      +{selectedGroup.participants.length - 3}
                    </Avatar>
                  )}
                </div>
              </div>
            )}
          </div>

          <div className="flex-grow p-4 overflow-y-auto">
            <div className="space-y-4">
              {isGroupChat ? (
                // Group Messages
                selectedGroup?.messages?.map((msg, index) => (
                  <div
                    key={index}
                    className={`flex ${
                      msg.senderId === mydetails?.id ? "justify-end" : "justify-start"
                    }`}
                  >
                    <div
                      className={`max-w-[70%] p-3 rounded-lg ${
                        msg.senderId === mydetails?.id
                          ? "bg-blue-500 text-white rounded-br-none"
                          : "bg-white border border-gray-300 rounded-bl-none"
                      }`}
                    >
                      {msg.senderId !== mydetails?.id && (
                        <div className="text-xs text-gray-500 mb-1">
                          {msg.sender?.name || 
                           selectedGroup.participants?.find(p => p.id === msg.senderId)?.name || 
                           "User"}
                        </div>
                      )}
                      <div>{msg.message}</div>
                    </div>
                  </div>
                ))
              ) : (
                // Individual Messages
                selectedConvo?.messages?.map((msg, index) => (
                  <div
                    key={index}
                    className={`flex ${
                      msg.senderId === mydetails?.id ? "justify-end" : "justify-start"
                    }`}
                  >
                    <div
                      className={`max-w-[70%] p-3 rounded-lg ${
                        msg.senderId === mydetails?.id
                          ? "bg-blue-500 text-white rounded-br-none"
                          : "bg-white border border-gray-300 rounded-bl-none"
                      }`}
                    >
                      <div>{msg.message}</div>
                    </div>
                  </div>
                ))
              )}
              <div ref={messagesEndRef} />
            </div>
          </div>

          <div className="bg-white p-3 flex items-center">
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              className="flex-grow p-2 border border-gray-300 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
              rows="1"
              placeholder="Type a message..."
            ></textarea>
            <button
              onClick={sendMessageHandler}
              className="ml-2 bg-blue-500 hover:bg-blue-600 text-white p-2 rounded-full"
            >
              <Send fontSize="small" />
            </button>
          </div>
        </div>
      ) : (
        <div className="bg-gray-100 w-3/4 flex items-center justify-center">
          <div className="text-center text-gray-500">
            <BiUserCircle className="text-6xl mx-auto mb-4" />
            <p className="text-xl">Select a conversation to start chatting</p>
          </div>
        </div>
      )}

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Chat With {wantTo?.name}</DialogTitle>
            <DialogDescription>
              Do you want to start a conversation with {wantTo?.name}?
            </DialogDescription>
          </DialogHeader>
          <button
            onClick={createConversation}
            className="bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-lg"
          >
            Start Conversation
          </button>
        </DialogContent>
      </Dialog>

      <Dialog open={groupDialogOpen} onOpenChange={setGroupDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create a new group</DialogTitle>
            <DialogDescription>
              Enter a group name and select members
            </DialogDescription>
          </DialogHeader>
          
          <div className="mt-4">
            <input
              type="text"
              value={groupName}
              onChange={(e) => setGroupName(e.target.value)}
              className="w-full border rounded-lg p-2 focus:outline-none"
              placeholder="Group name"
            />
          </div>
          
          <div className="mt-4">
            <h4 className="font-medium mb-2">Select members:</h4>
            <div className="max-h-40 overflow-y-auto">
              {allusers?.map((user) => (
                <div 
                  key={user.id} 
                  className="flex items-center p-2 hover:bg-gray-100 rounded"
                >
                  <input
                    type="checkbox"
                    id={`user-${user.id}`}
                    checked={selectedMembers.includes(user.id)}
                    onChange={() => toggleMemberSelection(user.id)}
                    className="mr-2"
                  />
                  <label htmlFor={`user-${user.id}`}>{user.name}</label>
                </div>
              ))}
            </div>
          </div>
          
          <button
            onClick={handleCreateGroup}
            className="bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-lg mt-4"
          >
            Create Group
          </button>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Chat;
