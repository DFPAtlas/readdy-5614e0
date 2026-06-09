interface EmptyStateProps {
  icon: string;
  message: string;
}

export default function EmptyState({ icon, message }: EmptyStateProps) {
  return (
    <div className="text-center py-8 text-gray-500 text-sm">
      <div className="w-10 h-10 rounded-full bg-gray-800/50 flex items-center justify-center mx-auto mb-3">
        <div className="w-5 h-5 flex items-center justify-center">
          <i className={`${icon} text-gray-500`}></i>
        </div>
      </div>
      <p>{message}</p>
    </div>
  );
}