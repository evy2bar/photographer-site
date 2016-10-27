/**
 * Created by raul on 10/24/16.
 */

var FirebaseManager = {

    // Create a storage reference from our storage service
    storageRef: firebase.storage().ref(),

    getListOfClients: function() {
        return firebase.database().ref('/clients/').once('value');
    },

    removeClient: function(uid) {
        var updates = {};
        updates['/clients/' + uid] = null;
        return firebase.database().ref().update(updates);
    },

    createNewClient: function(client) {
        var key = firebase.database().ref().child('clients').push().key;
        var updates = {};
        updates['/clients/' + key] = {
            uid: key,
            name: client.name,
            email: client.email,
            phone: client.phone,
            photos: client.photos
        };

        return firebase.database().ref().update(updates);
    },

    editClient: function(client) {
        var updates = {};
        updates['/clients/' + client.uid] = {
            uid: client.uid,
            name: client.name,
            email: client.email,
            phone: client.phone,
            photos: client.photos
        };
        return firebase.database().ref().update(updates);
    },

    logout: function() {
        return firebase.auth().signOut();
    },

    uploadPictures: function(files, clientId) {
        // Create the file metadata
        var metadata = {
            contentType: 'image/jpeg'
        };
        var uploadTasks = [];

        for (var k in files) {
            if (files.hasOwnProperty(k)) {
                uploadTasks.push(this.storageRef.child('clients-pics/' + clientId + '/' + files[k].name).put(files[k], metadata));
            }
        }
        return uploadTasks;
    },

    downloadClientPictures: function(clientId, photos) {
        var promises = [];
        for (var i = 0; i < photos.length; ++i) {
            var starsRef = this.storageRef.child('clients-pics/' + clientId + '/' + photos[i]);
            promises.push(starsRef.getDownloadURL());
        }
        return promises;
    },

    deleteUserPhotos: function(clientId, photos) {
        // Create a reference to the file to delete
        for (var i = 0; i < photos.length; ++i) {
            var desertRef = this.storageRef.child('clients-pics/' + clientId + '/' + photos[i]);
            desertRef.delete().then(function() {
                // File deleted successfully
                console.log("success");
            }).catch(function(error) {
                console.log(error);
            });
        }
    }
};