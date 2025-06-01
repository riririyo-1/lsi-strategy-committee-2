"use client";

import Link from "next/link";
import { useI18n } from "@/features/i18n/hooks/useI18n";

const Footer = () => {
  const { t } = useI18n();
  return (
    <footer className="bg-footer text-foreground text-center p-6 relative z-5 border-t border-gray-200 dark:border-gray-800">
      <div className="container mx-auto">
        <p className="mb-2">{t("footer.copyright")}</p>
        <p className="text-sm">
          <Link href="/privacy-policy" legacyBehavior>
            <a className="hover:text-blue-300 transition-colors">
              {t("footer.privacyPolicy")}
            </a>
          </Link>{" "}
          |
          <Link href="/terms-of-service" legacyBehavior>
            <a className="hover:text-blue-300 transition-colors">
              {t("footer.termsOfService")}
            </a>
          </Link>{" "}
          |
          <Link href="/contact" legacyBehavior>
            <a className="hover:text-blue-300 transition-colors">
              {t("footer.contact")}
            </a>
          </Link>{" "}
          |
          <Link href="/articles" legacyBehavior>
            <a className="hover:text-blue-300 transition-colors">
              {t("footer.articles")}
            </a>
          </Link>{" "}
          |
          <Link href="/admin" legacyBehavior>
            <a className="nav-link hover:text-yellow-300 transition-colors">
              {t("footer.admin")}
            </a>
          </Link>
        </p>
      </div>
    </footer>
  );
};

export default Footer;
