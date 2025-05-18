import axios from "axios";
import { useQuery } from "@tanstack/react-query";

const AuthAPI = () => {
  if (typeof window !== "undefined") {
    return axios.create({
      baseURL: `${import.meta.env.VITE_BASE_URL}/v1/`,
      headers: {
        authorization: `Bearer ${localStorage.getItem("token")}`,
        "Content-Type": "application/json",
      },
    });
  } else {
    return axios.create({
      baseURL: `${import.meta.env.VITE_BASE_URL}/v1/`,
      headers: {
        authorization: `Bearer }`,
        "Content-Type": "application/json",
      },
    });
  }
};

// Function to create an API client for non-v1 routes
const BaseAPI = () => {
  if (typeof window !== "undefined") {
    return axios.create({
      baseURL: `${import.meta.env.VITE_BASE_URL}/`,
      headers: {
        authorization: `Bearer ${localStorage.getItem("token")}`,
        "Content-Type": "application/json",
      },
    });
  } else {
    return axios.create({
      baseURL: `${import.meta.env.VITE_BASE_URL}/`,
      headers: {
        authorization: `Bearer }`,
        "Content-Type": "application/json",
      },
    });
  }
};

const GetUser = async () => {
  const { data } = await AuthAPI().get("/user/user-details");
  return data;
};
const getAllUsers = async () => {
  const { data } = await AuthAPI().get("/user/get-all-users");
  return data;
};
const sendMessage = async (message, receiverId, conversationId = null) => {
  const { data } = await AuthAPI().post("/user/create-conversation", {
    message,
    receiverId,
    conversationId
  });
  return data;
};
const getMySubmissions = async ()=>{
  const {data}= await AuthAPI().get("/user/get-user-sub")
  return data;
}
const getUserById = async (userId) => {
  const { data } = await AuthAPI().get(`/user/getuserbyid/${userId}`);
  return data;
};
const getMyConvos =async ()=>{
  const {data } =await AuthAPI().get("/user/all-convo");
  return data
}

// Group Chat API Functions
const createGroupChat = async (name, members) => {
  try {
    console.log("Creating group chat with name:", name, "members:", members);
    
    // Using fetch directly to avoid any axios config issues
    const response = await fetch(`${import.meta.env.VITE_BASE_URL}/api/group-chat/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem("token")}`
      },
      body: JSON.stringify({ name, members })
    });
    
    if (!response.ok) {
      throw new Error(`Failed to create group: ${response.status} ${response.statusText}`);
    }
    
    const data = await response.json();
    console.log("Group chat created:", data);
    return data;
  } catch (error) {
    console.error("Error creating group chat:", error);
    throw error;
  }
};

const getMyGroups = async () => {
  try {
    console.log("Fetching user groups");
    
    // Using fetch directly to avoid any axios config issues
    const response = await fetch(`${import.meta.env.VITE_BASE_URL}/api/group-chat/`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem("token")}`
      }
    });
    
    console.log("Groups fetch response status:", response.status);
    
    if (!response.ok) {
      console.error("Error fetching groups:", response.status, response.statusText);
      return [];
    }
    
    const data = await response.json();
    console.log("Fetched groups:", data);
    
    if (!data || (Array.isArray(data) && data.length === 0)) {
      console.log("No groups found");
    } else {
      console.log(`Found ${data.length} groups`);
    }
    
    return data;
  } catch (error) {
    console.error("Error fetching groups:", error);
    return [];
  }
};

const getGroupDetails = async (groupId) => {
  try {
    console.log("Fetching group details for:", groupId);
    
    // Using fetch directly to avoid any axios config issues
    const response = await fetch(`${import.meta.env.VITE_BASE_URL}/api/group-chat/${groupId}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem("token")}`
      }
    });
    
    if (!response.ok) {
      throw new Error(`Failed to fetch group details: ${response.status} ${response.statusText}`);
    }
    
    const data = await response.json();
    console.log("Fetched group details:", data);
    return data;
  } catch (error) {
    console.error("Error fetching group details:", error);
    throw error;
  }
};

const sendGroupMessage = async (groupId, content) => {
  try {
    console.log("Sending group message to:", groupId, "content:", content);
    
    const response = await fetch(`${import.meta.env.VITE_BASE_URL}/api/group-chat/${groupId}/message`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem("token")}`
      },
      body: JSON.stringify({ content })
    });
    
    if (!response.ok) {
      throw new Error(`Failed to send message: ${response.status} ${response.statusText}`);
    }
    
    const data = await response.json();
    console.log("Group message sent:", data);
    return data;
  } catch (error) {
    console.error("Error sending group message:", error);
    throw error;
  }
};

const addGroupMembers = async (groupId, members) => {
  try {
    const { data } = await BaseAPI().post(`api/group-chat/${groupId}/members`, { 
      members 
    });
    return data;
  } catch (error) {
    console.error("Error adding group members:", error.response?.data || error.message);
    throw error;
  }
};

const leaveGroup = async (groupId) => {
  try {
    const { data } = await BaseAPI().post(`api/group-chat/${groupId}/leave`);
    return data;
  } catch (error) {
    console.error("Error leaving group:", error.response?.data || error.message);
    throw error;
  }
};

const GetUserQuery = () =>
  useQuery({
    queryKey: ["user-details"],
    queryFn: () => GetUser(),
    select: (data) => {
      const res = data.message;
 
      return res;
    },
  });

const getSubmissionQuery =()=>
useQuery({
    queryKey: ["get-subs"],
    queryFn: () => getMySubmissions(),
    select: (data) => {
      const res = data.message;
    
      return res;
    },
})
  const GetAllUsersQuery = () =>
  useQuery({
    queryKey: ["all-users"],
    queryFn: () => getAllUsers(),
    select: (data) => {
      const res = data.message;
    
      return res;
    },
  });
  const GetAllConvoQuery = () =>
  useQuery({
    queryKey: ["all-convo"],
    queryFn: () => getMyConvos(),
    select: (data) => {
      const res = data.message;
      console.log("Conversations loaded:", res);
      return res;
    },
  });

// Get groups using direct test endpoint
const getGroupsDirectTest = async () => {
  try {
    console.log("Fetching groups using direct test endpoint");
    
    const response = await fetch(`${import.meta.env.VITE_BASE_URL}/api/test-groups`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      }
    });
    
    console.log("Direct test groups fetch response status:", response.status);
    
    if (!response.ok) {
      console.error("Error fetching direct test groups:", response.status, response.statusText);
      return [];
    }
    
    const data = await response.json();
    console.log("Fetched direct test groups:", data);
    
    return data;
  } catch (error) {
    console.error("Error fetching direct test groups:", error);
    return [];
  }
};

// Update GetMyGroupsQuery to use the direct test endpoint
const GetMyGroupsQuery = () =>
  useQuery({
    queryKey: ["my-groups"],
    // Use direct test endpoint instead of regular endpoint
    queryFn: () => getGroupsDirectTest(),
    select: (data) => {
      console.log("Groups loaded raw data:", data);
      if (!data || !Array.isArray(data)) {
        console.error("Unexpected group data format:", data);
        return [];
      }
      
      // Process each group to ensure it has the right format
      const processedGroups = data.map(group => {
        // Ensure participants is an array or convert participantIds to participant objects
        let participants = [];
        if (group.participants && Array.isArray(group.participants)) {
          participants = group.participants;
        } else if (group.participantIds && Array.isArray(group.participantIds)) {
          // Convert IDs to simple participant objects
          participants = group.participantIds.map(id => ({ id, name: `User ${id.substring(0, 4)}` }));
        }
        
        // Ensure messages have consistent format
        const messages = (group.messages || []).map(msg => ({
          id: msg.id || `temp-${Date.now()}`,
          senderId: msg.senderId || (msg.sender?.id || ''),
          sender: msg.sender || { id: msg.senderId || '', name: 'User' },
          message: msg.message || msg.content || '',
          content: msg.content || msg.message || '',
          createdAt: msg.createdAt || msg.timestamp || new Date().toISOString(),
          timestamp: msg.timestamp || msg.createdAt || new Date().toISOString()
        }));
        
        return {
          ...group,
          participants,
          messages
        };
      });
      
      console.log(`Successfully processed ${processedGroups.length} groups:`, processedGroups);
      return processedGroups;
    },
    onError: (error) => {
      console.error("Error in groups query:", error);
      return [];
    },
    // Increase refetch frequency for debugging
    refetchInterval: 5000
  });

export { 
  GetUserQuery, 
  getSubmissionQuery, 
  GetAllUsersQuery, 
  GetAllConvoQuery, 
  getUserById, 
  sendMessage,
  // Group chat exports
  createGroupChat,
  getMyGroups,
  getGroupDetails,
  sendGroupMessage,
  addGroupMembers,
  leaveGroup,
  GetMyGroupsQuery
};
