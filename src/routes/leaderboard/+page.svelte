<script lang="ts">
	import type { PageData } from './$types';
	export let data: PageData;

	function getRankClass(rank: number): string {
		if (rank === 1) return 'bg-yellow-500/10 text-yellow-300';
		if (rank === 2) return 'bg-gray-400/10 text-gray-200';
		if (rank === 3) return 'bg-orange-700/10 text-orange-400';
		return 'border-gray-700';
	}
</script>

<svelte:head>
	<title>لوحة الصدارة</title>
</svelte:head>

<div class="min-h-screen bg-gray-900 p-8 font-[Tajawal] text-white" dir="rtl">
	<div class="container mx-auto">
		<h1 class="mb-5 text-center text-3xl font-bold whitespace-nowrap text-orange-400">
			لوحة صدارة المحاربين
		</h1>
		<p class="mb-12 text-center text-base text-gray-300">
			شاهد ترتيب أقوى المقاتلين في الموقع بناءً على مستوى طاقتهم
		</p>

		<div class="mx-auto max-w-4xl overflow-hidden rounded-lg bg-gray-800 shadow-2xl" dir="rtl">
			<table class="w-full text-center">
				<thead class="bg-gray-700 whitespace-nowrap">
					<tr>
						<th class="w-20 p-2 text-sm">الترتيب</th>
						<th class="p-2 text-sm">اسم المحارب</th>
						<th class="p-2 text-sm">مستوى الطاقة</th>
						<th class="p-2 text-sm">الخبرة</th>
					</tr>
				</thead>
				<tbody>
					{#each data.users as user, i}
						{@const rank = i + 1}
						<tr class="border-b transition-colors duration-300 {getRankClass(rank)}">
							<td class="p-4 text-2xl font-bold">
								{#if rank === 1}<span>🥇</span>{:else if rank === 2}<span>🥈</span
									>{:else if rank === 3}<span>🥉</span>{:else}<span>{rank}</span>{/if}
							</td>
							<td class="p-4 text-center font-semibold">
								<span>{user.displayName}</span>

								{#if user.title === 'محارب Z'}
									<div class="relative ml-2 inline-block h-9 w-9 align-middle" title="محارب Z">
										<video
											src="/images/z-warrior-medal.webm"
											autoplay
											loop
											muted
											playsinline
											class="absolute top-0 left-0 h-full w-full rounded-full object-cover"
										></video>
									</div>
								{:else if user.title}
									<span
										class="ml-2 rounded-full bg-yellow-500 px-2 py-0.5 align-middle text-xs text-black"
									>
										{user.title}
									</span>
								{/if}
							</td>
							<td class="p-4 font-mono text-lg text-green-400">{user.power_level}</td>
							<td class="p-4 font-mono text-gray-400">{user.xp}</td>
						</tr>
					{/each}
				</tbody>
			</table>
		</div>
	</div>
</div>
