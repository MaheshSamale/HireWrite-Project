import { StyleSheet, View, Text, TouchableOpacity, Alert } from "react-native";
import { useState } from 'react';
import EditText from '../../components/EditText';
import commonStyles from '../../../style/style';
import Button from '../../components/Button';
import { registerOrganization } from '../../../services/organizationServices';
import { theme } from '../../../style/theme';

function Register({ navigation }) {
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [website, setWebsite] = useState("");
    const [description, setDescription] = useState("");
    const [password, setPassword] = useState("");
    const [conPassword, setConPassword] = useState("");
    const [loading, setLoading] = useState(false);

    const onLogin = () => {
        navigation.goBack();
    };

    const handleRegister = async () => {
        // Validation logic
        if (!name || !email || !password) {
            return Alert.alert('Error', 'Organization name, email, and password are required');
        }
        if (password !== conPassword) {
            return Alert.alert('Error', 'Passwords do not match');
        }

        try {
            setLoading(true);
            const result = await registerOrganization(name, email, password, website, description);
            setLoading(false);

            if (result.status === "success") {
                Alert.alert('Success', 'Organization registered successfully');
                navigation.goBack();
            } else {
                Alert.alert('Registration Failed', result.error);
            }
        } catch (error) {
            setLoading(false);
            Alert.alert('Error', 'Something went wrong. Please try again.');
        }
    };

    return (
        <View style={styles.container}>
            <View style={commonStyles.card}>  
                <View style={styles.innerContainer}>
                    <Text style={styles.title}>Org Registration</Text>
                </View>
                <Text style={commonStyles.tagLine}>Register your company to start hiring</Text>              
                
                <EditText
                    label={"Organization Name *"}
                    placeholder={"Enter Company Name"}
                    onChangeText={setName}
                />

                <EditText
                    label={"Official Email *"}
                    placeholder={"admin@company.com"}
                    onChangeText={setEmail}
                />

                <EditText
                    label={"Website"}
                    placeholder={"https://www.company.com"}
                    onChangeText={setWebsite}
                />

                <EditText
                    label={"Description"}
                    placeholder={"Brief about your company"}
                    onChangeText={setDescription}
                />

                <EditText
                    label={"Password *"}
                    placeholder={"Enter Password"}
                    onChangeText={setPassword}
                    isPassword={true}
                />

                <EditText
                    label={"Confirm Password *"}
                    placeholder={"Re-enter Password"}
                    onChangeText={setConPassword}
                    isPassword={true}
                />

                <View style={styles.loginHereContainer}>
                    <Text style={styles.text}>Already registered? </Text>
                    <TouchableOpacity onPress={onLogin}>
                        <Text style={styles.loginHere}>Login here</Text>
                    </TouchableOpacity>
                </View>

                <Button 
                    onPress={handleRegister}
                    title={loading ? 'Processing...' : 'Register Organization'}
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
        fontSize: 18,
        padding: 15,
        borderRadius: 8,
        elevation: 5,
    },
    loginHere: {
        color: theme.primary,
        fontSize: 16,
        fontWeight: 'bold',
    },
    loginHereContainer: {
        justifyContent: 'center',
        marginTop: 10,
        flexDirection: 'row',
    },
    text: {
        color: theme.black,
        fontSize: 16,
    },
});

export default Register;