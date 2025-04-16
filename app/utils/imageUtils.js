// app/utils/imageUtils.js
const FileSystem = require("expo-file-system");
const ImageManipulator = require("expo-image-manipulator");

/**
 * Compresses an image to reduce its size before upload
 * @param {string} uri - The URI of the image to compress
 * @param {number} quality - Quality of the compressed image (0 to 1)
 * @param {number} maxWidth - Maximum width of the image
 * @returns {Promise<string>} The URI of the compressed image
 */
export const compressImage = async (uri, quality = 0.7, maxWidth = 800) => {
    try {
        // Get the original image info
        const fileInfo = await FileSystem.getInfoAsync(uri);
        console.log("Original image size:", fileInfo.size);

        // If image is already small enough, return it as is
        if (fileInfo.size < 500 * 1024) {
            // Less than 500KB
            console.log("Image is already small enough, skipping compression");
            return uri;
        }

        // Compress the image
        const result = await ImageManipulator.manipulateAsync(
            uri,
            [{ resize: { width: maxWidth } }],
            { compress: quality, format: ImageManipulator.SaveFormat.JPEG }
        );

        // Get the compressed image info
        const compressedInfo = await FileSystem.getInfoAsync(result.uri);
        console.log("Compressed image size:", compressedInfo.size);
        console.log("Compression ratio:", fileInfo.size / compressedInfo.size);

        return result.uri;
    } catch (error) {
        console.error("Error compressing image:", error);
        // Return the original URI if compression fails
        return uri;
    }
};

/**
 * Converts an image URI to a Blob object for Firebase Storage upload
 * @param {string} uri - The URI of the image
 * @returns {Promise<Blob>} A Blob representation of the image
 */
export const uriToBlob = async (uri) => {
    try {
        const response = await fetch(uri);
        const blob = await response.blob();
        return blob;
    } catch (error) {
        console.error("Error converting URI to blob:", error);
        throw error;
    }
};

export default {
    compressImage,
    uriToBlob,
};
