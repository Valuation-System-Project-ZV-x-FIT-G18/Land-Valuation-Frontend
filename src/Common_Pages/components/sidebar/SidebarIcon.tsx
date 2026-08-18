type Props = { name: string }

const SidebarIcon = ({ name }: Props) => {
  const common = { viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: 1.8, strokeLinecap: 'round' as const, strokeLinejoin: 'round' as const, className: 'h-[18px] w-[18px]', 'aria-hidden': true }
  const icons: Record<string, JSX.Element> = {
    dashboard: <svg {...common}><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/></svg>,
    users: <svg {...common}><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75"/></svg>,
    userAdd: <svg {...common}><path d="M15 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="8" cy="7" r="4"/><path d="M19 8v6M22 11h-6"/></svg>,
    document: <svg {...common}><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><path d="M14 2v6h6M8 13h8M8 17h6"/></svg>,
    edit: <svg {...common}><path d="M12 20h9M16.5 3.5a2.1 2.1 0 0 1 3 3L8 18l-4 1 1-4z"/></svg>,
    check: <svg {...common}><circle cx="12" cy="12" r="9"/><path d="m8 12 2.5 2.5L16 9"/></svg>,
    close: <svg {...common}><circle cx="12" cy="12" r="9"/><path d="m9 9 6 6m0-6-6 6"/></svg>,
    map: <svg {...common}><polygon points="3 6 9 3 15 6 21 3 21 18 15 21 9 18 3 21 3 6"/><path d="M9 3v15M15 6v15"/></svg>,
    camera: <svg {...common}><path d="M4 7h3l2-3h6l2 3h3a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V9a2 2 0 0 1 2-2z"/><circle cx="12" cy="13" r="4"/></svg>,
    location: <svg {...common}><path d="M20 10c0 5-8 12-8 12S4 15 4 10a8 8 0 1 1 16 0z"/><circle cx="12" cy="10" r="2.5"/></svg>,
    mail: <svg {...common}><rect x="2" y="4" width="20" height="16" rx="2"/><path d="m2 6 10 7L22 6"/></svg>,
    payment: <svg {...common}><rect x="2" y="5" width="20" height="14" rx="2"/><path d="M2 10h20M6 15h4"/></svg>,
    vehicle: <svg {...common}><path d="M3 11h18v7H3zM5 11l2-5h10l2 5"/><circle cx="7" cy="18" r="2"/><circle cx="17" cy="18" r="2"/></svg>,
    calculator: <svg {...common}><rect x="4" y="2" width="16" height="20" rx="2"/><path d="M8 6h8M8 11h1M12 11h1M16 11h1M8 15h1M12 15h1M16 15h1M8 19h1M12 19h5"/></svg>,
    settings: <svg {...common}><circle cx="12" cy="12" r="3"/><path d="M19 12a7 7 0 0 0-.1-1l2-1.5-2-3.4-2.4 1A7 7 0 0 0 14.7 6L14.4 3h-4.8l-.3 3a7 7 0 0 0-1.8 1.1l-2.4-1-2 3.4L5.1 11a7 7 0 0 0 0 2l-2 1.5 2 3.4 2.4-1A7 7 0 0 0 9.3 18l.3 3h4.8l.3-3a7 7 0 0 0 1.8-1.1l2.4 1 2-3.4-2-1.5a7 7 0 0 0 .1-1z"/></svg>,
    logout: <svg {...common}><path d="M10 17l5-5-5-5M15 12H3M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4"/></svg>,
  }
  return icons[name] ?? icons.document
}

export default SidebarIcon
