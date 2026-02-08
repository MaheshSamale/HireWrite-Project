import axios from "axios";
import { toast } from "react-toastify";
import config from "./config";

export async function registerOrganization(name, website, description, email, password) {
    try {
         const url = config.BASE_URL + '/api/organizations/register'
        const body = { name, website, description, email, password }
        const response = await axios.post(url, body)
        return response.data
    } catch (ex) {
        toast.error(ex)
    }
}

export async function loginOrganization(email, password) {
    console.log(email);
    console.log(password);
    
    try {
        const userbody = { email, password }
        const url = config.BASE_URL + '/api/organizations/login'
        const response = await axios.post(url, userbody)
        return response.data
    } catch (ex) {
        toast.error(ex)
    }
}