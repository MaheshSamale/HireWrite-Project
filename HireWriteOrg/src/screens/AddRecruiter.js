import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Alert, TouchableOpacity, KeyboardAvoidingView, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import EditText from '../components/EditText';
import Button from '../components/Button';
import commonStyles from '../../style/style'; // Keeping your path
import { theme } from '../../style/theme';
import { addRecruiter } from '../../services/organizationServices';

export default function AddRecruiter({ navigation }) {
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [mobile, setMobile] = useState("");
    const [position, setPosition] = useState("");
    const [loading, setLoading] = useState(false);

    const handleAddRecruiter = async () => {
        if (!name || !email || !mobile || !position) {
            return Alert.alert("Missing Information", "Please fill in all the details to continue.");
        }

        try {
            setLoading(true);
            const response = await addRecruiter(email, mobile, name, position);
            setLoading(false);

            if (response.status === 'success') {
                Alert.alert(
                    "🎉 Success!", 
                    `Recruiter added successfully.\n\nShare these credentials:\nPassword: ${response.data.login_credentials.default_password}`,
                    [{ text: "Done", onPress: () => navigation.goBack() }]
                );
            } else {
                Alert.alert("Failed", response.error || "Could not add recruiter");
            }
        } catch (error) {
            setLoading(false);
            Alert.alert("Error", "An unexpected error occurred");
            console.error(error);
        }
    };

    const LabelWithIcon = ({ icon, label }) => (
        <View style={styles.labelContainer}>
            <Ionicons name={icon} size={18} color={theme.primary} style={{ marginRight: 6 }} />
            <Text style={styles.labelText}>{label}</Text>
        </View>
    );

    return (
        <KeyboardAvoidingView 
            behavior={Platform.OS === "ios" ? "padding" : "height"} 
            style={styles.container}
        >
            <View style={styles.headerBackground}>
                <View style={styles.headerContent}>
                    <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                        <Ionicons name="arrow-back" size={24} color="white" />
                    </TouchableOpacity>
                    <Text style={styles.screenTitle}>Add Team Member</Text>
                </View>
            </View>

            <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
                {/* Intro Section */}
                <View style={styles.introContainer}>
                    <View style={styles.iconCircle}>
                        <Ionicons name="person-add" size={32} color={theme.primary} />
                    </View>
                    <Text style={styles.introTitle}>New Recruiter</Text>
                    <Text style={styles.introText}>
                        Create an account for your hiring manager. They will receive a default password.
                    </Text>
                </View>

                {/* Form Card */}
                <View style={[commonStyles.card, styles.formCard]}>
                    
                    <View style={styles.inputGroup}>
                        <LabelWithIcon icon="person-outline" label="Full Name" />
                        <EditText 
                            placeholder="ex. Sarah Jones" 
                            onChangeText={setName} 
                            value={name}
                        />
                    </View>
                    
                    <View style={styles.inputGroup}>
                        <LabelWithIcon icon="mail-outline" label="Email Address" />
                        <EditText 
                            placeholder="ex. sarah@company.com" 
                            onChangeText={setEmail}
                            keyboardType="email-address"
                            value={email}
                        />
                    </View>

                    <View style={styles.inputGroup}>
                        <LabelWithIcon icon="call-outline" label="Mobile Number" />
                        <EditText 
                            placeholder="ex. 9876543210" 
                            onChangeText={setMobile}
                            keyboardType="phone-pad"
                            value={mobile}
                        />
                    </View>

                    <View style={styles.inputGroup}>
                        <LabelWithIcon icon="briefcase-outline" label="Position / Role" />
                        <EditText 
                            placeholder="ex. Senior HR Manager" 
                            onChangeText={setPosition} 
                            value={position}
                        />
                    </View>

                    <Button 
                        title={loading ? "Creating Account..." : "Create Account"} 
                        onPress={handleAddRecruiter}
                        marginTop={25}
                        disabled={loading}
                    />

                    <TouchableOpacity 
                        style={styles.cancelButton} 
                        onPress={() => navigation.goBack()}
                        disabled={loading}
                    >
                        <Text style={styles.cancelText}>Cancel</Text>
                    </TouchableOpacity>
                </View>
            </ScrollView>
        </KeyboardAvoidingView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F5F7FA', // Light gray background for contrast
    },
    headerBackground: {
        backgroundColor: theme.primary,
        height: 120,
        paddingTop: 50,
        paddingHorizontal: 20,
        borderBottomLeftRadius: 30,
        borderBottomRightRadius: 30,
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        zIndex: 1,
    },
    headerContent: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    backButton: {
        marginRight: 15,
    },
    screenTitle: {
        color: 'white',
        fontSize: 20,
        fontWeight: 'bold',
    },
    scrollContent: {
        paddingTop: 130, // Push content down below the header
        paddingBottom: 40,
        paddingHorizontal: 16,
    },
    introContainer: {
        alignItems: 'center',
        marginBottom: 20,
    },
    iconCircle: {
        width: 60,
        height: 60,
        borderRadius: 30,
        backgroundColor: 'white',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 10,
        elevation: 4,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
    },
    introTitle: {
        fontSize: 22,
        fontWeight: 'bold',
        color: theme.black,
        marginBottom: 5,
    },
    introText: {
        fontSize: 14,
        color: 'gray',
        textAlign: 'center',
        paddingHorizontal: 20,
        lineHeight: 20,
    },
    formCard: {
        backgroundColor: 'white',
        borderRadius: 20,
        padding: 20,
        elevation: 5, // Stronger shadow for Android
        shadowColor: '#000', // IOS shadow
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 10,
    },
    inputGroup: {
        marginBottom: 5,
    },
    labelContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 5,
        marginLeft: 4,
    },
    labelText: {
        fontSize: 14,
        fontWeight: '600',
        color: theme.black,
    },
    cancelButton: {
        marginTop: 8,
        alignItems: 'center',
        padding: 10,
    },
    cancelText: {
        color: 'gray',
        fontSize: 16,
        fontWeight: '500',
    }
});