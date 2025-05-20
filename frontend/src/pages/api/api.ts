
const serverPath = "http://localhost:3000/"
interface TimeEntry {
    id: string;
    startDateTime: string;
    endDateTime: string;
    description?: string;
  }
  
export default {
  registerUser: async (email: string, password: string) => {
    const response = await fetch(serverPath + "register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: email, password: password }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`HTTP ${response.status}: ${errorText}`);
    }
    return await response.json();
  },
  loginUser: async (email: string, password: string) => {
    const response = await fetch(serverPath + "login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: email, password: password }),
    });
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`HTTP ${response.status}: ${errorText}`);
    }
    return await response.json();
  },
  getUserEntries: async (token:string)=>{
    const response = await fetch(serverPath + "api/entries", {
      headers: { Authorization: `Bearer ${token}` },
    });
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`HTTP ${response.status}: ${errorText}`);
      }
      return await response.json();
  },
  postUserEntry: async (data:TimeEntry, token:string) =>{
    const response = await fetch(serverPath+"api/addEntry", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({...data, token:token}),
      })

      if(response.ok) {
        const newEntry = await response.json();
        return newEntry
      }
  }
};