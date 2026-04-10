export const SettingInput = ({
  label,
  children,
}: {
  label: string
  children: React.ReactNode
}) => (
  <div className="space-y-1 w-full">
    <label className="text-xs uppercase tracking-wide text-gray-400">
      {label}
    </label>
    {children}
  </div>
)