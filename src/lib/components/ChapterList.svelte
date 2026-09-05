<script lang="ts">
	import { createEventDispatcher, onMount } from 'svelte';
	import type { EnrichedChapter, Manga } from '$lib/types';

	type Props = {
		manga: Manga;
		chapters: EnrichedChapter[];
		totalPages: number;
		lastReadChapterId: string | null;
	};

	let { manga, chapters, totalPages, lastReadChapterId }: Props = $props();

	const dispatch = createEventDispatcher<{ loadMore: { page: number } }>();

	let searchTerm = $state('');
	let sortOrder = $state<'asc' | 'desc'>('asc');
	let readFilter = $state<'all' | 'read' | 'unread'>('all');
	let isLoadingMore = $state(false);
	let currentPage = $state(1);
	let endOfPage: HTMLElement | null = null;

	const filteredChapters = $derived.by(() => {
		let nextChapters = [...chapters];

		if (readFilter === 'read') {
			nextChapters = nextChapters.filter((chapter) => chapter.isRead);
		} else if (readFilter === 'unread') {
			nextChapters = nextChapters.filter((chapter) => !chapter.isRead);
		}

		const term = searchTerm.trim();
		if (term) {
			nextChapters = nextChapters.filter((chapter) =>
				chapter.chapter_number.toString().includes(term)
			);
		}

		return sortOrder === 'desc' ? nextChapters.reverse() : nextChapters;
	});

	onMount(() => {
		if (!endOfPage) return;

		const observer = new IntersectionObserver(
			(entries) => {
				if (entries[0]?.isIntersecting && currentPage < totalPages && !isLoadingMore) {
					isLoadingMore = true;
					currentPage += 1;
					dispatch('loadMore', { page: currentPage });
				}
			},
			{ rootMargin: '200px' }
		);

		observer.observe(endOfPage);

		return () => {
			observer.disconnect();
		};
	});

	export function loadFinished() {
		isLoadingMore = false;
	}
</script>

<main class="container mx-auto px-4 py-12" dir="rtl">
	<div class="mb-6 flex flex-col gap-4">
		<div class="flex flex-col items-center justify-between gap-4 md:flex-row">
			<h2 class="text-3xl font-bold text-orange-500">
				قائمة الفصول ( {manga.total_chapters || chapters.length} )
			</h2>

			<div class="flex w-full items-center gap-2 md:w-auto">
				<input
					type="search"
					bind:value={searchTerm}
					placeholder="ابحث عن فصل..."
					class="w-full rounded-lg border-2 border-gray-700 bg-gray-800 px-4 py-2 text-white placeholder-gray-500 transition focus:border-orange-500 focus:ring-0 focus:outline-none"
				/>
				<button
					type="button"
					onclick={() => (sortOrder = sortOrder === 'asc' ? 'desc' : 'asc')}
					class="flex-shrink-0 rounded-lg bg-gray-700 p-2 text-white transition hover:bg-orange-600"
					aria-label="تغيير ترتيب الفصول"
				>
					{#if sortOrder === 'asc'}
						<svg class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
							<path
								stroke-linecap="round"
								stroke-linejoin="round"
								stroke-width="2"
								d="M3 4h13M3 8h9m-9 4h6m4 0l4-4m0 0l4 4m-4-4v12"
							/>
						</svg>
					{:else}
						<svg class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
							<path
								stroke-linecap="round"
								stroke-linejoin="round"
								stroke-width="2"
								d="M3 4h13M3 8h9m-9 4h6m4 0l4 4m0 0l-4 4m4-4V4"
							/>
						</svg>
					{/if}
				</button>
			</div>
		</div>

		<div class="flex justify-center gap-2 rounded-lg bg-gray-800 p-1">
			<button
				type="button"
				class={`flex-1 rounded-md p-2 text-sm transition ${
					readFilter === 'all' ? 'bg-orange-600 font-bold' : 'hover:bg-gray-700'
				}`}
				onclick={() => (readFilter = 'all')}
			>
				الكل
			</button>
			<button
				type="button"
				class={`flex-1 rounded-md p-2 text-sm transition ${
					readFilter === 'read' ? 'bg-orange-600 font-bold' : 'hover:bg-gray-700'
				}`}
				onclick={() => (readFilter = 'read')}
			>
				المقروءة
			</button>
			<button
				type="button"
				class={`flex-1 rounded-md p-2 text-sm transition ${
					readFilter === 'unread' ? 'bg-orange-600 font-bold' : 'hover:bg-gray-700'
				}`}
				onclick={() => (readFilter = 'unread')}
			>
				غير المقروءة
			</button>
		</div>
	</div>

	<div class="rounded-lg bg-gray-800 shadow-lg">
		<ul class="divide-y divide-gray-700">
			{#each filteredChapters as chapter (chapter.id)}
				<li class={lastReadChapterId === chapter.id ? 'bg-blue-900/30' : ''}>
					<a
						href={`/manga/${manga.slug}/${chapter.chapter_number}`}
						class="flex items-center justify-between p-4 transition-colors duration-200 hover:bg-gray-700/50"
					>
						<div class="flex items-center gap-x-3">
							<span class="text-lg font-semibold">الفصل {chapter.chapter_number}</span>
							{#if chapter.isRead}
								<span class="rounded-full bg-blue-500 px-2 py-0.5 text-xs text-white">مقروء</span>
							{/if}
						</div>

						<div class="flex items-center gap-x-2">
							{#if lastReadChapterId === chapter.id}
								<span class="rounded-full bg-green-500 px-2 py-0.5 text-xs text-white">
									آخر قراءة
								</span>
							{/if}

							{#if !chapter.isRead}
								<span class="rounded-full bg-orange-500 px-3 py-1 text-sm font-bold text-white">
									اقرأ الآن
								</span>
							{/if}
						</div>
					</a>
				</li>
			{:else}
				<li class="p-6 text-center text-gray-400">
					{#if chapters.length > 0}
						لا توجد فصول تطابق بحثك.
					{:else}
						لم تتم إضافة أي فصول لهذه المانجا بعد.
					{/if}
				</li>
			{/each}
		</ul>

		{#if isLoadingMore}
			<div class="p-4 text-center text-gray-400">جاري تحميل المزيد...</div>
		{/if}

		<div bind:this={endOfPage} class="h-1"></div>
	</div>
</main>
