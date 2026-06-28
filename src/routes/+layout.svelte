<script lang="ts">
	import './layout.css';
	import { page } from '$app/state';
	import { goto } from '$app/navigation';
	import { supabase } from '$lib/supabaseClient';
	import LeftSidebar from '$lib/components/LeftSidebar.svelte';
	import RightSidebar from '$lib/components/RightSidebar.svelte';
	import type { User } from '@supabase/supabase-js';

	let { children } = $props();

	let isLeftOpen = $state(true);
	let isRightOpen = $state(true);
	let user = $state<User | null>(null);
	let loading = $state(true);

	// ✅ ใช้ $effect แทน onMount (Svelte 5)
	$effect(() => {
		let isMounted = true;
		let unsubscribe: (() => void) | null = null;

		async function init() {
			const { data: { session } } = await supabase.auth.getSession();
			if (!isMounted) return;
			
			user = session?.user || null;
			loading = false;

			const currentPath = page.url.pathname;
			if (!user && currentPath !== '/login' && currentPath !== '/register' && currentPath !== '/test') {
				goto('/login');
			}

			if (user && (currentPath === '/login' || currentPath === '/register')) {
				goto('/');
			}

			// ✅ เก็บ subscription ไว้ในตัวแปร
			const { data: subscription } = supabase.auth.onAuthStateChange((event, session) => {
				if (!isMounted) return;
				
				user = session?.user || null;
				const path = page.url.pathname;
				const allowed = path === '/login' || path === '/register' || path === '/test';
				
				if (event === 'SIGNED_IN' && session?.user && allowed) {
					goto('/');
				}
				
				if (event === 'SIGNED_OUT' && !allowed) {
					goto('/login');
				}
			});

			unsubscribe = () => {
				subscription?.subscription.unsubscribe();
			};
		}

		init();

		return () => {
			isMounted = false;
			if (unsubscribe) {
				unsubscribe();
			}
		};
	});

	function formatEmail(email: string | undefined) {
		if (!email) return 'User';
		return email.split('@')[0];
	}
</script>

{#if loading}
	<div class="loading-screen">กำลังโหลด...</div>
{:else if user}
	<div class="app-container">
		<LeftSidebar isOpen={isLeftOpen} {user} />

		<main class="main-content">
			<header class="main-header">
				<div class="flex items-center gap-3">
					<h1 class="main-title">Grounded Intelligence</h1>
					<span class="user-badge">{formatEmail(user.email)}</span>
				</div>
				<div class="flex items-center gap-3">
					<span class="workspace-badge">Workspace Active</span>
					<button 
						onclick={async () => { await supabase.auth.signOut(); goto('/login'); }}
						class="logout-button"
					>
						🚪 ออกจากระบบ
					</button>
				</div>
			</header>

			<div class="content-area">
				{@render children()}
			</div>
		</main>

		<RightSidebar isOpen={isRightOpen} />
	</div>
{:else}
	<div class="login-container">
		{@render children()}
	</div>
{/if}

<style>
	.app-container {
		display: flex;
		height: 100vh;
		width: 100vw;
		background: #f1f5f9;
		padding: 16px;
		gap: 16px;
		overflow: hidden;
		box-sizing: border-box;
		font-family: system-ui, -apple-system, sans-serif;
	}

	.main-content {
		flex: 1;
		min-width: 0;
		background: white;
		border-radius: 16px;
		border: 1px solid #e2e8f0;
		box-shadow: 0 1px 3px rgba(0, 0, 0, 0.04);
		display: flex;
		flex-direction: column;
		overflow: hidden;
		height: 100%;
	}

	.main-header {
		height: 56px;
		padding: 0 20px;
		border-bottom: 1px solid #f1f5f9;
		display: flex;
		align-items: center;
		justify-content: space-between;
		flex-shrink: 0;
		background: white;
	}

	.main-title {
		font-size: 13px;
		font-weight: 700;
		color: #0f172a;
		letter-spacing: 0.05em;
		text-transform: uppercase;
	}

	.user-badge {
		font-size: 10px;
		background: #ecfdf5;
		color: #065f46;
		padding: 2px 10px;
		border-radius: 9999px;
		font-weight: 500;
	}

	.workspace-badge {
		font-size: 10px;
		background: #f1f5f9;
		color: #475569;
		padding: 2px 12px;
		border-radius: 9999px;
		font-weight: 700;
		text-transform: uppercase;
		letter-spacing: 0.05em;
	}

	.logout-button {
		font-size: 12px;
		color: #94a3b8;
		background: transparent;
		border: none;
		cursor: pointer;
		padding: 4px 8px;
		border-radius: 6px;
		transition: 0.15s;
	}

	.logout-button:hover {
		color: #ef4444;
		background: #fef2f2;
	}

	.content-area {
		flex: 1;
		overflow-y: auto;
		padding: 20px 24px;
		background: #fafbfc;
	}

	.content-area::-webkit-scrollbar {
		width: 4px;
	}
	.content-area::-webkit-scrollbar-track {
		background: transparent;
	}
	.content-area::-webkit-scrollbar-thumb {
		background: #d1d5db;
		border-radius: 9999px;
	}

	.loading-screen {
		display: flex;
		align-items: center;
		justify-content: center;
		height: 100vh;
		font-size: 14px;
		color: #94a3b8;
		background: #f8fafc;
	}

	.login-container {
		height: 100vh;
		width: 100vw;
		display: flex;
		align-items: center;
		justify-content: center;
		background: #f8fafc;
	}

	@media (max-width: 768px) {
		.app-container {
			padding: 8px;
			gap: 8px;
		}
		.main-header {
			height: 48px;
			padding: 0 12px;
			flex-wrap: wrap;
			gap: 4px;
		}
		.main-title {
			font-size: 11px;
		}
		.content-area {
			padding: 12px;
		}
		.user-badge,
		.workspace-badge {
			font-size: 8px;
			padding: 1px 8px;
		}
		.logout-button {
			font-size: 10px;
		}
	}

	@media (max-width: 480px) {
		.app-container {
			padding: 4px;
			gap: 4px;
		}
		.main-header {
			padding: 0 8px;
		}
		.main-title {
			font-size: 10px;
		}
		.content-area {
			padding: 8px;
		}
	}
</style>