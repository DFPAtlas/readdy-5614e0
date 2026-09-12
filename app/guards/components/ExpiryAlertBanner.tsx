interface Props {
  expiredCount: number;
  expiringCount: number;
  onReview: () => void;
  onDismiss: () => void;
}

export default function ExpiryAlertBanner({ expiredCount, expiringCount, onReview, onDismiss }: Props) {
  const hasExpired = expiredCount > 0;
  const hasExpiring = expiringCount > 0;

  if (!hasExpired && !hasExpiring) return null;

  const tone = hasExpired
    ? {
        wrapper: 'bg-red-500/10 border border-red-500/20',
        icon: 'ri-close-circle-line text-red-400',
        text: 'text-red-300',
        button: 'text-red-400 hover:text-red-300',
      }
    : {
        wrapper: 'bg-amber-500/10 border border-amber-500/20',
        icon: 'ri-error-warning-line text-amber-400',
        text: 'text-amber-300',
        button: 'text-amber-400 hover:text-amber-300',
      };

  return (
    <div className={`${tone.wrapper} rounded-xl px-4 py-3 flex items-start gap-3`}>
      <div className="w-5 h-5 flex items-center justify-center flex-shrink-0 mt-0.5">
        <i className={tone.icon}></i>
      </div>
      <div className="flex-1">
        <p className={`text-sm ${tone.text}`}>
          {hasExpired ? (
            <>
              <span className="font-semibold">{expiredCount} guard{expiredCount !== 1 ? 's' : ''}</span> have{' '}
              <span className="font-semibold">expired</span> SIA licences
              {hasExpiring ? (
                <> and <span className="font-semibold">{expiringCount}</span> expiring within 30 days</>
              ) : null}
              .
            </>
          ) : (
            <>
              <span className="font-semibold">{expiringCount} guard{expiringCount !== 1 ? 's' : ''}</span> have SIA licences expiring in the next 30 days.
            </>
          )}
        </p>
      </div>
      <button onClick={onReview} className={`text-sm ${tone.button} font-medium cursor-pointer whitespace-nowrap shrink-0`}>
        Review now
      </button>
      <button onClick={onDismiss} className="w-6 h-6 flex items-center justify-center text-gray-500 hover:text-gray-300 rounded-lg transition-colors cursor-pointer shrink-0">
        <div className="w-4 h-4 flex items-center justify-center"><i className="ri-close-line"></i></div>
      </button>
    </div>
  );
}