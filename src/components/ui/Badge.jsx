export default function Badge({ status, size = 'md' }) {
  const getStyles = () => {
    switch (status?.toLowerCase()) {
      case 'confirmed':
      case 'approved':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200 ring-emerald-500/20';
      case 'pending':
      case 'under review':
      case 'pending verification':
        return 'bg-amber-50 text-amber-700 border-amber-200 ring-amber-500/20';
      case 'declined':
      case 'rejected':
      case 'cancelled':
        return 'bg-rose-50 text-rose-700 border-rose-200 ring-rose-500/20';
      case 'completed':
        return 'bg-indigo-50 text-indigo-700 border-indigo-200 ring-indigo-500/20';
      case 'received':
        return 'bg-sky-50 text-sky-700 border-sky-200 ring-sky-500/20';
      default:
        return 'bg-slate-50 text-slate-700 border-slate-200 ring-slate-500/20';
    }
  };

  const sizeClasses = size === 'sm' ? 'px-2 py-0.5 text-xs' : 'px-2.5 py-1 text-xs font-semibold';

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border ring-1 ${getStyles()} ${sizeClasses}`}
    >
      <span className="w-1.5 h-1.5 rounded-full bg-current opacity-70 animate-pulse" />
      {status}
    </span>
  );
}
