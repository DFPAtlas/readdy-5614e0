export default function SOPTableSkeleton() {
  return (
    <tbody className="divide-y divide-gray-800">
      {Array.from({ length: 5 }).map((_, i) => (
        <tr key={i}>
          <td className="px-5 py-3.5">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-gray-800 animate-pulse"></div>
              <div className="space-y-1.5">
                <div className="h-4 w-40 bg-gray-800 rounded animate-pulse"></div>
                <div className="h-3 w-24 bg-gray-800/60 rounded animate-pulse"></div>
              </div>
            </div>
          </td>
          <td className="px-5 py-3.5"><div className="h-4 w-24 bg-gray-800 rounded animate-pulse"></div></td>
          <td className="px-5 py-3.5"><div className="h-5 w-10 bg-gray-800 rounded animate-pulse"></div></td>
          <td className="px-5 py-3.5"><div className="h-5 w-20 bg-gray-800 rounded animate-pulse"></div></td>
          <td className="px-5 py-3.5">
            <div className="space-y-1.5">
              <div className="h-4 w-20 bg-gray-800 rounded animate-pulse"></div>
              <div className="h-3 w-28 bg-gray-800/60 rounded animate-pulse"></div>
            </div>
          </td>
          <td className="px-5 py-3.5 text-right">
            <div className="flex items-center justify-end gap-1">
              <div className="w-8 h-8 rounded-lg bg-gray-800 animate-pulse"></div>
              <div className="w-8 h-8 rounded-lg bg-gray-800 animate-pulse"></div>
              <div className="w-8 h-8 rounded-lg bg-gray-800 animate-pulse"></div>
            </div>
          </td>
        </tr>
      ))}
    </tbody>
  );
}