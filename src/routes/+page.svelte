<script lang="ts">
	import type { PageData } from './$types';
	import MangaCard from '$lib/components/MangaCard.svelte';
	export let data: PageData;
	// استيراد متغيرات الفرز والتصفية
	$: ({ mangas, sort, status } = data);
</script>

<svelte:head>
	<title>موقع دراغون بول الأسطوري | اقرأ المانجا أونلاين</title>
</svelte:head>

<div class="min-h-screen bg-gray-900 font-[Tajawal] text-white">
	<main class="container mx-auto px-4 py-16">
		<h2 class="mb-6 text-center text-3xl font-bold text-orange-500 md:text-4xl">اختر السلسلة</h2>

		<form
			method="GET"
			class="mb-12 flex flex-wrap items-center justify-center gap-4"
			aria-label="فرز وتصفية المانجا"
		>
			<div class="flex items-center gap-2 rounded-lg bg-gray-800 p-1">
				<button
					type="submit"
					name="sort"
					value="-created"
					class="rounded-md px-4 py-2 text-sm font-bold transition-colors {sort === '-created'
						? 'bg-orange-600'
						: 'hover:bg-gray-700'}"
				>
					الأحدث
				</button>
				<button
					type="submit"
					name="sort"
					value="title"
					class="rounded-md px-4 py-2 text-sm font-bold transition-colors {sort === 'title'
						? 'bg-orange-600'
						: 'hover:bg-gray-700'}"
				>
					أبجدي
				</button>
			</div>
			<div class="relative">
				<select
					name="status"
					on:change={(event) => event.currentTarget?.form?.submit()}
					class="appearance-none rounded-lg border-2 border-transparent bg-gray-800 px-4 py-2 pr-8 font-semibold text-white transition hover:border-gray-600 focus:border-orange-500 focus:outline-none"
				>
					<option value="" selected={status === ''}>كل الحالات</option>
					<option value="مستمرة" selected={status === 'مستمرة'}>مستمرة</option>
					<option value="مكتملة" selected={status === 'مكتملة'}>مكتملة</option>
				</select>
			</div>
		</form>

		{#if mangas.length > 0}
			<div class="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
				{#each mangas as manga (manga.id)}
					<MangaCard
						{manga}
						isNew={manga.isNew}
						isTrending={manga.isTrending}
						chapters_count={manga.chapters_count}
					/>
				{/each}
			</div>
		{:else}
			<p class="text-center text-xl text-gray-400">لا توجد مانجا تطابق خيارات البحث الحالية.</p>
		{/if}
	</main>
</div>
