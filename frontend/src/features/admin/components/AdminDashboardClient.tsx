"use client";

import Link from "next/link";
import { useI18n } from "@/features/i18n/hooks/useI18n";

const AdminDashboardClient = () => {
  const { t } = useI18n();
  return (
    <div className="flex flex-col items-center w-full">
      <h1 className="text-4xl md:text-5xl font-bold mb-10 text-center text-white text-shadow">
        {t("adminDashboard.title")}
      </h1>
      <div className="mb-8 flex justify-center w-full">
        <a
          href="/api-docs"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-block bg-gray-800 hover:bg-blue-600 text-white font-semibold py-2 px-4 rounded shadow transition"
        >
          {t("adminDashboard.swagger")}
        </a>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 w-full max-w-4xl">
        <Link
          href="/admin/research"
          className="block bg-green-800 hover:bg-green-700 text-white rounded-lg shadow p-8 transition h-full"
        >
          <div className="text-xl font-semibold mb-2 text-center">
            {t("adminDashboard.researchTitle")}
          </div>
          <div className="text-gray-300 text-sm text-center">
            {t("adminDashboard.researchDesc")}
          </div>
        </Link>
        <Link
          href="/admin/topics"
          className="block bg-blue-800 hover:bg-blue-700 text-white rounded-lg shadow p-8 transition h-full"
        >
          <div className="text-xl font-semibold mb-2 text-center">
            {t("adminDashboard.topicsTitle")}
          </div>
          <div className="text-gray-300 text-sm text-center">
            {t("adminDashboard.topicsDesc")}
          </div>
        </Link>
      </div>
    </div>
  );
};

export default AdminDashboardClient;
