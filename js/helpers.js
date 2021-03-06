/**
 * Created by raul on 10/19/16.
 */

var Helpers = {
    alertType: {
        success: "success",
        info: "info",
        warning: "warning",
        danger: "danger"
    },

    /**
     * Converts a date string in a human readable format (MMM DD, YYYY)
     * @param date
     * @returns {string}
     */
    convertDateToString: function(date) {
        var dateObj = new Date(date);
        var convertedDate = dateObj.toDateString().split(" ");
        return convertedDate[1] + " " + convertedDate[2] + ", " + convertedDate[3];
    },

    /**
     * Same as the above but returns a longer format (MMM DD, YYYY HH:MM)
     * @param date
     * @returns {string}
     */
    convertDateToLongString: function(date) {
        if (date) {
            var dateObj = new Date(date);
            var convertedDate = dateObj.toString().split(" ");
            return convertedDate[1] + " " + convertedDate[2] + ", " + convertedDate[3] + " at " + convertedDate[4].substring(0, 5);
        }
        return "";
    },

    /**
     * Takes a number of arguments and checks if any of them is null, empty or undefined
     * @returns {boolean}
     */
    hasEmptyFields: function() {
        var params = Array.prototype.slice.call(arguments);
        for (var i = 0; i < params.length; ++i) {
            if (!params[i]) {
                return true;
            }
        }
        return false;
    },

    /**
     * Checks if two passwords are equal
     * @param pass1
     * @param pass2
     * @returns {boolean}
     */
    passwordsMatch: function(pass1, pass2) {
        return pass1 === pass2;
    },

    /**
     * Checks if an email address is valid using regular expressions
     * @param email
     * @returns {boolean}
     */
    isValidEmail: function (email) {
        var re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
        return re.test(email);
    },

    isValidPhone: function(phone) {
        var re = /\D/;
        return !re.test(phone);
    },

    isAdminLoginPage: function(url) {
        return url.indexOf("admin-signin.html") !== -1;
    },

    isAdminPage: function(url) {
        return url.indexOf("admin.html") !== -1;
    },

    redirectToPage: function(url) {
        window.location.assign(url);
    },

    parsePhoneNumber: function(phone) {
        if (phone.length > 9) {
            return [phone.substr(0, 3), phone.substring(3, 6), phone.substr(6)].join("-");
        }
        return phone;
    },

    parseDataFromFirebase: function(object) {
        var array = [];
        for (var k in object) {
            if (object.hasOwnProperty(k)) {
                array.push(object[k]);
            }
        }
        return array;
    },

    getBackgroundUrlFromDiv: function(img) {
        var style = img.currentStyle || window.getComputedStyle(img, false)
        return style.backgroundImage.slice(4, -1);
    },

    showAlertMessage: function(msg, type, time) {
        var alertMsg = $("#alert-msg");
        if (alertMsg) {
            alertMsg.removeClass();
            switch (type) {
                case "success": {
                    alertMsg[0].className = "alert alert-success text-center";
                    break;
                }
                case "info": {
                    alertMsg[0].className = "alert alert-info text-center";
                    break;
                }
                case "warning": {
                    alertMsg[0].className = "alert alert-warning text-center";
                    break;
                }
                case "danger": {
                    alertMsg[0].className = "alert alert-danger text-center";
                    break;
                }
                default:
                    break;
            }
            alertMsg.html(msg);
            alertMsg.show();
            time = time ? time : 1000000000;
            setTimeout(function() {
                alertMsg.hide();
            }, time);
        }
    }
};