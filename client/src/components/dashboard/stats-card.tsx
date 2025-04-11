import { ReactNode } from "react";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { Link } from "wouter";

interface StatsCardProps {
  icon: ReactNode;
  title: string;
  value: string | number;
  iconBgColor?: string;
  iconColor?: string;
  link?: {
    href: string;
    text: string;
    color?: string;
  };
}

export function StatsCard({
  icon,
  title,
  value,
  iconBgColor = "bg-primary-100",
  iconColor = "text-primary-600",
  link
}: StatsCardProps) {
  return (
    <Card className="overflow-hidden shadow">
      <CardContent className="p-5">
        <div className="flex items-center">
          <div className={cn("flex-shrink-0 rounded-md p-3", iconBgColor)}>
            <div className={cn("h-6 w-6", iconColor)}>
              {icon}
            </div>
          </div>
          <div className="ml-5 w-0 flex-1">
            <dl>
              <dt className="text-sm font-medium text-gray-500 truncate">{title}</dt>
              <dd>
                <div className="text-lg font-semibold text-gray-900">{value}</div>
              </dd>
            </dl>
          </div>
        </div>
      </CardContent>
      {link && (
        <CardFooter className="bg-gray-50 px-5 py-3">
          <div className="text-sm">
            <Link href={link.href}>
              <a className={cn("font-medium hover:underline", link.color || "text-primary-600 hover:text-primary-500")}>
                {link.text}
              </a>
            </Link>
          </div>
        </CardFooter>
      )}
    </Card>
  );
}
