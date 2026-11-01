import { NavLink } from 'react-router-dom'
import { navGroups } from '@/routes/navItems'

export default function Sidebar() {
  return (
    <aside className="sidebar">
      <div className="sidebar__brand">
        Banjara Ghar <span className="sidebar__brand-tag">Admin</span>
      </div>

      <nav className="sidebar__nav">
        {navGroups.map((group) => (
          <div key={group.label} className="sidebar__group">
            <p className="sidebar__group-label">{group.label}</p>
            {group.items.map(({ path, label, icon: Icon }) => (
              <NavLink
                key={path}
                to={path}
                className={({ isActive }) =>
                  `sidebar__link${isActive ? ' sidebar__link--active' : ''}`
                }
              >
                <Icon size={18} />
                {label}
              </NavLink>
            ))}
          </div>
        ))}
      </nav>
    </aside>
  )
}