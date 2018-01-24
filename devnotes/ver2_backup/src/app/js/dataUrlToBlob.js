/**
 * A Blob object represents a file-like object of immutable, raw data. 
 * Blobs represent data that isn't necessarily in a JavaScript-native format.
 * The File interface is based on Blob, inheriting blob functionality and expanding 
 * it to support files on the user's system.
 * 
 * https://developer.mozilla.org/en-US/docs/Web/API/Blob
 * 
 * http://stackoverflow.com/questions/6850276/how-to-convert-dataurl-to-file-object-in-javascript
 * 
 */
function dataURLtoBlob(dataurl) {
    var arr = dataurl.split(','), mime = arr[0].match(/:(.*?);/)[1],
        bstr = atob(arr[1]), n = bstr.length, u8arr = new Uint8Array(n);
    while(n--){
        u8arr[n] = bstr.charCodeAt(n);
    }
    return new Blob([u8arr], {type:mime});
}

module.exports = {
    DataUrlToBlob: dataURLtoBlob
};
