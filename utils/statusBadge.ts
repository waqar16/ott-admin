export function getStatusBadge(status: string | undefined) {
    const colors = {
      draft: 'bg-gradient-to-r from-gray-600 to-gray-800 text-white',
      processing: 'bg-gradient-to-r from-amber-300 via-amber-400 to-orange-500 text-neutral-900',
      published: 'bg-gradient-to-r from-sky-500 via-blue-500 to-indigo-600 text-white',
      ready: 'bg-gradient-to-r from-emerald-400 via-green-500 to-lime-500 text-neutral-900',
      inactive: 'bg-gradient-to-r from-rose-400 via-fuchsia-500 to-purple-600 text-white',
      public: 'bg-gradient-to-r from-sky-400 via-cyan-400 to-blue-500 text-neutral-900',
      beta: 'bg-gradient-to-r from-violet-500 via-fuchsia-500 to-pink-500 text-white',
    } as const;
    return (colors as any)[status || 'failed'] || 'bg-gradient-to-r from-neutral-500 to-zinc-700 text-white';
  }