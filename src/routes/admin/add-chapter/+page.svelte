<script lang="ts">
	export let data: {
		mangas: {
			id: string;
			title: string;
		}[];
	};

	export let form: any;
</script>

<svelte:head><title>إضافة فصل جديد</title></svelte:head>

<div class="min-h-screen bg-gray-900 p-8 font-[Tajawal] text-white">
	<a href="/admin" class="mb-8 block text-right text-blue-400 hover:underline">
		&larr; العودة إلى لوحة التحكم
	</a>
	<h1 class="mb-8 text-right text-4xl font-bold">أداة إضافة فصل جديد</h1>

	<div class="flex justify-end">
		<form
			method="POST"
			action="?/add"
			class="w-full max-w-xl space-y-6 rounded-lg bg-gray-800 p-8 text-right shadow-lg"
		>
			<div>
				<label for="manga" class="mb-2 block text-gray-300">اختر المانجا</label>
				<select
					name="manga"
					id="manga"
					class="w-full rounded border border-gray-600 bg-gray-700 p-2 text-right text-white"
					required
				>
					{#each data.mangas ?? [] as manga}
						<option value={manga.id}>{manga.title}</option>
					{/each}
				</select>
			</div>
			<div>
				<label for="chapterNumber" class="mb-2 block text-gray-300">رقم الفصل</label>
				<input
					type="number"
					name="chapter_number"
					id="chapterNumber"
					class="w-full rounded border border-gray-600 bg-gray-700 p-2 text-white"
					required
				/>
			</div>
			<div>
				<label for="title" class="mb-2 block text-gray-300">عنوان الفصل</label>
				<input
					type="text"
					name="title"
					id="title"
					class="w-full rounded border border-gray-600 bg-gray-700 p-2 text-white"
					required
				/>
			</div>

			<div>
				<label for="image_urls" class="mb-2 block text-gray-300">
					روابط الصفحات من ImgBB (رابط مباشر في كل سطر)
				</label>
				<textarea
					dir="ltr"
					name="image_urls"
					id="image_urls"
					rows="8"
					placeholder="https://i.ibb.co/xxxx/01.webp&#10;https://i.ibb.co/xxxx/02.webp&#10;https://i.ibb.co/xxxx/03.webp"
					class="w-full rounded border border-gray-600 bg-gray-700 p-3 font-mono text-sm text-white placeholder-gray-500 focus:border-orange-500 focus:outline-none"
					required
				></textarea>
				<p class="mt-2 text-xs text-gray-400" dir="rtl">
					ملاحظة: الصق قائمة الروابط المباشرة (Direct Links) دفعة واحدة. سيتم ترقيم الصفحات تلقائياً
					(1, 2, 3...) بنفس ترتيب الأسطر.
				</p>
			</div>

			{#if form?.error}
				<p class="text-center text-red-500">{form.error}</p>
			{/if}
			{#if form?.success}
				<p class="text-center text-green-500">{form.success}</p>
			{/if}

			<button
				type="submit"
				class="w-full rounded bg-green-600 px-4 py-3 font-bold text-white transition-colors hover:bg-green-700"
			>
				بدء الإضافة
			</button>
		</form>
	</div>
</div>
