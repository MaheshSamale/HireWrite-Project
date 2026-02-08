import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";
import config from "./config";

// Recruiter Login
export async function loginRecruiter(email, password) {
  try {
    const body = { email, password };
    const url = config.BASE_URL + "/api/organizations/recruiters/login";
    const response = await axios.post(url, body);

    if (response.data.data?.token) {
      await AsyncStorage.setItem("recruiter_token", response.data.data.token);
    }
    return response.data;
  } catch (ex) {
    console.error("Login Error:", ex.response?.data || ex.message);
    throw ex;
  }
}

// Create a New Job Posting
export async function createJob(jobData) {
  try {
    const token = await AsyncStorage.getItem("recruiter_token");
    const url = config.BASE_URL + "/api/recruiters/jobs";
    
    const response = await axios.post(url, jobData, { 
        headers: { token } 
    });
    return response.data;
  } catch (error) {
    console.error("Create Job Error:", error.response?.data || error.message);
    throw error;
  }
}

export async function generateJobDescription(jobData) {
    const url = config.BASE_URL + "/api/recruiters/jobs/generate-description";
    const headers = {
        token: await AsyncStorage.getItem("recruiter_token")
    };
    try {
        const response = await axios.post(url, jobData, { headers });
        return response.data; // Should return { status: 'success', data: { jd_text: '...' } }
    } catch (error) {
        toast.error('AI Generation failed');
        throw error;
    }
}

// Get Jobs Posted by this Recruiter/Org
export async function getRecruiterJobs() {
    try {
        const token = await AsyncStorage.getItem("recruiter_token");
        
        // Adjust the endpoint path if your backend route prefix is different 
        // (e.g., might be /api/recruiters/jobs or /api/organization/jobs)
        const url = config.BASE_URL+"/api/recruiters/jobs"; 

        const response = await axios.get(url, {
            headers: { 
                'Authorization': `Bearer ${token}`, // Standard JWT format
                'token': token // specific header if your middleware expects this
            }
        });

        return response.data;
    } catch (error) {
        console.error("Error fetching jobs:", error);
        throw error;
    }
}

export async function updateJobStatus(jobId, newStatus) {
    const url = config.BASE_URL + '/api/recruiters/jobs/status';
    const headers = {
        token: await AsyncStorage.getItem('recruiter_token')
    };
    try {
        const response = await axios.put(url, { job_id: jobId, status: newStatus }, { headers });
        return response.data;
    } catch (error) {
        console.error(error);
        throw error;
    }
}

// Get Applications for a Specific Job
export async function getJobApplications(jobId) {
  try {
    const token = await AsyncStorage.getItem("recruiter_token");
    const url = `${config.BASE_URL}/api/recruiters/jobs/${jobId}/applications`;
    
    const response = await axios.get(url, { headers: { token } });
    return response.data;
  } catch (error) {
    throw error;
  }
}

// Update Application Stage (Shortlist, Reject, etc.)
export async function updateApplicationStage(applicationId, stage, decision = null) {
  try {
    const token = await AsyncStorage.getItem("recruiter_token");
    const url = `${config.BASE_URL}/api/recruiters/applications/${applicationId}/stage`;
    
    const body = { stage, decision };
    const response = await axios.put(url, body, { headers: { token } });
    return response.data;
  } catch (error) {
    throw error;
  }
}

// Recruiter Profile Photo Upload
export async function uploadProfilePhoto(imageUri) {
  try {
    const token = await AsyncStorage.getItem("recruiter_token");
    const url = config.BASE_URL + "/api/users/profile-photo";

    const formData = new FormData();
    formData.append("photo", {
      uri: imageUri,
      name: "recruiter_photo.jpg",
      type: "image/jpeg",
    });

    const response = await axios.post(url, formData, {
      headers: {
        token,
        "Content-Type": "multipart/form-data",
      },
    });
    return response.data;
  } catch (error) {
    throw error;
  }
}



// --- Recruiter Profile & Stats ---
export async function getRecruiterProfile() {
    try {
      const url = `${config.BASE_URL}/api/recruiters/me`;
      const response = await axios.get(url, await getAuthHeader());
      return response.data;
    } catch (error) {
      console.error("Fetch Profile Error:", error.response?.data || error.message);
      throw error;
    }
  }
  
  // Update/Upload Profile Photo
  export async function updateProfilePhoto(formData) {
    try {
      const url = `${config.BASE_URL}/api/users/profile-photo`;
      const response = await axios.post(url, formData, await getAuthHeader(true));
      return response.data;
    } catch (error) {
      console.error("Photo Upload Error:", error.response?.data || error.message);
      throw error;
    }
  }



  // --- Internal Helpers ---
const getAuthHeader = async (isMultipart = false) => {
    const token = await AsyncStorage.getItem("recruiter_token");
    return {
      headers: {
        token: token, // Keeping your 'token' key, but Bearer is industry standard
        "Content-Type": isMultipart ? "multipart/form-data" : "application/json",
      },
    };
  };