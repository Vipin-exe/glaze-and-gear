"use client";
import { usePathname } from "next/navigation";

export default function Footer() {
  const pathname = usePathname();
  const isGearsPage = pathname === "/gears";

  // Dynamic Styling based on the page
  const footerBg = isGearsPage ? "bg-[#0a0a0a] border-t border-white/10" : "bg-[#98202E]";
  const textColor = isGearsPage ? "text-[#888]" : "text-white/70";
  const headingColor = isGearsPage ? "text-white" : "text-white";
  const hoverColor = isGearsPage ? "hover:text-white" : "hover:text-white";

  return (
    <footer className={`${footerBg} py-16 px-[5%] text-center transition-colors duration-500`}>
      <div className={`font-serif text-4xl font-black mb-8 ${headingColor} tracking-wide`}>
        Glaze & Gear
      </div>
      
      <div className="flex justify-center gap-8 md:gap-12 mb-12">
        <a 
          href="https://www.instagram.com/glaze.and.gear?utm_source=ig_web_button_share_sheet&igsh=ZDNlZDc0MzIxNw==" 
          target="_blank" 
          rel="noopener noreferrer"
          className={`flex items-center gap-2 text-xs md:text-sm font-bold uppercase tracking-[3px] ${textColor} ${hoverColor} transition-all hover:-translate-y-1`}
        >
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
            <path fillRule="evenodd" d="M12.315 2c2.43 0 2.784.013 3.808.06 1.064.049 1.791.218 2.427.465a4.902 4.902 0 011.772 1.153 4.902 4.902 0 011.153 1.772c.247.636.416 1.363.465 2.427.048 1.067.06 1.407.06 4.123v.08c0 2.643-.012 2.987-.06 4.043-.049 1.064-.218 1.791-.465 2.427a4.902 4.902 0 01-1.153 1.772 4.902 4.902 0 01-1.772 1.153c-.636.247-1.363.416-2.427.465-1.067.048-1.407.06-4.123.06h-.08c-2.643 0-2.987-.012-4.043-.06-1.064-.049-1.791-.218-2.427-.465a4.902 4.902 0 01-1.772-1.153 4.902 4.902 0 01-1.153-1.772c-.247-.636-.416-1.363-.465-2.427-.047-1.024-.06-1.379-.06-3.808v-.63c0-2.43.013-2.784.06-3.808.049-1.064.218-1.791.465-2.427a4.902 4.902 0 011.153-1.772A4.902 4.902 0 015.45 2.525c.636-.247 1.363-.416 2.427-.465C8.901 2.013 9.256 2 11.685 2h.63zm-.081 1.802h-.468c-2.456 0-2.784.011-3.807.058-.975.045-1.504.207-1.857.344-.467.182-.8.398-1.15.748-.35.35-.566.683-.748 1.15-.137.353-.3.882-.344 1.857-.047 1.023-.058 1.351-.058 3.807v.468c0 2.456.011 2.784.058 3.807.045.975.207 1.504.344 1.857.182.466.399.8.748 1.15.35.35.683.566 1.15.748.353.137.882.3 1.857.344 1.054.048 1.37.058 4.041.058h.08c2.597 0 2.917-.01 3.96-.058.976-.045 1.505-.207 1.858-.344.466-.182.8-.398 1.15-.748.35-.35.566-.683.748-1.15.137-.353.3-.882.344-1.857.048-1.055.058-1.37.058-4.041v-.08c0-2.597-.01-2.917-.058-3.96-.045-.976-.207-1.505-.344-1.858a3.097 3.097 0 00-.748-1.15 3.098 3.098 0 00-1.15-.748c-.353-.137-.882-.3-1.857-.344-1.023-.047-1.351-.058-3.807-.058zM12 6.865a5.135 5.135 0 110 10.27 5.135 5.135 0 010-10.27zm0 1.802a3.333 3.333 0 100 6.666 3.333 3.333 0 000-6.666zm5.338-3.205a1.2 1.2 0 110 2.4 1.2 1.2 0 010-2.4z" clipRule="evenodd" />
          </svg>
          Instagram
        </a>
        <a 
          // Add your WhatsApp number after the slash below (e.g., https://wa.me/919876543210)
          href="https://wa.me/" 
          target="_blank" 
          rel="noopener noreferrer"
          className={`flex items-center gap-2 text-xs md:text-sm font-bold uppercase tracking-[3px] ${textColor} ${hoverColor} transition-all hover:-translate-y-1`}
        >
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
            <path d="M11.996 2.001C6.485 2.001 2 6.486 2 12c0 2.19.704 4.218 1.9 5.867L2.4 22l4.244-1.114A9.972 9.972 0 0011.996 22c5.51 0 9.998-4.486 9.998-10s-4.488-10-9.998-10zM17.15 15.34c-.234.654-1.173 1.242-1.636 1.309-.433.064-.99.117-3.14-.775-2.585-1.074-4.24-3.714-4.368-3.885-.126-.17-1.042-1.385-1.042-2.64 0-1.253.653-1.874.887-2.127.233-.255.508-.318.678-.318.17 0 .34 0 .489.006.155.006.36-.06.564.437.213.518.742 1.815.807 1.942.064.127.106.275.021.445-.085.17-.127.275-.255.424-.127.148-.27.323-.387.44-.127.127-.26.265-.11.52.15.254.67 1.103 1.438 1.787.994.885 1.818 1.162 2.072 1.29.255.127.404.106.554-.064.15-.17.65-.765.86-.983.21-.218.423-.186.657-.098.234.09 1.487.701 1.741.83.255.127.425.191.488.297.065.106.065.617-.17 1.27z"/>
          </svg>
          WhatsApp
        </a>
      </div>
      
      <p className={`text-[10px] md:text-xs uppercase tracking-[3px] ${textColor}`}>
        &copy; 2026 Glaze & Gear. All rights reserved.
      </p>
    </footer>
  );
}