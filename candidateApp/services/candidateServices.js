import axios from "axios";
import AsyncStorage from '@react-native-async-storage/async-storage';
import config from "./config";

export async function loginCandidate(email, password) {
    console.log(email, password);
    
    try {
        const userbody = { email, password }
        const url = config.BASE_URL + '/api/candidates/login'
        const response = await axios.post(url, userbody)
        console.log(response.data.data.token)
        
        // Save token
        if (response.data.data.token) {
            console.log("TOKEN +++++++++++++++++"+response.data.data.token)
            await AsyncStorage.setItem('candidate_token', response.data.data.token);

        }
        
        return response.data
    } catch (ex) {
        console.error(ex.response?.data || ex.message);
        throw ex;
    }
}

export async function registerCandidate(name, email, password, mobile) {
    try {
        const url = config.BASE_URL + '/api/candidates/register'
        const body = { name, email, password, mobile }
        const response = await axios.post(url, body)
        
        // Save token
        if (response.data.token) {
            await AsyncStorage.setItem('candidate_token', response.data.token);
        }
        
        return response.data
    } catch (ex) {
        console.error(ex.response?.data || ex.message);
        throw ex;
    }
}

export async function getAllJobs() {
    try {
      const token = await AsyncStorage.getItem('candidate_token');
    const url = config.BASE_URL + "/api/candidates/jobs";

      const headers = {
        token,
      }

      const response = await axios.get( url , {headers}  );
      return response.data;
    } catch (error) {
      console.error(
        'Get Jobs Error:',
        error.response?.data || error.message
      );
      throw error;
    }
  }