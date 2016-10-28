/**
 * Created by raul on 10/27/16.
 */

(function() {
    var imagesGallery = {};
    var spinner = $(".photos-spinner");

    $(".client-btn").click(function() {
        var uid = $("#client-code-input").val();
        FirebaseManager.getCLientPhotos(uid).then(function(snapshot) {
            snapshot = snapshot.val();
            if (snapshot) {
                var promises = FirebaseManager.downloadClientPictures(uid, snapshot.photos);
                buildPhotoGallery(promises);
            }
            else {
                Helpers.showAlertMessage(
                    "<strong>Invalid unique code!</strong> Please verify your code and try submitting again.",
                    Helpers.alertType.danger,
                    4000
                );
            }
        });
    });

    function buildPhotoGallery(promises) {
        spinner.show();
        var numPhotos = promises.length;
        var parent = $(".gallery-container");
        for (var i = 0; i < promises.length; ++i) {
            (function (index) {
                promises[i].then(function (url) {
                    var squareDiv = document.createElement("div");
                    squareDiv.className = "square-thumbnail client-photo";
                    squareDiv.style.backgroundImage = "url(" + url + ")";

                    //var btn = createRemoveButton(index);
                    //squareDiv.appendChild(btn);
                    squareDiv.id = index;
                    parent.append(squareDiv);
                    imagesGallery[index] = squareDiv;
                    numPhotos--;
                    if (numPhotos === 0) {
                        parent.show();
                        spinner.hide();
                    }

                }).catch(function (error) {
                    console.log(error);
                    switch (error.code) {
                        case 'storage/object_not_found':
                            // File doesn't exist
                            break;
                        case 'storage/unauthorized':
                            // User doesn't have permission to access the object
                            break;
                        case 'storage/canceled':
                            // User canceled the upload
                            break;
                        case 'storage/unknown':
                            // Unknown error occurred, inspect the server response
                            break;
                        default:
                            break;
                    }
                });
            }(i));
        }
    }
}());