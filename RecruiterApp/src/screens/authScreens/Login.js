import React, { useState } from 'react';
import { StyleSheet, View, Text } from 'react-native';
import EditText from '../../components/EditText';
import Button from '../../components/Button';
import commonStyles from '../../../style/style';
import { theme } from '../../../style/theme';
import { loginRecruiter } from '../../../services/recruiterService'; // Import the recruiter service

function Login({ navigation, onLoginSuccess }) {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);

    const onLogin = async () => {
        if (!email) return alert('Please enter email');
        if (!password) return alert('Please enter password');
      
        try {
            setLoading(true);
            // Calls the Recruiter Login API: /api/organizations/recruiters/login
            const result = await loginRecruiter(email, password); 
            setLoading(false);
            
            if (result.status === 'success') {
                await onLoginSuccess(); // Triggers navigation to BottomTabs
                alert('Welcome, Recruiter!');
            } else {
                alert(result.message || 'Login failed');
            }
        } catch (error) {
            setLoading(false);
            alert('Invalid credentials or server error');
        }
    };

    return (
        <View style={styles.container}>
            <View style={commonStyles.card}>  
                <View style={styles.innerContainer}>
                      <Text style={styles.title}>Recruiter Portal</Text>
                </View>
                
                <Text style={commonStyles.tagLine}>Manage your hiring and job postings</Text>              
                
                <EditText
                    label={"Business Email *"}
                    placeholder={"recruiter@company.com"}
                    onChangeText={setEmail}
                    value={email}
                />

                <EditText
                    label={"Password *"}
                    placeholder={"Enter Password"}
                    onChangeText={setPassword}
                    isPassword={true}
                    value={password}
                />

                <View style={styles.infoContainer}>
                    <Text style={styles.infoText}>
                        Contact your Admin if you have forgotten your credentials.
                    </Text>
                </View>

                <Button
                    onPress={onLogin}
                    title={loading ? 'Authenticating...' : 'Login'}
                    marginTop={20}
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
        fontSize: 20,
        padding: 15,
        borderRadius: 8,
        elevation: 5,
    },
    infoContainer: {
        justifyContent: 'center',
        marginTop: 15,
        paddingHorizontal: 10,
    },
    infoText: {
        color: 'gray',
        fontSize: 14,
        textAlign: 'center',
        fontStyle: 'italic',
    },
});

export default Login;