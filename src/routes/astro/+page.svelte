<script lang="ts">
	import { onMount } from 'svelte';
	import { goto } from '$app/navigation';
	import { supabase } from '$lib/supabaseClient';
	import { resolveBaziChart } from '$lib/engine/baziResolver';
	import { resolveEasternSystem } from '$lib/engine/easternEasternResolver';
	import { resolveWesternChart } from '$lib/engine/westernResolver';
	import { interpretHdResult } from '$lib/engine/hdInterpreter';
	import { interpretBazi } from '$lib/engine/baziInterpreter';
	import { interpretEastern } from '$lib/engine/easternInterpreter';
	import type { BirthDateTime } from '$lib/engine/astroEngine';

	let name = $state('');
	let birthDate = $state('');
	let birthTime = $state('16:49');
	let latitude = $state(6.5411);
	let longitude = $state(101.2813);
	let timezoneOffset = $state(7);

	let showDebug = $state(false);
	let saving = $state(false);
	let saveMsg = $state('');
	let profileLoaded = $state(false);

	let personalityMbti = $state('');
	let personalityEnneagram = $state(0);
	let personalityWing = $state('');
	let personalityHistory = $state<any[]>([]);
	let showPersonality = $state(false);
	let astroHistory = $state<any[]>([]);
	let showAstroHistory = $state(false);

	function loadHistoryEntry(entry: any) {
		if (entry.birth_date) birthDate = entry.birth_date;
		if (entry.birth_time) birthTime = entry.birth_time;
		if (entry.name) name = entry.name;
		if (entry.latitude != null) latitude = entry.latitude;
		if (entry.longitude != null) longitude = entry.longitude;
		if (entry.timezoneOffset != null) timezoneOffset = entry.timezoneOffset;
		showAstroHistory = false;
	}

	onMount(async () => {
		const { data: { user } } = await supabase.auth.getUser();
		if (user?.user_metadata) {
			const meta = user.user_metadata;
			if (meta.birth_date) birthDate = meta.birth_date;
			if (meta.birth_time) birthTime = meta.birth_time;
			if (meta.name) name = meta.name;
			if (meta.latitude != null) latitude = Number(meta.latitude);
			if (meta.longitude != null) longitude = Number(meta.longitude);
			if (meta.timezoneOffset != null) timezoneOffset = Number(meta.timezoneOffset);
			if (meta.personality_mbti) personalityMbti = meta.personality_mbti;
			if (meta.personality_enneagram) personalityEnneagram = meta.personality_enneagram;
			if (meta.personality_enneagram_wing) personalityWing = meta.personality_enneagram_wing;
			if (meta.personality_history) personalityHistory = meta.personality_history;
			if (meta.astro_history) astroHistory = meta.astro_history;
		}
		profileLoaded = true;
	});

	async function saveProfile() {
		saving = true;
		saveMsg = '';

		const entry = {
			name,
			birth_date: birthDate,
			birth_time: birthTime,
			latitude,
			longitude,
			timezoneOffset,
			timestamp: new Date().toISOString(),
		};

		const { error } = await supabase.auth.updateUser({
			data: {
				name,
				birth_date: birthDate,
				birth_time: birthTime,
				latitude,
				longitude,
				timezoneOffset,
				astro_history: [...astroHistory, entry],
			}
		});

		if (!error) astroHistory = [...astroHistory, entry];
		saving = false;
		saveMsg = error ? 'บันทึกไม่สำเร็จ' : 'บันทึกแล้ว ✅';
		setTimeout(() => saveMsg = '', 3000);
	}

	async function deleteProfile() {
		if (!confirm('ลบข้อมูลส่วนตัวทั้งหมด?')) return;
		await supabase.auth.updateUser({
			data: { name: '', birth_date: '', birth_time: '', latitude: 6.5411, longitude: 101.2813, timezoneOffset: 7 }
		});
		birthDate = '';
		birthTime = '16:49';
		latitude = 6.5411;
		longitude = 101.2813;
		timezoneOffset = 7;
		name = '';
		saveMsg = 'ลบข้อมูลแล้ว';
		setTimeout(() => saveMsg = '', 3000);
	}

	let deletingAstroIdx = $state<number | null>(null);

	async function deleteAstroEntry(index: number) {
		if (!confirm('ลบประวัตินี้?')) return;
		deletingAstroIdx = index;
		const newHistory = astroHistory.filter((_, i) => i !== index);
		const { data: { user } } = await supabase.auth.getUser();
		const meta = user?.user_metadata || {};
		await supabase.auth.updateUser({ data: { ...meta, astro_history: newHistory } });
		astroHistory = newHistory;
		deletingAstroIdx = null;
	}

	let birthInput = $derived.by(() => {
		if (!birthDate || !birthTime) return null;
		const [year, month, day] = birthDate.split('-').map(Number);
		const [hour, minute] = birthTime.split(':').map(Number);
		return { year, month, day, hour, minute, timezoneOffset } as BirthDateTime;
	});

	let baziResult = $derived(birthInput ? resolveBaziChart(birthInput, longitude) : null);
	let easternResult = $derived(birthInput ? resolveEasternSystem(birthInput, longitude) : null);
	let westernResult = $derived(
		birthInput ? resolveWesternChart(birthInput, latitude, longitude) : null
	);

	let hdInterpretation = $derived.by(() => {
		if (!westernResult) return null;
		return interpretHdResult(
			westernResult.humanDesign.type,
			westernResult.humanDesign.profile,
			westernResult.humanDesign.authority,
			westernResult.humanDesign.definedCenters
		);
	});

	let baziInterpretation = $derived.by(() => {
		if (!baziResult) return null;
		return interpretBazi(baziResult);
	});

	let easternInterpretation = $derived.by(() => {
		if (!easternResult) return null;
		return interpretEastern(easternResult);
	});

	function toggleDebug() {
		showDebug = !showDebug;
	}
</script>

<div class="min-h-screen bg-[#f8fafc] text-[#0f172a] font-sans antialiased select-text p-6">
	<div class="max-w-7xl mx-auto space-y-8">
		
		<!-- Input Form -->
		<section class="bg-white border border-slate-200 rounded-[2rem] p-6 shadow-sm">
			<div class="flex items-center justify-between mb-4">
				<h2 class="text-sm font-black">ปรับแต่งข้อมูลจริง (Live Data)</h2>
				<div class="flex items-center gap-2">
					{#if saveMsg}
						<span class="text-xs text-emerald-600 font-medium">{saveMsg}</span>
					{/if}
					<button onclick={saveProfile} disabled={saving || !profileLoaded} class="text-xs px-3 py-1.5 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-40 font-medium" type="button">
						{saving ? 'บันทึก...' : '💾 บันทึก Profile'}
					</button>
					<button onclick={deleteProfile} class="text-xs px-3 py-1.5 bg-transparent text-red-400 rounded-lg hover:bg-red-50 font-medium" type="button" title="ลบข้อมูล">🗑</button>
				</div>
			</div>
			<div class="grid grid-cols-1 md:grid-cols-4 gap-4 text-xs">
				<input type="text" bind:value={name} class="bg-slate-50 border rounded-xl p-3" placeholder="ชื่อ" />
				<input type="date" bind:value={birthDate} class="bg-slate-50 border rounded-xl p-3" />
				<input type="time" bind:value={birthTime} class="bg-slate-50 border rounded-xl p-3" />
				<div class="flex gap-2">
					<input type="number" bind:value={latitude} step="0.0001" class="w-1/2 bg-slate-50 border rounded-xl p-3" />
					<input type="number" bind:value={longitude} step="0.0001" class="w-1/2 bg-slate-50 border rounded-xl p-3" />
				</div>
			</div>
		</section>

		<!-- Astro History -->
		{#if astroHistory.length > 0}
			<section class="bg-white border border-slate-200 rounded-[2rem] p-6 shadow-sm">
				<button onclick={() => showAstroHistory = !showAstroHistory} class="w-full flex items-center justify-between" type="button">
					<h2 class="text-sm font-black">📜 ประวัติการดูดวง</h2>
					<span class="text-xs text-slate-400">{showAstroHistory ? '▲' : '▼'}</span>
				</button>
				{#if showAstroHistory}
					<div class="mt-4 space-y-2">
						{#each [...astroHistory].reverse() as entry, i}
							<div class="flex items-center gap-1.5">
								<button class="flex-1 flex items-center gap-3 text-xs text-slate-600 bg-slate-50 hover:bg-blue-50 hover:border-blue-200 rounded-xl px-4 py-3 text-left transition-all border border-transparent" onclick={() => loadHistoryEntry(entry)} type="button">
									<div class="flex-1 min-w-0">
										<div class="flex gap-2 items-center">
											<span class="font-medium text-slate-800">{entry.name || 'ไม่ระบุชื่อ'}</span>
											<span class="text-slate-400">|</span>
											<span>{entry.birth_date || ''} {entry.birth_time || ''}</span>
										</div>
										<div class="text-slate-400 mt-0.5">
											{entry.latitude != null ? `${entry.latitude}, ${entry.longitude}` : ''}
											{entry.timezoneOffset != null ? `UTC+${entry.timezoneOffset}` : ''}
										</div>
									</div>
									<span class="text-slate-400 shrink-0">{new Date(entry.timestamp).toLocaleDateString('th-TH', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
								</button>
								<button class="btn-del-astro" onclick={() => deleteAstroEntry(astroHistory.length - 1 - i)} disabled={deletingAstroIdx === astroHistory.length - 1 - i} type="button" title="ลบ">🗑</button>
							</div>
						{/each}
					</div>
				{/if}
			</section>
		{/if}

		{#if westernResult && hdInterpretation}
			<!-- Human Design Section -->
			<section class="bg-white border border-slate-200 rounded-[2rem] p-6 shadow-sm">
				<h2 class="text-sm font-black mb-4">Human Design</h2>
				<div class="grid grid-cols-1 md:grid-cols-3 gap-6">
					<div class="bg-white border border-slate-200 p-6 rounded-[2rem] shadow-sm">
						<h3 class="text-[10px] font-bold text-slate-500 uppercase">Profile</h3>
						<p class="text-2xl font-black text-cyan-600">{westernResult.humanDesign.profile}</p>
						<p class="text-xs text-slate-600 mt-2">{hdInterpretation.profileName}</p>
						<p class="text-xs text-slate-600 mt-2">{hdInterpretation.profileDescription}</p>
					</div>
					<div class="bg-white border border-slate-200 p-6 rounded-[2rem] shadow-sm">
						<h3 class="text-[10px] font-bold text-slate-500 uppercase">Type</h3>
						<p class="text-xl font-black text-emerald-600">{westernResult.humanDesign.type}</p>
						<p class="text-xs text-slate-600 mt-2">{hdInterpretation.typeName}</p>
						<p class="text-xs text-slate-600 mt-2">{hdInterpretation.typeAura}</p>
						<p class="text-xs text-slate-600 mt-2">{hdInterpretation.typeNotSelf}</p>
					</div>
					<div class="bg-white border border-slate-200 p-6 rounded-[2rem] shadow-sm">
						<h3 class="text-[10px] font-bold text-slate-500 uppercase">Authority</h3>
						<p class="text-xl font-black text-indigo-600">{westernResult.humanDesign.authority}</p>
						<p class="text-xs text-slate-600 mt-2">{westernResult.humanDesign.incarnationCrossGates}</p>
						<p class="text-xs text-slate-600 mt-2">{westernResult.humanDesign.definedCenters.join(', ')}</p>
						<p class="text-xs text-slate-600 mt-2">Gates: {westernResult.humanDesign.activeGates.length}</p>
						<p class="text-xs text-slate-600 mt-2">{westernResult.humanDesign.definition}</p>
					</div>
				</div>
			</section>
		{/if}

		<!-- Bazi Section -->
		{#if baziResult && baziInterpretation}
			<section class="bg-white border border-slate-200 rounded-[2rem] p-6 shadow-sm">
				<h2 class="text-sm font-black mb-4">Bazi (八字) - โหราศาสตร์จีน</h2>
				
				<!-- Summary -->
				<div class="bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 rounded-2xl p-4 mb-6">
					<p class="text-xs text-amber-800 italic">"{baziInterpretation.summary}"</p>
				</div>

				<div class="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
					<!-- Day Master -->
					<div class="bg-white border border-slate-200 rounded-2xl p-4">
						<p class="text-[10px] font-bold text-slate-500 uppercase mb-2">ธาตุประจำตัว (Day Master)</p>
						<p class="text-2xl font-black text-amber-700 mb-2">{baziInterpretation.dayMaster.element}</p>
						<p class="text-xs text-slate-600 mb-1">{baziInterpretation.dayMaster.meaning}</p>
						<p class="text-xs text-slate-600 mb-1">👤 {baziInterpretation.dayMaster.traits}</p>
						<p class="text-xs text-slate-600 mb-1">💼 {baziInterpretation.dayMaster.career}</p>
						<p class="text-xs text-slate-600">❤️ {baziInterpretation.dayMaster.relationships}</p>
					</div>

					<!-- Year Animal -->
					<div class="bg-white border border-slate-200 rounded-2xl p-4">
						<p class="text-[10px] font-bold text-slate-500 uppercase mb-2">ปีนักษัตร</p>
						<p class="text-2xl font-black text-red-600 mb-2">{baziInterpretation.yearAnimal.name}</p>
						<p class="text-xs text-slate-600 mb-1">📝 {baziInterpretation.yearAnimal.traits}</p>
						<p class="text-xs text-slate-600 mb-1">🍀 {baziInterpretation.yearAnimal.lucky}</p>
						<p class="text-xs text-slate-600">💼 {baziInterpretation.yearAnimal.career}</p>
					</div>
				</div>

				<!-- Four Pillars -->
				<div class="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
					<div class="bg-slate-50 border border-slate-200 rounded-2xl p-4">
						<p class="text-[10px] font-bold text-slate-500 uppercase">year</p>
						<p class="text-lg font-black">{baziResult.year.code}</p>
						<p class="text-xs text-slate-500">{baziResult.year.element}</p>
						<p class="text-xs text-slate-400">{baziResult.year.animal}</p>
					</div>
					<div class="bg-slate-50 border border-slate-200 rounded-2xl p-4">
						<p class="text-[10px] font-bold text-slate-500 uppercase">month</p>
						<p class="text-lg font-black">{baziResult.month.code}</p>
						<p class="text-xs text-slate-500">{baziResult.month.element}</p>
						<p class="text-xs text-slate-400">{baziResult.month.animal}</p>
					</div>
					<div class="bg-slate-50 border border-slate-200 rounded-2xl p-4">
						<p class="text-[10px] font-bold text-slate-500 uppercase">day</p>
						<p class="text-lg font-black">{baziResult.day.code}</p>
						<p class="text-xs text-slate-500">{baziResult.day.element}</p>
						<p class="text-xs text-slate-400">{baziResult.day.animal}</p>
					</div>
					<div class="bg-slate-50 border border-slate-200 rounded-2xl p-4">
						<p class="text-[10px] font-bold text-slate-500 uppercase">hour</p>
						<p class="text-lg font-black">{baziResult.hour.code}</p>
						<p class="text-xs text-slate-500">{baziResult.hour.element}</p>
						<p class="text-xs text-slate-400">{baziResult.hour.animal}</p>
					</div>
				</div>

				<!-- Personality -->
				<div class="grid grid-cols-1 md:grid-cols-3 gap-6">
					<div class="bg-green-50 border border-green-200 rounded-2xl p-4">
						<p class="text-[10px] font-bold text-green-600 uppercase mb-2">💪 จุดแข็ง</p>
						<ul class="text-xs text-slate-600 space-y-1">
							{#each baziInterpretation.personality.strengths as strength}
								<li>• {strength}</li>
							{/each}
						</ul>
					</div>
					<div class="bg-red-50 border border-red-200 rounded-2xl p-4">
						<p class="text-[10px] font-bold text-red-600 uppercase mb-2">⚠️ จุดอ่อน</p>
						<ul class="text-xs text-slate-600 space-y-1">
							{#each baziInterpretation.personality.weaknesses as weakness}
								<li>• {weakness}</li>
							{/each}
						</ul>
					</div>
					<div class="bg-blue-50 border border-blue-200 rounded-2xl p-4">
						<p class="text-[10px] font-bold text-blue-600 uppercase mb-2">🌈 การใช้ชีวิต</p>
						<p class="text-xs text-slate-600">{baziInterpretation.personality.lifestyle}</p>
					</div>
				</div>

				<!-- Lucky Elements -->
				<div class="bg-purple-50 border border-purple-200 rounded-2xl p-4 mt-6">
					<p class="text-[10px] font-bold text-purple-600 uppercase mb-2">🍀 ธาตุที่สนับสนุน</p>
					<div class="flex gap-2 mb-2">
						{#each baziInterpretation.elements.supportive as element}
							<span class="bg-purple-100 text-purple-700 px-3 py-1 rounded-full text-xs font-medium">{element}</span>
						{/each}
					</div>
					<p class="text-xs text-slate-600">เลขนำโชค: {baziInterpretation.elements.luckyNumbers} | สีมงคล: {baziInterpretation.elements.luckyColors}</p>
				</div>
			</section>
		{/if}

		<!-- Eastern Section -->
		{#if easternResult && easternInterpretation}
			<section class="bg-white border border-slate-200 rounded-[2rem] p-6 shadow-sm">
				<h2 class="text-sm font-black mb-4">Eastern System - โหราศาสตร์ตะวันออก</h2>
				
				<div class="grid grid-cols-1 md:grid-cols-2 gap-6">
					<!-- Vedic -->
					<div class="bg-purple-50 border border-purple-200 rounded-2xl p-4">
						<h3 class="text-[10px] font-bold text-purple-600 uppercase mb-3">🕉️ โหราศาสตร์อินเดีย (Vedic)</h3>
						<div class="space-y-3">
							<div>
								<p class="text-[10px] text-slate-500">ลัคนา (Lagna)</p>
								<p class="text-lg font-bold text-purple-700">{easternResult.vedic.lagna}</p>
								<p class="text-xs text-slate-600">{easternInterpretation.vedic.lagna.description}</p>
								<p class="text-xs text-slate-500 mt-1">ธาตุ: {easternInterpretation.vedic.lagna.element} | ดาวประจำราศี: {easternInterpretation.vedic.lagna.ruler}</p>
							</div>
							<div>
								<p class="text-[10px] text-slate-500">นักษัตร (Nakshatra)</p>
								<p class="text-sm font-bold text-purple-700">{easternResult.vedic.nakshatra}</p>
								<p class="text-xs text-slate-600">{easternInterpretation.vedic.nakshatra.description}</p>
							</div>
							<div>
								<p class="text-[10px] text-slate-500">ดวงชะตาปัจจุบัน (Dasha)</p>
								<p class="text-sm font-bold text-purple-700">{easternResult.vedic.currentDasha}</p>
								<p class="text-xs text-slate-600">{easternInterpretation.vedic.currentDasha.description}</p>
							</div>
						</div>
					</div>

					<!-- Thai -->
					<div class="bg-emerald-50 border border-emerald-200 rounded-2xl p-4">
						<h3 class="text-[10px] font-bold text-emerald-600 uppercase mb-3">🏯 โหราศาสตร์ไทย</h3>
						<div class="space-y-3">
							<div>
								<p class="text-[10px] text-slate-500">ราศรี</p>
								<p class="text-lg font-bold text-emerald-700">{easternResult.thai.rasri}</p>
								<p class="text-xs text-slate-600">{easternInterpretation.thai.rasri.description}</p>
							</div>
							<div>
								<p class="text-[10px] text-slate-500">วันตามปฏิทินล้านนา</p>
								<p class="text-sm font-bold text-emerald-700">{easternResult.thai.lannaDay}</p>
								<p class="text-xs text-slate-600">{easternInterpretation.thai.lannaDay.description}</p>
							</div>
							<div>
								<p class="text-[10px] text-slate-500">ดิถี</p>
								<p class="text-sm font-bold text-emerald-700">{easternResult.thai.tithi}</p>
								<p class="text-xs text-slate-600">{easternInterpretation.thai.tithi.description}</p>
							</div>
							<div>
								<p class="text-[10px] text-slate-500">ปีนักษัตร</p>
								<p class="text-sm font-bold text-emerald-700">{easternResult.thai.naksatYear}</p>
								<p class="text-xs text-slate-600">{easternInterpretation.thai.naksatYear.description}</p>
							</div>
						</div>
					</div>
				</div>
			</section>
		{/if}

	
	</div>
</div>