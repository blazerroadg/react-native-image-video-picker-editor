import React, { PureComponent } from 'react'
import Icon from 'react-native-vector-icons/AntDesign'
import {
    Text,
    StyleSheet,
    View,
    Dimensions,
    ImageBackground,
    TouchableHighlight,
} from 'react-native'

const { width } = Dimensions.get('window')
class MImageTitle extends PureComponent {
    render() {
        const { item, index, selected, selectImage, selectedItemCount, singleSelect, paddingTop } = this.props
        const pad = index < 4 ? paddingTop : 0;
        if (!item) return null
        return (
            <TouchableHighlight
                style={{ opacity: selected ? 0.8 : 1, paddingTop: pad, margin: 1, backgroundColor: "#ccc" }}
                underlayColor='transparent'
                onPress={() => { if (selected && singleSelect) return; selectImage(index) }} >
                <View style={{ position: 'relative' }}>
                    <View style={styles.container}>
                        <ImageBackground
                            style={styles.item}
                            source={{
                                uri: item.node.image.uri,
                                cache: 'force-cache'
                            }} >
                            {
                                !singleSelect && <>
                                    <View style={selectedItemCount > 0 ? styles.countBadgeSelected : styles.countBadge}>
                                        <Text style={styles.countBadgeText}>{selectedItemCount > 0 ? selectedItemCount : null}</Text>
                                    </View>
                                    {item.node.image.playableDuration > 0 && <View style={styles.duration}>
                                        <Icon name="play" size={24} color="white" />
                                    </View>}
                                </>
                            }

                        </ImageBackground>
                    </View>
                </View>
            </TouchableHighlight>
        )
    }
}
export default MImageTitle;


const styles = StyleSheet.create({
    container: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        width: '100%',

    },
    item: {
        width: (width / 4 - 2),
        height: (width / 4 - 2),
    },
    countBadge: {
        width: 24,
        height: 24,
        borderRadius: 12,
        position: 'absolute',
        left: 3,
        top: 3,
        justifyContent: 'center',
        backgroundColor: 'rgba(255,255,255,0.6)',
        borderWidth: 1,
        borderColor: 'white',
        alignItems: 'center'

    },
    duration: {
        color: 'white',
        position: 'absolute',
        justifyContent: 'center',
        alignItems: 'center',
        bottom: 0,
        right: 3
    },
    countBadgeSelected: {
        width: 24,
        height: 24,
        borderRadius: 12,
        left: 3,
        top: 3,
        justifyContent: 'center',
        backgroundColor: 'rgba(0,134,4,0.9)',
        borderWidth: 1,
        borderColor: 'white',
        alignItems: 'center'

    },
    countBadgeText: {
        color: 'white',
        fontWeight: 'bold',
        alignSelf: 'center',
        padding: 'auto',
        textAlign: 'center',
        fontSize: 10,
        width: '100%'
    }
})