import React from 'react';
import { TouchableOpacity, Text } from 'react-native';

export const MyButton = ({ onPress, text, style, textStyle }) => {
    return (
        <TouchableOpacity style={{
            backgroundColor: "lightblue",
            padding: 10,
            borderRadius: 6,
            width: 100,
            ...style
        }}
            onPress={onPress}>
            <Text style={{textAlign: 'center', ...textStyle}}>{text}</Text>
        </TouchableOpacity>
    );
};

export default MyButton;
