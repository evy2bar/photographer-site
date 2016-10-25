/**
 * Created by raul on 10/24/16.
 */

var FirebaseManager = {


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
            phone: client.phone
        };

        return firebase.database().ref().update(updates);
    },

    editClient: function(client) {
        var updates = {};
        updates['/clients/' + client.uid] = {
            uid: client.uid,
            name: client.name,
            email: client.email,
            phone: client.phone
        };
        return firebase.database().ref().update(updates);
    },

    logout: function() {
        return firebase.auth().signOut();
    },

    uploadPictures: function(files, clientId) {
        // Get a reference to the storage service, which is used to create references in your storage bucket
        var storage = firebase.storage();

        // Create a storage reference from our storage service
        var storageRef = storage.ref();

        // Create the file metadata
        var metadata = {
            contentType: 'image/jpeg'
        };
        var uploadTasks = [];

        for (var i = 0; i < files.length; ++i) {
            uploadTasks.push(storageRef.child('clients-pics/' + clientId + '/' + files[i].name).put(files[i], metadata));
        }
        return uploadTasks;
    }
};