import React from 'react';
import { TextInput, StyleSheet } from 'react-native';
// import colors from '../styles/colors';

export const MyTextInput = ({ placeholder, onChangeText, value, autoCapitalize = 'sentences' }) => {
    return (
        <TextInput
            style={styles.input}
            placeholder={placeholder}
            onChangeText={onChangeText}
            value={value}
            autoCapitalize={autoCapitalize}
            // selectionColor={colors.alt}
        />
    );
};

const styles = StyleSheet.create({
    input: {
        height: 40,
        width: '80%',
        // borderColor: colors.alt,
        borderBottomWidth: 1.5,
        // backgroundColor: colors.secondaryPink,
        borderTopEndRadius: 10,
        borderTopStartRadius: 10,
        // textDecorationColor: colors.alt,
        margin: 6,
        padding: 10,
    },
});

export default MyTextInput;

