import React, { useEffect, useRef, useState } from 'react';
import { Flex, message, Button, Dropdown } from 'antd';
import { Bubble, Sender } from '@ant-design/x';
import {
  UserOutlined,
  RobotOutlined,
  CopyOutlined,
  DeleteOutlined,
  EllipsisOutlined,
} from '@ant-design/icons';
import { useChat } from '../../hooks/useChat';

const ChatItem: React.FC<{
  content: string;
  id: number;
  onCopy: (content: string) => void;
  onDelete: (id: number) => void;
}> = ({ content, id, onCopy, onDelete }) => {
  const [isHovered, setIsHovered] = useState(false);

  const menuItems = [
    {
      key: 'copy',
      label: '复制',
      icon: <CopyOutlined />,
    },
    {
      key: 'delete',
      label: '删除',
      icon: <DeleteOutlined />,
      danger: true,
    },
  ];

  const onMenuClick = (e: any) => {
    if (e.key === 'copy') {
      onCopy(content);
    } else if (e.key === 'delete') {
      onDelete(id);
    }
  };

  return (
    <div
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      style={{ display: 'inline-block' }}
    >
      <div
        style={{
          marginTop: 4,
          opacity: isHovered ? 1 : 0,
          visibility: isHovered ? 'visible' : 'hidden',
          transition: 'opacity 0.2s',
        }}
      >
        <Dropdown menu={{ items: menuItems, onClick: onMenuClick }} placement="bottomRight">
          <Button type="text" size="small" icon={<EllipsisOutlined />} />
        </Dropdown>
      </div>
    </div>
  );
};

/**
 * ChatPage: 全屏聊天页面
 * 复用了 useChat Hook，提供了沉浸式的对话体验
 */
const ChatPage: React.FC = () => {
  const { messages, isStreaming, sendMessage, abort, deleteMessage } = useChat();
  const [inputValue, setInputValue] = useState('');
  const scrollRef = useRef<HTMLDivElement>(null);

  // 1. 自动滚动到底部
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isStreaming]);

  // 2. 发送消息
  const handleSend = (value: string) => {
    sendMessage(value);
    setInputValue(''); // 清空输入框
  };

  // 复制功能
  const handleCopy = (content: string) => {
    navigator.clipboard.writeText(content).then(() => {
      message.success('已复制');
    });
  };

  const items = messages.map((msg) => ({
    key: msg.id || 'temp-id',
    role: msg.role,
    content: msg.content,
    loading: msg.role === 'assistant' && isStreaming && !msg.content,
    avatar: msg.role === 'user' ? <UserOutlined /> : <RobotOutlined />,
    footer:
      msg.role === 'user' ? (
        <ChatItem
          content={msg.content}
          id={msg.id as number}
          onCopy={handleCopy}
          onDelete={deleteMessage}
        />
      ) : null,
  }));

  return (
    <Flex vertical style={{ height: 'calc(100vh - 50px)' }}>
      {' '}
      {/* 减去导航栏高度 */}
      {/* 消息列表 */}
      <div
        ref={scrollRef}
        style={{
          flex: 1,
          overflowY: 'auto',
          padding: '20px 20px 0',
          scrollBehavior: 'smooth',
        }}
      >
        <Bubble.List
          items={items}
          role={{
            user: { placement: 'end', variant: 'shadow' },
            assistant: {
              placement: 'start',
              variant: 'filled',
            },
          }}
        />
      </div>
      {/* 输入框 (固定在底部) */}
      <div
        style={{
          padding: '20px',
          borderTop: '1px solid #f0f0f0',
          backgroundColor: '#fff',
        }}
      >
        <Sender
          value={inputValue}
          onChange={setInputValue}
          loading={isStreaming}
          onSubmit={handleSend}
          onCancel={abort}
          placeholder="聊聊项目问题吧"
        />
      </div>
    </Flex>
  );
};

export default ChatPage;
