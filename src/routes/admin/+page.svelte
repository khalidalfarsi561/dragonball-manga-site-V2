<script lang="ts">
	import type { PageData } from './$types';

	export let data: PageData;

	$: maxReads = Math.max(...data.mostReadMangas.map((manga) => manga.reads), 1);

	const statsCards = [
		{
			title: 'المانجا',
			value: data.stats.mangas,
			description: 'إجمالي الأعمال المنشورة',
			href: '/admin/mangas',
			icon: '📚',
			border: 'border-orange-500/25',
			bg: 'from-orange-500/20 to-orange-500/5',
			text: 'text-orange-300'
		},
		{
			title: 'الفصول',
			value: data.stats.chapters,
			description: 'إجمالي الفصول المتاحة',
			href: '/admin/add-chapter',
			icon: '📖',
			border: 'border-emerald-500/25',
			bg: 'from-emerald-500/20 to-emerald-500/5',
			text: 'text-emerald-300'
		},
		{
			title: 'المستخدمون',
			value: data.stats.users,
			description: 'عدد الأعضاء المسجلين',
			href: '/admin/users',
			icon: '👥',
			border: 'border-purple-500/25',
			bg: 'from-purple-500/20 to-purple-500/5',
			text: 'text-purple-300'
		},
		{
			title: 'التعليقات',
			value: data.stats.comments,
			description: 'إجمالي تفاعل المجتمع',
			href: '/admin/comments',
			icon: '💬',
			border: 'border-sky-500/25',
			bg: 'from-sky-500/20 to-sky-500/5',
			text: 'text-sky-300'
		}
	];

	const contentTools = [
		{
			title: 'إدارة المانجا',
			description: 'إضافة وتعديل الأعمال والفصول.',
			href: '/admin/mangas',
			icon: '📚',
			accent: 'text-blue-300'
		},
		{
			title: 'إضافة فصل جديد',
			description: 'إضافة فصل كامل بصفحاته تلقائيًا.',
			href: '/admin/add-chapter',
			icon: '⚡',
			accent: 'text-emerald-300'
		},
		{
			title: 'إدارة الاختبارات',
			description: 'إنشاء وتعديل الاختبارات والأسئلة.',
			href: '/admin/quizzes',
			icon: '🧠',
			accent: 'text-cyan-300'
		},
		{
			title: 'إدارة الوسائط',
			description: 'مراجعة الصور والملفات المرفوعة.',
			href: '/admin/media',
			icon: '🖼️',
			accent: 'text-yellow-300'
		}
	];

	const managementTools = [
		{
			title: 'إدارة المستخدمين',
			description: 'عرض المستخدمين وتعديل بياناتهم.',
			href: '/admin/users',
			icon: '👤',
			accent: 'text-purple-300'
		},
		{
			title: 'إدارة التعليقات',
			description: 'مراجعة وحذف وتعديل التعليقات.',
			href: '/admin/comments',
			icon: '🛡️',
			accent: 'text-red-300'
		},
		{
			title: 'إعدادات الموقع',
			description: 'التحكم في الإعدادات العامة للموقع.',
			href: '/admin/settings',
			icon: '⚙️',
			accent: 'text-teal-300'
		}
	];

	function getInitial(name: string | undefined | null) {
		return name?.trim()?.charAt(0)?.toUpperCase() || '؟';
	}

	function formatDate(date: string | undefined) {
		if (!date) return 'غير معروف';

		return new Date(date).toLocaleDateString('ar-OM', {
			year: 'numeric',
			month: 'short',
			day: 'numeric'
		});
	}
</script>

<svelte:head>
	<title>لوحة التحكم</title>
</svelte:head>

<div dir="rtl" class="min-h-screen overflow-hidden bg-[#070b12] font-[Tajawal] text-white">
	<div class="pointer-events-none fixed inset-0 overflow-hidden">
		<div class="absolute -top-40 -right-40 h-80 w-80 rounded-full bg-orange-500/10 blur-3xl"></div>
		<div class="absolute top-48 -left-44 h-96 w-96 rounded-full bg-blue-500/10 blur-3xl"></div>
		<div
			class="absolute right-1/2 bottom-0 h-72 w-72 translate-x-1/2 rounded-full bg-purple-500/10 blur-3xl"
		></div>
	</div>

	<main class="relative mx-auto max-w-7xl px-4 py-5 sm:px-6 lg:px-8 lg:py-10">
		<section
			class="overflow-hidden rounded-[2rem] border border-white/10 bg-gradient-to-br from-gray-900/95 via-gray-900 to-gray-950 p-5 shadow-2xl shadow-black/40 sm:p-8"
		>
			<div class="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
				<div class="max-w-2xl text-right">
					<div
						class="mb-4 inline-flex items-center gap-2 rounded-full border border-orange-500/20 bg-orange-500/10 px-4 py-2 text-xs font-bold text-orange-200"
					>
						<span class="h-2 w-2 rounded-full bg-orange-400 shadow-lg shadow-orange-500/50"></span>
						<span>لوحة إدارة الموقع</span>
					</div>

					<h1 class="text-3xl font-black tracking-tight text-white sm:text-4xl lg:text-5xl">
						لوحة التحكم
					</h1>

					<p class="mt-3 max-w-xl text-sm leading-7 text-gray-300 sm:text-base">
						إدارة محتوى دراغون بول، متابعة المستخدمين، مراجعة التعليقات، والتحكم في أدوات الموقع من
						مكان واحد بتصميم واضح ومريح على الهاتف والكمبيوتر.
					</p>
				</div>

				<div class="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:min-w-[360px]">
					<a
						href="/admin/add-chapter"
						class="group rounded-2xl border border-orange-500/20 bg-orange-500/10 p-4 text-right transition hover:-translate-y-1 hover:bg-orange-500/15"
					>
						<div class="text-2xl">⚡</div>
						<p class="mt-3 font-bold text-white">إضافة فصل سريع</p>
						<p class="mt-1 text-xs text-orange-100/80">ارفع فصل جديد مباشرة</p>
					</a>

					<a
						href="/admin/comments"
						class="group rounded-2xl border border-red-500/20 bg-red-500/10 p-4 text-right transition hover:-translate-y-1 hover:bg-red-500/15"
					>
						<div class="text-2xl">🛡️</div>
						<p class="mt-3 font-bold text-white">تعليقات تنتظر</p>
						<p class="mt-1 text-xs text-red-100/80">
							{data.latestComments.length} تعليق يحتاج مراجعة
						</p>
					</a>
				</div>
			</div>
		</section>

		<section class="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
			{#each statsCards as card}
				<a
					href={card.href}
					class="group relative overflow-hidden rounded-3xl border {card.border} bg-gradient-to-br {card.bg} p-5 shadow-xl shadow-black/20 transition duration-300 hover:-translate-y-1 hover:border-white/20 hover:shadow-2xl"
				>
					<div class="absolute -top-8 -left-8 h-24 w-24 rounded-full bg-white/5 blur-2xl"></div>

					<div class="relative flex items-start justify-between gap-4">
						<div class="text-right">
							<p class="text-sm font-bold text-gray-300">{card.title}</p>
							<p class="mt-2 text-4xl font-black {card.text} sm:text-5xl">
								{card.value}
							</p>
							<p class="mt-2 text-xs leading-6 text-gray-400">{card.description}</p>
						</div>

						<div
							class="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border border-white/10 bg-white/10 text-2xl transition group-hover:scale-110"
						>
							{card.icon}
						</div>
					</div>
				</a>
			{/each}
		</section>

		<section class="mt-6 grid grid-cols-1 gap-6 xl:grid-cols-[1.1fr_0.9fr]">
			<div
				class="rounded-[2rem] border border-white/10 bg-white/[0.04] p-4 shadow-xl shadow-black/20 sm:p-6"
			>
				<div class="mb-5 flex items-center justify-between gap-4">
					<div class="text-right">
						<h2 class="text-xl font-black text-white sm:text-2xl">أدوات المحتوى</h2>
						<p class="mt-1 text-sm text-gray-400">اختصارات إدارة المانجا والمحتوى.</p>
					</div>
				</div>

				<div class="grid grid-cols-1 gap-3 sm:grid-cols-2">
					{#each contentTools as tool}
						<a
							href={tool.href}
							class="group rounded-2xl border border-white/10 bg-gray-900/70 p-4 text-right transition duration-300 hover:-translate-y-1 hover:border-orange-500/30 hover:bg-gray-800/90"
						>
							<div class="flex items-start gap-4">
								<div
									class="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-white/10 text-2xl transition group-hover:scale-110"
								>
									{tool.icon}
								</div>

								<div>
									<h3 class="font-black {tool.accent}">{tool.title}</h3>
									<p class="mt-1 text-sm leading-6 text-gray-400">{tool.description}</p>
								</div>
							</div>
						</a>
					{/each}
				</div>
			</div>

			<div
				class="rounded-[2rem] border border-white/10 bg-white/[0.04] p-4 shadow-xl shadow-black/20 sm:p-6"
			>
				<div class="mb-5 text-right">
					<h2 class="text-xl font-black text-white sm:text-2xl">إدارة الموقع</h2>
					<p class="mt-1 text-sm text-gray-400">المستخدمون، التعليقات، والإعدادات.</p>
				</div>

				<div class="space-y-3">
					{#each managementTools as tool}
						<a
							href={tool.href}
							class="group flex items-center justify-between gap-4 rounded-2xl border border-white/10 bg-gray-900/70 p-4 transition duration-300 hover:-translate-y-1 hover:border-white/20 hover:bg-gray-800/90"
						>
							<div class="flex items-center gap-4">
								<div
									class="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-white/10 text-xl transition group-hover:scale-110"
								>
									{tool.icon}
								</div>
								<div class="text-right">
									<h3 class="font-black {tool.accent}">{tool.title}</h3>
									<p class="mt-1 text-xs leading-5 text-gray-400">{tool.description}</p>
								</div>
							</div>

							<span
								class="text-gray-500 transition group-hover:-translate-x-1 group-hover:text-white"
							>
								←
							</span>
						</a>
					{/each}
				</div>
			</div>
		</section>

		<section class="mt-6 grid grid-cols-1 gap-6 xl:grid-cols-2">
			<div
				class="rounded-[2rem] border border-white/10 bg-white/[0.04] p-4 shadow-xl shadow-black/20 sm:p-6"
			>
				<div class="mb-5 flex items-center justify-between gap-4">
					<div class="text-right">
						<h2 class="text-xl font-black text-white sm:text-2xl">أحدث المستخدمين</h2>
						<p class="mt-1 text-sm text-gray-400">آخر الحسابات المسجلة في الموقع.</p>
					</div>

					<a
						href="/admin/users"
						class="rounded-full border border-white/10 px-3 py-2 text-xs font-bold text-gray-300 transition hover:border-purple-500/40 hover:text-white"
					>
						عرض الكل
					</a>
				</div>

				<div class="space-y-3">
					{#each data.latestUsers as user}
						<a
							href="/admin/users/{user.id}"
							class="group flex items-center justify-between gap-4 rounded-2xl border border-white/10 bg-gray-900/70 p-4 transition hover:border-purple-500/30 hover:bg-gray-800"
						>
							<div class="flex min-w-0 items-center gap-3">
								<div
									class="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-purple-500/30 to-blue-500/20 font-black text-purple-100"
								>
									{getInitial(user.username)}
								</div>

								<div class="min-w-0 text-right">
									<p class="truncate font-bold text-white">{user.username || 'مستخدم بدون اسم'}</p>
									<p class="mt-1 truncate text-xs text-gray-400">{user.email || 'لا يوجد بريد'}</p>
								</div>
							</div>

							<span
								class="shrink-0 text-xs font-bold text-blue-300 transition group-hover:text-blue-200"
							>
								تفاصيل
							</span>
						</a>
					{:else}
						<div
							class="rounded-2xl border border-dashed border-white/10 p-8 text-center text-gray-400"
						>
							لا يوجد مستخدمون جدد.
						</div>
					{/each}
				</div>
			</div>

			<div
				class="rounded-[2rem] border border-white/10 bg-white/[0.04] p-4 shadow-xl shadow-black/20 sm:p-6"
			>
				<div class="mb-5 flex items-center justify-between gap-4">
					<div class="text-right">
						<h2 class="text-xl font-black text-white sm:text-2xl">تعليقات بانتظار الموافقة</h2>
						<p class="mt-1 text-sm text-gray-400">راجع التعليقات الجديدة قبل ظهورها.</p>
					</div>

					<a
						href="/admin/comments"
						class="rounded-full border border-white/10 px-3 py-2 text-xs font-bold text-gray-300 transition hover:border-red-500/40 hover:text-white"
					>
						مراجعة
					</a>
				</div>

				<div class="space-y-3">
					{#each data.latestComments as comment}
						<a
							href="/admin/comments"
							class="block rounded-2xl border border-white/10 bg-gray-900/70 p-4 text-right transition hover:border-red-500/30 hover:bg-gray-800"
						>
							<div class="mb-3 flex items-center justify-between gap-3">
								<span class="rounded-full bg-red-500/10 px-3 py-1 text-xs font-bold text-red-200">
									بانتظار الموافقة
								</span>

								<p class="text-sm font-bold text-orange-300">
									{comment.expand?.user?.username || 'مستخدم'}
								</p>
							</div>

							<div class="line-clamp-2 text-sm leading-7 text-gray-300">
								{@html comment.content}
							</div>

							<p class="mt-3 text-xs text-gray-500">{formatDate(comment.created)}</p>
						</a>
					{:else}
						<div class="rounded-2xl border border-dashed border-white/10 p-8 text-center">
							<div class="text-3xl">✅</div>
							<p class="mt-3 font-bold text-white">لا توجد تعليقات تنتظر المراجعة</p>
							<p class="mt-1 text-sm text-gray-400">كل شيء مرتب حاليًا.</p>
						</div>
					{/each}
				</div>
			</div>
		</section>

		<section
			class="mt-6 rounded-[2rem] border border-white/10 bg-white/[0.04] p-4 shadow-xl shadow-black/20 sm:p-6"
		>
			<div class="mb-5 flex flex-col gap-2 text-right sm:flex-row sm:items-end sm:justify-between">
				<div>
					<h2 class="text-xl font-black text-white sm:text-2xl">المانجا الأكثر قراءة</h2>
					<p class="mt-1 text-sm text-gray-400">ترتيب سريع حسب نشاط القراءة الحالي.</p>
				</div>

				<span class="text-xs text-gray-500">هذا القسم يعتمد على سجل القراءة المتاح</span>
			</div>

			<div class="space-y-4">
				{#each data.mostReadMangas as manga, index}
					<div class="rounded-2xl border border-white/10 bg-gray-900/70 p-4">
						<div class="mb-3 flex items-center justify-between gap-4">
							<div class="flex min-w-0 items-center gap-3">
								<span
									class="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-orange-500/15 text-sm font-black text-orange-200"
								>
									{index + 1}
								</span>

								<p class="truncate font-bold text-white">{manga.title}</p>
							</div>

							<span
								class="shrink-0 rounded-full bg-white/10 px-3 py-1 text-xs font-bold text-gray-200"
							>
								{manga.reads} قراءة
							</span>
						</div>

						<div class="h-2 overflow-hidden rounded-full bg-gray-800">
							<div
								class="h-full rounded-full bg-gradient-to-l from-orange-400 to-yellow-300"
								style="width: {Math.min((manga.reads / maxReads) * 100, 100)}%"
							></div>
						</div>
					</div>
				{:else}
					<div class="rounded-2xl border border-dashed border-white/10 p-8 text-center">
						<div class="text-3xl">📊</div>
						<p class="mt-3 font-bold text-white">لا توجد بيانات كافية بعد</p>
						<p class="mt-1 text-sm text-gray-400">سيظهر الترتيب بعد توفر قراءات أكثر.</p>
					</div>
				{/each}
			</div>
		</section>
	</main>
</div>

<style>
	.line-clamp-2 {
		display: -webkit-box;
		overflow: hidden;
		-webkit-box-orient: vertical;
		-webkit-line-clamp: 2;
		line-clamp: 2;
	}

	:global(body) {
		background: #070b12;
	}
</style>
