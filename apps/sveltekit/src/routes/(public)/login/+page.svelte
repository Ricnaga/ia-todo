<script lang="ts">
  import { page } from '$app/state'
  import CardAuth from '../_components/card-auth/card-auth.svelte'
  import FormLogin from './_components/form-login/form-login.svelte'
  import { paths, type TPath } from '$lib/constants/paths'

  const callbackURL = (page.url.searchParams.get('next') || paths.DASHBOARD) as TPath
</script>

<svelte:head>
  <title>Entrar | ia-task-manager</title>
</svelte:head>

<CardAuth title="ia-task-manager">
  <FormLogin {callbackURL} />
</CardAuth>
