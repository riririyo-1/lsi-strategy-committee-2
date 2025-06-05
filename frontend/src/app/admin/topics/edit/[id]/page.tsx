"use client";

import { useParams } from "next/navigation";
import TopicsEditorClient from "@/features/admin/topics/components/TopicsEditorClient";

export default function TopicsEditPage() {
  const params = useParams();
  const topicId = params.id as string;

  return <TopicsEditorClient mode="edit" topicId={topicId} />;
}