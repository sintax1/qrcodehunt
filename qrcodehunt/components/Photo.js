import RNFetchBlob from 'rn-fetch-blob';

const createFormData = (photo, data) => {
    const formdata = [];
  
    const b64data = RNFetchBlob.wrap(photo.uri);
  
    formdata.push({
      name : 'photo',
      filename : 'hint.jpg',
      type:'image/jpeg',
      data: b64data
    });
  
    Object.keys(data).forEach(key => {
        formdata.push({name: key, data: data[key]});
    });
  
    return formdata;
};

exports.handleUploadPhoto = (photo, data) => {
    return new Promise((resolve, reject) => {
        console.log('handleUploadPhoto: ' + JSON.stringify(photo));

        RNFetchBlob.fetch('POST', 'http://192.168.7.253:3000/api/photo/upload', {
        //RNFetchBlob.fetch('POST', 'http://192.168.7.62:3000/api/photo/upload', {
        'Content-Type': 'multipart/form-data',
        },
        createFormData(photo, {
            data: JSON.stringify(data)
        })
        )
        .then(response => response.json())
        .then(response => {
            resolve({
                success: true,
                response: response
            });
        })
        .catch(error => {
            console.log('upload error', error);
            reject({
                success: false,
                error: error
            });
        });
    });
  };