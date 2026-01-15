export function getStatusBadge(status: string | undefined) {
    const colors = {
      draft: 'bg-gray-700',
      processing: 'bg-yellow-700',
      published: 'bg-blue-700',
      ready: 'bg-green-700',
      inactive: 'bg-red-700',
    } as const;
    return (colors as any)[status || 'failed'] || 'bg-gray-600';
  }