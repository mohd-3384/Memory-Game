import type { ReactNode } from 'react'
import type { IconType } from 'react-icons'

type SettingsSectionProps = {
    icon: IconType
    title: string
    children: ReactNode
}

/**
 * Wraps a settings group with a title and icon.
 */
export function SettingsSection({ icon: Icon, title, children }: SettingsSectionProps) {
    return (
        <section className="settings-section">
            <h2 className="settings-section__title">
                <Icon />
                <span>{title}</span>
            </h2>
            <div className="settings-section__content">{children}</div>
        </section>
    )
}
