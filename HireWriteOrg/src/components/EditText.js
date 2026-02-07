import { StyleSheet, Text, TextInput, View } from 'react-native'
import { theme } from '../../style/theme'

function EditText({
  marginTop,
  label,
  placeholder,
  onChangeText,
  isPassword = false,
  value,
}) {
  return (
    <View style={[styles.container, { marginTop: marginTop ? marginTop : 0 }]}>
      <Text style={styles.text}>{label}</Text>
      <TextInput
        secureTextEntry={isPassword}
        style={styles.input}
        placeholder={placeholder}
        placeholderTextColor="darkgrey" 
        onChangeText={onChangeText}
        value={value}
      />
    </View>
  )
}

const styles = StyleSheet.create({
  container: {},
  text: {
    fontWeight: 700,
    fontFamily: '--text-sm',
    color:theme.black
  },
  input: {
    paddingLeft:15,
    backgroundColor: theme.white,
    borderRadius: 5,
    borderColor: theme.lightGray,
    borderStyle: 'solid',
    borderWidth: 1,
    marginTop: 8,
    marginBottom:10,
    paddingHorizontal: 15,
    elevation:5,
  },
})

export default EditText
