<script>
    /**
     * Sample JavaScript code for youtube.channels.list
     * See instructions for running APIs Explorer code samples locally:
     * https://developers.google.com/explorer-help/guides/code_samples#javascript
     */

    import { onMount } from "svelte";
    import Button from "smelte/src/components/Button";
    const API_KEY = "AIzaSyAXl6KBB0aJ1zFGJoQVzl45aXXpySJt8eQ";
    const CLIENT_ID =
        "765839078612-0pfbtcgjduc7di75ook1i6i0ldtcdoou.apps.googleusercontent.com";
    let mounted = false,
        gapiLoaded = false;

    onMount(() => {
        if (gapiLoaded) {
            console.log(`GAPI loaded`);
            // authenticate().then(loadClient)
            gapi.load("client:auth2", function () {
                gapi.auth2.init({ client_id: CLIENT_ID });
            });
            // console.log(x)
        }
    });

    function loadGapi() {
        mounted = true;
        gapiLoaded = true;
        gapi.load("client:auth2", function () {
            gapi.auth2.init({ client_id: CLIENT_ID });
        });
    }

    function authenticate() {
        let auth = gapi.auth2;
        console.log(`gapi ${gapi}`, gapi);
        console.log(`gapi.auth2 ${auth}`);
        return gapi.auth2
            .getAuthInstance()
            .signIn({
                scope: "https://www.googleapis.com/auth/youtube.readonly",
            })
            .then(
                function () {
                    console.log("Sign-in successful");
                },
                function (err) {
                    console.error("Error signing in", err);
                }
            );
    }
    function loadClient() {
        gapi.client.setApiKey(API_KEY);
        return gapi.client
            .load(
                "https://www.googleapis.com/discovery/v1/apis/youtube/v3/rest"
            )
            .then(
                function () {
                    console.log("GAPI client loaded for API");
                },
                function (err) {
                    console.error("Error loading GAPI client for API", err);
                }
            );
    }
    // Make sure the client is loaded and sign-in is complete before calling this method.
    function executePlaylistsByChannelName() {
        return gapi.client.youtube.channels
            .list({
                part: ["snippet,contentDetails,statistics"],
                forUsername: "corbettreport"
            })
            .then(
                function (response) {
                    // Handle the results here (response.result has the parsed body).
                    console.log("Response", response);
                    console.log("Result: ", response.result);
                },
                function (err) {
                    console.error("Execute error", err);
                }
            );
    }
</script>

<svelte:head>
    <script src="https://apis.google.com/js/api.js" on:load={loadGapi}></script>
</svelte:head>

<div>
    Test YouTube GAPI
    <Button on:click={() => authenticate().then(loadClient())}
        >authorize and load</Button
    >
    <Button on:click={() => executePlaylistsByChannelName()}>executePlaylistsByChannelName</Button
    >
</div>
