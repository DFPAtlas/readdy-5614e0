interface Props {
  count: number;
  onReview: () => void;
  onDismiss: () => void;
}

export default function ExpiryAlertBanner({ count, onReview, onDismiss }: Props) {
  if (count === 0) return null;

  return (
    <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl px-4 py-3 flex items-start gap-3">
      <div className="w-5 h-5 flex items-center justify-center flex-shrink-0 mt-0.5">
        <i className="ri-error-warning-line text-amber-400"></i>
      </div>
      <div className="flex-1">
        <p className="text-sm text-amber-300">
          <span className="font-semibold">{count} guard{count !== 1 ? 's' : ''}</span> have SIA licences expiring in the next 30 days.
        </p>
      </div>
      <button onClick={onReview} className="text-sm text-amber-400 hover:text-amber-300 font-medium cursor-pointer whitespace-nowrap shrink-0">
        Review now
      </button>
      <button onClick={onDismiss} className="w-6 h-6 flex items-center justify-center text-gray-500 hover:text-gray-300 rounded-lg transition-colors cursor-pointer shrink-0">
        <div className="w-4 h-4 flex items-center justify-center"><i className="ri-close-line"></i></div>
      </button>
    </div>
  );
}