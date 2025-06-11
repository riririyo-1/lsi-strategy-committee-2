"use client";

import { use } from "react";
import TopicsEditorClient from "@/features/admin/topics/components/TopicsEditorClient";

interface TopicsEditPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default function TopicsEditPage({ params }: TopicsEditPageProps) {
  const resolvedParams = use(params);
  const topicId = resolvedParams.id;

  return <TopicsEditorClient mode="edit" topicId={topicId} />;
}