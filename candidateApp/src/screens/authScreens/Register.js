const { StyleSheet, View ,Text ,TouchableOpacity} = require("react-native");
import { useState } from 'react';
import EditText from '../../components/EditText';
import commonStyles from '../../../style/style';
import Button from '../../components/Button';
import { registerCandidate } from '../../../services/candidateServices';
import { theme } from '../../../style/theme';


function Register({ navigation }){
    const [name , setName] = useState("")
    const [email , setEmail] = useState("")
    const [mobile , setMobile] = useState("")
    const [password , setPassword] = useState("")
    const [conPassword , setConPassword] = useState("")


    const onLogin = () => {
        navigation.goBack()
   }

    const onRegister = async ()  =>{
        if (email.length == 0) {
            alert('please enter email')
        } else if (password.length == 0) {
            alert('please enter password')
        } else if (name.length == 0) {
            alert('Please enter name');
        } else if (mobile.length == 0) {
            alert('Please enter mobile');
        } else if (password.length == 0) {
            alert('Please enter password');
        } else if (conPassword.length == 0) {
            return alert('Please confirm password');
        }else if(password !== conPassword){
            alert('Conform Password Not Matching')
        } else {
            console.log(email)
            console.log(password)
            const result = await registerCandidate(name,email,password,mobile)
            console.log(result)
            if(result.status == "success"){
                navigation.goBack()
                alert('Registration Successful')
            }else{
                alert(result.error)
            }
        }
    }

    return(
        
        <View style={styles.container}>
            <View style={commonStyles.card}>  
                <View style={styles.innerContainer}>
                      <Text style={styles.title}> Create Account </Text>
                </View>
                    <Text style={commonStyles.tagLine}>Join us and start your career journey</Text>              
                    <EditText
                        label={"Name *"}
                        placeholder={"Enter Your Name"}
                        onChangeText={setName}
                    />

                    <EditText
                        label={"Mobile *"}
                        placeholder={"Enter Your Mobile"}
                        onChangeText={setMobile}
                    />

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

                    <EditText
                        label={"Conform Password *"}
                        placeholder={"Re-enter Your Password"}
                        onChangeText={setConPassword}
                        isPassword={true}
                    />


                    <View style={styles.registerHereContainer}>
                        <Text style={styles.text}>Already have an account?</Text>
                        <TouchableOpacity>
                            <Text style={styles.registerHere} onPress={onLogin}> Login here</Text>
                        </TouchableOpacity>
                    </View>

                    <Button 
                        onPress={onRegister}
                        title='Register'
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
        backgroundColor: 'white',
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
      registerHere: {
        color: theme.primary,
        fontSize: 17,
        fontWeight: 'bold',
      },
      registerHereContainer: {
        justifyContent:'center',
        marginTop: 10,
        flexDirection: 'row',
      },
      text: {
        color: theme.black,
        fontSize: 17,
      },
})

export default Register