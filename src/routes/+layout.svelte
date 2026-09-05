<script lang="ts">
	import type { LayoutData } from './$types';
	import '../app.css';
	import { navigating, page } from '$app/stores';
	import DragonBall from '$lib/components/DragonBall.svelte';
	import { onMount } from 'svelte';
	import { slide } from 'svelte/transition';
	import { toasts, addToast } from '$lib/stores/toast'; // ✨ استيراد addToast
	import Toast from '$lib/components/Toast.svelte';

	export let data: LayoutData;

	let isMenuOpen = false;

	$: if ($navigating) {
		isMenuOpen = false;
	}

	// ✨ تم تعديل هذا الجزء ليستخدم نظام الإشعارات الجديد
	onMount(() => {
		if ($page.url.searchParams.get('logout') === 'true') {
			addToast('تم تسجيل خروجك بنجاح!', 'success');

			// ننظف الرابط لتجنب ظهور الرسالة مرة أخرى عند تحديث الصفحة
			const url = new URL(window.location.href);
			url.searchParams.delete('logout');
			window.history.replaceState({}, '', url);
		}
	});
</script>

{#if $navigating}
	<div class="bg-opacity-50 fixed inset-0 z-[9999] flex items-center justify-center bg-black">
		<div
			class="h-16 w-16 animate-spin rounded-full border-4 border-gray-600 border-t-orange-500"
		></div>
	</div>
{/if}

{#if data.dragonBall}
	<DragonBall ball_number={data.dragonBall.ball_number} find_token={data.dragonBall.find_token} />
{/if}

<div class="fixed top-5 right-5 z-[100] flex flex-col gap-2">
	{#each $toasts as toast (toast.id)}
		<Toast message={toast.message} type={toast.type} />
	{/each}
</div>

<div class="flex h-screen flex-col overflow-hidden bg-gray-900 font-[Tajawal] text-white">
	<nav id="main-nav" class="z-50 flex-shrink-0 bg-transparent p-4 text-white">
		<div class="container mx-auto flex flex-wrap items-center justify-between gap-4">
			<a href="/profile" class="md:hidden" aria-label="الملف الشخصي">
				{#if data.user?.avatar}
					<img
						src={data.user.avatarUrl}
						alt="Avatar"
						class="h-10 w-10 rounded-full border-2 border-orange-500 object-cover"
					/>
				{:else}
					<div
						class="flex h-10 w-10 items-center justify-center rounded-full bg-gray-700 text-sm font-bold text-white"
					>
						{data.user?.username?.charAt(0).toUpperCase()}
					</div>
				{/if}
			</a>

			<div class="hidden items-center gap-x-4 text-base md:flex md:gap-x-6">
				{#if data.user}
					<div class="flex items-center gap-x-4">
						<span class="hidden sm:inline">أهلاً بك، {data.user.name}</span>
						<a
							href="/profile"
							class="rounded bg-orange-600 px-4 py-2 whitespace-nowrap hover:bg-orange-700"
							>ملفي الشخصي</a
						>
					</div>
				{:else}
					<div class="flex items-center gap-x-2">
						<a href="/login" class="rounded px-4 py-2 whitespace-nowrap hover:bg-gray-700"
							>تسجيل الدخول</a
						>
						<a
							href="/signup"
							class="rounded bg-orange-600 px-4 py-2 whitespace-nowrap hover:bg-orange-700"
							>إنشاء حساب</a
						>
					</div>
				{/if}
				<div class="hidden h-6 w-px bg-gray-600 sm:block"></div>
				<a href="/quizzes" class="font-semibold transition-colors hover:text-orange-400"
					>الاختبارات</a
				>
				<a href="/leaderboard" class="font-semibold transition-colors hover:text-orange-400"
					>لوحة الصدارة</a
				>
			</div>

			<a href="/" class="flex items-center">
				<img
					src="https://i.ibb.co/v4pqP1XB/Dragon-Ball-Logo.webp"
					alt="Dragon Ball Logo"
					class="h-8 w-auto md:h-12"
				/>
			</a>

			{#if isMenuOpen}
				<div
					class="mt-4 flex w-full basis-full flex-col items-end gap-y-4 md:hidden"
					transition:slide
				>
					<a href="/quizzes" class="font-semibold transition-colors hover:text-orange-400"
						>الاختبارات</a
					>
					<a href="/leaderboard" class="font-semibold transition-colors hover:text-orange-400"
						>لوحة الصدارة</a
					>
					<div class="h-px w-full bg-gray-700"></div>
					{#if data.user}
						<div class="flex w-full flex-col items-end gap-y-4">
							<span class="text-gray-300" dir="rtl">أهلاً بك، {data.user.name}</span>
							<a
								href="/profile"
								class="w-full rounded bg-orange-600 px-4 py-2 text-center whitespace-nowrap hover:bg-orange-700"
								>ملفي الشخصي</a
							>
						</div>
					{:else}
						<div class="flex w-full flex-col items-stretch gap-y-2">
							<a
								href="/login"
								class="rounded px-4 py-2 text-center whitespace-nowrap hover:bg-gray-700"
								>تسجيل الدخول</a
							>
							<a
								href="/signup"
								class="rounded bg-orange-600 px-4 py-2 text-center whitespace-nowrap hover:bg-orange-700"
								>إنشاء حساب</a
							>
						</div>
					{/if}
				</div>
			{/if}
		</div>
	</nav>
	<main class="flex-1 overflow-y-auto pb-20">
		<slot />
	</main>
</div>

{#if !$page.params.chapter_number}
<nav
	class="fixed right-0 bottom-0 left-0 z-50 border-t border-gray-800 bg-gray-950/95 font-[El_Messiri] backdrop-blur md:hidden"
>
	<div class="flex h-16 items-center justify-around">
		<a href="/" class="flex flex-col items-center text-gray-300 hover:text-orange-400">
			<img
				src="https://i.ibb.co/1G85wXr8/home.webp"
				alt="الرئيسية"
				class="h-6 w-6"
			/>
			<span class="mt-1 text-xs">الرئيسية</span>
		</a>

		<a href="/quizzes" class="flex flex-col items-center text-gray-300 hover:text-orange-400">
			<img
				src="https://i.ibb.co/N6WHVMvF/quiz.webp"
				alt="الاختبارات"
				class="h-6 w-6"
			/>
			<span class="mt-1 text-xs">اختبارات</span>
		</a>

		<a href="/leaderboard" class="flex flex-col items-center text-gray-300 hover:text-orange-400">
			<svg
				xmlns="http://www.w3.org/2000/svg"
				class="h-6 w-6"
				viewBox="0 0 24 24"
				fill="none"
				stroke="currentColor"
				stroke-width="2"
				stroke-linecap="round"
				stroke-linejoin="round"
			>
				<path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6" />
				<path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18" />
				<path d="M4 22h16" />
				<path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22" />
				<path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22" />
				<path d="M18 2H6v7a6 6 0 0 0 12 0V2Z" />
			</svg>
			<span class="mt-1 text-xs">الترتيب</span>
		</a>

		<a href="/profile" class="flex flex-col items-center text-gray-300 hover:text-orange-400">
			<svg
				xmlns="http://www.w3.org/2000/svg"
				class="h-6 w-6"
				viewBox="0 0 24 24"
				fill="none"
				stroke="currentColor"
				stroke-width="2"
				stroke-linecap="round"
				stroke-linejoin="round"
			>
				<path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
				<circle cx="12" cy="7" r="4" />
			</svg>
			<span class="text-xs">حسابي</span>
		</a>
	</div>
</nav>
{/if}

<style>
	:global(:root:fullscreen #main-nav) {
		display: none;
	}
</style>
