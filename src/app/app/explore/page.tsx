"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Bookmark, BookmarkCheck, ChevronRight, Eye, Loader2,
  MessageCircle, Timer
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { formatMoney } from "@/lib/utils";
import { reactionLabel, type ReactionType } from "@/lib/domain";
import { useBookmarks, useFollowUps, useReactions } from "@/lib/public-api";
import { CommentSection } from "@/components/comment-section";

type Post = {
  id: string;
  emoji: string;
  name: string;
  priceCents: number;
  user: string;
  userEmoji: string;
  mood: string;
  reason: string;
  tag: string;
  wait: string;
  worthIt: number;
  sameDesire: number;
  comments: number;
  tint: string;
  hasResult: boolean;
  resultType?: string;
  budgetHint?: string;
};

const channels = [
  { label: "正在纠结", key: "正在纠结" },
  { label: "今日上头", key: "今日上头" },
  { label: "成功拔草", key: "成功拔草" },
  { label: "买后真香", key: "买后真香" },
  { label: "买后后悔", key: "买后后悔" },
  { label: "姐妹求参谋", key: "姐妹求参谋" },
];

const postsByChannel: Record<string, Post[]> = {
  "正在纠结": [
    { id: "e1", emoji: "📷", name: "口袋照片打印机", priceCents: 69900, user: "晚风", userEmoji: "🍃", mood: "想记录生活", reason: "看大家做旅行手账好心动，但担心买回来吃灰……", tag: "正在纠结", wait: "纠结 7 天", worthIt: 26, sameDesire: 12, comments: 8, tint: "bg-[#f3e9df]", hasResult: false, budgetHint: "需要稍微考虑" },
    { id: "e2", emoji: "🎧", name: "头戴式降噪耳机", priceCents: 189900, user: "阿鹿", userEmoji: "🦌", mood: "最近有点压力", reason: "每天地铁通勤 1.5 小时，想有个安静的角落", tag: "正在纠结", wait: "纠结 3 天", worthIt: 18, sameDesire: 5, comments: 6, tint: "bg-[var(--sage-soft)]", hasResult: false, budgetHint: "这个月预算有点紧" },
    { id: "e3", emoji: "👗", name: "春天第一条碎花裙", priceCents: 34900, user: "小满", userEmoji: "🌸", mood: "被别人种草了", reason: "刷到穿搭博主上身，但不知道适不适合自己", tag: "正在纠结", wait: "纠结 2 天", worthIt: 32, sameDesire: 20, comments: 10, tint: "bg-[var(--lemon-soft)]", hasResult: false, budgetHint: "预算比较宽松" },
  ],
  "今日上头": [
    { id: "e4", emoji: "👜", name: "焦糖色通勤包", priceCents: 45900, user: "桃子汽水", userEmoji: "🍑", mood: "想奖励自己", reason: "升职后的第一个小礼物！容量和颜色都很喜欢。", tag: "今日上头", wait: "刚刚心动", worthIt: 41, sameDesire: 9, comments: 13, tint: "bg-[var(--lemon-soft)]", hasResult: false, budgetHint: "预算比较宽松" },
    { id: "e5", emoji: "🍫", name: "限量手工巧克力礼盒", priceCents: 19800, user: "栗子", userEmoji: "🌰", mood: "被别人种草了", reason: "朋友安利说这个牌子绝了，错过这次要等三个月", tag: "今日上头", wait: "心动 4 小时", worthIt: 15, sameDesire: 3, comments: 4, tint: "bg-[#f3e9df]", hasResult: false },
    { id: "e6", emoji: "🎮", name: "Switch 新游戏", priceCents: 29900, user: "晚风", userEmoji: "🍃", mood: "有点无聊想逛逛", reason: "新出的游戏好像很好玩，但上周刚买了一款还没打通", tag: "今日上头", wait: "心动 2 小时", worthIt: 22, sameDesire: 7, comments: 5, tint: "bg-[var(--blue-soft)]", hasResult: false },
  ],
  "成功拔草": [
    { id: "e7", emoji: "☕", name: "奶油白咖啡机", priceCents: 129900, user: "栗子", userEmoji: "🌰", mood: "成功拔草", reason: "冷静三天后发现我真正想要的是每天早点睡，不是咖啡机。", tag: "成功拔草", wait: "冷静了 72 小时", worthIt: 88, sameDesire: 5, comments: 20, tint: "bg-[var(--blue-soft)]", hasResult: true, resultType: "成功拔草" },
    { id: "e8", emoji: "📷", name: "拍立得相机", priceCents: 69900, user: "阿鹿", userEmoji: "🦌", mood: "成功拔草", reason: "发现手机修图更香，拍立得相纸也太贵了", tag: "成功拔草", wait: "冷静了一周", worthIt: 55, sameDesire: 3, comments: 11, tint: "bg-[var(--sage-soft)]", hasResult: true, resultType: "成功拔草" },
    { id: "e9", emoji: "🏋️", name: "家用跑步机", priceCents: 329900, user: "桃子汽水", userEmoji: "🍑", mood: "成功拔草", reason: "家里太小放不下，而且楼下就是公园", tag: "成功拔草", wait: "冷静了 5 天", worthIt: 62, sameDesire: 2, comments: 15, tint: "bg-[var(--lemon-soft)]", hasResult: true, resultType: "成功拔草" },
  ],
  "买后真香": [
    { id: "e10", emoji: "🎧", name: "降噪耳机", priceCents: 89900, user: "小满", userEmoji: "🌸", mood: "买了，真香", reason: "通勤幸福感直线上升！每天那个安静的 30 分钟就是属于自己的时间。", tag: "买后真香", wait: "买了 2 周", worthIt: 72, sameDesire: 18, comments: 24, tint: "bg-[var(--sage-soft)]", hasResult: true, resultType: "买了，真香" },
    { id: "e11", emoji: "🕯️", name: "香薰蜡烛套装", priceCents: 12900, user: "晚风", userEmoji: "🍃", mood: "买了，真香", reason: "睡前点一会儿，整个房间都变温柔了，睡眠质量真的变好了", tag: "买后真香", wait: "买了 1 个月", worthIt: 48, sameDesire: 10, comments: 8, tint: "bg-[#f3e9df]", hasResult: true, resultType: "买了，真香" },
    { id: "e12", emoji: "👟", name: "慢跑鞋", priceCents: 69900, user: "阿鹿", userEmoji: "🦌", mood: "买了，真香", reason: "跑起来脚感完全不一样，终于坚持跑了一个月了！", tag: "买后真香", wait: "买了 1 个月", worthIt: 60, sameDesire: 12, comments: 14, tint: "bg-[var(--blue-soft)]", hasResult: true, resultType: "买了，真香" },
  ],
  "买后后悔": [
    { id: "e13", emoji: "👗", name: "网红同款西装外套", priceCents: 45900, user: "桃子汽水", userEmoji: "🍑", mood: "买了，有点后悔", reason: "版型和卖家秀完全不一样，穿上像偷了爸爸的衣服", tag: "买后后悔", wait: "买了 3 天", worthIt: 8, sameDesire: 1, comments: 18, tint: "bg-[var(--orange-soft)]", hasResult: true, resultType: "买了，有点后悔" },
    { id: "e14", emoji: "🍳", name: "空气炸锅", priceCents: 29900, user: "栗子", userEmoji: "🌰", mood: "买了，有点后悔", reason: "用了一次之后就在吃灰，清洗太麻烦了", tag: "买后后悔", wait: "买了 2 周", worthIt: 12, sameDesire: 2, comments: 22, tint: "bg-[var(--orange-soft)]", hasResult: true, resultType: "买了，有点后悔" },
    { id: "e15", emoji: "📚", name: "年度读书计划套装", priceCents: 29900, user: "晚风", userEmoji: "🍃", mood: "买了，有点后悔", reason: "书确实好，但一年过去了只看了两本……", tag: "买后后悔", wait: "买了 3 个月", worthIt: 20, sameDesire: 4, comments: 16, tint: "bg-[var(--orange-soft)]", hasResult: true, resultType: "买了，有点后悔" },
  ],
  "姐妹求参谋": [
    { id: "e16", emoji: "🎒", name: "登山包", priceCents: 89900, user: "阿鹿", userEmoji: "🦌", mood: "确实有实际需要", reason: "下个月要和朋友去徒步，这两个牌子选不出来", tag: "姐妹求参谋", wait: "急求", worthIt: 8, sameDesire: 1, comments: 6, tint: "bg-[var(--blue-soft)]", hasResult: false },
    { id: "e17", emoji: "💻", name: "轻便办公本", priceCents: 599900, user: "晚风", userEmoji: "🍃", mood: "确实有实际需要", reason: "现在这台太重了，每天背着肩膀疼，预算有限求推荐", tag: "姐妹求参谋", wait: "急求", worthIt: 15, sameDesire: 2, comments: 9, tint: "bg-[var(--sage-soft)]", hasResult: false, budgetHint: "这个月预算有点紧" },
    { id: "e18", emoji: "🎨", name: "水彩颜料套装", priceCents: 26800, user: "小满", userEmoji: "🌸", mood: "开心想庆祝", reason: "想学水彩画，看了一堆测评眼花缭乱，求姐妹们推荐入门款", tag: "姐妹求参谋", wait: "急求", worthIt: 22, sameDesire: 8, comments: 11, tint: "bg-[var(--lemon-soft)]", hasResult: false },
  ],
};

const reactionButtons: { type: ReactionType; emoji: string }[] = [
  { type: "WORTH_IT", emoji: "👍" },
  { type: "WAIT", emoji: "🤝" },
  { type: "SAME_DESIRE", emoji: "🤩" },
  { type: "FOLLOW_UP", emoji: "👀" },
];

export default function ExplorePage() {
  const [active, setActive] = useState(0);
  const [loading, setLoading] = useState(false);
  const [expandedPost, setExpandedPost] = useState<string | undefined>();
  const { has: hasReaction, toggle: toggleReaction } = useReactions();
  const { isSaved, toggle: toggleBookmark } = useBookmarks();
  const { isFollowing, toggle: toggleFollow } = useFollowUps();

  const currentKey = channels[active].key;
  const posts = postsByChannel[currentKey] || [];

  function handleSwitch(index: number) {
    if (index === active) return;
    setLoading(true);
    setActive(index);
    setExpandedPost(undefined);
    setTimeout(() => setLoading(false), 400);
  }

  return (
    <>
      <header>
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-[var(--muted)]">想买广场</p>
            <h1 className="mt-1 text-3xl font-black">大家都在纠结什么</h1>
          </div>
          <span className="grid size-11 place-items-center rounded-2xl bg-[var(--lemon-soft)]">👀</span>
        </div>
        <p className="mt-3 text-sm leading-6 text-[var(--muted)]">先围观真实的心动和拔草，别急着被种草。</p>
      </header>

      {/* Channel tabs */}
      <div className="-mx-5 mt-5 flex gap-2 overflow-x-auto px-5 pb-2">
        {channels.map((channel, index) => (
          <button
            type="button"
            key={channel.key}
            onClick={() => handleSwitch(index)}
            className={`min-h-11 shrink-0 rounded-full px-4 text-sm font-semibold transition ${
              active === index ? "bg-[var(--forest)] text-white" : "bg-white text-[var(--muted)]"
            }`}
          >
            {channel.label}
          </button>
        ))}
      </div>

      {/* Loading state */}
      {loading && (
        <div className="mt-8 flex flex-col items-center gap-3 text-[var(--muted)]">
          <Loader2 size={28} className="animate-spin"/>
          <p className="text-sm">正在逛逛……</p>
        </div>
      )}

      {/* Post cards */}
      {!loading && (
        <div className="mt-4 space-y-4">
          {posts.length === 0 && (
            <div className="mt-12 flex flex-col items-center gap-3 text-[var(--muted)]">
              <span className="text-4xl">🍃</span>
              <p className="text-sm">这个频道暂时没有内容</p>
              <p className="text-xs">去其他频道看看吧</p>
            </div>
          )}

          {posts.map(post => {
            const isExpanded = expandedPost === post.id;
            const isLiked = hasReaction(post.id, "WORTH_IT");
            const isSameDesire = hasReaction(post.id, "SAME_DESIRE");
            const isFollowingPost = isFollowing(post.id);
            const isBookmarked = isSaved(post.id);

            return (
              <Card key={post.id} className="overflow-hidden p-0">
                <div className={`grid h-44 place-items-center ${post.tint} text-7xl`}>{post.emoji}</div>
                <div className="p-4">
                  {/* Header */}
                  <div className="flex items-center justify-between text-xs text-[var(--muted)]">
                    <span className="flex items-center gap-1.5">
                      <span className="grid size-6 place-items-center rounded-full bg-[var(--sage-soft)] text-xs">{post.userEmoji}</span>
                      {post.user}
                    </span>
                    <span className="rounded-full bg-[var(--orange-soft)] px-2.5 py-1 text-[var(--orange-deep)]">{post.tag}</span>
                  </div>

                  {/* Title + Price */}
                  <div className="mt-3 flex items-start justify-between gap-3">
                    <div>
                      <h2 className="text-lg font-bold">{post.name}</h2>
                      <div className="mt-1 flex flex-wrap gap-1.5">
                        <span className="mood-chip">{post.mood}</span>
                        {post.budgetHint && (
                          <span className="rounded-full bg-[var(--blue-soft)] px-3 py-1 text-xs text-[var(--forest-deep)]">{post.budgetHint}</span>
                        )}
                      </div>
                    </div>
                    <b className="text-lg">{formatMoney(post.priceCents)}</b>
                  </div>

                  {/* Reason */}
                  <p className="mt-3 text-sm leading-6 text-[var(--muted)]">{post.reason}</p>

                  {/* Meta */}
                  <div className="mt-3 flex items-center gap-2 text-xs text-[var(--muted)]">
                    <Timer size={13}/>{post.wait}
                    {post.hasResult && post.resultType && (
                      <span className="rounded-full bg-[var(--sage-soft)] px-2 py-0.5 text-[var(--forest)]">{post.resultType}</span>
                    )}
                  </div>

                  {/* Reaction bar */}
                  <div className="mt-4 flex items-center justify-between border-t border-[var(--line)] pt-3">
                    <div className="flex items-center gap-0">
                      {reactionButtons.map(({ type, emoji }) => (
                        <button
                          type="button"
                          key={type}
                          onClick={() => toggleReaction(post.id, type)}
                          className={`flex min-h-11 items-center gap-1 rounded-full px-2.5 text-sm transition ${
                            hasReaction(post.id, type)
                              ? "bg-[var(--orange-soft)] font-semibold text-[var(--orange-deep)]"
                              : "text-[var(--muted)]"
                          }`}
                          title={reactionLabel[type]}
                        >
                          <span className="text-base">{emoji}</span>
                          <span className="text-xs">{reactionLabel[type]}</span>
                          {type === "WORTH_IT" && <span className="text-xs">{isLiked ? post.worthIt + 1 : post.worthIt}</span>}
                          {type === "SAME_DESIRE" && <span className="text-xs">{isSameDesire ? post.sameDesire + 1 : post.sameDesire}</span>}
                        </button>
                      ))}
                    </div>
                    <div className="flex items-center gap-0">
                      <button
                        type="button"
                        onClick={() => toggleFollow(post.id)}
                        className={`flex min-h-11 items-center gap-1 rounded-full px-2.5 text-sm transition ${
                          isFollowingPost ? "text-[var(--forest)] font-semibold" : "text-[var(--muted)]"
                        }`}
                      >
                        <Eye size={17} fill={isFollowingPost ? "currentColor" : "none"}/>
                        <span className="text-xs">{isFollowingPost ? "已蹲" : "蹲后续"}</span>
                      </button>
                      <button
                        type="button"
                        aria-label={isBookmarked ? "已收藏" : `收藏${post.name}`}
                        onClick={() => toggleBookmark(post.id)}
                        className={`grid size-11 place-items-center transition ${isBookmarked ? "text-[var(--forest)]" : "text-[var(--muted)]"}`}
                      >
                        {isBookmarked ? <BookmarkCheck size={18}/> : <Bookmark size={18}/>}
                      </button>
                    </div>
                  </div>

                  {/* Comment preview / expand */}
                  <button
                    type="button"
                    onClick={() => setExpandedPost(isExpanded ? undefined : post.id)}
                    className="mt-2 flex min-h-11 w-full items-center gap-1 text-sm text-[var(--muted)]"
                  >
                    <MessageCircle size={16}/>
                    <span>{post.comments} 条评论</span>
                    <ChevronRight size={14} className={`transition ${isExpanded ? "rotate-90" : ""}`}/>
                  </button>

                  {/* Expanded comment section */}
                  {isExpanded && (
                    <div className="mt-3 border-t border-[var(--line)] pt-3">
                      <CommentSection postId={post.id}/>
                    </div>
                  )}
                </div>
              </Card>
            );
          })}
        </div>
      )}

      {/* Bottom CTA */}
      <Link
        href="/app/new"
        className="mt-6 flex min-h-14 items-center justify-between rounded-[24px] bg-[var(--forest)] px-5 text-white shadow-[0_10px_24px_rgba(79,117,89,.18)]"
      >
        <span className="flex items-center gap-2 font-semibold">✨ 也晒晒我想买的</span>
        <ChevronRight size={18}/>
      </Link>
    </>
  );
}
