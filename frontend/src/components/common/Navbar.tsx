"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useI18n } from "@/features/i18n/hooks/useI18n";
import LanguageSwitcher from "./LanguageSwitcher";
import ThemeSwitcher from "./ThemeSwitcher";

const Navbar = () => {
  const pathname = usePathname();
  const { t } = useI18n();

  const isActive = (path: string) => {
    if (path === "/" && pathname === "/") return true;
    if (path !== "/" && pathname.startsWith(path)) return true;
    return false;
  };

  return (
    <nav className="top-bar fixed top-0 left-0 w-full z-10 bg-white/70 dark:bg-[#23272f]/70 text-navbartext backdrop-blur-md p-3 sm:p-6 shadow-lg border-b border-gray-200 dark:border-gray-800">
      <div className="container mx-auto flex items-center justify-between">
        <Link href="/" legacyBehavior>
          <a className="nav-link nav-logo text-navbartext text-xl md:text-2xl font-bold hover:text-link dark:hover:text-linkhover transition-colors">
            <span className="hidden md:inline">{t("common.siteTitle")}</span>
          </a>
        </Link>
        <div className="hidden md:flex space-x-1 lg:space-x-2 items-center">
          <Link href="/" legacyBehavior>
            <a
              className={`nav-link text-navbartext hover:text-link dark:hover:text-linkhover transition-colors px-3 py-2 rounded-md text-sm font-medium ${
                isActive("/")
                  ? "active bg-blue-100 dark:bg-blue-800/40 text-link dark:text-linkhover"
                  : ""
              }`}
            >
              {t("nav.home")}
            </a>
          </Link>
          <Link href="/research" legacyBehavior>
            <a
              className={`nav-link text-navbartext hover:text-link dark:hover:text-linkhover transition-colors px-3 py-2 rounded-md text-sm font-medium ${
                isActive("/research")
                  ? "active bg-blue-100 dark:bg-blue-800/40 text-link dark:text-linkhover"
                  : ""
              }`}
            >
              {t("nav.research")}
            </a>
          </Link>
          <Link href="/topics" legacyBehavior>
            <a
              className={`nav-link text-navbartext hover:text-link dark:hover:text-linkhover transition-colors px-3 py-2 rounded-md text-sm font-medium ${
                isActive("/topics")
                  ? "active bg-blue-100 dark:bg-blue-800/40 text-link dark:text-linkhover"
                  : ""
              }`}
            >
              {t("nav.topics")}
            </a>
          </Link>
          <Link href="/analysis" legacyBehavior>
            <a
              className={`nav-link text-navbartext hover:text-link dark:hover:text-linkhover transition-colors px-3 py-2 rounded-md text-sm font-medium ${
                isActive("/analysis")
                  ? "active bg-blue-100 dark:bg-blue-800/40 text-link dark:text-linkhover"
                  : ""
              }`}
            >
              {t("nav.analysis")}
            </a>
          </Link>
          <Link href="/contact" legacyBehavior>
            <a
              className={`nav-link text-navbartext hover:text-link dark:hover:text-linkhover transition-colors px-3 py-2 rounded-md text-sm font-medium ${
                isActive("/contact")
                  ? "active bg-blue-100 dark:bg-blue-800/40 text-link dark:text-linkhover"
                  : ""
              }`}
            >
              {t("nav.contact")}
            </a>
          </Link>
          <LanguageSwitcher />
          <ThemeSwitcher />
        </div>
        <div className="md:hidden">
          <button
            id="mobile-menu-button"
            className="text-gray-300 hover:text-white focus:outline-none focus:text-white"
          >
            <svg className="h-6 w-6 fill-current" viewBox="0 0 24 24">
              <path
                fillRule="evenodd"
                d="M4 5h16a1 1 0 0 1 0 2H4a1 1 0 1 1 0-2zm0 6h16a1 1 0 0 1 0 2H4a1 1 0 0 1 0-2zm0 6h16a1 1 0 0 1 0 2H4a1 1 0 0 1 0-2z"
              />
            </svg>
          </button>
        </div>
      </div>
      {/* Mobile menu, toggle classes based on menu state */}
      <div
        id="mobile-menu"
        className="md:hidden hidden bg-gray-800 bg-opacity-90 py-2"
      >
        <Link href="/" legacyBehavior>
          <a
            className={`nav-link block text-gray-300 hover:text-white hover:bg-gray-700 px-4 py-2 rounded-md text-base font-medium ${
              isActive("/") ? "active bg-blue-800 bg-opacity-30 text-white" : ""
            }`}
          >
            {t("nav.home")}
          </a>
        </Link>
        <Link href="/research" legacyBehavior>
          <a
            className={`nav-link block text-gray-300 hover:text-white hover:bg-gray-700 px-4 py-2 rounded-md text-base font-medium ${
              isActive("/research")
                ? "active bg-blue-800 bg-opacity-30 text-white"
                : ""
            }`}
          >
            {t("nav.research")}
          </a>
        </Link>
        <Link href="/topics" legacyBehavior>
          <a
            className={`nav-link block text-gray-300 hover:text-white hover:bg-gray-700 px-4 py-2 rounded-md text-base font-medium ${
              isActive("/topics")
                ? "active bg-blue-800 bg-opacity-30 text-white"
                : ""
            }`}
          >
            {t("nav.topics")}
          </a>
        </Link>
        <Link href="/analysis" legacyBehavior>
          <a
            className={`nav-link block text-gray-300 hover:text-white hover:bg-gray-700 px-4 py-2 rounded-md text-base font-medium ${
              isActive("/analysis")
                ? "active bg-blue-800 bg-opacity-30 text-white"
                : ""
            }`}
          >
            {t("nav.analysis")}
          </a>
        </Link>
        <Link href="/contact" legacyBehavior>
          <a
            className={`nav-link block text-gray-300 hover:text-white hover:bg-gray-700 px-4 py-2 rounded-md text-base font-medium ${
              isActive("/contact")
                ? "active bg-blue-800 bg-opacity-30 text-white"
                : ""
            }`}
          >
            {t("nav.contact")}
          </a>
        </Link>
        <div className="flex items-center space-x-2 px-4 py-3">
          <ThemeSwitcher />
          <LanguageSwitcher />
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
