<script lang="ts">
	import type { PageData } from './$types';
	import { goto } from '$app/navigation';
	import { navigating } from '$app/stores';
	import { fade } from 'svelte/transition';
	import QuizCard from '$lib/components/QuizCard.svelte';
	// سنضيف هذا المكون الجديد بعد قليل
	import QuizCardSkeleton from '$lib/components/QuizCardSkeleton.svelte';

	export let data: PageData;

	// --- 1. متغيرات محلية لإدارة الحالة بشكل تفاعلي ---
	let quizzes = data.quizzes;
	let currentPage = data.currentPage;
	let totalPages = data.totalPages;
	let loadingMore = false;
	// لتتبع حالة التحميل الأولية للصفحة
	let initialLoading = true;

	// --- 2. دالة Debounce لتأخير البحث التلقائي ---
	function debounce<T extends (...args: any[]) => any>(func: T, timeout = 500) {
		let timer: ReturnType<typeof setTimeout>;
		return (...args: Parameters<T>) => {
			clearTimeout(timer);
			timer = setTimeout(() => {
				func(...args);
			}, timeout);
		};
	}

	// --- 3. دوال جديدة لتطبيق الفلاتر بذكاء ---
	function applyFilters(form: HTMLFormElement) {
		const formData = new FormData(form);
		formData.delete('page'); // نبدأ دائماً من صفحة 1 عند الفلترة
		const params = new URLSearchParams(formData as any);
		goto(`?${params.toString()}`, { keepFocus: true, noScroll: true });
	}

	// ننشئ نسخة "مُؤخرة" من دالة تطبيق الفلاتر
	const debouncedApplyFilters = debounce((form) => applyFilters(form));

	function handleFormInput(event: Event) {
		const form = event.currentTarget as HTMLFormElement;
		// البحث سيعمل بعد التوقف عن الكتابة بنصف ثانية
		debouncedApplyFilters(form);
	}

	function handleFormChange(event: Event) {
		const form = event.currentTarget as HTMLFormElement;
		// الفلترة بالتصنيف والمستوى ستكون فورية
		applyFilters(form);
	}

	// --- 4. دالة "تحميل المزيد" الجديدة والمحسنة ---
	async function loadMore() {
		if (loadingMore || currentPage >= totalPages) return;
		loadingMore = true;

		const nextPage = currentPage + 1;
		const url = new URL(window.location.href);
		url.pathname = '/api/quizzes'; // نستهدف مسار الـ API الذي أنشأناه
		url.searchParams.set('page', nextPage.toString());

		try {
			const response = await fetch(url.toString());
			const newResult = await response.json();

			if (newResult && newResult.items) {
				// الأهم: نضيف الاختبارات الجديدة إلى القائمة الحالية ولا نستبدلها
				quizzes = [...quizzes, ...newResult.items];
				currentPage = newResult.page;
			}
		} catch (err) {
			console.error('Failed to load more quizzes:', err);
		} finally {
			loadingMore = false;
		}
	}

	// --- 5. مراقبة تغيير الفلاتر لإعادة تعيين قائمة الاختبارات ---
	// هذا السطر السحري يعيد تعيين القائمة عند كل فلترة جديدة من الخادم
	$: if (data.quizzes) {
		quizzes = data.quizzes;
		currentPage = data.currentPage;
		totalPages = data.totalPages;
		initialLoading = false; // نوقف حالة التحميل الأولية
	}

	function clearFilters() {
		goto('/quizzes');
	}
</script>

<svelte:head>
	<title>ساحة اختبارات Z</title>
	<meta
		name="description"
		content="اختبر معلوماتك في عالم دراغون بول وأثبت أنك من نخبة المحاربين!"
	/>
</svelte:head>

{#if $navigating}
	<!-- svelte-ignore element_invalid_self_closing_tag -->
	<div class="fixed top-0 right-0 left-0 z-50 h-1 animate-pulse bg-orange-500" transition:fade />
{/if}

<div class="p-8 font-[Tajawal]">
	<div class="container mx-auto" dir="rtl">
		<h1 class="mb-8 text-center text-4xl font-bold text-orange-400">ساحة اختبارات Z</h1>
		<p class="mx-auto mb-12 max-w-2xl text-center text-lg text-gray-300">
			هل تعتقد أنك تعرف كل شيء عن عالم دراغون بول؟ اختبر معلوماتك وأثبت أنك من نخبة المحاربين!
		</p>

		<form
			method="GET"
			on:submit|preventDefault={(e) => applyFilters(e.currentTarget)}
			class="relative mb-12 rounded-lg bg-gray-800 p-4"
		>
			<div
				class="absolute top-3 left-3 flex h-10 w-10 items-center justify-center rounded-xl bg-gray-700/80 shadow-lg backdrop-blur-sm"
			>
				<svg
					xmlns="http://www.w3.org/2000/svg"
					viewBox="0 0 512 512"
					fill="currentColor"
					class="h-5 w-5 text-orange-500"
				>
					<path
						d="M0 93.7C0 77.3 13.3 64 29.7 64l452.7 0c16.4 0 29.7 13.3 29.7 29.7 0 7.9-3.1 15.4-8.7 21L336 281.9 336 482.3c0 16.4-13.3 29.7-29.7 29.7-7.9 0-15.4-3.1-21-8.7L183 401c-4.5-4.5-7-10.6-7-17L176 281.9 8.7 114.6C3.1 109.1 0 101.5 0 93.7zM73.9 112L217 255c4.5 4.5 7 10.6 7 17l0 102.1 64 64 0-166.1c0-6.4 2.5-12.5 7-17l143-143-364.1 0z"
					/>
				</svg>
			</div>
			<div class="grid grid-cols-1 items-end gap-4 pt-6 md:grid-cols-4">
				<div class="md:col-span-2">
					<label for="search" class="mb-1 block text-sm font-medium text-gray-300"
						>ابحث عن اختبار</label
					>
					<div class="relative">
						<input
							type="search"
							name="search"
							id="search"
							placeholder="مثال: قصة فيجيتا..."
							value={data.currentSearch}
							on:input={handleFormInput}
							class="w-full appearance-none rounded-lg bg-gray-700 py-2 pr-8 pl-4 text-right text-white focus:ring-2 focus:ring-orange-500 focus:outline-none"
						/>

						<svg
							xmlns="http://www.w3.org/2000/svg"
							viewBox="0 0 576 512"
							fill="currentColor"
							class="pointer-events-none absolute top-1/2 right-3 h-4 w-4 -translate-y-1/2 text-orange-500"
						>
							<path
								d="M448.3 208c0 45.9-14.9 88.3-40 122.7L534.9 457.4 557.5 480 512.3 525.3 489.6 502.6 363 376c-34.4 25.2-76.8 40-122.7 40-114.9 0-208-93.1-208-208s93.1-208 208-208 208 93.1 208 208zm-208 144a144 144 0 1 0 0-288 144 144 0 1 0 0 288z"
							/>
						</svg>
					</div>
				</div>

				<div>
					<label
						for="category"
						class="mb-1 flex flex-row-reverse items-center justify-end gap-1 text-sm font-medium text-gray-300"
					>
						<span>التصنيف</span>

						<svg
							xmlns="http://www.w3.org/2000/svg"
							viewBox="0 0 24 24"
							fill="none"
							stroke="#f97316"
							stroke-width="2"
							stroke-linecap="round"
							stroke-linejoin="round"
							class="lucide lucide-tag-icon lucide-tag h-3.5 w-3.5"
						>
							<path
								d="M12.586 2.586A2 2 0 0 0 11.172 2H4a2 2 0 0 0-2 2v7.172a2 2 0 0 0 .586 1.414l8.704 8.704a2.426 2.426 0 0 0 3.42 0l6.58-6.58a2.426 2.426 0 0 0 0-3.42z"
							/>
							<circle cx="7.5" cy="7.5" r=".5" fill="#f97316" />
						</svg>
					</label>
					<select
						name="category"
						id="category"
						on:change={handleFormChange}
						class="w-full appearance-none rounded-lg bg-gray-700 px-4 py-2 pr-8 text-white focus:ring-2 focus:ring-orange-500 focus:outline-none"
					>
						<option value="">كل التصنيفات</option>
						{#each data.categories as category}
							<option value={category} selected={data.currentCategory === category}
								>{category}</option
							>
						{/each}
					</select>
				</div>

				<div>
					<label
						for="difficulty"
						class="mb-1 flex flex-row-reverse items-center justify-end gap-1 text-sm font-medium text-gray-300"
					>
						<span>مستوى الصعوبة</span>

						<svg
							xmlns="http://www.w3.org/2000/svg"
							viewBox="0 0 448 512"
							fill="currentColor"
							class="h-4.5 w-4.5 text-orange-500"
						>
							<path opacity=".4" d="" />
							<path
								d="M312 152c0-13.3-10.7-24-24-24s-24 10.7-24 24l0 304c0 13.3 10.7 24 24 24s24-10.7 24-24l0-304zM160 256c-13.3 0-24 10.7-24 24l0 176c0 13.3 10.7 24 24 24s24-10.7 24-24l0-176c0-13.3-10.7-24-24-24zM32 384c-13.3 0-24 10.7-24 24l0 48c0 13.3 10.7 24 24 24s24-10.7 24-24l0-48c0-13.3-10.7-24-24-24z"
							/>
						</svg>
					</label>
					<select
						name="difficulty"
						id="difficulty"
						class="w-full appearance-none rounded-lg bg-gray-700 px-4 py-2 pr-8 text-white focus:ring-2 focus:ring-orange-500 focus:outline-none"
					>
						<option value="">كل المستويات</option>
						{#each data.difficulties as difficulty}
							<option value={difficulty} selected={data.currentDifficulty === difficulty}
								>{difficulty}</option
							>
						{/each}
					</select>
				</div>

				<div class="col-span-full flex gap-2 md:col-span-1 md:col-start-4">
					<button
						type="submit"
						class="flex-grow rounded-lg bg-orange-600 px-6 py-2 font-bold text-white transition-colors hover:bg-orange-700"
					>
						تصفية
					</button>
					<!-- svelte-ignore a11y_consider_explicit_label -->
					<button
						type="button"
						on:click={clearFilters}
						class="rounded-lg bg-gray-600 px-4 py-2 text-white transition-colors hover:bg-gray-500"
						title="مسح الفلاتر"
					>
						<svg
							xmlns="http://www.w3.org/2000/svg"
							viewBox="0 0 512 512"
							fill="currentColor"
							class="h-5 w-5 text-[#B4C6FF]"
						>
							<path
								d="M480.1 192l7.9 0c13.3 0 24-10.7 24-24l0-144c0-9.7-5.8-18.5-14.8-22.2S477.9 .2 471 7L419.3 58.8C375 22.1 318 0 256 0 127 0 20.3 95.4 2.6 219.5 .1 237 12.2 253.2 29.7 255.7s33.7-9.7 36.2-27.1C79.2 135.5 159.3 64 256 64 300.4 64 341.2 79 373.7 104.3L327 151c-6.9 6.9-8.9 17.2-5.2 26.2S334.3 192 344 192l136.1 0zm29.4 100.5c2.5-17.5-9.7-33.7-27.1-36.2s-33.7 9.7-36.2 27.1c-13.3 93-93.4 164.5-190.1 164.5-44.4 0-85.2-15-117.7-40.3L185 361c6.9-6.9 8.9-17.2 5.2-26.2S177.7 320 168 320L24 320c-13.3 0-24 10.7-24 24L0 488c0 9.7 5.8 18.5 14.8 22.2S34.1 511.8 41 505l51.8-51.8C137 489.9 194 512 256 512 385 512 491.7 416.6 509.4 292.5z"
							/>
						</svg>
					</button>
				</div>
			</div>
		</form>

		{#if initialLoading || ($navigating && quizzes.length === 0)}
			<div class="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
				{#each Array(8) as _}
					<QuizCardSkeleton />
				{/each}
			</div>
		{:else if quizzes.length > 0}
			<div class="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
				{#each quizzes as quiz (quiz.id)}
					<div in:fade={{ duration: 300, delay: 100 }}>
						<QuizCard {quiz} />
					</div>
				{/each}
			</div>

			{#if currentPage < totalPages}
				<div class="mt-12 text-center">
					<button
						on:click={loadMore}
						disabled={loadingMore}
						class="rounded-lg bg-orange-700 px-8 py-3 font-bold text-white transition-transform hover:scale-105 disabled:cursor-not-allowed disabled:bg-gray-600"
					>
						{loadingMore ? 'جاري التحميل...' : 'تحميل المزيد من الاختبارات'}
					</button>
				</div>
			{/if}

			{#if loadingMore}
				<div class="mt-8 grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
					{#each Array(4) as _}
						<QuizCardSkeleton />
					{/each}
				</div>
			{/if}
		{:else}
			<div class="py-24 text-center">
				<p class="text-xl whitespace-nowrap text-gray-400">
					لا توجد اختبارات تطابق خياراتك الحالية
				</p>
				<p class="mt-4 text-gray-500">حاول تغيير فلاتر البحث أو اضغط على زر المسح</p>
			</div>
		{/if}
	</div>
</div>
