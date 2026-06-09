export default function GuardTableSkeleton({ rows = 5 }: { rows?: number }) {
  return (
    <tbody className="divide-y divide-gray-800">
      {Array.from({ length: rows }).map((_, i) => (
        <tr key={i}>
          <td className="px-5 py-3.5"><div className="h-4 bg-gray-800 rounded w-32 animate-pulse"></div></td>
          <td className="px-5 py-3.5"><div className="h-4 bg-gray-800 rounded w-40 animate-pulse"></div></td>
          <td className="px-5 py-3.5"><div className="h-4 bg-gray-800 rounded w-28 animate-pulse"></div></td>
          <td className="px-5 py-3.5"><div className="h-4 bg-gray-800 rounded w-24 animate-pulse"></div></td>
          <td className="px-5 py-3.5"><div className="h-4 bg-gray-800 rounded w-16 animate-pulse"></div></td>
          <td className="px-5 py-3.5"><div className="h-4 bg-gray-800 rounded w-20 animate-pulse"></div></td>
          <td className="px-5 py-3.5"><div className="h-4 bg-gray-800 rounded w-16 animate-pulse"></div></td>
          <td className="px-5 py-3.5"><div className="h-4 bg-gray-800 rounded w-16 animate-pulse ml-auto"></div></td>
        </tr>
      ))}
    </tbody>
  );
}