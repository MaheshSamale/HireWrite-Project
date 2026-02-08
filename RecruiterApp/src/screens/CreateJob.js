import React, { useState } from 'react';
import { 
    ScrollView, 
    StyleSheet, 
    Text, 
    View, 
    Alert, 
    TouchableOpacity, 
    ActivityIndicator,
    KeyboardAvoidingView,
    Platform
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import EditText from '../components/EditText';
import Button from '../components/Button';
import { createJob, generateJobDescription } from '../../services/recruiterService';
import { theme } from '../../style/theme';

const initialFormState = {
    title: '',
    location_type: 'remote',
    employment_type: 'full-time',
    experience_min: '',
    experience_max: '',
    skills_required_str: '',
    skills_preferred_str: '',
    jd_text: ''
};

export default function CreateJob({ navigation }) {
    const [form, setForm] = useState(initialFormState);
    const [loading, setLoading] = useState(false);
    const [generating, setGenerating] = useState(false);

    const handleGenerateAI = async () => {
        if (!form.title || !form.skills_required_str) {
            return Alert.alert("Missing Info", "Please enter Job Title and Required Skills first.");
        }

        setGenerating(true);
        try {
            const requestData = {
                title: form.title,
                location_type: form.location_type,
                employment_type: form.employment_type,
                experience_min: form.experience_min,
                experience_max: form.experience_max,
                skills_required: form.skills_required_str,
                skills_preferred: form.skills_preferred_str
            };

            const res = await generateJobDescription(requestData);
            
            if (res && (res.status === 'success' || res.data?.jd_text)) {
                const aiText = res.data?.jd_text || res.jd_text;
                setForm(prev => ({ ...prev, jd_text: aiText }));
            } else {
                Alert.alert("Notice", "AI could not generate text. Please enter it manually.");
            }
        } catch (error) {
            Alert.alert("Error", "Failed to connect to AI service.");
        } finally {
            setGenerating(false);
        }
    };

    const handlePost = async () => {
        if (!form.title || !form.jd_text || !form.skills_required_str) {
            return Alert.alert("Required Fields", "Please fill Title, Required Skills, and Description");
        }

        setLoading(true);
        const requestBody = {
            ...form,
            experience_min: parseInt(form.experience_min) || 0,
            experience_max: parseInt(form.experience_max) || 0,
            skills_required_json: form.skills_required_str.split(',').map(s => s.trim()).filter(Boolean),
            skills_preferred_json: form.skills_preferred_str.split(',').map(s => s.trim()).filter(Boolean),
        };

        try {
            const res = await createJob(requestBody);
            if (res.status === 'success') {
                Alert.alert("Success 🎉", "Your job has been posted successfully!");
                setForm(initialFormState);
                navigation.navigate('My Jobs');
            }
        } catch (error) {
            Alert.alert("Error", "Something went wrong. Please check your connection.");
        } finally {
            setLoading(false);
        }
    };

    const SectionHeader = ({ icon, title, showAiButton }) => (
        <View style={styles.sectionHeaderContainer}>
            <View style={styles.sectionHeaderLeft}>
                <Ionicons name={icon} size={18} color={theme.primary} />
                <Text style={styles.sectionTitle}>{title}</Text>
            </View>
            {showAiButton && (
                <TouchableOpacity 
                    style={[styles.aiButton, generating && { opacity: 0.6 }]} 
                    onPress={handleGenerateAI}
                    disabled={generating}
                >
                    {generating ? (
                        <ActivityIndicator size="small" color={theme.primary} />
                    ) : (
                        <>
                            <Ionicons name="sparkles" size={14} color={theme.primary} />
                            <Text style={styles.aiButtonText}>AI Generate</Text>
                        </>
                    )}
                </TouchableOpacity>
            )}
        </View>
    );

    return (
        <KeyboardAvoidingView 
            behavior={Platform.OS === "ios" ? "padding" : "height"}
            style={styles.mainContainer}
        >
            {/* Sticky Header */}
            <View style={styles.screenHeader}>
                <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
                    <Ionicons name="arrow-back" size={24} color={theme.black} />
                </TouchableOpacity>
                <Text style={styles.headerText}>Post New Vacancy</Text>
                <View style={{ width: 40 }} /> 
            </View>

            <ScrollView 
                showsVerticalScrollIndicator={false} 
                contentContainerStyle={styles.scrollContent}
                keyboardShouldPersistTaps="handled"
            >
                <View style={styles.card}>
                    <SectionHeader icon="information-circle-outline" title="Basic Details" />
                    <EditText 
                        label="Job Title *" 
                        placeholder="e.g. Senior Frontend Developer" 
                        value={form.title} 
                        onChangeText={(val) => setForm({...form, title: val})} 
                    />

                    <SectionHeader icon="location-outline" title="Job Logistics" />
                    <View style={styles.row}>
                        <View style={{ flex: 1, marginRight: 10 }}>
                            <EditText 
                                label="Location" 
                                placeholder="remote/hybrid" 
                                value={form.location_type} 
                                onChangeText={(val) => setForm({...form, location_type: val})} 
                            />
                        </View>
                        <View style={{ flex: 1 }}>
                            <EditText 
                                label="Employment" 
                                placeholder="full-time" 
                                value={form.employment_type} 
                                onChangeText={(val) => setForm({...form, employment_type: val})} 
                            />
                        </View>
                    </View>

                    <SectionHeader icon="ribbon-outline" title="Experience" />
                    <View style={styles.row}>
                        <View style={{ flex: 1, marginRight: 10 }}>
                            <EditText 
                                label="Min Years" 
                                placeholder="0" 
                                keyboardType="numeric" 
                                value={form.experience_min} 
                                onChangeText={(val) => setForm({...form, experience_min: val})} 
                            />
                        </View>
                        <View style={{ flex: 1 }}>
                            <EditText 
                                label="Max Years" 
                                placeholder="5" 
                                keyboardType="numeric"
                                value={form.experience_max} 
                                onChangeText={(val) => setForm({...form, experience_max: val})} 
                            />
                        </View>
                    </View>

                    <SectionHeader icon="code-slash-outline" title="Skills" />
                    <EditText 
                        label="Required Skills *" 
                        placeholder="React, JavaScript..." 
                        value={form.skills_required_str} 
                        onChangeText={(val) => setForm({...form, skills_required_str: val})} 
                    />
                    <EditText 
                        label="Preferred Skills" 
                        placeholder="TypeScript, Docker..." 
                        value={form.skills_preferred_str} 
                        onChangeText={(val) => setForm({...form, skills_preferred_str: val})} 
                    />

                    <SectionHeader 
                        icon="document-text-outline" 
                        title="Description *" 
                        showAiButton={true} 
                    />
                    <View style={styles.textAreaContainer}>
                        <EditText 
                            placeholder="Tell candidates about the role..." 
                            multiline={true} 
                            numberOfLines={8}
                            value={form.jd_text} 
                            onChangeText={(val) => setForm({...form, jd_text: val})} 
                            style={styles.textArea}
                        />
                    </View>
                </View>

                <Button 
                    title={loading ? "Publishing..." : "Publish Job Posting"} 
                    onPress={handlePost} 
                    marginTop={20} 
                />
                <View style={{ height: 40 }} />
            </ScrollView>
        </KeyboardAvoidingView>
    );
}

const styles = StyleSheet.create({
    mainContainer: {
        flex: 1,
        backgroundColor: '#F0F2F5',
    },
    screenHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingTop: Platform.OS === 'ios' ? 60 : 40,
        paddingBottom: 15,
        paddingHorizontal: 15,
        backgroundColor: 'white',
        borderBottomWidth: 1,
        borderBottomColor: '#E0E0E0',
    },
    backBtn: {
        padding: 5,
    },
    headerText: {
        flex: 1,
        textAlign: 'center',
        fontSize: 18,
        fontWeight: 'bold',
        color: theme.black,
    },
    scrollContent: {
        padding: 15,
    },
    card: {
        backgroundColor: 'white',
        borderRadius: 15,
        padding: 15,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    sectionHeaderContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginTop: 15,
        marginBottom: 8,
    },
    sectionHeaderLeft: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    sectionTitle: {
        fontSize: 13,
        fontWeight: 'bold',
        color: '#777',
        marginLeft: 6,
        textTransform: 'uppercase',
    },
    aiButton: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#F0F2FF',
        paddingHorizontal: 10,
        paddingVertical: 5,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: theme.primary,
    },
    aiButtonText: {
        color: theme.primary,
        fontSize: 11,
        fontWeight: 'bold',
        marginLeft: 4,
    },
    row: {
        flexDirection: 'row',
    },
    textAreaContainer: {
        marginTop: 5,
    },
    textArea: {
        textAlignVertical: 'top', 
        minHeight: 120,
        paddingTop: 10,
    }
});