import React from 'react';

interface MessageContentProps {
  content: string;
}

export const MessageContent: React.FC<MessageContentProps> = ({ content }) => {
  return <div className="whitespace-pre-wrap">{content}</div>;
}; 