function main() {

    (function () {
        'use strict';

        /* ==============================================
         Scroll
         =============================================== */

        $('a.page-scroll').click(function () {
            if (location.pathname.replace(/^\//, '') == this.pathname.replace(/^\//, '') && location.hostname == this.hostname) {
                var target = $(this.hash);
                target = target.length ? target : $('[name=' + this.hash.slice(1) + ']');
                if (target.length) {
                    $('html,body').animate({
                        scrollTop: target.offset().top - 40
                    }, 900);
                    return false;
                }
            }
        });
        /*====================================
         Show Menu on Book
         ======================================*/
        $(window).bind('scroll', function () {
            var navHeight = $(window).height() - 100;
            if ($(window).scrollTop() > navHeight) {
                $('.navbar-default').addClass('on');
            } else {
                $('.navbar-default').removeClass('on');
            }
        });

        $('body').scrollspy({
            target: '.navbar-default',
            offset: 80
        });
        /*====================================
         Portfolio Isotope Filter
         ======================================*/
        $(window).load(function () {
            var $container = $('#lightbox');
            // $container.isotope({
            //     filter: '*',
            //     animationOptions: {
            //         duration: 750,
            //         easing: 'linear',
            //         queue: false
            //     }
            // });
            $('.cat a').click(function () {
                $('.cat .active').removeClass('active');
                $(this).addClass('active');
                var selector = $(this).attr('data-filter');
                $container.isotope({
                    filter: selector,
                    animationOptions: {
                        duration: 750,
                        easing: 'linear',
                        queue: false
                    }
                });
                return false;
            });
        });
    }());

    window.onload = function() {
        firebase.auth().onAuthStateChanged(callBackAuthState);
    };

    var callBackAuthState = function(user) {
        var url = window.location.href;
        if (Helpers.isAdminLoginPage(url) && user) {
            // User is signed in, redirect to admin home
            url = url.substring(0, url.lastIndexOf('/'));
            Helpers.redirectToPage(url + "/admin.html");
            return;
        }
        if (Helpers.isAdminPage(url) && !user) {
            url = url.substring(0, url.lastIndexOf('/'));
            Helpers.redirectToPage(url + "/admin-signin.html");
        }
    };

    $('#admin-login-form').submit(function(e) {
        e.preventDefault();
        var email = $('#adminEmail').val(), password = $('#adminPassword').val();

        if (Helpers.hasEmptyFields(email, password)) {
            this.showAlertMessage("There are empty fields!", 2500);
            return;
        }
        if (!Helpers.isValidEmail(email)) {
            this.showAlertMessage("Invalid email address!", 2500);
            return;
        }
        firebase.auth().signInWithEmailAndPassword(email, password).then(signInSuccessCb, signInErrorCb);
    });

    var signInSuccessCb = function() {
        var url = window.location.href;
        url = url.substring(0, url.lastIndexOf('/'));
        Helpers.redirectToPage(url + "/admin.html")
    };

    var signInErrorCb = function(error) {
        switch (error.code) {
            case "auth/user-not-found": {
                this.showAlertMessage("There is no account associated with that email address.", 2500);
                break;
            }
            case "auth/wrong-password": {
                this.showAlertMessage("Invalid password, please try again!", 2500);
                break;
            }
            default:
                this.showAlertMessage(error.message, 2500);
                break;
        }
    };

    $('#add-client-form').submit(function(e) {
        e.preventDefault();
        $('#add-client-btn').prop('disabled', true);
        var client = { name: $('#clientName').val(), email: $('#clientEmail').val(), phone: $('#clientPhone').val() };
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
        FirebaseManager.createNewClient(client).then(function() {
            cleanInputFields();
            $('#add-client-btn').prop('disabled', false);
            console.log("success");
        }, function(error) {
            console.log(error);
            //this.showAlertMessage(error.message, "danger", 2500);
        });
    });

    function cleanInputFields() {
        $('#clientName').val("");
        $('#clientEmail').val("");
        $('#clientPhone').val("");
    }

    $("#logout-btn").click(function() {
        FirebaseManager.logout().then(function() {
            var url = window.location.href;
            url = url.substring(0, url.lastIndexOf('/'));
            Helpers.redirectToPage(url + "/admin-signin.html");
        }, function(error) {
            console.log(error);
        })
    });
}

main();