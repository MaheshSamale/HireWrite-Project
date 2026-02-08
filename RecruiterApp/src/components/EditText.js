import { StyleSheet, Text, TextInput, View } from 'react-native'
import { theme } from '../../style/theme'

function EditText({
  marginTop,
  label,
  placeholder,
  onChangeText,
  isPassword = false,
  value,
  multiline = false, // Added for Job Descriptions
  numberOfLines = 1,
}) {
  return (
    <View style={[styles.container, { marginTop: marginTop ? marginTop : 0 }]}>
      <Text style={styles.text}>{label}</Text>
      <TextInput
        secureTextEntry={isPassword}
        style={[styles.input, multiline && { height: 100, textAlignVertical: 'top' }]}
        placeholder={placeholder}
        placeholderTextColor="darkgrey" 
        onChangeText={onChangeText}
        value={value}
        multiline={multiline}
        numberOfLines={numberOfLines}
      />
    </View>
  )
}

const styles = StyleSheet.create({
  text: {
    fontWeight: '700',
    color: theme.black
  },
  input: {
    paddingLeft: 15,
    backgroundColor: theme.white,
    borderRadius: 5,
    borderColor: theme.lightGray,
    borderWidth: 1,
    marginTop: 8,
    marginBottom: 10,
    paddingHorizontal: 15,
    elevation: 5,
  },
})

export default EditText