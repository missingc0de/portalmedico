import React from 'react';

export interface Protocol {
  id: string;
  title: string;
  keywords: string[];
  component: React.FC;
}

export const availableProtocolsData: Protocol[] = [];

