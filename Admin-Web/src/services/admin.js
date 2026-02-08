import axios from "axios";
import { toast } from "react-toastify";
import config from "./config";


export async function loginAdmin(email, password) {
    try {
        const userbody = { email, password }
         const url = config.BASE_URL + '/admin/login'
        const response = await axios.post(url, userbody)
        return response.data
    } catch (ex) {
        toast.error(ex)
    }
}

export async function registerAdmin(name, email, password, mobile) {
    try {
        const userbody = { name, email, password, mobile }
        const url = config.BASE_URL + '/admin/register'
        const response = await axios.post(url, userbody)
        return response.data
    } catch (ex) {
        toast.error(ex)
    }
}


export async function fetchAdminData() {
    const url = config.BASE_URL + '/admin/dashboard'
    const headers = {
        token: window.sessionStorage.getItem('token')
    }
    try {
        const response = await axios.get(url, {headers})
        return response.data
    } catch (error) {
        toast.error(error)
    }
}

export async function fetchUsersData() {
    const url = config.BASE_URL + '/admin/users'
    const headers = {
        token: window.sessionStorage.getItem('token')
    }
    try {
        const response = await axios.get(url, {headers})
        return response.data
    } catch (error) {
        toast.error(error)
    }
}

export async function fetchBlockedUsersData() {
    console.log('====================================');
    console.log("hii");
    console.log('====================================');
    const url = config.BASE_URL + '/admin/blockedUsers'
    const headers = {
        token: window.sessionStorage.getItem('token')
    }
    try {
        const response = await axios.get(url, {headers})
        console.log(response.data);
        return response.data
    } catch (error) {
        toast.error(error)
    }
}

export async function fetchProfile() {
    const url = config.BASE_URL + '/admin/profile'
    const headers = {
        token: window.sessionStorage.getItem('token')
    }
    try {
        const response = await axios.get(url, {headers})
        return response.data
    } catch (error) {
        toast.error(error)
    }
}

export async function updateProfilePhoto(file) {
    const url = config.BASE_URL + '/users/profile-photo';
    
    // Create FormData object and append the file
    const formData = new FormData();
    formData.append('profile_photo', file);

    const headers = {
        'token': window.sessionStorage.getItem('token'),
        'Content-Type': 'multipart/form-data'
    };

    try {
        const response = await axios.patch(url, formData, { headers });
        toast.success(response.data.data.message);
        return response.data;
    } catch (error) {
        // Checking for axios-specific error message structure
        const errorMessage = error.response?.data?.message || error.message;
        toast.error(errorMessage);
        throw error; 
    }
}


export async function getAllCandidates() {
    const url = config.BASE_URL + '/admin/users?user_role=candidate'
    const headers = {
        token: window.sessionStorage.getItem('token')
    }
    try {
        const response = await axios.get(url, {headers})
        return response.data
    } catch (error) {
        toast.error(error)
    }
}

// 1. GET ALL ACTIVE ORGANIZATIONS (Refined version of your provided code)
export async function getAllOrganizations() {
    const url = config.BASE_URL + '/admin/organizations'
    const headers = {
        token: window.sessionStorage.getItem('token')
    }
    try {
        const response = await axios.get(url, { headers })
        return response.data
    } catch (error) {
        toast.error(error.response?.data?.message || 'Error fetching organizations')
        return null
    }
}

// 2. GET BLOCKED ORGANIZATIONS
export async function getBlockedOrganizations() {
    const url = config.BASE_URL + '/admin/organizations/blocked'
    const headers = {
        token: window.sessionStorage.getItem('token')
    }
    try {
        const response = await axios.get(url, { headers })
        return response.data
    } catch (error) {
        toast.error(error.response?.data?.message || 'Error fetching blocked organizations')
        return null
    }
}

// 3. BLOCK AN ORGANIZATION
export async function blockOrganization(organizationId, reason) {
    const url = config.BASE_URL + `/admin/organizations/${organizationId}/block`
    const headers = {
        token: window.sessionStorage.getItem('token')
    }
    const body = {
        reason: reason || 'Blocked by admin' // Optional reason payload
    }
    try {
        const response = await axios.patch(url, body, { headers })
        return response.data
    } catch (error) {
        toast.error(error.response?.data?.message || 'Error blocking organization')
        return null
    }
}

// 4. UNBLOCK AN ORGANIZATION
export async function unblockOrganization(organizationId, reason) {
    const url = config.BASE_URL + `/admin/organizations/${organizationId}/unblock`
    const headers = {
        token: window.sessionStorage.getItem('token')
    }
    const body = {
        reason: reason || 'Unblocked by admin' // Optional reason payload
    }
    try {
        const response = await axios.patch(url, body, { headers })
        return response.data
    } catch (error) {
        toast.error(error.response?.data?.message || 'Error unblocking organization')
        return null
    }
}


export async function getAllJobs(params) {
    const url = config.BASE_URL + '/admin/job'
    const headers = {
        token: window.sessionStorage.getItem('token')
    }
    try {
        const response = await axios.get(url, {headers, params})
        return response.data
    } catch (error) {
        toast.error(error)
    }
}

export async function getAllApplications(params) {
    const url = config.BASE_URL + '/admin/application'
    const headers = {
        token: window.sessionStorage.getItem('token')
    }
    try {
        const response = await axios.get(url, {headers, params})
        return response.data
    } catch (error) {
        toast.error(error)
    }
}

export async function getAuditLogs(params) {
    const url = config.BASE_URL + '/admin/audit'
    const headers = {
        token: window.sessionStorage.getItem('token')
    }
    try {
        const response = await axios.get(url, {headers, params})
        return response.data
    } catch (error) {
        toast.error(error)
    }
}


export async function blockUser(userId) {
  const url = config.BASE_URL + `/admin/users/${userId}/block`
  const headers = {
    token: window.sessionStorage.getItem('token')
  }

  try {
    const response = await axios.patch(url, {}, { headers })
    return response.data
  } catch (error) {
    toast.error(error?.response?.data?.message || 'Failed to block user')
    throw error
  }
}

export async function unblockUser(userId) {
  const url = config.BASE_URL + `/admin/users/${userId}/unblock`
  const headers = {
    token: window.sessionStorage.getItem('token')
  }

  try {
    const response = await axios.patch(url, {}, { headers })
    return response.data
  } catch (error) {
    toast.error(error?.response?.data?.message || 'Failed to unblock user')
    throw error
  }
}
