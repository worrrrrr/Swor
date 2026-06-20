<script lang="ts">
	import { resolveBaziChart } from '$lib/engine/baziResolver';
	import { resolveWesternAndHd } from '$lib/engine/westernResolver';
	import { resolveEasternSystem } from '$lib/engine/easternEasternResolver';
	import type { BirthDateTime } from '$lib/engine/astroEngine';

	interface LocationSuggestion {
		name: string;
		lat: number;
		lng: number;
		timezone: number;
	}

	// =========================================================================
	// LOCAL GLOBAL DATABASE (ฐานข้อมูลเมืองสำคัญรอบโลก ค้นหาได้ทันทีตั้งแต่ตัวอักษรแรก)so
	// =========================================================================
	const globalLocationDatabase: LocationSuggestion[] = [
		// ประเทศไทย (ครบทุกภูมิภาคหลัก)
		{ name: "Bangkok, Thailand", lat: 13.7563, lng: 100.5018, timezone: 7 },
		{ name: "Yala, Thailand", lat: 6.5399, lng: 101.2813, timezone: 7 },
		{ name: "Chiang Mai, Thailand", lat: 18.7883, lng: 98.9853, timezone: 7 },
		{ name: "Phuket, Thailand", lat: 7.8804, lng: 98.3923, timezone: 7 },
		{ name: "Chon Buri, Thailand", lat: 13.3611, lng: 100.9847, timezone: 7 },
		{ name: "Nakhon Ratchasima, Thailand", lat: 14.9799, lng: 102.0978, timezone: 7 },
		{ name: "Songkhla (Hat Yai), Thailand", lat: 7.0084, lng: 100.4747, timezone: 7 },
		
		// เอเชีย & โอเชียเนีย
		{ name: "Tokyo, Japan", lat: 35.6762, lng: 139.6503, timezone: 9 },
		{ name: "Osaka, Japan", lat: 34.6937, lng: 135.5023, timezone: 9 },
		{ name: "Seoul, South Korea", lat: 37.5665, lng: 126.9780, timezone: 9 },
		{ name: "Taipei, Taiwan", lat: 25.0330, lng: 121.5654, timezone: 8 },
		{ name: "Hong Kong", lat: 22.3193, lng: 114.1694, timezone: 8 },
		{ name: "Singapore", lat: 1.3521, lng: 103.8198, timezone: 8 },
		{ name: "Kuala Lumpur, Malaysia", lat: 3.1390, lng: 101.6869, timezone: 8 },
		{ name: "Jakarta, Indonesia", lat: -6.2088, lng: 106.8456, timezone: 7 },
		{ name: "Beijing, China", lat: 39.9042, lng: 116.4074, timezone: 8 },
		{ name: "Shanghai, China", lat: 31.2304, lng: 121.4737, timezone: 8 },
		{ name: "Sydney, Australia", lat: -33.8688, lng: 151.2093, timezone: 10 },
		{ name: "Melbourne, Australia", lat: -37.8136, lng: 144.9631, timezone: 10 },
		{ name: "New Delhi, India", lat: 28.6139, lng: 77.2090, timezone: 5.5 },
		
		// ยุโรป
		{ name: "London, United Kingdom", lat: 51.5074, lng: -0.1278, timezone: 1 },
		{ name: "Paris, France", lat: 48.8566, lng: 2.3522, timezone: 2 },
		{ name: "Berlin, Germany", lat: 52.5200, lng: 13.4050, timezone: 2 },
		{ name: "Rome, Italy", lat: 41.9028, lng: 12.4964, timezone: 2 },
		{ name: "Zurich, Switzerland", lat: 47.3769, lng: 8.5417, timezone: 2 },
		{ name: "Amsterdam, Netherlands", lat: 52.3676, lng: 4.9041, timezone: 2 },
		
		// อเมริกา
		{ name: "New York, United States", lat: 40.7128, lng: -74.0060, timezone: -4 },
		{ name: "Los Angeles, United States", lat: 34.0522, lng: -118.2437, timezone: -7 },
		{ name: "Chicago, United States", lat: 41.8781, lng: -87.6298, timezone: -5 },
		{ name: "San Francisco, United States", lat: 37.7749, lng: -122.4194, timezone: -7 },
		{ name: "Vancouver, Canada", lat: 49.2827, lng: -123.1207, timezone: -7 },
		{ name: "Toronto, Canada", lat: 43.6532, lng: -79.3832, timezone: -4 }
	];

	// =========================================================================
	// STATE MANAGEMENT (Svelte 5 Runes)
	// =========================================================================
	let birthDate = $state<string>("1992-08-08"); 
	let birthTime = $state<string>("16:49");
	
	let locationQuery = $state<string>("Yala, Thailand");
	let latitude = $state<number>(6.5399);
	let longitude = $state<number>(101.2813);
	let timezoneOffset = $state<number>(7);
	
	let suggestions = $state<LocationSuggestion[]>([]);
	let showSuggestions = $state<boolean>(false);
	let activeTab = $state<string>("bazi");

	// =========================================================================
	// INSTANT LOCATION SEARCH CONTROLLER (พิมพ์ปุ๊บแสดงผลทันที ไม่ต้องพึ่งพาเน็ต)
	// =========================================================================
	function handleLocationInput(e: Event) {
		const input = (e.target as HTMLInputElement).value;
		locationQuery = input;

		// ถ้าไม่มีการกรอกข้อมูล ให้ปิด Dropdown ทันที
		if (input.trim().length === 0) {
			suggestions = [];
			showSuggestions = false;
			return;
		}

		// ค้นหาคำแบบ Case-insensitive ทันทีตั้งแต่ตัวอักษรแรกที่กดลงไป
		suggestions = globalLocationDatabase.filter(loc => 
			loc.name.toLowerCase().includes(input.toLowerCase())
		);
		
		showSuggestions = suggestions.length > 0;
	}

	function selectLocation(loc: LocationSuggestion) {
		locationQuery = loc.name;
		latitude = loc.lat;
		longitude = loc.lng;
		timezoneOffset = loc.timezone;
		showSuggestions = false;
	}

	// =========================================================================
	// DYNAMIC RE-ACTIVATE PIPELINE (ลอจิกรักษาระดับโฟกัส ป้องกันการเด้งหนี)
	// =========================================================================
	let finalResult = $derived.by(() => {
		// ป้องกันการประมวลผลล้มเหลวระหว่างพิมพ์ปฏิทินในเสี้ยววินาทีที่ข้อความยังไม่สมบูรณ์
		if (!birthDate || birthDate.length < 10) {
			return createEmptyResult();
		}

		const parts = birthDate.split('-');
		const year = parseInt(parts[0], 10);
		const month = parseInt(parts[1], 10);
		const day = parseInt(parts[2], 10);

		if (isNaN(year) || isNaN(month) || isNaN(day) || year < 1000) {
			return createEmptyResult();
		}

		const [hour, minute] = birthTime.split(':').map(Number);
		const birthConfig: BirthDateTime = { 
			year, month, day, 
			hour: isNaN(hour) ? 12 : hour, 
			minute: isNaN(minute) ? 0 : minute, 
			timezoneOffset 
		};

		const baziData = resolveBaziChart(birthConfig, longitude);
		const westernAndHdData = resolveWesternAndHd(birthConfig, latitude, longitude);
		const easternSystemData = resolveEasternSystem(birthConfig, longitude);

		return {
			julianDay: baziData.julianDay,
			solarTime: baziData.solarTimeActual,
			bazi: baziData,
			western: westernAndHdData.western,
			humanDesign: westernAndHdData.humanDesign,
			vedic: easternSystemData.vedic,
			thai: easternSystemData.thai
		};
	});

	function createEmptyResult() {
		return {
			julianDay: "0.0000", solarTime: "00:00",
			bazi: { year: {code:"--", element:"--", animal:"--"}, month: {code:"--", element:"--", animal:"--"}, day: {code:"--", element:"--", animal:"--"}, hour: {code:"--", element:"--", animal:"--"}, dayMaster: "--" },
			western: { sunSign: "--", moonSign: "--", ascendant: "--" },
			humanDesign: { type: "--", profile: "--", authority: "--", incarnationCross: "--", definedCenters: [] },
			vedic: { lagna: "--", rashi: "--", nakshatra: "--", currentDasha: "--" },
			thai: { rasri: "--", lannaDay: "--", tithi: "--", naksatYear: "--" }
		};
	}
</script>

<main class="min-h-screen bg-slate-900 text-slate-100 p-4 md:p-8">
	<div class="max-w-6xl mx-auto">
		
		<header class="mb-8 border-b border-slate-800 pb-4">
			<h1 class="text-3xl font-black bg-gradient-to-r from-amber-400 via-emerald-400 to-indigo-400 bg-clip-text text-transparent">
				OmniAstrology Engine Matrix
			</h1>
			<p class="text-slate-400 text-xs mt-1">ระบบดาราศาสตร์ประยุกต์ความเร็วสูง ค้นหาพิกัดโลกทันทีแบบไร้แรงหน่วง</p>
		</header>

		<div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
			
			<section class="bg-slate-800 border border-slate-700 rounded-2xl p-5 space-y-4 shadow-xl h-fit">
				<h2 class="text-base font-bold text-amber-400 border-b border-slate-700 pb-2">⚙️ ปัจจัยพิกัดดวงกำเนิด</h2>
				
				<div class="relative">
					<label class="block text-xs font-bold text-slate-400 mb-1" for="loc-picker">สถานที่เกิด (กรอกเพียง 1 ตัวอักษรจะแสดงผลทันที)</label>
					<input 
						id="loc-picker"
						type="text" 
						bind:value={locationQuery} 
						oninput={handleLocationInput}
						placeholder="เช่น y, b, t, l..."
						class="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-amber-400"
					/>
					{#if showSuggestions}
						<ul class="absolute z-50 w-full bg-slate-950 border border-slate-700 rounded-lg mt-1 max-h-48 overflow-y-auto shadow-2xl divide-y divide-slate-800">
							{#each suggestions as loc}
								<li>
									<button type="button" onclick={() => selectLocation(loc)} class="w-full text-left px-3 py-2.5 text-xs text-slate-300 hover:bg-slate-800 hover:text-white transition">
										🌍 {loc.name} <span class="text-[10px] text-slate-500 font-mono">(Zone: +{loc.timezone})</span>
									</button>
								</li>
							{/each}
						</ul>
					{/if}
				</div>

				<div class="grid grid-cols-2 gap-3">
					<div>
						<label class="block text-xs font-bold text-slate-400 mb-1" for="date-select">วันที่เกิด</label>
						<input 
							id="date-select" 
							type="date" 
							bind:value={birthDate} 
							class="w-full bg-slate-950 border border-slate-700 rounded-lg p-2 text-xs text-white focus:outline-none focus:border-amber-400" 
						/>
					</div>
					<div>
						<label class="block text-xs font-bold text-slate-400 mb-1" for="time-select">เวลาเกิด</label>
						<input id="time-select" type="time" bind:value={birthTime} class="w-full bg-slate-950 border border-slate-700 rounded-lg p-2 text-xs text-white focus:outline-none focus:border-amber-400" />
					</div>
				</div>

				<div class="bg-slate-950 p-3 rounded-lg border border-slate-800 text-[11px] font-mono text-slate-400 space-y-1">
					<p class="text-slate-500">LIVE GEOGRAPHIC COORDINATES</p>
					<p>พิกัดจริง: <span class="text-emerald-400">{latitude.toFixed(4)}, {longitude.toFixed(4)}</span></p>
					<p>ฐานเวลาสุริยะ (True Solar Time): <span class="text-indigo-400">{finalResult.solarTime} น.</span></p>
					<p>ดัชนีวันจูเลียน (Julian Day): <span class="text-amber-400">{finalResult.julianDay}</span></p>
				</div>
			</section>

			<section class="lg:col-span-2 flex flex-col">
				<div class="flex flex-wrap gap-1 bg-slate-950 p-1 rounded-xl border border-slate-800 mb-4">
					{#each [ ['bazi', '☯️ Bazi'], ['western', '🌌 Western'], ['vedic', '🕉️ Vedic'], ['thai', '🇹🇭 ไทย'], ['hd', '🧬 Human Design'] ] as [id, name]}
						<button 
							type="button"
							onclick={() => activeTab = id} 
							class="flex-1 py-2 px-3 text-xs font-bold rounded-lg transition-all {activeTab === id ? 'bg-amber-500 text-slate-950' : 'text-slate-400 hover:text-slate-200'}"
						>
							{name}
						</button>
					{/each}
				</div>

				<div class="bg-slate-800 border border-slate-700 rounded-2xl p-6 flex-1 shadow-2xl">
					{#if activeTab === 'bazi'}
						<div class="space-y-4">
							<div class="flex justify-between items-center border-b border-slate-700 pb-2">
								<h3 class="text-lg font-bold text-amber-400">八字 ตารางดวงจีน 4 เสากำเนิดพิกัดจริง</h3>
								<span class="text-xs bg-amber-400/10 border border-amber-400/20 text-amber-300 px-2 py-0.5 rounded">ดิถีหลัก: {finalResult.bazi.dayMaster}</span>
							</div>
							<div class="grid grid-cols-2 md:grid-cols-4 gap-3">
								{#each [['เสาเวลา', finalResult.bazi.hour], ['เสาวัน', finalResult.bazi.day], ['เสาเดือน', finalResult.bazi.month], ['เสาปี', finalResult.bazi.year]] as [title, pillar]}
									<div class="bg-slate-950 p-4 rounded-xl border border-slate-800 text-center">
										<span class="block text-[11px] text-slate-500 font-bold mb-1">{title}</span>
										<span class="text-2xl font-black text-amber-400 block tracking-wide">{pillar.code}</span>
										<span class="text-[10px] text-slate-400 mt-1 block">{pillar.element} / {pillar.animal}</span>
									</div>
								{/each}
							</div>
						</div>
					{:else if activeTab === 'western'}
						<div class="space-y-4">
							<h3 class="text-lg font-bold text-indigo-400 border-b border-slate-700 pb-2">โหราศาสตร์สากล (Tropical Zodiac Systems)</h3>
							<div class="grid grid-cols-1 md:grid-cols-3 gap-3">
								<div class="bg-slate-950 p-3 rounded-xl border border-slate-800">
									<span class="text-xs text-slate-500 block mb-1">Sun Sign</span>
									<span class="text-base font-bold text-slate-200">ราศี {finalResult.western.sunSign}</span>
								</div>
								<div class="bg-slate-950 p-3 rounded-xl border border-slate-800">
									<span class="text-xs text-slate-500 block mb-1">Moon Sign</span>
									<span class="text-base font-bold text-slate-200">ราศี {finalResult.western.moonSign}</span>
								</div>
								<div class="bg-slate-950 p-3 rounded-xl border border-slate-800">
									<span class="text-xs text-slate-500 block mb-1">Ascendant</span>
									<span class="text-base font-bold text-slate-200">ราศี {finalResult.western.ascendant}</span>
								</div>
							</div>
						</div>
					{:else if activeTab === 'vedic'}
						<div class="space-y-4">
							<h3 class="text-lg font-bold text-rose-400 border-b border-slate-700 pb-2">โหราศาสตร์อินเดียพระเวท (Vedic Sidereal)</h3>
							<div class="grid grid-cols-2 gap-3 text-sm">
								<div class="bg-slate-950 p-3 rounded-lg border border-slate-800">Lagna (ลัคนาภพ): <span class="font-bold text-rose-300">ราศี{finalResult.vedic.lagna}</span></div>
								<div class="bg-slate-950 p-3 rounded-lg border border-slate-800">Janma Rashi (ราศีพระจันทร์): <span class="font-bold text-rose-300">ราศี{finalResult.vedic.rashi}</span></div>
								<div class="bg-slate-950 p-3 rounded-lg border border-slate-800 col-span-2">ดาวฤกษ์นักษัตรเสวย: <span class="font-bold text-rose-300">{finalResult.vedic.nakshatra}</span></div>
							</div>
						</div>
					{:else if activeTab === 'thai'}
						<div class="space-y-4">
							<h3 class="text-lg font-bold text-emerald-400 border-b border-slate-700 pb-2">โหราศาสตร์ไทยนิรายนะคัมภีร์</h3>
							<div class="bg-slate-950 rounded-xl overflow-hidden border border-slate-800 text-sm">
								<div class="p-3 border-b border-slate-800 flex justify-between">
									<span class="text-slate-400">การนับวันทางวารศาสตร์</span>
									<span class="font-bold text-emerald-300">{finalResult.thai.lannaDay}</span>
								</div>
								<div class="p-3 border-b border-slate-800 flex justify-between">
									<span class="text-slate-400">สมผุสทางจันทรคติ</span>
									<span class="font-bold text-emerald-300">{finalResult.thai.tithi}</span>
								</div>
								<div class="p-3 flex justify-between">
									<span class="text-slate-400">ปีนักษัตรตามเกณฑ์สารท</span>
									<span class="font-bold text-emerald-300">{finalResult.thai.naksatYear}</span>
								</div>
							</div>
						</div>
					{:else if activeTab === 'hd'}
						<div class="space-y-4">
							<h3 class="text-lg font-bold text-purple-400 border-b border-slate-700 pb-2">ระบบโครงสร้างผังแบบมนุษย์ (Human Design)</h3>
							<div class="space-y-3 text-sm">
								<p>Type พลังงาน: <span class="text-purple-300 font-bold">{finalResult.humanDesign.type}</span></p>
								<p>Profile ตัวตน: <span class="text-purple-300 font-bold">{finalResult.humanDesign.profile}</span></p>
								<p>ศูนย์รวมพลังงานที่นิยาม (Defined Centers):</p>
								<div class="flex flex-wrap gap-1.5">
									{#each finalResult.humanDesign.definedCenters as center}
										<span class="bg-purple-900/50 border border-purple-500/30 px-2 py-0.5 rounded text-xs text-purple-200">⬡ {center}</span>
									{/each}
								</div>
							</div>
						</div>
					{/if}
				</div>
			</section>
		</div>

	</div>
</main>
