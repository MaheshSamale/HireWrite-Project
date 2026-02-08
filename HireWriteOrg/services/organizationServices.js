import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";
import config from "./config";
import { getToken } from "./authService";

/**
 * Generates the specific headers required by the backend authorizeUser middleware.
 * Uses both the JWT token and the unique organization_id.
 */
const getAuthHeaders = async () => {
  const token = await getToken();
  const orgId = await AsyncStorage.getItem("organization_id");
  return {
    token: token,
    organization_id: orgId,
  };
};

// --- ORGANIZATION ACCOUNT MANAGEMENT ---

/**
 * Registers the primary Organization account.
 */
export async function registerOrganization(name, email, password, website, description) {
  try {
    const url = `${config.BASE_URL}/api/organizations/register`;
    const body = { name, email, password, website, description };
    const response = await axios.post(url, body);
    return response.data;
  } catch (ex) {
    console.error("Register Org Error:", ex.response?.data || ex.message);
    throw ex;
  }
}

/**
 * Logs in to the main Organization Dashboard.
 * This sets the 'admin' role and stores the organization_id for all sub-requests.
 */
export async function loginOrganization(email, password) {
  try {
    const url = `${config.BASE_URL}/api/organizations/login`;
    const response = await axios.post(url, { email, password });

    if (response.data.status === 'success' && response.data.data.token) {
      await AsyncStorage.setItem("org_token", response.data.data.token);
      await AsyncStorage.setItem("organization_id", response.data.data.organization_id);
      await AsyncStorage.setItem("user_role", "admin");
    }
    return response.data;
  } catch (ex) {
    console.error("Login Org Error:", ex.response?.data || ex.message);
    throw ex;
  }
}

// --- ADMINISTRATIVE CONTROLS (Managing the Recruiter Team) ---

/**
 * Creates a new Recruiter user account under this Organization.
 * The backend automatically assigns the 'recruiter' role.
 */
export async function addRecruiter(email, mobile, name, position, org_role = 'recruiter') {
  try {
    const headers = await getAuthHeaders();
    const url = `${config.BASE_URL}/api/organizations/recruiters`;
    const body = { email, mobile, name, position, org_role };
    
    const response = await axios.post(url, body, { headers });
    return response.data;
  } catch (ex) {
    console.error("Add Recruiter Error:", ex.response?.data || ex.message);
    throw ex;
  }
}

/**
 * Retrieves a list of all Recruiters currently active in the organization.
 */
export async function getOrgRecruiters() {
  try {
    const headers = await getAuthHeaders();
    const url = `${config.BASE_URL}/api/organizations/recruiters`;
    const response = await axios.get(url, { headers });
    return response.data;
  } catch (ex) {
    console.error("Get Recruiters Error:", ex.response?.data || ex.message);
    throw ex;
  }
}

/**
 * Soft deletes a recruiter, removing their access to the organization portal.
 */
export async function deleteRecruiter(recruiter_id) {
  try {
    const headers = await getAuthHeaders();
    const url = `${config.BASE_URL}/api/organizations/recruiters/${recruiter_id}`;
    const response = await axios.delete(url, { headers });
    return response.data;
  } catch (ex) {
    console.error("Delete Recruiter Error:", ex.response?.data || ex.message);
    throw ex;
  }
}

// --- GLOBAL ORGANIZATION OVERSIGHT ---

/**
 * Fetches all jobs posted across the entire organization, regardless of which recruiter posted them.
 */
export async function getOrgJobs() {
  try {
    const headers = await getAuthHeaders();
    const url = `${config.BASE_URL}/api/organizations/jobs`;
    const response = await axios.get(url, { headers });
    return response.data;
  } catch (ex) {
    console.error("Get Org Jobs Error:", ex.response?.data || ex.message);
    throw ex;
  }
}

/**
 * Retrieves jobs filtered by a specific Recruiter ID to monitor team performance.
 */
export async function getJobsByRecruiter(recruiter_id) {
  try {
    const headers = await getAuthHeaders();
    const url = `${config.BASE_URL}/api/organizations/recruiters/${recruiter_id}/jobs`;
    const response = await axios.get(url, { headers });
    return response.data;
  } catch (ex) {
    console.error("Get Recruiter Jobs Error:", ex.response?.data || ex.message);
    throw ex;
  }
}

// Add this to your existing imports/functions
export async function getJobDetails(jobId) {
  try {
    const headers = await getAuthHeaders();
    const url = `${config.BASE_URL}/api/organizations/jobs/${jobId}`;
    console.log("Fetching Job Details from:", url);
    const response = await axios.get(url, { headers });
    return response.data;
  } catch (ex) {
    console.error("Get Job Details Error:", ex.response?.data || ex.message);
    throw ex;
  }
}

export async function getOrganizationProfile() {
  try {
    const headers = await getAuthHeaders();
    // Note: The organization_id is usually handled by the authorizeUser middleware 
    // on the backend via the token, so we just call the /profile endpoint.
    const url = `${config.BASE_URL}/api/organizations/profile`;
    const response = await axios.get(url, { headers });
    return response.data;
  } catch (ex) {
    console.error("Get Organization Profile Error:", ex.response?.data || ex.message);
    throw ex;
  }
}