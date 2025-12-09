import axios from "axios";
import { toast } from "react-toastify";
import config from "./config";

export async function loginCandidate(email, password) {
    console.log(email);
    console.log(password);
    
    try {
        const userbody = { email, password }
        const url = config.BASE_URL + '/api/user/login'
        const response = await axios.post(url, userbody)
        return response.data
    } catch (ex) {
        toast.error(ex)
    }
}

export async function registerCandidate(name, email, password, mobile) {
    try {
         const url = config.BASE_URL + '/api/user/register'
        const body = { name, email, password, mobile }
        const response = await axios.post(url, body)
        return response.data
    } catch (ex) {
        toast.error(ex)
    }
}