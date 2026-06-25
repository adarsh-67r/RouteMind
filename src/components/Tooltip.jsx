const Tooltip = ({ text, isCollapsed, children }) => {
  if (!isCollapsed) return children
  return (
    <div className="relative group/tooltip flex items-center">
      {children}
      <div className="absolute left-[60px] ml-2 px-2.5 py-1.5 bg-card-bg border border-border-app text-xs font-medium text-primary rounded-md shadow-xl opacity-0 translate-x-1 group-hover/tooltip:opacity-100 group-hover/tooltip:translate-x-0 pointer-events-none transition-all duration-150 z-50 whitespace-nowrap">
        {text}
      </div>
    </div>
  )
}

export default Tooltip
