import { StyleSheet } from "react-native";
import { theme } from "./theme";

const commonStyles = StyleSheet.create({
  container: {
    fontSize: theme.fontSize.title,
    fontWeight: '600',
    color: theme.black,
    fontFamily: theme.fontFamily,
  },
  tagLine: {
    marginBottom: 10,
    textAlign: 'center',
    fontWeight: 'bold',
    fontSize: theme.fontSize.base,
    color: theme.black,
    fontFamily: theme.fontFamily,
  },
  card: {
    backgroundColor: theme.darkGray,
    padding: 16,
    borderRadius: 15,
    elevation: 8,
  }
});

export default commonStyles;
