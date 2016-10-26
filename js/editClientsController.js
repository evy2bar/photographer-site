/**
 * Created by raul on 10/24/16.
 */

(function () {

    var editForm = $("#edit-client-row");
    var gallery = $(".gallery-container");
    var uploadInput = $("#upload-pics-input");
    var uploadButton = $("#upload-pics-btn");
    var progressBar = $(".progress-bar");

    uploadButton.hide();

    var clients = [];
    var imagesGallery = {};
    var imagesToUpload = [];
    var userIdSelected = "";

    function buildListOfClients() {
        var table = document.querySelector(".panel-body");
        while (table.firstChild) {
            table.removeChild(table.firstChild);
        }
        FirebaseManager.getListOfClients().then(function(snapshot) {
            clients = parseDataFromFirebase(snapshot.val());
            for (var i = 0, len = clients.length; i < len; ++i) {
                var colName = createCol(clients[i].name, "client-name", 2);
                var colEmail = createCol(clients[i].email, "client-email", 3);
                var colPhone = createCol(Helpers.parsePhoneNumber(clients[i].phone), "client-phone", 2);
                var colUID = createCol(clients[i].uid, "client-uid", 3);
                var colIcons = createColWithIcons(2, clients[i].uid, i);
                var row = document.createElement("div");
                row.className = "row client-row";
                row.id = clients[i].uid;
                row.appendChild(colName);
                row.appendChild(colEmail);
                row.appendChild(colPhone);
                row.appendChild(colUID);
                row.appendChild(colIcons);
                table.appendChild(row);
            }
        });
    }

    function createCol(info, cssClass, size) {
        var col = document.createElement("div");
        col.className = "col-lg-" + size + " col-md-" + size + " col-sm-" + size;
        var p = document.createElement("p");
        p.className = cssClass;
        p.innerHTML = info;
        col.appendChild(p);
        return col;
    }

    function createColWithIcons(size, uid, index) {
        var col = document.createElement("div");
        col.className = "col-lg-" + size + " col-md-" + size + " col-sm-" + size;

        var trashButton = document.createElement("a");
        trashButton.href = "#";
        trashButton.className = "remove-client-btn";
        var editButton = document.createElement("a");
        editButton.href = "#";
        editButton.className = "edit-client-btn";
        var photosButton = document.createElement("a");
        photosButton.href = "#";
        photosButton.className = "photos-client-btn";

        var editIcon = document.createElement("span");
        editIcon.className = "glyphicon glyphicon-pencil";
        var trashIcon = document.createElement("span");
        trashIcon.className = "glyphicon glyphicon-trash";
        var photoIcon = document.createElement("span");
        photoIcon.className = "glyphicon glyphicon-picture";

        editButton.appendChild(editIcon);
        trashButton.appendChild(trashIcon);
        photosButton.appendChild(photoIcon);

        editButton.onclick = function() {
            $("#clientUid").val(clients[index].uid);
            $('#clientName').val(clients[index].name);
            $('#clientEmail').val(clients[index].email);
            $('#clientPhone').val(clients[index].phone);
            editForm.show();
        };
        trashButton.onclick = function() {
            FirebaseManager.removeClient(uid).then(function() {
                removeClientRowFromDOM(uid);
            }, removeClientError);
        };
        photosButton.onclick = function() {
            gallery.show();
            userIdSelected = uid;
        };

        col.appendChild(photosButton);
        col.appendChild(trashButton);
        col.appendChild(editButton);
        return col;
    }

    function removeClientRowFromDOM(uid) {
        var elem = document.querySelector("#" + uid);
        elem.parentNode.removeChild(elem);
    }

    function removeClientError(error) {
        console.log(error);
    }

    function parseDataFromFirebase(object) {
        var array = [];
        for (var k in object) {
            if (object.hasOwnProperty(k)) {
                array.push(object[k]);
            }
        }
        return array;
    }

    $("#edit-client-form").submit(function(e) {
        e.preventDefault();
        $('#edit-client-btn').prop('disabled', true);
        var client = { uid: $("#clientUid").val(),  name: $('#clientName').val(), email: $('#clientEmail').val(), phone: $('#clientPhone').val() };
        if (Helpers.hasEmptyFields(client.name, client.email, client.phone)) {
            this.showAlertMessage("There are empty fields!", 2500);
            return;
        }
        if (!Helpers.isValidEmail(client.email)) {
            this.showAlertMessage("Invalid email address!", 2500);
            return;
        }
        if (!Helpers.isValidPhone(client.phone)) {
            console.log("Invalid phone number");
            return;
        }
        FirebaseManager.editClient(client).then(function() {
            $('#edit-client-btn').prop('disabled', false);
            editForm.hide();
            buildListOfClients();
        }, function(error) {
            console.log(error);
            //this.showAlertMessage(error.message, "danger", 2500);
        });
    });

    function createGalleryGrid(files) {
        var parent = $(".gallery-container");
        for (var i = 0; i < files.length; ++i) {
            var reader = new FileReader();
            (function (index) {
                reader.onload = function (e) {
                    var squareDiv = document.createElement("div");
                    squareDiv.className = "square-thumbnail";
                    squareDiv.style.backgroundImage = "url(" + e.target.result + ")";

                    var btn = createRemoveButton(index);
                    squareDiv.appendChild(btn);
                    squareDiv.id = index;
                    parent.append(squareDiv);

                    imagesGallery[index] = squareDiv;
                };
            })(i);
            reader.readAsDataURL(files[i]);
        }
    }

    function createRemoveButton(index) {
        var btn = document.createElement("button");
        btn.className = "btn btn-link btn-remove-img";
        var span = document.createElement("span");
        span.className = "glyphicon glyphicon-remove";
        btn.onclick = function() {
            removeImageFromDOM(index);
        };
        btn.appendChild(span);
        return btn;
    }

    function removeImageFromDOM(index) {
        var elem = imagesGallery[index];
        elem.parentNode.removeChild(elem);
        delete imagesGallery[index];
    }

    uploadInput.click(function (e) {
        e.target.value = null;
    });

    uploadInput.change(function (e) {
        var files = e.currentTarget.files;
        imagesToUpload = files;
        uploadButton.show();
        createGalleryGrid(files);
    });

    uploadButton.click(function() {
        var uploadTasks = FirebaseManager.uploadPictures(imagesToUpload, userIdSelected);
        var totalPercentage = uploadTasks.length * 100;
        var currentProgress = 0, realPercentage = 0;
        var progressContainer = $("#progress-container");
        progressContainer.show();
        for (var i = 0; i < uploadTasks.length; ++i) {
            (function(index) {
                // Listen for state changes, errors, and completion of the upload.
                uploadTasks[i].on(firebase.storage.TaskEvent.STATE_CHANGED, function (snapshot) {
                    // Get task progress, including the number of bytes uploaded and the total number of bytes to be uploaded
                    var progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
                    //console.log('Upload #' + index + ' is ' + progress + '% done');

                    if (progress == 100) {
                        currentProgress += progress;
                        realPercentage = (currentProgress * 100) / totalPercentage;

                        progressBar.width(realPercentage + '%');
                        progressBar.text(realPercentage + "% uploaded");
                    }

                    if (realPercentage === 100) {
                        progressContainer.hide();
                    }

                    switch (snapshot.state) {
                        case firebase.storage.TaskState.PAUSED: // or 'paused'
                            console.log('Upload is paused');
                            break;
                        case firebase.storage.TaskState.RUNNING: // or 'running'
                            //console.log('Upload is running');
                            break;
                        default:
                            break;
                    }
                }, function (error) {
                    switch (error.code) {
                        case 'storage/unauthorized':
                            // User doesn't have permission to access the object
                            break;
                        case 'storage/canceled':
                            // User canceled the upload
                            break;
                        case 'storage/unknown':
                            // Unknown error occurred, inspect error.serverResponse
                            break;
                    }
                }, function () {
                    // Upload completed successfully, now we can get the download URL
                    var downloadURL = uploadTasks[index].snapshot.downloadURL;
                    //console.log(downloadURL);
                });
            }(i));
        }
    });


    buildListOfClients();
})();