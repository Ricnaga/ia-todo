<script lang="ts">
  interface Props {
    message: string
  }

  let { message }: Props = $props()
</script>

<p class="text-muted text-sm">{message}</p>
