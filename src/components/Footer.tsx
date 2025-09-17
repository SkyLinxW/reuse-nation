import { Instagram, Linkedin, Youtube } from "lucide-react";

const Footer = () => {
  const currentYear = new Date().getFullYear();

  const navigationLinks = [
    { name: "Início", href: "/" },
    { name: "Sobre Nós", href: "/about" },
    { name: "Contato", href: "/contact" },
    { name: "Políticas de Privacidade", href: "/privacy" },
    { name: "Termos de Uso", href: "/terms" }
  ];

  const socialLinks = [
    { name: "Instagram", icon: Instagram, href: "#" },
    { name: "LinkedIn", icon: Linkedin, href: "#" },
    { name: "YouTube", icon: Youtube, href: "#" }
  ];

  return (
    <footer className="bg-eco-dark text-eco-light border-t border-eco-green/20">
      <div className="container mx-auto px-4 py-8">
        {/* Main footer content */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-center">
          {/* Logo section */}
          <div className="flex justify-center md:justify-start">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-eco rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-lg">E</span>
              </div>
              <div>
                <h3 className="text-xl font-bold text-eco-green">EcoChain</h3>
                <p className="text-sm text-eco-light/70">Sustentabilidade em movimento</p>
              </div>
            </div>
          </div>

          {/* Navigation links */}
          <div className="flex flex-wrap justify-center gap-4 md:gap-6">
            {navigationLinks.map((link) => (
              <a
                key={link.name}
                href={link.href}
                className="text-sm text-eco-light/80 hover:text-eco-green transition-colors duration-200 font-medium"
              >
                {link.name}
              </a>
            ))}
          </div>

          {/* Social media icons */}
          <div className="flex justify-center md:justify-end gap-4">
            {socialLinks.map((social) => {
              const IconComponent = social.icon;
              return (
                <a
                  key={social.name}
                  href={social.href}
                  className="w-10 h-10 bg-eco-green/10 hover:bg-eco-green/20 rounded-lg flex items-center justify-center transition-all duration-200 hover:scale-105 group"
                  aria-label={social.name}
                >
                  <IconComponent className="w-5 h-5 text-eco-light/70 group-hover:text-eco-green transition-colors duration-200" />
                </a>
              );
            })}
          </div>
        </div>

        {/* Divider */}
        <div className="my-6 h-px bg-gradient-to-r from-transparent via-eco-green/30 to-transparent"></div>

        {/* Copyright */}
        <div className="text-center">
          <p className="text-sm text-eco-light/60">
            © {currentYear} EcoChain – Todos os direitos reservados.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;