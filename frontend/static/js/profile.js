window.onload = function(){

    const preview =
    document.getElementById(
        "profilePreview"
    );

    let selectedAvatar =
    preview.src;

    /* AVATAR CLICK */

    window.setAvatar = function(src){

        preview.src = src;

        selectedAvatar = src;
    };

    /* SAVE PROFILE */

    document.getElementById(
        "profileForm"
    )

    .addEventListener(
    "submit",

    async function(e){

        e.preventDefault();

        const profileData = {

            name:
            document.getElementById(
                "profileName"
            ).value,

            image:
            selectedAvatar
        };

        console.log(profileData);

        const response =
        await fetch(
            "/save_profile",
            {
                method:"POST",

                headers:{
                    "Content-Type":
                    "application/json"
                },

                body:JSON.stringify(
                    profileData
                )
            }
        );

        const result =
        await response.json();

        console.log(result);

        alert(
            "Profile Saved 😎"
        );

    });

};