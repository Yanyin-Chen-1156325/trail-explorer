import { Link } from "react-router-dom";

const footerLinks = ["About", "Contact"];

function SiteFooter() {
  return (
    <footer className="border-t border-white/10 bg-[#061813] text-white">
      <div className="mx-auto flex max-w-7xl justify-center px-4 py-8 sm:px-6 lg:px-8">
        <nav className="flex flex-wrap justify-center gap-x-8 gap-y-3 text-sm text-white/75">
          {footerLinks.map((link) => (
            <Link className="transition hover:text-white" key={link} to="/">
              {link}
            </Link>
          ))}
        </nav>
      </div>
    </footer>
  );
}

export { SiteFooter };
