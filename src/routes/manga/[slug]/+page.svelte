<script lang="ts">
	import type { ActionData, PageData } from './$types';
	import MangaHeader from '$lib/components/MangaHeader.svelte';
	import ChapterList from '$lib/components/ChapterList.svelte';
	import Toast from '$lib/components/Toast.svelte';
	import type { Chapter, EnrichedChapter, PaginatedResult } from '$lib/types';

	type Props = {
		data: PageData;
		form?: ActionData;
	};

	let { data, form }: Props = $props();

	const manga = $derived(data.manga);
	const lastReadChapter = $derived(data.lastReadChapter);
	const firstUnreadChapter = $derived(data.firstUnreadChapter);
	const user = $derived(data.user);
	const readChapterIds = $derived(data.readChapterIds);

	let chapters = $state<EnrichedChapter[]>(
		data.chaptersResult.items.map((chapter: Chapter) => ({
			...chapter,
			isRead: data.readChapterIds.includes(chapter.id)
		}))
	);

	let totalPages = $state(data.chaptersResult.totalPages);
	let isFavorited = $state(data.isFavorited);
	let isTogglingFavorite = $state(false);
	let chapterListComponent: { loadFinished: () => void } | null = null;

	const toast = $derived.by(() => {
		if (!form?.message) return null;

		return {
			message: form.message,
			type: form.success ? ('success' as const) : ('error' as const)
		};
	});

	async function handleLoadMore(event: CustomEvent<{ page: number }>) {
		const nextPage = event.detail.page;
		const url = `/api/manga/${manga.slug}/chapters?page=${nextPage}`;

		try {
			const response = await fetch(url);

			if (!response.ok) {
				throw new Error(`فشل جلب الفصول: ${response.statusText}`);
			}

			const newChaptersResult = (await response.json()) as PaginatedResult<Chapter>;

			const newEnrichedChapters: EnrichedChapter[] = newChaptersResult.items.map((chapter) => ({
				...chapter,
				isRead: readChapterIds.includes(chapter.id)
			}));

			chapters = [...chapters, ...newEnrichedChapters];
			totalPages = newChaptersResult.totalPages;
		} catch (err) {
			console.error('Could not load more chapters:', err);
		} finally {
			chapterListComponent?.loadFinished();
		}
	}
</script>

<svelte:head>
	<title>قراءة مانجا {manga.title} - جميع الفصول</title>
	<meta name="description" content={manga.description} />
	<meta property="og:title" content={manga.title} />
	<meta property="og:description" content={manga.description} />
	<meta property="og:image" content={manga.cover_image_url} />
	<meta property="og:type" content="books.book" />
</svelte:head>

{#if toast}
	<Toast message={toast.message} type={toast.type} />
{/if}

<div class="min-h-screen bg-gray-900 font-[Tajawal] text-white">
	<MangaHeader
		{manga}
		{user}
		{lastReadChapter}
		{firstUnreadChapter}
		bind:isFavorited
		bind:isSubmitting={isTogglingFavorite}
	/>

	<ChapterList
		bind:this={chapterListComponent}
		{manga}
		{chapters}
		{totalPages}
		lastReadChapterId={lastReadChapter?.id || null}
		on:loadMore={handleLoadMore}
	/>
</div>

<style>
	@import url('https://fonts.googleapis.com/css2?family=Tajawal:wght@400;700;800&display=swap');
</style>
