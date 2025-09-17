import { ArrowRight, Leaf, Users, Target, Award } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

interface AboutPageProps {
  onNavigate: (page: string) => void;
}

export const AboutPage = ({ onNavigate }: AboutPageProps) => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-eco-light/20 to-eco-cream/30 relative overflow-hidden">
      <div className="absolute inset-0 opacity-40">
        <div className="w-full h-full bg-eco-green/5 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-eco-green/10 via-transparent to-transparent"></div>
      </div>
      
      <div className="relative z-10">{/* All content will be wrapped here */}
        {/* Hero Section */}
        <section className="relative py-24 px-4 bg-gradient-to-br from-eco-green to-eco-blue text-white">
          <div className="container mx-auto max-w-4xl text-center">
            <h1 className="text-5xl md:text-7xl font-bold mb-8 leading-tight">
              Sobre a <span className="bg-gradient-to-r from-white to-eco-cream bg-clip-text text-transparent">EcoChain</span>
            </h1>
            <p className="text-xl md:text-2xl mb-10 opacity-90 leading-relaxed max-w-3xl mx-auto">
              Conectando empresas para um futuro mais sustentável através da gestão inteligente de resíduos
            </p>
            <Button 
              onClick={() => onNavigate('services')}
              size="lg"
              className="bg-white/20 backdrop-blur-sm border-white/20 text-white hover:bg-white/30 text-lg px-10 py-7 rounded-2xl font-semibold transition-all duration-300 hover:shadow-xl hover:scale-105"
            >
              Conheça Nossos Serviços
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </div>
        </section>

        {/* Mission, Vision, Values */}
        <section className="py-24 px-4">
          <div className="container mx-auto max-w-6xl">
            <div className="text-center mb-16">
              <h2 className="text-4xl md:text-5xl font-bold text-eco-dark mb-6">
                Nossos Pilares
              </h2>
              <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                Os valores que nos guiam em nossa missão de transformar o mercado de resíduos
              </p>
            </div>
            
            <div className="grid md:grid-cols-3 gap-8">
              <Card className="shadow-xl bg-white/95 backdrop-blur-sm border-0 hover:shadow-eco transition-all duration-300 hover:scale-105 group">
                <CardHeader className="text-center pb-4">
                  <div className="w-20 h-20 bg-eco-green/10 rounded-full flex items-center justify-center mx-auto mb-6 group-hover:bg-eco-green/20 transition-colors">
                    <Target className="h-10 w-10 text-eco-green" />
                  </div>
                  <CardTitle className="text-2xl font-bold text-eco-dark">Nossa Missão</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground text-center leading-relaxed">
                    Transformar a gestão de resíduos em oportunidades de negócio, 
                    conectando empresas B2B para criar uma economia circular 
                    eficiente e sustentável.
                  </p>
                </CardContent>
              </Card>

              <Card className="shadow-xl bg-white/95 backdrop-blur-sm border-0 hover:shadow-eco transition-all duration-300 hover:scale-105 group">
                <CardHeader className="text-center pb-4">
                  <div className="w-20 h-20 bg-eco-blue/10 rounded-full flex items-center justify-center mx-auto mb-6 group-hover:bg-eco-blue/20 transition-colors">
                    <Leaf className="h-10 w-10 text-eco-blue" />
                  </div>
                  <CardTitle className="text-2xl font-bold text-eco-dark">Nossa Visão</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground text-center leading-relaxed">
                    Ser a principal plataforma B2B de gestão de resíduos do Brasil, 
                    liderando a transformação digital do setor de reciclagem e 
                    sustentabilidade empresarial.
                  </p>
                </CardContent>
              </Card>

              <Card className="shadow-xl bg-white/95 backdrop-blur-sm border-0 hover:shadow-eco transition-all duration-300 hover:scale-105 group">
                <CardHeader className="text-center pb-4">
                  <div className="w-20 h-20 bg-eco-orange/10 rounded-full flex items-center justify-center mx-auto mb-6 group-hover:bg-eco-orange/20 transition-colors">
                    <Award className="h-10 w-10 text-eco-orange" />
                  </div>
                  <CardTitle className="text-2xl font-bold text-eco-dark">Nossos Valores</CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="text-muted-foreground space-y-3 leading-relaxed">
                    <li className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-eco-green rounded-full"></div>
                      Sustentabilidade em primeiro lugar
                    </li>
                    <li className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-eco-green rounded-full"></div>
                      Transparência nas transações
                    </li>
                    <li className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-eco-green rounded-full"></div>
                      Inovação tecnológica
                    </li>
                    <li className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-eco-green rounded-full"></div>
                      Parceria estratégica
                    </li>
                    <li className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-eco-green rounded-full"></div>
                      Responsabilidade ambiental
                    </li>
                  </ul>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* Who We Are */}
        <section className="py-24 px-4 bg-eco-cream/30">
          <div className="container mx-auto max-w-6xl">
            <div className="text-center mb-16">
              <h2 className="text-4xl md:text-5xl font-bold text-eco-dark mb-6">
                Quem Somos
              </h2>
              <p className="text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
                A EcoChain é uma plataforma B2B especializada em conectar empresas 
                geradoras de resíduos com empresas recicladoras e gestoras de materiais.
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-16 items-center">
              <div>
                <h3 className="text-3xl font-bold mb-6 text-eco-dark">
                  Foco em Soluções B2B
                </h3>
                <p className="text-muted-foreground mb-8 text-lg leading-relaxed">
                  Nossa plataforma foi desenvolvida especificamente para atender as 
                  necessidades do mercado empresarial, oferecendo ferramentas 
                  profissionais para gestão, monitoramento e comercialização de resíduos.
                </p>
                <ul className="space-y-4 text-muted-foreground">
                  <li className="flex items-start">
                    <div className="w-8 h-8 bg-eco-green/10 rounded-full flex items-center justify-center mr-4 mt-1">
                      <Users className="h-4 w-4 text-eco-green" />
                    </div>
                    <span className="text-lg">Conectamos empresas de diferentes setores</span>
                  </li>
                  <li className="flex items-start">
                    <div className="w-8 h-8 bg-eco-green/10 rounded-full flex items-center justify-center mr-4 mt-1">
                      <Leaf className="h-4 w-4 text-eco-green" />
                    </div>
                    <span className="text-lg">Promovemos a economia circular</span>
                  </li>
                  <li className="flex items-start">
                    <div className="w-8 h-8 bg-eco-green/10 rounded-full flex items-center justify-center mr-4 mt-1">
                      <Target className="h-4 w-4 text-eco-green" />
                    </div>
                    <span className="text-lg">Otimizamos processos de reciclagem</span>
                  </li>
                </ul>
              </div>

              <Card className="shadow-xl bg-gradient-to-br from-eco-green to-eco-blue text-white border-0">
                <CardContent className="p-10">
                  <h4 className="text-2xl font-bold mb-8 text-center">Nossa Experiência</h4>
                  <div className="grid grid-cols-2 gap-8 text-center">
                    <div className="space-y-2">
                      <div className="text-4xl font-bold">5+</div>
                      <div className="text-sm opacity-90">Anos no Mercado</div>
                    </div>
                    <div className="space-y-2">
                      <div className="text-4xl font-bold">200+</div>
                      <div className="text-sm opacity-90">Empresas Parceiras</div>
                    </div>
                    <div className="space-y-2">
                      <div className="text-4xl font-bold">50+</div>
                      <div className="text-sm opacity-90">Tipos de Materiais</div>
                    </div>
                    <div className="space-y-2">
                      <div className="text-4xl font-bold">24/7</div>
                      <div className="text-sm opacity-90">Suporte Técnico</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* Call to Action */}
        <section className="py-24 px-4">
          <div className="container mx-auto max-w-4xl text-center">
            <h2 className="text-4xl md:text-5xl font-bold mb-8 text-eco-dark">
              Pronto para Fazer Parte da Mudança?
            </h2>
            <p className="text-xl text-muted-foreground mb-12 max-w-3xl mx-auto leading-relaxed">
              Junte-se às empresas que já estão transformando seus resíduos em 
              oportunidades de negócio com a EcoChain.
            </p>
            <div className="flex flex-col sm:flex-row gap-6 justify-center">
              <Button 
                onClick={() => onNavigate('auth')}
                size="lg"
                className="bg-gradient-eco hover:opacity-90 shadow-eco text-lg px-10 py-7 rounded-2xl font-semibold transition-all duration-300 hover:shadow-xl hover:scale-105"
              >
                Cadastre sua Empresa
              </Button>
              <Button 
                onClick={() => onNavigate('home')}
                variant="outline" 
                size="lg"
                className="text-lg px-10 py-7 rounded-2xl border-2 border-eco-green text-eco-green hover:bg-eco-green-light font-semibold transition-all duration-300 hover:shadow-lg"
              >
                Explorar Plataforma
              </Button>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};