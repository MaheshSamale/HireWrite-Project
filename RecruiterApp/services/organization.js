import axios from "axios";
import config from "./config";

// Org Admin Registration
export async function registerOrganization(name, website, description, email, password) {
    try {
        const url = config.BASE_URL + '/api/organizations/register';
        const body = { name, website, description, email, password };
        const response = await axios.post(url, body);
        return response.data;
    } catch (ex) {
        console.error(ex);
        throw ex;
    }
}

// Add a New Recruiter to Org (Admin Only)
export async function addRecruiter(recruiterData) {
    try {
        const token = await AsyncStorage.getItem("admin_token"); // Admins use a different token
        const url = config.BASE_URL + '/api/organizations/recruiters';
        const response = await axios.post(url, recruiterData, { headers: { token } });
        return response.data;
    } catch (ex) {
        throw ex;
    }
}