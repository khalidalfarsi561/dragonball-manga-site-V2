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

<header class="container mx-auto px-4 pt-6 pb-6" dir="rtl">
	<!-- 1. حاوية الغلاف العمودي بنسبة 9:16 (مستقلة تماماً وبدون أي أزرار فوقها) -->
	<div
		class="relative mx-auto aspect-[9/16] w-full max-w-[280px] overflow-hidden rounded-2xl border-2 border-gray-700 bg-gray-900 shadow-2xl sm:max-w-[320px]"
	>
		<!-- صورة الغلاف بكامل الأبعاد وبنقاء 100% بدون أي شفافية -->
		<img src={manga.cover_image_url} alt={manga.title} class="h-full w-full object-cover" />
	</div>

	<!-- 2. اللوجو أسفل الغلاف مباشرة بدون أي خلفية -->
	<div class="my-5 text-center">
		<img
			class="mx-auto max-h-[45px] w-auto object-contain drop-shadow-md sm:max-h-[55px]"
			src="https://i.ibb.co/wF5CLh4c/dragon-ball-arabic-logo.png"
			alt="دراغون بول سوبر"
		/>
	</div>

	<!-- 3. حاوية الأزرار المنفصلة أسفل اللوجو مباشرة -->
	{#if user}
		<div class="mx-auto flex w-full max-w-[280px] flex-col gap-2.5 sm:max-w-[320px]">
			{#if lastReadChapter}
				<!-- زر أكمل القراءة -->
				<a
					href="/manga/{manga.slug}/{lastReadChapter.chapter_number}?page={lastReadChapter.last_page_read}"
					class="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-orange-600 to-amber-500 px-4 py-3 text-sm font-bold text-white shadow-md transition hover:brightness-110 active:scale-[0.98]"
				>
					<span>أكمل القراءة (فصل {lastReadChapter.chapter_number})</span>
				</a>

				<!-- زر تابع من الفصل التالي إن وجد -->
				{#if firstUnreadChapter && firstUnreadChapter.id !== lastReadChapter.id}
					<a
						href="/manga/{manga.slug}/{firstUnreadChapter.chapter_number}"
						class="flex w-full items-center justify-center gap-2 rounded-xl bg-gray-800 px-4 py-2.5 text-xs font-semibold text-gray-200 transition hover:bg-gray-700 active:scale-[0.98]"
					>
						<span>تابع من (فصل {firstUnreadChapter.chapter_number})</span>
					</a>
				{/if}
			{:else}
				<!-- زر ابدأ القراءة للمستخدم الجديد -->
				<a
					href="/manga/{manga.slug}/{startChapterNumber}"
					class="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-orange-600 to-amber-500 px-4 py-3 text-sm font-bold text-white shadow-md transition hover:brightness-110 active:scale-[0.98]"
				>
					<span>ابدأ القراءة</span>
				</a>
			{/if}

			<!-- زر المفضلة -->
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
				class="w-full"
			>
				<input type="hidden" name="mangaId" value={manga.id} />
				<input type="hidden" name="isFavorited" value={isFavorited} />
				<button
					type="submit"
					disabled={isSubmitting}
					class="flex w-full items-center justify-center gap-2 rounded-xl border border-gray-700 bg-gray-800 px-4 py-2.5 text-xs font-bold text-white transition hover:bg-gray-700 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50"
				>
					{#if isSubmitting}
						<span>جاري التحديث...</span>
					{:else}
						<span>{isFavorited ? 'إزالة من المفضلة' : 'أضف للمفضلة'}</span>
						<svg
							xmlns="http://www.w3.org/2000/svg"
							fill={isFavorited ? 'currentColor' : 'none'}
							viewBox="0 0 24 24"
							stroke-width="1.5"
							stroke="currentColor"
							class="h-4 w-4 {isFavorited ? 'text-red-500' : 'text-gray-400'} transition-colors"
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
</header>
