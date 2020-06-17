
import React from 'react';

import {
    View,
    Text,
    TouchableOpacity,
    StyleSheet,
} from 'react-native';

export const MButton = props => {

    if (props.isLoading) {
        return (
            <View {...props} style={{ ...MStyles.buttonContainer, ...props.style }} >
                <ActivityIndicator size='small' color={props.color ? props.color : 'white'} />
            </View>
        )
    }
    return (
        <TouchableOpacity {...props} style={{ ...MStyles.buttonContainer, ...props.style }} >
            {props.title ? <Text style={{ ...MStyles.buttonText, ...props.textSyle }} >{props.title}</Text>
                : props.children
            }
        </TouchableOpacity>
    )
}


export const MStyles = StyleSheet.create({
    buttonContainer: {
        backgroundColor: "blue",
        justifyContent: 'center',
        alignItems: 'center',
        height: 50,
        borderRadius: 5,
    },
    buttonText: {
        color: 'white',
        textAlign: 'center'
    }
})


