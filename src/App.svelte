<script>
	export let name;
	import YT from './components/YT.svelte'
	import YouTube_GAPI from './components/YouTube_GAPI.svelte'
	import YouTube from './components/YouTube.svelte'
	import YouTube_OAuth from './components/YouTube_OAuth.svelte'
	import Test from './Test.svelte'
	import "smelte/src/tailwind.css" ;
import YouTubeOAuth from './components/YouTube_OAuth.svelte';
</script>

<svelte:head>
	<link href="https://fonts.googleapis.com/css?family=Roboto:300,400,500|Material+Icons&display=swap"
rel="stylesheet" />
</svelte:head>

<main>
	<h1>YouTube Data Saver</h1>
	<YouTube_GAPI />
	<YouTubeOAuth/>
	<YouTube/>
</main>

<style>
	main {
		text-align: center;
		padding: 1em;
		max-width: 240px;
		margin: 0 auto;
	}

	h1 {
		color: #ff3e00;
		text-transform: uppercase;
		font-size: 4em;
		font-weight: 100;
	}

	@media (min-width: 640px) {
		main {
			max-width: none;
		}
	}
</style>