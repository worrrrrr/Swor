<script lang="ts">
  import BlogEditor from '$lib/components/BlogEditor.svelte';

  let { data } = $props<{ data: { post: any } }>();
</script>

<BlogEditor post={data.post} />
