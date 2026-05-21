<script lang="ts">
	import { enhance } from '$app/forms';
	import { invalidateAll } from '$app/navigation';
	import type { Chapter, LastReadChapterInfo, Manga } from '$lib/types';

	type User = {
		id: string;
		username?: string;
		name?: string;
		isAdmin?: boolean;
	} | null;

	type Props = {
		manga: Manga;
		user: User;
		lastReadChapter: LastReadChapterInfo | null;
		firstUnreadChapter: Chapter | null;
		isFavorited: boolean;
		isSubmitting: boolean;
	};

	let {
		manga,
		user,
		lastReadChapter,
		firstUnreadChapter,
		isFavorited = $bindable(),
		isSubmitting = $bindable()
	}: Props = $props();

	const startChapterNumber = $derived(firstUnreadChapter?.chapter_number || 1);
</script>

<header
	class="relative flex min-h-[220px] items-start bg-cover bg-center p-4 md:p-8"
	style="background-image: url({manga.cover_image_url});"
>
	<div class="absolute inset-0 bg-gradient-to-t from-gray-900 via-gray-900/80 to-transparent"></div>
	<div class="relative z-10 w-full">
		<img
			src={manga.header_image_url}
			alt={manga.title}
			class="mx-auto mt-5 max-h-[45px] w-full max-w-4xl object-contain"
		/>

		{#if user}
			<div class="mt-6 flex flex-wrap items-center gap-3" dir="rtl">
				{#if lastReadChapter}
					<a
						href="/manga/{manga.slug}/{lastReadChapter.chapter_number}?page={lastReadChapter.last_page_read}"
						class="inline-flex items-center justify-center gap-x-2 rounded-lg bg-gradient-to-r from-blue-500 to-indigo-600 px-5 py-3 text-sm font-semibold text-white shadow-md ring-1 ring-black transition-all duration-300 ease-in-out hover:scale-105 hover:shadow-lg focus:ring-2 focus:ring-indigo-400 focus:outline-none"
					>
						<span>أكمل القراءة (فصل {lastReadChapter.chapter_number})</span>
					</a>
					{#if firstUnreadChapter && firstUnreadChapter.id !== lastReadChapter.id}
						<a
							href="/manga/{manga.slug}/{firstUnreadChapter.chapter_number}"
							class="inline-flex items-center justify-center gap-x-2 rounded-lg bg-gray-800 px-5 py-3 text-sm font-semibold text-white shadow-md ring-1 ring-gray-700 transition-all duration-300 ease-in-out hover:scale-105 hover:bg-gray-700 hover:shadow-lg focus:ring-2 focus:ring-gray-500 focus:outline-none"
						>
							<span>تابع من (فصل {firstUnreadChapter.chapter_number})</span>
						</a>
					{/if}
				{:else}
					<a
						href="/manga/{manga.slug}/{startChapterNumber}"
						class="inline-flex items-center justify-center gap-x-2 rounded-lg bg-gradient-to-r from-blue-500 to-indigo-600 px-5 py-3 text-sm font-semibold text-white shadow-md ring-1 ring-black transition-all duration-300 ease-in-out hover:scale-105 hover:shadow-lg focus:ring-2 focus:ring-indigo-400 focus:outline-none"
					>
						<span>ابدأ القراءة</span>
					</a>
				{/if}

				<form
					method="POST"
					action="?/toggleFavorite"
					use:enhance={() => {
						isSubmitting = true;
						isFavorited = !isFavorited;
						return async ({ update }) => {
							await update({ reset: false });
							await invalidateAll();
							isSubmitting = false;
						};
					}}
				>
					<input type="hidden" name="mangaId" value={manga.id} />
					<input type="hidden" name="isFavorited" value={isFavorited} />
					<button
						type="submit"
						disabled={isSubmitting}
						class="inline-flex items-center justify-center gap-x-2 rounded-lg bg-gray-800 px-5 py-3 text-sm font-semibold text-white shadow-md ring-1 ring-gray-700 transition-all duration-300 ease-in-out hover:scale-105 hover:bg-gray-700 hover:shadow-lg focus:ring-2 focus:ring-gray-500 focus:outline-none disabled:cursor-not-allowed disabled:opacity-50"
					>
						{#if isSubmitting}
							<span>جاري...</span>
						{:else}
							<span>{isFavorited ? 'إزالة من المفضلة' : 'أضف للمفضلة'}</span>
							<svg
								xmlns="http://www.w3.org/2000/svg"
								fill={isFavorited ? 'currentColor' : 'none'}
								viewBox="0 0 24 24"
								stroke-width="1.5"
								stroke="currentColor"
								class={`h-5 w-5 ${
									isFavorited ? 'text-red-500' : 'text-gray-400'
								} transition-all duration-300`}
							>
								<path
									stroke-linecap="round"
									stroke-linejoin="round"
									d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z"
								/>
							</svg>
						{/if}
					</button>
				</form>
			</div>
		{/if}
	</div>
</header>
