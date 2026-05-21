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
			<a
				href="/profile"
				class="md:hidden"
				aria-label="الملف الشخصي"
			>
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
	<main class="flex-1 overflow-y-auto">
		<slot />
	</main>
</div>

<style>
	:global(:root:fullscreen #main-nav) {
		display: none;
	}
</style>
