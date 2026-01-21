const { StyleSheet, View ,Text ,TouchableOpacity } = require("react-native");
import { useState } from 'react';
import EditText from '../../components/EditText';
import commonStyles from '../../../style/style';
import Button from '../../components/Button';
import { loginCandidate } from '../../../services/candidateServices';
import { theme } from '../../../style/theme';


function Login({ navigation ,onLoginSuccess}){
    const [email , setEmail] = useState("")
    const [password , setPassword] = useState("")
    const [loading, setLoading] = useState(false);


    const onRegister = () => {
         navigation.push('Register')
    }
    

    const onLogin = async () => {
        if (!email) return alert('Please enter email');
        if (!password) return alert('Please enter password');
      
        try {
            setLoading(true);
          const result = await loginCandidate(email, password);
          console.log(result)
          setLoading(false);
          if (result.status === 'success') {
            await onLoginSuccess(); 
            alert('Login Successful');
          } else {
            alert(result.error);
          }
        } catch (error) {
          alert('Invalid credentials or server error');
        }
      };
      

    return(
        
        <View style={styles.container}>
            <View style={commonStyles.card}>  
                <View style={styles.innerContainer}>
                      <Text style={styles.title}> Login to your Account </Text>
                </View>
                    <Text style={commonStyles.tagLine}>Sign in to find your dream job</Text>              
                    <EditText
                        label={"Email *"}
                        placeholder={"Enter Your Email"}
                        onChangeText={setEmail}
                    />

                    <EditText
                        label={"Password *"}
                        placeholder={"Enter Your Password"}
                        onChangeText={setPassword}
                        isPassword={true}
                    />

                    <View style={styles.loginHereContainer}>
                        <Text style={styles.text}>Don't have an account yet? </Text>
                        <TouchableOpacity>
                        <Text style={styles.loginHere} onPress={onRegister}>Register here</Text>
                        </TouchableOpacity>
                    </View>

                    <Button
                    onPress={onLogin}
                    title={loading ? 'Logging in...' : 'Login'}
                    marginTop={20}
                    />

             </View>

        </View>
    )
    

}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding:16,
        backgroundColor: theme.white,
        justifyContent: 'center',
      },
      innerContainer: {
        marginTop: -40,
        marginBottom: 20,
        justifyContent: 'center',
        alignItems: 'center',
      },
      title: {
        textAlign: 'center',
        backgroundColor: theme.primary,
        width: 250,
        color: 'white',
        fontWeight: 'bold',
        fontSize: 20,
        padding: 15,
        borderRadius: 8,
        elevation: 5,
      },
      loginHere: {
        color:theme.primary,
        fontSize: 17,
        fontWeight: 'bold',
      },
      loginHereContainer: {
        justifyContent:'center',
        marginTop: 10,
        flexDirection: 'row',
      },
      text: {
        color:theme.black,
        fontSize: 17,
      },
})

export default Login