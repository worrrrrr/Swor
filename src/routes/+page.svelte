<script lang="ts">
	import { resolveBaziChart } from '$lib/engine/baziResolver';
	import { resolveEasternSystem } from '$lib/engine/easternEasternResolver';
	import { resolveWesternChart } from '$lib/engine/westernResolver';
	import { interpretHdResult } from '$lib/engine/hdInterpreter';
	import type { BirthDateTime } from '$lib/engine/astroEngine';

	let name = $state('Worakrit');
	let birthDate = $state('1992-08-08');
	let birthTime = $state('16:49');
	let latitude = $state(6.5411);
	let longitude = $state(101.2813);
	let timezoneOffset = $state(7);

	// สั่งคำนวณ Real-time ทุกครั้งที่ค่าในฟอร์มขยับ
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

	// เชื่อมต่อเอนจินแปลผล Human Design โดยดึงค่าตรงจาก westernResult
	let hdInterpretation = $derived.by(() => {
		if (!westernResult) return null;
		// ข้อมูลส่งตรงจากเอนจินที่คำนวณตามกฎ 1.72° และ 88 องศาถอยหลัง
		return interpretHdResult(
			westernResult.humanDesign.type,
			westernResult.humanDesign.profile,
		);
	});
</script>

<div class="min-h-screen bg-[#f8fafc] text-[#0f172a] font-sans antialiased select-text p-6">
	<div class="max-w-7xl mx-auto space-y-8">
		<section class="bg-white border border-slate-200 rounded-[2rem] p-6 shadow-sm">
			<h2 class="text-sm font-black mb-4">ปรับแต่งข้อมูลจริง (Live Data)</h2>
			<div class="grid grid-cols-1 md:grid-cols-4 gap-4 text-xs">
				<input
					type="text"
					bind:value={name}
					class="bg-slate-50 border rounded-xl p-3"
					placeholder="ชื่อ"
				/>
				<input type="date" bind:value={birthDate} class="bg-slate-50 border rounded-xl p-3" />
				<input type="time" bind:value={birthTime} class="bg-slate-50 border rounded-xl p-3" />
				<div class="flex gap-2">
					<input
						type="number"
						bind:value={latitude}
						step="0.0001"
						class="w-1/2 bg-slate-50 border rounded-xl p-3"
					/>
					<input
						type="number"
						bind:value={longitude}
						step="0.0001"
						class="w-1/2 bg-slate-50 border rounded-xl p-3"
					/>
				</div>
			</div>
		</section>
		{#if westernResult && hdInterpretation}
			<div class="grid grid-cols-1 md:grid-cols-3 gap-6">
				<div class="bg-white border border-slate-200 p-6 rounded-[2rem] shadow-sm">
					<h3 class="text-[10px] font-bold text-slate-500 uppercase">Profile</h3>
					<p class="text-2xl font-black text-cyan-600">{westernResult.humanDesign.incarnationCrossGates}</p>
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
					<p class="text-xl font-black text-indigo-600">{westernResult.hdAuthority}</p>
				</div>
			</div>
		{/if}
	</div>
	
	<details>
		<summary> Bazi Result: </summary>
		{JSON.stringify(baziResult)}
	</details>
	<details>
		<summary> easternResult: </summary>
		{JSON.stringify(easternResult)}
	</details>
	<details>
		<summary> Western Result: </summary>
		{JSON.stringify(westernResult)}
	</details>
	<details>
		<summary> hdInterpretation Result: </summary>
		{JSON.stringify(hdInterpretation)}
	</details>

</div>	

