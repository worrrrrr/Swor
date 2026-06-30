<script lang="ts">
	import './layout.css';
	import { page } from '$app/state';
	import { goto } from '$app/navigation';
	import { supabase } from '$lib/supabaseClient';
	import LeftSidebar from '$lib/components/LeftSidebar.svelte';
	import RightSidebar from '$lib/components/RightSidebar.svelte';
	import Icon from '$lib/components/Icon.svelte';
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
			const publicPaths = ['/login', '/register', '/test', '/blog', '/library'];
			const isPublic = publicPaths.some(p => currentPath === p || currentPath.startsWith(p + '/'));
			if (!user && !isPublic) {
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
					<a href="/" class="header-logo">
						<Icon name="ai" size={18} class="text-indigo-500" />
					</a>
					<h1 class="main-title">Grounded Intelligence</h1>
					<span class="user-badge">{formatEmail(user.email)}</span>
				</div>
				<div class="flex items-center gap-3">
					<span class="workspace-badge">Workspace Active</span>
					<button 
						onclick={async () => { await supabase.auth.signOut(); goto('/login'); }}
						class="logout-button"
					>
						<Icon name="close" size={14} class="mr-1" />
						ออกจากระบบ
					</button>
				</div>
			</header>

			<div class="content-area">
				{@render children()}
			</div>
		</main>

		<RightSidebar isOpen={isRightOpen} />
	</div>
{:else if page.url.pathname.startsWith('/blog') || page.url.pathname.startsWith('/library')}
	<div class="app-container">
		<main class="main-content">
			<header class="main-header">
				<div class="flex items-center gap-3">
				<a href="/" class="header-logo">
					<Icon name="ai" size={18} class="text-indigo-500" />
				</a>
				<h1 class="main-title">Grounded Intelligence</h1>
				<span class="user-badge">Blog</span>
			</div>
			<div class="flex items-center gap-3">
				<a href="/login" class="login-link">
					<Icon name="user" size={14} class="mr-1" />
					เข้าสู่ระบบ
				</a>
			</div>
			</header>

			<div class="content-area">
				{@render children()}
			</div>
		</main>
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
		background: linear-gradient(135deg, #f0f4ff 0%, #faf5ff 50%, #fefce8 100%);
		padding: 16px;
		gap: 16px;
		overflow: hidden;
		box-sizing: border-box;
		font-family: system-ui, -apple-system, sans-serif;
	}

	.main-content {
		flex: 1;
		min-width: 0;
		background: rgba(255, 255, 255, 0.85);
		backdrop-filter: blur(12px);
		border-radius: 16px;
		border: 1px solid rgba(226, 232, 240, 0.6);
		box-shadow: 
			0 1px 3px rgba(0, 0, 0, 0.04),
			0 20px 60px rgba(99, 102, 241, 0.06),
			inset 0 1px 0 rgba(255, 255, 255, 0.8);
		display: flex;
		flex-direction: column;
		overflow: hidden;
		height: 100%;
		position: relative;
	}
	.main-content::before {
		content: '';
		position: absolute;
		top: 0;
		left: 0;
		right: 0;
		height: 1px;
		background: linear-gradient(90deg, transparent, #6366f1, #8b5cf6, #f59e0b, transparent);
		opacity: 0.3;
	}

	.main-header {
		height: 56px;
		padding: 0 20px;
		border-bottom: 1px solid rgba(226, 232, 240, 0.5);
		display: flex;
		align-items: center;
		justify-content: space-between;
		flex-shrink: 0;
		background: rgba(255, 255, 255, 0.7);
		backdrop-filter: blur(8px);
	}

	.main-title {
		font-size: 13px;
		font-weight: 700;
		background: linear-gradient(135deg, #6366f1, #8b5cf6);
		-webkit-background-clip: text;
		-webkit-text-fill-color: transparent;
		background-clip: text;
		letter-spacing: 0.05em;
		text-transform: uppercase;
	}

	.user-badge {
		font-size: 10px;
		background: rgba(236, 253, 245, 0.8);
		color: #065f46;
		padding: 2px 10px;
		border-radius: 9999px;
		font-weight: 500;
	}

	.workspace-badge {
		font-size: 10px;
		background: rgba(241, 245, 249, 0.8);
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

	.login-link {
		font-size: 12px;
		color: #3b82f6;
		text-decoration: none;
		padding: 4px 12px;
		border-radius: 6px;
		font-weight: 600;
		transition: 0.15s;
	}
	.login-link:hover {
		background: #eff6ff;
	}

	.header-logo {
		width: 32px;
		height: 32px;
		display: flex;
		align-items: center;
		justify-content: center;
		border-radius: 8px;
		background: rgba(99, 102, 241, 0.1);
		transition: 0.15s;
		text-decoration: none;
	}
	.header-logo:hover {
		background: rgba(99, 102, 241, 0.18);
	}

	.content-area {
		flex: 1;
		overflow-y: auto;
		padding: 20px 24px;
		background: 
			radial-gradient(ellipse at 0% 0%, rgba(99, 102, 241, 0.03) 0%, transparent 50%),
			radial-gradient(ellipse at 100% 100%, rgba(245, 158, 11, 0.03) 0%, transparent 50%),
			rgba(250, 251, 252, 0.6);
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