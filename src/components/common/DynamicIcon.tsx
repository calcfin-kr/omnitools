import React from "react";
import * as Icons from "lucide-react";

interface DynamicIconProps extends React.SVGProps<SVGSVGElement> {
  name: string;
  className?: string;
  size?: number;
}

export const DynamicIcon: React.FC<DynamicIconProps> = ({ name, className = "w-5 h-5", size = 20, ...props }) => {
  // Try exact match or fallback
  const IconComponent = (Icons as any)[name] || Icons.Wrench;
  return <IconComponent className={className} size={size} {...props} />;
};
