"use client";

import { useState } from "react";
import { MessageCircle, Send } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Textarea } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import type { Comment } from "@/lib/public-api";

// Demo comments
const demoComments: Comment[] = [
  {
    id: "c1",
    userId: "u2",
    userDisplayName: "小满",
    userAvatarEmoji: "🌸",
    content: "我也有同款纠结！最后选了另一个牌子，可以推给你看看",
    createdAt: "1 小时前",
  },
  {
    id: "c2",
    userId: "u3",
    userDisplayName: "晚风",
    userAvatarEmoji: "🍃",
    content: "我觉得可以先去店里试试再决定，线上看和上手感觉不一样",
    createdAt: "30 分钟前",
  },
  {
    id: "c3",
    userId: "u4",
    userDisplayName: "栗子",
    userAvatarEmoji: "🌰",
    content: "同想买！蹲一个后续",
    parentId: "c1",
    createdAt: "20 分钟前",
  },
];

export function CommentSection({ postId }: { postId: string }) {
  void postId;
  const [comments, setComments] = useState<Comment[]>(demoComments);
  const [input, setInput] = useState("");
  const [replyTo, setReplyTo] = useState<string | undefined>();

  function submit() {
    if (!input.trim()) return;
    const newComment: Comment = {
      id: `c${Date.now()}`,
      userId: "me",
      userDisplayName: "我",
      userAvatarEmoji: "✨",
      content: input.trim(),
      parentId: replyTo,
      createdAt: "刚刚",
    };
    setComments([...comments, newComment]);
    setInput("");
    setReplyTo(undefined);
  }

  const topLevel = comments.filter(c => !c.parentId);
  const getReplies = (parentId: string) => comments.filter(c => c.parentId === parentId);

  return (
    <div>
      <div className="mb-3 flex items-center gap-2">
        <MessageCircle size={18} className="text-[var(--forest)]"/>
        <h3 className="font-bold">评论 ({comments.length})</h3>
      </div>

      {/* Comment list */}
      <div className="space-y-3">
        {topLevel.map(comment => (
          <div key={comment.id}>
            <CommentItem comment={comment} onReply={() => setReplyTo(comment.id)} />
            {/* Replies */}
            <div className="ml-11 space-y-2 border-l-2 border-[var(--line)] pl-3">
              {getReplies(comment.id).map(reply => (
                <CommentItem key={reply.id} comment={reply} onReply={() => setReplyTo(comment.id)} />
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Input */}
      <div className="mt-4">
        {replyTo && (
          <div className="mb-2 flex items-center justify-between rounded-lg bg-[var(--cream)] px-3 py-1.5 text-xs text-[var(--muted)]">
            <span>回复 {comments.find(c => c.id === replyTo)?.userDisplayName}</span>
            <button type="button" onClick={() => setReplyTo(undefined)} className="text-[var(--forest)]">取消</button>
          </div>
        )}
        <div className="flex gap-2">
          <Textarea
            value={input}
            onChange={e => setInput(e.target.value)}
            placeholder="说说你的想法……"
            className="flex-1"
            rows={2}
          />
          <Button
            className="shrink-0"
            disabled={!input.trim()}
            onClick={submit}
          >
            <Send size={16}/>
          </Button>
        </div>
      </div>
    </div>
  );
}

function CommentItem({ comment, onReply }: { comment: Comment; onReply: () => void }) {
  return (
    <Card className="flex gap-3 p-3">
      <span className="grid size-8 shrink-0 place-items-center rounded-full bg-[var(--sage-soft)] text-lg">
        {comment.userAvatarEmoji}
      </span>
      <div className="flex-1">
        <div className="flex items-center gap-2">
          <b className="text-sm">{comment.userDisplayName}</b>
          <span className="text-xs text-[var(--muted)]">{comment.createdAt}</span>
        </div>
        <p className="mt-1 text-sm leading-6 text-[var(--muted)]">{comment.content}</p>
        <button
          type="button"
          onClick={onReply}
          className="mt-1 text-xs text-[var(--forest)]"
        >
          回复
        </button>
      </div>
    </Card>
  );
}
