import React, { useState, useRef } from 'react';
import { View, StyleSheet } from 'react-native';
import { RNCamera } from 'react-native-camera';
import Icon from 'react-native-vector-icons/Ionicons';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import FontAwesome5 from 'react-native-vector-icons/FontAwesome5';
import CameraRoll from "@react-native-community/cameraroll";
import { MButton } from './MButton'

const MCamera = props => {
    const { camerPhotoTile,cameraVideoTitle,cameraCancelTitle,maxVideoLen ,videoQuality} = props.config
    const camera = useRef(null);
    const [type, setType] = useState(RNCamera.Constants.Type.front);
    const [flash, setFlash] = useState(RNCamera.Constants.FlashMode.off);
    const [flashIcon, setFlashIcon] = useState("flash-off");
    const [assestType, setAssestType] = useState("photo")
    const [videoBtn, setVideoBtn] = useState("start")
    const toggleCamera = () => {
        setType(
            type === RNCamera.Constants.Type.back
                ? RNCamera.Constants.Type.front
                : RNCamera.Constants.Type.back
        );
    }

    const toggleFlashMode = () => {
        switch (flash) {
            case RNCamera.Constants.FlashMode.off:
                setFlash(RNCamera.Constants.FlashMode.on);
                setFlashIcon("flash-on")
                break;
            case RNCamera.Constants.FlashMode.on:
                setFlash(RNCamera.Constants.FlashMode.auto);
                setFlashIcon("flash-auto")
                break;
            case RNCamera.Constants.FlashMode.auto:
                setFlash(RNCamera.Constants.FlashMode.off);
                setFlashIcon("flash-off")
                break;
            default:
                setFlash(RNCamera.Constants.FlashMode.off);
                setFlashIcon("flash-off")
                break;
        }
    }

    const takePhoto = async () => {
        if (camera.current) {
            let photo = await camera.current.takePictureAsync();
            const sres = await CameraRoll.save(photo.uri);
            props.onPhotoTaked({ type: "photo", assest: { uri: sres } });
        }
    }

    const stopRecording = () => {
        camera.current.stopRecording();
        setVideoBtn("start")

    }

    const recordStart = async () => {
        if (camera.current) {
            setVideoBtn("stop")
            let video = await camera.current.recordAsync({ quality: RNCamera.Constants.VideoQuality[videoQuality], maxDuration: maxVideoLen });
            const sres = await CameraRoll.save(video.uri);
            props.onPhotoTaked({ type: "video", assest: { uri: sres } });
        }
    }


    return (
        <View style={[styles.container]}>
            <View style={styles.flashContainer}>
                <MButton
                    onPress={toggleFlashMode}
                    style={{ backgroundColor: 'transparent' }}
                    textSyle={{ color: "blue" }}
                >
                    <MaterialIcons name={flashIcon} size={24} color="white" />
                </MButton>

            </View>
            <RNCamera
                ref={camera}
                type={type}
                flashMode={flash}
                style={[{ flex: 1, width: '100%', justifyContent: 'center', alignItems: 'center' }]} >
            </RNCamera>
            <View style={{ backgroundColor: 'black' }}>
                <View style={styles.assestTypeContainer}>
                    <MButton
                        onPress={() => { setAssestType("photo") }}
                        style={{ backgroundColor: 'black' }}
                        textSyle={{ color: assestType !== "photo" ? "gray" : "yellow" }}
                        title={camerPhotoTile} />
                    <MButton
                        onPress={() => { setAssestType("video") }}
                        style={{ backgroundColor: 'black' }}
                        textSyle={{ color: assestType === "photo" ? "gray" : "yellow" }}
                        title={cameraVideoTitle} />
                </View>
                <View style={styles.footerContainer}>
                    <MButton
                        onPress={props.onCancle}
                        style={{ backgroundColor: 'black' }}
                        textSyle={{ color: "gray" }}
                        title={cameraCancelTitle} />

                    {assestType == "photo" ? <MButton
                        onPress={takePhoto}
                        style={{ backgroundColor: 'black', height: 100, paddingRight: 10 }}
                        textSyle={{ color: "blue" }}
                    >
                        <Icon name="ios-radio-button-on" size={75} color="white" />
                    </MButton> :
                        <MButton
                            onPress={videoBtn == "start" ? recordStart : stopRecording}
                            style={{ backgroundColor: 'black', height: 100, paddingRight: 10 }}
                            textSyle={{ color: "blue" }}
                        >
                            {videoBtn == "start" ? <Icon name="ios-radio-button-on" size={75} color="red" /> :
                                <FontAwesome5 name="stop-circle" size={75} color="red" />
                            }
                        </MButton>
                    }
                    <MButton
                        onPress={toggleCamera}
                        style={{ backgroundColor: 'black' }}
                        textSyle={{ color: "blue" }}
                    >
                        <Icon name="md-reverse-camera" size={40} color="white" />
                    </MButton>

                </View>
            </View>
        </View>
    )

}

export default MCamera;

const styles = StyleSheet.create({
    container: {
        backgroundColor: 'black',
        flex: 1,
        width: '100%'
    },
    flashContainer: {
        justifyContent: 'center',
        alignItems: 'flex-start',
        width: '100%',
        paddingRight: 10,
        paddingLeft: 10,
        position: 'absolute',
        top: 10,
        right: 0,
        left: 0,
        zIndex: 1

    },
    footerContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        width: '100%',
        paddingRight: 25,
        paddingLeft: 25,

    },
    assestTypeContainer: {
        backgroundColor: 'transparent',
        width: 100,
        flexDirection: 'row',
        justifyContent: 'space-evenly',
        alignItems: 'center',
        width: '100%',

    }

})

