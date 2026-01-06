const SkeletonText = ({ width = "w-40", height = "h-4", className = "" }) => {
  return (
    <div
      className={`bg-gray-300 rounded animate-pulse ${width} ${height} ${className}`}
    />
  );
};
export default SkeletonText