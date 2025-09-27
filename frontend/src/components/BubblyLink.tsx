import { Link } from 'react-router-dom'
import React from 'react'
interface bubblyLinkProps {
    to: string;
    children: React.ReactNode;
    className?: string;
    bgColor?: string;
    hoverColor?: string;
}
const BubblyLink: React.FC<bubblyLinkProps> = ({
    to,
    children,
    className,
    bgColor = "#3b82f6",
    hoverColor = "#2563eb",
}) => {
    return (
        <Link
            to={to}
            className={`bubbly-link ${className ?? ""}`}
            style={{ backgroundColor: bgColor }}
            onMouseEnter={(e) =>
                ((e.currentTarget as HTMLElement).style.backgroundColor = hoverColor)
            }
            onMouseLeave={(e) =>
                ((e.currentTarget as HTMLElement).style.backgroundColor = bgColor)
            }
        >
            {children}
        </Link>
    );
};
export default BubblyLink;
