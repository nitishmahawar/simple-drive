"use client";

import Link from "next/link";
import { IconChevronRight, IconHome } from "@tabler/icons-react";

interface BreadcrumbItem {
  id: string;
  name: string;
}

interface BreadcrumbNavProps {
  path: BreadcrumbItem[];
}

export const BreadcrumbNav = ({ path }: BreadcrumbNavProps) => {
  return (
    <nav className="flex items-center gap-1 text-sm">
      <Link
        href="/drive"
        className="flex items-center gap-1 text-muted-foreground hover:text-foreground"
      >
        <IconHome className="h-4 w-4" />
        <span>My Drive</span>
      </Link>

      {path.map((item, index) => (
        <div key={item.id} className="flex items-center gap-1">
          <IconChevronRight className="h-4 w-4 text-muted-foreground" />
          {index === path.length - 1 ? (
            <span className="font-medium">{item.name}</span>
          ) : (
            <Link
              href={`/drive/${item.id}`}
              className="text-muted-foreground hover:text-foreground"
            >
              {item.name}
            </Link>
          )}
        </div>
      ))}
    </nav>
  );
};
