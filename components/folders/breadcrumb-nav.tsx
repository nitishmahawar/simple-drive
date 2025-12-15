"use client";

import { Fragment } from "react";
import Link from "next/link";
import { IconHome } from "@tabler/icons-react";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";

interface BreadcrumbPathItem {
  id: string;
  name: string;
}

interface BreadcrumbNavProps {
  path: BreadcrumbPathItem[];
}

export const BreadcrumbNav = ({ path }: BreadcrumbNavProps) => {
  return (
    <Breadcrumb>
      <BreadcrumbList>
        <BreadcrumbItem>
          <BreadcrumbLink
            render={<Link href="/drive" />}
            className="flex items-center gap-2"
          >
            <IconHome className="size-4" />
            My Drive
          </BreadcrumbLink>
        </BreadcrumbItem>

        {path.map((item, index) => (
          <Fragment key={item.id}>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              {index === path.length - 1 ? (
                <BreadcrumbPage>{item.name}</BreadcrumbPage>
              ) : (
                <BreadcrumbLink render={<Link href={`/drive/${item.id}`} />}>
                  {item.name}
                </BreadcrumbLink>
              )}
            </BreadcrumbItem>
          </Fragment>
        ))}
      </BreadcrumbList>
    </Breadcrumb>
  );
};
