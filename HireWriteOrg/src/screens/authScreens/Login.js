import { StyleSheet, View, Text, TouchableOpacity, Alert } from "react-native";
import { useState } from 'react';
import EditText from '../../components/EditText';
import commonStyles from '../../../style/style';
import Button from '../../components/Button';
import { loginOrganization } from '../../../services/organizationServices'; // Removed loginRecruiter
import { theme } from '../../../style/theme';

function Login({ navigation, onLoginSuccess }) {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);

    const onRegister = () => {
        navigation.push('Register');
    };

    const onLogin = async () => {
        if (!email) return Alert.alert('Error', 'Please enter email');
        if (!password) return Alert.alert('Error', 'Please enter password');

        try {
            setLoading(true);
            
            // STRICTLY Organization Login
            const result = await loginOrganization(email, password);
            
            setLoading(false);

            if (result.status === 'success') {
                await onLoginSuccess(); // Triggers App.js state update
                // Alert.alert('Success', 'Welcome back, Admin!'); // Optional welcome message
            } else {
                Alert.alert('Login Failed', result.error || 'Invalid credentials');
            }
        } catch (error) {
            setLoading(false);
            Alert.alert('Error', 'Server error. Please try again later.');
            console.error(error);
        }
    };

    return (
        <View style={styles.container}>
            <View style={commonStyles.card}>  
                <View style={styles.innerContainer}>
                    <Text style={styles.title}> Organization Admin </Text>
                </View>
                
                <Text style={commonStyles.tagLine}>Login to manage your hiring team</Text>

                <EditText
                    label={"Official Email *"}
                    placeholder={"admin@company.com"}
                    onChangeText={setEmail}
                    keyboardType="email-address"
                />

                <EditText
                    label={"Password *"}
                    placeholder={"Enter Your Password"}
                    onChangeText={setPassword}
                    isPassword={true}
                />

                <View style={styles.loginHereContainer}>
                    <Text style={styles.text}>New organization? </Text>
                    <TouchableOpacity onPress={onRegister}>
                        <Text style={styles.loginHere}>Register here</Text>
                    </TouchableOpacity>
                </View>

                <Button
                    onPress={onLogin}
                    title={loading ? 'Verifying...' : 'Login'}
                    marginTop={20}
                    disabled={loading}
                />
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 16,
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
        fontSize: 18,
        padding: 15,
        borderRadius: 8,
        elevation: 5,
    },
    loginHere: {
        color: theme.primary,
        fontSize: 17,
        fontWeight: 'bold',
    },
    loginHereContainer: {
        justifyContent: 'center',
        marginTop: 15,
        flexDirection: 'row',
    },
    text: {
        color: theme.black,
        fontSize: 17,
    },
});

export default Login;