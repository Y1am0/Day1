import React from 'react';
import * as FaIcons from 'react-icons/fa6';
import { IconRendererProps } from '@/types';
import { COLOR_HEX_MAP } from '@/app/constants';
import { IconType } from 'react-icons';

const IconRenderer: React.FC<IconRendererProps> = ({ iconName, color }) => {
  const IconComponent = FaIcons[iconName as keyof typeof FaIcons] as IconType;
  const iconColor = COLOR_HEX_MAP[color as keyof typeof COLOR_HEX_MAP];

  return IconComponent ? (
    <IconComponent 
      className="w-5 h-5 transition-colors duration-300" 
      style={{ color: iconColor }}
    />
  ) : null;
};

export default IconRenderer;
