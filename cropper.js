import { Platform, Dimensions } from 'react-native'
import RNVideoHelper from 'react-native-video-helper';
import ImageEditor from '@react-native-community/image-editor'
const { width } = Dimensions.get('window')

export const VidoUri = (video) => {
    let videoUri = video.uri;
    if (Platform.OS === "ios" && !videoUri.includes("file:///")) {
        const appleId = video.uri.substring(5, 41);
        const fil = video.filename.split('.');
        const ext = fil[1];
        videoUri = `assets-library://asset/asset.${ext}?id=${appleId}&ext=${ext}`;
    }
    return videoUri;
}



const getPercentFromNumber = (percent, numberFrom) => {
    return (numberFrom / 100) * percent;
};

const getPercentDiffNumberFromNumber = (number, numberFrom) => { return (number / numberFrom) * 100; };

const setSize = (image) => {

    const imageWidth = image.width;
    const imageHeight = image.height;
    const cropWidth = width;
    const cropHeight = width;

    const areaWidth = cropWidth;
    const areaHeight = cropHeight;

    const srcSize = { width: imageWidth, height: imageHeight };
    const fittedSize = { width: 0, height: 0 };
    let scale = 1;

    if (imageWidth > imageHeight) {
        const ratio = width / imageHeight;
        fittedSize.width = imageWidth * ratio;
        fittedSize.height = width;
    } else if (imageWidth < imageHeight) {
        const ratio = width / imageWidth;
        fittedSize.width = width;
        fittedSize.height = imageHeight * ratio;
    } else if (imageWidth === imageHeight) {
        fittedSize.width = width;
        fittedSize.height = width;
    }

    if (areaWidth < areaHeight || areaWidth === areaHeight) {
        if (imageWidth < imageHeight) {
            if (fittedSize.height < areaHeight) {
                scale = Math.ceil((areaHeight / fittedSize.height) * 10) / 10;
            } else {
                scale = Math.ceil((areaWidth / fittedSize.width) * 10) / 10;
            }
        } else {
            scale = Math.ceil((areaHeight / fittedSize.height) * 10) / 10;
        }
    }
    scale = scale < 1 ? 1 : scale;

    return {
        scale,
        srcSize,
        fittedSize,
    };
};


export const ImageCropper = async (params) => {
    var positionX = params.cropperParams.positionX, positionY = params.cropperParams.positionY, scale = params.cropperParams.scale, image = params.image, cropSize = params.cropSize, cropAreaSize = params.cropAreaSize;
    if (!positionX) positionX = 0;
    if (!positionY) positionY = 0;
    const exp = setSize(image);
    var srcSize = exp.srcSize, fittedSize = exp.fittedSize;
    var offset = {
        x: 0,
        y: 0,
    };
    var cropAreaW = cropAreaSize ? cropAreaSize.width : width;
    var cropAreaH = cropAreaSize ? cropAreaSize.height : width;
    var wScale = cropAreaW / scale;
    var hScale = cropAreaH / scale;
    var percentCropperAreaW = getPercentDiffNumberFromNumber(wScale, fittedSize.width);
    var percentRestW = 100 - percentCropperAreaW;
    var hiddenAreaW = getPercentFromNumber(percentRestW, fittedSize.width);
    var percentCropperAreaH = getPercentDiffNumberFromNumber(hScale, fittedSize.height);
    var percentRestH = 100 - percentCropperAreaH;
    var hiddenAreaH = getPercentFromNumber(percentRestH, fittedSize.height);
    var x = hiddenAreaW / 2 - positionX;
    var y = hiddenAreaH / 2 - positionY;
    offset.x = x <= 0 ? 0 : x;
    offset.y = y <= 0 ? 0 : y;
    var srcPercentCropperAreaW = getPercentDiffNumberFromNumber(offset.x, fittedSize.width);
    var srcPercentCropperAreaH = getPercentDiffNumberFromNumber(offset.y, fittedSize.height);
    var offsetW = getPercentFromNumber(srcPercentCropperAreaW, srcSize.width);
    var offsetH = getPercentFromNumber(srcPercentCropperAreaH, srcSize.height);
    var sizeW = getPercentFromNumber(percentCropperAreaW, srcSize.width);
    var sizeH = getPercentFromNumber(percentCropperAreaH, srcSize.height);
    offset.x = Math.floor(offsetW);
    offset.y = Math.floor(offsetH);
    var cropData = {
        offset: offset,
        size: {
            width: Math.round(sizeW),
            height: Math.round(sizeH),
        },
        displaySize: {
            width: Math.round(cropSize.width),
            height: Math.round(cropSize.height),
        },
    };


    return await ImageEditor.cropImage(image.uri, cropData);
};
export const HandleCrop = async (param) => {

    const { selected, photos, cropperParams, cropSize, HEADER_MAX_HEIGHT } = param;
    let { videoMaxLen, videoQuality } = param;
    videoMaxLen = videoMaxLen ? videoMaxLen : 0;
    videoQuality = videoQuality ? videoQuality : "low"

    const cropAreaSize = {
        width: HEADER_MAX_HEIGHT,
        height: HEADER_MAX_HEIGHT,
    };
    try {
        let result = [];
        await Promise.all(selected.map(async t => {
            const image = photos[t].node.image;
            const videoUri = VidoUri(image);
            if (image.playableDuration > 0) {
                try {
                    const vr = await RNVideoHelper.compress(videoUri, {
                        startTime: 0,
                        endTime: videoMaxLen,
                        quality: videoQuality,
                        defaultOrientation: 0
                    });
                    result.push({ type: 'video', assest: vr })
                } catch (error) {
                    console.log(error);
                }
            }
            else {
                const crpIndex = cropperParams.findIndex(t => t.filename == image.filename);
                let crp = { scale: 1, positionX: 0, positionY: 0 };
                if (crpIndex !== -1) {
                    crp = cropperParams[crpIndex].cropperParams
                }
                const eresult = await ImageCropper({
                    cropperParams: crp,
                    image: image,
                    cropSize,
                    cropAreaSize,
                });
                result.push({ type: 'photo', assest: eresult })
            }
        }))
        return result;

    } catch (error) {
        console.log(error);
    }
};